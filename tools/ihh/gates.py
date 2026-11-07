"""Deterministic gates (SPEC section 4).

Every gate is a pure function over records already in memory and returns a
list of failure strings; an empty list means the gate passes. Reading files
(snapshots, JSON Lines) happens in ihh.records; turning gate results into a
status happens in tools/compute_status.py.

    G1   evidence quotes appear in their source snapshots; snapshot hashes agree
    G2   the claim contains no content word, date, number or code its evidence lacks
         (normalize.content_tokens); for media, the title and alt text add none beyond
         the item's sources and cited facts
    G5   corroboration: counting only sources whose own quotes cover the whole claim (and its
         event_date and place), a primary document, or 2+ independent holders incl. one primary
         or institutional source; types and holders come from the authority registry
         (ihh/authority.py), and two sources whose quotes are the same text (copied_quotes) or
         that derive one from the other (derived_from) are one holder
    G7   edit lock: a verified claim has not changed since verification
    G9   source authority: a primary or institutional source is published by a registry
         entry that allows that type, under the registry's name; a media-only publisher
         backs no fact; banned hosts (Wikipedia, Wikidata, quote sites) as defence in depth
    G10  snapshot integrity: browser/manual snapshots need the quote found live
    G11  identity: a fact of category identity establishes a name the inductee was known
         by, so its claim contains one of the aliases in inductee.json; catalogue metadata
         (headings, control numbers, field names) is provenance, not a fact

primary_document() derives a fact's primary_document flag from its evidence.

The adversary verdict (G3, G4) is judged by a model; adversary_failures() reads
the recorded verdict.
"""

import difflib
import hashlib
import json
import re
from dataclasses import dataclass, field
from urllib.parse import unquote, urlsplit

from . import authority, fetchplan, ids, rights
from .normalize import (PartialDate, claim_sha256, contains_normalized, content_tokens, fold_token,
                        is_capitalized, name_problem, name_words, normalize_text, parse_date_parts,
                        strip_enclosing_quotes)

STRONG_TYPES = authority.STRONG_TYPES
LIVE_CHECK_METHODS = ("browser", "manual")
MACHINE_FETCH_METHODS = ("http", "api")
BANNED_DOMAINS = ("wikipedia.org", "wikiquote.org", "wikidata.org", "goodreads.com",
                  "brainyquote.com", "quotefancy.com", "azquotes.com",
                  # Wikipedia under another name, and sites that republish its articles.
                  "wikipedia.com", "wikiwand.com", "wikimili.com", "wiki2.org", "wikizero.com", "dbpedia.org",
                  "wikipedia-on-ipfs.org", "kiwix.org", "wikiless.org", "infogalactic.com", "everipedia.org")
# Archives whose short links (archive.ph/abcd, ghostarchive.org/archive/abcd) hide the original
# page: archive.today and its mirrors, and ghostarchive.
SHORT_LINK_ARCHIVES = ("archive.ph", "archive.today", "archive.is", "archive.li", "archive.vn", "archive.md",
                       "archive.fo", "ghostarchive.org")
_WAYBACK = re.compile(r"^https?://(?:web\.|wayback\.)?archive\.org/web/[^/]+/(?P<inner>.+)$", re.I)
_EMBEDDED = re.compile(r"https?:/{1,2}[^\s\"'<>]+", re.I)
_CACHE = re.compile(r"cache:(?P<inner>[^\s&]+)", re.I)


@dataclass
class GateContext:
    """What the gates need besides the record itself.

    sources    {source_id: source record}
    snapshots  {source_id: records.Snapshot}
    names      the inductee's name plus aliases supported by identity evidence
    facts      {fact_id: fact record}, for reconstruction bases and verdict fingerprints
    registry   the authority registry (ihh.authority.Registry); empty unless given, so
               nothing is primary or institutional
    """
    sources: dict
    snapshots: dict
    names: list = field(default_factory=list)
    facts: dict = field(default_factory=dict)
    registry: authority.Registry = field(default_factory=authority.Registry.empty)
    aliases: list = field(default_factory=list)  # inductee.json aliases that are names (G11)
    _normalized: dict = field(default_factory=dict, repr=False)

    def snapshot_text(self, source_id):
        """Normalized quotable snapshot text (quotable_text), cached per text. Every quote check
        reads a snapshot through here, so a transcription source is only ever its transcription."""
        raw = self.quotable_raw(source_id)
        if raw is None:
            return None
        cached = self._normalized.get(raw)
        if cached is None:
            cached = self._normalized[raw] = normalize_text(raw)
        return cached

    def quotable_raw(self, source_id):
        """The snapshot text a quote may come from, before normalization (quotable_text)."""
        snap = self.snapshots.get(source_id)
        if snap is None or snap.text is None:
            return None
        return quotable_text(self.sources.get(source_id), snap.text)


def by_id(rows):
    """{id: record} for records whose id is a string; malformed ids are skipped."""
    return {r.get("id"): r for r in rows if isinstance(r, dict) and isinstance(r.get("id"), str)}


def known(mapping, key):
    """Membership test that tolerates malformed (unhashable) keys."""
    return isinstance(key, str) and key in mapping


def build_context(inductee, sources, snapshots, facts, registry):
    """Gate context; registry is the authority registry of the data folder (authority.load)."""
    ctx = GateContext(sources=by_id(sources), snapshots=dict(snapshots), facts=by_id(facts), registry=registry)
    inductee = inductee if isinstance(inductee, dict) else {}
    name = inductee.get("name")
    ctx.names = ([name] if isinstance(name, str) and name.strip() else []) + \
        supported_aliases(inductee, facts, ctx)
    aliases = inductee.get("aliases") if isinstance(inductee.get("aliases"), list) else []
    ctx.aliases = [a for a in aliases if isinstance(a, str) and a.strip() and not name_problem(a)]
    return ctx


def _evidence(record):
    ev = record.get("evidence")
    return [e for e in ev if isinstance(e, dict)] if isinstance(ev, list) else []


def _record_source_ids(record):
    """Source ids a fact (evidence) or media item (source_ids) rests on, in order."""
    if "evidence" in record:
        sids = [e.get("source_id") for e in _evidence(record)]
    else:
        sids = record.get("source_ids") if isinstance(record.get("source_ids"), list) else []
    out = []
    for sid in sids:
        if isinstance(sid, str) and sid not in out:
            out.append(sid)
    return out


# --- snapshots (shared by G1) --------------------------------------------------------

# Owner decision 2026-10-10 (Einstein Papers Project): a source with content_part
# "transcription" counts only for the word-for-word transcription of the original document. Its
# snapshot marks that text between TRANSCRIPTION_START and TRANSCRIPTION_END lines (one or more
# spans); everything else on the page (editors' introduction, notes, footnotes, commentary) is
# never quotable. Spans are joined with a break line so no quote can run from one into another.
_SPAN_BREAK = "\n[transcription break]\n"


