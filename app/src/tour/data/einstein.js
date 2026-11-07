// Albert Einstein's tour as turning-point chapters (chapters.js; spec 2.2), played by ChapterPlayer.jsx.
// A chapter exists only where verified facts exist (data/inductees/einstein/ROOMS.md, chapter table):
// no "education" or "first work" chapter (no verified fact). Every visitor-facing sentence about him
// is the text of a verified fact (ids alongside) or a narration clip tied to fact ids
// (assets-src/audio/narration/einstein.json, gated by check_narration.py); the chapter openings are
// the voiced lines '<slug>:ch:<kind>:opening' of that file. Room notes (the recreation, not him) cite
// their room's INVENTORY.md. Coordinates: ./coords.snapshot.json (New York, Wikidata Q60) and
// content/einstein/coords.snapshot.json (Ulm Q3012).
//
// Places (spec 2.3): rebuilt rooms (the study, the Trenton courtroom, the Mercer Street front, and a
// lecture hall in Gothenburg for the Nobel Prize chapter: EIN-F-0150 and -0151, verified, place his
// address in the city, not in a hall, Task 14c), photo rooms from cleared Library of Congress basis
// photographs (Ulm, the Battery; their labels say what the photograph shows), and gallery cases where
// no cleared photograph of the place is on file (leaving, the letter to the President).
import { narr } from './shape.js'
import { ARTIFACTS } from './artifacts.js'
import { chapter, inTimeOrder } from './chapters.js'
import POSES from './room-poses.json'

const E = (ch, cues, ids) => narr('einstein', ch, cues, ids)

export const ULM = {
  id: 'ulm',
  label: 'Ulm, Germany',
  date: '1879',
  note: 'Born 14 March 1879', // EIN-F-0005
  lat: 48.398611,
  lon: 9.991111,
  coord: 'wikidata:Q3012',
  factIds: ['EIN-F-0005'],
}
// Round 9 (owner decision 2026-10-29, JOURNEYS.md): his 1933 crossing, Southampton to New York, is a verified journey
// (EIN-F-0157: "sailed for New York from Southampton"), drawn with its mode; the ship is named on the line (EIN-F-0122).
export const SOUTHAMPTON = {
  id: 'southampton',
  label: 'Southampton, England',
  date: '1933',
  note: 'Sailed for New York', // EIN-F-0157
  lat: 50.906666666666666,
  lon: -1.4044444444444444,
  coord: 'wikidata:Q79848',
  factIds: ['EIN-F-0157'],
}
export const NEWYORK = {
  id: 'newyork',
  label: 'New York',
  date: '1933',
  note: 'Landed at the Battery', // EIN-F-0124 "the Einstein party landed at the Battery in New York"
  lat: 40.71277777777778,
  lon: -74.00611111111111,
  coord: 'wikidata:Q60',
  factIds: ['EIN-F-0124'],
}

// ---------- photo rooms (place/photoProjection.js) ----------
// Cameras solved by hand (solvePhotoCamera): the pitch from the horizon row, the height from two
// ground pixels an estimated distance apart (the label says the depth is estimated). Units: metres.
// Layers and masks: assets-src/einstein-photo-rooms/build_photo_rooms.py (pixels of the LoC JPEGs).

// The photochrom (EIN-M-0075): an elevated city view over a timber yard toward the Minster and the
// Danube; camera about 10 m up. R: the near wall and the sheds; G: the trees and the brick tower;
// B: the bridge. The Minster and the old town stay on the far backdrop.
export const ULM_VIEW = {
  mediaId: 'EIN-M-0075',
  crop: { x: 14, y: 13, w: 994, h: 729 },
  camera: { fovDeg: 38, pitchDeg: -0.785, height: 10.3 },
  solve: { horizonRow: 392, from: [330, 650], to: [720, 640], length: 16 },
  backdropRow: 420,
  layers: [
    { id: 'front', kind: 'card', mask: 0, at: [520, 742], width: 1.3, height: 10, y: 5 },
    { id: 'trees', kind: 'card', mask: 1, at: [330, 548], width: 1.0, height: 20, y: 10 },
    { id: 'bridge', kind: 'card', mask: 2, at: [820, 605], width: 0.5, height: 7, y: 3.5 },
  ],
  look: { yawDeg: 8, yawDegPhone: 20, pitchDeg: 4, dolly: 9, orbit: 0.2, orbitPhone: 0, pivot: 'trees', restYawDegPhone: 16 },
  // owner ruling 2026-11-02: on a phone the guide stands on the right, so the Minster (left of the photochrom), main
  // spire included, is whole in the view at rest and at every stop (keepInView, checked by e2e/chapters.mjs)
  guide: { xPhone: 0.62 },
  keepInView: { phone: [50, 80, 275, 350] },
}

