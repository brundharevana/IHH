# REF v2: CyArk Tapestry home page, Escarzaga Palace, National Museum of Bosnia and Herzegovina

- Pages: https://tapestry.cyark.org/ (home), /content/escarzaga-palace, /content/national-museum-bosnia-herzegovina
- Date: 2026-10-12. Builds on `REF-tapestry-tech.md`, `REF-tapestry-ux.md` and `REF-tapestry-parity.md` (George Wythe House, 2026-10-08/09). Anything already settled there is cited, not repeated.
- Labels used below: **[O]** observed (seen at runtime, in shipped code, in file headers, or in computed styles), **[I]** inferred from those observations, **[U]** unknown.
- Use: internal analysis only. No CyArk code, text, media, icons or brand are copied into the product. Code fragments are paraphrased as numbers and behaviour.

## 0. Method and evidence

| Route | What happened | Evidence |
|---|---|---|
| REA (reverse-engineer-anything) skill, `rea-agents@6.4.0` through `npx` | No `rea` on PATH. Under the default Node 20.9 the package fails to start (`ERR_IMPORT_ASSERTION_TYPE_MISSING`; it needs Node 22.19+ or 24.11+). It ran under the user's existing Node 24.21 (nvm). | shell output |
| REA passive attach (`list_browser_targets`) | **Did not attach.** No loopback CDP endpoint exists on 9222/9223/9229, and the in-app browser does not expose one. REA returned `provider_unavailable / endpoint_unreachable`. | REA error, `details.reason: endpoint_unreachable` |
| REA controlled scenario (`capture_browser_scenario`, provider-owned headless Chromium 156 from the existing Playwright cache, temporary profile, process terminated afterwards) | **Worked.** Network, console, DOM and step screenshots were captured for all three pages, plus a click-through of Escarzaga stop 2 (skip narration, Dive Deeper, hotspot 2) on desktop (1440x900) and phone (390x844) viewports. | Evidence IDs in the table below |
| In-app browser (own tab) | Used for computed styles, CSS rules and the inline manifests. The pane was hidden and shared with other sessions, so it could not render the 3D view; runtime visuals come from REA instead. Viewport emulation reset and the tab closed afterwards. | JS inspection output |
| `curl` | HEAD sizes, GLB and KTX2 headers (first bytes only), and the shipped JS bundles read as text. | shell output |

REA Evidence IDs (all `confidence: observed`, `authority: controlled-replay`):

| Evidence ID | Scenario |
|---|---|
| `ev_a7448229b3772bbd0ff7e46368264b78bcb5dfc393d48c9704b99eed24cedb56` | Home, 1440x900, 12 s, network + console + DOM + screenshot |
| `ev_893b3d41c42c1eeb0a344aabb4870ca6206485ee573b259e01812efafa498ac7` | Escarzaga splash, same capture set |
| `ev_a14bc3b5aad2f286a1be66c6b9e73ff7642306c3613fe3fe875512602c49e0cb` | National Museum splash, same capture set |
| `ev_222f7b6278ff20fe34d0ad8e36e88141e4ca93ad8d3c3d61edbe898b0619f104` | Escarzaga full flow, desktop (incomplete: overview Skip selector timed out after stop 2 loaded) |
| `ev_b86caf6350044a0a6b161245a2576eee5eeb579809aa3584e1d9265ccedf9d9b` | Escarzaga `/s2` desktop: narration, skip, end state, Dive Deeper, hotspot click (**complete**) |
| `ev_73934d24306ed3727d844068fadaa16c6c68f03234948778ae79d41665cbf13b` | Same at 390x844 (incomplete: `#exploreCornerBtn` is hidden at 768 px or narrower, see 4.3) |

Limits: headless Chromium uses its software GPU path. Frame rate, GPU memory and real-phone behaviour were not measured. The phone run is a narrow desktop viewport with a desktop user agent, so the code's phone branches (LOD plan, pixel-ratio cap) are known from code only. No drag gestures could be scripted (REA actions are click/press/wait), so the drag behaviour comes from code and not from measurement.

Screenshots (internal, `docs/research/direction/spikes/`): `ref-tapestry-v2-00-home-rea.webp`, `-01-home-card-active.webp`, `-02-escarzaga-splash-rea.webp`, `-03-escarzaga-end-state-drag-hint.webp`, `-04-escarzaga-dive-deeper-rings.webp`, `-05-escarzaga-hotspot-panel.webp`, `-06-escarzaga-phone-end-state.webp` (all 26-58 KB).

## 1. Scene rendering: three tours, three engines

The main correction to v1: **Tapestry has no single renderer.** Each tour's manifest picks an engine, and the shared UI shell (`chunk.USHWT2GN.js`) dispatches camera calls to it (`sf`, `threeJS` → `lod` / `splat`(PlayCanvas) / `spark` / `cesiumJS` / tiles) [O, code switch in `We()`].

