# B3-S5: Painterly (oil-paint, impressionist) style spike

Run 2026-10-08 on an Apple M1 MacBook Air (8 GB RAM), in-app Chromium (ANGLE Metal, WebGL 2.0, MAX_TEXTURE_SIZE 16384), desktop only. Spike, not production code; it measures and does not recommend (section 11 lists implications only). Everything shown is labelled "illustrative reconstruction (spike)".

Evidence tags: [P] my own measurement on 2026-10-08 (method stated), [V] read on the holder's page or API, [J] my judgement (no users asked), [S] search summary or secondary source, [U] not tested.

The user's reference (an impressionist oil portrait of Einstein, (C) Bob Smerecki) was not searched for, downloaded or used. The look here is built from a written description of that style only: visible thick strokes, muted blue-violet ground, warm skin.

## 1. What was built

Folder: `Challenge IHH/spikes/s5-painterly/`. Nothing installed (no npm, no pip, no models). Raw WebGL2, no rendering library; three.js 0.186.1 from jsDelivr is loaded only to re-run S2's own room bake (`/s2-style/bake.js`, imported unchanged). Static server `python3 -m http.server 8706` from `spikes/` and a localhost helper on 8796; both stopped at the end. No commits.

| File | Role | Bytes |
|---|---|---|
| `painterly.js` | The filter: 10 fragment shaders and a `Painter` class (`paint`, `view`) | 24,771 |
| `painterly-tokens.json` | Every parameter: Kuwahara, flow prior, light, 3 presets, palette, background, mask, per-source settings, targets | 7,288 |
| `mask.js` | No-ML background mask (region growing, island absorption, chamfer feather), alpha mask, chamfer helper | 7,686 |
| `run.js`, `index.html` | Portrait driver (sources, presets, bench, background-invariance test) | 8,369 / 796 |
| `room.js`, `room.html` | Room driver: re-bakes S2 `ref`, derives the record mask, paints flat and equirect, seam tests | 7,965 / 979 |
| `recv.py` | Harness only: serves the downloaded photos from the session scratchpad (so they stay out of the repo) and receives saved files (allowlisted names) | 3,147 |

Export: the brief suggested `canvas.toBlob` -> base64 through the JavaScript tool. A 4096 x 2048 WebP is about 1.2 MB as base64, so I used S2's pattern instead: `toBlob` -> `fetch` POST to the localhost helper -> file. Same bytes, nothing passes through the tool channel.

### Pipeline (one paragraph)
All passes are full-screen fragment shaders on RGBA16F textures (EXT_color_buffer_float). (1) optional pre-blur (halftone, soft scans); (2) prep: auto-levels (0.5 and 99.5 percent luminance mapped to 0 and 1), palette grade, optional background regrade or painted field under a mask; (3) colour structure tensor (Sobel per channel), Gaussian-smoothed; (4) flow field: minor eigenvector and anisotropy, plus a weak "prior" tensor so flat areas get strokes at a slowly varying angle; (5) anisotropic Kuwahara (Kyprianidis et al. 2009) with the polynomial sector weights of Kyprianidis, Semmo, Kang and Doellner 2010, 8 sectors, 1 or 2 passes; (6) noise: fine value noise (bristles) and cellular (Worley) values (dabs, temperature), as a function of image position or, for equirects, of 3D view direction; (7) line-integral convolution of the noise along the flow (stroke length L); (8) composite: broken colour (value and temperature jitter per dab), impasto height (bristles + dabs + canvas weave) lit by one light from the upper left, small specular. The output is a function of local weighted averages of input pixels plus a content-independent texture; there is no generative step.