// The Battery, 1933 (EIN-M-0074): a street-level press photograph; camera about 1.8 m up. R: the
// people (one card at the queue's feet); G: the bus.
export const BATTERY_VIEW = {
  mediaId: 'EIN-M-0074',
  crop: { x: 50, y: 56, w: 922, h: 692 },
  camera: { fovDeg: 44, pitchDeg: 13.589, height: 1.79 },
  solve: { horizonRow: 195, from: [150, 660], to: [640, 575], length: 2.2 },
  backdropRow: 225,
  layers: [
    { id: 'crowd', kind: 'card', mask: 0, at: [560, 585], width: 1.4, height: 4, y: 2 },
    { id: 'bus', kind: 'box', mask: 1, from: [60, 525], to: [520, 505], beam: 2.4, top: 3.0 },
  ],
  look: { yawDeg: 8, yawDegPhone: 14, pitchDeg: 4, dolly: 1.2, orbit: 0.25, pivot: 'crowd' },
}

// ---------- rebuilt rooms (shape.js room) ----------
// Guide spot and camera poses per device: room-poses.json.

// The study at 112 Mercer Street (assets-src/study/INVENTORY.md), as two 1943 Navy photographs show
// it. The model has no node for the letters: the handwritten sheet on the desk stands for them. The
// pipe is a labelled recreation (assets-src/einstein-pipe/), set on the desk as its own glb.
const STUDY = {
  id: 'study',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['EIN-M-0013', 'EIN-M-0014'],
  title: 'The study',
  model: '/models/study/study',
  // study.glb exists; if it ever fails to load, the labelled stand-in room is shown (StandInStudy.jsx)
  standIn: true,
  // EIN-F-0087
  caption: 'Albert Einstein had a home study at 112 Mercer Street, Princeton, New Jersey.',
  captionFacts: ['EIN-F-0087'],
  ...POSES.study,
  narration: E(2, ['c2'], ['EIN-F-0054']),
  artifacts: [
    // fix round 1 (review I-3): the stop's label names what its fact is about (his research in his study), at the desk
    { id: 'desk', nodes: ['artifact_desk'], name: 'Research in his study', clip: E(2, ['c3'], ['EIN-F-0055']) },
    // the nine Brunauer letters, one series (artifacts.js EIN-SERIES-BRUNAUER)
    // display: the first letter's page lies on the handwritten sheet (room/roomRecords.js)
    { id: 'letter', nodes: ['papers_handwritten'], name: 'Letters to Lieutenant Brunauer', artifact: 'EIN-SERIES-BRUNAUER', clip: { keys: ['einstein:12:r12', 'einstein:2:c4'], factIds: ['EIN-F-0062', 'EIN-F-0063'] }, display: { mount: 'lie', pos: [0.32, 0.805, -0.78], rotY: -0.4, tilt: 0.3, size: [0.22, 0.29] } },
    // one of the two 1943 photographs the room is modelled from; anchored on his chair, which both show
    // display: the photograph lies on the desk (top 0.76 m) in front of his chair, clear of the letter, the boxes and the pipe
    { id: 'photo', nodes: ['artifact_chair_einstein'], name: 'The Navy photograph, 1943', artifact: 'EIN-M-0013', clip: { keys: ['einstein:12:r13', 'einstein:2:c10'], factIds: ['EIN-F-0055'] }, display: { mount: 'lie', pos: [0.8, 0.765, -0.86], rotY: -0.7, tilt: 0.6, size: [0.24, 0.19] } },
    { id: 'pipe', name: 'Brier pipe (recreation)', artifact: 'EIN-PIPE-RECREATION', clip: E(12, ['r14'], []), prop: { src: '/artifacts/einstein/pipe.glb', pos: [0.86, 0.765, -0.3], rotY: 0.5 } },
  ],
}

