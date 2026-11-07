// A chapter tells its story forward in time (owner rule, round 7 fix round 2): in the order a visitor
// hears it (the opening, the arrival line, the stops in their order, each stop's own clip then its
// record's, the closing), every line that states a year states one no earlier than the line before it
// that does. A line's year is the earliest year it says aloud ("From 1993 to 1997" is 1993); a line
// that states no year is exempt (it adds no date to the order). A later record shown in a chapter must
// say so in words that pass the narration gate, or move to the chapter of its year.
import { artifactById } from './artifacts.js'

const YEAR = /(?<!\d)(?<!\d[,.])(1[0-9]{3}|20[0-9]{2})(?!\d)(?![,.]\d)/g
export const yearsSaid = (text) => [...String(text || '').matchAll(YEAR)].map((m) => Number(m[1]))

const recordOf = (s) => s.art || (s.artifact ? artifactById(s.artifact) : null)

// '<slug>:<chapter>:<cue>' or '<slug>:ch:<key>:opening' -> the spoken text (the caption)
export function textOf(narration, key) {
  const [slug, a, b] = key.split(':')
  const chs = narration[slug]?.chapters || {}
  if (a === 'ch') return chs[b]?.opening?.text ?? null
  return (chs[a]?.lines || []).find((l) => l.cue === b)?.text ?? null
}

// [{ key, where }] in play order
export function playOrder(slug, c) {
  const out = []
  const add = (clip, where) => (clip?.keys || []).forEach((key) => out.push({ key, where }))
  add(c.opening || { keys: [`${slug}:ch:${c.kind}:opening`] }, 'opening')
  add(c.narration, 'arrival')
  add(c.place.room?.narration, 'arrival')
  for (const s of c.stops) {
    const seen = new Set(s.clip?.keys || [])
    add(s.clip, `stop ${s.id}`)
    add({ keys: (recordOf(s)?.clip?.keys || []).filter((k) => !seen.has(k)) }, `stop ${s.id}`)
  }
  add(c.place.room?.closing || c.closing, 'closing')
  return out
}

export function storyOrderErrors(tour, narration) {
  const errs = []
  for (const c of tour.chapters) {
    let last = null
    for (const { key, where } of playOrder(tour.slug, c)) {
      const ys = yearsSaid(textOf(narration, key))
      if (!ys.length) continue
      const y = Math.min(...ys)
      if (last && y < last.y) errs.push(`${tour.slug}/${c.id}: ${where} (${key}, ${y}) comes after ${last.where} (${last.key}, ${last.y})`)
      if (!last || y >= last.y) last = { y, key, where }
    }
  }
  return errs
}
