import { test, expect } from 'vitest'
import { ALBRIGHT, LOUNGE_LABEL, ROTUNDA_LABEL, PRAGUE_NOTE, OVAL_NOTE, TRUMAN_NOTE, PRAGUE_VIEW, OVAL_VIEW, TRUMAN_VIEW, OVAL_ROOM_LABEL, SWEARING_IN_NOTE, EAST_ROOM_LABEL } from './albright.js'
import { CHAPTER_KINDS, validateTour, resolveChapter } from './chapters.js'
import { ARTIFACTS, LINK_ONLY, artifactById } from './artifacts.js'
import { resolveStop } from './index.js'
import INDEX from './facts.generated.json'
import NARRATION from '../../../../assets-src/audio/narration/albright.json'

const recordOf = (s) => s.art || (s.artifact ? artifactById(s.artifact) : null)
const byId = (id) => ALBRIGHT.chapters.find((c) => c.id === id)
const yearsIn = (s) => (s.match(/\b(19|20)\d\d\b/g) || []).map(Number)
// a chapter's own opening may begin with a room note: its voiced opening line is the ':ch:' key
const openingEntry = (c) => NARRATION.chapters[c.opening ? c.opening.keys.find((k) => k.includes(':ch:')).split(':')[2] : c.kind]
const PIN_PHOTOS = ['ALB-M-0057', 'ALB-M-0059', 'ALB-M-0061', 'ALB-M-0070', 'ALB-M-0071', 'ALB-M-0017']

test('Albright passes validateTour against the verified index', () => {
  expect(validateTour(ALBRIGHT, INDEX)).toEqual([])
})

test('every chapter has a year, a known kind and an opening line voiced for it', () => {
  for (const c of ALBRIGHT.chapters) {
    expect(Number.isInteger(c.year), c.id).toBe(true)
    expect(CHAPTER_KINDS).toContain(c.kind)
    const entry = openingEntry(c)
    expect(entry?.opening?.text, c.id).toBeTruthy()
    if (c.opening) {
      expect(entry.kind, c.id).toBe(c.kind)
      expect(c.opening.factIds).toEqual(entry.opening.fact_ids)
    }
  }
  const kinds = ALBRIGHT.chapters.map((c) => c.kind)
  ALBRIGHT.chapters.forEach((c, i) => expect(!!c.opening, c.id).toBe(kinds.indexOf(c.kind) !== i))
})

test('the chapter year is its main fact year, and no listed fact is dated before it', () => {
  for (const c of ALBRIGHT.chapters) {
    expect(yearsIn(INDEX.facts[c.factIds[0]].claim), c.id).toContain(c.year)
    for (const f of c.factIds) for (const y of yearsIn(INDEX.facts[f].claim)) expect(y, `${c.id} ${f}`).toBeGreaterThanOrEqual(c.year)
  }
})

test('her first spoken line names her before any pronoun', () => {
  const first = ALBRIGHT.chapters[0]
  expect(first.map).toBeNull()
  // round 8: a human sentence that names her first (not a dateline)
  expect(NARRATION.chapters[first.kind].opening.text).toMatch(/^Madeleine Albright was born in Prague\b/)
})

test('chapter ids are unique and resolve by id, kind (first of its kind) and fact id', () => {
  const ids = ALBRIGHT.chapters.map((c) => c.id)
  expect(new Set(ids).size).toBe(ids.length)
  ALBRIGHT.chapters.forEach((c, i) => {
    expect(resolveChapter(ALBRIGHT, c.id)).toBe(i)
    expect(resolveChapter(ALBRIGHT, c.kind)).toBe(ALBRIGHT.chapters.findIndex((x) => x.kind === c.kind))
  })
  expect(resolveChapter(ALBRIGHT, 'ALB-F-0200')).toBe(ids.indexOf('history'))
})

test('no chapter rests on a single-source fact: no leaving, education or first-work chapter; the London shelter is not used', () => {
  const kinds = ALBRIGHT.chapters.map((c) => c.kind)
  for (const k of ['leaving', 'education', 'first-work']) expect(kinds).not.toContain(k)
  const rooms = ALBRIGHT.chapters.filter((c) => c.place.tier === 'room').map((c) => c.place.room.id)
  expect(rooms).toEqual(['albright-ss-america', 'albright-archives-rotunda', 'albright-un-security-council', 'albright-oval-office-1993', 'albright-east-room-2012'])
  expect(rooms).not.toContain('albright-london-shelter')
  // nothing she is shown or told rests on a fact outside the verified index
  for (const c of ALBRIGHT.chapters) for (const f of c.factIds) expect(INDEX.facts[f], f).toBeTruthy()
  const said = JSON.stringify(NARRATION)
  expect(said).not.toMatch(/London|S\.?S\.? America|eagle|brooch|pin\b/i)
})

