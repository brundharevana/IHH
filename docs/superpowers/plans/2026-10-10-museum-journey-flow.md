# Museum Journey Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Turn the journey globe into the museum map: pin -> aerial zoom -> room through a door -> continuous story room to room.

**Architecture:** Static Astro pages, unchanged routes. Aerial image stacks are pre-rendered at build time by a stdlib Python script and committed. The globe page plays the zoom sequences; room pages play door entry and exit. Story state lives in the URL (`?story=1&from=<stop>`).

**Tech Stack:** Astro 5, three.js 0.186, camera-controls 3.1.2, Python 3 stdlib (tools/), Vitest, Playwright.

**Spec:** docs/superpowers/specs/2026-10-10-museum-journey-flow-design.md (extends docs/superpowers/specs/2026-10-09-voices-of-arrival-design.md). Research: docs/research/direction/B7-aerial-zoom.md.

## Global Constraints
- Free/open imagery only: USGS NAIP (US), swisstopo SWISSIMAGE (Bern), LGL-BW DOP20 (Ulm), OpenStreetMap via Overpass for labels. No OSM tiles, OpenFreeMap or EOX Sentinel-2.
- Aerial imagery is present-day and is labelled "Present-day aerial view", with credits on the page.
- Phone: aerial stack at most 1.5 MB per pinned stop, lazy-loaded. Room budgets unchanged.
- Every motion has a button equivalent. Reduced motion uses fades only. Audio never starts without a visitor action; "Start the story" counts as one.
- Truth rule: new rooms use verified facts and rights-cleared media only.
- Never weaken, skip or delete tests or gates. No emojis.

## Review Focus
1. Story continuation from the last room goes to the ending page, never in a loop.
2. Unpinned rooms (no globe trip) chain correctly between pinned ones.
3. A failed aerial image load falls back to a fade, never a black screen.
4. The browser Back button during the story leaves a sane page state.
5. Esc and "Close story" stop every timer (countdown, tour, walk).

---

### Task 1: Aerial build script and assets
**Files:** create `tools/build_aerials.py` and `tools/tests/test_build_aerials.py`; create the output `site/public/aerial/<slug>/<stop>/{0,1,2,3}.webp`, `labels-{2,3}.webp` and `manifest.json`; modify `tools/content_check.py` (every mapped stop with a room has a manifest with extents and credits).
- [ ] Failing tests: the manifest schema (4 levels, extents in metres, centre equal to the stop's snapshot coordinates, credits per source), the source chosen by country, and the retry on HTTP 502/504.
- [ ] Implement the fetch functions (WMS GetMap for NAIP, swisstopo and LGL-BW), the Overpass label query over the full extent, and SVG to WebP labels (or Pillow if available). Retry 3 times.
- [ ] Run for einstein's mapped stops and commit the outputs, each pin at most 1.5 MB.

### Task 2: Globe zoom-in / zoom-out sequence
**Files:** create `site/src/museum/aerial.js`; modify `site/src/ui/journey.js`, `site/src/pages/[slug]/index.astro`, plus tests.
- [ ] Failing tests: a pure helper for the dolly path and the per-level opacity schedule, and an e2e where clicking a pin with a room reaches the building level, shows the "Present-day aerial view" label and credits, then shows "Enter the room".
- [ ] Implement a stack of textured quads on the tangent plane at the pin, cross-faded during a camera dolly of about 4 s, with labels fading in at levels 2 and 3. Add a Skip button. Reduced motion uses fades only. A failed load falls back to a fade.

### Task 3: Doors in rooms
**Files:** modify `site/src/museum/room.js`, `layout.js`, `scene.js` and `site/src/components/ChapterRoom.astro`, plus tests.
- [ ] Failing tests: every room has an entrance and an exit door on walls clear of exhibits; the exit door's label is the next room's title from the journey order; the last room's exit leads to the ending page.
- [ ] Implement framed door meshes with a hotspot and a "Next room: <title>" button. Clicking either plays the exit walk (fade under reduced motion), then navigates.

### Task 4: Story mode
**Files:** create `site/src/ui/story.js`; modify the globe and room pages, plus tests.
- [ ] Failing tests: `nextStop(journey, current)` covers pinned to pinned, pinned to unpinned and last to ending; the e2e covers Start the story, room 1, narration end, the 5 s countdown card with Stay and Close story, the next room, and that Close story stops all timers.
- [ ] Implement the URL state, narration autoplay only when `story=1`, the cross-document fade (View Transitions with a fallback), focus on the room heading, and a polite announcement.

### Task 5: Rooms for Washington, D.C., 1921 and San Diego, 1930
**Files:** `content/einstein/chapters/3.json` and `4.json`, journey stops with coordinates and snapshot entries, narration audio via `tools/build_audio.py`, plus tests.
- [ ] Use only facts verified in `.superpowers/sdd/.../facts-dc-sandiego-report.md`. If a room has fewer than 4 verified facts, stop and report.
- [ ] Gallery rooms from the museum kit. The pins must pass the coordinate gate. Aerial stacks are built through Task 1.

### Task 6: Gate and deploy
- [ ] Run the full gates, then a Codex cross-model review until GREEN, then redeploy to the existing Vercel project and smoke-check.
