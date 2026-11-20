// The end-of-tour ticket: a museum-style card drawn as a standalone SVG, saved by the visitor as a PNG.
// It states only tour data (name, chapter count and years, the visit date, the quiz score) and, under a
// drawn portrait, the portrait's credit, changes note and licence from the landing data. Pure except
// ticketPng and toDataUrl, which need a browser.

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

// The landing's portrait for a slug as { src, credit, licence, changes }, or null when the inductee has
// none. licence ({ name, url }) and changes are carried for a Creative Commons portrait (CC BY 4.0, 3(a)),
// null when the landing data has none.
export function portraitFor(slug, inductees) {
  const p = inductees.find((i) => i.slug === slug)?.portrait
  return p ? { src: '/' + p.src, credit: p.credit, licence: p.licence || null, changes: p.changes || null } : null
}

// `visited`: the ids of the chapters shown in this visit (a visit can start mid-tour); every chapter
// when it is not given. chapters and span count only those.
export function ticketData(tour, { portrait = null, result = null, now = new Date(), visited = null } = {}) {
  const seen = visited ? tour.chapters.filter((c) => visited.includes(c.id)) : []
  const shown = seen.length ? seen : tour.chapters
  const years = shown.map((c) => c.year)
  const [lo, hi] = [Math.min(...years), Math.max(...years)]
  const pad = (n) => String(n).padStart(2, '0')
  const ymd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  return {
    name: tour.name,
    slug: tour.slug,
    visited: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    chapters: shown.length,
    span: lo === hi ? String(lo) : `${lo}–${hi}`,
    stamp: result ? `Quiz ${result.right} of ${result.total}` : null,
    number: `IHH-${tour.slug.slice(0, 3).toUpperCase()}-${ymd}`,
    portrait,
  }
}

// "3 chapters · 1879–1955", "1 chapter · 1955"
export const chapterLine = (t) => `${t.chapters} ${t.chapters === 1 ? 'chapter' : 'chapters'} · ${t.span}`

// The ticket's text for its <img> alt: everything the card states, in reading order.
export const ticketAlt = (t) =>
  [`Your ticket for the ${t.name} tour, Immigrant Hall of Honor.`, `Visited ${t.visited}.`, `${chapterLine(t)}.`, t.stamp ? `${t.stamp}.` : '', `No. ${t.number}.`]
    .filter(Boolean)
    .join(' ')

const SERIF = 'Fraunces, Georgia, serif'
const SANS = 'Poppins, Helvetica, Arial, sans-serif'
const ACCENT = '#ff9b2d'

// Greedy word wrap for the portrait credit (SVG has no automatic wrapping).
function wrap(text, max) {
  const lines = []
  let line = ''
  for (const w of String(text).split(/\s+/)) {
    if (line && (line + ' ' + w).length > max) {
      lines.push(line)
      line = w
    } else line = line ? line + ' ' + w : w
  }
  if (line) lines.push(line)
  return lines
}

// A URL has no spaces to wrap at: it is split after its slashes into pieces of at most `max` characters
// (a piece without a slash that is still longer stays whole). Read in order, the pieces are the URL.
function wrapUrl(url, max) {
  const lines = []
  let line = ''
  for (const part of String(url).split(/(?<=\/)/)) {
    if (line && (line + part).length > max) {
      lines.push(line)
      line = part
    } else line += part
  }
  if (line) lines.push(line)
  return lines
}

// The name is one line in the serif at 64px, shrunk when an estimated width would reach the
// perforation (x 860) less a margin. The estimate (0.48 em a character) keeps "Madeleine Albright" at 64px.
export const NAME_EM = 0.48
export const PERFORATION_X = 860
export function nameSize(name, x, { margin = 30, max = 64 } = {}) {
  const room = PERFORATION_X - margin - x
  return Math.min(max, Math.floor(room / (Math.max(1, [...String(name)].length) * NAME_EM)))
}

