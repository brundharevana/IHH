"""Tests for tools/fetch_snapshot.py (SPEC sections 2, 3.2, 6).

The network is never touched: urllib is replaced by a fake opener that returns
fixture strings. Adapter tests use the real hosts (catalog.archives.gov, loc.gov,
commons.wikimedia.org, patents.google.com) only so the host detection is
exercised; every catalog number, file name and record body below is an
invented placeholder that describes no real record.
"""

import email.message
import hashlib
import io
import json
import urllib.error
import urllib.request

import factories as fx
import fetch_snapshot as fs
import pytest
import validate
from ihh import paths

NARA_JSON = json.dumps({
    "body": {"hits": {"total": {"value": 1}, "hits": [{"_index": "records", "_source": {
        "record": {
            "naId": 1234,
            "levelOfDescription": "item",
            "ancestors": [{"title": "Example Series of Test Petitions", "naId": 1200}],
            "title": "Petition for Naturalization for Testa Q. Persona",
            "scopeAndContentNote": "This file contains the petition of Testa Q. Persona & a certificate.",
            "digitalObjects": [],
            "generalNotes": None,
        },
        "metadata": {"ingestTime": "2026-01-01T00:00:00Z"},
    }}]}},
})

LOC_JSON = json.dumps({
    "item": {"title": "Test Person portrait", "date": "1941",
             "summary": ["Portrait of <i>Test Person</i> at Example College."],
             "contributor_names": ["Example Studio"]},
    "resources": [{"url": "https://www.loc.gov/resource/example.1/"}],
    "more_like_this": [{"title": "Unrelated item"}],
    "cite_this": {"apa": "Example Studio. (1941) Test Person portrait."},
})

COMMONS_JSON = json.dumps({"query": {"pages": {"42": {"title": "File:Test Person example.jpg", "imageinfo": [{
    "extmetadata": {
        "ImageDescription": {"value": "Test Person at the <b>Port of Example</b>", "source": "commons-desc-page"},
        "Artist": {"value": "<a href=\"https://example.org/studio\">Example Studio</a>", "source": "x"},
        "Credit": {"value": "Example National Archives", "source": "x"},
        "LicenseShortName": {"value": "Public domain", "source": "x"},
        "UsageTerms": {"value": "Public domain", "source": "x"},
    }}]}}}})

PATENT_HTML = """<!DOCTYPE html><html><head><title>US0000000A - Example apparatus - Google Patents</title>
<style>body { color: red; }</style><script>var tracking = "do not keep";</script></head>
<body><h1>Example apparatus</h1><p>Inventor: Test Person &amp; Example Co.</p>
<section><h2>Abstract</h2><p>An example apparatus for testing. """ + ("It has parts. " * 40) + """</p></section>
<noscript>Enable JavaScript for the full experience.</noscript></body></html>"""

JS_SHELL = """<!doctype html><html><head><title>Catalog</title><script src="/app.js"></script></head>
<body><div id="root"></div><noscript>You need to enable JavaScript to run this app.</noscript></body></html>"""


# --- fake network ------------------------------------------------------------------

class FakeResponse:
    def __init__(self, body, status=200, content_type="application/json; charset=utf-8", url=""):
        self._body = body.encode("utf-8") if isinstance(body, str) else body
        self.status = status
        self.headers = email.message.Message()
        self.headers["Content-Type"] = content_type
        self.url = url

    def read(self, n=-1):
        return self._body if n is None or n < 0 else self._body[:n]

    def geturl(self):
        return self.url

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class FakeNet:
    """Replaces fetch_snapshot._urlopen; answers every request with one canned reply."""

    def __init__(self, body="", status=200, content_type="application/json; charset=utf-8"):
        self.body, self.status, self.content_type = body, status, content_type
        self.requests = []

    def __call__(self, request, timeout):
        self.requests.append(request)
        if self.status >= 400:
            hdrs = email.message.Message()
            hdrs["Content-Type"] = self.content_type
            raise urllib.error.HTTPError(request.full_url, self.status, "error", hdrs,
                                         io.BytesIO(self.body.encode("utf-8")))
        return FakeResponse(self.body, self.status, self.content_type, request.full_url)


@pytest.fixture
def net(monkeypatch):
    def install(*args, **kwargs):
        fake = FakeNet(*args, **kwargs)
        monkeypatch.setattr(fs, "_urlopen", fake)
        return fake
    return install


def new_source(sid, url, **extra):
    # The institution and type the authority registry allows for the url (SPEC 3.2, G9).
    if "catalog.archives.gov" in url:
        # Not in the test registry, and authority comes only from the registry: secondary.
        institution, stype = "U.S. National Archives and Records Administration", "secondary"
    elif "archives.example.org" in url:
        institution, stype = "Example National Archives", "primary"
    else:
        institution, stype = "Example Publisher", "secondary"
    rec = fx.source(sid, "Example record for Test Person", institution, stype, url)
    rec.update(extra)
    return rec


def setup_world(tmp_path, *new_sources):
    w = fx.world()
    w["sources"].extend(new_sources)
    root = fx.write_world(tmp_path, w)
    return w, root


def run(tmp_path, *args):
    return fs.main(["testperson", *args, "--data-dir", str(tmp_path)])


