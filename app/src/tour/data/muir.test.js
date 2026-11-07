import { test, expect } from 'vitest'
import { MUIR, NORTH_HALL_LABEL, HUTCHINGS_LABEL, GLACIER_NOTE, GLACIER_VIEW, FOUNTAIN_VIEW, FOUNTAIN_NOTE, DUNBAR_LABEL, PASSPORT_NOTE } from './muir.js'
import { CHAPTER_KINDS, validateTour, resolveChapter } from './chapters.js'
import { ARTIFACTS, LINK_ONLY, artifactById } from './artifacts.js'
import { resolveStop } from './index.js'
import INDEX from './facts.generated.json'
import NARRATION from '../../../../assets-src/audio/narration/muir.json'

const recordOf = (s) => s.art || (s.artifact ? artifactById(s.artifact) : null)
const byId = (id) => MUIR.chapters.find((c) => c.id === id)
const yearsIn = (s) => (s.match(/\b1[89]\d\d\b/g) || []).map(Number)
// the narration entry a chapter's opening is voiced from: its own `opening` key, else its kind
const openingEntry = (c) => {
  const key = c.opening ? c.opening.keys[0].split(':')[2] : c.kind
  return NARRATION.chapters[key]
}

test('Muir passes validateTour against the verified index', () => {
  expect(validateTour(MUIR, INDEX)).toEqual([])
})

test('every chapter has a year, a known kind and an opening line voiced for it', () => {
  for (const c of MUIR.chapters) {
    expect(Number.isInteger(c.year), c.id).toBe(true)
    expect(CHAPTER_KINDS).toContain(c.kind)
    const entry = openingEntry(c)
    expect(entry?.opening?.text, c.id).toBeTruthy()
    // an opening keyed by a chapter id names the chapter's own kind
    if (c.opening) {
      expect(entry.kind, c.id).toBe(c.kind)
      expect(c.opening.factIds).toEqual(entry.opening.fact_ids)
    }
  }
  // two chapters of one kind: only the first is voiced from the kind's key
  const kinds = MUIR.chapters.map((c) => c.kind)
  MUIR.chapters.forEach((c, i) => expect(!!c.opening, c.id).toBe(kinds.indexOf(c.kind) !== i))
})

test('the chapter year is its main fact year, and no listed fact is dated before it', () => {
  for (const c of MUIR.chapters) {
    expect(yearsIn(INDEX.facts[c.factIds[0]].claim), c.id).toContain(c.year)
    for (const f of c.factIds) for (const y of yearsIn(INDEX.facts[f].claim)) expect(y, `${c.id} ${f}`).toBeGreaterThanOrEqual(c.year)
  }
})

test('his first spoken line names him before any pronoun', () => {
  const first = MUIR.chapters[0]
  expect(first.map).toBeNull()
  // round 8: a human sentence that names him first (not a dateline)
  expect(NARRATION.chapters[first.kind].opening.text).toMatch(/^John Muir was born on April 21, 1838, at 126 and 128 High Street, in Dunbar\b/)
})

test('chapter ids are unique and resolve by id, kind (first of its kind) and fact id', () => {
  const ids = MUIR.chapters.map((c) => c.id)
  expect(new Set(ids).size).toBe(ids.length)
  MUIR.chapters.forEach((c, i) => {
    expect(resolveChapter(MUIR, c.id)).toBe(i)
    expect(resolveChapter(MUIR, c.kind)).toBe(MUIR.chapters.findIndex((x) => x.kind === c.kind))
  })
  expect(resolveChapter(MUIR, 'MUI-F-0086')).toBe(ids.indexOf('history'))
})

test('every record a stop opens exists, may be displayed (never link-only) and quotes verified facts', () => {
  for (const c of MUIR.chapters)
    for (const s of c.stops) {
      const art = recordOf(s)
      if (s.artifact) expect(art, `${c.id}/${s.id}`).toBeTruthy()
      if (!art) continue
      expect(LINK_ONLY.has(art.id), `${c.id}/${s.id}`).toBe(false)
      expect(art.linkOnly, `${c.id}/${s.id}`).toBeFalsy()
      // a photograph series (round 8): each of its photographs is a cleared record of its own
      for (const r of art.kind === 'series' ? art.letters.map(artifactById) : [art]) {
        expect(INDEX.media[r.id]?.embeddable, r.id).toBe(true)
        for (const l of r.lines || []) expect(INDEX.facts[l.factId]?.claim, l.factId).toContain(l.text.replace(/\.$/, ''))
        for (const p of [...(r.pages || []), ...(r.photos || [])]) expect(p.src, r.id).toMatch(/^\/media\/muir\/MUI-M-\d{4}(-p\d)?\.webp$/)
      }
    }
})

