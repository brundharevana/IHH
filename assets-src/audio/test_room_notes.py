"""Room notes (kind "room-note") describe the recreation, not the inductee, and quote its INVENTORY.md.
A measurement, count or date in a room note is a claim about the real place, so it must come from a
verified fact: every number (a digit, a number word, a unit such as m or storeys) and every date in a
note's text must appear in the claim of one of the note's `number_facts` (verified fact ids). A note
with no `number_facts` may carry no number at all. The guide's wayfinding lines may not ground a
number on a room note's INVENTORY excerpts either (Task 14c fix round 1).

Run from the repo root: python3 -m pytest assets-src/audio/test_room_notes.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_narration import check_room_note, check_wayfinding  # noqa: E402

BASIS = "assets-src/audio/test_fixtures/INVENTORY.md"
FACTS = {
    "MUI-F-0145": {"claim": "John Muir's birthplace is 126 and 128 High Street, Dunbar.", "status": "verified"},
    "MUI-F-0999": {"claim": "A claim with no number in it.", "status": "verified"},
    "MUI-F-0998": {"claim": "The lake was 340 m across.", "status": "single-source"},
}


def note(text, source, **kw):
    return {"cue": "n1", "kind": "room-note", "fact_ids": [], "basis": BASIS, "source": source, "text": text, **kw}


def test_the_old_fountain_lake_line_fails():
    # Task 14c shipped this: the figures are modelling estimates (+-30 %, the meadow "kept level")
    errs = check_room_note(note("The lake: about 340 m across, 5 m below the meadow. Its outline is smoothed: the frames show its near curve.",
                                ["Lake", "about 340 m across, 5 m below the meadow", "Outline smoothed (the frames show its near curve)."]), FACTS)
    assert any("number" in e for e in errs)


def test_a_unit_count_fails():
    assert check_room_note(note("The hotel: 2 storeys and attic, 6 bays.", ["Lorne Temperance Hotel", "2 storeys and attic, 6 bays"]), FACTS)


def test_a_number_word_fails():
    assert check_room_note(note("Bare trees: nine trunks in front of the building.", ["Bare trees", "nine trunks in front of the building"]), FACTS)


def test_a_note_without_numbers_passes():
    assert not check_room_note(note("The lake. Its outline is smoothed: the frames show its near curve.", ["Lake", "Outline smoothed (the frames show its near curve)."]), FACTS)


def test_a_number_from_a_cited_verified_fact_passes():
    assert not check_room_note(note("126 and 128 High Street, from the listing.", ["126 and 128 High Street", "from the listing"], number_facts=["MUI-F-0145"]), FACTS)


def test_a_cited_fact_without_the_number_fails():
    assert check_room_note(note("126 and 128 High Street, from the listing.", ["126 and 128 High Street", "from the listing"], number_facts=["MUI-F-0999"]), FACTS)


def test_an_unverified_number_fact_fails():
    assert check_room_note(note("The lake: about 340 m across.", ["Lake", "about 340 m across"], number_facts=["MUI-F-0998"]), FACTS)


def test_wayfinding_numbers_never_ground_on_room_note_excerpts():
    # the excerpt is ground for words, never for numbers
    assert any("numbers not grounded" in e for e in check_wayfinding("Look at the lake, 340 m across.", ["The lake"], number_ground=["The lake"]))
    assert not check_wayfinding("Look at the lake with me.", ["The lake", "about 340 m across"], number_ground=["The lake"])
