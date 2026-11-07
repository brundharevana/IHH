"""Source authority: who published a source, from a curated registry (SPEC 3.2, G5, G9).

Rule: a source is primary or institutional only if its publisher is in a curated
authority registry; independence is counted by registry entry; everything else is
secondary.

The registry is data/registry/institutions.json, a reviewed list of publishers:

    {"entries": [{"id", "name", "kind", "domains", "hosts", "may_be", "media_only"?,
                  "verified_on", "note"}]}

domains   registered domains: the entry covers the domain and every subdomain
hosts     exact hosts (a leading "www." or "m." label, and an "m." label after the
          first, are ignored: they are the same site): for a publisher that shares
          its registered domain with others (patents.google.com,
          commons.wikimedia.org, albert-einstein.huji.ac.il)
may_be    ["primary", "institutional"] (either or both), or ["secondary"]
primary_paths  "host/path/" prefixes where the publisher's original records live
          (catalog.archives.gov/id/). When listed, "primary" is granted only to pages
          under one of them; every other page of the entry may be institutional at
          most. Without primary_paths, "primary" covers the whole entry only for a
          records holder (kind government or archive); a museum, university, prize
          body, foundation or aggregator grants no primary until a person lists the
          paths of its original records.
media_only  the source may back media items, never a fact
urls      exact records (canonical https urls) instead of domains and hosts: a single-record
          entry covers only those records (fetchplan.same_record), never another page on
          their site (owner decision 2026-10-10: Nature, the one 1921 report)
content_part  "transcription": the publisher counts only for a source that carries
          content_part "transcription"; its snapshot marks the transcribed document text
          (TRANSCRIPTION_START / TRANSCRIPTION_END lines) and every quote check reads only
          that text, never editors' notes, introductions, footnotes or commentary (owner
          decision 2026-10-10: the Einstein Papers Project)
supporting_only  (owner decision 2026-10-16: Wien Geschichte Wiki) the publisher may count as an
          independent second holder for G5, but is never primary or institutional (may_be is
          ["secondary"]) and never the sole source of a fact (gates.g9_fact_use)
part_of   the id of another entry this publisher is part of (a presidential library of the
          National Archives): G5 counts both as one holder, never as two
owner_approved_on  the date the owner approved the entry (YYYY-MM-DD)
kind public-university-archive  a public university's archive, special-collections or
          digital-library host holding original items: institutional only, on exact hosts
          only, never a whole university domain (owner policy 2026-10-10)

A person reviews every entry; tools and pipeline agents never write the registry
(ihh.paths.refuse_registry_write guards every write the tools make).

Registry.resolve(url) is the one lookup. It reads only the url's own host, in the
canonical form ihh.urls accepts (the host a browser reaches): an archive, cache,
proxy, translation or short-link wrapper is another site and does not resolve to
the publisher it wraps, and a url that is not canonical (userinfo, backslash,
fullwidth or percent-encoded host, IP address) resolves to nothing. Authority
comes only from the registry: a .gov or .mil host no entry covers is secondary
like any other unregistered site.

source_problems() is the G9 authority check for one source; independent_groups()
is the G5 independence count. Both work from standing(), so the type a source may
have and the holder it counts as come from the same lookup.
"""

import json
import re
from dataclasses import dataclass, field

from . import fetchplan, urls
from .normalize import normalize_text

TYPES = ("primary", "institutional", "secondary")
STRONG_TYPES = ("primary", "institutional")
KINDS = ("government", "archive", "museum", "university", "prize", "foundation", "publisher-aggregator",
         "public-university-archive")
# Owner policy 2026-10-10: any public university archive counts as institutional, one reviewed
# entry at a time: institutional only (never primary) and exact hosts only (never a whole .edu).
PUBLIC_UNIVERSITY_ARCHIVE = "public-university-archive"
# The parts of a page an entry may be limited to (Entry.content_part, a source's content_part).
CONTENT_PARTS = ("transcription",)
# The lines that mark the transcribed document text in a content_part "transcription" snapshot.
TRANSCRIPTION_START = "<<<TRANSCRIPTION>>>"
TRANSCRIPTION_END = "<<<END TRANSCRIPTION>>>"
# Kinds whose business is holding original records: without primary_paths, "primary" in may_be
# covers the whole entry for these kinds only (SPEC 11 residual; primary_paths narrows it).
RECORD_HOLDER_KINDS = ("government", "archive")
# Defence in depth: registered domains whose every host is a media or discovery site, so no
# page on them backs a fact, whatever the registry lists (Wikimedia Commons and its mobile,
# upload and meta hosts).
MEDIA_ONLY_SITES = ("wikimedia.org",)

