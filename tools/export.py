"""Export an inductee's review package or publishable package (SPEC sections 2, 6, 7, 8).

    python3 tools/export.py <slug> | --all [--preview] [--data-dir DIR] [--content-dir DIR]

Writes to data/inductees/<slug>/export/:

  wordpress.html     paste-ready WordPress block markup (headings, paragraphs,
                     lists, images): the summary, sections, timeline, images
                     with credit lines, a numbered "Sources" list and a "How to
                     cite this page" paragraph generated from inductee.json
                     (profile.how_to_cite, which no gate checks, is never used). Every sentence is followed by
                     superscript links to the primary or institutional sources
                     of the facts it cites; the numbers match the Sources list.
  facts.csv sources.csv media.csv searches.csv
                     spreadsheets for the IHH team (UTF-8 with a byte order
                     mark so spreadsheet programs read accents correctly; cells
                     that a spreadsheet would run as a formula are prefixed with
                     an apostrophe)
  provenance.jsonld  schema.org Claim / CreativeWork / MediaObject plus PROV-O
                     activities, for IHH's chatbot
  REVIEW.md          the reviewer's checklist: disputed, conflicting and
                     single-source items first, with the evidence and both the
                     extractor's and the independent checker's judgement, then
                     verified items awaiting approval, pending items with the
                     gate failures, media, draft content, avatar lines and gaps

With --all, every inductee is exported and the CSV and JSON-LD files are also
combined into data/export/ (one `inductee` column / one graph).

Review state on every row: facts.csv and media.csv carry review_state, reviewer, review_date,
review_note and, for an approved or edited record, review_decision_id ("<slug>:decisions:<n>", the
row of review/decisions.jsonl that backs it) and review_decision_date; the JSON-LD nodes carry
ihh:reviewState and ihh:review (state, reviewer, date, note, decision, decisionDate).

Which records are included
--------------------------
Final export (no --preview): wordpress.html, facts.csv, media.csv and
provenance.jsonld hold only facts and media whose status is `verified` and
whose review state is `approved` or `edited`, backed by the matching decision in
review/decisions.jsonl (G8, ihh/review.py); sources.csv and the JSON-LD
sources are the ones those records cite. A draft unit (summary sentence,
section sentence, timeline entry, artifact caption) is published only if every
fact it cites qualifies and the sentence adversary's current verdict on it
(drafts/grounding.jsonl, the second half of G6) is "supported" with
adds_information false; an artifact only if its media item qualifies too.
A section heading is kept only if it is still grounded (G6) in the facts of the
section's published sentences; otherwise the section is withheld. Withheld
units are listed in REVIEW.md. searches.csv always lists every search.

Preview (--preview): the review package. wordpress.html includes verified items
whatever their review state (except rejected), and every block is stamped
"DRAFT — NOT REVIEWED". The CSV and JSON-LD files hold every record with its
status, so the reviewer sees everything.

Experience content: when content/<slug>/chapters/<n>.json exists (--content-dir, default the
repository's content/), each chapter becomes a heading (its title), each narration line a paragraph
with its citations, and each exhibit an image block with the title and notes, the credit line, the
archive's rights wording as recorded, and a "See the original" link to the original record. A
reconstructed-place chapter keeps its "Reconstruction based on ..." note and is withheld without
it. Every chapter title, line, reconstruction note, exhibit title and exhibit note goes through the
same gate as a profile sentence (_check_unit): verified facts (approved in a final export), the
content-word check (G6) and, in a final export, a current "supported" sentence-adversary verdict
in drafts/grounding.jsonl (its location is content:<chapter id>:...). Anything else is withheld and
listed in REVIEW.md, as is every line and exhibit of a chapter whose title or reconstruction note is
withheld; a chapter with nothing left gets no heading.

Media are embedded as images only when the licence is public-domain, cc0,
cc-by or cc-by-sa and the url is a direct image file; anything else is shown as
a "View this item" link with its credit line, never embedded. Avatar lines are
for the interactive site and are not part of wordpress.html; REVIEW.md lists
them for review.

All record text is HTML-escaped, and only http(s) URLs become links, so text in
a record can never add markup or open a WordPress block.

The export refuses to run when tools/validate.py reports an error (with --all,
when any inductee does; nothing is written then).

Exit codes: 0 written, 1 refused (validation errors), 2 usage error or unknown slug.
"""

import argparse
import csv
import datetime
import html
import io
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from urllib.parse import quote, urlsplit

import check_grounding
import compute_status
import validate
from ihh import gates, normalize, paths, records, textfiles, urls
from ihh.rights import EMBEDDABLE
from ihh import review as review_log

STAMP = "DRAFT — NOT REVIEWED"
LICENSE_LABELS = {"public-domain": "Public domain", "cc0": "CC0", "cc-by": "CC BY", "cc-by-sa": "CC BY-SA",
                  "rights-restricted": "Rights restricted", "unknown": "Rights not determined"}
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif")
STRONG_TYPES = ("primary", "institutional")
PUBLISHABLE_REVIEW = ("approved", "edited")
CONTEXT = {
    "@vocab": "https://schema.org/",
    "prov": "http://www.w3.org/ns/prov#",
    "ihh": "https://immigranthallofhonor.org/ns#",
}
FILES = ("wordpress.html", "facts.csv", "sources.csv", "media.csv", "searches.csv", "provenance.jsonld",
         "REVIEW.md")
_ANY_ID = re.compile(r"\b[A-Z]{3}-[FSMQ]-\d{4,}\b")
_ID_PARENS = re.compile(r"\s*\((?:\s*[A-Z]{3}-[FSMQ]-\d{4,}\s*[,;]?)+\s*\)")


# --- escaping ------------------------------------------------------------------------------

def esc(text):
    """HTML-escape text for element content or a quoted attribute."""
    return html.escape("" if text is None else str(text), quote=True)


def attr(value):
    return html.escape("" if value is None else str(value), quote=True)


def safe_url(url):
    """The URL if it is a canonical http(s) URL (ihh.urls), else None."""
    if not isinstance(url, str):
        return None
    u = url.strip()
    return u if urls.problem(u) is None else None


def md(text):
    """One line of Markdown-safe text: whitespace collapsed, markup characters backslash-escaped."""
    t = " ".join(str("" if text is None else text).split())
    return re.sub(r"([\\`*_\[\]<>|])", r"\\\1", t)


def md_url(url):
    u = safe_url(url)
    if u is None:
        return md(url) if url else ""
    return "<" + quote(u, safe=":/?#[]@!$&'()*+,;=%-._~") + ">"


def date_label(value):
    """'1941' -> '1941', '1941-06' -> 'June 1941', '1941-06-10' -> 'June 10, 1941'."""
    if not isinstance(value, str):
        return "" if value is None else str(value)
    m = re.fullmatch(r"(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?", value.strip())
    if not m or normalize.parse_date_parts(value) is None:
        return value
    year, month, day = m.groups()
    if not month:
        return year
    name = normalize.MONTH_NAMES[int(month) - 1].capitalize()
    return f"{name} {int(day)}, {year}" if day else f"{name} {year}"


def _strip_end(text, chars=".:;, "):
    return str(text or "").strip().rstrip(chars)


# --- WordPress blocks -------------------------------------------------------------------------

def _stamp(stamp):
    return f"<strong>{esc(stamp)}</strong> " if stamp else ""


def heading(text, level=2, stamp=None):
    attrs = "" if level == 2 else f' {{"level":{int(level)}}}'
    return (f"<!-- wp:heading{attrs} -->\n<h{level} class=\"wp-block-heading\">{_stamp(stamp)}{esc(text)}"
            f"</h{level}>\n<!-- /wp:heading -->")


def paragraph_html(inner, stamp=None):
    """A paragraph block around inner HTML that the caller built from escaped pieces."""
    return f"<!-- wp:paragraph -->\n<p>{_stamp(stamp)}{inner}</p>\n<!-- /wp:paragraph -->"


