"""Tests for export_site_provenance.py: the provenance package for IHH's chatbot (Task 18)."""
import json

from export_site_provenance import build, write_index

SOURCES = """# Desk room: photographic sources

## Basis photograph

| Media record | Holder, identifier | Date | Title (holder) | Rights (holder's words) | Used for |
|---|---|---|---|---|---|
| X-M-0001 | Example Archive, 12 | 1900 | "The room" | "No known restrictions on publication." | Camera, the desk. |

## Modelling references (no pixels used)

| Media | Holder, identifier | Date | Rights | Used for |
|---|---|---|---|---|
| X-M-0003 | Other Museum, 7 | 1901 | rights unknown | The chair's legs. |

## Third-party assets

| Asset | Source | Licence | Use |
|---|---|---|---|
| Oak (A. Person) | https://polyhaven.com/a/oak | CC0 | Desk top |
"""

INVENTORY = """# Desk room: inventory

Basis: X-M-0001.

| Object (node) | Position / size | Material | Seen in | Notes |
|---|---|---|---|---|
| Desk (`artifact_desk`) | 1 x 2 m | oak (CC0) | X-M-0001 | Carving simplified. |
| Chair (`chair`) | beside the desk | wood | X-M-0003 | Legs from the reference. |
| Ceiling | plain | | no | Not in the photograph. |
"""

NODES = {"hotspots": ["hotspot_1"], "artifacts": ["artifact_desk"], "label": ["label_recreation"]}

NARRATION = {
    "inductee": "x",
    "chapters": {
        "1": {"title": "One", "lines": [
            {"cue": "c1", "fact_ids": ["X-F-0001"], "source": "X was born in 1900.", "text": "X was born in 1900."},
        ]},
        "2": {"title": "Room notes", "lines": [
            {"cue": "n1", "kind": "room-note", "fact_ids": [], "basis": "assets-src/x-desk-room/INVENTORY.md",
             "source": ["Desk", "Carving simplified."], "text": "The desk. Its carving is simplified."},
        ]},
        "birth": {"opening": {"text": "Born, 1900.", "source": ["X was born in 1900."], "fact_ids": ["X-F-0001"]}},
    },
}


def _rows(path, rows):
    path.write_text("".join(json.dumps(r) + "\n" for r in rows))


def make_repo(tmp_path):
    repo = tmp_path / "repo"
    room = repo / "assets-src/x-desk-room"
    room.mkdir(parents=True)
    (room / "SOURCES.md").write_text(SOURCES)
    (room / "INVENTORY.md").write_text(INVENTORY)
    models = repo / "app/public/models/x-desk-room"
    models.mkdir(parents=True)
    (models / "nodes.json").write_text(json.dumps(NODES))
    # a room that is built but no chapter shows
    unused = repo / "assets-src/x-unused-room"
    unused.mkdir(parents=True)
    (unused / "SOURCES.md").write_text(SOURCES.replace("Desk room", "Unused room"))
    (unused / "DECISION.md").write_text("# x-unused-room: built, not used\n\nStatus: **not used** (no verified fact places X here).\n")
    (repo / "app/public/models/x-unused-room").mkdir(parents=True)
    (repo / "app/public/models/x-unused-room/nodes.json").write_text(json.dumps(NODES))
    narr = repo / "assets-src/audio/narration"
    narr.mkdir(parents=True)
    (narr / "x.json").write_text(json.dumps(NARRATION))
    guide = repo / "app/src/shared/guide"
    guide.mkdir(parents=True)
    (guide / "lines.json").write_text(json.dumps({"tour": {"rooms": {"x-desk-room": {
        "arrivals": ["Here we are."], "intros": {"desk": ["Look at the desk."]}}}}}))

    facts = tmp_path / "facts"
    store = facts / "data/inductees/x"
    store.mkdir(parents=True)
    (store / "TOUR-RESEARCH.md").write_text("# X: tour research\n")
    _rows(store / "facts.jsonl", [{"id": "X-F-0001", "status": "verified", "claim": "X was born in 1900."}])
    _rows(store / "media.jsonl", [
        {"id": "X-M-0001", "title": "The room", "credit": "Example Archive, 12", "url": "https://example.org/12",
         "rights_statement": "No known restrictions on publication.", "license_class": "public-domain",
         "record_kind": "basis-photo", "status": "verified",
         "review": {"state": "approved", "reviewer": "owner (Somebody)", "date": "2026-10-20"}},
        {"id": "X-M-0002", "title": "A letter", "credit": "Example Archive, 13", "url": "https://example.org/13",
         "rights_statement": "Public domain", "license_class": "public-domain", "status": "verified"},
        {"id": "X-M-0003", "title": "A chair", "credit": "Other Museum, 7", "url": "https://example.org/7",
         "rights_statement": "All rights reserved", "license_class": "rights-restricted",
         "record_kind": "basis-photo", "status": "verified"},
    ])
    return repo, facts


