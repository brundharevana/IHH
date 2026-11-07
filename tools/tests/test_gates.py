"""Tests for the deterministic gates in tools/ihh/gates.py (SPEC section 4).

Each gate gets at least one passing and one failing case. All data is fake
(see factories.py).
"""

import dataclasses

import pytest

import factories as fx
from ihh import gates, normalize


def ctx_and_fact(fid, w=None):
    w = w or fx.world()
    return w, fx.context(w), fx.by_id(w["facts"], fid)


# --- G1 evidence -----------------------------------------------------------

def test_g1_passes_for_verbatim_quote():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    assert gates.g1_evidence(f, ctx) == []


def test_g1_passes_after_normalization():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    f["evidence"][0]["quote"] = "ARRIVED  at the\u00a0Port of Example on 1941\u201306\u201310"
    assert gates.g1_evidence(f, ctx) == []


def test_g1_fails_for_fabricated_quote():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    f["evidence"][0]["quote"] = "Arrived at the Port of Example on 1941-06-10 with great fanfare"
    failures = gates.g1_evidence(f, ctx)
    assert failures and "not found in snapshot" in failures[0]


def test_g1_fails_for_partial_word_match():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    f["evidence"][0]["quote"] = "rived at the Port of Example"
    assert gates.g1_evidence(f, ctx)


def test_g1_fails_when_snapshot_sha_differs_from_meta():
    w, ctx, f = ctx_and_fact("TST-F-0002")
    snap = ctx.snapshots["TST-S-0001"]
    ctx.snapshots["TST-S-0001"] = dataclasses.replace(snap, meta=dict(snap.meta, sha256="0" * 64))
    failures = gates.g1_evidence(f, ctx)
    assert any("sha256" in x and "meta" in x for x in failures)


def test_g1_fails_when_snapshot_text_was_altered():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    snap = ctx.snapshots["TST-S-0001"]
    altered = snap.text + "Extra line added later.\n"
    ctx.snapshots["TST-S-0001"] = dataclasses.replace(snap, text=altered, sha256=fx.sha(altered))
    assert any("sha256" in x for x in gates.g1_evidence(f, ctx))


def test_g1_fails_when_source_record_sha_differs():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    ctx.sources["TST-S-0001"]["snapshot_sha256"] = "f" * 64
    assert any("sha256" in x for x in gates.g1_evidence(f, ctx))


def test_g1_fails_for_unknown_source_and_missing_snapshot():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    f["evidence"].append({"source_id": "TST-S-0099", "quote": "anything", "locator": ""})
    assert any("TST-S-0099" in x for x in gates.g1_evidence(f, ctx))

    _, ctx, f = ctx_and_fact("TST-F-0002")
    del ctx.snapshots["TST-S-0001"]
    assert any("snapshot" in x for x in gates.g1_evidence(f, ctx))


def test_g1_fails_without_evidence():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    f["evidence"] = []
    assert gates.g1_evidence(f, ctx)


def test_g1_media_rights_statement_in_snapshot():
    w = fx.world()
    ctx = fx.context(w)
    m = w["media"][0]
    assert gates.g1_media(m, ctx, {}) == []
    m["rights_statement"] = "Free to use for any purpose."
    assert gates.g1_media(m, ctx, {})


# --- G2 nothing added ----------------------------------------------------------

def test_g2_passes_for_close_restatement():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    assert gates.g2_nothing_added(f, ctx) == []


def test_g2_date_format_equivalence():
    # Claim "June 10, 1941" against evidence "1941-06-10".
    _, ctx, f = ctx_and_fact("TST-F-0002")
    assert gates.g2_nothing_added(f, ctx) == []


def test_g2_date_format_equivalence_reverse():
    w = fx.world()
    w["snapshots"]["TST-S-0001"] = w["snapshots"]["TST-S-0001"].replace("1941-06-10", "10 June 1941")
    w["sources"][0]["snapshot_sha256"] = fx.sha(w["snapshots"]["TST-S-0001"])
    f = fx.by_id(w["facts"], "TST-F-0002")
    f["claim"] = "Testa Q. Persona arrived at the Port of Example on 1941-06-10."
    f["evidence"][0]["quote"] = "Arrived at the Port of Example on 10 June 1941"
    assert gates.g2_nothing_added(f, fx.context(w)) == []


def test_g2_fails_when_claim_adds_a_year():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    f["claim"] = "Test Person taught at Example College in 1950."
    failures = gates.g2_nothing_added(f, ctx)
    assert any("1950" in x for x in failures)


def test_g2_fails_when_claim_adds_a_day_to_a_month():
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0001")
    f["claim"] = "Test Person arrived in the United States on June 12, 1941."
    f["evidence"] = [{"source_id": "TST-S-0002", "quote": "arrived in the United States in June 1941",
                      "locator": ""}]
    failures = gates.g2_nothing_added(f, fx.context(w))
    assert any("1941-06-12" in x for x in failures)


def test_g2_passes_when_claim_narrows_a_date():
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0002")
    f["claim"] = "Testa Q. Persona arrived at the Port of Example in June 1941."
    f["event_date"] = "1941-06"
    assert gates.g2_nothing_added(f, fx.context(w)) == []


def test_g2_fails_when_claim_adds_a_number():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    f["claim"] = "Testa Q. Persona arrived at the Port of Example on June 10, 1941 with 14 trunks."
    failures = gates.g2_nothing_added(f, ctx)
    assert any("14" in x for x in failures)


def test_g2_number_words_match_digits():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    # Evidence says "thirteen trunks"; claim says 13.
    f["claim"] = "Testa Q. Persona arrived at the Port of Example with 13 trunks."
    f["evidence"][0]["quote"] = "Arrived at the Port of Example on 1941-06-10 aboard the SS Sample with thirteen trunks"
    assert gates.g2_nothing_added(f, ctx) == []


def test_g2_digits_match_number_words():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    # Evidence says "13 years"; claim says thirteen.
    f["claim"] = "Test Person taught at Example College for thirteen years."
    f["evidence"] = [{"source_id": "TST-S-0003", "quote": "taught at Example College for 13 years",
                      "locator": ""}]
    assert gates.g2_nothing_added(f, ctx) == []


def test_g2_number_inside_an_evidence_code_matches():
    # Evidence shows only a catalog-style code; the claim writes the number out.
    _, ctx, f = ctx_and_fact("TST-F-0003")
    f["claim"] = "Test Person taught at Example College under contract 1,234,567."
    f["evidence"] = [{"source_id": "TST-S-0003",
                      "quote": "taught at Example College under contract EX1234567B", "locator": ""}]
    assert gates.g2_nothing_added(f, ctx) == []


def test_g2_code_absent_from_evidence_fails():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    f["claim"] = "Test Person taught at Example College under contract EX7654321B."
    f["evidence"] = [{"source_id": "TST-S-0003",
                      "quote": "taught at Example College under contract EX1234567B", "locator": ""}]
    assert any("ex7654321b" in x for x in gates.g2_nothing_added(f, ctx))


