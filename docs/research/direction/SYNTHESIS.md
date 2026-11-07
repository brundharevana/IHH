# Direction synthesis — IHH Challenge X virtual museum (v4, 2026-10-09, Codex round 2 GREEN; hall moved to a parallel track by user decision)

Status: Codex round 1 RED (12 findings, handled); round 2 GREEN; round-2 minor findings applied (section 7). Ready for user critique. Recommendations are labeled as such with a confidence.
Evidence base: route reports B1-R1, B1-R2, B1-R3, B1-R8, B2-R4, B2-R5, B2-R6, B2-R7, B2-R9; spikes B3-S1 to B3-S5; interim notes INTERIM-1 and INTERIM-2; discovery research docs/research/00-04. Query tally across batches: 384 Google web, 93 Google Developer Knowledge, 107 Context7 (floors 10/10/10), plus spike measurements.

## 1. Decision and TL;DR

**Decision:** what form the Immigrant Hall of Honor (IHH) virtual-museum entry takes for five inductees (Einstein, Muir, Lamarr, Albright, Naismith) by 2026-11-01: experience architecture, scene production, stack, hosting, WordPress integration, avatar/voice, visual style, learning and credibility layers.

**Criteria (user-set, equal weight 25% each):** wow factor for judges; learning and credibility; IHH can adopt and maintain; buildable by Nov 1.

**Recommendation (confidence: medium):** build an **HTML-first story museum (option O3, highest under equal weights) with a 3D entrance hall as a gated stretch layer**, in this order so every step stands on its own:
1. **Spine:** one chaptered story page per inductee, organised as a timeline of events (scroll with native scrolling, no scroll hijack), every sentence carrying fact ids that open source toggletips. This is also the accessible 2D mode, the Lite mode, and the source of the WordPress package.
2. **Scenes:** 360 "moments" per inductee, built as constructed rooms baked to 4096x2048 panoramas (three.js, clean style) with real archival photographs shown untouched as separate layers, hotspots exposed as a real DOM button list, each scene labeled with an evidence tier. **Committed scope: 8-10 evidence-clean scenes** across the five inductees (about 8 of 21 candidates have clean open archival bases today); reaching the user's target of 3-4 per inductee (15-20) is **stretch**, filled only with clearly labeled illustrated reconstructions after the committed scenes pass review (user decides after prototypes).
3. **Entrance hall (parallel track, user decision 2026-10-09):** a 3D museum hall the visitor moves through by tapping destinations and a guided camera path (not joystick free-roam), with the guide as a voice plus painted emblem; painted portraits of the inductees hang in the hall and open their chapters. It is built by its own agents **in parallel from day 4**, after the shared engine and style kit land (days 1-3) and pass device and screen-reader tests (day 3-4). **2026-10-26 is a quality gate, not a start date:** the hall enters the judged submission only if it passes device, performance and accessibility tests; otherwise the core ships unchanged, because the hall is a separate entrance with no dependency from the core onto it. Cost: a third review stream for the user.
4. **Learning and trust layers:** explanatory micro-quizzes, a myth-vs-record card, cite-this, a "how this was made" panel, teacher kit keyed to Texas TEKS US History, captions and transcripts everywhere.
5. **Delivery:** fully static site on **Vercel (user decision 2026-10-09)** with no Vercel-specific runtime features, a prebuilt static folder as the portable handoff artifact, a paste-ready WordPress package per inductee, and a compact oEmbed teaser with an "open full experience" link.

Why this order: if the entrance or some scenes slip, the spine plus a few scenes is still a complete, credible, accessible entry; if everything lands, the entrance adds the wow the casual-visitor research asked for.

## 2. Findings by route (with confidence)

