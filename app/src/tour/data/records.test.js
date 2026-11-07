// Round 9 fix round 5 (Codex review 4): every way a tour shows a record counts as a declaration. Removing any one binding,
// whatever its path (a room record or prop, a series member, a gallery-case item, a photo-room record on the rail or over
// the photograph, a map photograph), makes these tests fail.
import { expect, test } from 'vitest'
import { INDUCTEES } from './index.js'
import { ARTIFACTS, artifactById, backdropOf } from './artifacts.js'
import { recordOfStop, shownRecords } from './shownRecords.js'
import LOCK from './records.lock.json'
import GENERATED from './chapters.generated.json'
import { existsSync } from 'node:fs'
import { momentsIndex, thumbSrc } from '../moments/moments.js'
import { NO_THUMB } from '../moments/noThumb.js'
import EINSTEIN from '../../../../assets-src/audio/narration/einstein.json'
import NAISMITH from '../../../../assets-src/audio/narration/naismith.json'
import MUIR from '../../../../assets-src/audio/narration/muir.json'
import ALBRIGHT from '../../../../assets-src/audio/narration/albright.json'
import LAMARR from '../../../../assets-src/audio/narration/lamarr.json'

const NARRATION = { einstein: EINSTEIN, naismith: NAISMITH, muir: MUIR, albright: ALBRIGHT, lamarr: LAMARR }
const lineOf = (key) => {
  const [slug, ch, cue] = key.split(':')
  return NARRATION[slug]?.chapters?.[ch]?.lines?.find((l) => l.cue === cue) || null
}

test('the tours show exactly the declared records (records.lock.json), by where they are shown', () => {
  const now = shownRecords(INDUCTEES, GENERATED)
  const lost = LOCK.records.filter((r) => !now.includes(r))
  const added = now.filter((r) => !LOCK.records.includes(r))
  expect({ lost, added }).toEqual({ lost: [], added: [] })
})

