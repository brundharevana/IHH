// James Naismith's tour as turning-point chapters (chapters.js; spec 2.2), played by ChapterPlayer.jsx.
// A chapter exists only where verified facts exist and its main fact gives a year
// (data/inductees/naismith/ROOMS.md, chapter table): no "leaving" chapter (the McGill resignation
// minutes are single-source), no "arriving" chapter (his coming to Springfield in 1890 is
// single-source; NAI-F-0080 is verified but undated), no "citizen" chapter (1925 is single-source,
// the Douglas County dates disputed). His appointment as instructor at McGill (NAI-F-0084) is verified
// but no verified fact dates it (the 1888 post of CONFLICTS.md rests on single-source facts), so it
// has no chapter of its own: it is told in "Education" (the Presbyterian College, 1887), and the
// Old Hall room (naismith-mcgill-old-hall) is not used.
// Every visitor-facing sentence about him is the text of a verified fact (ids alongside) or a
// narration clip tied to fact ids (assets-src/audio/narration/naismith.json, gated by
// check_narration.py); the chapter openings are the voiced lines 'naismith:ch:<kind>:opening' of that
// file. Room notes (the recreation, not him) cite their room's INVENTORY.md. Dates follow
// data/inductees/naismith/CONFLICTS.md (wedding 1894, retirement 1937; the orphaned year is
// omitted). Single-source facts are neither shown nor spoken. Coordinates: ./coords.snapshot.json.
//
// Places (spec 2.3): five rebuilt rooms (Almonte's high school about 1910: the town, not his
// birthplace; the Presbyterian College dining room, April 1889; the Springfield gymnasium; Robinson
// Gymnasium, Lawrence; the present Hall of Fame grounds, 2019), and gallery cases where no photograph
// of the place is on file (Berlin 1936; Lawrence 1939). Two room labels (Almonte, Springfield) say
// more in their glb than the verified facts do; `labelText` replaces them (see below).
import { narr } from './shape.js'
import { ARTIFACTS } from './artifacts.js'
import { chapter, inTimeOrder } from './chapters.js'
import POSES from './room-poses.json'

const N = (ch, cues, ids) => narr('naismith', ch, cues, ids)

// No map legs (Task 19 fix round 2, the leg rule in chapters.js validateTour): no verified fact
// states any of his moves as a journey from one place to the next (Almonte to Montreal, Montreal to
// Springfield, Springfield to Denver to Lawrence, Lawrence to Berlin). The lines the legs carried
// stay as the chapters' own narration ("Hear this chapter").

// ---------- rebuilt rooms (shape.js room) ----------
// Guide spot and camera poses per device: room-poses.json.

// The high school building, Almonte, about 1910 (assets-src/naismith-almonte-high-school/INVENTORY.md):
// the town he was born in, not his birthplace. Its glb label says "the school James Naismith attended
// from 1875": that rests on a single-source fact (the 1875 high-school fact of ROOMS.md, chapter 2a), so
// the tour shows this label instead.
export const ALMONTE_LABEL =
  'Recreation based on a photograph: the high school, Almonte, Ontario (halftone print, McCord Stewart Museum MP-0000.648.11, used as a modelling reference; its date is not verified). No source on file dates the building or places James Naismith here. People are not shown; the sides and back of the building are not photographed.'
