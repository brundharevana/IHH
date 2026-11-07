"""Tour map rules (tools/ihh/tour.py). Invented test data only (Test Person, example places)."""

import pytest

from ihh import tour

NAMES = ("Test Person",)


def fact(fid, status="verified", category="birth", date="1914-11-09", place=None,
         claim="Test Person was born in 1914."):
    return {"id": fid, "status": status, "category": category, "event_date": date, "place": place, "claim": claim}


def item(mid, status="verified", lic="public-domain", kind=None, basis_for=None, alt=""):
    m = {"id": mid, "status": status, "license_class": lic, "title": f"Title {mid}", "credit": "Example Archive",
         "alt_text": alt}
    if kind:
        m["record_kind"] = kind
        m["basis_for"] = basis_for or []
    return m


def chapter(**kw):
    ch = {"id": "birth", "kind": "birth", "title": None, "fact_ids": ["TST-F-0001"], "year_fact": "TST-F-0001",
          "place": None, "records": [], "place_photos": []}
    ch.update(kw)
    return ch


def tmap(*chs, journey=None):
    return {"slug": "testperson", "run_id": "r1", "source": "agent", "chapters": list(chs), "journey": journey}


def test_clean_map_passes():
    assert tour.check(tmap(chapter()), [fact("TST-F-0001")], [], NAMES) == []


def test_unverified_fact_is_refused():
    problems = tour.check(tmap(chapter()), [fact("TST-F-0001", status="single-source")], [], NAMES)
    assert problems == ["chapter birth: fact TST-F-0001 is single-source, not verified"]


def test_unknown_fact_unknown_kind_and_empty_chapter():
    problems = tour.check(tmap(chapter(kind="childhood", fact_ids=[], year_fact=None)), [], [], NAMES)
    assert any("kind 'childhood' is not one of" in p for p in problems)
    assert any("no facts" in p for p in problems)
    problems = tour.check(tmap(chapter(fact_ids=["TST-F-0009"], year_fact="TST-F-0009")), [], [], NAMES)
    assert "chapter birth: fact 'TST-F-0009' is not on file" in problems


def test_duplicate_and_missing_ids():
    problems = tour.check(tmap(chapter(), chapter(), chapter(id="")), [fact("TST-F-0001")], [], NAMES)
    assert "chapter birth: duplicate id" in problems
    assert "chapter 2: id missing" in problems


def test_year_fact_must_be_own_fact():
    facts = [fact("TST-F-0001"), fact("TST-F-0002")]
    problems = tour.check(tmap(chapter(year_fact="TST-F-0002")), facts, [], NAMES)
    assert problems == ["chapter birth: year_fact 'TST-F-0002' must be one of the chapter's own facts"]


@pytest.mark.parametrize("date,ok", [("1914", True), ("1914-11", True), ("1914-11-09", True),
                                     ("1939/1953", False), ("c. 1914", False), (None, False)])
def test_year_fact_needs_one_date(date, ok):
    problems = tour.check(tmap(chapter()), [fact("TST-F-0001", date=date)], [], NAMES)
    assert (problems == []) is ok
    if not ok:
        assert problems == ["chapter birth: year_fact TST-F-0001 has no single event_date (YYYY, YYYY-MM or YYYY-MM-DD)"]


def test_year_of():
    assert tour.year_of({"event_date": "1937-10-04"}) == 1937
    assert tour.year_of({"event_date": "1937/1938"}) is None
    assert tour.year_of({}) is None
    assert tour.year_of(None) is None


def test_not_a_map():
    assert tour.check([], [], []) == ["tour map: 'chapters' must be a list"]


def test_owner_rulings_are_read_from_project_owner_notes_only():
    base = {"date": "2026-10-30", "reviewer": "project owner", "item_id": "TST-M-0004", "action": "note",
            "before": "a" * 64, "after": None, "note": "Owner ruling 2026-10-29: may display."}
    rows = [base, dict(base, item_id="TST-M-0005", reviewer="research agent"),
            dict(base, item_id="TST-M-0006", note="A remark"), dict(base, item_id="TST-M-0007", action="approve")]
    assert tour.owner_rulings(rows) == {"TST-M-0004": "a" * 64}


VIENNA = "Test Person was born in Vienna, Austria, in 1914."


