"""Derive the status of every fact and media item from recorded evidence (SPEC section 5).

Models never mark their own work verified; this tool does, from what is on
disk. Rules, in order (first match wins):

  1. `rejected` and `conflicting` set by a person or the merge step are kept.
  2. Extractor verdict `withdrawn` -> rejected.
  8. A claim edited after verification (G7) -> pending; verified_claim_sha256 is
     cleared, and so is the adversary verdict, because it judged the old claim.
     Clearing it keeps this rule in force on the next run until the adversary
     judges the edited claim (otherwise a re-run would re-verify on the stale
     verdict). The cleared verdict is summarized in `notes` for the audit trail.
  3. G1, G2, G9 or G11 fails -> pending.
  4. No adversary verdict -> pending. A verdict whose judged_sha256 is missing or
     no longer matches the record (ihh/judged.py: the claim, evidence, sources,
     snapshots, rights fields, alt text or reconstruction basis changed after
     it was given) counts as no verdict.
  5. Adversary verdict not `supported`, quote not confirmed in the snapshot,
     claim not entailed, adds information, not atomic, wrong source type, or
     G10 fails -> disputed.
  6. G5 fails -> single-source.
  7. Otherwise -> verified, with verified_claim_sha256 set if it was null.

verified_claim_sha256 is null for every status other than verified. A fact's primary_document is
derived too (gates.primary_document: true exactly when an evidence item cites a source of type
primary), so it follows a source's type when a person changes it; the adversary does not judge
that flag, so updating it never makes a verdict stale. Media items
follow the same rules with G1 checking the rights statement against a source
snapshot, G2 checking the title and alt text against the item's sources and
cited facts (gates.g2_media), no G5, and the edit lock covering the rights,
license, title and alt text fields (gates.media_lock_sha256). Facts are derived first so a reconstruction's basis
facts have their current status.

Writes only `status`, `verified_claim_sha256`, a fact's `primary_document` and, when the edit
lock fires, `adversary` and `notes`. Running it twice changes nothing the second time.

Usage: python3 tools/compute_status.py <slug> | --all [--data-dir DIR] [--verbose]
Exit codes: 0 done, 1 a record file could not be read, 2 usage error or unknown slug.
"""

import argparse
import copy
import datetime
import sys
from collections import Counter
from dataclasses import dataclass, field

from ihh import gates, judged, paths, records

KEPT = ("rejected", "conflicting")


@dataclass
class Derivation:
    status: str
    verified_claim_sha256: str | None
    reasons: list = field(default_factory=list)
    clear_adversary: bool = False


def _tag(gate, failures):
    return [f"{gate}: {x}" for x in failures]


def _withdrawn(record):
    extractor = record.get("extractor")
    return isinstance(extractor, dict) and extractor.get("verdict") == "withdrawn"


def _derive(record, kind, hard, ctx, corroboration):
    """Shared rule order; `hard` and `corroboration` are the kind-specific gate lists."""
    stored = record.get("status")
    if stored in KEPT:
        return Derivation(stored, None, [f"{stored} is kept (set by a person or the merge step)"])
    if _withdrawn(record):
        return Derivation("rejected", None, ["extractor withdrew the claim"])
    lock = gates.g7_edit_lock(record, kind=kind)
    if lock:
        return Derivation("pending", None, _tag("G7", lock),
                          clear_adversary=record.get("adversary") is not None)
    if hard:
        return Derivation("pending", None, hard)
    adversary = record.get("adversary")
    if not isinstance(adversary, dict) or not adversary:
        return Derivation("pending", None, ["no adversary verdict yet"])
    stale = judged.verdict_problem(record, kind, ctx.sources, ctx.facts)
    if stale:
        return Derivation("pending", None, [f"G4: {stale}"])
    soft = _tag("G4", gates.adversary_failures(adversary)) + \
        _tag("G10", gates.g10_snapshot_integrity(record, ctx))
    if soft:
        return Derivation("disputed", None, soft)
    if corroboration:
        return Derivation("single-source", None, corroboration)
    stored_hash = record.get("verified_claim_sha256")
    return Derivation("verified", stored_hash or gates.current_lock_sha256(record, kind))


def derive_fact(fact, ctx):
    """Status a fact should have, from its evidence, snapshots and verdicts."""
    hard = _tag("G1", gates.g1_evidence(fact, ctx)) + \
        _tag("G2", gates.g2_nothing_added(fact, ctx)) + \
        _tag("G9", gates.g9_banned_sources(fact, ctx)) + \
        _tag("G11", gates.g11_identity(fact, ctx))
    return _derive(fact, "fact", hard, ctx, _tag("G5", gates.g5_corroboration(fact, ctx)))


def derive_media(media, ctx, fact_status):
    """Status a media item should have; fact_status maps fact id to current status."""
    hard = _tag("G1", gates.g1_media(media, ctx, fact_status)) + \
        _tag("G2", gates.g2_media(media, ctx)) + \
        _tag("G9", gates.g9_banned_sources(media, ctx))
    return _derive(media, "media", hard, ctx, [])


