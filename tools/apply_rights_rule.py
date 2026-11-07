"""Apply the approved Library of Congress / National Archives rights rule to media on file.

    python3 tools/apply_rights_rule.py <slug> | --all [--dry-run] [--data-dir DIR]

The rule (user decision 2026-10-09, docs/handoff/DECISIONS.md "Rights mapping for LoC and NARA")
lives in tools/ihh/rights.py; merge_staging.py applies it to newly staged media and G1 for media
checks every record against it. This tool brings media already on file into line, reading only
the holder's own rights field in a saved snapshot that passes G1:

  - a missing rights_statement is copied verbatim from the holder's snapshot (LoC rights_advisory
    or rights_information, NARA useRestriction.status), with rights_url the holder's page when that
    is empty too; with no holder field it stays missing and license_class stays as it is;
  - license_class becomes public-domain where the rule grants it for the record's statement;
  - for a private writing (authorship kind private; owner decision 2026-10-20) the private-writings
    rule decides on top of the LoC / NARA rule: public-domain only when every author died before
    1956 (each death year backed), the holder states public domain, or it was published before
    1931; otherwise a public-domain class that rested only on the holder's LoC / NARA wording goes
    back to unknown (link-only) while no person has approved, edited or rejected the item.

Every changed record gets an audit line in notes. license_class and rights_statement are under
the media edit lock (G7), so the next compute_status.py run clears each changed item's adversary
verdict and the item waits as pending for a fresh one: run
`adversary.py <slug> --ids <changed ids>`, then `compute_status.py`, then `validate.py`.

Reconstructions and rejected items are left alone. An item the rule bars (LoC "Publication may be
restricted" or "Rights status not evaluated", NARA "Restricted ..." or "Undetermined") but that is
marked usable is never rewritten: the tool names it and exits 1 without writing anything, and a
person decides. Running it twice changes nothing the second time.

Exit codes: 0 done (or nothing to change), 1 refused or a record file could not be read, 2 usage
error or unknown slug.
"""

import argparse
import copy
import datetime
import sys

from ihh import gates, paths, records, rights


def plan(p, today):
    """(new_media, changed, problems) for one inductee folder; nothing is written."""
    facts = records.read_jsonl(p.facts)
    media = records.read_jsonl(p.media)
    ctx = records.load_context(p, facts)

    def text_of(sid):
        src, snap = ctx.sources.get(sid), ctx.snapshots.get(sid)
        if src is None or snap is None or gates.snapshot_failures(src, snap):
            return None
        return snap.text

    lookup = gates.private_lookup(ctx, {f.get("id"): f.get("status") for f in facts if isinstance(f, dict)})
    new_media, changed, problems = [], [], []
    for m in media:
        if m.get("status") == "rejected":
            new_media.append(m)
            continue
        holders = rights.holders_of(m, ctx.sources, text_of, ctx.registry)
        changes, conflicts = rights.derive(m, holders, lookup)
        problems += [f"{m.get('id')}: {x}" for x in conflicts]
        if not changes:
            new_media.append(m)
            continue
        nm = copy.deepcopy(m)
        for key, value in changes.items():
            records.set_field(nm, "media", key, value)
        r = rights.item_ruling(nm, holders, lookup)
        note = rights.change_note(changes, r.value, today, r.basis, private=r.private)
        records.set_field(nm, "media", "notes", f"{m['notes']}\n{note}" if m.get("notes") else note)
        new_media.append(nm)
        changed.append((m.get("id"), {k: (m.get(k), v) for k, v in changes.items()}))
    return new_media, changed, problems


def run(p, dry_run=False, today=None):
    today = today or datetime.date.today().isoformat()
    with records.locked(p.facts):
        new_media, changed, problems = plan(p, today)
        if changed and not problems and not dry_run:
            records.write_jsonl(p.media, new_media)
    return changed, problems


def main(argv=None):
    parser = argparse.ArgumentParser(description="Apply the approved LoC / NARA rights rule to media on file.")
    parser.add_argument("slug", nargs="?", help="inductee slug")
    parser.add_argument("--all", action="store_true", help="every inductee under the data folder")
    parser.add_argument("--dry-run", action="store_true", help="show the changes without writing them")
    parser.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    args = parser.parse_args(argv)

    if bool(args.slug) == bool(args.all):
        parser.print_usage(sys.stderr)
        print("apply_rights_rule: give one slug or --all", file=sys.stderr)
        return 2
    slugs = paths.list_slugs(args.data_dir) if args.all else [args.slug]
    status = 0
    for slug in slugs:
        try:
            p = paths.inductee_paths(slug, args.data_dir)
        except ValueError as exc:
            print(f"apply_rights_rule: {exc}", file=sys.stderr)
            return 2
        if not p.exists():
            print(f"apply_rights_rule: no inductee '{slug}' ({p.inductee_json} not found)", file=sys.stderr)
            return 2
        try:
            changed, problems = run(p, dry_run=args.dry_run)
        except records.RecordError as exc:
            print(f"apply_rights_rule: {slug}: {exc}", file=sys.stderr)
            return 1
        if problems:
            for problem in problems:
                print(f"apply_rights_rule: {slug}: {problem}", file=sys.stderr)
            print(f"apply_rights_rule: {slug}: refused; nothing written", file=sys.stderr)
            status = 1
            continue
        verb = "would change" if args.dry_run else "changed"
        print(f"{slug}: {len(changed)} media {verb}")
        for mid, fields in changed:
            detail = "; ".join(f"{k} {old!r} -> {new!r}" for k, (old, new) in fields.items())
            print(f"  {mid}: {detail}")
        if changed and not args.dry_run:
            print(f"  next: python3 tools/compute_status.py {slug}; python3 tools/adversary.py {slug} --ids "
                  f"{' '.join(str(mid) for mid, _ in changed)}; python3 tools/compute_status.py {slug}")
    return status


if __name__ == "__main__":
    sys.exit(main())
