# IHH: Voices of Arrival — Design Spec (umbrella + foundation)

Date: 2026-10-09. Deadline: 2026-11-01. Status: draft for user review.
Inputs: docs/research/direction/SYNTHESIS.md (v4), REF-tapestry-parity.md, B4-AVATAR-RECOMMENDATION.md, B5-museum-architecture-rendering.md, docs/pipeline/SPEC.md, docs/handoff/DECISIONS.md (all 2026-10-07 to 2026-10-09 entries are binding).

## 1. Goal and success

**Goal:** a virtual museum, "IHH: Voices of Arrival", for five Immigrant Hall of Honor inductees (Albert Einstein, John Muir, Hedy Lamarr, Madeleine Albright, James Naismith) that wins IHH Challenge X and that IHH adopts.

**Audience:** high-school and college students first, then teachers (Texas TEKS US History Since 1877), then casual visitors. English only.

**Success criteria:**
1. Every sentence, label, quote and caption on the site traces to a verified fact with a primary or institutional source link (pipeline gates pass; zero unsourced claims).
2. Each inductee experience works on a mid-range phone and a desktop, with keyboard and screen reader, and in Lite mode without WebGL.
3. IHH can paste the WordPress package into its site without developer help, and can redeploy the static site folder.
4. The demo shows a navigable 3D museum, a narrated gallery with exhibits appearing as they are named, a living painted portrait speaking a real quote, and a source opening from any sentence, within 90 seconds.

## 2. Principles

