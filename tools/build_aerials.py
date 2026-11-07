"""Build the present-day aerial zoom stacks for the journey globe (build time only; the only network step).

    python3 tools/build_aerials.py <slug> [--content content] [--out site/public/aerial] [--only STOP[,STOP]]

Reads content/<slug>/journey.json and content/<slug>/coords.snapshot.json. For every stop with a
"map" it takes the published coordinates of the place the stop cites (the snapshot entry for its
coord_source, the same ones tools/content_check.py compares), picks the imagery source by country
and writes, under <out>/<slug>/<stop>/ :

    0.webp ... 5.webp               1024 px images, widest to closest, north up, centred on the place
    labels-4.webp labels-5.webp     transparent street-name overlays for the two closest levels
    manifest.json

Stops whose published coordinates are identical share one stack: the first stop in journey order
owns the files, the others get only a manifest whose paths point at the owner ("../<owner>/0.webp").

Levels (ground width of the square image): 300 km and 60 km (the region, from NASA Blue Marble Next
Generation through NASA GIBS, the same dataset as the globe), 10 km, 2 km, 300 m, then 150 m (US, NAIP
is 0.6 m and soft) or 100 m (Switzerland, Baden-Wuerttemberg). Aerial imagery: USGS NAIP (US), swisstopo
SWISSIMAGE (Bern), LGL-BW DOP20 (Baden-Wuerttemberg, Ulm). Street names: OpenStreetMap through the
Overpass API, one query per stop over the full extent of the widest labelled level (300 m, with a
margin), rendered here with Pillow into transparent WebP. No OSM tiles, OpenFreeMap or EOX Sentinel-2
are used. Sources, licences and the credit wording: docs/research/direction/B7-aerial-zoom.md; NASA
EOSDIS data are CC0 unless marked (https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance).

Precision (journey flow fix round 1): "building" when a verified fact the stop cites has a place naming
a street address and the stop cites an OpenStreetMap node or way (content_check.aerial_precision);
otherwise "city", and the site's zoom ends at the 2 km level with "Approximate location". All six levels
are built either way; the site loads only the levels it shows.

manifest.json schema (version 1); paths are relative to the manifest's folder:

    {
      "version": 1,
      "slug": "einstein", "stop": "mercer-street",
      "stack": "princeton-1933",                      only on a stop that shares another stop's stack
      "country": "US",
      "precision": "city",                            "building" | "city", see above
      "centre": {"lat": 40.3443, "lon": -74.6663},    equal to the snapshot coordinates of the stop's place
      "coord_source": "https://www.wikidata.org/wiki/Q43282043",
      "levels": [                                     always 6, widest first
        {"extent_m": 300000, "file": "0.webp"},
        {"extent_m": 60000,  "file": "1.webp"},
        {"extent_m": 10000,  "file": "2.webp"},
        {"extent_m": 2000,   "file": "3.webp"},
        {"extent_m": 300,    "file": "4.webp", "labels": "labels-4.webp"},
        {"extent_m": 150,    "file": "5.webp", "labels": "labels-5.webp"}
      ],
      "credits": [{"source": "nasa-bmng", ...}, {"source": "naip", "text": "...", "url": "...", "licence": "..."}, {"source": "osm", ...}],
      "fetched_at": "2026-10-10T08:00:00Z",
      "source_urls": ["<every imagery request URL>", "<overpass query URL>"]
    }

A stack above 1.5 MB (MAX_STACK_BYTES) is refused. Every request retries three times on HTTP
429/502/503/504 or a dropped connection, with a pause between requests. Images are present-day
and make no claim about how a place looked in the inductee's time. Exit 1 on any failure.
"""
import argparse, io, json, math, re, sys, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
from content_check import aerial_precision  # noqa: E402  (tools/ is not a package; same folder)

UA = "IHH-verified-facts/1.0 (research; contact via project)"
SIZE = 1024
RETRIES = 3
RETRY_STATUS = {429, 502, 503, 504}
PAUSE_S = 1.5
MAX_STACK_BYTES = 1_500_000
REGIONAL = [300000, 60000]   # NASA Blue Marble levels
EXTENTS = [10000, 2000, 300]
LABELLED = (4, 5)
R_EARTH = 6378137.0
OVERPASS_ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]
SKIP_HIGHWAYS = {"footway", "path", "steps", "service", "cycleway", "track", "pedestrian", "bridleway", "corridor"}

