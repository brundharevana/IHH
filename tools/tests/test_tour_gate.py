"""The gate chain of tools/tour_research.py, with the subprocess calls faked."""

import json
import subprocess

import pytest

import factories
import tour_research
from ihh import records

SLUG = factories.SLUG


@pytest.fixture
def data(tmp_path):
    factories.write_world(tmp_path, factories.world())
    return tmp_path


def folder(data):
    return data / "inductees" / SLUG


def stage(data):
    w = factories.world()
    src = dict(w["sources"][0], id="tmp-tour-r1-S-1", url="https://blocked.example.net/item/1", fetch_url=None,
               snapshot=None, snapshot_sha256=None)
    ok = dict(w["sources"][0], id="tmp-tour-r1-S-2", url="https://records.example.org/item/2", fetch_url=None,
              snapshot=None, snapshot_sha256=None)
    fact = dict(w["facts"][1], id="tmp-tour-r1-F-1", evidence=[{"source_id": "tmp-tour-r1-S-1", "quote": "q", "locator": "l"}])
    media = dict(w["media"][0], id="tmp-tour-r1-M-1", source_ids=["tmp-tour-r1-S-2"], basis_for=["tmp-tour-r1-F-1"],
                 record_kind="basis-photo")
    records.write_jsonl(folder(data) / "staging" / "tour-r1.jsonl", [src, ok, fact, media])
    records.write_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl",
                        [{"date": "2026-11-03", "family": "tour-ca", "tool": "t", "query": "q", "results": 1,
                          "produced": ["tmp-tour-r1-F-1", "tmp-tour-r1-S-2"], "agent": None, "run_id": "tour-r1", "notes": ""}])


class Fake:
    def __init__(self, **codes):
        self.codes, self.calls = codes, []

    def __call__(self, tool, argv):
        self.calls.append((tool, argv))
        if tool == "fetch_snapshot.py":
            if argv[1] == "tmp-tour-r1-S-1":
                return subprocess.CompletedProcess(argv, 2, "", "fetch_snapshot: x returned HTTP 429.")
            code, err = self.codes.get("snapshot2", (0, ""))
            return subprocess.CompletedProcess(argv, code, "", err)
        code = self.codes.get(tool.split(".")[0], 0)
        return subprocess.CompletedProcess(argv, code, "", "" if code == 0 else f"{tool} failed")


def gate(data, fake, *extra):
    return tour_research.main(["gate", SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--data-dir", str(data),
                               "--model", "gpt-6-sol", *extra], call=fake, sleep=lambda s: None)


def test_classify():
    assert tour_research.classify_fetch_failure("x returned HTTP 403") == "blocked"
    assert tour_research.classify_fetch_failure("x returned HTTP 503 with a bot challenge page") == "blocked"
    assert tour_research.classify_fetch_failure("sent a page that asks for JavaScript") == "js-shell"
    assert tour_research.classify_fetch_failure("connection reset") == "error"


def test_gate_defers_blocked_source(data):
    stage(data)
    fake = Fake()
    assert gate(data, fake) == 0
    tools = [t for t, _ in fake.calls]
    assert tools == ["fetch_snapshot.py", "fetch_snapshot.py", "merge_staging.py", "merge_staging.py",
                     "compute_status.py", "validate.py"]  # no new ids from the fake merge, so no adversary call
    assert "--dry-run" in fake.calls[2][1] and "--dry-run" not in fake.calls[3][1]
    kept = [r["id"] for r in records.read_jsonl(folder(data) / "staging" / "tour-r1.jsonl")]
    assert kept == ["tmp-tour-r1-S-2"]  # the fact cited the blocked source; the basis photo cited the fact
    moved = [r["id"] for r in records.read_jsonl(folder(data) / "staging" / "deferred-tour-r1" / "tour-r1.jsonl")]
    assert sorted(moved) == ["tmp-tour-r1-F-1", "tmp-tour-r1-M-1", "tmp-tour-r1-S-1"]
    s = records.read_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl")[0]
    assert s["produced"] == ["tmp-tour-r1-S-2"] and "Deferred candidates removed" in s["notes"]
    st = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())
    assert "blocked.example.net" in st["blocked_hosts"] and set(st["steps"]) >= {"snapshot", "merge", "adversary", "status", "validate"}