def _apply(record, d, kind, today, ctx=None):
    rec = copy.deepcopy(record)
    if kind == "fact" and ctx is not None and isinstance(rec.get("primary_document"), bool):
        records.set_field(rec, kind, "primary_document", gates.primary_document(rec, ctx.sources))
    records.set_field(rec, kind, "status", d.status)
    records.set_field(rec, kind, "verified_claim_sha256", d.verified_claim_sha256)
    if d.clear_adversary:
        old = rec.get("adversary") if isinstance(rec.get("adversary"), dict) else {}
        what = "rights fields" if kind == "media" else "claim"
        note = (f"Edit lock ({today}): {what} changed after verification; adversary verdict "
                f"'{old.get('verdict')}' by {old.get('model')} (run {old.get('run_id')}, "
                f"{old.get('date')}) cleared for re-verification.")
        records.set_field(rec, kind, "adversary", None)
        notes = rec.get("notes")
        records.set_field(rec, kind, "notes", f"{notes}\n{note}" if notes else note)
    return rec


def compute(facts, media, ctx, today=None):
    """(new_facts, new_media, changes); inputs are not modified.

    changes lists (id, old_status, new_status, reasons) for every record whose
    stored fields differ from the derivation.
    """
    today = today or datetime.date.today().isoformat()
    changes = []
    new_facts = []
    for f in facts:
        d = derive_fact(f, ctx)
        nf = _apply(f, d, "fact", today, ctx)
        if nf != f:
            changes.append((f.get("id"), f.get("status"), nf.get("status"), d.reasons))
        new_facts.append(nf)
    fact_status = {fid: f.get("status") for fid, f in gates.by_id(new_facts).items()}
    new_media = []
    for m in media:
        d = derive_media(m, ctx, fact_status)
        nm = _apply(m, d, "media", today)
        if nm != m:
            changes.append((m.get("id"), m.get("status"), nm.get("status"), d.reasons))
        new_media.append(nm)
    return new_facts, new_media, changes


@dataclass
class RunResult:
    facts: list
    media: list
    changes: list
    reasons: dict  # id -> reasons, for every record not verified


def run(p, today=None):
    """Derive and save statuses for one inductee folder, holding the folder lock."""
    with records.locked(p.facts):
        facts = records.read_jsonl(p.facts)
        media = records.read_jsonl(p.media)
        ctx = records.load_context(p, facts)
        new_facts, new_media, changes = compute(facts, media, ctx, today)
        if new_facts != facts:
            records.write_jsonl(p.facts, new_facts)
        if new_media != media:
            records.write_jsonl(p.media, new_media)
    reasons = {}
    status_by_fact = {fid: f.get("status") for fid, f in gates.by_id(new_facts).items()}
    for f in new_facts:
        if f.get("status") != "verified":
            reasons[str(f.get("id"))] = derive_fact(f, ctx).reasons
    for m in new_media:
        if m.get("status") != "verified":
            reasons[str(m.get("id"))] = derive_media(m, ctx, status_by_fact).reasons
    return RunResult(new_facts, new_media, changes, reasons)


def _summary(rows):
    counts = Counter(str(r.get("status")) for r in rows)
    return ", ".join(f"{k} {v}" for k, v in sorted(counts.items(), key=lambda kv: str(kv[0]))) or "none"


def main(argv=None):
    parser = argparse.ArgumentParser(description="Derive fact and media status (SPEC section 5).")
    parser.add_argument("slug", nargs="?", help="inductee slug")
    parser.add_argument("--all", action="store_true", help="every inductee under the data folder")
    parser.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    parser.add_argument("--verbose", action="store_true", help="list reasons for every unverified item")
    args = parser.parse_args(argv)

    if bool(args.slug) == bool(args.all):
        parser.print_usage(sys.stderr)
        print("compute_status: give one slug or --all", file=sys.stderr)
        return 2
    if args.all:
        slugs = paths.list_slugs(args.data_dir)
        if not slugs:
            print(f"No inductees under {paths.data_dir(args.data_dir) / 'inductees'}")
            return 0
    else:
        slugs = [args.slug]

    for slug in slugs:
        try:
            p = paths.inductee_paths(slug, args.data_dir)
        except ValueError as exc:
            print(f"compute_status: {exc}", file=sys.stderr)
            return 2
        if not p.exists():
            print(f"compute_status: no inductee '{slug}' ({p.inductee_json} not found)", file=sys.stderr)
            return 2
        try:
            result = run(p)
        except records.RecordError as exc:
            print(f"compute_status: {slug}: {exc}", file=sys.stderr)
            return 1
        print(f"{slug}: facts [{_summary(result.facts)}]; media [{_summary(result.media)}]; "
              f"{len(result.changes)} changed")
        for rid, old, new, reasons in result.changes:
            detail = f" ({'; '.join(reasons)})" if reasons else ""
            print(f"  {rid}: {old} -> {new}{detail}")
        if args.verbose:
            changed = {c[0] for c in result.changes}
            for rid, reasons in result.reasons.items():
                if rid not in changed and reasons:
                    print(f"  {rid}: {'; '.join(reasons)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
