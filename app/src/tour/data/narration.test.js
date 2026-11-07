// The tour plays as one story (owner decisions 2026-10-27): no stop is silent, and every record a stop
// shows is narrated by a record line (kind "record" in assets-src/audio/narration/<slug>.json, gated by
// check_narration.py) naming that record; a room carries at most two room notes (the room is the
// setting). The narration gate grounds record lines in tour-use.generated.json, so that file must match
// the tour data: run `npx vite-node scripts/export_chapters.mjs` after a change to a stop or a record.
import { test, expect } from 'vitest'
import { INDUCTEES } from './index.js'
import { artifactById } from './artifacts.js'
import TOUR_USE from './tour-use.generated.json'
import EINSTEIN from '../../../../assets-src/audio/narration/einstein.json'
import NAISMITH from '../../../../assets-src/audio/narration/naismith.json'
import MUIR from '../../../../assets-src/audio/narration/muir.json'
import ALBRIGHT from '../../../../assets-src/audio/narration/albright.json'
import LAMARR from '../../../../assets-src/audio/narration/lamarr.json'

const NARRATION = { einstein: EINSTEIN, naismith: NAISMITH, muir: MUIR, albright: ALBRIGHT, lamarr: LAMARR }
const recordOf = (s) => s.art || (s.artifact ? artifactById(s.artifact) : null)
// '<slug>:<chapter>:<cue>' -> the line; '<slug>:ch:<chapter>:opening' -> the opening
function lineOf(key) {
  const [slug, a, b] = key.split(':')
  const chs = NARRATION[slug]?.chapters || {}
  if (a === 'ch') return chs[b]?.opening ? { kind: 'opening', ...chs[b].opening } : null
  return (chs[a]?.lines || []).find((l) => l.cue === b) || null
}
// what a stop says: its own clip, then its record's (ChapterPlayer narratedRecord), and a series' records' own clips
// (the viewer plays each as the visitor steps to it)
const keysOf = (s) => [...(s.clip?.keys || []), ...(recordOf(s)?.clip?.keys || []), ...(recordOf(s)?.letters || []).flatMap((id) => artifactById(id)?.clip?.keys || [])]
const each = (fn) => {
  for (const [slug, tour] of Object.entries(INDUCTEES)) for (const c of tour.chapters) for (const s of c.stops) fn(slug, c, s)
}

test('every clip key of every stop is a narration line', () => {
  each((slug, c, s) => {
    for (const k of keysOf(s)) expect(lineOf(k), `${slug}/${c.id}/${s.id}: ${k}`).toBeTruthy()
  })
})

test('every key a chapter plays (opening, arrival, stops, closing) is a narration line', async () => {
  const { playOrder } = await import('./storyOrder.js')
  for (const [slug, tour] of Object.entries(INDUCTEES))
    for (const c of tour.chapters) for (const { key, where } of playOrder(slug, c)) expect(lineOf(key), `${slug}/${c.id} ${where}: ${key}`).toBeTruthy()
})

// owner feedback round 9 (Almonte): a chapter may have no stop (no record of the place is on file and no
// standing poster), never a pretend one. Such a chapter is still told: its opening and its arrival lines
// (room.narration or the chapter's narration) are voiced and between them carry every fact the chapter cites.
// round 9 part B: Almonte now shows three records, so no tour has a zero-stop chapter; the rule is still exercised on
// the Almonte chapter with its stops taken away (it must pass) and with its arrival line taken away too (it must fail)
async function zeroStopErrors(slug, c) {
  const { playOrder } = await import('./storyOrder.js')
  const errs = []
  const told = playOrder(slug, c).filter((p) => p.where === 'opening' || p.where === 'arrival')
  if (told.length <= 1) errs.push(`${slug}/${c.id}: nothing is said`)
  const facts = new Set(told.flatMap(({ key }) => lineOf(key)?.fact_ids || []))
  for (const f of c.factIds) if (!facts.has(f)) errs.push(`${slug}/${c.id}: ${f} is not told on arrival`)
  return errs
}
test('a chapter with no stop tells all its facts on arrival', async () => {
  for (const [slug, tour] of Object.entries(INDUCTEES))
    for (const c of tour.chapters) if (!c.stops.length) expect(await zeroStopErrors(slug, c)).toEqual([])
  const almonte = INDUCTEES.naismith.chapters.find((c) => c.id === 'birth')
  const bare = { ...almonte, stops: [] }
  expect(await zeroStopErrors('naismith', bare)).toEqual([])
  const silent = { ...bare, place: { ...bare.place, room: { ...bare.place.room, narration: null } } }
  expect((await zeroStopErrors('naismith', silent)).length).toBeGreaterThan(0)
})

