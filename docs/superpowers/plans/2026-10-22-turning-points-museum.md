# Turning-Points Museum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the place-by-place mockup tour into the turning-points museum for all five inductees (chapters, three place tiers, real artifacts, human narration, "Moments That Made Them"), and ship it to a new Vercel preview URL by 2026-11-01 (earlier if possible).

**Architecture:** One data-driven tour engine plays an ordered list of chapters per inductee. Each chapter is a map leg plus a place rendered by one of three stages (full rebuild `RoomStage`, `PhotoRoomStage`, `GalleryCaseStage`) behind one shared HUD. Tour data is generated/validated against the verified-facts store (`IHH-facts`), so nothing unverified or uncleared can ship.

**Tech Stack:** Vite 6, React 19, @react-three/fiber 9, drei 10, GSAP 3, Motion, camera-controls, three-globe; Vitest (new) for data logic; Playwright (from `Challenge IHH/site/node_modules`) for e2e and screenshots; Python 3.12 for data builders and the narration gate; Kokoro-82M for audio; Blender 5 through `assets-src/_queue/blender-lock.sh` for rooms.

**Spec:** `docs/superpowers/specs/2026-10-22-turning-points-museum-design.md`

## Global Constraints

- Hard deadline 2026-11-01; ship earlier if possible. Automated tour-research pipeline step done by 2026-11-03 (separate plan, written after the museum ships).
- Order: Einstein end to end first (target 2026-10-25), then the other four two at a time (2026-10-25..29), then polish + ship (2026-10-30..11-01).
- Only facts with status `verified` may appear or be spoken; unresolved conflicts are omitted.
- Media shown only if verified and `license_class` in {public-domain, cc0, cc-by}; `LINK_ONLY` media never display an image.
- Room tiers: 70-80% of each inductee's rooms full rebuilds; otherwise photo room; gallery case only when no usable photo of the place exists.
- Chapter kinds and order: birth, education, leaving, arriving, first-work, citizen, big-work, history, honoured, legacy.
- Room budgets: desktop glb ≤ 10 MB, mobile glb ≤ 5 MB.
- Machine: 8 GB M1. Blender only via `assets-src/_queue/blender-lock.sh`; `nice -n 10` for builds/Playwright; at most two heavy agents; keep ≥ 15 GB free (`scripts/disk-check.sh`).
- Copy: Tapestry tokens only (`app/src/design/tokens.css`), Poppins + Fraunces, no emoji, no marketing words.
- Deploy, push, or any publish step needs the owner's explicit approval each time.
- Node 20: `export PATH=/usr/local/bin:$PATH`. Python: `export PATH=~/.pyenv/shims:$PATH`.
- IHH chatbot provenance (always, owner 2026-10-22): every task that adds content (facts, media, rooms, recreations, narration, artifacts) also records it machine-readably for IHH's chatbot (provenance.jsonld / site-provenance.jsonld / CSVs / METHOD.md). A task without its provenance record is not done; reviewers check this.
- Registry additions for Gothenburg City Museum, Wien Museum and McCord were declined: their items stay reference-only (no textures, no display). Exception (owner ruling 2026-10-24): the Wien Museum postcard LAM-M-0029 is CC0 by the holder's statement and textures the Vienna cemetery room.

## Review Focus

1. A chapter whose place tier is `gallery` while a usable (embeddable) basis photo exists for it — expect the validator to reject it (photo room first). Test in Task 2.
2. A fact or media id referenced by tour data that is not verified / not cleared (e.g. after a re-judge flips it) — expect the build to fail with the id named. Test in Task 3.
3. A visitor deep-links to `?inductee=lamarr&chapter=education` (a chapter Lamarr does not have) — expect the tour to start at her first existing chapter, not crash. Test in Task 2.
4. Audio blocked or muted (no user gesture, M pressed, screen reader) — captions still advance and stops still work. Test in Task 5.
5. Phone portrait (390x844) in every place tier — guide, title block, stop dots and caption never overlap or crop. Test in Task 4 (e2e layout check).

---

## File Structure

| Path | Responsibility |
|---|---|
| `scripts/disk-check.sh` | Fails (exit 1) when free space < 15 GB |
| `app/vitest.config.js`, `app/src/**/*.test.js` | Unit tests for data logic |
| `app/scripts/build_fact_index.py` | Writes `app/src/tour/data/facts.generated.json` (verified facts + cleared media) from `IHH-facts` |
| `app/src/tour/data/chapters.js` | `CHAPTER_KINDS`, `chapter()` helper, `validateTour()`, `resolveChapter()` |
| `app/src/tour/data/<slug>.js` | Each inductee's chapter list (rewritten from the step list) |
| `app/src/tour/place/PhotoRoomStage.jsx`, `GalleryCaseStage.jsx` | Data-driven versions of the demos |
| `app/src/tour/ChapterPlayer.jsx` | Plays chapter: map leg -> place stage -> next |
| `app/src/tour/moments/` | "Moments That Made Them" (replaces `constellation/`) |
| `app/scripts/check_content.mjs` | Build gate: every visible id verified/cleared |
| `app/e2e/*.mjs` | Playwright walks and layout checks |
| `assets-src/audio/narration/<slug>.json` | Chapter openings + lines (gated by `check_narration.py`) |
| `app/embed.html` | WordPress embed page |