# Coarse country boxes (south, west, north, east); first match wins, Switzerland before Baden-Wuerttemberg.
COUNTRY_BOXES = [("CH", (45.8, 5.95, 47.6, 10.5)), ("DE", (47.5, 7.5, 49.8, 10.5)), ("US", (24.0, -125.0, 50.0, -66.0))]
SOURCE_OF_COUNTRY = {"US": "naip", "CH": "swisstopo", "DE": "lgl-bw"}
BUILDING_EXTENT = {"naip": 150, "swisstopo": 100, "lgl-bw": 100}

CREDITS = {
    "nasa-bmng": ("NASA Earth Observatory, Blue Marble Next Generation (via NASA GIBS)",
                  "https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance", "CC0 (NASA)"),
    "naip": ("U.S. Geological Survey / Department of the Interior/USGS",
             "https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits", "U.S. Public Domain"),
    "swisstopo": ("(c)swisstopo", "https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices",
                  "swisstopo OGD terms of use (free geodata)"),
    # LGL-BW's own GetCapabilities: "das Jahr des Datenbezugs in Klammern anzugeben" -> the year the data was obtained.
    "lgl-bw": ("LGL-BW ({year}) Datenlizenz Deutschland - Namensnennung - Version 2.0, www.lgl-bw.de",
               "https://www.govdata.de/dl-de/by-2-0", "dl-de/by-2-0"),
    "osm": ("(c) OpenStreetMap contributors", "https://www.openstreetmap.org/copyright", "ODbL 1.0"),
}


# ---- source selection and request URLs ------------------------------------------------
def country_for(lat, lon):
    for code, (s, w, n, e) in COUNTRY_BOXES:
        if s <= lat <= n and w <= lon <= e:
            return code
    raise ValueError(f"no open aerial source configured for ({lat}, {lon})")

def source_for(lat, lon):
    return SOURCE_OF_COUNTRY[country_for(lat, lon)]

def level_extents(source):
    return REGIONAL + EXTENTS + [BUILDING_EXTENT[source]]

def level_sources(source):
    return ["nasa-bmng"] * len(REGIONAL) + [source] * (len(EXTENTS) + 1)

def mercator(lat, lon):
    return R_EARTH * math.radians(lon), R_EARTH * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))

def bbox_3857(lat, lon, extent_m):
    """Square around the point whose ground width is extent_m (web-mercator units stretch by 1/cos(lat))."""
    x, y = mercator(lat, lon)
    h = extent_m / math.cos(math.radians(lat)) / 2
    return x - h, y - h, x + h, y + h

def imagery_url(source, lat, lon, extent_m):
    bbox = ",".join(f"{v:.3f}" for v in bbox_3857(lat, lon, extent_m))
    if source == "nasa-bmng":
        return ("https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0"
                f"&LAYERS=BlueMarble_NextGeneration&STYLES=&CRS=EPSG:3857&BBOX={bbox}&WIDTH={SIZE}&HEIGHT={SIZE}&FORMAT=image/jpeg")
    if source == "naip":
        return ("https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage"
                f"?bbox={bbox}&bboxSR=3857&imageSR=3857&size={SIZE},{SIZE}&format=jpgpng&f=image")
    wms = ("SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS={layer}&STYLES=&CRS=EPSG:3857"
           f"&BBOX={bbox}&WIDTH={SIZE}&HEIGHT={SIZE}&FORMAT=image/jpeg")
    if source == "swisstopo":
        return "https://wms.geo.admin.ch/?" + wms.format(layer="ch.swisstopo.swissimage")
    if source == "lgl-bw":
        return "https://owsproxy.lgl-bw.de/owsproxy/ows/WMS_LGL-BW_ATKIS_DOP_20_C?" + wms.format(layer="IMAGES_DOP_20_RGB")
    raise ValueError(f"unknown source {source!r}")

def credit(source, year):
    text, url, licence = CREDITS[source]
    return {"source": source, "text": text.format(year=year), "url": url, "licence": licence}


# ---- network ---------------------------------------------------------------------------
class Retryable(Exception):
    pass

