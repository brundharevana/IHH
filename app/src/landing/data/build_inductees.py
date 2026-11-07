#!/usr/bin/env python3
"""Build app/src/landing/data/inductees.json from the verified-fact store.

Story points are taken ONLY from facts whose status is "verified"; the claim text is copied
verbatim and the first evidence source is kept for the "Source" link. A chosen fact id that is
missing or not verified becomes a visible "pending verification" slot, never invented text.

Each story point also gets an "artifact": the object shown on the portrait edge in place of a
numbered dot. It is a thumbnail of a media record that is (a) linked to the point's fact (shares an
evidence source), (b) verified, (c) public-domain / CC0 / CC BY, and (d) already fetched from the
holder into site/public/media/ by tools/fetch_media.py. A linked, cleared record that has not been
fetched yet shows its object-type icon and says so; a point with no such record shows a neutral
"source record" icon. Nothing is drawn or generated to stand in for a real object.

Inductees whose tour is in the chapter shape (app/src/tour/data/<slug>.js `chapters`) get one point per
turning-point chapter instead: the chapter id, kind, title (as the label), year, its first fact (claim and
source, verbatim) and, as the object, the first verified, embeddable, not link-only media record among the
chapter's stops, else the neutral kind icon. Chapters are exported by app/scripts/export_chapters.mjs to
app/src/tour/data/chapters.generated.json (run that first). Inductees still on `steps` keep PICKS.

Run from the repo root:  ~/.pyenv/shims/python app/src/landing/data/build_inductees.py
(Pillow is needed for the thumbnails: app/public/landing/artifacts/<media id>.webp)
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[4]
OUT = pathlib.Path(__file__).with_name("inductees.json")
MEDIA_DIR = ROOT / "site" / "public" / "media"
THUMBS = ROOT / "app" / "public" / "landing" / "artifacts"
TOUR_DATA = ROOT / "app" / "src" / "tour" / "data"
CHAPTERS_JSON = TOUR_DATA / "chapters.generated.json"
FACT_INDEX = TOUR_DATA / "facts.generated.json"
LINK_ONLY_JSON = TOUR_DATA / "link-only.generated.json"
CHAPTER_KINDS = ("birth", "education", "leaving", "arriving", "first-work", "citizen", "big-work", "history", "honoured", "legacy")
CLEARED = ("public-domain", "cc0", "cc-by")
DOC_WORDS = ("letter", "declaration", "petition", "patent", "certificate", "form", "card", "rules")

# Four story points per inductee, in reading order around the portrait.
PICKS = {
    "einstein": ["EIN-F-0005", ("EIN-F-0114", "San Diego · 1930"), ("EIN-F-0087", "112 Mercer Street"), "EIN-F-0051"],
    "lamarr": ["LAM-F-0012", "LAM-F-0086", "LAM-F-0084", "LAM-F-0006"],
    "muir": ["MUI-F-0082", ("MUI-F-0090", "Accident · 1867"), "MUI-F-0006", "MUI-F-0086"],
    "albright": ["ALB-F-0041", "ALB-F-0175", "ALB-F-0026", "ALB-F-0023"],
    "naismith": ["NAI-F-0035", ("NAI-F-0067", "Basketball · 1891"), ("NAI-F-0090", "13 rules"), ("NAI-F-0021", "Kansas · 1898")],
}

# Portraits: only media records that are verified AND cleared (public domain, CC0 or CC BY, CLEARED) AND whose
# portrait file is in app/public (a byte copy of the holder's file, or a crop of it made by
# assets-src/landing-portraits/make_portraits.py; app/scripts/image_sources.py records which). A cropped portrait says
# so (`changes`; CC BY asks for changes to be indicated). Everyone else gets the labelled silhouette.
PUBLIC = ROOT / "app" / "public"
CROPPED = "Cropped and resized from the holder's file."
PORTRAITS = {
    "einstein": {"media_id": "EIN-M-0006", "file": "landing/portraits/einstein.jpg"},
    "lamarr": {"media_id": "LAM-M-0013", "file": "landing/portraits/lamarr.jpg", "changes": CROPPED},
    "muir": {"media_id": "MUI-M-0011", "file": "landing/portraits/muir.jpg", "changes": CROPPED},
    "albright": {"media_id": "ALB-M-0014", "file": "landing/portraits/albright.jpg", "changes": CROPPED},
}

# A Creative Commons portrait needs visible attribution: the licence's name and a link to it, shown on the credit line
# (not only in a hover title). Name and version come from the holder's own rights words; a CC record whose words
# give no version fails the build rather than guess one.
CC_PATHS = {"cc-by": ("CC BY", "by"), "cc-by-sa": ("CC BY-SA", "by-sa")}


def cc_licence(m):
    """{name, url} for a CC BY / BY-SA record (e.g. "CC BY 4.0"), else None."""
    if m["license_class"] not in CC_PATHS:
        return None
    name, path = CC_PATHS[m["license_class"]]
    v = re.search(r"\b(\d\.\d)\b", m.get("rights_statement") or "")
    assert v, f"{m['id']}: CC licence version not stated in the holder's rights words"
    return {"name": f"{name} {v.group(1)}", "url": f"https://creativecommons.org/licenses/{path}/{v.group(1)}/"}

CATEGORY_LABEL = {
    "birth": "Birth", "death": "Later life", "immigration": "Arrival", "citizenship": "Citizenship",
    "career": "Work", "work": "Work", "invention": "Invention", "award": "Recognition",
    "family": "Family", "identity": "Name", "other": "Record",
}


def label_for(fact):
    """Short heading: the category word plus the first year that appears in the claim text itself."""
    word = CATEGORY_LABEL.get(fact["category"], "Record")
    year = re.search(r"\b(1[89]\d\d|20\d\d)\b", fact["claim"])
    return f"{word} \u00b7 {year.group(1)}" if year else word


def checked_label(fact, label):
    """A hand-picked label may only use words that appear in the fact's own claim (no new content)."""
    claim = fact["claim"].lower()
    for word in re.findall(r"[\w']+", label):
        assert word.lower() in claim, f"{fact['id']}: label word {word!r} not in claim"
    return label


