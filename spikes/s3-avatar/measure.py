#!/usr/bin/env python3
"""S3 spike: CPU measurement of the avatar demo in headless Chrome over the DevTools pipe.
Python stdlib only; drives the system Chrome (no downloads). For each scenario it opens a fresh
tab, waits for the page, then reads Performance.getMetrics and SystemInfo.getProcessInfo
before and after a 10 s window.  Usage: python3 measure.py CHROME_BIN USER_DATA_DIR REPEATS
Output: JSON on stdout."""
import json, os, subprocess, sys, time

BASE = "http://127.0.0.1:8703/s3-avatar/index.html"
BENCH = "http://127.0.0.1:8703/s3-avatar/bench.html"
WINDOW = 10.0
SCEN = [
    ("blank_page", "about:blank", None),
    ("static_portrait_reduced_motion_paused", BASE + "?rm=1", None),
    ("idle_paused_breathe_blink", BASE, None),
    ("speaking_guide_L2", BASE + "?char=guide&lvl=2", "play"),
    ("speaking_guide_L1", BASE + "?char=guide&lvl=1", "play"),
    ("speaking_einstein_L2", BASE + "?char=einstein&lvl=2", "play"),
    ("speaking_reduced_motion_captions_only", BASE + "?rm=1", "play"),
    ("speaking_guide_L2_idle_bob_off", BASE + "?char=guide&lvl=2", "play",
     "(()=>{const s=document.createElement('style');s.textContent='.slot svg{animation:none!important}';document.head.append(s);return 1})()"),
]


SCEN_BENCH = [
    ("bench_lookup_only", BENCH + "?s=none", None),
    ("bench_lookup_plus_ui", BENCH + "?s=none&ui=1", None),
    ("bench_use_href", BENCH + "?s=href", None),
    ("bench_use_href_plus_ui", BENCH + "?s=href&ui=1", None),
    ("bench_visibility_toggle", BENCH + "?s=visibility", None),
    ("bench_display_toggle", BENCH + "?s=display", None),
]


def _inject(css):
    return "(()=>{const s=document.createElement('style');s.textContent=%s;document.head.append(s);return 1})()" % json.dumps(css)


SCEN_EXP = [
    ("exp_speaking_all_css_animation_off", BASE + "?char=guide&lvl=2", "play", _inject(".slot .rig-head,.slot .rig-body{animation:none!important}")),
    ("exp_speaking_head_breathe_only", BASE + "?char=guide&lvl=2", "play", _inject(".slot .rig-body{animation:none!important}")),
    ("exp_speaking_body_sway_only", BASE + "?char=guide&lvl=2", "play", _inject(".slot .rig-head{animation:none!important}")),
    ("exp_speaking_default", BASE + "?char=guide&lvl=2", "play", None),
]


