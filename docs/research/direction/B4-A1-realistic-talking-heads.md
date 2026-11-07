# B4-A1: Realistic talking heads from one image + audio (Route A)

Run date: 2026-10-09. Researcher: Route A subagent. Question: can we use "realistic AI generated" or "living painted portrait" inductees under free/open-source-only, M1 8 GB, static-site, WCAG 2.2 AA constraints?

Evidence tags: [V] read on the official page/API/raw file on 2026-10-09 (GitHub raw LICENSE/README, GitHub API, Hugging Face API, Colab FAQ). [S] secondary or search summary, not opened at the primary. [D] derived by me from cited numbers. [U] not verified. Effort: about 14 WebSearch/WebFetch calls plus about 100 GitHub/Hugging Face API and raw-file reads (no Context7 or Google Developer Knowledge query; library docs not the subject). Nothing installed, nothing downloaded, nothing committed.

## 1. Bottom line

1. **Photoreal talking heads of the five inductees pass none of our constraints together.** The models with clean licences (LongCat-Video-Avatar 1.5, InfiniteTalk, StableAvatar, EchoMimicV3, Hallo family) are diffusion-transformer or SD-based and need 12-24+ GB VRAM on NVIDIA (section 3). This M1 has 8 GB unified memory and 7.7 GB free disk (STATE.md). Free Colab's own FAQ lists "creating deepfakes" as disallowed [V]. Hosted tiers watermark or ban real-person likeness (section 5).
2. **The one route that passes licence, hardware and ethics is the "living painted portrait"**: our deterministic painted still (B3-S5), given subtle motion (blink, breath, slight head turn) by LivePortrait driven by a template clip, no speech-synced mouth. LivePortrait runs on Apple Silicon via MPS [V]. Open risk: it may not animate painted faces well, so a one-image test comes first (section 7).
3. **If audio-synced lips are wanted anyway**, the only options that run on free or consumer hardware are SadTalker (2023, soft output) and JoyVASA (audio to LivePortrait motion). Both are unmeasured on our painted portraits. B3-S3 already warned that mouth motion not matching the voice looks worse than a still [per B3-S3 line 135].
4. **The legal layer is open and not mine to close.** Even a licensed model makes a "digital replica" of named people (Albright d. 2022; California AB 1836 per B2-R4; Einstein likeness licensed via Hebrew University/GreenLight). A flat painted still with quote-only speech is the lowest-risk end of that range; photoreal sits at the high end. Counsel question stands from B2-R4 section 303.

## 2. Ranked shortlist (usable under our constraints)

| Rank | Option | Why it passes | What it does not do | Gate before use |
|---|---|---|---|---|
| 1 | **LivePortrait on painted stills, idle-motion template** | Code MIT; weights MIT on Hugging Face (tag license:mit, last modified 2025-03-03) [V]; MPS path documented [V]; reported about 1 s/frame on M1 Pro 32 GB [S]; GitHub pushed 2026-06-01 [V] | No audio sync (video-driven). InsightFace detection models are non-commercial: replace with the MediaPipe route (kijai ComfyUI node lists "MediaPipe as an alternative to Insightface" [V]) or confirm use is non-commercial. Paper says a realistic-only model "generalizes poorly to styled portraits, e.g., anime" and mixed in about 60,000 styled images to fix it [V arXiv v2]; no paper claim for oil paintings was found by me | 1-image spike on our Einstein painted portrait; check landmark detector licence |
| 2 | **JoyVASA** (audio to LivePortrait motion) | MIT code (GitHub API) and MIT weights (HF tag) [V]; tested on an RTX 4060 Laptop 8 GB on Windows [V] | CUDA-tested only; inherits LivePortrait's InsightFace buffalo_l (README tree lists it) [V]; no stylized evidence found [U]; GitHub pushed 2026-04-16 [V] | Run on Kaggle/own GPU; spike on one painted image |
| 3 | **SadTalker** | Apache-2.0 code ("The license has been updated to Apache 2.0, and we've removed the non-commercial restriction" [V]); HF weights tag MIT [V]; macOS install doc exists [V]; the name is "Stylized Audio-Driven Talking Face Animation" [V] | Last push 2024-06-26 [V]; LICENSE text opens "except for the third-party components listed below" but I did not see that list [U]; output is 256/512 px and soft; no M1 timing found; Colab FAQ bars deepfakes | Read the third-party list; spike |
| 4 (conditional on a GPU we do not have) | **LongCat-Video-Avatar 1.5** | Code MIT; weights MIT [V]; released 2026-05-21; INT8 and 8-step distilled modes; "generalizes to stylized domains (anime, animals...)" [V] | Built on a 13.6B base [V]; no VRAM or speed number on the pages I read [U]; will not fit M1 8 GB; free Colab/Kaggle fit not shown | Revisit only if someone provides a 24 GB+ GPU |

