# Interim synthesis after batch 1 (2026-10-08)

Sources: B1-R1, B1-R2, B1-R3, B1-R8 in this folder. Hypotheses, not decisions.

## Query tally
| Source | Batch 1 | Floor |
|---|---|---|
| Google web | 110 | 10 |
| Google Developer Knowledge | 62 | 10 |
| Context7 | 60 | 10 |

## What is now known (confidence)
1. **Guided spine beats free-roam** (med). Free-roam 360 tours disorient (12 of 14 users); assisted discovery helps learning, unassisted hurts; award winners use guided or chaptered spines with optional depth; destination-tap navigation suits touch novices. Tension with interviewee S, who wants a navigable 3D world: reconcile with a world that *looks* walkable but moves by tap-to-go and a camera rail.
2. **Learning levers are cheap and engine-independent** (high/med): story/event structure (g 0.48-0.72), segmenting with short summaries, retrieval quizzes with feedback (g 0.5-0.6), pre-training before immersion, no seductive details.
3. **Avatars help affect and wayfinding, little for learning** (med): g 0.20 overall; 2D agents (0.38) beat 3D (0.11); voice realism barely matters; disclosure is a norm and an EU legal duty from 2026-08-02.
4. **Only two scene sources can supply 15-20 inductee-specific scenes** (high/med): constructed rooms (code-built three.js baked to equirectangular, or Blender) and archival photographs placed in 3D. Real PD/CC 360s do not exist for these places; AI 360 generators fail the free-tools rule and cannot carry verified hotspots; splats/photogrammetry unavailable.
5. **Accessibility must be built into the engine** (high): PSV and Pannellum hotspots are unfocusable DIVs; a parallel DOM hotspot list driving the viewer works. Award sites are weak here (only 1 of 6 has captions/AD/pause; 3 of 6 block zoom), so accessibility is a differentiator.
6. **HTML-first, 3D as enhancement** (high): Astro ships 0 JS by default; vanilla three.js 184 KB gz vs R3F+drei 335 KB gz; WebGL2 baseline (96%); WebGPURenderer still experimental; Chrome removed SwiftShader, so a real non-WebGL path is required; Lite mode by capability probe + toggle (Network Information is Chromium-only).
7. **Budgets** (med/high): 4096x2048 panoramas (32 MiB GPU each), one resident scene at a time, HTML poster as LCP, ~3 MB per scene including artifacts.
8. **Hosting** (high): Cloudflare Pages Free fits best (20k files, 25 MiB/file, unlimited static requests, CNAME at IHH's GoDaddy DNS). **Vercel Hobby is "non-commercial personal use only" and counts paid staff writing code as commercial** — conflicts with IHH adoption. Firebase Spark 360 MB/day cap disables the site on a spike. GitHub Pages has no custom headers.
9. **WordPress has three tiers** (high): link card (any role); oEmbed discovery paste into the Embed block (zero IHH code, but sandboxed opaque origin: no storage, no service worker, no fullscreen, height capped 1000 px); registered provider plugin (full control, needs plugin rights). Always an "open full page" link.
10. **Google platform** (high): keyless Maps URL Street View link-out is the only free, ToS-clean "visit the real place today"; embeds need an IHH billing project and bar screenshots, caching, TTS use, and AI/chatbot use of Maps content. model-viewer 4.3.1 is the right artifact viewer. Gemini free TTS terms bar under-18 sites: avoid; use open-source TTS, pre-rendered.

## Contradictions still open
- Immersion helps vs hurts learning (all evidence is HMD/desktop VR, none mobile-web).
- Scrollytelling engagement vs scroll-hijack critiques (native scroll likely fine).
- Cloudflare large-file service-terms wording vs free static assets.
- Depth Pro licence (treat as research-only); Skybox AI free tier (none now).

## Answered by orchestrator
- Gemini under-18 clause for pre-generated audio: moot; open-source TTS chosen direction.
- iOS memory ceiling: unknowable; design for one resident scene and 4096x2048 max.
- Who rebuilds after the hackathon: ship a prebuilt static folder plus source; ask IHH.

## Escalated (IHH or user)
- IHH: WP Engine plugin rights and editor roles; Google for Nonprofits status; who owns hosting and the subdomain CNAME; analytics wish.
- User: hosting change away from Vercel; disk space (1.4 GB free) blocks Blender and spikes.

## Batch 2 (shaped by these gaps)
- R4 Avatar and voice: 2D stylized character pipeline, open TTS licences and quality, captions, disclosure, consistency across 6 characters.
- R5 Visual style: styles that unify constructed rooms with archival photos and signal "reconstruction" honestly; design system; motion.
- R6 Credibility and learning UX: citation UI, evidence tiers, "how this was made", teacher kit and standards, quizzes, cite-this, reading level, languages.
- R7 Judging, competitors, adoption: hackathon rubrics, likely competitor entries, IHH capacity, git-based CMS for non-developer editing, demo strategy under Maps ToS.
- R9 Scene feasibility: archival photo and CC0 prop coverage for candidate scenes per inductee; Smithsonian 3D coverage.
Batch 3: spikes (bake real textured scene, DOM hotspot a11y, 2D avatar line, Astro island persistence, oEmbed embed) once disk space allows.
