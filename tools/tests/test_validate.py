"""Tests for tools/validate.py (SPEC sections 3, 4, 5)."""

import json

import factories as fx
import validate as v


def run(tmp_path, w, mutate_files=None):
    root = fx.write_world(tmp_path, w)
    if mutate_files:
        mutate_files(root)
    return v.validate_inductee(v.paths.inductee_paths("testperson", tmp_path))


def errors(report, gate=None):
    return [m for g, m in report.errors if gate is None or g == gate]


def test_valid_package_has_no_errors(tmp_path):
    report = run(tmp_path, fx.world())
    assert report.errors == []


def test_cli_ok_and_summary(tmp_path, capsys):
    fx.write_world(tmp_path, fx.world())
    assert v.main(["testperson", "--data-dir", str(tmp_path)]) == 0
    out = capsys.readouterr().out
    for gate in ("SCHEMA", "IDS", "REFS", "G1", "G2", "G5", "G6", "G7", "G9", "G10", "STATUS", "EXPORT"):
        assert gate in out
    assert "OK" in out


def test_cli_fails_on_error(tmp_path, capsys):
    w = fx.world()
    w["sources"][0]["url"] = "http://archives.example.org/id/1"
    fx.write_world(tmp_path, w)
    assert v.main(["testperson", "--data-dir", str(tmp_path)]) == 1
    assert "FAIL" in capsys.readouterr().out


def test_cli_all(tmp_path):
    fx.write_world(tmp_path, fx.world())
    assert v.main(["--all", "--data-dir", str(tmp_path)]) == 0


def test_cli_unknown_slug_fails(tmp_path):
    fx.write_world(tmp_path, fx.world())
    assert v.main(["nobody", "--data-dir", str(tmp_path)]) != 0


# --- schema ---------------------------------------------------------------------

def test_source_schema(tmp_path):
    w = fx.world()
    w["sources"][0]["url"] = "http://archives.example.org/id/1"
    w["sources"][1]["accessed"] = "yesterday"
    w["sources"][2]["type"] = "blog"
    w["sources"][3]["title"] = ""
    msgs = errors(run(tmp_path, w), "SCHEMA")
    assert any("TST-S-0001" in m and "https" in m for m in msgs)
    assert any("TST-S-0002" in m and "accessed" in m for m in msgs)
    assert any("TST-S-0003" in m and "type" in m for m in msgs)
    assert any("TST-S-0004" in m and "title" in m for m in msgs)


