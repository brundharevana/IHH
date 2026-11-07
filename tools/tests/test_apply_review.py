"""Tests for tools/apply_review.py (SPEC sections 4 (G8), 6, 8)."""

import json

import apply_review as ar
import factories as fx
import validate
from ihh import paths

REVIEWER = "Test Reviewer"
DAY = "2026-10-09"


def world():
    """The standard fake package plus one verified fact that no draft uses."""
    w = fx.world()
    w["facts"].append(fx.fact(
        "TST-F-0005", "Test Person taught at Example College for 13 years.", "career",
        [("TST-S-0003", "taught at Example College for 13 years"), ("TST-S-0002", "taught at Example College")]))
    return w


def decision(item_id, action, before=None, after=None, note="", **extra):
    rec = {"date": DAY, "reviewer": REVIEWER, "item_id": item_id, "action": action,
           "before": before, "after": after, "note": note}
    rec.update(extra)
    return rec


def setup(tmp_path, w=None):
    return fx.write_world(tmp_path, w or world())


def write_decisions(tmp_path, rows, name="decisions.jsonl"):
    path = tmp_path / name
    path.write_text("".join(json.dumps(r) + "\n" for r in rows), encoding="utf-8")
    return path


def run(tmp_path, decisions_path, *args):
    return ar.main(["testperson", str(decisions_path), *args, "--data-dir", str(tmp_path)])


def fact(root, fid):
    return fx.by_id(fx.read_rows(root, "facts"), fid)


def log_rows(root):
    path = root / "review" / "decisions.jsonl"
    if not path.exists():
        return []
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]


def report(tmp_path):
    return validate.validate_inductee(paths.inductee_paths("testperson", tmp_path))


# --- approve -----------------------------------------------------------------------------

def test_approve_verified_fact(tmp_path):
    root = setup(tmp_path)
    path = write_decisions(tmp_path, [decision("TST-F-0003", "approve", note="Checked against the source.")])
    assert run(tmp_path, path) == 0
    review = fact(root, "TST-F-0003")["review"]
    assert review == {"state": "approved", "reviewer": REVIEWER, "date": DAY, "note": "Checked against the source."}
    assert fact(root, "TST-F-0003")["status"] == "verified"
    logged = log_rows(root)
    assert len(logged) == 1
    assert logged[0]["item_id"] == "TST-F-0003" and logged[0]["action"] == "approve"
    assert logged[0]["before"] == "Test Person taught at Example College."
    assert list(logged[0]) == ["date", "reviewer", "item_id", "action", "before", "after", "note"]
    assert report(tmp_path).errors == []


def test_approve_media(tmp_path):
    root = setup(tmp_path)
    path = write_decisions(tmp_path, [decision("TST-M-0001", "approve")])
    assert run(tmp_path, path) == 0
    assert fx.read_rows(root, "media")[0]["review"]["state"] == "approved"


def test_approve_refused_when_not_verified(tmp_path, capsys):
    w = world()
    f = fx.by_id(w["facts"], "TST-F-0005")
    f["adversary"] = fx.adversary(verdict="refuted", rationale="The source gives no duration.")
    f["status"] = "disputed"
    f["verified_claim_sha256"] = None
    root = setup(tmp_path, w)
    before = (root / "facts.jsonl").read_bytes()
    path = write_decisions(tmp_path, [decision("TST-F-0003", "approve"), decision("TST-F-0005", "approve")])
    assert run(tmp_path, path) == 1
    assert "disputed" in capsys.readouterr().err
    assert (root / "facts.jsonl").read_bytes() == before  # all or nothing
    assert log_rows(root) == []


def test_approve_refused_when_claim_changed_since_review(tmp_path, capsys):
    root = setup(tmp_path)
    before = (root / "facts.jsonl").read_bytes()
    path = write_decisions(tmp_path, [decision("TST-F-0003", "approve", before="Test Person taught at a college.")])
    assert run(tmp_path, path) == 1
    assert "changed" in capsys.readouterr().err
    assert (root / "facts.jsonl").read_bytes() == before


# --- edit ----------------------------------------------------------------------------------

def test_edit_drops_fact_to_reverification(tmp_path, capsys):
    root = setup(tmp_path)
    old = "Test Person taught at Example College for 13 years."
    new = "Test Person taught at Example College for thirteen years."
    path = write_decisions(tmp_path, [decision("TST-F-0005", "edit", before=old, after=new, note="Spell out.")])
    assert run(tmp_path, path) == 0
    f = fact(root, "TST-F-0005")
    assert f["claim"] == new
    assert f["review"] == {"state": "edited", "reviewer": REVIEWER, "date": DAY, "note": "Spell out."}
    assert f["adversary"] is None
    assert f["verified_claim_sha256"] is None
    assert f["status"] == "pending"
    assert old in f["notes"] and "supported" in f["notes"]
    assert log_rows(root)[0]["after"] == new
    assert "re-verification" in capsys.readouterr().out
    assert report(tmp_path).errors == []