| Tour | Engine | Scene asset | Size | How LOD works |
|---|---|---|---|---|
| George Wythe House (v1) | PlayCanvas 2.23 | Streamed SOG Gaussian splats (`lod-meta.json` + WebP attribute chunks) | 83-343 MB per set | Per-chunk splat LOD under a 2 M / 1 M budget [O, v1] |
| **Escarzaga Palace** | **three.js r185** (`tjs_index`), set `type: "lod"` | **Photogrammetry textured mesh, GLB**: `gltfpack 0.25`, `EXT_meshopt_compression` + `KHR_texture_basisu` (KTX2, BasisLZ/ETC1S) + `KHR_materials_specular` [O, GLB header] | Exterior: 386,883 tris, 7 materials. `lod0` 6.7 MB (seven 1024x1024 KTX2, about 230 KB each), `lod1` 50.6 MB (seven **5632x5632** KTX2, 4.6-7.0 MB each). Interior: 532,234 tris, 10 materials, `lod0` 9.3 MB, `lod1` 42.0 MB. HDR environment `DEP_APN_01.hdr` 5.9 MB (exterior); interior uses a 3.6 KB black HDR [O, HEAD + headers] | **Texture LOD, not geometry LOD**: both levels share the same mesh; only texture resolution changes [O]. Device plan [O, `Sv()`]: desktop loads `lod1` only (fallback `lod0` on error); phone, iPhone/iPad, `saveData`, VR browsers or a session-stored degrade flag load `lod0` only |
| **National Museum BiH** | **Sketchfab Viewer API embed** (iframe, `navigation=fps`) | Sketchfab-hosted textured model (`.binz` + ~14 textures in 2 resolutions) [O, network] | not measured | Sketchfab's own progressive texture loading [O, network shows two texture passes] |

Why Escarzaga looks photoreal [I]: the realism is in the **captured textures** (5632 px atlases of the real walls, murals and floors, with real-world lighting baked in), not in the shading. The lights are simple (hemisphere light intensity 6 indoors, 3.4 plus one directional light outdoors, from `tjs_settings`) [O]. Static viewpoints chosen at good distances hide the mesh's soft geometry. On the phone plan the 1024 px textures look noticeably softer [I, inferred from the 5.5x resolution drop].

Phone behaviour [O, code]: pixel ratio capped at `min(devicePixelRatio, 1.5)` on phone/tablet; `lod0` only; a screen Wake Lock is requested; WebGL context loss reloads the page at most twice, then shows a "graphics lost" page. **Not observed on a real device [U].**

Splat question answered: splats are used where CyArk has a splat capture (Wythe, PlayCanvas). Escarzaga, which is the visual reference for the "glowing numbered rings", is a **mesh**. Neither is a 360 panorama.

## 2. Camera

All values are for the three.js (`lod`) engine used by Escarzaga, from `tjs_index.6XHXFV57.js` and `chunk.RFNLANBY.js` [O] unless marked.

### 2.1 Model: rotate in place, not orbit
- Controls are three.js `OrbitControls` (`enableDamping = true`, `dampingFactor = 0.08`, `rotateSpeed = 1` default, `enableZoom = false`, `enablePan = false` for `lod` stops) [O].
- When a camera move finishes in look-around mode, the code moves the orbit **target to 0.1 units in front of the camera** along its view direction. Orbiting a point 10 cm ahead is the same as turning your head, so **"Drag to Look Around" is rotation-only from a fixed viewpoint** [O]. Before the next move the real stored target is restored [O].
- **No pitch or yaw limits**: `minPolarAngle 0`, `maxPolarAngle π`, azimuth unlimited (OrbitControls defaults, never overridden in the tour code) [O]. You can look straight up or down.
- Drag sensitivity (OrbitControls formula) [O library, I applied]: yaw = 2π x dx / canvas height. At 900 px tall, 1 px = 0.40 deg and a full-height drag = 360 deg; at 844 px phone, 0.43 deg per px.
- Damping 0.08 per frame [I, OrbitControls applies it per `update()`]: velocity halves in about 8 frames (~140 ms at 60 fps) and is 95% gone after about 36 frames (~0.6 s). It is frame-rate dependent.
- No auto-rotate anywhere in the tour bundles [O, no `autoRotate` assignment]. No idle camera motion.
- Zoom: disabled in narrated stops and Dive Deeper. Free-explore mode (WASD/joystick) enables zoom and pan and locks camera height [O].