---

## Phase 0 — Hygiene (2026-10-22)

### Task 1: Disk guard and unit-test harness

**Files:**
- Create: `scripts/disk-check.sh`, `app/vitest.config.js`, `app/src/tour/data/sanity.test.js`
- Modify: `app/package.json` (scripts `test`, devDependency `vitest`)

**Interfaces:**
- Produces: `npm test` (vitest run) and `scripts/disk-check.sh [min_gb]` used before every heavy task.

- [ ] **Step 1: Write the disk guard**

```sh
#!/bin/sh
# Exit 1 when free space on the data volume is below MIN GB (default 15).
MIN=${1:-15}
FREE=$(df -g /System/Volumes/Data | awk 'NR==2{print $4}')
if [ "$FREE" -lt "$MIN" ]; then echo "LOW DISK: ${FREE} GB free (< ${MIN})"; exit 1; fi
echo "disk ok: ${FREE} GB free"
```

- [ ] **Step 2: Run it** — `sh scripts/disk-check.sh` → `disk ok: NN GB free`. If it fails, clear `~/.npm` (`npm cache clean --force`), `brew cleanup -s`, finished agents' scratch caches, `app/dist`, before continuing.
- [ ] **Step 3: Install vitest** — `cd app && npm i -D vitest@3` and add `"test": "vitest run"` to scripts; `vitest.config.js`:

```js
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { environment: 'node', include: ['src/**/*.test.js'] } })
```

- [ ] **Step 4: Sanity test** — `src/tour/data/sanity.test.js`:

```js
import { test, expect } from 'vitest'
import { INDUCTEES } from './index.js'
test('five inductees are registered', () => {
  expect(Object.keys(INDUCTEES).sort()).toEqual(['albright', 'einstein', 'lamarr', 'muir', 'naismith'])
})
```

- [ ] **Step 5:** `nice -n 10 npm test` → 1 passed.
- [ ] **Step 6: Commit** — `git add scripts/disk-check.sh app/vitest.config.js app/package.json app/package-lock.json app/src/tour/data/sanity.test.js && git commit -m "chore: disk guard and vitest harness"`

---

## Phase 1 — Einstein end to end (2026-10-23..25)

### Task 2: Chapter model and validator

**Files:**
- Create: `app/src/tour/data/chapters.js`, `app/src/tour/data/chapters.test.js`

**Interfaces:**
- Consumes: `facts.generated.json` shape from Task 3 (`{ facts: { [id]: { claim } }, media: { [id]: { embeddable: boolean, basisFor: string[] } } }`).
- Produces:
  - `CHAPTER_KINDS: string[]` (ordered)
  - `chapter({ id, kind, title, place, map?, opening, stops, factIds }) → object`
  - `validateTour(tour, index) → string[]` (error messages; empty = valid)
  - `resolveChapter(tour, key) → number` (index of chapter for `key` = chapter kind, chapter id or fact id; falls back to 0)
  - place shapes: `{ tier: 'room', room }` | `{ tier: 'photo', photo: { mediaId, ... } }` | `{ tier: 'gallery', basisCandidates?: string[] }`

- [ ] **Step 1: Write the failing tests**

