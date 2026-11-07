"""Re-review round 3: each test names the rule it guards (SPEC section 4).

A  nothing added (G2/G6): a claim or draft unit contains no content token its support lacks.
   content_tokens() decides what a token is; gates.Support / unsupported_tokens() apply it.
B  source authority (G5/G9): authority comes only from the registry, for the host a browser
   reaches; independence is counted by registry entry.
C  snapshot provenance (G1): a snapshot is fetched from the cited record itself.

All names, places, hosts and records are invented test data (factories.py).
"""

import json

import pytest

import check_grounding as cg
import factories as fx
import fetch_snapshot as fs
import validate as v
from ihh import authority, fetchplan, gates, normalize, paths, urls

NAMES = ["Test Person", "Testa Q. Persona"]


def unsupported(text, support_texts, names=NAMES):
    return gates.unsupported_tokens(text, gates.Support.from_texts(support_texts, names=names), "evidence")


# =====================================================================================
# A. Nothing added
# =====================================================================================

# --- A1 a stem never stands in for a closed-class word ------------------------------------

@pytest.mark.parametrize("claim,evidence,word", [
    ("Test Person was not at Example College.", "Test Person was noted at Example College.", "not"),
    ("Test Person will inherit the house.", "Test Person willed the house.", "will"),
    ("Test Person even taught at Example College.", "Test Person taught evenings at Example College.", "even"),
])
def test_a_stem_never_supplies_a_closed_class_word(claim, evidence, word):
    failures = unsupported(claim, [evidence])
    assert any(f"'{word}'" in x for x in failures), failures


def test_g2_negation_is_not_supported_by_noted():
    ctx = gates.GateContext({}, {})
    fact = {"claim": "Test Person was not at Example College.",
            "evidence": [{"source_id": "S", "quote": "Test Person was noted at Example College.",
                          "locator": "line"}]}
    assert any("'not'" in x for x in gates.g2_nothing_added(fact, ctx))


def test_closed_class_words_match_themselves():
    assert unsupported("Test Person was not at Example College.",
                       ["Test Person was not at Example College."]) == []
    assert unsupported("Test Person may have taught.", ["Test Person may have taught."]) == []


# --- A2 meaning-bearing symbols are content tokens ------------------------------------------

@pytest.mark.parametrize("claim,evidence", [
    ("Test Person had <5 medals.", "Test Person had 5 medals."),
    ("Test Person had >5 medals.", "Test Person had 5 medals."),
    ("Test Person had -5 medals.", "Test Person had 5 medals."),
    ("Test Person had +5 medals.", "Test Person had 5 medals."),
    ("Test Person had 5+ medals.", "Test Person had 5 medals."),
    ("Test Person won 50% of the vote.", "Test Person won 50 votes."),
    ("Test Person was paid $5,000.", "Test Person was paid 5,000 marks."),
    ("Test Person † 1955.", "Test Person 1955."),
    ("Test Person wrote ~300 papers.", "Test Person wrote 300 papers."),
    ("Test Person wrote ≈300 papers.", "Test Person wrote 300 papers."),
    ("Test Person was paid £500.", "Test Person was paid 500."),
    ("Test Person was paid €500.", "Test Person was paid 500."),
])
def test_symbols_and_signs_must_be_supported(claim, evidence):
    assert unsupported(claim, [evidence]), claim


def test_symbols_pass_when_the_evidence_has_them():
    assert unsupported("Test Person won 50% of the vote.", ["Test Person won 50% of the vote."]) == []
    assert unsupported("Test Person was paid $5,000.", ["Test Person was paid $5,000."]) == []
    assert unsupported("Test Person had -5 medals.", ["Test Person had -5 medals."]) == []
    # A range dash, punctuation and an ampersand state nothing of their own.
    assert unsupported("Test Person taught (1914-1918) at Example College & Co.",
                       ["Test Person taught 1914-1918 at Example College and Co"]) == []


# --- A3 a number is supported only by the same kind of number --------------------------------

@pytest.mark.parametrize("claim,evidence", [
    ("They had 3 children.", "On May 3, 1925 they married and had children."),
    ("Test Person held 12 patents.", "Test Person held patents (file B12)."),
    ("Test Person held 14 patents.", "Test Person held patents dated 1941-06-14."),
])
def test_a_date_day_or_a_code_digit_run_is_not_a_count(claim, evidence):
    failures = unsupported(claim, [evidence])
    assert any(x.startswith("number") for x in failures), failures


