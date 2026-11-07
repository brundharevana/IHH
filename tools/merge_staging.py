"""Merge staged candidate records into an inductee's main files (SPEC sections 2, 3, 6, 9).

    python3 tools/merge_staging.py <slug> [--run-id RUN] [--dry-run] [--data-dir DIR]

Candidate format
----------------
Search agents write one JSON object per line to the top level of
<inductee>/staging/: sources, facts and media in staging/<family>.jsonl, searches
in staging/<family>.searches.jsonl. Each candidate has a temporary id (see
ihh/staging.py): tmp-<family>-S-<n> for a source, -F- for a fact, -M- for
media, -Q- for a search. Searches in a *.searches.jsonl file may omit the id.
Otherwise a candidate has the fields of SPEC section 3, with these rules:

  - A fact's evidence source_id, a media item's source_ids and
    reconstruction_basis, and a search's produced list may name temporary ids
    (from any staging file in the same merge) or permanent ids already in the
    main files. Temporary ids in a media alt_text and in notes are rewritten too.
  - A staged source is snapshotted with tools/fetch_snapshot.py <slug> <temp id>;
    its snapshot is then staging/snapshots/<temp id>.txt. The snapshot's sha256
    must match the record and the meta file.
  - primary_document is derived: the merge sets it to true exactly when an
    evidence item cites a source of type primary (gates.primary_document), whatever
    was staged, and notes any staged value it changed.
  - Every record the merge would write must pass the record schema (ihh/schema.py,
    the one validate.py uses): a search's results is an integer count or null, never
    text (commentary goes in notes), dates are YYYY-MM-DD, and so on.
  - Derived fields are not staged: status must be absent, "pending", or
    "conflicting" (the merge step may set conflicting, with each source's version
    in notes); adversary and verified_claim_sha256 must be null; review, if
    present, must be pending. used_in is reset to [].

What the merge does
-------------------
  1. Reads every *.jsonl file directly inside staging/. Subfolders are never
     read. A file with no temporary ids (and no id-less searches in a
     *.searches.jsonl file) is not a candidate file: it is ignored and left in
     place (audit copies, verdict logs). A candidate file may hold only
     candidates.
  2. Checks everything first. Any problem (unreadable line, a temporary id used
     twice, a reference to an unknown id, a staged derived field, a snapshot that
     does not match, a record that would break the schema) refuses the whole merge:
     nothing is written, and each problem names the temporary id, staging file and
     record number to fix.
  3. Assigns permanent ids (<CODE>-S/F/M/Q-NNNN, one past the highest ever used,
     never reusing a number) in file-name order, and rewrites every reference.
  4. Refuses a fact whose normalized claim (ihh.normalize.normalize_text) equals
     an existing fact's claim, whatever that fact's status, or an earlier
     candidate's; references to it are pointed at the fact already kept.
     Semantic duplicates are the merge agent's job before this runs. A staged
     source with the same url and snapshot sha256 as an existing one reuses that
     source's id; media with an existing media url are skipped the same way. A
     search with the key of a logged search (date, family, tool, query, agent,
     run_id) is that search tried again: its try is folded into the logged row
     (notes added unless already there, produced joined, a known result count
     kept), and two staged rows with one key become one row. Re-running after an
     interruption therefore adds nothing twice.
  5. Appends the new records to sources.jsonl, facts.jsonl, media.jsonl and
     searches.jsonl (rewriting a logged search a repeated try was folded into),
     moves staged snapshots to snapshots/<permanent id>.txt and
     .meta.json, and records the run in inductee.json (runs[].notes).
  6. Moves each merged staging file, and the staged snapshot files, into
     staging/merged/<run id>/. Merged files therefore never stay at the top of
     staging/: any *.jsonl left there is either unmerged or ignored, and
     --dry-run says which.

The run id is --run-id, else the most common extractor.run_id / search run_id
among the candidates, else <slug>-<today>.

Exit codes: 0 merged (or nothing to merge), 1 refused (nothing written), 2 usage
error or unknown slug.
"""

import argparse
import copy
import datetime
import os
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

from ihh import authority, fetchplan, gates, ids, paths, records, rights, schema, staging, textfiles
from ihh.normalize import normalize_text

ALLOWED_STATUS = (None, "pending", "conflicting")


