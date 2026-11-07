# B4-A4: Avatar prototypes on Einstein (P1 living portrait, P2 mouth warp, P3 realistic head)

Run 2026-10-09 on the M1 8 GB machine. Builds on B4-A1 (realistic talking heads), B4-A2 (ethics and law) and B4-A3 (living portrait techniques). Nothing committed.

Evidence tags: [V] read on the official page or API on 2026-10-09; [M] measured by me in this run; [J] my judgement; [U] not tested.

Query count: 2 WebSearch, 2 WebFetch (1 returned HTTP 403), 16 official API reads (PyPI JSON x7, Hugging Face API x5, GitHub API x4). Context7 0 and Google Developer Knowledge 0: no library API detail was in doubt; the one integration bug was found by reading installed source.

## 1. Answer

| | P1 living painted portrait | P2 painted mouth warp | P3 realistic talking head |
|---|---|---|---|
| Verdict | **Ship this style for all five** | Reject | Not run; do not pursue |
| What you see | Painted still, slow depth parallax, breathing, warm light sweep, slight warm lift while the voice plays, captions | Same still, lower lip and chin pulled down by a phoneme + loudness timeline | Placeholder page with the requirements table and links |
| Uncanny risk [J] | Low: nothing on the face claims to speak | High: the "open mouth" is a hard dark slit with no brushwork; it reads as a cut in the canvas, not speech | Highest (B4-A2: inside the digital-replica definition) |
| Payload (files on disk) [M] | 268,535 B | 241,980 B | 2,437 B |
| CPU while running [M] | Renderer 6.0% vs 0.2% with motion paused; GPU process 30.4% vs 22.1% (noisy baseline) | Not separately sampled; same draw cost class (one quad, one texture) | n/a |
| Main-thread cost per frame [M] | 0.11 to 0.21 ms (JS + draw submit; GPU time not measured) | 0.09 to 0.29 ms | n/a |

Frames: `docs/research/direction/spikes/s7-p1-frame1..4.webp`, `s7-p2-frame1..4.webp`, `s7-p2-mouth-closeups.webp`, `s7-p3-frame1..2.webp`. Side-by-side: `spikes/s7-avatar-sheet.webp` (84 KB). All frames are 22 to 49 KB.

Run it: `cd "spikes/s7-avatar" && python3 -m http.server 8707`, then open `http://127.0.0.1:8707/` (index links P1 to P3). Audio needs a click on "Play voice" (no autoplay).

## 2. The quote and its check

- Text used (first sentence of the letter): "Some recent work by E. Fermi and L. Szilard, which has been communicated to me in manuscript, leads me to expect that the element uranium may be turned into a new and important source of energy in the immediate future."
- Source: Albert Einstein to President Franklin D. Roosevelt, 2 August 1939. Wording checked 2026-10-09 against the German Historical Institute Washington transcription, German History in Documents and Images: https://germanhistorydocs.org/en/nazi-germany-1933-1945/letter-from-albert-einstein-to-us-president-roosevelt-on-the-prospect-of-an-atomic-bomb-august-2-1939 [V]. That page cites the FDR Library as holder [V]. The NARA DocsTeach page (https://www.docsteach.org/documents/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt) returned HTTP 403 to my fetch, so the NARA copy is not yet read.
- Caveat for curators: the letter was drafted with Leo Szilard and signed by Einstein (stated in the search summary and widely documented; the P1 transcript says so). For the final cast, prefer a quote with no co-drafting question, and add it to `data/inductees/einstein/facts.jsonl` through the pipeline. This one is good enough for a prototype.

## 3. Voice (Kokoro-82M)

| Item | Value |
|---|---|
| Model and licence | hexgrad/Kokoro-82M weights Apache-2.0 (HF card, modified 2025-04-10) [V]; runtime kokoro-onnx 0.6.1, MIT (GitHub API, pushed 2026-09-01) [V] |
| Weights file | `kokoro-v1.0.int8.onnx` 92,361,271 B (sha256 6e742170...6406cb) + `voices-v1.0.bin` 28,214,398 B (sha256 bca610b8...f7d), from the kokoro-onnx `model-files-v1.0` GitHub release [V sizes via API, M hashes] |
| Voice | `bm_george` (British male), speed 0.95, `en-gb` |
| Output | 16.05 s, mono 24 kHz, MP3 48 kbps = 96,861 B; WebVTT with 4 phrase cues |
| Speed [M] | 10.8 s to synthesise 16.05 s of audio on M1 CPU (int8), about 0.67x real time; peak RSS 655 MB |
| Pronunciation | espeak gave "Shilard" for Szilard; I replaced that one phoneme with "s" (phoneme-level edit; the caption text is unchanged) |
| Phonemiser licence | phonemizer 3.4.0 and espeak-ng are GPL-3.0 [V PyPI classifier, GitHub API]. Build-time only, not shipped to the site; I read the generated audio as not a derivative work of the phonemiser [J], but flag it for the licence register |

