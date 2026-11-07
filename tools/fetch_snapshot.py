"""Fetch a source and save its text snapshot (SPEC sections 2, 3.2 and 6).

    python3 tools/fetch_snapshot.py <slug> <SRC> [--force] [--timeout SECONDS] [--data-dir DIR]
    python3 tools/fetch_snapshot.py <slug> <SRC> --from-file PATH --method browser|manual

<SRC> is either a permanent source id in sources.jsonl (LAM-S-0003) or the
temporary id of a source staged in staging/*.jsonl (tmp-loc-S-1; see
ihh/staging.py). The snapshot is written to

    snapshots/<SRC>.txt and snapshots/<SRC>.meta.json                 permanent id
    staging/snapshots/<SRC>.txt and staging/snapshots/<SRC>.meta.json temporary id
                                         (merge_staging.py moves them on merge)

and the source record is updated in place: snapshot, snapshot_sha256,
fetch_method, accessed (the fetch date, UTC), and fetch_url when it was empty
and an adapter derived a machine-readable endpoint. The meta file holds
{url, fetch_url, method, fetched_at, sha256, bytes, http_status, final_url} and,
for a LoC newspaper page, full_text_url;
sha256 and bytes describe the .txt file exactly as saved, and final_url is where
the request ended after redirects (null for --from-file).

What is fetched: the record's fetch_url if set, else its url, rewritten by the
first adapter that matches the host. A snapshot must be fetched from the cited
record itself: a fetch_url must be the url (a fragment and the format parameters
fo=json and format=json may differ) or the endpoint an adapter below derives from
the url (ihh/fetchplan.py fetch_url_problem; validate re-derives it). Any other
fetch_url, including another page on the same site, is refused (exit 1). A
redirect is followed only to a canonical URL naming the same record
(fetchplan.same_record: query order, a leading www., a default port and a
trailing slash aside); a redirect anywhere else exits 1 and saves nothing.

    NARA     https://catalog.archives.gov/id/<N>
             -> https://catalog.archives.gov/proxy/records/search?naId=<N>
             (Accept: application/json). The catalog record JSON becomes
             `key: value` lines, title and scopeAndContentNote first.
    LoC      loc.gov pages -> the same URL with fo=json added. Item fields
             become `key: value` lines, then resources and cite_this. A
             newspaper page record (Chronicling America) names its own OCR
             text as resource.fulltext_file: LoC's Text Services endpoint
             https://tile.loc.gov/text-services/word-coordinates-service?
             segment=<page>.xml&format=alto_xml&full_text=1. That text is
             fetched too and kept after the record's lines, under
             `full_text_url: <url>` and `full_text:`; the meta file records the
             URL as full_text_url (the gates check it is that endpoint).
    Commons  https://commons.wikimedia.org/wiki/File:<name>
             -> the API's imageinfo extmetadata (LicenseShortName, UsageTerms,
             Artist, Credit, ...), one `Key: value` line per field.
    Patents  https://patents.google.com/patent/<number>/<lang>: the HTML page
             as text.
    NARA page transcriptions (owner approval 2026-10-16)
             url https://catalog.archives.gov/id/<N> with fetch_url
             https://catalog.archives.gov/proxy/contributions/targetNaId/<N>: the
             record's active page transcriptions (Citizen Archivist contributions
             shown on the catalog page), read with the record's own JSON (meta
             record_url) for its title and page file names. The snapshot is
             `title:`, `naId:`, then per page `objectId:`, `objectFilename:`,
             `transcription.updatedAt:` and `transcription:` followed by the text as
             served, pages in the record's order. Contributions for another record
             are refused; a record with no active transcription saves nothing.
    USPTO Patent Public Search (owner approval 2026-10-16)
             url https://ppubs.uspto.gov/pubwebapp/external.html?q=<number>.pn.&db=<DB>
             with fetch_url https://ppubs.uspto.gov/api/patents/highlight/US-<number>-<kind>
             ?queryId=1&source=<DB>&includeSections=true. The public site's session
             endpoint issues an anonymous token (no account, no key; never saved);
             the record JSON becomes its bibliographic fields as `key: value` lines,
             then abstractHtml, descriptionHtml and claimsHtml as text. An answer for
             another patent is refused.
    other    JSON responses become `key: value` lines; HTML becomes text.

Nested JSON keys are written as paths (ancestors[0].title), which is what an
evidence locator should name. HTML is turned into text with scripts, styles
and similar non-content elements removed and entities unescaped; HTML inside
JSON string values is converted the same way. Line endings are unified,
trailing spaces dropped and runs of blank lines collapsed; nothing else in the
text is changed.

fetch_method is `api` when the response was JSON and `http` when it was HTML or
plain text. --from-file takes text that an agent or person copied from the page
(.html and .json files are converted as above) and records method `browser` or
`manual`; such snapshots need the adversary to find the quote live (G10).

Every request sends the User-Agent "IHH-verified-facts/1.0 (research; contact via
project)". A source that already has a snapshot is not replaced unless --force
is given, because facts quoting the old text would then have to pass G1 again.

Exit codes:
  0  snapshot saved and the source record updated
  1  error (unknown source, network failure, other HTTP errors, unsupported
     content, refused overwrite, or a usage mistake)
  2  the site blocked the request (HTTP 403 or 429, a bot challenge) or sent a
     page that is only a JavaScript shell. Open the page in a browser, save its
     text unmodified (staging/browser/<SRC>.txt by convention) and run again
     with --from-file <that file> --method browser.
Usage mistakes exit 1, never 2, so that 2 always means "use the browser".
"""

