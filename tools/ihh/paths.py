"""Per-inductee folder layout (SPEC section 2).

    <data>/inductees/<slug>/
      inductee.json, facts.jsonl, sources.jsonl, media.jsonl, searches.jsonl
      snapshots/<SRC>.txt, snapshots/<SRC>.meta.json
      staging/, drafts/profile.json, drafts/grounding.jsonl, review/decisions.jsonl, export/
    <data>/export/

    <data>/registry/institutions.json   the authority registry (ihh/authority.py);
                                        reviewed by people, never written by a tool

<data> defaults to the repository's data/ folder. It can be overridden per call
(the command-line tools take --data-dir) or with the IHH_DATA_DIR environment
variable.
"""

import os
import re
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA_DIR = REPO_ROOT / "data"
REGISTRY_DIR = "registry"
REGISTRY_FILE = "institutions.json"
SLUG_RE = re.compile(r"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$")


def data_dir(override=None):
    """The data folder: the explicit override, else $IHH_DATA_DIR, else repo data/."""
    if override:
        return Path(override)
    env = os.environ.get("IHH_DATA_DIR")
    return Path(env) if env else DEFAULT_DATA_DIR


def registry_file(data=None):
    """The authority registry of a data folder."""
    return data_dir(data) / REGISTRY_DIR / REGISTRY_FILE


def is_registry_path(path):
    """True if path lies in a data folder's registry/ (a registry/ folder next to inductees/,
    or the repository's data/registry/)."""
    p = Path(path).resolve()
    default = (DEFAULT_DATA_DIR / REGISTRY_DIR).resolve()
    for folder in p.parents:
        if folder == default or (folder.name == REGISTRY_DIR and (folder.parent / "inductees").is_dir()):
            return True
    return False


def refuse_registry_write(path):
    """Raise PermissionError for a write into the authority registry. Every write the tools
    make goes through ihh.records (locked, _atomic_write), which calls this first: the
    registry is changed by people after review, never by a tool or a pipeline agent."""
    if is_registry_path(path):
        raise PermissionError(f"{path} is in the authority registry (data/{REGISTRY_DIR}/); tools never write "
                              f"it. A person reviews and edits it (SKILL: proposing a registry entry)")


# Main record files of an inductee folder and the record kind each holds (SPEC section 2).
# ihh.records checks every new or changed record in these against ihh.schema before writing.
# Staging files, exports, snapshot meta files and anything outside <data>/inductees/<slug>/ are
# not main record files: staged candidates are checked by merge_staging.py when they merge.
RECORD_FILES = {
    ("", "inductee.json"): "inductee",
    ("", "facts.jsonl"): "fact",
    ("", "sources.jsonl"): "source",
    ("", "media.jsonl"): "media",
    ("", "searches.jsonl"): "search",
    ("review", "decisions.jsonl"): "decision",
    ("drafts", "grounding.jsonl"): "grounding",
    ("drafts", "profile.json"): "profile",
}


def record_target(path):
    """(kind, inductee folder) when path is a main record file of <data>/inductees/<slug>/, else None."""
    p = Path(path)
    for (sub, name), kind in RECORD_FILES.items():
        if p.name != name:
            continue
        folder = p.parent if not sub else (p.parent.parent if p.parent.name == sub else None)
        if folder is not None and folder.parent.name == "inductees" and SLUG_RE.match(folder.name):
            return kind, folder
    return None


def record_kind(path):
    """The record kind a main record file holds (fact, source, ...), else None."""
    target = record_target(path)
    return target[0] if target else None


def check_slug(slug):
    if not isinstance(slug, str) or not SLUG_RE.match(slug):
        raise ValueError(f"invalid slug {slug!r}: use lowercase ASCII letters, digits and hyphens")
    return slug


@dataclass(frozen=True)
class InducteePaths:
    slug: str
    root: Path

    @property
    def inductee_json(self):
        return self.root / "inductee.json"

    @property
    def facts(self):
        return self.root / "facts.jsonl"

    @property
    def sources(self):
        return self.root / "sources.jsonl"

    @property
    def media(self):
        return self.root / "media.jsonl"

    @property
    def searches(self):
        return self.root / "searches.jsonl"

    @property
    def snapshots(self):
        return self.root / "snapshots"

    @property
    def staging(self):
        return self.root / "staging"

    @property
    def drafts(self):
        return self.root / "drafts"

    @property
    def profile(self):
        return self.drafts / "profile.json"

    @property
    def grounding(self):
        """Sentence-adversary verdicts on the draft units (the adversary half of G6)."""
        return self.drafts / "grounding.jsonl"

    @property
    def review(self):
        return self.root / "review"

    @property
    def decisions(self):
        return self.review / "decisions.jsonl"

    @property
    def export(self):
        return self.root / "export"

    @property
    def registry(self):
        """The authority registry of the data folder this inductee is in."""
        return self.root.parent.parent / REGISTRY_DIR / REGISTRY_FILE

    def snapshot_text(self, source_id):
        return self.snapshots / f"{source_id}.txt"

    def snapshot_meta(self, source_id):
        return self.snapshots / f"{source_id}.meta.json"

    def exists(self):
        return self.inductee_json.is_file()


def inductee_paths(slug, data=None):
    check_slug(slug)
    return InducteePaths(slug=slug, root=data_dir(data) / "inductees" / slug)


def aggregate_export_dir(data=None):
    return data_dir(data) / "export"


def list_slugs(data=None):
    """Slugs of every folder under <data>/inductees that has an inductee.json."""
    base = data_dir(data) / "inductees"
    if not base.is_dir():
        return []
    return sorted(
        p.name for p in base.iterdir()
        if p.is_dir() and SLUG_RE.match(p.name) and (p / "inductee.json").is_file()
    )