# Public suffixes the pipeline's sources use. A registered domain is one label under the
# longest of these. A host under a suffix not listed falls back to its last two labels,
# which can only merge sites for G5 (never split one site in two).
PUBLIC_SUFFIXES = frozenset({
    "com", "org", "edu", "gov", "mil", "net", "info", "int", "io", "eu",
    "uk", "gov.uk", "ac.uk", "org.uk", "co.uk", "nhs.uk", "sch.uk",
    "il", "ac.il", "gov.il", "org.il", "co.il", "muni.il",
    "at", "ac.at", "gv.at", "or.at", "co.at",
    "de", "ch", "fr", "it", "nl", "be", "se", "no", "dk", "ca", "ie", "nz",
    "au", "com.au", "edu.au", "gov.au", "org.au",
    "jp", "ac.jp", "co.jp", "go.jp", "or.jp",
})
_ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class RegistryError(ValueError):
    """The registry file is unreadable or an entry breaks the registry rules."""


# --- hosts and registered domains ---------------------------------------------------------

def host_of(url):
    """The canonical host of an http(s) url (ihh.urls), else None. Nothing is unwrapped."""
    return urls.host(url)


def _labels(host):
    if not isinstance(host, str):
        return []
    return [x for x in host.strip().lower().rstrip(".").split(".") if x]


def registered_domain(host):
    """The registered domain of a host ("library.example.edu" -> "example.edu",
    "www.example.co.uk" -> "example.co.uk"); None for a public suffix or no host."""
    labels = _labels(host)
    if not labels:
        return None
    n = max((k for k in (1, 2, 3) if len(labels) >= k and ".".join(labels[-k:]) in PUBLIC_SUFFIXES), default=0)
    if n == len(labels):
        return None  # the host is itself a public suffix
    if n == 0:
        n = 1  # an unlisted suffix: the last two labels (merges sites, never splits one)
    return ".".join(labels[-n - 1:])


# --- registry -----------------------------------------------------------------------------------

@dataclass(frozen=True)
class Entry:
    id: str
    name: str | None
    kind: str
    may_be: tuple
    domains: tuple = ()
    hosts: tuple = ()
    media_only: bool = False
    verified_on: str | None = None
    note: str | None = None
    primary_paths: tuple = ()  # "host/path/" prefixes of original-record pages
    urls: tuple = ()           # a single-record entry: the exact records it covers
    content_part: str | None = None  # "transcription": counts only for a source with that part
    document_paths: tuple = ()  # with content_part: regexes the url path must fully match (no query)
    supporting_only: bool = False  # a second holder at most: secondary only, never a fact's sole source
    part_of: str | None = None     # the entry this publisher is part of (one holder for G5)
    owner_approved_on: str | None = None

    def in_document_scope(self, url):
        """True if the entry is not limited to one content part, or url is a page whose path fully
        matches one of document_paths (no query string; a fragment names the same page). Enforced
        here, by the registry, so a record's content_part flag can never widen the approval."""
        if self.content_part is None:
            return True
        try:
            u = urls.parse(url)
        except urls.UrlError:
            return False
        if u.query:
            return False
        return any(re.fullmatch(rx, u.path or "/") for rx in self.document_paths)

    def covers_url(self, url):
        """True if url is one of a single-record entry's records."""
        return any(fetchplan.same_record(url, u) for u in self.urls)

    def covers(self, host):
        """True if host (canonical, lowercase) is one of this entry's hosts or under its domains."""
        bare = _bare(host)
        return bare in {_bare(h) for h in self.hosts} or \
            any(bare == d or bare.endswith("." + d) for d in self.domains)

    def primary_scope(self, url):
        """True if url may be primary: a page under one of primary_paths, or, for an entry that
        lists none, any page of a records holder (RECORD_HOLDER_KINDS)."""
        try:
            u = urls.parse(url)
        except urls.UrlError:
            return False
        if not self.primary_paths:
            return self.kind in RECORD_HOLDER_KINDS
        key = _bare(u.host) + (u.path or "/")
        return any(key.startswith(prefix) for prefix in self.primary_paths)


