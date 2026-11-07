"""Tour research: chapter-map rules, assembly, planning and comparison (SPEC section 12).

drafts/tour-map.json assigns an inductee's verified facts and media to turning-point chapters.
It is a judgement (made by the Assemble agent, or seeded by propose() or seed_from_app());
check() holds it to the rules no judgement may break, and assemble() derives drafts/tour.json
from it. Pure functions over loaded records: no file or network I/O here.
"""

import re

from . import gates, rights

KINDS = ("birth", "education", "leaving", "arriving", "first-work", "citizen",
         "big-work", "history", "honoured", "legacy")
KIND_ORDER = {k: i for i, k in enumerate(KINDS)}
MIN_RECORDS = 3
ROUTE_NOTE = "Route not recorded; the line joins the two places"
MODES = ("ship", "train", "road", "air", "foot")
# words by which a fact states a mode of travel (a mode fact must use one, and name both places)
# phrases by which a fact states travel by a mode (a word such as "ship" alone is not travel); a mode
# fact must use one, be one of the segment's route facts (so it names both places), and the adversary
# has judged that the claim says what it says
MODE_PHRASES = {"ship": ("sailed", "sailing", "aboard", "voyage", "by ship", "by sea", "by boat", "by steamer",
                         "on the ship", "on the steamer", "steamed"),
                "train": ("by train", "by rail", "on the train", "took the train", "boarded the train", "rode the train"),
                "road": ("drove", "by car", "by bus", "by road", "by automobile"),
                "air": ("flew", "by air", "by plane", "by airplane", "on a flight"),
                "foot": ("walked", "on foot", "hiked")}
COORD_RE = re.compile(r"^(wikidata:Q[1-9][0-9]*|osm:(node|way)/[1-9][0-9]*|holder:[a-z0-9]+(-[a-z0-9]+)*)$")
DATE_RE = re.compile(r"^([0-9]{4})(-[0-9]{2}(-[0-9]{2})?)?$")


class TourError(Exception):
    """A tour map broke a rule; .problems lists every problem."""

    def __init__(self, problems):
        super().__init__("; ".join(problems))
        self.problems = list(problems)


def year_of(fact):
    """The year of a fact's event_date when it is one date (YYYY, YYYY-MM or YYYY-MM-DD), else None."""
    d = fact.get("event_date") if isinstance(fact, dict) else None
    m = DATE_RE.match(d) if isinstance(d, str) else None
    return int(m.group(1)) if m else None


def _ids(value):
    return [v for v in value if isinstance(v, str)] if isinstance(value, list) else []


def _list_problems(where, obj, keys):
    """A problem for each field that is present but not a list (null counts as empty). Every rule reads
    list fields through _ids or _items, which treat a non-list as empty, so the shape is reported here."""
    return [f"{where}: {k} must be a list (got {type(obj.get(k)).__name__})"
            for k in keys if obj.get(k) is not None and not isinstance(obj.get(k), list)]


def _items(value):
    return value if isinstance(value, list) else []


def _fact_problem(where, fid, F):
    f = F.get(fid) if isinstance(fid, str) else None
    if f is None:
        return f"{where}: fact {fid!r} is not on file"
    if f.get("status") != "verified":
        return f"{where}: fact {fid} is {f.get('status')}, not verified"
    return None


CHAPTER_LISTS = ("fact_ids", "records", "place_photos")


def _shape(where, ch, F, M, names):
    out = _list_problems(where, ch, CHAPTER_LISTS)
    if ch.get("kind") not in KINDS:
        out.append(f"{where}: kind {ch.get('kind')!r} is not one of {', '.join(KINDS)}")
    if not _ids(ch.get("fact_ids")):
        out.append(f"{where}: no facts (a chapter exists only where verified facts exist; never filled)")
    return out


def _facts(where, ch, F, M, names):
    return [p for p in (_fact_problem(where, fid, F) for fid in _ids(ch.get("fact_ids"))) if p]


