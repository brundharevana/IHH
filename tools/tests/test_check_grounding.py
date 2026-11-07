"""Tests for tools/check_grounding.py (G6 deterministic part, SPEC sections 4 and 7)."""

import json

import check_grounding as cg
import factories as fx


def setup():
    w = fx.world()
    ctx = fx.context(w)
    facts = {f["id"]: f for f in w["facts"]}
    return w, facts, ctx.names


def failures_at(results, location):
    for r in results:
        if r.location == location:
            return r.failures
    raise KeyError(location)


def test_valid_profile_passes_everywhere():
    w, facts, names = setup()
    results = cg.check_profile(w["profile"], facts, names)
    assert results
    assert [r for r in results if r.failures] == []


def test_every_unit_is_reported():
    w, facts, names = setup()
    locations = {r.location for r in cg.check_profile(w["profile"], facts, names)}
    assert {
        "profile:summary:0",
        "profile:sections:work:title",
        "profile:sections:work:0",
        "profile:timeline:0",
        "profile:timeline:0:title",
        "profile:timeline:0:date",
        "profile:artifacts:0",
        "profile:avatar_lines:0",
        "profile:avatar_lines:1",
    } <= locations


def test_sentence_without_fact_ids_fails():
    w, facts, names = setup()
    w["profile"]["summary"][0]["fact_ids"] = []
    fails = failures_at(cg.check_profile(w["profile"], facts, names), "profile:summary:0")
    assert any("no fact ids" in x for x in fails)


def test_unknown_fact_id_fails():
    w, facts, names = setup()
    w["profile"]["summary"][0]["fact_ids"] = ["TST-F-0999"]
    fails = failures_at(cg.check_profile(w["profile"], facts, names), "profile:summary:0")
    assert any("TST-F-0999" in x for x in fails)


def test_cited_fact_must_be_verified():
    w, facts, names = setup()
    facts["TST-F-0002"]["status"] = "single-source"
    fails = failures_at(cg.check_profile(w["profile"], facts, names), "profile:summary:0")
    assert any("not verified" in x for x in fails)


def test_sentence_adding_a_year_fails():
    _, facts, names = setup()
    fails = cg.check_text("Test Person taught at Example College from 1950.", [facts["TST-F-0003"]], names)
    assert any("1950" in x for x in fails)


def test_sentence_adding_a_number_fails():
    _, facts, names = setup()
    fails = cg.check_text("Test Person taught at Example College for 13 years.", [facts["TST-F-0003"]], names)
    assert any("13" in x for x in fails)


def test_sentence_adding_a_name_fails():
    _, facts, names = setup()
    fails = cg.check_text("Test Person taught at Example College in Sampleville.", [facts["TST-F-0003"]], names)
    assert any("Sampleville" in x for x in fails)


def test_sentence_using_alias_passes():
    _, facts, names = setup()
    assert cg.check_text("Testa Q. Persona taught at Example College.", [facts["TST-F-0003"]], names) == []


def test_sentence_with_reformatted_date_passes():
    _, facts, names = setup()
    assert cg.check_text("On 10 June 1941, Test Person arrived at the Port of Example.",
                         [facts["TST-F-0002"]], names) == []


def test_quoted_text_matching_direct_quote_fact_passes():
    _, facts, names = setup()
    text = 'Test Person: "Example sentences are the best teachers."'
    assert cg.check_text(text, [facts["TST-F-0004"]], names) == []
    # The quote matches; the attribution verb is a word the cited quote fact does not
    # contain, so it needs a cited fact that says so (content-word rule, round 3).
    text = 'Test Person wrote: "Example sentences are the best teachers."'
    assert cg.check_text(text, [facts["TST-F-0004"]], names) == ["word 'wrote' not in cited claims"]


def test_quoted_fragment_of_direct_quote_fact_passes():
    _, facts, names = setup()
    text = "For Test Person, example sentences are \u201cthe best teachers.\u201d"
    assert cg.check_text(text, [facts["TST-F-0004"]], names) == []
    text = "Test Person called example sentences \u201cthe best teachers.\u201d"
    assert cg.check_text(text, [facts["TST-F-0004"]], names) == ["word 'called' not in cited claims"]