### 2.2 FOV (measured from code, computed per viewport)
- Base vertical FOV **75 deg**, defined for a 16:9 frame [O: `baseFov = 75`, reference aspect 1.7778]. On resize: if aspect is narrower than 16:9, the code **keeps the 16:9 horizontal FOV (107.5 deg)** and derives the vertical FOV, **capped at 100 deg** and never below 75 [O].
- Per-scene or per-hotspot `camera_fov` overrides exist (Escarzaga does not set one; National Museum uses 45 throughout) [O manifest].

| Viewport | Aspect | Vertical FOV | Horizontal FOV |
|---|---|---|---|
| 1920x1080 / 1280x720 | 1.78 | 75.0 | 107.5 |
| 1440x900 (measured run) | 1.60 | 80.9 | 107.5 |
| 768x1024 tablet portrait | 0.75 | 100 (cap) | 83.7 |
| 390x844 phone portrait (measured run) | 0.46 | 100 (cap) | 57.7 |

The phone screenshot (`-06`) shows the same courtyard with a much taller, narrower slice, consistent with the 100 deg cap [O].
- PlayCanvas (Wythe) runs at FOV 60 and Sketchfab tours at 45 [O, v1 and manifest].

### 2.3 Moving between viewpoints
- **Straight-line interpolation** of camera position and orbit target together, `Sinusoidal.Out` easing (tween.js), **2.0 s** default [O, `transitionCamera`]. Stop narration uses the stored `start` then `zoom` viewpoints, and the tween clock follows the narration audio, so scrubbing audio scrubs the camera [O, v1 plus `$B()` seek code].
- `instant_move`: a 0.1 s move behind a black overlay shown 500 ms first (a cut) [O].
- Hotspot click: same 2 s tween to the hotspot's own `camera_position/target` (optional FOV and depth-of-field override) [O].
- PlayCanvas path: GSAP, 2 s, `power1.out` [O, v1]. Sketchfab path: `setCameraLookAt` 2 s; narration scrub uses ease-out-quad `p(2-p)` [O].
- No curved path, no look-ahead, no "lift" in the middle [O].
- Reduced motion: camera tweens do not check `prefers-reduced-motion` [O, v1 + no media query in camera code].

### 2.4 "Drag to Look Around" hint
- Element `#lookaround-hint` inside a full-screen, pointer-transparent `.interaction-hint` layer; positioned `bottom: 195px`, `scale: 0.81` [O CSS].
- Text pill: 18 px Poppins 400, colour `#FEF1D7`, background `#ffffff0f` (white 6%), `backdrop-filter: blur(5px) saturate(1.2)`, 1 px `rgba(255,255,255,0.08)` border, radius 30 px, padding 6 px 28 px, shadow `0 2px 16px rgba(0,0,0,0.15)` [O].
- Under it a 72 px hand icon at 85% opacity running `shakeHand` 2.4 s ease-in-out, infinite: translateX 0, -10, +10, -8, +8, 0 px at 0/20/40/60/80/100% [O].
- **Shown** when a stop's narration ends (or is skipped) and the stop has `pan_enable` [O]. **Hidden** on the first drag (`controls` `start` event calls the same hide function), when a voice clip opens, when Dive Deeper starts, and on deep-link entry [O]. No fade: it uses `display: none` / `block` [O].

## 3. Hotspot rings (Escarzaga "Dive Deeper")

### 3.1 What they are
- **WebGL, not CSS.** Each ring is a square `PlaneGeometry` with a `MeshBasicMaterial` whose texture is a **512x512 canvas drawn at runtime** [O, `chunk.RFNLANBY.js`]. `transparent: true`, `depthWrite: false`, **`depthTest: false`**, `renderOrder: 9999`, so rings draw on top of everything, including through walls and pillars [O; screenshot `-04` shows ring 3 over a column].
- **Billboarded**: every frame the ring copies the camera's rotation [O].
- **Placed in world space** from the manifest: `lens_position "x,y,z"`, `lens_scale "10,10,10"` [O]. Plane size 0.3419 world units x scale 10 = **3.42 units across** [O]. Because it is a world-space object, **it shrinks with distance by normal perspective**; there is no screen-size compensation [O code, O screenshot: ring 1 nearby is about 180 px wide at 1440x900; rings 3 and 5 far away are about 50-70 px].
- Picking: raycast against the ring meshes; hover and click are synced with the bottom rail by `data-inthighid` (hovering a ring adds `.hover` to its rail button and vice versa) [O].

### 3.2 Ring texture recipe (canvas, radius r = 256 px)
| Layer | Geometry | Colour stops |
|---|---|---|
| Inner disc | radial gradient, radius 0.74 r | `rgba(255,250,242, 0.26)` at 0 → 0.33 at 0.72 → 0.48 at 1 (slightly brighter towards the edge) |
| Glowing ring band | radial gradient across full radius | transparent to 0.60 r; glow `0.45` alpha at 0.70 r; **solid** core 0.72-0.76 r; glow 0.50 at 0.81 r; transparent at 1.0 r. Idle colours: core `255,254,250`, glow `255,248,234`. Hover: core `255,214,150`, glow `255,190,105`, glow alphas 0.55 / 0.60 (warm amber) |
| Number backdrop | radial gradient, radius 0.58 r | black 0.32 → 0.26 (0.3) → 0.15 (0.6) → 0.06 (0.85) → 0 |
| Number | centred, nudged down 5% of font size | Poppins 600, white; font size 26% of canvas for 1 digit, 21% for 2, 16% for 3 |

