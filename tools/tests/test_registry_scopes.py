"""Owner-approved registry scopes (docs/handoff/DECISIONS.md, 2026-10-10 entries; SPEC 3.6).

- A single-record entry (`urls`): the publisher counts only for the listed record (Nature, the
  1921 report, vol. 107, p. 539); every other page on its site is unregistered and secondary.
- A transcription-only entry (`content_part`): the publisher counts only for a source that carries
  `content_part: "transcription"`; the snapshot marks the transcribed document text, and every
  quote check (G1, G2, G5, media text) reads only that marked text, never editors' notes.
- Public university archives: kind `public-university-archive`, institutional only, exact hosts
  only (a university's whole domain is never trusted).
- NPS: primary only on NRHP/NHL nomination forms (`primary_paths`).
"""

import copy
import json
from pathlib import Path

import pytest

import factories as fx
import adversary
from ihh import authority, gates, judged, paths, records, schema

ROOT = Path(__file__).resolve().parents[2]
NATURE = "https://www.nature.com/articles/107539a0"


def reg(entries):
    return authority.Registry.from_dict({"entries": entries}, source="test")


def entry(**over):
    e = {"id": "x-holder", "name": "X Holder", "kind": "archive", "domains": ["x-holder.org"], "hosts": [],
         "may_be": ["institutional"], "verified_on": "2026-10-10", "note": "Test."}
    e.update(over)
    return e


def src(url, stype="institutional", institution="X Holder", sid="TST-S-0009", **extra):
    return {"id": sid, "url": url, "type": stype, "institution": institution, **extra}


# --- single-record entries (urls) -------------------------------------------------------------

def one_record():
    return reg([entry(id="journal-report", name="Example Journal, volume 7, page 9", kind="publisher-aggregator",
                      domains=[], hosts=[], urls=["https://www.journal.example.org/articles/7009a0"])])


@pytest.mark.parametrize("url", [
    "https://www.journal.example.org/articles/7009a0",
    "https://journal.example.org/articles/7009a0",
    "https://www.journal.example.org/articles/7009a0/",
])
def test_a_single_record_entry_covers_that_record(url):
    r = one_record()
    assert r.resolve(url).id == "journal-report"
    s = src(url, institution="Example Journal, volume 7, page 9")
    assert authority.strong(s, r)
    assert authority.source_problems(s, r) == []


@pytest.mark.parametrize("url", [
    "https://www.journal.example.org/articles/7009b0",
    "https://www.journal.example.org/articles/7009a0x",
    "https://www.journal.example.org/",
    "https://other.journal.example.org/articles/7009a0",
    "https://www.journal.example.org/articles/7009a0?page=2",
])
def test_a_single_record_entry_covers_no_other_page_on_its_site(url):
    r = one_record()
    assert r.resolve(url) is None
    s = src(url, institution="Example Journal")
    assert not authority.strong(s, r)
    assert any("not in it" in p for p in authority.source_problems(s, r))


def test_an_unregistered_page_on_the_same_site_is_the_same_holder_for_g5():
    r = one_record()
    a = authority.standing(src("https://www.journal.example.org/articles/7009a0"), r)
    b = authority.standing(src("https://www.journal.example.org/articles/1234a0", institution="Example Journal"), r)
    assert a.same_holder(b)


@pytest.mark.parametrize("bad, expected", [
    ({"urls": ["http://journal.example.org/a"]}, "urls"),
    ({"urls": ["https://user@journal.example.org/a"]}, "urls"),
    ({"urls": "https://journal.example.org/a"}, "urls"),
    ({"urls": ["https://journal.example.org/a"], "domains": ["journal.example.org"]}, "urls"),
    ({"urls": ["https://journal.example.org/a"], "hosts": ["journal.example.org"]}, "urls"),
    ({"urls": ["https://journal.example.org/a"], "may_be": ["primary", "institutional"],
      "primary_paths": ["journal.example.org/a/"]}, "primary_paths"),
])
def test_loader_refuses_a_malformed_single_record_entry(bad, expected):
    e = entry(id="journal-report", kind="publisher-aggregator", domains=[], hosts=[])
    e.update(bad)
    with pytest.raises(authority.RegistryError, match=expected):
        reg([e])


def test_a_single_record_entry_may_not_sit_under_another_entrys_domain():
    with pytest.raises(authority.RegistryError, match="one host, one publisher|under"):
        reg([entry(domains=["journal.example.org"]),
             entry(id="journal-report", kind="publisher-aggregator", domains=[], hosts=[],
                   urls=["https://journal.example.org/articles/1"])])


# --- transcription-only entries (content_part) ------------------------------------------------