Two integration bugs, both fixed without touching the gate of anything:
1. `phonemizer-fork` did not pass the data path; switched to `phonemizer==3.4.0`.
2. espeak-ng ignores a data path longer than its internal buffer and falls back to a compiled-in CI path (the CI runner's work folder, `.../work/...phontab`), then exits the process. Our scratchpad venv path is about 190 characters. Fix: point espeak at a short symlink and stop phonemizer from resolving it (`build/tts.py` line 3). Teachable: long sandbox paths break C libraries with fixed path buffers.

Timing: the kokoro-onnx export outputs audio only (`outputs: audio`) [M], so there are no phoneme durations. Caption cues come from synthesising each phrase separately and measuring its length (exact). Within a phrase, P2 spreads phonemes evenly (approximate).

## 4. P1 living painted portrait

- Depth: Depth Anything V2 Small, `onnx-community/depth-anything-v2-small` `onnx/model_fp16.onnx` 49,642,442 B, sha256 matches the HF LFS id 2df6223f...b04 [V+M]; licence apache-2.0 on the card (modified 2026-04-14) [V]. Inference 0.91 s at 518x644 on M1 CPU, peak RSS 477 MB [M]. onnxruntime 1.24.3 crashes on this fp16 graph during fusion; disabling graph optimisation fixes it (`build/depth.py`). Output: 324x400 8-bit PNG, 25,962 B, blurred 1.2 px.
- Render: one WebGL2 quad, no library. 4-step relief lookup (near pixels shift more), breath (4.2 s cycle) moves only the shoulders, a warm band crosses every 14 s, a slight warm lift follows audio loudness (50 fps RMS envelope in `tts.json`). Pointer adds a small tilt.
- Accessibility: label above the portrait names the voice as AI and the source; captions drawn over the portrait from the WebVTT track; full transcript in a disclosure; "Pause motion" control (WCAG 2.2.2) and "Play voice" control, both 44 px; `prefers-reduced-motion: reduce` swaps the canvas for the plain painted image while captions still work. The reduced-motion path is implemented but **not** emulated in the browser pane [U].
- Seen defects: the hair-to-background edge shimmers slightly under parallax; a light streak appears at the far left edge where the clamp stretches pixels (visible in `s7-p1-frame*.webp`, left of the shoulder). Fix in production: lower the offset near the frame edge or pad the painting.
- Not built from B4-A3's list: blink and eye glint (would need hand-painted eyelid layers per inductee; a day of work each for five portraits [J]).

## 5. P2 painted mouth warp: honest judgement

- Mechanism: below the measured mouth line (370, 401 px on the 648x800 painting), pixels are pulled down by up to 0.014 of the height times an openness value; a dark gap is painted between the lips. Openness = viseme value for the current phoneme x loudness, fast attack, slow release. "Exaggerate x2" doubles it.
- Result (see `s7-p2-mouth-closeups.webp`): the moustache hides the upper lip, so all that shows is a thin, flat, dark line that flickers. It has none of the painting's brushwork, so it reads as a cut or a glitch rather than speech. At x2 the chin slides as a block. Sync is approximate (even phoneme spacing), so it also drifts against the voice.
- Uncanny risk: high [J]. It also makes a real person's face appear to say words, which is what B4-A2 and the B3-S3 note warned against. Making it convincing would need per-portrait painted mouth shapes (a sprite set of 6 to 8 visemes per inductee) plus real phoneme timings, and it would still be the riskiest option ethically. Recommendation: do not use for inductees. If a speaking face is wanted, give it to the guide (an invented character, not a real person).

## 6. P3 realistic talking head: why it was not run, and what it would take

Gate from the brief: run only if a model's code and weights licences allow our use and a 10 s clip runs on this M1 8 GB within about 30 minutes. It fails before the timing test:

| Requirement | Finding |
|---|---|
| Licence | LivePortrait: HF weights tag mit (repo now `KlingTeam/LivePortrait`, modified 2025-03-03) [V]; GitHub repo moved to `KlingAIResearch/LivePortrait` and the API now reports licence "Other / NOASSERTION" because the LICENSE adds the InsightFace non-commercial clause [V]. JoyVASA (audio to LivePortrait motion): MIT, pushed 2026-04-16 [V]. So licence passes only with InsightFace swapped for MediaPipe |
| Audio-driven? | LivePortrait alone is video-driven, so it cannot lip-sync. JoyVASA adds audio, tested on CUDA only (B4-A1) |
| Disk | Human LivePortrait weights about 655 MB (motion_extractor 112.5 MB, spade_generator 221.8 MB, warping_module 182.2 MB, landmark.onnx 114.7 MB, InsightFace 21.9 MB) [V HF tree; whole repo 2,140 MB with animal models]. PyTorch 2.14.1 macOS arm64 wheel 127 MB download [V PyPI], several hundred MB installed [J]. JoyVASA weights size not read [U]. **Free disk at run time: 372 MB at start, 217 MB at the lowest point [M].** The brief assumed about 7 GB |
| Hardware | MPS path exists for LivePortrait; README says macOS is about 20x slower than an RTX 4090 (B4-A1) [V there]; JoyVASA on MPS untested |
| Free GPU | Colab FAQ disallows "creating deepfakes" (B4-A1 [V]); Kaggle terms not read [U] |
| Style | With our painted portrait as the source, LivePortrait output stays painted. Photoreal output needs a photo source, which lands inside the AB 1836 / EU Art. 50 deep-fake definitions (B4-A2) |

What it would take, if the owner still wants a look: free at least 3 GB, install PyTorch + LivePortrait + JoyVASA in a venv, replace InsightFace with MediaPipe, run one 10 s clip from the painted Einstein on MPS. Estimated 2 to 3 hours of setup plus unmeasured render time [J]. My recommendation is not to spend that time: P1 already meets the brief, and B4-A2 rates photoreal as the highest-risk style.

Demo frames are not reproduced; the P3 page links to the LivePortrait, JoyVASA and SadTalker repositories only.

## 7. Measurements (all [M], 2026-10-09)

| Measure | P1 | P2 | P3 |
|---|---|---|---|
| Files on disk | html 5,722 + css 2,807 + js 4,453 + portrait.webp 125,770 + depth.png 25,962 + mp3 96,861 + tts.json 6,602 + vtt 358 = 268,535 B | same minus depth, html 5,129 = 241,980 B | 2,437 B + css |
| Transfer reported by the page | 259,260 B (first load) | 104,090 B (portrait cached from P1) | n/a |
| Load event (localhost) | 20 ms | 34 ms | n/a |
| Frame rate in the browser pane | 41 fps average (pane hidden; rAF throttled, not a phone figure) | 44 fps | n/a |
| Phone measurement | not done [U] | not done | n/a |

`tts.json` carries the envelope and phonemes; in production split the 50 fps envelope out (P1 needs only it) or derive it in the browser with an AnalyserNode.

## 8. Clean-up and footprint

- Peak install footprint: venv 41 MB (reused system numpy, Pillow, onnxruntime) + Kokoro 120 MB + depth model 50 MB, never all at once above about 211 MB. Venv, model files, WAV and the short symlinks were deleted; the scratchpad folder is now 824 KB.
- Kept in the project: `spikes/s7-avatar/` (pages, `portrait.webp`, `depth.png`, `einstein.mp3`, `einstein.vtt`, `tts.json`, `build/tts.py`, `build/depth.py`), 308 KB.
- The `python3 -m http.server 8707` process was left running for viewing.

## 9. Open items

1. Disk is at 100% (about 366 MB free). Any further model work, including P3, needs space freed first.
2. Read the NARA copy of the 1939 letter (DocsTeach blocked) or pick an Einstein quote with no co-drafting question; run it through the fact pipeline.
3. Test P1 on a real mid-range phone (fps, battery, heat) and test the reduced-motion path with the OS setting.
4. Add the GPL phonemiser and espeak-ng to the licence register as build-time tools.
5. Voice choice: bm_george is a British reading voice for a German-born speaker. Decide whether the synthetic voice should be neutral by design (it should not imitate Einstein's accent) [J].