def test_a_code_still_supports_its_identifier_written_with_separators():
    assert unsupported("Test Person held patent 2,292,387.", ["Test Person held patent US2292387A."]) == []


def test_a_date_year_still_supports_the_year_written_alone():
    assert unsupported("Test Person married in 1925.", ["On May 3, 1925 Test Person married."]) == []


# --- A4 a multiple of a time unit keeps its unit ----------------------------------------------

@pytest.mark.parametrize("claim,evidence", [
    ("Test Person taught at Example College for a decade.", "Test Person taught 10 courses at Example College."),
    ("Test Person lived in Ulm for half a century.", "Test Person lived at 50 Bahnhofstrasse in Ulm."),
    ("Test Person lived in Ulm for a century.", "Test Person lived at 100 Bahnhofstrasse in Ulm."),
    ("Test Person lived in Ulm for two decades.", "Test Person lived at 20 Bahnhofstrasse in Ulm."),
])
def test_a_time_span_is_not_supported_by_a_bare_count(claim, evidence):
    failures = unsupported(claim, [evidence])
    assert any("decade" in x or "century" in x for x in failures), failures


def test_a_time_span_passes_with_the_same_span():
    assert unsupported("Test Person lived in Ulm for a decade.", ["Test Person lived in Ulm for a decade."]) == []
    assert unsupported("Test Person lived in Ulm for two decades.", ["Test Person lived in Ulm for 20 years."]) == []


# --- A5 an age is not a calendar decade ----------------------------------------------------------

@pytest.mark.parametrize("claim,evidence", [
    ("Test Person married in his forties.", "Test Person married in 1943."),
    ("Test Person emigrated in her twenties.", "Test Person emigrated in 1821."),
    ("Test Person emigrated in her early twenties.", "Test Person emigrated in 1921."),
    ("Test Person married in his forties.", "Test Person married in the 1940s."),
    ("Test Person married in his forties.", "Test Person married in the forties."),
])
def test_an_age_decade_is_not_supported_by_a_year_or_decade(claim, evidence):
    failures = unsupported(claim, [evidence])
    assert any("age" in x for x in failures), failures


def test_an_age_decade_passes_with_the_same_age():
    assert unsupported("Test Person married in his forties.", ["Test Person married in his forties."]) == []


# --- A6 a month is a date part, never a word ----------------------------------------------------

@pytest.mark.parametrize("claim,evidence,word", [
    ("Test Person marched to Washington in 1963.", "In March 1963 Test Person traveled to Washington.",
     "marched"),
    ("Test Person may have arrived in Boston.", "Test Person arrived in Boston on May 4, 1900.", "may"),
    ("Test Person joined the august Academy.", "Test Person joined the Academy in August 1921.", "august"),
])
def test_a_date_month_never_supports_a_word(claim, evidence, word):
    failures = unsupported(claim, [evidence])
    assert any(f"'{word}'" in x for x in failures), failures


def test_a_month_alone_is_supported_by_a_date_in_that_month():
    assert unsupported("Test Person arrived in Boston in May.", ["Test Person arrived in Boston on May 4, 1900."]) \
        == []
    failures = unsupported("Test Person arrived in Boston in June.", ["Test Person arrived in Boston on May 4, 1900."])
    assert failures and any("June" in x for x in failures), failures


# --- A7 FUNCTION_WORDS hold no word that is also a content noun -------------------------------------

NOUN_HOMOGRAPHS = ("mine", "does", "will", "can", "may", "lead", "well", "saw", "felt", "bear")


def test_function_words_hold_no_content_homograph():
    assert not set(NOUN_HOMOGRAPHS) & normalize.FUNCTION_WORDS


def test_a_mine_is_a_content_word():
    assert any("'mine'" in x for x in unsupported("Test Person worked in a mine.", ["Test Person worked."]))


# --- A8 every quotation in a draft unit is checked ---------------------------------------------

NON_QUOTE = {"id": "TST-F-0003", "claim": "Test Person said taught at Example College.", "is_direct_quote": False}


@pytest.mark.parametrize("text", [
    "Test Person said 'taught at Example College'.",
    "Test Person said ‹taught at Example College›.",
    "Test Person said 「taught at Example College」.",
    "Test Person said 『taught at Example College』.",
    "Test Person said ‘taught at Example College’.",
    "Test Person said \"taught at Example College\".",
])
def test_quoted_text_in_any_quotation_style_must_be_a_direct_quote(text):
    failures = cg.check_text(text, [NON_QUOTE], NAMES)
    assert any("quoted text" in x for x in failures), (text, failures)


