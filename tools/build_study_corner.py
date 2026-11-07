"""Build the recreated study corner's prop bundles from the owner-approved source (Task 6).

Source: the zip the owner downloaded from the model's Sketchfab page (CC BY 4.0), kept out of git in
"3d designs/" (or --source-dir). content/<slug>/study-corner.json names the source (title, author,
licence, the zip's sha256 and the result of the bought-kit check) and the props it takes from it
("models": one node of the source GLB each).

Only the declared models are shipped: every node, material and image that the declared nodes do
not use is dropped, and the build fails if an excluded node or image (kit_check.excluded: the kit's
paintings, telephone, radiators) or any image other than those of the declared nodes' materials
would ship. A model may carry a sub-object in its mesh (the bookcase's books) only if the model
lists it in "includes" and the corner declares that sub-object on the object using the model.

Each model is turned about the vertical (yaw_deg) so its front faces +z, its footprint centred on
x = z = 0 with its base at y = 0, and scaled to the object's declared size: "uniform" scales by the
height and the footprint must then match the declared w and d within SIZE_TOLERANCE; "fit" scales
each axis to w, h, d.

Outputs (file names carry the first 8 hex of their sha256, as the scan bundles do):
  site/public/study/<slug>/phone/corner.<sha8>.glb     colour maps at most 512 px only (no normal or data maps)
  site/public/study/<slug>/desktop/corner.<sha8>.glb   colour maps at most 512 px only (no normal or data maps)
and "bundles" in study-corner.json: { file, bytes, sha256, tris, gpu_bytes, gpu_texture_bytes,
gpu_geometry_bytes, textures, images } per device. The corner counts in its room's download (scan + corner within build_scans.BUDGETS).

Tools: gltfpack 1.3.0 (site devDependency), basisu 2.50 (Basis Universal; the node build of gltfpack has no
Basis encoder, so textures are encoded first and gltfpack embeds them), Pillow, numpy.

Usage:
  python3 tools/build_study_corner.py [einstein] [--source-dir DIR]
  python3 tools/build_study_corner.py [einstein] --check     # validate the shipped bundles, no rebuild
"""
import argparse
import hashlib
import json
import math
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

import build_scans
from build_scans import read_glb, write_glb, BuildError

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_DIR = ROOT / "3d designs"
CONTENT = ROOT / "content"
PUBLIC = ROOT / "site" / "public"
GLTFPACK = build_scans.GLTFPACK
DEVICES = ("phone", "desktop")
# The corner's props have no download allowance of their own (Task 6 fix round 1): they load with
# the chapter room and count in its download, so scan (preview + bundle + occluder) + corner fits
# build_scans.BUDGETS on each device (build_scans.room_download_errors; room_scan below).
# Texture size per device and role: colour maps sharper than normal and data maps (whole-room GPU limit).
# Fix round 1: the corner counts in its room's download, so only colour maps ship (0 = not shipped):
# the scan beside it is photo-textured, and at museum viewing distance the props read by colour.
# Colour maps are 512 px on every device: with 1024 px on desktops the room would need a far lower
# scan texture quality to fit (measured: corner 575 kB at 1024 px, 219 kB at 512 px).
TEXTURE_PX = {"phone": {"color": 512, "normal": 0, "data": 0}, "desktop": {"color": 512, "normal": 0, "data": 0}}
DROPPED_ROUGHNESS = 0.7  # varnished wood, matte enough under the corner's soft key light
# GPU bytes per texel after transcoding ETC1S (as build_scans): phones ETC1/ETC2 (0.5), desktops BC7 (1).
GPU_BYTES_PER_TEXEL = build_scans.GPU_BYTES_PER_TEXEL
SIZE_TOLERANCE = 0.03  # m: a uniformly scaled model's footprint against the declared w and d
SHA8 = re.compile(r"^study/[a-z0-9-]+/(phone|desktop)/corner\.([0-9a-f]{8})\.glb$")
_COMP_BYTES = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}
_NCOMP = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


def corner_path(slug):
    return CONTENT / slug / "study-corner.json"


