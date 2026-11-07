#!/usr/bin/env python3
"""S3 spike: parametric SVG cast generator (Python stdlib only).

One shared rig (face path from four numbers, eye kit, 9 Rhubarb mouth shapes,
blink pair, body/head layer groups) + palette tokens + per-person part kits at two
stylization levels:
  L1 iconic      silhouette, hair, beard, glasses, clothing cues; dot eyes; no nose or brows
  L2 characterful nose, brows, lids, wrinkles, hair strands, accessories; still flat colour

Likeness cues come only from features visible in the public-domain reference photos
listed in the report (B3-S3-avatar-cast.md). Nothing here traces or embeds a photo.
Labelled in the report as "illustrative reconstruction (spike)".

Usage: python3 gen.py        writes characters/*.svg, characters/manifest.json, cast.html
"""
import gzip, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "characters")
VIEW = "-160 -175 320 360"          # shared viewBox for every character, both levels
INK = "#2b2a33"
PAPER = "#f6f1e7"
MOUTH_IN, TEETH, TONGUE = "#5a1d2a", "#fffdf4", "#d9606d"
SHAPES = "XABCDEFGH"                # Rhubarb: A..H basic/extended, X idle

# ---- palette tokens: every colour used by a character is named here -------------------
PAL = {
    "guide":    dict(skin="#b9784f", shade="#a3663f", hair="#2f2438", hair2="#4a3a55", cloth="#2f6f7e", cloth2="#245a67",
                     acc="#e3a63c", glass="#1f7f8f", badge="#fff8e6", iris="#3b2a22", brow="#2f2438", lip="#7a3a30", cheek="#e0866a"),
    "einstein": dict(skin="#efc9a8", shade="#d9ab87", hair="#ece9f1", hair2="#bdb8cb", brow="#8d889a", stache="#d3cfdb",
                     cloth="#7d766b", cloth2="#5f5950", shirt="#f5f2ea", iris="#4a3a2c", lip="#9a5a4e", cheek="#e8a08c"),
    "muir":     dict(skin="#e3b490", shade="#cd9a74", hair="#d2cdc4", hair2="#a8a299", beard="#ddd8cf", beard2="#b4aea4",
                     hat="#8d7b57", hat2="#4e3e2a", vest="#3f3b3a", shirt="#efe8d6", iris="#4f6577", brow="#b9b3a9", lip="#8a4a40", cheek="#e09a80"),
    "lamarr":   dict(skin="#f6dcc4", shade="#e6bd9f", hair="#1f1c28", hair2="#443f5c", brow="#2a2230", lips="#b0202f",
                     cloth="#1e1b27", cloth2="#34303f", brooch="#d8dde8", iris="#4a3526", lip="#b0202f", cheek="#f0a193"),
    "albright": dict(skin="#f1cdb2", shade="#ddb292", hair="#8b5b3b", hair2="#ad7b53", brow="#7a4f33", cloth="#23242f", cloth2="#3a3b49",
                     gold="#d9a93a", iris="#6f93bf", lip="#a65a52", cheek="#ee9f8e"),
    "naismith": dict(skin="#ebc3a1", shade="#d4a681", hair="#3b2f2a", hair2="#5a4a42", stache="#2e2521", brow="#2e2521",
                     cloth="#30313d", cloth2="#454656", collar="#f6f3eb", tie="#1c1a21", iris="#6a6a58", lip="#8c4a40", cheek="#e49b82"),
}

# ---- identity data: label text lives in the DOM at runtime, not in the art -------------
META = {
    "guide":    dict(name="Museum guide", role="Fictional guide, not a real person", ref=None),
    "einstein": dict(name="Albert Einstein", role="Stylized portrait, illustrative reconstruction (spike)", ref="LoC 2004671908"),
    "muir":     dict(name="John Muir", role="Stylized portrait, illustrative reconstruction (spike)", ref="LoC 2002719850, Commons John_Muir_Cane.JPG"),
    "lamarr":   dict(name="Hedy Lamarr", role="Stylized portrait, illustrative reconstruction (spike)", ref="Commons Hedy_Lamarr_in_The_Heavenly_Body_1944.jpg"),
    "albright": dict(name="Madeleine Albright", role="Stylized portrait, illustrative reconstruction (spike)", ref="Commons Secretary_of_State_Madeleine_Albright.jpg (State Dept)"),
    "naismith": dict(name="James Naismith", role="Stylized portrait, illustrative reconstruction (spike)", ref="Commons JNAISMITH.jpg (1905)"),
}

# face numbers: half-width w, jaw half-width jw, chin half-width cw, chin y cy
FACE = {
    "guide": (74, 62, 30, 96), "einstein": (82, 68, 36, 96), "muir": (70, 58, 30, 100),
    "lamarr": (72, 56, 24, 100), "albright": (80, 72, 36, 93), "naismith": (78, 74, 42, 98),
}
# mouth anchor (x, y, scale) -- the mouth group is drawn at this transform
MOUTH_AT = {
    "guide": (0, 56, 1.1), "einstein": (0, 68, 0.88), "muir": (0, 62, 0.86),
    "lamarr": (0, 60, 1.05), "albright": (0, 56, 1.08), "naismith": (0, 66, 0.92),
}
EYE_AT = {  # x offset, y
    "guide": (31, -8), "einstein": (31, -8), "muir": (29, -10), "lamarr": (29, -10), "albright": (31, -9), "naismith": (31, -9),
}