```js
import { test, expect } from 'vitest'
import { CHAPTER_KINDS, chapter, validateTour, resolveChapter } from './chapters.js'

const index = {
  facts: { 'X-F-1': { claim: 'born' }, 'X-F-2': { claim: 'arrived' } },
  media: { 'X-M-1': { embeddable: true, basisFor: ['X-F-2'] }, 'X-M-9': { embeddable: false, basisFor: [] } },
}
const mk = (kind, extra = {}) => chapter({ id: kind, kind, title: kind, opening: 'o', stops: [], factIds: ['X-F-1'], place: { tier: 'gallery' }, ...extra })

test('kinds are in spec order', () => {
  expect(CHAPTER_KINDS).toEqual(['birth', 'education', 'leaving', 'arriving', 'first-work', 'citizen', 'big-work', 'history', 'honoured', 'legacy'])
})
test('rejects an unverified fact id', () => {
  const tour = { slug: 'x', chapters: [mk('birth', { factIds: ['X-F-404'] })] }
  expect(validateTour(tour, index)).toContain('birth: fact X-F-404 is not verified')
})
test('rejects chapters out of order', () => {
  const tour = { slug: 'x', chapters: [mk('arriving'), mk('birth')] }
  expect(validateTour(tour, index)).toContain('chapters out of order at arriving -> birth')
})
test('gallery is rejected when an embeddable basis photo exists (photo room first)', () => {
  const tour = { slug: 'x', chapters: [mk('arriving', { factIds: ['X-F-2'] })] }
  expect(validateTour(tour, index)).toContain('arriving: use a photo room (embeddable basis photo X-M-1 exists)')
})
test('photo tier must use an embeddable photo', () => {
  const tour = { slug: 'x', chapters: [mk('birth', { place: { tier: 'photo', photo: { mediaId: 'X-M-9' } } })] }
  expect(validateTour(tour, index)).toContain('birth: photo X-M-9 is not cleared')
})
test('resolveChapter falls back to the first chapter for a kind the inductee lacks', () => {
  const tour = { slug: 'x', chapters: [mk('birth'), mk('arriving', { factIds: ['X-F-2'], place: { tier: 'photo', photo: { mediaId: 'X-M-1' } } })] }
  expect(resolveChapter(tour, 'education')).toBe(0)
  expect(resolveChapter(tour, 'arriving')).toBe(1)
  expect(resolveChapter(tour, 'X-F-2')).toBe(1)
})
```

- [ ] **Step 2:** `npm test -- chapters` → FAIL (module not found).
- [ ] **Step 3: Implement**

```js
export const CHAPTER_KINDS = ['birth', 'education', 'leaving', 'arriving', 'first-work', 'citizen', 'big-work', 'history', 'honoured', 'legacy']

export const chapter = (c) => ({ map: null, ...c })

export function validateTour(tour, index) {
  const errs = []
  let last = -1
  for (const c of tour.chapters) {
    const k = CHAPTER_KINDS.indexOf(c.kind)
    if (k < 0) errs.push(`${c.id}: unknown kind ${c.kind}`)
    if (k < last) errs.push(`chapters out of order at ${tour.chapters[tour.chapters.indexOf(c) - 1].id} -> ${c.id}`)
    last = Math.max(last, k)
    for (const f of c.factIds) if (!index.facts[f]) errs.push(`${c.id}: fact ${f} is not verified`)
    const p = c.place
    if (p.tier === 'photo' && !index.media[p.photo.mediaId]?.embeddable) errs.push(`${c.id}: photo ${p.photo.mediaId} is not cleared`)
    if (p.tier === 'gallery') {
      const usable = Object.entries(index.media).find(([, m]) => m.embeddable && m.basisFor.some((f) => c.factIds.includes(f)))
      if (usable) errs.push(`${c.id}: use a photo room (embeddable basis photo ${usable[0]} exists)`)
    }
  }
  return errs
}

export function resolveChapter(tour, key) {
  if (!key) return 0
  const i = tour.chapters.findIndex((c) => c.id === key || c.kind === key || c.factIds.includes(key))
  return i < 0 ? 0 : i
}
```

- [ ] **Step 4:** `npm test -- chapters` → 6 passed.
- [ ] **Step 5: Commit** — `git add app/src/tour/data/chapters.js app/src/tour/data/chapters.test.js && git commit -m "feat(tour): chapter model and validator"`

### Task 3: Verified fact/media index and the build content gate

**Files:**
- Create: `app/scripts/build_fact_index.py`, `app/scripts/test_build_fact_index.py`, `app/scripts/check_content.mjs`, `app/src/tour/data/facts.generated.json` (generated, committed)
- Modify: `app/package.json` (`"prebuild": "python3 scripts/build_fact_index.py && node scripts/check_content.mjs"`)

**Interfaces:**
- Consumes: `IHH-facts/data/inductees/<slug>/{facts,media}.jsonl` (path via env `IHH_FACTS`, default `../../IHH-facts`).
- Produces: `facts.generated.json` = `{ facts: { [id]: { claim, slug } }, media: { [id]: { embeddable, basisFor: [factIds], title, holder, rights } } }`; `check_content.mjs` exits 1 listing every fact/media id used in `src/tour/data/*.js`, `artifacts*.js`, landing data and narration JSON that is missing from the index.

- [ ] **Step 1: Failing test** (`app/scripts/test_build_fact_index.py`, run with `python3 -m pytest app/scripts -q`):

