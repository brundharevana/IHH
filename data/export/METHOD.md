# How this data was collected and verified (tour research pass 2026-10-15, owner-decision pass 2026-10-17, site package 2026-10-24)

For the IHH team and for IHH's AI chatbot. Machine-readable log: `provenance.jsonld` and the CSVs in this folder (every fact, source, media item and search, with review state). What the tour itself shows and says (rooms, photo rooms, gallery cases, recreations, every spoken line and every record a visitor can open) is in `site-provenance.jsonld`; `ROOMS-INDEX.md` is its plain-language index. Full contract: `docs/pipeline/SPEC.md`; plain-language guide: `docs/pipeline/README.md`.

## Method, in seven steps
1. **Search.** Each search (tool, query, date, results, what it produced) is logged in `searches.jsonl` the same day.
2. **Snapshot.** Each source page is saved as fetched (text + sha256 + fetch date) in `snapshots/`, so every claim can be re-checked against the exact text.
3. **Extract.** A claim restates a verbatim quote from one snapshot and adds nothing; place and date words must come from that source.
4. **Gates.** Deterministic checks: quote present in the snapshot, whole-claim coverage per source, authority registry (which publishers count as primary or institutional), independence of sources, live re-check of the URL.
5. **Adversary.** An independent model from a different vendor (OpenAI Codex) judges each claim against the same evidence. Disagreement becomes `disputed` and goes to a person.
6. **Status.** Computed by a tool, never by a model: `verified` = its primary document, or 2+ independent sources incl. 1 primary/institutional, each covering the whole claim. Otherwise `single-source`, `conflicting` or `disputed`.
7. **Human review.** Only verified facts approved by a reviewer appear on the site or in the guide's lines; each links to its source.

## Counts after the owner-decision pass (2026-10-17)
Registry additions approved 2026-10-16 (JFK, FDR and DocsTeach counted as the National Archives; DCB, Kansas Historical Society, McGill, Parks Canada, Wellesley, Miller Center, GHDI, Wisconsin Historical Society, UW-Madison Libraries, Historic Environment Scotland, Jewish Museum Vienna, Leo Baeck Institute, the Springfield College CONTENTdm records; Wien Geschichte Wiki as supporting-only), Chronicling America newspaper pages typed primary, NARA page-transcription and USPTO full-text adapters, basis-photo records for place photos, and date conflicts ruled by primary records (CONFLICTS.md per inductee).

| Inductee | verified | single-source | disputed | conflicting | rejected | basis photos | sources | searches logged | method + gaps |
|---|---|---|---|---|---|---|---|---|---|
| einstein | 62 | 61 | 3 | 1 | 10 | 6 | 106 | 249 | [TOUR-RESEARCH.md](../inductees/einstein/TOUR-RESEARCH.md), [CONFLICTS.md](../inductees/einstein/CONFLICTS.md) |
| lamarr | 34 | 56 | 9 | 0 | 1 | 5 | 57 | 268 | [TOUR-RESEARCH.md](../inductees/lamarr/TOUR-RESEARCH.md), [CONFLICTS.md](../inductees/lamarr/CONFLICTS.md) |
| muir | 43 | 77 | 10 | 1 | 10 | 16 | 101 | 206 | [TOUR-RESEARCH.md](../inductees/muir/TOUR-RESEARCH.md), [CONFLICTS.md](../inductees/muir/CONFLICTS.md) |
| albright | 71 | 96 | 25 | 0 | 3 | 5 | 124 | 321 | [TOUR-RESEARCH.md](../inductees/albright/TOUR-RESEARCH.md) |
| naismith | 35 | 72 | 12 | 0 | 5 | 10 | 89 | 276 | [TOUR-RESEARCH.md](../inductees/naismith/TOUR-RESEARCH.md), [CONFLICTS.md](../inductees/naismith/CONFLICTS.md) |

