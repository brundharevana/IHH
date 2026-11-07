"""Tests for tools/adversary.py (SPEC sections 4 and 6: G3, G4, G10).

Codex is never called. subprocess.Popen and subprocess.run are replaced by
fakes: the fake `codex exec` reads the batch ids from the output schema file and
writes the reply a test chooses to the -o file. All data is the clearly fake
package from factories.py.
"""

import json
import re
import signal
import subprocess
import threading
from pathlib import Path

import pytest

import adversary as adv
import compute_status as cs
import factories as fx
from ihh import paths, records

FACT_IDS = ("TST-F-0001", "TST-F-0002", "TST-F-0003", "TST-F-0004")
HEADER = ("OpenAI Codex v0.156.0 (research preview)\n--------\nworkdir: /example\n"
          "model: test-model-1\nprovider: openai\nsandbox: read-only\n--------\n")


# --- fixtures and fakes -------------------------------------------------------------

def pending_world():
    """The fake package with every adversary verdict cleared and every status pending."""
    w = fx.world()
    for rec in w["facts"] + w["media"]:
        rec["adversary"] = None
        rec["status"] = "pending"
        rec["verified_claim_sha256"] = None
    return w


# The sources each record of the fake world shows the adversary (judged.payload_source_ids).
SOURCES_OF = {"TST-F-0001": ["TST-S-0002", "TST-S-0003"], "TST-F-0002": ["TST-S-0001"],
              "TST-F-0003": ["TST-S-0002", "TST-S-0003"], "TST-F-0004": ["TST-S-0004"],
              "TST-M-0001": ["TST-S-0001"]}


def live(item_id, result="found", **per_source):
    """live_by_source for an item: `result` for each of its sources unless named in per_source."""
    sids = SOURCES_OF.get(item_id, ["A-S-0001"])
    return [{"source_id": sid, "result": per_source.get(sid.replace("-", "_"), result),
             "url": f"https://checked.example.org/{sid}"} for sid in sids]


def verdict(item_id, **overrides):
    row = {"id": item_id, "verdict": "supported", "quote_in_snapshot": True, "live_by_source": live(item_id),
           "entailed": True, "adds_information": False, "atomic": True, "source_type_ok": True,
           "rationale": "no problem found"}
    row.update(overrides)
    return row


def sources_in_prompt(prompt):
    """{item id: [source ids]} as the prompt shows them, so the fake answers one live result per
    source of each item."""
    out = {}
    for block in re.split(r"\n(?=Item )", prompt):
        m = re.match(r"Item (\S+) \(", block)
        if m:
            out[m.group(1)] = list(dict.fromkeys(re.findall(r"source ([A-Z]{3}-S-\d{4,})", block)))
    return out


def reply_supported(ids, prompt):
    shown = sources_in_prompt(prompt)
    rows_ = []
    for i in ids:
        row = verdict(i)
        if shown.get(i):
            row["live_by_source"] = [{"source_id": sid, "result": "found", "url": f"https://checked.example.org/{sid}"}
                                     for sid in shown[i]]
        rows_.append(row)
    return {"output": json.dumps({"verdicts": rows_})}


def reply_invalid_json(ids, prompt):
    return {"output": "these are not JSON verdicts"}


def reply_timeout(ids, prompt):
    return {"timeout": True}


def reply_wrong_id(ids, prompt):
    rows = [verdict(i) for i in ids]
    rows[0]["id"] = "TST-F-9999"
    return {"output": json.dumps({"verdicts": rows})}


def reply_missing_id(ids, prompt):
    return {"output": json.dumps({"verdicts": [verdict(i) for i in ids][1:]})}


def reply_exit_1(ids, prompt):
    return {"output": None, "returncode": 1, "stderr": HEADER + "error: stream disconnected\n"}


class FakeProc:
    pid = 424242

    def __init__(self, cmd, kwargs, behaviour):
        self.cmd = list(cmd)
        self.kwargs = kwargs
        self.behaviour = behaviour
        self.returncode = None
        self.timed_out = False
        schema = json.loads(Path(cmd[cmd.index("--output-schema") + 1]).read_text(encoding="utf-8"))
        self.ids = schema["properties"]["verdicts"]["items"]["properties"]["id"]["enum"]
        self.out = Path(cmd[cmd.index("-o") + 1])
        self.prompt = cmd[-1]

    def communicate(self, timeout=None):
        if self.timed_out:
            self.returncode = -9
            return "", ""
        reply = self.behaviour(self.ids, self.prompt)
        if reply.get("timeout"):
            self.timed_out = True
            raise subprocess.TimeoutExpired(self.cmd, timeout)
        if reply.get("output") is not None:
            self.out.write_text(reply["output"], encoding="utf-8")
        self.returncode = reply.get("returncode", 0)
        return "", reply.get("stderr", HEADER)

    def kill(self):
        self.timed_out = True

    def wait(self, timeout=None):
        return self.returncode


class FakeCodex:
    """Replaces subprocess.Popen; each call takes the next behaviour (or the default)."""

    def __init__(self, *behaviours, default=reply_supported):
        self.behaviours = list(behaviours)
        self.default = default
        self.calls = []
        self.lock = threading.Lock()

    def __call__(self, cmd, **kwargs):
        with self.lock:
            behaviour = self.behaviours.pop(0) if self.behaviours else self.default
            proc = FakeProc(cmd, kwargs, behaviour)
            self.calls.append(proc)
        return proc


@pytest.fixture
def env(tmp_path, monkeypatch):
    """A fake inductee on disk, a logged-in fake codex on PATH, and no real process calls."""
    codex_home = tmp_path / "codex-home"
    codex_home.mkdir()
    monkeypatch.setenv("CODEX_HOME", str(codex_home))
    monkeypatch.setattr(adv.shutil, "which", lambda name: "/fake/bin/codex" if name == "codex" else None)
    logins = []

    def fake_run(cmd, **kwargs):
        logins.append(list(cmd))
        return subprocess.CompletedProcess(cmd, 0, "Logged in using ChatGPT\n", "")

    monkeypatch.setattr(adv.subprocess, "run", fake_run)
    kills = []
    monkeypatch.setattr(adv.os, "killpg", lambda pid, sig: kills.append((pid, sig)))

    def no_popen(cmd, **kwargs):
        raise AssertionError(f"unexpected process start: {cmd}")

    monkeypatch.setattr(adv.subprocess, "Popen", no_popen)

    class Env:
        data = tmp_path / "data"
        home = codex_home

        def write(self, w):
            return fx.write_world(self.data, w)

        def codex(self, *behaviours, default=reply_supported):
            fake = FakeCodex(*behaviours, default=default)
            monkeypatch.setattr(adv.subprocess, "Popen", fake)
            return fake

        def run(self, *args):
            return adv.main([fx.SLUG, "--data-dir", str(self.data), *args])

    e = Env()
    e.logins = logins
    e.kills = kills
    return e


