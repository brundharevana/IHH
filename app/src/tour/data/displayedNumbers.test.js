// Displayed copy carries no number its own grounds lack (displayedNumbers.js), item by item: a chapter's
// title, place and panel; a room's title and labels (including the label read from its glb at run time);
// each stop; each record card with its model notes; each map place and segment.
import { test, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { INDUCTEES } from './index.js'
import { artifactById } from './artifacts.js'
import INDEX from './facts.generated.json'
import { numbersIn, shownStrings, citedFacts, ungroundedItem, stripIds } from './displayedNumbers.js'

const DATA = new URL('../../../../data/inductees/', import.meta.url)
const rows = (slug, f) => {
  const p = new URL(`${slug}/${f}`, DATA)
  return existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)) : []
}
const MEDIA = {}
const SOURCES = {}
for (const slug of Object.keys(INDUCTEES)) {
  for (const m of rows(slug, 'media.jsonl')) MEDIA[m.id] = { ...m, slug }
  for (const s of rows(slug, 'sources.jsonl')) SOURCES[s.id] = { ...s, slug }
}
// each saved page read once (a record's grounds are asked for by every item that cites it)
const SNAPSHOTS = new Map()
const snapshot = (s) => {
  const p = s.snapshot && new URL(`${s.slug}/${s.snapshot}`, DATA)
  if (!p) return ''
  if (!SNAPSHOTS.has(p.href)) SNAPSHOTS.set(p.href, existsSync(p) ? readFileSync(p, 'utf8') : '')
  return SNAPSHOTS.get(p.href)
}
// a verified, cleared record: its title, alt text, credit and rights words, and the holder's words in
// its sources. A modelling reference (not verified, not cleared, or ruled reference only) grounds nothing.
const recordGrounds = (id) => {
  const m = MEDIA[id]
  if (!m || !INDEX.media[id]?.embeddable) return []
  return [{ own: [m.title, m.alt_text, m.credit, m.rights_statement].filter(Boolean), sources: (m.source_ids || []).map((s) => SOURCES[s]).filter(Boolean).flatMap((s) => [s.title, snapshot(s)]) }]
}
const claims = (ids) => [...ids].map((f) => INDEX.facts[f]?.claim).filter(Boolean)
const recordOf = (stop) => stop.art || (stop.artifact ? artifactById(stop.artifact) : null)
// the records an item cites itself: a record card its record and letters; a room, or a stop whose
// place note compares it with the room, its `records`
const ownRecords = (rec, more = []) => [...(rec ? [rec.id, ...(rec.letters || [])] : []), ...more].flatMap(recordGrounds)
// the label the app reads from a room's glb at run time (node label_recreation, extras.text); the
// phone reads the -mobile glb's
export function glbLabel(model) {
  const p = new URL(`../../../public${model}.glb`, import.meta.url)
  if (!existsSync(p)) return null
  const b = readFileSync(p)
  const len = b.readUInt32LE(12)
  const doc = JSON.parse(b.subarray(20, 20 + len).toString('utf8'))
  return (doc.nodes || []).find((n) => n.name === 'label_recreation')?.extras?.text || null
}
const PAGE_LOCATOR = /^(?:Drawing )?(?:sheet|page) (\d{1,2})$/i
const LANDING = JSON.parse(readFileSync(new URL('../../landing/data/inductees.json', import.meta.url), 'utf8'))

