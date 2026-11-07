// John Muir's tour as turning-point chapters (chapters.js; spec 2.2), played by ChapterPlayer.jsx.
// A chapter exists only where verified facts exist and its main fact gives a year
// (data/inductees/muir/ROOMS.md, chapter table): no "education" chapter (his university years rest on
// single-source facts: the enrolment is early 1861 by the CONFLICTS.md ruling, but that fact is single-source),
// no separate "leaving" chapter (his leaving Scotland, MUI-F-0097, names no place and no reason: it is
// told on the map leg of "Arriving"), no "citizen" chapter (single-source and disputed facts only), no
// "legacy" chapter (his death, MUI-F-0081 "died in Los Angeles", is verified but its claim names no
// date: it is the last line of "Why the Hall honours him"). Two chapters share the kind "big-work" (Yosemite, 1868; the
// John Muir House, 1890: ROOMS.md 7a and 7b); the second keys its opening by its id
// ('muir:ch:study:opening', check_narration.py).
// Every visitor-facing sentence about him is the text of a verified fact (ids alongside) or a narration
// clip tied to fact ids (assets-src/audio/narration/muir.json, gated by check_narration.py); the chapter
// openings are the voiced lines 'muir:ch:<kind>:opening' of that file. Room notes (the recreation, not
// him) cite their room's INVENTORY.md. Dates follow data/inductees/muir/CONFLICTS.md: he left Scotland
// in 1849 (no month: the manifest reading is unconfirmed), aged ten; the enrolment and the Griswold
// botany lesson are not shown. Single-source facts are neither shown nor spoken. Coordinates:
// ./coords.snapshot.json.
//
// Places (spec 2.3): rebuilt rooms (High Street, Dunbar, rebuilt from the HES listing and a
// reference-only photograph, MUI-F-0145 naming the birthplace, Task 14c; North Hall, Madison, about
// 1885: a building in the city of the 1860 State Fair, not a place he is verified at; a room of the
// Hutchings hotel, Yosemite Valley, about 1902: not his cabin; the study of the John Muir House as
// photographed in October 1960; the Hetch Hetchy Valley about 1911, before the dam) and photo rooms
// (Fountain Lake, a 1923 photograph, and Glacier Point, the July 1903 stereograph: both rebuilds were set
// aside, assets-src/muir-fountain-lake/DECISION.md, assets-src/muir-glacier-point-1903/DECISION.md).
// Where a room's glb label says more than the verified facts do, or less than the tour must say, `labelText` replaces it.
import { narr } from './shape.js'
import { chapter, inTimeOrder } from './chapters.js'
import { MUIR_ARTIFACTS as ART } from './muir-artifacts.js'
import POSES from './room-poses.json'

const M = (ch, cues, ids) => narr('muir', ch, cues, ids)

// the 1849 route (MUI-F-0098, MUI-F-0099): of its modes only "by boat to Albany" is named, so that
// segment carries the ship and the others keep the neutral marker
const PENDING = 'mode of travel pending verification'
const NEWYORK = { id: 'newyork', label: 'New York City', side: 'right', date: '1849', note: 'The Muirs landed', lat: 40.71277777777778, lon: -74.00611111111111, coord: 'wikidata:Q60', factIds: ['MUI-F-0098'] }
const ALBANY = { id: 'albany', label: 'Albany', minor: true, lat: 42.65, lon: -73.766666666667, coord: 'wikidata:Q24861', factIds: ['MUI-F-0098'] }
const BUFFALO = { id: 'buffalo', label: 'Buffalo', minor: true, lat: 42.88638888888889, lon: -78.87805555555556, coord: 'wikidata:Q40435', factIds: ['MUI-F-0098'] }
const MILWAUKEE = { id: 'milwaukee', label: 'Milwaukee', minor: true, lat: 43.05, lon: -87.95, coord: 'wikidata:Q37836', factIds: ['MUI-F-0099'] }
const KINGSTON = { id: 'kingston', label: 'Kingston', minor: true, lat: 43.6936, lon: -89.1286, coord: 'wikidata:Q3241022', factIds: ['MUI-F-0099'] }

// ---------- rebuilt rooms (shape.js room) ----------
// Guide spot and camera poses per device: room-poses.json.

