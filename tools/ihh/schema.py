"""The record schema (SPEC section 3): one definition, used where records are checked and where
they are written.

Rule: every record is schema-validated at the moment it is written, so a bad record can never
land. tools/validate.py reports these checks as SCHEMA problems for whole packages;
ihh/records.py runs the same checks on each new or changed record before it writes a main record
file (paths.record_kind), and tools that write several files (merge_staging.py, apply_review.py,
fetch_snapshot.py) run them on everything first, so a refused write leaves every file as it was.

record_problems(kind, record, ...) returns (errors, warnings) for one record, each message
prefixed with the record id (or its file position for id-less rows), exactly as validate.py
reports it. Kinds: inductee, source, fact, media, search, decision, grounding, profile.

Python 3.12 standard library only.
"""

import calendar
import re

from . import authority, gates, normalize, urls
from . import rights
from .rights import EMBEDDABLE

CATEGORIES = ("identity", "birth", "family", "education", "immigration", "citizenship", "career",
              "work", "invention", "award", "quote", "death", "legacy", "other")
SOURCE_TYPES = ("primary", "institutional", "secondary")
FETCH_METHODS = ("http", "api", "browser", "manual")
STATUSES = ("verified", "single-source", "disputed", "pending", "conflicting", "rejected")
REVIEW_STATES = ("pending", "approved", "edited", "rejected")
EXTRACTOR_VERDICTS = ("supported", "withdrawn")
ADVERSARY_VERDICTS = ("supported", "refuted", "unclear")
LIVE_RESULTS = ("yes", "no", "unreachable")
# Per-source live results (adversary.live_by_source, owner-approved 2026-10-10; SPEC 3.3, G10).
LIVE_SOURCE_RESULTS = ("found", "not_found", "unreachable")
MEDIA_TYPES = ("image", "audio", "video", "document", "3d", "panorama")
LICENSES = ("public-domain", "cc0", "cc-by", "cc-by-sa", "rights-restricted", "unknown")
# Media record kinds (owner decision 2026-10-16; SPEC 3.4.2). "item" (the default when absent): media
# about the inductee. "basis-photo": a photograph (or survey drawing) used only as the basis for
# rebuilding a room or place, linked to the stop fact(s) it serves in basis_for.
MEDIA_RECORD_KINDS = ("item", "basis-photo")
BASIS_MEDIA_TYPES = ("image", "document")
_FACT_ID = re.compile(r"^[A-Z]{3}-F-\d{4,}$")
ACTIONS = ("approve", "edit", "reject", "note")
SPEAKERS = ("inductee", "guide")
LINE_KINDS = ("quote", "narration")

_ISO_DAY = re.compile(r"^(\d{4})-(\d{2})-(\d{2})$")
_ISO_PARTIAL = re.compile(r"^\d{4}(?:-\d{2}(?:-\d{2})?)?$")
_HEX64 = re.compile(r"^[0-9a-f]{64}$")
_CODE = re.compile(r"^[A-Z]{3}$")
_ANY_ID = re.compile(r"\b[A-Z]{3}-[FSMQ]-\d{4,}\b")
GROUNDING_VERDICTS = ("supported", "refuted", "unclear")


# --- value tests -------------------------------------------------------------------------

def is_text(v):
    return isinstance(v, str) and bool(v.strip())


def is_str(v):
    return isinstance(v, str)


def is_https(v):
    """True for a canonical https URL (ihh.urls: the host a browser reaches is the host read)."""
    return isinstance(v, str) and v.startswith("https://") and urls.problem(v) is None


def is_iso_day(v):
    m = _ISO_DAY.match(v) if isinstance(v, str) else None
    if not m:
        return False
    year, month, day = (int(x) for x in m.groups())
    return 1 <= month <= 12 and 1 <= day <= calendar.monthrange(year, month)[1]


def is_iso_partial(v):
    return isinstance(v, str) and bool(_ISO_PARTIAL.match(v)) and normalize.parse_date_parts(v) is not None


def is_bool(v):
    return isinstance(v, bool)


def is_int(v):
    return isinstance(v, int) and not isinstance(v, bool)