So the "glow" is baked into the texture as soft gradient falloff; there is no bloom pass and no CSS blur [O].

### 3.3 Motion
- Reveal on Dive Deeper: scale 0 → target over **500 ms, Quadratic.Out**, **staggered 120 ms** per ring [O].
- Idle "breathing": scale x (1 + **0.025** sin(2π t / **3600 ms** + n x 2.1)), so each ring breathes +/-2.5% on a 3.6 s cycle, out of phase with its neighbours [O].
- Hover: texture swaps to the warm variant, scale x **1.08** over **220 ms Quadratic.Out**, and the camera "leans" **10% of the way towards the ring over 500 ms** (Quadratic.Out), easing back over 450 ms on leave [O]. Cursor becomes a pointer.
- Click: camera flies 2 s (2.3); the right-hand info panel opens; rings are hidden while the panel is open [O screenshots `-05`, code `KC()`].
- Narrated-stop markers (a different object, `threeJS_markers`) grow 0 → 1 over 2 s Quadratic.Out at a narration timestamp and shrink over 2 s Quadratic.In at their end time [O]. Escarzaga's rings are the Dive Deeper kind.

### 3.4 Bottom numbered rail (Dive Deeper mode)
- 50 px circular buttons (thumbnail photo cropped round, number on top), 3 px margin, `drop-shadow(0 2px 4px rgba(0,0,0,0.4))` [O CSS; visual recipe in v1 UX section 4].
- Hover: `scale(1.15) translateY(-4px)`, 0.3 s `cubic-bezier(0.16, 1, 0.3, 1)`, border `rgba(240,232,221,0.5)`, glow `0 0 20px 3px rgba(240,232,221,0.15)`, title label shown [O].
- Selected: `scale(1.08)`, 2 px border `rgba(240,232,221,0.95)`, glow `0 0 0 1px rgba(240,232,221,0.45), 0 0 18px 4px rgba(240,232,221,0.4)`, number text-shadow cream glow [O].
- At 768 px or narrower, hover effects are switched off for unselected items [O].

### 3.5 National Museum (Sketchfab) hotspots, for contrast
No rings. Each highlight is a **separate hidden mesh/material inside the Sketchfab model** (`sketchfab_material_id`), shown with `show(nodeId)` and clicked by material; viewpoints are stored with position and target 0.0001 units apart (a pure look direction), FOV 45 [O manifest + code].

## 4. Scene structure (Escarzaga, delta from v1)

v1 UX section 2 already covers the title block, captions, the left numbered rail, the transport bar, voices and the side panel for Wythe. Differences and new measurements:

1. **Top centre**: stop title and a 2-line clamped description, no card, as in v1 [O `-03`].
2. **Left rail**: home icon, 1-6, flag (end page); current stop highlighted [O].
3. **Bottom bar, left to right** [O `-03`]: Tutorial (?), Resources (book), Share, Settings | Previous stop, Back 15 s, Play/Pause, Forward 15 s, Next/Skip | Mute, Captions, Fullscreen. Above it: a 1 px progress line with elapsed and total time; above that, the caption box during narration [O `-06`/`-05`].
4. **Narration end** [O `-03`]: captions hide; voice portraits row appears (3 people + 1 archival portrait, about 50 px rounded squares with a light border); Play dims; Next becomes a solid button with a "NEXT SCENE" tooltip and a glow pulse (`nextBtnGlow`: cream box-shadow 6-14 px → 10-14 px with 0.85 alpha, scale 1.06, 2.5 s loop); "Drag to Look Around" hint appears; a **"Dive Deeper" corner button** appears top-right.
5. **Dive Deeper corner button** [O CSS]: circle with 36 px padding around a 72 px magnifier icon (144 px total), `linear-gradient(135deg, rgba(255,255,255,0.14), rgba(240,232,221,0.08) 40%, rgba(240,232,221,0.04) 60%, rgba(200,195,188,0.06))`, `backdrop-filter: blur(10px) saturate(1.3)`, 1 px `rgba(240,232,221,0.22)` border, a specular highlight (blurred white ellipse top-left rotated -15 deg), a skewed shine sweep every 3 s, an icon "zoom" pulse (1 → 1.18) every 3 s, and light rays plus a radial glow that fade in over 1.2-1.4 s and pulse on a 3.5 s cycle. Label 16 px / 600, `#FEF0D7`. Hover scale 1.1, 0.3 s `cubic-bezier(0.16,1,0.3,1)`. **Hidden at 768 px or narrower**; the phone gets a "Dive Deeper" pill in the bottom bar instead [O `-06`].
6. **Inside Dive Deeper** [O `-04`]: title, description, voices and rail hide; the numbered rings appear in 3D; the numbered thumbnail rail sits above a reduced bar (Reset camera, Exit); an **"Exit 3D Mode"** corner button (same glass recipe, 20 px padding, 42 px X icon, 16 px / 600 label) replaces Dive Deeper; also hidden at 768 px or narrower.
7. **Hotspot panel** [O `-05`]: right edge, full height, frosted, curved left edge (v1 recipe: `blur(24px) saturate(1.4)`, 25vw, 300-420 px), title 20 px / 500, media (here a video), short text; captions of the hotspot video appear in the centre caption box.
8. Splash (both new tours): centred frosted card (location eyebrow, title, tagline, 3-line snippet, published line), a language toggle pill (English / Espanol) on Escarzaga, a wide START pill, partner logos bottom-right, "Explore Tapestry Library" bottom-left, a "Community Made" badge top-right on Escarzaga [O `-02`].

