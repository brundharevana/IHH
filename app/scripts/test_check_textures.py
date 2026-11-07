"""The texture provenance gate (check_textures.py): a shipped model or photo room whose pixels come from a
record that is not verified and cleared, or not owner-ruled, fails the build (final review I1, Codex
Task 19 Medium: a reference-only photograph could texture a room with every other gate green)."""
import hashlib
import json
import re
import struct
from pathlib import Path

from check_textures import check, REPO, main, glb_images, record

PNG_A = b"\x89PNG\r\n\x1a\n" + b"pixels-from-a-cleared-photograph"
PNG_B = b"\x89PNG\r\n\x1a\n" + b"pixels-from-somewhere-else"


def make_glb(images=(PNG_A,), uri=None):
    """A real (tiny) binary glTF: one buffer holding each image, as finalize writes them."""
    binary, views = b"", []
    for img in images:
        views.append({"buffer": 0, "byteOffset": len(binary), "byteLength": len(img)})
        binary += img + b"\x00" * (-len(img) % 4)
    doc = {"asset": {"version": "2.0"}, "buffers": [{"byteLength": len(binary)}], "bufferViews": views,
           "images": [{"bufferView": i, "mimeType": "image/png", "name": f"tex{i}"} for i in range(len(images))]}
    if uri:
        doc["images"].append({"uri": uri})
    js = json.dumps(doc).encode()
    js += b" " * (-len(js) % 4)
    body = struct.pack("<II", len(js), 0x4E4F534A) + js + struct.pack("<II", len(binary), 0x004E4942) + binary
    return struct.pack("<4sII", b"glTF", 2, 12 + len(body)) + body

INDEX = {"media": {
    "XXX-M-0001": {"embeddable": True, "rights": "public-domain"},
    "XXX-M-0002": {"embeddable": False, "rights": "public-domain", "referenceOnly": "ruled reference only"},
    "XXX-M-0003": {"embeddable": False, "rights": "unknown"},
}}
RULINGS = {"roll-1": {"inherits": ["XXX-M-0001"], "ruling": "frames inherit the roll"}}


def repo(tmp_path, meta, sources="", files=("models/room/room.glb",), data="", recorded=True, record_images=True):
    (tmp_path / "assets-src/room").mkdir(parents=True)
    (tmp_path / "assets-src/room/meta.json").write_text(json.dumps(meta))
    (tmp_path / "assets-src/room/SOURCES.md").write_text(sources)
    images = {}
    (tmp_path / "src.jpg").write_bytes(b"holder download")
    for f in files:
        p = tmp_path / "app/public" / f
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(make_glb() if f.endswith(".glb") else b"RIFF....WEBP")
        if not f.endswith(".glb"):
            named = re.search(r"[A-Z]{3}-M-\d{4}", f)
            images[f] = {"sha256": hashlib.sha256(p.read_bytes()).hexdigest(), "source": {"media": named.group(0) if named else "XXX-M-0001"},
                         "sourceFile": "src.jpg", "sourceSha256": hashlib.sha256(b"holder download").hexdigest(), "transform": "test",
                         "proof": "pinned"}
    (tmp_path / "assets-src/app-public").mkdir(parents=True, exist_ok=True)
    (tmp_path / "assets-src/app-public/images.json").write_text(json.dumps(images if record_images else {}))
    if recorded:
        record(tmp_path / "assets-src/room/meta.json", tmp_path / "app/public")
    (tmp_path / "app/src/tour/data").mkdir(parents=True)
    (tmp_path / "app/src/tour/data/room.js").write_text(data)
    return tmp_path


def errs(tmp_path, meta, **k):
    return check(repo(tmp_path, meta, **k), INDEX, RULINGS)


def test_cleared_record_passes(tmp_path):
    assert errs(tmp_path, {"texturesFrom": [{"media": "XXX-M-0001"}]}, sources="| XXX-M-0001 | basis |") == []


