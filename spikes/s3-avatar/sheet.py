#!/usr/bin/env python3
"""Builds cast-sheet.html (static, inline SVG) from gen.py output. Python stdlib only.
Layout: L1 row, L2 row (six characters each), then a nine-shape mouth strip for one character
at a stated head height (default 160 px)."""
import json, os, re, sys
import gen

HERE = os.path.dirname(os.path.abspath(__file__))
HEAD_PX = 160                      # task requirement: mouths legible at 160 px head height
HEAD_UNITS = 236                   # crown-to-chin of the tallest head (guide, Einstein, Lamarr), in rig units
STRIP_CHAR = os.environ.get("STRIP_CHAR", "lamarr")
STRIP_LEVEL = int(os.environ.get("STRIP_LEVEL", "2"))

DESC = dict(X="X  rest", A="A  P B M", B="B  K S T EE", C="C  EH AE", D="D  AA", E="E  AO ER", F="F  UW OW W", G="G  F V", H="H  L")


def cell(name, lvl, shape, vb, w, h):
    svg = gen.build(name, lvl, mouth=shape, with_defs=False)
    return svg.replace(f'viewBox="{gen.VIEW}"', f'viewBox="{vb}"').replace("<svg ", f'<svg width="{w}" height="{h}" ', 1)


def fig(name, lvl, px_h):
    svg = gen.build(name, lvl)
    w = round(px_h * 320 / 360)
    svg = svg.replace("<svg ", f'<svg width="{w}" height="{px_h}" ', 1)
    return svg


def main():
    out = []
    out.append("""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>S3 cast sheet</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--paper:#f6f1e7;--ink:#2b2a33;--rule:#cfc6b4}
body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;padding:24px 28px}
h1{font-size:20px;margin:0 0 2px}h2{font-size:15px;margin:22px 0 8px;letter-spacing:.02em}
p.n{margin:0 0 8px;color:#55525e;font-size:13px}
.row{display:flex;gap:6px;flex-wrap:wrap}
figure{margin:0;text-align:center;border:1px solid var(--rule);border-radius:6px;padding:6px 4px 4px;background:#fbf8f1}
figcaption{font-size:12px;margin-top:2px}
.strip figure{padding:4px}
.strip figcaption{font-weight:600}
.badge{display:inline-block;border:1px solid var(--ink);border-radius:4px;padding:1px 6px;font-size:12px;margin-left:8px}
</style></head><body>
<h1>S3 avatar cast sheet <span class="badge">illustrative reconstruction (spike)</span></h1>
<p class="n">AI recreation, illustrated; fictional guide plus five stylized inductees. Flat colour, no photo tracing. Likeness cues come from public-domain reference photos listed in B3-S3-avatar-cast.md.</p>
""")
    for lvl, title in ((1, "L1 iconic: silhouette, hair, beard, glasses, clothing"), (2, "L2 characterful: adds nose, brows, lids, wrinkles, accessories")):
        out.append(f'<h2>{title}</h2><div class="row">')
        for name in gen.KITS:
            out.append(f'<figure>{fig(name, lvl, 300)}<figcaption>{gen.META[name]["name"]} L{lvl}</figcaption></figure>')
        out.append("</div>")
    # mouth strip: crop to head, scale so the face (about 194 units) is HEAD_PX tall
    scale = HEAD_PX / HEAD_UNITS
    vb = "-112 -176 224 292"
    wpx = round(224 * scale)
    hpx = round(292 * scale)
    out.append(f'<h2>Mouth shapes (Rhubarb A-H, X): {gen.META[STRIP_CHAR]["name"]} L{STRIP_LEVEL} at {HEAD_PX} px head height</h2><div class="row strip">')
    for s in "XABCDEFGH":
        out.append(f'<figure>{cell(STRIP_CHAR, STRIP_LEVEL, s, vb, wpx, hpx)}<figcaption>{DESC[s]}</figcaption></figure>')
    out.append("</div>")
    out.append(f'<h2>Same strip, Einstein L2 (moustache covers the upper lip)</h2><div class="row strip">')
    for s in "XABCDEFGH":
        out.append(f'<figure>{cell("einstein", 2, s, vb, wpx, hpx)}<figcaption>{DESC[s]}</figcaption></figure>')
    out.append("</div></body></html>")
    open(os.path.join(HERE, "cast-sheet.html"), "w", encoding="utf-8").write("".join(out))
    print("cast-sheet.html", sum(len(x) for x in out))


if __name__ == "__main__":
    main()