def transcription_spans(text):
    """(spans, problem): the marked transcription spans of a snapshot text, and why the marking is
    unusable (unbalanced, nested, empty or missing), else problem None."""
    spans, current, problem = [], None, None
    for line in (text or "").splitlines():
        mark = line.strip()
        if mark == authority.TRANSCRIPTION_START:
            if current is not None:
                return [], "transcription markers are nested"
            current = []
        elif mark == authority.TRANSCRIPTION_END:
            if current is None:
                return [], "a transcription end marker has no start marker"
            if not "".join(current).strip():
                return [], "a marked transcription span is empty"
            spans.append("\n".join(current))
            current = None
        elif current is not None:
            current.append(line)
    if current is not None:
        problem = "a transcription start marker is never closed"
    elif not spans:
        problem = (f"no transcribed document text is marked (lines {authority.TRANSCRIPTION_START} and "
                   f"{authority.TRANSCRIPTION_END})")
    return ([] if problem else spans), problem


def is_transcription(source):
    return isinstance(source, dict) and source.get("content_part") == "transcription"


def quotable_text(source, text):
    """The part of a snapshot text that quotes may come from: for a content_part "transcription"
    source only its marked transcription spans ("" when the marking is unusable), else all of it."""
    if text is None or not is_transcription(source):
        return text
    spans, problem = transcription_spans(text)
    return "" if problem else _SPAN_BREAK.join(spans)


def snapshot_failures(source, snapshot):
    """Integrity problems with one source's snapshot; [] when it is usable."""
    sid = source.get("id")
    if not source.get("snapshot"):
        return [f"{sid} has no snapshot"]
    if snapshot is None:
        return [f"{sid} snapshot was not loaded"]
    if snapshot.error:
        return [f"{sid}: {snapshot.error}"]
    out = []
    if snapshot.meta is None:
        out.append(f"{sid}: snapshot meta file is missing")
    else:
        if snapshot.meta.get("sha256") != snapshot.sha256:
            out.append(f"{sid}: snapshot sha256 does not match the meta file")
        out.extend(f"{sid}: {x}" for x in meta_provenance_failures(source, snapshot.meta))
        out.extend(f"{sid}: {x}" for x in loc_full_text_header_failures(snapshot.text, snapshot.meta))
    if source.get("snapshot_sha256") != snapshot.sha256:
        out.append(f"{sid}: snapshot sha256 does not match the source record")
    if is_transcription(source):
        problem = transcription_spans(snapshot.text)[1]
        if problem:
            out.append(f"{sid}: content_part transcription, but {problem}; mark the transcribed document text "
                       f"in a fresh snapshot (never editors' notes or commentary)")
    return out


def loc_full_text_header_failures(text, meta):
    """A snapshot holding a LoC page's OCR text names, before the text, the page record's own
    segment and the full-text URL the meta file records (fetchplan.loc_full_text_header)."""
    if not isinstance(meta, dict) or "full_text_url" not in meta:
        return []
    header = fetchplan.loc_full_text_header(meta.get("segment_id"), meta.get("full_text_url"))
    if not isinstance(text, str) or ("\n" + header) not in text:
        return ["snapshot does not carry the segment_id and full_text_url lines its meta file records "
                "before the page's full text"]
    return []


def meta_provenance_failures(source, meta):
    """Problems showing the snapshot was not taken from the page the record names.

    tools/fetch_snapshot.py writes meta.url = the record's url, meta.method = its
    fetch_method, and, for http and api fetches, meta.fetch_url = the URL that
    fetchplan.plan_fetch() derives from the record. Any difference means the url
    was edited after the fetch or the meta file is not the tool's, so the link
    shown on the site is not the page the snapshot came from. The record's own
    fetch_url, and a browser/manual meta's fetch_url, must name the cited record
    itself (fetchplan.fetch_url_problem: the url, or the endpoint an adapter
    derives from it), or the snapshot could come from an unrelated record.
    """
    out = []
    if meta.get("url") != source.get("url"):
        out.append(f"snapshot meta url {meta.get('url')!r} is not the source url {source.get('url')!r}")
    method = source.get("fetch_method")
    if method not in ("http", "api"):
        # http/api records report this through plan_fetch below. For browser/manual
        # snapshots the adversary still tries fetch_url first for the live check (G10),
        # and a meta fetch_url (fetch_snapshot.py writes none) must name the record too.
        problem = fetchplan.fetch_url_problem(source)
        if problem:
            out.append(problem)
        if meta.get("fetch_url") is not None:
            problem = fetchplan.fetch_url_problem({"url": source.get("url"), "fetch_url": meta.get("fetch_url")})
            if problem or not isinstance(meta.get("fetch_url"), str):
                out.append(f"snapshot meta {problem or 'fetch_url is not a string'}")
    if meta.get("method") != method:
        out.append(f"snapshot meta method {meta.get('method')!r} differs from fetch_method {method!r}")
    final = meta.get("final_url")
    if final is not None and not (isinstance(final, str) and isinstance(meta.get("fetch_url"), str)
                                  and fetchplan.same_record(final, meta.get("fetch_url"))):
        # fetch_snapshot.py records where redirects ended and refuses another record; a meta
        # file naming another record was not written by it.
        out.append(f"snapshot meta final_url {final!r} is not the record fetched ({meta.get('fetch_url')!r}): "
                   f"the request was redirected to another page")
    plan = None
    if method in ("http", "api"):
        try:
            plan = fetchplan.plan_fetch(source)
        except fetchplan.PlanError as exc:
            out.append(f"cannot tell what the record would fetch: {exc}")
        else:
            if meta.get("fetch_url") != plan.fetch_url:
                out.append(f"snapshot meta fetch_url {meta.get('fetch_url')!r} is not the URL the record is "
                           f"fetched from ({plan.fetch_url!r})")
    if "full_text_url" in meta:
        # fetch_snapshot.py adds a loc.gov page's own OCR text, fetched by a program from LoC's
        # Text Services endpoint the page record names (fetch_snapshot.loc_full_text_pointer).
        if method != "api" or plan is None or plan.adapter != "loc":
            out.append("snapshot meta full_text_url is only written for a loc.gov page fetched by the api")
        problem = fetchplan.loc_full_text_problem(meta.get("full_text_url"))
        if problem:
            out.append(f"snapshot meta full_text_url: {problem}")
        elif meta.get("segment_id") is None:
            out.append("snapshot meta has no segment_id: the page record's own segment was not recorded, so "
                       "nothing shows the full text is this page's (re-fetch with tools/fetch_snapshot.py)")
        elif fetchplan.loc_full_text_segment(meta.get("full_text_url")) != meta.get("segment_id"):
            out.append(f"snapshot meta full_text_url names segment "
                       f"{fetchplan.loc_full_text_segment(meta.get('full_text_url'))!r}, not the page record's "
                       f"own segment {meta.get('segment_id')!r}: the full text is another page's")
    elif "segment_id" in meta:
        out.append("snapshot meta segment_id is only written with a full_text_url")
    if "record_url" in meta:
        # fetch_snapshot.py reads a NARA record's own JSON (title, page file names) with its page
        # transcriptions (owner approval 2026-10-16); it must be that record's endpoint.
        expected = fetchplan.nara_record_endpoint(source.get("url"))
        if method != "api" or plan is None or plan.adapter != "nara-transcriptions":
            out.append("snapshot meta record_url is only written for NARA page transcriptions fetched by the api")
        elif meta.get("record_url") != expected:
            out.append(f"snapshot meta record_url {meta.get('record_url')!r} is not the cited record's own "
                       f"endpoint ({expected!r})")
    return out


