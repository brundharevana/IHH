"""Write the site provenance package for IHH's chatbot (Task 18): data/export/site-provenance.jsonld and
data/export/ROOMS-INDEX.md in the facts store (this repository's data/, merged from revamp/facts), next to provenance.jsonld and the CSVs.

What it records is what the shipped tour shows and says (app/src/tour/data/tour-use.generated.json,
written by scripts/export_chapters.mjs from the chapter data files):

  rooms          every recreated room a chapter shows, as a schema.org CreativeWork (additionalType
                 ihh:RoomRecreation) that isBasedOn each photograph or document of its SOURCES.md (media id,
                 holder, rights, role: basis / modelling-reference / material), with each modelled object
                 of its INVENTORY.md (hasPart: nodes, the photograph that shows it, the inventory's own words)
  photo rooms    the photograph a photo room projects (additionalType ihh:PhotoRoom)
  gallery cases  the IHH gallery a chapter falls back to, with the records it shows (ihh:GalleryCase)
  recreations    the labelled object recreations (ihh:ObjectRecreation) and what they were modelled from
  built, not shown  rooms built but used by no chapter, and the no-room fallback, with their DECISION reason
  spoken lines   every narration line the tour can play, as a SpeakableSpecification citing its fact ids
                 (the Claim nodes of provenance.jsonld, same @id), and every wayfinding line of the guide
                 (no claim)
  viewer records every record a stop opens, with its media id (the MediaObject of provenance.jsonld)
  chapters       each chapter: its place, stops, opening, the fact ids it rests on

Pixels: the package holds no image. ihh:pixelsShown is true for a record the tour shows in the viewer
or as a photo room, and for a record whose pixels texture a room (the room folder's meta.json
texturesFrom, gated by check_textures.py; the room node lists them as ihh:texturesFrom, and an item
without its own record, e.g. a frame of NARA roll WHPO-P02724, carries ihh:inheritsRecord and the
owner's ruling). A modelling reference is listed with its rights status and ihh:pixelsShown false;
the exporter stops if a modelling reference is shown or textures a room.
Review fields of the store (reviewer names, notes) are never copied.

Run from the repository root (IHH-revamp), after `npx vite-node scripts/export_chapters.mjs` in app/:
    python3 app/scripts/export_site_provenance.py [--facts DIR]
DIR defaults to this repository (as build_fact_index.py); pass --facts to write into another checkout.
"""
import argparse
import datetime
import json
import re
import struct
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_fact_index import CLEARED, OWNER_RULED, REFERENCE_ONLY, TEXTURE_RULINGS  # noqa: E402  the tour's own display rule

MEDIA_ID = re.compile(r"\b(?:[A-Z]{1,4}-M-\d{4}|RL-M-[A-Z]{3}-[A-Za-z0-9-]*[A-Za-z0-9])\b")
# A row (or its rights words) that says this: the photograph is used to model from only.
REFERENCE_WORDS = re.compile(r"reference only|modell?ing reference|rights-restricted", re.I)
STORE_ID = re.compile(r"^[A-Z]{1,4}-M-\d{4}$")

# Rooms built (or decided) but shown by no chapter (assets-src/_queue/PROGRESS.md, "Built rooms
# deliberately not used by any chapter"; einstein-nassau-point: the no-room fallback of einstein / history).
BUILT_NOT_SHOWN = [
    "albright-london-shelter",
    "naismith-mcgill-old-hall",
    "naismith-berlin-1936",
    "muir-fountain-lake",
    "muir-glacier-point-1903",
    "einstein-nassau-point",
]

# The folder of each labelled object recreation (its SOURCES.md and INVENTORY.md). A record with a
# `recreation` field that is not here stops the export, so no recreation goes out without its sources.
RECREATION_FOLDERS = {
    "EIN-PIPE-RECREATION": "einstein-pipe",
    "NAI-PEACH-BASKET-RECREATION": "naismith-recreations",
    "NAI-BALL-RECREATION": "naismith-recreations",
    "LAM-MECHANISM-RECREATION": "lamarr-mechanism",
}

CONTEXT = {"@vocab": "https://schema.org/", "prov": "http://www.w3.org/ns/prov#", "ihh": "https://immigranthallofhonor.org/ns#"}

RULES = {
    "labels": "A label or note says what the photograph shows. Where the photograph shows another day, "
    "another occasion or another building than the chapter's, the label says so.",
    "estimates": "Sizes, positions and colours a model needed but no photograph gives are modelling estimates. "
    "They are marked as estimates or interpretive in INVENTORY.md and are never stated as facts.",
    "facts": "Every spoken line about an inductee is the text of a verified fact (citation). A room note says "
    "what the model shows and rests on its room's INVENTORY.md (ihh:basis), not on a fact.",
    "rights": "A photograph is shown only when its media record is verified and its holder's own rights words "
    "make it free to use (public domain, CC0, CC BY). Others are modelling references: used to model from, "
    "their pixels never shown and never in this package.",
    "shownBy": "ihh:shownBy lists, for each part of the inventory's 'Seen' cell, the one photograph it names: a media "
    "id, a frame or a short name that SOURCES.md or INVENTORY.md ties to exactly one item, or 'yes' in a room with one "
    "photograph. A part that cannot be tied to one photograph is given as its own words with ihh:unresolved true. "
    "ihh:seenIn is the inventory's own words.",
}


# ---------- reading ----------

def _jsonl(path):
    return [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines() if l.strip()] if path.exists() else []


def load_store(facts_root):
    """Media and fact records of the store: only the fields the package needs (never review fields)."""
    media, facts = {}, {}
    base = Path(facts_root) / "data/inductees"
    for d in sorted(p for p in base.iterdir() if p.is_dir()):
        for m in _jsonl(d / "media.jsonl"):
            media[m["id"]] = {k: m.get(k) for k in ("title", "credit", "url", "rights_statement", "license_class", "record_kind", "status")}
        for f in _jsonl(d / "facts.jsonl"):
            facts[f["id"]] = f.get("status")
    return media, facts


def _cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def md_sections(text):
    """[{heading, level, prose, tables: [{header, rows}]}]; the text before the first heading is level 0."""
    secs = [{"heading": "", "level": 0, "prose": [], "tables": []}]
    table = None
    for line in text.splitlines():
        m = re.match(r"^(#+)\s+(.*)$", line)
        if m:
            secs.append({"heading": m.group(2).strip(), "level": len(m.group(1)), "prose": [], "tables": []})
            table = None
            continue
        if line.lstrip().startswith("|"):
            cells = _cells(line)
            if table is None:
                table = {"header": cells, "rows": []}
                secs[-1]["tables"].append(table)
            elif not all(re.fullmatch(r":?-+:?", c) for c in cells if c):
                table["rows"].append(cells)
            continue
        table = None
        secs[-1]["prose"].append(line)
    for s in secs:
        s["prose"] = " ".join(l.strip() for l in s["prose"] if l.strip())
    return secs


def section_role(heading, level):
    h = heading.lower()
    if level <= 1:
        return "intro"
    if "not used" in h or "considered" in h:
        return "consulted-not-used"
    if "context" in h or "read for" in h:
        return "context"
    if "reference" in h or "no pixels" in h or "geometry" in h:
        return "modelling-reference"
    if "third-party" in h:
        return "third-party"
    if "material" in h:
        return "material"
    if "listing" in h or "text source" in h:
        return "text-source"
    if "basis" in h or "the object" in h or "drawings" in h:
        return "basis"
    return None


def _col(header, *words):
    for i, h in enumerate(header):
        if any(w in h.lower() for w in words):
            return i
    return None


def _phrases(cells, pattern):
    """The phrases of a row's cells that hold the pattern (for a role reason, verbatim)."""
    out = []
    for c in cells:
        for x in re.split(r"(?<=[.;:])\s+", c):
            if pattern.search(x) and x.strip() not in out:
                out.append(x.strip())
    return " / ".join(out)