def source_record(root, sid):
    return fx.by_id(fx.read_rows(root, "sources"), sid)


# --- planning: which URL is fetched and how ----------------------------------------------

def test_plan_nara_id_page_uses_proxy_api():
    plan = fs.plan_fetch({"url": "https://catalog.archives.gov/id/1234", "fetch_url": None})
    assert plan.adapter == "nara"
    assert plan.fetch_url == "https://catalog.archives.gov/proxy/records/search?naId=1234"
    assert plan.accept == "application/json"
    assert plan.method == "api"


def test_plan_loc_adds_fo_json():
    plan = fs.plan_fetch({"url": "https://www.loc.gov/item/0000000/", "fetch_url": None})
    assert plan.adapter == "loc"
    assert plan.fetch_url == "https://www.loc.gov/item/0000000/?fo=json"
    assert plan.method == "api"
    assert fs.plan_fetch({"url": "https://www.loc.gov/item/0000000/?sp=2"}).fetch_url == \
        "https://www.loc.gov/item/0000000/?sp=2&fo=json"
    assert fs.plan_fetch({"url": "https://www.loc.gov/item/0000000/?fo=json"}).fetch_url == \
        "https://www.loc.gov/item/0000000/?fo=json"


def test_plan_commons_file_page_uses_extmetadata_api():
    plan = fs.plan_fetch({"url": "https://commons.wikimedia.org/wiki/File:Test_Person_example.jpg"})
    assert plan.adapter == "commons"
    assert plan.fetch_url == ("https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo"
                              "&iiprop=extmetadata&titles=File:Test_Person_example.jpg&format=json")
    assert plan.method == "api"


def test_plan_commons_title_is_url_encoded():
    plan = fs.plan_fetch({"url": "https://commons.wikimedia.org/wiki/File:Test%20Person%20%26%20Co.jpg"})
    assert "titles=File:Test%20Person%20%26%20Co.jpg&" in plan.fetch_url


def test_plan_google_patents_is_html():
    plan = fs.plan_fetch({"url": "https://patents.google.com/patent/US0000000A/en"})
    assert plan.adapter == "patents"
    assert plan.fetch_url == "https://patents.google.com/patent/US0000000A/en"
    assert plan.method == "http"


def test_plan_prefers_record_fetch_url():
    plan = fs.plan_fetch({"url": "https://archives.example.org/id/1",
                          "fetch_url": "https://archives.example.org/id/1?format=json"})
    assert plan.fetch_url == "https://archives.example.org/id/1?format=json"
    assert plan.adapter == "generic"
    assert plan.derived is False


def test_plan_marks_adapter_derived_fetch_url():
    assert fs.plan_fetch({"url": "https://catalog.archives.gov/id/1234"}).derived is True
    assert fs.plan_fetch({"url": "https://archives.example.org/page"}).derived is False


def test_plan_refuses_non_http_urls():
    with pytest.raises(fs.FetchError):
        fs.plan_fetch({"url": "file:///etc/passwd", "fetch_url": None})
    with pytest.raises(fs.FetchError):
        fs.plan_fetch({"url": "https://archives.example.org/x", "fetch_url": "ftp://archives.example.org/x"})


# --- conversion --------------------------------------------------------------------------

def test_nara_record_becomes_key_value_lines_with_title_first():
    text = fs.convert_json("nara", json.loads(NARA_JSON))
    lines = text.splitlines()
    assert lines[0] == "title: Petition for Naturalization for Testa Q. Persona"
    assert lines[1] == "scopeAndContentNote: This file contains the petition of Testa Q. Persona & a certificate."
    assert "naId: 1234" in lines
    assert "ancestors[0].title: Example Series of Test Petitions" in lines
    assert not any(line.startswith("generalNotes") for line in lines)  # nulls are dropped
    assert not any("ingestTime" in line for line in lines)  # index metadata is not the record


def test_nara_without_hits_is_an_error():
    with pytest.raises(fs.FetchError, match="no record"):
        fs.convert_json("nara", {"body": {"hits": {"total": {"value": 0}, "hits": []}}})


def test_loc_item_fields_and_html_in_values():
    text = fs.convert_json("loc", json.loads(LOC_JSON))
    assert "title: Test Person portrait" in text.splitlines()
    assert "summary[0]: Portrait of Test Person at Example College." in text.splitlines()
    assert "cite_this.apa: Example Studio. (1941) Test Person portrait." in text.splitlines()
    assert "Unrelated item" not in text


def test_commons_extmetadata_lines():
    lines = fs.convert_json("commons", json.loads(COMMONS_JSON)).splitlines()
    assert lines[0] == "title: File:Test Person example.jpg"
    assert "LicenseShortName: Public domain" in lines
    assert "Artist: Example Studio" in lines
    assert "ImageDescription: Test Person at the Port of Example" in lines


def test_commons_missing_file_is_an_error():
    data = {"query": {"pages": {"-1": {"title": "File:Nothing.jpg", "missing": ""}}}}
    with pytest.raises(fs.FetchError, match="no file"):
        fs.convert_json("commons", data)


