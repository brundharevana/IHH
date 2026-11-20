"""Chapter openings (spec 2.5): place + date, one human detail, an invitation to look around, as a human sentence
(owner feedback round 8; the dateline form fails app/src/tour/data/narration.test.js). An
opening may say only what its cited verified facts say (dates, numbers, places, content words), plus
the short invitation / connective allowlist in check_narration.py.

Run from the repo root: python3 -m pytest assets-src/audio/test_openings.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_narration import check_line  # noqa: E402

FACTS = {"EIN-F-0149": "the Nobel Lecture was delivered to the Nordic Assembly of Naturalists at Gothenburg, July 11, 1923"}


def test_rejects_new_date():
    assert check_line("Gothenburg, 1925. Take a moment and look around.", ["EIN-F-0149"], FACTS)


def test_accepts_grounded_opening():
    assert not check_line("Gothenburg, July 1923. He gave his Nobel Lecture here. Take a moment and look around.", ["EIN-F-0149"], FACTS)


def test_rejects_new_place():
    # "Sweden" is not in the cited fact
    assert check_line("Gothenburg, Sweden, July 1923. Have a look around.", ["EIN-F-0149"], FACTS)


def test_rejects_wrong_day():
    assert check_line("Gothenburg, July 12, 1923. Have a look around.", ["EIN-F-0149"], FACTS)


def test_rejects_new_content_word():
    assert check_line("Gothenburg, July 1923. He gave his famous Nobel Lecture here. Have a look around.", ["EIN-F-0149"], FACTS)


def test_rejects_uncited_or_unverified_fact():
    assert check_line("Gothenburg, July 1923. Have a look around.", ["EIN-F-9999"], FACTS)
    assert check_line("Gothenburg, July 1923. Have a look around.", [], FACTS)


def test_rejects_wrong_pronoun():
    assert check_line("Gothenburg, July 1923. She gave her Nobel Lecture here.", ["EIN-F-0149"], FACTS, slug="einstein")


def test_year_alone_matches_a_full_date():
    assert not check_line("Gothenburg, 1923. Walk around, if you like.", ["EIN-F-0149"], FACTS)


def test_rejects_plural_pronoun():
    assert check_line("Gothenburg, July 1923. They gave their Nobel Lecture here.", ["EIN-F-0149"], FACTS, slug="einstein")


def test_while_is_not_an_invitation_word():
    assert check_line("Gothenburg, July 1923. While here, he gave his Nobel Lecture.", ["EIN-F-0149"], FACTS)


# Where an opening may sit (check_narration.opening_key_errors): under its chapter kind, or, for a
# second chapter of a kind already used in the tour, under that chapter's id with its "kind" named.
# `chapters` is the tour's chapter list (app/src/tour/data/chapters.generated.json).
KINDS = ["birth", "big-work", "history"]
TOUR = [{"id": "birth", "kind": "birth"}, {"id": "big-work", "kind": "big-work"}, {"id": "study", "kind": "big-work"}]


def test_opening_under_its_kind():
    from check_narration import opening_key_errors
    assert not opening_key_errors("birth", {"opening": {}}, KINDS, TOUR)


def test_opening_under_a_chapter_id_names_its_kind():
    from check_narration import opening_key_errors
    assert not opening_key_errors("study", {"kind": "big-work", "opening": {}}, KINDS, TOUR)
    # a chapter id without a kind, or with an unknown kind, is refused
    assert opening_key_errors("study", {"opening": {}}, KINDS, TOUR)
    assert opening_key_errors("study", {"kind": "studio", "opening": {}}, KINDS, TOUR)


def test_a_kind_key_cannot_claim_another_kind():
    from check_narration import opening_key_errors
    assert opening_key_errors("birth", {"kind": "history", "opening": {}}, KINDS, TOUR)


def test_an_id_key_only_for_a_second_chapter_of_a_kind():
    from check_narration import opening_key_errors
    # no such chapter, the wrong kind, the first chapter of its kind, or a tour without chapters
    assert opening_key_errors("garden", {"kind": "big-work", "opening": {}}, KINDS, TOUR)
    assert opening_key_errors("study", {"kind": "history", "opening": {}}, KINDS, TOUR)
    first = [{"id": "study", "kind": "big-work"}, {"id": "big-work", "kind": "big-work"}]
    assert opening_key_errors("study", {"kind": "big-work", "opening": {}}, KINDS, first)
    assert opening_key_errors("study", {"kind": "big-work", "opening": {}}, KINDS, None)


SIC_FACTS = {"EIN-F-0150": "Einstein delivered an address at Gottenberg, Sweden, before a scientific body on his theory of relativity."}


def test_sic_marks_a_source_spelling_only():
    # "[sic]" may follow a word of the cited claim (the source's own spelling), and adds no content
    assert not check_line("Gottenberg [sic], Sweden. Einstein delivered an address. Take a moment and look around.", ["EIN-F-0150"], SIC_FACTS)
    # it may not follow a word the claim lacks, and the bare word is still a content word
    assert check_line("Gothenburg [sic], Sweden. Take a moment and look around.", ["EIN-F-0150"], SIC_FACTS)
    assert check_line("Gottenberg sic, Sweden. Take a moment and look around.", ["EIN-F-0150"], SIC_FACTS)


def test_a_natural_sentence_opening_passes_the_same_rules():
    # owner feedback round 8: the human-sentence form ("He gave ... in Gothenburg, in July 1923") is held to the same
    # rules as the old dateline form: no new date, place or content word
    assert not check_line("In July 1923, he gave his Nobel Lecture at Gothenburg. Take a moment and look around.", ["EIN-F-0149"], FACTS)
    assert check_line("In July 1925, he gave his Nobel Lecture at Gothenburg. Take a moment and look around.", ["EIN-F-0149"], FACTS)
    assert check_line("In July 1923, he gave his famous Nobel Lecture at Gothenburg, Sweden.", ["EIN-F-0149"], FACTS)


# --- the opening's form (owner feedback round 8; review I-2): a human sentence with the inductee as the subject of its
# first clause, never a dateline, whatever punctuation closes the dateline ---------------------------------------
from check_narration import opening_form_errors  # noqa: E402


def test_every_dateline_form_fails():
    for probe in [
        "Ulm, Germany, 14 March 1879. Albert Einstein was born here.",
        "Ulm, Germany, 14 March 1879: Albert Einstein was born here.",
        "Ulm, Germany, 14 March 1879 — Albert Einstein was born here.",
        "Ulm, Germany, 14 March 1879! Albert Einstein was born here.",
        "Princeton, 1933; he arrived.",
        "Ulm, Germany, 14 March 1879, his birthplace.",
        "In 1933, Ulm: he was there.",
    ]:
        assert opening_form_errors(probe, "einstein"), probe
    assert opening_form_errors("Dunbar, Scotland, April 21, 1838, at 126 and 128 High St. John Muir was born here.", "muir")


def test_the_inductee_must_be_the_subject_of_the_first_clause():
    # a pronoun or the name somewhere later, or a possessive, is not the subject
    assert opening_form_errors("In 1898, Kansas hired James Naismith.", "naismith")
    assert opening_form_errors("Albert Einstein's special theory of relativity is from 1905.", "einstein")
    assert opening_form_errors("The motion picture poster shows her.", "lamarr")
    # a pronoun of the inductee's own gender only
    assert opening_form_errors("She was born in Ulm.", "einstein")


def test_human_sentences_pass():
    assert not opening_form_errors("Albert Einstein was born in Ulm, Germany, on 14 March 1879. Take a moment and look around.", "einstein")
    assert not opening_form_errors("In 1898, James Naismith was hired by the University of Kansas.", "naismith")
    assert not opening_form_errors("On January 22, 1997, Madeleine Albright was confirmed as Secretary of State.", "albright")
    assert not opening_form_errors("A year after his letter to the President, Albert Einstein received his certificate.", "einstein")
    assert not opening_form_errors("In 1941, a year after Hedy Lamarr met George Antheil, she and Antheil signed.", "lamarr")
