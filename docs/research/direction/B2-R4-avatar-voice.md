# B2-R4: Avatar and voice production for six characters (batch 2, route R4)

Run date: 2026-10-08. Researcher: route R4 subagent. No recommendation is made here (section 5 lists implications only). Built on, and checked against, INTERIM-1.md, B1-R1 (section 1c), B1-R8 (section f), 02-museum-best-practices.md, 03-reference-repos-and-tech.md (Avatar rows) and 04-content-availability-A/B.md.

Evidence tags used below:
- [V] read directly on the official or primary page, or fetched live from an API on 2026-10-08.
- [S] secondary source or search-result summary; not opened at the primary.
- [P] my own probe or measurement on 2026-10-08 (commands and files named).
- [D] derived by me from cited numbers (arithmetic or inference); not a source statement.
- [U] unverified or not examined.

Constraints respected: no packages installed, no models downloaded, nothing larger than a few KB written; probe files live in the scratchpad (`<session scratchpad>/spike/`). No other project file edited, nothing committed.

---

## 0. What changed versus batch 1 (read this first)

1. B1 and doc 03 named "Kokoro TTS -> Rhubarb -> SVG character" as the avatar pipeline. New: the lip-sync step can come from the TTS engine itself. A Kokoro ONNX build that exports phoneme durations exists, and an MIT wrapper (HeadTTS) turns them into Oculus viseme timelines, with no eSpeak (GPL) in the path. Rhubarb becomes one option among two, not a given. (R4-d2)
2. Piper is narrower than doc 03 allowed. Doc 03 called it "usable for offline batch generation" with a per-voice licence check. New: Piper's own docs say it is "intended for personal use and text to speech research only", and the per-voice check fails for several leading English voices (research-only Blizzard 2013 licence, CC BY-NC-SA). (R4-c3)
3. Rive's free editor no longer exports: production .riv export moved to paid plans on 2025-10-20. (R4-a1)
4. A code-authored SVG cast was produced in one pass in a probe (six characters, 11 KB raw, 1.4 KB gzip). Consistency is easy; likeness is not achieved by that method. (R4-a3)
5. Ethics norms in 2025-2026 moved: ICOM adopted a revised Code of Ethics on 2026-06-25; the EU Commission published the final Code of Practice on AI-content labelling on 2026-06-10; APA guidelines v7 (2025-03-12) exist. Public reaction tracks "licensed, scripted and labelled" versus "free-form generated". (R4-b4)

---

## 1. Findings per sub-route

### (a) 2D character runtimes for the web, and who can author them without an illustrator

**R4-a1. Rive: open runtime, paid production export, binary authoring.**
- Runtime licence: `rive-app/rive-wasm` is MIT, latest release 2.44.0 (2026-09-30), repo pushed 2026-10-08. [V] GitHub API, retrieved 2026-10-08; also npm `@rive-app/canvas` 2.44.0 (modified 2026-09-30). Rive's blog states "No runtime fee. Your exports keep working forever." [V] "Rive's new 9 mo plan", https://rive.app/blog/rive-s-new-9-mo-plan, dated 2025-10-20.
- Editor terms: the Editor is free "for learning, exploring, and building within the Editor", but "exports now move to paid plans" (same post, 2025-10-20). The pricing doc says the free plan has "3 collaborative files" plus State Machines, Data Binding, Scripting, and "does not support production exports"; Cadet $17/seat/month or $108/seat/year (max 3 seats), Voyager $39/seat/month or $304/seat/year (max 25), Enterprise $1,440/seat/year. "Schools, universities, and non-profits should use a standard Cadet or Voyager plan." Student plan is "personal educational work only". [V] https://rive.app/docs/account-admin/pricing.md (undated, retrieved 2026-10-08). Existing exports are unaffected by the change (same blog).
- Inputs and state machines: `.riv` files expose `contents.artboards[].stateMachines[].inputs[]` with typed inputs; the web runtime sets a named state machine; `setTextRunValue` exists; Rive's own doc example updates an ARIA live region from `onStateChange`. [V] Context7 `/rive-app/rive-docs` (rive-parameters.mdx, text.mdx; docs file dates not shown). A numeric input driving a mouth-shape state is therefore a documented pattern in principle; I did not run it. [D]
- Size (measured, jsDelivr, 2026-10-08): `@rive-app/canvas@2.44.0` rive.js 503,443 B raw / 114,671 B gzip; rive.wasm 1,992,302 B raw / 820,513 B gzip (about 935 KB gzip together). `@rive-app/canvas-lite@2.44.0` rive.wasm 901,451 B raw / 367,049 B gzip; rive.js about 107 KB gzip (about 474 KB together). [P] Sample .riv files served by Rive: `vehicles.riv` 58,792 B, `off_road_car_v7.riv` 34,258 B. [P]
- Authoring without a human: the .riv format is binary and normally authored in the GUI Editor. Rive documents an official Editor MCP integration: early access, Windows/macOS desktop Editor only, requires the Early Access app open; tools cover artboards, shapes, layouts, animations, state machines, view models, Luau scripts and WGSL shaders. [V] https://rive.app/docs/editor/ai/mcp (undated). A third-party "RiveMCP" (npm `rivemcp`, listing says 139 tools, "export a .riv file") is advertised on glama.ai. [S] I did not check whether such export respects Rive's paid-export rule or terms. [U]
- Fit with "free/open-source tools only": runtime yes; production export requires about $108/year per editing seat. The shipped .riv needs no licence to play. [D]

**R4-a2. Lottie / dotLottie: open runtime and format; authoring tools are the paid part.**
- Licences: `LottieFiles/dotlottie-web` MIT, npm `@lottiefiles/dotlottie-web` 0.81.0 (modified 2026-10-06); `airbnb/lottie-web` MIT, npm 5.13.0, last push 2025-09-01. [V] GitHub API and npm, 2026-10-08. The format spec lives at `lottie/lottie-spec` under the Community Specification License (repo pushed 2026-06-23). [V]
- Size (measured): dotlottie-player.wasm 1,238,072 B raw / 497,270 B gzip; index.js 165,443 B raw / 32,993 B gzip (about 530 KB gzip together). [P]
- State machines: dotLottie supports JSON state machines with Boolean, Numeric and String inputs and fire-able events, with a `SetFrame` entry action bound to a numeric input (`$cursorFrame` example), controlled from JS via `stateMachineSetNumericInput`. A viseme index mapped to frames is therefore expressible. [V] Context7 `/lottiefiles/dotlottie-web` (wiki State-Machines page; undated). Not run. [D]
- Authoring: bodymovin/After Effects is a paid-tool route (not re-verified this run). LottieFiles' web editor "Lottie Creator": free users can export up to 5 animations then need a paid plan (individual about $19.99/month on annual billing); exports include dotLottie, Lottie JSON, SVG(SMIL), GIF, MP4. [S] search summary of help.lottiefiles.com; the official help page returned 404 when I tried to open it, so treat as unverified. A coding agent can in principle write Lottie JSON directly because the format is an open JSON spec; I did not test this and the JSON is verbose. [D]

**R4-a3. Code-authored SVG/CSS/JS rigs: no runtime, agent-authorable, DOM-native.**
- Probe (2026-10-08, `gen.py`, 12 KB of Python, one pass, no iteration): a parametric generator with shared palette tokens, one shared head/neck/ear/eye/brow/nose rig, named part kits (6 hair styles, 3 facial-hair kits, 2 glasses, 1 hat, 5 clothing kits) and nine mouth shapes keyed A-H and X (the Rhubarb alphabet). Output: six characters (guide, Einstein, Muir, Lamarr, Albright, Naismith) at 1,784-2,225 B raw each; a six-character sheet is 11,201 B raw / 1,449 B gzip. Rendered with macOS Quick Look and inspected. [P]
- What the probe showed: [P]
  - Consistency across six characters came free from the shared rig and tokens; the cast reads as one family.
  - Likeness did not come: the faces read as generic avatar-pack people differentiated by hair, beard, glasses and clothing. Some part defects in one pass (Lamarr's hairline reads like a headband; Einstein's hair is only loosely "wild"; the sheet cropped Muir at the edge because of my thumbnail aspect ratio).
  - Mouth shapes at 62% scale were hard to tell apart (B vs G in particular); mouths need larger size and stronger contrast than my first draft, or a face crop on a close-up bubble.
