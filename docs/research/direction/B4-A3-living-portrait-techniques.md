# B4-A3: Living painted portrait techniques (Route C)

Run 2026-10-09. Scope: free or open techniques that make a deterministic painted portrait (B3-S5 filter, verified public-domain photos) feel alive on a static Vercel site, on phones, WCAG 2.2 AA. Desk research only: I built and ran nothing, downloaded no model weights, and measured no frame times. Query count: 22 web searches, 8 page fetches, 4 Hugging Face API calls, 0 Context7 / GDK (not needed; no library API detail was relied on).

Evidence tags: [V] read on the primary page or API on 2026-10-09; [S] search summary or secondary source; [J] my judgement or estimate (unmeasured, treat as a hypothesis to test); [U] not tested.

## 0. Answer in five lines

1. Ship Tier 1 and 2: depth parallax from a build-time depth map, plus breathing, light sweep, eye-glint, an occasional blink, and audio-reactive brush shimmer. No mouth movement.
2. Depth is computed offline, once per portrait, with an Apache-2.0 model (Depth Anything V2 Small, or DA3-Small / DA3-Base). The phone downloads an 8-bit depth image (est. 30-90 KB [J]), never a model.
3. Painted-portrait mouth warp is the one technique to refuse: highest uncanny risk, and it makes a real person's painted face appear to speak, which cuts against the locked rule that inductees speak only their own verbatim words and against the digital-replica ethics line in B2-R4.
4. Everything motion must stop under `prefers-reduced-motion` (static painted portrait with a still depth-lit frame) and expose a visible Pause control for anything that auto-plays more than 5 s (WCAG 2.2.2).
5. Realistic AI video faces (the user's first option) are a separate route, not covered here; section 9 says only why Route C is the safest "at most real" ceiling.

## 1. Technique 1: 2.5D depth parallax from a single image

### What it is
One painted portrait plus a depth image. A fragment shader shifts each pixel by (depth x view offset), where the offset comes from pointer, scroll, a slow idle drift, or device tilt. The 2020 Facebook "3D Photos" research (Shih, Su, Kopf, Huang; CVPR 2020) is the reference for the look; its code is MIT [S: search summary of repo]. It adds a learned inpainting step that invents pixels behind foreground edges. We should not use that step: invented pixels in a documentary museum are a provenance problem, and our background is already a painted field from the B3-S5 mask, so edge disocclusion can be handled by a small clamp instead.

### Depth models (licences checked on the official pages)
| Model | Licence | Params | Release / card date | Use? |
|---|---|---|---|---|
| Depth Anything V2 Small | Apache-2.0 [V: github.com/DepthAnything/Depth-Anything-V2; HF API `depth-anything/Depth-Anything-V2-Small-hf` cardData apache-2.0, modified 2024-07-05] | 24.8M | 2024 | Yes |
| Depth Anything V2 Base / Large / Giant | CC-BY-NC-4.0 [V same page] | 97.5M / 335.3M / 1.3B | 2024 | No (non-commercial) |
| Depth Anything 3 Small | Apache-2.0 [V: github.com/ByteDance-Seed/Depth-Anything-3; HF API `depth-anything/DA3-SMALL` apache-2.0, modified 2025-11-13] | 0.08B | 2025-11-14 | Yes (newer; same slot) |
| Depth Anything 3 Base | Apache-2.0 [V: GitHub list; HF API `depth-anything/DA3-BASE` apache-2.0] | 0.12B | 2025-11-14 | Yes, if Small is too coarse |
| DA3 Large / Giant / Nested | CC BY NC 4.0 [V GitHub] | 0.35B+ | 2025-11-14 | No |

Caveat [J]: the pages license the weights; they say nothing about licence status of depth maps the model outputs, and the V2 page gives no training-data statement. For a non-commercial challenge entry this is low risk, but record it in the provenance log rather than assume.

### Where it runs
Build time (my script, once per portrait). Browser-side depth is rejected: the V2-Small ONNX files on `onnx-community/depth-anything-v2-small` are 99.1 MB (fp32), 49.6 MB (fp16), 19.1 MB (q4f16), 27.3 MB (int8) [V: HF API tree, 2026-10-09]. Even the smallest is a poor first-visit cost on a phone, and the output would vary by device. Build-time output is deterministic for a fixed model and input, which matches our "deterministic filter" stance [J].

### Rendering options
| Option | How | Cost | Verdict |
|---|---|---|---|
| A. Relief shader on one quad | Fragment shader samples depth, marches 8-16 steps along the view ray (parallax occlusion) | One quad, no geometry; ~5 M texel fetches per frame on a 390x520 CSS-px portrait at 1.5 DPR with 12 taps [J arithmetic] | Preferred |
| B. three.js `displacementMap` on a dense grid | Vertex displacement | Needs a fine mesh; search result states displacement works in the vertex shader and "usefulness limited in WebGL since you will need a fine mesh" [S: sbcode.net, tympanus] ; library adds bytes | Second choice |
| C. Hand-cut 3-5 layers (hair, face, shoulders, ground) with CSS/WebGL offsets | Manual masks, deterministic, no model | Low CPU; zero depth artefacts inside a layer; needs a manual pass per portrait | Good fallback, and the safest look [J] |
| D. Learned novel-view / inpainting | Facebook 3D Photo style | Invents pixels | Reject |

Ours already uses raw WebGL2 (no library) for the painter: 24,771 bytes of `painterly.js` [V: B3-S5 section 1]. A relief pass reuses that context, so incremental code is small (est. 3-6 KB [J]).

### Quality evidence
- Apple ships this as a consumer feature: iOS 26 "Spatial Scenes" separates subject from background in any photo, runs on-device, and shifts with tilt; it works on iPhone 12 and newer [S: MacRumors, AppleInsider, 9to5Mac, June 2025+]. Users already recognise the effect, which lowers explanation cost.
- Museum precedent for restrained depth on a painting: the National Geographic Museum "Founders" interactive painting (NeoPangea) uses "subtle illusion of depth, animations, and ambient sound", and 16 of 33 founders get individual motion-and-sound paintings, on a 60-inch monitor at 60 fps [S: neopangea.com portfolio page and blooloop; implementation was Adobe AIR, so this proves the design pattern, not the tech].
- Academic: Akleman et al., "Web-Based Dynamic Paintings ... 2.5D Pipeline" (arXiv 2311.15354; ISEA 2022): real-time web paintings with a shape image, two hand-painted diffuse images lerped by lighting, reflection/refraction [V abstract]. It claims "qualitatively convincing painterly global illumination" but reports no user study in the abstract I could read; the full PDF exceeded the fetch limit [U].
- Awwwards lists many depth-map parallax WebGL sites (e.g. "About Sazabi", "And we were...") [S: awwwards.com search listing]; I did not open them, so I cannot say how they behave on phones [U].

### Known failure modes [J, standard for the technique]
Stretching "rubber sheet" at hair and shoulder silhouettes when the offset is large; depth errors on glasses, hair wisps, white beards; the painted look breaks if the texture shows photographic shading changes. Mitigations: cap offset to about 1.5-2.5 percent of image height; blur and edge-clamp the depth near the mask edge; flatten the background to one depth plane (the painted field from B3-S5); test each of the five faces (Einstein hair and moustache, Lamarr 1940s hair, Muir beard, Naismith, Albright) by eye.

### Phone cost
Bytes: depth image at the display resolution used for the portrait, 8-bit, WebP: est. 30-90 KB [J; not measured]. Texture memory: a 1024x1280 RGBA painted portrait plus an 8-bit depth is about 5.3 MB of GPU memory uncompressed [J arithmetic: 1024x1280x4 + 1024x1280]. CPU: near zero (single draw call; GPU does the work). Controls that matter, from the search results: cap `devicePixelRatio` (a 60-75 percent resolution reduction on DPR 3 phones cuts fragment count 55-75 percent), use `mediump` where possible [S: macmyths, digitalstrategyforce summaries; vendor claims, unverified]. Also pause when the tab is hidden or the portrait is off-screen (IntersectionObserver), and cap at 30 fps for idle motion [J].

### Device tilt
iOS Safari needs `DeviceOrientationEvent.requestPermission()` from a user gesture over HTTPS; Android grants it silently [V: MDN page title/snippet, search result 2026-10-09]. So tilt must be an opt-in button, never the only path; pointer and slow idle drift cover everyone else.

### Effort
Depth bake script + relief shader + fallback: about 2 working days for the first portrait, 1-2 hours each for the other four [J]. Hand-cut layers add about half a day per portrait [J].

## 2. Technique 2: subtle procedural motion

Breathing (0.3-0.6 percent scale on the shoulders layer at 0.2-0.25 Hz), slow Ken Burns (2-4 percent over 20-30 s), a light sweep across the impasto height map from B3-S5 (the filter already computes a lit height field with one light from the upper left, so moving the light vector animates the paint ridges for free [V: B3-S5 pipeline paragraph]), eye-glint (a small specular blob that follows the pointer a few pixels).
- Quality evidence: this is the established "magic painting" register in museum work (NatGeo Founders above). I found no controlled study of audience response to these specific micro-motions [U].
- Phone cost: negligible in the same shader; reuses B3-S5's height field, so no extra bytes beyond a uniform [J].
- Accessibility: auto-playing, over 5 s, shown alongside other content, therefore WCAG 2.2.2 Pause, Stop, Hide (Level A) applies: offer a Pause control [V: W3C understanding pages, search 2026-10-09]. 2.3.3 Animation from Interactions is AAA, but the sufficient technique is the `prefers-reduced-motion` media query; adopt it anyway [V]. Under reduced motion: no idle drift, no Ken Burns, no tilt; keep a single static lit frame. No flashing above 3 per second (2.3.1) [J; none planned].
- Effort: half a day [J].

## 3. Technique 3: mesh-warp micro-expressions (blink, brow, breath in the mouth line)

Method: landmarks on the source photo at build time with MediaPipe Face Landmarker (Apache-2.0; 468 3D landmarks; 52 ARKit blendshapes) [V: developers.google.com page via search, 2026-10-09], make a coarse warp mesh around the eyes, drive an eyelid-close warp on a timeline: blink about 120-150 ms, interval randomised 3-8 s [J typical human range; unverified here], with a deterministic seed so the page behaves the same on each load.
- Risk: a warp closes the eye by stretching skin over the iris; at B3-S5's strongest Kuwahara radius the paint strokes hide the seam, at subtle they will not. Lamarr and Einstein photos have strong eye detail [J]. Prototype on Einstein first and keep it only if it passes a still-frame and 3-second-loop review.
- Evidence of quality: the commercial precedent is MyHeritage Deep Nostalgia (2021), which applied predetermined movements (blinks, head turns) to still photos; coverage called results both moving and "creepy", and MyHeritage itself acknowledged the creepiness [S: PetaPixel, ABC7, 2021]. That is a warning for photoreal faces; a painted surface is more forgiving [J, see section 8].
- Phone cost: a warp mesh in the same shader is negligible; no new bytes except landmarks JSON under 2 KB [J].
- Accessibility: same as section 2; blink is non-essential and goes off with reduced motion.
- Effort: 1-2 days for a good blink on one face, then 2 hours each [J].

## 4. Technique 4: mouth movement on a painted portrait (visemes)

### Pipeline options and licences
| Source of timing | Licence / status | Notes |
|---|---|---|
| Kokoro-82M phoneme durations to Oculus visemes (HeadTTS wrapper) | B2-R4 already records Kokoro Apache-2.0, HeadTTS MIT [V in B2-R4]; search result confirms HeadTTS offers timestamps and visemes in browser [S] | Timing is exact because the TTS emitted it; no forced-alignment drift |
| Rhubarb Lip Sync (offline from any audio) | MIT; 9 mouth shapes (Hanna-Barbera set A-F + G, H, X) [S: search results] | Works on archival recordings, which TTS cannot |
| MuseTalk (video generation) | Code MIT; model "available for any purpose, even commercially" [V: GitHub README]; dependencies Whisper, ft-mse-vae, DWPose, S3FD, face-parsing, LatentSync each carry their own terms [V]; 8-second clip took about 5 minutes on a 4 GB laptop GPU [V per summarising article, 2026] | Generates pixels (video), so bytes are large and it treats the face as a photo |
| SadTalker | Code Apache-2.0 "except for third-party components" ; last update 2023-06-12 per README / June 2024 per article [V, sources disagree] | Heavier third-party chain (Deep3DFaceReconstruction, Wav2Lip, face-vid2vid, GFPGAN) |
| Wav2Lip | Personal / research / non-commercial only; README prohibits commercial use [V: creativeainews, 2026] | Do not use |
| LivePortrait | Code and weights MIT, but default face detector InsightFace buffalo_l is non-commercial; MediaPipe path exists [S] | Needs the MediaPipe path to be clean |

### How good can a 2D warp look
A viseme-driven jaw-and-lip warp on a still painting can read as "speech" at a distance if timing is tight. I found no published user study of painted-portrait viseme warps [U]. What the literature does support:
- Audio-visual detectability limits: ITU-R BT.1359 says sync errors are noticeable beyond +45 ms (audio early) to -125 ms (audio late) and unacceptable beyond +90 ms / -190 ms [V: ITU summary via search]. A browser can meet this if viseme timestamps come from the same Kokoro pass as the audio; it cannot if the audio plays through a device with Bluetooth latency, which the page cannot measure [J].
- Uncanny: an AVSP-line study of onset asynchrony in virtual characters found that more asynchrony raised uncanniness and that audio leading video was worse [S: Inderscience / Aalborg abstract]. A separate empirical test of Mori's motion prediction found that better motion improved acceptability rather than deepening the dip [S: core.ac.uk]. So motion is not inherently worse; bad sync and bad shape are.
- Dalí Lives (Dalí Museum, 2019) is the best-known museum precedent for a speaking historical figure: neural deepfake on 6,000 archival frames, 1,000+ hours of training, speech built from his own words verified by curators [S: Cannes Lions entry, GS&P]. It worked because it was licensed, scripted and labelled, not because of the face tech [J, consistent with B2-R4 item 5].
- Samsung's 2019 few-shot talking heads of the Mona Lisa were described as spooky and unsettling [S: Laughing Squid, Smithsonian, WEF coverage].

### Why I recommend against it here
1. It makes a real, named person's painted likeness appear to speak. B2-R4 already flags California AB 1836 on digital replicas of deceased personalities, the EU labelling code (2026-06-10), ICOM 2026, APA, plus the Einstein likeness licence from Hebrew University / GreenLight [V in B2-R4; search 2026-10-09 confirms the licensing line via UneeQ's Digital Einstein announcement]. A talking Einstein is closest to the licensed-property use case. A talking Albright (died 2022) is the most sensitive.
2. Locked rule: inductees speak only their own verbatim, cited words. A mouth moving to a synthetic Kokoro voice implies the inductee said it in that voice. The guide's voice plus emblem is the sanctioned speaker [J].
3. Artefact risk is concentrated on the most-examined area of the face. The 2D warp stretches painted brush strokes around the lips, and the B3-S5 texture exposes that [J].
4. Cost is highest: viseme timeline per clip, per-face mouth rig, QA per sentence. 3-5 days for one portrait, roughly 1 day each after [J].

