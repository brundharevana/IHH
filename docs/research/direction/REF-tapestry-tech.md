# REF: CyArk Tapestry "George Wythe House", technical teardown

- Reference page: https://tapestry.cyark.org/content/george-wythe-house (chosen by the user as the design reference)
- Date of inspection: 2026-10-08/09 (US Pacific evening, server dates read 2026-10-09 UTC)
- Method: in-app browser (own tab, 1440x900 emulated viewport, reset afterwards), Performance API, DOM and accessibility tree, the inline content manifest, the shipped JS bundles (read, not run outside the page), response headers via `curl -I`, and HEAD requests for asset sizes. No login, no forms, no media saved. Nothing from CyArk is copied into our product; field names below are quoted only to describe their data model.
- Companion: UX/scene-by-scene description is a separate report; this file is the engineering view.

## Limits of this teardown (read first)

| Not reached | Why | What was used instead |
|---|---|---|
| Screenshots of scenes, hotspot panels and voice dialogs | The browser pane was hidden by the host right after "Start"; the page stopped compositing (`document.hidden = true`, 0 animation frames per second), so no screenshot could be taken and camera moves did not run | DOM and accessibility tree, the manifest, and the code paths that run on each click |
| Per-scene splat transfer for the interior sets | LOD streaming runs in the render loop, which was paused | Full per-set sizes from HEAD requests (an upper bound) and the observed first-load chunk list |
| Cold-cache timings | A parallel agent had loaded the same page in another tab, so most files came from cache; cross-origin entries also report `transferSize = 0` (no `Timing-Allow-Origin`) | Byte counts from `Content-Length`; cold-cache times given only as arithmetic, labeled as such |
| GPU memory, mobile device behaviour, the WebGL2 fallback path | Not observable from page JS in this session / not tested on a device | Code paths quoted (budgets, device profiles) |

Saved frames (splash while "LOADING", the only state captured): `spikes/ref-tapestry-tech-splash-loading-desktop.webp`, `spikes/ref-tapestry-tech-splash-loading-narrow.webp`.

## 0. TL;DR

1. **It is not 360 panoramas.** Every scene is a camera viewpoint inside a **3D Gaussian Splat** capture of the real house, rendered by the **PlayCanvas engine 2.23.0** (WebGPU first, WebGL2 fallback) with **streamed multi-LOD "SOG" splats** (PlayCanvas `splat-transform` output: `lod-meta.json` plus per-chunk WebP attribute textures).
2. **Content is one inline JSON manifest** (`<script id="tapestry-data" type="application/json">`, 332 KB, "MANIFEST v5") server-rendered by a **Node/Express** origin behind **Azure Front Door**; assets live in **Azure Blob Storage** behind a second Front Door endpoint. No headless CMS signature; the shape is a relational database export (foreign keys, `_alt_lang` columns, each collection shipped three times as array + two id-indexed maps).
3. **Hotspots in this tour are DOM buttons, not 3D markers.** All 29 "interactive highlights" have no 3D lens position (29 console warnings say so). A numbered thumbnail carousel of `<button aria-label aria-pressed>` items flies the camera to a stored viewpoint (GSAP tween, 2 s, `power1.out`) and fills a side panel with title, one image or video, rich text and a credit line.
4. **Video**: progressive MP4 only (1280x720, about 2.3 Mbit/s, 13-22 MB per 1-minute clip), **Video.js 8.10.0** for the 25 "voice" interview clips, native `<video>` for hotspot media; captions are **WebVTT** sidecar files rendered into a custom caption box via `cuechange`. Narration is MP3 per scene with its own VTT.
5. **Weight**: during the splash, before the user presses Start, the page requests about **104 MB of splat data** (10 chunks, 5.1 M Gaussians) plus about 1.2 MB of code and 197 requests in the first 8 s. The four splat sets total 916 MB on the CDN; the engine streams only what the camera needs within a 2 M (desktop) / 1 M (mobile) splat budget.
6. **Accessibility** is above average for a WebGL tour (skip link, named scene buttons, live region, focus moved into and back out of dialogs, Escape closes, captions) with gaps their own statement admits: focus is not trapped in dialogs, camera motion ignores reduce-motion, the canvas has no text alternative.
7. **Licence**: footer "All rights reserved"; the Content Use & Embedding Policy allows unmodified, attributed, non-commercial embedding only and requires written permission for extracting or modifying assets. No Creative Commons statement was found on the tour, About page or policy page. We may reuse patterns, not assets, text, code or branding.
8. **For us**: every mechanism maps cleanly onto our decided stack (Astro static pages, Photo Sphere Viewer or three.js, `<dialog>`, MP4 + WebVTT). The one thing we should not copy is the payload: our 4096x2048 panoramas are about 1-3 MB per scene versus their 100+ MB per set.

