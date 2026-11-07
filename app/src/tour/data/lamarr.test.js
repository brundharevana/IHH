import { test, expect } from 'vitest'
import { LAMARR, NORMANDIE_HARBOR, STUDIO_PHOTO_NOTE, CEMETERY_LABEL } from './lamarr.js'
import { CHAPTER_KINDS, validateTour, resolveChapter } from './chapters.js'
import { ARTIFACTS, LINK_ONLY, artifactById } from './artifacts.js'
import { resolveStop } from './index.js'
import { galleryLayout } from '../place/galleryLayout.js'
import { solvePhotoCamera } from '../place/photoProjection.js'
import INDEX from './facts.generated.json'
import NARRATION from '../../../../assets-src/audio/narration/lamarr.json'

const recordOf = (s) => s.art || (s.artifact ? artifactById(s.artifact) : null)

test('Lamarr passes validateTour against the verified index', () => {
  expect(validateTour(LAMARR, INDEX)).toEqual([])
})

test('every chapter has a year, a known kind and an opening line voiced for that kind', () => {
  for (const c of LAMARR.chapters) {
    expect(Number.isInteger(c.year), c.id).toBe(true)
    expect(CHAPTER_KINDS).toContain(c.kind)
    expect(NARRATION.chapters[c.kind]?.opening, c.id).toBeTruthy()
  }
})

test('her first spoken line names her before any pronoun', () => {
  const first = LAMARR.chapters[0]
  expect(first.map).toBeNull()
  // round 8: a human sentence that names her first (not a dateline)
  expect(NARRATION.chapters[first.kind].opening.text).toMatch(/^Hedy Lamarr was born Hedwig Eva Maria Kiesler, in Vienna\b/)
})

test('chapter ids are unique and resolve by id, kind and fact id', () => {
  const ids = LAMARR.chapters.map((c) => c.id)
  expect(new Set(ids).size).toBe(ids.length)
  LAMARR.chapters.forEach((c, i) => {
    expect(resolveChapter(LAMARR, c.id)).toBe(i)
    expect(resolveChapter(LAMARR, c.kind)).toBe(i)
  })
  expect(resolveChapter(LAMARR, 'LAM-F-0091')).toBe(ids.indexOf('big-work'))
})

test('every record a stop opens exists, may be displayed (never link-only) and quotes verified facts', () => {
  for (const c of LAMARR.chapters)
    for (const s of c.stops) {
      const art = recordOf(s)
      if (s.artifact) expect(art, `${c.id}/${s.id}`).toBeTruthy()
      if (!art) continue
      expect(LINK_ONLY.has(art.id), `${c.id}/${s.id}`).toBe(false)
      expect(art.linkOnly, `${c.id}/${s.id}`).toBeFalsy()
      if (/^LAM-M-\d{4}$/.test(art.id)) expect(INDEX.media[art.id]?.embeddable, art.id).toBe(true)
      const quoted = [...(art.lines || []), ...(art.model?.notes || [])]
      for (const l of quoted) expect(INDEX.facts[l.factId]?.claim, l.factId).toContain(l.text.replace(/\.$/, ''))
    }
})

test('the records that only lived in the constellations are chapter stops', () => {
  const reached = new Set(LAMARR.chapters.flatMap((c) => c.stops.map((s) => recordOf(s)?.id).filter(Boolean)))
  for (const id of ['LAM-M-0001', 'LAM-M-0022', 'LAM-M-0013', 'LAM-M-0014', 'LAM-M-0015', 'LAM-MECHANISM-RECREATION'])
    expect(reached.has(id), id).toBe(true)
  // link-only and reference-only media never appear
  for (const id of ['LAM-M-0028', 'LAM-M-0029']) expect(reached.has(id), id).toBe(false)
  expect(ARTIFACTS['LAM-M-0028']).toBeUndefined()
})

test('the mechanism is a labelled recreation in the invention gallery, notes from LAM-F-0090..0095 only', () => {
  const m = ARTIFACTS['LAM-MECHANISM-RECREATION']
  expect(m.kind).toBe('model')
  expect(m.recreation).toBe('Recreation from the patent drawings (U.S. Patent 2,292,387)')
  const ok = ['LAM-F-0090', 'LAM-F-0091', 'LAM-F-0092', 'LAM-F-0093', 'LAM-F-0094', 'LAM-F-0095']
  for (const n of [...m.model.notes, ...m.lines]) expect(ok).toContain(n.factId)
  const inv = LAMARR.chapters.find((c) => c.kind === 'big-work')
  expect(inv.place.tier).toBe('gallery')
  const l = galleryLayout(inv.stops)
  expect(l.bed.find((b) => b.id === 'mechanism').model.src).toBe(m.model.src)
  expect(l.stand.id).toBe('patent')
})

test('map legs: transport mode only where a verified fact names it (none does for her)', () => {
  for (const c of LAMARR.chapters.filter((x) => x.map)) for (const s of c.map.segments) expect(s.mode, c.id).toBeNull()
})

