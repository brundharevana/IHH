"""Rules added after the first real pipeline run (Einstein, run einstein-2026-10-09).

Each section states the rule, then tests every place it is enforced.

1. Write boundary: every record is schema-validated at the moment it is written,
   so a bad record can never land (ihh/schema.py, enforced in ihh/records.py and
   checked up front by every multi-file writer).
2. Adversary source type: the adversary judges source type by the same registry
   rule the gates use; a publisher that could be registered is a separate,
   optional registry_suggestion, never a failed fact.
3. Visitor facts: a fact of category identity establishes a name the inductee
   was known by (G11: its claim contains an alias from inductee.json); anything
   else about a catalogue record is provenance.
4. primary_document is derived, never authored: true when an evidence item cites
   a source of type primary (gates.primary_document).
All data is the clearly fake package from factories.py.
"""

import json

import pytest

import adversary as adv
import apply_review
import compute_status as cs
import export
import factories as fx
import fetch_snapshot as fs
import merge_staging as ms
import validate
from ihh import gates, paths, records, schema

RUN2 = "run-test-2"


def world_on_disk(tmp_path, w=None):
    w = w or fx.world()
    root = fx.write_world(tmp_path, w)
    return w, root, paths.inductee_paths(fx.SLUG, tmp_path)


def write_lines(path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(json.dumps(r) + "\n" for r in rows), encoding="utf-8")
    return path


def search_row(rid, results, notes=""):
    return {"id": rid, "date": fx.TODAY, "family": "loc", "tool": "Example search API", "query": "test person",
            "results": results, "produced": [], "agent": "search-loc", "run_id": RUN2, "notes": notes}


def staged_fact(tid, claim, category, evidence, **extra):
    rec = fx.fact(tid, claim, category, evidence, adversary=None, status="pending", **extra)
    rec["extractor"]["run_id"] = RUN2
    return rec


# --- 1. write boundary ------------------------------------------------------------------------

def test_search_with_free_text_results_cannot_be_written(tmp_path):
    _, root, p = world_on_disk(tmp_path)
    before = p.searches.read_bytes()
    rows = fx.read_rows(root, "searches") + [search_row("TST-Q-0002", "10 results, mostly arXiv")]
    with pytest.raises(records.SchemaError) as err:
        records.write_jsonl(p.searches, rows)
    message = str(err.value)
    assert "TST-Q-0002" in message and "results" in message and "notes" in message
    assert p.searches.read_bytes() == before


def test_update_jsonl_is_checked_too(tmp_path):
    _, _, p = world_on_disk(tmp_path)
    before = p.facts.read_bytes()

    def break_category(rows):
        rows[2]["category"] = "biography"
        return rows
    with pytest.raises(records.SchemaError, match="TST-F-0003: category"):
        records.update_jsonl(p.facts, break_category)
    assert p.facts.read_bytes() == before


@pytest.mark.parametrize("name, mutate, expected", [
    ("sources", lambda r: r[0].update(type="museum"), "TST-S-0001: type"),
    ("media", lambda r: r[0].update(license_class="free"), "TST-M-0001: license_class"),
    ("facts", lambda r: r[1].update(primary_document="yes"), "TST-F-0002: primary_document"),
])
def test_every_main_record_file_is_checked(tmp_path, name, mutate, expected):
    _, root, p = world_on_disk(tmp_path)
    rows = fx.read_rows(root, name)
    mutate(rows)
    with pytest.raises(records.SchemaError, match=expected):
        records.write_jsonl(root / f"{name}.jsonl", rows)


def test_decisions_grounding_inductee_and_profile_are_checked(tmp_path):
    _, root, p = world_on_disk(tmp_path)
    with pytest.raises(records.SchemaError, match="action"):
        records.write_jsonl(p.decisions, [{"date": fx.TODAY, "reviewer": "R", "item_id": "TST-F-0001",
                                           "action": "maybe", "before": None, "after": None, "note": ""}])
    with pytest.raises(records.SchemaError, match="verdict"):
        records.write_jsonl(p.grounding, [{"location": "profile:summary:0", "unit_sha256": "0" * 64,
                                           "model": "m", "run_id": None, "date": fx.TODAY, "verdict": "fine",
                                           "adds_information": False, "rationale": ""}])
    inductee = json.loads(p.inductee_json.read_text(encoding="utf-8"))
    inductee["aliases"] = "Testa Q. Persona"
    with pytest.raises(records.SchemaError, match="aliases"):
        records.write_json(p.inductee_json, inductee)
    profile = json.loads(p.profile.read_text(encoding="utf-8"))
    profile["timeline"][0]["date"] = "June 1941"
    with pytest.raises(records.SchemaError, match="date"):
        records.write_json(p.profile, profile)