def test_apostrophes_are_not_quotations():
    assert normalize.quoted_spans("Test Person's students' work") == []
    assert normalize.quoted_spans("Test Person said 'It's here'.") == ["It's here"]


# --- A9 case never changes a word's key (except the acronym of a function word) ---------------------

@pytest.mark.parametrize("claim,evidence", [
    ("Test Person held patents.", "TEST PERSON HELD PATENTS"),
    ("Test Person arrived in New York.", "TEST PERSON ARRIVED IN NEW YORK"),
    ("Test Person moved to the United States.", "TEST PERSON MOVED TO THE UNITED STATES"),
    ("TEST PERSON HELD PATENTS", "Test Person held a patent."),
])
def test_all_caps_evidence_supports_a_normally_written_claim(claim, evidence):
    assert unsupported(claim, [evidence]) == [], (claim, evidence)


def test_acronym_of_a_function_word_still_needs_the_acronym():
    assert any("'US'" in x for x in unsupported("Test Person moved to the US.", ["Test Person moved to us."]))


# --- A10 -ing nouns and their plurals meet ------------------------------------------------------

@pytest.mark.parametrize("claim,evidence", [
    ("Test Person designed buildings.", "Test Person designed the building."),
    ("Test Person designed the building.", "Test Person designed buildings."),
    ("Test Person attended meetings.", "Test Person attended the meeting."),
    ("Test Person sold paintings.", "Test Person sold a painting."),
    ("Test Person made recordings.", "Test Person made a recording."),
])
def test_ing_nouns_singular_and_plural_meet(claim, evidence):
    assert unsupported(claim, [evidence]) == [], (claim, evidence)


# --- A11 an alias is a name and supports only name words ----------------------------------------

@pytest.mark.parametrize("alias", ["for 13 years", "Test Person was not", "born 1900", "Persona 2",
                                   "taught at Example College", "Test Person 50%"])
def test_an_alias_that_is_not_a_name_is_refused(alias):
    assert normalize.name_problem(alias), alias


@pytest.mark.parametrize("alias", ["Testa Q. Persona", "Hedwig Eva Maria Kiesler", "Ludwig van Beethoven",
                                   "Joan of Arc", "Jean d'Alembert", "Test O'Person"])
def test_names_are_names(alias):
    assert normalize.name_problem(alias) is None, alias


def test_names_supply_no_numbers_and_only_name_words():
    failures = unsupported("Test Person taught for 13 years.", ["Test Person taught"],
                           names=["Test Person", "for 13 years"])
    assert any("13" in x for x in failures) and any("'years'" in x for x in failures), failures
    # A capitalized name word does not supply the same word written in lower case.
    failures = unsupported("Test Person taught in the valley.", ["Test Person taught"],
                           names=["Test Person", "Testa Valley"])
    assert any("'valley'" in x for x in failures), failures


def _alias_world():
    w = fx.world()
    identity = fx.by_id(w["facts"], "TST-F-0001")
    identity["evidence"].append({"source_id": "TST-S-0003", "quote": "taught at Example College for 13 years",
                                 "locator": "line 1"})
    w["inductee"]["aliases"].append("for 13 years")
    f3 = fx.by_id(w["facts"], "TST-F-0003")
    f3["claim"] = "Test Person taught at Example College for 13 years."
    fx.restamp(w)
    return w


def test_a_phrase_alias_backed_by_an_identity_quote_launders_nothing():
    w = _alias_world()
    ctx = fx.context(w)
    assert "for 13 years" not in ctx.names
    failures = gates.g2_nothing_added(fx.by_id(w["facts"], "TST-F-0003"), ctx)
    assert any("13" in x for x in failures), failures


def test_validate_reports_an_alias_that_is_not_a_name(tmp_path):
    w = _alias_world()
    fx.write_world(tmp_path, w)
    report = v.validate_inductee(v.paths.inductee_paths("testperson", tmp_path))
    assert any("for 13 years" in m and "not a name" in m for _, m in report.errors), report.errors


# =====================================================================================
# B. Source authority
# =====================================================================================

def _src(url, stype, institution, sid="S1"):
    return {"id": sid, "url": url, "type": stype, "institution": institution}


