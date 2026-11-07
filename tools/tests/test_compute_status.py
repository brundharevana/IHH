"""Tests for tools/compute_status.py (SPEC section 5).

The derivation rules are tested on in-memory records; the command line is
tested on a fake inductee folder written to a temporary directory.
"""

import json

import compute_status as cs
import factories as fx
from ihh import normalize


def derive(w, fid):
    return cs.derive_fact(fx.by_id(w["facts"], fid), fx.context(w))


# --- rule order -----------------------------------------------------------------

def test_fully_supported_fact_is_verified_with_hash():
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0002")
    f["status"] = "pending"
    f["verified_claim_sha256"] = None
    d = cs.derive_fact(f, fx.context(w))
    assert d.status == "verified"
    assert d.verified_claim_sha256 == normalize.claim_sha256(f["claim"])


def test_rule1_rejected_is_preserved():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["status"] = "rejected"
    d = derive(w, "TST-F-0003")
    assert d.status == "rejected"
    assert d.verified_claim_sha256 is None


def test_rule1_conflicting_is_preserved():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["status"] = "conflicting"
    assert derive(w, "TST-F-0003").status == "conflicting"


def test_rule2_withdrawn_becomes_rejected():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["extractor"]["verdict"] = "withdrawn"
    d = derive(w, "TST-F-0003")
    assert d.status == "rejected"
    assert d.verified_claim_sha256 is None


def test_rule3_g1_failure_is_pending():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["evidence"][0]["quote"] = "taught physics at Example College"
    d = derive(w, "TST-F-0003")
    assert d.status == "pending"
    assert any("G1" in r for r in d.reasons)


def test_rule3_g2_failure_is_pending():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["claim"] = "Test Person taught at Example College in 1950."
    fx.by_id(w["facts"], "TST-F-0003")["verified_claim_sha256"] = None
    d = derive(w, "TST-F-0003")
    assert d.status == "pending"
    assert any("G2" in r for r in d.reasons)


def test_rule3_g9_failure_is_pending():
    w = fx.world()
    w["sources"][2]["url"] = "https://en.wikipedia.org/wiki/Test_Person"
    d = derive(w, "TST-F-0003")
    assert d.status == "pending"
    assert any("G9" in r for r in d.reasons)


def test_rule4_no_adversary_is_pending():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["adversary"] = None
    assert derive(w, "TST-F-0003").status == "pending"


def test_rule5_adversary_refuted_is_disputed():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["adversary"]["verdict"] = "refuted"
    d = derive(w, "TST-F-0003")
    assert d.status == "disputed"
    assert d.verified_claim_sha256 is None


def test_rule5_adversary_unclear_is_disputed():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["adversary"]["verdict"] = "unclear"
    assert derive(w, "TST-F-0003").status == "disputed"


def test_rule5_adds_information_is_disputed():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["adversary"]["adds_information"] = True
    assert derive(w, "TST-F-0003").status == "disputed"


def test_rule5_not_entailed_not_atomic_bad_source_type_are_disputed():
    for field, value in (("entailed", False), ("atomic", False), ("source_type_ok", False)):
        w = fx.world()
        fx.by_id(w["facts"], "TST-F-0003")["adversary"][field] = value
        assert derive(w, "TST-F-0003").status == "disputed", field


def test_rule5_g10_browser_snapshot_unreachable_is_disputed():
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["adversary"]["quote_in_live"] = "unreachable"
    d = derive(w, "TST-F-0003")
    assert d.status == "disputed"
    assert any("G10" in r for r in d.reasons)


def test_rule5_g10_api_snapshot_unreachable_is_fine():
    w = fx.world()
    assert fx.by_id(w["facts"], "TST-F-0002")["adversary"]["quote_in_live"] == "unreachable"
    assert derive(w, "TST-F-0002").status == "verified"


def test_rule6_secondary_only_is_single_source():
    w = fx.world()
    w["sources"][1]["type"] = "secondary"
    fx.restamp(w)  # the adversary judged the record with these source types
    d = derive(w, "TST-F-0003")
    assert d.status == "single-source"
    assert any("G5" in r for r in d.reasons)


