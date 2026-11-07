import { test, expect } from 'vitest'
import { EINSTEIN, ULM_VIEW, BATTERY_VIEW, GOTHENBURG_LABEL } from './einstein.js'
import { CHAPTER_KINDS, validateTour, resolveChapter } from './chapters.js'
import { ARTIFACTS, LINK_ONLY, artifactById } from './artifacts.js'
import { resolveStop } from './index.js'
import { solvePhotoCamera, photoLayout } from '../place/photoProjection.js'
import INDEX from './facts.generated.json'
import NARRATION from '../../../../assets-src/audio/narration/einstein.json'

test('Einstein passes validateTour against the verified index', () => {
  expect(validateTour(EINSTEIN, INDEX)).toEqual([])
})

test('every chapter has a year, a known kind and an opening line voiced for that kind', () => {
  for (const c of EINSTEIN.chapters) {
    expect(Number.isInteger(c.year), c.id).toBe(true)
    expect(CHAPTER_KINDS).toContain(c.kind)
    expect(NARRATION.chapters[c.kind]?.opening, c.id).toBeTruthy()
  }
})

test('the chapters run in time order (owner decision 2026-10-27): honoured 1922 before leaving 1933, the letter 1939 before citizenship 1940', () => {
  expect(EINSTEIN.chapters.map((c) => `${c.id} ${c.year}`)).toEqual(['birth 1879', 'honoured 1922', 'leaving 1933', 'arriving 1933', 'history 1939', 'citizen 1940', 'big-work 1943', 'legacy 1955'])
})

test('chapter ids are unique and resolve by id, kind and fact id', () => {
  const ids = EINSTEIN.chapters.map((c) => c.id)
  expect(new Set(ids).size).toBe(ids.length)
  EINSTEIN.chapters.forEach((c, i) => {
    expect(resolveChapter(EINSTEIN, c.id)).toBe(i)
    expect(resolveChapter(EINSTEIN, c.kind)).toBe(i)
  })
  expect(resolveChapter(EINSTEIN, 'EIN-F-0051')).toBe(ids.indexOf('citizen'))
})

test('every record a stop opens exists and may be displayed (never link-only)', () => {
  for (const c of EINSTEIN.chapters)
    for (const s of c.stops) {
      const art = s.art || (s.artifact ? artifactById(s.artifact) : null)
      if (s.artifact) expect(art, `${c.id}/${s.id}`).toBeTruthy()
      if (!art) continue
      expect(LINK_ONLY.has(art.id), `${c.id}/${s.id}`).toBe(false)
      expect(art.linkOnly, `${c.id}/${s.id}`).toBeFalsy()
      if (/^EIN-M-\d{4}$/.test(art.id)) expect(INDEX.media[art.id]?.embeddable, art.id).toBe(true)
      for (const l of art.lines || []) expect(INDEX.facts[l.factId]?.claim, l.factId).toContain(l.text.replace(/\.$/, ''))
    }
})

test('the pipe is a labelled recreation with no fact lines', () => {
  const pipe = ARTIFACTS['EIN-PIPE-RECREATION']
  expect(pipe.kind).toBe('model')
  expect(pipe.recreation).toBe('Recreation from reference photographs; not the original object')
  expect(pipe.lines).toEqual([])
  const stop = EINSTEIN.chapters.find((c) => c.kind === 'big-work').stops.find((s) => s.id === 'pipe')
  expect(stop.prop.src).toBe(pipe.model.src)
})

test('the stored photo-room cameras are their hand solves', () => {
  for (const v of [ULM_VIEW, BATTERY_VIEW]) {
    const s = solvePhotoCamera(v)
    expect(v.camera.pitchDeg).toBeCloseTo(s.pitchDeg, 2)
    expect(v.camera.height).toBeCloseTo(s.height, 1)
    const l = photoLayout(v)
    expect(l.boxes.length + l.cards.length).toBe(v.layers.length)
    expect(l.far).toBeGreaterThan(0)
  }
})

test('landing story points and old room links open a chapter', () => {
  expect(resolveStop('einstein', 'EIN-F-0051')).toEqual({ chapter: 'citizen', label: 'The courthouse, Trenton' })
  expect(resolveStop('einstein', 'study').chapter).toBe('big-work')
  expect(resolveStop('einstein', null)).toEqual({ chapter: null, label: null })
  for (const [key, hit] of Object.entries(EINSTEIN.storyStops)) {
    expect(EINSTEIN.chapters.some((c) => c.id === hit.chapter), key).toBe(true)
  }
})