"Genuinely usable and free" with proven quality on painted faces: **none yet**. Rank 1 is usable for motion today; ranks 2-3 need a spike; rank 4 needs hardware.

## 3. Per-tool table

CODE licence and WEIGHTS licence from GitHub LICENSE/API and Hugging Face card tags, read 2026-10-09 [V] unless marked. NC = non-commercial.

| Tool (latest push) | Code licence | Weights licence and third-party | VRAM / hardware | Compute | Paintings? | Verdict |
|---|---|---|---|---|---|---|
| LivePortrait (2026-06-01) | MIT: "MIT License ... Kuaishou". Then: "The models of InsightFace are for non-commercial research purposes only." and "you should remove and replace InsightFace's detection models" for commercial use | HF: mit. InsightFace models NC | NVIDIA CUDA; Apple Silicon via `PYTORCH_ENABLE_MPS_FALLBACK=1`; README says macOS "maybe 20x slower than RTX 4090"; animals mode unsupported on macOS | 12.8 ms/frame on 4090 (paper) = about 0.3 s per video second at 25 fps [D]; M1 Pro about 1 s/frame [S] = about 25 s per video second [D]; the README's 20x would be about 6 s per video second [D]. The two disagree; unmeasured on M1 8 GB | Mixed training incl. about 60k styled images; oil painting claimed in a search summary [S]; untested by us | Rank 1 |
| SadTalker (2024-06-26) | Apache-2.0 (non-commercial restriction removed) | HF vinthony: mit tag. Third-party list not seen [U] | CUDA; CPU possible; macOS doc | No timing found [U] | "Stylized" in title; no painting test found | Rank 3 |
| Hallo (2024-09-14) | MIT | HF: MIT tag. Needs StableDiffusion v1.5 (HF tag creativeml-openrail-m), sd-vae-ft-mse (mit), InsightFace | Tested on A100; VRAM not stated | Not stated | Not stated | No: A100-class, OpenRAIL-M and InsightFace chain |
| Hallo2 (2025-02-27) | MIT | As Hallo; hi-res step is a modified CodeFormer: "comply with the S-Lab License 1.0" | A100 tested | Not stated | Not stated | No |
| Hallo3 (2025-03-13) | MIT | Fine-tune of CogVideo-5B I2V: "must comply with the license terms of CogVideo-5B". CogVideoX License: commercial use needs registration, free up to 1 million visits/month | H100 tested; English audio only | Not stated | Not stated | No |
| EchoMimic v1 (2026-04-07) | Apache-2.0 | HF BadToBest/EchoMimic: no licence tag [U]. Needs sd-vae-ft-mse | A100 80G / 4090D 24G / V100 16G tested | Not stated | Not stated | No: weights licence unstated |
| EchoMimic v2 (2026-02-23) | Apache-2.0 | HF tag absent [U] | Same tested GPUs | About 7 min per 120 frames; accelerated version about 50 s per 120 frames [V] (about 84 vs about 10 s per video second at 24 fps, my arithmetic [D]) | Not stated | No |
| EchoMimic v3 (2026-03-18) | Apache-2.0 | Apache-2.0 (HF card, README). Base Wan2.1-Fun-V1.1-1.3B | Flash 12 GB min; full 24 GB+; max 768x768 | 8 steps (Flash) | Not stated | Conditional on a 12 GB GPU; none free |
| MuseTalk 1.5 (pushed 2025-09-26; HF card 2026-09-22) | MIT: "no limitation for both academic and commercial usage" | "The trained model are available for any purpose, even commercially." Deps must comply: whisper, ft-mse-vae, dwpose, S3FD. Test data NC | CUDA; 256x256 face region; "30fps+ on an NVIDIA Tesla V100"; README example about 5 min for an 8 s clip on a 4 GB RTX 3050 Ti in fp16 (about 37 s per video second [D]) | Real-time on V100 | Needs a driving video, not a still; mouth-region only; trained on real faces [U] | Possible second stage after LivePortrait; test only |
| LatentSync 1.6 (2025-06-20) | Apache-2.0 | HF: openrail++ (use-based restrictions, commercial allowed) [V tag; terms not read]. Uses InsightFace for landmarks (via fetch summary) | 8 GB (v1.5) or 18 GB (v1.6) inference | 20-50 steps; no fps given | Video-to-video lip-sync, 512x512; needs real face video | No for stills |
| Sonic (README) | CC BY-NC-SA 4.0 (LICENSE file); README: "our license is **non-commercial**" | HF card has no tag | Not read | Not read | Not read | Fails free-tools/licence |
| FLOAT (2025-11-10) | CC BY-NC-ND 4.0: "You may not use this work for commercial purposes and may use it only for research purposes" | Same | Not read | Not read | Not read | Fails |
| AniPortrait (2024-07-02) | Apache-2.0 | HF ZJYang: apache-2.0 tag | Not stated | Not stated | Not stated | Stale (2024); needs spike |
| V-Express (2025-01-24) | "released for both academic and commercial usage" | "both manual-downloading and auto-downloading models ... are for non-commercial research purposes. Our released checkpoints are also for research purposes only." Uses InsightFace buffalo_l | Not read | Not read | Not read | Fails |
| MEMO (2025-08-06) | Apache-2.0 | HF: apache-2.0 tag. Deps not traced [U] | Tested H100 and 4090 | About 1 s/frame H100, about 2 s/frame 4090 at 30 fps (README) = about 60 s per video second on 4090 [D] | Not stated | Too slow for us |
| PersonaLive (2026-08-28) | Apache-2.0 (API) | HF huaichang: apache-2.0 tag. **But README disclaimer: "This project is released for academic research only."** Conflict unresolved | Offline streaming on 12 GB VRAM; TensorRT built for H100; real-time design. Video-driven, not audio-driven | Real-time on server GPU | Not stated | Ambiguous licence: treat as NC. Successor EditaLive named in README (not examined) |
| Ditto (2025-11-12) | Apache-2.0 (README) | HF digital-avatar: no licence tag [U]; ships `insightface_det.onnx` | A100 + TensorRT 8.6 tested | Real-time design | Not stated | Weights licence unstated; NVIDIA/TensorRT only |
| FantasyTalking (2026-01-26) | Apache-2.0 | HF acvlab: apache-2.0 tag. Wan-based | A100 table: 40 GB (15.5 s/it), 20 GB (32.8 s/it), 5 GB (42.6 s/it), 512x512, 81 frames | Per-iteration only; step count not read | Not stated | 5 GB mode exists but 42.6 s/it makes it impractical |
| InfiniteTalk (2026-05-22) | Apache-2.0 | HF: apache-2.0 tag. Wan2.1 I2V 14B base (Apache) | "Run with very low VRAM" flag; third-party Wan2GP lists NVIDIA/AMD only, no Apple | Not stated [U] | Not stated | Needs NVIDIA GPU; no number to rely on |
| StableAvatar (2026-09-25) | MIT | HF: mit tag | "approximately 18GB VRAM", 3 min for a 5 s clip at 480x832, 4090 | About 36 s per video second [D] | Not stated | Too heavy |
| OmniAvatar (2025-08-06) | Apache-2.0 | HF OmniAvatar-14B: apache-2.0 | 14B class; not read | Not read | Not read | Too heavy |
| Wan2.2-S2V-14B | Apache-2.0 | HF: apache-2.0 | 14B | Not read | Not read | Too heavy |
| HunyuanVideo-Avatar | GitHub: NOASSERTION; HF: no tag | Custom Tencent licence, terms not read [U] | Not read | Not read | Not read | Unverified; skip |
| LongCat-Video-Avatar 1.5 | MIT ("The model weights are released under the MIT License") | HF: mit tag; Whisper-large-v3 audio encoder | INT8 and distilled flags; 13.6B base; no VRAM numbers read | 8-step distillation | "anime, animals" stated; not paintings | Rank 4 |
| OmniHuman (ByteDance) | n/a | No official open repo found at `ByteDance/OmniHuman-1` (GitHub API 404) [V]; treat as closed [U] | n/a | n/a | n/a | Not available |
| LTX-2 (Lightricks) | NOASSERTION | HF: "other", `ltx-2-community-license-agreement` | General audio-video model, not examined for talking heads | n/a | n/a | Not examined |