def room_scan(corner, content=CONTENT):
    """The scan manifest of the corner's chapter room (content/scans/<id>.json)."""
    slug = corner.get("slug") or "einstein"
    chp = Path(content) / slug / "chapters" / f"{corner.get('chapter')}.json"
    room = json.loads(chp.read_text()).get("room") if chp.exists() else None
    if not (isinstance(room, dict) and room.get("scan")):
        raise BuildError(f"study corner: chapter {corner.get('chapter')} is not a scanned room")
    m = build_scans.load_manifest(room["scan"])
    if not m:
        raise BuildError(f"study corner: no manifest for scan {room['scan']}")
    return m


def room_errors(corner, sizes):
    """Errors for the corner's room download: its scan's files plus the corner ({device: bytes})."""
    try:
        scan = room_scan(corner)
    except BuildError as e:
        return [str(e)]
    return build_scans.room_download_errors(scan["id"], scan.get("downloads") or {}, sizes)


def load_corner(slug):
    p = corner_path(slug)
    if not p.exists():
        raise BuildError(f"{p} missing")
    return json.loads(p.read_text())


def sha256_file(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def source_of(corner, sid):
    for s in corner.get("sources") or []:
        if s.get("id") == sid:
            return s
    raise BuildError(f"study corner: model source {sid} is not in sources")


def declared_models(corner):
    """model id -> (object using it, model spec). Every model must be used by exactly one object."""
    models = corner.get("models") or {}
    used = {}
    for o in corner.get("objects") or []:
        if "model" in o:
            if o["model"] not in models:
                raise BuildError(f"study corner object {o.get('id')}: model {o['model']} is not declared in models")
            if o["model"] in used:
                raise BuildError(f"study corner: model {o['model']} used by two objects")
            used[o["model"]] = o
    for mid in models:
        if mid not in used:
            raise BuildError(f"study corner: model {mid} is not used by any object")
    return {mid: (used[mid], models[mid]) for mid in models}


# --- source GLB -----------------------------------------------------------------------------------

def _accessor(gltf, binc, i):
    import numpy as np
    a = gltf["accessors"][i]
    v = gltf["bufferViews"][a["bufferView"]]
    dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32, 5121: np.uint8}[a["componentType"]]
    n = _NCOMP[a["type"]]
    if v.get("byteStride") not in (None, n * np.dtype(dt).itemsize):
        raise BuildError("interleaved source accessors are not supported")
    off = v.get("byteOffset", 0) + a.get("byteOffset", 0)
    return np.frombuffer(binc, dtype=dt, count=a["count"] * n, offset=off).reshape(-1, n)


def node_by_name(gltf, name):
    hits = [i for i, n in enumerate(gltf["nodes"]) if n.get("name") == name]
    if len(hits) != 1:
        raise BuildError(f"source node {name}: found {len(hits)} times in the source GLB")
    return hits[0]


def node_images(gltf, ni):
    """Names of the images the node's mesh materials use, and the material names."""
    mesh = gltf["meshes"][gltf["nodes"][ni]["mesh"]]
    mats, imgs = set(), set()
    for p in mesh["primitives"]:
        m = gltf["materials"][p["material"]]
        mats.add(m.get("name"))
        refs = [m.get("normalTexture"), m.get("occlusionTexture"), m.get("emissiveTexture"),
                (m.get("pbrMetallicRoughness") or {}).get("baseColorTexture"),
                (m.get("pbrMetallicRoughness") or {}).get("metallicRoughnessTexture")]
        for r in refs:
            if r:
                imgs.add(gltf["images"][gltf["textures"][r["index"]]["source"]].get("name"))
    return mats, imgs