### Presets (from the token file; lengths in px at 1024 px portrait height)
| | Kuwahara radius x passes | Tensor sigma | Stroke length | Dab cell | Impasto light | Value / temperature jitter |
|---|---|---|---|---|---|---|
| subtle | 3.5 x 1 | 1.6 | 8 | 6 | 0.22 | 0.04 / 0.03 |
| medium | 6 x 1 | 2.2 | 13 | 9 | 0.32 | 0.08 / 0.06 |
| strong | 9 x 2 | 3.0 | 19 | 13 | 0.42 | 0.11 / 0.08 |

Token count: 16 keys per preset (48 for three), 16 palette values (a 7-stop ramp counts as one), 12 background, 8 mask, 6 Kuwahara, 4 flow, 2 light, 4 room-palette overrides, 7 target values, and per-source entries (file, crop, mono, pre-blur, background mode, mask overrides).

## 2. Sources (verified rights lines; files only in the session scratchpad, each under 2 MB)

| Person | Holder and item | Rights line as published | Author, date | File used |
|---|---|---|---|---|
| Albert Einstein | Library of Congress, https://www.loc.gov/item/2004671908/ (LC-USZ62-60242; BIOG FILE) [V, JSON API `?fo=json`] | "No known restrictions on publication. No renewal in Copyright office (checked 8/31/76)." | Orren Jack Turner, photographer; c1947; note "Copyright by Orren Jack Turner, Princeton, N.J." | `tile.loc.gov/.../3b46036v.jpg`, 827 x 1024, 342 KB; crop removes the white border and the signature strip |
| John Muir | Library of Congress, https://www.loc.gov/item/2002719850/ (LC-USZC4-1576) [V] | "No known restrictions on publication." | Photoprint by J. Edward Greene, Pasadena; c1909; copyright deposit H128083 | Master TIFF (1083 x 1536, 5.0 MB) downloaded, resampled to 722 x 1024 JPEG (193 KB), TIFF deleted |
| Madeleine Albright | U.S. Department of State Flickr, https://www.flickr.com/photos/statephotos/2379540743/ (account "U.S. Department of State", 9364837@N06) [V, page fetched] | Licence shown on the photo page: "United States government work" (links to usa.gov/government-copyright). Commons copy `File:Secretary_of_State_Madeleine_Albright.jpg` carries PD-USGov-State and a FlickreviewR pass (2017-08-16) | U.S. Department of State; caption "Secretary of State, January 23, 1997 to January 19, 2001"; photo date not stated | Commons original 2363 x 2963 resampled to 817 x 1024 (117 KB) |
| James Naismith | Internet Archive `spaldingsofficia05fish` (contributing library: Library of Congress; IA field "The Library of Congress is unaware of any copyright restrictions for this item.") via IA Book Images Flickr 14762830762 ("No known copyright restrictions") and Commons `File:JNAISMITH.jpg` (`{{PD-1923}}`) [V] | Published US book from before 1931, so public domain in the US by date of publication | Spalding's Official Collegiate Basket Ball Guide, ed. Harry A. Fisher, American Sports Publishing. Plate caption "1, Dr. James Naismith, University of Kansas" (members of the Rules Committee), p. 31. Commons and IA say 1905; the text on the same page discusses the 1909-10 season and calls it "the sixth issue", so the scanned issue is probably c1910 | Commons crop of photo 1 (678 x 928, 261 KB); identity confirmed against the full plate image (photo 1 of 4) |
| Hedy Lamarr | Skipped | Commons `File:Hedy_Lamarr_in_The_Heavenly_Body_1944.jpg`: `{{PD-US-no notice}}`, source a collector site (doctormacro.com); the description says front and back scans are "included in the file history", but the file history has one version only (uploader VladiMens, 2015-11-09), so the no-notice claim cannot be checked. `File:Hedy_Lamarr_2.jpg` (PD-USGov-Military-Army, Yank 1943-11-12) is 157 x 216 px and a studio pin-up reproduced in Yank, so the "Army work" basis is doubtful. LoC photo search: the only Lamarr items are New York World-Telegram press photos marked "Publication may be restricted" | - | none |

