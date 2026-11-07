"""tools/tour_research.py on a fake inductee (tests/factories.py). No network."""

import json
import subprocess

import pytest

import factories
import tour_research
from ihh import records


@pytest.fixture
def data(tmp_path):
    factories.write_world(tmp_path, factories.world())
    return tmp_path


def run(data, *argv, **kw):
    return tour_research.main([*argv, "--data-dir", str(data)], **kw)


def folder(data):
    return data / "inductees" / factories.SLUG


def test_propose_check_assemble(data, capsys):
    assert run(data, "propose", factories.SLUG, "--run-id", "tour-r1") == 0
    tm = records.read_json(folder(data) / "drafts" / "tour-map.json")
    assert tm["source"] == "propose" and tm["chapters"]
    assert run(data, "propose", factories.SLUG, "--run-id", "tour-r1") == 1  # no overwrite without --force
    assert run(data, "check", factories.SLUG) == 0
    assert run(data, "assemble", factories.SLUG, "--date", "2026-11-03") == 0
    out = records.read_json(folder(data) / "drafts" / "tour.json")
    assert out["generated"] == "2026-11-03" and [c["kind"] for c in out["chapters"]] == [c["kind"] for c in tm["chapters"]]


def test_check_reports_and_fails(data, capsys):
    bad = {"slug": factories.SLUG, "chapters": [{"id": "x", "kind": "x", "fact_ids": [], "year_fact": None}], "journey": None}
    records.write_json(folder(data) / "drafts" / "tour-map.json", bad)
    assert run(data, "check", factories.SLUG) == 1
    assert "kind 'x' is not one of" in capsys.readouterr().out
    assert run(data, "assemble", factories.SLUG) == 1


def test_plan_writes_work_order_and_counts(data, capsys):
    assert run(data, "plan", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--max-items", "4") == 0
    wo = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "workorder.json").read_text())
    assert len(wo["items"]) == 4 and wo["items"][0]["id"] == "r1" and wo["items"][0]["staging_label"] == "tour-r1"
    st = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())
    assert st["counts_before"]["facts"]["verified"] == 4 and st["steps"]["plan"] == "2026-11-03"
    assert "fewer than 10 verified facts" in capsys.readouterr().err


class Resp:
    def __init__(self, body, status=200):
        self.body, self.status = body, status

    def read(self):
        return self.body

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


def test_search_logs_every_search_and_respects_blocks(data, capsys):
    body = json.dumps({"pagination": {"of": 1}, "results": [{"title": "T", "url": "https://www.loc.gov/item/1/"}]}).encode()
    args = ["search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
            "--query", "test person", "--dates", "1941/1941", "--agent", "research agent"]
    assert run(data, *args, opener=lambda req, timeout=None: Resp(body), sleep=lambda s: None) == 0
    assert json.loads(capsys.readouterr().out)["total"] == 1

    def forbidden(req, timeout=None):
        import io, urllib.error
        raise urllib.error.HTTPError(req.full_url, 403, "no", {}, io.BytesIO(b""))
    assert run(data, *args, opener=forbidden, sleep=lambda s: None) == 2
    assert run(data, *args, opener=lambda *a, **k: pytest.fail("must not be called"), sleep=lambda s: None) == 3
    rows = records.read_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl")
    # both tries are logged; they share merge_staging's search key, so they are one row (see the fold test)
    assert len(rows) == 1 and rows[0]["results"] == 1 and rows[0]["notes"].count("URL:") == 2
    assert "; then: " in rows[0]["notes"] and "blocked" in rows[0]["notes"].split("; then: ")[1]
    assert rows[0]["notes"].startswith("URL: https://www.loc.gov/collections/chronicling-america/")
    st = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())
    assert st["searches_used"] == 2 and "www.loc.gov" in st["blocked_hosts"]