TOUR = {
    "tours": {"x": {"name": "X Person", "chapters": [{
        "id": "birth", "kind": "birth", "title": "Born", "year": 1900, "factIds": ["X-F-0001"],
        "opening": {"keys": ["x:ch:birth:opening"], "factIds": []},
        "narration": None, "map": None,
        "place": {"tier": "room", "label": "The desk room", "note": None, "panel": None, "photo": None,
                  "room": {"id": "x-desk-room", "title": "The desk room", "labelText": "Recreation based on a photograph.",
                           "narration": {"keys": ["x:1:c1"], "factIds": ["X-F-0001"]}, "closing": None}},
        "stops": [
            {"id": "desk", "name": "The desk", "nodes": ["artifact_desk"], "clip": {"keys": ["x:2:n1"], "factIds": []},
             "record": None, "panel": False, "rail": False, "placeNote": None, "prop": None},
            {"id": "letter", "name": "A letter", "nodes": [], "clip": None, "record": "X-M-0002",
             "panel": False, "rail": False, "placeNote": "Not written here.", "prop": None},
        ],
    }]}},
    "records": {"X-M-0002": {"id": "X-M-0002", "slug": "x", "kind": "letter", "title": "A letter",
                             "holder": "Example Archive", "rights": "Public domain", "credit": "Example Archive, 13",
                             "source": "https://example.org/13", "files": ["/media/x/X-M-0002-p1.webp"],
                             "lines": [{"label": "Born", "text": "X was born in 1900.", "factId": "X-F-0001"}],
                             "notes": [], "clip": None}},
}


def nodes_by_id(doc):
    return {n["@id"]: n for n in doc["@graph"]}


def test_room_is_a_creative_work_based_on_its_photographs(tmp_path):
    repo, facts = make_repo(tmp_path)
    doc = build(repo, facts, TOUR, built_not_shown=["x-unused-room"])
    room = nodes_by_id(doc)["ihh:room-x-desk-room"]
    assert room["@type"] == "CreativeWork"
    assert room["additionalType"] == "ihh:RoomRecreation"
    basis = {b["ihh:mediaId"]: b for b in room["isBasedOn"]}
    assert basis["X-M-0001"]["@id"] == "ihh:X-M-0001"
    assert basis["X-M-0001"]["ihh:holder"] == "Example Archive, 12"
    assert basis["X-M-0001"]["ihh:rights"] == "No known restrictions on publication."
    assert basis["X-M-0001"]["ihh:role"] == "basis"
    # a modelling reference keeps its rights status; its pixels are never in the package or the tour
    ref = basis["X-M-0003"]
    assert ref["ihh:role"] == "modelling-reference"
    assert ref["ihh:licenseClass"] == "rights-restricted"
    assert ref["ihh:pixelsShown"] is False
    # each modelled object, with the photograph that shows it (the inventory's own words alongside)
    parts = {p["name"]: p for p in room["hasPart"]}
    assert parts["Desk"]["ihh:nodes"] == ["artifact_desk"]
    assert parts["Desk"]["ihh:shownBy"] == [{"@id": "ihh:X-M-0001"}]
    assert parts["Desk"]["ihh:framable"] is True
    assert parts["Chair"]["ihh:shownBy"] == [{"@id": "ihh:X-M-0003"}]
    assert parts["Ceiling"]["ihh:shownBy"] == []
    assert parts["Ceiling"]["ihh:seenIn"] == "no"
    assert room["ihh:thirdPartyAssets"][0]["ihh:licence"] == "CC0"
    assert room["ihh:shownIn"] == [{"ihh:inductee": "x", "ihh:chapter": "birth", "ihh:chapterTitle": "Born", "ihh:placeLabel": "The desk room"}]