// every displayed string checked (its path), for the coverage tests below
export const checked = []
export function violations() {
  const out = []
  checked.length = 0
  const check = (strings, grounds) => {
    checked.push(...strings.map((x) => x.path))
    out.push(...ungroundedItem(strings, grounds))
  }
  for (const [slug, tour] of Object.entries(INDUCTEES)) {
    for (const c of tour.chapters) {
      const tag = `${slug}/${c.id}`
      const chapterFacts = claims(c.factIds)
      const p = c.place
      const roomRecs = (p.room?.records || []).flatMap(recordGrounds)
      // the chapter: title, place label and note, panel, on its facts and the records it cites (its
      // photo room's photograph, its room's `records`)
      check(shownStrings({ title: c.title, label: p.label, note: p.tier === 'room' ? undefined : p.note }, tag), { facts: chapterFacts, records: [...(p.photo ? recordGrounds(p.photo.mediaId) : []), ...roomRecs] })
      // the chapter's year (the Moments timeline and its cards show it), on the chapter's facts
      if (c.year != null) check([{ path: `${tag}.year`, text: String(c.year) }], { facts: chapterFacts })
      if (p.panel) check(shownStrings(p.panel, `${tag}.panel`), { facts: claims(p.panel.factIds || []) })
      // the room: title, labels (the data's, else each glb's: desktop and phone), note
      if (p.room) {
        const r = p.room
        const roomGrounds = { facts: [...chapterFacts, ...claims(citedFacts({ narration: r.narration, closing: r.closing }))], records: roomRecs }
        const strs = shownStrings({ title: r.title, labelFallback: r.labelFallback, note: r.note }, `${tag}.room`)
        const labels = r.labelText ? [['labelText', r.labelText]] : [['glbLabel', glbLabel(r.model)], ['glbLabelMobile', glbLabel(`${r.model}-mobile`)]]
        for (const [k, text] of labels) if (text) strs.push({ path: `${tag}.room.${k}`, text })
        check(strs, roomGrounds)
      }
      // each stop: its name and place note, on the chapter's facts, its clip's and its own record
      for (const s of c.stops) {
        check(shownStrings({ name: s.name, placeNote: s.placeNote }, `${tag}.stop.${s.id}`), { facts: [...chapterFacts, ...claims(citedFacts(s.clip || {}))], records: ownRecords(recordOf(s), s.records) })
        // a room's labelled panel stop (round 8): its eyebrow and title, on the facts it prints
        if (s.panel && typeof s.panel === 'object') check(shownStrings(s.panel, `${tag}.stop.${s.id}.panel`), { facts: claims(s.panel.factIds || []) })
      }
      // each record card, with its pages' and photographs' labels and its model notes, on its own
      // record and the facts it cites
      for (const r of c.stops.map(recordOf).filter((x) => x?.title)) {
        // a page's position label ("Drawing sheet 2") numbering the record's own pages in order is not a
        // claim; a page number beyond them ("Page 7" of a newspaper) is checked like any copy
        const strings = shownStrings(r, `${tag}:${r.id}`, new Set(['links', 'src'])).filter((x) => {
          const loc = /\.pages\[\d+\]\.label$/.test(x.path) && PAGE_LOCATOR.exec(x.text)
          return !(loc && Number(loc[1]) <= r.pages.length)
        })
        check(strings, { facts: claims(citedFacts(r)), records: ownRecords(r) })
      }
      if (c.map) {
        for (const pl of c.map.places) check(shownStrings(pl, `${tag}.map.${pl.id}`), { facts: claims(pl.factIds || []) })
        c.map.segments.forEach((s, i) => check(shownStrings(s, `${tag}.map.segments[${i}]`), { facts: claims([...(s.factIds || []), ...(s.journey?.facts || []), ...(s.modeFacts || [])]) }))
      }
    }
  }
  // the landing: each inductee's portrait, and each turning point (label, year, claim, its record)
  for (const ind of LANDING) {
    const tag = `landing/${ind.slug}`
    check([{ path: `${tag}.name`, text: ind.name }], { facts: [] })
    const fields = (o, keys, path) => keys.map((k) => ({ path: `${path}.${k}`, text: o[k] })).filter((x) => x.text)
    if (ind.portrait) check(fields(ind.portrait, ['alt', 'credit', 'rights'], `${tag}.portrait`), { records: recordGrounds(ind.portrait.media_id) })
    for (const pt of ind.points || []) {
      const t = `${tag}.${pt.id}`
      check([{ path: `${t}.label`, text: pt.label }, { path: `${t}.year`, text: pt.year == null ? '' : String(pt.year) }, { path: `${t}.claim`, text: pt.claim }], { facts: claims([pt.factId].filter(Boolean)), records: pt.artifact?.media ? recordGrounds(pt.artifact.media.id) : [] })
      if (pt.source?.title) check([{ path: `${t}.source.title`, text: pt.source.title }], { records: [SOURCES[pt.source.id]?.title].filter(Boolean) })
      const md = pt.artifact?.media
      if (md) check(fields(md, ['title', 'alt', 'credit', 'rights', 'holder'], `${t}.media`), { facts: claims([pt.factId].filter(Boolean)), records: recordGrounds(md.id) })
    }
  }
  return out
}