const PUBLIC = new URL('../../../public/', import.meta.url)
const shipped = (src) => existsSync(new URL(src.replace(/^\//, '').split('?')[0], PUBLIC))

// round 9 fix round 6 (Codex review 5): the photograph a photo room stands in, and every Moments thumbnail, are
// declared records too; each resolves to a record with an image that ships
test("every photo room's photograph is a declared, cleared record whose files ship", () => {
  let n = 0
  for (const [slug, tour] of Object.entries(INDUCTEES))
    for (const c of tour.chapters || []) {
      if (c.place.tier !== 'photo') continue
      n++
      const p = c.place.photo
      expect(LOCK.records, `${slug}/${c.id}`).toContain(`${slug}/${c.id}/backdrop:${p.mediaId}`)
      const art = artifactById(p.mediaId)
      expect(art && !art.linkOnly, `${slug}/${c.id}: ${p.mediaId}`).toBeTruthy()
      // round 9 fix round 7 (Codex review 6): the files come from the record (its backdrop), never from the place
      expect(p.src, `${slug}/${c.id}: the place names its own files`).toBeUndefined()
      const files = backdropOf(p.mediaId)
      expect(files, `${slug}/${c.id}: ${p.mediaId} has no photo room files (backdrop)`).toBeTruthy()
      expect(Object.keys(files).sort(), `${slug}/${c.id}: ${p.mediaId}`).toEqual(['mask', 'photo', 'plate'])
      for (const f of Object.values(files)) expect(shipped(f), `${slug}/${c.id}: ${f}`).toBe(true)
    }
  expect(n).toBeGreaterThan(5)
})

// a photo room's layers, crop and camera are solved for one photograph: two places may not stand in the same one.
// Every record that carries photo room files (a place's, or a kept fallback such as albright.js OVAL_VIEW's) is a
// cleared photograph whose files ship.
test('each photo room record is the photograph of exactly one place', () => {
  const places = {}
  for (const [slug, tour] of Object.entries(INDUCTEES))
    for (const c of tour.chapters || []) if (c.place.tier === 'photo') (places[c.place.photo.mediaId] ||= []).push(`${slug}/${c.id}`)
  for (const [m, at] of Object.entries(places)) expect(at, `${m} is the photograph of more than one place`).toHaveLength(1)
  const withFiles = Object.values(ARTIFACTS).filter((a) => a.backdrop)
  expect(withFiles.length).toBeGreaterThanOrEqual(Object.keys(places).length)
  for (const a of withFiles) {
    expect(a.kind, a.id).toBe('photo')
    for (const f of Object.values(a.backdrop)) expect(shipped(f), `${a.id}: ${f}`).toBe(true)
  }
})

test('every Moments thumbnail is declared and shows its own image; only a declared `none` shows the icon', () => {
  const moments = momentsIndex(INDUCTEES, GENERATED)
  let n = 0
  for (const m of moments) {
    expect(LOCK.records, `${m.slug}/${m.chapterId}`).toContain(`moments/${m.slug}/${m.chapterId}:${m.thumbMediaId || 'none'}`)
    if (!m.thumbMediaId) continue
    n++
    const src = thumbSrc(m.thumbMediaId)
    expect(src, `${m.slug}/${m.chapterId}: ${m.thumbMediaId} has no image`).toBeTruthy()
    expect(shipped(src), `${m.slug}/${m.chapterId}: ${src}`).toBe(true)
  }
  expect(n).toBeGreaterThan(30)
  // the icon is only ever the declared state, never a record that lost its image
  expect(moments.filter((m) => !m.thumbMediaId).length).toBe(LOCK.records.filter((r) => r.startsWith('moments/') && r.endsWith(':none')).length)
})

// round 9 fix round 7 (Codex review 6): the lock is regenerated by script, so a thumbnail lost and the lock
// regenerated would pass the test above. The chapters that may show the icon are a hand-written list
// (moments/noThumb.js), each with its reason; any other chapter without a thumbnail fails here.
test('only the chapters in NO_THUMB show the kind icon, each with its reason', () => {
  const none = momentsIndex(INDUCTEES, GENERATED)
    .filter((m) => !m.thumbMediaId)
    .map((m) => `${m.slug}/${m.chapterId}`)
    .sort()
  expect(none, 'chapters with no Moments thumbnail').toEqual(Object.keys(NO_THUMB).sort())
  expect(LOCK.records.filter((r) => r.startsWith('moments/') && r.endsWith(':none')).sort()).toEqual(Object.keys(NO_THUMB).map((k) => `moments/${k}:none`).sort())
  for (const [k, why] of Object.entries(NO_THUMB)) expect(why.length, `${k}: the reason it has no thumbnail`).toBeGreaterThan(40)
})

test('every bound record resolves to a record, and every series lists its members', () => {
  for (const [slug, tour] of Object.entries(INDUCTEES))
    for (const c of tour.chapters)
      for (const s of c.stops) {
        // the lock's own keys (shownRecords.js): a stop named so would read as a map or backdrop entry
        expect(['map', 'backdrop'], `${slug}/${c.id}/${s.id}`).not.toContain(s.id)
        if (!s.artifact && !s.art) continue
        const art = recordOfStop(s)
        expect(art, `${slug}/${c.id}/${s.id}: ${s.artifact}`).toBeTruthy()
        if (art.kind === 'series') expect(art.letters?.length, `${art.id}`).toBeGreaterThan(1)
      }
})

test("a record line names only records shown where it is spoken (a stop's record or series, or the map's photographs)", () => {
  let n = 0
  for (const [slug, tour] of Object.entries(INDUCTEES))
    for (const c of tour.chapters) {
      for (const s of c.stops) {
        const art = recordOfStop(s)
        const shown = new Set([art?.id, ...(art?.letters || [])].filter(Boolean))
        for (const key of s.clip?.keys || []) {
          const l = lineOf(key)
          if (l?.kind !== 'record') continue
          n++
          for (const m of l.media_ids) expect(shown.has(m) || (art?.kind === 'series' && shown.has(art.id)), `${slug}/${c.id}/${s.id} ${key}: ${m}`).toBe(true)
        }
      }
      const res = new Set((c.map?.resources || []).flatMap((r) => r.media || []))
      for (const key of c.map?.narration?.keys || []) {
        const l = lineOf(key)
        if (l?.kind !== 'record') continue
        n++
        for (const m of l.media_ids) expect(res.has(m), `${slug}/${c.id} map ${key}: ${m}`).toBe(true)
      }
    }
  expect(n).toBeGreaterThan(80)
  // (the series' members are records of their own)
  expect(artifactById('EIN-SERIES-BRUNAUER').letters.every((m) => artifactById(m))).toBe(true)
})

// Owner rulings 2026-11-02: a record is shown in the chapter that holds its matched fact. Lamarr's citizenship is in
// "Later life" (legacy), not a chapter of its own: LAM-F-0113 (naturalized, 1953; verified) is that chapter's first
// fact, and the 1953 Evening star page (LAM-M-0039) is its stop there, carrying the fact, before the closing's death
// lines. (Not moved, because the move breaks a rule or the fact is not verified: see round9-B-report.md fix round 7b.)
const PLACEMENTS = [{ slug: 'lamarr', chapter: 'legacy', stop: 'paper1953', record: 'LAM-M-0039', fact: 'LAM-F-0113', first: true }]
test('records sit in the chapter that holds their matched fact (owner rulings 2026-11-02)', async () => {
  const { default: INDEX } = await import('./facts.generated.json')
  for (const p of PLACEMENTS) {
    const tag = `${p.slug}/${p.chapter}/${p.stop}`
    const c = INDUCTEES[p.slug].chapters.find((x) => x.id === p.chapter)
    expect(c, tag).toBeTruthy()
    expect(INDEX.facts[p.fact], `${p.fact} is verified`).toBeTruthy()
    expect(c.factIds, tag).toContain(p.fact)
    if (p.first) expect(c.factIds[0], `${tag}: the chapter's first fact`).toBe(p.fact)
    const s = c.stops.find((x) => x.id === p.stop)
    expect(s && recordOfStop(s)?.id, tag).toBe(p.record)
    expect(s.clip?.factIds || [], `${tag}: the stop carries the fact`).toContain(p.fact)
    // no other chapter shows the record
    const elsewhere = Object.entries(INDUCTEES).flatMap(([slug, t]) => t.chapters.filter((x) => !(slug === p.slug && x.id === p.chapter) && x.stops.some((st) => recordOfStop(st)?.id === p.record)).map((x) => `${slug}/${x.id}`))
    expect(elsewhere, `${p.record} shown elsewhere`).toEqual([])
    // declared where it is shown (the closing's death lines come after every stop; storyOrder.test.js keeps the order)
    expect(LOCK.records, tag).toContain(`${p.slug}/${p.chapter}/${p.stop}:${p.record}`)
  }
})