def test_html_to_text_drops_scripts_styles_and_unescapes():
    text = fs.html_to_text(PATENT_HTML)
    assert "tracking" not in text
    assert "color: red" not in text
    assert "Enable JavaScript" not in text
    assert "Inventor: Test Person & Example Co." in text
    assert "US0000000A - Example apparatus - Google Patents" in text.splitlines()[0]
    assert "Abstract" in text.splitlines()


def test_generic_json_flattening():
    text = fs.convert_json("generic", {"a": {"b": [1, True, "x\r\ny"]}, "c": "", "d": None})
    assert text.splitlines() == ["a.b[0]: 1", "a.b[1]: true", "a.b[2]: x", "y"]


# --- end to end (mocked network) -------------------------------------------------------------

def test_fetch_nara_writes_snapshot_meta_and_updates_source(tmp_path, net):
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://catalog.archives.gov/id/1234"))
    fake = net(NARA_JSON)
    assert run(tmp_path, "TST-S-0005") == 0

    req = fake.requests[0]
    assert req.full_url == "https://catalog.archives.gov/proxy/records/search?naId=1234"
    assert req.get_header("User-agent") == fs.USER_AGENT
    assert req.get_header("Accept") == "application/json"

    text_bytes = (root / "snapshots" / "TST-S-0005.txt").read_bytes()
    text = text_bytes.decode("utf-8")
    assert text.startswith("title: Petition for Naturalization for Testa Q. Persona\n")
    assert text.endswith("\n")
    meta = json.loads((root / "snapshots" / "TST-S-0005.meta.json").read_text(encoding="utf-8"))
    assert list(meta) == ["url", "fetch_url", "method", "fetched_at", "sha256", "bytes", "http_status",
                          "final_url"]
    assert meta["final_url"] == meta["fetch_url"]  # no redirect: the request ended where it began
    assert meta["url"] == "https://catalog.archives.gov/id/1234"
    assert meta["fetch_url"] == "https://catalog.archives.gov/proxy/records/search?naId=1234"
    assert meta["method"] == "api"
    assert meta["sha256"] == hashlib.sha256(text_bytes).hexdigest()
    assert meta["bytes"] == len(text_bytes)
    assert meta["http_status"] == 200
    assert meta["fetched_at"].endswith("Z")

    rec = source_record(root, "TST-S-0005")
    assert rec["snapshot"] == "snapshots/TST-S-0005.txt"
    assert rec["snapshot_sha256"] == meta["sha256"]
    assert rec["fetch_method"] == "api"
    assert rec["fetch_url"] == "https://catalog.archives.gov/proxy/records/search?naId=1234"
    assert rec["accessed"] == meta["fetched_at"][:10]
    assert list(rec) == list(fx.source("X", "t", "i", "primary", "https://x.example.org"))

    report = validate.validate_inductee(paths.inductee_paths("testperson", tmp_path))
    assert report.errors == []


def test_fetch_keeps_existing_fetch_url(tmp_path, net):
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5",
                                               fetch_url="https://archives.example.org/id/5?format=json"))
    fake = net(json.dumps({"title": "Example record"}))
    assert run(tmp_path, "TST-S-0005") == 0
    assert fake.requests[0].full_url == "https://archives.example.org/id/5?format=json"
    rec = source_record(root, "TST-S-0005")
    assert rec["fetch_url"] == "https://archives.example.org/id/5?format=json"
    assert rec["fetch_method"] == "api"


def test_fetch_html_page_is_http_method(tmp_path, net):
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://patents.google.com/patent/US0000000A/en"))
    net(PATENT_HTML, content_type="text/html; charset=utf-8")
    assert run(tmp_path, "TST-S-0005") == 0
    rec = source_record(root, "TST-S-0005")
    assert rec["fetch_method"] == "http"
    assert rec["fetch_url"] is None  # the human page itself was fetched
    meta = json.loads((root / "snapshots" / "TST-S-0005.meta.json").read_text(encoding="utf-8"))
    assert meta["fetch_url"] == "https://patents.google.com/patent/US0000000A/en"
    assert "Inventor: Test Person & Example Co." in (root / "snapshots" / "TST-S-0005.txt").read_text()


@pytest.mark.parametrize("status", [403, 429])
def test_blocked_status_exits_2_with_browser_instructions(tmp_path, net, capsys, status):
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5"))
    before = (root / "sources.jsonl").read_bytes()
    net("Forbidden", status=status, content_type="text/html")
    assert run(tmp_path, "TST-S-0005") == 2
    err = capsys.readouterr().err
    assert str(status) in err
    assert "--from-file" in err and "--method browser" in err
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()
    assert (root / "sources.jsonl").read_bytes() == before


def test_javascript_shell_page_exits_2(tmp_path, net, capsys):
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5"))
    net(JS_SHELL, content_type="text/html; charset=utf-8")
    assert run(tmp_path, "TST-S-0005") == 2
    assert "JavaScript" in capsys.readouterr().err
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()


def test_other_http_errors_exit_1(tmp_path, net):
    setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5"))
    net("Not found", status=404, content_type="text/html")
    assert run(tmp_path, "TST-S-0005") == 1