test('numbersIn reads dates, years and grouped numbers as integers; ids in their exact forms only', () => {
  expect(numbersIn('May 17, 1943; 1,200 m; 1936-01-15; c1894; 1977-81; a 3D model; listing LB24825, MP-0000.648.11')).toEqual([17, 1943, 1200, 1936, 1, 15, 1894, 1977, 1981])
  // overly broad id-like strings are numbers, not identifiers
  expect(numbersIn('Hall B1910, room A 34, LBX24825')).toEqual([1910, 34, 24825])
  expect(stripIds('NAID 305247 and LC-USZ62-60242 and Patent 2,292,387')).not.toMatch(/\d/)
})

test('a number must be in the item\'s own grounds, in a matching context and unit', () => {
  const s = (text) => [{ path: 'x', text }]
  // an unrelated year: "built in 1887" is not grounded by "entered the college in 1887"
  expect(ungroundedItem(s('The hall was built in 1887.'), ['In 1887 he entered the college.'])).toHaveLength(1)
  expect(ungroundedItem(s('The hall was built in 1887.'), ['The hall was built in 1887 of stone.'])).toEqual([])
  // a wrong unit: 34 m is not 34 years
  expect(ungroundedItem(s('The hall is 34 m long.'), ['The hall stood for 34 years.'])[0].missing).toEqual(['34 m'])
  expect(ungroundedItem(s('The hall is 34 m long.'), ['The hall is 34 m long and 12 m wide.'])).toEqual([])
  // a number word is a number
  expect(ungroundedItem(s('The hall had twelve windows.'), ['The hall had many windows.'])[0].missing).toEqual([12])
  // a bare date (no other words) needs only the number
  expect(ungroundedItem(s('May 17, 1943'), ['Letter of May 17, 1943 to the Bureau.'])).toEqual([])
  // a record's own numbers ground copy about it; a fact that is not cited does not
  expect(ungroundedItem(s('The meadow, 1923'), { records: ['Muir\'s Fountain Lake Home. Date: 1923.'] })).toEqual([])
  expect(ungroundedItem(s('The meadow, 1923'), { facts: [], records: [] })).toHaveLength(1)
})

test('a number keeps its whole value: 1.2 m is not 2.1 m', () => {
  expect(numbersIn('a beam of 1.2 m and one of 2.1 m; 1,200 visitors')).toEqual([1.2, 2.1, 1200])
  const s = (text) => [{ path: 'x', text }]
  expect(ungroundedItem(s('The beam is 1.2 m long.'), ['The beam is 2.1 m long.'])[0].missing).toEqual(['1.2 m'])
  expect(ungroundedItem(s('The beam is 1.2 m long.'), ['The beam is 1.2 m long.'])).toEqual([])
})

test('a number is bound to its own phrase: the ground must say it about the same thing, in one clause', () => {
  const s = (text) => [{ path: 'x', text }]
  // the shared word "college" is not enough: the copy says "built", the fact says "entered"
  expect(ungroundedItem(s('The college was built in 1887.'), ['In 1887 he entered the college.'])[0].missing).toEqual([1887])
  // the words must sit in the clause that holds the number, not elsewhere in the sentence
  expect(ungroundedItem(s('The college was built in 1887.'), ['The college was built of stone; in 1887 he entered it.'])).toHaveLength(1)
  expect(ungroundedItem(s('The college was built in 1887.'), ['The college was built in 1887 of stone.'])).toEqual([])
  // values swapped between subjects in one clause: each number is bound to the thing it counts
  expect(ungroundedItem(s('The hall has 8 windows and 12 doors.'), ['The hall has 12 windows and 8 doors.'])[0].missing).toEqual([8, 12])
  expect(ungroundedItem(s('The hall has 8 windows and 12 doors.'), ['The hall has 8 windows and 12 doors.'])).toEqual([])
  expect(ungroundedItem(s('The hall is 12 m long and 34 m wide.'), ['The hall is 34 m long and 12 m wide.'])[0].missing).toEqual(['12 m', '34 m'])
  expect(ungroundedItem(s('The hall is 34 m long and 12 m wide.'), ['The hall is 34 m long and 12 m wide.'])).toEqual([])
  // a day needs its own month
  expect(ungroundedItem(s('Photographed on May 17, 1943.'), ['Photographed on June 17, 1943.'])[0].missing).toEqual([17])
})