If the team reverses this later: lip movement only with (a) a genuine period recording of that inductee's own voice where one exists, (b) a visible "Painted illustration, voice recording from <archive>" label, (c) written IHH approval, (d) a stop test on three phones.

## 5. Technique 5: audio-reactive accents without lip-sync

The guide's voice (Kokoro) or a genuine archive recording plays; the portrait responds without moving the mouth.
- Brush shimmer: modulate the dab-noise phase or specular term of the B3-S5 height field by short-time RMS energy from an `AnalyserNode` (Web Audio, standard). The spike's composite already has dab cells and a specular term to modulate [V: B3-S5].
- Waveform: a thin painted-stroke waveform under the portrait or around the emblem.
- Caption highlight: word-level timestamps from Kokoro move a highlight in the caption [S: HeadTTS / Kokoro word timestamps]. This also meets captions for audio.
- Evidence: no controlled study found [U]. This is the standard music-visualiser pattern with a painterly skin; low uncanny risk because nothing pretends to be a mouth [J].
- Phone cost: an `AnalyserNode` at fftSize 256 plus one uniform per frame; negligible [J]. No extra bytes.
- Accessibility: purely decorative; the transcript is the accessible content. Reduce to no motion under `prefers-reduced-motion`; avoid flashing: smooth the envelope (attack 50 ms, release 300 ms) so luminance does not oscillate more than 3 times per second [J].
- Effort: 1 day [J].