def _year(where, ch, F, M, names):
    yf = ch.get("year_fact")
    if yf not in _ids(ch.get("fact_ids")):
        return [f"{where}: year_fact {yf!r} must be one of the chapter's own facts"] if _ids(ch.get("fact_ids")) else []
    f = F.get(yf)
    if f is None or f.get("status") != "verified":
        return []  # _facts reports it
    if year_of(f) is None:
        return [f"{where}: year_fact {yf} has no single event_date (YYYY, YYYY-MM or YYYY-MM-DD)"]
    return []


CHAPTER_RULES = [_shape, _facts, _year]
TOUR_RULES = []
RULING_REVIEWER = "project owner"


def owner_rulings(decisions):
    """{media id: media_lock_sha256} for the owner's display rulings in review/decisions.jsonl: a note by
    the project owner that starts "Owner ruling", pinned (before) to the record's fingerprint when ruled."""
    out = {}
    for d in decisions or []:
        if (isinstance(d, dict) and d.get("action") == "note" and d.get("reviewer") == RULING_REVIEWER
                and str(d.get("note") or "").startswith("Owner ruling") and isinstance(d.get("before"), str)):
            out[d.get("item_id")] = d["before"]
    return out


def media_index(media, rulings=None):
    """{id: media}; a disputed public-domain record whose current fingerprint is the one the owner ruled
    on is marked _owner_ruled (a working-copy flag, never written to the store)."""
    M = gates.by_id(media)
    for mid, lock in (rulings or {}).items():
        m = M.get(mid)
        if (m and m.get("status") == "disputed" and m.get("license_class") == "public-domain"
                and gates.media_lock_sha256(m) == lock):
            M[mid] = dict(m, _owner_ruled=True)
    return M


def shown(m):
    """A record the tour may show: verified, or disputed under a current owner ruling."""
    return m.get("status") == "verified" or bool(m.get("_owner_ruled"))


def check(tmap, facts, media, names=(), rulings=None):
    """Every rule the tour map breaks, as text ([] when it passes)."""
    if not isinstance(tmap, dict) or not isinstance(tmap.get("chapters"), list):
        return ["tour map: 'chapters' must be a list"]
    F, M = gates.by_id(facts), media_index(media, rulings)
    names = tuple(names)
    out, seen = [], set()
    for i, ch in enumerate(tmap["chapters"]):
        if not isinstance(ch, dict):
            out.append(f"chapter {i}: not an object")
            continue
        cid = ch.get("id")
        where = f"chapter {cid}" if isinstance(cid, str) and cid else f"chapter {i}"
        if not isinstance(cid, str) or not cid:
            out.append(f"{where}: id missing")
        elif cid in seen:
            out.append(f"{where}: duplicate id")
        else:
            seen.add(cid)
        for rule in CHAPTER_RULES:
            out += rule(where, ch, F, M, names)
    for rule in TOUR_RULES:
        out += rule(tmap, F, M, names)
    return out


def _support(fact, names):
    texts = [fact.get("claim") or "", fact.get("place") or "", str(fact.get("event_date") or "")]
    return gates.Support.from_texts(texts, names=names)


def _title(where, ch, F, M, names):
    title = ch.get("title")
    if title is None:
        return []
    if not isinstance(title, str) or not title.strip():
        return [f"{where}: title must be text or null"]
    best = None
    for fid in _ids(ch.get("fact_ids")):
        f = F.get(fid)
        if not f or f.get("status") != "verified":
            continue
        gaps = gates.unsupported_tokens(title, _support(f, names), f"fact {fid}")
        if not gaps:
            return []
        if best is None or len(gaps) < len(best):
            best = gaps
    return [f"{where}: title {title!r} must take its words from one chapter fact: " + "; ".join(best or ["no verified fact"])]


def _place(where, ch, F, M, names):
    p = ch.get("place")
    if p is None:
        return []
    if not isinstance(p, dict):
        return [f"{where}: place must be an object or null"]
    fid = p.get("fact_id")
    if fid not in _ids(ch.get("fact_ids")):
        return [f"{where}: place fact {fid!r} must be one of the chapter's own facts"]
    f = F.get(fid)
    if not f or f.get("status") != "verified":
        return []  # _facts reports it
    out = []
    label = p.get("label")
    if not isinstance(label, str) or not label.strip():
        out.append(f"{where}: place label missing")
    else:
        out += [f"{where}: place label: {x}" for x in gates.unsupported_tokens(label, _support(f, names), f"fact {fid}")]
    coord = p.get("coord")
    if coord is not None and not (isinstance(coord, str) and COORD_RE.match(coord)):
        out.append(f"{where}: coord {coord!r} must be wikidata:Q<n>, osm:node/<n>, osm:way/<n> or holder:<id>")
    return out