def test_edit_of_fact_used_in_draft_warns(tmp_path, capsys):
    root = setup(tmp_path)
    edit = decision("TST-F-0003", "edit", after="Test Person taught at Example College for 13 years.")
    path = write_decisions(tmp_path, [edit])
    assert run(tmp_path, path) == 0
    out = capsys.readouterr().out
    assert "profile:sections:work:0" in out
    assert fact(root, "TST-F-0003")["status"] == "pending"


def test_edit_with_stale_before_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    before = (root / "facts.jsonl").read_bytes()
    path = write_decisions(tmp_path, [decision("TST-F-0005", "edit", before="Something else.", after="New text.")])
    assert run(tmp_path, path) == 1
    assert (root / "facts.jsonl").read_bytes() == before


def test_edit_needs_new_text(tmp_path):
    setup(tmp_path)
    path = write_decisions(tmp_path, [decision("TST-F-0005", "edit", after="  ")])
    assert run(tmp_path, path) == 1


def test_edit_of_media_alt_text_drops_it_to_reverification(tmp_path, capsys):
    # a media item's description (alt text) can be corrected; like a fact edit, its verdict is cleared
    # and it is no longer verified until the adversary judges the new text; rights are untouched
    root = setup(tmp_path)
    m0 = fx.by_id(fx.read_rows(root, "media"), "TST-M-0001")
    path = write_decisions(tmp_path, [decision("TST-M-0001", "edit", before=m0["alt_text"], after="New caption",
                                               note="The frame shows someone else.")])
    assert run(tmp_path, path) == 0
    m = fx.by_id(fx.read_rows(root, "media"), "TST-M-0001")
    assert m["alt_text"] == "New caption"
    assert m["adversary"] is None and m["verified_claim_sha256"] is None
    assert m["status"] != "verified"
    assert m["review"]["state"] == "edited"
    assert m0["alt_text"] in m["notes"]
    for k in ("license_class", "rights_statement", "title", "url", "source_ids"):
        assert m[k] == m0[k]
    assert log_rows(root)[0]["before"] == m0["alt_text"] and log_rows(root)[0]["after"] == "New caption"


def test_edit_of_media_with_stale_before_is_refused(tmp_path):
    root = setup(tmp_path)
    before = (root / "media.jsonl").read_bytes()
    path = write_decisions(tmp_path, [decision("TST-M-0001", "edit", before="Not the alt text.", after="New caption")])
    assert run(tmp_path, path) == 1
    assert (root / "media.jsonl").read_bytes() == before


def test_edit_of_rejected_fact_is_refused(tmp_path):
    w = world()
    f = fx.by_id(w["facts"], "TST-F-0005")
    f["status"], f["verified_claim_sha256"] = "rejected", None
    f["review"] = {"state": "rejected", "reviewer": REVIEWER, "date": DAY, "note": ""}
    setup(tmp_path, w)
    path = write_decisions(tmp_path, [decision("TST-F-0005", "edit", after="Test Person taught.")])
    assert run(tmp_path, path) == 1


def test_edit_of_conflicting_fact_reopens_it(tmp_path):
    w = world()
    f = fx.by_id(w["facts"], "TST-F-0005")
    f["status"], f["verified_claim_sha256"] = "conflicting", None
    root = setup(tmp_path, w)
    path = write_decisions(tmp_path, [decision("TST-F-0005", "edit", after="Test Person taught at Example College.")])
    assert run(tmp_path, path) == 0
    assert fact(root, "TST-F-0005")["status"] == "pending"


# --- reject and note --------------------------------------------------------------------------------

def test_reject(tmp_path):
    root = setup(tmp_path)
    path = write_decisions(tmp_path, [decision("TST-F-0005", "reject", note="Duration not needed.")])
    assert run(tmp_path, path) == 0
    f = fact(root, "TST-F-0005")
    assert f["status"] == "rejected"
    assert f["verified_claim_sha256"] is None
    assert f["review"]["state"] == "rejected"
    assert report(tmp_path).errors == []


def test_note_keeps_state_and_accumulates(tmp_path):
    root = setup(tmp_path)
    path = write_decisions(tmp_path, [decision("TST-F-0003", "note", note="Check the college name."),
                                      decision("TST-F-0003", "note", note="Second look.", reviewer="Other Reviewer")])
    assert run(tmp_path, path) == 0
    review = fact(root, "TST-F-0003")["review"]
    assert review["state"] == "pending"
    assert f"{DAY} {REVIEWER}: Check the college name." in review["note"]
    assert f"{DAY} Other Reviewer: Second look." in review["note"]


def test_note_needs_text(tmp_path):
    setup(tmp_path)
    assert run(tmp_path, write_decisions(tmp_path, [decision("TST-F-0003", "note", note="")])) == 1


# --- input checks, idempotency ---------------------------------------------------------------------------