def test_g2_fails_when_claim_adds_a_proper_name():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    f["claim"] = "Test Person taught physics at Example College with Jane Sample."
    failures = gates.g2_nothing_added(f, ctx)
    assert any("Jane" in x for x in failures)
    assert any("Sample" in x for x in failures)


def test_g2_alias_match_passes():
    # The evidence quote never names the person; the claim uses a supported alias.
    _, ctx, f = ctx_and_fact("TST-F-0002")
    assert "testa" not in normalize.normalize_text(f["evidence"][0]["quote"])
    assert gates.g2_nothing_added(f, ctx) == []


def test_g2_alias_unsupported_by_identity_fact_does_not_match():
    w = fx.world()
    w["inductee"]["aliases"] = ["Testa Q. Persona", "Tessie Exemplar"]
    f = fx.by_id(w["facts"], "TST-F-0002")
    f["claim"] = "Tessie Exemplar arrived at the Port of Example on June 10, 1941."
    failures = gates.g2_nothing_added(f, fx.context(w))
    assert any("Tessie" in x for x in failures)


def test_g2_alias_from_withdrawn_identity_fact_does_not_match():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0001")["extractor"]["verdict"] = "withdrawn"
    f = fx.by_id(w["facts"], "TST-F-0002")
    failures = gates.g2_nothing_added(f, fx.context(w))
    assert any("Testa" in x for x in failures)


def test_g2_direct_quote_must_equal_evidence_quote():
    _, ctx, f = ctx_and_fact("TST-F-0004")
    assert gates.g2_nothing_added(f, ctx) == []
    f["claim"] = "Example sentences are the very best teachers."
    assert any("direct quote" in x for x in gates.g2_nothing_added(f, ctx))


def test_g2_event_date_must_be_supported():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    f["event_date"] = "1941-07-01"
    assert any("event_date" in x for x in gates.g2_nothing_added(f, ctx))


def test_g2_place_must_be_supported():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    f["place"] = "Sampleville"
    assert any("place" in x and "Sampleville" in x for x in gates.g2_nothing_added(f, ctx))


# --- G5 corroboration ------------------------------------------------------------

def test_g5_primary_document_alone_passes():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    assert gates.g5_corroboration(f, ctx) == []


def test_g5_institutional_plus_independent_secondary_passes():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    assert gates.g5_corroboration(f, ctx) == []


def test_g5_secondary_only_fails():
    w = fx.world()
    w["sources"][1]["type"] = "secondary"  # TST-S-0002 becomes secondary
    f = fx.by_id(w["facts"], "TST-F-0003")
    failures = gates.g5_corroboration(f, fx.context(w))
    assert failures and "primary or institutional" in failures[0]


def test_g5_two_sources_same_institution_fails():
    w = fx.world()
    w["sources"][2]["institution"] = "Example University Library"  # S-0003 same holder as S-0002
    w["sources"][2]["type"] = "institutional"
    f = fx.by_id(w["facts"], "TST-F-0003")
    failures = gates.g5_corroboration(f, fx.context(w))
    assert failures and "distinct institutions" in failures[0]


def test_g5_single_institutional_source_fails():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    f["evidence"] = f["evidence"][:1]
    assert gates.g5_corroboration(f, ctx)


# --- G7 edit lock -----------------------------------------------------------------

def test_g7_passes_for_unchanged_claim():
    _, _, f = ctx_and_fact("TST-F-0003")
    assert gates.g7_edit_lock(f) == []


def test_g7_fails_for_claim_edited_after_verification():
    _, _, f = ctx_and_fact("TST-F-0003")
    f["claim"] = "Test Person taught chemistry at Example College."
    failures = gates.g7_edit_lock(f)
    assert failures and "changed after verification" in failures[0]


def test_g7_ignores_whitespace_only_edits():
    _, _, f = ctx_and_fact("TST-F-0003")
    f["claim"] = "Test  Person taught at Example College. "
    assert gates.g7_edit_lock(f) == []


def test_g7_media_lock_covers_license_change():
    w = fx.world()
    m = w["media"][0]
    assert gates.g7_edit_lock(m, kind="media") == []
    m["license_class"] = "cc0"
    assert gates.g7_edit_lock(m, kind="media")


# --- G9 banned sources -------------------------------------------------------------

def test_g9_wikipedia_source_fails():
    w = fx.world()
    w["sources"][2]["url"] = "https://en.wikipedia.org/wiki/Test_Person"
    f = fx.by_id(w["facts"], "TST-F-0003")
    failures = gates.g9_banned_sources(f, fx.context(w))
    assert failures and "wikipedia.org" in failures[0]


def test_g9_host_list():
    banned = [
        "https://en.wikipedia.org/wiki/X",
        "https://en.m.wikipedia.org/wiki/X",
        "https://de.wikiquote.org/wiki/X",
        "https://www.wikidata.org/wiki/Q1",
        "https://wikidata.org/wiki/Q1",
        "https://www.goodreads.com/quotes/1",
        "https://www.brainyquote.com/quotes/x",
        "https://quotefancy.com/x",
        "https://www.azquotes.com/quote/1",
        "https://web.archive.org/web/2020/https://en.wikipedia.org/wiki/X",
    ]
    for url in banned:
        assert gates.banned_host(url), url
    allowed = [
        "https://commons.wikimedia.org/wiki/File:X.jpg",
        "https://upload.wikimedia.org/x.jpg",
        "https://archives.example.org/id/1",
        "https://notwikipedia.org.example.org/x",
    ]
    for url in allowed:
        assert gates.banned_host(url) is None, url


def test_g9_fetch_url_is_checked_too():
    w = fx.world()
    w["sources"][2]["fetch_url"] = "https://en.wikipedia.org/w/api.php?page=X"
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert gates.g9_banned_sources(f, fx.context(w))


def test_g9_clean_sources_pass():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    assert gates.g9_banned_sources(f, ctx) == []


# --- G10 snapshot integrity ----------------------------------------------------------

def test_g10_browser_snapshot_with_live_quote_passes():
    _, ctx, f = ctx_and_fact("TST-F-0003")  # cites TST-S-0002 (browser)
    assert gates.g10_snapshot_integrity(f, ctx) == []


def test_g10_browser_snapshot_unreachable_fails():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    f["adversary"]["quote_in_live"] = "unreachable"
    failures = gates.g10_snapshot_integrity(f, ctx)
    assert failures and "browser" in failures[0]


def test_g10_manual_snapshot_unreachable_fails():
    w = fx.world()
    w["sources"][2]["fetch_method"] = "manual"
    f = fx.by_id(w["facts"], "TST-F-0001")
    f["evidence"] = f["evidence"][1:]
    f["adversary"]["quote_in_live"] = "unreachable"
    assert gates.g10_snapshot_integrity(f, fx.context(w))


def test_g10_api_snapshot_unreachable_passes():
    _, ctx, f = ctx_and_fact("TST-F-0002")  # TST-S-0001 fetched by api
    assert f["adversary"]["quote_in_live"] == "unreachable"
    assert gates.g10_snapshot_integrity(f, ctx) == []