def _entry(**over):
    e = {"id": "x-holder", "name": "X Holder", "kind": "archive", "domains": ["x-holder.org"], "hosts": [],
         "may_be": ["primary", "institutional"], "primary_paths": ["x-holder.org/id/"],
         "verified_on": "2026-10-08", "note": "Test."}
    e.update(over)
    return e


# --- B1 no authority outside the registry (no .gov/.mil rule) --------------------------------------

def test_an_unregistered_gov_host_is_not_an_authority():
    r = authority.Registry.from_dict({"entries": []}, "empty-registry")
    src = _src("https://records.unreviewed-agency.gov/person/1", "primary", "Unreviewed Agency")
    assert r.resolve(src["url"]) is None
    assert authority.source_problems(src, r)
    assert authority.strong(src, r) is False
    fact = {"claim": "Test Person filed a petition.",
            "evidence": [{"source_id": "S1", "quote": "Test Person filed a petition.", "locator": "line"}]}
    assert gates.g5_corroboration(fact, gates.GateContext({"S1": src}, {}, registry=r))
    mil = _src("https://www.example-base.mil/x", "institutional", "Example Base")
    assert authority.source_problems(mil, r) and not authority.strong(mil, r)


# --- B2 independence by registry entry: two entries are two holders ----------------------------------

def test_two_registry_entries_on_one_registered_domain_are_two_holders():
    r = authority.Registry.from_dict({"entries": [
        _entry(id="alpha-archive", name="Alpha Archive", domains=[], hosts=["alpha.shared-host.org"],
               primary_paths=[]),
        _entry(id="beta-archive", name="Beta Archive", domains=[], hosts=["beta.shared-host.org"],
               primary_paths=[]),
    ]}, "test")
    a = _src("https://alpha.shared-host.org/1", "institutional", "Alpha Archive", "S1")
    b = _src("https://beta.shared-host.org/2", "institutional", "Beta Archive", "S2")
    assert authority.source_problems(a, r) == [] and authority.source_problems(b, r) == []
    assert len(authority.independent_groups([a, b], r)) == 2
    # An unregistered page on the same platform still joins them (conservative).
    c = _src("https://gamma.shared-host.org/3", "secondary", "Gamma Pages", "S3")
    assert len(authority.independent_groups([a, c], r)) == 1


# --- B3 the host the registry sees is the host a browser reaches -----------------------------------------

@pytest.mark.parametrize("url", [
    "https://ａｒｃｈｉｖｅｓ.example.org/id/1",  # fullwidth
    "https://archives.%65xample.org/id/1",                                          # percent-encoded host
    "https://140.147.0.1/id/1",                                                     # IP literal
    "https://[2001:db8::1]/id/1",
    "https://0x8c.0x93.0.1/id/1",
    "https://evil.example\\@archives.example.org/id/1",                             # backslash userinfo
    "https://user@archives.example.org/id/1",                                       # userinfo
    "https://archives.example.org\\.evil.example/id/1",
    "https://archives.example.org./id/1",                                           # trailing dot
    "https://archives.example.org/id/1 x",                                          # whitespace
])
def test_a_url_not_in_canonical_form_is_refused_everywhere(url):
    assert urls.problem(url), url
    assert authority.host_of(url) is None
    assert fx.REGISTRY and authority.Registry.from_dict(fx.REGISTRY).resolve(url) is None
    assert v.is_https(url) is False
    with pytest.raises(fetchplan.PlanError):
        fetchplan.plan_fetch({"url": url})
    problems = authority.source_problems(_src(url, "primary", "Example National Archives"),
                                         authority.Registry.from_dict(fx.REGISTRY))
    assert problems, url


@pytest.mark.parametrize("url,reason", [
    ("https://user@archives.example.org/id/1", "userinfo"),
    ("https://evil.example\\@archives.example.org/id/1", "backslash"),
    ("https://\uff41\uff52\uff43\uff48\uff49\uff56\uff45\uff53.example.org/id/1", "punycode"),
    ("https://140.147.0.1/id/1", "IP address"),
    ("https://archives.%65xample.org/id/1", "percent-encoding"),
])
def test_url_problems_name_the_reason(url, reason):
    assert reason in (urls.problem(url) or ""), urls.problem(url)