def test_network_failure_exits_1(tmp_path, monkeypatch):
    setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5"))

    def boom(request, timeout):
        raise urllib.error.URLError("name resolution failed")
    monkeypatch.setattr(fs, "_urlopen", boom)
    assert run(tmp_path, "TST-S-0005") == 1


def test_unknown_source_exits_1(tmp_path, net):
    setup_world(tmp_path)
    net(NARA_JSON)
    assert run(tmp_path, "TST-S-0099") == 1


def test_refuses_to_replace_snapshot_without_force(tmp_path, net, capsys):
    _, root = setup_world(tmp_path)
    before = (root / "snapshots" / "TST-S-0003.txt").read_bytes()
    net("<html><body>" + "replacement text " * 60 + "</body></html>", content_type="text/html")
    assert run(tmp_path, "TST-S-0003") == 1
    assert "--force" in capsys.readouterr().err
    assert (root / "snapshots" / "TST-S-0003.txt").read_bytes() == before
    assert run(tmp_path, "TST-S-0003", "--force") == 0
    assert (root / "snapshots" / "TST-S-0003.txt").read_bytes() != before


# --- supplied text (browser / manual) ---------------------------------------------------------------

def test_from_file_browser(tmp_path):
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5"))
    page = tmp_path / "page.txt"
    page.write_text("Test Person page\r\nTaught at Example College.   \r\n\r\n\r\n\r\nEnd.", encoding="utf-8")
    assert run(tmp_path, "TST-S-0005", "--from-file", str(page), "--method", "browser") == 0
    text = (root / "snapshots" / "TST-S-0005.txt").read_text(encoding="utf-8")
    assert text == "Test Person page\nTaught at Example College.\n\nEnd.\n"
    meta = json.loads((root / "snapshots" / "TST-S-0005.meta.json").read_text(encoding="utf-8"))
    assert meta["method"] == "browser"
    assert meta["fetch_url"] is None
    assert meta["http_status"] is None
    assert meta["final_url"] is None
    assert meta["url"] == "https://archives.example.org/id/5"
    rec = source_record(root, "TST-S-0005")
    assert rec["fetch_method"] == "browser"
    assert rec["snapshot_sha256"] == meta["sha256"]
    assert validate.validate_inductee(paths.inductee_paths("testperson", tmp_path)).errors == []


def test_from_file_html_is_converted(tmp_path):
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5"))
    page = tmp_path / "page.html"
    page.write_text("<html><body><script>x()</script><p>Test &amp; Person</p></body></html>", encoding="utf-8")
    assert run(tmp_path, "TST-S-0005", "--from-file", str(page), "--method", "manual") == 0
    assert (root / "snapshots" / "TST-S-0005.txt").read_text(encoding="utf-8") == "Test & Person\n"


def test_from_file_rejects_empty_text(tmp_path):
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5"))
    page = tmp_path / "page.txt"
    page.write_text("  \n \n", encoding="utf-8")
    assert run(tmp_path, "TST-S-0005", "--from-file", str(page), "--method", "browser") == 1
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()


def test_usage_errors_never_exit_2(tmp_path):
    """Exit 2 means 'use the browser fallback'; argument mistakes must not look like that."""
    setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5"))
    page = tmp_path / "page.txt"
    page.write_text("text", encoding="utf-8")
    assert run(tmp_path, "TST-S-0005", "--from-file", str(page)) == 1
    assert run(tmp_path, "TST-S-0005", "--method", "browser") == 1
    assert run(tmp_path, "TST-S-0005", "--from-file", str(page), "--method", "http") == 1
    assert fs.main(["testperson", "--data-dir", str(tmp_path)]) == 1
    assert fs.main(["Bad Slug", "TST-S-0005", "--data-dir", str(tmp_path)]) == 1


# --- staged sources (temporary ids) ------------------------------------------------------------------

def test_staged_source_snapshot_goes_to_staging(tmp_path, net):
    _, root = setup_world(tmp_path)
    staged = new_source("tmp-nara-S-1", "https://catalog.archives.gov/id/1234")
    other = '{"id": "tmp-nara-F-1",   "claim": "kept byte for byte"}'
    (root / "staging" / "nara.jsonl").write_text(json.dumps(staged) + "\n" + other + "\n", encoding="utf-8")
    net(NARA_JSON)
    assert run(tmp_path, "tmp-nara-S-1") == 0

    snap = root / "staging" / "snapshots" / "tmp-nara-S-1.txt"
    assert snap.is_file()
    assert (root / "staging" / "snapshots" / "tmp-nara-S-1.meta.json").is_file()
    assert not (root / "snapshots" / "tmp-nara-S-1.txt").exists()
    lines = (root / "staging" / "nara.jsonl").read_text(encoding="utf-8").splitlines()
    rec = json.loads(lines[0])
    assert rec["snapshot"] == "staging/snapshots/tmp-nara-S-1.txt"
    assert rec["snapshot_sha256"] == hashlib.sha256(snap.read_bytes()).hexdigest()
    assert rec["fetch_method"] == "api"
    assert rec["fetch_url"] == "https://catalog.archives.gov/proxy/records/search?naId=1234"
    assert lines[1] == other
    assert fx.read_rows(root, "sources") == fx.world()["sources"]