def test_g10_quote_missing_live_fails_for_any_method():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    f["adversary"]["quote_in_live"] = "no"
    assert gates.g10_snapshot_integrity(f, ctx)


# --- G10 per-source live results (owner-approved 2026-10-10) ---------------------------

def per_source(f, results):
    """A new-style verdict: one live result per cited source, and the per-fact summary
    adversary.py derives from them."""
    f["adversary"]["live_by_source"] = [
        {"source_id": sid, "result": r, "url": f"https://checked.example.org/{sid}"} for sid, r in results.items()]
    rs = set(results.values())
    f["adversary"]["quote_in_live"] = "no" if "not_found" in rs else "unreachable" if "unreachable" in rs else "yes"
    return f


def fact_with_partial_browser_source():
    """TST-F-0002 counts only its api primary record (TST-S-0001); an extra quote from the
    browser snapshot TST-S-0002 covers part of the claim, so G5 does not count that source."""
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0002")
    f["evidence"].append({"source_id": "TST-S-0002", "quote": "arrived in the United States in June 1941",
                          "locator": "line 1"})
    ctx = fx.context(w)
    assert gates.g1_evidence(f, ctx) == [] and gates.g5_corroboration(f, ctx) == []
    return w, ctx, f


def test_g5_counting_sources_are_the_whole_claim_covering_sources():
    _, ctx, f = fact_with_partial_browser_source()
    assert [s["id"] for s in gates.g5_counting_sources(f, ctx)] == ["TST-S-0001"]
    _, ctx, f = ctx_and_fact("TST-F-0003")
    assert [s["id"] for s in gates.g5_counting_sources(f, ctx)] == ["TST-S-0002", "TST-S-0003"]


def test_g10_per_source_counting_found_and_extra_source_unreachable_passes():
    _, ctx, f = fact_with_partial_browser_source()
    per_source(f, {"TST-S-0001": "found", "TST-S-0002": "unreachable"})
    assert gates.g10_snapshot_integrity(f, ctx) == []


def test_g10_per_source_counting_source_not_found_fails():
    _, ctx, f = ctx_and_fact("TST-F-0003")  # TST-S-0002 (browser) and TST-S-0003 (http) both count
    per_source(f, {"TST-S-0002": "found", "TST-S-0003": "not_found"})
    failures = gates.g10_snapshot_integrity(f, ctx)
    assert failures and any("TST-S-0003" in x and "not found" in x for x in failures)


def test_g10_per_source_counting_source_unreachable_not_api_fails():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    per_source(f, {"TST-S-0002": "unreachable", "TST-S-0003": "found"})
    failures = gates.g10_snapshot_integrity(f, ctx)
    assert failures and any("TST-S-0002" in x and "browser" in x for x in failures)


def test_g10_per_source_counting_manual_source_unreachable_fails():
    w = fx.world()
    fx.by_id(w["sources"], "TST-S-0003")["fetch_method"] = "manual"
    _, ctx, f = ctx_and_fact("TST-F-0003", w)
    per_source(f, {"TST-S-0002": "found", "TST-S-0003": "unreachable"})
    assert any("TST-S-0003" in x for x in gates.g10_snapshot_integrity(f, ctx))


def test_g10_legacy_verdict_keeps_per_fact_rule():
    # The same record as the first per-source test, with a legacy verdict (no live_by_source):
    # one per-fact "unreachable" still fails because a browser snapshot is cited.
    _, ctx, f = fact_with_partial_browser_source()
    f["adversary"]["quote_in_live"] = "unreachable"
    assert "live_by_source" not in f["adversary"]
    failures = gates.g10_snapshot_integrity(f, ctx)
    assert failures and "browser" in failures[0]
    f["adversary"]["quote_in_live"] = "yes"
    assert gates.g10_snapshot_integrity(f, ctx) == []
    f["adversary"]["quote_in_live"] = "no"
    assert gates.g10_snapshot_integrity(f, ctx)


def test_g10_per_source_api_counting_source_unreachable_passes():
    _, ctx, f = ctx_and_fact("TST-F-0002")  # TST-S-0001 fetched by api
    per_source(f, {"TST-S-0001": "unreachable"})
    assert gates.g10_snapshot_integrity(f, ctx) == []
    _, ctx, f = ctx_and_fact("TST-F-0003")  # TST-S-0003 fetched by http
    per_source(f, {"TST-S-0002": "found", "TST-S-0003": "unreachable"})
    assert gates.g10_snapshot_integrity(f, ctx) == []


def test_g10_per_source_not_found_on_a_non_counting_source_fails():
    # Never looser than today: a quote missing from any live page is a failure.
    _, ctx, f = fact_with_partial_browser_source()
    per_source(f, {"TST-S-0001": "found", "TST-S-0002": "not_found"})
    assert any("TST-S-0002" in x for x in gates.g10_snapshot_integrity(f, ctx))


def test_g10_per_source_missing_result_for_a_counting_source_fails():
    _, ctx, f = fact_with_partial_browser_source()
    per_source(f, {"TST-S-0002": "found"})
    assert any("TST-S-0001" in x and "no live result" in x for x in gates.g10_snapshot_integrity(f, ctx))


def test_g10_per_source_without_counting_sources_checks_every_cited_source():
    # A fact no source covers on its own (G5 counts nothing) is held to the rule for every cited
    # source, so a per-source verdict is never looser than the per-fact rule.
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["evidence"] = [{"source_id": "TST-S-0002", "quote": "taught at Example College", "locator": "l"},
                     {"source_id": "TST-S-0003", "quote": "Test Person", "locator": "l"}]
    f["claim"] = "Test Person taught at Example College for 13 years."
    f["evidence"][1]["quote"] = "for 13 years"
    ctx = fx.context(w)
    assert gates.g5_corroboration(f, ctx) and gates.g2_nothing_added(f, ctx) == []
    per_source(f, {"TST-S-0002": "unreachable", "TST-S-0003": "found"})
    assert any("TST-S-0002" in x for x in gates.g10_snapshot_integrity(f, ctx))
    per_source(f, {"TST-S-0002": "found", "TST-S-0003": "unreachable"})
    assert gates.g10_snapshot_integrity(f, ctx) == []


def test_g10_per_source_media_checks_every_source():
    w = fx.world()
    m = w["media"][0]  # TST-S-0001, api
    per_source(m, {"TST-S-0001": "unreachable"})
    assert gates.g10_snapshot_integrity(m, fx.context(w)) == []
    fx.by_id(w["sources"], "TST-S-0001")["fetch_method"] = "browser"
    assert gates.g10_snapshot_integrity(m, fx.context(w))


# --- adversary verdict -----------------------------------------------------------------

def test_adversary_failures():
    assert gates.adversary_failures(fx.adversary()) == []
    assert gates.adversary_failures(fx.adversary(verdict="refuted"))
    assert gates.adversary_failures(fx.adversary(verdict="unclear"))
    assert gates.adversary_failures(fx.adversary(entailed=False))
    assert gates.adversary_failures(fx.adversary(adds_information=True))
    assert gates.adversary_failures(fx.adversary(atomic=False))
    assert gates.adversary_failures(fx.adversary(source_type_ok=False))
    assert gates.adversary_failures(fx.adversary(quote_in_snapshot=False))