Rejected for Naismith: LoC 96502335 is a photograph of a 1941 painting (rights "No information on creator or on reproduction rights found"); LoC 2004672123 says "Rights status not evaluated". Alternate Muir not used: LoC 2004672064 (Edward Hughes, c1902, "No known restrictions on publication.", 799 x 1024), oval mount with handwriting.

Copyright and publicity are separate (B2-R4): a PD photograph does not settle Einstein's name and likeness claims (Hebrew University / GreenLight) or the wishes of Albright's family.

## 3. Images saved

In `Challenge IHH/docs/research/direction/spikes/` (all WebP):

| File | Content | Size |
|---|---|---|
| `s5-painterly-sheet.webp` | Comparison sheet, 2400 x 3008: row 1 source photos with credits; row 2 five medium portraits incl. the guide; row 3 presets on one face plus 1:1 details; row 4 painterly room vs S2 clay and toon; row 5 the untouched 1903 Roosevelt-Muir photograph inside the painted room | 734 KiB |
| `s5-painterly-equirect.webp` | Painterly 360 room, 4096 x 2048, medium, WebP q75, record composited back | 867 KiB |
| `s5-painterly-seams.webp` | Seam and pole figure: sphere-aware filter vs flat-image control (u seam strip, seam-facing view, zenith, nadir) | 324 KiB |
| `s5-painterly-room-flat.webp` | Painterly flat preview (1280 x 720, medium) | 235 KiB |
| `s5-portrait-einstein-medium.webp`, `s5-portrait-albright-medium.webp` | Standalone portraits, 800 px tall | 123 KiB, 66 KiB |

Intermediates (all presets, PNG and WebP, masks, views, JSON results) are in the session scratchpad `.../scratchpad/s5/out/`, not in the repo.

## 4. Measurements

### 4.1 Time [P]
Method: `performance.now()` around each pass. `gl.finish()` does not block in Chrome/ANGLE (first timings showed 0.1 ms per pass and 194 ms in readback), so each stage ends with a 1 x 1 `readPixels` from the texture just written, which forces completion. Warm = median of 5 (portraits) or 3 (equirect) runs after one first run in the same page. Shader compile: 860 ms on the first load, 37 ms when cached.

| Target | subtle | medium | strong |
|---|---|---|---|
| Portrait 829 x 1024 (Einstein), first / warm median (range) | 49 / 37 ms (37-38) | 62 / 64 ms (63-66) | 186 / 184 ms (177-187) |
| Other portraits, single run (712-910 px wide x 1024) | 56-69 ms | 70-82 ms | 168-219 ms |
| Room flat 1280 x 720 (warm median) | 32 ms | 55 ms | 170 ms |
| Equirect 4096 x 2048, first / warm median (range) | 464 / 335 ms (332-339) | 611 / 610 ms (580-618) | 1,841 / 1,817 ms (1,805-1,834) |

Equirect medium by stage: upload 10, prep 20, flow 48, Kuwahara 368, strokes 82, composite 22, readback 30 ms. Kuwahara is 44 (subtle), 63 (medium) and 87 (strong) percent of the total; the strong preset's second pass and larger radius make it 3x medium. Equirect passes are drawn in 128-row strips to keep each GPU submission short.

Not GPU: the background mask (JavaScript, CPU) took 148 to 677 ms for the Einstein portrait across runs; WebP encode took 88 to 129 ms per portrait (q85) and 1.5 to 2.5 s per equirect (q75). Re-baking the S2 room twice (with and without the photograph) plus the JS ray-cast record mask took 2.2 to 9.6 s.

### 4.2 Sizes [P]
| Output | subtle | medium | strong |
|---|---|---|---|
| Portraits, 1024 px tall, WebP q85 | 94-216 KiB | 140-230 KiB | 158-260 KiB |
| Equirect 4096 x 2048, WebP q75 | 548 KiB | 867 KiB | 1,021 KiB |
| Room flat 1280 x 720, WebP q85 | 175 KiB | 235 KiB | 260 KiB |

