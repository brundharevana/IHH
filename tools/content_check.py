# tools/content_check.py
"""Validate experience content (content/<slug>/chapters/*.json) against verified pipeline data.

Usage: python3 tools/content_check.py <slug> [--content content] [--data data] [--aerial site/public/aerial]
       python3 tools/content_check.py --home [--content content] [--data data]   (content/home.json)
       python3 tools/content_check.py --scans [--content content] [--public site/public]   (content/scans: artwork clearance)
       python3 tools/content_check.py --hall [--content content] [--data data] [--public site/public]   (content/hall.json)
Exit 1 on any error.
"""
import argparse, datetime, json, math, re, sys
from pathlib import Path
from urllib.parse import urlparse
from ihh import gates, paths, records
import validate
from ihh.rights import EMBEDDABLE as USABLE
ROOMS = {"chapter-gallery", "reconstructed-place"}
ALLOWED_TYPES = {"framed-document", "framed-photograph", "wall-quote", "360-document", "vitrine-object", "plinth-object", "portrait-niche", "media-screen"}
WALLS = {"north", "east", "south", "west"}
# Evidence kinds an exhibit may carry; the site shows each as plain language
# (site/src/content/load.js EVIDENCE_LABELS, pinned by a test).
EVIDENCE = {"record", "photograph", "reconstruction"}
# Reconstructed-place rules; must agree with site/src/museum/reconstruction.js validatePlace
# (shared cases: tools/tests/fixtures/place_cases.json).
PLACE_KINDS = ["desk", "chair", "shelf", "window", "door", "lamp", "document", "table", "bookcase", "blackboard"]
PLACE_WALLS = ["north", "east", "south", "west"]
# Sub-objects drawn ON a piece of furniture; each is declared as an item of its own (kind, parent
# item id, basis_media_ids) and the site renders it only if declared. Value = the parent's kind.
SUB_KINDS = {"books": "bookcase", "papers": "desk", "book-stack": "desk"}
_EPS = 1e-6
# Mirrors of reconstruction.js PLACE_MIN, AGAINST_WALL and EXHIBIT_FOOTPRINT (frame centre 1.6 m,
# layout.js HEIGHTS.frameCentre); both are pinned to tools/tests/fixtures/place_cases.json.
PLACE_MIN = {"w": 2, "d": 2, "h": 2.2}
AGAINST_WALL = 0.3
EXHIBIT_FOOTPRINT = {
    "default": {"halfWidth": 0.6, "bottom": 1.1, "top": 2.3},
    "360-document": {"halfWidth": 0.3, "bottom": 0, "top": 1.45},
}
_SLOT_AXIS = {"north": "x", "south": "x", "east": "z", "west": "z"}

def _sub_kind(k):
    return isinstance(k, str) and k in SUB_KINDS

def _slot_centre(place, wall, slot):
    """Along-wall centre of a slot, as layout.js resolveSlot (slot 1 on the visitor's left)."""
    length = place["w"] if _SLOT_AXIS[wall] == "x" else place["d"]
    along = -length / 2 + length / 5 * slot
    return -along if wall in ("south", "west") else along

def _num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)

def _pos(v):
    return _num(v) and v > 0

def _page(v):
    return isinstance(v, int) and not isinstance(v, bool) and v >= 1

def validate_place(place, basis_ids=(), exhibits=()):
    """Return a list of errors for a reconstructed place; [] means it may be built.
    `exhibits` are the chapter's exhibits: none may cover an item standing against its wall."""
    if not isinstance(place, dict):
        return ["place must be an object"]
    errors = []
    for k in ("w", "d", "h"):
        if not _num(place.get(k)): errors.append(f"place {k} must be a positive number")
        elif place[k] < PLACE_MIN[k]: errors.append(f"place {k} must be at least {PLACE_MIN[k]:g} m")
    items = place.get("items")
    if not isinstance(items, list) or not items:
        errors.append("place items must be a non-empty list")
    unseen = place.get("unseen")
    if not isinstance(unseen, list):
        errors.append("place unseen must be a list of walls")
    else:
        seen = set()
        for wall in unseen:
            if wall not in PLACE_WALLS: errors.append(f"place unseen: {wall} is not a wall ({', '.join(PLACE_WALLS)})")
            elif wall in seen: errors.append(f"place unseen: {wall} listed twice")
            else: seen.add(wall)
    def is_sub(it):
        return isinstance(it, dict) and (_sub_kind(it.get("kind")) or "parent" in it or "basis_media_ids" in it)
    by_id = {}  # furniture item id -> kind (a sub-object is never a parent)
    for i, it in enumerate(items if isinstance(items, list) else []):
        if not isinstance(it, dict) or is_sub(it) or "id" not in it: continue
        if not isinstance(it["id"], str) or not it["id"].strip(): errors.append(f"item {i}: id must be a non-empty string")
        elif it["id"] in by_id: errors.append(f"item {i}: id {it['id']} used twice")
        else: by_id[it["id"]] = it.get("kind")
    room_ok = all(_num(place.get(k)) and place[k] >= PLACE_MIN[k] for k in ("w", "d", "h"))
    basis = set(basis_ids)
    boxes = []
    for i, it in enumerate(items if isinstance(items, list) else []):
        at = f"item {i}"
        if not isinstance(it, dict):
            errors.append(f"{at}: must be an object"); continue
        if is_sub(it):
            kind, parent = it.get("kind"), it.get("parent")
            if not _sub_kind(kind):
                errors.append(f"{at}: kind {kind} is not one of {', '.join(PLACE_KINDS)} or the sub-objects {', '.join(SUB_KINDS)}")
            if not isinstance(parent, str) or not parent.strip(): errors.append(f"{at}: needs a parent item id")
            elif parent not in by_id: errors.append(f"{at}: parent {parent} is not an item")
            elif _sub_kind(kind) and by_id[parent] != SUB_KINDS[kind]:
                errors.append(f"{at}: {kind} must stand on a {SUB_KINDS[kind]}, not a {by_id[parent]}")
            bm = it.get("basis_media_ids")
            if not isinstance(bm, list) or not bm: errors.append(f"{at}: needs basis_media_ids")
            else:
                for b in bm:
                    if not isinstance(b, str) or b not in basis: errors.append(f"{at}: basis {b} is not one of the reconstruction basis photos")
            continue
        if it.get("kind") not in PLACE_KINDS:
            errors.append(f"{at}: kind {it.get('kind')} is not one of {', '.join(PLACE_KINDS)}")
        ok = True
        for k in ("x", "z", "rotY"):
            if not _num(it.get(k)): errors.append(f"{at}: {k} must be a number"); ok = False
        if "y" in it and not _num(it["y"]): errors.append(f"{at}: y must be a number"); ok = False
        for k in ("w", "d", "h"):
            if not _pos(it.get(k)): errors.append(f"{at}: {k} must be a positive number"); ok = False
        b = it.get("basis")
        if not isinstance(b, str) or not b.strip(): errors.append(f"{at}: needs a basis photo id")
        elif not isinstance(b, str) or b not in basis: errors.append(f"{at}: basis {b} is not one of the reconstruction basis photos")
        if ok and room_ok:
            c, s = abs(math.cos(it["rotY"])), abs(math.sin(it["rotY"]))
            hx, hz, y = c * it["w"] / 2 + s * it["d"] / 2, s * it["w"] / 2 + c * it["d"] / 2, it.get("y", 0)
            if (abs(it["x"]) + hx > place["w"] / 2 + _EPS or abs(it["z"]) + hz > place["d"] / 2 + _EPS
                    or y < 0 or y + it["h"] > place["h"] + _EPS):
                errors.append(f"{at}: outside the room")
            boxes.append({"i": i, "kind": it.get("kind"), "x0": it["x"] - hx, "x1": it["x"] + hx,
                          "z0": it["z"] - hz, "z1": it["z"] + hz, "y0": y, "y1": y + it["h"]})
    if room_ok:
        for ex in exhibits or []:
            if not isinstance(ex, dict) or ex.get("wall") not in _SLOT_AXIS: continue  # layout checks report these
            slot = ex.get("slot")
            if not isinstance(slot, int) or isinstance(slot, bool) or not 1 <= slot <= 4: continue
            fp = EXHIBIT_FOOTPRINT.get(ex.get("type"), EXHIBIT_FOOTPRINT["default"])
            wall, axis = ex["wall"], _SLOT_AXIS[ex["wall"]]
            c = _slot_centre(place, wall, slot); lo, hi = c - fp["halfWidth"], c + fp["halfWidth"]
            for b in boxes:
                against = {"north": b["z0"] <= -place["d"] / 2 + AGAINST_WALL, "south": b["z1"] >= place["d"] / 2 - AGAINST_WALL,
                           "west": b["x0"] <= -place["w"] / 2 + AGAINST_WALL, "east": b["x1"] >= place["w"] / 2 - AGAINST_WALL}[wall]
                a0, a1 = (b["x0"], b["x1"]) if axis == "x" else (b["z0"], b["z1"])
                if (against and a0 < hi - _EPS and a1 > lo + _EPS
                        and b["y0"] < fp["top"] - _EPS and b["y1"] > fp["bottom"] + _EPS):
                    errors.append(f"exhibit {ex.get('id')}: covers item {b['i']} ({b['kind']}) on the {wall} wall")
    return errors

# The recreated study corner (Task 6, content/<slug>/study-corner.json) in a scanned chapter room.
# Same rules as site/src/museum/reconstruction.js validateCorner (shared cases in
# tools/tests/fixtures/corner_cases.json): every object is declared, cites the corner's basis
# photographs, and stands inside the reserved area without overlapping another; sub-objects stand on
# a parent of the right kind; a model's mesh may carry a sub-object only when the corner declares it.
CORNER_KINDS = ["desk", "chair", "shelf", "lamp", "table", "bookcase"]
LABEL_SIGN = {"w": 0.8, "d": 0.08, "h": 0.36}
CORNER_LABEL_PREFIX = "Recreation based on photographs: "
# The corner's fixed disclosures as the site publishes them (site/src/museum/reconstruction.js
# CORNER_NOTE on its plaque, CORNER_WHERE_LITE on the Lite page; pinned by corner_cases.json). A
# museum-note narration line may use their words (owner review 4, 2026-10-14).
CORNER_NOTE = "Modern stand-in furniture of the kinds these two photographs show. The designs are not the originals; sizes and positions are estimated."
CORNER_WHERE_LITE = "In the 3D museum, this recreated corner stands in the room for this chapter."
# Narration line kinds: absent (the guide states facts) or "museum-note" (a disclosure about the
# museum itself, such as the recreated study corner; check_museum_notes).
MUSEUM_NOTE = "museum-note"
MUSEUM_NOTE_FIELDS = ("media_ids", "frames")
CORNER_LICENCES = {"CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/", "CC0 1.0": "https://creativecommons.org/publicdomain/zero/1.0/"}
CATALOGUE_ID = re.compile(r"\b\d{1,3}-[A-Z]{1,3}-\d+\b")