def _usable(m):
    return m.get("license_class") in rights.EMBEDDABLE


def _records(where, ch, F, M, names):
    out = []
    own = set(_ids(ch.get("fact_ids")))
    for key in ("records", "place_photos"):
        for mid in _items(ch.get(key)):
            m = M.get(mid) if isinstance(mid, str) else None
            if m is None:
                out.append(f"{where}: {key}: media {mid!r} is not on file")
                continue
            ok = shown(m) if key == "records" else m.get("status") == "verified"
            if not ok:
                out.append(f"{where}: {key}: {mid} is {m.get('status')}, not verified"
                           + (" (and no current owner ruling)" if key == "records" else ""))
                continue
            basis = m.get("record_kind") == "basis-photo"
            if key == "records" and basis and not _usable(m):
                out.append(f"{where}: records: {mid} is a reference-only basis photo ({m.get('license_class')}); it is never shown")
            elif key == "place_photos" and not basis:
                out.append(f"{where}: place_photos: {mid} is not a basis photo")
            elif key == "place_photos" and not own & set(_ids(m.get("basis_for"))):
                out.append(f"{where}: place_photos: {mid} is not basis_for any of the chapter's facts")
    return out


CHAPTER_RULES += [_title, _place, _records]


def _label_gaps(label, fids, F, names):
    texts = [t for fid in fids for t in (F[fid].get("claim") or "", F[fid].get("place") or "")]
    return gates.unsupported_tokens(label, gates.Support.from_texts(texts, names=names), "its facts")


# words by which a fact states a journey between its places; a route fact must use one (naming two places
# is not a journey: "offices in Vienna and New York"); the adversary has judged what the claim means
TRAVEL_WORDS = ("sailed", "travelled", "traveled", "travel", "arrived", "arrives", "arriving", "came", "went",
                "moved", "emigrated", "immigrated", "fled", "left", "journeyed", "journey", "reached", "landed",
                "crossed", "departed", "returned", "voyage", "flew", "drove", "walked", "boarded", "bound")


# A route fact states the leg itself: the destination right after to, for, into, reached (or "arrived in"),
# and the origin right after from or left, or named first as where an earlier leg ended ("landed in New York
# City and went by boat to Albany"). Only the label up to its first comma is matched; "the" is skipped.
DEST_MARKERS = ("to", "for", "into", "reached", "reaching", "toward", "towards")
ARRIVAL_WORDS = ("arrived", "arrives", "arriving", "landed", "landing", "came", "returned", "docked")
ORIGIN_MARKERS = ("from", "left", "leaving", "departed", "departing", "fled", "fleeing")


def _tokens(text):
    return re.findall(r"[a-z0-9]+", (text or "").lower())


def _occurrences(words, label):
    head = _tokens(label.split(",")[0])
    if not head:
        return []
    out = []
    for i in range(len(words) - len(head) + 1):
        if words[i:i + len(head)] == head:
            j = i - 1
            if j >= 0 and words[j] == "the" and head[0] != "the":
                j -= 1
            prev = words[j] if j >= 0 else None
            prev2 = words[j - 1] if j >= 1 else None
            dest = prev in DEST_MARKERS or (prev in ("in", "at") and prev2 in ARRIVAL_WORDS)
            out.append((i, dest, prev in ORIGIN_MARKERS))
    return out


def states_leg(claim, origin, destination):
    """True when the claim states travel from origin to destination (see DEST_MARKERS above)."""
    words = _tokens(claim)
    outs, dests = _occurrences(words, origin), _occurrences(words, destination)
    for d_at, d_marked, _ in dests:
        if not d_marked:
            continue
        if any(o_from or (o_dest and o_at < d_at) for o_at, o_dest, o_from in outs if o_at != d_at):
            return True
    return False