def test_unknown_item_and_bad_fields_are_refused(tmp_path):
    root = setup(tmp_path)
    before = (root / "facts.jsonl").read_bytes()
    for bad in (decision("TST-F-0099", "approve"),
                decision("TST-F-0003", "publish"),
                decision("TST-F-0003", "approve", reviewer=""),
                decision("TST-F-0003", "approve", date="yesterday"),
                decision("TST-S-0001", "approve")):
        assert run(tmp_path, write_decisions(tmp_path, [bad])) == 1
    assert (root / "facts.jsonl").read_bytes() == before


def test_invalid_json_is_refused(tmp_path):
    setup(tmp_path)
    path = tmp_path / "decisions.jsonl"
    path.write_text("{oops\n", encoding="utf-8")
    assert run(tmp_path, path) == 1


def test_reapplying_the_same_file_changes_nothing(tmp_path, capsys):
    root = setup(tmp_path)
    path = write_decisions(tmp_path, [
        decision("TST-F-0003", "approve"),
        decision("TST-F-0005", "edit", after="Test Person taught at Example College for thirteen years."),
        decision("TST-M-0001", "reject"),
        decision("TST-F-0001", "note", note="Fine."),
    ])
    assert run(tmp_path, path) == 0
    snap = {n: (root / n).read_bytes() for n in ("facts.jsonl", "media.jsonl", "review/decisions.jsonl")}
    capsys.readouterr()
    assert run(tmp_path, path) == 0
    assert "already applied" in capsys.readouterr().out
    assert {n: (root / n).read_bytes() for n in snap} == snap


def test_applying_the_review_log_itself_does_not_duplicate_it(tmp_path):
    root = setup(tmp_path)
    log = root / "review" / "decisions.jsonl"
    log.write_text(json.dumps(decision("TST-F-0003", "approve")) + "\n", encoding="utf-8")
    before = log.read_bytes()
    assert run(tmp_path, log) == 0
    assert log.read_bytes() == before
    assert fact(root, "TST-F-0003")["review"]["state"] == "approved"


def test_later_decision_wins(tmp_path):
    root = setup(tmp_path)
    path = write_decisions(tmp_path, [decision("TST-F-0005", "approve"), decision("TST-F-0005", "reject")])
    assert run(tmp_path, path) == 0
    assert fact(root, "TST-F-0005")["status"] == "rejected"


def test_dry_run_writes_nothing(tmp_path):
    root = setup(tmp_path)
    before = (root / "facts.jsonl").read_bytes()
    assert run(tmp_path, write_decisions(tmp_path, [decision("TST-F-0003", "approve")]), "--dry-run") == 0
    assert (root / "facts.jsonl").read_bytes() == before
    assert log_rows(root) == []


# --- approvals name the content reviewed (round 2 review) -------------------------------------------

def test_media_approval_logs_the_media_lock_and_is_backed(tmp_path):
    root = setup(tmp_path)
    assert run(tmp_path, write_decisions(tmp_path, [decision("TST-M-0001", "approve")])) == 0
    m = fx.read_rows(root, "media")[0]
    assert log_rows(root)[0]["before"] == fx.gates.media_lock_sha256(m)
    assert report(tmp_path).errors == []


def test_media_approval_of_changed_content_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    before = (root / "media.jsonl").read_bytes()
    path = write_decisions(tmp_path, [decision("TST-M-0001", "approve", before="0" * 64)])
    assert run(tmp_path, path) == 1
    assert "changed" in capsys.readouterr().err
    assert (root / "media.jsonl").read_bytes() == before


def test_applying_the_review_log_warns_about_approvals_without_before(tmp_path, capsys):
    root = setup(tmp_path)
    log = root / "review" / "decisions.jsonl"
    log.write_text(json.dumps(decision("TST-F-0003", "approve")) + "\n", encoding="utf-8")
    assert run(tmp_path, log) == 0
    assert "no `before`" in capsys.readouterr().out
    assert any(g == "G8" and "TST-F-0003" in m for g, m in report(tmp_path).errors)


def test_applying_the_review_log_with_before_is_backed(tmp_path, capsys):
    root = setup(tmp_path)
    log = root / "review" / "decisions.jsonl"
    log.write_text(json.dumps(decision("TST-F-0003", "approve", before="Test Person taught at Example College."))
                   + "\n", encoding="utf-8")
    assert run(tmp_path, log) == 0
    assert "no `before`" not in capsys.readouterr().out
    assert report(tmp_path).errors == []


def test_edited_media_is_backed_by_its_edit_and_not_after_a_later_change(tmp_path):
    # G8: an edited media item publishes only while the edit on record names its current alt text
    from ihh import review as rv
    root = setup(tmp_path)
    m0 = fx.by_id(fx.read_rows(root, "media"), "TST-M-0001")
    path = write_decisions(tmp_path, [decision("TST-M-0001", "edit", before=m0["alt_text"], after="New caption")])
    assert run(tmp_path, path) == 0
    m = fx.by_id(fx.read_rows(root, "media"), "TST-M-0001")
    assert rv.backing_problems(m, "media", log_rows(root)) == []
    m["alt_text"] = "Changed again by hand"
    assert any("other alt text" in p for p in rv.backing_problems(m, "media", log_rows(root)))
