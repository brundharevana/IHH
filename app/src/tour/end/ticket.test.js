import { test, expect } from 'vitest'
import { INDUCTEES } from '../data/index.js'
import inductees from '../../landing/data/inductees.json'
import { ticketData, ticketSvg, portraitFor, ticketAlt, nameSize, NAME_EM, PERFORATION_X } from './ticket.js'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
const EINSTEIN = INDUCTEES.einstein
const NOW = new Date(2026, 10, 11)

test('ticket data for Einstein', () => {
  const t = ticketData(EINSTEIN, { now: NOW, result: { right: 4, total: 5 } })
  const years = EINSTEIN.chapters.map((c) => c.year)
  expect(t.visited).toBe('11 November 2026')
  expect(t.number).toBe('IHH-EIN-20261111')
  expect(t.stamp).toBe('Quiz 4 of 5')
  expect(t.chapters).toBe(EINSTEIN.chapters.length)
  expect(t.span).toBe(`${Math.min(...years)}–${Math.max(...years)}`)
  expect(t.portrait).toBeNull()
})

test('no quiz, no stamp', () => {
  const t = ticketData(EINSTEIN, { now: NOW, result: null })
  expect(t.stamp).toBeNull()
  expect(ticketSvg(t)).not.toContain('Quiz')
})

test('the QR slot is a marked placeholder until the owner image is set', () => {
  const t = ticketData(EINSTEIN, { now: NOW })
  expect(ticketSvg(t)).toContain('QR code (placeholder)')
  const withQr = ticketSvg(t, { qr: 'data:image/png;base64,AAAA' })
  expect(withQr).toContain('<image')
  expect(withQr).toContain('data:image/png;base64,AAAA')
  expect(withQr).not.toContain('placeholder')
})

test('a drawn portrait always carries its credit', () => {
  const portrait = { src: '/landing/portraits/x.jpg', credit: 'Library & Co <LC-1>' }
  const t = ticketData(EINSTEIN, { now: NOW, portrait })
  const drawn = ticketSvg(t, { portraitData: 'data:image/jpeg;base64,BBBB' })
  expect(drawn).toContain('data:image/jpeg;base64,BBBB')
  expect(drawn).toContain('Library &amp; Co &lt;LC-1&gt;')
  expect(ticketSvg(t)).not.toContain('<image')
})

test('text is escaped', () => {
  const t = ticketData({ ...EINSTEIN, name: 'A & B <C>' }, { now: NOW })
  expect(ticketSvg(t)).toContain('A &amp; B &lt;C&gt;')
})

test('the ticket states nothing beyond tour data', () => {
  const result = { right: 3, total: 5 }
  for (const tour of Object.values(INDUCTEES)) {
    const t = ticketData(tour, { now: NOW, result })
    const text = [...ticketSvg(t).matchAll(/>([^<]+)</g)].map((m) => m[1]).join(' ')
    const allowed = new Set([
      ...tour.chapters.map((c) => String(c.year)),
      String(tour.chapters.length),
      String(NOW.getDate()),
      String(NOW.getFullYear()),
      String(result.right),
      String(result.total),
      t.number.split('-').pop(),
    ])
    for (const run of text.match(/\d+/g) || []) expect(allowed.has(run), `${tour.slug}: ${run}`).toBe(true)
  }
})

test('portraitFor reads the landing data and is null without a portrait', () => {
  const p = portraitFor('einstein', inductees)
  expect(p.src).toBe('/' + inductees.find((i) => i.slug === 'einstein').portrait.src)
  expect(p.credit).toMatch(/Library of Congress/)
  // every inductee has a portrait now (Naismith's: NAI-M-0078, 2026-11-18), so the no-portrait case uses an entry without one
  expect(portraitFor('naismith', inductees).src).toBe('/landing/portraits/naismith.jpg')
  expect(portraitFor('naismith', inductees.map((i) => ({ ...i, portrait: null })))).toBeNull()
  expect(portraitFor('nobody', inductees)).toBeNull()
})

const textLines = (svg) => [...svg.matchAll(/>([^<]+)</g)].map((m) => m[1])
const norm = (s) => s.replace(/\s+/g, ' ').trim()

test('exact text lines for Einstein, with and without a quiz result', () => {
  const years = EINSTEIN.chapters.map((c) => c.year)
  const span = `${Math.min(...years)}\u2013${Math.max(...years)}`
  const base = [
    'Immigrant Hall of Honor',
    'Admit one \u00b7 Guided tour',
    'Albert Einstein',
    'Visited 11 November 2026',
    `${EINSTEIN.chapters.length} chapters \u00b7 ${span}`,
  ]
  const tail = ['No. IHH-EIN-20261111', 'QR code (placeholder)', 'Scan to tell us about your visit']
  expect(textLines(ticketSvg(ticketData(EINSTEIN, { now: NOW })))).toEqual([...base, ...tail])
  expect(textLines(ticketSvg(ticketData(EINSTEIN, { now: NOW, result: { right: 4, total: 5 } })))).toEqual([
    ...base,
    'Quiz 4 of 5',
    ...tail,
  ])
})

