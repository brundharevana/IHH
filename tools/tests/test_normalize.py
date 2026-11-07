"""Tests for tools/ihh/normalize.py: text normalization, dates, and numbers."""

import pytest

from ihh import normalize as n


# --- text normalization (G1) -------------------------------------------------

def test_curly_quotes_and_apostrophes_unify():
    assert n.normalize_text("\u201cIt\u2019s here,\u201d she said") == n.normalize_text('"It\'s here," she said')


def test_dashes_unify():
    for dash in ("\u2010", "\u2011", "\u2012", "\u2013", "\u2014", "\u2015", "\u2212"):
        assert n.normalize_text(f"1914{dash}1918") == "1914-1918"


def test_soft_hyphen_removed():
    assert n.normalize_text("natu\u00adralization") == "naturalization"


def test_nfkc_and_casefold():
    # Ligature, non-breaking space, full-width digits, sharp s.
    assert n.normalize_text("\ufb01le\u00a0No. \uff11\uff19\uff14\uff11 Stra\u00dfe") == "file no. 1941 strasse"


def test_whitespace_collapses():
    assert n.normalize_text("  Arrived \n\t at   the\r\nport  ") == "arrived at the port"


def test_claim_sha256_ignores_presentation_differences():
    a = n.claim_sha256("Test Person\u2019s  arrival \u2014 1941.")
    b = n.claim_sha256("test person's arrival - 1941.")
    assert a == b
    assert len(a) == 64
    assert a != n.claim_sha256("Test Person's arrival - 1942.")


def test_contains_respects_word_boundaries():
    hay = n.normalize_text("Test Person arrived in Exampleton.")
    assert n.contains_normalized(hay, n.normalize_text("arrived in Exampleton"))
    assert not n.contains_normalized(hay, n.normalize_text("rived in Exampleton"))
    assert not n.contains_normalized(hay, n.normalize_text("Example"))
    assert not n.contains_normalized(hay, "")


# --- dates (G2) ----------------------------------------------------------------

@pytest.mark.parametrize("text", [
    "June 10, 1941",
    "June 10 1941",
    "10 June 1941",
    "10th June 1941",
    "the 10th of June, 1941",
    "1941-06-10",
    "Jun. 10, 1941",
    "Jun 10, 1941",
    "June 10th, 1941",
    "JUNE 10, 1941",
])
def test_full_date_formats_parse_to_iso(text):
    assert n.parse_date(text) == "1941-06-10"


def test_september_abbreviations():
    assert n.parse_date("Sept. 3, 1941") == "1941-09-03"
    assert n.parse_date("Sep 3, 1941") == "1941-09-03"


def test_partial_dates():
    assert n.parse_date("June 1941") == "1941-06"
    assert n.parse_date("1941-06") == "1941-06"
    assert n.parse_date("1941") == "1941"


def test_invalid_dates_do_not_parse():
    assert n.parse_date("June 31, 1941") is None
    assert n.parse_date("1941-13-01") is None
    assert n.parse_date("not a date") is None
    assert n.parse_date("") is None


def test_find_dates_in_running_text():
    found = [d.iso for d in n.find_dates("Filed on June 10, 1941 and granted 11 August 1942; noted in 1943.")]
    assert found == ["1941-06-10", "1942-08-11"]


def test_partial_date_within():
    june = n.parse_date_parts("June 1941")
    day = n.parse_date_parts("June 10, 1941")
    year = n.parse_date_parts("1941")
    assert june.within(day)
    assert year.within(day)
    assert not day.within(june)
    assert not n.parse_date_parts("July 1941").within(day)


# --- numbers (G2) --------------------------------------------------------------

@pytest.mark.parametrize("phrase,value", [
    ("one", 1),
    ("thirteen", 13),
    ("twenty", 20),
    ("twenty-one", 21),
    ("twenty one", 21),
    ("ninety-nine", 99),
    ("one hundred", 100),
    ("a hundred", 100),
    ("one hundred and five", 105),
    ("two thousand", 2000),
    ("first", 1),
    ("second", 2),
    ("twelfth", 12),
    ("thirteenth", 13),
    ("twentieth", 20),
    ("twenty-first", 21),
    ("hundredth", 100),
])
def test_number_words(phrase, value):
    assert n.number_word_value(phrase) == value


def test_number_word_value_rejects_non_numbers():
    assert n.number_word_value("person") is None
    assert n.number_word_value("") is None


def test_find_numbers_digits_and_words():
    assert n.find_numbers("thirteen trunks") == ["13"]
    assert n.find_numbers("13 trunks") == ["13"]
    assert n.find_numbers("the 13th trunk") == ["13"]
    assert n.find_numbers("Patent 2,292,387") == ["2292387"]
    assert n.find_numbers("the first of twenty-one") == ["1", "21"]
    assert n.find_numbers("3.5 miles") == ["3.5"]