def test_place_label_comes_from_its_fact():
    facts = [fact("TST-F-0001", place="Vienna, Austria", claim=VIENNA)]
    ok = chapter(place={"label": "Vienna", "fact_id": "TST-F-0001", "coord": "wikidata:Q1741"})
    assert tour.check(tmap(ok), facts, [], NAMES) == []
    bad = chapter(place={"label": "The Graben, Vienna", "fact_id": "TST-F-0001", "coord": None})
    problems = tour.check(tmap(bad), facts, [], NAMES)
    assert problems == ["chapter birth: place label: name 'Graben' not in fact TST-F-0001"]


def test_place_fact_must_be_in_chapter_and_coord_well_formed():
    facts = [fact("TST-F-0001", place="Vienna, Austria", claim=VIENNA), fact("TST-F-0002", place="Vienna", claim=VIENNA)]
    p = tour.check(tmap(chapter(place={"label": "Vienna", "fact_id": "TST-F-0002", "coord": None})), facts, [], NAMES)
    assert p == ["chapter birth: place fact 'TST-F-0002' must be one of the chapter's own facts"]
    p = tour.check(tmap(chapter(place={"label": "Vienna", "fact_id": "TST-F-0001", "coord": "Q1741"})), facts, [], NAMES)
    assert p == ["chapter birth: coord 'Q1741' must be wikidata:Q<n>, osm:node/<n>, osm:way/<n> or holder:<id>"]


def test_title_takes_words_from_one_fact_not_a_pool():
    # a title may use one fact's own claim, place and event_date; here no single fact has both the town and the year
    facts = [fact("TST-F-0001", date=None, claim="Test Person was born in Example Town.", place="Example Town"),
             fact("TST-F-0002", date="1900", claim="Test Person was born in 1900.")]
    two = ["TST-F-0001", "TST-F-0002"]
    ch = lambda title: chapter(fact_ids=two, year_fact="TST-F-0002", title=title)
    assert tour.check(tmap(ch("Born in Example Town")), facts, [], NAMES) == []
    p = tour.check(tmap(ch("Born in Example Town, 1900")), facts, [], NAMES)
    assert len(p) == 1 and p[0].startswith("chapter birth: title 'Born in Example Town, 1900' must take its words from one chapter fact")


def test_records_and_place_photos():
    facts = [fact("TST-F-0001")]
    media = [item("TST-M-0001"), item("TST-M-0002", kind="basis-photo", basis_for=["TST-F-0001"]),
             item("TST-M-0003", kind="basis-photo", basis_for=["TST-F-0099"]), item("TST-M-0004", status="disputed"),
             item("TST-M-0005", kind="basis-photo", basis_for=["TST-F-0001"], lic="rights-restricted")]
    # a displayable photograph of the place may be a record too (the shipped Graben stereograph is)
    ok = chapter(records=["TST-M-0001", "TST-M-0002"], place_photos=["TST-M-0002", "TST-M-0005"])
    assert tour.check(tmap(ok), facts, media, NAMES) == []
    p = tour.check(tmap(chapter(records=["TST-M-0005", "TST-M-0004", "TST-M-0009"],
                                place_photos=["TST-M-0001", "TST-M-0003"])), facts, media, NAMES)
    assert p == [
        "chapter birth: records: TST-M-0005 is a reference-only basis photo (rights-restricted); it is never shown",
        "chapter birth: records: TST-M-0004 is disputed, not verified (and no current owner ruling)",
        "chapter birth: records: media 'TST-M-0009' is not on file",
        "chapter birth: place_photos: TST-M-0001 is not a basis photo",
        "chapter birth: place_photos: TST-M-0003 is not basis_for any of the chapter's facts",
    ]


def test_owner_ruled_record_is_shown_only_while_its_fingerprint_holds():
    from ihh import gates
    facts = [fact("TST-F-0001")]
    m = item("TST-M-0004", status="disputed")
    ruling = {"date": "2026-10-30", "reviewer": "project owner", "item_id": "TST-M-0004", "action": "note",
              "before": gates.media_lock_sha256(m), "after": None, "note": "Owner ruling 2026-10-29: may display."}
    rulings = tour.owner_rulings([ruling])
    ch = tmap(chapter(records=["TST-M-0004"]))
    assert tour.check(ch, facts, [m], NAMES, rulings) == []
    changed = dict(m, title="Another title")
    assert tour.check(ch, facts, [changed], NAMES, rulings) == [
        "chapter birth: records: TST-M-0004 is disputed, not verified (and no current owner ruling)"]
    restricted = dict(m, license_class="rights-restricted")
    assert tour.check(ch, facts, [restricted], NAMES, tour.owner_rulings([dict(ruling, before=gates.media_lock_sha256(restricted))])) != []