def test_a_record_already_on_file_may_not_get_worse_and_does_not_block_other_writes(tmp_path):
    # The rule is about what lands. A row that landed before the check (or by hand) does not block
    # writes of other rows, and may be rewritten without a new problem (a tool updating a derived
    # field); any new problem is refused. validate.py keeps reporting the old one.
    w = fx.world()
    w["searches"].append(search_row("TST-Q-0002", "10 results, legacy"))
    _, root, p = world_on_disk(tmp_path, w)
    rows = fx.read_rows(root, "searches") + [search_row("TST-Q-0003", 4)]
    records.write_jsonl(p.searches, rows)
    assert [r["id"] for r in fx.read_rows(root, "searches")][-1] == "TST-Q-0003"
    rows[1]["notes"] = "touched"
    records.write_jsonl(p.searches, rows)
    rows[1]["results"] = "11 results"
    with pytest.raises(records.SchemaError, match="TST-Q-0002: results"):
        records.write_jsonl(p.searches, rows)
    rows[1]["results"] = 10
    rows[1]["date"] = "yesterday"
    with pytest.raises(records.SchemaError, match="TST-Q-0002: date"):
        records.write_jsonl(p.searches, rows)


def test_staging_files_and_other_folders_are_not_main_records(tmp_path):
    _, root, p = world_on_disk(tmp_path)
    records.write_jsonl(p.staging / "loc.searches.jsonl", [search_row(None, "free text")])
    records.write_jsonl(tmp_path / "facts.jsonl", [{"id": "x"}])
    assert paths.record_kind(p.staging / "searches.jsonl") is None
    assert paths.record_kind(p.facts) == "fact"
    assert paths.record_kind(p.decisions) == "decision"


def test_schema_is_the_one_validate_uses(tmp_path):
    w = fx.world()
    w["searches"].append(search_row("TST-Q-0002", "10 results"))
    _, _, p = world_on_disk(tmp_path, w)
    report = validate.validate_inductee(p)
    expected = schema.record_problems("search", w["searches"][-1], slug=fx.SLUG)[0]
    assert expected and all(("SCHEMA", e) in report.errors for e in expected)


def test_merge_refuses_a_staged_search_with_free_text_results(tmp_path, capsys):
    _, root, p = world_on_disk(tmp_path)
    write_lines(p.staging / "loc.searches.jsonl", [search_row("tmp-loc-Q-1", "10 results, mostly arXiv")])
    before = {n: (root / n).read_bytes() for n in ("searches.jsonl", "inductee.json")}
    assert ms.main([fx.SLUG, "--data-dir", str(tmp_path)]) == 1
    err = capsys.readouterr().err
    assert "tmp-loc-Q-1" in err and "loc.searches.jsonl" in err and "results" in err and "notes" in err
    assert {n: (root / n).read_bytes() for n in before} == before
    assert (p.staging / "loc.searches.jsonl").is_file()


def test_merge_refuses_any_candidate_that_breaks_the_schema_and_writes_nothing(tmp_path, capsys):
    _, root, p = world_on_disk(tmp_path)
    bad = staged_fact("tmp-loc-F-1", "Test Person arrived in the United States in June 1941.", "immigration",
                      [("TST-S-0002", "arrived in the United States in June 1941")])
    bad["event_date"] = "around 1950"
    good_search = search_row("tmp-loc-Q-1", 1)
    write_lines(p.staging / "loc.jsonl", [bad])
    write_lines(p.staging / "loc.searches.jsonl", [good_search])
    before = {n: (root / n).read_bytes() for n in ("facts.jsonl", "searches.jsonl")}
    assert ms.main([fx.SLUG, "--data-dir", str(tmp_path)]) == 1
    assert "tmp-loc-F-1" in capsys.readouterr().err
    assert {n: (root / n).read_bytes() for n in before} == before


