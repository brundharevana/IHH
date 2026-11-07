"""Build per-device scanned-room bundles from the owner-downloaded Sketchfab originals.

Sources: the zips the owner downloaded from each official Sketchfab page (CC BY 4.0), kept out of
git in "3d designs/" (or any directory passed with --source-dir). The original-format files inside
each zip are used: RealityCapture OBJ + 8192/16384 px atlas for the SHM rooms, glTF + 20 x 8192 px
textures for Margam.

Outputs, per scan id (each file name carries the first 8 hex of its sha256, so a rebuilt file gets a
new URL and the files can be cached for a long time; the manifest records the names):
  site/public/scans/<id>/phone/room.<sha8>.glb     half-resolution textures, simplified mesh, <= 5 MB
  site/public/scans/<id>/desktop/room.<sha8>.glb   full bundle resolution, <= 10 MB
  site/public/scans/<id>/preview/room.<sha8>.glb   sharp preview shown first on every device (~30k tris, 512 px, <= 400 kB)
  site/public/scans/<id>/occluder.<sha8>.glb       untextured low-poly mesh (<= 20k tris) for occlusion tests
  A device's room download (preview + its bundle + occluder) stays within BUDGETS.
  content/scans/<id>.json                   manifest: credit, licence, source sha256, measured sizes

Pipeline (each step documented in the manifest):
  1. the source zip must match the sha256 pinned in the manifest (first ingest: --pin-source);
  2. world positions are read from an uncompressed gltfpack pass; the room is turned Y-up, scaled
     to metres, its floor levelled and put at y=0, turned about the vertical so its walls face along
     x and z (wall_yaw_deg), and its footprint centred on x=z=0 (one root-node matrix, no vertex is
     moved); crop boxes drawn in an earlier frame follow the room (migrate_crops);
  3. base-colour textures get one colour/exposure correction per room (partial grey-world white
     balance, then a gamma that brings the median luminance to TARGET_MEDIAN), are resized with
     Lanczos and encoded to KTX2 ETC1S with mipmaps by basisu;
     Artwork crops (manifest "crops": axis-aligned boxes in room metres, see tools/content_check.py):
     every triangle whose centre lies in a box has its texture region filled with one flat colour
     (the region's mean) before encoding, so the artwork is not recoverable at any mip level; the
     build fails if a box selects no triangle; the crop list hash and per-box counts are recorded;
  4. gltfpack welds, simplifies (seam- and border-preserving: no -sp, with -slb), quantizes and
     meshopt-compresses the mesh; the GLB is then patched to declare KHR_texture_basisu and
     KHR_materials_unlit (the scan texture already holds the room's light);
  5. every bundle is checked against its budget in a staging folder; only a complete, in-budget
     set replaces site/public/scans/<id>/.
A room whose manifest says "usable": false (an artwork that can be neither cleared nor cropped)
is never built and nothing of it may be shipped; its manifest keeps the provenance and the reason.

Tools: gltfpack 1.3.0 (MIT, site devDependency), basisu 2.50 (Basis Universal, Apache-2.0,
`brew install basis_universal`), Pillow + numpy + scipy, xatlas (MIT, `pip install xatlas`; the
preview's UV atlas).

Usage:
  python3 tools/build_scans.py <id> [--source-dir DIR] [--work DIR] [--pin-source]
  python3 tools/build_scans.py <id> --check     # validate manifest + shipped bundles, no rebuild
  python3 tools/build_scans.py all [...]
"""
import argparse
import datetime
import hashlib
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_DIR = ROOT / "3d designs"
MANIFESTS = ROOT / "content" / "scans"
OUT = ROOT / "site" / "public" / "scans"
GLTFPACK = ROOT / "site" / "node_modules" / ".bin" / "gltfpack"
GLTFPACK_VERSION = "1.3.0"

BUDGETS = {"phone": 5_000_000, "desktop": 10_000_000}  # bytes per room download: preview + bundle + occluder
# (+ any recreated corner's props that load with the room: room_extras)
# Sharp preview (Task 3 fix round 1): one small bundle per room, shown first on every device while the
# full bundle streams in. Heavily simplified mesh (UV seams and borders kept, as for the bundles) with a
# small texture, all crops masked. It counts in every device's room download.
PREVIEW = {"texture_px": 512, "target_tris": 40_000, "max_error": 0.05}
PREVIEW_MAX_BYTES = 400_000
OCCLUDER_MAX_TRIS = 20_000
SKETCHFAB_TRI_CAP_MIN = 999_990  # Sketchfab stores uploads decimated to ~1M faces: a source this size is capped
API_READ_DATE = "2026-10-13"
OCCLUDER_TARGET_TRIS = 18_000
# GPU bytes per texel after transcoding ETC1S: phones get ETC1/ETC2 (4 bpp); desktops get BC7 when
# available (8 bpp, the larger case, counted here). Mip chain adds one third.
GPU_BYTES_PER_TEXEL = {"phone": 0.5, "desktop": 1.0, "preview": 0.5}
DEVICES = ("phone", "desktop")

# Colour/exposure normalisation, same for every room (per-room parameters are measured, then
# recorded in the manifest).
WB_STRENGTH = 0.2       # 0 = leave white balance, 1 = full grey-world
TARGET_MEDIAN = 0.42    # median sRGB luminance after correction
GAMMA_RANGE = (0.75, 1.15)
ETC1S_QUALITY = 255     # basisu -q (1-255, higher = better)
ETC1S_COMP_LEVEL = 2

LICENCE = "CC BY 4.0"
LICENCE_URL = "https://creativecommons.org/licenses/by/4.0/"
CHANGES = ("Changes: reoriented and recentred; mesh simplified for the web and recompressed (meshopt); "
           "textures resized, colour- and exposure-corrected and recompressed (KTX2); rendered unlit.")

CROP_DILATE_PX = 2  # masked texels grow by this much so filtering and mips never reach the artwork


def changes_for(crops):
    """The CC BY "Changes:" note; crops are listed as a change of their own."""
    if not crops:
        return CHANGES
    n = len(crops)
    return CHANGES[:-1] + (f"; {n} region{'s' if n != 1 else ''} masked with a flat colour (artworks not cleared "
                           f"for copyright, or modern signage).")


def crops_sha256(crops):
    """Hash of a room's crop list as the build applied it (key order and spacing do not matter)."""
    return hashlib.sha256(json.dumps(crops or [], sort_keys=True, separators=(",", ":")).encode()).hexdigest()


# Phone ratio 0.45 (was 0.5): leaves room for the preview inside the 5 MB phone room download.
SHM_ROOM = {"desktop": {"texture_px": 4096, "ratio": 1.0}, "phone": {"texture_px": 2048, "ratio": 0.45}}

SCANS = {
    "kings-hall": {
        "zip": "the-king-s-hall.zip",
        "uid": "d18155613363445b9b68c0c67196d98d",
        "sketchfab_url": "https://sketchfab.com/3d-models/the-king-s-hall-d18155613363445b9b68c0c67196d98d",
        "title": "The King´s Hall",
        "place": "The King's Hall, Skokloster Castle, Sweden",
        "publisher": "Skokloster Castle (Skoklosters slott), Swedish National Historical Museums",
        "author": "Skokloster Castle (Skoklosters slott)",
        "author_url": "https://sketchfab.com/SkoklosterCastle",
        "extra_credit": "Scan by Erik Lernestål.",
        "up": "y", "scale": 1.0,
        "scale_note": "source units are metres: the central table top measures 0.76 m above the levelled floor",
        "devices": SHM_ROOM,
        "artworks": [
            {"label": "Royal portraits hung on all four walls, including two equestrian portraits (17th-18th century; artists not yet identified)"},
            {"label": "Painted ceiling panels set in the stucco ceiling (artists not yet identified)"},
            {"label": "Overmantel painting with figures above the fireplace (artist not yet identified)"},
        ],
    },
    "margam-entrance-hall": {
        "zip": "margam_castle_-_entrance_hall.zip",
        "uid": "07507e2498d94a58819e2e461b170866",
        "sketchfab_url": "https://sketchfab.com/3d-models/margam-castle-entrance-hall-07507e2498d94a58819e2e461b170866",
        "title": "Margam Castle - Entrance Hall",
        "place": "The Entrance Hall, Margam Castle, Port Talbot, Wales",
        "publisher": "Greenhatch-Group (surveyed by Greenhatch Group Ltd for Swansea University)",
        "author": "Greenhatch-Group",
        "author_url": "https://sketchfab.com/Greenhatch-Group",
        # verbatim from license.txt inside the owner's zip (checked at build time)
        "credit_verbatim": ('This work is based on "Margam Castle - Entrance Hall" '
                            "(https://sketchfab.com/3d-models/margam-castle-entrance-hall-07507e2498d94a58819e2e461b170866) "
                            "by Greenhatch-Group (https://sketchfab.com/Greenhatch-Group) licensed under CC-BY-4.0 "
                            "(http://creativecommons.org/licenses/by/4.0/)"),
        "up": "y", "scale": 1.0,
        "scale_note": "survey (terrestrial laser scanning) units are metres",
        "devices": {"desktop": {"texture_px": 1024, "ratio": 0.6}, "phone": {"texture_px": 512, "ratio": 0.3}},
        "artworks": [{"label": "Three framed purple-toned prints of a landscape and a house on the walls (subjects and makers not yet identified)"},
                     {"label": "Heraldic stained-glass windows (makers not yet identified)"}],
    },
    "hallwyl-dining-room": {
        "zip": "the-dining-room.zip",
        "uid": "da3e970d523a46e4974b2357b6a9538e",
        "sketchfab_url": "https://sketchfab.com/3d-models/the-dining-room-da3e970d523a46e4974b2357b6a9538e",
        "title": "The Dining Room",
        "place": "The Dining Room, the Hallwyl Museum, Stockholm, Sweden",
        "publisher": "The Hallwyl Museum (Hallwylska museet), Swedish National Historical Museums",
        "author": "The Hallwyl Museum (Hallwylska museet)",
        "author_url": "https://sketchfab.com/TheHallwylMuseum",
        "up": "y", "scale": round(0.75 / 2.17, 6),
        "scale_note": "RealityCapture units are not metres: the laid dining table (the largest up-facing surface) "
                      "is 2.17 units high, taken as 0.75 m; the ceiling is then 4.9 m",
        "devices": SHM_ROOM,
        "artworks": [{"label": "Painting of a figure over the marble fireplace (artist not yet identified)"},
                     {"label": "Two large verdure (landscape) tapestries on the walls (makers not yet identified)"},
                     {"label": "Painted medallions in the leaded windows (makers not yet identified)"}],
    },
    "hallwyl-picture-gallery": {
        "zip": "the-picture-gallery.zip",
        "uid": "231fdb3e9e354c6faaa3c250f8c9988f",
        "sketchfab_url": "https://sketchfab.com/3d-models/the-picture-gallery-231fdb3e9e354c6faaa3c250f8c9988f",
        "title": "The Picture Gallery",
        "place": "The Picture Gallery, the Hallwyl Museum, Stockholm, Sweden",
        "publisher": "The Hallwyl Museum (Hallwylska museet), Swedish National Historical Museums",
        "author": "The Hallwyl Museum (Hallwylska museet)",
        "author_url": "https://sketchfab.com/TheHallwylMuseum",
        "extra_credit": "Scan: Erik Lernestål.",
        "up": "z", "scale": 1.0,
        "scale_note": "source units are metres: chair seats 0.44 m and table tops 0.7 m above the levelled floor",
        "devices": SHM_ROOM,
        "artworks": [{"label": "Dutch and Flemish paintings hung frame to frame on every wall (individual works and artists not yet identified)"}],
    },
    "hallwyl-great-drawing-room": {
        "zip": "the-great-drawing-room.zip",
        "uid": "feb9ad17e042418c8e759b81e3b2e5d7",
        "sketchfab_url": "https://sketchfab.com/3d-models/the-great-drawing-room-feb9ad17e042418c8e759b81e3b2e5d7",
        "title": "The Great Drawing Room",
        "place": "The Great Drawing Room, the Hallwyl Museum, Stockholm, Sweden",
        "publisher": "The Hallwyl Museum (Hallwylska museet), Swedish National Historical Museums",
        "author": "The Hallwyl Museum (Hallwylska museet)",
        "author_url": "https://sketchfab.com/TheHallwylMuseum",
        "up": "y", "scale": round(0.45 / 1.03, 6),
        "scale_note": "RealityCapture units are not metres: upholstered seats (the largest up-facing area below "
                      "1 m) are 1.03 units high, taken as 0.45 m; the ceiling is then 5.1 m, close to the 4.9 m "
                      "dining room on the same floor",
        # Task 6 fix round 1: the study corner's props load with this room and count in its download
        # (room_extras), so its texture share is a little smaller: ETC1S quality 192 on desktops and
        # 144 on phones (was 255), measured on this room's atlas as 181 kB and 193 kB less.
        "devices": {"desktop": dict(SHM_ROOM["desktop"], etc1s_q=192), "phone": dict(SHM_ROOM["phone"], etc1s_q=144)},
        "artworks": [{"label": "Verdure tapestries on three walls (makers not yet identified)"},
                     {"label": "White stucco reliefs over the doors and the fireplace (makers not yet identified)"},
                     {"label": "Painted and gilded ceiling (artists not yet identified)"}],
    },
}