def paragraph(text, stamp=None):
    return paragraph_html(esc(text), stamp)


def list_block(items, ordered=False, stamp=None):
    """A list block; items are inner HTML strings, one list-item block each."""
    tag = "ol" if ordered else "ul"
    attrs = ' {"ordered":true}' if ordered else ""
    inner = "\n\n".join(f"<!-- wp:list-item -->\n<li>{_stamp(stamp)}{item}</li>\n<!-- /wp:list-item -->"
                        for item in items)
    return f"<!-- wp:list{attrs} -->\n<{tag} class=\"wp-block-list\">{inner}</{tag}>\n<!-- /wp:list -->"


def image_block(src, alt, caption_inner, stamp=None):
    return (f"<!-- wp:image -->\n<figure class=\"wp-block-image\"><img src=\"{attr(src)}\" alt=\"{attr(alt)}\"/>"
            f"<figcaption class=\"wp-element-caption\">{_stamp(stamp)}{caption_inner}</figcaption></figure>\n"
            f"<!-- /wp:image -->")


# --- the package in memory --------------------------------------------------------------------------

@dataclass
class Package:
    p: object
    inductee: dict
    facts: list
    sources: list
    media: list
    searches: list
    profile: dict | None
    ctx: object
    preview: bool
    decisions: list = field(default_factory=list)
    verdicts: list = field(default_factory=list)  # drafts/grounding.jsonl rows
    facts_by_id: dict = field(default_factory=dict)
    sources_by_id: dict = field(default_factory=dict)
    media_by_id: dict = field(default_factory=dict)
    chapters: list = field(default_factory=list)  # content/<slug>/chapters/<n>.json, in chapter order

    def __post_init__(self):
        self.facts_by_id = gates.by_id(self.facts)
        self.sources_by_id = gates.by_id(self.sources)
        self.media_by_id = gates.by_id(self.media)

    @property
    def slug(self):
        return self.p.slug

    @property
    def name(self):
        return self.inductee.get("name") or self.slug

    def qualifies(self, rec):
        if not isinstance(rec, dict) or rec.get("status") != "verified":
            return False
        state = (rec.get("review") if isinstance(rec.get("review"), dict) else {}).get("state")
        if self.preview:
            return state != "rejected"
        kind = "fact" if "evidence" in rec else "media"
        return state in PUBLISHABLE_REVIEW and not review_log.backing_problems(rec, kind, self.decisions)

    def fact_ok(self, fid):
        return self.qualifies(self.facts_by_id.get(fid))

    def media_ok(self, mid):
        return self.qualifies(self.media_by_id.get(mid))

    def why_not(self, rid):
        rec = self.facts_by_id.get(rid) or self.media_by_id.get(rid)
        if rec is None:
            return f"{rid} (unknown)"
        state = (rec.get("review") if isinstance(rec.get("review"), dict) else {}).get("state")
        return f"{rid} (status {rec.get('status')}, review {state})"

    def exported_facts(self):
        return [f for f in self.facts if self.preview or self.qualifies(f)]

    def exported_media(self):
        return [m for m in self.media if self.preview or self.qualifies(m)]

    def exported_sources(self):
        if self.preview:
            return list(self.sources)
        wanted = set()
        for f in self.exported_facts():
            wanted.update(record_source_ids(f))
        for m in self.exported_media():
            wanted.update(record_source_ids(m))
            for rid in _list(m.get("reconstruction_basis")):
                if rid in self.sources_by_id:
                    wanted.add(rid)
        return [s for s in self.sources if s.get("id") in wanted]


def _list(value):
    return value if isinstance(value, list) else []


def record_source_ids(rec):
    """Source ids a fact (evidence) or media item (source_ids) rests on, in order, without repeats."""
    if "evidence" in rec:
        sids = [e.get("source_id") for e in _list(rec.get("evidence")) if isinstance(e, dict)]
    else:
        sids = _list(rec.get("source_ids"))
    return list(dict.fromkeys(s for s in sids if isinstance(s, str)))


def _dict(value):
    return value if isinstance(value, dict) else {}


def _ids(value):
    return [x for x in _list(value) if isinstance(x, str)]


def load_package(p, preview, content_dir=None):
    inductee = records.read_json(p.inductee_json, default={})
    facts = records.read_jsonl(p.facts)
    profile = records.read_json(p.profile)
    return Package(p=p, inductee=inductee if isinstance(inductee, dict) else {}, facts=facts,
                   sources=records.read_jsonl(p.sources), media=records.read_jsonl(p.media),
                   searches=records.read_jsonl(p.searches),
                   profile=profile if isinstance(profile, dict) else None,
                   ctx=records.load_context(p, facts), preview=preview,
                   decisions=records.read_jsonl(p.decisions), verdicts=check_grounding.load_verdicts(p),
                   chapters=check_grounding.load_chapters(content_dir or check_grounding.default_content_dir(), p.slug))


# --- wordpress.html ---------------------------------------------------------------------------------

class Citations:
    """Numbers sources in order of first citation and renders the superscript links."""

    def __init__(self, pkg):
        self.pkg = pkg
        self.order = []

    def sources_for(self, fact_ids):
        out = []
        for fid in fact_ids:
            fact = self.pkg.facts_by_id.get(fid) or {}
            for item in _list(fact.get("evidence")):
                sid = item.get("source_id") if isinstance(item, dict) else None
                src = self.pkg.sources_by_id.get(sid) if isinstance(sid, str) else None
                if src is not None and src.get("type") in STRONG_TYPES and sid not in out:
                    out.append(sid)
        return out

    def sup(self, fact_ids):
        links = []
        for sid in self.sources_for(fact_ids):
            if sid not in self.order:
                self.order.append(sid)
            n = self.order.index(sid) + 1
            url = safe_url(self.pkg.sources_by_id[sid].get("url"))
            links.append(f"<a href=\"{attr(url)}\">[{n}]</a>" if url else f"[{n}]")
        return f"<sup>{''.join(links)}</sup>" if links else ""


@dataclass
class Unit:
    location: str
    text: str
    fact_ids: list
    included: bool
    reason: str = ""


def unjudged(pkg, location, kind, text, fact_ids):
    """Why a unit lacks a current sentence-adversary approval (G6); None if it has one or in preview."""
    if pkg.preview:
        return None
    unit = check_grounding.Unit(location, kind, text, list(fact_ids))
    return check_grounding.verdict_problem(unit, check_grounding.cited_facts(unit, pkg.facts_by_id), pkg.verdicts)


def _check_unit(pkg, location, text, fact_ids, units, kind="sentence"):
    """The one gate for every published sentence, title and caption, profile or experience content:
    it cites verified (and in a final export approved) facts, uses only what they say, and has a
    current "supported" sentence-adversary verdict (G6, final export only)."""
    if not isinstance(text, str) or not text.strip():
        units.append(Unit(location, text, fact_ids, False, "missing text"))
        return False
    if not fact_ids:
        units.append(Unit(location, text, fact_ids, False, "cites no facts"))
        return False
    bad = [pkg.why_not(fid) for fid in fact_ids if not pkg.fact_ok(fid)]
    if bad:
        units.append(Unit(location, text, fact_ids, False, "cites " + ", ".join(bad)))
        return False
    failures = check_grounding.check_text(text, [pkg.facts_by_id[f] for f in fact_ids], pkg.ctx.names)
    if failures:
        units.append(Unit(location, text, fact_ids, False, "; ".join(failures)))
        return False
    problem = unjudged(pkg, location, kind, text, fact_ids)
    if problem:
        units.append(Unit(location, text, fact_ids, False, problem))
        return False
    units.append(Unit(location, text, fact_ids, True))
    return True


def _check_content(pkg, unit, units):
    """_check_unit for a Unit built by check_grounding (the shared enumerator of content units)."""
    return _check_unit(pkg, unit.location, unit.text, unit.fact_ids, units, unit.kind)


