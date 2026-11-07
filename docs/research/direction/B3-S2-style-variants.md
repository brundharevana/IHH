# B3-S2: Style variants spike (one room, four looks, one archival photograph)

Spike, not production code. Run 2026-10-08 on an Apple M1, in-app Chromium (ANGLE Metal, WebGL 2.0, MAX_TEXTURE_SIZE 16384), desktop only. No iOS Safari, no Android device, no screen reader, no audience test. No recommendation is made; section 12 lists implications only.

Everything is in `Challenge IHH/spikes/s2-style/`. Nothing was installed (no npm, no pip); three.js loads from jsDelivr ES modules through an import map. S1 files were read and their code copied, none edited. Static server on port 8702 and a localhost file receiver on 8792; both stopped at the end. Disk was 145 to 305 MiB free the whole time; the folder is 1.0 MB and the saved images are 3.7 MB.

## 1. What was built

The S1 stand-in room (same geometry, same eye, same axes: +X east, -Z north, eye at (0, 1.6, 0)) re-expressed so that one geometry renders in several styles from a token file. Labelled "Illustrative reconstruction (spike)" everywhere; it is a generic gymnasium-like room, not a depiction of a real place. A freestanding display panel at (-1.6, 0, -3.6), about 3.9 m from the eye, carries one framed public-domain archival photograph (section 3). The panel and photograph are the same in every style.

| File | Role | Size |
|---|---|---|
| `room.js` | Room builder driven by a resolved style: materials per role, curve segments, faceted planes, toon gradient map, outlines (hull and camera-facing edge ribbons), lights, sky-dome sampler, Poly Haven props (restyled, optionally decimated), photo panel | 28 KB |
| `bake.js` | Pipeline: cube capture, K-sample accumulation, resolve (tone, mask, dither), 8-bit readback, WebP, analysis, saving; per-face Sobel control shader; rotation test; viewed-through-a-sphere test; orientation gate | 26 KB |
| `analysis.js`, `figures.js` | Seam metrics, rotation difference, line weight, legibility, tone tails; sheet, seam crops, legibility and viewed figures | 11 KB, 7 KB |
| `tokens.js` | Resolves a DTCG-like token document (base defaults plus one style group) to parameters; accepts colour objects or hex | 2 KB |
| `styles-all.json` | Working tokens for all looks: `base`, `ref` (textured baseline), `clay`, `lowpoly`, `toon`, `duotone` | 11 KB |
| `style-tokens.json` | Drafted tokens for the best two (toon and duotone) plus `base`, DTCG 2025.10 colour objects, `$type` on every token | 16 KB |
| `make-style-tokens.py` | Derives `style-tokens.json` from `styles-all.json` | 3 KB |
| `bake.html`, `sheet.html`, `sheet.js`, `overlay.html` | Pages: bake, comparison sheet, accessibility-tree check page | small |
| `recv.py`, `serve.py` | Harness only: file receiver (ports 8792, allowlisted names); `python3 -m http.server` plus `Cache-Control: no-store` so edited modules reload | 2 KB, 1 KB |
| `photo/glacier-point-1903-left-frame.jpg` | The archival photograph, left frame only, 462x552 | 100 KB |
| `out/` | Per-style flat and zoom previews, `results-<style>.json`, `rotation-test.json`, `rotation-paired.json`, `handedness-gate.json`, `token-parity.json`, `timings-warm5.json`, `tonal-distance.json` | 0.8 MB |

