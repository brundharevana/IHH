"""Tests for tools/handoff_bundle.py: the review package handed to IHH (copies only, never the store)."""

import hashlib
import json
import zipfile
from pathlib import Path

import export as ex
import factories as fx
import handoff_bundle as hb

DATE = "2026-11-04"
EXPORTS = ("wordpress.html", "facts.csv", "sources.csv", "media.csv", "searches.csv", "provenance.jsonld")
TOUR = ("tour-research.jsonld", "tour.csv")


def store(tmp_path, preview=True):
    """A fake inductee with a preview export on disk; returns its folder."""
    root = fx.write_world(tmp_path, fx.back_reviews(fx.world()))
    args = ["testperson", "--data-dir", str(tmp_path)] + (["--preview"] if preview else [])
    assert ex.main(args) == 0
    return root


def bundle(tmp_path, *extra, out=None):
    out = out or (tmp_path / "handoff")
    return hb.main(["testperson", "--data-dir", str(tmp_path), "--out", str(out), "--date", DATE, *extra])


def folder(tmp_path):
    return tmp_path / "handoff" / f"testperson-{DATE}"


def tree_hashes(root):
    return {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(Path(root).rglob("*")) if p.is_file()}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


# --- contents -------------------------------------------------------------------------------------

def test_bundle_holds_the_review_package(tmp_path):
    store(tmp_path)
    assert bundle(tmp_path) == 0
    names = {p.name for p in folder(tmp_path).iterdir()}
    assert names == {"README-FOR-IHH.md", "REVIEW.md", "CHECK-BY-HAND.md", "MANIFEST.json", *EXPORTS}


def test_export_files_are_byte_identical_copies(tmp_path):
    root = store(tmp_path)
    assert bundle(tmp_path) == 0
    for name in EXPORTS + ("REVIEW.md",):
        assert (folder(tmp_path) / name).read_bytes() == (root / "export" / name).read_bytes(), name


def test_tour_exports_are_copied_when_present(tmp_path):
    root = store(tmp_path)
    (root / "export" / "tour-research.jsonld").write_text('{"@context": {}}\n', encoding="utf-8")
    (root / "export" / "tour.csv").write_text("chapter,fact\n", encoding="utf-8")
    assert bundle(tmp_path) == 0
    for name in TOUR:
        assert (folder(tmp_path) / name).read_bytes() == (root / "export" / name).read_bytes()
    listed = {f["path"] for f in json.loads((folder(tmp_path) / "MANIFEST.json").read_text())["files"]}
    assert set(TOUR) <= listed


def test_tour_exports_absent_are_not_listed(tmp_path):
    store(tmp_path)
    assert bundle(tmp_path) == 0
    listed = {f["path"] for f in json.loads((folder(tmp_path) / "MANIFEST.json").read_text())["files"]}
    assert not set(TOUR) & listed


def test_manifest_hashes_every_other_file(tmp_path):
    store(tmp_path)
    assert bundle(tmp_path) == 0
    man = json.loads((folder(tmp_path) / "MANIFEST.json").read_text(encoding="utf-8"))
    assert man["slug"] == "testperson" and man["date"] == DATE
    files = {f["path"]: f for f in man["files"]}
    on_disk = {p.name for p in folder(tmp_path).iterdir()} - {"MANIFEST.json"}
    assert set(files) == on_disk
    for name, f in files.items():
        path = folder(tmp_path) / name
        assert f["sha256"] == sha(path)
        assert f["bytes"] == path.stat().st_size


def test_the_store_is_never_modified(tmp_path):
    root = store(tmp_path)
    before = tree_hashes(tmp_path / "inductees")
    reg = sha(tmp_path / "registry" / "institutions.json")
    assert bundle(tmp_path, "--zip") == 0
    assert tree_hashes(tmp_path / "inductees") == before
    assert sha(tmp_path / "registry" / "institutions.json") == reg
    assert root.is_dir()


# --- refusals -------------------------------------------------------------------------------------

def test_refuses_without_an_export(tmp_path, capsys):
    fx.write_world(tmp_path, fx.world())
    assert bundle(tmp_path) == 1
    assert "export.py" in capsys.readouterr().err
    assert not (tmp_path / "handoff").exists()


