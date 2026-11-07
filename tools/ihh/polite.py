"""Polite HTTP for the tour-research step (SPEC section 12).

Every search request goes through PoliteClient: https only, to an allowed search host, with the
User-Agent fetch_snapshot.py sends (no name, no email), at least MIN_INTERVAL seconds after the
last request to the same host, within the run's search budget, and never with personal data in
the URL. HTTP 403 or 429, or a bot-challenge page, marks the host blocked for the whole run: the
request is not retried, not re-sent with other headers, and not routed through a browser.
"""

import hashlib
import http.client
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

USER_AGENT = "IHH-verified-facts/1.0 (research; contact via project)"
MIN_INTERVAL = 4.0
BLOCK_STATUSES = (403, 429)
CHALLENGE = re.compile(rb"cf-chl|challenge-platform|just a moment\.\.\.|attention required|captcha", re.I)
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
TOKEN = re.compile(r"[a-z0-9]+")
# A JSON answer can be a challenge too ({"error": "captcha required"}). Only its envelope is read (see
# json_challenge): keys, status/error fields and the objects that wrap them. Result lists (titles, OCR) may
# quote any words and are never read.
JSON_SIGNAL = re.compile(r"captcha|challenge|(?<![a-z])(?:ro)?bots?(?![a-z])", re.I)
JSON_SIGNAL_FIELDS = ("error", "errors", "message", "messages", "status", "detail", "reason", "code")
DEFAULT_HASHES = Path(__file__).resolve().parents[1] / "tests" / "privacy_hashes.txt"


class Blocked(Exception):
    """The host refused (403, 429, bot challenge). Not retried in this run."""


class Refused(Exception):
    """Refused locally; no request was sent."""


class FetchFailed(Exception):
    """Any other failure (network, HTTP status, not JSON)."""


