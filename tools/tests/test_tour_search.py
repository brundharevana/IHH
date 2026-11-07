"""Search adapters (tools/ihh/tour_search.py): URL shapes and parsers on canned responses."""

import urllib.parse

import pytest

from ihh import schema, tour_search


def qs(url):
    return dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(url).query))


def test_urls():
    u = tour_search.build_url("tour-ca", "hedy lamarr", dates="1937-01-01/1937-12-31", count=10)
    assert u.startswith("https://www.loc.gov/collections/chronicling-america/?")
    assert qs(u) == {"q": "hedy lamarr", "dates": "1937-01-01/1937-12-31", "fo": "json", "c": "10"}
    assert tour_search.build_url("tour-loc", "x", collection="photos").startswith("https://www.loc.gov/photos/?")
    assert qs(tour_search.build_url("tour-nara", "x", count=5)) == {"q": "x", "limit": "5"}
    w = tour_search.build_url("tour-wikidata", "Vienna")
    assert w.startswith("https://www.wikidata.org/w/api.php?") and qs(w)["action"] == "wbsearchentities"
    for bad in (dict(family="tour-ca", dates="1937"), dict(family="tour-loc", collection="../x"), dict(family="other")):
        with pytest.raises(ValueError):
            tour_search.build_url(bad.pop("family"), "x", **bad)


def test_parse_loc_and_ca():
    data = {"pagination": {"of": 2}, "results": [
        {"title": "Evening star", "url": "https://www.loc.gov/resource/sn83045462/1937-10-04/ed-1/?sp=5",
         "date": "1937-10-04", "original_format": ["newspaper"], "image_url": ["https://tile.loc.gov/x.jpg"]},
        {"title": "No url", "id": "https://www.loc.gov/item/1/", "date": None}]}
    total, leads = tour_search.parse("tour-ca", data)
    assert total == 2
    assert leads[0] == {"title": "Evening star", "url": "https://www.loc.gov/resource/sn83045462/1937-10-04/ed-1/?sp=5",
                        "date": "1937-10-04", "format": "newspaper", "has_image": True}
    assert leads[1]["url"] == "https://www.loc.gov/item/1/" and leads[1]["format"] is None


def test_parse_nara_and_wikidata():
    nara = {"body": {"hits": {"total": {"value": 1}, "hits": [{"_source": {"record": {
        "naId": 335708097, "title": "Petition", "levelOfDescription": "item", "digitalObjects": [{}, {}]}}}]}}}
    total, leads = tour_search.parse("tour-nara", nara)
    assert total == 1 and leads == [{"title": "Petition", "url": "https://catalog.archives.gov/id/335708097",
                                     "naId": 335708097, "level": "item", "digital_objects": 2}]
    wd = {"search": [{"id": "Q1741", "label": "Vienna", "description": "capital of Austria",
                      "concepturi": "http://www.wikidata.org/entity/Q1741"}]}
    total, leads = tour_search.parse("tour-wikidata", wd)
    assert total == 1 and leads[0]["coord_ref"] == "wikidata:Q1741" and leads[0]["url"] == "https://www.wikidata.org/wiki/Q1741"
    with pytest.raises(tour_search.ShapeError):
        tour_search.parse("tour-loc", {"unexpected": True})


ODD_PAGINATION = [None, "12", ["of", 3], 7, {}, {"total": 3}, {"of": "3"}, {"of": -1}, {"of": True}, {"of": None}]


@pytest.mark.parametrize("family", ["tour-loc", "tour-ca"])
@pytest.mark.parametrize("pagination", ODD_PAGINATION + ["missing"])
def test_any_odd_pagination_is_a_shape_error_not_a_crash(family, pagination):
    # Codex review round 4: a list as pagination raised AttributeError and crashed the search command
    data = {"results": [{"title": "x", "url": "https://www.loc.gov/item/1/"}]}
    if pagination != "missing":
        data["pagination"] = pagination
    with pytest.raises(tour_search.ShapeError, match="pagination"):
        tour_search.parse(family, data)


@pytest.mark.parametrize("family, data", [
    ("tour-ca", {"pagination": {"of": 1}, "results": {"a": 1}}),
    ("tour-ca", []),
    ("tour-nara", {"body": ["x"]}),
    ("tour-nara", {"body": {"hits": ["x"]}}),
    ("tour-nara", {"body": {"hits": {"total": ["x"], "hits": []}}}),
    ("tour-nara", {"body": {"hits": {"total": {"value": 1}, "hits": [["x"]]}}}),
    ("tour-nara", {"body": {"hits": {"total": {"value": 1}, "hits": [{"_source": ["x"]}]}}}),
    ("tour-nara", {"body": {"hits": {"total": {"value": 1}, "hits": [{"_source": {"record": "x"}}]}}}),
    ("tour-wikidata", {"search": "x"}),
])
def test_any_odd_section_is_a_shape_error_not_a_crash(family, data):
    with pytest.raises(tour_search.ShapeError):
        tour_search.parse(family, data)


def test_search_row_passes_the_search_schema():
    row = tour_search.search_row("tour-ca", "hedy lamarr", 17, "tour-2026-11-04", "2026-11-04", "research agent", "URL: x")
    assert row == {"date": "2026-11-04", "family": "tour-ca", "tool": "loc.gov Chronicling America search",
                   "query": "hedy lamarr", "results": 17, "produced": [], "agent": "research agent",
                   "run_id": "tour-2026-11-04", "notes": "URL: x"}
    assert schema.record_problems("search", dict(row, id="TST-Q-0099"), slug="testperson")[0] == []
    assert tour_search.search_row("tour-nara", "x", "many", "r", "2026-11-04", None, "")["results"] is None
