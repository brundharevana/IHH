# B1-R2: Producing 15-20 historically grounded, navigable 360 scenes with free tools, by parallel AI agents

Route R2. Researched 2026-10-08 (all "accessed" dates below are 2026-10-08 unless stated). No final recommendation is given; section 5 lists implications only.

Prior research skimmed first (not repeated): `00-synthesis.md`, `02-museum-best-practices.md`, `03-reference-repos-and-tech.md`. This report adds what those did not cover: licence verification of asset and depth/AI models, a production-method comparison, empirical probes (two small prototypes run in this session), a scene-descriptor design, and hotspot accessibility evidence.

Environment facts that bound what could be tested here: Apple M1, 8 GB RAM, and the data volume was at 100% (743 MB free of 228 GB at check time). Blender (330 MB download) and the `bpy` wheel (245 MB on macOS arm64) could not be installed, so no Blender render was run. Browser tests ran in the in-app Chromium (ANGLE Metal, Apple M1), desktop only. No iOS Safari or Android device was tested.

---

## 1. Findings per sub-route

### 1.0 One-page method comparison (evidence-based where cited below; time-per-scene figures are my estimates and are marked low confidence)

Scale: H/M/L = high/medium/low. "Agent-days" = one AI coding agent working roughly one day.

| Criterion | M1 Procedural three.js (+CC0 kit), baked to equirect or live | M2 Blender + bpy, rendered equirect | M3 Real PD/CC panoramas | M4 Archival photos in 3D (planes, 2.5D depth) | M5 AI-generated 360 | M6 Splat / photogrammetry |
|---|---|---|---|---|---|---|
| Historical accuracy | L by default (generic props); M if props are modeled from named references | Same as M1 | H for the present-day place, but wrong era for a deceased inductee's workplace | H: the artefact is the real photograph (depth is inferred) | L: model invents period detail | H only if a capture of the real place exists (none found for these five) |
| Label to use | "Illustrative reconstruction" with per-object evidence tier | Same | "Present-day photograph, place as it looks now" | "Archival photograph" plus "depth effect estimated by software" | "AI-generated atmosphere, not a depiction" | "Scan of the real object/place" |
| Visual quality | Stylised, game-like; the prototype below is coherent but crude | Higher ceiling (path-traced GI, baked lighting) | Varies per file | Strong for the single view; edge stretching on parallax | High surface polish, wrong detail, seams and pole artefacts | High if a capture exists |
| Time per scene (estimate, L confidence) | 0.5-1.5 agent-days once a shared kit exists; 2-4 agent-days once for the kit | 1-2 agent-days; more toolchain friction | Hours when a file exists; availability near zero for these places | 0.25-0.5 agent-days per photo-scene | Minutes to generate, hours to curate and label; free generation is a blocker (see 1.5) | Not applicable (no source captures) |
| Agent without art skills | Yes for primitives and kits; weak on taste and layout; needs a screenshot feedback loop | Feasible (bpy documented, MCP exists) but API drift and weak 3D editing skill in benchmarks | Yes (search and license check) | Yes (image in, depth map out, plane placed) | Prompting is easy; accuracy control is not | Not applicable |
| File size / mobile | Baked 4096x2048: 88-241 KB in the prototype (simple scene); real textured scenes unmeasured. Live glTF: keep to about 2 MB per Google's case study | Same as M1 for the panorama | Strips can be huge (12368x816, 1.4 MB seen) | Photo plus 8-bit depth: small | 1024x2048 native output for DiT360; upscaling adds a step | Splat files are tens of MB (not measured) |
| Licence risk | Low with a CC0 allowlist | Low (Blender output is the creator's) | Per file: CC BY needs credit, CC BY-SA needs share-alike | Photo rights per item (other route); depth models: pick Apache-2.0 sizes | Medium to high (see 1.5) | Per capture |
| Hotspot authoring | Anchor in 3D world coordinates, derive yaw/pitch (verified) | Same, from empties | Manual yaw/pitch | Image-space (u,v), easy | Manual yaw/pitch | 3D anchors |
| Consistency over 20 scenes | H with one kit, one lighting rig, one bake setting | H with a shared .blend library | L | M | L | L |

Reading of the matrix: only M1, M2 and M4 can plausibly supply 15-20 scenes of these five inductees; M3, M5 and M6 are supplements at best (evidence in 1.3, 1.5, 1.6).

---

### 1.1 Method 1 - Procedural, code-built stylised 3D (three.js / React Three Fiber) with free CC0 assets

**Free asset licences, verified against the publishers' own pages**

| Source | Licence as published | Notes | Evidence |
|---|---|---|---|
| Poly Haven | CC0, any purpose including commercial, no attribution; you may not claim authorship or re-license; site text, logos and renders are not CC0 | Roughly 2,400 HDRIs, textures, models (per the blender-mcp README, 2026-10-06) | "Poly Haven License" https://polyhaven.com/license ; FAQ https://polyhaven.com/faq (both accessed 2026-10-08) |
| ambientCG | CC0 1.0, commercial use allowed, attribution optional; materials, HDRIs, models | | "ambientCG License" https://docs.ambientcg.com/license/ (accessed 2026-10-08) |
| Kenney | CC0, commercial projects allowed, attribution optional, Kenney logo not usable | The page does not address AI-dataset use or redistribution of packs | "Kenney Support" https://kenney.nl/support (accessed 2026-10-08) |
| Quaternius | CC0 for all models, no attribution, modification allowed | Verified in the FAQ (homepage alone did not state the licence). Relevant packs: Ultimate House Interior, Ultimate Furniture, Modular Medieval, Downtown City MegaKit | "Quaternius F.A.Q." https://quaternius.com/faq.html (accessed 2026-10-08) |
| Poly Pizza | Per model, not per site: a sampled model page shows "Creative Commons Attribution"; the site also hosts CC0 models. 10,700+ models on the homepage; "Poly by Google" imports appear | Needs a per-asset licence field in the credits manifest. Only one model page was read | https://poly.pizza/ and https://poly.pizza/m/6XXj6DSBb08 read in the in-app browser (2026-10-08); WebFetch got 403 on poly.pizza, so the browser pane was used |
| Sketchfab (API still live) | Per model (CC0, CC BY, BY-NC, etc.) | See 1.6 for coverage and the Epic/Fab transition | https://api.sketchfab.com/v3/search (queried 2026-10-08) |

Style caveat (my reasoning, not a sourced claim): Kenney and Quaternius are game-art kits in a flat low-poly style; Poly Haven/ambientCG are photoscanned PBR. Mixing both breaks the "consistent look" requirement, so a kit decision (one visual language) matters more than asset count.

**three.js capabilities relevant to scene baking and hotspots (Context7, three.js docs)**
- Equirectangular as background and lighting: set `texture.mapping = THREE.EquirectangularReflectionMapping`, use `PMREMGenerator.fromEquirectangular`; the docs say the ideal PMREM input is 1024 x 512 (minimum 64 x 32). Source: Context7 `/mrdoob/three.js` (PMREMGenerator, HDRLoader examples), accessed 2026-10-08.
- Hotspots by raycasting: `Raycaster.setFromCamera` plus `intersectObjects`. Doc caveat: for meshes, faces must point toward the ray origin, so picking from inside an inverted sphere needs `side: DoubleSide`. Source: three.js `Raycaster` docs via Context7, accessed 2026-10-08.
- HTML labels on 3D: `CSS2DRenderer`/`CSS2DObject`, or manual `Vector3.project(camera)` with a raycast occlusion check (three.js manual example `align-html-to-3d-w-sorting`). Source: Context7 `/mrdoob/three.js`, accessed 2026-10-08.
- React Three Fiber / drei: `<Html occlude="blending">` for annotations; `<Environment files="...hdr|exr|jpg">`; `<Environment preset="city">` is documented as not meant for production because it depends on a CDN; `useGLTF` loads the Draco decoder from `gstatic.com` by default, so self-hosting needs `useDraco='/path'`. Source: Context7 `/pmndrs/drei` docs (environment.mdx, html.mdx, gltf-use-gltf.mdx), accessed 2026-10-08. Versions: three 0.186.1 (MIT, published 2026-09-24), @react-three/fiber 9.8.1, @react-three/drei 10.7.9 (npm registry, 2026-10-08).

**Empirical probe 1 (run in this session): can a code-only scene be baked to a 4096x2048 equirect with no art tools?**
Setup: a ~100-line three.js 0.186.1 script built an 18-mesh "study" (primitives, canvas-generated wood and chalkboard textures, one instanced bookshelf of 120 books, one directional light with shadows, one point light, three artifact anchors). It rendered a 1024-face CubeCamera, converted it to equirect with a fragment shader, and exported JPEG/WebP via canvas.
Results (Chrome, ANGLE Metal, Apple M1, MAX_TEXTURE_SIZE 16384):
- Scene build 15-48 ms; cube bake 49-62 ms; equirect pass 45-47 ms; whole page including CDN load about 1.8-2.1 s.
- Output 4096x2048: JPEG q0.82 = 241-261 KB, WebP q0.8 = 88-94 KB (trivial flat-shaded scene; a textured scene will be larger and was not measured).
- Hotspot yaw/pitch were computed directly from the 3D anchor positions (`yaw = atan2(x, -z)`, `pitch = asin(y/|v|)`) and the markers landed on the correct objects once the image was correct.
- Visual result: coherent, readable, obviously stylised and crude (primitive furniture). It is a proof of the pipeline, not of attainable visual quality.
- Bug found by looking at the output: the first bake was horizontally mirrored (chalkboard text reversed, left/right swapped) because I added an extra `d.x = -d.x` when sampling the cube render target. Removing it fixed text, handedness and marker alignment. Lesson: handedness and yaw-sign errors are silent, so a parallel-agent pipeline needs an automated calibration/golden-image test, not just "it renders".
- Not done: no Playwright/headless-CI run; no mobile device.

Confidence: high that the technique works as described; low on attainable quality and on per-scene time.

---

### 1.2 Method 2 - Blender (free) with Python (bpy), equirectangular render, shown in Pannellum / Photo Sphere Viewer

- Current release: Blender 5.2.2 LTS, released 2026-09-15 ("2 years of LTS updates"), macOS Apple Silicon download 330 MB, requires macOS 13+. Source: "Download Blender" https://www.blender.org/download/ (accessed 2026-10-08).
- Output ownership: the licence page says work created with Blender, including .blend files and rendered images, belongs solely to the creator. Source: "License" https://www.blender.org/about/license/ (accessed 2026-10-08). Open point: whether pipeline scripts that `import bpy` must themselves be GPL-compatible if distributed (not verified; see section 4).
- `bpy` on PyPI: version 5.2.2 uploaded 2026-09-15, GPL-3.0, `Requires-Python ==3.13.*`; wheels: macOS arm64 245 MB, manylinux x86_64 402 MB, win_amd64 338 MB. This machine has Python 3.12.9, so a 3.13 interpreter would also be needed. Source: PyPI JSON https://pypi.org/pypi/bpy/json (fetched 2026-10-08).
- Headless use: `blender --background --python script.py` (order of arguments matters; `blender file.blend --background --python script.py` also works). Source: Blender Python API docs "Tips and Tricks" https://docs.blender.org/api/current/info_tips_and_tricks.html via Context7 `/websites/blender_api_current` (accessed 2026-10-08).
- Equirect render needs a panoramic camera and a render engine that supports it:
  - `bpy.types.Camera.panorama_type` exists on the Camera datablock in the 4.2, 4.5, 5.0, 5.1 and current API docs, with enum `EQUIRECTANGULAR` and a documented default of `'FISHEYE_EQUISOLID'`. So a script that sets only `type = 'PANO'` renders a fisheye, not an equirect. Source: https://docs.blender.org/api/current/bpy.types.Camera.html (fetched 2026-10-08, checked for each version path).
  - Many web examples still use the older `camera.data.cycles.panorama_type`; the page `bpy.types.CyclesCameraSettings` returned 404 for 4.2, 4.5 and current. This is a concrete API-drift example. Source: web search result for "Blender headless bpy render equirectangular panorama" (2026-10-08) versus the docs check above.
  - EEVEE does not natively support panoramic cameras in 5.0/5.1 per search results (a third-party add-on exists that renders a 6-camera cubemap and stitches it with Cycles). Official 5.0 EEVEE release notes do not mention panoramic support. Sources: https://developer.blender.org/docs/release_notes/5.0/eevee/ and add-on listing https://superhivemarket.com/products/eevee-360 (accessed 2026-10-08). Confidence medium (absence in release notes, not a positive statement).
  - Headless EEVEE: older devtalk threads say EEVEE needs an OpenGL context even in background mode and software Mesa/llvmpipe is the workaround. These threads are older than 2024 and Blender has changed backends since, so treat as unverified for 5.x. Source: https://devtalk.blender.org/t/blender-2-8-unable-to-open-a-display-by-the-rendering-on-the-background-eevee/1436 (accessed 2026-10-08).
  - Net: the safe headless path is Cycles on CPU; its time for a 4096x2048 equirect was not measured here (no Blender installed).
- Agents driving Blender:
  - `ahujasid/mcp-for-blender` (formerly blender-mcp), MIT, about 30k stars, pushed 2026-10-06; tools include `execute_blender_code`, `search_assets`/`import_asset` for Poly Haven, Sketchfab and Poly Pizza; AI 3D generators (Tripo, Hunyuan3D, Hyper3D Rodin) are cloud/paid or key-based. Source: GitHub API and README https://github.com/ahujasid/mcp-for-blender (fetched 2026-10-08). It drives a live Blender over TCP, so it is interactive rather than a reproducible batch pipeline; a checked-in bpy script is the reproducible form.
  - Research evidence on LLM scene synthesis: SceneCraft (ICML 2024, arXiv 2403.01248, submitted 2024-03-02) has an LLM write Blender Python from a scene-graph blueprint with vision-model refinement, up to about 100 assets. BlenderGym (CVPR 2025, arXiv 2504.01786) benchmarks 245 start/goal Blender scene pairs and reports that even the best VLM system struggles with tasks that are easy for human Blender users. Sources: https://arxiv.org/abs/2403.01248 ; https://arxiv.org/abs/2504.01786 (search summary; accessed 2026-10-08). Implication: expect a human or strong visual-QA loop for placement and lighting.
- Skills note: rendering equirect in Blender gives better lighting than the three.js prototype, but IHH maintainers would need Blender and Python skills to change a scene (adoption risk, my inference).

Confidence: high on versions, licence statements and the `panorama_type` default; medium on EEVEE limits; low on time per scene.

---

### 1.3 Method 3 - Real public-domain / CC panoramas and present-day "visit the place" views

**Wikimedia Commons (queried live through the Commons API, 2026-10-08)**
- `Category:360° panoramas` shows 1,380,187 files in total on its category page, but the curated equirect subcategory `360° panoramas with equirectangular projection` has 543 files and 1 subcategory. Source: https://commons.wikimedia.org/wiki/Category:360°_panoramas and API `prop=categoryinfo`.
- US coverage is thin: `360° panoramics in the United States` has state subcategories for Virginia, Arizona, California, Maryland, Nevada, New York, Ohio, Oklahoma, Pennsylvania and Washington D.C. only. No New Jersey (Princeton/IAS), no Massachusetts (Springfield). The California category has 12 files (mostly Lassen Volcanic NP and Lake Tahoe); the D.C. category has 20 (street scenes, National Mall; several are 2025 uploads).
- Full-text searches (file namespace) for place-plus-360 terms returned no usable interior panoramas for the inductees' places: "Yosemite 360" had 617 hits, but the only 360 candidate was a cylindrical strip, 12368x816 px, licence CC BY 3.0 (a Panoramio import; sphere top and bottom are missing). "Naismith basketball hall of fame 360" returned 0 hits; "Princeton 360 panorama" returned 36 hits, none relevant (old books). "Muir House Martinez" returned 239 hits of ordinary photos (e.g., John Muir National Historic Site JOMU4223), not 360.
- Interpretation: Commons has no ready-made 360 of Einstein's, Lamarr's, Albright's, Naismith's or Muir's workplaces. Category tagging is inconsistent, so untagged files may exist (limit of this method).
- Einstein's home at 112 Mercer Street is owned by the Institute for Advanced Study, which holds archival interior photographs in its own repository (flat photos, rights per item). Source: search results incl. https://en.wikipedia.org/wiki/Albert_Einstein_House and https://albert.ias.edu/20.500.12111/1269 (2026-10-08).

**National Park Service**
- NPS photographs made by NPS employees in official duties are public domain (credit to NPS requested); galleries can mix public-domain and rights-restricted items. Sources: search results incl. https://home.nps.gov/wrst/learn/photosmultimedia/use-and-credit.htm (2026-10-08).
- John Muir National Historic Site pages describe a virtual/cellphone tour and ASL videos; I found no 360-degree interior panorama of the Muir house. Source: https://www.nps.gov/jomu/planyourvisit/the-historic-home-of-john-muir.htm and search results (2026-10-08). Confidence: low-medium (absence of evidence from search snippets only).

**Library of Congress panoramic photographs (wide, not 360)**
- About 4,000 images, 1851-1991, centred on the early 20th century, 400+ depositors; typical rights advisory "No known restrictions on publication", but LoC states researchers must assess rights themselves. Sources: search results quoting https://www.loc.gov/collections/panoramic-photographs/about-this-collection/ and https://www.loc.gov/pictures/collection/pan/ (2026-10-08).
- I could not read loc.gov pages directly: WebFetch got 403 and the in-app browser hit a Cloudflare "security verification" page. I did not attempt to bypass it. Use as cylindrical backdrops or wide photo planes only, never as 360 (they lack the vertical field). Prior research already confirmed `tile.loc.gov` IIIF works (03 doc).
- Search surfaced Yosemite items (e.g., Detroit Publishing Co. "Glacier Point and South Dome, Yosemite Valley, Cal." 1898; Watkins c.1865, "no known restrictions") that could serve as period backdrops for a Muir scene. Source: https://www.loc.gov/exhibitions/images-from-americas-library/about-this-exhibition/detroit-publishing-company/glacier-point-and-south-dome/ (2026-10-08).

**Present-day place views**
- Google Street View embed: Maps Embed API `streetview` mode embeds a full-sphere panorama by iframe; Google states Embed requests are free with unlimited usage, but they need a Google Cloud API key and a billing-enabled project. Usage is governed by the Maps Platform terms ("License Restrictions"); extraction/reuse of imagery is not allowed, so it is a link-out/iframe feature, not a source of scene images. Source: Google Developer Knowledge: "Maps Embed API usage and billing", https://developers.google.com/maps/documentation/embed/usage-and-billing and "Embedding a map" https://developers.google.com/maps/documentation/embed/embedding-map (retrieved 2026-10-08). The ToS details belong to the Google route; noted only.
- Mapillary: street-level images, including 360, under CC BY-SA 4.0 with free API access via a token (secondary sources: Wikipedia and OSM wiki summaries). Coverage near the inductees' sites was not checked. Source: search results incl. https://wiki.openstreetmap.org/wiki/Mapillary (2026-10-08). Confidence medium-low.

Confidence: high that Commons lacks suitable 360s under my queries; medium-low that nothing exists anywhere (NPS/IAS/Springfield College/Hall of Fame could hold unindexed captures; own capture on a site visit is not realistic for historic interiors).

---

### 1.4 Method 4 - Archival photographs placed in 3D (planes, 2.5D from monocular depth, projection onto simple geometry)

**Depth-model licences (checked on Hugging Face and GitHub APIs, 2026-10-08)**

| Model | Licence | Notes |
|---|---|---|
| Depth Anything V2 Small (24.8M params) | Apache-2.0 | `depth-anything/Depth-Anything-V2-Small-hf` licence tag apache-2.0. README: Small Apache-2.0; Base/Large/Giant CC-BY-NC-4.0; Giant checkpoint "coming soon"; code Apache-2.0. Repo last pushed 2026-03-24; last README news 2025-01-22. https://github.com/DepthAnything/Depth-Anything-V2 |
| Depth Anything V2 Base (97.5M), Large (335.3M) | CC-BY-NC-4.0 | Non-commercial: do not use for a deliverable IHH may host or reuse |
| Depth Anything 3 (released 2025-11, ByteDance-Seed) | Small, Base, Mono-Large, Metric-Large: Apache-2.0. Large, Giant: CC-BY-NC-4.0 | HF model cards lastModified 2025-11-13 to 2025-11-19; GitHub `ByteDance-Seed/Depth-Anything-3` Apache-2.0, pushed 2026-07-27. Larger sizes are NC again |
| Intel DPT-large / hybrid-midas (MiDaS family) | Apache-2.0 (HF tags) | `isl-org/MiDaS` GitHub licence MIT but repo archived (last push 2024-08-23). Weights/dataset terms per checkpoint not verified |
| Apple Depth Pro | Disputed, see section 3. The HF `apple/DepthPro` LICENSE is Apple's Machine Learning Research Model License, which limits use to non-commercial research and excludes commercial products and services | GitHub `apple/ml-depth-pro` LICENSE is a permissive Apple sample-code licence and its README says weights are under the same LICENSE |

- Browser/ONNX sizes (HF API `siblings` sizes): `onnx-community/depth-anything-v2-small` (Apache-2.0): fp32 99 MB, fp16 50 MB, int8/q4 about 27 MB, q4f16 19 MB. `onnx-community/depth-anything-v3-small` (Apache-2.0): about 105 MB external data. These are build-time tools; only the resulting depth map (8-bit image) needs to ship. `@huggingface/transformers` 4.3.1 (Apache-2.0, published 2026-10-06) and `onnxruntime-web` 1.30.0 (MIT) exist for in-browser inference; search results state the small model runs on WebGPU or falls back to WASM. Source: https://huggingface.co/onnx-community/depth-anything-v2-small ; npm registry (2026-10-08).
- Technique: depth map displaces a subdivided plane in the vertex stage while the photo supplies colour (a search-result description of a Three.js depth-map generator using Depth Anything V2 Small). Source: search results incl. https://github.com/jasonyingling/depth-map-generator (2026-10-08). Camera projection onto a proxy box (photo projected onto a simple room shell) is standard practice but I did not source it; treat as my knowledge.
- Accuracy: strongest of all methods because the viewer sees the real photograph; the 3D effect is the only inferred layer and must be labelled as such. Limits: parallax works for small camera motion, edges stretch, low-resolution 19th/early-20th-century prints give soft depth. Rights are per photograph (handled by the content-availability route; Einstein photos by commercial photographers are a known risk per `00-synthesis.md`).
- Time per scene (estimate, low confidence): 0.25-0.5 agent-days per photo-scene (fetch derivative, run depth at build time, author hotspots in image coordinates, write alt text and long description).
- Complement to the panorama approach: a photo-in-3D "document viewer" is the closest match to the prior-research pattern "document-first 3D" and to the museum credibility findings.

---

### 1.5 Method 5 - AI-generated 360 imagery

**Blockade Labs Skybox AI**
- Plans page (accessed 2026-10-08): no free tier is listed. Essential is pitched at solo creators on personal projects (100 credits/month, 4K exports); commercial licensing is listed from Standard (300 credits, 8K) and on Business (500 credits, 16K, HDRI exports). Prices as rendered: Essential about $20-24 per seat per month, Standard $48-60, Business $112-140. Source: https://skybox.blockadelabs.com/plans (fetched twice and text-scanned).
- Terms of Service, last revised 2024-10-31: users own the assets they create to the extent current law allows; Blockade receives a perpetual, worldwide, non-exclusive, sublicensable, royalty-free, irrevocable licence to prompts and generated images; no attribution requirement stated; no free-versus-paid ownership distinction stated. Source: https://www.blockadelabs.com/tos (fetched 2026-10-08).
- Older secondary articles (2023-2024) describe a free tier with watermarked exports and a CC BY licence on a low paid tier. These conflict with the current plans page; see section 3.
- Fit with the "free tools only" constraint: fails (no free tier found).

**Open-source panorama generators (HF API and GitHub, 2026-10-08)**
- DiT360 (Insta360 Research): code MIT (GitHub `Insta360-Research-Team/DiT360`, pushed 2026-04-17); HF weights tagged MIT but `base_model: black-forest-labs/FLUX.1-dev`, whose HF licence is "other: flux-1-dev-non-commercial-license". README: trained at 1024x2048 only, "approximately 37 GB of GPU memory" for inference. Whether the NC licence of the base model constrains the derivative weights or outputs was not resolved (legal interpretation; see section 4). Sources: https://github.com/Insta360-Research-Team/DiT360 ; https://huggingface.co/Insta360-Research/DiT360-Panorama-Image-Generation ; https://huggingface.co/black-forest-labs/FLUX.1-dev .
- SDXL panorama LoRAs (e.g., `360redmond`) carry OpenRAIL++ on an SDXL base (also OpenRAIL++); FLUX.1-schnell is Apache-2.0; several FLUX.1-dev LoRAs list OpenRAIL++ but inherit the dev base model licence. A FLUX.2-klein-9B 360 LoRA is tagged Apache-2.0 (base-model licence not checked). Source: HF API model search "360 panorama" and "equirectangular" (2026-10-08).
- Hardware: none of these were run. A solo developer's M1/8 GB laptop is not a realistic host for a 37 GB-VRAM model; a free cloud GPU option was not verified.

**Accuracy and credibility**
- A generative model has no access to the verified-fact pipeline, so it cannot honour "every sentence carries fact ids"; it will invent period details (signage, equipment, architecture). I did not test period accuracy empirically.
- Is "atmosphere only" defensible? What the sources say: museum and archive guidelines (surfaced by search) require disclosure of generated origin, scholarly verification, and treating generated images as illustrative only, not as proof of identity, time or place; a counter-argument essay reports labels do not limit how an image is read. London Charter (2009 v2.1) requires structured evaluation of research sources and documentation sufficient for others to evaluate the visualisation (Principles 3 and 4). Sources: https://londoncharter.org/principles.html (accessed 2026-10-08); search results incl. https://kaptur.co/why-labels-wont-solve-the-trust-crisis/ (opinion piece) and https://cultureelpersbureau.nl/en/2026/03/kunstmatige-intelligentie-in-het-museum-waarom-ai-beleid-geen-luxe-meer-is/ (2026-03).
- Reading: "atmosphere only" is defensible only under constraints that this project would have to enforce itself: generated pixels never carry fact hotspots; no readable text, real people or named artefacts in the image; the scene card says "AI-generated atmosphere, not a depiction of [place]"; and IHH accepts the AI-imagery policy. Not defensible as the sole backdrop of a "historically grounded" scene. This is analysis, not a sourced rule.
- Consistency risk: seams at the wrap-around and distortion at the poles are known failure modes of equirect generators (from the paper abstracts for Diffusion360 and DiT360 that mention circular blending and "smooth, continuous edges"); output resolution is low unless upscaled.

---

### 1.6 Method 6 - Gaussian splatting / photogrammetry: existing captures and web viewers

- No existing capture of the five inductees' workplaces was found by any search in this route. Closest findings are unrelated heritage splats: CyArk's "America 250 Tapestry Collection" (George Wythe House in Colonial Williamsburg, Rosenwald Russell School, O'Hara's Restaurant and Pub) viewable in the browser. Source: https://lidarnews.com/cyark-america-250-tapestry-collection/ (2026, via search result).
- Smithsonian 3D: about 2,200 models released as CC0 in 2020 (items marked CC0 are free for any purpose; OBJ and glTF downloads). Coverage for these inductees could not be measured: the Smithsonian Open Access API with `DEMO_KEY` returned `OVER_RATE_LIMIT` (same as prior research) and 3d.si.edu returned 403 to scripts earlier. Sources: https://www.techdirt.com/2020/02/25/smithsonian-releases-28-million-images-3d-models-into-public-domain/ and https://digitalproduction.com/2020/03/04/open-access-mehr-als-2000-3d-modelle/ (2020, older than 2024; figure may be stale).
- Sketchfab: the public search API was alive on 2026-10-08. CC0 + downloadable queries returned museum objects for "telescope" (4 on the first page), "microscope" (4), "globe" (16) but 0 on the first page for "typewriter", "blackboard", "desk lamp" and "basketball". Epic's 2024-10-22 post says free and view-only content stays and APIs continue for the foreseeable future, with ample notice promised before free downloads end. I found no later dated notice, so the status after 2024 is unconfirmed. Sources: https://api.sketchfab.com/v3/search (2026-10-08); https://sketchfab.com/blogs/community/wp-json/wp/v2/posts/142060004160 (2024-10-22).
- Web viewers: Spark (`@sparkjsdev/spark`, MIT, three.js >=0.179, supports PLY/SPZ/SPLAT/KSPLAT/SOG, claims low-power mobile; prior research measured 920 KB gz). SuperSplat is a free browser editor/viewer and lets owners pick a CC licence including NC/ND variants. Original Inria 3DGS code is non-commercial research-only; gsplat.js (MIT) and ds-splat (Apache-2.0) are permissive alternatives. Sources: https://sparkjs.dev/docs/overview/ ; https://blog.playcanvas.com/new-in-supersplat-downloadable-splats-licenses-and-social-links ; https://scancode-licensedb.aboutcode.org/gaussian-splatting-2024.html (2026-10-08).
- Why it does not close the gap: creating a splat needs photographs of a real place or object; for deceased inductees the historic interiors are gone or private. A splat of today's Muir house or a museum object is feasible but is a present-day capture and needs site access.

Confidence: high that no relevant capture surfaced; medium on interpretation (search is not exhaustive; Smithsonian coverage unmeasured).

---

### 1.7 Data-driven scene format (one engine, many parallel agents)

**Prior art for a scene descriptor**
- Photo Sphere Viewer virtual-tour plugin nodes: `id`, `panorama`, `name`, `caption`, `thumbnail`, `links`, `markers` (requires Markers plugin), `gps`, `panoData`, `sphereCorrection`, `showInGallery`, `data` (custom metadata); client mode takes an initial node list, server mode loads each node lazily; `preload` option for linked nodes. Source: https://photo-sphere-viewer.js.org/plugins/virtual-tour.html (accessed 2026-10-08) and Context7 `/websites/photo-sphere-viewer_js`.
- Pannellum tour JSON: top-level `default` (must include `firstScene`) and `scenes` dictionary; hotspots have `type` (`scene` or `info`), `pitch`, `yaw`, `sceneId`, `URL`, plus click and tooltip function hooks. Source: Context7 `/mpetroff/pannellum`, doc `json-config-parameters.md` (accessed 2026-10-08).
- glTF provenance: Khronos `KHR_xmp_json_ld` is a ratified extension that attaches JSON-LD/XMP metadata (attribution, licence, creation date) to asset, scene, node, mesh, material, image and animation; glTF-Transform supports it. This lets credits and provenance travel inside each model file. Sources: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_xmp_json_ld/README.md ; https://gltf-transform.dev/modules/extensions/classes/KHRXMP (2026-10-08).
- Existing pipeline hook: `03-reference-repos-and-tech.md` already proposes a canonical fact CSV/JSONL with `fact_id`; a scene file can reference those ids.

**Proposed scene descriptor shape (my design; not yet implemented or tested)**

```json
{
  "schema": "ihh-scene/1",
  "id": "einstein-princeton-study",
  "inductee": "einstein",
  "timelineEvent": "evt-1935-princeton",
  "title": "The study at Mercer Street",
  "evidence": {
    "tier": "reconstruction",
    "summary": "Layout inferred from 3 cited photographs; furniture generic.",
    "refs": [{"sourceId": "SRC-014", "locator": "photo 2, left wall"}]
  },
  "render": {
    "mode": "baked-equirect",
    "pano": {"src": "pano/4096.webp", "preview": "pano/1024.webp", "w": 4096, "h": 2048, "yawOffsetDeg": 0},
    "builder": {"kit": "study-v1", "seed": 7, "props": [{"ref": "kit:desk-01", "pos": [1.4, 0, -1.2]}]}
  },
  "stops": [{"id": "s1", "yaw": 0, "pitch": 0, "fov": 75, "label": "Facing the blackboard", "narration": ["F-0192"]}],
  "hotspots": [
    {"id": "h-notebook", "anchor": {"world": [1.2, 0.84, -1.2]}, "order": 1,
     "label": "Notebook", "description": "Long text description for screen readers.",
     "artifact": "ART-0031", "facts": ["F-0201", "F-0202"]}
  ],
  "assets": [{"id": "kit:desk-01", "licence": "CC0-1.0", "origin": "https://quaternius.com/", "credit": null}],
  "a11y": {"alt": "...", "longDescription": "...", "transcript": "scenes/einstein-study.txt"},
  "budgets": {"panoKB": 1500, "textureMax": 4096}
}
```

Design notes drawn from the findings:
- Store anchors in world coordinates and derive yaw/pitch at build time (verified in probe 1), so hotspots cannot drift from the art.
- Add an `evidence.tier` field (documented / reconstruction / illustrative) per scene and, if needed, per prop, matching the London Charter intent that readers can tell evidence from hypothesis (Principles 3 and 4).
- Validate with JSON Schema (Ajv 8.20.0, MIT) or Zod 4.6.5 (MIT) plus cross-file checks: every `facts[]` id exists in the fact store with `status=verified`; every `artifact` and `sourceId` exists; every asset licence is on an allowlist (CC0-1.0, CC-BY-4.0 with credit); hotspot ids unique and 3-8 per scene.
- Suggested agent gates (not built): (1) golden calibration scene that fails if the bake is mirrored; (2) an object-ID colour pass baked alongside the beauty pass so each hotspot's pixel must hit its own object; (3) file-size and texture-size budgets; (4) accessibility lint on hotspot fields; (5) licence allowlist; (6) palette/lighting conformance check against the kit. Playwright 1.64.0 (Apache-2.0, 2026-10-07) is the likely driver; headless WebGL flags were not verified (Context7 returned no SwiftShader/ANGLE flags).

Confidence: high on the cited prior art; the schema is design, not evidence.

---

### 1.8 Hotspot UX and accessibility (empirical probes plus standards)

**Empirical probe 2 (this session)**: the baked panorama was loaded in Photo Sphere Viewer 5.15.1 with the Markers plugin, and separately in Pannellum 2.5.7, then the DOM was inspected.

| Element | Photo Sphere Viewer 5.15.1 (core + markers) | Pannellum 2.5.7 |
|---|---|---|
| Hotspot / marker element | `DIV`, `tabindex=-1`, no `role`, no `aria-label` | `DIV`, `tabindex=-1`, no `role`, no `aria-label` |
| Navbar buttons | `DIV` with `tabindex=0` and a `title` ("Zoom in", "Fullscreen", "Menu"); no `role="button"`, no `aria-label` | Controls are `DIV` with `tabindex=-1`, empty `title` |
| Container / canvas focusable | canvas and container `tabindex=-1` | container `tabindex=0`; the bundle has `keydown` handlers (keyboard pan/zoom) |
| Tooltip | no `role` | not tested |
| Source-level corroboration (string counts in the shipped bundles) | core: 1 "aria", 3 "tabindex", 0 "role"; markers plugin: 0 "aria", 1 "tabindex"; virtual-tour plugin: 0 | 1 "tabIndex=0", 2 "keydown" |
| Load time of the viewer on the baked image | "ready" in 30-51 ms from a blob URL | "load" in 160 ms |

Also from the docs: PSV keyboard controls default to fullscreen only (`keyboard: 'fullscreen'`); `'always'` listens globally and "can be in conflict with other components"; the Panel component auto-focuses the first focusable element when it opens (good for focus management). Source: Context7 `/mistic100/photo-sphere-viewer` config docs (accessed 2026-10-08). The markers documentation does not mention ARIA or keyboard support, but lists a marker list panel (`listContent`, `hideList`) that offers a structured alternative.

**Pattern verified working in the probe**: a plain `<ul>` of real `<button>`s, one per hotspot, in DOM order; clicking a button calls `viewer.animate({yaw, pitch})` and `showMarkerTooltip(id)`. The viewer ended exactly on the hotspot (40.6 deg, -21.1 deg), focus stayed on the button, and the tooltip text was "notebook". Hotspot angles came from the same 3D anchors that drew the scene.

**Standards that bite (accessed 2026-10-08)**
- WCAG 2.2: 2.5.8 Target Size (Minimum) AA: targets at least 24x24 CSS px or spaced so 24 px circles do not intersect; 2.5.7 Dragging Movements AA: anything done by dragging also possible with a single pointer without dragging; 2.4.11 Focus Not Obscured (Minimum) AA: a focused component is not entirely hidden by author content (relevant when a side panel opens over hotspots). Source: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ .
- 4.1.2 Name, Role, Value: custom controls built from generic elements must expose name, role and state. Source: https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html . PSV's navbar buttons are DIVs with only `title`, so they are a risk against this criterion unless replaced or patched.
- Model-viewer (Google): hotspots are slotted `<button>` elements positioned with `data-position`/`data-normal`; Google's answer on accessibility recommends `aria-label`, `tabindex="0"` only where needed, and Enter/Space activation. Source: Google Developer Knowledge `answer_query` (references web.dev model-viewer docs), 2026-10-08, and https://web.dev/blog/introducing-model-viewer. The `answer_query` output cited unrelated Maps pages as references and did not confirm `data-visibility`; treat as medium confidence.
- Reference behaviours from commercial tour tools (search results, vendor claims): Enter/Space activate, Escape closes a label, alt text required per panorama, interactive map list for keyboard and screen-reader access. Source: search results incl. https://seekbeak.com/accessibility and Articulate Storyline 360 docs (2026-10-08). Vendor statements, not tested.

Practical shape that follows from the evidence (design implications, not a recommendation): hotspots exist twice, once as visual markers in the viewer (decorative, `aria-hidden`) and once as a real, ordered list of buttons with names and long descriptions; focus order should be spatial left-to-right by yaw; opening an artifact moves focus into a panel and returns it on close; reduced-motion users get instant jumps instead of animated rotation; announce the new view via an `aria-live` region because the viewer's tooltip has no role.

---

### 1.9 Mobile performance and weak-connection budget

- Viewer weight (gzip, measured via jsDelivr on 2026-10-08): PSV core 45.3 KB (+ 2.7 KB CSS); markers plugin 16.8 KB; virtual-tour plugin 10.5 KB; gyroscope plugin 3.5 KB; Pannellum JS 18.0 KB (+ 2.6 KB CSS); three.js 0.186.1 `three.module.min.js` 89.8 KB + `three.core.min.js` 104.2 KB. PSV core is larger than the "about 33 KB" quoted in `03-reference-repos-and-tech.md`; see section 3.
- Texture limits: web3dsurvey reports WebGL2 MAX_TEXTURE_SIZE >= 4096 on 100% of devices, >= 8192 on 98%; Android >= 8192 on only 75% (iOS 100%). The data page has no date. Another result puts Safari on iPad Pro at 4096 for older reports. Source: https://web3dsurvey.com/webgl2/parameters/MAX_TEXTURE_SIZE (accessed 2026-10-08). A 4096x2048 equirect plus a 1024x512 preview stays within the safe range.
- Tiled panoramas: PSV `EquirectangularTilesAdapter` (example: 12000 px wide, 16 columns x 8 rows, `baseUrl` low-res image loaded first) and `CubemapTilesAdapter` exist for larger images. The PSV Gyroscope plugin requires HTTPS and warns of orientation inconsistencies across devices. Source: Context7 `/websites/photo-sphere-viewer_js` (accessed 2026-10-08).
- Google's own 3D guidance: for the Pixel Fold model pages they capped models at 2 MB including textures to support older devices and weak connections (web.dev case study "Interactive 3D on the web with Google hardware", undated in retrieval). An older web.dev case study ("Journey through Middle-earth", Nexus-10 era, so well before 2024) says all devices handle 2048 and most handle 4096 textures, and recommends low-poly models, few draw calls, simple materials and lower-resolution mobile textures; directionally consistent with the above. Sources: https://web.dev/case-studies/3d-on-the-web ; https://web.dev/case-studies/hobbit ; Android performance case study on compressed textures (ASTC/ETC2 about 4x smaller than RGBA8888) (Google Developer Knowledge, 2026-10-08).
- Compression tooling: `@gltf-transform/cli` 4.5.1 (MIT, published 2026-09-28): `optimize --compress draco --texture-compress webp`, `meshopt`, `resize`, and KTX2/Basis (`uastc`, `etc1s`). Source: Context7 `/donmccurdy/gltf-transform` (accessed 2026-10-08).
- Google's 360 guidance (VR View docs) recommends 2:1 equirect JPEG with power-of-two dimensions such as 4096x2048; the page is from the discontinued VR View era (links point at a `googlearchive` repo), so older than 2024. Source: https://developers.google.com/vr/discover/360-degree-media (Google Developer Knowledge, 2026-10-08).
- Net for mobile: a baked equirect scene costs one texture and no per-frame geometry, while a live scene adds geometry, shadows and draw calls on weak GPUs; these trade-offs were not benchmarked on a phone here.

---

### 1.10 Producing 15-20 scenes with parallel agents (synthesis)

- Time arithmetic (estimates, low confidence): at about 1 agent-day per scene, 15-20 scenes need 15-20 agent-days; five agents in parallel gives about 3-4 waves, roughly 4-6 calendar days if the shared kit and engine exist first, versus 24 days remaining until 2026-11-01 (from today, 2026-10-08). The kit and engine are on the critical path and must precede fan-out.
- What the probes showed about agent failure modes: the failure that cost real time was silent (mirrored bake), caught only by looking. Agents need machine-checkable gates (section 1.7) plus a visual QA step that compares rendered thumbnails to reference photographs.
- Spatial and placement skill is the weak point of LLM 3D scene authoring according to the benchmark evidence (BlenderGym; SceneCraft's need for a scene-graph blueprint and image feedback). Constrain agents to descriptors, kits and prop libraries rather than free-form geometry.
- Cross-scene consistency levers (design inference): one kit, one lighting rig, one tone-mapping and bake setting, one fixed camera height, one palette, one naming scheme, all enforced by the linter rather than by prompt text.

---

## 2. Per-finding confidence

| # | Finding | Confidence | Why |
|---|---|---|---|
| 1 | Poly Haven, ambientCG, Kenney, Quaternius are CC0 | High | Read on each publisher's own page or FAQ; consistent across sources |
| 2 | Poly Pizza licence is per model (CC0 or CC BY) | Medium | One model page and the homepage read; 403 on the FAQ for non-browser fetches |
| 3 | Depth Anything V2 Small, DA3 Small/Base/Mono-L/Metric-L are Apache-2.0; V2 Base/Large and DA3 Large/Giant are CC-BY-NC-4.0 | High | HF API tags (2026-10-08) plus the V2 README agree |
| 4 | Depth Pro commercial use is unclear and probably research-only | Medium | HF LICENSE is research-only; GitHub LICENSE is permissive; the ONNX port tags a third licence |
| 5 | Skybox AI has no free tier today | Medium-high | Plans page read twice; old articles disagree (section 3) |
| 6 | Procedural scene to 4096x2048 equirect bake works in about 110 ms of GPU time with no art tools | High | Run twice in this session |
| 7 | Bake handedness bug is easy to introduce and silent | High | Observed and fixed in this session |
| 8 | PSV 5.15.1 and Pannellum 2.5.7 hotspots are not keyboard-reachable or named by default | High | DOM probed live, plus bundle string counts |
| 9 | A DOM button list driving `viewer.animate` is an adequate accessible overlay | Medium | Works in the probe; no screen-reader test; no mobile test |
| 10 | Commons has no usable 360 interiors for the five inductees | Medium | Live API counts and searches, but tagging is inconsistent |
| 11 | Blender EEVEE lacks native panoramic cameras in 5.x | Medium | Absence in release notes plus community and add-on evidence; no positive statement |
| 12 | `Camera.panorama_type` defaults to a fisheye mode and the old `cycles.panorama_type` path is gone | High | Official API pages for 4.2 through current; 404 on the old class |
| 13 | bpy wheel facts (5.2.2, GPL-3.0, Python 3.13, 245-402 MB) | High | PyPI JSON read directly |
| 14 | Per-scene time estimates | Low | My estimates; no Blender timing, no multi-scene run |
| 15 | No existing splat or scan of the inductees' places | Medium | Negative result from search; Smithsonian API rate-limited |
| 16 | Sketchfab status after 2024 | Low | Only a 2024-10-22 notice plus a working API |
| 17 | Texture-size support figures | Medium | Undated survey page, two mutually consistent summaries |
| 18 | "Atmosphere only" AI use is defensible only under self-imposed constraints | Medium | Analysis resting on museum-guideline summaries and the London Charter, which I read only at principle level |

---

## 3. Contradictions and disputed points

1. Depth Pro licence. GitHub `apple/ml-depth-pro` LICENSE is a permissive Apple sample-code licence ("use, reproduce, modify and redistribute") and the README says the weights are under the same LICENSE. The Hugging Face `apple/DepthPro` repository carries the Apple Machine Learning Research Model License, limited to "Research Purposes", excluding commercial products. `onnx-community/DepthPro-ONNX` is tagged `apple-ascl`. Unresolved; treat as research-only until Apple states otherwise. Also not in scope for a free commercial-safe pipeline when Depth Anything V2 Small is Apache-2.0.
2. Skybox AI free tier. 2023-2024 trade articles (cgchannel, renderu, genai.works) describe a free plan (5 or 15 generations a month, watermarked, CC BY) and a $12 paid tier with CC BY; the current plans page (2026-10-08) lists only paid plans from about $20, with commercial licensing from Standard. The ToS (rev. 2024-10-31) says users own their assets but does not mention tiers. The current page is the more authoritative source.
3. Blender camera API. Web examples set `camera.data.cycles.panorama_type`; the official API lists `Camera.panorama_type` and has no `CyclesCameraSettings` page for 4.2, 4.5 or current. Follow the official docs and pin a Blender version.
4. PSV core size. `03-reference-repos-and-tech.md` says about 33 KB gz for the ESM core; measured here: 45.3 KB gz for `@photo-sphere-viewer/core@5.15.1/index.module.js` (plus 16.8 KB for markers). Likely a measurement-scope difference; the figures here are from the shipped files.
5. Headless EEVEE. Threads say EEVEE cannot render without a display; that evidence predates 2024 and the Blender 5 graphics backend. Open until tested on the intended build host.
6. Depth Anything V2 size licences. Some pages describe "Depth Anything V2" as Apache-2.0 (repo code and Small); others list CC-BY-NC for Base/Large/Giant. Both are true per size; picking a size by accuracy without reading the per-size licence is the trap.
7. DiT360 licensing. Repo and HF tag say MIT, while the declared base model (FLUX.1-dev) has a non-commercial licence. The legal effect on weights or outputs is not established.
8. Sketchfab future. The 2024-10-22 Epic post promises continued free content "for the foreseeable future"; news coverage and a petition describe concern that free downloads would end. No 2026 notice found either way.

---

## 4. Open questions and assumptions

Assumptions made:
- "Scene" means a 360 viewpoint with hotspots (3-4 per inductee, 15-20 total) rather than a free-roam room.
- Mobile support is judged from texture limits, bundle sizes and Google guidance; no phone was tested.
- All time-per-scene numbers are my estimates.
- The inductee set is the locked five (Einstein, Muir, Lamarr, Albright, Naismith); photo and artefact rights are handled by other routes.

Open questions:
1. Cycles CPU render time for a 4096x2048 equirect on the intended machine (M1/8 GB, or a Linux CI runner) is unmeasured; Blender could not be installed here (disk at 100%). If a Blender pipeline is considered, one timed spike on a prepared machine is needed.
2. Does headless Chromium on a GPU-less runner (SwiftShader/ANGLE) bake the cubemap at acceptable speed and with identical output to the M1 GPU? Unverified; Context7 yielded no flags.
3. Real textured-scene size for a baked equirect (probe used a trivial scene: 88-261 KB). Expect larger; not measured.
4. How many CC0 props actually cover period-correct items (blackboard, 1890s gymnasium, 1940s radio/patent models, 1930s film set)? Sketchfab CC0 queries returned none for four of seven keywords; Poly Haven, Kenney and Quaternius coverage of such items is unmeasured.
5. Whether scripts that import `bpy` and are distributed in the IHH repository must be GPL-compatible (Blender's own FAQ not read this session). Rendered output is unencumbered per the Blender licence page.
6. Whether FLUX.1-dev's non-commercial licence propagates to DiT360 weights or outputs, and whether a free GPU path exists for 37 GB-VRAM inference.
7. Smithsonian 3D and NPS holdings for the five inductees' objects/places (API rate-limited; NPS 360 content not found in snippets only).
8. IHH policy on AI-generated imagery and on reconstructed rooms: needs sign-off before any M5 or reconstructed-scene content is published. Evidence-tier wording ("illustrative reconstruction") should be agreed with IHH.
9. Screen-reader behaviour of the DOM-list overlay (VoiceOver, TalkBack, NVDA) was not tested.
10. Whether LoC and NPS rights statements for specific period photographs permit self-hosted derivatives (depth maps, crops); per-item check needed.
11. Whether the local machine's full disk is a constraint for the build phase (Playwright browser download, model caches, Blender).

---

## 5. Implications for the decision (no recommendation)

1. Supply side. Real PD/CC 360s (M3), splats (M6) and Street View embeds supply essentially none of the 15-20 inductee-specific scenes; they can only add outdoor atmosphere or "visit today" links. The realistic supply of scenes comes from M1 or M2 (constructed rooms) and M4 (archival photographs in 3D). A hybrid where each scene combines a constructed room shell with real photographs hung or projected inside is consistent with the findings.
2. Accuracy and labelling are design variables, not afterthoughts. Constructed rooms are reconstructions; the project can only claim what its sources support. A visible evidence tier per scene and per prop (documented / reconstruction / illustrative) and a "how this was made" panel follow from the London Charter principles and from the museum AI-disclosure guidance. Stylisation that is clearly illustrative lowers the risk of being read as evidence.
3. Free-tool constraint filters methods hard. Skybox AI fails (no free tier); open generators need large GPUs and have licence ambiguity; Depth Anything V2 Base/Large, DA3 Large/Giant and Depth Pro are poor choices for a deliverable IHH may host. Apache-2.0 models (V2-Small, DA3 Small/Base) and CC0 asset sources are the clean path.
4. A baked-panorama architecture (one texture per scene viewed in Photo Sphere Viewer or Pannellum) is the cheapest on mobile and the simplest for IHH to maintain; a live three.js scene adds interactivity and parallax at the cost of GPU, memory and per-scene geometry. The prototypes show both are reachable from the same scene code: the live scene and the baked panorama can share the same descriptor and anchors.
5. Accessibility cannot be inherited from the viewers. Both evaluated viewers expose hotspots and controls as non-focusable, unnamed DIVs. Any plan that relies on "the library handles it" will miss WCAG 2.2 AA (4.1.2, 2.1.1, 2.5.7, 2.5.8, 2.4.11). A parallel DOM list of hotspots, driven by the same descriptor, is a small, verified fix and should be treated as part of the engine, not as per-scene work.
6. Parallel agents need an engine and kit first, and gates second. The silent mirroring bug shows why a shared engine with golden tests, ID-pass hotspot checks, budget checks and licence/fact-id cross-checks is the control that makes 15-20 scenes by multiple agents trustworthy. Time estimates (about 1 agent-day per scene after a 2-4 agent-day kit) leave room against the 2026-11-01 deadline only if the kit and descriptor land in the first days.
7. Maintenance by IHH. A JSON descriptor plus a small set of documented kits is editable by non-artists; a Blender-based pipeline needs Blender skills (and has version drift and GPL tooling questions). WordPress adoption is unaffected by method: the baked WebP plus viewer is static.
8. Highest-value spikes before committing: (a) timed Cycles equirect render on the build machine; (b) a headless Playwright bake of the existing probe on a GPU-less runner; (c) one real textured scene baked to measure true file size; (d) phone test of PSV with a 4096x2048 image on iOS Safari and a mid-range Android; (e) a screen-reader pass of the DOM-list overlay.

---

## 6. Query log (all dated 2026-10-08)

Counts: Google web search (WebSearch) 32; Google web page fetches (WebFetch) 26 plus in-app browser reads; Google Developer Knowledge 5 (4 `search_documents`, 1 `answer_query`; `get_documents` not used); Context7 20 calls (7 `resolve-library-id`, 13 `query-docs`). Direct primary-source API/HTTP fetches (curl) are listed separately and are not counted toward the quotas.

### 6.1 Google web search (WebSearch, mode "standard"): 32
1. Poly Haven license CC0 HDRIs textures models commercial use no attribution
2. Depth Anything V2 model license Small Apache-2.0 Base Large Giant CC-BY-NC-4.0
3. Blockade Labs Skybox AI free plan terms commercial use license generated skyboxes
4. Blender headless bpy Python script render equirectangular panorama Cycles command line --background --python
5. Depth Anything V3 license release Apache-2.0 monocular depth 2025 2026 ByteDance
6. Blender MCP server AI agent control Blender Python scripting Claude 2026
7. pip install bpy Blender as Python module PyPI headless version 2026
8. open source 360 panorama generation model equirectangular diffusion LoRA license FLUX DiT360 Diffusion360 PanFusion
9. NPS 360 virtual tour John Muir National Historic Site Martinez Yosemite panorama public domain
10. Blockade Labs Skybox AI terms of service "you own" generated content free users license Creative Commons
11. London Charter computer-based visualisation cultural heritage paradata transparency hypothesis evidence 2.1 principles
12. LLM agents generate 3D scenes Blender code benchmark BlenderGym SceneCraft limitations spatial reasoning
13. Blender EEVEE headless server rendering without GPU background mode Mesa software OpenGL EGL limitations
14. Poly Pizza models license CC0 CC-BY attribution filter free low poly models
15. Smithsonian Open Access 3D models CC0 3d.si.edu download glTF Voyager license number of models 2026
16. Gaussian splatting license original Inria non-commercial vs gsplat Nerfstudio Apache; Spark three.js splat viewer mobile; free tools to create splat scan 2026
17. Wikimedia Commons equirectangular 360 panorama historic house museum interior Princeton Institute for Advanced Study Einstein house
18. Library of Congress Panoramic Photographs collection about this collection number of items 1851-1991 rights
19. Naismith Springfield College 1891 gymnasium photograph first basketball game historic photo Springfield College digital collections public domain
20. iOS Safari WebGL maximum texture size 4096 8192 panorama memory limit mobile 360 image resolution recommendation
21. WCAG 2.2 accessible 360 panorama viewer hotspots keyboard screen reader alternative text list of points of interest
22. nps.gov jomu virtual tour John Muir Mansion 360 degree view photosmultimedia
23. NPS public domain copyright policy photographs "National Park Service" images use credit "public domain" nps.gov copyright
24. Sketchfab shutting down Fab transition 2026 Epic Games Sketchfab sunset date models migration
25. Depth Anything V2 Small browser WebGPU transformers.js depth map 2.5D parallax photo three.js displacement mesh
26. museum guidelines AI-generated images historical reconstruction disclosure labeling credibility generative AI cultural heritage policy
27. Blender EEVEE panoramic camera support equirectangular 5.0 5.1 release notes EEVEE Next panorama
28. KHR_xmp_json_ld glTF extension JSON-LD metadata provenance ratified Khronos
29. Gaussian splat scan historic house museum interior free download CC license SuperSplat gallery Smithsonian 3D Gaussian splat
30. BlenderGym benchmark vision-language models 3D graphics editing Blender Python gap with human experts results
31. Library of Congress panoramic photograph Yosemite Valley Cal. panorama loc.gov/pictures/item
32. Mapillary images license CC BY-SA 4.0 reuse API free access token 360 street-level imagery terms

### 6.2 Google web page fetches (WebFetch): 26
1. https://polyhaven.com/license
2. https://github.com/DepthAnything/Depth-Anything-V2
3. https://github.com/apple/ml-depth-pro
4. https://kenney.nl/support
5. https://raw.githubusercontent.com/apple/ml-depth-pro/main/LICENSE
6. https://quaternius.com/ (licence not stated on this page; FAQ read via curl, see 6.5)
7. https://poly.pizza/faq (403)
8. https://docs.ambientcg.com/license/
9. https://skybox.blockadelabs.com/plans
10. https://www.blockadelabs.com/terms (404)
11. https://commons.wikimedia.org/wiki/Category:360°_panoramas
12. https://photo-sphere-viewer.js.org/plugins/markers.html
13. https://photo-sphere-viewer.js.org/plugins/virtual-tour.html
14. https://www.blender.org/download/
15. https://www.blender.org/about/license/
16. https://pypi.org/pypi/bpy/json
17. https://docs.blender.org/manual/en/latest/render/cameras.html (navigation only; no usable content)
18. https://www.blockadelabs.com/tos
19. https://poly.pizza/docs/uploading (403 via WebFetch; read in the in-app browser)
20. https://www.loc.gov/pictures/collection/pan/ (403)
21. https://sketchfab.com/blogs/community/wp-json/wp/v2/posts/142060004160
22. https://arxiv.org/abs/2403.01248
23. https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
24. https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html
25. https://web3dsurvey.com/webgl2/parameters/MAX_TEXTURE_SIZE
26. https://londoncharter.org/principles.html

In-app browser reads: poly.pizza/about (404 page), poly.pizza/docs/uploading, poly.pizza/docs, poly.pizza/, poly.pizza/m/6XXj6DSBb08; loc.gov about-this-collection (Cloudflare "security verification" page shown; not bypassed). Local prototypes served from a temporary localhost server (stopped) and viewed in a separate browser tab (closed).

### 6.3 Google Developer Knowledge MCP: 5
1. `search_documents`: model-viewer hotspots annotations slot hotspot data-position accessibility
2. `search_documents`: WebXR 360 panorama immersive web content best practices performance mobile
3. `answer_query`: How do I make model-viewer hotspots accessible with keyboard focus and screen readers, including hotspot slot buttons and data-visibility attributes?
4. `search_documents`: web.dev optimize 3D models glTF Draco Meshopt KTX2 texture compression mobile load performance
5. `search_documents`: Maps Embed API Street View mode iframe usage cost free unlimited terms of service

### 6.4 Context7: 20 calls
`resolve-library-id` (7): three.js (-> /mrdoob/three.js); Photo Sphere Viewer (-> /mistic100/photo-sphere-viewer and /websites/photo-sphere-viewer_js); React Three Fiber drei (-> /pmndrs/drei, /pmndrs/react-three-fiber); Pannellum (-> /mpetroff/pannellum); Blender Python API (-> /websites/blender_api_current, /websites/blender_api_4_5); Playwright (-> /microsoft/playwright); glTF-Transform (-> /donmccurdy/gltf-transform).
`query-docs` (13):
1. /mrdoob/three.js: Load equirectangular panorama texture as scene background and environment map using PMREMGenerator, EquirectangularReflectionMapping
2. /websites/photo-sphere-viewer_js: markers plugin: add marker with html, image, tooltip, click event, listContent, keyboard accessibility, virtual tour plugin node links
3. /pmndrs/drei: Html component annotation occlude, Environment component files hdr preset, useGLTF preload draco
4. /websites/blender_api_current: Run Blender in background without UI with Python script; set camera type PANO and Cycles panorama_type EQUIRECTANGULAR; render still to file
5. /mrdoob/three.js: Raycaster setFromCamera pointer intersectObjects click picking, and CSS2DRenderer for HTML labels on 3D objects
6. /mistic100/photo-sphere-viewer: keyboard navigation keyboard shortcuts focus accessibility aria markers tabindex
7. /mpetroff/pannellum: multi-scene tour config JSON hotspots type scene info createTooltipFunc clickHandlerFunc cssClass
8. /microsoft/playwright: Launch Chromium headless with WebGL enabled for screenshots of a canvas: launch args --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader, page.screenshot, evaluate
9. /donmccurdy/gltf-transform: CLI optimize command: compress meshopt draco, texture compression ktx2 webp, resize textures, simplify; reduce file size for web
10. /websites/photo-sphere-viewer_js: EquirectangularTilesAdapter tiled panorama large image, cubemap adapter, gyroscope plugin device orientation iOS permission, and low-resolution base preview
11. /websites/blender_api_current: Camera panorama_type enum EQUIRECTANGULAR property and Cycles device selection CPU, scene.cycles.samples, use_denoising, render.resolution_x, bpy.ops.render.render write_still, bpy.ops.export_scene.gltf (returned "No documentation matched")
12. /websites/blender_api_current: Camera panorama_type enum EQUIRECTANGULAR (returned generic Camera class only; property confirmed from the official API pages instead)
13. /websites/blender_api_4_5: CyclesRenderSettings samples denoise device CPU; bpy.ops.export_scene.gltf export_format GLB (low-value result)

### 6.5 Direct primary-source fetches via curl and in-session tests (not counted toward quotas)
- Hugging Face model API (licence tags, sizes): depth-anything/DA3-{SMALL,BASE,LARGE,GIANT}, DA3MONO-LARGE, DA3METRIC-LARGE, Depth-Anything-V2-{Small,Base,Large}-hf, Intel/dpt-large, Intel/dpt-hybrid-midas, apple/DepthPro-hf, black-forest-labs/FLUX.1-{dev,schnell}, stabilityai/stable-diffusion-xl-base-1.0, Insta360-Research/DiT360-Panorama-Image-Generation, onnx-community/{depth-anything-v2-small, DepthPro-ONNX, depth-anything-v3-small}, Xenova/depth-anything-small-hf; model searches "360 panorama" and "equirectangular". Raw files: huggingface.co/apple/DepthPro/raw/main/{LICENSE,README.md}.
- GitHub API (licence, push date): ByteDance-Seed/Depth-Anything-3, Insta360-Research-Team/DiT360, isl-org/MiDaS, apple/ml-depth-pro, DepthAnything/Depth-Anything-V2, mistic100/Photo-Sphere-Viewer, mpetroff/pannellum, google/model-viewer, blender/blender, donmccurdy/glTF-Transform, KhronosGroup/KTX-Software, repository search "blender-mcp", README of ahujasid/mcp-for-blender; raw README of DiT360 and apple/ml-depth-pro.
- npm registry (versions, licences, publish dates): three, @photo-sphere-viewer/{core,markers-plugin,virtual-tour-plugin}, pannellum, @google/model-viewer, @gltf-transform/{cli,functions}, ajv, zod, playwright, @react-three/{fiber,drei}, three-mesh-bvh, @huggingface/transformers, onnxruntime-web. jsDelivr files for gzip sizes and string counts: PSV core/markers/virtual-tour/gallery/gyroscope 5.15.1, pannellum 2.5.7, three 0.186.1.
- Publisher pages via curl: https://quaternius.com/faq.html and index.html; https://polyhaven.com/faq; https://poly.pizza/about (403 for curl).
- Wikimedia Commons API (categoryinfo, categorymembers, full-text search in the file namespace, imageinfo/extmetadata) for about 30 category and keyword checks listed in section 1.3.
- Sketchfab public search API (7 keyword queries, CC0 + downloadable); Smithsonian Open Access API (8 queries with `DEMO_KEY`, returned `OVER_RATE_LIMIT`, no usable data); Blender API docs pages `bpy.types.Camera` (4.2, 4.5, 5.0, 5.1, current) and `bpy.types.CyclesCameraSettings` (404).
- Prototypes (scratch only, not delivered): procedural three.js 0.186.1 room baked to 4096x2048 equirect; viewed in Photo Sphere Viewer 5.15.1 + Markers plugin and in Pannellum 2.5.7 with DOM accessibility probes; Chrome (ANGLE Metal, Apple M1).

### 6.6 Not done
Blender install or render test (disk full); phone testing; headless Playwright run; screen-reader testing; iOS/Android memory limits beyond survey data; Smithsonian 3D coverage; LoC page reads beyond search snippets (bot challenge not bypassed); Poly Pizza CC0 share; Mapillary coverage near the inductees' sites.
