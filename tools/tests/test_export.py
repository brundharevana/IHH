"""Tests for tools/export.py (SPEC sections 2, 3.4, 6, 7, 8)."""

import copy
import csv
import io
import json
import re
from html.parser import HTMLParser

import export as ex
import factories as fx
import pytest
from ihh import gates, normalize

STAMP = "DRAFT — NOT REVIEWED"
FILES = ("wordpress.html", "facts.csv", "sources.csv", "media.csv", "searches.csv", "provenance.jsonld",
         "REVIEW.md")
DISPUTE = "The source gives the birth name but does not say it was a legal name."


def world():
    """Standard fake package plus one disputed and one single-source fact (neither used in drafts)."""
    w = fx.world()
    f1 = fx.by_id(w["facts"], "TST-F-0001")
    f1["adversary"] = fx.adversary(verdict="refuted", entailed=False, rationale=DISPUTE)
    f1["status"], f1["verified_claim_sha256"] = "disputed", None
    w["facts"].append(fx.fact("TST-F-0005", "Test Person taught at Example College for 13 years.", "career",
                              [("TST-S-0003", "taught at Example College for 13 years")],
                              status="single-source", verified_claim_sha256=None))
    return fx.restamp(w)  # both verdicts judged the records as they are


def approve(rec):
    rec["review"] = {"state": "approved", "reviewer": "Test Reviewer", "date": "2026-10-09", "note": ""}


def write(tmp_path, w=None):
    """Write the package; approvals made with approve() are recorded as apply_review.py would (G8)."""
    w = w or world()
    return fx.write_world(tmp_path, fx.back_reviews(w))


def run(tmp_path, *args, slug="testperson"):
    target = [slug] if slug else []
    return ex.main([*target, *args, "--data-dir", str(tmp_path)])


def read(root, name):
    return (root / "export" / name).read_text(encoding="utf-8")


def read_csv(root, name):
    return list(csv.DictReader(io.StringIO((root / "export" / name).read_text(encoding="utf-8-sig"))))


# --- block structure helpers ----------------------------------------------------------------

_OPEN = re.compile(r"<!-- wp:([a-z][a-z0-9/-]*)(?: (\{.*?\}))? (/)?-->")
_ANY = re.compile(r"<!-- (/?)wp:([a-z][a-z0-9/-]*)(?: \{.*?\})? ?(/)?-->")


def blocks(html):
    """[(name, inner_html)] for every block, checking that delimiters nest properly."""
    stack, out = [], []
    for m in _ANY.finditer(html):
        closing, name, selfclosing = m.group(1), m.group(2), m.group(3)
        if selfclosing:
            out.append((name, ""))
        elif not closing:
            stack.append((name, m.end()))
        else:
            assert stack, f"closing {name} without opening"
            open_name, start = stack.pop()
            assert open_name == name, f"{open_name} closed by {name}"
            out.append((name, html[start:m.start()]))
    assert not stack, f"unclosed blocks {stack}"
    return out


class TagBalance(HTMLParser):
    VOID = {"img", "br", "hr", "meta", "link", "input"}

    def __init__(self):
        super().__init__()
        self.stack = []

    def handle_starttag(self, tag, attrs):
        if tag not in self.VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        assert self.stack and self.stack[-1] == tag, f"unbalanced </{tag}> in {self.stack}"
        self.stack.pop()


def assert_balanced(html):
    parser = TagBalance()
    parser.feed(html)
    parser.close()
    assert parser.stack == []


def text_outside_blocks(html):
    """Anything between top-level blocks that is not whitespace becomes a Classic block in WordPress."""
    depth, last, leftovers = 0, 0, []
    for m in _ANY.finditer(html):
        if depth == 0:
            leftovers.append(html[last:m.start()])
        if m.group(3):
            pass
        elif m.group(1):
            depth -= 1
        else:
            depth += 1
        last = m.end()
    leftovers.append(html[last:])
    return "".join(leftovers).strip()


# --- preview ------------------------------------------------------------------------------------