def _says(fact, phrases):
    text = " " + " ".join(re.findall(r"[a-z]+", (fact.get("claim") or "").lower())) + " "
    return any(f" {ph} " in text for ph in phrases)


def _journey(tmap, F, M, names):
    j = tmap.get("journey")
    if j is None:
        return []
    if not isinstance(j, dict):
        return ["journey: must be an object or null"]
    out = []
    chapter_ids = {c.get("id") for c in tmap["chapters"] if isinstance(c, dict) and isinstance(c.get("id"), str)}
    if not isinstance(j.get("chapter"), str) or j.get("chapter") not in chapter_ids:
        out.append(f"journey: chapter {j.get('chapter')!r} is not a chapter of this tour")
    out += _list_problems("journey", j, ("places", "segments"))
    places = _items(j.get("places"))
    if len(places) < 2:
        return out + ["journey: needs at least two places (origin and arrival)"]
    for n, pl in enumerate(places):
        where = f"journey place {n + 1}"
        if not isinstance(pl, dict):
            out.append(f"{where}: not an object")
            continue
        out += _list_problems(where, pl, ("fact_ids",))
        fids = _ids(pl.get("fact_ids"))
        if not fids:
            out.append(f"{where}: no fact (a pin goes only on a verified place)")
        bad = [p for p in (_fact_problem(where, fid, F) for fid in fids) if p]
        out += bad
        label = pl.get("label")
        if not (isinstance(label, str) and label.strip()):
            out.append(f"{where}: label missing")
        elif fids and not bad:
            out += [f"{where}: label: {x}" for x in _label_gaps(label, fids, F, names)]
        if not (isinstance(pl.get("coord"), str) and COORD_RE.match(pl["coord"])):
            out.append(f"{where}: coord {pl.get('coord')!r} must be wikidata:Q<n>, osm:node/<n>, osm:way/<n> or holder:<id>")
    segs = _items(j.get("segments"))
    if len(segs) != len(places) - 1:
        out.append(f"journey: {len(places)} places need {len(places) - 1} segments (got {len(segs)})")
    for n, s in enumerate(segs[:len(places) - 1]):
        where = f"journey segment {n + 1}"
        if not isinstance(s, dict):
            out.append(f"{where}: not an object")
            continue
        out += _list_problems(where, s, ("route_facts", "mode_facts"))
        for fid in _ids(s.get("route_facts")):
            p = _fact_problem(where, fid, F)
            if p:
                out.append(p)
                continue
            sup = gates.Support.from_texts([F[fid].get("claim") or "", F[fid].get("place") or ""], names=names)
            unnamed = False
            for end in (places[n], places[n + 1]):
                label = end.get("label") if isinstance(end, dict) else None
                if isinstance(label, str) and gates.unsupported_tokens(label, sup, f"fact {fid}"):
                    unnamed = True
                    out.append(f"{where}: route fact {fid} does not name {label!r} "
                               "(a line is routed only where a verified fact states that journey)")
            if unnamed:
                continue
            if not _says(F[fid], TRAVEL_WORDS + tuple(ph for v in MODE_PHRASES.values() for ph in v)):
                out.append(f"{where}: route fact {fid} does not state a journey "
                           "(a travel word such as sailed, travelled, arrived)")
            elif all(isinstance(e, dict) and isinstance(e.get("label"), str) for e in (places[n], places[n + 1])) \
                    and not states_leg(F[fid].get("claim"), places[n]["label"], places[n + 1]["label"]):
                out.append(f"{where}: route fact {fid} does not state the journey from {places[n]['label']!r} to "
                           f"{places[n + 1]['label']!r} (from or left before the origin, or the origin named first; "
                           "to, for, into, reached or arrived in before the destination)")
        mode = s.get("mode")
        if mode is None and _ids(s.get("mode_facts")):
            out.append(f"{where}: mode_facts given but no mode")
            out += [p for p in (_fact_problem(where, fid, F) for fid in _ids(s.get("mode_facts"))) if p]
        if mode is not None:
            if not isinstance(mode, str) or mode not in MODES:
                out.append(f"{where}: mode {mode!r} is not one of {', '.join(MODES)}")
            if not isinstance(mode, str):
                continue  # a malformed mode is a problem, not a key to look up
            mode_facts = _ids(s.get("mode_facts"))
            if not mode_facts:
                out.append(f"{where}: mode {mode!r} needs a verified mode fact")
            for fid in mode_facts:
                p = _fact_problem(where, fid, F)
                if p:
                    out.append(p)
                    continue
                if fid not in _ids(s.get("route_facts")):
                    out.append(f"{where}: mode fact {fid} is not one of the segment's route facts")
                if mode in MODE_PHRASES:
                    if not _says(F[fid], MODE_PHRASES[mode]):
                        out.append(f"{where}: mode fact {fid} does not state travel by {mode}")
                sup = gates.Support.from_texts([F[fid].get("claim") or "", F[fid].get("place") or ""], names=names)
                for end in (places[n], places[n + 1]):
                    label = end.get("label") if isinstance(end, dict) else None
                    if isinstance(label, str) and gates.unsupported_tokens(label, sup, f"fact {fid}"):
                        out.append(f"{where}: mode fact {fid} does not name {label!r} "
                                   "(a mode is shown only where a verified fact states it for this journey)")
    return out