test('no stop is silent', () => {
  each((slug, c, s) => expect(keysOf(s).length, `${slug}/${c.id}/${s.id}`).toBeGreaterThan(0))
})

test('every record a stop shows is narrated by a record line that names it', () => {
  each((slug, c, s) => {
    const art = recordOf(s)
    if (!art) return
    const named = keysOf(s).map(lineOf).filter((l) => l?.kind === 'record' && l.media_ids.includes(art.id))
    expect(named.length, `${slug}/${c.id}/${s.id} (${art.id}): no record line names it`).toBeGreaterThan(0)
  })
})

// owner feedback round 8 (item 2): a stop is about him or her and the records; a stop whose every line is a room
// note (the lectern, the marble panel, the front door) is architecture only, and fails
test('no stop is made of room notes only (owner feedback round 8)', () => {
  each((slug, c, s) => {
    const kinds = keysOf(s).map((k) => lineOf(k)?.kind)
    expect(kinds.length > 0 && kinds.every((k) => ['room-note', 'museum-note'].includes(k)), `${slug}/${c.id}/${s.id} (${s.name}): room notes only`).toBe(false)
  })
})

// owner feedback round 8 (item 4): a stop's lines are about what the stop shows. A fact line at a stop that shows a
// record cites a fact the record supports: a fact on the record's card (its lines or pinned notes; a series: its
// records' cards), a fact the record is the basis photograph for, or a fact drawn from the record's own source
// (the holder's page the card comes from). A labelled panel stop shows no record and tells its own facts.
import { readFileSync } from 'node:fs'
const jsonl = (p) => readFileSync(new URL(p, import.meta.url), 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))
const STORE = {}
const store = (slug) =>
  (STORE[slug] ||= {
    facts: Object.fromEntries(jsonl(`../../../../data/inductees/${slug}/facts.jsonl`).map((f) => [f.id, f])),
    media: Object.fromEntries(jsonl(`../../../../data/inductees/${slug}/media.jsonl`).map((m) => [m.id, m])),
  })
// A shared source grounds a fact only when it is narrow: one that backs at most SOURCE_MAX verified facts of the
// inductee (a record's own catalogue page). A broad source (a biography page backing 25 facts) grounds nothing
// (review I-3: ALB-M-0044 and LAM-M-0018 would otherwise "support" 26 and 25 facts).
const SOURCE_MAX = 3
function sourceSize(slug, sid) {
  const { facts } = store(slug)
  return Object.values(facts).filter((f) => f.status === 'verified' && (f.evidence || []).some((e) => e.source_id === sid)).length
}
function supportedBy(slug, art, factId) {
  const { facts, media } = store(slug)
  const recs = [art, ...(art.letters || []).map(artifactById).filter(Boolean)]
  const card = new Set(recs.flatMap((r) => [...(r.lines || []).map((l) => l.factId), ...(r.model?.notes || []).map((n) => n.factId)]).filter(Boolean))
  if (card.has(factId)) return true
  const m = recs.map((r) => media[r.id]).filter(Boolean)
  if (m.some((x) => (x.basis_for || []).includes(factId))) return true
  const sources = new Set(m.flatMap((x) => x.source_ids || []).filter((sid) => sourceSize(slug, sid) <= SOURCE_MAX))
  return (facts[factId]?.evidence || []).some((e) => sources.has(e.source_id))
}

