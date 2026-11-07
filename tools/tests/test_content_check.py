# tools/tests/test_content_check.py
import json
from pathlib import Path
import content_check as cc
import factories
from ihh import gates

def facts(tmp, rows, media_patch=None):
    """A data folder for slug tst: the test world's sources, snapshots and registry, the given fact
    rows, and one media record (TST-M-0001, a verified public-domain item that passes the media
    checks) optionally patched by media_patch."""
    w = factories.world()
    w["inductee"].update(slug="tst", name="Test Person", aliases=[])
    # A fact row without evidence comes from the media record's own source, so a title or note citing
    # it passes the own-record rule; a test about that rule gives its rows explicit evidence.
    w["facts"] = [r if "evidence" in r else dict(r, evidence=[{"source_id": "TST-S-0001", "quote": "q", "locator": "l"}]) for r in rows]
    w["media"][0].update(media_patch or {})
    w["media"][0]["verified_claim_sha256"] = gates.media_lock_sha256(w["media"][0])
    factories.write_world(tmp / "data", w, profile=False)
    return tmp / "data"

def chapter(tmp, obj):
    c = tmp / "content" / "tst" / "chapters"; c.mkdir(parents=True)
    (c / "1.json").write_text(json.dumps(obj))
    return tmp / "content" / "tst"

F1 = {"id": "TST-F-0001", "status": "verified", "claim": "Test Person arrived in Boston in 1933.", "is_direct_quote": False}
Q1 = {"id": "TST-F-0002", "status": "verified", "claim": "Imagination is useful.", "is_direct_quote": True}
GOOD = {"id": "tst-1", "title": "Arrived in Boston", "title_fact_ids": ["TST-F-0001"], "room": "chapter-gallery",
        "narration": [{"cue": "c1", "text": "Test Person arrived in Boston in 1933.", "fact_ids": ["TST-F-0001"], "reveals": ["ex1"]}],
        "exhibits": [{"id": "ex1", "number": 1, "type": "framed-document", "wall": "north", "slot": 1,
                      "media_id": "TST-M-0001", "original_media_id": "TST-M-0001", "title": "Arrived in Boston",
                      "title_fact_ids": ["TST-F-0001"], "notes": [], "evidence": "record"}],
        "quotes": [{"id": "q1", "text": "Imagination is useful.", "fact_id": "TST-F-0002", "voice": "tst-ai"}]}

def test_good_chapter_passes(tmp_path):
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, GOOD)
    assert cc.check("tst", content, data) == []

def test_unverified_fact_fails(tmp_path):
    data = facts(tmp_path, [dict(F1, status="disputed"), Q1]); content = chapter(tmp_path, GOOD)
    assert any("TST-F-0001" in e and "verified" in e for e in cc.check("tst", content, data))

def test_added_word_fails(tmp_path):
    bad = json.loads(json.dumps(GOOD)); bad["narration"][0]["text"] = "Test Person proudly arrived in Boston in 1933."
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, bad)
    assert any("proudly" in e for e in cc.check("tst", content, data))

def test_quote_must_be_verbatim(tmp_path):
    bad = json.loads(json.dumps(GOOD)); bad["quotes"][0]["text"] = "Imagination is very useful."
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, bad)
    assert any("q1" in e and "verbatim" in e for e in cc.check("tst", content, data))

def test_reconstruction_needs_basis(tmp_path):
    bad = json.loads(json.dumps(GOOD)); bad["room"] = "reconstructed-place"
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, bad)
    assert any("basis" in e for e in cc.check("tst", content, data))

def test_unknown_reveal_fails(tmp_path):
    bad = json.loads(json.dumps(GOOD)); bad["narration"][0]["reveals"] = ["ex9"]
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, bad)
    assert any("ex9" in e for e in cc.check("tst", content, data))

def test_missing_original_link_fails(tmp_path):
    bad = json.loads(json.dumps(GOOD)); del bad["exhibits"][0]["original_media_id"]
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, bad)
    assert any("original" in e for e in cc.check("tst", content, data))


def _run(tmp_path, mutate, rows=None, media=None):
    bad = json.loads(json.dumps(GOOD)); mutate(bad)
    data = facts(tmp_path, rows or [F1, Q1]); content = chapter(tmp_path, bad)
    if media is not None:
        (data / "inductees" / "tst" / "media.jsonl").write_text("".join(json.dumps(m) + "\n" for m in media))
    return cc.check("tst", content, data)

def _m(**kw):
    return dict({"id": "TST-M-0001", "status": "verified", "license_class": "public-domain"}, **kw)

def test_invalid_room_v(tmp_path):
    assert any("room" in e for e in _run(tmp_path, lambda c: c.update(room="attic")))

def test_invalid_wall(tmp_path):
    assert any("wall" in e for e in _run(tmp_path, lambda c: c["exhibits"][0].update(wall="up")))

def test_slot_out_of_range(tmp_path):
    for slot in (0, 5):
        d = tmp_path / str(slot); d.mkdir()
        assert any("slot" in e for e in _run(d, lambda c: c["exhibits"][0].update(slot=slot)))

def test_duplicate_exhibit_id_and_number(tmp_path):
    def m(c):
        c["exhibits"].append(dict(c["exhibits"][0]))
    errs = _run(tmp_path, m)
    assert any("duplicate id" in e for e in errs) and any("duplicate number" in e for e in errs)

def test_unverified_basis_media(tmp_path):
    def m(c):
        c["room"] = "reconstructed-place"; c["reconstruction"] = {"basis_media_ids": ["TST-M-0002"]}
    errs = _run(tmp_path, m, media=[_m(), _m(id="TST-M-0002", status="candidate")])
    assert any("basis" in e and "TST-M-0002" in e for e in errs)

def test_unusable_licence(tmp_path):
    errs = _run(tmp_path, lambda c: None, media=[_m(license_class="rights-restricted")])
    assert any("licence" in e for e in errs)

def test_unverified_media(tmp_path):
    errs = _run(tmp_path, lambda c: None, media=[_m(status="candidate")])
    assert any("not verified" in e for e in errs)

def test_quote_fact_not_direct_quote(tmp_path):
    errs = _run(tmp_path, lambda c: None, rows=[F1, dict(Q1, is_direct_quote=False)])
    assert any("q1" in e and "is_direct_quote" in e for e in errs)

def test_empty_fact_ids(tmp_path):
    assert any("no fact_ids" in e for e in _run(tmp_path, lambda c: c["narration"][0].update(fact_ids=[])))

def test_unknown_fact_id(tmp_path):
    assert any("TST-F-9999" in e for e in _run(tmp_path, lambda c: c["narration"][0].update(fact_ids=["TST-F-9999"])))

def test_note_adds_word(tmp_path):
    def m(c):
        c["exhibits"][0]["notes"] = [{"text": "Test Person arrived in Boston in 1933 gladly.", "fact_ids": ["TST-F-0001"]}]
    assert any("gladly" in e for e in _run(tmp_path, m))

def test_empty_text_fails(tmp_path):
    for i, m in enumerate([
        lambda c: c["narration"][0].update(text=""),
        lambda c: c["exhibits"][0].update(title=""),
        lambda c: c["exhibits"][0].update(notes=[{"text": "", "fact_ids": ["TST-F-0001"]}]),
        lambda c: c["narration"][0].pop("text"),
        lambda c: c["narration"][0].update(text=5),
    ]):
        d = tmp_path / str(i); d.mkdir()
        assert any("text" in e or "title" in e for e in _run(d, m)), i

def test_no_chapters(tmp_path):
    data = facts(tmp_path, [F1, Q1]); (tmp_path / "content" / "tst" / "chapters").mkdir(parents=True)
    assert any("no chapters found" in e for e in cc.check("tst", tmp_path / "content" / "tst", data))
    assert any("no chapters found" in e for e in cc.check("tst", tmp_path / "nope", data))

def test_chapter_title_grounded(tmp_path):
    assert any("title" in e and "proudly" in e for e in _run(tmp_path, lambda c: c.update(title="Arrived proudly in Boston")))
    assert any("title" in e and "no fact_ids" in e for e in _run(tmp_path / "x" if (tmp_path / "x").mkdir() is None else tmp_path, lambda c: c.pop("title_fact_ids")))

def test_duplicate_chapter_cue_quote_ids(tmp_path):
    def m(c):
        c["narration"].append(dict(c["narration"][0])); c["quotes"].append(dict(c["quotes"][0]))
    errs = _run(tmp_path, m)
    assert any("duplicate cue" in e for e in errs) and any("duplicate quote" in e for e in errs)
    # chapter ids across files
    c2 = tmp_path / "content" / "tst" / "chapters" / "2.json"; c2.write_text(json.dumps(GOOD))
    assert any("duplicate chapter id" in e for e in cc.check("tst", tmp_path / "content" / "tst", tmp_path / "data"))


def test_unknown_exhibit_type_fails(tmp_path):
    assert any("type" in e for e in _run(tmp_path, lambda c: c["exhibits"][0].update(type="360 document")))

def test_wall_quote_needs_quote_in_chapter(tmp_path):
    def mut(c): c["exhibits"][0].update(type="wall-quote", quote_id="nope")
    assert any("quote_id" in e for e in _run(tmp_path, mut))
    d = tmp_path / "ok"; d.mkdir()
    def ok(c): c["exhibits"][0].update(type="wall-quote", quote_id="q1")
    assert not any("quote_id" in e for e in _run(d, ok))


# Reconstructed places: same rules as site/src/museum/reconstruction.js validatePlace.
import copy
import pytest

PLACE_CASES = json.loads((Path(__file__).parent / "fixtures" / "place_cases.json").read_text())

def _case_place(c):
    if "replace" in c:
        return c["replace"]
    p = copy.deepcopy(PLACE_CASES["base"]); p.update(copy.deepcopy(c.get("place", {})))
    if "item" in c:
        p["items"][0].update(c["item"])
    return p

def test_place_constants_match_shared_fixture():
    k = PLACE_CASES["constants"]
    assert cc.PLACE_MIN == k["min_size"]
    assert cc.AGAINST_WALL == k["against_wall"]
    assert cc.EXHIBIT_FOOTPRINT == k["exhibit_footprint"]
    assert cc.SUB_KINDS == k["sub_kinds"]

@pytest.mark.parametrize("case", PLACE_CASES["cases"], ids=[c["name"] for c in PLACE_CASES["cases"]])
def test_shared_place_cases(case):
    errs = cc.validate_place(_case_place(case), PLACE_CASES["basis"], case.get("exhibits", []))
    if case["match"] is None:
        assert errs == []
    else:
        assert case["match"] in "; ".join(errs)

def _place_chapter(c, **rec):
    c["room"] = "reconstructed-place"
    c["reconstruction"] = dict({"basis_media_ids": ["TST-M-0001"], "basis_fact_ids": ["TST-F-0001"],
                                "note": "Test Person arrived in Boston in 1933.",
                                "place": {"w": 4, "d": 5, "h": 3, "unseen": ["south"],
                                          "items": [{"kind": "desk", "x": 0, "z": -1, "rotY": 0, "w": 1.2, "d": 0.6, "h": 0.75, "basis": "TST-M-0001"}]}},
                               **rec)

def test_reconstructed_place_passes(tmp_path):
    assert _run(tmp_path, _place_chapter) == []

def test_reconstructed_place_needs_a_place(tmp_path):
    errs = _run(tmp_path, lambda c: _place_chapter(c, place=None))
    assert any("reconstruction place must be an object" in e for e in errs)

def test_place_item_must_cite_a_basis_photo_of_this_reconstruction(tmp_path):
    def m(c):
        _place_chapter(c); c["reconstruction"]["place"]["items"][0]["basis"] = "TST-M-0002"
    errs = _run(tmp_path, m, media=[_m(), _m(id="TST-M-0002")])
    assert any("basis TST-M-0002 is not one of the reconstruction basis photos" in e for e in errs)

def test_place_rules_run_in_content_check(tmp_path):
    def m(c):
        _place_chapter(c); p = c["reconstruction"]["place"]
        p["items"][0].update(kind="dragon", x=9); p["unseen"] = ["roof"]
    errs = _run(tmp_path, m)
    assert any("kind dragon" in e for e in errs)
    assert any("outside the room" in e for e in errs)
    assert any("unseen: roof is not a wall" in e for e in errs)

