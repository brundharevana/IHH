# B3-S1: Shared scene engine spike (constructed room, baked equirect, PSV viewer, DOM hotspots, Lite mode)

Spike, not production code. Run 2026-10-08. Hardware and browser: Apple M1, in-app Chromium (ANGLE Metal, WebGL 2.0, MAX_TEXTURE_SIZE 16384), desktop only. No iOS Safari, no Android device, no screen reader. No recommendation is made; section 10 lists implications only.

Everything is in `Challenge IHH/spikes/s1-scene/`. Nothing was installed (no npm, no pip); libraries load from jsDelivr ES modules through an import map. Port 8701 served the folder with `python3 -m http.server`; both servers were stopped at the end.

## 1. What was built

| File | Role | Size |
|---|---|---|
| `room.js` | Procedural room (three.js), the authoring spec (`SPEC`: props, hotspots, anchors), Poly Haven loader | 19 KB |
| `bake.js`, `bake.html` | Cube bake, equirect pass, handedness gate, object-ID gate, memory estimate, WebP/JPEG export, descriptor writer | 21 KB, 1 KB |
| `viewer.html`, `viewer.css`, `viewer.js` | Photo Sphere Viewer page driven by `scene.json`: parallel DOM hotspot list, accessible dialog, toolbar, Lite mode, capability probe | 4 KB, 5 KB, 12 KB |
| `scene.json` | Baked descriptor (`ihh-scene/1`), written by the bake | 6 KB |
| `scene.schema.json`, `validate-scene.py` | JSON Schema draft 2020-12 plus cross-checks and 11 negative self-tests | 11 KB, 4 KB |
| `pano/room-4096.webp`, `pano/room-1024.webp` | Baked 4096x2048 equirect and Lite preview | 414 KiB, 58 KiB |
| `recv.py`, `capture-helper.js`, `hotspot-centering.js` | Spike harness only: localhost file receiver (allowlisted names, ports 8791), html2canvas screenshot saver, hotspot-centering figure. Not part of the engine | 2 KB, 3 KB, 3 KB |
| `bake-report.json` | Raw numbers from the last saved bake | 10 KB |

The room is labelled "Illustrative reconstruction (spike)" in the badge, the dialogs, the wall chalkboard and the descriptor. It is a generic gymnasium-like stand-in: wooden floor with court lines, a balcony on all four sides ("running track" suggestion: slab, rail, 400 instanced balusters, columns, lane lines), two basket-and-post stations (north: CC0 wicker basket on a post; south: primitive hoop and net), a wall chalkboard (canvas text), a CC0 standing chalkboard, tall windows on the east and west walls, roof beams, four pendant lamps, one directional light with shadows, hemisphere light, and a static RoomEnvironment. No historical claims are made anywhere in the copy.

## 2. Exact versions and URLs

| Library | Version | URL |
|---|---|---|
| three.js | 0.186.1 (r186), MIT | `https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js` (imports `three.core.js`); addons from `https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/` (`GLTFLoader`, `RoomEnvironment`) |
| Photo Sphere Viewer core | 5.15.1, MIT | `https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5.15.1/index.module.js` and `index.css` |
| PSV markers plugin | 5.15.1, MIT | `https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@5.15.1/index.module.js` and `index.css` |
| html2canvas (harness only) | 1.4.1 | `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js` |

PSV core declares `three ^0.185.1` (caret on 0.x excludes 0.186). It ran without errors against 0.186.1 because the import map gives it the single page copy of three. npm registry latest at the time: three 0.186.1, PSV 5.15.1.

Import map used in `viewer.html` and `bake.html`: `three` -> `three.module.js`; `@photo-sphere-viewer/core` and `/markers-plugin` -> the `index.module.js` files above.

Context7 queries: 6 (2 `resolve-library-id`: Photo Sphere Viewer, Three.js; 4 `query-docs`: markers/animate/tooltips; CubeCamera/GLTFLoader; config/navbar/markers html; zoom/rotate/events). One doc statement turned out wrong for 5.15.1 (see 7, item 3).

## 3. CC0 props (Poly Haven), licence verified on the asset pages

