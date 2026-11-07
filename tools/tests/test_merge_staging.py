"""Tests for tools/merge_staging.py (SPEC sections 2, 3, 6)."""

import hashlib
import json

import compute_status
import factories as fx
import merge_staging as ms
import pytest
import validate
from ihh import paths

RUN2 = "run-test-2"
SOCIETY_TEXT = ("Test Person received the Example Medal in 1950.\n"
                "Item: photograph of the Example Medal.\n"
                "Rights: No known restrictions on publication.\n")


def sha(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def write_staged_snapshot(root, tid, text, url, method="http"):
    folder = root / "staging" / "snapshots"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f"{tid}.txt").write_bytes(text.encode("utf-8"))
    meta = {"url": url, "fetch_url": url, "method": method, "fetched_at": "2026-10-08T00:00:00Z",
            "sha256": sha(text), "bytes": len(text.encode("utf-8")), "http_status": 200}
    (folder / f"{tid}.meta.json").write_text(json.dumps(meta) + "\n", encoding="utf-8")


def staged_source(root, tid, url, text, institution="Example Historical Society", stype="institutional",
                  method="http"):
    rec = fx.source(tid, "Test Person medal record", institution, stype, url)
    if text is not None:
        write_staged_snapshot(root, tid, text, url, method)
        rec.update(snapshot=f"staging/snapshots/{tid}.txt", snapshot_sha256=sha(text), fetch_method=method)
    return rec


def candidate(tid, claim, category, evidence, **extra):
    extra.setdefault("status", "pending")
    rec = fx.fact(tid, claim, category, evidence, adversary=None, **extra)
    rec["extractor"]["run_id"] = RUN2
    return rec


def staged_media(tid, source_ids, alt):
    return {
        "id": tid, "title": "Example Medal photograph", "media_type": "image", "source_ids": source_ids,
        "url": "https://society.example.org/medal.jpg",
        "rights_statement": "No known restrictions on publication.",
        "rights_url": "https://society.example.org/test-person", "license_class": "public-domain",
        "credit": "Example Historical Society", "alt_text": alt, "reconstruction": False,
        "reconstruction_basis": [], "adversary": None, "status": "pending", "verified_claim_sha256": None,
        "review": {"state": "pending", "reviewer": None, "date": None, "note": ""}, "notes": "",
    }


def write_lines(path, rows):
    path.write_text("".join(json.dumps(r) + "\n" for r in rows), encoding="utf-8")


def standard_staging(root):
    src = staged_source(root, "tmp-loc-S-1", "https://society.example.org/test-person", SOCIETY_TEXT)
    facts = [
        candidate("tmp-loc-F-1", "Test Person received the Example Medal in 1950.", "award",
                  [("tmp-loc-S-1", "Test Person received the Example Medal in 1950")], event_date="1950"),
        candidate("tmp-loc-F-2", "Test Person taught at Example College.", "career",
                  [("tmp-loc-S-1", "Test Person received the Example Medal in 1950")]),
        candidate("tmp-loc-F-3", "Test Person arrived in the United States in June 1941.", "immigration",
                  [("TST-S-0002", "arrived in the United States in June 1941")], event_date="1941-06"),
    ]
    media = staged_media("tmp-loc-M-1", ["tmp-loc-S-1"], "Photograph of the Example Medal (tmp-loc-F-1).")
    write_lines(root / "staging" / "loc.jsonl", [src, *facts, media])
    searches = [
        {"id": "tmp-loc-Q-1", "date": "2026-10-08", "family": "loc", "tool": "Example search API",
         "query": "test person medal", "results": 2,
         "produced": ["tmp-loc-S-1", "tmp-loc-F-1", "tmp-loc-F-2", "tmp-loc-M-1", "tmp-loc-F-99"],
         "agent": "search-loc", "run_id": RUN2, "notes": ""},
        {"date": "2026-10-08", "family": "loc", "tool": "Example search API", "query": "test person nothing",
         "results": 0, "produced": [], "agent": "search-loc", "run_id": RUN2, "notes": ""},
    ]
    write_lines(root / "staging" / "loc.searches.jsonl", searches)


def setup(tmp_path, w=None):
    root = fx.write_world(tmp_path, w or fx.world())
    return root