def record_key(url):
    """A holder's item key in a URL, shared by a record page and the pages of its items: LoC
    /item/<key>/ and /resource/<coll>.<key>.<part>/; NARA catalog /id/<n>. None otherwise."""
    m = re.search(r"loc\.gov/item/([a-z]{2,}\d+)\b", url or "") or re.search(r"loc\.gov/resource/[a-z]+\.([a-z]{2,}\d+)\.", url or "")
    if m:
        return "loc:" + m.group(1)
    m = re.search(r"catalog\.archives\.gov/id/(\d+)", url or "")
    return "nara:" + m.group(1) if m else None


def item_file_key(url):
    """The holder's record key of an item file that has its own media record: a LoC HABS/HAER/HALS image file
    (tile.loc.gov .../pnp/habshaer/<state>/<range>/<key>/<photos|sheet|...>/<file>) belongs to the record /item/<key>/.
    None otherwise. Kept apart from record_key: many item files share one record, and only the record page
    may stand for the record."""
    m = re.search(r"tile\.loc\.gov/storage-services/(?:service|master)/pnp/habshaer/[a-z]{2}/[a-z]{2}\d+/([a-z]{2}\d+)/[a-z]+/", url or "")
    return "loc:" + m.group(1) if m else None


def _id_column(rows):
    """The column whose cells hold media ids (the most rows with an id; the leftmost on a tie), or None.
    Chosen by the values, not by a header word: a header such as "Caption (holder's record)" is not it."""
    best, best_n = None, 0
    width = max((len(r) for r in rows), default=0)
    for i in range(width):
        n = sum(1 for r in rows if i < len(r) and MEDIA_ID.search(r[i]))
        if n > best_n:
            best, best_n = i, n
    return best


def _unquote(s):
    """Drop the quotes round a cell that is one quoted string; leave any other cell as written."""
    if not s:
        return s
    t = s.strip()
    m = re.fullmatch(r'["“]([^"“”]*)["”]', t)
    return m.group(1).strip() if m else t


def _sentences(prose):
    """Sentences of a paragraph. No break inside a quotation, or after an initial ("William J. Clinton")."""
    out, start = [], 0
    for m in re.finditer(r"[.!?][\"”]?\s+(?=[A-Z(*`])", prose):
        head = prose[:m.end()]
        if head.count('"') % 2 or head.count("“") > head.count("”"):
            continue
        i = m.start()
        if i >= 1 and prose[i - 1].isupper() and (i < 2 or not prose[i - 2].isalpha()):
            continue
        out.append(prose[start:m.end()].strip())
        start = m.end()
    out.append(prose[start:].strip())
    return [x for x in out if x]


def _rights_sentences(prose):
    """The sentences of a section's prose that state rights (for a table without a Rights column)."""
    hits = [x for x in _sentences(prose) if re.search(r"rights|restriction|licen|public domain|reference only|copyright", x, re.I)]
    return " ".join(hits)


NOT_STATED = "not stated in source notes"
_INSTITUTION = re.compile(r"^(National Archives|Library of Congress|[A-Z][\w .,'&-]*?(Archives|Museum|Library|Society|Survey|College))\b")


def _holder_sentence(heading, prose):
    """The holder a section names: a "Holder:" sentence, else a first sentence or heading
    parenthetical that begins with an institution's name."""
    for x in _sentences(prose):
        m = re.match(r"^Holders?:\s*(.*)$", x)
        if m:
            return m.group(1).rstrip(".")
    first = _sentences(prose)[:1]
    if first and _INSTITUTION.match(first[0]):
        return first[0].rstrip(".")
    m = re.search(r"\(([^()]*)\)\s*$", heading)
    if m and _INSTITUTION.match(m.group(1)):
        return m.group(1)
    return None


def parse_sources(path):
    """Items of a SOURCES.md: [{mediaIds, identifier, holder, rights, role, section, context}] and its assets."""
    items, assets = [], []
    if not path.exists():
        return items, assets
    secs = md_sections(path.read_text(encoding="utf-8"))
    in_tables = set()
    # rights words of a section about rights (e.g. "Rights re-check"), for rows that state none
    file_rights = " ".join(_rights_sentences(x["prose"]) for x in secs if "rights" in x["heading"].lower()).strip() or None
    for s in secs:
        role = section_role(s["heading"], s["level"])
        if role in (None, "intro"):
            continue
        for t in s["tables"]:
            hd = t["header"]
            if role == "third-party":
                si, li, ui = _col(hd, "source"), _col(hd, "licen"), _col(hd, "use")
                for r in t["rows"]:
                    get = lambda i: r[i] if i is not None and i < len(r) else None
                    assets.append({"name": r[0], "ihh:source": get(si), "ihh:licence": get(li), "ihh:use": get(ui)})
                continue
            low = [h.lower() for h in hd]
            if "sha256" in low and not any("use" in h or "what" in h for h in low):
                continue  # a checksum list of files already described above
            hi = next((i for i, h in enumerate(low) if h.startswith("holder")), None)
            mi, ri, ui = _id_column(t["rows"]), _col(hd, "rights", "licen"), _col(hd, "used for", "use")
            prev_rights = None
            sec_holder = _holder_sentence(s["heading"], s["prose"])
            for r in t["rows"]:
                get = lambda i: r[i] if i is not None and i < len(r) else None
                rights, rights_from = _unquote(get(ri)), "SOURCES.md row"
                if rights and re.match(r"^(same|as above)\b", rights.lower()) and prev_rights:
                    rights = f"{prev_rights} (SOURCES.md: \"{rights}\")"
                if not rights:
                    rights, rights_from = _rights_sentences(s["prose"]) or None, "SOURCES.md section"
                if not rights and file_rights:
                    rights, rights_from = file_rights, "SOURCES.md rights section"
                prev_rights = rights
                holder, holder_from = get(hi), "SOURCES.md row"
                if not holder and sec_holder:
                    holder, holder_from = sec_holder, "SOURCES.md section"
                ids = MEDIA_ID.findall(get(mi) if mi is not None else r[0])
                staged = [x for x in ids if not STORE_ID.match(x)]
                if staged and len(staged) < len(ids):
                    ids = [x for x in ids if STORE_ID.match(x)]  # "MUI-M-0056 / RL-M-...": one photograph, its store record
                in_tables.update(ids)
                row_role = "consulted-not-used" if (get(ui) or "").lower().startswith("not used") else role
                role_reason = None
                if row_role in ("basis", "material") and REFERENCE_WORDS.search(" ".join(r)):
                    row_role = "modelling-reference"  # the row's own words outrank its section heading
                    role_reason = f"its SOURCES.md row says: {_phrases(r, REFERENCE_WORDS)}"
                items.append({"mediaIds": ids, "identifier": (get(mi) if mi is not None and ids else r[0])[:300],
                              "holder": holder, "holderFrom": holder_from if holder else None,
                              "rights": rights, "rightsFrom": rights_from if rights else None, "roleReason": role_reason,
                              "urls": re.findall(r"https?://\S+", " ".join(r)),
                              "role": row_role, "section": s["heading"], "context": None,
                              "row": {h: c for h, c in zip(hd, r) if h}})
    # a section whose one table row names no id while its prose names one store id: that row is that record
    # (lamarr-mgm-gate: "Its media record LAM-M-0026 ..." over a one-row table)
    for s in secs:
        own = [it for it in items if it["section"] == s["heading"] and it["row"] is not None]
        prose_ids = list(dict.fromkeys(m for m in MEDIA_ID.findall(s["prose"]) if STORE_ID.match(m) and m not in in_tables))
        if len(own) == 1 and not own[0]["mediaIds"] and len(prose_ids) == 1:
            own[0]["mediaIds"] = prose_ids
            own[0]["context"] = next(x for x in _sentences(s["prose"]) if prose_ids[0] in x)
            in_tables.add(prose_ids[0])
    # a text source with no table (a listing): its first sentence names it
    for s in secs:
        if section_role(s["heading"], s["level"]) == "text-source" and not s["tables"] and s["prose"]:
            first = _sentences(s["prose"])[0]
            items.append({"mediaIds": [], "identifier": first[:300], "holder": first.split(",")[0], "holderFrom": "SOURCES.md section",
                          "rights": _rights_sentences(s["prose"]) or None, "rightsFrom": "SOURCES.md section",
                          "roleReason": None, "urls": [], "role": "text-source", "section": s["heading"], "context": None, "row": None})
    # media ids named only in prose (the intro or a role section): the sentence goes along verbatim
    for s in secs:
        role = section_role(s["heading"], s["level"])
        if role not in ("intro", "basis", "modelling-reference", "material", "context", "consulted-not-used"):
            continue
        for sent in _sentences(s["prose"]):
            # store ids only: staged lead ids (RL-M-...) in prose are research notes, not records
            for mid in (m for m in MEDIA_ID.findall(sent) if STORE_ID.match(m)):
                if mid in in_tables:
                    continue
                in_tables.add(mid)
                r = "consulted-not-used" if "not used" in sent.lower() else ("basis" if role == "intro" else role)
                items.append({"mediaIds": [mid], "identifier": mid, "holder": None, "holderFrom": None,
                              "rights": None, "rightsFrom": None, "roleReason": None, "urls": [], "role": r,
                              "section": s["heading"] or "(introduction)", "context": sent, "row": None})
    return items, assets