TOWN = "Test Person was born in Example Town in 1900."
PORT = "Test Person arrived at the Port of Example on 1941-06-10."
SAILED = "Test Person sailed from Example Town to the Port of Example in June 1941."


def journey_world():
    facts = [fact("TST-F-0010", date="1900", place="Example Town", claim=TOWN),
             fact("TST-F-0002", category="immigration", date="1941-06-10", place="Port of Example", claim=PORT),
             fact("TST-F-0003", category="immigration", date="1941-06", claim=SAILED)]
    chs = [chapter(id="birth", fact_ids=["TST-F-0010"], year_fact="TST-F-0010"),
           chapter(id="arriving", kind="arriving", fact_ids=["TST-F-0002"], year_fact="TST-F-0002")]
    places = [{"id": "home", "label": "Example Town", "fact_ids": ["TST-F-0010"], "coord": "wikidata:Q1"},
              {"id": "port", "label": "Port of Example", "fact_ids": ["TST-F-0002"], "coord": "wikidata:Q2"}]
    return facts, chs, places


def test_unrouted_journey_passes_and_carries_the_route_note():
    facts, chs, places = journey_world()
    j = {"chapter": "arriving", "places": places, "segments": [{"route_facts": [], "mode": None, "mode_facts": []}]}
    assert tour.check(tmap(*chs, journey=j), facts, [], NAMES) == []
    out = tour.assemble(tmap(*chs, journey=j), facts, [], NAMES, date="2026-11-03")
    assert out["journey"]["segments"] == [{"routed": False, "route_facts": [], "mode": None, "mode_facts": [],
                                           "note": tour.ROUTE_NOTE}]
    assert "journey segment 1: route not recorded" in out["gaps"]


def test_route_fact_must_name_both_places():
    facts, chs, places = journey_world()
    j = {"chapter": "arriving", "places": places, "segments": [{"route_facts": ["TST-F-0003"], "mode": "ship", "mode_facts": ["TST-F-0003"]}]}
    assert tour.check(tmap(*chs, journey=j), facts, [], NAMES) == []
    facts[2]["claim"] = "Test Person sailed to the Port of Example in June 1941."
    p = tour.check(tmap(*chs, journey=j), facts, [], NAMES)
    assert p == ["journey segment 1: route fact TST-F-0003 does not name 'Example Town' "
                 "(a line is routed only where a verified fact states that journey)",
                 "journey segment 1: mode fact TST-F-0003 does not name 'Example Town' "
                 "(a mode is shown only where a verified fact states it for this journey)"]


def test_journey_place_and_mode_rules():
    facts, chs, places = journey_world()
    places[1] = dict(places[1], coord=None, fact_ids=[])
    j = {"chapter": "nowhere", "places": places, "segments": [{"route_facts": [], "mode": "boat", "mode_facts": []}]}
    p = tour.check(tmap(*chs, journey=j), facts, [], NAMES)
    assert "journey: chapter 'nowhere' is not a chapter of this tour" in p
    assert "journey place 2: no fact (a pin goes only on a verified place)" in p
    assert any(x.startswith("journey place 2: coord None") for x in p)
    assert "journey segment 1: mode 'boat' is not one of ship, train, road, air, foot" in p
    assert "journey segment 1: mode 'boat' needs a verified mode fact" in p
    j2 = {"chapter": "arriving", "places": places[:1], "segments": []}
    assert tour.check(tmap(*chs, journey=j2), facts, [], NAMES) == ["journey: needs at least two places (origin and arrival)"]


