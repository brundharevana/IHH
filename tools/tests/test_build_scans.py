"""Tests for tools/build_scans.py (scanned-room bundles). No sources and no encoders are needed:
the source checks run on small fake zips, and the shipped manifests are checked against the
committed bundles in site/public/scans/."""
import copy
import hashlib
import json
import zipfile

import pytest

import build_scans as bs

ALL = ["kings-hall", "margam-entrance-hall", "hallwyl-dining-room", "hallwyl-picture-gallery", "hallwyl-great-drawing-room"]
# Rooms the artwork-clearance gate (Task 2) marked unusable ship no bundle at all.
UNUSABLE = ["hallwyl-picture-gallery", "margam-entrance-hall"]
SHIPPED = [s for s in ALL if s not in UNUSABLE]


def _manifest(scan_id):
    return json.loads((bs.MANIFESTS / f"{scan_id}.json").read_text())


def _fake_zip(path, payload=b"model"):
    with zipfile.ZipFile(path, "w") as z:
        z.writestr("source/model.obj", payload)
    return path


# --- source file: missing or a different version -------------------------------------------

def test_missing_source_names_the_file_and_the_sketchfab_page(tmp_path):
    with pytest.raises(bs.BuildError) as e:
        bs.locate_source("kings-hall", tmp_path)
    msg = str(e.value)
    assert bs.SCANS["kings-hall"]["zip"] in msg
    assert "https://sketchfab.com/3d-models/the-king-s-hall-d18155613363445b9b68c0c67196d98d" in msg


@pytest.mark.parametrize("scan_id", SHIPPED)
def test_every_missing_source_names_its_own_sketchfab_page(tmp_path, scan_id):
    with pytest.raises(bs.BuildError) as e:
        bs.locate_source(scan_id, tmp_path)
    assert bs.SCANS[scan_id]["sketchfab_url"] in str(e.value)
    assert bs.SCANS[scan_id]["uid"] in str(e.value)


def test_source_with_a_different_sha256_fails(tmp_path):
    src = _fake_zip(tmp_path / bs.SCANS["kings-hall"]["zip"])
    manifest = {"source_sha256": "0" * 64}
    with pytest.raises(bs.BuildError) as e:
        bs.verify_source("kings-hall", src, manifest)
    assert "sha256" in str(e.value) and bs.SCANS["kings-hall"]["sketchfab_url"] in str(e.value)


def test_source_with_the_pinned_sha256_passes(tmp_path):
    src = _fake_zip(tmp_path / bs.SCANS["kings-hall"]["zip"])
    digest = hashlib.sha256(src.read_bytes()).hexdigest()
    assert bs.verify_source("kings-hall", src, {"source_sha256": digest}) == digest


def test_unpinned_source_needs_an_explicit_pin(tmp_path):
    src = _fake_zip(tmp_path / bs.SCANS["kings-hall"]["zip"])
    with pytest.raises(bs.BuildError) as e:
        bs.verify_source("kings-hall", src, {})
    assert "--pin-source" in str(e.value)
    digest = hashlib.sha256(src.read_bytes()).hexdigest()
    assert bs.verify_source("kings-hall", src, {}, pin=True) == digest


def test_shipped_source_hashes_match_the_owner_files_when_present():
    for scan_id in ALL:
        path = bs.DEFAULT_SOURCE_DIR / bs.SCANS[scan_id]["zip"]
        if path.exists():  # owner-only files; skipped on machines without them
            assert bs.sha256_file(path) == _manifest(scan_id)["source_sha256"], scan_id


# --- budgets ---------------------------------------------------------------------------------

def test_budget_limits_are_the_agreed_figures():
    assert bs.BUDGETS == {"phone": 5_000_000, "desktop": 10_000_000}
    assert bs.OCCLUDER_MAX_TRIS == 20_000


@pytest.mark.parametrize("device,limit", [("phone", 5_000_000), ("desktop", 10_000_000)])
def test_check_budget(device, limit):
    bs.check_budget("kings-hall", device, limit)
    with pytest.raises(bs.BuildError) as e:
        bs.check_budget("kings-hall", device, limit + 1)
    assert device in str(e.value) and "kings-hall" in str(e.value)