def kind_of(media):
    """Object type from the record itself: a document if its title names one, else a photograph."""
    title = media["title"].lower()
    if media.get("media_type") != "image":
        return "object"
    return "document" if any(w in title for w in DOC_WORDS) else "photograph"


# Records whose first pages are not the object's face: the page the thumbnail shows instead (the
# same page as the viewer record's `thumb`, app/src/tour/data/naismith-artifacts.js).
COVER_PAGE = {"NAI-M-0003": 3}  # Basket ball. (1894): pages 1-2 are blank flyleaves


def thumb_source(media_id, media_dir=MEDIA_DIR):
    """The fetched file a record's thumbnail is made from: its single image, else its cover page
    (COVER_PAGE) or its first page on file (a case file fetched from page 5 on is shown by page 5);
    None if nothing is fetched."""
    single = media_dir / f"{media_id}.jpg"
    if single.exists():
        return single
    cover = media_dir / f"{media_id}-p{COVER_PAGE.get(media_id, 0)}.jpg"
    if media_id in COVER_PAGE and cover.exists():
        return cover
    pages = [(int(m.group(1)), p) for p in media_dir.glob(f"{media_id}-p*.jpg") if (m := re.fullmatch(rf"{re.escape(media_id)}-p(\d+)\.jpg", p.name))]
    return min(pages)[1] if pages else None


def thumb(media_id):
    """Resize the holder's file (already fetched) to a 480 px thumbnail; None if not fetched."""
    out = THUMBS / f"{media_id}.webp"
    # a multi-page record (letters, certificates) is shown by its first page on file
    src = thumb_source(media_id)
    if src is None:
        # the holder's file is not in this checkout: keep a thumbnail made earlier, if any
        return f"landing/artifacts/{media_id}.webp" if out.exists() else None
    from PIL import Image

    THUMBS.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGB")
    im.thumbnail((480, 480))
    im.save(out, "WEBP", quality=82, method=6)
    return f"landing/artifacts/{media_id}.webp"


# A catalogue's name heading with life dates inside a credit line ("Muir, John, 1838-1914, "): the dates
# are the holder's authority heading, not verified facts (a death year is never a verified fact here),
# so the visitor-facing credit drops the heading; provenance files keep the credit verbatim.
NAME_HEADING = re.compile(r"\b[A-Z][\w'-]+, [A-Z][\w.' -]+?, \d{4}-\d{4}, ")


def display_credit(credit):
    """The credit a visitor sees: the holder's credit without a name heading's life dates."""
    return NAME_HEADING.sub("", credit or "")


def artifact_from_media(m, sources):
    """The museum object for one verified, cleared media record."""
    holder = next((sources[i].get("institution") for i in m.get("source_ids", []) if i in sources and sources[i].get("institution")), None)
    return {
        "kind": kind_of(m),
        "media": {
            "id": m["id"], "title": m["title"], "thumb": thumb(m["id"]),
            "alt": m.get("alt_text") or m["title"], "credit": display_credit(m["credit"]),
            "rights": m["rights_statement"], "license": m["license_class"], "url": m["url"], "holder": holder,
        },
    }


def artifact_for(fact, media, sources, link_only=frozenset()):
    """The museum object for a story point: linked, verified, cleared media only."""
    src_ids = {e["source_id"] for e in fact["evidence"]}
    linked = [m for m in media.values()
              if m.get("status") == "verified" and m.get("license_class") in CLEARED and m["id"] not in link_only
              and src_ids & set(m.get("source_ids", []))]
    # prefer a record whose file is already fetched, then public domain over CC BY
    linked.sort(key=lambda m: (not (MEDIA_DIR / f"{m['id']}.jpg").exists(), m["license_class"] != "public-domain", m["id"]))
    if not linked:
        return {"kind": "record", "media": None}
    return artifact_from_media(linked[0], sources)


