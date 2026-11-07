"""Tests for tools/ihh/records.py, ids.py and paths.py."""

import json
import os

import pytest

from ihh import ids, paths, records


# --- records ------------------------------------------------------------------

def test_jsonl_round_trip_preserves_key_order_and_unicode(tmp_path):
    path = tmp_path / "facts.jsonl"
    rows = [{"id": "TST-F-0001", "claim": "Z\u00fcrich \u2014 test", "a": 1}, {"z": None, "b": [1, 2]}]
    records.write_jsonl(path, rows)
    text = path.read_text(encoding="utf-8")
    assert "Z\u00fcrich" in text  # not \u-escaped
    assert text.endswith("\n") and text.count("\n") == 2
    back = records.read_jsonl(path)
    assert back == rows
    assert [list(r) for r in back] == [list(r) for r in rows]


def test_missing_file_reads_as_empty(tmp_path):
    assert records.read_jsonl(tmp_path / "none.jsonl") == []


def test_invalid_json_raises_with_line(tmp_path):
    path = tmp_path / "facts.jsonl"
    path.write_text('{"id": 1}\n\n{broken\n', encoding="utf-8")
    with pytest.raises(records.RecordError) as exc:
        records.read_jsonl(path)
    assert "facts.jsonl:3" in str(exc.value)
    rows, problems = records.read_jsonl_lenient(path)
    assert rows == [{"id": 1}]
    assert problems and "facts.jsonl:3" in problems[0]


def test_write_is_atomic_and_leaves_no_temp_files(tmp_path):
    path = tmp_path / "facts.jsonl"
    records.write_jsonl(path, [{"id": "a"}])
    records.write_jsonl(path, [{"id": "b"}])
    assert sorted(p.name for p in tmp_path.iterdir()) == ["facts.jsonl"]
    assert records.read_jsonl(path) == [{"id": "b"}]


def test_write_keeps_existing_file_mode(tmp_path):
    path = tmp_path / "facts.jsonl"
    path.write_text("", encoding="utf-8")
    os.chmod(path, 0o644)
    records.write_jsonl(path, [{"id": "a"}])
    assert (path.stat().st_mode & 0o777) == 0o644


def test_failed_write_leaves_original_intact(tmp_path):
    path = tmp_path / "facts.jsonl"
    records.write_jsonl(path, [{"id": "a"}])
    with pytest.raises(TypeError):
        records.write_jsonl(path, [{"id": object()}])
    assert records.read_jsonl(path) == [{"id": "a"}]
    assert sorted(p.name for p in tmp_path.iterdir()) == ["facts.jsonl"]


def test_lock_is_reentrant(tmp_path):
    path = tmp_path / "facts.jsonl"
    with records.locked(path):
        with records.locked(path):
            records.write_jsonl(path, [{"id": "a"}])
    assert records.read_jsonl(path) == [{"id": "a"}]


def test_update_jsonl(tmp_path):
    path = tmp_path / "facts.jsonl"
    records.write_jsonl(path, [{"id": "a"}])
    records.update_jsonl(path, lambda rows: rows + [{"id": "b"}])
    assert [r["id"] for r in records.read_jsonl(path)] == ["a", "b"]


def test_json_round_trip(tmp_path):
    path = tmp_path / "inductee.json"
    obj = {"slug": "testperson", "name": "Test Person", "aliases": []}
    records.write_json(path, obj)
    assert records.read_json(path) == obj
    assert list(json.loads(path.read_text())) == ["slug", "name", "aliases"]


def test_set_field_inserts_in_spec_position():
    rec = {"id": "TST-F-0001", "claim": "x", "status": "pending", "used_in": []}
    records.set_field(rec, "fact", "verified_claim_sha256", None)
    assert list(rec) == ["id", "claim", "status", "verified_claim_sha256", "used_in"]
    records.set_field(rec, "fact", "status", "verified")
    assert list(rec) == ["id", "claim", "status", "verified_claim_sha256", "used_in"]
    assert rec["status"] == "verified"


def test_load_snapshot_reads_text_sha_and_meta(tmp_path):
    (tmp_path / "snapshots").mkdir()
    (tmp_path / "snapshots" / "TST-S-0001.txt").write_bytes(b"hello\n")
    (tmp_path / "snapshots" / "TST-S-0001.meta.json").write_text('{"sha256": "x"}')
    snaps = records.load_snapshots(tmp_path, [
        {"id": "TST-S-0001", "snapshot": "snapshots/TST-S-0001.txt"},
        {"id": "TST-S-0002", "snapshot": "snapshots/TST-S-0002.txt"},
        {"id": "TST-S-0003", "snapshot": "../outside.txt"},
        {"id": "TST-S-0004", "snapshot": None},
    ])
    assert snaps["TST-S-0001"].text == "hello\n"
    assert len(snaps["TST-S-0001"].sha256) == 64
    assert snaps["TST-S-0001"].meta == {"sha256": "x"}
    assert snaps["TST-S-0002"].error
    assert snaps["TST-S-0003"].error
    assert "TST-S-0004" not in snaps