def test_apply_review_checks_every_file_before_writing_any(tmp_path, monkeypatch):
    w = fx.world()
    _, root, p = world_on_disk(tmp_path, w)
    decisions = write_lines(tmp_path / "d.jsonl", [
        {"date": fx.TODAY, "reviewer": "Reviewer", "item_id": "TST-F-0003", "action": "reject",
         "before": None, "after": None, "note": "test"},
        {"date": fx.TODAY, "reviewer": "Reviewer", "item_id": "TST-M-0001", "action": "reject",
         "before": None, "after": None, "note": "test"},
    ])
    real = apply_review.apply_decisions

    def corrupt_media(facts, media, decisions):
        new_facts, new_media, outcomes = real(facts, media, decisions)
        new_media[0]["license_class"] = "free"
        return new_facts, new_media, outcomes
    monkeypatch.setattr(apply_review, "apply_decisions", corrupt_media)
    before = {n: (root / n).read_bytes() for n in ("facts.jsonl", "media.jsonl")}
    assert apply_review.main([fx.SLUG, str(decisions), "--data-dir", str(tmp_path)]) == 1
    assert {n: (root / n).read_bytes() for n in before} == before


def test_fetch_snapshot_refuses_an_invalid_source_update_before_writing_the_snapshot(tmp_path, capsys):
    w = fx.world()
    src = fx.source("TST-S-0005", "Example record for Test Person", "Example Publisher", "secondary",
                    "https://example.org/test-person")
    w["sources"].append(src)
    _, root, p = world_on_disk(tmp_path, w)
    sources_before = p.sources.read_bytes()

    def save_and_break(rec):
        rec["published"] = "sometime"
        return rec
    page = tmp_path / "page.txt"
    page.write_text("Test Person taught at Example College for many years.\n", encoding="utf-8")
    real = fs._updated
    fs._updated = lambda *a, **k: save_and_break(real(*a, **k))
    try:
        code = fs.main([fx.SLUG, "TST-S-0005", "--from-file", str(page), "--method", "browser",
                        "--data-dir", str(tmp_path)])
    finally:
        fs._updated = real
    assert code == 1
    assert "published" in capsys.readouterr().err
    assert p.sources.read_bytes() == sources_before
    assert not (root / "snapshots" / "TST-S-0005.txt").exists()
    assert not (root / "snapshots" / "TST-S-0005.meta.json").exists()


def test_adversary_skips_a_record_that_breaks_the_schema(tmp_path):
    w = fx.world()
    for f in w["facts"]:
        f["adversary"], f["status"], f["verified_claim_sha256"] = None, "pending", None
    fx.by_id(w["facts"], "TST-F-0003")["event_date"] = "around 1950"
    _, root, _ = world_on_disk(tmp_path, w)
    items, skipped = adv.select_items(w["facts"], [], fx.context(w), root)
    assert "TST-F-0003" not in [i.id for i in items]
    assert any(rid == "TST-F-0003" and "schema" in reason for rid, reason in skipped)


# --- 2. adversary source-type rule --------------------------------------------------------------

def pending_items(tmp_path, w, wanted):
    for f in w["facts"]:
        f["adversary"], f["status"], f["verified_claim_sha256"] = None, "pending", None
    root = fx.write_world(tmp_path, w)
    items, _ = adv.select_items(w["facts"], w["media"], fx.context(w), root, wanted)
    return items


def test_prompt_states_the_registry_rule_and_each_source_standing(tmp_path):
    w = fx.world()
    items = pending_items(tmp_path, w, {"TST-F-0003"})
    prompt = adv.build_prompt(items, w["inductee"], cwd=tmp_path, registry=fx.registry(w))
    # The registry standing of each source, as the gates read it.
    # Example University Library is a university with no original-record paths: institutional at most.
    assert "registry: listed as Example University Library; allowed types here: institutional, secondary" in prompt
    assert "registry: not listed; allowed type here: secondary only (by rule)" in prompt
    # The rule itself: unregistered is secondary however authoritative it looks; never fail a fact for it.
    assert "a publisher not in the authority registry is secondary by rule" in prompt
    assert "registry_suggestion" in prompt
    assert "source_type_ok is false only if" in prompt


