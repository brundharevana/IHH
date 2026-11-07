"""What tools/fetch_snapshot.py requests for a source record (SPEC section 6).

plan_fetch() turns a source's fetch_url (if set) or url into the URL actually
requested, through the built-in adapters (NARA proxy API, LoC ?fo=json,
Wikimedia Commons API, Google Patents, and, owner approval 2026-10-16, NARA page
transcriptions and USPTO Patent Public Search full text). It lives in the ihh package so the
gates can check that a snapshot's meta file names the URL the record would be
fetched from (ihh.gates.snapshot_failures), not some other page.
"""

import re
from dataclasses import dataclass
from urllib.parse import parse_qsl, quote, unquote, urlsplit, urlunsplit

from . import urls

GENERIC_ACCEPT = "application/json, text/html;q=0.9, text/plain;q=0.8, */*;q=0.5"


class PlanError(ValueError):
    """The source record has no usable url or fetch_url."""


@dataclass(frozen=True)
class Plan:
    adapter: str     # nara, nara-transcriptions, uspto, loc, commons, patents, generic
    fetch_url: str   # the URL requested
    accept: str      # Accept header
    method: str      # expected fetch_method: api (JSON) or http (HTML, text)
    derived: bool    # fetch_url was derived by an adapter, not taken from the record


def _check_url(url, label):
    """url if it is a canonical http(s) URL (ihh.urls), else PlanError."""
    try:
        urls.parse(url)
    except urls.UrlError as exc:
        raise PlanError(f"{label} {url!r} {exc}") from exc
    return url


def _with_fo_json(url):
    parts = urlsplit(url)
    if ("fo", "json") in parse_qsl(parts.query, keep_blank_values=True):
        return urlunsplit(parts._replace(fragment=""))
    query = f"{parts.query}&fo=json" if parts.query else "fo=json"
    return urlunsplit(parts._replace(query=query, fragment=""))


def _commons_title(parts):
    if parts.path.startswith("/wiki/"):
        title = unquote(parts.path[len("/wiki/"):])
    else:
        title = dict(parse_qsl(parts.query)).get("title", "")
    return title if title.lower().startswith("file:") else None


# Owner approval 2026-10-16: two reviewed adapters for records whose text is served only as JSON.
# NARA catalog page transcriptions: the catalog's contributions endpoint for one record (the
# transcriptions shown on the catalog page, written by Citizen Archivists), read together with the
# record's own JSON (title and page file names; meta record_url).
NARA_CATALOG_HOST = "catalog.archives.gov"
_NARA_ID_PATH = re.compile(r"/id/(\d+)/?")
_NARA_CONTRIB_PATH = re.compile(r"/proxy/contributions/targetNaId/(\d+)")
# USPTO Patent Public Search (ppubs): the public web application's record endpoint for one patent
# document, which needs the anonymous session token that the site's own session endpoint issues to
# every visitor (no account, no API key). The cited url is the human-facing search link
# external.html?q=<number>.pn.&db=<database>; the endpoint names that number and database.
PPUBS_HOST = "ppubs.uspto.gov"
PPUBS_SESSION_URL = "https://ppubs.uspto.gov/api/users/me/session"
_PPUBS_RECORD_PATH = re.compile(r"/api/patents/highlight/US-(\d+)-([A-Z]\d?)")
_PPUBS_QUERY = re.compile(r"(\d+)\.pn\.")
_DB = re.compile(r"[A-Z]{3,8}")


def nara_naid(url):
    """The NAID a catalog record page names (https://catalog.archives.gov/id/<N>), else None."""
    try:
        u = urls.parse(url)
    except (urls.UrlError, TypeError):
        return None
    m = _NARA_ID_PATH.fullmatch(u.path or "") if u.host == NARA_CATALOG_HOST and not u.query else None
    return m.group(1) if m else None


def nara_record_endpoint(url):
    """The NARA proxy API record endpoint for a catalog record page, else None."""
    naid = nara_naid(url)
    return f"https://{NARA_CATALOG_HOST}/proxy/records/search?naId={naid}" if naid else None


def nara_transcriptions_endpoint(url):
    """The contributions endpoint holding a catalog record's page transcriptions, else None."""
    naid = nara_naid(url)
    return f"https://{NARA_CATALOG_HOST}/proxy/contributions/targetNaId/{naid}" if naid else None


def ppubs_record(url):
    """(patent number, database) a Patent Public Search link names (external.html?q=<n>.pn.&db=<DB>),
    else None."""
    try:
        u = urls.parse(url)
    except (urls.UrlError, TypeError):
        return None
    if u.host != PPUBS_HOST or u.path != "/pubwebapp/external.html" or u.fragment:
        return None
    pairs = parse_qsl(u.query, keep_blank_values=True)
    query = dict(pairs)
    if len(pairs) != len(query) or set(query) != {"q", "db"}:
        return None
    m = _PPUBS_QUERY.fullmatch(query["q"])
    return (m.group(1), query["db"]) if m and _DB.fullmatch(query["db"]) else None


