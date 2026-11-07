"""Tests for tools/new_inductee.py (SPEC sections 2, 3.1, 6)."""

import json

import new_inductee as ni
import validate
from ihh import paths


def read_inductee(tmp_path, slug="testperson"):
    return json.loads((tmp_path / "inductees" / slug / "inductee.json").read_text(encoding="utf-8"))


def create(tmp_path, *extra, slug="testperson", name="Test Person", code="TST"):
    return ni.main([slug, "--name", name, "--code", code, "--data-dir", str(tmp_path), *extra])


def test_creates_folder_and_inductee_json(tmp_path):
    assert create(tmp_path, "--ihh-url", "https://ihh.example.org/inductees/test-person/") == 0
    root = tmp_path / "inductees" / "testperson"
    data = read_inductee(tmp_path)
    assert list(data) == ["slug", "code", "name", "aliases", "authority", "birth_year", "death_year",
                          "ihh_url", "runs"]
    assert data["slug"] == "testperson"
    assert data["code"] == "TST"
    assert data["name"] == "Test Person"
    assert data["aliases"] == []
    assert data["authority"] == {"loc_naf": None, "wikidata": None}
    assert data["birth_year"] is None and data["death_year"] is None
    assert data["ihh_url"] == "https://ihh.example.org/inductees/test-person/"
    assert data["runs"] == []
    for name in ("facts.jsonl", "sources.jsonl", "media.jsonl", "searches.jsonl"):
        assert (root / name).read_text(encoding="utf-8") == ""
    for folder in ("snapshots", "staging", "drafts", "review"):
        assert (root / folder).is_dir()


def test_ihh_url_is_optional(tmp_path):
    assert create(tmp_path) == 0
    assert read_inductee(tmp_path)["ihh_url"] is None


def test_new_folder_passes_validate(tmp_path):
    assert create(tmp_path) == 0
    report = validate.validate_inductee(paths.inductee_paths("testperson", tmp_path))
    assert report.errors == []


def test_refuses_existing_inductee(tmp_path, capsys):
    assert create(tmp_path) == 0
    before = (tmp_path / "inductees" / "testperson" / "inductee.json").read_bytes()
    assert create(tmp_path, name="Someone Else") == 1
    assert "already exists" in capsys.readouterr().err
    assert (tmp_path / "inductees" / "testperson" / "inductee.json").read_bytes() == before


def test_refuses_code_used_by_another_inductee(tmp_path, capsys):
    assert create(tmp_path) == 0
    assert create(tmp_path, slug="otherperson", name="Other Person") == 1
    assert "TST" in capsys.readouterr().err
    assert not (tmp_path / "inductees" / "otherperson").exists()


def test_rejects_bad_slug(tmp_path):
    assert create(tmp_path, slug="Test Person") == 2
    assert not (tmp_path / "inductees").exists() or not any((tmp_path / "inductees").iterdir())


def test_rejects_bad_code(tmp_path):
    for code in ("TS", "tst", "TST1", "T5T"):
        assert create(tmp_path, code=code) == 2
    assert not (tmp_path / "inductees" / "testperson").exists()


def test_rejects_blank_name(tmp_path):
    assert create(tmp_path, name="   ") == 2


def test_rejects_non_https_ihh_url(tmp_path):
    assert create(tmp_path, "--ihh-url", "http://ihh.example.org/x/") == 2
    assert create(tmp_path, "--ihh-url", "javascript:alert(1)") == 2
    assert not (tmp_path / "inductees" / "testperson").exists()