def test_staged_source_missing_exits_1(tmp_path, net):
    _, root = setup_world(tmp_path)
    (root / "staging" / "nara.jsonl").write_text("", encoding="utf-8")
    net(NARA_JSON)
    assert run(tmp_path, "tmp-nara-S-7") == 1


def test_staged_source_in_file_with_bad_lines_is_not_rewritten(tmp_path, net):
    _, root = setup_world(tmp_path)
    staged = new_source("tmp-nara-S-1", "https://catalog.archives.gov/id/1234")
    content = json.dumps(staged) + "\n{not json\n"
    (root / "staging" / "nara.jsonl").write_text(content, encoding="utf-8")
    net(NARA_JSON)
    assert run(tmp_path, "tmp-nara-S-1") == 1
    assert (root / "staging" / "nara.jsonl").read_text(encoding="utf-8") == content


# --- fetch_url must belong to the url (round 2 review) --------------------------------------------

def test_plan_refuses_a_fetch_url_on_another_site():
    with pytest.raises(fs.FetchError, match="not the cited record"):
        fs.plan_fetch({"url": "https://news.example.org/test-person",
                       "fetch_url": "https://blog.unrelated.example.net/some-post"})
    with pytest.raises(fs.FetchError, match="null"):
        fs.plan_fetch({"url": "https://archive.org/details/test-person",
                       "fetch_url": "https://archive.org/details/someone-else"})


def test_plan_refuses_a_fetch_url_on_the_same_site_and_accepts_the_adapter_endpoint():
    # Class C: a page on the same site is another record, not the cited one.
    with pytest.raises(fs.FetchError, match="not the cited record"):
        fs.plan_fetch({"url": "https://library.example.org/x", "fetch_url": "https://api.example.org/x.json"})
    assert fs.plan_fetch({"url": "https://library.example.org/x",
                          "fetch_url": "https://library.example.org/x?format=json"}).fetch_url == \
        "https://library.example.org/x?format=json"
    nara = "https://catalog.archives.gov/proxy/records/search?naId=1234"
    assert fs.plan_fetch({"url": "https://catalog.archives.gov/id/1234", "fetch_url": nara}).fetch_url == nara
    api = ("https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata"
           "&titles=File:X.jpg&format=json")
    assert fs.plan_fetch({"url": "https://commons.wikimedia.org/wiki/File:X.jpg", "fetch_url": api}).fetch_url == api


# --- LoC newspaper pages keep their OCR full text (Chronicling America) ---------------------------
#
# A loc.gov newspaper page record (/resource/<lccn>/<date>/ed-N/?sp=<page>) names its own OCR text
# in resource.fulltext_file (and the same URL as fulltext_service): LoC's Text Services endpoint on
# tile.loc.gov, which with full_text=1 answers {"<segment>": {"full_text": ..., "height", "width"}}
# (https://www.loc.gov/apis/micro-services/text-services). The shapes below are the real response
# shapes; every value is an invented placeholder.

LOC_PAGE_URL = "https://www.loc.gov/resource/sn00000000/1900-01-02/ed-1/?sp=2&st=text"
LOC_PAGE_FETCH = "https://www.loc.gov/resource/sn00000000/1900-01-02/ed-1/?sp=2&st=text&fo=json"
LOC_SEGMENT = "/service/ndnp/xx/batch_xx_example_ver01/data/sn00000000/00000000000/1900010201/0002.xml"
LOC_TEXT_URL = ("https://tile.loc.gov/text-services/word-coordinates-service?segment=" + LOC_SEGMENT
                + "&format=alto_xml&full_text=1")
LOC_OCR = ("EXAMPLE TOWN NEWS\nTESTA PERSONA\nVISITS THE CITY\nMiss Testa Persona arrived here to-\n"
           "day and was received by the\nMayor. <i> 3fck ^^ OCR noise\n")


def loc_page_json(pointer=LOC_TEXT_URL, service=LOC_TEXT_URL, segment_id=LOC_SEGMENT):
    data = {
        "item": {"title": "Example town news (Example, Ex.), January 2, 1900", "date": "1900-01-02"},
        "resource": {"url": "https://www.loc.gov/resource/sn00000000/1900-01-02/ed-1/",
                     "word_coordinates": "https://tile.loc.gov/text-services/word-coordinates-service",
                     "segment_count": 8},
        "segment_id": segment_id,
        "segments": [{"description": ["EXAMPLE TOWN NEWS TESTA PERSONA VISITS"]}],
        "resources": [{"url": "https://www.loc.gov/resource/sn00000000/1900-01-02/ed-1/"}],
        "cite_this": {"apa": "(1900, January 2) Example town news."},
    }
    if pointer is not None:
        data["resource"]["fulltext_file"] = pointer
    if service is not None:
        data["fulltext_service"] = service
    return json.dumps(data)


def loc_text_json(segment=LOC_SEGMENT, text=LOC_OCR):
    return json.dumps({segment: {"full_text": text, "height": "7352", "width": "5600"}})