## 6. Comparison

| Technique | Look | Phone cost (est.) | Extra bytes (est.) | Uncanny risk | Ethics / rule fit | Effort (1st / each) |
|---|---|---|---|---|---|---|
| 1 Depth parallax | Strong, familiar (Apple Spatial Scenes) | Low GPU, ~0 CPU | 30-90 KB depth + 3-6 KB code | Low | Fits | 2 d / 1-2 h |
| 2 Breath, light sweep, glint | Quiet, museum-like | Negligible | ~0 | Very low | Fits | 0.5 d |
| 3 Blink / micro-warp | Adds life; seam risk | Low | < 2 KB | Medium at subtle, low at strong paint | Fits (no speech) | 1-2 d / 2 h |
| 4 Mouth warp | Risky | Low runtime, high authoring | viseme JSON, small | High | Conflicts with locked rule | 3-5 d / 1 d |
| 5 Audio-reactive shimmer | Clear "speaking" feedback without a fake mouth | Negligible | ~0 | Very low | Fits | 1 d |

All cost and effort numbers are [J] unless a [V] tag is attached in the sections above. None was measured on a phone.

## 7. Accessibility and safety bundle (apply to 1-3 and 5)

- `prefers-reduced-motion: reduce` or "Pause motion" pressed: render a single static frame, still lit; disable tilt, idle drift, shimmer, blink [V: W3C techniques].
- Visible Pause / Play button for the portrait stage (2.2.2, Level A).
- Tilt: opt-in button; iOS needs a gesture [V MDN].
- Pause on `visibilitychange` hidden and when off-screen.
- Static alt text describes the painting and states it is a filtered reconstruction of the named photograph, with the holder and rights line (keep provenance visible).
- Failure ladder: no WebGL2 or low-memory phone, show the already-painted static WebP (the B3-S5 output); never a blank stage.
- Real-time budget on phone: target 30 fps idle, one draw call, canvas at min(DPR, 1.75) [J]; confirm on at least one mid-range Android and one iPhone before locking.

