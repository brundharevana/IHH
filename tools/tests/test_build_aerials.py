"""Tests for tools/build_aerials.py. No network: every fetch is injected."""
import io, json, math, sys, urllib.error
from pathlib import Path

import pytest
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build_aerials as ba

PRINCETON = (40.3443, -74.6663)  # 112 Mercer Street
BERN = (46.94798, 7.44743)
ULM = (48.398611, 9.991111)


def _png(color=(90, 120, 80), size=1024):
    img = Image.new("RGB", (size, size), color)
    for x in range(size):  # a little structure so WebP is not trivially tiny
        img.putpixel((x, x), (255, 255, 255))
    buf = io.BytesIO(); img.save(buf, "PNG"); return buf.getvalue()

OVERPASS = {"elements": [
    {"type": "way", "tags": {"highway": "residential", "name": "Mercer Street"},
     "geometry": [{"lat": PRINCETON[0], "lon": PRINCETON[1] - 0.0008}, {"lat": PRINCETON[0], "lon": PRINCETON[1] + 0.0008}]},
    {"type": "way", "tags": {"highway": "footway", "name": "Skipped Path"},
     "geometry": [{"lat": PRINCETON[0] - 0.0005, "lon": PRINCETON[1]}, {"lat": PRINCETON[0] + 0.0005, "lon": PRINCETON[1]}]},
]}

class FakeNet:
    """get(url, data=None) -> bytes; records every URL."""
    def __init__(self, overpass=OVERPASS): self.urls, self.overpass = [], overpass
    def __call__(self, url, data=None):
        self.urls.append(url)
        if "overpass" in url: return json.dumps(self.overpass).encode()
        return _png()


# ---- source selection by country -------------------------------------------------
def test_source_is_chosen_by_country():
    assert ba.country_for(*PRINCETON) == "US" and ba.source_for(*PRINCETON) == "naip"
    assert ba.country_for(*BERN) == "CH" and ba.source_for(*BERN) == "swisstopo"
    assert ba.country_for(*ULM) == "DE" and ba.source_for(*ULM) == "lgl-bw"
    assert ba.source_for(32.7140, -117.1750) == "naip"      # San Diego pier
    assert ba.source_for(38.8977, -77.0365) == "naip"        # Washington, D.C.

def test_no_source_outside_the_covered_countries():
    with pytest.raises(ValueError):
        ba.source_for(35.68, 139.69)

# Fix round 1 (spec change): two regional levels (300 km, 60 km) from NASA Blue Marble come first.
def test_level_extents_are_in_metres_and_building_depends_on_source():
    assert ba.level_extents("naip") == [300000, 60000, 10000, 2000, 300, 150]
    assert ba.level_extents("swisstopo") == [300000, 60000, 10000, 2000, 300, 100]
    assert ba.level_extents("lgl-bw") == [300000, 60000, 10000, 2000, 300, 100]

def test_regional_levels_come_from_nasa_blue_marble_via_gibs():
    u = ba.imagery_url("nasa-bmng", *ULM, 300000)
    assert u.startswith("https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?")
    assert "LAYERS=BlueMarble_NextGeneration" in u and "CRS=EPSG:3857" in u and "WIDTH=1024" in u
    assert ba.level_sources("naip") == ["nasa-bmng", "nasa-bmng", "naip", "naip", "naip", "naip"]
    c = ba.credit("nasa-bmng", 2026)
    assert "NASA" in c["text"] and "Blue Marble" in c["text"] and c["url"].startswith("https://")


# ---- request URLs ---------------------------------------------------------------
def test_bbox_is_true_scale_in_web_mercator():
    x0, y0, x1, y1 = ba.bbox_3857(*PRINCETON, 300)
    k = 1 / math.cos(math.radians(PRINCETON[0]))
    assert x1 - x0 == pytest.approx(300 * k) and y1 - y0 == pytest.approx(300 * k)