| Asset | Author | Asset page | Rights line on the page | 1k glTF download (declared) |
|---|---|---|---|---|
| `standing_chalkboard_01` | ParzivalCG | https://polyhaven.com/a/standing_chalkboard_01 | page shows "CC0" next to the author; 1.5 m tall | 2,617,256 B (gltf 5,145 + bin 100,120 + 6 JPEG textures) |
| `wicker_basket_01` | Kuutti Siitonen | https://polyhaven.com/a/wicker_basket_01 | page shows "CC0"; 0.4 m wide | 2,730,151 B (gltf 2,792 + bin 624,920 + 3 JPEG textures) |

Licence page https://polyhaven.com/license (read 2026-10-08): "Our assets are all licensed as CC0, which is effectively Public Domain even in jurisdictions that do not support the Public Domain", no credit needed, commercial use allowed. Credits are still listed in the viewer's "Credits and build checks" panel.

Things found while loading them:
- The API `files` response puts the `.bin` and textures in different resolution folders from the `.gltf` (for example the 1k glTF's `.bin` is under `gltf/4k/`, the basket's under `gltf/8k/`). Loading the glTF by its own URL would 404 on the relative URIs. `room.js` fetches the glTF JSON, rewrites `buffers[].uri` and `images[].uri` from the API `include` map, then calls `GLTFLoader.parseAsync`. CORS is open (`access-control-allow-origin: *`) on `api.polyhaven.com` and `dl.polyhaven.org`.
- Poly Haven's API terms (https://raw.githubusercontent.com/Poly-Haven/Public-API/master/ToS.md, clause 2.4 and 2.5) ask for a unique Referer or user agent per application and a visible credit when the live API surfaces their content. The assets themselves carry no such duty. The spike made 2 API calls per run (one `files` request per asset) from `localhost`. A production pipeline would vendor the downloaded files rather than call the API at run time.
- Measured prop sizes (glTF bounding boxes): chalkboard 0.92 x 1.509 x 0.759 m; basket 0.383 x 0.117 x 0.295 m (a shallow basket; scaled to 0.5 m wide).

## 4. Bake pipeline and measurements

Method: `CubeCamera` into a `WebGLCubeRenderTarget` (2048 px faces, half-float RGBA), then a full-screen quad with a `ShaderMaterial` that maps each equirect pixel to a direction `d = (sin lon cos lat, sin lat, -cos lon cos lat)` and samples `textureCube(tCube, d)`. Neutral tone mapping and sRGB output in that pass. Canvas 4096x2048 -> `getImageData` for tests -> `toBlob` for export. Convention: +X east, -Z north, yaw 0 = image centre = north, yaw +90 = east. Eye at (0, 1.6, 0).

### 4.1 Timings (performance.now; `gl.finish()` after each GPU stage; 8 page loads)

| Stage | Run 1 (cold: first CDN fetch, first shader compile) | Runs 2-8 (warm HTTP cache): median, range |
|---|---|---|
| Procedural scene build | 31 ms | 13.4 ms (11.8 to 28.5) |
| Props fetch + parse (2 glTF, 9 textures, 5.3 MB declared) | 1739 ms | 76.5 ms (40.7 to 465.6) |
| Cube render, first call (shader compile, 4096 shadow map) | 1814 ms | 317 ms (272 to 361) |
| Cube render, second call | 11.5 ms | 5.6 ms (3.7 to 8.4) |
| Equirect pass, first / second | 182 / 3.2 ms | 42.5 ms (25 to 50) / 0.3 ms (0.2 to 0.6) |
| Readback (`drawImage` + `getImageData`, 33.5 MB) | 78 ms | 85 ms (75 to 95) |
| Warm bake total (cube + equirect + readback) | 93 ms | 89 ms (82 to 101) |
| Handedness gate (3 checks, full image scan) | 157 ms | 119 ms (100 to 132) |
| Object-ID pass (1024 px Uint8 cube + equirect + read) | not valid (first version, see 7.1) | 81 ms (67 to 217; 217 was the first call after the fix, the rest 67 to 91) |

