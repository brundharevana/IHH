"""Tests for tools/apply_rights_rule.py: applying the approved LoC / NARA rights rule
(ihh/rights.py) to media already on file. All data is fake (factories.py)."""

import apply_rights_rule as arr
import compute_status as cs
import factories as fx
import validate

from test_rights import loc_text, nara_text


def rule_world():
    w = fx.world()
    fx.add_holder_media(w, 1, "loc", loc_text("No known restrictions on publication."),
                        "No known restrictions on publication.", "unknown")
    fx.add_holder_media(w, 2, "nara", nara_text("Unrestricted"), None, "unknown")
    fx.add_holder_media(w, 3, "loc", loc_text("Rights status not evaluated."),
                        "Rights status not evaluated.", "unknown")
    fx.add_holder_media(w, 4, "commons", "LicenseShortName: Public domain\n", None, "unknown")
    return w


def run(tmp_path, *args):
    return arr.main(["testperson", *args, "--data-dir", str(tmp_path)])


def media(root):
    return {m["id"]: m for m in fx.read_rows(root, "media")}


def test_applies_the_rule_and_only_where_it_decides(tmp_path, capsys):
    root = fx.write_world(tmp_path, rule_world())
    before = media(root)
    assert run(tmp_path) == 0
    after = media(root)
    assert after["TST-M-0101"]["license_class"] == "public-domain"
    assert (after["TST-M-0102"]["rights_statement"], after["TST-M-0102"]["rights_url"],
            after["TST-M-0102"]["license_class"]) == ("Unrestricted", "https://nara.example.org/item/2",
                                                      "public-domain")
    for mid in ("TST-M-0001", "TST-M-0103", "TST-M-0104"):
        assert after[mid] == before[mid]
    assert "approved rights rule" in after["TST-M-0101"]["notes"]
    out = capsys.readouterr().out
    assert "TST-M-0101" in out and "TST-M-0102" in out


def test_changed_items_drop_to_re_verification(tmp_path):
    """license_class is under the media edit lock: compute_status clears the old verdict, and
    the item waits for a fresh adversary verdict."""
    root = fx.write_world(tmp_path, rule_world())
    assert run(tmp_path) == 0
    assert cs.main(["testperson", "--data-dir", str(tmp_path)]) == 0
    after = media(root)
    for mid in ("TST-M-0101", "TST-M-0102"):
        assert after[mid]["status"] == "pending"
        assert after[mid]["adversary"] is None
    assert after["TST-M-0103"]["status"] == "verified"


def test_dry_run_writes_nothing(tmp_path, capsys):
    root = fx.write_world(tmp_path, rule_world())
    before = (root / "media.jsonl").read_bytes()
    assert run(tmp_path, "--dry-run") == 0
    assert (root / "media.jsonl").read_bytes() == before
    assert "TST-M-0101" in capsys.readouterr().out


def test_second_run_changes_nothing(tmp_path):
    root = fx.write_world(tmp_path, rule_world())
    assert run(tmp_path) == 0
    once = (root / "media.jsonl").read_bytes()
    assert run(tmp_path) == 0
    assert (root / "media.jsonl").read_bytes() == once


def test_refuses_and_writes_nothing_when_a_barred_item_is_marked_usable(tmp_path, capsys):
    w = rule_world()
    fx.add_holder_media(w, 5, "nara", nara_text("Restricted - Possibly"), "Restricted - Possibly", "public-domain")
    root = fx.write_world(tmp_path, w)
    before = (root / "media.jsonl").read_bytes()
    assert run(tmp_path) == 1
    assert (root / "media.jsonl").read_bytes() == before
    assert "TST-M-0105" in capsys.readouterr().err


def test_after_the_rule_validate_reports_no_rights_rule_errors(tmp_path, capsys):
    root = fx.write_world(tmp_path, rule_world())
    validate.main(["testperson", "--data-dir", str(tmp_path)])
    assert "approved rights rule" in capsys.readouterr().out
    assert run(tmp_path) == 0
    capsys.readouterr()
    validate.main(["testperson", "--data-dir", str(tmp_path)])
    assert "approved rights rule" not in capsys.readouterr().out
    assert root.exists()