## 5. Home page design system (computed at 1440x900)

### 5.1 Type (Poppins only; Google Fonts request: ital,wght 0,300 / 0,400 / 0,500 / 0,600 / 0,700 / 1,400) [O]
| Role | Size | Weight | Line height | Tracking | Colour |
|---|---|---|---|---|---|
| Hero h1 | `clamp(24px, 3vw, 48px)` (43.2 px here); 7vw at 640 px or narrower | 500 | 1.2 | -0.02em | #fff, 3-layer text-shadow (0 2 4 /.5, 0 4 12 /.4, 0 8 24 /.3) |
| Hero tagline | `clamp(14px, 1.2vw, 16px)` | 400 | 1.5 | 0 | rgba(255,255,255,.85) |
| Section title | `clamp(28px, 4vw, 40px)` | 700 | - | -0.02em | #fff |
| Section subtitle | 16 px | 400 | - | 0 | rgba(255,255,255,.6), max-width 500 |
| Card title | 20 px (18 px at 640 or narrower) | 600 | 1.25 | -0.01em | #fff, shadow 0 2 8 /.5 |
| Card body | 13 px | 400 | 1.5 | 0 | rgba(255,255,255,.85) |
| Nav links | 12 px | 400 (600 selected) | - | 0 | rgba(255,255,255,.95); selected `#FFB366` |
| Buttons | 12-13 px | 600 | - | 0 | #fff |
| Scroll prompt | `clamp(11px, .9vw, 13px)` uppercase | 500 | - | 0.1em | rgba(255,255,255,.7) |

### 5.2 Colour tokens [O, `:root`]
Page background `#0A0E14`; accent orange `#FF9B2D` (`--UI-color-orange`); gradient partner `#F07847`; hover orange `#FFAB4D` → `#F58857`; light orange text `#FFB366`; cream title `#F0E8DD`; cream text 65% `hsla(35,39%,90%,.65)`; cream 50% subtitle; warm label `#FEF0D7`; card surface `rgba(20,26,36,.6)`; dark strip `#1C1B1ACC`; hover `#302E2CE6`; red accent `#EA324133`; a black-opacity scale (10-90% in steps of 10).

### 5.3 Glass recipes [O]
| Surface | backdrop-filter | Background | Border | Radius | Shadow |
|---|---|---|---|---|---|
| Top-bar pills (search, Donate, Make a Tapestry, nav) | blur(12px) | rgba(255,255,255,.12-.15) | none | 30 px (h 32 px) | none |
| Secondary button ("Info") | blur(8px) | rgba(255,255,255,.15) | 1 px rgba(255,255,255,.25) | 8 px | 0 2 12 rgba(0,0,0,.2), inset 0 1 0 rgba(255,255,255,.1) |
| Mobile menu | blur(20px) | rgba(0,0,0,.5) | 1 px rgba(255,255,255,.12) | 14 px | 0 12 40 rgba(0,0,0,.4) |
| Modal backdrop | blur(8px) | rgba(0,0,0,.85) | - | - | - |
| Round close | blur(8px) | rgba(0,0,0,.4) | 1 px rgba(255,255,255,.2) | 50% | 0 2 8 rgba(0,0,0,.3) |
| Broadcast card | blur(14px) saturate(1.3) | teal gradient `#2496B7` → `#095985` | none | 20 0 0 20 | cream glow 0 0 20 2 rgba(240,232,221,.85) + inset highlight |
| Tour panels / overlays (v1) | blur(24px) saturate(1.4) / blur(16px) saturate(1.2) over 55% black | none / black 55% | - | large curve | - |