## 8. Is painted safer than "realistic AI"?
[J] A painted surface signals "illustration" up front, which lowers the realism bar and, per Mori's framing, keeps the face short of the near-human zone. Photoreal AI faces sit where audience reaction to Deep Nostalgia, Mona Lisa talking heads and Dalí Lives was described as "creepy", "spooky" or "uncanny" in coverage [S]. Those descriptions are press language, not measured affect; no study from this run quantifies painted vs photoreal for historical figures [U].

## 9. Recommendation for the spec

1. Build Tier 1 (depth parallax) and Tier 2 (breath, light sweep, glint) first; both satisfy "living painted portrait" without a mouth.
2. Add Tier 5 (audio-reactive shimmer plus caption word highlight) for the guide voice and the quotation readouts.
3. Prototype the blink (Tier 3) on Einstein only; keep it if it survives a three-person review at phone size.
4. Do not build Tier 4 unless IHH gives written approval and a period recording exists for that inductee.
5. Ask IHH: may the portraits move at all (Einstein especially, per the licence line), and is "painted reconstruction of a verified photo, with motion" within their definition of acceptable representation.

## 10. Open items (not verified)
- Frame time and battery on phones: [U] for every technique. Needs a 30-minute test page on one iPhone and one mid-range Android.
- Whether the full arXiv 2311.15354 PDF reports user studies: [U] (fetch exceeded size limit).
- Whether Apache-2.0 Depth Anything weights place any condition on generated depth maps: [U].
- Whether DA3-Small gives visibly better hair/beard depth than V2-Small at 1024 px: [U]; run both on the Einstein photo and compare.
- MuseTalk and SadTalker dependency licences in full: only listed, not read: [U]. Moot unless Tier 4 is reopened.