def _footprint(x, z, rot, w, d):
    c, s = abs(math.cos(rot)), abs(math.sin(rot))
    hx, hz = c * w / 2 + s * d / 2, s * w / 2 + c * d / 2
    return (x - hx, x + hx, z - hz, z + hz)

def _inside(fp, area):
    return (fp[0] >= area["min"][0] - _EPS and fp[1] <= area["max"][0] + _EPS
            and fp[2] >= area["min"][1] - _EPS and fp[3] <= area["max"][1] + _EPS)

def _overlap(a, b):
    return a[0] < b[1] - _EPS and b[0] < a[1] - _EPS and a[2] < b[3] - _EPS and b[2] < a[3] - _EPS

def validate_corner(corner, area):
    """Errors for a study corner against its area {id, min: [x, z], max: [x, z]}; [] means it may be built."""
    if not isinstance(corner, dict):
        return ["corner must be an object"]
    errors = []
    basis = corner.get("basis_media_ids")
    if not isinstance(basis, list) or not basis or not all(isinstance(b, str) and b for b in basis):
        errors.append("basis_media_ids must be a non-empty list"); basis = []
    basis = set(basis)
    objs = corner.get("objects")
    if not isinstance(objs, list) or not objs:
        errors.append("objects must be a non-empty list"); objs = []
    models = corner.get("models") if isinstance(corner.get("models"), dict) else {}
    ids, furniture, subs = set(), {}, {}
    for i, o in enumerate(objs):
        if not isinstance(o, dict):
            errors.append(f"object {i}: must be an object"); continue
        oid = o.get("id")
        if not isinstance(oid, str) or not oid.strip():
            errors.append(f"object {i}: id must be a non-empty string"); continue
        if oid in ids: errors.append(f"id {oid} used twice")
        ids.add(oid)
    for o in objs:
        if isinstance(o, dict) and isinstance(o.get("id"), str) and "parent" not in o and o["id"] not in furniture:
            furniture[o["id"]] = o
    boxes = []
    for i, o in enumerate(objs):
        if not isinstance(o, dict) or not isinstance(o.get("id"), str): continue
        at = f"object {o['id']}"
        bm = o.get("basis_media_ids")
        if not isinstance(bm, list) or not bm: errors.append(f"{at}: needs basis_media_ids")
        else:
            for b in bm:
                if b not in basis: errors.append(f"{at}: basis {b} is not one of the corner's basis photos")
        if "parent" in o:
            kind, parent = o.get("kind"), o.get("parent")
            if not _sub_kind(kind): errors.append(f"{at}: kind {kind} is not one of the sub-objects {', '.join(SUB_KINDS)}")
            if parent not in furniture: errors.append(f"{at}: parent {parent} is not an object")
            elif _sub_kind(kind) and furniture[parent].get("kind") != SUB_KINDS[kind]:
                errors.append(f"{at}: {kind} must stand on a {SUB_KINDS[kind]}, not a {furniture[parent].get('kind')}")
            else:
                subs.setdefault(parent, set()).add(kind)
            continue
        if o.get("kind") not in CORNER_KINDS:
            errors.append(f"{at}: kind {o.get('kind')} is not one of {', '.join(CORNER_KINDS)}")
        ok = True
        for k in ("x", "z", "rotY"):
            if not _num(o.get(k)): errors.append(f"{at}: {k} must be a number"); ok = False
        for k in ("w", "d", "h"):
            if not _pos(o.get(k)): errors.append(f"{at}: {k} must be a positive number"); ok = False
        if "model" in o and o["model"] not in models:
            errors.append(f"{at}: model {o['model']} is not in models")
        if ok:
            fp = _footprint(o["x"], o["z"], o["rotY"], o["w"], o["d"])
            if not _inside(fp, area): errors.append(f"{at}: outside the area {area.get('id')}")
            for oid, other in boxes:
                if _overlap(fp, other): errors.append(f"objects {oid} and {o['id']} overlap")
            boxes.append((o["id"], fp))
    users = {}
    for o in furniture.values():
        if "model" in o: users.setdefault(o["model"], []).append(o["id"])
    for mid, spec in models.items():
        if mid not in users: errors.append(f"model {mid} is not used by any object"); continue
        if len(users[mid]) > 1: errors.append(f"model {mid} is used by more than one object"); continue
        for kind in (spec or {}).get("includes") or []:
            if not _sub_kind(kind): errors.append(f"model {mid} includes {kind}, which is not a sub-object kind")
            elif kind not in subs.get(users[mid][0], set()):
                errors.append(f"model {mid} includes {kind}, which is not declared on object {users[mid][0]}")
    la = corner.get("label_at")
    if not (isinstance(la, dict) and all(_num(la.get(k)) for k in ("x", "z", "rotY"))):
        errors.append("label_at must be {x, z, rotY}")
    else:
        fp = _footprint(la["x"], la["z"], la["rotY"], LABEL_SIGN["w"], LABEL_SIGN["d"])
        if not _inside(fp, area): errors.append(f"label_at: outside the area {area.get('id')}")
        for oid, other in boxes:
            if _overlap(fp, other): errors.append(f"label_at: the label overlaps object {oid}")
    return errors

def _place_or_date(failure, text):
    """True for an unsupported-token failure (gates.unsupported_tokens) about a place or date word: a
    name, date, year or decade, or a number the text writes in digits (an address, a count written
    as a word such as "two" is not one)."""
    if failure.startswith(("name ", "date ", "year ", "decade ")):
        return True
    m = re.match(r"number (\S+) not in", failure)
    return bool(m and re.search(rf"(?<![\w.]){re.escape(m.group(1))}(?![\w])", text))

def check_museum_note(where, n, line, corner, media, grounded, usable_media, errors, names=()):
    """A museum-note narration line (owner review 4): a disclosure about the recreated study corner,
    allowed only in the corner's chapter, framing its area, citing its basis photographs (media_ids,
    a non-empty subset of basis_media_ids) and verified facts. Its words are grounded in the cited
    facts, the cited media records (title, alt text, credit), the corner's label and the corner's
    fixed disclosures, nothing else."""
    if not isinstance(corner, dict) or corner.get("chapter") != n:
        errors.append(f"{where}: a {MUSEUM_NOTE} line belongs to the chapter of the study corner "
                      f"(content/<slug>/study-corner.json); chapter {n} has none")
        return
    if line.get("frames") != corner.get("area"):
        errors.append(f"{where}: frames must name the study corner's area {corner.get('area')!r}, not {line.get('frames')!r}")
    basis = [b for b in corner.get("basis_media_ids") or [] if isinstance(b, str)]
    mids = line.get("media_ids")
    if not isinstance(mids, list) or not mids or not all(isinstance(m, str) for m in mids):
        errors.append(f"{where}: media_ids must list the study corner's basis photographs it speaks of")
        mids = []
    for mid in mids:
        if mid not in basis:
            errors.append(f"{where}: media_ids: {mid} is not a basis photograph of the study corner ({', '.join(basis)})")
        else:
            usable_media(where, mid)
    extra = [corner.get("label"), CORNER_NOTE, CORNER_WHERE_LITE]
    for mid in mids:
        m = media.get(mid) if mid in basis else None
        if m: extra += [m.get(k) for k in ("title", "alt_text", "credit")]
    grounded(where, line.get("text"), line.get("fact_ids", []), extra=[t for t in extra if isinstance(t, str)],
             label="cited facts, cited media or the study corner record")
    # Pooled support would let a place from one fact join a date from a photograph's record into a
    # claim no source makes (fix round 1: "112 Mercer Street" + "1943"). The note's place and date
    # words (names, dates, years, decades, numbers written in digits) all come from ONE cited
    # photograph record: what the photograph's own record says it shows.
    text = line.get("text")
    if isinstance(text, str) and text.strip() and mids:
        best = None
        for mid in mids:
            m = media.get(mid) if mid in basis else None
            if not m: continue
            sup = gates.Support.from_texts([m.get(k) for k in ("title", "alt_text", "credit") if isinstance(m.get(k), str)], names=names)
            miss = [f for f in gates.unsupported_tokens(text, sup, mid) if _place_or_date(f, text)]
            if best is None or len(miss) < len(best): best = miss
        if best:
            errors.append(f"{where}: place and date words must come from one cited photograph record: {'; '.join(best)}")

def corner_label_errors(label, credits):
    """The label names the basis photographs as their records do: the prefix, then the holder words
    every credit shares (before the first catalogue id), then each photograph's catalogue id."""
    if not isinstance(label, str) or not label.startswith(CORNER_LABEL_PREFIX):
        return [f"label must start with {CORNER_LABEL_PREFIX!r}"]
    errs, rest = [], label[len(CORNER_LABEL_PREFIX):]
    want = [m for c in credits for m in CATALOGUE_ID.findall(c or "")[:1]]
    named = CATALOGUE_ID.findall(rest)
    for i in want:
        if i not in named: errs.append(f"label does not name {i}")
    for i in named:
        if i not in want: errs.append(f"label names {i}, which is not a basis photograph's catalogue id")
    holder = CATALOGUE_ID.split(rest)[0].strip()
    if not holder or not all(holder in (c or "") for c in credits):
        errs.append(f"label holder {holder!r} must appear in every basis photograph's credit")
    return errs

CORNER_SOURCE_FIELDS = ("title", "author", "author_url", "url", "licence", "licence_url", "credit", "changes", "source_file", "source_sha256")