Hero backdrop is not glass but a **blurred copy of the active card image**: `filter: blur(40px) saturate(1.2)`, `scale(1.1)`, inset -20 px, 0.8 s cross-fade; plus an SVG fractal-noise grain at 20% opacity, a bottom-up dark gradient, and a radial vignette (transparent 35% → `#0A0E14` at 60% alpha) [O].

### 5.4 Cards and motion [O]
- Triptych: 3 cards, gap 16 px (12 px at 950 or narrower), side padding 48 px, height `77dvh` (min 500 px). Card radius 14 px, `rgba(20,26,36,.6)`, shadow `0 8px 32px rgba(0,0,0,.35)`; image `contrast(1.06) saturate(1.08)`; bottom overlay gradient `rgba(10,14,20,.95)` → transparent at 100%.
- **Hover/active = accordion**: the active card widens (container-query widths: other cards shrink to `max(160px, avail/(n+2))`) over **0.6 s `cubic-bezier(.25,.1,.25,1)`**; its image zooms to 1.1; a 5 s 512x512 hover video cross-fades in over 0.4 s; details (published year, language, 2-line text, buttons) expand from `max-height 0` to 200 px with opacity over 0.4 s; shadow becomes `0 16px 48px rgba(0,0,0,.5)` plus an orange halo `0 0 24px rgba(255,155,45,.2), 0 0 48px rgba(255,155,45,.1)`. Hover rules only apply under `(hover: hover) and (pointer: fine)`; below 640 px the triptych becomes a horizontal scroll-snap row of 280 px cards.
- Entrance: headline 1 s `cubic-bezier(.25,.46,.45,.94)` after 0.3 s; triptych 0.8 s rise from +30 px after 0.6 s; hero cards 0.6 s `cubic-bezier(.33,1,.68,1)` staggered 0.15 s from 3 s.
- **Primary "Explore"**: `linear-gradient(135deg, #FF9B2D, #F07847)`, white 12-13 px / 600, padding 8 16, radius 20, shadow `0 4px 16px rgba(255,155,45,.4)`; hover gradient `#FFAB4D → #F58857`, `translateY(-2px)`, shadow `0 6px 24px rgba(255,155,45,.5)`; transition 0.3 s.
- **Secondary "Info"**: glass row in 5.3; hover background .18, border .35, `translateY(-1px)`, shadow `0 4px 16px rgba(0,0,0,.25)`.
- Reduced motion: only caps animations to one iteration (`animation-iteration-count: 1`); it does not remove the entrance or accordion motion [O].

### 5.5 Spacing and breakpoints [O]
Spacing values in use: 4, 8, 12, 16, 20, 24, 32, 48, 56, 80, 100 px (section padding 80 / 24 / 100, section header margin 56). Breakpoints: 1024, 1000, 960, 950, 900, 768, 640, 560, 510, 480, 430 px plus height queries (760, 640, 515) and `hover`/`pointer` queries. Main ones: 950 (hero stacks, centred), 768 (mobile chrome, corner buttons hidden in tours), 640 (card scroller).

## 6. Licensing

| Item | Status | Use by us |
|---|---|---|
| Tapestry/CyArk name, logo, "Community Made" badge, UI icons (served from their blob store), splash/card photos, GLBs, HDRs, splats, Sketchfab models, voices, video, narration, captions, page text | "All rights reserved" in the home footer [O]; Content Use & Embedding Policy forbids extracting or modifying assets [O v1]; partner content (US Embassy fund, Durango institutions, National Museum) layered on top | **Not reusable.** Do not embed their tours in the judged entry |
| First-party JS/CSS (`chunk.*.js`, `index.min.*.css`, `homePageIndex.min.*.css`) | No licence header found [O] | Do not copy. Numbers and behaviour patterns are not copyrightable expression, but write our own code and choose our own values where it costs nothing |
| Canvas ring drawing code | first-party, unlicensed | Re-implement from the description with our own gradient stops (section 7.3 gives ours) |
| Poppins | SIL Open Font License 1.1 (Indian Type Foundry, distributed by Google Fonts) [O font host; licence is public knowledge, not re-fetched this session] | **Usable**, self-host the WOFF2 files with the OFL text |
| three.js, OrbitControls | MIT | Usable |
| tween.js (`@tweenjs/tween.js`, used as `Ee`/`we`) | MIT [I, API shape matches] | Usable, or write a 20-line ease function |
| gltfpack / meshoptimizer | MIT | Usable for our own meshes |
| Basis Universal transcoder (loaded from unpkg) | Apache-2.0 | Usable; self-host |
| PlayCanvas engine, splat-transform | MIT | Usable if we ever ship splats |
| animate.css 4.1.1 | Hippocratic License 2.1 | Avoid (licence conditions); write the two keyframes we need |
| Video.js | Apache-2.0 | Not needed (native video) |
| GSAP (Wythe path) | GSAP standard licence (free, not OSI) | Not needed |