test('every record a stop opens exists, may be displayed (never link-only) and quotes verified facts', () => {
  for (const c of ALBRIGHT.chapters)
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
        for (const p of [...(r.pages || []), ...(r.photos || [])]) {
          expect(p.src, r.id).toMatch(/^\/media\/albright\/ALB-M-\d{4}(-p\d)?\.webp$/)
          if (p.back) expect(p.back, r.id).toMatch(/^\/media\/albright\/ALB-M-\d{4}-p\d\.webp$/)
        }
      }
    }
})

test('every Albright record is a chapter stop or a place photograph on the map, except the link-only letters and brooch page', () => {
  // round 9: a place photograph pinned on the arrival map is reached from the map (ChapterPlayer opens it in the viewer)
  const onMap = ALBRIGHT.chapters.flatMap((c) => (c.map?.resources || []).flatMap((r) => r.media))
  const reached = new Set([...ALBRIGHT.chapters.flatMap((c) => c.stops.flatMap((s) => [recordOf(s)?.id, ...(recordOf(s)?.letters || [])]).filter(Boolean)), ...onMap])
  for (const id of Object.keys(ARTIFACTS).filter((k) => k.startsWith('ALB-'))) expect(reached.has(id) || LINK_ONLY.has(id), id).toBe(true)
  for (const id of ['ALB-M-0054', 'ALB-M-0056', 'ALB-M-0027']) {
    expect(LINK_ONLY.has(id), id).toBe(true)
    expect(reached.has(id), id).toBe(false)
    expect(ARTIFACTS[id].pages || ARTIFACTS[id].photos, id).toBeUndefined()
  }
})

test('pins in official photographs: the six federal photographs are records; no caption names a pin; only the swearing-in links the brooch', () => {
  for (const id of PIN_PHOTOS) {
    const art = ARTIFACTS[id]
    expect(art, id).toBeTruthy()
    expect(INDEX.media[id].embeddable, id).toBe(true)
    const shown = JSON.stringify({ ...art, links: undefined, source: undefined })
    expect(shown, id).not.toMatch(/\bpin\b|brooch|eagle/i)
  }
  const withLinks = Object.values(ARTIFACTS).filter((a) => a.slug === 'albright' && a.links?.length)
  expect(withLinks.map((a) => a.id)).toEqual(['ALB-M-0059'])
  const [link] = ARTIFACTS['ALB-M-0059'].links
  expect(link.label).toBe('See the brooch at the holder')
  expect(LINK_ONLY.has(link.mediaId)).toBe(true)
  expect(link.href).toBe(ARTIFACTS[link.mediaId].source)
  // the one fact that names the brooch is not verified, so it is not in the index
  expect(Object.values(INDEX.facts).some((f) => /eagle pin/.test(f.claim))).toBe(false)
})

test('the typed memorandum is shown by the owner ruling; the handwritten letters are not', () => {
  expect(INDEX.media['ALB-M-0055'].ownerRuling).toMatch(/official federal record/)
  expect(ARTIFACTS['ALB-M-0055'].pages).toHaveLength(3)
  expect(ARTIFACTS['ALB-M-0055'].lines).toEqual([])
  for (const id of ['ALB-M-0054', 'ALB-M-0056']) expect(INDEX.media[id], id).toBeUndefined()
})