def test_assemble_orders_same_year_by_kind():
    facts = [fact("TST-F-0001", date="1900"), fact("TST-F-0002", date="1933-10", category="immigration"),
             fact("TST-F-0003", date="1933-03", category="immigration"), fact("TST-F-0004", date="1955", category="death")]
    chs = [chapter(id="legacy", kind="legacy", fact_ids=["TST-F-0004"], year_fact="TST-F-0004"),
           chapter(id="arriving", kind="arriving", fact_ids=["TST-F-0002"], year_fact="TST-F-0002"),
           chapter(id="leaving", kind="leaving", fact_ids=["TST-F-0003"], year_fact="TST-F-0003"),
           chapter(id="birth", fact_ids=["TST-F-0001"], year_fact="TST-F-0001")]
    out = tour.assemble(tmap(*chs), facts, [], NAMES)
    assert [c["id"] for c in out["chapters"]] == ["birth", "leaving", "arriving", "legacy"]
    assert [c["year"] for c in out["chapters"]] == [1900, 1933, 1933, 1955]


def test_assemble_counts_only_usable_records_toward_three():
    facts = [fact("TST-F-0001")]
    media = [item("TST-M-0001"), item("TST-M-0002", lic="cc-by"), item("TST-M-0003", lic="rights-restricted"),
             item("TST-M-0004", kind="basis-photo", basis_for=["TST-F-0001"], lic="rights-restricted")]
    ch = chapter(records=["TST-M-0001", "TST-M-0002", "TST-M-0003"], place_photos=["TST-M-0004"],
                 place={"label": "Example", "fact_id": "TST-F-0001", "coord": None})
    facts[0]["place"] = "Example"
    out = tour.assemble(tmap(ch), facts, media, NAMES)
    c = out["chapters"][0]
    assert c["usable_records"] == ["TST-M-0001", "TST-M-0002"]
    assert c["link_only_records"] == ["TST-M-0003"]
    assert c["place_photos"] == [{"media_id": "TST-M-0004", "license_class": "rights-restricted", "display": False}]
    assert c["gaps"] == ["2 usable records (fewer than 3)",
                         "no displayable photo of the place (reference-only photos on file)",
                         "3 records with no recorded link to a chapter fact (a reviewer confirms they fit)"]


def test_assemble_refuses_a_broken_map_and_lists_unassigned():
    facts = [fact("TST-F-0001"), fact("TST-F-0002", category="career", date="1950")]
    with pytest.raises(tour.TourError) as e:
        tour.assemble(tmap(chapter(fact_ids=["TST-F-0009"], year_fact="TST-F-0009")), facts, [], NAMES)
    assert "chapter birth: fact 'TST-F-0009' is not on file" in e.value.problems
    out = tour.assemble(tmap(chapter()), facts, [], NAMES)
    assert out["unassigned_fact_ids"] == ["TST-F-0002"]
    assert "no chapter of kind legacy" in out["gaps"] and "no journey (origin and arrival pins)" in out["gaps"]


def proposal_world():
    facts = [fact("TST-F-0001", date="1900", place="Example Town", claim=TOWN),
             fact("TST-F-0002", category="immigration", date="1941-06-10", place="Port of Example", claim=PORT),
             fact("TST-F-0003", category="career", date="1942", claim="Test Person taught at Example College in 1942."),
             fact("TST-F-0004", category="career", date="1950", claim="Test Person led Example College in 1950."),
             fact("TST-F-0005", category="education", date="1945", claim="Test Person studied at Example College in 1945."),
             fact("TST-F-0006", category="award", date=None, claim="Test Person received the Example Medal."),
             fact("TST-F-0007", category="citizenship", date="1946", claim="Test Person became a citizen in 1946.",
                  status="single-source"),
             fact("TST-F-0008", category="family", date="1920", claim="Test Person married in 1920.")]
    media = [item("TST-M-0001", alt="The arrival record (TST-F-0002)."),
             item("TST-M-0002", kind="basis-photo", basis_for=["TST-F-0002"])]
    return facts, media


def test_propose_is_a_valid_first_draft():
    facts, media = proposal_world()
    tm = tour.propose(facts, media, "testperson", "r1")
    assert tour.check(tm, facts, media, NAMES) == []
    by = {c["kind"]: c for c in tm["chapters"]}
    assert set(by) == {"birth", "arriving", "first-work", "big-work"}
    assert by["first-work"]["fact_ids"] == ["TST-F-0003"] and by["big-work"]["fact_ids"] == ["TST-F-0004"]
    assert by["arriving"]["records"] == ["TST-M-0001"] and by["arriving"]["place_photos"] == ["TST-M-0002"]
    assert by["birth"]["place"] == {"label": "Example Town", "fact_id": "TST-F-0001", "coord": None}
    # education after arrival, an undated award and family facts are left for judgement; single-source never enters
    assert tm["unassigned_fact_ids"] == ["TST-F-0005", "TST-F-0006", "TST-F-0008"]
    assert tm["journey"] is None and tm["source"] == "propose"