def clean_alt(text):
    """Alt text without the fact ids the record may carry."""
    t = _ID_PARENS.sub("", str(text or ""))
    t = _ANY_ID.sub("", t)
    t = re.sub(r"\s+([.,;:])", r"\1", " ".join(t.split()))
    return t.strip()


def _credit_line(m):
    label = LICENSE_LABELS.get(m.get("license_class"), "Rights not determined")
    rights = safe_url(m.get("rights_url"))
    licence = f"<a href=\"{attr(rights)}\">{esc(label)}</a>" if rights else esc(label)
    credit = _strip_end(m.get("credit"), ". ")
    return (f"Credit: {esc(credit)}. " if credit else "") + f"{licence}."


def _is_image_url(url):
    path = urlsplit(url).path.lower()
    return path.endswith(IMAGE_EXTENSIONS)


def _reconstruction_note(pkg, m):
    sids = []
    for rid in _ids(m.get("reconstruction_basis")):
        if rid in pkg.sources_by_id:
            sids.append(rid)
        elif rid in pkg.facts_by_id:
            sids.extend(record_source_ids(pkg.facts_by_id[rid]))
    links = []
    for sid in dict.fromkeys(sids):
        src = pkg.sources_by_id.get(sid) or {}
        url = safe_url(src.get("url"))
        title = esc(_strip_end(src.get("title")))
        links.append(f"<a href=\"{attr(url)}\">{title}</a>" if url else title)
    return f"Reconstruction based on {'; '.join(links)}." if links else "Reconstruction."


def is_basis_photo(m):
    """True for a basis photo (record_kind basis-photo, owner decision 2026-10-16): a photograph of a
    place used only to rebuild a tour stop, never shown as an artifact about the inductee."""
    return isinstance(m, dict) and m.get("record_kind") == "basis-photo"


def figure(pkg, m, caption_html, stamp):
    url = safe_url(m.get("url"))
    credit = _credit_line(m)
    if (m.get("license_class") in EMBEDDABLE and m.get("reconstruction") is not True and url
            and _is_image_url(url)):
        caption = f"{caption_html}<br>{credit}" if caption_html else credit
        return image_block(url, clean_alt(m.get("alt_text")), caption, stamp)
    parts = [caption_html] if caption_html else []
    if m.get("reconstruction") is True:
        parts.append(_reconstruction_note(pkg, m))
    if url:
        parts.append(f"<a href=\"{attr(url)}\">View this item</a>.")
    parts.append(credit)
    return paragraph_html(" ".join(parts), stamp)


def how_to_cite(pkg):
    """The citation line, built from inductee.json only.

    profile.how_to_cite is free text that no gate checks, so it is never
    published; this template states no biographical fact.
    """
    url = safe_url(pkg.inductee.get("ihh_url"))
    return f"{pkg.name}. Immigrant Hall of Honor." + (f" {url}" if url else "")


# --- experience content ---------------------------------------------------------------------------------

_PHOTO_DATE = re.compile(r"Photo date as stated by the holder \(Date field\): ([0-9]{4}(?:-[0-9]{2}){0,2})\.")


def _record_date(m, src):
    """(date, kind) for a media record: the holder's photo date where its notes state it, else the
    source's published or accessed date (the same rule as the site's recordDate)."""
    hit = _PHOTO_DATE.search(str(m.get("notes") or ""))
    if hit:
        return hit.group(1), "photographed"
    if src.get("published"):
        return src["published"], "published"
    return src.get("accessed") or "", "accessed"


def _usable_media(pkg, mid):
    """True if the media item may be shown: it qualifies and its licence may be embedded."""
    return pkg.media_ok(mid) and pkg.media_by_id[mid].get("license_class") in EMBEDDABLE


def _original_link(m):
    url = safe_url(m.get("url"))
    return f"<a href=\"{attr(url)}\">See the original</a>" if url else ""


def _reconstruction_paragraph(pkg, cid, rec, cites, units):
    """Inner HTML of a reconstructed-place chapter's note, or None when it cannot be published whole."""
    rec = _dict(rec)
    unit = check_grounding.reconstruction_unit(cid, {"reconstruction": rec})
    where = unit.location
    basis = _ids(rec.get("basis_media_ids"))
    fids = _ids(rec.get("basis_fact_ids"))
    note = rec.get("note")
    off = [pkg.why_not(mid) for mid in basis if not _usable_media(pkg, mid)]
    if not basis or off:
        units.append(Unit(where, note, fids, False,
                          "basis media do not qualify: " + (", ".join(off) or "none named")))
        return None
    parts = []
    for mid in basis:
        m = pkg.media_by_id[mid]
        src = pkg.sources_by_id.get(next(iter(_ids(m.get("source_ids"))), None)) or {}
        if not m.get("title") or not src:
            units.append(Unit(where, note, fids, False, f"basis media {mid} lacks a title or a source record"))
            return None
        date, kind = _record_date(m, src)
        url = safe_url(m.get("url"))
        title = esc(_strip_end(m.get("title")))
        label = f"<a href=\"{attr(url)}\">{title}</a>" if url else title
        parts.append(f"{label}, {esc(_strip_end(src.get('institution')))}, {esc(kind)} {esc(date)}")
    lead = ""
    if note is not None:
        if not _check_content(pkg, unit, units):
            return None
        lead = esc(note) + cites.sup(fids) + " "
    return lead + "Reconstruction based on " + "; ".join(parts) + "."


def _exhibit_block(pkg, cid, ex, cites, units, stamp):
    """The block for one exhibit, or None when it is withheld."""
    ex = _dict(ex)
    title = check_grounding.exhibit_title_unit(cid, ex)
    where = title.location
    tfids = _ids(ex.get("title_fact_ids"))
    off = [pkg.why_not(mid) for mid in (ex.get("media_id"), ex.get("original_media_id"))
           if not _usable_media(pkg, mid)]
    if off:
        units.append(Unit(where, ex.get("title"), tfids, False, "media do not qualify: " + ", ".join(off)))
        return None
    shown, original = pkg.media_by_id[ex["media_id"]], pkg.media_by_id[ex["original_media_id"]]
    link = _original_link(original)
    if not link:
        units.append(Unit(where, ex.get("title"), tfids, False, "the original record has no http(s) link"))
        return None
    if not _check_content(pkg, title, units):
        return None
    lines = [f"<strong>{esc(ex.get('title'))}</strong>{cites.sup(tfids)}"]
    for i, note in enumerate(_list(ex.get("notes"))):
        note = _dict(note)
        nfids = _ids(note.get("fact_ids"))
        if _check_content(pkg, check_grounding.exhibit_note_unit(cid, ex, i, note), units):
            lines.append(f"{esc(note.get('text'))}{cites.sup(nfids)}")
    lines.append(_credit_line(shown))
    if shown.get("rights_statement"):
        lines.append(f"Rights: {esc(shown.get('rights_statement'))}")
    if original is not shown and original.get("rights_statement"):
        lines.append(f"Rights of the original record: {esc(original.get('rights_statement'))}")
    if shown.get("reconstruction") is True:
        lines.append(_reconstruction_note(pkg, shown))
    lines.append(link)
    caption = "<br>".join(lines)
    url = safe_url(shown.get("url"))
    if shown.get("reconstruction") is not True and url and _is_image_url(url):
        return image_block(url, clean_alt(shown.get("alt_text")) or clean_alt(ex.get("title")), caption, stamp)
    return paragraph_html(caption, stamp)


def _withhold_chapter_units(pkg, cid, ch, reason, units):
    """List every narration line and exhibit of a chapter as withheld, for REVIEW.md."""
    for line in _list(ch.get("narration")):
        line = _dict(line)
        t = check_grounding.narration_unit(cid, line)
        units.append(Unit(t.location, t.text, t.fact_ids, False, reason))
    for ex in _list(ch.get("exhibits")):
        ex = _dict(ex)
        t = check_grounding.exhibit_title_unit(cid, ex)
        units.append(Unit(t.location, t.text, t.fact_ids, False, reason))


