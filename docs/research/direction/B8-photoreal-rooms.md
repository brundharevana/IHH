# B8 - Photoreal rooms: what CyArk-level realism costs us, and what is honest

Date: 2026-10-12. Research spike only; no product code changed, nothing committed. Throwaway proofs: `<session scratchpad>/spike-photoreal/` (called `S/` below; `S/www/a.html`, `b.html`, `c.html`, `d.html`, served by `S/serve.py`, shot with `S/shot.mjs`). Compressed copies of every proof screenshot are in `docs/research/direction/spikes/b8-*.webp`.

Confidence tags: [H] measured or read from a primary source this session, [M] from a fetched or search summary of a primary page, [L] inference or not verified.

Context: CyArk Tapestry renders streamed Gaussian splats of real places in PlayCanvas, with a 1 M-splat mobile budget, and loads about 104 MB of splat data before Start (`REF-tapestry-tech.md` section 0). Our phone budget today is 2.5 MB download and 24 MB GPU textures per room (`site/src/museum/budget.js`).

## 0. Recommendation (read this first)

> **Recommended: A for the gallery rooms, D for the Einstein study, B only as a later stretch with our own capture.**
>
> 1. **A. Real-photo 360 room shell + composited archival frames.** A CC0 Poly Haven panorama of a real, present-day empty room is the room. The camera only rotates ("drag to look around"). Archival photos hang as framed planes on walls solved from the panorama, with numbered rings. It looked like a real room in the proof, fits the **current** download budget, and needs only a GPU-memory format change (KTX2). Effort about 4-6 days.
> 2. **D. Einstein study = the archival photographs themselves, with a small depth parallax** (computed by an Apache-2.0 depth model). The visitor looks into the 1943 photo rather than into a CG guess. This is the honest maximum; a CG rebuild cannot be more truthful than the photos it is built from. Effort about 1.5-2 days.
> 3. **B. Gaussian splats** give the best realism (5/5, Tapestry parity) and run on phones. But no openly licensed splat we found is both suitable and clean on rights. Do this only if we capture a room we have rights to, and budget 2-14 MB per room.
> 4. **C. Upgraded CG** (CC0 models, HDRI light, no bake) still looked computer-generated in the proof. Blender baking would raise it, but at the highest effort. Not recommended as the main route.

## 1. Option A - real 360 panoramas as the room shell

### 1.1 Candidate panoramas (all Poly Haven, CC0)

Licence for all rows: Poly Haven assets are CC0. Any use, including commercial, is allowed and attribution is optional, but you may not claim authorship or re-license the asset. Source: https://polyhaven.com/license (accessed 2026-10-08, recorded in `B1-R2-scene-production.md`) [H]. Metadata below is from `https://api.polyhaven.com/info/<id>` and `/files/<id>`, accessed 2026-10-12 [H].

| id (URL `https://polyhaven.com/a/<id>`) | Author, published | Max res | What it shows | Fit |
|---|---|---|---|---|
| `small_empty_room_3` (used in proof) | Sergej Majboroda, 2023-10-22 | 16384x8192 | Empty modern room: white walls, curtain, wood floor | Best clean wall space. Reads as a small modern room, not a grand gallery |
| `small_empty_room_1`, `_2`, `_4` | Sergej Majboroda, 2023-09/10 | 16384x8192 | Same series: empty walls, doors, curtains | Gives one consistent room per inductee (4 rooms) |
| `st_fagans_interior` | Morgan Evans, 2020-09-10 | 16384x8192 | Modern museum lobby (benches, stairs) | Real named museum (St Fagans, Wales): label it, or skip it |
| `sculpture_exhibition` | Oliksiy Yakovlyev, 2019-04-18 | 17000x8500 | White-walled exhibition hall full of sculptures | Gallery look, but the walls are full of third-party artworks (see 1.4) |
| `museum_of_ethnography` | Oliksiy Yakovlyev, 2018-12-13 | 17500x8750 | Display cases, crowded | Too busy; someone else's collection |
| `church_museum`, `penguin_museum`, `hall_of_mammals` | various, 2019-2026 | up to 24576x12288 | Themed displays | Themes clash with IHH |