// The ceremonial courtroom of the courthouse in Trenton (assets-src/einstein-trenton-courtroom/
// INVENTORY.md). EIN-F-0056: his petition was in the U.S. District Court there; no source places the
// 1940 ceremony in this room, so the records are shown here, never as "where he took the oath".
const COURTROOM = {
  id: 'einstein-trenton-courtroom',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['EIN-M-0071', 'EIN-M-0072', 'EIN-M-0073'],
  title: 'The courthouse, Trenton',
  model: '/models/einstein-trenton-courtroom/einstein-trenton-courtroom',
  // labelText replaces the label in the glb (whose numbers came from a modelling reference or were
  // computed): every number shown is grounded (displayedNumbers.js, Codex Task 19 round 3)
  labelText:
    "Recreation of the ceremonial courtroom of the federal courthouse in Trenton, New Jersey, now the Clarkson S. Fisher Federal Building and U.S. Courthouse, the courthouse of the U.S. District Court in Trenton. Modelled from the National Register photograph of the room and the register form's description (reference only); marble from Carol M. Highsmith's 2010 photographs of the building (Library of Congress, public domain). Albert Einstein received his certificate of American citizenship in 1940; no source on file says it was in this room.",
  ...POSES['einstein-trenton-courtroom'],
  fog: [30, 60],
  narration: E(1, ['c8'], ['EIN-F-0056']),
  artifacts: [
    // both records lie on the clerk's desk, rings at either end (the desk stands in front of the bench)
    // display: the record itself lies on the desk at its stop (room/roomRecords.js; the desk top is at 0.97 m)
    { id: 'record', nodes: ['artifact_clerks_desk'], name: 'The naturalization record', artifact: 'EIN-M-0019', clip: E(12, ['r10'], []), ring: [-0.75, 1.45, 4.45], display: { mount: 'lie', pos: [-0.55, 0.975, 4.38], rotY: 0.12, tilt: 0.45, size: [0.46, 0.36] } },
    // shown on the clerk's desk beside the record, never on the bench: no source places the ceremony here
    { id: 'photo', nodes: ['artifact_clerks_desk'], name: 'The photograph of October 1, 1940', artifact: 'EIN-M-0002', clip: E(12, ['r11'], []), ring: [0.75, 1.45, 4.45], display: { mount: 'lie', pos: [0.55, 0.975, 4.38], rotY: -0.12, tilt: 0.45, size: [0.4, 0.32] } },
    // round 9 (owner directive 2026-10-29: chapters with fewer than 3 records get more): the Imperial Valley press of
    // the same day, on an easel at the right end of the clerk's desk
    { id: 'press1940', name: 'Imperial Valley press, October 1, 1940', artifact: 'EIN-M-0091', clip: E(21, ['r7'], []), anchor: { pos: [1.75, 1.25, 5.0], size: [0.45, 0.45, 0.05] }, display: { mount: 'stand', pos: [1.75, 1.25, 5.0], rotY: -0.3, size: [0.45, 0.45] }, placeNote: 'Shown here in Trenton; the page is at the Library of Congress.', placeNoteLabel: 'Not made here' },
  ],
}