class RoutedNet:
    """Answers each URL with its own canned reply (status, body); anything else is a 404."""

    def __init__(self, routes):
        self.routes, self.requests = routes, []

    def __call__(self, request, timeout):
        self.requests.append(request)
        status, body = self.routes.get(request.full_url, (404, "not found"))
        if status >= 400:
            hdrs = email.message.Message()
            hdrs["Content-Type"] = "text/html"
            raise urllib.error.HTTPError(request.full_url, status, "error", hdrs, io.BytesIO(body.encode()))
        return FakeResponse(body, status, "application/json; charset=utf-8", request.full_url)


@pytest.fixture
def routed(monkeypatch):
    def install(routes):
        fake = RoutedNet(routes)
        monkeypatch.setattr(fs, "_urlopen", fake)
        return fake
    return install


def loc_page_world(tmp_path):
    return setup_world(tmp_path, new_source("TST-S-0005", LOC_PAGE_URL))


def test_loc_newspaper_page_snapshot_keeps_the_page_ocr_full_text(tmp_path, routed):
    _, root = loc_page_world(tmp_path)
    fake = routed({LOC_PAGE_FETCH: (200, loc_page_json()), LOC_TEXT_URL: (200, loc_text_json())})
    assert run(tmp_path, "TST-S-0005") == 0
    assert [r.full_url for r in fake.requests] == [LOC_PAGE_FETCH, LOC_TEXT_URL]
    assert fake.requests[1].get_header("User-agent") == fs.USER_AGENT

    text = (root / "snapshots" / "TST-S-0005.txt").read_text(encoding="utf-8")
    # The record's metadata lines stay, then the OCR text exactly as LoC sent it, with its URL.
    assert text.startswith("title: Example town news (Example, Ex.), January 2, 1900\n")
    assert f"\nfull_text_url: {LOC_TEXT_URL}\nfull_text:\n{LOC_OCR}" in text
    assert text.endswith(LOC_OCR)

    meta = json.loads((root / "snapshots" / "TST-S-0005.meta.json").read_text(encoding="utf-8"))
    assert meta["fetch_url"] == LOC_PAGE_FETCH
    assert meta["full_text_url"] == LOC_TEXT_URL
    assert meta["method"] == "api"
    assert meta["sha256"] == hashlib.sha256(text.encode("utf-8")).hexdigest()
    rec = source_record(root, "TST-S-0005")
    assert rec["fetch_method"] == "api"
    assert rec["fetch_url"] == LOC_PAGE_FETCH

    report = validate.validate_inductee(paths.inductee_paths("testperson", tmp_path))
    assert report.errors == []


def test_loc_full_text_quote_passes_g1_and_g10_without_a_live_browser_check(tmp_path, routed):
    from types import SimpleNamespace

    from ihh import gates, normalize
    _, root = loc_page_world(tmp_path)
    routed({LOC_PAGE_FETCH: (200, loc_page_json()), LOC_TEXT_URL: (200, loc_text_json())})
    assert run(tmp_path, "TST-S-0005") == 0
    text = (root / "snapshots" / "TST-S-0005.txt").read_text(encoding="utf-8")
    quote = "Miss Testa Persona arrived here to- day and was received by the Mayor."
    assert normalize.contains_normalized(normalize.normalize_text(text), normalize.normalize_text(quote))
    rec = source_record(root, "TST-S-0005")
    record = {"evidence": [{"source_id": "TST-S-0005", "quote": quote}],
              "adversary": {"quote_in_live": "unreachable"}}
    ctx = SimpleNamespace(sources={"TST-S-0005": rec})
    # A program fetched it from LoC's own endpoint (method api): G10 needs no live browser check.
    assert gates.g10_snapshot_integrity(record, ctx) == []


def test_loc_item_record_without_full_text_is_unchanged(tmp_path, routed):
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://www.loc.gov/item/0000000/"))
    fake = routed({"https://www.loc.gov/item/0000000/?fo=json": (200, LOC_JSON)})
    assert run(tmp_path, "TST-S-0005") == 0
    assert len(fake.requests) == 1
    meta = json.loads((root / "snapshots" / "TST-S-0005.meta.json").read_text(encoding="utf-8"))
    assert "full_text_url" not in meta
    assert "full_text:" not in (root / "snapshots" / "TST-S-0005.txt").read_text(encoding="utf-8")


@pytest.mark.parametrize("pointer, service, segment_id, why", [
    ("https://example.org/text-services/word-coordinates-service?segment=" + LOC_SEGMENT
     + "&format=alto_xml&full_text=1", None, LOC_SEGMENT, "not LoC's Text Services"),
    ("https://tile.loc.gov/storage-services/elsewhere?segment=" + LOC_SEGMENT + "&full_text=1", None,
     LOC_SEGMENT, "not LoC's Text Services"),
    (LOC_TEXT_URL.replace("&full_text=1", ""), None, LOC_SEGMENT, "full_text=1"),
    ("http://tile.loc.gov/text-services/word-coordinates-service?segment=" + LOC_SEGMENT
     + "&format=alto_xml&full_text=1", None, LOC_SEGMENT, "https"),
    (LOC_TEXT_URL, LOC_TEXT_URL.replace("0002.xml", "0003.xml"), LOC_SEGMENT, "disagree"),
    (LOC_TEXT_URL, None, LOC_SEGMENT.replace("0002.xml", "0003.xml"), "segment"),
    (LOC_TEXT_URL, None, None, "segment"),  # a page record that names no segment of its own
])
def test_loc_full_text_pointer_must_be_this_page_on_loc_text_services(tmp_path, routed, capsys, pointer,
                                                                       service, segment_id, why):
    _, root = loc_page_world(tmp_path)
    fake = routed({LOC_PAGE_FETCH: (200, loc_page_json(pointer, service, segment_id)),
                   pointer: (200, loc_text_json())})
    assert run(tmp_path, "TST-S-0005") == 1
    assert why in capsys.readouterr().err
    assert len(fake.requests) == 1  # the bad pointer is never requested
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()