def _entry(raw, n):
    where = f"registry entry {n}"
    if not isinstance(raw, dict):
        raise RegistryError(f"{where} is not an object")
    rid = raw.get("id")
    if not isinstance(rid, str) or not _ID.match(rid):
        raise RegistryError(f"{where}: id {rid!r} must be lowercase letters, digits and hyphens")
    where = f"registry entry {rid}"
    for key in ("name", "verified_on", "note"):
        if not isinstance(raw.get(key), str) or not raw[key].strip():
            raise RegistryError(f"{where}: {key} must be a non-empty string")
    if not _DATE.match(raw["verified_on"]):
        raise RegistryError(f"{where}: verified_on must be YYYY-MM-DD")
    if raw.get("kind") not in KINDS:
        raise RegistryError(f"{where}: kind must be one of {', '.join(KINDS)}")
    may_be = raw.get("may_be")
    if not isinstance(may_be, list) or not may_be or any(t not in TYPES for t in may_be) \
            or len(set(may_be)) != len(may_be) or ("secondary" in may_be and len(may_be) > 1):
        raise RegistryError(f"{where}: may_be must be [\"secondary\"] or a list of primary and institutional")
    domains, hosts, records = raw.get("domains", []), raw.get("hosts", []), raw.get("urls", [])
    if not isinstance(records, list):
        raise RegistryError(f"{where}: urls must be a list of canonical https urls")
    if records and (domains or hosts):
        raise RegistryError(f"{where}: a single-record entry (urls) lists no domains or hosts; it covers "
                            f"only its records")
    for u in records:
        if not isinstance(u, str) or urls.problem(u) or not u.startswith("https://"):
            raise RegistryError(f"{where}: urls entry {u!r} must be a canonical https url")
    if not isinstance(domains, list) or not isinstance(hosts, list) or not (domains or hosts or records):
        raise RegistryError(f"{where}: needs domains or hosts (or urls for a single-record entry)")
    for d in domains:
        if not isinstance(d, str) or registered_domain(d) != d:
            raise RegistryError(f"{where}: domain {d!r} is not a registered domain (list a subdomain under hosts)")
    for h in hosts:
        if not isinstance(h, str) or h != h.strip().lower() or len(_labels(h)) < 2 or registered_domain(h) is None:
            raise RegistryError(f"{where}: host {h!r} is not a lowercase host name")
    if not isinstance(raw.get("media_only", False), bool):
        raise RegistryError(f"{where}: media_only must be true or false")
    part = raw.get("content_part")
    if part is not None and part not in CONTENT_PARTS:
        raise RegistryError(f"{where}: content_part must be one of {', '.join(CONTENT_PARTS)}")
    doc_paths = raw.get("document_paths", [])
    if part is not None and (not isinstance(doc_paths, list) or not doc_paths):
        raise RegistryError(f"{where}: content_part needs document_paths, a list of path regexes of the "
                            f"pages that carry that part (the registry, not the record, bounds the approval)")
    if part is None and doc_paths:
        raise RegistryError(f"{where}: document_paths is only used with content_part")
    for rx in doc_paths:
        try:
            ok = isinstance(rx, str) and rx.startswith("/") and re.compile(rx) is not None
        except re.error:
            ok = False
        if not ok:
            raise RegistryError(f"{where}: document_paths entry {rx!r} must be a valid regex starting with '/'")
    supporting = raw.get("supporting_only", False)
    if not isinstance(supporting, bool):
        raise RegistryError(f"{where}: supporting_only must be true or false")
    if supporting and list(may_be) != ["secondary"]:
        raise RegistryError(f"{where}: a supporting_only publisher may be [\"secondary\"] only: it can count as an "
                            f"independent second holder, never as the primary or institutional source")
    part_of = raw.get("part_of")
    if part_of is not None and (not isinstance(part_of, str) or not _ID.match(part_of) or part_of == rid):
        raise RegistryError(f"{where}: part_of must be the id of another registry entry")
    approved = raw.get("owner_approved_on")
    if approved is not None and (not isinstance(approved, str) or not _DATE.match(approved)):
        raise RegistryError(f"{where}: owner_approved_on must be YYYY-MM-DD")
    if raw["kind"] == PUBLIC_UNIVERSITY_ARCHIVE and (list(may_be) != ["institutional"] or domains or records):
        raise RegistryError(f"{where}: a {PUBLIC_UNIVERSITY_ARCHIVE} entry may be institutional only, on exact "
                            f"hosts only (never a whole university domain, never primary)")
    e = Entry(id=rid, name=raw["name"], kind=raw["kind"], may_be=tuple(may_be), domains=tuple(domains),
              hosts=tuple(hosts), media_only=raw.get("media_only", False), verified_on=raw["verified_on"],
              note=raw["note"], urls=tuple(records), content_part=part,
              document_paths=tuple(doc_paths), supporting_only=supporting, part_of=part_of,
              owner_approved_on=approved)
    prefixes = raw.get("primary_paths", [])
    if prefixes and records:
        raise RegistryError(f"{where}: primary_paths is not used with urls (list the records' type in may_be)")
    if not isinstance(prefixes, list):
        raise RegistryError(f"{where}: primary_paths must be a list of \"host/path/\" prefixes")
    if prefixes and "primary" not in may_be:
        raise RegistryError(f"{where}: primary_paths needs \"primary\" in may_be")
    for prefix in prefixes:
        host, _, path = prefix.partition("/") if isinstance(prefix, str) else ("", "", "")
        if not (host and path and prefix.endswith("/") and host == host.lower() and e.covers(host)
                and urls.host(f"https://{host}/") == host):
            raise RegistryError(f"{where}: primary_paths entry {prefix!r} must be \"host/path/\" on one of the "
                                f"entry's hosts or domains, ending with '/'")
    return Entry(**{**e.__dict__, "primary_paths": tuple(_bare(p.split("/", 1)[0]) + "/" + p.split("/", 1)[1]
                                                         for p in prefixes)})