def check_study_corner(corner, chapters, media, public_dir):
    """Errors for content/<slug>/study-corner.json against the chapters ({n: chapter}), the media
    records and the shipped bundles."""
    import build_study_corner
    errs = []
    ch = chapters.get(corner.get("chapter")) if isinstance(corner.get("chapter"), int) else None
    if ch is None:
        return [f"study corner: chapter {corner.get('chapter')} is not a chapter"]
    room = ch.get("room") if isinstance(ch.get("room"), dict) else {}
    area = next((r for r in room.get("reserved") or [] if isinstance(r, dict) and r.get("id") == corner.get("area")), None)
    if area is None:
        return [f"study corner: area {corner.get('area')} is not a reserved area of chapter {corner.get('chapter')}"]
    errs += [f"study corner: {e}" for e in validate_corner(corner, area)]
    basis = [b for b in corner.get("basis_media_ids") or [] if isinstance(b, str)]
    for b in basis:
        m = media.get(b)
        if m is None or m.get("status") != "verified" or m.get("license_class") not in USABLE:
            errs.append(f"study corner: media {b} not verified with a usable licence")
    errs += [f"study corner: {e}" for e in corner_label_errors(corner.get("label"), [(media.get(b) or {}).get("credit") for b in basis])]
    # The archival photographs are on show in the room, and the corner is framed with the easel group
    # (photo_group) of at least one of them, which stands beside it and shows only basis photographs.
    group = corner.get("photo_group")
    shown = sorted(ex.get("media_id") for ex in ch.get("exhibits", []) if (ex.get("easel") or {}).get("group") == group)
    if not group or not shown or not set(shown) <= set(basis):
        errs.append(f"study corner: photo_group {group} must show basis photographs, and only them, on its easels (shows {shown})")
    on_show = {ex.get("media_id") for ex in ch.get("exhibits", [])}
    for b in basis:
        if b not in on_show:
            errs.append(f"study corner: basis photograph {b} is not on show in chapter {corner.get('chapter')}")
    light = corner.get("light")
    if light is not None and not (isinstance(light, dict) and all(isinstance(light.get(k), list) and len(light[k]) == 3 and all(_num(v) for v in light[k]) for k in ("from", "to"))):
        errs.append("study corner: light must be {from: [x, y, z], to: [x, y, z]}")
    sources = {s.get("id"): s for s in corner.get("sources") or [] if isinstance(s, dict)}
    for mid, spec in (corner.get("models") or {}).items():
        if (spec or {}).get("source") not in sources:
            errs.append(f"study corner: model {mid}: source {(spec or {}).get('source')} is not in sources")
    for sid, s in sources.items():
        at = f"study corner: source {sid}"
        for f in CORNER_SOURCE_FIELDS:
            if not (isinstance(s.get(f), str) and s[f].strip()): errs.append(f"{at}: {f} is missing")
        if s.get("licence") not in CORNER_LICENCES:
            errs.append(f"{at}: licence must be one of {sorted(CORNER_LICENCES)}")
        elif s.get("licence_url") != CORNER_LICENCES[s["licence"]]:
            errs.append(f"{at}: licence_url must be {CORNER_LICENCES[s['licence']]}")
        if isinstance(s.get("credit"), str) and not (s.get("title") and s.get("author") and s["title"] in s["credit"] and s["author"] in s["credit"]):
            errs.append(f"{at}: credit must name the title and the author")
        if isinstance(s.get("credit"), str) and s.get("licence") and s["licence"] not in s["credit"]:
            errs.append(f"{at}: credit must name the licence")
        if isinstance(s.get("changes"), str) and not s["changes"].startswith("Changes: "):
            errs.append(f"{at}: changes must start with 'Changes: '")
        if isinstance(s.get("source_sha256"), str) and not re.fullmatch(r"[0-9a-f]{64}", s["source_sha256"]):
            errs.append(f"{at}: source_sha256 must be 64 hex digits")
        for f in ("url", "author_url", "licence_url"):
            if isinstance(s.get(f), str) and not _https(s[f]): errs.append(f"{at}: {f} must be an https URL")
        kc = s.get("kit_check")
        if not isinstance(kc, dict):
            errs.append(f"{at}: needs a kit_check (the bought-kit check of the source)"); continue
        if kc.get("result") != "pass":
            errs.append(f"{at}: kit check result is {kc.get('result')!r}, not 'pass': the source may not be used")
        if not (isinstance(kc.get("checks"), list) and kc["checks"] and all(isinstance(c, str) and c.strip() for c in kc["checks"])):
            errs.append(f"{at}: kit_check.checks must list what was checked")
        if not (isinstance(kc.get("date"), str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", kc["date"])):
            errs.append(f"{at}: kit_check.date must be YYYY-MM-DD")
        if not (isinstance(kc.get("reverse_image_search"), str) and kc["reverse_image_search"].strip()):
            errs.append(f"{at}: kit_check.reverse_image_search must record the result or why it was not done")
        ex = kc.get("excluded")
        if not (isinstance(ex, dict) and isinstance(ex.get("nodes"), list) and isinstance(ex.get("images"), list) and isinstance(ex.get("reason"), str)):
            errs.append(f"{at}: kit_check.excluded must list nodes, images and a reason")
        else:
            for mid, spec in (corner.get("models") or {}).items():
                if (spec or {}).get("source") == sid and (spec or {}).get("node") in ex["nodes"]:
                    errs.append(f"study corner: model {mid} uses {spec['node']}, which the kit check excludes")
    errs += [f"study corner: {e}" for e in build_study_corner.check_bundles(corner, Path(public_dir))]
    return errs

# Viewing stations (site/src/museum/stationcam.js roomStations): optional per chapter; the room
# derives an opening station and one per exhibit wall otherwise. Pitch limits are elevation degrees.
STATION_FIELDS = {"id", "position", "look", "pitch", "lookAround"}
GALLERY_SIZE = {"w": 8, "d": 12, "h": 4.5}  # mirror of layout.js ROOM_TYPES['chapter-gallery']

def _vec3(v):
    return isinstance(v, list) and len(v) == 3 and all(_num(x) for x in v)

def validate_stations(stations, exhibits=(), room=None):
    """Errors for a chapter's optional `stations` and its exhibits' `station` references. `room` is
    the room's {w, d, h} (centred on the origin, floor at 0) when known: stations stand inside it."""
    errors, ids = [], set()
    if stations is not None and not isinstance(stations, list):
        return ["stations must be a list"]
    for i, st in enumerate(stations or []):
        if not isinstance(st, dict):
            errors.append(f"station {i}: must be an object"); continue
        sid = st.get("id")
        label = sid if isinstance(sid, str) and sid else str(i)
        if not (isinstance(sid, str) and sid):
            errors.append(f"station {i}: id must be a non-empty string")
        elif sid in ids:
            errors.append(f"station {label}: duplicate id")
        else:
            ids.add(sid)
        for k in sorted(set(st) - STATION_FIELDS):
            errors.append(f"station {label}: unknown field {k}")
        pos, look = st.get("position"), st.get("look")
        if not _vec3(pos): errors.append(f"station {label}: position must be [x, y, z]")
        if not _vec3(look): errors.append(f"station {label}: look must be [x, y, z]")
        if _vec3(pos) and _vec3(look) and all(abs(a - b) < 1e-6 for a, b in zip(pos, look)):
            errors.append(f"station {label}: look must differ from position")
        if _vec3(pos) and room:
            if not (abs(pos[0]) < room["w"] / 2 and abs(pos[2]) < room["d"] / 2 and 0 < pos[1] < room["h"]):
                errors.append(f"station {label}: position outside the room")
        if "pitch" in st:
            p = st["pitch"]
            if not (isinstance(p, list) and len(p) == 2 and all(_num(x) for x in p) and -90 <= p[0] < p[1] <= 90):
                errors.append(f"station {label}: pitch must be [min, max] elevation degrees, -90 <= min < max <= 90")
        if "lookAround" in st and not isinstance(st["lookAround"], bool):
            errors.append(f"station {label}: lookAround must be true or false")
    for ex in exhibits or []:
        if isinstance(ex, dict) and "station" in ex and ex["station"] not in ids:
            errors.append(f"exhibit {ex.get('id')}: station {ex['station']} is not a station of this chapter")
    return errors

# Scanned rooms (real-scan museum Task 5): a chapter's room may be a scan, {"scan": "<id>", "doors"?,
# "reserved"?, "stations"?} (content/scans/<id>.json, a usable room whose artwork clearance passes).
# Its exhibits stand on easels on the scan's floor: "easel": {x, z, rotY, group?} in room metres
# (the room centred on the origin, floor at 0, extent_m from the manifest). Here: inside the room,
# apart from each other, clear of the doors' approach and of reserved areas. That an easel stands on
# real floor and clear of the scanned furniture is checked against the scan geometry itself
# (site/src/test/scan-placements.test.js, raycast).
SCAN_ROOM_FIELDS = {"scan", "doors", "reserved", "stations"}
EASEL_FIELDS = {"x", "z", "rotY", "group"}
DOOR_FIELDS = {"x", "z", "rotY", "w", "h"}
EASEL_WALL_MARGIN = 0.6   # m from the room's measured extent
EASEL_SPACING = 1.2       # m between easel centres
DOOR_CLEARANCE = 1.6      # m from a door's centre: its approach stays free
DOOR_AT_WALL = 0.6        # a door stands within this of the room's extent
DOOR_SIZE = {"w": (0.8, 2.0), "h": (1.9, 3.2)}

def load_scan_manifest(content_root, scan_id):
    if not (isinstance(scan_id, str) and re.fullmatch(r"[a-z0-9-]+", scan_id)):
        return None
    p = Path(content_root) / "scans" / f"{scan_id}.json"
    try:
        return json.loads(p.read_text()) if p.exists() else None
    except ValueError:
        return None

def scan_room_size(m):
    t = (m or {}).get("transform") or {}
    ext, h = t.get("extent_m"), t.get("ceiling_m")
    if isinstance(ext, list) and len(ext) == 2 and all(_num(v) and v > 0 for v in ext) and _num(h) and h > 0:
        return {"w": ext[0], "d": ext[1], "h": h}
    return None

def check_scan_use(where, content_root, scan_id, public_dir, year=None):
    """(manifest or None, errors): the scan a room uses must exist, be usable and pass clearance."""
    m = load_scan_manifest(content_root, scan_id)
    if m is None:
        return None, [f"{where}: room.scan {scan_id} has no manifest in content/scans"]
    if m.get("usable", True) is False:
        return None, [f"{where}: room.scan {scan_id} is not usable ({m.get('unusable_reason')})"]
    if public_dir is None:  # fail closed: the clearance and bundle check needs the shipped files
        return None, [f"{where}: room.scan {scan_id} cannot be checked: no public folder (pass --public)"]
    errs = check_scan_manifest(m, public_dir, year, content_root=content_root)
    if errs:
        return None, [f"{where}: room.scan {scan_id} fails its artwork clearance or bundle check: {e}" for e in errs]
    if scan_room_size(m) is None:
        return None, [f"{where}: room.scan {scan_id} has no measured extent_m and ceiling_m"]
    return m, []

def _rot(v):
    return _num(v) and abs(v) <= 2 * math.pi + 1e-6

def check_easel(w, e, size):
    """Shape and bounds of one easel placement; -> errors."""
    if not isinstance(e, dict):
        return [f"{w}: easel must be an object {{x, z, rotY}}"]
    errs = [f"{w}: easel has unknown field {k}" for k in sorted(set(e) - EASEL_FIELDS)]
    if not (_num(e.get("x")) and _num(e.get("z")) and _rot(e.get("rotY"))):
        return errs + [f"{w}: easel needs numbers x, z and rotY (radians)"]
    if "group" in e and not (isinstance(e["group"], str) and e["group"].strip()):
        errs.append(f"{w}: easel group must be a non-empty string")
    if size and not (abs(e["x"]) <= size["w"] / 2 - EASEL_WALL_MARGIN and abs(e["z"]) <= size["d"] / 2 - EASEL_WALL_MARGIN):
        errs.append(f"{w}: easel at ({e['x']}, {e['z']}) must stand inside the room, {EASEL_WALL_MARGIN} m from its walls")
    return errs

def check_easel_layout(placed, size, doors=None, reserved=()):
    """placed: [(label, easel)] with valid shapes. -> errors for spacing, door approach, reserved areas."""
    errs = []
    for i, (a, ea) in enumerate(placed):
        for b, eb in placed[i + 1:]:
            if math.hypot(ea["x"] - eb["x"], ea["z"] - eb["z"]) < EASEL_SPACING:
                errs.append(f"{a} and {b}: easels too close (under {EASEL_SPACING} m apart)")
        for key, d in (doors or {}).items():
            if isinstance(d, dict) and _num(d.get("x")) and _num(d.get("z")) and math.hypot(ea["x"] - d["x"], ea["z"] - d["z"]) < DOOR_CLEARANCE:
                errs.append(f"{a}: easel stands in the {key} door's approach (under {DOOR_CLEARANCE} m from it)")
        for r in reserved or ():
            if isinstance(r, dict) and _reserved_ok(r):
                (x0, z0), (x1, z1) = r["min"], r["max"]
                if x0 - 0.3 <= ea["x"] <= x1 + 0.3 and z0 - 0.3 <= ea["z"] <= z1 + 0.3:
                    errs.append(f"{a}: easel stands in the area reserved for {r['id']}")
    return errs

def _reserved_ok(r):
    return (isinstance(r.get("id"), str) and r["id"].strip()
            and all(isinstance(r.get(k), list) and len(r[k]) == 2 and all(_num(v) for v in r[k]) for k in ("min", "max"))
            and r["min"][0] < r["max"][0] and r["min"][1] < r["max"][1])

def check_scan_doors(w, doors, size):
    if doors is None:
        return []
    if not isinstance(doors, dict):
        return [f"{w}: room.doors must be an object {{entrance, exit}}"]
    errs = [f"{w}: room.doors has unknown door {k} (entrance, exit)" for k in sorted(set(doors) - {"entrance", "exit"})]
    for key in ("entrance", "exit"):
        d = doors.get(key)
        if d is None:
            continue
        dw = f"{w} {key} door"
        if not isinstance(d, dict):
            errs.append(f"{dw}: must be an object {{x, z, rotY, w, h}}"); continue
        errs += [f"{dw}: unknown field {k}" for k in sorted(set(d) - DOOR_FIELDS)]
        if not (all(_num(d.get(k)) for k in ("x", "z", "w", "h")) and _rot(d.get("rotY"))):
            errs.append(f"{dw}: needs numbers x, z, rotY, w and h"); continue
        for k, (lo, hi) in DOOR_SIZE.items():
            if not lo <= d[k] <= hi:
                errs.append(f"{dw}: {k} must be {lo}-{hi} m")
        if size:
            if not (abs(d["x"]) >= size["w"] / 2 - DOOR_AT_WALL or abs(d["z"]) >= size["d"] / 2 - DOOR_AT_WALL) \
                    or abs(d["x"]) > size["w"] / 2 + 0.3 or abs(d["z"]) > size["d"] / 2 + 0.3:
                errs.append(f"{dw}: must stand at a wall of the room (within {DOOR_AT_WALL} m of its extent)")
            # Its face (+z before the turn) looks into the room, toward the centre.
            nx, nz = math.sin(d["rotY"]), math.cos(d["rotY"])
            dist = math.hypot(d["x"], d["z"]) or 1
            if (-d["x"] * nx - d["z"] * nz) / dist < 0.5:
                errs.append(f"{dw}: must face into the room")
    return errs

def check_scanned_room(cid, ch, content_root, public_dir, year=None):
    """Errors for a chapter whose room is a scan; -> (errors, room size or None)."""
    room = ch["room"]
    errs = [f"{cid}: room has unknown field {k}" for k in sorted(set(room) - SCAN_ROOM_FIELDS)]
    m, e = check_scan_use(cid, content_root, room.get("scan"), public_dir, year)
    errs += e
    size = scan_room_size(m) if m else None
    errs += check_scan_doors(cid, room.get("doors"), size)
    reserved = room.get("reserved", [])
    if not isinstance(reserved, list):
        errs.append(f"{cid}: room.reserved must be a list"); reserved = []
    for i, r in enumerate(reserved):
        if not (isinstance(r, dict) and _reserved_ok(r) and set(r) <= {"id", "min", "max", "for"}):
            errs.append(f"{cid}: room.reserved {i} must be {{id, min: [x, z], max: [x, z], for?}} with min < max")
        elif size and not (abs(r["min"][0]) <= size["w"] / 2 and abs(r["max"][0]) <= size["w"] / 2 and abs(r["min"][1]) <= size["d"] / 2 and abs(r["max"][1]) <= size["d"] / 2):
            errs.append(f"{cid}: room.reserved {r['id']} must lie inside the room")
    placed = []
    for ex in ch.get("exhibits", []):
        w = f"{cid} exhibit {ex.get('id')}"
        if "easel" not in ex:
            errs.append(f"{w}: a scanned room's exhibits stand on easels: easel {{x, z, rotY}} required (wall and slot are for gallery rooms)")
            continue
        if "wall" in ex or "slot" in ex:
            errs.append(f"{w}: an exhibit on an easel has no wall or slot")
        e = check_easel(w, ex["easel"], size)
        errs += e
        if not e:
            placed.append((w, ex["easel"]))
    errs += check_easel_layout(placed, size, room.get("doors") if isinstance(room.get("doors"), dict) else None, reserved)
    return errs, size

def check_hall(hall_path, data_dir, public_dir=None, year=None):
    """content/hall.json, the hallway (/hall/): {"scan": "<id>", "easels": [{slug, x, z, rotY, group?}],
    "stations"?}. One easel per pipeline inductee (data/inductees/<slug>/inductee.json), each once, on
    a usable cleared scan, inside the room and apart. -> errors."""
    try:
        hall = json.loads(Path(hall_path).read_text())
    except (OSError, ValueError) as e:
        return [f"hall: cannot read {hall_path}: {e}"]
    if not isinstance(hall, dict):
        return ["hall: must be an object"]
    errs = [f"hall: unknown field {k}" for k in sorted(set(hall) - {"_comment", "scan", "easels", "stations"})]
    m, e = check_scan_use("hall", Path(hall_path).parent, hall.get("scan"), public_dir, year)
    errs += [x.replace("room.scan", "scan") for x in e]
    size = scan_room_size(m) if m else None
    known = sorted(p.parent.name for p in (Path(data_dir) / "inductees").glob("*/inductee.json"))
    easels = hall.get("easels")
    if not isinstance(easels, list) or not easels:
        return errs + ["hall: easels must be a non-empty list"]
    seen, placed = set(), []
    for i, ez in enumerate(easels):
        slug = ez.get("slug") if isinstance(ez, dict) else None
        w = f"hall easel {i} ({slug})"
        if slug not in known:
            errs.append(f"{w}: {slug} is not an inductee in the fact pipeline"); continue
        if slug in seen:
            errs.append(f"{w}: inductee listed more than once"); continue
        seen.add(slug)
        pos = {k: v for k, v in ez.items() if k != "slug"}
        ee = check_easel(w, pos, size)
        errs += ee
        if not ee:
            placed.append((w, pos))
    for slug in known:
        if slug not in seen:
            errs.append(f"hall: inductee {slug} has no easel")
    errs += check_easel_layout(placed, size)
    errs += [f"hall {x}" for x in validate_stations(hall.get("stations"), (), size)]
    return errs

def _jsonl(p):
    return [json.loads(l) for l in p.read_text().splitlines() if l.strip()] if p.exists() else []

def check_media_rights(slug, data_dir, used_media, media, errors):
    """Every media item the site embeds must pass the media checks tools/validate.py enforces
    (validate.media_problems: schema, G1 rights statement and approved rights rule, G2, G7),
    so a licence class the rights rule disagrees with, or a barred rights wording, fails the build."""
    ids = [mid for mid in used_media if mid in media]  # an unknown id is already an error
    try:
        problems = validate.media_problems(paths.InducteePaths(slug, Path(data_dir) / "inductees" / slug), ids)
    except records.RecordError as exc:
        errors.append(f"media rights check could not run: {exc}")
        return
    for mid, msgs in problems.items():
        for msg in msgs:
            errors.append(f"{used_media[mid]}: media {mid} fails the media checks: {msg}")

_SEGMENT_BREAKS = re.compile(r"(?:,|;|:| - | \u2013 | \u2014 )\s*")

def holder_title(title, media_titles):
    """True when title is a media record's title verbatim, or that title cut at whole trailing
    segments (at a comma, semicolon, colon or spaced dash); never a cut inside a segment."""
    if not isinstance(title, str) or not title.strip():
        return False
    for mt in media_titles:
        if not isinstance(mt, str) or not mt.strip():
            continue
        if title == mt:
            return True
        for m in _SEGMENT_BREAKS.finditer(mt):
            if title == mt[:m.start()].rstrip():
                return True
    return False

def check(slug, content_dir, data_dir, aerial_dir=None, public_dir=None, year=None):
    d = Path(data_dir) / "inductees" / slug
    facts = {f["id"]: f for f in _jsonl(d / "facts.jsonl")}
    media = {m["id"]: m for m in _jsonl(d / "media.jsonl")}
    inductee = json.loads((d / "inductee.json").read_text())
    names = [n for n in [inductee.get("name"), *inductee.get("aliases", [])] if n]
    errors = []

    def grounded(where, text, fact_ids, extra=(), label="cited facts"):
        """text contains no content token its cited facts lack (extra: further support texts, only
        for a museum note: its cited media records and the corner record)."""
        if not isinstance(text, str) or not text.strip():
            errors.append(f"{where}: text must be a non-empty string"); return
        if not fact_ids:
            errors.append(f"{where}: no fact_ids"); return
        for fid in fact_ids:
            f = facts.get(fid)
            if f is None:
                errors.append(f"{where}: unknown fact {fid}")
            elif f.get("status") != "verified":
                errors.append(f"{where}: fact {fid} is {f.get('status')}, must be verified")
        claims = [facts[f]["claim"] for f in fact_ids if f in facts]
        support = gates.Support.from_texts(claims + list(extra), names=names)
        for failure in gates.unsupported_tokens(text, support, label):
            errors.append(f"{where}: {failure}")

    def fits(text, fid, fields=("claim",)):
        """True when text is grounded in ONE verified fact: its claim and the named fields."""
        f = facts.get(fid)
        if f is None or f.get("status") != "verified" or not isinstance(text, str) or not text.strip():
            return False
        support = gates.Support.from_texts([f.get(k) for k in fields if isinstance(f.get(k), str)], names=names)
        return not gates.unsupported_tokens(text, support, "fact")

    def media_sources(*mids):
        out = set()
        for mid in mids:
            out.update((media.get(mid) or {}).get("source_ids") or [])
        return out

    used_media = {}  # media id -> where the site embeds it

    def usable_media(where, mid):
        used_media.setdefault(mid, where)
        m = media.get(mid)
        if m is None:
            errors.append(f"{where}: unknown media {mid}")
        elif m.get("status") != "verified" or m.get("license_class") not in USABLE:
            errors.append(f"{where}: media {mid} not verified with a usable licence")

    chapter_files = sorted((Path(content_dir) / "chapters").glob("*.json"))
    if not chapter_files:
        errors.append(f"no chapters found in {Path(content_dir) / 'chapters'}")
    chapter_ids = set()
    museum_notes = []  # (chapter id, chapter number, line): checked against the study corner below
    for path in chapter_files:
        ch = json.loads(path.read_text()); cid = ch.get("id", path.stem)
        if cid in chapter_ids: errors.append(f"{cid}: duplicate chapter id")
        chapter_ids.add(cid)
        grounded(f"{cid} title", ch.get("title"), ch.get("title_fact_ids", []))
        # The title names a place and a date only as ONE cited fact states them (as journey stop
        # labels): never a place from one fact and a year from another.
        if (isinstance(ch.get("title"), str) and ch.get("title_fact_ids")
                and not any(fits(ch["title"], fid, ("claim", "event_date", "place")) for fid in ch["title_fact_ids"])):
            errors.append(f"{cid} title: must be grounded in one fact (claim, event_date, place), not pooled from several")
        cues, quote_ids = set(), set()
        scanned = isinstance(ch.get("room"), dict)
        if scanned:
            errs, scan_size = check_scanned_room(cid, ch, Path(content_dir).parent, public_dir, year)
            errors.extend(errs)
        elif ch.get("room") not in ROOMS:
            errors.append(f"{cid}: room must be one of {sorted(ROOMS)} or a scanned room {{scan: <id>}}")
        # A scanned room shows no reconstructed place, so a reconstruction record on it would be stale
        # (Task 6 fix round 1: the study's old record was retired); a recreated corner in a scanned
        # room has its own record, content/<slug>/study-corner.json (check_study_corner).
        if scanned and "reconstruction" in ch:
            errors.append(f"{cid}: a scanned room shows no reconstructed place; remove its reconstruction block "
                          f"(a recreated corner goes in content/<slug>/study-corner.json)")
        if ch.get("room") == "reconstructed-place":
            basis = (ch.get("reconstruction") or {}).get("basis_media_ids") or []
            if not basis:
                errors.append(f"{cid}: reconstructed-place needs reconstruction.basis_media_ids")
            for mid in basis:
                usable_media(f"{cid} basis", mid)
            rec = ch.get("reconstruction") or {}
            for e in validate_place(rec.get("place"), basis, [] if scanned else ch.get("exhibits", [])):
                errors.append(f"{cid} reconstruction {e}")
            if rec.get("note") is not None:
                grounded(f"{cid} reconstruction note", rec.get("note"), rec.get("basis_fact_ids", []))
            else:
                for fid in rec.get("basis_fact_ids", []):
                    f = facts.get(fid)
                    if f is None or f.get("status") != "verified":
                        errors.append(f"{cid} reconstruction: basis fact {fid} must be a verified fact")
        room_size = GALLERY_SIZE if ch.get("room") == "chapter-gallery" else (
            (ch.get("reconstruction") or {}).get("place") if ch.get("room") == "reconstructed-place" else (scan_size if scanned else None))
        if not (isinstance(room_size, dict) and all(_num(room_size.get(k)) for k in ("w", "d", "h"))): room_size = None
        # A scanned room's stations are part of its room ({scan, stations}); a gallery's sit on the chapter.
        stations = ch["room"].get("stations") if scanned else ch.get("stations")
        if scanned and "stations" in ch:
            errors.append(f"{cid}: a scanned room's stations go in room.stations")
        for e in validate_stations(stations, ch.get("exhibits", []), room_size):
            errors.append(f"{cid} {e}")
        ex_ids, numbers = set(), set()
        for ex in ch.get("exhibits", []):
            w = f"{cid} exhibit {ex.get('id')}"
            if ex.get("id") in ex_ids: errors.append(f"{w}: duplicate id")
            ex_ids.add(ex.get("id"))
            if ex.get("number") in numbers: errors.append(f"{w}: duplicate number")
            numbers.add(ex.get("number"))
            if ex.get("type") not in ALLOWED_TYPES: errors.append(f"{w}: type must be one of {sorted(ALLOWED_TYPES)}")
            if ex.get("type") == "wall-quote" and ex.get("quote_id") not in {q.get("id") for q in ch.get("quotes", [])}:
                errors.append(f"{w}: wall-quote needs a quote_id naming a quote in this chapter")
            if not scanned:
                if ex.get("wall") not in WALLS: errors.append(f"{w}: wall must be one of {sorted(WALLS)}")
                if not isinstance(ex.get("slot"), int) or not 1 <= ex["slot"] <= 4: errors.append(f"{w}: slot must be 1-4")
                if "easel" in ex: errors.append(f"{w}: easels stand only in scanned rooms")
            if ex.get("evidence") not in EVIDENCE:
                errors.append(f"{w}: evidence {ex.get('evidence')} must be one of {sorted(EVIDENCE)}")
            if "page" in ex and not _page(ex["page"]):
                errors.append(f"{w}: page must be a positive integer")
            if "pages" in ex:
                pages = ex["pages"]
                if ex.get("type") != "360-document":
                    errors.append(f"{w}: pages (front, back) is only for 360-document exhibits")
                elif (not isinstance(pages, list) or not 1 <= len(pages) <= 2
                        or not all(_page(p) for p in pages) or len(set(pages)) != len(pages)):
                    errors.append(f"{w}: pages must be [front] or [front, back], distinct positive integers")
            usable_media(w, ex.get("media_id"))
            if "holder_date" in ex:
                # The photo's date as its holder words it, copied from the media record (title or alt
                # text, both checked against the holder's snapshot): never a date we supply.
                hd, m = ex.get("holder_date"), media.get(ex.get("media_id")) or {}
                said = " ".join(t for t in (m.get("title"), m.get("alt_text")) if isinstance(t, str))
                if not (isinstance(hd, str) and hd.strip() and hd in said):
                    errors.append(f"{w} holder_date: {hd!r} must be a non-empty string found verbatim in media {ex.get('media_id')}'s title or alt text")
            if not ex.get("original_media_id"):
                errors.append(f"{w}: needs original_media_id for the See the original link")
            else:
                usable_media(f"{w} original", ex["original_media_id"])
            grounded(f"{w} title", ex.get("title"), ex.get("title_fact_ids", []))
            # A note describes the item on show: each fact it cites comes from the item's own record
            # (one of the fact's evidence sources is a source of media_id or original_media_id), never
            # an event from another record that the photograph is not documented to show.
            own = media_sources(ex.get("media_id"), ex.get("original_media_id"))
            # The title is the holder's own title for the item (the media record's title, verbatim,
            # or cut at a whole trailing segment), or cites only facts from the item's own record.
            if not holder_title(ex.get("title"), [(media.get(m) or {}).get("title") for m in (ex.get("media_id"), ex.get("original_media_id"))]):
                for fid in ex.get("title_fact_ids", []) or []:
                    srcs = {e.get("source_id") for e in (facts.get(fid) or {}).get("evidence") or [] if isinstance(e, dict)}
                    if fid in facts and not (srcs & own):
                        errors.append(f"{w} title: fact {fid} does not come from the item's own record "
                                      f"(none of its sources is a source of {ex.get('media_id')}); use the holder's title for the item")
            for i, n in enumerate(ex.get("notes", [])):
                grounded(f"{w} note {i}", n.get("text"), n.get("fact_ids", []))
                for fid in n.get("fact_ids", []) or []:
                    srcs = {e.get("source_id") for e in (facts.get(fid) or {}).get("evidence") or [] if isinstance(e, dict)}
                    if fid in facts and not (srcs & own):
                        errors.append(f"{w} note {i}: fact {fid} does not come from the item's own record "
                                      f"(none of its sources is a source of {ex.get('media_id')})")
        for line in ch.get("narration", []):
            w = f"{cid} cue {line.get('cue')}"
            if line.get("cue") in cues: errors.append(f"{w}: duplicate cue id")
            cues.add(line.get("cue"))
            if line.get("kind") == MUSEUM_NOTE:
                museum_notes.append((cid, int(path.stem) if path.stem.isdigit() else None, line))
            elif "kind" in line:
                errors.append(f"{w}: kind must be {MUSEUM_NOTE!r} or absent, not {line.get('kind')!r}")
            else:
                for f in MUSEUM_NOTE_FIELDS:
                    if f in line: errors.append(f"{w}: {f} is only for a {MUSEUM_NOTE} line")
                grounded(w, line.get("text"), line.get("fact_ids", []))
            for r in line.get("reveals", []):
                if r not in ex_ids: errors.append(f"{w}: reveals unknown exhibit {r}")
        for q in ch.get("quotes", []):
            if q.get("id") in quote_ids: errors.append(f"{cid} quote {q.get('id')}: duplicate quote id")
            quote_ids.add(q.get("id"))
            f = facts.get(q.get("fact_id"))
            if f is None or f.get("status") != "verified" or not f.get("is_direct_quote"):
                errors.append(f"{cid} quote {q.get('id')}: needs a verified is_direct_quote fact")
            elif q.get("text") != f.get("claim"):
                errors.append(f"{cid} quote {q.get('id')}: text must equal the fact claim verbatim")
            if "attribution" in q:
                # Shown in the AI voice label as "Words: <name>, <source>, <date>"; both parts grounded.
                a = q["attribution"] if isinstance(q["attribution"], dict) else {}
                ids = a.get("fact_ids") or []
                grounded(f"{cid} quote {q.get('id')} attribution source", a.get("source"), ids)
                grounded(f"{cid} quote {q.get('id')} attribution date", a.get("date"), ids)

    corner_path = Path(content_dir) / "study-corner.json"
    corner = json.loads(corner_path.read_text()) if corner_path.exists() else None
    for cid, n, line in museum_notes:
        check_museum_note(f"{cid} cue {line.get('cue')}", n, line, corner, media, grounded, usable_media, errors, names=names)
    if corner is not None:
        chapters = {}
        for path in chapter_files:
            if path.stem.isdigit(): chapters[int(path.stem)] = json.loads(path.read_text())
        for b in corner.get("basis_media_ids") or []:
            used_media.setdefault(b, "study corner basis")
        errors.extend(check_study_corner(corner, chapters, media, public_dir if public_dir is not None else Path("site/public")))
    if isinstance(inductee.get("portrait"), dict):
        usable_media(f"{slug} portrait", inductee["portrait"].get("media_id"))
    check_media_rights(slug, data_dir, used_media, media, errors)

    chapter_numbers = {p.stem for p in chapter_files}
    journey_path = Path(content_dir) / "journey.json"
    if journey_path.exists():
        verified_fact = lambda fid: facts.get(fid) if (facts.get(fid) or {}).get("status") == "verified" else None
        journey = json.loads(journey_path.read_text())
        coords = _load_coords(Path(content_dir) / COORDS_SNAPSHOT, errors)
        check_journey(journey, chapter_numbers, grounded, fits, verified_fact, errors, coords=coords)
        if aerial_dir is not None:
            check_aerial(journey, coords, Path(aerial_dir), errors, verified_fact=verified_fact)
    quiz_path = Path(content_dir) / "quiz.json"
    if quiz_path.exists():
        check_quiz(json.loads(quiz_path.read_text()), grounded, fits, errors)
    return errors

# Journey map: stop positions are in the map's viewBox (site/src/pages/[slug]/index.astro); they
# are drawing positions, not facts. Label, date and every line are grounded in the stop's facts.
# Label and date must be grounded together in ONE fact (never paired from two facts). A stop is
# drawn on the map ("map") only when it names its "place" (a part of its label) and one of its
# facts names that place: in the fact's place field or verbatim in its claim. For a placed stop,
# that same fact also grounds the date (claim or event_date).
# The globe (site/src/museum/globe.js) also needs "lat"/"lon": the published coordinates of the
# named place (for example Wikidata P625), with "coord_source", the URL they were taken from. They
# locate the named place and are shown as approximate; they are not facts about the inductee.
# Every mapped stop's coord_source must be a Wikidata entity URL, or an OpenStreetMap node or way URL
# (https://www.openstreetmap.org/node|way/<id>, building-precise), and its lat/lon must match, within
# COORD_TOLERANCE degrees, the coordinate in the committed snapshot content/<slug>/coords.snapshot.json
# (written by tools/fetch_coords.py: Wikidata P625 keyed by QID, OSM keyed "node/<id>" or "way/<id>").
# The check stays offline: it compares against the snapshot only.
MAP_W, MAP_H = 1000, 600
COORDS_SNAPSHOT = "coords.snapshot.json"
COORD_TOLERANCE = 0.01
WIKIDATA_ENTITY = re.compile(r"^https://www\.wikidata\.org/wiki/(Q\d+)$")
OSM_ELEMENT = re.compile(r"^https://www\.openstreetmap\.org/((?:node|way)/\d+)$")

def coord_key(src):
    """("qid", "Q123") for a Wikidata entity URL, ("osm", "way/123") for an OSM node or way URL, else None."""
    if not isinstance(src, str): return None
    hit = WIKIDATA_ENTITY.match(src.strip())
    if hit: return "qid", hit.group(1)
    hit = OSM_ELEMENT.match(src.strip())
    return ("osm", hit.group(1)) if hit else None

# Aerial zoom depth (site/src/museum/aerial.js): "building" only when a verified fact the stop cites
# has a place naming a street address AND the stop cites a building-precise source (an OSM node or
# way with a snapshot entry); otherwise "city", and the zoom ends at the neighbourhood with
# "Approximate location". tools/build_aerials.py writes it into the manifest; check_aerial recomputes it.
_STREET_WORDS = r"(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Lane|Place|Boulevard|Blvd\.?|Drive|Court|Terrace|Square|Way)"
STREET_ADDRESS = re.compile(
    r"\b\d+[A-Za-z]?\s+(?:[A-Z][\w'.-]*\s+)+" + _STREET_WORDS + r"(?=$|[\s,.;])"            # 112 Mercer Street
    r"|\b[\wäöüßÄÖÜ.-]*(?:strasse|straße|str\.|gasse|weg|platz|allee|ring)\s+\d+[a-z]?\b",    # Kramgasse 49
    re.IGNORECASE)

def names_street_address(place):
    return isinstance(place, str) and bool(STREET_ADDRESS.search(place))

def aerial_precision(stop, verified_fact, coords):
    m = stop.get("map") if isinstance(stop.get("map"), dict) else {}
    key = coord_key(m.get("coord_source"))
    osm = bool(key and key[0] == "osm" and isinstance((coords or {}).get(key[1]), dict))
    address = any(names_street_address((verified_fact(fid) or {}).get("place")) for fid in (stop.get("fact_ids") or []))
    return "building" if osm and address else "city"

def _load_coords(path, errors):
    """The snapshot's entities by QID; {} when the file is absent (each mapped stop then fails)."""
    if not path.exists():
        return {}
    try:
        ents = json.loads(path.read_text()).get("entities")
    except (ValueError, AttributeError):
        errors.append(f"{COORDS_SNAPSHOT}: must be a JSON object with an entities object"); return {}
    if not isinstance(ents, dict):
        errors.append(f"{COORDS_SNAPSHOT}: must be a JSON object with an entities object"); return {}
    return ents

def check_coordinates(w, m, coords, errors):
    """Compare a mapped stop's lat/lon with the snapshot of the Wikidata entity or OSM element it cites."""
    key = coord_key(m.get("coord_source"))
    if not key:
        errors.append(f"{w}: map coord_source must be a Wikidata entity URL (https://www.wikidata.org/wiki/Q<digits>) "
                      "or an OpenStreetMap node or way URL (https://www.openstreetmap.org/node|way/<digits>)"); return
    field, qid = key
    snap = coords.get(qid) if isinstance(coords, dict) else None
    if not isinstance(snap, dict):
        errors.append(f"{w}: no entry for {qid} in {COORDS_SNAPSHOT} (run tools/fetch_coords.py)"); return
    if snap.get(field) != qid:
        errors.append(f"{w}: {COORDS_SNAPSHOT} entry for {qid} names {snap.get(field)!r}"); return
    if not (_num(snap.get("lat")) and _num(snap.get("lon"))):
        errors.append(f"{w}: {COORDS_SNAPSHOT} entry for {qid} has no numeric lat/lon"); return
    if not (_num(m.get("lat")) and _num(m.get("lon"))):
        return  # already reported by the range checks
    if abs(m["lat"] - snap["lat"]) > COORD_TOLERANCE or abs(m["lon"] - snap["lon"]) > COORD_TOLERANCE:
        errors.append(f"{w}: map lat/lon ({m['lat']}, {m['lon']}) are not within {COORD_TOLERANCE} degrees of "
                      f"{qid}'s published coordinates ({snap['lat']}, {snap['lon']})")

# Aerial stacks (tools/build_aerials.py writes <aerial_dir>/<stop>/manifest.json and the WebP files; the
# schema is in that script's docstring). Every mapped stop needs one: 6 levels with decreasing extents
# in metres (two regional NASA Blue Marble levels, then aerial), each file present and inside aerial_dir
# (a shared stack points into the owner's folder, named by "stack"), labels on the two closest levels, the
# "precision" aerial_precision derives, http(s) credit URLs, a centre equal to the snapshot coordinates of the stop's place, credits for every source and at
# most AERIAL_MAX_BYTES of images. Offline: only reads committed files.
AERIAL_MAX_BYTES = 1_500_000
AERIAL_LEVELS = 6            # 300 km and 60 km (NASA Blue Marble), 10 km, 2 km, 300 m, building
AERIAL_LABELLED = (4, 5)
AERIAL_PRECISION = ("building", "city")

def check_aerial(journey, coords, aerial_dir, errors, verified_fact=lambda fid: None):
    for s in (journey.get("stops") if isinstance(journey, dict) else None) or []:
        if not (isinstance(s, dict) and isinstance(s.get("map"), dict)): continue
        w = f"aerial {s.get('id')}"
        folder = aerial_dir / str(s.get("id"))
        try:
            m = json.loads((folder / "manifest.json").read_text())
        except (OSError, ValueError):
            errors.append(f"{w}: missing or unreadable {folder / 'manifest.json'} (run tools/build_aerials.py)"); continue
        if not isinstance(m, dict):
            errors.append(f"{w}: manifest must be an object"); continue
        key = coord_key(s["map"].get("coord_source"))
        snap = (coords or {}).get(key[1]) if key else None
        c = m.get("centre") if isinstance(m.get("centre"), dict) else {}
        if not (isinstance(snap, dict) and _num(c.get("lat")) and _num(c.get("lon"))
                and abs(c["lat"] - snap.get("lat", math.nan)) < 1e-6 and abs(c["lon"] - snap.get("lon", math.nan)) < 1e-6):
            errors.append(f"{w}: manifest centre must equal the snapshot coordinates of the stop's place")
        want = aerial_precision(s, verified_fact, coords)
        if m.get("precision") not in AERIAL_PRECISION:
            errors.append(f"{w}: precision must be one of {AERIAL_PRECISION}")
        elif m["precision"] != want:
            errors.append(f"{w}: precision is {m['precision']!r} but the stop's verified place and coordinate source give {want!r}")
        levels = m.get("levels")
        if not isinstance(levels, list) or len(levels) != AERIAL_LEVELS:
            errors.append(f"{w}: levels must be a list of {AERIAL_LEVELS}"); continue
        extents = [lv.get("extent_m") if isinstance(lv, dict) else None for lv in levels]
        if not all(_num(e) and e > 0 for e in extents) or any(a <= b for a, b in zip(extents, extents[1:])):
            errors.append(f"{w}: level extent_m must be positive metres, widest first and strictly decreasing")
        if "stack" in m:
            st = m.get("stack")
            if not (isinstance(st, str) and st and st == Path(st).name and st not in (".", "..")
                    and (aerial_dir / st).is_dir()):
                errors.append(f"{w}: stack {st!r} must name an existing sibling folder of {aerial_dir}")
        root = aerial_dir.resolve()
        total, seen = 0, set()
        for i, lv in enumerate(levels):
            lv = lv if isinstance(lv, dict) else {}
            names = [lv.get("file")] + ([lv.get("labels")] if i in AERIAL_LABELLED else [])
            if i in AERIAL_LABELLED and not lv.get("labels"):
                errors.append(f"{w}: level {i} needs labels")
            for n in names:
                f = (folder / n).resolve() if isinstance(n, str) and n else None
                if f is not None and not f.is_relative_to(root):
                    errors.append(f"{w}: level {i} file {n!r} resolves outside {aerial_dir}")
                elif f is None or not f.is_file() or f.suffix != ".webp":
                    errors.append(f"{w}: level {i} file {n!r} is not an existing .webp file")
                elif f not in seen:
                    seen.add(f); total += f.stat().st_size
        if total > AERIAL_MAX_BYTES:
            errors.append(f"{w}: images total {total} bytes, over the {AERIAL_MAX_BYTES} byte budget")
        credits = m.get("credits")
        if not isinstance(credits, list) or not credits:
            errors.append(f"{w}: credits must be a non-empty list")
        else:
            for cr in credits:
                if not (isinstance(cr, dict) and all(isinstance(cr.get(k), str) and cr[k].strip() for k in ("source", "text", "url", "licence"))):
                    errors.append(f"{w}: every credit needs source, text, url and licence"); break
                u = urlparse(cr["url"].strip())
                if u.scheme not in ("http", "https") or not u.netloc:
                    errors.append(f"{w}: credit url {cr['url']!r} must be an http(s) URL"); break
            if "osm" not in [cr.get("source") for cr in credits if isinstance(cr, dict)]:
                errors.append(f"{w}: credits must include the osm source for the street names")
        if not (isinstance(m.get("fetched_at"), str) and m["fetched_at"]):
            errors.append(f"{w}: fetched_at is required")
        urls = m.get("source_urls")
        if not (isinstance(urls, list) and urls and all(isinstance(u, str) and u.startswith("https://") for u in urls)):
            errors.append(f"{w}: source_urls must be a non-empty list of https URLs")

def check_journey(journey, chapter_numbers, grounded, fits, verified_fact, errors, coords=None):
    def names_place(place, fid):
        f = verified_fact(fid) or {}
        claim = f.get("claim") if isinstance(f.get("claim"), str) else ""
        return fits(place, fid, ("place",)) or place.lower() in claim.lower()

    stops = journey.get("stops") if isinstance(journey, dict) else None
    if not isinstance(stops, list) or not stops:
        errors.append("journey: stops must be a non-empty list"); return
    ids = set()
    for i, s in enumerate(stops):
        if not isinstance(s, dict):
            errors.append(f"journey stop {i}: must be an object"); continue
        w = f"journey stop {s.get('id', i)}"
        if s.get("id") in ids: errors.append(f"{w}: duplicate id")
        ids.add(s.get("id"))
        fids = s.get("fact_ids") or []
        label, date, place = s.get("label"), s.get("date"), s.get("place")
        grounded(f"{w} label", label, fids)
        if date is not None:
            grounded(f"{w} date", date, fids)
        lines = s.get("lines")
        if not isinstance(lines, list) or not lines:
            errors.append(f"{w}: lines must be a non-empty list")
        else:
            for j, line in enumerate(lines):
                line = line if isinstance(line, dict) else {}
                grounded(f"{w} line {j}", line.get("text"), line.get("fact_ids") or [])
        fields = ("claim", "event_date", "place")
        if place is not None:
            if not isinstance(place, str) or not place.strip() or not isinstance(label, str) or place not in label:
                errors.append(f"{w}: place must be a non-empty part of the label")
            else:
                naming = [fid for fid in fids if names_place(place, fid)]
                if not naming:
                    errors.append(f"{w}: no cited fact names the place {place!r} (place field or claim)")
                elif not any(fits(label, fid, fields) and (date is None or fits(date, fid, fields)) for fid in naming):
                    errors.append(f"{w}: place, label and date must be grounded together in one fact")
        elif date is not None and not any(fits(label, fid, fields) and fits(date, fid, fields) for fid in fids):
            errors.append(f"{w}: label and date must be grounded together in one fact")
        if "map" in s:
            m = s.get("map") if isinstance(s.get("map"), dict) else {}
            if place is None:
                errors.append(f"{w}: a stop on the map needs a place named by one of its facts")
            if not (_num(m.get("x")) and _num(m.get("y")) and 0 <= m["x"] <= MAP_W and 0 <= m["y"] <= MAP_H):
                errors.append(f"{w}: map x, y must be numbers inside the {MAP_W} x {MAP_H} map")
            if not (_num(m.get("lat")) and -90 <= m["lat"] <= 90):
                errors.append(f"{w}: map lat must be a number from -90 to 90")
            if not (_num(m.get("lon")) and -180 <= m["lon"] <= 180):
                errors.append(f"{w}: map lon must be a number from -180 to 180")
            check_coordinates(w, m, coords or {}, errors)
        if "chapter" in s and str(s["chapter"]) not in chapter_numbers:
            errors.append(f"{w}: chapter {s['chapter']} has no chapters/{s['chapter']}.json")

# Quiz: a list of questions; each has one correct option of two to four. Question, option text
# and explanation are grounded (the question in question_fact_ids, each option in its fact_ids).
BLANK = "___"

def check_quiz(quiz, grounded, fits, errors):
    if not isinstance(quiz, list) or not quiz:
        errors.append("quiz: must be a non-empty list of questions"); return
    ids = set()
    for i, q in enumerate(quiz):
        if not isinstance(q, dict):
            errors.append(f"quiz question {i}: must be an object"); continue
        w = f"quiz {q.get('id', i)}"
        if q.get("id") in ids: errors.append(f"{w}: duplicate id")
        ids.add(q.get("id"))
        question = q.get("question")
        grounded(f"{w} question", question, q.get("question_fact_ids") or [])
        if not isinstance(question, str) or question.count(BLANK) != 1:
            errors.append(f"{w}: question must contain exactly one blank ({BLANK})")
        opts = q.get("options")
        if not isinstance(opts, list) or not 2 <= len(opts) <= 4:
            errors.append(f"{w}: needs two to four options"); continue
        right = [o for o in opts if isinstance(o, dict) and o.get("correct") is True]
        if len(right) != 1:
            errors.append(f"{w}: exactly one option must be correct")
        elif isinstance(question, str) and question.count(BLANK) == 1:
            # The question with the correct option filled in must be ONE cited fact's statement,
            # so a wrong "correct" flag fails.
            filled = question.replace(BLANK, str(right[0].get("text", "")))
            cited = list(dict.fromkeys((q.get("question_fact_ids") or []) + (right[0].get("fact_ids") or [])))
            if not any(fits(filled, fid) for fid in cited):
                errors.append(f"{w}: the question with the correct option filled in ({filled!r}) is not grounded in one cited fact")
        for j, o in enumerate(opts):
            o = o if isinstance(o, dict) else {}
            if not isinstance(o.get("correct"), bool): errors.append(f"{w} option {j}: correct must be true or false")
            grounded(f"{w} option {j} text", o.get("text"), o.get("fact_ids") or [])
            grounded(f"{w} option {j} explanation", o.get("explanation"), o.get("fact_ids") or [])

def check_home(home_path, data_dir):
    """content/home.json: the home page's one line per inductee, {"lines": [{slug, fact_id, text}]}.
    Each slug is a pipeline inductee (data/inductees/<slug>/inductee.json) listed once; the fact is in
    that inductee's own facts.jsonl and carries its code; it is verified; `text` is the fact's claim
    exactly (the page shows it verbatim). Returns a list of errors; [] means the lines may ship."""
    errors = []
    try:
        home = json.loads(Path(home_path).read_text())
    except (OSError, ValueError) as e:
        return [f"home: cannot read {home_path}: {e}"]
    lines = home.get("lines") if isinstance(home, dict) else None
    if not isinstance(lines, list) or not lines:
        return ["home: lines must be a non-empty list"]
    seen = set()
    for i, line in enumerate(lines):
        if not isinstance(line, dict):
            errors.append(f"home line {i}: must be an object"); continue
        slug, fid, text = line.get("slug"), line.get("fact_id"), line.get("text")
        w = f"home line {i} ({slug})"
        if not isinstance(slug, str) or not re.fullmatch(r"[a-z0-9-]+", slug):
            errors.append(f"{w}: slug must be a lower-case slug"); continue
        if slug in seen:
            errors.append(f"{w}: inductee listed more than once"); continue
        seen.add(slug)
        d = Path(data_dir) / "inductees" / slug
        if not (d / "inductee.json").exists():
            errors.append(f"{w}: {slug} is not an inductee in the fact pipeline"); continue
        code = json.loads((d / "inductee.json").read_text()).get("code")
        if not isinstance(fid, str) or not code or not fid.startswith(f"{code}-F-"):
            errors.append(f"{w}: fact {fid} does not belong to {slug} (code {code})"); continue
        f = {r["id"]: r for r in _jsonl(d / "facts.jsonl")}.get(fid)
        if f is None:
            errors.append(f"{w}: unknown fact {fid}"); continue
        if f.get("status") != "verified":
            errors.append(f"{w}: fact {fid} is {f.get('status')}, must be verified")
        if text != f.get("claim"):
            errors.append(f"{w}: text must be the claim of {fid} verbatim ({f.get('claim')!r})")
    return errors

# Scanned rooms (content/scans/<id>.json, written by tools/build_scans.py): artwork clearance.
# Every artwork visible in a room that ships has one record in `artworks` with a status:
#   cleared  the museum's catalogue record (evidence_url, https) and EITHER
#            (a) a named artist whose death year (died, with died_source: an https authority record)
#                is at most current year - 71: EU/Swedish and UK term is life + 70 years, running to
#                the end of the year, so a death in 1955 frees the work from 1 January 2026; OR
#            (b) no known death year (artist unknown, or named without dates) and the catalogue
#                dates the work (dated: the LATEST year of the catalogue's dating) to at most current
#                year - 191. Reason: whoever made it, an author alive at the making would have to live
#                more than 120 more years to die within the last 70; this also covers the anonymous-work
#                terms (70 years from making available, at most 140 years from making: EU Term
#                Directive art. 1(3) and 1(6), Swedish URL 44 §, UK CDPA s.12(3)).
#            A known death year inside the term always fails, whatever the dating.
#   cropped  the room's `crops` list holds the box named by `crop`; the shipped bundles record the
#            sha256 of that list (crops_sha256) and a non-zero face count per box (crops_applied),
#            written by the build that masked the box, and each bundle file matches its recorded sha256.
#   blocked  not cleared: the room fails.
# Every crop box is documented by at least one artwork (non-art risks such as signage included).
# A room that cannot be cleared is marked "usable": false with an unusable_reason, and nothing of it
# may exist under site/public/scans/<id>/ (it is never shipped).
SCAN_LIFE_TERM = 71
SCAN_UNATTRIBUTED_AGE = 191
SCAN_STATUSES = ("cleared", "cropped", "blocked")

def crops_sha256(crops):
    """Hash of a room's crop list, computed exactly as tools/build_scans.py records it."""
    import build_scans
    return build_scans.crops_sha256(crops)

def _https(v):
    u = urlparse(v.strip()) if isinstance(v, str) else None
    return bool(u and u.scheme == "https" and u.netloc)

def _year(v):
    return isinstance(v, int) and not isinstance(v, bool)

def check_artwork(w, a, crop_ids, year=None):
    year = year or datetime.date.today().year
    errs, status = [], a.get("status")
    if status not in SCAN_STATUSES:
        return [f"{w}: status must be one of {', '.join(SCAN_STATUSES)}"]
    if status == "blocked":
        return [f"{w}: blocked (not cleared and not cropped); clear it with evidence, crop it, or mark the room unusable"]
    if status == "cropped":
        if a.get("crop") not in crop_ids:
            errs.append(f"{w}: cropped, but its crop box {a.get('crop')!r} is not in the room's crops")
        return errs
    if not _https(a.get("evidence_url")):
        errs.append(f"{w}: cleared needs evidence_url, an https link to the museum's catalogue record")
    died, dated, artist = a.get("died"), a.get("dated"), a.get("artist")
    if died is not None:
        if not _year(died):
            errs.append(f"{w}: died must be a year")
        elif died > year - SCAN_LIFE_TERM:
            errs.append(f"{w}: artist died in {died}: still in copyright (life + 70 years runs to the end of {died + 70})")
        if not (isinstance(artist, str) and artist.strip()):
            errs.append(f"{w}: a death year needs the artist it belongs to")
        if not _https(a.get("died_source")):
            errs.append(f"{w}: died needs died_source, an https authority record for the death year")
    elif dated is not None:
        if not _year(dated):
            errs.append(f"{w}: dated must be the latest year of the catalogue's dating")
        elif dated > year - SCAN_UNATTRIBUTED_AGE:
            errs.append(f"{w}: no artist death year, and the work is dated {dated}: only works dated "
                        f"{year - SCAN_UNATTRIBUTED_AGE} or earlier clear without one")
    else:
        errs.append(f"{w}: cleared needs the artist's death year (died) or, without one, the catalogue's dating (dated)")
    return errs

def check_scans(content_dir, public_dir, year=None):
    """Errors for content/scans/*.json and everything shipped under site/public/scans and
    site/public/study; [] means every scanned room may ship."""
    import build_scans
    errors = []
    for path in sorted((Path(content_dir) / "scans").glob("*.json")):
        try:
            m = json.loads(path.read_text())
        except ValueError as e:
            errors.append(f"scan {path.stem}: unreadable manifest: {e}"); continue
        errors.extend(check_scan_manifest(dict(m, id=m.get("id", path.stem)), public_dir, year, content_root=content_dir))
    errors.extend(f"shipped: {e}" for e in build_scans.shipped_asset_errors(Path(public_dir), Path(content_dir)))
    return errors

def check_scan_manifest(m, public_dir, year=None, content_root=None):
    """Errors for one scanned room's manifest: the complete validator of tools/build_scans.py
    (manifest_errors: schema, attribution, licence, hashed names, room download with any study corner of
    content_root, inventory review, shipped files), then artwork clearance and crops."""
    import build_scans
    year = year or datetime.date.today().year
    sid = m.get("id")
    errors = [f"scan {sid}: {e}" for e in build_scans.manifest_errors(m, Path(public_dir), content_root)]
    if m.get("usable", True) is False:
        if not (isinstance(m.get("unusable_reason"), str) and m["unusable_reason"].strip()):
            errors.append(f"scan {sid}: an unusable room needs an unusable_reason")
        return errors
    crops = m.get("crops") or []
    crop_ids = set()
    for i, c in enumerate(crops):
        ok = (isinstance(c, dict) and isinstance(c.get("id"), str) and c["id"].strip()
              and all(isinstance(c.get(k), list) and len(c[k]) == 3 and all(_num(x) for x in c[k]) for k in ("min", "max")))
        if not ok or not all(lo < hi for lo, hi in zip(c["min"], c["max"])):
            errors.append(f"scan {sid}: crop {i} must have an id and min/max corners [x, y, z] with min < max"); continue
        if "rot_y_deg" in c and not (_num(c["rot_y_deg"]) and -180 <= c["rot_y_deg"] <= 180):
            errors.append(f"scan {sid}: crop {c['id']} rot_y_deg must be a number of degrees in [-180, 180]")
        if c["id"] in crop_ids:
            errors.append(f"scan {sid}: crop id {c['id']} used twice")
        crop_ids.add(c["id"])
    arts = m.get("artworks")
    if not isinstance(arts, list):
        errors.append(f"scan {sid}: artworks must be a list"); arts = []
    documented = set()
    for i, a in enumerate(arts):
        if not isinstance(a, dict):
            errors.append(f"scan {sid} artwork {i}: must be an object"); continue
        w = f"scan {sid} artwork {i} ({a.get('label')})"
        errors.extend(check_artwork(w, a, crop_ids, year))
        if a.get("status") == "cropped":
            documented.add(a.get("crop"))
    for cid in sorted(crop_ids - documented):
        errors.append(f"scan {sid}: crop box {cid} is not documented by any artwork")
    want = crops_sha256(crops)
    for device in build_scans.DEVICES:
        b = (m.get("bundles") or {}).get(device) or {}
        if crops and b.get("crops_sha256") != want:
            errors.append(f"scan {sid} {device}: bundle was not built with the current crop list; rebuild with tools/build_scans.py")
            continue
        applied = b.get("crops_applied") or {}
        for c in crops:
            if isinstance(c, dict) and c.get("id") in crop_ids:
                faces = (applied.get(c["id"]) or {}).get("faces")
                if not (_year(faces) and faces > 0):
                    errors.append(f"scan {sid} {device}: crop box {c['id']} masked nothing; fix the box and rebuild")
    # The sharp preview's texture is baked from the masked textures: it must be built with the same list.
    prev = m.get("preview") or {}
    if crops and prev.get("crops_sha256") != want:
        errors.append(f"scan {sid} preview: was not built with the current crop list; rebuild with tools/build_scans.py")
    return errors

def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument("slug", nargs="?")
    ap.add_argument("--home", action="store_true", help="check content/home.json instead of one inductee")
    ap.add_argument("--scans", action="store_true", help="check the scanned rooms (content/scans) and every file shipped under scans/ and study/")
    ap.add_argument("--hall", action="store_true", help="check the hallway (content/hall.json)")
    ap.add_argument("--content", default="content"); ap.add_argument("--data", default="data")
    ap.add_argument("--aerial", default="site/public/aerial")
    ap.add_argument("--public", default="site/public")
    a = ap.parse_args(argv)
    if a.scans:
        errs = check_scans(Path(a.content), Path(a.public))
    elif a.hall:
        errs = check_hall(Path(a.content) / "hall.json", Path(a.data), public_dir=Path(a.public))
    elif a.home:
        errs = check_home(Path(a.content) / "home.json", Path(a.data))
    elif a.slug:
        errs = check(a.slug, Path(a.content) / a.slug, Path(a.data), aerial_dir=Path(a.aerial) / a.slug, public_dir=Path(a.public))
    else:
        ap.error("give a slug or --home")
    for e in errs: print("ERROR", e)
    print("OK" if not errs else f"FAIL: {len(errs)} error(s)")
    return 1 if errs else 0

if __name__ == "__main__":
    sys.exit(main())
