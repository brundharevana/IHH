"""Load and save pipeline records (SPEC sections 2 and 3).

JSON Lines files hold one object per line, UTF-8, keys in the order written.
Saving takes an exclusive fcntl lock and replaces the file atomically: the rows
go to a temporary file in the same folder, which is flushed, synced, and moved
over the original with os.replace, so a reader sees either the old file or the
new one, never a partial write.

Every record is schema-validated at the moment it is written, so a bad record can never land:
write_jsonl and write_json check each new or changed record of a main record file
(paths.record_kind: inductee.json, facts, sources, media, searches, review decisions, draft
grounding verdicts and drafts/profile.json) against ihh.schema, the schema validate.py uses, and
raise SchemaError, writing nothing, when one breaks it. A record that was already on file with a
schema problem (it landed before the check existed, or by hand) may be written again only without
any problem its version on file lacks: the write introduces nothing bad, so a tool can still
update its derived fields (compute_status.py demoting it to pending, for example), and
validate.py keeps reporting the old problem until a person repairs it. check_records() runs the
same check without writing, for tools that must check several files before writing any.

The lock is taken on the folder that holds the file (flock on a directory
descriptor), which leaves no lock files behind in the data folders. It is
re-entrant within a process, so a read-modify-write can hold it around both the
read and the save:

    with records.locked(paths.facts):
        rows = records.read_jsonl(paths.facts)
        ...
        records.write_jsonl(paths.facts, rows)
"""

import fcntl
import hashlib
import json
import os
import tempfile
import threading
from collections import Counter
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path

from . import authority, gates, paths, schema
from .paths import refuse_registry_write

# Key order per record type, as listed in SPEC section 3. New keys are inserted
# at their listed position; existing key order is never changed.
FIELD_ORDER = {
    "inductee": ("slug", "code", "name", "aliases", "authority", "birth_year", "death_year",
                 "ihh_url", "runs"),
    "source": ("id", "title", "institution", "type", "url", "fetch_url", "catalog_id", "published",
               "accessed", "snapshot", "snapshot_sha256", "fetch_method", "archive_url", "derived_from", "content_part", "notes"),
    "fact": ("id", "inductee", "claim", "category", "event_date", "place", "evidence",
             "primary_document", "is_direct_quote", "extractor", "adversary", "status",
             "verified_claim_sha256", "used_in", "review", "notes"),
    "media": ("id", "title", "media_type", "source_ids", "url", "rights_statement", "rights_url",
              "license_class", "credit", "alt_text", "reconstruction", "reconstruction_basis",
              "record_kind", "basis_for", "authorship", "adversary", "status", "verified_claim_sha256", "review", "notes"),
    "search": ("id", "date", "family", "tool", "query", "results", "produced", "agent", "run_id",
               "notes"),
    "decision": ("date", "reviewer", "item_id", "action", "before", "after", "note"),
    "grounding": ("location", "unit_sha256", "model", "run_id", "date", "verdict", "adds_information",
                  "rationale"),
    "meta": ("url", "fetch_url", "method", "fetched_at", "sha256", "bytes", "http_status", "final_url",
             "full_text_url", "segment_id", "record_url"),
}


class RecordError(Exception):
    """A record file could not be read (bad JSON, wrong shape)."""


class SchemaError(RecordError):
    """A record breaks the SPEC section 3 schema (ihh.schema); it was not written and the file is
    unchanged."""


# --- locking -------------------------------------------------------------------

_held = {}
_guard = threading.RLock()


@contextmanager
def locked(path):
    """Hold an exclusive lock on the folder containing `path` (or on `path` if a folder)."""
    target = Path(path)
    refuse_registry_write(target)
    folder = target if target.is_dir() else target.parent
    folder.mkdir(parents=True, exist_ok=True)
    key = str(folder.resolve())
    with _guard:
        entry = _held.get(key)
        if entry is None:
            fd = os.open(key, os.O_RDONLY)
            try:
                fcntl.flock(fd, fcntl.LOCK_EX)
            except BaseException:
                os.close(fd)
                raise
            entry = _held[key] = [fd, 0]
        entry[1] += 1
        try:
            yield
        finally:
            entry[1] -= 1
            if entry[1] == 0:
                del _held[key]
                try:
                    fcntl.flock(entry[0], fcntl.LOCK_UN)
                finally:
                    os.close(entry[0])


# --- reading ---------------------------------------------------------------------