def is_hex64(v):
    return isinstance(v, str) and bool(_HEX64.match(v))


def is_str_list(v):
    return isinstance(v, list) and all(isinstance(x, str) for x in v)


def one_of(values):
    def test(v):
        return v in values
    return test


def as_list(value):
    return value if isinstance(value, list) else []


def as_dict(value):
    return value if isinstance(value, dict) else {}


def _short(value, limit=60):
    text = repr(value)
    return text if len(text) <= limit else text[:limit - 3] + "..."


# --- checks -----------------------------------------------------------------------------------

class Fields:
    """Schema checks for one record; every problem is a SCHEMA error."""

    def __init__(self, report, rid, rec):
        self.report, self.rid, self.rec = report, rid, rec

    def err(self, message):
        self.report.error("SCHEMA", f"{self.rid}: {message}")

    def check(self, key, test, desc, nullable=False, required=True, label=None):
        label = label or key
        if key not in self.rec:
            if required:
                self.err(f"missing {label}")
            return False
        value = self.rec[key]
        if value is None:
            if not nullable:
                self.err(f"{label} must be {desc}, not null")
            return False
        if not test(value):
            self.err(f"{label} must be {desc} (got {_short(value)})")
            return False
        return True

    def sub(self, key):
        value = self.rec.get(key)
        return Fields(self.report, self.rid, value if isinstance(value, dict) else {})


def check_inductee(report, inductee, slug):
    f = Fields(report, "inductee.json", inductee)
    if f.check("slug", is_text, "a non-empty string") and slug is not None and inductee["slug"] != slug:
        f.err(f"slug {inductee['slug']!r} does not match the folder name {slug!r}")
    f.check("code", lambda v: isinstance(v, str) and bool(_CODE.match(v)), "3 uppercase letters")
    f.check("name", is_text, "a non-empty string")
    f.check("aliases", is_str_list, "a list of strings")
    if f.check("authority", lambda v: isinstance(v, dict), "an object"):
        for key, value in inductee["authority"].items():
            if value is not None and not isinstance(value, str):
                f.err(f"authority.{key} must be a string or null")
        loc = inductee["authority"].get("loc_naf")
        if loc is not None and not is_https(loc):
            f.err(f"authority.loc_naf must be an https URL (got {_short(loc)})")
    f.check("birth_year", is_int, "an integer", nullable=True, required=False)
    f.check("death_year", is_int, "an integer", nullable=True, required=False)
    f.check("ihh_url", is_https, "an https URL", nullable=True, required=False)
    if f.check("runs", lambda v: isinstance(v, list), "a list"):
        for i, run in enumerate(inductee["runs"]):
            rf = Fields(report, f"inductee.json runs[{i}]", run if isinstance(run, dict) else {})
            rf.check("run_id", is_text, "a non-empty string")
            rf.check("date", is_iso_day, "a YYYY-MM-DD date")


_SOURCE_ID = re.compile(r"^[A-Z]{3}-S-\d{4,}$")