- **Simplest thing that works.** Plain HTML, CSS and one 3D library; no framework where a static page suffices; no server.
- **Facts first.** Content is generated only from pipeline-verified data. Nothing is typed into the site by hand.
- **One source, many views.** The same content data drives the 3D rooms, the Lite/2D view, the WordPress package and the chatbot export.
- **Honest presentation.** Two kinds of rooms: curated museum galleries, and **reconstructions of real places** (e.g. Einstein's office or study) built only where an archival photograph or primary description of that place exists. When the narration reaches a moment that happened in such a place, it is told inside the reconstructed room. Every reconstruction (room or object) carries a visible note "Reconstruction based on [photo/document, holder, date]" and a link to the original. Portraits and voices carry labels; archival records are always also shown untouched.
- **Accessible by default.** WCAG 2.2 AA is a build requirement, not a polish task.

## 3. Visitor experience

### 3.1 Flow
1. **Entrance hall (3D rotunda).** A museum rotunda with five painted portraits in niches. The guide's voice welcomes the visitor (captions on). The visitor taps a portrait (or picks from the accessible list) to enter that inductee's wing. Parallel track, quality-gated (section 9).
2. **Journey map (per inductee).** An illustrated map tracing the inductee's life route (e.g. Ulm, Bern, Berlin, Princeton) with dated stops from verified facts. Tapping a stop goes to its gallery.
3. **Chapter rooms (3-4 per inductee).** Each chapter is either a realistic museum gallery or, where an archival photo of the real place exists, a **reconstructed place** (e.g. Einstein's office) that the visitor can look around in 360 and walk through like the Tapestry tour. Narration about an event plays in the room where it happened when that room has been reconstructed. On entering:
   - the guide narrates the chapter (captions; play/pause; speed);
   - **exhibits appear as numbered objects at the moment the guide names them** (narration cue -> exhibit reveal); once revealed they stay;
   - clicking a number (or the exhibit itself) flies the camera to it and opens the **side panel** (desktop) or **bottom sheet** (phone): title, a **360-degree viewable 3D version of the artifact** (letters and documents as rotatable paper objects with front and back, objects as 3D models), notes, credit, source chips, evidence label, a note at the bottom "Reconstructed 3D model" and a link **"See the original"** to the untouched scan or photo at its holder;
   - the inductee's **living painted portrait** in the gallery speaks one or two of their **real, cited quotes** in their own distinct, labeled AI voice (or a cleared real recording).
4. **Ending (visitor chooses).** A card offers: take a short quiz (2-3 questions, explanation and source link per answer), or visit any of the other four inductees (four cards), or return to the hall. Teacher kit and "cite this page" links sit in the footer of every inductee page.

### 3.2 Always available
- Sources drawer: every sentence's fact chips open a toggletip with the source title, institution, date and link.
- "How this was made" panel: method, AI roles (painting filter, depth motion, synthetic voice), evidence tiers, pipeline description.
- Lite mode toggle: the same chapters as a scrolling 2D page (timeline, exhibits, quotes) with no WebGL.
- Sound toggle (ambient room tone, off by default); motion toggle; captions toggle; transcript.

## 4. Architecture

```
data/inductees/<slug>/         (pipeline output: facts, sources, media, drafts; verified + reviewed)
content/<slug>/                (experience data, authored by agents from verified facts only)
  inductee.json                (name, portrait, voice, journey stops)
  chapters/<n>.json            (narration script with cues, exhibits, quotes, room layout)
  audio/                       (pre-rendered narration + quote audio, MP3, WebVTT)
site/                          (Astro static site)
  src/pages/                   (index = hall; /<slug>/ = journey; /<slug>/<chapter>/ = gallery; /<slug>/lite/)
  src/museum/                  (shared museum kit: room builder, materials, lighting, exhibits, camera, reveal timeline)
  src/ui/                      (panel, bottom sheet, toggletip, captions, quiz, portrait player)
  public/                      (textures KTX2, portraits, media files)
tools/                         (pipeline tools; plus build-time scripts: tts, depth bake, content checks)
```

**Stack:** Astro (static output, no server, no Vercel-specific features), vanilla three.js r186 (WebGL2) for rooms, camera-controls for flights, `<model-viewer>` for 3D objects in the panel, native `<dialog>`/HTML for panels, `<audio>`/`<video>` with WebVTT, Motion (vanilla) for UI transitions. Kokoro-82M (Apache-2.0) generates audio at build time. Depth Anything V2 Small (Apache-2.0) makes portrait depth maps at build time.

**Units and contracts:**

| Unit | Does | Input | Output |
|---|---|---|---|
| Pipeline (exists) | verified facts, sources, media | inductee name | data/inductees/<slug>/ |
| Content author (agent task) | writes chapter JSON from verified facts | data/inductees/<slug> | content/<slug>/ (every line cites fact ids) |
| Content check (new, tools/) | G6-style grounding of narration, labels, quotes; cue/exhibit integrity; media licence check | content/<slug>/ | pass/fail report |
| Audio build (new, tools/) | Kokoro TTS for narration and quotes; WebVTT with cue times | content scripts | MP3 + VTT |
| Museum kit (site/src/museum) | builds a room from a layout JSON using fixed room types, materials, lights, exhibit types | chapter layout | three.js scene |
| Reveal timeline | maps narration cue times to exhibit reveals | VTT cues + chapter JSON | reveal events |
| Panel/UI | shows exhibit details, sources, quiz, portrait player | exhibit data | accessible DOM |
| Lite view | same chapter as a 2D page | chapter JSON | HTML |
| WordPress export (exists, extended) | paste-ready blocks per inductee | verified facts + content | wordpress.html |

### 4.1 Chapter data (content/<slug>/chapters/<n>.json)
```json
{
  "id": "einstein-3", "title": "...", "room": "chapter-gallery | reconstructed-place", "accent": "#...",
  "reconstruction": {"basis_media_ids": ["EIN-M-0022"], "basis_fact_ids": ["..."], "note": "Reconstruction based on ..."},
  "narration": [{"cue": "c1", "text": "...", "fact_ids": ["EIN-F-0012"], "reveals": ["ex2"]}],
  "exhibits": [{"id": "ex2", "number": 2, "type": "framed-document", "wall": "north", "slot": 2,
                "media_id": "EIN-M-0004", "title": "...", "notes": [{"text": "...", "fact_ids": ["..."]}],
                "evidence": "record"}],
  "quotes": [{"id": "q1", "text": "<verbatim>", "fact_id": "EIN-F-0040", "voice": "einstein-ai|recording"}]
}
```
Rules: a `reconstructed-place` room requires at least one verified basis photo or primary description; every exhibit has `original_media_id` (the untouched record) and a 3D version (`model`: generated document mesh or reconstructed object); every text field cites verified fact ids; exhibits use only verified media with usable licences; quotes equal an `is_direct_quote` fact verbatim; placement by wall and slot only (no free coordinates).

### 4.2 Museum kit (from B5)
- Room types: rotunda hall (14 m diameter, 10 m high, five niches), journey vestibule (6 x 8 x 4.5 m), chapter gallery (8 x 12 x 4.5 m, enfilade doorways), media room, and **reconstructed place** (built per room from its basis photos: dimensions, furniture and objects visible in the photo only; nothing invented; unseen areas left neutral and labeled; 360 look-around and stored camera viewpoints).
- 3D artifacts: documents and letters become generated paper meshes textured with the original scan (front/back), viewable in 360 in the panel with `<model-viewer>`; objects without scans become labeled reconstructions; every 3D artifact links to its original.
- Exhibit types: framed document, framed photograph, vitrine object, plinth object (3D), wall quote, portrait niche, media screen. Fixed mounting heights per Smithsonian guidelines (label centre 1.37 m, cases at or below 0.915 m).
- Materials: warm-grey plaster shell, oak floor, one dark accent wall colour per chapter; Poly Haven CC0 textures at 512 px, KTX2.
- Lighting: neutral tone mapping, RoomEnvironment at low intensity, at most 4 spotlights and 1 shadow, baked light pools, no post-processing on phones, pixel ratio cap 2.
- Budget per room (phone): 80 draw calls or fewer, 150k triangles, 24 MB texture memory, 2.5 MB download. One room loaded at a time.
- A build check rejects layouts that break heights, slots, budgets or licences.

### 4.3 Avatars and voices
- Living painted portrait: painted from a verified PD photo by our filter; depth-parallax, breathing, light sweep; no mouth movement; static under reduced motion.
- Quotes in the inductee's own distinct, non-cloned Kokoro voice, labeled "AI-generated voice, not [Name]'s voice. Words: [Name], [source, date]"; real recordings replace it where cleared (Einstein 1945 VOA, Naismith 1939, Albright federal remarks).
- Guide: voice + painted emblem; narrates chapters.

## 5. Accessibility and performance
- WCAG 2.2 AA: keyboard path to every exhibit (numbered list mirrors the 3D scene), focus trap and return in panels, 24 px targets, captions and transcripts for all audio, reduced motion disables camera flights and portrait motion, real alt text, no text conveyed only inside the canvas.
- Lite mode by capability probe (WebGL2 context success), reduced-motion preference, or toggle; same content.
- HTML poster is the LCP element; 3D loads after; one room in memory.
- No trackers by default; optional cookie-free analytics at IHH's choice.

## 6. Delivery
- Vercel static deployment of site/dist; same folder runs on any static host.
- WordPress package per inductee (paste-ready blocks with citations) plus an embed teaser (oEmbed) with "Open the full experience" link; real WordPress embed test before relying on it.
- Fact log exports (CSV + JSON-LD) for IHH's chatbot.
- Handoff: README for IHH, static zip, pipeline skill for future inductees.

## 7. Testing and gates
- Pipeline gates (existing) on all facts and media; content check on all experience text.
- Unit tests for content check, reveal timeline, layout validator (TDD).
- Playwright smoke tests per page (desktop + mobile viewport), axe accessibility scan, Lite mode test, reduced-motion test.
- Real-device checks: iPhone Safari, Android Chrome, a low-end laptop; VoiceOver and NVDA on the Einstein slice before fan-out.
- Codex cross-model review before any push; push to branch + PR only.

## 8. Foundation sub-project (this spec's build scope)
Build in this order (days 1-4):
1. Astro site skeleton, routes, layout, design tokens (UI UX Pro Max rules), Lite page template.
2. Museum kit: chapter gallery and reconstructed-place room types, materials, lighting, exhibit types (framed document, framed photo, wall quote, 360 document object), camera flights, numbered reveal list, side panel/bottom sheet with 360 artifact viewer, reconstruction note and "See the original" link.
3. Content check and audio build tools (TDD).
4. Einstein vertical slice: journey map + one chapter gallery + one reconstructed place (e.g. his Bern patent office or Princeton study, chosen from verified basis photos) from verified Einstein facts, with a 360 letter artifact (his 1939 letter to Roosevelt), his living portrait with one real quote, quiz, Lite page, WordPress export.
5. Device and screen-reader test of the slice; fix; then fan out.

## 9. Tracks after the foundation (short specs at day 4)
- Track A: chapters for all five (content authoring from verified facts, audio).
- Track B: remaining galleries (3-4 per inductee) assembled from the kit.
- Track C: entrance hall (rotunda) — quality gate runs as soon as it is ready, no later than 2026-10-26.
- Track D: WordPress packages, teacher kit, chatbot export, handoff docs.
Integration and QA 2026-10-27 to 10-30; submission 2026-10-31.

## 10. Risks
- Pipeline completeness for Muir, Lamarr, Albright, Naismith (runs resuming now).
- Realistic rooms on low-end phones (budgets unproven on devices).
- Rights: Lamarr photo, recordings clearance; label text needs IHH sign-off.
- Review load on the user; disk space (keep >2 GB free).
- IHH questions outstanding (docs/research/direction/SYNTHESIS.md section 5; list sent to user 2026-10-09).
