"""Builders for a clearly fake inductee used across the test suite.

Everything here is invented test data: the person ("Test Person"), the places
("Port of Example", "Example College"), the institutions, and every URL, which
all live under example.org or example.net. None of it describes a real person or record.

`world()` returns a fresh, internally consistent package in which every fact and
media item is verified. Tests mutate a copy and assert which rule fires.
`write_world()` lays the package out on disk in the section 2 layout.
"""

import copy
import hashlib
import json
from pathlib import Path

from ihh import authority, fetchplan, gates, judged, normalize, records

SLUG = "testperson"
CODE = "TST"
TODAY = "2026-10-08"
RUN = "run-test-1"

SNAPSHOT_TEXT = {
    "TST-S-0001": (
        "Petition for Naturalization\n"
        "Name: Testa Q. Persona\n"
        "Arrived at the Port of Example on 1941-06-10 aboard the SS Sample with thirteen trunks.\n"
        "Rights: No known copyright restrictions.\n"
        "Item: typed arrival record.\n"
    ),
    "TST-S-0002": (
        "Test Person (born Testa Q. Persona) arrived in the United States in June 1941 "
        "and taught at Example College.\n"
    ),
    "TST-S-0003": (
        "Test Person, born Testa Q. Persona, arrived in 1941 and taught at Example College "
        "for 13 years.\n"
    ),
    "TST-S-0004": (
        "Dear colleague,\n"
        "Example sentences are the best teachers.\n"
        "Yours, Test Person\n"
    ),
}

# The test authority registry (data/registry/institutions.json in a real data folder):
# invented holders on example.org / example.net hosts.
REGISTRY = {
    "entries": [
        {"id": "example-national-archives", "name": "Example National Archives", "kind": "archive",
         "domains": [], "hosts": ["archives.example.org"], "may_be": ["primary", "institutional"],
         "primary_paths": ["archives.example.org/id/"], "verified_on": TODAY, "note": "Test holder."},
        {"id": "example-university-library", "name": "Example University Library", "kind": "university",
         "domains": [], "hosts": ["library.example.net"], "may_be": ["primary", "institutional"],
         "verified_on": TODAY, "note": "Test holder."},
        {"id": "example-historical-society", "name": "Example Historical Society", "kind": "museum",
         "domains": [], "hosts": ["society.example.org"], "may_be": ["primary", "institutional"],
         "verified_on": TODAY, "note": "Test holder."},
        {"id": "example-commons", "name": "Example Commons", "kind": "publisher-aggregator",
         "domains": [], "hosts": ["commons.example.org"], "may_be": ["secondary"], "media_only": True,
         "verified_on": TODAY, "note": "Test media repository."},
    ]
}

METHODS = {"TST-S-0001": "api", "TST-S-0002": "browser", "TST-S-0003": "http", "TST-S-0004": "http"}