// The front of 112 Mercer Street (assets-src/einstein-mercer-street-front/INVENTORY.md). Outdoors:
// the fog sits past the street.
const MERCER_FRONT = {
  id: 'einstein-mercer-street-front',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['EIN-M-0064'],
  title: '112 Mercer Street, Princeton',
  model: '/models/einstein-mercer-street-front/einstein-mercer-street-front',
  // labelText replaces the label in the glb (whose numbers came from a modelling reference or were
  // computed): every number shown is grounded (displayedNumbers.js, Codex Task 19 round 3)
  labelText:
    "Recreation based on photographs: 112 Mercer Street, Princeton, New Jersey, the house front and street. Basis: Alan Richards, \"Albert Einstein's house\" (undated, winter), Shelby White and Leon Levy Archives Center, Institute for Advanced Study, IAS E 42 (CC BY 4.0); an undated colour view and a National Park Service photograph used as reference. The photographs show the house after Einstein's lifetime; it was his home until his death in 1955. Snow, wires, cars and people are not shown.",
  ...POSES['einstein-mercer-street-front'],
  fog: [60, 140],
  // feedback round 7: the room is the setting; the chapter is his life here. The opening tells his work (the unified
  // field theory); fix round 1 (review I-4, E4, controller ruling): no arrival line (the 1947 letter is printed on its
  // panel); once every stop is seen, the house in the past and dated: his home until his death in 1955 (deaths in the
  // closing), the landmark designation of 1976. No present-tense claim from the 1976 nomination form.
  // fix round 2: the dated death (EIN-F-0006) is restored, before the 1976 landmark line
  // round 9: the death is said at the 1955 report of it (a record of a death never plays before the death line), so
  // the closing keeps the home and the landmark lines
  closing: E(7, ['c7', 'c2'], ['EIN-F-0107', 'EIN-F-0132']),
  artifacts: [
    // round 8: only house facts at the house; the 1947 article on its own labelled panel (his letter is link-only),
    // before the 1954 photographs
    // the whole house (wide: the guide stands in front of it, clear of its middle; room/guideFrame.js focusRect)
    { id: 'house', nodes: ['artifact_house'], name: 'His home, 112 Mercer Street', wide: true, clip: E(7, ['c8'], ['EIN-F-0087']) },
    { id: 'article', name: '“Atomic War or Peace,” 1947', panel: { eyebrow: 'His letter of November 29, 1947', title: '“Atomic War or Peace”', factIds: ['EIN-F-0075', 'EIN-F-0076', 'EIN-F-0077'] }, clip: E(6, ['c5', 'c6'], ['EIN-F-0076', 'EIN-F-0077']), anchor: { pos: [-1.7, 1.3, 8.0], size: [0.75, 0.95, 0.1] } },
    // Alan Richards's photographs of him in his study in this house (IAS, CC BY 4.0), one stop per moment (round 8:
    // a photograph series the viewer steps through), on museum stands along the sidewalk in front of the hedge,
    // facing the street (room/roomRecords.js)
    { id: 'desk', name: 'Seated in his study, 1954', artifact: 'EIN-SERIES-SEATED-1954', clip: E(12, ['r21'], []), anchor: { pos: [-3.2, 1.3, 8.0], size: [0.95, 0.75, 0.1] } },
    { id: 'standing', name: 'Standing in his study, and at the window', artifact: 'EIN-SERIES-STANDING', clip: E(12, ['r22'], []), anchor: { pos: [5.2, 1.3, 8.0], size: [0.95, 0.75, 0.1] } },
    // round 9 (owner directive 2026-10-29): the Evening star of April 18, 1955, on a stand along the sidewalk; the death
    // line is said here, first
    { id: 'star1955', name: 'Evening star, April 18, 1955', artifact: 'EIN-M-0092', clip: { keys: ['einstein:7:c3', 'einstein:21:r8'], factIds: ['EIN-F-0006'] }, anchor: { pos: [-4.7, 1.3, 8.0], size: [0.6, 0.8, 0.1] } },
  ],
}

// A lecture hall in Gothenburg (assets-src/einstein-gothenburg-lecture-hall/INVENTORY.md; Task 14c). The
// verified facts (EIN-F-0150, -0151, a newspaper report that spells the city "Gottenberg") say he gave an
// address in the city before a scientific body, with the King present. Round 7: the holder's verified
// records of the photographs on the stands (EIN-M-0079 GhmF:149, EIN-M-0081 GhmF:148, the photograph the
// room is modelled from) name the hall; the label says so, and that no verified fact names it.
export const GOTHENBURG_LABEL =
  "A lecture hall in Gothenburg, rebuilt from a photograph of his lecture. Göteborgs stadsmuseum's records of the photographs shown here name the hall as the Kongresshallen; no verified fact names it. A newspaper report says Einstein delivered an address at Gottenberg [sic], Sweden, before a scientific body on his theory of relativity, and that King Gustaf was among those present. Every texture is drawn; people are not shown, and the walls the photograph does not show are plain."
