// The basis note for a map leg (under More in the title block): what each drawn line is. A routed line follows a
// journey a verified record states (with its mode only where a record names it); an un-routed line (owner decision
// 2026-10-29) only joins two verified places; the pinned photographs are the places' own records.
import { UNROUTED_NOTE } from '../data/chapters.js'

export function mapFootnote(step) {
  const unrouted = step.segments.filter((s) => s.routed === false).length
  const routed = step.segments.length - unrouted
  const parts = []
  if (routed) {
    const which = unrouted ? 'The other lines follow' : routed > 1 ? 'The lines follow' : 'The line follows'
    parts.push(`${which} a journey a verified record states; a mode of travel is shown only where a record names it.`)
  }
  if (unrouted) parts.push(`${UNROUTED_NOTE}: where no record states how the journey was made, the line only joins two verified places.`)
  if (step.resources?.length) parts.push('The pinned photographs show the places; open one to see its record.')
  return parts.join(' ')
}

// The map canvas's accessible label (Codex review, round 9: every map was called "the journey", even where no record
// states how it was made): a routed map names the journey; an un-routed line only joins verified places.
export function mapCanvasLabel(map) {
  const places = map.places.map((p) => p.label).join(', then ')
  const segs = map.segments || []
  const unrouted = segs.filter((s) => s.routed === false).length
  if (!unrouted) return `Map of the journey: ${places}`
  if (unrouted === segs.length) return `Map of ${places}: the route is not recorded; the line only joins verified places`
  return `Map of the journey: ${places}. Where the route is not recorded, the line only joins verified places`
}