// The words of a stop's label a fact must share to be about that place or object (stems: the first five letters of
// each word of four letters or more, function words and the inductee's names aside).
const FUNCTION = new Set('with from that this were have into over their there about after before where which while'.split(' '))
const LABEL_NAMES = new Set('albert einstein james naismith john muir madeleine albright korbel hedy lamarr'.split(' '))
const stems = (t) => new Set((t.toLowerCase().match(/[a-z]+/g) || []).filter((w) => w.length >= 4 && !FUNCTION.has(w) && !LABEL_NAMES.has(w)).map((w) => w.slice(0, 5)))
const aboutLabel = (name, claim) => [...stems(name)].some((w) => stems(claim).has(w))

// A record of a death (a death notice, a funeral, a burial): its card's title or alt text says so. A death fact: one
// the facts store files under "death".
// (English words only: "die" is German in the 1905 paper's title)
const DEATH_WORDS = /\b(died|dies|death|funeral|burial|buried|obituary|cemetery|grave)\b/i
const describesDeath = (art) => [art, ...(art.letters || []).map(artifactById).filter(Boolean)].some((r) => DEATH_WORDS.test(`${r.title || ''} ${r.alt || ''}`))
const isDeathFact = (slug, f) => store(slug).facts[f]?.category === 'death'

// owner feedback round 8 (item 4), review I-3: every stop's lines are about what that stop shows, every cited fact
//   - a stop that shows a record: each fact a fact line cites is supported by the record (its card, a fact it is the
//     basis photograph for, or a narrow shared source; a series: its records);
//   - a labelled panel (a gallery's wall panel, a room's panel): each fact is one the panel prints;
//   - a place or object stop (no record, no panel): each fact names what the stop's label names.
test('every fact a stop says is about what the stop shows (owner feedback round 8, review I-3)', () => {
  each((slug, c, s) => {
    const art = recordOf(s)
    const printed = s.panel === true ? c.place.panel?.factIds || [] : s.panel && typeof s.panel === 'object' ? s.panel.factIds : null
    const { facts } = store(slug)
    for (const k of keysOf(s)) {
      const l = lineOf(k)
      if (!l || l.kind) continue // record lines (their card) and room notes are checked by check_narration.py
      for (const f of l.fact_ids || []) {
        const where = `${slug}/${c.id}/${s.id} ${k} ${f}: "${l.text}"`
        if (printed) expect(printed, `${where} is not printed on the panel`).toContain(f)
        // the inductee's death may be said at a record of the death (fix round 2: before that record's line)
        else if (art) expect(supportedBy(slug, art, f) || (isDeathFact(slug, f) && describesDeath(art)), `${where} is not supported by ${art.id}`).toBe(true)
        else expect(aboutLabel(s.name, facts[f]?.claim || ''), `${where} is not about "${s.name}"`).toBe(true)
      }
    }
  })
})

test('the stop rule both ways: record support, a broad shared source, a place label', () => {
  // the Battery photograph (another occasion) does not support who came with him; its own landing fact it does
  const battery = artifactById('EIN-M-0074')
  expect(supportedBy('einstein', battery, 'EIN-F-0125')).toBe(false)
  expect(supportedBy('einstein', battery, 'EIN-F-0124')).toBe(true)
  // a series: its letters' cards
  expect(supportedBy('einstein', artifactById('EIN-SERIES-BRUNAUER'), 'EIN-F-0062')).toBe(true)
  expect(supportedBy('einstein', artifactById('EIN-SERIES-BRUNAUER'), 'EIN-F-0077')).toBe(false)
  // a broad shared source grounds nothing: few facts beyond a record's own card ride on ALB-M-0044 or LAM-M-0018
  for (const [slug, id] of [['albright', 'ALB-M-0044'], ['lamarr', 'LAM-M-0018']]) {
    const { facts } = store(slug)
    const art = artifactById(id) || { id, lines: [] }
    const card = new Set((art.lines || []).map((l) => l.factId))
    const grounded = Object.keys(facts).filter((f) => !card.has(f) && supportedBy(slug, art, f))
    expect(grounded.length, `${id}: ${grounded}`).toBeLessThanOrEqual(SOURCE_MAX)
  }
  // a place or object stop: the house's own facts, never the 1947 article
  const { facts } = store('einstein')
  expect(aboutLabel('His home, 112 Mercer Street', facts['EIN-F-0107'].claim)).toBe(true)
  expect(aboutLabel('The house', facts['EIN-F-0076'].claim)).toBe(false)
  expect(aboutLabel('The house', facts['EIN-F-0077'].claim)).toBe(false)
})

