#!/usr/bin/env python3
"""S3 spike: hand-rolled, rule-based viseme timeline (no TTS, no audio analysis).

Writes data/lines.json (Rhubarb-style mouthCues per line) and data/captions.vtt.
Timing is simulated: ~5.0 syllables per second, pauses at punctuation.
The three lines paraphrase facts already verified in the project data (F-0001, F-0002);
the fact ids shown to users are deliberate PLACEHOLDERS (FACT-PH-nnn), not live ids.
Shape rules (Rhubarb alphabet): A closed (p b m), B clenched (k s t ee), C open (eh ae),
D wide (aa), E round-mid (ao er r), F pucker (uw ow w), G teeth-on-lip (f v), H tongue-up (l), X rest.
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SYL_PER_S = 5.0
LEAD = 0.5          # silence before first line
GAP = 0.9           # silence between lines
COMMA = 0.22

SCRIPT = [
    dict(id="l1", fact="FACT-PH-001", speaker="Narration",
         text="The U.S. National Archives holds Albert Einstein's naturalization record."),
    dict(id="l2", fact="FACT-PH-002", speaker="Narration",
         text="The file includes a certificate of arrival, a declaration of intention, a petition for naturalization, and an oath of allegiance."),
    dict(id="l3", fact="FACT-PH-003", speaker="Narration",
         text="Hedy Lamarr's naturalization file is also held there, under the name Hedwig Maria Stauffer."),
]

DIGRAPHS = [("th", "B"), ("sh", "B"), ("ch", "B"), ("ph", "G"), ("ee", "B"), ("ea", "B"), ("oo", "F"), ("ou", "F"), ("ow", "F"),
            ("oa", "E"), ("au", "E"), ("aw", "E"), ("ar", "D"), ("or", "E"), ("er", "E"), ("ir", "E"), ("ur", "E"), ("ie", "B"), ("ai", "C"), ("ay", "C")]
SINGLE = {"a": "D", "e": "C", "i": "B", "o": "E", "u": "F", "y": "B", "w": "F", "m": "A", "b": "A", "p": "A", "f": "G", "v": "G",
          "l": "H", "r": "E"}
VOWELS = "aeiouy"


def to_shapes(word):
    """letters -> [(shape, weight)]; vowels weigh more than consonants."""
    w = re.sub(r"[^a-z]", "", word.lower())
    out, i = [], 0
    while i < len(w):
        pair = w[i:i + 2]
        hit = next((s for d, s in DIGRAPHS if d == pair), None)
        if hit:
            out.append((hit, 2.0 if pair[0] in VOWELS else 1.0)); i += 2; continue
        ch = w[i]
        out.append((SINGLE.get(ch, "B"), 2.0 if ch in VOWELS else 1.0)); i += 1
    # drop a trailing silent e
    if len(w) > 2 and w.endswith("e") and w[-2] not in VOWELS and out:
        out.pop()
    return out


def syllables(word):
    w = re.sub(r"[^a-z]", "", word.lower())
    n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and n > 1 and not w.endswith(("le", "ee")):
        n -= 1
    return max(1, n)


def line_cues(text):
    """Return (cues relative to line start, duration)."""
    cues, t = [], 0.0
    words = text.replace("U.S.", "U S").split()
    for wi, raw in enumerate(words):
        dur = syllables(raw) / SYL_PER_S
        shapes = to_shapes(raw)
        if shapes:
            total_w = sum(w for _, w in shapes)
            for s, w in shapes:
                d = dur * w / total_w
                if cues and cues[-1]["value"] == s and abs(cues[-1]["end"] - t) < 1e-6:
                    cues[-1]["end"] = round(t + d, 3)
                else:
                    cues.append(dict(start=round(t, 3), end=round(t + d, 3), value=s))
                t += d
        t += 0.045  # inter-word seam: mouth holds its last shape
        if cues:
            cues[-1]["end"] = round(t, 3)
        if raw.endswith((",", ";")):
            cues.append(dict(start=round(t, 3), end=round(t + COMMA, 3), value="X")); t += COMMA
    cues.append(dict(start=round(t, 3), end=round(t + 0.25, 3), value="X"))
    return cues, round(t + 0.25, 3)


def fmt(t):
    h, rem = divmod(t, 3600); m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"


def main():
    t = LEAD
    lines, vtt = [], ["WEBVTT", "", "NOTE S3 spike: captions are cue text only; mouthCues live in lines.json", ""]
    for ln in SCRIPT:
        cues, dur = line_cues(ln["text"])
        shifted = [dict(start=round(c["start"] + t, 3), end=round(c["end"] + t, 3), value=c["value"]) for c in cues]
        lines.append(dict(ln, start=round(t, 3), end=round(t + dur, 3), mouthCues=shifted))
        vtt += [ln["id"], f"{fmt(t)} --> {fmt(t + dur)}", f"<v {ln['speaker']}>{ln['text']}", ""]
        t += dur + GAP
    total = round(t, 3)
    doc = dict(format="rhubarb-style mouthCues, absolute seconds on the shared clock", simulated=True,
               note="Rule-based letter-to-shape converter plus fixed syllable rate. Not derived from audio.",
               duration=total, lines=lines)
    os.makedirs(os.path.join(HERE, "data"), exist_ok=True)
    json.dump(doc, open(os.path.join(HERE, "data", "lines.json"), "w"), separators=(",", ":"))
    open(os.path.join(HERE, "data", "captions.vtt"), "w", encoding="utf-8").write("\n".join(vtt))
    n = sum(len(l["mouthCues"]) for l in lines)
    print("duration", total, "lines", len(lines), "mouth cues", n)
    from collections import Counter
    print(Counter(c["value"] for l in lines for c in l["mouthCues"]))


if __name__ == "__main__":
    main()