def check_source(report, s, sources_by_id=None):
    """One source record. sources_by_id ({id: source}, the package being checked or written)
    lets derived_from be checked against the package; without it only its form is checked."""
    rid = s.get("id")
    f = Fields(report, rid, s)
    f.check("title", is_text, "a non-empty string")
    f.check("institution", is_text, "a non-empty string")
    f.check("type", one_of(SOURCE_TYPES), f"one of {', '.join(SOURCE_TYPES)}")
    f.check("url", is_https, "an https URL")
    f.check("fetch_url", is_https, "an https URL", nullable=True, required=False)
    f.check("catalog_id", is_str, "a string", nullable=True, required=False)
    f.check("published", is_iso_partial, "an ISO date or partial date", nullable=True, required=False)
    f.check("accessed", is_iso_day, "a YYYY-MM-DD date")
    f.check("archive_url", is_https, "an https URL", nullable=True, required=False)
    f.check("notes", is_str, "a string", nullable=True, required=False)
    has_snapshot = f.check("snapshot", is_str, "a string", nullable=True, required=False)
    f.check("snapshot_sha256", is_hex64, "a sha256 hex digest", nullable=True, required=False)
    f.check("fetch_method", one_of(FETCH_METHODS), f"one of {', '.join(FETCH_METHODS)}",
            nullable=True, required=False)
    if has_snapshot:
        if s["snapshot"] != f"snapshots/{rid}.txt":
            f.err(f"snapshot must be snapshots/{rid}.txt (got {_short(s['snapshot'])})")
        if not s.get("snapshot_sha256"):
            f.err("snapshot is set but snapshot_sha256 is not")
        if not s.get("fetch_method"):
            f.err("snapshot is set but fetch_method is not")
    elif s.get("snapshot_sha256"):
        f.err("snapshot_sha256 is set but snapshot is not")
    # derived_from (G5 independence, 2026-10-10): the id of another source in this package whose
    # text this source reproduces or follows; the two count as one holder.
    if f.check("derived_from", lambda v: isinstance(v, str) and bool(_SOURCE_ID.match(v)),
               "a source id such as ABC-S-0001", nullable=True, required=False):
        origin = s["derived_from"]
        if origin == rid:
            f.err("derived_from may not name the source itself")
        elif sources_by_id is not None and origin not in sources_by_id:
            f.err(f"derived_from names unknown source {origin}")
    # content_part (owner decision 2026-10-10): the part of the page the source's quotes come from.
    # "transcription": only the word-for-word transcription of the original document, which the
    # snapshot marks; the gates read only that text (authority.CONTENT_PARTS, gates.quotable_text).
    f.check("content_part", one_of(authority.CONTENT_PARTS), f"one of {', '.join(authority.CONTENT_PARTS)}",
            required=False)


def check_adversary(f):
    a = f.sub("adversary")
    a.check("model", is_text, "a non-empty string", label="adversary.model")
    a.check("run_id", is_text, "a non-empty string", label="adversary.run_id")
    a.check("date", is_iso_day, "a YYYY-MM-DD date", label="adversary.date")
    a.check("verdict", one_of(ADVERSARY_VERDICTS), f"one of {', '.join(ADVERSARY_VERDICTS)}",
            label="adversary.verdict")
    a.check("quote_in_live", one_of(LIVE_RESULTS), f"one of {', '.join(LIVE_RESULTS)}",
            label="adversary.quote_in_live")
    for key in ("quote_in_snapshot", "entailed", "adds_information", "atomic", "source_type_ok"):
        a.check(key, is_bool, "true or false", label=f"adversary.{key}")
    a.check("rationale", is_str, "a string", label="adversary.rationale")
    check_live_by_source(a, f.rec.get("adversary") if isinstance(f.rec.get("adversary"), dict) else {})
    a.check("judged_sha256", is_hex64, "a sha256 hex digest", required=False, label="adversary.judged_sha256")
    # A publisher the adversary thinks could be added to the authority registry: advice for a
    # person (data/registry/PROPOSED.md), never a reason to fail the record (SPEC 4, G4).
    a.check("registry_suggestion", is_str, "a string", nullable=True, required=False,
            label="adversary.registry_suggestion")


def live_summary(entries):
    """The per-fact quote_in_live that per-source live results imply: "no" if any source is
    not_found, else "unreachable" if any is unreachable (or there are none), else "yes".
    adversary.py stores it next to live_by_source so readers of the per-fact field (export,
    REVIEW.md) stay correct."""
    entries = entries if isinstance(entries, list) else []
    results = {e.get("result") for e in entries if isinstance(e, dict)}
    if "not_found" in results:
        return "no"
    if "unreachable" in results or not entries:
        return "unreachable"
    return "yes"