const ALMONTE_SCHOOL = {
  id: 'naismith-almonte-high-school',
  title: 'The high school, Almonte',
  model: '/models/naismith-almonte-high-school/naismith-almonte-high-school',
  ...POSES['naismith-almonte-high-school'],
  labelText: ALMONTE_LABEL,
  fog: [60, 160],
  // round 9 (owner): no standing poster in front of the building. No record of Almonte is on file, so the
  // chapter has no stop: the line about him is told on arrival, after the opening
  narration: N(11, ['c1'], ['NAI-F-0114', 'NAI-F-0130']),
  // round 9 (owner directive 2026-10-29: chapters with fewer than 3 records get more): later printed records of
  // his birth in Almonte, hung on the school's front wall between its ground-floor windows, either side of the steps, like notices (no standing poster in
  // front of the building, owner feedback round 9 item 11), in the order they were printed, above the stone band
  // (fix round 2: the Who's Who in America page is not shown until its identification is settled: the adversary
  // found the saved snapshot does not establish that the selected page concerns James Naismith; the owner's ruling
  // covers its rights only)
  artifacts: [
    { id: 'lynden', name: 'The Lynden tribune, March 23, 1922', artifact: 'NAI-M-0070', clip: N(21, ['r1'], []), anchor: { pos: [-10.1, 2.3, 0.09], size: [0.8, 1.3, 0.05] }, display: { mount: 'wall', pos: [-10.1, 2.3, 0.09], rotY: 0, size: [0.8, 1.3] }, placeNote: 'Shown here in Almonte; the page is at the Library of Congress.', placeNoteLabel: 'Not made here' },
    { id: 'milwaukee', name: 'The Milwaukee leader, March 3, 1930', artifact: 'NAI-M-0071', clip: N(21, ['r3'], []), anchor: { pos: [6.4, 2.3, 0.09], size: [0.8, 1.3, 0.05] }, display: { mount: 'wall', pos: [6.4, 2.3, 0.09], rotY: 0, size: [0.8, 1.3] }, placeNote: 'Shown here in Almonte; the page is at the Library of Congress.', placeNoteLabel: 'Not made here' },
  ],
}

// The Presbyterian College dining room, Montreal, April 1889 (assets-src/naismith-presbyterian-dining-hall/
// INVENTORY.md; the McCord photograph is a modelling reference only). The glb label names the place
// and the date and says the diners are not named; no source places him at this table.
const DINING_ROOM = {
  id: 'naismith-presbyterian-dining-hall',
  title: 'Presbyterian College, Montreal · the dining room',
  model: '/models/naismith-presbyterian-dining-hall/naismith-presbyterian-dining-hall',
  // labelText replaces the label in the glb (whose numbers came from a modelling reference or were
  // computed): every number shown is grounded (displayedNumbers.js, Codex Task 19 round 3)
  labelText:
    "Recreation based on a photograph of the dining room of the Presbyterian College, Montreal, by Wm. Notman & Son (McCord Stewart Museum II-89481, used as a modelling reference; its date is not verified). The photograph shows students at dinner; it does not name them. James Naismith entered the college in 1887. People are not shown; the walls the photograph does not show are plain.",
  ...POSES['naismith-presbyterian-dining-hall'],
  fog: [14, 30],
  // fix round 2 (review N2, owner approval 2026-10-29): the McGill stop shows Old Hall, McGill University (NAI-M-0059,
  // LoC), on a stand between the tables (room/roomRecords.js): its record line, then one line of his time at McGill
  artifacts: [
    // fix round 2: the McGill calendars of 1887-1888 and 1889-1890 are not shown until their
    // identification is settled (the adversary's objection: the saved snapshots do not establish that the selected
    // pages concern James Naismith; the owner's ruling covers their rights only)
    { id: 'mcgill', name: 'Old Hall, McGill University', artifact: 'NAI-M-0059', clip: { keys: ['naismith:12:r9', 'naismith:1:c3'], factIds: ['NAI-F-0129', 'NAI-F-0084'] }, anchor: { pos: [4.97, 1.68, 5.0], size: [0.06, 0.95, 0.75] }, display: { mount: 'wall', pos: [4.97, 1.68, 5.0], rotY: -Math.PI / 2, size: [0.75, 0.95] } },
  ],
}

// The gymnasium, Springfield (assets-src/naismith-springfield-gym/INVENTORY.md): two Springfield College
// photographs, c. 1887 and c. 1894, reference only. Its glb label calls it "the room where basketball
// was first played": the facts placing the game in this room are single-source (ROOMS.md chapter 5),
// so the tour shows this label instead.
export const SPRINGFIELD_LABEL =
  'Recreation based on photographs titled “School for Christian Workers Gymnasium” in the Springfield College Archives and Special Collections (reference only). The peach basket and the ball on the floor are labelled recreations; the originals were not preserved.'