def test_every_spoken_line_is_a_speakable_specification_citing_its_facts(tmp_path):
    repo, facts = make_repo(tmp_path)
    by_id = nodes_by_id(build(repo, facts, TOUR, built_not_shown=["x-unused-room"]))
    line = by_id["ihh:line-x:1:c1"]
    assert line["@type"] == "SpeakableSpecification"
    assert line["ihh:text"] == "X was born in 1900."
    assert line["citation"] == [{"@id": "ihh:X-F-0001"}]
    assert line["ihh:lineKind"] == "fact"
    assert line["ihh:claimStatus"] == {"X-F-0001": "verified"}
    opening = by_id["ihh:line-x:ch:birth:opening"]
    assert opening["ihh:lineKind"] == "opening"
    assert opening["citation"] == [{"@id": "ihh:X-F-0001"}]
    note = by_id["ihh:line-x:2:n1"]
    assert note["ihh:lineKind"] == "room-note"
    assert note["citation"] == []
    assert note["ihh:basis"] == "assets-src/x-desk-room/INVENTORY.md"
    assert note["about"] == {"@id": "ihh:room-x-desk-room"}
    # wayfinding lines are spoken too; they make no claim
    guide = [n for n in by_id.values() if n.get("ihh:lineKind") == "wayfinding"]
    assert {g["ihh:text"] for g in guide} == {"Here we are.", "Look at the desk."}
    assert all(g["citation"] == [] for g in guide)


def test_every_viewer_record_carries_its_media_id(tmp_path):
    repo, facts = make_repo(tmp_path)
    by_id = nodes_by_id(build(repo, facts, TOUR, built_not_shown=["x-unused-room"]))
    rec = by_id["ihh:record-X-M-0002"]
    assert rec["@type"] == "MediaObject"
    assert rec["ihh:mediaId"] == "X-M-0002"
    assert rec["ihh:mediaRecord"] == {"@id": "ihh:X-M-0002"}
    assert rec["ihh:lines"][0]["citation"] == {"@id": "ihh:X-F-0001"}
    assert rec["ihh:shownAt"] == [{"ihh:inductee": "x", "ihh:chapter": "birth", "ihh:stop": "letter", "ihh:placeNote": "Not written here."}]


def test_built_rooms_not_shown_are_listed_with_their_decision(tmp_path):
    repo, facts = make_repo(tmp_path)
    by_id = nodes_by_id(build(repo, facts, TOUR, built_not_shown=["x-unused-room"]))
    unused = by_id["ihh:room-x-unused-room"]
    assert unused["ihh:status"] == "built, not shown"
    assert "no verified fact places X here" in unused["ihh:reason"]
    assert unused["ihh:decisionFile"] == "assets-src/x-unused-room/DECISION.md"


def test_package_is_json_ld_and_carries_no_reviewer_names(tmp_path):
    repo, facts = make_repo(tmp_path)
    doc = build(repo, facts, TOUR, built_not_shown=["x-unused-room"])
    assert doc["@context"]["@vocab"] == "https://schema.org/"
    text = json.dumps(doc)
    assert json.loads(text) == doc
    assert "Somebody" not in text and "reviewer" not in text
    summary = nodes_by_id(doc)["ihh:site-provenance"]
    assert summary["ihh:counts"]["rooms"] == 1
    assert summary["ihh:counts"]["spokenLines"] == 3
    assert summary["ihh:counts"]["viewerRecords"] == 1