Pane visibility varied between runs; a hidden pane slows encode and timers (the 465 ms props fetch and the 361 ms cube render were in a hidden-pane run), so ranges include that noise.

### 4.2 Encoded sizes (4096x2048, from `canvas.toBlob`; KiB = 1024 B)

| Quality | WebP | JPEG | WebP encode time | JPEG encode time |
|---|---|---|---|---|
| 0.6 | 269.5 | 515.2 | | |
| 0.7 | 305.5 | 636.8 | | |
| **0.8** | **414.1** | **830.4** | 0.50 to 0.53 s (visible pane), 1.7 s (hidden pane) | 46 to 49 ms (visible), 136 ms (hidden) |
| 0.9 | 793.3 | 1284.5 | | |

Saved file: `pano/room-4096.webp` = 424,022 B (also `docs/research/direction/spikes/s1-room-equirect.webp`); Lite preview 1024x512 WebP q0.8 = 59,032 B. The earlier B1-R2 probe measured 88 to 94 KiB WebP for a flat-shaded room; this textured, shadowed room is 414 KiB, about 4.5x larger. The WebP encode is deterministic (identical bytes across two bakes).

### 4.3 GPU memory estimate

| Item | MiB | Basis |
|---|---|---|
| Viewer: one equirect texture | **32.0** | Measured from PSV internals: one `Texture` 4096x2048, RGBA, UnsignedByte, `generateMipmaps=false`, LinearFilter -> 4096 x 2048 x 4 B |
| Same texture if mipmaps were on | 42.7 | arithmetic (x4/3); PSV does not enable them |
| Lite preview if decoded | 2.0 | 1024 x 512 x 4 B |
| Bake only: cube render target | 192 | 6 x 2048^2 x 8 B (half float RGBA) |
| Bake only: scene textures (16, incl. 9 prop 1k textures) | 60 | sum of w x h x 4 x 4/3 over scene textures |
| Bake only: 4096^2 shadow map | about 64 | estimate, not measured |
| Bake only: 4096x2048 drawing buffer | 32 | arithmetic |
| JS heap at end of bake page | 276 MB | `performance.memory` (several 33.5 MB `ImageData` copies) |
| JS heap in viewer at 3D ready | 13 MB used | `performance.memory` |

`renderer.info.memory` at end of bake: 150 geometries, 21 textures. PSV sphere mesh: 64x32 segments, radius 10.

## 5. Handedness and hotspot gates

Markers in the room: a pure red unlit cube at +X (east) on the floor, a pure yellow disc on the ceiling (up), and a 5x7-cell letter N plate (1.0 x 1.4 m) on the north wall. They are listed as test markers in the long description. In production they belong in a separate calibration scene run through the same bake code; here they sit in the room so the gate runs on the real image.

| Check | Real bake | mirrorX control | flipY control | yaw +90 control |
|---|---|---|---|---|
| Red cube centroid vs expected direction | 0.16 deg (yaw 90.00, pitch -14.73; 7,570 px) | 150.7 deg | 29.3 deg | 86.3 deg |
| Yellow lamp centroid vs expected | 0.07 deg (6,839 px) | 52.8 deg | 109.3 deg | 48.3 deg |
| N glyph diagonal contrast (pass at >= 0.4) | 0.549 (Pearson r 0.914 vs 0.663 mirrored) | -0.213 | -0.059 | -0.198 |
| Gate | PASS | FAIL (all 3 checks) | FAIL | FAIL |

The three negative controls re-run the equirect pass with a deliberate fault through the same test code. All three were caught. Figure: `s1-handedness-gate.webp` (expected positions ringed in cyan on every panel).

Result for r186: sampling the render-target cube with `textureCube(tCube, d)` and no extra x flip is correct; the red cube lands at +90 degrees. The B1-R2 bug (an extra `d.x = -d.x`) is therefore a code error, not a three.js convention.