const SPRINGFIELD_GYM = {
  id: 'naismith-springfield-gym',
  title: 'The gymnasium, Springfield',
  model: '/models/naismith-springfield-gym/naismith-springfield-gym',
  ...POSES['naismith-springfield-gym'],
  labelText: SPRINGFIELD_LABEL,
  fog: [18, 34],
  // on arrival (one line): his 13 rules
  narration: N(2, ['c3'], ['NAI-F-0090']),
  // time order: once every stop is seen, the rules' publication (January 1892; round 8: not what the 1894 book
  // shows, so not at the book), then what came after Springfield, before Kansas (1894, 1895)
  closing: { keys: ['naismith:2:c4', 'naismith:3:c1', 'naismith:3:c2', 'naismith:3:c3'], factIds: ['NAI-F-0085', 'NAI-F-0099', 'NAI-F-0095', 'NAI-F-0096'] },
  artifacts: [
    // fix round 1 (review I-3): the assignment is not about the floor: it is on its own labelled panel
    { id: 'game', name: 'The first game', panel: { title: 'The first game', factIds: ['NAI-F-0078'] }, clip: N(2, ['c5'], ['NAI-F-0078']), anchor: { pos: [-1.4, 1.3, 2.9], size: [0.58, 0.72, 0.06] } },
    // the 1894 book of the rules (LoC), shown at a blank signboard under the gallery (the glb holds the
    // four boards as one node: the stop stands on the second from the west, build_room.py x -0.75)
    { id: 'book', name: 'Basket ball, 1894', artifact: 'NAI-M-0003', clip: N(12, ['r1'], ['NAI-F-0072']), anchor: { pos: [-0.75, 2.36, -3.64], size: [1.25, 0.72, 0.06] } },
    // the labelled recreations, set on the bare floor between the mats and the south columns
    // (build_room.py mats / bounds.json columns) as their own glbs
    // (assets-src/naismith-recreations/)
    { id: 'basket', name: 'Peach basket (recreation)', artifact: 'NAI-PEACH-BASKET-RECREATION', clip: { keys: ['naismith:2:c7', 'naismith:12:r2'], factIds: ['NAI-F-0088'] }, prop: { src: '/artifacts/naismith/peach-basket.glb', pos: [1.6, 0, 2.7], rotY: 0.3 } },
    { id: 'ball', name: 'Ball (recreation)', artifact: 'NAI-BALL-RECREATION', clip: N(12, ['r3'], []), prop: { src: '/artifacts/naismith/ball.glb', pos: [2.15, 0, 2.75], rotY: 0 } },
  ],
}

// Robinson Gymnasium, Lawrence, 1907 (assets-src/naismith-robinson-gym/INVENTORY.md). The two Topeka
// state journal pages (1898, 1908) are shown at the slatted wall panels nearest the start, one on
// each long wall (build_room.py slat_panel at blender y -9: glTF z 9; the glb holds every panel as one node).
const ROBINSON_GYM = {
  id: 'naismith-robinson-gym',
  title: 'Robinson Gymnasium, Lawrence',
  model: '/models/naismith-robinson-gym/naismith-robinson-gym',
  // labelText replaces the label in the glb (whose numbers came from a modelling reference or were
  // computed): every number shown is grounded (displayedNumbers.js, Codex Task 19 round 3)
  labelText:
    "Recreation based on photographs: KU University Archives RG 66/13 (reference only) and Library of Congress, Lawrence: today and yesterday (exterior).",
  ...POSES['naismith-robinson-gym'],
  fog: [34, 70],
  // his work at Kansas; the 1898 page tells his succeeding Cowan, the 1908 page the dedication address (the
  // retirement of 1937 is told in 1939, after the Berlin chapter: time order)
  // (the chapter's one arrival line is the medical degree; its dedication is on the 1908 page; round 8: his
  // teaching and chapel work are not what the roof trusses show, so they close the chapter, and the
  // architecture-only stops are gone)
  closing: N(11, ['c3', 'c4'], ['NAI-F-0092', 'NAI-F-0093']),
  // round 9 (owner): the journals hang on the plain wall between two windows, clear of the wall bars and the
  // running track's brackets that crossed them
  artifacts: [
    { id: 'paper1898', name: 'Topeka state journal, 1898', artifact: 'NAI-M-0050', clip: N(12, ['r4'], ['NAI-F-0104', 'NAI-F-0105']), anchor: { pos: [-9.88, 1.35, 4.5], size: [0.06, 0.85, 1.1] }, display: { mount: 'wall', pos: [-9.88, 1.35, 4.5], rotY: Math.PI / 2, size: [1.1, 0.85] } },
    // round 9 (owner directive 2026-10-29): the Kansas City journal of December 18, 1898 on basket ball at the
    // university, on an easel against the west wall beside the September 1898 page (the windows leave no plain wall)
    { id: 'kc1898', name: 'Kansas City journal, December 18, 1898', artifact: 'NAI-M-0074', clip: N(21, ['r6'], []), anchor: { pos: [-9.1, 1.4, 6.6], size: [0.05, 1.05, 0.3] }, display: { mount: 'stand', pos: [-9.1, 1.4, 6.6], rotY: Math.PI / 2, size: [0.3, 1.05] } },
    { id: 'paper1908', name: 'Topeka state journal, 1908', artifact: 'NAI-M-0049', clip: N(12, ['r5'], ['NAI-F-0083', 'NAI-F-0101', 'NAI-F-0103']), anchor: { pos: [9.88, 1.35, 4.5], size: [0.06, 0.85, 1.1] }, display: { mount: 'wall', pos: [9.88, 1.35, 4.5], rotY: -Math.PI / 2, size: [1.1, 0.85] } },
  ],
}