def parse_inventory(path):
    """Modelled objects of an INVENTORY.md: [{name, nodes, seenIn, notes, section}]."""
    out = []
    if not path.exists():
        return out
    for s in md_sections(path.read_text(encoding="utf-8")):
        for t in s["tables"]:
            hd = t["header"]
            if not re.match(r"^(element|object|part)\b", hd[0].lower()):
                continue
            si = next((i for i, h in enumerate(hd) if re.match(r"^(seen|in |source)", h.lower())), None)
            ni = _col(hd, "notes")
            for r in t["rows"]:
                first = r[0]
                nodes = re.findall(r"`([^`]+)`", first)
                name = re.sub(r"\s*\((?:[^()]*`[^()]*)\)", "", first).replace("`", "").strip()
                out.append({"name": name, "nodes": nodes, "seenIn": r[si] if si is not None and si < len(r) else None,
                            "notes": r[ni] if ni is not None and ni < len(r) else None, "section": s["heading"]})
    return out


def glb_label(path):
    """The recreation label a room's glb carries (node label_recreation, extras.text), or None."""
    if not path.exists():
        return None
    with open(path, "rb") as f:
        head = f.read(20)
        if len(head) < 20 or head[:4] != b"glTF":
            return None
        length = struct.unpack("<I", head[12:16])[0]
        doc = json.loads(f.read(length))
    for n in doc.get("nodes", []):
        if n.get("name") == "label_recreation":
            return (n.get("extras") or {}).get("text")
    return None


def decision_status(path):
    """The DECISION.md 'Status:' paragraph (to the next blank line), without markdown emphasis."""
    if not path.exists():
        return None
    out = None
    for line in path.read_text(encoding="utf-8").splitlines():
        if out is None and line.startswith("Status:"):
            out = [line[len("Status:"):]]
        elif out is not None:
            if not line.strip():
                break
            out.append(line)
    return " ".join(l.strip() for l in out).replace("**", "").strip() if out else None


def progress_tables(path):
    """PROGRESS.md: {'<slug> / <chapter>': reason} for non-room chapters and {room: why} for unused rooms."""
    fallback, unused = {}, {}
    if not path.exists():
        return fallback, unused
    for s in md_sections(path.read_text(encoding="utf-8")):
        for t in s["tables"]:
            h = [c.lower() for c in t["header"]]
            if h[:1] == ["inductee / chapter"] and "reason" in h:
                for r in t["rows"]:
                    fallback[r[0].replace(" ", "")] = r[h.index("reason")]
            if h[:2] == ["room", "why unused"]:
                for r in t["rows"]:
                    unused[r[0]] = r[1]
    return fallback, unused


def credits_heading(text, room_id):
    pat = re.compile(r"(?:models/|, )" + re.escape(room_id) + r"(?![\w-])")
    for line in text.splitlines():
        if line.startswith("## ") and pat.search(line):
            return line[3:].strip()
    return None


# ---------- building ----------

def _compact(x):
    return re.sub(r"[\s\"“”]", "", x or "").upper()


def _numbers(text):
    """Frame numbers in a frame list such as "16, 17, 18" or "19-24" (two digits at most each)."""
    out = set()
    for a, b in re.findall(r"\b(\d{1,2})(?:-(\d{1,2}))?\b", text):
        out.update(range(int(a), int(b or a) + 1))
    return out


def seen_resolver(items, text):
    """A function from an inventory 'Seen' cell to shownBy: [{"@id"}...] for each part it can tie to exactly
    one photograph (a media id; a frame named "<id> (frame N)" in SOURCES.md, or the frame group that lists
    N; a short name such as "E42" defined as ("E42") in the notes, or found in one item's row), and
    {"ihh:seenText", "ihh:unresolved": true} for each part it cannot. "no ..." / "not ..." is []; "yes" names
    the photograph only when the room has one. Never every photograph of the room."""
    frame_map = {int(n): f"ihh:{m}" for m, n in re.findall(r"\b([A-Z]{1,4}-M-\d{4}) \((?:frame|image) (\d{1,3})\)", text)}
    rows = []
    for b in items:
        row = " ".join([b.get("ihh:identifier") or "", b.get("ihh:mediaId") or "", *(b.get("ihh:sourcesRow") or {}).values(), b.get("ihh:holder") or ""])
        rows.append((b, _compact(row), _compact(b.get("ihh:identifier") or b.get("ihh:mediaId"))))
    groups = [(b, _numbers(b["ihh:identifier"])) for b in items if not b.get("ihh:mediaId") and re.fullmatch(r"[\d,\s-]+", b.get("ihh:identifier") or "")]

    def unique(key):
        k = _compact(key)
        if not k:
            return None
        hits = [b for b, _, ident in rows if ident == k]
        if not hits and len(k) >= 3 and re.search(r"\d", k):
            hits = [b for b, row, _ in rows if k in row]
        return hits[0]["@id"] if len(hits) == 1 else None

    aliases = {}
    for phrase, alias, rest in re.findall(r"([^()\n;:]{2,80}?)\s*\(\"([^\"]{1,20})\"([^()]*)\)", text):
        named = MEDIA_ID.findall(rest)  # ("HS-corr", EIN-M-0073, ...): the alias names its record
        if len(named) == 1:
            aliases[_compact(alias)] = f"ihh:{named[0]}"
            continue
        words = phrase.replace(",", " ").split()
        tail = [w for w in words if re.search(r"\d", w)][-2:] or words[-1:]
        hit = unique(" ".join(words[-3:])) or unique(" ".join(tail)) or (unique(tail[-1]) if tail else None)
        if hit:
            aliases[_compact(alias)] = hit
    photos = [b for b in items if b["ihh:role"] in ("basis", "modelling-reference")]

    def part(p):
        p = re.sub(r"\([^()]*\)", "", p).replace("“", "").replace("”", "").strip(" .\"")
        if not p:
            return []
        if re.match(r"^(no|not)\b", p.lower()):
            return []
        ids = MEDIA_ID.findall(p)
        if ids:
            return [{"@id": f"ihh:{m}"} for m in ids]
        if re.fullmatch(r"[\d\s,-]+", p):
            out = []
            for n in sorted(_numbers(p)):
                hit = frame_map.get(n) or next((b["@id"] for b, nums in groups if n in nums), None)
                out.append({"@id": hit} if hit else {"ihh:seenText": str(n) if len(_numbers(p)) > 1 else p, "ihh:unresolved": True})
            return out
        if re.match(r"^(yes|partly|seen|photograph|the photograph|card|the card)\b", p.lower()):
            return [{"@id": photos[0]["@id"]}] if len(photos) == 1 else [{"ihh:seenText": p, "ihh:unresolved": True}]
        if re.search(r"\btext\b", p.lower()):
            return [{"ihh:seenText": p, "ihh:unresolved": True}]  # a text source, not a photograph
        words = p.split()
        for key in (p, " ".join(words[:2]), words[0]):
            hit = aliases.get(_compact(key)) or unique(key)
            if hit:
                return [{"@id": hit}]
        # a name inside the phrase ("pitched roof also in LOC-1913"): exact identifiers or aliases only
        exact = {ident: b["@id"] for b, _, ident in rows if ident}
        for b, _, _ in rows:  # a row that names its record keeps its short name (first cell, e.g. "Sheet 13")
            first = next(iter((b.get("ihh:sourcesRow") or {}).values()), None)
            if first and b.get("ihh:mediaId") and _compact(first) not in exact:
                exact[_compact(first)] = b["@id"]
        hits = {aliases.get(_compact(w)) or exact.get(_compact(w)) for w in words + [" ".join(words[i:i + 2]) for i in range(len(words) - 1)]}
        hits.discard(None)
        if len(hits) == 1:
            return [{"@id": hits.pop()}]
        return [{"ihh:seenText": p, "ihh:unresolved": True}]

    def resolve(seen):
        if re.match(r"^\s*(no|not)\b", seen.lower()) or not seen.strip():
            return []
        out = []
        for chunk in re.split(r"[;,](?![^()]*\))", seen):
            for x in part(chunk):
                if x not in out:
                    out.append(x)
        return out

    return resolve