## 7. Rebuild spec for our stack (three.js + Astro)

This is a spec, not a copy: the numbers are tuned starting points in our own code, and every asset is ours.

### 7.1 Scene format
- **Primary path for "photoreal"**: textured photogrammetry or photo-projected mesh as GLB, packed with `gltfpack -cc -tc` (meshopt + KTX2/ETC1S) at two **texture** levels: `lod0` 1024 px atlases (target 3-7 MB per scene, phone default) and `lod1` 2048-4096 px atlases (target 15-30 MB, desktop only, loaded after `lod0` is on screen). Their 5632 px / 50 MB is above what we need for a judged demo.
- Device plan (copy the idea, not the code): phone, tablet, `navigator.connection.saveData`, or a previous context loss → `lod0` only. Pixel ratio `min(devicePixelRatio, 1.5)` on touch devices, `min(dpr, 2)` on desktop.
- Lighting: `HemisphereLight` around 3-6 plus at most one directional light; the realism must come from the texture. No real-time shadows.
- Fallback stays as decided in SYNTHESIS: equirect panorama (PSV) or 2D Lite mode when WebGL2 is missing.

### 7.2 Camera
| Parameter | Value |
|---|---|
| Controls | `OrbitControls`, target placed **0.1 m ahead** of the camera after each move (rotate in place) |
| `enableDamping` / `dampingFactor` | true / **0.08** |
| `rotateSpeed` | **-0.4** [I: with the target 0.1 m ahead, their +1 makes a rightward drag turn the view right, so the scene slides against the finger; a negative value makes the scene follow the finger as in panorama viewers, and 0.4 slows it from 0.40 to 0.16 deg/px at 900 px. Not verified by a drag test; try both with users] |
| Zoom / pan | off in stops; optional pinch-to-FOV between 50 and base FOV if we want zoom |
| Pitch limit | **minPolarAngle 0.35 rad (about 20 deg from straight up), maxPolarAngle 2.6 rad (about 30 deg above straight down)**. They allow the full 0-π; we limit pitch so visitors do not end up looking at the ceiling or floor |
| Yaw limit | none by default; per-scene `yawRange` optional for half-built sets |
| Base vertical FOV | **70 deg** at 16:9 (their 75 shows more distortion at the edges on interiors) |
| Narrow screens | keep the 16:9 horizontal FOV, derive vertical: `v = 2 atan(tan(h/2)/aspect)`, clamp to **[base, 95]** |
| Viewpoint move | position and target lerped together, **1.6 s**, `easeOutSine` (`sin(t·π/2)`); `instant` = 300 ms fade to black, cut, fade in |
| Reduced motion | `prefers-reduced-motion: reduce` → every move becomes the instant cut; no hover lean; no breathing |
| Auto-rotate | none (they have none either) |
| Idle | after 8 s without input on a stop end, re-show the drag hint once |

### 7.3 Hotspot ring (our recipe)
- Billboard `Sprite` or camera-facing plane, `MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest: true })`. **Keep `depthTest: true`** and add a faint occluded copy (`depthTest: false`, opacity 0.25) if we want see-through; their always-on-top rings look wrong when a pillar is in front.
- **Size**: world size 0.45 m, plus a screen-space clamp so the ring stays between **44 px and 120 px** on screen (scale by camera distance x `2 tan(fov/2) / viewportHeight`). 44 px is the touch-target floor; their far rings drop to about 50 px and near ones reach 180 px.
- Texture: 256 px canvas (512 on DPR 2 or higher), drawn by our function:
  - disc fill radius 0.70 r, warm white `rgba(255,248,238, 0.18 → 0.36)` from centre to edge;
  - ring core 0.74-0.78 r solid `#FFF8EE`, soft halo to 0.64 r and 0.86 r at 0.4 alpha;
  - number backdrop: black radial 0.30 → 0 over 0.56 r;
  - number: Poppins 600, 28% / 22% / 17% of the canvas for 1 / 2 / 3 digits, white.
  - Active/hover variant: our accent colour in the halo and core (see 7.5), not their amber.
- Motion: reveal 450 ms `easeOutQuad`, stagger 100 ms; breathing +/-2% over 4 s, phase offset by index; hover scale 1.08 over 200 ms; no camera lean (it fights the drag gesture on touch).
- Interaction: `Raycaster` on pointer move (desktop) and tap; every ring has a matching DOM `<button>` in the rail with the full title as its accessible name, and focus on the button highlights the ring (same two-way sync they use). Click: camera move (7.2), then open the side panel (native `<dialog>` per parity notes); hide rings while the panel is open.
- Rail: 52 px round buttons, number over thumbnail, hover `scale(1.12) translateY(-3px)` 300 ms `cubic-bezier(0.16,1,0.3,1)`, selected 2 px cream border plus 16 px glow.

