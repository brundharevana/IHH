# tools/tests/test_fetch_coords.py
import pytest
import fetch_coords as fc

def claim(lat, lon, rank="normal"):
    return {"rank": rank, "mainsnak": {"datavalue": {"value": {"latitude": lat, "longitude": lon}}}}

def test_parse_prefers_preferred_and_skips_deprecated():
    doc = {"claims": {"P625": [claim(1, 1, "deprecated"), claim(2, 2), claim(3, 3, "preferred")]}}
    assert fc.parse_p625(doc, "Q1") == (3, 3)
    assert fc.parse_p625({"claims": {"P625": [claim(1, 1, "deprecated"), claim(2, 2)]}}, "Q1") == (2, 2)

def test_parse_without_coordinate_fails():
    for doc in ({"claims": {}}, {"claims": {"P625": [claim(1, 1, "deprecated")]}}, {}):
        with pytest.raises(ValueError):
            fc.parse_p625(doc, "Q1")

def test_qids_come_from_wikidata_entity_urls_only():
    stop = lambda src: {"id": "s", "map": {"coord_source": src}}
    assert fc.qids_of({"stops": [stop("https://www.wikidata.org/wiki/Q3"), stop("https://www.wikidata.org/wiki/Q3"), {"id": "n"}]}) == ["Q3"]
    with pytest.raises(ValueError):
        fc.qids_of({"stops": [stop("https://example.org/Q3")]})

# A building-precise stop may cite an OpenStreetMap node or way (journey flow fix round 1): its
# snapshot entry is keyed "node/<id>" or "way/<id>"; a way's position is the mean of its nodes.
def test_osm_node_and_way_urls_are_accepted_as_keys():
    stop = lambda src: {"id": "s", "map": {"coord_source": src}}
    assert fc.qids_of({"stops": [stop("https://www.openstreetmap.org/way/123"), stop("https://www.openstreetmap.org/node/9"),
                                  stop("https://www.wikidata.org/wiki/Q3")]}) == ["way/123", "node/9", "Q3"]
    for bad in ("https://www.openstreetmap.org/relation/5", "http://www.openstreetmap.org/way/1", "https://openstreetmap.org/way/x"):
        with pytest.raises(ValueError):
            fc.qids_of({"stops": [stop(bad)]})

def test_parse_osm_node_and_way():
    node = {"elements": [{"type": "node", "id": 9, "lat": 40.1, "lon": -74.2}]}
    assert fc.parse_osm(node, "node/9") == (40.1, -74.2)
    way = {"elements": [{"type": "node", "id": 1, "lat": 40.0, "lon": -74.0}, {"type": "node", "id": 2, "lat": 40.2, "lon": -74.4},
                        {"type": "way", "id": 123, "nodes": [1, 2]}]}
    assert fc.parse_osm(way, "way/123") == pytest.approx((40.1, -74.2))
    with pytest.raises(ValueError):
        fc.parse_osm({"elements": []}, "node/9")
    assert fc.api_url("way/123") == "https://api.openstreetmap.org/api/0.6/way/123/full.json"
    assert fc.api_url("node/9") == "https://api.openstreetmap.org/api/0.6/node/9.json"
