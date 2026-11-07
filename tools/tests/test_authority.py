"""Tests for the source authority registry (tools/ihh/authority.py, SPEC sections 3.2 and 4 G5/G9).

Rule: a source is primary or institutional only if its publisher is in a curated
authority registry; independence is counted by registry entry; everything else
is secondary.
"""

import copy
import json

import pytest

import factories as fx
from ihh import authority, paths, records


def reg(entries=None):
    data = copy.deepcopy(fx.REGISTRY)
    if entries is not None:
        data["entries"] = entries
    return authority.Registry.from_dict(data, source="test")


def entry(**over):
    e = {"id": "x-holder", "name": "X Holder", "kind": "archive", "domains": ["x-holder.org"], "hosts": [],
         "may_be": ["primary", "institutional"], "verified_on": "2026-10-08", "note": "Test."}
    e.update(over)
    return e


def src(url, stype="secondary", institution="Example News", sid="TST-S-0009"):
    return {"id": sid, "url": url, "type": stype, "institution": institution}


# --- registered domains ---------------------------------------------------------------------

@pytest.mark.parametrize("host,expected", [
    ("library.example.edu", "example.edu"),
    ("www.example.co.uk", "example.co.uk"),
    ("a.b.example.gov.uk", "example.gov.uk"),
    ("history.state.gov", "state.gov"),
    ("albert-einstein.huji.ac.il", "huji.ac.il"),
    ("catalog.archives.gov", "archives.gov"),
    ("www.alberteinstein.info", "alberteinstein.info"),
    ("example.org", "example.org"),
    ("EXAMPLE.org.", "example.org"),
])
def test_registered_domain(host, expected):
    assert authority.registered_domain(host) == expected


@pytest.mark.parametrize("host", ["gov", "co.uk", "ac.il", "com", "", None])
def test_a_public_suffix_has_no_registered_domain(host):
    assert authority.registered_domain(host) is None


# --- resolve: exact host or registered domain; nothing is unwrapped -------------------------------

def test_resolve_exact_host_and_www():
    r = reg()
    assert r.resolve("https://archives.example.org/id/1").id == "example-national-archives"
    assert r.resolve("https://www.library.example.net/x").id == "example-university-library"
    assert r.resolve("https://news.example.org/x") is None


def test_resolve_registered_domain_covers_its_subdomains_only():
    r = reg([entry()])
    assert r.resolve("https://x-holder.org/a").id == "x-holder"
    assert r.resolve("https://catalog.x-holder.org/a").id == "x-holder"
    assert r.resolve("https://evilx-holder.org/a") is None
    assert r.resolve("https://x-holder.org.evil.com/a") is None


@pytest.mark.parametrize("url", [
    "https://web.archive.org/web/2020/https://archives.example.org/id/1",
    "https://archive.ph/abcd/https://archives.example.org/id/1",
    "https://archives-example-org.translate.goog/id/1",
    "https://translate.google.com/translate?u=https://archives.example.org/id/1",
    "https://perma.cc/ABCD-1234",
    "https://archives.example.org@evil.example.com/id/1",
    "https://evil.example.com/?u=https://archives.example.org/id/1",
    "http://archives.example.org.evil.example.com/id/1",
    "ftp://archives.example.org/id/1",
    "not a url",
])
def test_wrappers_and_lookalikes_never_resolve(url):
    assert reg().resolve(url) is None, url


def test_unregistered_gov_and_mil_hosts_resolve_to_nothing():
    # Authority comes only from the registry (re-review round 3): a .gov or .mil host no
    # entry covers is an unregistered site like any other.
    r = reg()
    for url in ("https://www.example-agency.gov/page", "https://data.example-agency.gov/other",
                "https://www.example-base.mil/x", "https://gov.example.com/x", "https://example.gov.evil.com/x"):
        assert r.resolve(url) is None, url


def test_a_registry_entry_wins_over_the_gov_rule():
    r = reg([entry(id="lib", name="Lib", domains=["example-lib.gov"], kind="government")])
    assert r.resolve("https://www.example-lib.gov/x").id == "lib"


# --- registry loading: the file is reviewed data, malformed entries are refused -----------------