def test_log_records_a_discovery_search(data):
    assert run(data, "log", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-web",
               "--tool", "web search", "--query", "test person example college", "--results", "8", "--notes", "leads only") == 0
    assert records.read_jsonl(folder(data) / "staging" / "tour-web.searches.jsonl")[0]["results"] == 8
    assert run(data, "log", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-web",
               "--tool", "web search", "--query", "someone@example.org", "--results", "1") == 3


def staged_source(data, sid="tmp-tour-r1-S-1", url="https://records.example.org/item/9"):
    src = dict(factories.world()["sources"][0], id=sid, url=url, fetch_url=None, snapshot=None, snapshot_sha256=None)
    records.write_jsonl(folder(data) / "staging" / "tour-r1.jsonl", [src])


@pytest.mark.parametrize("code,stderr,expected", [
    (0, "", 0), (2, "fetch_snapshot: tmp: https://records.example.org/item/9 returned HTTP 403.", 2),
    (2, "fetch_snapshot: tmp: x sent a page with almost no text (3 words); it is probably built by JavaScript.", 3),
    (1, "fetch_snapshot: tmp: network down", 1)])
def test_snapshot_paces_and_classifies(data, code, stderr, expected):
    staged_source(data)
    calls = []

    def call(tool, argv):
        calls.append((tool, argv))
        return subprocess.CompletedProcess(argv, code, "", stderr)
    assert run(data, "snapshot", factories.SLUG, "tmp-tour-r1-S-1", "--run-id", "tour-r1", call=call, sleep=lambda s: None) == expected
    assert calls[0][0] == "fetch_snapshot.py" and calls[0][1][:2] == [factories.SLUG, "tmp-tour-r1-S-1"]
    # every request inside the snapshot (a redirect, a LoC page's OCR text) is paced too (Codex round 5)
    argv = calls[0][1]
    assert argv[argv.index("--pace") + 1] == str(tour_research.polite.MIN_INTERVAL)
    st = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())
    assert ("records.example.org" in st["blocked_hosts"]) is (expected == 2)


def test_docs_and_compare(data, tmp_path):
    assert run(data, "propose", factories.SLUG, "--run-id", "tour-r1") == 0
    assert run(data, "assemble", factories.SLUG) == 0
    hand = "# Test Person: tour research\n\nHand-written.\n"
    (folder(data) / "TOUR-RESEARCH.md").write_text(hand, encoding="utf-8")
    assert run(data, "docs", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03") == 0
    tr = (folder(data) / "TOUR-RESEARCH.md").read_text(encoding="utf-8")
    assert tr.startswith(hand) and "<!-- tour-research:begin tour-r1 -->" in tr
    assert (folder(data) / "ROOMS.md").exists() and (folder(data) / "ARTIFACTS.md").exists()
    graph = json.loads((folder(data) / "export" / "tour-research.jsonld").read_text(encoding="utf-8"))
    assert any(n.get("@type") == "ihh:TourChapter" for n in graph["@graph"])
    app = tmp_path / "app.json"
    app.write_text(json.dumps({"tours": {factories.SLUG: {"name": "Test Person", "chapters": []}}}), encoding="utf-8")
    assert run(data, "compare", factories.SLUG, "--run-id", "tour-r1", "--app-tour", str(app)) == 0
    assert (folder(data) / "staging" / "tour" / "tour-r1" / "compare.md").exists()


def test_a_cut_off_search_is_counted_and_logged(data, capsys):
    import http.client

    class Cut(Resp):
        def read(self):
            raise http.client.IncompleteRead(b"{", 100)
    args = ["search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
            "--query", "test person"]
    assert run(data, *args, opener=lambda req, timeout=None: Cut(b""), sleep=lambda s: None) == 1
    rows = records.read_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl")
    assert len(rows) == 1 and rows[0]["results"] is None and "failed" in rows[0]["notes"]
    st = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())
    assert st["searches_used"] == 1


