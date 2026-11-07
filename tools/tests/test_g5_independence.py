"""G5 independence: copied text is one holder (SPEC section 4, G5; 2026-10-10).

Two counting sources are independent only if their quotes for the fact are not the same text.
A pair is one holder when a quote of one is a near-verbatim copy of a quote of the other
(gates.copied_quotes: normalised token sequences with similarity >= 0.85, or one contained in the
other, when the shorter has at least gates.COPY_MIN_TOKENS tokens), or when a source record says
it derives from the other (`derived_from`, followed through chains and shared origins).
A registry-allowed primary document still passes alone. All data is fake (factories.py).
"""

import json

import factories as fx
import merge_staging as ms
import pytest
import validate
from ihh import gates, paths, records

LONG = "arrived in the United States in June 1941 and taught at Example College"


def career(w, q2, q3):
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["evidence"] = [{"source_id": "TST-S-0002", "quote": q2, "locator": "p"},
                     {"source_id": "TST-S-0003", "quote": q3, "locator": "p"}]
    return f


def test_the_shipped_fixture_passes_g5():
    w = fx.world()
    assert gates.g5_corroboration(fx.by_id(w["facts"], "TST-F-0003"), fx.context(w)) == []


def test_an_identical_long_quote_on_two_holders_is_one_holder():
    w = fx.world()
    f = career(w, LONG, LONG)
    failures = gates.g5_corroboration(f, fx.context(w))
    assert failures and "distinct institutions" in failures[0], failures
    assert any("TST-S-0002" in x and "TST-S-0003" in x and "same text" in x for x in failures), failures


def test_a_near_verbatim_copy_is_one_holder():
    w = fx.world()
    f = career(w, LONG, "arrived in the United States in June 1941, and then taught at Example College.")
    assert gates.g5_corroboration(f, fx.context(w))


def test_a_quote_contained_in_the_other_is_one_holder():
    w = fx.world()
    f = career(w, "Test Person (born Testa Q. Persona) " + LONG + " for many years.", LONG)
    assert gates.g5_corroboration(f, fx.context(w))


def test_independent_wording_passes():
    w = fx.world()
    f = career(w, LONG, "born Testa Q. Persona, arrived in 1941 and taught at Example College for 13 years")
    assert gates.g5_corroboration(f, fx.context(w)) == []


def test_short_identical_phrases_are_not_evidence_of_copying():
    # Two accounts may state a short fact in the same few words; below COPY_MIN_TOKENS the
    # wording is not distinctive enough to call a copy.
    w = fx.world()
    f = career(w, "taught at Example College", "taught at Example College")
    assert gates.g5_corroboration(f, fx.context(w)) == []


def test_copied_quotes_definition():
    assert gates.copied_quotes([LONG], [LONG.upper() + "."])
    assert gates.copied_quotes(["Before that, " + LONG + ", they said."], [LONG])
    assert not gates.copied_quotes([LONG], ["born Testa Q. Persona, arrived in 1941 and taught at Example "
                                            "College for 13 years"])
    assert not gates.copied_quotes(["taught at Example College"], ["taught at Example College"])


def test_a_derived_from_pair_is_one_holder():
    w = fx.world()
    w["sources"][2]["derived_from"] = "TST-S-0002"
    f = career(w, LONG, "born Testa Q. Persona, arrived in 1941 and taught at Example College for 13 years")
    failures = gates.g5_corroboration(f, fx.context(w))
    assert failures and "distinct institutions" in failures[0], failures
    assert any("derived_from" in x for x in failures), failures


def test_derived_from_either_direction_and_through_a_chain_and_a_shared_origin():
    for links in ({"TST-S-0002": "TST-S-0003"},
                  {"TST-S-0003": "TST-S-0004", "TST-S-0004": "TST-S-0002"},
                  {"TST-S-0002": "TST-S-0004", "TST-S-0003": "TST-S-0004"}):
        w = fx.world()
        for sid, origin in links.items():
            fx.by_id(w["sources"], sid)["derived_from"] = origin
        f = fx.by_id(w["facts"], "TST-F-0003")
        assert gates.g5_corroboration(f, fx.context(w)), links


def test_derived_from_an_uncited_page_of_the_other_holder_is_one_holder():
    # The origin need not be cited by the fact: a source derived from a page of holder X is X's text.
    w = fx.world()
    w["sources"].append(fx.source("TST-S-0005", "Another page", "Example University Library", "institutional",
                                  "https://library.example.net/other-page"))
    w["sources"][2]["derived_from"] = "TST-S-0005"
    f = fx.by_id(w["facts"], "TST-F-0003")
    assert gates.g5_corroboration(f, fx.context(w))