TOUR_RULES.append(_journey)


def _journey_out(j):
    if not j:
        return None
    segs = []
    for s in _items(j.get("segments")):
        routed = bool(_ids(s.get("route_facts")))
        segs.append({"routed": routed, "route_facts": _ids(s.get("route_facts")), "mode": s.get("mode"),
                     "mode_facts": _ids(s.get("mode_facts")), "note": None if routed else ROUTE_NOTE})
    places = [{"id": p.get("id"), "label": p.get("label"), "fact_ids": _ids(p.get("fact_ids")), "coord": p.get("coord")}
              for p in _items(j.get("places"))]
    return {"chapter": j.get("chapter"), "places": places, "segments": segs}


def _linked(m, own, F):
    """True when a record names one of the chapter's facts: by id in its alt text, in basis_for or
    reconstruction_basis, or by sharing a source with a chapter fact's evidence."""
    text = m.get("alt_text") if isinstance(m.get("alt_text"), str) else ""
    if any(fid in text for fid in own):
        return True
    if own & (set(_ids(m.get("basis_for"))) | set(_ids(m.get("reconstruction_basis")))):
        return True
    sources = {e.get("source_id") for fid in own for e in (F.get(fid) or {}).get("evidence") or [] if isinstance(e, dict)}
    return bool(sources & set(_ids(m.get("source_ids"))))


def assemble(tmap, facts, media, names=(), date=None, rulings=None):
    """drafts/tour.json from a tour map that passes check(): chapters in time order (year of the
    chapter's own year fact, then the kind order), usable versus link-only records, place photos
    with their display rule, the journey with its route notes, and every gap."""
    problems = check(tmap, facts, media, names, rulings)
    if problems:
        raise TourError(problems)
    F, M = gates.by_id(facts), media_index(media, rulings)
    chapters = []
    for ch in tmap["chapters"]:
        recs = list(dict.fromkeys(_ids(ch.get("records"))))
        usable = [m for m in recs if _usable(M[m])]
        ruled = [m for m in recs if M[m].get("_owner_ruled")]
        photos = [{"media_id": m, "license_class": M[m].get("license_class"), "display": _usable(M[m])}
                  for m in dict.fromkeys(_ids(ch.get("place_photos")))]
        own = set(_ids(ch["fact_ids"]))
        unlinked = [m for m in recs if not _linked(M[m], own, F)]
        gaps = []
        if len(usable) < MIN_RECORDS:
            gaps.append(f"{len(usable)} usable records (fewer than {MIN_RECORDS})")
        if ch.get("place") is None:
            gaps.append("no verified place")
        elif not any(p["display"] for p in photos):
            gaps.append("no displayable photo of the place" + (" (reference-only photos on file)" if photos else ""))
        if unlinked:
            gaps.append(f"{len(unlinked)} record{'s' if len(unlinked) != 1 else ''} with no recorded link to a chapter fact "
                        f"(a reviewer confirms {'they fit' if len(unlinked) != 1 else 'it fits'})")
        chapters.append({"id": ch["id"], "kind": ch["kind"], "title": ch.get("title"),
                         "year": year_of(F[ch["year_fact"]]), "year_fact": ch["year_fact"],
                         "fact_ids": list(dict.fromkeys(_ids(ch["fact_ids"]))), "place": ch.get("place"),
                         "records": recs, "usable_records": usable, "owner_ruled_records": ruled,
                         "link_only_records": [m for m in recs if m not in usable], "unlinked_records": unlinked,
                         "place_photos": photos, "gaps": gaps})
    chapters.sort(key=lambda c: (c["year"], KIND_ORDER[c["kind"]]))
    journey = _journey_out(tmap.get("journey"))
    kinds = {c["kind"] for c in chapters}
    gaps = [f"no chapter of kind {k}" for k in KINDS if k not in kinds]
    if journey is None:
        gaps.append("no journey (origin and arrival pins)")
    else:
        gaps += [f"journey segment {n + 1}: route not recorded" for n, s in enumerate(journey["segments"]) if not s["routed"]]
    used = {fid for c in chapters for fid in c["fact_ids"]}
    if journey:
        used |= {fid for p in journey["places"] for fid in p["fact_ids"]}
        used |= {fid for s in journey["segments"] for fid in s["route_facts"] + s["mode_facts"]}
    unassigned = sorted(f["id"] for f in facts if f.get("status") == "verified" and f.get("id") not in used)
    return {"slug": tmap.get("slug"), "run_id": tmap.get("run_id"), "generated": date, "chapters": chapters,
            "journey": journey, "unassigned_fact_ids": unassigned, "gaps": gaps}


