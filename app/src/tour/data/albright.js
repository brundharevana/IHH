// Madeleine Albright's tour as turning-point chapters (chapters.js; spec 2.2), played by ChapterPlayer.jsx.
// A chapter exists only where verified facts exist and its main fact gives a year
// (data/inductees/albright/ROOMS.md, chapter table): no "education" or "first-work" chapter (no verified
// fact), no separate "leaving" chapter (the verified facts of the flight from Czechoslovakia carry no year:
// they are told on the map leg of "Arriving", in their own words), so the London shelter room is not used
// (no verified fact places her in London: assets-src/albright-london-shelter/DECISION.md). Two chapters
// share the kind "big-work" (the United Nations, 1993; Secretary of State, 1997: ROOMS.md 7a/7b); the
// second keys its opening by its id ('albright:ch:secretary:opening', check_narration.py).
// Every visitor-facing sentence about her is the text of a verified fact (ids alongside) or a narration
// clip tied to fact ids (assets-src/audio/narration/albright.json, gated by check_narration.py); the
// chapter openings are the voiced lines 'albright:ch:<kind>:opening' of that file. Room notes (the
// recreation, not her) cite their room's INVENTORY.md. Single-source facts are neither shown nor spoken:
// the ship she crossed on, her years in London and the brooch she wore at her swearing-in are among them.
// Coordinates: ./coords.snapshot.json.
//
// Places (spec 2.3): five rebuilt rooms (the S.S. America's tourist lounge as photographed in 1940: a
// liner of the period, not a room she is known to have used; the National Archives Rotunda as set up for
// the naturalization ceremony of September 14, 2016, at which she spoke: not her own naturalization; the
// U.N. Security Council chamber as photographed 1977-81, before her years there; the Oval Office as
// photographed on April 20, 1993, when she was there as Ambassador (Task 14c; the photo room of the 1997
// swearing-in, OVAL_VIEW, is kept as the fallback); the East Room as set up for the Medal of Freedom
// ceremony of May 29, 2012 (Task 14c)), two photo rooms (Prague: a stereograph of the Old Town Square, a
// view of the city, not her birthplace; the Truman Library in March 1999), and one gallery case where no
// photograph of a place is on file (her death in Washington).
import { narr } from './shape.js'
import { chapter, inTimeOrder } from './chapters.js'
import { ALBRIGHT_ARTIFACTS as ART } from './albright-artifacts.js'
import POSES from './room-poses.json'

const A = (ch, cues, ids) => narr('albright', ch, cues, ids)


const PHOTO_NOTE = 'The depth is estimated from the photograph; past its edges there is nothing to show.'

// ---------- photo rooms (place/photoProjection.js) ----------
// Images and masks: assets-src/albright-photo-rooms/build_photo_rooms.py (pixel coordinates of the source
// files named there). Cameras solved by hand: the pitch from the horizon row, the height and distances
// from the sizes of people of ordinary height in the frame (the notes say the depth is estimated).
// Units: the Oval Office is at 3 units to the metre and the Truman Library at 2, so the people's cards
// stand behind the visitor's frame (the guide and the rail, about 4 units out: PhotoRoomStage).

// The Old Town Square, Prague (ALB-M-0081, the right image of the stereograph, about 400 px): a raised
// viewpoint about 4.6 m up (people near and far set the height), horizon at row 378. R: the Old Town Hall
// tower and the houses on the left; G: the houses on the right. The church and the square's far side stay
// on the backdrop.
export const PRAGUE_VIEW = {
  mediaId: 'ALB-M-0081',
  crop: { x: 532, y: 42, w: 390, h: 415 },
  camera: { fovDeg: 48.6, pitchDeg: -15.6, height: 4.6 },
  backdropRow: 392,
  layers: [
    { id: 'hall', kind: 'card', mask: 0, at: [610, 457], width: 0.45, height: 75, y: 37 },
    { id: 'houses', kind: 'card', mask: 1, at: [890, 457], width: 0.24, height: 25, y: 12 },
  ],
  // on a phone the view at rest turns toward the Old Town Hall tower, left of the guide
  look: { yawDeg: 6, yawDegPhone: 14, pitchDeg: 4, dolly: 8, orbit: 0.15, pivot: 'hall', restYawDegPhone: 2.5 },
  // the tower fills the left of the frame: the guide stands on the right, over the far side of the square (on a
  // phone the view at rest turns a little less toward the hall, so it stays clear of her: round 9 fix round 1)
  guide: { x: 0.7, xPhone: 0.62 },
  // a desktop's lens a little narrower than the default 0.96 (fix round 10): below the band (place.hudBand) the canvas
  // is wide for this near-square photograph, and the tower's top, at the photograph's top edge, comes into view tilted
  // up (about 12 degrees) inside the frame only when the screen covers less than the photograph's whole width: at 0.96
  // no view showed it (the frame's top corners ran past the photograph's sides)
  lens: { desktop: 0.92 },
}
export const PRAGUE_NOTE = `Photo room — based on a Library of Congress stereograph (public domain): Keystone View Company, “Old town square and Teyn Church, Prague, Czechoslovakia”, c1928 (the photograph may date from 1910-1919; right image). A view of the city where Madeleine Albright was born; no source on file records the address of her birthplace. The photograph is small, so it is soft. ${PHOTO_NOTE}`

