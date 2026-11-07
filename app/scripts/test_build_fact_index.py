import json
from pathlib import Path
from build_fact_index import build

def test_only_verified_and_cleared(tmp_path):
    d = tmp_path / "data/inductees/x"; d.mkdir(parents=True)
    (d / "facts.jsonl").write_text(
        json.dumps({"id": "X-F-1", "status": "verified", "claim": "a"}) + "\n" +
        json.dumps({"id": "X-F-2", "status": "single-source", "claim": "b"}) + "\n")
    (d / "media.jsonl").write_text(
        json.dumps({"id": "X-M-1", "status": "verified", "license_class": "public-domain", "basis_for": ["X-F-1"], "title": "t", "credit": "h"}) + "\n" +
        json.dumps({"id": "X-M-2", "status": "verified", "license_class": "unknown", "title": "t"}) + "\n" +
        json.dumps({"id": "X-M-3", "status": "disputed", "license_class": "cc0", "title": "t"}) + "\n")
    out = build(tmp_path)
    assert list(out["facts"]) == ["X-F-1"]
    assert out["media"]["X-M-1"]["embeddable"] is True
    assert out["media"]["X-M-2"]["embeddable"] is False
    assert "X-M-3" not in out["media"]


def test_absent_store_fails_and_keeps_committed_file(tmp_path, capsys):
    # the store lives in this repository; a missing one is a broken checkout, so the build stops
    from build_fact_index import main
    target = tmp_path / "facts.generated.json"
    target.write_text("COMMITTED")
    assert main(tmp_path / "missing-store", target) == 1
    assert target.read_text() == "COMMITTED"
    assert "facts store not found" in capsys.readouterr().err


def test_check_mode_fails_on_drift_and_writes_nothing(tmp_path):
    from build_fact_index import main
    d = tmp_path / "data/inductees/x"; d.mkdir(parents=True)
    (d / "facts.jsonl").write_text(json.dumps({"id": "X-F-1", "status": "verified", "claim": "a"}) + "\n")
    target = tmp_path / "out.json"
    target.write_text("STALE")
    assert main(tmp_path, target, check=True) == 1
    assert target.read_text() == "STALE"
    assert main(tmp_path, target) == 0
    assert main(tmp_path, target, check=True) == 0


def test_store_is_read_from_this_repository():
    # reproducible on every machine: the default store is this repo's own data/, not a sibling checkout
    import build_fact_index as b
    assert b.REPO == Path(b.__file__).resolve().parents[2]
    assert (b.REPO / "data/inductees").is_dir()
    assert not hasattr(b, "os")


def test_committed_index_matches_the_repository_store():
    # the shipped index is exactly a fresh build of the committed store (no restore trick, no drift)
    import build_fact_index as b
    assert b.TARGET.read_text() == b.render(b.REPO)


def test_present_store_regenerates(tmp_path):
    from build_fact_index import main
    (tmp_path / "data/inductees/x").mkdir(parents=True)
    target = tmp_path / "out.json"
    assert main(tmp_path, target) == 0
    assert json.loads(target.read_text()) == {"facts": {}, "media": {}}


def test_reference_only_media_is_never_embeddable(tmp_path):
    # a verified public-domain record the project ruled reference only (REFERENCE_ONLY) stays out of
    # every display path: not embeddable, with the ruling's reason carried along
    from build_fact_index import REFERENCE_ONLY
    d = tmp_path / "data/inductees/muir"; d.mkdir(parents=True)
    (d / "media.jsonl").write_text(
        json.dumps({"id": "MUI-M-0055", "status": "verified", "license_class": "public-domain", "basis_for": ["MUI-F-0092"], "title": "t", "credit": "h"}) + "\n")
    out = build(tmp_path)
    assert out["media"]["MUI-M-0055"]["embeddable"] is False
    assert out["media"]["MUI-M-0055"]["referenceOnly"] == REFERENCE_ONLY["MUI-M-0055"]
    assert "Photographer: Unknown" in REFERENCE_ONLY["MUI-M-0055"]


def test_owner_ruled_official_record_is_embeddable_only_as_ruled(tmp_path):
    # a disputed record the owner ruled an official federal record (OWNER_RULED) enters the index as
    # embeddable with the ruling carried along, but only while the store still records it federal and
    # public domain; any other disputed record stays out
    from build_fact_index import OWNER_RULED
    d = tmp_path / "data/inductees/albright"; d.mkdir(parents=True)
    fed = {"kind": "federal", "authors": [{"name": "Madeleine K. Albright"}]}
    (d / "media.jsonl").write_text(
        json.dumps({"id": "ALB-M-0055", "status": "disputed", "license_class": "public-domain", "authorship": fed, "title": "t", "credit": "h"}) + "\n" +
        json.dumps({"id": "ALB-M-0056", "status": "disputed", "license_class": "public-domain", "authorship": fed, "title": "t", "credit": "h"}) + "\n")
    out = build(tmp_path)
    assert out["media"]["ALB-M-0055"]["embeddable"] is True
    assert out["media"]["ALB-M-0055"]["ownerRuling"] == OWNER_RULED["ALB-M-0055"]
    assert "ALB-M-0056" not in out["media"]
    # the ruling does not stretch to a record whose rights or authorship changed in the store
    (d / "media.jsonl").write_text(
        json.dumps({"id": "ALB-M-0055", "status": "disputed", "license_class": "unknown", "authorship": fed, "title": "t", "credit": "h"}) + "\n")
    assert "ALB-M-0055" not in build(tmp_path)["media"]
    (d / "media.jsonl").write_text(
        json.dumps({"id": "ALB-M-0055", "status": "disputed", "license_class": "public-domain", "authorship": {"kind": "private"}, "title": "t", "credit": "h"}) + "\n")
    assert "ALB-M-0055" not in build(tmp_path)["media"]
    # a refuted or rejected record is never admitted
    (d / "media.jsonl").write_text(
        json.dumps({"id": "ALB-M-0055", "status": "rejected", "license_class": "public-domain", "authorship": fed, "title": "t", "credit": "h"}) + "\n")
    assert "ALB-M-0055" not in build(tmp_path)["media"]