def experience_blocks(pkg, cites, units, stamp):
    """WordPress blocks for the experience chapters: a heading per chapter, a paragraph per narration
    line, an image block per exhibit. Appends one Unit per decision."""
    out = []
    for n, ch in enumerate(pkg.chapters, 1):
        ch = _dict(ch)
        cid = check_grounding.chapter_id(ch, n)
        if not _check_content(pkg, check_grounding.title_unit(cid, ch), units):
            _withhold_chapter_units(pkg, cid, ch, "chapter title withheld", units)
            continue
        title_unit = units[-1]
        body, note = [], None
        if ch.get("room") == "reconstructed-place":
            note = _reconstruction_paragraph(pkg, cid, ch.get("reconstruction"), cites, units)
            if note is None:
                title_unit.included = False
                title_unit.reason = "its reconstruction note cannot be published"
                _withhold_chapter_units(pkg, cid, ch, "chapter title withheld", units)
                continue
        for line in _list(ch.get("narration")):
            line = _dict(line)
            lfids = _ids(line.get("fact_ids"))
            if _check_content(pkg, check_grounding.narration_unit(cid, line), units):
                body.append(paragraph_html(esc(line.get("text")) + cites.sup(lfids), stamp))
        for ex in _list(ch.get("exhibits")):
            block = _exhibit_block(pkg, cid, ex, cites, units, stamp)
            if block:
                body.append(block)
        if not body:
            title_unit.included = False
            title_unit.reason = "all its lines and exhibits are withheld"
            continue
        out.append(heading(ch.get("title"), 2, stamp))
        if note is not None:
            out.append(paragraph_html(note, stamp))
        out.extend(body)
    return out


def build_wordpress(pkg, today):
    """(html, units) for the package; units record what was included or withheld."""
    stamp = STAMP if pkg.preview else None
    profile = pkg.profile or {}
    units = []
    cites = Citations(pkg)
    content = []

    # Decide first, render second, so withheld units never take a source number.
    summary = []
    for i, item in enumerate(_list(profile.get("summary"))):
        item = _dict(item)
        fids = _ids(item.get("fact_ids"))
        if _check_unit(pkg, f"profile:summary:{i}", item.get("text"), fids, units):
            summary.append((item.get("text"), fids))

    sections = []
    for j, section in enumerate(_list(profile.get("sections"))):
        section = _dict(section)
        sid = section.get("id") if isinstance(section.get("id"), str) and section.get("id") else str(j)
        kept, first = [], len(units)
        for k, sentence in enumerate(_list(section.get("sentences"))):
            sentence = _dict(sentence)
            fids = _ids(sentence.get("fact_ids"))
            if _check_unit(pkg, f"profile:sections:{sid}:{k}", sentence.get("text"), fids, units):
                kept.append((sentence.get("text"), fids))
        if not kept:
            continue
        pooled = list(dict.fromkeys(fid for _, fids in kept for fid in fids))
        problems = check_grounding.check_text(section.get("title"), [pkg.facts_by_id[f] for f in pooled],
                                              pkg.ctx.names)
        # The heading's sentence-adversary verdict judged it against every sentence's facts.
        judged_ids = list(dict.fromkeys(fid for s in _list(section.get("sentences"))
                                        for fid in _ids(_dict(s).get("fact_ids"))))
        problem = unjudged(pkg, f"profile:sections:{sid}:title", "title", section.get("title"), judged_ids)
        if problem:
            problems.append(problem)
        if problems:
            for unit in units[first:]:
                if unit.included:
                    unit.included = False
                    unit.reason = "its section heading is not grounded in the published sentences"
            units.append(Unit(f"profile:sections:{sid}:title", section.get("title"), pooled, False,
                              "heading not grounded in the published sentences: " + "; ".join(problems)))
            continue
        units.append(Unit(f"profile:sections:{sid}:title", section.get("title"), pooled, True))
        sections.append((section.get("title"), kept))

    timeline, timeline_media = [], []
    for i, entry in enumerate(_list(profile.get("timeline"))):
        entry = _dict(entry)
        fids = _ids(entry.get("fact_ids"))
        if _check_unit(pkg, f"profile:timeline:{i}", entry.get("text"), fids, units):
            problem = unjudged(pkg, f"profile:timeline:{i}:title", "title", entry.get("title"), fids)
            if problem:
                units[-1].included = False
                units[-1].reason = f"its title: {problem}"
                continue
            timeline.append((entry, fids))
            timeline_media.extend(_ids(entry.get("media_ids")))

    artifacts = []
    shown_media = []
    for i, art in enumerate(_list(profile.get("artifacts"))):
        art = _dict(art)
        mid = art.get("media_id")
        fids = _ids(art.get("fact_ids"))
        if not pkg.media_ok(mid):
            units.append(Unit(f"profile:artifacts:{i}", art.get("caption"), fids, False,
                              f"media {pkg.why_not(mid)} does not qualify"))
            continue
        if is_basis_photo(pkg.media_by_id.get(mid)):
            units.append(Unit(f"profile:artifacts:{i}", art.get("caption"), fids, False,
                              f"media {mid} is a basis photo (a place used to rebuild a tour stop), not an "
                              f"artifact about the inductee"))
            continue
        if _check_unit(pkg, f"profile:artifacts:{i}", art.get("caption"), fids, units, kind="caption"):
            artifacts.append((art, fids))
            shown_media.append(mid)
    extra_media = [mid for mid in dict.fromkeys(timeline_media)
                   if mid not in shown_media and pkg.media_ok(mid) and not is_basis_photo(pkg.media_by_id.get(mid))]

    if summary:
        content.append(paragraph_html(" ".join(esc(t) + cites.sup(f) for t, f in summary), stamp))
    for title, kept in sections:
        content.append(heading(title, 2, stamp))
        content.append(paragraph_html(" ".join(esc(t) + cites.sup(f) for t, f in kept), stamp))
    if timeline:
        items = []
        for entry, fids in timeline:
            label = date_label(entry.get("date"))
            title = _strip_end(entry.get("title"))
            items.append(f"<strong>{esc(label)} — {esc(title)}.</strong> {esc(entry.get('text'))}"
                         f"{cites.sup(fids)}")
        content.append(heading("Timeline", 2, stamp))
        content.append(list_block(items, stamp=stamp))
    if artifacts or extra_media:
        content.append(heading("Images and documents", 2, stamp))
        for art, fids in artifacts:
            m = pkg.media_by_id[art.get("media_id")]
            content.append(figure(pkg, m, esc(art.get("caption")) + cites.sup(fids), stamp))
        for mid in extra_media:
            content.append(figure(pkg, pkg.media_by_id[mid], "", stamp))

    content.extend(experience_blocks(pkg, cites, units, stamp))

    blocks = []
    if pkg.preview:
        blocks.append(paragraph(f"Preview of the review package for {pkg.name}, generated {today} by "
                                f"tools/export.py --preview. Do not publish.", stamp))
    if not content:
        message = ("No draft profile yet." if pkg.profile is None else
                   "No draft content qualifies yet." if pkg.preview else
                   "No reviewed content qualifies for publishing yet; see REVIEW.md.")
        blocks.append(paragraph(message, stamp))
        return "\n\n".join(blocks) + "\n", units
    blocks.extend(content)
    if cites.order:
        items = []
        for sid in cites.order:
            src = pkg.sources_by_id[sid]
            url = safe_url(src.get("url"))
            title = esc(_strip_end(src.get("title"), ". "))
            link = f"<a href=\"{attr(url)}\">{title}</a>" if url else title
            parts = [f"{esc(_strip_end(src.get('institution'), '. '))}.", f"{link}."]
            if src.get("published"):
                parts.append(f"{esc(date_label(src.get('published')))}.")
            if src.get("accessed"):
                parts.append(f"Accessed {esc(src.get('accessed'))}.")
            items.append(" ".join(parts))
        blocks.append(heading("Sources", 2, stamp))
        blocks.append(list_block(items, ordered=True, stamp=stamp))
    blocks.append(heading("How to cite this page", 2, stamp))
    blocks.append(paragraph(how_to_cite(pkg), stamp))
    return "\n\n".join(blocks) + "\n", units


