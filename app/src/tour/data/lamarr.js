// Hedy Lamarr's tour as turning-point chapters (chapters.js; spec 2.2), played by ChapterPlayer.jsx.
// A chapter exists only where verified facts exist and its main fact gives a year
// (data/inductees/lamarr/ROOMS.md, chapter table): no "education" or "leaving" chapter (no verified
// fact), and no "citizen" chapter (the naturalization file LAM-F-0001 is verified but no verified fact
// dates it; the citizenship year is disputed in the store): the file is a stop of "Arriving" (it holds her
// certificate of arrival). Every visitor-facing sentence about her is the text of a verified fact
// (ids alongside) or a narration clip tied to fact ids (assets-src/audio/narration/lamarr.json, gated
// by check_narration.py); the chapter openings are the voiced lines 'lamarr:ch:<kind>:opening' of
// that file. Room notes (the recreation, not her) cite their room's INVENTORY.md. Dates follow
// data/inductees/lamarr/CONFLICTS.md (arrival 1937). Single-source facts are neither shown nor
// spoken: the Normandie crossing (single-source) is not claimed anywhere; the photo room's label quotes
// its photograph's own caption. Coordinates: ./coords.snapshot.json.
//
// Places (spec 2.3): rebuilt rooms (the Graben, Vienna, 1902: the city, not her home; the MGM street
// front, Culver City, 1937: named from its photograph only; the graves of honour at the Vienna Central
// Cemetery as on a postcard of around 1905, where LAM-F-0110 says her ashes were buried: her own grave is
// not shown, Task 14c), a photo room (New York Harbor, the LoC Normandie photograph;
// assets-src/lamarr-normandie-harbor/DECISION.md), and gallery cases where no photograph of the place is
// on file (the invention, war bond tours, the Hall of Fame). The Wien Museum postcard (LAM-M-0029, CC0)
// textures the cemetery room but is not a record a stop opens: the grave fact it is filed under
// is single-source.
import { narr } from './shape.js'
import { chapter, inTimeOrder } from './chapters.js'
import { LAMARR_ARTIFACTS as ART, PRINTED_PATENT } from './lamarr-artifacts.js'
import POSES from './room-poses.json'

const L = (ch, cues, ids) => narr('lamarr', ch, cues, ids)

export const VIENNA = { id: 'vienna', label: 'Vienna, Austria', date: '1914', note: 'Born Nov. 9, 1914', lat: 48.208333333333336, lon: 16.3725, coord: 'wikidata:Q1741', factIds: ['LAM-F-0064', 'LAM-F-0012'] }
export const NEWYORK = { id: 'newyork', label: 'New York', date: '1937', note: 'As New York saw her', lat: 40.71277777777778, lon: -74.00611111111111, coord: 'wikidata:Q60', factIds: ['LAM-F-0100'] }

// ---------- the photo room (place/photoProjection.js) ----------
// The Library of Congress Normandie photograph (LAM-M-0023), its camera solved by hand
// (solvePhotoCamera): an assumed 40 degree aerial lens, the pitch from the haze line over the distant
// hills (row 232), the height so the liner's waterline, stern (500, 633) to bow (1268, 701), is the
// Normandie's 313 m. Proxies: the water, the liner as two boxes (hull to the deck line, then the
// superstructure), three ferries, one card for Liberty Island, a far backdrop at row 300. Pixels are
// those of the 1536 x 1098 JPEG. Textures: demo/build-photo-room.py. 1 unit = 10 m.
export const NORMANDIE_HARBOR = {
  mediaId: 'LAM-M-0023',
  // on a desktop she stands a little further out than the frame's 0.5 (round 9 fix round 7b): the liner fills the
  // middle of the view, and as she points at it her hand reached over its stern
  guide: { across: 0.58 },
  crop: { x: 26, y: 4, w: 1486, h: 1068 },
  camera: { fovDeg: 40, pitchDeg: 11.781131, height: 16.859107 },
  solve: { horizonRow: 232, from: [500, 633], to: [1268, 701], length: 31.3 },
  backdropRow: 300,
  layers: [
    { id: 'hull', kind: 'box', mask: 0, from: [500, 633], to: [1268, 701], beam: 3.6, top: 1.3 },
    { id: 'upper', kind: 'box', mask: 0, from: [500, 633], to: [1268, 701], beam: 2.6, top: 6.5, bottom: 1.3, inset: 0.5 },
    { id: 'ferry-1', kind: 'box', mask: 1, from: [176, 713], to: [351, 724], beam: 1.6, top: 2.6 },
    { id: 'ferry-2', kind: 'box', mask: 1, from: [910, 787], to: [1138, 791], beam: 1.6, top: 2.6 },
    { id: 'ferry-3', kind: 'box', mask: 1, from: [1160, 579], to: [1300, 589], beam: 1.6, top: 3 },
    { id: 'island', kind: 'card', mask: 2, at: [450, 372], width: 0.42, height: 8, y: 3 },
  ],
  // drag sweeps up to yawDeg either way (wider on phones), the camera swings `orbit` of the yaw
  // around the pivot layer; wheel / pinch moves up to `dolly` forward
  // on a phone the view at rest looks down a little, so the liner sits above the guide, never behind her
  look: { yawDeg: 11, yawDegPhone: 20, pitchDeg: 5, dolly: 5, orbit: 0.2, pivot: 'hull', restPitchDegPhone: -13 },
}

