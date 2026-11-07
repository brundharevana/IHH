# tools/tests/test_build_study_corner.py: the study corner's prop bundles (Task 6).
import copy
import json
import math
import struct
from pathlib import Path

import numpy as np
import pytest

import build_study_corner as bsc
from build_scans import BuildError, write_glb, read_glb

ROOT = Path(__file__).resolve().parents[2]
SHIPPED = json.loads((ROOT / "content" / "einstein" / "study-corner.json").read_text())


def test_shipped_bundles_match_their_record_and_fit_inside_the_room_download():
    import build_scans
    assert bsc.check_bundles(SHIPPED, ROOT / "site" / "public") == []
    assert not hasattr(bsc, "CORNER_BUDGET")  # no separate corner allowance (fix round 1)
    scan = bsc.room_scan(SHIPPED)
    assert scan["id"] == "hallwyl-great-drawing-room"
    for d in bsc.DEVICES:
        assert scan["downloads"][d] + SHIPPED["bundles"][d]["bytes"] <= build_scans.BUDGETS[d]
    # The scan build leaves the corner's bytes free in this room, and its check counts them.
    assert build_scans.room_extras("hallwyl-great-drawing-room") == {d: SHIPPED["bundles"][d]["bytes"] for d in bsc.DEVICES}
    assert build_scans.room_extras("kings-hall") == {d: 0 for d in bsc.DEVICES}


def test_scan_check_counts_the_corner_in_the_room_download(monkeypatch):
    import build_scans
    m = build_scans.load_manifest("hallwyl-great-drawing-room")
    assert build_scans.validate_manifest(m) == []
    extra = build_scans.room_extras("hallwyl-great-drawing-room")
    monkeypatch.setattr(build_scans, "BUDGETS", dict(build_scans.BUDGETS, desktop=m["downloads"]["desktop"] + extra["desktop"] - 1))
    assert any("desktop" in e and "room download" in e for e in build_scans.validate_manifest(m))


def test_corner_check_refuses_a_room_download_over_budget(monkeypatch):
    import build_scans
    scan = bsc.room_scan(SHIPPED)
    monkeypatch.setattr(build_scans, "BUDGETS", dict(build_scans.BUDGETS, phone=scan["downloads"]["phone"] + SHIPPED["bundles"]["phone"]["bytes"] - 1))
    assert any("phone" in e and "room download" in e for e in bsc.check_bundles(SHIPPED, ROOT / "site" / "public"))


def test_shipped_bundles_carry_only_the_declared_models_and_no_excluded_image():
    excluded = set(SHIPPED["sources"][0]["kit_check"]["excluded"]["images"])
    for d in bsc.DEVICES:
        gltf, _ = read_glb(ROOT / "site" / "public" / SHIPPED["bundles"][d]["file"])
        roots = {gltf["nodes"][i]["name"] for i in gltf["scenes"][gltf.get("scene", 0)]["nodes"]}
        assert roots == set(SHIPPED["models"])
        names = {im.get("name") for im in gltf["images"]}
        assert not names & excluded
        assert not any("Tablo" in (n or "") for n in names)
        assert all(im["mimeType"] == "image/ktx2" for im in gltf["images"])
        assert "KHR_texture_basisu" in gltf["extensionsRequired"]
        assert SHIPPED["sources"][0]["credit"] in gltf["asset"]["copyright"]


def _copy_public(tmp_path):
    pub = tmp_path / "public"
    for d in bsc.DEVICES:
        rel = SHIPPED["bundles"][d]["file"]
        (pub / rel).parent.mkdir(parents=True, exist_ok=True)
        (pub / rel).write_bytes((ROOT / "site" / "public" / rel).read_bytes())
    return pub


def test_check_catches_a_changed_file_a_stray_file_and_an_unlisted_model(tmp_path):
    pub = _copy_public(tmp_path)
    rel = SHIPPED["bundles"]["phone"]["file"]
    data = bytearray((pub / rel).read_bytes()); data[-1] ^= 1
    (pub / rel).write_bytes(bytes(data))
    assert any("sha256" in e for e in bsc.check_bundles(SHIPPED, pub))
    pub = _copy_public(tmp_path / "b")
    (pub / "study" / "einstein" / "phone" / "corner.deadbeef.glb").write_bytes(b"x")
    assert any("stray file" in e for e in bsc.check_bundles(SHIPPED, pub))
    c = copy.deepcopy(SHIPPED); c["models"]["telephone"] = {"source": "renend", "node": "SM_Cevirmeli_Ev_Telefonu"}
    assert any("differ from the declared models" in e for e in bsc.check_bundles(c, _copy_public(tmp_path / "c")))