def test_plan_items_order_and_content():
    facts, media = proposal_world()
    tm = tour.propose(facts, media, "testperson", "r1")
    items = tour.plan_items(tm, facts, media, "Test Person", max_items=50)
    needs = [i["need"] for i in items]
    assert needs[0] == "journey"
    assert needs == sorted(needs, key=lambda n: ["journey", "chapter-facts", "records", "corroborate",
                                                 "place-photo", "place-fact"].index(n))
    assert {"need": "corroborate", "fact_id": "TST-F-0007", "claim": "Test Person became a citizen in 1946.",
            "queries": ["Test Person 1946"]} in items
    missing = {i["kind"] for i in items if i["need"] == "chapter-facts"}
    assert missing == {"education", "leaving", "citizen", "history", "honoured", "legacy"}
    assert all(q and "None" not in q for i in items for q in i["queries"])
    assert len(tour.plan_items(tm, facts, media, "Test Person", max_items=3)) == 3


def test_propose_dates_legacy_by_the_death():
    facts = [fact("TST-F-0001", category="legacy", date="1945", claim="Test Person's papers went to Example College in 1945."),
             fact("TST-F-0002", category="death", date="2000", claim="Test Person died in 2000.")]
    tm = tour.propose(facts, [], "testperson")
    assert [(c["kind"], c["year_fact"]) for c in tm["chapters"]] == [("legacy", "TST-F-0002")]


import json
from pathlib import Path

APP = json.loads((Path(__file__).parent / "fixtures" / "tour_app_sample.json").read_text(encoding="utf-8"))


def app_world():
    facts = [fact("TST-F-0010", date="1900", place="Example Town", claim=TOWN),
             fact("TST-F-0002", category="immigration", date="1941-06-10", place="Port of Example", claim=PORT)]
    media = [item("TST-M-0010"), item("TST-M-0001"), item("TST-M-0011")]
    return facts, media


def test_seed_round_trip_has_full_recall():
    facts, media = app_world()
    tm = tour.seed_from_app(APP, "testperson", facts, "r1")
    assert tm["source"] == "app" and tm["app_objects"] == [{"chapter": "arriving", "object": "TST-MODEL-RECREATION"}]
    assert tour.check(tm, facts, media, NAMES) == []
    rep = tour.compare(tour.assemble(tm, facts, media, NAMES), APP)
    assert [r["fact_recall"] for r in rep["chapters"]] == [1.0, 1.0]
    assert [r["record_recall"] for r in rep["chapters"]] == [1.0, 1.0]
    assert rep["journey"] == {"endpoints_equal": True, "routed_equal": True, "app_places": 2, "draft_places": 2}
    assert rep["summary"]["matched"] == 2 and rep["draft_only_chapters"] == []


def test_compare_reports_missing_and_new():
    facts, media = app_world()
    tm = tour.seed_from_app(APP, "testperson", facts, "r1")
    tm["chapters"][0]["records"] = ["TST-M-0011"]
    tm["chapters"][1]["kind"] = "citizen"
    rep = tour.compare(tour.assemble(tm, facts, media, NAMES), APP)
    birth, arriving = rep["chapters"]
    assert birth["missing_records"] == ["TST-M-0010"] and birth["new_records"] == ["TST-M-0011"]
    assert arriving["draft_chapter"] is None and arriving["fact_recall"] == 0.0
    assert rep["draft_only_chapters"] == ["arriving"]


