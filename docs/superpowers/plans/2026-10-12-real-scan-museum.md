# Real-Scan Museum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the procedural rooms with real CC BY scans (King's Hall hallway, Hallwyl rooms), add the Tapestry-style camera, rings and home page, and recreate the Einstein study corner at the highest quality.

**Architecture:**
- **Asset build:** a stdlib Python + gltf-transform/gltfpack build step turns the owner-downloaded originals in `assets-src/scans/` into per-device GLB + KTX2 bundles under `site/public/scans/`. Each bundle has a manifest carrying its credit, licence and artwork-clearance record.
- **Room renderer:** a new scanned-room renderer (three.js) loads a bundle and places our easels and hotspots at authored stations.
- **Existing features:** story mode, doors, panels and the journey globe keep their interfaces.

**Tech Stack:** Astro 5, three.js 0.186 (GLTFLoader, KTX2Loader, MeshoptDecoder), gltf-transform/gltfpack (MIT), Basis Universal (Apache-2.0), Poppins (SIL OFL), Python 3 stdlib, Vitest, Playwright.

**Spec:** docs/superpowers/specs/2026-10-12-real-scan-museum-design.md. Research: docs/research/direction/{REF-tapestry-v2,B8-photoreal-rooms,B9-zero-risk-scans,B10-shm-room-scans}.md.

## Global Constraints
- **Room sources:** scans only from the official SkoklosterCastle / TheHallwylMuseum / Riksantikvarieambetet Sketchfab accounts, licence CC BY 4.0, downloaded by the owner into `assets-src/scans/` (gitignored originals). Every space shows its real name, source, licence and "Not connected to <inductee>", and never suggests endorsement.
- **Artwork clearance:** no visible in-copyright artwork. Every painting in view needs an artist-death-date clearance record (died 70+ years ago), or must be cropped out of view. If neither is possible, the room is not used.
- **Exhibits:** our exhibits stand on easels and stands; they never cover the scanned paintings.
- **Budgets:**
  - phones: ≤5 MB download per scanned room, half-resolution textures;
  - computers: ≤10 MB, full resolution;
  - GPU memory counted at compressed (KTX2) size;
  - the budget gate gets explicit per-device-class limits for scanned rooms, and procedural-room limits are unchanged.
- **Camera:**
  - rotation only at a station; 75° vertical FOV at 16:9; narrower screens keep the 16:9 horizontal FOV, vertical capped at 95°;
  - damping 0.08; no zoom; pitch limited;
  - glides take 1.6-2 s with ease-out; reduced motion gets a 300 ms fade.
- **Rings:**
  - world-sized and billboarded, 44-120 px on screen, hidden behind walls;
  - appear 100 ms apart, breathe ±2% over 4 s;
  - hover turns warm amber and grows ×1.08 in 200 ms;
  - a thumbnail rail is linked both ways with the rings.
- **No CyArk material:** no CyArk code, text, images, icons, logo or brand. Fonts must be openly licensed.
- **Truth rule:** everything shown cites verified facts and rights-cleared media. The study corner only arranges objects visible in EIN-M-0013/0014 and is labelled as a recreation.
- **Unchanged rules:**
  - WCAG 2.2 AA; Lite mode keeps working without WebGL;
  - never weaken tests or gates;
  - no emojis;
  - commit with `git commit -m ... -- <paths>`; never stash/reset/checkout in the shared tree.

## Review Focus
1. **Owner's original file missing or a different version:** the build fails with a clear message naming the file and its Sketchfab page, and never ships a stale or partial bundle. Task 1 tests this.
2. **Slow phone (5 Mbps) or a KTX2 transcoder failure:** a loading view with title and progress, then the room or Lite. Never a black stage. Task 3 tests this with a throttled network and with the transcoder blocked.
3. **Ring placement:** a ring placed where an exhibit sits behind scanned geometry from that station stays hidden and stays reachable from the list or thumbnail rail. Task 4 tests this.
4. **Shared rooms:** the same scanned room used by two inductees must show each one's own easels, stations and credit, with no leakage between them. Task 5 tests this with two chapters on one room.
5. **Unclear artwork rights:** a painting with an unknown artist or death date blocks the build until it is cropped out of view or the room is replaced. Task 2 tests this.

---

### Task 1: Scan ingest and bundle build
**Files:**
- Create: `tools/build_scans.py`, `tools/tests/test_build_scans.py`, `content/scans/<scan-id>.json` (manifests).
- Output: `site/public/scans/<scan-id>/{phone,desktop}/room.glb`.
- Modify: `.gitignore` (`assets-src/`).

**Interfaces:**
- **Produces:** manifest `content/scans/<id>.json`:
  - `{ id, title, place, publisher, sketchfab_url, licence: "CC BY 4.0", licence_url, credit, changes, source_sha256 }`;
  - `bundles: { phone: { file, bytes, gpu_bytes, tris }, desktop: { … } }`;
  - `artworks: [ { label, artist, died, status: "cleared"|"cropped"|"blocked", evidence_url } ]`;
  - `stations: [ ]`, filled in by Task 4.
- **CLI:** `python3 tools/build_scans.py <id> [--check]`.

