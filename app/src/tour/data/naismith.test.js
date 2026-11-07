import { test, expect } from 'vitest'
import { NAISMITH, ALMONTE_LABEL, SPRINGFIELD_LABEL } from './naismith.js'
import { CHAPTER_KINDS, validateTour, resolveChapter } from './chapters.js'
import { ARTIFACTS, LINK_ONLY, artifactById } from './artifacts.js'
import { resolveStop } from './index.js'
import INDEX from './facts.generated.json'
import NARRATION from '../../../../assets-src/audio/narration/naismith.json'

const recordOf = (s) => s.art || (s.artifact ? artifactById(s.artifact) : null)
const byKind = (k) => NAISMITH.chapters.find((c) => c.kind === k)
const yearsIn = (s) => (s.match(/\b1[89]\d\d\b/g) || []).map(Number)

test('Naismith passes validateTour against the verified index', () => {
  expect(validateTour(NAISMITH, INDEX)).toEqual([])
})

test('every chapter has a year, a known kind and an opening line voiced for that kind', () => {
  for (const c of NAISMITH.chapters) {
    expect(Number.isInteger(c.year), c.id).toBe(true)
    expect(CHAPTER_KINDS).toContain(c.kind)
    expect(NARRATION.chapters[c.kind]?.opening, c.id).toBeTruthy()
  }
})

test('the chapter year is its main fact year, and no listed fact is dated before it', () => {
  for (const c of NAISMITH.chapters) {
    expect(yearsIn(INDEX.facts[c.factIds[0]].claim), c.id).toContain(c.year)
    for (const f of c.factIds) for (const y of yearsIn(INDEX.facts[f].claim)) expect(y, `${c.id} ${f}`).toBeGreaterThanOrEqual(c.year)
  }
})

test('his first spoken line names him before any pronoun', () => {
  const first = NAISMITH.chapters[0]
  expect(first.map).toBeNull()
  // round 8: a human sentence that names him first (not a dateline)
  expect(NARRATION.chapters[first.kind].opening.text).toMatch(/^James Naismith was born in Almonte\b/)
})

test('chapter ids are unique and resolve by id, kind and fact id', () => {
  const ids = NAISMITH.chapters.map((c) => c.id)
  expect(new Set(ids).size).toBe(ids.length)
  NAISMITH.chapters.forEach((c, i) => {
    expect(resolveChapter(NAISMITH, c.id)).toBe(i)
    expect(resolveChapter(NAISMITH, c.kind)).toBe(i)
  })
  expect(resolveChapter(NAISMITH, 'NAI-F-0100')).toBe(ids.indexOf('first-work'))
})

test('every record a stop opens exists, may be displayed (never link-only) and quotes verified facts', () => {
  for (const c of NAISMITH.chapters)
    for (const s of c.stops) {
      const art = recordOf(s)
      if (s.artifact) expect(art, `${c.id}/${s.id}`).toBeTruthy()
      if (!art) continue
      expect(LINK_ONLY.has(art.id), `${c.id}/${s.id}`).toBe(false)
      expect(art.linkOnly, `${c.id}/${s.id}`).toBeFalsy()
      if (/^NAI-M-\d{4}$/.test(art.id)) expect(INDEX.media[art.id]?.embeddable, art.id).toBe(true)
      for (const l of [...(art.lines || []), ...(art.model?.notes || [])]) expect(INDEX.facts[l.factId]?.claim, l.factId).toContain(l.text.replace(/\.$/, ''))
    }
})

test('the 1894 book and both Topeka pages are chapter stops; the first-team photograph stays link-only', () => {
  const reached = new Set(NAISMITH.chapters.flatMap((c) => c.stops.map((s) => recordOf(s)?.id).filter(Boolean)))
  for (const id of ['NAI-M-0003', 'NAI-M-0049', 'NAI-M-0050']) expect(reached.has(id), id).toBe(true)
  expect(byKind('first-work').stops.some((s) => s.artifact === 'NAI-M-0003')).toBe(true)
  expect(byKind('big-work').stops.filter((s) => /^NAI-M-00(49|50)$/.test(s.artifact)).length).toBe(2)
  expect(LINK_ONLY.has('NAI-M-0004')).toBe(true)
  expect(reached.has('NAI-M-0004')).toBe(false)
  expect(ARTIFACTS['NAI-M-0004'].pages || ARTIFACTS['NAI-M-0004'].photos).toBeUndefined()
  expect(artifactById('NAI-M-0003').pages).toHaveLength(26)
})

