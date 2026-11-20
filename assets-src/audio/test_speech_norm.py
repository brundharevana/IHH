"""The spoken-text normaliser (speech_norm.py) and the sentence split the audio build uses: state and
province abbreviations and a person's initials are said whole, never with the pause espeak puts after a
full stop (owner feedback round 9: "N.J." was read "N", pause, "J"), and they never split a line into
two sentences. Captions are not touched: only the words said change.

Run from the repo root: python3 -m pytest assets-src/audio/test_speech_norm.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from speech_norm import TESTS, ends_sentence, normalize, selftest  # noqa: E402


def test_every_listed_case():
    assert selftest(verbose=False) == 0, [(s, normalize(s, k), w) for s, k, w in TESTS if normalize(s, k) != w]


def test_state_abbreviations_are_said_in_full():
    assert normalize("a rally at Military Common, Orange, N. J.") == "a rally at Military Common, Orange, New Jersey."
    assert normalize("in his study at Princeton, N.J., he") == "in his study at Princeton, New Jersey, he"
    assert "Texas" in normalize("San Antonio, Tex., August 8, 1936")
    assert "Massachusetts" in normalize("Springfield, Mass.")


def test_a_word_that_is_also_a_state_form_stays_a_word():
    assert normalize("Miss Kiesler arrived.") == "Miss Kiesler arrived."
    assert normalize("I was in Wash. when") != ""  # not after a place name: left alone
    assert "Washington" not in normalize("I was in Wash. when")


def test_initials_lose_their_full_stop():
    assert normalize("Clifford L. Comstock") == "Clifford L Comstock"
    assert normalize("H. C. White Co.") == "H C White Co."


def test_the_sentence_split_keeps_abbreviations_and_initials_inside():
    import build_guide_audio as b

    assert b.sentences("On the tour she was at a rally at Military Common, Orange, N. J.") == ["On the tour she was at a rally at Military Common, Orange, N. J."]
    assert b.sentences("He is with Clifford L. Comstock. He smiles.") == ["He is with Clifford L. Comstock.", "He smiles."]
    # round 9 fix round 1: a state abbreviation that ends a sentence keeps its full stop (a capitalised word follows)
    assert b.sentences("He lived at Princeton, N.J. In 1943 he worked.") == ["He lived at Princeton, N.J.", "In 1943 he worked."]
    assert len(b.sentences("He came in 1933. He stayed.")) == 2
    assert not ends_sentence("N.") and not ends_sentence("Tex.") and ends_sentence("here.")


# round 9 fix round 1 (review of part A): a sentence that ends with a state abbreviation keeps its stop; "Miss." before
# a name stays "Miss."; "no.", "I." and "Dec." end a sentence when they end one
def test_a_state_abbreviation_that_ends_a_sentence_keeps_the_stop():
    assert normalize("They met at Orange, N. J. He left.") == "They met at Orange, New Jersey. He left."
    assert normalize("They met at Orange, N. J.") == "They met at Orange, New Jersey."
    assert normalize("in his study at Princeton, N.J., he") == "in his study at Princeton, New Jersey, he"
    import build_guide_audio as b
    assert b.sentences("They met at Orange, N. J. He left.") == ["They met at Orange, N. J.", "He left."]


def test_miss_before_a_name_is_not_a_state():
    assert normalize("She wrote from Ohio, Miss. Kiesler said.") == "She wrote from Ohio, Miss. Kiesler said."
    assert "Mississippi" in normalize("They lived at Jackson, Miss., in 1900.")
    for w in ("Ind.", "Wash.", "La.", "Man."):
        assert normalize(f"From Ohio, {w} Smith came.").count(w) == 1


def test_no_i_and_dec_end_a_sentence_at_its_end():
    assert ends_sentence("no.", "He said", " Then") and not ends_sentence("No.", "It was", " 5")
    assert ends_sentence("I.", "So did", " Then") and not ends_sentence("I.", "Charles", " Smith")
    assert ends_sentence("Dec.", "It was in", " Then") and not ends_sentence("Dec.", "on", " 7")
    import build_guide_audio as b
    assert b.sentences("He said no. Then he left.") == ["He said no.", "Then he left."]
    assert b.sentences("It was No. 5 on the list.") == ["It was No. 5 on the list."]
    assert b.sentences("So did I. Then we left.") == ["So did I.", "Then we left."]