The textured S2 `ref` equirect was 235 KiB at q70 and toon 289 KiB (B3-S2). Brush texture is high-frequency detail, so the painterly equirect is 3.7x the textured baseline at a slightly higher quality setting; strong only just stays at about 1 MB. Standalone 800 px portraits: 66 and 123 KiB.

### 4.3 Determinism and the token file [P]
- Same page, same tokens, Einstein medium twice: 0 differing bytes.
- One token changed (flow prior angle +1 degree): 275,831 of 848,896 pixels changed (32 percent, mostly the flat background where the prior decides the stroke direction).
- Noise uses an integer hash (pcg3d), so its values do not depend on GPU trig precision; the rest of the pipeline is float maths. Determinism across GPUs, browsers or ANGLE back ends was not tested [U].

## 5. Faithfulness to the photograph

### 5.1 Does the person stay recognisable? [J]
| Person | subtle | medium | strong | Notes |
|---|---|---|---|---|
| Einstein | yes | yes | yes, features begin to smear | Furrows, eye bags, moustache shape and hair silhouette all come from the photo; strong merges the right eye with the brow shadow |
| Muir (Greene c1909) | yes | yes | mostly | Profile and beard carry it; the print is soft-focus and low-contrast, so the painting is dark and the face small |
| Albright | yes | yes | yes | Colour source; facial structure survives well; her signature on the print stays as a white scrawl, and the flag stays |
| Naismith | yes | yes | yes | Halftone dots are removed by pre-blur plus Kuwahara; moustache, collar, tie and jaw read clearly |

Objective proxy (not a recognition test): Pearson correlation of luminance between the filter input and output, both box-resampled [P]:

| | at 1024 px | at 256 px | at 64 px |
|---|---|---|---|
| Einstein subtle / medium / strong | 0.92 / 0.88 / 0.85 | 0.93 / 0.92 / 0.89 | 0.93 / 0.92 / 0.92 |
| Muir | 0.97 / 0.94 / 0.91 | 0.99 / 0.97 / 0.95 | 0.99 / 0.99 / 0.98 |
| Albright | 0.99 / 0.98 / 0.95 | 1.00 / 0.99 / 0.97 | 1.00 / 1.00 / 0.99 |
| Naismith | 0.97 / 0.95 / 0.93 | 0.99 / 0.99 / 0.97 | 1.00 / 1.00 / 0.99 |

Einstein is lowest because his background was replaced (section 5.3), not because the face changed.

### 5.2 Is any detail invented? [P/J]
- Structure: no. Every output colour is a weighted mean of input pixels within the Kuwahara ellipse (at most about 2 x radius away), then multiplied by a texture that does not depend on the image. The filter can remove detail (Albright's signature blurs, Einstein's tweed weave becomes dabs, strong merges small features) and can move an edge by up to a few pixels, but it cannot draw an eye, a wrinkle or a hand that is not in the photograph.
- Stroke texture: yes, by design. Bristle streaks, dab boundaries and canvas weave are invented surface, not content; at medium they are visible at 1:1 and read as paint.
- Colour: yes, for the three black-and-white sources. The ramp assigns colour by brightness (darks indigo, mid-tones mauve to warm, lights cream), so "warm skin" is a stylistic grade: Einstein's grey jacket becomes mauve-brown for the same reason his face becomes warm. This is invented information in the colour channel and needs saying on the page. Albright's colours come from the State Department photo, pulled 32 percent toward the same ramp.
- The background field (Einstein, guide) is invented by design; see 5.3 for whether it touches the person.