@pytest.mark.parametrize("body, why", [
    (loc_text_json(segment=LOC_SEGMENT.replace("0002.xml", "0009.xml")), "another segment"),
    (json.dumps({LOC_SEGMENT: {"height": "1"}}), "no full_text"),
    (json.dumps({LOC_SEGMENT: {"full_text": "  "}}), "no full_text"),
    ("not json", "not JSON"),
])
def test_loc_full_text_answer_must_be_the_page_text(tmp_path, routed, capsys, body, why):
    _, root = loc_page_world(tmp_path)
    routed({LOC_PAGE_FETCH: (200, loc_page_json()), LOC_TEXT_URL: (200, body)})
    assert run(tmp_path, "TST-S-0005") == 1
    assert why in capsys.readouterr().err
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()


def test_loc_full_text_blocked_exits_2_and_saves_nothing(tmp_path, routed):
    _, root = loc_page_world(tmp_path)
    routed({LOC_PAGE_FETCH: (200, loc_page_json()), LOC_TEXT_URL: (403, "denied")})
    assert run(tmp_path, "TST-S-0005") == 2
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()


def test_gate_refuses_a_meta_full_text_url_off_loc_text_services(tmp_path, routed):
    from ihh import gates
    _, root = loc_page_world(tmp_path)
    routed({LOC_PAGE_FETCH: (200, loc_page_json()), LOC_TEXT_URL: (200, loc_text_json())})
    assert run(tmp_path, "TST-S-0005") == 0
    rec = source_record(root, "TST-S-0005")
    meta = json.loads((root / "snapshots" / "TST-S-0005.meta.json").read_text(encoding="utf-8"))
    assert gates.meta_provenance_failures(rec, meta) == []
    bad = dict(meta, full_text_url="https://example.org/ocr.txt")
    assert any("full_text_url" in x for x in gates.meta_provenance_failures(rec, bad))


# --- the full text is the cited page's own segment (Codex gate review, 2026-10-10) ------------------
#
# The rule: the OCR text kept in a snapshot is the cited page's own text. fetch_snapshot.py records
# the page record's segment_id in the meta file and the snapshot header; G1 holds the full-text URL's
# segment to it.

def test_loc_full_text_snapshot_records_the_page_segment(tmp_path, routed):
    _, root = loc_page_world(tmp_path)
    routed({LOC_PAGE_FETCH: (200, loc_page_json()), LOC_TEXT_URL: (200, loc_text_json())})
    assert run(tmp_path, "TST-S-0005") == 0
    text = (root / "snapshots" / "TST-S-0005.txt").read_text(encoding="utf-8")
    assert f"\nsegment_id: {LOC_SEGMENT}\nfull_text_url: {LOC_TEXT_URL}\nfull_text:\n{LOC_OCR}" in text
    meta = json.loads((root / "snapshots" / "TST-S-0005.meta.json").read_text(encoding="utf-8"))
    assert meta["segment_id"] == LOC_SEGMENT


def _fetched_loc_page(tmp_path, routed):
    _, root = loc_page_world(tmp_path)
    routed({LOC_PAGE_FETCH: (200, loc_page_json()), LOC_TEXT_URL: (200, loc_text_json())})
    assert run(tmp_path, "TST-S-0005") == 0
    meta = json.loads((root / "snapshots" / "TST-S-0005.meta.json").read_text(encoding="utf-8"))
    text = (root / "snapshots" / "TST-S-0005.txt").read_text(encoding="utf-8")
    return root, source_record(root, "TST-S-0005"), meta, text


def _snap(text, meta):
    from ihh import records as rec_mod
    return rec_mod.Snapshot(text=text, sha256=hashlib.sha256(text.encode("utf-8")).hexdigest(),
                            meta=dict(meta, sha256=hashlib.sha256(text.encode("utf-8")).hexdigest()), error=None)


def test_g1_refuses_full_text_of_another_segment(tmp_path, routed):
    from ihh import gates
    _, rec, meta, text = _fetched_loc_page(tmp_path, routed)
    other = LOC_TEXT_URL.replace("0002.xml", "0003.xml")
    # Another page's text under this record: the URL names segment 0003, the record's own is 0002.
    bad_text = text.replace(f"full_text_url: {LOC_TEXT_URL}", f"full_text_url: {other}")
    bad_meta = dict(meta, full_text_url=other)
    assert any("segment" in x for x in gates.meta_provenance_failures(rec, bad_meta))
    rec2 = dict(rec, snapshot_sha256=hashlib.sha256(bad_text.encode("utf-8")).hexdigest())
    assert any("segment" in x for x in gates.snapshot_failures(rec2, _snap(bad_text, bad_meta)))