// 126 and 128 High Street, Dunbar, from an undated photograph (assets-src/muir-dunbar-high-street/
// INVENTORY.md; Task 14c): John Muir's birthplace (MUI-F-0145, verified, from the HES listing). The
// building is rebuilt from the listing's text and a photograph used as reference only (photographer
// unknown: no pixel of it is shown, and it is never a record). The tour's label says so.
export const DUNBAR_LABEL =
  'Recreation based on a listing and a reference photograph: High Street, Dunbar, from an undated photograph (NPS). John Muir’s birthplace is 126 and 128 High Street, Dunbar (Historic Environment Scotland, listed building LB24825). The building is a rebuild from the listing’s description and from the photograph, which is used as reference only (its photographer is unknown), so every surface is drawn; a bay beyond the photograph’s edge follows the listing, which describes the building as it stands today. At its right, the Lorne Temperance Hotel. People are not modelled.'
// the passport application shown on the street: where it was made is not on file
export const PASSPORT_NOTE = 'Shown here in Dunbar; no source on file says where the application was made.'
const DUNBAR_STREET = {
  id: 'muir-dunbar-high-street',
  title: 'High Street, Dunbar',
  model: '/models/muir-dunbar-high-street/muir-dunbar-high-street',
  ...POSES['muir-dunbar-high-street'],
  labelText: DUNBAR_LABEL,
  fog: [60, 140],
  // the opening tells the address of his birthplace (no arrival line); round 8: no architecture-only stop
  artifacts: [
    // his 1903 passport application (the gallery case's record), on an invisible anchor in the street
    { id: 'passport', name: 'Passport application, 1903', artifact: 'MUI-M-0062', clip: M(13, ['r1'], []), anchor: { pos: [-6.25, 1.4, 0.95], size: [0.4, 0.5, 0.05] }, display: { mount: 'stand', pos: [-6.25, 1.4, 0.95], rotY: 0, size: [0.4, 0.5] }, placeNote: PASSPORT_NOTE, placeNoteLabel: 'Not made here' },
    // round 9 (owner directive 2026-10-29: chapters with fewer than 3 records get more): the first page of his
    // book of 1913, on his native town of Dunbar, on an easel beside the passport application
    { id: 'boyhood', name: 'The story of my boyhood and youth', artifact: 'MUI-M-0094', clip: M(21, ['r1'], []), anchor: { pos: [-5.05, 1.4, 0.95], size: [0.32, 0.55, 0.05] }, display: { mount: 'stand', pos: [-5.05, 1.4, 0.95], rotY: 0, size: [0.32, 0.55] }, placeNote: 'Shown here in Dunbar; the book was published in 1913.', placeNoteLabel: 'Not made here' },
  ],
}

// North Hall, University of Wisconsin, Madison, about 1885 (assets-src/muir-north-hall/INVENTORY.md).
// Its glb label says he lived there as a student (a single-source fact) and gives his enrolment
// years (single-source), so the tour shows this label instead. The 1860 State Fair was in Madison
// (MUI-F-0111), and Muir had a dormitory room in North Hall (MUI-F-0153, verified round 9: Wisconsin Historical
// Society and UW-Madison News): the chapter's opening says both, so the room is tied to him up front (owner
// feedback round 9 item 6). The drawings keep their "Not drawn here" notes: no source says where he drew them.
export const NORTH_HALL_LABEL =
  'Recreation based on a photograph: North Hall, University of Wisconsin, Madison, about 1885 (UW-Madison Archives S05904). Muir had a dormitory room in North Hall; the photograph was taken years after the State Fair of 1860. Colours are interpretive: the photograph is a sepia print.'