def http_get(url, data=None, *, opener=urllib.request.urlopen, sleep=time.sleep, retries=RETRIES, timeout=90):
    """GET (POST when data is bytes). Retries `retries` times on 429/502/503/504 and dropped connections."""
    last = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, data=data, headers={"User-Agent": UA})
            with opener(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code not in RETRY_STATUS: raise
            last = e
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            last = e
        if attempt < retries: sleep(2 ** attempt * 2)
    raise last

NO_DATA_FILL = (58, 64, 62)

def fill_no_data(img):
    """Replace large pure-white areas (the LGL-BW service returns blank white beyond Baden-Wuerttemberg, here
    across the Danube) with a flat neutral tone; white roofs and cars are too small to match."""
    mask = img.convert("L").point(lambda v: 255 if v >= 250 else 0)
    big = mask.filter(ImageFilter.MinFilter(15)).filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.MaxFilter(15))
    out = img.copy(); out.paste(NO_DATA_FILL, mask=big)
    return out

NATIVE_M = {"nasa-bmng": 500}  # metres per pixel of the source, where it is coarser than the levels need

def soften(img, source, extent_m):
    """A level whose source is coarser than SIZE px over its extent (Blue Marble at 60 km: about 9x)
    comes back from the WMS as visible blocks; resample it from its native resolution instead."""
    native = NATIVE_M.get(source)
    if not native: return img
    n = max(32, round(extent_m / native))
    if n >= SIZE: return img
    return img.resize((n, n), Image.LANCZOS).resize((SIZE, SIZE), Image.BICUBIC)

def fetch_image(url, *, get=http_get):
    raw = get(url)
    try:
        img = Image.open(io.BytesIO(raw)); img.load()
    except Exception as e:
        raise ValueError(f"not an image from {url[:90]}...: {raw[:120]!r}") from e
    if img.size != (SIZE, SIZE):
        raise ValueError(f"expected {SIZE} px image, got {img.size} from {url[:90]}...")
    return img.convert("RGB")

def _inverse_mercator(x, y):
    return math.degrees(2 * math.atan(math.exp(y / R_EARTH)) - math.pi / 2), math.degrees(x / R_EARTH)

def overpass_query(lat, lon, extent_m, margin=1.25):
    """Named highways whose geometry meets the whole labelled extent (plus a margin for roads crossing its edge)."""
    x0, y0, x1, y1 = bbox_3857(lat, lon, extent_m * margin)
    (s, w), (n, e) = _inverse_mercator(x0, y0), _inverse_mercator(x1, y1)
    return f'[out:json][timeout:60];way["highway"]["name"]({s:.6f},{w:.6f},{n:.6f},{e:.6f});out geom;'

def fetch_streets(lat, lon, extent_m, *, get=http_get, sleep=time.sleep):
    q = overpass_query(lat, lon, extent_m)
    last = None
    for attempt in range(RETRIES + 1):
        ep = OVERPASS_ENDPOINTS[attempt % len(OVERPASS_ENDPOINTS)]
        try:
            doc = json.loads(get(ep, urllib.parse.urlencode({"data": q}).encode()).decode("utf-8"))
            if "runtime error" in str(doc.get("remark", "")): raise Retryable(doc["remark"])
            return [e for e in doc.get("elements", []) if e.get("type") == "way" and e.get("geometry")]
        except (Retryable, ValueError, urllib.error.URLError, TimeoutError) as e:
            last = e
            if attempt < RETRIES: sleep(2 ** attempt * 2)
    raise last

def overpass_url(lat, lon, extent_m):
    return OVERPASS_ENDPOINTS[0] + "?" + urllib.parse.urlencode({"data": overpass_query(lat, lon, extent_m)})


# ---- labels ----------------------------------------------------------------------------
FONT_FILES = ["/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/Library/Fonts/Arial Bold.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"]

def _font(size):
    for f in FONT_FILES:
        try: return ImageFont.truetype(f, size)
        except OSError: continue
    return ImageFont.load_default(size)