import argparse
import datetime
import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from ihh import fetchplan, ids, paths, records, staging, textfiles, urls

USER_AGENT = "IHH-verified-facts/1.0 (research; contact via project)"
MAX_BYTES = 25 * 1024 * 1024
MIN_WORDS = 50           # fewer visible words than this: a JavaScript shell
JS_HINT_WORDS = 100      # with a "please enable JavaScript" notice, this many
BLOCKED_STATUSES = (403, 429)
JSON_ADAPTERS = ("nara", "loc", "commons")
GENERIC_ACCEPT = fetchplan.GENERIC_ACCEPT


class FetchError(Exception):
    """The source could not be fetched or converted (exit 1)."""


class Blocked(Exception):
    """The site refused the request or sent a JavaScript-only page (exit 2)."""


class UsageError(Exception):
    pass


# --- planning ------------------------------------------------------------------------------

Plan = fetchplan.Plan


def plan_fetch(source):
    """What to request for a source record (fetch_url if set, else url, through the adapters)."""
    try:
        return fetchplan.plan_fetch(source)
    except fetchplan.PlanError as exc:
        raise FetchError(str(exc)) from exc


# --- HTTP ----------------------------------------------------------------------------------------

@dataclass
class Response:
    status: int
    content_type: str
    charset: str | None
    body: bytes
    final_url: str | None = None  # where the request ended after redirects (the same record)
    headers: object = None        # the response headers (email.message.Message), when sent


class Pacer:
    """Spaces the requests this process makes (--pace SECONDS): each request, a followed redirect
    included, starts at least that long after the previous one started. 0 (the default) never waits."""

    def __init__(self, interval=0.0, clock=None, sleep=None):
        self.interval, self.last = interval, None
        self.clock, self.sleep = clock or time.monotonic, sleep or time.sleep

    def wait(self):
        if self.interval > 0 and self.last is not None:
            delay = self.last + self.interval - self.clock()
            if delay > 0:
                self.sleep(delay)
        self.last = self.clock()


_PACER = Pacer()


