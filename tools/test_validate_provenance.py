"""Tests for the provenance log validator.

Each test builds a tiny in-memory log and asserts which rule fires.
"""

from validate_provenance import validate

PRIMARY = {
    "id": "S1",
    "title": "Petition for Naturalization",
    "institution": "U.S. National Archives",
    "type": "primary",
    "url": "https://catalog.archives.gov/id/1",
    "accessed": "2026-10-08",
}
INSTITUTIONAL = {
    "id": "S2",
    "title": "Biography",
    "institution": "Library of Congress",
    "type": "institutional",
    "url": "https://www.loc.gov/item/2",
    "accessed": "2026-10-08",
}
SECONDARY_A = {
    "id": "S3",
    "title": "News article",
    "institution": "Example News",
    "type": "secondary",
    "url": "https://news.example.org/a",
    "accessed": "2026-10-08",
}
SECONDARY_B = dict(SECONDARY_A, id="S4", url="https://news.example.org/b")


def fact(**overrides):
    base = {
        "id": "F1",
        "inductee": "einstein",
        "claim": "A claim.",
        "category": "immigration",
        "source_ids": ["S1"],
        "primary_document": True,
        "status": "verified",
        "used_in": [],
    }
    base.update(overrides)
    return base


def log(facts=None, sources=None, media=None, searches=None):
    return {
        "facts": facts or [],
        "sources": sources if sources is not None else [PRIMARY, INSTITUTIONAL, SECONDARY_A, SECONDARY_B],
        "media": media or [],
        "searches": searches or [],
    }


def test_valid_log_has_no_errors():
    assert validate(log(facts=[fact()])) == []


def test_verified_by_primary_document_alone():
    assert validate(log(facts=[fact(source_ids=["S1"], primary_document=True)])) == []


def test_verified_by_two_sources_one_institutional():
    f = fact(source_ids=["S2", "S3"], primary_document=False)
    assert validate(log(facts=[f])) == []


def test_verified_with_only_secondary_sources_fails():
    f = fact(source_ids=["S3", "S4"], primary_document=False)
    errors = validate(log(facts=[f]))
    assert any("F1" in e and "primary or institutional" in e for e in errors)


def test_verified_with_single_institutional_non_document_fails():
    f = fact(source_ids=["S2"], primary_document=False)
    errors = validate(log(facts=[f]))
    assert any("F1" in e and "2 independent sources" in e for e in errors)


def test_primary_document_flag_requires_primary_source():
    f = fact(source_ids=["S3"], primary_document=True)
    errors = validate(log(facts=[f]))
    assert any("F1" in e and "primary_document" in e for e in errors)


def test_unverified_fact_cannot_be_used_on_site():
    f = fact(status="single-source", used_in=["einstein/timeline"])
    errors = validate(log(facts=[f]))
    assert any("F1" in e and "only verified" in e for e in errors)


def test_unknown_status_rejected():
    errors = validate(log(facts=[fact(status="probably")]))
    assert any("F1" in e and "status" in e for e in errors)


def test_missing_source_reference_rejected():
    errors = validate(log(facts=[fact(source_ids=["S99"])]))
    assert any("S99" in e for e in errors)


def test_duplicate_ids_rejected():
    errors = validate(log(facts=[fact(), fact()]))
    assert any("duplicate" in e and "F1" in e for e in errors)


def test_source_needs_https_url_and_date():
    bad = dict(PRIMARY, url="http://insecure.example", accessed="yesterday")
    errors = validate(log(facts=[fact()], sources=[bad]))
    assert any("S1" in e and "https" in e for e in errors)
    assert any("S1" in e and "accessed" in e for e in errors)


def test_source_type_enum():
    bad = dict(PRIMARY, type="blog")
    errors = validate(log(facts=[fact()], sources=[bad]))
    assert any("S1" in e and "type" in e for e in errors)


def test_media_requires_license_and_source():
    m = {"id": "M1", "title": "Photo", "source_ids": ["S1"], "license": "", "credit": "NARA", "reconstruction": False}
    errors = validate(log(facts=[fact()], media=[m]))
    assert any("M1" in e and "license" in e for e in errors)


def test_search_requires_date_and_query():
    s = {"id": "Q1", "date": "", "tool": "loc.gov", "query": "", "results": 3}
    errors = validate(log(facts=[fact()], searches=[s]))
    assert any("Q1" in e and "date" in e for e in errors)
    assert any("Q1" in e and "query" in e for e in errors)