// the drawings shown on the lawn: where he made them is not on file
export const DRAWINGS_NOTE = 'Shown here in Madison; no verified fact says where the drawings were made.'
const NORTH_HALL = {
  id: 'muir-north-hall',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['MUI-M-0075'],
  title: 'North Hall, Madison · about 1885',
  model: '/models/muir-north-hall/muir-north-hall',
  ...POSES['muir-north-hall'],
  labelText: NORTH_HALL_LABEL,
  fog: [90, 260],
  // feedback round 7: no arrival line (the opening tells the State Fair); round 8: no architecture-only stop; once
  // every stop is seen, the accident of 1867 that leads to the next chapter
  closing: M(2, ['c3'], ['MUI-F-0090']),
  artifacts: [
    // his 1863 drawings on easels in front of North Hall's south-east front, on the lawn as it rises to the
    // building (1.17 m; owner feedback round 9: not on stands out on the open lawn)
    { id: 'clock', name: 'Clock design, 1863', artifact: 'MUI-M-0034', clip: M(13, ['r5'], []), anchor: { pos: [-1.98, 2.52, -49.11], size: [0.6, 0.5, 0.05] }, display: { mount: 'stand', pos: [-1.98, 2.52, -49.11], rotY: 0.75, size: [0.6, 0.5], floor: 1.17 }, placeNote: DRAWINGS_NOTE, placeNoteLabel: 'Not drawn here' },
    { id: 'star', name: 'The star hand, 1863', artifact: 'MUI-M-0035', clip: M(13, ['r6'], []), anchor: { pos: [-0.79, 2.52, -50.23], size: [0.6, 0.4, 0.05] }, display: { mount: 'stand', pos: [-0.79, 2.52, -50.23], rotY: 0.75, size: [0.6, 0.4], floor: 1.17 }, placeNote: DRAWINGS_NOTE, placeNoteLabel: 'Not drawn here' },
    // round 9 (owner directive 2026-10-29): the plate of his combined thermometer from his book of 1913, the third easel
    { id: 'thermometer', name: 'Combined thermometer (plate, 1913)', artifact: 'MUI-M-0097', clip: M(21, ['r4'], []), anchor: { pos: [0.4, 2.52, -51.35], size: [0.36, 0.6, 0.05] }, display: { mount: 'stand', pos: [0.4, 2.52, -51.35], rotY: 0.75, size: [0.36, 0.6], floor: 1.17 }, placeNote: 'Shown here in Madison; the plate is from his book of 1913.', placeNoteLabel: 'Not made here' },
    // the 1885 photograph of North Hall is no stop: it remains the room's basis, its label's record (the room is tied to
    // him by his dormitory room, MUI-F-0153, in the opening)
  ],
}

// A room of the Hutchings hotel, Yosemite Valley, as photographed about 1902
// (assets-src/muir-hutchings-house/INVENTORY.md). Its glb label repeats two single-source facts (the
// sawmill he ran for Hutchings, his settling in the valley in 1869), so the tour shows this label.
export const HUTCHINGS_LABEL =
  'Recreation based on a photograph: “Room in the old Hutchings House--first in the valley--built around an 8 foot cedar tree, Yosemite Valley, Cal.”, Underwood & Underwood stereograph, about 1902 (Library of Congress). A room of the Hutchings hotel as photographed about 1902: it is not John Muir’s cabin, and no verified fact places him in this room. The people in the photograph are not modelled. Colours are interpretive: the photograph is black and white.'
export const REGISTER_NOTE = 'Photographed in August 1938; no source on file says where the register was kept.'
export const FERN_NOTE = 'The specimen’s record names John Muir, 1875, Sierra Nevada; it does not tie the sheet to this room.'
const HUTCHINGS = {
  id: 'muir-hutchings-house',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['MUI-M-0078'],
  title: 'The Hutchings House, Yosemite Valley · about 1902',
  model: '/models/muir-hutchings-house/muir-hutchings-house',
  ...POSES['muir-hutchings-house'],
  labelText: HUTCHINGS_LABEL,
  fog: [9, 20],
  narration: M(7, ['n1'], []),
  // closing: his cabin, then his marriage (1880, after this chapter's 1868; the study chapter opens in 1890)
  closing: { keys: ['muir:5:c3', 'muir:3:c1'], factIds: ['MUI-F-0119', 'MUI-F-0120'] },
  artifacts: [
    // stops run round the room, left wall to right wall (the two wall records are seen from across the
    // room, so no turn between neighbours is more than about 110 degrees). The two Yosemite records hang
    // on the plain side walls (anchors: the walls are one node); the stereograph the room is modelled
    // from, where it was taken (the room's hotspot_1)
    // round 9 (owner directive 2026-10-29): My First Summer in the Sierra (1911), on the left wall beside the register, first (the walk round the room stays left wall to right wall)
    { id: 'summer', name: 'My first summer in the Sierra', artifact: 'MUI-M-0098', clip: M(21, ['r5'], []), anchor: { pos: [-3.1, 1.45, -0.95], size: [0.05, 0.5, 0.3] } },
    { id: 'register', name: 'The Grand Register', artifact: 'MUI-M-0063', clip: M(13, ['r8'], []), anchor: { pos: [-3.1, 1.45, -1.8], size: [0.05, 0.5, 0.7] }, placeNote: REGISTER_NOTE, placeNoteLabel: 'Where this was photographed' },
    // fix round 1 (controller ruling): the 1902 stereograph of the Hutchings room is no stop: no verified fact ties John
    // Muir to the room (it remains the room's basis, its label's record)
    { id: 'fern', name: 'Fern sheet, 1875', artifact: 'MUI-M-0064', clip: M(13, ['r10'], []), anchor: { pos: [2.95, 1.45, -1.8], size: [0.05, 0.6, 0.42] }, placeNote: FERN_NOTE, placeNoteLabel: 'Where this was collected' },
  ],
}

