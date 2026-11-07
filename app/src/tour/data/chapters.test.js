import { test, expect } from 'vitest'
import { CHAPTER_KINDS, chapter, validateTour, resolveChapter, inTimeOrder } from './chapters.js'

const index = {
  facts: { 'X-F-1': { claim: 'born in 1900' }, 'X-F-2': { claim: 'arrived in 1920' }, 'X-F-3': { claim: 'honoured in 1910' }, 'X-F-4': { claim: 'left in 1920' } },
  media: { 'X-M-1': { embeddable: true, basisFor: ['X-F-2'] }, 'X-M-9': { embeddable: false, basisFor: [] } },
}
const mk = (kind, extra = {}) => chapter({ id: kind, kind, title: kind, year: 1900, yearFact: 'X-F-1', opening: 'o', stops: [], factIds: ['X-F-1'], place: { tier: 'gallery' }, ...extra })

test('the kinds are the spec labels, listed in their tie-break order', () => {
  expect(CHAPTER_KINDS).toEqual(['birth', 'education', 'leaving', 'arriving', 'first-work', 'citizen', 'big-work', 'history', 'honoured', 'legacy'])
})

test('chapter passes through extra fields like year', () => {
  const c = chapter({ id: 'birth', kind: 'birth', title: 'Birth', opening: 'o', stops: [], factIds: ['X-F-1'], place: { tier: 'gallery' }, year: 1940 })
  expect(c.year).toBe(1940)
})

test('rejects an unverified fact id', () => {
  const tour = { slug: 'x', chapters: [mk('birth', { factIds: ['X-F-404'] })] }
  expect(validateTour(tour, index)).toContain('birth: fact X-F-404 is not verified')
})

// Owner decision 2026-10-27: a tour plays its chapters in time order, by each chapter's verified year;
// chapters of the same year keep the kind order (CHAPTER_KINDS), the documented tie-break.
const dated = (kind, year, fact, extra = {}) => mk(kind, { year, yearFact: fact, factIds: [fact], ...extra })
const orderErrs = (tour) => validateTour(tour, index).filter((e) => /order|year/.test(e))

test('chapters run in time order; a later chapter of an earlier kind is fine', () => {
  const tour = { slug: 'x', chapters: [dated('birth', 1900, 'X-F-1'), dated('honoured', 1910, 'X-F-3'), dated('arriving', 1920, 'X-F-2')] }
  expect(orderErrs(tour)).toEqual([])
})

test('rejects chapters out of time order', () => {
  const tour = { slug: 'x', chapters: [dated('birth', 1900, 'X-F-1'), dated('arriving', 1920, 'X-F-2'), dated('honoured', 1910, 'X-F-3')] }
  expect(validateTour(tour, index)).toContain('chapters out of time order at arriving (1920) -> honoured (1910)')
})

test('a tie in year keeps the kind order, and rejects the reverse', () => {
  const ok = { slug: 'x', chapters: [dated('leaving', 1920, 'X-F-4'), dated('arriving', 1920, 'X-F-2')] }
  expect(orderErrs(ok)).toEqual([])
  const bad = { slug: 'x', chapters: [dated('arriving', 1920, 'X-F-2'), dated('leaving', 1920, 'X-F-4')] }
  expect(validateTour(bad, index)).toContain('chapters out of time order at arriving (1920) -> leaving (1920)')
})

test('the year that orders a chapter is stated by a cited verified fact', () => {
  const noYear = { slug: 'x', chapters: [mk('birth', { year: undefined })] }
  expect(validateTour(noYear, index)).toContain('birth: no year (the chapter\'s time-order key)')
  const noFact = { slug: 'x', chapters: [mk('birth', { yearFact: undefined })] }
  expect(validateTour(noFact, index)).toContain('birth: no yearFact: the verified fact that states the year 1900')
  const uncited = { slug: 'x', chapters: [mk('birth', { yearFact: 'X-F-2' })] }
  expect(validateTour(uncited, index)).toContain('birth: yearFact X-F-2 is not one of the chapter\'s facts')
  const unverified = { slug: 'x', chapters: [mk('birth', { yearFact: 'X-F-404', factIds: ['X-F-1', 'X-F-404'] })] }
  expect(validateTour(unverified, index)).toContain('birth: yearFact X-F-404 is not verified')
  const wrong = { slug: 'x', chapters: [mk('birth', { year: 1901 })] }
  expect(validateTour(wrong, index)).toContain('birth: yearFact X-F-1 does not state the year 1901')
})