class BuildError(Exception):
    pass


# --- source checks --------------------------------------------------------------------------

def _where(scan_id):
    s = SCANS[scan_id]
    return f'"{s["title"]}" (Sketchfab uid {s["uid"]}): {s["sketchfab_url"]}'


def locate_source(scan_id, source_dir):
    if scan_id not in SCANS:
        raise BuildError(f"unknown scan id {scan_id!r}; known: {', '.join(SCANS)}")
    path = Path(source_dir) / SCANS[scan_id]["zip"]
    if not path.is_file():
        raise BuildError(f"missing source file {path}. Download the original from {_where(scan_id)} "
                         f"(Download 3D model, original format) and save it as {SCANS[scan_id]['zip']} in {source_dir}.")
    return path


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def verify_source(scan_id, path, manifest, pin=False):
    digest = sha256_file(path)
    pinned = (manifest or {}).get("source_sha256")
    if not pinned:
        if pin:
            return digest
        raise BuildError(f"{path.name} has no pinned sha256 in content/scans/{scan_id}.json; check it is the "
                         f"original from {_where(scan_id)}, then rerun with --pin-source to record sha256 {digest}.")
    if digest != pinned:
        raise BuildError(f"{path} sha256 {digest} differs from the manifest's {pinned}: this is not the file the "
                         f"bundles were built from. Re-download the original from {_where(scan_id)}, or review the new "
                         f"version and re-pin it deliberately.")
    return digest


# --- budgets, publishing, checks ------------------------------------------------------------

def room_extras(scan_id, content=None):
    """Bytes per device that load with this scanned room on top of its own files: the recreated study
    corners (content/<slug>/study-corner.json, Task 6) whose chapter room is this scan. They have no
    allowance of their own (Task 6 fix round 1): the room download, scan plus extras, fits BUDGETS."""
    content = Path(content) if content else ROOT / "content"
    extra = {d: 0 for d in BUDGETS}
    for cp in sorted(content.glob("*/study-corner.json")):
        corner = json.loads(cp.read_text())
        chp = cp.parent / "chapters" / f"{corner.get('chapter')}.json"
        room = json.loads(chp.read_text()).get("room") if chp.exists() else None
        if isinstance(room, dict) and room.get("scan") == scan_id:
            for d in extra:
                extra[d] += int(((corner.get("bundles") or {}).get(d) or {}).get("bytes") or 0)
    return extra


def room_download_errors(scan_id, downloads, extras=None):
    """Errors for a room download per device: the scan's own files ({device: bytes}) plus room_extras."""
    extras = room_extras(scan_id) if extras is None else extras
    errs = []
    for d, limit in BUDGETS.items():
        own = downloads.get(d)
        if not isinstance(own, int):
            continue
        if own + extras.get(d, 0) > limit:
            errs.append(f"{scan_id} {d}: room download (preview + bundle + occluder {own} + corner {extras.get(d, 0)}) "
                        f"is {own + extras.get(d, 0)} bytes, over the {d} budget of {limit} bytes")
    return errs


def check_budget(scan_id, device, nbytes):
    if device == "preview":
        if nbytes > PREVIEW_MAX_BYTES:
            raise BuildError(f"{scan_id} preview is {nbytes} bytes, over the preview limit of {PREVIEW_MAX_BYTES} bytes")
        return
    errs = room_download_errors(scan_id, {device: nbytes})
    if errs:
        raise BuildError(errs[0])


def room_download(m, device):
    """What a device downloads for one room: the preview, its bundle and the occluder (bytes). The
    Basis transcoder is fetched once for all rooms and is held to its own limit in the site budget."""
    return m["preview"]["bytes"] + m["bundles"][device]["bytes"] + m["occluder"]["bytes"]


def shipped_name(scan_id, part, path):
    """The shipped path (under site/public) of a staged file: part is a device, "preview" or
    "occluder"; the name carries the first 8 hex of the file's sha256."""
    h = sha256_file(path)[:8]
    return f"scans/{scan_id}/occluder.{h}.glb" if part == "occluder" else f"scans/{scan_id}/{part}/room.{h}.glb"


def _hashed_file_re(scan_id, part):
    sid = re.escape(str(scan_id))
    return re.compile(rf"scans/{sid}/occluder\.([0-9a-f]{{8}})\.glb" if part == "occluder"
                      else rf"scans/{sid}/{part}/room\.([0-9a-f]{{8}})\.glb")


def _file_error(m, part, b):
    """An error string when b["file"] is not scans/<id>/.../<stem>.<sha8>.glb with its own sha256."""
    hit = _hashed_file_re(m.get("id"), part).fullmatch(str(b.get("file", "")))
    stem = "occluder" if part == "occluder" else f"{part}/room"
    if not hit or not str(b.get("sha256", "")).startswith(hit.group(1)):
        return f"must be scans/<id>/{stem}.<first 8 hex of sha256>.glb"
    return None


def publish(scan_id, staged, out_root=OUT, manifest=None, manifest_dir=MANIFESTS):
    """Replace out_root/<id>/ (and, when given, content/scans/<id>.json) with the staged set, only if
    every file is present and in budget and the manifest is valid. The manifest is written to a
    temporary file before either swap, then both are swapped back to back."""
    staged = Path(staged)
    if manifest is not None:
        errors = validate_manifest(manifest)
        if errors:
            raise BuildError(f"{scan_id}: manifest invalid: {errors}")
    if not (staged / "occluder.glb").is_file():
        raise BuildError(f"{scan_id}: staged occluder missing")
    preview = staged / "preview" / "room.glb"
    if not preview.is_file():
        raise BuildError(f"{scan_id}: staged preview missing")
    check_budget(scan_id, "preview", preview.stat().st_size)
    shared = preview.stat().st_size + (staged / "occluder.glb").stat().st_size
    for device in DEVICES:
        glb = staged / device / "room.glb"
        if not glb.is_file():
            raise BuildError(f"{scan_id}: staged {device} bundle missing")
        check_budget(scan_id, device, glb.stat().st_size + shared)
    dest = Path(out_root) / scan_id
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.parent / f".{scan_id}.new"
    old = dest.parent / f".{scan_id}.old"
    for p in (tmp, old):
        if p.exists():
            shutil.rmtree(p)
    mtmp = None
    if manifest is not None:
        Path(manifest_dir).mkdir(parents=True, exist_ok=True)
        mtmp = Path(manifest_dir) / f".{scan_id}.json.new"
        mtmp.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    # Shipped under content-hashed names (shipped_name), the staged layout otherwise kept.
    staged_files = [(d, staged / d / "room.glb") for d in (*DEVICES, "preview")] + [("occluder", staged / "occluder.glb")]
    for part, src in staged_files:
        rel = Path(shipped_name(scan_id, part, src)).relative_to(Path("scans") / scan_id)
        (tmp / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, tmp / rel)
    if dest.exists():
        dest.rename(old)
    tmp.rename(dest)
    if mtmp is not None:
        os.replace(mtmp, Path(manifest_dir) / f"{scan_id}.json")
    if old.exists():
        shutil.rmtree(old)


def _is_sha(v):
    return isinstance(v, str) and re.fullmatch(r"[0-9a-f]{64}", v) is not None