- Size consequence: each character is about 2 KB; per-line mouth swaps would replace only the mouth `<g>`. Compare to Rive about 474-935 KB runtime and dotLottie about 530 KB runtime. [D]
- Precedent for parts + seed composition: DiceBear (library MIT, Copyright 2026) lists 42 CC0 styles (including Open Peeps, Notionists, Lorelei), 14 CC BY 4.0 styles, 1 MIT style, and 4 "artist's own terms" styles (Avataaars, Bottts). [V] https://dicebear.com/licenses/ (retrieved 2026-10-08). These are generic avatar kits, not likeness tools; they show that a CC0 part library exists if parts are wanted. [D]
- Accessibility fit: inline SVG is DOM; captions, name label and "AI recreation" badge can be real text outside the artwork (see section (e)). [D]

**R4-a4. Sprite sheets and three.js 2D planes.** No dedicated evidence gathered. Both can be derived from the SVG rig (render frames or use a canvas texture on a plane). B1-R1 recorded that CSS2DRenderer is not zoom-safe, so an avatar inside the 3D canvas has accessibility and zoom costs that a DOM overlay does not. [D] (B1-R1 line 219 summary; not re-verified.)

**R4-a5. Live2D Cubism: not agent-authorable, not open source.**
- Needs the Cubism Editor and layered PSD art; Web SDK download is free but "only when the users are ready to publish their content" must they enter a Publication License Agreement. [V] https://www.live2d.com/en/sdk/about/ (undated). Exemption: "Individuals and small-scale businesses are exempt from the license agreement and payment" except Expandable Applications; non-profits and educational institutions "can qualify for specific non-profit content plans"; the numeric small-scale line quoted by a search summary is annual sales under 10 million yen. [V] https://www.live2d.com/en/sdk/license/ (no date on page), [S] for the 10 million figure. Avatar systems are Expandable Applications requiring a separate contract. [V]
- Free editor limits reported by the Live2D community: one texture up to 2048 px and 100 ArtMesh. [S] community.live2d.com threads (Cubism Editor/SDK 5.4 alpha post updated 2026-07-14).
- Conclusion on constraints: GUI-only authoring, proprietary SDK terms, a layered art prerequisite. [D]

**R4-a6. Spine: paid, note only.** Search summary of esotericsoftware.com purchase page: Essential $99 list ($69 discounted), Professional $439 list ($369 discounted), Enterprise required at $500,000 or more annual revenue; the licence grants use of the Spine Runtimes. [S] 2026-10-08 retrieval; not opened.

**R4-a7. Inochi2D (open 2D puppet).** `Inochi2D/inochi2d` is BSD-2-Clause, pushed 2026-10-03. [V] GitHub API. It has a GUI editor; I did not verify any production web runtime. [U]