def live_by_source_problems(entries):
    """Shape problems with adversary.live_by_source: a list of {source_id, result, url} with
    one entry per source id; [] when valid."""
    if not isinstance(entries, list):
        return [f"adversary.live_by_source must be a list (got {_short(entries)})"]
    out, seen = [], set()
    for n, e in enumerate(entries, 1):
        label = f"adversary.live_by_source {n}"
        if not isinstance(e, dict):
            out.append(f"{label} must be an object")
            continue
        extra = sorted(set(e) - {"source_id", "result", "url"})
        if extra:
            out.append(f"{label}: unexpected key(s) {', '.join(extra)}")
        sid = e.get("source_id")
        if not is_text(sid):
            out.append(f"{label}: source_id must be a source id")
        elif sid in seen:
            out.append(f"{label}: source {sid} appears more than once")
        else:
            seen.add(sid)
        if e.get("result") not in LIVE_SOURCE_RESULTS:
            out.append(f"{label}: result must be one of {', '.join(LIVE_SOURCE_RESULTS)} "
                       f"(got {_short(e.get('result'))})")
        url = e.get("url")
        if not (isinstance(url, str) and url.startswith(("https://", "http://")) and len(url.split()) == 1):
            out.append(f"{label}: url must be the http(s) URL checked (got {_short(url)})")
    return out


def check_live_by_source(a, adversary):
    """live_by_source is optional (verdicts before 2026-10-10 lack it and keep the per-fact G10
    rule); when present it must be well formed and quote_in_live must be its summary."""
    if "live_by_source" not in adversary:
        return
    entries = adversary["live_by_source"]
    problems = live_by_source_problems(entries)
    for x in problems:
        a.err(x)
    if not problems and adversary.get("quote_in_live") != live_summary(entries):
        a.err(f"adversary.quote_in_live must be {live_summary(entries)!r}, the summary of live_by_source "
              f"(got {_short(adversary.get('quote_in_live'))})")


def check_review(f, rec):
    if not f.check("review", lambda v: isinstance(v, dict), "an object"):
        return
    r = f.sub("review")
    r.check("state", one_of(REVIEW_STATES), f"one of {', '.join(REVIEW_STATES)}", label="review.state")
    decided = rec["review"].get("state") in ("approved", "edited", "rejected")
    r.check("reviewer", is_text, "a non-empty string", nullable=not decided, required=decided,
            label="review.reviewer")
    r.check("date", is_iso_day, "a YYYY-MM-DD date", nullable=not decided, required=decided,
            label="review.date")
    r.check("note", is_str, "a string", nullable=True, required=False, label="review.note")


def check_fact(report, fact, slug, sources_by_id):
    rid = fact.get("id")
    f = Fields(report, rid, fact)
    if f.check("inductee", is_text, "a non-empty string") and slug is not None and fact["inductee"] != slug:
        f.err(f"inductee {fact['inductee']!r} does not match {slug!r}")
    f.check("claim", is_text, "a non-empty string")
    f.check("category", one_of(CATEGORIES), f"one of {', '.join(CATEGORIES)}")
    f.check("event_date", is_iso_partial, "an ISO date or partial date", nullable=True, required=False)
    f.check("place", is_str, "a string", nullable=True, required=False)
    if f.check("evidence", lambda v: isinstance(v, list) and len(v) > 0, "a non-empty list"):
        for i, item in enumerate(fact["evidence"], 1):
            ef = Fields(report, rid, item if isinstance(item, dict) else {})
            ef.check("source_id", is_text, "a source id", label=f"evidence {i} source_id")
            ef.check("quote", is_text, "a non-empty string", label=f"evidence {i} quote")
            ef.check("locator", is_str, "a string", label=f"evidence {i} locator")
    f.check("primary_document", is_bool, "true or false")
    f.check("is_direct_quote", is_bool, "true or false")
    if f.check("extractor", lambda v: isinstance(v, dict), "an object"):
        e = f.sub("extractor")
        e.check("model", is_text, "a non-empty string", label="extractor.model")
        e.check("run_id", is_text, "a non-empty string", label="extractor.run_id")
        e.check("date", is_iso_day, "a YYYY-MM-DD date", label="extractor.date")
        e.check("verdict", one_of(EXTRACTOR_VERDICTS), f"one of {', '.join(EXTRACTOR_VERDICTS)}",
                label="extractor.verdict")
    if f.check("adversary", lambda v: isinstance(v, dict), "an object", nullable=True):
        check_adversary(f)
    f.check("status", one_of(STATUSES), f"one of {', '.join(STATUSES)}")
    f.check("verified_claim_sha256", is_hex64, "a sha256 hex digest", nullable=True, required=False)
    f.check("used_in", is_str_list, "a list of strings", required=False)
    check_review(f, fact)
    f.check("notes", is_str, "a string", nullable=True, required=False)

    types = [sources_by_id[e.get("source_id")].get("type") for e in as_list(fact.get("evidence"))
             if isinstance(e, dict) and gates.known(sources_by_id, e.get("source_id"))]
    if fact.get("primary_document") is True and "primary" not in types:
        f.err("primary_document is true but no evidence source has type primary")
    elif fact.get("primary_document") is False and "primary" in types:
        report.warn("SCHEMA", f"{rid}: evidence includes a primary source but primary_document is false")


