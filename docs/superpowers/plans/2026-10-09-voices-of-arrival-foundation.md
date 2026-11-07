# Voices of Arrival — Foundation + Einstein Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared site, museum kit and content toolchain, and prove them end to end with an Einstein slice (journey map, one gallery, one reconstructed place, a 360 letter, a living portrait speaking a real quote, quiz, Lite page, WordPress export).

**Architecture:** A static Astro 5 site reads per-chapter JSON content (generated only from pipeline-verified facts) and renders each chapter twice: as a live three.js museum room (built by a small "museum kit" from wall/slot layouts) and as an accessible Lite HTML page. Narration audio and WebVTT cues are built at build time; cues drive numbered exhibit reveals. Python tools validate content against verified facts before the site builds.

**Tech Stack:** Node 20.9 (installed), Astro 5.18.2, three 0.186.1, camera-controls 3.1.2, @google/model-viewer 4.3.1, motion 14.1.0, Vitest 3.2.7, @playwright/test 1.64.0, @axe-core/playwright 4.13.0; Python 3.12 stdlib for content tools; kokoro-onnx (MIT) + Kokoro-82M (Apache-2.0) and onnxruntime for build-time audio and depth.

**Spec:** `docs/superpowers/specs/2026-10-09-voices-of-arrival-design.md` (read it first; also `docs/pipeline/SPEC.md` and `docs/research/direction/B5-museum-architecture-rendering.md`).

## Global Constraints

- Name: "IHH: Voices of Arrival".
- Static output only; no server code, no Vercel-specific features (no functions, middleware, image optimisation).
- Every visible sentence, label, title, caption and quote cites verified fact ids; quotes equal an `is_direct_quote` fact verbatim; only verified media with licence_class in public-domain, cc0, cc-by, cc-by-sa.
- Every reconstruction (room or object) shows "Reconstruction based on [source, holder, date]" and a "See the original" link to the untouched record.
- AI voice label: "AI-generated voice, not [Name]'s voice. Words: [Name], [source, date]." Portrait label per B4-AVATAR-RECOMMENDATION.md section 4.
- WCAG 2.2 AA: keyboard path to every exhibit, focus trap/return in panels, 24 px targets, captions + transcript for all audio, reduced motion disables camera flights and portrait motion.
- Phone room budget: <=80 draw calls, <=150k triangles, <=4 lights, <=24 MB texture memory, <=2.5 MB download; one room loaded at a time; pixel ratio <=2; no post-processing on phones.
- No emojis in code, UI or commits. No trackers. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Keep >=2 GB disk free; never commit node_modules or audio intermediates.

## Review Focus

1. A chapter whose narration cites a fact that later becomes disputed or rejected: build must fail (content check), not ship stale text.
2. A visitor on a phone with WebGL disabled or failing context creation: must land in Lite mode with identical content.
3. A visitor who never presses play (no audio): exhibits must still be reachable (numbered list shows all exhibits after a "Show all" control or after the cue time is skipped), never locked forever.
4. Screen-reader and keyboard users opening and closing the panel repeatedly: focus returns to the same exhibit button every time, Escape always closes.
5. Missing or 404 media file for an exhibit: panel shows the text, credit and "See the original" link with a visible "image unavailable" notice; the room still renders.

---

## File Structure

```
site/                              Astro project
  package.json, astro.config.mjs, vitest.config.mjs, playwright.config.mjs
  src/styles/tokens.css            design tokens (colour, type, spacing)
  src/layouts/Base.astro           page shell, skip link, header, footer (cite/teacher links)
  src/pages/index.astro            entrance (hall placeholder + accessible inductee list)
  src/pages/[slug]/index.astro     journey map
  src/pages/[slug]/[chapter].astro chapter room page (3D + panel + reveal list)
  src/pages/[slug]/lite.astro      Lite page (all chapters as HTML)
  src/pages/[slug]/end.astro       ending chooser (quiz or other inductees)
  src/content/load.js              reads content/<slug>/ JSON at build time
  src/museum/layout.js             wall/slot -> world transforms (pure)
  src/museum/budget.js             budget check for a built scene (pure)
  src/museum/room.js               builds gallery / reconstructed-place rooms
  src/museum/materials.js          shared PBR materials (textures from public/tex)
  src/museum/lighting.js           lighting rig
  src/museum/exhibits.js           exhibit meshes (frame, document, quote, niche)
  src/museum/docmesh.js            paper mesh for 360 documents (front/back)
  src/museum/camera.js             flights with reduced-motion jumps
  src/museum/reveal.js             cue -> reveal timeline (pure)
  src/museum/capability.js         WebGL2 / reduced-motion / Lite decision (pure)
  src/museum/scene.js              wires room, camera, reveal, list, panel
  src/ui/panel.js                  side panel / bottom sheet controller
  src/ui/sources.js                fact chip toggletips
  src/ui/portrait.js               living portrait player (depth parallax)
  src/ui/quiz.js                   quiz logic (pure) + DOM binding
  src/test/*.test.js               Vitest unit tests
  e2e/*.spec.js                    Playwright tests
content/einstein/                  experience data (authored from verified facts)
  inductee.json, chapters/1.json ... , audio/*.mp3, audio/*.vtt
tools/content_check.py             validates content/<slug> against data/inductees/<slug>
tools/build_audio.py               Kokoro TTS + WebVTT from chapter narration
tools/build_depth.py               Depth Anything V2 Small depth maps for portraits
tools/tests/test_content_check.py, test_build_audio.py
```

---

### Task 1: Site skeleton, tokens, routes, test harness

**Files:**
- Create: `site/package.json`, `site/astro.config.mjs`, `site/vitest.config.mjs`, `site/playwright.config.mjs`, `site/src/styles/tokens.css`, `site/src/layouts/Base.astro`, `site/src/pages/index.astro`, `site/e2e/smoke.spec.js`
- Modify: `.gitignore` (add `site/node_modules/`, `site/dist/`, `site/.astro/`, `site/test-results/`)

**Interfaces:**
- Produces: `Base.astro` props `{title: string, description: string}`; CSS custom properties `--c-bg, --c-ink, --c-accent, --c-muted, --c-panel, --f-sans, --f-serif, --space-1..6`.

- [ ] **Step 1: Create package.json with pinned versions**

```json
{
  "name": "voices-of-arrival",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview --port 4321",
    "test": "vitest run",
    "e2e": "playwright test"
  },
  "dependencies": {
    "astro": "5.18.2",
    "three": "0.186.1",
    "camera-controls": "3.1.2",
    "@google/model-viewer": "4.3.1",
    "motion": "14.1.0"
  },
  "devDependencies": {
    "vitest": "3.2.7",
    "@playwright/test": "1.64.0",
    "@axe-core/playwright": "4.13.0"
  }
}
```

- [ ] **Step 2: Config files**

`site/astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
export default defineConfig({ output: 'static', trailingSlash: 'always', build: { format: 'directory' } });
```
`site/vitest.config.mjs`:
```js
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['src/test/**/*.test.js'], environment: 'node' } });
```
`site/playwright.config.mjs`:
```js
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'e2e',
  webServer: { command: 'npm run build && npm run preview', port: 4321, reuseExistingServer: true, timeout: 180000 },
  use: { baseURL: 'http://localhost:4321' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
```