const GOTHENBURG = {
  id: 'einstein-gothenburg-lecture-hall',
  // the verified records its label cites (the holder's records name the hall)
  records: ['EIN-M-0079', 'EIN-M-0081'],
  title: 'A lecture hall · Gothenburg',
  model: '/models/einstein-gothenburg-lecture-hall/einstein-gothenburg-lecture-hall',
  ...POSES['einstein-gothenburg-lecture-hall'],
  labelText: GOTHENBURG_LABEL,
  fog: [40, 90],
  // feedback round 7: the hall is the setting (one architecture line, the lectern); the chapter is him and
  // the records. On arrival, the theory his address was on; once every stop is seen, the year he received
  // the prize and its citation.
  // the opening tells the 1905 theory and the address; once every stop is seen, the prize's citation
  closing: E(9, ['c1'], ['EIN-F-0148']),
  artifacts: [
    // time order (fix round 2): the 1905 papers, then the 1923 photographs
    { id: 'relativity', name: 'His relativity paper, 1905', artifact: 'EIN-M-0082', clip: E(12, ['r4'], []), anchor: { pos: [-6.3, 1.95, -10.4], size: [0.8, 1.2, 0.1] }, display: { mount: 'stand', pos: [-6.3, 1.95, -10.4], rotY: -0.35, size: [0.8, 1.2], floor: 1.0 } },
    { id: 'light', name: 'His paper on light, 1905', artifact: 'EIN-M-0083', clip: E(12, ['r5'], []), anchor: { pos: [-4.9, 1.95, -10.4], size: [0.8, 1.2, 0.1] }, display: { mount: 'stand', pos: [-4.9, 1.95, -10.4], rotY: -0.35, size: [0.8, 1.2], floor: 1.0 } },
    // Göteborgs stadsmuseum's two photographs of his lecture (Public Domain Mark; owner ruling 2026-10-27), one
    // stop (round 8: a photograph series of one moment), and the first pages of two of his 1905 papers (owner
    // ruling 2026-10-27): the photographs on an easel in front of the stage, the papers on easels on the stage
    // (round 9: lifted clear of its edge; room/roomRecords.js)
    { id: 'photo', name: 'His lecture, 1923', artifact: 'EIN-SERIES-GOTHENBURG-1923', clip: E(12, ['r20'], ['EIN-F-0151']), anchor: { pos: [-14.2, 1.45, -10.4], size: [1.3, 1.1, 0.1] } },
  ],
}

const PHOTO_NOTE = 'The depth is estimated from the photograph; past its edges there is nothing to show.'
const galleryNote = (why) => `Gallery case — ${why}, so the chapter is shown in an IHH gallery. The gallery is not a recreation of a real room.`

