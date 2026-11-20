"""A line's 'speak' override is what the guide's voice says (build_guide_audio.py voices it in place of
'text'), so it is held to the same rules as the text: once its spoken forms are read back as written
("twenty-seventh" -> 27, "one twelve" -> 112, "Doctor" where the text has "Dr."), it must carry exactly
the text's dates, numbers, codes and content words, no more and no fewer, and no pronoun the text lacks.
A number the voice says that the caption does not carry is a fact the gate never checked.

Run from the repo root: python3 -m pytest assets-src/audio/test_speak.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_narration import speak_errors, written_form  # noqa: E402


def test_rejects_a_speak_override_with_an_unverified_number():
    # the caption says 13 (verified); the voice would say 14
    assert speak_errors("He wrote 13 rules of the game.", "He wrote fourteen rules of the game.")


def test_rejects_a_speak_override_that_adds_a_number():
    assert speak_errors("He wrote 13 rules of the game.", "In 1891, he wrote thirteen rules of the game.")


def test_rejects_a_speak_override_that_drops_a_number():
    assert speak_errors("He succeeded Rev. Hector Cowan in 1898.", "He succeeded the Reverend Hector Cowan.")


def test_rejects_a_speak_override_with_a_different_day():
    assert speak_errors("On January 27, 1993, he was sworn in.", "On January twenty-eighth, 1993, he was sworn in.")


def test_rejects_a_speak_override_that_adds_a_word():
    assert speak_errors("He wrote 13 rules of the game.", "He wrote thirteen famous rules of the game.")


def test_rejects_a_speak_override_with_the_wrong_pronoun():
    assert speak_errors("He wrote 13 rules of the game.", "She wrote thirteen rules of the game.", slug="naismith")


def test_an_expansion_needs_the_abbreviation_in_the_text():
    # "Doctor" stands for "Dr." only where the text has "Dr."
    assert speak_errors("He met John Strentzel.", "He met Doctor John Strentzel.")
    assert not speak_errors("He met Dr. John Strentzel.", "He met Doctor John Strentzel.")


def test_accepts_the_spoken_forms_the_tour_uses():
    pairs = [
        ("On January 27, 1993, he was sworn in.", "On January twenty-seventh, 1993, he was sworn in."),
        ("It has petition number 4009.", "It has petition number forty oh nine."),
        ("He had a study at 112 Mercer Street.", "He had a study at one twelve Mercer Street."),
        ("His birthplace is 126 and 128 High Street.", "His birthplace is one twenty-six and one twenty-eight High Street."),
        ("They were awarded U.S. Patent 2,292,387 in 1942.",
         "They were awarded U.S. Patent two million, two hundred ninety-two thousand, three hundred eighty-seven, in 1942."),
        ("This is the Oval Office as photographed on 20 April 1993.",
         "This is the Oval Office as photographed on the twentieth of April, 1993."),
        ("During World War II, he was a consultant.", "During World War Two, he was a consultant."),
        ("He was at Princeton, N.J., then.", "He was at Princeton, New Jersey, then."),
        ("THE ARMY HOUR of 1954-03-05 has a sequence.", "The Army Hour of March 5, 1954 has a sequence."),
        ("The U.S. flag.", "The U S flag."),
        ("Gottenberg [sic], Sweden.", "Gottenberg, Sweden."),
    ]
    for text, speak in pairs:
        assert not speak_errors(text, speak), (text, speak, speak_errors(text, speak))


def test_written_form_reads_spoken_numbers_back():
    assert "112" in written_form("one twelve Mercer Street", "112 Mercer Street")
    assert "January 27" in written_form("January twenty-seventh, 1993", "January 27, 1993")


# --- the wiring: check() runs the speak gate on openings, fact lines and room notes -------------------
# A copy of a real narration file in a temporary NARRATION folder, with one speak changed: check() must
# count that line as failing. The facts, the fact index and the INVENTORY bases are the real ones.
import copy  # noqa: E402
import json  # noqa: E402

import check_narration  # noqa: E402

REAL = Path(__file__).resolve().parent / "narration"


def run_check(tmp_path, monkeypatch, slug, edit):
    d = json.loads((REAL / f"{slug}.json").read_text())
    edit(d["chapters"])
    (tmp_path / f"{slug}.json").write_text(json.dumps(d))
    monkeypatch.setattr(check_narration, "NARRATION", tmp_path)
    return check_narration.check(slug)


def line(chapters, n, cue):
    return next(l for l in chapters[n]["lines"] if l["cue"] == cue)


def test_check_passes_the_real_files_unchanged(tmp_path, monkeypatch):
    # the baseline the tests below change one speak of
    assert run_check(tmp_path, monkeypatch, "naismith", lambda c: None) == 0
    assert run_check(tmp_path, monkeypatch, "albright", lambda c: None) == 0
    assert run_check(tmp_path, monkeypatch, "muir", lambda c: None) == 0


def test_check_fails_a_fact_line_whose_speak_has_an_unverified_number(tmp_path, monkeypatch, capsys):
    def edit(c):
        line(c, "2", "c3")["speak"] = "He wrote fourteen rules of the game."
    assert run_check(tmp_path, monkeypatch, "naismith", edit) == 1
    assert "FAIL naismith ch2 c3: speak: numbers differ" in capsys.readouterr().out


def test_check_fails_an_opening_whose_speak_has_another_day(tmp_path, monkeypatch, capsys):
    def edit(c):
        o = c["birth"]["opening"]
        o["speak"] = o["speak"].replace("May fifteenth", "May sixteenth")
    assert run_check(tmp_path, monkeypatch, "albright", edit) == 1
    assert "FAIL albright birth opening: speak: dates differ" in capsys.readouterr().out


def test_check_fails_a_room_note_whose_speak_has_another_date(tmp_path, monkeypatch, capsys):
    # (the Albright room note this test edited is gone: round 7 re-review 2 and round 8 removed it; the Hutchings
    # House arrival note is a room note that stays)
    def edit(c):
        n = line(c, "7", "n1")
        n["speak"] = n["text"].replace("It is not", "It was photographed on the twenty-first of April, 1993. It is not")
    assert run_check(tmp_path, monkeypatch, "muir", edit) == 1
    assert "FAIL muir ch7 n1: speak: dates differ" in capsys.readouterr().out


def test_the_line_own_check_runs_on_the_speak(tmp_path, monkeypatch, capsys):
    # text and speak agree with each other (speak_errors finds nothing) but both say 14 where the
    # verified source says 13: the line's own check, run on the speak, must report it as well
    def edit(c):
        l = line(c, "2", "c3")
        l["text"], l["speak"] = "He wrote 14 rules of the game.", "He wrote fourteen rules of the game."
    assert run_check(tmp_path, monkeypatch, "naismith", edit) == 1
    out = capsys.readouterr().out
    assert "speak: numbers differ: source ['13'] vs text ['14']" in out
    assert "speak: speak:" not in out  # the speak agrees with its text


def test_spoken_errors_runs_the_given_check_on_the_speak_read_back_as_written():
    seen = []
    item = {"text": "He had a study at 112 Mercer Street.", "speak": "He had a study at one twelve Mercer Street."}
    errs = check_narration.spoken_errors(item, "einstein", lambda it: seen.append(it["text"]) or ["boom"])
    assert seen == ["He had a study at 112 Mercer Street."]
    assert errs == ["speak: boom"]
    assert check_narration.spoken_errors({"text": "x"}, "einstein", lambda it: ["boom"]) == []