- [ ] **Step 3: Tokens and base layout**

`site/src/styles/tokens.css` (values follow B5: warm-grey shell, dark accent; check every text/background pair is >=4.5:1 with the UI UX Pro Max contrast rules before committing):
```css
:root {
  --c-bg: #f4f1ec; --c-ink: #1f1d1a; --c-muted: #5b564f; --c-accent: #7a2e1f;
  --c-panel: #ffffffee; --c-focus: #0b57d0;
  --f-serif: "Source Serif 4", Georgia, serif; --f-sans: "Atkinson Hyperlegible", system-ui, sans-serif;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px; --space-6: 40px;
}
:focus-visible { outline: 3px solid var(--c-focus); outline-offset: 2px; }
.visually-hidden { position: absolute !important; clip: rect(0 0 0 0); width: 1px; height: 1px; overflow: hidden; white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```
`site/src/layouts/Base.astro`:
```astro
---
import '../styles/tokens.css';
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | IHH: Voices of Arrival</title><meta name="description" content={description}></head>
<body style="margin:0;background:var(--c-bg);color:var(--c-ink);font-family:var(--f-sans)">
<a class="visually-hidden" href="#main" onfocus="this.classList.remove('visually-hidden')">Skip to content</a>
<header><a href="/">IHH: Voices of Arrival</a></header>
<main id="main"><slot /></main>
<footer><a href="/how-this-was-made/">How this was made</a></footer>
</body></html>
```
`site/src/pages/index.astro` (hall placeholder until Track C):
```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Entrance" description="A virtual museum of five immigrant inductees of the Immigrant Hall of Honor.">
  <h1>IHH: Voices of Arrival</h1>
  <ul id="inductees"><li><a href="/einstein/">Albert Einstein</a></li></ul>
</Base>
```

- [ ] **Step 4: Write the smoke test**

`site/e2e/smoke.spec.js`:
```js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('home renders with no serious axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('IHH: Voices of Arrival');
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(r.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
});
```

- [ ] **Step 5: Install and run**

Run: `cd site && npm install && npx playwright install chromium && npm run e2e -- e2e/smoke.spec.js`
Expected: PASS on desktop and mobile projects. If disk drops below 2 GB, stop and report.

- [ ] **Step 6: Commit**

```bash
git add .gitignore site/package.json site/package-lock.json site/astro.config.mjs site/vitest.config.mjs site/playwright.config.mjs site/src site/e2e
git commit -m "feat(site): Astro skeleton, tokens, base layout, smoke + axe test"
```

---

### Task 2: Content schema and content check (Python, TDD)

**Files:**
- Create: `tools/content_check.py`, `tools/tests/test_content_check.py`
- Reads: `tools/ihh/gates.py` (`unsupported_tokens`), `tools/ihh/records.py` (loaders), `tools/ihh/paths.py`

**Interfaces:**
- Consumes: verified facts/media from `data/inductees/<slug>/` via `ihh.records`; `ihh.gates.unsupported_tokens(text, support)` and `ihh.gates.Support` (read their current signatures in gates.py before coding and adapt the two call sites below).
- Produces: `check(slug: str, content_dir: Path, data_dir: Path) -> list[str]` (errors); CLI `python3 tools/content_check.py <slug>` exit 1 on errors.

Chapter JSON rules enforced (from spec 4.1): ids unique; `room` in {chapter-gallery, reconstructed-place}; reconstructed-place has non-empty `reconstruction.basis_media_ids` all verified; every narration line, exhibit title, note, caption cites existing fact ids whose status is `verified`; every text passes content-word coverage against its cited facts (reuse G6 rule); every exhibit has `media_id` and `original_media_id` that are verified with usable licence_class; every `reveals` id exists; every quote `text` equals the cited fact claim verbatim and that fact has `is_direct_quote: true`; `wall` in {north, east, south, west}; `slot` integer 1-4; `number` unique per chapter.

- [ ] **Step 1: Write failing tests**

```python
# tools/tests/test_content_check.py
import json
from pathlib import Path
import content_check as cc

def facts(tmp, rows):
    d = tmp / "data" / "inductees" / "tst"; d.mkdir(parents=True)
    (d / "facts.jsonl").write_text("".join(json.dumps(r) + "\n" for r in rows))
    (d / "media.jsonl").write_text(json.dumps({"id": "TST-M-0001", "status": "verified", "license_class": "public-domain", "title": "Letter", "url": "https://example.org/a"}) + "\n")
    (d / "inductee.json").write_text(json.dumps({"slug": "tst", "code": "TST", "name": "Test Person", "aliases": []}))
    return tmp / "data"

def chapter(tmp, obj):
    c = tmp / "content" / "tst" / "chapters"; c.mkdir(parents=True)
    (c / "1.json").write_text(json.dumps(obj))
    return tmp / "content" / "tst"

F1 = {"id": "TST-F-0001", "status": "verified", "claim": "Test Person arrived in Boston in 1933.", "is_direct_quote": False}
Q1 = {"id": "TST-F-0002", "status": "verified", "claim": "Imagination is useful.", "is_direct_quote": True}
GOOD = {"id": "tst-1", "title": "Arrived in Boston", "room": "chapter-gallery",
        "narration": [{"cue": "c1", "text": "Test Person arrived in Boston in 1933.", "fact_ids": ["TST-F-0001"], "reveals": ["ex1"]}],
        "exhibits": [{"id": "ex1", "number": 1, "type": "framed-document", "wall": "north", "slot": 1,
                      "media_id": "TST-M-0001", "original_media_id": "TST-M-0001", "title": "Arrived in Boston",
                      "title_fact_ids": ["TST-F-0001"], "notes": [], "evidence": "record"}],
        "quotes": [{"id": "q1", "text": "Imagination is useful.", "fact_id": "TST-F-0002", "voice": "tst-ai"}]}

def test_good_chapter_passes(tmp_path):
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, GOOD)
    assert cc.check("tst", content, data) == []

def test_unverified_fact_fails(tmp_path):
    data = facts(tmp_path, [dict(F1, status="disputed"), Q1]); content = chapter(tmp_path, GOOD)
    assert any("TST-F-0001" in e and "verified" in e for e in cc.check("tst", content, data))

def test_added_word_fails(tmp_path):
    bad = json.loads(json.dumps(GOOD)); bad["narration"][0]["text"] = "Test Person proudly arrived in Boston in 1933."
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, bad)
    assert any("proudly" in e for e in cc.check("tst", content, data))

def test_quote_must_be_verbatim(tmp_path):
    bad = json.loads(json.dumps(GOOD)); bad["quotes"][0]["text"] = "Imagination is very useful."
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, bad)
    assert any("q1" in e and "verbatim" in e for e in cc.check("tst", content, data))

def test_reconstruction_needs_basis(tmp_path):
    bad = json.loads(json.dumps(GOOD)); bad["room"] = "reconstructed-place"
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, bad)
    assert any("basis" in e for e in cc.check("tst", content, data))

def test_unknown_reveal_fails(tmp_path):
    bad = json.loads(json.dumps(GOOD)); bad["narration"][0]["reveals"] = ["ex9"]
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, bad)
    assert any("ex9" in e for e in cc.check("tst", content, data))

def test_missing_original_link_fails(tmp_path):
    bad = json.loads(json.dumps(GOOD)); del bad["exhibits"][0]["original_media_id"]
    data = facts(tmp_path, [F1, Q1]); content = chapter(tmp_path, bad)
    assert any("original" in e for e in cc.check("tst", content, data))
```