def test_reference_only_or_uncleared_or_unverified_texture_fails(tmp_path):
    for mid, why in (("XXX-M-0002", "ruled reference only"), ("XXX-M-0003", "licence class unknown"), ("XXX-M-0009", "not a verified record")):
        out = check(repo(tmp_path / mid, {"texturesFrom": [{"media": mid}]}), INDEX, RULINGS)
        assert any(mid in e and why in e for e in out), out


def test_shipped_model_without_declaration_fails(tmp_path):
    root = repo(tmp_path, {"texturesFrom": []}, files=("models/room/room.glb", "models/other/other.glb", "rooms/x/y-photo.webp"))
    out = check(root, INDEX, RULINGS)
    assert any(e.startswith("models/other/other.glb: no assets-src") for e in out)
    assert any(e.startswith("rooms/x/y-photo.webp: no assets-src") for e in out)


def test_unclassified_record_in_sources_fails(tmp_path):
    out = errs(tmp_path, {"texturesFrom": []}, sources="Modelled from XXX-M-0003.")
    assert any("XXX-M-0003 is named in SOURCES.md but is neither" in e for e in out)
    assert errs(tmp_path / "b", {"texturesFrom": [], "notTextures": ["XXX-M-0003"]}, sources="Modelled from XXX-M-0003.") == []


def test_ruled_items_need_a_known_ruling_and_a_cleared_record(tmp_path):
    rows = "| 09, 10 | frames |"
    ok = {"texturesFrom": [{"ruling": "roll-1", "inherits": "XXX-M-0001", "items": ["09, 10"]}]}
    assert errs(tmp_path / "a", ok, sources=rows + " XXX-M-0001") == []
    bad = {"texturesFrom": [{"ruling": "roll-9", "inherits": "XXX-M-0001", "items": ["09, 10"]}]}
    assert any("not an owner ruling" in e for e in errs(tmp_path / "b", bad, sources=rows))
    other = {"texturesFrom": [{"ruling": "roll-1", "inherits": "XXX-M-0003", "items": ["09, 10"]}]}
    assert any("does not cover record XXX-M-0003" in e for e in errs(tmp_path / "c", other, sources=rows))
    missing = {"texturesFrom": [{"ruling": "roll-1", "inherits": "XXX-M-0001", "items": ["11"]}]}
    assert any("'11' is not a row of SOURCES.md" in e for e in errs(tmp_path / "d", missing, sources=rows + " XXX-M-0001"))


def test_third_party_licence_must_be_open(tmp_path):
    meta = {"texturesFrom": [], "thirdPartyTextures": [{"name": "Some texture", "licence": "cc-by-sa"}]}
    assert any("licence 'cc-by-sa'" in e for e in errs(tmp_path, meta))


def test_photo_room_file_must_be_declared_for_its_record(tmp_path):
    data = "{ id: 'XXX-M-0001',\n    // its photo room\n    backdrop: { photo: '/rooms/r/a-photo.webp' } }"
    good = {"ships": ["rooms/r/"], "texturesFrom": [{"media": "XXX-M-0001"}]}
    assert errs(tmp_path / "a", good, files=("rooms/r/a-photo.webp",), data=data, sources="XXX-M-0001") == []
    wrong = {"ships": ["rooms/r/"], "texturesFrom": [], "notTextures": ["XXX-M-0001"]}
    out = errs(tmp_path / "b", wrong, files=("rooms/r/a-photo.webp",), data=data, sources="XXX-M-0001")
    assert any("does not list XXX-M-0001 as its texture source" in e for e in out)
    # the record store's double-quoted shape (einstein-artifacts.js) is read too
    quoted = '{ "id": "XXX-M-0001",\n    "backdrop": { "photo": "/rooms/r/a-photo.webp" } }'
    out = errs(tmp_path / "c", wrong, files=("rooms/r/a-photo.webp",), data=quoted, sources="XXX-M-0001")
    assert any("does not list XXX-M-0001 as its texture source" in e for e in out)


