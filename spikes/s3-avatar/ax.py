#!/usr/bin/env python3
"""S3 spike: dump Chrome's computed accessibility tree (Accessibility.getFullAXTree) and basic
interaction checks for the demo, via the same stdlib DevTools-pipe client as measure.py.
Usage: python3 ax.py CHROME_BIN USER_DATA_DIR URL"""
import json, sys, time
from measure import CDP, ev

CHECK_JS = r"""
(() => {
  const out = {};
  const ctl = [...document.querySelectorAll('button, select, input, summary, a[href]')].filter(e => e.offsetParent !== null || e.getClientRects().length);
  out.targets = ctl.map(e => { const r = e.getBoundingClientRect(); return {el: e.tagName.toLowerCase() + (e.id ? '#' + e.id : ''), w: Math.round(r.width), h: Math.round(r.height)}; });
  out.minTarget = Math.min(...out.targets.map(t => Math.min(t.w, t.h)));
  out.under24 = out.targets.filter(t => t.w < 24 || t.h < 24);
  out.focusOrder = [];
  const aiLabel = document.getElementById('ai-label'), fig = document.getElementById('avatar-fig');
  out.aiLabelText = aiLabel.textContent.trim();
  out.aiLabelInsideFigure = fig.contains(aiLabel);
  const sv = document.querySelector('#avatar-slot svg').getBoundingClientRect(), lb = aiLabel.getBoundingClientRect();
  out.aiLabelDistancePx = Math.round(lb.top - sv.bottom);
  out.trackMode = window.__s3.track.mode; out.cues = window.__s3.track.cues.length;
  out.reducedMotionMatches = matchMedia('(prefers-reduced-motion: reduce)').matches;
  out.animations = document.getAnimations().map(a => a.animationName || a.constructor.name);
  return out;
})()
"""


def main():
    chrome, ud, url = sys.argv[1], sys.argv[2], sys.argv[3]
    extra = sys.argv[4:]
    c = CDP(chrome, ud)
    try:
        t = c.send("Target.createTarget", {"url": "about:blank"})["targetId"]
        sid = c.send("Target.attachToTarget", {"targetId": t, "flatten": True})["sessionId"]
        c.send("Emulation.setDeviceMetricsOverride", {"width": 1280, "height": 900, "deviceScaleFactor": 1, "mobile": False}, sid)
        if "--force-rm" in extra:
            c.send("Emulation.setEmulatedMedia", {"features": [{"name": "prefers-reduced-motion", "value": "reduce"}]}, sid)
        c.send("Page.navigate", {"url": url}, sid)
        for _ in range(100):
            time.sleep(0.1)
            try:
                if ev(c, sid, "document.documentElement.dataset.ready") == "true": break
            except Exception: pass
        c.send("Accessibility.enable", {}, sid)
        nodes = c.send("Accessibility.getFullAXTree", {}, sid)["nodes"]
        by = {n["nodeId"]: n for n in nodes}
        def val(n, k):
            v = n.get(k); return (v or {}).get("value", "") if isinstance(v, dict) else ""
        def walk(nid, depth=0):
            n = by[nid]
            if not n.get("ignored"):
                role, name = val(n, "role"), val(n, "name")
                props = {p["name"]: p["value"].get("value") for p in n.get("properties", []) if p["name"] in ("pressed", "expanded", "checked", "live", "hidden", "valuetext", "valuenow", "valuemin", "valuemax", "disabled", "focusable", "current") and "value" in p["value"]}
                if role not in ("InlineTextBox", "StaticText", "none", "generic") or name:
                    print("  " * depth + f"{role} {json.dumps(name[:90]) if name else ''} {props if props else ''}".rstrip())
                    depth += 1
            for ch in n.get("childIds", []): walk(ch, depth)
        walk(nodes[0]["nodeId"])
        print("CHECKS", json.dumps(ev(c, sid, CHECK_JS), indent=1))
        if "--play" in extra:
            ev(c, sid, "(async()=>{__s3.clock.currentTime=0.4;await __s3.clock.play();return 1})()", True, True)
            time.sleep(4)
            print("AFTER 4 s PLAYING", json.dumps(ev(c, sid, "({snap: __s3.snapshot(), shape: __s3.S.shape, caption: document.getElementById('caption').textContent, anim: document.getAnimations().length, dataMotion: document.documentElement.dataset.motion, notice: document.getElementById('notice').textContent})"), indent=1))
        c.send("Target.closeTarget", {"targetId": t})
    finally:
        c.close()


if __name__ == "__main__":
    main()