class Builder:
    def __init__(self, repo, facts_root, tour, built_not_shown):
        self.repo, self.facts_root, self.tour = Path(repo), Path(facts_root), tour
        self.built_not_shown = built_not_shown
        self.media, self.facts = load_store(facts_root)
        keys = {}
        for mid, m in self.media.items():
            k = record_key(m.get("url"))
            if k:
                keys.setdefault(k, []).append(mid)
        self.record_by_key = {k: v[0] for k, v in keys.items() if len(v) == 1}
        # items of a bundled record that have their own media records (per-item rights): item id -> record id
        self.bundle_of = {mid: self.record_by_key[k] for mid, m in self.media.items()
                          for k in [item_file_key(m.get("url"))] if k in self.record_by_key and self.record_by_key[k] != mid}
        self.narration = {}
        self.graph = []
        self.lines = {}          # key -> SpeakableSpecification node
        self.records = {}        # record id -> node
        self.rooms = {}          # room id -> node
        self.warnings = []
        self.unresolved = 0
        self.fallback, self.unused_why = progress_tables(self.repo / "assets-src/_queue/PROGRESS.md")
        cred = self.repo / "app/CREDITS.md"
        self.credits = cred.read_text(encoding="utf-8") if cred.exists() else ""
        self.shown_media = set()
        for rid, rec in tour["records"].items():
            if rec.get("files"):  # a link-only record shows no pixels
                self.shown_media.add(rid)
        for t in tour["tours"].values():
            for c in t["chapters"]:
                if c["place"].get("photo"):
                    self.shown_media.add(c["place"]["photo"]["mediaId"])

    # media references
    @staticmethod
    def _stated(ref, m, holder, holder_from, rights, rights_from):
        """Holder and rights: from SOURCES.md, else the media record, else said to be not stated."""
        for key, val, frm, store_key in (("ihh:holder", holder, holder_from, "credit"), ("ihh:rights", rights, rights_from, "rights_statement")):
            if val:
                ref[key], ref[key + "From"] = val, frm or "SOURCES.md row"
            elif m and m.get(store_key):
                ref[key], ref[key + "From"] = m[store_key], "media record"
            else:
                ref[key], ref[key + "From"] = NOT_STATED, None

    def media_ref(self, mid, holder=None, rights=None, role=None, extra=None, holder_from=None, rights_from=None):
        m = self.media.get(mid)
        ref = {"@id": f"ihh:{mid}", "ihh:mediaId": mid}
        if m:
            ref.update({"name": m["title"], "ihh:credit": m["credit"], "ihh:rightsStatement": m["rights_statement"],
                        "ihh:licenseClass": m["license_class"], "ihh:recordStatus": m["status"], "url": m["url"]})
        else:
            ref["ihh:recordStatus"] = "staged lead, not in the facts store" if mid.startswith("RL-") else "not in the facts store"
        self._stated(ref, m, holder, holder_from, rights, rights_from)
        if role:
            ref["ihh:role"] = role
        if mid in self.bundle_of:
            # an item of a bundled record with its own media record: its own licence class governs
            ref.update({"ihh:partOfRecord": {"@id": f"ihh:{self.bundle_of[mid]}"}, "ihh:rightsLevel": "item"})
        ref["ihh:pixelsShown"] = mid in self.shown_media
        if extra:
            ref.update(extra)
        return ref

    def textures_of(self, folder, prefix="models/"):
        """The folder's meta.json texture declaration for the files under `prefix`: ({media id: entry},
        {SOURCES.md row identifier: ruled entry})."""
        p = self.repo / "assets-src" / folder / "meta.json"
        meta = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
        media, items = {}, {}
        for e in meta.get("texturesFrom", []):
            if e.get("files") and not e["files"].startswith(prefix):
                continue
            if "ruling" in e:
                for it in e.get("items", []):
                    items[it] = e
            elif "media" in e:
                media[e["media"]] = e
        return media, items

    def texture_nodes(self, folder):
        media, items = self.textures_of(folder)
        out = [{"@id": f"ihh:{mid}", "ihh:mediaId": mid, "ihh:what": e.get("what"),
                **({"ihh:ownerRuling": e["ownerRuling"]} if e.get("ownerRuling") else {})} for mid, e in media.items()]
        for e in {id(e): e for e in items.values()}.values():
            out.append({"ihh:ruledItems": e.get("items", []), "ihh:inheritsRecord": {"@id": f"ihh:{e['inherits']}"},
                        "ihh:what": e.get("what"), "ihh:ownerRuling": TEXTURE_RULINGS[e["ruling"]]["ruling"]})
        return out

    def sources_of(self, folder, node_id, textured=False):
        """isBasedOn, consulted and third-party assets of a folder's SOURCES.md. With `textured`, the
        records (and ruled items) the folder's meta.json names as texture sources are marked as shown."""
        tex_media, tex_items = self.textures_of(folder) if textured else ({}, {})
        items, assets = parse_sources(self.repo / "assets-src" / folder / "SOURCES.md")
        based, consulted, seen = [], [], set()
        for n, it in enumerate(items):
            extra = {"ihh:sourcesSection": it["section"]}
            if it.get("roleReason"):
                extra["ihh:roleReason"] = it["roleReason"]
            if it["row"]:
                extra["ihh:sourcesRow"] = it["row"]
            if it["context"]:
                extra["ihh:context"] = it["context"]
            refs = []
            for mid in it["mediaIds"]:
                if (mid, it["role"]) in seen:
                    continue
                seen.add((mid, it["role"]))
                refs.append(self.media_ref(mid, it["holder"], it["rights"], it["role"], extra, it["holderFrom"], it["rightsFrom"]))
            if not it["mediaIds"]:
                ref = {"@id": f"{node_id}-source-{n + 1}", "ihh:mediaId": None, "ihh:identifier": it["identifier"],
                       "ihh:role": it["role"], "ihh:recordStatus": "no media record", "ihh:pixelsShown": False, **extra}
                # an item of a store record (its page is a page of that record): it carries the record's rights
                parent = next((self.record_by_key[k] for k in map(record_key, it.get("urls") or []) if k in self.record_by_key), None)
                pm = self.media.get(parent) if parent else None
                if pm:
                    ref.update({"ihh:partOfRecord": {"@id": f"ihh:{parent}"}, "ihh:licenseClass": pm["license_class"],
                                "ihh:recordStatus": f"an item of media record {parent}"})
                    if ref["ihh:role"] in ("basis", "material", "modelling-reference") and (pm["license_class"] not in CLEARED or parent in REFERENCE_ONLY):
                        ref["ihh:role"] = "modelling-reference"
                        own = ref.get("ihh:roleReason")
                        ref["ihh:roleReason"] = (f"an item of media record {parent}, whose licence class is {pm['license_class']} "
                                                 "(the row names no item record of its own, so the record's licence governs)"
                                                 + (f"; {own}" if own else ""))
                self._stated(ref, pm, it["holder"], it["holderFrom"], it["rights"], it["rightsFrom"])
                refs.append(ref)
            for r in refs:
                mid = r.get("ihh:mediaId")
                ruled = tex_items.get(r.get("ihh:identifier")) if not mid else None
                if mid in tex_media:
                    r["ihh:pixelsShown"] = True
                    r["ihh:texture"] = tex_media[mid].get("what") or True
                    if tex_media[mid].get("ownerRuling"):
                        r["ihh:ownerRuling"] = tex_media[mid]["ownerRuling"]
                elif ruled:
                    parent = self.media.get(ruled["inherits"]) or {}
                    r.update({"ihh:pixelsShown": True, "ihh:texture": ruled.get("what") or True,
                              "ihh:inheritsRecord": {"@id": f"ihh:{ruled['inherits']}"},
                              "ihh:licenseClass": parent.get("license_class"),
                              "ihh:recordStatus": f"an item covered by the record {ruled['inherits']} (owner ruling {ruled['ruling']})",
                              "ihh:ownerRuling": TEXTURE_RULINGS[ruled["ruling"]]["ruling"]})
                m = self.media.get(mid or "")
                if r["ihh:role"] in ("basis", "material") and m and (m["license_class"] not in CLEARED or r["ihh:mediaId"] in REFERENCE_ONLY):
                    r["ihh:role"] = "modelling-reference"
                    r["ihh:roleReason"] = ("ruled reference only: " + REFERENCE_ONLY[r["ihh:mediaId"]]) if r["ihh:mediaId"] in REFERENCE_ONLY \
                        else f"its media record's licence class is {m['license_class']}, not public domain, CC0 or CC BY"
                if r["ihh:role"] == "modelling-reference" and r["ihh:pixelsShown"]:
                    raise SystemExit(f"{folder}: {r.get('ihh:mediaId') or r.get('ihh:identifier')} is a modelling reference but the tour shows it or a room texture uses it")
                (based if r["ihh:role"] in ("basis", "modelling-reference", "material", "text-source") else consulted).append(r)
        return based, consulted, assets

    def folder_files(self, folder):
        out = {}
        for name, key in (("SOURCES.md", "ihh:sourcesFile"), ("INVENTORY.md", "ihh:inventoryFile"), ("DECISION.md", "ihh:decisionFile")):
            if (self.repo / "assets-src" / folder / name).exists():
                out[key] = f"assets-src/{folder}/{name}"
        return out

    def modelled_objects(self, folder, based, framable):
        """INVENTORY.md objects; shownBy names only what SOURCES/INVENTORY let us resolve (see seen_resolver)."""
        texts = [p.read_text(encoding="utf-8") for p in (self.repo / "assets-src" / folder / n for n in ("SOURCES.md", "INVENTORY.md")) if p.exists()]
        resolve = seen_resolver([b for b in based if b["ihh:role"] in ("basis", "modelling-reference", "material")], "\n".join(texts))
        parts = []
        for o in parse_inventory(self.repo / "assets-src" / folder / "INVENTORY.md"):
            shown = resolve(o["seenIn"] or "")
            self.unresolved += sum(1 for x in shown if x.get("ihh:unresolved"))
            parts.append({"@type": "CreativeWork", "name": o["name"], "ihh:nodes": o["nodes"],
                          "ihh:framable": any(n in framable for n in o["nodes"]), "ihh:seenIn": o["seenIn"],
                          "ihh:shownBy": shown, "ihh:inventoryNotes": o["notes"], "ihh:inventorySection": o["section"]})
        return parts

    def room_node(self, room_id):
        if room_id in self.rooms:
            return self.rooms[room_id]
        nid = f"ihh:room-{room_id}"
        based, consulted, assets = self.sources_of(room_id, nid, textured=True)
        models = self.repo / "app/public/models" / room_id
        nodes = json.loads((models / "nodes.json").read_text()) if (models / "nodes.json").exists() else {}
        framable = set(nodes.get("artifacts", []))
        node = {"@id": nid, "@type": "CreativeWork", "additionalType": "ihh:RoomRecreation", "ihh:roomId": room_id,
                "ihh:status": "shown", "isBasedOn": based, "ihh:consulted": consulted, "ihh:thirdPartyAssets": assets,
                "hasPart": self.modelled_objects(room_id, based, framable), "ihh:framableNodes": sorted(framable),
                "ihh:model": f"app/public/models/{room_id}/{room_id}.glb" if (models / f"{room_id}.glb").exists() else None,
                "ihh:glbLabel": glb_label(models / f"{room_id}.glb"), "ihh:shownIn": [],
                "ihh:texturesFrom": self.texture_nodes(room_id), **self.folder_files(room_id)}
        ch = credits_heading(self.credits, room_id)
        if ch:
            node["ihh:creditsSection"] = f"app/CREDITS.md, section \"{ch}\""
        if not based:
            self.warnings.append(f"{room_id}: no basis or reference item found in SOURCES.md")
        self.rooms[room_id] = node
        self.graph.append(node)
        return node

    # narration
    def narration_of(self, slug):
        if slug not in self.narration:
            p = self.repo / "assets-src/audio/narration" / f"{slug}.json"
            self.narration[slug] = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {"chapters": {}}
        return self.narration[slug]

    def line(self, key, use, optional=False):
        """The SpeakableSpecification for a narration key, with this use appended; None if optional and absent."""
        if key in self.lines:
            self.lines[key]["ihh:usedIn"].append(use)
            return {"@id": self.lines[key]["@id"]}
        slug, rest = key.split(":", 1)
        parts = rest.split(":")
        chapters = self.narration_of(slug)["chapters"]
        if parts[0] == "ch":
            src = chapters.get(parts[1], {}).get("opening")
            kind = "opening"
        else:
            src = next((l for l in chapters.get(parts[0], {}).get("lines", []) if l.get("cue") == parts[1]), None)
            kind = (src or {}).get("kind", "fact")
        if src is None:
            if optional:
                return None
            raise SystemExit(f"narration key {key} is not in assets-src/audio/narration/{slug}.json")
        cited = list(dict.fromkeys((src.get("fact_ids") or []) + (src.get("number_facts") or [])))
        node = {"@id": f"ihh:line-{key}", "@type": "SpeakableSpecification", "ihh:key": key, "ihh:lineKind": kind,
                "ihh:text": src["text"], "ihh:source": src.get("source"), "citation": [{"@id": f"ihh:{f}"} for f in cited],
                "ihh:claimStatus": {f: self.facts.get(f, "not in the facts store") for f in cited}, "ihh:usedIn": [use]}
        if src.get("speak"):
            node["ihh:speak"] = src["speak"]
        if src.get("media_ids"):
            # a record line (kind "record"): it narrates these records, quoting their cards ('source')
            node["ihh:narratesRecords"] = [{"@id": f"ihh:record-{m}"} for m in src["media_ids"]]
        if src.get("basis"):
            node["ihh:basis"] = src["basis"]
            m = re.match(r"assets-src/([^/]+)/", src["basis"])
            if m:
                node["about"] = {"@id": f"ihh:room-{m.group(1)}"}
        else:
            node["about"] = {"@id": f"ihh:person-{slug}"}
        for f, st in node["ihh:claimStatus"].items():
            if st != "verified":
                self.warnings.append(f"{key} cites {f} ({st})")
        self.lines[key] = node
        self.graph.append(node)
        return {"@id": node["@id"]}

    def clip(self, clip, use):
        if not clip:
            return []
        return [r for r in (self.line(k, use) for k in clip["keys"]) if r]

    # records
    def record(self, rid, use):
        rec = self.tour["records"][rid]
        if rid in self.records:
            if use:
                self.records[rid]["ihh:shownAt"].append(use)
            return {"@id": self.records[rid]["@id"]}
        node = {"@id": f"ihh:record-{rid}", "@type": "MediaObject", "ihh:mediaId": rid, "name": rec.get("title"),
                "ihh:kind": rec.get("kind"), "ihh:maker": rec.get("maker"), "ihh:date": rec.get("date"),
                "ihh:holder": rec.get("holder"), "ihh:catalogueId": rec.get("catalogueId"), "ihh:rights": rec.get("rights"),
                "creditText": rec.get("credit"), "url": rec.get("source"), "ihh:alt": rec.get("alt"),
                "ihh:files": rec.get("files", []), "ihh:linkOnly": bool(rec.get("linkOnly")),
                "ihh:lines": [{"ihh:label": l["label"], "ihh:text": l["text"], "citation": {"@id": f"ihh:{l['factId']}"}} for l in rec.get("lines", [])],
                "ihh:notes": [{"ihh:label": n["label"], "ihh:text": n["text"], "citation": {"@id": f"ihh:{n['factId']}"}} for n in rec.get("notes", [])],
                "ihh:shownAt": [use] if use else []}
        if STORE_ID.match(rid):
            node["ihh:mediaRecord"] = {"@id": f"ihh:{rid}"}
            m = self.media.get(rid)
            node["ihh:recordStatus"] = m["status"] if m else "not in the facts store"
            node["ihh:licenseClass"] = m["license_class"] if m else None
            if rec.get("files") and node["ihh:recordStatus"] != "verified":
                node["ihh:shownWhileNotVerified"] = True
                ruling = OWNER_RULED.get(rid)
                if ruling:
                    node["ihh:ownerRuling"] = ruling
                self.warnings.append(f"record {rid} is shown but its media record is {node['ihh:recordStatus']}"
                                     + (" (owner ruling: build_fact_index.OWNER_RULED)" if ruling else ""))
        self.records[rid] = node
        self.graph.append(node)
        node["ihh:clip"] = self.clip(rec.get("clip"), {"ihh:record": rid, "ihh:role": "record"})
        for lid in rec.get("letters", []):
            node.setdefault("hasPart", []).append(self.record(lid, None))
        for lk in rec.get("links", []):
            if lk.get("mediaId") in self.tour["records"]:
                node.setdefault("ihh:seeAlso", []).append(self.record(lk["mediaId"], None))
        for l in node["ihh:lines"] + node["ihh:notes"]:
            f = l["citation"]["@id"][4:]
            if self.facts.get(f) != "verified":
                self.warnings.append(f"record {rid} line cites {f} ({self.facts.get(f, 'not in the facts store')})")
        if rec.get("recreation"):
            self.recreation(rid, rec)
        return {"@id": node["@id"]}

    def recreation(self, rid, rec):
        folder = RECREATION_FOLDERS.get(rid)
        if not folder or not (self.repo / "assets-src" / folder).is_dir():
            raise SystemExit(f"recreation {rid} has no sources folder (RECREATION_FOLDERS)")
        nid = f"ihh:recreation-{rid}"
        based, consulted, assets = self.sources_of(folder, nid)
        self.graph.append({"@id": nid, "@type": "CreativeWork", "additionalType": "ihh:ObjectRecreation", "name": rec.get("title"),
                           "ihh:recreation": rec.get("recreation"), "ihh:recreationNote": rec.get("recreationNote"),
                           "ihh:record": {"@id": f"ihh:record-{rid}"}, "isBasedOn": based, "ihh:consulted": consulted,
                           "ihh:thirdPartyAssets": assets, "hasPart": self.modelled_objects(folder, based, set()),
                           "ihh:folder": f"assets-src/{folder}", **self.folder_files(folder)})

    # places
    def photo_folder(self, mid, slug):
        for d in sorted((self.repo / "assets-src").iterdir()):
            p = d / "DECISION.md"
            if d.name.startswith(slug + "-") and p.exists() and mid in p.read_text(encoding="utf-8"):
                return d.name
        return None

    def place(self, slug, c):
        p = c["place"]
        where = {"ihh:inductee": slug, "ihh:chapter": c["id"], "ihh:chapterTitle": c["title"], "ihh:placeLabel": p["label"]}
        reason = self.fallback.get(f"{slug}/{c['id']}")
        if p["tier"] == "room":
            node = self.room_node(p["room"]["id"])
            node["ihh:shownIn"].append(where)
            node.setdefault("name", p["room"]["title"])
            if p["room"].get("labelText"):
                node.setdefault("ihh:tourLabel", p["room"]["labelText"])
            return node["@id"]
        if p["tier"] == "photo":
            mid = p["photo"]["mediaId"]
            folder = self.photo_folder(mid, slug)
            node = {"@id": f"ihh:photo-room-{slug}-{c['id']}", "@type": "CreativeWork", "additionalType": "ihh:PhotoRoom",
                    "name": p["label"], "description": p["note"], "ihh:shownIn": [where],
                    "isBasedOn": [self.media_ref(mid, role="projected-photograph")], "ihh:fallbackReason": reason}
            if folder:
                node.update({"ihh:folder": f"assets-src/{folder}", **self.folder_files(folder)})
            if "ihh:sourcesFile" not in node:
                # a photo room whose sources table sits in a shared folder (e.g. <slug>-photo-rooms, <slug>-artifacts)
                for d in sorted((self.repo / "assets-src").iterdir()):
                    sp = d / "SOURCES.md"
                    if d.name.startswith(slug + "-") and sp.exists() and mid in sp.read_text(encoding="utf-8"):
                        node["ihh:sourcesFile"] = f"assets-src/{d.name}/SOURCES.md"
                        break
            self.graph.append(node)
            return node["@id"]
        panel = p.get("panel") or {}
        node = {"@id": f"ihh:gallery-{slug}-{c['id']}", "@type": "CreativeWork", "additionalType": "ihh:GalleryCase",
                "name": p["label"], "description": p["note"], "ihh:shownIn": [where], "ihh:fallbackReason": reason,
                "ihh:panel": {"ihh:eyebrow": panel.get("eyebrow"), "name": panel.get("title"),
                              "citation": [{"@id": f"ihh:{f}"} for f in panel.get("factIds", [])]} if panel else None,
                "isBasedOn": [self.media_ref(s["record"], role="record-shown") for s in c["stops"] if s["record"] and STORE_ID.match(s["record"])]}
        self.graph.append(node)
        return node["@id"]

    def chapter(self, slug, c):
        use = lambda role, **kw: {"ihh:inductee": slug, "ihh:chapter": c["id"], "ihh:role": role, **kw}
        place_id = self.place(slug, c)
        explicit = c["opening"]["keys"] != [f"{slug}:ch:{c['kind']}:opening"]
        opening = [r for r in (self.line(k, use("opening"), optional=not explicit) for k in c["opening"]["keys"]) if r]
        node = {"@id": f"ihh:chapter-{slug}-{c['id']}", "@type": "CreativeWork", "additionalType": "ihh:TourChapter",
                "name": c["title"], "ihh:kind": c["kind"], "ihh:year": c["year"], "about": {"@id": f"ihh:person-{slug}"},
                "citation": [{"@id": f"ihh:{f}"} for f in c["factIds"]], "ihh:place": {"@id": place_id}, "ihh:tier": c["place"]["tier"],
                "ihh:opening": opening, "ihh:narration": self.clip(c.get("narration"), use("chapter-narration"))}
        if c["place"].get("room"):
            node["ihh:arrival"] = self.clip(c["place"]["room"].get("narration"), use("room-arrival"))
            node["ihh:closing"] = self.clip(c["place"]["room"].get("closing"), use("room-closing"))
        elif c.get("closing"):
            node["ihh:closing"] = self.clip(c["closing"], use("chapter-closing"))
        if c.get("map"):
            mp = c["map"]
            node["ihh:map"] = {"name": mp["title"], "ihh:narration": self.clip(mp.get("narration"), use("map")),
                               "ihh:places": [{"name": pl["label"], "ihh:date": pl["date"], "ihh:note": pl["note"], "ihh:coordinateSource": pl["coord"],
                                               "citation": [{"@id": f"ihh:{f}"} for f in pl["factIds"]]} for pl in mp["places"]],
                               # round 9 (owner decision 2026-10-29): each line says whether a verified fact states its
                               # route (routed, with the journey's and the mode's facts) or only joins two verified places
                               # (un-routed, with the map's note)
                               "ihh:segments": [{"ihh:mode": sg["mode"], "ihh:label": sg["label"],
                                                 "ihh:routed": sg.get("routed", True),
                                                 **({"ihh:journeyCitation": [{"@id": f"ihh:{f}"} for f in sg.get("journeyFacts", [])],
                                                     "ihh:modeCitation": [{"@id": f"ihh:{f}"} for f in sg.get("modeFacts", [])]}
                                                    if sg.get("routed", True) else {"ihh:note": sg.get("note")}),
                                                 "citation": [{"@id": f"ihh:{f}"} for f in sg["factIds"]]} for sg in mp["segments"]],
                               # the place photographs pinned on the map: a verified place each, and the records shown there
                               "ihh:placePhotographs": [{"name": r["label"], "ihh:coordinateSource": r["coord"],
                                                         "citation": [{"@id": f"ihh:{f}"} for f in r["factIds"]],
                                                         "ihh:record": [self.record(mid, {"ihh:inductee": slug, "ihh:chapter": c["id"], "ihh:mapPlace": r["label"]})
                                                                        for mid in r["media"]]}
                                                        for r in mp.get("resources", [])]}
        stops = []
        for s in c["stops"]:
            st = {"ihh:stop": s["id"], "name": s["name"], "ihh:nodes": s["nodes"], "ihh:clip": self.clip(s.get("clip"), use("stop", **{"ihh:stop": s["id"]}))}
            if s["record"]:
                where = {"ihh:inductee": slug, "ihh:chapter": c["id"], "ihh:stop": s["id"]}
                if s.get("placeNote"):
                    where["ihh:placeNote"] = s["placeNote"]
                st["ihh:record"] = self.record(s["record"], where)
            for k in ("panel", "rail"):
                if isinstance(s.get(k), dict):
                    # a room's labelled panel stop (round 8): what it prints, and the facts it cites
                    pn = s[k]
                    st["ihh:panel"] = {"ihh:eyebrow": pn.get("eyebrow"), "name": pn.get("title"),
                                       "citation": [{"@id": f"ihh:{f}"} for f in pn.get("factIds", [])]}
                elif s.get(k):
                    st[f"ihh:{k}"] = True
            if s.get("prop"):
                st["ihh:prop"] = s["prop"]
            if s.get("placeNote"):
                st["ihh:placeNote"] = s["placeNote"]
            stops.append(st)
        node["ihh:stops"] = stops
        self.graph.append(node)

    def not_shown(self, room_id):
        folder = self.repo / "assets-src" / room_id
        if not folder.is_dir():
            raise SystemExit(f"built-not-shown room {room_id} has no folder assets-src/{room_id}")
        built = (self.repo / "app/public/models" / room_id / "nodes.json").exists()
        nid = f"ihh:room-{room_id}"
        based, consulted, assets = self.sources_of(room_id, nid, textured=built)
        status = decision_status(folder / "DECISION.md")
        why = self.unused_why.get(room_id)
        reason = " ".join(x for x in (status, f"Why: {why}" if why and not why.lower().startswith("see ") else None) if x)
        if not reason:
            raise SystemExit(f"{room_id}: no DECISION.md status and no PROGRESS.md reason")
        node = {"@id": nid, "@type": "CreativeWork", "additionalType": "ihh:RoomRecreation" if built else "ihh:NoRoomFallback",
                "ihh:roomId": room_id, "ihh:status": "built, not shown" if built else "fallback, no room built",
                "ihh:reason": reason, "ihh:progressNote": why, "isBasedOn": based, "ihh:consulted": consulted,
                "ihh:thirdPartyAssets": assets, **self.folder_files(room_id)}
        if built:
            node["ihh:texturesFrom"] = self.texture_nodes(room_id)
            node["ihh:model"] = f"app/public/models/{room_id}/{room_id}.glb"
            node["ihh:glbLabel"] = glb_label(self.repo / "app/public/models" / room_id / f"{room_id}.glb")
        ch = credits_heading(self.credits, room_id)
        if ch:
            node["ihh:creditsSection"] = f"app/CREDITS.md, section \"{ch}\""
        self.graph.append(node)

    def guide_lines(self, shown_rooms):
        p = self.repo / "app/src/shared/guide/lines.json"
        if not p.exists():
            return
        rooms = json.loads(p.read_text(encoding="utf-8")).get("tour", {}).get("rooms", {})

        def walk(v, path):
            if isinstance(v, str):
                yield path, v
            elif isinstance(v, list):
                for i, x in enumerate(v):
                    yield from walk(x, f"{path}.{i}")
            elif isinstance(v, dict):
                for k, x in v.items():
                    yield from walk(x, f"{path}.{k}")

        for room in shown_rooms:
            for path, text in walk(rooms.get(room, {}), room):
                self.graph.append({"@id": f"ihh:guide-{path}", "@type": "SpeakableSpecification", "ihh:lineKind": "wayfinding",
                                   "ihh:text": text, "citation": [], "about": {"@id": f"ihh:room-{room}"},
                                   "ihh:source": "app/src/shared/guide/lines.json, tour.rooms." + path.rsplit(".", 1)[0]})

    def research_files(self, slug):
        d = self.facts_root / "data/inductees" / slug
        return [n for n in ("TOUR-RESEARCH", "ARTIFACTS", "ROOMS", "CONFLICTS") if (d / f"{n}.md").exists()]

    def run(self, date):
        ratio = {}
        for slug, t in self.tour["tours"].items():
            for c in t["chapters"]:
                self.chapter(slug, c)
            tiers = [c["place"]["tier"] for c in t["chapters"]]
            ratio[slug] = {"name": t["name"], "chapters": len(tiers), "room": tiers.count("room"), "photo": tiers.count("photo"),
                           "gallery": tiers.count("gallery"), "researchFiles": self.research_files(slug)}
        self.guide_lines(list(self.rooms))
        for r in self.built_not_shown:
            self.not_shown(r)
        models = self.repo / "app/public/models"
        if models.is_dir():
            for d in sorted(models.iterdir()):
                if (d / "nodes.json").exists() and d.name not in self.rooms and d.name not in self.built_not_shown:
                    self.warnings.append(f"app/public/models/{d.name} is built but neither shown nor listed as built, not shown")
        g = self.graph
        kinds = lambda t: [n for n in g if n.get("additionalType") == t]
        spoken = [n for n in g if n["@type"] == "SpeakableSpecification" and n["ihh:lineKind"] != "wayfinding"]
        based = [b for n in g if n.get("additionalType") in ("ihh:RoomRecreation", "ihh:ObjectRecreation", "ihh:PhotoRoom")
                 for b in n.get("isBasedOn", [])]
        counts = {
            "chapters": len(kinds("ihh:TourChapter")),
            "rooms": len([n for n in kinds("ihh:RoomRecreation") if n["ihh:status"] == "shown"]),
            "photoRooms": len(kinds("ihh:PhotoRoom")),
            "galleryCases": len(kinds("ihh:GalleryCase")),
            "recreations": len(kinds("ihh:ObjectRecreation")),
            "builtNotShown": len([n for n in g if n.get("ihh:status") == "built, not shown"]),
            "noRoomFallbacks": len(kinds("ihh:NoRoomFallback")),
            "spokenLines": len(spoken),
            "factLines": len([n for n in spoken if n["ihh:lineKind"] == "fact"]),
            "openings": len([n for n in spoken if n["ihh:lineKind"] == "opening"]),
            "roomNotes": len([n for n in spoken if n["ihh:lineKind"] == "room-note"]),
            "recordLines": len([n for n in spoken if n["ihh:lineKind"] == "record"]),
            "otherLines": len([n for n in spoken if n["ihh:lineKind"] not in ("fact", "opening", "room-note", "record")]),
            "wayfindingLines": len([n for n in g if n.get("ihh:lineKind") == "wayfinding"]),
            "factsCited": len({c["@id"] for n in spoken for c in n["citation"]}),
            "viewerRecords": len(self.records),
            "linkOnlyRecords": len([n for n in self.records.values() if n["ihh:linkOnly"]]),
            "basisItems": len({b["@id"] for b in based if b.get("ihh:role") in ("basis", "material", "projected-photograph", "text-source")}),
            "modellingReferences": len({b["@id"] for b in based if b.get("ihh:role") == "modelling-reference"}),
            "shownByUnresolved": self.unresolved,
            "holdersNotStated": len({b["@id"] for b in based if b.get("ihh:holder") == NOT_STATED}),
            "rightsNotStated": len({b["@id"] for b in based if b.get("ihh:rights") == NOT_STATED}),
        }
        summary = {"@id": "ihh:site-provenance", "@type": "Dataset", "name": "Turning-points museum: site provenance",
                   "description": "What the tour shows and says, and what each part rests on: rooms, photo rooms, gallery cases, "
                   "recreations, spoken lines and the records a visitor can open. Fact and media ids are the @ids of provenance.jsonld.",
                   "dateModified": date, "ihh:counts": counts, "ihh:ratio": ratio, "ihh:rules": RULES,
                   "ihh:inputs": ["app/src/tour/data/tour-use.generated.json (from app/src/tour/data/<slug>.js, *-artifacts.js)",
                                  "assets-src/<room>/SOURCES.md, INVENTORY.md, DECISION.md", "app/public/models/<room>/nodes.json",
                                  "assets-src/audio/narration/<slug>.json", "app/src/shared/guide/lines.json",
                                  "assets-src/_queue/PROGRESS.md", "app/CREDITS.md", "data/inductees/<slug>/media.jsonl, facts.jsonl"],
                   "ihh:warnings": sorted(set(self.warnings))}
        return {"@context": CONTEXT, "@graph": [summary] + g}