def test_fallback_requests_carry_the_same_registry_rule(tmp_path):
    w = fx.world()
    for f in w["facts"]:
        f["adversary"], f["status"], f["verified_claim_sha256"] = None, "pending", None
    root = fx.write_world(tmp_path / "data", w)
    p = paths.inductee_paths(fx.SLUG, tmp_path / "data")
    assert adv.main([fx.SLUG, "--data-dir", str(tmp_path / "data"), "--ids", "TST-F-0003",
                     "--engine", "claude-handoff"]) == 3
    req = json.loads((root / adv.REQUESTS_FILE).read_text(encoding="utf-8").splitlines()[0])
    assert "registry: not listed; allowed type here: secondary only (by rule)" in req["prompt"]
    assert "registry_suggestion" in req["prompt"]
    assert p.root == root


def test_registry_suggestion_is_optional_and_recorded():
    schema_ = adv.output_schema(["A-F-0001"])
    item = schema_["properties"]["verdicts"]["items"]
    assert item["properties"]["registry_suggestion"] == {"type": ["string", "null"]}
    base = {"id": "A-F-0001", "verdict": "supported", "quote_in_snapshot": True,
            "live_by_source": [{"source_id": "A-S-0001", "result": "found", "url": "https://a.example.org/"}],
            "entailed": True, "adds_information": False, "atomic": True, "source_type_ok": True,
            "rationale": "no problem found"}
    got, problems = adv.parse_output(json.dumps({"verdicts": [base]}), ["A-F-0001"])
    assert problems == [] and got["A-F-0001"]["registry_suggestion"] is None
    text = json.dumps({"verdicts": [{**base, "registry_suggestion": "fi.edu: The Franklin Institute"}]})
    got, problems = adv.parse_output(text, ["A-F-0001"])
    assert problems == [] and got["A-F-0001"]["registry_suggestion"] == "fi.edu: The Franklin Institute"
    got, problems = adv.parse_output(json.dumps({"verdicts": [{**base, "registry_suggestion": 3}]}), ["A-F-0001"])
    assert got is None and any("registry_suggestion" in x for x in problems)
    rec = adv.adversary_record("codex:m", "r", fx.TODAY, {**base, "registry_suggestion": "  "}, "0" * 64)
    assert rec["registry_suggestion"] is None


def test_a_registry_suggestion_does_not_fail_the_fact(tmp_path):
    w = fx.world()
    f3 = fx.by_id(w["facts"], "TST-F-0003")
    f3["adversary"]["registry_suggestion"] = "news.example.org could be registered as Example News"
    _, _, p = world_on_disk(tmp_path, fx.restamp(w))
    cs.run(p)
    assert fx.by_id(fx.read_rows(p.root, "facts"), "TST-F-0003")["status"] == "verified"
    assert validate.validate_inductee(p).errors == []


def test_review_checklist_shows_a_registry_suggestion(tmp_path):
    w = fx.world()
    f3 = fx.by_id(w["facts"], "TST-F-0003")
    f3["adversary"]["registry_suggestion"] = "news.example.org: Example News, institutional"
    _, root, p = world_on_disk(tmp_path, fx.restamp(w))
    assert export.main([fx.SLUG, "--data-dir", str(tmp_path), "--preview"]) == 0
    review = (root / "export" / "REVIEW.md").read_text(encoding="utf-8")
    assert "registry suggestion" in review and "news.example.org: Example News, institutional" in review


def test_registry_suggestion_must_be_text_in_the_record():
    adversary = fx.adversary(registry_suggestion=["fi.edu"])
    fact = fx.fact("TST-F-0009", "Test Person taught at Example College.", "career",
                   [("TST-S-0002", "taught at Example College")], adversary=adversary)
    errors, _ = schema.record_problems("fact", fact, slug=fx.SLUG)
    assert any("registry_suggestion" in e for e in errors)


# --- 3. identity facts establish names (G11) -----------------------------------------------------

def identity_fact(claim, quote):
    return fx.fact("TST-F-0009", claim, "identity", [("TST-S-0002", quote)])


def test_g11_identity_fact_must_name_an_alias():
    ctx = fx.context(fx.world())
    assert gates.g11_identity(fx.by_id(fx.world()["facts"], "TST-F-0001"), ctx) == []
    metadata = identity_fact("Test Person's U.S. Name is Test Person.", "Test Person")
    assert gates.g11_identity(metadata, ctx)
    assert "alias" in gates.g11_identity(metadata, ctx)[0]
    other = fx.fact("TST-F-0009", "Test Person taught at Example College.", "career",
                    [("TST-S-0002", "taught at Example College")])
    assert gates.g11_identity(other, ctx) == []