@dataclass
class Candidate:
    kind: str           # source, fact, media, search
    temp: str | None    # temporary id (None for an id-less search)
    record: dict
    file: Path
    position: int       # 1-based record number within the file


@dataclass
class Plan:
    slug: str
    run_id: str = ""
    other_run_ids: list = field(default_factory=list)
    files: list = field(default_factory=list)       # candidate files, merged and moved
    ignored: list = field(default_factory=list)     # (file, reason)
    errors: list = field(default_factory=list)
    mapping: dict = field(default_factory=dict)     # temporary id -> permanent id
    sources: list = field(default_factory=list)     # new records, final form
    facts: list = field(default_factory=list)
    media: list = field(default_factory=list)
    searches: list = field(default_factory=list)
    folded: dict = field(default_factory=dict)      # logged search id -> its row with a repeated try folded in
    refused: list = field(default_factory=list)     # messages
    reused: list = field(default_factory=list)      # messages
    notes: list = field(default_factory=list)       # warnings and dropped references
    copies: list = field(default_factory=list)      # (staged path, main path) snapshot files
    staged_snapshots: list = field(default_factory=list)  # staged snapshot files to archive
    existing: dict = field(default_factory=dict)    # name -> rows already on file
    origin: dict = field(default_factory=dict)      # new permanent id -> where it was staged
    inductee: dict = field(default_factory=dict)
    dest: Path | None = None                        # where the staging files were moved

    @property
    def empty(self):
        return not self.files


def _text(value):
    return isinstance(value, str) and bool(value.strip())


def _str(value):
    """The value if it is a string, else None (malformed values never become lookup keys)."""
    return value if isinstance(value, str) else None


def _allocator(code, kind, rows):
    taken = [r.get("id") for r in rows]

    def take():
        new = ids.next_id(code, kind, taken)
        taken.append(new)
        return new
    return take


def _default_review():
    return {"state": "pending", "reviewer": None, "date": None, "note": ""}


def _rewrite_text(text, mapping):
    if not isinstance(text, str):
        return text
    return staging.TEMP_ID_IN_TEXT.sub(lambda m: mapping.get(m.group(0), m.group(0)), text)


def _collect(p, plan):
    """Candidates from the top-level staging files, plus ignored files and read errors."""
    cands = []
    for path in staging.staging_files(p):
        rows, problems = records.read_jsonl_lenient(path)
        searches_file = path.name.endswith(staging.SEARCHES_SUFFIX)
        found, others = [], []
        for n, row in enumerate(rows, 1):
            rid = row.get("id")
            if staging.is_temp_id(rid):
                found.append(Candidate(staging.temp_kind(rid), rid, row, path, n))
            elif staging.looks_temporary(rid):
                plan.errors.append(f"{path.name}: record {n}: {rid!r} is not a valid temporary id; use "
                                   f"tmp-<family>-<S|F|M|Q>-<n>, for example tmp-loc-S-1")
            elif searches_file and rid is None:
                found.append(Candidate("search", None, row, path, n))
            else:
                others.append((n, rid))
        if problems:
            plan.errors.extend(problems)
        if not found:
            if not problems:
                plan.ignored.append((path, "no records with temporary ids"))
            continue
        for n, rid in others:
            plan.errors.append(f"{path.name}: record {n}: id {rid!r} is not a temporary id; a candidate "
                               f"file may hold only staged records (tmp-<family>-<S|F|M|Q>-<n>)")
        plan.files.append(path)
        cands.extend(found)
    return cands


def _check_derived(c, slug, plan):
    rec, tid = c.record, c.temp
    if rec.get("status") not in ALLOWED_STATUS:
        plan.errors.append(f"{tid}: status {rec.get('status')!r} cannot be staged; tools/compute_status.py "
                           f"derives it (only pending or conflicting may be staged)")
    if rec.get("adversary") is not None:
        plan.errors.append(f"{tid}: adversary must be null in staging; tools/adversary.py writes verdicts "
                           f"after the merge")
    if rec.get("verified_claim_sha256") not in (None, ""):
        plan.errors.append(f"{tid}: verified_claim_sha256 must be null in staging")
    review = rec.get("review")
    if review is not None and not (isinstance(review, dict) and review.get("state") in (None, "pending")):
        plan.errors.append(f"{tid}: review must be absent or pending in staging (got {review!r})")
    if c.kind == "fact" and rec.get("inductee") not in (None, slug):
        plan.errors.append(f"{tid}: inductee {rec.get('inductee')!r} does not match {slug!r}")


