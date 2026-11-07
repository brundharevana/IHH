// Which records a rebuilt room shows at its stops, and where (feedback round 7: a stop that refers to
// a record shows that record in the scene, never just a number over empty furniture). No React here
// (tested in node); RoomRecords.jsx draws them.
//
// A room stop refers to a record with `artifact: '<media id>'` (or `art`). The room shows:
//   - the record's cleared image (its first page, the page it opens on, its photograph, or the first
//     letter of a series), framed, at the stop; a link-only record has no image here (its rights are
//     unknown): a labelled card with its title and "View at the holder" stands in its place;
//   - nothing extra for a model record placed as a room prop (`prop`): its own glb is the object.
// Where (`display`, in the stop's data, metres, room coordinates):
//   { mount: 'lie', pos, rotY?, tilt?, size }   on a desk or table: `pos` is the middle of its near
//                                                edge on the surface, the far edge raised by `tilt`
//                                                (radians), a reading slope toward the visitor
//   { mount: 'stand', pos, rotY?, size, floor? } upright on a wooden easel on the floor (or on the ground or
//                                                stage at height `floor`), near the room's
//                                                architecture (owner feedback round 9: never a post out
//                                                in the open; e2e/camcheck.mjs 'placement')
//   { mount: 'wall', pos, rotY?, size }          upright, hung (no stand)
//   pos (upright): the record's centre; rotY: the turn about the vertical (0 faces +z); size: [w, h] the most it
//   may take (the image keeps its own aspect inside it).
// A stop with an invisible `anchor` and no `display` gets one from the anchor: upright in the anchor's
// box, facing the stop's own camera pose (or the room's start view), on an easel when it is low enough
// to reach the floor, else hung. A stop anchored only on model nodes must give its `display`.
import { artifactById, seriesLetters } from '../data/artifacts.js'

export const recordOf = (stop) => stop.art || (stop.artifact ? artifactById(stop.artifact) : null)

// the image of a record shown in a room: null for a link-only record or one with no image
export function recordImage(art) {
  if (!art || art.linkOnly) return null
  if (art.kind === 'series') return recordImage(seriesLetters(art)[0])
  const page = art.pages?.[art.startPage || 0] || art.pages?.[0]
  return page?.src || art.photos?.[0]?.src || null
}

// an easel reaches the floor when the record's foot is no higher than this (metres)
const STAND_MAX = 1.75

function fromAnchor(stop, eye) {
  const [x, y, z] = stop.anchor.pos
  const [sx, sy, sz] = stop.anchor.size
  // the record lies in the anchor's upright face: its thin horizontal axis is the face's normal
  const alongX = sz <= sx
  const toward = alongX ? Math.sign((eye?.[2] ?? z + 1) - z) || 1 : Math.sign((eye?.[0] ?? x + 1) - x) || 1
  const rotY = alongX ? (toward > 0 ? 0 : Math.PI) : toward > 0 ? Math.PI / 2 : -Math.PI / 2
  const size = [alongX ? sx : sz, sy]
  return { mount: y - sy / 2 <= STAND_MAX ? 'stand' : 'wall', pos: [x, y, z], rotY, size, derived: true }
}

// A labelled panel stop in a room (owner feedback round 8: a stop's lines are about what it shows; a line
// with no record and no object of its own gets its own correctly labelled panel):
//   { id, name, panel: { eyebrow?, title, factIds }, anchor | display, clip }
// The room draws it as a printed card on a stand (like a link-only record's card): its title and the
// verified text of its facts, each id beneath its line. Its clip tells the same facts.
export const roomPanelOf = (stop) => (stop.panel && typeof stop.panel === 'object' ? stop.panel : null)