test('the peach basket and the ball are labelled recreations in the Springfield gymnasium, lines only from verified facts', () => {
  const gym = byKind('first-work')
  expect(gym.place.tier).toBe('room')
  expect(gym.place.room.id).toBe('naismith-springfield-gym')
  for (const id of ['NAI-PEACH-BASKET-RECREATION', 'NAI-BALL-RECREATION']) {
    const r = ARTIFACTS[id]
    expect(r.kind).toBe('model')
    expect(r.recreation).toBe('Recreation; the originals were not preserved')
    expect(r.model.notes).toEqual([])
    const stop = gym.stops.find((s) => s.artifact === id)
    expect(stop?.prop?.src, id).toBe(r.model.src)
  }
  expect(ARTIFACTS['NAI-PEACH-BASKET-RECREATION'].lines.map((l) => l.factId)).toEqual(['NAI-F-0088'])
  expect(ARTIFACTS['NAI-BALL-RECREATION'].lines).toEqual([])
  // no other chapter shows them
  for (const c of NAISMITH.chapters.filter((x) => x !== gym)) for (const s of c.stops) expect(s.artifact || '').not.toMatch(/RECREATION/)
})

test('room labels the tour shows say no more than the verified facts', () => {
  expect(byKind('birth').place.room.labelText).toBe(ALMONTE_LABEL)
  expect(ALMONTE_LABEL).not.toMatch(/1875|attended/)
  expect(ALMONTE_LABEL).toMatch(/No source on file dates the building or places James Naismith here/)
  expect(byKind('first-work').place.room.labelText).toBe(SPRINGFIELD_LABEL)
  expect(SPRINGFIELD_LABEL).not.toMatch(/first played/)
  expect(SPRINGFIELD_LABEL).toMatch(/the originals were not preserved/)
})

test('map legs: transport mode only where a verified fact names it (none does for him), and no leg after his death', () => {
  for (const c of NAISMITH.chapters.filter((x) => x.map)) for (const s of c.map.segments) expect(s.mode, c.id).toBeNull()
  expect(byKind('honoured').map).toBeNull()
  expect(byKind('history').map).toBeNull()
})

test('no opening says he was "here" or places him at a room he is not verified at', () => {
  for (const [kind, ch] of Object.entries(NARRATION.chapters)) if (ch.opening) expect(ch.opening.text, kind).not.toMatch(/\bwas born here\b|\bhere,? (he|James)\b/)
  // the Hall of Fame chapter never names Springfield as the place of the 1959 induction
  expect(NARRATION.chapters.honoured.opening.text).not.toMatch(/Springfield/)
})

test('gallery and rail stops carry their record inline; gallery chapters have no usable basis photo', () => {
  for (const c of NAISMITH.chapters) for (const s of c.stops) if (!s.panel && (c.place.tier === 'gallery' || s.rail)) expect(s.art?.id, `${c.id}/${s.id}`).toBeTruthy()
  // 5 rooms of 6 chapters (round 9: Berlin and Lawrence are one gallery chapter)
  expect(NAISMITH.chapters.filter((c) => c.place.tier === 'room').length).toBe(5)
})

test('landing story points and old step links open a chapter', () => {
  expect(resolveStop('naismith', 'NAI-F-0090')).toEqual({ chapter: 'first-work', label: 'Inventing basketball: the 13 rules' })
  expect(resolveStop('naismith', 'robinson').chapter).toBe('big-work')
  for (const [key, hit] of Object.entries(NAISMITH.storyStops)) expect(NAISMITH.chapters.some((c) => c.id === hit.chapter), key).toBe(true)
})

test('the book opens on its printed cover, the same page the landing thumbnail shows', async () => {
  const { readFileSync } = await import('node:fs')
  const py = readFileSync(new URL('../../landing/data/build_inductees.py', import.meta.url), 'utf8')
  const cover = Number(py.match(/COVER_PAGE = \{"NAI-M-0003": (\d+)\}/)[1])
  const book = artifactById('NAI-M-0003')
  expect(book.startPage + 1).toBe(cover)
  expect(book.thumb).toBe(book.pages[book.startPage].src)
})

test('the Hall of Fame room (round 8): the tower and ball were architecture-only stops and are gone; the 2019 photograph is the stop', () => {
  const room = byKind('honoured').place.room
  // round 9 (owner directive 2026-10-29): the 1959 and 1961 Evening star pages on easels before the 2019 photograph
  expect(room.artifacts.map((a) => [a.id, a.artifact])).toEqual([['star1959', 'NAI-M-0076'], ['star1961', 'NAI-M-0077'], ['photo', 'NAI-M-0060']])
  expect(room.artifacts.every((a) => a.artifact && !a.nodes)).toBe(true)
})