def test_rooms_index_links_room_and_inductee_files(tmp_path):
    repo, facts = make_repo(tmp_path)
    doc = build(repo, facts, TOUR, built_not_shown=["x-unused-room"])
    md = write_index(doc)
    assert "[SOURCES](../../assets-src/x-desk-room/SOURCES.md)" in md
    assert "[TOUR-RESEARCH](../inductees/x/TOUR-RESEARCH.md)" in md
    assert "x-unused-room" in md and "built, not shown" in md


def test_a_photograph_the_sources_say_is_not_used_is_consulted_not_basis(tmp_path):
    from export_site_provenance import parse_sources
    p = tmp_path / "SOURCES.md"
    p.write_text("# Room: sources\n\nX-M-0010 (frame 16) is the basis frame. X-M-0011 (frame 08) is NOT used: it shows another room.\n"
                 "Leads: media records RL-M-XXX-ROLL-08 (staging).\n\n## Basis photographs\n\n"
                 "| Frames | What they show | Used for |\n|---|---|---|\n| 16 | The bay | Camera |\n| 04, 08 | Another room | Not used. |\n\n"
                 "| Frame | sha256 |\n|---|---|\n| 16 | abc |\n")
    items, _ = parse_sources(p)
    roles = {(tuple(i["mediaIds"]) or i["identifier"]): i["role"] for i in items}
    assert roles == {"16": "basis", "04, 08": "consulted-not-used", ("X-M-0010",): "basis", ("X-M-0011",): "consulted-not-used"}


def test_the_media_id_column_is_found_by_its_values_not_a_header_word(tmp_path):
    # assets-src/study/SOURCES.md: the id column is "ID"; "Caption (holder's record)" holds no ids
    from export_site_provenance import parse_sources
    p = tmp_path / "SOURCES.md"
    p.write_text("# Study: sources\n\n## Basis photographs (declared content)\n\n"
                 "| ID | Holder, identifier | Date | Caption (holder's record) | Rights statement |\n|---|---|---|---|---|\n"
                 "| X-M-0013 | Archive, 80-G-42918 | 1943 | \"In his study\" | \"Unrestricted\" |\n"
                 "| X-M-0014 | Archive, 80-G-42919 | 1943 | \"... his study ...\" | \"Unrestricted\" (as above) |\n")
    items, _ = parse_sources(p)
    assert [i["mediaIds"] for i in items] == [["X-M-0013"], ["X-M-0014"]]


ROW_ROLES = """# Gym: sources

## Basis photographs

| Short name | Holder, identifier | Rights | Used for |
|---|---|---|---|
| KU-1907 | KU University Archives, RG 66/13 | No rights statement on the holder's page: treated as rights-restricted. PRIVATE MODELLING REFERENCE ONLY | Camera |
| X-M-0060 | A Museum, 1996.0006.01 | "Usage Conditions Apply" (rights-restricted) | Shape |
| X-M-0001 | Example Archive, 12 | "No known restrictions on publication." | Camera |
| X-M-0003 | Other Museum, 7 | see the record | Legs |
"""


def test_a_row_that_says_reference_only_is_a_modelling_reference_whatever_its_section(tmp_path):
    from export_site_provenance import parse_sources
    p = tmp_path / "SOURCES.md"
    p.write_text(ROW_ROLES)
    roles = {(i["mediaIds"] or [i["identifier"]])[0]: i["role"] for i in parse_sources(p)[0]}
    assert roles == {"KU-1907": "modelling-reference", "X-M-0060": "modelling-reference",
                     "X-M-0001": "basis", "X-M-0003": "basis"}


def test_a_basis_row_whose_record_is_not_cleared_is_a_modelling_reference_and_listed(tmp_path):
    repo, facts = make_repo(tmp_path)
    (repo / "assets-src/x-desk-room/SOURCES.md").write_text(ROW_ROLES)
    doc = build(repo, facts, TOUR, built_not_shown=["x-unused-room"])
    basis = {(b["ihh:mediaId"] or b["ihh:identifier"]): b for b in nodes_by_id(doc)["ihh:room-x-desk-room"]["isBasedOn"]}
    # X-M-0003's store record is rights-restricted: its row cannot make it a basis photograph
    assert basis["X-M-0003"]["ihh:role"] == "modelling-reference"
    assert basis["KU-1907"]["ihh:role"] == "modelling-reference"
    assert basis["X-M-0001"]["ihh:role"] == "basis"
    md = write_index(doc)
    refs = md.split("## Modelling references")[1]
    assert "KU-1907" in refs and "X-M-0003" in refs and "X-M-0001" not in refs