def test_fabricated_quoted_text_fails():
    _, facts, names = setup()
    text = 'Test Person wrote: "Example sentences are the only teachers."'
    fails = cg.check_text(text, [facts["TST-F-0004"]], names)
    assert any("quoted text" in x for x in fails)


def test_quoted_text_from_non_quote_fact_fails():
    _, facts, names = setup()
    text = 'Test Person "taught at Example College."'
    fails = cg.check_text(text, [facts["TST-F-0003"]], names)
    assert any("quoted text" in x for x in fails)


def test_avatar_quote_line_must_equal_direct_quote():
    w, facts, names = setup()
    line = w["profile"]["avatar_lines"][0]
    assert failures_at(cg.check_profile(w["profile"], facts, names), "profile:avatar_lines:0") == []
    line["text"] = "Example sentences are the best teachers I know."
    fails = failures_at(cg.check_profile(w["profile"], facts, names), "profile:avatar_lines:0")
    assert any("avatar quote" in x for x in fails)


def test_avatar_quote_line_citing_non_quote_fact_fails():
    w, facts, names = setup()
    w["profile"]["avatar_lines"][0] = {"speaker": "inductee", "kind": "quote",
                                       "text": "Test Person taught at Example College.",
                                       "fact_ids": ["TST-F-0003"]}
    fails = failures_at(cg.check_profile(w["profile"], facts, names), "profile:avatar_lines:0")
    assert any("avatar quote" in x for x in fails)


def test_section_title_is_grounded_on_section_facts():
    w, facts, names = setup()
    w["profile"]["sections"][0]["title"] = "Years at Sample University"
    fails = failures_at(cg.check_profile(w["profile"], facts, names), "profile:sections:work:title")
    assert any("Sample" in x for x in fails)


def test_timeline_title_and_date_checks():
    w, facts, names = setup()
    w["profile"]["timeline"][0]["date"] = "1942"
    fails = failures_at(cg.check_profile(w["profile"], facts, names), "profile:timeline:0:date")
    assert any("1942" in x for x in fails)

    w, facts, names = setup()
    w["profile"]["timeline"][0]["date"] = "June 1941"
    assert failures_at(cg.check_profile(w["profile"], facts, names), "profile:timeline:0:date") == []

    w, facts, names = setup()
    w["profile"]["timeline"][0]["title"] = "Arrival aboard the SS Sample"
    fails = failures_at(cg.check_profile(w["profile"], facts, names), "profile:timeline:0:title")
    assert any("Sample" in x for x in fails)


def test_artifact_caption_is_checked():
    w, facts, names = setup()
    w["profile"]["artifacts"][0]["caption"] = "Arrival record of Testa Q. Persona, signed in 1950."
    fails = failures_at(cg.check_profile(w["profile"], facts, names), "profile:artifacts:0")
    assert any("1950" in x for x in fails)


def test_cli_pass_fail_and_missing_draft(tmp_path, capsys):
    w = fx.world()
    root = fx.write_world(tmp_path, w)
    assert cg.main(["testperson", "--data-dir", str(tmp_path)]) == 0
    out = capsys.readouterr().out
    assert "PASS" in out

    profile = json.loads((root / "drafts" / "profile.json").read_text())
    profile["summary"][0]["text"] = "Test Person arrived at the Port of Example in 1950."
    (root / "drafts" / "profile.json").write_text(json.dumps(profile))
    assert cg.main(["testperson", "--data-dir", str(tmp_path)]) == 1
    out = capsys.readouterr().out
    assert "FAIL profile:summary:0" in out

    (root / "drafts" / "profile.json").unlink()
    assert cg.main(["testperson", "--data-dir", str(tmp_path)]) == 0


# --- the sentence adversary's verdicts (round 1 review) ----------------------------------------

def unit_at(profile, location):
    return next(u for u in cg.iter_units(profile) if u.location == location)


def test_unit_fingerprint_follows_text_and_cited_claims():
    w, facts, _ = setup()
    unit = unit_at(w["profile"], "profile:sections:work:0")
    cited = [facts["TST-F-0003"]]
    sha = cg.unit_sha256(unit, cited)
    assert sha == cg.unit_sha256(unit, cited)
    w["profile"]["sections"][0]["sentences"][0]["text"] = "Test Person was a famous genius."
    assert cg.unit_sha256(unit_at(w["profile"], "profile:sections:work:0"), cited) != sha
    changed = dict(facts["TST-F-0003"], claim="Test Person taught at Example College for years.")
    assert cg.unit_sha256(unit, [changed]) != sha