def _check_source(p, c, plan, registry):
    rec, tid = c.record, c.temp
    if not _text(rec.get("url")):
        plan.errors.append(f"{tid}: a staged source needs a url")
    # Authority (G9): a blank institution is filled from the registry entry the url
    # resolves to; a type or institution the registry does not allow is refused.
    entry = registry.resolve(rec.get("url"))
    if entry is not None and not _text(rec.get("institution")):
        rec["institution"] = entry.name
    for problem in authority.source_problems(rec, registry):
        plan.errors.append(f"{tid}: {problem}")
    # Snapshot provenance: fetch_url names the cited record itself (checked with or without a snapshot).
    problem = fetchplan.fetch_url_problem(rec)
    if problem:
        plan.errors.append(f"{tid}: {problem}")
    rel = rec.get("snapshot")
    if rel in (None, ""):
        return
    expected = staging.snapshot_rel(tid)
    if rel != expected:
        plan.errors.append(f"{tid}: snapshot must be {expected} (written by tools/fetch_snapshot.py), "
                           f"not {rel!r}")
        return
    snap = records.load_snapshot(p.root, rec)
    for failure in gates.snapshot_failures(rec, snap):
        plan.errors.append(f"{tid}: staged {failure.removeprefix(f'{tid}: ').removeprefix(f'{tid} ')}")
    if not rec.get("fetch_method"):
        plan.errors.append(f"{tid}: snapshot is set but fetch_method is not")


def _resolve(ref, plan, temp_index, permanent_ids, want, owner, label):
    """Permanent id for a reference, or None after recording an error."""
    if staging.is_temp_id(ref):
        if staging.temp_kind(ref) not in want or ref not in temp_index:
            plan.errors.append(f"{owner}: {label} names unknown temporary {'/'.join(want)} {ref}")
            return None
        return plan.mapping.get(ref)
    if any(ids.is_id(ref, kind=k) for k in want):
        if ref not in permanent_ids:
            plan.errors.append(f"{owner}: {label} names unknown {'/'.join(want)} {ref}")
            return None
        return ref
    plan.errors.append(f"{owner}: {label} {ref!r} is not a {'/'.join(want)} id")
    return None


def _where(c):
    """A staged candidate, as the merge names it in messages."""
    return f"{c.temp or 'search'} in {c.file.name} record {c.position}"


def json_value(value):
    return "null" if value is None else str(value).lower() if isinstance(value, bool) else repr(value)