def test_the_export_stops_if_the_tour_shows_a_modelling_reference(tmp_path):
    import copy
    import pytest
    repo, facts = make_repo(tmp_path)
    tour = copy.deepcopy(TOUR)
    tour["records"]["X-M-0003"] = dict(tour["records"]["X-M-0002"], id="X-M-0003", files=["/media/x/X-M-0003.webp"])
    tour["tours"]["x"]["chapters"][0]["stops"][1]["record"] = "X-M-0003"
    with pytest.raises(SystemExit, match="modelling reference"):
        build(repo, facts, tour, built_not_shown=["x-unused-room"])


HOLDERS = """# Room: sources

## Basis photographs

Holder: National Archives, Clinton Library, roll P02724. Use restriction (holder's words): "Unrestricted".

| Frames | What they show | Used for |
|---|---|---|
| 16, 17 | The bay | Camera |

## Modelling references (no pixels used)

| File | What it shows | Used for |
|---|---|---|
| X-M-0003 | the chair | nothing |
| NMAH-1.jpg | the pipe | shape |
"""


def test_holder_and_rights_come_from_the_row_the_section_or_the_record_and_never_go_blank(tmp_path):
    repo, facts = make_repo(tmp_path)
    (repo / "assets-src/x-desk-room/SOURCES.md").write_text(HOLDERS)
    doc = build(repo, facts, TOUR, built_not_shown=["x-unused-room"])
    basis = {(b["ihh:mediaId"] or b["ihh:identifier"]): b for b in nodes_by_id(doc)["ihh:room-x-desk-room"]["isBasedOn"]}
    frames = basis["16, 17"]
    assert frames["ihh:holder"].startswith("National Archives, Clinton Library")
    assert frames["ihh:holderFrom"] == "SOURCES.md section"
    assert "Unrestricted" in frames["ihh:rights"] and frames["ihh:rightsFrom"] == "SOURCES.md section"
    assert basis["X-M-0003"]["ihh:holder"] == "Other Museum, 7"
    assert basis["X-M-0003"]["ihh:holderFrom"] == "media record"
    assert basis["NMAH-1.jpg"]["ihh:holder"] == "not stated in source notes"
    assert basis["NMAH-1.jpg"]["ihh:rights"] == "not stated in source notes"
    counts = nodes_by_id(doc)["ihh:site-provenance"]["ihh:counts"]
    assert counts["holdersNotStated"] == 1 and counts["rightsNotStated"] == 1


FRAMES_SOURCES = """# Room: sources

X-M-0001 (frame 16) is the room's basis frame.

## Basis photographs

Holder: Example Archive, roll 7.

| Frames | What they show | Used for |
|---|---|---|
| 16, 17 | The bay | Camera |
| 19, 20, 21 | The fireplace | Mantel |

## Modelling references (no pixels used)

| Media | Holder, identifier | Rights | Used for |
|---|---|---|---|
| X-M-0003 | Other Museum, IAS E 42 | rights unknown | The porch |
"""

FRAMES_INVENTORY = """# Room: inventory

Basis: roll 7. Reference: IAS E 42 ("E42").

| Object (node) | Position | Material | Seen in | Notes |
|---|---|---|---|---|
| Window (`artifact_window`) | south | glass | 16 | |
| Drapes (`drapes`) | south | cloth | 17 | |
| Mantel (`artifact_mantel`) | west | marble | 19-21 | |
| Porch (`porch`) | outside | wood | E42 (one pot visible) | |
| Rug (`rug`) | floor | wool | all | Pattern simplified. |
| Lamp (`lamp`) | desk | brass | 17, 99 | |
| Ceiling | plain | | not photographed | |
"""