def test_reconstruction_note_is_grounded(tmp_path):
    errs = _run(tmp_path, lambda c: _place_chapter(c, note="Test Person happily arrived in Boston in 1933."))
    assert any("reconstruction note" in e and "happily" in e for e in errs)
    d = tmp_path / "x"; d.mkdir()
    errs = _run(d, lambda c: _place_chapter(c, basis_fact_ids=[]))
    assert any("reconstruction note" in e and "no fact_ids" in e for e in errs)

def test_reconstruction_basis_facts_verified_without_note(tmp_path):
    def m(c):
        _place_chapter(c, basis_fact_ids=["TST-F-9999"]); del c["reconstruction"]["note"]
    errs = _run(tmp_path, m)
    assert any("basis fact TST-F-9999" in e for e in errs)

def test_content_check_passes_exhibits_to_the_place_rules(tmp_path):
    def m(c):
        _place_chapter(c)
        c["reconstruction"]["place"]["items"].append({"kind": "window", "x": -0.4, "z": -2.47, "y": 1.0, "rotY": 0, "w": 1, "d": 0.06, "h": 1.2, "basis": "TST-M-0001"})
    errs = _run(tmp_path, m)  # GOOD's exhibit ex1 hangs on the north wall, slot 1 (x = -1.2)
    assert any("exhibit ex1: covers item 1 (window) on the north wall" in e for e in errs)


# Task 10c: evidence labels, page files, quote attribution.
def test_evidence_must_be_a_known_value(tmp_path):
    errs = _run(tmp_path, lambda c: c["exhibits"][0].update(evidence="rumour"))
    assert any("evidence" in e and "rumour" in e for e in errs)

def test_evidence_is_required(tmp_path):
    assert any("evidence" in e for e in _run(tmp_path, lambda c: c["exhibits"][0].pop("evidence")))

def test_known_evidence_values_mirror_the_site():
    import re
    src = (Path(__file__).resolve().parents[2] / "site" / "src" / "content" / "load.js").read_text()
    block = src[src.index("EVIDENCE_LABELS = Object.freeze({"):]
    block = block[: block.index("});")]
    assert set(re.findall(r"^\s*(\w+):", block, re.M)) == cc.EVIDENCE

def test_page_must_be_a_positive_integer(tmp_path):
    for i, v in enumerate((0, -1, 1.5, "2", True)):
        d = tmp_path / str(i); d.mkdir()
        assert any("page" in e for e in _run(d, lambda c: c["exhibits"][0].update(page=v)))
    d = tmp_path / "ok"; d.mkdir()
    assert _run(d, lambda c: c["exhibits"][0].update(page=2)) == []

def test_pages_only_on_360_documents_front_and_optional_back(tmp_path):
    d = tmp_path / "a"; d.mkdir()
    assert any("pages" in e for e in _run(d, lambda c: c["exhibits"][0].update(pages=[1, 2])))
    def doc(pages):
        return lambda c: c["exhibits"][0].update(type="360-document", pages=pages)
    for i, bad in enumerate(([], [1, 2, 3], [0], [1, "2"], "1", [2, 2])):
        d = tmp_path / f"b{i}"; d.mkdir()
        assert any("pages" in e for e in _run(d, doc(bad))), bad
    for i, ok in enumerate(([3, 4], [1])):
        d = tmp_path / f"c{i}"; d.mkdir()
        assert _run(d, doc(ok)) == []

ATTR = {"id": "TST-F-0003", "status": "verified", "claim": "Test Person signed a letter to the Mayor in May 1933.", "is_direct_quote": False}

def test_quote_attribution_is_grounded(tmp_path):
    ok = {"source": "signed letter to the Mayor", "date": "May 1933", "fact_ids": ["TST-F-0003"]}
    assert _run(tmp_path, lambda c: c["quotes"][0].update(attribution=ok), rows=[F1, Q1, ATTR]) == []
    d = tmp_path / "bad"; d.mkdir()
    bad = dict(ok, source="famous letter to the Mayor")
    assert any("q1 attribution" in e and "famous" in e for e in _run(d, lambda c: c["quotes"][0].update(attribution=bad), rows=[F1, Q1, ATTR]))
    d = tmp_path / "nofacts"; d.mkdir()
    assert any("q1 attribution" in e for e in _run(d, lambda c: c["quotes"][0].update(attribution=dict(ok, fact_ids=[])), rows=[F1, Q1, ATTR]))
    d = tmp_path / "nodate"; d.mkdir()
    assert any("q1 attribution date" in e for e in _run(d, lambda c: c["quotes"][0].update(attribution=dict(ok, date="")), rows=[F1, Q1, ATTR]))


# Journey map (content/<slug>/journey.json) and quiz (content/<slug>/quiz.json): every visible
# string is grounded in the stop's or option's verified facts, like chapter text.
F4 = {"id": "TST-F-0004", "status": "verified", "claim": "Test Person was born 2 May 1901 in Graz, Austria.", "is_direct_quote": False,
      "place": "Graz, Austria", "event_date": "1901-05-02"}
STOP = {"id": "graz", "label": "Graz, Austria", "place": "Graz", "date": "1901", "fact_ids": ["TST-F-0004"],
        "lines": [{"text": "Test Person was born 2 May 1901 in Graz, Austria.", "fact_ids": ["TST-F-0004"]}],
        "map": {"x": 700, "y": 300, "lat": 47.07, "lon": 15.44, "coord_source": "https://www.wikidata.org/wiki/Q13298"}}
QUIZ = [{"id": "q-born", "question": "Test Person was born 2 May 1901 in ___.", "question_fact_ids": ["TST-F-0004"],
         "options": [
             {"text": "Graz", "correct": True, "explanation": "Test Person was born 2 May 1901 in Graz, Austria.", "fact_ids": ["TST-F-0004"]},
             {"text": "Boston", "correct": False, "explanation": "Test Person arrived in Boston in 1933.", "fact_ids": ["TST-F-0001"]}]}]

GRAZ_SNAPSHOT = {"entities": {"Q13298": {"qid": "Q13298", "lat": 47.07, "lon": 15.44, "retrieved_at": "2026-10-10T00:00:00Z",
                                         "api_url": "https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=Q13298&property=P625&format=json"}}}

def _extra(tmp_path, journey=None, quiz=None, rows=None, coords=GRAZ_SNAPSHOT):
    data = facts(tmp_path, rows or [F1, Q1, F4]); content = chapter(tmp_path, GOOD)
    if coords is not None: (content / "coords.snapshot.json").write_text(json.dumps(coords))
    if journey is not None: (content / "journey.json").write_text(json.dumps(journey))
    if quiz is not None: (content / "quiz.json").write_text(json.dumps(quiz))
    return cc.check("tst", content, data)

def _stop(**kw):
    return dict(json.loads(json.dumps(STOP)), **kw)

def test_journey_and_quiz_are_optional_and_good_ones_pass(tmp_path):
    assert _extra(tmp_path) == []
    d = tmp_path / "with"; d.mkdir()
    assert _extra(d, journey={"stops": [_stop(chapter=1)]}, quiz=QUIZ) == []

def test_journey_stop_text_is_grounded(tmp_path):
    cases = {"label": _stop(label="Graz, Styria"), "date": _stop(date="1902"),
             "line": _stop(lines=[{"text": "Test Person was happily born in Graz.", "fact_ids": ["TST-F-0004"]}])}
    for name, stop in cases.items():
        d = tmp_path / name; d.mkdir()
        errs = _extra(d, journey={"stops": [stop]})
        assert any("journey stop graz" in e for e in errs), (name, errs)

def test_journey_stop_needs_verified_facts(tmp_path):
    errs = _extra(tmp_path, journey={"stops": [STOP]}, rows=[F1, Q1, dict(F4, status="single-source")])
    assert any("journey stop graz" in e and "verified" in e for e in errs)

def test_journey_stop_structure(tmp_path):
    cases = {"duplicate id": {"stops": [STOP, STOP]}, "no stops": {"stops": []},
             "chapter": {"stops": [_stop(chapter=7)]}, "map": {"stops": [_stop(map={"x": "a", "y": 1})]},
             "outside": {"stops": [_stop(map={"x": 1200, "y": 10})]}, "no lines": {"stops": [_stop(lines=[])]}}
    for name, journey in cases.items():
        d = tmp_path / name.replace(" ", "-"); d.mkdir()
        assert any("journey" in e for e in _extra(d, journey=journey)), name

# A mapped stop also carries the published coordinates of its named place (shown on the globe,
# labelled approximate) and the URL they were taken from. They locate the place; they are not facts.
def test_mapped_stop_needs_coordinates_and_their_source(tmp_path):
    def m(**kw):
        x = dict(STOP["map"], **kw)
        return _stop(map={k: v for k, v in x.items() if v is not None})
    cases = {"no lat": m(lat=None), "no lon": m(lon=None), "lat range": m(lat=91), "lon range": m(lon=-180.5),
             "lat text": m(lat="47"), "lat bool": m(lat=True), "lon nan": m(lon=float("nan")),
             "no source": m(coord_source=None), "source not url": m(coord_source="Wikidata"),
             "source ftp": m(coord_source="ftp://example.org/q"), "source empty host": m(coord_source="https://"),
             "source not wikidata": m(coord_source="http://example.org/place"),
             "source wikidata page of a file": m(coord_source="https://www.wikidata.org/wiki/Special:EntityData/Q13298"),
             "source http": m(coord_source="http://www.wikidata.org/wiki/Q13298")}
    for name, stop in cases.items():
        d = tmp_path / name.replace(" ", "-"); d.mkdir()
        errs = _extra(d, journey={"stops": [stop]})
        assert any("journey stop graz" in e and ("lat" in e or "lon" in e or "coord_source" in e) for e in errs), (name, errs)
    d = tmp_path / "edges"; d.mkdir()
    snap = {"entities": {"Q1": dict(GRAZ_SNAPSHOT["entities"]["Q13298"], qid="Q1", lat=-90, lon=180)}}
    assert _extra(d, journey={"stops": [m(lat=-90, lon=180, coord_source="https://www.wikidata.org/wiki/Q1")]}, coords=snap) == []

# The coordinates must be the ones the cited Wikidata entity publishes (committed snapshot of its P625,
# tools/fetch_coords.py), not merely numbers in range: Ulm's coordinates under another place's entity fail.
ULM = (48.3986, 9.9911)
MERCER = {"entities": {"Q43282043": {"qid": "Q43282043", "lat": 40.3443, "lon": -74.6663, "retrieved_at": "2026-10-10T00:00:00Z", "api_url": "x"}}}

def _mercer(**kw):
    return _stop(map={"x": 1, "y": 1, "lat": 40.3443, "lon": -74.6663, "coord_source": "https://www.wikidata.org/wiki/Q43282043", **kw})

def test_coordinates_must_match_the_cited_wikidata_snapshot(tmp_path):
    ok = tmp_path / "ok"; ok.mkdir()
    assert _extra(ok, journey={"stops": [_mercer()]}, coords=MERCER) == []
    near = tmp_path / "near"; near.mkdir()
    assert _extra(near, journey={"stops": [_mercer(lat=40.3443 + 0.009, lon=-74.6663 - 0.009)]}, coords=MERCER) == []
    ulm = tmp_path / "ulm"; ulm.mkdir()
    errs = _extra(ulm, journey={"stops": [_mercer(lat=ULM[0], lon=ULM[1])]}, coords=MERCER)
    assert any("journey stop graz" in e and "Q43282043" in e and "published coordinates" in e for e in errs), errs
    edge = tmp_path / "edge"; edge.mkdir()
    assert any("published coordinates" in e for e in _extra(edge, journey={"stops": [_mercer(lat=40.3443 + 0.011)]}, coords=MERCER))

def test_coordinates_need_a_snapshot_entry_for_the_cited_entity(tmp_path):
    none = tmp_path / "none"; none.mkdir()
    assert any("Q43282043" in e and "coords.snapshot.json" in e for e in _extra(none, journey={"stops": [_mercer()]}, coords=None))
    other = tmp_path / "other"; other.mkdir()
    assert any("no entry for Q43282043" in e for e in _extra(other, journey={"stops": [_mercer()]}, coords=GRAZ_SNAPSHOT))
    renamed = tmp_path / "renamed"; renamed.mkdir()
    swapped = {"entities": {"Q43282043": dict(MERCER["entities"]["Q43282043"], qid="Q3012")}}
    assert any("Q43282043" in e and "Q3012" in e for e in _extra(renamed, journey={"stops": [_mercer()]}, coords=swapped))
    bad = tmp_path / "bad"; bad.mkdir()
    assert any("coords.snapshot.json" in e for e in _extra(bad, journey={"stops": [_mercer()]}, coords=[1]))