@pytest.mark.parametrize("bad,match", [
    (entry(domains=["catalog.x-holder.org"]), "registered domain"),
    (entry(domains=["gov"]), "registered domain"),
    (entry(domains=["co.uk"]), "registered domain"),
    (entry(domains=[], hosts=[]), "domains or hosts"),
    (entry(may_be=["secondary", "primary"]), "may_be"),
    (entry(may_be=["primary", "tertiary"]), "may_be"),
    (entry(kind="blog"), "kind"),
    (entry(verified_on=""), "verified_on"),
    (entry(note=""), "note"),
    (entry(name=""), "name"),
    (entry(id="Bad Id"), "id"),
])
def test_malformed_registry_entries_are_refused(bad, match):
    with pytest.raises(authority.RegistryError, match=match):
        reg([bad])


def test_duplicate_ids_and_overlapping_domains_are_refused():
    with pytest.raises(authority.RegistryError, match="id"):
        reg([entry(), entry(domains=["other.org"])])
    with pytest.raises(authority.RegistryError, match="x-holder.org"):
        reg([entry(), entry(id="y", name="Y", domains=["x-holder.org"])])
    with pytest.raises(authority.RegistryError, match="x-holder.org"):
        reg([entry(), entry(id="y", name="Y", domains=[], hosts=["www.x-holder.org"])])


def test_missing_registry_file_resolves_nothing(tmp_path):
    r = authority.load(tmp_path / "registry" / "institutions.json")
    assert r.missing
    assert r.resolve("https://archives.example.org/id/1") is None
    assert r.resolve("https://www.example-agency.gov/x") is None


def test_unreadable_registry_file_is_an_error(tmp_path):
    path = tmp_path / "institutions.json"
    path.write_text("{not json", encoding="utf-8")
    with pytest.raises(authority.RegistryError):
        authority.load(path)


# --- the shipped registry --------------------------------------------------------------------------

def test_shipped_registry_loads_and_every_entry_is_reviewed():
    r = authority.load(paths.DEFAULT_DATA_DIR / "registry" / "institutions.json")
    assert not r.missing and len(r.entries) >= 15
    for e in r.entries:
        assert e.verified_on and e.note and e.name
    assert r.resolve("https://catalog.archives.gov/id/596270").name == \
        "U.S. National Archives and Records Administration"
    assert r.resolve("https://history.state.gov/x").id == r.resolve("https://www.state.gov/y").id
    assert r.resolve("https://patents.google.com/patent/US2292387A/en").may_be == ("secondary",)
    assert r.resolve("https://books.google.com/books?id=1") is None
    assert r.resolve("https://commons.wikimedia.org/wiki/File:X.jpg").media_only
    assert r.resolve("https://upload.wikimedia.org/x.jpg") is None
    assert r.resolve("https://immigranthallofhonor.org/inductees/x/").may_be == ("secondary",)
    assert r.resolve("https://www.britannica.com/biography/x").may_be == ("secondary",)
    assert r.resolve("https://en.wikipedia.org/wiki/X") is None


# --- source standing (G9 type and institution rules) -------------------------------------------------

def test_primary_or_institutional_needs_a_registered_publisher():
    r = reg()
    assert authority.source_problems(src("https://archives.example.org/id/9", "primary",
                                         "Example National Archives"), r) == []
    for stype in ("primary", "institutional"):
        problems = authority.source_problems(src("https://news.example.org/x", stype), r)
        assert problems and "authority registry" in problems[0], stype
    assert authority.source_problems(src("https://news.example.org/x", "secondary"), r) == []


def test_a_wrapper_of_a_registered_page_is_secondary_only():
    url = "https://web.archive.org/web/2020/https://archives.example.org/id/1"
    problems = authority.source_problems(src(url, "primary", "Internet Archive"), reg())
    assert problems and "authority registry" in problems[0]


def test_type_must_be_one_the_entry_allows():
    r = reg()
    problems = authority.source_problems(src("https://commons.example.org/x", "institutional",
                                             "Example Commons"), r)
    assert problems and "may be secondary" in problems[0]
    assert authority.source_problems(src("https://commons.example.org/x", "secondary", "Example Commons"), r) == []


