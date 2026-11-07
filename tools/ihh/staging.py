"""Staged candidate records and their temporary ids (SPEC sections 2, 6 and 9).

Search agents write candidate records to the top level of <inductee>/staging/
as JSON Lines, one file per search family (staging/<family>.jsonl for sources,
facts and media; staging/<family>.searches.jsonl for searches). Candidates
carry temporary ids until tools/merge_staging.py gives them permanent ones:

    tmp-<label>-S-<n>  source      tmp-<label>-F-<n>  fact
    tmp-<label>-M-<n>  media       tmp-<label>-Q-<n>  search

<label> is letters, digits and hyphens, usually the family name and, for a
corroboration, the fact id (tmp-loc-S-1, tmp-nara-F-12,
tmp-corroborate-LAM-F-0007-S-1). The letter before the final number gives the
record kind. Temporary ids always start with "tmp-", so they can never be
mistaken for permanent ones (<CODE>-F-0001). An id that starts with "tmp" but
does not follow this form is an error, never a silently ignored record.

A staged source is snapshotted by tools/fetch_snapshot.py into
staging/snapshots/<temp id>.txt and .meta.json; merge_staging.py moves the pair
to snapshots/<permanent id>.* when it assigns the permanent id.

Only files directly inside staging/ are candidate files. Subfolders (merged/,
snapshots/, browser/, raw-*/, deferred-*/, archive/) are never read.
"""

import json
import re
from pathlib import Path

from . import records, textfiles

TEMP_ID_RE = re.compile(r"^tmp-(?P<label>[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)-(?P<letter>[SFMQ])-(?P<num>\d+)$")
TEMP_ID_IN_TEXT = re.compile(r"(?<![\w-])tmp-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*-[SFMQ]-\d+(?![\w-])")
_KINDS = {"S": "source", "F": "fact", "M": "media", "Q": "search"}
SEARCHES_SUFFIX = ".searches.jsonl"


class StagingError(Exception):
    """A staged record could not be found or safely rewritten."""


def is_temp_id(value, kind=None):
    if not isinstance(value, str):
        return False
    m = TEMP_ID_RE.match(value)
    if not m:
        return False
    return kind is None or _KINDS[m.group("letter")] == kind


def looks_temporary(value):
    """True for an id meant to be temporary (it starts with "tmp"), well formed or not."""
    return isinstance(value, str) and value[:3].lower() == "tmp"


def temp_kind(value):
    """'source', 'fact', 'media' or 'search' for a temporary id, else None."""
    m = TEMP_ID_RE.match(value) if isinstance(value, str) else None
    return _KINDS[m.group("letter")] if m else None


def staging_files(p):
    """Top-level *.jsonl files in the inductee's staging folder, sorted by name."""
    if not p.staging.is_dir():
        return []
    return sorted(f for f in p.staging.iterdir() if f.is_file() and f.name.endswith(".jsonl")
                  and not f.name.startswith("."))


def snapshot_dir(p):
    return p.staging / "snapshots"


def snapshot_text_path(p, temp_id):
    return snapshot_dir(p) / f"{temp_id}.txt"


def snapshot_meta_path(p, temp_id):
    return snapshot_dir(p) / f"{temp_id}.meta.json"


def snapshot_rel(temp_id):
    """The `snapshot` value a staged source carries."""
    return f"staging/snapshots/{temp_id}.txt"


def find_staged(p, temp_id):
    """(file, line index, record) of the staged record with this temporary id.

    Raises StagingError when it is missing, appears more than once, or sits in a
    file with unparseable lines (such a file is never rewritten).
    """
    hits = []
    for path in staging_files(p):
        rows, problems = _lines(path)
        for index, (_raw, rec) in enumerate(rows):
            if isinstance(rec, dict) and rec.get("id") == temp_id:
                hits.append((path, index, rec, problems))
    if not hits:
        raise StagingError(f"no staged record {temp_id} in {p.staging}/*.jsonl")
    if len(hits) > 1:
        where = ", ".join(f"{h[0].name} line {h[1] + 1}" for h in hits)
        raise StagingError(f"{temp_id} is staged more than once ({where})")
    path, index, rec, problems = hits[0]
    if problems:
        raise StagingError(f"{path.name} has unreadable lines ({'; '.join(problems)}); fix them first")
    return path, index, rec


def replace_line(path, index, record, expected_id):
    """Rewrite the index-th record line of a staging file; every other line is kept byte for byte.

    expected_id guards against the file having changed since find_staged() read it.
    """
    path = Path(path)
    with records.locked(path):
        rows, problems = _lines(path)
        if problems:
            raise StagingError(f"{path.name} has unreadable lines; not rewritten")
        if index >= len(rows) or not isinstance(rows[index][1], dict) or \
                rows[index][1].get("id") != expected_id:
            raise StagingError(f"{path.name} changed while it was being updated; run again")
        lines = records.split_lines(path.read_text(encoding="utf-8"))
        seen = -1
        for n, line in enumerate(lines):
            if line.strip():
                seen += 1
                if seen == index:
                    lines[n] = records.dumps_line(record)
                    break
        textfiles.write_text(path, "".join(line + "\n" for line in lines))


def _lines(path):
    """[(raw line, parsed object)] for the non-blank lines of a file, plus problems."""
    text = Path(path).read_text(encoding="utf-8")
    rows, problems = [], []
    for n, line in enumerate(records.split_lines(text), 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            problems.append(f"line {n}: invalid JSON ({exc.msg})")
            continue
        rows.append((line, value))
    return rows, problems