## 11. Sources (accessed 2026-10-09)
- Depth Anything V2 repo (licences per size): https://github.com/DepthAnything/Depth-Anything-V2
- Depth Anything 3 repo (licences per model): https://github.com/ByteDance-Seed/Depth-Anything-3
- Hugging Face API: `depth-anything/DA3-SMALL`, `depth-anything/DA3-BASE`, `depth-anything/Depth-Anything-V2-Small-hf`, `onnx-community/depth-anything-v2-small` file tree (https://huggingface.co/api/models/...)
- Akleman et al., Web-Based Dynamic Paintings: https://arxiv.org/abs/2311.15354
- NeoPangea, National Geographic Founders interactive painting: https://www.neopangea.com/portfolio/national-geographic/founders-interactive-painting.html
- Shih et al., 3D Photography using Context-aware Layered Depth Inpainting (CVPR 2020): https://arxiv.org/pdf/2004.04727
- Apple Spatial Scenes coverage: https://www.macrumors.com/how-to/ios-3d-lock-screen-effect-spatial-scenes/ and https://9to5mac.com/2025/06/10/psa-spatial-scenes-will-work-on-any-iphone-running-ios-26/
- W3C Understanding 2.3.3: https://w3c.github.io/wcag/understanding/animation-from-interactions.html
- MDN DeviceOrientationEvent.requestPermission: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static
- MediaPipe Face Landmarker (web): https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js
- MuseTalk: https://github.com/TMElyralab/MuseTalk ; SadTalker: https://github.com/OpenTalker/SadTalker
- Lip-sync licence comparison, 2026: https://www.creativeainews.com/articles/open-source-lip-sync-licenses-commercial-use-2026/
- HeadTTS (Kokoro visemes): https://github.com/met4citizen/HeadTTS (via search listing)
- ITU-R BT.1359 summaries and onset-asynchrony / uncanny study: https://vbn.aau.dk/da/publications/the-effect-of-onset-asynchrony-in-audio-visual-speech-and-the-unc
- Motion and the uncanny valley, empirical test: https://core.ac.uk/works/8353754
- Dalí Lives: https://www.thedrum.com/creative-works/project/goodby-silverstein-partners-the-dali-museum-dal-lives
- Digital Einstein / Hebrew University and GreenLight: https://www.digitalhumans.com/case-studies/digital-einstein
- Deep Nostalgia coverage: https://petapixel.com/2021/03/02/ai-deep-nostalgia-images-have-deep-limitations/
- Internal: B3-S5-painterly.md, B2-R4-avatar-voice.md