def test_g1_refuses_full_text_without_the_page_segment(tmp_path, routed):
    from ihh import gates
    _, rec, meta, text = _fetched_loc_page(tmp_path, routed)
    assert gates.meta_provenance_failures(rec, meta) == []
    no_seg = {k: v for k, v in meta.items() if k != "segment_id"}
    assert any("segment_id" in x for x in gates.meta_provenance_failures(rec, no_seg))


def test_g1_refuses_a_snapshot_header_that_disagrees_with_the_meta(tmp_path, routed):
    from ihh import gates
    _, rec, meta, text = _fetched_loc_page(tmp_path, routed)
    assert gates.snapshot_failures(rec, _snap(text, meta)) == []
    other_seg = LOC_SEGMENT.replace("0002.xml", "0003.xml")
    bad_text = text.replace(f"segment_id: {LOC_SEGMENT}", f"segment_id: {other_seg}")
    rec2 = dict(rec, snapshot_sha256=hashlib.sha256(bad_text.encode("utf-8")).hexdigest())
    assert any("segment" in x for x in gates.snapshot_failures(rec2, _snap(bad_text, meta)))


# --- pacing every request (Codex review round 5, 2026-11-01) ------------------------------

def test_with_a_pace_every_request_of_one_snapshot_is_spaced(net, monkeypatch):
    # tour_research paces between fetch_snapshot.py calls, but one call may make a second request (a LoC
    # page's OCR text) or follow a redirect; with --pace each request waits its turn inside the process
    now, slept = [100.0], []
    monkeypatch.setattr(fs, "_PACER", fs.Pacer(4.0, clock=lambda: now[0], sleep=lambda s: (slept.append(s), now.__setitem__(0, now[0] + s))))
    net(body='{"ok": 1}')
    plan = fs.plan_fetch({"url": "https://www.loc.gov/item/0000000/", "fetch_url": None})
    fs.http_get(plan)
    now[0] += 1.0
    fs.http_get(plan)
    assert slept == [pytest.approx(3.0)]


def test_a_followed_redirect_waits_its_turn(monkeypatch):
    now, slept = [100.0], []
    monkeypatch.setattr(fs, "_PACER", fs.Pacer(4.0, clock=lambda: now[0], sleep=lambda s: slept.append(s)))
    fs._PACER.wait()
    req = urllib.request.Request("https://www.loc.gov/item/0000000/?fo=json")
    req.ihh_record = req.full_url
    new = fs._HttpOnlyRedirects().redirect_request(req, None, 301, "moved", email.message.Message(),
                                                  "https://www.loc.gov/item/0000000?fo=json")
    assert new is not None and slept == [pytest.approx(4.0)]


def test_without_a_pace_nothing_waits(monkeypatch):
    slept = []
    monkeypatch.setattr(fs, "_PACER", fs.Pacer(0.0, clock=lambda: 100.0, sleep=lambda s: slept.append(s)))
    fs._PACER.wait()
    fs._PACER.wait()
    assert slept == []


FILLER = "This page checks that the visitor is a person before the archive record is shown to them. " * 8
CHALLENGES = [
    "<html><head><title>Security check</title></head><body><h1>Please complete the CAPTCHA</h1><p>" + FILLER + "</p></body></html>",
    "<html><head><title>Just a moment...</title></head><body><p>" + FILLER + "</p></body></html>",
    "<html><head><title>Records</title><script src='/cdn-cgi/challenge-platform/h/b/orchestrate/jsch/v1'></script></head>"
    "<body><p>" + FILLER + "</p></body></html>",
    "<html><head><title>Attention Required! | Cloudflare</title></head><body><p>" + FILLER + "</p></body></html>",
    "<html><body><h1>Verify you are human</h1><p>" + FILLER + "</p></body></html>",
]


@pytest.mark.parametrize("page", CHALLENGES)
def test_a_long_bot_challenge_page_with_http_200_is_blocked_not_saved(tmp_path, net, capsys, page):
    # Codex review round 6: a 100-word CAPTCHA page answered 200 passed the JavaScript-shell check and was saved
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5"))
    net(page, content_type="text/html; charset=utf-8")
    assert run(tmp_path, "TST-S-0005") == 2
    assert "bot challenge" in capsys.readouterr().err
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()


def test_an_article_page_with_a_captcha_form_is_not_a_challenge(tmp_path, net):
    # a long page whose comment form loads reCAPTCHA (in a script, and one short form label) is a real page
    page = ("<html><head><title>Test Person papers</title><script src='https://www.google.com/recaptcha/api.js'></script>"
            "</head><body><p>" + "Test Person taught at Example College for thirteen years and wrote letters. " * 40
            + "</p><form><label>Type the captcha</label></form></body></html>")
    _, root = setup_world(tmp_path, new_source("TST-S-0005", "https://archives.example.org/id/5"))
    net(page, content_type="text/html; charset=utf-8")
    assert run(tmp_path, "TST-S-0005") == 0
    assert (root / "snapshots" / "TST-S-0005.txt").exists()
