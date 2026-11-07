"""Tour docs and provenance (tools/ihh/tour_docs.py)."""

import csv
import io
import json

import pytest

import export
from ihh import tour, tour_docs

TOUR = {"slug": "testperson", "run_id": "tour-r1", "generated": "2026-11-03", "gaps": ["no chapter of kind legacy"],
        "unassigned_fact_ids": ["TST-F-0003"],
        "chapters": [
            {"id": "birth", "kind": "birth", "title": "Born in Example Town", "year": 1900, "year_fact": "TST-F-0010",
             "fact_ids": ["TST-F-0010"], "place": {"label": "Example Town", "fact_id": "TST-F-0010", "coord": "wikidata:Q1"},
             "records": ["TST-M-0010"], "usable_records": ["TST-M-0010"], "link_only_records": [],
             "place_photos": [{"media_id": "TST-M-0020", "license_class": "rights-restricted", "display": False}],
             "gaps": ["1 usable records (fewer than 3)"]},
            {"id": "arriving", "kind": "arriving", "title": None, "year": 1941, "year_fact": "TST-F-0002",
             "fact_ids": ["TST-F-0002"], "place": None, "records": ["TST-M-0001", "TST-M-0003"],
             "usable_records": ["TST-M-0001"], "link_only_records": ["TST-M-0003"], "place_photos": [],
             "gaps": ["1 usable records (fewer than 3)", "no verified place"]}],
        "journey": {"chapter": "arriving",
                    "places": [{"id": "home", "label": "Example Town", "fact_ids": ["TST-F-0010"], "coord": "wikidata:Q1"},
                               {"id": "port", "label": "Port of Example", "fact_ids": ["TST-F-0002"], "coord": "wikidata:Q2"}],
                    "segments": [{"routed": False, "route_facts": [], "mode": None, "mode_facts": [], "note": tour.ROUTE_NOTE}]}}
M = {mid: {"id": mid, "title": f"Record {mid}", "license_class": lic, "credit": "Example Archive", "status": "verified"}
     for mid, lic in (("TST-M-0010", "public-domain"), ("TST-M-0001", "cc-by"), ("TST-M-0003", "rights-restricted"),
                      ("TST-M-0020", "rights-restricted"))}
CTX = {"name": "Test Person", "run_id": "tour-r1", "date": "2026-11-03",
       "counts_before": {"facts": {"verified": 2}, "media": {"verified": 3}},
       "counts_after": {"facts": {"verified": 3}, "media": {"verified": 4}},
       "searches": [{"family": "tour-ca", "results": 3, "notes": "URL: x"}, {"family": "tour-nara", "results": None,
                                                                           "notes": "URL: y; blocked: HTTP 403"}],
       "blocked_hosts": {"catalog.archives.gov": "HTTP 403"}, "deferred": [{"source": "tmp-tour-r1-S-1", "reason": "blocked"}],
       "engine": "codex", "model": "gpt-6-sol",
       "steps": {s: "2026-11-03" for s in ("plan", "snapshot", "merge", "adversary", "status", "validate")}}


def test_upsert_keeps_hand_written_text_identical():
    hand = "# Test Person: tour research\n\nHand-written history, kept as is.\n"
    once = tour_docs.upsert_block(hand, "tour-r1", "first body")
    assert once.startswith(hand) and "first body" in once
    twice = tour_docs.upsert_block(once, "tour-r1", "second body")
    assert twice.startswith(hand) and "second body" in twice and "first body" not in twice
    other = tour_docs.upsert_block(twice, "tour-r2", "other run")
    assert "second body" in other and "other run" in other
    assert tour_docs.upsert_block(other, "tour-r1", "second body") == other


def test_upsert_refuses_bad_markers_and_run_ids():
    with pytest.raises(ValueError):
        tour_docs.upsert_block("<!-- tour-research:begin tour-r1 -->\nno end\n", "tour-r1", "x")
    with pytest.raises(ValueError):
        tour_docs.upsert_block("", "bad run -->", "x")