def plan_merge(p, run_id=None, today=None):
    """Everything the merge would do, computed without writing. Check plan.errors first."""
    today = today or datetime.date.today().isoformat()
    plan = Plan(slug=p.slug)
    try:
        inductee = records.read_json(p.inductee_json, default=None)
    except records.RecordError as exc:
        plan.errors.append(str(exc))
        return plan
    if not isinstance(inductee, dict) or not re.fullmatch(r"[A-Z]{3}", str(inductee.get("code") or "")):
        plan.errors.append("inductee.json is missing or has no valid 3-letter code")
        return plan
    plan.inductee = inductee
    code = inductee["code"]
    for name, path in (("sources", p.sources), ("facts", p.facts), ("media", p.media),
                       ("searches", p.searches)):
        try:
            plan.existing[name] = records.read_jsonl(path)
        except records.RecordError as exc:
            plan.errors.append(f"{path.name}: {exc}")
            plan.existing[name] = []

    cands = _collect(p, plan)
    if not cands:
        return plan

    temp_index = {}
    for c in cands:
        if c.temp is None:
            continue
        if c.temp in temp_index:
            first = temp_index[c.temp]
            plan.errors.append(f"temporary id {c.temp} is used twice ({first.file.name} record "
                               f"{first.position} and {c.file.name} record {c.position})")
        else:
            temp_index[c.temp] = c
    by_kind = {k: [c for c in cands if c.kind == k] for k in ("source", "fact", "media", "search")}

    for c in by_kind["fact"] + by_kind["media"]:
        _check_derived(c, p.slug, plan)
    try:
        registry = authority.load(p.registry)
    except authority.RegistryError as exc:
        plan.errors.append(f"authority registry: {exc}")
        registry = authority.Registry.empty(source=str(p.registry), missing=False)
    for c in by_kind["source"]:
        _check_source(p, c, plan, registry)
    for c in by_kind["fact"]:
        if not _text(c.record.get("claim")):
            plan.errors.append(f"{c.temp}: a staged fact needs a claim")
        if not isinstance(c.record.get("evidence"), list):
            plan.errors.append(f"{c.temp}: evidence must be a list")
    for c in by_kind["media"]:
        if not _text(c.record.get("url")):
            plan.errors.append(f"{c.temp}: a staged media item needs a url")

    existing = plan.existing
    source_ids = {_str(r.get("id")) for r in existing["sources"]} - {None}
    fact_ids = {_str(r.get("id")) for r in existing["facts"]} - {None}

    # Run id.
    found_runs = Counter()
    for c in by_kind["fact"]:
        extractor = c.record.get("extractor")
        if isinstance(extractor, dict) and _text(extractor.get("run_id")):
            found_runs[extractor["run_id"]] += 1
    for c in by_kind["search"]:
        if _text(c.record.get("run_id")):
            found_runs[c.record["run_id"]] += 1
    common = [r for r, _ in found_runs.most_common()]
    plan.run_id = run_id or (common[0] if common else f"{p.slug}-{today}")
    plan.other_run_ids = [r for r in common if r != plan.run_id]

    # Sources.
    staged_texts = {}  # new source id -> its staged snapshot text (checked by _check_source)
    take_source = _allocator(code, "source", existing["sources"])
    known = {(_str(s.get("url")), _str(s.get("snapshot_sha256"))): s.get("id") for s in existing["sources"]
             if _str(s.get("snapshot_sha256"))}
    urls = {_str(s.get("url")): s.get("id") for s in existing["sources"] if _str(s.get("url"))}
    for c in by_kind["source"]:
        rec = c.record
        url, sha = _str(rec.get("url")), _str(rec.get("snapshot_sha256"))
        key = (url, sha)
        if sha and key in known:
            plan.mapping[c.temp] = known[key]
            plan.reused.append(f"{c.temp} -> {known[key]} (same url and snapshot as the source on file)")
            if rec.get("snapshot"):
                plan.staged_snapshots.append(c.temp)
            continue
        new_id = take_source()
        plan.mapping[c.temp] = new_id
        if url in urls:
            plan.notes.append(f"{c.temp} -> {new_id}: same url as {urls[url]} but a different "
                              f"snapshot; kept as a separate source")
        out = copy.deepcopy(rec)
        out["id"] = new_id
        plan.origin[new_id] = _where(c)
        if rec.get("snapshot"):
            out["snapshot"] = f"snapshots/{new_id}.txt"
            staged_snap = records.load_snapshot(p.root, rec)
            if staged_snap is not None and not gates.snapshot_failures(rec, staged_snap):
                staged_texts[new_id] = staged_snap.text
            plan.copies.append((staging.snapshot_text_path(p, c.temp), p.snapshot_text(new_id)))
            plan.copies.append((staging.snapshot_meta_path(p, c.temp), p.snapshot_meta(new_id)))
            plan.staged_snapshots.append(c.temp)
        out["notes"] = _rewrite_text(out.get("notes"), plan.mapping)
        plan.sources.append(records.order_keys(out, "source"))
        if sha:
            known[key] = new_id
        if url:
            urls.setdefault(url, new_id)
    all_source_ids = source_ids | {s["id"] for s in plan.sources}
    # derived_from (G5 independence): a staged temporary or permanent source id, rewritten to
    # the permanent id like an evidence source_id.
    temp_of = {v: k for k, v in plan.mapping.items() if staging.is_temp_id(k)}
    for out in plan.sources:
        origin = out.get("derived_from")
        if origin in (None, ""):
            continue
        owner = temp_of.get(out["id"], out["id"])
        if not isinstance(origin, str):
            plan.errors.append(f"{owner}: derived_from must be a source id (got {origin!r})")
            continue
        resolved = _resolve(origin, plan, temp_index, all_source_ids, ("source",), owner, "derived_from")
        if resolved is not None:
            out["derived_from"] = resolved

    # Facts.
    take_fact = _allocator(code, "fact", existing["facts"])
    claims = {}
    for f in existing["facts"]:
        if isinstance(f.get("claim"), str):
            claims.setdefault(normalize_text(f["claim"]), (f.get("id"), f.get("status")))
    pending_facts = []
    for c in by_kind["fact"]:
        claim = c.record.get("claim")
        norm = normalize_text(claim) if isinstance(claim, str) else ""
        if norm and norm in claims:
            fid, status = claims[norm]
            plan.mapping[c.temp] = fid
            plan.refused.append(f"{c.temp}: same claim as {fid} ({status}): {claim!r}")
            continue
        new_id = take_fact()
        plan.mapping[c.temp] = new_id
        if norm:
            claims[norm] = (new_id, "new in this merge")
        pending_facts.append((c, new_id))
    sources_by_id = gates.by_id(existing["sources"] + plan.sources)
    for c, new_id in pending_facts:
        out = copy.deepcopy(c.record)
        out["id"] = new_id
        plan.origin[new_id] = _where(c)
        records.set_field(out, "fact", "inductee", p.slug)
        evidence = []
        for i, item in enumerate(out.get("evidence") if isinstance(out.get("evidence"), list) else [], 1):
            if not isinstance(item, dict):
                plan.errors.append(f"{c.temp}: evidence {i} is not an object")
                continue
            sid = _resolve(item.get("source_id"), plan, temp_index, all_source_ids, ("source",), c.temp,
                           f"evidence {i} source_id")
            item = dict(item)
            if sid is not None:
                item["source_id"] = sid
            evidence.append(item)
        out["evidence"] = evidence
        # primary_document is derived from the cited sources' types, never taken from the candidate.
        derived = gates.primary_document(out, sources_by_id)
        if out.get("primary_document") is not derived:
            if "primary_document" in c.record:
                plan.notes.append(f"{c.temp} -> {new_id}: primary_document set to {str(derived).lower()} (staged "
                                  f"{json_value(c.record.get('primary_document'))}): it is true exactly when an "
                                  f"evidence item cites a source of type primary")
            records.set_field(out, "fact", "primary_document", derived)
        records.set_field(out, "fact", "adversary", None)
        records.set_field(out, "fact", "status", "conflicting" if c.record.get("status") == "conflicting"
                          else "pending")
        records.set_field(out, "fact", "verified_claim_sha256", None)
        records.set_field(out, "fact", "used_in", [])
        if not isinstance(out.get("review"), dict):
            records.set_field(out, "fact", "review", _default_review())
        if out.get("notes") is None:
            records.set_field(out, "fact", "notes", "")
        out["notes"] = _rewrite_text(out.get("notes"), plan.mapping)
        plan.facts.append(records.order_keys(out, "fact"))
    all_fact_ids = fact_ids | {f["id"] for f in plan.facts}

    # Media.
    take_media = _allocator(code, "media", existing["media"])
    media_urls = {_str(m.get("url")): m.get("id") for m in existing["media"] if _str(m.get("url"))}
    pending_media = []
    for c in by_kind["media"]:
        url = _str(c.record.get("url"))
        if url and url in media_urls:
            plan.mapping[c.temp] = media_urls[url]
            plan.refused.append(f"{c.temp}: same url as media {media_urls[url]}: {url}")
            continue
        new_id = take_media()
        plan.mapping[c.temp] = new_id
        if url:
            media_urls[url] = new_id
        pending_media.append((c, new_id))
    for c, new_id in pending_media:
        out = copy.deepcopy(c.record)
        out["id"] = new_id
        plan.origin[new_id] = _where(c)
        sids = []
        for sid in out.get("source_ids") if isinstance(out.get("source_ids"), list) else []:
            resolved = _resolve(sid, plan, temp_index, all_source_ids, ("source",), c.temp, "source_ids")
            if resolved is not None and resolved not in sids:
                sids.append(resolved)
        out["source_ids"] = sids
        if isinstance(out.get("reconstruction_basis"), list):
            basis = []
            for rid in out["reconstruction_basis"]:
                resolved = _resolve(rid, plan, temp_index, all_fact_ids | all_source_ids, ("fact", "source"),
                                    c.temp, "reconstruction_basis")
                if resolved is not None:
                    basis.append(resolved)
            out["reconstruction_basis"] = basis
        if isinstance(out.get("basis_for"), list):
            # A basis photo's stop facts (2026-10-16) may be facts staged in the same run.
            linked = []
            for rid in out["basis_for"]:
                resolved = _resolve(rid, plan, temp_index, all_fact_ids, ("fact",), c.temp, "basis_for")
                if resolved is not None:
                    linked.append(resolved)
            out["basis_for"] = linked
        for tid in staging.TEMP_ID_IN_TEXT.findall(str(out.get("alt_text") or "")):
            if tid not in plan.mapping:
                plan.errors.append(f"{c.temp}: alt_text names unknown temporary id {tid}")
        out["alt_text"] = _rewrite_text(out.get("alt_text"), plan.mapping)
        _apply_rights_rule(p, plan, c, out, sources_by_id, staged_texts, registry, today)
        records.set_field(out, "media", "adversary", None)
        records.set_field(out, "media", "status", "conflicting" if c.record.get("status") == "conflicting"
                          else "pending")
        records.set_field(out, "media", "verified_claim_sha256", None)
        if not isinstance(out.get("review"), dict):
            records.set_field(out, "media", "review", _default_review())
        if out.get("notes") is None:
            records.set_field(out, "media", "notes", "")
        out["notes"] = _rewrite_text(out.get("notes"), plan.mapping)
        plan.media.append(records.order_keys(out, "media"))

    # Searches. A search with the key of one already logged or staged earlier in this merge (date, family,
    # tool, query, agent, run id) is the same search tried again: its try is folded into that row (notes
    # added, produced joined, a known result count kept), never refused, so its notes and links survive.
    take_search = _allocator(code, "search", existing["searches"])

    def search_key(s):
        return tuple(str(s.get(k)) for k in SEARCH_KEY)
    logged = {search_key(s): s for s in existing["searches"]}
    for c in by_kind["search"]:
        label = c.temp or f"{c.file.name} record {c.position}"
        key = search_key(c.record)
        out = copy.deepcopy(c.record)
        produced, dropped = [], []
        raw = out.get("produced") if isinstance(out.get("produced"), list) else []
        for rid in raw:
            if staging.is_temp_id(rid):
                if rid in plan.mapping:
                    rid = plan.mapping[rid]
                else:
                    dropped.append(rid)
                    continue
            if rid not in produced:
                produced.append(rid)
        notes = _rewrite_text(out.get("notes"), plan.mapping) if out.get("notes") is not None else ""
        if dropped:
            note = f"produced {', '.join(dropped)} not merged (removed before the merge)"
            notes = f"{notes}; {note}" if notes else note
            plan.notes.append(f"{label}: {note}")
        if key in logged:
            row = logged[key]
            if c.temp:
                plan.mapping[c.temp] = row.get("id")
            folded = fold_search(row, notes, produced, out.get("results"))
            if folded == row:
                plan.reused.append(f"{label}: same search as {row.get('id')}, nothing new (already logged)")
                continue
            if any(row is s for s in plan.searches):  # staged earlier in this merge: that new row takes the try
                row.clear()
                row.update(folded)
                plan.notes.append(f"{label}: a repeat of this merge's {row.get('id')}; its try is folded into that row")
            else:  # already on file: the logged row is rewritten with the try folded in (plan.folded)
                logged[key] = plan.folded[row["id"]] = folded
                plan.origin.setdefault(row["id"], _where(c))
                plan.notes.append(f"{label}: a repeat of logged search {row.get('id')}; its try is folded into that row")
            continue
        new_id = take_search()
        if c.temp:
            plan.mapping[c.temp] = new_id
        out["id"] = new_id
        plan.origin[new_id] = _where(c)
        out["produced"] = produced
        out["notes"] = notes
        rec = records.order_keys(out, "search")
        logged[key] = rec
        plan.searches.append(rec)
    _check_schema(p, plan, sources_by_id)
    return plan