# --- CSV ------------------------------------------------------------------------------------------------

FACT_COLUMNS = ("inductee", "id", "claim", "category", "event_date", "place", "status", "review_state",
                "reviewer", "review_date", "review_note", "review_decision_id", "review_decision_date",
                "primary_document", "is_direct_quote", "source_ids",
                "source_urls", "evidence", "extractor_model", "extractor_run_id", "extractor_date",
                "extractor_verdict", "adversary_model", "adversary_run_id", "adversary_date",
                "adversary_verdict", "quote_in_snapshot", "quote_in_live", "entailed", "adds_information",
                "atomic", "source_type_ok", "adversary_rationale", "verified_claim_sha256", "used_in", "notes")
SOURCE_COLUMNS = ("inductee", "id", "title", "institution", "type", "url", "fetch_url", "catalog_id",
                  "published", "accessed", "snapshot", "snapshot_sha256", "fetch_method", "archive_url", "notes")
MEDIA_COLUMNS = ("inductee", "id", "title", "media_type", "source_ids", "url", "rights_statement", "rights_url",
                 "license_class", "embeddable", "credit", "alt_text", "reconstruction", "reconstruction_basis",
                 "record_kind", "basis_for", "authorship", "status", "review_state", "reviewer", "review_date", "review_note", "review_decision_id",
                 "review_decision_date", "adversary_model", "adversary_verdict", "adversary_rationale",
                 "verified_claim_sha256", "notes")
SEARCH_COLUMNS = ("inductee", "id", "date", "family", "tool", "query", "results", "produced", "agent", "run_id",
                  "notes")
_FORMULA = re.compile(r"^[=+\-@\t\r]")
_NUMBER = re.compile(r"^[+-]?\d+(?:\.\d+)?$")


def cell(value):
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        return "; ".join(cell(v) for v in value)
    if isinstance(value, dict):
        return json.dumps(value, ensure_ascii=False)
    text = str(value)
    if _FORMULA.match(text) and not _NUMBER.match(text):
        return "'" + text  # a spreadsheet would run it as a formula
    return text


def _decision(pkg, rec):
    """(id, date) of the decision backing an approved or edited record, else (None, None)."""
    kind = "fact" if "evidence" in rec else "media"
    return review_log.backing_decision(rec, kind, pkg.decisions, pkg.slug) or (None, None)


# Who reviewed an item goes out as a role, never a person's name or email (owner privacy rule,
# 2026-10-24): the export goes to IHH. The review store keeps the full entry.
_ROLE_RULES = (
    (re.compile(r"^\s*owner\b", re.I), "project owner"),
    (re.compile(r"\bcontroller\b", re.I), "controller"),
    (re.compile(r"\b(codex|adversary)\b", re.I), "Codex adversary"),
    (re.compile(r"\b(agent|session)\b", re.I), "research agent"),
)
_EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
_OWNER_PAREN = re.compile(r"\bowner \([^)]*\)(?:, instruction relayed by the dispatching session [0-9-]+)?", re.I)


def reviewer_role(reviewer):
    """The role a review entry names: project owner, controller, Codex adversary, research agent, or
    'reviewer (name withheld)' for anything else (a name, an email). None stays None."""
    if not reviewer:
        return reviewer
    if _EMAIL.search(reviewer):
        return "reviewer (name withheld)"
    for pattern, role in _ROLE_RULES:
        if pattern.search(reviewer):
            return role
    return "reviewer (name withheld)"


def _public_review(review):
    """A review entry as it may leave the project: reviewer as a role, the note without the reviewer's
    name (apply_review.py writes "<date> <reviewer>: <note>"), an owner's name or an email."""
    review = dict(review)
    who = review.get("reviewer")
    role = reviewer_role(who)
    note = review.get("note")
    if note:
        if who:
            note = note.replace(who, role)
        note = _OWNER_PAREN.sub("project owner", note)
        note = _EMAIL.sub("[email withheld]", note)
    review["reviewer"], review["note"] = role, note
    return review


def _public_notes(pkg, notes):
    """A record's notes as they may leave the project: apply_review.py writes "Edited by <reviewer> ..."
    into them, so every reviewer named in the package's reviews and decisions goes out as a role."""
    if not notes:
        return notes
    who = {d.get("reviewer") for d in pkg.decisions if isinstance(d, dict)}
    who |= {_dict(r.get("review")).get("reviewer") for r in pkg.facts + pkg.media}
    for name in sorted((w for w in who if w), key=len, reverse=True):
        notes = notes.replace(name, reviewer_role(name))
    return _OWNER_PAREN.sub("project owner", notes)


def _review_cols(pkg, rec):
    review = _public_review(_dict(rec.get("review")))
    decision_id, decision_date = _decision(pkg, rec)
    return {"review_state": review.get("state"), "reviewer": review.get("reviewer"),
            "review_date": review.get("date"), "review_note": review.get("note"),
            "review_decision_id": decision_id, "review_decision_date": decision_date}


def fact_row(pkg, f):
    ext, adv = _dict(f.get("extractor")), _dict(f.get("adversary"))
    evidence = [e for e in _list(f.get("evidence")) if isinstance(e, dict)]
    sids = record_source_ids(f)
    row = {"inductee": pkg.slug, "id": f.get("id"), "claim": f.get("claim"), "category": f.get("category"),
           "event_date": f.get("event_date"), "place": f.get("place"), "status": f.get("status"),
           "primary_document": f.get("primary_document"), "is_direct_quote": f.get("is_direct_quote"),
           "source_ids": sids,
           "source_urls": [(pkg.sources_by_id.get(s) or {}).get("url") for s in sids],
           "evidence": " | ".join(f"{e.get('source_id')} [{e.get('locator')}]: {e.get('quote')}" for e in evidence),
           "extractor_model": ext.get("model"), "extractor_run_id": ext.get("run_id"),
           "extractor_date": ext.get("date"), "extractor_verdict": ext.get("verdict"),
           "adversary_model": adv.get("model"), "adversary_run_id": adv.get("run_id"),
           "adversary_date": adv.get("date"), "adversary_verdict": adv.get("verdict"),
           "quote_in_snapshot": adv.get("quote_in_snapshot"), "quote_in_live": adv.get("quote_in_live"),
           "entailed": adv.get("entailed"), "adds_information": adv.get("adds_information"),
           "atomic": adv.get("atomic"), "source_type_ok": adv.get("source_type_ok"),
           "adversary_rationale": adv.get("rationale"), "verified_claim_sha256": f.get("verified_claim_sha256"),
           "used_in": f.get("used_in"), "notes": _public_notes(pkg, f.get("notes"))}
    row.update(_review_cols(pkg, f))
    return row


def source_row(pkg, s):
    row = {k: s.get(k) for k in SOURCE_COLUMNS if k != "inductee"}
    row["inductee"] = pkg.slug
    return row


def _basis_ref(b):
    b = _dict(b)
    return b.get("fact_id") or b.get("source_id") or "unsourced"


def authorship_text(a):
    """One line for media.csv (private writings, SPEC 3.4.3): kind, each author's death year and its basis."""
    if not isinstance(a, dict):
        return None
    parts = []
    for au in a.get("authors") or []:
        au = _dict(au)
        year = au.get("death_year")
        parts.append(f"{au.get('name')} d. {year} ({_basis_ref(au.get('death_basis'))})" if year
                     else f"{au.get('name')} (death year not sourced)")
    pub = _dict(a.get("published"))
    if pub.get("year"):
        parts.append(f"published {pub['year']} ({_basis_ref(pub.get('basis'))})")
    return f"{a.get('kind')}: " + "; ".join(parts) if parts else str(a.get("kind"))