```python
import json
from build_fact_index import build

def test_only_verified_and_cleared(tmp_path):
    d = tmp_path / "data/inductees/x"; d.mkdir(parents=True)
    (d / "facts.jsonl").write_text(
        json.dumps({"id": "X-F-1", "status": "verified", "claim": "a"}) + "\n" +
        json.dumps({"id": "X-F-2", "status": "single-source", "claim": "b"}) + "\n")
    (d / "media.jsonl").write_text(
        json.dumps({"id": "X-M-1", "status": "verified", "license_class": "public-domain", "basis_for": ["X-F-1"], "title": "t", "credit": "h"}) + "\n" +
        json.dumps({"id": "X-M-2", "status": "verified", "license_class": "unknown", "title": "t"}) + "\n" +
        json.dumps({"id": "X-M-3", "status": "disputed", "license_class": "cc0", "title": "t"}) + "\n")
    out = build(tmp_path)
    assert list(out["facts"]) == ["X-F-1"]
    assert out["media"]["X-M-1"]["embeddable"] is True
    assert out["media"]["X-M-2"]["embeddable"] is False
    assert "X-M-3" not in out["media"]
```

- [ ] **Step 2:** run → FAIL (no module).
- [ ] **Step 3: Implement**

```python
"""Write app/src/tour/data/facts.generated.json: verified facts and verified media, with an
'embeddable' flag (public-domain / cc0 / cc-by). The tour may show nothing else."""
import json, os, sys
from pathlib import Path

CLEARED = {"public-domain", "cc0", "cc-by"}

def _rows(p):
    return [json.loads(l) for l in p.read_text().splitlines() if l.strip()] if p.exists() else []

def build(root):
    out = {"facts": {}, "media": {}}
    for d in sorted((Path(root) / "data/inductees").iterdir()):
        for f in _rows(d / "facts.jsonl"):
            if f.get("status") == "verified":
                out["facts"][f["id"]] = {"claim": f["claim"], "slug": d.name}
        for m in _rows(d / "media.jsonl"):
            if m.get("status") == "verified":
                out["media"][m["id"]] = {
                    "embeddable": m.get("license_class") in CLEARED,
                    "basisFor": m.get("basis_for", []),
                    "title": m.get("title"), "holder": m.get("credit"), "rights": m.get("license_class"),
                }
    return out

if __name__ == "__main__":
    root = os.environ.get("IHH_FACTS", str(Path(__file__).resolve().parents[2] / "../IHH-facts"))
    target = Path(__file__).resolve().parents[1] / "src/tour/data/facts.generated.json"
    target.write_text(json.dumps(build(root), indent=1, ensure_ascii=False) + "\n")
    print(f"wrote {target}")
```

- [ ] **Step 4:** test → PASS. Run `python3 app/scripts/build_fact_index.py` → file written.
- [ ] **Step 5: Content gate** `app/scripts/check_content.mjs`:

```js
// Build gate: every fact/media id referenced by tour, landing, artifact and narration data must be in
// facts.generated.json (verified; media also embeddable unless listed in LINK_ONLY). Exit 1 otherwise.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
const root = new URL('..', import.meta.url).pathname
const index = JSON.parse(readFileSync(join(root, 'src/tour/data/facts.generated.json'), 'utf8'))
const linkOnly = new Set((readFileSync(join(root, 'src/tour/data/artifacts.js'), 'utf8').match(/LINK_ONLY\s*=\s*new Set\(\[([^\]]*)\]/) || [, ''])[1].match(/[A-Z]{3}-M-\d{4}/g) || [])
const files = [
  ...readdirSync(join(root, 'src/tour/data')).filter((f) => f.endsWith('.js') && !f.endsWith('.test.js')).map((f) => join(root, 'src/tour/data', f)),
  join(root, 'src/landing/data/inductees.json'),
  ...readdirSync(join(root, '../assets-src/audio/narration')).map((f) => join(root, '../assets-src/audio/narration', f)),
]
const bad = []
for (const f of files) {
  const t = readFileSync(f, 'utf8')
  for (const id of new Set(t.match(/\b[A-Z]{3}-F-\d{4}\b/g) || [])) if (!index.facts[id]) bad.push(`${f}: fact ${id} not verified`)
  for (const id of new Set(t.match(/\b[A-Z]{3}-M-\d{4}\b/g) || [])) {
    if (linkOnly.has(id)) continue
    if (!index.media[id]) bad.push(`${f}: media ${id} not verified`)
    else if (!index.media[id].embeddable) bad.push(`${f}: media ${id} not cleared (add to LINK_ONLY or remove)`)
  }
}
if (bad.length) { console.error(bad.join('\n')); process.exit(1) }
console.log('content gate ok')
```

