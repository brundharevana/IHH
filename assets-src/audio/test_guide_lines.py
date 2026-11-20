"""The guide's wayfinding lines (app/src/shared/guide/lines.json) may make no claim: every content
word is a wayfinding word or grounded in the room / stop data, every date and number grounded
(check_narration.check_guide_lines). Run from the repo root: python3 -m pytest assets-src/audio/test_guide_lines.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_narration import check_guide_lines, check_wayfinding  # noqa: E402

FLOOR = ["The gymnasium, Springfield", "The gymnasium floor"]
JOURNAL = ["Topeka state journal, 1898", "The Topeka state journal (Topeka, Kansas), September 10, 1898, (THIRD EDITION)"]


def test_neutral_wayfinding_line_passes():
    assert not check_wayfinding("Look across the floor with me.", FLOOR)
    assert not check_wayfinding("Before you go, take a moment on the floor.", FLOOR)


def test_invented_claim_fails():
    # nothing in the room or stop data says the game was invented on this floor
    assert check_wayfinding("He invented the game right here on this floor.", FLOOR)
    assert check_wayfinding("Come and see the book of the rules.", ["Basket ball, 1894", "Basket ball. (1894)"])


def test_dates_and_numbers_must_be_grounded():
    assert not check_wayfinding("Come and see the journal from 1898.", JOURNAL)
    assert check_wayfinding("Come and see the journal from 1899.", JOURNAL)
    errs = check_wayfinding("Look across the floor 13 times.", FLOOR)
    assert any("numbers not grounded" in e for e in errs)


def test_lines_are_checked_against_their_own_room_and_stop():
    lines = {
        "landing": {"offer": ["This is {n}. Would you like me to walk you through {pos} story?"]},
        "tour": {
            "done": ["That's everything in this room."],
            "arrivals": ["Welcome to the study."], "intros": {}, "nudges": {},
            "rooms": {"gym": {"arrivals": ["Welcome to the gymnasium."],
                              "intros": {"floor": ["Now, the floor where the first game was played."]},
                              "nudges": {"floor": ["You haven't looked at the floor yet."]}}},
        },
    }
    ground = {"rooms": {
        "study": {"titles": ["The study"], "stops": {}},
        "gym": {"titles": ["The gymnasium, Springfield"], "stops": {"floor": {"name": "The gymnasium floor", "record": None, "clipKeys": []}}},
    }}
    # one failure: the intro claims the first game was played there
    assert check_guide_lines(lines, ground, sources={}, inductees=5) == 1
    lines["tour"]["rooms"]["gym"]["intros"]["floor"] = ["Look across the floor with me."]
    assert check_guide_lines(lines, ground, sources={}, inductees=5) == 0
    # a room no tour uses fails
    lines["tour"]["rooms"]["lost"] = {"arrivals": [], "intros": {}, "nudges": {}}
    assert check_guide_lines(lines, ground, sources={}, inductees=5) == 1


def test_the_shipped_lines_pass():
    assert check_guide_lines() == 0


def test_a_room_with_stops_must_have_intros_and_nudges():
    # (Codex review, round 9: a missing section was read as empty and skipped every check)
    ground = {"rooms": {
        "study": {"titles": ["The study"], "stops": {}},
        "gym": {"titles": ["The gymnasium, Springfield"], "stops": {"floor": {"name": "The gymnasium floor", "record": None, "clipKeys": []}}},
        "lawn": {"titles": ["The lawn"], "stops": {}},
    }}
    lines = {
        "landing": {"offer": ["This is {n}. Would you like me to walk you through {pos} story?"]},
        "tour": {
            "done": ["That's everything in this room."],
            "arrivals": ["Welcome to the study."], "intros": {}, "nudges": {},
            # a room with a stop and no nudges section; a room with no stop and no sections at all
            "rooms": {"gym": {"arrivals": ["Welcome to the gymnasium."], "intros": {"floor": ["Look across the floor with me."]}},
                      "lawn": {"arrivals": ["Welcome to the lawn."]}},
        },
    }
    assert check_guide_lines(lines, ground, sources={}, inductees=5) == 1
    lines["tour"]["rooms"]["gym"]["nudges"] = {"floor": ["You haven't looked at the floor yet."]}
    assert check_guide_lines(lines, ground, sources={}, inductees=5) == 0


def test_every_stop_of_a_room_has_its_own_intro_and_nudge():
    # (Codex review 2: empty sections, or a stop missing from them, passed, and the app then spoke another stop's intro)
    ground = {"rooms": {
        "study": {"titles": ["The study"], "stops": {}},
        "gym": {"titles": ["The gymnasium, Springfield"], "stops": {
            "floor": {"name": "The gymnasium floor", "record": None, "clipKeys": []},
            "ball": {"name": "The ball", "record": None, "clipKeys": []}}},
    }}

    def lines(intros, nudges):
        return {
            "landing": {"offer": ["This is {n}. Would you like me to walk you through {pos} story?"]},
            "tour": {"done": ["That's everything in this room."], "arrivals": ["Welcome to the study."], "intros": {}, "nudges": {},
                     "rooms": {"gym": {"arrivals": ["Welcome to the gymnasium."], "intros": intros, "nudges": nudges}}},
        }
    full_i = {"floor": ["Look across the floor with me."], "ball": ["Now, the ball."]}
    full_n = {"floor": ["You haven't looked at the floor yet."], "ball": ["There's still the ball."]}
    assert check_guide_lines(lines(full_i, full_n), ground, sources={}, inductees=5) == 0
    # empty sections: both stops lack both lines
    assert check_guide_lines(lines({}, {}), ground, sources={}, inductees=5) == 4
    # one stop missing from intros; one stop with an empty nudge list
    assert check_guide_lines(lines({"floor": full_i["floor"]}, {**full_n, "ball": []}), ground, sources={}, inductees=5) == 2
    # a line for a stop the room does not have (and its words, grounded in no stop, fail too)
    assert check_guide_lines(lines({**full_i, "rope": ["Now, the rope."]}, full_n), ground, sources={}, inductees=5) == 2