def validate_manifest(m, content=None):
    """Schema, attribution, licence, content-hashed names, artwork records and the combined room download
    (scan + any study corner of `content`, default content/). The shipped files and the inventory review
    are checked by manifest_errors, the complete validator the gates run."""
    errors = []
    if not isinstance(m, dict):
        return ["manifest is not an object"]
    for key in ("id", "title", "place", "publisher", "sketchfab_url", "licence", "licence_url", "credit",
                "credit_source", "changes"):
        if not isinstance(m.get(key), str) or not m.get(key).strip():
            errors.append(f"{key}: missing or empty")
    if m.get("licence") != LICENCE:
        errors.append(f"licence: must be {LICENCE!r}")
    if m.get("licence_url") != LICENCE_URL:
        errors.append(f"licence_url: must be {LICENCE_URL}")
    if not str(m.get("sketchfab_url", "")).startswith("https://sketchfab.com/3d-models/"):
        errors.append("sketchfab_url: must be a sketchfab.com/3d-models page")
    if not _is_sha(m.get("source_sha256")):
        errors.append("source_sha256: must be 64 lowercase hex characters")
    unusable = m.get("usable", True) is False
    if unusable and not (isinstance(m.get("unusable_reason"), str) and m["unusable_reason"].strip()):
        errors.append("unusable_reason: an unusable room must say why")
    bundles = {} if unusable else m.get("bundles")
    if not isinstance(bundles, dict):
        errors.append("bundles: missing")
        bundles = {}
    for device in (() if unusable else DEVICES):
        b = bundles.get(device)
        if not isinstance(b, dict):
            errors.append(f"bundles.{device}: missing")
            continue
        fe = _file_error(m, device, b)
        if fe:
            errors.append(f"bundles.{device}.file: {fe}")
        for key in ("bytes", "gpu_bytes", "tris", "texture_px"):
            if not isinstance(b.get(key), int) or isinstance(b.get(key), bool) or b.get(key) <= 0:
                errors.append(f"bundles.{device}.{key}: must be a positive integer")
        if isinstance(b.get("bytes"), int) and b["bytes"] > BUDGETS[device]:
            errors.append(f"bundles.{device}.bytes: over the {BUDGETS[device]} byte budget")
        if not _is_sha(b.get("sha256")):
            errors.append(f"bundles.{device}.sha256: must be 64 lowercase hex characters")
    prev = m.get("preview")
    if not unusable:
        if not isinstance(prev, dict) or _file_error(m, "preview", prev):
            errors.append(f"preview.file: {_file_error(m, 'preview', prev) if isinstance(prev, dict) else 'missing'}")
            prev = None
        else:
            for key in ("bytes", "tris", "texture_px", "gpu_bytes"):
                if not isinstance(prev.get(key), int) or isinstance(prev.get(key), bool) or prev.get(key) <= 0:
                    errors.append(f"preview.{key}: must be a positive integer")
            if not _is_sha(prev.get("sha256")):
                errors.append("preview.sha256: must be 64 lowercase hex characters")
            if isinstance(prev.get("bytes"), int) and prev["bytes"] > PREVIEW_MAX_BYTES:
                errors.append(f"preview.bytes: over the {PREVIEW_MAX_BYTES} byte preview limit")
    occ = m.get("occluder")
    if unusable:
        pass
    elif not isinstance(occ, dict) or _file_error(m, "occluder", occ):
        errors.append(f"occluder.file: {_file_error(m, 'occluder', occ) if isinstance(occ, dict) else 'missing'}")
    elif not isinstance(occ.get("tris"), int) or not 0 < occ["tris"] <= OCCLUDER_MAX_TRIS:
        errors.append(f"occluder.tris: must be 1-{OCCLUDER_MAX_TRIS}")
    elif not _is_sha(occ.get("sha256")) or not isinstance(occ.get("bytes"), int):
        errors.append("occluder: bytes and sha256 required")
    arts = m.get("artworks")
    if not isinstance(arts, list):
        errors.append("artworks: must be a list")
        arts = []
    for i, a in enumerate(arts):
        if not isinstance(a, dict) or not isinstance(a.get("label"), str) or not a["label"].strip():
            errors.append(f"artworks[{i}].label: missing")
            continue
        if a.get("status") not in ("cleared", "cropped", "blocked"):
            errors.append(f"artworks[{i}].status: must be cleared, cropped or blocked")
        for key in ("artist", "died", "evidence_url"):
            if key not in a:
                errors.append(f"artworks[{i}].{key}: missing (use null when unknown)")
        if a.get("status") in ("cleared", "cropped"):
            import content_check  # one clearance rule, shared with the build gate
            crop_ids = {c.get("id") for c in m.get("crops") or [] if isinstance(c, dict)}
            errors.extend(f"artworks[{i}]: {e}" for e in content_check.check_artwork(a["label"], a, crop_ids, None))
    if not unusable and isinstance(prev, dict) and isinstance(occ, dict):
        for device in DEVICES:
            try:
                total = room_download(m, device)
            except (KeyError, TypeError):
                continue
            errors.extend(room_download_errors(str(m.get("id")), {device: total}, room_extras(str(m.get("id")), content)))
    if not isinstance(m.get("stations"), list):
        errors.append("stations: must be a list")
    if not isinstance(m.get("crops", []), list):
        errors.append("crops: must be a list")
    return errors


def check_bundles(m, public=ROOT / "site" / "public"):
    """Shipped files must exist, match the manifest's bytes and sha256 and stay in budget."""
    errors = []
    items = ([(d, (m.get("bundles") or {}).get(d) or {}) for d in DEVICES] + [("preview", m.get("preview") or {})]
             + [("occluder", m.get("occluder") or {})])
    for name, b in items:
        path = public / str(b.get("file", ""))
        if not b.get("file") or not path.is_file():
            errors.append(f"{name}: file {b.get('file')} missing")
            continue
        size = path.stat().st_size
        if size != b.get("bytes"):
            errors.append(f"{name}: {size} bytes on disk, manifest says {b.get('bytes')}")
        if sha256_file(path) != b.get("sha256"):
            errors.append(f"{name}: sha256 differs from the manifest (stale or partial bundle)")
        if name in BUDGETS and size > BUDGETS[name]:
            errors.append(f"{name}: {size} bytes is over the {BUDGETS[name]} byte budget")
        if name == "preview" and size > PREVIEW_MAX_BYTES:
            errors.append(f"preview: {size} bytes is over the {PREVIEW_MAX_BYTES} byte preview limit")
    # Nothing else is shipped for the room: a file the manifest does not name is stale (an old name).
    named = {str(b.get("file")) for _, b in items if b.get("file")}
    folder = public / "scans" / str(m.get("id"))
    if folder.is_dir():
        for f in sorted(folder.rglob("*")):
            rel = f.relative_to(public).as_posix()
            if f.is_file() and rel not in named:
                errors.append(f"{rel}: shipped but not in the manifest (stale); remove it")
    return errors


ISO_DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")


def inventory_sha256(artworks):
    """Canonical digest of a whole artwork inventory: each entry as sorted-key compact JSON, the entries
    sorted, joined by newlines. Key and list order do not matter; any added, removed, duplicated or
    edited entry does."""
    rows = sorted(json.dumps(a, sort_keys=True, separators=(",", ":"), ensure_ascii=False) for a in artworks or [])
    return hashlib.sha256("\n".join(rows).encode()).hexdigest()


def inventory_errors(m, today=None):
    """The artwork inventory is a reviewed record of THIS source (Codex gate 2026-10-14): the manifest
    carries inventory_reviewed {source_sha256, date, count, artworks_sha256, evidence}, where source_sha256
    is the pinned source the review looked at, count the number of artworks it recorded, artworks_sha256
    the canonical digest of the reviewed list (inventory_sha256; round 2), date (YYYY-MM-DD, not in the
    future) when, and evidence the document holding the review. An inventory that differs from its review
    (an entry deleted, a re-pinned source) fails until it is reviewed again. An empty inventory is never
    implied: the room must say art_free: true with an art_free_reason."""
    errors = []
    arts = m.get("artworks") if isinstance(m.get("artworks"), list) else []
    r = m.get("inventory_reviewed")
    if not isinstance(r, dict):
        return ["inventory_reviewed: missing; review the room's artworks against the source and record "
                "{source_sha256, date, count, artworks_sha256, evidence}"]
    if r.get("source_sha256") != m.get("source_sha256"):
        errors.append(f"inventory_reviewed.source_sha256: the review was of source {r.get('source_sha256')}, the manifest "
                      f"pins {m.get('source_sha256')}; review the artworks of this source")
    count = r.get("count")
    if not (isinstance(count, int) and not isinstance(count, bool) and count >= 0):
        errors.append("inventory_reviewed.count: must be the number of artworks the review recorded")
    elif count != len(arts):
        errors.append(f"inventory_reviewed.count: the review recorded {count} artworks, the manifest lists {len(arts)}; "
                      f"an entry was added or deleted without a review")
    if r.get("artworks_sha256") != inventory_sha256(arts):
        errors.append(f"inventory_reviewed.artworks_sha256: the artworks differ from the reviewed inventory (digest "
                      f"{inventory_sha256(arts)}, review {r.get('artworks_sha256')}); an entry was added, removed, "
                      f"replaced or edited without a review")
    d = r.get("date")
    try:
        if not (isinstance(d, str) and ISO_DATE_RE.fullmatch(d)):
            raise ValueError
        if datetime.date.fromisoformat(d) > (today or datetime.date.today()):
            errors.append(f"inventory_reviewed.date: {d} is in the future")
    except ValueError:
        errors.append("inventory_reviewed.date: must be YYYY-MM-DD")
    if not (isinstance(r.get("evidence"), str) and r["evidence"].strip()):
        errors.append("inventory_reviewed.evidence: must name the document holding the review")
    art_free = m.get("art_free", False)
    if art_free not in (True, False):
        errors.append("art_free: must be true or false")
    if not arts:
        if art_free is not True:
            errors.append("artworks: empty; a room with no artworks must say art_free: true with an art_free_reason")
        elif not (isinstance(m.get("art_free_reason"), str) and m["art_free_reason"].strip()):
            errors.append("art_free_reason: an art-free room must say why it has no artworks")
    elif art_free is True:
        errors.append("art_free: the room lists artworks, so it is not art-free")
    return errors