def test_each_source_builds_its_own_request():
    naip = ba.imagery_url("naip", *PRINCETON, 300)
    assert naip.startswith("https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage?")
    assert "size=1024,1024" in naip and "bboxSR=3857" in naip and "f=image" in naip
    swiss = ba.imagery_url("swisstopo", *BERN, 100)
    assert swiss.startswith("https://wms.geo.admin.ch/?") and "LAYERS=ch.swisstopo.swissimage" in swiss
    assert "CRS=EPSG:3857" in swiss and "WIDTH=1024" in swiss and "HEIGHT=1024" in swiss
    bw = ba.imagery_url("lgl-bw", *ULM, 100)
    assert bw.startswith("https://owsproxy.lgl-bw.de/owsproxy/ows/WMS_LGL-BW_ATKIS_DOP_20_C?") and "LAYERS=IMAGES_DOP_20_RGB" in bw


# ---- retry ------------------------------------------------------------------------
def _http_error(code): return urllib.error.HTTPError("http://x", code, "err", {}, None)

class FakeOpener:
    def __init__(self, outcomes): self.outcomes, self.calls = list(outcomes), 0
    def __call__(self, req, timeout=None):
        self.calls += 1
        o = self.outcomes.pop(0)
        if isinstance(o, Exception): raise o
        return io.BytesIO(o)

def test_retries_on_502_and_504_then_succeeds():
    op, sleeps = FakeOpener([_http_error(502), _http_error(504), b"ok"]), []
    assert ba.http_get("http://x", opener=op, sleep=sleeps.append) == b"ok"
    assert op.calls == 3 and len(sleeps) == 2

def test_gives_up_after_three_retries():
    op = FakeOpener([_http_error(502)] * 4 + [b"never"])
    with pytest.raises(urllib.error.HTTPError):
        ba.http_get("http://x", opener=op, sleep=lambda s: None)
    assert op.calls == 4

def test_does_not_retry_a_client_error():
    op = FakeOpener([_http_error(404), b"never"])
    with pytest.raises(urllib.error.HTTPError):
        ba.http_get("http://x", opener=op, sleep=lambda s: None)
    assert op.calls == 1

def test_retries_a_dropped_connection():
    op = FakeOpener([urllib.error.URLError("reset"), TimeoutError("slow"), b"ok"])
    assert ba.http_get("http://x", opener=op, sleep=lambda s: None) == b"ok"

def test_overpass_runtime_error_with_200_is_retried():
    bad = json.dumps({"elements": [], "remark": "runtime error: Query timed out"}).encode()
    good = json.dumps(OVERPASS).encode()
    net = [bad, good]
    ways = ba.fetch_streets(*PRINCETON, 300, get=lambda url, data=None: net.pop(0), sleep=lambda s: None)
    assert [w["tags"]["name"] for w in ways] == ["Mercer Street", "Skipped Path"]

def test_a_non_image_answer_is_an_error_not_a_blank_level():
    with pytest.raises(ValueError):
        ba.fetch_image("http://x", get=lambda url, data=None: b'{"error":"no data"}')


# ---- labels -----------------------------------------------------------------------
def test_labels_are_a_transparent_layer_with_text_on_named_roads_only():
    ways = ba.fetch_streets(*PRINCETON, 300, get=FakeNet(), sleep=lambda s: None)
    img = ba.render_labels(ways, *PRINCETON, 300, font_size=34)
    assert img.size == (1024, 1024) and img.mode == "RGBA"
    assert img.getchannel("A").getbbox() is not None
    assert ba.render_labels([], *PRINCETON, 300, font_size=34).getchannel("A").getbbox() is None

def test_streets_query_covers_the_whole_labelled_extent():
    q = ba.overpass_query(*PRINCETON, 300)
    s, w, n, e = [float(v) for v in q.split("(")[1].split(")")[0].split(",")]
    assert s < PRINCETON[0] < n and w < PRINCETON[1] < e
    metres_ns = (n - s) * 111_320
    assert metres_ns >= 300  # at least the full level-2 extent, not a small box around the centre
    assert '["highway"]["name"]' in q and "out geom" in q


