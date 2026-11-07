// "Moments That Made Them": every turning point of every inductee in one list (spec 2.7). Pure data
// and layout helpers; Moments.jsx draws them. Inductees still on the step shape have no chapters and
// contribute nothing until they are converted.

// Visitor-facing name of each chapter kind (chapters.js CHAPTER_KINDS), in chapter order.
import { CHAPTER_KINDS } from '../data/chapters.js'
import { artifactById } from '../data/artifacts.js'

// A chapter's thumbnail is a cleared media record; link-only media never yields an image (null: no image).
export function thumbSrc(mediaId) {
  const a = mediaId ? artifactById(mediaId) : null
  if (!a || a.linkOnly) return null
  return a.thumb || a.photos?.[0]?.src || a.pages?.[0]?.src || null
}

export const KIND_LABELS = {
  birth: 'Where it began',
  education: 'Learning',
  leaving: 'Leaving home',
  arriving: 'Arriving',
  'first-work': 'First work',
  citizen: 'Becoming a citizen',
  'big-work': 'Their big work',
  history: 'Part of history',
  honoured: 'Honoured',
  legacy: 'Legacy',
}

// tours: { [slug]: { slug, name, chapters? } }. generated: chapters.generated.json, which carries each
// chapter's thumbMediaId (already free of link-only and basis photos).
export function momentsIndex(tours, generated = {}) {
  const out = []
  for (const [key, tour] of Object.entries(tours)) {
    if (!tour.chapters) continue
    const slug = tour.slug || key
    for (const c of tour.chapters) {
      const g = (generated[slug] || []).find((x) => x.id === c.id)
      out.push({ slug, name: tour.name, chapterId: c.id, kind: c.kind, title: c.title, year: c.year ?? g?.year ?? null, thumbMediaId: g?.thumbMediaId ?? null })
    }
  }
  return out
}

// A chip's label: the table above, else the kind id made readable (a new kind never shows blank).
export const kindLabel = (k) => KIND_LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1)).replace(/-/g, ' ')

// The kinds present in `items`, in chapter order (unknown kinds last).
export const kindsOf = (items) => {
  const rank = (k) => (CHAPTER_KINDS.includes(k) ? CHAPTER_KINDS.indexOf(k) : CHAPTER_KINDS.length)
  return [...new Set(items.map((m) => m.kind))].sort((a, b) => rank(a) - rank(b))
}

export const filterByKind = (items, kind) => (kind ? items.filter((m) => m.kind === kind) : items)

// Oldest first; the sort is stable, so ties keep the inductees' order. Undated moments go last.
export const byTimeline = (items) => [...items].sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity))

// What a moment's thumbnail shows (final review I6: thumbnails came from other dates and places with
// no label). `art`: the media record (artifacts.js). alt: the holder's title and the record's date.
// caption (shown under the thumbnail): the record's kind and date; a photograph from another year
// than the card's moment says so plainly.
const KIND_WORD = { photo: 'Photograph', sheet: 'Sheet', letter: 'Letter', document: 'Document', model: 'Recreation' }
export const yearOf = (date) => {
  const m = String(date ?? '').match(/(?<!\d)(1[5-9]\d\d|20\d\d)(?!\d)/)
  return m ? Number(m[1]) : null
}
export function thumbLabel(art, momentYear) {
  if (!art) return null
  const date = art.date ? String(art.date) : null
  const word = KIND_WORD[art.kind] || 'Record'
  const other = art.kind === 'photo' && yearOf(date) != null && momentYear != null && yearOf(date) !== momentYear
  return {
    alt: [art.title, date].filter(Boolean).join(', '),
    caption: other ? `${word} from ${date}, not of this moment` : date ? `${word}, ${date}` : word,
    otherMoment: other,
  }
}

export const momentHref = (m) => `/tour.html?inductee=${m.slug}&chapter=${m.chapterId}`

// Deterministic, collision-free placement. The field is cut into a grid of cells, each larger than
// a card plus its drift margin; a seed shuffles which card takes which cell and nudges it inside the
// slack of its cell, so cards can never touch each other or leave the field (the header and the
// filter chips sit above the field, outside it). The field grows in height when the cards need it.
export function layoutField({ n, W, cw, ch, minH, seed, ordered = false }) {
  let s = seed || 1
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
  const GAP = 18
  const PAD = 10
  const maxCols = Math.max(1, Math.min(n, Math.floor((W - 2 * PAD) / (cw + GAP))))
  const rows = Math.ceil(n / maxCols)
  const cols = Math.ceil(n / rows) // balance the rows instead of leaving a lone card
  const cellW = (W - 2 * PAD) / cols
  const cellH = Math.max(ch + GAP + 12, (minH - 2 * PAD) / rows)
  const order = Array.from({ length: n }, (_, i) => i)
  if (!ordered) for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
  const sx = Math.max(0, cellW - cw - GAP) / 2
  const sy = Math.max(0, cellH - ch - GAP - 12) / 2
  const pos = new Array(n)
  order.forEach((card, k) => {
    const r = Math.floor(k / cols)
    const inRow = r === rows - 1 ? n - r * cols : cols
    const c = (k % cols) + (cols - inRow) / 2
    const jx = ordered ? 0 : (rnd() * 2 - 1) * sx
    const jy = ordered ? (k % 2 ? 1 : -1) * sy * 0.6 : (rnd() * 2 - 1) * sy
    pos[card] = { x: PAD + (c + 0.5) * cellW + jx, y: PAD + (r + 0.5) * cellH + jy }
  })
  return { pos, height: Math.ceil(2 * PAD + rows * cellH), rows }
}
