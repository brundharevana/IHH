"""Build the depth map that drives the living portrait's parallax.

Model: Depth Anything V2 Small, ONNX export from onnx-community/depth-anything-v2-small
(licence apache-2.0 on the model card and on depth-anything/Depth-Anything-V2-Small; only the
Small model is Apache-2.0, Base and Large are not). File onnx/model.onnx (fp32, 99,060,839 B) at
revision 4472b7362082ad9968fee890ca0f1e5aca36b93d, sha256 pinned below. fp32 is used because
onnxruntime crashes on the fp16 graph during fusion (spike S7).

Setup (once, shares the Task 3 venv):
  .venv-audio/bin/pip install onnxruntime pillow
  curl -L -o tools/models/depth-anything-v2-small.onnx \
    https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/4472b7362082ad9968fee890ca0f1e5aca36b93d/onnx/model.onnx
Usage:
  .venv-audio/bin/python tools/build_depth.py <slug>
reads content/<slug>/portrait/portrait.webp and writes content/<slug>/portrait/depth.png
(8-bit greyscale, near = bright, long side 512 px). --input/--output override the paths.
The site publishes both only through the licence-gated route site/src/pages/portraits/[file].js.
"""
import argparse
import hashlib
import sys
from pathlib import Path

import numpy as np

MODEL_SHA256 = "afb6a5c28f3b6bf1618c6e43f02073ef9dfdc70e937502d51603e57b0a1df10c"
PATCH = 14
SHORT_SIDE = 518
LONG_SIDE_OUT = 512
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / "tools" / "models" / "depth-anything-v2-small.onnx"


def model_input_size(w, h):
    """Short side 518, long side rounded to a multiple of the 14 px ViT patch."""
    if w <= h:
        return SHORT_SIDE, max(PATCH, round(SHORT_SIDE * h / w / PATCH) * PATCH)
    return max(PATCH, round(SHORT_SIDE * w / h / PATCH) * PATCH), SHORT_SIDE


def output_size(w, h):
    """Long side 512 px, aspect kept."""
    if w <= h:
        return round(LONG_SIDE_OUT * w / h), LONG_SIDE_OUT
    return LONG_SIDE_OUT, round(LONG_SIDE_OUT * h / w)


def normalise(d):
    d = np.asarray(d, dtype=np.float32)
    lo, hi = float(d.min()), float(d.max())
    if hi - lo < 1e-6:
        raise ValueError("depth map is flat; the model output is unusable")
    return (d - lo) / (hi - lo)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def estimate(img, model_path=MODEL):
    import onnxruntime as ort
    from PIL import Image

    if sha256(model_path) != MODEL_SHA256:
        raise SystemExit(f"{model_path}: sha256 does not match the pinned model")
    sess = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])
    inp = sess.get_inputs()[0]
    w, h = model_input_size(*img.size)
    x = np.asarray(img.convert("RGB").resize((w, h), Image.BICUBIC), dtype=np.float32) / 255.0
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
    return normalise(np.squeeze(sess.run(None, {inp.name: x})[0]))


def main(argv=None):
    from PIL import Image, ImageFilter

    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("slug")
    ap.add_argument("--input")
    ap.add_argument("--output")
    a = ap.parse_args(argv)
    folder = ROOT / "content" / a.slug / "portrait"
    src = Path(a.input) if a.input else folder / "portrait.webp"
    dst = Path(a.output) if a.output else folder / "depth.png"
    img = Image.open(src)
    d = estimate(img)
    out = Image.fromarray((d * 255).round().astype(np.uint8))
    # A slight blur hides patch seams and softens the hair-to-background edge under parallax.
    out = out.resize(output_size(*img.size), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))
    out.save(dst, optimize=True)
    print(f"{dst} {out.size[0]}x{out.size[1]} {dst.stat().st_size} B")


if __name__ == "__main__":
    main(sys.argv[1:])
