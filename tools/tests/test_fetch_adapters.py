"""Tests for the NARA page-transcription and USPTO Patent Public Search adapters (owner approval
2026-10-16; SPEC 3.2 fetch_url, section 6 fetch_snapshot.py).

The network is never touched. The response shapes are the real ones (checked live on 2026-10-16:
catalog.archives.gov/proxy/contributions/targetNaId/<N> answers a JSON list of contributions;
ppubs.uspto.gov/api/users/me/session answers with an X-Access-Token header and
/api/patents/highlight/<guid> answers the record JSON); every id, name and text below is an
invented placeholder that describes no real record.
"""

import email.message
import io
import json
import urllib.error

import factories as fx
import fetch_snapshot as fs
import pytest
import validate
from ihh import fetchplan, gates, normalize, paths

NARA_URL = "https://catalog.archives.gov/id/1234"
NARA_RECORD_API = "https://catalog.archives.gov/proxy/records/search?naId=1234"
NARA_CONTRIB_API = "https://catalog.archives.gov/proxy/contributions/targetNaId/1234"

PPUBS_URL = "https://ppubs.uspto.gov/pubwebapp/external.html?q=1234567.pn.&db=USOCR"
PPUBS_API = "https://ppubs.uspto.gov/api/patents/highlight/US-1234567-A?queryId=1&source=USOCR&includeSections=true"
PPUBS_SESSION = "https://ppubs.uspto.gov/api/users/me/session"


def nara_record_json():
    return json.dumps({"body": {"hits": {"total": {"value": 1}, "hits": [{"_source": {"record": {
        "naId": 1234, "title": "Patent Case File No. 0,000,001, Example Apparatus, Inventor Testa Persona",
        "digitalObjects": [
            {"objectId": "1236", "objectFilename": "000_0000001_01.jpg"},
            {"objectId": "1235", "objectFilename": "000_0000001_02.jpg"},
            {"objectId": "1237", "objectFilename": "000_0000001_03.jpg"},
        ]}}}]}}})


def contribution(obj, text, status="active", kind="transcription", naid=1234, updated="2024-01-02T03:04:05.000Z"):
    return {"id": int(obj), "contributionType": kind, "contribution": text, "status": status,
            "targetNaId": naid, "targetObjectId": obj, "updatedAt": updated, "naraStaff": 0,
            "userName": "volunteer.example"}


def contributions_json(*items):
    return json.dumps(list(items) or [
        contribution("1235", "Name: TESTA PERSONA\nof: EXAMPLE CITY"),
        contribution("1235", "an older draft", status="inactive"),
        contribution("1236", "PATENT No. 0000001\nFiled June 1, 1940"),
        contribution("1237", "fine example", kind="tag"),
    ])


def ppubs_json(guid="US-1234567-A"):
    return json.dumps({
        "guid": guid, "publicationReferenceDocumentNumber": "1234567",
        "inventionTitle": "Example apparatus", "type": "USOCR", "databaseName": "USOC",
        "datePublished": "1940-08-11T00:00:00Z", "applicationFilingDate": ["1939-06-10T00:00:00Z"],
        "inventorsName": ["PERSONA TESTA", "EXAMPLE ALEX"], "kindCode": ["A"], "pageCount": 3,
        "descriptionHtml": "UNITED STATES PATENT OFFICE<br />(1) 1,234,567<br />EXAMPLE APPARATUS<br />"
                           "(2) Testa Persona, Example City<br />(3) An object of the invention is "
                           "<i>simple</i>.",
        "claimsHtml": "We claim:<br />1. An example apparatus.",
        "abstractHtml": None, "imageLocation": "ignored",
    })


class Reply:
    def __init__(self, body, status=200, headers=None, url=""):
        self._body = body.encode("utf-8")
        self.status = status
        self.headers = email.message.Message()
        self.headers["Content-Type"] = "application/json; charset=utf-8"
        for k, v in (headers or {}).items():
            self.headers[k] = v
        self.url = url

    def read(self, n=-1):
        return self._body if n is None or n < 0 else self._body[:n]

    def geturl(self):
        return self.url

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class Net:
    """Answers (method, url) with its own canned reply; anything else is a 404."""

    def __init__(self, routes):
        self.routes, self.requests = routes, []

    def __call__(self, request, timeout):
        self.requests.append(request)
        reply = self.routes.get((request.get_method(), request.full_url))
        if reply is None or reply[0] >= 400:
            status, body = reply[:2] if reply else (404, "not found")
            hdrs = email.message.Message()
            raise urllib.error.HTTPError(request.full_url, status, "error", hdrs, io.BytesIO(body.encode()))
        status, body, headers = (reply + ({},))[:3]
        return Reply(body, status, headers, request.full_url)


@pytest.fixture
def net(monkeypatch):
    def install(routes):
        fake = Net(routes)
        monkeypatch.setattr(fs, "_urlopen", fake)
        return fake
    return install


def world(tmp_path, sid, url, fetch_url):
    rec = fx.source(sid, "Example record for Test Person", "Example Publisher", "secondary", url,
                    fetch_url=fetch_url)
    w = fx.world()
    w["sources"].append(rec)
    return fx.write_world(tmp_path, w)