// The Oval Office, January 23, 1997 (ALB-M-0059, White House photograph): camera about 1.45 m up, level
// with the speaker's eyes (horizon row about 1250, pitched down 4.6 degrees). R: President Clinton; G:
// Madeleine Albright at the lectern; B: Vice President Gore. The window bay is the backdrop, about 4.5 m
// away.
export const OVAL_VIEW = {
  mediaId: 'ALB-M-0059',
  crop: { x: 0, y: 0, w: 4800, h: 3265 },
  camera: { fovDeg: 38.24, pitchDeg: 4.64, height: 4.35 },
  backdropRow: 2745,
  layers: [
    { id: 'clinton', kind: 'card', mask: 0, at: [650, 4494], width: 0.34, height: 6.6, y: 3.3 },
    { id: 'speaker', kind: 'card', mask: 1, at: [2200, 5036], width: 0.48, height: 6.0, y: 3.0 },
    { id: 'gore', kind: 'card', mask: 2, at: [3550, 4351], width: 0.34, height: 6.6, y: 3.3 },
  ],
  // on a phone the view turns toward President Clinton so she stands right of the guide, never behind her
  look: { yawDeg: 4, yawDegPhone: 14, pitchDeg: 3, dolly: 1.0, orbit: 0.15, pivot: 'speaker', restYawDegPhone: 5 },
  guide: { xPhone: -0.62 },
}
export const OVAL_NOTE = `Photo room — based on a White House photograph (National Archives, William J. Clinton Library; public domain): Ralph Alswang, “Swearing-In Ceremony for Madeleine Albright as Secretary of State”, January 23, 1997. The Oval Office on the day. ${PHOTO_NOTE}`

// The Truman Library, March 1999 (ALB-M-0060, Department of State photograph): an interview set of flags
// and drapes; camera about 1.6 m up, a little above the seated heads (horizon row 650); the field of
// view is taken as 34 degrees (a normal lens on the print's frame). R: the interviewer and his chair; G:
// the low table; B: Madeleine Albright and her chair. The flags are the backdrop. The stop's subject is her
// head and shoulders; on a phone the view at rest turns toward her, right of the guide.
export const TRUMAN_VIEW = {
  mediaId: 'ALB-M-0060',
  crop: { x: 30, y: 30, w: 3515, h: 2390 },
  camera: { fovDeg: 34, pitchDeg: 8.37, height: 3.2 },
  backdropRow: 2075,
  layers: [
    { id: 'interviewer', kind: 'card', mask: 0, at: [800, 2410], width: 0.33, height: 3.6, y: 1.8 },
    { id: 'table', kind: 'card', mask: 1, at: [1720, 2225], width: 0.17, height: 2.0, y: 1.0 },
    { id: 'speaker', kind: 'card', mask: 2, at: [2700, 2400], width: 0.29, height: 3.6, y: 1.8 },
  ],
  look: { yawDeg: 5, yawDegPhone: 14, pitchDeg: 4, dolly: 2.4, orbit: 0.25, pivot: 'speaker', restYawDegPhone: -8, restPitchDegPhone: 4 },
}
export const TRUMAN_NOTE = `Photo room — based on a Department of State photograph (National Archives, RG 59; public domain): “Secretary Madeleine K. Albright at the Truman Library, Independence, Missouri”, March 1999 (59-PA-366-3). It shows her in an interview at the library, in front of a wall of flags; it is not a photograph of the ceremony itself. ${PHOTO_NOTE}`

// ---------- rebuilt rooms (shape.js room) ----------
// Guide spot and camera poses per device: room-poses.json.