- [ ] **Step 2: Run to verify failure**

Run: `python3 -m pytest tools/tests/test_content_check.py -q -p no:cacheprovider`
Expected: FAIL (ModuleNotFoundError: content_check).

- [ ] **Step 3: Implement**

```python
# tools/content_check.py
"""Validate experience content (content/<slug>/chapters/*.json) against verified pipeline data.

Usage: python3 tools/content_check.py <slug> [--content content] [--data data]
Exit 1 on any error.
"""
import argparse, json, sys
from pathlib import Path
from ihh import gates

USABLE = {"public-domain", "cc0", "cc-by", "cc-by-sa"}
ROOMS = {"chapter-gallery", "reconstructed-place"}
WALLS = {"north", "east", "south", "west"}

def _jsonl(p):
    return [json.loads(l) for l in p.read_text().splitlines() if l.strip()] if p.exists() else []

def check(slug, content_dir, data_dir):
    d = Path(data_dir) / "inductees" / slug
    facts = {f["id"]: f for f in _jsonl(d / "facts.jsonl")}
    media = {m["id"]: m for m in _jsonl(d / "media.jsonl")}
    inductee = json.loads((d / "inductee.json").read_text())
    errors = []

    def grounded(where, text, fact_ids):
        if not fact_ids:
            errors.append(f"{where}: no fact_ids"); return
        for fid in fact_ids:
            f = facts.get(fid)
            if f is None:
                errors.append(f"{where}: unknown fact {fid}")
            elif f.get("status") != "verified":
                errors.append(f"{where}: fact {fid} is {f.get('status')}, must be verified")
        claims = [facts[f]["claim"] for f in fact_ids if f in facts]
        support = gates.Support.from_texts(claims, inductee.get("aliases", []))
        for tok in gates.unsupported_tokens(text, support):
            errors.append(f"{where}: {tok} not in cited facts")

    def usable_media(where, mid):
        m = media.get(mid)
        if m is None:
            errors.append(f"{where}: unknown media {mid}")
        elif m.get("status") != "verified" or m.get("license_class") not in USABLE:
            errors.append(f"{where}: media {mid} not verified with a usable licence")

    for path in sorted((Path(content_dir) / "chapters").glob("*.json")):
        ch = json.loads(path.read_text()); cid = ch.get("id", path.stem)
        if ch.get("room") not in ROOMS:
            errors.append(f"{cid}: room must be one of {sorted(ROOMS)}")
        if ch.get("room") == "reconstructed-place":
            basis = (ch.get("reconstruction") or {}).get("basis_media_ids") or []
            if not basis:
                errors.append(f"{cid}: reconstructed-place needs reconstruction.basis_media_ids")
            for mid in basis:
                usable_media(f"{cid} basis", mid)
        ex_ids, numbers = set(), set()
        for ex in ch.get("exhibits", []):
            w = f"{cid} exhibit {ex.get('id')}"
            if ex.get("id") in ex_ids: errors.append(f"{w}: duplicate id")
            ex_ids.add(ex.get("id"))
            if ex.get("number") in numbers: errors.append(f"{w}: duplicate number")
            numbers.add(ex.get("number"))
            if ex.get("wall") not in WALLS: errors.append(f"{w}: wall must be one of {sorted(WALLS)}")
            if not isinstance(ex.get("slot"), int) or not 1 <= ex["slot"] <= 4: errors.append(f"{w}: slot must be 1-4")
            usable_media(w, ex.get("media_id"))
            if not ex.get("original_media_id"):
                errors.append(f"{w}: needs original_media_id for the See the original link")
            else:
                usable_media(f"{w} original", ex["original_media_id"])
            grounded(f"{w} title", ex.get("title", ""), ex.get("title_fact_ids", []))
            for i, n in enumerate(ex.get("notes", [])):
                grounded(f"{w} note {i}", n.get("text", ""), n.get("fact_ids", []))
        for line in ch.get("narration", []):
            w = f"{cid} cue {line.get('cue')}"
            grounded(w, line.get("text", ""), line.get("fact_ids", []))
            for r in line.get("reveals", []):
                if r not in ex_ids: errors.append(f"{w}: reveals unknown exhibit {r}")
        for q in ch.get("quotes", []):
            f = facts.get(q.get("fact_id"))
            if f is None or f.get("status") != "verified" or not f.get("is_direct_quote"):
                errors.append(f"{cid} quote {q.get('id')}: needs a verified is_direct_quote fact")
            elif q.get("text") != f.get("claim"):
                errors.append(f"{cid} quote {q.get('id')}: text must equal the fact claim verbatim")
    return errors

def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument("slug")
    ap.add_argument("--content", default="content"); ap.add_argument("--data", default="data")
    a = ap.parse_args(argv)
    errs = check(a.slug, Path(a.content) / a.slug, Path(a.data))
    for e in errs: print("ERROR", e)
    print("OK" if not errs else f"FAIL: {len(errs)} error(s)")
    return 1 if errs else 0

if __name__ == "__main__":
    sys.exit(main())
```
If `gates.Support.from_texts` does not exist, add it in `tools/ihh/gates.py` as a classmethod building the same Support object G6 uses from a list of claim texts plus aliases (read `check_grounding.py` for the existing construction and reuse it; do not duplicate the tokenizer).

- [ ] **Step 4: Run tests, then the full suite**

Run: `python3 -m pytest tools/tests/test_content_check.py -q -p no:cacheprovider && python3 -m pytest tools -q -p no:cacheprovider`
Expected: new tests PASS; full suite has no new failures.

- [ ] **Step 5: Mutation proof**

Temporarily change `if q.get("text") != f.get("claim")` to `if False`; run the test file; expect `test_quote_must_be_verbatim` FAIL; restore. Do the same for the `status != "verified"` check.

- [ ] **Step 6: Commit**

```bash
git add tools/content_check.py tools/tests/test_content_check.py tools/ihh/gates.py
git commit -m "feat(content): content check grounds every experience text in verified facts"
```

---

### Task 3: Audio build (Kokoro TTS + WebVTT cues)

**Files:**
- Create: `tools/build_audio.py`, `tools/tests/test_build_audio.py`