def f(n):
    return f"{n:.1f}".rstrip("0").rstrip(".") if isinstance(n, float) else str(n)


def face_d(w, jw, cw, cy):
    return (f"M0,-94 C{f(w*.62)},-94 {w},-64 {w},-16 C{w},{f(cy*.3)} {jw},{cy-36} {cw},{cy-10} "
            f"Q{f(cw*.5)},{cy} 0,{cy} Q{f(-cw*.5)},{cy} {-cw},{cy-10} C{-jw},{cy-36} {-w},{f(cy*.3)} {-w},-16 "
            f"C{-w},-64 {f(-w*.62)},-94 0,-94Z")


# ---- mouth kit: nine Rhubarb shapes centred on (0,0), nominal width ~50 ----------------
def mouths(lip, lw, lipfill=None, closed_lips=False):
    I, W, T = MOUTH_IN, TEETH, TONGUE
    teeth = lambda d: f'<path d="{d}" fill="{W}" stroke="none"/>'
    m = {}
    if closed_lips:
        m["X"] = f'<path d="M-19,0 Q-10,-7 0,-4 Q10,-7 19,0 Q10,8 0,9 Q-10,8 -19,0Z" fill="{lipfill}" stroke="{INK}" stroke-width="2.5"/>'
        m["A"] = f'<path d="M-20,0 Q0,-3 20,0" fill="none" stroke="{lipfill}" stroke-width="{lw+4}" stroke-linecap="round"/><path d="M-19,0 Q0,-2.5 19,0" fill="none" stroke="{INK}" stroke-width="2"/>'
    else:
        m["X"] = f'<path d="M-17,-1 Q0,6 17,-1" fill="none" stroke="{lip}" stroke-width="{lw}" stroke-linecap="round"/>'
        m["A"] = f'<path d="M-20,0 H20" fill="none" stroke="{lip}" stroke-width="{lw+3}" stroke-linecap="round"/>'
    m["B"] = (f'<path d="M-25,-7 Q0,-11 25,-7 Q27,0 25,7 Q0,11 -25,7 Q-27,0 -25,-7Z" fill="{I}" stroke="{lip}" stroke-width="{lw}"/>'
              + teeth("M-21,-7 Q0,-10 21,-7 L21,6 Q0,9 -21,6Z") + f'<path d="M-21,0 H21" stroke="{I}" stroke-width="2.5" fill="none"/>')
    m["C"] = (f'<path d="M-25,-9 Q0,-16 25,-9 Q26,21 0,23 Q-26,21 -25,-9Z" fill="{I}" stroke="{lip}" stroke-width="{lw}" stroke-linejoin="round"/>'
              + teeth("M-20,-10 Q0,-14 20,-10 L19,-2 Q0,-6 -19,-2Z") + f'<ellipse cx="0" cy="15" rx="12" ry="5" fill="{T}" stroke="none"/>')
    m["D"] = (f'<path d="M-28,-11 Q0,-20 28,-11 Q31,29 0,33 Q-31,29 -28,-11Z" fill="{I}" stroke="{lip}" stroke-width="{lw}" stroke-linejoin="round"/>'
              + teeth("M-22,-12 Q0,-18 22,-12 L21,-3 Q0,-8 -21,-3Z") + f'<path d="M-15,24 Q0,9 15,24 Q0,31 -15,24Z" fill="{T}" stroke="none"/>')
    m["E"] = (f'<path d="M-17,-12 Q0,-19 17,-12 Q22,7 17,19 Q0,25 -17,19 Q-22,7 -17,-12Z" fill="{I}" stroke="{lip}" stroke-width="{lw}" stroke-linejoin="round"/>'
              + teeth("M-12,-12 Q0,-16 12,-12 L11,-5 Q0,-8 -11,-5Z") + f'<ellipse cx="0" cy="14" rx="9" ry="4.5" fill="{T}" stroke="none"/>')
    m["F"] = (f'<ellipse cx="0" cy="2" rx="11" ry="12" fill="{I}" stroke="{lip}" stroke-width="{lw+3}"/>'
              f'<path d="M-19,-6 Q-15,2 -19,10 M19,-6 Q15,2 19,10" fill="none" stroke="{lip}" stroke-width="3" stroke-linecap="round"/>')
    m["G"] = (f'<path d="M-24,-6 Q0,-12 24,-6 Q24,6 0,9 Q-24,6 -24,-6Z" fill="{I}" stroke="{lip}" stroke-width="{lw}"/>'
              + teeth("M-20,-7 Q0,-11 20,-7 L17,4 Q0,7 -17,4Z") + f'<path d="M-21,4 Q0,17 21,4" fill="none" stroke="{lip}" stroke-width="{lw+3}" stroke-linecap="round"/>')
    m["H"] = (f'<path d="M-21,-8 Q0,-15 21,-8 Q23,15 0,19 Q-23,15 -21,-8Z" fill="{I}" stroke="{lip}" stroke-width="{lw}" stroke-linejoin="round"/>'
              + teeth("M-16,-9 Q0,-13 16,-9 L15,-3 Q0,-6 -15,-3Z") + f'<path d="M-10,-4 Q0,-8 10,-4 Q13,7 0,9 Q-13,7 -10,-4Z" fill="{T}" stroke="none"/>')
    return m


