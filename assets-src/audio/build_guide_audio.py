#!/usr/bin/env python3
"""Pre-render everything the museum guide says, once per guide voice, with Kokoro-82M (Apache-2.0).

Three guides (owner decision 2026-10-17), one Kokoro voice each (GUIDE_VOICES; why these voices:
assets-src/audio/VOICES.md). Two sources of words:
  app/src/shared/guide/lines.json      the guide's own wayfinding lines (never facts), filled with
                                       the inductee names in app/src/landing/data/inductees.json,
                                       plus each room's lines (tour.rooms)
  assets-src/audio/narration/<slug>.json  the narration: rewritten chapter lines, each tied to
                                       verified fact ids and gated by check_narration.py
Each line is synthesized whole, sentence by sentence (Kokoro reads one sentence at a time best),
and the sentences are joined with a natural pause (varied a little per line) instead of stitching
fragments of a sentence. Each line gets a slight deterministic speed variation (about +-3 %) so a
run of lines does not sound metronomic. Abbreviations are spelled out for the voice only ('speak'),
and every spoken sentence goes through speech_norm.normalize (years said the human way, in one of
two styles fixed per line; abbreviations without the pause espeak puts after each full stop).
Captions (the VTT text) are never normalised.

Writes, per guide g in a, b, c:
  app/public/audio/guide/<g>/<id>.mp3   48 kbps mono (ffmpeg), or .wav if ffmpeg is missing
  app/public/audio/guide/<g>/<id>.vtt   one WebVTT cue per sentence (the caption text)
  app/src/shared/guide/voice-manifest.json
      { guides: { g: { voice, clips: { <line text>: {src, vtt, dur} },
                       narration: { "<slug>:<chapter>:<cue>" | "<slug>:ch:<kind>:opening": {src, vtt, dur, factIds} } } } }
<id> = first 12 hex chars of sha1(voice | spoken text | speed): unchanged lines keep their file, so
an interrupted run resumes where it stopped (existing files are reused, stale ones removed at the end).
The caption file is <id>-<8 hex of sha1(caption sentences)>.vtt: a caption edit alone writes a new VTT
on the existing audio's cue times (no re-synthesis).

Setup once (the models are not in git):
  python3 -m venv .venv-audio && .venv-audio/bin/pip install kokoro-onnx soundfile numpy
  put kokoro-v1.0.onnx and voices-v1.0.bin in a folder and point KOKORO_MODELS at it
  (default: ../Challenge IHH/tools/models next to this repo).
Run from the repo root (one process, sequential; nice it when the machine is busy):
  KOKORO_MODELS=... nice -n 10 <venv>/bin/python assets-src/audio/build_guide_audio.py [--check] [--only a,b]
  ... build_guide_audio.py --slug einstein   re-render one inductee's narration only (others kept)
  ... build_guide_audio.py --listen     short listen test of the candidate voices (VOICES.md)
--check exits non-zero if any line is missing for any guide, or its audio, caption file, cue text or
fact ids are not what the current lines render (stale words or captions). It needs no model.
"""
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from speech_norm import ends_sentence, normalize  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
LINES = ROOT / "app" / "src" / "shared" / "guide" / "lines.json"
INDUCTEES = ROOT / "app" / "src" / "landing" / "data" / "inductees.json"
NARRATION = ROOT / "assets-src" / "audio" / "narration"
OUT = ROOT / "app" / "public" / "audio" / "guide"
MANIFEST = ROOT / "app" / "src" / "shared" / "guide" / "voice-manifest.json"
LISTEN = ROOT / "assets-src" / "audio" / "listen-test"
MODELS = Path(os.environ.get("KOKORO_MODELS", ROOT.parent / "Challenge IHH" / "tools" / "models"))

# guide id -> Kokoro voice (A Business_Female_02, B Business_Female_01, C Business_Male_03)
GUIDE_VOICES = {"a": "af_heart", "b": "af_bella", "c": "am_michael"}
BASE_SPEED = {"af_heart": 0.98, "af_bella": 0.97, "am_michael": 0.96}
CANDIDATES = {
    "a": ["af_heart", "bf_emma", "af_sarah"],
    "b": ["af_bella", "af_nicole", "af_aoede"],
    "c": ["am_michael", "am_fenrir", "am_puck"],
}


def h(*parts):
    return hashlib.sha1("|".join(map(str, parts)).encode()).hexdigest()


def sentences(text):
    """Split at . ? ! : followed by a space and a capital, but not after an abbreviation or an initial
    (speech_norm.ends_sentence: "Orange, N. J." and "Clifford L. Comstock" are one sentence each)."""
    out, start = [], 0
    for m in re.finditer(r"[.?!:]\s+(?=[A-Z0-9])", text):
        head = text[:m.start() + 1]
        word = head.split()[-1]
        if text[m.start()] == "." and not ends_sentence(word, head[:len(head) - len(word)], text[m.start() + 1:]):
            continue
        out.append(text[start:m.start() + 1].strip())
        start = m.end()
    out.append(text[start:].strip())
    return [s for s in out if s]