def test_quiz_text_is_grounded(tmp_path):
    def q(mut):
        x = json.loads(json.dumps(QUIZ)); mut(x[0]); return x
    cases = {"question": q(lambda x: x.update(question="Test Person was famously born in ___.")),
             "option": q(lambda x: x["options"][0].update(text="Vienna")),
             "explanation": q(lambda x: x["options"][1].update(explanation="Test Person never lived in Boston."))}
    for name, quiz in cases.items():
        d = tmp_path / name; d.mkdir()
        assert any("quiz q-born" in e for e in _extra(d, quiz=quiz)), name

def test_quiz_structure(tmp_path):
    def q(mut):
        x = json.loads(json.dumps(QUIZ)); mut(x); return x
    cases = {"two correct": q(lambda x: x[0]["options"][1].update(correct=True)),
             "none correct": q(lambda x: x[0]["options"][0].update(correct=False)),
             "one option": q(lambda x: x[0].update(options=x[0]["options"][:1])),
             "duplicate id": q(lambda x: x.append(x[0])),
             "not a list": {"questions": QUIZ}}
    for name, quiz in cases.items():
        d = tmp_path / name.replace(" ", "-"); d.mkdir()
        assert any("quiz" in e for e in _extra(d, quiz=quiz)), name


# A stop is drawn on the map only when one of its facts names its place; the place and the date
# must come from that same fact, never pooled from two.
F5 = {"id": "TST-F-0005", "status": "verified", "claim": "Test Person had a workshop at 9 Elm Road, Graz.", "is_direct_quote": False,
      "place": "9 Elm Road, Graz"}
F6 = {"id": "TST-F-0006", "status": "verified", "claim": "Test Person became a citizen in 1940.", "is_direct_quote": False, "event_date": "1940"}

def test_mapped_stop_needs_a_fact_that_names_its_place(tmp_path):
    rows = [F1, Q1, F4, F5, F6]
    ok_unmapped = {"id": "cit", "label": "Citizen", "date": "1940", "fact_ids": ["TST-F-0006"],
                   "lines": [{"text": "Test Person became a citizen in 1940.", "fact_ids": ["TST-F-0006"]}]}
    assert _extra(tmp_path, journey={"stops": [STOP, ok_unmapped]}, rows=rows) == []
    cases = {
        "no place": dict(ok_unmapped, map={"x": 10, "y": 10}),
        "place no fact names": dict(ok_unmapped, place="Graz", label="Citizen", map={"x": 10, "y": 10}),
        "place not in label": _stop(place="Austria", label="Graz"),
    }
    for name, stop in cases.items():
        d = tmp_path / name.replace(" ", "-"); d.mkdir()
        errs = _extra(d, journey={"stops": [stop]}, rows=rows)
        assert any("journey stop" in e and "place" in e for e in errs), (name, errs)

def test_place_and_date_pooled_from_two_facts_fails(tmp_path):
    rows = [F1, Q1, F4, F5, F6]
    pooled = {"id": "elm", "label": "9 Elm Road, Graz", "place": "9 Elm Road", "date": "1940", "fact_ids": ["TST-F-0005", "TST-F-0006"],
              "lines": [{"text": "Test Person had a workshop at 9 Elm Road, Graz.", "fact_ids": ["TST-F-0005"]}], "map": dict(STOP["map"], x=10, y=10)}
    errs = _extra(tmp_path, journey={"stops": [pooled]}, rows=rows)
    assert any("journey stop elm" in e and "one fact" in e for e in errs), errs
    d = tmp_path / "undated"; d.mkdir()
    undated = {k: v for k, v in pooled.items() if k != "date"}
    assert _extra(d, journey={"stops": [dict(undated, fact_ids=["TST-F-0005"])]}, rows=rows) == []
    d = tmp_path / "unmapped"; d.mkdir()
    label_date = dict(pooled, label="Citizen", fact_ids=["TST-F-0005", "TST-F-0006"])
    del label_date["map"], label_date["place"]
    label_date["label"] = "9 Elm Road"
    assert any("one fact" in e for e in _extra(d, journey={"stops": [label_date]}, rows=rows))

def test_quiz_filled_question_must_be_one_cited_fact(tmp_path):
    def q(mut):
        x = json.loads(json.dumps(QUIZ)); mut(x[0]); return x
    wrong_flag = q(lambda x: (x["options"][0].update(correct=False), x["options"][1].update(correct=True)))
    errs = _extra(tmp_path, quiz=wrong_flag, rows=[F1, Q1, F4])
    assert any("quiz q-born" in e and "correct option" in e for e in errs), errs
    d = tmp_path / "noblank"; d.mkdir()
    assert any("blank" in e for e in _extra(d, quiz=q(lambda x: x.update(question="Test Person was born 2 May 1901.")), rows=[F1, Q1, F4]))


# --- G1 media / rights rule: every media item the site embeds passes validate.py's media checks ------

import pytest
from ihh import rights

LOC_OK = "No known restrictions on publication."
LOC_BARRED = "Publication may be restricted. For information see the collection."


def _loc_snapshot(advisory):
    return f"title: Example portrait\nrights_advisory: {advisory}\nitem.rights_advisory: {advisory}\n"


def _rights_world(tmp, advisory, license_class, statement=None):
    """Data folder for slug tst with a second media item TST-M-0101 held by the test 'loc' holder."""
    w = factories.world()
    w["inductee"].update(slug="tst", name="Test Person", aliases=[])
    factories.add_holder_media(w, 1, "loc", _loc_snapshot(advisory), statement or advisory, license_class)
    # These tests are about rights, so the facts the chapter cites come from every media item's own record.
    own = [{"source_id": sid, "quote": "q", "locator": "l"} for m in w["media"] for sid in m.get("source_ids") or []]
    w["facts"] = [dict(F1, evidence=own), Q1]
    factories.write_world(tmp / "data", w, profile=False)
    return tmp / "data"


def _use(where, mid="TST-M-0101"):
    """Chapter (and inductee patch) that embeds media mid in the given place."""
    ch = json.loads(json.dumps(GOOD))
    ex = ch["exhibits"][0]
    portrait = None
    if where == "media_id": ex["media_id"] = mid
    elif where == "original_media_id": ex["original_media_id"] = mid
    elif where == "basis":
        ch["room"] = "reconstructed-place"; ch["reconstruction"] = {"basis_media_ids": [mid]}
    elif where == "portrait": portrait = {"media_id": mid}
    return ch, portrait


def _errors(tmp, data, where):
    ch, portrait = _use(where)
    content = chapter(tmp, ch)
    if portrait:
        ip = data / "inductees" / "tst" / "inductee.json"
        ip.write_text(json.dumps({**json.loads(ip.read_text()), "portrait": portrait}))
    return cc.check("tst", content, data)

WHERE = ["media_id", "original_media_id", "basis", "portrait"]


@pytest.mark.parametrize("where", WHERE)
def test_barred_rights_wording_with_public_domain_fails(tmp_path, where):
    data = _rights_world(tmp_path, LOC_BARRED, "public-domain")
    errs = [e for e in _errors(tmp_path, data, where) if "TST-M-0101" in e]
    assert errs and any("never usable" in e and "rights rule" in e for e in errs)


@pytest.mark.parametrize("where", WHERE)
def test_license_class_that_disagrees_with_rights_class_fails(tmp_path, where):
    assert rights.rights_class("loc", LOC_OK) == rights.PUBLIC_DOMAIN
    data = _rights_world(tmp_path, LOC_OK, "cc-by")
    errs = [e for e in _errors(tmp_path, data, where) if "TST-M-0101" in e]
    assert errs and any("does not follow the approved rights rule" in e for e in errs)


@pytest.mark.parametrize("where", WHERE)
def test_rights_wording_missing_from_the_snapshot_fails(tmp_path, where):
    data = _rights_world(tmp_path, LOC_OK, "public-domain", statement="No known restrictions on anything.")
    errs = [e for e in _errors(tmp_path, data, where) if "TST-M-0101" in e]
    assert errs and any("not found in any source snapshot" in e for e in errs)


@pytest.mark.parametrize("where", WHERE)
def test_media_that_follows_the_rights_rule_passes(tmp_path, where):
    data = _rights_world(tmp_path, LOC_OK, "public-domain")
    assert [e for e in _errors(tmp_path, data, where) if "TST-M-0101" in e] == []


def test_a_media_item_the_site_does_not_embed_is_not_checked(tmp_path):
    data = _rights_world(tmp_path, LOC_BARRED, "public-domain")  # TST-M-0101 is on file but unused
    content = chapter(tmp_path, GOOD)
    assert cc.check("tst", content, data) == []


# Sub-objects of a reconstructed place (books, papers, book-stack) must be declared with a parent item
# and basis photos; the content check rejects an undeclared kind or one without a basis.
def _sub_run(tmp_path, sub, name):
    d = tmp_path / name; d.mkdir()
    def mut(c):
        _place_chapter(c)
        items = c["reconstruction"]["place"]["items"]
        items[0]["id"] = "desk-1"
        items.append(sub)
    return _run(d, mut)

def test_declared_sub_object_with_basis_passes(tmp_path):
    assert _sub_run(tmp_path, {"kind": "papers", "parent": "desk-1", "basis_media_ids": ["TST-M-0001"]}, "ok") == []

def test_undeclared_or_unbased_sub_object_fails_the_content_check(tmp_path):
    cases = {"undeclared kind": ({"kind": "curtain", "parent": "desk-1", "basis_media_ids": ["TST-M-0001"]}, "kind curtain"),
             "no basis": ({"kind": "papers", "parent": "desk-1"}, "basis_media_ids"),
             "foreign basis": ({"kind": "papers", "parent": "desk-1", "basis_media_ids": ["TST-M-0009"]}, "basis TST-M-0009"),
             "no parent": ({"kind": "papers", "basis_media_ids": ["TST-M-0001"]}, "parent")}
    for name, (sub, want) in cases.items():
        errs = _sub_run(tmp_path, sub, name.replace(" ", "-"))
        assert any(want in e for e in errs), (name, errs)


# Every mapped stop has an aerial stack (tools/build_aerials.py): manifest, files, extents, credits.
# Journey flow fix round 1: six levels (two regional NASA Blue Marble levels first), street names
# on the two closest, and a "precision" the gate derives from the stop's verified place.
def _aerial(tmp_path, mutate=None, stop_files=True, extra_bytes=0, folder_name="graz"):
    ad = tmp_path / "aerial"; folder = ad / folder_name; folder.mkdir(parents=True)
    names = ["0.webp", "1.webp", "2.webp", "3.webp", "4.webp", "5.webp", "labels-4.webp", "labels-5.webp"]
    if stop_files:
        for n in names: (folder / n).write_bytes(b"x" * 1000)
        (folder / "0.webp").write_bytes(b"x" * (1000 + extra_bytes))
    m = {"version": 1, "slug": "tst", "stop": "graz", "country": "DE", "centre": {"lat": 47.07, "lon": 15.44},
         "coord_source": "https://www.wikidata.org/wiki/Q13298",
         "precision": "city",
         "levels": [{"extent_m": 300000, "file": "0.webp"}, {"extent_m": 60000, "file": "1.webp"},
                    {"extent_m": 10000, "file": "2.webp"}, {"extent_m": 2000, "file": "3.webp"},
                    {"extent_m": 300, "file": "4.webp", "labels": "labels-4.webp"},
                    {"extent_m": 100, "file": "5.webp", "labels": "labels-5.webp"}],
         "credits": [{"source": "nasa-bmng", "text": "n", "url": "https://x", "licence": "CC0"},
                     {"source": "lgl-bw", "text": "t", "url": "https://x", "licence": "l"},
                     {"source": "osm", "text": "(c) OpenStreetMap contributors", "url": "https://x", "licence": "ODbL 1.0"}],
         "fetched_at": "2026-10-10T08:00:00Z", "source_urls": ["https://x"]}
    if mutate: mutate(m)
    (folder / "manifest.json").write_text(json.dumps(m))
    return ad