**Interfaces:**
- Consumes: chapter JSON `narration[]` (cue, text) and `quotes[]` (id, text, voice).
- Produces: `content/<slug>/audio/<chapter>-narration.mp3` + `.vtt` (one VTT cue per narration line, cue id = line `cue`), `content/<slug>/audio/<chapter>-<quote-id>.mp3` + `.vtt`. Pure helper `vtt_from_segments(segments: list[tuple[str, float, float, str]]) -> str` with (cue_id, start_s, end_s, text).
- Voices: guide `af_heart`; Einstein `bm_george`; other inductees chosen in their chapters' `voice` field (`<slug>-ai` maps in `VOICES`).

- [ ] **Step 1: Failing test for the pure VTT builder**

```python
# tools/tests/test_build_audio.py
from build_audio import vtt_from_segments, ts

def test_timestamp_format():
    assert ts(0) == "00:00:00.000"
    assert ts(61.5) == "00:01:01.500"

def test_vtt_has_ids_and_order():
    v = vtt_from_segments([("c1", 0.0, 2.5, "First."), ("c2", 2.5, 5.0, "Second.")])
    assert v.startswith("WEBVTT\n\n")
    assert "c1\n00:00:00.000 --> 00:00:02.500\nFirst.\n" in v
    assert v.index("c1") < v.index("c2")

def test_rejects_overlap():
    import pytest
    with pytest.raises(ValueError):
        vtt_from_segments([("c1", 0.0, 3.0, "A"), ("c2", 2.0, 4.0, "B")])
```

- [ ] **Step 2: Run, expect FAIL** — `python3 -m pytest tools/tests/test_build_audio.py -q -p no:cacheprovider`

- [ ] **Step 3: Implement**

```python
# tools/build_audio.py
"""Build narration and quote audio with Kokoro-82M (Apache-2.0) and matching WebVTT.

Setup (once): python3 -m venv .venv-audio && .venv-audio/bin/pip install kokoro-onnx soundfile
Models: kokoro-v1.0.onnx and voices-v1.0.bin into tools/models/ (gitignored).
Usage: .venv-audio/bin/python tools/build_audio.py <slug> <chapter-number>
MP3 encode uses ffmpeg if present, else writes WAV (note it in the report).
"""
import json, subprocess, sys
from pathlib import Path

VOICES = {"guide": "af_heart", "einstein-ai": "bm_george"}
GAP_S = 0.35

def ts(sec):
    ms = round(sec * 1000); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

def vtt_from_segments(segments):
    out, last_end = ["WEBVTT", ""], 0.0
    for cue, start, end, text in segments:
        if start < last_end - 1e-6 or end <= start:
            raise ValueError(f"cue {cue} overlaps or is empty")
        out += [cue, f"{ts(start)} --> {ts(end)}", text, ""]
        last_end = end
    return "\n".join(out) + "\n"

def synth(kokoro, text, voice):
    samples, rate = kokoro.create(text, voice=voice, speed=1.0, lang="en-us")
    return samples, rate

def write_audio(samples, rate, path):
    import soundfile as sf
    wav = path.with_suffix(".wav"); sf.write(wav, samples, rate)
    if subprocess.run(["which", "ffmpeg"], capture_output=True).returncode == 0:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-b:a", "48k", str(path)], check=True)
        wav.unlink()
        return path
    return wav

def main(slug, chapter):
    import numpy as np
    from kokoro_onnx import Kokoro
    root = Path(__file__).resolve().parents[1]
    models = root / "tools" / "models"
    kokoro = Kokoro(str(models / "kokoro-v1.0.onnx"), str(models / "voices-v1.0.bin"))
    ch = json.loads((root / "content" / slug / "chapters" / f"{chapter}.json").read_text())
    out = root / "content" / slug / "audio"; out.mkdir(parents=True, exist_ok=True)
    parts, segs, t = [], [], 0.0
    for line in ch["narration"]:
        s, rate = synth(kokoro, line["text"], VOICES["guide"])
        dur = len(s) / rate; segs.append((line["cue"], t, t + dur, line["text"]))
        parts += [s, np.zeros(int(GAP_S * rate), dtype=s.dtype)]; t += dur + GAP_S
    write_audio(np.concatenate(parts), rate, out / f"{chapter}-narration.mp3")
    (out / f"{chapter}-narration.vtt").write_text(vtt_from_segments(segs))
    for q in ch.get("quotes", []):
        if q["voice"] == "recording": continue
        s, rate = synth(kokoro, q["text"], VOICES[q["voice"]])
        write_audio(s, rate, out / f"{chapter}-{q['id']}.mp3")
        (out / f"{chapter}-{q['id']}.vtt").write_text(vtt_from_segments([(q["id"], 0.0, len(s) / rate, q["text"])]))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
```

- [ ] **Step 4: Run tests, expect PASS**; then set up the venv and models (check disk first; models ~ 330 MB total; add `tools/models/` and `.venv-audio/` to .gitignore) and run a 1-line smoke synthesis.

- [ ] **Step 5: Commit**

```bash
git add tools/build_audio.py tools/tests/test_build_audio.py .gitignore
git commit -m "feat(audio): Kokoro narration and quote audio with WebVTT cues"
```

---

### Task 4: Museum layout resolver and budget check (pure JS, TDD)

**Files:**
- Create: `site/src/museum/layout.js`, `site/src/museum/budget.js`, `site/src/test/layout.test.js`, `site/src/test/budget.test.js`

**Interfaces:**
- Produces: `ROOM_TYPES` (`{'chapter-gallery': {w: 8, d: 12, h: 4.5}, 'reconstructed-place': null}`), `HEIGHTS` (`{labelCentre: 1.37, frameCentre: 1.6, caseTop: 0.915}`), `resolveSlot(room, wall, slot) -> {x, y, z, rotY}` (world metres, y = frame centre height, facing into the room), `checkBudget(stats, budget = PHONE_BUDGET) -> string[]` with stats `{drawCalls, triangles, lights, textureBytes, downloadBytes}`.

- [ ] **Step 1: Failing tests**

```js
// site/src/test/layout.test.js
import { describe, it, expect } from 'vitest';
import { resolveSlot, ROOM_TYPES, HEIGHTS } from '../museum/layout.js';
const room = ROOM_TYPES['chapter-gallery'];
describe('resolveSlot', () => {
  it('places north wall slots inside the room facing south', () => {
    const p = resolveSlot(room, 'north', 1);
    expect(p.z).toBeCloseTo(-room.d / 2 + 0.05);
    expect(p.y).toBeCloseTo(HEIGHTS.frameCentre);
    expect(p.rotY).toBeCloseTo(0);
    expect(Math.abs(p.x)).toBeLessThan(room.w / 2);
  });
  it('spreads four slots evenly and in order along a wall', () => {
    const xs = [1, 2, 3, 4].map(s => resolveSlot(room, 'north', s).x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
    expect(xs[1] - xs[0]).toBeCloseTo(xs[3] - xs[2]);
  });
  it('rejects bad walls and slots', () => {
    expect(() => resolveSlot(room, 'up', 1)).toThrow();
    expect(() => resolveSlot(room, 'north', 5)).toThrow();
  });
});
```
```js
// site/src/test/budget.test.js
import { it, expect } from 'vitest';
import { checkBudget } from '../museum/budget.js';
it('passes within budget', () => {
  expect(checkBudget({ drawCalls: 60, triangles: 1e5, lights: 3, textureBytes: 20e6, downloadBytes: 2e6 })).toEqual([]);
});
it('names every exceeded limit', () => {
  const e = checkBudget({ drawCalls: 81, triangles: 150001, lights: 5, textureBytes: 25e6, downloadBytes: 3e6 });
  expect(e.length).toBe(5);
  expect(e.join(' ')).toMatch(/drawCalls.*triangles.*lights.*textureBytes.*downloadBytes/);
});
```