// The present Hall of Fame grounds, Springfield, 2019 (assets-src/naismith-hall-of-fame/INVENTORY.md).
// The glb label says he was "enshrined in 1959, before this building"; labelText replaces it with the
// verified fact's words (NAI-F-0086), so its number is grounded (displayedNumbers.js, Codex Task 19 round 4).
const HALL_OF_FAME = {
  id: 'naismith-hall-of-fame',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['NAI-M-0060', 'NAI-M-0061'],
  title: 'Naismith Memorial Basketball Hall of Fame, Springfield · 2019',
  model: '/models/naismith-hall-of-fame/naismith-hall-of-fame',
  labelText:
    'Recreation based on photographs: the tower hoisting a symbolic basketball outside the present Naismith Memorial Basketball Hall of Fame, Springfield, Massachusetts, Carol M. Highsmith, 2019, Library of Congress (public domain). James Naismith was inducted into the Basketball Hall of Fame in 1959; the photographs show the present building and its grounds. Vehicles are not shown.',
  ...POSES['naismith-hall-of-fame'],
  fog: [120, 320],
  // round 8: the tower and its ball were architecture-only stops (room notes): the photograph is the stop
  artifacts: [
    // the photograph the grounds are modelled from, shown on the lawn where it was taken (hotspot_1 of
    // the glb, "where the 2019 photographs were taken"); no node of its own, so an anchor
    // round 9 (owner directive 2026-10-29): the Evening star pages of 1959 (named to the Hall) and 1961 (the stamp),
    // on easels beside the photograph's stand, before it (time order); fix round 2: both on its left, so the badges
    // read 1 2 3 across the screen
    { id: 'star1959', name: 'Evening star, March 4, 1959', artifact: 'NAI-M-0076', clip: N(21, ['r8'], []), anchor: { pos: [-10.95, 1.3, -28.3], size: [0.55, 0.65, 0.05] }, display: { mount: 'stand', pos: [-10.95, 1.3, -28.3], rotY: 0, size: [0.55, 0.65] } },
    { id: 'star1961', name: 'Evening star, November 5, 1961', artifact: 'NAI-M-0077', clip: N(21, ['r9'], []), anchor: { pos: [-10.05, 1.3, -28.3], size: [0.7, 0.45, 0.05] }, display: { mount: 'stand', pos: [-10.05, 1.3, -28.3], rotY: 0, size: [0.7, 0.45] } },
    { id: 'photo', name: 'The photograph, 2019', artifact: 'NAI-M-0060', clip: N(12, ['r8'], []), anchor: { pos: [-9.05, 1.3, -28.3], size: [0.7, 0.9, 0.05] }, display: { mount: 'stand', pos: [-9.05, 1.3, -28.3], rotY: 0, size: [0.7, 0.9] } },
  ],
}