def test_place_naming_its_photo_room_files_fails(tmp_path):
    # round 9 fix round 7: a place's photo room files come from its record, never from the place
    data = "{ mediaId: 'XXX-M-0001', src: { photo: '/rooms/r/a-photo.webp' } }"
    good = {"ships": ["rooms/r/"], "texturesFrom": [{"media": "XXX-M-0001"}]}
    out = errs(tmp_path, good, files=("rooms/r/a-photo.webp",), data=data, sources="XXX-M-0001")
    assert any("names its files in the place" in e for e in out)


def test_public_file_named_for_an_uncleared_record_fails(tmp_path):
    out = errs(tmp_path, {"texturesFrom": []}, files=("models/room/room.glb", "media/x/XXX-M-0003.webp"))
    assert any("media/x/XXX-M-0003.webp: file of media XXX-M-0003" in e for e in out)


def test_the_shipped_tree_passes():
    assert main() == 0
    assert (REPO / "assets-src/albright-oval-office-1993/meta.json").exists()


def test_vienna_postcard_is_textures_by_owner_ruling_and_cleared():
    meta = json.loads((REPO / "assets-src/lamarr-vienna-central-cemetery/meta.json").read_text())
    [e] = meta["texturesFrom"]
    assert e["media"] == "LAM-M-0029" and "Owner ruling 2026-10-24" in e["ownerRuling"]
    index = json.loads((REPO / "app/src/tour/data/facts.generated.json").read_text())
    assert index["media"]["LAM-M-0029"]["embeddable"] is True and index["media"]["LAM-M-0029"]["rights"] == "cc0"
    assert Path(REPO / "assets-src/lamarr-vienna-central-cemetery/previews/final_compare_cam_card.jpg").exists()


def test_glb_images_reads_the_embedded_buffers():
    import hashlib
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / "a.glb"
        p.write_bytes(make_glb((PNG_A, PNG_B), uri="data:image/png;base64,AAAA"))
        imgs = glb_images(p)
    assert [i.get("sha256") for i in imgs[:2]] == [hashlib.sha256(PNG_A).hexdigest(), hashlib.sha256(PNG_B).hexdigest()]
    assert imgs[2]["uri"].startswith("data:image/png")


def test_a_glb_whose_images_changed_after_finalize_fails(tmp_path):
    root = repo(tmp_path, {"texturesFrom": [{"media": "XXX-M-0001"}]}, sources="XXX-M-0001")
    assert check(root, INDEX, RULINGS) == []
    # a texture swapped into the shipped model without finalize (and its record) is caught
    (root / "app/public/models/room/room.glb").write_bytes(make_glb((PNG_B,)))
    assert any("differ from the ones recorded at finalize" in e for e in check(root, INDEX, RULINGS))
    # an added image too
    (root / "app/public/models/room/room.glb").write_bytes(make_glb((PNG_A, PNG_B)))
    assert any("2 in the file, 1 recorded" in e for e in check(root, INDEX, RULINGS))


def test_unrecorded_glb_and_uri_images_fail(tmp_path):
    out = check(repo(tmp_path / "a", {"texturesFrom": []}, recorded=False), INDEX, RULINGS)
    assert any("embedded images are not recorded" in e for e in out)
    root = repo(tmp_path / "b", {"texturesFrom": []})
    (root / "app/public/models/room/room.glb").write_bytes(make_glb((PNG_A,), uri="textures/outside.png"))
    record(root / "assets-src/room/meta.json", root / "app/public", rebaseline=True, reason="the glb now has a URI image")
    assert any("is a URI (textures/outside.png)" in e for e in check(root, INDEX, RULINGS))


def test_any_unclaimed_image_under_public_fails(tmp_path):
    out = errs(tmp_path, {"texturesFrom": []}, files=("models/room/room.glb", "landing/globe.webp"))
    assert any(e.startswith("landing/globe.webp: no assets-src") for e in out)


def test_standalone_image_without_a_recorded_source_fails(tmp_path):
    out = errs(tmp_path, {"ships": ["models/room/", "landing/"], "texturesFrom": [{"media": "XXX-M-0001"}]}, sources="XXX-M-0001",
               files=("models/room/room.glb", "landing/globe.webp"), record_images=False)
    assert any("landing/globe.webp: no recorded source" in e for e in out)