def test_an_over_budget_build_never_replaces_the_shipped_bundle(tmp_path):
    out_root = tmp_path / "scans"
    old = out_root / "kings-hall" / "phone"
    old.mkdir(parents=True)
    (old / "room.glb").write_bytes(b"old")
    staged = tmp_path / "staged"
    for device in ("phone", "desktop"):
        (staged / device).mkdir(parents=True)
        (staged / device / "room.glb").write_bytes(b"x" * 10)
    (staged / "phone" / "room.glb").write_bytes(b"x" * (bs.BUDGETS["phone"] + 1))
    (staged / "occluder.glb").write_bytes(b"o")
    (staged / "preview").mkdir()
    (staged / "preview" / "room.glb").write_bytes(b"p")
    with pytest.raises(bs.BuildError):
        bs.publish("kings-hall", staged, out_root)
    assert (old / "room.glb").read_bytes() == b"old"
    assert not (out_root / "kings-hall" / "desktop").exists()


def test_publish_replaces_the_whole_bundle(tmp_path):
    out_root = tmp_path / "scans"
    (out_root / "kings-hall" / "stale").mkdir(parents=True)
    staged = tmp_path / "staged"
    for device in ("phone", "desktop"):
        (staged / device).mkdir(parents=True)
        (staged / device / "room.glb").write_bytes(b"x" * 10)
    (staged / "occluder.glb").write_bytes(b"o")
    (staged / "preview").mkdir()
    (staged / "preview" / "room.glb").write_bytes(b"p")
    bs.publish("kings-hall", staged, out_root)
    # Content-hashed names (Task 5): room.<sha8>.glb, occluder.<sha8>.glb
    h = lambda b: hashlib.sha256(b).hexdigest()[:8]
    assert (out_root / "kings-hall" / "preview" / f"room.{h(b'p')}.glb").exists()
    assert (out_root / "kings-hall" / "desktop" / f"room.{h(b'x' * 10)}.glb").exists()
    assert (out_root / "kings-hall" / f"occluder.{h(b'o')}.glb").exists()
    assert not (out_root / "kings-hall" / "preview" / "room.glb").exists()
    assert not (out_root / "kings-hall" / "stale").exists()


# --- content-hashed file names (Task 5): a changed bundle gets a new URL, so long-lived caching is safe

def test_shipped_name_carries_the_first_8_hex_of_the_sha256(tmp_path):
    f = tmp_path / "room.glb"
    f.write_bytes(b"abc")
    sha = hashlib.sha256(b"abc").hexdigest()
    assert bs.shipped_name("kings-hall", "phone", f) == f"scans/kings-hall/phone/room.{sha[:8]}.glb"
    assert bs.shipped_name("kings-hall", "occluder", f) == f"scans/kings-hall/occluder.{sha[:8]}.glb"


@pytest.mark.parametrize("scan_id", SHIPPED)
def test_shipped_files_are_content_hashed(scan_id):
    m = _manifest(scan_id)
    items = [(d, m["bundles"][d]) for d in bs.DEVICES] + [("preview", m["preview"]), ("occluder", m["occluder"])]
    for name, b in items:
        stem = "occluder" if name == "occluder" else f"{name}/room"
        assert b["file"] == f"scans/{scan_id}/{stem}.{b['sha256'][:8]}.glb", (name, b["file"])


@pytest.mark.parametrize("mutate", [
    lambda m: m["bundles"]["phone"].__setitem__("file", "scans/kings-hall/phone/room.glb"),
    lambda m: m["bundles"]["phone"].__setitem__("file", "scans/kings-hall/phone/room.00000000.glb"),
    lambda m: m["occluder"].__setitem__("file", "scans/kings-hall/occluder.glb"),
    lambda m: m["preview"].__setitem__("file", "scans/kings-hall/preview/room.glb"),
])
def test_a_manifest_file_name_must_carry_its_own_hash(mutate):
    m = copy.deepcopy(_manifest("kings-hall"))
    mutate(m)
    assert any("file" in e for e in bs.validate_manifest(m))


def test_check_bundles_flags_a_stray_file_in_the_shipped_folder(tmp_path):
    m = copy.deepcopy(_manifest("kings-hall"))
    public = tmp_path / "public"
    for b in [m["bundles"]["phone"], m["bundles"]["desktop"], m["preview"], m["occluder"]]:
        src = bs.ROOT / "site" / "public" / b["file"]
        (public / b["file"]).parent.mkdir(parents=True, exist_ok=True)
        (public / b["file"]).write_bytes(src.read_bytes())
    assert bs.check_bundles(m, public) == []
    (public / "scans" / "kings-hall" / "phone" / "room.glb").write_bytes(b"old name")
    assert any("not in the manifest" in e for e in bs.check_bundles(m, public))