### 7.4 Drag hint
Glass pill (text 16 px / 400, padding 6 x 24, radius 999 px, `blur(6px)`, white 8% fill, 1 px white 10% border) above a 56 px hand icon (our own SVG) moving +/-10 px over 2.4 s; shown at narration end only when the stop allows look-around; hidden on first `pointerdown` on the canvas; fade 200 ms instead of their hard cut; static (no shake) under reduced motion.

### 7.5 Home and overlay tokens (ours)
```css
:root {
  --bg: #0b0f15;            /* near-black blue, ours */
  --text: #ffffff;
  --text-2: rgb(255 255 255 / .82);
  --text-3: rgb(255 255 255 / .6);
  --accent: #e8893a;        /* our orange; check 4.5:1 for text on dark before use as text */
  --accent-2: #d9682f;
  --accent-glow: rgb(232 137 58 / .4);
  --surface: rgb(20 26 36 / .6);
  --glass-fill: rgb(255 255 255 / .12);
  --glass-fill-hover: rgb(255 255 255 / .18);
  --glass-border: rgb(255 255 255 / .22);
  --glass-blur: blur(12px) saturate(1.2);
  --glass-shadow: 0 2px 12px rgb(0 0 0 / .2), inset 0 1px 0 rgb(255 255 255 / .1);
  --panel-blur: blur(22px) saturate(1.3);
  --radius-pill: 999px; --radius-card: 14px; --radius-btn: 10px;
  --space: 4px 8px 12px 16px 24px 32px 48px 64px 96px; /* documentation of the scale */
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-std: cubic-bezier(.25, .1, .25, 1);
}
```
- Type scale (Poppins, self-hosted, weights 400/500/600/700 only): hero `clamp(28px, 3.2vw, 52px)` / 1.15 / 600 / -0.02em; section `clamp(26px, 3.6vw, 40px)` / 1.15 / 700 / -0.02em; card title 20 / 1.25 / 600; body 16 / 1.55 / 400; small 13 / 1.5 / 400; label 12 / 600 / 0.08em uppercase.
- Primary button: `linear-gradient(135deg, var(--accent), var(--accent-2))`, white 14 px / 600, padding 10 x 18, radius 999 px, `0 4px 16px var(--accent-glow)`; hover `translateY(-2px)` and stronger glow, 250 ms. Secondary: glass fill + border, radius 10 px. Min height 44 px for both (theirs are 38 px).
- Card: radius 14, surface fill, `0 8px 32px rgb(0 0 0 / .35)`; on hover/focus-within the image scales 1.06 over 600 ms `--ease-std`, details expand over 400 ms; the expanding-accordion width trick is optional and only above 950 px with `(hover: hover) and (pointer: fine)`.
- Breakpoints: 1024, 950 (stack hero), 768 (mobile chrome; corner button moves into the bottom bar), 640 (card scroller with scroll-snap), 430.
- Reduced motion: turn off entrance, accordion and ring breathing entirely (stronger than their "one iteration").

### 7.6 What depends on real captures we do not have
- **Photorealism itself.** Escarzaga's look comes from metre-scale photogrammetry of a real building with 5.6k photo textures; Wythe's from a 68 M-Gaussian splat capture. Neither can be reproduced for our inductees' historic places without field captures or licensed scans. Rings, camera feel, glass UI, type and motion are all reproducible; the realism of the room is not.
- Our honest options: (a) our own phone-scanned spaces (Polycam/Scaniverse/Luma-type captures of places we can visit, exported to GLB or splats), (b) openly licensed scans (check each licence; CC BY scans on Sketchfab or Smithsonian Open Access where they exist), (c) stylised or painterly rooms (B3-S5 direction) where photorealism is not claimed, (d) equirect photos we shoot or that are public domain. Mixing (a)/(b) with the ring and camera spec above gets most of the feel.
- Ring placement quality depends on having a real 3D surface to anchor to; on a panorama the rings would be placed on a sphere and lose parallax.

## 8. Unknowns
- Real-phone frame rate, memory and whether iOS Safari holds the 5632 px KTX2 path (desktop only by design) [U].
- Exact feel of damping at 120 Hz displays (frame-rate dependent damping) [U].
- Whether CyArk tunes `rotateSpeed` per tour in the CMS (no field seen in either manifest) [U].
- Splat-tour (PlayCanvas) ring style: the lens code exists for `splat` (render order set specially) but no splat tour with lenses was inspected [U].
- Accessibility of rings: no keyboard path to a ring other than the rail buttons (observed rail buttons are real buttons; ring focus states not checked) [U].