test('round 9: Almonte has no standing poster; its records hang on the school wall; the line about him is told on arrival', () => {
  const birth = byKind('birth')
  // round 9 part B (owner directive 2026-10-29): printed records of his birth (fix round 2: Who's Who is held back), hung on the school's front wall
  // (never an easel or poster in front of the building, owner feedback round 9 item 11), in print order
  expect(birth.stops.map((s) => [s.id, s.artifact, s.display.mount])).toEqual([
    ['lynden', 'NAI-M-0070', 'wall'],
    ['milwaukee', 'NAI-M-0071', 'wall'],
  ])
  expect(birth.place.room.narration).toEqual({ keys: ['naismith:11:c1'], factIds: ['NAI-F-0114', 'NAI-F-0130'] })
})

test('round 9: Berlin 1936 and Lawrence 1939 are one chapter, in time order, keeping both records; death before its record', () => {
  expect(NAISMITH.chapters.map((c) => c.id)).toEqual(['birth', 'education', 'first-work', 'big-work', 'history', 'honoured'])
  const c = byKind('history')
  expect([c.year, c.yearFact, c.place.tier]).toEqual([1936, 'NAI-F-0098', 'gallery'])
  expect(c.factIds).toContain(c.yearFact)
  // the Olympics (1936), his retirement (1937) at the panel, then his death (1939) before the "Dies Today" record line
  expect(c.stops.map((s) => [s.id, s.art?.id || null, s.clip.keys])).toEqual([
    ['paper', 'NAI-M-0068', ['naismith:12:r6']],
    ['panel', null, ['naismith:11:c13']],
    ['paper1939', 'NAI-M-0067', ['naismith:11:c9', 'naismith:12:r7']],
    // round 9: a second report of the same day, after the death line
    ['henderson1939', 'NAI-M-0075', ['naismith:21:r7']],
  ])
  expect(c.place.panel.factIds).toEqual(expect.arrayContaining(['NAI-F-0097', 'NAI-F-0098']))
  expect(c.closing).toBeFalsy()
  expect(NARRATION.chapters.legacy).toBeUndefined()
})

test('round 8: Montreal shows the line about him at its record, and no architecture-only stop', () => {
  // fix round 2 (review N2): the McGill stop shows Old Hall, McGill University; its line is his time at McGill
  // (fix round 2: the McGill calendars of 1887-1888 and 1889-1890 are held back until their identification is settled)
  expect(byKind('education').stops.map((s) => [s.id, s.artifact, s.clip.factIds])).toEqual([
    ['mcgill', 'NAI-M-0059', ['NAI-F-0129', 'NAI-F-0084']],
  ])
  // the rules' publication (1892) is not at the 1894 book; his teaching is not at the roof; the assignment is on its own panel
  expect(byKind('first-work').stops.find((s) => s.id === 'game').panel.factIds).toEqual(['NAI-F-0078'])
  expect(byKind('first-work').stops.find((s) => s.id === 'book').clip.factIds).toEqual(['NAI-F-0072'])
  expect(byKind('big-work').place.room.closing.factIds).toEqual(['NAI-F-0092', 'NAI-F-0093'])
})

test('no map legs: no verified fact states any of his moves as a journey (Task 19 fix round 2); the legs\' lines stay as chapter narration', () => {
  // round 9 (owner decision 2026-10-29): his arrival in the United States is drawn Montreal to Springfield, un-routed
  // (that he left Canada for Springfield is single-source): no journey, no mode
  expect(NAISMITH.chapters.filter((c) => c.map).map((c) => c.id)).toEqual(['first-work'])
  expect(byKind('first-work').map.segments).toEqual([{ routed: false, mode: null }])
  expect(byKind('first-work').map.places.map((p) => p.label)).toEqual(['Montreal', 'Springfield'])
  // in time order (owner decision 2026-10-27): the wedding (1894) and Denver (1895) close the Springfield chapter,
  // the medical degree (1898) opens Kansas
  // fix round 1 (review N7): the medical degree (1898, Denver) closes Springfield after Denver; Kansas has no arrival line
  expect(byKind('first-work').place.room.closing.factIds).toEqual(['NAI-F-0085', 'NAI-F-0099', 'NAI-F-0095', 'NAI-F-0096'])
  expect(byKind('big-work').narration).toBeFalsy()
})

// round 9 final review (fix round 2): three records shown on a rights-only ruling while the adversary's identification
// objection stands are held back: no stop, card or record line uses them until it is settled
test('records whose identification is unresolved are not shown', () => {
  const held = ['NAI-M-0069', 'NAI-M-0072', 'NAI-M-0073']
  for (const id of held) expect(ARTIFACTS[id], id).toBeUndefined()
  const used = JSON.stringify(NAISMITH.chapters.map((c) => [c.stops, c.place]))
  for (const id of held) expect(used.includes(id), id).toBe(false)
})