def test_a_disguised_copy_is_not_a_second_holder():
    w = fx.world()
    w["sources"][2].update(url="https://ｌｉｂｒａｒｙ.example.net/test-person",
                           institution="Library Digital Collections", type="secondary")
    f = fx.by_id(w["facts"], "TST-F-0003")
    ctx = fx.context(w)
    assert gates.g9_banned_sources(f, ctx), "a non-canonical url must fail G9"


def test_canonical_urls_pass():
    for url in ("https://archives.example.org/id/1", "https://www.archives.example.org:443/id/1?x=1#y",
                "https://xn--bcher-kva.example/a"):
        assert urls.problem(url) is None, url


# --- B4 a media-only publisher backs no fact, on any of its hosts --------------------------------------

def test_a_mobile_host_resolves_to_the_same_publisher():
    r = authority.Registry.from_dict(fx.REGISTRY)
    assert r.resolve("https://commons.m.example.org/wiki/File:X.jpg").id == "example-commons"
    assert r.resolve("https://m.archives.example.org/id/1").id == "example-national-archives"


def test_wikimedia_hosts_never_back_a_fact():
    r = authority.load(paths.DEFAULT_DATA_DIR / "registry" / "institutions.json")
    for url in ("https://commons.m.wikimedia.org/wiki/File:Example.jpg", "https://upload.wikimedia.org/x.jpg",
                "https://meta.wikimedia.org/wiki/X", "https://commons.wikimedia.org/wiki/File:X.jpg"):
        assert authority.media_only_problem({"url": url}, r), url
    assert r.resolve("https://commons.m.wikimedia.org/wiki/File:Example.jpg").media_only


def test_g5_and_g9_refuse_a_mobile_commons_page_as_fact_evidence():
    w = fx.world()
    w["registry"] = json.loads(json.dumps(fx.REGISTRY))
    w["sources"][2].update(url="https://commons.m.example.org/wiki/File:Example.jpg", institution="Example Commons",
                           type="secondary")
    f = fx.by_id(w["facts"], "TST-F-0003")
    ctx = fx.context(w)
    assert gates.g9_fact_use(f, ctx), "a media-only publisher on its mobile host backs no fact"


# --- B5 primary is granted only where the registry scopes it ----------------------------------------

def test_primary_needs_a_page_in_the_entrys_primary_paths():
    r = authority.Registry.from_dict({"entries": [_entry()]}, "test")
    inside = _src("https://x-holder.org/id/7", "primary", "X Holder")
    outside = _src("https://x-holder.org/about/biography", "primary", "X Holder")
    assert authority.source_problems(inside, r) == [] and authority.strong(inside, r)
    problems = authority.source_problems(outside, r)
    assert problems and "primary_paths" in problems[0], problems
    assert not authority.strong(outside, r)
    # The same page may still be institutional.
    assert authority.source_problems(dict(outside, type="institutional"), r) == []


@pytest.mark.parametrize("kind", ["museum", "university", "prize", "foundation"])
def test_an_entry_that_is_not_a_records_holder_grants_no_primary_without_primary_paths(kind):
    r = authority.Registry.from_dict({"entries": [_entry(primary_paths=[], kind=kind)]}, "test")
    src = _src("https://x-holder.org/id/7", "primary", "X Holder")
    assert authority.source_problems(src, r) and not authority.strong(src, r)
    assert authority.source_problems(dict(src, type="institutional"), r) == []


@pytest.mark.parametrize("paths_value,match", [
    (["other.org/id/"], "primary_paths"),
    (["x-holder.org/id"], "primary_paths"),
    (["x-holder.org"], "primary_paths"),
    ("x-holder.org/id/", "primary_paths"),
])
def test_malformed_primary_paths_are_refused(paths_value, match):
    with pytest.raises(authority.RegistryError, match=match):
        authority.Registry.from_dict({"entries": [_entry(primary_paths=paths_value)]}, "test")


def test_primary_paths_need_primary_in_may_be():
    with pytest.raises(authority.RegistryError, match="primary_paths"):
        authority.Registry.from_dict({"entries": [_entry(may_be=["institutional"])]}, "test")


def test_a_biography_page_on_a_shipped_entry_is_not_primary():
    r = authority.load(paths.DEFAULT_DATA_DIR / "registry" / "institutions.json")
    src = _src("https://www.hoophall.com/hall-of-famers/james-naismith/", "primary",
               "Naismith Memorial Basketball Hall of Fame")
    assert authority.source_problems(src, r) and not authority.strong(src, r)
    fact = {"claim": "x", "evidence": [{"source_id": "S1", "quote": "x", "locator": "l"}]}
    assert gates.g5_corroboration(fact, gates.GateContext({"S1": src}, {}, registry=r))