const galleryNote = (why) => `Gallery case — ${why}, so the chapter is shown in an IHH gallery. The gallery is not a recreation of a real room.`

const CHAPTERS = [
  chapter({
    id: 'birth',
    kind: 'birth',
    title: 'Born in Almonte',
    year: 1861,
    yearFact: 'NAI-F-0035', // the verified fact that states the year
    factIds: ['NAI-F-0035', 'NAI-F-0114', 'NAI-F-0130'],
    place: { tier: 'room', label: 'Almonte, Ontario', room: ALMONTE_SCHOOL },
    stops: ALMONTE_SCHOOL.artifacts,
  }),
  chapter({
    id: 'education',
    kind: 'education',
    title: 'The Presbyterian College, Montreal',
    year: 1887,
    yearFact: 'NAI-F-0094', // the verified fact that states the year
    factIds: ['NAI-F-0094', 'NAI-F-0084', 'NAI-F-0129', 'NAI-F-0114'],
    place: { tier: 'room', label: 'Presbyterian College, Montreal', room: DINING_ROOM },
    stops: DINING_ROOM.artifacts,
  }),
  chapter({
    id: 'first-work',
    kind: 'first-work',
    title: 'Inventing basketball',
    year: 1891,
    yearFact: 'NAI-F-0100', // the verified fact that states the year
    factIds: ['NAI-F-0100', 'NAI-F-0067', 'NAI-F-0079', 'NAI-F-0080', 'NAI-F-0087', 'NAI-F-0088', 'NAI-F-0090', 'NAI-F-0078', 'NAI-F-0085', 'NAI-F-0072', 'NAI-F-0099', 'NAI-F-0095'],
    // Round 9 (owner decision 2026-10-29): his arrival in the United States, drawn from Montreal (the Presbyterian
    // College, NAI-F-0094) to Springfield (NAI-F-0100), un-routed: the fact that he left Canada for Springfield
    // is single-source (JOURNEYS.md), so no journey is claimed. Place photographs: Old Hall, McGill
    // (NAI-M-0059) and the training school, Springfield (NAI-M-0066).
    map: {
      id: 'arriving-leg',
      title: 'Montreal to Springfield',
      places: [
        { id: 'montreal', label: 'Montreal', date: '1887', note: 'The Presbyterian College', lat: 45.5033426, lon: -73.5868411, coord: 'wikidata:Q340', factIds: ['NAI-F-0094'] },
        { id: 'springfield', label: 'Springfield', date: '1891', note: 'Invented basketball', lat: 42.111299, lon: -72.565449, coord: 'holder:springfield-college-cdm', factIds: ['NAI-F-0100'] },
      ],
      segments: [{ routed: false, mode: null }],
      resources: [
        { id: 'res-montreal', label: 'Montreal', lat: 45.5033426, lon: -73.5868411, coord: 'wikidata:Q340', factIds: ['NAI-F-0094'], media: ['NAI-M-0059'] },
        { id: 'res-springfield', label: 'Springfield', lat: 42.111299, lon: -72.565449, coord: 'holder:springfield-college-cdm', factIds: ['NAI-F-0100'], media: ['NAI-M-0066'] },
      ],
      narration: N(21, ['m1'], ['NAI-F-0100']),
    },
    place: { tier: 'room', label: 'The gymnasium, Springfield', room: SPRINGFIELD_GYM },
    stops: SPRINGFIELD_GYM.artifacts,
  }),
  chapter({
    id: 'big-work',
    kind: 'big-work',
    title: 'The University of Kansas',
    year: 1898,
    yearFact: 'NAI-F-0083', // the verified fact that states the year
    factIds: ['NAI-F-0083', 'NAI-F-0021', 'NAI-F-0104', 'NAI-F-0105', 'NAI-F-0091', 'NAI-F-0092', 'NAI-F-0093', 'NAI-F-0051', 'NAI-F-0074', 'NAI-F-0101', 'NAI-F-0103'],
    // fix round 1 (review N7): no arrival line; his medical degree (Denver, 1898) closes the Springfield chapter
    place: { tier: 'room', label: 'Robinson Gymnasium, Lawrence', room: ROBINSON_GYM },
    stops: ROBINSON_GYM.artifacts,
  }),
  chapter({
    id: 'history',
    kind: 'history',
    // round 9 (owner): Berlin 1936 and Lawrence 1939 are one chapter, told in time order: the Olympics, his
    // retirement (at the wall panel), then his death, said at the 1939 report before its "Dies Today" line
    title: 'The Olympics in Berlin, and Lawrence',
    year: 1936,
    yearFact: 'NAI-F-0098', // the verified fact that states the year
    factIds: ['NAI-F-0098', 'NAI-F-0097', 'NAI-F-0037', 'NAI-F-0081', 'NAI-F-0082', 'NAI-F-0127', 'NAI-F-0128'],
    place: {
      tier: 'gallery',
      label: 'IHH gallery',
      note: galleryNote('no verified fact names the place in Berlin, and no photograph of either place is on file'),
      panel: { eyebrow: 'Part of history', title: 'Berlin, and his last years', factIds: ['NAI-F-0098', 'NAI-F-0097', 'NAI-F-0037', 'NAI-F-0082'] },
    },
    // the 1936 AP report and the 1939 front-page report in the case (Chronicling America; owner ruling 2026-10-27)
    stops: [
      { id: 'paper', name: 'San Antonio light, August 8, 1936', art: ARTIFACTS['NAI-M-0068'], clip: N(12, ['r6'], []) },
      // his retirement (1937), told at the wall panel that prints it
      { id: 'panel', name: 'His retirement', panel: true, clip: N(11, ['c13'], ['NAI-F-0097']) },
      { id: 'paper1939', name: 'The daily Alaska empire, November 28, 1939', art: ARTIFACTS['NAI-M-0067'], clip: { keys: ['naismith:11:c9', 'naismith:12:r7'], factIds: ['NAI-F-0037', 'NAI-F-0128', 'NAI-F-0082'] } },
      // round 9 (owner directive 2026-10-29): a second report of the same day, from Henderson, N.C.
      { id: 'henderson1939', name: 'Henderson daily dispatch, November 28, 1939', art: ARTIFACTS['NAI-M-0075'], clip: N(21, ['r7'], []) },
    ],
  }),
  chapter({
    id: 'honoured',
    kind: 'honoured',
    title: 'Basketball Hall of Fame',
    year: 1959,
    yearFact: 'NAI-F-0086', // the verified fact that states the year
    factIds: ['NAI-F-0086'],
    place: { tier: 'room', label: 'Hall of Fame grounds, Springfield (2019)', room: HALL_OF_FAME },
    stops: HALL_OF_FAME.artifacts,
  }),
]

export const NAISMITH = {
  slug: 'naismith',
  name: 'James Naismith',
  chapters: inTimeOrder(CHAPTERS), // time order (chapters.js)
  // Landing story points (fact ids) and older links (?stop=springfield, leg-1, ...) -> the chapter
  // "Tour from here" opens (data/index.js resolveStop).
  storyStops: {
    'NAI-F-0035': { chapter: 'birth', label: 'Born in Almonte' },
    'NAI-F-0067': { chapter: 'first-work', label: 'Inventing basketball' },
    'NAI-F-0090': { chapter: 'first-work', label: 'Inventing basketball: the 13 rules' },
    'NAI-F-0021': { chapter: 'big-work', label: 'The University of Kansas' },
    'leg-1': { chapter: 'education', label: 'The Presbyterian College, Montreal' },
    springfield: { chapter: 'first-work', label: 'The gymnasium, Springfield' },
    'leg-2': { chapter: 'big-work', label: 'The University of Kansas' },
    robinson: { chapter: 'big-work', label: 'Robinson Gymnasium, Lawrence' },
    'leg-3': { chapter: 'history', label: 'The Olympics in Berlin' },
  },
}
