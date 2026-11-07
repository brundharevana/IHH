"""Build narration and quote audio with Kokoro-82M (Apache-2.0) and matching WebVTT.

Setup (once): python3 -m venv .venv-audio && .venv-audio/bin/pip install kokoro-onnx soundfile
Models: kokoro-v1.0.onnx and voices-v1.0.bin into tools/models/ (gitignored).
Usage: .venv-audio/bin/python tools/build_audio.py <slug> <chapter-number>
       .venv-audio/bin/python tools/build_audio.py --dev-placeholder
The second form writes the dev-only portrait test line (DEV_PLACEHOLDER, voice einstein-ai) to
site/.dev-audio/ (gitignored); only the PUBLIC_DEV_PAGES=1 build serves it.
MP3 encode uses ffmpeg if present, else writes WAV (note it in the report).
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

VOICES = {"guide": "af_heart", "einstein-ai": "bm_george"}
RECORDING = "recording"  # an archival recording replaces synthesis; nothing is built for it
GAP_S = 0.35
ROOT = Path(__file__).resolve().parents[1]


def validate_voices(chapter):
    """Raise ValueError naming the first quote whose voice is not known, before any synthesis."""
    known = sorted(VOICES) + [RECORDING]
    for q in chapter.get("quotes", []):
        voice = q.get("voice")
        if voice not in VOICES and voice != RECORDING:
            raise ValueError(
                f"quote {q.get('id')}: unknown voice {voice!r}; known voices: {', '.join(known)}"
            )


def ts(sec):
    ms = round(sec * 1000)
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"


def vtt_from_segments(segments):
    out, last_end = ["WEBVTT", ""], 0.0
    for cue, start, end, text in segments:
        if start < last_end - 1e-6 or end <= start:
            raise ValueError(f"cue {cue} overlaps or is empty")
        out += [cue, f"{ts(start)} --> {ts(end)}", text, ""]
        last_end = end
    return "\n".join(out) + "\n"


def synth(kokoro, text, voice):
    samples, rate = kokoro.create(text, voice=voice, speed=1.0, lang="en-us")
    return samples, rate


def write_audio(samples, rate, path):
    import soundfile as sf

    wav = path.with_suffix(".wav")
    sf.write(wav, samples, rate)
    if shutil.which("ffmpeg"):
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-b:a", "48k", str(path)],
            check=True,
        )
        wav.unlink()
        return path
    return wav


def main(slug, chapter):
    root = ROOT
    ch = json.loads((root / "content" / slug / "chapters" / f"{chapter}.json").read_text())
    validate_voices(ch)  # every quote voice, before the model loads or any file is written

    import numpy as np
    from kokoro_onnx import Kokoro

    models = root / "tools" / "models"
    kokoro = Kokoro(str(models / "kokoro-v1.0.onnx"), str(models / "voices-v1.0.bin"))
    out = root / "content" / slug / "audio"
    out.mkdir(parents=True, exist_ok=True)
    parts, segs, t = [], [], 0.0
    for line in ch["narration"]:
        s, rate = synth(kokoro, line["text"], VOICES["guide"])
        dur = len(s) / rate
        segs.append((line["cue"], t, t + dur, line["text"]))
        parts += [s, np.zeros(int(GAP_S * rate), dtype=s.dtype)]
        t += dur + GAP_S
    write_audio(np.concatenate(parts), rate, out / f"{chapter}-narration.mp3")
    (out / f"{chapter}-narration.vtt").write_text(vtt_from_segments(segs))
    for q in ch.get("quotes", []):
        if q["voice"] == RECORDING:
            continue
        s, rate = synth(kokoro, q["text"], VOICES[q["voice"]])
        write_audio(s, rate, out / f"{chapter}-{q['id']}.mp3")
        (out / f"{chapter}-{q['id']}.vtt").write_text(
            vtt_from_segments([(q["id"], 0.0, len(s) / rate, q["text"])])
        )


DEV_PLACEHOLDER = "PLACEHOLDER, not a quote"


def build_dev_placeholder():
    from kokoro_onnx import Kokoro

    root = Path(__file__).resolve().parents[1]
    models = root / "tools" / "models"
    kokoro = Kokoro(str(models / "kokoro-v1.0.onnx"), str(models / "voices-v1.0.bin"))
    out = root / "site" / ".dev-audio"
    out.mkdir(parents=True, exist_ok=True)
    s, rate = synth(kokoro, DEV_PLACEHOLDER, VOICES["einstein-ai"])
    write_audio(s, rate, out / "portrait-placeholder.mp3")
    (out / "portrait-placeholder.vtt").write_text(
        vtt_from_segments([("placeholder", 0.0, len(s) / rate, DEV_PLACEHOLDER)])
    )


if __name__ == "__main__":
    if sys.argv[1:] == ["--dev-placeholder"]:
        build_dev_placeholder()
    else:
        main(sys.argv[1], sys.argv[2])