Not examined individually: Hallo3 VRAM figure, FantasyTalking2, AUHead (arXiv 2602.09534, found in search only), LiveTalking.

## 4. Free GPU options

| Service | Facts | Fit |
|---|---|---|
| Google Colab free | [V] FAQ: "dynamic usage limits that sometimes fluctuate"; notebooks "at most 12 hours, depending on availability"; idle runtimes time out; GPU types "vary over time" (T4 not named on the page I read). Disallowed list includes "creating deepfakes", and free users who use a web UI on the runtime "commonly experience runtime terminations". No last-updated date on the page | A talking head of a named real person is arguably within "deepfakes"; I am not reading the term for the project. Avoid for real-person faces; fine for non-face work |
| Kaggle Notebooks | [S] about 30 GPU-hours/week, one P100 16 GB or two T4; sessions up to 12 h (search summaries; official docs page was not readable by my fetcher). Terms page not readable either: output-use and deepfake clauses **not verified** [U] | Better candidate than Colab; verify terms by hand before use |
| Hugging Face Spaces / ZeroGPU | Not examined | n/a |
| Local M1 8 GB | LivePortrait only (MPS). CUDA-only tools cannot run. Disk free 7.7 GB limits weights | Rank 1 only |

## 5. Hosted tiers (all fail the free-tools rule)

