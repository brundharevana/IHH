"""Build gate: the pixels inside shipped models and photo rooms come only from cleared sources.

Every source folder that ships files declares, in assets-src/<folder>/meta.json:
  ships               path prefixes under app/public it produces (default: models/<folder>/)
  texturesFrom        the media records whose pixels are in those files: {"media": id, "what": ...,
                      "files"?: prefix}, or an owner-ruled item without its own record:
                      {"ruling": key of TEXTURE_RULINGS, "inherits": id, "items": [SOURCES.md rows]}
  thirdPartyTextures  texture libraries used ({"name", "source", "licence"})
  notTextures         records named in SOURCES.md whose pixels are not used (modelling references)

The build fails (exit 1) when
  - a shipped .glb, or a photo-room image under rooms/ or rooms-demo/, is claimed by no declaration or
    by more than one;
  - a texture record is not in facts.generated.json as embeddable (verified; public domain, CC0 or CC BY;
    not ruled reference only), or a ruled item's ruling is unknown or its record is not embeddable;
  - a third-party texture's licence is not cc0, cc-by, public-domain or mit (asset libraries, credited
    in app/CREDITS.md);
  - a store record named in the folder's SOURCES.md is neither a texture source nor listed in
    notTextures (every record must be classed on purpose), or is listed as both;
  - a photo room's files (the `backdrop` of its photograph's record in the tour data's record store,
    data/*-artifacts.js) are files whose declaration does not list that record as its texture source;
    or a place in the tour data names its photo room's files itself (mediaId + src: the files belong
    to the record, round 9 fix round 7);
  - any file under app/public whose name carries a media id is not embeddable.
  - (bytes) a shipped glb's embedded images are not exactly the ones recorded for it in its folder's
    meta.json `embeddedImages` (sha256 of each image buffer, written at finalize by `--record`), or
    an image is an external or data URI instead of a buffer in the file;
  - any image under app/public (not only models and photo rooms) is neither named for a cleared
    record nor claimed by a declaration.

What the bytes check proves, and what it cannot: it proves the images shipped in each glb are the
ones recorded, with their room's declared sources, when the room was finalized; nothing can be
swapped in or added afterwards without failing the build. It cannot prove from the bytes alone that a
baked texture came from a given photograph: every room's images are bake outputs (light baked into
atlases) re-encoded to WebP by finalize, so no embedded image is byte-equal to the texture script's
outputs (tex/gen) or to a source photograph. The link from an image to its source rests on the
folder's declaration, its SOURCES.md and its build scripts (app/README.md, data/export/METHOD.md).

Run from anywhere:
  python3 app/scripts/check_textures.py              check (the build's prebuild gate)
  python3 app/scripts/check_textures.py --record M   after finalize: record the embedded images of the
                                                     glbs the meta.json M ships (a re-baseline of a glb
                                                     already recorded needs --rebaseline --reason "<why>",
                                                     or IHH_REBASELINE_REASON set for finalize; logged in
                                                     assets-src/app-public/record-log.jsonl)
"""
import hashlib
import json
import os
import re
import struct
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_fact_index import TEXTURE_RULINGS  # noqa: E402  the owner's texture rulings live with the index rules

REPO = Path(__file__).resolve().parents[2]
STORE_ID = re.compile(r"\b[A-Z]{3}-M-\d{4}\b")
THIRD_PARTY_OK = {"cc0", "cc-by", "public-domain", "mit"}
# a record's photo room files: `id: 'X', [comment lines] backdrop: { ... }` (single or double quoted keys)
PHOTO_ROOM = re.compile(r"""["']?id["']?:\s*["']([A-Z]{3}-M-\d{4})["'],\s*(?://[^\n]*\n\s*)*["']?backdrop["']?:\s*\{([^}]*)\}""")
# the old shape, a place naming its files beside the record id (the files must come from the record)
PLACE_FILES = re.compile(r"mediaId:\s*'([A-Z]{3}-M-\d{4})',\s*src:\s*\{")