def test_g11_is_a_rule_on_names_not_a_list_of_words():
    # The same catalogue words pass when the claim names an alias, and fail when it does not.
    ctx = fx.context(fx.world())
    assert gates.g11_identity(identity_fact("Testa Q. Persona is a heading.", "Testa Q. Persona"), ctx) == []
    assert gates.g11_identity(identity_fact("Test Person is a heading.", "Test Person"), ctx)


def test_g11_failure_keeps_a_fact_pending_and_fails_validate(tmp_path):
    w = fx.world()
    f = identity_fact("Test Person was born.", "Test Person (born")
    w["facts"].append(f)
    _, root, p = world_on_disk(tmp_path, fx.restamp(w))
    cs.run(p)
    assert fx.by_id(fx.read_rows(root, "facts"), "TST-F-0009")["status"] == "pending"
    report = validate.validate_inductee(p)
    assert any(g == "G11" and "TST-F-0009" in m for g, m in report.errors)


def test_g11_does_not_apply_to_a_withdrawn_or_rejected_fact(tmp_path):
    w = fx.world()
    f = identity_fact("Test Person was born.", "Test Person (born")
    f["extractor"]["verdict"] = "withdrawn"
    f["notes"] = "Withdrawn by the critic: catalogue metadata, not a visitor fact."
    w["facts"].append(f)
    _, _, p = world_on_disk(tmp_path, fx.restamp(w))
    cs.run(p)
    assert fx.by_id(fx.read_rows(p.root, "facts"), "TST-F-0009")["status"] == "rejected"
    report = validate.validate_inductee(p)
    assert not any(g == "G11" for g, _ in report.errors)


def test_adversary_skips_a_g11_failure(tmp_path):
    w = fx.world()
    w["facts"].append(identity_fact("Test Person was born.", "Test Person (born"))
    items = pending_items(tmp_path, w, None)
    assert "TST-F-0009" not in [i.id for i in items]


# --- 4. primary_document is derived ------------------------------------------------------------

def test_primary_document_follows_the_evidence_source_types():
    w = fx.world()
    sources = gates.by_id(w["sources"])
    assert gates.primary_document(fx.by_id(w["facts"], "TST-F-0002"), sources) is True
    assert gates.primary_document(fx.by_id(w["facts"], "TST-F-0003"), sources) is False


def test_merge_sets_primary_document_from_the_cited_source(tmp_path, capsys):
    _, root, p = world_on_disk(tmp_path)
    a = staged_fact("tmp-nara-F-1", "Testa Q. Persona arrived at the Port of Example.", "immigration",
                    [("TST-S-0001", "Arrived at the Port of Example")], primary_document=False)
    b = staged_fact("tmp-nara-F-2", "Test Person arrived in the United States in June 1941.", "immigration",
                    [("TST-S-0002", "arrived in the United States in June 1941")], primary_document=True)
    write_lines(p.staging / "nara.jsonl", [a, b])
    assert ms.main([fx.SLUG, "--data-dir", str(tmp_path)]) == 0
    facts = fx.read_rows(root, "facts")
    assert fx.by_id(facts, "TST-F-0005")["primary_document"] is True
    assert fx.by_id(facts, "TST-F-0006")["primary_document"] is False
    out = capsys.readouterr().out
    assert "primary_document" in out


def test_compute_status_keeps_primary_document_derived_without_staling_the_verdict(tmp_path):
    w = fx.world()
    f2 = fx.by_id(w["facts"], "TST-F-0002")
    f2["primary_document"] = False
    _, root, p = world_on_disk(tmp_path, fx.restamp(w))
    assert any("TST-F-0002" in m and "primary_document" in m for _, m in validate.validate_inductee(p).warnings)
    cs.run(p)
    after = fx.by_id(fx.read_rows(root, "facts"), "TST-F-0002")
    assert after["primary_document"] is True and after["status"] == "verified"
    report = validate.validate_inductee(p)
    assert report.errors == [] and not any("primary_document" in m for _, m in report.warnings)
    assert cs.run(p).changes == []