def test_fact_schema(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["category"] = "gossip"
    f["status"] = "probably"
    f["event_date"] = "sometime"
    del f["evidence"]
    msgs = errors(run(tmp_path, w), "SCHEMA")
    for field in ("category", "status", "event_date", "evidence"):
        assert any("TST-F-0003" in m and field in m for m in msgs), field


def test_adversary_schema(tmp_path):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["adversary"]["quote_in_live"] = "maybe"
    msgs = errors(run(tmp_path, w), "SCHEMA")
    assert any("TST-F-0003" in m and "quote_in_live" in m for m in msgs)


def test_adversary_live_by_source_schema(tmp_path):
    from ihh import schema
    ok = [{"source_id": "TST-S-0002", "result": "found", "url": "https://library.example.net/test-person"},
          {"source_id": "TST-S-0003", "result": "unreachable", "url": "https://news.example.org/test-person"}]
    assert schema.live_by_source_problems(ok) == []
    assert schema.live_summary(ok) == "unreachable"
    bad = [{"source_id": "TST-S-0002", "result": "yes", "url": "nowhere"}, dict(ok[0]), {**ok[1], "x": 1}]
    problems = " | ".join(schema.live_by_source_problems(bad))
    for word in ("result", "url", "more than once", "unexpected key"):
        assert word in problems, word
    w = fx.world()
    a = fx.by_id(w["facts"], "TST-F-0003")["adversary"]
    a["live_by_source"] = ok
    a["quote_in_live"] = "yes"   # contradicts the per-source results
    msgs = errors(run(tmp_path / "a", w), "SCHEMA")
    assert any("TST-F-0003" in m and "summary of live_by_source" in m for m in msgs)
    a["quote_in_live"] = "unreachable"
    a["live_by_source"] = "found"
    msgs = errors(run(tmp_path / "b", w), "SCHEMA")
    assert any("TST-F-0003" in m and "live_by_source must be a list" in m for m in msgs)


def test_media_schema(tmp_path):
    w = fx.world()
    w["media"][0]["license_class"] = "free"
    w["media"][0]["media_type"] = "hologram"
    msgs = errors(run(tmp_path, w), "SCHEMA")
    assert any("TST-M-0001" in m and "license_class" in m for m in msgs)
    assert any("TST-M-0001" in m and "media_type" in m for m in msgs)


def test_reconstruction_needs_basis(tmp_path):
    w = fx.world()
    w["media"][0]["reconstruction"] = True
    w["media"][0]["reconstruction_basis"] = []
    msgs = errors(run(tmp_path, w), "SCHEMA")
    assert any("reconstruction_basis" in m for m in msgs)


def test_search_schema(tmp_path):
    w = fx.world()
    w["searches"][0]["date"] = ""
    w["searches"][0]["query"] = ""
    msgs = errors(run(tmp_path, w), "SCHEMA")
    assert any("TST-Q-0001" in m and "date" in m for m in msgs)
    assert any("TST-Q-0001" in m and "query" in m for m in msgs)


def test_inductee_schema(tmp_path):
    w = fx.world()
    w["inductee"]["code"] = "tst1"
    msgs = errors(run(tmp_path, w), "SCHEMA")
    assert any("code" in m for m in msgs)


def test_invalid_json_line_is_reported(tmp_path):
    def corrupt(root):
        with (root / "facts.jsonl").open("a", encoding="utf-8") as fh:
            fh.write("{not json\n")
    msgs = errors(run(tmp_path, fx.world(), corrupt), "SCHEMA")
    assert any("facts.jsonl" in m and "JSON" in m for m in msgs)


# --- ids ------------------------------------------------------------------------

def test_id_format_and_code(tmp_path):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0004")["id"] = "ABC-F-0004"
    msgs = errors(run(tmp_path, w), "IDS")
    assert any("ABC-F-0004" in m for m in msgs)


def test_duplicate_ids(tmp_path):
    w = fx.world()
    w["searches"].append(dict(w["searches"][0]))
    msgs = errors(run(tmp_path, w), "IDS")
    assert any("duplicate" in m and "TST-Q-0001" in m for m in msgs)


def test_duplicate_codes_across_inductees(tmp_path, capsys):
    fx.write_world(tmp_path, fx.world())
    other = fx.world()
    other["inductee"]["slug"] = "otherperson"
    other["profile"]["slug"] = "otherperson"
    for f in other["facts"]:
        f["inductee"] = "otherperson"
    fx.write_world(tmp_path, other)
    assert v.main(["--all", "--data-dir", str(tmp_path)]) == 1
    assert "TST" in capsys.readouterr().out


# --- references ---------------------------------------------------------------------

def test_unknown_evidence_source(tmp_path):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["evidence"][0]["source_id"] = "TST-S-0099"
    msgs = errors(run(tmp_path, w), "REFS")
    assert any("TST-S-0099" in m for m in msgs)


def test_unknown_media_source(tmp_path):
    w = fx.world()
    w["media"][0]["source_ids"] = ["TST-S-0099"]
    msgs = errors(run(tmp_path, w), "REFS")
    assert any("TST-M-0001" in m and "TST-S-0099" in m for m in msgs)


def test_dangling_used_in(tmp_path):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["used_in"] = ["profile:timeline:7"]
    msgs = errors(run(tmp_path, w), "REFS")
    assert any("TST-F-0003" in m and "profile:timeline:7" in m for m in msgs)


def test_used_in_location_must_cite_the_fact(tmp_path):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["used_in"] = ["profile:summary:0"]
    msgs = errors(run(tmp_path, w), "REFS")
    assert any("TST-F-0003" in m and "profile:summary:0" in m for m in msgs)


def test_draft_unknown_fact_and_media_ids(tmp_path):
    w = fx.world()
    w["profile"]["timeline"][0]["media_ids"] = ["TST-M-0009"]
    w["profile"]["artifacts"][0]["media_id"] = "TST-M-0008"
    msgs = errors(run(tmp_path, w), "REFS")
    assert any("TST-M-0009" in m for m in msgs)
    assert any("TST-M-0008" in m for m in msgs)


def test_review_decision_unknown_item(tmp_path):
    def add_decision(root):
        rec = {"date": fx.TODAY, "reviewer": "Test Reviewer", "item_id": "TST-F-0999",
               "action": "approve", "before": None, "after": None, "note": ""}
        (root / "review" / "decisions.jsonl").write_text(json.dumps(rec) + "\n")
    msgs = errors(run(tmp_path, fx.world(), add_decision), "REFS")
    assert any("TST-F-0999" in m for m in msgs)


def test_snapshot_file_missing(tmp_path):
    def drop(root):
        (root / "snapshots" / "TST-S-0004.txt").unlink()
    report = run(tmp_path, fx.world(), drop)
    assert any("TST-S-0004" in m for m in errors(report, "SNAPSHOT"))


# --- gates and status -------------------------------------------------------------------

def test_g1_failure_is_an_error(tmp_path):
    def tamper(root):
        path = root / "snapshots" / "TST-S-0004.txt"
        path.write_text(path.read_text().replace("best", "worst"))
    report = run(tmp_path, fx.world(), tamper)
    assert any("TST-F-0004" in m for m in errors(report, "G1"))


def test_g1_failure_on_rejected_fact_is_not_an_error(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["evidence"][0]["quote"] = "a quote that is not there"
    f["status"] = "rejected"
    f["verified_claim_sha256"] = None
    f["used_in"] = []
    w["profile"]["sections"] = []
    assert errors(run(tmp_path, w), "G1") == []


def test_g2_failure_is_an_error(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["claim"] = "Test Person taught at Example College in 1950."
    report = run(tmp_path, w)
    assert any("TST-F-0003" in m and "1950" in m for m in errors(report, "G2"))


def test_g7_failure_is_an_error(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["claim"] = "Test Person taught at Example College for 13 years."
    f["evidence"][1]["quote"] = "taught at Example College for 13 years"
    report = run(tmp_path, w)
    assert any("TST-F-0003" in m for m in errors(report, "G7"))


def test_banned_source_is_an_error(tmp_path):
    w = fx.world()
    w["sources"][2]["url"] = "https://en.wikipedia.org/wiki/Test_Person"
    report = run(tmp_path, w)
    assert any("TST-S-0003" in m for m in errors(report, "G9"))


def test_stored_status_mismatch_is_reported(tmp_path):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["adversary"]["verdict"] = "refuted"
    report = run(tmp_path, w)
    msgs = errors(report, "STATUS")
    assert any("TST-F-0003" in m and "disputed" in m for m in msgs)


def test_verified_without_hash_is_reported(tmp_path):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0001")["verified_claim_sha256"] = None
    msgs = errors(run(tmp_path, w), "STATUS")
    assert any("TST-F-0001" in m for m in msgs)


def test_disputed_fact_is_not_an_error(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0001")
    f["adversary"]["verdict"] = "refuted"
    f["status"] = "disputed"
    f["verified_claim_sha256"] = None
    report = run(tmp_path, w)
    assert report.errors == []


def test_grounding_failure_is_an_error(tmp_path):
    w = fx.world()
    w["profile"]["summary"][0]["text"] = "Test Person arrived at the Port of Example in 1950."
    assert any("profile:summary:0" in m for m in errors(run(tmp_path, w), "G6"))


# --- export rules -------------------------------------------------------------------------

def test_used_in_on_unverified_fact_is_an_error(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["adversary"]["verdict"] = "refuted"
    f["status"] = "disputed"
    f["verified_claim_sha256"] = None
    msgs = errors(run(tmp_path, w), "EXPORT")
    assert any("TST-F-0003" in m and "verified" in m for m in msgs)


def test_draft_media_must_be_verified(tmp_path):
    w = fx.world()
    m = w["media"][0]
    m["adversary"] = None
    m["status"] = "pending"
    m["verified_claim_sha256"] = None
    msgs = errors(run(tmp_path, w), "EXPORT")
    assert any("TST-M-0001" in m for m in msgs)


def test_restricted_media_in_artifacts_is_a_warning(tmp_path):
    w = fx.world()
    m = w["media"][0]
    m["license_class"] = "rights-restricted"
    from ihh import gates
    m["verified_claim_sha256"] = gates.media_lock_sha256(m)
    fx.restamp(w)  # the adversary judged the item with this licence
    report = run(tmp_path, w)
    assert report.errors == []
    assert any("TST-M-0001" in msg and "link" in msg for _, msg in report.warnings)


def test_unsupported_alias_is_a_warning(tmp_path):
    w = fx.world()
    w["inductee"]["aliases"].append("Tessie Exemplar")
    report = run(tmp_path, w)
    assert report.errors == []
    assert any("Tessie Exemplar" in msg for _, msg in report.warnings)


# --- G8 human review ------------------------------------------------------------------------

def test_decided_review_needs_reviewer_and_date(tmp_path):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["review"] = {"state": "approved", "reviewer": None, "date": None,
                                                    "note": ""}
    msgs = errors(run(tmp_path, w), "SCHEMA")
    assert any("TST-F-0003" in m and "review.reviewer" in m for m in msgs)
    assert any("TST-F-0003" in m and "review.date" in m for m in msgs)


def test_approved_verified_fact_is_clean(tmp_path):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["review"] = {"state": "approved", "reviewer": "Test Reviewer",
                                                    "date": fx.TODAY, "note": ""}
    fx.back_reviews(w)  # the approval is recorded in review/decisions.jsonl (G8)
    report = run(tmp_path, w)
    assert report.errors == []
    assert not any("TST-F-0003" in msg for _, msg in report.warnings)


def test_approved_but_unverified_fact_is_a_warning(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0001")
    f["adversary"]["verdict"] = "refuted"
    f["status"] = "disputed"
    f["verified_claim_sha256"] = None
    f["review"] = {"state": "approved", "reviewer": "Test Reviewer", "date": fx.TODAY, "note": ""}
    fx.back_reviews(w)
    report = run(tmp_path, w)
    assert report.errors == []
    assert any("TST-F-0001" in msg and "not be exported" in msg for _, msg in report.warnings)


# --- robustness -----------------------------------------------------------------------------

def test_malformed_records_are_reported_not_crashed(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f.update(evidence=5, extractor="x", adversary="y", used_in="profile:summary:0", review="z", claim=7,
             verified_claim_sha256=None)
    w["media"][0].update(source_ids=3, reconstruction_basis=4, adversary="q", alt_text=None)
    w["searches"][0]["produced"] = 9
    w["sources"][1]["institution"] = ["not", "text"]
    w["inductee"]["aliases"] = "Testa Q. Persona"
    w["profile"]["summary"] = [{"text": 5, "fact_ids": "TST-F-0002"}, "not an object"]
    w["profile"]["timeline"][0]["media_ids"] = 7
    root = fx.write_world(tmp_path, w)
    report = v.validate_inductee(v.paths.inductee_paths("testperson", tmp_path))
    msgs = errors(report, "SCHEMA")
    for field in ("evidence", "extractor", "adversary", "used_in", "review", "claim", "source_ids",
                  "reconstruction_basis", "produced", "institution", "aliases"):
        assert any(field in m for m in msgs), field
    import compute_status as cs
    assert cs.main(["testperson", "--data-dir", str(tmp_path)]) == 0
    assert fx.by_id(fx.read_rows(root, "facts"), "TST-F-0003")["status"] == "pending"


# --- snapshot provenance (round 1 review) ------------------------------------------

def _rewrite_meta(root, sid, **changes):
    path = root / "snapshots" / f"{sid}.meta.json"
    meta = json.loads(path.read_text(encoding="utf-8"))
    meta.update(changes)
    path.write_text(json.dumps(meta), encoding="utf-8")


def test_meta_from_an_unrelated_page_is_an_error_and_unverifies(tmp_path, capsys):
    import compute_status
    other = "https://unrelated.example.org/other-page"
    report = run(tmp_path, fx.world(),
                 lambda root: _rewrite_meta(root, "TST-S-0001", url=other, fetch_url=other))
    assert any("meta url" in m for m in errors(report, "SNAPSHOT"))
    assert compute_status.main(["testperson", "--data-dir", str(tmp_path)]) == 0
    f2 = fx.by_id(fx.read_rows(tmp_path / "inductees" / "testperson", "facts"), "TST-F-0002")
    assert f2["status"] == "pending"


def test_meta_fetch_url_from_an_unrelated_page_is_an_error(tmp_path):
    report = run(tmp_path, fx.world(),
                 lambda root: _rewrite_meta(root, "TST-S-0001", fetch_url="https://unrelated.example.org/x"))
    assert any("meta fetch_url" in m for m in errors(report, "SNAPSHOT"))


# --- G8: an approval must be on record (round 1 review) -------------------------------------

def _approve(rec, reviewer="Test Reviewer", day=fx.TODAY):
    rec["review"] = {"state": "approved", "reviewer": reviewer, "date": day, "note": ""}


def _write_decisions(root, rows):
    (root / "review" / "decisions.jsonl").write_text("".join(json.dumps(r) + "\n" for r in rows),
                                                     encoding="utf-8")


def test_approval_without_a_recorded_decision_is_an_error(tmp_path):
    w = fx.world()
    for rec in w["facts"] + w["media"]:
        _approve(rec, reviewer="Claude agent")
    report = run(tmp_path, w)
    msgs = errors(report, "G8")
    assert any("TST-F-0003" in m and "decisions.jsonl" in m for m in msgs)
    assert any("TST-M-0001" in m for m in msgs)


def test_approval_backed_by_a_matching_decision_is_clean(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    _approve(f)
    decision = {"date": fx.TODAY, "reviewer": "Test Reviewer", "item_id": "TST-F-0003", "action": "approve",
                "before": f["claim"], "after": None, "note": ""}
    report = run(tmp_path, w, lambda root: _write_decisions(root, [decision]))
    assert errors(report, "G8") == []


def test_approval_of_other_wording_or_by_another_reviewer_is_an_error(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    _approve(f)
    rows = [{"date": fx.TODAY, "reviewer": "Test Reviewer", "item_id": "TST-F-0003", "action": "approve",
             "before": "Test Person studied at Example College.", "after": None, "note": ""}]
    assert errors(run(tmp_path / "a", w, lambda root: _write_decisions(root, rows)), "G8")
    rows = [{"date": fx.TODAY, "reviewer": "Someone Else", "item_id": "TST-F-0003", "action": "approve",
             "before": f["claim"], "after": None, "note": ""}]
    assert errors(run(tmp_path / "b", w, lambda root: _write_decisions(root, rows)), "G8")
    rows = [{"date": fx.TODAY, "reviewer": "Test Reviewer", "item_id": "TST-F-0003", "action": "approve",
             "before": f["claim"], "after": None, "note": ""},
            {"date": fx.TODAY, "reviewer": "Test Reviewer", "item_id": "TST-F-0003", "action": "reject",
             "before": f["claim"], "after": None, "note": ""}]
    assert errors(run(tmp_path / "c", w, lambda root: _write_decisions(root, rows)), "G8")


def test_edited_state_needs_an_edit_decision_with_the_current_claim(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["review"] = {"state": "edited", "reviewer": "Test Reviewer", "date": fx.TODAY, "note": ""}
    good = [{"date": fx.TODAY, "reviewer": "Test Reviewer", "item_id": "TST-F-0003", "action": "edit",
             "before": "Test Person worked at Example College.", "after": f["claim"], "note": ""}]
    assert errors(run(tmp_path / "a", w, lambda root: _write_decisions(root, good)), "G8") == []
    bad = [dict(good[0], after="Test Person taught at Example College for decades.")]
    assert errors(run(tmp_path / "b", w, lambda root: _write_decisions(root, bad)), "G8")


# --- sentence-adversary verdicts (round 1 review) ----------------------------------------------

def test_unjudged_draft_units_are_noted_and_bad_verdict_rows_are_errors(tmp_path):
    w = fx.world()
    w["profile"]["sections"][0]["sentences"][0]["text"] = "Test Person was a famous genius."
    w["grounding"].append({"location": "profile:summary:7", "unit_sha256": "x", "model": "m", "run_id": "r",
                           "date": fx.TODAY, "verdict": "maybe", "adds_information": "no", "rationale": ""})
    report = run(tmp_path, w)
    assert any("profile:sections:work:0" in m and "sentence adversary" in m for g, m in report.notes if g == "G6")
    schema = errors(report, "SCHEMA")
    assert any("grounding.jsonl" in m and "verdict" in m for m in schema)
    assert any("profile:summary:7" in m for g, m in report.warnings if g == "REFS")


def test_near_duplicate_institutions_are_a_warning(tmp_path):
    w = fx.world()
    w["sources"][2]["institution"] = "Example Universty Library"  # typo of S-0002 Example University Library
    fx.restamp(w)
    report = run(tmp_path, w)
    assert any("TST-F-0003" in m and "same holder" in m for g, m in report.warnings if g == "G5")


# --- G8: approvals are bound to the content reviewed (round 2 review) -----------------------------

def _approve_all_on_record(w):
    for rec in w["facts"] + w["media"]:
        _approve(rec)
    return fx.back_reviews(w)


def test_approval_decision_without_before_does_not_back_a_fact(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    _approve(f)
    rows = [{"date": fx.TODAY, "reviewer": "Test Reviewer", "item_id": "TST-F-0003", "action": "approve",
             "before": None, "after": None, "note": ""}]
    msgs = errors(run(tmp_path, w, lambda root: _write_decisions(root, rows)), "G8")
    assert any("TST-F-0003" in m and "before" in m for m in msgs), msgs


def test_reworded_claim_is_not_published_on_an_approval_without_before(tmp_path):
    import compute_status
    import export
    w = _approve_all_on_record(fx.world())
    for row in w["decisions"]:
        row["before"] = None  # as a dashboard might write review/decisions.jsonl
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["claim"] = "Test Person was teaching at Example College."
    f["verified_claim_sha256"] = fx.normalize.claim_sha256(f["claim"])
    fx.restamp(w)  # a legitimate re-verification of the new wording
    fx.ground(w)
    root = fx.write_world(tmp_path, w)
    assert compute_status.main(["testperson", "--data-dir", str(tmp_path)]) == 0
    report = v.validate_inductee(v.paths.inductee_paths("testperson", tmp_path))
    assert any("TST-F-0003" in m for m in errors(report, "G8"))
    assert export.main(["testperson", "--data-dir", str(tmp_path)]) == 1
    html = root / "export" / "wordpress.html"
    assert not html.exists() or "was teaching" not in html.read_text(encoding="utf-8")


def test_media_approval_is_bound_to_the_reviewed_content(tmp_path):
    w = _approve_all_on_record(fx.world())
    assert errors(run(tmp_path / "a", w), "G8") == []
    m = w["media"][0]
    m["alt_text"] = "Typed arrival record of Testa Q. Persona (TST-F-0002)."
    m["verified_claim_sha256"] = fx.gates.media_lock_sha256(m)
    fx.restamp(w)  # re-verified, but no reviewer saw the new alt text
    msgs = errors(run(tmp_path / "b", w), "G8")
    assert any("TST-M-0001" in msg for msg in msgs), msgs


def test_media_approval_without_the_content_hash_is_an_error(tmp_path):
    w = fx.world()
    _approve(w["media"][0])
    rows = [{"date": fx.TODAY, "reviewer": "Test Reviewer", "item_id": "TST-M-0001", "action": "approve",
             "before": None, "after": None, "note": ""}]
    msgs = errors(run(tmp_path, w, lambda root: _write_decisions(root, rows)), "G8")
    assert any("TST-M-0001" in m for m in msgs), msgs


# --- fetch_url on another site (round 2 review) -----------------------------------------------------

def test_fetch_url_on_another_site_is_an_error_and_unverifies(tmp_path):
    import compute_status
    w = fx.world()
    w["sources"][2]["fetch_url"] = "https://blog.unrelated.example.net/some-post"  # S-0003, http
    for f in w["facts"]:
        if f.get("adversary"):
            f["adversary"]["quote_in_live"] = "unreachable"
    fx.restamp(w)
    report = run(tmp_path, w)
    assert any("TST-S-0003" in m and "not the cited record" in m for m in errors(report, "SNAPSHOT")), report.errors
    assert compute_status.main(["testperson", "--data-dir", str(tmp_path)]) == 0
    f3 = fx.by_id(fx.read_rows(tmp_path / "inductees" / "testperson", "facts"), "TST-F-0003")
    assert f3["status"] != "verified"


# --- Class B and C at the package level ------------------------------------------------------------

def test_primary_source_on_an_unregistered_host_is_an_error_and_unverifies(tmp_path):
    import compute_status
    w = fx.world()
    w["sources"][3].update(url="https://letters.example.com/4", institution="Example Letters")  # S-0004 primary
    fx.restamp(w)
    report = run(tmp_path, w)
    assert any("TST-S-0004" in m and "authority registry" in m for m in errors(report, "G9")), report.errors
    assert compute_status.main(["testperson", "--data-dir", str(tmp_path)]) == 0
    f4 = fx.by_id(fx.read_rows(tmp_path / "inductees" / "testperson", "facts"), "TST-F-0004")
    assert f4["status"] == "pending"


def test_fact_citing_a_media_only_source_is_an_error(tmp_path):
    w = fx.world()
    w["sources"][2].update(url="https://commons.example.org/wiki/File:T.jpg", institution="Example Commons")
    w["sources"][2]["fetch_url"] = None
    fx.restamp(w)
    report = run(tmp_path, w)
    assert any("TST-F-0003" in m and "media" in m for m in errors(report, "G9")), report.errors


def test_snapshot_meta_naming_another_record_is_an_error(tmp_path):
    w = fx.world()
    root = fx.write_world(tmp_path, w)
    meta_path = root / "snapshots" / "TST-S-0002.meta.json"  # browser snapshot
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    meta["fetch_url"] = "https://library.example.net/someone-else"
    meta_path.write_text(json.dumps(meta), encoding="utf-8")
    report = v.validate_inductee(v.paths.inductee_paths("testperson", tmp_path))
    assert any("TST-S-0002" in m and "not the cited record" in m for m in errors(report, "SNAPSHOT")), \
        report.errors


def test_the_shipped_inductee_data_validates():
    for slug in v.paths.list_slugs():
        report = v.validate_inductee(v.paths.inductee_paths(slug))
        assert report.errors == [], (slug, report.errors)