def test_refuses_an_existing_bundle_unless_forced(tmp_path, capsys):
    store(tmp_path)
    assert bundle(tmp_path) == 0
    (folder(tmp_path) / "REVIEW.md").write_text("changed\n", encoding="utf-8")
    assert bundle(tmp_path) == 1
    assert "exists" in capsys.readouterr().err
    assert (folder(tmp_path) / "REVIEW.md").read_text() == "changed\n"
    assert bundle(tmp_path, "--force") == 0
    assert (folder(tmp_path) / "REVIEW.md").read_text() != "changed\n"


def test_unknown_inductee_is_a_usage_error(tmp_path):
    store(tmp_path)
    assert hb.main(["nobody", "--data-dir", str(tmp_path), "--out", str(tmp_path / "h"), "--date", DATE]) == 2


def test_refuses_a_file_holding_an_email_address(tmp_path, capsys):
    root = store(tmp_path)
    review = root / "export" / "REVIEW.md"
    review.write_text(review.read_text(encoding="utf-8") + "\nContact: someone@example.org\n", encoding="utf-8")
    assert bundle(tmp_path) == 1
    assert "email" in capsys.readouterr().err
    assert not folder(tmp_path).exists()


def test_a_holder_address_quoted_in_a_snapshot_may_pass(tmp_path):
    """A rights statement copied verbatim from a holder's page can name the holder's contact address."""
    root = store(tmp_path)
    snap = sorted((root / "snapshots").glob("*.txt"))[0]
    text = snap.read_text(encoding="utf-8")
    assert "archives@example.org" not in text
    review = root / "export" / "REVIEW.md"
    review.write_text(review.read_text(encoding="utf-8") + "\nPermissions: archives@example.org\n", encoding="utf-8")
    assert bundle(tmp_path) == 1
    snap.write_bytes((text + "Write to archives@example.org for permissions.\n").encode("utf-8"))
    assert bundle(tmp_path) == 0


def test_a_named_institutional_address_may_pass_and_is_recorded(tmp_path):
    root = store(tmp_path)
    review = root / "export" / "REVIEW.md"
    review.write_text(review.read_text(encoding="utf-8") + "\nSee archives@example.net\n", encoding="utf-8")
    assert bundle(tmp_path) == 1
    assert bundle(tmp_path, "--allow-email", "other@example.net") == 1
    assert bundle(tmp_path, "--allow-email", "Archives@example.net") == 0
    man = json.loads((folder(tmp_path) / "MANIFEST.json").read_text(encoding="utf-8"))
    assert man["allowed_emails"] == ["archives@example.net"]


def test_an_allowed_address_never_enters_the_files_the_tool_writes(tmp_path):
    root = store(tmp_path)
    (root / "staging" / "check-by-hand.jsonl").write_text(json.dumps({
        "date": DATE, "run_id": "r", "host": "x.example.net", "url": "https://x.example.net/a",
        "what": "write to archives@example.net", "reason": "HTTP 403"}) + "\n", encoding="utf-8")
    assert bundle(tmp_path, "--allow-email", "archives@example.net") == 1


def test_a_denied_personal_token_is_refused_even_from_a_snapshot(tmp_path, capsys, monkeypatch):
    root = store(tmp_path)
    monkeypatch.setattr(hb.polite, "load_hashes", lambda *a: frozenset({hashlib.sha256(b"zyxwname").hexdigest()}))
    review = root / "export" / "REVIEW.md"
    review.write_text(review.read_text(encoding="utf-8") + "\nReviewer: Zyxwname\n", encoding="utf-8")
    assert bundle(tmp_path) == 1
    assert "personal" in capsys.readouterr().err


# --- zip --------------------------------------------------------------------------------------------

def test_zip_next_to_the_folder_holds_the_same_files(tmp_path):
    store(tmp_path)
    assert bundle(tmp_path, "--zip") == 0
    zpath = tmp_path / "handoff" / f"testperson-{DATE}.zip"
    with zipfile.ZipFile(zpath) as z:
        assert z.testzip() is None
        names = sorted(z.namelist())
        assert names == sorted(f"testperson-{DATE}/{p.name}" for p in folder(tmp_path).iterdir())
        for n in names:
            assert z.read(n) == (tmp_path / "handoff" / n).read_bytes()


