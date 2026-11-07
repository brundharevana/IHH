"""Record who wrote a media item, for the private-writings rights rule (owner decision 2026-10-20).

    python3 tools/set_authorship.py <slug> <MEDIA-ID> --json '<authorship object>' [--note TEXT]
    python3 tools/set_authorship.py <slug> <MEDIA-ID> --clear [--note TEXT]

The authorship object (SPEC 3.4.3):

    {"kind": "private" | "federal",
     "authors": [{"name": "...", "death_year": 1955 | null,
                  "death_basis": {"fact_id": "XXX-F-0001"} | {"source_id": "XXX-S-0001", "quote": "..."} | null}],
     "published": {"year": 1913, "basis": {...}}      (optional),
     "note": "..."                                     (optional)}

A death year needs a basis: a verified fact on file whose claim gives the author's surname, the
year (or its event_date) and the death, or a quote copied verbatim from an intact source snapshot
(an authority record such as "Einstein, Albert, 1879-1955"). The record is schema-checked at the
write boundary (ihh.records); the change falls under the media edit lock (G7), so then run
`apply_rights_rule.py <slug>`, `compute_status.py <slug>`, `adversary.py <slug> --ids <id>`,
`compute_status.py <slug>` and `validate.py <slug>`.

Exit codes: 0 written, 1 refused (unknown id, bad JSON, schema), 2 usage error or unknown slug.
"""

import argparse
import datetime
import json
import sys

from ihh import paths, records


def run(p, media_id, authorship, note=None, today=None):
    """Set (or clear, authorship None) the item's authorship with an audit line; returns the record."""
    today = today or datetime.date.today().isoformat()
    with records.locked(p.facts):
        media = records.read_jsonl(p.media)
        hit = next((m for m in media if m.get("id") == media_id), None)
        if hit is None:
            raise KeyError(f"no media item {media_id}")
        if authorship is None:
            hit.pop("authorship", None)
            line = f"Authorship cleared on {today}"
        else:
            records.set_field(hit, "media", "authorship", authorship)
            names = ", ".join(str(a.get("name")) for a in authorship.get("authors") or [] if isinstance(a, dict))
            line = f"Authorship set on {today}: {authorship.get('kind')}" + (f" ({names})" if names else "")
        line += f" (private-writings rule, DECISIONS 2026-10-20){': ' + note if note else ''}."
        records.set_field(hit, "media", "notes", f"{hit['notes']}\n{line}" if hit.get("notes") else line)
        records.write_jsonl(p.media, media)
    return hit


def main(argv=None):
    parser = argparse.ArgumentParser(description="Record who wrote a media item (private-writings rule).")
    parser.add_argument("slug")
    parser.add_argument("media_id")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--json", help="the authorship object")
    group.add_argument("--clear", action="store_true", help="remove the authorship")
    parser.add_argument("--note", help="why (added to the audit line)")
    parser.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    args = parser.parse_args(argv)
    try:
        p = paths.inductee_paths(args.slug, args.data_dir)
    except ValueError as exc:
        print(f"set_authorship: {exc}", file=sys.stderr)
        return 2
    if not p.exists():
        print(f"set_authorship: no inductee '{args.slug}'", file=sys.stderr)
        return 2
    try:
        authorship = None if args.clear else json.loads(args.json)
    except json.JSONDecodeError as exc:
        print(f"set_authorship: --json is not JSON: {exc}", file=sys.stderr)
        return 1
    if authorship is not None and not isinstance(authorship, dict):
        print("set_authorship: --json must be an object", file=sys.stderr)
        return 1
    try:
        run(p, args.media_id, authorship, args.note)
    except (KeyError, records.RecordError) as exc:
        print(f"set_authorship: {args.slug}: {exc}", file=sys.stderr)
        return 1
    print(f"{args.slug}: {args.media_id} authorship {'cleared' if args.clear else 'set'}")
    print(f"  next: python3 tools/apply_rights_rule.py {args.slug}; python3 tools/compute_status.py {args.slug}; "
          f"python3 tools/adversary.py {args.slug} --ids {args.media_id} --engine codex; "
          f"python3 tools/compute_status.py {args.slug}; python3 tools/validate.py {args.slug}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