test('a record grounds only its own dates and words, and only for copy that cites it', () => {
  const s = (text) => [{ path: 'x', text }]
  const lake = { own: ["Muir's Fountain Lake Home, 1923."], sources: [] }
  expect(ungroundedItem(s('The meadow, 1923'), { records: [lake] })).toEqual([])
  expect(ungroundedItem(s('The meadow, 1924'), { records: [lake] })).toHaveLength(1)
  // a year elsewhere on the holder's page (another item, a count) is not the record's date ...
  expect(ungroundedItem(s('The meadow, 1923'), { records: [{ own: ['Fountain Lake'], sources: ['Related items: Madison 1923; 1923 results'] }] })).toHaveLength(1)
  // ... its date field is
  expect(ungroundedItem(s('The meadow, 1923'), { records: [{ own: ['Fountain Lake'], sources: ['Title Fountain Lake Date ca. 1923 Format Still image'] }] })).toEqual([])
  // the record's date grounds a date (a year, a day with its month), never a measurement
  expect(ungroundedItem(s('The meadow is 1923 m long'), { records: [lake] })).toHaveLength(1)
})

test('a modelling reference grounds nothing: a reference-only or unverified record gives no grounds', () => {
  for (const [id, m] of Object.entries(MEDIA)) if (!INDEX.media[id]?.embeddable) expect(recordGrounds(id), `${id} (${m.status})`).toEqual([])
})

test('the label a room reads from its glb is checked too', () => {
  const withGlbLabel = Object.values(INDUCTEES).flatMap((t) => t.chapters).map((c) => c.place.room).filter((r) => r && !r.labelText && glbLabel(r.model))
  expect(withGlbLabel.length).toBeGreaterThan(0)
})

test('every number shown on labels, place notes, panels, stops and record cards is grounded in what it cites', () => {
  const v = violations()
  expect(v.map((x) => `${x.path}: ${x.missing.join(', ')} :: ${x.text.slice(0, 160)}`)).toEqual([])
})

test('the gate reads every surface: landing copy, phone glb labels, record pages and photographs', () => {
  violations()
  for (const re of [/^landing\/[a-z]+\.portrait\.alt$/, /^landing\/[a-z]+\.[a-z-]+\.year$/, /^landing\/[a-z]+\.[a-z-]+\.claim$/, /^landing\/[a-z]+\.[a-z-]+\.media\.alt$/, /\.room\.glbLabelMobile$/, /\.room\.glbLabel$/, /\.pages\[\d+\]\.label$/, /\.photos\[\d+\]\.(label|alt)$/]) {
    expect(checked.some((p) => re.test(p)), String(re)).toBe(true)
  }
})

test('an unsupported number on the landing or a phone label is caught', () => {
  const ind = LANDING.find((i) => i.points?.length)
  const pt = ind.points[0]
  const facts = claims([pt.factId])
  expect(ungroundedItem([{ path: 'y', text: String(pt.year) }], { facts })).toEqual([])
  expect(ungroundedItem([{ path: 'y', text: String(pt.year + 1) }], { facts })).toHaveLength(1)
  const room = Object.values(INDUCTEES).flatMap((t) => t.chapters).map((c) => c.place.room).find((r) => r && !r.labelText && glbLabel(`${r.model}-mobile`))
  expect(ungroundedItem([{ path: 'm', text: `${glbLabel(`${room.model}-mobile`)} It stood 4.5 m tall.` }], { facts: [] }).length).toBeGreaterThan(0)
})
