# Tour data: artifacts and chapter tours

How to plug a newly verified document or object into the tour. The research pipeline writes
`data/inductees/<slug>/media.jsonl` (and `ARTIFACTS.md`); this folder turns a verified media record
into something a visitor can open. Rules that apply to every field below:

- Visitor-facing words about an inductee are a verified fact's text, or a verbatim part of one
  (`data/inductees/<slug>/facts.jsonl`, status `verified`), with its id alongside.
- Title, holder, catalogue id, rights, credit and source URL come from the media record (status
  `verified`, `license_class` public-domain / cc0 / cc-by). Nothing else ships.
- Files: images as WebP (long side 2000-2800 px for documents, 1600 px for photos), glTF as `.glb`
  compressed with meshopt (`gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp`),
  under 8 MB. The viewer and its loaders are code-split: nothing loads until a visitor opens one.

## 1. Artifact record (`artifacts.js`, keyed by media id)

```js
'LAM-M-0001': {
  id: 'LAM-M-0001',            // media id
  slug: 'lamarr',
  kind: 'document',            // see kinds below
  title: 'Secret Communication System',   // media record title (or a verbatim part)
  maker: 'Hedy Kiesler Markey and George Antheil',  // optional, verified wording
  date: 'August 11, 1942',     // optional display date, verified wording
  year: 1942,                  // optional number, for the timeline
  holder: 'United States Patent and Trademark Office',
  catalogueId: 'US 2,292,387',
  rights: 'Public domain',     // short form of the media record's licence
  source: 'https://...',       // the holder's page for the item ("View at the holder")
  credit: '...',               // the media record's credit line, verbatim
  alt: '...',                  // the media record's alt_text
  lines: [                     // 2-4 short lines, each a verbatim part of a verified fact
    { label: 'Awarded', text: '...', factId: 'LAM-F-0012' },
  ],
  clip: narr('lamarr', 1, ['c5'], ['LAM-F-0012']),  // optional: narration the guide plays
  listen: 'Hear about this patent',                 // optional label for the listen button
  links: [{ label, href, mediaId }],                // optional: related items shown only at their
                                                    // holders ("See also"); mediaId is a LINK_ONLY record

  // media, by kind:
  pages: [{ src, back?, label?, sizeM: [w, h] }],   // letter, sheet, document
  folds: 3,                                         // letter only: 2 (half) or 3 (tri-fold)
  photos: [{ src, label: 'Front' | 'Back' | 'Detail', alt? }],   // photo, photoset
  model: {                                          // model
    src: '/artifacts/<slug>/<id>.glb',
    notes: [{ pos: [x, y, z], label: 'Engraving', text: '...', factId: 'NAI-F-0042' }],
  },
}
```

| kind | stage | visitor can |
|---|---|---|
| `letter` | one sheet folded in `folds` | unfold / fold it, drag to turn it all the way round |
| `sheet` | one sheet, `back` scan optional (plain paper otherwise) | turn it over, drag 360 |
| `document` | several `pages` | page through (buttons, arrow keys), turn each page over, drag 360 |
| `photo` | one photograph | look closer (zoom) |
| `photoset` | `photos` of one object (front, back, detail...) | step through like a turntable (drag sideways, view chips, arrow keys), zoom |
| `model` | glTF object | orbit 360, zoom (wheel / pinch), numbered notes pinned on the object, reset the view |

Every kind shows the object card: title, maker and date, the short lines with fact ids, notes
(model), Holder, Catalogue, Rights, Source link, credit, and the listen button when there is a clip.

Opening a record:
- from a room: give the room artifact `artifact: '<media id>'` (see `einstein.js`, the letter): after
  the guide's intro the viewer opens instead of the narration;
- from a URL: `tour.html?viewer=<media id>`, for a record the tours declare (`records.lock.json`,
  `viewerRoute.js`); any other id shows an error page (dev also has `test-pages`, `test-sheet`,
  `test-photoset`, `test-model` to exercise each stage with files already in the repo);
- from a chapter's stop (a room artifact), the only route into the viewer in the tour.

### Series and link-only records

- `kind: 'series'` (`EIN-SERIES-BRUNAUER`): `letters: [media ids in date order]`. One stop in the study
  room ("Letters to Lieutenant Brunauer"); the viewer pages through the records with a date picker and each record's own card.
- A photograph series (round 8: several records of one moment at one stop): `kind: 'series'`, `unit: 'photograph'`,
  `letters: [media ids]` (e.g. `EIN-SERIES-SEATED-1954`, `MUI-SERIES-GLACIER-1903`, `ALB-SERIES-CEREMONY-2016`). The
  viewer steps through the photographs (numbered chips, arrow keys, PageUp / PageDown), each with its own card; the
  room or photo room shows the first. Its one record line is grounded only in its photographs' own cards (the
  series' title and date are IHH's grouping; `check_narration.py`).