def _bare(host):
    """host without a leading "www." or "m." label or an "m." label after the first: the same site
    (www.loc.gov is loc.gov; commons.m.wikimedia.org is commons.wikimedia.org)."""
    labels = host.split(".")
    if len(labels) > 2 and labels[0] in ("www", "m"):
        labels = labels[1:]
    if len(labels) > 2 and labels[1] == "m":
        labels = [labels[0]] + labels[2:]
    return ".".join(labels)


@dataclass
class Registry:
    entries: tuple = ()
    source: str = ""
    missing: bool = False
    _by_domain: dict = field(default_factory=dict, repr=False)
    _by_host: dict = field(default_factory=dict, repr=False)
    _names: list = field(default_factory=list, repr=False)
    _by_record: list = field(default_factory=list, repr=False)  # single-record entries

    @classmethod
    def from_dict(cls, data, source=""):
        if not isinstance(data, dict) or not isinstance(data.get("entries"), list):
            raise RegistryError(f"{source or 'registry'}: expected an object with an entries list")
        entries = [_entry(raw, n) for n, raw in enumerate(data["entries"], 1)]
        reg = cls(entries=tuple(entries), source=str(source))
        seen = set()
        for e in entries:
            if e.id in seen:
                raise RegistryError(f"registry id {e.id} is used twice")
            seen.add(e.id)
            for d in e.domains:
                if d in reg._by_domain:
                    raise RegistryError(f"domain {d} is listed by {reg._by_domain[d].id} and {e.id}")
                reg._by_domain[d] = e
            for h in e.hosts:
                if _bare(h) in reg._by_host:
                    raise RegistryError(f"host {h} is listed twice ({reg._by_host[_bare(h)].id}, {e.id})")
                reg._by_host[_bare(h)] = e
            if e.urls:
                reg._by_record.append(e)
            reg._names.append((institution_key(e.name), e))
        by_id = {e.id: e for e in entries}
        for e in entries:
            seen_chain, cur = {e.id}, e
            while cur.part_of is not None:
                if cur.part_of not in by_id:
                    raise RegistryError(f"registry entry {cur.id}: part_of {cur.part_of!r} is not a registry entry")
                cur = by_id[cur.part_of]
                if cur.id in seen_chain:
                    raise RegistryError(f"registry entry {e.id}: part_of forms a cycle")
                seen_chain.add(cur.id)
        for host, e in reg._by_host.items():
            covering = reg._domain_entry(host)
            if covering is not None and covering.id != e.id:
                raise RegistryError(f"host {host} ({e.id}) is under domain {registered_domain(host)} "
                                    f"({covering.id}); one host, one publisher")
        for e in reg._by_record:
            for u in e.urls:
                host = _bare(host_of(u))
                covering = reg._by_host.get(host) or reg._domain_entry(host)
                if covering is not None:
                    raise RegistryError(f"record {u} ({e.id}) is under {covering.id}; one page, one publisher")
                other = next((o for o in reg._by_record if o is not e and o.covers_url(u)), None)
                if other is not None:
                    raise RegistryError(f"record {u} is listed by {e.id} and {other.id}")
        return reg

    @classmethod
    def empty(cls, source="", missing=True):
        return cls(entries=(), source=str(source), missing=missing)

    def _domain_entry(self, host):
        labels = _labels(host)
        for i in range(len(labels) - 1):
            e = self._by_domain.get(".".join(labels[i:]))
            if e is not None:
                return e
        return None

    def resolve(self, url):
        """The registry entry that published url (exact host, then registered domain), else None.
        Wrappers, look-alike hosts and non-canonical urls resolve to nothing; so does every host
        no entry lists (authority comes only from the registry)."""
        host = host_of(url)
        if host is None:
            return None
        record = next((e for e in self._by_record if e.covers_url(url)), None)
        return record or self._by_host.get(_bare(host)) or self._domain_entry(host)

    def holder_root(self, entry):
        """The registry entry a publisher counts as for G5: itself, or the entry it is part_of
        (followed to the top)."""
        by_id = {e.id: e for e in self.entries}
        while entry is not None and entry.part_of is not None and entry.part_of in by_id:
            entry = by_id[entry.part_of]
        return entry

    def claimed(self, institution):
        """The registry entry an institution text names: the entry's name, or the name followed
        by a sub-unit ("X Library, Special Collections"), after institution_key()."""
        key = institution_key(institution) if isinstance(institution, str) else ""
        if not key:
            return None
        best = None
        for name_key, e in self._names:
            if name_key and (key == name_key or key.startswith(name_key + " ")):
                if best is None or len(name_key) > len(institution_key(best.name)):
                    best = e
        return best