### 5.3 Background replacement (no ML) [P]
Region growing from the top, left and right borders over low-gradient, slowly varying luminance, then a chamfer feather that lies only on the background side (mask 0 on every person pixel).
- Einstein: works with blur 1, gradient threshold 0.02, step tolerance 0.01 (36.6 percent background). The first setting (blur 2 twice, threshold 0.035) leaked into the face and coat (95 percent "background").
- Muir (Greene) and Naismith: fail. The soft-focus print and the halftone plate have coat and backdrop at the same tone, and the region leaks into the face (Muir) or the suit (Naismith) at every threshold tried. Both keep their own background, which the ramp already turns dark violet.
- Albright: not attempted (the blue backdrop already fits; the flag is part of the photograph and stays).
- Guide: exact mask from SVG alpha.
- Does it alter the person? Einstein painted with and without the background stage, person pixels compared by distance from the mask edge:

| Distance inside the person | medium: changed / mean diff / max | strong: changed / mean / max |
|---|---|---|
| 0-2 px | 98 % / 4.4 / 57 | 100 % / 11.2 / 91 |
| 2-5 px | 64 % / 1.6 / 56 | 97 % / 6.9 / 63 |
| 5-10 px | 15 % / 0.2 / 38 | 59 % / 1.8 / 72 |
| 10-20 px | 1 % / 0.01 / 6 | 11 % / 0.17 / 31 |
| 20-40 px | 0 | 0.07 % / 0.001 / 1 |
| over 40 px | 0 (422,572 px identical) | 0 |

So the face is bit-identical; only the silhouette edge (hair tips, coat edge) takes some background colour within the kernel radius, as a painter's edge would.

## 6. The painted guide next to the painted inductees [J]
The fictional guide (S3 SVG, level L2) gets the same filter, palette and background field. It does not match. The photographs carry modelled light, so the filter turns them into painted form; the SVG has flat fills and black outlines, so the result reads as a cartoon with a paint texture on a painted ground. Two tries: (a) pseudo-volume from the silhouette (darker toward the edge, lit from the upper left): barely visible; (b) outline recolour to #4b3f4c and stroke width x 0.5 (kept in the tokens): softer, still a drawing. Outcome: the filter alone cannot put a vector character into the same register as painted photographs. The guide would need painted source art with light and shade (hand-painted, or a 3D bust rendered and then filtered), or a different role on the page (voice and captions without a face, or a small icon), or the inductees would move toward the guide's register instead. Measured colour fit is fine (mean CIELAB of all five medium portraits L* 20-37, a* 5-8, b* -7 to -10; guide L* 34, a* 7.8, b* -10.1); the mismatch is drawing language, not palette.

## 7. Painterly 360 room

### 7.1 Method
S2's `ref` (textured) room re-baked through S2's own unchanged `bake.js` (K = 1, deterministic; PSNR 37.97 dB against S2's saved q70 `s2-ref-equirect.webp`, the difference being mostly that file's compression). The same filter runs in `equirect` mode: every neighbour lookup (Sobel, tensor blur, Kuwahara samples, LIC steps, height gradient) goes through the sphere: the offset is taken in the tangent plane at the pixel's view direction, renormalised, and turned back into (u, v); the texture repeats in u; noise is a function of the 3D direction. Room palette override: 50 percent pull toward the portrait ramp, saturation 0.7, stronger violet shadows. Lengths x 0.9.

### 7.2 Seam and poles [P]
- Roll test: painting the equirect rolled by half a turn (noise yawed by pi) and rolling it back differs from the direct painting by mean 0.006 levels, max 14, with 0.002 percent of pixels over 2 levels. The output does not depend on where the u = 0/1 seam is, which is the property that makes it invisible.
- Local wrap metric (mean luma step across the seam / mean step of the 16 column pairs either side, all rows): source 0.77, sphere-aware 1.00, control 0.90. The control seam is not a luma step but broken strokes: in `s5-painterly-seams.webp` (panels A and B) the control's backboard and wall strokes stop at a vertical line; the sphere-aware version runs through.
- Poles: the control (same filter treating the equirect as a flat image) produces a radial starburst at zenith and nadir, because a fixed pixel kernel covers a vanishing angle near the poles. The sphere-aware version has a normal stroke field there, with one residue: a slight swirl around the pole, because the stroke-direction prior is defined in the local east/south frame, which rotates around the pole (panels C and D).
- Viewer consistency: a 1280 x 720 perspective view (yaw 6, pitch 3, 96 degrees) sampled from the painted equirect matches the directly painted flat preview in composition and colour; strokes look about 1.2x larger in the view because the viewer magnifies (13.3 screen px per degree vs 11.4 equirect px per degree x 0.9).