// ---------- rebuilt rooms (shape.js room) ----------
// Guide spot and camera poses per device: room-poses.json.

// The MGM street front, Culver City, 31 July 1937 (assets-src/lamarr-mgm-gate/INVENTORY.md). No
// verified fact places her at this entrance: the label names the place and the date of the photograph.
export const STREET = {
  id: 'lamarr-mgm-gate',
  title: 'Metro-Goldwyn-Mayer studios, Culver City',
  model: '/models/lamarr-mgm-gate/lamarr-mgm-gate',
  // labelText replaces the label in the glb (whose numbers came from a modelling reference or were
  // computed): every number shown is grounded (displayedNumbers.js, Codex Task 19 round 3)
  labelText:
    "Recreation modelled after a photograph used as reference only (Metro-Goldwyn-Mayer studios, Culver City; Los Angeles Daily News Negatives, UCLA Library Special Collections; its date is not verified here). The banner and plate lettering is re-set; nothing is cut from the photograph. People and cars in the photograph are not shown.",
  ...POSES['lamarr-mgm-gate'],
  fog: [70, 140],
  // feedback round 7: the opening tells Boom Town; on arrival, Ziegfeld Girl; once every stop is seen,
  // Samson and Delilah and the meeting that leads to the invention
  // (no arrival line: the 1941 Ziegfeld Girl poster is not told in the 1940 chapter, fix round 2)
  // once every stop is seen: the meeting with George Antheil (1940), which leads into the invention
  closing: L(1, ['c3'], ['LAM-F-0086']),
  // round 8: the gate and the CASTING OFFICE plate were architecture-only stops (room notes)
  artifacts: [],
}
// Her chapter's room: the street front plus a Los Angeles Times portrait of her (UCLA, CC BY), shown
// at the colonnade. The HUD note (under More) and the portrait's viewer card (the stop's placeNote)
// say it was not taken here.
export const STUDIO_PHOTO_NOTE = 'The portrait shown at the colonnade (Los Angeles Times, 1939) was not taken at this street front.'
export const STUDIO = {
  ...STREET,
  note: STUDIO_PHOTO_NOTE,
  // the record its note cites (displayedNumbers.js)
  records: ['LAM-M-0013'],
  artifacts: [
    ...STREET.artifacts,
    { id: 'portrait', nodes: ['artifact_colonnade'], name: 'Portrait, 1939', artifact: 'LAM-M-0013', clip: L(9, ['r4'], []), ring: [2.2, 2.6, 0.9], placeNote: STUDIO_PHOTO_NOTE, display: { mount: 'stand', pos: [2.0, 1.45, 1.4], rotY: -0.62, size: [0.45, 0.6] } },
    // round 9 (owner directive 2026-10-29): two 1940 newspaper pages on Boom Town, on easels along the colonnade
    { id: 'star1940', name: 'Evening star, August 15, 1940', artifact: 'LAM-M-0034', clip: L(21, ['r4'], []), anchor: { pos: [5.15, 1.45, 1.4], size: [0.5, 0.55, 0.05] }, display: { mount: 'stand', pos: [5.15, 1.45, 1.4], rotY: -0.45, size: [0.5, 0.55] } },
    { id: 'waterbury1940', name: 'Waterbury Democrat, August 30, 1940', artifact: 'LAM-M-0035', clip: L(21, ['r5'], []), anchor: { pos: [8.2, 1.45, 1.4], size: [0.45, 0.62, 0.05] }, display: { mount: 'stand', pos: [8.2, 1.45, 1.4], rotY: -0.35, size: [0.45, 0.62] } },
  ],
}