CATEGORY_KIND = {"birth": "birth", "education": "education", "immigration": "arriving",
                 "citizenship": "citizen", "career": "first-work", "work": "big-work",
                 "invention": "big-work", "award": "honoured", "death": "legacy", "legacy": "legacy"}
KEY_CATEGORIES = ("birth", "immigration", "citizenship", "work", "invention", "award", "death")
KIND_WORDS = {"birth": "born", "education": "student", "leaving": "left", "arriving": "arrived",
              "first-work": "", "citizen": "citizen", "big-work": "", "history": "", "honoured": "honored",
              "legacy": "died"}
NEED_ORDER = ("journey", "chapter-facts", "records", "corroborate", "place-photo", "place-fact")
LEAD_CATEGORY = {"legacy": "death"}  # a legacy chapter is dated by the death, as the shipped tours are


def _mentions(m, ids):
    text = m.get("alt_text") if isinstance(m.get("alt_text"), str) else ""
    return any(fid in text for fid in ids) or bool(set(_ids(m.get("reconstruction_basis"))) & set(ids))


def propose(facts, media, slug, run_id=None):
    """A deterministic first draft from verified facts: category to kind, the earliest dated career
    facts as first work and later ones as big work, education only before the first arrival.
    Undated, family, identity, quote and other facts are left in unassigned_fact_ids for judgement."""
    V = [f for f in facts if f.get("status") == "verified" and isinstance(f.get("id"), str)]
    arrival = min((year_of(f) for f in V if f.get("category") == "immigration" and year_of(f)), default=None)
    groups, unassigned = {}, []
    for f in V:
        kind = CATEGORY_KIND.get(f.get("category"))
        if kind == "education" and arrival is not None and (year_of(f) is None or year_of(f) >= arrival):
            kind = None
        if kind is None:
            unassigned.append(f["id"])
        else:
            groups.setdefault(kind, []).append(f)
    career = groups.pop("first-work", [])
    dated = sorted((f for f in career if year_of(f)), key=year_of)
    if dated:
        first = year_of(dated[0])
        groups["first-work"] = [f for f in dated if year_of(f) == first]
        groups.setdefault("big-work", []).extend(f for f in dated if year_of(f) != first)
    unassigned += [f["id"] for f in career if not year_of(f)]
    chapters = []
    for kind in KINDS:
        fs = groups.get(kind) or []
        lead = LEAD_CATEGORY.get(kind)
        dated = sorted((f for f in fs if year_of(f)), key=lambda f: (f.get("category") != lead, year_of(f), f["id"]))
        if not dated:
            unassigned += [f["id"] for f in fs]
            continue
        ids = sorted(f["id"] for f in fs)
        placed = next((f for f in dated if isinstance(f.get("place"), str) and f["place"].strip()), None)
        verified_media = [m for m in media if m.get("status") == "verified" and isinstance(m.get("id"), str)]
        chapters.append({
            "id": kind, "kind": kind, "title": None, "fact_ids": ids, "year_fact": dated[0]["id"],
            "place": {"label": placed["place"], "fact_id": placed["id"], "coord": None} if placed else None,
            "records": [m["id"] for m in verified_media if m.get("record_kind") in (None, "item") and _mentions(m, ids)],
            "place_photos": [m["id"] for m in verified_media if m.get("record_kind") == "basis-photo"
                             and set(_ids(m.get("basis_for"))) & set(ids)]})
    return {"slug": slug, "run_id": run_id, "source": "propose", "chapters": chapters, "journey": None,
            "unassigned_fact_ids": sorted(set(unassigned))}


