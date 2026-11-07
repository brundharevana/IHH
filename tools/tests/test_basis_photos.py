"""Basis photos (owner decision 2026-10-16; SPEC 3.4.2): a media record kind for photographs used
only as the basis for rebuilding a room or place. Rights come from the holder like any media item;
the record links to the stop fact(s) it serves (basis_for); the adversary judges it against the
place the stop fact names, never as media depicting the inductee.

Every name, host and id is an invented placeholder.
"""

import copy
import csv
import io
import json

import adversary as adv
import compute_status as cs
import export as ex
import factories as fx
import validate
from ihh import gates, judged, paths, records, schema

BASIS = {
    "id": "TST-M-0009",
    "title": "Example College gymnasium, interior",
    "media_type": "image",
    "source_ids": ["TST-S-0002"],
    "url": "https://library.example.net/images/gym.jpg",
    "rights_statement": None,
    "rights_url": None,
    "license_class": "rights-restricted",
    "credit": "Example University Library",
    "alt_text": "Example College gymnasium.",
    "reconstruction": False,
    "reconstruction_basis": [],
    "record_kind": "basis-photo",
    "basis_for": ["TST-F-0003"],
    "adversary": None,
    "status": "pending",
    "verified_claim_sha256": None,
    "review": {"state": "pending", "reviewer": None, "date": None, "note": None},
    "notes": "Basis photo for the Example College room.",
}


def world_with_basis(**over):
    w = fx.world()
    m = copy.deepcopy(BASIS)
    m.update(over)
    w["media"].append(m)
    src = fx.by_id(w["sources"], "TST-S-0002")
    w["snapshots"]["TST-S-0002"] = w["snapshots"]["TST-S-0002"] + "\nExample College gymnasium interior photograph.\n"
    src["snapshot_sha256"] = fx.sha(w["snapshots"]["TST-S-0002"])
    fx.restamp(w)  # the facts citing TST-S-0002 were judged on its text as it is now
    return w, m


def schema_errors(m, w):
    errors, _ = schema.record_problems("media", m, sources_by_id=gates.by_id(w["sources"]))
    return errors


# --- schema --------------------------------------------------------------------------------------

def test_basis_photo_needs_a_stop_fact_and_is_never_a_reconstruction():
    w, m = world_with_basis()
    assert schema_errors(m, w) == []
    assert any("basis_for" in e for e in schema_errors({**m, "basis_for": []}, w))
    assert any("basis_for" in e for e in schema_errors({**m, "basis_for": ["TST-S-0002"]}, w))
    assert any("reconstruction" in e for e in schema_errors({**m, "reconstruction": True,
                                                             "reconstruction_basis": ["TST-F-0003"]}, w))
    assert any("record_kind" in e for e in schema_errors({**m, "record_kind": "place"}, w))
    item = {k: v for k, v in m.items() if k not in ("record_kind",)}
    assert any("basis_for" in e for e in schema_errors(item, w))  # basis_for only on a basis photo
    assert any("media_type" in e for e in schema_errors({**m, "media_type": "audio"}, w))


def test_validate_refuses_a_basis_photo_linked_to_an_unknown_fact(tmp_path):
    w, _ = world_with_basis(basis_for=["TST-F-0099"])
    root = fx.write_world(tmp_path, w)
    report = validate.validate_inductee(paths.inductee_paths("testperson", tmp_path))
    assert any("basis_for" in msg and "TST-F-0099" in msg for _, msg in report.errors), report.errors
    assert root


# --- fingerprint and edit lock ---------------------------------------------------------------------

def test_an_item_without_record_kind_keeps_its_fingerprint_and_lock():
    w = fx.world()
    m = w["media"][0]
    payload = judged.media_payload(m, gates.by_id(w["sources"]), None, gates.by_id(w["facts"]))
    assert "record_kind" not in payload and "basis_for" not in payload
    lock = gates.media_lock_sha256(m)
    assert gates.media_lock_sha256({**m, "record_kind": None}) == lock