def render_labels(ways, lat, lon, extent_m, font_size):
    """Transparent SIZE x SIZE overlay: each street name once, rotated along its longest in-view segment."""
    cx, cy = mercator(lat, lon)
    h = extent_m / math.cos(math.radians(lat)) / 2
    sc = SIZE / (2 * h)
    out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    dr, font = ImageDraw.Draw(out), _font(font_size)
    placed, boxes, margin = set(), [], 60
    for w in sorted(ways, key=lambda w: w["tags"].get("name", "")):
        tags = w.get("tags", {}); name = tags.get("name")
        if not name or name in placed or tags.get("highway") in SKIP_HIGHWAYS: continue
        pts = []
        for g in w["geometry"]:
            x, y = mercator(g["lat"], g["lon"]); pts.append(((x - cx + h) * sc, (cy + h - y) * sc))
        best, best_len = None, 0
        for a, b in zip(pts, pts[1:]):
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            if not (margin < mx < SIZE - margin and margin < my < SIZE - margin): continue
            ln = math.hypot(b[0] - a[0], b[1] - a[1])
            if ln > best_len: best_len, best = ln, (a, b, mx, my)
        tw = dr.textlength(name, font=font)
        if not best or best_len < tw * 0.5: continue
        a, b, mx, my = best
        ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
        if ang > 90: ang -= 180
        if ang < -90: ang += 180
        tile = Image.new("RGBA", (int(tw) + 20, font_size + 20), (0, 0, 0, 0))
        ImageDraw.Draw(tile).text((10, 8), name, font=font, fill=(255, 255, 255, 255), stroke_width=4, stroke_fill=(0, 0, 0, 200))
        tile = tile.rotate(-ang, expand=True, resample=Image.BICUBIC)
        box = (int(mx - tile.width / 2), int(my - tile.height / 2))
        rect = (*box, box[0] + tile.width, box[1] + tile.height)
        if any(rect[0] < o[2] and o[0] < rect[2] and rect[1] < o[3] and o[1] < rect[3] for o in boxes): continue
        out.alpha_composite(tile, box)
        boxes.append(rect); placed.add(name)
    return out


# ---- stack ----------------------------------------------------------------------------
def _webp(img, **kw):
    buf = io.BytesIO(); img.save(buf, "WEBP", method=6, **kw); return buf.getvalue()

def encode_stack(images, labels):
    """WebP bytes for the aerial images (quality stepped down until the stack fits) and the labels."""
    lab = {i: _webp(img, quality=80) for i, img in labels.items()}
    for q in (75, 68, 60, 52, 45):
        aer = [_webp(img, quality=q) for img in images]
        if sum(map(len, aer)) + sum(map(len, lab.values())) <= MAX_STACK_BYTES:
            return aer, lab
    raise ValueError(f"aerial stack exceeds the {MAX_STACK_BYTES} byte budget even at quality 45")

def _manifest(slug, stop, centre, coord_source, country, levels, credits, fetched_at, source_urls, stack=None, precision="city"):
    m = {"version": 1, "slug": slug, "stop": stop}
    if stack: m["stack"] = stack
    m.update({"country": country, "precision": precision, "centre": {"lat": centre[0], "lon": centre[1]}, "coord_source": coord_source,
              "levels": levels, "credits": credits, "fetched_at": fetched_at, "source_urls": source_urls})
    return m

def _levels(extents, prefix=""):
    return [dict({"extent_m": e, "file": f"{prefix}{i}.webp"}, **({"labels": f"{prefix}labels-{i}.webp"} if i in LABELLED else {}))
            for i, e in enumerate(extents)]

def build_stop(slug, stop, centre, coord_source, out_root, *, get=http_get, sleep=time.sleep, now=None, precision="city"):
    """Fetch, label and write one stop's stack and manifest under out_root/slug/stop/."""
    lat, lon = centre
    now = now or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    source, country = source_for(lat, lon), country_for(lat, lon)
    extents, sources = level_extents(source), level_sources(source)
    urls = [imagery_url(src, lat, lon, e) for src, e in zip(sources, extents)]
    images = []
    for src, u, e in zip(sources, urls, extents):
        img = soften(fetch_image(u, get=get), src, e); sleep(PAUSE_S)
        images.append(fill_no_data(img) if src == "lgl-bw" else img)
    a, b = LABELLED
    ways = fetch_streets(lat, lon, extents[a], get=get, sleep=sleep)
    labels = {a: render_labels(ways, lat, lon, extents[a], font_size=34), b: render_labels(ways, lat, lon, extents[b], font_size=40)}
    aer, lab = encode_stack(images, labels)
    d = Path(out_root) / slug / stop
    d.mkdir(parents=True, exist_ok=True)
    for i, b in enumerate(aer): (d / f"{i}.webp").write_bytes(b)
    for i, b in lab.items(): (d / f"labels-{i}.webp").write_bytes(b)
    m = _manifest(slug, stop, centre, coord_source, country, _levels(extents),
                  [credit("nasa-bmng", now[:4]), credit(source, now[:4]), credit("osm", now[:4])],
                  now, urls + [overpass_url(lat, lon, extents[LABELLED[0]])], precision=precision)
    (d / "manifest.json").write_text(json.dumps(m, indent=2) + "\n")
    return m