def _with_aerial(tmp_path, ad):
    data = facts(tmp_path, [F1, Q1, F4]); content = chapter(tmp_path, GOOD)
    (content / "coords.snapshot.json").write_text(json.dumps(GRAZ_SNAPSHOT))
    (content / "journey.json").write_text(json.dumps({"stops": [STOP]}))
    return cc.check("tst", content, data, aerial_dir=ad)

def test_aerial_stack_must_exist_and_be_well_formed(tmp_path):
    ok = tmp_path / "ok"; ok.mkdir()
    assert _with_aerial(ok, _aerial(ok)) == []
    missing = tmp_path / "missing"; missing.mkdir()
    assert any("aerial graz" in e and "manifest" in e for e in _with_aerial(missing, missing / "none"))

def test_aerial_manifest_rules(tmp_path):
    cases = {
        "five levels": lambda m: m["levels"].pop(),
        "four levels (before the regional ones)": lambda m: m.update(levels=m["levels"][2:]),
        "extents grow": lambda m: m["levels"][1].update(extent_m=400000),
        "extent not metres": lambda m: m["levels"][0].update(extent_m="300 km"),
        "no labels": lambda m: m["levels"][5].pop("labels"),
        "no precision": lambda m: m.pop("precision"),
        "unknown precision": lambda m: m.update(precision="street"),
        "building claimed for a city place": lambda m: m.update(precision="building"),
        "credit url javascript": lambda m: m["credits"][0].update(url="javascript:alert(1)"),
        "credit url relative": lambda m: m["credits"][1].update(url="/terms"),
        "missing file": lambda m: m["levels"][1].update(file="9.webp"),
        "not webp": lambda m: m["levels"][1].update(file="manifest.json"),
        "centre elsewhere": lambda m: m.update(centre={"lat": 48.0, "lon": 9.0}),
        "no credits": lambda m: m.update(credits=[]),
        "credit without licence": lambda m: m["credits"][0].pop("licence"),
        "no osm credit": lambda m: m.update(credits=m["credits"][:1]),
        "no fetched_at": lambda m: m.pop("fetched_at"),
        "no source urls": lambda m: m.update(source_urls=[]),
    }
    for name, mut in cases.items():
        d = tmp_path / name.replace(" ", "-"); d.mkdir()
        errs = _with_aerial(d, _aerial(d, mut))
        assert any("aerial graz" in e for e in errs), (name, errs)

def test_aerial_stack_over_budget_fails(tmp_path):
    errs = _with_aerial(tmp_path, _aerial(tmp_path, extra_bytes=1_500_000))
    assert any("aerial graz" in e and "budget" in e for e in errs)

def test_aerial_shared_stack_paths_resolve_into_the_owners_folder(tmp_path):
    ad = _aerial(tmp_path)
    shared = ad / "graz"
    owner = ad / "owner"; shared.rename(owner)
    m = json.loads((owner / "manifest.json").read_text())
    for lv in m["levels"]:
        for k in ("file", "labels"):
            if k in lv: lv[k] = "../owner/" + lv[k]
    (ad / "graz").mkdir(); (ad / "graz" / "manifest.json").write_text(json.dumps(m))
    assert _with_aerial(tmp_path, ad) == []

def test_aerial_files_must_stay_inside_the_aerial_folder(tmp_path):
    ad = _aerial(tmp_path)
    (tmp_path / "outside.webp").write_bytes(b"x" * 1000)  # an existing .webp, but outside aerial_dir
    m = json.loads((ad / "graz" / "manifest.json").read_text())
    m["levels"][1]["file"] = "../../outside.webp"
    (ad / "graz" / "manifest.json").write_text(json.dumps(m))
    errs = _with_aerial(tmp_path, ad)
    assert any("aerial graz" in e and "outside" in e for e in errs), errs

def test_aerial_declared_stack_must_name_an_existing_sibling_folder(tmp_path):
    for name, stack in {"missing": "nowhere", "not-a-name": "../graz", "empty": ""}.items():
        d = tmp_path / name; d.mkdir()
        errs = _with_aerial(d, _aerial(d, lambda m: m.update(stack=stack)))
        assert any("aerial graz" in e and "stack" in e for e in errs), (name, errs)
    ok = tmp_path / "ok"; ok.mkdir()
    ad = _aerial(ok); (ad / "owner").mkdir()
    m = json.loads((ad / "graz" / "manifest.json").read_text()); m["stack"] = "owner"
    (ad / "graz" / "manifest.json").write_text(json.dumps(m))
    assert _with_aerial(ok, ad) == []


# Zoom depth follows what the verified fact names (fix round 1): "building" only when a verified
# cited fact's place names a street address AND the stop cites a building-precise source, an
# OpenStreetMap node or way with a committed snapshot entry; everything else is "city".
ELM_SNAPSHOT = {"entities": {"way/123": {"osm": "way/123", "lat": 47.071, "lon": 15.441, "retrieved_at": "2026-10-10T00:00:00Z",
                                         "api_url": "https://api.openstreetmap.org/api/0.6/way/123/full.json"}}}
ELM = {"id": "elm", "label": "9 Elm Road, Graz", "place": "9 Elm Road", "fact_ids": ["TST-F-0005"],
       "lines": [{"text": "Test Person had a workshop at 9 Elm Road, Graz.", "fact_ids": ["TST-F-0005"]}],
       "map": {"x": 700, "y": 300, "lat": 47.071, "lon": 15.441, "coord_source": "https://www.openstreetmap.org/way/123"}}

def test_osm_way_or_node_is_an_accepted_coordinate_source(tmp_path):
    rows = [F1, Q1, F4, F5]
    ok = tmp_path / "ok"; ok.mkdir()
    assert _extra(ok, journey={"stops": [ELM]}, rows=rows, coords=ELM_SNAPSHOT) == []
    far = tmp_path / "far"; far.mkdir()
    errs = _extra(far, journey={"stops": [dict(ELM, map=dict(ELM["map"], lat=47.09))]}, rows=rows, coords=ELM_SNAPSHOT)
    assert any("way/123" in e and "published coordinates" in e for e in errs), errs
    none = tmp_path / "none"; none.mkdir()
    errs = _extra(none, journey={"stops": [dict(ELM, map=dict(ELM["map"], coord_source="https://www.openstreetmap.org/node/7"))]},
                  rows=rows, coords=ELM_SNAPSHOT)
    assert any("no entry for node/7" in e for e in errs), errs
    renamed = tmp_path / "renamed"; renamed.mkdir()
    bad = {"entities": {"way/123": dict(ELM_SNAPSHOT["entities"]["way/123"], osm="way/999")}}
    assert any("way/999" in e for e in _extra(renamed, journey={"stops": [ELM]}, rows=rows, coords=bad))
    rel = tmp_path / "relation"; rel.mkdir()
    errs = _extra(rel, journey={"stops": [dict(ELM, map=dict(ELM["map"], coord_source="https://www.openstreetmap.org/relation/1"))]},
                  rows=rows, coords=ELM_SNAPSHOT)
    assert any("coord_source" in e for e in errs), errs

def test_precision_is_derived_from_the_verified_place_and_the_coordinate_source():
    facts = {"TST-F-0004": F4, "TST-F-0005": F5}
    vf = lambda fid: facts.get(fid)
    snap = dict(ELM_SNAPSHOT["entities"], **GRAZ_SNAPSHOT["entities"])
    assert cc.aerial_precision(ELM, vf, snap) == "building"
    # The address alone is not enough: a Wikidata (town) coordinate keeps it at city level.
    assert cc.aerial_precision(dict(ELM, map=dict(ELM["map"], coord_source="https://www.wikidata.org/wiki/Q13298")), vf, snap) == "city"
    # An OSM way without an address in the verified place is city level too.
    assert cc.aerial_precision(dict(STOP, map=dict(STOP["map"], coord_source="https://www.openstreetmap.org/way/123")), vf, snap) == "city"
    # The fact must be verified, and the OSM source must have a snapshot entry.
    assert cc.aerial_precision(ELM, lambda fid: None, snap) == "city"
    assert cc.aerial_precision(ELM, vf, GRAZ_SNAPSHOT["entities"]) == "city"
    for place in ("112 Mercer Street, Princeton", "Kramgasse 49, Bern", "1600 Pennsylvania Avenue"):
        assert cc.names_street_address(place), place
    for place in ("Princeton, N.J.", "Ulm, Germany", "Berne", "Washington, D.C.", "San Diego, 1930"):
        assert not cc.names_street_address(place), place

def test_aerial_stack_of_a_building_precise_stop_must_say_building(tmp_path):
    rows = [F1, Q1, F4, F5]
    def run(d, precision):
        ad = _aerial(d, lambda m: m.update(precision=precision, centre={"lat": 47.071, "lon": 15.441},
                                           coord_source="https://www.openstreetmap.org/way/123"), folder_name="elm")
        data = facts(d, rows); content = chapter(d, GOOD)
        (content / "coords.snapshot.json").write_text(json.dumps(ELM_SNAPSHOT))
        (content / "journey.json").write_text(json.dumps({"stops": [ELM]}))
        return cc.check("tst", content, data, aerial_dir=ad)
    ok = tmp_path / "ok"; ok.mkdir()
    assert run(ok, "building") == []
    bad = tmp_path / "bad"; bad.mkdir()
    assert any("aerial elm" in e and "precision" in e for e in run(bad, "city"))

# A chapter title names a place and a date only as ONE cited fact states them, the rule journey stop
# labels follow: a title pooled from two facts (a place from one, a year from another) fails.
def test_chapter_title_from_one_fact(tmp_path):
    rows = [F1, Q1, F4, F6]
    errs = _run(tmp_path, lambda c: c.update(title="Boston, 1940", title_fact_ids=["TST-F-0001", "TST-F-0006"]), rows=rows)
    assert any("tst-1 title" in e and "one fact" in e for e in errs), errs
    d = tmp_path / "one"; d.mkdir()
    assert _run(d, lambda c: c.update(title="Boston, 1933", title_fact_ids=["TST-F-0001", "TST-F-0006"]), rows=rows) == []

# An exhibit note describes the item on show: each fact it cites must come from the item's own record,
# i.e. one of the fact's evidence sources is one of the media record's source_ids (of media_id or
# original_media_id). A fact from another record (an event the photo is not documented to show) fails.
def test_exhibit_note_facts_come_from_the_items_own_record(tmp_path):
    linked = dict(F1, evidence=[{"source_id": "TST-S-0001", "quote": "q", "locator": "l"}])
    other = dict(F6, evidence=[{"source_id": "TST-S-0002", "quote": "q", "locator": "l"}])
    rows = [linked, Q1, other]
    note = lambda fid, text: (lambda c: c["exhibits"][0].update(notes=[{"text": text, "fact_ids": [fid]}]))
    assert _run(tmp_path, note("TST-F-0001", "Test Person arrived in Boston in 1933."), rows=rows) == []
    d = tmp_path / "unlinked"; d.mkdir()
    errs = _run(d, note("TST-F-0006", "Test Person became a citizen in 1940."), rows=rows)
    assert any("exhibit ex1 note 0" in e and "TST-F-0006" in e and "record" in e for e in errs), errs

# A photograph's date shown with an exhibit is the holder's own wording, copied from the media record
# (its title or alt text), never a date we supply: holder_date must appear there verbatim.
def test_holder_date_is_the_media_records_own_wording(tmp_path):
    media = factories.world()["media"]
    rec = dict(media[0], alt_text="A photograph of the port, between 1931 and 1933.")
    rec["verified_claim_sha256"] = gates.media_lock_sha256(rec)
    ok = lambda c: c["exhibits"][0].update(holder_date="between 1931 and 1933")
    assert not any("holder_date" in e for e in _run(tmp_path, ok, media=[rec]))
    for i, bad in enumerate(["1932", "between 1930 and 1933", "", 5]):
        d = tmp_path / f"bad{i}"; d.mkdir()
        errs = _run(d, lambda c, b=bad: c["exhibits"][0].update(holder_date=b), media=[rec])
        assert any("exhibit ex1 holder_date" in e for e in errs), (bad, errs)

# An exhibit's title is the holding archive's own title for the item (the media record's title,
# verbatim, optionally cut at a whole trailing segment), OR it cites facts that each come from the
# item's own record (the note rule). A title that is neither names an event the item is not
# documented to show.
def _title_world(tmp_path, fid, title, media_title=None, rows=None):
    other = dict(F6, evidence=[{"source_id": "TST-S-0002", "quote": "q", "locator": "l"}])
    linked = dict(F1, evidence=[{"source_id": "TST-S-0001", "quote": "q", "locator": "l"}])
    def m(c):
        c["exhibits"][0].update(title=title, title_fact_ids=[fid])
    return _run(tmp_path, m, rows=rows or [linked, Q1, other])