test('labels say what the source photographs show and never place her where no verified fact does', () => {
  const lounge = byId('arriving').place.room
  expect(lounge.labelText).toBe(LOUNGE_LABEL)
  expect(LOUNGE_LABEL).toMatch(/not known to have been in this room/)
  expect(LOUNGE_LABEL).toMatch(/No verified source on file names the ship/)
  expect(LOUNGE_LABEL).not.toMatch(/1948/)
  expect(byId('citizen').place.room.labelText).toBe(ROTUNDA_LABEL)
  expect(ROTUNDA_LABEL).toMatch(/not the place where Albright became a U\.S\. citizen in 1957/)
  expect(byId('big-work').place.room.labelFallback).toMatch(/before her years at the United Nations/)
  expect(PRAGUE_NOTE).toMatch(/no source on file records the address of her birthplace/)
  expect(OVAL_NOTE).toMatch(/January 23, 1997/)
  expect(TRUMAN_NOTE).toMatch(/not a photograph of the ceremony itself/)
  // records shown away from where they were made carry a place note
  for (const [c, id] of [['big-work', 'havel'], ['big-work', 'sheet'], ['big-work', 'hearing'], ['big-work', 'angola'], ['secretary', 'photo'], ['secretary', 'memo'], ['secretary', 'korea'], ['secretary', 'wye'], ['history', 'madrid']])
    expect(byId(c).stops.find((s) => s.id === id)?.placeNote, `${c}/${id}`).toBeTruthy()
})

test('no map leg: the escape fact names countries, not Prague to Belgrade, and nothing states a journey to New York (Codex round 3)', () => {
  // round 9 (owner decision 2026-10-29): the arrival line runs Prague to New York Harbor, un-routed: no journey, no ship
  // and no country standing for a city (the escape fact names countries, so it grounds no line)
  expect(ALBRIGHT.chapters.filter((c) => c.map).map((c) => c.id)).toEqual(['arriving'])
  const m = ALBRIGHT.chapters.find((c) => c.id === 'arriving').map
  expect(m.places.map((p) => p.label)).toEqual(['Prague', 'New York Harbor'])
  expect(m.segments).toEqual([{ routed: false, mode: null }])
  // her flight is told in its own words: in time order, it closes the birth chapter (before the 1948 voyage)
  expect(ALBRIGHT.chapters.find((c) => c.id === 'birth').closing.factIds).toContain('ALB-F-0178')
})

test('every fact a chapter speaks at its place (opening, arrival, closing, stop and record clips) is listed in its factIds', () => {
  for (const c of ALBRIGHT.chapters) {
    const room = c.place.room
    const clips = [c.opening, room?.narration, room?.closing, c.narration, c.closing, ...c.stops.map((s) => s.clip), ...c.stops.map((s) => recordOf(s)?.clip)].filter(Boolean)
    for (const f of clips.flatMap((k) => k.factIds)) expect(c.factIds, `${c.id} ${f}`).toContain(f)
  }
})

test('tiers: five rooms, two photo rooms on cleared photographs, one gallery case (the Oval Office photo room is kept as the fallback)', async () => {
  const tiers = ALBRIGHT.chapters.map((c) => c.place.tier)
  expect(tiers.filter((t) => t === 'room')).toHaveLength(5)
  expect(ALBRIGHT.chapters.filter((c) => c.place.tier === 'photo').map((c) => c.id)).toEqual(['birth', 'history'])
  expect(ALBRIGHT.chapters.filter((c) => c.place.tier === 'gallery').map((c) => c.id)).toEqual(['legacy'])
  const { photoLayout } = await import('../place/photoProjection.js')
  for (const view of [PRAGUE_VIEW, OVAL_VIEW, TRUMAN_VIEW]) {
    expect(INDEX.media[view.mediaId].embeddable, view.mediaId).toBe(true)
    const { cards, far } = photoLayout(view)
    // every proxy stands in front of the backdrop
    for (const c of cards) expect(-c.position.z, `${view.mediaId} ${c.id}`).toBeLessThan(far)
    // and behind the visitor's frame: the guide and the rail stand about 4.2 units out (PhotoRoomStage)
    for (const c of cards) expect(-c.position.z, `${view.mediaId} ${c.id}`).toBeGreaterThan(4.6)
  }
})

test('landing story points and old step links open a chapter', () => {
  expect(resolveStop('albright', 'ALB-F-0023')).toEqual({ chapter: 'secretary', label: 'Secretary of State' })
  expect(resolveStop('albright', 'chamber').chapter).toBe('big-work')
  for (const [key, hit] of Object.entries(ALBRIGHT.storyStops)) expect(ALBRIGHT.chapters.some((c) => c.id === hit.chapter), key).toBe(true)
})

