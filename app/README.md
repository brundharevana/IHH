# Immigrant Hall of Honor: turning-points museum (app)

A virtual museum for the Immigrant Hall of Honor. Three pages, built with Vite, React and three.js:

- `index.html`: the landing. The entrance, the inductee hall and Moments That Made Them.
- `tour.html`: the guided tour. Five inductees (Einstein, Naismith, Muir, Albright, Lamarr), 37
  chapters. Each chapter is a map leg (where one is verified) and a place: a room rebuilt from
  photographs, a photo room (the photograph projected on simple shapes) or an IHH gallery case. A
  pre-rendered guide voice narrates verified facts only.
- `embed.html`: the WordPress embed (poster, Start, fullscreen). See `../docs/revamp/wordpress-embed.md`.

Every fact shown or spoken is a verified record of the facts store in `../data/inductees/` (merged
from the `revamp/facts` branch); every image is a verified record whose holder's words make it
public domain, CC0 or CC BY, or one the owner ruled on. Sources and licences of every file:
`CREDITS.md`. The provenance package for IHH's chatbot: `../data/export/site-provenance.jsonld`
(written by `scripts/export_site_provenance.py`).

## Run it

Node 20 and Python 3.12 (the gates are Python and Node scripts).

```sh
cd app
npm ci
npm run dev          # http://localhost:5173 (landing), /tour.html, /embed.html
```

Useful tour links (dev and production): `tour.html?inductee=muir&chapter=big-work`,
`tour.html?view=moments`, `tour.html?viewer=EIN-M-0025`. The dev server alone also serves the test
tour `?inductee=lamarr-demo`, the tier demo `?demo=photo-room|gallery-case`, the viewer test records
and `avatars.html`; the production build has none of them.

## Build and gates

`npm run build` runs, in order, and stops at the first failure:

| Step | Script | Fails when |
|---|---|---|
| prebuild | `scripts/build_fact_index.py --check` | `src/tour/data/facts.generated.json` differs from a fresh build of `../data/inductees/` (run `python3 scripts/build_fact_index.py` after a store change and commit the result) |
| prebuild | `scripts/check_content.mjs` | tour, landing, artifact or narration data names a fact that is not verified, or a media record that is not verified and cleared; a link-only record that is neither verified nor owner-ruled |
| prebuild | `scripts/check_textures.py` | a texture declaration (`../assets-src/<folder>/meta.json`, `texturesFrom`) names a record that is not verified and cleared, or not owner-ruled; any glb or image under `public/` is not declared (or named for a cleared record); a record named in a room's SOURCES.md is not classed; a shipped glb's embedded images are not byte-for-byte the ones recorded at finalize (`embeddedImages`) |
| prebuild | `../assets-src/audio/check_narration.py --quiet` | a narration line, opening, room note, `speak` override or wayfinding line says more than its verified facts or inventory (the one word "address" may stand before a street address its source states); a record line (the guide narrating the record a stop shows) says more than that record's card and its cited verified facts (a photograph series: its photographs' own cards); a linking time phrase ("a decade later", "that year") lacks both of its dates among the cited ones, or a span is not the gap between two of them |
| prebuild | `../assets-src/audio/build_guide_audio.py --check` | a clip is missing, or its audio, caption file or fact ids are stale against the current lines |
| prebuild | `vitest run src/tour/data` | a stop is silent, a stop is made of room notes only (owner feedback round 8), a fact line at a stop that shows a record cites no fact that record supports (its card, its basis-photo facts or its own source; a labelled panel tells its own facts), a record a stop shows has no record line naming it, a room has more than two room notes or more than one arrival line, an opening is a dateline (its first sentence does not name or speak of the inductee), a narration line is spoken nowhere, or a chapter's dated lines do not run forward in time in play order (`narration.test.js`, `storyOrder.js`); a tour breaks the data rules: chapters out of time order (by each chapter's `year`, stated by its own verified `yearFact`; a tie keeps the kind order), unverified facts, photo rooms cleared, a map leg whose segments lack a verified fact stating that city-to-city journey (and any drawn mode) (`chapters.js` validateTour), or a number shown on a label (including the label read from a room's glb and a room's fallback label), place note, panel, stop, map place, record card or model note that is not stated, in a matching context and unit, by the facts and the verified, cleared record that piece of copy cites (`displayedNumbers.js`; a modelling reference grounds nothing) |
| build | `vite build` | |
| postbuild | `scripts/check_budgets.mjs` | a room glb over 10 MB (phone 5 MB), or a page's initial JS over 600 KB gzip |
| postbuild | `scripts/check_dist.mjs` | the build carries a dev-only page, chunk, tour or test record |

### What the content gates prove, and what they do not