def test_renderers():
    tr = tour_docs.render_tour_research(TOUR, {}, M, CTX)
    assert tr.index("| 1 | Born in Example Town |") < tr.index("| 2 | arriving |")
    assert tour.ROUTE_NOTE in tr and "catalog.archives.gov (HTTP 403; not bypassed)" in tr
    assert "2 searches (1 blocked)" in tr and "tmp-tour-r1-S-1" in tr and "codex (gpt-6-sol)" in tr
    rooms = tour_docs.render_rooms(TOUR, {}, M, CTX)
    assert "TST-M-0020 (rights-restricted, reference only)" in rooms and "| reference only |" in rooms
    assert "| no verified place |" in rooms
    arts = tour_docs.render_artifacts(TOUR, {}, M, CTX)
    assert "| TST-M-0003 | Record TST-M-0003 | rights-restricted | verified | link only | Example Archive |" in arts
    assert "Usable records: 1 (fewer than 3)" in arts


def test_graph_and_csv():
    g = tour_docs.tour_graph(TOUR, {"slug": "testperson"}, CTX)
    assert tour_docs.CONTEXT == export.CONTEXT
    nodes = {n["@id"]: n for n in g["@graph"]}
    birth = nodes["ihh:tour-testperson-birth"]
    assert birth["ihh:usesFact"] == [{"@id": "ihh:TST-F-0010"}] and birth["position"] == 1
    assert birth["prov:wasGeneratedBy"] == {"@id": "ihh:run-testperson-tour-r1"}
    assert nodes["ihh:journey-testperson"]["ihh:segment"][0]["ihh:routed"] is False
    assert "@" not in json.dumps(g).replace('"@', "")
    rows = list(csv.DictReader(io.StringIO(tour_docs.tour_csv(TOUR).lstrip("﻿"))))
    assert [r["chapter_id"] for r in rows] == ["birth", "arriving"] and rows[1]["link_only_records"] == "TST-M-0003"


def test_an_ungated_run_says_so():
    # Codex review round 2: the method text claimed a gate that never ran
    ctx = dict(CTX, steps={"plan": "2026-11-03"}, engine=None, model=None)
    tr = tour_docs.render_tour_research(TOUR, {}, M, ctx)
    assert "The gate did not run in this run" in tr and "validate.py` (exit 0)" not in tr
    assert "The gate ran: snapshot, merge, adversary, status, validate" in tour_docs.render_tour_research(TOUR, {}, M, CTX)


def test_the_docs_state_each_records_review_status():
    # Codex review round 6: the docs said "verified facts and media only" while a disputed record under a
    # pinned owner ruling was shown as usable
    tour_out = json.loads(json.dumps(TOUR))
    c = tour_out["chapters"][1]
    c["records"].append("TST-M-0004")
    c["usable_records"].append("TST-M-0004")
    c["owner_ruled_records"] = ["TST-M-0004"]
    media = dict(M, **{"TST-M-0004": {"id": "TST-M-0004", "title": "Record TST-M-0004", "license_class": "public-domain",
                                      "credit": "Library of Congress", "status": "disputed"}})
    tr = tour_docs.render_tour_research(tour_out, {}, media, CTX)
    assert "verified facts and media only" not in tr
    assert "verified, or disputed and shown under a current owner ruling" in tr
    arts = tour_docs.render_artifacts(tour_out, {}, media, CTX)
    assert "| TST-M-0004 | Record TST-M-0004 | public-domain | disputed | usable (owner ruling) | Library of Congress |" in arts
    assert "| TST-M-0003 | Record TST-M-0003 | rights-restricted | verified | link only | Example Archive |" in arts
    assert "Usable means verified, or disputed under a current owner ruling," in arts
    rows = list(csv.DictReader(io.StringIO(tour_docs.tour_csv(tour_out).lstrip("﻿"))))
    assert rows[1]["owner_ruled_records"] == "TST-M-0004" and rows[0]["owner_ruled_records"] == ""