# ---- eye kit ----------------------------------------------------------------------------
def eye_open(c, lvl, st):
    """Return (left+right open eyes) as svg string drawn around (0,0); caller translates."""
    x, y = st.get("pos", (31, -8))
    if lvl == 1:
        r = st.get("r1", 6.5)
        return f'<g stroke="none" fill="{INK}"><circle cx="{-x}" cy="{y}" r="{r}"/><circle cx="{x}" cy="{y}" r="{r}"/></g>'
    rx, ry = st.get("rx", 13), st.get("ry", 8.5)
    lid = st.get("lid", 0.0)
    ir = st.get("ir", 5.8)
    droop = st.get("droop", 0)
    one = []
    for sgn in (-1, 1):
        g = [f'<g transform="translate({sgn*x} {y}) scale({-sgn} 1)">']
        g.append(f'<ellipse cx="0" cy="0" rx="{rx}" ry="{ry}" fill="#fff" stroke="none"/>')
        g.append(f'<circle cx="0" cy="{st.get("iy", 0.5)}" r="{ir}" fill="{c["iris"]}" stroke="none"/><circle cx="0" cy="{st.get("iy", 0.5)}" r="{f(ir*0.5)}" fill="{INK}" stroke="none"/>')
        g.append('<circle cx="2" cy="-2" r="1.6" fill="#fff" stroke="none"/>')
        top = -ry + 2 * ry * lid
        if lid > 0:
            g.append(f'<path d="M{-rx-3},{-ry-5} H{rx+3} V{f(top)} Q0,{f(top+4)} {-rx-3},{f(top+droop)}Z" fill="{c["skin"]}" stroke="none"/>')
        g.append(f'<path d="M{-rx-2},{f(top+droop*0.6)} Q0,{f(top-ry*0.9-2)} {rx+2},{f(top)}" fill="none" stroke="{INK}" stroke-width="{st.get("lidw", 3.6)}" stroke-linecap="round"/>')
        if lid > 0:
            g.append(f'<path d="M{-rx-2},{f(top+droop)} Q0,{f(top+4)} {rx+1},{f(top)}" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linecap="round"/>')
        if st.get("lashes"):
            g.append(f'<path d="M{rx+1},{f(top)} l8,-5 M{rx-1},{f(top+2)} l9,0 M{rx-4},{f(top-1)} l7,-8" fill="none" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
        if st.get("bags"):
            g.append(f'<path d="M{-rx+1},{ry+3} Q0,{ry+8} {rx-1},{ry+3}" fill="none" stroke="{c["shade"]}" stroke-width="3" stroke-linecap="round"/>')
        g.append("</g>")
        one.append("".join(g))
    return "".join(one)


def eye_closed(c, lvl, st):
    x, y = st.get("pos", (31, -8))
    if lvl == 1:
        return f'<g fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="round"><path d="M{-x-8},{y} H{-x+8}"/><path d="M{x-8},{y} H{x+8}"/></g>'
    rx = st.get("rx", 13)
    out = []
    for sgn in (-1, 1):
        g = f'<g transform="translate({sgn*x} {y}) scale({-sgn} 1)"><path d="M{-rx-2},-1 Q0,{6 + st.get("lid", 0)*2} {rx+2},-1" fill="none" stroke="{INK}" stroke-width="3.6" stroke-linecap="round"/>'
        if st.get("lashes"):
            g += f'<path d="M{rx+1},0 l8,3 M{rx-2},2 l8,7" fill="none" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>'
        out.append(g + "</g>")
    return "".join(out)


# ---- per-character kits ------------------------------------------------------------------
def P(d, fill, stroke=True, extra=""):
    s = "" if stroke else ' stroke="none"'
    return f'<path d="{d}" fill="{fill}"{s}{(" " + extra) if extra else ""}/>'


def strands(d, col, w=2.5):
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>'


def HF(fill_d, line_d, col):
    """front hair: filled mass with no outline plus an open stroked hairline (clean seam with the back hair)."""
    return f'<path d="{fill_d}" fill="{col}" stroke="none"/><path d="{line_d}" fill="none"/>'


def kit_einstein(c, lvl):
    k = dict(face_extra="", brows="", nose="", fhair="", acc="")
    # wind-blown white hair: rounded mass with a few long pointed wisps flaring outward at the sides and top
    k["back"] = P("M-76,-30 Q-100,-32 -110,-56 L-152,-92 L-112,-84 Q-116,-100 -108,-110 L-122,-136 L-92,-124 Q-86,-148 -62,-142 L-56,-170 L-34,-148 Q-14,-162 8,-150 Q28,-166 44,-148 L72,-170 L74,-140 Q100,-136 104,-114 L146,-104 L110,-84 Q130,-66 116,-54 L142,-30 L102,-36 Q96,-22 76,-30 Q60,-60 0,-66 Q-60,-60 -76,-30Z", c["hair"])
    k["body"] = _clothes_einstein(c, lvl)
    k["front"] = HF("M-80,-34 Q-92,-100 -30,-114 Q10,-124 50,-114 Q94,-100 80,-34 Q66,-58 46,-64 Q22,-72 0,-72 Q-24,-72 -46,-64 Q-66,-58 -80,-34Z",
                    "M-79,-34 Q-66,-58 -46,-64 Q-22,-72 0,-72 Q22,-72 46,-64 Q66,-58 79,-34", c["hair"])
    k["eye"] = dict(pos=(31, -6))
    if lvl == 2:
        k["eye"] = dict(pos=(31, -6), ry=8, lid=0.30, droop=3, bags=True, ir=5.6, lidw=3.2)
        k["front"] += strands("M-30,-70 Q-34,-92 -10,-108 M0,-72 Q6,-94 30,-108 M30,-68 Q52,-84 58,-102 M-58,-62 Q-70,-84 -56,-100", c["hair2"], 2.2)
        k["back"] += strands("M-98,-110 Q-78,-96 -86,-66 M96,-110 Q76,-94 84,-62 M-50,-134 Q-34,-112 -26,-124 M32,-136 Q40,-114 54,-124", c["hair2"], 2.2)
        k["face_extra"] = strands("M-40,-62 Q0,-69 40,-62 M-42,-52 Q0,-59 42,-52", c["shade"], 2.4)
        k["brows"] = (P("M-60,-22 Q-48,-44 -20,-38 Q-30,-32 -44,-26 Q-52,-22 -60,-22Z", c["brow"], extra='stroke-width="3"')
                      + P("M60,-22 Q48,-44 20,-38 Q30,-32 44,-26 Q52,-22 60,-22Z", c["brow"], extra='stroke-width="3"')
                      + strands("M-50,-34 l-3,-6 M-40,-37 l-1,-7 M50,-34 l3,-6 M40,-37 l1,-7", c["brow"], 2.6))
        k["nose"] = (P("M-3,-6 Q-11,14 -13,22 Q-9,31 2,30 Q14,29 12,21 Q8,16 6,10", c["skin"], extra='stroke-width="3.6"')
                     + strands("M-10,22 Q-6,26 -2,24 M6,23 Q9,24 11,22", INK, 2.6))
        k["fhair"] = (P("M-56,38 Q-30,20 0,34 Q30,20 56,38 Q68,60 50,68 Q26,56 0,54 Q-26,56 -50,68 Q-68,60 -56,38Z", c["stache"])
                      + strands("M-36,38 Q-24,46 -16,52 M36,38 Q24,46 16,52 M-48,50 Q-42,58 -34,62 M48,50 Q42,58 34,62", c["hair2"], 2.4))
    else:
        k["fhair"] = P("M-54,38 Q-28,22 0,36 Q28,22 54,38 Q66,60 48,68 Q24,56 0,54 Q-24,56 -48,68 Q-66,60 -54,38Z", c["stache"])
    return k


def _clothes_einstein(c, lvl):
    b = P("M-150,190 Q-146,128 -64,112 L64,112 Q146,128 150,190Z", c["cloth"])
    if lvl == 2:
        b += P("M-30,112 L0,168 L30,112 L22,108 Q0,126 -22,108Z", c["shirt"])
        b += P("M-64,112 L-30,112 L0,172 L-24,190 L-96,190 Q-98,140 -64,112Z", c["cloth2"], extra='opacity=".55" stroke="none"')
        b += strands("M-30,112 L0,168 L30,112 M-64,114 Q-40,150 -26,190 M64,114 Q40,150 26,190", INK, 3.2)
        sp = "".join(f'<path d="M{x},{y} l5,-2" stroke="{c["cloth2"]}" stroke-width="2" stroke-linecap="round"/>' for x, y in
                     [(-110, 150), (-96, 168), (-120, 176), (-80, 150), (-70, 178), (100, 150), (88, 170), (118, 178), (74, 148), (66, 180), (-100, 130), (104, 130)])
        b += sp
    else:
        b += P("M-28,112 L0,150 L28,112Z", c["shirt"])
    return b


def kit_muir(c, lvl):
    k = {"fhair": "", "brows": "", "nose": "", "face_extra": "", "acc": "", "front": ""}
    # long hair behind head, falls past the ears
    k["back"] = P("M-92,-10 Q-104,40 -92,96 L-70,100 L70,100 L92,96 Q104,40 92,-10 Q70,-90 0,-96 Q-70,-90 -92,-10Z", c["hair"])
    body = P("M-150,190 Q-150,132 -70,114 L70,114 Q150,132 150,190Z", c["shirt"])
    body += P("M-72,114 L-30,114 L-6,190 L-80,190 Q-84,140 -72,114Z", c["vest"], stroke=True)
    body += P("M72,114 L30,114 L6,190 L80,190 Q84,140 72,114Z", c["vest"])
    if lvl == 2:
        body += strands("M-110,140 Q-118,166 -112,190 M110,140 Q118,166 112,190", c["hair2"], 2.4)
        body += P("M-22,116 L0,130 L22,116 L16,142 L0,134 L-16,142Z", c["hat2"], extra='stroke-width="3"')
    k["body"] = body
    # beard: long, rounded, wavy hem; moustache mass at top
    beard = "M-70,-4 Q-90,40 -74,92 Q-60,138 -22,158 Q0,166 22,158 Q60,138 74,92 Q90,40 70,-4 Q56,40 30,46 Q14,38 0,42 Q-14,38 -30,46 Q-56,40 -70,-4Z"
    k["fhair"] = P(beard, c["beard"])
    if lvl == 2:
        k["fhair"] += strands("M-56,60 Q-50,100 -34,134 M-30,64 Q-26,104 -14,146 M0,70 Q0,110 2,152 M30,64 Q26,104 14,146 M56,60 Q50,100 34,134", c["beard2"], 2.4)
        k["fhair"] += P("M-38,38 Q-18,28 0,36 Q18,28 38,38 Q24,50 0,46 Q-24,50 -38,38Z", c["beard"], extra='stroke-width="3.2"')
        k["brows"] = (P("M-50,-30 Q-34,-40 -14,-30 Q-30,-30 -50,-26Z", c["brow"], extra='stroke-width="3"') + P("M50,-30 Q34,-40 14,-30 Q30,-30 50,-26Z", c["brow"], extra='stroke-width="3"'))
        k["nose"] = P("M-3,-8 Q-9,12 -10,20 Q-4,28 8,24 Q13,18 4,12", c["skin"], extra='stroke-width="3.4"')
        k["face_extra"] = strands("M-46,-58 Q0,-68 46,-58 M-50,-8 Q-44,2 -46,12 M50,-8 Q44,2 46,12", c["shade"], 2.4)
        k["eye"] = dict(pos=(29, -10), ry=7, lid=0.25, ir=5.4, bags=False)
    else:
        k["eye"] = dict(pos=(29, -10))
    # soft felt hat, dented crown, moderate brim
    hat = P("M-60,-66 Q-62,-124 -2,-128 Q56,-128 60,-66 Q0,-80 -60,-66Z", c["hat"])
    hat += P("M-112,-60 Q-60,-84 0,-80 Q60,-84 112,-60 Q114,-48 100,-46 Q50,-62 0,-62 Q-50,-62 -100,-46 Q-114,-48 -112,-60Z", c["hat"])
    if lvl == 2:
        hat += P("M-60,-68 Q0,-82 60,-68 L58,-60 Q0,-72 -58,-60Z", c["hat2"], extra='stroke-width="3"')
        hat += strands("M-28,-120 Q0,-108 28,-120", c["hat2"], 2.6)
    k["hat"] = hat
    return k


def kit_lamarr(c, lvl):
    k = {"fhair": "", "brows": "", "nose": "", "face_extra": "", "acc": "", "hat": ""}
    # back hair: voluminous shoulder-length waves, widest at the bottom, curled tips
    k["back"] = P("M-88,-30 Q-116,-100 -62,-124 Q0,-144 62,-124 Q116,-100 88,-30 Q112,20 104,72 Q120,108 94,136 Q72,120 78,98 Q66,102 58,128 Q42,114 48,94 L-48,94 Q-42,114 -58,128 Q-66,102 -78,98 Q-72,120 -94,136 Q-120,108 -104,72 Q-112,20 -88,-30Z", c["hair"])
    body = P("M-150,190 Q-146,130 -64,112 L64,112 Q146,130 150,190Z", c["cloth"])
    if lvl == 2:
        body += P("M-34,106 Q-17,122 0,110 Q17,122 34,106 L36,126 Q0,142 -36,126Z", c["cloth2"], extra='stroke-width="3"')
        body += (f'<g transform="translate(-50 152) rotate(-24)" stroke-width="3">'
                 + P("M0,0 C-6,-14 -2,-30 6,-40 C12,-26 10,-12 0,0Z M0,0 C-14,-8 -24,-8 -34,-2 C-24,2 -12,4 0,0Z M0,0 C6,-8 14,-10 24,-8 C16,-2 8,2 0,0Z", c["brooch"])
                 + '</g>')
    else:
        body += '<g transform="translate(-50 150)" stroke-width="4">' + P("M0,-14 L12,0 L0,14 L-12,0Z", c["brooch"]) + "</g>"
    k["body"] = body
    # front hair: centre part, two lobes swept to the temples, waves falling past the ears
    k["front"] = HF("M0,-98 Q-76,-110 -88,-30 Q-96,12 -88,56 Q-76,34 -74,4 Q-72,-38 -50,-58 Q-24,-76 0,-92Z M0,-98 Q76,-110 88,-30 Q96,12 88,56 Q76,34 74,4 Q72,-38 50,-58 Q24,-76 0,-92Z",
                    "M0,-92 Q-24,-76 -50,-58 Q-72,-38 -74,4 Q-76,34 -88,56 M0,-92 Q24,-76 50,-58 Q72,-38 74,4 Q76,34 88,56", c["hair"])
    if lvl == 2:
        k["front"] += strands("M-10,-100 Q-52,-94 -70,-56 M10,-100 Q52,-94 70,-56 M-88,-10 Q-94,24 -88,46 M88,-10 Q94,24 88,46", c["hair2"], 2.4)
        k["back"] += strands("M-92,60 Q-84,92 -72,112 M92,60 Q84,92 72,112 M-74,-104 Q-94,-72 -98,-40", c["hair2"], 2.4)
        k["brows"] = strands("M-52,-30 Q-36,-46 -12,-34 M52,-30 Q36,-46 12,-34", c["brow"], 4.4)
        k["nose"] = strands("M-2,-4 Q-6,14 -9,22 Q-2,28 8,22", INK, 3.2) + strands("M5,2 Q8,12 7,18", c["shade"], 2.6)
        k["face_extra"] = strands("M-54,28 Q-40,36 -30,34 M54,28 Q40,36 30,34", c["shade"], 2.4)
        k["eye"] = dict(pos=(29, -10), rx=13, ry=8, ir=5.6, lashes=True, lidw=4.2, bags=False)
    else:
        k["eye"] = dict(pos=(28, -10))
    return k


def kit_albright(c, lvl):
    k = {"fhair": "", "brows": "", "nose": "", "face_extra": "", "hat": "", "acc": ""}
    # chin-length bob, rounded outward at the ends
    k["back"] = P("M-90,-24 Q-100,-98 -40,-114 Q16,-128 64,-108 Q106,-86 92,-18 Q106,28 98,64 Q82,78 66,68 L-66,68 Q-82,78 -98,64 Q-106,28 -90,-24Z", c["hair"])
    body = P("M-150,190 Q-146,132 -64,114 L64,114 Q146,132 150,190Z", c["cloth"])
    if lvl == 2:
        for x, y in [(-104, 138), (-90, 130), (-76, 124), (88, 128), (102, 140)]:
            body += f'<circle cx="{x}" cy="{y}" r="4.6" fill="{c["gold"]}" stroke-width="2.4"/>'
        body += strands("M-30,98 Q0,150 30,98", c["gold"], 3.2)
    else:
        body += strands("M-30,98 Q0,150 30,98", c["gold"], 4)
    k["body"] = body
    # side-parted, swept fringe; soft locks fall in front of the ears
    k["front"] = HF("M-86,-20 Q-98,-96 -26,-104 Q36,-114 78,-88 Q94,-56 86,-20 Q70,-56 36,-68 Q6,-62 -30,-80 Q-62,-62 -86,-20Z M-86,-20 Q-100,20 -92,58 Q-78,40 -76,6Z M86,-20 Q100,20 92,58 Q78,40 76,6Z",
                    "M-84,-22 Q-62,-60 -30,-80 Q6,-62 36,-68 Q70,-56 84,-22 M-86,-12 Q-78,16 -92,58 M86,-12 Q78,16 92,58", c["hair"])
    if lvl == 2:
        k["front"] += strands("M-30,-98 Q-12,-84 -22,-70 M10,-104 Q40,-86 32,-72 M-84,-30 Q-88,0 -84,34 M84,-30 Q88,0 84,34", c["hair2"], 2.4)
        k["brows"] = strands("M-48,-30 Q-34,-40 -16,-33 M48,-30 Q34,-40 16,-33", c["brow"], 4.6)
        k["nose"] = strands("M-3,-4 Q-6,14 -9,20 Q0,27 9,20", INK, 3.2)
        k["face_extra"] = strands("M-54,24 Q-46,38 -36,46 M54,24 Q46,38 36,46", c["shade"], 2.4)
        k["acc"] = f'<circle cx="-80" cy="34" r="5" fill="{c["gold"]}" stroke-width="2.4"/><circle cx="80" cy="34" r="5" fill="{c["gold"]}" stroke-width="2.4"/>'
        k["eye"] = dict(pos=(31, -9), ry=8, ir=5.8, lid=0.1)
    else:
        k["eye"] = dict(pos=(30, -9))
    return k


def kit_naismith(c, lvl):
    k = {"brows": "", "nose": "", "face_extra": "", "acc": "", "hat": ""}
    k["back"] = P("M-82,-30 Q-88,-86 -30,-100 Q30,-108 72,-88 Q88,-62 82,-30 Q64,-50 0,-52 Q-60,-50 -82,-30Z", c["hair"])
    body = P("M-150,190 Q-146,130 -66,114 L66,114 Q146,130 150,190Z", c["cloth"])
    body += P("M-34,104 L-34,124 L0,150 L34,124 L34,104 Q0,118 -34,104Z", c["collar"])
    body += P("M-18,128 L0,134 L18,128 L18,144 L0,138 L-18,144Z", c["tie"])
    if lvl == 2:
        body += strands("M-66,118 L-24,190 M66,118 L24,190", c["cloth2"], 3)
        body += strands("M-110,150 V190 M-86,138 V190 M86,138 V190 M110,150 V190", c["cloth2"], 2)
    k["body"] = body
    # smooth hair, off-centre part, temples receding
    k["front"] = HF("M-80,-30 Q-88,-92 -30,-104 Q30,-112 72,-90 Q88,-62 80,-30 Q66,-60 32,-70 Q0,-76 -26,-70 Q-60,-62 -80,-30Z",
                    "M-79,-32 Q-60,-62 -26,-70 Q4,-76 32,-70 Q64,-62 79,-32", c["hair"])
    k["fhair"] = P("M-58,36 Q-34,22 0,34 Q34,22 58,36 Q66,56 50,62 Q28,52 0,50 Q-28,52 -50,62 Q-66,56 -58,36Z", c["stache"])
    k["eye"] = dict(pos=(30, -9))
    if lvl == 2:
        k["front"] += strands("M-26,-70 Q-22,-88 -30,-102 M-44,-92 Q-34,-80 -26,-70 M40,-98 Q56,-90 66,-78", c["hair2"], 2.4)
        k["brows"] = (P("M-54,-26 Q-34,-40 -12,-28 Q-34,-27 -54,-22Z", c["brow"], extra='stroke-width="3"') + P("M54,-26 Q34,-40 12,-28 Q34,-27 54,-22Z", c["brow"], extra='stroke-width="3"'))
        k["nose"] = P("M-4,-8 Q-9,12 -11,20 Q-2,28 10,22 Q14,18 6,12", c["skin"], extra='stroke-width="3.4"')
        k["face_extra"] = strands("M-66,10 Q-62,34 -52,52 M66,10 Q62,34 52,52", c["shade"], 2.4)
        k["fhair"] += strands("M-32,38 Q-20,44 -14,48 M32,38 Q20,44 14,48", c["hair2"], 2.2)
        k["eye"] = dict(pos=(31, -9), ry=7.2, lid=0.18, ir=5.3)
    return k


def kit_guide(c, lvl):
    k = {"fhair": "", "nose": "", "face_extra": "", "hat": "", "brows": "", "acc": ""}
    # original design: soft curly cap of hair, teal blazer, ochre scarf, round glasses, lanyard badge
    k["back"] = P("M-90,-8 Q-100,-60 -76,-86 Q-70,-120 -34,-116 Q-20,-140 14,-126 Q44,-140 62,-114 Q96,-100 88,-62 Q100,-30 90,-8 Q80,-26 70,-30 L-70,-30 Q-80,-26 -90,-8Z", c["hair"])
    body = P("M-150,190 Q-146,132 -64,114 L64,114 Q146,132 150,190Z", c["cloth"])
    body += P("M-58,112 Q0,142 58,112 L64,136 Q0,168 -64,136Z", c["acc"])
    if lvl == 2:
        body += strands("M-40,124 L-36,150 M0,134 L0,160 M40,124 L36,150", c["cloth2"], 2.6)
        body += strands("M-30,150 L-36,170 M30,150 L36,170", INK, 2.4)
        body += P("M-46,166 H-14 V190 H-46Z", c["badge"], extra='stroke-width="3"')
        body += f'<circle cx="-30" cy="177" r="5" fill="{c["acc"]}" stroke-width="2"/>'
    else:
        body += P("M-40,164 H-12 V190 H-40Z", c["badge"])
    k["body"] = body
    k["front"] = HF("M-86,-22 Q-90,-72 -50,-86 Q-20,-104 14,-98 Q58,-98 82,-60 Q90,-40 86,-22 Q70,-54 40,-62 Q0,-66 -40,-62 Q-70,-54 -86,-22Z",
                    "M-85,-24 Q-70,-54 -40,-62 Q0,-66 40,-62 Q70,-54 85,-24", c["hair"])
    k["glasses"] = (f'<g fill="none" stroke="{c["glass"]}" stroke-width="{5 if lvl == 2 else 6}"><circle cx="-31" cy="-8" r="21"/><circle cx="31" cy="-8" r="21"/><path d="M-10,-10 Q0,-17 10,-10"/><path d="M-52,-8 L-66,-14 M52,-8 L66,-14"/></g>')
    k["eye"] = dict(pos=(31, -8))
    if lvl == 2:
        k["front"] += strands("M-50,-92 Q-30,-84 -22,-96 M2,-100 Q22,-92 34,-102 M52,-96 Q70,-84 74,-70", c["hair2"], 2.6)
        k["brows"] = strands("M-48,-40 Q-32,-48 -16,-42 M48,-40 Q32,-48 16,-42", c["brow"], 4.8)
        k["nose"] = strands("M-2,2 Q-6,16 -2,22 Q4,24 8,20", INK, 3)
        k["face_extra"] = f'<g fill="{c["cheek"]}" opacity=".45" stroke="none"><ellipse cx="-50" cy="24" rx="12" ry="8"/><ellipse cx="50" cy="24" rx="12" ry="8"/></g>'
        k["eye"] = dict(pos=(31, -8), ry=8.5, ir=6, lid=0.0, lidw=3.2)
    return k


KITS = dict(guide=kit_guide, einstein=kit_einstein, muir=kit_muir, lamarr=kit_lamarr, albright=kit_albright, naismith=kit_naismith)


def build(name, lvl, mouth="X", with_defs=True):
    c = PAL[name]
    k = KITS[name](c, lvl)
    w, jw, cw, cy = FACE[name]
    pfx = f"{name}-L{lvl}"
    lw = 6 if lvl == 1 else 4.6
    lipcol = c.get("lip", INK) if name in ("lamarr", "albright") else INK
    closed = name in ("lamarr", "albright")
    lipfill = c.get("lip") if closed else None
    mset = mouths(lipcol if name == "lamarr" else INK, lw, lipfill=lipfill, closed_lips=closed)
    if name == "lamarr":
        # red lips on open shapes: thicker ring in lipstick red
        mset = mouths(c["lips"], lw + 2, lipfill=c["lips"], closed_lips=True)
    if name == "albright":
        mset = mouths(INK, lw, lipfill=c["lip"], closed_lips=True)
    mx, my, ms = MOUTH_AT[name]
    eye = k.get("eye", {})
    eo = eye_open(c, lvl, eye)
    ec = eye_closed(c, lvl, eye)
    skin = c["skin"]
    defs = "".join(f'<g id="{pfx}-m-{s}">{mset[s]}</g>' for s in SHAPES)
    defs += f'<g id="{pfx}-e-open">{eo}</g><g id="{pfx}-e-closed">{ec}</g>'
    ears = (f'<g fill="{skin}"><ellipse cx="{-w}" cy="8" rx="10" ry="17"/><ellipse cx="{w}" cy="8" rx="10" ry="17"/></g>' if not k.get("acc_noear") else "")
    cheeks = "" if lvl == 1 or name in ("lamarr",) else f'<g fill="{c["cheek"]}" opacity=".38" stroke="none"><ellipse cx="{-(w-24)}" cy="24" rx="12" ry="8"/><ellipse cx="{w-24}" cy="24" rx="12" ry="8"/></g>'
    neck = f'<path d="M-26,60 L-28,126 L28,126 L26,60Z" fill="{skin}"/><path d="M-27,100 Q0,128 27,100 L28,126 L-28,126Z" fill="{c["shade"]}" stroke="none"/>' if lvl == 2 else f'<path d="M-26,60 L-28,126 L28,126 L26,60Z" fill="{skin}"/>'
    face = f'<path d="{face_d(w, jw, cw, cy)}" fill="{skin}"/>'
    head = [
        k.get("back", ""), ears, face, cheeks, k.get("face_extra", ""), k.get("nose", ""),
        f'<g class="eyes"><use class="eye-state" href="#{pfx}-e-open"/></g>',
        k.get("brows", ""),
        f'<g transform="translate({mx} {my}) scale({ms})"><use class="mouth" href="#{pfx}-m-{mouth}"/></g>',
        k.get("fhair", ""), k.get("front", ""), k.get("glasses", ""), k.get("hat", ""), k.get("acc", ""),
    ]
    # Muir: beard drawn after face but long hair goes behind; mouth must sit on the beard
    if name == "muir":
        head = [k["back"], ears, face, cheeks, k["face_extra"], k["nose"],
                f'<g class="eyes"><use class="eye-state" href="#{pfx}-e-open"/></g>', k["brows"],
                k["fhair"],
                f'<g transform="translate({mx} {my}) scale({ms})"><use class="mouth" href="#{pfx}-m-{mouth}"/></g>',
                (P("M-40,38 Q-18,28 0,36 Q18,28 40,38 Q24,52 0,48 Q-24,52 -40,38Z", c["beard"], extra='stroke-width="3.2"') if lvl == 2 else P("M-40,38 Q-18,28 0,36 Q18,28 40,38 Q24,52 0,48 Q-24,52 -40,38Z", c["beard"])),
                k["hat"]]
    title = f'{META[name]["name"]}: {META[name]["role"]} (level L{lvl})'
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VIEW}" role="img" aria-label="{title}" data-char="{name}" data-level="L{lvl}">'
           + (f'<title>{title}</title><defs>{defs}</defs>' if with_defs else '') +
           f'<g stroke="{INK}" stroke-width="{5.2 if lvl == 1 else 4.4}" stroke-linejoin="round" stroke-linecap="round">'
           f'<g class="rig-body">{k.get("body", "")}{neck}</g><g class="rig-head">{"".join(head)}</g></g></svg>')
    return svg


def main():
    os.makedirs(OUT, exist_ok=True)
    manifest = {"viewBox": VIEW, "shapes": SHAPES, "characters": {}}
    total_raw = total_gz = 0
    for name in KITS:
        manifest["characters"][name] = dict(META[name], face=FACE[name], mouth=MOUTH_AT[name], levels={})
        for lvl in (1, 2):
            svg = build(name, lvl)
            p = os.path.join(OUT, f"{name}-L{lvl}.svg")
            open(p, "w", encoding="utf-8").write(svg)
            raw = len(svg.encode()); gz = len(gzip.compress(svg.encode(), 9))
            manifest["characters"][name]["levels"][f"L{lvl}"] = dict(file=f"characters/{name}-L{lvl}.svg", bytes=raw, gzip=gz)
            total_raw += raw; total_gz += gz
    manifest["total_bytes"] = total_raw
    manifest["total_gzip"] = total_gz
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
    print(json.dumps({n: {l: v["bytes"] for l, v in d["levels"].items()} for n, d in manifest["characters"].items()}))
    print("total raw", total_raw, "total gzip(sum of files)", total_gz)


if __name__ == "__main__":
    main()