- [ ] **Step 6:** `node app/scripts/check_content.mjs` — fix every reported id in data files (remove, or move to `LINK_ONLY`) until it prints `content gate ok`. Do not weaken the gate.
- [ ] **Step 7:** add the `prebuild` script; `nice -n 10 npm run build` passes.
- [ ] **Step 8: Commit** — `git add app/scripts app/src/tour/data/facts.generated.json app/package.json && git commit -m "feat(build): verified fact index and content gate"`

### Task 4: Chapter player and the three place stages

**Files:**
- Create: `app/src/tour/ChapterPlayer.jsx`, `app/src/tour/place/PhotoRoomStage.jsx`, `app/src/tour/place/GalleryCaseStage.jsx`, `app/e2e/chapters.mjs`
- Move: `app/mockup-shots/round5/camcheck.mjs` -> `app/e2e/camcheck.mjs` (takes an inductee slug argument)
- Modify: `app/src/tour/index.jsx` (play `tour.chapters` via ChapterPlayer; keep `?viewer=`, `?demo=` routes), `app/src/tour/demo/*` (become thin wrappers over the new stages)

**Interfaces:**
- Consumes: `chapter` objects (Task 2); `RoomStage` (existing, props `{ room, onStop, ... }`); `HudParts` (`TitleBlock`, `StopDots`, `SoundToggle`, `ControlsHint`); `ArtifactViewer`.
- Produces: `<ChapterPlayer tour startChapter onEnd />`; URL `tour.html?inductee=<slug>&chapter=<kind|id|factId>`; `PhotoRoomStage({ chapter })` reads `place.photo = { mediaId, src, camera: { fovDeg, pitchDeg, height }, layers: [...], look: { yawDeg, dolly } }` (the solved camera and proxies from `demo/PhotoRoom.jsx`, moved into data); `GalleryCaseStage({ chapter })` reads `stops` (artifact ids) and `panel: { title, factIds }`.

- [ ] **Step 1:** Move the demo's camera solve, proxies and masks into a data object `place.photo` for Lamarr "arriving"; `PhotoRoomStage` renders any such object. Move the gallery's case layout into `GalleryCaseStage` driven by `stops` (1-6 objects laid out left to right on the bed; a stand for the first `sheet`) and `panel`.
- [ ] **Step 2:** `ChapterPlayer`: for each chapter, if `chapter.map` play the map leg (existing `UnrollMap` with `places/segments`), then mount the stage by `place.tier`; HUD title = `name` + `title · place label`; StopDots from `stops`; "Next chapter" control in the existing next-stop slot; deep link via `resolveChapter`.
- [ ] **Step 3: e2e walk** `app/e2e/chapters.mjs` (Playwright, chromium args `['--use-angle=metal','--enable-gpu']`): for each inductee open `?inductee=<slug>&autostart=1`, press Next through every chapter, assert per chapter: the stage canvas exists, `[data-hud=title]` contains the chapter title, number of `[data-stop]` equals `chapter.stops.length`, no console errors; at 390x844 assert bounding boxes of title block, stop dots, caption and guide-safe area do not intersect. Exit 1 on any failure.
- [ ] **Step 4:** Run with Einstein data only (Task 6 provides it; until then the Lamarr demo chapters) → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat(tour): chapter player with room, photo-room and gallery stages"`

### Task 5: Chapter openings and narration audio

**Files:**
- Modify: `assets-src/audio/narration/einstein.json` (add `chapters: { <kind>: { opening: { text, source, factIds } } }`), `assets-src/audio/check_narration.py` (gate openings), `assets-src/audio/build_guide_audio.py` (render openings), `app/src/tour/ChapterPlayer.jsx` (play opening, fire `ControlsHint` with it), `app/src/shared/guide/speech.js`
- Test: `assets-src/audio/test_openings.py`

**Interfaces:**
- Produces: voice keys `<slug>:ch:<kind>:opening` in the voice manifest; `ControlsHint` gets `trigger` from the opening's start event.

- [ ] **Step 1: Failing test** (`test_openings.py`): an opening whose text adds a date not in its facts fails `check_narration`; a valid opening (place + date + detail + invitation, all content words from the cited facts or the allowed connective list incl. "Take a moment", "look around", "walk") passes.

```python
from check_narration import check_line
FACTS = {"EIN-F-0149": "the Nobel Lecture was delivered to the Nordic Assembly of Naturalists at Gothenburg, July 11, 1923"}
def test_rejects_new_date():
    assert check_line("Gothenburg, 1925. Take a moment and look around.", ["EIN-F-0149"], FACTS)
def test_accepts_grounded_opening():
    assert not check_line("Gothenburg, July 1923. He gave his Nobel Lecture here. Take a moment and look around.", ["EIN-F-0149"], FACTS)
```