- [ ] **Step 2: Run `cd site && npm test`, expect FAIL.**

- [ ] **Step 3: Implement**

```js
// site/src/museum/layout.js
export const ROOM_TYPES = { 'chapter-gallery': { w: 8, d: 12, h: 4.5 } };
export const HEIGHTS = { labelCentre: 1.37, frameCentre: 1.6, caseTop: 0.915 };
const WALL = {
  north: { axis: 'x', len: r => r.w, fixed: r => ({ z: -r.d / 2 + 0.05 }), rotY: 0 },
  south: { axis: 'x', len: r => r.w, fixed: r => ({ z: r.d / 2 - 0.05 }), rotY: Math.PI },
  west: { axis: 'z', len: r => r.d, fixed: r => ({ x: -r.w / 2 + 0.05 }), rotY: Math.PI / 2 },
  east: { axis: 'z', len: r => r.d, fixed: r => ({ x: r.w / 2 - 0.05 }), rotY: -Math.PI / 2 },
};
export function resolveSlot(room, wall, slot) {
  const w = WALL[wall];
  if (!w) throw new Error(`unknown wall ${wall}`);
  if (!Number.isInteger(slot) || slot < 1 || slot > 4) throw new Error(`slot must be 1-4, got ${slot}`);
  const len = w.len(room), step = len / 5, along = -len / 2 + step * slot;
  const pos = { x: 0, y: HEIGHTS.frameCentre, z: 0, ...w.fixed(room), rotY: w.rotY };
  pos[w.axis] = wall === 'south' || wall === 'east' ? -along : along;
  return pos;
}
```
Note: south and WEST reverse (corrected 2026-10-09, see ledger ruling) so slot 1 is always on the visitor's left when facing the wall.
```js
// site/src/museum/budget.js
export const PHONE_BUDGET = { drawCalls: 80, triangles: 150000, lights: 4, textureBytes: 24e6, downloadBytes: 2.5e6 };
export function checkBudget(stats, budget = PHONE_BUDGET) {
  return Object.keys(budget).filter(k => stats[k] > budget[k]).map(k => `${k} ${stats[k]} exceeds ${budget[k]}`);
}
```

- [ ] **Step 4: `npm test`, expect PASS. Step 5: Commit** `feat(museum): wall/slot layout resolver and phone budget check`.

---

### Task 5: Reveal timeline and capability decision (pure JS, TDD)

**Files:**
- Create: `site/src/museum/reveal.js`, `site/src/museum/capability.js`, `site/src/test/reveal.test.js`, `site/src/test/capability.test.js`

**Interfaces:**
- Produces: `buildTimeline(narration, cues) -> [{exhibitId, at}]` sorted by `at` (seconds; `cues` = `[{id, startTime}]` from the VTT track); `revealedAt(timeline, t) -> Set<string>`; `chooseMode({webgl2, reducedMotion, liteParam, userPref}) -> 'lite' | '3d'`.

- [ ] **Step 1: Failing tests**

```js
// site/src/test/reveal.test.js
import { it, expect } from 'vitest';
import { buildTimeline, revealedAt } from '../museum/reveal.js';
const narration = [{ cue: 'c1', reveals: ['ex1'] }, { cue: 'c2', reveals: ['ex2', 'ex3'] }];
const cues = [{ id: 'c1', startTime: 0.5 }, { id: 'c2', startTime: 7 }];
it('maps cues to exhibit reveal times in order', () => {
  expect(buildTimeline(narration, cues)).toEqual([{ exhibitId: 'ex1', at: 0.5 }, { exhibitId: 'ex2', at: 7 }, { exhibitId: 'ex3', at: 7 }]);
});
it('reveals cumulatively and never hides', () => {
  const tl = buildTimeline(narration, cues);
  expect([...revealedAt(tl, 0)]).toEqual([]);
  expect([...revealedAt(tl, 1)]).toEqual(['ex1']);
  expect(revealedAt(tl, 99).size).toBe(3);
});
it('throws on a cue missing from the audio track', () => {
  expect(() => buildTimeline([{ cue: 'c9', reveals: ['ex1'] }], cues)).toThrow(/c9/);
});
```
```js
// site/src/test/capability.test.js
import { it, expect } from 'vitest';
import { chooseMode } from '../museum/capability.js';
it('falls back to lite without WebGL2', () => expect(chooseMode({ webgl2: false })).toBe('lite'));
it('honours ?lite=1 and the stored preference', () => {
  expect(chooseMode({ webgl2: true, liteParam: true })).toBe('lite');
  expect(chooseMode({ webgl2: true, userPref: 'lite' })).toBe('lite');
});
it('reduced motion alone keeps 3D (motion is disabled separately)', () => expect(chooseMode({ webgl2: true, reducedMotion: true })).toBe('3d'));
```

- [ ] **Step 2: Run, expect FAIL. Step 3: Implement**

```js
// site/src/museum/reveal.js
export function buildTimeline(narration, cues) {
  const start = new Map(cues.map(c => [c.id, c.startTime]));
  const out = [];
  for (const line of narration) {
    if (!start.has(line.cue)) throw new Error(`cue ${line.cue} not found in audio track`);
    for (const id of line.reveals || []) out.push({ exhibitId: id, at: start.get(line.cue) });
  }
  return out.sort((a, b) => a.at - b.at);
}
export function revealedAt(timeline, t) {
  return new Set(timeline.filter(e => e.at <= t).map(e => e.exhibitId));
}
```
```js
// site/src/museum/capability.js
export function chooseMode({ webgl2, liteParam = false, userPref = null }) {
  if (!webgl2 || liteParam || userPref === 'lite') return 'lite';
  return '3d';
}
export function probeWebGL2() {
  try { const c = document.createElement('canvas'); return !!c.getContext('webgl2'); } catch { return false; }
}
```

- [ ] **Step 4: PASS. Step 5: Commit** `feat(museum): narration cue reveal timeline and Lite mode decision`.

---

### Task 6: Room, materials, lighting, exhibits, 360 document mesh

**Files:**
- Create: `site/src/museum/materials.js`, `site/src/museum/lighting.js`, `site/src/museum/exhibits.js`, `site/src/museum/docmesh.js`, `site/src/museum/room.js`, `site/src/test/docmesh.test.js`, `site/public/tex/` (Poly Haven CC0 plaster and oak at 512 px; record each asset URL and licence in `site/public/tex/CREDITS.md`)