def declarations(repo):
    out = []
    for meta in sorted((repo / "assets-src").glob("*/meta.json")):
        m = json.loads(meta.read_text(encoding="utf-8"))
        if "texturesFrom" not in m:
            continue
        folder = meta.parent.name
        out.append({"folder": folder, "meta": m, "ships": m.get("ships") or [f"models/{folder}/"]})
    return out


IMAGE = re.compile(r"\.(webp|jpe?g|png|gif|svg|avif)$", re.I)


def shipped_files(public):
    """Every glb, and every image not named for a store record (those are checked by name)."""
    files = []
    for p in sorted(public.rglob("*")):
        if not p.is_file():
            continue
        rel = p.relative_to(public).as_posix()
        if rel.endswith(".glb") or (IMAGE.search(rel) and not STORE_ID.search(p.name)):
            files.append(rel)
    return files


def glb_images(path):
    """[{index, name, mimeType, bytes, sha256}] of the images in a .glb; an image given by URI (external
    file or data URI) is listed with `uri` and no hash."""
    data = Path(path).read_bytes()
    magic, _version, length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF":
        raise ValueError(f"{path}: not a binary glTF")
    doc, binary, i = None, b"", 12
    while i < min(length, len(data)):
        clen, ctype = struct.unpack_from("<II", data, i)
        chunk = data[i + 8:i + 8 + clen]
        if ctype == 0x4E4F534A:
            doc = json.loads(chunk.decode("utf-8"))
        elif ctype == 0x004E4942:
            binary = chunk
        i += 8 + clen
    out = []
    for k, img in enumerate((doc or {}).get("images", [])):
        entry = {"index": k, "name": img.get("name"), "mimeType": img.get("mimeType")}
        if "bufferView" in img:
            bv = doc["bufferViews"][img["bufferView"]]
            buf = binary[bv.get("byteOffset", 0):bv.get("byteOffset", 0) + bv["byteLength"]]
            entry.update(bytes=len(buf), sha256=hashlib.sha256(buf).hexdigest())
        else:
            entry["uri"] = (img.get("uri") or "")[:60]
        out.append(entry)
    return out


def _sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def generator_of(folder):
    """The scripts that build a folder's textures and models, and the inputs they read (ref/ downloads,
    tex/ libraries and generated textures), each with its sha256; None for a folder with no script."""
    folder = Path(folder)
    # the scripts that make textures and models (not previews, fetchers or tests)
    scripts = sorted(f for f in [*folder.glob("*.py"), *folder.glob("tools/finalize.mjs")]
                     if re.match(r"(build_|make_|roomkit|plan|finalize)", f.name))
    if not scripts:
        return None
    rel = lambda f: f.relative_to(folder).as_posix()  # noqa: E731
    inputs = sorted(f for d in ("ref", "tex") for f in (folder / d).rglob("*") if f.is_file() and not f.name.startswith("."))
    return {"scripts": {rel(f): _sha(f) for f in scripts}, "inputs": {rel(f): _sha(f) for f in inputs}}