def test_a_repeated_search_is_folded_into_one_row(data, capsys):
    # found by the 2026-11-01 Lamarr dry run: merge_staging.py keys a search by date, family, tool, query,
    # agent and run id, so a second identical search in one run was refused as a duplicate at merge and the
    # candidates it produced lost their search. The CLI now keeps one row per key and appends the later try.
    body = json.dumps({"pagination": {"of": 4}, "results": []}).encode()
    args = ["search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
            "--query", "test person", "--agent", "research agent"]

    def cut(req, timeout=None):
        raise OSError("connection reset")
    assert run(data, *args, opener=cut, sleep=lambda s: None) == 1
    assert run(data, *args, "--count", "5", opener=lambda req, timeout=None: Resp(body), sleep=lambda s: None) == 0
    rows = records.read_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl")
    assert len(rows) == 1 and rows[0]["results"] == 4
    assert "failed" in rows[0]["notes"] and "c=5" in rows[0]["notes"] and rows[0]["notes"].count("URL:") == 2
    assert run(data, "log", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
               "--tool", rows[0]["tool"], "--query", "test person", "--agent", "research agent", "--results", "2") == 0
    rows = records.read_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl")
    assert len(rows) == 1 and rows[0]["results"] == 2


def test_a_search_is_logged_before_the_request_is_sent(data):
    # Codex review 2026-11-01: a crash between sending and logging left a sent request unlogged
    seen = {}

    def opener(req, timeout=None):
        seen["rows"] = records.read_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl")
        raise KeyboardInterrupt
    args = ["search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
            "--query", "test person"]
    with pytest.raises(KeyboardInterrupt):
        run(data, *args, opener=opener, sleep=lambda s: None)
    assert len(seen["rows"]) == 1 and tour_research.PENDING in seen["rows"][0]["notes"]
    rows = records.read_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl")
    assert len(rows) == 1 and tour_research.PENDING in rows[0]["notes"]
    st = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())
    assert st["searches_used"] == 1
    body = json.dumps({"pagination": {"of": 2}, "results": []}).encode()
    assert run(data, *args, opener=lambda req, timeout=None: Resp(body), sleep=lambda s: None) == 0
    rows = records.read_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl")
    assert len(rows) == 1 and rows[0]["results"] == 2 and rows[0]["notes"].count(tour_research.PENDING) == 1


def test_a_refused_search_logs_nothing(data):
    args = ["search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
            "--query", "someone@example.org"]
    assert run(data, *args, opener=lambda *a, **k: pytest.fail("must not be called"), sleep=lambda s: None) == 3
    assert not (folder(data) / "staging" / "tour-ca.searches.jsonl").exists()