Object-ID gate: a second cube render with every top-level object given a flat ID colour (separate 1024 px Uint8 render target, nearest filter), mapped to equirect without tone mapping or colour management; the pixel at each hotspot's derived yaw/pitch must carry the expected object's ID. Result: 4 of 4 (basket -> `basket-north`, chalkboard -> `chalkboard-standing`, track rail -> `balcony`, windows -> `window-east`). Figure `s1-hotspot-centering.webp` (live viewer turned to each derived angle; cross-hair at view centre sits on the object in all four, and view yaw/pitch equals descriptor to 0.01 deg; PSV reports yaw as 241.39 for -118.61).

Derived angles: `yaw = atan2(x, -z)`, `pitch = asin(y / |v|)` from the stored world anchor and the eye. The first descriptor failed `validate-scene.py` because anchors had been rounded to 2 decimals after the angles were computed (0.02 to 0.06 deg drift). Anchors are now stored at millimetre precision and the angles are computed from the stored values, so any reader can recompute them exactly.

## 6. Viewer behaviour and test results

Layout: skip link, header with the evidence badge and Lite switch, 3D group (`role="group"`, `aria-roledescription="360 degree panorama"`, `tabindex=0`, described by a keyboard help line), a toolbar of 7 real `<button>`s (turn left/right, look up/down, zoom in/out, reset), the "Points of interest" list, `aria-live` status region, credits `<details>`, native `<dialog>`. PSV `navbar` is off; PSV's canvas, loader and marker layer are `aria-hidden`.

| Test | Result |
|---|---|
| Tab order (real key presses) | skip link -> Lite checkbox -> viewer group -> 7 toolbar buttons -> 4 hotspot buttons -> credits summary. PSV adds no tab stops with `navbar:false` |
| Enter on a hotspot button | 900 ms animation to derived yaw/pitch, then the dialog opens; focus lands on Close (autofocus) |
| Escape | dialog closes; focus returns to the same hotspot button (`dialog-close` event shows `h-chalkboard`) |
| Modal state | `dialog.matches(':modal')` true; `focus()` on the Lite checkbox and on a hotspot button while open did not move focus (background inert) |
| Arrow keys on the focused viewer | Right x3 = +45 deg yaw, Up = +10 deg pitch, `=` zoom 40 -> 50, Home = reset to yaw 0 pitch 0 zoom 40 and live message "View reset to north." Fast repeats accumulate after the pending-target fix |
| Reduced motion | with `matchMedia('(prefers-reduced-motion: reduce)')` patched to true, activation takes the `jump` path (`viewer.rotate`), position changes immediately and the dialog opens at once; `?rm=1` does the same. The real media query evaluated false in this browser (cannot toggle the OS setting from here), so the CSS `@media` block is untested |
| Mobile preset 375x812 (Android UA, touch points 5) | `scrollWidth` 375 (no horizontal scroll); toolbar and Reset buttons 44x44 or larger; hotspot buttons 343x76; Lite switch label 44 px tall; the input is 24x24 by CSS (a measurement taken before adding `flex:none` gave 23 px wide; not re-measured); viewer box 343x240; dialog becomes a bottom sheet (56 dvh) and the viewer scrolls to the top so the turned view stays visible |
| Lite mode | toggle destroys the PSV viewer (0 canvases, `viewer` null), shows the 1024x512 preview with alt text and the same 4 hotspots as cards with descriptions; choice persisted in `localStorage` (try/catch). Back to 3D in about 103 ms warm |
| Capability probe | WebGL 2 context probe; `?nogl=1` hook forces the branch: Lite on, switch disabled, message "WebGL 2 is not available in this browser". Data Saver / 2g branch coded, not exercised |
| 3D failure path | `?panofail=1` (404 on the panorama): PSV `panorama-error` rejects at once, viewer destroyed, falls back to Lite with the reason in the status line |
| Console | no errors or warnings on normal 3D, Lite, dialog, keyboard flows after the fixes in section 7. The only errors recorded in the viewer tab are the intended 404s from `?panofail=1` |

Viewer timings (warm cache, localhost, from `performance.now`): `scene.json` fetch 3 to 13 ms; PSV + three import 58 to 76 ms; panorama ready 142 to 147 ms after import start; interactive 147 to 168 ms. Lite interactive 3 to 7 ms.

Transfer (Resource Timing `encodedBodySize`; local files are served uncompressed by `http.server`, CDN files are Brotli):