Pipeline in one paragraph. A `CubeCamera` (2048 px faces, half-float) captures the room with the photograph written as alpha 0 and everything else as alpha 1. For K samples (K = 1, or 96 to 128 shadowed sky-dome directions for clay and duotone) the cube is re-captured and sampled into two half-float accumulation targets with one-minus blending: a 4096x2048 equirect (S1's direction formula, unchanged) and a 1280x720 perspective view (yaw +6, pitch +3, horizontal FOV 96 degrees) plus a second 1280x720 zoom view (yaw -24, pitch -2, FOV 40). A resolve pass then applies tone mapping (Khronos neutral or none), the optional ordered-dither duotone grade (only where the alpha mask says "constructed layer"), and sRGB encoding into an 8-bit target that is read back top-row-first. The photograph is never tone mapped or graded. Equirect and previews therefore come from the same captured cube and the same eye.

## 2. Exact versions and URLs

| Library | Version | URL |
|---|---|---|
| three.js | 0.186.1 (r186), MIT | `https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js` |
| three addons | same | `https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/` (`loaders/GLTFLoader.js`, `modifiers/SimplifyModifier.js`, `utils/BufferGeometryUtils.js` for `mergeVertices`) |

Photo Sphere Viewer was not used (S2 does not need a viewer); "viewed through a sphere viewer" was emulated with a bilinear, no-mipmap, clamp-in-latitude equirect sampler (section 7.4), not with PSV itself. Props are the two S1 Poly Haven CC0 assets (`standing_chalkboard_01`, `wicker_basket_01`, 1k glTF) fetched through the Poly Haven API at run time (cold 1.7 s in S1, 26 to 67 ms here with a warm HTTP cache); licence verification is in the S1 report section 3.

Context7: 4 calls (1 `resolve-library-id` for Three.js, 3 `query-docs` on `/mrdoob/three.js`). They confirmed: `MeshToonMaterial.gradientMap` needs `NearestFilter` for min and mag and a non-colour texture; `SimplifyModifier.modify(geometry, count)` is async and `count` is the number of vertices to remove; `AdditiveBlending` is `SRC_ALPHA, ONE` (so the pipeline uses `CustomBlending` with `ONE, ONE` to keep alpha as the mask); `EdgesGeometry` threshold is in degrees; `readRenderTargetPixels` signature. One WebFetch of the DTCG colour module page (https://www.designtokens.org/tr/2025.10/color/) gave the colour value shape (`colorSpace`, `components`, optional `alpha`, optional `hex`); the same page did not document dimension or number tokens, so the `{value, unit}` dimension form used here is from memory of the spec and unverified.

## 3. The archival photograph (verified, rights recorded)

| Field | Value |
|---|---|
| Item | "[Theodore Roosevelt and John Muir on Glacier Point, Yosemite Valley, California, in 1903]" |
| Item page | https://www.loc.gov/item/93503130/ |
| Holder | Library of Congress Prints and Photographs Division |
| Call number | PRES FILE - Roosevelt, Theodore--Misc. Political and Social Activities [item] [P&P] |
| Reproduction number | LC-DIG-ppmsca-36413 (digital file from original item) |
| Date and creator on record | c1906 [photo taken 1903]; Underwood & Underwood, copyright claimant; 1 photographic print : stereograph (unmounted) |
| Rights advisory (record field `rights_advisory`) | "No known restrictions on publication." |
| Rights information (record field `rights_information`) | "No known restrictions on publication." |
| File used | `https://tile.loc.gov/storage-services/service/pnp/ppmsca/36400/36413v.jpg`, 1024x637, 353,507 B; the stereograph holds two frames, only the left frame was kept (cropped with macOS `sips`, 462x552, 100,317 B) |

How it was verified, and a limit. The item's HTML page (https://www.loc.gov/item/93503130/) answered my browser tab with a Cloudflare "Performing security verification" interstitial and a WebFetch of it returned 403. I did not attempt to pass the bot check. The rights lines above were read from the Library's own record for the same item through its JSON interface (`https://www.loc.gov/item/93503130/?fo=json`, HTTP 200), whose `rights_advisory` and `rights_information` fields hold the text shown on the item page. So the rights line is verified against the holder's record, not against a rendered page. Photograph shows two real, named historical people (named in the Library's title); no statement about them is made anywhere in the spike beyond that title. The room does not depict Yosemite.

Other candidates checked and not used: Frances Benjamin Johnston, Western High School, Washington, D.C., 1899, gymnasium cyanotypes (LCCN 2002695166 and 97505150), both "No known restrictions on publication", rejected only because cyanotype blue would confound the grade test; Carlisle Indian School physical-education items, not used (sensitive subject, not neutral).

## 4. Images and files saved

In `Challenge IHH/docs/research/direction/spikes/` (all WebP, all under 1.5 MB):

| File | Content | Size |
|---|---|---|
| `s2-style-sheet.webp` | The 2x2 comparison sheet (2560x1764, four 1280x720 flat previews with labels and photo credit) | 450 KiB |
| `s2-clay-equirect.webp`, `s2-lowpoly-equirect.webp`, `s2-toon-equirect.webp`, `s2-duotone-equirect.webp`, `s2-ref-equirect.webp` | 4096x2048 equirects, WebP quality 70 (`ref` is the textured baseline) | 121, 164, 289, 1035, 235 KiB |
| `s2-<style>-flat.webp` | The 1280x720 flat previews | 33, 47, 73, 212, 55 KiB |
| `s2-<style>-seams.webp` | Four cube-border sites per style, 2x nearest neighbour | 36, 41, 72, 67, 59 KiB |
| `s2-toon-seams-control-sobel-clamped.webp`, `s2-toon-seams-control-sobel-unclamped.webp` | The same four sites with a per-face screen-space Sobel outline instead of geometry outlines | 63, 64 KiB |
| `s2-<style>-viewed.webp` | Direct render vs baked equirect viewed through a sphere sampler (zoom camera) | 12 to 50 KiB |
| `s2-ui-legibility.webp` | Overlay text placed on each style's measured worst-case block | 282 KiB |

Open the sheet first. Seam crops mark the cube border position with cyan ticks in the gutter, never over the pixels.

## 5. The four styles and the baseline

| Style | How it is made | Notes |
|---|---|---|
| (a) clay | `MeshStandardMaterial`, roughness 1, one warm-grey family (19 role colours from #a7a299 to #f3f1ec), no textures, no outlines. Light: 128 cosine-weighted sky-dome directions, each a shadow-casting directional light, averaged; plus hemisphere 0.55 and ambient 0.12. The shell (floor, walls, ceiling) does not cast shadows so the dome reaches the interior | The only AO-like cue is shadows from the balcony, beams, props and panel; room corners are not darkened |
| (b) low-poly | `MeshLambertMaterial` with `flatShading`, planes subdivided into 1.2 m cells with a per-triangle lightness jitter of 7 %, curve segments scaled to 0.3, props decimated with `SimplifyModifier` (chalkboard 2,372 to 488 triangles, basket 22,276 to 112), period palette (cream, walnut, oxblood, bottle green, slate), one hard-shadow sun plus hemisphere | Whole scene 8,790 triangles against 32,790 for the others |
| (c) toon | `MeshToonMaterial` with a 3-texel gradient map (band weights 0.45 / 0.78 / 1), same flat palette family, sun with shadows, hemisphere, four pendant point lights; outlines by inverted hull (12 curved meshes) plus camera-facing edge ribbons (1,464 segments from `EdgesGeometry`, crease 30 degrees); outline width 0.26 degrees of angle | Outlines are geometry, so they exist in the cube before it is resampled |
| (d) duotone | Clay base (96 dome samples) then an ordered-dither grade in the resolve pass: luma, contrast 1.9, 8x8 Bayer, 4 levels between ink #382f27 and paper #cec4ba, cell 2 px. Ink and paper are the mean colours of the darkest and lightest 2 % of the photograph's own pixels (measured in the page) | The photograph is excluded from the grade by the alpha mask |
| ref (baseline) | S1-like: canvas wood and plaster textures, shadowed, textured chalkboard | Only for size and time comparison; not in the sheet |

Outline construction details that matter for the seam question. Hull: each curved mesh gets a back-face copy whose vertices move along smoothed normals by `distance x width` in view space, so the width is constant in angle, independent of where it falls in a cube face. Ribbons: for every hard edge a quad is built in world space facing the fixed eye, half-width `distance x width / 2`, pushed 0.8 widths toward the eye, ends extended by half a width. Instanced balusters (400) get no outline (it would fill the gaps between them); thin rails (7 cm) are mostly outline at 10 m.

## 6. Measurements

Method notes. Times are `performance.now()` with `gl.finish()` after GPU stages, on a shared machine (other spikes were running; the Browser pane is sometimes hidden, which S1 found slows encode about 3x). "Bake to pixels" is build plus capture plus accumulate plus resolve plus 8-bit readback of both previews and the equirect. "Cold" is the first bake in a freshly loaded page (shaders compile, libraries already in the HTTP cache). "Warm" is the median of five consecutive bakes in one page. Sizes are `canvas.toBlob` bytes (KiB = 1024 B).

### 6.1 Bake time and cost

| Style | Samples | Cold bake to pixels | Warm median (range of bake plus equirect WebP encode) | Capture plus accumulate (warm median) | Equirect WebP q70 encode (visible-pane loop) |
|---|---|---|---|---|---|
| clay | 128 | 2.53 s | 2.34 s (2.69 to 2.73 s) | 2.01 s | 0.37 s |
| low-poly | 1 | 0.56 s | 0.21 s (0.55 to 0.59 s) | 0.10 s | 0.37 s |
| toon | 1 | 0.40 s | 0.19 s (0.55 to 0.59 s) | 0.10 s | 0.39 s |
| duotone | 96 | 1.94 s | 1.79 s (2.36 to 2.40 s) | 1.50 s | 0.59 s |
| ref (textured) | 1 | 0.40 s | 0.25 s (0.64 to 0.68 s) | 0.15 s | 0.42 s |

Saved-run encodes (pages with `repeat=2`, pane visibility not controlled) took 1.0 to 2.1 s for the same encode, so absolute encode times vary 3x with pane state; ordering across styles is stable. The sample count is the main cost knob: 128 shadowed samples cost about 2 s; first sample 0.10 to 0.23 s. Build (scene plus props) cold 93 to 266 ms, warm 26 to 58 ms. Resolve plus readback of the 4096x2048 target: 36 to 49 ms for K = 1, 235 to 316 ms for K >= 96 (cause not investigated). Everything is far below a minute; as in S1, per-scene cost is authoring and asset size, not render time.

### 6.2 File size by style and encoder (4096x2048 equirect, KiB)

| Style | WebP q70 | WebP q50 | JPEG q70 | WebP lossless | PNG | Flat 1280x720 WebP q80 | Distinct colours (6-bit sample) |
|---|---|---|---|---|---|---|---|
| clay | 121.4 | 100.2 | 292.4 | 2,363.4 | 4,728.7 | 32.7 | 424 |
| low-poly | 164.4 | 136.3 | 353.8 | 1,013.1 | 2,033.8 | 46.6 | 1,665 |
| toon | 288.9 | 238.7 | 529.4 | 1,509.7 | 3,001.1 | 73.2 | 2,242 |
| duotone | **1,034.5** | 971.3 | 1,291.3 | **756.5** | 1,658.5 | 212.1 | 279 |
| ref (textured) | 235.1 | 187.1 | 483.9 | 4,096.8 | 7,976.9 | 55.1 | 3,606 |

S1's textured bake was 414 KiB at q80 (calibration markers, different light); the ref bake here is not a replica. Findings: flat styles compress to 121 to 289 KiB at q70, 0.5 to 1.2x the textured baseline; the ordered dither costs 4.4x the textured baseline in lossy WebP and is smaller as lossless WebP (756 KiB, because it holds only a handful of colours) than lossy (1,035 KiB); lossless is the wrong encoder for every other style (1.0 to 4.1 MiB). Against the earlier "about 3 MB per scene" budget the equirect alone is 4 to 34 %, the dither style the only one above 15 %.

### 6.3 Geometry and token counts

| Style | Triangles | Meshes | Authored tokens | Effective (minus 3 inert leftovers) | Resolved incl. base |
|---|---|---|---|---|---|
| clay | 32,790 | 168 | 27 | 24 | 62 |
| low-poly | 8,790 | 168 | 34 | 31 | 69 |
| toon | 32,790 plus 12 hulls and 1,464 ribbon segments | 168 | 36 | 33 | 71 |
| duotone | 32,790 | 168 | 28 | 28 | 63 |
| ref | 32,790 | 168 | 32 | 29 | 67 |

The 3 inert leftovers are post-process tokens set to 0 in styles without a grade, left over from restructuring into base plus overrides. `base` holds 35 inert defaults.

## 7. Cube-face seams (the toon question, and the others)

### 7.1 Orientation gate on the new pipeline

Because accumulation, the alpha mask and the flat sampler are new, S1's handedness gate was re-run on the S2 pipeline (clay, 16 samples, S1's red cube, yellow disc and N plate added). Real bake: red cube 0.18 degrees from expected, yellow disc 0.07, N diagonal contrast 0.55, PASS. Mirror control: errors 150.67 and 52.8 degrees, contrast -0.213, FAIL. Vertical-flip control: 29.33 and 109.31 degrees, FAIL. These match S1's numbers (0.16, 0.07, 0.549; 150.7, 52.8, -0.213). File: `out/handedness-gate.json`.

### 7.2 Do outlines survive the bake without seams: rotation test

Method. Bake the same room twice with the cube camera yawed 0 and 45 degrees (the sampler rotates the lookup back), so cube borders fall at different places in the two equirects. Content is identical except where a border of either bake lies. Compare luma per pixel near a border of either bake (within 2 px) against far from both (more than 8 px). Faces are classified with the hardware major-axis rule; 142,439 near pixels, 6,954,235 far pixels (rows 6 % to 94 %).

| Variant | Mean abs luma diff near borders | far from borders | Excess near minus far | p99 near / far | Fraction over 24 levels near / far |
|---|---|---|---|---|---|
| toon, geometry outlines (hull plus ribbons) | 0.87 | 0.71 | 0.16 | 27.5 / 20.3 | 1.24 % / 0.84 % |
| toon, no outlines | 0.49 | 0.39 | 0.10 | 12.0 / 9.5 | 0.65 % / 0.43 % |
| toon, per-face Sobel, neighbours clamped at the face border | 3.47 | 2.77 | 0.70 | 130.7 / 112.7 | 3.29 % / 2.55 % |
| toon, Sobel with neighbours across the border (unclamped) | 3.10 | 2.77 | 0.33 | 118.7 / 112.7 | 3.00 % / 2.55 % |
| clay | 0.357 | 0.256 | 0.10 | 9.9 / 5.8 | 0.42 % / 0.22 % |
| low-poly | 0.481 | 0.356 | 0.13 | 10.2 / 8.3 | 0.66 % / 0.40 % |
| ref (textured) | 0.609 | 0.472 | 0.14 | 15.3 / 10.2 | 0.65 % / 0.46 % |
| duotone | 0.289 | 0.246 | 0.04 | (bimodal, not informative) | 0.57 % / 0.46 % |

Reading. Geometry outlines add about 0.06 grey levels of border excess over the same room with no outlines (0.16 vs 0.10); the far-from-border difference is 0.71 levels with outlines and 0.39 without, which is the ordinary resampling noise of the cube step plus the lines themselves. The Sobel control shows border excess of 0.33 (unclamped) and 0.70 (clamped), and a far-from-border difference of 2.77 levels, 3.9 times the geometry-outline case, which is the line moving or changing weight depending on where in a face it falls.

Paired check at identical content (`out/rotation-paired.json`). The ratio of the mean luma step across a face border to the mean step 5 px to either side, evaluated at the same image locations in the bake that has a border there and the bake that does not:

| Variant | At bake-0 borders: with border / without | At bake-45 borders: with border / without |
|---|---|---|
| geometry outlines | 0.54 / 0.835 | 0.817 / 0.79 |
| no outlines | 0.847 / 0.839 | 0.948 / 0.698 |
| Sobel clamped | 1.285 / 0.898 | 1.249 / 1.038 |
| Sobel unclamped | 1.025 / 0.897 | 0.831 / 1.037 |

The measurement noise (no-outline row) is about plus or minus 0.25. Geometry outlines show no border excess; clamped Sobel shows +0.39 and +0.21, which is at or just above the noise. Honest summary: a per-face screen-space outline did not produce an obvious seam in this room either; its measurable problem here is uneven line weight, below.

A trap found on the way. A first metric compared real borders with yaw-shifted pretend borders (`seamNull`, in the results JSON). It flagged geometry outlines at z = -5.2 (fewer dark pixels near real borders, 0.62 density ratio). The paired table shows the same deficit (0.606) at those locations in the bake that has no border there, so it is image content (the real borders happen to cross flat wall), not a seam. Per-location content differences swamp a single-bake seam statistic; use paired bakes.

### 7.3 Line weight across a cube face

Mean horizontal run length (px) of outline-ink pixels (RGB within 22 of #1b1612, runs up to 10 px, rows within 15 degrees of the horizon) by distance from the centre of the face (0 centre, 1 border):

| Variant | 0 to 0.33 | 0.33 to 0.67 | 0.67 to 1 |
|---|---|---|---|
| geometry outlines | 2.46 | 3.02 | 3.17 |
| per-face Sobel (clamped) | 5.23 | 4.76 | 3.15 |

Geometry outlines vary 29 % centre to border even with constant angular width; this is probably partly sampling (not tested separately): the cube is sampled more densely near its borders (about 36 vs 18 texels per degree), so lines are crisper there and fewer of their antialiased pixels pass the ink threshold at the centre. Per-face screen-space lines vary 66 % (thick at the centre, thin at the border, because a texel subtends half the angle at the border). Targeted width was 0.26 degrees, 3.0 px at 4096; measured core runs are 2.5 to 3.2 px.

Visual check: `s2-toon-seams.webp` (geometry outlines): rail, column and beam lines run through the four border sites (A yaw +45 pitch +6, B yaw -135 pitch +12, C yaw 0 pitch +45, D the corner of three faces at yaw +45 pitch +35) without a visible break, jog or doubling. The two Sobel controls look noisy everywhere (the luma Sobel also fires on toon shading bands and shadow edges and blackens the balusters) which makes seams in them hard to see by eye.

Limits of this test. The control is an emulation: neighbour lookups are clamped (or not) inside the equirect shader, not a real separate per-face post pass over a normal or depth buffer, and it uses luma, not normals. Only one room and 4 inspected sites. Hull outlines at 0.26 degrees were not tested at other widths.

### 7.4 Dither and outlines as seen through a sphere viewer

Emulated viewer: the baked equirect (lossless, or decoded from the saved WebP q70) as a bilinear, no-mipmap texture through a perspective camera, compared with the direct render at the same camera.

| Style | Wide view (FOV 96) PSNR, resample only / with WebP q70 | Zoom view (FOV 40) PSNR, resample only / with WebP q70 |
|---|---|---|
| clay | 38.5 / 36.5 dB | 38.4 / 35.8 dB |
| low-poly | 34.0 / 32.7 dB | 35.9 / 33.8 dB |
| ref (textured) | 34.3 / 32.3 dB | 35.0 / 33.1 dB |
| toon | 29.7 / 28.6 dB | 30.0 / 28.8 dB |
| duotone | 20.1 / 20.2 dB | 20.8 / 20.8 dB |

PSNR is a poor judge for dither (a shifted pattern scores low), so see `s2-duotone-viewed.webp`: baked 2 px dither cells, magnified 2.8x by the viewer's bilinear sampling, become soft round halftone blobs; WebP q70 adds smearing. A runtime post effect would show crisp 2 px cells. The look changes from "pixel dither" to "printed halftone", and its scale changes with zoom and with the polar stretch of the equirect. For toon, outlines soften with zoom (`s2-toon-viewed.webp`) and WebP q70 adds ringing around them. Both are properties of baking any pixel-scale detail into a 4096 px panorama, not of the seam step.

## 8. Legibility of UI text over each style (worst case)

Method (WCAG failure technique F83 logic, from B2-R5): split the image into 160x40 px blocks (a 28-character line at about 16 px). White text is judged against the block's lightest 5 % (95th percentile relative luminance), dark text (#1a1a17) against its darkest 5 %, white text on a 72 % scrim (rgba(18,16,14)) against the scrim-blended 95th percentile. The photograph is inside the image, so it counts. Flat preview 144 blocks; equirect 850 blocks between plus and minus 60 degrees latitude.

| Style | White bare: worst / blocks at or above 4.5:1 | Dark bare: worst / blocks at or above 4.5:1 | White on 72 % scrim: worst |
|---|---|---|---|
| clay | 1.13 / 8 % flat, 1.00 / 17 % equirect | 1.62 / 25 %, 1.59 / 40 % | 8.19, 7.68 |
| low-poly | 1.53 / 13 %, 1.12 / 29 % | 1.05 / 15 %, 1.01 / 22 % | 9.42, 8.14 |
| toon | 1.23 / 13 %, 1.00 / 17 % | 1.00 / 22 %, 1.01 / 41 % | 8.49, 7.68 |
| duotone | 1.70 / 24 %, 1.70 / 40 % | 1.33 / 0 %, 1.33 / 0 % | 9.81, 9.81 |
| ref (textured) | 1.25 / 46 %, 1.06 / 59 % | 1.04 / 3 %, 1.00 / 3 % | 8.58, 7.86 |

Observations. No style makes bare overlay text safe: worst-case contrast is 1.0 to 1.7:1 for either text colour in every style, so any text placed over the panorama needs a scrim or a panel; a 72 % dark scrim reaches 7.7 to 9.8:1 in the worst block of every style (above the 4.5:1 level) because it flattens the background, so the style choice barely changes that requirement. The styles differ in how much area is usable bare: the dithered duotone is dark and mid-grey everywhere, so white text passes 4.5:1 in 24 to 40 % of blocks and dark text in none; clay passes dark text in 25 to 40 % of blocks and white in 8 to 17 %; toon has near-black outlines and cream walls so both colours hit 1.0:1 somewhere. High-frequency dither and outlines are a second hazard for small text that block statistics do not capture (a block of 4-level dither has a low p95 but a noisy background at letter scale). `s2-ui-legibility.webp` shows overlay text placed on each style's worst-case block. Tonal separation between UI chrome and image also depends on the IHH palette (red #ed1b24 fails 4.5:1 as text on white, B2-R5), untested here.

## 9. Reconstruction versus record, and unification with the photograph

Judgements are mine, from looking at the sheet; no audience was asked, and B2-R5 found no study of how viewers read these looks. Tone numbers are measured (`out/tonal-distance.json`: CIELAB means over the room outside the panel vs the photograph's inner area, flat previews).

| Style | Mean colour distance room vs photograph (deltaE76) | Mean chroma room / photo | Share of room pixels with chroma over 20 | Reads as |
|---|---|---|---|---|
| clay | 1.8 | 3.6 / 5.4 | 0 % | A physical model of a room. Plainly constructed; the photograph is the only real surface. The look the heritage-visualisation literature in B2-R5 describes for uncertain data |
| duotone | 8.7 | 6.4 / 5.6 | 0 % | A printed reproduction. Closest to the photograph in tone and chroma, so the constructed layer could be mistaken for a second archival print; the room is also the darkest (mean L* 43.9 vs 52.5) |
| low-poly | 18.7 | 23.9 / 6.4 | 51 % | An illustration or game environment. Clearly constructed. The warm browns echo the photograph's sepia but the flat saturated floor and the photograph's continuous tone do not meet |
| toon | 24.6 | 31.6 / 6.8 | 84 % | A drawing or comic frame; the outlines say "drawn". The photograph reads as a documentary insert inside an illustration. Most appealing to my eye of the four |
| ref (textured) | 30.9 | 31.3 / 6.4 | 81 % | A rendering that looks like a place; nearest to "photoreal" of the set and so the one B2-R5's guidance says to avoid for uncertain content |

Unification, as I judge it: duotone unifies best (shared tones, and the untouched photograph keeps its continuous tone against the room's dither, so the two layers stay distinguishable); clay is second (neutral and quiet, the photograph pops); toon and low-poly keep the two layers visibly different registers. "Reads as reconstruction" is strongest for toon, low-poly and clay, weakest for duotone. Colour cannot carry evidence tiers in clay or duotone (almost no hue); line, pattern or text cues would have to (WCAG 1.4.1, B2-R5).

The photograph stayed untouched in every style: in the 90x90 px photograph region of the flat preview, K = 1 styles (toon, low-poly, ref) are bit-identical (max difference 0); clay and duotone, which accumulate 128 and 96 half-float samples, differ from them by at most 4 and 3 levels of 255 (mean 1.1 and 0.8). The mean photograph colour in a 48x48 patch was within two levels across all five styles (RGB 102 to 103, 95 to 97, 87 to 88). The accumulation drift is a defect of accumulating the record layer in half float; it could be removed by compositing the photograph after accumulation.

## 10. Agent reproducibility and the token file

Question: how many parameters define each style, and can it be a token file?

What a style consists of in this engine: 19 role colours (floor, wainscot, plaster, ceiling, two timbers, paint, track, glass, frame, shade, bulb, board, paper, metal, wicker, prop board, background, chalk) plus 5 to 14 scalar or enumerated settings. Toon: 21 colours (19 roles, hemisphere ground, outline ink), 11 numbers, 1 enumeration (material model). Duotone: 22 colours (19 roles, hemisphere ground, dither ink, paper), 5 numbers (domeSamples, dome, hemi, ambient, contrast), 1 enumeration. Clay: 19 plus 5. Authored token counts in section 6.3; `style-tokens.json` is 16 KB with `base` (35 inert defaults).

Token test. The two chosen styles were baked three ways: from `styles-all.json`, from `style-tokens.json` (DTCG 2025.10 colour objects with `hex`), and from the same file with `hex` stripped so colours come from `components` alone. Result: 0 differing pixels in the equirect (8,388,608 px), flat and zoom previews, for both toon and duotone. Negative control: changing one token (toon floor colour, +1/255 in blue) changed 3,160,542 equirect pixels (37.7 %). So within this engine a style is exactly a token file: no hidden per-style code branch except the enumerations (`model`: standard, lambert, toon; `post.mode`). Files: `out/token-parity.json`.

Limits of that claim. The tokens reproduce a style only inside this engine. Constants that are not tokens and also shape every look: the dome sampling law (cosine-weighted, golden-angle azimuth), shadow bias and map sizes, the Poly Haven prop placement, outline ribbon shift (0.8 widths) and cap rule, `EdgesGeometry` use, the photo panel placement, the flat camera, the neutral tone-map constants. Two agents given the tokens but different engine code would not match. The 19 role colours dominate the count and are not independent (clay's are tonal steps of one hue); a generator from 3 to 5 anchor values with a lightness ramp could cut the clay and duotone counts to about 8 but was not built. DTCG features used: colour objects, number, dimension (`post.cell` in px), `$description`; enumerations use `$type` string, which is not a DTCG type; angles in degrees are plain numbers with a description because DTCG has no angle unit; no alias references are exercised in the files (the resolver supports them).

Which two are "best looking" is my visual judgement after the sheet (toon, and duotone because it is the strongest unifier), not a recommendation; clay's tokens are in `styles-all.json` (and are the cheapest in files and tokens).

## 11. Accessibility observations

`read_page` on `overlay.html` (four `<figure>`s: `<img alt>` plus a badge paragraph "Illustrative reconstruction" and a caption paragraph over each preview): the tree lists `main`, then per tile an `image` named by its alt text, the two overlay paragraphs and the figcaption as `generic` nodes with their text (paragraphs are not given a paragraph role by the tool; same tool limit S1 found). `read_page` on `sheet.html`: heading, a log node and two `image` nodes with alt text. Consequences:
- Any information drawn into the panorama image or the comparison sheet (labels, the "illustrative reconstruction" label, the photograph credit, the chalkboard text in toon and low-poly) is raster and invisible to assistive technology; it has to exist as DOM text or alt text. The chalkboard text "ILLUSTRATIVE RECONSTRUCTION" is baked into toon, low-poly and ref but not clay or duotone.
- Evidence tier cannot be carried by colour alone in clay and duotone (no hue range); WCAG 1.4.1 applies (section 9).
- Dither and outlines are motion-free, so reduced-motion and pause controls are not triggered by the style itself; the pixel-scale pattern could affect people sensitive to high-frequency patterns, untested, and a Lite image (1024x512) would have a coarser dither cell relative to content unless re-graded.
- Overlay text contrast depends on a scrim in every style (section 8).
- Not tested: real screen readers, forced-colors, 200 % and 400 % zoom, `prefers-contrast`, high-contrast modes (a baked duotone cannot respond to them; a runtime grade could).

## 12. What failed or went wrong

1. First clay render was far too dark: the dome intensity was divided by K in the light and again by K in the accumulation. Fixed (the accumulation averages).
2. The shadow cameras' frustum was set with `Object.assign(light.shadow.camera, {...})` and no `updateProjectionMatrix()`, so the default plus or minus 5 m frustum applied. S1's `room.js` does the same assignment without the call; I added the call in S2 and did not test S1 with it, so the effect on S1's shadows is unknown.
3. The first seam statistic (real vs yaw-shifted borders) gave a false alarm for geometry outlines (section 7.2); replaced by the rotation test and a paired check.
4. The item HTML page at loc.gov and WebFetch were blocked by a bot check (section 3); rights were read from the record's JSON, no bypass attempted.
5. Low-poly decimation by `SimplifyModifier` worked mechanically (no errors, about 1 s) but ruined the props: the basket became a 112-triangle plate and the easel chalkboard a slab; blind decimation is not an authoring pipeline.
6. Hull outlines on thin geometry fill it (7 cm rails read as black), and instanced balusters had to be left unoutlined; per-asset outline rules are needed.
7. Half-float accumulation of K samples drifts the record layer by up to 4 levels (section 9).
8. Timings were noisy: encode varied 3x with pane state and other spikes sharing the GPU; saved-run encodes (1.0 to 2.1 s) disagree with the loop (0.37 to 0.59 s). Sheet labels use the warm loop median for "bake to pixels".
9. The dither style is 1,035 KiB in WebP q70, above every other style, and its lossy encode is larger than lossless.
10. The per-face Sobel control did not show a clear seam; it shows line-weight dependence, and it is an emulation (section 7.3).
11. The overlay check page's attempt to read real rendered contrast behind a DOM caption returned a blank-canvas value (21:1) because of how I sampled the image; discarded, and not used anywhere in this report. Contrast numbers come from the block analysis only.
12. Not done: a real Photo Sphere Viewer run of the baked images, a Lite 1024x512 pass for the dither, any mobile test, and per-prop evidence tiers.

## 13. Open questions

1. Does a baked dither survive a real viewer (PSV zoom, pinch, device pixel ratio 2 to 3)? A runtime grade would stay crisp but needs shader access to the viewer; the CSS filters cannot dither.
2. Would viewers read the duotone room as a record? The sheet label says "could be mistaken"; nothing was tested. The label "Illustrative reconstruction" would need to be in DOM text, not in the image.
3. Are 4096x2048 pixels enough for outlines to look right at zoom 40 degrees, or should outlined styles be baked at 6144x3072 (more MiB, 2.25x)?
4. Can the 19 role colours be derived from 3 to 5 anchors by a rule an agent can follow without drift? Not built or measured.
5. Does geometry-based outlining scale to 15 to 20 authored rooms, given per-asset rules (thin parts, instanced parts, props)? Only one room.
6. Should the record layer be composited outside the accumulation (removing the 4-level drift) and outside tone mapping and the grade at the engine level, as here by alpha mask?
7. What contrast approach for UI over a panorama is acceptable to IHH's brand (red #ed1b24 as text fails on white)? Scrim vs panel vs margin layouts untested.
8. Whether the wall-text signage approach (baked into the panorama in toon and low-poly) conflicts with accessibility rules; it must be duplicated as DOM text.
9. The "best two" choice depends on an unmeasured criterion (what IHH and teachers find appealing); the clay look costs the fewest bytes and tokens.

## 14. Implications for the decision (no recommendation)

- Size: equirects at WebP q70 were 121 KiB (clay), 164 (low-poly), 289 (toon), 235 (textured baseline) and 1,035 (dithered duotone). Flat looks cost 0.5 to 1.2x the textured baseline; the dither is 4.4x and is the only style that threatens the roughly 3 MB per-scene budget on its own, unless stored lossless (756 KiB, indexed colours).
- Time: bake to pixels was 0.2 to 0.25 s for single-sample styles and about 2 s for 96 to 128 shadowed samples on an M1; cost scales with sample count, not with style. Authoring effort and asset size still dominate, as in S1.
- Seams: geometry-built outlines (hull and camera-facing ribbons) showed no measurable cube-border artefact and a constant angular width (2.5 to 3.2 px core), by a rotation test with matched content; a per-face screen-space outline emulation showed a small border effect and a 3.9x larger rotation sensitivity (line weight depends on position in the face). Pixel-scale effects baked into the equirect (dither, thin lines) soften and change character when zoomed in a sphere viewer.
- Photograph: a record layer can be kept ungraded and un-tone-mapped by writing a mask into the cube alpha; in K = 1 styles it was bit-identical across styles, in sampled styles it drifted by up to 4/255.
- Reproducibility: a style is exactly a token file within one engine (0 differing pixels from the token file, one-step change detected), 24 to 33 effective authored tokens per style, dominated by 19 role colours; engine-side constants are part of the style but not in the tokens.
- Legibility: bare overlay text is unsafe over every style (worst blocks 1.0 to 1.7:1); a 72 % scrim gives 7.7 to 9.8:1 in every style. The styles differ in how much area suits white or dark text, not in whether a scrim is needed.
- Tonal fit with a black-and-white archival photograph: clay and duotone are within deltaE76 2 to 9 of the photograph's mean colour; low-poly, toon and the textured baseline are 19 to 31. The nearer the tone, the weaker the visual separation between constructed and record layers.
- Accessibility: everything the image says has to be duplicated as DOM or alt text; colour cannot carry evidence tiers in the two near-monochrome styles; high-contrast and forced-colour modes cannot alter a baked grade.
- This spike says nothing about whether visitors, teachers or IHH staff prefer any look, how any look reads on a phone, real Photo Sphere Viewer behaviour, screen-reader output, or whether parallel agents would hold a style across 15 to 20 rooms.