def test_shown_by_resolves_frames_and_short_names_and_never_overclaims(tmp_path):
    repo, facts = make_repo(tmp_path)
    (repo / "assets-src/x-desk-room/SOURCES.md").write_text(FRAMES_SOURCES)
    (repo / "assets-src/x-desk-room/INVENTORY.md").write_text(FRAMES_INVENTORY)
    room = nodes_by_id(build(repo, facts, TOUR, built_not_shown=["x-unused-room"]))["ihh:room-x-desk-room"]
    ids = {b.get("ihh:mediaId") or b["ihh:identifier"]: b["@id"] for b in room["isBasedOn"]}
    parts = {p["name"]: p["ihh:shownBy"] for p in room["hasPart"]}
    assert parts["Window"] == [{"@id": "ihh:X-M-0001"}]            # frame 16 is X-M-0001 (SOURCES.md)
    assert parts["Drapes"] == [{"@id": ids["16, 17"]}]              # frame 17: its frame group
    assert parts["Mantel"] == [{"@id": ids["19, 20, 21"]}]
    assert parts["Porch"] == [{"@id": "ihh:X-M-0003"}]              # "E42" is defined in the inventory
    assert parts["Rug"] == [{"ihh:seenText": "all", "ihh:unresolved": True}]
    assert parts["Lamp"] == [{"@id": ids["16, 17"]}, {"ihh:seenText": "99", "ihh:unresolved": True}]
    assert parts["Ceiling"] == []


def test_yes_resolves_only_when_the_room_has_one_photograph(tmp_path):
    repo, facts = make_repo(tmp_path)
    inv = INVENTORY.replace("| X-M-0001 | Carving simplified. |", "| yes | Carving simplified. |")
    (repo / "assets-src/x-desk-room/INVENTORY.md").write_text(inv)
    one = SOURCES.split("## Modelling references")[0] + "## Third-party assets" + SOURCES.split("## Third-party assets")[1]
    (repo / "assets-src/x-desk-room/SOURCES.md").write_text(one)
    parts = {p["name"]: p["ihh:shownBy"] for p in nodes_by_id(build(repo, facts, TOUR, built_not_shown=["x-unused-room"]))["ihh:room-x-desk-room"]["hasPart"]}
    assert parts["Desk"] == [{"@id": "ihh:X-M-0001"}]
    (repo / "assets-src/x-desk-room/SOURCES.md").write_text(SOURCES)  # two photographs: "yes" names neither
    parts = {p["name"]: p["ihh:shownBy"] for p in nodes_by_id(build(repo, facts, TOUR, built_not_shown=["x-unused-room"]))["ihh:room-x-desk-room"]["hasPart"]}
    assert parts["Desk"] == [{"ihh:seenText": "yes", "ihh:unresolved": True}]


def test_a_shown_record_that_is_not_verified_is_marked_and_warned(tmp_path, monkeypatch):
    import export_site_provenance as esp
    repo, facts = make_repo(tmp_path)
    media = facts / "data/inductees/x/media.jsonl"
    media.write_text(media.read_text().replace('"title": "A letter", "credit": "Example Archive, 13", "url": "https://example.org/13", '
                                               '"rights_statement": "Public domain", "license_class": "public-domain", "status": "verified"',
                                               '"title": "A letter", "credit": "Example Archive, 13", "url": "https://example.org/13", '
                                               '"rights_statement": "Public domain", "license_class": "public-domain", "status": "disputed"'))
    monkeypatch.setitem(esp.OWNER_RULED, "X-M-0002", "Owner ruling: an official record, may be displayed.")
    doc = build(repo, facts, TOUR, built_not_shown=["x-unused-room"])
    rec = nodes_by_id(doc)["ihh:record-X-M-0002"]
    assert rec["ihh:recordStatus"] == "disputed"
    assert rec["ihh:shownWhileNotVerified"] is True
    assert rec["ihh:ownerRuling"] == "Owner ruling: an official record, may be displayed."
    assert any("X-M-0002" in w and "disputed" in w for w in nodes_by_id(doc)["ihh:site-provenance"]["ihh:warnings"])


