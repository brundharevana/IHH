// A test tour in the chapter shape (chapters.js) for the chapter player and its e2e walk
// (tour.html?inductee=lamarr-demo), one chapter per place tier, until Task 6/10-13 convert the
// inductees: "Arriving" (photo room: the Library of Congress Normandie photograph, LAM-M-0023, after
// a map leg), "The studio" (the rebuilt MGM street room, data/lamarr.js) and "The invention"
// (gallery case: the patent case file LAM-M-0001); the last two have no map leg. Provenance: every
// visitor-facing line is a verified fact's text or a narration clip tied to fact ids
// (assets-src/audio/narration/lamarr.json); the artifact records are the media records' own words
// (demo/lamarr-demo-artifacts.js); the wall panel prints facts by id from facts.generated.json.
// Dates follow data/inductees/lamarr/CONFLICTS.md.
import { chapter } from './chapters.js'
import { narr } from './shape.js'
import { NORMANDIE_HARBOR, STUDIO as STUDIO_ROOM } from './lamarr.js'
import { ARRIVING_CLIP, NATURALIZATION_FILE, NORMANDIE_PHOTO, PANEL_CLIP, PATENT_CASE_FILE, PRINTED_PATENT } from '../demo/lamarr-demo-artifacts.js'

const L = (ch, cues, ids) => narr('lamarr', ch, cues, ids)

// The photograph's camera and proxies: lamarr.js NORMANDIE_HARBOR (re-exported for place.test.js).
export { NORMANDIE_HARBOR }

const ARRIVING = chapter({
  id: 'arriving',
  kind: 'arriving',
  title: 'Arriving',
  year: 1937,
  yearFact: 'LAM-F-0100',
  factIds: ['LAM-F-0100', 'LAM-F-0007', 'LAM-F-0001'],
  place: {
    tier: 'photo',
    label: 'New York Harbor',
    note: 'Photo room — based on a Library of Congress photograph (public domain). Its caption: “S.S. Normandie arriving in New York Harbor on maiden voyage.” The depth is estimated from the photograph; past its edges there is nothing to show.',
    photo: NORMANDIE_HARBOR,
  },
  opening: ARRIVING_CLIP,
  stops: [
    // the photograph: a hotspot over the liner; picking it turns the camera to her and moves in
    { id: 'photo', name: 'The photograph', art: { ...NORMANDIE_PHOTO, clip: ARRIVING_CLIP, listen: 'Hear the chapter' }, at: { layer: 'hull', ringY: 6.2, glowY: 2.5, glowSize: 14, spotY: 3, dolly: 0.7, target: [477, 515, 1290, 700] } },
    // the naturalization file lies on the viewing rail and rises into view when picked
    { id: 'file', name: 'The naturalization file', art: NATURALIZATION_FILE, rail: true },
  ],
})

const STUDIO = chapter({
  id: 'studio',
  kind: 'first-work',
  title: 'The studio',
  year: 1940,
  yearFact: 'LAM-F-0044',
  factIds: ['LAM-F-0044', 'LAM-F-0043'],
  // round 8: the street front's own stops were room notes only; the room shows the 1939 portrait
  place: { tier: 'room', label: 'MGM studios, Culver City', room: STUDIO_ROOM },
  opening: STUDIO_ROOM.narration,
  stops: STUDIO_ROOM.artifacts,
})

const INVENTION = chapter({
  id: 'big-work',
  kind: 'big-work',
  title: 'The invention',
  year: 1941,
  yearFact: 'LAM-F-0091',
  factIds: ['LAM-F-0086', 'LAM-F-0096', 'LAM-F-0084', 'LAM-F-0090', 'LAM-F-0091', 'LAM-F-0092', 'LAM-F-0093', 'LAM-F-0094', 'LAM-F-0095'],
  // no map leg: a chapter that opens straight on its place (the e2e checks nothing moves before Begin)
  place: {
    tier: 'gallery',
    label: 'Los Angeles',
    note: 'Gallery case — no photograph of the place is on file, so the documents are shown in an IHH gallery. The gallery is not a recreation of a real room.',
    panel: { eyebrow: 'The invention · Los Angeles', title: 'Secret Communication System', factIds: ['LAM-F-0091', 'LAM-F-0093', 'LAM-F-0092', 'LAM-F-0090', 'LAM-F-0094', 'LAM-F-0095'] },
  },
  opening: L(1, ['c4'], ['LAM-F-0096']),
  stops: [
    // seven pages of the case file are on file; the bed shows four of them (ARTIFACTS.md order)
    { id: 'file', name: 'Patent case file', art: PATENT_CASE_FILE, pages: [0, 1, 2, 4] },
    { id: 'patent', name: 'The printed patent', art: PRINTED_PATENT, extra: ' · Printed patent page' },
    { id: 'panel', name: 'The wall panel', panel: true, clip: PANEL_CLIP },
  ],
})

export const LAMARR_CHAPTERS_DEMO = { slug: 'lamarr-demo', name: 'Hedy Lamarr', chapters: [ARRIVING, STUDIO, INVENTION] }