@pytest.mark.parametrize("scan_id", SHIPPED)
def test_shipped_bundles_are_within_budget_and_match_their_manifest(scan_id):
    m = _manifest(scan_id)
    assert bs.check_bundles(m) == []
    for device, limit in bs.BUDGETS.items():
        b = m["bundles"][device]
        assert b["bytes"] <= limit
        assert (bs.ROOT / "site" / "public" / b["file"]).stat().st_size == b["bytes"]
    assert m["occluder"]["tris"] <= bs.OCCLUDER_MAX_TRIS
    assert m["bundles"]["phone"]["texture_px"] * 2 == m["bundles"]["desktop"]["texture_px"]


def test_check_bundles_catches_a_stale_bundle():
    m = copy.deepcopy(_manifest("kings-hall"))
    m["bundles"]["phone"]["sha256"] = "0" * 64
    assert any("phone" in e for e in bs.check_bundles(m))


# --- manifest schema ---------------------------------------------------------------------------

@pytest.mark.parametrize("scan_id", ALL)
def test_shipped_manifest_schema_is_valid(scan_id):
    m = _manifest(scan_id)
    assert bs.validate_manifest(m) == []
    assert m["id"] == scan_id
    assert m["licence"] == "CC BY 4.0"
    assert m["sketchfab_url"] == bs.SCANS[scan_id]["sketchfab_url"]
    assert m["stations"] == []
    assert "CC BY 4.0" in m["credit"] or "CC-BY-4.0" in m["credit"]


def test_margam_credit_is_the_publishers_wording_verbatim():
    credit = _manifest("margam-entrance-hall")["credit"]
    assert credit.startswith(
        'This work is based on "Margam Castle - Entrance Hall" '
        "(https://sketchfab.com/3d-models/margam-castle-entrance-hall-07507e2498d94a58819e2e461b170866) "
        "by Greenhatch-Group (https://sketchfab.com/Greenhatch-Group) licensed under CC-BY-4.0 "
        "(http://creativecommons.org/licenses/by/4.0/)")


@pytest.mark.parametrize("mutate,needle", [
    (lambda m: m.pop("credit"), "credit"),
    (lambda m: m.__setitem__("licence", "CC BY-NC 4.0"), "licence"),
    (lambda m: m.__setitem__("source_sha256", "abc"), "source_sha256"),
    (lambda m: m["bundles"].pop("phone"), "phone"),
    (lambda m: m["bundles"]["desktop"].__setitem__("bytes", -1), "bytes"),
    (lambda m: m["artworks"].append({"label": "x", "artist": None, "died": None, "status": "maybe", "evidence_url": None}), "status"),
    (lambda m: m["artworks"].append({"label": "x", "artist": "A", "died": 1900, "status": "cleared", "evidence_url": None}), "evidence_url"),
    (lambda m: m.__setitem__("stations", {}), "stations"),
    (lambda m: m.__setitem__("changes", ""), "changes"),
])
def test_invalid_manifests_are_rejected(mutate, needle):
    m = copy.deepcopy(_manifest("kings-hall"))
    mutate(m)
    errors = bs.validate_manifest(m)
    assert errors and any(needle in e for e in errors), errors


@pytest.mark.parametrize("scan_id", ALL)
def test_check_runs_the_inventory_review(scan_id, monkeypatch):
    m = _manifest(scan_id)
    assert bs.inventory_errors(m) == []
    m["artworks"].pop()
    assert any("inventory_reviewed.count" in e for e in bs.manifest_errors(m))
    monkeypatch.setattr(bs, "load_manifest", lambda _id: copy.deepcopy(m))
    assert bs.main([scan_id, "--check"]) == 1


def test_check_cli_flags_an_unregistered_shipped_folder(monkeypatch, tmp_path):
    # the whole of site/public/scans and site/public/study is checked against the reviewed records
    recs, errs = bs.shipped_records()
    assert errs == [] and bs.shipped_asset_errors() == []
    assert {k.split("/")[0] for k in recs} == {"scans", "study"}
    monkeypatch.setattr(bs, "shipped_records", lambda content=None: ({k: v for k, v in recs.items() if not k.startswith("study/")}, []))
    assert any("stray file study/" in e and "no reviewed record" in e for e in bs.shipped_asset_errors())