They prove that every fact and media id the tour names is verified (and cleared, or owner-ruled) and
that every spoken line passes the narration gate.

The number gate (`src/tour/data/displayedNumbers.js`, its test run in prebuild) reads every number
and date on: chapter titles, years and place labels; room titles and labels (the data's `labelText`,
else the label stored in the room's desktop glb and the one in its phone glb); place notes, panels,
stop names and map places; record cards with their date, model notes and the labels and alt text of
their pages and photographs; and on the landing, each portrait's alt text, credit and rights words and
each turning point's label, year, claim and record caption. A number passes when:

1. one clause of a ground states the same value (1.2 m is not 2.1 m), with the same unit and, for a
   day, the same month, and for a count or measurement the same subject (the word right after the
   number and its unit, else right before it: "8 windows and 12 doors" is not grounded by "12 windows
   and 8 doors"), and that clause contains every content word within four words of the number in the
   copy ("The college was built in 1887" is not grounded by "In 1887 he entered the college").
   The grounds are the verified facts the item cites and the verified, cleared records it cites itself
   (a record card its record; a room or a stop its `records`): their title, alt text, credit, rights
   words and the holder's saved page. Nothing is pooled from other records; a modelling reference
   grounds nothing; or
2. it is a year, or a day with its month, that a record the item cites gives as its own date (in its
   title, alt text or credit, or in the holder's date field on its saved page, such as "Date ca. 1885").

Catalogue numbers in their holders' exact forms, and page labels that number a record's own pages
("Drawing sheet 2"), are not read as quantities.

What it does not prove: the check is lexical, not a reading of meaning. Under rule 2 an item that
cites a record may give that record's date without a context check, so the code cannot tell whether
the copy uses the date for the record or for something else. Number words are read only from two to
twenty, the tens, hundred and thousand. The HUD, the embed poster and other interface copy hold no
facts and are not read. The non-numeric words of labels, place notes and record cards are not checked
against the facts: a sentence such as "the room as photographed that day" is held to the facts by the
per-inductee tests (`src/tour/data/*.test.js`, which pin each label's wording) and by review, not by a
general claim check. That is the limit of this release (controller ruling, Task 19).

### What the texture gate proves, and what it does not

Standalone images (record images, landing thumbnails, photo rooms, globes, stand-in surfaces): each is
recorded in `../assets-src/app-public/images.json` with its own hash, its declared source (a cleared
record, named in its file name where it has one, or a declared third-party library), the file it was
made from with that file's hash, how it was made, and for a photo room's plate and mask the generating
script's hash. The build fails if an image is unrecorded, its bytes or its source file (where this
checkout has it) differ, or its generator changed. `python3 scripts/image_sources.py --record` writes
the record and refuses any image whose source it cannot resolve to a declared source file.

What each record proves about the step from source to image (`proof` in images.json):

| proof | images | what is verified |
|---|---|---|
| `identical` | 6: `tour/earth-2048.webp`, `landing/earth-2048.webp`, `landing/portraits/einstein.jpg`, `tour/tex/planks-color.webp`, `tour/tex/plaster-normal.webp`, `tour/tex/walnut-color.webp` | the image is a byte copy of its source file; every build checks the two hashes are equal |
| `pinned` | the other 235: every `media/*` record image, every `landing/artifacts/*` thumbnail, the cropped landing portraits (`landing/portraits/lamarr.jpg`, `muir.jpg`, `albright.jpg`, with `assets-src/landing-portraits/make_portraits.py` pinned as their generator), every photo-room photograph, plate and mask (`rooms/`, `rooms-demo/`), and `tour/letter-EIN-M-0015-p1.webp` | the image and its source file are each pinned by hash (and a photo room's generator script by its hash), so neither can change unnoticed; nothing re-runs the resize, crop, re-encode or plate generation, so the record does not prove the image was made from that source |

Re-recording cannot re-baseline silently: when an image already recorded would get other hashes,
another source, transform or generator, or would be dropped, `--record` writes nothing unless run with
`--rebaseline --reason "<why>"`, and every write is appended, with each old and new hash, to
`../assets-src/app-public/record-log.jsonl`. The same rule holds for the models' records below
(`check_textures.py --record M --rebaseline --reason "<why>"`; a room's `finalize.mjs` passes the
reason in `IHH_REBASELINE_REASON`).

Models: every glb ships exactly the images recorded for it at finalize (`embeddedImages`), and the
scripts that built it and their inputs (`ref/` downloads, `tex/` libraries and generated textures) match
the hashes recorded with them (`generator`); `finalize.mjs` records both, and `--record` refuses a folder
that declares no texture sources. The first records were taken on 2026-10-24 from the shipped files and
the current scripts, not during an actual build. What bytes cannot prove, for any room: that a baked
pixel came only from the declared sources. Every room and recreation glb carries bake outputs (lighting
baked into atlases) re-encoded to WebP by finalize, so no embedded image is byte-equal to its texture
script's outputs or to a source photograph. That covers all of them: `albright-archives-rotunda`, `albright-east-room-2012`, `albright-london-shelter`, `albright-oval-office-1993`, `albright-ss-america`, `albright-un-security-council`, `einstein-gothenburg-lecture-hall`, `einstein-mercer-street-front`, `einstein-trenton-courtroom`, `guide-candidates`, `lamarr-mgm-gate`, `lamarr-vienna-central-cemetery`, `lamarr-vienna-graben`, `muir-dunbar-high-street`, `muir-fountain-lake`, `muir-glacier-point-1903`, `muir-hetch-hetchy`, `muir-hutchings-house`, `muir-martinez-study`, `muir-north-hall`, `naismith-almonte-high-school`, `naismith-berlin-1936`, `naismith-hall-of-fame`, `naismith-mcgill-old-hall`, `naismith-presbyterian-dining-hall`, `naismith-robinson-gym`, `naismith-springfield-gym`, `study`, and `artifacts/einstein/pipe.glb`,
`artifacts/lamarr/mechanism.glb`, `artifacts/naismith/ball.glb`, `artifacts/naismith/peach-basket.glb`.
For those, the link from pixels to sources rests on the folder's declaration, its SOURCES.md and its
build and texture scripts, reviewed by people. Photo-room images (`rooms/`, `rooms-demo/`) are the
cleared photograph itself, cropped, plus its plate and mask.

The build reads `../data`, `../assets-src` and `../tools`, so build from a full checkout of this
repository, not from a copy of `app/` alone.

Other checks:

```sh
npm test                    # vitest: tour data, gates, versioned model URLs, speech, Moments, copy
npm run lint                # eslint, 0 errors
python3 -m pytest scripts ../assets-src/audio -q   # from app/: index, export, texture gate, audio, narration
sh ../scripts/disk-check.sh # before heavy work (Blender, a full e2e run)
```

Regenerated files (commit them with the change that causes them):
`npx vite-node scripts/export_chapters.mjs` (chapters, tour-use, guide ground, link-only lists),
`python3 scripts/build_fact_index.py`, and from the repository root
`python3 app/scripts/export_site_provenance.py` (the chatbot package). Guide audio:
`../assets-src/audio/build_guide_audio.py` (Kokoro models; see its docstring).

## End-to-end checks

Playwright and @axe-core/playwright are dev dependencies of the app (`npm ci` installs them; the
browsers are Playwright's, `npx playwright install chromium` once). The scripts take them from
`app/node_modules`, else from `$SITE_MODULES`. Run them one at a time (each starts its own browser;
on an 8 GB machine two at once time out).

| Script | Needs | Checks |
|---|---|---|
| `node e2e/chapters.mjs <slug>` | dev server | every chapter of one inductee: loads, stops, viewer, guide, blocked audio |
| `node e2e/camcheck.mjs <slug>` | dev server | room cameras and framing per stop |
| `node e2e/landing.mjs` | dev server | the landing, Begin gating, tour links |
| `node e2e/moments.mjs` | dev server | Moments That Made Them: layout, links, no link-only image |
| `node e2e/a11y.mjs` | dev server | axe on every page (any impact fails), keyboard walk, reduced motion, phone layout |
| `node e2e/hud-contrast.mjs` | dev server | HUD text over the brightest rooms (Oval Office, East Room), desktop and phone, settled: 4.5:1 against the pixels behind it (axe cannot see through the canvas) |
| `npm run e2e:embed` | `npm run build` | the embed in four iframe variants on another origin (see the embed doc) |

Set `BASE` to point the dev-server scripts at another address.

## Deploy notes

- Hosting: Vercel, project `ihh-turning-points` (team IHH). The live address is
  `https://YOUR-MUSEUM-URL` (placeholder until the owner names it). Deployment protection is on
  for the preview: visitors and the WordPress iframe need it lifted or a share link.
- Build locally from the repository (`npm run build` in `app/`, every gate above green), then deploy
  the built output. A deploy is an owner-approved event; never deploy from a dirty tree.
- `vercel.json` sets one header: `Cache-Control: public, max-age=31536000, immutable` on
  `/models/*`. That is safe because every model URL the app requests carries its content version
  (`?v=<hash>`, `scripts/assetVersions.mjs`), so a rebuilt room arrives under a new URL.
- No CORS headers (embed option B, owner ruling 2026-10-24). A frame sandboxed without
  `allow-same-origin` shows the poster's "Open the museum" link card instead of the tour.
- Serverless functions: none. The site is static.