def record(meta_path, public=None, rebaseline=False, reason=None, log=None):
    """Write `embeddedImages` (every shipped glb of this folder -> its images) and `generator` (the
    folder's scripts and inputs, with hashes) into meta.json. Refuses (ValueError) a folder that does not
    declare its texture sources: no baseline is ever set for an undeclared image. Refuses a re-baseline
    (a glb already recorded whose images or generator would change, or that would be dropped) unless
    `rebaseline` and a `reason` are given; every write goes to the record log (image_sources.py)."""
    import image_sources
    meta_path = Path(meta_path).resolve()
    public = Path(public) if public else REPO / "app/public"
    m = json.loads(meta_path.read_text(encoding="utf-8"))
    if "texturesFrom" not in m:
        raise ValueError(f"{meta_path}: no texturesFrom declaration; declare the texture sources before recording")
    ships = m.get("ships") or [f"models/{meta_path.parent.name}/"]
    glbs = [f for f in shipped_files(public) if f.endswith(".glb") and any(f.startswith(s) for s in ships)]
    images = {f: glb_images(public / f) for f in glbs}
    gen = generator_of(meta_path.parent)
    old = {**(m.get("embeddedImages") or {}), **({"(generator)": m["generator"]} if m.get("generator") else {})}
    new = {**images, **({"(generator)": gen} if gen and glbs else {})}
    try:
        inside = meta_path.is_relative_to(REPO)
        image_sources.guard_rebaseline("check_textures.py --record", meta_path.relative_to(REPO) if inside else meta_path, old, new,
                                       rebaseline, reason, log or (image_sources.RECORD_LOG if inside else meta_path.parent / "record-log.jsonl"))
    except image_sources.Refused as e:
        raise ValueError(str(e)) from None
    m["embeddedImages"] = images
    if gen and glbs:
        m["generator"] = gen
    meta_path.write_text(json.dumps(m, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return glbs


def check(repo, index, rulings=TEXTURE_RULINGS):
    errs = []
    media = index["media"]
    public = repo / "app/public"
    decls = declarations(repo)

    def embeddable(mid):
        return bool(media.get(mid, {}).get("embeddable"))

    for f in shipped_files(public):
        owners = [d for d in decls if any(f.startswith(s) for s in d["ships"])]
        if not owners:
            errs.append(f"{f}: no assets-src/<folder>/meta.json declares where its textures come from")
        elif len(owners) > 1:
            errs.append(f"{f}: claimed by more than one declaration ({', '.join(d['folder'] for d in owners)})")
        elif f.endswith(".glb"):
            tag = f"{f} (assets-src/{owners[0]['folder']}/meta.json)"
            have = glb_images(public / f)
            for img in have:
                if "uri" in img:
                    errs.append(f"{tag}: image {img['index']} is a URI ({img['uri']}), not a buffer in the file")
            recorded = (owners[0]["meta"].get("embeddedImages") or {}).get(f)
            if recorded is None:
                errs.append(f"{tag}: its embedded images are not recorded (run check_textures.py --record after finalize)")
            elif [i.get("sha256") for i in have] != [i.get("sha256") for i in recorded]:
                errs.append(f"{tag}: its embedded images differ from the ones recorded at finalize "
                            f"({len(have)} in the file, {len(recorded)} recorded); re-check the sources and record again")

    for d in decls:
        folder, m = d["folder"], d["meta"]
        tag = f"assets-src/{folder}/meta.json"
        # the scripts that made the shipped glbs, and their inputs, are the recorded ones (inputs are
        # compared where this checkout has them: ref/ downloads are kept out of git)
        gen = m.get("generator")
        if gen:
            base = repo / "assets-src" / folder
            for f, h in gen.get("scripts", {}).items():
                if not (base / f).is_file():
                    errs.append(f"{tag}: generator script {f} is missing")
                elif _sha(base / f) != h:
                    errs.append(f"{tag}: generator script {f} changed since the glbs were finalized; rebuild and finalize again")
            for f, h in gen.get("inputs", {}).items():
                if (base / f).is_file() and _sha(base / f) != h:
                    errs.append(f"{tag}: texture input {f} changed since the glbs were finalized; rebuild and finalize again")
        elif m.get("embeddedImages") and any(m["embeddedImages"].values()) and generator_of(repo / "assets-src" / folder):
            errs.append(f"{tag}: its glbs' generator (scripts and input hashes) is not recorded (finalize records it)")
        textured = set()
        for e in m["texturesFrom"]:
            if "ruling" in e:
                r = rulings.get(e["ruling"])
                if not r:
                    errs.append(f"{tag}: texture ruling {e['ruling']!r} is not an owner ruling (TEXTURE_RULINGS)")
                    continue
                if e.get("inherits") not in r["inherits"]:
                    errs.append(f"{tag}: ruling {e['ruling']} does not cover record {e.get('inherits')}")
                    continue
                if not embeddable(e["inherits"]):
                    errs.append(f"{tag}: ruled texture items inherit {e['inherits']}, which is not verified and cleared")
                textured.add(e["inherits"])
                sources = repo / "assets-src" / folder / "SOURCES.md"
                text = sources.read_text(encoding="utf-8") if sources.exists() else ""
                for item in e.get("items", []):
                    if f"| {item} |" not in text:
                        errs.append(f"{tag}: ruled item {item!r} is not a row of SOURCES.md")
            elif "media" in e:
                mid = e["media"]
                textured.add(mid)
                if mid not in media:
                    errs.append(f"{tag}: texture source {mid} is not a verified record")
                elif not embeddable(mid):
                    why = media[mid].get("referenceOnly") or f"licence class {media[mid].get('rights')}"
                    errs.append(f"{tag}: texture source {mid} is not cleared ({why})")
            else:
                errs.append(f"{tag}: texture entry {e!r} names no media record and no ruling")
            if e.get("files") and not any(e["files"].startswith(s) or s.startswith(e["files"]) for s in d["ships"]):
                errs.append(f"{tag}: entry for {e.get('media') or e.get('ruling')} names files {e['files']} the folder does not ship")
        for t in m.get("thirdPartyTextures", []):
            if t.get("licence") not in THIRD_PARTY_OK:
                errs.append(f"{tag}: third-party texture {t.get('name')!r} has licence {t.get('licence')!r}")
        not_tex = set(m.get("notTextures", []))
        for mid in sorted(textured & not_tex):
            errs.append(f"{tag}: {mid} is listed both as a texture source and in notTextures")
        sources = repo / "assets-src" / folder / "SOURCES.md"
        if sources.exists():
            for mid in sorted(set(STORE_ID.findall(sources.read_text(encoding="utf-8"))) - textured - not_tex):
                errs.append(f"{tag}: {mid} is named in SOURCES.md but is neither in texturesFrom nor in notTextures")

    by_file = {}
    for d in decls:
        for e in d["meta"]["texturesFrom"]:
            if "media" in e:
                by_file.setdefault(d["folder"], []).append(e)
    for js in sorted((repo / "app/src/tour/data").glob("*.js")):
        if js.name.endswith(".test.js"):
            continue
        text = js.read_text(encoding="utf-8")
        for mid in PLACE_FILES.findall(text):
            errs.append(f"{js.relative_to(repo)}: the photo room of {mid} names its files in the place; they belong on the record (backdrop)")
        for mid, block in PHOTO_ROOM.findall(text):
            for src in re.findall(r"""["']/([^"']+)["']""", block):
                owners = [d for d in decls if any(src.startswith(s) for s in d["ships"])]
                ok = any(e["media"] == mid and (not e.get("files") or src.startswith(e["files"]))
                         for d in owners for e in by_file.get(d["folder"], []))
                if not ok:
                    errs.append(f"{js.relative_to(repo)}: photo room {mid} uses /{src}, but its declaration does not list {mid} as its texture source")

    for p in sorted(public.rglob("*")):
        if p.is_file():
            for mid in STORE_ID.findall(p.name):
                if not embeddable(mid):
                    errs.append(f"app/public/{p.relative_to(public).as_posix()}: file of media {mid}, which is not verified and cleared")
    # standalone images: each recorded with its declared source, source-file hash and transform
    import image_sources
    errs += image_sources.check(repo, index=index)
    return errs


def main():
    if "--record" in sys.argv[1:]:
        import image_sources
        meta = sys.argv[sys.argv.index("--record") + 1]
        rebaseline, reason = image_sources.rebaseline_args(sys.argv[1:])
        # finalize.mjs runs `--record <meta>` alone: after a rebuild it passes the reason through the
        # environment (IHH_REBASELINE_REASON), which counts as --rebaseline --reason
        if os.environ.get("IHH_REBASELINE_REASON"):
            rebaseline, reason = True, os.environ["IHH_REBASELINE_REASON"]
        try:
            glbs = record(meta, rebaseline=rebaseline, reason=reason)
        except ValueError as e:
            print(f"refused: {e}", file=sys.stderr)
            return 1
        print(f"recorded the embedded images of {len(glbs)} glb(s) in {meta}")
        return 0
    index = json.loads((REPO / "app/src/tour/data/facts.generated.json").read_text(encoding="utf-8"))
    errs = check(REPO, index)
    for e in errs:
        print(e, file=sys.stderr)
    if errs:
        return 1
    print(f"texture gate ok: {len(declarations(REPO))} declarations")
    return 0


if __name__ == "__main__":
    sys.exit(main())