| Mode | Resources | Total |
|---|---|---|
| 3D | html 4.0, viewer.css 4.8, viewer.js 11.4, scene.json 6.2, PSV css 3.1, PSV core 45.3, markers 17.5, three.module 129.4, three.core 260.0, pano 414.1 | about 896 KiB (decoded JS about 2,347 KiB: three.core 1,424 + three.module 647 + PSV 198 + markers 78) |
| Lite | html 4.0, css 4.8, js 11.4, scene.json 6.2, preview 57.6 (lazy-loaded, not fetched in 3D) | about 84 KiB |

Because the import map loads whole three.js, three alone is 389 KiB Brotli here. A bundler with tree shaking would likely cut this; not measured (no bundler available, nothing may be installed).

## 7. What failed or went wrong (all fixed unless noted)

1. First ID pass read all zeros. Cause: setting `needsUpdate = true` on a cube render-target texture (to switch to nearest filtering) made three try to upload a non-existent image (`texSubImage2D` TypeError in the console) and sample black. Fix: a separate Uint8 nearest render target for the ID pass.
2. First N-glyph test (Pearson correlation, margin 0.2) was too weak: real 0.914 vs vertical-flip 0.730 (margin 0.18) so the real bake failed its own gate. N mirrored left-right equals N flipped top-bottom (180 degree symmetry), so the glyph cannot tell those two apart; the yellow ceiling lamp covers the vertical axis. Replaced with a diagonal-triangle contrast statistic (real 0.549, controls -0.06 to -0.21).
3. `viewer.animate(...).catch is not a function`: in PSV 5.15.1 `animate()` returns an `Animation` that has only `then(onFulfilled)`; it resolves `true` when finished and `false` when cancelled, and never rejects. The Context7 text said "standard Promise with an additional cancel method"; the shipped source (`Animation` class in `index.module.js`) does not. Keyboard turning threw until fixed; `activate()` now checks `done === false` before opening the dialog.
4. Rapid arrow presses lost inputs: each press computed its target from the mid-animation position and `animate()` calls `stopAll()` first. Fix: keep a pending target.
5. three r186 removed `PCFSoftShadowMap` (console warning, falls back to `PCFShadowMap`). The bake now asks for `PCFShadowMap`.
6. Derived-angle round-trip drift (section 5).
7. html2canvas could not parse `color-mix()` (computed `color(srgb ...)`); replaced with plain tokens. It also cannot read WebGL canvases (swap in `toDataURL` image), has no top layer (dialog and backdrop faked at the real rectangle) and ignores `<details>` closed state.
8. The Browser pane was frequently hidden: `document.visibilityState` stayed "hidden", `requestAnimationFrame` stalled or ran at about 1 fps, `innerWidth` became 0 until a viewport was set with `resize_window`, `Image.decode()` hung, and native pane screenshots of the WebGL canvas came out black while `readPixels` showed real content. Work-arounds: set an explicit viewport, `forceRender()` (call `renderer.render` and dispatch PSV `RenderEvent` by hand), `toDataURL` instead of `drawImage(canvas)`, `onload` instead of `decode()`, `?rm=1` so no animation is needed. A tab created with `preview_start` had working rAF for a short time; older tabs did not. macOS `screencapture` returned only the wallpaper.
9. Saved screenshots are therefore html2canvas rasterisations plus canvas-composed figures, not native screenshots. They are accurate for layout and content, not for focus rings or browser chrome. Native pane screenshots were used only for my own visual checks.
10. A stray tab (`file:///.../s1-scene/bake.html`) was opened by the editor hook when I created the file; I closed it. Tabs `tab-5`, `tab-11`, `tab-12`, `tab-13` were mine and are closed; viewport emulation was reset to desktop on each.
11. Not a failure but a limit: at 4096 px the CC0 props are small. Chalkboard 0.92 m at 5.5 m is about 9.4 degrees, roughly 107 px wide in the equirect; the basket (0.5 m at 7.5 m) is about 3.8 degrees, roughly 43 px. 1k prop textures (5.3 MB declared download) are heavily oversampled for what survives in the bake.
12. Visual quality is plain and game-like (hard PCF shadows, no AO or GI, polar stretching of floor texture at the nadir). Style is S2's question; no judgement made here.

