"""Exports carry reviewer ROLES, never a person's name or email (owner privacy rule, Task 18 fix round 1).

The review store keeps who decided; the export (data/export/ and data/inductees/<slug>/export/), which goes
to IHH, says only the role: "project owner", "research agent", "controller", "Codex adversary", or
"reviewer (name withheld)".

Personal names are never written into a committed file. The names and emails to look for are committed as
SHA-256 hashes of their lowercased tokens (tools/tests/privacy_hashes.txt); every word and email token of
every export file is hashed and checked against them, so the check runs in any checkout. Extra plain terms
can be listed, one per line, in the untracked file .privacy-denylist at the repository root, or in the
environment variable IHH_PRIVACY_DENYLIST (comma-separated).
"""

import csv
import hashlib
import io
import json
import os
import re
from pathlib import Path

import export as ex
import factories as fx

ROLES = {"project owner", "research agent", "controller", "Codex adversary", "reviewer (name withheld)"}
REPO = Path(__file__).resolve().parents[2]
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
OWNER_PAREN = re.compile(r"owner \(")


HASHES = Path(__file__).with_name("privacy_hashes.txt")
TOKEN = re.compile(r"[a-z0-9]+(?:[._%+-][a-z0-9]+)*@[a-z0-9.-]+\.[a-z]{2,}|[a-z0-9]+")


def denied_hashes():
    return {l.strip() for l in HASHES.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")}


def hashed_hits(text):
    """How many distinct tokens of the text hash to a denied name or email."""
    denied = denied_hashes()
    return sum(1 for t in set(TOKEN.findall(text.lower())) if hashlib.sha256(t.encode()).hexdigest() in denied)


def denylist():
    terms = [t.strip() for t in os.environ.get("IHH_PRIVACY_DENYLIST", "").split(",")]
    local = REPO / ".privacy-denylist"
    if local.exists():
        terms += [t.strip() for t in local.read_text(encoding="utf-8").splitlines()]
    return [t for t in terms if t and not t.startswith("#")]


def export_dirs(data_dir):
    data_dir = Path(data_dir)
    out = [data_dir / "export"] + sorted(data_dir.glob("inductees/*/export"))
    return [d for d in out if d.is_dir()]


def problems(data_dir, extra_terms=()):
    """Every reviewer value that is not a role, every review note naming a person, every denylisted term."""
    out = []
    terms = list(extra_terms) + denylist()
    for d in export_dirs(data_dir):
        for f in sorted(p for p in d.iterdir() if p.is_file()):
            text = f.read_text(encoding="utf-8-sig")
            if hashed_hits(text):
                out.append(f"{f}: contains a name or email of the committed privacy list")
            for t in terms:
                if t.lower() in text.lower():
                    out.append(f"{f}: contains a denylisted term")
            if OWNER_PAREN.search(text):
                out.append(f"{f}: 'owner (' names a person")
            if f.suffix == ".csv":
                for row in csv.DictReader(io.StringIO(text)):
                    if row.get("reviewer") and row["reviewer"] not in ROLES:
                        out.append(f"{f} {row.get('id')}: reviewer {row['reviewer']!r} is not a role")
                    if EMAIL.search(row.get("review_note") or ""):
                        out.append(f"{f} {row.get('id')}: review note carries an email")
            if f.suffix == ".jsonld":
                for node in json.loads(text).get("@graph", []):
                    review = node.get("ihh:review") or {}
                    who = review.get("ihh:reviewer")
                    if who and who not in ROLES:
                        out.append(f"{f} {node.get('@id')}: reviewer {who!r} is not a role")
                    if EMAIL.search(review.get("ihh:note") or ""):
                        out.append(f"{f} {node.get('@id')}: review note carries an email")
    return out


def test_reviewer_role_mapping():
    assert ex.reviewer_role("owner (Jane Q. Example), instruction relayed by the dispatching session 2026-10-20") == "project owner"
    assert ex.reviewer_role("facts agent (evidence note only; decision left to the owner)") == "research agent"
    assert ex.reviewer_role("Claude agent") == "research agent"
    assert ex.reviewer_role("controller ruling") == "controller"
    assert ex.reviewer_role("codex:gpt-5.5") == "Codex adversary"
    assert ex.reviewer_role("Jane Q. Example") == "reviewer (name withheld)"
    assert ex.reviewer_role("jane.example@example.org") == "reviewer (name withheld)"
    assert ex.reviewer_role(None) is None


def test_export_writes_roles_not_names(tmp_path):
    w = fx.world()
    who = "owner (Jane Q. Example), instruction relayed by the dispatching session 2026-10-20"
    f = fx.by_id(w["facts"], "TST-F-0002")
    f["review"] = {"state": "approved", "reviewer": who, "date": "2026-10-20",
                   "note": f"2026-10-20 {who}: approved. Contact jane.example@example.org."}
    m = w["media"][0]
    m["review"] = {"state": "pending", "reviewer": "jane.example@example.org", "date": "2026-10-21",
                   "note": "2026-10-21 jane.example@example.org: looked at it."}
    fx.write_world(tmp_path, fx.back_reviews(w))
    assert ex.main(["--all", "--preview", "--data-dir", str(tmp_path)]) == 0
    found = problems(tmp_path, extra_terms=["Jane Q. Example", "jane.example@example.org"])
    assert found == []
    rows = {r["id"]: r for r in csv.DictReader(io.StringIO(
        (tmp_path / "inductees/testperson/export/facts.csv").read_text(encoding="utf-8-sig")))}
    assert rows["TST-F-0002"]["reviewer"] == "project owner"
    assert rows["TST-F-0002"]["review_note"].startswith("2026-10-20 project owner: approved.")


def test_shipped_exports_carry_roles_not_names():
    assert problems(REPO / "data") == []


def test_the_hashed_privacy_list_is_committed_and_used():
    # the check must not pass vacuously in a checkout without the local denylist
    assert len(denied_hashes()) >= 4
    planted = "x" * 7
    assert hashed_hits(f"a note by {planted}") == 0
    assert all(re.fullmatch(r"[0-9a-f]{64}", h) for h in denied_hashes())