def test_rule6_same_institution_is_single_source():
    # One registry entry (two pages of library.example.net) counts once.
    w = fx.world()
    w["sources"][2].update(institution="Example University Library", url="https://library.example.net/other",
                           type="institutional")
    fx.restamp(w)
    assert derive(w, "TST-F-0003").status == "single-source"


def test_source_claiming_a_registered_holder_off_its_domain_is_pending():
    w = fx.world()
    w["sources"][2]["institution"] = "Example University Library"  # on news.example.org
    fx.restamp(w)
    d = derive(w, "TST-F-0003")
    assert d.status == "pending" and any("G9" in r for r in d.reasons), d.reasons


def test_rule7_existing_hash_is_kept():
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    stored = f["verified_claim_sha256"]
    assert derive(w, "TST-F-0003").verified_claim_sha256 == stored


def test_rule8_edited_claim_after_verification_drops_to_pending():
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    # Each source's own quote covers the whole edited claim, so G5 counts both holders.
    f["claim"] = "Test Person arrived in 1941 and taught at Example College."
    f["evidence"][0]["quote"] = "arrived in the United States in June 1941 and taught at Example College"
    f["evidence"][1]["quote"] = "arrived in 1941 and taught at Example College"
    d = cs.derive_fact(f, fx.context(w))
    assert d.status == "pending"
    assert d.verified_claim_sha256 is None
    assert d.clear_adversary is True
    assert any("G7" in r for r in d.reasons)


def test_rule8_is_sticky_until_reverified():
    # After the edit lock fires, re-running must not re-verify on the stale verdict.
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    # Each source's own quote covers the whole edited claim, so G5 counts both holders.
    f["claim"] = "Test Person arrived in 1941 and taught at Example College."
    f["evidence"][0]["quote"] = "arrived in the United States in June 1941 and taught at Example College"
    f["evidence"][1]["quote"] = "arrived in 1941 and taught at Example College"
    ctx = fx.context(w)
    facts, _, _ = cs.compute(w["facts"], w["media"], ctx, today=fx.TODAY)
    again = fx.by_id(facts, "TST-F-0003")
    assert again["status"] == "pending"
    assert again["adversary"] is None
    assert "Edit lock" in again["notes"]
    facts2, _, changes = cs.compute(facts, w["media"], ctx, today=fx.TODAY)
    assert fx.by_id(facts2, "TST-F-0003")["status"] == "pending"
    assert changes == []
    # A fresh adversary verdict on the edited claim re-verifies it with the new hash.
    fx.by_id(facts2, "TST-F-0003")["adversary"] = fx.adversary()
    fx.stamp(dict(w, facts=facts2), fx.by_id(facts2, "TST-F-0003"), "fact")
    facts3, _, _ = cs.compute(facts2, w["media"], ctx, today=fx.TODAY)
    f3 = fx.by_id(facts3, "TST-F-0003")
    assert f3["status"] == "verified"
    assert f3["verified_claim_sha256"] == normalize.claim_sha256(f3["claim"])


def test_non_verified_status_clears_stale_hash():
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["adversary"]["verdict"] = "refuted"
    facts, _, _ = cs.compute(w["facts"], w["media"], fx.context(w), today=fx.TODAY)
    out = fx.by_id(facts, "TST-F-0003")
    assert out["status"] == "disputed"
    assert out["verified_claim_sha256"] is None


# --- media -------------------------------------------------------------------------

def test_media_verified_when_rights_statement_in_snapshot():
    w = fx.world()
    m = w["media"][0]
    m["status"] = "pending"
    m["verified_claim_sha256"] = None
    d = cs.derive_media(m, fx.context(w), {})
    assert d.status == "verified"
    assert d.verified_claim_sha256


def test_media_pending_when_rights_statement_not_in_snapshot():
    w = fx.world()
    w["media"][0]["rights_statement"] = "Free for any use."
    assert cs.derive_media(w["media"][0], fx.context(w), {}).status == "pending"