def wayfinding():
    """Every wayfinding line the app can ask for, in a stable order."""
    lines = json.loads(LINES.read_text())
    people = json.loads(INDUCTEES.read_text())
    land, tour = lines["landing"], lines["tour"]
    out = []
    for tpl in land["offer"]:
        for p in people:
            out.append(tpl.replace("{n}", p["name"]).replace("{pos}", lines["pronouns"].get(p["slug"], "their")))
    out += land["decline"] + land["greeting"]
    out += tour["arrivals"] + tour["done"]
    for group in (tour["intros"], tour["nudges"]):
        for v in group.values():
            out += v
    # each recreated room's own lines (tour.rooms.<room id>)
    for room in tour.get("rooms", {}).values():
        out += room.get("arrivals", [])
        for group in (room.get("intros", {}), room.get("nudges", {})):
            for v in group.values():
                out += v
    return list(dict.fromkeys(out))


def narration():
    """(key, caption text, spoken text, fact ids) for every narration line and chapter opening.
    A chapter keyed by its kind may carry an opening (check_narration.py): '<slug>:ch:<kind>:opening'."""
    rows = []
    for f in sorted(NARRATION.glob("*.json")):
        d = json.loads(f.read_text())
        for n, ch in d["chapters"].items():
            if "opening" in ch:
                o = ch["opening"]
                rows.append((f"{d['inductee']}:ch:{n}:opening", o["text"], o.get("speak") or o["text"], o["fact_ids"]))
            for line in ch.get("lines", []):
                rows.append((f"{d['inductee']}:{n}:{line['cue']}", line["text"], line.get("speak") or line["text"], line["fact_ids"]))
    return rows


def ts(sec):
    ms = round(sec * 1000)
    hh, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{hh:02d}:{m:02d}:{s:02d}.{ms:03d}"


def trim(samples, rate, floor=0.004, pad=0.03):
    import numpy as np

    loud = np.nonzero(np.abs(samples) > floor)[0]
    if not len(loud):
        return samples
    return samples[max(0, loud[0] - int(pad * rate)):min(len(samples), loud[-1] + int(pad * rate))]


def write_audio(samples, rate, path):
    import soundfile as sf

    wav = path.with_suffix(".wav")
    sf.write(wav, samples, rate)
    if shutil.which("ffmpeg"):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "48k", str(path)], check=True)
        wav.unlink()
        return path
    return wav


def plan(voice, caption, spoken):
    """What one line renders to: speed, the spoken and shown sentences, the audio id and the caption id.
    The audio id hashes what is said (voice | spoken sentences | speed); the caption file's name adds a
    hash of the caption sentences, so a caption edit (a "[sic]", a comma) makes a new VTT even when the
    words said, and so the audio, stay the same."""
    seed = int(h(voice, spoken)[:8], 16)
    speed = round(BASE_SPEED.get(voice, 1.0) * (1 + ((seed % 61) - 30) / 1000), 3)  # +-3 %
    # the year style is fixed per line (the same for every voice), so a re-render is identical
    style = int(h(spoken)[:8], 16)
    said, shown = [normalize(s, style) for s in sentences(spoken)], sentences(caption)
    if len(said) != len(shown):
        said, shown = [normalize(spoken, style)], [caption]
    cid = h(voice, " ".join(said), speed)[:12]
    return {"seed": seed, "speed": speed, "said": said, "shown": shown, "cid": cid,
            "vid": f"{cid}-{h(*shown)[:8]}"}


def vtt_cues(path):
    """[(start s, end s, text)] of a WebVTT file written by render()."""
    def sec(t):
        hh, m, x = t.strip().split(":")
        return int(hh) * 3600 + int(m) * 60 + float(x)
    out = []
    for block in path.read_text().split("\n\n")[1:]:
        rows = block.strip().splitlines()
        timing = next((i for i, r in enumerate(rows) if "-->" in r), None)
        if timing is None:
            continue
        a, b = rows[timing].split("-->")
        out.append((sec(a), sec(b), "\n".join(rows[timing + 1:])))
    return out


def write_vtt(path, cid, cues):
    body = "\n\n".join(f"{cid}-{k + 1}\n{ts(a)} --> {ts(b)}\n{text}" for k, (a, b, text) in enumerate(cues))
    path.write_text(f"WEBVTT\n\n{body}\n")


