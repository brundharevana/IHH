# 03 - Reference repos and technology options

Researched 2026-10-07. Facts below were read from GitHub API/raw files, npm registry, jsDelivr and fetched web pages in this session. Anything marked **[UNVERIFIED]** came from memory or a single secondary source and must be re-checked before relying on it. I did not clone any repo.

---

## Part A - The user's reference examples

### A1. KerimKochekov/Threejs-museum ("Museum Imaginarium")

| Item | Finding |
|---|---|
| Description | "Virtual Museum with threejs"; a student project (authors in file headers: Hitarth Singh and Kerim Kochekov, "Team 8"). |
| README | Goal: generate portraits on museum walls from whatever text the visitor types; wander in "ghost mode" (walk through walls). Run via `python3 -m http.server`. Lists challenges (no free Google image API, hand-rolled first-person camera, perf limit of 5 loaded objects) and future work (VR/AR, hidden flags, ML-generated images "to not have copyright issues"). |
| Stack | Plain HTML/JS, no bundler. Bundled `three.min.js` reports `REVISION="99"` (three.js r99, ~2019). Also vendored `build.three.js` (1.1 MB, contains Wayback Machine "wombat" injection code - an archive artefact), `TrackballControls.js`, `gltx.js`. Google Font "Amatic SC" loaded from fonts.googleapis.com. |
| Navigation | First-person, keyboard only. Arrow keys (keyCodes 37-40) plus U and J (look up/down), R restarts. Custom `Player.js` stepping the camera; passes through walls. No touch handlers found in the files I read (`museum.js`, `Player.js`). |
| Lighting | Ambient light, one point light, per-object SpotLights with shadow maps (1024) on non-bonsai/light objects. |
| Artifact interaction | Five glTF decor objects (bench, bonsai, light, neptune, philopoemen). A raycaster/pointer exists, but artifacts are mostly decoration; wall `PhotoFrame`s load textures from a URL. No info panels. |
| Audio | None found. |
| Last commit | 2024-10-25 ("removed url and put files through wayback machine"). Repo created 2022-11-15. 11 stars. |
| LICENSE | **None** (GitHub API `license: null`; no LICENSE file in root listing). No license = default copyright, all rights reserved. **We cannot legally reuse its code.** Bundled three.js (MIT) and the Sketchfab models carry their own terms, but the project's own code does not. |
| Asset licensing | Each model folder has a `license.txt` from Sketchfab: bench = **CC-BY-NC-4.0** (MADE.COM); bonsai, neptune, philopoemen, light = CC-BY-4.0 (credit required). Wall images came from a web image source (README admits "copyright issues"); the URL was removed in the last commit. |
| Performance | Repo 106 MB; `neptune/scene.bin` 30 MB, `philopoemen` 18.6 MB, `bonsai` 16 MB. README itself says loading objects slowed the game and capped objects at 5. Antialiasing off. Not mobile-friendly. |
| Code quality | Global variables, `"use strict"`, magic numbers, no tests, no build, keyCode (deprecated) input. Fine as a student demo; not a base to build on. |

### A2. theringsofsaturn/virtual-museum-tour-threejs

| Item | Finding |
|---|---|
| Description | Tutorial companion repo by Emilian Kasemi: guided camera tour of a 3D scan of the Hallwyl Museum "Great Drawing Room" (Stockholm). |
| README | Short; says it is a free tutorial about camera movement/animation for hotel/museum/heritage tours; links to the YouTube channel. |
| Stack | Webpack 5 + Babel; `three ^0.140.0` (2022), `gsap ^3.11.3`, `lil-gui ^0.16.1`. `src/script.js` is ~85 lines. |
| Navigation | **Guided camera path, not free-roam.** Each mouse-up advances through three hard-coded camera positions/rotations, animated by `gsap.to` over 3 s. OrbitControls are commented out. No keyboard path, no touch-specific code, no focus/ARIA. |
| Lighting | None added in code; relies on the baked textures of the Sketchfab scan. |
| Artifact interaction | None. Audio: none. |
| Last commit | 2022-11-21. 49 stars. |
| LICENSE | **No LICENSE file** (API `license: null`). `package.json` declares `"license": "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International"` and points at a different repo URL (`theringsofsaturn/virtual-tour`). That is a declaration inside package.json, not a license grant in a LICENSE file; CC licences are also not designed for software. Treat as: non-commercial + share-alike at best, ambiguous. **Do not copy code; re-implement the idea** (a camera path with GSAP is trivial and not copyrightable as an idea). |
| Asset licensing | `static/model/swedish-royal/license.txt`: "The Great Drawing Room" by The Hallwyl Museum, **CC-BY-4.0** (attribution required, commercial OK). |
| Performance | Single glTF with one **43 MB `scene.bin` and a 27.7 MB JPEG texture** (~71 MB total). Would be painful on mobile or weak connections. No compression (no Draco/Meshopt/KTX2). |
| Code quality | Clean and readable but tutorial-grade: no error handling, no resize handler, no loading indicator, no reduced-motion. |