def quote_found(item, ctx):
    """True if one evidence item's quote is in its intact source snapshot."""
    sid = item.get("source_id")
    src = ctx.sources.get(sid) if isinstance(sid, str) else None
    quote = item.get("quote")
    if src is None or not isinstance(quote, str) or not quote.strip():
        return False
    if snapshot_failures(src, ctx.snapshots.get(src.get("id"))):
        return False
    return contains_normalized(ctx.snapshot_text(src.get("id")), normalize_text(quote))


# --- G1 evidence ---------------------------------------------------------------------

def g1_evidence(fact, ctx):
    evidence = _evidence(fact)
    if not evidence:
        return ["no evidence"]
    out = []
    for i, item in enumerate(evidence, 1):
        sid = item.get("source_id")
        src = ctx.sources.get(sid) if isinstance(sid, str) else None
        if src is None:
            out.append(f"evidence {i}: unknown source {sid}")
            continue
        problems = snapshot_failures(src, ctx.snapshots.get(sid))
        if problems:
            out.extend(f"evidence {i}: {p}" for p in problems)
            continue
        quote = item.get("quote")
        if not isinstance(quote, str) or not quote.strip():
            out.append(f"evidence {i} ({sid}): empty quote")
        elif not contains_normalized(ctx.snapshot_text(sid), normalize_text(quote)):
            out.append(f"evidence {i} ({sid}): quote not found in snapshot: {_short(quote)}")
    return out


def g1_media(media, ctx, fact_status):
    """G1 for media: the rights statement is verbatim in a source snapshot, and license_class
    agrees with the approved LoC / NARA rights rule (ihh/rights.py). An item with no holder
    statement passes only while it is not embeddable (license_class unknown or rights-restricted).

    A reconstruction (something we build) has no holder's rights statement;
    instead every fact in its reconstruction_basis must be verified and every
    source in it must exist. fact_status maps fact id to its current status.
    """
    if media.get("reconstruction") is True:
        basis = media.get("reconstruction_basis")
        if not isinstance(basis, list) or not basis:
            return ["reconstruction has no reconstruction_basis"]
        out = []
        for rid in basis:
            kind = ids.kind_of(rid)
            if kind == "fact":
                status = fact_status.get(rid)
                if status != "verified":
                    out.append(f"reconstruction basis {rid} is not verified (status {status})")
            elif kind == "source":
                if rid not in ctx.sources:
                    out.append(f"reconstruction basis {rid} is not a known source")
            else:
                out.append(f"reconstruction basis {rid!r} is not a fact or source id")
        return out

    statement = media.get("rights_statement")
    has_statement = isinstance(statement, str) and bool(statement.strip())
    # No holder statement: allowed only for an item the site never embeds (license_class
    # unknown or rights-restricted); a usable item must show the holder's words.
    if not has_statement and media.get("license_class") in rights.EMBEDDABLE:
        return ["no rights_statement"]
    sids = _record_source_ids(media)
    if not sids:
        return ["no source_ids"]
    out, found, usable = [], False, set()
    needle = normalize_text(statement) if has_statement else ""
    for sid in sids:
        src = ctx.sources.get(sid)
        if src is None:
            out.append(f"unknown source {sid}")
            continue
        if not src.get("snapshot"):
            continue
        problems = snapshot_failures(src, ctx.snapshots.get(sid))
        if problems:
            out.extend(problems)
            continue
        usable.add(sid)
        if has_statement and contains_normalized(ctx.snapshot_text(sid), needle):
            found = True
    if has_statement and not found:
        out.append(f"rights_statement not found in any source snapshot: {_short(statement)}")
    # The approved LoC / NARA rights rule (ihh/rights.py), read from snapshots that pass G1.
    holders = rights.holders_of(media, ctx.sources,
                                lambda sid: ctx.quotable_raw(sid) if sid in usable else None, ctx.registry)
    out.extend(rights.rule_problems(media, holders, private_lookup(ctx, fact_status)))
    return out


def private_lookup(ctx, fact_status):
    """The private-writings rule's reader (rights.Lookup) over the gate context: facts with their
    current status, quotes checked against snapshots that pass G1, and holder statements read only
    from an item source on a registered holder that is not a media-only host."""
    def text_of(sid):
        src = ctx.sources.get(sid)
        if src is None or not src.get("snapshot") or snapshot_failures(src, ctx.snapshots.get(sid)):
            return None
        return ctx.quotable_raw(sid)
    return make_private_lookup(ctx.facts, fact_status, text_of, ctx.sources, ctx.registry)


def make_private_lookup(facts_by_id, fact_status, text_of, sources_by_id, registry):
    """rights.Lookup from plain parts. text_of(source_id) returns the quotable text of a snapshot
    that passes G1, or None; fact_status maps fact id to its current status."""
    fact_status = fact_status if isinstance(fact_status, dict) else {}
    facts_by_id = facts_by_id if isinstance(facts_by_id, dict) else {}

    def has(sid, text):
        raw = text_of(sid) if isinstance(sid, str) else None
        return isinstance(raw, str) and isinstance(text, str) and bool(text.strip()) and \
            contains_normalized(normalize_text(raw), normalize_text(text))

    def holder_states(media, statement):
        for sid in _record_source_ids(media):
            src = sources_by_id.get(sid)
            entry = registry.resolve(src.get("url")) if isinstance(src, dict) and registry is not None else None
            if entry is None or entry.media_only or not ({"primary", "institutional"} & set(entry.may_be)):
                continue
            if has(sid, statement):
                return sid
        return None

    return rights.Lookup(
        fact_of=lambda fid: facts_by_id.get(fid) if isinstance(fid, str) else None,
        fact_status=lambda fid: fact_status.get(fid, (facts_by_id.get(fid) or {}).get("status")),
        quote_in=has, holder_states=holder_states)