def render(kokoro, voice, caption, spoken, folder):
    """One line -> (file name, vtt name, duration). Reuses the audio when it already exists; a caption
    that changed while the words said did not gets a new VTT on the existing audio's cue times."""
    p = plan(voice, caption, spoken)
    cid, said, shown, seed, speed = p["cid"], p["said"], p["shown"], p["seed"], p["speed"]
    mp3, vtt = folder / f"{cid}.mp3", folder / f"{p['vid']}.vtt"
    if mp3.exists():
        if not vtt.exists():
            old = next(iter(sorted(folder.glob(f"{cid}.vtt")) + sorted(folder.glob(f"{cid}-*.vtt"))), None)
            if old is None:
                raise SystemExit(f"{mp3.name}: audio without any caption file; delete it to re-render")
            cues = vtt_cues(old)
            if len(cues) != len(shown):  # one cue over the whole line, as render does when counts differ
                cues = [(cues[0][0], cues[-1][1], caption)] if len(shown) == 1 else None
                if cues is None:
                    raise SystemExit(f"{old.name}: {len(vtt_cues(old))} cues for {len(shown)} caption sentences")
            write_vtt(vtt, cid, [(a, b, shown[i]) for i, (a, b, _) in enumerate(cues)])
        end = vtt_cues(vtt)[-1][1]
        return mp3.name, vtt.name, round(end + 0.06, 3)
    import numpy as np

    chunks, cues, t = [], [], 0.0
    rate = 24000
    lead = 0.06
    for i, s in enumerate(said):
        samples, rate = kokoro.create(s, voice=voice, speed=speed, lang="en-us")
        samples = trim(samples, rate)
        if i == 0:
            chunks.append(np.zeros(int(lead * rate), dtype=samples.dtype))
            t = lead
        dur = len(samples) / rate
        cues.append((t, t + dur, shown[i]))
        chunks.append(samples)
        t += dur
        if i < len(said) - 1:
            # a breath between sentences: longer after a question or a colon, varied per line
            gap = (0.42 if said[i].endswith(("?", ":")) else 0.32) + ((seed >> (i + 3)) % 9) * 0.015
            chunks.append(np.zeros(int(gap * rate), dtype=samples.dtype))
            t += gap
    chunks.append(np.zeros(int(0.06 * rate), dtype=chunks[-1].dtype))
    audio = write_audio(np.concatenate(chunks), rate, mp3)
    write_vtt(vtt, cid, cues)
    return audio.name, vtt.name, round(t + 0.06, 3)


def load_manifest():
    if MANIFEST.exists():
        d = json.loads(MANIFEST.read_text())
        if "guides" in d:
            return {k: v for k, v in d.items() if k in ("guides", "captions")}
    return {"guides": {}}


def stale(man, texts, rows, out=OUT):
    """Every way the manifest and the files on disk differ from what the current lines would render:
    a line missing for a guide, an audio or caption file named for other words, a missing file, a VTT
    whose cue text is not the caption, fact ids that differ. [] when everything is current."""
    errs = []
    for g, voice in GUIDE_VOICES.items():
        have = man.get(g, {})
        want = [("clip", t, t, t, None) for t in texts] + [("narration", k, c, sp, f) for k, c, sp, f in rows]
        for kind, key, caption, spoken, facts in want:
            e = have.get("clips" if kind == "clip" else "narration", {}).get(key)
            if not e:
                errs.append(f"missing {g}: {key}")
                continue
            p = plan(voice, caption, spoken)
            src, vtt = out / g / Path(e["src"]).name, out / g / Path(e["vtt"]).name
            if Path(e["src"]).stem != p["cid"]:
                errs.append(f"stale audio {g}: {key} ({Path(e['src']).name}, the words said now render {p['cid']})")
            if Path(e["vtt"]).name != f"{p['vid']}.vtt":
                errs.append(f"stale caption {g}: {key} ({Path(e['vtt']).name}, the caption now renders {p['vid']}.vtt)")
            for f in (src, vtt):
                if not f.exists():
                    errs.append(f"missing file {g}: {key} ({f.name})")
            if vtt.exists() and [c[2] for c in vtt_cues(vtt)] != p["shown"]:
                errs.append(f"caption text {g}: {key} ({vtt.name} does not carry the caption)")
            if facts is not None and e.get("factIds") != facts:
                errs.append(f"fact ids {g}: {key} (manifest {e.get('factIds')}, narration {facts})")
    return errs


def captions(rows):
    """{narration key: its approved caption text} (the caption fallback of the app's speech.js)."""
    return {key: caption for key, caption, _spoken, _facts in rows}


def check():
    texts, rows = wayfinding(), narration()
    man = load_manifest()
    errs = stale(man["guides"], texts, rows)
    if man.get("captions") != captions(rows):
        errs.append("captions: the manifest's caption fallback text differs from the narration's captions")
    for m in errs:
        print(m)
    print(f"{len(texts)} lines + {len(rows)} narration lines x {len(GUIDE_VOICES)} guides, {len(errs)} missing or stale")
    return 1 if errs else 0