def test_docs_rebuild_the_outline_from_the_current_map_and_store(data):
    # Codex review 2026-11-01: docs exported whatever drafts/tour.json held, even a stale one
    assert run(data, "propose", factories.SLUG, "--run-id", "tour-r1") == 0
    assert run(data, "assemble", factories.SLUG) == 0
    stale = records.read_json(folder(data) / "drafts" / "tour.json")
    stale["chapters"][0]["usable_records"] = ["TST-M-9999"]
    records.write_json(folder(data) / "drafts" / "tour.json", stale)
    assert run(data, "docs", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03") == 0
    assert "TST-M-9999" not in (folder(data) / "export" / "tour.csv").read_text(encoding="utf-8")
    tm = records.read_json(folder(data) / "drafts" / "tour-map.json")
    tm["chapters"][0]["fact_ids"] = ["TST-F-9999"]
    records.write_json(folder(data) / "drafts" / "tour-map.json", tm)
    assert run(data, "docs", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03") == 1


def test_snapshots_are_spaced_after_the_previous_one_ends_on_any_host(data):
    # Codex review round 2: fetch_snapshot.py may make more than one request (a LoC page and its OCR
    # text on another host), so snapshots are spaced from the end of the previous one, whatever its host
    staged_source(data, "tmp-tour-r1-S-1", "https://records.example.org/item/1")
    rows = records.read_jsonl(folder(data) / "staging" / "tour-r1.jsonl")
    rows.append(dict(rows[0], id="tmp-tour-r1-S-2", url="https://other.example.net/item/2"))
    records.write_jsonl(folder(data) / "staging" / "tour-r1.jsonl", rows)
    slept = []
    call = lambda tool, argv: subprocess.CompletedProcess(argv, 0, "", "")
    for sid in ("tmp-tour-r1-S-1", "tmp-tour-r1-S-2"):
        assert run(data, "snapshot", factories.SLUG, sid, "--run-id", "tour-r1", call=call, sleep=slept.append) == 0
    assert len(slept) == 1 and slept[0] > 3


def test_a_block_closes_the_holder_domain_and_no_browser_is_suggested(data, capsys):
    # Codex review round 3: fetch_snapshot.py names the first URL even when its second request (LoC OCR on
    # tile.loc.gov) was the one refused, so a block closes the whole holder domain for the run
    staged_source(data, url="https://www.loc.gov/resource/sn1/1941-10-01/ed-1/?sp=1")
    err = ("fetch_snapshot: tmp-tour-r1-S-1: https://www.loc.gov/resource/sn1/1941-10-01/ed-1/?sp=1&fo=json returned HTTP 403.\n"
           "Supply the page text instead: open https://www.loc.gov/resource/sn1/1941-10-01/ed-1/?sp=1 in the browser, save")
    call = lambda tool, argv: subprocess.CompletedProcess(argv, 2, "", err)
    assert run(data, "snapshot", factories.SLUG, "tmp-tour-r1-S-1", "--run-id", "tour-r1", call=call, sleep=lambda s: None) == 2
    out = capsys.readouterr().err
    assert "browser" not in out.replace("never open it in a browser", "") and "never open it in a browser" in out
    rows = records.read_jsonl(folder(data) / "staging" / "tour-r1.jsonl")
    rows.append(dict(rows[0], id="tmp-tour-r1-S-2", url="https://tile.loc.gov/text-services/x"))
    records.write_jsonl(folder(data) / "staging" / "tour-r1.jsonl", rows)
    never = lambda tool, argv: pytest.fail("must not be called")
    assert run(data, "snapshot", factories.SLUG, "tmp-tour-r1-S-2", "--run-id", "tour-r1", call=never, sleep=lambda s: None) == 2
    args = ["search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-loc", "--query", "x"]
    assert run(data, *args, opener=lambda *a, **k: pytest.fail("must not be called"), sleep=lambda s: None) == 3


def test_docs_refuse_while_staged_searches_or_candidates_are_unmerged(data, capsys):
    # Codex review round 4: a search made in Assemble, after the gate, was staged but never merged, and
    # docs counted it as logged in searches.jsonl
    assert run(data, "propose", factories.SLUG, "--run-id", "tour-r1") == 0
    staged = folder(data) / "staging" / "tour-wikidata.searches.jsonl"
    records.write_jsonl(staged, [{"date": "2026-11-03", "family": "tour-wikidata", "tool": "t", "query": "los angeles",
                                  "results": 1, "produced": [], "agent": None, "run_id": "tour-r1", "notes": ""}])
    assert run(data, "docs", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03") == 1
    err = capsys.readouterr().err
    assert "tour-wikidata.searches.jsonl" in err and "gate" in err
    assert not (folder(data) / "TOUR-RESEARCH.md").exists() and not (folder(data) / "export" / "tour.csv").exists()
    staged.unlink()
    cand = folder(data) / "staging" / "tour-r1.jsonl"
    records.write_jsonl(cand, [dict(factories.world()["facts"][1], id="tmp-tour-r1-F-1")])
    assert run(data, "docs", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03") == 1
    assert "tmp-tour-r1-F-1" in capsys.readouterr().err
    cand.unlink()
    assert run(data, "docs", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03") == 0


def test_docs_count_only_logged_searches(data):
    # a staged row is not in searches.jsonl, so it is never listed as one of the run's logged searches
    assert run(data, "propose", factories.SLUG, "--run-id", "tour-r1") == 0
    logged = records.read_jsonl(folder(data) / "searches.jsonl")
    row = {"id": "TST-Q-0099", "date": "2026-11-03", "family": "tour-ca", "tool": "t", "query": "test person",
           "results": 2, "produced": [], "agent": None, "run_id": "tour-r1", "notes": "URL: a"}
    records.write_jsonl(folder(data) / "searches.jsonl", logged + [row])
    staged = {k: v for k, v in row.items() if k != "id"}
    records.write_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl", [dict(staged, notes="URL: b")])
    assert [r["id"] for r in tour_research._run_searches(tour_research.paths.inductee_paths(factories.SLUG, str(data)),
                                                         "tour-r1")] == ["TST-Q-0099"]


@pytest.mark.parametrize("pagination", [["of", 3], "12", None, {"total": 3}])
def test_an_odd_pagination_is_a_logged_parse_failure(data, capsys, pagination):
    body = json.dumps({"pagination": pagination, "results": []}).encode()
    args = ["search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
            "--query", "test person"]
    assert run(data, *args, opener=lambda req, timeout=None: Resp(body), sleep=lambda s: None) == 1
    rows = records.read_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl")
    assert len(rows) == 1 and rows[0]["results"] is None
    assert "parse failed" in rows[0]["notes"] and "pagination" in rows[0]["notes"]
    assert tour_research.PENDING not in rows[0]["notes"]
    assert "parse failed" in capsys.readouterr().err


WEB = ["log", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-web",
       "--tool", "web search", "--query", "test person example college", "--agent", "research agent"]


def web_rows(data):
    return records.read_jsonl(folder(data) / "staging" / "tour-web.searches.jsonl")


def used(data):
    return json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())["searches_used"]


def test_a_web_search_is_checked_counted_and_logged_before_it_is_made(data):
    # Codex review round 5: a web search was logged only after it was made, outside the privacy check,
    # the budget and the log-before-the-request rule
    assert run(data, *WEB, "--before") == 0
    rows = web_rows(data)
    assert len(rows) == 1 and tour_research.PENDING in rows[0]["notes"] and rows[0]["results"] is None
    assert used(data) == 1
    assert run(data, *WEB, "--results", "8", "--notes", "leads only") == 0
    rows = web_rows(data)
    assert len(rows) == 1 and rows[0]["results"] == 8 and rows[0]["notes"] == "leads only"
    assert used(data) == 1  # the try was counted once, before it was made


def test_a_web_search_over_the_budget_or_with_personal_data_is_refused_before_it_is_made(data, capsys):
    assert run(data, *WEB[:-4], "--query", "someone@example.org", "--agent", "research agent", "--before") == 3
    assert not (folder(data) / "staging" / "tour-web.searches.jsonl").exists()
    assert run(data, "search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
               "--query", "x", "--budget", "1", opener=lambda req, timeout=None: (_ for _ in ()).throw(OSError("down")),
               sleep=lambda s: None) == 1
    assert run(data, *WEB, "--before") == 3
    assert "budget" in capsys.readouterr().err and not (folder(data) / "staging" / "tour-web.searches.jsonl").exists()


def test_a_privacy_refusal_is_recorded_in_the_run_without_the_personal_text(data):
    # Codex review round 9: log --before returned on a privacy refusal before loading the run, so the
    # refusal was missing from run.json; the search path kept the refused query text itself
    assert run(data, *WEB[:-4], "--query", "someone@example.org", "--agent", "research agent", "--before") == 3
    assert run(data, "search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
               "--query", "other@example.org", opener=lambda *a, **k: pytest.fail("must not be called"),
               sleep=lambda s: None) == 3
    st = run_state(data)
    assert [r["family"] for r in st["refused"]] == ["tour-web", "tour-ca"]
    assert all("email address" in r["reason"] for r in st["refused"])
    raw = (folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text()
    assert "example.org" not in raw and "someone" not in raw and "other@" not in raw
    assert st["searches_used"] == 0
    assert not (folder(data) / "staging" / "tour-web.searches.jsonl").exists()


def test_a_web_search_logged_only_afterwards_is_counted_and_marked(data):
    assert run(data, *WEB, "--results", "3") == 0
    rows = web_rows(data)
    assert len(rows) == 1 and rows[0]["results"] == 3 and "without the pre-check" in rows[0]["notes"]
    assert used(data) == 1


def run_state(data):
    return json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())


def test_a_search_is_counted_on_disk_before_the_request_leaves(data):
    # Codex review round 6: the budget was saved only after the request returned, so a process killed
    # mid-request left a sent request uncounted
    seen = {}

    def opener(req, timeout=None):
        seen["st"] = run_state(data)
        raise KeyboardInterrupt
    args = ["search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
            "--query", "test person"]
    with pytest.raises(KeyboardInterrupt):
        run(data, *args, opener=opener, sleep=lambda s: None)
    assert seen["st"]["searches_used"] == 1 and seen["st"]["in_flight"]["kind"] == "search"
    assert "www.loc.gov" in seen["st"]["last_request"]
    # a later command finds the attempt that never finished and records it as a failure of unknown outcome
    st = run_state(data)
    st["in_flight"] = seen["st"]["in_flight"]  # as a killed process would have left it
    records.write_json(folder(data) / "staging" / "tour" / "tour-r1" / "run.json", st)
    body = json.dumps({"pagination": {"of": 1}, "results": []}).encode()
    assert run(data, *args, opener=lambda req, timeout=None: Resp(body), sleep=lambda s: None) == 0
    st = run_state(data)
    assert st["in_flight"] is None and st["searches_used"] == 2
    assert any("outcome unknown" in f.get("stderr", "") for f in st["failures"])


def test_a_snapshot_is_counted_on_disk_before_fetch_snapshot_runs(data):
    staged_source(data)
    seen = {}

    def call(tool, argv):
        seen["st"] = run_state(data)
        return subprocess.CompletedProcess(argv, 0, "", "")
    assert run(data, "snapshot", factories.SLUG, "tmp-tour-r1-S-1", "--run-id", "tour-r1", call=call, sleep=lambda s: None) == 0
    assert seen["st"]["snapshots_used"] == 1 and seen["st"]["in_flight"]["kind"] == "snapshot"
    assert "records.example.org" in seen["st"]["last_request"]
    assert run_state(data)["in_flight"] is None


def test_a_query_that_does_not_settle_when_decoded_is_refused_and_logged(data):
    # Codex review round 8: decoding to a fixed point needs a cap; input past it is refused, not sent
    args = ["search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
            "--query", "%" + "25" * 80 + "40"]
    assert run(data, *args, opener=lambda *a, **k: pytest.fail("must not be called"), sleep=lambda s: None) == 3
    st = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())
    assert st["searches_used"] == 0 and "did not settle" in st["refused"][-1]["reason"]


def test_a_json_captcha_answer_blocks_the_host_and_is_logged(data, capsys):
    # Codex review round 8: a 200 JSON answer {"error": "captcha required"} returned as a result
    args = ["search", factories.SLUG, "--run-id", "tour-r1", "--date", "2026-11-03", "--family", "tour-ca",
            "--query", "test person", "--dates", "1941/1941", "--agent", "research agent"]
    body = json.dumps({"error": "captcha required"}).encode()
    assert run(data, *args, opener=lambda req, timeout=None: Resp(body), sleep=lambda s: None) == 2
    rows = records.read_jsonl(folder(data) / "staging" / "tour-ca.searches.jsonl")
    assert "blocked" in rows[-1]["notes"] and "challenge" in rows[-1]["notes"]
    st = json.loads((folder(data) / "staging" / "tour" / "tour-r1" / "run.json").read_text())
    assert "challenge" in st["blocked_hosts"]["www.loc.gov"]
    assert run(data, *args, opener=lambda *a, **k: pytest.fail("must not be called"), sleep=lambda s: None) == 3