def yaw_matrix(deg):
    """three.js rotation.y by deg degrees, as a 3x3 (column vectors)."""
    import numpy as np
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def model_matrix(positions, spec, obj):
    """4x4 (row-major numpy) placing a mesh as the object declares: turned, centred, based, scaled.
    -> (matrix, size [w, h, d] after the transform)."""
    import numpy as np
    r = yaw_matrix(spec.get("yaw_deg", 0))
    p = positions @ r.T
    lo, hi = p.min(0), p.max(0)
    ext = hi - lo
    want = np.array([obj["w"], obj["h"], obj["d"]], dtype=float)
    mode = spec.get("scale")
    if mode == "uniform":
        s = np.full(3, want[1] / ext[1])
        got = ext * s
        for k, axis in ((0, "w"), (2, "d")):
            if abs(got[k] - want[k]) > SIZE_TOLERANCE:
                raise BuildError(f"study corner model for {obj['id']}: scaled uniformly to h {want[1]:g} m its {axis} is "
                                 f"{got[k]:.3f} m, declared {want[k]:g} m (tolerance {SIZE_TOLERANCE} m)")
    elif mode == "fit":
        s = want / ext
    else:
        raise BuildError(f"study corner model for {obj['id']}: scale must be uniform or fit")
    centre = np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2])
    m = np.eye(4)
    m[:3, :3] = np.diag(s) @ r
    m[:3, 3] = -(np.diag(s) @ centre)
    return m, (ext * s).tolist()


def subset_gltf(src_glb, corner, work):
    """A glTF (work/subset.json + work/subset.bin) with one node per declared model (named by its
    model id), its mesh placed as declared, and each used image written out as a file.
    -> (gltf, {model id: {node, materials, images, size}}, {image index: (path, role)})."""
    import numpy as np
    gltf, binc = read_glb(src_glb)
    excluded = {}
    for s in corner.get("sources") or []:
        ex = ((s.get("kit_check") or {}).get("excluded") or {})
        excluded[s.get("id")] = (set(ex.get("nodes") or []), set(ex.get("images") or []))
    nodes, info = [], {}
    for mid, (obj, spec) in declared_models(corner).items():
        bad_nodes, bad_images = excluded.get(spec.get("source"), (set(), set()))
        if spec.get("node") in bad_nodes:
            raise BuildError(f"study corner model {mid}: source node {spec['node']} is excluded by the kit check")
        ni = node_by_name(gltf, spec["node"])
        mats, imgs = node_images(gltf, ni)
        hit = sorted(i for i in imgs if i in bad_images)
        if hit:
            raise BuildError(f"study corner model {mid}: uses excluded image(s) {', '.join(hit)}")
        mesh = gltf["meshes"][gltf["nodes"][ni]["mesh"]]
        pos = np.concatenate([_accessor(gltf, binc, p["attributes"]["POSITION"]) for p in mesh["primitives"]]).astype(float)
        m, size = model_matrix(pos, spec, obj)
        nodes.append({"name": mid, "mesh": gltf["nodes"][ni]["mesh"], "matrix": m.T.reshape(-1).tolist()})
        info[mid] = {"node": spec["node"], "materials": sorted(mats), "images": sorted(imgs), "size": [round(v, 3) for v in size]}
    gltf["nodes"] = nodes
    gltf["scenes"] = [{"name": "study-corner", "nodes": list(range(len(nodes)))}]
    gltf["scene"] = 0
    prune(gltf)
    # Images the declared meshes use, with their role (colour: sRGB; normal and data maps: linear).
    used_mats = set(range(len(gltf["materials"])))
    roles = {}
    for mi in used_mats:
        m = gltf["materials"][mi]
        pbr = m.get("pbrMetallicRoughness") or {}
        for ref, role in ((pbr.get("baseColorTexture"), "color"), (m.get("emissiveTexture"), "color"),
                          (m.get("normalTexture"), "normal"), (pbr.get("metallicRoughnessTexture"), "data"),
                          (m.get("occlusionTexture"), "data")):
            if ref:
                ii = gltf["textures"][ref["index"]]["source"]
                if roles.get(ii, role) != role:
                    raise BuildError(f"image {gltf['images'][ii].get('name')} is used both as {roles[ii]} and {role}")
                roles[ii] = role
    files = {}
    for ii, role in roles.items():
        im = gltf["images"][ii]
        v = gltf["bufferViews"][im["bufferView"]]
        ext = ".png" if im.get("mimeType") == "image/png" else ".jpg"
        f = work / f"img{ii}{ext}"
        f.write_bytes(binc[v.get("byteOffset", 0): v.get("byteOffset", 0) + v["byteLength"]])
        files[ii] = (f, role)
    (work / "subset.bin").write_bytes(binc)
    gltf["buffers"] = [{"uri": "subset.bin", "byteLength": len(binc)}]
    return gltf, info, files