def test_basis_photo_fingerprint_covers_the_linked_stop_fact():
    w, m = world_with_basis()
    sources, facts = gates.by_id(w["sources"]), gates.by_id(w["facts"])
    payload = judged.media_payload(m, sources, None, facts)
    assert payload["record_kind"] == "basis-photo"
    assert payload["basis_for"][0]["fact_id"] == "TST-F-0003"
    before = judged.record_fingerprint(m, "media", sources, facts)
    facts2 = copy.deepcopy(facts)
    facts2["TST-F-0003"]["claim"] = "Test Person taught at Example College in Example Town."
    assert judged.record_fingerprint(m, "media", sources, facts2) != before
    lock = gates.media_lock_sha256(m)
    assert gates.media_lock_sha256({**m, "basis_for": ["TST-F-0002"]}) != lock


# --- adversary --------------------------------------------------------------------------------------

def test_adversary_judges_a_basis_photo_against_the_place_not_the_inductee(tmp_path):
    w, m = world_with_basis()
    root = fx.write_world(tmp_path, w)
    ctx = fx.context(w)
    items, skipped = adv.select_items(w["facts"], w["media"], ctx, root, {"TST-M-0009"})
    assert [i.id for i in items] == ["TST-M-0009"], skipped
    prompt = adv.build_prompt(items, w["inductee"], cwd=tmp_path)
    assert "basis photo" in prompt.lower()
    assert json.dumps(fx.by_id(w["facts"], "TST-F-0003")["claim"]) in prompt  # the stop fact
    assert "depicts or belongs to" not in prompt  # the inductee test applies to items, not basis photos
    assert "not required to show" in prompt


# --- status and export ---------------------------------------------------------------------------------

def test_a_supported_basis_photo_verifies_and_exports_as_reference_only(tmp_path):
    w, m = world_with_basis()
    m["adversary"] = fx.adversary(quote_in_live="unreachable",
                                  live_by_source=[{"source_id": "TST-S-0002", "result": "found",
                                                   "url": "https://library.example.net/test-person"}])
    m["adversary"]["quote_in_live"] = "yes"
    fx.stamp(w, m, "media")
    root = fx.write_world(tmp_path, w)
    result = cs.run(paths.inductee_paths("testperson", tmp_path))
    status = {x.get("id"): x.get("status") for x in result.media}
    assert status["TST-M-0009"] == "verified", result.reasons.get("TST-M-0009")
    assert ex.main(["testperson", "--preview", "--data-dir", str(tmp_path)]) == 0
    rows = list(csv.DictReader(io.StringIO((root / "export" / "media.csv").read_text(encoding="utf-8-sig"))))
    row = next(r for r in rows if r["id"] == "TST-M-0009")
    assert (row["record_kind"], row["basis_for"], row["embeddable"]) == ("basis-photo", "TST-F-0003", "no")
    graph = json.loads((root / "export" / "provenance.jsonld").read_text(encoding="utf-8"))["@graph"]
    node = next(n for n in graph if n.get("@id") == "ihh:TST-M-0009")
    assert node["ihh:recordKind"] == "basis-photo"
    assert node["ihh:basisFor"] == [{"@id": "ihh:TST-F-0003"}]


def test_a_basis_photo_is_never_shown_as_an_artifact_about_the_inductee(tmp_path):
    w, m = world_with_basis(license_class="unknown")
    m["adversary"] = fx.adversary(quote_in_live="yes",
                                  live_by_source=[{"source_id": "TST-S-0002", "result": "found",
                                                   "url": "https://library.example.net/test-person"}])
    m["status"] = "verified"
    m["verified_claim_sha256"] = gates.media_lock_sha256(m)
    fx.stamp(w, m, "media")
    w["profile"]["artifacts"].append({"media_id": "TST-M-0009", "caption": "Test Person taught at Example College.",
                                      "fact_ids": ["TST-F-0003"]})
    root = fx.write_world(tmp_path, w)
    assert ex.main(["testperson", "--preview", "--data-dir", str(tmp_path)]) == 0
    html = (root / "export" / "wordpress.html").read_text(encoding="utf-8")
    assert "images/gym.jpg" not in html
    review = (root / "export" / "REVIEW.md").read_text(encoding="utf-8")
    assert "basis photo" in review.lower()
    assert records  # imported for parity with other export tests