def _q(*parts):
    return " ".join(str(p) for p in parts if p not in (None, ""))


def plan_items(tmap, facts, media, name, max_items=25, rulings=None):
    """The research work order: what the tour still lacks, most important first."""
    F, M = gates.by_id(facts), media_index(media, rulings)
    chapters = [c for c in _items(tmap.get("chapters")) if isinstance(c, dict)]
    items = []
    j = tmap.get("journey")
    if not j:
        items.append({"need": "journey", "detail": "no journey: find verified origin and arrival places",
                      "queries": [_q(name, "arrived"), _q(name, "sailed")]})
    else:
        places = _items(j.get("places"))
        for n, s in enumerate(_items(j.get("segments"))):
            if not _ids(s.get("route_facts")) and n + 1 < len(places):
                a, b = places[n].get("label"), places[n + 1].get("label")
                items.append({"need": "journey", "detail": f"route not recorded: {a} to {b}", "queries": [_q(name, a, b)]})
    have = {c.get("kind") for c in chapters}
    items += [{"need": "chapter-facts", "kind": k, "queries": [_q(name, KIND_WORDS[k])]} for k in KINDS if k not in have]
    for c in chapters:
        year = year_of(F.get(c.get("year_fact")) or {})
        place = (c.get("place") or {}).get("label")
        usable = [m for m in _ids(c.get("records")) if m in M and shown(M[m]) and _usable(M[m])]
        if len(usable) < MIN_RECORDS:
            items.append({"need": "records", "chapter": c.get("id"), "have": len(usable), "queries": [_q(name, place, year)]})
        if c.get("place") is None:
            items.append({"need": "place-fact", "chapter": c.get("id"), "queries": [_q(name, KIND_WORDS.get(c.get("kind"), ""), year)]})
        elif not any(M.get(p, {}).get("status") == "verified" and _usable(M[p]) for p in _ids(c.get("place_photos"))):
            items.append({"need": "place-photo", "chapter": c.get("id"), "queries": [_q(place, year)]})
    for f in sorted((f for f in facts if isinstance(f.get("id"), str)), key=lambda f: f["id"]):
        if f.get("status") == "single-source" and f.get("category") in KEY_CATEGORIES:
            items.append({"need": "corroborate", "fact_id": f["id"], "claim": f.get("claim"),
                          "queries": [_q(name, f.get("place"), year_of(f))]})
    items.sort(key=lambda it: NEED_ORDER.index(it["need"]))
    return items[:max_items]


MEDIA_ID_RE = re.compile(r"^[A-Z]{3}-M-[0-9]{4}$")