def manifest_errors(m, public=ROOT / "site" / "public", content=None):
    """The complete check of one room manifest against what ships: validate_manifest, the inventory
    review and, for a usable room, its shipped files (check_bundles); an unusable room ships nothing.
    tools/content_check.py --scans (the build gate) and --check here both run this, never a subset."""
    errors = validate_manifest(m, content) + inventory_errors(m)
    if m.get("usable", True) is False:
        shipped = Path(public) / "scans" / str(m.get("id"))
        if shipped.exists() and any(p.is_file() for p in shipped.rglob("*")):
            errors.append(f"marked unusable but files are shipped under {shipped}")
        return errors
    return errors + check_bundles(m, Path(public))


# Every file beneath these folders of site/public is cached for a year as immutable (site/vercel.json).
SHIPPED_ROOTS = ("scans", "study")
_HASH_IN_NAME = re.compile(r"\.([0-9a-f]{8})\.[A-Za-z0-9]+$")


def shipped_records(content=None):
    """({published path: (record, sha256)}, errors) for every file a reviewed record names under
    SHIPPED_ROOTS: the bundles, preview and occluder of each usable content/scans/<id>.json, and the
    bundles of each content/<slug>/study-corner.json."""
    content = Path(content) if content else ROOT / "content"
    recs, errors = {}, []

    def add(rel, owner, sha, root):
        rel = str(rel)
        parts = Path(rel).parts
        if not parts or parts[0] != root or ".." in parts or Path(rel).is_absolute():
            errors.append(f"{owner}: file {rel} is not under {root}/"); return
        if rel in recs and recs[rel][1] != sha:
            errors.append(f"{rel}: named by {recs[rel][0]} and {owner} with different sha256"); return
        recs[rel] = (owner, sha)

    for mp in sorted((content / "scans").glob("*.json")):
        m = json.loads(mp.read_text())
        if m.get("usable", True) is False:
            continue
        for b in [(m.get("bundles") or {}).get(d) for d in DEVICES] + [m.get("preview"), m.get("occluder")]:
            if isinstance(b, dict) and b.get("file"):
                add(b["file"], f"content/scans/{mp.name}", b.get("sha256"), "scans")
    for cp in sorted(content.glob("*/study-corner.json")):
        c = json.loads(cp.read_text())
        for b in (c.get("bundles") or {}).values():
            if isinstance(b, dict) and b.get("file"):
                add(b["file"], f"content/{cp.parent.name}/study-corner.json", b.get("sha256"), "study")
    return recs, errors


def shipped_asset_errors(public=ROOT / "site" / "public", content=None, roots=SHIPPED_ROOTS):
    """Errors for the immutable-cached folders: every file beneath public/<root> must be named by a
    reviewed record (shipped_records), and its actual sha256 must match both the 8 hex in its name and
    that record; every recorded file must be shipped."""
    recs, errors = shipped_records(content)
    recs = {k: v for k, v in recs.items() if Path(k).parts[0] in roots}
    public = Path(public)
    on_disk = set()
    for root in roots:
        base = public / root
        if not base.exists():
            continue
        for f in sorted(base.rglob("*")):
            if f.is_dir() and not f.is_symlink():
                continue
            rel = f.relative_to(public).as_posix()
            on_disk.add(rel)
            if f.is_symlink() or not f.is_file():
                errors.append(f"{rel}: not a regular file; remove it"); continue
            rec = recs.get(rel)
            if rec is None:
                errors.append(f"stray file {rel}: shipped under /{root}/ but no reviewed record names it; remove it or record it"); continue
            sha = sha256_file(f)
            hit = _HASH_IN_NAME.search(f.name)
            if not hit or hit.group(1) != sha[:8]:
                errors.append(f"{rel}: name does not carry the first 8 hex of its actual sha256 {sha}")
            if sha != rec[1]:
                errors.append(f"{rel}: actual sha256 {sha} differs from {rec[0]} ({rec[1]})")
    for rel in sorted(set(recs) - on_disk):
        errors.append(f"{rel}: named by {recs[rel][0]} but not shipped")
    return errors


# --- GLB read / write -------------------------------------------------------------------------

COMPONENT_SIZE = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}
NUM_COMPONENTS = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


def read_glb(path):
    data = Path(path).read_bytes()
    magic, _, length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF":
        raise BuildError(f"{path}: not a GLB")
    off, gltf, binc = 12, None, b""
    while off < length:
        clen, ctype = struct.unpack_from("<II", data, off)
        chunk = data[off + 8: off + 8 + clen]
        if ctype == 0x4E4F534A:
            gltf = json.loads(chunk)
        elif ctype == 0x004E4942:
            binc = chunk
        off += 8 + clen
    return gltf, binc


def write_glb(path, gltf, binc):
    js = json.dumps(gltf, separators=(",", ":"), ensure_ascii=False).encode()
    js += b" " * (-len(js) % 4)
    binc = binc + b"\0" * (-len(binc) % 4)
    total = 12 + 8 + len(js) + (8 + len(binc) if binc else 0)
    out = struct.pack("<4sII", b"glTF", 2, total) + struct.pack("<II", len(js), 0x4E4F534A) + js
    if binc:
        out += struct.pack("<II", len(binc), 0x004E4942) + binc
    Path(path).write_bytes(out)