export function ticketSvg(t, { qr = null, portraitData = null } = {}) {
  const drawPortrait = Boolean(t.portrait && portraitData)
  const x = drawPortrait ? 270 : 70
  const text = (px, y, size, fill, body, extra = '') =>
    `<text x="${px}" y="${y}" font-family="${SANS}" font-size="${size}" fill="${fill}" ${extra}>${esc(body)}</text>`

  let portrait = ''
  let height = 520
  if (drawPortrait) {
    // Attribution is never cut: the credit, then (a Creative Commons portrait, as on the landing) the
    // changes note and the licence name and URL. 10px lines, or 9px (narrower wrap, tighter spacing)
    // when that needs more than 6 lines.
    const { credit: by, changes, licence } = t.portrait
    const block = (max) => [
      ...wrap(by, max),
      ...(changes ? wrap(changes, max) : []),
      ...(licence?.name ? wrap(licence.name, max) : []),
      ...(licence?.url ? wrapUrl(licence.url, max) : []),
    ]
    let size = 10
    let lines = block(34)
    if (lines.length > 6) {
      size = 9
      lines = block(38)
    }
    // The card grows so the last credit line sits inside the frame (frame bottom = height - 14).
    height = Math.max(520, 356 + (lines.length - 1) * (size + 2) + size + 20)
    const credit = lines.map((l, i) => text(60, 356 + i * (size + 2), size, '#8a93a1', l)).join('')
    portrait =
      `<image href="${esc(portraitData)}" x="60" y="80" width="170" height="260" preserveAspectRatio="xMidYMid slice"/>` + credit
  }

  const qrSlot = qr
    ? `<image href="${esc(qr)}" x="910" y="90" width="240" height="240"/>`
    : `<rect x="910" y="90" width="240" height="240" fill="none" stroke="${ACCENT}" stroke-width="2" stroke-dasharray="10 8"/>` +
      text(1030, 215, 16, '#8a93a1', 'QR code (placeholder)', 'text-anchor="middle"')

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 ${height}" width="1200" height="${height}">`,
    `<rect width="1200" height="${height}" rx="28" fill="#10151d"/>`,
    `<rect x="14" y="14" width="1172" height="${height - 28}" rx="20" fill="none" stroke="${ACCENT}" stroke-opacity="0.5" stroke-width="2"/>`,
    text(x, 90, 18, ACCENT, 'Immigrant Hall of Honor', 'letter-spacing="4"'),
    text(x, 128, 20, '#f2f4f7', 'Admit one · Guided tour'),
    `<text x="${x}" y="215" font-family="${SERIF}" font-size="${nameSize(t.name, x)}" fill="#ffffff">${esc(t.name)}</text>`,
    text(x, 275, 22, '#f2f4f7', `Visited ${t.visited}`),
    text(x, 312, 22, '#c3c9d3', chapterLine(t)),
    t.stamp ? text(x, 372, 22, ACCENT, t.stamp, 'font-weight="600"') : '',
    text(x, 470, 16, '#8a93a1', `No. ${t.number}`, 'letter-spacing="2"'),
    `<line x1="860" y1="30" x2="860" y2="${height - 30}" stroke="${ACCENT}" stroke-opacity="0.6" stroke-width="3" stroke-dasharray="3 12" stroke-linecap="round"/>`,
    qrSlot,
    text(1030, 372, 16, '#f2f4f7', 'Scan to tell us about your visit', 'text-anchor="middle"'),
    portrait,
    `</svg>`,
  ].join('')
}

// Browser only. Draws the SVG on a canvas and returns a PNG blob.
export async function ticketPng(svg, scale = 2) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 1200 * scale
    canvas.height = Number(/viewBox="0 0 1200 (\d+)"/.exec(svg)?.[1] || 520) * scale
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('png failed'))), 'image/png'))
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Browser only. Same-origin image to a data URL; null on any failure.
export async function toDataUrl(src) {
  try {
    const res = await fetch(src)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = () => resolve(null)
      r.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}