DOC_PATHS = ["/vol[0-9]{1,2}[ab]?-doc/[0-9]+/?"]


def edition():
    return reg([entry(id="papers-edition", name="Example Papers Edition", kind="university", domains=[],
                      hosts=["papers.example.edu"], content_part="transcription",
                      document_paths=DOC_PATHS)])


def test_a_transcription_only_entry_counts_only_for_a_transcription_source():
    r = edition()
    url = "https://papers.example.edu/vol1-doc/12"
    plain = src(url, institution="Example Papers Edition")
    assert not authority.strong(plain, r)
    assert any("content_part" in p for p in authority.source_problems(plain, r))
    marked = src(url, institution="Example Papers Edition", content_part="transcription")
    assert authority.strong(marked, r)
    assert authority.source_problems(marked, r) == []
    # secondary is always allowed, with or without the field
    assert authority.source_problems(src(url, stype="secondary", institution="Example Papers Edition"), r) == []


EPP_NON_DOCUMENT = [
    "https://papers.example.edu/vol1-trans/12",          # editors' translation volume
    "https://papers.example.edu/vol1/12",                # bare volume (index, cumulative)
    "https://papers.example.edu/vol1-doc/",              # volume front page
    "https://papers.example.edu/vol1-doc/12/notes",      # a sub-page
    "https://papers.example.edu/vol1-doc/12?printMode=true",  # query string
    "https://papers.example.edu/einstein-database/",     # database landing page
    "https://papers.example.edu/introduction",
    "https://papers.example.edu/vol123-doc/12",
    "https://papers.example.edu/xvol1-doc/12",
]


@pytest.mark.parametrize("url", EPP_NON_DOCUMENT)
def test_a_non_document_page_does_not_count_even_with_the_flag(url):
    r = edition()
    flagged = src(url, institution="Example Papers Edition", content_part="transcription")
    assert not authority.strong(flagged, r)
    problems = authority.source_problems(flagged, r)
    assert any("document" in p for p in problems), problems


@pytest.mark.parametrize("url", EPP_NON_DOCUMENT)
def test_a_flagged_secondary_on_a_non_document_page_is_refused_too(url):
    # marker misuse: the flag (and so manual markers) on a page outside the document paths is a G9 failure
    r = edition()
    flagged = src(url, stype="secondary", institution="Example Papers Edition", content_part="transcription")
    assert any("not a document-transcription page" in p for p in authority.source_problems(flagged, r))
    g9 = gates.g9_source(flagged, r)
    assert g9


@pytest.mark.parametrize("url", [
    "https://papers.example.edu/vol1-doc/12",
    "https://papers.example.edu/vol12-doc/123/",
    "https://papers.example.edu/vol8a-doc/5",
    "https://papers.example.edu/vol8b-doc/5#p5",
    "https://www.papers.example.edu/vol16-doc/900",
])
def test_a_document_page_counts_with_the_flag(url):
    r = edition()
    ok = src(url, institution="Example Papers Edition", content_part="transcription")
    assert authority.strong(ok, r)
    assert authority.source_problems(ok, r) == []


def test_marker_misuse_on_a_non_document_page_fails_validation():
    w = transcription_world()
    w["sources"][-1]["url"] = "https://papers.example.edu/vol1-trans/12"
    problems = gates.g9_source(w["sources"][-1], fx.registry(w))
    assert any("document" in p for p in problems)


def test_loader_requires_document_paths_with_content_part():
    with pytest.raises(authority.RegistryError, match="document_paths"):
        reg([entry(content_part="transcription")])
    with pytest.raises(authority.RegistryError, match="document_paths"):
        reg([entry(document_paths=["/a/"])])
    with pytest.raises(authority.RegistryError, match="document_paths"):
        reg([entry(content_part="transcription", document_paths=["[unclosed"])])
    with pytest.raises(authority.RegistryError, match="document_paths"):
        reg([entry(content_part="transcription", document_paths=["no-slash"])])


def test_loader_refuses_an_unknown_content_part():
    with pytest.raises(authority.RegistryError, match="content_part"):
        reg([entry(content_part="notes")])


@pytest.mark.parametrize("value", ["notes", "", "Transcription", 1, None])
def test_schema_refuses_a_bad_content_part(value):
    s = {"id": "TST-S-0009", "title": "t", "institution": "i", "type": "secondary",
         "url": "https://x.example.org/a", "accessed": "2026-10-10", "content_part": value}
    problems = schema.record_problems("source", s)[0]
    assert any("content_part" in p for p in problems)