def check_media(report, m, sources_by_id):
    rid = m.get("id")
    f = Fields(report, rid, m)
    f.check("title", is_text, "a non-empty string")
    f.check("media_type", one_of(MEDIA_TYPES), f"one of {', '.join(MEDIA_TYPES)}")
    f.check("source_ids", lambda v: is_str_list(v) and len(v) > 0, "a non-empty list of source ids")
    f.check("url", is_https, "an https URL")
    f.check("license_class", one_of(LICENSES), f"one of {', '.join(LICENSES)}")
    reconstruction = m.get("reconstruction") is True
    needs_rights = m.get("license_class") in EMBEDDABLE and not reconstruction
    f.check("rights_statement", is_text, "a non-empty string (verbatim from the holder)",
            nullable=not needs_rights, required=needs_rights)
    f.check("rights_url", is_https, "an https URL", nullable=not needs_rights, required=needs_rights)
    f.check("credit", is_text, "a non-empty string")
    f.check("alt_text", is_text, "a non-empty string")
    f.check("reconstruction", is_bool, "true or false")
    if reconstruction:
        f.check("reconstruction_basis", lambda v: is_str_list(v) and len(v) > 0,
                "a non-empty list of fact and source ids")
    else:
        f.check("reconstruction_basis", is_str_list, "a list of ids", nullable=True, required=False)
    if f.check("record_kind", one_of(MEDIA_RECORD_KINDS), f"one of {', '.join(MEDIA_RECORD_KINDS)}",
               nullable=True, required=False) and m["record_kind"] == "basis-photo":
        f.check("basis_for", lambda v: isinstance(v, list) and len(v) > 0
                and all(isinstance(x, str) and _FACT_ID.match(x) for x in v),
                "a non-empty list of the stop fact ids this basis photo serves")
        if reconstruction:
            f.err("a basis photo is the holder's photograph, never a reconstruction (reconstruction must be false)")
        if m.get("media_type") not in BASIS_MEDIA_TYPES:
            f.err(f"media_type of a basis photo must be one of {', '.join(BASIS_MEDIA_TYPES)}")
    elif m.get("basis_for") not in (None, []):
        f.err("basis_for is only used on a record_kind basis-photo record")
    if f.check("authorship", lambda v: isinstance(v, dict), "an object", nullable=True, required=False):
        check_authorship(f, m["authorship"])
    if f.check("adversary", lambda v: isinstance(v, dict), "an object", nullable=True):
        check_adversary(f)
    f.check("status", one_of(STATUSES), f"one of {', '.join(STATUSES)}")
    f.check("verified_claim_sha256", is_hex64, "a sha256 hex digest", nullable=True, required=False)
    check_review(f, m)
    f.check("notes", is_str, "a string", nullable=True, required=False)


_SOURCE_ID = re.compile(r"^[A-Z]{3}-S-\d{4,}$")


def _basis_error(basis):
    """Why a death or publication basis is malformed, or None: {fact_id} or {source_id, quote}."""
    if not isinstance(basis, dict):
        return "must be an object {fact_id} or {source_id, quote}"
    if "fact_id" in basis:
        if not (isinstance(basis["fact_id"], str) and _FACT_ID.match(basis["fact_id"])):
            return "fact_id must be a fact id"
        return None
    if "source_id" in basis:
        if not (isinstance(basis["source_id"], str) and _SOURCE_ID.match(basis["source_id"])):
            return "source_id must be a source id"
        if not is_text(basis.get("quote")):
            return "a source basis needs the quote copied from that source's snapshot"
        return None
    return "must name a fact_id or a source_id with a quote"


