"""Record lines (kind "record", owner decision 2026-10-27): the guide narrates the record a stop shows, in
one or two lines saying what it shows and why it matters for the turning point. A record line may say only
what its sources say: its 'source' excerpts, each verbatim in the shipped card of a record it names
(media_ids: title, date, maker, holder, credit, alt text, recreation note) or in a verified fact it cites,
plus the narrow linking words of check_narration.py (here, in this photograph, that year, a decade later).
A time phrase needs both of its dates cited, and a span ("a decade later", "eleven years after") must be
the gap between two cited years. Every other new word, number or date fails, as on every other line.

Run from the repo root: python3 -m pytest assets-src/audio/test_record_lines.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_narration import check_line, check_record_line  # noqa: E402

FACTS = {
    "EIN-F-0005": "Albert Einstein was born 14 March 1879 in Ulm, Germany.",
    "EIN-F-0147": "Albert Einstein received his Nobel Prize in 1922.",
    "EIN-F-0109": "In 1933 Albert Einstein renounced his German citizenship.",
    "EIN-F-0151": "King Gustaf was among those present at Einstein's address at Gottenberg, Sweden.",
    "EIN-F-0901": "In 1923 Albert Einstein was in Sweden.",
}
MEDIA = {"EIN-M-0075": {"embeddable": True}, "EIN-M-0079": {"embeddable": True}, "EIN-M-0009": {"embeddable": False}}
RECORDS = {
    "EIN-M-0075": {"id": "EIN-M-0075", "kind": "photo", "title": "[Ulm, Wurtemburg, Germany]", "date": "between ca. 1890 and ca. 1900",
                   "holder": "Library of Congress", "alt": "A photochrom view of Ulm over a timber yard toward the Minster."},
    "EIN-M-0079": {"id": "EIN-M-0079", "kind": "photo", "title": "Albert Einstein, Nobel Prize lecture, Kongresshallen, Gothenburg, July 11, 1923",
                   "date": "July 11, 1923", "holder": "Göteborgs stadsmuseum",
                   "alt": "Albert Einstein lectures to the Nordic Assembly of Naturalists in the Kongresshallen, Gothenburg, July 11, 1923."},
    "EIN-M-0009": {"id": "EIN-M-0009", "kind": "photo", "title": "Uncleared photograph", "date": "1930"},
    "EIN-PIPE-RECREATION": {"id": "EIN-PIPE-RECREATION", "kind": "model", "title": "Brier pipe",
                            "recreation": "Recreation from reference photographs; not the original object"},
}


def rec(text, source, media_ids=("EIN-M-0075",), fact_ids=(), **kw):
    return {"cue": "r1", "kind": "record", "media_ids": list(media_ids), "fact_ids": list(fact_ids), "source": source, "text": text, **kw}


def errs(line, slug="einstein"):
    return check_record_line(line, slug, FACTS, MEDIA, RECORDS)


# --- what a record line may say -----------------------------------------------------------------------

def test_a_line_grounded_in_the_record_and_a_cited_fact_passes():
    line = rec("In this photochrom, a view of Ulm over a timber yard toward the Minster. Albert Einstein was born in Ulm, Germany, in 1879.",
               ["A photochrom view of Ulm over a timber yard toward the Minster.", "Albert Einstein was born 14 March 1879 in Ulm, Germany."],
               fact_ids=["EIN-F-0005"])
    assert errs(line) == []


def test_the_record_date_and_alt_text_ground_a_date():
    line = rec("Here he lectures to the Nordic Assembly of Naturalists in Gothenburg, July 11, 1923.",
               ["Albert Einstein lectures to the Nordic Assembly of Naturalists in the Kongresshallen, Gothenburg, July 11, 1923."],
               media_ids=["EIN-M-0079"])
    assert errs(line) == []


def test_a_recreation_says_it_is_one():
    line = rec("This brier pipe is a recreation from reference photographs, not the original object.",
               ["Brier pipe", "Recreation from reference photographs; not the original object"], media_ids=["EIN-PIPE-RECREATION"])
    assert errs(line) == []


def test_a_decade_span_between_two_cited_years_passes():
    line = rec("He received his Nobel Prize in 1922. Eleven years later, in 1933, he renounced his German citizenship.",
               [FACTS["EIN-F-0147"], FACTS["EIN-F-0109"]], fact_ids=["EIN-F-0147", "EIN-F-0109"])
    assert errs(line) == []


def test_that_year_with_two_dates_of_that_year_passes():
    src = ["Albert Einstein lectures to the Nordic Assembly of Naturalists in the Kongresshallen, Gothenburg, July 11, 1923."]
    line = rec("Here he lectures in Gothenburg, July 11, 1923. That year, he was in Sweden.", src + [FACTS["EIN-F-0901"]],
               media_ids=["EIN-M-0079"], fact_ids=["EIN-F-0901"])
    assert errs(line) == []
    # one date only: "that year" has nothing to point back to
    line = rec("Here he lectures in Gothenburg. That year, he lectures to the Nordic Assembly of Naturalists.", src, media_ids=["EIN-M-0079"])
    assert any("time phrase" in e for e in errs(line))


# --- what it may not say ------------------------------------------------------------------------------

def test_a_new_content_word_fails():
    line = rec("In this famous photochrom, a view of Ulm.", ["A photochrom view of Ulm over a timber yard toward the Minster."])
    assert any("famous" in e for e in errs(line))


def test_a_new_date_or_number_fails():
    assert any("number" in e or "date" in e for e in errs(rec("A view of Ulm, 1895.", ["A photochrom view of Ulm over a timber yard toward the Minster."])))
    assert any("date" in e for e in errs(rec("A view of Ulm, July 4, 1895.", ["A photochrom view of Ulm over a timber yard toward the Minster."])))
    assert any("number" in e for e in errs(rec("A view of Ulm over 3 timber yards.", ["A photochrom view of Ulm over a timber yard toward the Minster."])))


def test_a_kind_word_must_match_the_record():
    # the pipe is a recreation, not a photograph
    line = rec("This photograph shows a brier pipe.", ["Brier pipe"], media_ids=["EIN-PIPE-RECREATION"])
    assert any("photograph" in e for e in errs(line))


def test_an_excerpt_not_in_the_record_or_a_cited_fact_fails():
    line = rec("A view of Ulm.", ["A view of Ulm, his birthplace."])
    assert any("excerpt" in e for e in errs(line))
    # a fact's claim grounds nothing unless the line cites it
    line = rec("Albert Einstein was born in Ulm.", [FACTS["EIN-F-0005"]])
    assert any("excerpt" in e for e in errs(line))


def test_an_excerpt_is_whole_words_of_its_ground():
    # "Germ" is in "Germany" but is not a word of the claim
    line = rec("Germ.", ["Germ"], fact_ids=["EIN-F-0005"])
    assert any("excerpt" in e for e in errs(line))


def test_the_record_must_be_shown_cleared_and_named():
    assert any("names no record" in e for e in errs(rec("A view of Ulm.", ["[Ulm, Wurtemburg, Germany]"], media_ids=[])))
    assert any("not verified and cleared" in e for e in errs(rec("Uncleared photograph.", ["Uncleared photograph"], media_ids=["EIN-M-0009"])))
    assert any("no stop" in e for e in errs(rec("A view.", ["A view"], media_ids=["EIN-M-0404"])))


def test_an_unverified_fact_fails():
    assert any("not verified" in e for e in errs(rec("A view of Ulm.", ["[Ulm, Wurtemburg, Germany]"], fact_ids=["EIN-F-9999"])))


def test_a_span_that_is_not_the_gap_between_cited_years_fails():
    line = rec("He received his Nobel Prize in 1922. A decade later, in 1933, he renounced his German citizenship.",
               [FACTS["EIN-F-0147"], FACTS["EIN-F-0109"]], fact_ids=["EIN-F-0147", "EIN-F-0109"])
    assert any("span" in e for e in errs(line))


def test_years_or_decades_without_a_number_need_a_gap_that_large():
    ids = ["EIN-F-0005", "EIN-F-0147"]
    src = [FACTS["EIN-F-0005"], FACTS["EIN-F-0147"]]
    assert errs(rec("He was born in Ulm in 1879. Decades later, he received his Nobel Prize in 1922.", src, fact_ids=ids)) == []
    src2 = [FACTS["EIN-F-0147"], FACTS["EIN-F-0109"]]
    ids2 = ["EIN-F-0147", "EIN-F-0109"]
    assert errs(rec("He received his Nobel Prize in 1922. Years later, in 1933, he renounced his German citizenship.", src2, fact_ids=ids2)) == []
    assert any("at least 20" in e for e in errs(rec("He received his Nobel Prize in 1922. Decades later, in 1933, he renounced his German citizenship.", src2, fact_ids=ids2)))
    near = {"EIN-F-0902": "In 1933 Albert Einstein left Germany.", "EIN-F-0109": FACTS["EIN-F-0109"]}
    line = rec("He left Germany in 1933. Years later, in 1933, he renounced his German citizenship.", list(near.values()), fact_ids=list(near))
    assert check_record_line(line, "einstein", {**FACTS, **near}, MEDIA, RECORDS)


def test_a_time_phrase_without_both_dates_fails():
    line = rec("A decade later, he renounced his German citizenship.", [FACTS["EIN-F-0109"]], fact_ids=["EIN-F-0109"])
    assert any("time phrase" in e for e in errs(line))
    line = rec("Years later, he renounced his German citizenship.", [FACTS["EIN-F-0109"]], fact_ids=["EIN-F-0109"])
    assert any("time phrase" in e for e in errs(line))


def test_a_fact_line_connective_is_not_free_here():
    # "a few weeks later" would pass the time check on any two cited dates: record lines do not take it
    line = rec("He received his Nobel Prize in 1922. A few weeks later, in 1933, he renounced his German citizenship.",
               [FACTS["EIN-F-0147"], FACTS["EIN-F-0109"]], fact_ids=["EIN-F-0147", "EIN-F-0109"])
    assert any("few" in e or "week" in e for e in errs(line))


def test_wrong_pronoun_fails():
    line = rec("Here she lectures to the Nordic Assembly of Naturalists.",
               ["Albert Einstein lectures to the Nordic Assembly of Naturalists in the Kongresshallen, Gothenburg, July 11, 1923."],
               media_ids=["EIN-M-0079"])
    assert any("pronoun" in e for e in errs(line))


# --- the same linking words in a chapter opening ------------------------------------------------------

def test_an_opening_may_bridge_with_a_span_between_its_cited_years():
    ids = ["EIN-F-0147", "EIN-F-0109"]
    assert not check_line("Eleven years after his Nobel Prize of 1922, in 1933, Albert Einstein renounced his German citizenship.", ids, FACTS, "einstein")
    assert check_line("A decade after his Nobel Prize of 1922, in 1933, Albert Einstein renounced his German citizenship.", ids, FACTS, "einstein")
    assert check_line("Years later, Albert Einstein renounced his German citizenship.", ["EIN-F-0109"], FACTS, "einstein")
    # a linking word is not a licence for a new claim
    assert check_line("Eleven years after his Nobel Prize of 1922, in 1933, Albert Einstein proudly renounced his German citizenship.", ids, FACTS, "einstein")


# --- fix round 1 (review probes): every probe the review crafted against the gate now fails ------------
from check_narration import check_fact_line  # noqa: E402

TWO = ["EIN-F-0147", "EIN-F-0109"]


def test_probe_inverted_order_fails():
    src = [FACTS["EIN-F-0147"], FACTS["EIN-F-0109"]]
    assert any("wrong way" in e for e in errs(rec("Albert Einstein renounced his German citizenship before he received his Nobel Prize.", src, fact_ids=TWO)))
    for text in ("Albert Einstein renounced his German citizenship in 1933, years before he received his Nobel Prize in 1922.",
                 "In 1933 Albert Einstein renounced his German citizenship, eleven years before he received his Nobel Prize in 1922."):
        assert any("wrong way" in e for e in check_line(text, TWO, FACTS, "einstein")), text


def test_the_right_direction_passes():
    assert not check_line("In 1933 Albert Einstein renounced his German citizenship, eleven years after he received his Nobel Prize in 1922.", TWO, FACTS, "einstein")
    assert not check_line("1933. Eleven years after he received his Nobel Prize, Albert Einstein renounced his German citizenship.", TWO, FACTS, "einstein")
    assert not check_line("Albert Einstein received his Nobel Prize in 1922. Eleven years later, in 1933, he renounced his German citizenship.", TWO, FACTS, "einstein")


def test_probe_false_depiction_fails():
    # the Ulm photochrom does not show him: its title and alt text do not name him
    assert any("shows the inductee" in e for e in errs(rec("This picture shows Albert Einstein in Ulm.", ["[Ulm, Wurtemburg, Germany]"])))
    assert any("shows the inductee" in e for e in errs(rec("Here he is, in Ulm.", ["[Ulm, Wurtemburg, Germany]"])))
    # a card that names him may show him
    assert errs(rec("In this photograph, he lectures to the Nordic Assembly of Naturalists.",
                    ["Albert Einstein lectures to the Nordic Assembly of Naturalists"], media_ids=["EIN-M-0079"])) == []


def test_probe_a_time_phrase_never_rests_on_a_record_date():
    line = rec("A decade later he was born in Ulm, Germany, in 1879.",
               ["[Ulm, Wurtemburg, Germany], photochrom print, between ca. 1890 and ca. 1900.", FACTS["EIN-F-0005"]], fact_ids=["EIN-F-0005"])
    assert any("time phrase" in e or "time span" in e for e in errs(line))


def test_probe_loose_time_words_fail():
    src = [FACTS["EIN-F-0147"], FACTS["EIN-F-0109"]]
    for text in ("For years he received his Nobel Prize in 1922, and in 1933 he renounced his German citizenship.",
                 "The same Einstein received his Nobel Prize in 1922 and renounced his German citizenship in 1933.",
                 "He received his Nobel Prize in 1922. Years on, in 1933, he renounced his German citizenship."):
        assert any("time" in e or "same" in e for e in errs(rec(text, src, fact_ids=TWO))), text
        assert check_line(text.replace("He received", "Albert Einstein received").replace("For years he", "For years Albert Einstein"), TWO, FACTS, "einstein"), text


def test_probe_causal_and_time_connectives_in_fact_lines_fail():
    facts = {"EIN-F-0108": {"claim": "Albert Einstein immigrated to the United States.", "status": "verified"}}
    def fact(text):
        return check_fact_line("einstein", {"cue": "c1", "fact_ids": ["EIN-F-0108"], "source": facts["EIN-F-0108"]["claim"], "text": text}, True, facts)
    assert fact("Albert Einstein immigrated to the United States.") == []
    for text in ("And so Albert Einstein immigrated to the United States.",
                 "A few weeks later, Albert Einstein immigrated to the United States.",
                 "Albert Einstein immigrated to the United States again.",
                 "Then Albert Einstein immigrated to the United States.",
                 "Later, Albert Einstein immigrated to the United States."):
        assert fact(text), text
    # a record line refuses causal words too
    for w in ("so", "because", "therefore"):
        assert errs(rec(f"Here is Ulm, {w} the photochrom.", ["[Ulm, Wurtemburg, Germany]"]))


def test_hyphenated_spans_are_read():
    f = {"X-F-1": "In 1890 Albert Einstein was in Ulm.", "X-F-2": "In 1949 Albert Einstein was in Princeton."}
    assert not check_line("Princeton, 1949. Fifty-nine years after he was in Ulm, Albert Einstein was in Princeton.", ["X-F-1", "X-F-2"], f, "einstein")
    assert check_line("Princeton, 1949. Fifty-eight years after he was in Ulm, Albert Einstein was in Princeton.", ["X-F-1", "X-F-2"], f, "einstein")


def test_a_non_media_record_must_be_a_cleared_series_or_a_labelled_recreation():
    recs = {**RECORDS,
            "X-SERIES": {"id": "X-SERIES", "kind": "series", "title": "Letters", "letters": ["EIN-M-0009"]},
            "X-THING": {"id": "X-THING", "kind": "photo", "title": "A thing"},
            "X-MODEL": {"id": "X-MODEL", "kind": "model", "title": "A pipe", "holder": "Original: a museum"}}
    def e(line):
        return check_record_line(line, "einstein", FACTS, MEDIA, recs)
    assert any("letter" in x for x in e(rec("Here are the Letters.", ["Letters"], media_ids=["X-SERIES"])))
    assert any("neither" in x for x in e(rec("A thing.", ["A thing"], media_ids=["X-THING"])))
    assert any("neither" in x for x in e(rec("A pipe.", ["A pipe"], media_ids=["X-MODEL"])))
    # a recreation's holder or credit words are IHH's card text: they ground nothing
    assert any("excerpt" in x for x in errs(rec("The original is at the National Museum of American History.",
                                                ["Original: National Museum of American History"], media_ids=["EIN-PIPE-RECREATION"])))


# --- a photograph series (owner feedback round 8, item 5): several records of one moment, one stop ---------
PHOTO_RECS = {
    **RECORDS,
    "EIN-M-0030": {"id": "EIN-M-0030", "kind": "photo", "title": "Albert Einstein in study, seated", "date": "1954", "maker": "Alan Richards, photographer",
                   "alt": "Albert Einstein seated in his home office at 112 Mercer Street, Princeton, New Jersey."},
    "EIN-M-0032": {"id": "EIN-M-0032", "kind": "photo", "title": "Albert Einstein in study, seated", "date": "1954", "maker": "Alan Richards, photographer",
                   "alt": "Albert Einstein seated in his home study at 112 Mercer Street, Princeton, New Jersey."},
    "EIN-GROUP-SEATED": {"id": "EIN-GROUP-SEATED", "kind": "series", "unit": "photograph", "title": "Seated in his study, 1954, photographed at a lecture",
                         "date": "1954", "letters": ["EIN-M-0030", "EIN-M-0032"]},
    "EIN-GROUP-MIXED": {"id": "EIN-GROUP-MIXED", "kind": "series", "unit": "photograph", "title": "Seated", "letters": ["EIN-M-0030", "EIN-M-0009"]},
}
PHOTO_MEDIA = {**MEDIA, "EIN-M-0030": {"embeddable": True}, "EIN-M-0032": {"embeddable": True}}


def perr(line):
    return check_record_line(line, "einstein", FACTS, PHOTO_MEDIA, PHOTO_RECS)


def test_a_photograph_series_is_narrated_from_its_photographs_cards():
    line = rec("Here are photographs by Alan Richards of him seated in his home study at 112 Mercer Street, Princeton, New Jersey, in 1954.",
               ["Alan Richards", "seated in his home study at 112 Mercer Street, Princeton, New Jersey", "1954"], media_ids=["EIN-GROUP-SEATED"])
    assert perr(line) == []


def test_a_photograph_series_title_is_ihh_words_and_grounds_nothing():
    # the series' own title is IHH's grouping, not a holder's card: only its photographs' cards ground the line
    line = rec("Here are photographs of him photographed at a lecture.", ["photographed at a lecture"], media_ids=["EIN-GROUP-SEATED"])
    assert any("excerpt" in e for e in perr(line))


def test_a_photograph_series_takes_the_photograph_words_not_the_letter_words():
    line = rec("Here are letters of him seated in his home study.", ["seated in his home study"], media_ids=["EIN-GROUP-SEATED"])
    assert any("content words" in e for e in perr(line))


def test_every_photograph_of_a_series_must_be_cleared():
    line = rec("Here are photographs of him seated in his home office.", ["seated in his home office"], media_ids=["EIN-GROUP-MIXED"])
    assert any("not every" in e for e in perr(line))