def test_rights_words_keep_their_quotes_balanced():
    from export_site_provenance import _unquote
    assert _unquote('"No known restrictions on publication."') == "No known restrictions on publication."
    assert _unquote('"Usage Conditions Apply" (rights-restricted)') == '"Usage Conditions Apply" (rights-restricted)'
    assert _unquote('"Public Domain Mark"; copyright field "Upphovsrätt utslocknad"') == '"Public Domain Mark"; copyright field "Upphovsrätt utslocknad"'


def test_rooms_index_says_where_the_room_folders_resolve(tmp_path):
    repo, facts = make_repo(tmp_path)
    md = write_index(build(repo, facts, TOUR, built_not_shown=["x-unused-room"]))
    assert "resolve only in the app repository on branch revamp/mockups" in md


HABS_SOURCES = """# Study: sources

## Basis documents (Library of Congress, Prints & Photographs, HABS XX-1)

| Item | Caption (LoC) | Used for | URL |
|---|---|---|---|
| Photo 13 | "BEDROOM & STUDY" | Walls; textures | https://www.loc.gov/resource/hhh.xx0001.photos/?sp=13 |
| Sheet 3 | "Second floor plan" | Room size | https://www.loc.gov/resource/hhh.xx0001.sheet/?sp=4 |
| Photo 2 | "Original 1900 - Recopy 1960" | Not used. | https://www.loc.gov/resource/hhh.xx0001.photos/?sp=2 |
"""


def test_a_row_of_a_store_record_inherits_its_licence_class(tmp_path):
    repo, facts = make_repo(tmp_path)
    (repo / "assets-src/x-desk-room/SOURCES.md").write_text(HABS_SOURCES)
    with open(facts / "data/inductees/x/media.jsonl", "a") as f:
        f.write(json.dumps({"id": "X-M-0015", "title": "A house", "credit": "LoC, HABS XX-1", "url": "https://www.loc.gov/item/xx0001/",
                            "rights_statement": "No known restrictions on images made by the U.S. Government; images copied "
                            "from other sources may be restricted.", "license_class": "unknown", "status": "verified"}) + "\n")
    room = nodes_by_id(build(repo, facts, TOUR, built_not_shown=["x-unused-room"]))["ihh:room-x-desk-room"]
    rows = {b["ihh:identifier"]: b for b in room["isBasedOn"]}
    for name in ("Photo 13", "Sheet 3"):
        assert rows[name]["ihh:role"] == "modelling-reference"
        assert rows[name]["ihh:partOfRecord"] == {"@id": "ihh:X-M-0015"}
        assert rows[name]["ihh:licenseClass"] == "unknown"
        assert "X-M-0015" in rows[name]["ihh:roleReason"]


def test_a_row_demoted_by_its_own_words_says_why(tmp_path):
    from export_site_provenance import parse_sources
    p = tmp_path / "SOURCES.md"
    p.write_text(ROW_ROLES)
    ku = next(i for i in parse_sources(p)[0] if i["identifier"] == "KU-1907")
    assert "PRIVATE MODELLING REFERENCE ONLY" in ku["roleReason"]


def test_sentences_do_not_break_inside_a_quotation():
    from export_site_provenance import _rights_sentences
    prose = ('Holder: A Society. Holder’s description: "View of the lake. The area is now a park." '
             'Copyright status (holder’s words): "NO COPYRIGHT - UNITED STATES". Downloaded with the page’s link.')
    assert _rights_sentences(prose) == 'Copyright status (holder’s words): "NO COPYRIGHT - UNITED STATES".'


def test_rooms_index_does_not_repeat_a_licence_class_the_rights_words_already_give(tmp_path):
    repo, facts = make_repo(tmp_path)
    (repo / "assets-src/x-desk-room/SOURCES.md").write_text(ROW_ROLES)
    with open(facts / "data/inductees/x/media.jsonl", "a") as f:
        f.write(json.dumps({"id": "X-M-0060", "title": "A pipe", "credit": "A Museum", "url": "https://example.org/60",
                            "rights_statement": "Usage Conditions Apply", "license_class": "rights-restricted", "status": "verified"}) + "\n")
    md = write_index(build(repo, facts, TOUR, built_not_shown=["x-unused-room"]))
    assert '"Usage Conditions Apply" (rights-restricted)' in md
    assert "(rights-restricted) (rights-restricted)" not in md