SEARCH_KEY = ("date", "family", "tool", "query", "agent", "run_id")
FOLD_SEP = "; then: "


def fold_search(row, notes, produced, results):
    """A copy of the search row with one more try of it folded in: the try's notes are added unless the
    row already holds them (a re-run merge) and replace them when they extend them (a staged row that
    already folded the logged try), produced ids are joined in order, and a known result count wins."""
    out = copy.deepcopy(row)
    old = out.get("notes") or ""
    if notes and notes not in old:
        out["notes"] = notes if old and notes.startswith(old) else (f"{old}{FOLD_SEP}{notes}" if old else notes)
    prev = out.get("produced") if isinstance(out.get("produced"), list) else []
    out["produced"] = list(dict.fromkeys(prev + produced))
    if results is not None:
        out["results"] = results
    return out


def _apply_rights_rule(p, plan, c, out, sources_by_id, staged_texts, registry, today):
    """The approved LoC / NARA rights rule (ihh/rights.py) on a staged media item: a missing
    rights_statement is copied verbatim from the holder's snapshot and license_class follows the
    rule; an item the rule bars but that is staged as usable refuses the merge."""
    def text_of(sid):
        if sid in staged_texts:
            return staged_texts[sid]
        src = sources_by_id.get(sid)
        snap = records.load_snapshot(p.root, src) if isinstance(src, dict) else None
        return snap.text if snap is not None and not gates.snapshot_failures(src, snap) else None

    holders = rights.holders_of(out, sources_by_id, text_of, registry)
    # Private writings (2026-10-20): a death or publication basis names a fact already on file (a
    # staged fact is not verified yet) or a source with its snapshot.
    on_file = gates.by_id(plan.existing.get("facts") or [])
    lookup = gates.make_private_lookup(on_file, {k: v.get("status") for k, v in on_file.items()},
                                       lambda sid: gates.quotable_text(sources_by_id.get(sid), text_of(sid))
                                       if text_of(sid) is not None else None, sources_by_id, registry)
    changes, problems = rights.derive(out, holders, lookup)
    for problem in problems:
        plan.errors.append(f"{c.temp}: {problem}; fix it in staging and run merge_staging.py again")
    if not changes:
        return
    for key, value in changes.items():
        records.set_field(out, "media", key, value)
    r = rights.item_ruling(out, holders, lookup)
    note = rights.change_note(changes, r.value, today, r.basis, private=r.private)
    out["notes"] = f"{out['notes']}\n{note}" if out.get("notes") else note
    plan.notes.append(f"{c.temp} -> {out['id']}: {note}")


