#!/usr/bin/env python3
"""Validate a baked scene.json against scene.schema.json plus the checks JSON Schema cannot express.
Usage: python3 validate-scene.py [scene.json]   (also runs built-in negative tests with --selftest)
"""
import copy, json, math, os, sys
from jsonschema import Draft202012Validator

HERE = os.path.dirname(os.path.abspath(__file__))
SCHEMA = json.load(open(os.path.join(HERE, "scene.schema.json")))
V = Draft202012Validator(SCHEMA)

def cross_checks(d, base):
    errs = []
    ids = [h["id"] for h in d["hotspots"]]
    if len(set(ids)) != len(ids): errs.append("duplicate hotspot ids")
    orders = [h["order"] for h in d["hotspots"]]
    if len(set(orders)) != len(orders): errs.append("duplicate hotspot order values")
    p = d["render"]["pano"]
    if p["w"] != 2 * p["h"]: errs.append("pano is not 2:1")
    ex, ey, ez = d["render"]["builder"]["eye"]
    for h in d["hotspots"]:
        x, y, z = (a - b for a, b in zip(h["anchor"]["world"], (ex, ey, ez)))
        dist = math.sqrt(x * x + y * y + z * z)
        yaw, pitch = math.degrees(math.atan2(x, -z)), math.degrees(math.asin(y / dist))
        dv = h["derived"]
        if abs(yaw - dv["yawDeg"]) > 0.02 or abs(pitch - dv["pitchDeg"]) > 0.02 or abs(dist - dv["distanceM"]) > 0.02:
            errs.append(f"{h['id']}: derived angles do not match anchor (recomputed yaw {yaw:.2f}, pitch {pitch:.2f}, dist {dist:.2f})")
    yaws = [h["derived"]["yawDeg"] for h in sorted(d["hotspots"], key=lambda h: h["order"])]
    if yaws != sorted(yaws): errs.append("hotspot order is not ascending by yaw (spatial reading order)")
    for key in ("src", "preview"):
        f = os.path.join(base, p[key])
        if not os.path.exists(f): errs.append(f"missing file {p[key]}")
    f = os.path.join(base, p["src"])
    if os.path.exists(f) and os.path.getsize(f) / 1024 > d["budgets"]["panoKB"]: errs.append("pano over budget")
    return errs

def validate(d, base=HERE):
    errs = [f"{'/'.join(map(str, e.absolute_path)) or '<root>'}: {e.message[:120]}" for e in V.iter_errors(d)]
    return errs + (cross_checks(d, base) if not errs else [])

def selftest(good):
    def mut(fn):
        d = copy.deepcopy(good); fn(d); return d
    cases = {
        "missing a11y.alt": mut(lambda d: d["a11y"].pop("alt")),
        "licence not on allowlist": mut(lambda d: d["assets"][0].__setitem__("licence", "CC-BY-NC-4.0")),
        "evidence tier invalid": mut(lambda d: d["evidence"].__setitem__("tier", "photoreal")),
        "reconstruction tier without refs": mut(lambda d: d["evidence"].update(tier="reconstruction", refs=[])),
        "verified hotspot with empty fact_ids": mut(lambda d: d["hotspots"][0].__setitem__("content_status", "verified")),
        "hotspot gate failed": mut(lambda d: d["gates"]["objectId"][0].__setitem__("pass", False)),
        "handedness gate failed": mut(lambda d: d["gates"]["handedness"].__setitem__("pass", False)),
        "derived yaw edited by hand": mut(lambda d: d["hotspots"][0]["derived"].__setitem__("yawDeg", d["hotspots"][0]["derived"]["yawDeg"] + 5)),
        "pano not 2:1": mut(lambda d: d["render"]["pano"].__setitem__("h", 1024)),
        "nine hotspots": mut(lambda d: d.__setitem__("hotspots", d["hotspots"] * 3)),
        "fact id wrong format": mut(lambda d: d["hotspots"][0].__setitem__("fact_ids", ["fact-1"])),
    }
    bad = 0
    for name, d in cases.items():
        errs = validate(d)
        print(("caught   " if errs else "MISSED   ") + name + (": " + errs[0] if errs else ""))
        bad += 0 if errs else 1
    return bad

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    path = args[0] if args else os.path.join(HERE, "scene.json")
    d = json.load(open(path))
    errs = validate(d, os.path.dirname(os.path.abspath(path)))
    print("scene.json:", "VALID" if not errs else "INVALID")
    for e in errs: print("  -", e)
    rc = 1 if errs else 0
    if "--selftest" in sys.argv:
        rc |= 1 if selftest(d) else 0
    sys.exit(rc)