test('the Normandie photo room keeps its hand solve and claims no crossing', () => {
  const s = solvePhotoCamera(NORMANDIE_HARBOR)
  expect(NORMANDIE_HARBOR.camera.pitchDeg).toBeCloseTo(s.pitchDeg, 3)
  const arriving = LAMARR.chapters.find((c) => c.kind === 'arriving')
  expect(arriving.factIds.every((f) => INDEX.facts[f])).toBe(true)
  expect(arriving.place.note).toMatch(/not her arrival/)
  expect(JSON.stringify(NARRATION)).not.toMatch(/Normandie/)
})

test('landing story points and old links open a chapter', () => {
  expect(resolveStop('lamarr', 'LAM-F-0086')).toEqual({ chapter: 'big-work', label: 'The invention' })
  expect(resolveStop('lamarr', 'studio').chapter).toBe('first-work')
  for (const [key, hit] of Object.entries(LAMARR.storyStops)) expect(LAMARR.chapters.some((c) => c.id === hit.chapter), key).toBe(true)
})

test('gallery and rail stops carry their record inline (the stages read `art`)', () => {
  for (const c of LAMARR.chapters)
    for (const s of c.stops) if (!s.panel && (c.place.tier === 'gallery' || s.rail)) expect(s.art?.id, `${c.id}/${s.id}`).toBeTruthy()
})

test('the MGM room says on screen that the photograph shown there was not taken there', () => {
  const ch = LAMARR.chapters.find((c) => c.kind === 'first-work')
  const photos = ch.stops.filter((s) => recordOf(s)?.kind === 'photo')
  expect(photos.map((s) => recordOf(s).id)).toEqual(['LAM-M-0013'])
  expect(ch.place.room.note).toBe(STUDIO_PHOTO_NOTE)
  expect(STUDIO_PHOTO_NOTE).toMatch(/not taken at this street front/)
  // the portrait's own stop carries the note, so its viewer card says so when it opens
  const portrait = ch.stops.find((s) => s.artifact === 'LAM-M-0013')
  expect(portrait.placeNote).toBe(STUDIO_PHOTO_NOTE)
  // and the shared record does not (it also opens from the constellations, away from the room)
  expect(artifactById('LAM-M-0013').placeNote).toBeUndefined()
})

test('a chapter lists only facts of its own period (the 1942 married name is not a later-life fact)', () => {
  const legacy = LAMARR.chapters.find((c) => c.kind === 'legacy')
  expect(legacy.factIds).not.toContain('LAM-F-0089')
})

test('no panel or chapter frames a later fact under an earlier year', () => {
  const h = LAMARR.chapters.find((c) => c.kind === 'history')
  expect(h.place.panel.eyebrow).not.toMatch(/\d{4}/)
  expect(h.title).not.toMatch(/1942|war bond/i)
})

test('the mechanism notes sit on the record and the card discloses the 8 of 88 rows', () => {
  const m = ARTIFACTS['LAM-MECHANISM-RECREATION']
  for (const n of m.model.notes) expect(n.pos[1]).toBeCloseTo(0.195, 3)
  expect(m.recreationNote).toMatch(/only the rows of perforations the patent drawing shows; in a conventional player piano record there may be 88 rows/)
})

test('the Vienna Central Cemetery room (Task 14c): her ashes are buried in the cemetery, her grave is not shown', () => {
  const c = LAMARR.chapters.find((x) => x.kind === 'legacy')
  expect(c.place.tier).toBe('room')
  expect(c.factIds).toContain('LAM-F-0110')
  expect(c.place.room.labelText).toBe(CEMETERY_LABEL)
  expect(CEMETERY_LABEL).toContain(INDEX.facts['LAM-F-0110'].claim.replace(/\.$/, '').replace(/'/g, '’'))
  expect(CEMETERY_LABEL).toMatch(/Her grave is not shown/)
  expect(CEMETERY_LABEL).toMatch(/graves of honour/)
  // the single-source tomb-of-honour fact is never told
  expect(c.factIds).not.toContain('LAM-F-0038')
  expect(JSON.stringify(NARRATION)).not.toMatch(/tomb of honou?r/i)
  // the opening never puts her death in Vienna: the date comes first, the cemetery only with her ashes
  expect(NARRATION.chapters.legacy.opening.text).not.toMatch(/^Vienna/)
  // the later-life records stay stops, each saying where it was made (fix round 2: the courtroom photograph and the naturalization file)
  for (const id of ['photo', 'file']) expect(c.stops.find((s) => s.id === id).placeNote, id).toBeTruthy()
})

test('round 9: the arrival line runs Vienna to New York, un-routed: no verified fact states that journey (owner decision 2026-10-29)', () => {
  expect(LAMARR.chapters.filter((c) => c.map).map((c) => c.id)).toEqual(['arriving'])
  const m = LAMARR.chapters.find((c) => c.id === 'arriving').map
  expect(m.places.map((p) => p.id)).toEqual(['vienna', 'newyork'])
  // no journey, no ship (the Normandie and London are single-source), no label: the map shows the route-not-recorded note
  expect(m.segments).toEqual([{ routed: false, mode: null }])
  expect(m.resources.flatMap((r) => r.media)).toEqual(['LAM-M-0030', 'LAM-M-0023'])
})