def write_shared_manifest(slug, stop, owner, out_root, coord_source, precision="city"):
    """Manifest for a stop in the same place as `owner`: same data, paths into the owner's folder."""
    om = json.loads((Path(out_root) / slug / owner / "manifest.json").read_text())
    levels = [{k: (f"../{owner}/{v}" if k in ("file", "labels") else v) for k, v in lv.items()} for lv in om["levels"]]
    m = _manifest(slug, stop, (om["centre"]["lat"], om["centre"]["lon"]), coord_source, om["country"], levels,
                  om["credits"], om["fetched_at"], om["source_urls"], stack=owner, precision=precision)
    d = Path(out_root) / slug / stop; d.mkdir(parents=True, exist_ok=True)
    (d / "manifest.json").write_text(json.dumps(m, indent=2) + "\n")
    return m


# ---- command line ----------------------------------------------------------------------
ENTITY = re.compile(r"^https://www\.wikidata\.org/wiki/(Q\d+)$|^https://www\.openstreetmap\.org/((?:node|way)/\d+)$")

def load_facts(data_dir):
    p = Path(data_dir) / "facts.jsonl"
    return {f["id"]: f for f in (json.loads(l) for l in p.read_text().splitlines() if l.strip())} if p.exists() else {}

def mapped_stops(content_dir, facts):
    """[(stop id, (lat, lon), coord_source, precision)] for every mapped stop, from the coordinate snapshot."""
    journey = json.loads((content_dir / "journey.json").read_text())
    ents = json.loads((content_dir / "coords.snapshot.json").read_text())["entities"]
    verified = lambda fid: facts.get(fid) if (facts.get(fid) or {}).get("status") == "verified" else None
    out = []
    for s in journey["stops"]:
        if not isinstance(s.get("map"), dict): continue
        src = s["map"]["coord_source"]; hit = ENTITY.match(src)
        key = hit and (hit.group(1) or hit.group(2))
        if not key or key not in ents: raise ValueError(f"stop {s['id']}: no snapshot entry for {src}")
        e = ents[key]; out.append((s["id"], (e["lat"], e["lon"]), src, aerial_precision(s, verified, ents)))
    return out

def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument("slug")
    ap.add_argument("--content", default="content"); ap.add_argument("--out", default="site/public/aerial")
    ap.add_argument("--data", default="data/inductees", help="folder with <slug>/facts.jsonl")
    ap.add_argument("--only", help="comma-separated stop ids")
    a = ap.parse_args(argv)
    only = set(a.only.split(",")) if a.only else None
    owners = {}
    try:
        for stop, centre, src, precision in mapped_stops(Path(a.content) / a.slug, load_facts(Path(a.data) / a.slug)):
            if only and stop not in only: continue
            key = (round(centre[0], 6), round(centre[1], 6))
            if key in owners:
                write_shared_manifest(a.slug, stop, owners[key], a.out, src, precision); print(f"{stop}: shares {owners[key]} ({precision})")
                continue
            m = build_stop(a.slug, stop, centre, src, a.out, precision=precision); owners[key] = stop
            size = sum(p.stat().st_size for p in (Path(a.out) / a.slug / stop).glob("*.webp"))
            print(f"{stop}: {m['credits'][1]['source']} {size} bytes ({precision})")
    except (OSError, ValueError, urllib.error.URLError) as e:
        print(f"ERROR {e}", file=sys.stderr); return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