def test_schema_accepts_content_part_transcription():
    s = {"id": "TST-S-0009", "title": "t", "institution": "i", "type": "secondary",
         "url": "https://x.example.org/a", "accessed": "2026-10-10", "content_part": "transcription"}
    assert schema.record_problems("source", s)[0] == []


def test_write_boundary_refuses_a_bad_content_part(tmp_path):
    root = fx.write_world(tmp_path, fx.world())
    p = paths.inductee_paths(fx.SLUG, tmp_path)
    before = p.sources.read_bytes()
    rows = fx.read_rows(root, "sources")
    rows[2]["content_part"] = "editorial note"
    with pytest.raises(records.SchemaError, match="content_part"):
        records.write_jsonl(p.sources, rows)
    assert p.sources.read_bytes() == before


# --- the transcribed portion is the only quotable text -----------------------------------------

LETTER = (
    "Editors' introduction: Test Person arrived at the Port of Example in 1941 and taught at Example College.\n"
    "<<<TRANSCRIPTION>>>\n"
    "Dear colleague, I have taught at Example College for a year.\n"
    "Yours, Test Person\n"
    "<<<END TRANSCRIPTION>>>\n"
    "[1] Editors' note: the Port of Example is in Example County.\n"
)


def transcription_world(snapshot=LETTER):
    w = fx.world()
    w["registry"] = copy.deepcopy(fx.REGISTRY)
    w["registry"]["entries"].append(
        {"id": "papers-edition", "name": "Example Papers Edition", "kind": "university", "domains": [],
         "hosts": ["papers.example.edu"], "may_be": ["institutional"], "content_part": "transcription",
         "document_paths": DOC_PATHS, "verified_on": fx.TODAY, "note": "Test edition."})
    w["sources"].append(fx.source("TST-S-0005", "Letter, Test Person to a colleague", "Example Papers Edition",
                                  "institutional", "https://papers.example.edu/vol1-doc/12",
                                  content_part="transcription", snapshot="snapshots/TST-S-0005.txt",
                                  snapshot_sha256=fx.sha(snapshot), fetch_method="manual"))
    w["snapshots"]["TST-S-0005"] = snapshot
    return w


def g1_for(w, quote):
    f = fx.fact("TST-F-0009", "Test Person taught at Example College.", "career", [("TST-S-0005", quote)])
    return gates.g1_evidence(f, fx.context(w)), f


def test_a_quote_inside_the_transcription_passes_g1():
    w = transcription_world()
    problems, _ = g1_for(w, "I have taught at Example College")
    assert problems == []


@pytest.mark.parametrize("quote", [
    "taught at Example College.\n<<<TRANSCRIPTION>>>",   # spans the marker
    "Test Person arrived at the Port of Example in 1941",  # editors' introduction
    "the Port of Example is in Example County",            # editors' note
    "Example College for a year. Yours, Test Person [1] Editors",  # runs out of the transcription
])
def test_a_quote_from_the_editorial_apparatus_fails_g1(quote):
    w = transcription_world()
    problems, _ = g1_for(w, quote)
    assert problems and "quote not found" in " ".join(problems)


def test_a_transcription_source_without_marked_text_fails_g1():
    w = transcription_world(snapshot="Dear colleague, I have taught at Example College for a year.\n")
    problems, _ = g1_for(w, "I have taught at Example College")
    assert any("transcription" in p for p in problems)


@pytest.mark.parametrize("bad", [
    "<<<TRANSCRIPTION>>>\nopen and never closed\n",
    "<<<END TRANSCRIPTION>>>\nclosed first\n<<<TRANSCRIPTION>>>\nx\n<<<END TRANSCRIPTION>>>\n",
    "<<<TRANSCRIPTION>>>\n<<<TRANSCRIPTION>>>\nnested\n<<<END TRANSCRIPTION>>>\n<<<END TRANSCRIPTION>>>\n",
    "<<<TRANSCRIPTION>>>\n   \n<<<END TRANSCRIPTION>>>\n",
])
def test_unbalanced_or_empty_transcription_markers_fail(bad):
    w = transcription_world(snapshot=bad)
    problems, _ = g1_for(w, "x")
    assert any("transcription" in p for p in problems)


def test_g5_and_g2_read_only_the_transcription():
    # the name and the date are only in the editors' introduction: the letter alone cannot vouch
    # for "arrived ... in 1941" (G2/G5 support comes only from quotes, and quotes only from the
    # transcription), and the page-name words come from the transcription only
    w = transcription_world()
    ctx = fx.context(w)
    assert "1941" not in ctx.snapshot_text("TST-S-0005")
    assert "editors" not in ctx.snapshot_text("TST-S-0005")
    assert "example college" in ctx.snapshot_text("TST-S-0005")
    words = gates._page_text(ctx, "TST-S-0005")
    assert "county" not in words and "introduction" not in words