# ---- credits ----------------------------------------------------------------------
def test_credit_text_is_the_text_each_licence_requires():
    c = {x["source"]: x for x in (ba.credit(s, 2026) for s in ("naip", "swisstopo", "lgl-bw", "osm"))}
    assert c["naip"]["text"] == "U.S. Geological Survey / Department of the Interior/USGS"
    assert c["naip"]["licence"] == "U.S. Public Domain"
    assert c["swisstopo"]["text"] == "(c)swisstopo"
    assert c["lgl-bw"]["text"] == "LGL-BW (2026) Datenlizenz Deutschland - Namensnennung - Version 2.0, www.lgl-bw.de"
    assert c["osm"]["text"] == "(c) OpenStreetMap contributors" and c["osm"]["licence"] == "ODbL 1.0"
    for x in c.values():
        assert set(x) == {"source", "text", "url", "licence"} and all(isinstance(v, str) and v for v in x.values())


# ---- the stack and its manifest ---------------------------------------------------
def _build(tmp_path, stop="mercer-street", centre=PRINCETON, **kw):
    return ba.build_stop("einstein", stop, centre, "https://www.wikidata.org/wiki/Q43282043", tmp_path,
                         get=FakeNet(), sleep=lambda s: None, now="2026-10-10T08:00:00Z", **kw)

def test_manifest_schema(tmp_path):
    _build(tmp_path)
    d = tmp_path / "einstein" / "mercer-street"
    m = json.loads((d / "manifest.json").read_text())
    assert m["centre"] == {"lat": PRINCETON[0], "lon": PRINCETON[1]}
    assert [lv["extent_m"] for lv in m["levels"]] == [300000, 60000, 10000, 2000, 300, 150]
    assert [lv["file"] for lv in m["levels"]] == [f"{i}.webp" for i in range(6)]
    assert [lv.get("labels") for lv in m["levels"]] == [None, None, None, None, "labels-4.webp", "labels-5.webp"]
    assert m["precision"] == "city"
    for lv in m["levels"]:
        assert (d / lv["file"]).is_file() and Image.open(d / lv["file"]).size == (1024, 1024)
        if "labels" in lv: assert Image.open(d / lv["labels"]).mode == "RGBA"
    assert [c["source"] for c in m["credits"]] == ["nasa-bmng", "naip", "osm"]
    assert m["fetched_at"] == "2026-10-10T08:00:00Z"
    assert len(m["source_urls"]) == 7 and all(u.startswith("https://") for u in m["source_urls"])
    assert "gibs.earthdata.nasa.gov" in m["source_urls"][0] and "nationalmap.gov" in m["source_urls"][2]
    assert sum(p.stat().st_size for p in d.glob("*.webp")) <= ba.MAX_STACK_BYTES

def test_precision_is_written_as_given(tmp_path):
    m = _build(tmp_path, precision="building")
    assert m["precision"] == "building"

def test_swiss_and_german_stacks_use_their_source_and_credit(tmp_path):
    ba.build_stop("einstein", "berne", BERN, "https://www.wikidata.org/wiki/Q70", tmp_path,
                  get=FakeNet(), sleep=lambda s: None, now="2026-10-10T08:00:00Z")
    m = json.loads((tmp_path / "einstein" / "berne" / "manifest.json").read_text())
    assert [c["source"] for c in m["credits"]] == ["nasa-bmng", "swisstopo", "osm"] and m["levels"][5]["extent_m"] == 100

def test_stops_in_one_place_share_one_stack(tmp_path):
    _build(tmp_path, stop="princeton-1933")
    ba.write_shared_manifest("einstein", "princeton-1955", "princeton-1933", tmp_path,
                             "https://www.wikidata.org/wiki/Q43282043")
    d = tmp_path / "einstein" / "princeton-1955"
    assert [p.name for p in d.iterdir()] == ["manifest.json"]
    m = json.loads((d / "manifest.json").read_text())
    assert m["stack"] == "princeton-1933" and m["levels"][0]["file"] == "../princeton-1933/0.webp"
    assert m["levels"][5]["labels"] == "../princeton-1933/labels-5.webp"
    assert m["precision"] == "city"
    assert m["centre"] == json.loads((tmp_path / "einstein" / "princeton-1933" / "manifest.json").read_text())["centre"]

def test_an_over_budget_stack_is_refused_not_shipped(tmp_path, monkeypatch):
    import os
    noise = Image.frombytes("RGB", (1024, 1024), os.urandom(1024 * 1024 * 3))
    monkeypatch.setattr(ba, "fetch_image", lambda url, **kw: noise)
    with pytest.raises(ValueError, match="budget"):
        _build(tmp_path)
    assert not (tmp_path / "einstein" / "mercer-street" / "manifest.json").exists()