def test_unknown_slug_exits_2(tmp_path):
    fx.write_world(tmp_path, rule_world())
    assert arr.main(["nobody", "--data-dir", str(tmp_path)]) == 2


def test_rejected_items_are_left_alone(tmp_path):
    w = rule_world()
    fx.by_id(w["media"], "TST-M-0101")["status"] = "rejected"
    root = fx.write_world(tmp_path, w)
    before = media(root)["TST-M-0101"]
    assert run(tmp_path) == 0
    assert media(root)["TST-M-0101"] == before


def test_applies_the_extended_loc_rule_and_notes_the_staff_credit(tmp_path):
    """DECISIONS 2026-10-09 "Extended LoC rights rule": a credited NYWT&S staff photograph becomes
    public-domain with the credit named in the audit note; a HABS record of a recopied historic
    photograph and a CQ Roll Call staff photograph stay as they are."""
    from test_rights import CQ_ADVISORY, HABS, HABS_RECOPY, HABS_RECORD, NYWT, NYWT_COLLECTION, record
    w = rule_world()
    fx.add_holder_media(w, 5, "loc", record(NYWT, NYWT_COLLECTION.rstrip("\n"),
                                            "contributor_names[0]: Aumuller, Al, photographer",
                                            "notes[1]: NYWT&S staff photograph."), NYWT, "unknown")
    fx.add_holder_media(w, 6, "loc", record(HABS, *HABS_RECORD, HABS_RECOPY), HABS, "unknown")
    fx.add_holder_media(w, 7, "loc", record(CQ_ADVISORY, "contributor_names[0]: Graham, Douglas, photographer"),
                        CQ_ADVISORY, "unknown")
    root = fx.write_world(tmp_path, w)
    before = media(root)
    assert run(tmp_path) == 0
    after = media(root)
    assert after["TST-M-0105"]["license_class"] == "public-domain"
    assert "NYWT&S staff photograph." in after["TST-M-0105"]["notes"]
    assert after["TST-M-0106"] == before["TST-M-0106"]
    assert after["TST-M-0107"] == before["TST-M-0107"]


def test_applies_the_government_wording_to_a_government_created_record(tmp_path):
    from test_rights import HABS, HABS_RECORD, record
    w = rule_world()
    fx.add_holder_media(w, 5, "loc", record(HABS, *HABS_RECORD), HABS, "unknown")
    root = fx.write_world(tmp_path, w)
    assert run(tmp_path) == 0
    after = media(root)["TST-M-0105"]
    assert after["license_class"] == "public-domain"
    assert "Historic American Buildings Survey" in after["notes"]


def test_reverts_its_own_public_domain_when_the_rule_now_bars_the_item(tmp_path):
    from test_rights import HABS, HALS_CA_132, record
    w = rule_world()
    fx.add_holder_media(w, 5, "loc", record(HABS, *HALS_CA_132), HABS, "unknown")
    fx.write_world(tmp_path / "a", w)
    assert arr.main(["testperson", "--data-dir", str(tmp_path / "a")]) == 0
    granted = media(tmp_path / "a" / "inductees" / "testperson")["TST-M-0105"]
    assert granted["license_class"] == "public-domain"
    # The holder record is an outside entry: the rule withdraws its own grant.
    w2 = rule_world()
    fx.add_holder_media(w2, 5, "loc", record(HABS, *HALS_CA_132, "item.notes[1]: 2016 HALS Challenge Entry."),
                        HABS, "unknown")
    w2["media"] = [granted if m["id"] == "TST-M-0105" else m for m in w2["media"]]
    root = fx.write_world(tmp_path / "b", w2)
    assert arr.main(["testperson", "--data-dir", str(tmp_path / "b")]) == 0
    after = media(root)["TST-M-0105"]
    assert after["license_class"] == "unknown"
    assert "now bars" in after["notes"]
    assert arr.main(["testperson", "--data-dir", str(tmp_path / "b")]) == 0
    assert media(root)["TST-M-0105"] == after