def test_gate_stops_for_a_javascript_page(data):
    stage(data)
    fake = Fake(snapshot2=(2, "x sent a page with almost no text (2 words); it is probably built by JavaScript"))
    assert gate(data, fake) == 3
    assert "merge_staging.py" not in [t for t, _ in fake.calls]


def test_gate_judges_new_ids_and_resumes_after_no_codex(data, monkeypatch):
    stage(data)
    seq = iter([set(), {"TST-F-0042", "TST-M-0042"}])
    monkeypatch.setattr(tour_research, "_ids_on_file", lambda p: next(seq))
    fake = Fake(adversary=3)
    assert gate(data, fake, "--rejudge", "TST-F-0002") == 3
    adv = [a for t, a in fake.calls if t == "adversary.py"][0]
    assert adv[adv.index("--ids") + 1] == "TST-F-0042,TST-M-0042,TST-F-0002" and adv[adv.index("--engine") + 1] == "codex"
    # resume: the adversary is never marked done by hand; the next gate run judges the same ids
    fake2 = Fake()
    assert gate(data, fake2, "--rejudge", "TST-F-0002") == 0
    assert [t for t, _ in fake2.calls] == ["adversary.py", "compute_status.py", "validate.py"]
    adv2 = fake2.calls[0][1]
    assert adv2[adv2.index("--ids") + 1] == "TST-F-0042,TST-M-0042,TST-F-0002"


def test_gate_has_no_way_to_skip_the_adversary(data):
    stage(data)
    with pytest.raises(SystemExit):
        gate(data, Fake(), "--mark-done", "adversary")


def test_resume_after_a_crash_inside_the_merge_still_judges_the_merged_ids(data, monkeypatch):
    # Codex review 2026-11-01: the real merge wrote records, then the process stopped before new_ids was
    # saved; a resumed gate saw the ids as already on file and skipped their adversary review.
    stage(data)
    on_file = {"now": {"TST-F-0001"}}
    monkeypatch.setattr(tour_research, "_ids_on_file", lambda p: set(on_file["now"]))

    class CrashAfterMerge(Fake):
        def __call__(self, tool, argv):
            if tool == "merge_staging.py" and "--dry-run" not in argv:
                on_file["now"] |= {"TST-F-0042"}
                raise KeyboardInterrupt
            return super().__call__(tool, argv)
    with pytest.raises(KeyboardInterrupt):
        gate(data, CrashAfterMerge())
    fake = Fake()
    assert gate(data, fake) == 0
    adv = [a for t, a in fake.calls if t == "adversary.py"]
    assert adv and adv[0][adv[0].index("--ids") + 1] == "TST-F-0042"


def test_deferral_follows_derived_from(data):
    stage(data)
    w = factories.world()
    derived = dict(w["sources"][0], id="tmp-tour-r1-S-3", url="https://records.example.org/item/3", fetch_url=None,
                   snapshot=None, snapshot_sha256=None, derived_from="tmp-tour-r1-S-1")
    fact = dict(w["facts"][1], id="tmp-tour-r1-F-2", evidence=[{"source_id": "tmp-tour-r1-S-3", "quote": "q", "locator": "l"}])
    path = folder(data) / "staging" / "tour-r1.jsonl"
    records.write_jsonl(path, records.read_jsonl(path) + [derived, fact])
    removed = tour_research.defer_candidates(folder_paths(data), ["tmp-tour-r1-S-1"], "tour-r1", "blocked")
    assert {"tmp-tour-r1-S-3", "tmp-tour-r1-F-2"} <= set(removed)


def folder_paths(data):
    from ihh import paths
    return paths.inductee_paths(SLUG, data)