def prune(gltf):
    """Keep only the meshes, materials, textures and images the scene's nodes use (indices remapped):
    nothing of the kit outside the declared models reaches the encoder or the bundle."""
    keep_mesh = sorted({n["mesh"] for n in gltf["nodes"]})
    mesh_map = {old: i for i, old in enumerate(keep_mesh)}
    gltf["meshes"] = [gltf["meshes"][i] for i in keep_mesh]
    for n in gltf["nodes"]:
        n["mesh"] = mesh_map[n["mesh"]]
    keep_mat = sorted({p["material"] for m in gltf["meshes"] for p in m["primitives"] if "material" in p})
    mat_map = {old: i for i, old in enumerate(keep_mat)}
    gltf["materials"] = [gltf["materials"][i] for i in keep_mat]
    for m in gltf["meshes"]:
        for p in m["primitives"]:
            if "material" in p:
                p["material"] = mat_map[p["material"]]
    refs = []
    for m in gltf["materials"]:
        pbr = m.get("pbrMetallicRoughness") or {}
        refs += [r for r in (m.get("normalTexture"), m.get("occlusionTexture"), m.get("emissiveTexture"),
                             pbr.get("baseColorTexture"), pbr.get("metallicRoughnessTexture")) if r]
    keep_tex = sorted({r["index"] for r in refs})
    tex_map = {old: i for i, old in enumerate(keep_tex)}
    for r in refs:
        r["index"] = tex_map[r["index"]]
    gltf["textures"] = [gltf["textures"][i] for i in keep_tex]
    keep_img = sorted({t["source"] for t in gltf["textures"]})
    img_map = {old: i for i, old in enumerate(keep_img)}
    for t in gltf["textures"]:
        t["source"] = img_map[t["source"]]
    gltf["images"] = [gltf["images"][i] for i in keep_img]
    used_ext = set()
    for m in gltf["materials"]:
        used_ext |= set((m.get("extensions") or {}).keys())
        for r in refs:
            used_ext |= set((r.get("extensions") or {}).keys())
    gltf["extensionsUsed"] = sorted(used_ext)
    gltf.pop("extensionsRequired", None)


def device_gltf(gltf, files, device, work):
    """The subset with its used images resized to the device's TEXTURE_PX (power of two) and encoded
    KTX2 ETC1S with mipmaps (sRGB for colour, linear otherwise); unused images dropped by gltfpack."""
    from PIL import Image
    g = json.loads(json.dumps(gltf))
    ddir = work / device
    ddir.mkdir(exist_ok=True)
    # A role sized 0 is not shipped on this device: the material drops that map (a dropped
    # metallic-roughness map leaves a plain non-metal surface) and the image is pruned.
    dropped = {ii for ii, (_, role) in files.items() if not TEXTURE_PX[device][role]}
    for m in g["materials"]:
        pbr = m.setdefault("pbrMetallicRoughness", {})
        for owner, key in ((m, "normalTexture"), (m, "occlusionTexture"), (m, "emissiveTexture"),
                           (pbr, "baseColorTexture"), (pbr, "metallicRoughnessTexture")):
            ref = owner.get(key)
            if ref and g["textures"][ref["index"]]["source"] in dropped:
                del owner[key]
                if key == "metallicRoughnessTexture":
                    pbr["metallicFactor"], pbr["roughnessFactor"] = 0.0, DROPPED_ROUGHNESS
    for ii, (f, role) in files.items():
        if ii in dropped:
            continue
        im = Image.open(f)
        im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") and "A" in im.getbands() else "RGB")
        px = min(TEXTURE_PX[device][role], 1 << int(math.floor(math.log2(max(im.size)))))
        if im.size != (px, px):
            im = im.resize((px, px), Image.LANCZOS)
        png = ddir / f"img{ii}.png"
        im.save(png)
        k = ddir / f"img{ii}.ktx2"
        run(["basisu", "-ktx2", "-mipmap", "-srgb" if role == "color" else "-linear", "-q", build_scans.ETC1S_QUALITY,
             "-comp_level", build_scans.ETC1S_COMP_LEVEL, "-file", png, "-output_file", k])
        img = g["images"][ii]
        img.pop("bufferView", None)
        img["uri"] = f"{device}/img{ii}.ktx2"
        img["mimeType"] = "image/ktx2"
    if len(files) != len(g["images"]):
        raise BuildError("study corner: an image of the declared models has no texture role")
    prune(g)
    p = work / f"{device}.gltf"
    p.write_text(json.dumps(g))
    return p