def ppubs_endpoint_problem(url, fetch_url):
    """Why fetch_url is not the Patent Public Search record endpoint for the patent and database the
    url names; None if it is. The kind code (A, B1, B2) is not in the url, so any one is accepted;
    the number and database must be the url's."""
    named = ppubs_record(url)
    if named is None:
        return f"{url!r} is not a Patent Public Search link naming one patent (external.html?q=<number>.pn.&db=<DB>)"
    try:
        u = urls.parse(fetch_url)
    except (urls.UrlError, TypeError):
        return f"fetch_url {fetch_url!r} is not a canonical URL"
    m = _PPUBS_RECORD_PATH.fullmatch(u.path or "") if u.host == PPUBS_HOST and u.scheme == "https" else None
    pairs = parse_qsl(u.query, keep_blank_values=True)
    query = dict(pairs)
    if m is None or u.fragment or len(pairs) != len(query) or \
            query != {"queryId": "1", "source": named[1], "includeSections": "true"}:
        return (f"fetch_url {fetch_url!r} is not the Patent Public Search record endpoint "
                f"https://{PPUBS_HOST}/api/patents/highlight/US-{named[0]}-<kind>?queryId=1&source={named[1]}"
                f"&includeSections=true")
    if m.group(1) != named[0]:
        return f"fetch_url names patent {m.group(1)}, not {named[0]} (the url's)"
    return None


def alternate_endpoint_problem(url, fetch_url):
    """None if fetch_url is a reviewed alternate adapter endpoint for url (NARA page transcriptions,
    Patent Public Search record), else a short reason why not."""
    if nara_naid(url) is not None:
        if fetch_url == nara_transcriptions_endpoint(url):
            return None
        return "not the record's transcriptions endpoint"
    if ppubs_record(url) is not None or (isinstance(url, str) and f"//{PPUBS_HOST}/" in url):
        return ppubs_endpoint_problem(url, fetch_url)
    return "no alternate endpoint"


def _adapt(target):
    """(adapter, fetch_url, accept, method) for one URL."""
    parts = urlsplit(target)
    host = (parts.hostname or "").lower()
    if host == PPUBS_HOST and _PPUBS_RECORD_PATH.fullmatch(parts.path):
        return "uspto", target, "application/json", "api"
    if host == "catalog.archives.gov":
        if _NARA_CONTRIB_PATH.fullmatch(parts.path) and not parts.query:
            return "nara-transcriptions", target, "application/json", "api"
        m = re.fullmatch(r"/id/(\d+)/?", parts.path)
        if m:
            return ("nara", f"https://catalog.archives.gov/proxy/records/search?naId={m.group(1)}",
                    "application/json", "api")
        if parts.path.startswith(("/proxy/", "/api/")):
            return "nara", target, "application/json", "api"
    if host in ("loc.gov", "www.loc.gov"):
        return "loc", _with_fo_json(target), "application/json", "api"
    if host in ("commons.wikimedia.org", "commons.m.wikimedia.org"):
        title = _commons_title(parts)
        if title:
            api = ("https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo"
                   f"&iiprop=extmetadata&titles={quote(title, safe=':')}&format=json")
            return "commons", api, "application/json", "api"
        if parts.path == "/w/api.php":
            return "commons", target, "application/json", "api"
    if host == "patents.google.com":
        return "patents", target, "text/html", "http"
    return "generic", target, GENERIC_ACCEPT, "http"


# Query parameters that only ask the same record for another format. A fetch_url may add
# or drop these and still name the cited record; any other difference names another record.
FORMAT_PARAMS = (("fo", "json"), ("format", "json"))


_DEFAULT_PORTS = {"http": 80, "https": 443}


def record_key(url):
    """What identifies the record a URL names; two URLs with the same key name one record.

    Kept: the scheme, the host (a leading "www." aside), a non-default port, the path (a
    trailing "/" aside) and the query parameters as a set of pairs (order aside, FORMAT_PARAMS
    removed). The fragment is not part of the key; fetch_url_problem() rules on it.
    Raises urls.UrlError for a URL that is not canonical.
    """
    u = urls.parse(url)
    host = u.host[4:] if u.host.startswith("www.") and u.host.count(".") > 1 else u.host
    port = None if u.port in (None, _DEFAULT_PORTS[u.scheme]) else u.port
    query = sorted((k, v) for k, v in parse_qsl(u.query, keep_blank_values=True)
                   if (k.lower(), v.lower()) not in FORMAT_PARAMS)
    return (u.scheme, host, port, u.path.rstrip("/"), tuple(query))


def same_record(a, b):
    """True if URLs a and b name the same record (record_key); False if either is not canonical."""
    try:
        return record_key(a) == record_key(b)
    except urls.UrlError:
        return False


def adapter_endpoint(url):
    """The machine-readable endpoint a reviewed adapter derives from url (NARA proxy API,
    LoC ?fo=json, Commons API), else None. The adapters are the only way a fetch_url
    may differ from the url beyond FORMAT_PARAMS and the fragment."""
    adapter, endpoint, _, _ = _adapt(url)
    return endpoint if adapter != "generic" and endpoint != url else None