// The study, John Muir House, Martinez, as HABS photographed it in October 1960
// (assets-src/muir-martinez-study/INVENTORY.md; furnishings after the 1955 refurnishing, not his). The
// glb label says so.
export const PORTRAIT_NOTE = 'A printed reproduction of a drawing in a letter of February 23, 1887; the letter is not from this room.'
const STUDY = {
  id: 'muir-martinez-study',
  title: 'The study, John Muir House',
  model: '/models/muir-martinez-study/muir-martinez-study',
  // labelText replaces the label in the glb (whose numbers came from a modelling reference or were
  // computed): every number shown is grounded (displayedNumbers.js, Codex Task 19 round 3)
  labelText:
    "Recreation based on the Historic American Buildings Survey record of the John Muir House (Library of Congress): a HABS photograph of the bedroom and study, from which the wallpaper is taken, and the measured drawings. The room is shown as HABS photographed it, after the house was refurnished; the furnishings are not Muir's own.",
  ...POSES['muir-martinez-study'],
  fog: [10, 20],
  // once every stop is seen: his books, then (time order) the Sierra Club of 1892 and his book of 1901
  closing: M(3, ['c7'], ['MUI-F-0014']),
  artifacts: [
    // the 1887 self-portrait, on the south wall east of the door (no node of its own: an anchor), a
    // quarter turn from the mantel wall
    { id: 'portrait', name: 'Self-portrait, 1887', artifact: 'MUI-M-0020', clip: M(13, ['r11'], []), anchor: { pos: [1.1, 1.5, 2.6], size: [0.34, 0.42, 0.05] }, placeNote: PORTRAIT_NOTE, placeNoteLabel: 'Not drawn here' },
    // round 9 (owner directive 2026-10-29): the Sierra Club's articles and charter members (1892) and Our National Parks
    // (1901), on the same wall, each with the line of its year (time order: they were the closing's)
    { id: 'sierra', name: 'The Sierra Club, 1892', artifact: 'MUI-M-0066', clip: { keys: ['muir:21:r6', 'muir:3:c3'], factIds: ['MUI-F-0006'] }, anchor: { pos: [0.55, 1.5, 2.6], size: [0.3, 0.5, 0.05] }, placeNote: 'Shown here in Martinez; the book is at the Library of Congress.', placeNoteLabel: 'Not made here' },
    { id: 'parks', name: 'Our National Parks, 1901', artifact: 'MUI-M-0099', clip: { keys: ['muir:21:r7', 'muir:3:c5'], factIds: ['MUI-F-0043'] }, anchor: { pos: [1.65, 1.5, 2.6], size: [0.3, 0.5, 0.05] }, placeNote: 'Shown here in Martinez; the book is at the Library of Congress.', placeNoteLabel: 'Not made here' },
  ],
}