def _title_errors(errs):
    return [e for e in errs if "exhibit ex1 title" in e]

def test_exhibit_title_from_a_linked_fact_passes(tmp_path):
    assert _title_errors(_title_world(tmp_path, "TST-F-0001", "Arrived in Boston")) == []

def test_exhibit_title_from_an_unlinked_fact_fails(tmp_path):
    errs = _title_errors(_title_world(tmp_path, "TST-F-0006", "Became a citizen in 1940"))
    assert any("TST-F-0006" in e and "record" in e for e in errs), errs

def test_exhibit_title_equal_to_the_holders_title_is_never_blocked(tmp_path):
    other = dict(F1, evidence=[{"source_id": "TST-S-0002", "quote": "q", "locator": "l"}])
    media = [_m(title="Arrived in Boston, 1933")]
    for i, t in enumerate(["Arrived in Boston, 1933", "Arrived in Boston"]):
        d = tmp_path / str(i); d.mkdir()
        errs = _run(d, lambda c, t=t: c["exhibits"][0].update(title=t), rows=[other, Q1], media=media)
        assert not any("does not come from" in e for e in errs), (t, errs)

def test_exhibit_title_only_trims_whole_trailing_segments(tmp_path):
    other = dict(F1, evidence=[{"source_id": "TST-S-0002", "quote": "q", "locator": "l"}])
    media = [_m(title="Arrived in Boston, 1933")]
    errs = _run(tmp_path, lambda c: c["exhibits"][0].update(title="Arrived in Bos"), rows=[other, Q1], media=media)
    assert any("exhibit ex1 title" in e and "does not come from" in e for e in errs), errs

# Optional viewing stations (site/src/museum/stationcam.js): { id, position, look, pitch?, lookAround? },
# inside the room; an exhibit's `station` names one of them.
GALLERY_ROOM = {"w": 8, "d": 12, "h": 4.5}  # layout.js ROOM_TYPES['chapter-gallery']

def test_valid_stations_pass():
    st = [{"id": "close", "position": [0, 1.6, -3], "look": [0, 1.6, -6], "pitch": [-20, 20], "lookAround": False}]
    assert cc.validate_stations(st, [{"id": "ex1", "station": "close"}], GALLERY_ROOM) == []
    assert cc.validate_stations(None, [{"id": "ex1"}], GALLERY_ROOM) == []

def test_station_shape_errors():
    errs = cc.validate_stations([
        {"id": "a", "position": [0, 1.6], "look": [0, 1.6, -6]},
        {"id": "a", "position": [0, 1.6, 0], "look": [0, 1.6, 0]},
        {"id": "", "position": [0, 1.6, 0], "look": ["x", 1, 1]},
        {"id": "p", "position": [0, 1.6, 0], "look": [0, 1.6, -6], "pitch": [30, -30]},
        {"id": "q", "position": [0, 1.6, 0], "look": [0, 1.6, -6], "pitch": [-95, 10]},
        {"id": "r", "position": [0, 1.6, 0], "look": [0, 1.6, -6], "lookAround": "yes"},
        {"id": "s", "position": [9, 1.6, 0], "look": [0, 1.6, -6]},
        {"id": "t", "position": [0, 1.6, 0], "look": [0, 1.6, -6], "zoom": 2},
    ], [{"id": "ex1", "station": "nowhere"}], GALLERY_ROOM)
    text = "\n".join(errs)
    for frag in ["station a: position must be [x, y, z]", "station a: duplicate id", "station 2: id must be a non-empty string",
                 "station 2: look must be [x, y, z]", "look must differ from position", "station p: pitch must be [min, max]",
                 "station q: pitch must be [min, max]", "station r: lookAround must be true or false", "station s: position outside the room",
                 "station t: unknown field zoom", "exhibit ex1: station nowhere is not a station"]:
        assert frag in text, frag

def test_stations_checked_in_chapter(tmp_path):
    data = facts(tmp_path, [F1, Q1])
    bad = json.loads(json.dumps(GOOD))
    bad["stations"] = [{"id": "s1", "position": [0, 1.6, 20], "look": [0, 1.6, -6]}]
    bad["exhibits"][0]["station"] = "s2"
    errs = cc.check("tst", chapter(tmp_path, bad), data)
    assert any("tst-1 station s1: position outside the room" in e for e in errs)
    assert any("tst-1 exhibit ex1: station s2 is not a station" in e for e in errs)

# Home page lines (content/home.json; real-scan museum Task 7 fix round 1): one verified fact per
# inductee, shown on the home page as the fact's claim word for word. `content_check.py --home`
# (run by the site prebuild) checks every entry: a known inductee, listed once; the fact exists in
# that inductee's own facts.jsonl with that inductee's code; it is verified; the text equals the claim.
def home(tmp, lines):
    c = tmp / "content"; c.mkdir(parents=True, exist_ok=True)
    (c / "home.json").write_text(json.dumps({"lines": lines}))
    return c / "home.json"

H1 = {"slug": "tst", "fact_id": "TST-F-0001", "text": F1["claim"]}

def test_home_good_line_passes(tmp_path):
    data = facts(tmp_path, [F1, Q1])
    assert cc.check_home(home(tmp_path, [H1]), data) == []

def test_home_unknown_fact_fails(tmp_path):
    data = facts(tmp_path, [F1, Q1])
    errs = cc.check_home(home(tmp_path, [dict(H1, fact_id="TST-F-0099", text="x")]), data)
    assert any("TST-F-0099" in e and "unknown" in e for e in errs)

def test_home_unverified_fact_fails(tmp_path):
    data = facts(tmp_path, [dict(F1, status="disputed"), Q1])
    assert any("TST-F-0001" in e and "verified" in e for e in cc.check_home(home(tmp_path, [H1]), data))

def test_home_fact_of_another_inductee_fails(tmp_path):
    data = facts(tmp_path, [F1, Q1])
    errs = cc.check_home(home(tmp_path, [dict(H1, fact_id="EIN-F-0001")]), data)
    assert any("EIN-F-0001" in e and "tst" in e for e in errs)

def test_home_unknown_inductee_fails(tmp_path):
    data = facts(tmp_path, [F1, Q1])
    assert any("nobody" in e for e in cc.check_home(home(tmp_path, [dict(H1, slug="nobody")]), data))

def test_home_text_must_be_the_claim_verbatim(tmp_path):
    data = facts(tmp_path, [F1, Q1])
    errs = cc.check_home(home(tmp_path, [dict(H1, text="Test Person proudly arrived in Boston in 1933.")]), data)
    assert any("verbatim" in e for e in errs)
    assert cc.check_home(home(tmp_path, [dict(H1, text=F1["claim"] + " ")]), data) != []

def test_home_slug_listed_once(tmp_path):
    data = facts(tmp_path, [F1, Q1])
    assert any("more than once" in e for e in cc.check_home(home(tmp_path, [H1, H1]), data))

def test_home_cli(tmp_path):
    data = facts(tmp_path, [F1, Q1]); h = home(tmp_path, [H1])
    assert cc.main(["--home", "--content", str(h.parent), "--data", str(data)]) == 0
    home(tmp_path, [dict(H1, text="wrong")])
    assert cc.main(["--home", "--content", str(h.parent), "--data", str(data)]) == 1

def test_shipped_home_lines_pass():
    root = Path(__file__).resolve().parents[2]
    assert cc.check_home(root / "content" / "home.json", root / "data") == []

# --- scanned rooms: artwork clearance (content/scans/*.json, Task 2) --------------------------------
# A room ships only if every artwork visible in it is cleared (artist died at least 71 years before the
# current year, or the work is dated at least 191 years back, with the museum's record) or cropped out
# of the shipped bundles at build time. A room that cannot be cleared is marked unusable and ships no
# bundle at all.
import hashlib as _hashlib

YEAR = 2026
CAT = "https://samlingar.shm.se/object/77FFF9F5-31A0-42BF-B0AF-A451B5FA8703"
WD = "https://www.wikidata.org/wiki/Q551624"
CLEARED = {"label": "Equestrian portrait", "artist": "Joachim von Sandrart", "died": 1688, "died_source": WD,
           "dated": 1650, "status": "cleared", "evidence_url": CAT}
BOX = {"id": "portrait-1961", "min": [6.7, 3.9, 5.7], "max": [7.4, 5.2, 6.8]}
CROPPED = {"label": "Portrait painted 1961", "artist": "Kurt Jungstedt", "died": 1963, "died_source": WD,
           "dated": 1961, "status": "cropped", "crop": "portrait-1961", "evidence_url": CAT}

SRC_SHA = "ab" * 32  # the room's (fictional) pinned source