def test_zip_is_reproducible(tmp_path):
    store(tmp_path)
    assert bundle(tmp_path, "--zip") == 0
    zpath = tmp_path / "handoff" / f"testperson-{DATE}.zip"
    first = zpath.read_bytes()
    assert bundle(tmp_path, "--zip", "--force") == 0
    assert zpath.read_bytes() == first


# --- check by hand ----------------------------------------------------------------------------------

def test_check_by_hand_lists_blocked_hosts_and_deferred_sources(tmp_path):
    root = store(tmp_path)
    run = root / "staging" / "tour" / "testperson-2026-11-04"
    run.mkdir(parents=True)
    (run / "run.json").write_text(json.dumps({
        "run_id": "testperson-2026-11-04",
        "blocked_hosts": {"blocked.example.org": "HTTP 403 Forbidden"},
        "deferred": [{"source": "tmp-x-S-1", "reason": "blocked: HTTP 403", "removed": ["tmp-x-S-1", "tmp-x-F-1"]}],
        "snapshots": [{"source": "tmp-x-S-2", "host": "shell.example.org", "result": "js-shell", "date": DATE}],
        "failures": [], "refused": []}), encoding="utf-8")
    dfold = root / "staging" / "deferred-testperson-2026-11-04"
    dfold.mkdir()
    (dfold / "x.jsonl").write_text(json.dumps({"id": "tmp-x-S-1", "title": "A blocked page",
                                               "url": "https://blocked.example.org/item/1"}) + "\n", encoding="utf-8")
    (root / "staging" / "check-by-hand.jsonl").write_text(json.dumps({
        "date": DATE, "run_id": "testperson-2026-11-04", "host": "manual.example.net",
        "url": "https://manual.example.net/page", "what": "A page the maintainer could not fetch",
        "reason": "HTTP 429"}) + "\n", encoding="utf-8")
    assert bundle(tmp_path) == 0
    text = (folder(tmp_path) / "CHECK-BY-HAND.md").read_text(encoding="utf-8")
    for want in ("blocked.example.org", "HTTP 403 Forbidden", "tmp-x-S-1", "https://blocked.example.org/item/1",
                 "shell.example.org", "manual.example.net", "https://manual.example.net/page", "HTTP 429"):
        assert want in text, want


def test_check_by_hand_says_so_when_nothing_was_deferred(tmp_path):
    store(tmp_path)
    assert bundle(tmp_path) == 0
    text = (folder(tmp_path) / "CHECK-BY-HAND.md").read_text(encoding="utf-8")
    assert "Nothing" in text


# --- readme and summary -----------------------------------------------------------------------------

def test_readme_is_plain_english_for_the_review_team(tmp_path):
    store(tmp_path)
    assert bundle(tmp_path) == 0
    text = (folder(tmp_path) / "README-FOR-IHH.md").read_text(encoding="utf-8")
    assert "Test Person" in text
    for want in ("REVIEW.md", "wordpress.html", "Code editor", "provenance.jsonld", "chatbot",
                 "CHECK-BY-HAND.md", "MANIFEST.json", "approve"):
        assert want in text, want
    assert "preview" in text.lower() and "do not publish" in text.lower()
    assert "author" not in text.lower()
    assert "@" not in text


def test_readme_of_a_final_export_does_not_call_it_a_preview(tmp_path):
    store(tmp_path, preview=False)
    assert bundle(tmp_path) == 0
    text = (folder(tmp_path) / "README-FOR-IHH.md").read_text(encoding="utf-8")
    assert "This is a preview" not in text


def test_summary_prints_counts(tmp_path, capsys):
    store(tmp_path)
    capsys.readouterr()
    assert bundle(tmp_path) == 0
    out = json.loads(capsys.readouterr().out)
    w = fx.world()
    for status in ("verified", "single-source", "disputed", "rejected"):
        assert out["facts"][status] == sum(1 for f in w["facts"] if f["status"] == status)
    classes = {}
    for m in w["media"]:
        if m["status"] != "rejected":
            classes[m["license_class"]] = classes.get(m["license_class"], 0) + 1
    assert out["media_by_licence"] == classes
    assert out["deferred_hosts"] == []
    assert out["bundle"].endswith(f"testperson-{DATE}")