- [ ] **Step 1:** Write failing tests:
  - a missing source file fails with a message naming the Sketchfab URL;
  - a source sha256 that differs from the manifest fails;
  - each bundle respects its budget (phone ≤5 MB, desktop ≤10 MB);
  - the manifest schema is valid.
- [ ] **Step 2:** Run the tests and confirm they FAIL.
- [ ] **Step 3:** Implement:
  - compression pipeline: gltf-transform weld/dedup/prune, gltfpack (or gltf-transform) meshopt simplification with seam protection, KTX2 UASTC/ETC1S per texture role;
  - texture sets: half resolution for phone, full for desktop;
  - colour/exposure normalisation of base-colour textures (documented parameters);
  - write the bundles plus the measured bytes, GPU bytes and triangle counts into the manifest.
- [ ] **Step 4:** Run the tests and confirm they PASS. Build the King's Hall and the four Hallwyl rooms from the owner's files, and Read rendered checks of each (`site/scratch` viewer or screenshot script) to judge clarity.
- [ ] **Step 5:** Commit `feat(scans): build per-device bundles from owner-downloaded scans`.

### Task 2: Artwork clearance gate
**Files:**
- Modify: `tools/content_check.py`, `tools/tests/test_content_check.py`, `content/scans/*.json` (`artworks`).
- Create: `docs/research/direction/B11-artwork-clearance.md` (evidence per painting).

**Interfaces:**
- **Consumes:** Task 1 manifests.
- **Produces:** `content_check` fails on any `artworks[].status == "blocked"`, and on any artwork without `died` ≤ (current year − 71) or `cropped`.

- [ ] **Step 1:** Write failing tests:
  - a blocked artwork fails;
  - an unknown death date fails;
  - a cropped artwork passes only if its region is listed in the room's `crop` boxes;
  - a cleared artwork passes.
- [ ] **Step 2:** Run the tests and confirm they FAIL.
- [ ] **Step 3:** Implement the check. Research each painting visible in the five rooms (museum catalogue records for Skokloster/Hallwyl, e.g. emuseumplus or DigitaltMuseum) and record the evidence. For any painting that can't be cleared, add a crop box (geometry removal at build) or drop the room.
- [ ] **Step 4:** Run `content_check` and the tests; all PASS.
- [ ] **Step 5:** Commit `feat(gates): artwork clearance for scanned rooms`.

### Task 3: Scanned-room renderer and loading
**Files:**
- Create: `site/src/museum/scanroom.js`, `site/src/museum/loader.js`, plus tests.
- Modify: `site/src/museum/scene.js` (choose scanned vs procedural by chapter data), `site/src/museum/budget.js` and `stats.js` (per-device scanned limits, KTX2 GPU bytes), `site/e2e/budget.spec.js`.

**Interfaces:**
- **Consumes:** `content/scans/<id>.json`. Chapter JSON gains `room: { scan: "<id>", stations: [...] }`.
- **Produces:** `loadScanRoom(manifest, deviceClass) -> { root, dispose, bytes }`; `deviceClass()` returns 'phone'|'desktop'.

- [ ] **Step 1:** Write failing tests:
  - device-class selection;
  - the budget gate rejects an over-limit scanned bundle;
  - e2e: a scanned room loads on desktop and mobile; with a throttled network, a loading view with title and progress shows; with the KTX2 transcoder blocked, the view falls back to Lite with a message, never black.
- [ ] **Step 2:** Run the tests and confirm they FAIL.
- [ ] **Step 3:** Implement:
  - GLTFLoader with MeshoptDecoder and KTX2Loader (transcoder self-hosted under `site/public/`);
  - progressive load: low mips first, then full;
  - credit/label overlay from the manifest;
  - dispose on leave;
  - prefetch of the next room's bundle during narration (via the doors/story hooks).
- [ ] **Step 4:** Run the tests and confirm they PASS. Take screenshots and Read them.
- [ ] **Step 5:** Commit `feat(museum): scanned rooms with progressive loading and budgets`.

### Task 4: Tapestry camera, stations, rings and thumbnail rail
**Files:**
- Create: `site/src/museum/stationcam.js`, `site/src/museum/rings.js`, `site/src/ui/rail.js`, plus tests.
- Modify: `site/src/components/ChapterRoom.astro`, `site/src/ui/panel.js` integration.

**Interfaces:**
- **Consumes:** a station `{ id, position, look, pitch:[min,max] }` from chapter JSON; exhibits with `station`, `anchor`.
- **Produces:**
  - `createStationCamera(camera, dom, opts) -> { goTo(station, {instant}), lookAt(point), dispose }`;
  - `createRings(scene, exhibits, opts) -> { setActive(id), setHover(id), update(camera), dispose }`.

- [ ] **Step 1:** Write failing tests:
  - FOV for 16:9 and 390x844;
  - pitch clamp;
  - glide timing and ease, and the reduced-motion fade;
  - ring pixel size clamped to 44-120 px;
  - a ring hidden when occluded (raycast against the room) but still listed in the rail;
  - hover state ×1.08 and amber;
  - rail ↔ ring two-way highlight;
  - the drag hint appears after narration and hides on the first drag.
