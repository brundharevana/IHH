#!/usr/bin/env python3
"""S3 spike: render the demo and the cast sheet to WebP through headless Chrome (DevTools pipe, stdlib only).
Usage: python3 shots.py CHROME_BIN USER_DATA_DIR OUT_DIR"""
import base64, json, os, sys, time
from measure import CDP, ev

B = "http://127.0.0.1:8703/s3-avatar/"
SHOTS = [
    # name, url, width, height, dpr, mobile, seek (None = leave), full_page
    ("s3-cast-sheet", B + "cast-sheet.html", 1800, 1000, 1.5, False, None, True),
    ("s3-demo-desktop", B + "index.html?tr=1", 1280, 900, 1, False, 7.95, True),
    ("s3-demo-mobile", B + "index.html", 390, 844, 2, True, 2.0, True),
    ("s3-demo-reduced-motion", B + "index.html?rm=1&char=einstein&lvl=2&tr=1", 1280, 900, 1, False, 7.95, True),
]


def main():
    chrome, ud, out = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(out, exist_ok=True)
    c = CDP(chrome, ud)
    try:
        for name, url, w, h, dpr, mobile, seek, full in SHOTS:
            t = c.send("Target.createTarget", {"url": "about:blank"})["targetId"]
            sid = c.send("Target.attachToTarget", {"targetId": t, "flatten": True})["sessionId"]
            c.send("Emulation.setDeviceMetricsOverride", {"width": w, "height": h, "deviceScaleFactor": dpr, "mobile": mobile}, sid)
            c.send("Page.navigate", {"url": url}, sid)
            time.sleep(1.2)
            if "index.html" in url:
                for _ in range(80):
                    time.sleep(0.1)
                    if ev(c, sid, "document.documentElement.dataset.ready") == "true": break
                if seek is not None:
                    ev(c, sid, f"(async()=>{{const c=__s3.clock; if(c.readyState<1) await new Promise(r=>c.addEventListener('loadedmetadata',r,{{once:true}})); c.currentTime={seek}; await new Promise(r=>c.addEventListener('seeked',r,{{once:true}})); return 1}})()", True)
                time.sleep(0.8)
            H = int(ev(c, sid, "Math.ceil(document.documentElement.scrollHeight)")) if full else h
            params = {"format": "webp", "quality": 90, "captureBeyondViewport": True, "clip": {"x": 0, "y": 0, "width": w, "height": H, "scale": 1}}
            data = c.send("Page.captureScreenshot", params, sid)["data"]
            p = os.path.join(out, name + ".webp")
            open(p, "wb").write(base64.b64decode(data))
            print(name, w, H, dpr, os.path.getsize(p), "bytes", flush=True)
            c.send("Target.closeTarget", {"targetId": t})
    finally:
        c.close()


if __name__ == "__main__":
    main()