def listen():
    """Short listen test: the same two lines in each candidate voice, plus a pitch-movement figure."""
    import numpy as np
    from kokoro_onnx import Kokoro

    kokoro = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
    LISTEN.mkdir(parents=True, exist_ok=True)
    test = ("This is Albert Einstein. Would you like me to walk you through his story? "
            "Take his letter of June 18, 1943, to Lieutenant Stephen Brunauer.")
    for g, voices in CANDIDATES.items():
        for v in voices:
            samples, rate = kokoro.create(test, voice=v, speed=1.0, lang="en-us")
            write_audio(trim(samples, rate), rate, LISTEN / f"{g}-{v}.mp3")
            f0 = pitch_track(samples, rate)
            semis = 12 * np.log2(f0 / np.median(f0)) if len(f0) else np.array([0.0])
            print(f"{g} {v:11s} dur {len(samples) / rate:5.2f}s  median F0 {np.median(f0) if len(f0) else 0:6.1f} Hz"
                  f"  pitch movement (sd) {np.std(semis):4.2f} st  range p5-p95 {np.percentile(semis, 95) - np.percentile(semis, 5):4.1f} st")


def pitch_track(x, rate, frame=0.04, hop=0.01):
    """Plain autocorrelation F0 per voiced frame (60-400 Hz); enough to compare prosody."""
    import numpy as np

    n, step = int(frame * rate), int(hop * rate)
    lo, hi = int(rate / 400), int(rate / 60)
    out = []
    for i in range(0, len(x) - n, step):
        f = x[i:i + n] - np.mean(x[i:i + n])
        if np.sqrt(np.mean(f * f)) < 0.02:
            continue
        ac = np.correlate(f, f, "full")[n - 1:]
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.45 * ac[0]:
            out.append(rate / lag)
    return np.array(out)


def main(only=None, slug=None):
    """slug: render only that inductee's narration; every other line keeps its manifest entry (a
    line missing from the manifest is still rendered, so the manifest stays complete)."""
    from kokoro_onnx import Kokoro

    kokoro = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
    man = load_manifest()
    texts, rows = wayfinding(), narration()
    for g, voice in GUIDE_VOICES.items():
        if only and g not in only:
            continue
        folder = OUT / g
        folder.mkdir(parents=True, exist_ok=True)
        old = man["guides"].get(g, {}) if slug else {}
        clips, narr = {}, {}
        for text in texts:
            if text in old.get("clips", {}):
                clips[text] = old["clips"][text]
                continue
            a, v, dur = render(kokoro, voice, text, text, folder)
            clips[text] = {"src": f"/audio/guide/{g}/{a}", "vtt": f"/audio/guide/{g}/{v}", "dur": dur}
            print(f"{g} {dur:5.2f}s  {text}", flush=True)
        for key, caption, spoken, facts in rows:
            if not key.startswith(f"{slug}:") and key in old.get("narration", {}):
                narr[key] = {**old["narration"][key], "factIds": facts}
                continue
            a, v, dur = render(kokoro, voice, caption, spoken, folder)
            narr[key] = {"src": f"/audio/guide/{g}/{a}", "vtt": f"/audio/guide/{g}/{v}", "dur": dur, "factIds": facts}
            print(f"{g} {dur:5.2f}s  {key}", flush=True)
        man["guides"][g] = {"voice": voice, "clips": clips, "narration": narr}
        keep = {Path(c["src"]).name for c in [*clips.values(), *narr.values()]} | {Path(c["vtt"]).name for c in [*clips.values(), *narr.values()]}
        for f in folder.iterdir():
            if f.name not in keep:
                f.unlink()
        # the approved caption of every narration line, once for all guides: the app shows it when a
        # line's VTT cannot be loaded, so a visitor without sound still gets the words
        man["captions"] = captions(rows)
        MANIFEST.write_text(json.dumps({
            "$comment": "Generated by assets-src/audio/build_guide_audio.py. AI voices: Kokoro-82M v1.0 (Apache-2.0), one voice per guide. Do not edit by hand.",
            "model": "Kokoro-82M v1.0 (kokoro-onnx)",
            **man,
        }, indent=1, ensure_ascii=False) + "\n")
    # the single-voice layout of the previous build (files directly in audio/guide/)
    for f in OUT.glob("*.*"):
        f.unlink()
    print("done")
    return 0


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--check" in args:
        sys.exit(check())
    if "--listen" in args:
        sys.exit(listen() or 0)
    only = None
    if "--only" in args:
        only = set(args[args.index("--only") + 1].split(","))
    slug = args[args.index("--slug") + 1] if "--slug" in args else None
    sys.exit(main(only, slug))