HABS_ITEM_SOURCES = """# Desk room: sources

## Basis documents (HABS XX-1)

| Item | Record | Caption | Used for | URL |
|---|---|---|---|---|
| Photo 13 | X-M-0050 | "BEDROOM & STUDY" | Walls; wallpaper texture | https://www.loc.gov/resource/hhh.xx0001.photos/?sp=13 |
| Sheet 3 | X-M-0053 | "Second floor plan" | Room size | https://www.loc.gov/resource/hhh.xx0001.sheet/?sp=4 |
| Photo 1 | X-M-0045 | "Original 1900 - Recopy 1960" | House form | https://www.loc.gov/resource/hhh.xx0001.photos/?sp=1 |
"""


def test_items_of_a_bundled_record_carry_their_own_rights(tmp_path):
    """A bundled record (licence unknown: it holds recopies) whose government-made items have their own
    records: each item row keeps its own licence class and role, and names the record it belongs to."""
    repo, facts = make_repo(tmp_path)
    (repo / "assets-src/x-desk-room/SOURCES.md").write_text(HABS_ITEM_SOURCES)
    (repo / "assets-src/x-desk-room/meta.json").write_text(json.dumps({"texturesFrom": [{"media": "X-M-0050", "what": "wallpaper tile"}]}))
    tile = "https://tile.loc.gov/storage-services/service/pnp/habshaer/xx/xx0000/xx0001/"
    gov = "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted."
    with open(facts / "data/inductees/x/media.jsonl", "a") as f:
        for rec in (
            {"id": "X-M-0015", "title": "A house", "url": "https://www.loc.gov/item/xx0001/", "license_class": "unknown", "status": "verified"},
            {"id": "X-M-0050", "title": "13. BEDROOM & STUDY", "url": tile + "photos/0013pv.jpg", "license_class": "public-domain", "status": "verified"},
            {"id": "X-M-0053", "title": "3. Second floor plan", "url": tile + "sheet/00003v.jpg", "license_class": "public-domain", "status": "verified"},
            {"id": "X-M-0045", "title": "1. Original 1900 - Recopy 1960", "url": tile + "photos/0001pv.jpg", "license_class": "unknown", "status": "disputed"},
        ):
            f.write(json.dumps({"credit": "LoC, HABS XX-1", "rights_statement": gov, **rec}) + "\n")
    room = nodes_by_id(build(repo, facts, TOUR, built_not_shown=["x-unused-room"]))["ihh:room-x-desk-room"]
    rows = {b["ihh:mediaId"]: b for b in room["isBasedOn"]}
    for mid in ("X-M-0050", "X-M-0053"):
        assert rows[mid]["ihh:role"] == "basis"
        assert rows[mid]["ihh:licenseClass"] == "public-domain"
        assert rows[mid]["ihh:partOfRecord"] == {"@id": "ihh:X-M-0015"}
        assert rows[mid]["ihh:rightsLevel"] == "item"
    assert rows["X-M-0050"]["ihh:pixelsShown"] is True
    assert rows["X-M-0053"]["ihh:pixelsShown"] is False
    recopy = rows["X-M-0045"]
    assert recopy["ihh:role"] == "modelling-reference"
    assert recopy["ihh:licenseClass"] == "unknown"
    assert recopy["ihh:partOfRecord"] == {"@id": "ihh:X-M-0015"}
    assert recopy["ihh:pixelsShown"] is False
    assert "unknown" in recopy["ihh:roleReason"]
    # a row that names its record keeps its short name for the inventory's words
    from export_site_provenance import seen_resolver
    resolve = seen_resolver(room["isBasedOn"], HABS_ITEM_SOURCES)
    assert resolve("the leaf is the sheet 3 type") == [{"@id": "ihh:X-M-0053"}]