def load(path):
    """The registry at path; a missing file is an empty registry (nothing resolves)."""
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return Registry.empty(source=str(path))
    except (OSError, UnicodeDecodeError) as exc:
        raise RegistryError(f"{path}: {exc}") from exc
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise RegistryError(f"{path} is not valid JSON ({exc})") from exc
    return Registry.from_dict(data, source=str(path))


# --- institution names (only to detect a source naming a registered holder) --------------------------

_ABBREVIATIONS = {
    "univ": "university", "lib": "library", "natl": "national", "nat": "national",
    "dept": "department", "inst": "institute", "intl": "international", "amer": "american",
    "assn": "association", "assoc": "association", "soc": "society", "coll": "college",
    "mus": "museum", "hist": "historical", "admin": "administration", "govt": "government",
    "ctr": "center", "centre": "center", "mt": "mount",
}


def _singular(word):
    if len(word) > 4 and word.endswith("ies"):
        return word[:-3] + "y"
    if len(word) > 3 and word.endswith("s") and not word.endswith(("ss", "us", "is")):
        return word[:-1]
    return word


def institution_key(name):
    """Comparison form of an institution name: case, punctuation, a parenthetical, "the",
    common abbreviations and plurals do not make two names differ."""
    if not isinstance(name, str):
        return ""
    text = normalize_text(name)
    text = re.sub(r"\([^)]*\)|\[[^\]]*\]", " ", text).replace("&", " and ")
    out = []
    for w in re.findall(r"[^\W_]+(?:'[^\W_]+)?", text):
        w = _ABBREVIATIONS.get(w, w)
        if w != "the":
            out.extend(_singular(x) for x in w.split())
    return " ".join(out)