def split_lines(text):
    """The lines of a JSON Lines file: split on "\n" only (a trailing "\r" is dropped).

    str.splitlines() also breaks on U+2028, U+2029, U+0085 and other characters
    that JSON allows unescaped inside a string, so it would cut such a record
    in two. JSON Lines records are separated by "\n" alone.
    """
    lines = text.split("\n")
    if lines and lines[-1] == "":
        lines.pop()
    return [line[:-1] if line.endswith("\r") else line for line in lines]


def _parse_lines(path, text):
    rows, problems = [], []
    for n, line in enumerate(split_lines(text), 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            problems.append(f"{path.name}:{n}: invalid JSON ({exc.msg})")
            continue
        if not isinstance(value, dict):
            problems.append(f"{path.name}:{n}: expected a JSON object, got {type(value).__name__}")
            continue
        rows.append(value)
    return rows, problems


def read_jsonl(path):
    """All objects in a JSON Lines file; [] if it does not exist. Raises RecordError."""
    path = Path(path)
    if not path.exists():
        return []
    rows, problems = _parse_lines(path, path.read_text(encoding="utf-8"))
    if problems:
        raise RecordError("; ".join(problems))
    return rows


def read_jsonl_lenient(path):
    """(rows, problems): the parseable objects plus one message per bad line."""
    path = Path(path)
    if not path.exists():
        return [], []
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        return [], [f"{path.name}: not UTF-8 ({exc.reason})"]
    return _parse_lines(path, text)


def read_json(path, default=None):
    path = Path(path)
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RecordError(f"{path.name}: invalid JSON ({exc.msg} at line {exc.lineno})") from exc


# --- writing ---------------------------------------------------------------------

# Characters JSON allows raw inside a string but that some line readers treat as
# line ends; they are written escaped so every record stays on one line.
_LINE_BREAKS = {"\u2028": "\\u2028", "\u2029": "\\u2029", "\u0085": "\\u0085"}


def dumps_line(obj):
    text = json.dumps(obj, ensure_ascii=False)
    for raw, escaped in _LINE_BREAKS.items():
        text = text.replace(raw, escaped)
    return text


def _atomic_write(path, text):
    path = Path(path)
    refuse_registry_write(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = (path.stat().st_mode & 0o777) if path.exists() else 0o644
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
            fh.flush()
            os.fsync(fh.fileno())
        os.chmod(tmp, mode)
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except FileNotFoundError:
            pass
        raise


def write_jsonl(path, rows):
    # Serialize first so a bad row never leaves a temporary file behind.
    text = "".join(dumps_line(row) + "\n" for row in rows)
    with locked(path):
        check_records(path, rows)
        _atomic_write(path, text)


def write_json(path, obj, indent=2):
    text = json.dumps(obj, ensure_ascii=False, indent=indent) + "\n"
    with locked(path):
        check_records(path, obj)
        _atomic_write(path, text)


# --- the write boundary ----------------------------------------------------------------

MAX_LISTED = 25


def schema_problems(path, value):
    """Schema errors that writing value to path would land: every problem of a row (or, for
    inductee.json and drafts/profile.json, the object) that is new, and every problem of a
    changed record that its version on file (same id) does not already have. Rows unchanged
    from the file are not checked. [] when path is not a main record file (paths.record_kind)."""
    target = paths.record_target(path)
    if target is None:
        return []
    kind, folder = target
    slug = folder.name
    path = Path(path)
    if kind in ("inductee", "profile"):
        try:
            before = read_json(path)
        except (RecordError, UnicodeDecodeError):
            before = None
        if before is not None and value == before:
            return []
        old = set(schema.record_problems(kind, before, slug=slug)[0]) if isinstance(before, dict) else set()
        return [e for e in schema.record_problems(kind, value, slug=slug)[0] if e not in old]
    if not isinstance(value, list):
        return [f"{path.name} holds a list of records (got {type(value).__name__})"]
    rows_on_file = read_jsonl_lenient(path)[0]
    on_file = Counter(dumps_line(r) for r in rows_on_file)
    by_id = {}
    for r in rows_on_file:
        if isinstance(r.get("id"), str):
            by_id.setdefault(r["id"], r)
    sources = value if kind == "source" else (
        read_jsonl_lenient(folder / "sources.jsonl")[0] if kind == "fact" else [])
    sources_by_id = gates.by_id(sources)
    errors = []
    for n, row in enumerate(value, 1):
        line = dumps_line(row)
        if on_file[line] > 0:
            on_file[line] -= 1
            continue
        problems = schema.record_problems(kind, row, slug=slug, sources_by_id=sources_by_id, position=n)[0]
        rid = row.get("id") if isinstance(row, dict) else None
        if problems and isinstance(rid, str) and rid in by_id:
            old = set(schema.record_problems(kind, by_id[rid], slug=slug, sources_by_id=sources_by_id)[0])
            problems = [e for e in problems if e not in old]
        errors += problems
    return errors


def check_records(path, value):
    """Raise SchemaError (naming each record and problem) if writing value to path would land a
    record that breaks the schema; return None otherwise. Writes nothing."""
    errors = schema_problems(path, value)
    if not errors:
        return
    listed = "; ".join(errors[:MAX_LISTED])
    more = f"; and {len(errors) - MAX_LISTED} more" if len(errors) > MAX_LISTED else ""
    raise SchemaError(f"{Path(path).name}: refused, nothing written: {len(errors)} schema problem(s) in the "
                      f"records being written (SPEC section 3, the schema validate.py checks): {listed}{more}. "
                      f"Fix those records and write again (for a staged candidate, fix its staging file and "
                      f"re-run tools/merge_staging.py)")


def update_jsonl(path, fn):
    """Read, transform with fn(rows) -> rows, and save, all under one lock."""
    with locked(path):
        rows = fn(read_jsonl(path))
        write_jsonl(path, rows)
        return rows


# --- key order -------------------------------------------------------------------

def set_field(record, kind, key, value):
    """Set record[key] in place; a new key goes to its SPEC position, others keep order."""
    if key in record:
        record[key] = value
        return record
    order = FIELD_ORDER.get(kind, ())
    if key not in order:
        record[key] = value
        return record
    rank = order.index(key)
    items = list(record.items())
    insert_at = 0
    for i, (k, _) in enumerate(items):
        if k in order and order.index(k) < rank:
            insert_at = i + 1
    items.insert(insert_at, (key, value))
    record.clear()
    record.update(items)
    return record


def order_keys(record, kind):
    """A copy with known keys in SPEC order followed by any other keys as they were."""
    order = FIELD_ORDER.get(kind, ())
    out = {k: record[k] for k in order if k in record}
    out.update((k, v) for k, v in record.items() if k not in out)
    return out


# --- snapshots -------------------------------------------------------------------

@dataclass(frozen=True)
class Snapshot:
    """A saved source snapshot as found on disk.

    text    decoded UTF-8 text, or None when it could not be read
    sha256  sha256 of the file bytes as read
    meta    parsed <SRC>.meta.json, or None when missing
    error   why the snapshot could not be loaded, else None
    """
    text: str | None = None
    sha256: str | None = None
    meta: dict | None = None
    error: str | None = None


def _meta_path(text_path):
    name = text_path.name
    stem = name[:-4] if name.endswith(".txt") else text_path.stem
    return text_path.with_name(stem + ".meta.json")


def load_snapshot(inductee_root, source):
    """Snapshot for one source record, or None if the record names no snapshot."""
    rel = source.get("snapshot")
    if not rel:
        return None
    if not isinstance(rel, str):
        return Snapshot(error=f"snapshot path {rel!r} is not a string")
    root = Path(inductee_root).resolve()
    path = (root / str(rel)).resolve()
    if root != path and root not in path.parents:
        return Snapshot(error=f"snapshot path {rel!r} is outside the inductee folder")
    if not path.is_file():
        return Snapshot(error=f"snapshot file {rel} is missing")
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        return Snapshot(sha256=digest, error=f"snapshot file {rel} is not UTF-8")
    meta, error = None, None
    meta_file = _meta_path(path)
    if meta_file.is_file():
        try:
            meta = json.loads(meta_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            error = f"meta file {meta_file.name} is not valid JSON"
        else:
            if not isinstance(meta, dict):
                meta, error = None, f"meta file {meta_file.name} is not a JSON object"
    return Snapshot(text=text, sha256=digest, meta=meta, error=error)


def load_snapshots(inductee_root, sources):
    """{source_id: Snapshot} for every source record that names a snapshot."""
    out = {}
    for src in sources:
        if not isinstance(src.get("id"), str):
            continue
        snap = load_snapshot(inductee_root, src)
        if snap is not None:
            out[src.get("id")] = snap
    return out


def load_context(p, facts):
    """Gate context for one inductee folder (ihh.paths.InducteePaths) and its facts, with the
    authority registry of its data folder (RecordError if the registry is malformed)."""
    inductee = read_json(p.inductee_json, default={})
    sources = read_jsonl(p.sources)
    snapshots = load_snapshots(p.root, sources)
    try:
        registry = authority.load(p.registry)
    except authority.RegistryError as exc:
        raise RecordError(f"authority registry: {exc}") from exc
    return gates.build_context(inductee if isinstance(inductee, dict) else {}, sources, snapshots, facts, registry)