@pytest.mark.parametrize("rel", ["study/einstein/notes.txt", "study/einstein/phone/corner.a8768e36.ktx2",
                                 "study/other/desktop/corner.deadbeef.glb", "study/.DS_Store"])
def test_check_catches_any_unrecorded_file_under_study(tmp_path, rel):
    # Codex gate 2026-10-14: every file beneath site/public/study is cached a year as immutable, so
    # every one must be in a study-corner record, not only the GLBs of this corner's folder.
    pub = _copy_public(tmp_path)
    assert bsc.check_bundles(SHIPPED, pub) == []
    (pub / rel).parent.mkdir(parents=True, exist_ok=True); (pub / rel).write_bytes(b"x")
    assert any(rel in e and "stray file" in e for e in bsc.check_bundles(SHIPPED, pub))


def test_check_catches_an_excluded_image_in_a_bundle(tmp_path):
    pub = _copy_public(tmp_path)
    rel = SHIPPED["bundles"]["phone"]["file"]
    gltf, binc = read_glb(pub / rel)
    gltf["images"][0]["name"] = "Tablo_P1_Albedo"
    write_glb(pub / rel, gltf, binc)
    assert any("excluded image" in e for e in bsc.check_bundles(SHIPPED, pub))


# A tiny source GLB: a 2 x 1 x 0.5 box node "Box", a 1 x 1 x 1 node "Painting" whose material uses an
# image named "Tablo_P1_Albedo", and an unused material with another image.
def _box(sx, sy, sz):
    p = np.array([[x, y, z] for x in (-sx / 2, sx / 2) for y in (0, sy) for z in (-sz / 2, sz / 2)], dtype=np.float32)
    idx = np.array([0, 1, 2, 1, 3, 2, 4, 6, 5, 5, 6, 7, 0, 4, 1, 1, 4, 5, 2, 3, 6, 3, 7, 6, 0, 2, 4, 2, 6, 4, 1, 5, 3, 3, 5, 7], dtype=np.uint16)
    return p, idx


def _source_glb(path):
    png = bytes.fromhex("89504e470d0a1a0a0000000d4948445200000001000000010806000000"
                        "1f15c4890000000d49444154789c6360f8cf00000301010018dd8db40000000049454e44ae426082")
    binc, views, accs, meshes = b"", [], [], []
    for (sx, sy, sz) in ((2, 1, 0.5), (1, 1, 1)):
        p, idx = _box(sx, sy, sz)
        for arr, target, typ, comp in ((p, 34962, "VEC3", 5126), (idx, 34963, "SCALAR", 5123)):
            data = arr.tobytes(); data += b"\0" * (-len(data) % 4)
            views.append({"buffer": 0, "byteOffset": len(binc), "byteLength": arr.nbytes, "target": target})
            a = {"bufferView": len(views) - 1, "componentType": comp, "count": len(arr), "type": typ}
            if typ == "VEC3": a.update(min=p.min(0).tolist(), max=p.max(0).tolist())
            accs.append(a); binc += data
        meshes.append({"primitives": [{"attributes": {"POSITION": len(accs) - 2}, "indices": len(accs) - 1, "material": len(meshes)}]})
    imgs = []
    for name in ("Box_Albedo", "Tablo_P1_Albedo", "Unused_Albedo"):
        views.append({"buffer": 0, "byteOffset": len(binc), "byteLength": len(png)})
        imgs.append({"name": name, "bufferView": len(views) - 1, "mimeType": "image/png"})
        binc += png + b"\0" * (-len(png) % 4)
    gltf = {"asset": {"version": "2.0"}, "scene": 0, "scenes": [{"nodes": [0, 1]}],
            "nodes": [{"name": "Box", "mesh": 0, "translation": [5, 0, 5]}, {"name": "Painting", "mesh": 1}],
            "meshes": meshes, "accessors": accs, "bufferViews": views, "buffers": [{"byteLength": len(binc)}],
            "images": imgs, "textures": [{"source": 0}, {"source": 1}, {"source": 2}],
            "materials": [{"name": "M_Box", "pbrMetallicRoughness": {"baseColorTexture": {"index": 0}}},
                          {"name": "M_Tablo", "pbrMetallicRoughness": {"baseColorTexture": {"index": 1}}},
                          {"name": "M_Unused", "pbrMetallicRoughness": {"baseColorTexture": {"index": 2}}}]}
    write_glb(path, gltf, binc)


