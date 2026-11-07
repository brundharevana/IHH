# Voices of Arrival, revamp: the turning-points museum (design)

Date: 2026-10-22. Branch: `revamp/mockups` (app), `revamp/facts` (verified data). Deadline: 2026-11-01.
Owner decisions behind this spec: `Challenge IHH/docs/handoff/DECISIONS.md`, entries 2026-10-14 to 2026-10-22.
Feedback rounds already applied in the mockups: `docs/revamp/feedback-round5.md`, `feedback-round6.md`.

## 1. Purpose and success

A single-page, immersive virtual museum for the Immigrant Hall of Honor (IHH). A visitor walks through the
lives of five immigrant inductees (Albert Einstein, Hedy Lamarr, John Muir, Madeleine Albright, James
Naismith) as a sequence of turning points, each told by a 3D guide, in rebuilt period rooms holding real,
rights-cleared documents and objects. Every spoken or written fact is verified and cited.

Success means:
- A visitor can complete any inductee's tour on desktop and phone without instructions.
- Every visible or spoken claim traces to a verified fact; every image is rights-cleared or link-only.
- 70-80% of each inductee's rooms are strong full rebuilds; the rest are photo rooms first, and gallery cases only where no usable photo of the place exists.
- The site is deployed to a new Vercel preview URL; v1 (voices-of-arrival.vercel.app) is untouched.
- IHH receives the provenance log and method note for its chatbot.