def test_a_mode_needs_a_fact_that_states_it_for_this_journey():
    # Codex review 2026-11-01: any verified fact could label a line as travel by ship, train or air
    facts, chs, places = journey_world()
    facts.append(fact("TST-F-0004", category="career", date="1942", claim="Test Person taught at Example College in 1942."))
    facts.append(fact("TST-F-0005", category="immigration", date="1941",
                      claim="Test Person travelled from Example Town to the Port of Example in 1941."))
    seg = lambda mf: {"chapter": "arriving", "places": places, "segments": [{"route_facts": mf, "mode": "ship", "mode_facts": mf}]}
    assert tour.check(tmap(*chs, journey=seg(["TST-F-0003"])), facts, [], NAMES) == []  # "sailed from ... to ..."
    p = tour.check(tmap(*chs, journey=seg(["TST-F-0004"])), facts, [], NAMES)
    assert "journey segment 1: mode fact TST-F-0004 does not state travel by ship" in p
    assert any("mode fact TST-F-0004 does not name 'Example Town'" in x for x in p)
    p = tour.check(tmap(*chs, journey=seg(["TST-F-0005"])), facts, [], NAMES)
    assert p == ["journey segment 1: mode fact TST-F-0005 does not state travel by ship"]


def test_records_with_no_recorded_link_to_the_chapter_are_listed_for_review():
    # Codex review 2026-11-01: which records fit a chapter is a judgement; assemble lists the records that
    # name no chapter fact (alt text, basis, or a shared source) so a reviewer confirms them
    facts = [fact("TST-F-0001")]
    facts[0]["evidence"] = [{"source_id": "TST-S-0007", "quote": "q", "locator": "l"}]
    media = [item("TST-M-0001", alt="The birth record (TST-F-0001)."), item("TST-M-0002"),
             dict(item("TST-M-0003"), source_ids=["TST-S-0007"])]
    out = tour.assemble(tmap(chapter(records=["TST-M-0001", "TST-M-0002", "TST-M-0003"])), facts, media, NAMES)
    c = out["chapters"][0]
    assert c["unlinked_records"] == ["TST-M-0002"]
    assert "1 record with no recorded link to a chapter fact (a reviewer confirms it fits)" in c["gaps"]


def test_a_mode_word_alone_is_not_travel():
    # Codex review round 2: "a ship in Vienna ... arrived in New York" must not label the line ship
    facts, chs, places = journey_world()
    facts.append(fact("TST-F-0006", category="immigration", date="1941",
                      claim="Test Person saw a ship in Example Town and later reached the Port of Example in 1941."))
    j = {"chapter": "arriving", "places": places,
         "segments": [{"route_facts": ["TST-F-0006"], "mode": "ship", "mode_facts": ["TST-F-0006"]}]}
    assert "journey segment 1: mode fact TST-F-0006 does not state travel by ship" in tour.check(tmap(*chs, journey=j), facts, [], NAMES)
    # a mode fact must also be one of the segment's route facts (the fact that states this journey)
    j = {"chapter": "arriving", "places": places, "segments": [{"route_facts": [], "mode": "ship", "mode_facts": ["TST-F-0003"]}]}
    assert "journey segment 1: mode fact TST-F-0003 is not one of the segment's route facts" in tour.check(tmap(*chs, journey=j), facts, [], NAMES)


@pytest.mark.parametrize("bad", [["arriving"], {"x": 1}])
def test_a_malformed_journey_chapter_is_a_problem_not_a_crash(bad):
    facts, chs, places = journey_world()
    j = {"chapter": bad, "places": places, "segments": [{"route_facts": [], "mode": None, "mode_facts": []}]}
    p = tour.check(tmap(*chs, journey=j), facts, [], NAMES)
    assert f"journey: chapter {bad!r} is not a chapter of this tour" in p
    chs[0]["id"] = ["birth"]
    assert "chapter 0: id missing" in tour.check(tmap(*chs), facts, [], NAMES)


def test_mode_facts_without_a_mode_are_refused():
    # Codex review round 3: with mode null, mode_facts went unchecked into the journey and the export
    facts, chs, places = journey_world()
    j = {"chapter": "arriving", "places": places, "segments": [{"route_facts": [], "mode": None, "mode_facts": ["TST-F-0099"]}]}
    p = tour.check(tmap(*chs, journey=j), facts, [], NAMES)
    assert "journey segment 1: mode_facts given but no mode" in p and any("TST-F-0099" in x for x in p)


def test_a_route_fact_must_state_a_journey_not_just_name_both_places():
    # Codex review round 3: "offices in Example Town and the Port of Example" names both places, states no journey
    facts, chs, places = journey_world()
    facts.append(fact("TST-F-0007", category="career", date="1950",
                      claim="Test Person kept offices in Example Town and at the Port of Example in 1950."))
    j = {"chapter": "arriving", "places": places, "segments": [{"route_facts": ["TST-F-0007"], "mode": None, "mode_facts": []}]}
    assert tour.check(tmap(*chs, journey=j), facts, [], NAMES) == [
        "journey segment 1: route fact TST-F-0007 does not state a journey (a travel word such as sailed, travelled, arrived)"]


