"""Build the museum room PBR textures in site/public/tex/ from CC0 Poly Haven sources.

Every set below is a Poly Haven texture (licence CC0 1.0, https://polyhaven.com/license). The 1k JPEG
maps are downloaded from Poly Haven's own file host, resized with Lanczos and written as WebP:
  site/public/tex/<set>/<map>-<px>.webp      map: color | normal | arm (AO, roughness, metalness)
The sizes per room and device profile are chosen in site/src/museum/materials.js (ROOM_TEXTURES);
this script writes every size that table may ask for. Colour maps marked `grey` are reduced to
luminance (a tint is applied in the material). Writes site/public/tex/CREDITS.md.

Usage: python3 tools/build_room_textures.py [--cache DIR]
"""
import argparse
import hashlib
import io
import json
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "site" / "public" / "tex"
API = "https://api.polyhaven.com"
HOST = "https://dl.polyhaven.org/"
# set -> Poly Haven id, maps {map: (Poly Haven map key, sizes, options)}
SETS = {
    "parquet": ("herringbone_parquet", {"color": ("Diffuse", (512, 1024), {}), "normal": ("nor_gl", (512, 1024), {}), "arm": ("arm", (256,), {})}),
    "planks": ("wood_floor", {"color": ("Diffuse", (512, 1024), {}), "normal": ("nor_gl", (512, 1024), {}), "arm": ("arm", (256,), {})}),
    "walnut": ("dark_wood", {"color": ("Diffuse", (256, 512, 1024), {"lift": 0.075}), "normal": ("nor_gl", (256, 512, 1024), {}), "arm": ("arm", (256,), {})}),
    "plaster": ("painted_plaster_wall", {"normal": ("nor_gl", (256, 512), {})}),
    "linen": ("rough_linen", {"color": ("Diffuse", (256,), {"grey": True}), "normal": ("nor_gl", (256,), {})}),
}


def fetch(url, cache):
    if not url.startswith(HOST) and not url.startswith(API):
        raise SystemExit(f"refusing to download from {url}: not Poly Haven")
    if cache:
        p = Path(cache) / hashlib.sha256(url.encode()).hexdigest()
        if p.exists():
            return p.read_bytes()
    req = urllib.request.Request(url, headers={"User-Agent": "voices-of-arrival-texture-build/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    if cache:
        Path(cache).mkdir(parents=True, exist_ok=True)
        (Path(cache) / hashlib.sha256(url.encode()).hexdigest()).write_bytes(data)
    return data


def luminance(img):
    """Mean WCAG relative luminance of an sRGB image (0 black, 1 white)."""
    a = np.asarray(img.convert("RGB"), dtype=np.float64) / 255
    lin = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    return float((lin @ [0.2126, 0.7152, 0.0722]).mean())


def lift(img, target):
    """Lift the mid-tones (gamma on sRGB values) until the mean luminance reaches `target`, and take
    45 % of the saturation out, so a very dark, red wood reads as walnut and not as a black hole."""
    a = np.asarray(img, dtype=np.float64) / 255
    grey = a @ [0.299, 0.587, 0.114]
    a = a * 0.55 + grey[..., None] * 0.45
    lo, hi = 0.3, 1.0
    for _ in range(30):
        g = (lo + hi) / 2
        if luminance(Image.fromarray((a ** g * 255).round().astype(np.uint8))) < target:
            hi = g
        else:
            lo = g
    return Image.fromarray((a ** lo * 255).round().astype(np.uint8))


def webp(img, path, quality):
    with tempfile.NamedTemporaryFile(suffix=".png") as tmp:
        img.save(tmp.name)
        subprocess.run(["cwebp", "-quiet", "-q", str(quality), "-m", "6", tmp.name, "-o", str(path)], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache")
    args = ap.parse_args()
    rows = []
    for name, (asset, maps) in SETS.items():
        files = json.loads(fetch(f"{API}/files/{asset}", args.cache))
        info = json.loads(fetch(f"{API}/info/{asset}", args.cache))
        (OUT / name).mkdir(parents=True, exist_ok=True)
        sources = []
        for out_map, (key, sizes, opt) in maps.items():
            url = files[key]["1k"]["jpg"]["url"]
            sources.append(url)
            img = Image.open(io.BytesIO(fetch(url, args.cache))).convert("RGB")
            if opt.get("lift"):
                img = lift(img, opt["lift"])
            if opt.get("grey"):
                img = ImageOps.autocontrast(ImageOps.grayscale(img), cutoff=1).point(lambda v: 150 + v * 105 // 255).convert("RGB")
            for px in sizes:
                webp(img.resize((px, px), Image.LANCZOS), OUT / name / f"{out_map}-{px}.webp", 90 if out_map == "normal" else 82)
        authors = ", ".join(f"{a} ({r.lower()})" for a, r in (info.get("authors") or {}).items())
        size_m = (info.get("dimensions") or [0])[0] / 1000
        rows.append((name, info.get("name", asset), f"https://polyhaven.com/a/{asset}", authors, size_m, sources))
    lines = [
        "# Texture credits",
        "",
        "Every room texture is from Poly Haven, licence CC0 1.0 (public domain dedication), per https://polyhaven.com/license.",
        "The 1k JPEG maps listed below were resized and saved as WebP by tools/build_room_textures.py. Other changes",
        "only: the linen colour map is reduced to grey so the material can tint it; the dark wood colour map has its mid-tones lifted and",
        "45 % less saturation, so it reads as walnut. Maps: color, normal (OpenGL), arm (ambient occlusion,",
        "roughness, metalness).",
        "",
        "| Folder | Asset | URL | Author(s) | Real-world size | Licence |",
        "|---|---|---|---|---|---|",
    ]
    for name, title, url, authors, size_m, _ in rows:
        lines.append(f"| {name}/ | {title} | {url} | {authors} | {size_m:.2f} m | CC0 |")
    lines += ["", "Source files:", ""]
    for name, _, _, _, _, sources in rows:
        lines += [f"- {name}/: " + ", ".join(sources)]
    (OUT / "CREDITS.md").write_text("\n".join(lines) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