# --- aliases -----------------------------------------------------------------------------

def test_supported_aliases_need_identity_evidence():
    w = fx.world()
    w["inductee"]["aliases"].append("Tessie Exemplar")
    names = gates.supported_aliases(w["inductee"], w["facts"], fx.context(w))
    assert names == ["Testa Q. Persona"]


# --- G2/G6 token detection gaps (round 1 review) --------------------------------------------

NAMES = ["Test Person", "Testa Q. Persona"]


def unsupported(text, support_texts, names=NAMES):
    return gates.unsupported_tokens(text, gates.Support.from_texts(support_texts, names=names), "evidence")


@pytest.mark.parametrize("claim,evidence,name", [
    ("Switzerland granted Test Person citizenship.", "Test Person became a citizen.", "Switzerland"),
    ("Princeton hired him in 1933.", "The university hired him in 1933.", "Princeton"),
    ("He was born in Ulm. Germany was his home.", "He was born in Ulm.", "Germany"),
    ('"Germany" revoked it.', "It was revoked.", "Germany"),
    ("Smith hired Test Person at Example College.", "Test Person taught at Example College.", "Smith"),
    ("Test Person taught at Example College. Smith hired Test Person.",
     "Test Person taught at Example College.", "Smith"),
    ("Chicago hired Test Person.", "Test Person was hired.", "Chicago"),
    ("Fred hired Test Person.", "Test Person was hired.", "Fred"),
])
def test_sentence_initial_proper_name_is_checked(claim, evidence, name):
    failures = unsupported(claim, [evidence])
    assert any(f"name {name!r}" in f for f in failures), failures


# Round 3: capitalization by position never makes a word free or adds a requirement
# beyond the word itself. The supports below contain each word in lower case; the
# original supports, which lacked "teaching", "career", "record", "early", "later"
# and "home", now fail (test_capitalized_common_words_are_no_longer_free).
@pytest.mark.parametrize("text,support", [
    ("Teaching", "Test Person was teaching at Example College."),
    ("Teaching career", "Test Person had a teaching career at Example College."),
    ("Arrival at the Port of Example", "Testa Q. Persona's arrival at the Port of Example on June 10, 1941."),
    ("Arrival record of Testa Q. Persona", "the arrival record of Testa Q. Persona"),
    ("Early life", "In early life Test Person was born Testa Q. Persona."),
    ("Later, Test Person taught at Example College.", "later Test Person taught at Example College."),
    ("Born Testa Q. Persona, Test Person taught.", "Test Person was born Testa Q. Persona and taught."),
    ("Germany was his home.", "His home was Germany."),
])
def test_sentence_initial_common_or_supported_word_is_not_a_name(text, support):
    assert unsupported(text, [support]) == []


def test_us_is_checked_as_a_name_not_a_pronoun():
    failures = unsupported("He moved to the US.", ["He moved away."])
    assert any("'US'" in f for f in failures), failures
    # The pronoun "us" in the support does not stand for the country.
    assert unsupported("He moved to the US.", ["He wrote to us."])
    assert unsupported("He moved to the US in 1940.", ["He moved to the US in 1940."]) == []
    assert unsupported("He wrote to us.", ["He wrote."]) == []


@pytest.mark.parametrize("claim", [
    "Testa Q. Persona arrived with a dozen trunks.",
    "Testa Q. Persona arrived with hundreds of trunks.",
    "Testa Q. Persona arrived with dozens of trunks.",
    "Testa Q. Persona arrived with a few trunks.",
    "Testa Q. Persona arrived with several trunks.",
    "Testa Q. Persona arrived with a couple of trunks.",
    "Testa Q. Persona arrived with thousands of books.",
])
def test_quantity_words_must_be_supported(claim):
    assert unsupported(claim, ["Arrived aboard the SS Sample with thirteen trunks"]), claim


def test_quantity_words_pass_when_supported():
    assert unsupported("Testa Q. Persona arrived with a dozen trunks.", ["arrived with twelve trunks"]) == []
    assert unsupported("Testa Q. Persona arrived with several trunks.", ["arrived with several trunks"]) == []
    assert unsupported("Testa Q. Persona arrived with hundreds of books.",
                       ["arrived with hundreds of books"]) == []


@pytest.mark.parametrize("text", [
    "Test Person taught at Example College in the fifties.",
    "Test Person taught at Example College in the mid-fifties.",
    "Test Person taught at Example College in the nineteen-fifties.",
    "Test Person taught at Example College in her fifties.",
    "Test Person taught at Example College in spring.",
    "Test Person taught at Example College in the fall of the year.",
    "Test Person taught at Example College in the following decade.",
    "Test Person taught at Example College a year later.",
])
def test_decade_words_seasons_and_relative_periods_must_be_supported(text):
    assert unsupported(text, ["Test Person taught at Example College."]), text


def test_decade_words_and_seasons_pass_when_supported():
    assert unsupported("Test Person taught in the fifties.", ["Test Person taught in the 1950s."]) == []
    assert unsupported("Test Person taught in the fifties.", ["Test Person taught in 1955."]) == []
    assert unsupported("Test Person taught in the nineteen-fifties.", ["Test Person taught in 1955."]) == []
    assert unsupported("Test Person arrived in spring.", ["Test Person arrived in the spring of 1941."]) == []
    assert unsupported("Test Person left a year later.", ["Test Person left one year later."]) == []


def test_ambiguous_numeric_date_needs_every_reading_supported():
    evidence = ["Arrived at the Port of Example on 1941-06-10"]
    failures = unsupported("Testa Q. Persona arrived at the Port of Example on 10/6/1941.", evidence)
    assert any("date" in f for f in failures), failures
    # An ambiguous evidence date does not support picking one reading.
    failures = unsupported("Testa Q. Persona arrived on October 6, 1941.", ["Arrived on 6/10/1941"])
    assert any("date" in f for f in failures), failures
    assert unsupported("Testa Q. Persona arrived on June 10, 1941.", ["Arrived on 6/10/1941"])
    # The same ambiguous form, or only the part every reading shares, is supported.
    assert unsupported("Testa Q. Persona arrived on 6/10/1941.", ["Arrived on 6/10/1941"]) == []
    assert unsupported("Testa Q. Persona arrived in 1941.", ["Arrived on 6/10/1941"]) == []
    # A date with only one valid reading is not ambiguous.
    assert unsupported("Testa Q. Persona arrived on 13/6/1941.", ["Arrived on 1941-06-13"]) == []


# --- G5 independence and G9 wrappers (round 1 review) ----------------------------------------

@pytest.mark.parametrize("institution", [
    "Example University Library.",
    "Example University Libraries",
    "Example Univ. Library",
    "Example University Library (Special Collections)",
    "example university library",
    "The Example University Library",
])
def test_g5_trivial_variants_of_one_institution_count_once(institution):
    w = fx.world()
    w["sources"][2]["institution"] = institution  # S-0003; S-0002 is "Example University Library"
    f = fx.by_id(w["facts"], "TST-F-0003")
    failures = gates.g5_corroboration(f, fx.context(w))
    assert failures and "distinct institutions" in failures[0], institution