// A stop declares a record when its data says one stands there: a record binding (artifact / art), a labelled panel,
// a display or a free anchor (not on the model's own nodes), or a record line in its clip (a cue r1, r2, ...). A model
// shown as a prop is drawn by the room, not here. The record gates compare what is drawn against this list, never
// against the surviving bindings (Codex review 3: a removed binding dropped the stop from the gates' own list). A prop
// (a model the room draws itself) is no record mesh here, but a prop with no record bound is a problem all the same
// (Codex review 4), and records.lock.json declares its record.
const RECORD_LINE = /:r\d+$/
export function declaresRecord(stop) {
  if (stop.prop) return false
  if (stop.artifact || stop.art || roomPanelOf(stop) || stop.display) return true
  if (stop.anchor && !stop.nodes?.length) return true
  return (stop.clip?.keys || []).some((k) => RECORD_LINE.test(k))
}
export const declaredRecordIds = (room) => (room.artifacts || []).filter(declaresRecord).map((s) => s.id)

// room: the tour's room data (shape.js room: artifacts, poses). Returns one entry per stop that refers
// to a record, or is a labelled panel: { id, art, panel, src, linkOnly, prop, display, problem }; `problem`
// says why such a stop would show nothing in the scene (the tests fail on it).
export function roomRecordStops(room) {
  const out = []
  for (const stop of room.artifacts || []) {
    const panel = roomPanelOf(stop)
    if (panel) {
      const eye = room.poses?.desktop?.[stop.id]?.pos || room.poses?.desktop?.start?.pos
      const display = stop.display ? { rotY: 0, ...stop.display } : stop.anchor ? fromAnchor(stop, eye) : null
      let problem = null
      if (!panel.title || !panel.factIds?.length) problem = `${stop.id}: a panel needs a title and the fact ids it prints`
      else if (!display) problem = `${stop.id}: a panel needs an anchor or a display (where it stands)`
      out.push({ id: stop.id, art: null, panel, src: null, linkOnly: false, prop: false, display, problem })
      continue
    }
    const art = recordOf(stop)
    if (!art) {
      // a stop that declares a record but binds none shows nothing where its data says a record stands
      if (declaresRecord(stop) || stop.prop) out.push({ id: stop.id, art: null, panel: null, src: null, linkOnly: false, prop: false, display: null, problem: `${stop.id}: the stop declares a record but binds no record` })
      continue
    }
    const src = recordImage(art)
    const entry = { id: stop.id, art, src, linkOnly: Boolean(art.linkOnly), prop: Boolean(stop.prop), display: null, problem: null }
    if (stop.prop) {
      if (art.kind !== 'model') entry.problem = `${stop.id}: a prop stands for a ${art.kind} record`
      out.push(entry)
      continue
    }
    if (art.kind === 'model') entry.problem = `${stop.id}: a model record needs a prop (its glb) to be seen in the room`
    else if (!src && !art.linkOnly) entry.problem = `${stop.id}: record ${art.id} has no image to show`
    const eye = room.poses?.desktop?.[stop.id]?.pos || room.poses?.desktop?.start?.pos
    entry.display = stop.display ? { rotY: 0, ...stop.display } : stop.anchor ? fromAnchor(stop, eye) : null
    if (!entry.display && !entry.problem) entry.problem = `${stop.id}: anchored on model nodes only: give it a display (where the record lies or stands)`
    const d = entry.display
    if (d && !entry.problem) {
      if (!['lie', 'stand', 'wall'].includes(d.mount)) entry.problem = `${stop.id}: unknown display mount ${d.mount}`
      else if (!(d.pos?.length === 3 && d.pos.every(Number.isFinite))) entry.problem = `${stop.id}: display has no position`
      else if (!(d.size?.length === 2 && d.size.every((v) => v > 0.05))) entry.problem = `${stop.id}: display size too small to see`
    }
    out.push(entry)
  }
  return out
}

// the record's drawn size inside its display box, from the image's own aspect (w / h)
export function fitRecord(size, aspect) {
  const [W, H] = size
  const a = aspect > 0 ? aspect : 0.75
  return W / H > a ? [H * a, H] : [W, W / a]
}