def points_for(chapters, media, link_only):
    """Landing points for an inductee's turning-point chapters (up to ten, in tour order).

    A chapter of an unknown kind makes no point. `thumb` is the chapter's thumbnail media id only when
    that record is embeddable and not link-only; otherwise None (the landing draws a neutral icon).
    `media` maps media id -> {"embeddable": bool, "record_kind"?} (facts.generated.json + media.jsonl)."""
    pts = []
    for c in chapters:
        if c["kind"] not in CHAPTER_KINDS:
            continue
        t = c.get("thumbMediaId")
        rec = media.get(t, {})
        # a basis photo shows a place or occasion, not the inductee's own object: never a landing object
        ok = t and t not in link_only and rec.get("embeddable") is True and rec.get("record_kind") != "basis-photo"
        pts.append({"id": c["id"], "kind": c["kind"], "label": c["title"], "year": c.get("year"),
                    "factIds": c.get("factIds", []), "thumb": t if ok else None})
    return pts[:10]


def chapter_points(chapters, facts, sources, media_records, index_media, link_only):
    """points_for, then each point's first verified fact (claim, source) and its media object."""
    out = []
    for p in points_for(chapters, index_media, link_only):
        f = next((facts[i] for i in p["factIds"] if facts.get(i, {}).get("status") == "verified"), None)
        assert f, f"chapter {p['id']}: no verified fact"
        src = sources[f["evidence"][0]["source_id"]]
        art = {"kind": "record", "media": None}
        m = media_records.get(p["thumb"]) if p["thumb"] else None
        # the landing shows a verified, cleared record only: a record the tour shows by the owner's
        # ruling (disputed in the store, build_fact_index.py OWNER_RULED) gets the neutral icon here
        if m and m.get("status") == "verified" and m.get("license_class") in CLEARED:
            art = artifact_from_media(m, sources)
        out.append({
            "id": p["id"], "kind": p["kind"], "label": p["label"], "year": p["year"], "factId": f["id"],
            "claim": f["claim"],
            "source": {"id": src["id"], "title": src["title"], "institution": src.get("institution"), "url": src["url"]},
            "artifact": art,
        })
    return out


def load(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def link_only_ids(path=LINK_ONLY_JSON):
    """LINK_ONLY (tour/data/artifacts.js, exported by app/scripts/export_chapters.mjs): rights unknown,
    never shown as an image. Raises when the list is missing or empty: never fails open."""
    if not path.exists():
        raise SystemExit(f"{path} is missing: run `npx vite-node scripts/export_chapters.mjs` in app/")
    ids = set(json.loads(path.read_text()))
    if not ids:
        raise SystemExit(f"{path} is empty: LINK_ONLY must list the link-only media")
    return ids


def main():
    chapters = json.loads(CHAPTERS_JSON.read_text()) if CHAPTERS_JSON.exists() else {}
    index_media = json.loads(FACT_INDEX.read_text())["media"]
    link_only = link_only_ids()
    out = []
    for slug, picks in PICKS.items():
        base = ROOT / "data" / "inductees" / slug
        meta = json.loads((base / "inductee.json").read_text())
        facts = {f["id"]: f for f in load(base / "facts.jsonl")}
        sources = {s["id"]: s for s in load(base / "sources.jsonl")}
        media = {m["id"]: m for m in load(base / "media.jsonl")}
        kinds = {**index_media, **{i: {**index_media.get(i, {}), "record_kind": m.get("record_kind")} for i, m in media.items()}}
        points = []
        if slug in chapters:
            points = chapter_points(chapters[slug], facts, sources, media, kinds, link_only)
            picks = []
        for pick in picks:
            fid, override = pick if isinstance(pick, tuple) else (pick, None)
            f = facts.get(fid)
            if not f or f.get("status") != "verified":
                points.append({"id": fid, "pending": True})
                continue
            src = sources[f["evidence"][0]["source_id"]]
            points.append({
                "id": fid,
                "label": checked_label(f, override) if override else label_for(f),
                "claim": f["claim"],
                "source": {"id": src["id"], "title": src["title"],
                           "institution": src.get("institution"), "url": src["url"]},
                "artifact": artifact_for(f, media, sources, link_only),
            })
        while slug not in chapters and len(points) < 4:
            points.append({"id": f"pending-{len(points)}", "pending": True})
        portrait = None
        if slug in PORTRAITS:
            p = PORTRAITS[slug]
            m = media[p["media_id"]]
            assert m["status"] == "verified" and m["license_class"] in CLEARED, f"{m['id']}: not verified and cleared"
            assert m["id"] not in link_only, f"{m['id']}: link-only"
            assert m.get("rights_statement") and m.get("credit"), f"{m['id']}: no holder rights wording or credit"
            assert (PUBLIC / p["file"]).is_file(), f"{p['file']}: portrait file missing"
            portrait = {"src": p["file"], "media_id": m["id"], "alt": m.get("alt_text") or m["title"],
                        "credit": display_credit(m["credit"]), "rights": m["rights_statement"], "url": m["url"]}
            if p.get("changes"):
                portrait["changes"] = p["changes"]
            lic = cc_licence(m)
            if lic:
                portrait["licence"] = lic
        out.append({"slug": slug, "name": meta["name"],
                    "ihh_url": meta.get("ihh_url"), "portrait": portrait, "points": points})
    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {OUT} ({len(out)} inductees)")


if __name__ == "__main__":
    main()