def test_g5_same_host_counts_once_whatever_the_institution_name():
    w = fx.world()
    w["sources"][2]["url"] = "https://www.library.example.net/another-page"  # S-0002 is library.example.net
    w["sources"][2]["institution"] = "Example Reading Room"
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert gates.g5_corroboration(f, fx.context(w))


def test_g5_hosting_platform_is_one_site_and_no_authority():
    # Class B: archive.org is not in the authority registry, so a copy there is secondary
    # (G9 fails the institutional label) and two copies there are one site (G5).
    w = fx.world()
    w["sources"][1]["url"] = "https://archive.org/details/test-person-biography"
    w["sources"][2]["url"] = "https://archive.org/details/example-news-profile"
    f = fx.by_id(w["facts"], "TST-F-0003")
    ctx = fx.context(w)
    assert gates.g5_corroboration(f, ctx)
    assert any("authority registry" in x for x in gates.g9_banned_sources(f, ctx))


def test_g5_distinct_institutions_still_pass():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    assert gates.g5_corroboration(f, ctx) == []


@pytest.mark.parametrize("url", [
    "https://archive.ph/abcd/https://en.wikipedia.org/wiki/T",
    "https://archive.today/2020/https://en.wikipedia.org/wiki/T",
    "https://archive.is/newest/https://en.wikipedia.org/wiki/T",
    "https://archive.ph/abcd",
    "https://ghostarchive.org/archive/https://en.wikipedia.org/wiki/T",
    "https://en-wikipedia-org.translate.goog/wiki/T",
    "https://translate.google.com/translate?u=https://en.wikipedia.org/wiki/T",
    "https://webcache.googleusercontent.com/search?q=cache:https://en.wikipedia.org/wiki/T",
    "https://www.wikiwand.com/en/Test_Person",
    "https://wikiwand.com/en/Test_Person",
    "https://www.wikipedia.com/wiki/Test_Person",
    "https://web.archive.org/web/2020/https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FT",
])
def test_g9_wrappers_proxies_and_mirrors_are_banned(url):
    assert gates.banned_host(url), url
    w = fx.world()
    w["sources"][2]["url"] = url
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert gates.g9_banned_sources(f, fx.context(w)), url


@pytest.mark.parametrize("url", [
    "https://archive.ph/abcd/https://archives.example.org/id/1",
    "https://archives-example-org.translate.goog/id/1",
    "https://web.archive.org/web/2020/https://archives.example.org/id/1",
])
def test_g9_wrappers_of_allowed_sources_pass(url):
    assert gates.banned_host(url) is None, url


# --- snapshot provenance (round 1 review) -------------------------------------------------------

def _with_meta(ctx, sid, **changes):
    snap = ctx.snapshots[sid]
    ctx.snapshots[sid] = dataclasses.replace(snap, meta=dict(snap.meta, **changes))


def test_g1_fails_when_snapshot_meta_names_another_page():
    _, ctx, f = ctx_and_fact("TST-F-0002")  # TST-S-0001, fetched by api
    _with_meta(ctx, "TST-S-0001", url="https://unrelated.example.org/other-page",
               fetch_url="https://unrelated.example.org/other-page")
    assert any("meta url" in x for x in gates.g1_evidence(f, ctx))


def test_g1_fails_when_machine_fetch_url_is_not_what_the_record_would_fetch():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    _with_meta(ctx, "TST-S-0001", fetch_url="https://unrelated.example.org/other-page")
    assert any("meta fetch_url" in x for x in gates.g1_evidence(f, ctx))


def test_g1_fails_when_meta_method_differs_from_the_record():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    _with_meta(ctx, "TST-S-0001", method="http")
    assert any("method" in x for x in gates.g1_evidence(f, ctx))


def test_g1_snapshot_provenance_passes_for_matching_meta():
    for fid in ("TST-F-0001", "TST-F-0002", "TST-F-0003", "TST-F-0004"):
        _, ctx, f = ctx_and_fact(fid)
        assert gates.g1_evidence(f, ctx) == [], fid


# --- G2/G6 quantity and time words (round 2 review) ----------------------------------------------

@pytest.mark.parametrize("claim,evidence", [
    ("Test Person arrived with a score of trunks.", "Test Person arrived with thirteen trunks"),
    ("Test Person arrived with half a dozen trunks.", "Test Person arrived with a dozen trunks"),
    ("Test Person arrived with a half dozen trunks.", "Test Person arrived with a dozen trunks"),
    ("Test Person arrived with two dozen trunks.", "Test Person arrived with a dozen trunks"),
    ("Test Person taught at Example College for decades.", "Test Person taught at Example College."),
    ("Test Person taught at Example College for centuries.", "Test Person taught at Example College."),
])
def test_score_half_dozen_and_vague_spans_must_be_supported(claim, evidence):
    assert unsupported(claim, [evidence]), claim


def test_score_and_dozen_multiples_are_numbers():
    assert unsupported("Test Person arrived with half a dozen trunks.", ["arrived with six trunks"]) == []
    assert unsupported("Test Person arrived with a score of trunks.", ["arrived with 20 trunks"]) == []
    assert unsupported("Test Person arrived with two dozen trunks.", ["arrived with 24 trunks"]) == []
    assert unsupported("Test Person taught for decades.", ["Test Person taught for decades."]) == []


@pytest.mark.parametrize("text", [
    "Test Person taught at Example College later that year.",
    "Test Person taught at Example College earlier that year.",
    "Test Person taught at Example College that same year.",
    "Test Person taught at Example College at the turn of the century.",
    "Test Person taught at Example College for a decade.",
    "Test Person taught at Example College for half a century.",
    "Test Person taught at Example College for a century.",
])
def test_relative_periods_and_spans_must_be_supported(text):
    assert unsupported(text, ["Test Person taught at Example College."]), text


def test_relative_periods_and_spans_pass_when_supported():
    assert unsupported("Test Person taught at Example College for a decade.",
                       ["Test Person taught at Example College for ten years."]) == []
    assert unsupported("Test Person taught at Example College for half a century.",
                       ["Test Person taught at Example College for 50 years."]) == []
    assert unsupported("Test Person left later that year.", ["Test Person left later that year."]) == []
    assert unsupported("Test Person left at the turn of the century.",
                       ["Test Person left at the turn of the century."]) == []


# --- G5 sub-units and sibling subdomains (round 2 review) -----------------------------------------