### 7.3 Looks [J]
The room reads as a painting of a room. Two weaknesses: large flat CG walls get a uniform, wallpaper-like stroke texture (the flow prior decides everything there), and thin repeated parts (balusters, rails) smear into bands. The room stays warmer than the portraits: room mean CIELAB (33.0, 7.7, 3.4), chroma 13.3, hue about 24 degrees; portraits hue -42 to -52 degrees, chroma 14-20 [P]. Pulling the room further toward the ramp is one token (`roomPalette.colourMapMix`), not tried beyond 0.5.

## 8. Record stays untouched [P/J]
- The photograph in the room is the LoC Glacier Point stereograph frame (https://www.loc.gov/item/93503130/, LC-DIG-ppmsca-36413, Underwood & Underwood c1906, taken 1903; rights "No known restrictions on publication.", verified in B3-S2).
- Mask: the S2 photo plane is found in the scene and each pixel's view ray is tested against its rectangle (pixel centre), dilated 1 px, intersected with "changed by the photo panel" (41,993 px flat, 33,394 px equirect). A simpler diff against a bake without the photograph was too large (92,554 px), because S2 builds the whole easel only when a photograph is given.
- Result: in the lossless outputs the record pixels are identical to S2's render (max difference 0). After WebP encoding they change: flat q85 mean 3.2, max 25 levels (53 percent of record pixels over 2 levels); equirect q75 mean 4.9, max 41 (70 percent). The pipeline keeps the record untouched; a single lossy panorama file does not. The pixels are also S2's projection of the photograph through its cube camera, not the photograph's own pixels.
- Reading: the sharp, grey, continuous-tone photograph inside a painted, stroked room is the clearest record/reconstruction split of all the looks so far; the frame edge is the boundary. Tone: room vs record CIELAB distance 21.3 (S2 ref 31.4); record chroma 5.7 vs room 13.3. Risk the other way round: a painted portrait of a real person can be mistaken for a period oil painting (a different kind of artefact from a photograph), so the portraits need their own label ("painted by a filter from a photograph by ..."), not only the room.

## 9. UI text over painterly backgrounds [P]
Method as B3-S2 (160 x 40 px blocks; white text vs the block's 95th-percentile luminance, dark text #1a1a17 vs the 5th percentile, white on a 72 percent rgba(18,16,14) scrim):

| Image | White bare: worst / share of blocks at 4.5:1 or more | Dark bare: worst / share | White on scrim: worst |
|---|---|---|---|
| Room flat subtle / medium / strong | 1.43 / 48 %, 1.46 / 46 %, 1.38 / 46 % | 1.00 / 0 % in all three | 9.12, 9.21, 9.00 |
| S2 ref (input) | 1.25 / 46 % | 1.04 / 3 % | 8.57 |
| S2 clay, S2 toon | 1.11 / 8 %, 1.24 / 13 % | 1.62 / 25 %, 1.00 / 22 % | 8.10, 8.55 |
| Portraits, medium (whole image) | 1.00-1.01 / 48-67 % | 1.00-1.01 / 0-4 % | 7.68-7.73 |

Bare text is unsafe everywhere (worst blocks 1.0-1.5:1); a 72 percent scrim gives 7.7-9.2:1 in every image. The painterly versions are darker than clay or toon, so white text passes bare on about half the blocks and dark text on almost none. The block statistic misses the second problem: stroke texture is high-frequency, so small text over it is harder to read than over a flat colour of the same contrast. A solid panel or scrim is needed in any case.

## 10. Alternative: local AI image generation (desk research, no installs)
| Question | Finding |
|---|---|
| Licences | SD 1.5: CreativeML OpenRAIL-M; Attachment A bars use "to generate or disseminate verifiably false information and/or content with the purpose of harming others" and "to defame, disparage or otherwise harass others"; no disclosure duty [V, license page]. SDXL 1.0: CreativeML Open RAIL++-M, use-based restrictions [S]. SD 3.5: Stability Community License, free unless commercial use with over USD 1M annual revenue [S]. FLUX.1 [schnell] Apache-2.0; FLUX.1 [dev] weights non-commercial [S] |
| Size | SDXL base about 6.9 GB [S]; SD 1.5 pruned checkpoint up to 7.7 GB (fp16 builds about 2 GB) [S]. This machine has 7.7 GB free disk |
| Apple silicon (this M1, 8 GB RAM) | Draw Things' own guidance lists SDXL at 1024 x 1024 as "too slow" on M1 8 GB; SD 1.5 and Lightning-class models run [S] |
| Invented detail | img2img or "style transfer" with a diffusion model re-generates the image from the model's prior at any useful denoising strength: eyes, wrinkles, hair, hands and clothing are redrawn, and identity can drift. Restoration writers warn that AI "enhancement" adds detail on eyes, nose and mouth and colour to monochrome faces that were never in the source [S] (deep-image.ai, stack-archive.com, CAP wiki "upscaled images" template). Seeds make a run repeatable on the same software, but no output pixel is traceable to input pixels |
| Ethics (from B2-R4) | AP: does not alter photos; AI illustration only when labelled. Partnership on AI: consent where a real person's likeness is used. ICCV 2025 position paper: AI may fulfil intent but never invent it |

Trade-off in one line: diffusion img2img gives a far more convincing oil painting (real brush logic, hands and fabric handled as a painter would) at the cost of a 2-7 GB model, slow or infeasible runs on this M1, a licence with use restrictions to track, and invented facial detail on real people that cannot be audited; the filter is about 25 KB of shader code, runs in 0.04-1.8 s, is deterministic on one machine, and invents only texture and (for black-and-white sources) colour, at the cost of a look that is recognisably "filter", weak on flat CG surfaces, and unable to lift flat vector art.

## 11. Implications (no recommendation)
1. If the museum uses this filter for portraits, each inductee costs one verified PD photograph, a crop and a few tokens; a 1024 px portrait paints in 0.04-0.2 s and ships at 140-230 KiB (medium, q85), or about 70-125 KiB at 800 px.
2. If black-and-white sources are painted in colour, the colour is assigned by brightness, not known; the page has to say so, or the ramp has to stay near-monochrome (one token block). Albright is the only colour source.
3. If backgrounds are replaced, the luminance mask worked for 1 of 3 photographs (studio portrait with a smooth backdrop); soft-focus prints and halftone plates need an authored mask (for example a polygon in the token file) or must keep their own background. The person's interior is untouched either way; only a 5-20 px rim mixes.
4. If 360 scenes are painted, the sphere-aware path removes the seam (roll test identical within float noise) and the pole starburst, at 0.34-1.8 s per 4096 x 2048 scene and 0.55-1.0 MB at q75. Painterly panoramas are about 3.7x the size of the textured bake.
5. If records sit inside painted scenes, the pipeline keeps them bit-identical, but a single lossy panorama file does not (mean 3-5 levels, max 25-41). Keeping a record untouched in delivery means shipping it as its own image layer (hotspot or overlay), not baked into the equirect.
6. If the fictional guide appears beside painted inductees, the current SVG does not match; it needs painted source art, a different role on the page, or a different style for everyone.
7. Any text over a painterly image needs a scrim or panel (worst bare contrast 1.0-1.5:1; scrim 7.7-9.2:1).
8. Painted portraits of real people can be mistaken for period paintings; the record/reconstruction label applies to portraits as much as to rooms.
9. Lamarr has no verified PD portrait at the holder level; this spike could not paint her without a weaker rights basis.

## 12. What failed or went wrong
1. `gl.finish()` does not block in Chrome/ANGLE; per-pass timings read 0.1 ms until a 1 x 1 `readPixels` sync replaced it.
2. That sync rebound the default framebuffer inside the tiled draw loop, so only the first 128-row strip of the equirect was drawn (a black 39 KiB file). Fixed by rebinding after each sync.
3. `img.decode()` never settles while the tab is hidden (the in-app tab was in the background); two runs hung until 45 s timeouts. Fixed by waiting for `load`.
4. Background mask: first parameters leaked into 95 percent of the Einstein image; Muir and Naismith could not be fixed (section 5.3).
5. First stroke texture was "fur" (fine-noise LIC with a strong bump) and flat areas swirled (random flow where the tensor is near zero). Fixed with cellular dabs, a weaker bristle bump and a flow prior tensor. The prior then causes a slight swirl at the poles (section 7.2).
6. Guide: neither pseudo-volume nor outline softening brought it into the portraits' register (section 6).
7. S2 builds the easel only with a photograph, so a with/without diff overstated the record region 2.2x; replaced by a ray-cast mask.
8. Muir crop needed two passes (scan border 20-28 px).
9. The base64 export path in the brief was not used (section 1).
10. Not done: mobile or low-end GPU timing, cross-GPU determinism, a recognition test with students, a real Photo Sphere Viewer run of the painted equirect, high-contrast or forced-colours modes, a near-monochrome ramp variant, an authored-mask variant.

## 13. Open questions
1. Do students and IHH staff read the painterly portraits as respectful and as reconstructions, or as period paintings? Would they prefer the warm-colour grade or a monochrome-faithful one for black-and-white sources?
2. Is "colour assigned by brightness" acceptable on a site whose identity is provenance, if labelled? Or must black-and-white people stay black-and-white?
3. Who approves painted likenesses (Hebrew University / GreenLight for Einstein; Albright's family)? Copyright is clear; publicity and family wishes are not settled by a PD photograph (B2-R4).
4. Does the bake-once model hold (paint at build time, ship WebP), or is a runtime filter wanted (it would need WebGL2 and EXT_color_buffer_float on every device; untested on phones)?
5. What should the fictional guide look like next to painted portraits?
6. Is 4096 x 2048 enough for brush texture when a viewer zooms in (strokes soften and enlarge), and is about 0.9-1.0 MB per painted scene acceptable against the per-scene budget?
7. Are the results stable across GPUs (Intel, AMD, mobile) for agent reproducibility, or only within one machine?
8. Is there any verifiable PD portrait of Hedy Lamarr at a holder (LoC, NARA, a studio archive release)?

## 14. Query and tool tally
- Context7: 3 calls (1 `resolve-library-id` for MDN; 2 `query-docs` on `/mdn/content`: EXT_color_buffer_float and RGBA16F render targets; NPOT wrap and `toBlob` WebP quality).
- Web search: 5 (SDXL licence and size; FLUX and SD 3.5 licences; SDXL on M1 8 GB; AI restoration hallucination; SD 1.5 licence). WebFetch: 1 (CompVis license page, Attachment A).
- Holder checks: 11 LoC JSON item/search calls (2 of them to the retired `/pictures/` endpoint, which returned nothing), 3 Commons API calls, 2 Flickr pages, 1 Internet Archive metadata call, image downloads as listed in section 2 (one 5 MB TIFF, deleted after resampling).
- Browser: my own tab `tab-16` only.
- `docs/handoff` was not updated by this subagent; the orchestrator owns STATE.md. Nothing committed.