def test_check_cli_passes_for_shipped_scans():
    for scan_id in ALL:
        assert bs.main([scan_id, "--check"]) == 0


# --- fix round 1 -----------------------------------------------------------------------------------

def test_check_reports_an_absent_source_without_failing(tmp_path, capsys):
    assert bs.main(["kings-hall", "--check", "--source-dir", str(tmp_path)]) == 0
    assert "kings-hall: source not present: sha256 not verified" in capsys.readouterr().out


def test_check_reports_a_verified_source(tmp_path, capsys, monkeypatch):
    src = _fake_zip(tmp_path / bs.SCANS["kings-hall"]["zip"])
    m = _manifest("kings-hall")
    m["source_sha256"] = hashlib.sha256(src.read_bytes()).hexdigest()
    m["inventory_reviewed"]["source_sha256"] = m["source_sha256"]  # this (fake) source's artworks reviewed too
    monkeypatch.setattr(bs, "load_manifest", lambda scan_id: copy.deepcopy(m))
    assert bs.main(["kings-hall", "--check", "--source-dir", str(tmp_path)]) == 0
    assert "kings-hall: source sha256 verified" in capsys.readouterr().out
    # without that review, the source pin and the inventory no longer agree
    m["inventory_reviewed"]["source_sha256"] = "0" * 64
    assert bs.main(["kings-hall", "--check", "--source-dir", str(tmp_path)]) == 1


def test_check_fails_on_a_different_source(tmp_path, capsys):
    _fake_zip(tmp_path / bs.SCANS["kings-hall"]["zip"])
    assert bs.main(["kings-hall", "--check", "--source-dir", str(tmp_path)]) == 1


@pytest.mark.parametrize("scan_id", ALL)
def test_manifest_records_how_the_credit_was_verified(scan_id):
    m = _manifest(scan_id)
    cs = m["credit_source"]
    if scan_id == "margam-entrance-hall":
        assert "license.txt" in cs
    else:
        assert f"https://api.sketchfab.com/v3/models/{m['uid']}" in cs and "2026-10-13" in cs
    # a scan credit appears only where the model page itself states it
    assert ("Erik Lernestål" in m["credit"]) == (scan_id in ("kings-hall", "hallwyl-picture-gallery"))
    if "Erik Lernestål" in m["credit"]:
        assert "Lernestål" in cs


def test_credit_source_is_required():
    m = copy.deepcopy(_manifest("kings-hall"))
    m.pop("credit_source")
    assert any("credit_source" in e for e in bs.validate_manifest(m))


@pytest.mark.parametrize("scan_id", ALL)
def test_source_tris_at_the_sketchfab_cap_are_labelled_capped(scan_id):
    src = _manifest(scan_id)["source"]
    assert src["source_tris_capped"] is (src["tris"] >= bs.SKETCHFAB_TRI_CAP_MIN)
    assert src["source_tris_capped"] is True  # all five are Sketchfab's ~1M-face uploads


def test_an_invalid_manifest_never_replaces_bundle_or_manifest(tmp_path):
    out_root, mdir = tmp_path / "scans", tmp_path / "manifests"
    (out_root / "kings-hall" / "phone").mkdir(parents=True)
    (out_root / "kings-hall" / "phone" / "room.glb").write_bytes(b"old")
    mdir.mkdir()
    (mdir / "kings-hall.json").write_text("{}")
    staged = tmp_path / "staged"
    for device in ("phone", "desktop"):
        (staged / device).mkdir(parents=True)
        (staged / device / "room.glb").write_bytes(b"x")
    (staged / "occluder.glb").write_bytes(b"o")
    with pytest.raises(bs.BuildError):
        bs.publish("kings-hall", staged, out_root, manifest={"id": "kings-hall"}, manifest_dir=mdir)
    assert (out_root / "kings-hall" / "phone" / "room.glb").read_bytes() == b"old"
    assert (mdir / "kings-hall.json").read_text() == "{}"


# --- artwork crops (Task 2): masked at build time, recorded in the manifest ------------------------

def _quad_world():
    """Two unit quads side by side on the z=0 plane, each mapped to one half of the texture."""
    import numpy as np
    pos = np.array([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [2, 0, 0], [3, 0, 0], [3, 1, 0], [2, 1, 0]], float)
    faces = np.array([[0, 1, 2], [0, 2, 3], [4, 5, 6], [4, 6, 7]])
    uv = np.array([[0, 0], [.5, 0], [.5, 1], [0, 1], [.5, 0], [1, 0], [1, 1], [.5, 1]], float)
    return pos, faces, uv, np.zeros(len(faces), int)