// ---------- the photo room (place/photoProjection.js) ----------
// Glacier Point, July 1903: the right image of the Underwood & Underwood stereograph MUI-M-0079 (LoC
// 2010647431, public domain), from the LoC master TIFF (assets-src/muir-glacier-point-1903/
// build_photo_room.py; pixel coordinates of that TIFF). The full rebuild of the ledge
// (muir-glacier-point-1903 glb) is not used: one photographed frame cannot carry a convincing walkable
// room (assets-src/muir-glacier-point-1903/DECISION.md). Camera solved by hand: focal length about
// 3000 px (the stereo camera of the earlier rebuild); the pitch from the horizon row 850 (the far
// ridge stands above it); the height so Roosevelt (taken as 1.78 m, hat to boots 1395 px) stands
// about 3.8 m away: 1.2 m. One proxy layer, a card for Roosevelt at his boots; the ground runs to the
// ledge's far edge (row 1530), the valley is the far backdrop. Units: metres. At rest the desktop view
// is tilted up so the standing figure is not cut by the screen; the phone view looks straight down the
// photographer's axis, so he stands right of the guide, never behind her (Task 13 fix round 1).
export const GLACIER_VIEW = {
  mediaId: 'MUI-M-0079',
  crop: { x: 2560, y: 385, w: 1920, h: 1715 },
  camera: { fovDeg: 31.9, pitchDeg: 7.454, height: 1.2 },
  backdropRow: 1530,
  layers: [{ id: 'figure', kind: 'card', mask: 0, at: [3880, 1780], width: 0.32, height: 2.1, y: 1.05 }],
  look: { yawDeg: 7, yawDegPhone: 14, pitchDeg: 7, dolly: 1.2, orbit: 0.25, pivot: 'figure', restPitchDeg: 6.3, restYawDegPhone: 0, restPitchDegPhone: 4 },
}
const PHOTO_NOTE = 'The depth is estimated from the photograph; past its edges there is nothing to show.'
export const GLACIER_NOTE = `Photo room — based on a Library of Congress stereograph (public domain): Underwood & Underwood, “President Roosevelt’s choicest recreation - amid nature’s rugged grandeur on Glacier Point, Yosemite”, c1903 July 18 (right image). It shows President Roosevelt on the ledge; John Muir is not in this photograph. ${PHOTO_NOTE}`

// Fountain Lake, 1923: a photo room of WHi 40628 (MUI-M-0086, Wisconsin Historical Society, public
// domain; assets-src/muir-fountain-lake/build_photo_room.py, pixel coordinates of the holder's 1200 px
// file). The full rebuild was set aside (Task 14c fix round 1, assets-src/muir-fountain-lake/DECISION.md).
// Camera set by hand: a normal lens (40 degrees across the frame's height), the horizon at the far tree
// line (row 430, so the camera is tilted up 2 degrees), and the camera 6 m over a level ground so the
// near shore (row 570) is about 45 m away and the far shore (row 475, the backdrop) about 140 m: the
// meadow falls to the lake, which one level ground cannot show, so the depth is an estimate. Two card
// layers stand for the dark bushes either side of the view (R left, G right).
export const FOUNTAIN_VIEW = {
  mediaId: 'MUI-M-0086',
  crop: { x: 0, y: 0, w: 1200, h: 786 },
  camera: { fovDeg: 40, pitchDeg: -1.96, height: 6 },
  backdropRow: 475,
  layers: [
    { id: 'left', kind: 'card', mask: 0, at: [170, 786], width: 0.36, height: 8.5, y: 4.25 },
    { id: 'right', kind: 'card', mask: 1, at: [1050, 786], width: 0.32, height: 8.5, y: 4.25 },
  ],
  look: { yawDeg: 6, yawDegPhone: 14, pitchDeg: 4, dolly: 10, orbit: 0.2, pivot: 'right', restYawDegPhone: 0 },
}
export const FOUNTAIN_NOTE = `Photo room — based on a Wisconsin Historical Society photograph (public domain): “Muir’s Fountain Lake Home”, 1923 (WHi 40628). It shows the lake from the meadow, through oak branches; the Muir farmhouse is not in it. John Muir lived continually at the Fountain Lake farm from 1849-1856. ${PHOTO_NOTE}`