def declare_basisu(glb):
    """gltfpack embeds the KTX2 files as images; declare KHR_texture_basisu on their textures."""
    gltf, binc = read_glb(glb)
    for i, im in enumerate(gltf.get("images", [])):
        if im.get("mimeType") != "image/ktx2" or "bufferView" not in im:
            raise BuildError(f"image {i} in {glb.name} was not embedded as KTX2")
    for t in gltf.get("textures", []):
        src = t.pop("source", None)
        if src is not None:
            t.setdefault("extensions", {})["KHR_texture_basisu"] = {"source": src}
    if gltf.get("textures"):
        gltf["extensionsUsed"] = sorted(set(gltf.get("extensionsUsed", [])) | {"KHR_texture_basisu"})
        gltf["extensionsRequired"] = sorted(set(gltf.get("extensionsRequired", [])) | {"KHR_texture_basisu"})
    return gltf, binc


# --- measuring a built bundle ----------------------------------------------------------------------

def ktx2_levels(data):
    """(width, height, level count) from a KTX2 header."""
    if data[:12] != b"\xabKTX 20\xbb\r\n\x1a\n":
        raise BuildError("embedded image is not KTX2")
    w, h = struct.unpack_from("<II", data, 20)
    levels = struct.unpack_from("<I", data, 40)[0]
    return w, h, max(1, levels)


def measure(glb_path, device):
    gltf, binc = read_glb(glb_path)
    tex = 0
    for im in gltf.get("images", []):
        if im.get("mimeType") != "image/ktx2" or "bufferView" not in im:
            raise BuildError(f"{glb_path.name}: image {im.get('name')} is not an embedded KTX2 image")
        v = gltf["bufferViews"][im["bufferView"]]
        w, h, levels = ktx2_levels(binc[v.get("byteOffset", 0): v.get("byteOffset", 0) + v["byteLength"]])
        texels = sum(max(1, w >> l) * max(1, h >> l) for l in range(levels))
        tex += int(texels * GPU_BYTES_PER_TEXEL[device])
    geo, tris, seen = 0, 0, set()
    for n in gltf.get("nodes", []):
        if "mesh" not in n:
            continue
        for p in gltf["meshes"][n["mesh"]]["primitives"]:
            for a in [*p["attributes"].values(), *([p["indices"]] if "indices" in p else [])]:
                if a in seen:
                    continue
                seen.add(a)
                acc = gltf["accessors"][a]
                geo += acc["count"] * _NCOMP[acc["type"]] * _COMP_BYTES[acc["componentType"]]
            if "indices" in p:
                tris += gltf["accessors"][p["indices"]]["count"] // 3
    return {"tris": tris, "gpu_texture_bytes": tex, "gpu_geometry_bytes": geo, "gpu_bytes": tex + geo,
            "textures": len(gltf.get("images", [])), "nodes": sorted(gltf["nodes"][i].get("name") or "" for i in gltf["scenes"][gltf.get("scene", 0)]["nodes"]),
            "materials": sorted(m.get("name") or "" for m in gltf.get("materials", []))}


# --- build -------------------------------------------------------------------------------------------

def run(cmd):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode != 0:
        raise BuildError(f"command failed ({r.returncode}): {' '.join(map(str, cmd))}\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}")
    return r.stdout + r.stderr