test('a room carries at most two room notes (the room is the setting)', () => {
  for (const [slug, tour] of Object.entries(INDUCTEES))
    for (const c of tour.chapters) {
      const room = c.place.room
      const keys = [...c.stops.flatMap(keysOf), ...(room?.narration?.keys || []), ...(room?.closing?.keys || []), ...(c.opening?.keys || []), ...(c.narration?.keys || []), ...(c.closing?.keys || [])]
      // a museum note ("a corner recreates his study") is about the room too
      const notes = new Set(keys.filter((k) => ['room-note', 'museum-note'].includes(lineOf(k)?.kind)))
      expect(notes.size, `${slug}/${c.id}: ${[...notes]}`).toBeLessThanOrEqual(2)
    }
})

test('tour-use.generated.json carries every shown record as the tour data has it (the record lines ground on it)', () => {
  // a record shown at two stops (Lamarr's case file) is exported as the first stop shows it
  const FIELDS = ['kind', 'unit', 'title', 'date', 'maker', 'holder', 'credit', 'alt', 'catalogueId', 'recreation']
  const seen = new Set()
  each((slug, c, s) => {
    const art = recordOf(s)
    if (!art || seen.has(art.id)) return
    seen.add(art.id)
    const card = TOUR_USE.records[art.id]
    expect(card, `${slug}/${c.id}/${s.id}: ${art.id} missing; run export_chapters.mjs`).toBeTruthy()
    for (const f of FIELDS) expect(card[f], `${art.id}.${f}`).toEqual(art[f])
  })
})

// every key a tour can play: openings, arrival and closing lines, map legs, stop clips, record clips
// (every record, the letters of a series)
import { ARTIFACTS } from './artifacts.js'
function usedKeys() {
  const used = new Set()
  const add = (c) => (c?.keys || []).forEach((k) => used.add(k))
  for (const [slug, tour] of Object.entries(INDUCTEES))
    for (const c of tour.chapters) {
      add(c.opening || { keys: [`${slug}:ch:${c.kind}:opening`] })
      for (const x of [c.narration, c.closing, c.map?.narration, c.place.room?.narration, c.place.room?.closing]) add(x)
      for (const s of c.stops) {
        add(s.clip)
        const r = recordOf(s)
        add(r?.clip)
        for (const l of r?.letters || []) add(artifactById(l)?.clip)
      }
    }
  for (const a of Object.values(ARTIFACTS)) add(a.clip)
  return used
}

test('a room says at most one arrival line after its opening (controller ruling 2026-10-27)', () => {
  for (const [slug, tour] of Object.entries(INDUCTEES))
    for (const c of tour.chapters) {
      const arrival = [...(c.narration?.keys || []), ...(c.place.room?.narration?.keys || [])]
      expect(arrival.length, `${slug}/${c.id}: ${arrival}`).toBeLessThanOrEqual(1)
      // and the opening itself is one line (re-review 2: Albright's secretary chapter played two)
      expect((c.opening?.keys || ['opening']).length, `${slug}/${c.id} opening`).toBe(1)
    }
})

test('every narration line is spoken somewhere (no dead lines or audio)', () => {
  const used = usedKeys()
  for (const [slug, n] of Object.entries(NARRATION))
    for (const [ch, entry] of Object.entries(n.chapters)) {
      if (entry.opening) expect(used.has(`${slug}:ch:${ch}:opening`), `${slug}:ch:${ch}:opening`).toBe(true)
      for (const l of entry.lines || []) expect(used.has(`${slug}:${ch}:${l.cue}`), `${slug}:${ch}:${l.cue}`).toBe(true)
    }
})

// owner rule (round 7 fix round 2): inside a chapter the story runs forward in time, in play order
import { storyOrderErrors } from './storyOrder.js'
test('inside every chapter, dated lines run forward in time in the order a visitor hears them', () => {
  for (const tour of Object.values(INDUCTEES)) expect(storyOrderErrors(tour, NARRATION)).toEqual([])
})