**Interfaces:**
- Consumes: `resolveSlot`, `HEIGHTS`, `ROOM_TYPES` (Task 4).
- Produces: `buildRoom(THREE, chapter, {mediaUrl}) -> {scene, exhibitMeshes: Map<id, THREE.Object3D>, stats}`; `makeDocumentMesh(THREE, {width, height, frontTexture, backTexture}) -> THREE.Mesh` (thin box 1.5 mm, front/back faces mapped; used in room and exported to GLB for `<model-viewer>`); `lightingRig(THREE, scene, {phone}) -> lights[]` (<=4 lights).

- [ ] **Step 1: Failing test for the document mesh geometry**

```js
// site/src/test/docmesh.test.js
import { it, expect } from 'vitest';
import * as THREE from 'three';
import { makeDocumentMesh } from '../museum/docmesh.js';
it('is a thin paper box with front and back materials', () => {
  const m = makeDocumentMesh(THREE, { width: 0.216, height: 0.279, frontTexture: null, backTexture: null });
  m.geometry.computeBoundingBox();
  const s = new THREE.Vector3(); m.geometry.boundingBox.getSize(s);
  expect(s.x).toBeCloseTo(0.216); expect(s.y).toBeCloseTo(0.279); expect(s.z).toBeCloseTo(0.0015);
  expect(m.material.length).toBe(6);
  expect(m.userData.kind).toBe('document');
});
```

- [ ] **Step 2: Run, FAIL. Step 3: Implement**

```js
// site/src/museum/docmesh.js
export function makeDocumentMesh(THREE, { width, height, frontTexture, backTexture }) {
  const geo = new THREE.BoxGeometry(width, height, 0.0015);
  const edge = new THREE.MeshStandardMaterial({ color: 0xe9e2d0, roughness: 0.9 });
  const face = t => new THREE.MeshStandardMaterial({ map: t || null, color: t ? 0xffffff : 0xf3eee2, roughness: 0.85 });
  const mesh = new THREE.Mesh(geo, [edge, edge, edge, edge, face(frontTexture), face(backTexture)]);
  mesh.userData.kind = 'document';
  return mesh;
}
```
`materials.js`: `createMaterials(THREE, loader)` returns `{plaster, oak, accent(hex), frame, glass}` using MeshStandardMaterial with the 512 px textures; glass = MeshStandardMaterial `{transparent: true, opacity: 0.18, roughness: 0.05}` (no transmission).
`lighting.js`:
```js
export function lightingRig(THREE, scene, { phone }) {
  const amb = new THREE.HemisphereLight(0xfff6ea, 0x3a332c, 0.35);
  const spots = [-2.5, 0, 2.5].map(x => {
    const s = new THREE.SpotLight(0xffe9cc, phone ? 18 : 24, 9, Math.PI / 7, 0.5, 2);
    s.position.set(x, 4.2, 1.5); s.target.position.set(x, 1.6, -5.9); scene.add(s.target); return s;
  });
  spots[1].castShadow = !phone;
  [amb, ...spots].forEach(l => scene.add(l));
  return [amb, ...spots];
}
```
`exhibits.js`: `makeExhibit(THREE, ex, mats, texture)` returns a Group: `framed-document` and `framed-photograph` = frame box + inset plane with the media texture (aspect from texture), `wall-quote` = plane with canvas-rendered text (text comes from chapter data), `360 document` = `makeDocumentMesh` on a low reading rail at `HEIGHTS.caseTop`. Every group sets `userData.exhibitId` and a small number disc mesh above it (hidden until revealed).
`room.js`:
```js
import { ROOM_TYPES, resolveSlot } from './layout.js';
import { createMaterials } from './materials.js';
import { lightingRig } from './lighting.js';
import { makeExhibit } from './exhibits.js';
export async function buildRoom(THREE, chapter, { textures, phone }) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a2622);
  const mats = await createMaterials(THREE, textures);
  const r = ROOM_TYPES['chapter-gallery'];
  const shell = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.d), mats.oak); floor.rotation.x = -Math.PI / 2; shell.add(floor);
  const wall = (w, h, x, z, ry, m) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, h / 2, z); p.rotation.y = ry; shell.add(p); };
  wall(r.w, r.h, 0, -r.d / 2, 0, mats.accent(chapter.accent));
  wall(r.w, r.h, 0, r.d / 2, Math.PI, mats.plaster);
  wall(r.d, r.h, -r.w / 2, 0, Math.PI / 2, mats.plaster);
  wall(r.d, r.h, r.w / 2, 0, -Math.PI / 2, mats.plaster);
  scene.add(shell);
  lightingRig(THREE, scene, { phone });
  const exhibitMeshes = new Map();
  for (const ex of chapter.exhibits) {
    const g = makeExhibit(THREE, ex, mats, textures.media[ex.media_id]);
    const p = resolveSlot(r, ex.wall, ex.slot); g.position.set(p.x, p.y, p.z); g.rotation.y = p.rotY;
    scene.add(g); exhibitMeshes.set(ex.id, g);
  }
  return { scene, exhibitMeshes };
}
```
For `reconstructed-place` chapters, `buildRoom` dispatches to `buildReconstructedPlace` (Task 9).

- [ ] **Step 4: `npm test` PASS. Step 5: Commit** `feat(museum): gallery room, materials, lighting, exhibits, 360 document mesh`.

---

### Task 7: Chapter page: scene wiring, camera flights, numbered list, panel

**Files:**
- Create: `site/src/museum/camera.js`, `site/src/museum/scene.js`, `site/src/ui/panel.js`, `site/src/ui/sources.js`, `site/src/content/load.js`, `site/src/pages/[slug]/[chapter].astro`, `site/e2e/chapter.spec.js`

**Interfaces:**
- Consumes: `buildRoom`, `buildTimeline`, `revealedAt`, `chooseMode`, `probeWebGL2`.
- Produces: page `/<slug>/<n>/` with: `<canvas id="room">`, `<audio id="narration" controls>` + `<track kind="metadata" id="cues">` and `<track kind="captions">`, `<ol id="exhibits">` of `<button data-exhibit>` (one per exhibit, `hidden` until revealed; a "Show all exhibits" button reveals all), `<aside id="panel">` (side panel >= 900 px, bottom sheet below) containing title, `<model-viewer>` for documents/objects, notes with fact chips, credit, evidence label, reconstruction note, "See the original" link.
- `load.js`: `loadInductee(slug)`, `loadChapter(slug, n)`, `factIndex(slug)` (reads `data/inductees/<slug>/facts.jsonl` and `sources.jsonl` at build time so chips carry source title, institution, date, url).

- [ ] **Step 1: Failing e2e test**