@pytest.mark.parametrize("institution", [
    "Example University Library, Special Collections",
    "Example University Library: Special Collections",
    "Example University Library Special Collections",
    "Example University Library - Special Collections",
])
@pytest.mark.parametrize("urls", [
    ("https://library.example.edu/a", "https://findingaids.example.edu/b"),
    ("https://library.example.edu/a", "https://rbsc.example.edu/b"),
])
def test_g5_sub_unit_of_one_holder_on_sibling_subdomains_counts_once(institution, urls):
    w = fx.world()
    w["sources"][1].update(institution="Example University Library", url=urls[0])  # S-0002
    w["sources"][2].update(institution=institution, url=urls[1])                     # S-0003
    f = fx.by_id(w["facts"], "TST-F-0003")
    failures = gates.g5_corroboration(f, fx.context(w))
    assert failures and "distinct institutions" in failures[0], (institution, urls)


def test_g5_sub_unit_named_without_a_url_match_counts_once():
    w = fx.world()
    w["sources"][2]["institution"] = "Example University Library, Special Collections"  # S-0002's holder
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert gates.g5_corroboration(f, fx.context(w))


def test_g5_sibling_subdomains_count_once_whatever_the_names():
    w = fx.world()
    w["sources"][1].update(url="https://library.example.edu/a")
    w["sources"][2].update(url="https://rbsc.example.edu/b", institution="Example Rare Books Room")
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert gates.g5_corroboration(f, fx.context(w))


def test_g5_names_sharing_only_a_leading_word_still_count_twice():
    w = fx.world()
    w["sources"][2]["institution"] = "Example News"  # S-0002 is "Example University Library"
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert gates.g5_corroboration(f, fx.context(w)) == []


# --- G9 archive short links and mirrors (round 2 review) ------------------------------------------

@pytest.mark.parametrize("url", [
    "https://ghostarchive.org/archive/abcd",
    "https://ghostarchive.org/search?term=abcd",
    "https://en.wikipedia-on-ipfs.org/wiki/T",
    "https://library.kiwix.org/content/wikipedia_en_all_maxi/A/T",
])
def test_g9_archive_short_links_and_mirrors_are_banned(url):
    assert gates.banned_host(url), url


def test_g9_ghostarchive_of_an_allowed_page_passes():
    assert gates.banned_host("https://ghostarchive.org/archive/https://archives.example.org/id/1") is None


# --- fetch_url must belong to the page the record names (round 2 review) --------------------------

def test_g1_fails_when_fetch_url_is_on_another_site():
    w = fx.world()
    src = w["sources"][2]  # S-0003, fetched by http from news.example.org
    src["fetch_url"] = "https://blog.unrelated.example.net/some-post"
    ctx = fx.context(w)  # the meta file is what fetch_snapshot.py would write for this record
    assert ctx.snapshots["TST-S-0003"].meta["fetch_url"] == src["fetch_url"]
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert any("fetch_url" in x for x in gates.g1_evidence(f, ctx)), gates.g1_evidence(f, ctx)


def test_fetch_url_on_the_same_site_but_another_page_fails():
    # Class C: the same site is not the same record (shared platforms host many holders).
    w = fx.world()
    w["sources"][2]["fetch_url"] = "https://api.news.example.org/v1/test-person"
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert any("not the cited record" in x for x in gates.g1_evidence(f, fx.context(w)))


# --- G2/G6 content-word coverage (round 3: the rule, not a list of patterns) -----------------
#
# Rule: a claim (or draft unit) may contain no content word that its evidence (or
# cited facts) does not contain. These are the phrasings the enumerated checks
# missed in review round 2; each must now fail because of the word it adds.

TAUGHT = "Test Person taught at Example College."


@pytest.mark.parametrize("claim,evidence,token", [
    ("Test Person twice taught at Example College.", TAUGHT, "'twice'"),
    ("Test Person taught at Example College for a score of years.",
     "Test Person taught at Example College for years.", "number 20"),
    ("Test Person taught at Example College for a third of a century.", TAUGHT, "number 3"),
    ("Test Person taught at Example College for a third of a century.", TAUGHT, "number 100"),
    ("Test Person taught at Example College later that decade.", TAUGHT, "'later'"),
    ("Test Person taught at Example College later that decade.", TAUGHT, "'decade'"),
    ("Test Person taught at Example College in the following spring.", TAUGHT, "'following'"),
    ("Test Person taught at Example College in the following spring.", TAUGHT, "'spring'"),
    ("Beijing hired Test Person.", "Test Person was hired.", "'Beijing'"),
    ("Test Person taught some classes at Example College.",
     "Test Person taught classes at Example College.", "'some'"),
    ("Test Person taught many classes at Example College.",
     "Test Person taught classes at Example College.", "'many'"),
    ("Test Person taught numerous classes at Example College.",
     "Test Person taught classes at Example College.", "'numerous'"),
    ("Test Person was a renowned teacher at Example College.",
     "Test Person was a teacher at Example College.", "'renowned'"),
    ("Test Person was the first teacher at Example College.",
     "Test Person was a teacher at Example College.", "number 1"),
    ("Test Person never taught at Example College.", TAUGHT, "'never'"),
    ("Test Person taught chemistry at Example College.", TAUGHT, "'chemistry'"),
    ("Test Person taught at Example College for decades.",
     "Test Person taught at Example College later that decade.", "'decades'"),
    ("Test Person taught at Example College for years.",
     "Test Person taught at Example College that year.", "'years'"),
])
def test_any_content_word_missing_from_the_evidence_fails(claim, evidence, token):
    failures = unsupported(claim, [evidence])
    assert any(token in f for f in failures), failures


@pytest.mark.parametrize("claim,evidence", [
    ("Test Person arrived at the Port of Example.", "Test Person arriving at the Port of Example"),
    ("Test Person studied at Example College.", "Test Person's studies at Example College"),
    ("Test Person was a teacher at the Example College.", "teacher, Example College; Test Person"),
    ("Test Person taught at Example College for thirteen years.", "taught at Example College for 13 years"),
])
def test_function_words_and_regular_inflections_need_no_support(claim, evidence):
    assert unsupported(claim, [evidence]) == []


def test_paraphrase_is_not_supported_without_the_source_word():
    # The tradeoff: no synonym table. The extractor must quote more or reuse the source's words.
    failures = unsupported("Test Person became a citizen.", ["Test Person was granted citizenship."])
    assert any("'became'" in f for f in failures) and any("'citizen'" in f for f in failures), failures
    assert unsupported("Test Person was granted citizenship.", ["Test Person was granted citizenship."]) == []


@pytest.mark.parametrize("text,support", [
    ("Teaching", "Test Person taught at Example College."),
    ("Teaching career", "Test Person taught at Example College."),
    ("Arrival record of Testa Q. Persona", "Testa Q. Persona arrived."),
    ("Early life", "Test Person was born Testa Q. Persona."),
    ("Later, Test Person taught at Example College.", "Test Person taught at Example College."),
    ("Germany was his home.", "He lived in Germany."),
])
def test_capitalized_common_words_are_no_longer_free(text, support):
    # The old name heuristic let any common word at the start of a sentence or title
    # through; each of these adds a word ("teaching", "career", "record", "early",
    # "later", "home") its support lacks.
    assert unsupported(text, [support]), text