def run(tmp_path, *args):
    return fs.main(["testperson", *args, "--data-dir", str(tmp_path)])


# --- planning ------------------------------------------------------------------------------------

def test_nara_transcriptions_endpoint_is_an_adapter_endpoint_of_the_catalog_record():
    assert fetchplan.nara_transcriptions_endpoint(NARA_URL) == NARA_CONTRIB_API
    assert fetchplan.fetch_url_problem({"url": NARA_URL, "fetch_url": NARA_CONTRIB_API}) is None
    plan = fetchplan.plan_fetch({"url": NARA_URL, "fetch_url": NARA_CONTRIB_API})
    assert (plan.adapter, plan.fetch_url, plan.method) == ("nara-transcriptions", NARA_CONTRIB_API, "api")


def test_nara_transcriptions_of_another_record_are_refused():
    other = "https://catalog.archives.gov/proxy/contributions/targetNaId/9999"
    assert "not the cited record" in fetchplan.fetch_url_problem({"url": NARA_URL, "fetch_url": other})
    with pytest.raises(fetchplan.PlanError):
        fetchplan.plan_fetch({"url": NARA_URL, "fetch_url": other})
    # another contributions path (a user's contributions) is not the record's transcriptions
    bad = "https://catalog.archives.gov/proxy/contributions/userId/1234"
    assert fetchplan.fetch_url_problem({"url": NARA_URL, "fetch_url": bad})


def test_uspto_highlight_endpoint_must_name_the_patent_and_database_of_the_url():
    assert fetchplan.fetch_url_problem({"url": PPUBS_URL, "fetch_url": PPUBS_API}) is None
    plan = fetchplan.plan_fetch({"url": PPUBS_URL, "fetch_url": PPUBS_API})
    assert (plan.adapter, plan.fetch_url, plan.method) == ("uspto", PPUBS_API, "api")
    for bad in (PPUBS_API.replace("1234567", "7654321"),       # another patent
                PPUBS_API.replace("source=USOCR", "source=USPAT"),  # another database
                PPUBS_API + "&extra=1",                          # an unknown parameter
                PPUBS_API.replace("US-1234567-A", "US-1234567-A/x")):
        assert fetchplan.fetch_url_problem({"url": PPUBS_URL, "fetch_url": bad}), bad
    # the url must itself name one patent number and database
    vague = "https://ppubs.uspto.gov/pubwebapp/external.html?q=secret+communication&db=USOCR"
    assert fetchplan.fetch_url_problem({"url": vague, "fetch_url": PPUBS_API})


# --- NARA page transcriptions ----------------------------------------------------------------------

def nara_routes():
    return {("GET", NARA_CONTRIB_API): (200, contributions_json()),
            ("GET", NARA_RECORD_API): (200, nara_record_json())}


def test_nara_transcriptions_snapshot_lists_active_page_transcriptions_in_page_order(tmp_path, net):
    root = world(tmp_path, "TST-S-0005", NARA_URL, NARA_CONTRIB_API)
    fake = net(nara_routes())
    assert run(tmp_path, "TST-S-0005") == 0
    assert [r.full_url for r in fake.requests] == [NARA_CONTRIB_API, NARA_RECORD_API]
    text = (root / "snapshots" / "TST-S-0005.txt").read_text(encoding="utf-8")
    assert text == (
        "title: Patent Case File No. 0,000,001, Example Apparatus, Inventor Testa Persona\n"
        "naId: 1234\n\n"
        "objectId: 1236\nobjectFilename: 000_0000001_01.jpg\n"
        "transcription.updatedAt: 2024-01-02T03:04:05.000Z\ntranscription:\n"
        "PATENT No. 0000001\nFiled June 1, 1940\n\n"
        "objectId: 1235\nobjectFilename: 000_0000001_02.jpg\n"
        "transcription.updatedAt: 2024-01-02T03:04:05.000Z\ntranscription:\n"
        "Name: TESTA PERSONA\nof: EXAMPLE CITY\n")
    assert "older draft" not in text and "fine example" not in text
    meta = json.loads((root / "snapshots" / "TST-S-0005.meta.json").read_text(encoding="utf-8"))
    assert (meta["method"], meta["fetch_url"], meta["record_url"]) == ("api", NARA_CONTRIB_API, NARA_RECORD_API)
    rec = fx.by_id(fx.read_rows(root, "sources"), "TST-S-0005")
    assert rec["fetch_method"] == "api" and rec["fetch_url"] == NARA_CONTRIB_API
    report = validate.validate_inductee(paths.inductee_paths("testperson", tmp_path))
    assert report.errors == []


def test_nara_transcriptions_of_another_record_in_the_answer_are_refused(tmp_path, net):
    root = world(tmp_path, "TST-S-0005", NARA_URL, NARA_CONTRIB_API)
    net({("GET", NARA_CONTRIB_API): (200, contributions_json(contribution("1235", "x", naid=9999))),
         ("GET", NARA_RECORD_API): (200, nara_record_json())})
    assert run(tmp_path, "TST-S-0005") == 1
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()


