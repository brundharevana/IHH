"""Sentence-adversary verdicts for experience content units (content/<slug>/chapters).

The enumerator in check_grounding.py is the one list of content units: export.py's gate and the
verdict recorder both use it, so a verdict is looked up by exactly the unit that was judged.
"""

import json

import check_grounding as cg
import export as ex
import factories as fx
import validate as v

RECON = {"basis_media_ids": ["TST-M-0001"], "basis_fact_ids": ["TST-F-0003"],
         "note": "Test Person taught at Example College.", "place": {}}


def approve_all(w):
    for rec in w["facts"] + w["media"]:
        if rec.get("status") == "verified":
            rec["review"] = {"state": "approved", "reviewer": "Test Reviewer", "date": "2026-10-09", "note": ""}
    return w


def test_enumerator_returns_every_content_unit():
    ch = fx.content_chapter(room="reconstructed-place", reconstruction=RECON)
    units = cg.iter_content_units([ch])
    assert [(u.location, u.kind) for u in units] == [
        ("content:testperson-1:title", "title"),
        ("content:testperson-1:reconstruction", "sentence"),
        ("content:testperson-1:narration:c1", "sentence"),
        ("content:testperson-1:narration:c2", "sentence"),
        ("content:testperson-1:exhibit:ex1", "title"),
        ("content:testperson-1:exhibit:ex1:note:0", "sentence"),
    ]
    assert units[0].text == "Port of Example" and units[0].fact_ids == ["TST-F-0002"]
    assert units[1].text == RECON["note"] and units[1].fact_ids == ["TST-F-0003"]
    assert units[3].fact_ids == ["TST-F-0002"] and units[5].text == fx.ARRIVAL


def test_export_judges_exactly_the_enumerated_units(tmp_path):
    ch = fx.content_chapter(room="reconstructed-place", reconstruction=RECON)
    root = fx.write_world(tmp_path, approve_all(fx.back_reviews(approve_all(fx.world()))))
    content = fx.write_content(tmp_path, [ch])
    p = ex.paths.inductee_paths("testperson", tmp_path)
    pkg = ex.load_package(p, True, content)
    _, units = ex.build_wordpress(pkg, "2026-10-09")
    exported = {u.location for u in units if u.location.startswith("content:")}
    assert exported == {u.location for u in cg.iter_content_units([ch])}
    assert root.exists()


def _cli(tmp_path, content, *args):
    return cg.main([fx.SLUG, "--data-dir", str(tmp_path), "--content-dir", str(content), *args])


def _judge_all(tmp_path, content, capsys, verdict="supported"):
    assert _cli(tmp_path, content, "--json") == 0
    units = [json.loads(line) for line in capsys.readouterr().out.splitlines() if line.startswith("{")]
    rows = [{"loc": u["loc"], "verdict": verdict, "adds_information": verdict != "supported",
             "rationale": "none", "unit_sha256": u["unit_sha256"]} for u in units if u["loc"].startswith("content:")]
    path = tmp_path / "content-verdicts.jsonl"
    path.write_text("".join(json.dumps(r) + "\n" for r in rows), encoding="utf-8")
    assert _cli(tmp_path, content, "--record", str(path), "--model", "test:adversary", "--run-id", "run-c") == 0
    capsys.readouterr()
    return rows


def final(tmp_path, content):
    return ex.main(["testperson", "--data-dir", str(tmp_path), "--content-dir", str(content)])


def wordpress(root):
    return (root / "export" / "wordpress.html").read_text(encoding="utf-8")


def test_recorded_verdict_makes_the_content_unit_publishable(tmp_path, capsys):
    ch = fx.content_chapter(title="Testa Q. Persona")  # no profile unit shares this title's verdict
    root = fx.write_world(tmp_path, fx.back_reviews(approve_all(fx.world())))
    content = fx.write_content(tmp_path, [ch])
    assert final(tmp_path, content) == 0
    assert "Testa Q. Persona</h2>" not in wordpress(root)
    json_units = _judge_all(tmp_path, content, capsys)
    assert len(json_units) == len(cg.iter_content_units([ch]))
    rows = fx.read_rows(root / "drafts", "grounding")
    assert {r["location"] for r in rows if r["location"].startswith("content:")} == {u["loc"] for u in json_units}
    assert final(tmp_path, content) == 0
    html = wordpress(root)
    assert "Testa Q. Persona</h2>" in html and "See the original" in html


def test_a_stale_content_verdict_is_withheld(tmp_path, capsys):
    ch = fx.content_chapter(title="Testa Q. Persona")
    root = fx.write_world(tmp_path, fx.back_reviews(approve_all(fx.world())))
    content = fx.write_content(tmp_path, [ch])
    _judge_all(tmp_path, content, capsys)
    ch["narration"][0]["text"] = "At Example College, Test Person taught."  # edited after it was judged
    fx.write_content(tmp_path, [ch])
    assert final(tmp_path, content) == 0
    html = wordpress(root)
    assert "At Example College, Test Person taught." not in html
    assert "Testa Q. Persona</h2>" in html and fx.ARRIVAL in html  # the unchanged units still publish


def test_record_refuses_a_stale_content_row(tmp_path, capsys):
    ch = fx.content_chapter()
    fx.write_world(tmp_path, fx.world())
    content = fx.write_content(tmp_path, [ch])
    row = {"loc": "content:testperson-1:narration:c1", "verdict": "supported", "adds_information": False,
           "rationale": "none", "unit_sha256": "0" * 64}
    path = tmp_path / "v.jsonl"
    path.write_text(json.dumps(row) + "\n", encoding="utf-8")
    assert _cli(tmp_path, content, "--record", str(path)) == 1
    assert "changed after it was judged" in capsys.readouterr().out


def test_validate_accepts_a_content_row_and_flags_an_orphan(tmp_path, capsys):
    ch = fx.content_chapter()
    w = fx.world()
    root = fx.write_world(tmp_path, w)
    content = fx.write_content(tmp_path, [ch])
    _judge_all(tmp_path, content, capsys)
    report = v.validate_inductee(ex.paths.inductee_paths("testperson", tmp_path), content_dir=content)
    assert [m for g, m in report.warnings if g == "REFS" and "grounding.jsonl" in m] == []
    assert report.errors == []
    ch["narration"].pop(0)  # the c1 line is removed, so its row names a location that no longer exists
    fx.write_content(tmp_path, [ch])
    report = v.validate_inductee(ex.paths.inductee_paths("testperson", tmp_path), content_dir=content)
    assert any("content:testperson-1:narration:c1" in m and "not a unit" in m
               for g, m in report.warnings if g == "REFS")
    assert root.exists()