def _check_schema(p, plan, sources_by_id):
    """Every record the merge would write must pass the record schema (ihh.schema, the one
    validate.py and the write boundary in ihh.records use): a problem refuses the whole merge
    before anything is written, named by the staged candidate so it can be fixed in staging."""
    for kind, rows in (("source", plan.sources), ("fact", plan.facts), ("media", plan.media),
                       ("search", plan.searches + list(plan.folded.values()))):
        for rec in rows:
            rid = rec.get("id")
            errors, _ = schema.record_problems(kind, rec, slug=p.slug, sources_by_id=sources_by_id)
            for error in errors:
                problem = error.removeprefix(f"{rid}: ")
                plan.errors.append(f"{plan.origin.get(rid, rid)} (would be {rid}): {problem}; fix it in "
                                   f"staging and run merge_staging.py again")


def _summary_note(plan, today):
    files = ", ".join(f.name for f in plan.files)
    note = (f"merge_staging {today}: {len(plan.facts)} facts, {len(plan.sources)} sources, "
            f"{len(plan.media)} media, {len(plan.searches)} searches merged from {files}; "
            f"{len(plan.refused)} duplicates refused")
    if plan.folded:
        note += f"; a repeated try folded into logged searches {', '.join(sorted(plan.folded))}"
    if plan.other_run_ids:
        note += f"; candidates also carried run ids {', '.join(plan.other_run_ids)}"
    return note