def check_authorship(f, a):
    """Private writings (owner decision 2026-10-20, SPEC 3.4.3): {kind, authors, published?, note?}."""
    if a.get("kind") not in rights.AUTHORSHIP_KINDS:
        f.err(f"authorship.kind must be one of {', '.join(rights.AUTHORSHIP_KINDS)} (got {_short(a.get('kind'))})")
    authors = a.get("authors")
    if not isinstance(authors, list):
        f.err("authorship.authors must be a list (empty only for a federal record)")
        authors = []
    for n, au in enumerate(authors, 1):
        where = f"authorship.authors[{n}]"
        if not isinstance(au, dict):
            f.err(f"{where} must be an object {{name, death_year, death_basis}}")
            continue
        if not is_text(au.get("name")):
            f.err(f"{where}.name must be a non-empty string")
        year = au.get("death_year")
        if year is not None and not is_int(year):
            f.err(f"{where}.death_year must be a year (an integer) or null")
        if is_int(year):
            problem = _basis_error(au.get("death_basis"))
            if problem:
                f.err(f"{where}.death_basis {problem} (a death year needs a verified fact or an authority-record quote)")
        elif au.get("death_basis") is not None:
            f.err(f"{where}.death_basis is set but death_year is null")
    pub = a.get("published")
    if pub is not None:
        if not isinstance(pub, dict) or not is_int(pub.get("year")):
            f.err("authorship.published must be {year, basis} with an integer year")
        else:
            problem = _basis_error(pub.get("basis"))
            if problem:
                f.err(f"authorship.published.basis {problem}")
    if "note" in a and not isinstance(a["note"], (str, type(None))):
        f.err("authorship.note must be a string")


def check_search(report, s):
    f = Fields(report, s.get("id"), s)
    f.check("date", is_iso_day, "a YYYY-MM-DD date")
    f.check("family", is_text, "a non-empty string")
    f.check("tool", is_text, "a non-empty string")
    f.check("query", is_text, "a non-empty string")
    f.check("results", lambda v: is_int(v) and v >= 0,
            "a count (an integer, or null when unknown; commentary goes in notes)", nullable=True)
    f.check("produced", is_str_list, "a list of ids")
    f.check("agent", is_str, "a string", nullable=True)
    f.check("run_id", is_str, "a string", nullable=True)
    f.check("notes", is_str, "a string", nullable=True, required=False)


def check_decision(report, d, n):
    f = Fields(report, f"review/decisions.jsonl:{n}", d)
    f.check("date", is_iso_day, "a YYYY-MM-DD date")
    f.check("reviewer", is_text, "a non-empty string")
    f.check("item_id", is_text, "a record id")
    f.check("action", one_of(ACTIONS), f"one of {', '.join(ACTIONS)}")
    f.check("note", is_str, "a string", nullable=True, required=False)


def check_grounding_row(report, row, n):
    f = Fields(report, f"drafts/grounding.jsonl:{n}", row)
    f.check("location", is_text, "a draft location")
    f.check("unit_sha256", is_hex64, "a sha256 hex digest")
    f.check("model", is_text, "a non-empty string")
    f.check("run_id", is_str, "a string", nullable=True)
    f.check("date", is_iso_day, "a YYYY-MM-DD date")
    f.check("verdict", one_of(GROUNDING_VERDICTS), f"one of {', '.join(GROUNDING_VERDICTS)}")
    f.check("adds_information", is_bool, "true or false")
    f.check("rationale", is_str, "a string")