def test_snapshot_refuses_personal_data_and_plain_http_before_fetching(data):
    for sid, url in (("tmp-tour-r1-S-1", "https://records.example.org/item?who=someone@example.org"),
                     ("tmp-tour-r1-S-2", "http://records.example.org/item/2")):
        w = factories.world()
        src = dict(w["sources"][0], id=sid, url=url, fetch_url=None, snapshot=None, snapshot_sha256=None)
        records.write_jsonl(folder(data) / "staging" / "tour-r1.jsonl", [src])
        fake = Fake()
        assert tour_research.main(["snapshot", SLUG, sid, "--run-id", "tour-r1", "--data-dir", str(data)],
                                  call=fake, sleep=lambda s: None) == 3
        assert fake.calls == []
    st = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())
    assert len(st["refused"]) == 2 and st["snapshots_used"] == 0


def test_gate_reports_a_failed_validate(data):
    stage(data)
    assert gate(data, Fake(validate=1)) == 1
    st = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())
    assert st["failures"][-1]["step"] == "validate" and "validate" not in st["steps"]


def test_new_staging_or_rejudge_after_a_finished_gate_runs_the_steps_again(data, monkeypatch):
    # Codex review round 2: finished steps were reused although their inputs changed
    stage(data)
    assert gate(data, Fake()) == 0
    fake = Fake()
    assert gate(data, fake, "--rejudge", "TST-F-0002") == 0
    assert [t for t, _ in fake.calls] == ["adversary.py", "compute_status.py", "validate.py"]
    w = factories.world()
    later = dict(w["sources"][0], id="tmp-tour-r2-S-1", url="https://records.example.org/item/7", fetch_url=None,
                 snapshot=None, snapshot_sha256=None)
    records.write_jsonl(folder(data) / "staging" / "tour-r2.jsonl", [later])
    fake = Fake()
    assert gate(data, fake) == 0
    tools = [t for t, _ in fake.calls]
    assert "tmp-tour-r2-S-1" in [a[1] for t, a in fake.calls if t == "fetch_snapshot.py"]
    assert tools.count("merge_staging.py") == 2 and tools[-2:] == ["compute_status.py", "validate.py"]


def test_a_search_logged_after_a_finished_gate_is_merged_by_the_next_gate(data):
    # Codex review round 3: staged searches were left out of the change check, so they never merged
    stage(data)
    assert gate(data, Fake()) == 0
    path = folder(data) / "staging" / "tour-ca.searches.jsonl"
    rows = records.read_jsonl(path)
    records.write_jsonl(path, rows + [dict(rows[0], query="a later query", produced=[])])
    fake = Fake()
    assert gate(data, fake) == 0
    assert [t for t, _ in fake.calls].count("merge_staging.py") == 2


class Resp:
    def __init__(self, body):
        self.body, self.status = body, 200

    def read(self):
        return self.body

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


def test_a_search_repeated_after_its_first_gate_keeps_both_tries_in_one_logged_row(data):
    # Codex review round 4: the repeat was staged as a new row with the merged row's key, and the real
    # merge refused it as already logged, so its notes never reached searches.jsonl
    def real_merge(tool, argv):
        if tool == "merge_staging.py":
            return tour_research._call(tool, argv)
        return subprocess.CompletedProcess(argv, 0, "", "")
    args = ["search", SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
            "--query", "test person", "--agent", "research agent", "--data-dir", str(data)]

    def search(count, total):
        body = json.dumps({"pagination": {"of": total}, "results": []}).encode()
        return tour_research.main([*args, "--count", str(count)], opener=lambda req, timeout=None: Resp(body),
                                  sleep=lambda s: None)
    assert search(3, 4) == 0
    assert gate(data, real_merge) == 0
    assert search(5, 6) == 0
    assert gate(data, real_merge) == 0
    rows = [r for r in records.read_jsonl(folder(data) / "searches.jsonl") if r.get("run_id") == "tour-r1"]
    assert len(rows) == 1 and rows[0]["results"] == 6
    assert "c=3" in rows[0]["notes"] and "c=5" in rows[0]["notes"]
    assert not list((folder(data) / "staging").glob("*.searches.jsonl"))