def test_g2_claim_adding_an_ordinary_word_fails():
    _, ctx, f = ctx_and_fact("TST-F-0003")
    f["claim"] = "Test Person taught chemistry at Example College."
    assert any("'chemistry'" in x for x in gates.g2_nothing_added(f, ctx))


def test_g2_place_content_words_must_be_supported():
    _, ctx, f = ctx_and_fact("TST-F-0002")
    f["place"] = "Port of Example harbor"
    assert any("place" in x and "harbor" in x for x in gates.g2_nothing_added(f, ctx))


def test_g2_media_alt_text_adding_a_word_fails():
    w = fx.world()
    m = w["media"][0]
    assert gates.g2_media(m, fx.context(w)) == []
    m["alt_text"] = "Typed arrival record, stamped by the Port of Example (TST-F-0002)."
    assert any("alt_text" in x and "'stamped'" in x for x in gates.g2_media(m, fx.context(w)))


# --- Class B: source authority registry (G5, G9) --------------------------------------------------
#
# Rule: a source is primary or institutional only if its publisher is in a curated
# authority registry; independence is counted by registry entry; everything else is
# secondary.

def test_g9_primary_source_on_an_unregistered_host_fails():
    w = fx.world()
    w["sources"][2].update(type="primary")  # S-0003 news.example.org, not in the registry
    f = fx.by_id(w["facts"], "TST-F-0003")
    failures = gates.g9_banned_sources(f, fx.context(w))
    assert any("TST-S-0003" in x and "authority registry" in x for x in failures), failures


def test_g9_institution_must_be_the_registry_name():
    w = fx.world()
    w["sources"][1]["institution"] = "Example Univ. Library"  # S-0002 library.example.net
    f = fx.by_id(w["facts"], "TST-F-0003")
    failures = gates.g9_banned_sources(f, fx.context(w))
    assert any("'Example University Library'" in x for x in failures), failures


def test_g9_shipped_world_passes():
    w = fx.world()
    ctx = fx.context(w)
    for f in w["facts"]:
        assert gates.g9_banned_sources(f, ctx) == [], f["id"]
    for m in w["media"]:
        assert gates.g9_banned_sources(m, ctx) == [], m["id"]


def test_g9_media_only_source_cannot_be_fact_evidence():
    w = fx.world()
    w["sources"][2].update(url="https://commons.example.org/wiki/File:T.jpg", institution="Example Commons")
    ctx = fx.context(w)
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert any("media" in x and "TST-S-0003" in x for x in gates.g9_banned_sources(f, ctx))
    m = w["media"][0]
    m["source_ids"] = ["TST-S-0001", "TST-S-0003"]
    assert gates.g9_banned_sources(m, ctx) == []


def test_g5_primary_label_without_registry_is_not_a_primary_document():
    w = fx.world()
    s4 = w["sources"][3]  # S-0004, the only source of TST-F-0004
    s4.update(url="https://letters.example.com/4", institution="Example Letters")
    f = fx.by_id(w["facts"], "TST-F-0004")
    failures = gates.g5_corroboration(f, fx.context(w))
    assert failures and any("primary or institutional" in x for x in failures), failures


def test_g5_two_pages_of_one_registry_entry_count_once():
    w = fx.world()
    w["sources"][2].update(url="https://library.example.net/other", institution="Example University Library",
                           type="institutional")
    f = fx.by_id(w["facts"], "TST-F-0003")
    failures = gates.g5_corroboration(f, fx.context(w))
    assert failures and "distinct institutions" in failures[0]


def test_g5_registered_plus_independent_site_passes():
    _, ctx, f = ctx_and_fact("TST-F-0003")  # library.example.net (registered) + news.example.org
    assert gates.g5_corroboration(f, ctx) == []


def test_g5_two_gov_pages_on_one_domain_count_once():
    w = fx.world()
    w["sources"][1].update(url="https://www.example-agency.gov/a", institution="Example Agency", type="secondary")
    w["sources"][2].update(url="https://records.example-agency.gov/b", institution="Example Agency Records",
                           type="secondary")  # unregistered: authority comes only from the registry
    f = fx.by_id(w["facts"], "TST-F-0003")
    ctx = fx.context(w)
    assert gates.g9_banned_sources(f, ctx) == []
    failures = gates.g5_corroboration(f, ctx)
    assert failures and "distinct institutions" in failures[0]


# --- Class C: snapshot provenance -------------------------------------------------------------------
#
# Rule: a snapshot must be fetched from the cited record itself.

@pytest.mark.parametrize("url,fetch_url", [
    ("https://cdm.example.org/digital/collection/a/id/1", "https://cdm.example.org/digital/collection/b/id/2"),
    ("https://example.omeka.net/items/show/1", "https://example.omeka.net/items/show/2"),
    ("https://bucket-a.s3.amazonaws.com/x.json", "https://bucket-a.s3.amazonaws.com/y.json"),
    ("https://guides.example.edu/a", "https://guides.example.edu/b"),
    ("https://catalog.archives.gov/id/1234", "https://catalog.archives.gov/proxy/records/search?naId=9999"),
    ("https://catalog.archives.gov/id/1234", "https://catalog.archives.gov/api/v2/records/search?naId=1234"),
    ("https://www.loc.gov/item/1/", "https://www.loc.gov/item/2/?fo=json"),
    ("https://news.example.org/a", "https://news.example.org/a?id=2"),
    ("https://news.example.org/a", "https://news.example.org/b?format=json"),
    ("https://news.example.org/a", "http://news.example.org/a"),
])
def test_fetch_url_of_another_record_fails(url, fetch_url):
    from ihh import fetchplan
    problem = fetchplan.fetch_url_problem({"url": url, "fetch_url": fetch_url})
    assert problem and "not the cited record" in problem, (url, fetch_url)


@pytest.mark.parametrize("url,fetch_url", [
    ("https://catalog.archives.gov/id/1234", "https://catalog.archives.gov/proxy/records/search?naId=1234"),
    ("https://www.loc.gov/item/1/", "https://www.loc.gov/item/1/?fo=json"),
    ("https://commons.wikimedia.org/wiki/File:X.jpg",
     "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata"
     "&titles=File:X.jpg&format=json"),
    ("https://news.example.org/a#top", "https://news.example.org/a"),
    ("https://news.example.org/a?x=1", "https://news.example.org/a?x=1&format=json"),
    ("https://news.example.org/a", "https://news.example.org/a"),
])
def test_fetch_url_derived_from_the_record_passes(url, fetch_url):
    from ihh import fetchplan
    assert fetchplan.fetch_url_problem({"url": url, "fetch_url": fetch_url}) is None, (url, fetch_url)


def test_browser_snapshot_meta_naming_another_record_fails():
    _, ctx, f = ctx_and_fact("TST-F-0001")  # S-0002 is a browser snapshot
    _with_meta(ctx, "TST-S-0002", fetch_url="https://library.example.net/someone-else")
    failures = gates.g1_evidence(f, ctx)
    assert any("TST-S-0002" in x and "not the cited record" in x for x in failures), failures