def test_other_sources_read_their_whole_snapshot():
    w = transcription_world()
    ctx = fx.context(w)
    assert "thirteen trunks" in ctx.snapshot_text("TST-S-0001")


def test_markers_mean_nothing_on_a_source_without_content_part():
    w = transcription_world()
    w["snapshots"]["TST-S-0003"] = w["snapshots"]["TST-S-0003"] + "<<<TRANSCRIPTION>>>\nzzz\n<<<END TRANSCRIPTION>>>\n"
    ctx = fx.context(w)
    assert "13 years" in ctx.snapshot_text("TST-S-0003")


# --- the adversary is told, and the payload carries the field ---------------------------------

def test_payload_carries_content_part_only_when_set():
    w = transcription_world()
    sources = gates.by_id(w["sources"])
    with_part = judged.source_view("TST-S-0005", sources["TST-S-0005"], None)
    without = judged.source_view("TST-S-0003", sources["TST-S-0003"], None)
    assert with_part["content_part"] == "transcription"
    assert "content_part" not in without  # existing fingerprints do not move


def test_fingerprint_changes_when_content_part_changes():
    w = transcription_world()
    f = fx.fact("TST-F-0009", "Test Person taught at Example College.", "career",
                [("TST-S-0005", "I have taught at Example College")])
    sources = gates.by_id(w["sources"])
    a = judged.record_fingerprint(f, "fact", sources)
    s2 = copy.deepcopy(sources)
    del s2["TST-S-0005"]["content_part"]
    assert judged.record_fingerprint(f, "fact", s2) != a


def test_adversary_prompt_requires_the_quote_to_be_document_text():
    w = transcription_world()
    sources = gates.by_id(w["sources"])
    f = fx.fact("TST-F-0009", "Test Person taught at Example College.", "career",
                [("TST-S-0005", "I have taught at Example College")])
    item = adversary.make_item(f, "fact", sources, None)
    prompt = adversary.build_prompt([item], w["inductee"], registry=fx.registry(w))
    assert "content part: transcription" in prompt
    low = prompt.lower()
    for word in ("editorial", "footnote", "introduction", "commentary", "transcribed document text"):
        assert word in low, word
    # a prompt with no transcription source does not carry the rule
    plain = fx.fact("TST-F-0010", "Test Person taught at Example College.", "career",
                    [("TST-S-0003", "taught at Example College")])
    item2 = adversary.make_item(plain, "fact", sources, None)
    assert "transcribed document text" not in adversary.build_prompt([item2], w["inductee"]).lower()


# --- public university archives ----------------------------------------------------------------

def test_a_public_university_archive_is_institutional_on_its_exact_host_only():
    r = reg([entry(id="u-archive", name="Example State University Library Digital Collections",
                   kind="public-university-archive", domains=[], hosts=["digital.library.example.edu"])])
    ok = src("https://digital.library.example.edu/item/1", institution="Example State University Library Digital Collections")
    assert authority.strong(ok, r)
    assert not authority.standing(ok, r).allows("primary")
    assert r.resolve("https://www.example.edu/news/1") is None
    assert r.resolve("https://blog.library.example.edu/1") is None


@pytest.mark.parametrize("over", [
    {"may_be": ["primary", "institutional"]},
    {"may_be": ["primary"]},
    {"domains": ["example.edu"], "hosts": []},
])
def test_loader_refuses_a_public_university_archive_beyond_institutional_on_exact_hosts(over):
    e = entry(id="u-archive", kind="public-university-archive", domains=[], hosts=["digital.library.example.edu"])
    e.update(over)
    with pytest.raises(authority.RegistryError, match="public-university-archive"):
        reg([e])


# --- the shipped registry: the owner's approvals, and nothing more -------------------------------

@pytest.fixture(scope="module")
def shipped():
    return authority.load(ROOT / "data" / "registry" / "institutions.json")


def test_shipped_nature_counts_only_for_the_1921_report(shipped):
    e = shipped.resolve(NATURE)
    assert e is not None and e.may_be == ("institutional",)
    s = src(NATURE, institution=e.name)
    assert authority.strong(s, shipped)
    for other in ("https://www.nature.com/articles/107540a0", "https://www.nature.com/",
                  "https://www.nature.com/articles/s41586-021-03819-2", "https://www.nature.com/nature/volumes/107"):
        assert shipped.resolve(other) is None, other
        assert not authority.strong(src(other, institution="Nature"), shipped)