def sha(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def source(sid, title, institution, stype, url, **extra):
    text = SNAPSHOT_TEXT.get(sid)
    rec = {
        "id": sid,
        "title": title,
        "institution": institution,
        "type": stype,
        "url": url,
        "fetch_url": None,
        "catalog_id": None,
        "published": None,
        "accessed": TODAY,
        "snapshot": f"snapshots/{sid}.txt" if text is not None else None,
        "snapshot_sha256": sha(text) if text is not None else None,
        "fetch_method": METHODS.get(sid) if text is not None else None,
        "archive_url": None,
        "notes": "",
    }
    rec.update(extra)
    return rec


def adversary(**overrides):
    rec = {
        "model": "test:adversary",
        "run_id": RUN,
        "date": TODAY,
        "verdict": "supported",
        "quote_in_snapshot": True,
        "quote_in_live": "yes",
        "entailed": True,
        "adds_information": False,
        "atomic": True,
        "source_type_ok": True,
        "rationale": "Test rationale.",
    }
    rec.update(overrides)
    return rec


def review():
    return {"state": "pending", "reviewer": None, "date": None, "note": ""}


def fact(fid, claim, category, evidence, **extra):
    rec = {
        "id": fid,
        "inductee": SLUG,
        "claim": claim,
        "category": category,
        "event_date": None,
        "place": None,
        "evidence": [{"source_id": s, "quote": q, "locator": "line 1"} for s, q in evidence],
        "primary_document": False,
        "is_direct_quote": False,
        "extractor": {"model": "test:extractor", "run_id": RUN, "date": TODAY, "verdict": "supported"},
        "adversary": adversary(),
        "status": "verified",
        "verified_claim_sha256": normalize.claim_sha256(claim),
        "used_in": [],
        "review": review(),
        "notes": "",
    }
    rec.update(extra)
    if "verified_claim_sha256" not in extra:
        rec["verified_claim_sha256"] = normalize.claim_sha256(rec["claim"]) if rec["status"] == "verified" else None
    return rec


def world():
    """A fresh, fully verified fake package (deep-copied each call)."""
    inductee = {
        "slug": SLUG,
        "code": CODE,
        "name": "Test Person",
        "aliases": ["Testa Q. Persona"],
        "authority": {"loc_naf": "https://authorities.example.org/names/test-person"},
        "birth_year": 1900,
        "death_year": 1980,
        "ihh_url": "https://ihh.example.org/inductees/test-person/",
        "runs": [{"run_id": RUN, "date": TODAY, "adversary": "test", "notes": ""}],
    }
    sources = [
        source("TST-S-0001", "Petition for Naturalization for Testa Q. Persona", "Example National Archives",
               "primary", "https://archives.example.org/id/1",
               fetch_url="https://archives.example.org/id/1?format=json", catalog_id="TEST-1"),
        source("TST-S-0002", "Test Person biography", "Example University Library", "institutional",
               "https://library.example.net/test-person"),
        source("TST-S-0003", "Example News profile of Test Person", "Example News", "secondary",
               "https://news.example.org/test-person"),
        source("TST-S-0004", "Letter from Test Person", "Example National Archives", "primary",
               "https://archives.example.org/id/4"),
    ]
    facts = [
        fact("TST-F-0001", "Test Person was born Testa Q. Persona.", "identity",
             [("TST-S-0002", "Test Person (born Testa Q. Persona)"),
              ("TST-S-0003", "Test Person, born Testa Q. Persona")]),
        fact("TST-F-0002", "Testa Q. Persona arrived at the Port of Example on June 10, 1941.", "immigration",
             [("TST-S-0001", "Arrived at the Port of Example on 1941-06-10")],
             primary_document=True, event_date="1941-06-10", place="Port of Example",
             adversary=adversary(quote_in_live="unreachable"),
             used_in=["profile:summary:0", "profile:timeline:0", "profile:artifacts:0", "profile:avatar_lines:1"]),
        fact("TST-F-0003", "Test Person taught at Example College.", "career",
             [("TST-S-0002", "taught at Example College"), ("TST-S-0003", "taught at Example College")],
             used_in=["profile:sections:work:0"]),
        fact("TST-F-0004", "Example sentences are the best teachers.", "quote",
             [("TST-S-0004", "Example sentences are the best teachers.")],
             primary_document=True, is_direct_quote=True,
             adversary=adversary(quote_in_live="unreachable"),
             used_in=["profile:avatar_lines:0"]),
    ]
    media = [
        {
            "id": "TST-M-0001",
            "title": "Arrival record of Testa Q. Persona",
            "media_type": "document",
            "source_ids": ["TST-S-0001"],
            "url": "https://archives.example.org/media/1.jpg",
            "rights_statement": "No known copyright restrictions.",
            "rights_url": "https://archives.example.org/id/1",
            "license_class": "public-domain",
            "credit": "Example National Archives",
            "alt_text": "Typed arrival record (TST-F-0002).",
            "reconstruction": False,
            "reconstruction_basis": [],
            "adversary": adversary(quote_in_live="unreachable"),
            "status": "verified",
            "verified_claim_sha256": None,
            "review": review(),
        }
    ]
    media[0]["verified_claim_sha256"] = gates.media_lock_sha256(media[0])
    searches = [
        {"id": "TST-Q-0001", "date": TODAY, "family": "nara", "tool": "Example catalog API",
         "query": "test person", "results": 1, "produced": ["TST-S-0001", "TST-F-0002"],
         "agent": "test-agent", "run_id": RUN, "notes": ""},
    ]
    profile = {
        "slug": SLUG,
        "generated": TODAY,
        "run_id": RUN,
        "summary": [{"text": "Test Person arrived at the Port of Example on June 10, 1941.",
                     "fact_ids": ["TST-F-0002"]}],
        "sections": [{"id": "work", "title": "Example College",
                      "sentences": [{"text": "Test Person taught at Example College.",
                                     "fact_ids": ["TST-F-0003"]}]}],
        "timeline": [{"date": "1941-06-10", "title": "Port of Example",
                      "text": "Testa Q. Persona arrived at the Port of Example.",
                      "fact_ids": ["TST-F-0002"], "media_ids": ["TST-M-0001"]}],
        "artifacts": [{"media_id": "TST-M-0001", "caption": "Testa Q. Persona arrived at the Port of Example.",
                       "fact_ids": ["TST-F-0002"]}],
        "avatar_lines": [
            {"speaker": "inductee", "kind": "quote", "text": "Example sentences are the best teachers.",
             "fact_ids": ["TST-F-0004"]},
            {"speaker": "guide", "kind": "narration", "text": "Test Person arrived in 1941.",
             "fact_ids": ["TST-F-0002"]},
        ],
        "how_to_cite": "Test Person profile, example package.",
        "gaps": [],
    }
    w = copy.deepcopy({
        "inductee": inductee,
        "sources": sources,
        "facts": facts,
        "media": media,
        "searches": searches,
        "profile": profile,
        "snapshots": dict(SNAPSHOT_TEXT),
        "registry": REGISTRY,
    })
    restamp(w)
    ground(w)
    return w


def ground(w):
    """Sentence-adversary verdicts (supported) on every draft unit as it is now (G6)."""
    import check_grounding
    facts = gates.by_id(w["facts"])
    rows = []
    for unit in check_grounding.iter_units(w.get("profile") or {}):
        if unit.kind not in check_grounding.NEEDS_VERDICT:
            continue
        cited = check_grounding.cited_facts(unit, facts)
        rows.append({"location": unit.location, "unit_sha256": check_grounding.unit_sha256(unit, cited),
                     "model": "test:sentence-adversary", "run_id": RUN, "date": TODAY, "verdict": "supported",
                     "adds_information": False, "rationale": "none"})
    w["grounding"] = rows
    return w


def stamp(w, rec, kind=None):
    """Record in rec's adversary verdict that it judged rec as it is now (judged_sha256)."""
    kind = kind or ("fact" if "evidence" in rec else "media")
    if isinstance(rec.get("adversary"), dict):
        rec["adversary"]["judged_sha256"] = judged.record_fingerprint(
            rec, kind, gates.by_id(w["sources"]), gates.by_id(w["facts"]))
    return rec


def restamp(w):
    """Stamp every verdict in the world: the adversary judged each record as it is now.

    Tests that change a record and then test a later rule (G5, G10, ...) call this
    so the change is not read as a stale verdict.
    """
    for f in w["facts"]:
        stamp(w, f, "fact")
    for m in w["media"]:
        stamp(w, m, "media")
    return w


def back_reviews(w):
    """Record a decision in w["decisions"] for every approved or edited record, as
    tools/apply_review.py logs them (G8: an approval must be on record)."""
    rows = w.setdefault("decisions", [])
    for rec in w["facts"] + w["media"]:
        review = rec.get("review") if isinstance(rec.get("review"), dict) else {}
        state = review.get("state")
        if state not in ("approved", "edited"):
            continue
        claim = rec.get("claim")
        # An approval names what was approved: the claim, or a media item's lock fingerprint.
        content = claim if "evidence" in rec else gates.media_lock_sha256(rec)
        rows.append({"date": review.get("date"), "reviewer": review.get("reviewer"), "item_id": rec["id"],
                     "action": "approve" if state == "approved" else "edit",
                     "before": content if state == "approved" else None,
                     "after": claim if state == "edited" else None, "note": ""})
    return w


def by_id(rows, rid):
    for row in rows:
        if row["id"] == rid:
            return row
    raise KeyError(rid)


def meta_for(src, text):
    """The meta file tools/fetch_snapshot.py writes for this source and text.

    For a record the tool now refuses to fetch (a fetch_url on another site), it is
    the meta file a person or an older tool would have written: fetch_url as the
    record names it.
    """
    method = src.get("fetch_method")
    fetch_url = None
    if method in ("http", "api"):
        try:
            fetch_url = fetchplan.plan_fetch(src).fetch_url
        except fetchplan.PlanError:
            fetch_url = src.get("fetch_url")
    return {"url": src["url"], "fetch_url": fetch_url, "method": method,
            "fetched_at": f"{TODAY}T00:00:00Z", "sha256": sha(text),
            "bytes": len(text.encode("utf-8")), "http_status": 200 if fetch_url else None}


def snapshot_objects(w):
    """In-memory snapshots for pure gate tests, keyed by source id."""
    out = {}
    for src in w["sources"]:
        text = w["snapshots"].get(src["id"])
        if text is None:
            continue
        out[src["id"]] = records.Snapshot(text=text, sha256=sha(text), meta=meta_for(src, text), error=None)
    return out


def registry(w=None):
    """The world's authority registry (ihh.authority.Registry)."""
    return authority.Registry.from_dict((w or {}).get("registry", REGISTRY), source="test registry")


def context(w):
    return gates.build_context(w["inductee"], w["sources"], snapshot_objects(w), w["facts"], registry(w))


def write_world(data_dir, w, profile=True):
    """Write the package under data_dir/inductees/<slug>/ and return its folder."""
    root = Path(data_dir) / "inductees" / w["inductee"]["slug"]
    reg = Path(data_dir) / "registry" / "institutions.json"
    reg.parent.mkdir(parents=True, exist_ok=True)
    reg.write_text(json.dumps(w.get("registry", REGISTRY), indent=2) + "\n", encoding="utf-8")
    (root / "snapshots").mkdir(parents=True, exist_ok=True)
    (root / "staging").mkdir(exist_ok=True)
    (root / "drafts").mkdir(exist_ok=True)
    (root / "review").mkdir(exist_ok=True)
    (root / "inductee.json").write_text(json.dumps(w["inductee"], indent=2) + "\n", encoding="utf-8")
    for name in ("facts", "sources", "media", "searches"):
        lines = [json.dumps(r, ensure_ascii=False) for r in w[name]]
        (root / f"{name}.jsonl").write_text("".join(line + "\n" for line in lines), encoding="utf-8")
    for src in w["sources"]:
        text = w["snapshots"].get(src["id"])
        if text is None:
            continue
        (root / "snapshots" / f"{src['id']}.txt").write_bytes(text.encode("utf-8"))
        meta = meta_for(src, text)
        (root / "snapshots" / f"{src['id']}.meta.json").write_text(json.dumps(meta, indent=2) + "\n",
                                                                     encoding="utf-8")
    if w.get("decisions"):
        (root / "review" / "decisions.jsonl").write_text(
            "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in w["decisions"]), encoding="utf-8")
    if profile and w.get("profile") is not None:
        (root / "drafts" / "profile.json").write_text(json.dumps(w["profile"], indent=2) + "\n",
                                                      encoding="utf-8")
        if w.get("grounding"):
            (root / "drafts" / "grounding.jsonl").write_text(
                "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in w["grounding"]), encoding="utf-8")
    return root


def read_rows(root, name):
    path = Path(root) / f"{name}.jsonl"
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


# --- the approved LoC / NARA rights rule (ihh/rights.py) --------------------------------------
# Test registry entries with the rule's holder ids ("loc", "nara") on invented example hosts.
RULE_REGISTRY_ENTRIES = [
    {"id": "loc", "name": "Example Federal Library", "kind": "government", "domains": [],
     "hosts": ["loc.example.org"], "may_be": ["primary", "institutional"], "verified_on": TODAY,
     "note": "Test holder with the rule's loc id."},
    {"id": "nara", "name": "Example Federal Records Office", "kind": "government", "domains": [],
     "hosts": ["nara.example.org"], "may_be": ["primary", "institutional"], "verified_on": TODAY,
     "note": "Test holder with the rule's nara id."},
]
RULE_HOSTS = {"loc": "loc.example.org", "nara": "nara.example.org", "commons": "commons.example.org",
              "news": "news.example.org"}
RULE_INSTITUTIONS = {"loc": "Example Federal Library", "nara": "Example Federal Records Office",
                     "commons": "Example Commons", "news": "Example News"}


def add_holder_media(w, n, holder, snapshot_text, rights_statement, license_class="unknown", stype=None):
    """Add source TST-S-01nn (snapshot snapshot_text, on the holder's host) and media TST-M-01nn
    resting on it, verified and stamped as judged. holder: loc, nara, commons or news."""
    if not any(e["id"] == "loc" for e in w["registry"]["entries"]):
        w["registry"] = copy.deepcopy(w["registry"])
        w["registry"]["entries"] += copy.deepcopy(RULE_REGISTRY_ENTRIES)
    sid, mid = f"TST-S-01{n:02d}", f"TST-M-01{n:02d}"
    snapshot_text += f"label: Item record {n}\n"  # supports the item's title and alt text (G2)
    url = f"https://{RULE_HOSTS[holder]}/item/{n}"
    stype = stype or ("primary" if holder in ("loc", "nara") else "secondary")
    src = source(sid, f"Item record {n}", RULE_INSTITUTIONS[holder], stype, url)
    src.update(snapshot=f"snapshots/{sid}.txt", snapshot_sha256=sha(snapshot_text), fetch_method="http")
    w["sources"].append(src)
    w["snapshots"][sid] = snapshot_text
    m = {
        "id": mid, "title": f"Item record {n}", "media_type": "image", "source_ids": [sid],
        "url": f"https://{RULE_HOSTS[holder]}/media/{n}.jpg",
        "rights_statement": rights_statement, "rights_url": url if rights_statement else None,
        "license_class": license_class, "credit": RULE_INSTITUTIONS[holder], "alt_text": f"Item record {n}.",
        "reconstruction": False, "reconstruction_basis": [], "adversary": adversary(quote_in_live="unreachable"),
        "status": "verified", "verified_claim_sha256": None, "review": review(), "notes": "",
    }
    m["verified_claim_sha256"] = gates.media_lock_sha256(m)
    w["media"].append(m)
    stamp(w, m, "media")
    return m


# --- experience content (content/<slug>/chapters) ---------------------------------------------------

ARRIVAL = "Testa Q. Persona arrived at the Port of Example on June 10, 1941."


def content_chapter(**over):
    ch = {
        "id": "testperson-1",
        "title": "Port of Example",
        "title_fact_ids": ["TST-F-0002"],
        "room": "chapter-gallery",
        "accent": "#3E4A52",
        "narration": [
            {"cue": "c1", "text": "Test Person taught at Example College.", "fact_ids": ["TST-F-0003"], "reveals": []},
            {"cue": "c2", "text": ARRIVAL, "fact_ids": ["TST-F-0002"], "reveals": ["ex1"]},
        ],
        "exhibits": [{
            "id": "ex1", "number": 1, "type": "framed-document", "wall": "north", "slot": 1,
            "media_id": "TST-M-0001", "original_media_id": "TST-M-0001",
            "title": "Port of Example", "title_fact_ids": ["TST-F-0002"],
            "notes": [{"text": ARRIVAL, "fact_ids": ["TST-F-0002"]}],
            "evidence": "record",
        }],
        "quotes": [],
    }
    ch.update(over)
    return ch


def write_content(tmp_path, chapters):
    """content/testperson/chapters/<n>.json; returns the content folder."""
    folder = tmp_path / "content"
    (folder / "testperson" / "chapters").mkdir(parents=True, exist_ok=True)
    for n, ch in enumerate(chapters, 1):
        (folder / "testperson" / "chapters" / f"{n}.json").write_text(json.dumps(ch), encoding="utf-8")
    return folder
