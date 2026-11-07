"""Write content/<slug>/coords.snapshot.json from Wikidata (P625) for every mapped journey stop.

    python3 tools/fetch_coords.py <slug> [--content content] [--timeout SECONDS]

Reads content/<slug>/journey.json, takes the Wikidata entity named by each mapped stop's
map.coord_source, fetches that entity's P625 (coordinate location) from the Wikidata API and writes

    {"entities": {"Q3012": {"qid", "lat", "lon", "retrieved_at", "api_url"}, ...}}

A stop may instead cite an OpenStreetMap node or way (https://www.openstreetmap.org/node|way/<id>),
the building-precise source the aerial zoom needs to end on a building; its entry is keyed
"node/<id>" or "way/<id>" ({"osm", "lat", "lon", "retrieved_at", "api_url"}), from the OSM API
(a way's position is the mean of its nodes).

tools/content_check.py compares each stop's lat/lon with this snapshot (within 0.01 degrees) and
never touches the network. This script is the only network step. It does not write lat/lon into
journey.json: a stop whose coordinates differ from the snapshot is a content error to fix by hand.
Exit 1 on any failure; nothing is written unless every entity was fetched.
"""
import argparse, json, re, sys, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = "https://www.wikidata.org/w/api.php"
UA = "IHH-verified-facts/1.0 (research; contact via project)"
ENTITY = re.compile(r"^https://www\.wikidata\.org/wiki/(Q\d+)$")
OSM = re.compile(r"^https://www\.openstreetmap\.org/((?:node|way)/\d+)$")
OSM_API = "https://api.openstreetmap.org/api/0.6/"

def api_url(key):
    if "/" in key:
        kind, n = key.split("/")
        return f"{OSM_API}{kind}/{n}" + ("/full.json" if kind == "way" else ".json")
    return API + "?" + urllib.parse.urlencode({"action": "wbgetclaims", "entity": key, "property": "P625", "format": "json"})

def key_of(src):
    """Snapshot key of a coord_source URL: "Q<digits>" (Wikidata) or "node/<id>" / "way/<id>" (OSM); None otherwise."""
    src = str(src or "").strip()
    hit = ENTITY.match(src) or OSM.match(src)
    return hit.group(1) if hit else None

def qids_of(journey):
    out = []
    for s in journey.get("stops", []):
        if isinstance(s.get("map"), dict):
            key = key_of(s["map"].get("coord_source"))
            if not key:
                raise ValueError(f"stop {s.get('id')}: coord_source must be https://www.wikidata.org/wiki/Q<digits> "
                                 "or https://www.openstreetmap.org/node|way/<digits>")
            if key not in out: out.append(key)
    return out

def parse_osm(doc, key):
    """(lat, lon) of an OSM node, or the mean of a way's nodes, from an OSM API JSON response."""
    els = doc.get("elements") or []
    kind, n = key.split("/")
    nodes = {e.get("id"): e for e in els if e.get("type") == "node" and isinstance(e.get("lat"), (int, float)) and isinstance(e.get("lon"), (int, float))}
    if kind == "node" and int(n) in nodes:
        return nodes[int(n)]["lat"], nodes[int(n)]["lon"]
    way = next((e for e in els if e.get("type") == "way" and e.get("id") == int(n)), None)
    pts = [nodes[i] for i in (way or {}).get("nodes", []) if i in nodes] if kind == "way" else []
    if not pts:
        raise ValueError(f"{key}: no coordinates in the OSM response")
    return sum(p["lat"] for p in pts) / len(pts), sum(p["lon"] for p in pts) / len(pts)

def parse_p625(doc, qid):
    """(lat, lon) of the preferred, else first normal-rank, P625 claim in a wbgetclaims response."""
    claims = [c for c in (doc.get("claims") or {}).get("P625", []) if c.get("rank") != "deprecated"]
    claims.sort(key=lambda c: c.get("rank") != "preferred")
    for c in claims:
        v = ((c.get("mainsnak") or {}).get("datavalue") or {}).get("value")
        if isinstance(v, dict) and isinstance(v.get("latitude"), (int, float)) and isinstance(v.get("longitude"), (int, float)):
            return v["latitude"], v["longitude"]
    raise ValueError(f"{qid}: no P625 coordinate location")

def fetch(qid, timeout):
    url = api_url(qid)
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=timeout) as r:
        doc = json.loads(r.read().decode("utf-8"))
    osm = "/" in qid
    lat, lon = parse_osm(doc, qid) if osm else parse_p625(doc, qid)
    return {("osm" if osm else "qid"): qid, "lat": round(lat, 6), "lon": round(lon, 6),
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "api_url": url}

def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument("slug")
    ap.add_argument("--content", default="content"); ap.add_argument("--timeout", type=float, default=20)
    a = ap.parse_args(argv)
    d = Path(a.content) / a.slug
    try:
        ents = {q: fetch(q, a.timeout) for q in qids_of(json.loads((d / "journey.json").read_text()))}
    except (OSError, ValueError) as e:
        print(f"ERROR {e}", file=sys.stderr); return 1
    (d / "coords.snapshot.json").write_text(json.dumps({"entities": ents}, indent=2) + "\n")
    print(f"wrote {d / 'coords.snapshot.json'} ({len(ents)} entities)")
    return 0

if __name__ == "__main__":
    sys.exit(main())