# ---- no-data areas (the BW service is blank beyond the state border, at the Danube) ---
def test_blank_no_data_area_is_filled_but_small_white_features_stay():
    img = Image.new("RGB", (1024, 1024), (90, 120, 80))
    img.paste((255, 255, 255), (600, 0, 1024, 1024))      # blank half
    img.paste((255, 255, 255), (100, 100, 108, 108))      # a white roof
    out = ba.fill_no_data(img)
    assert out.getpixel((800, 500)) == ba.NO_DATA_FILL
    assert out.getpixel((104, 104)) == (255, 255, 255)
    assert out.getpixel((300, 500)) == (90, 120, 80)

def test_only_the_state_service_gets_the_no_data_fill(tmp_path, monkeypatch):
    blank = Image.new("RGB", (1024, 1024), (255, 255, 255))
    monkeypatch.setattr(ba, "fetch_image", lambda url, **kw: blank.copy())
    ba.build_stop("einstein", "ulm", ULM, "https://www.wikidata.org/wiki/Q3012", tmp_path,
                  get=FakeNet(), sleep=lambda s: None, now="2026-10-10T08:00:00Z")
    assert Image.open(tmp_path / "einstein" / "ulm" / "2.webp").convert("RGB").getpixel((500, 500))[0] < 100
    assert Image.open(tmp_path / "einstein" / "ulm" / "0.webp").convert("RGB").getpixel((500, 500))[0] > 240  # NASA level untouched
    ba.build_stop("einstein", "mercer-street", PRINCETON, "x", tmp_path,
                  get=FakeNet(), sleep=lambda s: None, now="2026-10-10T08:00:00Z")
    assert Image.open(tmp_path / "einstein" / "mercer-street" / "0.webp").convert("RGB").getpixel((500, 500))[0] > 240


# Precision comes from the stop's verified place and its coordinate source (content_check.aerial_precision).
def test_mapped_stops_carry_their_precision(tmp_path):
    content = tmp_path / "content" / "tst"; content.mkdir(parents=True)
    (content / "journey.json").write_text(json.dumps({"stops": [
        {"id": "house", "fact_ids": ["F1"], "map": {"coord_source": "https://www.openstreetmap.org/way/5"}},
        {"id": "town", "fact_ids": ["F2"], "map": {"coord_source": "https://www.wikidata.org/wiki/Q1"}},
        {"id": "unmapped", "fact_ids": ["F2"]}]}))
    (content / "coords.snapshot.json").write_text(json.dumps({"entities": {
        "way/5": {"osm": "way/5", "lat": 40.0, "lon": -74.0}, "Q1": {"qid": "Q1", "lat": 41.0, "lon": -75.0}}}))
    facts = {"F1": {"id": "F1", "status": "verified", "place": "112 Mercer Street, Princeton"},
             "F2": {"id": "F2", "status": "verified", "place": "Princeton, N.J."}}
    assert ba.mapped_stops(content, facts) == [("house", (40.0, -74.0), "https://www.openstreetmap.org/way/5", "building"),
                                               ("town", (41.0, -75.0), "https://www.wikidata.org/wiki/Q1", "city")]
    facts["F1"]["status"] = "single-source"
    assert ba.mapped_stops(content, facts)[0][3] == "city"

# The 60 km Blue Marble level is upsampled about 9x from 500 m pixels and arrives blocky; it is
# resampled smoothly from its native resolution so no blocks show under the aerial images.
def test_regional_levels_are_resampled_smoothly_from_their_native_resolution():
    blocks = Image.new("RGB", (1024, 1024))
    for y in range(0, 1024, 8):
        for x in range(0, 1024, 8):
            blocks.paste((40 + (x * 7 + y * 3) % 120, 90, 60), (x, y, x + 8, y + 8))
    out = ba.soften(blocks, "nasa-bmng", 60000)
    jumps = max(abs(out.getpixel((x, 500))[0] - out.getpixel((x + 1, 500))[0]) for x in range(0, 1023))
    assert jumps < 20 and out.size == (1024, 1024)
    assert ba.soften(blocks, "naip", 2000) is blocks  # aerial levels untouched