test('every real portrait credit appears in full when drawn', () => {
  for (const i of inductees.filter((x) => x.portrait)) {
    const t = ticketData(INDUCTEES[i.slug], { now: NOW, portrait: portraitFor(i.slug, inductees) })
    const svg = ticketSvg(t, { portraitData: 'data:image/jpeg;base64,BBBB' })
    expect(norm(textLines(svg).join(' ')), i.slug).toContain(norm(esc(i.portrait.credit)))
  }
})

test('a very long credit is never cut', () => {
  const credit = Array.from({ length: 100 }, (_, n) => `word${n}`).join(' ').slice(0, 600)
  const t = ticketData(EINSTEIN, { now: NOW, portrait: { src: '/a.jpg', credit } })
  const svg = ticketSvg(t, { portraitData: 'data:image/jpeg;base64,BBBB' })
  expect(norm(textLines(svg).join(' '))).toContain(norm(credit))
})

test('ticket number uses the first three letters of a short slug', () => {
  expect(ticketData({ ...EINSTEIN, slug: 'al' }, { now: NOW }).number).toBe('IHH-AL-20261111')
  expect(ticketData({ ...EINSTEIN, slug: 'lamarr' }, { now: NOW }).number).toBe('IHH-LAM-20261111')
})

test('portraitData without a portrait draws no image', () => {
  const svg = ticketSvg(ticketData(EINSTEIN, { now: NOW }), { portraitData: 'data:image/jpeg;base64,BBBB' })
  expect(svg).not.toContain('<image')
})

// Bottom edge of the last credit line (baseline y; the font size is the descent allowance) against the frame.
function creditFits(svg, credit) {
  const first = norm(credit).split(' ')[0]
  const texts = [...svg.matchAll(/<text x="60" y="(\d+)" [^>]*font-size="(\d+)"[^>]*>([^<]*)</g)]
  expect(texts.length).toBeGreaterThan(0)
  expect(esc(first)).toBe(texts[0][3].split(' ')[0])
  const bottom = Math.max(...texts.map((m) => Number(m[1]) + Number(m[2])))
  const frame = /<rect x="14" y="14" width="1172" height="(\d+)"/.exec(svg)
  return bottom <= 14 + Number(frame[1])
}

test('the card grows so every credit line sits inside the frame', () => {
  const long = Array.from({ length: 100 }, (_, n) => `word${n}`).join(' ').slice(0, 600)
  const cases = [...inductees.filter((x) => x.portrait).map((x) => ({ slug: x.slug, credit: x.portrait.credit })), { slug: 'einstein', credit: long }]
  for (const c of cases) {
    const t = ticketData(INDUCTEES[c.slug], { now: NOW, portrait: { src: '/a.jpg', credit: c.credit } })
    const svg = ticketSvg(t, { portraitData: 'data:image/jpeg;base64,BBBB' })
    expect(creditFits(svg, c.credit), c.slug).toBe(true)
    const h = Number(/viewBox="0 0 1200 (\d+)"/.exec(svg)[1])
    expect(svg).toContain(`height="${h}" rx="28"`)
  }
})

test('the viewBox height grows only when needed', () => {
  const real = portraitFor('einstein', inductees)
  const svg = ticketSvg(ticketData(EINSTEIN, { now: NOW, portrait: real }), { portraitData: 'data:image/jpeg;base64,BBBB' })
  expect(svg).toContain('viewBox="0 0 1200 520"')
  expect(ticketSvg(ticketData(EINSTEIN, { now: NOW }))).toContain('viewBox="0 0 1200 520"')
  const long = Array.from({ length: 100 }, (_, n) => `word${n}`).join(' ').slice(0, 600)
  const tall = ticketSvg(ticketData(EINSTEIN, { now: NOW, portrait: { src: '/a.jpg', credit: long } }), { portraitData: 'data:image/jpeg;base64,BBBB' })
  expect(Number(/viewBox="0 0 1200 (\d+)"/.exec(tall)[1])).toBeGreaterThan(520)
})

const LAMARR_PORTRAIT = inductees.find((i) => i.slug === 'lamarr').portrait
const drawnLamarr = () => ticketSvg(ticketData(INDUCTEES.lamarr, { now: NOW, portrait: portraitFor('lamarr', inductees) }), { portraitData: 'data:image/jpeg;base64,BBBB' })

test('portraitFor carries the licence and the changes note', () => {
  const p = portraitFor('lamarr', inductees)
  expect(p.licence).toEqual(LAMARR_PORTRAIT.licence)
  expect(p.changes).toBe(LAMARR_PORTRAIT.changes)
  expect(portraitFor('einstein', inductees).licence).toBeNull()
})