def test_media_disputed_when_adversary_refutes():
    w = fx.world()
    w["media"][0]["adversary"]["verdict"] = "refuted"
    assert cs.derive_media(w["media"][0], fx.context(w), {}).status == "disputed"


def test_media_license_edit_after_verification_drops_to_pending():
    w = fx.world()
    w["media"][0]["license_class"] = "cc0"
    d = cs.derive_media(w["media"][0], fx.context(w), {})
    assert d.status == "pending"
    assert d.clear_adversary is True


def test_media_reconstruction_needs_verified_basis():
    w = fx.world()
    m = w["media"][0]
    m["reconstruction"] = True
    m["reconstruction_basis"] = ["TST-F-0002", "TST-S-0001"]
    m["rights_statement"] = None
    m["verified_claim_sha256"] = None
    m["status"] = "pending"
    fx.restamp(w)  # the adversary judged the reconstruction
    ctx = fx.context(w)
    assert cs.derive_media(m, ctx, {"TST-F-0002": "verified"}).status == "verified"
    assert cs.derive_media(m, ctx, {"TST-F-0002": "disputed"}).status == "pending"


# --- command line ---------------------------------------------------------------------

def _scramble(root):
    """Reset every status so the command has work to do."""
    for name in ("facts", "media"):
        rows = fx.read_rows(root, name)
        for r in rows:
            r["status"] = "pending"
            r["verified_claim_sha256"] = None
        (root / f"{name}.jsonl").write_text("".join(json.dumps(r) + "\n" for r in rows), encoding="utf-8")


def test_cli_writes_status_and_is_idempotent(tmp_path):
    w = fx.world()
    fx.by_id(w["facts"], "TST-F-0003")["adversary"]["verdict"] = "refuted"
    root = fx.write_world(tmp_path, w)
    _scramble(root)

    assert cs.main(["testperson", "--data-dir", str(tmp_path)]) == 0
    facts = {f["id"]: f for f in fx.read_rows(root, "facts")}
    assert facts["TST-F-0001"]["status"] == "verified"
    assert facts["TST-F-0002"]["status"] == "verified"
    assert facts["TST-F-0003"]["status"] == "disputed"
    assert facts["TST-F-0004"]["status"] == "verified"
    assert facts["TST-F-0002"]["verified_claim_sha256"] == normalize.claim_sha256(facts["TST-F-0002"]["claim"])
    assert fx.read_rows(root, "media")[0]["status"] == "verified"

    first = (root / "facts.jsonl").read_bytes(), (root / "media.jsonl").read_bytes()
    assert cs.main(["testperson", "--data-dir", str(tmp_path)]) == 0
    second = (root / "facts.jsonl").read_bytes(), (root / "media.jsonl").read_bytes()
    assert first == second


def test_cli_preserves_key_order(tmp_path):
    root = fx.write_world(tmp_path, fx.world())
    _scramble(root)
    before = [list(r.keys()) for r in fx.read_rows(root, "facts")]
    cs.main(["testperson", "--data-dir", str(tmp_path)])
    after = [list(r.keys()) for r in fx.read_rows(root, "facts")]
    assert before == after


def test_cli_inserts_missing_hash_field_in_spec_position(tmp_path):
    w = fx.world()
    for f in w["facts"]:
        del f["verified_claim_sha256"]
    root = fx.write_world(tmp_path, w)
    cs.main(["testperson", "--data-dir", str(tmp_path)])
    keys = list(fx.read_rows(root, "facts")[0].keys())
    assert keys.index("verified_claim_sha256") == keys.index("status") + 1


def test_cli_all_and_unknown_slug(tmp_path):
    fx.write_world(tmp_path, fx.world())
    assert cs.main(["--all", "--data-dir", str(tmp_path)]) == 0
    assert cs.main(["nobody", "--data-dir", str(tmp_path)]) == 2


# --- a verdict counts only for what it judged (round 1 review) ------------------------------

def test_verdict_without_judged_fingerprint_is_not_a_verdict():
    w = fx.world()
    del fx.by_id(w["facts"], "TST-F-0003")["adversary"]["judged_sha256"]
    d = derive(w, "TST-F-0003")
    assert d.status == "pending"
    assert any("judged_sha256" in r for r in d.reasons)