class CDP:
    def __init__(self, chrome, ud):
        r1, w1 = os.pipe(); r2, w2 = os.pipe()
        def pre():
            os.dup2(r1, 3); os.dup2(w2, 4)
        args = [chrome, "--headless=new", "--remote-debugging-pipe", "--no-first-run", "--no-default-browser-check",
                "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", f"--user-data-dir={ud}", "--window-size=1280,900", "about:blank"]
        self.p = subprocess.Popen(args, preexec_fn=pre, pass_fds=(3, 4), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        os.close(r1); os.close(w2)
        self.w = os.fdopen(w1, "wb", buffering=0); self.r = os.fdopen(r2, "rb", buffering=0)
        self.i = 0; self.buf = b""

    def read(self):
        while b"\0" not in self.buf:
            c = self.r.read(65536)
            if not c: raise EOFError("pipe closed")
            self.buf += c
        raw, self.buf = self.buf.split(b"\0", 1)
        return json.loads(raw)

    def send(self, method, params=None, sid=None):
        self.i += 1; m = {"id": self.i, "method": method, "params": params or {}}
        if sid: m["sessionId"] = sid
        self.w.write(json.dumps(m).encode() + b"\0")
        while True:
            r = self.read()
            if r.get("id") == self.i:
                if "error" in r: raise RuntimeError(f"{method}: {r['error']}")
                return r.get("result", {})

    def close(self):
        try: self.send("Browser.close")
        except Exception: pass
        try: self.p.wait(timeout=8)
        except Exception: self.p.kill()


def ev(c, sid, expr, await_promise=False, gesture=False):
    r = c.send("Runtime.evaluate", {"expression": expr, "returnByValue": True, "awaitPromise": await_promise, "userGesture": gesture}, sid)
    if "exceptionDetails" in r: raise RuntimeError(json.dumps(r["exceptionDetails"])[:300])
    return r["result"].get("value")


def metrics(c, sid):
    return {m["name"]: m["value"] for m in c.send("Performance.getMetrics", {}, sid)["metrics"]}


def procs(c):
    out = {}
    for p in c.send("SystemInfo.getProcessInfo")["processInfo"]:
        out[p["type"]] = out.get(p["type"], 0.0) + p["cpuTime"]
    return out


def run_one(c, name, url, action, pre=None):
    t = c.send("Target.createTarget", {"url": "about:blank"})["targetId"]
    sid = c.send("Target.attachToTarget", {"targetId": t, "flatten": True})["sessionId"]
    c.send("Emulation.setDeviceMetricsOverride", {"width": 1280, "height": 900, "deviceScaleFactor": 1, "mobile": False}, sid)
    c.send("Performance.enable", {}, sid)
    if url != "about:blank":
        c.send("Page.navigate", {"url": url}, sid)
        for _ in range(100):
            time.sleep(0.1)
            try:
                if ev(c, sid, "document.documentElement.dataset.ready") == "true": break
            except Exception: pass
        else:
            raise RuntimeError("page never ready: " + name)
    if pre: ev(c, sid, pre)
    if action == "play":
        ev(c, sid, "(async()=>{__s3.clock.currentTime=0.4;await __s3.clock.play();return 1})()", True, True)
        ev(c, sid, "__s3.reset()")
    time.sleep(1.5)  # warm-up
    if action == "play": ev(c, sid, "__s3.reset()")
    m0, p0, t0 = metrics(c, sid), procs(c), time.time()
    time.sleep(WINDOW)
    m1, p1, t1 = metrics(c, sid), procs(c), time.time()
    snap = ev(c, sid, "window.__s3 ? __s3.snapshot() : (window.__bench ? __bench.stats() : null)")
    wall = t1 - t0
    res = {"scenario": name, "wall_s": round(wall, 2)}
    for k in ("TaskDuration", "ScriptDuration", "LayoutDuration", "RecalcStyleDuration"):
        res[k + "_ms_per_s"] = round((m1[k] - m0[k]) * 1000 / wall, 2)
    res["LayoutCount"] = int(m1["LayoutCount"] - m0["LayoutCount"]); res["RecalcStyleCount"] = int(m1["RecalcStyleCount"] - m0["RecalcStyleCount"])
    res["cpu_pct_by_process"] = {k: round((p1.get(k, 0) - p0.get(k, 0)) / wall * 100, 1) for k in p1}
    res["cpu_pct_total"] = round(sum((p1.get(k, 0) - p0.get(k, 0)) for k in p1) / wall * 100, 1)
    res["jsHeapUsedMB"] = round(m1["JSHeapUsedSize"] / 1048576, 2)
    res["page_snapshot"] = snap
    c.send("Target.closeTarget", {"targetId": t})
    return res


def main():
    chrome, ud, reps = sys.argv[1], sys.argv[2], int(sys.argv[3])
    scen = SCEN_BENCH if len(sys.argv) > 4 and sys.argv[4] == "bench" else (SCEN_EXP if len(sys.argv) > 4 and sys.argv[4] == "exp" else SCEN)
    c = CDP(chrome, ud)
    out = []
    try:
        c.send("Browser.getVersion"); time.sleep(1)
        for rep in range(reps):
            for sc in scen:
                name, url, action = sc[:3]
                r = run_one(c, name, url, action, sc[3] if len(sc) > 3 else None); r["rep"] = rep; out.append(r)
                print(json.dumps(r), file=sys.stderr, flush=True)
        ver = c.send("Browser.getVersion")["product"]
    finally:
        c.close()
    print(json.dumps({"chrome": ver, "window_s": WINDOW, "runs": out}, indent=1))


if __name__ == "__main__":
    main()