def build(slug="einstein", source_dir=DEFAULT_SOURCE_DIR, public=PUBLIC, room_check=True):
    corner = load_corner(slug)
    srcs = {spec["source"] for _, spec in declared_models(corner).values()}
    if len(srcs) != 1:
        raise BuildError(f"study corner: models come from {len(srcs)} sources; this build takes one")
    src = source_of(corner, srcs.pop())
    kc = src.get("kit_check") or {}
    if kc.get("result") != "pass":
        raise BuildError(f"study corner source {src['id']}: kit check result is {kc.get('result')!r}, not pass; use another source")
    zip_path = Path(source_dir) / src["source_file"]
    if not zip_path.exists():
        raise BuildError(f"{zip_path} missing: download it from {src['url']} (owner download, CC BY 4.0)")
    got = sha256_file(zip_path)
    if got != src["source_sha256"]:
        raise BuildError(f"{zip_path}: sha256 {got} differs from the pinned {src['source_sha256']} ({src['url']})")
    if not GLTFPACK.exists():
        raise BuildError(f"{GLTFPACK} missing: run npm install in site/")
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        with zipfile.ZipFile(zip_path) as z:
            (work / "src.glb").write_bytes(z.read(src["source_member"]))
        gltf_sub, info, files = subset_gltf(work / "src.glb", corner, work)
        allowed_images = set().union(*(set(v["images"]) for v in info.values()))
        allowed_mats = set().union(*(set(v["materials"]) for v in info.values()))
        bundles, staged = {}, {}
        for device in DEVICES:
            out = work / f"{device}.glb"
            run([GLTFPACK, "-i", device_gltf(gltf_sub, files, device, work), "-o", out, "-cc", "-kn"])
            gltf, binc = declare_basisu(out)
            names = {im.get("name") for im in gltf.get("images", [])}
            extra = sorted(n for n in names if n not in allowed_images)
            if extra:
                raise BuildError(f"study corner {device}: bundle carries images outside the declared models: {extra}")
            gltf["asset"]["copyright"] = f"{src['credit']} {src['changes']}"
            write_glb(out, gltf, binc)
            meas = measure(out, device)
            if set(meas["nodes"]) != set(info):
                raise BuildError(f"study corner {device}: bundle nodes {meas['nodes']} differ from the declared models {sorted(info)}")
            if not set(meas["materials"]) <= allowed_mats:
                raise BuildError(f"study corner {device}: bundle materials {meas['materials']} outside the declared models")
            data = out.read_bytes()
            sha = hashlib.sha256(data).hexdigest()
            rel = f"study/{slug}/{device}/corner.{sha[:8]}.glb"
            staged[device] = (data, rel)
            bundles[device] = {"file": rel, "bytes": len(data), "sha256": sha, "tris": meas["tris"],
                               "gpu_bytes": meas["gpu_bytes"], "gpu_texture_bytes": meas["gpu_texture_bytes"],
                               "gpu_geometry_bytes": meas["gpu_geometry_bytes"], "textures": meas["textures"],
                               "texture_px": TEXTURE_PX[device], "images": sorted(names),
                               "texture_format": f"KTX2 ETC1S (basisu -q {build_scans.ETC1S_QUALITY}, mipmaps, sRGB colour maps only)"}
        # Replace the shipped set only when every device built within budget: the corner counts in
        # its room's download (scan + corner within build_scans.BUDGETS).
        over = room_errors(corner, {d: bundles[d]["bytes"] for d in bundles}) if room_check else []
        if over:
            raise BuildError("study corner: " + "; ".join(over))
        out_dir = Path(public) / "study" / slug
        if out_dir.exists():
            shutil.rmtree(out_dir)
        for device, (data, rel) in staged.items():
            p = Path(public) / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(data)
    corner["bundles"] = bundles
    corner["model_sizes"] = {k: v["size"] for k, v in info.items()}
    bu = re.search(r"v(\d+\.\d+\.\d+)", run(["basisu", "-version"]))
    corner["tooling"] = {"gltfpack": run([GLTFPACK, "-v"]).splitlines()[0].replace("gltfpack ", "").strip(), "basisu": bu.group(1) if bu else "unknown"}
    corner_path(slug).write_text(json.dumps(corner, indent=2, ensure_ascii=False) + "\n")
    return corner