test('the Oval Office room (Task 14c) is the room as photographed in April 1993, not the 1997 swearing-in; the 1997 photograph is a record in it', () => {
  const c = byId('secretary')
  expect(c.place.tier).toBe('room')
  expect(c.place.label).toBe('The Oval Office as photographed in April 1993')
  expect(c.place.room.labelText).toBe(OVAL_ROOM_LABEL)
  expect(OVAL_ROOM_LABEL).toContain(INDEX.facts['ALB-F-0202'].claim.replace(/\.$/, ''))
  expect(OVAL_ROOM_LABEL).toMatch(/not on the day she was sworn in as Secretary of State, January 23, 1997/)
  // the 1993 fact is earlier than the chapter's year: told by the label and the frame's record, never a chapter fact
  expect(c.factIds).not.toContain('ALB-F-0202')
  const stop = (id) => c.stops.find((s) => s.id === id)
  expect(stop('photo').artifact).toBe('ALB-M-0059')
  expect(stop('photo').placeNote).toBe(SWEARING_IN_NOTE)
  expect(SWEARING_IN_NOTE).toMatch(/January 23, 1997/)
  // the basis frame shown is frame 16; frame 08 (ALB-M-0087, rejected: not the Oval Office) is never used
  expect(stop('frame').artifact).toBe('ALB-M-0088')
  expect(INDEX.media['ALB-M-0088'].basisFor).toContain('ALB-F-0202')
  expect(INDEX.media['ALB-M-0087']).toBeUndefined()
  for (const ch of ALBRIGHT.chapters) for (const s of ch.stops) expect(recordOf(s)?.id).not.toBe('ALB-M-0087')
})

test('the East Room (Task 14c): the 2012 ceremony on the verified fact, other honorees in the photographs, her lines kept', () => {
  const c = byId('honoured')
  expect(c.place.tier).toBe('room')
  expect(c.factIds).toContain('ALB-F-0201')
  expect(c.place.room.labelText).toBe(EAST_ROOM_LABEL)
  expect(EAST_ROOM_LABEL).toContain(INDEX.facts['ALB-F-0201'].claim.replace(/\.$/, ''))
  expect(EAST_ROOM_LABEL).toMatch(/she is not in them/)
  expect(EAST_ROOM_LABEL).toMatch(/1904 and 1908/)
  // the opening names the day, her and the room (round 8: a human sentence, not a dateline)
  expect(NARRATION.chapters.honoured.opening.text).toMatch(/^Madeleine Albright was a recipient of the Presidential Medal of Freedom\. On May 29, 2012, eleven years after her farewell remarks as Secretary of State, President Barack Obama presented it during a ceremony in the East Room of the White House\./)
  expect(NARRATION.chapters.honoured.opening.fact_ids).toEqual(['ALB-F-0195', 'ALB-F-0201'])
  // the gallery panel's lines are the room's closing
  // fix round 1 (review A6): her books are on the legacy panel, in one line
  expect(c.place.room.closing.factIds).toEqual(['ALB-F-0044'])
  expect(c.stops.find((s) => s.id === 'photo').artifact).toBe('ALB-M-0082')
  expect(INDEX.media['ALB-M-0082'].basisFor).toContain('ALB-F-0201')
})

test('the secretary opening does not set the 1997 date in the April 1993 room: the room comes first, then the swearing-in', () => {
  const c = byId('secretary')
  // re-review 2: one opening line; the April 1993 room is said by the label and the frame's place note
  expect(c.opening.keys).toEqual(['albright:ch:secretary:opening'])
  expect(c.place.room.labelText).toMatch(/not on the day she was sworn in as Secretary of State, January 23, 1997/)
  expect(c.stops.find((s) => s.id === 'frame').artifact).toBe('ALB-M-0088')
  const text = NARRATION.chapters.secretary.opening.text
  expect(text).not.toMatch(/^The Oval Office, January 23, 1997/)
  // round 8: the Senate's confirmation (no longer at the swearing-in photograph, which does not show it) leads in
  expect(text).toMatch(/^On January 22, 1997, Madeleine Albright was confirmed as Secretary of State by the U\.S\. Senate\. She was sworn in, in the Oval Office, on January 23, 1997/)
  // fix round 1 (review A2): no arrival line repeating her title; the swearing-in photograph tells only itself
  expect(c.place.room.narration).toBeFalsy()
  expect(artifactById('ALB-M-0059').clip).toBeUndefined()
})
