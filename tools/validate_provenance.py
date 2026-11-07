"""Validate the provenance log in data/provenance/.

Rules (see data/provenance/README.md):
- A fact is "verified" only if it rests on its primary document, or on at least
  2 independent sources of which at least 1 is primary or institutional.
- Only verified facts may be used on the site, and every one of them links to a
  primary or institutional source.
- Every source has an https URL, a type, and an ISO access date.
- Every media item has a license and a source; every search has a date and query.

Usage: python3 tools/validate_provenance.py [data/provenance]
Exit code 1 on any error.
"""

import json
import re
import sys
from pathlib import Path

STATUSES = {"verified", "single-source", "conflicting", "rejected"}
SOURCE_TYPES = {"primary", "institutional", "secondary"}
STRONG_TYPES = {"primary", "institutional"}
ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
FILES = ("facts", "sources", "media", "searches")


def _duplicates(rows, kind, errors):
    seen = set()
    for row in rows:
        rid = row.get("id")
        if rid in seen:
            errors.append(f"{kind}: duplicate id {rid}")
        seen.add(rid)


def _check_sources(sources, errors):
    for s in sources:
        sid = s.get("id")
        if s.get("type") not in SOURCE_TYPES:
            errors.append(f"source {sid}: type must be one of {sorted(SOURCE_TYPES)}")
        if not str(s.get("url", "")).startswith("https://"):
            errors.append(f"source {sid}: url must be https")
        if not ISO_DATE.match(str(s.get("accessed", ""))):
            errors.append(f"source {sid}: accessed must be YYYY-MM-DD")
        for field in ("title", "institution"):
            if not s.get(field):
                errors.append(f"source {sid}: missing {field}")


def _check_facts(facts, by_id, errors):
    for f in facts:
        fid = f.get("id")
        status = f.get("status")
        if status not in STATUSES:
            errors.append(f"fact {fid}: status must be one of {sorted(STATUSES)}")
        if not f.get("claim"):
            errors.append(f"fact {fid}: missing claim")

        refs = f.get("source_ids") or []
        missing = [r for r in refs if r not in by_id]
        for r in missing:
            errors.append(f"fact {fid}: unknown source {r}")
        srcs = [by_id[r] for r in refs if r in by_id]
        types = [s.get("type") for s in srcs]

        if f.get("primary_document") and "primary" not in types:
            errors.append(f"fact {fid}: primary_document is true but no primary source is cited")

        if status == "verified":
            if not any(t in STRONG_TYPES for t in types):
                errors.append(f"fact {fid}: verified needs a primary or institutional source")
            elif not (f.get("primary_document") and "primary" in types) and len(srcs) < 2:
                errors.append(f"fact {fid}: verified needs its primary document or 2 independent sources")

        if f.get("used_in") and status != "verified":
            errors.append(f"fact {fid}: only verified facts may be used on the site (status is {status})")


def _check_media(media, by_id, errors):
    for m in media:
        mid = m.get("id")
        if not m.get("license"):
            errors.append(f"media {mid}: missing license")
        if not m.get("credit"):
            errors.append(f"media {mid}: missing credit")
        refs = m.get("source_ids") or []
        if not refs:
            errors.append(f"media {mid}: missing source")
        for r in refs:
            if r not in by_id:
                errors.append(f"media {mid}: unknown source {r}")
        if "reconstruction" not in m:
            errors.append(f"media {mid}: reconstruction must be true or false")


def _check_searches(searches, errors):
    for s in searches:
        qid = s.get("id")
        if not ISO_DATE.match(str(s.get("date", ""))):
            errors.append(f"search {qid}: date must be YYYY-MM-DD")
        if not s.get("query"):
            errors.append(f"search {qid}: missing query")
        if not s.get("tool"):
            errors.append(f"search {qid}: missing tool")


def validate(log):
    """Return a list of error strings; empty means the log is valid."""
    errors = []
    for kind in FILES:
        _duplicates(log.get(kind, []), kind, errors)
    sources = log.get("sources", [])
    by_id = {s.get("id"): s for s in sources}
    _check_sources(sources, errors)
    _check_facts(log.get("facts", []), by_id, errors)
    _check_media(log.get("media", []), by_id, errors)
    _check_searches(log.get("searches", []), errors)
    return errors


def load(directory):
    log = {}
    for kind in FILES:
        path = Path(directory) / f"{kind}.jsonl"
        rows = []
        if path.exists():
            for n, line in enumerate(path.read_text().splitlines(), 1):
                if line.strip():
                    try:
                        rows.append(json.loads(line))
                    except json.JSONDecodeError as exc:
                        raise SystemExit(f"{path}:{n}: invalid JSON ({exc})")
        log[kind] = rows
    return log


def main(argv):
    directory = argv[1] if len(argv) > 1 else "data/provenance"
    log = load(directory)
    errors = validate(log)
    for e in errors:
        print(f"ERROR {e}")
    counts = ", ".join(f"{len(log[k])} {k}" for k in FILES)
    print(f"{'FAIL' if errors else 'OK'}: {counts}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
