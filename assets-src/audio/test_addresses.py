"""Street addresses (owner feedback round 8, item 3): a bare street address the guide says ("he lived at
2 Library Place") must be heard as a street address and where it is. A fact may say "the house at ..."
itself; where no fact has "house", the line may add the one word "address" directly before a street address
that its own source states verbatim ("he lived at the address 2 Library Place"). Nowhere else is "address"
free: the narrow allowance names what the source already says, and adds no fact.

Run from the repo root: python3 -m pytest assets-src/audio/test_addresses.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_narration import check_fact_line, check_line  # noqa: E402

SRC = "When Albert Einstein first came to Princeton in 1933, he lived at 2 Library Place."
FACTS = {"EIN-F-0128": {"status": "verified", "claim": SRC}}
CLAIMS = {"EIN-F-0128": SRC}


def fact(text):
    return check_fact_line("einstein", {"cue": "c4", "fact_ids": ["EIN-F-0128"], "source": SRC, "text": text}, False, FACTS)


def test_address_before_the_sources_street_address_passes():
    assert fact("When he first came to Princeton in 1933, he lived at the address 2 Library Place.") == []


def test_address_elsewhere_is_a_new_content_word():
    # not followed by a street address
    assert any("added content words" in e for e in fact("When he first came to Princeton in 1933, he lived at an address in Princeton."))
    # followed by a street address the source does not state
    assert fact("When he first came to Princeton in 1933, he lived at the address 2 Library Place and 4 Library Place.")
    assert any("added content words" in e for e in fact("When he first came to Princeton in 1933, he lived at the address 2 Mercer Place, at 2 Library Place."))


def test_the_allowance_is_the_word_address_only():
    assert any("added content words" in e for e in fact("When he first came to Princeton in 1933, he lived at the street address 2 Library Place."))
    assert any("added content words" in e for e in fact("When he first came to Princeton in 1933, he lived at the house at 2 Library Place."))


def test_an_opening_may_say_the_address_of_a_cited_street_address():
    assert not check_line("Albert Einstein first came to Princeton in 1933, and he lived at the address 2 Library Place. Take a moment and look around.", ["EIN-F-0128"], CLAIMS, "einstein")
    assert check_line("Albert Einstein first came to Princeton in 1933, to the address 2 Mercer Place. Take a moment and look around.", ["EIN-F-0128"], CLAIMS, "einstein")


def test_an_inflected_address_is_never_freed():
    # review I-1 probe: "addressed" stems to "address"; one sourced "the address 2 Library Place" must not free it
    probe = "Albert Einstein first came to Princeton in 1933 and addressed it, at the address 2 Library Place."
    assert any("address" in e for e in check_line(probe, ["EIN-F-0128"], CLAIMS, "einstein"))
    assert any("added content words" in e for e in fact("When he first came to Princeton in 1933, he lived at the address 2 Library Place, and addressed it."))
    assert fact("When he first came to Princeton in 1933, he lived at the addresses 2 Library Place.")


def test_a_line_joining_facts_carries_their_claims_verbatim():
    from check_narration import check_fact_line as cfl
    facts = {"X-F-1": {"status": "verified", "claim": "Naismith attended McGill."},
             "X-F-2": {"status": "verified", "claim": "Naismith had an appointment as instructor at McGill."}}
    good = {"cue": "c1", "fact_ids": ["X-F-1", "X-F-2"], "source": "Naismith attended McGill. Naismith had an appointment as instructor at McGill.",
            "text": "Naismith attended McGill, and at McGill he had an appointment as instructor."}
    assert cfl("naismith", good, False, facts) == []
    # a source that is not the claims (a sentence of its own) fails, even when the text matches it
    bad = {**good, "source": "Naismith attended McGill and taught there.", "text": "Naismith attended McGill and taught there."}
    assert any("verbatim claims" in e for e in cfl("naismith", bad, False, facts))