test('the Gothenburg room (Task 14c, round 7): the verified address and King Gustaf; the hall named only by the holder records, no date in the label', () => {
  const c = EINSTEIN.chapters.find((x) => x.id === 'honoured')
  expect(c.place.tier).toBe('room')
  for (const f of ['EIN-F-0150', 'EIN-F-0151']) expect(c.factIds).toContain(f)
  // the single-source Nobel-lecture fact is never listed or told
  expect(c.factIds).not.toContain('EIN-F-0149')
  expect(c.place.room.labelText).toBe(GOTHENBURG_LABEL)
  // the hall is named by the holder's verified records of the photographs on the stands, not by a fact
  expect(GOTHENBURG_LABEL).toMatch(/^A lecture hall in Gothenburg, rebuilt from a photograph of his lecture\. Göteborgs stadsmuseum's records of the photographs shown here name the hall as the Kongresshallen; no verified fact names it\./)
  expect(c.place.room.records).toEqual(['EIN-M-0079', 'EIN-M-0081'])
  for (const id of c.place.room.records) expect(INDEX.media[id].title).toMatch(/Kongresshallen/)
  // the 1923 date of the reference photograph is not shown: a modelling reference grounds no displayed number
  expect(GOTHENBURG_LABEL).not.toMatch(/1923/)
  // no unverified date, and never that he spoke in this hall
  expect(GOTHENBURG_LABEL).not.toMatch(/July|11 July|places his lecture|in this hall/)
  expect(c.place.label).toBe('A lecture hall in Gothenburg')
  expect(c.place.room.title).not.toMatch(/Kongresshallen|1923/)
  // the opening names the place in its source's words and him before any pronoun, with no date the facts lack
  const opening = NARRATION.chapters.honoured.opening
  expect(opening.fact_ids).toEqual(['EIN-F-0148', 'EIN-F-0150'])
  // round 8: a human sentence that names him first, the place in its source's spelling inside it
  expect(opening.text).toMatch(/^Albert Einstein\b/)
  expect(opening.text).toMatch(/\bIn Gottenberg \[sic\], Sweden, he delivered an address\b/)
  expect(opening.speak).not.toMatch(/\[sic\]/)
  expect(opening.text).not.toMatch(/1923|July/)
  // the disputed photograph record is never a stop
  for (const ch of EINSTEIN.chapters) for (const s of ch.stops) expect(s.artifact).not.toBe('EIN-M-0070')
})

test('no map leg starts at Ulm, a place he left as an infant (phase-2 ruling, final review I7)', () => {
  for (const c of EINSTEIN.chapters) if (c.map) expect(c.map.places[0].id, c.id).not.toBe('ulm')
  // round 9 (owner decision 2026-10-29): his 1933 crossing, Southampton to New York, by ship: EIN-F-0157 states the
  // journey and its verb ("sailed for New York from Southampton")
  const m = EINSTEIN.chapters.find((c) => c.id === 'arriving').map
  expect(m.places.map((p) => p.id)).toEqual(['southampton', 'newyork'])
  expect(m.segments.map((s) => [s.mode, s.journey.facts, s.modeFacts])).toEqual([['ship', ['EIN-F-0157'], ['EIN-F-0157']]])
})

test('round 8: the house stop tells only the house; the 1947 article has its own labelled panel; the 1954 photographs are two series', () => {
  const c = EINSTEIN.chapters.find((x) => x.id === 'legacy')
  const house = c.stops.find((s) => s.id === 'house')
  expect(house.clip.factIds).toEqual(['EIN-F-0087'])
  // fix round 1 (review I-4): nothing from the 1976 nomination is said as true today; the house in the past and dated
  const said = JSON.stringify(NARRATION)
  expect(said).not.toMatch(/Margot|underwent no interior/)
  // round 9: the death (EIN-F-0006) is said at the 1955 Evening star, first; the closing keeps the home and the landmark
  expect(c.place.room.closing.factIds).toEqual(['EIN-F-0107', 'EIN-F-0132'])
  expect(c.stops.find((s) => s.id === 'star1955').clip).toEqual({ keys: ['einstein:7:c3', 'einstein:21:r8'], factIds: ['EIN-F-0006'] })
  const article = c.stops.find((s) => s.id === 'article')
  expect(article.panel.factIds).toEqual(['EIN-F-0075', 'EIN-F-0076', 'EIN-F-0077'])
  expect(article.clip.factIds).toEqual(['EIN-F-0076', 'EIN-F-0077'])
  expect(c.stops.map((s) => s.id)).toEqual(['house', 'article', 'desk', 'standing', 'star1955'])
  expect(artifactById('EIN-SERIES-SEATED-1954').letters).toEqual(['EIN-M-0030', 'EIN-M-0032'])
  expect(artifactById('EIN-SERIES-STANDING').letters).toEqual(['EIN-M-0031', 'EIN-M-0042', 'EIN-M-0033'])
  expect(artifactById('EIN-SERIES-GOTHENBURG-1923').letters).toEqual(['EIN-M-0079', 'EIN-M-0081'])
  // the Battery photograph shows another occasion: its stop tells the photograph only
  const arriving = EINSTEIN.chapters.find((x) => x.id === 'arriving')
  expect(arriving.stops[0].clip.keys).toEqual(['einstein:12:r8'])
  expect(arriving.closing.factIds).toEqual(['EIN-F-0125', 'EIN-F-0126', 'EIN-F-0128'])
})

test('round 8: 2 Library Place is said as a street address', () => {
  const l = NARRATION.chapters['5'].lines.find((x) => x.cue === 'c4')
  expect(l.text).toMatch(/\bthe address 2 Library Place\b/)
})