## 1. Stack, hosting, analytics

| Layer | Finding | Evidence |
|---|---|---|
| Front-end framework | **None.** Vanilla ES modules; UI built with template strings and `innerHTML`, wired with `getElementById`/`addEventListener`; a custom `<tour id="bodyTour" role="main">` element wraps the player | No React/Vue/Svelte/Preact/Lit/jQuery signatures in any bundle; dozens of `innerHTML=` template literals in `chunk.USHWT2GN.js` |
| Bundler | ESM code splitting with content-hashed names (`/js/script.TIUVCZYU.js`, `chunk.*.js`, `pc_index.*.js`); helper chunk matches esbuild's runtime (its "Dynamic require of ... is not supported" helper) | `chunk.CVDW6UEC.js` contents; `<link rel="modulepreload">` for 9 files |
| Server | **Node.js / Express**, server-side templates (a template comment refers to a string-escaping helper "registered in app.js"); template engine not identified | `x-powered-by: Express`; `request-context: appId=cid-v1:` (Azure Application Insights header) |
| CDN / hosting | **Azure Front Door** in front of the HTML origin and in front of **Azure Blob Storage** (`tapestry-storage-....z01.azurefd.net`) | `x-azure-ref`, `x-fd-int-roxy-purgeid`, `x-cache`; blob headers `x-ms-blob-type: BlockBlob`, `x-ms-version` |
| Caching | HTML `public, max-age=300, s-maxage=86400, stale-while-revalidate=600`; JS `max-age=31536000, immutable`; blobs `max-age=3600, s-maxage=2592000`; VTT files `no-cache` | Response headers |
| CORS / policy | `access-control-allow-origin: *` on HTML and blobs; `permissions-policy: accelerometer=*` | Response headers |
| Libraries | **PlayCanvas engine 2.23.0** (bundled, `chunk.4GGV7EMW.js`, 1.6 MB raw / 375 KB br); **GSAP 3.14.2** (bundled); **Video.js 8.10.0** (vjs.zencdn.net, 634 KB raw / 187 KB gz); animate.css 4.1.1 (cdnjs); Poppins (Google Fonts) | `data-engine="PlayCanvas 2.23.0"` on the canvas; `vx="2.23.0"`; `version="3.14.2"`; `videojs.VERSION` |
| Other engines in the codebase (not loaded here) | Lazy `import()` per set type: `tjs_index` (three.js r185, 173 KB br), `spark_index` (Spark splat renderer for three.js: `SparkRenderer`, `SplatMesh`; 764 KB br), `cjs_index` (CesiumJS 1.137.0; 1.06 MB br), Sketchfab Viewer API iframe (older tours), `pc_miniSplatViewer` | `import("./...")` calls in `chunk.USHWT2GN.js`; `REVISION "185"`, `VERSION="1.137.0"` |
| Analytics | **Google Analytics 4** (`G-BHX6H9JTJJ` configured inline, `G-QJB9KTBT1P` also collecting) and **Google Ads** remarketing/conversion (`AW-1059720001`: `viewthroughconversion`, `rmkt/collect`, `1p-user-list`, `ccm/collect`). Custom events: `tour_start` (with `engine`), `tour_engaged` (with `stop`), `tour_complete`, `load_time`, `load_abandoned`, `web_vital`, `deep_link_entry`, `share`. A `surface` parameter records standalone vs embedded | Network list; `gtag("event", ...)` calls in the bundle |
| Consent | No cookie/consent banner appeared; the inline gtag snippet sets no consent defaults. Each interaction fired roughly 15 Google Ads/GA requests | Observation; inline script |
| Device diagnostics | `/diagnostics?tour=<slug>` page checks browser, GPU and connection and produces a copyable report; a "slow load" hint appears after 30 s on the splash linking to it | Splash markup; `script_diagnostics.*.js` |

## 2. The 3D technology