Before this pass (2026-10-15): verified 52 / 25 / 43 / 71 / 29 (Einstein, Lamarr, Muir, Albright, Naismith). Basis photos are media records with `record_kind` basis-photo (place photos used only to rebuild a stop; not judged as showing the inductee; reference only unless the holder's licence allows embedding).

## Counts at the site-package export (2026-10-24)

Facts and media in the store (preview export, `export.py --all --preview`; `validate.py --all` passes):

| Inductee | verified | single-source | disputed | conflicting | rejected | basis photos | media | sources | searches logged |
|---|---|---|---|---|---|---|---|---|---|
| einstein | 69 | 68 | 5 | 2 | 10 | 17 | 76 | 128 | 324 |
| lamarr | 43 | 56 | 9 | 0 | 2 | 7 | 30 | 62 | 307 |
| muir | 50 | 78 | 10 | 1 | 10 | 40 | 90 | 132 | 251 |
| albright | 77 | 97 | 25 | 0 | 4 | 31 | 89 | 154 | 386 |
| naismith | 38 | 72 | 14 | 0 | 5 | 25 | 66 | 108 | 345 |

The tour (`site-provenance.jsonld`, written by `app/scripts/export_site_provenance.py` in the app repository):

| | Count |
|---|---|
| Chapters | 37 |
| Recreated rooms shown | 22 |
| Photo rooms | 7 |
| Gallery cases | 8 |
| Labelled object recreations | 4 (Einstein's pipe, Naismith's peach basket and ball, the record mechanism of Lamarr and Antheil's patent) |
| Rooms built, not shown | 5, plus 1 place where no room was built |
| Spoken lines mapped | 197 (95 fact lines, 37 chapter openings, 65 room notes), citing 146 facts |
| Wayfinding lines of the guide | 558 (no claim about an inductee) |
| Records a visitor can open | 65 (1 of them link-only) |
| Basis items and modelling references listed for rooms and recreations | 57 and 23 (the counts in `site-provenance.jsonld`, `ihh:counts`, are the current ones) |
| Modelled objects whose photograph could not be tied to one item | 28 parts of Seen cells, given in their own words with `ihh:unresolved` |

## How the rooms and recreations were sourced

- **One room per chapter, from photographs of that place.** For each chapter the research names the place from a verified fact (`ROOMS.md` per inductee). We then searched archives for photographs of that place at about that date and logged each one as a media record with `record_kind` basis-photo.
- **Only what the photographs show is modelled.** Each room folder (`assets-src/<room>/` in the app repository) has a `SOURCES.md` (every photograph, drawing or text used, with holder, identifier and the holder's rights words) and an `INVENTORY.md` (every modelled object, the photograph or frame it is seen in, and what is estimated). Walls or objects no photograph shows are left plain, and the inventory says so.
- **Basis or reference.** A cleared photograph (public domain, CC0, CC BY) may supply textures and may be shown in the tour. A photograph without cleared rights is a modelling reference: the room is modelled from it, and every surface is drawn or generated, with no pixel of it in the room, the tour or this package.
- **Third-party textures** are CC0 (Poly Haven and similar), listed in each `SOURCES.md` and in `app/CREDITS.md`.
- **Photo rooms.** Where a full rebuild could not be convincing (one frame from one spot, an aerial view, a crowd that fills the frame), the chapter projects the photograph itself onto simple shapes from a camera solved by hand. The depth is an estimate, and the chapter's note says so. The reason is in the folder's `DECISION.md`.
- **Gallery cases.** Where no verified fact names a place, or no photograph of it is on file, the chapter is shown in an IHH gallery with its records. The gallery is not a recreation of a real room.
- **Object recreations.** An object whose original is lost, or that can only be shown as a model, is a labelled 3D recreation. The label says what it is based on: reference photographs (the pipe), the patent drawings (the mechanism), or nothing (the peach basket and the ball are generic period objects; no photograph of them exists).

## Rights, in plain words

- **Which licences are shown.** The tour shows a photograph or document only when its media record is verified and the holder's own words make it public domain, CC0 or CC BY (`app/scripts/build_fact_index.py`, CLEARED). CC BY-SA is not shown in the tour. The WordPress package of this repository may also embed CC BY-SA (`tools/ihh/rights.py`, EMBEDDABLE; see the next section). Everything else is a link to the holder, or, for a place photograph, a modelling reference.
- **Room textures on the owner's rulings.** The Oval Office of April 1993 takes texture crops from frames of NARA roll WHPO-P02724 that have no media record of their own: the owner ruled on 2026-10-24 that every frame of the roll inherits the roll's federal public-domain status (`ihh:inheritsRecord` ALB-M-0088, `ihh:ownerRuling`). The Wien Museum postcard LAM-M-0029 (CC0, holder's statement) textures the Vienna cemetery room by the owner's ruling of 2026-10-24.
- **One exception, on the owner's ruling.** ALB-M-0055 (the typed memorandum for the President from the Secretary of State) is shown although its media record is disputed: the owner ruled on 2026-10-22 that it is an official federal record (public domain). The package marks it (`ihh:shownWhileNotVerified`, `ihh:ownerRuling`).
- **Reference only, per row.** A photograph is a modelling reference when its own SOURCES.md row says reference only or rights-restricted, or when its media record is not public domain, CC0 or CC BY, whatever the section heading says (for example KU-1907 at Robinson Gymnasium, the Smithsonian pipe record EIN-M-0060, and the HABS record MUI-M-0015, whose record-level licence is unknown). A SOURCES.md row that names no media id but is an item of a store record (its page belongs to that record) takes the record's licence class. A row that names the item's own media record keeps that record's licence class (`ihh:rightsLevel` "item", with `ihh:partOfRecord` naming the bundled record). Owner ruling 2026-10-26: within HABS record MUI-M-0015, photograph 13 (Jack E. Boucher, a National Park Service staff photographer, October 1960) and the survey sheets are public domain as federal work, and the bundled 1900 and c. 1920 recopies stay modelling-only. So the Martinez study's photograph 13 (MUI-M-0050) and sheets 3, 8, 13, 4 and 0 (MUI-M-0053, MUI-M-0091, MUI-M-0054, MUI-M-0092, MUI-M-0093) are basis items, the recopies MUI-M-0045 and MUI-M-0046 are modelling references, and the room's wallpaper tile is cut from photograph 13 (`ihh:texturesFrom`); MUI-M-0015 itself stays `unknown`. This replaces the controller ruling of 2026-10-24 (record-level reading), under which the wallpaper had been redrawn.
- A modelling reference keeps its rights status in the package (for example the McCord Stewart Museum halftones, the Göteborgs stadsmuseum photograph, the Dunbar photograph whose photographer is unknown, and the National Archives Record Group 242 photographs of Berlin 1936, which are seized foreign records: "Unrestricted" there is an access note, not a copyright clearance). Its pixels are not in this package. Two checks keep them out of the tour: the content gate (`app/scripts/check_content.mjs`) stops the build if a viewer record or photo room names a record that is not verified and cleared, and the texture gate (`app/scripts/check_textures.py`, in the same prebuild chain) stops it if a room's declared texture sources include such a record, if any image the site ships is undeclared, or if a shipped model's embedded images are not byte-for-byte the ones recorded when it was finalized. Every standalone image (record images, thumbnails, photo rooms) is recorded with its hash, its declared source, the hash of the file it was made from and how it was made; every model with the hashes of its embedded images and of the scripts and inputs that built it, so nothing changes without failing the build. Only six standalone images (the two earth textures, the landing portrait and three wall textures) are verified from source to output: they are byte copies of their source files, which the build checks. The other 176 (record images, thumbnails, photo-room photographs, plates and masks) are hash-pinned at both ends, not regenerated, so the record does not prove they were made from their sources (`proof` in `assets-src/app-public/images.json`; app/README.md lists them). A record already made cannot be replaced without an explicit re-baseline with a stated reason, logged in `assets-src/app-public/record-log.jsonl`. The gate cannot tie baked pixels to a photograph from the bytes alone (every room's images are baked atlases re-encoded to WebP, for every room; app/README.md lists them), so that link rests on each room's declaration, SOURCES.md and build scripts. Each room folder declares its texture sources in `meta.json` (`texturesFrom`; the package carries them as `ihh:texturesFrom` and `ihh:pixelsShown` true), and every record its `SOURCES.md` names must be declared either a texture source or not one. The exporter also stops if a modelling reference is shown or textures a room.
- Works that appear inside a photograph (paintings on a wall, a mural) whose rights are not cleared are blurred to tonal impressions in the room. Each room's `SOURCES.md` lists them.
- The private-writings rule below applies to records a visitor can open.
- These are the project's working rules, not legal advice.

## Honesty rules

- **Labels say what the photograph shows.** A room or photo-room label names the photograph and its date. When the photograph shows another day, another occasion or another building than the chapter's (the Battery in 1933 on another day, the Oval Office in April 1993 for a 1997 chapter, a lecture hall in Gothenburg where only the city is confirmed), the label says so.
- **Numbers on screen are grounded; other words are reviewed.** The build (`app/src/tour/data/displayedNumbers.js`) reads every number and date on chapter titles and years, room labels (including the ones stored in a room's desktop and phone models), place notes, panels, stop names, map places, record cards (with their pages' and photographs' labels and model notes) and the landing's portraits and turning points. Each must be stated, with the same value, unit, (for a day) month and (for a count or measurement) subject, the word it counts or measures, in one clause of a verified fact that copy cites or of a verified, cleared record the copy itself cites, and that clause must contain every content word within four words of the number in the copy; or it must be a year or day that a cited record gives as its own date (its title, alt text, credit or the holder's date field). Records are never pooled, and a modelling reference grounds nothing. Catalogue numbers count as identifiers only in their holders' exact forms. The check is lexical: it cannot tell whether copy uses a cited record's own date for the record or for something else, and it reads number words only up to twenty, the tens, hundred and thousand. The non-numeric words of that copy are not checked against the facts by code: they rest on per-inductee tests that pin each label and on review (the limit of this release).
- **Modelling estimates are never stated as facts.** Sizes, positions and colours that a photograph does not give are marked as estimates or interpretive in `INVENTORY.md`. A room note may say what the model shows; it may not state an estimate as a measurement of the real place.
- **Spoken lines.** Every line the guide says about an inductee is the text of a verified fact, with its id (`citation` in `site-provenance.jsonld`). Room notes rest on the room's `INVENTORY.md` (`ihh:basis`). Wayfinding lines make no claim.
- **Single-source facts are neither shown nor spoken.**

## Room ratio

22 of 37 chapters (59.5%) are recreated rooms.

| Inductee | Chapters | Room | Photo room | Gallery | Room share |
|---|---|---|---|---|---|
| Albert Einstein | 8 | 4 | 2 | 2 | 50.0% |
| James Naismith | 7 | 5 | 0 | 2 | 71.4% |
| John Muir | 7 | 5 | 2 | 0 | 71.4% |
| Madeleine Albright | 8 | 5 | 2 | 1 | 62.5% |
| Hedy Lamarr | 7 | 3 | 1 | 3 | 42.9% |

Why each chapter that is not a room fell back:

| Chapter | Shown as | Reason |
|---|---|---|
| Einstein, birth (Ulm) | photo room | The subject is the distant city; a yard at eye level would hide it (`einstein-ulm/DECISION.md`). |
| Einstein, leaving | gallery | No verified fact names the place. |
| Einstein, arriving (the Battery) | photo room | A crowd and a bus fill the frame; the background cannot be read (`einstein-battery-1933/DECISION.md`). |
| Einstein, history (the letter to Roosevelt) | gallery | No photograph of the Nassau Point cottage, road or shore exists to model from, and the place fact did not verify (`einstein-nassau-point/DECISION.md`). |
| Naismith, history (Berlin 1936) | gallery | The place fact NAI-F-0126 is disputed. The Berlin court is built from three NARA Record Group 242 photographs used as reference only, and is not wired until the fact verifies. |
| Naismith, legacy (Lawrence 1939) | gallery | No photograph of the place is on file. |
| Muir, arriving (Fountain Lake) | photo room | The rebuild read as a placeholder; the 1923 photograph projected reads as the place (`muir-fountain-lake/DECISION.md`). |
| Muir, history (Glacier Point) | photo room | Every photograph is one frame from one spot (`muir-glacier-point-1903/DECISION.md`). |
| Albright, birth (Prague) | photo room | One 1024 px stereograph card, about 400 px per image (`albright-prague-old-town/DECISION.md`). |
| Albright, history (Truman Library) | photo room | The frames show an interview backdrop, not the room (`albright-truman-library-1999/DECISION.md`). |
| Albright, legacy | gallery | No photograph of a place is on file. |
| Lamarr, arriving (the Normandie) | photo room | An aerial view at 2.4 px per metre; nothing at deck level (`lamarr-normandie-harbor/DECISION.md`). |
| Lamarr, big work (the invention) | gallery | No photograph of 11805 Bellagio Road is on file. |
| Lamarr, history | gallery | No verified fact names the place; the newsreels are link-only. |
| Lamarr, honoured | gallery | No verified fact names a place. |

Built, not shown: the London shelter (no verified fact places Albright in London), Old Hall at McGill (no source places Naismith there), the Berlin 1936 court (place fact disputed), and the Fountain Lake and Glacier Point rebuilds (set aside for photo rooms). Reasons and files: `ROOMS-INDEX.md`.

Owner decision 2026-10-24: the media record ALB-M-0087 (frame 08 of the April 1993 roll) is rejected. The Oval Office room does not use it: its `SOURCES.md` says the frame shows another room.

## When an image or document is shown, and when it is only linked
- In the WordPress package (`export.py`) we embed an item only when it is verified and its holder's own rights words make it free to use: public domain, CC0, CC BY or CC BY-SA. The tour is stricter: public domain, CC0 or CC BY. Everything else is a link to the holder's page.
- Records made by the U.S. federal government are public domain. The National Archives marks them "Unrestricted"; the Library of Congress uses set phrases such as "No known restrictions on publication". A tool applies these phrases; nobody sets them by hand.
- **Private writings (owner rule, 2026-10-20).** A letter, petition, application, memo or similar text written by a private person or group stays theirs even when the National Archives or another public archive holds it. "Unrestricted" only means the archive lets anyone see it; it does not give away the writer's rights. We show such an item only if one of these is true:
  1. every writer died before 1956 (an unpublished text is protected for the writer's life plus 70 years), and each death year comes from a verified fact or an authority record we saved;
  2. the holder itself says the item is in the public domain;
  3. it was published before 1931.
  Otherwise we only link to it. Each media record names its writers and the source for each death year (`authorship` in `media.csv` and `media.jsonl`), and the cross-model check judges the same rule. Facts we took from a transcription of a linked-only item stay: facts are not copyright.
- Outcomes of the 2026-10-20 pass: Einstein's letters to Lt. Stephen Brunauer and his 1947 Emergency Committee letters are shown (Einstein died in 1955); the 1939 Einstein letter to President Roosevelt is shown because the National Archives' DocsTeach page states it is public domain (Leo Szilard and Alexander Sachs also worked on it); John Muir's 1903 passport application is shown (Muir died in 1914); the 1913 Hetch Hetchy petition is link-only (not every signer's death year is sourced); Hedy Lamarr's M-92 property file is link-only (private and non-U.S. letters, no sourced death years).
- These are the project's working rules, not legal advice.

Each TOUR-RESEARCH.md has a "method" section narrating the queries, archives, adversary results and the gaps left open for a person to decide.