test('the passport, the drawings, the Yosemite records, Glacier Point and the self-portrait are chapter stops; the petition stays link-only', () => {
  const reached = new Set(MUIR.chapters.flatMap((c) => c.stops.flatMap((s) => [recordOf(s)?.id, ...(recordOf(s)?.letters || [])]).filter(Boolean)))
  for (const id of ['MUI-M-0062', 'MUI-M-0034', 'MUI-M-0035', 'MUI-M-0063', 'MUI-M-0064', 'MUI-M-0013', 'MUI-M-0020']) expect(reached.has(id), id).toBe(true)
  // every Muir record in the app is reached from a chapter, except the link-only petition
  for (const id of Object.keys(ARTIFACTS).filter((k) => k.startsWith('MUI-'))) expect(reached.has(id) || LINK_ONLY.has(id), id).toBe(true)
  expect(LINK_ONLY.has('MUI-M-0061')).toBe(true)
  expect(reached.has('MUI-M-0061')).toBe(false)
  expect(ARTIFACTS['MUI-M-0061'].pages || ARTIFACTS['MUI-M-0061'].photos).toBeUndefined()
  expect(byId('birth').stops.some((s) => recordOf(s)?.id === 'MUI-M-0062')).toBe(true)
  expect(artifactById('MUI-M-0062').pages).toHaveLength(2)
})