### 2.1 Engine and renderer
- PlayCanvas `Application` on a single `<canvas>` inside `#threeJS_scene`. Device request order: `["webgpu","webgl2","webgl1"]`, `antialias: false`; WebGL2 is forced when a set contains a volumetric "4DGS" voice clip (log text: "4DGS voice on this set: WebGL2 forced"). In this session the device came up as **WebGPU** (`maxTextureSize 16384`).
- `maxPixelRatio = 1`: the canvas renders at CSS-pixel size (1440x900 on a DPR 2 display). A `?splatRes=` URL parameter scales resolution between 0.3 and 1.
- Viewer config observed at runtime: `fov 60`, `nearClip 0.1`, `farClip 500`, `animationDuration 2`, `animationEasing "power1.out"`, `lodUpdateDistance 0.5`, `lodUpdateAngle 90`, `lodUnderfillLimit 5`, `lodBehindPenalty 5`, `splatBudget 2,000,000` (1,000,000 when the device helper returns true; `?splatBudget=` overrides, minimum 50,000).
- A `renderProfile` ("low" for phones, tablets and VR browsers detected by user agent and touch points) and a session flag (`tjsLodDegrade`) degrade LOD after failures.
- A "render gate" sets `autoRender = false` while a full-screen overlay (media popup, share dialog) covers the canvas and resumes it on close, so the GPU idles while the visitor reads.

### 2.2 Splat format and streaming (the "how is it tiled" answer)
- Each **set** in the manifest is `type: "splat"` with `asset: .../Sets/<set>/lod-meta.json` and `environment_map: .../Sets/<set>/environment.sog` (a zip-bundled low-detail background splat, 24-361 KB).
- `lod-meta.json` = `{ lodLevels, environment, filenames[], tree }`. `tree` is a bounding-volume hierarchy (exterior set: depth 15, 4,547 leaves); each leaf lists, per LOD level, `{file, offset, count}` into the chunk files. This is the PlayCanvas `splat-transform` "multi-LOD streaming (streamed SOG)" output (`writeLodSource` writes `lod-meta.json`; confirmed in the splat-transform docs via Context7).
- Each chunk folder (`<lod>_<n>/`) holds `meta.json` (`version 2`, generator `splat-transform v1.1.0`, `count` about 0.4-0.55 M Gaussians) plus **WebP attribute images**: `means_l.webp`, `means_u.webp` (16-bit positions split into low/high bytes, with per-chunk min/max), `quats.webp`, `scales.webp` (256-entry codebook), `sh0.webp` (codebook), and for the exterior only `shN_centroids.webp` + `shN_labels.webp` (65,536-entry palette, 3 spherical-harmonic bands). Interior sets ship no higher-order SH, which cuts their bytes per Gaussian from about 20.6 to 12.5.
- Loading is **progressive coarse-to-fine**: on first load the requests went in pairs, coarsest first: `2_0, 2_1` (t = 2.1 s), `1_2, 1_3` (3.3 s), `1_0, 1_1` (4.3 s), `0_6, 0_7` (5.6 s), `0_5, 0_8` (6.9 s). Code logs "Splat revealed - LOD unclamped" after the first reveal.
- **Set swap per scene**: scenes 1-5 use `downstairs`, scene 6 `kitchen`, scenes 7-8 `upstairs`, the overview and scene 9 `exterior-02`. Moving to a scene on another set unloads and streams the new set (`SwapSet_PlayCanvas`).

| Set | LOD levels | Chunks | Gaussians (all LODs) | Bytes on CDN (all LODs) |
|---|---|---|---|---|
| exterior-02 | 3 | 16 | 7.97 M | 164.1 MB |
| downstairs | 6 | 49 | 27.29 M | 343.0 MB |
| upstairs | 6 | 48 | 26.35 M | 326.3 MB |
| kitchen | 4 | 13 | 6.58 M | 82.8 MB |
| **Total** | | 126 | 68.2 M | **916 MB** |

Largest single chunk: exterior `0_1`, 552 k Gaussians, 11.1 MB (7 WebP files of 0.4-2.6 MB each).

### 2.3 Camera system and scene behaviour (from code and manifest)
- Every stop stores `start_camera_position/target` and `zoom_camera_position/target` as "x,y,z" strings. During narration the camera moves between them on a GSAP timeline that is **seekable from the narration audio** (`seekCameraAnimation(time)`), so scrubbing the audio scrubs the camera.
- `instant_move = 1` replaces the fly-through with a cut behind a black overlay (0.1 s); `pan_enable` allows drag-to-look; `camera_fov` overrides FOV; `desaturate` and `depth_of_field` flags exist.
- **Standard interactive** (7 of 8 scenes): camera flies to the interactive's viewpoint, a numbered thumbnail carousel appears; each item flies the camera to its own viewpoint and opens the info panel.
- **Free explore** (scene 1): `interactive_mode: "free_explore"` with `explore_area` = oriented box `{center, extents, rotation(quaternion)}`; WASD + mouse on desktop, a virtual joystick on touch; a triangle-grid raycaster supports a `collision_mesh` (null in this tour). A "found 0/0" counter exists in the markup.
- 3D hotspot "lens" badges (`lens_position`, `lens_scale`, `inner_icon_url`, `icon_type`) are supported by the engine but **unused in this tour**.
- A sky preset table (8 presets from "First Light" to "Nighttime" with turbidity, Rayleigh, sun elevation, fog and hemisphere light colours) is shipped with every tour; this one uses preset 4 ("Midday") everywhere. It matters for mesh/three.js sets, not for baked splats.