// The Graben, Vienna, 1902 (assets-src/lamarr-vienna-graben/INVENTORY.md): a Vienna street twelve
// years before her birth; no source places her here (the glb's own label says so). Outdoors: the
// fog starts past the far end of the street, so the sky dome (about 400 m out) still reads.
const GRABEN = {
  id: 'lamarr-vienna-graben',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['LAM-M-0030'],
  title: 'The Graben, Vienna · 1902',
  model: '/models/lamarr-vienna-graben/lamarr-vienna-graben',
  // labelText replaces the label in the glb (whose numbers came from a modelling reference or were
  // computed): every number shown is grounded (displayedNumbers.js, Codex Task 19 round 3)
  labelText:
    "Recreation based on a photograph: the Graben, Vienna, H. C. White Co. stereograph \"The busy Graben, Vienna, Austria\", copyright 1902, Library of Congress (public domain). A Vienna street before Hedy Lamarr was born in Vienna, Austria in 1914; no source on file places her here. People, carriages and cabs are not shown; facade detail is generalised from the photograph.",
  ...POSES['lamarr-vienna-graben'],
  fog: [160, 900],
  // (her parents are told at the 1946 courtroom photograph, where her married name Mrs. Hedwig Loder is
  // explained: fix round 1)
  artifacts: [
    // round 8: no architecture-only stop (the street fronts and the advertising column were room notes)
    // the stereograph the room is modelled from, shown beside the advertising column it shows
    // display: the stereograph hangs on the advertising column's face toward the visitor (room/roomRecords.js)
    { id: 'photo', nodes: ['artifact_advertising_column'], name: 'The stereograph, 1902', artifact: 'LAM-M-0030', clip: L(9, ['r1'], ['LAM-F-0012']), ring: [-4.6, 3.4, -36], display: { mount: 'wall', pos: [-2.47, 1.7, -35.37], rotY: 0.49, size: [0.52, 0.38] } },
    // round 9 (owner directive 2026-10-29: chapters with fewer than 3 records get more): the 1953 report of her
    // citizenship, which names her native Vienna, posted on the same advertising column (a later record, told last)
    { id: 'paper1953', name: 'Evening star, 1953', artifact: 'LAM-M-0031', clip: L(21, ['r1'], []), anchor: { pos: [-3.12, 1.7, -35.36], size: [0.5, 0.42, 0.05] }, display: { mount: 'wall', pos: [-3.12, 1.7, -35.36], rotY: -0.45, size: [0.5, 0.42] } },
  ],
}

// The graves of honour of Beethoven, Mozart and Schubert at the Vienna Central Cemetery, as on a postcard
// of around 1905 (assets-src/lamarr-vienna-central-cemetery/INVENTORY.md; Task 14c). LAM-F-0110 (verified)
// says her ashes were buried at the cemetery; her grave is not modelled (DECISION.md). The tour's label
// says so.
export const CEMETERY_LABEL =
  'Recreation based on a photograph: the graves of honour of Beethoven, Mozart and Schubert at the Vienna Central Cemetery, as on a postcard of around 1905 (Wien Museum, CC0). Hedy Lamarr’s ashes were buried at the Vienna Central Cemetery. Her grave is not shown: the room shows the composers’ graves of honour as they were around 1905. The postcard is black and white, so the colours are interpretive; the trees behind are the postcard itself, repeated round the horizon.'