def test_crop_selects_the_faces_whose_centre_is_inside_the_box():
    pos, faces, uv, tex = _quad_world()
    sel = bs.select_crop_faces(pos, faces, [{"id": "right", "min": [1.5, -1, -1], "max": [3.5, 2, 1]}])
    assert sorted(sel["right"].tolist()) == [2, 3]


def test_a_crop_box_that_selects_nothing_fails_the_build():
    pos, faces, uv, tex = _quad_world()
    with pytest.raises(bs.BuildError, match="nowhere"):
        bs.select_crop_faces(pos, faces, [{"id": "nowhere", "min": [9, 9, 9], "max": [10, 10, 10]}])


def test_mask_fills_the_cropped_uv_region_with_one_flat_colour_and_leaves_the_rest():
    import numpy as np
    from PIL import Image
    pos, faces, uv, tex = _quad_world()
    a = np.zeros((64, 64, 3), np.uint8)
    a[..., 0] = np.arange(64)[None, :] * 4      # a horizontal gradient: detail everywhere
    a[..., 1] = np.arange(64)[:, None] * 4
    img = Image.fromarray(a)
    sel = bs.select_crop_faces(pos, faces, [{"id": "right", "min": [1.5, -1, -1], "max": [3.5, 2, 1]}])
    out, texels = bs.mask_crops(img, uv, faces, tex, sel, texture_index=0)
    b = np.asarray(out)
    right = b[4:60, 36:60].reshape(-1, 3)
    assert texels["right"] > 0
    assert len(np.unique(right, axis=0)) == 1, "the masked region must hold no detail"
    assert (b[:, :28] == a[:, :28]).all(), "texels outside the box are untouched"


def test_changes_note_records_the_crops():
    assert bs.changes_for([]) == bs.CHANGES
    note = bs.changes_for([{"id": "p", "min": [0, 0, 0], "max": [1, 1, 1]}])
    assert note.startswith("Changes:") and "masked" in note and "1 " in note


def test_crops_hash_ignores_key_order():
    a = [{"id": "p", "min": [0, 0, 0], "max": [1, 1, 1]}]
    b = [{"max": [1, 1, 1], "min": [0, 0, 0], "id": "p"}]
    assert bs.crops_sha256(a) == bs.crops_sha256(b) != bs.crops_sha256([])


# --- unusable rooms: provenance kept, nothing shipped --------------------------------------------

def _unusable(m):
    m = copy.deepcopy(m)
    m.update(usable=False, unusable_reason="ceiling painting in copyright")
    m.pop("bundles", None); m.pop("occluder", None)
    return m


def test_an_unusable_manifest_needs_a_reason_and_no_bundles():
    m = _unusable(_manifest("kings-hall"))
    assert bs.validate_manifest(m) == []
    m["unusable_reason"] = ""
    assert any("unusable_reason" in e for e in bs.validate_manifest(m))


def test_an_unusable_room_is_never_built(tmp_path, monkeypatch):
    monkeypatch.setattr(bs, "load_manifest", lambda scan_id: _unusable(_manifest("kings-hall")))
    with pytest.raises(bs.BuildError, match="marked unusable"):
        bs.build("kings-hall", tmp_path, tmp_path)


def test_check_fails_when_an_unusable_room_still_ships_files(tmp_path, monkeypatch):
    monkeypatch.setattr(bs, "load_manifest", lambda scan_id: _unusable(_manifest("kings-hall")))
    errors, _ = bs.check("kings-hall", tmp_path, public=tmp_path / "public")
    assert errors == []
    (tmp_path / "public" / "scans" / "kings-hall").mkdir(parents=True)
    (tmp_path / "public" / "scans" / "kings-hall" / "room.glb").write_bytes(b"x")
    errors, _ = bs.check("kings-hall", tmp_path, public=tmp_path / "public")
    assert any("unusable" in e for e in errors)


@pytest.mark.parametrize("scan_id", UNUSABLE)
def test_unusable_rooms_keep_their_provenance_and_ship_nothing(scan_id):
    m = _manifest(scan_id)
    assert m["usable"] is False and m["unusable_reason"].strip()
    assert bs.validate_manifest(m) == []
    assert "bundles" not in m and "occluder" not in m
    assert not (bs.OUT / scan_id).exists()