def test_swapped_evidence_quote_makes_the_verdict_stale():
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["evidence"][1]["quote"] = "taught at Example College for 13 years"  # in the snapshot, never judged
    d = derive(w, "TST-F-0003")
    assert d.status == "pending"
    assert any("changed after the adversary judged it" in r for r in d.reasons)


def test_forged_claim_with_recomputed_hash_is_not_verified():
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["claim"] = "Test Person never taught at Example College."
    f["verified_claim_sha256"] = normalize.claim_sha256(f["claim"])
    assert derive(w, "TST-F-0003").status == "pending"


def test_retyped_source_makes_the_verdict_stale():
    w = fx.world()
    w["sources"][2]["type"] = "primary"  # S-0003 was secondary when judged
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["evidence"] = [e for e in f["evidence"] if e["source_id"] == "TST-S-0003"]
    f["primary_document"] = True
    assert derive(w, "TST-F-0003").status == "pending"


def test_reworded_single_source_claim_is_not_verified_by_adding_a_source():
    w = fx.world()
    f = fx.by_id(w["facts"], "TST-F-0003")
    f["evidence"] = f["evidence"][:1]  # only S-0002: single-source
    fx.restamp(w)                      # the adversary judged it in this state
    facts, _, _ = cs.compute(w["facts"], w["media"], fx.context(w), today=fx.TODAY)
    f = fx.by_id(facts, "TST-F-0003")
    assert f["status"] == "single-source" and f["verified_claim_sha256"] is None
    f["claim"] = "Test Person once taught at Example College."  # G7 is silent: no hash yet
    f["evidence"].append({"source_id": "TST-S-0003", "quote": "taught at Example College", "locator": "line 1"})
    w["facts"] = facts
    d = derive(w, "TST-F-0003")
    assert d.status == "pending"  # no adversary saw this claim or this evidence


def test_refetched_snapshot_makes_the_verdict_stale():
    w = fx.world()
    text = fx.SNAPSHOT_TEXT["TST-S-0003"] + "Corrected later.\n"
    w["snapshots"]["TST-S-0003"] = text
    w["sources"][2]["snapshot_sha256"] = fx.sha(text)
    assert derive(w, "TST-F-0003").status == "pending"


def test_media_alt_text_or_title_change_after_verification_is_caught():
    w = fx.world()
    w["media"][0]["alt_text"] = "Test Person receiving the Example Prize."
    assert cs.derive_media(w["media"][0], fx.context(w), {}).status == "pending"
    w = fx.world()
    w["media"][0]["title"] = "Prize diploma of Test Person"
    assert cs.derive_media(w["media"][0], fx.context(w), {}).status == "pending"


def _fresh_media(w, **changes):
    """The media item as a new candidate (no lock hash yet) with changes, judged as it is."""
    m = w["media"][0]
    m.update(changes, status="pending", verified_claim_sha256=None)
    fx.restamp(w)
    return m


def test_media_alt_text_adding_unsupported_facts_is_pending():
    w = fx.world()
    m = _fresh_media(w, alt_text="Test Person receiving the 1997 Example Pioneer Award.")
    d = cs.derive_media(m, fx.context(w), {})
    assert d.status == "pending"
    assert any("G2" in r and "alt_text" in r for r in d.reasons)


def test_media_title_adding_unsupported_facts_is_pending():
    w = fx.world()
    m = _fresh_media(w, title="Nobel Prize diploma of Test Person, 1950")
    d = cs.derive_media(m, fx.context(w), {})
    assert d.status == "pending"
    assert any("G2" in r and "title" in r for r in d.reasons)


def test_media_title_and_alt_text_grounded_in_source_or_cited_facts_pass():
    w = fx.world()
    m = _fresh_media(w, title="Petition for Naturalization of Testa Q. Persona",
                     alt_text="Typed record of the arrival at the Port of Example (TST-F-0002).")
    assert cs.derive_media(m, fx.context(w), {}).status == "verified"