def test_standalone_image_bytes_source_and_hashes_are_checked(tmp_path):
    meta = {"ships": ["models/room/", "landing/"], "texturesFrom": [{"media": "XXX-M-0001"}]}
    root = repo(tmp_path, meta, sources="XXX-M-0001", files=("models/room/room.glb", "landing/globe.webp"))
    assert check(root, INDEX, RULINGS) == []
    man = root / "assets-src/app-public/images.json"
    good = json.loads(man.read_text())
    # replaced bytes under the same name
    (root / "app/public/landing/globe.webp").write_bytes(b"RIFF....OTHER")
    assert any("its bytes differ from the recorded image" in e for e in check(root, INDEX, RULINGS))
    (root / "app/public/landing/globe.webp").write_bytes(b"RIFF....WEBP")
    # a changed source file
    (root / "src.jpg").write_bytes(b"another photograph")
    assert any("source file src.jpg differs" in e for e in check(root, INDEX, RULINGS))
    (root / "src.jpg").write_bytes(b"holder download")
    # no source-file hash, an undeclared source, an uncleared source
    for bad, why in (({"sourceSha256": None}, "no source-file hash"), ({"source": {}}, "no declared source"),
                     ({"source": {"media": "XXX-M-0003"}}, "not a verified, cleared record")):
        man.write_text(json.dumps({k: {**v, **bad} for k, v in good.items()}))
        assert any(why in e for e in check(root, INDEX, RULINGS)), why
    # a generator script that changed since the image was recorded
    (root / "gen.py").write_text("print(1)")
    man.write_text(json.dumps({k: {**v, "generator": {"script": "gen.py", "sha256": "0" * 64}} for k, v in good.items()}))
    assert any("generator gen.py changed" in e for e in check(root, INDEX, RULINGS))


def test_a_named_image_must_come_from_its_own_record(tmp_path):
    root = repo(tmp_path, {"texturesFrom": []}, files=("models/room/room.glb", "media/x/XXX-M-0001.webp"))
    man = root / "assets-src/app-public/images.json"
    m = json.loads(man.read_text())
    m["media/x/XXX-M-0001.webp"]["source"] = {"media": "XXX-M-0002"}
    man.write_text(json.dumps(m))
    assert any("named for XXX-M-0001 but recorded from XXX-M-0002" in e for e in check(root, INDEX, RULINGS))


def test_record_refuses_an_undeclared_folder_and_records_its_generator(tmp_path):
    import pytest
    root = repo(tmp_path, {"title": "no declaration"}, recorded=False)
    with pytest.raises(ValueError, match="no texturesFrom declaration"):
        record(root / "assets-src/room/meta.json", root / "app/public")
    root = repo(tmp_path / "b", {"texturesFrom": []}, recorded=False)
    (root / "assets-src/room/make_textures.py").write_text("# draws the textures")
    (root / "assets-src/room/tex").mkdir()
    (root / "assets-src/room/tex/wood.jpg").write_bytes(b"wood")
    record(root / "assets-src/room/meta.json", root / "app/public")
    meta = json.loads((root / "assets-src/room/meta.json").read_text())
    assert set(meta["generator"]["scripts"]) == {"make_textures.py"} and set(meta["generator"]["inputs"]) == {"tex/wood.jpg"}
    assert check(root, INDEX, RULINGS) == []
    (root / "assets-src/room/make_textures.py").write_text("# draws other textures")
    assert any("generator script make_textures.py changed" in e for e in check(root, INDEX, RULINGS))
    (root / "assets-src/room/make_textures.py").write_text("# draws the textures")
    (root / "assets-src/room/tex/wood.jpg").write_bytes(b"other wood")
    assert any("texture input tex/wood.jpg changed" in e for e in check(root, INDEX, RULINGS))