# --- ids ----------------------------------------------------------------------

def test_next_id_per_kind():
    existing = ["TST-F-0001", "TST-F-0007", "TST-S-0002", "OTH-F-0099"]
    assert ids.next_id("TST", "fact", existing) == "TST-F-0008"
    assert ids.next_id("TST", "source", existing) == "TST-S-0003"
    assert ids.next_id("TST", "media", existing) == "TST-M-0001"
    assert ids.next_id("TST", "search", []) == "TST-Q-0001"
    assert ids.next_ids("TST", "F", existing, 2) == ["TST-F-0008", "TST-F-0009"]


def test_id_parsing():
    assert ids.parse_id("TST-F-0012") == ("TST", "F", 12)
    assert ids.parse_id("TST-F-12") is None
    assert ids.parse_id("tst-F-0012") is None
    assert ids.is_id("TST-M-0001", code="TST", kind="media")
    assert not ids.is_id("TST-M-0001", kind="fact")
    assert ids.kind_of("TST-Q-0003") == "search"
    assert ids.next_id("TST", "fact", ["TST-F-9999"]) == "TST-F-10000"


# --- paths --------------------------------------------------------------------

def test_inductee_paths_layout(tmp_path):
    p = paths.inductee_paths("testperson", tmp_path)
    assert p.root == tmp_path / "inductees" / "testperson"
    assert p.facts.name == "facts.jsonl"
    assert p.profile == p.root / "drafts" / "profile.json"
    assert p.decisions == p.root / "review" / "decisions.jsonl"
    assert p.snapshot_text("TST-S-0001") == p.root / "snapshots" / "TST-S-0001.txt"
    assert p.snapshot_meta("TST-S-0001") == p.root / "snapshots" / "TST-S-0001.meta.json"


def test_slug_validation_and_listing(tmp_path):
    with pytest.raises(ValueError):
        paths.inductee_paths("../etc", tmp_path)
    with pytest.raises(ValueError):
        paths.inductee_paths("Test Person", tmp_path)
    (tmp_path / "inductees" / "beta").mkdir(parents=True)
    (tmp_path / "inductees" / "beta" / "inductee.json").write_text("{}")
    (tmp_path / "inductees" / "alpha").mkdir()
    (tmp_path / "inductees" / "alpha" / "inductee.json").write_text("{}")
    (tmp_path / "inductees" / "notes").mkdir()
    assert paths.list_slugs(tmp_path) == ["alpha", "beta"]


# --- line separators inside strings ----------------------------------------------

UNICODE_BREAKS = (" ", " ", "\u0085")


@pytest.mark.parametrize("ch", UNICODE_BREAKS)
def test_jsonl_round_trip_keeps_unicode_line_breaks_inside_strings(tmp_path, ch):
    # A quote copied verbatim from a snapshot can hold U+2028, U+2029 or U+0085;
    # str.splitlines() treats them as line ends, which used to cut the record in two.
    path = tmp_path / "facts.jsonl"
    rows = [{"id": "TST-F-0001", "claim": f"Born in Example{ch}in 1900."}, {"id": "TST-F-0002"}]
    records.write_jsonl(path, rows)
    assert records.read_jsonl(path) == rows
    # Written escaped, so other JSON Lines readers see one record per line too.
    assert ch not in path.read_text(encoding="utf-8")


@pytest.mark.parametrize("ch", UNICODE_BREAKS)
def test_read_jsonl_accepts_raw_unicode_line_breaks_written_by_others(tmp_path, ch):
    path = tmp_path / "facts.jsonl"
    path.write_text(json.dumps({"claim": f"a{ch}b"}, ensure_ascii=False) + "\n", encoding="utf-8")
    assert records.read_jsonl(path) == [{"claim": f"a{ch}b"}]
    rows, problems = records.read_jsonl_lenient(path)
    assert rows == [{"claim": f"a{ch}b"}] and problems == []


@pytest.mark.parametrize("ch", UNICODE_BREAKS)
def test_staging_lines_and_replace_line_keep_unicode_line_breaks(tmp_path, ch):
    from ihh import staging
    path = tmp_path / "loc.jsonl"
    first = {"id": "tmp-loc-F-1", "claim": f"a{ch}b"}
    second = {"id": "tmp-loc-F-2", "claim": "c"}
    path.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in (first, second)),
                    encoding="utf-8")
    rows, problems = staging._lines(path)
    assert problems == [] and [r for _, r in rows] == [first, second]
    staging.replace_line(path, 1, {"id": "tmp-loc-F-2", "claim": "d"}, "tmp-loc-F-2")
    rows, problems = staging._lines(path)
    assert problems == [] and [r for _, r in rows] == [first, {"id": "tmp-loc-F-2", "claim": "d"}]
