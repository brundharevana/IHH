"""Spike S4: check the static oEmbed discovery bits against oembed.com 1.0 rules and WordPress's documented HTML filter.

Usage: python3 validate_oembed.py <showcase page URL> [json-file-to-validate-instead-of-the-discovered-endpoint]
Stdlib only. Mirrors, but is NOT, WordPress code: WP_oEmbed::discover() (first 150 KB, <link> regex) and
wp_filter_oembed_result() (kses allow-list, forced sandbox, secret) as read from the WordPress source on 2026-10-08.
"""
import json
import re
import sys
import urllib.request
from html.parser import HTMLParser

IFRAME_ALLOWED = {"src", "width", "height", "frameborder", "marginwidth", "marginheight", "scrolling", "title"}
results = []


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(("PASS " if ok else "FAIL ") + name + (" :: " + detail if detail else ""))


def fetch(url, limit=None):
    req = urllib.request.Request(url, headers={"User-Agent": "spike-s4-validator"})
    with urllib.request.urlopen(req, timeout=10) as r:
        body = r.read(limit) if limit else r.read()
        return r.status, r.headers.get("Content-Type", ""), body


page = sys.argv[1]
status, ctype, body = fetch(page, 150 * 1024)  # WP truncates the fetched page to 150 KB
html = body.decode("utf-8", "replace")
check("page fetched", status == 200, f"{status} {ctype}, {len(body)} bytes read (WP reads at most 153600)")

# WP_oEmbed::discover(): regex over <link ...> tags, looks for type json+oembed (or xml) with a rel/href
links = re.findall(r"<link([^<>]+)/?>", html, re.I)
found = None
for attrs in links:
    t = re.search(r'type=["\']([^"\']+)["\']', attrs, re.I)
    h = re.search(r'href=["\']([^"\']+)["\']', attrs, re.I)
    r = re.search(r'rel=["\']([^"\']+)["\']', attrs, re.I)
    if t and h and t.group(1).lower() == "application/json+oembed":
        found = (r.group(1) if r else None, h.group(1))
check("discovery <link> present", found is not None, str(found))
check("rel is alternate", bool(found) and found[0] == "alternate")
href = found[1] if found else None
check("discovery href is absolute http(s)", bool(href) and href.startswith(("http://", "https://")), str(href))
head_end = html.lower().find("</head>")
check("link tag lies inside <head>", bool(found) and html.find(href) < head_end)

status, ctype, raw = fetch(href)
if len(sys.argv) > 2:  # negative-control mode: validate a local file in place of the endpoint body
    raw = open(sys.argv[2], 'rb').read()
check("endpoint returns 200", status == 200, str(status))
check("Content-Type is application/json", ctype.split(";")[0].strip() == "application/json", ctype)
data = json.loads(raw)
check("JSON parses", isinstance(data, dict))

# oEmbed 1.0, section 2.3.4 (rich type)
check("type is a defined value", data.get("type") in {"photo", "video", "link", "rich"}, str(data.get("type")))
check("type is rich", data.get("type") == "rich")
check("version is string '1.0'", data.get("version") == "1.0", repr(data.get("version")))
check("html is a non-empty string", isinstance(data.get("html"), str) and bool(data["html"]))
for k in ("width", "height"):
    v = data.get(k)
    check(f"{k} is a positive integer", isinstance(v, int) and not isinstance(v, bool) and v > 0, repr(v))
for k in ("title", "author_name", "author_url", "provider_name", "provider_url", "thumbnail_url"):
    if k in data:
        check(f"optional {k} is a string", isinstance(data[k], str))
for k in ("cache_age", "thumbnail_width", "thumbnail_height"):
    if k in data:
        check(f"optional {k} is an integer", isinstance(data[k], int) and not isinstance(data[k], bool))
if "thumbnail_url" in data or "thumbnail_width" in data or "thumbnail_height" in data:
    check("thumbnail trio present together", all(k in data for k in ("thumbnail_url", "thumbnail_width", "thumbnail_height")))
unknown = sorted(set(data) - {"type", "version", "html", "width", "height", "title", "author_name", "author_url", "provider_name",
                              "provider_url", "cache_age", "thumbnail_url", "thumbnail_width", "thumbnail_height"})
check("no unknown keys", not unknown, str(unknown))


class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


p = P()
p.feed(data["html"])
iframes = [a for t, a in p.tags if t == "iframe"]
check("html holds exactly one iframe and nothing else", len(iframes) == 1 and len(p.tags) == 1, str([t for t, _ in p.tags]))
fa = iframes[0]
extra = sorted(set(fa) - IFRAME_ALLOWED)
check("iframe attributes survive WordPress kses (allow-list)", not extra, "would be stripped: " + str(extra) if extra else "all kept")
check("iframe has a title (a11y; WP also fills it from the JSON title)", bool(fa.get("title")))
check("iframe width/height match JSON width/height", fa.get("width") == str(data["width"]) and fa.get("height") == str(data["height"]))
check("iframe src is https or loopback http", fa["src"].startswith(("https://", "http://127.0.0.1", "http://localhost")), fa["src"])
check("html has no padding/margins style (spec: should)", "style" not in fa)

# What WordPress would emit (documented): class, sandbox, security forced; secret appended to src and data-secret
secret = "abc1234567"
out = dict(fa)
out["src"] = fa["src"] + "#?secret=" + secret
out.update({"class": "wp-embedded-content", "sandbox": "allow-scripts", "security": "restricted", "data-secret": secret})
print("\nSimulated WordPress output:\n<iframe " + " ".join(f'{k}="{v}"' for k, v in out.items()) + "></iframe>")
print("\nNote: static endpoint ignores maxwidth/maxheight; spec says rich responses must obey them (WP passes them on the request).")
fails = [n for n, ok, _ in results if not ok]
print(f"\n{len(results) - len(fails)} passed, {len(fails)} failed" + (": " + "; ".join(fails) if fails else ""))
sys.exit(1 if fails else 0)