def check_profile_schema(report, profile, slug):
    f = Fields(report, "drafts/profile.json", profile)
    if f.check("slug", is_text, "a non-empty string") and slug is not None and profile["slug"] != slug:
        f.err(f"slug {profile['slug']!r} does not match {slug!r}")
    f.check("generated", is_iso_day, "a YYYY-MM-DD date")
    f.check("run_id", is_str, "a string", nullable=True)
    f.check("how_to_cite", is_str, "a string", nullable=True, required=False)
    f.check("gaps", is_str_list, "a list of strings", required=False)

    def items(key):
        if f.check(key, lambda v: isinstance(v, list), "a list"):
            return [(i, x if isinstance(x, dict) else {}) for i, x in enumerate(profile[key])]
        return []

    for i, item in items("summary"):
        g = Fields(report, f"profile:summary:{i}", item)
        g.check("text", is_text, "a non-empty string")
        g.check("fact_ids", is_str_list, "a list of fact ids")
    seen = set()
    for j, section in items("sections"):
        g = Fields(report, f"profile:sections[{j}]", section)
        if g.check("id", is_text, "a non-empty string"):
            if section["id"] in seen:
                g.err(f"duplicate section id {section['id']!r}")
            seen.add(section["id"])
        g.check("title", is_text, "a non-empty string")
        if g.check("sentences", lambda v: isinstance(v, list), "a list"):
            for k, sentence in enumerate(section["sentences"]):
                h = Fields(report, f"profile:sections:{section.get('id')}:{k}",
                           sentence if isinstance(sentence, dict) else {})
                h.check("text", is_text, "a non-empty string")
                h.check("fact_ids", is_str_list, "a list of fact ids")
    for i, entry in items("timeline"):
        g = Fields(report, f"profile:timeline:{i}", entry)
        g.check("date", is_iso_partial, "an ISO date or partial date")
        g.check("title", is_text, "a non-empty string")
        g.check("text", is_text, "a non-empty string")
        g.check("fact_ids", is_str_list, "a list of fact ids")
        g.check("media_ids", is_str_list, "a list of media ids", required=False)
    for i, artifact in items("artifacts"):
        g = Fields(report, f"profile:artifacts:{i}", artifact)
        g.check("media_id", is_text, "a media id")
        g.check("caption", is_text, "a non-empty string")
        g.check("fact_ids", is_str_list, "a list of fact ids")
    for i, line in items("avatar_lines"):
        g = Fields(report, f"profile:avatar_lines:{i}", line)
        g.check("speaker", one_of(SPEAKERS), f"one of {', '.join(SPEAKERS)}")
        g.check("kind", one_of(LINE_KINDS), f"one of {', '.join(LINE_KINDS)}")
        g.check("text", is_text, "a non-empty string")
        g.check("fact_ids", is_str_list, "a list of fact ids")


# --- one record at a time -----------------------------------------------------------------------

class Collector:
    """A minimal report for schema checks: SCHEMA errors and warnings, as messages."""

    def __init__(self):
        self.errors = []
        self.warnings = []

    def error(self, gate, message):
        self.errors.append(message)

    def warn(self, gate, message):
        self.warnings.append(message)


KINDS = ("inductee", "source", "fact", "media", "search", "decision", "grounding", "profile")


def record_problems(kind, record, *, slug=None, sources_by_id=None, position=None):
    """(errors, warnings) for one record of this kind, as validate.py reports them.

    slug is the inductee folder name (facts, the inductee record and the profile name it);
    sources_by_id ({id: source}) lets a fact's primary_document be checked against its
    sources; position is the 1-based line of an id-less row (decision, grounding).
    """
    out = Collector()
    if not isinstance(record, dict):
        out.errors.append(f"{kind} record must be a JSON object (got {_short(record)})")
        return out.errors, out.warnings
    sources_by_id = sources_by_id if isinstance(sources_by_id, dict) else {}
    n = position or 0
    if kind == "inductee":
        check_inductee(out, record, slug)
    elif kind == "source":
        check_source(out, record, sources_by_id)
    elif kind == "fact":
        check_fact(out, record, slug, sources_by_id)
    elif kind == "media":
        check_media(out, record, sources_by_id)
    elif kind == "search":
        check_search(out, record)
    elif kind == "decision":
        check_decision(out, record, n)
    elif kind == "grounding":
        check_grounding_row(out, record, n)
    elif kind == "profile":
        check_profile_schema(out, record, slug)
    else:
        raise ValueError(f"unknown record kind {kind!r}; expected one of {', '.join(KINDS)}")
    return out.errors, out.warnings