## 3. Hotspot / content data model

### 3.1 Where the data comes from
- Inline in the HTML: `<script id="tapestry-data" type="application/json">` (332 KB of the 432 KB HTML; 32 KB on the wire with Brotli) and `<script id="map-data">` (title, lat, long). The entry module parses both on `DOMContentLoaded`. A console line labels the source "MANIFEST v5"; the splash shows "Published: 2026 (v5)".
- No client-side content API. The only API call in the bundle is `POST /api/survey` (plus a survey definition JSON on blob storage). A token-header fetch (`X-VIEW-TOKEN`) exists for protected assets.
- CMS: custom. Column-style names (`tapestry_id`, `scene_id`, `interactive_id` foreign keys), `_alt_lang` twins for a second language, `_1`/`_2` pairs for two audio languages, integer booleans, and fields such as `elevenlabs_voice_id_1`, `narration_script_hash_1`, `raw_narration_1`, `music_track_id_1` (all null here) indicate an in-house admin backed by a relational database that can also generate narration with ElevenLabs. Nothing points to Contentful, Sanity, Strapi or WordPress.
- About two thirds of the manifest is duplication: `sceneVoices`, `interactiveHighlights` and `scenes` are each shipped as an array and again as two id-keyed maps (about 50 KB x 3 and 40 KB x 3), and every voice clip row repeats the speaker's full biography.

### 3.2 Entities (this tour)

| Collection | Count | Purpose | Key fields |
|---|---|---|---|
| `tapestry` | 1 | Tour header | title, location, tagline, snippet, `splash_image` (+ alt), `tapestry_card_image`, `tapestry_hover_video`, `ambient_audio`, lat/long, duration (15 min), language codes, flags (donate, map, white-label, maintenance) |
| `overview` | 1 | Stop 0 | title, HTML description, `audio_narration_1`, `narration_cc_1` (VTT), camera start/zoom, `voice_pulse_wait_1..3` |
| `scenes` | 9 | Stops 1-9 | `scene_sequence`, title, HTML description, narration MP3 + VTT, camera start/zoom, `pan_enable`, `instant_move`, `interactive_id` |
| `voices` | 3 | People interviewed | name, title, HTML bio, `voice_intro_video` + VTT, headshot 256 px + large (1080 px) with alt text, `voice_order`, `voice_pulse_wait` |
| `sceneVoices` | 25 | One clip per voice per scene | voice fields joined + `voice_clip_id`, `scene_id`, `voice_video` + `voice_video_cc_1`, `voice_bubble_text` (the question/topic shown on the bubble), `voice_clip_type` (`video` here; `4dgs` supported) |
| `interactives` | 8 | One per scene with hotspots | camera viewpoint, `interactive_mode` (`standard` / `free_explore`), `explore_area`, flags |
| `interactiveHighlights` | 29 | The hotspots | `highlight_order`, `highlight_thumbnail`, `popup_title`, `popup_text` (HTML), `popup_media_link`, `popup_media_type` (`image` 28, `video` 1; code also handles `splat`, `audio`, `model`), `popup_media_alt_desc`, `popup_media_credit`, `popup_video_cc_1`, `popup_audio_link`, camera viewpoint, `instant_move`, `rotate_model`, Sketchfab ids |
| `threeJS_int_highlights` | 29 | 3D placement of each hotspot | `lens_position/rotation/scale` (all null here), `inner_icon_url`, `model_url`, `icon_type`, `orb_position`, `trigger_radius` |
| `mediaItems` | 1 | Extra scene media (gallery) | title, HTML caption, `media_type`, `media_asset_link`, thumb, alt text, credit, `media_asset_cc` |
| `threeJS_sets` / `threeJS_scene` | 4 / 9 | Which splat set and sky each scene uses | `type`, `asset`, `environment_map`, `splat_rotation`, `collision_mesh`, `hdr_link`, fog |
| `resources`, `partners`, `links` | 1 / 2 / 1 | About page, credits, partner logos | HTML text, logo URLs + alt text |