# --- standing of one source ------------------------------------------------------------------------

@dataclass(frozen=True)
class Standing:
    entry: Entry | None    # the publisher the url resolves to
    claimed: Entry | None  # the registered holder the institution text names
    site: str | None       # registered domain of the url's host
    in_primary_scope: bool = False  # the url is under one of the entry's primary_paths
    in_document_scope: bool = True  # the url is on one of the entry's document_paths (content_part entries)
    content_part: str | None = None  # the source's content_part

    def part_ok(self):
        """True unless the entry counts only for one part of a page and the source is not that part."""
        return self.entry is None or self.entry.content_part is None or self.content_part == self.entry.content_part

    def scope_ok(self):
        """True unless the entry counts only on document pages and the url is not one (the flag on
        the record never widens this)."""
        return self.entry is None or self.in_document_scope

    def allows(self, stype):
        """True if the source may have this type: secondary always; institutional when the entry
        lists it; primary when the entry lists it and the page is under its primary_paths. An
        entry limited to one content part allows neither unless the source is that part."""
        if stype == "secondary":
            return True
        if self.entry is None or stype not in self.entry.may_be or not self.part_ok() or not self.scope_ok():
            return False
        return stype != "primary" or self.in_primary_scope

    root_ids: frozenset = frozenset()  # the holders the entry and claimed name count as (part_of)

    def holder_ids(self):
        return {e.id for e in (self.entry, self.claimed) if e is not None} | set(self.root_ids)

    def same_holder(self, other):
        """One holder for G5: a shared registry entry (by url or by a name claiming it), or the
        same registered domain when at least one side is unregistered. Two different registry
        entries are two holders even on one registered domain (hosts on a shared platform)."""
        if self.holder_ids() & other.holder_ids():
            return True
        if self.site and self.site == other.site:
            return self.entry is None or other.entry is None
        return False


def standing(source, registry):
    source = source if isinstance(source, dict) else {}
    url = source.get("url")
    host = host_of(url)
    entry = registry.resolve(url)
    part = source.get("content_part")
    claimed = registry.claimed(source.get("institution"))
    roots = frozenset(r.id for r in (registry.holder_root(entry), registry.holder_root(claimed)) if r is not None)
    return Standing(entry=entry, claimed=claimed, root_ids=roots,
                    site=registered_domain(host) if host else None,
                    in_primary_scope=entry is not None and entry.primary_scope(url),
                    in_document_scope=entry is None or entry.in_document_scope(url),
                    content_part=part if isinstance(part, str) else None)


def strong(source, registry):
    """True if the source is primary or institutional and the registry allows that type."""
    stype = source.get("type") if isinstance(source, dict) else None
    return stype in STRONG_TYPES and standing(source, registry).allows(stype)