// owner feedback round 8 (item 1): an opening is a human sentence ("Albert Einstein was born in Ulm, Germany, on
// 14 March 1879."), never a dateline ("Ulm, Germany, 14 March 1879. Albert Einstein was born here."): its first
// sentence names the inductee or speaks of them
const NAMES = { einstein: /\b(Albert|Einstein|he|his|him)\b/i, naismith: /\b(James|Naismith|he|his|him)\b/i, muir: /\b(John|Muir|he|his|him)\b/i, albright: /\b(Madeleine|Albright|she|her)\b/i, lamarr: /\b(Hedy|Lamarr|Kiesler|Heddy|Lamar|she|her)\b/i } // Heddy Lamar: a 1942 source's own spelling, said with [sic]
const firstSentence = (t) => t.replace(/\s*\[sic\]/g, '').split(/(?<!\b(?:[A-Z]|Dr|Mr|Mrs|St|Prof|Lt|Rev|No|Jr|Lieut))\.\s+(?=[A-Z0-9])/)[0]
test('every opening is a human sentence, not a dateline (owner feedback round 8)', () => {
  for (const [slug, n] of Object.entries(NARRATION))
    for (const [key, ch] of Object.entries(n.chapters)) {
      if (!ch.opening) continue
      expect(firstSentence(ch.opening.text), `${slug}:ch:${key}:opening: "${ch.opening.text}"`).toMatch(NAMES[slug])
    }
  // the dateline form fails
  expect(firstSentence('Ulm, Germany, 14 March 1879. Albert Einstein was born here.')).not.toMatch(NAMES.einstein)
  expect(firstSentence('Princeton, N.J., September 1943. He was here.')).not.toMatch(NAMES.einstein)
})

// a room's labelled panel stop tells the facts it prints, and no others
test('a labelled panel stop in a room says only the facts its panel prints', () => {
  each((slug, c, s) => {
    if (!s.panel || typeof s.panel !== 'object') return
    for (const k of keysOf(s)) {
      const l = lineOf(k)
      expect(l?.kind, `${slug}/${c.id}/${s.id} ${k}`).toBeUndefined()
      for (const f of l.fact_ids) expect(s.panel.factIds, `${slug}/${c.id}/${s.id} ${k}`).toContain(f)
    }
  })
})

// fix round 2 (death order): a record of a death (a death notice, a funeral) is never narrated before the
// inductee's death line, in the order a visitor hears the chapter (storyOrder.js playOrder). The death line is said
// at that record's stop, first; what came after it (the funeral's place, the landmark) is the closing.
import { playOrder as playOrderOf } from './storyOrder.js'
function deathOrderErrors(tour, slug) {
  const errs = []
  for (const c of tour.chapters) {
    let told = false
    for (const { key, where } of playOrderOf(slug, c)) {
      const l = lineOf(key)
      if (!l) continue
      if ((l.fact_ids || []).some((f) => isDeathFact(slug, f))) told = true
      if (l.kind === 'record' && !told) {
        const recs = (l.media_ids || []).map(artifactById).filter(Boolean)
        if (recs.some(describesDeath)) errs.push(`${slug}/${c.id} ${where}: ${key} narrates a record of the death before the death line`)
      }
    }
  }
  return errs
}
test('a record of a death or funeral never plays before the inductee\'s death line (fix round 2)', () => {
  for (const [slug, tour] of Object.entries(INDUCTEES)) expect(deathOrderErrors(tour, slug)).toEqual([])
  // the rule fails a funeral photograph told before the death: the legacy chapter with its funeral stop's death
  // line taken out
  const legacy = INDUCTEES.albright.chapters.find((c) => c.id === 'legacy')
  const broken = { chapters: [{ ...legacy, stops: legacy.stops.map((s) => (s.id === 'funeral' ? { ...s, clip: { keys: ['albright:15:r20'], factIds: [] } } : s)) }] }
  expect(deathOrderErrors(broken, 'albright').length).toBeGreaterThan(0)
})