- `LINK_ONLY` (end of `artifacts.js`): media whose rights are unknown or disputed (NAI-M-0004, EIN-M-0016,
  EIN-M-0058, MUI-M-0061, LAM-M-0028, ALB-M-0054, ALB-M-0056, ALB-M-0027). Any `pages` / `photos` / `model` on these records is stripped;
  they show a neutral "Link only" tile and "View at the holder", never an image. Add an id here
  before adding its record. Each must be a verified record, or a disputed one the owner ruled link-only
  (`scripts/check_content.mjs` LINK_ONLY_RULED); the content gate fails the build otherwise.
- `thumb` (optional) overrides the first page as the thumbnail (Moments That Made Them uses it);
  `startPage` (optional, index) is the page the viewer opens on (a book whose first pages are flyleaves).

## 2. Moments That Made Them (`tour/moments/`)

Every chapter of every inductee that has a chapter tour, on one page: `tour.html?view=moments` and the
bottom-left button in the tour. Nothing is authored for it: `moments.js` `momentsIndex(INDUCTEES,
chapters.generated.json)` reads each chapter's kind, title, year and thumbnail (`thumbMediaId`, already
free of link-only and basis photos). A tour still on `steps` shows nothing until it has chapters. A
moment opens `tour.html?inductee=<slug>&chapter=<id>`. Filter chips are the chapter kinds
(`KIND_LABELS`); the placement is `layoutField` (no two cards overlap; `e2e/moments.mjs` checks it).

Einstein's records (`einstein-artifacts.js`, 16 records generated from media.jsonl, facts.jsonl and
ARTIFACTS.md, each line checked verbatim against its fact) are reached from the stops of his chapters.
Page images are WebP copies of `site/public/media/` in `app/public/media/einstein/` (long side 2000 px).

Hedy Lamarr's records (`lamarr-artifacts.js`: the patent case file and printed patent, the naturalization
file, three Los Angeles Times photographs, the two basis photographs, and the labelled mechanism
recreation `LAM-MECHANISM-RECREATION`, whose pinned notes quote LAM-F-0094 and LAM-F-0095) are reached
from the stops of her chapters; files in `app/public/media/lamarr/` and `app/public/artifacts/lamarr/`.

James Naismith's records (`naismith-artifacts.js`: the 1894 book "Basket ball" (26 pages), the two Topeka
state journal pages of 1898 and 1908, the Hall of Fame room's 2019 photograph, the link-only first-team
photograph NAI-M-0004, and the labelled recreations `NAI-PEACH-BASKET-RECREATION` (one line, NAI-F-0088) and
`NAI-BALL-RECREATION` (no lines), "Recreation; the originals were not preserved") are reached from the stops
of his chapters; the recreations stand on the Springfield gymnasium floor as room props. Files in
`app/public/media/naismith/` and `app/public/artifacts/naismith/`.

