"""Polite HTTP (tools/ihh/polite.py). No network: a fake opener stands in for urllib."""

import hashlib
import io
import json
import urllib.error
import urllib.parse

import pytest

from ihh import polite

HOSTS = ("www.loc.gov", "catalog.archives.gov")


class Resp:
    def __init__(self, body, status=200):
        self.body, self.status = body, status

    def read(self):
        return self.body

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


class Opener:
    def __init__(self, *responses):
        self.responses, self.requests = list(responses), []

    def __call__(self, req, timeout=None):
        self.requests.append(req)
        r = self.responses.pop(0)
        if isinstance(r, Exception):
            raise r
        return r


def state():
    return {"searches_used": 0, "blocked_hosts": {}, "last_request": {}}


def client(opener, st=None, budget=10, now=None, slept=None):
    clock = (lambda: now[0]) if now else (lambda: 1000.0)
    sleep = (lambda s: slept.append(s)) if slept is not None else (lambda s: None)
    return polite.PoliteClient(st or state(), budget, HOSTS, opener=opener, clock=clock, sleep=sleep, hashes=frozenset())


def http_error(code):
    return urllib.error.HTTPError("https://www.loc.gov/x", code, "no", {}, io.BytesIO(b""))


def test_sends_the_descriptive_user_agent_and_parses_json():
    op = Opener(Resp(b'{"ok": 1}'))
    assert client(op).get_json("https://www.loc.gov/search/?q=x&fo=json") == {"ok": 1}
    ua = op.requests[0].get_header("User-agent")
    assert ua == polite.USER_AGENT and "@" not in ua


def test_spacing_per_host():
    now, slept = [1000.0], []
    op = Opener(Resp(b"{}"), Resp(b"{}"), Resp(b"{}"))
    c = client(op, now=now, slept=slept)
    c.get_json("https://www.loc.gov/a?fo=json")
    now[0] = 1001.0
    c.get_json("https://www.loc.gov/b?fo=json")
    c.get_json("https://catalog.archives.gov/proxy/records/search?q=x")
    assert slept == [pytest.approx(3.0)]


@pytest.mark.parametrize("resp", [http_error(403), http_error(429), Resp(b"<html>Just a moment...</html>")])
def test_blocked_host_is_not_asked_again(resp):
    st = state()
    op = Opener(resp)
    with pytest.raises(polite.Blocked):
        client(op, st).get_json("https://www.loc.gov/a?fo=json")
    assert "www.loc.gov" in st["blocked_hosts"]
    with pytest.raises(polite.Refused, match="blocked earlier in this run"):
        client(Opener(), st).get_json("https://www.loc.gov/b?fo=json")


def test_personal_data_is_refused_before_any_request():
    op = Opener()
    with pytest.raises(polite.Refused, match="email"):
        client(op).get_json("https://www.loc.gov/search/?q=someone%40example.org&fo=json")
    token = "zebedeeexample"
    c = polite.PoliteClient(state(), 10, HOSTS, opener=op, sleep=lambda s: None,
                            hashes=frozenset({hashlib.sha256(token.encode()).hexdigest()}))
    with pytest.raises(polite.Refused, match="personal"):
        c.get_json(f"https://www.loc.gov/search/?q=Zebedeeexample+papers&fo=json")
    assert op.requests == []


def test_hosts_scheme_and_budget():
    op = Opener(Resp(b"{}"))
    with pytest.raises(polite.Refused, match="not a search host"):
        client(op).get_json("https://example.org/x")
    with pytest.raises(polite.Refused, match="https"):
        client(op).get_json("http://www.loc.gov/x")
    st = state()
    st["searches_used"] = 10
    with pytest.raises(polite.Refused, match="budget"):
        client(op, st, budget=10).get_json("https://www.loc.gov/x?fo=json")
    assert op.requests == []


def test_other_failures():
    with pytest.raises(polite.FetchFailed):
        client(Opener(http_error(500))).get_json("https://www.loc.gov/x?fo=json")
    with pytest.raises(polite.FetchFailed):
        client(Opener(Resp(b"not json"))).get_json("https://www.loc.gov/x?fo=json")


def test_default_hashes_file_loads():
    assert polite.load_hashes()  # tools/tests/privacy_hashes.txt has entries


class BrokenResp(Resp):
    def read(self):
        import http.client
        raise http.client.IncompleteRead(b"{", 100)


def test_a_cut_off_response_is_a_failure_not_a_crash():
    # found by the 2026-11-01 Lamarr dry run: a large loc.gov answer cut off mid-read crashed the CLI
    st = state()
    with pytest.raises(polite.FetchFailed, match="cut off"):
        client(Opener(BrokenResp(b"")), st).get_json("https://www.loc.gov/x?fo=json")
    assert st["searches_used"] == 1 and "www.loc.gov" in st["last_request"]


@pytest.mark.parametrize("target", ["https://evil.example.org/x", "http://www.loc.gov/x",
                                    "https://www.loc.gov/x?q=someone%40example.org"])