const CHAPTERS = [
  chapter({
    id: 'birth',
    kind: 'birth',
    title: 'Born in Ulm',
    year: 1879,
    yearFact: 'EIN-F-0005', // the verified fact that states the year
    factIds: ['EIN-F-0005'],
    place: {
      tier: 'photo',
      label: 'Ulm, Germany',
      note: `Photo room — based on a Library of Congress photochrom (public domain), “[Ulm, Wurtemburg, Germany]”, between ca. 1890 and ca. 1900: a view of the city, not the house where he was born. ${PHOTO_NOTE}`,
      photo: ULM_VIEW,
    },
    // its subject (at.target): the Minster, the city's landmark in the view
    stops: [
      // round 9 (owner directive 2026-10-29): records on the viewing rail, in time order around the photochrom: the
      // children's photograph of 1885 (ETH Library Zurich, Public Domain Mark), then the 1921 article on his birth
      { id: 'children', name: 'Einstein siblings as children, 1885', art: ARTIFACTS['EIN-M-0085'], rail: true, clip: E(21, ['r1'], []) },
      { id: 'photo', name: 'The photochrom', artifact: 'EIN-M-0075', clip: E(12, ['r1'], ['EIN-F-0005']), at: { layer: 'front', ringY: 9, glowY: 4, glowSize: 16, spotY: 5, dolly: 0.6, target: [50, 80, 275, 350] } },
      { id: 'record1921', name: 'Connecticut Hebrew record, April 1, 1921', art: ARTIFACTS['EIN-M-0086'], rail: true, clip: E(21, ['r2'], []) },
    ],
  }),
  chapter({
    id: 'leaving',
    kind: 'leaving',
    title: 'Renouncing German citizenship',
    year: 1933,
    yearFact: 'EIN-F-0109', // the verified fact that states the year
    factIds: ['EIN-F-0109', 'EIN-F-0153'],
    place: {
      tier: 'gallery',
      label: 'IHH gallery',
      note: galleryNote('no verified fact names the place'),
      panel: { eyebrow: 'Leaving · 1933', title: 'German citizenship renounced', factIds: ['EIN-F-0109', 'EIN-F-0153'] },
    },
    // the two 1933 newspaper reports in the case (Chronicling America; owner ruling 2026-10-27), in date order
    stops: [
      // each: what the page shows (a record line), then the verified fact it reports
      { id: 'alaska', name: 'The daily Alaska empire, March 30, 1933', art: ARTIFACTS['EIN-M-0078'], clip: E(12, ['r6'], []) },
      // round 9 (owner directive 2026-10-29): the Evening star of the same day (the ETH photograph in Laeken stays
      // disputed on a live check of its browser snapshot and is not shown)
      { id: 'star1933', name: 'Evening star, March 30, 1933', art: ARTIFACTS['EIN-M-0087'], clip: E(21, ['r3'], []) },
      { id: 'worker', name: 'The daily worker, March 31, 1933', art: ARTIFACTS['EIN-M-0077'], clip: E(12, ['r7'], ['EIN-F-0153']) },
      // fix round 1 (review E7): no panel stop; that he immigrated opens the next chapter, at the Battery (the wall
      // panel still prints the renunciation)
    ],
  }),
  chapter({
    id: 'arriving',
    kind: 'arriving',
    title: 'Arriving in New York',
    year: 1933,
    yearFact: 'EIN-F-0122', // the verified fact that states the year
    factIds: ['EIN-F-0122', 'EIN-F-0157', 'EIN-F-0108', 'EIN-F-0109', 'EIN-F-0123', 'EIN-F-0124', 'EIN-F-0125', 'EIN-F-0126', 'EIN-F-0128'],
    // Round 9 (owner decision 2026-10-29): the globe-to-map leg of his crossing, Southampton to New York, by ship
    // (EIN-F-0157 states the journey and its verb; the Westernland is EIN-F-0122). Never from Ulm (phase-2 ruling).
    // The place photographs on the map: the pier at Southampton (EIN-M-0084) and the Battery (EIN-M-0074).
    map: {
      id: 'arriving-leg',
      title: 'Southampton to New York',
      places: [SOUTHAMPTON, NEWYORK],
      segments: [{ mode: 'ship', label: 'By ship · the Westernland', factIds: ['EIN-F-0157', 'EIN-F-0122'], journey: { facts: ['EIN-F-0157'], from: 'Southampton', to: 'New York' }, modeFacts: ['EIN-F-0157'] }],
      resources: [
        { id: 'res-southampton', label: 'Southampton', lat: SOUTHAMPTON.lat, lon: SOUTHAMPTON.lon, coord: SOUTHAMPTON.coord, factIds: ['EIN-F-0157'], media: ['EIN-M-0084'] },
        { id: 'res-battery', label: 'New York', lat: NEWYORK.lat, lon: NEWYORK.lon, coord: NEWYORK.coord, factIds: ['EIN-F-0124'], media: ['EIN-M-0074'] },
      ],
      narration: E(21, ['m1'], ['EIN-F-0157']),
    },
    place: {
      tier: 'photo',
      label: 'The Battery, New York',
      note: `Photo room — based on a Library of Congress photograph (public domain) of the Battery, New York, in 1933. The photograph shows a different occasion (veterans leaving for a reforestation camp), not the day he arrived in New York, October 17, 1933. ${PHOTO_NOTE}`,
      photo: BATTERY_VIEW,
    },
    // its subject (at.target): the man at the centre of the queue, the photograph's focus
    // on arrival, after the opening (one line): off the liner at Quarantine
    narration: E(5, ['c1'], ['EIN-F-0123']),
    // round 8: the photograph shows another occasion, so its stop tells only the photograph; who came with him and
    // on to Princeton close the chapter
    closing: E(5, ['c2', 'c3', 'c4'], ['EIN-F-0125', 'EIN-F-0126', 'EIN-F-0128']),
    stops: [
      { id: 'photo', name: 'The photograph', artifact: 'EIN-M-0074', clip: E(12, ['r8'], []), at: { layer: 'crowd', ringY: 1.4, ringX: -0.4, glowY: 1.3, glowSize: 4, spotY: 1.5, dolly: 0.6, target: [515, 210, 600, 580] } },
      // round 9 (owner directive 2026-10-29): two reports of October 17, 1933 on the viewing rail
      { id: 'star', name: 'Evening star, October 17, 1933', art: ARTIFACTS['EIN-M-0089'], rail: true, clip: E(21, ['r5'], []) },
      { id: 'times', name: 'The Washington times, October 17, 1933', art: ARTIFACTS['EIN-M-0090'], rail: true, clip: E(21, ['r6'], []) },
    ],
  }),
  chapter({
    id: 'citizen',
    kind: 'citizen',
    title: 'Becoming a citizen',
    year: 1940,
    yearFact: 'EIN-F-0051', // the verified fact that states the year
    factIds: ['EIN-F-0051', 'EIN-F-0001', 'EIN-F-0045', 'EIN-F-0056', 'EIN-F-0057'],
    place: { tier: 'room', label: 'The courthouse, Trenton', room: COURTROOM },
    stops: COURTROOM.artifacts,
  }),
  chapter({
    id: 'big-work',
    kind: 'big-work',
    title: 'Research for the Navy',
    year: 1943,
    yearFact: 'EIN-F-0138', // the verified fact that states the year
    factIds: ['EIN-F-0138', 'EIN-F-0055', 'EIN-F-0054', 'EIN-F-0062', 'EIN-F-0063', 'EIN-F-0087', 'EIN-F-0065', 'EIN-F-0067', 'EIN-F-0069'],
    place: { tier: 'room', label: 'The study, 112 Mercer Street', room: STUDY },
    stops: STUDY.artifacts,
  }),
  chapter({
    id: 'history',
    kind: 'history',
    title: 'A letter to the President',
    year: 1939,
    yearFact: 'EIN-F-0135', // the verified fact that states the year
    factIds: ['EIN-F-0110', 'EIN-F-0135'],
    place: {
      tier: 'gallery',
      label: 'IHH gallery',
      note: galleryNote('no cleared photograph of the place is on file'),
      panel: { eyebrow: 'Part of history · 1939', title: 'A letter to President Roosevelt', factIds: ['EIN-F-0110', 'EIN-F-0135'] },
    },
    // time order (owner decision 2026-10-27): the Emergency Committee and his letter of November 29, 1947
    // are told in the 1955 chapter (EIN-M-0016 is link-only, so no stop opens it), not here in 1939
    stops: [
      { id: 'letter', name: 'Letter to President Roosevelt', art: ARTIFACTS['EIN-M-0063'], clip: E(12, ['r9'], []) },
      { id: 'panel', name: 'The wall panel', panel: true, clip: E(6, ['c2'], ['EIN-F-0135']) },
    ],
  }),
  chapter({
    id: 'honoured',
    kind: 'honoured',
    title: 'The Nobel Prize',
    year: 1922,
    yearFact: 'EIN-F-0147', // the verified fact that states the year
    factIds: ['EIN-F-0147', 'EIN-F-0146', 'EIN-F-0150', 'EIN-F-0151', 'EIN-F-0148', 'EIN-F-0156'],
    place: { tier: 'room', label: 'A lecture hall in Gothenburg', room: GOTHENBURG },
    stops: GOTHENBURG.artifacts,
  }),
  chapter({
    id: 'legacy',
    kind: 'legacy',
    title: 'Home until 1955',
    year: 1955,
    yearFact: 'EIN-F-0107', // the verified fact that states the year
    factIds: ['EIN-F-0107', 'EIN-F-0006', 'EIN-F-0132', 'EIN-F-0087', 'EIN-F-0111', 'EIN-F-0080', 'EIN-F-0075', 'EIN-F-0076', 'EIN-F-0077'],
    place: { tier: 'room', label: '112 Mercer Street, Princeton', room: MERCER_FRONT },
    stops: MERCER_FRONT.artifacts,
  }),
]

export const EINSTEIN = {
  slug: 'einstein',
  name: 'Albert Einstein',
  chapters: inTimeOrder(CHAPTERS), // time order (chapters.js)
  // Landing story points (fact ids) and older links (?stop=study) -> the chapter "Tour from here"
  // opens (data/index.js resolveStop). EIN-F-0114 (San Diego, 1930) has no chapter: the tour starts
  // at the beginning.
  storyStops: {
    'EIN-F-0005': { chapter: 'birth', label: 'Born in Ulm' },
    'EIN-F-0114': { chapter: 'birth', label: 'The tour, from the beginning' },
    'EIN-F-0087': { chapter: 'big-work', label: 'The study, 112 Mercer Street' },
    'EIN-F-0051': { chapter: 'citizen', label: 'The courthouse, Trenton' },
    study: { chapter: 'big-work', label: 'The study, 112 Mercer Street' },
  },
}