def build(repo, facts_root, tour, built_not_shown=BUILT_NOT_SHOWN, date=None):
    return Builder(repo, facts_root, tour, built_not_shown).run(date or datetime.date.today().isoformat())


# ---------- ROOMS-INDEX.md ----------

def write_index(doc):
    g = {n["@id"]: n for n in doc["@graph"]}
    summary = g["ihh:site-provenance"]
    c = summary["ihh:counts"]
    files = lambda n: " · ".join(f"[{k[4:-4].upper()}](../../{n[k]})" for k in ("ihh:sourcesFile", "ihh:inventoryFile", "ihh:decisionFile") if n.get(k))
    out = ["# Rooms index", "",
           "A plain-language map of where each part of the tour comes from. The research files are in this repository "
           "(`data/inductees/<slug>/`); the room folders (`assets-src/<room>/`) are in the app repository (branch revamp/mockups), "
           "linked here by their path from the repository root. Those links resolve only in the app repository on branch "
           "revamp/mockups (where data/ and assets-src/ sit side by side); in this repository assets-src/ is not present. "
           "Machine-readable: `site-provenance.jsonld`.", "",
           f"{c['chapters']} chapters: {c['rooms']} recreated rooms, {c['photoRooms']} photo rooms, {c['galleryCases']} gallery cases. "
           f"{c['recreations']} labelled object recreations. {c['spokenLines']} spoken lines tied to facts or room inventories, "
           f"{c['wayfindingLines']} wayfinding lines, {c['viewerRecords']} records a visitor can open.", ""]
    for slug, r in summary["ihh:ratio"].items():
        links = " · ".join(f"[{n}](../inductees/{slug}/{n}.md)" for n in r["researchFiles"]) or "no research files"
        out += [f"## {r['name']}", "", f"Research: {links}", "",
                "| Chapter | Place | Shown as | Room files |", "|---|---|---|---|"]
        for n in doc["@graph"]:
            if n.get("additionalType") != "ihh:TourChapter" or not n["@id"].startswith(f"ihh:chapter-{slug}-"):
                continue
            place = g[n["ihh:place"]["@id"]]
            label = next((w["ihh:placeLabel"] for w in place.get("ihh:shownIn", []) if w["ihh:chapter"] == n["@id"].split("-", 2)[2] and w["ihh:inductee"] == slug), place.get("name"))
            tier = {"ihh:RoomRecreation": f"recreated room `{place.get('ihh:roomId')}`", "ihh:PhotoRoom": "photo room",
                    "ihh:GalleryCase": "gallery case"}[place["additionalType"]]
            if place.get("ihh:fallbackReason"):
                tier += f" (why: {place['ihh:fallbackReason']})"
            out.append(f"| {n['name']} ({n['ihh:year']}) | {label} | {tier} | {files(place) or '-'} |")
        out.append("")
    out += ["## Labelled object recreations", "", "| Recreation | Label | Files |", "|---|---|---|"]
    for n in doc["@graph"]:
        if n.get("additionalType") == "ihh:ObjectRecreation":
            out.append(f"| {n['name']} | {n['ihh:recreation']} | {files(n) or '-'} |")
    out += ["", "## Built, not shown", "", "Rooms that exist but no chapter uses, and the fallback where no room was built.", "",
            "| Room | Status | Reason | Files |", "|---|---|---|---|"]
    for n in doc["@graph"]:
        if n.get("ihh:status") in ("built, not shown", "fallback, no room built"):
            out.append(f"| `{n['ihh:roomId']}` | {n['ihh:status']} | {n['ihh:reason']} | {files(n) or '-'} |")
    out += ["", "## Modelling references", "",
            "Photographs used only to model from. Their pixels are not shown in the tour and are not in this package.", "",
            "| Media | Holder | Rights | Used by |", "|---|---|---|---|"]
    refs = {}
    for n in doc["@graph"]:
        for b in n.get("isBasedOn", []) if n.get("additionalType") in ("ihh:RoomRecreation", "ihh:ObjectRecreation") else []:
            if b.get("ihh:role") == "modelling-reference":
                key = b.get("ihh:mediaId") or b.get("ihh:identifier")
                e = refs.setdefault(key, {"b": b, "by": []})
                e["by"].append(n.get("ihh:roomId") or n["name"])
    for key, e in refs.items():
        b = e["b"]
        rights = b.get("ihh:rights") or "not stated in SOURCES.md"
        if b.get("ihh:licenseClass") and f"({b['ihh:licenseClass']})" not in rights:
            rights += f" ({b['ihh:licenseClass']})"
        holder = (b.get("ihh:holder") or "-").replace("|", "/")
        out.append(f"| {key.replace('|', '/')[:120]} | {holder[:160]} | {rights.replace('|', '/')[:400]} | {', '.join(sorted(set(e['by'])))} |")
    out.append("")
    return "\n".join(out)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    repo = Path(__file__).resolve().parents[2]
    ap.add_argument("--facts", default=str(repo))
    ap.add_argument("--tour", default=str(repo / "app/src/tour/data/tour-use.generated.json"))
    a = ap.parse_args(argv)
    facts = Path(a.facts).resolve()
    if not (facts / "data/inductees").is_dir():
        raise SystemExit(f"facts store not found at {facts}")
    doc = build(repo, facts, json.loads(Path(a.tour).read_text(encoding="utf-8")))
    out = facts / "data/export"
    (out / "site-provenance.jsonld").write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    (out / "ROOMS-INDEX.md").write_text(write_index(doc), encoding="utf-8")
    summary = doc["@graph"][0]
    print(f"wrote {out / 'site-provenance.jsonld'} and ROOMS-INDEX.md: {json.dumps(summary['ihh:counts'])}")
    for w in summary["ihh:warnings"]:
        print(f"warning: {w}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