const AWAY = 'Not photographed here'
const CEMETERY = {
  id: 'lamarr-vienna-central-cemetery',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['LAM-M-0029'],
  title: 'Vienna Central Cemetery · around 1905',
  model: '/models/lamarr-vienna-central-cemetery/lamarr-vienna-central-cemetery',
  ...POSES['lamarr-vienna-central-cemetery'],
  labelText: CEMETERY_LABEL,
  fog: [40, 90],
  artifacts: [
    // her later life, in time order (fix round 2), on easels in front of the box hedge (round 9): the 1946
    // courtroom photograph (her married name, her parents), then her naturalization file (undated; moved from
    // the 1937 chapter, where it read as her arrival). Round 8: no architecture-only stop (the Beethoven stone and
    // the Mozart memorial were room notes); the 1954 broadcast is not what the courtroom photograph shows, so it
    // opens the closing
    { id: 'photo', name: 'Courtroom, 1946', artifact: 'LAM-M-0015', clip: { keys: ['lamarr:9:r10', 'lamarr:9:r12'], factIds: ['LAM-F-0102', 'LAM-F-0105'] }, anchor: { pos: [-6.2, 1.4, -13.6], size: [0.5, 0.35, 0.05] }, display: { mount: 'stand', pos: [-6.2, 1.4, -13.6], rotY: 0.35, size: [0.5, 0.35] }, placeNote: 'Photographed in a courtroom on May 20, 1946.', placeNoteLabel: AWAY },
    { id: 'file', name: 'The naturalization file', artifact: 'LAM-M-0022', clip: L(9, ['r3'], []), anchor: { pos: [-7.2, 1.4, -13.6], size: [0.5, 0.35, 0.05] }, display: { mount: 'stand', pos: [-7.2, 1.4, -13.6], rotY: 0.35, size: [0.5, 0.35] }, placeNote: 'Shown here in Vienna; the file is at the National Archives at Riverside.', placeNoteLabel: 'Not made here' },
    // round 9 (owner directive 2026-10-29): the 1953 report of the rite that made her an American, after the file;
    // owner ruling 2026-11-02: it carries her naturalization (LAM-F-0113, verified), before the closing's death lines
    { id: 'paper1953', name: 'Evening star, 1953', artifact: 'LAM-M-0039', clip: L(21, ['r8'], ['LAM-F-0113']), anchor: { pos: [-8.2, 1.4, -13.6], size: [0.4, 0.55, 0.05] }, display: { mount: 'stand', pos: [-8.2, 1.4, -13.6], rotY: 0.35, size: [0.4, 0.55] }, placeNote: 'Shown here in Vienna; the page is at the Library of Congress.', placeNoteLabel: 'Not made here' },
  ],
  // once every stop is seen: the 1954 broadcast, then her death and her resting place (never in the opening, fix
  // round 2)
  // fix round 1: the opening is her married name (no death in an opening, controller ruling); Samson and Delilah opens
  // the closing (review L4), then the 1954 broadcast, her death and the cemetery, after the death line
  closing: L(6, ['c7', 'c1', 'c5', 'c6'], ['LAM-F-0087', 'LAM-F-0062', 'LAM-F-0083', 'LAM-F-0110']),
}

const PHOTO_NOTE = 'The depth is estimated from the photograph; past its edges there is nothing to show.'
const galleryNote = (why) => `Gallery case — ${why}, so the chapter is shown in an IHH gallery. The gallery is not a recreation of a real room.`