def test_a_redirect_must_pass_the_same_checks(target):
    # Codex review 2026-11-01: the host and https checks applied only to the first URL
    import urllib.request
    c = polite.PoliteClient(state(), 10, HOSTS, sleep=lambda s: None, hashes=frozenset())
    handler = polite.CheckedRedirect(c.check_target)
    req = urllib.request.Request("https://www.loc.gov/a?fo=json")
    with pytest.raises(polite.FetchFailed, match="redirect"):
        handler.redirect_request(req, None, 302, "Found", {}, target)
    # round 2: a followed redirect is a second request outside the pacing, budget and block bookkeeping,
    # so no redirect is followed, even on the same host; the target is reported for a new, logged search
    with pytest.raises(polite.FetchFailed, match="not followed"):
        handler.redirect_request(req, None, 302, "Found", {}, "https://www.loc.gov/b?fo=json")


def test_the_default_opener_checks_redirects():
    c = polite.PoliteClient(state(), 10, HOSTS, sleep=lambda s: None, hashes=frozenset())
    assert any(isinstance(h, polite.CheckedRedirect) for h in c.opener.__self__.handlers)


def test_a_block_closes_the_whole_holder_domain():
    # Codex review round 3: one snapshot may request two hosts of a holder (www.loc.gov, tile.loc.gov)
    st = state()
    st["blocked_hosts"]["tile.loc.gov"] = "HTTP 429"
    with pytest.raises(polite.Refused, match="blocked earlier"):
        client(Opener(), st).get_json("https://www.loc.gov/x?fo=json")
    assert polite.blocked_reason(st["blocked_hosts"], "www.wikidata.org") is None


class UnreadableError(urllib.error.HTTPError):
    def __init__(self, code, exc):
        super().__init__("https://www.loc.gov/x", code, "no", {}, io.BytesIO(b""))
        self.exc = exc

    def read(self, *a):
        raise self.exc


@pytest.mark.parametrize("code", [403, 429])
@pytest.mark.parametrize("exc", [OSError("reset"), __import__("http.client").client.IncompleteRead(b"", 10)])
def test_a_block_whose_error_body_cannot_be_read_still_blocks_the_host(code, exc):
    # Codex review round 5: reading the 403/429 body raised before blocked_hosts was set
    st = state()
    with pytest.raises(polite.Blocked):
        client(Opener(UnreadableError(code, exc)), st).get_json("https://www.loc.gov/a?fo=json")
    assert st["blocked_hosts"]["www.loc.gov"].startswith(f"HTTP {code}")
    with pytest.raises(polite.Refused, match="blocked earlier in this run"):
        client(Opener(), st).get_json("https://www.loc.gov/b?fo=json")


def test_an_unreadable_other_error_body_is_a_failure_not_a_crash():
    st = state()
    with pytest.raises(polite.FetchFailed, match="HTTP 500"):
        client(Opener(UnreadableError(500, OSError("reset"))), st).get_json("https://www.loc.gov/a?fo=json")
    assert st["blocked_hosts"] == {}


@pytest.mark.parametrize("text", ["person%40example.com", "person%2540example.com", "person%252540example.com",
                                  "person%25252540example.com"])
def test_an_email_hidden_by_repeated_percent_encoding_is_refused(text):
    # Codex review round 7: the check decoded once, so a twice-encoded @ passed and left the machine
    assert polite.privacy_problems(text, frozenset()) == ["contains an email address"]
    op = Opener()
    with pytest.raises(polite.Refused):
        client(op).get_json("https://www.loc.gov/search/?q=" + text + "&fo=json")
    assert op.requests == []


def test_a_challenge_after_the_first_8_kb_of_a_non_json_answer_still_blocks():
    st = state()
    body = b"<html><body>" + b"x " * 6000 + b"<script src='/cdn-cgi/challenge-platform/x'></script></body></html>"
    with pytest.raises(polite.Blocked):
        client(Opener(Resp(body)), st).get_json("https://www.loc.gov/a?fo=json")
    assert "bot challenge" in st["blocked_hosts"]["www.loc.gov"]


def test_a_json_answer_that_quotes_challenge_words_is_not_a_block():
    # newspaper OCR in a search answer may say "attention required"; a JSON answer is never a challenge page
    st = state()
    body = json.dumps({"results": [{"title": "Immediate attention required, captcha"}]}).encode()
    assert client(Opener(Resp(body)), st).get_json("https://www.loc.gov/a?fo=json")["results"]
    assert st["blocked_hosts"] == {}


def encode(text, times):
    for _ in range(times):
        text = urllib.parse.quote(text, safe="")
    return text


@pytest.mark.parametrize("times", [9, 10, 12, 20])
def test_an_email_encoded_more_than_eight_times_is_refused(times):
    # Codex review round 8: decoding stopped after eight passes, so a nine-times encoded email passed
    text = encode("person@example.com", times)
    assert polite.privacy_problems(text, frozenset()) == ["contains an email address"]
    op = Opener()
    with pytest.raises(polite.Refused):
        client(op).get_json("https://www.loc.gov/search/?q=" + text + "&fo=json")
    assert op.requests == []