// The S.S. America's tourist lounge, October 18, 1940 (assets-src/albright-ss-america/INVENTORY.md). Its
// glb label names a single-source fact (the ship she crossed on), so the tour shows this label.
export const LOUNGE_LABEL =
  'Recreation based on a photograph: “S.S. America, United States Lines. Tourist lounge, general”, Gottscho-Schleisner, October 18, 1940 (Library of Congress). A public room of a transatlantic liner as photographed in 1940. No verified source on file names the ship Madeleine Albright crossed on, and she is not known to have been in this room. Recreated from a small photograph: forms and tones, details plain; colours are interpretive.'
const LOUNGE = {
  id: 'albright-ss-america',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['ALB-M-0076'],
  title: 'A liner’s tourist lounge · 1940',
  model: '/models/albright-ss-america/albright-ss-america',
  ...POSES['albright-ss-america'],
  labelText: LOUNGE_LABEL,
  fog: [9, 22],
  narration: A(4, ['c1'], ['ALB-F-0184']),
  closing: A(4, ['c2'], ['ALB-F-0083']),
  artifacts: [
    // the photograph the lounge is modelled from, where it was taken (hotspot_1)
    { id: 'photo', name: 'The photograph, 1940', artifact: 'ALB-M-0076', clip: A(15, ['r3'], []), anchor: { pos: [-0.85, 1.4, -1.75], size: [0.5, 0.35, 0.05] }, display: { mount: 'stand', pos: [-0.85, 1.4, -1.75], rotY: 0.25, size: [0.5, 0.35] } },
    // round 9 (owner directive 2026-10-29: chapters with fewer than 3 records get more): the Senate resolution of 2022
    // that records her flight and her family's coming as refugees, on an easel by the right-hand wall
    { id: 'resolution', name: 'S. Res. 585 (2022)', artifact: 'ALB-M-0092', clip: A(21, ['r1'], []), anchor: { pos: [3.6, 1.4, -1.5], size: [0.4, 0.52, 0.05] }, display: { mount: 'stand', pos: [3.6, 1.4, -1.5], rotY: -0.88, size: [0.4, 0.52] }, placeNote: 'Shown here in the lounge; the resolution is a Senate record of 2022.', placeNoteLabel: 'Not made here' },
  ],
}

// The National Archives Rotunda as set up for the naturalization ceremony of September 14, 2016
// (assets-src/albright-archives-rotunda/INVENTORY.md). The tour's label says the same as the glb's, shorter.
export const ROTUNDA_LABEL =
  'Recreation based on National Archives photographs of September 14, 2016: the Rotunda as set up for the naturalization ceremony at which Madeleine Albright spoke. It is not the place where Albright became a U.S. citizen in 1957; no source on file records that place. The mural is shown only as a blurred tonal impression; the second mural and the dome were not photographed and are plain.'
const ROTUNDA = {
  id: 'albright-archives-rotunda',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['ALB-M-0064', 'ALB-M-0065', 'ALB-M-0066'],
  title: 'The Rotunda, National Archives · September 14, 2016',
  model: '/models/albright-archives-rotunda/albright-archives-rotunda',
  ...POSES['albright-archives-rotunda'],
  labelText: ROTUNDA_LABEL,
  fog: [20, 45],
  // the opening tells her citizenship (1957); the photograph at the lectern tells the 2016 ceremony this
  // room is set for, 59 years later
  artifacts: [
    // round 8: the photographs of the 2016 ceremony (her remarks, the ceremony, the rotunda prepared for it) are one
    // stop, a photograph series the viewer steps through, beside the lectern (anchor); no architecture-only stop
    { id: 'remarks', name: 'The naturalization ceremony, September 14, 2016', artifact: 'ALB-SERIES-CEREMONY-2016', clip: A(15, ['r22'], ['ALB-F-0026', 'ALB-F-0198']), anchor: { pos: [-2.9, 1.45, -3.7], size: [0.5, 0.35, 0.05] } },
  ],
}