WORKFLOW = tour_research.REPO / ".claude" / "workflows" / "ihh-tour-research.js"
RUNNER = r"""
const [mod, scenario] = [process.argv[2], JSON.parse(process.argv[3])];
const { default: body } = await import(mod);
const calls = [];
const agent = async (prompt, opts) => {
  calls.push(opts.label);
  const key = Object.keys(scenario).find(k => opts.label.startsWith(k));
  return key === undefined ? null : scenario[key];
};
const parallel = async fns => Promise.all(fns.map(f => f()));
const out = await body({ slug: 'testperson', date: '2026-11-03', mode: 'fresh' }, agent, parallel, null, () => {}, () => {});
console.log(JSON.stringify({ out, calls }));
"""


def run_workflow(tmp_path, **changes):
    """Run the saved workflow's script with scripted agent answers (no agent, no tool runs)."""
    import shutil
    node = shutil.which("node")
    assert node, "node is needed to run the workflow script"
    lines = WORKFLOW.read_text(encoding="utf-8").splitlines()
    end = lines.index("}")  # the meta object ends the module header (the plan's wrapped check)
    wrapped = "\n".join(lines[:end + 1] + ["export default async function body(args, agent, parallel, pipeline, phase, log) {"]
                         + lines[end + 1:] + ["}"]) + "\n"
    (tmp_path / "wf.mjs").write_text(wrapped, encoding="utf-8")
    (tmp_path / "run.mjs").write_text(RUNNER, encoding="utf-8")
    written = [f"x/{n}" for n in ("TOUR-RESEARCH.md", "ROOMS.md", "ARTIFACTS.md")] + \
              ["x/export/tour-research.jsonld", "x/export/tour.csv"]
    scenario = {"plan": {"items": [], "problems": []},
                "gate": {"exit_code": 0, "new_ids": [], "deferred": [], "problems": []},
                "attach": {"attached": [], "skipped": [], "gate_exit_code": 0, "problems": []},
                "assemble": {"ok": True, "chapters": ["birth"], "gaps": [], "problems": []},
                "closing gate": {"exit_code": 0, "new_ids": [], "deferred": [], "problems": []},
                "docs": {"exit_code": 0, "written": written, "problems": []},
                "report": {"summary": "s", "compare": "", "counts": "", "problems": []}}
    for k, v in changes.items():
        scenario[k.replace("_", " ")] = v if v is None else dict(scenario[k.replace("_", " ")], **v)
    r = subprocess.run([node, str(tmp_path / "run.mjs"), str(tmp_path / "wf.mjs"), json.dumps(scenario)],
                       capture_output=True, text=True, timeout=60)
    assert r.returncode == 0, r.stderr
    return json.loads(r.stdout.strip().splitlines()[-1])


def test_the_workflow_succeeds_only_after_the_closing_gate_and_the_docs_pass(tmp_path):
    # Codex review rounds 4 and 5: docs ran right after Assemble (its searches still staged), and a Docs
    # agent that returned errors still gave ok: true
    r = run_workflow(tmp_path)
    assert r["out"]["ok"] is True
    assert r["calls"].index("closing gate") > r["calls"].index("assemble the tour map")
    assert r["calls"].index("docs") > r["calls"].index("closing gate")


@pytest.mark.parametrize("change", [{"exit_code": 1, "problems": ["merge refused"]}, None])
def test_a_failed_closing_gate_stops_the_workflow_before_docs(tmp_path, change):
    r = run_workflow(tmp_path, closing_gate=change)
    assert r["out"]["ok"] is False and r["out"]["stage"] == "closing-gate"
    assert "docs" not in r["calls"]


@pytest.mark.parametrize("change", [
    {"exit_code": 1, "written": [], "problems": ["docs refused: 1 staged item(s) not merged"]},
    {"problems": ["export/tour-research.jsonld does not parse"]},
    {"written": ["x/TOUR-RESEARCH.md"]},
    None])
def test_a_failed_docs_step_is_not_reported_as_ok(tmp_path, change):
    r = run_workflow(tmp_path, docs=change)
    assert r["out"]["ok"] is False and r["out"]["stage"] == "docs"