// The Hetch Hetchy Valley before the dam, about 1911 (assets-src/muir-hetch-hetchy/INVENTORY.md). The
// glb label names the panorama and the petition (MUI-F-0071, verified) and places nobody on the meadow.
const HETCH_HETCHY = {
  id: 'muir-hetch-hetchy',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['MUI-M-0082', 'MUI-M-0083'],
  title: 'Hetch Hetchy Valley · about 1911, before the dam',
  model: '/models/muir-hetch-hetchy/muir-hetch-hetchy',
  ...POSES['muir-hetch-hetchy'],
  fog: [350, 1000],
  // a natural landscape: no built structure in the room (assets-src/muir-hetch-hetchy/INVENTORY.md: the meadow,
  // its grass and flowers, the photographed valley 260 m out), so the panorama stands on an easel in the meadow
  // (round 9 placement rule: an easel stands near architecture, or, in a landscape, on its ground; e2e/camcheck.mjs)
  landscape: true,
  // the last chapter in time order (1911, his book of that year): on arrival (one line), his office in the
  // Society; once every stop is seen, the preservationist, the petition against the dam (undated: told with
  // no time word) and his death
  // the opening tells the preservationist and his office in the Society (round 7 re-review 2: about the valley
  // and his fight for it); once every stop is seen, his book of 1911, the petition against the dam (undated:
  // no time word) and his death
  // fix round 1 (review M7): the 1911 book opens the chapter; the petition, the Raker Bill and his death close it
  closing: { keys: ['muir:9:c2', 'muir:9:c6', 'muir:9:c5'], factIds: ['MUI-F-0070', 'MUI-F-0071', 'MUI-F-0081'] },
  artifacts: [
    // the panorama the valley is modelled from, where it was taken (hotspot_1)
    { id: 'photo', name: 'The panorama, about 1911', artifact: 'MUI-M-0082', clip: M(13, ['r12'], []), anchor: { pos: [0, 1.45, -1.3], size: [0.9, 0.35, 0.05] } },
    // round 9 (owner directive 2026-10-29): his printed call to save the valley (Library of Congress, dated 1911), on an
    // easel in the meadow right of the panorama (the guide keeps the left) (the 1914 report of his death, MUI-M-0101, is not shown: no verified fact
    // gives his death year)
    { id: 'call', name: 'Let everyone help to save Hetch-Hetchy', artifact: 'MUI-M-0065', clip: M(21, ['r8'], []), anchor: { pos: [1.15, 1.45, -1.15], size: [0.3, 0.45, 0.05] }, display: { mount: 'stand', pos: [1.15, 1.45, -1.15], rotY: -0.25, size: [0.3, 0.45] } },
  ],
}