def load_hashes(path=DEFAULT_HASHES):
    """SHA-256 hashes of lowercased personal tokens that must never leave the machine."""
    p = Path(path)
    if not p.is_file():
        return frozenset()
    return frozenset(l.strip() for l in p.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#"))


# Decoding runs to a fixed point. Each pass that changes the text shortens it or turns '+' into spaces, so
# honest text settles in a few passes; text still changing after MAX_DECODINGS passes, or longer than
# MAX_CHECK_CHARS, cannot be checked and is refused (nothing is sent), never passed half-checked.
MAX_DECODINGS = 32
MAX_CHECK_CHARS = 8192


class Unsettled(ValueError):
    """The text is too long to check, or has not settled under percent/plus decoding within the cap."""


def decoded_forms(text, max_decodings=MAX_DECODINGS, max_chars=MAX_CHECK_CHARS):
    """The text and every percent/plus decoding of it, up to its fixed point, so personal data hidden by
    repeated encoding (person%2540example.com) is seen as the server may read it. Raises Unsettled when
    the text is longer than max_chars or still changes after max_decodings decodings."""
    if len(text) > max_chars:
        raise Unsettled(f"is too long to check ({len(text)} characters; the limit is {max_chars})")
    forms = [text]
    for _ in range(max_decodings + 1):
        nxt = urllib.parse.unquote_plus(forms[-1])
        if nxt == forms[-1]:
            return forms
        forms.append(nxt)
    raise Unsettled(f"did not settle after {max_decodings} percent decodings (possible hidden personal data)")


def privacy_problems(text, hashes):
    try:
        forms = decoded_forms(text)
    except Unsettled as e:
        return [str(e)]
    out = []
    if any(EMAIL.search(f) for f in forms):
        out.append("contains an email address")
    hits = {t for f in forms for t in TOKEN.findall(f.lower()) if hashlib.sha256(t.encode()).hexdigest() in hashes}
    if hits:
        out.append(f"contains {len(hits)} denied personal token(s)")
    return out


# The envelope scan is bounded: it reads at most MAX_ENVELOPE_NODES values, MAX_ENVELOPE_DEPTH levels deep.
# An error envelope that does not fit is reported as a signal (the host is blocked), never passed unchecked.
MAX_ENVELOPE_DEPTH = 8
MAX_ENVELOPE_NODES = 2000


class _TooLarge(Exception):
    pass


def _walk_envelope(value, depth, budget):
    """Every key and string inside one envelope field, at any depth (lists included). budget is a one-item
    list counting the values read; _TooLarge when the field passes the depth or size bound."""
    budget[0] += 1
    if depth > MAX_ENVELOPE_DEPTH or budget[0] > MAX_ENVELOPE_NODES:
        raise _TooLarge
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for k, x in value.items():
            yield str(k)
            yield from _walk_envelope(x, depth + 1, budget)
    elif isinstance(value, list):
        for x in value:
            yield from _walk_envelope(x, depth + 1, budget)


def _envelope_signal(obj, depth, budget):
    """The signal in one object of the envelope. Its keys are read, its status/error fields are read whole,
    and its other object fields are entered (a wrapper such as {"response": {"error": ...}}). Lists outside an
    error field are results and are never read: their titles and OCR may quote any words."""
    for key, value in obj.items():
        if JSON_SIGNAL.search(str(key)):
            return str(key)[:120]
        if str(key).lower() in JSON_SIGNAL_FIELDS:
            try:
                for text in _walk_envelope(value, depth + 1, budget):
                    if JSON_SIGNAL.search(text):
                        return text[:120]
            except _TooLarge:
                return f"error field {key!r} too large or deep to check"
    if depth < MAX_ENVELOPE_DEPTH:
        for key, value in obj.items():
            if isinstance(value, dict) and str(key).lower() not in JSON_SIGNAL_FIELDS:
                hit = _envelope_signal(value, depth + 1, budget)
                if hit:
                    return hit
    return None


def json_challenge(data):
    """The envelope text that names a captcha, a challenge or a bot, or None. Read: object keys, the
    status/error fields at any depth, and objects that wrap them; never the result lists an answer carries."""
    if not isinstance(data, dict):
        return None
    return _envelope_signal(data, 0, [0])


def unquote(url):
    """The URL as text a person would read (percent and plus decoding), for the privacy check."""
    return urllib.parse.unquote_plus(url)


def holder_domain(host):
    """The last two labels of a host (tile.loc.gov -> loc.gov): one holder's hosts share it."""
    labels = [x for x in (host or "").lower().split(".") if x]
    return ".".join(labels[-2:]) if len(labels) >= 2 else (host or "").lower()


def blocked_reason(blocked, host):
    """(blocked host, reason) when host or another host of its holder domain was blocked in this run.
    A block closes the whole domain: one snapshot may request two hosts of a holder (a LoC page and its
    OCR text), and the error names only the first URL."""
    for h, reason in (blocked or {}).items():
        if h == host or holder_domain(h) == holder_domain(host):
            return h, reason
    return None


def wait_turn(last, host, min_interval=MIN_INTERVAL, clock=time.time, sleep=time.sleep):
    prev = last.get(host)
    if isinstance(prev, (int, float)):
        wait = prev + min_interval - clock()
        if wait > 0:
            sleep(wait)


class CheckedRedirect(urllib.request.HTTPRedirectHandler):
    """Never follows a redirect: a target that fails the first URL's checks is refused, and any other is
    reported (not requested), so every request is paced, counted and attributed to its own host."""

    def __init__(self, check):
        super().__init__()
        self.check = check

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        try:
            self.check(newurl)
        except Refused as e:
            raise FetchFailed(f"redirect to {newurl} refused: {e}") from None
        # a followed redirect would be a second request outside the pacing, budget and block bookkeeping
        raise FetchFailed(f"HTTP {code} redirect to {newurl} not followed; search that URL as its own logged request")


class PoliteClient:
    def __init__(self, state, budget, allowed_hosts, opener=None, clock=time.time, sleep=time.sleep,
                 hashes=None, min_interval=MIN_INTERVAL, timeout=60, on_send=None):
        self.state, self.budget, self.allowed = state, budget, frozenset(allowed_hosts)
        # called after the request is counted and its host clock set, before it leaves: the caller saves
        # the state there, so a process killed mid-request still has the request counted and spaced
        self.on_send = on_send or (lambda: None)
        self.opener = opener or urllib.request.build_opener(CheckedRedirect(self.check_target)).open
        self.clock, self.sleep, self.min_interval, self.timeout = clock, sleep, min_interval, timeout
        self.hashes = load_hashes() if hashes is None else hashes
        for key, default in (("searches_used", 0), ("blocked_hosts", {}), ("last_request", {})):
            state.setdefault(key, default)

    def check_target(self, url):
        """Refused unless the URL may be requested: https, an allowed search host not blocked in this run,
        and no personal data. Applied to the first URL and to every redirect target."""
        parts = urllib.parse.urlsplit(url)
        host = parts.hostname or ""
        if parts.scheme != "https":
            raise Refused(f"{url}: only https requests are sent")
        if host not in self.allowed:
            raise Refused(f"{host} is not a search host this step may call")
        hit = blocked_reason(self.state["blocked_hosts"], host)
        if hit:
            raise Refused(f"{host} blocked earlier in this run ({hit[0]}: {hit[1]}); not retried")
        problems = privacy_problems(unquote(url), self.hashes)
        if problems:
            raise Refused("request " + "; ".join(problems) + "; nothing sent")
        return host

    def get_json(self, url):
        host = self.check_target(url)
        if self.state["searches_used"] >= self.budget:
            raise Refused(f"search budget of {self.budget} reached for this run")
        wait_turn(self.state["last_request"], host, self.min_interval, self.clock, self.sleep)
        self.state["searches_used"] += 1
        self.state["last_request"][host] = self.clock()
        self.on_send()
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
        try:
            with self.opener(req, timeout=self.timeout) as r:
                body, status = r.read(), r.status
        except urllib.error.HTTPError as e:
            status = e.code
            if status in BLOCK_STATUSES:
                # the status alone blocks the host, before the body is read (reading it may fail too)
                self.state["blocked_hosts"][host] = f"HTTP {status}"
            try:
                body = e.read() or b""
            except (OSError, http.client.HTTPException):
                body = b""
        except http.client.IncompleteRead as e:
            raise FetchFailed(f"{host}: the response was cut off after {len(e.partial)} bytes") from None
        except (urllib.error.URLError, OSError, http.client.HTTPException) as e:
            raise FetchFailed(f"{host}: {type(e).__name__}: {e}") from None
        finally:
            self.state["last_request"][host] = self.clock()
        data = None
        if status == 200:
            try:
                data = json.loads(body.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError):
                data = None
            else:
                signal = json_challenge(data)
                if signal is None:
                    return data
                reason = f"HTTP 200 with a bot challenge in the JSON answer ({signal!r})"
                self.state["blocked_hosts"][host] = reason
                raise Blocked(f"{host}: {reason}; not bypassed")
        # any other answer is searched whole for a challenge, not only its first bytes
        challenge = bool(CHALLENGE.search(body))
        if status in BLOCK_STATUSES or challenge:
            reason = f"HTTP {status}" + (" with a bot challenge page" if challenge else "")
            self.state["blocked_hosts"][host] = reason
            raise Blocked(f"{host}: {reason}; not bypassed")
        if status != 200:
            raise FetchFailed(f"{host}: HTTP {status}")
        raise FetchFailed(f"{host}: the response is not JSON")