# LoC Text Services (https://www.loc.gov/apis/micro-services/text-services): with full_text=1 the
# word-coordinates service answers {"<segment>": {"full_text": "<OCR text>", ...}} for one page
# segment. A loc.gov newspaper page record names this URL for its own page as
# resource.fulltext_file (and fulltext_service); tools/fetch_snapshot.py keeps that text.
LOC_TEXT_HOST = "tile.loc.gov"
LOC_TEXT_PATH = "/text-services/word-coordinates-service"
_LOC_SEGMENT = re.compile(r"/service/[A-Za-z0-9_./-]+\.xml")


def loc_full_text_segment(url):
    """The segment a LoC Text Services full-text URL names, or None if it is not one
    (loc_full_text_problem says why)."""
    return None if loc_full_text_problem(url) else dict(parse_qsl(urlsplit(url).query))["segment"]


def loc_full_text_header(segment_id, url):
    """The snapshot lines tools/fetch_snapshot.py writes before a LoC page's OCR text: the page
    record's own segment, the full-text URL, then "full_text:" (the gates read them back)."""
    return f"segment_id: {segment_id}\nfull_text_url: {url}\nfull_text:\n"


def loc_full_text_problem(url):
    """Why url is not LoC's Text Services full-text endpoint for one page segment; None if it is."""
    if not isinstance(url, str):
        return "the full-text URL is not a string"
    bad = urls.problem(url)
    if bad:
        return f"the full-text URL {url!r} {bad}"
    parts = urlsplit(url)
    if parts.scheme != "https":
        return f"the full-text URL {url!r} is not https"
    if (parts.hostname or "").lower() != LOC_TEXT_HOST or parts.port is not None or parts.path != LOC_TEXT_PATH:
        return (f"the full-text URL {url!r} is not LoC's Text Services endpoint "
                f"https://{LOC_TEXT_HOST}{LOC_TEXT_PATH}")
    pairs = parse_qsl(parts.query, keep_blank_values=True)
    keys = [k for k, _ in pairs]
    if len(keys) != len(set(keys)) or parts.fragment:
        return f"the full-text URL {url!r} repeats a parameter or has a fragment"
    query = dict(pairs)
    if query.get("full_text") != "1":
        return f"the full-text URL {url!r} does not ask for the page text (full_text=1)"
    segment = query.get("segment", "")
    if not _LOC_SEGMENT.fullmatch(segment) or "/../" in segment or "/./" in segment:
        return f"the full-text URL {url!r} does not name one page segment (/service/....xml)"
    if set(query) - {"segment", "format", "full_text"}:
        return f"the full-text URL {url!r} has parameters other than segment, format and full_text"
    return None


def fetch_url_problem(source):
    """Why a record's fetch_url does not name the cited record itself; None if it does.

    Rule: a snapshot must be fetched from the cited record itself. fetch_url must be
    either the endpoint a reviewed adapter derives from url (adapter_endpoint), or the
    same record as the url (same_record: query order, a leading "www.", a trailing "/"
    and FORMAT_PARAMS aside). It may drop the url's fragment but never add or change
    one: on a hash-routed catalog the fragment names the record. A page on the same
    site is another record: shared platforms (CONTENTdm, Omeka.net, LibGuides, S3,
    archive.org) host many holders' records under one domain.
    """
    url, explicit = source.get("url"), source.get("fetch_url")
    if not isinstance(url, str) or not isinstance(explicit, str) or not explicit.strip():
        return None
    for label, value in (("url", url), ("fetch_url", explicit)):
        bad = urls.problem(value)
        if bad:
            return f"{label}: {bad}"
    fragment = urlsplit(explicit).fragment
    if same_record(explicit, url) and (not fragment or fragment == urlsplit(url).fragment):
        return None
    derived = adapter_endpoint(url)
    if derived is not None and explicit == derived:
        return None
    alternate = alternate_endpoint_problem(url, explicit)
    if alternate is None:
        return None
    if ppubs_record(url) is not None:
        return f"{alternate}; it is not the cited record {url!r}"
    allowed = f"the url, or the adapter endpoint {derived!r}" if derived else "the url"
    transcriptions = nara_transcriptions_endpoint(url)
    if transcriptions:
        allowed += f", or the page-transcriptions endpoint {transcriptions!r}"
    return (f"fetch_url {explicit!r} is not the cited record {url!r}: it must be {allowed} (query order, the "
            f"format parameters fo=json and format=json, and dropping the fragment may differ); set fetch_url "
            f"to null or to that")


def plan_fetch(source):
    """What to request for a source record (fetch_url if set, else url, through the adapters)."""
    url = source.get("url")
    if not isinstance(url, str) or not url.strip():
        raise PlanError("the source record has no url")
    url = _check_url(url, "url")
    explicit = source.get("fetch_url")
    if explicit not in (None, ""):
        if not isinstance(explicit, str):
            raise PlanError("fetch_url is not a string")
        explicit = _check_url(explicit, "fetch_url")
        problem = fetch_url_problem({"url": url, "fetch_url": explicit})
        if problem:
            raise PlanError(problem)
    adapter, fetch_url, accept, method = _adapt(explicit or url)
    derived = not explicit and fetch_url != url
    return Plan(adapter, fetch_url, accept, method, derived)