def _folder_name(run_id):
    return re.sub(r"[^A-Za-z0-9._-]+", "-", run_id).strip(".-") or "run"


def _unique(path):
    if not path.exists():
        return path
    n = 1
    while True:
        candidate = path.with_name(f"{path.name}.{n}")
        if not candidate.exists():
            return candidate
        n += 1


def apply_merge(p, plan, today=None):
    """Write a checked plan. Returns the folder the staging files were moved to."""
    today = today or datetime.date.today().isoformat()
    for src, dst in plan.copies:
        textfiles.write_text(dst, src.read_bytes().decode("utf-8"))
    for name, path, new in (("sources", p.sources, plan.sources), ("facts", p.facts, plan.facts),
                            ("media", p.media, plan.media), ("searches", p.searches, plan.searches)):
        old = plan.existing[name]
        if name == "searches" and plan.folded:
            old = [plan.folded.get(r.get("id"), r) for r in old]
        if new or (name == "searches" and plan.folded):
            records.write_jsonl(path, old + new)

    inductee = plan.inductee
    runs = inductee.get("runs") if isinstance(inductee.get("runs"), list) else []
    note = _summary_note(plan, today)
    entry = next((r for r in runs if isinstance(r, dict) and r.get("run_id") == plan.run_id), None)
    if entry is None:
        runs.append({"run_id": plan.run_id, "date": today, "adversary": None, "notes": note})
    else:
        entry["notes"] = f"{entry['notes']}\n{note}" if entry.get("notes") else note
    records.set_field(inductee, "inductee", "runs", runs)
    records.write_json(p.inductee_json, inductee)

    dest = p.staging / "merged" / _folder_name(plan.run_id)
    dest.mkdir(parents=True, exist_ok=True)
    for path in plan.files:
        os.replace(path, _unique(dest / path.name))
    if plan.staged_snapshots:
        (dest / "snapshots").mkdir(exist_ok=True)
        for tid in plan.staged_snapshots:
            for src in (staging.snapshot_text_path(p, tid), staging.snapshot_meta_path(p, tid)):
                if src.exists():
                    os.replace(src, _unique(dest / "snapshots" / src.name))
    return dest