- [ ] **Step 2:** run → FAIL if `check_line` lacks opening support; extend `check_narration.py` (connective allowlist; dates/numbers/content words must come from cited facts) until both pass.
- [ ] **Step 3:** Write Einstein openings for every chapter in the approved style (place + date, one human detail, invitation). Run `python3 assets-src/audio/check_narration.py einstein` → 0 failures.
- [ ] **Step 4:** Render audio (sequential, niced): `nice -n 10 python3 assets-src/audio/build_guide_audio.py --slug einstein` → `--check` reports 0 missing.
- [ ] **Step 5:** Wire: opening plays on place arrival after Begin; `ControlsHint` shows with it for 8 s; with audio blocked/muted, the caption still shows and advances on its timing (Review Focus 4) — add to `app/e2e/chapters.mjs`: launch with `--autoplay-policy=user-gesture-required`, no gesture, assert caption text appears and stop clicks still open objects.
- [ ] **Step 6: Commit** — `git commit -m "feat(guide): chapter openings, gated and voiced"`

### Task 6: Einstein chapters (data, rooms, artifacts, pipe)

**Files:**
- Modify: `app/src/tour/data/einstein.js` (rewrite as `chapters`), `app/src/tour/data/einstein-artifacts.js`, `app/src/tour/data/room-poses.json`
- Create: `assets-src/einstein-pipe/` (Blender, via lock) → `app/public/artifacts/einstein/pipe.glb`

**Interfaces:**
- Consumes: `IHH-facts/data/inductees/einstein/{ROOMS,ARTIFACTS}.md`, rooms from `assets-src/_queue/PROGRESS.md` (study, mercer-street-front, trenton-courtroom, gothenburg-lecture-hall, battery-1933, ulm).
- Produces: `EINSTEIN = { slug, name, chapters: [...] }` passing `validateTour`.

- [ ] **Step 1:** Write chapters from ROOMS.md (only verified facts): birth (Ulm room or photo), leaving (gallery: renounced citizenship 1933), arriving (Battery), citizen (Trenton courtroom; label "the courthouse"), big-work (study: Brunauer letter series, Navy photos), history (gallery: FDR letter EIN-M-0063), honoured (Gothenburg lecture hall: Nobel EIN-F-0146..0148), legacy (Mercer St front → study). Room not yet built → `place.tier: 'photo'` with its basis photo until the room lands (validator enforces cleared photo).
- [ ] **Step 2:** Add a unit test `einstein.test.js`: `validateTour(EINSTEIN, index)` → `[]`.
- [ ] **Step 3:** Poses/guide spots for each landed room (search script as before), then `node app/e2e/camcheck.mjs einstein` → 0 failures.
- [ ] **Step 4: Pipe** (approved recreation, labelled, no history): model from the NMAH reference photos (reference only) in Blender via `assets-src/_queue/blender-lock.sh`; glTF ≤ 2 MB; record kind `model` with label "Recreation from reference photographs; not the original object" and no fact lines; place it on the study desk as stop.
- [ ] **Step 5:** `npm test && node app/scripts/check_content.mjs && node app/e2e/chapters.mjs einstein` → all pass.
- [ ] **Step 6: Commit** — `git commit -m "feat(einstein): turning-point chapters with rooms and artifacts"`

### Task 7: Landing turning points

**Files:**
- Modify: `app/src/landing/data/build_inductees.py` (points = chapters; skip `LINK_ONLY` and non-embeddable media), `app/src/landing/InducteeScroll.jsx`, `app/src/landing/data/inductees.json` (generated)
- Test: `app/src/landing/data/test_build_inductees.py`

**Interfaces:**
- Consumes: `app/src/tour/data/<slug>.js` chapters (exported to JSON by `app/scripts/export_chapters.mjs`, created here: writes `app/src/tour/data/chapters.generated.json` `{ [slug]: [{ id, kind, title, factIds, thumbMediaId }] }`).
- Produces: landing points `{ id: chapterId, kind, label, thumb? }`; "Tour from here" → `tour.html?inductee=<slug>&chapter=<id>`.

- [ ] **Step 1: Failing test:** a chapter whose thumb media is in LINK_ONLY gets `thumb: null`; a chapter kind missing for the inductee produces no point.

```python
from build_inductees import points_for
def test_link_only_thumb_dropped():
    pts = points_for([{"id": "arriving", "kind": "arriving", "title": "Arriving", "factIds": [], "thumbMediaId": "NAI-M-0004"}],
                     media={"NAI-M-0004": {"embeddable": False}}, link_only={"NAI-M-0004"})
    assert pts[0]["thumb"] is None
```