def test_institution_must_be_the_registry_name():
    problems = authority.source_problems(src("https://archives.example.org/id/9", "primary",
                                             "Example Natl. Archives"), reg())
    assert problems and "'Example National Archives'" in problems[0]


@pytest.mark.parametrize("institution", [
    "Example National Archives",
    "The Example National Archives.",
    "Example National Archives, Special Collections",
    "example national archives (mirror)",
])
def test_an_unregistered_site_may_not_claim_a_registered_holder(institution):
    problems = authority.source_problems(src("https://mirror.example.com/x", "secondary", institution), reg())
    assert problems and "Example National Archives" in problems[0] and "domains" in problems[0], institution


def test_unregistered_gov_sources_are_secondary_and_name_their_own_institution():
    r = reg()
    problems = authority.source_problems(src("https://www.example-agency.gov/x", "primary",
                                             "Example Agency, Records Office"), r)
    assert problems and "authority registry" in problems[0]
    assert authority.source_problems(src("https://www.example-agency.gov/x", "secondary",
                                         "Example Agency, Records Office"), r) == []
    problems = authority.source_problems(src("https://www.example-agency.gov/x", "secondary",
                                             "Example National Archives"), r)
    assert problems and "Example National Archives" in problems[0]


# --- independence ----------------------------------------------------------------------------------

def _count(urls_and_names, r=None):
    sources = [src(u, "secondary", n, sid=f"TST-S-{i:04d}") for i, (u, n) in enumerate(urls_and_names, 1)]
    return len(authority.independent_groups(sources, r or reg()))


def test_independence_is_counted_by_registry_entry():
    r = reg([entry(domains=["x-holder.org"], hosts=["x-holder.example-host.net"])])
    # Different sites and names that claim nothing: only the registry entry joins them.
    assert _count([("https://x-holder.org/a", "Reading Room A"),
                   ("https://x-holder.example-host.net/b", "Reading Room B")], r) == 1


def test_unregistered_sources_are_counted_by_registered_domain():
    assert _count([("https://a.example.com/1", "A"), ("https://b.example.com/2", "B")]) == 1
    assert _count([("https://a.example.com/1", "A"), ("https://b.example.net/2", "B")]) == 2
    assert _count([("https://archive.org/details/a", "A"), ("https://archive.org/details/b", "B")]) == 1


def test_gov_sources_are_counted_by_registered_domain():
    assert _count([("https://www.example-agency.gov/1", "A"), ("https://data.example-agency.gov/2", "B")]) == 1
    assert _count([("https://www.example-agency.gov/1", "A"), ("https://other-agency.gov/2", "A")]) == 2


def test_a_source_claiming_a_registered_holder_counts_as_that_holder():
    assert _count([("https://archives.example.org/id/1", "Example National Archives"),
                   ("https://mirror.example.com/x", "Example National Archives, Reading Room")]) == 1


def test_free_text_names_do_not_make_two_holders():
    # Before the registry, a variant institution string on a second site counted twice.
    assert _count([("https://archives.example.org/id/1", "Example National Archives"),
                   ("https://archives.example.org/id/2", "Example Natl Archive Records")]) == 1


# --- the registry is human-reviewed: tools never write it ------------------------------------------

def test_tools_refuse_to_write_the_registry(tmp_path):
    w = fx.world()
    fx.write_world(tmp_path, w)
    target = tmp_path / "registry" / "institutions.json"
    before = target.read_bytes()
    with pytest.raises(PermissionError, match="registry"):
        records.write_json(target, {"entries": []})
    with pytest.raises(PermissionError, match="registry"):
        records.write_jsonl(tmp_path / "registry" / "extra.jsonl", [{"a": 1}])
    from ihh import textfiles
    with pytest.raises(PermissionError, match="registry"):
        textfiles.write_text(target, "{}")
    assert target.read_bytes() == before
    assert not (tmp_path / "registry" / "extra.jsonl").exists()


def test_the_shipped_registry_is_refused_too():
    target = paths.DEFAULT_DATA_DIR / "registry" / "institutions.json"
    before = target.read_bytes()
    with pytest.raises(PermissionError):
        records.write_json(target, json.loads(before))
    assert target.read_bytes() == before
