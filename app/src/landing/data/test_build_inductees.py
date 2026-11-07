import json

import pytest
from build_inductees import display_credit, link_only_ids, points_for, thumb_source

CH = {"id": "arriving", "kind": "arriving", "title": "Arriving", "year": 1933, "factIds": [], "thumbMediaId": "NAI-M-0004"}


def test_link_only_thumb_dropped():
    pts = points_for([CH], media={"NAI-M-0004": {"embeddable": False}}, link_only={"NAI-M-0004"})
    assert pts[0]["thumb"] is None


def test_link_only_dropped_even_if_embeddable():
    pts = points_for([CH], media={"NAI-M-0004": {"embeddable": True}}, link_only={"NAI-M-0004"})
    assert pts[0]["thumb"] is None


def test_non_embeddable_or_unknown_thumb_dropped():
    assert points_for([CH], media={"NAI-M-0004": {"embeddable": False}}, link_only=set())[0]["thumb"] is None
    assert points_for([CH], media={}, link_only=set())[0]["thumb"] is None


def test_embeddable_thumb_kept_and_point_shape():
    p = points_for([CH], media={"NAI-M-0004": {"embeddable": True}}, link_only=set())[0]
    assert p == {"id": "arriving", "kind": "arriving", "label": "Arriving", "year": 1933, "factIds": [], "thumb": "NAI-M-0004"}


def test_only_the_inductees_chapters_make_points_in_order():
    chs = [dict(CH, id="a", kind="birth", thumbMediaId=None), dict(CH, id="b", kind="legacy", thumbMediaId=None)]
    assert [p["id"] for p in points_for(chs, media={}, link_only=set())] == ["a", "b"]
    assert points_for([], media={}, link_only=set()) == []


def test_unknown_chapter_kind_makes_no_point():
    assert points_for([dict(CH, kind="made-up")], media={}, link_only=set()) == []


def test_at_most_ten_points():
    kinds = ["birth", "education", "leaving", "arriving", "first-work", "citizen", "big-work", "history", "honoured", "legacy"]
    chs = [dict(CH, id=k, kind=k, thumbMediaId=None) for k in kinds] * 2
    assert len(points_for(chs, media={}, link_only=set())) == 10


def test_basis_photo_never_a_thumb():
    m = {"NAI-M-0004": {"embeddable": True, "record_kind": "basis-photo"}}
    assert points_for([CH], media=m, link_only=set())[0]["thumb"] is None
    m = {"NAI-M-0004": {"embeddable": True, "record_kind": "item"}}
    assert points_for([CH], media=m, link_only=set())[0]["thumb"] == "NAI-M-0004"


def test_link_only_ids_fail_closed(tmp_path):
    with pytest.raises(SystemExit):
        link_only_ids(tmp_path / "missing.json")
    empty = tmp_path / "e.json"
    empty.write_text("[]")
    with pytest.raises(SystemExit):
        link_only_ids(empty)
    ok = tmp_path / "ok.json"
    ok.write_text(json.dumps(["NAI-M-0004"]))
    assert link_only_ids(ok) == {"NAI-M-0004"}


def test_thumb_source_is_the_first_page_on_file(tmp_path):
    # a case file fetched from page 5 on (no page 1) is shown by its lowest page, not by page 34
    for n in (34, 5, 7):
        (tmp_path / f"LAM-M-0001-p{n}.jpg").write_bytes(b"x")
    assert thumb_source("LAM-M-0001", tmp_path).name == "LAM-M-0001-p5.jpg"
    (tmp_path / "LAM-M-0013.jpg").write_bytes(b"x")
    assert thumb_source("LAM-M-0013", tmp_path).name == "LAM-M-0013.jpg"
    assert thumb_source("LAM-M-0022", tmp_path) is None


def test_thumb_source_skips_a_book_s_flyleaves(tmp_path):
    # the 1894 book's pages 1-2 are blank flyleaves (a shelf mark); its thumbnail is the printed cover
    for n in (1, 2, 3, 4):
        (tmp_path / f"NAI-M-0003-p{n}.jpg").write_bytes(b"x")
    assert thumb_source("NAI-M-0003", tmp_path).name == "NAI-M-0003-p3.jpg"


def test_display_credit_drops_a_name_heading_s_life_dates():
    assert display_credit("Wisconsin Historical Society, Muir, John, 1838-1914, John Muir's Clock Design, W0133MG") == "Wisconsin Historical Society, John Muir's Clock Design, W0133MG"
    # credits without such a heading are unchanged
    assert display_credit("Library of Congress, Prints & Photographs Division, LC-DIG-ppmsca-36413") == "Library of Congress, Prints & Photographs Division, LC-DIG-ppmsca-36413"