def _corner(node="Box", scale="fit", w=1.0, h=0.5, d=0.25, yaw=0):
    return {"objects": [{"id": "desk", "kind": "desk", "model": "desk", "x": 0, "z": 0, "rotY": 0, "w": w, "d": d, "h": h, "basis_media_ids": ["M1"]}],
            "models": {"desk": {"source": "s", "node": node, "yaw_deg": yaw, "scale": scale, "includes": []}},
            "sources": [{"id": "s", "kit_check": {"result": "pass", "excluded": {"nodes": ["Painting"], "images": ["Tablo_P1_Albedo"]}}}]}


def test_subset_keeps_only_the_declared_model_and_its_images(tmp_path):
    _source_glb(tmp_path / "src.glb")
    gltf, info, files = bsc.subset_gltf(tmp_path / "src.glb", _corner(), tmp_path)
    assert [n["name"] for n in gltf["nodes"]] == ["desk"]
    assert [m["name"] for m in gltf["materials"]] == ["M_Box"]
    assert [im["name"] for im in gltf["images"]] == ["Box_Albedo"]
    assert info["desk"]["size"] == [1.0, 0.5, 0.25]
    # The node's matrix centres the footprint at the origin and puts the base at y = 0 (the source
    # node's own translation is not used).
    m = np.array(gltf["nodes"][0]["matrix"]).reshape(4, 4).T
    p, _ = _box(2, 1, 0.5)
    q = (np.c_[p, np.ones(len(p))] @ m.T)[:, :3]
    assert np.allclose(q.min(0), [-0.5, 0, -0.125]) and np.allclose(q.max(0), [0.5, 0.5, 0.125])


def test_subset_refuses_an_excluded_node_or_image(tmp_path):
    _source_glb(tmp_path / "src.glb")
    with pytest.raises(BuildError, match="excluded by the kit check"):
        bsc.subset_gltf(tmp_path / "src.glb", _corner(node="Painting"), tmp_path)
    c = _corner(node="Painting"); c["sources"][0]["kit_check"]["excluded"]["nodes"] = []
    with pytest.raises(BuildError, match="excluded image"):
        bsc.subset_gltf(tmp_path / "src.glb", c, tmp_path)


def test_uniform_scale_must_match_the_declared_footprint(tmp_path):
    _source_glb(tmp_path / "src.glb")
    gltf, info, _ = bsc.subset_gltf(tmp_path / "src.glb", _corner(scale="uniform", w=1.0, h=0.5, d=0.25), tmp_path)
    assert info["desk"]["size"] == [1.0, 0.5, 0.25]
    with pytest.raises(BuildError, match="its w is 1.000 m, declared 1.5 m"):
        bsc.subset_gltf(tmp_path / "src.glb", _corner(scale="uniform", w=1.5, h=0.5, d=0.25), tmp_path)


def test_yaw_turns_the_model_before_sizing(tmp_path):
    _source_glb(tmp_path / "src.glb")
    _, info, _ = bsc.subset_gltf(tmp_path / "src.glb", _corner(scale="uniform", w=0.25, h=0.5, d=1.0, yaw=90), tmp_path)
    assert info["desk"]["size"] == [0.25, 0.5, 1.0]


def test_build_refuses_a_failed_kit_check_and_names_the_source_page(tmp_path, monkeypatch):
    c = copy.deepcopy(SHIPPED)
    c["sources"][0]["kit_check"]["result"] = "fail"
    monkeypatch.setattr(bsc, "load_corner", lambda slug: c)
    with pytest.raises(BuildError, match="kit check result is 'fail'"):
        bsc.build("einstein", tmp_path, tmp_path / "public")
    c["sources"][0]["kit_check"]["result"] = "pass"
    with pytest.raises(BuildError, match=r"missing: download it from https://sketchfab\.com/3d-models/modular-vintage"):
        bsc.build("einstein", tmp_path, tmp_path / "public")
    (tmp_path / c["sources"][0]["source_file"]).write_bytes(b"not the owner's file")
    with pytest.raises(BuildError, match="differs from the pinned"):
        bsc.build("einstein", tmp_path, tmp_path / "public")