- ambientCG HDRIs (CC0) were also checked through `https://ambientcg.com/api/v2/full_json?type=HDRI`. The indoor set is classrooms, lobbies, garages and stages; it has no gallery [H].
- Gap: no CC0 "white-cube" gallery with bare walls exists in either library. The empty-room series is the cleanest shell. Its honest label is "a present-day room", not "a museum".

### 1.2 Proof A (built and shot)

`S/www/a.html`: three.js 0.186.1 renders the equirect as `scene.background`, with a rotation-only camera.
- **Wall solve.** I picked three points by eye on the floor/wall line of one blank wall, at 2048-px reference coordinates (1500,745), (1700,789) and (1900,768). Each point becomes a floor point at an assumed camera height of 1.6 m, and a line is fitted through them.
- **Results.** The middle point lies 5 mm off the fitted wall line (`collinearResid_m -0.005`). The solved wall is 1.39 m away. The ceiling line at the same column gives a room height of 2.69 m, which is plausible. So the three-click solve is sound [H].
- **Why the height guess does not matter.** With a rotation-only camera, the camera height only scales the whole room. It cancels out on screen.
- **Frames.** Frames (box, mat, photo tinted to the wall's exposure, soft shadow quad) and a numbered ring sprite sit on the solved wall.

Screenshots (Read and checked):
- `spikes/b8-A-pano-desktop.webp` (scratch `S/shots/A-pano-desktop.png`): three framed NARA photos on the real wall. They read as hung prints; the wall socket below gives a true scale cue.
- `spikes/b8-A-pano-desktop-wide.webp`: wide view. The frames hold correct perspective as the wall recedes into the corner.
- `spikes/b8-A-pano-phone.webp`: phone portrait, 80 deg FOV.

Frame rate (rotation-only, 4 s yaw sweep):
- SwiftShader (CPU), 780x1688 phone pixels: 20.2 fps mean, p95 52.5 ms [H].
- Apple M1 (Metal) headless: 29.1 fps. That is the headless 30 fps cap, so it is not a GPU limit [H].
- Real phones: a single textured background draw is the cheapest possible scene [L].

### 1.3 Phone size: download and GPU (measured on `small_empty_room_3`, `sculpture_exhibition`, `st_fagans_interior`)

| Format | Download | GPU (decoded) | Pixels per degree |
|---|---|---|---|
| Equirect 4096x2048, WebP q80 | 0.26 / 0.41 / 0.27 MB | 33.5 MB RGBA8 without mips (44.7 MB with mips) | 11.4 |
| Equirect 6144x3072, WebP q80 | 0.60 / 0.85 / 0.53 MB | 75.5 MB without mips | 17 |
| Equirect 8192x4096, WebP q80 (JPEG q80 2.3-3.1 MB) | 1.14 / 1.42 / 0.89 MB | 134 MB without mips | 22.8 |
| Cubemap 6x1024, WebP q80 | 0.26 / 0.32 / 0.24 MB | 25.2 MB RGBA8 without mips | 11.4 |
| Cubemap 6x1536, WebP q80 | 0.50 / 0.62 / 0.42 MB | 56.6 MB RGBA8 without mips | 17 |
| **Cubemap 6x1536, KTX2 ETC1S (basis, q160, no mips)** | **1.05 MB** (measured, `small_empty_room_3`) | **7.1 MB as ETC2 RGB (4 bpp); 14.2 MB as ASTC 4x4 / BC7 (8 bpp)** | 17 |
| Cubemap 6x1536, KTX2 UASTC + RDO | 4.81 MB (measured) | 14.2 MB | 17 |
| Cubemap 6x2048, KTX2 ETC1S | about 1.9 MB [L, scaled] | 12.6 MB ETC2 / 25.2 MB ASTC | 22.8 |

Measured with Pillow plus `ktx2-encoder` 0.6.0 (MIT, Basis Universal) in `S/pano/sizes.py` and `S/ktx.mjs` [H]. GPU sizes are arithmetic from the format [H].

Pixel density target: a phone in portrait at 70 deg vertical FOV over 1688 device px shows about 24 px/deg. So 6x1536 is slightly soft and 6x2048 is near 1:1.

**Cost against today's budget:**
- WebP or JPEG panoramas are fine on download (0.3-1.4 MB) but **break the 24 MB GPU budget** at 4k and above. The proof itself (4k equirect, no mips) used 33.5 MB.
- **KTX2 ETC1S at 6x1536 fits both budgets with no revision**: 1.05 MB download and 7-14 MB GPU.
- 6x2048 ETC1S fits download and fits GPU only when the device transcodes to ETC2. On ASTC it is 25 MB, so the GPU budget would need a revision to about 32 MB (justification: the panorama replaces all room geometry and textures).
- One-time cost: three's `KTX2Loader` plus the Basis transcoder (WASM). Size not measured here [L, typically a few hundred KB].
- **Unknown:** ETC1S artefacts on smooth grey walls (banding or blocking) were not inspected after transcode. If ETC1S bands, UASTC costs 4.8 MB download (over budget).

### 1.4 Limits and truth fit

- **Truth fit: good if labelled.** It is a real present-day room, not a historical place. The proof label reads: "Modern gallery setting: a present-day room photographed as a 360 panorama (Poly Haven, CC0). Not a historical place."
- **Third-party artworks.** CC0 covers the photographer's rights in the panorama. It does not clear artworks shown in it (sculpture_exhibition, museum_of_ethnography) [L, general copyright principle]. Prefer the empty rooms.
- **No walking.** Tapestry also mostly moves between fixed viewpoints. Several viewpoints per room would need several panoramas of the same room, and Poly Haven offers one per room.
- **Small rooms.** The empty-room series are small rooms (about 2.7 m high, walls 1.4 m from the camera). That fits 3-5 frames per wall section, not a grand hall.

### 1.5 Effort (A): about 4-6 days

| Task | Days |
|---|---|
| Panorama viewer mode in `site/src/museum` (KTX2 cubemap background, low-res WebP first paint) | 1.5 |
| Wall-solve authoring tool (click floor-line points, output a wall plane in JSON) plus content schema | 1.5 |
| Frame and ring placement from data, reusing `hotspots.js` and `exhibits.js` | 1 |
| Budget gate update (count GPU bytes of compressed formats), credits, a11y text alternative for the panorama | 1 |
| Buffer | 1 |

## 2. Option B - Gaussian splats of real interiors

### 2.1 Viewers (all open source)

| Viewer | Licence, last push | Notes |
|---|---|---|
| **Spark** `@sparkjsdev/spark` 2.3.1 (used) | MIT, pushed 2026-10-12 | three.js >= 0.180, works with our 0.186.1. Loads PLY/SPZ/SPLAT/KSPLAT/SOG/RAD. 16 bytes per splat in `PackedSplats`. Sorting runs in a dedicated worker. Docs give budgets of "Android phone: 1-2 million splats", "iPhone: 1-3 million splats". Has LoD and paged streaming (`.rad`). Source: Context7 `/sparkjsdev/spark` (docs `performance.md`, `packed-splats.md`, `new-spark-renderer.md`) [H]. Package on disk 16 MB; the `spark.module.js` bundle embeds a WASM blob. Prior research measured 920 KB gz [M] |
| `@mkkellogg/gaussian-splats-3d` | MIT, last push 2025-10-19 | About a year without commits: maintenance risk [H] |
| `gsplat.js` (Hugging Face) | MIT, pushed 2026-09-24 | Own renderer, not three.js; we would run two WebGL stacks [H] |
| PlayCanvas engine + `splat-transform` | MIT, pushed 2026-10-09 | What Tapestry and SuperSplat use. SOG format, streamed LoD. A different engine from ours [H] |
| Training (if we capture) | Brush, Apache-2.0, pushed 2026-10-03; nerfstudio `gsplat`, Apache-2.0 | Original Inria 3DGS code is research-only, non-commercial (see B1-R2) [H] |

### 2.2 Openly licensed interior splats found (SuperSplat, filter "Downloadable")

SuperSplat lets owners set a CC 4.0 licence on downloadable splats. Source: https://blog.playcanvas.com/new-in-supersplat-downloadable-splats-licenses-and-social-links [M]. Each row below was read from the scene page on 2026-10-12 [H].

| Scene (URL) | Uploader, licence | Size, splats | Content | Rights issues |
|---|---|---|---|---|
| Grand Courts, Art Gallery of NSW `https://superspl.at/scene/4fc17f06` (proof) | eggman, CC BY 4.0 | 13.45 MB SOG, 910,632 | Grand skylit picture gallery | AGNSW allows visitor photos and video "for personal use only"; commercial use needs Gallery permission (https://www.artgallery.nsw.gov.au/visit/plan-your-visit/visit-faqs) [M]. Some displayed works may still be in copyright. Visitors visible. A named real institution, so it would imply IHH is hosted there. **High risk** |
| Hurstville_Museum_Gallery `https://superspl.at/scene/f209bd27` (proof) | eggman, CC BY 4.0; "Using LCC iOS app" | **1.87 MB** SOG, 161,576 | Small local-history gallery room | A named museum's own exhibits fill the room. **Medium-high risk**, poor truth fit |
| art museum `https://superspl.at/scene/29de02cb` | CC BY 4.0; iPhone video, MipMap Desktop | 18.51 MB, 1.7 M | Unnamed art museum | Same artwork and venue questions [M] |
| Art Gallery Interior `https://superspl.at/scene/663fbcd3` | CC BY 4.0 | 78.22 MB, 2.5 M | Rendered from an Unreal scene bought on Fab | The uploader's CC BY likely conflicts with the Fab asset licence. **Do not use** |
| Sunnyvale Heritage Museum `71a25262`; The Bowes Museum `ef9e44c1`; Buffalo AKG `fadf93a0` | CC BY 4.0 | 371 MB / 188 MB / 68 MB | Large captures | Far too large for phones without LoD streaming; named institutions |
| Hugging Face datasets tagged CC0/CC BY (e.g. `limnihil/splats` CC0, `mini99/Gaussian-Splat` CC BY) | uploader tags | 15-800 MB | Objects or town exteriors, no interiors | Tags are self-declared, provenance unknown. `GaussianWorld/scene_splat_7k` is CC BY-SA, but its indoor sources (ScanNet++ and similar) carry their own restrictive terms [L] |
| Mip-NeRF 360 "room"/"counter"/"kitchen" | none stated | n/a | Research scenes | No licence means no permission: do not use [M] |

Licence conclusion: on SuperSplat, "CC BY 4.0" is the **uploader's assertion**. It cannot grant rights the uploader lacks: venue conditions of entry, artworks on display, bystanders' likeness, or a bought 3D asset. No candidate is clean enough for the IHH site [L, legal reading; owner or legal to confirm].

### 2.3 Proof B (built and shot)

`S/www/b.html` loads the SOG files with Spark into our three.js version, using a rotation-only camera at SuperSplat's stored start pose.

Integration gotcha found: SuperSplat stores the camera pose in its viewer frame, which is the splat rotated 180 deg about Z. Rotate the splat about Z, but use the camera pose as given. Applying the flip to the camera as well put it inside floaters (blurred frames).

I first suspected Spark's SOG decoding. My own Python SOG-to-.splat decoder (`S/splat/sogdec.py`) produced an identical image, which ruled that out [H].

Screenshots (Read and checked):
- `spikes/b8-B-agnsw-desk.webp` and `spikes/b8-B-agnsw-phone.webp`: the AGNSW hall. Truly photoreal (skylight, parquet, sculpture, paintings); Tapestry parity.
- `spikes/b8-B-hurst-desk.webp`: Hurstville room at 1.87 MB. Photoreal with small defects: a black floater on the ceiling, smeared floor at the edges.
- `S/shots/ref-agnsw-thumb.jpg`: SuperSplat's own thumbnail, for comparison only.

| Measure | Hurstville (161,576 splats) | AGNSW (910,632 splats) |
|---|---|---|
| Download, SOG (WebP attribute images) | 1.96 MB (measured zip of files) | 14.1 MB (13.45 MB listed) |
| `.splat` (32 B/splat, no SH) | 5.17 MB (measured, served from memory) | 29.1 MB (measured) |
| PLY, arithmetic | about 11 MB without SH / 40 MB with SH3 | about 62 MB without SH / 226 MB with SH3 |
| GPU, Spark PackedSplats at 16 B/splat | 2.6 MB plus sort buffers | 14.6 MB plus sort buffers (sort buffer size not measured) [L] |
| Decode/init in browser | 80-95 ms | 540-815 ms |
| SwiftShader, 780x1688 | 1.2 fps | 0.5 fps (some frames 8 s) |
| Apple M1 (Metal), 780x1688, headless | 30 fps (headless cap) | 30 fps (headless cap); 57.8 fps in a visible Chrome pane at 750x1624 [H] |

- SwiftShader is a CPU rasteriser; splat blending of hundreds of thousands of overlapping quads is its worst case. Its numbers say nothing about phones and must not gate this decision.
- What matters: our M1 hits the cap; Spark documents 1-3 M splats for phones; Tapestry ships a 1 M-splat mobile budget. **Real-device fps was not measured.**
- Sorting: Spark sorts with 32-bit keys in a worker. During fast drags the order lags by a frame or two, so rotation-only cameras are the easy case [M from docs].
- Budget cost: a 160k-splat room (about 2 MB) **fits today's 2.5 MB budget**. A 1 M-splat room needs the per-room download raised to about **15 MB** (Tapestry: 104 MB before Start).
- Capturing our own room: photographs or a 360 video of a room we have permission to film (e.g. a university gallery), trained with Brush (Apache-2.0, runs on a Mac) and compressed to SOG with `splat-transform` (MIT). Expected 1.5-15 MB depending on splat count [L]. Effort 6-10 days including capture, cleanup and the viewer.
- Hotspots: archival frames can be hung in a splat exactly as in A, because the splat has real depth. Raycasting against splats is built into Spark (`raycastable`, `minRaycastOpacity`) [H, docs].

## 3. Option C - upgraded CG (CC0 models, HDRI light, optional Blender bake)

### 3.1 Proof C (built and shot)

`S/www/c.html` builds a 5 x 5 x 2.8 m room from:
- Poly Haven CC0 1k PBR textures (`wood_floor`, `painted_plaster_wall`).
- CC0 glTF models: `painted_wooden_table` (Kirill Sannikov), `Rockingchair_01` (Jorge Camacho), `desk_lamp_arm_01` (Kuutti Siitonen / Yann Kervran), `book_encyclopedia_set_01` (John Malcolm).
- Lighting: image-based light from the 1k HDR of `small_empty_room_3` (1.5 MB), one shadowed sun light, AgX tone mapping, GTAO pass for the desktop shot.

Screenshots: `spikes/b8-C-cg-desk-ao.webp` and `spikes/b8-C-cg-phone.webp`. Better materials than our current rooms, but it **still reads as CG**: flat bounce light, no colour bleed, weak contact shadows [H, visual].

Measured on the phone view: 97 draw calls, 207,786 triangles. That exceeds our 80-call and 150k-triangle budget with just 4 props. 30 fps on M1 (cap). The 1k glTFs are 0.8-3.3 MB each, so 8.7 MB for four [H].

three r186 note: `PCFSoftShadowMap` is removed and falls back to `PCFShadowMap` (console warning) [H].

### 3.2 Blender bake (not built)

- Blender is not installed on this machine. During this session the disk also dropped below 150 MB free, so a roughly 1 GB install was not attempted.
- The quality ceiling with Cycles-baked lightmaps and AO on CC0 assets is good "architectural visualisation" (realism about 3.5/5). It stays clearly CG next to a photo or a splat [L].
- Effort: 8-15 days per the first-room pipeline (UV2 unwrap, bake, KTX2, glTF-Transform, rebake whenever anything moves). Ongoing art skill is needed (adoption risk, B1-R2) [L].

## 4. Option D - the Einstein study (EIN-M-0013, EIN-M-0014)

What the sources support: two NARA photographs of the same study on 24 July 1943 (80-G-42918 and 80-G-42919), from two nearby angles, each with sitters in the foreground. They show one bookcase wall, a desk, a lamp, a framed certificate and a window corner. Everything else in the room is unknown. The current CG reconstruction is honest about this: unseen walls are grey with the label "Not shown in the source photographs" (`reconstruction.js`).

### 4.1 Proof D (built and shot)

`S/www/d.html`:
- **Depth map.** Depth estimated with **Depth Anything V2 Small**: ONNX (`onnx-community/depth-anything-v2-small`, quantised, 27 MB, used only at build time), CPU onnxruntime, 0.3 s per photo [H].
- **Licence trap.** The Small model is **Apache-2.0**. The Base and Large checkpoints are **CC BY-NC 4.0** and must not be used. Source: HF API tags for `depth-anything/Depth-Anything-V2-Small-hf` and `-Base-hf` [H].
- **Mesh.** The photo becomes a 321x258-vertex plane displaced by the depth map. The camera may orbit only +/-5 deg horizontally and +/-2 deg vertically.
- **Label.** "The slight depth effect is computed from this photograph; nothing is added to the scene."

Screenshots: `spikes/b8-D-einstein-parallax-pair.webp` (-5 deg left, +5 deg right; the figures move against the bookcase) and `spikes/b8-D-einstein-parallax-desk.webp`. The depth map is believable: two figures, desk, tin, background bookcase (`S/depth/pair13.jpg`).

Visible artefact: the white print border warps at the edges. Fix by cropping to the image area and feathering depth to flat at the borders [H].

Per photo: 1024-px JPEG 160 KB plus depth PNG 157 KB (a WebP or 8-bit depth would be about 30 KB [L]). GPU about 4 MB for both textures. Effort 1.5-2 days (build-time depth script, viewer component, border/edge treatment, reduce-motion fallback to a flat photo).

### 4.2 What is honest for the study

| Approach | Truth fit | Comment |
|---|---|---|
| **Photo-first view with depth parallax (proof D)** | **Best.** Every pixel is the 1943 photograph | Shows the actual room, the actual day. It cannot be walked; that is the point |
| Current CG reconstruction (`reconstruction.js`) | Acceptable with its disclosures (colour, size and layout are estimates) | Realism is capped by guesses; making it "photoreal" would make the guesses look like facts |
| Photogrammetry or splat from the two photos | Not achievable | Two views with people in front are far below what 3DGS needs (dozens to hundreds of views) [L] |
| AI view synthesis to "fill in" the room | Fails the truth rule | It invents walls, objects and light that no source shows |
| Present-day capture of 112 Mercer Street | Not available | Private residence; no open capture found (B1-R2) |

Recommendation for D: make the photographs the main view of the study (parallax "window" per photo, rings over the visible items). Keep the CG reconstruction as an optional "how we estimated the layout" view, or drop it. Do not upgrade the CG to look photoreal.

## 5. Decision matrix

Scale: realism 0-5 (5 = indistinguishable from a photo while moving). Phone feasibility: H/M/L. Sizes are per room.

| Option | Realism | Phone feasibility | Download | GPU | Effort (days) | Licence risk | Truth-rule fit |
|---|---|---|---|---|---|---|---|
| **A. CC0 panorama shell + composited frames** | **4** (photo room; frames convincing; rotation only) | **H** (one background draw; 20 fps even on SwiftShader) | **1.05 MB** (KTX2 ETC1S 6x1536) | **7-14 MB** | **4-6** | **Low** (CC0; avoid panoramas with third-party art) | **Good** with "present-day room" label |
| B1. Downloaded CC BY splat (AGNSW) | 5 | M-H (M1 at cap; Spark/Tapestry say 1 M splats OK on phones; device fps unmeasured) | 13.5 MB | about 15 MB + sort | 3-4 | **High** (venue terms, artworks, bystanders; uploader assertion only) | Poor (implies a named institution hosts IHH) |
| B2. Small CC BY splat (Hurstville) | 4.5 (some floaters) | H | 1.9 MB | about 3 MB | 3-4 | Medium-high | Poor (another museum's exhibits fill the room) |
| B3. Our own capture to splat | 4.5-5 | M-H | 2-15 MB (budget revision above 2.5 MB) | 3-15 MB | 6-10 incl. capture | Low if we get written permission for the space | Good if labelled with the place and date |
| C1. CG + CC0 PBR + HDRI, no bake (proof) | 2 | M (97 calls / 208k tris already over budget) | 2-9 MB | 10-30 MB [L] | 3-5 | Low (CC0) | Good (clearly CG) |
| C2. CG + Blender-baked lightmaps | 3-3.5 | M-H | 3-6 MB [L] | 10-20 MB [L] | 8-15 | Low | Good |
| **D. Einstein: archival photo + depth parallax** | 4 for the photo itself (it is real); 2.5D motion only | **H** | **0.2-0.35 MB per photo** | **about 4 MB** | **1.5-2** | **Low** (NARA photos as already cleared in media.jsonl; model Apache-2.0) | **Best** |

## 6. Budget revision (only if B is adopted)

| Budget | Today | A | B (own 160k-splat room) | B (1 M-splat room) |
|---|---|---|---|---|
| Download per room | 2.5 MB | fits (1.05 MB + frames) | fits (about 2 MB) | needs about 15 MB |
| GPU textures | 24 MB | fits as KTX2; **WebP/JPEG panoramas do not fit** | fits | about 15 MB of splat buffers, outside "textures", so the gate needs a new `splatBytes` line |

`checkBudget` today counts `textureBytes` as decoded size. A KTX2 panorama must be counted at its compressed GPU size, otherwise it is over-counted 4-8x.

## 7. Unknowns and caveats

- Real-device fps for splats and panoramas: not measured. SwiftShader and headless M1 (capped at 30 fps) only.
- ETC1S visual quality on smooth walls after transcode: not inspected. Pick ETC1S vs UASTC after a phone check.
- Basis transcoder WASM size: not measured.
- Poly Haven camera height is unknown; I assumed 1.6 m. It only scales the room for a rotation-only camera. The 5 mm collinearity residual shows the picked wall is consistent.
- SuperSplat licences are uploader assertions. A legal read is needed before any third-party splat ships.
- `sculpture_exhibition` and other gallery panoramas show artworks whose own copyright the CC0 grant does not cover [L].
- Environment: free disk on `/` fell to about 140 MB during the session (ENOSPC on one write). It later recovered to about 1 GB; the cause is outside this spike. Large intermediates were deleted. The 8k source JPEG of `small_empty_room_3` (and of the three rejected museums) was deleted; `S/pano/out/` keeps the 4k outputs, the 6x1536 cube faces and the ETC1S KTX2 files.

## 8. Sources (accessed 2026-10-12 unless noted)

- Poly Haven API: https://api.polyhaven.com/assets?type=hdris&categories=indoor , `/info/<id>`, `/files/<id>`; licence https://polyhaven.com/license (2026-10-08).
- ambientCG API: https://ambientcg.com/api/v2/full_json?type=HDRI
- Spark docs via Context7 `/sparkjsdev/spark` (README, `loading-splats.md`, `splat-mesh.md`, `packed-splats.md`, `performance.md`, `new-spark-renderer.md`); repo https://github.com/sparkjsdev/spark (MIT).
- SuperSplat scenes: https://superspl.at/scene/4fc17f06 , https://superspl.at/scene/f209bd27 , https://superspl.at/scene/29de02cb , https://superspl.at/scene/663fbcd3 , https://superspl.at/scene/71a25262 , https://superspl.at/scene/ef9e44c1 , https://superspl.at/scene/fadf93a0 ; licence feature https://blog.playcanvas.com/new-in-supersplat-downloadable-splats-licenses-and-social-links
- AGNSW visitor photography terms: https://www.artgallery.nsw.gov.au/visit/plan-your-visit/visit-faqs
- Hugging Face API: dataset search "gaussian splat" / "3dgs"; models `onnx-community/depth-anything-v2-small`, `depth-anything/Depth-Anything-V2-Small-hf` (Apache-2.0), `depth-anything/Depth-Anything-V2-Base-hf` (CC BY-NC 4.0).
- GitHub API (licence, last push): ArthurBrussee/brush, nerfstudio-project/gsplat, playcanvas/splat-transform, sparkjsdev/spark, mkkellogg/GaussianSplats3D, huggingface/gsplat.js, DepthAnything/Depth-Anything-V2.
- `ktx2-encoder` 0.6.0 (MIT, Basis Universal): https://github.com/gz65555/ktx2-encoder
- Internal: `docs/research/direction/REF-tapestry-tech.md`, `B1-R2-scene-production.md`, `site/src/museum/budget.js`, `site/src/museum/reconstruction.js`, `data/inductees/einstein/media.jsonl` (EIN-M-0013, EIN-M-0014).