Hotspots per scene: 3, 4, 8, 4, 2, 1, 5, 2 (scenes 1-8); scene 9 has none.

### 3.3 Abridged example (shape only; values replaced with placeholders)

```json
{
  "t": {
    "scenes": [{
      "scene_id": 1046, "scene_sequence": "2", "scene_title": "<title>",
      "scene_desciption": "<p>...</p>",
      "audio_narration_1": "https://<blob-cdn>/<tour>-data/<Tour>_Scene2.mp3",
      "narration_cc_1": "https://<blob-cdn>/<tour>-data/<Tour>_Scene2_cc.vtt",
      "start_camera_position": "x,y,z", "start_camera_target": "x,y,z",
      "zoom_camera_position": "x,y,z", "zoom_camera_target": "x,y,z",
      "pan_enable": "true", "instant_move": 0, "interactive_id": 455
    }],
    "interactives": [{
      "interactive_id": 455, "scene_id": 1046, "interactive_mode": "standard",
      "camera_position": "x,y,z", "camera_target": "x,y,z", "explore_area": null
    }],
    "interactiveHighlights": [{
      "interactive_highlight_id": 978, "interactive_id": 455, "highlight_order": 1,
      "highlight_thumbnail": "https://<blob-cdn>/.../<Item>_Thumb.jpg",
      "popup_title": "<title>", "popup_text": "<p>...</p>",
      "popup_media_type": "video", "popup_media_link": "https://<blob-cdn>/.../<Item>.mp4",
      "popup_media_alt_desc": null, "popup_media_credit": null, "popup_video_cc_1": null,
      "camera_position": "x,y,z", "camera_target": "x,y,z", "instant_move": 0
    }],
    "sceneVoices": [{
      "voice_clip_id": 1437, "voice_id": 489, "scene_id": 1045,
      "voice_bubble_text": "<question shown on the bubble>",
      "voice_video": "https://<blob-cdn>/.../Voices/Scene1_<Name>_<Topic>.mp4",
      "voice_video_cc_1": "https://<blob-cdn>/.../Voices/Scene1_<Name>_<Topic>_cc.vtt",
      "voice_clip_type": "video"
    }],
    "threeJS_sets": { "144": { "type": "splat",
      "asset": "https://<blob-cdn>/<tour>-data/Sets/downstairs/lod-meta.json",
      "environment_map": "https://<blob-cdn>/<tour>-data/Sets/downstairs/environment.sog",
      "splat_rotation": "[-90, 0, 0]" } },
    "threeJS_scene": { "1046": { "set_id": 144, "sky_id": 4 } }
  },
  "deepLink": null, "kioskMode": null, "autoplayMode": null
}
```

### 3.4 Click flow for a hotspot (code path, standard mode)
1. Scene's interactive starts: carousel `#intMediaCarouselItems` is filled with `<button class="intHighlightItem" data-inthighid aria-label="<full title>" aria-pressed="false">` holding a thumbnail (`alt=""`), a number badge (`aria-hidden`) and a title truncated to 18 characters.
2. Pointer enter/leave on a button highlights the matching 3D badge if one exists (none here).
3. Click: the camera tweens to the highlight's `camera_position/target` (with its own FOV/DOF if set), the narration caption box is hidden, and `#playpenInfoParent` shows: title (font shrinks if the title is taller than 152 px), then by `popup_media_type` an image (`src`, `alt` from `popup_media_alt_desc`, click opens a full-size view in the shared `#popUpParent` overlay), a native `<video controls playsinline>` with optional captions track and a custom progress bar, an audio player, or a small embedded splat viewer; then the HTML text with Read more / Read less and "Credit: ...".
4. Reset button returns to the interactive viewpoint; Exit returns to the narrated tour.

### 3.5 URL scheme (deep links, all served by the same page)
`/content/<slug>` (splash), `/s0` (overview), `/s<N>` (scene), `/s<N>/v<M>` (voice clip), `/s<N>/mm<M>` (media item), `/s<N>/int` (interactive). Updated with `history.replaceState`; the server puts the parsed target in the manifest's `deepLink`. Query flags seen in code: `white_label`, `kioskMode`, `autoplayMode`, `debug`, `splatBudget`, `splatRes`, `renderProfile`.

## 4. Media delivery