test('inTimeOrder sorts by year, then kind order, and keeps the authored order of an exact tie', () => {
  const a = dated('arriving', 1920, 'X-F-2', { id: 'a' })
  const b = dated('big-work', 1920, 'X-F-2', { id: 'b' })
  const b2 = dated('big-work', 1920, 'X-F-2', { id: 'b2' })
  const h = dated('honoured', 1910, 'X-F-3', { id: 'h' })
  const l = dated('leaving', 1920, 'X-F-4', { id: 'l' })
  const input = [b, h, a, b2, l]
  expect(inTimeOrder(input).map((c) => c.id)).toEqual(['h', 'l', 'a', 'b', 'b2'])
  expect(input.map((c) => c.id)).toEqual(['b', 'h', 'a', 'b2', 'l'])
})

test('gallery is rejected when an embeddable basis photo exists (photo room first)', () => {
  const tour = { slug: 'x', chapters: [mk('arriving', { factIds: ['X-F-2'] })] }
  expect(validateTour(tour, index)).toContain('arriving: use a photo room (embeddable basis photo X-M-1 exists)')
})

test('photo tier must use an embeddable photo', () => {
  const tour = { slug: 'x', chapters: [mk('birth', { place: { tier: 'photo', photo: { mediaId: 'X-M-9' } } })] }
  expect(validateTour(tour, index)).toContain('birth: photo X-M-9 is not cleared')
})

test('resolveChapter falls back to the first chapter for a kind the inductee lacks', () => {
  const tour = { slug: 'x', chapters: [mk('birth'), mk('arriving', { factIds: ['X-F-2'], place: { tier: 'photo', photo: { mediaId: 'X-M-1' } } })] }
  expect(resolveChapter(tour, 'education')).toBe(0)
  expect(resolveChapter(tour, 'arriving')).toBe(1)
  expect(resolveChapter(tour, 'X-F-2')).toBe(1)
})

test('a map leg needs a verified fact stating each city-to-city journey, with direction, and a mode only where said', async () => {
  const { legErrors } = await import('./chapters.js')
  const idx = { facts: {
    'X-F-10': { claim: 'In 1849 the Muirs landed in New York City and went by boat to Albany.' },
    'X-F-11': { claim: 'From Buffalo they traveled across the Great Lakes to Milwaukee.' },
    'X-F-12': { claim: 'She was born in Vienna.' },
    'X-F-13': { claim: 'When the Nazis invaded Czechoslovakia, her father escaped to Yugoslavia with his family.' },
    'X-F-14': { claim: 'They went to Albany from New York City.' },
    'X-F-15': { claim: 'They went by boat to Albany; later they lived in New York City.' },
  } }
  // round 9: every place on a leg is a verified place (a cited verified fact names it)
  const NY = { label: 'New York City', factIds: ['X-F-10'] }, ALB = { label: 'Albany', factIds: ['X-F-10'] }, BUF = { label: 'Buffalo', factIds: ['X-F-11'] }, MIL = { label: 'Milwaukee', factIds: ['X-F-11'] }
  const PRAGUE = { label: 'Prague' }, BELGRADE = { label: 'Belgrade' }
  const leg = (segments, places) => ({ id: 'arriving', map: { places, segments } })
  const seg = (facts, from, to, extra = {}) => ({ mode: null, journey: { facts, from, to }, ...extra })
  // supported, both ways of stating direction
  expect(legErrors(leg([seg(['X-F-10'], 'New York City', 'Albany')], [NY, ALB]), idx)).toEqual([])
  expect(legErrors(leg([seg(['X-F-11'], 'Buffalo', 'Milwaukee')], [BUF, MIL]), idx)).toEqual([])
  expect(legErrors(leg([seg(['X-F-14'], 'New York City', 'Albany')], [NY, ALB]), idx)).toEqual([])
  // no journey fact (the Ulm -> New York, Vienna -> New York pattern)
  expect(legErrors(leg([{ mode: null }], [NY, ALB]), idx)[0]).toMatch(/no verified fact for this journey/)
  // a country-level fact cannot ground a city-to-city segment: Czechoslovakia -> Yugoslavia is not Prague -> Belgrade
  const country = legErrors(leg([seg(['X-F-13'], 'Czechoslovakia', 'Yugoslavia')], [{ ...PRAGUE, aka: ['Czechoslovakia'] }, { ...BELGRADE, aka: ['Yugoslavia'] }]), idx).join()
  expect(country).toMatch(/"Czechoslovakia" is not the place "Prague"/)
  expect(country).toMatch(/"Yugoslavia" is not the place "Belgrade"/)
  expect(legErrors(leg([seg(['X-F-13'], 'Prague', 'Belgrade')], [PRAGUE, BELGRADE]), idx).join()).toMatch(/no cited claim states a journey from "Prague" to "Belgrade"/)
  // the wrong direction is not the journey
  expect(legErrors(leg([seg(['X-F-10'], 'Albany', 'New York City')], [ALB, NY]), idx).join()).toMatch(/no cited claim states a journey/)
  expect(legErrors(leg([seg(['X-F-15'], 'New York City', 'Albany')], [NY, ALB]), idx).join()).toMatch(/no cited claim states a journey/)
  // a fact about one end only does not establish the journey; an unverified fact does not count
  expect(legErrors(leg([seg(['X-F-12'], 'New York City', 'Albany')], [NY, ALB]), idx).join()).toMatch(/no cited claim states/)
  expect(legErrors(leg([seg(['X-F-404'], 'New York City', 'Albany')], [NY, ALB]), idx).join()).toMatch(/X-F-404 is not verified/)
  // a drawn mode needs a journey claim that says it between the two places
  const ship = (modeFacts, facts = ['X-F-10']) => seg(facts, 'New York City', 'Albany', { mode: 'ship', modeFacts })
  expect(legErrors(leg([ship([])], [NY, ALB]), idx).join()).toMatch(/mode ship is drawn/)
  expect(legErrors(leg([ship(['X-F-10'])], [NY, ALB]), idx)).toEqual([])
  expect(legErrors(leg([ship(['X-F-14'], ['X-F-14'])], [NY, ALB]), idx).join()).toMatch(/mode ship is drawn/)
  // a mode said elsewhere in the sentence, or in a fact that is not the journey's, does not count
  expect(legErrors(leg([ship(['X-F-11'])], [NY, ALB]), idx).join()).toMatch(/mode ship is drawn/)
})