def source_problems(source, registry):
    """G9 authority problems with one source record; [] when its type and institution stand."""
    st = standing(source, registry)
    stype, inst = source.get("type"), source.get("institution")
    host = host_of(source.get("url")) or source.get("url")
    where = registry.source or "data/registry/institutions.json"
    out = []
    bad_url = urls.problem(source.get("url"))
    if bad_url:
        out.append(f"{bad_url}; the registry and the site would disagree on its publisher")
    part = source.get("content_part")
    if part is not None and st.entry is not None and st.entry.content_part is not None and not st.scope_ok():
        # any type, secondary included: a flagged source on a non-document page is refused outright
        out.append(f"content_part {part!r} on {host}: not a document-transcription page of {st.entry.name} "
                   f"(registry {st.entry.id} document_paths: {', '.join(st.entry.document_paths)}, no query "
                   f"string). The flag never widens the registry's scope; remove it and keep the source secondary")
    if stype in STRONG_TYPES and not st.allows(stype):
        if st.entry is None:
            out.append(f"type {stype!r} needs a publisher in the authority registry ({where}); {host} is not "
                       f"in it. Mark the source secondary, cite the holder's own page, or ask a person to add "
                       f"the publisher (SKILL: proposing a registry entry)")
        elif stype in st.entry.may_be and not st.scope_ok():
            out.append(f"type {stype!r} is allowed for {st.entry.name} only on its document-transcription pages "
                       f"(registry {st.entry.id} document_paths: {', '.join(st.entry.document_paths)}, no query "
                       f"string); this url is not one, whatever content_part says. Front matter, editorial "
                       f"introductions, indexes, annotation and translation pages never count. Mark the source "
                       f"secondary")
        elif stype in st.entry.may_be and not st.part_ok():
            out.append(f"type {stype!r} is allowed for {st.entry.name} only for a source with content_part "
                       f"{st.entry.content_part!r} (registry {st.entry.id}): the word-for-word "
                       f"{st.entry.content_part} of the original document, never editors' notes, introductions, "
                       f"footnotes or commentary. Set content_part and mark that text in the snapshot, or mark "
                       f"the source secondary")
        elif stype in st.entry.may_be:
            scope = ", ".join(st.entry.primary_paths) or f"none listed, and a {st.entry.kind} is not a records holder"
            out.append(f"type 'primary' is allowed for {st.entry.name} only on its original-record pages "
                       f"(registry {st.entry.id} primary_paths: {scope}); this page is not one. Mark it "
                       f"institutional, or ask a person to add its record path to primary_paths")
        else:
            out.append(f"type {stype!r} is not allowed for {st.entry.name} (registry {st.entry.id} may be "
                       f"{', '.join(st.entry.may_be)})")
    if st.entry is not None:
        if inst != st.entry.name:
            out.append(f"institution {inst!r} must be the registry name {st.entry.name!r} ({st.entry.id})")
    elif st.claimed is not None:
        out.append(f"institution {inst!r} names the registered holder {st.claimed.name!r}, but the url is not on "
                   f"its domains ({', '.join(st.claimed.domains + st.claimed.hosts + st.claimed.urls)}); cite the holder's own "
                   f"page (an archive copy goes in archive_url) or name the site that published this page")
    return out


def supporting_only(source, registry):
    """True if the source's publisher is a supporting-only registry entry (never a sole source)."""
    e = registry.resolve(source.get("url")) if isinstance(source, dict) else None
    return e is not None and e.supporting_only


def media_only_problem(source, registry):
    """Why a source may not back a fact (a media-only publisher, on any of its hosts), else None."""
    url = source.get("url") if isinstance(source, dict) else None
    e = registry.resolve(url)
    if e is not None and e.media_only:
        return f"{e.name} is a media source only; it cannot be evidence for a fact"
    site = registered_domain(host_of(url)) if host_of(url) else None
    if site in MEDIA_ONLY_SITES:
        return f"{host_of(url)} is a media or discovery site ({site}); it cannot be evidence for a fact"
    return None


def independent_groups(sources, registry, joined=None):
    """Group sources that count as one holder (Standing.same_holder, joined transitively): the
    same registry entry, an institution text naming a registered holder, or the same registered
    domain when one side is unregistered. joined(a, b), when given, is a further reason two
    sources are one holder (G5 passes gates.same_text: copied quotes or a derived_from link).
    Returns lists of sources; a source with no canonical url and no claimed holder is not
    counted."""
    groups = []  # [([standings], [members])]
    for s in sources:
        st = standing(s, registry)
        if not st.site and not st.holder_ids():
            continue
        merged = [g for g in groups if any(st.same_holder(o) for o in g[0])
                  or (joined is not None and any(joined(s, m) for m in g[1]))]
        for g in merged:
            groups.remove(g)
        groups.append(([o for g in merged for o in g[0]] + [st], [m for g in merged for m in g[1]] + [s]))
    return [g[1] for g in groups]