// The Security Council chamber as photographed 1977-81, before her years at the United Nations
// (assets-src/albright-un-security-council/INVENTORY.md); the glb label says so.
const WHERE = 'Where this was photographed'
const CHAMBER = {
  id: 'albright-un-security-council',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['ALB-M-0049'],
  title: 'The Security Council chamber, as photographed 1977-81',
  model: '/models/albright-un-security-council/albright-un-security-council',
  // labelText replaces the label in the glb (whose numbers came from a modelling reference or were
  // computed): every number shown is grounded (displayedNumbers.js, Codex Task 19 round 3)
  labelText:
    "Recreation based on a photograph: U.N. Security Council Chamber, Bernard Gotfryd, between 1977 and 1981 (Library of Congress, LC-GB05-5929). From 1993 to 1997, Albright served as the U.S. Permanent Representative to the United Nations; the chamber is shown as photographed before those years.",
  ...POSES['albright-un-security-council'],
  fog: [30, 60],
  labelFallback: 'Recreation based on a photograph of the U.N. Security Council Chamber taken between 1977 and 1981, before her years at the United Nations (1993-1997).',
  // fix round 1 (controller ruling): the slide of the chamber is a stop because its line ties the building to her: her
  // years at the United Nations, 1993 to 1997 (no longer an arrival line); then her records of those years, in time order
  artifacts: [
    { id: 'photo', name: 'The slide, 1977-81', artifact: 'ALB-M-0049', clip: A(15, ['r10'], ['ALB-F-0170']), anchor: { pos: [-11.97, 1.55, 8.4], size: [0.05, 0.45, 0.6] }, display: { mount: 'wall', pos: [-11.97, 1.55, 8.4], rotY: Math.PI / 2, size: [0.6, 0.45] } },
    // her records of these years and the slide the room is modelled from, in a row about 2 m in front of
    // the start (anchors)
    { id: 'sheet', name: 'Contact sheet, January 27, 1993', artifact: 'ALB-M-0058', clip: A(15, ['r8'], []), anchor: { pos: [-11.97, 1.55, 7.3], size: [0.05, 0.69, 0.5] }, display: { mount: 'wall', pos: [-11.97, 1.55, 7.3], rotY: Math.PI / 2, size: [0.5, 0.69] }, placeNote: 'Photographed on January 27, 1993, at her swearing-in as Ambassador; not in this chamber.', placeNoteLabel: WHERE },
    { id: 'hearing', name: 'The confirmation hearing, 1993', artifact: 'ALB-M-0002', clip: A(15, ['r7'], []), anchor: { pos: [-11.97, 1.55, 6.2], size: [0.05, 0.45, 0.6] }, display: { mount: 'wall', pos: [-11.97, 1.55, 6.2], rotY: Math.PI / 2, size: [0.6, 0.45] }, placeNote: 'Photographed at her confirmation hearing before the Senate Foreign Relations Committee; not in this chamber.', placeNoteLabel: WHERE },
    // the book from President Havel of Czechoslovakia, April 20, 1993 (she was Ambassador), at the end of the row
    { id: 'havel', name: 'A book from Prague, 1993', artifact: 'ALB-M-0057', clip: A(15, ['r2'], ['ALB-F-0196']), anchor: { pos: [-11.97, 1.55, 5.1], size: [0.05, 0.45, 0.6] }, display: { mount: 'wall', pos: [-11.97, 1.55, 5.1], rotY: Math.PI / 2, size: [0.6, 0.45] }, placeNote: 'Photographed in the Oval Office, Washington, on April 20, 1993; not in this chamber.', placeNoteLabel: WHERE },
    { id: 'angola', name: 'Arrival in Angola, 1996', artifact: 'ALB-M-0061', clip: A(15, ['r9'], []), anchor: { pos: [-11.97, 1.55, 4.0], size: [0.05, 0.42, 0.55] }, display: { mount: 'wall', pos: [-11.97, 1.55, 4.0], rotY: Math.PI / 2, size: [0.55, 0.42] }, placeNote: 'Photographed on her arrival in Angola, January 1996.', placeNoteLabel: WHERE },
  ],
}

// The Oval Office as photographed on April 20, 1993 (assets-src/albright-oval-office-1993/INVENTORY.md;
// Task 14c, controller ruling): ALB-F-0202 (verified) puts her there that day, as Ambassador to the
// United Nations. The room is the April 1993 room, not the room on the day she was sworn in as
// Secretary of State (1997): the swearing-in photograph is a record in it, with a note saying when it was
// taken. ALB-F-0202 is earlier than this chapter's year, so it is told by the label and the frame's
// record, not listed in the chapter's facts.
export const OVAL_ROOM_LABEL =
  'Recreation based on photographs: the Oval Office as photographed in April 1993 (White House Photograph Office, Bob McNeely, roll WHPO-P02724, April 20, 1993; National Archives, public domain). On April 20, 1993, President Clinton was speaking with Ambassador to the United Nations Madeleine Albright in the Oval Office. This is the room as photographed that day, not on the day she was sworn in as Secretary of State, January 23, 1997. The photographs are black and white, so the colours are interpretive; the pictures on the walls are soft impressions. People are not modelled.'