Out of scope for 2026-11-01: real visitor counts and live LLM chat. After the submission: the automated
tour-research pipeline step (codifies the proven Einstein workflow, per DECISIONS 2026-10-16) in the week of
2026-11-02, then the standalone API-key runner (docs/pipeline/STANDALONE.md; needs IHH's own Anthropic API key).

## 2. Experience

### 2.1 Landing
- Doors entrance: a scroll-driven 3D grand entrance (GSAP ScrollTrigger + R3F); one button, "Walk their journeys".
- Inductee scroll: one inductee per screen, real portrait (or a labelled "portrait pending rights" silhouette),
  name in Fraunces. Around the portrait sit that inductee's turning points as small framed objects;
  opening one hides the others; X or Esc closes it. "Tour from here" starts the tour at that chapter.
- The guide panel offers a tour in varied wording ("This is Albert Einstein. Would you like me to walk you through his story?").
- Transition into the tour is one choreographed scene change on the same page (no reload; deep-linkable URL).

### 2.2 The tour = turning-point chapters
Chapter kinds (a chapter exists only where verified facts exist; never filled):
1. Birth and birthplace
2. Education before the US
3. Leaving home, and why (the reason only where a source states it)
4. Arriving in the US
5. First work in the US
6. Becoming a citizen
7. The big work
8. Part of history (a movement or event)
9. Why the Hall honours them (recognitions; e.g. Einstein's 1921 Nobel Prize)
10. Death and legacy

The kinds are labels (Moments That Made Them groups by them). The tour plays its chapters in time order:
by each chapter's year, stated by one of its own verified facts (`year`, `yearFact`), so the story never steps
back; chapters of the same year follow the kind order above (owner decision 2026-10-27; `app/src/tour/data/chapters.js`
inTimeOrder, checked by validateTour). Einstein: birth 1879, the Nobel Prize 1921, leaving and arriving 1933,
the letter to the President 1939, citizenship 1940, the Navy work 1943, his home until 1955.

Each chapter: map leg (globe-to-map "unroll" style; transport icon only where the mode is a verified fact)
-> the chapter's place -> spoken opening line -> the chapter's objects -> next chapter. Nothing animates or
plays until "Begin the tour".

### 2.3 Places: three tiers
| Tier | What it is | When used |
|---|---|---|
| Full rebuild | Blender-modelled, photo-matched, baked-light room; desktop free walk (WASD, click-to-walk, drag-look), phone 360 look + hotspot glides | Target 70-80% of each inductee's rooms |
| Photo room | The real period photo projected onto estimated 3D proxies; modest look-around with parallax | Where a strong rebuild is not possible (≤20-30%) |
| Gallery case | A calm IHH gallery: lit case, wall panel of verified lines, free walking | Last resort: chapters with no usable photo of the place (photo room always preferred when a usable photo exists) |

Labels state exactly what the source photo shows (e.g. "The Battery, 1933 — the photograph shows a different occasion"),
never that the inductee stood in a spot unless a verified fact says so. Room plan per inductee:
`IHH-facts/data/inductees/<slug>/ROOMS.md`; build progress: `assets-src/_queue/PROGRESS.md`.

### 2.4 Objects (artifacts)
- Real scans and photos only, rights-cleared from the holder; link-only otherwise.
- Viewer kinds: letter (unfold, page), sheet (turn), document (page-through), photo (zoom), photoset (turntable),
  model (glTF 360 with pinned notes), series (e.g. Einstein's 9 Brunauer letters with a date picker).
- Each opens with an object card: title, maker, date, 2-4 verified lines with fact ids, holder, catalogue id,
  rights, "View at the holder" link, optional narration.
- Labelled 3D recreations (approved): Lamarr's frequency-hopping mechanism (from the PD patent drawings),
  Naismith's peach basket and ball, Einstein's pipe (no history told until corroborated). Not recreated:
  Albright's brooches (shown via federal photos of her wearing pins; brooch pages link-only).

### 2.5 The guide
- Three Rocketbox guides (MIT), one picked at random per visitor and kept (localStorage, try/catch).
- Mocap idle/talk/present/nod, viseme lip-sync, head turns to the focused object; one fixed spot per room,
  visible beside (never in front of) objects; the camera never focuses on her.
- Voice: Kokoro-82M, one voice per guide (af_heart, af_bella, am_michael), whole sentences, labelled
  "Guide · AI voice" in the caption. Speech normaliser: human years (alternating "eighteen eighty-one" /
  "eighteen hundred eighty-one"), "US" without a pause, abbreviations spoken in full.
- Narration: name once then pronouns, varied openings, no stock phrases; facts' content words, dates and
  numbers unchanged (gate: `check_narration.py`). Each chapter opens with a line in the approved style:
  place + date, one human detail, an invitation to look around, written as a human sentence, never a
  dateline (owner feedback round 8: "Albert Einstein was born in Ulm, Germany, on 14 March 1879.", not
  "Ulm, Germany, 14 March 1879. Albert Einstein was born here."; `narration.test.js`). A bare street address
  is said as one ("the address 2 Library Place"). No stop is architecture only, and a stop's lines are about
  what it shows; several records of one moment are one stop (a photograph series).

### 2.6 HUD (same on every chapter)
Top-left title block (name; chapter · place; "More" for the recreation/basis note). Top-right: End tour and a
round icon-only sound toggle (M key). Bottom centre: numbered stops (Tapestry style; keys 1-9). Controls hint
shown once per chapter with the opening line, 5-10 s. Bottom right: "Hear this chapter".

### 2.7 "Moments That Made Them"
A timeline of every turning point across all five inductees, filterable by type (e.g. "Becoming a citizen"
shows them side by side), with a shuffle; opens any chapter directly. The word "constellations" is not used.

## 3. Architecture

- App: Vite + React 19 + @react-three/fiber 9 + drei, GSAP (+ScrollTrigger), Motion, camera-controls,
  three-globe. Entries: `index.html` (landing), `tour.html` (tour), dev-only `avatars.html`.
- Data: `app/src/tour/data/<slug>.js` describes chapters (facts, map leg, place tier, room id, stops,
  objects); `artifacts.js` / per-inductee artifact files describe viewer records; shapes documented in
  `app/src/tour/data/README.md`. Generated from `IHH-facts` data by build scripts (only verified facts,
  only cleared media; link-only media never display images).
- Rooms: `app/public/models/<room-id>/` (glb desktop + mobile, nodes.json, bounds.json); built by
  `assets-src/<room-id>/build_room.py` through the shared Blender lock; exporter writes baked light as COLOR_0.
- Audio: `assets-src/audio/build_guide_audio.py` renders every line for the three voices with WebVTT.
- Verified data: `IHH-facts` (`revamp/facts`) — facts/sources/media/searches JSONL, gates, Codex adversary,
  rights rules (incl. private writings 3.4.3, basis photos 3.4.2), provenance export + METHOD.md for IHH.

## 4. Integrity rules (non-negotiable)
- Only `verified` facts appear or are spoken; unresolved conflicts are omitted (e.g. Mercer St purchase year).
- A primary record decides a date; otherwise the detail is omitted.
- Rights from the holder; private writings shown only if every author died before 1956, the holder states
  public domain, or published before 1931; restricted photos are modelling reference only, never shown.
- Rooms model only what photos show; labels say what the photo shows.

## 5. Quality, accessibility, performance
- Phone layout at 390 px with no horizontal scroll; reduced motion = cuts; keyboard reachable; screen-reader
  labels and live captions; WCAG audio control via the sound toggle.
- Per room ≤10 MB desktop / ≤5 MB phone; lazy-load per chapter; DPR cap 1.5 on phones.
- Automated checks: build, eslint 0 errors, camcheck (every focus in every room), narration gate, content
  check (verified-only), headless screenshots per chapter. Cross-model review before deploy.

## 6. Delivery
- Deploy the built app to a NEW Vercel project (preview URL); v1 stays as is.
- WordPress: an iframe embed with a fullscreen button; WordPress.com plans that strip iframes get an
  "Open the museum" link card.
- IHH package: provenance export (JSON-LD + CSV), METHOD.md, per-inductee TOUR-RESEARCH/ARTIFACTS/ROOMS notes.

## 7. Risks
| Risk | Mitigation |
|---|---|
| 10 days for ~22 new rooms + restructure | Two room workers with a shared Blender lock running overnight; photo-room fallback per quality gate |
| 8 GB machine resets under load | One Blender process at a time; niced builds; at most two heavy agents |
| Archive bot blocks (LoC, LAC, NLS) | Polite rate limits; never bypass; leads logged for later |
| Lamarr has few verifiable places | Honest gallery cases + the patent mechanism model; no invented rooms |