def media_row(pkg, m):
    adv = _dict(m.get("adversary"))
    row = {k: m.get(k) for k in MEDIA_COLUMNS if k in m}
    row.update({"inductee": pkg.slug, "embeddable": "yes" if m.get("license_class") in EMBEDDABLE else "no",
                "record_kind": m.get("record_kind") or "item", "authorship": authorship_text(m.get("authorship")),
                "adversary_model": adv.get("model"), "adversary_verdict": adv.get("verdict"),
                "adversary_rationale": adv.get("rationale"), "notes": _public_notes(pkg, m.get("notes"))})
    row.update(_review_cols(pkg, m))
    return row


def search_row(pkg, q):
    row = {k: q.get(k) for k in SEARCH_COLUMNS if k != "inductee"}
    row["inductee"] = pkg.slug
    return row


def to_csv(columns, rows):
    buf = io.StringIO()
    writer = csv.writer(buf, lineterminator="\r\n")
    writer.writerow(columns)
    for row in rows:
        writer.writerow([cell(row.get(c)) for c in columns])
    return buf.getvalue()


def csv_rows(pkg):
    return {
        "facts.csv": (FACT_COLUMNS, [fact_row(pkg, f) for f in pkg.exported_facts()]),
        "sources.csv": (SOURCE_COLUMNS, [source_row(pkg, s) for s in pkg.exported_sources()]),
        "media.csv": (MEDIA_COLUMNS, [media_row(pkg, m) for m in pkg.exported_media()]),
        "searches.csv": (SEARCH_COLUMNS, [search_row(pkg, q) for q in pkg.searches]),
    }


# --- JSON-LD -------------------------------------------------------------------------------------------------

def _clean(node):
    """Drop keys whose value is None, an empty string, or an empty list or object."""
    return {k: v for k, v in node.items() if v is not None and v != "" and v != [] and v != {}}


def _ref(rid):
    return {"@id": f"ihh:{rid}"}


def _person_id(pkg):
    return f"ihh:person-{pkg.slug}"


def _run_id(pkg, run_id):
    return f"ihh:run-{pkg.slug}-{run_id}"


def _adversary_node(adv):
    adv = _dict(adv)
    return _clean({"ihh:model": adv.get("model"), "ihh:runId": adv.get("run_id"), "ihh:date": adv.get("date"),
                   "ihh:verdict": adv.get("verdict"), "ihh:quoteInSnapshot": adv.get("quote_in_snapshot"),
                   "ihh:quoteInLive": adv.get("quote_in_live"), "ihh:entailed": adv.get("entailed"),
                   "ihh:addsInformation": adv.get("adds_information"), "ihh:atomic": adv.get("atomic"),
                   "ihh:sourceTypeOk": adv.get("source_type_ok"), "ihh:rationale": adv.get("rationale")})


def _review_node(pkg, rec):
    review = _public_review(_dict(rec.get("review")))
    decision_id, decision_date = _decision(pkg, rec)
    return _clean({"ihh:state": review.get("state"), "ihh:reviewer": review.get("reviewer"),
                   "ihh:date": review.get("date"), "ihh:note": review.get("note"),
                   "ihh:decision": decision_id, "ihh:decisionDate": decision_date})


def jsonld_graph(pkg):
    graph = []
    authority = _dict(pkg.inductee.get("authority"))
    same_as = [u for u in (authority.get("loc_naf"),) if safe_url(u)]
    aliases = [n for n in pkg.ctx.names if n != pkg.inductee.get("name")]
    graph.append(_clean({"@id": _person_id(pkg), "@type": "Person", "name": pkg.name, "alternateName": aliases,
                         "sameAs": same_as, "url": pkg.inductee.get("ihh_url"),
                         "ihh:code": pkg.inductee.get("code"), "ihh:slug": pkg.slug}))
    for run in _list(pkg.inductee.get("runs")):
        if isinstance(run, dict) and run.get("run_id"):
            graph.append(_clean({"@id": _run_id(pkg, run["run_id"]), "@type": "prov:Activity",
                                 "name": f"Pipeline run {run['run_id']}", "prov:startedAtTime": run.get("date"),
                                 "ihh:adversary": run.get("adversary"), "description": run.get("notes")}))
    for s in pkg.exported_sources():
        snapshot = _clean({"ihh:path": s.get("snapshot"), "ihh:sha256": s.get("snapshot_sha256"),
                           "ihh:fetchMethod": s.get("fetch_method")})
        graph.append(_clean({
            "@id": f"ihh:{s.get('id')}", "@type": "CreativeWork", "name": s.get("title"), "url": s.get("url"),
            "publisher": _clean({"@type": "Organization", "name": s.get("institution")}),
            "identifier": s.get("catalog_id"), "datePublished": s.get("published"),
            "ihh:sourceType": s.get("type"), "ihh:fetchUrl": s.get("fetch_url"),
            "ihh:archiveUrl": s.get("archive_url"), "ihh:accessed": s.get("accessed"), "ihh:snapshot": snapshot,
            "description": s.get("notes")}))
    for f in pkg.exported_facts():
        sids = record_source_ids(f)
        ext = _dict(f.get("extractor"))
        evidence = [_clean({"ihh:source": _ref(e.get("source_id")), "ihh:quote": e.get("quote"),
                            "ihh:locator": e.get("locator")})
                    for e in _list(f.get("evidence")) if isinstance(e, dict)]
        graph.append(_clean({
            "@id": f"ihh:{f.get('id')}", "@type": "Claim", "text": f.get("claim"),
            "about": {"@id": _person_id(pkg)}, "ihh:category": f.get("category"),
            "ihh:eventDate": f.get("event_date"), "ihh:place": f.get("place"), "ihh:status": f.get("status"),
            "ihh:primaryDocument": f.get("primary_document"), "ihh:isDirectQuote": f.get("is_direct_quote"),
            "citation": [_ref(s) for s in sids], "prov:wasDerivedFrom": [_ref(s) for s in sids],
            "ihh:evidence": evidence,
            "ihh:extractor": _clean({"ihh:model": ext.get("model"), "ihh:runId": ext.get("run_id"),
                                     "ihh:date": ext.get("date"), "ihh:verdict": ext.get("verdict")}),
            "prov:wasGeneratedBy": {"@id": _run_id(pkg, ext["run_id"])} if ext.get("run_id") else None,
            "ihh:adversary": _adversary_node(f.get("adversary")), "ihh:reviewState": _dict(f.get("review")).get("state"), "ihh:review": _review_node(pkg, f),
            "ihh:verifiedClaimSha256": f.get("verified_claim_sha256"), "ihh:usedIn": f.get("used_in"),
            "ihh:notes": _public_notes(pkg, f.get("notes"))}))
    for m in pkg.exported_media():
        graph.append(_clean({
            "@id": f"ihh:{m.get('id')}", "@type": "MediaObject", "name": m.get("title"),
            "ihh:mediaType": m.get("media_type"), "contentUrl": m.get("url"), "license": m.get("rights_url"),
            "copyrightNotice": m.get("rights_statement"), "ihh:licenseClass": m.get("license_class"),
            "ihh:embeddable": m.get("license_class") in EMBEDDABLE, "creditText": m.get("credit"),
            "description": m.get("alt_text"), "ihh:reconstruction": m.get("reconstruction"),
            "ihh:reconstructionBasis": [_ref(r) for r in _ids(m.get("reconstruction_basis"))],
            "ihh:recordKind": m.get("record_kind") or "item",
            "ihh:basisFor": [_ref(r) for r in _ids(m.get("basis_for"))],
            "prov:wasDerivedFrom": [_ref(s) for s in record_source_ids(m)],
            "ihh:status": m.get("status"), "ihh:adversary": _adversary_node(m.get("adversary")),
            "ihh:reviewState": _dict(m.get("review")).get("state"), "ihh:review": _review_node(pkg, m), "ihh:notes": _public_notes(pkg, m.get("notes"))}))
    for q in pkg.searches:
        graph.append(_clean({
            "@id": f"ihh:{q.get('id')}", "@type": "prov:Activity", "prov:startedAtTime": q.get("date"),
            "ihh:family": q.get("family"), "instrument": q.get("tool"), "query": q.get("query"),
            "ihh:results": q.get("results"),
            "prov:wasAssociatedWith": _clean({"@type": "prov:Agent", "name": q.get("agent")}) if q.get("agent")
            else None,
            "prov:generated": [_ref(r) for r in _ids(q.get("produced"))],
            "ihh:run": {"@id": _run_id(pkg, q["run_id"])} if q.get("run_id") else None,
            "description": q.get("notes")}))
    return graph