@pytest.mark.parametrize("url, counts", [
    ("https://www.nature.com/articles/107539a0", True),
    ("https://nature.com/articles/107539a0", True),
    ("https://www.nature.com/articles/107539a0/", True),
    ("https://www.nature.com/articles/107539a0#references", True),
    ("https://www.nature.com/articles/107539a0?error=cookies_not_supported", False),
    ("https://www.nature.com/articles/107539a0?code=x", False),
    ("https://www.nature.com/articles/107539b0", False),
    ("https://www.nature.com/articles/107538a0", False),
    ("https://www.nature.com/articles/107539a0/figures/1", False),
])
def test_shipped_nature_variants_pinned(shipped, url, counts):
    """www/no-www, trailing slash and fragment are the same record (controller ruling); a query
    string or any other article path is not."""
    s = src(url, institution="Nature, volume 107, page 539 (1921)")
    assert authority.strong(s, shipped) is counts


@pytest.mark.parametrize("url", [
    "https://einsteinpapers.press.princeton.edu/vol12-trans/26",
    "https://einsteinpapers.press.princeton.edu/vol12/26",
    "https://einsteinpapers.press.princeton.edu/einstein-database/",
    "https://einsteinpapers.press.princeton.edu/",
    "https://einsteinpapers.press.princeton.edu/vol12-doc/26?printMode=true",
    "https://einsteinpapers.press.princeton.edu/vol12-doc/26/image.jpg",
    "https://einsteinpapers.press.princeton.edu/api/search",
])
def test_shipped_einstein_papers_refuse_non_document_paths_even_with_the_flag(shipped, url):
    e = shipped.resolve(url)
    flagged = src(url, institution=e.name, content_part="transcription")
    assert not authority.strong(flagged, shipped)
    assert authority.source_problems(flagged, shipped)


@pytest.mark.parametrize("url", [
    "https://einsteinpapers.press.princeton.edu/vol12-doc/26",
    "https://einsteinpapers.press.princeton.edu/vol8a-doc/301",
    "https://einsteinpapers.press.princeton.edu/vol1-doc/100",
])
def test_shipped_einstein_papers_count_on_document_pages(shipped, url):
    e = shipped.resolve(url)
    assert authority.strong(src(url, institution=e.name, content_part="transcription"), shipped)


def test_shipped_einstein_papers_need_content_part_transcription(shipped):
    url = "https://einsteinpapers.press.princeton.edu/vol12-doc/123"
    e = shipped.resolve(url)
    assert e is not None and e.content_part == "transcription"
    assert "primary" not in e.may_be
    assert not authority.strong(src(url, institution=e.name), shipped)
    assert authority.strong(src(url, institution=e.name, content_part="transcription"), shipped)
    assert shipped.resolve("https://press.princeton.edu/books/x") is None
    assert shipped.resolve("https://www.princeton.edu/") is None


def test_shipped_nps_primary_only_on_nomination_forms(shipped):
    nom = "https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text"
    st = authority.standing(src(nom, institution="National Park Service"), shipped)
    assert st.allows("primary")
    for page in ("https://npgallery.nps.gov/AssetDetail/C27BB4C5-155D-4519-3EEA3C99AE8DC703",
                 "https://www.nps.gov/people/john-muir.htm"):
        st = authority.standing(src(page, institution="National Park Service"), shipped)
        assert not st.allows("primary") and st.allows("institutional"), page


def test_shipped_public_university_archives(shipped):
    for url in ("https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690",
                "https://newspapers.lib.utah.edu/details?id=3701213"):
        e = shipped.resolve(url)
        assert e is not None and e.kind == "public-university-archive", url
        assert e.may_be == ("institutional",)
    for url in ("https://www.ucla.edu/", "https://newsroom.ucla.edu/x", "https://www.utah.edu/"):
        assert shipped.resolve(url) is None, url


@pytest.mark.parametrize("host", ["fi.edu", "www.fi.edu", "history.aip.org", "einsteinturm.com"])
def test_shipped_registry_does_not_list_unapproved_publishers(shipped, host):
    assert shipped.resolve(f"https://{host}/x") is None


def test_shipped_docsteach_counts_as_nara_since_the_owner_approved_it(shipped):
    # Owner approval 2026-10-16 (DocsTeach was unapproved before): institutional only, and one
    # holder with NARA for G5 (part_of), never an independent second holder.
    e = shipped.resolve("https://docsteach.org/x")
    assert e is not None and e.id == "docsteach" and e.part_of == "nara"
    assert e.may_be == ("institutional",) and e.owner_approved_on == "2026-10-16"
    assert shipped.holder_root(e).id == "nara"