| Media | Format and size | Player | Captions |
|---|---|---|---|
| Scene narration (10 files) | MP3, 0.76-1.91 MB each (overview 1.14 MB for 47 s, about 190 kbit/s) | Hidden `<audio id="audioExperience">` driven by the custom transport bar (restart, -15 s, play/pause, +15 s, skip) | WebVTT per file, attached as `<track kind="subtitles" default>`; cue text copied into `#closedCaptionsText` on `cuechange`; "[Audio Loading]" placeholder while buffering |
| Ambient bed | MP3, 2.51 MB, 157 s loop | `<audio id="audioAmbience">` | none |
| Voice interview clips (25 + 3 intros) | Progressive **MP4, 1280x720**, 13-22 MB per clip (about 60 s, roughly 2.3 Mbit/s); no HLS/DASH, no adaptive bitrate | **Video.js 8.10.0** players `#spVideoTag` (scene voices) and `#ovVideoTag` (intros) in `role="dialog"` panels | WebVTT via `addRemoteTextTrack({kind:"subtitles"})`, mode `hidden`; cues rendered into a custom caption element except in fullscreen |
| Hotspot video (1) | MP4 1280x720, 157 s | Native `<video controls nodownload playsinline>` | Supported (`popup_video_cc_1`), empty here |
| Hotspot images (28) | JPEG, long edge capped at **1080 px** (e.g. 1080x720, 720x900, 689x1080), 0.15-0.5 MB; one size only, no `srcset`, no WebP/AVIF | `<img>` in the info panel | `alt` from `popup_media_alt_desc` (null for most items here) |
| Thumbnails | JPEG 256 px, 20-90 KB | carousel buttons | `alt=""`, name on the button |
| Speaker headshots | JPEG 256x256 (10-14 KB) and 1080x1080 (250-350 KB) | `<img>` | alt text present |
| Splash | JPEG 1707x1280 (843 KB), `rel=preload fetchpriority=high`; card 960x720 (260 KB) | CSS/`<img>` | alt text present |
| Library hover clip | MP4 512x512, 5 s | home page cards | n/a |

Totals on the CDN for this tour (HEAD sizes): 30 MP4 = 392.7 MB; 11 MP3 = 14.1 MB; 69 JPEG = 8.7 MB; 38 VTT = 0.05 MB. All media load on demand except the splash, thumbnails, ambient and current narration.

Odd details: the Video.js `<video>` placeholders initially point at a clip from a different tour (`ouro-preto-data/...`), a template leftover; VTT files are served `no-cache`.

## 5. Performance

### 5.1 First load (warm-ish cache, 1440x900, WebGPU, Chromium)
| Metric | Value | Note |
|---|---|---|
| HTML | 432 KB raw, **32 KB Brotli** | 77% of it is the manifest |
| Code for this tour | about **486 KB Brotli** of first-party JS (raw 2.0 MB; PlayCanvas chunk alone 375 KB br) + Video.js 187 KB gz + CSS 29 KB br + animate.css + Poppins | measured with `curl --compressed` |
| Requests in first 8 s | **197**: 82 splat files, 41 UI icons from blob storage, 35 content images (all thumbnails preloaded), 18 analytics/ads, 10 JS, 3 CSS/fonts, 2 audio, 6 other | Performance API |
| Splat data before Start | **10 chunks, 5.10 M Gaussians, about 104.4 MB** + `lod-meta.json` (1.46 MB raw, 260 KB br) + `environment.sog` (361 KB) | sizes from `Content-Length`; requested while the splash says "LOADING" |
| TTFB / DOMContentLoaded / load / FCP | 232 ms / 3,057 ms / 3,729 ms / 3,816 ms | second navigation; DCL is held back by the module graph and Video.js |
| Splat window | first chunk request 3.8 s, last response 8.2 s | warm cache (parallel agent had loaded the page) |
| Cold-cache estimate (arithmetic, not measured) | about 106 MB total: roughly 17 s at 50 Mbit/s, 85 s at 10 Mbit/s | the 30 s slow-load hint suggests they see long loads in the field |
| JS heap | about 95 MB used | `performance.memory`; no memory warnings logged |
| Console errors | **none** | warnings: 29 "No lens_position for highlight ID ... skipping lens load", 4 iframe `allow` feature warnings from the Sketchfab iframe template, duplicate-ID issues (see 6) |

### 5.2 Per scene (on demand)
- Narration MP3 0.76-1.91 MB + VTT under 2 KB on entering a stop (observed: `GeorgeWythe_Scene2.mp3` requested on clicking scene 2).
- Each voice clip opened: 13-22 MB MP4.
- Changing set (e.g. overview to scenes 1-5) streams the new set within the splat budget; the full set sizes above (83-343 MB) are upper bounds, actual per-scene transfer was not measurable here.
- Every interaction fires about 15 Google Ads/GA requests.