def scan_room(tmp, artworks, crops=(), applied=None, usable=True, ship=True, stale_crops=False, sizes=None, mutate=None):
    """A complete content/scans/room.json manifest (attribution, licence, inventory review record) plus
    shipped bundle files under content-hashed names whose sha256 the manifest records, built (as the
    build records it) with `crops` applied: crops_sha256 and per-crop face counts. sizes: {part: bytes}
    overrides a shipped file's size; mutate(m) edits the manifest before it is written."""
    import build_scans
    public = tmp / "public"; scans = tmp / "content" / "scans"; scans.mkdir(parents=True, exist_ok=True)
    crops = [dict(c) for c in crops]
    # a stale build: the same box ids, applied with the corners an earlier crop list had
    built_with = [dict(c, min=[v - 0.5 for v in c["min"]]) for c in crops] if stale_crops else crops
    m = {"id": "room", "title": "A Room", "place": "A Room, A Museum", "publisher": "A Museum",
         "sketchfab_url": "https://sketchfab.com/3d-models/a-room-0123", "licence": build_scans.LICENCE,
         "licence_url": build_scans.LICENCE_URL, "credit": "A Room by A Museum, CC BY 4.0.",
         "credit_source": "the model page", "changes": build_scans.changes_for(crops), "source_sha256": SRC_SHA,
         "artworks": artworks, "crops": crops, "stations": [],
         "inventory_reviewed": {"source_sha256": SRC_SHA, "date": "2026-10-13", "count": len(artworks),
                                "artworks_sha256": build_scans.inventory_sha256(artworks),
                                "evidence": "docs/research/direction/B11-artwork-clearance.md"}}
    if not artworks:
        m.update(art_free=True, art_free_reason="an empty room: bare walls and floor")
    if not usable:
        m.update(usable=False, unusable_reason="a ceiling painting by an artist who died in 1958 covers the room")
    if ship:
        def rec(name, stem):
            data = name.encode() * ((sizes or {}).get(name, 10 * len(name)) // len(name))
            sha = _hashlib.sha256(data).hexdigest()
            rel = f"scans/room/{stem}.{sha[:8]}.glb"
            p = public / rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(data)
            return {"file": rel, "bytes": len(data), "sha256": sha}
        m["bundles"] = {d: dict(rec(d, f"{d}/room"), gpu_bytes=1000, tris=100, texture_px=512, crops_sha256=cc.crops_sha256(built_with),
                                crops_applied=applied if applied is not None else {c["id"]: {"faces": 120} for c in built_with})
                        for d in ("phone", "desktop")}
        m["occluder"] = dict(rec("occluder", "occluder"), tris=100)
        m["preview"] = dict(rec("preview", "preview/room"), gpu_bytes=1000, tris=100, texture_px=512, crops_sha256=cc.crops_sha256(built_with))
    if mutate: mutate(m)
    (scans / "room.json").write_text(json.dumps(m))
    return tmp / "content", public

def scan_errors(tmp, *a, **kw):
    return cc.check_scans(*scan_room(tmp, *a, **kw), year=YEAR)

def test_scan_cleared_artwork_passes(tmp_path):
    assert scan_errors(tmp_path, [CLEARED]) == []

def test_scan_blocked_artwork_fails(tmp_path):
    errs = scan_errors(tmp_path, [CLEARED, dict(CLEARED, status="blocked", label="Unknown portrait")])
    assert any("Unknown portrait" in e and "blocked" in e for e in errs)

def test_scan_unknown_death_date_fails(tmp_path):
    errs = scan_errors(tmp_path, [dict(CLEARED, died=None, died_source=None, dated=None)])
    assert any("death year" in e for e in errs)
    # an unknown artist is never cleared on the death-year route
    assert scan_errors(tmp_path, [dict(CLEARED, artist=None, dated=None)]) != []

def test_scan_death_year_boundary_is_life_plus_70(tmp_path):
    ok = dict(CLEARED, died=YEAR - 71, dated=None)
    assert scan_errors(tmp_path, [ok]) == []
    errs = scan_errors(tmp_path, [dict(ok, died=YEAR - 70)])
    assert any("in copyright" in e for e in errs)

def test_scan_known_recent_death_is_not_rescued_by_an_old_date(tmp_path):
    assert scan_errors(tmp_path, [dict(CLEARED, died=1963, dated=1700)]) != []

def test_scan_cleared_needs_catalogue_and_death_evidence(tmp_path):
    assert any("evidence_url" in e for e in scan_errors(tmp_path, [dict(CLEARED, evidence_url=None)]))
    assert any("evidence_url" in e for e in scan_errors(tmp_path, [dict(CLEARED, evidence_url="http://x.org/1")]))
    assert any("died_source" in e for e in scan_errors(tmp_path, [dict(CLEARED, dated=None, died_source=None)]))

def test_scan_unattributed_work_clears_only_when_dated_191_years_back(tmp_path):
    anon = {"label": "Bust of a king", "artist": None, "died": None, "died_source": None, "dated": YEAR - 191,
            "status": "cleared", "evidence_url": CAT}
    assert scan_errors(tmp_path, [anon]) == []
    errs = scan_errors(tmp_path, [dict(anon, dated=YEAR - 190)])
    assert any("dated" in e for e in errs)
    assert scan_errors(tmp_path, [dict(anon, evidence_url=None)]) != []
    assert scan_errors(tmp_path, [dict(anon, dated="1600s")]) != []

def test_scan_cropped_artwork_passes_only_with_its_crop_box_applied(tmp_path):
    assert scan_errors(tmp_path / "a", [CLEARED, CROPPED], crops=[BOX]) == []
    # no crop box listed for it
    errs = scan_errors(tmp_path / "b", [CROPPED])
    assert any("portrait-1961" in e for e in errs)
    # listed, but the shipped bundles were built without it
    errs = scan_errors(tmp_path / "c", [CROPPED], crops=[BOX], stale_crops=True)
    assert any("not built with the current crop list" in e for e in errs)
    assert any("preview" in e and "current crop list" in e for e in errs)
    # listed and hashed, but the build masked nothing inside the box
    errs = scan_errors(tmp_path / "d", [CROPPED], crops=[BOX], applied={"portrait-1961": {"faces": 0}})
    assert any("portrait-1961" in e and "nothing" in e for e in errs)

def test_scan_crop_box_must_be_a_box(tmp_path):
    bad = dict(BOX, max=[6.0, 5.2, 6.8])
    assert scan_errors(tmp_path, [CROPPED], crops=[bad]) != []

def test_scan_crop_box_may_be_turned_about_the_vertical(tmp_path):
    # Task 3 fix round 1: boxes carried into a squared room frame keep their turn as rot_y_deg.
    assert scan_errors(tmp_path / "a", [CLEARED, CROPPED], crops=[dict(BOX, rot_y_deg=27.4)]) == []
    for bad in (200, "27", None):
        assert any("rot_y_deg" in e for e in scan_errors(tmp_path / f"b{bad}", [CLEARED, CROPPED], crops=[dict(BOX, rot_y_deg=bad)]))

def test_scan_every_crop_box_is_documented_by_an_artwork(tmp_path):
    errs = scan_errors(tmp_path, [CLEARED], crops=[BOX])
    assert any("portrait-1961" in e for e in errs)

def test_scan_shipped_bundle_must_match_its_recorded_hash(tmp_path):
    content, public = scan_room(tmp_path, [CLEARED])
    m = json.loads((content / "scans" / "room.json").read_text())
    (public / m["bundles"]["phone"]["file"]).write_bytes(b"changed after the crop")
    assert cc.check_scans(content, public, year=YEAR) != []

def test_scan_unusable_room_ships_no_bundle(tmp_path):
    blocked = dict(CLEARED, status="blocked")
    assert scan_errors(tmp_path / "a", [blocked], usable=False, ship=False) == []
    errs = scan_errors(tmp_path / "b", [blocked], usable=False, ship=True)
    assert any("unusable" in e for e in errs)
    content, public = scan_room(tmp_path / "c", [blocked], usable=False, ship=False)
    m = json.loads((content / "scans" / "room.json").read_text()); m["unusable_reason"] = ""
    (content / "scans" / "room.json").write_text(json.dumps(m))
    assert any("unusable_reason" in e for e in cc.check_scans(content, public, year=YEAR))

def test_scan_unknown_status_fails(tmp_path):
    assert scan_errors(tmp_path, [dict(CLEARED, status="maybe")]) != []

def test_scans_cli(tmp_path):
    content, public = scan_room(tmp_path, [CLEARED])
    assert cc.main(["--scans", "--content", str(content), "--public", str(public)]) == 0
    scan_room(tmp_path, [dict(CLEARED, status="blocked")])
    assert cc.main(["--scans", "--content", str(content), "--public", str(public)]) == 1

# --- Codex pre-deploy gate (2026-10-14): the production gate is the complete validator --------------
# Rule: the build gate (content_check --scans, run by npm prebuild) checks a scanned room with the same
# complete validator as tools/build_scans.py --check (schema, attribution, licence, content-hashed file
# names, combined room download), never a subset of it. Tested through the gate's entry points.

def _gate(content, public):
    return cc.check_scans(content, public, year=YEAR), cc.main(["--scans", "--content", str(content), "--public", str(public)])

def test_gate_rejects_an_over_budget_phone_room(tmp_path):
    # each file within its own limit, the phone room download (preview + bundle + occluder) over 5 MB
    content, public = scan_room(tmp_path, [CLEARED], sizes={"phone": 4_700_000, "preview": 390_000, "occluder": 300_000})
    errs, code = _gate(content, public)
    assert code == 1 and any("phone" in e and "budget" in e for e in errs), errs

def test_gate_rejects_an_unhashed_shipped_name(tmp_path):
    def unhashed(m):
        old = m["bundles"]["phone"]["file"]; m["bundles"]["phone"]["file"] = "scans/room/phone/room.glb"
        (tmp_path / "public" / old).rename(tmp_path / "public" / "scans/room/phone/room.glb")
    content, public = scan_room(tmp_path, [CLEARED], mutate=unhashed)
    errs, code = _gate(content, public)
    assert code == 1 and any("bundles.phone.file" in e for e in errs), errs

@pytest.mark.parametrize("field", ["credit", "credit_source", "changes", "title", "publisher"])
def test_gate_rejects_blank_attribution(tmp_path, field):
    content, public = scan_room(tmp_path, [CLEARED], mutate=lambda m: m.update({field: "  "}))
    errs, code = _gate(content, public)
    assert code == 1 and any(field in e for e in errs), errs

def test_gate_rejects_a_non_cc_by_licence(tmp_path):
    content, public = scan_room(tmp_path, [CLEARED], mutate=lambda m: m.update(licence="CC BY-NC 4.0"))
    assert _gate(content, public)[1] == 1

# Rule: an artwork inventory is evidence only as a reviewed record of THIS source: the manifest records
# inventory_reviewed {source_sha256, date, count, evidence}, tied to the pinned source; an inventory that
# no longer matches its review (an entry deleted, a new source) fails; an empty one needs an explicit
# art_free: true with a reason.

def test_gate_rejects_an_inventory_with_an_entry_deleted_after_review(tmp_path):
    content, public = scan_room(tmp_path, [CLEARED, dict(CLEARED, label="Second portrait")],
                                mutate=lambda m: m["artworks"].pop())
    errs, code = _gate(content, public)
    assert code == 1 and any("inventory" in e and "count" in e for e in errs), errs

def test_gate_rejects_an_emptied_inventory(tmp_path):
    # the Codex reproduction: artworks replaced with [] while the bundles are unchanged
    content, public = scan_room(tmp_path, [CLEARED], mutate=lambda m: m.update(artworks=[]))
    errs, code = _gate(content, public)
    assert code == 1 and any("art_free" in e for e in errs), errs

def test_gate_rejects_an_inventory_without_a_review_record(tmp_path):
    content, public = scan_room(tmp_path, [CLEARED], mutate=lambda m: m.pop("inventory_reviewed"))
    errs, code = _gate(content, public)
    assert code == 1 and any("inventory_reviewed" in e for e in errs), errs

# Codex gate round 2. Rule: the review binds the inventory's content, not only its size: a canonical
# digest of the whole artwork list (artworks_sha256) is recorded with the review.
def test_gate_rejects_an_entry_replaced_by_a_duplicate_of_another(tmp_path):
    two = [CLEARED, dict(CLEARED, label="Second portrait")]
    content, public = scan_room(tmp_path, two, mutate=lambda m: m["artworks"].__setitem__(1, dict(m["artworks"][0])))
    errs, code = _gate(content, public)
    assert code == 1 and any("artworks_sha256" in e for e in errs), errs

def test_gate_rejects_an_edited_entry_after_review(tmp_path):
    content, public = scan_room(tmp_path, [CLEARED], mutate=lambda m: m["artworks"][0].update(died=1650))
    errs, code = _gate(content, public)
    assert code == 1 and any("artworks_sha256" in e for e in errs), errs

def test_inventory_digest_is_canonical():
    import build_scans
    a, b = dict(CLEARED), dict(reversed(list(CLEARED.items())))
    assert build_scans.inventory_sha256([a]) == build_scans.inventory_sha256([b])  # key order does not matter
    assert build_scans.inventory_sha256([a, dict(a, label="x")]) == build_scans.inventory_sha256([dict(a, label="x"), a])  # nor list order
    assert build_scans.inventory_sha256([a]) != build_scans.inventory_sha256([a, a])

def test_gate_rejects_a_review_of_another_source(tmp_path):
    content, public = scan_room(tmp_path, [CLEARED], mutate=lambda m: m["inventory_reviewed"].update(source_sha256="cd" * 32))
    errs, code = _gate(content, public)
    assert code == 1 and any("inventory_reviewed" in e and "source" in e for e in errs), errs

@pytest.mark.parametrize("bad", [{"date": "13 October"}, {"date": "2999-01-01"}, {"evidence": ""}, {"count": "1"}])
def test_gate_rejects_a_malformed_review_record(tmp_path, bad):
    content, public = scan_room(tmp_path, [CLEARED], mutate=lambda m: m["inventory_reviewed"].update(bad))
    assert _gate(content, public)[1] == 1

def test_an_art_free_room_passes_only_when_declared_with_a_reason(tmp_path):
    assert _gate(*scan_room(tmp_path / "a", []))[1] == 0
    content, public = scan_room(tmp_path / "b", [], mutate=lambda m: m.update(art_free_reason=""))
    assert _gate(content, public)[1] == 1
    # an inventory with artworks cannot also claim the room is art-free
    content, public = scan_room(tmp_path / "c", [CLEARED], mutate=lambda m: m.update(art_free=True, art_free_reason="x"))
    assert _gate(content, public)[1] == 1

# Rule: every file beneath site/public/scans and site/public/study (both cached a year as immutable) is
# named by a reviewed record (a usable scan manifest or a study-corner record), and its ACTUAL content
# hash matches both its name and that record.

def test_gate_rejects_an_unregistered_scan_folder(tmp_path):
    content, public = scan_room(tmp_path, [CLEARED])
    data = b"an unreviewed room"; sha = _hashlib.sha256(data).hexdigest()
    (public / "scans" / "other" / "phone").mkdir(parents=True)
    (public / "scans" / "other" / "phone" / f"room.{sha[:8]}.glb").write_bytes(data)
    errs, code = _gate(content, public)
    assert code == 1 and any("scans/other/phone" in e and "no reviewed record" in e for e in errs), errs

@pytest.mark.parametrize("name", ["notes.txt", ".DS_Store", "corner.deadbeef.ktx2"])
def test_gate_rejects_any_unrecorded_file_under_study(tmp_path, name):
    content, public = scan_room(tmp_path, [CLEARED])
    (public / "study" / "x").mkdir(parents=True); (public / "study" / "x" / name).write_bytes(b"x")
    errs, code = _gate(content, public)
    assert code == 1 and any(f"study/x/{name}" in e for e in errs), errs

def test_gate_verifies_a_recorded_files_actual_hash_against_its_name(tmp_path):
    # name and record agree with each other, the bytes do not: caught by the actual hash
    def lie(m):
        fake = "f" * 64
        old = m["occluder"]["file"]; new = f"scans/room/occluder.{fake[:8]}.glb"
        (tmp_path / "public" / old).rename(tmp_path / "public" / new)
        m["occluder"].update(file=new, sha256=fake)
    content, public = scan_room(tmp_path, [CLEARED], mutate=lie)
    errs, code = _gate(content, public)
    # the whole-root check hashes every shipped file itself (not only the files a room's check names)
    assert code == 1 and any(e.startswith("shipped: scans/room/occluder") and "actual sha256" in e for e in errs), errs

def test_gate_rejects_files_of_an_unusable_room(tmp_path):
    content, public = scan_room(tmp_path, [dict(CLEARED, status="blocked")], usable=False, ship=False)
    data = b"left behind"; sha = _hashlib.sha256(data).hexdigest()
    (public / "scans" / "room").mkdir(parents=True); (public / "scans" / "room" / f"occluder.{sha[:8]}.glb").write_bytes(data)
    assert _gate(content, public)[1] == 1

def test_shipped_scan_manifests_carry_their_inventory_review():
    root = Path(__file__).resolve().parents[2]
    for p in sorted((root / "content" / "scans").glob("*.json")):
        m = json.loads(p.read_text())
        r = m["inventory_reviewed"]
        assert r["source_sha256"] == m["source_sha256"] and r["count"] == len(m["artworks"]) > 0, p.name
        import build_scans
        assert r["artworks_sha256"] == build_scans.inventory_sha256(m["artworks"]), p.name
        assert r["evidence"] == "docs/research/direction/B11-artwork-clearance.md" and (root / r["evidence"]).exists()

def test_shipped_scans_are_cleared():
    root = Path(__file__).resolve().parents[2]
    assert cc.check_scans(root / "content", root / "site" / "public") == []


# --- scanned rooms in chapters and the hallway (real-scan museum Task 5) ---------------------------
# A chapter whose room is a scan: room = {scan, doors?, reserved?, stations?}; every exhibit stands on
# an easel {x, z, rotY, group?} on free floor inside the room; the scan must be usable and cleared.

def _scanned(tmp_path, mutate=None, artworks=None, usable=True):
    content, public = scan_room(tmp_path, artworks or [CLEARED], usable=usable, ship=usable)
    m = json.loads((content / "scans" / "room.json").read_text())
    m["transform"] = {"extent_m": [10.0, 8.0], "ceiling_m": 5.0}
    (content / "scans" / "room.json").write_text(json.dumps(m))
    ch = json.loads(json.dumps(GOOD))
    ch["room"] = {"scan": "room", "doors": {"entrance": {"x": -4.9, "z": -2.0, "rotY": 1.5708, "w": 1.3, "h": 2.7},
                                            "exit": {"x": 4.9, "z": -2.0, "rotY": -1.5708, "w": 1.3, "h": 2.7}}}
    ex = ch["exhibits"][0]; del ex["wall"]; del ex["slot"]
    ex["easel"] = {"x": 0.0, "z": 1.0, "rotY": 3.1416, "group": "centre"}
    if mutate: mutate(ch)
    data = facts(tmp_path, [F1, Q1]); chapter(tmp_path, ch)
    return cc.check("tst", content / "tst", data, public_dir=public)

def test_scanned_chapter_passes(tmp_path):
    assert _scanned(tmp_path) == []

def test_scanned_chapter_needs_a_usable_cleared_scan(tmp_path):
    errs = _scanned(tmp_path / "a", lambda c: c["room"].update(scan="nowhere"))
    assert any("room.scan nowhere" in e for e in errs)
    errs = _scanned(tmp_path / "b", artworks=[dict(CLEARED, status="blocked", label="Unknown portrait")])
    assert any("room.scan room" in e and "clearance" in e for e in errs)
    errs = _scanned(tmp_path / "c", artworks=[dict(CLEARED, status="blocked")], usable=False)
    assert any("room.scan room" in e and "not usable" in e for e in errs)

def test_scanned_chapter_carries_no_retired_reconstruction_block(tmp_path):
    # Fix round 1 (Task 6): a scanned room does not show its place, so a reconstructed-place record on
    # it is stale; a recreated corner has its own record (content/<slug>/study-corner.json).
    rec = {"basis_media_ids": ["TST-M-0001"], "place": {"w": 4, "d": 4, "h": 2.8, "items": []}}
    errs = _scanned(tmp_path, lambda c: c.update(reconstruction=rec))
    assert any("scanned room" in e and "reconstruction" in e and "study-corner.json" in e for e in errs), errs

def test_scanned_exhibits_stand_on_easels_not_walls(tmp_path):
    def wall(c):
        ex = c["exhibits"][0]; del ex["easel"]; ex.update(wall="north", slot=1)
    assert any("easel" in e for e in _scanned(tmp_path / "a", wall))
    assert any("easel" in e for e in _scanned(tmp_path / "b", lambda c: c["exhibits"][0]["easel"].update(x="1")))
    assert any("easel" in e and "field" in e for e in _scanned(tmp_path / "c", lambda c: c["exhibits"][0]["easel"].update(y=1)))

def test_easels_stand_inside_the_room_apart_and_clear_of_doors_and_reserved_areas(tmp_path):
    out = lambda c: c["exhibits"][0]["easel"].update(x=4.8)
    assert any("inside the room" in e for e in _scanned(tmp_path / "a", out))
    def two(c):
        c["exhibits"].append(dict(c["exhibits"][0], id="ex2", number=2, easel={"x": 0.5, "z": 1.0, "rotY": 0}))
    assert any("too close" in e for e in _scanned(tmp_path / "b", two))
    door = lambda c: c["exhibits"][0]["easel"].update(x=-4.0, z=-2.0)
    assert any("door" in e for e in _scanned(tmp_path / "c", door))
    res = lambda c: c["room"].update(reserved=[{"id": "study-corner", "min": [-1.0, 0.0], "max": [1.0, 2.0], "for": "Task 6 study corner"}])
    assert any("study-corner" in e for e in _scanned(tmp_path / "d", res))
    bad = lambda c: c["room"].update(reserved=[{"id": "x", "min": [1.0, 0.0], "max": [0.0, 2.0]}])
    assert any("reserved" in e for e in _scanned(tmp_path / "e", bad))

def test_scanned_room_doors_stand_at_a_wall_facing_in(tmp_path):
    mid = lambda c: c["room"]["doors"]["exit"].update(x=0.0, z=0.0)
    assert any("exit" in e and "wall" in e for e in _scanned(tmp_path / "a", mid))
    out = lambda c: c["room"]["doors"]["exit"].update(rotY=1.5708)
    assert any("exit" in e and "into the room" in e for e in _scanned(tmp_path / "b", out))
    tall = lambda c: c["room"]["doors"]["exit"].update(h=4.5)
    assert any("exit" in e and "h" in e for e in _scanned(tmp_path / "c", tall))
    assert any("doors" in e for e in _scanned(tmp_path / "d", lambda c: c["room"]["doors"].update(side={"x": 0})))

def test_scanned_room_stations_are_checked_against_the_scan_size(tmp_path):
    st = lambda c: c["room"].update(stations=[{"id": "s1", "position": [6.0, 1.6, 0.0], "look": [0, 1.5, 0]}])
    assert any("outside the room" in e for e in _scanned(tmp_path, st))

def test_unknown_room_fields_are_refused(tmp_path):
    assert any("unknown field" in e for e in _scanned(tmp_path, lambda c: c["room"].update(colour="red")))


def _hall(tmp_path, mutate=None, slugs=("tst", "abc")):
    content, public = scan_room(tmp_path, [CLEARED])
    m = json.loads((content / "scans" / "room.json").read_text())
    m["transform"] = {"extent_m": [10.0, 8.0], "ceiling_m": 5.0}
    (content / "scans" / "room.json").write_text(json.dumps(m))
    data = tmp_path / "data" / "inductees"
    for s in slugs:
        (data / s).mkdir(parents=True, exist_ok=True)
        (data / s / "inductee.json").write_text(json.dumps({"slug": s, "name": s.title(), "code": s[:3].upper()}))
    hall = {"scan": "room", "easels": [{"slug": s, "x": -2.0 + 2.0 * i, "z": 0.0, "rotY": 0.0, "group": "row"} for i, s in enumerate(slugs)]}
    if mutate: mutate(hall)
    (content / "hall.json").write_text(json.dumps(hall))
    return cc.check_hall(content / "hall.json", tmp_path / "data", public_dir=public)

def test_hall_passes(tmp_path):
    assert _hall(tmp_path) == []

def test_hall_has_one_easel_per_pipeline_inductee(tmp_path):
    assert any("abc" in e and "no easel" in e for e in _hall(tmp_path / "a", lambda h: h["easels"].pop()))
    assert any("zzz" in e for e in _hall(tmp_path / "b", lambda h: h["easels"][0].update(slug="zzz")))
    assert any("more than once" in e for e in _hall(tmp_path / "c", lambda h: h["easels"][1].update(slug="tst")))

def test_hall_easels_inside_the_room_and_apart(tmp_path):
    assert any("inside the room" in e for e in _hall(tmp_path / "a", lambda h: h["easels"][0].update(z=3.9)))
    assert any("too close" in e for e in _hall(tmp_path / "b", lambda h: h["easels"][1].update(x=-1.5)))

def test_hall_needs_a_usable_cleared_scan(tmp_path):
    assert any("scan nowhere" in e for e in _hall(tmp_path, lambda h: h.update(scan="nowhere")))

def test_hall_cli(tmp_path):
    _hall(tmp_path)
    content = tmp_path / "content"
    assert cc.main(["--hall", "--content", str(content), "--data", str(tmp_path / "data"), "--public", str(tmp_path / "public")]) == 0

def test_shipped_einstein_chapters_and_hall_pass():
    root = Path(__file__).resolve().parents[2]
    assert cc.check("einstein", root / "content" / "einstein", root / "data", public_dir=root / "site" / "public") == []
    assert cc.check_hall(root / "content" / "hall.json", root / "data", public_dir=root / "site" / "public") == []
    for n in range(1, 5):
        ch = json.loads((root / "content" / "einstein" / "chapters" / f"{n}.json").read_text())
        assert ch["room"]["scan"] == "hallwyl-great-drawing-room"  # one room style per inductee (2026-10-13)
    assert json.loads((root / "content" / "hall.json").read_text())["scan"] == "kings-hall"

def test_scanned_room_clearance_fails_closed_without_the_shipped_files(tmp_path):
    # Task 5 review: no public folder to check the scan's bundles and clearance against is an error,
    # never a pass.
    content, public = scan_room(tmp_path, [CLEARED])
    m = json.loads((content / "scans" / "room.json").read_text())
    m["transform"] = {"extent_m": [10.0, 8.0], "ceiling_m": 5.0}
    (content / "scans" / "room.json").write_text(json.dumps(m))
    ch = json.loads(json.dumps(GOOD)); ch["room"] = {"scan": "room"}
    ex = ch["exhibits"][0]; del ex["wall"]; del ex["slot"]; ex["easel"] = {"x": 0.0, "z": 1.0, "rotY": 0.0}
    data = facts(tmp_path, [F1, Q1]); chapter(tmp_path, ch)
    errs = cc.check("tst", content / "tst", data)
    assert any("room.scan room" in e and "cannot be checked" in e for e in errs)


# Task 6: the recreated study corner (content/<slug>/study-corner.json). Same declared-items rule as
# site/src/museum/reconstruction.js validateCorner (shared cases in fixtures/corner_cases.json).
CORNER_CASES = json.loads((Path(__file__).parent / "fixtures" / "corner_cases.json").read_text())

def _apply_corner_case(c):
    out = copy.deepcopy(CORNER_CASES["base"])
    def walk(path):
        o = out
        for k in path[:-1]:
            o = o[k]
        return o, path[-1]
    for path, value in c.get("set", []):
        o, k = walk(path); o[k] = copy.deepcopy(value)
    for path in c.get("delete", []):
        o, k = walk(path)
        if isinstance(o, list): o.pop(k)
        else: del o[k]
    return out

def test_corner_constants_match_shared_fixture():
    k = CORNER_CASES["constants"]
    assert cc.CORNER_KINDS == k["corner_kinds"]
    assert cc.SUB_KINDS == k["sub_kinds"]
    assert cc.LABEL_SIGN == k["label_sign"]
    assert cc.CORNER_LABEL_PREFIX == k["label_prefix"]

@pytest.mark.parametrize("case", CORNER_CASES["cases"], ids=[c["name"] for c in CORNER_CASES["cases"]])
def test_shared_corner_cases(case):
    errs = cc.validate_corner(_apply_corner_case(case), CORNER_CASES["area"])
    if case["match"] is None:
        assert errs == []
    else:
        assert case["match"] in "; ".join(errs)

def _shipped_corner():
    root = Path(__file__).resolve().parents[2]
    corner = json.loads((root / "content" / "einstein" / "study-corner.json").read_text())
    chapters = {int(p.stem): json.loads(p.read_text()) for p in (root / "content" / "einstein" / "chapters").glob("*.json")}
    media = {m["id"]: m for m in cc._jsonl(root / "data" / "inductees" / "einstein" / "media.jsonl")}
    return root, corner, chapters, media

def _corner_errors(corner, chapters=None, media=None):
    root, c0, ch0, m0 = _shipped_corner()
    return cc.check_study_corner(corner, chapters or ch0, media or m0, root / "site" / "public")

def test_shipped_study_corner_passes():
    _, corner, _, _ = _shipped_corner()
    assert _corner_errors(corner) == []

def test_corner_needs_a_passed_bought_kit_check():
    _, corner, _, _ = _shipped_corner()
    c = copy.deepcopy(corner); c["sources"][0]["kit_check"]["result"] = "fail"
    assert "kit check result is 'fail'" in "; ".join(_corner_errors(c))
    c = copy.deepcopy(corner); del c["sources"][0]["kit_check"]
    assert "needs a kit_check" in "; ".join(_corner_errors(c))
    c = copy.deepcopy(corner); c["sources"][0]["kit_check"]["checks"] = []
    assert "kit_check.checks must list what was checked" in "; ".join(_corner_errors(c))
    c = copy.deepcopy(corner); del c["sources"][0]["kit_check"]["reverse_image_search"]
    assert "kit_check.reverse_image_search" in "; ".join(_corner_errors(c))

def test_corner_needs_its_cc_by_licence_record():
    _, corner, _, _ = _shipped_corner()
    for field in ("credit", "changes", "licence_url", "url", "author", "title", "source_sha256"):
        c = copy.deepcopy(corner); del c["sources"][0][field]
        assert f"source renend: {field}" in "; ".join(_corner_errors(c)), field
    c = copy.deepcopy(corner); c["sources"][0]["credit"] = "Some furniture, CC BY 4.0."
    assert "credit must name the title and the author" in "; ".join(_corner_errors(c))
    c = copy.deepcopy(corner); c["sources"][0]["licence"] = "CC BY-NC 4.0"
    assert "licence must be one of" in "; ".join(_corner_errors(c))
    c = copy.deepcopy(corner); c["models"]["desk"]["source"] = "elsewhere"
    assert "model desk: source elsewhere is not in sources" in "; ".join(_corner_errors(c))

def test_corner_label_comes_from_the_basis_records():
    _, corner, _, _ = _shipped_corner()
    c = copy.deepcopy(corner); c["label"] = "Recreation based on photographs: National Archives 80-G-42918"
    assert "label does not name 80-G-42919" in "; ".join(_corner_errors(c))
    c = copy.deepcopy(corner); c["label"] = "Einstein's study"
    assert "label must start with" in "; ".join(_corner_errors(c))

def test_corner_must_stand_in_a_reserved_area_of_a_scanned_chapter():
    _, corner, chapters, _ = _shipped_corner()
    c = copy.deepcopy(corner); c["area"] = "elsewhere"
    assert "area elsewhere is not a reserved area of chapter 2" in "; ".join(_corner_errors(c))
    c = copy.deepcopy(corner); c["chapter"] = 9
    assert "chapter 9 is not a chapter" in "; ".join(_corner_errors(c))
    c = copy.deepcopy(corner); c["objects"][0]["x"] = 1.0
    assert "object bookcase: outside the area study-corner" in "; ".join(_corner_errors(c))

def test_corner_basis_photos_must_be_usable_and_shown_beside_it():
    _, corner, chapters, media = _shipped_corner()
    m = copy.deepcopy(media); m["EIN-M-0014"] = dict(m["EIN-M-0014"], status="pending")
    assert "media EIN-M-0014 not verified with a usable licence" in "; ".join(_corner_errors(corner, media=m))
    ch = copy.deepcopy(chapters)
    for ex in ch[2]["exhibits"]:
        if ex["media_id"] == "EIN-M-0014": ex["easel"]["group"] = "fireplace"
    assert "photo_group study must show basis photographs" in "; ".join(_corner_errors(corner, chapters=ch))
    ch = copy.deepcopy(chapters)
    for ex in ch[2]["exhibits"]:
        if ex["media_id"] == "EIN-M-0015": ex["easel"]["group"] = "study"
    assert "and only them" in "; ".join(_corner_errors(corner, chapters=ch))
    ch = copy.deepcopy(chapters)
    ch[2]["exhibits"] = [ex for ex in ch[2]["exhibits"] if ex["media_id"] != "EIN-M-0013"]
    assert "basis photograph EIN-M-0013 is not on show in chapter 2" in "; ".join(_corner_errors(corner, chapters=ch))

def test_corner_counts_inside_its_room_download(monkeypatch):
    # Fix round 1: no separate corner allowance. The chapter room's scan download (preview + bundle +
    # occluder) plus the corner fits the scanned-room budget on each device.
    import build_scans
    root, corner, _, _ = _shipped_corner()
    assert _corner_errors(corner) == []
    m = json.loads((root / "content" / "scans" / "hallwyl-great-drawing-room.json").read_text())
    for d in ("phone", "desktop"):
        assert m["downloads"][d] + corner["bundles"][d]["bytes"] <= build_scans.BUDGETS[d]
    tight = dict(build_scans.BUDGETS, phone=m["downloads"]["phone"] + corner["bundles"]["phone"]["bytes"] - 1)
    monkeypatch.setattr(build_scans, "BUDGETS", tight)
    assert any("room download" in e and "phone" in e for e in _corner_errors(corner))

def test_corner_bundles_are_checked():
    _, corner, _, _ = _shipped_corner()
    c = copy.deepcopy(corner); c["bundles"]["phone"]["sha256"] = "0" * 64
    assert "phone:" in "; ".join(_corner_errors(c))
    c = copy.deepcopy(corner); del c["bundles"]
    assert "no bundles" in "; ".join(_corner_errors(c))


# Owner review 4 (2026-10-14): a museum note in the narration. The study room tells the visitor that
# a corner of it is a recreation. It is a museum disclosure, not a historical claim: a line of kind
# "museum-note" that frames the study corner's area, cites the corner's basis photographs (media_ids)
# and verified facts, and whose words are grounded in those facts, those media records (title, alt
# text, credit), the corner's label and its fixed disclosures (CORNER_NOTE, CORNER_WHERE_LITE). Any
# other line is grounded in its facts alone; a museum-note line anywhere else is an error.
import shutil

MUSEUM_NOTE = ("In this room, a corner recreates Einstein's study at Princeton, N.J., "
               "as two 1943 National Archives photographs show it.")

def _content_copy(tmp_path, mutate):
    root = Path(__file__).resolve().parents[2]
    content = tmp_path / f"content{len(list(tmp_path.glob('content*')))}"
    shutil.copytree(root / "content", content, ignore=shutil.ignore_patterns("audio", "portrait"))
    chapters = {n: json.loads((content / "einstein" / "chapters" / f"{n}.json").read_text()) for n in range(1, 5)}
    mutate(chapters)
    for n, ch in chapters.items():
        (content / "einstein" / "chapters" / f"{n}.json").write_text(json.dumps(ch))
    return cc.check("einstein", content / "einstein", root / "data", public_dir=root / "site" / "public")

def _note(**kw):
    line = {"cue": "c99", "kind": "museum-note", "text": MUSEUM_NOTE, "fact_ids": ["EIN-F-0055"],
            "media_ids": ["EIN-M-0013", "EIN-M-0014"], "frames": "study-corner", "reveals": []}
    line.update(kw)
    return {k: v for k, v in line.items() if v is not None}

def _with_note(n=2, **kw):
    def mutate(chs):
        chs[n]["narration"] = [l for l in chs[n]["narration"] if l.get("kind") != "museum-note"] + [_note(**kw)]
    return mutate

def test_corner_disclosure_constants_mirror_the_site():
    k = CORNER_CASES["constants"]
    assert cc.CORNER_NOTE == k["corner_note"]
    assert cc.CORNER_WHERE_LITE == k["corner_where_lite"]

def test_museum_note_grounded_in_the_corner_records_passes(tmp_path):
    assert _content_copy(tmp_path, _with_note()) == []

def test_the_same_words_as_an_ordinary_line_fail(tmp_path):
    # Without the museum-note kind the line is a historical claim: its facts alone must carry it.
    errs = _content_copy(tmp_path, _with_note(kind=None, media_ids=None, frames=None))
    assert any("cue c99" in e and "'corner' not in" in e for e in errs), errs

def test_museum_note_words_are_checked(tmp_path):
    errs = _content_copy(tmp_path, _with_note(text=MUSEUM_NOTE.replace("1943", "1950")))
    assert any("cue c99" in e and "1950" in e for e in errs), errs
    errs = _content_copy(tmp_path, _with_note(text=MUSEUM_NOTE.replace("recreates", "faithfully recreates")))
    assert any("cue c99" in e and "faithfully" in e for e in errs), errs

def test_museum_note_must_cite_the_corner_basis_photographs(tmp_path):
    errs = _content_copy(tmp_path, _with_note(media_ids=None))
    assert any("cue c99" in e and "media_ids" in e for e in errs), errs
    errs = _content_copy(tmp_path, _with_note(media_ids=["EIN-M-0013", "EIN-M-0015"]))
    assert any("cue c99" in e and "EIN-M-0015" in e for e in errs), errs
    # The words are checked only against the records it cites: without the photographs, nothing
    # supports their year.
    errs = _content_copy(tmp_path, _with_note(media_ids=None))
    assert any("cue c99" in e and "year 1943 not in" in e for e in errs), errs

def test_museum_note_place_and_date_come_from_one_photograph_record(tmp_path):
    # Fix round 1 (review finding 1/2): pooled support let a place from one fact (EIN-F-0087: "a home
    # study at 112 Mercer Street") join a date from the photographs' records (24 July 1943) into a
    # claim no single source makes. A museum note's place and date words (names, dates, years, digit
    # numbers) must all come from one cited photograph record.
    composite = "In this room, a corner recreates Einstein's study at Mercer Street as two 1943 National Archives photographs show it."
    errs = _content_copy(tmp_path, _with_note(text=composite, fact_ids=["EIN-F-0087"]))
    assert any("cue c99" in e and "one cited photograph record" in e and "Mercer" in e for e in errs), errs
    old = "In this room, a corner recreates Einstein's study at 112 Mercer Street, Princeton, as two 1943 National Archives photographs show it."
    errs = _content_copy(tmp_path, _with_note(text=old, fact_ids=["EIN-F-0087"]))
    assert any("cue c99" in e and "one cited photograph record" in e and "112" in e for e in errs), errs

def test_museum_note_must_cite_verified_facts(tmp_path):
    errs = _content_copy(tmp_path, _with_note(fact_ids=[]))
    assert any("cue c99" in e and "no fact_ids" in e for e in errs), errs

def test_museum_note_frames_the_corner_of_its_own_chapter(tmp_path):
    errs = _content_copy(tmp_path, _with_note(frames="elsewhere"))
    assert any("cue c99" in e and "frames" in e for e in errs), errs
    errs = _content_copy(tmp_path, _with_note(n=3))
    assert any("einstein-3 cue c99" in e and "study corner" in e for e in errs), errs

def test_unknown_line_kind_and_stray_fields_fail(tmp_path):
    errs = _content_copy(tmp_path, _with_note(kind="aside"))
    assert any("cue c99" in e and "kind" in e for e in errs), errs
    def stray(chs):
        chs[1]["narration"][0]["media_ids"] = ["EIN-M-0013"]
    errs = _content_copy(tmp_path, stray)
    assert any("einstein-1 cue c1" in e and "museum-note" in e for e in errs), errs