# --- G2 nothing added --------------------------------------------------------------------

@dataclass
class Support:
    """Everything a piece of text may draw on: the content tokens (normalize.content_tokens)
    of the support texts and the name words of the inductee's names. Each kind of token is
    supported only by the same kind:

    dates         unambiguous dates (a month named alone is a month-only date); an ambiguous
                  numeric date (6/10/1941) adds only the part every reading shares (its year)
    ambiguous     the reading sets of ambiguous numeric dates, so the same ambiguous form is
                  supported but picking one reading is not
    numbers       numbers written in the support (never a date's day, never a digit run of a code)
    years         the years of supported dates: they support a year written alone ("in 1941")
    code_numbers  digit runs of supported codes: they support only a number written with digit
                  separators, the way an identifier is restated ("US2292387A" -> "2,292,387")
    decades       decades (1950), and decade words with no century as negatives (-50)
    ages          age decades ("in his forties" -> 40), supported only by an age
    symbols       meaning-bearing symbols ("%", "$", "<", "-" for a minus sign)
    words         content-word keys (normalize.word_key; "US" for the acronym) and codes
    name_words    (key, capitalized) pairs from the inductee's names: a name supplies only
                  name words, written with the same capitalization, never numbers or dates
    """
    dates: list
    numbers: set
    decades: set
    words: set
    ambiguous: list = field(default_factory=list)
    years: set = field(default_factory=set)
    code_numbers: set = field(default_factory=set)
    ages: set = field(default_factory=set)
    symbols: set = field(default_factory=set)
    name_words: set = field(default_factory=set)

    @classmethod
    def from_texts(cls, texts, names=(), extra_dates=()):
        sup = cls([], set(), set(), set())
        for text in texts:
            if not isinstance(text, str) or not text:
                continue
            c = content_tokens(text)
            for d in c.dates:
                if len(d.options) > 1:
                    sup.ambiguous.append(frozenset(d.options))
                    sup.dates.append(_shared_part(d.options))
                else:
                    sup.dates.extend(d.options)
                sup.years.update(str(opt.year) for opt in d.options if opt.year is not None)
            for num in c.numbers:
                sup.numbers.add(num)
                if num.isdigit() and 1000 <= int(num) <= 2100:
                    sup.dates.append(PartialDate(int(num)))
            sup.decades.update(c.decades)
            sup.decades.update(-d for d in c.short_decades)  # "fifties" with no century, kept apart
            sup.ages.update(value for _, value in c.ages)
            sup.symbols.update(c.symbols)
            sup.words.update(c.codes)
            for code in c.codes:
                sup.code_numbers.update(str(int(run)) for run in re.findall(r"\d+", code))
            sup.words.update(c.words)
        for name in names:
            if isinstance(name, str) and not name_problem(name):  # a phrase posing as a name supplies nothing
                sup.name_words.update(name_words(name))
        for d in extra_dates:
            if d is not None:
                sup.dates.append(d)
                if d.year is not None:
                    sup.years.add(str(d.year))
        return sup

    def has_number(self, num, grouped=False):
        """A number is supported by the same number; a year written alone also by a date's year;
        a number written with separators also by a code's digit run."""
        if num in self.numbers:
            return True
        if num.isdigit() and 1000 <= int(num) <= 2100 and not grouped and num in self.years:
            return True
        return grouped and num in self.code_numbers

    def has_word(self, key, written):
        """A content word is supported by the same key in the support texts, or by a name word
        with the same key written with the same capitalization."""
        if key in self.words:
            return True
        return (key, is_capitalized(written)) in self.name_words

    def _has_one(self, opt):
        return any(opt.within(s) for s in self.dates)

    def has_date(self, options):
        """True if a date is supported; an ambiguous one needs every reading supported."""
        options = tuple(options)
        if len(options) == 1:
            return self._has_one(options[0])
        if frozenset(options) in self.ambiguous:
            return True
        return bool(options) and all(self._has_one(opt) for opt in options)

    def has_decade(self, decade):
        if decade in self.decades:
            return True
        years = {d.year for d in self.dates if d.year is not None}
        return any(decade <= y < decade + 10 for y in years)

    def has_short_decade(self, value):
        """"the fifties" (value 50): a decade word, a 1950s-style decade, or a year in it.
        The century is not stated, so a decade or year of any century is in it. An age ("in
        his fifties") is not a calendar decade: Support.ages, never this."""
        if -value in self.decades or any(d > 0 and d % 100 == value for d in self.decades):
            return True
        return any(d.year is not None and d.year % 100 // 10 * 10 == value for d in self.dates)


def _shared_part(options):
    """The date components every reading of an ambiguous date agrees on."""
    first = options[0]
    same = [all(getattr(o, k) == getattr(first, k) for o in options) for k in ("year", "month", "day")]
    return PartialDate(first.year if same[0] else None, first.month if same[1] else None,
                       first.day if same[1] and same[2] else None)


def unsupported_tokens(text, support, label):
    """Every content token of text that support lacks (G2 and G6 apply the rule here only).

    The rule: text may contain no content word, date, number, decade or code that its
    support does not contain (normalize.content_tokens decides what counts as content).
    """
    c = content_tokens(text)
    out = []
    for d in c.dates:
        if not support.has_date(d.options):
            if len(d.options) > 1:
                readings = " or ".join(o.iso for o in d.options)
                out.append(f"date {d.text!r} (ambiguous: {readings}) not in {label}; write the month as a word")
            else:
                out.append(f"date {d.text!r} ({d.iso}) not in {label}")
    for num in c.numbers:
        if not support.has_number(num, num in c.grouped):
            kind = "year" if num.isdigit() and 1000 <= int(num) <= 2100 else "number"
            out.append(f"{kind} {num} not in {label}")
    for dec in c.decades:
        if not support.has_decade(dec):
            out.append(f"decade {dec}s not in {label}")
    for dec in c.short_decades:
        if not support.has_short_decade(dec):
            out.append(f"decade 'the {dec}s' not in {label}")
    for word, value in c.ages:
        if value not in support.ages:
            out.append(f"age {word!r} (an age, not a calendar decade) not in {label}")
    for sym in c.symbols:
        if sym not in support.symbols:
            what = "minus sign" if sym == "-" else "symbol"
            out.append(f"{what} {sym!r} not in {label}")
    for code in c.codes:
        if code not in support.words:
            out.append(f"code {code!r} not in {label}")
    for written, key in zip(c.written, c.words):
        if not support.has_word(key, written):
            kind = "name" if written[:1].isupper() else "word"
            out.append(f"{kind} {written!r} not in {label}")
    return list(dict.fromkeys(out))


def g2_nothing_added(fact, ctx):
    claim = fact.get("claim") if isinstance(fact.get("claim"), str) else ""
    quotes = [e.get("quote") for e in _evidence(fact) if isinstance(e.get("quote"), str)]
    support = Support.from_texts(quotes, names=ctx.names)
    out = [f"claim: {x}" for x in unsupported_tokens(claim, support, "evidence quotes")]

    if fact.get("is_direct_quote") is True:
        target = normalize_text(strip_enclosing_quotes(claim))
        if not any(target == normalize_text(strip_enclosing_quotes(q)) for q in quotes):
            out.append("direct quote: claim does not equal any evidence quote")

    # event_date and place are shown on the site (timeline), so they too must
    # come from the claim or its evidence.
    with_claim = Support.from_texts([claim] + quotes, names=ctx.names)
    event_date = fact.get("event_date")
    if event_date not in (None, ""):
        parsed = parse_date_parts(str(event_date))
        if parsed is None:
            out.append(f"event_date {event_date!r} is not a date")
        elif not with_claim.has_date((parsed,)):
            out.append(f"event_date {event_date} not found in claim or evidence")
    place = fact.get("place")
    if isinstance(place, str) and place.strip():
        out.extend(f"place {place!r}: {x}" for x in unsupported_tokens(place, with_claim, "claim or evidence"))
    return out


_ID_IN_TEXT = re.compile(r"\s*\(?\s*\b[A-Z]{3}-[FSMQ]-\d{4,}\b\s*(?:[,;]\s*\b[A-Z]{3}-[FSMQ]-\d{4,}\b\s*)*\)?")


def media_text_support(media, ctx):
    """What a media item's title and alt text may draw on: the text of its own
    source snapshots, the claims of facts its alt text names and of its
    reconstruction basis, and the inductee's names."""
    texts = []
    for sid in _record_source_ids(media):
        if ctx.sources.get(sid) is not None and ctx.snapshot_text(sid) is not None:
            texts.append(ctx.quotable_raw(sid))
    fids = [rid for rid in ids_in_text(media.get("alt_text")) if ids.kind_of(rid) == "fact"]
    basis = media.get("reconstruction_basis") if isinstance(media.get("reconstruction_basis"), list) else []
    for rid in fids + [b for b in basis if isinstance(b, str)]:
        if ids.kind_of(rid) == "fact" and isinstance(ctx.facts.get(rid), dict):
            texts.append(ctx.facts[rid].get("claim"))
        elif ids.kind_of(rid) == "source" and ctx.sources.get(rid) is not None:
            if ctx.snapshot_text(rid) is not None:
                texts.append(ctx.quotable_raw(rid))
    return Support.from_texts(texts, names=ctx.names)


def ids_in_text(text):
    return re.findall(r"\b[A-Z]{3}-[FSMQ]-\d{4,}\b", text) if isinstance(text, str) else []


def g2_media(media, ctx):
    """G2 for media: the title and alt text, which are published with the item, contain no
    content token that media_text_support() lacks."""
    support = media_text_support(media, ctx)
    out = []
    for key in ("title", "alt_text"):
        text = media.get(key)
        if isinstance(text, str) and text.strip():
            cleaned = _ID_IN_TEXT.sub(" ", text)
            label = "its sources or cited facts"
            out.extend(f"{key}: {x}" for x in unsupported_tokens(cleaned, support, label))
    return out


# --- G5 corroboration ----------------------------------------------------------------------

def whole_claim_gaps(fact, quotes, names, page_text=None):
    """What a set of quotes lacks to support the whole fact on its own: every content token of
    the claim (the G2 rule, unsupported_tokens), the event_date and every token of the place.
    [] when the quotes alone cover all of it. G5 applies it to each source's own quotes.

    As in G2, the inductee's names supply their own name words; given page_text (the source's
    snapshot), only the name words that page itself contains, so a record that never names the
    person cannot vouch for a claim about them."""
    claim = fact.get("claim") if isinstance(fact.get("claim"), str) else ""
    support = Support.from_texts(quotes, names=names)
    if page_text is not None:
        on_page = page_text if isinstance(page_text, (set, frozenset)) else set(content_tokens(page_text).words)
        support.name_words = {nw for nw in support.name_words if nw[0] in on_page}
    out = list(unsupported_tokens(claim, support, "its quotes"))
    event_date = fact.get("event_date")
    if event_date not in (None, ""):
        parsed = parse_date_parts(str(event_date))
        if parsed is None or not support.has_date((parsed,)):
            out.append(f"event_date {event_date} not in its quotes")
    place = fact.get("place")
    if isinstance(place, str) and place.strip():
        out.extend(f"place: {x}" for x in unsupported_tokens(place, support, "its quotes"))
    return out


def _page_text(ctx, sid):
    """The content-word keys of a source's snapshot (cached per text), for whole_claim_gaps."""
    raw = ctx.quotable_raw(sid)
    text = raw if isinstance(raw, str) else ""
    key = ("page-words", text)
    if key not in ctx._normalized:
        ctx._normalized[key] = frozenset(content_tokens(text).words)
    return ctx._normalized[key]


def _g5_gaps(fact, ctx):
    """(cited sources, {source id: whole_claim_gaps of that source's own quotes})."""
    quotes = {}
    for item in _evidence(fact):
        sid, quote = item.get("source_id"), item.get("quote")
        if isinstance(sid, str) and sid in ctx.sources and isinstance(quote, str):
            quotes.setdefault(sid, []).append(quote)
    srcs = [ctx.sources[sid] for sid in _record_source_ids(fact) if sid in ctx.sources]
    gaps = {s.get("id"): whole_claim_gaps(fact, quotes.get(s.get("id"), []), ctx.names,
                                          page_text=_page_text(ctx, s.get("id"))) for s in srcs}
    return srcs, gaps


def g5_counting_sources(fact, ctx):
    """The cited sources G5 counts toward the fact: those whose own quotes cover the whole claim,
    event_date and place (whole_claim_gaps), in citation order. The one definition G5 and the
    per-source G10 rule both read."""
    srcs, gaps = _g5_gaps(fact, ctx)
    return [s for s in srcs if not gaps[s.get("id")]]


# Independence (2026-10-10): two sources are one holder when their quotes for the fact are the
# same text. Near-verbatim: normalised token sequences with difflib ratio >= COPY_SIMILARITY, or
# the shorter contained in the longer as a contiguous run, judged only when the shorter quote has
# at least COPY_MIN_TOKENS tokens (a few common words in the same order are not a copy).
COPY_SIMILARITY = 0.85
COPY_MIN_TOKENS = 8
_TOKEN = re.compile(r"[^\W_]+(?:'[^\W_]+)?")


def quote_token_sequence(text):
    """A quote as a comparison sequence: normalize_text, then each word folded (case, accents,
    a possessive 's); punctuation and spacing do not count."""
    return tuple(fold_token(w) for w in _TOKEN.findall(normalize_text(text if isinstance(text, str) else "")))


def _contains_run(longer, shorter):
    n = len(shorter)
    return any(longer[i:i + n] == shorter for i in range(len(longer) - n + 1))


def copied_quotes(quotes_a, quotes_b):
    """True when some quote in quotes_a and some quote in quotes_b are near-verbatim copies of one
    text: the shorter has at least COPY_MIN_TOKENS tokens and is contained in the longer, or the
    two token sequences have similarity >= COPY_SIMILARITY."""
    seqs_a = [quote_token_sequence(q) for q in quotes_a]
    seqs_b = [quote_token_sequence(q) for q in quotes_b]
    for a in seqs_a:
        for b in seqs_b:
            shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
            if len(shorter) < COPY_MIN_TOKENS:
                continue
            if _contains_run(longer, shorter):
                return True
            if difflib.SequenceMatcher(None, a, b, autojunk=False).ratio() >= COPY_SIMILARITY:
                return True
    return False


def source_lineage(source, ctx):
    """The source and every source it derives from (derived_from, followed through ctx.sources;
    cycle-safe), in order."""
    out, seen = [], set()
    while isinstance(source, dict) and source.get("id") not in seen:
        seen.add(source.get("id"))
        out.append(source)
        origin = source.get("derived_from")
        source = ctx.sources.get(origin) if isinstance(origin, str) else None
    return out


def derived_link(a, b, ctx):
    """True when one source derives from the other, or both from a common origin, or a source
    in one lineage is the same holder as a source in the other (a page derived from one of
    holder X's pages is X's text)."""
    la, lb = source_lineage(a, ctx), source_lineage(b, ctx)
    if len(la) == 1 and len(lb) == 1:
        return False
    if {s.get("id") for s in la} & {s.get("id") for s in lb}:
        return True
    sa = [authority.standing(s, ctx.registry) for s in la]
    sb = [authority.standing(s, ctx.registry) for s in lb]
    return any(x.same_holder(y) for i, x in enumerate(sa) for j, y in enumerate(sb) if i or j)


def _fact_quotes(fact):
    quotes = {}
    for item in _evidence(fact):
        sid, quote = item.get("source_id"), item.get("quote")
        if isinstance(sid, str) and isinstance(quote, str):
            quotes.setdefault(sid, []).append(quote)
    return quotes


def same_text_reason(a, b, quotes, ctx):
    """Why two cited sources are one text for G5, or None: a derived_from link, or quotes for the
    fact that are near-verbatim copies (copied_quotes)."""
    if derived_link(a, b, ctx):
        return "derived_from"
    if copied_quotes(quotes.get(a.get("id"), []), quotes.get(b.get("id"), [])):
        return "same text"
    return None


def g5_holders(fact, ctx, srcs=None):
    """The independent holders among the fact's cited sources (lists of sources): the registry /
    domain grouping of authority.independent_groups, joined further where two sources are one
    text (same_text_reason). The one definition G5 and validate read."""
    if srcs is None:
        srcs = [ctx.sources[sid] for sid in _record_source_ids(fact) if sid in ctx.sources]
    quotes = _fact_quotes(fact)
    return authority.independent_groups(
        srcs, ctx.registry, joined=lambda a, b: same_text_reason(a, b, quotes, ctx) is not None)


def _same_text_notes(srcs, fact, ctx):
    quotes = _fact_quotes(fact)
    out = []
    for i, a in enumerate(srcs):
        for b in srcs[i + 1:]:
            if a.get("id") == b.get("id"):
                continue
            reason = same_text_reason(a, b, quotes, ctx)
            if reason == "derived_from":
                out.append(f"{a.get('id')} and {b.get('id')} are one holder (derived_from: one reproduces "
                           f"or follows the other, or both a common origin)")
            elif reason:
                out.append(f"{a.get('id')} and {b.get('id')} are one holder (same text: their quotes are "
                           f"near-verbatim copies)")
    return out


def g5_corroboration(fact, ctx):
    """G5: a source counts only if its own quotes cover the whole claim, plus event_date and
    place (whole_claim_gaps); quotes from different sources are never pooled. Passes with one
    counting registry-allowed primary source, or with counting sources from 2+ independent
    holders (authority.independent_groups over every cited source, so a source that does not
    count can still join two holders into one) of which at least one counting source is a
    registry-allowed primary or institutional source. The inductee's names cover a name word of
    the claim only for a source whose own snapshot contains that word."""
    srcs, gaps = _g5_gaps(fact, ctx)
    counting = [s for s in srcs if not gaps[s.get("id")]]
    if any(s.get("type") == "primary" and authority.strong(s, ctx.registry) for s in counting):
        return []
    out = []
    counting_ids = {id(s) for s in counting}
    holders = [g for g in g5_holders(fact, ctx, srcs) if any(id(m) in counting_ids for m in g)]
    if len(holders) < 2:
        out.append(f"no primary document covering the whole claim, and sources covering the whole claim come "
                   f"from {len(holders)} independent holder(s); needs 2+ distinct institutions (counted by "
                   f"authority registry entry, else by registered domain; a name claiming a registered holder "
                   f"counts as that holder; two sources whose quotes are the same text, or one derived_from "
                   f"the other, count once), each with quotes that cover the whole claim on their own")
        out.extend(_same_text_notes(srcs, fact, ctx))
    if not any(authority.strong(s, ctx.registry) for s in counting):
        out.append("no primary or institutional source in evidence whose publisher is in the authority registry "
                   "and whose own quotes cover the whole claim")
    partial = [f"{sid} lacks {'; '.join(g[:4])}{' ...' if len(g) > 4 else ''}" for sid, g in gaps.items() if g]
    if out and partial:
        out.append("sources that do not cover the whole claim on their own (never pooled for G5): "
                   + " | ".join(partial))
    return out


# --- primary_document ----------------------------------------------------------------------

def primary_document(fact, sources_by_id):
    """The derived primary_document flag (SPEC 3.3): true exactly when an evidence item cites a
    source of type primary, that is the original record itself (a type G9 allows only on a
    registry entry's original-record pages; G1 holds the quote to that record's snapshot).
    merge_staging.py sets it on every merged fact and compute_status.py keeps it current, so it
    is never authored by an agent."""
    return any(isinstance(src := sources_by_id.get(sid), dict) and src.get("type") == "primary"
               for sid in _record_source_ids(fact) if isinstance(sid, str))


# --- G11 identity ----------------------------------------------------------------------------

def g11_identity(fact, ctx):
    """G11: a fact of category identity establishes a name the inductee was known by, so its
    claim contains one of inductee.json's aliases (ctx.aliases, the ones that are names).

    A museum visitor reads facts about the person's life, work or legacy. A statement about a
    catalogue record (its heading, control number or field names) is provenance and belongs in
    the source record, not in facts. The rule names no words: it asks for an alias, which the
    Identify step lists only when an authority quote shows it.
    """
    if fact.get("category") != "identity":
        return []
    claim = fact.get("claim")
    text = normalize_text(claim) if isinstance(claim, str) else ""
    if any(contains_normalized(text, normalize_text(a)) for a in ctx.aliases):
        return []
    listed = ", ".join(repr(a) for a in ctx.aliases[:3]) or "none listed"
    if len(ctx.aliases) > 3:
        listed += f" and {len(ctx.aliases) - 3} more"
    return [f"an identity fact establishes a name the inductee was known by, so its claim must contain one "
            f"of the aliases in inductee.json ({listed}); a statement about a catalogue record is provenance, "
            f"not a fact: recategorize it if it is about the person's life, work or legacy, else withdraw it"]


# --- G7 edit lock --------------------------------------------------------------------------

MEDIA_LOCK_FIELDS = ("url", "rights_statement", "rights_url", "license_class", "credit",
                     "source_ids", "reconstruction", "reconstruction_basis", "title", "alt_text")


def media_lock_sha256(media):
    """Hash of the media fields a verification vouches for (rights, license, item, title, alt text)."""
    values = []
    for key in MEDIA_LOCK_FIELDS:
        value = media.get(key)
        if key in ("rights_statement", "credit", "title", "alt_text") and isinstance(value, str):
            value = normalize_text(value)
        values.append(value)
    if media.get("record_kind") not in (None, "item") or media.get("basis_for"):
        # Basis photos (2026-10-16): the kind and the stop facts it serves are vouched for too. Only
        # appended when set, so the lock of every other media item is unchanged.
        values.append({"record_kind": media.get("record_kind"), "basis_for": media.get("basis_for")})
    if media.get("authorship") is not None:
        # Private writings (2026-10-20): the authorship the rights class rests on is vouched for too.
        # Only appended when set, so the lock of every other media item is unchanged.
        values.append({"authorship": media.get("authorship")})
    return hashlib.sha256(json.dumps(values, ensure_ascii=False).encode("utf-8")).hexdigest()


def current_lock_sha256(record, kind="fact"):
    return media_lock_sha256(record) if kind == "media" else claim_sha256(record.get("claim") or "")


def g7_edit_lock(record, kind="fact"):
    stored = record.get("verified_claim_sha256")
    if not stored:
        return []
    if current_lock_sha256(record, kind) != stored:
        what = "rights fields" if kind == "media" else "claim"
        return [f"{what} changed after verification (verified_claim_sha256 no longer matches); "
                f"needs re-verification"]
    return []


# --- G9 banned sources ----------------------------------------------------------------------

def _domain_ban(host):
    host = (host or "").lower().rstrip(".")
    for domain in BANNED_DOMAINS:
        if host == domain or host.endswith("." + domain):
            return domain
    return None


def _inner_urls(parts):
    """URLs embedded in a URL's path or query (archive, cache and proxy wrappers)."""
    rest = parts.path + ("?" + parts.query if parts.query else "")
    for _ in range(2):  # percent-encoded once or twice
        rest = unquote(rest)
    found = [re.sub(r"^(https?):/+", r"\1://", m.group(0)) for m in _EMBEDDED.finditer(rest)]
    found += ["https://" + m.group("inner") for m in _CACHE.finditer(rest)
              if not re.match(r"^https?:", m.group("inner"), re.I)]
    return found


def banned_host(url, _depth=0):
    """The banned domain a URL belongs to, else None.

    Looks through Wayback, archive.today, Google cache and other wrappers that
    embed the original URL, and through Google Translate proxy hosts
    (en-wikipedia-org.translate.goog). A short link on archive.today or
    ghostarchive (SHORT_LINK_ARCHIVES), which hides the original page, counts as
    banned.
    """
    if not isinstance(url, str) or not url.strip():
        return None
    u = url.strip()
    m = _WAYBACK.match(u)
    if m and _depth < 4:
        inner = unquote(m.group("inner"))
        if not re.match(r"^https?:/", inner, re.I):
            inner = "https://" + inner
        found = banned_host(inner, _depth + 1)
        if found:
            return found
    try:
        parts = urlsplit(u)
        host = (parts.hostname or "").lower().rstrip(".")
    except ValueError:
        return None
    found = _domain_ban(host)
    if found:
        return found
    if host.endswith(".translate.goog"):
        label = host[:-len(".translate.goog")]
        found = _domain_ban(label.replace("--", "\0").replace("-", ".").replace("\0", "-"))
        if found:
            return found
    inner = _inner_urls(parts) if _depth < 4 else []
    for item in inner:
        found = banned_host(item, _depth + 1)
        if found:
            return found
    if any(host == d or host.endswith("." + d) for d in SHORT_LINK_ARCHIVES) and not inner:
        return f"{host} short link (the original page is not shown)"
    return None


def g9_source(source, registry):
    """Source-level G9: banned hosts (defence in depth) and the authority rules
    (authority.source_problems: type allowed by the registry, registry name)."""
    out = []
    sid = source.get("id")
    for key in ("url", "fetch_url", "archive_url"):
        domain = banned_host(source.get(key))
        if domain:
            out.append(f"{sid}: {key} is on a banned host ({domain}); "
                       f"use it to find leads only, never as a source")
    out.extend(f"{sid}: {x}" for x in authority.source_problems(source, registry))
    return out


def g9_fact_use(record, ctx):
    """Record-level G9: a fact may not rest on a media-only publisher (Wikimedia Commons), and a
    supporting-only publisher (owner decision 2026-10-16: Wien Geschichte Wiki) is never its sole
    source: it may only add an independent second holder to another source."""
    if "evidence" not in record:
        return []
    out = []
    cited = [sid for sid in _record_source_ids(record)]
    for sid in cited:
        src = ctx.sources.get(sid)
        problem = authority.media_only_problem(src, ctx.registry) if src is not None else None
        if problem:
            out.append(f"{sid}: {problem}")
    known_srcs = [ctx.sources[sid] for sid in cited if sid in ctx.sources]
    if known_srcs and all(authority.supporting_only(s, ctx.registry) for s in known_srcs):
        out.append(f"{', '.join(dict.fromkeys(cited))}: a supporting-only publisher can never be the sole source "
                   f"of a fact; cite another source that states it (the supporting-only source may then count "
                   f"as an independent second holder)")
    return out


def g9_banned_sources(record, ctx):
    out = []
    for sid in _record_source_ids(record):
        src = ctx.sources.get(sid)
        if src is not None:
            out.extend(g9_source(src, ctx.registry))
    return out + g9_fact_use(record, ctx)


# --- G10 snapshot integrity and the adversary verdict -------------------------------------------

def _live_check_required(src):
    """A source whose snapshot was supplied by a person or an agent (browser/manual), so only a
    live confirmation can vouch for it."""
    return bool(src.get("snapshot")) and src.get("fetch_method") in LIVE_CHECK_METHODS


def _machine_fetched(src):
    """A source whose snapshot a program fetched (http/api): "unreachable" is acceptable for it,
    as under the per-fact rule."""
    return bool(src.get("snapshot")) and src.get("fetch_method") in MACHINE_FETCH_METHODS


def g10_snapshot_integrity(record, ctx):
    """G10. A verdict with per-source live results (adversary.live_by_source) is judged per
    source (_g10_per_source); a legacy verdict without them keeps the per-fact rule on
    quote_in_live, unchanged."""
    adversary = record.get("adversary") if isinstance(record.get("adversary"), dict) else {}
    if adversary.get("live_by_source") is not None:
        return _g10_per_source(record, adversary.get("live_by_source"), ctx)
    live = adversary.get("quote_in_live")
    supplied = []
    for sid in _record_source_ids(record):
        src = ctx.sources.get(sid) or {}
        if _live_check_required(src):
            supplied.append(f"{sid} ({src.get('fetch_method')})")
    if live == "no":
        return ["adversary did not find the quote in the live source"]
    if supplied and live != "yes":
        return [f"snapshot supplied by browser/manual for {', '.join(supplied)}; the adversary must "
                f"find the quote live (quote_in_live is {live!r})"]
    if not supplied and live not in ("yes", "unreachable"):
        return [f"quote_in_live is {live!r}"]
    return []


def g10_required_sources(record, ctx):
    """Source ids whose live result decides G10 for a per-source verdict: for a fact, the sources
    G5 counts (g5_counting_sources); when G5 counts none, and for a media item, every cited
    source, so a per-source verdict is never looser than the per-fact rule."""
    cited = _record_source_ids(record)
    if "evidence" in record:
        counting = [s.get("id") for s in g5_counting_sources(record, ctx)]
        if counting:
            return counting
    return cited


def _g10_per_source(record, entries, ctx):
    """Per-source G10 (owner-approved 2026-10-10, SPEC section 4):
    - not_found on ANY cited source fails;
    - every required source (g10_required_sources) needs a result: found passes; unreachable
      passes only for a machine-fetched (http/api) snapshot, as under the per-fact rule;
    - a source that is not required and is unreachable is ignored."""
    if not isinstance(entries, list):
        return ["adversary.live_by_source is not a list"]
    results = {}
    for e in entries:
        if isinstance(e, dict) and isinstance(e.get("source_id"), str):
            results.setdefault(e["source_id"], e.get("result"))
    out = []
    for sid in _record_source_ids(record):
        if results.get(sid) == "not_found":
            out.append(f"{sid}: adversary did not find the quote in the live source (not found)")
    for sid in g10_required_sources(record, ctx):
        result = results.get(sid)
        src = ctx.sources.get(sid) or {}
        if result in ("found", "not_found"):
            continue
        if result is None:
            out.append(f"{sid}: no live result for a source the record rests on; judge the item again")
        elif result == "unreachable":
            if not _machine_fetched(src):
                out.append(f"{sid}: snapshot supplied by {src.get('fetch_method') or 'an unknown method'}; "
                           f"the adversary must find the quote live (result is 'unreachable')")
        else:
            out.append(f"{sid}: live result is {result!r}")
    return out


def adversary_failures(adversary):
    """Why a recorded adversary verdict does not support the record; [] if it does."""
    if not isinstance(adversary, dict):
        return ["no adversary verdict"]
    out = []
    verdict = adversary.get("verdict")
    if verdict != "supported":
        out.append(f"adversary verdict is {verdict}")
    if adversary.get("quote_in_snapshot") is not True:
        out.append("adversary did not confirm the quote is in the snapshot")
    if adversary.get("entailed") is not True:
        out.append("adversary did not find the claim entailed by the quotes")
    if adversary.get("adds_information") is not False:
        out.append("adversary found the claim adds information")
    if adversary.get("atomic") is not True:
        out.append("adversary did not find the claim atomic (G3)")
    if adversary.get("source_type_ok") is not True:
        out.append("adversary did not accept the source type")
    return out


# --- aliases ------------------------------------------------------------------------------------

def supported_aliases(inductee, facts, ctx):
    """Aliases that are names (normalize.name_problem) backed by an identity-fact evidence
    quote that is in its snapshot. An alias that is not a name is never used: names supply
    name words to G2/G6, and a phrase posing as an alias could supply anything.

    Identity facts withdrawn by the extractor or set rejected/conflicting do not
    count. The rule reads only stored fields, so it does not change while
    compute_status is deriving statuses (which keeps that tool idempotent).
    """
    aliases = inductee.get("aliases") if isinstance(inductee.get("aliases"), list) else []
    quotes = []
    for f in facts:
        if f.get("category") != "identity":
            continue
        extractor = f.get("extractor") if isinstance(f.get("extractor"), dict) else {}
        if extractor.get("verdict") == "withdrawn":
            continue
        if f.get("status") in ("rejected", "conflicting"):
            continue
        for item in _evidence(f):
            if quote_found(item, ctx):
                quotes.append(normalize_text(item.get("quote")))
    out = []
    for alias in aliases:
        if not isinstance(alias, str) or not alias.strip() or name_problem(alias):
            continue
        if any(contains_normalized(q, normalize_text(alias)) for q in quotes):
            out.append(alias)
    return out


def _short(text, limit=80):
    text = " ".join(str(text).split())
    return repr(text if len(text) <= limit else text[:limit - 3] + "...")


__all__ = [
    "GateContext", "Support", "build_context", "snapshot_failures", "quote_found",
    "g1_evidence", "g1_media", "g2_nothing_added", "g2_media", "media_text_support", "ids_in_text",
    "unsupported_tokens", "whole_claim_gaps", "g5_corroboration", "g5_counting_sources", "g5_holders",
    "copied_quotes", "quote_token_sequence", "source_lineage",
    "g7_edit_lock", "media_lock_sha256", "current_lock_sha256", "banned_host", "g9_source",
    "g9_fact_use", "g9_banned_sources", "g10_snapshot_integrity", "g10_required_sources", "adversary_failures", "supported_aliases",
    "primary_document", "g11_identity",
    "by_id", "known",
]
