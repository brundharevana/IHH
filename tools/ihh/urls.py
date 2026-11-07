"""Web URLs as the pipeline reads them (SPEC 3.2, G1, G9).

Rule: the host a tool reads from a URL is the host a browser or urllib reaches.

Python's urlsplit and a browser (WHATWG URL parsing) disagree on some URLs: a
backslash before "@" is userinfo to Python and a path separator to a browser,
a fullwidth or percent-encoded host is mapped to ASCII by the browser and by
urllib's IDNA codec but not by urlsplit, and numeric hosts are IP addresses.
The registry, the fetch planner and the validator would then judge one site
while the published link opens another. So a URL is accepted only in one
canonical form, checked here and nowhere else:

    scheme   http or https
    no whitespace, control character or backslash anywhere
    no userinfo (nothing before "@" in the authority)
    host     lowercase ASCII DNS labels (letters, digits, hyphens; IDNs in their
             xn-- form), at least two labels, no trailing dot, and not an IP
             address (the last label is never numeric or 0x-hex)
    port     digits only, if present

parse() returns the parts or raises UrlError; problem() returns the reason or
None; host() returns the host or None. Every tool that reads a host
(authority.host_of, fetchplan, validate.is_https, export, new_inductee,
fetch_snapshot redirects) goes through this module.
"""

import re
from dataclasses import dataclass
from urllib.parse import urlsplit

SCHEMES = ("http", "https")
_LABEL = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")
_NUMERIC_LABEL = re.compile(r"^(?:\d+|0x[0-9a-f]*)$")


class UrlError(ValueError):
    """The URL is not an http(s) URL in canonical form."""


@dataclass(frozen=True)
class WebUrl:
    scheme: str      # lowercased
    host: str        # lowercase ASCII DNS name
    port: int | None
    path: str
    query: str
    fragment: str


def parse(url):
    """The canonical parts of an http(s) URL; raises UrlError naming the problem."""
    if not isinstance(url, str) or not url:
        raise UrlError("is not a URL")
    if any(ch.isspace() or ord(ch) < 32 or ord(ch) == 127 for ch in url):
        raise UrlError("contains whitespace or a control character")
    if "\\" in url:
        raise UrlError("contains a backslash (browsers read it as '/', Python does not)")
    try:
        parts = urlsplit(url)
        port = parts.port
    except ValueError as exc:
        raise UrlError(f"cannot be parsed ({exc})") from exc
    scheme = parts.scheme.lower()
    if scheme not in SCHEMES:
        raise UrlError("is not an http(s) URL")
    netloc = parts.netloc
    if "@" in netloc:
        raise UrlError("has userinfo before '@'; the host is ambiguous")
    host = netloc.rsplit(":", 1)[0] if port is not None or netloc.endswith(":") else netloc
    if not host:
        raise UrlError("has no host")
    if not host.isascii():
        raise UrlError(f"host {host!r} is not ASCII; write it in its xn-- (punycode) form")
    host = host.lower()
    labels = host.split(".")
    if len(labels) < 2 or not all(_LABEL.match(x) for x in labels):
        raise UrlError(f"host {host!r} is not a DNS name (letters, digits and hyphens in dotted labels, "
                       f"no trailing dot, no percent-encoding, no IP address)")
    if _NUMERIC_LABEL.match(labels[-1]):
        raise UrlError(f"host {host!r} is an IP address; cite the publisher's host name")
    return WebUrl(scheme=scheme, host=host, port=port, path=parts.path, query=parts.query,
                  fragment=parts.fragment)


def problem(url):
    """Why url is not a canonical http(s) URL, else None."""
    try:
        parse(url)
    except UrlError as exc:
        return f"url {url!r} {exc}"
    return None


def host(url):
    """The canonical host of url, else None."""
    try:
        return parse(url).host
    except UrlError:
        return None