# --- Task 3 fix round 1: square the footprint, preview bundles, room download totals --------------

def _box_room(w=10.0, d=6.0, h=4.0, yaw_deg=0.0, n=8):
    """A closed box room (floor, ceiling, four walls, each split into n x n quads) turned yaw_deg
    about the vertical: positions and faces."""
    import numpy as np
    pts, faces = [], []

    def quad_grid(origin, u, v):
        base = len(pts)
        for j in range(n + 1):
            for i in range(n + 1):
                pts.append(origin + u * (i / n) + v * (j / n))
        for j in range(n):
            for i in range(n):
                a = base + j * (n + 1) + i
                faces.append([a, a + 1, a + n + 2]); faces.append([a, a + n + 2, a + n + 1])
    X, Y, Z = np.eye(3)
    o = np.array([-w / 2, 0, -d / 2])
    quad_grid(o, Z * d, X * w)                         # floor (facing up)
    quad_grid(o + Y * h, X * w, Z * d)                 # ceiling
    quad_grid(o, X * w, Y * h)                         # north wall
    quad_grid(o + Z * d, X * w, Y * h)                 # south wall
    quad_grid(o, Z * d, Y * h)                         # west wall
    quad_grid(o + X * w, Z * d, Y * h)                 # east wall
    p = np.array(pts, float)
    t = np.radians(yaw_deg)
    rot = np.array([[np.cos(t), 0, np.sin(t)], [0, 1, 0], [-np.sin(t), 0, np.cos(t)]])
    return p @ rot.T, np.array(faces)


@pytest.mark.parametrize("yaw", [0.0, 12.0, 27.4, -41.9, 45.0])
def test_room_frame_squares_a_turned_room_so_its_extent_is_the_true_size(yaw):
    pos, faces = _box_room(yaw_deg=yaw)
    frame = bs.room_frame(pos, "y", faces)
    w, d = frame["extent"]
    assert sorted([round(w, 1), round(d, 1)]) == [6.0, 10.0], frame["extent"]
    m = bs.root_matrix(frame, "y", 1.0)
    room = bs.to_room(pos, m)
    # every wall now faces along x or z
    assert bs.wall_yaw_deg(room, faces) == pytest.approx(0.0, abs=0.5)


def test_wall_yaw_reads_the_turn_of_a_room():
    pos, faces = _box_room(yaw_deg=20.0)
    assert abs(bs.wall_yaw_deg(pos, faces)) == pytest.approx(20.0, abs=0.5)


def test_crop_boxes_follow_a_new_room_frame_and_select_the_same_faces():
    import numpy as np
    pos, faces = _box_room(yaw_deg=30.0, n=12)
    old = bs.root_matrix(bs.room_frame(pos, "y"), "y", 1.0)          # unsquared (old builds)
    new = bs.root_matrix(bs.room_frame(pos, "y", faces), "y", 1.0)   # squared
    room_old = bs.to_room(pos, old)
    c = room_old[faces].mean(1)
    pick = c[(c[:, 1] > 1) & (c[:, 1] < 3)][7]
    crops = [{"id": "p", "min": (pick - 0.6).tolist(), "max": (pick + 0.6).tolist()}]
    before = bs.select_crop_faces(room_old, faces, crops)["p"]
    moved = bs.migrate_crops(crops, old, new)
    assert moved[0]["id"] == "p" and "rot_y_deg" in moved[0]
    after = bs.select_crop_faces(bs.to_room(pos, new), faces, moved)["p"]
    assert sorted(before.tolist()) == sorted(after.tolist())
    lo, hi = np.array(moved[0]["min"]), np.array(moved[0]["max"])
    assert ((hi - lo) >= np.array(crops[0]["max"]) - np.array(crops[0]["min"]) - 1e-12).all()  # never smaller
    assert bs.migrate_crops(crops, old, old) == crops  # same frame: unchanged


def test_preview_limits_are_written():
    assert bs.PREVIEW_MAX_BYTES == 400_000
    assert bs.PREVIEW["texture_px"] in (256, 512)