- [ ] **Step 2:** run → FAIL; implement `points_for` in `build_inductees.py`; PASS.
- [ ] **Step 3:** Render up to 10 turning-point objects around the portrait (ring layout scales from 4 to 10; phone: 2-column chip list); open/close/hide-others behaviour unchanged.
- [ ] **Step 4:** e2e: `app/e2e/landing.mjs` clicks each Einstein point → card opens with others hidden → "Tour from here" lands on that chapter's title.
- [ ] **Step 5: Commit** — `git commit -m "feat(landing): turning points around each portrait"`

### Task 8: Moments That Made Them

**Files:**
- Create: `app/src/tour/moments/Moments.jsx`, `moments.css`, `app/src/tour/moments/moments.js`, `moments.test.js`
- Delete: `app/src/tour/constellation/` (after porting the layout code); rename URL `?view=moments`; HUD bottom-left link "Moments That Made Them"

**Interfaces:**
- Produces: `momentsIndex(tours) → [{ slug, name, chapterId, kind, title, year, thumbMediaId }]`, `filterByKind(items, kind)`, `byTimeline(items)`.

- [ ] **Step 1: Failing tests**

```js
import { test, expect } from 'vitest'
import { momentsIndex, filterByKind, byTimeline } from './moments.js'
const tours = { a: { slug: 'a', name: 'A', chapters: [{ id: 'c1', kind: 'citizen', title: 'C', year: 1940, factIds: [] }] },
                b: { slug: 'b', name: 'B', chapters: [{ id: 'c2', kind: 'citizen', title: 'C', year: 1903, factIds: [] }, { id: 'x', kind: 'birth', title: 'B', year: 1838, factIds: [] }] } }
test('filter by kind puts all citizens side by side', () => {
  expect(filterByKind(momentsIndex(tours), 'citizen').map((m) => m.slug)).toEqual(['a', 'b'])
})
test('timeline sorts by year', () => {
  expect(byTimeline(momentsIndex(tours)).map((m) => m.year)).toEqual([1838, 1903, 1940])
})
```

- [ ] **Step 2:** FAIL → implement → PASS.
- [ ] **Step 3:** UI: timeline across all five (grid placement from the constellation index, no overlaps — reuse its collision check), kind filter chips, shuffle; item opens `?inductee=&chapter=`. No "constellation" wording anywhere (`grep -ri constellation app/src` → only git history).
- [ ] **Step 4: Commit** — `git commit -m "feat: Moments That Made Them timeline"`

### Task 9: Einstein preview deploy (owner approval required)

- [ ] **Step 1:** `sh scripts/disk-check.sh`; `nice -n 10 npm run build` (prebuild gate passes); `node app/e2e/chapters.mjs einstein`.
- [ ] **Step 2:** Ask the owner for approval to deploy to a NEW Vercel project (not `voices-of-arrival`). Only after yes: stage `app/dist` to the scratchpad, `vercel link --yes --project ihh-turning-points --scope ihh4`, delete `.env.local`/`.gitignore` it creates, `vercel deploy --yes` (preview), `vercel inspect` confirms target preview; verify `/.env.local` 404 and models cached.
- [ ] **Step 3:** Send the owner the preview URL. Update handoff.

---

## Phase 2 — The other four (2026-10-25..29), two at a time

Each of Tasks 10-13 follows the same steps; run Lamarr + Naismith together, then Muir + Albright.

**Steps for each inductee `<slug>`:**
- [ ] **Step 1:** Rewrite `app/src/tour/data/<slug>.js` as chapters from `IHH-facts/data/inductees/<slug>/ROOMS.md` + `ARTIFACTS.md` (verified facts only; room tier if built, else photo room with its cleared basis photo, gallery only where no usable photo).
- [ ] **Step 2:** `<slug>.test.js`: `expect(validateTour(<TOUR>, index)).toEqual([])` → PASS.
- [ ] **Step 3:** Artifacts into `app/src/tour/data/<slug>-artifacts.js` (viewer records from ARTIFACTS.md; LINK_ONLY ids added first).
- [ ] **Step 4:** Openings + lines in `assets-src/audio/narration/<slug>.json`; `check_narration.py <slug>` 0 failures; render audio sequentially.
- [ ] **Step 5:** Poses/guide spots for landed rooms; `node app/e2e/camcheck.mjs <slug>` 0 failures; `node app/e2e/chapters.mjs <slug>` passes desktop + 390x844.
- [ ] **Step 6:** Commit `feat(<slug>): turning-point chapters`.

### Task 10: Lamarr (+ frequency-hopping mechanism recreation)
Extra: model the mechanism from the PD patent drawings (LAM-M-0001 drawing sheets) in Blender via the lock; record kind `model` labelled "Recreation from the patent drawings (U.S. Patent 2,292,387)"; notes pinned only with verified lines (LAM-F-0090..0095); gallery stop in "The invention".