def test_nara_record_without_active_transcriptions_saves_nothing(tmp_path, net):
    root = world(tmp_path, "TST-S-0005", NARA_URL, NARA_CONTRIB_API)
    net({("GET", NARA_CONTRIB_API): (200, contributions_json(contribution("1235", "x", status="inactive"))),
         ("GET", NARA_RECORD_API): (200, nara_record_json())})
    assert run(tmp_path, "TST-S-0005") == 1
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()


def test_g1_refuses_a_record_url_that_is_not_the_records_own_endpoint(tmp_path, net):
    root = world(tmp_path, "TST-S-0005", NARA_URL, NARA_CONTRIB_API)
    net(nara_routes())
    assert run(tmp_path, "TST-S-0005") == 0
    meta_path = root / "snapshots" / "TST-S-0005.meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    meta["record_url"] = "https://catalog.archives.gov/proxy/records/search?naId=9999"
    meta_path.write_text(json.dumps(meta), encoding="utf-8")
    report = validate.validate_inductee(paths.inductee_paths("testperson", tmp_path))
    assert any("record_url" in msg for _, msg in report.errors)


# --- USPTO Patent Public Search ------------------------------------------------------------------------

def ppubs_routes(body=None):
    return {("POST", PPUBS_SESSION): (200, json.dumps({"userSessionId": 1}), {"X-Access-Token": "tok-123"}),
            ("GET", PPUBS_API): (200, body or ppubs_json())}


def test_uspto_snapshot_is_the_record_fields_and_full_text(tmp_path, net):
    root = world(tmp_path, "TST-S-0006", PPUBS_URL, PPUBS_API)
    fake = net(ppubs_routes())
    assert run(tmp_path, "TST-S-0006") == 0
    session, record = fake.requests
    assert (session.get_method(), session.full_url) == ("POST", PPUBS_SESSION)
    assert record.get_header("X-access-token") == "tok-123"  # anonymous session of the public site
    assert record.get_header("User-agent") == fs.USER_AGENT
    text = (root / "snapshots" / "TST-S-0006.txt").read_text(encoding="utf-8")
    assert text == (
        "guid: US-1234567-A\npublicationReferenceDocumentNumber: 1234567\ninventionTitle: Example apparatus\n"
        "type: USOCR\ndatabaseName: USOC\ndatePublished: 1940-08-11T00:00:00Z\n"
        "applicationFilingDate: 1939-06-10T00:00:00Z\ninventorsName: PERSONA TESTA; EXAMPLE ALEX\n"
        "kindCode: A\npageCount: 3\n"
        "descriptionHtml:\nUNITED STATES PATENT OFFICE\n(1) 1,234,567\nEXAMPLE APPARATUS\n"
        "(2) Testa Persona, Example City\n(3) An object of the invention is simple.\n"
        "claimsHtml:\nWe claim:\n1. An example apparatus.\n")
    assert "tok-123" not in text
    meta = json.loads((root / "snapshots" / "TST-S-0006.meta.json").read_text(encoding="utf-8"))
    assert (meta["method"], meta["fetch_url"]) == ("api", PPUBS_API)
    assert "tok-123" not in json.dumps(meta)
    report = validate.validate_inductee(paths.inductee_paths("testperson", tmp_path))
    assert report.errors == []
    q = "Testa Persona, Example City"
    assert normalize.contains_normalized(normalize.normalize_text(text), normalize.normalize_text(q))


def test_uspto_answer_for_another_patent_is_refused(tmp_path, net):
    root = world(tmp_path, "TST-S-0006", PPUBS_URL, PPUBS_API)
    net(ppubs_routes(ppubs_json(guid="US-7654321-A")))
    assert run(tmp_path, "TST-S-0006") == 1
    assert not (root / "snapshots" / "TST-S-0006.txt").exists()


def test_uspto_without_a_session_token_saves_nothing(tmp_path, net):
    root = world(tmp_path, "TST-S-0006", PPUBS_URL, PPUBS_API)
    routes = ppubs_routes()
    routes[("POST", PPUBS_SESSION)] = (200, "{}")
    net(routes)
    assert run(tmp_path, "TST-S-0006") == 1
    assert not (root / "snapshots" / "TST-S-0006.txt").exists()


def test_api_snapshots_from_the_new_adapters_pass_g10_when_the_live_page_is_unreachable(tmp_path, net):
    from types import SimpleNamespace
    root = world(tmp_path, "TST-S-0006", PPUBS_URL, PPUBS_API)
    net(ppubs_routes())
    assert run(tmp_path, "TST-S-0006") == 0
    rec = fx.by_id(fx.read_rows(root, "sources"), "TST-S-0006")
    record = {"evidence": [{"source_id": "TST-S-0006", "quote": "Example apparatus"}],
              "adversary": {"quote_in_live": "unreachable"}}
    assert gates.g10_snapshot_integrity(record, SimpleNamespace(sources={"TST-S-0006": rec})) == []