export const SWEARING_IN_NOTE = 'Photographed in the Oval Office on January 23, 1997; the room around it is shown as photographed in April 1993.'
const OVAL_ROOM = {
  id: 'albright-oval-office-1993',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['ALB-M-0088'],
  title: 'The Oval Office · as photographed in April 1993',
  model: '/models/albright-oval-office-1993/albright-oval-office-1993',
  ...POSES['albright-oval-office-1993'],
  labelText: OVAL_ROOM_LABEL,
  fog: [12, 30],
  // round 8: no architecture-only stop; on arrival (one line), her years as Secretary of State (the Senate's
  // confirmation is the opening's; neither is what the swearing-in photograph shows); the end of her term (2001)
  // closes the NATO chapter (time order)
  artifacts: [
    // the frame of April 20, 1993 the start view follows, where it was taken (between the sofas)
    { id: 'frame', name: 'The Oval Office, April 20, 1993', artifact: 'ALB-M-0088', clip: A(15, ['r11'], []), anchor: { pos: [0.1, 1.45, 1.0], size: [0.5, 0.35, 0.05] }, placeNote: 'The room as photographed on April 20, 1993, when she was Ambassador to the United Nations.', placeNoteLabel: 'When this was photographed' },
    // the swearing-in photograph and her records of these years, in a row along the west side (anchors)
    { id: 'photo', name: 'The swearing-in, 1997', artifact: 'ALB-M-0059', clip: A(15, ['r12'], []), anchor: { pos: [-2.3, 1.45, 0.3], size: [0.05, 0.35, 0.5] }, placeNote: SWEARING_IN_NOTE, records: ['ALB-M-0088'], placeNoteLabel: 'When this was photographed' },
    { id: 'memo', name: 'A memorandum for the President', artifact: 'ALB-M-0055', clip: A(15, ['r13'], []), anchor: { pos: [-2.3, 1.45, 0.9], size: [0.05, 0.45, 0.35] }, placeNote: 'The catalogue gives no date; the memorandum is not from the day shown here.', placeNoteLabel: 'Not from this day' },
    { id: 'korea', name: 'Panmunjom, 1997', artifact: 'ALB-M-0015', clip: A(15, ['r14'], []), anchor: { pos: [-2.3, 1.45, 1.5], size: [0.05, 0.35, 0.5] }, placeNote: 'Photographed at Camp Bonifas, Panmunjom, South Korea, on February 22, 1997.', placeNoteLabel: WHERE },
    { id: 'wye', name: 'Wye River, 1998', artifact: 'ALB-M-0016', clip: A(15, ['r15'], []), anchor: { pos: [-2.3, 1.45, -0.3], size: [0.05, 0.35, 0.5] }, placeNote: 'Photographed near Queenstown, Maryland, on October 15, 1998.', placeNoteLabel: WHERE },
  ],
}

// The East Room of the White House as set up for the Presidential Medal of Freedom ceremony of May 29,
// 2012 (assets-src/albright-east-room-2012/INVENTORY.md; Task 14c): ALB-F-0201 (verified) says she received
// the Medal at that ceremony in the East Room. The 2012 photographs show other honorees, not her; the
// architecture comes from 1904 and 1908 photographs. The tour's label says so.
export const EAST_ROOM_LABEL =
  'Recreation based on photographs: the East Room of the White House as set up for the Presidential Medal of Freedom ceremony of May 29, 2012 (White House photographs, National Archives, public domain). Madeleine Albright was a recipient of the Presidential Medal of Freedom that President Barack Obama presented during a ceremony in the East Room of the White House, May 29, 2012. The 2012 photographs show other honorees receiving their medals; she is not in them. The room’s architecture is modelled from photographs of 1904 and 1908 (Library of Congress) and checked against the 2012 photographs, so details may differ. People and the audience’s seating are not modelled.'