## 8. Accessibility observations (read_page and DOM checks)

Tree before (3D, initial): `link "Skip to the points of interest"`, `banner` with `heading`, `status "3D view is ready."`, `main` with `region`, `group "Interactive 360 degree view of the room"`, `toolbar "View controls"` with 7 named buttons, `navigation` with `heading "Points of interest"` and a `list` of 4 `button`s named for example `"1. Running track balcony, west-southwest, looking up 26 degrees"`.
Tree after activating the chalkboard (dialog open): same, plus `status "Turning to Standing chalkboard, northeast, looking down 9 degrees."` and the dialog content (heading "Standing chalkboard", Where, Evidence, Verified facts "None attached yet (placeholder: fact_ids is empty).", Artifact, Close button).
Tree in Lite mode: viewer group and toolbar still listed, `image` with the long alt text, same 4 hotspot buttons with descriptions visible.

Limits of the `read_page` tool, found by cross-checking in the page:
- It lists `hidden` and `display:none` content (closed dialog, Lite figure in 3D mode, PSV loader text "Loading the 360 view...", toolbar in Lite mode). `checkVisibility()` confirmed these were not rendered, so the tree is DOM-like, not the browser's computed accessibility tree.
- It shows the open `<dialog>` as plain generic nodes (no `dialog` role, no inert background). The modal and inert behaviour were checked with `:modal` and `focus()` instead.
- It named the Lite checkbox "on" (its value) even after adding `aria-labelledby`, and gave hotspot buttons no name until an explicit `aria-label` was added (it does not compute names from child spans). Real screen reader output is therefore unverified.

PSV 5.15.1 default DOM (checked on a throwaway viewer): navbar buttons are `div.psv-button` with `tabindex=0` and a `title` only (13 stops: zoom out, zoom in, 4 move, download `<a>`, description, markers, markers list, caption, fullscreen), no `role`, no `aria-label`; canvas has no role; markers have no tabindex or role. This confirms B1-R2 for 5.15.1 (markers show no tabindex at all here, B1-R2 saw -1).

Contrast (computed from the palette): ink on paper 16.7:1 light and 16.2:1 dark; muted text 8.5:1 and 10.4:1; badge kicker 8.9:1 and 12.8:1; focus ring colour 7.2:1 and 8.8:1 against the page. Target sizes 44 px for buttons; 24 px minimum met by the checkbox input. Colour is not the only carrier of any state.

Not tested: real screen readers (VoiceOver, NVDA, TalkBack), switch or voice control, forced-colors, 200% and 400% zoom reflow, text-spacing overrides, whether the live-region message plus the dialog title double-announce, touch gestures with a screen reader on.

## 9. Images and files saved

In `Challenge IHH/docs/research/direction/spikes/`:
- `s1-room-equirect.webp` (4096x2048, 414 KiB)
- `s1-handedness-gate.webp` (real bake vs three negative controls, 232 KiB)
- `s1-hotspot-centering.webp` (viewer at each derived angle, 140 KiB)
- `s1-viewer-desktop-3d.webp`, `s1-viewer-hotspot-dialog.webp`, `s1-viewer-lite-desktop.webp` (1024x768)
- `s1-viewer-mobile-3d.webp`, `s1-viewer-mobile-dialog.webp`, `s1-viewer-mobile-lite.webp` (375x812)

Descriptor and schema: `spikes/s1-scene/scene.json`, `spikes/s1-scene/scene.schema.json` (draft; `$id` is a URN placeholder). The schema holds what the spike needed: `evidence.tier` (documented, reconstruction, illustrative; refs required above illustrative), `render.pano` and `render.builder` (eye, engine, seed, bakedAt), optional `stops`, 1 to 8 `hotspots` (label, description, `anchor.world`, `derived`, `expectObject`, `fact_ids`, `artifact_id`, `content_status` with a rule that "verified" needs facts), `assets` with a licence allowlist enum, `a11y.alt` and `longDescription`, `budgets`, and the `gates` the bake wrote (the schema requires them to be true). `validate-scene.py` adds what JSON Schema cannot: recompute derived angles from anchors, unique ids and order, ascending-yaw reading order, 2:1 panorama, files exist, panorama under budget. All 11 negative cases were caught; the real file is valid. Not needed in S1 and left out: per-prop evidence, timeline event, transcript, narration, fov use, any non-baked render mode.