def test_browser_snapshot_meta_without_fetch_url_passes():
    _, ctx, f = ctx_and_fact("TST-F-0001")
    assert ctx.snapshots["TST-S-0002"].meta["fetch_url"] is None
    assert gates.g1_evidence(f, ctx) == []


# --- G5 counts only sources that cover the whole claim (Codex gate review, 2026-10-10) ----------
#
# The rule: a source counts toward G5 only if its own quotes cover the whole claim (the G2
# coverage test), plus event_date and place when the fact has them. Then: one counting source
# that is a registry-allowed primary, or counting sources from 2+ independent holders with at
# least one counting registry-allowed primary or institutional source. Partial quotes from
# different sources are never pooled.

def _g5_fact(w, claim, evidence, **extra):
    f = fx.fact("TST-F-0099", claim, "career", evidence, **extra)
    w["facts"].append(f)
    return f


def _extra_holder(w, sid, host, text, stype="secondary", institution="Other Example Paper"):
    """A further source on its own unregistered host, with a snapshot as fetch_snapshot.py writes it."""
    w["snapshots"][sid] = text
    w["sources"].append(fx.source(sid, f"Page {sid}", institution, stype, f"https://{host}/page",
                                  snapshot=f"snapshots/{sid}.txt", snapshot_sha256=fx.sha(text),
                                  fetch_method="http"))


def test_g5_primary_present_but_covering_part_of_the_claim_fails():
    # EIN-F-0090's shape: a primary record supports one part, other sources the rest.
    w = fx.world()
    f = _g5_fact(w, "Testa Q. Persona arrived at the Port of Example and taught at Example College.",
                 [("TST-S-0001", "Arrived at the Port of Example"),
                  ("TST-S-0002", "taught at Example College")])
    ctx = fx.context(w)
    assert gates.g2_nothing_added(f, ctx) == []  # pooled, the quotes do cover the claim
    failures = gates.g5_corroboration(f, ctx)
    assert failures and any("whole claim" in x for x in failures)


def test_g5_primary_covering_the_whole_claim_passes():
    w = fx.world()
    f = _g5_fact(w, "Testa Q. Persona arrived at the Port of Example on June 10, 1941.",
                 [("TST-S-0001", "Arrived at the Port of Example on 1941-06-10")],
                 event_date="1941-06-10", place="Port of Example")
    assert gates.g5_corroboration(f, fx.context(w)) == []


def test_g5_primary_lacking_the_event_date_does_not_count():
    w = fx.world()
    f = _g5_fact(w, "Testa Q. Persona arrived at the Port of Example.",
                 [("TST-S-0001", "Arrived at the Port of Example"),
                  ("TST-S-0002", "arrived in the United States in June 1941")],
                 event_date="1941-06")
    ctx = fx.context(w)
    assert gates.g2_nothing_added(f, ctx) == []
    assert gates.g5_corroboration(f, ctx)


def test_g5_primary_lacking_the_place_does_not_count():
    w = fx.world()
    f = _g5_fact(w, "Testa Q. Persona arrived on June 10, 1941.",
                 [("TST-S-0001", "Arrived at the Port of Example on 1941-06-10"),
                  ("TST-S-0002", "taught at Example College")],
                 event_date="1941-06-10", place="Example College")
    ctx = fx.context(w)
    assert gates.g2_nothing_added(f, ctx) == []
    assert gates.g5_corroboration(f, ctx)


def test_g5_two_independent_holders_each_covering_the_whole_claim_pass():
    w = fx.world()
    f = _g5_fact(w, "Test Person taught at Example College.",
                 [("TST-S-0002", "taught at Example College"), ("TST-S-0003", "taught at Example College")])
    assert gates.g5_corroboration(f, fx.context(w)) == []


def test_g5_two_holders_each_covering_half_fail():
    w = fx.world()
    f = _g5_fact(w, "Test Person arrived in 1941 and taught at Example College.",
                 [("TST-S-0002", "arrived in the United States in June 1941"),
                  ("TST-S-0003", "taught at Example College")])
    ctx = fx.context(w)
    assert gates.g2_nothing_added(f, ctx) == []
    failures = gates.g5_corroboration(f, ctx)
    assert failures and any("whole claim" in x for x in failures)


def test_g5_same_holder_pair_each_covering_the_whole_claim_fails():
    w = fx.world()
    w["sources"][2].update(institution="Example University Library", type="institutional")
    f = _g5_fact(w, "Test Person taught at Example College.",
                 [("TST-S-0002", "taught at Example College"), ("TST-S-0003", "taught at Example College")])
    assert gates.g5_corroboration(f, fx.context(w))


def test_g5_counting_holders_need_a_counting_strong_source():
    # Two secondary holders cover the whole claim; the institutional source covers only part.
    w = fx.world()
    _extra_holder(w, "TST-S-0005", "paper.example.com", "Test Person taught at Example College in 1950.\n")
    f = _g5_fact(w, "Test Person taught at Example College in 1950.",
                 [("TST-S-0002", "taught at Example College"),
                  ("TST-S-0003", "taught at Example College"),
                  ("TST-S-0005", "Test Person taught at Example College in 1950.")])
    w["snapshots"]["TST-S-0003"] = w["snapshots"]["TST-S-0003"] + "Taught at Example College in 1950.\n"
    w["sources"][2]["snapshot_sha256"] = fx.sha(w["snapshots"]["TST-S-0003"])
    f["evidence"][1]["quote"] = "Taught at Example College in 1950."
    ctx = fx.context(w)
    assert gates.g1_evidence(f, ctx) == []
    assert gates.g5_corroboration(f, ctx)


def test_g5_quotes_from_one_source_are_read_together():
    # Two quotes from the same record may cover the claim between them: it is one source.
    w = fx.world()
    f = _g5_fact(w, "Testa Q. Persona arrived at the Port of Example with thirteen trunks.",
                 [("TST-S-0001", "Arrived at the Port of Example"),
                  ("TST-S-0001", "with thirteen trunks")])
    assert gates.g5_corroboration(f, fx.context(w)) == []


def test_g5_holder_whose_page_never_names_the_person_does_not_count():
    # EIN-S-0088's shape: the caption covers every other word, but the page names no one, so
    # the inductee's name cannot be supplied from the alias list for G5.
    w = fx.world()
    _extra_holder(w, "TST-S-0005", "paper.example.com", "A teacher taught at Example College.\n")
    f = _g5_fact(w, "Test Person taught at Example College.",
                 [("TST-S-0002", "taught at Example College"), ("TST-S-0005", "taught at Example College")])
    ctx = fx.context(w)
    assert gates.g2_nothing_added(f, ctx) == []
    assert gates.g5_corroboration(f, ctx)
    # The same page naming the person anywhere counts.
    w2 = fx.world()
    _extra_holder(w2, "TST-S-0005", "paper.example.com", "Test Person: a teacher taught at Example College.\n")
    f2 = _g5_fact(w2, "Test Person taught at Example College.",
                  [("TST-S-0002", "taught at Example College"), ("TST-S-0005", "taught at Example College")])
    assert gates.g5_corroboration(f2, fx.context(w2)) == []