const EAST_ROOM = {
  id: 'albright-east-room-2012',
  // the verified, cleared records its title and label cite (their dates ground the copy's: displayedNumbers.js)
  records: ['ALB-M-0082', 'ALB-M-0083', 'ALB-M-0084', 'ALB-M-0086'],
  title: 'The East Room, White House · May 29, 2012',
  model: '/models/albright-east-room-2012/albright-east-room-2012',
  ...POSES['albright-east-room-2012'],
  labelText: EAST_ROOM_LABEL,
  fog: [20, 45],
  // once every stop is seen: why the Hall honours her (the gallery panel's lines)
  closing: A(9, ['c1'], ['ALB-F-0044']),
  artifacts: [
    // the U.S. flag's node frames the stop; the note names both flags
    // the photograph of the ceremony the room is dressed from, near where it was taken (hotspot_1)
    { id: 'photo', name: 'The ceremony, May 29, 2012', artifact: 'ALB-M-0082', clip: A(15, ['r19'], []), anchor: { pos: [4.55, 1.45, -5.75], size: [0.05, 0.35, 0.5] }, display: { mount: 'stand', pos: [4.55, 1.45, -5.75], rotY: -Math.PI / 2, size: [0.5, 0.35] } },
    // round 9 (owner directive 2026-10-29): the President's remarks of that day (Daily Compilation of Presidential
    // Documents), on an easel beside the photograph
    { id: 'remarks', name: 'The President’s remarks, May 29, 2012', artifact: 'ALB-M-0095', clip: A(21, ['r3'], []), anchor: { pos: [4.55, 1.45, -4.85], size: [0.05, 0.52, 0.4] }, display: { mount: 'stand', pos: [4.55, 1.45, -4.85], rotY: -Math.PI / 2, size: [0.4, 0.52] } },
  ],
}

const galleryNote = (why) => `Gallery case — ${why}, so the chapter is shown in an IHH gallery. The gallery is not a recreation of a real room.`