Video (page metadata read via YouTube oEmbed and the watch-page HTML; **I did not and could not watch the video**; the following is only what the metadata says):
- Title: "How To Create A Virtual Museum Tour With Three.js | The Future of Cultural Heritage"; channel: Emilian Kasemi (@the_rings_of_saturn).
- Published 2022-11-20; length 8,557 s (~2h22m); 33,558 views at fetch time.
- Description says: a from-scratch Three.js tutorial building an "immersive VR museum tour"; install Node, `npm install`, `npm run dev`; links source repo and 3D scene `skfb.ly/6ypJL`. (Description also contains the author's Patreon and contact links.)

### A3. Sky0023/Virtual-Museum ("Samsarah")

| Item | Finding |
|---|---|
| Description | "A Virtual Reality (VR) Museum Depicting the Marvelous History of Mother Earth" - a NASA Space Apps-style hackathon entry about NASA Earth/space data for students. |
| README | Says it is a VR application built in **Unity**, with audio, visuals and games, for students; lists data sources (NASA, NOAA, Smithsonian forces.si.edu, National Geographic, Wikipedia, FuseSchool, a Google Drive file); links the demo video; source download as zip. |
| Stack | Unity **2019.4.5f1** (from `ProjectSettings/ProjectVersion.txt`); TextMesh Pro 2.0.1, Timeline, UniGLTF, "FirstPersion AIO Pack" (a first-person controller asset-store pack, third-party). C# scripts: `MainMenu.cs`, `OptionsMenu.cs`, `Proximity.cs`. |
| Navigation / controls | First-person VR/desktop walk (via the third-party FPS pack); rooms numbered Room1 to Room11. Proximity script (presumably triggers content when near). Exact controls: **[UNVERIFIED]**, not read. |
| Audio | Yes - `Assets/Sounds` has `First.wav` and per-room folders (Room1...Room11), i.e. per-room narration/ambience. Content not inspected. |
| Last commit | 2020-10-04. Created 2020-09-30. 12 stars. |
| LICENSE | **None** (API `license: null`). Cannot reuse. Repo also commits Unity `Library/`, `Logs/`, `Temp/` folders (426 MB), a hygiene smell. |
| Asset licensing | README lists sources but no per-asset licences; the third-party Unity pack and NASA/Wikipedia/YouTube-derived media are unverified. Treat as unclear. |
| Performance / mobile | Unity desktop/VR build; Unity WebGL builds are heavy (multi-MB, slow start), and nothing indicates a web build. Not a fit for a link-from-WordPress mobile experience. |
| Code quality | Not audited beyond structure; Unity project with committed build caches. |

Video (metadata only; not watched): "Virtual museum #lifeonearth#earthgeography #virtualtour #AR #VR #nasa #unity #digitalhistory", channel Amandeep Kaur; published 2020-10-04; 370 s (~6m10s); 767 views. The description is the README text above.

### A4. https://youtube.com/shorts/qmDPi82OZO0

Metadata only (not watched): oEmbed title "GPT-6 Astra + Blender + Unreal Engine" (with a emoji), channel "Bad Decisions Studio" (@badxstudio). Watch-page data: 91 s, published 2026-09-24, 65,165 views, **empty description**. I cannot tell what is shown, whether it is real software, or what tools were really used; the title is the only claim. Its likely draw (inference from title only): a flashy, AI-assisted, game-engine-quality 3D scene. Unreal Engine is not a web-deliverable path for this project (pixel-streaming/cloud cost or large downloads; out of scope for free hosting).

### A5. What the user probably finds "cool" and what is missing

Likely appeal (inference): walking through a 3D museum; cinematic camera moves between rooms (A2); photos on walls; immersive "game" feel; spatial audio/narration (A3).

| Gap | Detail |
|---|---|
| Accessibility | All three are canvas/engine-only: no keyboard-complete path (A1 arrow keys only, A2 click-only), no screen-reader text, no captions/transcripts, no reduced-motion, no focus management. Would fail WCAG 2.2 AA (2.1.1 keyboard, 1.1.1 non-text content, 2.2.2 pause/stop/hide, 2.3.3 is AAA but motion matters, 2.5.8 target size). |
| Mobile / weak network | A1 keyboard-only; A2 ships ~71 MB model; A3 is a Unity desktop/VR build. None has loading states, LOD, texture compression, or a lightweight fallback. |
| Credibility | None cites sources per fact; A1 even scrapes web images with unresolved copyright; A3 lists sources only at project level. No provenance, no "verified" labelling. |
| Content | They are shells: no real storyline, timeline, primary documents, or artifact detail pages. |
| Legal | No code licences in any of the three; one non-commercial model asset (A1 bench). Reuse = inspiration only. |

Implication: copy the *ideas* (guided camera path with eased moves, per-room audio, framed artifacts), not the code or assets.

---

## Part B - Free/open-source options (versions checked against npm/GitHub on 2026-10-07)

Sizes are gzip of the distributed minified file via jsDelivr unless noted (measured today). They exclude your own models/textures, which will dominate.

### B1. 3D world / scene

| Option | Version / license | Maturity | Size (gz) | Mobile | Accessibility | Fit |
|---|---|---|---|---|---|---|
| **three.js** | 0.186.1, MIT; last push today; ~24.3M weekly npm downloads | Very high | `three.module.min.js` 90 KB + `three.core.min.js` 104 KB = ~194 KB (tree-shaking a custom build can cut this) | Good (WebGL2) | None built in: canvas is opaque. You must supply DOM alternatives | **Best fit**: biggest ecosystem, free docs/examples, easy glTF + Draco/Meshopt/KTX2 |
| React Three Fiber + drei | R3F 9.8.1 (React >=19 <19.4, three >=0.156), drei 10.7.9; MIT | High | R3F small, but needs React (~+45 KB gz, general knowledge) | Good | Same as three; declarative scene helps structure, `drei` has `ScrollControls`, `CameraControls` | Good only if you already use React/Next. Extra abstraction for a 3-week solo build |
| Babylon.js | 9.29.0, Apache-2.0 | High | `babylon.js` 8.6 MB raw / 1.85 MB gz (whole bundle; ES-module tree-shaking helps) | Good | **Has built-in GUI/accessibility tree for GUI controls [UNVERIFIED detail]** | Heavy for weak connections |
| A-Frame | 1.8.0, MIT; last push 2026-07-13; ~38K weekly | Medium | not measured (CDN path returned a stub); roughly 1 MB raw **[UNVERIFIED]** | OK; WebXR focus | Declarative HTML entities, but still canvas | Great for VR prototypes; not needed here |
| PlayCanvas engine | 2.23.1, MIT | High | 2.55 MB raw / 656 KB gz | Very good (built for mobile web) | Canvas only | Strong, but fewer solo-dev tutorials than three |
| Gaussian splats: **Spark** (`@sparkjsdev/spark`) | 2.3.1 (2026-10-01), MIT; requires three >=0.180; reads PLY/SPZ/SPLAT/KSPLAT/SOG | Active, young | 2.67 MB raw / **920 KB gz** | Claims low-power mobile support (README) | Canvas only | Only worth it if a real splat scan of a place/object exists. Not for a 3-week build. (`gsplat.js` not evaluated.) |

First-person vs guided: **choose a guided camera path** (scroll or "Next stop" button, with eased moves, plus orbit-on-demand for artifacts). Reasons: works with one thumb on mobile, avoids joystick/WASD pitfalls (WCAG 2.1.1, 2.5.x), allows a keyboard/screen-reader-equivalent "list of stops", cheaper than collision/walk meshes, and loads one room at a time. Offer free-look only as an enhancement.

### B2. 360 panoramas

| Option | Version / license | Maturity | Size (gz) | Notes |
|---|---|---|---|---|
| **Pannellum** | 2.5.7 (2026-02-19), MIT, no dependencies | Mature, slow-moving | `pannellum.js` ~18 KB gz (+CSS) | Tiny, WebGL with CSS fallback, hotspots, multires, keyboard control. Easiest for weak networks. **Fit: excellent** |
| **Photo Sphere Viewer** | `@photo-sphere-viewer/core` 5.15.1 (pushed 2026-10-01), MIT; three.js-based | Active | core ESM ~33 KB gz + three.js (shared if you already ship three) | Plugins: markers, virtual tour, gallery, autorotate; keyboard navigation and ARIA labels on controls **[UNVERIFIED detail]**. **Fit: excellent** if three is already loaded |
| Marzipano | 0.10.2, Apache-2.0 | **Repo archived 2026-04-20** (read-only) | ~51 KB gz | Do not start new work on an archived library |

Free / CC 360 imagery sources:
- **Poly Haven**: all assets CC0 (verified via search result of their FAQ); mostly HDRIs of outdoor/indoor environments, 1K to 16K, equirectangular. Good for sky/ambient lighting; unlikely to match historical sites.
- **Wikimedia Commons** has "360° panoramas" categories with per-file licences (CC BY/SA, PD). Must check each file's licence and attribution. Not verified in this session which specific files fit.
- **Own captures**: a phone panorama app or a Insta360-type camera at a public historic site (Ellis Island etc. permit rules apply) - gives full rights. For a deceased inductee, historical rooms usually must be **illustrated/rendered** rather than photographed; render equirectangular images from Blender (free) or generate a stylised illustration and label it as a reconstruction.
- Google Street View imagery is **not** free to extract/reuse (Google terms); avoid.

### B3. 3D artifact viewers

| Option | Version / license | Size (gz) | Notes |
|---|---|---|---|
| **`<model-viewer>`** | 4.3.1 (2026-06-04), Apache-2.0; ~677K weekly downloads | 289 KB gz (1.07 MB raw, includes three) | Web component: `alt` text, keyboard orbit (arrow keys), poster image, lazy reveal, AR "view in your space" on supported phones, `interaction-prompt`. Best accessibility among viewers. Lazy-load it per artifact. **Fit: best for artifacts** |
| Smithsonian Voyager (`Smithsonian/dpo-voyager`) | v0.67.0 (2026-10-02), Apache-2.0 | Full explorer is heavy | Annotated, narrated 3D with tours, articles, audio; authored in Voyager Story. Good for scholarly feel but heavier and its own UI. Optional |
| Smithsonian 3D content (3d.si.edu) | ~2,200 models (per search result); items marked **CC0** are free for any purpose, no attribution required | - | Direct fetch of 3d.si.edu returned 403 to scripts, so use a browser. Useful only if an inductee relates to a Smithsonian object; check per-item licence |
| Sketchfab embeds / downloads | Per-model licence (CC BY, BY-NC, BY-SA, BY-ND, CC0); as seen in the reference repos | Embed = iframe to Sketchfab | CC downloads require crediting the author (Sketchfab help). **BY-NC models can be a problem if IHH is commercial or ever monetised**; BY-ND forbids editing (e.g., converting/compressing is a grey area). Third-party iframe weakens offline/privacy and adds weight. Prefer self-hosted glTF with credits shown on the artifact card |

Pipeline for artifacts: source model -> `@gltf-transform/cli` 4.5.1 (MIT) for Draco/Meshopt + WebP/KTX2 textures -> aim for < 2 MB per artifact. Always provide a 2D image + text description fallback.

### B4. Deep zoom / primary documents (IIIF)

| Option | Version / license | Size (gz) | Notes |
|---|---|---|---|
| **OpenSeadragon** | 6.1.1, BSD-3-Clause; ~155K weekly | 87 KB gz | Deep-zoom viewer; supports IIIF Image API tile sources; keyboard zoom/pan; add `alt` via surrounding markup. **Fit: best for one document/photo** |
| Mirador | 4.2.6 (pushed today), Apache-2.0; ~7K weekly | 574 KB gz | Full IIIF workspace (compare, annotate). Over-built for this |
| Universal Viewer | 4.4.4, MIT (repo metadata says NOASSERTION but LICENSE.txt and package.json are MIT) | not measured | Full-page viewer for manifests, good a11y effort **[UNVERIFIED]**; heavy |

**Library of Congress and IIIF: yes.** I verified that the LoC Image Services API is IIIF-compliant and that `https://tile.loc.gov/image-services/iiif/<id>/info.json` returns IIIF Image API v2 info (tested on a map: 6209 x 4255 px, 512 px tiles). The IIIF community guide says to copy the "Manifest (JSON/LD)" link from an item page. Caveats from my testing: `www.loc.gov/item/...` requests from a script were blocked by a Cloudflare challenge (403), so server-side scraping of loc.gov JSON/manifests may fail; fetch manifests/IDs in a browser or via their documented API with a user agent and obey their rate limits ("Working Within Limits" page - details not read). Rights are **per item** (many LoC items are "no known restrictions", others are not): record `rights_advisory`/rights statement in the provenance log for each primary source. Hotlinking vs self-hosting: for performance and resilience, download a derivative (e.g., 2000 px JPEG or tile pyramid) when rights allow and cite the LoC URL.

### B5. Scrollytelling / animation

| Option | Version / license | Size (gz) | Notes |
|---|---|---|---|
| **GSAP** | 3.15.0 (2026-04-13). **"Standard 'no charge' license"** (not MIT), now owned by Webflow. gsap.com states "GSAP is now free for everyone, thanks to Webflow's support", including plugins (ScrollTrigger etc.) | core 28 KB gz | The license permits commercial and non-commercial use if end users are not charged a fee to access the product; prohibits use in tools that let users build visual animations without code and compete with Webflow. Our showcase is free to view, so it is fine. Source is not OSI open-source: if "open-source only" is a strict rule, prefer Motion + native CSS scroll-driven animations |
| **Motion** (formerly Framer Motion, `motion`) | 14.0.0 (2026-10-02), MIT; ~28M weekly | ~48 KB gz (bundlephobia full; smaller with the mini/`animate` entry) | Imperative `animate()`, `scroll()`, springs; hardware-accelerated; supports `prefers-reduced-motion` handling. **Fit: good, MIT** |
| Lenis | 1.3.26, MIT; ~2M weekly | 5.4 KB gz | Smooth scroll. Smooth-scroll hijacking can hurt accessibility (keyboard, find-in-page, reduced motion); only enable when `prefers-reduced-motion: no-preference`, never on touch where native momentum works. Optional |
| Scrollama | 3.2.0, MIT | 2 KB gz | IntersectionObserver-based step triggers; ideal for timeline steps and keeps native scroll. **Fit: good** |
| Native CSS scroll-driven animations / View Transitions | Browser feature | 0 KB | Check support per browser before relying; use as progressive enhancement |

Recommendation: Scrollama (or plain IntersectionObserver) for steps + Motion or GSAP for the camera/tweens. Whichever, wrap all motion in a reduced-motion check and give a pause/stop control (WCAG 2.2.2).

### B6. Stylized talking avatar from free tools

Licence/status check table (verified today unless marked):

| Tool | Licence | Status | Verdict |
|---|---|---|---|
| **Kokoro-82M** (TTS) | Model Apache-2.0 (Hugging Face card); `hexgrad/kokoro` Apache-2.0; `kokoro-onnx` MIT (v1.14.0 2025-04; push 2026-09-01); ~300 MB, ~80 MB quantised, runs on CPU | Active; English-first with preset voices | **Best TTS choice**: permissive, small, good quality, offline, pre-bake audio at build time |
| Piper | Original `rhasspy/piper` MIT but **archived** (last push 2025-08-26); continued at `OHF-Voice/piper1-gpl` as **GPL-3.0** (embeds espeak-ng) | Active, "looking for maintainers" | Usable for offline batch generation. GPL applies to distributing the Piper software; whether it reaches the audio output is a legal interpretation **[UNVERIFIED]**; each voice has its **own dataset licence/model card** (HF repo says so) - check the specific voice |
| Coqui XTTS-v2 | Model under **CPML (coqui-public-model-license), non-commercial**; code (`idiap/coqui-ai-TTS` fork) MPL-2.0 | Coqui the company is defunct; Idiap fork active | **Avoid**: non-commercial model licence; and voice *cloning* of a real person is exactly what we should not do |
| Rhubarb Lip Sync | MIT (its LICENSE.md also states output belongs to you); v1.14.0 (2025-04-03) | Stable, maintenance mode | **Best lip-sync**: audio (+ optional dialogue text) in -> timed mouth shapes A-H/X out (Preston Blair-style 2D cartoon visemes). English-optimised (language support for others is limited - **[UNVERIFIED]**) |
| SadTalker | Apache-2.0 "except third-party components" (Tencent LICENSE); last push 2024-06 | Dormant | Makes photoreal talking heads from a photo - wrong aesthetic (non-stylised, uncanny, deepfake territory). Skip |
| LivePortrait | MIT code (KlingAIResearch/LivePortrait), but default face-detection uses **InsightFace weights, non-commercial research only**; MediaPipe alternative exists (search results) | Active | Photoreal animation of a real photo of a real person: **do not use** here (deepfake risk, conflicts with "clearly non-photoreal") |
| Wav2Lip | **Non-commercial/research only** (README) | Dormant | Skip |
| TalkingHead (met4citizen) | MIT; active (push 2026-09-25); needs GLB with ARKit + Oculus visemes | Active | 3D avatar in-browser; heavier; avatar sources are the problem (below) |
| three-vrm (`pixiv/three-vrm`) | MIT; active | Active | Loads VRM avatars (VRoid Studio); anime-style. Possible, but a VRM model of a historical person must still be authored |
| Ready Player Me | Public services (avatar creator, APIs) **ended 2026-01-31** after Netflix acquisition (from genies.com blog and a news-tag site; one search, not primary source) | Dead | Do not depend on it |
| Live2D Cubism | Proprietary SDK/runtime with its own licence terms **[UNVERIFIED]** | - | Not free/open; skip |

Practical pipeline for a solo dev in 3 weeks (recommended):

1. **Script**: 20-40 s lines written only from entries in the verified-facts log (each sentence carries fact IDs). Human-review every line.
2. **Voice**: Kokoro (kokoro-onnx) with a stock voice, generated offline to MP3/OGG. A generic synthetic voice, **not** a clone of the inductee.
3. **Visemes**: Rhubarb on each WAV -> JSON of timed mouth cues.
4. **Character**: an original, flat 2D illustration (SVG, layered: head, eyes, brows, 6-9 mouth shapes) designed so it is evidently a drawing, not derived from a photo by an AI face-swap tool. Animate in the browser (CSS/SVG swap of mouth `<path>`s driven by the Rhubarb timeline + simple blink/head-bob), so the "video" is tiny: audio + JSON + SVG, with **WebVTT captions and a text transcript**.
5. **Optional pre-render** to MP4/WebM (headless Chromium + ffmpeg, both free) for YouTube/WordPress sharing, with burned-in label.
6. **Labelling**: persistent on-screen badge "AI recreation - illustrated, synthetic voice. Script uses only sourced facts" plus a "Sources for this clip" link listing fact IDs.

Legal caveats (not legal advice):
- Right of publicity / likeness of a deceased person varies by jurisdiction and some states have post-mortem rights **[UNVERIFIED which apply]**; a stylised illustration with disclosure lowers risk but IHH should clear the use with its counsel and, if possible, the estate/inductee.
- Never clone a real voice (XTTS CPML also bans commercial use; ethical/impersonation risk). Do not put invented words in the inductee's mouth as quotes: use third-person phrasing ("In 1892 she...") or only verified direct quotes with citation.
- Kokoro/Piper voice: check licence of the chosen voice; keep the licence text in the repo credits.
- Illustration assets: if using generative image tools, check their output terms; draw it yourself or use CC0/own art.
- Accessibility: captions (WCAG 1.2.2), audio-description alternative or full transcript (1.2.3/1.2.5), no autoplay with sound (1.4.2), pause control (2.2.2).

### B7. WordPress integration (least effort for IHH)

| Approach | Effort for IHH | Pros | Cons |
|---|---|---|---|
| **Link + card** (button/image linking to showcase URL) | Minimal | Zero risk, works in any theme, best perf on WordPress page | Leaves the site |
| **iframe in a Custom HTML block** | Low | One paste; keeps visitors on IHH pages | WordPress strips `<iframe>` on save for users **without `unfiltered_html`** (search results; typically only Admin/Super Admin have it on multisite). Needs `title`, `allow="fullscreen"`, `loading="lazy"`; iframe + 3D + touch scroll conflicts on mobile; need Vercel to allow framing (`Content-Security-Policy: frame-ancestors <IHH domain>`, no `X-Frame-Options: DENY`) |
| **oEmbed** (paste URL) | Low if registered | Native editor experience | WordPress only auto-embeds providers it knows plus any registered with `wp_oembed_add_provider()` (documented function); the showcase would have to implement oEmbed JSON endpoint and IHH adds a small snippet - extra work |
| **Shortcode / small plugin** (`[ihh_showcase slug="..."]` printing a sandboxed iframe + fallback link) | Medium (one plugin file) | Editors without `unfiltered_html` can use it; centralises the allowed origin and a11y attributes | Needs plugin install rights on IHH's host (**IHH hosting type unknown - unverified**) |
| Gutenberg block | Medium-high | Best editor UX | Needs build tooling and maintenance |
| WP REST API content import (`/wp-json/wp/v2/posts`, Application Passwords) | Medium | Lets us push the 4 inductee write-ups as draft posts/pages automatically; avoids copy-paste | Needs IHH to issue an Application Password/credentials and agree to the schema; **we must not ask for or store credentials in this repo**. Details from general knowledge **[UNVERIFIED this session]** |

Recommendation: deliver (1) 4 inductee pages as plain Gutenberg-compatible HTML/Markdown (paste-ready, no scripts), (2) a link/card to the showcase, (3) an optional iframe snippet with `title` and fallback link, plus (4) a 40-line shortcode plugin as a stretch. Keep the REST import as an offer only.

### B8. Chatbot-ready content: provenance formats

Goal: every fact is a record with source, quote/locator, retrieval date, rights, confidence, reviewer. Keep a **canonical flat file** and derive linked data from it.

| Format | Use | Notes |
|---|---|---|
| **CSV/JSONL** (canonical, one fact per row) | Easy for non-developers (Google Sheets), easy to embed for RAG | Columns: `fact_id, inductee, statement, date, source_id, locator, quote, source_url, retrieved_on, rights, confidence, verified_by, verified_on, status` |
| **JSON-LD with schema.org** | Machine-readable, SEO, can sit on the WordPress page in `<script type="application/ld+json">` | `Person`, `Event`, `CreativeWork`, `citation`, `isBasedOn`, `ClaimReview` (verified as a schema.org type: fact-check of a claim; likely over-kill). `schema.org/Claim` and `appearance` are **[UNVERIFIED]** |
| **W3C PROV-O** | Rigorous provenance: `prov:Entity` (the fact), `prov:wasDerivedFrom` (the source), `prov:wasAttributedTo` / `prov:Agent` (who verified), `prov:Activity` (verification/transcription); W3C Recommendation 2013-04-30 | Good for the formal story; use a light subset |
| Source registry (`sources.csv`) | One row per source with licence and archive link | Referenced by `source_id`; add Wayback/`archive.org` snapshot URL for link rot |

Minimal JSON-LD example record (fields are illustrative, values are placeholders, not real facts):

```json
{
  "@context": {"schema": "https://schema.org/", "prov": "http://www.w3.org/ns/prov#"},
  "@id": "https://example.org/facts/INDUCTEE-001-F007",
  "@type": ["schema:CreativeWork", "prov:Entity"],
  "schema:text": "<one-sentence factual statement>",
  "schema:about": {"@id": "https://example.org/inductees/INDUCTEE-001"},
  "schema:dateCreated": "<ISO date the fact refers to>",
  "schema:citation": [{
    "@type": "schema:CreativeWork",
    "schema:name": "<source title>",
    "schema:url": "<source URL>",
    "schema:license": "<rights statement URL>"
  }],
  "prov:wasDerivedFrom": {"@id": "https://example.org/sources/SRC-012"},
  "prov:wasAttributedTo": {"@id": "https://example.org/people/reviewer-1"},
  "schema:additionalProperty": [
    {"@type": "schema:PropertyValue", "name": "locator", "value": "<page/timestamp>"},
    {"@type": "schema:PropertyValue", "name": "confidence", "value": "high|medium|low"},
    {"@type": "schema:PropertyValue", "name": "verified_on", "value": "<ISO date>"}
  ]
}
```

Rules to hand the future chatbot: answer only from rows with `status=verified`; return `fact_id` + source with every answer; refuse otherwise.

---

## Recommended stack (3-week solo plan)

| Layer | Pick | Why | Risk / note |
|---|---|---|---|
| Hosting / framework | Vite or Astro static site on Vercel; no server | Free, fast CDN, static JSON data | Allow IHH framing via CSP `frame-ancestors` |
| 3D scene | **three.js 0.186.x** (MIT), guided camera path | Mature, tree-shakable, mobile-ok | Provide DOM "stops" list + skip link |
| Alternate if already React | R3F 9 + drei | Convenience | extra React weight |
| 360 | **Pannellum 2.5.7** (18 KB) or **Photo Sphere Viewer 5.15** (reuses three) | Small, MIT, keyboard | Not Marzipano (archived) |
| Artifacts | **`<model-viewer>` 4.3.1**, lazy-loaded; glTF-Transform for compression | Alt text, keyboard, AR | 289 KB gz; self-host models + credit lines |
| Primary docs | **OpenSeadragon 6.1.1** on LoC IIIF tiles (`tile.loc.gov`) or self-hosted derivatives | Deep zoom, BSD | Per-item rights; Cloudflare may block scripted loc.gov calls |
| Timeline / scrolly | Scrollama + native CSS/Motion 14 (or GSAP 3.15 if source-available is acceptable) | Small, MIT; reduced-motion aware | Skip Lenis on touch |
| Avatar | Kokoro TTS + Rhubarb + original SVG character + WebVTT | Permissive licences, tiny payload | Label as AI recreation; no voice cloning; legal clearance |
| Content / provenance | CSV/JSONL canonical + JSON-LD export (schema.org + PROV-O subset) | Chatbot-ready | Human verification step |
| WordPress | Paste-ready HTML pages + link card + optional iframe/shortcode | Least IHH effort | `unfiltered_html` issue for iframe |
| Fallback | `<noscript>` and "Lite mode" (static images + text + captions) auto-selected on `Save-Data`, slow `connection.effectiveType`, no WebGL, or reduced-motion | Weak connections, a11y | Required for WCAG 2.2 AA story |

Accessibility must-haves: complete keyboard path, visible focus, target size >= 24x24 CSS px (2.5.8), no drag-only interaction (2.5.7), alt text/long descriptions for every artifact, captions and transcripts for every clip, pause for motion/audio, no flashing, colour contrast 4.5:1, reduced-motion respected, semantic HTML timeline alongside the canvas.

---

## Search log (all 2026-10-07)

GitHub API / raw:
- `https://api.github.com/repos/{KerimKochekov/Threejs-museum, theringsofsaturn/virtual-museum-tour-threejs, Sky0023/Virtual-Museum}` (+ `/commits?per_page=1`, `/contents`, `/git/trees/master?recursive=1`, `/contents/js|assets|objects|Assets/Sounds|Assets/Scripts|Packages/manifest.json`)
- raw.githubusercontent.com: Kerim `README.md`, `index.html`, `js/Player.js`, `js/museum.js`, `js/PhotoFrame.js`, `js/three.min.js`, `js/build.three.js`, `objects/*/license.txt`; ringsofsaturn `README.md`, `package.json`, `src/script.js`, `static/model/swedish-royal/license.txt`; Sky0023 `README.md`, `ProjectSettings/ProjectVersion.txt`
- GitHub repo metadata/licence/last push for: mrdoob/three.js, pmndrs/react-three-fiber, pmndrs/drei, BabylonJS/Babylon.js, aframevr/aframe, playcanvas/engine, sparkjsdev/spark, nianticlabs/spz, mpetroff/pannellum, mistic100/Photo-Sphere-Viewer, google/model-viewer, Smithsonian/dpo-voyager, ProjectMirador/mirador, UniversalViewer/universalviewer, openseadragon/openseadragon, rhasspy/piper, OHF-Voice/piper1-gpl, thewh1teagle/kokoro-onnx, hexgrad/kokoro, idiap/coqui-ai-TTS, DanielSWolf/rhubarb-lip-sync, OpenTalker/SadTalker, KwaiVGI/LivePortrait (moved to KlingAIResearch/LivePortrait), Rudrabha/Wav2Lip, met4citizen/TalkingHead, pixiv/three-vrm, darkroomengineering/lenis, motiondivision/motion, russellsamora/scrollama, greensock/GSAP; releases for dpo-voyager, rhubarb, kokoro-onnx, pannellum
- Licence files: UniversalViewer `dev/LICENSE.txt`, `dev/package.json`; rhubarb `LICENSE.md`; SadTalker `LICENSE`; Wav2Lip `README.md`; KlingAIResearch/LivePortrait `README.md` (grep found no InsightFace text; relied on web search)
- Hugging Face API: `hexgrad/Kokoro-82M`, `rhasspy/piper-voices`, `coqui/XTTS-v2`

YouTube:
- oEmbed `https://www.youtube.com/oembed?url=...&format=json` for watch?v=8oQC0ICNtL0, watch?v=focptfnnWIY, shorts/qmDPi82OZO0
- Watch/shorts pages (HTML metadata: description, length, publish date, views)

npm / CDN:
- registry.npmjs.org `latest` and full docs for three, @react-three/fiber, @react-three/drei, babylonjs, aframe, playcanvas, @sparkjsdev/spark, pannellum, photo-sphere-viewer, @photo-sphere-viewer/core, marzipano, @google/model-viewer, openseadragon, mirador, universalviewer, gsap, motion, lenis, scrollama, @gltf-transform/cli
- api.npmjs.org weekly downloads; bundlephobia (motion); cdn.jsdelivr.net file sizes; data.jsdelivr.com (PSV listing)

Web fetches / searches:
- `https://gsap.com/standard-license/`; `https://github.com/sparkjsdev/spark`; `https://github.com/met4citizen/TalkingHead`; `https://github.com/google/marzipano`; `https://guides.iiif.io/guides/loc.gov/`; `https://www.loc.gov/apis/`; `https://3d.si.edu/` (403); `https://huggingface.co/rhasspy/piper-voices`; `https://developer.wordpress.org/reference/functions/wp_oembed_add_provider/`; `https://www.w3.org/TR/prov-o/`; `https://schema.org/ClaimReview`; `https://readyplayer.me` (no usable content)
- loc.gov direct: `https://www.loc.gov/item/2002706057/?fo=json` and `/manifest.json` (Cloudflare 403 challenge); `https://tile.loc.gov/image-services/iiif/service:gmd:gmd370m:g3700m:g3700m:gla00130:ca000120/info.json` (200, IIIF v2)
- Web searches: "Ready Player Me shutdown 2026 avatar service end date"; "Library of Congress IIIF API images manifest loc.gov"; "LivePortrait InsightFace non-commercial license commercial use"; "Smithsonian Open Access CC0 3D models 3d.si.edu Voyager embed"; "Sketchfab Creative Commons models download attribution CC BY NC embed terms"; "WordPress iframe tag stripped unfiltered_html Custom HTML block editor role iframe embed allowed"; "Poly Haven HDRI CC0 license 360 panoramas free Wikimedia Commons equirectangular"

Not done / open: videos not watched; Mirador/UV/Babylon a11y not tested; Wikimedia 360 file candidates not enumerated; A-Frame bundle size not measured; WP REST/capability details from general knowledge; gsplat.js and Live2D terms not checked; legal points need counsel.