def print_plan(plan):
    for path, reason in plan.ignored:
        print(f"  ignored {path.name}: {reason}")
    if plan.empty:
        return
    print(f"  run {plan.run_id}; candidate files: {', '.join(f.name for f in plan.files)}")
    for tid, new_id in plan.mapping.items():
        print(f"  {tid} -> {new_id}")
    for message in plan.reused:
        print(f"  reused {message}")
    for message in plan.refused:
        print(f"  refused {message}")
    for message in plan.notes:
        print(f"  note {message}")


def merge(p, run_id=None, dry_run=False, today=None):
    """(exit code, plan). Holds the inductee and staging locks for the whole merge."""
    with records.locked(p.facts), records.locked(p.staging):
        plan = plan_merge(p, run_id, today)
        if plan.errors:
            return 1, plan
        if plan.empty or dry_run:
            return 0, plan
        plan.dest = apply_merge(p, plan, today)
        return 0, plan


def main(argv=None):
    parser = argparse.ArgumentParser(description="Merge staged candidates into the main files (SPEC section 6).")
    parser.add_argument("slug", help="inductee slug")
    parser.add_argument("--run-id", help="run id to record (default: from the candidates)")
    parser.add_argument("--dry-run", action="store_true", help="show what would be merged; write nothing")
    parser.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    args = parser.parse_args(argv)
    try:
        p = paths.inductee_paths(args.slug, args.data_dir)
    except ValueError as exc:
        print(f"merge_staging: {exc}", file=sys.stderr)
        return 2
    if not p.exists():
        print(f"merge_staging: no inductee '{args.slug}' ({p.inductee_json} not found)", file=sys.stderr)
        return 2
    p.staging.mkdir(exist_ok=True)

    code, plan = merge(p, args.run_id, args.dry_run)
    print(f"{args.slug}:")
    if code:
        print(f"merge_staging: refused, nothing written ({len(plan.errors)} problem(s)):", file=sys.stderr)
        for error in plan.errors:
            print(f"  {error}", file=sys.stderr)
        return code
    print_plan(plan)
    if plan.empty:
        print("Nothing to merge: no candidate files at the top of staging/.")
        return 0
    counts = (f"{len(plan.facts)} facts, {len(plan.sources)} sources, {len(plan.media)} media, "
              f"{len(plan.searches)} searches; {len(plan.refused)} refused as duplicates")
    if args.dry_run:
        print(f"Dry run, nothing written. Would merge {counts}.")
    else:
        rel = plan.dest.relative_to(p.root)
        print(f"Merged {counts}. Staging files moved to {rel}/. Next: python3 tools/validate.py {args.slug}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