**R4-a8. Keeping six characters consistent.** Levers shown to work in the probe: one rig and viewBox, a shared stroke width and ink colour, a shared mouth set, per-character JSON, tokenised palette. Not evidenced by any source: automated golden-image comparison and a per-character diff gate (suggested only by B1-R2's gate list and my reasoning). Other consistency routes (image generators, LoRA) were not researched and conflict with the free-tool and disk constraints. [D]

---

### (b) Portrait basis, likeness, and ethics of AI recreations

**R4-b1. Public-domain photo basis per inductee (Wikimedia Commons API, 2026-10-08; tags are community-asserted).** [P]

| Inductee | Candidate PD reference | Commons licence tag, date | Caveat |
|---|---|---|---|
| Einstein | Ferdinand Schmutzer portrait 1921 (`Einstein1921 by F Schmutzer 4.jpg`) | Public domain; photographer 1870-1928 | Clean basis |
| Einstein | Oren Jack Turner 1947 "Albert Einstein Head" | Public domain; "Copyrighted 1947, copyright not renewed. Einstein's estate may still c[laim]..." (truncated by API field) | Commons itself flags the estate; see R4-b2 |
| Muir | Watkins c.1875; Fritz 1907 (`John Muir Cane.JPG`); Underwood and Underwood 1903; Dassonville c.1910 | Public domain (all) | Strongest PD basis of the five |
| Lamarr | MGM / Clarence Bull 1940 (`Hedy lamarr - 1940.jpg`); 1941 Ziegfeld Girl stills | Public domain (MGM publicity) | Basis for PD not examined; doc 04 scored her rights risk 2/5 (estate publicity; CMG Worldwide) |
| Albright | US State Department portraits c.1997 | Public domain (US government) | Federal work; recent death (R4-b5) |
| Naismith | Springfield College c.1920; Kansas team 1899 | Public domain tag | Doc 04 says Springfield College images are "non-commercial only"; a conflict with the PD tag (see section 3) |

Copyright of a reference photo and the right of publicity are separate questions; a drawing derived from a PD photo is a derivative of PD material, but publicity or trademark claims can attach to the name and likeness regardless. [D]

**R4-b2. Rights holders and recent law.**
- Einstein: GreenLight licenses the name and likeness as agent of the Hebrew University; the university sued General Motors in 2010 over an ad. In `Hebrew University v. General Motors`, 903 F. Supp. 2d 932 (C.D. Cal., 2012) the court dismissed, holding the publicity right had expired 50 years after death (2005). [S] summaries (Leagle citation page, Globes, Olshan; secondary only, 2026-10-08). Doc 04 (A, line 236) reaches the same practical point: PD photos can be fine, but the name and likeness may still draw a claim. Digital Einstein (UneeQ, 2021-04) used likeness and rights supplied by the Hebrew University and GreenLight. [S] https://voicebot.ai/2021/04/14/digital-einstein-virtual-human-celebrates-nobel-prize-centennial/ (2021-04-14).
- California AB 1836, signed 2024-09-17, effective 2025-01-01: no producing or distributing a digital replica of a deceased personality's voice or likeness in an expressive audiovisual work or sound recording without prior consent; liability the greater of $10,000 or actual damages. [S] DGLaw/Mondaq/CDAS summaries. I did not read the statutory definition of "digital replica" or its exemptions, so whether a clearly stylized drawing and a synthetic non-clone voice fall inside it is open. [U]
- NO FAKES Act: introduced in Senate and House; 2026 status not found. [S/U]
- Doc 04 B (Lamarr, CMG Worldwide licensing call-to-action page); Muir unpublished papers owned by Muir-Hanna Trust; Naismith KU audio restriction.

**R4-b3. How far stylization must go.**
- B1-R1 already recorded Zell et al. 2015 (SIGGRAPH Asia, ACM TOG 34(6)): face shape is the main driver of perceived realism; mismatched shape and material stylisation looks eerie. [V in B1; not re-read]
- EU AI Act Article 50: deepfake duty applies to content that "would falsely appear" authentic (search-summary wording); flat illustration is on its face not that. Final Code of Practice on marking and labelling published 2026-06-10; deployers label deepfakes, "Labels can use the EU icon or equivalent formats, with audio disclaimers for audio-only content". [S] Jones Day, https://www.jonesday.com/en/insights/2026/06/european-commission-publishes-final-code-of-practice-on-marking-and-labelling-aigenerated-content (2026-06). Artistic-work exception not covered in the summary. [U]
- APA guidelines v7 (2025-03-12): suggest "visual vocabulary that alerts the audience to GenAI use, such as a unique frame around the material, change of aspect ratio, colorization", lower thirds/watermarks, and warn that top-of-show or end-of-show notices should not be the only means because content is excerpted. [V] APA PDF (Guidelines v.7, extracted with pdftotext), via https://www.mishcon.com/download/apa-genai-best-practices, retrieved 2026-10-08.
- The probe style (flat fills, thick outline, schematic face) is unmistakably non-photoreal; the trade-off is that the likeness is carried by hair, beard, glasses, clothing and accessories, not facial structure. [P]
- No study on whether a disclosure label reduces trust or learning for clearly illustrated characters was found (gap already noted in B1-R1).

**R4-b4. Ethics guidance and precedent reactions (dated).**

| Source | What it says or what happened | Date | Tag |
|---|---|---|---|
| APA, Best Practices for Use of GenAI in Documentaries, guidelines v7 | Cue sheets for each GenAI element (prompts, tool version and terms, date, references and their copyright status, descriptions and timecodes); outward transparency; legal review (rights of publicity); for human simulations: search for primary sources, "Acquiring consent, when appropriate and relevant... considering ways to take extra care when a subject... is unable to give informed consent", cultural sensitivity, effect on the historical record | 2025-03-12 | [V] |
| ICOM Code of Ethics for Museums, revised | Adopted 2026-06-25 at the 41st General Assembly (UNESCO, Paris), 85.90% of vote; museum workers using technologies such as AI told to consider ethical implications, environmental impact and the potential for inaccurate or false information, with attention to IP, Indigenous rights and data sovereignty; guidelines to follow. I could not find wording on replicas or reconstructions | 2026-06-25 | [S] ICOM-affiliated pages and press-release PDF stub; code text not read |
| AP generative AI standards | Does not transmit AI-generated images that are false depictions of reality; an AI illustration may be used if it is the subject of a story and clearly labelled in the caption; does not alter photos, video or audio | 2023-08 | [S] |
| Partnership on AI synthetic media framework (BBC among signatories) | Consent for synthetic media where likeness of real people is directly involved; if the subject cannot consent, an obligation to solicit informed consent remains (search summary) | 2023-02 | [S] |
| Franganillo, "Recreating historical figures on screen", DARIAH annual event | Notes California AB 1836; a Spanish media guideline asks for heirs' approval for deceased people, accuracy, respect, and no faking actions or speech without consent; "Dalí Lives", Roadrunner Bourdain voice case, El Intermedio resurrections as cases | 2025-06-17..20 | [V] slides read (pdftotext) |
| ICCV 2025 workshop position paper, "Preservation vs. Fabrication" | Three principles: prior consent, "mandatory and permanent transparency in labeling", and a Non-Transcendence Rule: AI may fulfill intent but never invent it; about posthumous AI art, transfer to avatars is by analogy | 2025 | [V] abstract |
| Dalí Lives (Dali Museum, 2019-05) | Deepfake video built from over 6,000 frames and about 1,000 hours of machine learning with a voice actor; 125+ videos, 190,512 possible combinations; reaction coverage found in standard search was descriptive, not critical | 2019 | [S] brut.media, boingboing, laughingsquid; no critical coverage found |
| Digital Einstein (UneeQ with Hebrew University and GreenLight) | Voice described as "recognizable voice and accent"; Hebrew University executive endorsed; two searches found no critical coverage | 2021-04 | [S] |
| USC Shoah Foundation Dimensions in Testimony | Pre-recorded answers retrieved by AI (not generated speech); scholarly critiques: selection can miss the answer a survivor would give, tends toward shorter decontextualised stories; "first-person-first" principle | various | [S] |
| SchoolAI Anne Frank chatbot | January 2025 criticism of vague answers about her death and about responsibility for the Holocaust; a critic named Schönemann (affiliation not given in the summary I saw) called it "grave-digging" and "incredibly disrespectful"; the company later published a revised response naming Bergen-Belsen and the Nazi regime | 2025-01 | [S] search summaries of Futurism, getcoai, macmyths.com |
| JWeekly (Toby Axelrod), "AI Holocaust content is booming" | Responsible examples (WJC Anne Frank clip, "Tell Me, Inge..." hologram, "Living Traces"); critics include Anne Frank Fonds board member Yves Kugelmann, Auschwitz Memorial statement ("a profound act of disrespect" for AI victim images); principles: avoid putting words in victims' mouths, limit linguistic alterations, keep historical context, consult communities | 2026-05-08 | [V] page summary |
| BBC Question Time | Opening segment with silent AI-rendered Churchill, Kahlo, Gandhi, Pankhurst; presenter said visuals were AI-generated; backlash on social media about ethics, copyright and normalising deepfakes | 2026-05-28 | [S] letsdatascience.com |
| Anne Frank House, Rachel Riley avatar | Consenting, named person cloned (image and voice), four languages; announcement states no captions or screen-reader support (doc 02, B1-R1) | 2024-11-14 | [V] in doc 02 |

Pattern across these cases (my reading, [D]): acceptance tracks (i) rights-holder or family involvement, (ii) scripted or recorded content versus free-form generation, and (iii) visible labelling. The negative cases involve generated speech for victims or for an unlicensed person, or realistic unlabelled imagery.

**R4-b5. Albright's recent death.** Madeleine Albright died on 2022-03-23 at age 84; she was born in Prague and came to the US as a refugee in 1948; Secretary of State 1997-2001. [S] OPB, Fortune, RFE/RL (2022-03-23). Her death is 4.5 years before today, within living memory of family and colleagues; no published museum code found that sets a time bar for stylized depictions of recently deceased people. [U] The Spanish guideline cited by Franganillo asks for heirs' approval for deceased people. [V slides] The State Department photo basis is federal PD (R4-b1).

---

### (c) Open-source TTS as of October 2026

**R4-c1. Kokoro-82M.**
- Weights: Apache-2.0 (HF API license tag, `hexgrad/Kokoro-82M`, last modified 2025-04-10; `onnx-community/Kokoro-82M-v1.0-ONNX` Apache-2.0, modified 2025-02-08). Code: `hexgrad/kokoro` Apache-2.0, last push 2025-08-06; PyPI `kokoro` 0.9.4 (2025-04-05); `misaki` G2P 0.9.4 Apache-2.0; `kokoro-onnx` MIT, pushed 2026-09-01; `kokoro-js` 1.2.1 Apache-2.0 (2025-05-03; depends on `@huggingface/transformers` and npm `phonemizer` 1.2.1, Apache-2.0). [V] HF, GitHub, npm, PyPI APIs, 2026-10-08. No new major Kokoro version found in a web search. [S]
- Training data statement: "trained exclusively on permissive/non-copyrighted audio data and IPA phoneme labels", including public-domain audio, permissively licensed audio, and "synthetic audio from closed TTS systems"; a few hundred hours. Commercial use "explicitly permitted". [V] https://huggingface.co/hexgrad/Kokoro-82M (retrieved 2026-10-08). The mention of synthetic audio from closed providers is a provenance note, not a licence term. [D]
- Voices and languages: HF card summary says 8 languages and 54 voices; the ONNX repo has 55 voice files at about 0.52 MB average; English voices 20 US + 8 UK. [V/P] Author-assigned grades (VOICES.md, undated): af_heart A, af_bella A-, af_nicole B-, bf_emma B-, am_fenrir C+, am_michael C+, am_puck C+, bm_george C, bm_fable C, many D. So the three male inductees would use voices graded C to C+, versus A-/B- available for female characters. Grades are the model author's estimate. [V]
- No cloning interface: voices are fixed style vectors (`voices/*.bin`); the README shows no reference-audio input. [V/D]
- ONNX sizes (timestamped repo, 2026-10-08): fp32 325.5 MB, fp16 163.2 MB, q8-type 92.4 MB, q8f16 86.1 MB, q4 305.2 MB. [P] Disk free on this machine is about 1.4 GB, so only the q8 class is realistic here. [D]
- Quality evidence (live, primary): TTS Arena V2 leaderboard API (`https://tts-agi-tts-arena-v2.hf.space/api/leaderboard`, fetched 2026-10-08, 39 rows): Kokoro v1.0 Elo 1478 +/- 22, 1,033 votes, rank 29, flagged open-weight and `active: false`; the only other open-flagged row is Veena (1365). Top rows are closed systems at about 1540-1566 (CastleFlow 1561, Inworld TTS MAX 1558, Aurora 1566). Chatterbox appears at 1481 (rank 28, 1,781 votes, flagged closed in the feed, which is probably a hosted version; the open MIT weights are what GitHub and HF publish). ElevenLabs v3 1501, Multilingual v2 1509. [P] Derived: an 85-point Elo gap corresponds to about 62% preference for the top system (standard Elo base 400, assumed [U] for this arena); Kokoro versus ElevenLabs v3 (23 points) is about 53%. [D] Kokoro is no longer in rotation, so its rating may be stale. [P]
- Dated, lower-quality secondary numbers also circulate: "Elo about 1056, 54.4% win rate across 5,368 match-ups" for Kokoro (tts.ai search summary, older arena scale) and UTMOS 3.87 for Kokoro versus 3.95 for F5-TTS. [S] These disagree with the live feed's scale (see section 3).

**R4-c2. Pronunciation control for names.**
- Kokoro (Python): inline IPA via markdown-like syntax in the README, e.g. `[Kokoro](/kˈOkəɹO/)`; espeak-ng is "required for English OOD fallback and some non-English languages". [V] https://github.com/hexgrad/kokoro README via WebFetch. No SSML. [D]
- kokoro-onnx: `is_phonemes=True` accepts an IPA string; `create_timed` returns phoneme timings only if the model exports duration output. [V] Context7 `/thewh1teagle/kokoro-onnx`.
- HeadTTS input types: `text`, `speech` (spoken text different from subtitles), `phonetic` (model phoneme string plus subtitles), `characters`, `number`, `date`, `time`. [V] https://github.com/met4citizen/HeadTTS README (retrieved 2026-10-08).
- Dictionary probe: the HeadTTS en-us dictionary (125,829 lines, CMU-derived) returned: EINSTEIN `ˈInstIn`; MUIR `mjˈʊɹ`; NAISMITH two entries `nˈAzmɪθ`, `nˈAsmɪθ`; ALBRIGHT `ˈɔlbɹˌIt`; LAMARR `lɑmˈɑɹ`; KIESLER `kˈizlɜɹ`; HEDY `hˈidi`; MADELEINE `mˌædəlˈɛn` (final-syllable stress). [P] Names present, but two entries need human verification: the first Naismith variant is the voiced-z "NAYZ-mith" form while a search summary gives the surname as "NAY-smith"; MADELEINE with final stress looks like the French or "mad-uh-LEN" pattern, while a search summary of generic name guides gives "MAD-uh-layn"; Albright's own habitual pronunciation was not found. [S/U] Muir: search summary gives "MYOOR", the dictionary agrees. [S/P]

**R4-c3. Piper.**
- Original `rhasspy/piper` MIT, archived (last push 2025-08-26); continued at `OHF-Voice/piper1-gpl`, GPL-3.0, pushed 2026-10-06, 5.8k stars, "looking for maintainers". [V] GitHub API and README, 2026-10-08.
- Piper's own voices doc: "Piper is intended for personal use and text to speech research only" and "Some voices may have restrictive licenses". [V] https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md.
- Voice model cards (HF `rhasspy/piper-voices`, repo tag MIT, 2026-09-17 modified; each voice carries its own dataset licence): `en_US-lessac` dataset licence is the Blizzard 2013 licence, which allows "research and exploration purposes only", excludes commercial use, "audio book" or "stand-alone" use, and redistribution of the materials; `en_US-ryan-high` CC BY-NC-SA 4.0; `en_US-hfc_female` CC BY-NC-SA 4.0; `en_US-libritts_r` CC BY 4.0; `en_GB-alba` CC BY 4.0; `en_GB-northern_english_male` CC BY-SA 4.0; `en_US-joe` CC0; `en_US-kathleen` CC0; `en_US-amy` "See URL". Many voices are "finetuned from U.S. English lessac voice", which may inherit the Blizzard terms; legal effect of that inheritance on output audio is a legal interpretation. [V] model cards; Blizzard licence read at cstr.ed.ac.uk; inheritance conclusion [U].

**R4-c4. Other open models, October 2026 (licences read from HF/GitHub APIs on 2026-10-08).**

| Model | Code licence | Weights licence | Hardware, size | Cloning | Notes |
|---|---|---|---|---|---|
| Chatterbox (Resemble AI) | MIT (pushed 2026-07-21) | MIT (HF `ResembleAI/chatterbox`, 2026-06-10) | GPU recommended; Nano 110M "3x faster than realtime on 8 CPU cores"; Turbo 350M; 500M | Yes (reference clip) | Every output carries an imperceptible Perth neural watermark; 23+ languages; Multilingual V3 (about 2026-06); Arena 1481 |
| Orpheus (Canopy) | Apache-2.0 (pushed 2025-12-05) | Apache-2.0 on HF card, gated "auto" | 3B; GPU practical; llama.cpp CPU path exists | Fine-tune/zero-shot | English; 8 named voices; emotion tags; base is a Llama backbone and I found no Llama-licence note on the card or repo [U] |
| Dia (Nari Labs) | Apache-2.0 | Apache-2.0 | CUDA GPU required, about 4.4-7.9 GB VRAM; "CPU support is to be added soon" | Yes | English only; misuse clause: "Do not produce audio resembling real individuals without permission"; Dia2 noted 2025-11-19 |
| F5-TTS | MIT (pushed 2026-09-21) | **CC-BY-NC-4.0** (HF `SWivid/F5-TTS`) | GPU | Yes | Non-commercial weights; appears at top of some 2026 listicle leaderboards (tts.ai) |
| Kitten TTS 0.8 (legacy ONNX) | Apache-2.0 (repo) | Apache-2.0 (HF `kitten-tts-mini-0.8`) | 15M-80M, 25-80 MB, CPU, ONNX | No | 8 voices; uses espeakng-loader/phonemizer (GPL-3.0 eSpeak) per docs; Feb 2026 |
| KittenTTS 2 | Apache-2.0 (code) | **Stellon Labs Community License** (separate) | 1.7B, 506-947 MiB | Built in | 47 voices, 20 languages, in-context cloning |
| Sesame CSM-1B | Apache-2.0 | Apache-2.0 (gated) | CUDA GPU required | Context-based | Random speaker without context; misuse clause bars mimicking individuals without consent |
| Pocket TTS (Kyutai) | MIT | CC-BY-4.0, gated | 100M, CPU only; about 6x real-time on MacBook Air M4; peak 610 MB | Yes; variant "without voice cloning" exists | EN, FR, DE, PT, IT, ES (+NL per repo); per-voice licences listed on a separate page; gated prohibited use includes "voice impersonation or cloning" |
| Soprano-1.1-80M | not read | Apache-2.0 (HF) | CPU | not checked | Picovoice table lists Soprano as MIT: conflict |
| Supertonic 3 | not read | OpenRAIL tag (HF) | CPU | not checked | Picovoice table lists Supertonic TTS 2 as MIT |
| Qwen3-TTS | not read | Apache-2.0 (HF) | 0.6B and 1.7B | Base = cloning; CustomVoice = preset voices | 10 languages [S] |
| NeuTTS Air | not read | Apache-2.0 | 0.5B GGUF, CPU/GPU | Instant cloning | |
| VibeVoice | not read | MIT | 0.5B-1.5B | n/a | |

[V] for licence cells read via API or repo; [S] for language counts from search summaries.

**R4-c5. CPU generation feasibility and cost.**
- HeadTTS README (author's unofficial test; MacBook Air M2, 8 cores, 16 GB, macOS Tahoe 26.0, latest Chrome/Edge/Safari desktop): Node CPU fp32 1 thread RTF 0.22-0.23 (finish latency about 6.8-7.0 s for the Harvard sentence list), 4 threads 0.20-0.21; WebGPU fp32 Chrome 0.27, Safari 0.82; browser WASM q4 RTF 1.45 on all three browsers (slower than real time). [V] https://github.com/met4citizen/HeadTTS (README Appendix C). In-browser synthesis would block first audio for seconds; pre-rendering is therefore consistent with the locked decision.
- Picovoice on-device benchmark (vendor with a competing engine; published 2026-07-14, updated 2026-08-18; Ryzen 7 5700X, 64 GB; core-hour ratio, lower is faster): Piper 0.35, Pocket 0.37, Supertonic TTS 2 0.52, Kokoro 1.28 (peak 2.0 GB), Kitten Nano 3.1, Soprano 4.1, Chatterbox-Turbo 13.4 (peak 7.5 GB). No WER or MOS numbers published. [V] https://picovoice.ai/blog/on-device-tts/.
- Volume (derived): about 15-20 scenes with 1-2 avatar lines plus guide lines is roughly 50 lines of about 20 s, about 17 minutes of audio. [D] At RTF 0.25 that is about 4-5 minutes of compute; Chatterbox-Turbo at 13.4 core-hours per audio-hour would be about 4 core-hours. [D] Audio payload at 32 kbps mono is about 4 MB total, about 160 KB per scene. [D]

**R4-c6. Browser SpeechSynthesis as zero-asset fallback.**
- Support 95.39% global usage; Chrome 33+, Safari 7+, Firefox 49+, iOS Safari 7+. [V] caniuse data (Fyrd/caniuse `speech-synthesis.json`, 2026-10-08).
- Chrome 71+ requires user activation before `speak()` (errors otherwise). [V] https://developer.chrome.com/blog/new-in-chrome-71 via Google Developer Knowledge.
- Voice availability and quality vary by OS and browser: Chrome desktop 19 high-quality voices across 15 languages and online-only; Edge desktop 250+ voices across 75 languages; Android 67 voices but Chrome returns an unfiltered list; Firefox desktop no preloaded voices; Safari does not list downloadable voices and installing a higher-quality variant can make voices disappear; macOS/iOS lists include low-quality packs; Windows Natural voices need Windows 11 and downloads; Chrome desktop cuts off utterances over about 14 s; Chrome voices lack word-boundary events. [V] Readium "SpeechSynthesis in browsers and OSes" (April 2024) https://readium.org/speech/docs/WebSpeech.html. `localService` flag distinguishes local from remote voices; `boundary` events are specified but unevenly implemented. [V] MDN via Context7 `/mdn/content`.
- Consequences: no per-character voice consistency across devices, no timestamps to drive a mouth, no phoneme control; usable only as a degraded read-aloud. [D]

**R4-c7. Voice-cloning prohibition mapping.** Fixed-voice engines (Kokoro, legacy Kitten ONNX) expose no cloning path. Cloning-capable engines carry misuse clauses (Dia, CSM) or gated prohibited-use text (Pocket). A voice that merely sounds generic is not a clone, but a distinct, memorable synthetic voice for "Einstein" with an accent could still be read as an impersonation (Digital Einstein used "recognizable voice and accent" by agreement with the rights holder). [D]

**R4-c8. Audio delivery formats and platform quirks.** Opus: Chrome 33+, Firefox 15+, Edge 14+, iOS Safari full from 18.4, Safari desktop only partial (macOS 15.4+), global about 93.2% full plus 3.9% partial. [V] caniuse `opus.json`. On iOS, Web Audio API output follows the silent/mute switch while `<audio>` and `<video>` use the media channel, with well-known workarounds that start a silent `<audio>` first. [S] WebKit bug 252746 listing, audjust.com, github.com/swevans/unmute (search results; pages not opened).

---

### (d) Lip-sync

**R4-d1. Rhubarb Lip Sync.**
- Licence: MIT; the LICENSE.md summary says "the resulting lip sync data belongs to you alone"; third-party dependencies are MIT/BSD/Boost-style. Latest release v1.14.0, 2025-04-03; repo pushed 2026-06-16; release zips about 87 MB each. [V] LICENSE.md (raw GitHub), GitHub API, 2026-10-08.
- Behaviour: six basic shapes A-F plus optional extended G, H, X; Hanna-Barbera-style; input WAV or Ogg Vorbis; output TSV, XML, JSON or DAT; recognizers `pocketSphinx` (English only) or `phonetic` (non-English, "usually less precise"); passing the dialog text "will usually lead to more reliable mouth animation". [V] README.adoc, 2026-10-08. I did not run it (download 87 MB and disk limit).

**R4-d2. TTS-native timing (no recognizer).**
- Kokoro's Python `KPipeline` stamps `start_ts`/`end_ts` per token from predicted durations (`pred_dur`), half-frame accounting with a `MAGIC_DIVISOR = 80`; works when tokens come from misaki g2p. [V] Context7 `/hexgrad/kokoro` autodocs.
- kokoro-onnx `create_timed` returns `Timing(phoneme, start, end)`, empty if the model has no duration output. [V] Context7 `/thewh1teagle/kokoro-onnx` autodocs.
- HeadTTS (met4citizen; MIT; pushed 2026-04-03; 181 stars): "provides phoneme-level timestamps and Oculus visemes for lip-sync, in addition to audio output (WAV/PCM)", uses `onnx-community/Kokoro-82M-v1.0-ONNX-timestamped` (Apache-2.0, 8 ONNX variants from 86 MB to 325 MB), "doesn't use eSpeak or any other GPL-licensed module", English only, runs in browser (WebGPU/WASM) or Node (CPU/WebGPU). Output arrays: `visemes` (Oculus IDs: aa, E, I, O, U, PP, SS, TH, CH, FF, kk, nn, RR, DD, sil), `vtimes`, `vdurations`, `phonemes`; options `deltaStart -10 ms`, `deltaEnd +10 ms`, `frameRate 40` (25 ms steps). [V] README, 2026-10-08.
- GPL: the Python Kokoro/misaki path uses eSpeak-ng (GPL-3.0; COPYING states output is covered only if it "constitutes a covered work") as an out-of-dictionary fallback. [V] https://github.com/espeak-ng/espeak-ng/blob/master/COPYING and README. Using it only in a build step without redistributing eSpeak is a lower-risk position but is a legal reading, not a source statement. [U] The npm `phonemizer` package that kokoro-js depends on is tagged Apache-2.0 on npm; whether it bundles an eSpeak-ng WASM build was not checked, and HeadTTS's explicit "doesn't use eSpeak" statement suggests kokoro-js's path may. [U]

**R4-d3. Accuracy needed for a stylized mouth.**
- ITU-R BT.1359: "threshold of detectability" +45 ms (audio early) to -125 ms (audio late); "threshold of acceptability" +90 to -190 ms. [S] search summaries of tvtechnology.com, forasoft.com. This was measured for photoreal speech; I found no tolerance study for stylized 2D mouths. [U]
- HeadTTS step of 25 ms, below the lower detectability bound. [D] Audio output latency on Bluetooth devices can be larger than that; the Web Audio `AudioContext.outputLatency` property exists (MDN) but browser support was not checked. [S/U]
- Mouth-shape count: Rhubarb says six shapes are "the absolute minimum you have to draw"; my probe drew nine; mapping from 15 Oculus visemes to 6-9 shapes is many-to-one and not specified by either tool. [V/D]

**R4-d4. File cost.** Timelines are small JSON arrays per line (a few KB); no runtime dependency at visit time. [D]

---

### (e) Accessibility and platform behaviour

**R4-e1. WCAG 2.2 criteria that bind the avatar (Level A/AA).**
- 1.2.2 Captions (Prerecorded), Level A: captions for all prerecorded audio in synchronized media; captions include "who is speaking" and "meaningful sound effects". [V] https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html (WCAG 2.2 is a W3C Recommendation, 2024-12-12, per doc 02). Whether an animated avatar plus audio is "synchronized media" or "audio-only" (1.2.1 transcript) is a classification question; both are met by providing captions and a transcript. [D]
- 1.2.5 Audio Description (Prerecorded), Level AA: "if all of the important information in the video track is already conveyed in the audio track, no additional audio description is necessary." [V] https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html. The page does not mention animated characters. A pointing gesture that identifies an object is information; the spoken line must then name the object. [D]
- 1.4.2 Audio Control, Level A: audio that plays automatically for more than 3 seconds needs a pause/stop or independent volume mechanism; user-initiated audio (clearly labelled start link) is not covered. [V] https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html.
- 2.2.2 Pause, Stop, Hide, Level A: moving or blinking content that starts automatically, lasts more than 5 seconds and is presented in parallel with other content needs a mechanism unless essential. The page does not address blinking-character idle loops; they likely count as blinking content. [V/D] https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html.
- 2.4.11 Focus Not Obscured (Minimum) and 2.5.8 target size already noted in doc 02 apply to a docked avatar. [V in doc 02]

**R4-e2. Captions and transcripts in HTML.**
- web.dev: `<track>` kinds are subtitles, captions, descriptions, chapters, metadata; WebVTT; `kind="description"` for text descriptions of visual content; transcripts "capture all essential words, sounds, and important visual information" and should be in context on the page. [V] Google Developer Knowledge: web.dev/learn/html/audio-video, web.dev/learn/accessibility/video-audio (undated).
- Custom rendering: setting a text track `mode = "hidden"` makes the browser emit cue events without rendering cue text; `cuechange` and `activeCues` give the active cue; `VTTCue(start, end, text)` and `addTextTrack` build cues in JS. [V] MDN via Context7 `/mdn/content` (IMSC polyfill page, cuechange, VTTCue, addCue). Whether `cuechange` fires reliably on an `<audio>` element in all three engines was not tested. [U]

**R4-e3. Autoplay.**
- Chrome: muted autoplay always allowed; autoplay with sound needs prior user interaction, or high Media Engagement Index (desktop), or installed PWA / home-screen add; `play()` returns a promise that must be handled; a suspended `AudioContext` needs `resume()` after a gesture (Web Audio since Chrome 71). [V] https://developer.chrome.com/blog/autoplay (2018) via Google Developer Knowledge.
- iOS Safari (iOS 10, 2016-07-25): `<video autoplay>` allowed without a gesture only if muted or without an audio track; audio requires user gesture; a video that gains audio or is unmuted without a gesture is paused; `playsinline` required for inline play. [V] https://webkit.org/blog/6784/new-video-policies-for-ios/.
- Speech synthesis follows the same activation rule from Chrome 71 (R4-c6).

**R4-e4. Reduced motion.** `prefers-reduced-motion` supported since Chrome 74, Edge 79, Firefox 63, Safari 10.1; JS-driven animations must listen to the media query themselves; the "force reduced motion" CSS hack cannot stop motion started by the Web Animations API; web.dev says to consider defaulting to no animation when motion is non-essential; Windows labels the setting inversely ("Show animations"). [V] web.dev/articles/prefers-reduced-motion and web.dev/learn/accessibility/motion via Google Developer Knowledge. A mouth driven by an audio clock is state, not decoration; a reduced-motion variant is a static pose plus captions. [D]

**R4-e5. User controls and disclosure carried as text.** Pause, mute, speed and captions on/off are WCAG-adjacent expectations (1.4.2, 1.2.2). Disclosure should be text in the DOM, not baked into artwork, and EU practice proposes audio disclaimers for audio-only content (R4-b3). [D]

---

### (f) Counter-route: should the avatar speak at all?

**R4-f1. Learning evidence both ways.**
- Voice versus text, agents: older meta-analysis (Schroeder, Adesope, Gilbert 2013, J. Educational Computing Research 49(1)) found on-screen-text agents helped more than narrated agents; Castro-Alonso et al. 2021 (Educational Psychology Review 33(3)) found voice and nonverbal behaviour did not moderate effectiveness. [V in B1-R1, abstracts read]
- Modality principle (narration beats visual text): Wang, Xie and Li 2016, Advances in Psychological Science 24(3):335, 91 studies, 94 retention effect sizes (N = 8,088): retention d = 0.24, transfer d = 0.25; stronger under system-paced presentation (retention d = 0.43), dynamic images (d = 0.50) and shorter materials (d = 0.38). [V] https://journal.psych.ac.cn/adps/EN/Y2016/V24/I3/335. Our setting (self-paced browsing, largely static or 360 imagery) falls outside the strongest moderators. [D]
- Dyslexia: Knoop-van Campen, Segers and Verhoeven 2018 (Dyslexia), 26 children with dyslexia and 38 typical readers, learner-paced: audio support was more efficient for children with dyslexia. [V] https://pmc.ncbi.nlm.nih.gov/articles/PMC6084336.
- Redundancy: on-screen text identical to narration can impair learning, but the effect depends on prior knowledge, pacing and the presence of animation or diagrams; Noetel et al. 2022 found robust evidence for verbal redundancy in the overview of reviews. [S] search summaries (PMC10192876, Noetel via ACU; primaries not opened).
- Synthetic versus human voice: Mayer and DaPra 2012 found no difference with better synthetic voices; a 2024 Masaryk University study found learners improved "similarly" with two TTS accent varieties (Czech-English vs American English synthetic voices). [V] https://journals.phil.muni.cz/bse/article/view/41144 (abstract), plus B1-R1.

**R4-f2. Practice.** Mouthful of Dust (SLV): voiced recordings with "Hide Subtitles", "Audio describe slideshow images" and "Pause sequence" controls; Anne Frank House: spoken avatar guide, no stated captions; Digital Einstein: spoken; Dalí Lives: voice actor. [V in B1-R1/doc 02; S for the last two]. One physical-exhibit report says 86% of visitors listened to audio and 93% of those used headphones at some exhibit (Wild Music summative, informalscience.org; not a web study). [S] low transfer.

**R4-f3. What a text-first design still needs.** Captions and a transcript are required whenever audio exists, so all lines exist as text, and a no-audio mode shows the same text in a bubble. The first spoken line needs a user gesture on every major platform (R4-e3). [D]

---

## 2. Per-finding confidence

| ID | Confidence | Why |
|---|---|---|
| R4-a1 Rive licence, paid export, sizes | high | Official blog, official docs, MIT repo, measured file sizes; price list read from one doc page, undated |
| R4-a1 Rive MCP authoring | med | Official doc read; early access, desktop only; third-party RiveMCP seen only in a listing |
| R4-a2 Lottie/dotLottie runtime | high | GitHub/npm/measured sizes; state machine from official wiki via Context7 |
| R4-a2 Lottie Creator free export cap | low | Search summary; official page 404 |
| R4-a3 SVG probe | med | Own probe, one pass, one viewer; no test on devices; quality judged by me only |
| R4-a5 Live2D | med | Official license/about pages read (summaries without dates); free-edition limits from forum threads |
| R4-a6 Spine | low-med | Search summary of vendor purchase page |
| R4-b1 PD photos | med | Commons tags are community-asserted; per-file clearance needed; one conflict (Naismith) |
| R4-b2 Einstein publicity ruling | med | Several secondary summaries agree; not the opinion text |
| R4-b2 AB 1836 | med | Multiple law-firm summaries agree on date and damages; statute text not read |
| R4-b4 APA, Franganillo, ICCV abstract | high | Documents read directly |
| R4-b4 ICOM, AP, PAI/BBC, Dalí Lives, Digital Einstein, SchoolAI, BBC QT | med-low | Search summaries and secondary news; primaries not read |
| R4-b4 JWeekly | med | Page summary of a named article with date |
| R4-b5 Albright death facts | high | Many consistent news sources |
| R4-c1 Kokoro licences | high | HF/GitHub/PyPI/npm metadata |
| R4-c1 Arena Elo and ranks | high for the numbers, med for meaning | Live JSON from the leaderboard host; Kokoro inactive in rotation; "open" flags unclear for Chatterbox |
| R4-c2 dictionary lookups | high for lookups, low for pronunciation correctness | Lookups reproduced from the file; correctness not judged by a native or official source |
| R4-c3 Piper licensing | high | Model cards and licence page read |
| R4-c4 other models | med | Licence fields from APIs; some READMEs summarised by a small model; no listening or benchmark of my own |
| R4-c5 feasibility | med | HeadTTS numbers are the author's unofficial test on one laptop; Picovoice is a vendor benchmark with a competing product |
| R4-c6 SpeechSynthesis | high | caniuse, Chrome blog, Readium page (April 2024), MDN |
| R4-d1 Rhubarb | high | Licence, README, release API read; not run |
| R4-d2 TTS-native timings and HeadTTS | high | README and docs read; not run |
| R4-d3 sync thresholds | med | Secondary sources; photoreal context |
| R4-e1 WCAG | high | W3C Understanding pages read; classification of an avatar is my reading |
| R4-e2 to e4 platform behaviour | high | Official Google/WebKit/MDN sources; WebKit post is 2016 |
| R4-f1 learning evidence | med | Primary abstracts for Wang 2016, Knoop-van Campen 2018, Muni 2024; others via B1 or summaries |
| R4-f2 practice | med | |

---

## 3. Contradictions and conflicts found

1. **Rive pricing figures.** Search summary: Cadet $9/seat/month and Voyager $32; docs page: Cadet $17 monthly or $108 yearly, Voyager $39 monthly or $304 yearly; blog: Cadet "$9/month (annual)". $108/year equals $9/month, so Cadet is consistent; Voyager differs. Docs page used. A second search summary also described the first as "the editor is free, exports paid", consistent.
2. **Piper licences.** HF repo tag says MIT; the voices doc says personal use and research only; per-voice cards range from CC0 to CC BY-NC-SA and a research-only Blizzard licence; the original repo (MIT) is archived while the maintained fork is GPL-3.0.
3. **Kokoro voice and language counts.** HF card summary 8 languages and 54 voices; ONNX repo holds 55 voice files; a search snippet gave 6 languages and 46 voices (v1.0 release text). Unresolved; irrelevant to English use.
4. **Kokoro ranking scales.** tts.ai summary: Elo about 1056, 54.4% win rate, 5,368 matches (older arena scale); live V2 feed: 1478, 1,033 votes. Also tts.ai says F5-TTS leads open models on UTMOS, but F5-TTS weights are CC-BY-NC-4.0. A leaderboard position does not carry licence.
5. **Chatterbox in the arena.** Feed flags it not open (hosted variant likely); GitHub/HF say MIT. The README (as summarised) says voice cloning needs a reference clip and names no default speaker; the code's default-voice behaviour was not checked. [U]
6. **Kitten TTS.** Repo Apache-2.0 for code; KittenTTS 2 weights under Stellon Labs Community License; legacy 0.8 weights Apache-2.0. One HF page (`nano-0.8`) returned an error.
7. **Soprano and Supertonic licences.** Picovoice table: Soprano MIT, Supertonic TTS 2 MIT; HF tags: Soprano-1.1 Apache-2.0, Supertonic 3 OpenRAIL. Different versions.
8. **Voice versus text for learning.** Schroeder 2013 (text agents better); Wang 2016 (narration better, but moderated); Knoop-van Campen 2018 (audio more efficient for dyslexia); Castro-Alonso 2021 (voice does not moderate). Context-dependent; no study of a self-paced 360 museum site.
9. **Naismith portrait rights.** Commons tags the Springfield College c.1920 photo as public domain; doc 04 notes Springfield College images are "non-commercial only".
10. **Einstein likeness.** Hebrew University and GreenLight assert licensing of name and likeness and sued GM; the 2012 C.D. Cal. ruling held the publicity right had expired in 2005. Trademark use and non-US jurisdictions were not examined.
11. **Dalí Lives and Digital Einstein reception.** Coverage found is promotional or descriptive; no critical coverage was found in three searches, while contemporary cases (SchoolAI, Auschwitz Memorial statement, BBC Question Time) drew explicit criticism. Absence of critique may reflect search coverage.
12. **Rhubarb vs TTS-native timing.** No head-to-head accuracy data for stylized mouths exists in what I found.
13. **Mispronunciation of names.** Dictionary entries (Naismith variant order, Madeleine stress) differ from the search-summary pronunciations; no authoritative pronunciation source for Kiesler or Albright's first name.
14. **Conflict with doc 03.** Doc 03 rated Piper usable for offline batch generation subject to a per-voice licence check, and left the GPL-on-output question unverified; the evidence here shows the per-voice check fails for several leading English voices and that Piper's own doc limits it to personal and research use.

---

## 4. Open questions and assumptions

Assumptions:
- A1. Audio is pre-rendered at build time and shipped as static files (locked decision); no TTS runs on visitors' devices.
- A2. Total avatar and guide audio is about 17 minutes (my estimate from 15-20 scenes); if scope doubles, the numbers in R4-c5 scale linearly.
- A3. English only (B1 and brief imply English; HeadTTS and Rhubarb pocketSphinx are English-only).
- A4. Avatars are scripted from fact-ID-backed lines, not interactive generation (the locked "speaking only verified facts" design).

Open questions:
1. Does the statutory "digital replica" definition in California AB 1836, and any comparable state law, cover a clearly stylized illustration plus a non-clone synthetic voice used in a non-profit educational site? Counsel needed.
2. Are IHH, the Hebrew University/GreenLight (Einstein), the Lamarr estate (CMG Worldwide), the Albright family, and the Muir-Hanna Trust to be contacted, and does IHH consider that consultation a precondition?
3. Is the IHH audience subject to EU AI Act Article 50 (B1 note: jurisdiction unknown), and does the EU Code of Practice's audio disclaimer apply to pre-rendered synthetic narration?
4. Which authoritative sources give the correct pronunciations of Albright (first name), Kiesler (German vs English) and Naismith? Whether IPA overrides are enough or the dictionary needs editing was not tested by listening.
5. Does Rhubarb or HeadTTS produce acceptable mouth timing for stylized shapes on real Kokoro audio? A head-to-head test was not done (Rhubarb needs an 87 MB download; Kokoro/HeadTTS needs a 92-325 MB model and Node/Python).
6. Do `cuechange` events and hidden text tracks behave consistently on `<audio>` in Safari, Chrome and Firefox on iOS and Android?
7. Is Rive's early-access MCP, or the third-party RiveMCP, compatible with the paid-export rule, and who at IHH would hold a Rive seat?
8. Which of the six voices will be perceptibly distinct, and are the C/C+ male Kokoro voices acceptable? No listening test was possible.
9. Do clearly illustrated, labelled avatars change trust or learning? No direct study found (gap carried from B1).
10. Do the PD-tagged Lamarr MGM photos and the Naismith Springfield photo have a sound PD basis (publication and renewal facts)?
11. What do the inheritance terms of Piper voices finetuned from Lessac imply for output audio? Not needed if Piper is out of scope.
12. What is the Lottie Creator free-plan export limit on the official page?
13. Does the GPL eSpeak-ng fallback in the Python Kokoro path matter for IHH if audio is shipped but eSpeak is not?

---

## 5. Implications (no recommendation)

Conditional consequences only:

1. **If lip-sync timings come from the TTS engine**, the Rhubarb binary and its 87 MB release are not needed, the pipeline is one tool (HeadTTS, MIT) plus the Apache model, and eSpeak (GPL) stays out of the chain; the cost is single-maintainer risk (181 stars, last push 2026-04-03) and English-only. **If Rhubarb is used**, it adds a second tool but works on any WAV from any engine.
2. **If the engine is Kokoro**, licence risk is low (Apache code and weights, no cloning interface), voice quality is mid-pack (Arena Elo 1478 versus 1561-1566 at the top, about 62% preference for the top system), and three of five male inductees land on voices the model author graded C to C+; female character voices have A and B tier options. **If Piper**, licence review per voice is needed and several well-regarded English voices are non-commercial or research-only. **If Chatterbox, Orpheus, Dia, CSM or Qwen**, GPU or heavy CPU time is needed and cloning-capable models carry misuse clauses and, for Chatterbox, a built-in output watermark.
3. **If the avatar layer is code-authored SVG**, the whole six-character cast is about 11 KB raw, editable as text by IHH's maintainers and by agents, DOM-native for accessibility, with no runtime licence; the cost is that likeness will rest on hair, beard, glasses, clothing and accessories rather than facial structure, and mouth shapes need larger scale than my first draft. **If Rive**, the shipped runtime is 474-935 KB gzip, a paid editing seat (about $108/year) is needed to export, and the .riv is a binary that agents author only through an early-access GUI integration. **If dotLottie**, runtime is about 530 KB gzip, authoring is through paid tools or hand-written JSON. **If Live2D or Spine**, authoring needs a GUI and paid or proprietary terms.
4. **If the characters are meant to be recognisable as the real people**, the PD photo basis is sound for Muir, Einstein (Schmutzer), Albright (State Department) and probable for Lamarr and Naismith, but the approach in implication 3 yields generic faces; recognisability would need more per-character art direction, which raises the ethical weight (R4-b4 pattern) and the number of rights-holders to consult.
5. **If an inductee's avatar speaks in first person**, it moves toward what APA, the ICCV position paper and the JWeekly principles warn about ("never invent", "avoid putting words in victims' mouths"); **if lines are third-person or verbatim cited quotes**, they stay closer to the "scripted and sourced" side of the pattern. Albright's death in 2022 and Einstein's licensing history make those two the most sensitive.
6. **If narration is offered**, the first playback needs a click or tap on every major platform, captions (WCAG 1.2.2) and a transcript are required, `<audio>` elements behave better than Web Audio on iOS with the silent switch, MP3 or AAC is the safe baseline (Opus only partial in desktop Safari), and a pause/mute control is needed (1.4.2). **If narration is optional or absent**, the same text lines still exist for captions; the audio pipeline becomes a build flag rather than a content dependency.
7. **If idle blinking or breathing loops run longer than 5 seconds beside other content**, WCAG 2.2.2 expects a pause or hide mechanism; `prefers-reduced-motion` must be wired by hand for JS-driven animation.
8. **If the browser SpeechSynthesis API is the fallback**, voices differ per device, Chrome cuts off long utterances, word-boundary events are missing on Chrome voices, and no lip timing is available, so it is a degraded read-aloud only.
9. **If the labelling approach follows APA and the EU Code**, a label must live where the avatar appears (not only in an About page), include text and possibly an audio line, and be machine-readable where feasible; cue-sheet style provenance (tool, version, date, script, reviewer) maps onto the fact log already planned.
10. **If IHH must regenerate audio after a content fix**, someone needs Node or Python and a 92-325 MB model; about 17 minutes of audio is about 4-5 minutes of compute at RTF 0.25, so a full rebuild is cheap but not WordPress-editable.
11. **If time is tight**, the highest-variance items are voice distinctness (no listening test done), name pronunciation (needs a native-checked lexicon), and rights consultation lead time for Einstein, Lamarr and Albright.

---

## 6. Query log (all dated 2026-10-08)

Counts: Google web (WebSearch) 39 calls, of which 1 in extended mode (call 5); Google Developer Knowledge 4 calls (all `search_documents`); Context7 13 calls (4 `resolve-library-id`, 9 `query-docs`). Other direct fetches and probes are listed after. Counts are of tool calls I made; some web calls ran several internal searches that the tool did not itemise.

### 6.1 Google web (WebSearch), numbered

1. Rive runtime license MIT editor free plan terms commercial use pricing 2026
2. Kokoro-82M TTS Apache 2.0 voices license training data kokoro-js 2026
3. open source TTS leaderboard 2026 TTS Arena Kokoro Chatterbox Orpheus F5-TTS Kitten TTS Sesame comparison licence
4. Live2D Cubism SDK license small business exemption revenue threshold web SDK free
5. best open-source text-to-speech models 2026 Apache MIT CPU real-time Kitten TTS Soprano Pocket TTS NeuTTS Qwen3-TTS comparison (extended mode)
6. TTS Arena V2 leaderboard Elo Kokoro v1.0 Chatterbox open-weight ranking
7. Rive editor MCP server AI agent create .riv file programmatically text format API 2026
8. Spine 2D pricing Essential Professional license runtime requirement 2026 Esoteric Software
9. SVG 2D character lip sync viseme mouth shapes web JavaScript open source library Rhubarb JSON animate mouth swap CSS
10. ITU-R BT.1359 audio video synchronization detectability thresholds 45 ms audio early 125 ms audio late lip sync tolerance
11. Kokoro TTS phoneme durations lip sync visemes pred_dur 2D character mouth animation
12. Dalí Lives Dalí Museum deepfake AI Salvador Dalí exhibit reaction criticism ethics
13. Digital Einstein UneeQ Albert Einstein AI avatar Hebrew University GreenLight reaction criticism
14. museum guidelines generative AI recreations of historical figures deceased people ethics ICOM AAM 2025 2026 disclosure avatar
15. Holocaust survivor testimony AI avatar Dimensions in Testimony ethics reactions historians interactive recorded testimony vs AI generated recreation
16. Archival Producers Alliance Best Practices Generative AI in Documentary Filmmaking guidelines 2024 2025 recreations historical figures label
17. Hollanek Nowaczyk-Basińska "Griefbots, Deadbots, Postmortem Avatars" Philosophy and Technology 2024 design recommendations consent disclosure retire
18. Associated Press generative AI standards guidelines AI-generated images labeled; BBC AI guidelines synthetic media recreations of real people
19. Madeleine Albright died March 23 2022 cancer obituary born Prague immigrant 1948 naturalized
20. California AB 1836 digital replica deceased personality consent heirs education exception; NO FAKES Act status 2026
21. EU AI Act Article 50 transparency chatbot interacting with AI disclose deepfake artistic satirical exception text 2 August 2026 Code of Practice marking labelling
22. modality principle meta-analysis spoken narration vs on-screen text multimedia learning effect size Ginns 2005 Reinwein 2012 moderators self-paced
23. synthetic voice vs human voice multimedia learning meta-analysis text-to-speech neural TTS learning outcomes 2023 2024 2025 voice principle
24. Nielsen Norman Group audio narration on websites autoplay sound users mute opt-in voiceover guidelines text alternative
25. virtual museum visitors audio narration usage sound on rate headphones study online exhibition users prefer text captions listening behavior
26. Web Speech API speechSynthesis voices differ per OS iOS Safari Android Chrome Firefox Linux no voices quality inconsistency getVoices empty 2025 2026
27. LottieFiles Lottie Creator free plan export limits dotLottie commercial use pricing 2026
28. Live2D Cubism Editor free version limitations export moc3 runtime SDK Web Cubism 5 PSD required art layers
29. pedagogical agent text speech bubble versus voice narration learning experiment redundancy effect on-screen text plus narration comparison agent
30. redundancy principle meta-analysis on-screen text identical to narration hurts learning effect size 2021 2022 Noetel multimedia design
31. how to pronounce Madeleine Albright first name "MAD-uh-lin" OR "MAD-lin" pronunciation guide NPR
32. James Naismith surname pronunciation "NAY-smith"; John Muir surname pronunciation "myoor"; Hedy Lamarr born Kiesler pronunciation
33. ICOM Code of Ethics for Museums revised 2025 adopted Dubai artificial intelligence provision replicas reconstructions "clearly labelled"
34. National WWII Museum OR Smithsonian OR Anne Frank House AI avatar historical figure museum visitors criticism AI resurrect Holocaust victims Anne Frank chatbot backlash museum
35. Albert Einstein name image likeness licensing Hebrew University GreenLight "Albert Einstein" registered trademark educational non-profit use permission
36. Hebrew University of Jerusalem v. General Motors 903 F. Supp. 2d 932 Einstein right of publicity ruling New Jersey law domicile outcome
37. hexgrad Kokoro new version 2026 Kokoro v2 release StyleTTS2 open-weight update announcement
38. iOS Safari silent mode ringer switch mutes Web Audio API but not HTML audio element playback workaround webkit bug
39. SchoolAI Anne Frank AI chatbot Spark criticism Anne Frank Fonds Holocaust educators "grave-digging" 2025 Verge OR "Washington Post" OR JTA

### 6.2 Google Developer Knowledge MCP

G1. search_documents: autoplay policy audio video Chrome web.dev user gesture muted autoplay
G2. search_documents: web.dev media accessibility captions WebVTT track element transcripts audio description
G3. search_documents: Chrome speechSynthesis speak requires user activation autoplay policy Web Speech API synthesis
G4. search_documents: prefers-reduced-motion respect animations pause stop controls web.dev accessibility animation motion

### 6.3 Context7

C1. resolve-library-id: Rive (query: web runtime state machine inputs lip sync) -> /rive-app/rive-docs chosen
C2. resolve-library-id: kokoro-js -> /websites/npmjs_package_kokoro-js, /hexgrad/kokoro, /thewh1teagle/kokoro-onnx listed
C3. resolve-library-id: dotLottie web player -> /lottiefiles/dotlottie-web
C4. resolve-library-id: MDN Web Docs -> /mdn/content
C5. query-docs /rive-app/rive-docs: web runtime state machine number input mouth shape, load .riv, accessibility
C6. query-docs /websites/npmjs_package_kokoro-js: generate audio in browser, dtype, voices
C7. query-docs /thewh1teagle/kokoro-onnx: CPU, phoneme input IPA, create_timed
C8. query-docs /hexgrad/kokoro: KPipeline tokens start_ts end_ts, custom pronunciation markdown
C9. query-docs /lottiefiles/dotlottie-web: state machine numeric inputs, markers, wasm
C10. query-docs /mdn/content: track element kinds, TextTrack cues, VTTCue
C11. query-docs /mdn/content: TextTrack mode hidden cuechange activeCues custom caption rendering
C12. query-docs /mdn/content: SpeechSynthesisVoice localService, voiceschanged, boundary event
C13. query-docs /mdn/content: AudioContext outputLatency baseLatency getOutputTimestamp

### 6.4 Pages opened (WebFetch) and direct fetches

W1 rive.app/docs/account-admin/pricing.md; W2 rive.app/blog/rive-s-new-9-mo-plan; W3 live2d.com/en/sdk/license/; W4 huggingface.co/hexgrad/Kokoro-82M; W5 HF VOICES.md; W6 github.com/hexgrad/kokoro; W7 github.com/thewh1teagle/kokoro-onnx; W8 espeak-ng COPYING; W9 github.com/DanielSWolf/rhubarb-lip-sync; W10 github.com/OHF-Voice/piper1-gpl; W11 HF rhasspy/piper-voices; W12 picovoice.ai/blog/on-device-tts; W13 HF TTS-Arena-V2 space (no table in fetch); W14 codesota TTS leaderboard (no verified rows); W15 github KittenTTS; W16 github chatterbox; W17 github dia; W18 github SesameAILabs/csm; W19 github Orpheus-TTS; W20 rive.app/docs/editor/ai/mcp; W21 Blizzard 2013 licence (cstr.ed.ac.uk); W22 piper1-gpl docs/VOICES.md; W23 dicebear.com/licenses; W24 ICCV 2025W paper page (403; abstract then read via curl); W25 Fast Company Digital Einstein (403); W26 MIT Open Doc Lab APA page; W27 mishcon.com APA PDF (v.7, read with pdftotext); W28 letsdatascience BBC Question Time; W29 live2d.com/en/sdk/about; W30 webkit.org/blog/6784; W31 W3C WCAG 2.2 Understanding 1.2.5; W32 Understanding 1.4.2; W33 PMC6084336; W34 journals.phil.muni.cz/bse/article/view/41144; W35 journal.psych.ac.cn Wang/Xie/Li 2016; W36 readium.org/speech/docs/WebSpeech.html; W37 WCAG Understanding 2.2.2; W38 Understanding 1.2.2; W39 help.lottiefiles.com (404); W40 merriam-webster.com (403); W41 jonesday.com EU Code of Practice; W42 jweekly.com 2026-05-08.

### 6.5 Probes (curl, APIs, scripts)

P1 GitHub API repo metadata for 13 repos (rhubarb, piper1-gpl, piper, kokoro-onnx, kokoro, chatterbox, Orpheus-TTS, dia, F5-TTS, KittenTTS, csm, rive-wasm, espeak-ng); P2 HF model API licence tags for 10 models; P3 Rhubarb LICENSE.md and release list; P4 KittenTTS README, docs, releases; P5 Pocket TTS HF/GitHub README; P6 TTS Arena V2 JSON leaderboard API (39 rows); P7 piper-voices MODEL_CARD for 9 voices; P8 kokoro-js package.json, source grep, npm and PyPI metadata; P9 HF API search for Supertonic, Soprano, Qwen3-TTS, NeuTTS, VibeVoice, Higgs, pocket-tts; P10 jsDelivr size measurements (Rive canvas, canvas-lite, dotLottie) raw and gzip; P11 npm view (rive, dotlottie, lottie-web); P12 Rive sample .riv sizes; P13 Wikimedia Commons API probe (6 queries) for portraits; P14 HeadTTS README and en-us dictionary lookups (19 words); P15 caniuse JSON for Opus and speech-synthesis; P16 Rhubarb README.adoc; P17 Python SVG generator and Quick Look render; P18 APA PDF and Franganillo slides text extraction (pdftotext); P19 ICOM press-release PDF stub.

Scratch files (not project files): `gen.py`, `cast.svg`, `mouths_lamarr.svg`, `mouths_muir.svg` and PNG thumbnails in the scratchpad `spike/` folder.

Quota check against the brief: Google web at least 4 (39), Google Developer Knowledge at least 2 (4), Context7 at least 3 (13).