# =====================================================================================
# C. Snapshot provenance
# =====================================================================================

def test_query_parameter_order_does_not_make_another_record():
    assert fetchplan.fetch_url_problem({"url": "https://archive.example.org/record?id=1&view=full",
                                        "fetch_url": "https://archive.example.org/record?view=full&id=1"}) is None
    assert fetchplan.fetch_url_problem({"url": "https://archive.example.org/record?id=1&view=full",
                                        "fetch_url": "https://archive.example.org/record?view=full&id=2"})


@pytest.mark.parametrize("url,fetch_url", [
    ("https://viewer.example.org/app#/record/5", "https://viewer.example.org/app#/record/6"),
    ("https://viewer.example.org/app", "https://viewer.example.org/app#/record/6"),
])
def test_a_fragment_may_be_dropped_never_added_or_changed(url, fetch_url):
    assert fetchplan.fetch_url_problem({"url": url, "fetch_url": fetch_url}), (url, fetch_url)


def test_a_fragment_may_be_dropped():
    assert fetchplan.fetch_url_problem({"url": "https://viewer.example.org/app#/record/5",
                                        "fetch_url": "https://viewer.example.org/app"}) is None


class _RedirectingNet:
    """Answers every request as if the server had redirected it to final_url."""

    def __init__(self, final_url, body):
        self.final_url, self.body = final_url, body

    def __call__(self, request, timeout):
        import email.message

        class Resp:
            status = 200
            headers = email.message.Message()

            def __init__(s):
                s.headers["Content-Type"] = "text/plain; charset=utf-8"

            def read(s, n=-1):
                return self.body.encode("utf-8")

            def geturl(s):
                return self.final_url

            def __enter__(s):
                return s

            def __exit__(s, *exc):
                return False
        return Resp()


BODY = ("Unrelated record about someone else entirely, knighted in 1950. " * 10).strip()


def _fetch_world(tmp_path):
    w = fx.world()
    w["sources"].append(fx.source("TST-S-0005", "Example record", "Example Publisher", "secondary",
                                  "https://records.example.net/record/5", snapshot=None, snapshot_sha256=None,
                                  fetch_method=None))
    root = fx.write_world(tmp_path, w)
    return root


def test_a_redirect_to_another_record_is_refused(tmp_path, monkeypatch):
    root = _fetch_world(tmp_path)
    monkeypatch.setattr(fs, "_urlopen", _RedirectingNet("https://other.example.net/other-record", BODY))
    code = fs.main(["testperson", "TST-S-0005", "--data-dir", str(tmp_path)])
    assert code == 1
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()


def test_a_redirect_within_the_record_is_kept_and_recorded(tmp_path, monkeypatch):
    root = _fetch_world(tmp_path)
    monkeypatch.setattr(fs, "_urlopen", _RedirectingNet("https://www.records.example.net/record/5/", BODY))
    assert fs.main(["testperson", "TST-S-0005", "--data-dir", str(tmp_path)]) == 0
    meta = json.loads((root / "snapshots" / "TST-S-0005.meta.json").read_text(encoding="utf-8"))
    assert meta["final_url"] == "https://www.records.example.net/record/5/"


def test_the_redirect_handler_refuses_another_record_before_following_it():
    import urllib.error
    import urllib.request
    req = urllib.request.Request("https://records.example.net/record/5")
    req.ihh_record = "https://records.example.net/record/5"
    handler = fs._HttpOnlyRedirects()
    with pytest.raises(urllib.error.URLError):
        handler.redirect_request(req, None, 302, "Found", {}, "https://other.example.net/other-record")
    with pytest.raises(urllib.error.URLError):
        handler.redirect_request(req, None, 302, "Found", {}, "https://127.0.0.1/record/5")
    new = handler.redirect_request(req, None, 302, "Found", {}, "https://records.example.net/record/5/")
    assert new is not None and new.ihh_record == req.ihh_record


def test_g1_refuses_a_meta_whose_final_url_is_another_record():
    w = fx.world()
    ctx = fx.context(w)
    snap = ctx.snapshots["TST-S-0003"]
    snap.meta["final_url"] = "https://other.example.net/other-record"
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert any("final_url" in x for x in gates.g1_evidence(f, ctx))
