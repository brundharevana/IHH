"""Create the folder and inductee.json for a new inductee (SPEC sections 2, 3.1 and 6).

    data/inductees/<slug>/
      inductee.json                       identity record, filled in by the Identify step
      facts.jsonl sources.jsonl media.jsonl searches.jsonl   empty
      snapshots/ staging/ drafts/ review/                     empty folders

inductee.json starts with no aliases, no authority ids and no runs: aliases are
added only when an identity-fact quote supports them (SPEC 3.1), and runs are
recorded by tools/merge_staging.py. The code namespaces every record id
(<CODE>-F-0001) and must not be used by another inductee.

Usage: python3 tools/new_inductee.py <slug> --name NAME --code CODE [--ihh-url URL] [--data-dir DIR]
Exit codes: 0 created, 1 refused (the inductee exists or the code is taken),
2 usage error (bad slug, code, name or URL).
"""

import argparse
import re
import sys
from ihh import paths, records, urls

CODE_RE = re.compile(r"^[A-Z]{3}$")
RECORD_FILES = ("facts.jsonl", "sources.jsonl", "media.jsonl", "searches.jsonl")
FOLDERS = ("snapshots", "staging", "drafts", "review")


def _https(url):
    """True for a canonical https URL (ihh.urls)."""
    return isinstance(url, str) and url.startswith("https://") and urls.problem(url) is None


def inductee_record(slug, name, code, ihh_url=None):
    return records.order_keys({
        "slug": slug,
        "code": code,
        "name": name,
        "aliases": [],
        "authority": {"loc_naf": None, "wikidata": None},
        "birth_year": None,
        "death_year": None,
        "ihh_url": ihh_url,
        "runs": [],
    }, "inductee")


def code_owner(code, data=None):
    """Slug of the inductee already using this code, else None."""
    for slug in paths.list_slugs(data):
        try:
            other = records.read_json(paths.inductee_paths(slug, data).inductee_json, default={})
        except records.RecordError:
            continue
        if isinstance(other, dict) and other.get("code") == code:
            return slug
    return None


def create(slug, name, code, ihh_url=None, data=None):
    """Create the inductee folder; returns its InducteePaths. Raises FileExistsError."""
    p = paths.inductee_paths(slug, data)
    p.root.parent.mkdir(parents=True, exist_ok=True)
    with records.locked(p.root.parent):
        if p.exists():
            raise FileExistsError(f"inductee '{slug}' already exists ({p.inductee_json})")
        owner = code_owner(code, data)
        if owner is not None:
            raise FileExistsError(f"code {code} is already used by inductee '{owner}'")
        p.root.mkdir(parents=True, exist_ok=True)
        for folder in FOLDERS:
            (p.root / folder).mkdir(exist_ok=True)
        for name_ in RECORD_FILES:
            path = p.root / name_
            if not path.exists():
                records.write_jsonl(path, [])
        records.write_json(p.inductee_json, inductee_record(slug, name, code, ihh_url))
    return p


def main(argv=None):
    parser = argparse.ArgumentParser(description="Create a new inductee folder (SPEC section 2).")
    parser.add_argument("slug", help="lowercase ASCII with hyphens, e.g. lamarr")
    parser.add_argument("--name", required=True, help="full name as the inductee is known")
    parser.add_argument("--code", required=True, help="3 uppercase letters, e.g. LAM")
    parser.add_argument("--ihh-url", help="the inductee's current IHH page (https)")
    parser.add_argument("--data-dir", help="data folder (default: repo data/ or $IHH_DATA_DIR)")
    args = parser.parse_args(argv)

    problems = []
    if not paths.SLUG_RE.match(args.slug or ""):
        problems.append(f"invalid slug {args.slug!r}: use lowercase ASCII letters, digits and hyphens")
    if not CODE_RE.match(args.code or ""):
        problems.append(f"invalid code {args.code!r}: use exactly 3 uppercase letters")
    name = (args.name or "").strip()
    if not name:
        problems.append("--name must not be blank")
    if args.ihh_url is not None and not _https(args.ihh_url):
        problems.append(f"--ihh-url must be an https URL (got {args.ihh_url!r})")
    if problems:
        for problem in problems:
            print(f"new_inductee: {problem}", file=sys.stderr)
        return 2

    try:
        p = create(args.slug, name, args.code, args.ihh_url, args.data_dir)
    except FileExistsError as exc:
        print(f"new_inductee: {exc}; nothing changed", file=sys.stderr)
        return 1
    print(f"Created {p.root} (code {args.code}). Next: run the pipeline's Identify step to fill in "
          f"aliases and authority ids.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