### R1 Experience and learning (B1-R1)
- Free-roam 360 tours disorient: 12 of 14 users in a think-aloud study found exhibits without nearby navigation nodes (Shikhri, Poretski, Lanir, arXiv 2310.11176, 2023). **Med** (n=14, desktop).
- Assisted discovery helps (d=+0.30) while unassisted discovery underperforms explicit instruction (d=-0.38) (Alfieri et al. 2011, J Educ Psych). **Med.**
- Story format improves comprehension (g=0.48) and recall (g=0.72) (Mar et al. 2021, https://pmc.ncbi.nlm.nih.gov/articles/PMC8219577/). **High.**
- Retrieval practice with feedback: g 0.50-0.61 across meta-analyses (Rowland 2014; Adesope 2017; Yang 2021). **Med.**
- Pedagogical agents: g=0.20 overall; 2D agents (0.38) beat 3D (0.11); voice realism does not moderate (Castro-Alonso et al. 2021). **Med.**
- Immersive HMD VR can reduce learning via extraneous load; segmenting and pre-training mitigate (Makransky 2019; Parong and Mayer 2018). **Med** (none test mobile-web museums).
- Award-winning comparators use guided or chaptered spines with optional depth (Imaginarium, Mouthful of Dust, YIVO Rudashevski, Tracing Art). **Med.**
- Accessibility is weak even among winners: of 6 probed, only Mouthful of Dust exposes captions, audio description and pause; 3 of 6 block pinch zoom. **Med** (entry-state probe).

### R2 Scene production (B1-R2, B2-R9, B3-S1, B3-S2)
- Only constructed rooms and archival photographs placed in 3D can supply inductee-specific scenes; there is no open, reusable, historically exact 360 imagery suitable as scene assets (link-out tours such as Google Arts & Culture/NPS and Street View exist for context only); AI 360 generators fail the free-tools rule (Skybox AI has no free tier; DiT360 depends on non-commercial FLUX.1-dev) and cannot carry verified hotspots. **High.**
- Of 21 candidate scenes, 8 have clean open archival bases (Einstein naturalization 1940, 1919 eclipse, Solvay 1927; Muir Yosemite camp 1903, Muir Glacier; Lamarr patent file; Albright 1997 swearing-in; Naismith 1892 rules). Naismith is thinnest; Albright's childhood is sensitive. **High/med.**
- Spike S1: a textured room bakes to a 4096x2048 equirect in ~89 ms warm on M1; 414 KiB WebP q80; viewer first load ~896 KiB in 3D, ~84 KiB in Lite; automated handedness and object-ID gates caught every injected fault (the silent mirror bug is real). **High** (one machine).
- Photo Sphere Viewer and Pannellum default hotspots are unfocusable DIVs (**High**). A parallel DOM button list with dialogs, focus return and reduced-motion jumps passed tool-based checks in S1 (**Med**: no real screen reader, mobile assistive tech, forced-colors or zoom-reflow test yet).
- Spike S2: clean styles cost 121-289 KiB per equirect; dither costs ~1 MiB; geometry outlines show no cube-seam artefact; a style is fully defined by a token file (0 differing pixels on rebuild). **High** (one room).

### R3 Stack, performance, hosting, WordPress (B1-R3, B3-S4)
- Astro static output ships 0 JS by default; vanilla three.js ~184 KB gz vs R3F+drei ~335 KB gz; WebGL2 reaches ~96% while WebGPURenderer is still labeled experimental by three.js. **High.**
- Chrome removed SwiftShader fallback: no-WebGL devices need a real non-WebGL path. **Med.**
- Hosting: **decision locked (user, 2026-10-09): Vercel.** Hobby includes about 100 GB/month Fast Data Transfer; its Fair Use Guidelines describe Hobby as personal, non-commercial use, which is the handoff risk when IHH's paid staff take over (**Med**). Technical portability is **High** because the output is fully static with no Vercel-specific runtime features. Portable alternatives if IHH ever moves it: Cloudflare Pages Free (20,000 files, 25 MiB/file; service-terms wording on large files unresolved), GitHub Pages (no custom headers), Firebase Spark (360 MB/day cap disables the site on overage).
- WordPress oEmbed discovery needs zero IHH code but forces sandbox="allow-scripts" (WordPress source, wp_filter_oembed_result). In a **source-code-simulated** host (blob proxy; the verbatim WordPress-shaped frame was blocked by the test browser), S4 found WebGL2 and CDN imports work, all storage/service workers/fullscreen fail, height is clamped to 200-1000 px and resizes only with the WordPress message shape; a static oEmbed JSON cannot honour maxwidth/maxheight (spec deviation). **Med**: requires a real WordPress (Playground or IHH staging) test against the public Vercel URL before we rely on it.

### R4 Avatar and voice (B2-R4, B3-S3, B3-S5)
- Code-authored SVG is the lowest-risk agent-authorable 2D route; Rive is not a clean free/open-source production route (export and use are plan- and branding-constrained; Free reportedly exports with Rive branding), and Lottie authoring tools are the paid part. **Med.** Now moot for the guide (voice + emblem) but relevant to emblem animation.
- Kokoro-82M (Apache-2.0) is the safe open TTS; phoneme timings available; Piper restricts itself to personal/research use; F5-TTS non-commercial. **High.**
- Ethics: APA guidance, ICOM's 2026 code, the EU labelling code of practice (2026-06-10) and California AB 1836 converge on disclosure, consent/heirs and not inventing speech of real people. **Med.** Decision taken: inductees appear only with their own verbatim cited words; the guide narrates.
- Spike S5: a deterministic painterly filter (anisotropic Kuwahara + brush strokes) on verified public-domain photographs yields recognisable portraits without inventing features (Einstein, Muir, Albright, Naismith); a painted cartoon guide does not fit. **Med** (author judgement, no user test). Decision taken: painted portraits; guide is voice + emblem.

### R5 Visual style (B2-R5, B3-S2, B3-S5)
- Heritage guidance (London Charter; Frischer and Stinson 2007; Unger et al. 2026): photorealism only for credible data; schematic/clay/NPR signal hypothesis; no agreed standard and no audience study. **Med.**
- Text over any style needs a scrim (worst-case 1.0-1.7:1 bare; 7.7-9.8:1 with a 72% scrim). **High** (spike).
- IHH brand: Montserrat; red #ed1b24 fails 4.5:1 as body text on white. **High.**

### R6 Credibility and learning UX (B2-R6)
- Citations act as a credibility cue even when unclicked (Wikipedia click-through 0.29%; random citations also raised confidence in an AAAI-25 study), which is a trust cue, not a verified learning benefit (**Med**). Touch needs button-triggered toggletips, not hover (**High**).
- High-information feedback outperforms right/wrong (d 0.99 vs 0.46). **High.**
- TEKS US History Since 1877 (19 TAC 113.41) has direct hooks: nation of immigrants, evaluate sources, citations. IHH confirms a Texas museum plan. **High.**
- Smithsonian publishes an AI-disclosure formula usable as a "how this was made" template. **Med.**

### R7 Judging, competition, adoption (B2-R7)
- No public rubric for Challenge X; per-profile honorarium plus (per user) a ranking. **Med.**
- IHH: 501(c)(3) ruled Jan 2025, one listed staff member, agency-built site on WP Engine (**High**, public records). Low capacity and budget are **inferences** (no public financials; 990-N filing) (**Med-low**); they are not used as a decisive scoring input until IHH confirms.
- Commodity features: timelines, 360 embeds, AI avatars, historical chatbots. Hard to copy: fact-level provenance and accessibility (95.9% of home pages fail WCAG checks, WebAIM 2026). **Med/high.**
- About 65% of hackathon projects stop within days; survival tracks ownership and off-the-shelf parts. **High.**

## 3. Decision matrix (equal weights)

Scores 1-5; weighted score = mean (all weights 0.25).

| Option | Wow (25%) | Learning + credibility (25%) | IHH adopt (25%) | Buildable by Nov 1 (25%) | Weighted |
|---|---|---|---|---|---|
| O1 Free-roam walkable 3D museum (reference-repo style) | 4 — immersive, but disorientation risk | 2 — weakest learning evidence; text secondary | 1 — bespoke WebGL, hard to edit | 2 — collision, touch joystick, 15-20 navigable rooms | **2.25** |
| O2 Guided 3D museum only (tap-to-go hall + 360 scenes, thin text) | 4 | 3 — guided helps, but story text thin | 2 | 3 | **3.00** |
| O3 HTML-first story chapters + 360 scenes (no 3D hall) | 3 | 4 — story spine, quizzes, citations | 4 — static HTML, content in data files | 4 | **3.75** |
| O4 Enriched WordPress pages only (TimelineJS, embeds) | 1 — commodity | 3 | 5 | 5 | **3.50** |
| O5 Static exhibit framework (CollectionBuilder, spreadsheet-driven Jekyll) + embedded 360 where evidenced | 2 — item-centric browse pages, commodity look | 3.5 — built-in timeline/map, but item-first rather than story-first | 4.5 — CSV editing suits non-developers; still needs a Ruby/Jekyll build | 4 — framework exists, but provenance chips, quizzes, DOM hotspots and the scene engine must be bolted on in Liquid | **3.50** |
| **R Recommended: O3 spine + O2 hall as a progressive layer** | 4 — hall + scenes + painted portraits | 4 | 3.5 — spine stays maintainable; hall optional | 3 — more scope, but ordered so the spine ships first | **3.63** |

O5 was added after Codex round 1. Codex proposed scores of Wow 2-3 / Learning 4 / Adopt 5 / Build 5 (4.00-4.25); we score it 3.50 because (a) IHH requires a 360 view, so the scene engine, DOM hotspot layer, quizzes and provenance chips must be built in any option, removing O5's build advantage; (b) CollectionBuilder pages are item-centric, which the story-structure evidence (g 0.48-0.72) ranks below an event-timeline spine; (c) adoption still requires a Ruby/Jekyll toolchain, while O3 also keeps all content in data files (JSON/CSV produced by the fact pipeline). Wax (last push 2023-11) is stale; Omeka S needs a PHP/MySQL server (managed hosting from about EUR 659/year), failing the free and static constraints; Juncture (JSTOR Labs visual essays) is a credible narrative alternative but its 2026 maintenance status is unverified. What we borrow from O5: spreadsheet-editable content, which our pipeline's CSV exports already provide.

Reading the matrix honestly: under the user's equal weights **O3 scores highest (3.75)**; R (3.63) trails it because the hall costs adoptability and schedule. The recommendation is therefore **O3 as the plan of record**, with the 3D hall as a **gated stretch layer** added only if checkpoints are met (vertical slice tested on real devices by day 7; all five spines and their scenes reviewed by day 17). This keeps the user's vision and the casual-visitor finding (a navigable 3D moment with a surprise) in reach without letting them sink the entry. Sensitivity: wow 40% / learning 25% / adoption 10% / buildability 25% gives R 3.70 vs O3 3.60 (R leads narrowly); adoption 40% with 20% each elsewhere gives O3 3.80 = O4 3.80 > R 3.60.

## 4. Sub-decisions (recommendations, confidence)

| Area | Recommendation | Confidence |
|---|---|---|
| Framework | Astro static site; vanilla three.js islands; Photo Sphere Viewer for scenes with our DOM hotspot layer; model-viewer for artifacts; OpenSeadragon for documents (LoC IIIF where available) | Med |
| Renderer | WebGL2 baseline; no WebGPU dependency | High |
| Scene data | One `ihh-scene/1` JSON descriptor per scene driving 3D, Lite, hotspot list, dialogs, credits and gates; cross-file checks in code | High |
| Scene style | Clean constructed style (clay or toon; choose with the user) baked to equirect; archival records shipped as separate untouched image layers (S5 showed WebP re-encoding alters baked-in records) | Med |
| Portraits | Painterly filter from verified PD photographs, labeled; Lamarr pending rights | Med |
| Guide | Kokoro voice, pre-rendered MP3, WebVTT captions, transcript, painted emblem; inductee quotes read as attributed quotations | Med |
| Navigation | Tap-to-go nodes and guided camera path in the hall; room list; visit history; no joystick | Med |
| Learning | Timeline spine; 1-2 explanatory quizzes per inductee; myth-vs-record; teacher sheet with TEKS 113.41 hooks and DocsTeach/LoC links; cite-this (APA 7, MLA 9, Chicago) | Med |
| Credibility | Fact chips with toggletips; per-inductee bibliography with dates; "how this was made" panel using the Smithsonian formula; evidence tier per scene and prop | High |
| Accessibility | WCAG 2.2 AA; Lite mode by capability probe + toggle; prefers-reduced-motion wired in JS; captions/transcripts; 24 px targets; no CSS2DRenderer labels | Med until the vertical slice passes VoiceOver, NVDA, TalkBack, 200/400% zoom, forced-colors and mobile tests |
| Hosting | **Vercel (decision locked by user)**; static output only (no serverless functions, middleware or Vercel image optimisation) so the folder is portable; subdomain CNAME at IHH's GoDaddy DNS if IHH wants its own domain; flag Hobby-plan terms at handoff | Portability High; handoff terms risk Med |
| WordPress | Paste-ready Gutenberg package per inductee (from the pipeline) + compact oEmbed teaser + "open full experience" link; plugin tier only if IHH grants plugin rights | High |
| Analytics | Off by default; offer host-agnostic cookieless GoatCounter to IHH with a COPPA-aware notice; Vercel Web Analytics only while hosted on Vercel; IHH's choice | Med |

## 5. Risks, unknowns, and what would change the answer

| Risk / unknown | Effect | Mitigation | Would change the answer if |
|---|---|---|---|
| Judging rubric unknown | Effort split may be wrong | Ask IHH; demo-ready vertical slice early | Judges score only WordPress profiles -> shift to O4+ with one showcase scene |
| IHH hosting/ownership; Vercel Hobby non-commercial terms at handoff | Site could be orphaned or need a paid plan | Static, host-agnostic folder; handoff note on terms; docs | IHH refuses external hosting -> embed-only tier, smaller hall |
| Real-device performance (iOS Safari, school Chromebooks) untested | 3D hall may fail | Lite mode; test on devices in week 1 | Hall fails on target devices -> hall becomes desktop-only extra |
| Mobile-web evidence gap: learning and immersion evidence comes from HMD/desktop studies; no study tests a mobile-web 3D museum; accessibility claims rest on tool checks, not real assistive tech | Design may rest on transferred evidence | The vertical slice's device and screen-reader tests (VoiceOver, NVDA, TalkBack) are a **precondition** for any 3D expansion beyond the committed scenes | Slice tests fail -> stay 2D-first with 360 viewers only |
| Scene evidence uneven (8 of 21 clean) | 15-20 scenes may require weak reconstructions | Evidence tiers; count follows evidence | User insists on 4 per inductee -> more "illustrative" scenes, more labeling |
| Likeness/consent (Einstein licensing, Albright family, Lamarr estate, Muir-Hanna Trust) | Takedown or reputational risk | Quotes-only speech; labels; IHH consults rights holders | IHH declines portraits -> typographic quote cards |
| Lamarr photo rights | No portrait | Research (S6 running); ask IHH | No PD photo -> text card |
| Review bottleneck (user reviews facts and scenes) | Schedule slip | Review dashboard; batch reviews | — |
| Sandboxed embed untested in real WordPress | Teaser may break | Test on WordPress Playground or IHH staging | — |
| 24 days, solo + agents | Scope overrun | Vertical slice first; parallel fan-out only after engine, kit and gates land | — |

## 6. Recommended next step (cheap de-risking experiment)

Build a **vertical slice for Einstein** in about 3 days: verified facts via the pipeline (run it for real), the chapter page with fact chips, one 360 scene (naturalization 1940, cleanly evidenced), one quiz, the painted portrait, the guide voice for two lines, the WordPress package and the oEmbed teaser. Test it on a real iPhone, an Android phone, a Chromebook-class laptop, VoiceOver/NVDA, and inside WordPress Playground. Then four tracks run in parallel from day 4: story chapters for all five, scene waves, the entrance hall (own agents, quality gate 2026-10-26), and the WordPress package plus teacher kit.

Parallel day-3 gate: **Lamarr portrait cleared** (S6 research + IHH answer) or replaced by a non-likeness quote/emblem card, so the five-portrait system is not blocked late.

## 7. Critique history
- Round 1 (Codex, 2026-10-09): **RED**, 12 findings (4 high, 6 medium, 2 low). Accepted and fixed: 2 (hard kill gate), 3 (committed 8-10 scenes, 15-20 stretch), 4 (oEmbed downgraded, real WordPress test required), 5 (host-terms ambiguity; superseded by user keeping Vercel, risk recorded), 6 (Rive wording), 7 (citation confidence), 8 (DOM hotspot confidence split), 9 (IHH capacity as inference), 10 (mobile-web evidence gap risk + precondition), 11 (360 wording), 12 (Lamarr day-3 gate). Partly accepted: 1 (O5 added and scored 3.50 with rebuttal of the proposed 4.00-4.25). User decision during round: hosting stays on Vercel.
- User critique (2026-10-09): asked why the hall could not be built in parallel. Answer: it can; the real constraints are the shared engine/kit and device tests (days 1-4), verified facts for hall content, and review capacity. Decision: hall becomes a parallel track from day 4 with a quality gate on 2026-10-26 instead of a start gate.
- Round 2 (Codex, 2026-10-09): **GREEN.** Round-1 findings 1-9, 11, 12 FIXED; 10 PARTLY FIXED (section 4 accessibility confidence) -> now fixed (Med until device/AT tests). New: 13 medium (hall realism after 2026-10-26 gate) -> hall scoped as demo-scale post-core stretch, never a submission dependency; 14 medium (hosting section clutter) -> rewritten around the locked Vercel decision with Cloudflare as a portable alternative; 15 low (analytics portability) -> GoatCounter default, Vercel Analytics only while on Vercel; 16-17 low (Kokoro Apache-2.0 and TEKS 113.41 hooks independently confirmed). Orchestrator review: GREEN.