- [ ] **Step 2:** Run the tests and confirm they FAIL.
- [ ] **Step 3:** Implement to the spec numbers (REF-tapestry-v2 §7). Keyboard: rail buttons are the accessible path; Enter on a rail item equals a ring click. Keep narration highlights wired to the rings.
- [ ] **Step 4:** Run the tests and confirm they PASS. Take screenshots and Read them.
- [ ] **Step 5:** Commit `feat(museum): Tapestry-style station camera, rings and rail`.

### Task 5: Hallway and Einstein rooms in scans
**Files:**
- Create: `content/hall.json`, `site/src/pages/hall.astro` (or the home-page hall section), inductee portrait easels.
- Modify: `content/einstein/chapters/{1..4}.json` (room.scan, stations, easel placements), `content/einstein/journey.json` if needed, doors placement for scanned rooms.

**Interfaces:**
- **Consumes:** Tasks 1, 3 and 4.
- **Produces:** the hallway route `/hall/` and inductee easels linking to `/<slug>/`.

- [ ] **Step 1:** Write failing tests:
  - every chapter with `room.scan` has stations and easel anchors on the floor inside the room bounds, not intersecting scanned geometry (raycast);
  - two chapters sharing one scan show only their own exhibits and credits;
  - hallway easels: 5 inductees, each labelled, each linking to its journey map;
  - a portrait easel shows only a licence-cleared portrait, otherwise a name card.
- [ ] **Step 2:** Run the tests and confirm they FAIL.
- [ ] **Step 3:** Implement. Assign King's Hall to the hallway and the Hallwyl Great Drawing Room scan to every Einstein chapter (owner amendment 2026-10-13: one room style per inductee; each stop is its own room of that style with its own exhibits/stations). Add a check that no chapter references an unusable scan. Doors become labelled museum doors placed at scanned doorways where they exist, or freestanding door frames otherwise.
- [ ] **Step 4:** Run the tests and confirm they PASS. Take screenshots of the hallway and of each room (desktop and phone) and Read them.
- [ ] **Step 5:** Commit `content: hallway and Einstein rooms in real scans`.

### Task 6: Einstein study corner
**Files:**
- Create: `tools/build_study_corner.py` (fetch Poly Haven CC0 models: bookcase, desk, chairs, lamp, books; record licence and URLs), `content/einstein/study-corner.json`.
- Modify: `site/src/museum/reconstruction.js` (use the scanned models; keep the declared-items rule and basis media), chapter 2 data.

**Interfaces:**
- **Consumes:** the reconstruction declared-items rule (954fdae) and Task 4 rings.
- **Produces:** a study corner placed inside the chapter 2 scanned room, labelled "Recreation based on photographs (National Archives 80-G-42918, 80-G-42919)".

- [ ] **Step 1:** Write failing tests:
  - every corner object is a declared item with basis media;
  - every model has a CC0 licence record;
  - the corner's phone budget share is within the room's 5 MB;
  - the recreation label is present.
- [ ] **Step 2:** Run the tests and confirm they FAIL.
- [ ] **Step 3:** Implement: high-quality CC0 photoscanned models, arranged per the photos, with a baked-AO contact shadow, lit to match the scan.
- [ ] **Step 4:** Run the tests and confirm they PASS. Take screenshots and Read them (compare with the archival photos).
- [ ] **Step 5:** Commit `feat(study): photoscanned period corner inside the museum`.

### Task 7: Home page in the new design system
**Files:**
- Create: `site/src/styles/tokens.css` (glass, colour and type tokens per REF-tapestry-v2 §7), `site/public/fonts/poppins/*` (OFL plus licence file).
- Modify: `site/src/pages/index.astro`, `site/src/layouts/Base.astro`.

**Interfaces:**
- **Produces:**
  - one section per inductee: portrait, name, one verified line, **Explore** (`/<slug>/`, journey map) and **Info** (`/<slug>/timeline/`, the dated journey stops list);
  - a link to `/hall/`.

- [ ] **Step 1:** Write failing tests:
  - five inductee sections, each with Explore and Info links pointing to the right URLs;
  - axe-clean;
  - glass text contrast ≥4.5:1 on the darkest and lightest backdrop;
  - the reduced-transparency media query gives solid panels;
  - fonts are self-hosted with the OFL file present.
- [ ] **Step 2:** Run the tests and confirm they FAIL.
- [ ] **Step 3:** Implement, including the `/<slug>/timeline/` page from journey data. Inductees without content show "Coming soon" with no Explore.
- [ ] **Step 4:** Run the tests and confirm they PASS. Take screenshots at desktop and phone sizes and Read them.
- [ ] **Step 5:** Commit `feat(site): home page in the new design system`.

### Task 8: Gate and deploy
- [ ] Full gates. Then a Codex cross-model review of the plan range until GREEN, covering:
  - gate integrity;
  - rights and credits for scans and fonts;
  - artwork clearance;
  - accessibility;
  - budgets.
- [ ] Redeploy (link the project, remove `.env.local` from the staging folder before deploy, verify `/.env.local` is 404), then smoke-check every page and report to the owner.