// owner decision 2026-10-29 (round 9): every arrival draws its line; where no verified fact states the route the
// line is un-routed (no mode, the on-map note); routed lines still need their journey fact; both ends are verified
// places, never a country standing for a city; the place photographs shown on the map are verified, cleared records
test('un-routed lines join two verified places and say so; routed lines keep their rules; resources are cleared', async () => {
  const { legErrors, UNROUTED_NOTE } = await import('./chapters.js')
  const idx = {
    facts: {
      'X-F-1': { claim: 'Hedy Lamarr was born in Vienna, Austria in 1914.' },
      'X-F-2': { claim: 'Now Miss Kiesler is here in person (above as New York saw her).' },
      'X-F-3': { claim: 'In October 1933, Prof. Albert Einstein sailed for New York from Southampton, England.' },
      'X-F-4': { claim: 'John Muir left Scotland for the United States.' },
    },
    media: { 'X-M-1': { embeddable: true }, 'X-M-2': { embeddable: false } },
  }
  const VIENNA = { label: 'Vienna, Austria', factIds: ['X-F-1'] }, NY = { label: 'New York', factIds: ['X-F-2'] }
  const leg = (segments, places, resources) => ({ id: 'arriving', map: { places, segments, resources } })
  const unrouted = (extra = {}) => ({ routed: false, mode: null, ...extra })
  expect(UNROUTED_NOTE).toBe('Route not recorded; the line joins the two places')
  expect(legErrors(leg([unrouted()], [VIENNA, NY]), idx)).toEqual([])
  // an un-routed line shows no mode, carries the note, and claims no journey
  expect(legErrors(leg([unrouted({ mode: 'ship' })], [VIENNA, NY]), idx).join()).toMatch(/no mode of travel/)
  expect(legErrors(leg([unrouted({ label: 'By ship' })], [VIENNA, NY]), idx).join()).toMatch(/no label of its own/)
  expect(legErrors(leg([unrouted({ journey: { facts: ['X-F-1'], from: 'Vienna', to: 'New York' } })], [VIENNA, NY]), idx).join()).toMatch(/route one instead/)
  // its ends are verified places: a fact that names the place, every cited fact verified, never a country
  expect(legErrors(leg([unrouted()], [{ label: 'Vienna', factIds: ['X-F-2'] }, NY]), idx).join()).toMatch(/no cited verified fact names the place "Vienna"/)
  expect(legErrors(leg([unrouted()], [{ label: 'Vienna', factIds: [] }, NY]), idx).join()).toMatch(/cites no verified fact/)
  expect(legErrors(leg([unrouted()], [{ label: 'Vienna', factIds: ['X-F-1', 'X-F-404'] }, NY]), idx).join()).toMatch(/X-F-404 is not verified/)
  expect(legErrors(leg([unrouted()], [{ label: 'Scotland', factIds: ['X-F-4'] }, NY]), idx).join()).toMatch(/"Scotland" is a country or region/)
  // a line with neither a journey nor routed: false is still refused
  expect(legErrors(leg([{ mode: null }], [VIENNA, NY]), idx).join()).toMatch(/no verified fact for this journey/)
  // a routed line with its verb before "for": sailed for New York from Southampton is a ship journey
  const SOU = { label: 'Southampton', factIds: ['X-F-3'] }, NYC = { label: 'New York', factIds: ['X-F-3'] }
  const routed = { mode: 'ship', journey: { facts: ['X-F-3'], from: 'Southampton', to: 'New York' }, modeFacts: ['X-F-3'] }
  expect(legErrors(leg([routed], [SOU, NYC]), idx)).toEqual([])
  expect(legErrors(leg([{ ...routed, mode: 'air' }], [SOU, NYC]), idx).join()).toMatch(/mode air is drawn/)
  // the place photographs: at a verified place, each a verified, cleared record
  expect(legErrors(leg([unrouted()], [VIENNA, NY], [{ ...NY, media: ['X-M-1'] }]), idx)).toEqual([])
  expect(legErrors(leg([unrouted()], [VIENNA, NY], [{ ...NY, media: ['X-M-2'] }]), idx).join()).toMatch(/X-M-2 is not verified and cleared/)
  expect(legErrors(leg([unrouted()], [VIENNA, NY], [{ label: 'Vienna', factIds: ['X-F-2'], media: ['X-M-1'] }]), idx).join()).toMatch(/names the place "Vienna"/)
})