## 6. Accessibility in the markup

What they do well:
- Skip link to `#bodyTour`; `lang="en"`; one `h1`.
- Scene navigation is real buttons with full names ("Go to scene 2: The Parlor"), plus Overview and End Page.
- Transport controls are buttons with names (Restart narration, Skip back 15 seconds, Skip forward 15 seconds, Skip narration, Mute, Toggle Closed Captions, Fullscreen).
- Hotspot carousel items are `<button>` with `aria-label` (full title) and `aria-pressed`; number badges `aria-hidden`.
- Scene changes announced in an `sr-only` `role="status"` live region (`#tourLiveRegion`); loading text has `aria-live="polite"`.
- Panels are `role="dialog"` with `aria-label`/`aria-labelledby`; opening a panel moves focus to its close button or heading; closing restores focus to the opener; Escape closes the top panel.
- Narration and voice clips have captions; a captions toggle exists; Video.js brings its caption settings dialog.
- CSS honours `prefers-reduced-motion` for UI animations; the location map's auto-zoom cycle honours it in JS.
- A public accessibility statement claims partial WCAG 2.1 AA conformance and lists known gaps.

Gaps (observed; several confirmed by their own statement):
- The WebGL `<canvas>` has no accessible name or text alternative; the 3D view is invisible to screen readers (the scene description text partly compensates).
- Focus is not trapped inside open dialogs (stated). `aria-modal="true"` sits on the wrapper `#popUpParent`, which has no role; the dialogs themselves are `div`s, not `<dialog>`.
- Camera fly-throughs ignore `prefers-reduced-motion` (stated).
- Duplicate IDs (`playpenInfo-Img`, `playpenInfo-Vid`, `playpenInfo-Vid_track`, `audioHighlight`, `playpenInfo-Desc`, `ssP-Prev` x3, `ssN-Next` x3, `fullscreenTooltip` x3, and others) break `aria-labelledby`/`getElementById` reliability.
- Most hotspot images have `alt` null in the data (alt text exists for splash, headshots, partner logos and the one media item).
- Visible hotspot titles are truncated to 18 characters; "Hover to Rotate" hints rely on hover.
- Content HTML is injected with `innerHTML` from the manifest (fine for trusted CMS content, but no sanitising layer).
- Orange accents fail contrast (stated).

## 7. Licensing and reuse

- Tour, About and policy pages carry "© Tapestry. All rights reserved." No Creative Commons or open-data licence statement appears on the tour page, the About page, or the Content Use & Embedding Policy (searched for "licen", "Creative Commons", "CC BY").
- Content Use & Embedding Policy (`/contentUseEmbed`), paraphrased: free embedding and sharing only in non-commercial, publicly accessible or educational contexts, unmodified, with visible attribution, CyArk branding retained and a link back; written permission is required for paywalled or commercial use, for modifying, redistributing or **extracting assets** for independent use, and for removing branding; CyArk can revoke embedding rights; no implied endorsement.
- Third-party rights sit on top: partner content from the Colonial Williamsburg Foundation, per-item credits (for example a university library special collection for a historic map), and the people filmed in the voice clips.
- Privacy policy names Google Analytics; no consent banner; Google Ads remarketing is active. Their privacy policy says the services are not intended for children under 13.

**We may not reuse:** any splat data, panoramas, images, audio, narration, video, VTT files, text (titles, descriptions, captions, bios), UI icons and graphics, the Tapestry or CyArk names and logos, or their first-party JS/CSS (no open-source licence found on the bundles). We should not embed their tours inside our judged entry either, since that would make their content part of our product.

**We may reuse:** interaction patterns and information architecture (narrated stops, scene list, timed "voice" prompts, numbered hotspot carousel, camera-to-viewpoint then panel), and the open-source libraries they build on, under those libraries' own licences (PlayCanvas engine MIT, three.js MIT, Video.js Apache-2.0; check GSAP's current licence before use).

## 8. Rebuilding each mechanism with our stack

Our stack (SYNTHESIS section 4): Astro static site, Photo Sphere Viewer (PSV) for 360 scenes with our DOM hotspot layer, vanilla three.js islands, model-viewer for objects, plain HTML dialogs, MP4 + WebVTT, `ihh-scene/1` JSON per scene.