| Service | Free tier [S, search summaries 2026] | Why it fails |
|---|---|---|
| HeyGen | 1 credit/month, 3 videos/month, 3 min, 720p, diagonal watermark grid over the face; custom avatars need a recorded consent video | Watermark, credits, consent flow aimed at self-likeness |
| D-ID | Trial: 14 days, shared 3-minute allowance, full-screen watermark, "limited to personal use" | Watermark, personal use only; their own deceased-likeness work obtained family consent |
| Hedra | 300 credits/month, slower, watermarked, "no commercial use" | Credits, watermark, no commercial use |
| Runway | 125 credits once, watermark; usage policy prohibits real-person input or output without permission | One-off credits; real-person ban applies to Einstein/Albright/Lamarr/Muir/Naismith |

None of the four terms pages was opened at the primary by me; verify before citing in the submission.

## 6. Watermark and provenance

- Open-source tools above embed **no** watermark or C2PA manifest that I found; the READMEs I read give disclaimers only (for example MuseTalk: users "are expected to comply with local laws"; LivePortrait: "We do not assume any legal responsibility"). Provenance would be ours to add.
- C2PA is a signed statement of who made what, not a truth verdict (C2PA/secondary summary [S]). SynthID: nothing found for these models [U].
- Practical route: sign finished clips with the open C2PA tooling and add visible "illustrated / AI-assisted motion" labels, consistent with the EU Code of Practice (2026-06-10) and ICOM 2026 noted in B2-R4. I have not examined the C2PA tools themselves.

## 7. What I would do (one decision for the user, then one spike)

Decision for the user: "living painted portrait" (rank 1) is the recommendation. Photoreal is not recommended: the only licence-clean models need hardware we do not have, and the free hosted routes fail.

Spike (about 1 hour, M1, no purchase): LivePortrait with MPS, one painted Einstein still from the B3-S5 filter, a 5-10 s idle template clip, with and without InsightFace. Record: seconds per frame, memory peak, whether the painted face keeps its brushwork or warps, whether the eyes and mouth stay in style. Pass criteria: no visible warping at 100% zoom on a phone-width view; 10 s clip under 10 min on this M1; total weights under 1 GB on disk. If the spike fails, fall back to the B3-S3 plan: still portrait + quote card, guide speaks.

## 8. Open items

1. SadTalker third-party component list not read. 2. Kaggle terms and quota not read from an official page. 3. M1 8 GB LivePortrait speed unmeasured (M1 Pro 32 GB figure is secondary). 4. EchoMimic v1/v2, Ditto, Hallo (HF) weights licences are untagged; not safe to assume. 5. PersonaLive's Apache tag conflicts with its "academic research only" disclaimer. 6. LivePortrait's painting performance is a search-summary claim only. 7. Legal questions in B2-R4 (AB 1836 definition, EU Article 50 for a stylized still) remain for counsel.

## Sources (read 2026-10-09)

GitHub: KwaiVGI/LivePortrait (LICENSE, readme.md), OpenTalker/SadTalker (LICENSE, README), TMElyralab/MuseTalk (README), deepbrainai-research/float (README), jixiaozhong/Sonic (README, LICENSE), tencent-ailab/V-Express (README), fudan-generative-vision/hallo, hallo2, hallo3, antgroup/echomimic, echomimic_v2, echomimic_v3, ditto-talkinghead, memoavatar/memo, GVCLab/PersonaLive, jdh-algo/JoyVASA, MeiGen-AI/InfiniteTalk, Fantasy-AMAP/fantasy-talking, Francis-Rings/StableAvatar, meituan-longcat/LongCat-Video, THUDM/CogVideo MODEL_LICENSE, bytedance/LatentSync (repos API for licence and push dates). Hugging Face model APIs for the weights tags above. https://research.google.com/colaboratory/faq.html. https://arxiv.org/html/2407.03168v2. https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.5. https://github.com/deepbeepmeep/Wan2GP. Secondary: search summaries for HeyGen, D-ID, Hedra, Runway, Kaggle, LivePortrait M1 timing, C2PA.