@pytest.mark.parametrize("claim", [
    "Test Person left papers in Example Town and the Port of Example in 1941.",
    "Test Person sailed often and kept homes in Example Town and the Port of Example.",
    "Test Person travelled to Example Town and the Port of Example in 1941.",
    "Test Person arrived in Example Town from the Port of Example in 1941.",  # the reverse journey
])
def test_a_route_fact_must_state_the_journey_between_the_two_places(claim):
    # Codex review round 5: a travel word anywhere and both place names were enough to route a line
    facts, chs, places = journey_world()
    facts.append(fact("TST-F-0008", category="immigration", date="1941", claim=claim))
    j = {"chapter": "arriving", "places": places, "segments": [{"route_facts": ["TST-F-0008"], "mode": None, "mode_facts": []}]}
    assert tour.check(tmap(*chs, journey=j), facts, [], NAMES) == [
        "journey segment 1: route fact TST-F-0008 does not state the journey from 'Example Town' to "
        "'Port of Example' (from or left before the origin, or the origin named first; to, for, into, "
        "reached or arrived in before the destination)"]


@pytest.mark.parametrize("claim", [
    "Test Person sailed from Example Town to the Port of Example in 1941.",
    "Test Person sailed for the Port of Example from Example Town in 1941.",
    "Test Person left Example Town for the Port of Example in 1941.",
    "Test Person arrived in the Port of Example from Example Town in 1941.",
    "Test Person landed in Example Town and went by boat to the Port of Example in 1941.",
])
def test_a_route_fact_that_states_the_journey_passes(claim):
    facts, chs, places = journey_world()
    facts.append(fact("TST-F-0008", category="immigration", date="1941", claim=claim))
    j = {"chapter": "arriving", "places": places, "segments": [{"route_facts": ["TST-F-0008"], "mode": None, "mode_facts": []}]}
    assert tour.check(tmap(*chs, journey=j), facts, [], NAMES) == []


@pytest.mark.parametrize("mode", [{"x": 1}, ["ship"], 3])
def test_a_malformed_mode_is_a_problem_not_a_crash(mode):
    # Codex review round 7: a mode object with a verified mode fact raised TypeError
    facts, chs, places = journey_world()
    j = {"chapter": "arriving", "places": places,
         "segments": [{"route_facts": ["TST-F-0003"], "mode": mode, "mode_facts": ["TST-F-0003"]}]}
    p = tour.check(tmap(*chs, journey=j), facts, [], NAMES)
    assert f"journey segment 1: mode {mode!r} is not one of {', '.join(tour.MODES)}" in p


@pytest.mark.parametrize("key", ["records", "place_photos", "fact_ids"])
@pytest.mark.parametrize("value", [7, "TST-M-0001", {"id": "TST-M-0001"}, True])
def test_a_list_field_that_is_not_a_list_is_a_problem_not_a_crash(key, value):
    # Codex review round 8: records: 7 raised TypeError in check()
    p = tour.check(tmap(chapter(**{key: value})), [fact("TST-F-0001")], [], NAMES)
    assert f"chapter birth: {key} must be a list (got {type(value).__name__})" in p


@pytest.mark.parametrize("where,patch", [
    ("journey: places", lambda j: j.update(places=5)),
    ("journey: segments", lambda j: j.update(segments="x")),
    ("journey place 1: fact_ids", lambda j: j["places"][0].update(fact_ids=3)),
    ("journey segment 1: route_facts", lambda j: j["segments"][0].update(route_facts={"a": 1})),
    ("journey segment 1: mode_facts", lambda j: j["segments"][0].update(mode_facts=1)),
])
def test_a_journey_list_field_that_is_not_a_list_is_a_problem_not_a_crash(where, patch):
    facts, chs, places = journey_world()
    j = {"chapter": "arriving", "places": places,
         "segments": [{"route_facts": ["TST-F-0003"], "mode": None, "mode_facts": []}]}
    patch(j)
    p = tour.check(tmap(*chs, journey=j), facts, [], NAMES)
    assert any(x.startswith(f"{where} must be a list") for x in p), p