def test_a_byte_copy_is_verified_against_its_source_and_every_image_has_a_proof_class(tmp_path):
    meta = {"ships": ["models/room/", "landing/"], "texturesFrom": [{"media": "XXX-M-0001"}]}
    root = repo(tmp_path, meta, sources="XXX-M-0001", files=("models/room/room.glb", "landing/globe.webp"))
    man = root / "assets-src/app-public/images.json"
    good = json.loads(man.read_text())
    # recorded as identical to its source, but it is not: fails
    man.write_text(json.dumps({k: {**v, "proof": "identical"} for k, v in good.items()}))
    assert any("recorded as a byte copy of src.jpg" in e for e in check(root, INDEX, RULINGS))
    # a real copy passes
    (root / "src.jpg").write_bytes(b"RIFF....WEBP")
    copy = {k: {**v, "proof": "identical", "sourceSha256": hashlib.sha256(b"RIFF....WEBP").hexdigest()} for k, v in good.items()}
    man.write_text(json.dumps(copy))
    assert check(root, INDEX, RULINGS) == []
    # no proof class
    man.write_text(json.dumps({k: {f: x for f, x in v.items() if f != "proof"} for k, v in good.items()}))
    assert any("no proof class" in e for e in check(root, INDEX, RULINGS))


def test_record_refuses_a_silent_rebaseline_and_logs_an_explained_one(tmp_path):
    import pytest
    root = repo(tmp_path, {"texturesFrom": [{"media": "XXX-M-0001"}]}, sources="XXX-M-0001")
    meta_path, public, log = root / "assets-src/room/meta.json", root / "app/public", root / "assets-src/room/record-log.jsonl"
    first = json.loads(log.read_text().splitlines()[0])
    assert first["added"] == ["models/room/room.glb"] and first["reason"] == "first record of new items"
    # recording the same bytes again is no re-baseline
    record(meta_path, public)
    # other bytes in the shipped glb: recording them over the old record is refused, nothing written
    (public / "models/room/room.glb").write_bytes(make_glb((PNG_B,)))
    before = meta_path.read_text()
    with pytest.raises(ValueError, match="re-baseline of 1 recorded item"):
        record(meta_path, public)
    with pytest.raises(ValueError, match="re-baseline"):
        record(meta_path, public, rebaseline=True, reason="  ")
    with pytest.raises(ValueError, match="re-baseline"):
        record(meta_path, public, rebaseline=False, reason="rebuilt")
    assert meta_path.read_text() == before
    assert any("differ from the ones recorded" in e for e in check(root, INDEX, RULINGS))
    # explicit, with a reason: written and logged with the old and new hashes
    record(meta_path, public, rebaseline=True, reason="room rebuilt after the floor fix")
    assert check(root, INDEX, RULINGS) == []
    last = json.loads(log.read_text().splitlines()[-1])
    assert last["reason"] == "room rebuilt after the floor fix"
    ch = last["changed"]["models/room/room.glb"]
    assert ch["old"][0]["sha256"] == hashlib.sha256(PNG_A).hexdigest() and ch["new"][0]["sha256"] == hashlib.sha256(PNG_B).hexdigest()


def test_image_record_guard_refuses_changes_and_drops_without_a_reason(tmp_path):
    import pytest
    import image_sources
    log = tmp_path / "log.jsonl"
    old = {"a.webp": {"sha256": "1"}, "b.webp": {"sha256": "2"}}
    # an added image is no re-baseline
    assert image_sources.guard_rebaseline("t", "m", old, {**old, "c.webp": {"sha256": "3"}}, log=log) == {}
    for new in ({"a.webp": {"sha256": "9"}, "b.webp": {"sha256": "2"}}, {"a.webp": {"sha256": "1"}}):
        with pytest.raises(image_sources.Refused):
            image_sources.guard_rebaseline("t", "m", old, new, log=log)
    changes = image_sources.guard_rebaseline("t", "m", old, {"a.webp": {"sha256": "9"}}, rebaseline=True, reason="re-cropped", log=log)
    assert set(changes) == {"a.webp", "b.webp"}
    assert json.loads(log.read_text().splitlines()[-1])["reason"] == "re-cropped"