| Tapestry mechanism | How they do it | Our build | Simpler alternative / note |
|---|---|---|---|
| Content source | 332 KB inline JSON, relational export, three copies of each list | One `ihh-scene/1` JSON per scene + per-inductee story file, validated at build; Astro renders HTML at build and ships only the active scene's data | Keep ids stable and normalised; no duplicated maps; per-scene payload in single-digit KB |
| Stops and navigation | Buttons "Go to scene N", `history.replaceState` to `/s<N>` | Astro static route per scene (`/<inductee>/scene-<n>/`) plus `#h-<id>` for a hotspot; real links, so it works without JS | Static routes need no server routing, which suits Vercel and the WordPress handoff |
| Scene rendering | Streamed Gaussian splats, 2 M splat budget, about 100 MB per set | PSV equirect 4096x2048 (WebP/JPEG, about 1-3 MB), 2048 fallback for low devices | If we ever want walk-through realism: PlayCanvas engine + `splat-transform` streamed SOG is the open path, but it needs real captures and 100 MB-class payloads; out of scope |
| Narrated camera move per stop | GSAP timeline between start and zoom viewpoints, seekable from audio time | PSV `viewer.animate({yaw, pitch, zoom, speed})` (returns a cancellable promise) on stop entry; skip entirely under `prefers-reduced-motion` | A static framed view with no move is acceptable; do not tie camera to audio scrubbing |
| Hotspots | DOM carousel of numbered thumbnail buttons; click flies camera to stored viewpoint then fills a side panel | Our DOM button list (already decided) plus PSV MarkersPlugin pins; `select-marker` or list button: `gotoMarker(id)` / `animate()`, then `dialog.showModal()` | Native `<dialog>` gives focus containment, Escape and backdrop for free, closing the gap they admit |
| Hotspot panel | Title, one image or native video (+ track), HTML text with Read more, credit line | `<dialog>` with `<figure>` (`<img>` with alt text and `srcset` at 640/1080/1600, or `<video controls playsinline preload="none">` with `<track kind="captions" srclang="en" default>`), text, source chips, credit, "cite this" | For 3D objects, `<model-viewer>` inside the same dialog; for documents, OpenSeadragon |
| "Voices" (people talking about the scene) | 25 Video.js MP4 clips with VTT; avatar bubbles appear at timed cues (`voice_pulse_wait` seconds) | Our avatars quoting verified words: native `<video>` or `<audio>` + VTT in a `<dialog>`, transcript below; show avatar buttons from the start (no timed reveal needed) | Dropping Video.js saves about 187 KB gz and an external CDN |
| Narration + captions | Hidden `<audio>` + VTT track, cue text copied to a caption box on `cuechange` | Same technique (`<audio>` + `<track>`, `cuechange` into a visible caption region), plus a full transcript on the page; guide voice as pre-rendered MP3 per stop | Keep captions on by default; store VTT next to the MP3 with long cache |
| Ambient sound | Looping MP3 bed | Optional, off by default, user toggle | Not needed for judging |
| Free explore (WASD in a box) | Oriented `explore_area`, joystick on touch, collision raycast | Not needed: our hall uses tap-to-go nodes and a guided camera path | |
| Splash preload | Preloads first set (about 104 MB) and all thumbnails behind "LOADING" | Preload only the first scene's panorama and poster; lazy-load thumbnails (`loading="lazy"`); show the 2D story spine immediately | The spine is usable before any WebGL starts |
| Engine fallback | WebGPU then WebGL2 then WebGL1, low render profile by UA | WebGL2 baseline; Lite mode (2D) by capability probe and toggle (already decided) | |
| Deep links to a voice or media item | `/s<N>/v<M>`, `/s<N>/mm<M>` | `#voice-<id>`, `#item-<id>` fragments that open the matching dialog on load | |
| Analytics | GA4 x2 + Google Ads remarketing, no consent banner | Off by default (decision in SYNTHESIS); if IHH wants it, cookieless GoatCounter with a notice | A remarketing pixel on a site for school audiences is a pattern to avoid |
| Diagnostics | `/diagnostics` capability report page | A small "check your device" note inside Lite mode | Optional |

Patterns worth copying: narrated stops with a visible scene list; one camera viewpoint per hotspot so the visitor sees the object before reading about it; numbered hotspots with thumbnails; per-item credit line; timed prompts that invite a second voice; captions on every narrated asset; focus moved into panels and restored on close; a live region announcing scene changes; pausing the 3D render loop while a panel covers the canvas (check how PSV handles this before adding our own gate; three.js islands need it explicitly).

Patterns to avoid: shipping the whole tour's data three times inline; 100 MB before the first click; single-size 1080 px JPEGs without `srcset` or modern formats; Video.js where native video suffices; `div` dialogs without focus containment; camera motion that ignores reduce-motion; duplicate IDs; ad-tech tracking without consent.