def rows(root, name):
    return {r["id"]: r for r in fx.read_rows(root, name)}


def sha_on_disk(root, rid):
    """The judged fingerprint of a record as it is on disk now."""
    from ihh import gates, judged
    facts, media = rows(root, "facts"), rows(root, "media")
    sources = gates.by_id(fx.read_rows(root, "sources"))
    kind = "fact" if rid in facts else "media"
    return judged.record_fingerprint((facts if kind == "fact" else media)[rid], kind, sources, facts)


def with_sha(root, row):
    """A verdict line carrying the judged_sha256 of the record as it is on disk now."""
    return {**row, "judged_sha256": sha_on_disk(root, row["id"])}


def items_for(w, root, wanted=None):
    ctx = fx.context(w)
    return adv.select_items(w["facts"], w["media"], ctx, root, wanted)


# --- selection --------------------------------------------------------------------------

def test_all_pending_selects_unjudged_open_items(tmp_path):
    w = pending_world()
    fx.by_id(w["facts"], "TST-F-0003")["adversary"] = fx.adversary()
    fx.stamp(w, fx.by_id(w["facts"], "TST-F-0003"))  # a verdict on the record as it is
    fx.by_id(w["facts"], "TST-F-0004")["extractor"]["verdict"] = "withdrawn"
    items, skipped = items_for(w, tmp_path)
    assert sorted(i.id for i in items) == ["TST-F-0001", "TST-F-0002", "TST-M-0001"]
    assert [s[0] for s in skipped] == ["TST-F-0004"]
    assert "withdrawn" in skipped[0][1]


def test_ids_rejudge_an_existing_verdict_but_never_closed_records(tmp_path):
    w = pending_world()
    fx.by_id(w["facts"], "TST-F-0003")["adversary"] = fx.adversary(verdict="refuted")
    fx.by_id(w["facts"], "TST-F-0001")["status"] = "rejected"
    fx.by_id(w["facts"], "TST-F-0002")["status"] = "conflicting"
    items, skipped = items_for(w, tmp_path, {"TST-F-0001", "TST-F-0002", "TST-F-0003"})
    assert [i.id for i in items] == ["TST-F-0003"]
    assert sorted(s[0] for s in skipped) == ["TST-F-0001", "TST-F-0002"]


def test_items_failing_a_deterministic_gate_are_skipped(tmp_path):
    w = pending_world()
    fx.by_id(w["facts"], "TST-F-0003")["evidence"][0]["quote"] = "taught physics at Example College"
    fx.by_id(w["facts"], "TST-F-0001")["claim"] = "Test Person was born Testa Q. Persona in 1950."
    w["media"][0]["rights_statement"] = "Free for any use."
    items, skipped = items_for(w, tmp_path)
    reasons = dict(skipped)
    assert sorted(i.id for i in items) == ["TST-F-0002", "TST-F-0004"]
    assert "G1" in reasons["TST-F-0003"]
    assert "G2" in reasons["TST-F-0001"]
    assert "G1" in reasons["TST-M-0001"]