def jsonld_text(graph):
    return json.dumps({"@context": CONTEXT, "@graph": graph}, ensure_ascii=False, indent=2) + "\n"


# --- REVIEW.md -------------------------------------------------------------------------------------------------

def _yes_no(value):
    return {True: "yes", False: "no"}.get(value, md(value) if value is not None else "not recorded")


def _item_lines(pkg, rec, kind, reasons, choices):
    """One checklist entry; each field is its own paragraph so rendered Markdown keeps them apart."""
    rid = rec.get("id")
    fields = []
    if kind == "fact":
        fields.append(f"**Claim:** {md(rec.get('claim'))}")
        meta = [f"category {md(rec.get('category'))}"]
        if rec.get("event_date"):
            meta.append(f"date {md(rec.get('event_date'))}")
        if rec.get("place"):
            meta.append(f"place {md(rec.get('place'))}")
        if rec.get("is_direct_quote"):
            meta.append("the inductee's own words")
        fields.append(f"**About:** {', '.join(meta)}")
        evidence = ["**Evidence** (open the link and find the quote):", ""]
        for item in _list(rec.get("evidence")):
            item = _dict(item)
            src = pkg.sources_by_id.get(item.get("source_id")) or {}
            evidence.append(f"- {md(item.get('source_id'))}, {md(src.get('institution'))} ({md(src.get('type'))}): "
                            f"\"{md(item.get('quote'))}\" ({md(item.get('locator'))}) {md_url(src.get('url'))}")
        fields.append("\n".join(evidence))
        ext = _dict(rec.get("extractor"))
        fields.append(f"**Extractor:** {md(ext.get('model'))} (run {md(ext.get('run_id'))}, "
                      f"{md(ext.get('date'))}) judged it {md(ext.get('verdict'))}, citing the quotes above.")
    else:
        embeddable = rec.get("license_class") in EMBEDDABLE
        fields.append(f"**Item:** {md(rec.get('title'))} ({md(rec.get('media_type'))}) {md_url(rec.get('url'))}")
        fields.append(f"**Licence:** {md(rec.get('license_class'))}; "
                      f"{'can be shown on the site' if embeddable else 'link only, never embedded'}")
        fields.append(f"**Rights statement:** \"{md(rec.get('rights_statement'))}\" {md_url(rec.get('rights_url'))}")
        fields.append(f"**Credit:** {md(rec.get('credit'))}")
        fields.append(f"**Alt text** (published as the image description): {md(rec.get('alt_text'))}")
        fields.append(f"**Sources:** {', '.join(md(s) for s in _ids(rec.get('source_ids')))}")
        if rec.get("reconstruction") is True:
            fields.append("**Reconstruction based on:** "
                          f"{', '.join(md(r) for r in _ids(rec.get('reconstruction_basis')))}")
        if is_basis_photo(rec):
            fields.append("**Basis photo** (used only to rebuild the place; not judged as showing the inductee) "
                          f"for stop fact(s): {', '.join(md(r) for r in _ids(rec.get('basis_for')))}")
    adv = rec.get("adversary")
    if isinstance(adv, dict):
        fields.append(f"**Independent checker:** {md(adv.get('model'))} (run {md(adv.get('run_id'))}, "
                      f"{md(adv.get('date'))}): verdict {md(adv.get('verdict'))}; quote in snapshot "
                      f"{_yes_no(adv.get('quote_in_snapshot'))}; found in the live source "
                      f"{md(adv.get('quote_in_live'))}; entailed {_yes_no(adv.get('entailed'))}; adds information "
                      f"{_yes_no(adv.get('adds_information'))}; atomic {_yes_no(adv.get('atomic'))}; source type "
                      f"right {_yes_no(adv.get('source_type_ok'))}.")
        live = adv.get("live_by_source")
        if isinstance(live, list) and live:
            fields.append("**Live check per source:** " + "; ".join(
                f"{md(e.get('source_id'))} {md(str(e.get('result')).replace('_', ' '))} ({md(e.get('url'))})"
                for e in live if isinstance(e, dict)))
        fields.append(f"**Checker's reasoning:** {md(adv.get('rationale'))}")
        if isinstance(adv.get("registry_suggestion"), str) and adv["registry_suggestion"].strip():
            fields.append(f"**Checker's registry suggestion** (for the registry maintainer, "
                          f"data/registry/PROPOSED.md; it does not affect the status): "
                          f"{md(adv['registry_suggestion'])}")
    else:
        fields.append("**Independent checker:** no verdict yet.")
    if reasons:
        fields.append(f"**Why it is not verified:** {md('; '.join(reasons))}")
    if rec.get("notes"):
        fields.append(f"**Notes:** {md(_public_notes(pkg, rec.get('notes')))}")
    review = _public_review(_dict(rec.get("review")))
    if review.get("state") not in (None, "pending") or review.get("note"):
        by = f" by {md(review.get('reviewer'))} on {md(review.get('date'))}" if review.get("reviewer") else ""
        note = f"; note: {md(review.get('note'))}" if review.get("note") else ""
        fields.append(f"**Review so far:** {md(review.get('state'))}{by}{note}")
    out = [f"### {md(rid)} ({md(rec.get('status'))})", ""]
    out.extend(f"- [ ] {choice}" for choice in choices)
    out.append("")
    for item in fields:
        out += [item, ""]
    return out