### Task 11: Naismith (+ peach basket and ball recreation)
Extra: peach basket and ball as `model` records labelled "Recreation; the originals were not preserved" with no fact lines unless verified; placed in the Springfield gym chapter.

### Task 12: Muir

### Task 13: Albright (+ pins in official photographs)
Extra: the six federal photos (ALB-M-0057/0059/0061/0070/0071/0017) as `photo` records with holder captions; only ALB-M-0059 shows the eagle-pin line (ALB-F-0136 only if verified; else caption without the pin) and a link-only "See the brooch at the holder".

### Task 14: Rooms landing continuously (owner of integration: the lead)
- [ ] Each time `assets-src/_queue/PROGRESS.md` gets a new room: switch that chapter from photo to room tier, add poses, run camcheck + chapters e2e for that inductee, commit `feat(<slug>): <room-id> room`. Track the per-inductee full-rebuild ratio; if below 70% on 2026-10-29, report which rooms fell back and why.

---

## Phase 3 — Polish and ship (2026-10-30..11-01)

### Task 15: Accessibility and phone pass
- Modify: shared HUD/stage components as findings require. Create `app/e2e/a11y.mjs` (`@axe-core/playwright` from `Challenge IHH/site/node_modules`).
- [ ] Run axe on landing, one chapter per tier, Moments, viewer → 0 serious/critical violations; keyboard-only walk (Tab, 1-9, M, Esc, arrows) completes Einstein's tour; reduced-motion run shows cuts; 390x844 layout checks pass for all inductees. Commit fixes.

### Task 16: Performance budgets
- Create `app/scripts/check_budgets.mjs`: fails if any `public/models/*/*.glb` > 10 MB or `*-mobile.glb` > 5 MB, or the initial JS chunk > 600 KB gzip.
- [ ] Code-split stages, map, viewer, Moments; lazy-load rooms per chapter; DPR cap 1.5 on phones. `node app/scripts/check_budgets.mjs` passes. Commit.

### Task 17: WordPress embed
- Create `app/embed.html` (+ Vite input): minimal page with a "Start the museum" poster and a fullscreen button that opens the tour inside the iframe; an "Open the museum" link card fallback.
- [ ] Test inside a host page that inserts the iframe exactly as WordPress does (`sandbox="allow-scripts allow-same-origin allow-popups"` variants; LESSONS 2026-10-09): fullscreen, audio after tap, external source links open. Commit.

### Task 18: IHH package (data for IHH's chatbot)
- Create: `app/scripts/export_site_provenance.py` + test `app/scripts/test_export_site_provenance.py`
- [ ] **Failing test first:** given one room folder (SOURCES.md table + INVENTORY.md + nodes.json) and one narration JSON, the exporter emits JSON-LD with (a) the room as a `CreativeWork` (recreation) `isBasedOn` each basis photo's media id + holder + rights, and each modelled object with the photo that shows it; (b) every spoken line as a `Claim`-linked `SpeakableSpecification` citing its fact ids; (c) every viewer record with its media id. Run → FAIL; implement → PASS.
- [ ] Merge `revamp/facts` into `revamp/mockups`; in IHH-facts run `python3 tools/validate.py --all` (exit 0) and `python3 tools/export.py --all --preview`.
- [ ] Run the exporter → `data/export/site-provenance.jsonld` (rooms, recreations, narration-to-fact map, artifacts shown) next to the existing `provenance.jsonld` and CSVs (facts, sources, media incl. basis photos and authorship, every search).
- [ ] Add `data/export/ROOMS-INDEX.md` (plain-language index linking each inductee's TOUR-RESEARCH, ARTIFACTS, ROOMS, CONFLICTS and each room's SOURCES/INVENTORY) and update METHOD.md (counts; how rooms and recreations were sourced; the rights rules in plain words). Commit.

### Task 19: Cross-model review, final deploy, ship message
- [ ] `sh scripts/disk-check.sh`; full gate: `npm test`, `npm run lint` (0 errors), `npm run build` (content gate), `node app/scripts/check_budgets.mjs`, all e2e, `python3 -m pytest app/scripts assets-src/audio -q`, IHH-facts `pytest tools` + `validate --all`.
- [ ] Codex push-readiness review of the branch (model per `~/.codex/models_cache.json`); fix every finding at the root (red-to-root-cause); re-review until green.
- [ ] Ask the owner for deploy approval; deploy the final build to the preview project; verify.
- [ ] Tell the owner "the museum is shipped" with the URL, and remind them: the automated tour-research step is due 2026-11-03 (start now?) and ask whether IHH wants the standalone API runner.