const CHAPTERS = [
  chapter({
    id: 'birth',
    kind: 'birth',
    title: 'Born in Prague',
    year: 1937,
    yearFact: 'ALB-F-0003', // the verified fact that states the year
    factIds: ['ALB-F-0003', 'ALB-F-0041', 'ALB-F-0080', 'ALB-F-0177', 'ALB-F-0178', 'ALB-F-0176'],
    // time order: once both stops are seen, her childhood before the voyage (Belgrade, the escape)
    closing: A(1, ['c2', 'c3', 'c4'], ['ALB-F-0177', 'ALB-F-0178', 'ALB-F-0176']),
    // hudBand: a dark band behind the top HUD, and the photograph framed below it (owner decision 2026-11-04: the
    // tower's top sits at the photograph's top edge, and no view kept it clear of the title card; ChapterPlayer)
    // stepBackToRest: Step back from a stop's view past the look's range returns to the view at rest (owner decision
    // 2026-11-04, Prague only: the desktop's tower view is tilted up 11.5 degrees, and the drift from there would show
    // past the photograph's edges; PhotoRoomStage stepBackView)
    place: { tier: 'photo', label: 'Old Town Square, Prague (about 1928)', note: PRAGUE_NOTE, photo: PRAGUE_VIEW, hudBand: true, stepBackToRest: true },
    stops: [
      // the stereograph the view is projected from, over the Old Town Hall
      { id: 'photo', name: 'The stereograph, about 1928', artifact: 'ALB-M-0081', clip: A(15, ['r1'], []), at: { layer: 'hall', ringY: 12, glowY: 8, glowSize: 10, spotY: 12, dolly: 0.5, dollyPhone: 0.1, target: [545, 42, 680, 457] } },
      // (the 1993 book from President Havel is a stop of the UN chapter: time order, fix round 1)
    ],
  }),
  chapter({
    id: 'arriving',
    kind: 'arriving',
    title: 'Into New York Harbor',
    year: 1948,
    yearFact: 'ALB-F-0175', // the verified fact that states the year
    factIds: ['ALB-F-0175', 'ALB-F-0183', 'ALB-F-0184', 'ALB-F-0083', 'ALB-F-0168'],
    // Round 9 (owner decision 2026-10-29): the line from Prague, her birthplace (ALB-F-0041), to New York Harbor
    // (ALB-F-0183), un-routed: no verified fact names the port she sailed from (JOURNEYS.md), so no ship is drawn and the
    // map says the route is not recorded.
    map: {
      id: 'arriving-leg',
      title: 'Prague to New York Harbor',
      // (fix round 2: no pin date: no single cited fact both names the place and dates it; chapters.js placeErrors)
      places: [
        { id: 'prague', label: 'Prague', note: 'Born May 15, 1937', lat: 50.0875, lon: 14.421388888888888, coord: 'wikidata:Q1085', factIds: ['ALB-F-0041', 'ALB-F-0003'] },
        { id: 'nyharbor', label: 'New York Harbor', note: 'Past the Statue of Liberty', lat: 40.689209166667, lon: -74.044425277778, coord: 'wikidata:Q9202', factIds: ['ALB-F-0183', 'ALB-F-0175'] },
      ],
      segments: [{ routed: false, mode: null }],
      resources: [
        { id: 'res-prague', label: 'Prague', lat: 50.0875, lon: 14.421388888888888, coord: 'wikidata:Q1085', factIds: ['ALB-F-0041'], media: ['ALB-M-0081'] },
        { id: 'res-harbor', label: 'New York Harbor', lat: 40.689209166667, lon: -74.044425277778, coord: 'wikidata:Q9202', factIds: ['ALB-F-0183'], media: ['ALB-M-0091'] },
      ],
      narration: A(21, ['m1'], ['ALB-F-0168']),
    },
    // her childhood before the voyage closes the birth chapter (time order); the opening tells the voyage
    place: { tier: 'room', label: 'A liner’s tourist lounge (1940)', room: LOUNGE },
    stops: LOUNGE.artifacts,
  }),
  chapter({
    id: 'citizen',
    kind: 'citizen',
    title: 'A U.S. citizen',
    year: 1957,
    yearFact: 'ALB-F-0026', // the verified fact that states the year
    factIds: ['ALB-F-0026', 'ALB-F-0074', 'ALB-F-0198'],
    place: { tier: 'room', label: 'The Rotunda, National Archives, Washington (2016)', room: ROTUNDA },
    stops: ROTUNDA.artifacts,
  }),
  chapter({
    id: 'big-work',
    kind: 'big-work',
    title: 'Ambassador to the United Nations',
    year: 1993,
    yearFact: 'ALB-F-0029', // the verified fact that states the year
    factIds: ['ALB-F-0029', 'ALB-F-0141', 'ALB-F-0051', 'ALB-F-0170', 'ALB-F-0142', 'ALB-F-0196'],
    place: { tier: 'room', label: 'The Security Council chamber, New York (1977-81)', room: CHAMBER },
    stops: CHAMBER.artifacts,
  }),
  chapter({
    id: 'secretary',
    kind: 'big-work',
    title: 'Secretary of State',
    year: 1997,
    yearFact: 'ALB-F-0193', // the verified fact that states the year
    factIds: ['ALB-F-0193', 'ALB-F-0138', 'ALB-F-0023', 'ALB-F-0059', 'ALB-F-0060'],
    // the second "big-work" chapter: its own opening line (narration/albright.json chapters.secretary)
    // the room first (the April 1993 room, a room note), then the 1997 swearing-in (fix round 1)
    // one opening line (re-review 2: the cap of one line on arrival); the label and the frame's place note
    // say the room is shown as photographed in April 1993
    opening: { keys: ['albright:ch:secretary:opening'], factIds: ['ALB-F-0023', 'ALB-F-0138', 'ALB-F-0193'] },
    place: { tier: 'room', label: 'The Oval Office as photographed in April 1993', room: OVAL_ROOM },
    stops: OVAL_ROOM.artifacts,
  }),
  chapter({
    id: 'history',
    kind: 'history',
    title: 'NATO enlargement',
    year: 1997,
    yearFact: 'ALB-F-0200', // the verified fact that states the year
    factIds: ['ALB-F-0200', 'ALB-F-0150', 'ALB-F-0123', 'ALB-F-0053', 'ALB-F-0095', 'ALB-F-0162', 'ALB-F-0195'],
    // fix round 1: the opening tells Madrid and her address in Prague (July 1997; not what the Truman Library room shows);
    // once every stop is seen: her NATO testimony in the Senate, one line (review A3), then her farewell remarks of 2001
    // round 9: her Foreign Relations testimony is told at the printed hearing (its record); the closing keeps the
    // Appropriations hearings and her farewell remarks
    closing: { keys: ['albright:21:c2', 'albright:14:c2'], factIds: ['ALB-F-0123', 'ALB-F-0195'] },
    place: { tier: 'photo', label: 'The Truman Library, Independence (March 1999)', note: TRUMAN_NOTE, photo: TRUMAN_VIEW },
    stops: [
      // time order (fix round 2): Madrid and Prague (1997), then the Truman Library (1999)
      // Madrid, July 8, 1997, then Prague, July 14, 1997
      { id: 'madrid', name: 'Madrid, July 8, 1997', art: ART['ALB-M-0071'], rail: true, clip: A(15, ['r17'], []), placeNote: 'Photographed at the Miguel Angel Hotel, Madrid, on July 8, 1997.', placeNoteLabel: WHERE },
      // the photograph the view is projected from, over her
      // round 9 (owner directive 2026-10-29): the printed hearing of October 7, 1997 on the viewing rail, with her testimony
      { id: 'hearing', name: 'Senate hearing, October 7, 1997', art: ART['ALB-M-0094'], rail: true, clip: { keys: ['albright:21:r2', 'albright:21:c1'], factIds: ['ALB-F-0053'] } },
      { id: 'photo', name: 'At the Truman Library, 1999', artifact: 'ALB-M-0060', clip: A(15, ['r16'], ['ALB-F-0150']), at: { layer: 'speaker', ringY: 2.1, glowY: 1.2, glowSize: 2.4, spotY: 2.0, dolly: 0.6, target: [2420, 517, 2960, 1150] } },
      // fix round 1 (controller ruling): the library's 2021 exterior is no stop: no cited fact ties the building to her
    ],
  }),
  chapter({
    id: 'honoured',
    kind: 'honoured',
    title: 'The Presidential Medal of Freedom',
    year: 2012,
    yearFact: 'ALB-F-0164', // the verified fact that states the year
    factIds: ['ALB-F-0164', 'ALB-F-0201', 'ALB-F-0044'],
    place: { tier: 'room', label: 'The East Room, White House (May 29, 2012)', room: EAST_ROOM },
    stops: EAST_ROOM.artifacts,
  }),
  chapter({
    id: 'legacy',
    kind: 'legacy',
    title: 'Her legacy',
    year: 2022,
    yearFact: 'ALB-F-0004', // the verified fact that states the year
    factIds: ['ALB-F-0004', 'ALB-F-0161', 'ALB-F-0046', 'ALB-F-0167', 'ALB-F-0169', 'ALB-F-0203', 'ALB-F-0174'],
    // her death and the funeral close the chapter (fix round 2: never in the opening)
    // fix round 2 (death order): her death is said at the funeral photograph, before its record line; the closing
    // is what came after it, the funeral at the Washington National Cathedral
    closing: A(14, ['c1'], ['ALB-F-0203']),
    place: {
      tier: 'gallery',
      label: 'IHH gallery',
      note: galleryNote('no photograph of a place for this chapter is on file'),
      panel: { eyebrow: 'Legacy · 2022', title: 'Madeleine Albright', factIds: ['ALB-F-0004', 'ALB-F-0161', 'ALB-F-0046', 'ALB-F-0167', 'ALB-F-0169'] },
    },
    // feedback round 7: the funeral (State Department photograph) paired with a photograph of her, in the
    // case beside the panel of her books
    stops: [
      { id: 'portrait', name: 'With President Obama, 2010', art: ART['ALB-M-0018'], clip: A(15, ['r21'], []) },
      // her books, one line (review A6); the funeral record last, just before the closing's death line (controller ruling)
      { id: 'panel', name: 'The wall panel', panel: true, clip: A(10, ['c1'], ['ALB-F-0046', 'ALB-F-0167', 'ALB-F-0169']) },
      { id: 'funeral', name: 'The funeral service, April 27, 2022', art: ART['ALB-M-0090'], clip: { keys: ['albright:14:c3', 'albright:15:r20'], factIds: ['ALB-F-0004'] } },
      // round 9 (owner directive 2026-10-29): the President's proclamation on her death (Federal Register), after the death line
      { id: 'proclamation', name: 'The proclamation, March 23, 2022', art: ART['ALB-M-0096'], clip: A(21, ['r4'], []) },
    ],
  }),
]

export const ALBRIGHT = {
  slug: 'albright',
  name: 'Madeleine Albright',
  chapters: inTimeOrder(CHAPTERS), // time order (chapters.js)
  // Landing story points (fact ids) and older links (?stop=leg-1, chamber) -> the chapter "Tour from
  // here" opens (data/index.js resolveStop).
  storyStops: {
    'ALB-F-0041': { chapter: 'birth', label: 'Born in Prague' },
    'ALB-F-0175': { chapter: 'arriving', label: 'Into New York Harbor' },
    'ALB-F-0026': { chapter: 'citizen', label: 'A U.S. citizen' },
    'ALB-F-0029': { chapter: 'big-work', label: 'Ambassador to the United Nations' },
    'ALB-F-0023': { chapter: 'secretary', label: 'Secretary of State' },
    'leg-1': { chapter: 'arriving', label: 'Into New York Harbor' },
    chamber: { chapter: 'big-work', label: 'Ambassador to the United Nations' },
  },
}