test('reference-only photographs (Dunbar, the old homestead) are never records; the Dunbar room says it is a rebuild from the listing and a reference photograph', () => {
  for (const id of ['MUI-M-0055', 'MUI-M-0060']) {
    expect(INDEX.media[id].embeddable, id).toBe(false)
    expect(INDEX.media[id].referenceOnly, id).toMatch(/Photographer: Unknown/)
    expect(ARTIFACTS[id], id).toBeUndefined()
  }
  // Task 14c: the birth chapter is the High Street room, on the verified birthplace fact MUI-F-0145
  const birth = byId('birth')
  expect(birth.place.tier).toBe('room')
  expect(birth.factIds).toContain('MUI-F-0145')
  expect(birth.place.room.labelText).toBe(DUNBAR_LABEL)
  expect(DUNBAR_LABEL).toContain(INDEX.facts['MUI-F-0145'].claim.replace(/\.$/, '').replace(/'/g, '’'))
  expect(DUNBAR_LABEL).toMatch(/rebuild from the listing’s description and from the photograph, which is used as reference only/)
  // the reference photograph's NPGallery create date is a catalogue field, not a capture date: never shown
  expect(DUNBAR_LABEL).not.toMatch(/1905|April/)
  expect(`${birth.place.label} ${birth.place.room.title}`).not.toMatch(/1905|April|photographed in/)
  expect(DUNBAR_LABEL).toMatch(/photographer is unknown/)
  // no stop of any chapter opens a reference-only photograph
  for (const c of MUIR.chapters) for (const s of c.stops) expect(['MUI-M-0055', 'MUI-M-0056', 'MUI-M-0060']).not.toContain(recordOf(s)?.id)
})

test('records shown away from where they were made carry a place note; basis photographs sit where they were taken', () => {
  const stop = (c, id) => byId(c).stops.find((s) => s.id === id)
  for (const [c, id] of [['birth', 'passport'], ['first-work', 'clock'], ['first-work', 'star'], ['big-work', 'register'], ['big-work', 'fern'], ['study', 'portrait'],
    // round 9: the book page at Dunbar, the plate at North Hall, the Sierra Club and parks books in the study
    ['birth', 'boyhood'], ['first-work', 'thermometer'], ['study', 'sierra'], ['study', 'parks']]) expect(stop(c, id).placeNote, `${c}/${id}`).toBeTruthy()
  expect(stop('birth', 'passport').placeNote).toBe(PASSPORT_NOTE)
  // fix round 1 (controller ruling): a building's photograph is a stop only when a cited fact ties it to him; none
  // does for North Hall or the Hutchings room, so neither is a stop (each stays its room's label record)
  expect(stop('big-work', 'photo')).toBeUndefined()
  expect(stop('first-work', 'photo')).toBeUndefined()
  expect(byId('first-work').place.room.records).toEqual(['MUI-M-0075'])
  expect(byId('big-work').place.room.records).toEqual(['MUI-M-0078'])
  expect(stop('legacy', 'photo').artifact).toBe('MUI-M-0082')
  // round 8: the two 1903 stereographs of one moment are one stop, the photo room's own photograph first
  expect(artifactById(stop('history', 'photo').artifact).letters).toEqual([GLACIER_VIEW.mediaId, 'MUI-M-0013'])
  // round 9: the San Francisco call of May 18, 1903 rides the viewing rail
  expect(byId('history').stops.map((s) => s.id)).toEqual(['photo', 'call1903'])
})

test('room labels the tour shows say no more than the verified facts', () => {
  expect(byId('first-work').place.room.labelText).toBe(NORTH_HALL_LABEL)
  expect(NORTH_HALL_LABEL).not.toMatch(/lived|enrolled|1861|1863/)
  // round 9 (owner feedback item 6): the room is tied to him by a verified fact (MUI-F-0153), said in the label and the
  // opening; the label claims nothing more (no years he lived there, no drawings made there)
  expect(NORTH_HALL_LABEL).toContain(INDEX.facts['MUI-F-0153'].claim.replace(/\.$/, ''))
  expect(byId('first-work').factIds).toEqual(expect.arrayContaining(['MUI-F-0153', 'MUI-F-0111']))
  expect(byId('big-work').place.room.labelText).toBe(HUTCHINGS_LABEL)
  expect(HUTCHINGS_LABEL).not.toMatch(/sawmill|1869/)
  expect(HUTCHINGS_LABEL).toMatch(/not John Muir’s cabin/)
  // Glacier Point is a photo room (the rebuild was set aside, DECISION.md; Task 14c fix round 1): its
  // note names the photograph, its date and holder, and says Muir is not in it
  const glacier = byId('history').place
  expect(glacier.tier).toBe('photo')
  expect(glacier.note).toBe(GLACIER_NOTE)
  expect(GLACIER_NOTE).toMatch(/Library of Congress/)
  expect(GLACIER_NOTE).toMatch(/c1903 July 18/)
  expect(GLACIER_NOTE).toMatch(/John Muir is not in this photograph/)
  expect(GLACIER_NOTE).not.toMatch(/together/)
})

test('map legs: only the 1849 journey has a leg, Dunbar to Kingston; only the boat to Albany carries a mode', () => {
  const legs = MUIR.chapters.filter((c) => c.map)
  expect(legs.map((c) => c.id)).toEqual(['arriving'])
  const { segments: segs, places } = legs[0].map
  // round 9 (owner decision 2026-10-29): the crossing is drawn from Dunbar, un-routed (the crossing fact is country to
  // country, MUI-F-0097: no ship, no line from Scotland as a place); the inland legs stay routed
  expect(places.map((p) => p.id)).toEqual(['dunbar', 'newyork', 'albany', 'buffalo', 'milwaukee', 'kingston'])
  expect(segs[0]).toEqual({ routed: false, mode: null })
  expect(segs.slice(1).every((s) => s.journey?.facts?.length)).toBe(true)
  expect(segs.filter((s) => s.mode).map((s) => [s.mode, s.label])).toEqual([['ship', 'By boat to Albany']])
  // segment i joins places i and i + 1: the ship is New York -> Albany
  const i = segs.findIndex((s) => s.mode)
  expect([places[i].id, places[i + 1].id]).toEqual(['newyork', 'albany'])
})

test('conflict rulings: no month for leaving Scotland, ten years old, no enrolment or botany-lesson date', () => {
  const said = JSON.stringify(NARRATION)
  expect(said).not.toMatch(/February 1849|March 1849|eleven|Griswold|1861|1862/)
  expect(said).toMatch(/ten-year-old/)
})

test('no opening says he was "here" or places him at a room he is not verified at', () => {
  for (const [key, ch] of Object.entries(NARRATION.chapters)) if (ch.opening) expect(ch.opening.text, key).not.toMatch(/\bwas born here\b|\bhere,? (he|John)\b|\bcabin\b/)
})

test('landing story points and old step links open a chapter', () => {
  expect(resolveStop('muir', 'MUI-F-0006')).toEqual({ chapter: 'study', label: 'The John Muir House: the Sierra Club' })
  expect(resolveStop('muir', 'study').chapter).toBe('study')
  for (const [key, hit] of Object.entries(MUIR.storyStops)) expect(MUIR.chapters.some((c) => c.id === hit.chapter), key).toBe(true)
  // 5 rooms (Dunbar rebuilt, Task 14c), 2 photo rooms (Fountain Lake and Glacier Point: both rebuilds set
  // aside, Task 14c fix round 1), no gallery case
  expect(MUIR.chapters.filter((c) => c.place.tier === 'room').length).toBe(5)
  expect(MUIR.chapters.filter((c) => c.place.tier === 'photo').map((c) => c.id)).toEqual(['arriving', 'history'])
  expect(MUIR.chapters.filter((c) => c.place.tier === 'gallery').map((c) => c.id)).toEqual([])
  // the set-aside rebuild is used by no chapter
  expect(MUIR.chapters.some((c) => c.place.room?.id === 'muir-glacier-point-1903')).toBe(false)
})

test('every fact a chapter speaks at its place (opening, arrival, closing, stop clips) is listed in its factIds', () => {
  // map legs may tell what happened on the way (earlier facts), as in the other tours; an opening may also
  // pick up the previous chapter's turning point (time order, owner decision 2026-10-27): those facts are
  // the previous chapter's
  MUIR.chapters.forEach((c, i) => {
    const room = c.place.room
    const prev = MUIR.chapters[i - 1]?.factIds || []
    const own = [room?.narration, room?.closing, c.closing, ...c.stops.map((s) => s.clip)].filter(Boolean)
    for (const f of own.flatMap((k) => k.factIds)) expect(c.factIds, `${c.id} ${f}`).toContain(f)
    const opening = c.opening?.factIds || openingEntry(c).opening.fact_ids
    for (const f of opening) expect([...c.factIds, ...prev], `${c.id} opening ${f}`).toContain(f)
  })
})

test('the drawings and the other records shown away from where they were made carry their own note heading', () => {
  const stop = (c, id) => byId(c).stops.find((s) => s.id === id)
  expect(stop('first-work', 'clock').placeNoteLabel).toBe('Not drawn here')
  expect(stop('first-work', 'star').placeNoteLabel).toBe('Not drawn here')
  expect(stop('study', 'portrait').placeNoteLabel).toBe('Not drawn here')
  for (const [c, id] of [['big-work', 'register'], ['big-work', 'fern']]) expect(stop(c, id).placeNoteLabel, id).toBeTruthy()
})

test('no visitor-facing Muir string carries a death year (1914 is not a verified fact)', async () => {
  const { readFileSync } = await import('node:fs')
  const lines = JSON.parse(readFileSync(new URL('../../shared/guide/lines.json', import.meta.url), 'utf8'))
  const landing = JSON.parse(readFileSync(new URL('../../landing/data/inductees.json', import.meta.url), 'utf8')).find((i) => i.slug === 'muir')
  const records = Object.values(ARTIFACTS).filter((a) => a.slug === 'muir')
  const shown = [
    ...records.map((r) => ({ ...r, source: undefined })), // the holder URL is a link, not shown text
    MUIR.chapters.map((c) => ({ ...c, place: { ...c.place, room: c.place.room && { title: c.place.room.title, labelText: c.place.room.labelText } } })),
    NARRATION.chapters,
    Object.fromEntries(Object.entries(lines.tour.rooms).filter(([id]) => id.startsWith('muir-'))),
    landing,
  ]
  const text = JSON.stringify(shown)
  expect(text).not.toMatch(/1914/)
})

test('the Glacier Point photo room: the cleared stereograph, a solved camera that puts Roosevelt about 3.8 m away, one proxy layer', async () => {
  const { photoLayout, ground } = await import('../place/photoProjection.js')
  expect(INDEX.media[GLACIER_VIEW.mediaId].embeddable).toBe(true)
  const { cam, cards, far } = photoLayout(GLACIER_VIEW)
  expect(cards.map((c) => c.id)).toEqual(['figure'])
  const feet = ground(cam, GLACIER_VIEW.crop, ...GLACIER_VIEW.layers[0].at)
  const d = Math.hypot(feet.x, feet.z)
  expect(d).toBeGreaterThan(3.3)
  expect(d).toBeLessThan(4.3)
  // the ledge's far edge (the backdrop) lies beyond him
  expect(far).toBeGreaterThan(d)
})

test('Fountain Lake (Task 14c fix round 1): a photo room of the cleared 1923 photograph; no farmhouse claimed; the panel lines kept on its record', async () => {
  const c = byId('arriving')
  expect(c.place.tier).toBe('photo')
  expect(c.place.photo).toBe(FOUNTAIN_VIEW)
  expect(FOUNTAIN_VIEW.mediaId).toBe('MUI-M-0086')
  expect(INDEX.media['MUI-M-0086'].embeddable).toBe(true)
  expect(INDEX.media['MUI-M-0086'].basisFor).toContain('MUI-F-0100')
  expect(c.place.note).toBe(FOUNTAIN_NOTE)
  expect(FOUNTAIN_NOTE).toContain(INDEX.facts['MUI-F-0100'].claim.replace(/\.$/, ''))
  expect(FOUNTAIN_NOTE).toMatch(/Wisconsin Historical Society/)
  expect(FOUNTAIN_NOTE).toMatch(/the Muir farmhouse is not in it/)
  expect(FOUNTAIN_NOTE).not.toMatch(/gone/)
  // the set-aside rebuild is used by no chapter
  expect(MUIR.chapters.some((ch) => ch.place.room?.id === 'muir-fountain-lake')).toBe(false)
  // the stop over the view has its subject (the lake) for the guide-overlap check; the other two 1923 views ride the rail
  // round 8: the three 1923 photographs of the farm are one stop over the view (a photograph series, the photo
  // room's own photograph first); none rides the rail any more
  const photo = c.stops.find((s) => s.id === 'photo')
  expect(artifactById(photo.artifact).letters).toEqual(['MUI-M-0086', 'MUI-M-0084', 'MUI-M-0085'])
  expect(photo.at.target).toHaveLength(4)
  // round 9: two plates from his 1913 book ride the rail; neither claims the farmhouse (no card line, no fact line)
  expect(c.stops.filter((s) => s.rail).map((s) => [s.id, s.art.id, s.clip.factIds])).toEqual([
    ['shanty', 'MUI-M-0095', []],
    ['lake', 'MUI-M-0096', []],
  ])
  expect(c.stops.filter((s) => s.rail).every((s) => !s.art.lines.some((l) => /farmhouse/i.test(l.text)))).toBe(true)
  // the farm's name and what it meant to him are not what the photographs show: they open the closing, then the
  // move to Hickory Hill closes the chapter (fix round 1)
  expect(artifactById('MUI-M-0086').clip).toBeUndefined()
  expect(c.closing.factIds).toEqual(['MUI-F-0102', 'MUI-F-0105', 'MUI-F-0106', 'MUI-F-0107', 'MUI-F-0108'])
  for (const f of c.closing.factIds) expect(c.factIds).toContain(f)
  // proxies stand in front of the backdrop, the near shore lies before the far one
  const { photoLayout, ground } = await import('../place/photoProjection.js')
  const { cam, cards, far } = photoLayout(FOUNTAIN_VIEW)
  expect(cards.map((x) => x.id)).toEqual(['left', 'right'])
  for (const k of cards) expect(-k.position.z).toBeLessThan(far)
  const near = -ground(cam, FOUNTAIN_VIEW.crop, 600, 570).z
  expect(near).toBeGreaterThan(20)
  expect(near).toBeLessThan(far)
})