test("Lamarr's ticket draws her licence name, licence URL and changes note in full, after the credit", () => {
  expect(LAMARR_PORTRAIT.licence?.url).toBeTruthy()
  const lines = textLines(drawnLamarr())
  const joined = norm(lines.join(' '))
  expect(joined).toContain(norm(esc(LAMARR_PORTRAIT.changes)))
  expect(lines).toContain(esc(LAMARR_PORTRAIT.licence.name))
  // the URL may run over lines, split only after a slash; read in order the lines give it whole
  expect(lines.join('')).toContain(LAMARR_PORTRAIT.licence.url)
  const at = (s) => joined.indexOf(s)
  const credit = norm(esc(LAMARR_PORTRAIT.credit))
  expect(at(credit)).toBeGreaterThanOrEqual(0)
  expect(at(norm(esc(LAMARR_PORTRAIT.changes)))).toBeGreaterThan(at(credit))
  expect(creditFits(drawnLamarr(), LAMARR_PORTRAIT.credit)).toBe(true)
})

test('a portrait without a licence draws no licence line', () => {
  const p = portraitFor('einstein', inductees)
  const svg = ticketSvg(ticketData(EINSTEIN, { now: NOW, portrait: p }), { portraitData: 'data:image/jpeg;base64,BBBB' })
  expect(svg).not.toMatch(/creativecommons|CC BY/)
  const credit = norm(esc(p.credit))
  // only the credit is drawn under the portrait
  const under = [...svg.matchAll(/<text x="60" [^>]*>([^<]*)</g)].map((m) => m[1])
  expect(norm(under.join(' '))).toBe(credit)
})

test('ticketData counts only the chapters visited', () => {
  const ch = EINSTEIN.chapters
  const last = ch.at(-1)
  const one = ticketData(EINSTEIN, { now: NOW, visited: [last.id] })
  expect(one.chapters).toBe(1)
  expect(one.span).toBe(String(last.year))
  expect(textLines(ticketSvg(one))).toContain(`1 chapter · ${last.year}`)
  const tail = ch.slice(-3)
  const three = ticketData(EINSTEIN, { now: NOW, visited: tail.map((c) => c.id) })
  const ys = tail.map((c) => c.year)
  expect(three.chapters).toBe(3)
  expect(three.span).toBe(`${Math.min(...ys)}–${Math.max(...ys)}`)
  expect(textLines(ticketSvg(three))).toContain(`3 chapters · ${three.span}`)
  // two chapters of one year: one year, plural chapters
  const same = ch.filter((c) => c.year === 1933)
  expect(same.length).toBe(2)
  const t = ticketData(EINSTEIN, { now: NOW, visited: same.map((c) => c.id) })
  expect([t.chapters, t.span]).toEqual([2, '1933'])
  // ids not in the tour are ignored; nothing given counts the whole tour
  expect(ticketData(EINSTEIN, { now: NOW, visited: [last.id, 'nope'] }).chapters).toBe(1)
  expect(ticketData(EINSTEIN, { now: NOW }).chapters).toBe(ch.length)
  expect(ticketData(EINSTEIN, { now: NOW, visited: [] }).chapters).toBe(ch.length)
})

test('ticketAlt states the name, date, chapters, stamp and number', () => {
  const t = ticketData(EINSTEIN, { now: NOW, result: { right: 4, total: 5 }, visited: [EINSTEIN.chapters.at(-1).id] })
  const alt = ticketAlt(t)
  for (const part of ['Albert Einstein', 'Visited 11 November 2026', `1 chapter · ${t.span}`, 'Quiz 4 of 5', 'No. IHH-EIN-20261111']) expect(alt).toContain(part)
  expect(ticketAlt(ticketData(EINSTEIN, { now: NOW }))).not.toContain('Quiz')
})

const nameFont = (svg) => Number(/font-family="Fraunces[^"]*" font-size="(\d+)"/.exec(svg)[1])

test('a long name shrinks so its estimated width stays left of the perforation', () => {
  const albright = ticketSvg(ticketData(INDUCTEES.albright, { now: NOW, portrait: portraitFor('albright', inductees) }), { portraitData: 'data:image/jpeg;base64,BBBB' })
  expect(INDUCTEES.albright.name).toBe('Madeleine Albright')
  expect(nameFont(albright)).toBe(64)
  for (const tour of Object.values(INDUCTEES)) expect(nameFont(ticketSvg(ticketData(tour, { now: NOW }))), tour.slug).toBe(64)
  const name = 'Abcdefghij Klmnopqrst Uvwxyzabcd Efghijk'
  expect(name).toHaveLength(40)
  for (const portraitData of [null, 'data:image/jpeg;base64,BBBB']) {
    const svg = ticketSvg(ticketData({ ...EINSTEIN, name }, { now: NOW, portrait: { src: '/a.jpg', credit: 'c' } }), { portraitData })
    const size = nameFont(svg)
    const x = Number(/<text x="(\d+)" y="215"/.exec(svg)[1])
    expect(size).toBeLessThan(64)
    expect(size).toBe(nameSize(name, x))
    expect(x + name.length * NAME_EM * size).toBeLessThanOrEqual(PERFORATION_X - 30)
  }
})