def test_verdict_state_requires_a_current_supported_verdict():
    w, facts, _ = setup()
    unit = unit_at(w["profile"], "profile:summary:0")
    cited = [facts["TST-F-0002"]]
    good = {"location": unit.location, "unit_sha256": cg.unit_sha256(unit, cited), "verdict": "supported",
            "adds_information": False}
    assert "no sentence-adversary verdict" in cg.verdict_problem(unit, cited, [])
    assert cg.verdict_problem(unit, cited, [good]) is None
    assert cg.verdict_problem(unit, cited, [dict(good, verdict="refuted")])
    assert cg.verdict_problem(unit, cited, [dict(good, adds_information=True)])
    stale = dict(good, unit_sha256="0" * 64)
    assert "changed" in cg.verdict_problem(unit, cited, [stale])
    # A verdict follows its text, not its position.
    moved = cg.Unit("profile:summary:3", unit.kind, unit.text, unit.fact_ids)
    assert cg.verdict_problem(moved, cited, [good]) is None
    other = cg.Unit(unit.location, unit.kind, "Test Person was deported.", unit.fact_ids)
    assert cg.verdict_problem(other, cited, [good])


def _cli(tmp_path, *args):
    return cg.main([fx.SLUG, "--data-dir", str(tmp_path), *args])


def test_record_writes_verdicts_tied_to_the_current_text(tmp_path, capsys):
    w = fx.world()
    w.pop("grounding", None)
    root = fx.write_world(tmp_path, w)
    assert _cli(tmp_path, "--json") == 0
    units = [json.loads(line) for line in capsys.readouterr().out.splitlines() if line.startswith("{")]
    summary = next(u for u in units if u["loc"] == "profile:summary:0")
    assert len(summary["unit_sha256"]) == 64 and summary["ok"] is True
    good = {"loc": "profile:summary:0", "verdict": "supported", "adds_information": False,
            "rationale": "none", "unit_sha256": summary["unit_sha256"]}
    stale = dict(good, loc="profile:sections:work:0", unit_sha256="0" * 64)
    missing = {k: v for k, v in good.items() if k != "unit_sha256"}
    missing["loc"] = "profile:timeline:0"
    path = tmp_path / "verdicts.jsonl"
    path.write_text("".join(json.dumps(r) + "\n" for r in (good, stale, missing)), encoding="utf-8")
    assert _cli(tmp_path, "--record", str(path), "--model", "claude:test", "--run-id", "run-g6") == 1
    out = capsys.readouterr().out
    assert "profile:sections:work:0" in out and "profile:timeline:0" in out
    rows = fx.read_rows(root / "drafts", "grounding")
    assert [r["location"] for r in rows] == ["profile:summary:0"]
    assert rows[0]["unit_sha256"] == summary["unit_sha256"] and rows[0]["model"] == "claude:test"
    assert rows[0]["run_id"] == "run-g6"


# --- content-word coverage (round 3) -------------------------------------------------------

def test_sentence_adding_any_content_word_fails():
    _, facts, names = setup()
    for text, word in [("Test Person was a renowned teacher at Example College.", "'renowned'"),
                       ("Test Person taught at Example College twice.", "'twice'"),
                       ("Later that decade, Test Person taught at Example College.", "'decade'"),
                       ("Test Person taught many students at Example College.", "'many'")]:
        fails = cg.check_text(text, [facts["TST-F-0003"]], names)
        assert any(word in x for x in fails), (text, fails)


def test_title_must_use_the_cited_claims_words():
    w, facts, names = setup()
    w["profile"]["sections"][0]["title"] = "Teaching career"
    fails = failures_at(cg.check_profile(w["profile"], facts, names), "profile:sections:work:title")
    assert any("'Teaching'" in x for x in fails) and any("'career'" in x for x in fails), fails
    w["profile"]["sections"][0]["title"] = "Taught at Example College"
    assert failures_at(cg.check_profile(w["profile"], facts, names), "profile:sections:work:title") == []