class _HttpOnlyRedirects(urllib.request.HTTPRedirectHandler):
    """Follow a redirect only to a canonical http(s) URL (ihh.urls) that names the same record
    as the request (fetchplan.same_record, against req.ihh_record set by http_get): a snapshot
    is taken from the cited record itself, never from where an open redirect, a link resolver
    or a merged record sends the request."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        bad = urls.problem(newurl)
        if bad:
            raise urllib.error.URLError(f"refused redirect: {bad}")
        expected = getattr(req, "ihh_record", None)
        if expected is not None and not fetchplan.same_record(newurl, expected):
            raise urllib.error.URLError(f"refused redirect to {newurl}, which is not the record requested "
                                        f"({expected})")
        new = super().redirect_request(req, fp, code, msg, headers, newurl)
        if new is not None:
            new.ihh_record = expected
            _PACER.wait()  # the redirect is a request of its own
        return new


_OPENER = urllib.request.build_opener(_HttpOnlyRedirects)


def _urlopen(request, timeout):
    """The one place that touches the network (tests replace it).

    plan_fetch() has already refused every scheme but http and https, and
    _HttpOnlyRedirects keeps redirects to those schemes.
    """
    return _OPENER.open(request, timeout=timeout)


_CHALLENGE = re.compile(rb"cf-chl|challenge-platform|just a moment\.\.\.|attention required|captcha",
                        re.IGNORECASE)


def http_get(plan, timeout=60, data=None, headers=None):
    """GET plan.fetch_url (POST when data is given), following redirects only to the same record."""
    request = urllib.request.Request(plan.fetch_url, data=data,
                                     headers={"User-Agent": USER_AGENT, "Accept": plan.accept, **(headers or {})},
                                     method="POST" if data is not None else "GET")
    request.ihh_record = plan.fetch_url
    _PACER.wait()
    try:
        with _urlopen(request, timeout) as resp:
            final_url = (resp.geturl() if hasattr(resp, "geturl") else None) or plan.fetch_url
            if not fetchplan.same_record(final_url, plan.fetch_url):
                raise FetchError(f"was redirected to {final_url}, which is not the cited record; cite that "
                                 f"record's own url if it is the right one")
            status = getattr(resp, "status", None) or resp.getcode()
            content_type = resp.headers.get_content_type() if resp.headers else ""
            charset = resp.headers.get_content_charset() if resp.headers else None
            resp_headers = resp.headers
            body = resp.read(MAX_BYTES + 1)
    except urllib.error.HTTPError as exc:
        try:
            body = exc.read(64 * 1024) or b""
        except Exception:  # the error body is only a hint; its absence is not an error
            body = b""
        if exc.code in BLOCKED_STATUSES:
            raise Blocked(f"returned HTTP {exc.code}") from exc
        if exc.code == 503 and _CHALLENGE.search(body):
            raise Blocked("returned HTTP 503 with a bot challenge page") from exc
        raise FetchError(f"returned HTTP {exc.code}") from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        reason = getattr(exc, "reason", exc)
        raise FetchError(f"could not be reached ({reason})") from exc
    if len(body) > MAX_BYTES:
        raise FetchError(f"response is larger than {MAX_BYTES // (1024 * 1024)} MB")
    return Response(status=status, content_type=(content_type or "").lower(), charset=charset, body=body,
                    final_url=final_url, headers=resp_headers)


_META_CHARSET = re.compile(rb"<meta[^>]+charset=[\"']?([A-Za-z0-9_-]+)", re.IGNORECASE)


def decode(body, charset=None):
    candidates = [charset] if charset else []
    m = _META_CHARSET.search(body[:4096])
    if m:
        candidates.append(m.group(1).decode("ascii", "replace"))
    candidates.append("utf-8")
    for name in candidates:
        try:
            return body.decode(name)
        except (LookupError, UnicodeDecodeError):
            continue
    return body.decode("cp1252", errors="replace")


# --- HTML to text --------------------------------------------------------------------------------

SKIP_TAGS = {"script", "style", "noscript", "template", "svg", "iframe", "object", "canvas", "select",
             "button"}
BLOCK_TAGS = {"address", "article", "aside", "blockquote", "body", "br", "caption", "dd", "details",
              "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3",
              "h4", "h5", "h6", "header", "hr", "legend", "li", "main", "nav", "ol", "p", "pre", "section",
              "summary", "table", "tbody", "tfoot", "thead", "title", "tr", "ul"}
CELL_TAGS = {"td", "th"}


class _TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = 0
        self.pre = 0

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS:
            self.skip += 1
        elif tag in BLOCK_TAGS:
            self.parts.append("\n")
            if tag == "pre":
                self.pre += 1
        elif tag in CELL_TAGS:
            self.parts.append(" ")

    def handle_startendtag(self, tag, attrs):
        if tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS:
            self.skip = max(0, self.skip - 1)
        elif tag in BLOCK_TAGS:
            self.parts.append("\n")
            if tag == "pre":
                self.pre = max(0, self.pre - 1)
        elif tag in CELL_TAGS:
            self.parts.append(" ")

    def handle_data(self, data):
        if self.skip:
            return
        self.parts.append(data if self.pre else re.sub(r"[\r\n]+", " ", data))


def html_to_text(markup):
    """Visible text of an HTML document or fragment, one block per line."""
    parser = _TextExtractor()
    parser.feed(markup)
    parser.close()
    lines = []
    for line in "".join(parser.parts).split("\n"):
        line = re.sub(r"[ \t\f\v ]+", " ", line).strip()
        lines.append(line)
    return normalize_snapshot("\n".join(lines)).rstrip("\n")


_TAG = re.compile(r"<[A-Za-z/!][^>]*>")


def _value_text(value):
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    if _TAG.search(text):
        text = html_to_text(text)
    return text.strip()


def _words(text):
    return len(re.findall(r"\w+", text))


_JS_NOTICE = re.compile(r"enable javascript|javascript (?:is )?(?:required|disabled)|requires javascript",
                        re.IGNORECASE)


# A bot challenge may answer HTTP 200 with a long page (Codex review round 6): the challenge service's own
# markup, a challenge title, or a short page whose visible text asks the visitor to prove they are a person.
_CHALLENGE_MARKUP = re.compile(r"cf-chl|challenge-platform|cf-browser-verification|/cdn-cgi/challenge", re.IGNORECASE)
_CHALLENGE_TITLE = re.compile(r"<title[^>]*>[^<]*(just a moment|attention required|security check|verify you are "
                              r"human|are you a (robot|human)|captcha|bot verification|access denied)", re.IGNORECASE)
_CHALLENGE_TEXT = re.compile(r"captcha|verify you are (a )?human|are you a robot|not a robot|unusual traffic",
                             re.IGNORECASE)
CHALLENGE_TEXT_WORDS = 300  # a page this short whose text asks for a CAPTCHA is the challenge, not the record


def challenge_reason(markup, text):
    """Why an HTML page is a bot challenge (never bypassed: a block for the run), or None."""
    if _CHALLENGE_MARKUP.search(markup) or _CHALLENGE_TITLE.search(markup):
        return "sent a bot challenge page"
    if _words(text) < CHALLENGE_TEXT_WORDS and _CHALLENGE_TEXT.search(text):
        return "sent a bot challenge page (its text asks the visitor to prove they are a person)"
    return None


def shell_reason(markup, text):
    """Why an HTML page cannot be saved: a bot challenge, or a JavaScript-only shell; or None."""
    challenge = challenge_reason(markup, text)
    if challenge:
        return challenge
    words = _words(text)
    if words < MIN_WORDS:
        return f"sent a page with almost no text ({words} words); it is probably built by JavaScript"
    if words < JS_HINT_WORDS and _JS_NOTICE.search(markup):
        return f"sent a page that asks for JavaScript and has only {words} words of text"
    return None


# --- JSON to key: value lines ---------------------------------------------------------------------

def _flatten(value, path, out):
    if isinstance(value, dict):
        for key, item in value.items():
            _flatten(item, f"{path}.{key}" if path else str(key), out)
    elif isinstance(value, list):
        for i, item in enumerate(value):
            _flatten(item, f"{path}[{i}]", out)
    elif value is None:
        return
    elif isinstance(value, bool):
        out.append(f"{path}: {'true' if value else 'false'}")
    elif isinstance(value, (int, float)):
        out.append(f"{path}: {json.dumps(value)}")
    else:
        text = _value_text(value)
        if text:
            out.append(f"{path}: {text}")


def _ordered(record, first):
    out = []
    for key in first:
        if key in record:
            _flatten(record[key], key, out)
    for key, value in record.items():
        if key not in first:
            _flatten(value, str(key), out)
    return out


def _nara_records(data):
    body = data.get("body") if isinstance(data, dict) else None
    hits = body.get("hits") if isinstance(body, dict) else None
    if not isinstance(hits, dict) or not isinstance(hits.get("hits"), list):
        return None
    out = []
    for hit in hits["hits"]:
        source = hit.get("_source") if isinstance(hit, dict) else None
        record = source.get("record") if isinstance(source, dict) else None
        if isinstance(record, dict):
            out.append(record)
    return out


def _commons_lines(data):
    query = data.get("query") if isinstance(data, dict) else None
    pages = query.get("pages") if isinstance(query, dict) else None
    if not isinstance(pages, dict) or not pages:
        raise FetchError("the Commons API answer has no pages")
    out = []
    for page in pages.values():
        if not isinstance(page, dict):
            continue
        title = page.get("title")
        if "missing" in page or "invalid" in page:
            raise FetchError(f"Wikimedia Commons has no file {title!r}")
        info = page.get("imageinfo")
        meta = info[0].get("extmetadata") if isinstance(info, list) and info and isinstance(info[0], dict) else None
        if not isinstance(meta, dict):
            raise FetchError(f"the Commons API sent no extmetadata for {title!r}")
        if out:
            out.append("")
        out.append(f"title: {title}")
        for key, entry in meta.items():
            value = entry.get("value") if isinstance(entry, dict) else entry
            if value is None:
                continue
            text = _value_text(value)
            if text:
                out.append(f"{key}: {text}")
    return out


def convert_json(adapter, data):
    """Text snapshot (key: value lines) of a parsed JSON response."""
    if adapter == "nara":
        found = _nara_records(data)
        if found is not None:
            if not found:
                raise FetchError("NARA returned no record for this id")
            out = []
            for record in found:
                if out:
                    out.append("")
                out.extend(_ordered(record, ("title", "scopeAndContentNote")))
            return "\n".join(out)
    elif adapter == "loc" and isinstance(data, dict) and isinstance(data.get("item"), dict):
        out = []
        _flatten(data["item"], "", out)
        for key in ("resources", "cite_this"):
            if key in data:
                _flatten(data[key], key, out)
        return "\n".join(out)
    elif adapter == "commons":
        return "\n".join(_commons_lines(data))
    out = []
    _flatten(data, "", out)
    return "\n".join(out)


# --- NARA page transcriptions and USPTO Patent Public Search (owner approval 2026-10-16) ----------

def _json_of(resp, what):
    try:
        return json.loads(decode(resp.body, resp.charset))
    except json.JSONDecodeError:
        text = decode(resp.body, resp.charset)
        if _looks_like_html(text):
            reason = shell_reason(text, html_to_text(text))
            if reason:
                raise Blocked(reason) from None
        raise FetchError(f"{what} answered with text that is not JSON") from None


def nara_transcriptions_text(record_data, contributions, naid):
    """Snapshot text of a NARA catalog record's active page transcriptions, pages in the record's
    order. record_data is the proxy API record answer (title, page file names); contributions the
    contributions endpoint answer. Refuses an answer for another record."""
    found = _nara_records(record_data)
    if not found:
        raise FetchError("NARA returned no record for this id")
    record = found[0]
    if str(record.get("naId")) != str(naid):
        raise FetchError(f"the NARA record answer is for naId {record.get('naId')!r}, not {naid}")
    if not isinstance(contributions, list):
        raise FetchError("the NARA contributions answer is not a list")
    for c in contributions:
        if not isinstance(c, dict) or str(c.get("targetNaId")) != str(naid):
            target = c.get("targetNaId") if isinstance(c, dict) else c
            raise FetchError(f"the NARA contributions answer holds a contribution for another record ({target!r})")
    active = [c for c in contributions if c.get("contributionType") == "transcription"
              and c.get("status") == "active" and isinstance(c.get("contribution"), str)
              and c["contribution"].strip()]
    if not active:
        raise FetchError(f"NARA record {naid} has no active page transcription")
    objects = [o for o in record.get("digitalObjects") or [] if isinstance(o, dict)]
    order = {str(o.get("objectId")): i for i, o in enumerate(objects)}
    names = {str(o.get("objectId")): o.get("objectFilename") for o in objects}
    active.sort(key=lambda c: (order.get(str(c.get("targetObjectId")), len(order)), str(c.get("targetObjectId")),
                               str(c.get("updatedAt"))))
    lines = [f"title: {_value_text(record.get('title') or '')}", f"naId: {naid}"]
    for c in active:
        oid = str(c.get("targetObjectId"))
        lines += ["", f"objectId: {oid}"]
        if names.get(oid):
            lines.append(f"objectFilename: {names[oid]}")
        if c.get("updatedAt"):
            lines.append(f"transcription.updatedAt: {c['updatedAt']}")
        lines += ["transcription:", c["contribution"].replace("\r\n", "\n").replace("\r", "\n").strip("\n")]
    return normalize_snapshot("\n".join(lines))


def fetch_nara_transcriptions(plan, source, timeout):
    """(text, method, http_status, final_url, record_url) for a NARA page-transcriptions source."""
    naid = fetchplan.nara_naid(source.get("url"))
    record_url = fetchplan.nara_record_endpoint(source.get("url"))
    if naid is None or plan.fetch_url != fetchplan.nara_transcriptions_endpoint(source.get("url")):
        raise FetchError("the page-transcriptions endpoint is not the cited catalog record's")
    resp = http_get(plan, timeout)
    contributions = _json_of(resp, plan.fetch_url)
    record = _json_of(http_get(fetchplan.Plan("nara", record_url, "application/json", "api", True), timeout),
                      record_url)
    return nara_transcriptions_text(record, contributions, naid), "api", resp.status, resp.final_url, record_url


USPTO_FIELDS = ("guid", "publicationReferenceDocumentNumber", "inventionTitle", "type", "databaseName",
                "datePublished", "applicationFilingDate", "inventorsName", "kindCode", "pageCount")
USPTO_TEXT_FIELDS = ("abstractHtml", "descriptionHtml", "claimsHtml")


def uspto_text(data, guid):
    """Snapshot text of a Patent Public Search record: its bibliographic fields as key: value lines,
    then the abstract, description and claims as text. Refuses an answer for another document."""
    if not isinstance(data, dict) or data.get("guid") != guid:
        found = data.get("guid") if isinstance(data, dict) else type(data).__name__
        raise FetchError(f"Patent Public Search answered for {found!r}, not {guid!r}")
    lines = []
    for key in USPTO_FIELDS:
        value = data.get(key)
        if isinstance(value, list):
            value = "; ".join(str(v) for v in value if v not in (None, ""))
        if value not in (None, ""):
            lines.append(f"{key}: {_value_text(value)}")
    for key in USPTO_TEXT_FIELDS:
        value = data.get(key)
        if isinstance(value, str) and value.strip():
            lines.append(f"{key}:")
            lines.append(html_to_text(value))
    if not any(line.endswith(":") and line[:-1] in USPTO_TEXT_FIELDS for line in lines):
        raise FetchError(f"Patent Public Search sent no full text for {guid!r}")
    return normalize_snapshot("\n".join(lines))


def fetch_uspto(plan, source, timeout):
    """(text, method, http_status, final_url, None) for a Patent Public Search source. The anonymous
    session token the public site issues is sent with the request and never saved."""
    problem = fetchplan.ppubs_endpoint_problem(source.get("url"), plan.fetch_url)
    if problem:
        raise FetchError(problem)
    session = http_get(fetchplan.Plan("uspto-session", fetchplan.PPUBS_SESSION_URL, "application/json", "api",
                                      True), timeout, data=b"-1", headers={"Content-Type": "application/json"})
    token = session.headers.get("X-Access-Token") if session.headers is not None else None
    if not token:
        raise FetchError("Patent Public Search issued no session token")
    resp = http_get(plan, timeout, headers={"X-Access-Token": token})
    guid = urllib.parse.urlsplit(plan.fetch_url).path.rsplit("/", 1)[-1]
    return uspto_text(_json_of(resp, plan.fetch_url), guid), "api", resp.status, resp.final_url, None


SPECIAL_ADAPTERS = {"nara-transcriptions": fetch_nara_transcriptions, "uspto": fetch_uspto}


# --- conversion of a response ---------------------------------------------------------------------

def normalize_snapshot(text):
    """Unify line endings, drop trailing spaces and extra blank lines; end with one newline."""
    lines = [line.rstrip() for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
    out = []
    for line in lines:
        if not line and (not out or not out[-1]):
            continue
        out.append(line)
    while out and not out[-1]:
        out.pop()
    return "\n".join(out) + "\n" if out else ""


def _looks_like_html(text):
    head = text.lstrip()[:1024].lower()
    return head.startswith("<!doctype html") or "<html" in head or head.startswith("<")


def convert_response(plan, resp):
    """(text, fetch_method) for a fetched response. Raises Blocked or FetchError."""
    text = decode(resp.body, resp.charset)
    ctype = resp.content_type
    if "json" in ctype or plan.adapter in JSON_ADAPTERS:
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            if _looks_like_html(text):
                visible = html_to_text(text)
                reason = shell_reason(text, visible)
                if reason:
                    raise Blocked(reason) from None
            raise FetchError(f"expected JSON but got {ctype or 'unknown content'}") from None
        return normalize_snapshot(convert_json(plan.adapter, data)), "api"
    if "html" in ctype or (("xml" in ctype or not ctype) and _looks_like_html(text)):
        visible = html_to_text(text)
        reason = shell_reason(text, visible)
        if reason:
            raise Blocked(reason)
        return normalize_snapshot(visible), "http"
    if ctype.startswith("text/"):
        return normalize_snapshot(text), "http"
    raise FetchError(f"unsupported content type {ctype or 'unknown'}; extract the text yourself and run "
                     f"again with --from-file PATH --method manual")


def loc_full_text_pointer(data):
    """The URL of the page's own OCR full text named by a loc.gov page record, or None.

    A Chronicling America page record (www.loc.gov/resource/<lccn>/<date>/ed-N/?sp=<page>) names
    its OCR text as resource.fulltext_file and fulltext_service: LoC's Text Services endpoint for
    the page's segment (fetchplan.loc_full_text_problem). Both, when given, must agree, and
    segment_id (the record's own segment) must be given and be the segment the URL names, so the
    text fetched is this page's. Returns (url, segment_id); item records (photographs,
    manuscripts) name no full text: None.
    """
    if not isinstance(data, dict):
        return None
    resource = data.get("resource") if isinstance(data.get("resource"), dict) else {}
    named = [v for v in (resource.get("fulltext_file"), data.get("fulltext_service")) if v not in (None, "")]
    if not named:
        return None
    if len(set(map(str, named))) > 1:
        raise FetchError(f"the record's resource.fulltext_file and fulltext_service disagree ({named[0]!r} "
                         f"and {named[1]!r})")
    url = named[0]
    problem = fetchplan.loc_full_text_problem(url)
    if problem:
        raise FetchError(problem)
    segment = fetchplan.loc_full_text_segment(url)
    if data.get("segment_id") != segment:
        raise FetchError(f"the full-text URL names segment {segment!r}, not the record's own segment "
                         f"{data.get('segment_id')!r}")
    return url, segment


def loc_full_text(resp, url):
    """The OCR text in a LoC Text Services answer for url (one segment, its full_text)."""
    segment = fetchplan.loc_full_text_segment(url)
    try:
        data = json.loads(decode(resp.body, resp.charset))
    except json.JSONDecodeError:
        raise FetchError(f"{url} answered with text that is not JSON") from None
    if not isinstance(data, dict) or list(data) != [segment]:
        found = list(data)[:3] if isinstance(data, dict) else type(data).__name__
        raise FetchError(f"{url} answered for another segment ({found!r}), not {segment!r}")
    entry = data[segment]
    text = entry.get("full_text") if isinstance(entry, dict) else None
    if not isinstance(text, str) or not text.strip():
        raise FetchError(f"{url} sent no full_text for {segment!r}")
    return text


def add_loc_full_text(plan, resp, text, timeout):
    """(text, full_text_url, segment_id): a loc.gov page snapshot followed by the page's OCR text.

    The record's key: value lines are kept; then lines naming the page record's own segment
    (segment_id) and the full-text URL, and the OCR text exactly as LoC sent it (line endings
    unified like every snapshot). G1 holds the URL's segment to segment_id
    (gates.loc_full_text_failures). Records that name no full text are returned unchanged with
    None, None.
    """
    if plan.adapter != "loc":
        return text, None, None
    try:
        data = json.loads(decode(resp.body, resp.charset))
    except json.JSONDecodeError:
        return text, None, None
    pointer = loc_full_text_pointer(data)
    if pointer is None:
        return text, None, None
    url, segment = pointer
    text_plan = fetchplan.Plan("loc-text", url, "application/json", "api", True)
    try:
        ocr = loc_full_text(http_get(text_plan, timeout), url)
    except FetchError as exc:
        raise FetchError(f"the page's full text: {exc}") from exc
    header = fetchplan.loc_full_text_header(segment, url)
    return normalize_snapshot(f"{text.rstrip(chr(10))}\n\n{header}{ocr}"), url, segment


def text_from_file(path):
    """Snapshot text from a file an agent or person saved (.html and .json are converted)."""
    path = Path(path)
    if not path.is_file():
        raise FetchError(f"--from-file {path} does not exist")
    try:
        raw = path.read_bytes().decode("utf-8")
    except UnicodeDecodeError as exc:
        raise FetchError(f"--from-file {path} is not UTF-8 text") from exc
    suffix = path.suffix.lower()
    if suffix in (".html", ".htm"):
        return normalize_snapshot(html_to_text(raw))
    if suffix == ".json":
        try:
            return normalize_snapshot(convert_json("generic", json.loads(raw)))
        except json.JSONDecodeError as exc:
            raise FetchError(f"--from-file {path} is not valid JSON") from exc
    return normalize_snapshot(raw)


# --- the source record --------------------------------------------------------------------------------

@dataclass
class Target:
    sid: str
    record: dict
    text_path: Path
    meta_path: Path
    rel: str
    staged_file: Path | None = None
    staged_index: int | None = None


def locate(p, sid):
    if ids.is_id(sid, kind="source"):
        try:
            rows = records.read_jsonl(p.sources)
        except records.RecordError as exc:
            raise FetchError(f"sources.jsonl cannot be read: {exc}") from exc
        found = [r for r in rows if r.get("id") == sid]
        if not found:
            raise FetchError(f"no source {sid} in {p.sources}")
        if len(found) > 1:
            raise FetchError(f"{sid} appears more than once in sources.jsonl")
        return Target(sid, found[0], p.snapshot_text(sid), p.snapshot_meta(sid), f"snapshots/{sid}.txt")
    if staging.is_temp_id(sid, kind="source"):
        try:
            path, index, rec = staging.find_staged(p, sid)
        except staging.StagingError as exc:
            raise FetchError(str(exc)) from exc
        return Target(sid, rec, staging.snapshot_text_path(p, sid), staging.snapshot_meta_path(p, sid),
                      staging.snapshot_rel(sid), path, index)
    raise FetchError(f"{sid!r} is neither a source id (<CODE>-S-0001) nor a temporary source id "
                     f"(tmp-<family>-S-<n>)")


def _updated(record, target, sha, method, accessed, derived_fetch_url):
    rec = dict(record)
    records.set_field(rec, "source", "snapshot", target.rel)
    records.set_field(rec, "source", "snapshot_sha256", sha)
    records.set_field(rec, "source", "fetch_method", method)
    records.set_field(rec, "source", "accessed", accessed)
    if derived_fetch_url and not rec.get("fetch_url"):
        records.set_field(rec, "source", "fetch_url", derived_fetch_url)
    return rec


def _write_snapshot_files(target, text, meta):
    target.text_path.parent.mkdir(parents=True, exist_ok=True)
    textfiles.write_text(target.text_path, text)
    records.write_json(target.meta_path, meta)


def save(p, target, text, method, fetch_url, http_status, derived_fetch_url=None, now=None, final_url=None,
         full_text_url=None, segment_id=None, record_url=None):
    """Write the snapshot and meta files and update the source record. Returns the meta dict."""
    now = now or datetime.datetime.now(datetime.UTC)
    data = text.encode("utf-8")
    sha = hashlib.sha256(data).hexdigest()
    fetched_at = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    meta = records.order_keys({
        "url": target.record.get("url"),
        "fetch_url": fetch_url,
        "method": method,
        "fetched_at": fetched_at,
        "sha256": sha,
        "bytes": len(data),
        "http_status": http_status,
        "final_url": final_url,
        **({"full_text_url": full_text_url, "segment_id": segment_id} if full_text_url else {}),
        **({"record_url": record_url} if record_url else {}),
    }, "meta")
    accessed = fetched_at[:10]

    if target.staged_file is None:
        def apply(rows):
            hits = [i for i, r in enumerate(rows) if r.get("id") == target.sid]
            if len(hits) != 1:
                raise FetchError(f"{target.sid} changed in sources.jsonl while fetching; run again")
            rows[hits[0]] = _updated(rows[hits[0]], target, sha, method, accessed, derived_fetch_url)
            return rows
        with records.locked(p.sources):
            # The updated source record must pass the record schema (the write boundary,
            # ihh.records) before the snapshot files change, so a refusal leaves all three as they were.
            records.check_records(p.sources, apply(records.read_jsonl(p.sources)))
            _write_snapshot_files(target, text, meta)
            records.update_jsonl(p.sources, apply)
    else:
        _write_snapshot_files(target, text, meta)
        try:
            staging.replace_line(target.staged_file, target.staged_index,
                                 _updated(target.record, target, sha, method, accessed, derived_fetch_url),
                                 target.sid)
        except staging.StagingError as exc:
            raise FetchError(str(exc)) from exc
    return meta


# --- command line -----------------------------------------------------------------------------------------

class _Parser(argparse.ArgumentParser):
    def error(self, message):
        raise UsageError(message)


def _blocked_message(slug, target, url, reason):
    browser_file = f"data/inductees/{slug}/staging/browser/{target.sid}.txt"
    return (f"fetch_snapshot: {target.sid}: {url} {reason}.\n"
            f"Supply the page text instead: open {target.record.get('url')} in the browser, save the page "
            f"text unmodified (for example to {browser_file}), then run:\n"
            f"  python3 tools/fetch_snapshot.py {slug} {target.sid} --from-file <that file> --method browser")


def main(argv=None):
    parser = _Parser(description="Fetch a source and save its text snapshot (SPEC section 6).")
    parser.add_argument("slug", help="inductee slug")
    parser.add_argument("source_id", help="source id (LAM-S-0003) or staged temporary id (tmp-loc-S-1)")
    parser.add_argument("--from-file", help="save this text instead of fetching (needs --method)")
    parser.add_argument("--method", choices=("browser", "manual"), help="how the --from-file text was obtained")
    parser.add_argument("--force", action="store_true", help="replace an existing snapshot")
    parser.add_argument("--timeout", type=float, default=60.0, help="seconds to wait for the server (default 60)")
    parser.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    parser.add_argument("--pace", type=float, default=0.0,
                        help="seconds between the requests of this snapshot, redirects included (default 0)")
    try:
        args = parser.parse_args(argv)
        if bool(args.from_file) != bool(args.method):
            raise UsageError("--from-file and --method go together")
        if args.pace < 0:
            raise UsageError("--pace must be 0 or more")
    except UsageError as exc:
        parser.print_usage(sys.stderr)
        print(f"fetch_snapshot: {exc}", file=sys.stderr)
        return 1

    try:
        p = paths.inductee_paths(args.slug, args.data_dir)
    except ValueError as exc:
        print(f"fetch_snapshot: {exc}", file=sys.stderr)
        return 1
    if not p.exists():
        print(f"fetch_snapshot: no inductee '{args.slug}' ({p.inductee_json} not found)", file=sys.stderr)
        return 1

    global _PACER
    _PACER = Pacer(args.pace)
    target = None
    try:
        target = locate(p, args.source_id)
        if target.record.get("snapshot") and not args.force:
            raise FetchError(f"already has a snapshot ({target.record.get('snapshot')}); pass --force to "
                             f"replace it (facts quoting the old text must then pass G1 again)")
        if args.from_file:
            text = text_from_file(args.from_file)
            if not text.strip():
                raise FetchError(f"--from-file {args.from_file} has no text")
            if _words(text) < MIN_WORDS:
                print(f"fetch_snapshot: warning: {args.from_file} has only {_words(text)} words; check that "
                      f"it is the page text and not an error or challenge page", file=sys.stderr)
            meta = save(p, target, text, args.method, None, None)
        else:
            plan = plan_fetch(target.record)
            record_url = None
            try:
                if plan.adapter in SPECIAL_ADAPTERS:
                    text, method, status, final_url, record_url = SPECIAL_ADAPTERS[plan.adapter](
                        plan, target.record, args.timeout)
                    resp = Response(status=status, content_type="application/json", charset=None, body=b"",
                                    final_url=final_url)
                    full_text_url = segment_id = None
                else:
                    resp = http_get(plan, args.timeout)
                    text, method = convert_response(plan, resp)
                    text, full_text_url, segment_id = add_loc_full_text(plan, resp, text, args.timeout)
            except Blocked as exc:
                print(_blocked_message(args.slug, target, plan.fetch_url, exc), file=sys.stderr)
                return 2
            except FetchError as exc:
                raise FetchError(f"{plan.fetch_url} {exc}") from exc
            if not text.strip():
                raise FetchError(f"{plan.fetch_url} gave no text")
            meta = save(p, target, text, method, plan.fetch_url, resp.status,
                        derived_fetch_url=plan.fetch_url if plan.derived else None, final_url=resp.final_url,
                        full_text_url=full_text_url, segment_id=segment_id, record_url=record_url)
    except FetchError as exc:
        print(f"fetch_snapshot: {args.source_id}: {exc}", file=sys.stderr)
        return 1
    except records.RecordError as exc:
        print(f"fetch_snapshot: {args.source_id}: {exc}", file=sys.stderr)
        return 1

    print(f"{target.sid}: saved {target.rel} ({meta['bytes']} bytes, method {meta['method']}, "
          f"sha256 {meta['sha256'][:12]}...)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