```js
// site/e2e/chapter.spec.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('exhibit list, panel focus and Escape', async ({ page }) => {
  await page.goto('/einstein/1/');
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  const first = page.locator('#exhibits button').first();
  await first.click();
  const panel = page.locator('#panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('link', { name: 'See the original' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(first).toBeFocused();
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(r.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
});
test('missing media shows a notice, room still renders', async ({ page }) => {
  await page.route('**/media/**', r => r.abort());
  await page.goto('/einstein/1/');
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  await page.locator('#exhibits button').first().click();
  await expect(page.locator('#panel')).toContainText('Image unavailable');
});
```
(This test needs Task 10's Einstein content; until then point it at a fixture chapter `content/einstein/chapters/1.json` copied from the Task 2 GOOD fixture with real Einstein ids replaced by fixture ids and a fixture `data/` dir — remove the fixture in Task 10.)

- [ ] **Step 2: Run `npm run e2e -- e2e/chapter.spec.js`, expect FAIL.**

- [ ] **Step 3: Implement**

`camera.js`:
```js
import CameraControls from 'camera-controls';
export function makeCamera(THREE, camera, dom) {
  CameraControls.install({ THREE });
  const cc = new CameraControls(camera, dom);
  cc.minDistance = 0.3; cc.maxDistance = 6;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    controls: cc,
    flyTo(obj) {
      const p = obj.getWorldPosition(new THREE.Vector3());
      const n = new THREE.Vector3(0, 0, 1).applyQuaternion(obj.getWorldQuaternion(new THREE.Quaternion()));
      const eye = p.clone().add(n.multiplyScalar(1.6)).setY(1.6);
      return cc.setLookAt(eye.x, eye.y, eye.z, p.x, p.y, p.z, !reduce());
    },
  };
}
```
`panel.js`: `openPanel(exhibit, opener)` fills the aside, sets `aria-modal="true"` on the bottom-sheet layout and traps Tab within the panel, shows "Image unavailable" when the media `error` event fires, sets focus to the panel heading; `closePanel()` hides it and returns focus to `opener`; Escape and the close button call `closePanel`. Media for documents uses `<model-viewer src="/media/<id>.glb" alt="<exhibit title>" camera-controls>`; the GLB is exported at build time from `makeDocumentMesh` (Task 10 step).
`sources.js`: each fact chip is a `<button aria-expanded>` toggling a `<div role="status">` with source title, institution, date and link (no hover-only behaviour).
`scene.js`: on load, `chooseMode({webgl2: probeWebGL2(), liteParam: new URL(location).searchParams.has('lite'), userPref: localStorage.getItem('voa-mode')})` (wrap localStorage in try/catch); if lite, redirect to `/<slug>/lite/#chapter-n`; else build the room, render on demand (render only when controls change or a flight runs), start the timeline from the metadata track's cues on `loadedmetadata`, reveal list buttons and number discs as `timeupdate` crosses reveal times, and on button click `flyTo` then `openPanel`.

- [ ] **Step 4: Run e2e, expect PASS on both projects. Step 5: Commit** `feat(site): chapter room page with narration reveals, camera flights and accessible panel`.

---

### Task 8: Living portrait player and quotes

**Files:**
- Create: `tools/build_depth.py`, `site/src/ui/portrait.js`, `site/e2e/portrait.spec.js`

**Interfaces:**
- Consumes: painted portrait WebP (from the S5 filter, `spikes/s5-painterly/`, promoted into `tools/paint_portrait.html` usage notes) and depth PNG from `build_depth.py`; quote audio + VTT (Task 3).
- Produces: `<figure class="portrait">` with `<canvas>` parallax (two-layer displacement from depth, breathing scale +-0.6 %, light sweep), the portrait label text, a quote button per quote that plays the quote audio with captions and shows the AI voice label; static image + captions under reduced motion; Pause control for motion.

- [ ] **Step 1: Failing e2e**

```js
// site/e2e/portrait.spec.js
import { test, expect } from '@playwright/test';
test('portrait shows labels and a captioned quote', async ({ page }) => {
  await page.goto('/einstein/1/');
  const fig = page.locator('figure.portrait');
  await expect(fig).toContainText('AI-assisted painted portrait');
  await fig.getByRole('button', { name: /Hear the quote/ }).click();
  await expect(fig).toContainText('AI-generated voice, not Albert Einstein');
  await expect(fig.getByRole('button', { name: 'Pause motion' })).toBeVisible();
});
test('reduced motion shows a still portrait', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage(); await page.goto('/einstein/1/');
  await expect(page.locator('figure.portrait img.still')).toBeVisible();
});
```

- [ ] **Step 2: FAIL. Step 3: Implement** `build_depth.py` (onnxruntime + Depth Anything V2 Small ONNX from onnx-community, Apache-2.0; writes `<slug>-depth.png` 512 px; venv shared with Task 3) and `portrait.js` (WebGL2 shader sampling the portrait with UV offset = (depth - 0.5) * pointer/time drift, max 6 px; falls back to `<img class="still">`).

- [ ] **Step 4: PASS. Step 5: Commit** `feat(portrait): living painted portrait with labeled quote audio`.

---

### Task 9: Reconstructed place room type

**Files:**
- Create: `site/src/museum/reconstruction.js`, `site/src/test/reconstruction.test.js`
- Modify: `site/src/museum/room.js` (dispatch on `chapter.room`)

**Interfaces:**
- Consumes: chapter `reconstruction` block extended with `place`: `{w, d, h, items: [{kind: 'desk'|'chair'|'shelf'|'window'|'door'|'lamp'|'document', x, z, rotY, w, d, h, basis: 'EIN-M-xxxx'}], unseen: ['east', ...]}` — every item cites the basis photo it is visible in.
- Produces: `buildReconstructedPlace(THREE, chapter, opts) -> {scene, exhibitMeshes, viewpoints}`; `validatePlace(place) -> string[]` (pure).

- [ ] **Step 1: Failing tests**

```js
// site/src/test/reconstruction.test.js
import { it, expect } from 'vitest';
import { validatePlace } from '../museum/reconstruction.js';
const ok = { w: 4, d: 5, h: 3, items: [{ kind: 'desk', x: 0, z: -1, rotY: 0, w: 1.2, d: 0.6, h: 0.75, basis: 'EIN-M-0022' }], unseen: ['south'] };
it('accepts items that cite a basis and fit the room', () => expect(validatePlace(ok)).toEqual([]));
it('rejects items without a basis photo', () => {
  expect(validatePlace({ ...ok, items: [{ ...ok.items[0], basis: '' }] }).join()).toMatch(/basis/);
});
it('rejects items outside the room', () => {
  expect(validatePlace({ ...ok, items: [{ ...ok.items[0], x: 9 }] }).join()).toMatch(/outside/);
});
it('rejects unknown item kinds', () => {
  expect(validatePlace({ ...ok, items: [{ ...ok.items[0], kind: 'dragon' }] }).join()).toMatch(/kind/);
});
```

- [ ] **Step 2: FAIL. Step 3: Implement** `validatePlace` (kinds whitelist from the interface; |x| <= w/2, |z| <= d/2; non-empty basis) and `buildReconstructedPlace` (shell from w/d/h with plaster/oak; simple box/cylinder primitives per kind using shared materials; unseen walls rendered in a neutral flat grey with a floor-level label "Not shown in the source photographs"; a visible plaque "Reconstruction based on [basis titles]" with a "See the original photograph" link mirrored in the DOM; viewpoints = 4 stored eye positions for look-around; 360 look via camera-controls rotate with polar limits).

- [ ] **Step 4: PASS. Step 5: Commit** `feat(museum): reconstructed-place rooms built only from photo-evidenced items`.

---

### Task 10: Einstein slice content (from verified facts)

**Files:**
- Create: `content/einstein/inductee.json`, `content/einstein/chapters/1.json` (gallery), `content/einstein/chapters/2.json` (reconstructed place), `content/einstein/audio/*`, `site/public/media/*` (verified media, GLB documents), `site/public/portraits/einstein.webp`, `einstein-depth.png`
- Remove: the Task 7 fixture.

**Interfaces:**
- Consumes: `data/inductees/einstein/` (43 verified facts, 21 verified media as of 2026-10-09; re-check statuses first).

- [ ] **Step 1:** List verified Einstein facts and media; choose chapter 1 "Becoming an American, 1933-1940" (naturalization record EIN-F-0001 + its NARA media) and chapter 2 as a reconstructed place only if a verified basis photo of the place exists (e.g. Bern patent office or Princeton study); if none is verified, make chapter 2 a gallery and record the gap in `content/einstein/GAPS.md`.
- [ ] **Step 2:** Write narration lines using only words from cited claims (content check enforces it), exhibits with `media_id` + `original_media_id`, one verified direct quote (e.g. the 1939 letter to Roosevelt, only if its `is_direct_quote` fact is verified).
- [ ] **Step 3:** Run `python3 tools/content_check.py einstein` until OK.
- [ ] **Step 4:** Build audio (`build_audio.py einstein 1` and `2`), depth map, paint the portrait with the S5 tokens (medium preset), export document GLBs (a small Node script `site/scripts/export-docs.mjs` using three's GLTFExporter on `makeDocumentMesh` with the scan textures).
- [ ] **Step 5:** `npm run build && npm run e2e` all green; `checkBudget` on both rooms logs within budget (add a dev-only overlay that prints `renderer.info` stats).
- [ ] **Step 6: Commit** `feat(einstein): slice content, audio, portrait and documents from verified facts`.

---

### Task 11: Journey map, Lite page, ending chooser, quiz

**Files:**
- Create: `site/src/pages/[slug]/index.astro`, `site/src/pages/[slug]/lite.astro`, `site/src/pages/[slug]/end.astro`, `site/src/ui/quiz.js`, `site/src/test/quiz.test.js`, `site/e2e/lite.spec.js`, `content/einstein/quiz.json`

**Interfaces:**
- `quiz.json`: `[{id, question, options: [{text, correct, explanation, fact_ids}]}]` (all text grounded; extend `content_check.py` to check quiz text the same way, with a test).
- `scoreAnswer(question, optionIndex) -> {correct: boolean, explanation: string, fact_ids: string[]}` (pure).

- [ ] **Step 1: Failing tests**

```js
// site/src/test/quiz.test.js
import { it, expect } from 'vitest';
import { scoreAnswer } from '../ui/quiz.js';
const q = { options: [{ text: 'A', correct: false, explanation: 'No.', fact_ids: ['f1'] }, { text: 'B', correct: true, explanation: 'Yes.', fact_ids: ['f2'] }] };
it('returns correctness with the explanation and sources', () => {
  expect(scoreAnswer(q, 1)).toEqual({ correct: true, explanation: 'Yes.', fact_ids: ['f2'] });
  expect(scoreAnswer(q, 0).correct).toBe(false);
});
it('rejects out-of-range answers', () => expect(() => scoreAnswer(q, 5)).toThrow());
```
```js
// site/e2e/lite.spec.js
import { test, expect } from '@playwright/test';
test('lite page lists the same exhibits as the room, no canvas', async ({ page }) => {
  await page.goto('/einstein/lite/');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'See the original' }).first()).toBeVisible();
});
test('WebGL failure lands in lite', async ({ page }) => {
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await page.goto('/einstein/1/');
  await expect(page).toHaveURL(/\/einstein\/lite\//);
});
test('ending lets the visitor choose quiz or another inductee', async ({ page }) => {
  await page.goto('/einstein/end/');
  await expect(page.getByRole('link', { name: 'Take the quiz' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Other inductees' }).getByRole('link')).toHaveCount(4);
});
```

- [ ] **Step 2: FAIL. Step 3: Implement** the pages (journey map = an SVG map with dated stops from verified facts, each stop links to its chapter; lite = all chapters rendered as HTML sections from the same chapter JSON with transcript, exhibits, quotes, chips; end = quiz link + list "Other inductees" of four cards, those not yet built marked "Coming soon" without links but still counted as list items — adjust the count assertion to items, not links, until all five exist) and `quiz.js`.
- [ ] **Step 3b:** Add `site/src/pages/how-this-was-made.astro` (method: verified-fact pipeline with Codex adversary, painting filter, depth motion, Kokoro voice, evidence tiers, reconstruction rules; links to the fact log exports) and an ambient sound toggle in `Base.astro` (off by default; preference in localStorage wrapped in try/catch; a 30-60 s CC0 room-tone loop, credited in CREDITS.md). Add an e2e assertion that the toggle starts unpressed (`aria-pressed="false"`) and no audio plays on load.
- [ ] **Step 4: PASS. Step 5: Commit** `feat(site): journey map, Lite page, ending chooser, quiz, how-this-was-made, ambient toggle`.

---

### Task 12: WordPress package and embed teaser

**Files:**
- Modify: `tools/export.py` (read `content/<slug>/` when present: chapter titles become headings, narration lines become paragraphs with citations, exhibits become image blocks with credit + "See the original"; still only verified + approved items in final mode)
- Create: `site/public/oembed/einstein.json`, `site/src/pages/embed/[slug].astro` (compact teaser, height <= 1000 px, "Open the full experience" link via WordPress `link` message), tests in `tools/tests/test_export.py` for the new content path

- [ ] **Step 1:** Failing test: export with a content fixture produces a heading per chapter and a "See the original" link per exhibit; HTML-escapes all text.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS + full suite. **Step 5:** Commit `feat(export): WordPress package from experience content; embed teaser`.

---

### Task 13: Device, accessibility and cross-model review gate

**Files:**
- Create: `docs/qa/2026-10-xx-einstein-slice.md` (results)

- [ ] **Step 1:** Deploy a Vercel preview of `site/dist` (ask the user before the first deploy; static only).
- [ ] **Step 2:** Test on iPhone Safari, Android Chrome and a low-end laptop: load time, room renders, budget overlay numbers, flights, panel, portrait, Lite fallback; VoiceOver (iOS/macOS) and NVDA (if available) through one chapter; 200 % zoom; record results.
- [ ] **Step 3:** Paste the WordPress package into WordPress Playground (playground.wordpress.net) and the embed teaser URL into an Embed block; record behaviour.
- [ ] **Step 4:** Run Codex cross-model review of the branch (`codex exec ... read-only`) for correctness, accessibility and gate integrity; fix findings with red-to-root-cause; re-run until GREEN.
- [ ] **Step 5:** Commit QA notes; report to the user; on GREEN, write the four track specs (Track A-D) for fan-out.