Madeleine Albright's records (`albright-artifacts.js`: six federal photographs in which she wears a pin, with
the holders' captions or verified facts only (no caption names a pin; the swearing-in photograph links to the
holder's page for the brooch, `links`, link-only ALB-M-0027), the UN contact sheet and the Angola print (front
and back), the typed memorandum ALB-M-0055 (shown by the owner's ruling, `build_fact_index.py` OWNER_RULED),
and the rooms' basis photographs) are reached from the stops of her chapters; files in
`app/public/media/albright/`, photo rooms in `app/public/rooms/albright/`. The link-only handwritten letters
ALB-M-0054 / -0056 (owner ruling: link only) have records but no stop reaches them.

## 3. Checklist for a new artifact

1. Media record verified, licence cleared (`media.jsonl`), facts verified for every line.
2. File prepared (WebP / meshopt glb) and placed under `app/public/` (documents and photos beside
   the existing ones, `app/public/artifacts/<slug>/` for new sets).
3. Record in `artifacts.js`.
4. Link it from a room artifact (`artifact:`) in a chapter's stops, regenerate the declared list
   (`npx vite-node scripts/record_lock.mjs`; review its diff), then check it at
   `tour.html?viewer=<media id>`, desktop and phone.
5. A chapter left with no Moments thumbnail (no record that is verified, embeddable, not link-only and not a
   basis photo) fails `records.test.js` until it is added to `../moments/noThumb.js` with its reason; the lock
   alone does not make the icon acceptable.
6. If it has a clip, add the narration line in `assets-src/audio/narration/<slug>.json`, run
   `check_narration.py`, and re-render the audio (`build_guide_audio.py`).

## 4. Chapter tours (`chapters.js`, played by `ChapterPlayer.jsx`)

A tour with `chapters` plays in the chapter player (`tour.html?inductee=<slug>&chapter=<id|kind|fact id>`);
a tour with only `steps` keeps the step player until it is converted. Worked example:
`lamarr-chapters-demo.js` (`?inductee=lamarr-demo`), one chapter per tier.

```
chapter  { id, kind, title, year, yearFact, factIds, map?, place, opening, narration?, closing?, stops }
                                                           narration: lines played on arrival, after
                                                           the opening (a room's own: room.narration);
                                                           closing: lines played once every stop is
                                                           seen (a photo room's or gallery's; a room's:
                                                           room.closing)
                                                           year: the turning point's year, stated by
                                                           yearFact (one of its verified factIds); the
                                                           tour plays its chapters in time order
                                                           (inTimeOrder: by year, a tie by CHAPTER_KINDS;
                                                           validateTour fails a chapter out of order)
map      { id, title, places, segments, narration? }      a map leg (shape.js), played before the place
opening  { keys, factIds }                                 narration clip played on arrival at the place
                                                           (default: '<slug>:ch:<kind>:opening'; a second
                                                           chapter of a kind keys its own line by its id,
                                                           '<slug>:ch:<chapter id>:opening', narration json
                                                           chapters.<chapter id> = { kind, opening })
place    { tier: 'room',    label, room }                  room: shape.js room; stops = room.artifacts
         { tier: 'photo',   label, note, photo,          photo: place/photoProjection.js (solved camera,
           hudBand?, stepBackToRest? }                     proxy layers, masks, look range); its files are
                                                           the `backdrop` of the record photo.mediaId names
                                                           (artifacts.js backdropOf), never the place's own;
                                                           hudBand: true puts a dark band behind the top HUD
                                                           and starts the canvas below it (ChapterPlayer;
                                                           owner decision 2026-11-04, Prague only)
                                                           stepBackToRest: true returns Step back from a
                                                           stop's view past the look's range to the view
                                                           at rest (PhotoRoomStage stepBackView; owner
                                                           decision 2026-11-04, Prague only: every other
                                                           room's view stays where the stop left it)
         { tier: 'gallery', label, note?, panel? }         panel: { eyebrow?, title, factIds } (the wall
                                                           panel prints those facts' verified text by id)
stop     { id, name, art? | artifact?, clip?, extra?,      art: an artifact record (section 1) or
           placeNote?, placeNoteLabel?, prop?, anchor? }   artifact: its media id; clip: narration;
                                                           placeNote: shown on the record's viewer
                                                           card under "Not taken here" (or the stop's
                                                           placeNoteLabel, e.g. "Not drawn here") when
                                                           the stop shows a record in a place it was
                                                           not made;
                                                           room prop: { src, pos, rotY? } its own glb in
                                                           the room; room anchor: { pos, size } an
                                                           invisible box for a part with no glb node
  photo:   at: { layer, ringY, glowY, glowSize, spotY, dolly }  a hotspot over a layer of the photograph
           rail: true                                       the record lies on the viewing rail
  gallery: pages: [i, ...]                                  which pages lie on the case bed
           panel: true                                      the wall panel's stop
  room:    panel: { eyebrow?, title, factIds }, anchor      a labelled panel stop (round 8): a printed card on
                                                            a stand (room/roomRecords.js) with its facts'
                                                            verified text; its clip says only those facts
```

What a stop says (owner feedback round 8): a stop is about the person and the records, never architecture only (no
stop is made of room notes only); its lines are about what it shows: a fact line at a record stop cites a fact the
record supports (on its card, its basis-photo facts, or from its own source), else it goes to its own labelled
panel or the chapter's closing (`narration.test.js`). Openings are human sentences ("Albert Einstein was born in
Ulm, Germany, on 14 March 1879."), never datelines.

Narration at a stop (owner decision 2026-10-27): no stop is silent, and a stop that shows a record
narrates it. Its `clip` starts with a record line (kind "record" in `assets-src/audio/narration/<slug>.json`:
what the record shows, quoting its card, and why it matters here, quoting cited verified facts), then any
fact lines; the viewer plays the stop's clip, then the record's own `clip`, as it opens (ChapterPlayer
`narratedRecord`). `narration.test.js` checks it; `check_narration.py` gates each record line against the
record's card in `tour-use.generated.json` (run `npx vite-node scripts/export_chapters.mjs` after changing a
stop or a record).

Gallery case layout (`place/galleryLayout.js`): up to six objects left to right on the bed, the
first `sheet` upright on its stand. A `model` record (a labelled recreation) stands in its own slot as
the 3D object, on a low riser. Gallery and photo-room rail stops carry their record inline (`art`):
the stages read it. Checks: `npm test` (`place/place.test.js` validates the demo
tour against `facts.generated.json`), `node e2e/chapters.mjs [slug]`, `node e2e/camcheck.mjs <slug>`.