const CHAPTERS = [
  chapter({
    id: 'birth',
    kind: 'birth',
    title: 'Born in Dunbar',
    year: 1838,
    yearFact: 'MUI-F-0092', // the verified fact that states the year
    factIds: ['MUI-F-0092', 'MUI-F-0001', 'MUI-F-0062', 'MUI-F-0145'],
    place: { tier: 'room', label: '126 and 128 High Street, Dunbar', room: DUNBAR_STREET },
    stops: DUNBAR_STREET.artifacts,
  }),
  chapter({
    id: 'arriving',
    kind: 'arriving',
    title: 'Fountain Lake farm',
    year: 1849,
    yearFact: 'MUI-F-0098', // the verified fact that states the year
    factIds: ['MUI-F-0098', 'MUI-F-0097', 'MUI-F-0099', 'MUI-F-0082', 'MUI-F-0100', 'MUI-F-0103', 'MUI-F-0104', 'MUI-F-0102', 'MUI-F-0106', 'MUI-F-0107', 'MUI-F-0108', 'MUI-F-0105'],
    map: {
      id: 'arriving-leg',
      // every segment rests on a verified fact stating that city-to-city journey (chapters.js
      // validateTour). The leg starts at New York City: the crossing is known only country to country
      // ("left Scotland for the United States", MUI-F-0097), so no line is drawn from Dunbar. It ends at
      // Kingston: no fact takes the family on from Kingston to the farm, the chapter's place.
      // Round 9 (owner decision 2026-10-29): the crossing is drawn from Dunbar, his birthplace (MUI-F-0092), to New
      // York City, un-routed: the only crossing fact is country to country (MUI-F-0097), so no ship and the on-map note.
      // The farm's 1923 photographs are the map's place photographs (Fountain Lake farm, MUI-F-0100).
      title: 'Dunbar to Kingston',
      places: [{ id: 'dunbar', label: 'Dunbar', date: '1838', note: 'His birthplace', lat: 55.998333333333, lon: -2.5227777777778, coord: 'wikidata:Q1002133', factIds: ['MUI-F-0092'] }, NEWYORK, ALBANY, BUFFALO, MILWAUKEE, KINGSTON],
      resources: [
        { id: 'res-fountain', label: 'Fountain Lake farm', lat: 43.69166667, lon: -89.38722222, coord: 'wikidata:Q5474741', factIds: ['MUI-F-0100'], media: ['MUI-M-0086', 'MUI-M-0084', 'MUI-M-0085'] },
      ],
      segments: [
        { routed: false, mode: null },
        { mode: 'ship', label: 'By boat to Albany', factIds: ['MUI-F-0098'], journey: { facts: ['MUI-F-0098'], from: 'New York City', to: 'Albany' }, modeFacts: ['MUI-F-0098'] },
        { mode: null, label: `Across the Erie Canal · ${PENDING}`, factIds: ['MUI-F-0098'], journey: { facts: ['MUI-F-0098'], from: 'Albany', to: 'Buffalo' } },
        { mode: null, label: `Across the Great Lakes · ${PENDING}`, factIds: ['MUI-F-0099'], journey: { facts: ['MUI-F-0099'], from: 'Buffalo', to: 'Milwaukee' } },
        { mode: null, label: `Overland · ${PENDING}`, factIds: ['MUI-F-0099'], journey: { facts: ['MUI-F-0099'], from: 'Milwaukee', to: 'Kingston' } },
      ],
      narration: M(1, ['c2', 'c3', 'c4'], ['MUI-F-0097', 'MUI-F-0098', 'MUI-F-0099']),
    },
    place: { tier: 'photo', label: 'Fountain Lake, Wisconsin (1923)', note: FOUNTAIN_NOTE, photo: FOUNTAIN_VIEW },
    // once the photographs are seen (round 8: what the farm is and meant is not what the 1923 photographs show):
    // its name, what it meant to him, then the move away from the farm, to Hickory Hill (it leads into the next
    // chapter)
    closing: { keys: ['muir:1:c5', 'muir:5:c4', 'muir:5:c5', 'muir:5:c1', 'muir:5:c2'], factIds: ['MUI-F-0102', 'MUI-F-0105', 'MUI-F-0106', 'MUI-F-0107', 'MUI-F-0108'] },
    stops: [
      // the photograph the view is projected from, over the bushes on the right; its subject is the right
      // half of the lake and the far shore beyond it (the guide stands on the left). Round 8: the three 1923
      // photographs of the farm (this one and the two that lay on the viewing rail) are one stop, a photograph
      // series the viewer steps through
      { id: 'photo', name: 'Muir’s Fountain Lake Home, 1923', artifact: 'MUI-SERIES-FOUNTAIN-1923', clip: M(13, ['r15'], ['MUI-F-0100']), at: { layer: 'right', ringY: 5, glowY: 3, glowSize: 6, spotY: 4, dolly: 0.4, target: [620, 430, 940, 575] } },
      // round 9 (owner directive 2026-10-29): two plates from his sketches in his book of 1913, on the viewing rail
      { id: 'shanty', name: 'Our First Wisconsin Home (plate)', art: ART['MUI-M-0095'], rail: true, clip: M(21, ['r2'], []) },
      { id: 'lake', name: 'Fountain Lake and the Garden Meadow (plate)', art: ART['MUI-M-0096'], rail: true, clip: M(21, ['r3'], []) },
    ],
  }),
  chapter({
    id: 'first-work',
    kind: 'first-work',
    title: 'Inventions, Madison',
    year: 1860,
    yearFact: 'MUI-F-0111', // the verified fact that states the year
    factIds: ['MUI-F-0111', 'MUI-F-0153', 'MUI-F-0091', 'MUI-F-0108', 'MUI-F-0090'],
    place: { tier: 'room', label: 'North Hall, Madison (about 1885)', room: NORTH_HALL },
    stops: NORTH_HALL.artifacts,
  }),
  chapter({
    id: 'big-work',
    kind: 'big-work',
    title: 'Yosemite',
    year: 1868,
    yearFact: 'MUI-F-0141', // the verified fact that states the year
    factIds: ['MUI-F-0141', 'MUI-F-0084', 'MUI-F-0119', 'MUI-F-0120'],
    place: { tier: 'room', label: 'The Hutchings House, Yosemite Valley (about 1902)', room: HUTCHINGS },
    stops: HUTCHINGS.artifacts,
  }),
  chapter({
    id: 'study',
    kind: 'big-work',
    title: 'The John Muir House',
    year: 1890,
    yearFact: 'MUI-F-0123', // the verified fact that states the year
    factIds: ['MUI-F-0123', 'MUI-F-0014', 'MUI-F-0069', 'MUI-F-0142', 'MUI-F-0006', 'MUI-F-0043'],
    // the second "big-work" chapter: its own opening line (narration/muir.json chapters.study); it picks up
    // the marriage of 1880 (MUI-F-0120, the previous chapter's)
    opening: { keys: ['muir:ch:study:opening'], factIds: ['MUI-F-0120', 'MUI-F-0123', 'MUI-F-0142'] },
    place: { tier: 'room', label: 'The John Muir House, Martinez', room: STUDY },
    stops: STUDY.artifacts,
  }),
  chapter({
    id: 'history',
    kind: 'history',
    title: 'In Yosemite with Roosevelt',
    year: 1903,
    yearFact: 'MUI-F-0146', // the verified fact that states the year
    // MUI-F-0146 and -0148 (verified, Task 14c) are the opening's; MUI-F-0086 the record's line
    factIds: ['MUI-F-0146', 'MUI-F-0086', 'MUI-F-0148', 'MUI-F-0149'],
    place: { tier: 'photo', label: 'Glacier Point, Yosemite (July 1903)', note: GLACIER_NOTE, photo: GLACIER_VIEW },
    // fix round 1 (review M8): the four photographs his photographer made are told on their own, after the series (no
    // source says these are those four)
    closing: M(14, ['c1'], ['MUI-F-0149']),
    stops: [
      // the stereograph the view is projected from, over Roosevelt. Round 8: with the 1903 stereograph of both
      // men on Glacier Point (it lay on the viewing rail), one stop: the photographs of one moment, a
      // photograph series the viewer steps through
      { id: 'photo', name: 'On Glacier Point, 1903', artifact: 'MUI-SERIES-GLACIER-1903', clip: M(13, ['r16'], []), at: { layer: 'figure', ringY: 1.4, glowY: 0.9, glowSize: 1.6, spotY: 1.2, dolly: 0.6, target: [3628, 385, 4184, 1796] } },
      // round 9 (owner directive 2026-10-29): the San Francisco call's front page of May 18, 1903, on the viewing rail
      { id: 'call1903', name: 'The San Francisco call, May 18, 1903', art: ART['MUI-M-0100'], rail: true, clip: M(21, ['r10'], []) },
    ],
  }),
  // fix round 1 of round 7: keyed as legacy, dated by his book of 1911 (the year of the panorama): its petition
  // and his death are told after Glacier Point (1903); the Sierra Club (1892) closes the Martinez chapter
  chapter({
    id: 'legacy',
    kind: 'legacy',
    title: 'Hetch Hetchy',
    year: 1911,
    yearFact: 'MUI-F-0046', // the verified fact that states the year
    factIds: ['MUI-F-0046', 'MUI-F-0071', 'MUI-F-0070', 'MUI-F-0142', 'MUI-F-0078', 'MUI-F-0080', 'MUI-F-0081'],
    place: { tier: 'room', label: 'Hetch Hetchy Valley (about 1911, before the dam)', room: HETCH_HETCHY },
    stops: HETCH_HETCHY.artifacts,
  }),
]

export const MUIR = {
  slug: 'muir',
  name: 'John Muir',
  chapters: inTimeOrder(CHAPTERS), // time order (chapters.js)
  // Landing story points (fact ids) and older links (?stop=leg-1, leg-2, study) -> the chapter "Tour
  // from here" opens (data/index.js resolveStop).
  storyStops: {
    'MUI-F-0092': { chapter: 'birth', label: 'Born in Dunbar' },
    'MUI-F-0082': { chapter: 'arriving', label: 'Fountain Lake farm' },
    'MUI-F-0090': { chapter: 'big-work', label: 'Yosemite' },
    'MUI-F-0086': { chapter: 'history', label: 'In Yosemite with Roosevelt' },
    'MUI-F-0006': { chapter: 'study', label: 'The John Muir House: the Sierra Club' },
    'MUI-F-0071': { chapter: 'legacy', label: 'Hetch Hetchy' },
    'leg-1': { chapter: 'arriving', label: 'Fountain Lake farm' },
    'leg-2': { chapter: 'big-work', label: 'Yosemite' },
    study: { chapter: 'study', label: 'The John Muir House' },
  },
}