def _node_matrix(node):
    import numpy as np
    if "matrix" in node:
        return np.array(node["matrix"], dtype=np.float64).reshape(4, 4).T
    t = node.get("translation", [0, 0, 0])
    x, y, z, w = node.get("rotation", [0, 0, 0, 1])
    s = node.get("scale", [1, 1, 1])
    r = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                  [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                  [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    m = np.eye(4)
    m[:3, :3] = r * np.array(s)
    m[:3, 3] = t
    return m


def _accessor(gltf, binc, idx):
    import numpy as np
    a = gltf["accessors"][idx]
    bv = gltf["bufferViews"][a["bufferView"]]
    dtype = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}[a["componentType"]]
    n = NUM_COMPONENTS[a["type"]]
    size = COMPONENT_SIZE[a["componentType"]]
    stride = bv.get("byteStride", n * size)
    start = bv.get("byteOffset", 0) + a.get("byteOffset", 0)
    raw = np.frombuffer(binc, dtype=np.uint8, count=stride * (a["count"] - 1) + n * size, offset=start)
    rows = np.lib.stride_tricks.as_strided(raw, shape=(a["count"], n * size), strides=(stride, 1))
    return np.ascontiguousarray(rows).view(dtype).reshape(a["count"], n).astype(np.float64)


def world_triangles(gltf, binc, with_uv=False):
    """World-space positions (V x 3) and triangle indices (T x 3) of an uncompressed, float GLB.
    with_uv: also per-vertex TEXCOORD_0 (V x 2, glTF convention: v down from the image top) and per
    triangle the image uri of its base-colour texture (None when untextured)."""
    import numpy as np
    positions, faces, uvs, face_img, base = [], [], [], [], 0

    def image_of(prim):
        mat = gltf.get("materials", [])[prim["material"]] if "material" in prim else {}
        tex = (mat.get("pbrMetallicRoughness") or {}).get("baseColorTexture")
        if tex is None:
            return None
        t = gltf["textures"][tex["index"]]
        src = t.get("source", (t.get("extensions") or {}).get("KHR_texture_basisu", {}).get("source"))
        return gltf["images"][src].get("uri") if src is not None else None

    def visit(ni, parent):
        nonlocal base
        node = gltf["nodes"][ni]
        m = parent @ _node_matrix(node)
        if "mesh" in node:
            for prim in gltf["meshes"][node["mesh"]]["primitives"]:
                if prim.get("mode", 4) != 4:
                    continue
                p = _accessor(gltf, binc, prim["attributes"]["POSITION"])
                p = (np.c_[p, np.ones(len(p))] @ m.T)[:, :3]
                idx = _accessor(gltf, binc, prim["indices"]).astype(np.int64).reshape(-1, 3) if "indices" in prim \
                    else np.arange(len(p)).reshape(-1, 3)
                positions.append(p)
                faces.append(idx + base)
                if with_uv:
                    tc = prim["attributes"].get("TEXCOORD_0")
                    uvs.append(_accessor(gltf, binc, tc) if tc is not None else np.zeros((len(p), 2)))
                    face_img.extend([image_of(prim) if tc is not None else None] * len(idx))
                base += len(p)
        for c in node.get("children", []):
            visit(c, m)

    for ni in gltf["scenes"][gltf.get("scene", 0)]["nodes"]:
        visit(ni, np.eye(4))
    if with_uv:
        return np.vstack(positions), np.vstack(faces), np.vstack(uvs), face_img
    return np.vstack(positions), np.vstack(faces)


# --- artwork crops ----------------------------------------------------------------------------------

def to_room(positions, matrix):
    """Source positions -> room metres, through the column-major root matrix the bundle carries."""
    import numpy as np
    m = np.array(matrix, dtype=np.float64).reshape(4, 4).T
    return (np.c_[positions, np.ones(len(positions))] @ m.T)[:, :3]


def select_crop_faces(room_pos, faces, crops):
    """{crop id: indices of the triangles whose centre lies inside the box}. A box that selects no
    triangle is an error: it would leave the artwork it was drawn for in the bundle."""
    import numpy as np
    centre = room_pos[faces].mean(axis=1)
    out = {}
    for c in crops:
        lo, hi = np.array(c["min"], float), np.array(c["max"], float)
        pts = centre
        if c.get("rot_y_deg"):  # a box turned about the vertical through its centre (migrate_crops)
            mid = (lo + hi) / 2
            pts = (centre - mid) @ yaw_rotation(c["rot_y_deg"]) + mid
        sel = np.nonzero(((pts >= lo) & (pts <= hi)).all(axis=1))[0]
        if not len(sel):
            raise BuildError(f"crop box {c['id']} selects no triangle: check its corners (room metres)")
        out[c["id"]] = sel
    return out


def migrate_crops(crops, old_matrix, new_matrix):
    """Crop boxes drawn in an earlier room frame (old root matrix), carried into a new one: each box
    keeps its size, its centre moves with the room, and the room's turn about the vertical goes into
    the box's rot_y_deg, so it selects exactly the same triangles. Same frame: returned unchanged."""
    import numpy as np
    mo = np.array(old_matrix, float).reshape(4, 4).T
    mn = np.array(new_matrix, float).reshape(4, 4).T
    d = mn @ np.linalg.inv(mo)
    if np.allclose(d, np.eye(4), atol=1e-7):
        return crops
    r = d[:3, :3]
    if not np.allclose(r[1], [0, 1, 0], atol=1e-4) or not np.allclose(r @ r.T, np.eye(3), atol=1e-4):
        raise BuildError("crop boxes can follow only a turn about the vertical and a shift; re-survey the crops")
    delta = float(np.degrees(np.arctan2(r[0, 2], r[0, 0])))
    out = []
    for c in crops:
        lo, hi = np.array(c["min"], float), np.array(c["max"], float)
        mid, half = (lo + hi) / 2, (hi - lo) / 2
        m2 = r @ mid + d[:3, 3]
        rot = ((c.get("rot_y_deg", 0.0) + delta + 180) % 360) - 180
        # Rounded outwards (0.1 mm): a carried box is never smaller than the one drawn.
        out.append({**c, "min": [math.floor(float(v) * 1e4) / 1e4 for v in m2 - half],
                    "max": [math.ceil(float(v) * 1e4) / 1e4 for v in m2 + half], "rot_y_deg": round(rot, 6)})
    return out


def mask_crops(img, uv, faces, face_tex, selected, texture_index):
    """Fill the texture region of each crop's triangles (those using this texture) with the mean
    colour of that region, grown by CROP_DILATE_PX. Returns (image, {crop id: texels filled})."""
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter
    a = np.asarray(img.convert("RGB")).copy()
    h, w = a.shape[:2]
    texels = {}
    for cid, sel in selected.items():
        mask = Image.new("L", (w, h), 0)
        draw = ImageDraw.Draw(mask)
        for f in sel:
            if face_tex[f] != texture_index:
                continue
            tri = uv[faces[f]]
            draw.polygon([(float(u) * w, float(v) * h) for u, v in tri], fill=255)
        if CROP_DILATE_PX:
            mask = mask.filter(ImageFilter.MaxFilter(2 * CROP_DILATE_PX + 1))
        m = np.asarray(mask) > 0
        texels[cid] = int(m.sum())
        if texels[cid]:
            a[m] = a[m].reshape(-1, 3).mean(axis=0).round().astype(np.uint8)
    return Image.fromarray(a), texels


# --- sharp preview: a small mesh with its own texture, baked from the room's ----------------------

def atlas_uvs(pos, faces, px, padding=2):
    """A fresh UV atlas for a (simplified) mesh with xatlas: (vertex map, faces, uvs in [0, 1], glTF
    convention v down). Charts are cut on the new mesh, so its texture has no torn seams."""
    import numpy as np
    import xatlas
    atlas = xatlas.Atlas()
    atlas.add_mesh(pos.astype(np.float32), faces.astype(np.uint32))
    pack = xatlas.PackOptions()
    pack.resolution, pack.padding, pack.bilinear = px, padding, True
    atlas.generate(pack_options=pack)
    vmap, idx, uv = atlas[0]
    return vmap, idx.astype(np.int64), uv.astype(np.float64)


def bake_texture(new_pos, new_faces, new_uv, src_pos, src_faces, src_uv, src_tex, images, px):
    """Texture for a new mesh/atlas, sampled from the original textured mesh: every texel inside a new
    triangle is placed in 3D, matched to the nearest original triangle (by centroid), projected onto
    it, and read from the original texture at that point. Texels outside every chart are filled from
    their neighbours (fill_padding). images: per source texture index, a PIL RGB image (already
    colour-corrected and with every crop masked), so the preview can never show a masked artwork."""
    import numpy as np
    from scipy.spatial import cKDTree
    tri = src_pos[src_faces]
    tree = cKDTree(tri.mean(1))
    pts, pix = [], []
    for f in new_faces:
        a, b, c = new_uv[f] * px
        x0, y0 = np.floor(np.minimum(np.minimum(a, b), c)).astype(int)
        x1, y1 = np.ceil(np.maximum(np.maximum(a, b), c)).astype(int)
        xs, ys = np.meshgrid(np.arange(max(x0, 0), min(x1 + 1, px)), np.arange(max(y0, 0), min(y1 + 1, px)))
        q = np.c_[xs.ravel() + 0.5, ys.ravel() + 0.5]
        if not len(q):
            continue
        m = np.array([b - a, c - a]).T
        if abs(np.linalg.det(m)) < 1e-12:
            continue
        l12 = np.linalg.solve(m, (q - a).T).T
        bary = np.c_[1 - l12.sum(1), l12]
        ok = (bary >= -0.02).all(1)
        if not ok.any():
            continue
        p3 = bary[ok] @ new_pos[f]
        pts.append(p3); pix.append(q[ok].astype(int))
    pts, pix = np.vstack(pts), np.vstack(pix)
    _, near = tree.query(pts)
    t = tri[near]
    # barycentric of each point projected onto its original triangle
    v0, v1, v2 = t[:, 1] - t[:, 0], t[:, 2] - t[:, 0], pts - t[:, 0]
    d00, d01, d11 = (v0 * v0).sum(1), (v0 * v1).sum(1), (v1 * v1).sum(1)
    d20, d21 = (v2 * v0).sum(1), (v2 * v1).sum(1)
    den = np.where(np.abs(d00 * d11 - d01 * d01) < 1e-20, 1e-20, d00 * d11 - d01 * d01)
    v = np.clip((d11 * d20 - d01 * d21) / den, 0, 1)
    w = np.clip((d00 * d21 - d01 * d20) / den, 0, 1)
    over = v + w > 1
    v[over], w[over] = v[over] / (v[over] + w[over]), w[over] / (v[over] + w[over])
    uvt = src_uv[src_faces[near]]
    uv = uvt[:, 0] * (1 - v - w)[:, None] + uvt[:, 1] * v[:, None] + uvt[:, 2] * w[:, None]
    out = np.zeros((px, px, 3), np.uint8)
    valid = np.zeros((px, px), bool)
    which = src_tex[near]
    for ti, im in enumerate(images):
        sel = which == ti
        if not sel.any():
            continue
        a = np.asarray(im.convert("RGB"))
        h, wd = a.shape[:2]
        x = np.clip((uv[sel, 0] % 1.0) * wd, 0, wd - 1).astype(int)
        y = np.clip((uv[sel, 1] % 1.0) * h, 0, h - 1).astype(int)
        out[pix[sel, 1], pix[sel, 0]] = a[y, x]
        valid[pix[sel, 1], pix[sel, 0]] = True
    return fill_padding(out, valid)


def glb_stats(gltf):
    """(triangles, decoded geometry bytes) of a GLB's meshes."""
    tris, geo, seen = 0, 0, set()
    for mesh in gltf.get("meshes", []):
        for prim in mesh["primitives"]:
            acc = list(prim["attributes"].values()) + ([prim["indices"]] if "indices" in prim else [])
            if "indices" in prim:
                tris += gltf["accessors"][prim["indices"]]["count"] // 3
            else:
                tris += gltf["accessors"][prim["attributes"]["POSITION"]]["count"] // 3
            for i in acc:
                if i in seen:
                    continue
                seen.add(i)
                a = gltf["accessors"][i]
                bv = gltf["bufferViews"][a["bufferView"]]
                elem = NUM_COMPONENTS[a["type"]] * COMPONENT_SIZE[a["componentType"]]
                geo += a["count"] * bv.get("byteStride", elem)
    return tris, geo


# --- room transform and colour ----------------------------------------------------------------

def up_rotation(up):
    import numpy as np
    if up == "y":
        return np.eye(3)
    if up == "z":  # (x, y, z) -> (x, z, -y): Z-up source to glTF Y-up
        return np.array([[1, 0, 0], [0, 0, 1], [0, -1, 0]], dtype=np.float64)
    raise BuildError(f"unknown up axis {up!r}")


def floor_tilt(p, faces):
    """Rotation (3x3) that levels the scanned floor: a robust area-weighted plane fit y = a x + b z + c
    through the up-facing triangles in the lowest 12 % of the room's height."""
    import numpy as np
    tri = p[faces]
    nrm = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    area = np.linalg.norm(nrm, axis=1) / 2
    ny = nrm[:, 1] / np.maximum(2 * area, 1e-12)
    c = tri.mean(1)
    lo, hi = np.percentile(p[:, 1], [0.5, 99.5])
    sel = (ny > 0.9) & (c[:, 1] < lo + 0.12 * (hi - lo))
    x, z, y, w = c[sel, 0], c[sel, 2], c[sel, 1], np.sqrt(area[sel])
    for _ in range(4):
        A = np.c_[x, z, np.ones(len(x))]
        coef = np.linalg.lstsq(A * w[:, None], y * w, rcond=None)[0]
        r = np.abs(y - A @ coef)
        keep = r <= max(3 * np.median(r), 1e-6)
        x, z, y, w = x[keep], z[keep], y[keep], w[keep]
    n = np.array([-coef[0], 1.0, -coef[1]])
    n /= np.linalg.norm(n)
    # rotation taking n to +Y (Rodrigues)
    v = np.cross(n, [0, 1, 0])
    s, cth = np.linalg.norm(v), n[1]
    if s < 1e-9:
        return np.eye(3), 0.0
    k = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    rot = np.eye(3) + k + k @ k * ((1 - cth) / s ** 2)
    return rot, float(np.degrees(np.arccos(np.clip(cth, -1, 1))))


def wall_yaw_deg(p, faces):
    """How far a Y-up room's walls are turned from the x and z axes, in degrees (-45, 45]: the
    area-weighted circular mean, modulo 90 degrees, of the horizontal direction of every near-vertical
    triangle's normal. Walls dominate that set, so furniture and protrusions barely move it."""
    import numpy as np
    tri = p[faces]
    n = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    area = np.linalg.norm(n, axis=1) / 2
    ok = area > 1e-12
    n, area = n[ok] / (2 * area[ok, None]), area[ok]
    wall = np.abs(n[:, 1]) < 0.2
    if not wall.any():
        return 0.0
    a = np.arctan2(n[wall, 2], n[wall, 0])
    w = area[wall]
    return float(np.degrees(np.arctan2((w * np.sin(4 * a)).sum(), (w * np.cos(4 * a)).sum()) / 4))


def yaw_rotation(deg):
    """Rotation (3x3) about +Y by deg (glTF/three convention: x turns towards -z)."""
    import numpy as np
    t = np.radians(deg)
    return np.array([[np.cos(t), 0, np.sin(t)], [0, 1, 0], [-np.sin(t), 0, np.cos(t)]])


def room_frame(positions, up, faces=None):
    """Floor height, ceiling height and footprint centre of a Y-up-rotated, levelled room (source units).
    With faces, the floor is levelled and the room is turned about the vertical so its walls face along
    x and z (wall_yaw_deg): the footprint extent is then the room's true width and depth, not the
    bounding box of a room standing at an angle."""
    import numpy as np
    level, tilt = (np.eye(3), 0.0) if faces is None else floor_tilt(positions @ up_rotation(up).T, faces)
    yaw = 0.0
    if faces is not None:
        yaw = wall_yaw_deg(positions @ (level @ up_rotation(up)).T, faces)
        level = yaw_rotation(yaw) @ level
    p = positions @ (level @ up_rotation(up)).T
    y = p[:, 1]
    lo, hi = np.percentile(y, [0.5, 99.5])
    bins = np.arange(lo, hi + 0.02, 0.02)
    hist, edges = np.histogram(y, bins=bins)
    k = max(1, int(len(hist) * 0.2))
    floor = float(edges[int(np.argmax(hist[:k]))] + 0.01)
    ceiling = float(edges[len(hist) - k + int(np.argmax(hist[-k:]))] + 0.01)
    x0, x1 = np.percentile(p[:, 0], [1, 99])
    z0, z1 = np.percentile(p[:, 2], [1, 99])
    return {"floor": floor, "ceiling": ceiling, "centre": [float((x0 + x1) / 2), float((z0 + z1) / 2)],
            "extent": [float(x1 - x0), float(z1 - z0)], "level": level.tolist(), "tilt_deg": round(tilt, 3),
            "yaw_deg": round(yaw, 3), "walls_off_axis_deg": round(wall_yaw_deg(p, faces), 3) if faces is not None else None}


def root_matrix(frame, up, scale):
    """Column-major glTF matrix: rotate to Y-up, level the floor, scale to metres, floor to y=0,
    footprint centred."""
    import numpy as np
    m = np.eye(4)
    m[:3, :3] = np.array(frame.get("level", np.eye(3))) @ up_rotation(up) * scale
    m[:3, 3] = [-frame["centre"][0] * scale, -frame["floor"] * scale, -frame["centre"][1] * scale]
    return [round(float(v), 9) for v in m.T.reshape(-1)]


def colour_params(images):
    """Measure one correction for a room from downsampled copies of its base-colour textures."""
    import numpy as np
    a = np.concatenate([np.asarray(im.convert("RGB"), dtype=np.float64).reshape(-1, 3) / 255 for im in images])
    lw = np.array([0.2126, 0.7152, 0.0722])
    mean = a.mean(0)
    gains = (float(mean @ lw) / np.maximum(mean, 1e-3)) ** WB_STRENGTH
    b = np.clip(a * gains, 0, 1)
    med_before = float(np.median(a @ lw))
    med = float(np.median(b @ lw))
    gamma = float(np.clip(math.log(TARGET_MEDIAN) / math.log(max(med, 1e-3)), *GAMMA_RANGE))
    after = float(np.median((b ** gamma) @ lw))
    return {"method": f"partial grey-world white balance (strength {WB_STRENGTH}) then gamma on sRGB values "
                      f"toward median luminance {TARGET_MEDIAN} (gamma clamped to {list(GAMMA_RANGE)})",
            "gains_rgb": [round(float(g), 4) for g in gains], "gamma": round(gamma, 4),
            "median_luminance_before": round(med_before, 4), "median_luminance_after": round(after, 4)}


def apply_colour(img, params):
    import numpy as np
    from PIL import Image
    a = np.asarray(img.convert("RGB"), dtype=np.float32) / 255
    a = np.clip(a * np.array(params["gains_rgb"], dtype=np.float32), 0, 1) ** np.float32(params["gamma"])
    return Image.fromarray((a * 255 + 0.5).astype(np.uint8))


PADDING_MAX = 24          # texels with every channel <= this are unused atlas padding (black)
PADDING_GROW = 4          # source texels of chart border next to padding also dropped (JPEG ringing)
DECODE_MAX_PX = 8192      # larger sources are decoded at half size (JPEG DCT scaling) to bound memory


def fill_padding(rgb, valid):
    """Push-pull fill: every texel outside `valid` gets the average colour of the nearest valid
    texels, so chart borders and mip levels never blend in black padding."""
    import numpy as np
    levels = []
    c, w = rgb.astype(np.float32) * valid[..., None], valid.astype(np.float32)
    while True:
        levels.append((c, w))
        h, wd = w.shape
        if h <= 1 or wd <= 1:
            break
        c = c[: h // 2 * 2, : wd // 2 * 2].reshape(h // 2, 2, wd // 2, 2, 3).sum((1, 3))
        w = w[: h // 2 * 2, : wd // 2 * 2].reshape(h // 2, 2, wd // 2, 2).sum((1, 3))
    filled = levels[-1][0] / np.maximum(levels[-1][1], 1e-6)[..., None]
    for c, w in reversed(levels[:-1]):
        up = np.repeat(np.repeat(filled, 2, 0), 2, 1)
        up = np.pad(up, ((0, c.shape[0] - up.shape[0]), (0, c.shape[1] - up.shape[1]), (0, 0)), mode="edge")
        own = c / np.maximum(w, 1e-6)[..., None]
        a = np.clip(w, 0, 1)[..., None]
        filled = own * a + up * (1 - a)
    return np.clip(filled + 0.5, 0, 255).astype(np.uint8)


def load_resized(path, px):
    """Decode a base-colour atlas and resize it to px x px with Lanczos, treating pure-black padding
    as transparent (premultiplied resize), then fill the padding by push-pull."""
    import numpy as np
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    im = Image.open(path)
    full = im.size
    if px * 16 <= min(full):
        im.draft("RGB", (px * 4, px * 4))  # thumbnails only: DCT downscale is plenty
    elif max(full) > DECODE_MAX_PX:
        im.draft("RGB", (DECODE_MAX_PX, DECODE_MAX_PX))
    a = np.asarray(im.convert("RGB"))
    valid = a.max(axis=2) > PADDING_MAX
    for _ in range(PADDING_GROW):  # 4-neighbour erosion of the valid mask
        v = valid.copy()
        v[1:] &= valid[:-1]
        v[:-1] &= valid[1:]
        v[:, 1:] &= valid[:, :-1]
        v[:, :-1] &= valid[:, 1:]
        valid = v
    rgba = Image.fromarray(np.dstack([a, valid.astype(np.uint8) * 255]), "RGBA")
    del a, valid
    if rgba.size != (px, px):
        rgba = rgba.resize((px, px), Image.LANCZOS)  # Pillow resizes RGBA premultiplied
    b = np.asarray(rgba)
    out = fill_padding(b[..., :3], b[..., 3] >= 128)
    return Image.fromarray(out, "RGB"), full


# --- external tools ------------------------------------------------------------------------------

def run(cmd, **kw):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True, **kw)
    if r.returncode != 0:
        raise BuildError(f"command failed ({r.returncode}): {' '.join(map(str, cmd))}\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}")
    return r.stdout + r.stderr


def tool_versions():
    if not GLTFPACK.exists():
        raise BuildError(f"{GLTFPACK} missing: run npm install in site/ (gltfpack {GLTFPACK_VERSION})")
    if not shutil.which("basisu"):
        raise BuildError("basisu missing: brew install basis_universal (Basis Universal 2.50, Apache-2.0)")
    try:
        import xatlas  # noqa: F401  (the preview's UV atlas)
    except ImportError:
        raise BuildError("xatlas missing: pip install xatlas (MIT)")
    gp = run([GLTFPACK, "-v"]).splitlines()[0].strip()
    bu = re.search(r"v(\d+\.\d+\.\d+)", run(["basisu", "-version"]))
    return {"gltfpack": gp.replace("gltfpack ", ""), "basisu": bu.group(1) if bu else "unknown"}


def encode_ktx2(png, out, q=ETC1S_QUALITY):
    run(["basisu", "-ktx2", "-mipmap", "-srgb", "-q", q, "-comp_level", ETC1S_COMP_LEVEL,
         "-file", png, "-output_file", out])


# --- build -----------------------------------------------------------------------------------------

def strip_vertex_colours(obj):
    """RealityCapture may append per-vertex colours ("v x y z r g b"); they would tint the texture
    (glTF COLOR_0 multiplies base colour), so keep positions only."""
    with open(obj, "rb") as f:
        head = f.read(1 << 16)
    first = re.search(rb"^v (.+)$", head, re.M)
    if not first or len(first.group(1).split()) <= 3:
        return
    tmp = obj.with_suffix(".tmp")
    with open(obj, "rb") as src, open(tmp, "wb") as dst:
        for line in src:
            if line.startswith(b"v "):
                parts = line.split()
                line = b" ".join(parts[:4]) + b"\n"
            dst.write(line)
    tmp.replace(obj)


def extract(zip_path, work):
    """Unpack the owner zip; nested source/*.zip (original format) are unpacked in place."""
    src = work / "src"
    with zipfile.ZipFile(zip_path) as z:
        z.extractall(src)
    for inner in list(src.glob("source/*.zip")):
        with zipfile.ZipFile(inner) as z:
            z.extractall(inner.parent)
        inner.unlink()
    objs = sorted(src.glob("source/*.obj"))
    if objs:
        obj = objs[0]
        strip_vertex_colours(obj)
        mtl_name = re.search(rb"^mtllib\s+(.+?)\s*$", obj.read_bytes()[:4096], re.M).group(1).decode()
        tex = re.findall(r"^map_Kd\s+(.+?)\s*$", (obj.parent / mtl_name).read_text(), re.M)
        return {"format": "OBJ (RealityCapture)", "kind": "obj", "path": obj, "mtl": obj.parent / mtl_name,
                "textures": [obj.parent / t for t in tex], "src": src}
    gltfs = sorted(src.glob("*.gltf"))
    if gltfs:
        g = json.loads(gltfs[0].read_text())
        return {"format": f"glTF ({g['asset'].get('generator', 'unknown generator')})", "kind": "gltf",
                "path": gltfs[0], "textures": [gltfs[0].parent / im["uri"] for im in g["images"]], "src": src}
    raise BuildError(f"{zip_path}: no original OBJ in source/ and no glTF found")


def gltfpack_input(source, ktx2s, device_dir):
    """A copy of the source description whose textures point at the encoded KTX2 files."""
    if source["kind"] == "obj":
        mtl = source["mtl"].read_text()
        names = re.findall(r"^map_Kd\s+(.+?)\s*$", mtl, re.M)
        for name, k in zip(names, ktx2s):  # relative: the OBJ loader joins it to the .mtl folder
            mtl = mtl.replace(f"map_Kd {name}", f"map_Kd {os.path.relpath(k, source['mtl'].parent)}")
        source["mtl"].write_text(mtl)
        return source["path"]
    g = json.loads(source["path"].read_text())
    for im, k in zip(g["images"], ktx2s):
        im["uri"] = os.path.relpath(k, source["path"].parent)
        im["mimeType"] = "image/ktx2"
    for mesh in g["meshes"]:  # unlit scan: normals are never used, drop them from the download
        for prim in mesh["primitives"]:
            prim["attributes"].pop("NORMAL", None)
            prim["attributes"].pop("TANGENT", None)
    p = source["path"].parent / f"scene.{device_dir.name}.gltf"
    p.write_text(json.dumps(g))
    return p


def patch_bundle(glb, matrix, credit, scan_id):
    """Declare KHR_texture_basisu + KHR_materials_unlit, add the room's root matrix and credit."""
    gltf, binc = read_glb(glb)
    for i, im in enumerate(gltf.get("images", [])):
        if im.get("mimeType") != "image/ktx2" or "bufferView" not in im:
            raise BuildError(f"{scan_id}: image {i} in {glb.name} was not embedded as KTX2 ({str(im)[:80]})")
    for t in gltf.get("textures", []):
        src = t.pop("source", None)
        if src is not None and gltf["images"][src].get("mimeType") == "image/ktx2":
            t.setdefault("extensions", {})["KHR_texture_basisu"] = {"source": src}
    has_tex = any("KHR_texture_basisu" in t.get("extensions", {}) for t in gltf.get("textures", []))
    for mat in gltf.get("materials", []):
        mat.setdefault("extensions", {})["KHR_materials_unlit"] = {}
        mat.setdefault("pbrMetallicRoughness", {}).update({"metallicFactor": 0, "roughnessFactor": 1})
    used = set(gltf.get("extensionsUsed", [])) | {"KHR_materials_unlit"}
    req = set(gltf.get("extensionsRequired", []))
    if has_tex:
        used.add("KHR_texture_basisu")
        req.add("KHR_texture_basisu")
    gltf["extensionsUsed"] = sorted(used)
    if req:
        gltf["extensionsRequired"] = sorted(req)
    scene = gltf["scenes"][gltf.get("scene", 0)]
    gltf["nodes"].append({"name": f"scan:{scan_id}", "matrix": matrix, "children": scene["nodes"]})
    scene["nodes"] = [len(gltf["nodes"]) - 1]
    gltf["asset"]["copyright"] = credit
    write_glb(glb, gltf, binc)
    return gltf


def credit_for(scan_id, source, crops=()):
    s = SCANS[scan_id]
    if s.get("credit_verbatim"):
        lic = source["src"] / "license.txt"
        if lic.exists() and s["credit_verbatim"] not in lic.read_text():
            raise BuildError(f"{scan_id}: license.txt credit wording differs from the recorded verbatim credit")
        base = s["credit_verbatim"]
    else:
        base = (f'This work is based on "{s["title"]}" ({s["sketchfab_url"]}) by {s["author"]} ({s["author_url"]}) '
                f"licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)")
    extra = f" {s['extra_credit']}" if s.get("extra_credit") else ""
    return f"{base}.{extra} {changes_for(crops)}"


def credit_source(scan_id):
    """How the credit wording was verified (recorded in the manifest)."""
    s = SCANS[scan_id]
    if s.get("credit_verbatim"):
        return ("license.txt inside the owner's Sketchfab download (zip pinned by source_sha256): credit wording "
                "copied verbatim and re-checked against the zip at every build")
    text = (f"Sketchfab Data API https://api.sketchfab.com/v3/models/{s['uid']} fields name, user.displayName, "
            f"user.username and license, read {API_READ_DATE}")
    if s.get("extra_credit"):
        text += f"; scan credit quoted from that model's description field: \"{s['extra_credit'].rstrip('.')}\""
    return text


def load_manifest(scan_id):
    p = MANIFESTS / f"{scan_id}.json"
    return json.loads(p.read_text()) if p.exists() else {}


def build_preview(scan_id, pos, faces, uv, face_tex, images, out_dir, work, matrix, credit, src_tris, log=print):
    """Write out_dir/room.glb (the sharp preview) and return its manifest entry."""
    import numpy as np
    px = PREVIEW["texture_px"]
    pdir = work / "preview"
    pdir.mkdir()
    src = pdir / "positions.obj"
    with open(src, "w") as f:
        for v in pos:
            f.write(f"v {v[0]:.5f} {v[1]:.5f} {v[2]:.5f}\n")
        for t in faces + 1:
            f.write(f"f {t[0]} {t[1]} {t[2]}\n")
    ratio = min(1.0, PREVIEW["target_tris"] / len(faces))
    # Positions only: no UV seams, so the mesh welds into one surface and the topology-aware
    # simplifier can reach the target with a bounded error (sloppy -sa only if it cannot).
    out = run([GLTFPACK, "-i", src, "-o", pdir / "simple.glb", "-si", f"{ratio:.6f}", "-se", PREVIEW["max_error"], "-noq", "-v"])
    m = re.search(r"output: \d+ mesh primitives \((\d+) triangles", out)
    sloppy = bool(m and int(m.group(1)) > PREVIEW["target_tris"] * 1.5)
    if sloppy:
        run([GLTFPACK, "-i", src, "-o", pdir / "simple.glb", "-si", f"{ratio:.6f}", "-sa", "-noq"])
    g, b = read_glb(pdir / "simple.glb")
    ppos, pfaces = world_triangles(g, b)
    vmap, nf, nuv = atlas_uvs(ppos, pfaces, px)
    npos = ppos[vmap]
    img = bake_texture(npos, nf, nuv, pos, faces, uv, face_tex, images, px)
    from PIL import Image
    Image.fromarray(img).save(pdir / "t0.png")
    encode_ktx2(pdir / "t0.png", pdir / "t0.ktx2")
    obj = pdir / "preview.obj"
    (pdir / "preview.mtl").write_text("newmtl preview\nmap_Kd t0.ktx2\n")
    with open(obj, "w") as f:
        f.write("mtllib preview.mtl\nusemtl preview\n")
        for v in npos:
            f.write(f"v {v[0]:.5f} {v[1]:.5f} {v[2]:.5f}\n")
        for u, v in nuv:  # OBJ v runs up from the image bottom
            f.write(f"vt {u:.6f} {1 - v:.6f}\n")
        for t in nf + 1:
            f.write(f"f {t[0]}/{t[0]} {t[1]}/{t[1]} {t[2]}/{t[2]}\n")
    out_dir.mkdir(parents=True, exist_ok=True)
    run([GLTFPACK, "-i", obj, "-o", out_dir / "room.glb", "-cc", "-vp", 12, "-vt", 11])
    gl = patch_bundle(out_dir / "room.glb", matrix, credit, scan_id)
    tris, geo_bytes = glb_stats(gl)
    nbytes = (out_dir / "room.glb").stat().st_size
    check_budget(scan_id, "preview", nbytes)
    tex_gpu = int(px * px * GPU_BYTES_PER_TEXEL["preview"] * 4 / 3)
    log(f"{scan_id} preview: {nbytes} bytes, {tris} tris")
    return {"file": shipped_name(scan_id, "preview", out_dir / "room.glb"), "bytes": nbytes, "sha256": sha256_file(out_dir / "room.glb"),
            "gpu_bytes": tex_gpu + geo_bytes, "tris": tris, "texture_px": px,
            "texture_format": f"KTX2 ETC1S (basisu -q {ETC1S_QUALITY}, mipmaps, sRGB), baked on a new UV atlas (xatlas)",
            "simplify": f"gltfpack -si {ratio:.6f} {'-sa' if sloppy else '-se ' + str(PREVIEW['max_error'])} on welded positions (from {src_tris} tris), re-atlased and re-baked"}


def build(scan_id, source_dir, work_root, pin=False, log=print):
    cfg = SCANS[scan_id]
    old = load_manifest(scan_id)
    if old.get("usable", True) is False:
        raise BuildError(f"{scan_id} is marked unusable in content/scans/{scan_id}.json "
                         f"({old.get('unusable_reason')}); it is never built")
    crops = old.get("crops") or []
    zip_path = locate_source(scan_id, source_dir)
    digest = verify_source(scan_id, zip_path, old, pin=pin)
    versions = tool_versions()
    work = Path(tempfile.mkdtemp(prefix=f"scan-{scan_id}-", dir=work_root))
    try:
        source = extract(zip_path, work)
        log(f"{scan_id}: {source['format']}, {len(source['textures'])} texture(s)")

        # 1. world positions (uncompressed float pass) -> room frame, occluder input
        flat = work / "flat.glb"
        run([GLTFPACK, "-i", source["path"], "-o", flat, "-noq", "-tr"])
        gltf, binc = read_glb(flat)
        pos, faces, uv, face_img = world_triangles(gltf, binc, with_uv=True)
        frame = room_frame(pos, cfg["up"], faces)
        height = frame["ceiling"] - frame["floor"]
        scale = cfg["scale"]
        matrix = root_matrix(frame, cfg["up"], scale)
        log(f"{scan_id}: walls turned {frame['yaw_deg']:.2f} deg to the axes (left {frame['walls_off_axis_deg']:.2f} deg off)")
        old_matrix = (old.get("transform") or {}).get("root_matrix")
        if crops and old_matrix:
            crops = migrate_crops(crops, old_matrix, matrix)
        # artwork crops: triangles inside each box, and which source texture each one samples
        import numpy as np
        names = [Path(t).name for t in source["textures"]]
        face_tex = np.array([names.index(Path(u).name) if u and Path(u).name in names else -1 for u in face_img])
        selected = {}
        if crops:
            selected = select_crop_faces(to_room(pos, matrix), faces, crops)
            log(f"{scan_id}: crops " + ", ".join(f"{k} {len(v)} tris" for k, v in selected.items()))
        log(f"{scan_id}: floor {frame['floor']:.3f}, ceiling {frame['ceiling']:.3f} (source units), scale {scale:.4f}")

        staged = work / "staged"
        # 2. occluder: positions only, aggressively simplified
        occ_obj = work / "occluder.obj"
        with open(occ_obj, "w") as f:
            for v in pos:
                f.write(f"v {v[0]:.5f} {v[1]:.5f} {v[2]:.5f}\n")
            for t in faces + 1:
                f.write(f"f {t[0]} {t[1]} {t[2]}\n")
        staged.mkdir()
        ratio = min(1.0, OCCLUDER_TARGET_TRIS / len(faces))
        run([GLTFPACK, "-i", occ_obj, "-o", staged / "occluder.glb", "-cc", "-si", f"{ratio:.6f}", "-sa"])
        occ_gltf = patch_bundle(staged / "occluder.glb", matrix, credit_for(scan_id, source, crops), scan_id)
        occ_tris, _ = glb_stats(occ_gltf)
        if occ_tris > OCCLUDER_MAX_TRIS:
            raise BuildError(f"{scan_id}: occluder has {occ_tris} tris, over {OCCLUDER_MAX_TRIS}")
        del gltf, binc

        # 3. colour parameters from small copies of every texture
        thumbs = [load_resized(t, 512)[0] for t in source["textures"]]
        colour = colour_params(thumbs)
        full_px = load_resized(source["textures"][0], 64)[1][0]
        del thumbs
        log(f"{scan_id}: colour {colour['gains_rgb']} gamma {colour['gamma']}")

        credit = credit_for(scan_id, source, crops)
        bundles = {}
        src_tris = None
        bake_images = None
        for device in ("desktop", "phone"):
            dcfg = cfg["devices"][device]
            ddir = staged / device
            tdir = work / f"tex-{device}"
            ddir.mkdir()
            tdir.mkdir()
            ktx2s = []
            texels = {c["id"]: 0 for c in crops}
            for i, t in enumerate(source["textures"]):
                im, _ = load_resized(t, dcfg["texture_px"])
                if selected:
                    im, n = mask_crops(im, uv, faces, face_tex, selected, i)
                    for k, v in n.items():
                        texels[k] += v
                png = tdir / f"t{i}.png"
                im = apply_colour(im, colour)
                if device == "phone":  # the preview's texture is baked from these (masked, corrected)
                    bake_images = (bake_images or []) + [im]
                im.save(png, compress_level=1)
                k = tdir / f"t{i}.ktx2"
                encode_ktx2(png, k, dcfg.get("etc1s_q", ETC1S_QUALITY))
                png.unlink()
                ktx2s.append(k)
            inp = gltfpack_input(source, ktx2s, ddir)
            out = run([GLTFPACK, "-i", inp, "-o", ddir / "room.glb", "-cc", "-si", dcfg["ratio"], "-slb",
                       "-vp", 14, "-vt", 14, "-v"])
            m = re.search(r"input: \d+ mesh primitives \((\d+) triangles", out)
            src_tris = int(m.group(1)) if m else src_tris
            for k, v in texels.items():
                if not v:
                    raise BuildError(f"{scan_id} {device}: crop box {k} masked no texel")
            g = patch_bundle(ddir / "room.glb", matrix, credit, scan_id)
            tris, geo_bytes = glb_stats(g)
            tex_gpu = int(len(ktx2s) * dcfg["texture_px"] ** 2 * GPU_BYTES_PER_TEXEL[device] * 4 / 3)
            nbytes = (ddir / "room.glb").stat().st_size
            bundles[device] = {
                "file": shipped_name(scan_id, device, ddir / "room.glb"), "bytes": nbytes,
                "sha256": sha256_file(ddir / "room.glb"), "gpu_bytes": tex_gpu + geo_bytes,
                "gpu_texture_bytes": tex_gpu, "gpu_geometry_bytes": geo_bytes, "tris": tris,
                "textures": len(ktx2s), "texture_px": dcfg["texture_px"],
                "texture_format": f"KTX2 ETC1S (basisu -q {dcfg.get('etc1s_q', ETC1S_QUALITY)}, mipmaps, sRGB)",
                "simplify_ratio": dcfg["ratio"],
            }
            if crops:
                bundles[device]["crops_sha256"] = crops_sha256(crops)
                bundles[device]["crops_applied"] = {k: {"faces": int(len(selected[k])), "texels": texels[k]} for k in selected}
            log(f"{scan_id} {device}: {nbytes} bytes, {tris} tris, gpu {tex_gpu + geo_bytes}")
            shutil.rmtree(tdir)

        # 5. sharp preview: the mesh simplified hard (positions only), a fresh UV atlas on it (xatlas),
        #    and a small texture baked from the phone texture (corrected, crops masked), so the UV
        #    charts of the scan never limit how far the mesh can be simplified and nothing tears.
        previous = build_preview(scan_id, pos, faces, uv, face_tex, bake_images, staged / "preview", work, matrix, credit, src_tris, log)
        if crops:
            previous["crops_sha256"] = crops_sha256(crops)

        manifest = {
            "id": scan_id, "title": cfg["title"], "place": cfg["place"], "publisher": cfg["publisher"],
            "sketchfab_url": cfg["sketchfab_url"], "uid": cfg["uid"], "licence": LICENCE, "licence_url": LICENCE_URL,
            "credit": credit, "credit_source": credit_source(scan_id), "changes": changes_for(crops),
            "label": f"3D scan of {cfg['place']} ({cfg['author']}, {LICENCE}).",
            "source_file": cfg["zip"], "source_sha256": digest,
            "source": {"format": source["format"], "textures": len(source["textures"]), "texture_px": full_px,
                       "tris": src_tris, "source_tris_capped": src_tris >= SKETCHFAB_TRI_CAP_MIN},
            "transform": {"up": cfg["up"], "scale": round(scale, 6),
                          "scale_note": cfg["scale_note"],
                          "floor_y": 0, "levelled_by_deg": frame["tilt_deg"], "ceiling_m": round(height * scale, 3),
                          "extent_m": [round(e * scale, 3) for e in frame["extent"]],
                          "yaw_deg": frame["yaw_deg"], "walls_off_axis_deg": frame["walls_off_axis_deg"],
                          "root_matrix": matrix},
            "colour": colour,
            "bundles": bundles,
            "preview": previous,
            "occluder": {"file": shipped_name(scan_id, "occluder", staged / "occluder.glb"), "bytes": (staged / "occluder.glb").stat().st_size,
                         "sha256": sha256_file(staged / "occluder.glb"), "tris": occ_tris},
            "budgets": BUDGETS, "preview_max_bytes": PREVIEW_MAX_BYTES,
            "downloads": None,
            "tooling": versions,
            "artworks": old.get("artworks") if "artworks" in old else [
                {"label": a["label"], "artist": None, "died": None, "status": "blocked", "evidence_url": None}
                for a in cfg.get("artworks", [])],
            "stations": old.get("stations", []),
            "crops": crops,
            # the inventory review stays tied to the source it looked at (inventory_errors)
            **{k: old[k] for k in ("inventory_reviewed", "art_free", "art_free_reason") if k in old},
        }
        manifest["downloads"] = {d: room_download(manifest, d) for d in DEVICES}
        for d in DEVICES:
            check_budget(scan_id, d, manifest["downloads"][d])
        publish(scan_id, staged, OUT, manifest=manifest, manifest_dir=MANIFESTS)
        return manifest
    finally:
        shutil.rmtree(work, ignore_errors=True)


def check(scan_id, source_dir, public=ROOT / "site" / "public"):
    """(errors, notes). An absent source is a note, not an error: CI has no owner files."""
    m = load_manifest(scan_id)
    if not m:
        return [f"content/scans/{scan_id}.json missing"], []
    errors = manifest_errors(m, Path(public))
    if m.get("usable", True) is False:
        return errors, [f"unusable, not shipped: {m.get('unusable_reason')}"]
    path = Path(source_dir) / SCANS[scan_id]["zip"]
    notes = []
    if not path.exists():
        notes.append("source not present: sha256 not verified")
    else:
        try:
            verify_source(scan_id, path, m)
            notes.append("source sha256 verified")
        except BuildError as e:
            errors.append(str(e))
    return errors, notes


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("id", help="scan id, or 'all'")
    ap.add_argument("--check", action="store_true", help="validate manifest and shipped bundles; no rebuild")
    ap.add_argument("--source-dir", default=str(DEFAULT_SOURCE_DIR))
    ap.add_argument("--work", default=None, help="scratch directory for intermediates (deleted after)")
    ap.add_argument("--pin-source", action="store_true", help="record the source sha256 on first ingest")
    args = ap.parse_args(argv)
    ids = list(SCANS) if args.id == "all" else [args.id]
    status = 0
    for scan_id in ids:
        try:
            if scan_id not in SCANS:
                raise BuildError(f"unknown scan id {scan_id!r}; known: {', '.join(SCANS)}")
            if args.check:
                errors, notes = check(scan_id, args.source_dir)
                for n in notes:
                    print(f"{scan_id}: {n}")
                for e in errors:
                    print(f"{scan_id}: {e}", file=sys.stderr)
                status |= bool(errors)
            else:
                build(scan_id, args.source_dir, args.work, pin=args.pin_source)
        except BuildError as e:
            print(f"error: {e}", file=sys.stderr)
            status = 1
    if args.check:
        # what ships is checked as a whole too: no file under scans/ or study/ outside a reviewed record
        for e in shipped_asset_errors():
            print(f"shipped: {e}", file=sys.stderr)
            status = 1
    return status


if __name__ == "__main__":
    sys.exit(main())
