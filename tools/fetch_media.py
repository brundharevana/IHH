"""Build the exhibit image files in site/public/media/ from the holders' own files.

Reads every content/<slug>/media-files.json ({"files": [{key, media_id, page?, download}]}), and for
each entry: the media record must be verified with a usable licence class; the key must be the media
id (or <id>-p<page>); the download must come over https from the holder's own host. Writes
  site/public/media/<key>.jpg        panel image, long side <= 2048 px
  site/public/media/room/<key>.jpg   room texture, long side <= 768 px (phone texture budget)
and site/public/media/CREDITS.md (holder, credit, verbatim rights statement, download URL, original
size and sha256 per file). Files not listed in any manifest are removed, so nothing unlisted ships.

Usage: python3 tools/fetch_media.py [--cache DIR]   (DIR: reuse or keep downloads, named by sha256 of the URL)
"""
import argparse
import hashlib
import io
import json
import re
import sys
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

from ihh.rights import EMBEDDABLE as USABLE
PANEL_PX, ROOM_PX = 2048, 768
# Holder record host -> hosts that serve that holder's own image files.
HOLDER_FILE_HOSTS = {
    "catalog.archives.gov": {"catalog.archives.gov"},
    "www.loc.gov": {"tile.loc.gov"},
    # UCLA Library Digital Collections serves its images from its own IIIF Image API server (the
    # record's IIIF manifest names iiif.library.ucla.edu/iiif/2/<ark> as the image service).
    "digital.library.ucla.edu": {"iiif.library.ucla.edu"},
}
ROOT = Path(__file__).resolve().parents[1]


def fit(size, cap):
    w, h = size
    s = min(1.0, cap / max(w, h))
    return (round(w * s), round(h * s))


def check_host(record, download):
    holder = urlparse(record.get("url") or "").hostname
    d = urlparse(download)
    if d.scheme != "https" or d.hostname not in HOLDER_FILE_HOSTS.get(holder, set()):
        raise ValueError(f"{record.get('id')}: download {download} is not an https file from the holder of {record.get('url')}")


def check_usable(record):
    if record.get("status") != "verified" or record.get("license_class") not in USABLE:
        raise ValueError(f"{record.get('id')}: not verified with a usable licence")


def check_key(entry):
    mid, page = entry.get("media_id"), entry.get("page")
    if not isinstance(mid, str) or not re.fullmatch(r"[A-Z]{3}-M-\d{4}", mid):
        raise ValueError(f"bad media_id {mid!r}")
    want = f"{mid}-p{page}" if page is not None else mid
    if page is not None and (not isinstance(page, int) or isinstance(page, bool) or page < 1):
        raise ValueError(f"{entry.get('key')}: page must be a positive integer")
    if entry.get("key") != want:
        raise ValueError(f"key {entry.get('key')!r} must be {want!r}")


def fetch(record, url, cache):
    """Download url (checked against the record's holder before and after redirects); cache by sha256 of the url."""
    check_host(record, url)
    key = hashlib.sha256(url.encode()).hexdigest() + (Path(urlparse(url).path).suffix or ".bin")
    if cache and (cache / key).exists():
        return (cache / key).read_bytes()
    req = urllib.request.Request(url, headers={"User-Agent": "IHH-Voices-of-Arrival/1.0 (static museum build)"})
    with urllib.request.urlopen(req, timeout=120) as r:
        check_host(record, r.geturl())  # a redirect must stay on the holder's https host
        data = r.read()
    if cache:
        cache.mkdir(parents=True, exist_ok=True)
        (cache / key).write_bytes(data)
    return data


def _cell(v):
    return str(v if v is not None else "").replace("|", "\\|").replace("\n", " ")


def _save(img, cap, path):
    from PIL import Image

    out = img.resize(fit(img.size, cap), Image.LANCZOS) if max(img.size) > cap else img
    path.parent.mkdir(parents=True, exist_ok=True)
    out.save(path, "JPEG", quality=85 if cap == PANEL_PX else 80, optimize=True, progressive=True)
    return out.size


def main(argv=None):
    from PIL import Image

    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", type=Path)
    a = ap.parse_args(argv)
    out = ROOT / "site" / "public" / "media"
    rows, keep = [], set()
    for manifest in sorted((ROOT / "content").glob("*/media-files.json")):
        slug = manifest.parent.name
        media = {}
        for line in (ROOT / "data" / "inductees" / slug / "media.jsonl").read_text().splitlines():
            if line.strip():
                m = json.loads(line)
                media[m["id"]] = m
        sources = {}
        for line in (ROOT / "data" / "inductees" / slug / "sources.jsonl").read_text().splitlines():
            if line.strip():
                s = json.loads(line)
                sources[s["id"]] = s
        for e in json.loads(manifest.read_text())["files"]:
            check_key(e)
            rec = media.get(e["media_id"])
            if rec is None:
                raise ValueError(f"{e['key']}: unknown media {e['media_id']}")
            check_usable(rec)
            data = fetch(rec, e["download"], a.cache)
            img = Image.open(io.BytesIO(data))
            img = img.convert("L") if img.mode in ("L", "LA", "I;16", "1") else img.convert("RGB")
            panel = _save(img, PANEL_PX, out / f"{e['key']}.jpg")
            _save(img, ROOM_PX, out / "room" / f"{e['key']}.jpg")
            keep.add(f"{e['key']}.jpg")
            holder = sources.get((rec.get("source_ids") or [None])[0], {}).get("institution", "")
            rows.append((e, rec, holder, img.size, panel, hashlib.sha256(data).hexdigest()))
            print(f"{e['key']}: {img.size[0]}x{img.size[1]} -> {panel[0]}x{panel[1]}")
    for d in (out, out / "room"):
        for f in d.glob("*.jpg"):
            if f.name not in keep:
                f.unlink()
                print(f"removed unlisted {f.relative_to(ROOT)}")
    lines = [
        "# Media credits", "",
        "Generated by `tools/fetch_media.py` from `content/<slug>/media-files.json`. Every file is a verified media",
        "record with a usable licence class, downloaded from the holder's own host. `<key>.jpg` is the panel image",
        "(long side <= 2048 px), `room/<key>.jpg` the room texture (long side <= 768 px); both are resized only.", "",
        "| File | Media id | Page | Title | Holder | Holder page | Credit | Rights (holder's wording) | Licence | Download | Original px | sha256 |",
        "|---|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    for e, rec, holder, size, panel, sha in rows:
        lines.append("| " + " | ".join(_cell(v) for v in (
            f"{e['key']}.jpg", rec["id"], e.get("page", ""), rec.get("title"), holder, rec.get("url"), rec.get("credit"),
            rec.get("rights_statement"), rec.get("license_class"), e["download"], f"{size[0]}x{size[1]}", sha)) + " |")
    (out / "CREDITS.md").write_text("\n".join(lines) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