def test_claim_edited_after_verification_waits_for_compute_status(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["claim"] = "Test Person taught at Example College for 13 years."
    f["evidence"].append({"source_id": "TST-S-0003", "quote": "taught at Example College for 13 years",
                          "locator": "line 1"})
    items, skipped = items_for(w, tmp_path, {"TST-F-0003"})
    assert items == []
    assert "G7" in skipped[0][1] and "compute_status" in skipped[0][1]


def test_reconstruction_media_is_judged_with_its_basis(tmp_path):
    w = pending_world()
    m = w["media"][0]
    m["reconstruction"] = True
    m["reconstruction_basis"] = ["TST-F-0002", "TST-S-0001"]
    m["alt_text"] = "Typed arrival record of Testa Q. Persona."
    for f in w["facts"]:
        f["status"] = "verified"
    root = fx.write_world(tmp_path, w)
    items, skipped = items_for(w, root, {"TST-M-0001"})
    assert [i.id for i in items] == ["TST-M-0001"] and skipped == []
    prompt = adv.build_prompt(items, w["inductee"], cwd=tmp_path)
    assert "reconstruction" in prompt.lower()
    assert json.dumps(fx.by_id(w["facts"], "TST-F-0002")["claim"]) in prompt  # the basis claim
    assert json.dumps(m["alt_text"]) in prompt
    items, _ = items_for(w, root)  # --all-pending selects it too
    assert "TST-M-0001" in [i.id for i in items]


def test_batches_group_by_source_and_hold_at_most_six(tmp_path):
    w = pending_world()
    for n in range(5, 13):
        w["facts"].append(fx.fact(f"TST-F-{n:04d}", "Test Person taught at Example College.", "career",
                                  [("TST-S-0003", "taught at Example College")],
                                  adversary=None, status="pending"))
    items, _ = items_for(w, tmp_path)
    batches = adv.make_batches(items)
    seen = [i.id for b in batches for i in b.items]
    assert sorted(seen) == sorted(i.id for i in items)
    assert len(seen) == len(set(seen))
    assert all(1 <= len(b.items) <= adv.MAX_BATCH for b in batches)
    assert all({i.kind for i in b.items} == {b.kind} for b in batches)
    assert all({i.group for i in b.items} == {b.source} for b in batches)
    assert [len(b.items) for b in batches if b.source == "TST-S-0003"] == [6, 2]
    assert [b.kind for b in batches][-1] == "media"


# --- prompt ---------------------------------------------------------------------------------

SENTINELS = ("SENTINEL-EXTRACTOR", "SENTINEL-NOTE", "SENTINEL-REVIEW", "SENTINEL-USED", "SENTINEL-OLD",
             "SENTINEL-SOURCE-NOTE", "SENTINEL-STATUS-WORD", "SENTINEL-INDUCTEE-NOTE")


def leaky_world():
    """Every field the adversary must not see carries a sentinel string."""
    w = pending_world()
    w["inductee"]["runs"][0]["notes"] = "SENTINEL-INDUCTEE-NOTE"
    for f in w["facts"]:
        f["extractor"] = {"model": "SENTINEL-EXTRACTOR-model", "run_id": "SENTINEL-EXTRACTOR-run",
                          "date": fx.TODAY, "verdict": "supported",
                          "reasoning": "SENTINEL-EXTRACTOR-reasoning: the archive clearly says so"}
        f["notes"] = "SENTINEL-NOTE: extractor is confident"
        f["review"] = {"state": "pending", "reviewer": "SENTINEL-REVIEW", "date": None, "note": "SENTINEL-REVIEW"}
        f["used_in"] = ["SENTINEL-USED-profile"]
        f["adversary"] = fx.adversary(rationale="SENTINEL-OLD rationale", model="SENTINEL-OLD-model")
        f["status"] = "disputed"
        f["status_reason"] = "SENTINEL-STATUS-WORD"
    w["media"][0]["notes"] = "SENTINEL-NOTE"
    w["media"][0]["alt_text"] = "Typed arrival record."
    w["media"][0]["adversary"] = fx.adversary(rationale="SENTINEL-OLD media")
    w["media"][0]["status"] = "disputed"
    for s in w["sources"]:
        s["notes"] = "SENTINEL-SOURCE-NOTE: found via a lead"
    return w


def test_prompt_carries_record_fields_and_refute_by_default(tmp_path):
    w = pending_world()
    root = fx.write_world(tmp_path / "data", w)
    items, _ = items_for(w, root, {"TST-F-0002", "TST-F-0003"})
    prompt = adv.build_prompt(items, w["inductee"], cwd=tmp_path)
    f2 = fx.by_id(w["facts"], "TST-F-0002")
    assert json.dumps(f2["claim"]) in prompt
    assert json.dumps(f2["evidence"][0]["quote"]) in prompt
    assert "locator: line 1" in prompt
    assert "https://archives.example.org/id/1" in prompt                 # url
    assert "https://archives.example.org/id/1?format=json" in prompt        # fetch_url
    assert "data/inductees/testperson/snapshots/TST-S-0001.txt" in prompt  # snapshot, relative to cwd
    assert "type primary" in prompt and "type institutional" in prompt
    assert "Example National Archives" in prompt
    assert "Testa Q. Persona" in prompt and "Test Person" in prompt     # name and aliases
    assert "fetched by browser" in prompt
    # SPEC section 6 instructions
    assert "refute" in prompt
    assert 'Default to "unclear"' in prompt
    assert "Never answer \"supported\" on doubt" in prompt
    assert "live_by_source" in prompt and "atomic" in prompt and "source_type_ok" in prompt
    assert '"found|not_found|unreachable"' in prompt
    assert "catalog.archives.gov/proxy/records/search?naId=" in prompt
    assert "Return only JSON" in prompt
    assert "TST-F-0002" in prompt and "TST-F-0003" in prompt


def test_prompt_shows_absolute_snapshot_path_outside_the_working_directory(tmp_path):
    w = pending_world()
    root = fx.write_world(tmp_path / "data", w)
    items, _ = items_for(w, root, {"TST-F-0002"})
    prompt = adv.build_prompt(items, w["inductee"], cwd=tmp_path / "elsewhere")
    assert str((root / "snapshots" / "TST-S-0001.txt").resolve()) in prompt


def test_prompt_never_contains_extractor_fields_or_other_unshown_fields(tmp_path):
    w = leaky_world()
    root = fx.write_world(tmp_path, w)
    items, _ = items_for(w, root, set(FACT_IDS) | {"TST-M-0001"})
    assert len(items) == 5
    for batch in adv.make_batches(items):
        prompt = adv.build_prompt(batch.items, w["inductee"], cwd=tmp_path)
        for word in SENTINELS:
            assert word not in prompt
        assert "disputed" not in prompt
    for item in items:
        assert not any(word in json.dumps(item.payload) for word in SENTINELS)


def test_media_prompt_asks_about_rights(tmp_path):
    w = pending_world()
    root = fx.write_world(tmp_path, w)
    items, _ = items_for(w, root, {"TST-M-0001"})
    prompt = adv.build_prompt(items, w["inductee"], cwd=tmp_path)
    assert json.dumps("No known copyright restrictions.") in prompt
    assert "license_class: public-domain" in prompt
    assert "rights_url: https://archives.example.org/id/1" in prompt
    assert "uploader" in prompt


def test_media_prompt_states_the_approved_rights_rule(tmp_path):
    """Codex judges media by the same rule the gates apply (ihh/rights.py): license_class
    follows from the holder's own words under the project's approved rule."""
    from ihh import rights
    w = pending_world()
    root = fx.write_world(tmp_path, w)
    items, _ = items_for(w, root, {"TST-M-0001"})
    prompt = adv.build_prompt(items, w["inductee"], cwd=tmp_path)
    assert rights.RULE_TEXT in prompt
    assert "license_class follows from the holder's own words under the project's approved rule" in prompt
    # The old instruction that contradicted the rule is gone.
    assert "public-domain where the holder only says it knows of no restrictions" not in prompt


def test_fact_only_prompt_has_no_rights_rule(tmp_path):
    from ihh import rights
    w = pending_world()
    root = fx.write_world(tmp_path, w)
    items, _ = items_for(w, root, {"TST-F-0002"})
    prompt = adv.build_prompt(items, w["inductee"], cwd=tmp_path)
    assert rights.RULE_TEXT not in prompt


# --- output schema and validation ------------------------------------------------------------

def test_output_schema_is_strict_and_lists_the_batch_ids():
    schema = adv.output_schema(["TST-F-0001", "TST-F-0002"])
    assert schema["type"] == "object"
    assert schema["additionalProperties"] is False
    assert schema["required"] == ["verdicts"]
    item = schema["properties"]["verdicts"]["items"]
    assert item["additionalProperties"] is False
    assert sorted(item["required"]) == sorted(item["properties"])
    assert set(item["properties"]) == {"id", *adv.MODEL_FIELDS}
    assert "quote_in_live" not in item["properties"]   # derived from live_by_source by the tool
    assert item["properties"]["id"]["enum"] == ["TST-F-0001", "TST-F-0002"]
    assert item["properties"]["verdict"]["enum"] == ["supported", "refuted", "unclear"]
    live_item = item["properties"]["live_by_source"]["items"]
    assert live_item["additionalProperties"] is False
    assert sorted(live_item["required"]) == ["result", "source_id", "url"]
    assert live_item["properties"]["result"]["enum"] == ["found", "not_found", "unreachable"]
    for key in adv.BOOL_FIELDS:
        assert item["properties"][key] == {"type": "boolean"}


def test_parse_output_accepts_an_exact_match():
    text = json.dumps({"verdicts": [verdict("A-F-0001"), verdict("A-F-0002", verdict="refuted")]})
    got, problems = adv.parse_output(text, ["A-F-0001", "A-F-0002"])
    assert problems == []
    assert got["A-F-0002"]["verdict"] == "refuted"
    assert list(got["A-F-0001"]) == list(adv.MODEL_FIELDS)


def test_output_schema_limits_live_source_ids_to_the_batch_sources():
    schema = adv.output_schema(["TST-F-0003"], ["TST-S-0002", "TST-S-0003"])
    live_item = schema["properties"]["verdicts"]["items"]["properties"]["live_by_source"]["items"]
    assert live_item["properties"]["source_id"]["enum"] == ["TST-S-0002", "TST-S-0003"]


def test_parse_output_needs_one_live_result_per_source_shown():
    expected = {"TST-F-0003": ["TST-S-0002", "TST-S-0003"]}
    ok = json.dumps({"verdicts": [verdict("TST-F-0003")]})
    got, problems = adv.parse_output(ok, ["TST-F-0003"], expected)
    assert problems == [] and [e["source_id"] for e in got["TST-F-0003"]["live_by_source"]] == \
        ["TST-S-0002", "TST-S-0003"]
    short = json.dumps({"verdicts": [verdict("TST-F-0003", live_by_source=live("TST-F-0003")[:1])]})
    got, problems = adv.parse_output(short, ["TST-F-0003"], expected)
    assert got is None and any("TST-S-0003" in x and "no live result" in x for x in problems)
    extra = live("TST-F-0003") + [{"source_id": "TST-S-0001", "result": "found", "url": "https://x.example.org/"}]
    got, problems = adv.parse_output(json.dumps({"verdicts": [verdict("TST-F-0003", live_by_source=extra)]}),
                                     ["TST-F-0003"], expected)
    assert got is None and any("TST-S-0001" in x and "not a source of" in x for x in problems)


def test_adversary_record_derives_quote_in_live_from_the_per_source_results():
    for results, summary in (({}, "yes"), ({"TST_S_0002": "unreachable"}, "unreachable"),
                             ({"TST_S_0002": "unreachable", "TST_S_0003": "not_found"}, "no")):
        j = {k: v for k, v in verdict("TST-F-0003", live_by_source=live("TST-F-0003", **results)).items()
             if k != "id"}
        rec = adv.adversary_record("codex:m", "r", fx.TODAY, j, "0" * 64)
        assert rec["quote_in_live"] == summary
        assert rec["live_by_source"] == j["live_by_source"]
        assert list(rec) == ["model", "run_id", "date", *adv.JUDGEMENT_FIELDS, "judged_sha256"]


def test_failed_record_reports_every_source_unreachable():
    rec = adv.failed_record("codex:m", "r", fx.TODAY, "timed out", "0" * 64,
                            [("TST-S-0002", "https://library.example.net/test-person")])
    assert rec["live_by_source"] == [{"source_id": "TST-S-0002", "result": "unreachable",
                                      "url": "https://library.example.net/test-person"}]
    assert rec["quote_in_live"] == "unreachable" and rec["verdict"] == "unclear"


def test_codex_per_source_verdict_ignores_an_unreachable_non_counting_source(env):
    # Owner-approved 2026-10-10: the counting source was found live; an extra source that does not
    # cover the whole claim could not be loaded. The fact is verified (it was disputed before).
    w = pending_world()
    f = fx.by_id(w["facts"], "TST-F-0002")
    f["evidence"].append({"source_id": "TST-S-0002", "quote": "arrived in the United States in June 1941",
                          "locator": "line 1"})
    root = env.write(w)

    def reply(ids, prompt):
        rows_ = [verdict(i) for i in ids]
        for r in rows_:
            if r["id"] == "TST-F-0002":
                r["live_by_source"] = [
                    {"source_id": "TST-S-0001", "result": "found", "url": "https://archives.example.org/id/1"},
                    {"source_id": "TST-S-0002", "result": "unreachable",
                     "url": "https://library.example.net/test-person"}]
        return {"output": json.dumps({"verdicts": rows_})}

    env.codex(default=reply)
    assert env.run("--ids", "TST-F-0002", "--engine", "codex") == 0
    a = rows(root, "facts")["TST-F-0002"]["adversary"]
    assert a["quote_in_live"] == "unreachable" and len(a["live_by_source"]) == 2
    assert cs.main([fx.SLUG, "--data-dir", str(env.data)]) == 0
    assert rows(root, "facts")["TST-F-0002"]["status"] == "verified"


@pytest.mark.parametrize("payload, expected", [
    ("not json", "not JSON"),
    (json.dumps([verdict("A-F-0001")]), '"verdicts"'),
    (json.dumps({"verdicts": [verdict("A-F-0001")], "extra": 1}), '"verdicts"'),
    (json.dumps({"verdicts": [verdict("A-F-0001")]}), "missing"),
    (json.dumps({"verdicts": [verdict("A-F-0001"), verdict("A-F-0002"), verdict("A-F-0003")]}), "unexpected id"),
    (json.dumps({"verdicts": [verdict("A-F-0001"), verdict("A-F-0001")]}), "duplicate"),
    (json.dumps({"verdicts": [verdict("A-F-0001", verdict="maybe"), verdict("A-F-0002")]}), "verdict"),
    (json.dumps({"verdicts": [verdict("A-F-0001", atomic="yes"), verdict("A-F-0002")]}), "atomic"),
    (json.dumps({"verdicts": [verdict("A-F-0001", quote_in_live="yes"), verdict("A-F-0002")]}), "unexpected key"),
    (json.dumps({"verdicts": [verdict("A-F-0001", live_by_source="yes"), verdict("A-F-0002")]}), "live_by_source"),
    (json.dumps({"verdicts": [verdict("A-F-0001", live_by_source=live("A-F-0001", "maybe")),
                              verdict("A-F-0002")]}), "result"),
    (json.dumps({"verdicts": [{k: v for k, v in verdict("A-F-0001").items() if k != "live_by_source"},
                              verdict("A-F-0002")]}), "live_by_source"),
    (json.dumps({"verdicts": [verdict("A-F-0001", rationale=" "), verdict("A-F-0002")]}), "rationale"),
    (json.dumps({"verdicts": [verdict("A-F-0001", model="x"), verdict("A-F-0002")]}), "unexpected key"),
    (json.dumps({"verdicts": [{k: v for k, v in verdict("A-F-0001").items() if k != "entailed"},
                              verdict("A-F-0002")]}), "entailed"),
])
def test_parse_output_rejects_anything_but_an_exact_match(payload, expected):
    got, problems = adv.parse_output(payload, ["A-F-0001", "A-F-0002"])
    assert got is None
    assert any(expected in p for p in problems), problems


# --- codex engine -----------------------------------------------------------------------------

def test_codex_run_writes_verdicts_and_never_status(env, capsys):
    root = env.write(pending_world())
    before = rows(root, "facts")
    fake = env.codex()
    assert env.run("--all-pending", "--engine", "codex", "--run-id", "run-adv-1") == 0

    after = rows(root, "facts")
    for fid in FACT_IDS:
        a = after[fid]["adversary"]
        assert list(a) == ["model", "run_id", "date", *adv.JUDGEMENT_FIELDS, "judged_sha256"]
        assert a["judged_sha256"] == sha_on_disk(root, fid)
        assert a["model"] == "codex:test-model-1"
        assert a["run_id"] == "run-adv-1"
        assert adv._ISO_DAY.match(a["date"])
        assert a["verdict"] == "supported"
        assert after[fid]["status"] == "pending"
        assert after[fid]["verified_claim_sha256"] is None
        assert list(after[fid]) == list(before[fid])
        assert {k: v for k, v in after[fid].items() if k != "adversary"} == \
            {k: v for k, v in before[fid].items() if k != "adversary"}
    assert rows(root, "media")["TST-M-0001"]["adversary"]["verdict"] == "supported"
    assert rows(root, "media")["TST-M-0001"]["status"] == "pending"

    out = capsys.readouterr().out
    assert "compute_status.py testperson" in out
    assert "engine: codex" in out
    assert len(fake.calls) == len(adv.make_batches(items_for(pending_world(), root)[0]))


def test_codex_command_line_and_process_settings(env):
    env.write(pending_world())
    fake = env.codex()
    assert env.run("--ids", "TST-F-0003", "--engine", "codex") == 0
    (proc,) = fake.calls
    cmd = proc.cmd
    assert cmd[:7] == ["/fake/bin/codex", "exec", "--skip-git-repo-check", "-s", "read-only",
                       "-c", 'web_search="live"']
    assert "--output-schema" in cmd and "-o" in cmd
    assert "-m" not in cmd
    assert proc.kwargs["stdin"] is subprocess.DEVNULL
    assert proc.kwargs["start_new_session"] is True
    assert Path(proc.kwargs["cwd"]) == paths.REPO_ROOT
    assert proc.ids == ["TST-F-0003"]


def test_explicit_model_is_passed_to_codex(env):
    env.write(pending_world())
    fake = env.codex()
    assert env.run("--ids", "TST-F-0003", "--engine", "codex", "--model", "test-model-2") == 0
    cmd = fake.calls[0].cmd
    assert cmd[cmd.index("-m") + 1] == "test-model-2"


def test_codex_verdicts_then_compute_status_verify(env):
    root = env.write(pending_world())
    env.codex()
    assert env.run("--all-pending", "--engine", "codex") == 0
    assert cs.main([fx.SLUG, "--data-dir", str(env.data)]) == 0
    assert {f["status"] for f in rows(root, "facts").values()} == {"verified"}
    assert rows(root, "media")["TST-M-0001"]["status"] == "verified"


def test_timeout_is_retried_once_then_recorded_unclear(env, capsys):
    root = env.write(pending_world())
    fake = env.codex(reply_timeout, reply_timeout)
    assert env.run("--ids", "TST-F-0003", "--engine", "codex", "--timeout", "5") == 0
    assert len(fake.calls) == 2
    assert env.kills == [(FakeProc.pid, signal.SIGKILL)] * 2
    a = rows(root, "facts")["TST-F-0003"]["adversary"]
    assert a["verdict"] == "unclear"
    assert a["rationale"].startswith("adversary run failed")
    assert "timed out" in a["rationale"]
    assert a["entailed"] is False and a["adds_information"] is True and a["quote_in_live"] == "unreachable"
    assert [e["result"] for e in a["live_by_source"]] == ["unreachable", "unreachable"]
    assert rows(root, "facts")["TST-F-0003"]["status"] == "pending"
    assert "--ids TST-F-0003" in capsys.readouterr().out
    cs.main([fx.SLUG, "--data-dir", str(env.data)])
    assert rows(root, "facts")["TST-F-0003"]["status"] == "disputed"


def test_invalid_json_then_valid_retry_is_accepted(env):
    root = env.write(pending_world())
    fake = env.codex(reply_invalid_json, reply_supported)
    assert env.run("--ids", "TST-F-0003", "--engine", "codex") == 0
    assert len(fake.calls) == 2
    assert rows(root, "facts")["TST-F-0003"]["adversary"]["verdict"] == "supported"


@pytest.mark.parametrize("bad", [reply_invalid_json, reply_wrong_id, reply_missing_id, reply_exit_1])
def test_two_failed_attempts_record_unclear_never_supported(env, bad):
    root = env.write(pending_world())
    fake = env.codex(bad, bad)
    assert env.run("--ids", "TST-F-0001", "TST-F-0003", "--engine", "codex") == 0
    assert len(fake.calls) == 2  # both facts cite TST-S-0002 first, so one batch
    for fid in ("TST-F-0001", "TST-F-0003"):
        a = rows(root, "facts")[fid]["adversary"]
        assert a["verdict"] == "unclear"
        assert a["rationale"].startswith("adversary run failed")
    assert rows(root, "facts")["TST-F-0002"]["adversary"] is None


def test_failed_batch_does_not_affect_other_batches(env):
    root = env.write(pending_world())

    def by_batch(ids, prompt):
        return reply_timeout(ids, prompt) if "TST-F-0002" in ids else reply_supported(ids, prompt)

    env.codex(default=by_batch)
    assert env.run("--all-pending", "--engine", "codex", "--parallel", "3") == 0
    facts = rows(root, "facts")
    assert facts["TST-F-0002"]["adversary"]["verdict"] == "unclear"
    for fid in ("TST-F-0001", "TST-F-0003", "TST-F-0004"):
        assert facts[fid]["adversary"]["verdict"] == "supported"


def test_record_changed_while_codex_ran_is_not_written(env, capsys):
    root = env.write(pending_world())

    def edit_then_reply(ids, prompt):
        facts = fx.read_rows(root, "facts")
        for f in facts:
            if f["id"] == "TST-F-0003":
                f["claim"] = "Test Person taught at Example College for many years."
        records.write_jsonl(root / "facts.jsonl", facts)
        return reply_supported(ids, prompt)

    env.codex(edit_then_reply)
    assert env.run("--ids", "TST-F-0003", "--engine", "codex") == 0
    assert rows(root, "facts")["TST-F-0003"]["adversary"] is None
    assert "changed" in capsys.readouterr().out


def test_snapshot_refetched_while_codex_ran_is_not_written(env):
    root = env.write(pending_world())

    def refetch_then_reply(ids, prompt):
        sources = fx.read_rows(root, "sources")
        for s in sources:
            if s["id"] == "TST-S-0003":
                s["snapshot_sha256"] = "0" * 64  # same path, new content
        records.write_jsonl(root / "sources.jsonl", sources)
        return reply_supported(ids, prompt)

    env.codex(refetch_then_reply)
    assert env.run("--ids", "TST-F-0003", "--engine", "codex") == 0
    assert rows(root, "facts")["TST-F-0003"]["adversary"] is None


def test_parallel_run_judges_every_batch(env):
    w = pending_world()
    for n in range(5, 20):
        w["facts"].append(fx.fact(f"TST-F-{n:04d}", "Test Person taught at Example College.", "career",
                                  [("TST-S-0003", "taught at Example College")],
                                  adversary=None, status="pending"))
    root = env.write(w)
    fake = env.codex()
    assert env.run("--all-pending", "--engine", "codex", "--parallel", "4") == 0
    facts = rows(root, "facts")
    assert all(f["adversary"]["verdict"] == "supported" for f in facts.values())
    judged = sorted(i for p in fake.calls for i in p.ids)
    assert judged == sorted(list(facts) + ["TST-M-0001"])
    assert all(len(p.ids) <= adv.MAX_BATCH for p in fake.calls)


def test_audit_log_records_prompt_attempts_and_verdicts(env):
    root = env.write(pending_world())
    env.codex(reply_invalid_json, reply_supported)
    assert env.run("--ids", "TST-F-0003", "--engine", "codex", "--run-id", "run-adv-2") == 0
    log = fx.read_rows(root / "staging" / "adversary", "run-adv-2")
    assert len(log) == 1
    entry = log[0]
    assert entry["ids"] == ["TST-F-0003"]
    assert [a["ok"] for a in entry["attempts"]] == [False, True]
    assert "TST-F-0003" in entry["prompt"]
    assert entry["written"] == ["TST-F-0003"]
    assert not list((root / "staging").glob("*.jsonl"))  # nothing merge_staging would pick up


def test_dry_run_writes_nothing_and_starts_no_process(env, capsys):
    root = env.write(pending_world())
    before = (root / "facts.jsonl").read_bytes()
    assert env.run("--all-pending", "--engine", "codex", "--dry-run") == 0
    assert (root / "facts.jsonl").read_bytes() == before
    assert "TST-F-0002" in capsys.readouterr().out


# --- engine choice and hand-off ------------------------------------------------------------------

def test_claude_handoff_writes_requests_and_exits_3(env, capsys):
    w = leaky_world()
    root = env.write(w)
    before = (root / "facts.jsonl").read_bytes(), (root / "media.jsonl").read_bytes()
    assert env.run("--ids", *FACT_IDS, "TST-M-0001", "--engine", "claude-handoff") == 3
    assert ((root / "facts.jsonl").read_bytes(), (root / "media.jsonl").read_bytes()) == before
    reqs = fx.read_rows(root, "adversary_requests")
    assert sorted(r["id"] for r in reqs) == sorted(FACT_IDS + ("TST-M-0001",))
    text = (root / "adversary_requests.jsonl").read_text(encoding="utf-8")
    for word in SENTINELS:
        assert word not in text
    for r in reqs:
        assert r["kind"] in ("fact", "media")
        assert r["prompt"].count("Item ") == 1 and r["id"] in r["prompt"]
        for e in r["evidence"]:
            assert Path(e["snapshot"]).is_absolute() and Path(e["snapshot"]).is_file()
            assert e["url"].startswith("https://")
    fact = next(r for r in reqs if r["id"] == "TST-F-0002")
    assert fact["claim"] == fx.by_id(w["facts"], "TST-F-0002")["claim"]
    assert fact["evidence"][0]["fetch_url"] == "https://archives.example.org/id/1?format=json"
    media = next(r for r in reqs if r["id"] == "TST-M-0001")
    assert media["rights_statement"] == "No known copyright restrictions."
    out = capsys.readouterr().out
    assert "adversary_requests.jsonl" in out and "--ingest" in out


def test_auto_without_codex_on_path_hands_off(env, monkeypatch):
    root = env.write(pending_world())
    monkeypatch.setattr(adv.shutil, "which", lambda name: None)
    assert env.run("--all-pending", "--engine", "auto") == 3
    assert (root / "adversary_requests.jsonl").is_file()


def test_auto_with_logged_out_codex_hands_off(env, monkeypatch):
    root = env.write(pending_world())
    monkeypatch.setattr(adv.subprocess, "run",
                        lambda cmd, **kw: subprocess.CompletedProcess(cmd, 1, "Not logged in\n", ""))
    assert env.run("--all-pending") == 3
    assert (root / "adversary_requests.jsonl").is_file()


def test_auto_with_logged_in_codex_uses_codex(env):
    root = env.write(pending_world())
    fake = env.codex()
    assert env.run("--all-pending") == 0
    assert env.logins == [["/fake/bin/codex", "login", "status"]]
    assert fake.calls
    assert not (root / "adversary_requests.jsonl").exists()


def test_engine_codex_without_login_is_an_error(env, monkeypatch):
    env.write(pending_world())
    monkeypatch.setattr(adv.subprocess, "run",
                        lambda cmd, **kw: subprocess.CompletedProcess(cmd, 1, "Not logged in\n", ""))
    assert env.run("--all-pending", "--engine", "codex") == 2


def test_nothing_to_judge_exits_0_without_codex(env):
    env.write(fx.world())  # every item already has a verdict
    assert env.run("--all-pending", "--engine", "codex") == 0
    assert env.logins == []


def test_unknown_id_and_bad_options_are_usage_errors(env):
    env.write(pending_world())
    assert env.run("--ids", "TST-F-0099", "--engine", "codex") == 2
    assert env.run("--all-pending", "--batch-size", "7") == 2
    assert env.run("--all-pending", "--parallel", "0") == 2
    assert env.run("--all-pending", "--run-id", "../escape") == 2
    assert adv.main(["nobody", "--data-dir", str(env.data), "--all-pending"]) == 2
    with pytest.raises(SystemExit):
        adv.main([fx.SLUG, "--data-dir", str(env.data)])  # no scope given


# --- model discovery -----------------------------------------------------------------------------

def test_model_is_read_from_the_codex_header():
    assert adv.discover_model("", HEADER) == "test-model-1"
    assert adv.discover_model("", "\x1b[1mmodel:\x1b[0m test-model-3\n") == "test-model-3"
    assert adv.discover_model("", "no header here\n") is None


def test_model_falls_back_to_config_then_default(env, monkeypatch):
    root = env.write(pending_world())
    def quiet(ids, prompt):
        return {**reply_supported(ids, prompt), "stderr": ""}

    env.codex(default=quiet)
    assert env.run("--ids", "TST-F-0003", "--engine", "codex") == 0
    assert rows(root, "facts")["TST-F-0003"]["adversary"]["model"] == "codex:default"
    (env.home / "config.toml").write_text('model = "test-config-model"\n', encoding="utf-8")
    assert env.run("--ids", "TST-F-0003", "--engine", "codex") == 0
    assert rows(root, "facts")["TST-F-0003"]["adversary"]["model"] == "codex:test-config-model"


# --- ingest ------------------------------------------------------------------------------------------

def write_lines(path, entries):
    path.write_text("".join((e if isinstance(e, str) else json.dumps(e)) + "\n" for e in entries),
                    encoding="utf-8")
    return path


def test_ingest_records_claude_verdicts_without_touching_status(env, tmp_path, capsys):
    root = env.write(pending_world())
    before = rows(root, "facts")
    path = write_lines(tmp_path / "verdicts.jsonl", [
        with_sha(root, verdict("TST-F-0001")),
        {**with_sha(root, verdict("TST-F-0002", verdict="refuted", rationale="The quote names another port.")),
         "model": "claude-test-model"},
        {**with_sha(root, verdict("TST-M-0001")), "kind": "media", "run_id": "run-claude-1",
         "date": "2026-10-07"},
    ])
    assert env.run("--ingest", str(path), "--model", "claude-default-test", "--run-id", "run-ingest-1") == 0
    facts, media = rows(root, "facts"), rows(root, "media")
    assert facts["TST-F-0001"]["adversary"]["model"] == "claude:claude-default-test"
    assert facts["TST-F-0001"]["adversary"]["run_id"] == "run-ingest-1"
    assert facts["TST-F-0002"]["adversary"]["model"] == "claude:claude-test-model"
    assert facts["TST-F-0002"]["adversary"]["verdict"] == "refuted"
    assert media["TST-M-0001"]["adversary"]["run_id"] == "run-claude-1"
    assert media["TST-M-0001"]["adversary"]["date"] == "2026-10-07"
    assert list(facts["TST-F-0001"]["adversary"]) == ["model", "run_id", "date", *adv.JUDGEMENT_FIELDS,
                                                      "judged_sha256"]
    for fid in FACT_IDS:
        assert facts[fid]["status"] == before[fid]["status"]
    assert facts["TST-F-0003"]["adversary"] is None
    assert "compute_status.py testperson" in capsys.readouterr().out


def test_ingest_requires_per_source_live_results(env, tmp_path, capsys):
    root = env.write(pending_world())
    no_live = {k: v for k, v in with_sha(root, verdict("TST-F-0001")).items() if k != "live_by_source"}
    short = with_sha(root, verdict("TST-F-0003", live_by_source=live("TST-F-0003")[:1]))
    path = write_lines(tmp_path / "v.jsonl", [{**no_live, "quote_in_live": "yes"}, short])
    assert env.run("--ingest", str(path)) == 1
    facts = rows(root, "facts")
    assert facts["TST-F-0001"]["adversary"] is None and facts["TST-F-0003"]["adversary"] is None
    out = capsys.readouterr().out
    assert "live_by_source" in out and "TST-S-0003" in out


def test_ingest_accepts_a_matching_quote_in_live_and_refuses_a_contradicting_one(env, tmp_path, capsys):
    root = env.write(pending_world())
    good = {**with_sha(root, verdict("TST-F-0001")), "quote_in_live": "yes"}
    bad = {**with_sha(root, verdict("TST-F-0003", live_by_source=live("TST-F-0003", TST_S_0002="not_found"))),
           "quote_in_live": "yes"}
    path = write_lines(tmp_path / "v.jsonl", [good, bad])
    assert env.run("--ingest", str(path)) == 1
    facts = rows(root, "facts")
    assert facts["TST-F-0001"]["adversary"]["quote_in_live"] == "yes"
    assert facts["TST-F-0003"]["adversary"] is None
    assert "quote_in_live" in capsys.readouterr().out


def test_ingest_without_model_records_claude_unknown(env, tmp_path):
    root = env.write(pending_world())
    path = write_lines(tmp_path / "v.jsonl", [with_sha(root, verdict("TST-F-0001"))])
    assert env.run("--ingest", str(path)) == 0
    assert rows(root, "facts")["TST-F-0001"]["adversary"]["model"] == "claude:unknown"


def test_ingest_accepts_a_verdicts_object_or_array(env, tmp_path):
    root = env.write(pending_world())
    one = tmp_path / "one.json"
    one.write_text(json.dumps({"verdicts": [with_sha(root, verdict("TST-F-0001"))]}), encoding="utf-8")
    assert env.run("--ingest", str(one)) == 0
    two = tmp_path / "two.json"
    two.write_text(json.dumps([with_sha(root, verdict("TST-F-0002"))], indent=2), encoding="utf-8")
    assert env.run("--ingest", str(two)) == 0
    three = tmp_path / "three.json"
    three.write_text(json.dumps(with_sha(root, verdict("TST-F-0003")), indent=2), encoding="utf-8")
    assert env.run("--ingest", str(three)) == 0
    facts = rows(root, "facts")
    assert facts["TST-F-0001"]["adversary"] and facts["TST-F-0002"]["adversary"]
    assert facts["TST-F-0003"]["adversary"]["verdict"] == "supported"


def test_ingest_rejects_bad_lines_and_writes_the_good_ones(env, tmp_path, capsys):
    root = env.write(pending_world())
    path = write_lines(tmp_path / "v.jsonl", [
        with_sha(root, verdict("TST-F-0001")),
        verdict("TST-F-0099"),                                   # unknown id
        verdict("TST-F-0002", verdict="probably"),               # bad enum
        {**verdict("TST-F-0003"), "loc": "profile:summary:0"},   # unknown key
        verdict("TST-F-0004"), verdict("TST-F-0004"),            # duplicate id
        {**verdict("TST-M-0001"), "model": "codex:gpt-test"},    # not a Claude verdict
        "{broken json",
    ])
    assert env.run("--ingest", str(path)) == 1
    facts = rows(root, "facts")
    assert facts["TST-F-0001"]["adversary"]["verdict"] == "supported"
    for fid in ("TST-F-0002", "TST-F-0003", "TST-F-0004"):
        assert facts[fid]["adversary"] is None
    assert rows(root, "media")["TST-M-0001"]["adversary"] is None
    out = capsys.readouterr().out
    for word in ("TST-F-0099", "probably", "loc", "appears 2 times", "codex", "invalid JSON"):
        assert word in out


def test_ingest_of_kind_mismatch_or_empty_file_fails(env, tmp_path):
    root = env.write(pending_world())
    path = write_lines(tmp_path / "v.jsonl", [{**with_sha(root, verdict("TST-F-0001")), "kind": "media"}])
    assert env.run("--ingest", str(path)) == 1
    assert rows(root, "facts")["TST-F-0001"]["adversary"] is None
    empty = tmp_path / "empty.jsonl"
    empty.write_text("", encoding="utf-8")
    assert env.run("--ingest", str(empty)) == 1
    assert env.run("--ingest", str(tmp_path / "missing.jsonl")) == 2


# --- verdicts are tied to what was judged (round 1 review) ----------------------------------------

def test_media_prompt_shows_alt_text_and_title(tmp_path):
    w = pending_world()
    root = fx.write_world(tmp_path, w)
    items, _ = items_for(w, root, {"TST-M-0001"})
    prompt = adv.build_prompt(items, w["inductee"], cwd=tmp_path)
    assert json.dumps(w["media"][0]["alt_text"]) in prompt
    assert json.dumps(w["media"][0]["title"]) in prompt
    assert "alt_text" in prompt


def test_all_pending_also_selects_items_with_a_stale_verdict(tmp_path):
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["evidence"][1]["quote"] = "taught at Example College for 13 years"  # never judged
    del fx.by_id(w["facts"], "TST-F-0001")["adversary"]["judged_sha256"]  # legacy verdict
    items, _ = items_for(w, tmp_path)
    assert sorted(i.id for i in items) == ["TST-F-0001", "TST-F-0003"]


def test_handoff_requests_carry_the_judged_fingerprint(env):
    root = env.write(pending_world())
    assert env.run("--ids", "TST-F-0003", "TST-M-0001", "--engine", "claude-handoff") == 3
    for r in fx.read_rows(root, "adversary_requests"):
        assert r["judged_sha256"] == sha_on_disk(root, r["id"])


def test_ingest_requires_the_judged_fingerprint(env, tmp_path, capsys):
    root = env.write(pending_world())
    path = write_lines(tmp_path / "v.jsonl", [verdict("TST-F-0003")])
    assert env.run("--ingest", str(path)) == 1
    assert rows(root, "facts")["TST-F-0003"]["adversary"] is None
    assert "judged_sha256" in capsys.readouterr().out


def test_ingest_refuses_a_verdict_on_a_claim_edited_after_the_request(env, tmp_path, capsys):
    import export
    w = pending_world()
    for f in w["facts"]:
        if f["id"] != "TST-F-0003":
            f["adversary"] = fx.adversary()
    fx.restamp(w)
    for rec in w["facts"] + w["media"]:
        rec["review"] = {"state": "approved", "reviewer": "Test Reviewer", "date": fx.TODAY, "note": ""}
    root = env.write(w)
    assert cs.main([fx.SLUG, "--data-dir", str(env.data)]) == 0
    assert env.run("--ids", "TST-F-0003", "--engine", "claude-handoff") == 3
    (request,) = fx.read_rows(root, "adversary_requests")
    # The claim is negated after the request was written; the verdict judged the old wording.
    facts = fx.read_rows(root, "facts")
    negated = "Test Person never taught at Example College."
    fx.by_id(facts, "TST-F-0003")["claim"] = negated
    (root / "facts.jsonl").write_text("".join(json.dumps(r) + "\n" for r in facts), encoding="utf-8")
    path = write_lines(tmp_path / "v.jsonl",
                       [{**verdict("TST-F-0003"), "judged_sha256": request["judged_sha256"]}])
    assert env.run("--ingest", str(path)) == 1
    assert "changed" in capsys.readouterr().out
    assert rows(root, "facts")["TST-F-0003"]["adversary"] is None
    assert cs.main([fx.SLUG, "--data-dir", str(env.data)]) == 0
    assert rows(root, "facts")["TST-F-0003"]["status"] == "pending"
    export.main([fx.SLUG, "--data-dir", str(env.data)])
    html_path = root / "export" / "wordpress.html"
    assert not html_path.exists() or "never taught" not in html_path.read_text(encoding="utf-8")


def test_ingest_reads_lines_holding_unicode_line_breaks(env, tmp_path):
    root = env.write(pending_world())
    row = with_sha(root, verdict("TST-F-0003", rationale="Quote spans two lines; no problem found"))
    path = tmp_path / "v.jsonl"
    path.write_text(json.dumps(row, ensure_ascii=False) + "\n", encoding="utf-8")
    assert env.run("--ingest", str(path)) == 0
    assert rows(root, "facts")["TST-F-0003"]["adversary"]["rationale"].startswith("Quote spans")


def test_prompt_never_names_the_absolute_working_directory(tmp_path):
    # the prompt is logged to staging/adversary/*.jsonl, which is committed: an absolute working
    # directory would put the machine's home folder into the repository; snapshot paths stay relative
    w = pending_world()
    root = fx.write_world(tmp_path, w)
    items, _ = items_for(w, root)
    prompt = adv.build_prompt(items, w["inductee"], cwd=tmp_path)
    assert str(tmp_path.resolve()) not in prompt and str(tmp_path) not in prompt
    assert "Your working directory is the project root" in prompt