def run(tmp_path, *args):
    return ms.main(["testperson", *args, "--data-dir", str(tmp_path)])


def snapshot_main_files(root):
    return {name: (root / name).read_bytes() for name in
            ("facts.jsonl", "sources.jsonl", "media.jsonl", "searches.jsonl", "inductee.json")}


# --- the normal merge --------------------------------------------------------------------

def test_merge_assigns_ids_rewrites_references_and_appends(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    assert run(tmp_path) == 0
    out = capsys.readouterr().out

    sources = fx.read_rows(root, "sources")
    assert [s["id"] for s in sources][-1] == "TST-S-0005"
    new_src = fx.by_id(sources, "TST-S-0005")
    assert new_src["snapshot"] == "snapshots/TST-S-0005.txt"
    assert (root / "snapshots" / "TST-S-0005.txt").read_text(encoding="utf-8") == SOCIETY_TEXT
    assert (root / "snapshots" / "TST-S-0005.meta.json").is_file()

    facts = fx.read_rows(root, "facts")
    assert [f["id"] for f in facts][-2:] == ["TST-F-0005", "TST-F-0006"]
    medal = fx.by_id(facts, "TST-F-0005")
    assert medal["evidence"][0]["source_id"] == "TST-S-0005"
    assert medal["status"] == "pending"
    assert medal["adversary"] is None
    assert medal["verified_claim_sha256"] is None
    assert medal["used_in"] == []
    assert medal["review"]["state"] == "pending"
    assert list(medal) == list(fx.world()["facts"][0])
    assert fx.by_id(facts, "TST-F-0006")["evidence"][0]["source_id"] == "TST-S-0002"
    assert not any(f["claim"] == "Test Person taught at Example College." and f["id"] != "TST-F-0003"
                   for f in facts)
    assert "tmp-loc-F-2" in out and "TST-F-0003" in out  # the refused duplicate is reported

    media = fx.read_rows(root, "media")
    new_media = fx.by_id(media, "TST-M-0002")
    assert new_media["source_ids"] == ["TST-S-0005"]
    assert new_media["alt_text"] == "Photograph of the Example Medal (TST-F-0005)."

    searches = fx.read_rows(root, "searches")
    q2 = fx.by_id(searches, "TST-Q-0002")
    assert q2["produced"] == ["TST-S-0005", "TST-F-0005", "TST-F-0003", "TST-M-0002"]
    assert "tmp-loc-F-99" in q2["notes"]
    assert fx.by_id(searches, "TST-Q-0003")["query"] == "test person nothing"

    inductee = json.loads((root / "inductee.json").read_text(encoding="utf-8"))
    run2 = [r for r in inductee["runs"] if r["run_id"] == RUN2]
    assert len(run2) == 1 and run2[0]["date"]
    assert "2 facts" in run2[0]["notes"]

    merged = root / "staging" / "merged" / RUN2
    assert (merged / "loc.jsonl").is_file() and (merged / "loc.searches.jsonl").is_file()
    assert (merged / "snapshots" / "tmp-loc-S-1.txt").is_file()
    assert not (root / "staging" / "loc.jsonl").exists()
    assert not (root / "staging" / "snapshots" / "tmp-loc-S-1.txt").exists()

    p = paths.inductee_paths("testperson", tmp_path)
    compute_status.run(p)
    assert validate.validate_inductee(p).errors == []


def test_rerun_is_a_no_op(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    assert run(tmp_path) == 0
    before = snapshot_main_files(root)
    assert run(tmp_path) == 0
    assert "nothing to merge" in capsys.readouterr().out.lower()
    assert snapshot_main_files(root) == before


def test_dry_run_writes_nothing(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    before = snapshot_main_files(root)
    assert run(tmp_path, "--dry-run") == 0
    out = capsys.readouterr().out
    assert "tmp-loc-F-1 -> TST-F-0005" in out
    assert snapshot_main_files(root) == before
    assert (root / "staging" / "loc.jsonl").is_file()
    assert not (root / "staging" / "merged").exists()


def test_run_id_option_overrides(tmp_path):
    root = setup(tmp_path)
    standard_staging(root)
    assert run(tmp_path, "--run-id", "testperson-2026-10-08") == 0
    inductee = json.loads((root / "inductee.json").read_text(encoding="utf-8"))
    assert inductee["runs"][-1]["run_id"] == "testperson-2026-10-08"
    assert (root / "staging" / "merged" / "testperson-2026-10-08" / "loc.jsonl").is_file()


def test_ids_are_never_reused(tmp_path):
    w = fx.world()
    rejected = fx.fact("TST-F-0009", "Test Person taught at Example College for 13 years.", "career",
                       [("TST-S-0003", "taught at Example College for 13 years")], status="rejected")
    rejected["extractor"]["verdict"] = "withdrawn"
    w["facts"].append(rejected)
    root = setup(tmp_path, w)
    standard_staging(root)
    assert run(tmp_path) == 0
    assert [f["id"] for f in fx.read_rows(root, "facts")][-2:] == ["TST-F-0010", "TST-F-0011"]


def test_duplicate_of_rejected_fact_is_still_refused(tmp_path, capsys):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["status"] = "rejected"
    fx.by_id(w["facts"], "TST-F-0003")["verified_claim_sha256"] = None
    root = setup(tmp_path, w)
    standard_staging(root)
    assert run(tmp_path) == 0
    out = capsys.readouterr().out
    assert "TST-F-0003" in out and "rejected" in out


def test_duplicates_within_staging_are_refused(tmp_path):
    root = setup(tmp_path)
    src = staged_source(root, "tmp-loc-S-1", "https://society.example.org/test-person", SOCIETY_TEXT)
    a = candidate("tmp-loc-F-1", "Test Person received the Example Medal in 1950.", "award",
                  [("tmp-loc-S-1", "Test Person received the Example Medal in 1950")])
    b = candidate("tmp-nara-F-1", "test person received  the Example Medal in 1950.", "award",
                  [("tmp-loc-S-1", "Test Person received the Example Medal in 1950")])
    write_lines(root / "staging" / "loc.jsonl", [src, a])
    write_lines(root / "staging" / "nara.jsonl", [b])
    write_lines(root / "staging" / "nara.searches.jsonl", [
        {"id": "tmp-nara-Q-1", "date": "2026-10-08", "family": "nara", "tool": "t", "query": "q",
         "results": 1, "produced": ["tmp-nara-F-1"], "agent": "a", "run_id": RUN2, "notes": ""}])
    assert run(tmp_path) == 0
    facts = fx.read_rows(root, "facts")
    assert [f["id"] for f in facts][-1] == "TST-F-0005"
    assert fx.by_id(fx.read_rows(root, "searches"), "TST-Q-0002")["produced"] == ["TST-F-0005"]


def test_source_identical_to_existing_is_reused(tmp_path, capsys):
    root = setup(tmp_path)
    text = fx.SNAPSHOT_TEXT["TST-S-0003"]
    src = staged_source(root, "tmp-inst-S-1", "https://news.example.org/test-person", text,
                        institution="Example News", stype="secondary")
    fact = candidate("tmp-inst-F-1", "Test Person arrived in 1941.", "immigration",
                     [("tmp-inst-S-1", "arrived in 1941")])
    write_lines(root / "staging" / "institutional.jsonl", [src, fact])
    assert run(tmp_path) == 0
    assert [s["id"] for s in fx.read_rows(root, "sources")][-1] == "TST-S-0004"
    assert fx.by_id(fx.read_rows(root, "facts"), "TST-F-0005")["evidence"][0]["source_id"] == "TST-S-0003"
    assert "TST-S-0003" in capsys.readouterr().out


def test_conflicting_status_is_kept(tmp_path):
    root = setup(tmp_path)
    src = staged_source(root, "tmp-loc-S-1", "https://society.example.org/test-person", SOCIETY_TEXT)
    fact = candidate("tmp-loc-F-1", "Test Person received the Example Medal in 1950.", "award",
                     [("tmp-loc-S-1", "Test Person received the Example Medal in 1950")], status="conflicting",
                     notes="Example Historical Society gives 1950; another source gives 1951.")
    write_lines(root / "staging" / "loc.jsonl", [src, fact])
    assert run(tmp_path) == 0
    assert fx.by_id(fx.read_rows(root, "facts"), "TST-F-0005")["status"] == "conflicting"


def test_non_candidate_files_are_ignored_and_left_in_place(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    copy = root / "staging" / "facts.before-corroborate-run-test-2.jsonl"
    copy.write_bytes((root / "facts.jsonl").read_bytes())
    verdicts = root / "staging" / "claude-verdicts-run-test-2-a.jsonl"
    write_lines(verdicts, [{"item_id": "TST-F-0001", "verdict": "supported"}])
    assert run(tmp_path) == 0
    out = capsys.readouterr().out
    assert copy.is_file() and verdicts.is_file()
    assert "ignored" in out and copy.name in out


def test_subfolders_of_staging_are_not_read(tmp_path):
    root = setup(tmp_path)
    raw = root / "staging" / "raw-run-test-2"
    raw.mkdir(parents=True)
    src = staged_source(root, "tmp-loc-S-1", "https://society.example.org/test-person", SOCIETY_TEXT)
    write_lines(raw / "loc.jsonl", [src])
    before = snapshot_main_files(root)
    assert run(tmp_path) == 0
    assert snapshot_main_files(root) == before


# --- refusals: nothing is written ---------------------------------------------------------------

def assert_refused(tmp_path, root, capsys, expected):
    before = snapshot_main_files(root)
    staging_before = sorted(p.name for p in (root / "staging").iterdir())
    assert run(tmp_path) == 1
    err = capsys.readouterr().err
    assert expected in err
    assert snapshot_main_files(root) == before
    assert sorted(p.name for p in (root / "staging").iterdir()) == staging_before


def test_unknown_temporary_source_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    rows = [json.loads(x) for x in (root / "staging" / "loc.jsonl").read_text().splitlines()]
    rows[1]["evidence"][0]["source_id"] = "tmp-loc-S-9"
    write_lines(root / "staging" / "loc.jsonl", rows)
    assert_refused(tmp_path, root, capsys, "tmp-loc-S-9")


def test_unknown_permanent_source_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    rows = [json.loads(x) for x in (root / "staging" / "loc.jsonl").read_text().splitlines()]
    rows[3]["evidence"][0]["source_id"] = "TST-S-0042"
    write_lines(root / "staging" / "loc.jsonl", rows)
    assert_refused(tmp_path, root, capsys, "TST-S-0042")


def test_temporary_id_collision_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    src = staged_source(root, "tmp-nara-S-1", "https://archives.example.org/id/77", None)
    src["id"] = "tmp-loc-S-1"
    write_lines(root / "staging" / "nara.jsonl", [src])
    assert_refused(tmp_path, root, capsys, "tmp-loc-S-1")


@pytest.mark.parametrize("field,value,message", [
    ("status", "verified", "status"),
    ("adversary", {"verdict": "supported"}, "adversary"),
    ("verified_claim_sha256", "0" * 64, "verified_claim_sha256"),
    ("review", {"state": "approved", "reviewer": "X", "date": "2026-10-08", "note": ""}, "review"),
    ("inductee", "someoneelse", "inductee"),
])
def test_candidates_may_not_carry_derived_fields(tmp_path, capsys, field, value, message):
    root = setup(tmp_path)
    standard_staging(root)
    rows = [json.loads(x) for x in (root / "staging" / "loc.jsonl").read_text().splitlines()]
    rows[1][field] = value
    write_lines(root / "staging" / "loc.jsonl", rows)
    assert_refused(tmp_path, root, capsys, message)


def test_tampered_staged_snapshot_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    (root / "staging" / "snapshots" / "tmp-loc-S-1.txt").write_text("changed\n", encoding="utf-8")
    assert_refused(tmp_path, root, capsys, "sha256")


def test_snapshot_outside_staging_snapshots_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    rows = [json.loads(x) for x in (root / "staging" / "loc.jsonl").read_text().splitlines()]
    rows[0]["snapshot"] = "snapshots/TST-S-0003.txt"
    write_lines(root / "staging" / "loc.jsonl", rows)
    assert_refused(tmp_path, root, capsys, "staging/snapshots/tmp-loc-S-1.txt")


def test_mixed_file_with_permanent_ids_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    with (root / "staging" / "loc.jsonl").open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(fx.world()["facts"][0]) + "\n")
    assert_refused(tmp_path, root, capsys, "TST-F-0001")


def test_invalid_json_line_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    with (root / "staging" / "loc.jsonl").open("a", encoding="utf-8") as fh:
        fh.write("{broken\n")
    assert_refused(tmp_path, root, capsys, "invalid JSON")


def test_unknown_slug_exits_2(tmp_path):
    setup(tmp_path)
    assert ms.main(["nobody", "--data-dir", str(tmp_path)]) == 2


# --- the tools together, as the workflow runs them ------------------------------------------------

def test_stage_fetch_merge_validate(tmp_path):
    import fetch_snapshot

    root = setup(tmp_path)
    src = fx.source("tmp-domain-S-1", "Example Medal register", "Example Historical Society", "institutional",
                    "https://society.example.org/register")
    write_lines(root / "staging" / "domain.jsonl", [src])
    browser = root / "staging" / "browser"
    browser.mkdir()
    (browser / "tmp-domain-S-1.txt").write_text(SOCIETY_TEXT, encoding="utf-8")
    assert fetch_snapshot.main(["testperson", "tmp-domain-S-1", "--from-file", str(browser / "tmp-domain-S-1.txt"),
                                "--method", "browser", "--data-dir", str(tmp_path)]) == 0
    staged = json.loads((root / "staging" / "domain.jsonl").read_text(encoding="utf-8").splitlines()[0])
    assert staged["snapshot"] == "staging/snapshots/tmp-domain-S-1.txt"

    fact = candidate("tmp-domain-F-1", "Test Person received the Example Medal in 1950.", "award",
                     [("tmp-domain-S-1", "Test Person received the Example Medal in 1950")], event_date="1950")
    with (root / "staging" / "domain.jsonl").open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(fact) + "\n")
    assert run(tmp_path) == 0

    source = fx.by_id(fx.read_rows(root, "sources"), "TST-S-0005")
    assert source["fetch_method"] == "browser"
    assert source["snapshot"] == "snapshots/TST-S-0005.txt"
    assert (root / "snapshots" / "TST-S-0005.txt").read_text(encoding="utf-8") == SOCIETY_TEXT
    p = paths.inductee_paths("testperson", tmp_path)
    compute_status.run(p)
    report = validate.validate_inductee(p)
    assert report.errors == []
    assert fx.by_id(fx.read_rows(root, "facts"), "TST-F-0005")["status"] == "pending"  # awaits the adversary


def test_temporary_ids_may_carry_a_fact_id_label(tmp_path):
    """Corroboration agents label temp ids after the fact they corroborate."""
    root = setup(tmp_path)
    tid = "tmp-corroborate-TST-F-0003-S-1"
    src = staged_source(root, tid, "https://society.example.org/test-person", SOCIETY_TEXT)
    write_lines(root / "staging" / "corroborate-TST-F-0003.jsonl", [src])
    write_lines(root / "staging" / "corroborate-TST-F-0003.searches.jsonl", [
        {"date": "2026-10-08", "family": "corroborate", "tool": "t", "query": "q", "results": 1,
         "produced": [tid], "agent": "corroborate-TST-F-0003", "run_id": RUN2, "notes": ""}])
    assert run(tmp_path) == 0
    assert [s["id"] for s in fx.read_rows(root, "sources")][-1] == "TST-S-0005"
    assert fx.read_rows(root, "searches")[-1]["produced"] == ["TST-S-0005"]


def test_malformed_temporary_id_is_refused_not_ignored(tmp_path, capsys):
    root = setup(tmp_path)
    src = staged_source(root, "tmp-loc-S-1", "https://society.example.org/test-person", None)
    src["id"] = "tmp_loc_S_1"
    write_lines(root / "staging" / "loc.jsonl", [src])
    assert_refused(tmp_path, root, capsys, "tmp_loc_S_1")


def test_malformed_values_are_refused_not_crashed(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    rows = [json.loads(x) for x in (root / "staging" / "loc.jsonl").read_text().splitlines()]
    rows[0]["url"] = ["https://society.example.org/test-person"]
    rows[0]["snapshot_sha256"] = ["not", "a", "hash"]
    rows[4]["url"] = {"href": "https://society.example.org/medal.jpg"}
    write_lines(root / "staging" / "loc.jsonl", rows)
    assert_refused(tmp_path, root, capsys, "url")


def test_staged_snapshot_from_another_page_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    standard_staging(root)
    staged = sorted((root / "staging" / "snapshots").glob("*.meta.json"))[0]
    meta = json.loads(staged.read_text(encoding="utf-8"))
    meta["url"] = meta["fetch_url"] = "https://unrelated.example.org/other-page"
    staged.write_text(json.dumps(meta), encoding="utf-8")
    assert run(tmp_path) != 0
    captured = capsys.readouterr()
    assert "meta url" in captured.out + captured.err


# --- Class B: the merge refuses a source type the authority registry does not allow -------------

def test_primary_source_on_an_unregistered_host_is_refused(tmp_path, capsys):
    root = setup(tmp_path)
    src = staged_source(root, "tmp-loc-S-1", "https://letters.example.com/test-person", SOCIETY_TEXT,
                        institution="Example Letters", stype="primary")
    fact = candidate("tmp-loc-F-1", "Test Person received the Example Medal in 1950.", "award",
                     [("tmp-loc-S-1", "Test Person received the Example Medal in 1950")], event_date="1950")
    write_lines(root / "staging" / "loc.jsonl", [src, fact])
    assert_refused(tmp_path, root, capsys, "authority registry")


def test_blank_institution_is_filled_from_the_registry(tmp_path):
    root = setup(tmp_path)
    src = staged_source(root, "tmp-loc-S-1", "https://society.example.org/test-person", SOCIETY_TEXT,
                        institution="")
    fact = candidate("tmp-loc-F-1", "Test Person received the Example Medal in 1950.", "award",
                     [("tmp-loc-S-1", "Test Person received the Example Medal in 1950")], event_date="1950")
    write_lines(root / "staging" / "loc.jsonl", [src, fact])
    assert run(tmp_path) == 0
    merged = fx.read_rows(root, "sources")[-1]
    assert merged["url"] == "https://society.example.org/test-person"
    assert merged["institution"] == "Example Historical Society"


def test_fetch_url_naming_another_record_is_refused(tmp_path, capsys):
    # Class C: refused at merge even before a snapshot exists.
    root = setup(tmp_path)
    src = staged_source(root, "tmp-loc-S-1", "https://society.example.org/test-person", None)
    src["fetch_url"] = "https://society.example.org/someone-else"
    write_lines(root / "staging" / "loc.jsonl", [src])
    assert_refused(tmp_path, root, capsys, "not the cited record")


# --- the approved LoC / NARA rights rule (ihh/rights.py) -----------------------------------------

def rule_world():
    w = fx.world()
    w["registry"]["entries"] += fx.RULE_REGISTRY_ENTRIES
    return w


def stage_holder_media(root, holder, snapshot_text, statement, license_class):
    host, name = fx.RULE_HOSTS[holder], fx.RULE_INSTITUTIONS[holder]
    url = f"https://{host}/item/7"
    src = staged_source(root, "tmp-rights-S-1", url, snapshot_text, institution=name,
                         stype="primary" if holder in ("loc", "nara") else "secondary")
    media = staged_media("tmp-rights-M-1", ["tmp-rights-S-1"], "Example Medal photograph.")
    media.update(url=f"https://{host}/media/7.jpg", rights_statement=statement,
                 rights_url=url if statement else None, license_class=license_class, credit=name)
    write_lines(root / "staging" / "rights.jsonl", [src, media])


def merged_media(root):
    return [m for m in fx.read_rows(root, "media") if m["id"] != "TST-M-0001"]


def test_merge_sets_public_domain_by_the_approved_rule(tmp_path, capsys):
    root = setup(tmp_path, rule_world())
    stage_holder_media(root, "loc", "rights_advisory: No known restrictions on publication.\n",
                       "No known restrictions on publication.", "unknown")
    assert run(tmp_path) == 0
    [m] = merged_media(root)
    assert m["license_class"] == "public-domain"
    assert "approved rights rule" in capsys.readouterr().out


def test_merge_copies_a_missing_statement_from_the_holder_snapshot(tmp_path):
    root = setup(tmp_path, rule_world())
    stage_holder_media(root, "nara", "useRestriction.status: Unrestricted\n", None, "unknown")
    assert run(tmp_path) == 0
    [m] = merged_media(root)
    assert (m["rights_statement"], m["rights_url"], m["license_class"]) == \
        ("Unrestricted", "https://nara.example.org/item/7", "public-domain")


def test_merge_refuses_a_barred_item_marked_usable(tmp_path, capsys):
    root = setup(tmp_path, rule_world())
    stage_holder_media(root, "nara", "useRestriction.status: Restricted - Possibly\n"
                       "accessRestriction.status: Unrestricted\n", "Unrestricted", "public-domain")
    assert_refused(tmp_path, root, capsys, "approved rights rule")


def test_merge_never_takes_public_domain_from_a_commons_tag(tmp_path):
    root = setup(tmp_path, rule_world())
    stage_holder_media(root, "commons", "LicenseShortName: Public domain\n"
                       "rights_advisory: No known restrictions on publication.\n", None, "unknown")
    assert run(tmp_path) == 0
    [m] = merged_media(root)
    assert (m["rights_statement"], m["license_class"]) == (None, "unknown")


# --- a repeated search (Codex review round 4, 2026-11-01) --------------------------------

def _repeat_row(notes, produced, results):
    return {"date": "2026-10-08", "family": "loc", "tool": "Example search API", "query": "test person medal",
            "results": results, "produced": produced, "agent": "search-loc", "run_id": RUN2, "notes": notes}


def test_a_search_repeated_after_its_first_merge_is_folded_into_the_logged_row(tmp_path, capsys):
    # the second try of a logged search (same date, family, tool, query, agent, run id) was refused as
    # "already logged": its notes and the candidates it produced never reached searches.jsonl
    root = setup(tmp_path)
    standard_staging(root)
    assert run(tmp_path) == 0
    n_before = len(fx.read_rows(root, "searches"))
    src = staged_source(root, "tmp-loc-S-2", "https://society.example.org/test-person-2",
                        SOCIETY_TEXT + "Second page.\n")
    write_lines(root / "staging" / "loc.jsonl", [src])
    write_lines(root / "staging" / "loc.searches.jsonl", [_repeat_row("URL: second try", ["tmp-loc-S-2"], 7)])
    assert run(tmp_path) == 0
    out = capsys.readouterr().out
    searches = fx.read_rows(root, "searches")
    assert len(searches) == n_before
    q2 = fx.by_id(searches, "TST-Q-0002")
    assert "tmp-loc-F-99" in q2["notes"] and "URL: second try" in q2["notes"]
    assert q2["produced"] == ["TST-S-0005", "TST-F-0005", "TST-F-0003", "TST-M-0002", "TST-S-0006"]
    assert q2["results"] == 7
    assert "already logged" not in out and "TST-Q-0002" in out
    p = paths.inductee_paths("testperson", tmp_path)
    compute_status.run(p)
    assert validate.validate_inductee(p).errors == []
    # merging the same staged try again (an interrupted merge re-run) adds nothing twice
    before = snapshot_main_files(root)
    write_lines(root / "staging" / "loc.searches.jsonl", [_repeat_row("URL: second try", ["TST-S-0006"], 7)])
    assert run(tmp_path) == 0
    assert snapshot_main_files(root)["searches.jsonl"] == before["searches.jsonl"]


def test_a_staged_try_that_already_holds_the_logged_notes_replaces_them_not_repeats_them(tmp_path):
    # tour_research folds a repeat into its staged row ("<first>; then: <second>"); merged after the
    # first try was logged, the logged notes are kept once and the later try is added
    root = setup(tmp_path)
    write_lines(root / "staging" / "loc.searches.jsonl", [_repeat_row("URL: a", [], 1)])
    assert run(tmp_path) == 0
    write_lines(root / "staging" / "loc.searches.jsonl", [_repeat_row("URL: a; then: URL: b", [], 2)])
    assert run(tmp_path) == 0
    row = fx.read_rows(root, "searches")[-1]
    assert row["notes"] == "URL: a; then: URL: b" and row["results"] == 2


def test_two_staged_rows_of_one_search_are_folded_into_one_row(tmp_path, capsys):
    root = setup(tmp_path)
    write_lines(root / "staging" / "loc.searches.jsonl", [_repeat_row("URL: a", [], 1), _repeat_row("URL: b", [], None)])
    n_before = len(fx.read_rows(root, "searches"))
    assert run(tmp_path) == 0
    searches = fx.read_rows(root, "searches")
    assert len(searches) == n_before + 1
    assert searches[-1]["notes"] == "URL: a; then: URL: b" and searches[-1]["results"] == 1