## 10. Open questions

1. iOS Safari and Android: WebGL texture memory with a 4096x2048 panorama, `canvas.toBlob('image/webp')` support (the bake would need to run in a Chromium build), long-press and touch behaviour of the viewer. Untested.
2. Does a tree-shaken three inside a bundle bring the 389 KiB Brotli (three alone) close to the "vanilla three 184 KiB gzip" figure in B1-R3, and how much of PSV needs to ship?
3. PSV scene swaps with `defaultTransition` would hold two textures (about 64 MiB); `setPanorama` transitions were not run (single scene).
4. Real screen-reader behaviour of: hotspot list, live message plus dialog title, bottom-sheet dialog, `aria-hidden` on the PSV container inside a focusable group.
5. Real `prefers-reduced-motion` and `forced-colors` rendering (only a patched `matchMedia` was used).
6. Headless baking in CI: Chrome removed SwiftShader, and headless WebGL flags were not verified here (the bake ran in a visible GPU-backed pane).
7. Poly Haven live API terms (unique Referer or user agent, credit) versus vendoring files into the repo; who owns that decision.
8. PSV's `three ^0.185.1` range against pinning three 0.186.1; how often to upgrade.
9. How many hotspots per scene before the list outgrows a side column (4 here; schema allows 8).
10. Whether a single baked image is acceptable when the evidence tier is "reconstruction" and some props are invented (per-prop tiers were not built).

## 11. Implications for the decision (no recommendation)

- Size: one 4096x2048 WebP at q80 of a textured, shadowed room was 414 KiB (JPEG 830 KiB). Against the earlier "about 3 MB per scene including artifacts" budget, the panorama used about 14%. Page load measured about 896 KiB in 3D mode (of which about 450 KiB is shared libraries) and about 84 KiB in Lite mode, on a warm local cache; real network time was not measured.
- Compute: a warm bake (cube, equirect, readback) took about 0.09 s and a cold first bake about 0.45 s on an M1; props fetching and WebP encoding (0.5 s) dominate. Per-scene cost is authoring effort and asset size, not render time.
- Gates: the handedness and object-ID gates ran in about 0.2 s together, caught all three injected faults and every hotspot placement, and the descriptor validator caught 11 of 11 bad descriptors. The one silent defect class named in B1-R2 (mirrored bake) was reproduced and detected automatically. Two of the gates themselves needed fixing during the spike (section 7, items 1 and 2), so gate code needs its own tests.
- Accessibility sat entirely in the engine layer: about 12 KB of `viewer.js` and 5 KB of CSS gave a keyboard-reachable list, named buttons, a modal dialog with focus return, a live region, reduced-motion handling and a Lite view. PSV contributed none of it (default navbar is unlabelled divs). Screen-reader behaviour is still unverified.
- Library behaviour differed from documentation twice (PSV `animate()` is not a Promise; three r186 dropped `PCFSoftShadowMap`), and PSV is outside its declared three range. Pinning and a smoke test per upgrade would be needed.
- Lite mode and the 3D viewer share one descriptor and one hotspot list; Lite needed no 3D code at all (about 22 KiB of app code and data plus the preview).
- Deriving hotspot angles from 3D anchors held up and was machine-checkable (recomputed from the stored anchor to 0.02 deg); fact and artifact cross-file checks are code, not schema.
- Prop assets are far larger than their visible footprint at 4096 px (about 5.3 MB declared for two small objects), which matters for repo size and for the 1.3 GB (now about 160 MiB) free disk on this machine, not for visitors.
- This spike says nothing about visual style, historical accuracy, mobile Safari behaviour, real network performance, or whether 15 to 20 scenes can be authored by parallel agents.