def test_a_derived_from_cycle_does_not_hang():
    w = fx.world()
    w["sources"][1]["derived_from"] = "TST-S-0003"
    w["sources"][2]["derived_from"] = "TST-S-0002"
    assert gates.g5_corroboration(fx.by_id(w["facts"], "TST-F-0003"), fx.context(w))


def test_a_primary_document_still_passes_alone_next_to_a_copy():
    w = fx.world()
    w["sources"][2]["derived_from"] = "TST-S-0001"
    f = fx.by_id(w["facts"], "TST-F-0002")
    f["evidence"].append({"source_id": "TST-S-0003", "quote": "Arrived at the Port of Example on 1941-06-10",
                          "locator": "p"})
    assert gates.g5_corroboration(f, fx.context(w)) == []


# --- derived_from at the write boundary -------------------------------------------------------

def world_on_disk(tmp_path):
    root = fx.write_world(tmp_path, fx.world())
    return root, paths.inductee_paths(fx.SLUG, tmp_path)


@pytest.mark.parametrize("value, expected", [
    ("TST-S-0042", "derived_from names unknown source TST-S-0042"),
    ("TST-S-0003", "derived_from may not name the source itself"),
    ("not an id", "derived_from must be a source id"),
    (["TST-S-0002"], "derived_from must be a source id"),
])
def test_write_boundary_refuses_a_bad_derived_from(tmp_path, value, expected):
    root, p = world_on_disk(tmp_path)
    before = p.sources.read_bytes()
    rows = fx.read_rows(root, "sources")
    rows[2]["derived_from"] = value
    with pytest.raises(records.SchemaError, match=expected):
        records.write_jsonl(p.sources, rows)
    assert p.sources.read_bytes() == before


def test_write_boundary_accepts_derived_from_and_validate_reports_the_g5_note(tmp_path):
    root, p = world_on_disk(tmp_path)
    rows = fx.read_rows(root, "sources")
    rows[2]["derived_from"] = "TST-S-0002"
    records.write_jsonl(p.sources, rows)
    rows = fx.read_rows(root, "sources")
    assert rows[2]["derived_from"] == "TST-S-0002"
    report = validate.validate_inductee(p)
    assert not [e for e in report.errors if "derived_from" in e]


def test_merge_resolves_a_staged_derived_from(tmp_path, capsys):
    root, p = world_on_disk(tmp_path)
    text = "Test Person taught at Example College, as the library page says.\n"
    url = "https://society.example.org/copy"
    folder = root / "staging" / "snapshots"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "tmp-loc-S-1.txt").write_bytes(text.encode("utf-8"))
    meta = {"url": url, "fetch_url": url, "method": "http", "fetched_at": "2026-10-08T00:00:00Z",
            "sha256": fx.sha(text), "bytes": len(text.encode("utf-8")), "http_status": 200}
    (folder / "tmp-loc-S-1.meta.json").write_text(json.dumps(meta) + "\n", encoding="utf-8")
    rows = []
    for tid, origin in (("tmp-loc-S-1", "TST-S-0002"), ("tmp-loc-S-2", "tmp-loc-S-1")):
        rec = fx.source(tid, "Copy page", "Example Historical Society", "institutional",
                        url if tid.endswith("1") else url + "-2", derived_from=origin)
        if tid.endswith("1"):
            rec.update(snapshot="staging/snapshots/tmp-loc-S-1.txt", snapshot_sha256=fx.sha(text),
                       fetch_method="http")
        rows.append(rec)
    (root / "staging" / "loc.jsonl").write_text("".join(json.dumps(r) + "\n" for r in rows), encoding="utf-8")
    assert ms.main([fx.SLUG, "--data-dir", str(tmp_path)]) == 0, capsys.readouterr().err
    sources = fx.read_rows(root, "sources")
    assert fx.by_id(sources, "TST-S-0005")["derived_from"] == "TST-S-0002"
    assert fx.by_id(sources, "TST-S-0006")["derived_from"] == "TST-S-0005"


def test_merge_refuses_an_unknown_staged_derived_from(tmp_path, capsys):
    root, p = world_on_disk(tmp_path)
    before = p.sources.read_bytes()
    rec = fx.source("tmp-loc-S-1", "Copy page", "Example Historical Society", "institutional",
                    "https://society.example.org/copy", derived_from="tmp-loc-S-9")
    (root / "staging" / "loc.jsonl").write_text(json.dumps(rec) + "\n", encoding="utf-8")
    assert ms.main([fx.SLUG, "--data-dir", str(tmp_path)]) == 1
    assert "tmp-loc-S-9" in capsys.readouterr().err
    assert p.sources.read_bytes() == before