const CHAPTERS = [
  chapter({
    id: 'birth',
    kind: 'birth',
    title: 'Born in Vienna',
    year: 1914,
    yearFact: 'LAM-F-0012', // the verified fact that states the year
    factIds: ['LAM-F-0012', 'LAM-F-0064', 'LAM-F-0065', 'LAM-F-0020'],
    place: { tier: 'room', label: 'The Graben, Vienna', room: GRABEN },
    stops: GRABEN.artifacts,
  }),
  chapter({
    id: 'arriving',
    kind: 'arriving',
    title: 'Arriving in New York',
    year: 1937,
    yearFact: 'LAM-F-0100', // the verified fact that states the year
    factIds: ['LAM-F-0100', 'LAM-F-0020'],
    // Round 9 (owner decision 2026-10-29): the line from Vienna, her birthplace, to New York, un-routed: no verified
    // fact states the journey (London and the Normandie are single-source, JOURNEYS.md), so no ship is drawn and the map
    // says the route is not recorded. Place photographs: the Graben (LAM-M-0030) and New York Harbor (LAM-M-0023).
    map: {
      id: 'arriving-leg',
      title: 'Vienna to New York',
      places: [VIENNA, NEWYORK],
      segments: [{ routed: false, mode: null }],
      resources: [
        { id: 'res-vienna', label: 'Vienna', lat: VIENNA.lat, lon: VIENNA.lon, coord: VIENNA.coord, factIds: ['LAM-F-0064'], media: ['LAM-M-0030'] },
        { id: 'res-newyork', label: 'New York', lat: NEWYORK.lat, lon: NEWYORK.lon, coord: NEWYORK.coord, factIds: ['LAM-F-0100'], media: ['LAM-M-0023'] },
      ],
      narration: L(21, ['m1'], ['LAM-F-0100']),
    },
    place: {
      tier: 'photo',
      label: 'New York Harbor',
      note: `Photo room — based on a Library of Congress photograph (public domain). Its caption: “S.S. Normandie arriving in New York Harbor on maiden voyage” (dated c1936). It shows the harbor, not her arrival. ${PHOTO_NOTE}`,
      photo: NORMANDIE_HARBOR,
    },
    stops: [
      { id: 'photo', name: 'The photograph', artifact: 'LAM-M-0023', clip: L(9, ['r2'], []), at: { layer: 'hull', ringY: 6.2, glowY: 2.5, glowSize: 14, spotY: 3, dolly: 0.7, target: [477, 515, 1290, 700] } },
      // round 9 (owner directive 2026-10-29): two October 1937 newspaper pages on the viewing rail
      { id: 'bismarck', name: 'The Bismarck tribune, October 4, 1937', art: ART['LAM-M-0032'], rail: true, clip: L(21, ['r2'], []) },
      { id: 'washtimes', name: 'The Washington times, October 6, 1937', art: ART['LAM-M-0033'], rail: true, clip: L(21, ['r3'], ['LAM-F-0020']) },
      // (her naturalization file is a stop of the later-life chapter: a later record, fix round 2)
    ],
  }),
  chapter({
    id: 'first-work',
    kind: 'first-work',
    title: 'Films for Metro-Goldwyn-Mayer',
    year: 1940,
    yearFact: 'LAM-F-0044', // the verified fact that states the year
    factIds: ['LAM-F-0044', 'LAM-F-0086'],
    place: { tier: 'room', label: 'MGM studios, Culver City', room: STUDIO },
    stops: STUDIO.artifacts,
  }),
  chapter({
    id: 'big-work',
    kind: 'big-work',
    title: 'The invention',
    year: 1941,
    yearFact: 'LAM-F-0091', // the verified fact that states the year
    factIds: ['LAM-F-0091', 'LAM-F-0096', 'LAM-F-0086', 'LAM-F-0046', 'LAM-F-0093', 'LAM-F-0092', 'LAM-F-0090', 'LAM-F-0097', 'LAM-F-0084', 'LAM-F-0094', 'LAM-F-0095'],
    place: {
      tier: 'gallery',
      label: 'IHH gallery',
      note: galleryNote('no photograph of the place (11805 Bellagio Road, Bel-Air) is on file'),
      panel: { eyebrow: 'The invention · 1941', title: 'Secret Communication System', factIds: ['LAM-F-0086', 'LAM-F-0091', 'LAM-F-0093', 'LAM-F-0092', 'LAM-F-0090', 'LAM-F-0095'] },
    },
    stops: [
      // gallery stops carry their record (galleryLayout reads `art`): the case file fans two of its pages; the mechanism recreation beside it; the printed patent on its stand
      // fix round 1: LAM-M-0001 is shown once, as the printed patent on its stand; the filing (June 1941) is in the opening
      { id: 'mechanism', name: 'The mechanism (recreation)', art: ART['LAM-MECHANISM-RECREATION'], clip: L(9, ['r6'], []) },
      // the panel: the Patent Office allowed the application (November 1941), the step before the patent
      { id: 'panel', name: 'The wall panel', panel: true, clip: L(1, ['c9'], ['LAM-F-0092']) },
      { id: 'patent', name: 'The printed patent', art: PRINTED_PATENT, extra: ' · Printed patent page', clip: L(9, ['r7'], ['LAM-F-0097']) },
    ],
  }),
  chapter({
    id: 'history',
    kind: 'history',
    title: 'On screen and on air',
    year: 1942,
    yearFact: 'LAM-F-0061', // the verified fact that states the year
    factIds: ['LAM-F-0061', 'LAM-F-0063', 'LAM-F-0109', 'LAM-F-0089'],
    place: {
      tier: 'gallery',
      label: 'IHH gallery',
      note: galleryNote('no verified fact names the place, and the newsreels are link only (rights unknown)'),
      panel: { eyebrow: 'Part of history', title: 'On screen and on air', factIds: ['LAM-F-0061', 'LAM-F-0109', 'LAM-F-0063'] },
    },
    // feedback round 7: the 1942 premiere photograph (also a stop of the cemetery room) in the case
    stops: [
      { id: 'premiere', name: 'Film premiere, 1942', art: ART['LAM-M-0014'], clip: { keys: ['lamarr:9:r8', 'lamarr:1:c6'], factIds: ['LAM-F-0089'] } },
      // the 1954 broadcast is told in the later-life chapter (time order, fix round 1)
      { id: 'panel', name: 'The wall panel', panel: true, clip: { keys: ['lamarr:8:c1', 'lamarr:6:c2'], factIds: ['LAM-F-0109', 'LAM-F-0063'] } },
      // round 9 (owner directive 2026-10-29): two September 1942 pages on the stars' bond tours
      { id: 'gazette1942', name: 'The East Hartford gazette, September 4, 1942', art: ART['LAM-M-0037'], clip: L(21, ['r6'], []) },
      { id: 'waterbury1942', name: 'The Waterbury Democrat, September 16, 1942', art: ART['LAM-M-0038'], clip: L(21, ['r7'], []) },
    ],
  }),
  chapter({
    id: 'honoured',
    kind: 'honoured',
    title: 'National Inventors Hall of Fame',
    year: 2014,
    yearFact: 'LAM-F-0006', // the verified fact that states the year
    factIds: ['LAM-F-0006', 'LAM-F-0085', 'LAM-F-0040'],
    place: {
      tier: 'gallery',
      label: 'IHH gallery',
      note: galleryNote('no verified fact names a place'),
      panel: { eyebrow: 'Why the Hall honours her', title: 'An inventor', factIds: ['LAM-F-0040', 'LAM-F-0006', 'LAM-F-0085'] },
    },
    // feedback round 7: the invention the Hall honoured, in the case (the patent case file, its first page)
    stops: [
      // round 9 (owner directive 2026-10-29): the patent the Hall honours, in the case (USPTO; owner ruling 2026-10-29)
      { id: 'patent', name: 'Patent 2,292,387', art: ART['LAM-M-0036'], clip: L(21, ['r9'], []) },
      { id: 'panel', name: 'The wall panel', panel: true, clip: L(6, ['c3'], ['LAM-F-0085']) },
    ],
  }),
  chapter({
    id: 'legacy',
    kind: 'legacy',
    title: 'Later life',
    year: 2000,
    yearFact: 'LAM-F-0083', // the verified fact that states the year
    // owner ruling 2026-11-02: her citizenship is in this chapter, not a chapter of its own: LAM-F-0113 (naturalized,
    // 1953) is its first fact, shown at the 1953 page's stop, ahead of the closing's death lines (time runs forward)
    factIds: ['LAM-F-0113', 'LAM-F-0083', 'LAM-F-0110', 'LAM-F-0107', 'LAM-F-0102', 'LAM-F-0105', 'LAM-F-0062', 'LAM-F-0087', 'LAM-F-0001', 'LAM-F-0007'],
    place: { tier: 'room', label: 'Vienna Central Cemetery (as on a postcard of around 1905)', room: CEMETERY },
    stops: CEMETERY.artifacts,
  }),
]

export const LAMARR = {
  slug: 'lamarr',
  name: 'Hedy Lamarr',
  chapters: inTimeOrder(CHAPTERS), // time order (chapters.js)
  // Landing story points (fact ids) and older links (?stop=studio, leg-1) -> the chapter "Tour from
  // here" opens (data/index.js resolveStop).
  storyStops: {
    'LAM-F-0012': { chapter: 'birth', label: 'Born in Vienna' },
    'LAM-F-0086': { chapter: 'big-work', label: 'The invention' },
    'LAM-F-0084': { chapter: 'big-work', label: 'The invention' },
    'LAM-F-0006': { chapter: 'honoured', label: 'National Inventors Hall of Fame' },
    'leg-1': { chapter: 'arriving', label: 'Arriving in New York' },
    studio: { chapter: 'first-work', label: 'MGM studios, Culver City' },
  },
}