def test_preview_writes_every_file(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    for name in FILES:
        assert (root / "export" / name).is_file(), name


def test_preview_wordpress_markup_is_paste_ready(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    html = read(root, "wordpress.html")
    found = blocks(html)
    names = {name for name, _ in found}
    assert {"heading", "paragraph", "list", "list-item", "image"} <= names
    assert text_outside_blocks(html) == ""
    assert_balanced(html)
    assert '<h2 class="wp-block-heading">' in html
    assert '<figcaption class="wp-element-caption">' in html


def test_preview_stamps_every_block(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    for name, inner in blocks(read(root, "wordpress.html")):
        if name == "list":
            continue  # its list items carry the stamp
        assert STAMP in inner, f"{name} block without the draft stamp: {inner[:80]}"


def test_sentences_cite_primary_or_institutional_sources(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    html = read(root, "wordpress.html")
    assert re.search(r'Test Person arrived at the Port of Example on June 10, 1941\.'
                     r'<sup><a href="https://archives\.example\.org/id/1">\[1\]</a></sup>', html)
    assert re.search(r'Test Person taught at Example College\.'
                     r'<sup><a href="https://library\.example\.net/test-person">\[2\]</a></sup>', html)
    assert "news.example.org" not in html  # secondary sources are not cited on the page


def test_sources_list_and_how_to_cite(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    html = read(root, "wordpress.html")
    sources = html.index(">" + STAMP + "</strong> Sources</h2>")
    cite = html.index("How to cite this page</h2>")
    assert sources < cite
    listing = html[sources:cite]
    assert listing.index("Example National Archives") < listing.index("Example University Library")
    assert '<a href="https://archives.example.org/id/1">Petition for Naturalization for Testa Q. Persona</a>' in listing
    assert "Accessed 2026-10-08" in listing
    # Generated from inductee.json, never the draft's free text (it states no fact).
    assert "Test Person. Immigrant Hall of Honor. https://ihh.example.org/inductees/test-person/" in html[cite:]
    assert "Test Person profile, example package." not in html


def test_image_block_has_credit_line(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    images = [inner for name, inner in blocks(read(root, "wordpress.html")) if name == "image"]
    assert len(images) == 1
    img = images[0]
    assert '<img src="https://archives.example.org/media/1.jpg" alt="Typed arrival record."/>' in img
    assert "Testa Q. Persona arrived at the Port of Example." in img  # the caption
    assert "Credit: Example National Archives." in img
    assert '<a href="https://archives.example.org/id/1">Public domain</a>' in img


def test_non_embeddable_media_is_a_link(tmp_path):
    w = world()
    m = w["media"][0]
    m["license_class"] = "rights-restricted"
    m["verified_claim_sha256"] = gates.media_lock_sha256(m)
    fx.restamp(w)  # the adversary judged the item with this licence
    root = write(tmp_path, w)
    assert run(tmp_path, "--preview") == 0
    html = read(root, "wordpress.html")
    assert "<img" not in html
    assert '<a href="https://archives.example.org/media/1.jpg">View this item</a>' in html


def test_unreviewed_items_and_non_verified_facts(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    html = read(root, "wordpress.html")
    assert "Test Person was born Testa Q. Persona." not in html  # disputed
    ids = [r["id"] for r in read_csv(root, "facts.csv")]
    assert ids == ["TST-F-0001", "TST-F-0002", "TST-F-0003", "TST-F-0004", "TST-F-0005"]


def test_review_md_lists_disputed_and_single_source_with_reasons(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    review = read(root, "REVIEW.md")
    assert "TST-F-0001" in review and "disputed" in review
    assert DISPUTE in review
    assert "TST-F-0005" in review and "single-source" in review
    assert "taught at Example College for 13 years" in review  # the evidence quote
    assert "https://news.example.org/test-person" in review
    assert "- [ ] approve" in review
    assert "Example sentences are the best teachers." in review  # avatar lines are reviewed too
    disputed = review.index("TST-F-0001")
    verified = review.index("TST-F-0003")
    assert disputed < verified  # items needing a decision come first


def test_review_md_media_choices_match_apply_review(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    review = read(root, "REVIEW.md")
    media = review[review.index("### TST-M-0001"):]
    media = media[:media.index("\n## ")]
    assert "- [ ] approve" in media and "- [ ] reject" in media
    assert "- [ ] edit" not in media  # apply_review refuses media edits


# --- final export ----------------------------------------------------------------------------------

def test_final_export_without_approvals_publishes_nothing(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path) == 0
    html = read(root, "wordpress.html")
    assert STAMP not in html
    assert "Test Person" not in html
    assert "How to cite" not in html
    assert [name for name, _ in blocks(html)] == ["paragraph"]
    assert read_csv(root, "facts.csv") == []
    assert "profile:summary:0" in read(root, "REVIEW.md")


def test_final_export_includes_only_approved_verified_items(tmp_path):
    w = world()
    approve(fx.by_id(w["facts"], "TST-F-0003"))
    approve(fx.by_id(w["facts"], "TST-F-0005"))  # approved but single-source: never exported
    root = write(tmp_path, w)
    assert run(tmp_path) == 0
    html = read(root, "wordpress.html")
    assert STAMP not in html
    assert "Test Person taught at Example College." in html
    assert ">Example College</h2>" in html
    assert "June 10, 1941" not in html  # TST-F-0002 is verified but not approved
    assert "<img" not in html
    assert [r["id"] for r in read_csv(root, "facts.csv")] == ["TST-F-0003"]
    assert {r["id"] for r in read_csv(root, "sources.csv")} == {"TST-S-0002", "TST-S-0003"}
    assert read_csv(root, "media.csv") == []
    graph = json.loads(read(root, "provenance.jsonld"))["@graph"]
    assert [n["@id"] for n in graph if n["@type"] == "Claim"] == ["ihh:TST-F-0003"]
    assert "image" not in [name for name, _ in blocks(html)]


def test_final_export_with_everything_approved(tmp_path):
    w = world()
    for fid in ("TST-F-0002", "TST-F-0003", "TST-F-0004"):
        approve(fx.by_id(w["facts"], fid))
    approve(w["media"][0])
    root = write(tmp_path, w)
    assert run(tmp_path) == 0
    html = read(root, "wordpress.html")
    assert "June 10, 1941" in html
    assert "<img" in html
    assert STAMP not in html
    assert_balanced(html)


def test_final_export_withholds_section_whose_heading_needs_unapproved_facts(tmp_path):
    w = world()
    # Both holders' pages state the whole claim, so G5 counts them as two holders.
    w["snapshots"]["TST-S-0002"] += "Test Person taught at Example College for 13 years.\n"
    w["sources"][1]["snapshot_sha256"] = fx.sha(w["snapshots"]["TST-S-0002"])
    w["facts"].append(fx.fact("TST-F-0006", "Test Person taught at Example College for 13 years.", "career",
                              [("TST-S-0003", "taught at Example College for 13 years"),
                               ("TST-S-0002", "taught at Example College for 13 years")]))
    w["profile"]["sections"][0]["title"] = "Thirteen years at Example College"
    w["profile"]["sections"][0]["sentences"].append(
        {"text": "Test Person taught there for 13 years.", "fact_ids": ["TST-F-0006"]})
    fx.by_id(w["facts"], "TST-F-0006")["used_in"] = ["profile:sections:work:1"]
    approve(fx.by_id(w["facts"], "TST-F-0003"))  # TST-F-0006 stays unapproved
    fx.restamp(w)
    root = write(tmp_path, w)
    assert run(tmp_path) == 0
    html = read(root, "wordpress.html")
    assert "Thirteen years" not in html
    assert "Test Person taught at Example College." not in html
    review = read(root, "REVIEW.md")
    assert "profile:sections:work:title" in review and "heading not grounded" in review


def test_export_refuses_when_validate_fails(tmp_path, capsys):
    w = world()
    w["sources"][0]["url"] = "http://archives.example.org/id/1"
    root = write(tmp_path, w)
    assert run(tmp_path, "--preview") == 1
    assert "refused" in capsys.readouterr().out.lower()
    assert not (root / "export").exists()


# --- escaping ---------------------------------------------------------------------------------------

def test_text_and_attributes_are_escaped():
    assert ex.esc('<script>alert("x")</script> & \'') == \
        "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#x27;"
    assert ex.attr('https://example.org/?a=1&b="x"') == "https://example.org/?a=1&amp;b=&quot;x&quot;"
    assert ex.safe_url("javascript:alert(1)") is None
    assert ex.safe_url(" JAVASCRIPT:alert(1)") is None
    assert ex.safe_url("data:text/html,x") is None
    assert ex.safe_url("https://example.org/x") == "https://example.org/x"


def test_block_delimiters_in_text_cannot_open_blocks():
    html = ex.paragraph("<!-- wp:html --><script>x</script><!-- /wp:html -->", stamp=None)
    assert "<!-- wp:html" not in html
    assert [name for name, _ in blocks(html)] == ["paragraph"]


def test_hostile_record_text_is_escaped_end_to_end(tmp_path):
    w = world()
    m = w["media"][0]
    m["credit"] = 'Example <script>alert("credit")</script> & Archives'
    m["rights_url"] = 'https://archives.example.org/rights?a=1&b="x"'
    m["alt_text"] = 'Arrival record "typed" <b>bold</b> (TST-F-0002).'
    # The holder's page carries the same hostile text, so G2 (alt text adds no word
    # its sources lack) passes and the test reaches the escaping it is about.
    w["snapshots"]["TST-S-0001"] += 'Arrival record "typed" <b>bold</b>\n'
    w["sources"][0]["snapshot_sha256"] = fx.sha(w["snapshots"]["TST-S-0001"])
    m["verified_claim_sha256"] = gates.media_lock_sha256(m)
    w["sources"][0]["title"] = 'Petition <img src=x onerror=alert(1)> "quoted"'
    w["profile"]["how_to_cite"] = "Cite <b>this</b> & <!-- wp:html --> that"
    w["profile"]["sections"][0]["title"] = "Example College & <i>taught</i>"
    # G6 counts "<" and ">" as symbols, so the cited claim (and its quote, for G2) carries the
    # same hostile text and the test reaches the escaping it is about.
    w["snapshots"]["TST-S-0003"] += "Test Person taught at Example College & <i>taught</i>\n"
    w["sources"][2]["snapshot_sha256"] = fx.sha(w["snapshots"]["TST-S-0003"])
    # And so does the other holder's page, in its own words, so each source covers the whole
    # claim and the two are not one copied text (G5).
    w["snapshots"]["TST-S-0002"] += "Test Person, born Testa Q. Persona, later taught at Example College & <i>taught</i> for years\n"
    w["sources"][1]["snapshot_sha256"] = fx.sha(w["snapshots"]["TST-S-0002"])
    f3 = fx.by_id(w["facts"], "TST-F-0003")
    f3["claim"] = "Test Person taught at Example College & <i>taught</i>."
    f3["evidence"][0]["quote"] = "Test Person, born Testa Q. Persona, later taught at Example College & <i>taught</i> for years"
    f3["evidence"][1]["quote"] = "Test Person taught at Example College & <i>taught</i>"
    f3["verified_claim_sha256"] = normalize.claim_sha256(f3["claim"])
    fx.restamp(w)  # the records were judged with this text
    fx.ground(w)
    root = write(tmp_path, w)
    assert run(tmp_path, "--preview") == 0
    html = read(root, "wordpress.html")
    assert "<script" not in html
    assert "<img src=x" not in html
    assert "<b>" not in html and "<i>" not in html
    assert "<!-- wp:html" not in html
    assert 'Example &lt;script&gt;alert(&quot;credit&quot;)&lt;/script&gt; &amp; Archives' in html
    assert 'href="https://archives.example.org/rights?a=1&amp;b=&quot;x&quot;"' in html
    assert 'alt="Arrival record &quot;typed&quot; &lt;b&gt;bold&lt;/b&gt;."' in html
    assert "Petition &lt;img src=x onerror=alert(1)&gt; &quot;quoted&quot;" in html
    assert "Example College &amp; &lt;i&gt;taught&lt;/i&gt;" in html
    blocks(html)
    assert_balanced(html)
    assert text_outside_blocks(html) == ""


def test_review_md_escapes_markdown_and_html(tmp_path):
    w = world()
    f5 = fx.by_id(w["facts"], "TST-F-0005")
    f5["notes"] = "line one\n# not a heading <script>x</script> | pipe"
    root = write(tmp_path, w)
    assert run(tmp_path, "--preview") == 0
    review = read(root, "REVIEW.md")
    assert "<script>" not in review
    assert "\n# not a heading" not in review


# --- CSV and JSON-LD ------------------------------------------------------------------------------------

def test_csv_columns_and_formula_guard(tmp_path):
    w = world()
    w["sources"][2]["notes"] = "=HYPERLINK(\"https://example.org\")"
    root = write(tmp_path, w)
    assert run(tmp_path, "--preview") == 0
    raw = (root / "export" / "facts.csv").read_bytes()
    assert raw.startswith(b"\xef\xbb\xbf")  # BOM so spreadsheet programs read UTF-8
    facts = {r["id"]: r for r in read_csv(root, "facts.csv")}
    f3 = facts["TST-F-0003"]
    assert f3["claim"] == "Test Person taught at Example College."
    assert f3["status"] == "verified"
    assert f3["review_state"] == "pending"
    assert f3["source_ids"] == "TST-S-0002; TST-S-0003"
    assert "https://library.example.net/test-person" in f3["source_urls"]
    assert "taught at Example College" in f3["evidence"]
    assert facts["TST-F-0001"]["adversary_rationale"] == DISPUTE
    sources = {r["id"]: r for r in read_csv(root, "sources.csv")}
    assert sources["TST-S-0003"]["notes"].startswith("'=")
    media = read_csv(root, "media.csv")
    assert media[0]["license_class"] == "public-domain" and media[0]["embeddable"] == "yes"
    searches = read_csv(root, "searches.csv")
    assert searches[0]["produced"] == "TST-S-0001; TST-F-0002"
    for name in ("facts.csv", "sources.csv", "media.csv", "searches.csv"):
        assert read_csv(root, name)[0]["inductee"] == "testperson"


def test_approved_rows_carry_their_decision_in_csv_and_jsonld(tmp_path):
    w = world()
    approve(fx.by_id(w["facts"], "TST-F-0003"))
    approve(w["media"][0])
    root = write(tmp_path, w)
    assert run(tmp_path, "--preview") == 0
    facts = {r["id"]: r for r in read_csv(root, "facts.csv")}
    ok, pending = facts["TST-F-0003"], facts["TST-F-0002"]
    assert ok["review_state"] == "approved" and ok["review_decision_date"] == "2026-10-09"
    assert re.fullmatch(r"testperson:decisions:\d+", ok["review_decision_id"])
    assert pending["review_state"] == "pending"
    assert pending["review_decision_id"] == "" and pending["review_decision_date"] == ""
    media = read_csv(root, "media.csv")[0]
    assert media["review_state"] == "approved" and media["review_decision_id"].startswith("testperson:decisions:")
    nodes = {n["@id"]: n for n in json.loads(read(root, "provenance.jsonld"))["@graph"]}
    assert nodes["ihh:TST-F-0003"]["ihh:reviewState"] == "approved"
    assert nodes["ihh:TST-F-0003"]["ihh:review"]["ihh:decision"] == ok["review_decision_id"]
    assert nodes["ihh:TST-F-0003"]["ihh:review"]["ihh:decisionDate"] == "2026-10-09"
    assert nodes["ihh:TST-F-0002"]["ihh:reviewState"] == "pending"
    assert "ihh:decision" not in nodes["ihh:TST-F-0002"]["ihh:review"]


def test_provenance_jsonld(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    doc = json.loads(read(root, "provenance.jsonld"))
    assert doc["@context"]["@vocab"] == "https://schema.org/"
    assert doc["@context"]["prov"] == "http://www.w3.org/ns/prov#"
    nodes = {n["@id"]: n for n in doc["@graph"]}
    person = nodes["ihh:person-testperson"]
    assert person["@type"] == "Person" and person["name"] == "Test Person"
    claim = nodes["ihh:TST-F-0003"]
    assert claim["@type"] == "Claim"
    assert claim["text"] == "Test Person taught at Example College."
    assert claim["about"] == {"@id": "ihh:person-testperson"}
    assert {"@id": "ihh:TST-S-0002"} in claim["citation"]
    assert {"@id": "ihh:TST-S-0002"} in claim["prov:wasDerivedFrom"]
    assert claim["ihh:status"] == "verified"
    assert claim["ihh:evidence"][0]["ihh:quote"] == "taught at Example College"
    source = nodes["ihh:TST-S-0001"]
    assert source["@type"] == "CreativeWork"
    assert source["publisher"] == {"@type": "Organization", "name": "Example National Archives"}
    media = nodes["ihh:TST-M-0001"]
    assert media["@type"] == "MediaObject"
    assert media["ihh:licenseClass"] == "public-domain"
    search = nodes["ihh:TST-Q-0001"]
    assert search["@type"] == "prov:Activity"
    assert {"@id": "ihh:TST-F-0002"} in search["prov:generated"]
    run_node = nodes["ihh:run-testperson-run-test-1"]
    assert run_node["@type"] == "prov:Activity"


# --- --all ---------------------------------------------------------------------------------------------

def clone_world(code="TSU", slug="testpersontwo"):
    text = json.dumps(world()).replace("TST-", f"{code}-").replace('"testperson"', f'"{slug}"')
    w = json.loads(text)
    w["inductee"]["code"] = code
    for m in w["media"]:
        m["verified_claim_sha256"] = gates.media_lock_sha256(m)
    return fx.restamp(w)  # the ids changed, so the judged fingerprints change with them


def test_all_writes_per_inductee_and_aggregate_exports(tmp_path):
    root1 = write(tmp_path)
    root2 = fx.write_world(tmp_path, clone_world())
    assert run(tmp_path, "--all", "--preview", slug=None) == 0
    for root in (root1, root2):
        assert (root / "export" / "wordpress.html").is_file()
    agg = tmp_path / "export"
    for name in ("facts.csv", "sources.csv", "media.csv", "searches.csv", "provenance.jsonld"):
        assert (agg / name).is_file(), name
    rows = list(csv.DictReader(io.StringIO((agg / "facts.csv").read_text(encoding="utf-8-sig"))))
    assert {r["inductee"] for r in rows} == {"testperson", "testpersontwo"}
    assert len(rows) == 10
    graph = json.loads((agg / "provenance.jsonld").read_text(encoding="utf-8"))["@graph"]
    ids = [n["@id"] for n in graph]
    assert len(ids) == len(set(ids))
    assert "ihh:TST-F-0001" in ids and "ihh:TSU-F-0001" in ids


def test_all_refuses_when_any_inductee_fails(tmp_path):
    write(tmp_path)
    bad = clone_world()
    bad["sources"][0]["url"] = "http://archives.example.org/id/1"
    fx.write_world(tmp_path, bad)
    assert run(tmp_path, "--all", "--preview", slug=None) == 1
    assert not (tmp_path / "export").exists()
    assert not (tmp_path / "inductees" / "testperson" / "export").exists()


def test_usage(tmp_path):
    write(tmp_path)
    assert ex.main(["--data-dir", str(tmp_path)]) == 2
    assert ex.main(["testperson", "--all", "--data-dir", str(tmp_path)]) == 2
    assert ex.main(["nobody", "--data-dir", str(tmp_path)]) == 2


@pytest.mark.parametrize("value,expected", [("1941", "1941"), ("1941-06", "June 1941"),
                                            ("1941-06-10", "June 10, 1941")])
def test_date_labels(value, expected):
    assert ex.date_label(value) == expected


def test_final_export_refuses_approvals_that_are_not_on_record(tmp_path, capsys):
    # An agent setting review.state by hand is not a human approval (G8).
    w = world()
    for rec in w["facts"] + w["media"]:
        rec["review"] = {"state": "approved", "reviewer": "Claude agent", "date": fx.TODAY, "note": ""}
    root = fx.write_world(tmp_path, w)  # no review/decisions.jsonl
    assert run(tmp_path) == 1
    assert "G8" in capsys.readouterr().out
    assert not (root / "export" / "wordpress.html").exists()


def test_qualifies_needs_the_decision_on_record():
    w = world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    approve(f)
    pkg = ex.Package(p=None, inductee=w["inductee"], facts=w["facts"], sources=w["sources"], media=w["media"],
                     searches=[], profile=None, ctx=fx.context(w), preview=False, decisions=[])
    assert not pkg.qualifies(f)
    pkg.decisions = fx.back_reviews(w)["decisions"]
    assert pkg.qualifies(f)


# --- the adversary half of G6 and free-text fields (round 1 review) -------------------------------

def approve_all(w):
    for rec in w["facts"] + w["media"]:
        if rec.get("status") == "verified":
            approve(rec)
    return w


def test_final_export_withholds_a_sentence_no_adversary_judged(tmp_path):
    # Words the cited claims lack now fail G6 deterministically, so validate fails and
    # the export refuses outright (content-word rule, round 3).
    w = approve_all(world())
    w["profile"]["sections"][0]["sentences"][0]["text"] = "Test Person was a famous genius and a beloved teacher."
    write(tmp_path / "added", w)
    assert run(tmp_path / "added") == 1
    # Text that passes the deterministic check but that no sentence adversary judged
    # is withheld from the final export.
    w = approve_all(world())
    w["profile"]["sections"][0]["sentences"][0]["text"] = "At Example College, Test Person taught."
    w["profile"]["summary"].append({"text": "On June 10, 1941, Testa Q. Persona arrived at the Port of Example.",
                                    "fact_ids": ["TST-F-0002"]})
    fx.by_id(w["facts"], "TST-F-0002")["used_in"].append("profile:summary:1")
    root = write(tmp_path, w)  # the grounding verdicts on file judged the old wording only
    assert run(tmp_path) == 0
    html = read(root, "wordpress.html")
    assert "At Example College, Test Person taught." not in html
    assert "On June 10, 1941, Testa Q. Persona arrived at the Port of Example." not in html
    review = read(root, "REVIEW.md")
    assert "sentence adversary" in review


def test_final_export_withholds_a_sentence_the_adversary_refuted(tmp_path):
    w = approve_all(world())
    for row in w["grounding"]:
        if row["location"] == "profile:sections:work:0":
            row.update(verdict="refuted", adds_information=True, rationale="Adds praise.")
    root = write(tmp_path, w)
    assert run(tmp_path) == 0
    assert "Test Person taught at Example College." not in read(root, "wordpress.html")


def test_final_export_publishes_judged_sentences(tmp_path):
    root = write(tmp_path, approve_all(world()))
    assert run(tmp_path) == 0
    html = read(root, "wordpress.html")
    assert "Test Person taught at Example College." in html and "June 10, 1941" in html


def test_how_to_cite_is_generated_never_free_text(tmp_path):
    w = approve_all(world())
    w["profile"]["how_to_cite"] = "Test Person won the Example Prize in 1950 and was deported in 1960."
    root = write(tmp_path, w)
    assert run(tmp_path) == 0
    html = read(root, "wordpress.html")
    assert "Example Prize" not in html and "deported" not in html
    assert "Test Person. Immigrant Hall of Honor. https://ihh.example.org/inductees/test-person/" in html


def test_review_md_shows_alt_text_and_how_to_cite(tmp_path):
    root = write(tmp_path)
    assert run(tmp_path, "--preview") == 0
    review = read(root, "REVIEW.md")
    assert "Alt text" in review and "Typed arrival record" in review
    assert "How to cite" in review


# --- experience content (content/<slug>/chapters) -----------------------------------------------

chapter = fx.content_chapter
ARRIVAL = fx.ARRIVAL


write_content = fx.write_content


def judge(w, chapters, verdict="supported"):
    """Record a sentence-adversary verdict for every content unit as it is now (G6), as ground() does
    for the profile."""
    import check_grounding
    facts = gates.by_id(w["facts"])
    for unit in check_grounding.iter_content_units(chapters):
        cited = check_grounding.cited_facts(unit, facts)
        w.setdefault("grounding", []).append(
            {"location": unit.location, "unit_sha256": check_grounding.unit_sha256(unit, cited),
             "model": "test:sentence-adversary", "run_id": fx.RUN, "date": fx.TODAY, "verdict": verdict,
             "adds_information": verdict != "supported", "rationale": "none"})
    return w


def run_with_content(tmp_path, content, *args):
    return ex.main(["testperson", *args, "--data-dir", str(tmp_path), "--content-dir", str(content)])


def test_content_chapters_become_headings_paragraphs_and_exhibits(tmp_path):
    root = write(tmp_path)
    content = write_content(tmp_path, [chapter(), chapter(id="testperson-2", title="Example College",
                                                           title_fact_ids=["TST-F-0003"], exhibits=[],
                                                           narration=[{"cue": "c1", "text": "Test Person taught at Example College.",
                                                                       "fact_ids": ["TST-F-0003"], "reveals": []}])])
    assert run_with_content(tmp_path, content, "--preview") == 0
    html = read(root, "wordpress.html")
    found = blocks(html)
    assert text_outside_blocks(html) == ""
    assert_balanced(html)
    headings = [inner for name, inner in found if name == "heading"]
    assert sum("Port of Example</h2>" in h for h in headings) == 1  # one heading per chapter, from its title
    assert sum("Example College</h2>" in h for h in headings) == 2  # profile section and chapter 2
    paragraphs = [inner for name, inner in found if name == "paragraph"]
    line = next(p for p in paragraphs if "Test Person taught at Example College." in p and "href" in p)
    assert '<a href="https://library.example.net/test-person">[' in line  # its citation link
    # The exhibit is an image block: title, note, credit, the archive's rights wording, original link.
    images = [inner for name, inner in found if name == "image"]
    exhibit = next(i for i in images if "<strong>Port of Example</strong>" in i)
    assert '<img src="https://archives.example.org/media/1.jpg"' in exhibit
    assert "Credit: Example National Archives." in exhibit
    assert "Rights: No known copyright restrictions." in exhibit
    assert '<a href="https://archives.example.org/media/1.jpg">See the original</a>' in exhibit
    assert "https://archives.example.org/id/1" in html[html.rindex("Sources"):]  # numbered source list
    for name, inner in found:
        if name != "list":
            assert STAMP in inner


def test_content_chapter_order_follows_chapter_number(tmp_path):
    root = write(tmp_path)
    ten = chapter(id="testperson-10", title="Test Person", title_fact_ids=["TST-F-0003"], exhibits=[])
    folder = write_content(tmp_path, [chapter()])
    (folder / "testperson" / "chapters" / "10.json").write_text(json.dumps(ten), encoding="utf-8")
    (folder / "testperson" / "chapters" / "2.json").write_text(
        json.dumps(chapter(id="testperson-2", title="Testa Q. Persona", exhibits=[])), encoding="utf-8")
    assert run_with_content(tmp_path, folder, "--preview") == 0
    html = read(root, "wordpress.html")
    assert html.index("Port of Example</h2>") < html.index("Testa Q. Persona</h2>") < html.index("Test Person</h2>")


def test_content_absent_leaves_the_package_unchanged(tmp_path):
    root = write(tmp_path)
    assert run_with_content(tmp_path, tmp_path / "nothing-here", "--preview") == 0
    with_none = read(root, "wordpress.html")
    assert run(tmp_path, "--preview") == 0
    assert read(root, "wordpress.html") == with_none


def test_final_export_content_needs_approved_facts_and_media(tmp_path):
    w = world()
    approve(fx.by_id(w["facts"], "TST-F-0003"))  # chapter title and line 1; the arrival fact is not approved
    ch = chapter(title="Example College", title_fact_ids=["TST-F-0003"])
    root = write(tmp_path, judge(w, [ch]))
    content = write_content(tmp_path, [ch])
    assert run_with_content(tmp_path, content) == 0
    html = read(root, "wordpress.html")
    assert STAMP not in html
    assert "Example College</h2>" in html
    assert "Test Person taught at Example College." in html
    assert "June 10, 1941" not in html
    assert "<img" not in html and "See the original" not in html
    review = read(root, "REVIEW.md")
    assert "content:testperson-1:narration:c2" in review and "content:testperson-1:exhibit:ex1" in review


def test_final_export_exhibit_needs_approved_media(tmp_path):
    w = world()
    approve(fx.by_id(w["facts"], "TST-F-0002"))
    approve(fx.by_id(w["facts"], "TST-F-0003"))
    root = write(tmp_path, judge(w, [chapter()]))  # media is verified but not approved
    content = write_content(tmp_path, [chapter()])
    assert run_with_content(tmp_path, content) == 0
    html = read(root, "wordpress.html")
    assert "<img" not in html and "See the original" not in html
    assert ARRIVAL in html  # the narration line itself is approved
    w = world()
    for rec in w["facts"] + w["media"]:
        if rec["status"] == "verified":
            approve(rec)
    root = write(tmp_path / "all", judge(w, [chapter()]))
    content = write_content(tmp_path / "all", [chapter()])
    assert run_with_content(tmp_path / "all", content) == 0
    assert "See the original" in read(root, "wordpress.html")


def test_content_withholds_ungrounded_and_unverified_lines(tmp_path):
    w = approve_all(world())
    approve(fx.by_id(w["facts"], "TST-F-0005"))  # single-source: never exported
    ch = chapter(narration=[
        {"cue": "c1", "text": "Test Person taught at Example College.", "fact_ids": ["TST-F-0003"], "reveals": []},
        {"cue": "c2", "text": "Test Person was a famous genius.", "fact_ids": ["TST-F-0003"], "reveals": []},
        {"cue": "c3", "text": "Test Person taught at Example College for 13 years.", "fact_ids": ["TST-F-0005"],
         "reveals": []},
        {"cue": "c4", "text": "Test Person taught at Example College.", "fact_ids": [], "reveals": []},
    ])
    root = write(tmp_path, judge(w, [ch]))
    content = write_content(tmp_path, [ch])
    assert run_with_content(tmp_path, content) == 0
    html = read(root, "wordpress.html")
    assert "famous genius" not in html and "13 years" not in html
    review = read(root, "REVIEW.md")
    for cue in ("c2", "c3", "c4"):
        assert f"content:testperson-1:narration:{cue}" in review


def test_content_chapter_with_ungrounded_title_is_withheld(tmp_path):
    w = approve_all(world())
    ch = chapter(title="A famous genius at Example College")
    root = write(tmp_path, judge(w, [ch]))
    content = write_content(tmp_path, [ch])
    assert run_with_content(tmp_path, content) == 0
    html = read(root, "wordpress.html")
    assert "genius" not in html
    assert "testperson-1:title" in read(root, "REVIEW.md")
    assert html.count("Test Person taught at Example College.") == 1  # the chapter's line was withheld too


def test_content_reconstruction_keeps_its_note(tmp_path):
    w = approve_all(world())
    ch = chapter(room="reconstructed-place", exhibits=[],
                 reconstruction={"basis_media_ids": ["TST-M-0001"], "basis_fact_ids": ["TST-F-0003"],
                                 "note": "Test Person taught at Example College.", "place": {}})
    root = write(tmp_path, judge(w, [ch]))
    content = write_content(tmp_path, [ch])
    assert run_with_content(tmp_path, content) == 0
    html = read(root, "wordpress.html")
    note = next(i for n, i in blocks(html) if n == "paragraph" and "Reconstruction based on" in i)
    assert "Arrival record of Testa Q. Persona" in note
    assert "Example National Archives" in note
    assert '<a href="https://archives.example.org/media/1.jpg">' in note
    assert "Test Person taught at Example College." in note


def test_content_exhibit_without_a_direct_image_is_a_link(tmp_path):
    w = world()
    m = w["media"][0]
    m["url"] = "https://archives.example.org/id/1"
    m["verified_claim_sha256"] = gates.media_lock_sha256(m)
    fx.restamp(w)
    approve_all(w)
    root = write(tmp_path, judge(w, [chapter()]))
    content = write_content(tmp_path, [chapter()])
    assert run_with_content(tmp_path, content) == 0
    html = read(root, "wordpress.html")
    assert "<img" not in html
    para = next(i for n, i in blocks(html) if n == "paragraph" and "See the original" in i)
    assert "Port of Example" in para and "Rights: No known copyright restrictions." in para
    assert '<a href="https://archives.example.org/id/1">See the original</a>' in para


def test_content_text_and_attributes_are_escaped(tmp_path):
    w = world()
    m = w["media"][0]
    m["credit"] = 'Archive <script>alert(1)</script> & "Friends"'
    m["rights_statement"] = 'No known <b>restrictions</b> "quoted" & more.'
    # The holder's page carries the same rights wording, so G1 finds it and the test reaches escaping.
    w["snapshots"]["TST-S-0001"] += m["rights_statement"] + "\n"
    w["sources"][0]["snapshot_sha256"] = fx.sha(w["snapshots"]["TST-S-0001"])
    m["verified_claim_sha256"] = gates.media_lock_sha256(m)
    fx.restamp(w)
    approve_all(w)
    root = write(tmp_path, judge(w, [chapter()]))
    content = write_content(tmp_path, [chapter()])
    assert run_with_content(tmp_path, content) == 0
    html = read(root, "wordpress.html")
    assert "<script" not in html and "<b>" not in html
    assert "Archive &lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;Friends&quot;" in html
    assert "No known &lt;b&gt;restrictions&lt;/b&gt; &quot;quoted&quot; &amp; more." in html
    assert_balanced(html)
    assert text_outside_blocks(html) == ""


def test_content_unsafe_original_url_is_not_linked(tmp_path):
    w = approve_all(world())
    root = write(tmp_path, w)
    ch = chapter()
    content = write_content(tmp_path, [ch])
    pkg_path = tmp_path / "inductees" / "testperson" / "media.jsonl"
    rows = [json.loads(line) for line in pkg_path.read_text(encoding="utf-8").splitlines()]
    rows[0]["url"] = "javascript:alert(1)"
    pkg_path.write_text("".join(json.dumps(r) + "\n" for r in rows), encoding="utf-8")
    # validate refuses a non-http url, so the export does not run at all
    assert run_with_content(tmp_path, content) == 1
    assert not (root / "export").exists()


# --- fix round 1: one gate path for content units -------------------------------------------------------

def test_final_export_content_needs_a_supported_verdict(tmp_path):
    ch = chapter(title="Testa Q. Persona")  # no profile unit shares this title's verdict
    w = approve_all(world())
    root = write(tmp_path / "none", w)  # facts and media approved, but no sentence adversary judged the content
    content = write_content(tmp_path / "none", [ch])
    assert run_with_content(tmp_path / "none", content) == 0
    html = read(root, "wordpress.html")
    assert "Testa Q. Persona</h2>" not in html and "See the original" not in html
    review = read(root, "REVIEW.md")
    assert "content:testperson-1:title" in review and "no sentence-adversary verdict yet" in review
    root = write(tmp_path / "ok", judge(approve_all(world()), [ch]))
    assert run_with_content(tmp_path / "ok", write_content(tmp_path / "ok", [ch])) == 0
    html = read(root, "wordpress.html")
    assert "Testa Q. Persona</h2>" in html and "See the original" in html
    root = write(tmp_path / "bad", judge(approve_all(world()), [ch], verdict="refuted"))
    assert run_with_content(tmp_path / "bad", write_content(tmp_path / "bad", [ch])) == 0
    assert "Testa Q. Persona</h2>" not in read(root, "wordpress.html")


def test_final_export_a_changed_content_line_loses_its_verdict(tmp_path):
    ch = chapter()
    w = judge(approve_all(world()), [ch])
    ch["narration"][0]["text"] = "At Example College, Test Person taught."  # changed after it was judged
    root = write(tmp_path, w)
    assert run_with_content(tmp_path, write_content(tmp_path, [ch])) == 0
    assert "At Example College, Test Person taught." not in read(root, "wordpress.html")
    assert "changed after the sentence adversary judged it" in read(root, "REVIEW.md")


def test_withheld_chapter_title_lists_its_lines_and_exhibits(tmp_path):
    ch = chapter(title="A famous genius at Example College")
    root = write(tmp_path, judge(approve_all(world()), [ch]))
    assert run_with_content(tmp_path, write_content(tmp_path, [ch])) == 0
    review = read(root, "REVIEW.md")
    for loc in ("narration:c1", "narration:c2", "exhibit:ex1"):
        line = next(x for x in review.splitlines() if f"content:testperson-1:{loc}" in x)
        assert "withheld: chapter title withheld" in line


def test_chapter_with_everything_withheld_has_no_heading(tmp_path):
    ch = chapter(narration=[{"cue": "c1", "text": "Test Person was a famous genius.", "fact_ids": ["TST-F-0003"],
                             "reveals": []}], exhibits=[])
    root = write(tmp_path, judge(approve_all(world()), [ch]))
    assert run_with_content(tmp_path, write_content(tmp_path, [ch])) == 0
    html = read(root, "wordpress.html")
    assert "Port of Example</h2>" not in html
    line = next(x for x in read(root, "REVIEW.md").splitlines() if "content:testperson-1:title" in x)
    assert "withheld" in line and "all its lines and exhibits are withheld" in line


def test_exhibit_shows_the_originals_rights_when_it_differs_from_the_shown_record(tmp_path):
    w = world()
    other = copy.deepcopy(w["media"][0])
    other.update(id="TST-M-0002", title="Arrival record", rights_statement="Original held by the archive.")
    w["snapshots"]["TST-S-0001"] += other["rights_statement"] + "\n"
    w["sources"][0]["snapshot_sha256"] = fx.sha(w["snapshots"]["TST-S-0001"])
    w["media"].append(other)
    for m in w["media"]:
        m["verified_claim_sha256"] = gates.media_lock_sha256(m)
    fx.restamp(w)
    approve_all(w)
    ch = chapter()
    ch["exhibits"][0]["original_media_id"] = "TST-M-0002"
    root = write(tmp_path, judge(w, [ch]))
    assert run_with_content(tmp_path, write_content(tmp_path, [ch])) == 0
    exhibit = next(i for n, i in blocks(read(root, "wordpress.html")) if n == "image" and "<strong>Port of Example" in i)
    assert "Rights: No known copyright restrictions." in exhibit
    assert "Rights of the original record: Original held by the archive." in exhibit
    assert exhibit.index("Rights of the original record") < exhibit.index("See the original")
