import { test, expect } from 'vitest'
import { momentsIndex, filterByKind, byTimeline, layoutField, KIND_LABELS, kindLabel, kindsOf } from './moments.js'
import { CHAPTER_KINDS } from '../data/chapters.js'

const tours = {
  a: { slug: 'a', name: 'A', chapters: [{ id: 'c1', kind: 'citizen', title: 'C', year: 1940, factIds: [] }] },
  b: { slug: 'b', name: 'B', chapters: [{ id: 'c2', kind: 'citizen', title: 'C', year: 1903, factIds: [] }, { id: 'x', kind: 'birth', title: 'B', year: 1838, factIds: [] }] },
}

test('filter by kind puts all citizens side by side', () => {
  expect(filterByKind(momentsIndex(tours), 'citizen').map((m) => m.slug)).toEqual(['a', 'b'])
})

test('timeline sorts by year', () => {
  expect(byTimeline(momentsIndex(tours)).map((m) => m.year)).toEqual([1838, 1903, 1940])
})

test('inductees still on steps contribute nothing', () => {
  const mixed = { ...tours, old: { slug: 'old', name: 'Old', steps: [{ id: 's' }] } }
  expect(momentsIndex(mixed).map((m) => m.slug)).not.toContain('old')
})

test('every chapter kind has a visitor label; an unknown kind still gets a readable chip', () => {
  for (const k of CHAPTER_KINDS) expect(KIND_LABELS[k], k).toBeTruthy()
  expect(kindLabel('first-work')).toBe(KIND_LABELS['first-work'])
  expect(kindLabel('new-kind')).toBe('New kind')
  expect(kindsOf([{ kind: 'legacy' }, { kind: 'zzz' }, { kind: 'birth' }, { kind: 'birth' }])).toEqual(['birth', 'legacy', 'zzz'])
})

test('thumbnails come from the generated export only, never from the chapter itself', () => {
  const hand = { a: { ...tours.a, chapters: [{ ...tours.a.chapters[0], thumbMediaId: 'HAND-SET' }] } }
  expect(momentsIndex(hand)[0].thumbMediaId).toBeNull()
  const gen = { a: [{ id: 'c1', thumbMediaId: 'A-M-1' }] }
  const [m] = momentsIndex({ a: tours.a }, gen)
  expect(m).toMatchObject({ slug: 'a', name: 'A', chapterId: 'c1', kind: 'citizen', title: 'C', year: 1940, thumbMediaId: 'A-M-1' })
  expect(momentsIndex(tours)[0].thumbMediaId).toBeNull()
})

test('filterByKind with no kind returns everything; the timeline does not mutate its input', () => {
  const items = momentsIndex(tours)
  const before = items.map((m) => m.chapterId)
  expect(filterByKind(items, null)).toHaveLength(3)
  byTimeline(items)
  expect(items.map((m) => m.chapterId)).toEqual(before)
})

test('layoutField places every card inside the field with no two cards touching', () => {
  for (const seed of [7, 99, 12345]) for (const ordered of [false, true]) for (const [n, W] of [[3, 1200], [8, 1200], [25, 900], [8, 600]]) {
    const cw = 190, ch = 190
    const { pos, height } = layoutField({ n, W, cw, ch, minH: 380, seed, ordered })
    const box = pos.map((p) => ({ l: p.x - cw / 2, r: p.x + cw / 2, t: p.y - ch / 2, b: p.y + ch / 2 }))
    box.forEach((a, i) => {
      expect(a.l).toBeGreaterThanOrEqual(0)
      expect(a.r).toBeLessThanOrEqual(W)
      expect(a.t).toBeGreaterThanOrEqual(0)
      expect(a.b).toBeLessThanOrEqual(height)
      box.slice(i + 1).forEach((c) => expect(a.l < c.r && c.l < a.r && a.t < c.b && c.t < a.b).toBe(false))
    })
  }
})

test('a thumbnail says what it shows and when; a photograph of another year says so plainly', async () => {
  const { thumbLabel, yearOf } = await import('./moments.js')
  expect(yearOf('April 20, 1993')).toBe(1993)
  expect(yearOf('8/2/1939')).toBe(1939)
  expect(yearOf('c1894')).toBe(1894)
  expect(yearOf(undefined)).toBeNull()
  const photo = { kind: 'photo', title: 'President Clinton with Madeline Albright and Warren Christopher', date: 'April 20, 1993' }
  expect(thumbLabel(photo, 1937)).toEqual({ alt: 'President Clinton with Madeline Albright and Warren Christopher, April 20, 1993', caption: 'Photograph from April 20, 1993, not of this moment', otherMoment: true })
  expect(thumbLabel(photo, 1993)).toMatchObject({ caption: 'Photograph, April 20, 1993', otherMoment: false })
  expect(thumbLabel({ kind: 'document', title: 'Passport application', date: '1903' }, 1838)).toMatchObject({ caption: 'Document, 1903', otherMoment: false })
  expect(thumbLabel({ kind: 'document', title: 'Petition for Naturalization' }, 1937)).toEqual({ alt: 'Petition for Naturalization', caption: 'Document', otherMoment: false })
})

test('every shipped Moments thumbnail has a title for its alt, and the three flagged ones are labelled as another moment', async () => {
  const { INDUCTEES } = await import('../data/index.js')
  const { artifactById } = await import('../data/artifacts.js')
  const gen = (await import('../data/chapters.generated.json')).default
  const { thumbLabel } = await import('./moments.js')
  const flagged = []
  for (const m of momentsIndex(INDUCTEES, gen)) {
    if (!m.thumbMediaId) continue
    const l = thumbLabel(artifactById(m.thumbMediaId), m.year)
    expect(l.alt.length, m.thumbMediaId).toBeGreaterThan(10)
    if (l.otherMoment) flagged.push(`${m.slug}/${m.chapterId}`)
  }
  // final review I6: Albright citizen (2016 ceremony), Lamarr later life (1942 premiere). (Albright's birth
  // chapter no longer shows the 1993 photograph: it moved to the 1993 chapter, round 7 fix round 1.)
  for (const k of ['albright/citizen', 'lamarr/legacy']) expect(flagged, k).toContain(k)
  expect(flagged).not.toContain('albright/birth')
})