def test_a_denied_token_encoded_many_times_is_refused():
    hashes = frozenset({hashlib.sha256(b"secretname").hexdigest()})
    hidden = "".join(f"%{b:02X}" for b in b"secretname")  # every letter percent-encoded, then 14 more times
    assert polite.privacy_problems(encode(hidden, 14), hashes) == ["contains 1 denied personal token(s)"]


@pytest.mark.parametrize("text", [
    "%" + "25" * (getattr(polite, "MAX_DECODINGS", 32) + 5) + "41",  # each pass peels one layer: never settles within the cap
    "a" * (getattr(polite, "MAX_CHECK_CHARS", 8192) + 1),               # too long to check
], ids=["unsettled", "oversize"])
def test_input_that_does_not_settle_within_the_cap_is_refused(text):
    problems = polite.privacy_problems(text, frozenset())
    assert len(problems) == 1 and ("did not settle" in problems[0] or "too long" in problems[0])
    op = Opener()
    with pytest.raises(polite.Refused, match="nothing sent"):
        client(op).get_json("https://www.loc.gov/search/?q=" + text + "&fo=json")
    assert op.requests == []


def test_ordinary_queries_still_pass_the_privacy_check():
    for text in ("Lamarr 1940 Vienna", "q=hedy+lamarr&fo=json", "100%25 cotton", "%zz broken escape"):
        assert polite.privacy_problems(text, frozenset()) == []


@pytest.mark.parametrize("payload", [
    {"error": "captcha required"},
    {"error": {"code": "bot_challenge", "message": "Verify you are human"}},
    {"errors": [{"message": "Challenge required"}]},
    {"message": "Automated (bot) traffic detected"},
    {"captcha": {"site_key": "x"}},
    {"challenge_url": "https://www.loc.gov/verify"},
    {"status": "blocked: suspected robot"},
    # Codex review round 9: markers nested below the first level of an envelope field
    {"error": {"details": {"captcha": "required"}}},
    {"error": {"details": {"reason": "bot traffic"}}},
    {"errors": [{"meta": {"info": ["please solve the challenge"]}}]},
    {"error": {"a": {"b": {"c": {"d": "captcha"}}}}},
    {"response": {"error": {"details": {"captcha": "required"}}}},
    {"error": {"details": [[{"kind": "robot check"}]]}},
])
def test_a_json_challenge_answer_blocks_the_host(payload):
    # Codex review round 8: a 200 JSON answer such as {"error": "captcha required"} returned without a block
    st = state()
    with pytest.raises(polite.Blocked, match="not bypassed"):
        client(Opener(Resp(json.dumps(payload).encode())), st).get_json("https://www.loc.gov/a?fo=json")
    assert "challenge" in st["blocked_hosts"]["www.loc.gov"]
    op = Opener()
    with pytest.raises(polite.Refused, match="blocked earlier"):
        client(op, st).get_json("https://www.loc.gov/b?fo=json")
    assert op.requests == []


@pytest.mark.parametrize("payload", [
    {"results": [{"title": "Captcha the robot: a bot challenge", "description": ["attention required"]}]},
    {"status": 200, "pagination": {"of": 3}, "results": [{"title": "The bottle factory"}]},
    {"message": "ok", "items": [{"error": "captcha"}]},
    [{"title": "captcha"}],
    {"error": None, "results": []},
    {"results": [{"error": {"details": {"captcha": "in a title"}}}], "pagination": {"next": None}},
    {"data": {"items": [{"status": "challenge cup winner", "message": "bot"}]}},
    {"error": {"details": {"field": "q", "hint": "query too short"}}},
])
def test_ordinary_json_answers_are_not_blocks(payload):
    st = state()
    assert client(Opener(Resp(json.dumps(payload).encode())), st).get_json("https://www.loc.gov/a?fo=json") == payload
    assert st["blocked_hosts"] == {}


def test_an_error_envelope_too_deep_or_large_to_check_blocks_the_host():
    # the nested scan is bounded; an error envelope past the bound is not passed unchecked
    deep = {"x": "ok"}
    for _ in range(getattr(polite, "MAX_ENVELOPE_DEPTH", 8) + 4):
        deep = {"details": deep}
    wide = {"errors": [{"message": "x"}] * (getattr(polite, "MAX_ENVELOPE_NODES", 2000) + 10)}
    for payload in ({"error": deep}, wide):
        st = state()
        with pytest.raises(polite.Blocked, match="not bypassed"):
            client(Opener(Resp(json.dumps(payload).encode())), st).get_json("https://www.loc.gov/a?fo=json")
        assert "too large" in st["blocked_hosts"]["www.loc.gov"]


def test_a_deep_ordinary_result_is_not_scanned_or_blocked():
    deep = {"title": "captcha"}
    for _ in range(50):
        deep = {"inner": deep}
    payload = {"results": [deep] * 3000}
    st = state()
    assert client(Opener(Resp(json.dumps(payload).encode())), st).get_json("https://www.loc.gov/a?fo=json") == payload
    assert st["blocked_hosts"] == {}