def build_review_md(pkg, units, today):
    ctx = pkg.ctx
    status_of = {fid: f.get("status") for fid, f in pkg.facts_by_id.items()}
    reasons = {}
    for f in pkg.facts:
        if f.get("status") != "verified":
            reasons[f.get("id")] = compute_status.derive_fact(f, ctx).reasons
    for m in pkg.media:
        if m.get("status") != "verified":
            reasons[m.get("id")] = compute_status.derive_media(m, ctx, status_of).reasons

    def by_status(rows, status):
        return [r for r in rows if r.get("status") == status]

    def state(r):
        return _dict(r.get("review")).get("state")

    facts, media = pkg.facts, pkg.media
    fixes = ["edit, new wording: ", "reject", "note (for example a better source): "]
    decide = ["approve", "edit, new wording: ", "reject", "note: "]
    mode = "preview" if pkg.preview else "final"
    counts = ", ".join(f"{k} {v}" for k, v in sorted(Counter(str(f.get('status')) for f in facts).items()))
    mcounts = ", ".join(f"{k} {v}" for k, v in sorted(Counter(str(m.get('status')) for m in media).items()))
    out = [f"# Review checklist: {md(pkg.name)} ({md(pkg.slug)})", "",
           f"Generated {today} by tools/export.py ({mode} export).", ""]
    if pkg.preview:
        out += [f"This is a preview. Every block of wordpress.html is stamped \"{STAMP}\"; do not publish it.", ""]
    else:
        out += ["wordpress.html holds only verified facts and media that a reviewer approved, and the draft "
                "content built only from them. Withheld draft content is listed below.", ""]
    out += [f"Facts: {counts or 'none'}. Media: {mcounts or 'none'}.", "",
            "How to use this checklist: for each item, open the source link and find the quote, then tick one "
            "box (for an edit, write the new wording). Return the file to the maintainer, who records the "
            "decisions in review/decisions.jsonl and runs tools/apply_review.py. Approval does not override the "
            "checks: only verified items can be approved and published. Disputed, conflicting and single-source "
            "items can be edited (then checked again), rejected, or given a note.", ""]

    sections = [
        ("Disputed: the independent checker did not agree", by_status(facts, "disputed"), "fact", fixes),
        ("Conflicting: sources disagree", by_status(facts, "conflicting"), "fact", fixes),
        ("Single-source: needs a second independent source", by_status(facts, "single-source"), "fact", fixes),
        ("Verified, awaiting your decision", [f for f in by_status(facts, "verified")
                                              if state(f) not in PUBLISHABLE_REVIEW], "fact", decide),
        ("Pending: not checked yet, or a check failed", by_status(facts, "pending"), "fact", fixes),
    ]
    n = 0
    for title, rows, kind, choices in sections:
        n += 1
        out += [f"## {n}. {title} ({len(rows)})", ""]
        if not rows:
            out += ["None.", ""]
        for rec in rows:
            out += _item_lines(pkg, rec, kind, reasons.get(rec.get("id"), []), choices)

    n += 1
    decided = [f for f in by_status(facts, "verified") if state(f) in PUBLISHABLE_REVIEW]
    out += [f"## {n}. Verified and already approved or edited ({len(decided)})", ""]
    out += [f"- {md(f.get('id'))} ({md(state(f))} by {md(reviewer_role(_dict(f.get('review')).get('reviewer')))}): "
            f"{md(f.get('claim'))}" for f in decided] or ["None."]
    out.append("")

    n += 1
    open_media = [m for m in media if m.get("status") != "rejected"]
    out += [f"## {n}. Media ({len(open_media)})", ""]
    if not open_media:
        out += ["None.", ""]
    for m in open_media:
        # Media cannot be edited with apply_review; only verified media can be approved.
        awaiting = m.get("status") == "verified" and state(m) not in PUBLISHABLE_REVIEW
        choices = ["approve", "reject", "note: "] if awaiting else ["reject", "note: "]
        out += _item_lines(pkg, m, "media", reasons.get(m.get("id"), []), choices)

    n += 1
    out += [f"## {n}. Draft content ({len(units)} units)", "",
            "Each line is one unit of drafts/profile.json or of the experience chapters (content:...) and the facts it cites. Included units are in "
            "wordpress.html; withheld ones are not, for the reason given. The final export also needs, for each "
            "sentence, title and caption, a current \"supported\" verdict from the sentence adversary "
            "(drafts/grounding.jsonl, G6).", ""]
    for unit in units:
        mark = "included" if unit.included else f"withheld: {unit.reason}"
        cited = ", ".join(md(f) for f in unit.fact_ids) or "none"
        out.append(f"- [ ] {md(unit.location)}: {md(unit.text)} (facts {cited}; {md(mark)})")
    if not units:
        out.append("No draft yet.")
    out.append("")

    n += 1
    lines = _list((pkg.profile or {}).get("avatar_lines"))
    out += [f"## {n}. Avatar lines ({len(lines)})", "",
            "Quote lines are the inductee's exact words. Narration in the inductee's voice is shown on the site "
            "labelled \"AI recreation\".", ""]
    for i, line in enumerate(lines):
        line = _dict(line)
        label = "quote" if line.get("kind") == "quote" else (
            "AI recreation" if line.get("speaker") == "inductee" else "narration")
        out.append(f"- [ ] profile:avatar_lines:{i} ({md(line.get('speaker'))}, {label}): {md(line.get('text'))} "
                   f"(facts {', '.join(md(f) for f in _ids(line.get('fact_ids'))) or 'none'})")
    if not lines:
        out.append("None.")
    out.append("")

    n += 1
    out += [f"## {n}. How to cite", "",
            "Generated from inductee.json for the page; it states no fact about the inductee. A how_to_cite text "
            "in drafts/profile.json is not published.", "", md(how_to_cite(pkg)), ""]

    n += 1
    gaps = _list((pkg.profile or {}).get("gaps"))
    out += [f"## {n}. Gaps ({len(gaps)})", "",
            "Parts of the life story with no verified source yet. These are not errors.", ""]
    out += [f"- {md(g)}" for g in gaps] or ["None recorded."]
    out.append("")

    n += 1
    rejected = by_status(facts, "rejected") + by_status(media, "rejected")
    out += [f"## {n}. Rejected ({len(rejected)})", "", "Kept in the log for the record; no action needed.", ""]
    out += [f"- {md(r.get('id'))}: {md(r.get('claim') or r.get('title'))}" for r in rejected] or ["None."]
    out.append("")
    return "\n".join(out)


# --- running ----------------------------------------------------------------------------------------------------

def export_package(pkg, today):
    """{file name: text} for one inductee's export folder."""
    page, units = build_wordpress(pkg, today)
    files = {"wordpress.html": page}
    for name, (columns, rows) in csv_rows(pkg).items():
        files[name] = to_csv(columns, rows)
    files["provenance.jsonld"] = jsonld_text(jsonld_graph(pkg))
    files["REVIEW.md"] = build_review_md(pkg, units, today)
    return files, units


def write_files(folder, files):
    folder.mkdir(parents=True, exist_ok=True)
    for name, text in files.items():
        textfiles.write_text(folder / name, text, encoding="utf-8-sig" if name.endswith(".csv") else "utf-8")


def main(argv=None):
    parser = argparse.ArgumentParser(description="Export review or publishing packages (SPEC section 6).")
    parser.add_argument("slug", nargs="?", help="inductee slug")
    parser.add_argument("--all", action="store_true", help="every inductee, plus aggregates in data/export/")
    parser.add_argument("--preview", action="store_true", help="review package: unreviewed verified items, "
                                                               "every block stamped as a draft")
    parser.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    parser.add_argument("--content-dir", help="experience content folder (default: repo content/)")
    args = parser.parse_args(argv)
    if bool(args.slug) == bool(args.all):
        parser.print_usage(sys.stderr)
        print("export: give one slug or --all", file=sys.stderr)
        return 2
    if args.all:
        slugs = paths.list_slugs(args.data_dir)
        if not slugs:
            print(f"No inductees under {paths.data_dir(args.data_dir) / 'inductees'}")
            return 0
    else:
        slugs = [args.slug]

    inductees = []
    for slug in slugs:
        try:
            p = paths.inductee_paths(slug, args.data_dir)
        except ValueError as exc:
            print(f"export: {exc}", file=sys.stderr)
            return 2
        if not p.exists():
            print(f"export: no inductee '{slug}' ({p.inductee_json} not found)", file=sys.stderr)
            return 2
        inductees.append(p)

    failed = []
    for p in inductees:
        report = validate.validate_inductee(p, args.content_dir)
        if report.errors:
            validate.print_report(report, quiet=True)
            failed.append(p.slug)
    if failed:
        print(f"Export refused: tools/validate.py reports errors for {', '.join(failed)}; fix them first. "
              f"Nothing was written.")
        return 1

    today = datetime.date.today().isoformat()
    mode = "preview" if args.preview else "final"
    packages = []
    for p in inductees:
        try:
            pkg = load_package(p, args.preview, args.content_dir)
        except records.RecordError as exc:
            print(f"export: {p.slug}: {exc}", file=sys.stderr)
            return 1
        files, units = export_package(pkg, today)
        write_files(p.export, files)
        packages.append(pkg)
        included = sum(u.included for u in units)
        print(f"{p.slug}: {mode} export written to {p.export}: {included} of {len(units)} draft units included, "
              f"{len(pkg.exported_facts())} facts, {len(pkg.exported_media())} media, "
              f"{len(pkg.exported_sources())} sources, {len(pkg.searches)} searches")

    if args.all:
        agg = paths.aggregate_export_dir(args.data_dir)
        files = {}
        for name in ("facts.csv", "sources.csv", "media.csv", "searches.csv"):
            columns, rows = None, []
            for pkg in packages:
                columns, part = csv_rows(pkg)[name]
                rows.extend(part)
            files[name] = to_csv(columns, rows)
        graph = []
        for pkg in packages:
            graph.extend(jsonld_graph(pkg))
        files["provenance.jsonld"] = jsonld_text(graph)
        write_files(agg, files)
        print(f"aggregate {mode} export of {len(packages)} inductee(s) written to {agg}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