// feedback round 7: a gallery case is never an empty glass box
test('a gallery chapter needs a record or a verified panel line (never an empty case)', () => {
  const empty = { slug: 'x', chapters: [mk('birth', { stops: [{ id: 'panel', name: 'Panel', panel: true }], place: { tier: 'gallery' } })] }
  expect(validateTour(empty, index)).toContain('birth: gallery case with no record and no verified panel line (an empty case)')
  const unverified = { slug: 'x', chapters: [mk('birth', { stops: [{ id: 'panel', name: 'Panel', panel: true }], place: { tier: 'gallery', panel: { title: 'T', factIds: ['X-F-404'] } } })] }
  expect(validateTour(unverified, index)).toContain('birth: gallery case with no record and no verified panel line (an empty case)')
  const lines = { slug: 'x', chapters: [mk('birth', { stops: [{ id: 'panel', name: 'Panel', panel: true }], place: { tier: 'gallery', panel: { title: 'T', factIds: ['X-F-1'] } } })] }
  expect(validateTour(lines, index)).toEqual([])
  const record = { slug: 'x', chapters: [mk('birth', { stops: [{ id: 'doc', name: 'Doc', art: { id: 'X-M-1', kind: 'sheet', pages: [{ src: '/x.webp' }] } }] })] }
  expect(validateTour(record, index)).toEqual([])
  const noPanel = { slug: 'x', chapters: [mk('birth', { stops: [{ id: 'panel', name: 'Panel', panel: true }, { id: 'doc', name: 'Doc', art: { id: 'X-M-1', kind: 'sheet', pages: [{ src: '/x.webp' }] } }] })] }
  expect(validateTour(noPanel, index)).toContain('birth: a panel stop but no place.panel to print')
})

// round 9 final review (fix round 2): a map pin's date must be stated by a cited verified fact that also names the place
// (the New York Harbor pin was dated 1948 by joining a fact that names the harbor with another that dates the move)
import { placeErrors as pinErrors } from './chapters.js'
test("a map pin's date is stated by a cited fact that names the place", () => {
  const index = { facts: {
    'X-F-1': { claim: 'She sailed past New York Harbor.' },
    'X-F-2': { claim: 'She immigrated to the United States in 1948.' },
    'X-F-3': { claim: 'In 1948 she arrived in New York Harbor.' },
  } }
  const pin = (date, factIds) => ({ label: 'New York Harbor', date, factIds })
  expect(pinErrors('t', pin('1948', ['X-F-1', 'X-F-2']), index).join()).toMatch(/date "1948"/)
  expect(pinErrors('t', pin('1948', ['X-F-3']), index)).toEqual([])
  expect(pinErrors('t', pin(undefined, ['X-F-1']), index)).toEqual([])
})