# --- check (no rebuild) --------------------------------------------------------------------------------

def check_bundles(corner, public=PUBLIC, content=CONTENT):
    """Errors for the shipped bundles named in the corner record; [] when they match and fit."""
    errs = []
    b = corner.get("bundles")
    if not isinstance(b, dict):
        return ["no bundles: run python3 tools/build_study_corner.py"]
    models = set((corner.get("models") or {}).keys())
    for device in DEVICES:
        rec = b.get(device)
        if not isinstance(rec, dict):
            errs.append(f"{device}: no bundle"); continue
        m = SHA8.match(str(rec.get("file")))
        if not m or m.group(1) != device:
            errs.append(f"{device}: file {rec.get('file')} must be study/<slug>/{device}/corner.<sha8>.glb"); continue
        p = Path(public) / rec["file"]
        if not p.exists():
            errs.append(f"{device}: {rec['file']} is not shipped"); continue
        data = p.read_bytes()
        sha = hashlib.sha256(data).hexdigest()
        if sha != rec.get("sha256") or sha[:8] != m.group(2):
            errs.append(f"{device}: {rec['file']} sha256 {sha} does not match the record")
        if len(data) != rec.get("bytes"):
            errs.append(f"{device}: {rec['file']} is {len(data)} bytes, the record says {rec.get('bytes')}")
        try:
            meas = measure(p, device)
        except BuildError as e:
            errs.append(f"{device}: {e}"); continue
        if set(meas["nodes"]) != models:
            errs.append(f"{device}: bundle nodes {meas['nodes']} differ from the declared models {sorted(models)}")
        for k in ("gpu_bytes", "tris", "textures"):
            if meas[k] != rec.get(k):
                errs.append(f"{device}: measured {k} {meas[k]} differs from the record {rec.get(k)}")
        gltf, _ = read_glb(p)
        names = {im.get("name") for im in gltf.get("images", [])}
        for s in corner.get("sources") or []:
            bad = set((((s.get("kit_check") or {}).get("excluded") or {}).get("images")) or [])
            if names & bad:
                errs.append(f"{device}: ships excluded image(s) {sorted(names & bad)}")
    errs += room_errors(corner, {d: (b.get(d) or {}).get("bytes") or 0 for d in DEVICES})
    # Everything beneath public/study is cached a year as immutable: every file (any type) must be in a
    # study-corner record with its actual hash (one rule for scans/ and study/: build_scans.shipped_asset_errors).
    errs += build_scans.shipped_asset_errors(Path(public), content, roots=("study",))
    return errs


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("slug", nargs="?", default="einstein")
    ap.add_argument("--source-dir", default=str(DEFAULT_SOURCE_DIR))
    ap.add_argument("--check", action="store_true")
    # Building a corner and its room together (each counts the other in the room download): build the
    # corner with --before-room, then python3 tools/build_scans.py <room>, whose build and check count
    # the corner; then --check here. The room check is never skipped by --check or content_check.
    ap.add_argument("--before-room", action="store_true")
    a = ap.parse_args(argv)
    try:
        if a.check:
            errs = check_bundles(load_corner(a.slug))
            for e in errs:
                print("ERROR", e)
            print("OK" if not errs else f"FAIL: {len(errs)} error(s)")
            return 1 if errs else 0
        c = build(a.slug, a.source_dir, room_check=not a.before_room)
        if a.before_room:
            print("room download not checked yet: build the room next (python3 tools/build_scans.py <room>), then --check")
        for d in DEVICES:
            print(d, json.dumps({k: c["bundles"][d][k] for k in ("file", "bytes", "tris", "gpu_bytes", "textures")}))
        print("sizes", json.dumps(c["model_sizes"]))
        return 0
    except BuildError as e:
        print(f"ERROR {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