def test_digits_inside_codes_are_not_numbers():
    assert n.find_numbers("US2292387A") == []


def test_analyze_masks_dates_before_numbers():
    a = n.analyze("Arrived June 10, 1941 with 13 trunks.")
    assert [d.iso for d in a.dates] == ["1941-06-10"]
    assert a.numbers == ["13"]


# --- content words (G2/G6: "nothing added") ------------------------------------------

# Words that state quantity, time, order, degree, negation, modality, cause or a
# judgement. None of them may ever be dropped as a function word: a claim that adds
# one of them adds information.
FORBIDDEN_FUNCTION_WORDS = """
some many much more most less least few fewer several numerous all each every both any either neither
none no not never nor without nothing nobody only also too even very quite rather just still again
once twice thrice half double first last second third final next previous following same other another
later earlier early late then now soon ago before after during since until till while when whenever
within throughout recently eventually finally already yet always often sometimes usually formerly
century centuries decade decades year years month months week weeks day days season spring summer
autumn fall winter morning evening night era age period time times
renowned famous great greatest best leading notable noted important prominent celebrated distinguished
major minor key pioneering successful brilliant legendary acclaimed influential
may might can could would should must will shall
because although though if unless whether so therefore thus hence or but against despite
dozen dozens score scores hundred hundreds thousand thousands million millions
""".split()


def test_function_words_hold_no_quantity_temporal_or_evaluative_word():
    leaked = sorted(set(FORBIDDEN_FUNCTION_WORDS) & set(n.FUNCTION_WORDS))
    assert leaked == [], f"content words in FUNCTION_WORDS: {leaked}"


def test_function_words_are_only_grammatical_glue():
    # Every function word is short grammatical vocabulary; no number word slips in.
    assert {"a", "an", "the", "of", "in", "he", "she", "was", "and"} <= n.FUNCTION_WORDS
    assert not (n.FUNCTION_WORDS & n.NUMBER_WORDS)


def test_content_tokens_drop_only_function_words():
    c = n.content_tokens("He was born in the city of Ulm and moved to Bern.")
    assert c.words == ["born", "city", "ulm", "mov", "bern"]


@pytest.mark.parametrize("forms", [
    ("arrived", "arrives", "arriving", "arrive"),
    ("studies", "studied", "study", "studying"),
    ("teaches", "teaching", "teach"),
    ("stopped", "stop", "stopping"),
    ("married", "marries", "marry"),
    ("Einstein's", "Einstein", "EINSTEIN"),
    ("patents", "patent", "patented"),
])
def test_stemming_joins_regular_inflections(forms):
    keys = {tuple(n.content_tokens(f).words) for f in forms}
    assert len(keys) == 1, keys


@pytest.mark.parametrize("a,b", [
    ("note", "not"),          # a stem must never turn a word into a negation
    ("decades", "decade"),    # a plural counting unit states an unstated count
    ("centuries", "century"),
    ("hundreds", "hundred"),
    ("years", "year"),
    ("days", "day"),
    ("taught", "teaching"),   # irregular forms are not joined (no lemma table)
    ("citizen", "citizenship"),  # derivation is not inflection
    ("made", "mad"),
    ("same", "sam"),
])
def test_stemming_never_joins_different_words(a, b):
    assert n.content_tokens(a).words != n.content_tokens(b).words


def test_content_tokens_unify_apostrophes_dashes_and_case():
    assert n.content_tokens("Einstein’s well‑known work").words == \
        n.content_tokens("EINSTEIN'S well-known work").words == ["einstein", "well", "known", "work"]


def test_content_tokens_canonical_dates_and_numbers():
    a, b = n.content_tokens("on June 10, 1941"), n.content_tokens("on 1941-06-10")
    assert [d.iso for d in a.dates] == [d.iso for d in b.dates] == ["1941-06-10"]
    assert a.words == b.words == []
    assert n.content_tokens("thirteen trunks").numbers == n.content_tokens("13 trunks").numbers == ["13"]
    assert n.content_tokens("half a dozen").numbers == ["6"]
    # "twice" is not a number word: it stays a content word that must be supported.
    twice = n.content_tokens("twice")
    assert twice.words == [n.word_key("twice")] and twice.numbers == [] and twice.written == ["twice"]


def test_acronym_of_a_function_word_is_kept_apart_from_it():
    assert n.content_tokens("to the US").words == ["US"]
    assert n.content_tokens("to us").words == []