@pytest.mark.parametrize("scan_id", SHIPPED)
def test_every_shipped_scan_has_a_preview_and_fits_the_room_download_per_device(scan_id):
    m = _manifest(scan_id)
    p = m["preview"]
    assert p["file"] == f"scans/{scan_id}/preview/room.{p['sha256'][:8]}.glb"
    assert 0 < p["bytes"] <= bs.PREVIEW_MAX_BYTES
    assert p["tris"] < m["bundles"]["phone"]["tris"] / 5
    assert p["texture_px"] == bs.PREVIEW["texture_px"]
    for device, limit in bs.BUDGETS.items():
        total = bs.room_download(m, device)
        assert total == p["bytes"] + m["bundles"][device]["bytes"] + m["occluder"]["bytes"]
        assert total <= limit, (device, total)


@pytest.mark.parametrize("scan_id", SHIPPED)
def test_every_shipped_scan_is_squared_to_its_walls(scan_id):
    assert abs(_manifest(scan_id)["transform"]["yaw_deg"]) <= 45
    # the occluder carries the root matrix: its walls must face along x or z within 2 degrees
    assert abs(_manifest(scan_id)["transform"]["walls_off_axis_deg"]) <= 2.0


@pytest.mark.parametrize("mutate,needle", [
    (lambda m: m.pop("preview"), "preview"),
    (lambda m: m["preview"].__setitem__("bytes", bs.PREVIEW_MAX_BYTES + 1), "preview"),
    (lambda m: m["bundles"]["phone"].__setitem__("bytes", bs.BUDGETS["phone"] - m["preview"]["bytes"] - m["occluder"]["bytes"] + 1), "phone"),
])
def test_manifests_without_a_preview_or_over_the_room_total_are_rejected(mutate, needle):
    m = copy.deepcopy(_manifest("kings-hall"))
    mutate(m)
    errors = bs.validate_manifest(m)
    assert errors and any(needle in e for e in errors), errors


def test_check_bundles_checks_the_preview():
    m = copy.deepcopy(_manifest("kings-hall"))
    m["preview"]["sha256"] = "0" * 64
    assert any("preview" in e for e in bs.check_bundles(m))


def test_publish_needs_the_staged_preview(tmp_path):
    staged = tmp_path / "staged"
    for device in ("phone", "desktop"):
        (staged / device).mkdir(parents=True)
        (staged / device / "room.glb").write_bytes(b"x")
    (staged / "occluder.glb").write_bytes(b"o")
    with pytest.raises(bs.BuildError, match="preview"):
        bs.publish("kings-hall", staged, tmp_path / "scans")


def test_preview_texture_is_baked_from_the_scan_texture_onto_a_new_atlas():
    """Two quads textured left half red, right half blue; the 'simplified' mesh is the same geometry
    with a fresh atlas: the baked texture shows red where the left quad lands, blue for the right."""
    import numpy as np
    from PIL import Image
    pos, faces, uv, tex = _quad_world()
    a = np.zeros((64, 64, 3), np.uint8)
    a[:, :32] = [200, 0, 0]
    a[:, 32:] = [0, 0, 200]
    vmap, nf, nuv = bs.atlas_uvs(pos, faces, 64)
    out = bs.bake_texture(pos[vmap], nf, nuv, pos, faces, uv, tex, [Image.fromarray(a)], 64)
    assert out.shape == (64, 64, 3)
    for f in range(len(nf)):
        c = (nuv[nf[f]].mean(0) * 64).astype(int)
        colour = out[c[1], c[0]]
        left = pos[vmap][nf[f]].mean(0)[0] < 1.5
        assert (colour[0] > 150) == left and (colour[2] > 150) == (not left), (f, colour)


def test_preview_samples_masked_texture_only():
    """The preview texture comes from the masked images: a masked (flat) region stays flat."""
    import numpy as np
    from PIL import Image
    pos, faces, uv, tex = _quad_world()
    a = np.zeros((64, 64, 3), np.uint8)
    a[..., 0] = np.arange(64)[None, :] * 4
    sel = bs.select_crop_faces(pos, faces, [{"id": "right", "min": [1.5, -1, -1], "max": [3.5, 2, 1]}])
    masked, _ = bs.mask_crops(Image.fromarray(a), uv, faces, tex, sel, texture_index=0)
    vmap, nf, nuv = bs.atlas_uvs(pos, faces, 64)
    out = bs.bake_texture(pos[vmap], nf, nuv, pos, faces, uv, tex, [masked], 64)
    right = [f for f in range(len(nf)) if pos[vmap][nf[f]].mean(0)[0] > 1.5]
    cols = {tuple(out[int(c[1]), int(c[0])]) for f in right for c in [nuv[nf[f]].mean(0) * 64]}
    assert len(cols) == 1