def test_owner_ruled_holds_exactly_the_ruled_records():
    # the owner ruled ALB-M-0055 official (2026-10-22) and the round-7 records displayable (2026-10-27);
    # any further admission needs its own ruling and must change this test on purpose
    from build_fact_index import OWNER_RULED, OWNER_RULED_LOCK
    # round 9 (owner rulings of 2026-10-29, applied 2026-10-30; DECISIONS): Chronicling America 1940-1961 pages, the
    # round-9 pages of 1933-1939, pre-1931 publications, and US federal publications
    round9 = {"EIN-M-0087", "EIN-M-0089", "EIN-M-0090", "EIN-M-0091", "EIN-M-0092",
              "NAI-M-0075", "NAI-M-0076", "NAI-M-0077",
              "MUI-M-0094", "MUI-M-0095", "MUI-M-0096", "MUI-M-0097",
              "ALB-M-0092", "ALB-M-0094", "ALB-M-0095",
              "LAM-M-0031", "LAM-M-0032", "LAM-M-0033", "LAM-M-0034", "LAM-M-0035", "LAM-M-0036", "LAM-M-0037",
              "LAM-M-0038", "LAM-M-0039"}
    assert set(OWNER_RULED) == {"ALB-M-0055", "EIN-M-0077", "EIN-M-0078", "NAI-M-0067", "NAI-M-0068",
                                "EIN-M-0082", "EIN-M-0083"} | round9
    # every ruling but the federal one is pinned to the record it was given for
    assert set(OWNER_RULED_LOCK) == set(OWNER_RULED) - {"ALB-M-0055"}


def test_records_with_an_unresolved_identification_are_not_admitted():
    # round 9 final review (fix round 2): the pre-1931 ruling covered the rights of NAI-M-0069/0072/0073 only; the
    # adversary's objection that the saved snapshots do not establish the pages concern James Naismith stands, so no
    # ruling may admit them until that is settled
    from build_fact_index import OWNER_RULED, OWNER_RULED_LOCK
    unresolved = {"NAI-M-0069", "NAI-M-0072", "NAI-M-0073"}
    assert not unresolved & set(OWNER_RULED)
    assert not unresolved & set(OWNER_RULED_LOCK)


def test_every_lock_pinned_ruling_is_recorded_in_the_store():
    # a ruling the app acts on is the owner's review note in the store (review/decisions.jsonl), given for the record
    # as pinned: the note's `before` is the same media_lock_sha256 (round 7 and round 9)
    from pathlib import Path
    from build_fact_index import OWNER_RULED_LOCK
    root = Path(__file__).resolve().parents[2] / "data/inductees"
    notes = {}
    for f in root.glob("*/review/decisions.jsonl"):
        for line in f.read_text().splitlines():
            r = json.loads(line)
            if r.get("action") == "note" and r.get("reviewer") == "project owner":
                notes.setdefault(r["item_id"], set()).add(r.get("before"))
    for mid, lock in OWNER_RULED_LOCK.items():
        assert lock in notes.get(mid, set()), f"{mid}: no owner review note for the pinned record"


def test_lock_pinned_ruling_holds_only_for_the_record_as_ruled(tmp_path, monkeypatch):
    # a lock-pinned ruling admits the disputed record only while its media_lock_sha256 is the pinned one:
    # any change to its title, alt text, rights words, licence, credit or sources voids it
    import build_fact_index as b
    rec = {"id": "X-M-0001", "status": "disputed", "license_class": "public-domain", "url": "https://www.loc.gov/x",
           "rights_statement": "r", "title": "t", "alt_text": "a", "credit": "h", "source_ids": ["X-S-0001"]}
    monkeypatch.setitem(b.OWNER_RULED, "X-M-0001", "Owner ruling: may display.")
    monkeypatch.setitem(b.OWNER_RULED_LOCK, "X-M-0001", b._media_lock(rec))
    d = tmp_path / "data/inductees/x"; d.mkdir(parents=True)
    (d / "media.jsonl").write_text(json.dumps(rec) + "\n")
    out = build(tmp_path)
    assert out["media"]["X-M-0001"]["embeddable"] is True
    assert out["media"]["X-M-0001"]["ownerRuling"] == "Owner ruling: may display."
    for change in ({"alt_text": "another description"}, {"title": "another title"}, {"rights_statement": "other"},
                   {"license_class": "unknown"}, {"status": "rejected"}, {"source_ids": ["X-S-0002"]}):
        (d / "media.jsonl").write_text(json.dumps({**rec, **change}) + "\n")
        assert "X-M-0001" not in build(tmp_path)["media"], change