def seed_from_app(app_tour, slug, facts, run_id=None):
    """A tour map from the shipped tour (one inductee of tour-use.generated.json), for enriching an
    existing tour and for comparing. Stops that are not media records (recreations, panels) are
    listed in app_objects; the app does not record a place fact, so place is null."""
    F = gates.by_id(facts)
    chapters, objects, journey = [], [], None
    for ac in _items(app_tour.get("chapters")):
        fids = list(dict.fromkeys(_ids(ac.get("factIds"))))
        year_fact = ac.get("yearFact") or next((f for f in fids if year_of(F.get(f) or {}) == ac.get("year")), None)
        recs = []
        for st in _items(ac.get("stops")):
            r = st.get("record") if isinstance(st, dict) else None
            if isinstance(r, str) and MEDIA_ID_RE.match(r):
                recs.append(r)
            elif isinstance(r, str) and r:
                objects.append({"chapter": ac.get("id"), "object": r})
        chapters.append({"id": ac.get("id"), "kind": ac.get("kind"), "title": None, "fact_ids": fids,
                         "year_fact": year_fact, "place": None, "records": list(dict.fromkeys(recs)), "place_photos": []})
        m = ac.get("map")
        if journey is None and isinstance(m, dict):
            journey = {"chapter": ac.get("id"),
                       "places": [{"id": p.get("id"), "label": p.get("label"), "fact_ids": _ids(p.get("factIds")),
                                   "coord": p.get("coord")} for p in _items(m.get("places"))],
                       "segments": [{"route_facts": _ids(s.get("journeyFacts")), "mode": s.get("mode"),
                                     "mode_facts": _ids(s.get("modeFacts"))} for s in _items(m.get("segments"))]}
    return {"slug": slug, "run_id": run_id, "source": "app", "chapters": chapters, "journey": journey,
            "app_objects": objects}


def _recall(app_ids, draft_ids):
    return round(len(app_ids & draft_ids) / len(app_ids), 2) if app_ids else None


def compare(tour_out, app_tour):
    """How a draft tour (assemble() output) differs from the shipped tour of the same inductee."""
    draft = list(_items(tour_out.get("chapters")))
    used, rows, objects = set(), [], []
    for ac in _items(app_tour.get("chapters")):
        cands = [c for c in draft if c["kind"] == ac.get("kind") and c["id"] not in used]
        match = min(cands, key=lambda c: abs(c["year"] - (ac.get("year") or 0))) if cands else None
        if match:
            used.add(match["id"])
        app_facts = set(_ids(ac.get("factIds")))
        stops = [s.get("record") for s in _items(ac.get("stops")) if isinstance(s, dict) and isinstance(s.get("record"), str)]
        app_recs = {r for r in stops if MEDIA_ID_RE.match(r)}
        objects += [{"chapter": ac.get("id"), "object": r} for r in stops if not MEDIA_ID_RE.match(r)]
        d_facts = set(match["fact_ids"]) if match else set()
        d_recs = set(match["records"]) if match else set()
        rows.append({"app_chapter": ac.get("id"), "kind": ac.get("kind"), "app_year": ac.get("year"),
                     "draft_chapter": match["id"] if match else None, "draft_year": match["year"] if match else None,
                     "fact_recall": _recall(app_facts, d_facts) if match else (0.0 if app_facts else None),
                     "missing_facts": sorted(app_facts - d_facts), "new_facts": sorted(d_facts - app_facts),
                     "record_recall": _recall(app_recs, d_recs) if match else (0.0 if app_recs else None),
                     "missing_records": sorted(app_recs - d_recs), "new_records": sorted(d_recs - app_recs)})
    app_map = next((ac["map"] for ac in _items(app_tour.get("chapters")) if isinstance(ac.get("map"), dict)), None)
    dj = tour_out.get("journey")
    a_places = (app_map or {}).get("places") or []
    d_places = (dj or {}).get("places") or []
    ends = lambda ps: (ps[0].get("coord"), ps[-1].get("coord")) if ps else None
    journey = {"endpoints_equal": ends(a_places) == ends(d_places),
               "routed_equal": [bool(_ids(s.get("journeyFacts"))) for s in (app_map or {}).get("segments") or []]
               == [s["routed"] for s in (dj or {}).get("segments") or []],
               "app_places": len(a_places), "draft_places": len(d_places)}
    vals = lambda key: [r[key] for r in rows if isinstance(r[key], float)]
    mean = lambda xs: round(sum(xs) / len(xs), 2) if xs else None
    summary = {"app_chapters": len(rows), "matched": sum(1 for r in rows if r["draft_chapter"]),
               "mean_fact_recall": mean(vals("fact_recall")), "mean_record_recall": mean(vals("record_recall"))}
    return {"chapters": rows, "draft_only_chapters": [c["id"] for c in draft if c["id"] not in used],
            "app_objects": objects, "journey": journey, "summary": summary}
