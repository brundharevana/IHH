import { test, expect } from 'vitest'
import { roomRecordStops, recordImage, fitRecord } from './roomRecords.js'
import { INDUCTEES } from '../data/index.js'
import { ARTIFACTS } from '../data/artifacts.js'

const rooms = () =>
  Object.entries(INDUCTEES).flatMap(([slug, t]) => (t.chapters || []).filter((c) => c.place.tier === 'room').map((c) => [`${slug}/${c.id}`, c.place.room]))

// feedback round 7: a room stop that refers to a record shows it in the scene
test('every room stop with a record shows that record at the stop (its cleared image, or a labelled card when link-only)', () => {
  let n = 0
  for (const [tag, room] of rooms()) {
    for (const r of roomRecordStops(room)) {
      n++
      const where = `${tag}/${r.id}`
      expect(r.problem, where).toBeNull()
      if (r.prop) continue
      expect(r.display, `${where}: no display`).toBeTruthy()
      // an image only for a cleared record; a link-only record never has one; a panel prints its facts
      if (r.panel) expect(r.src, `${where}: a panel shows an image`).toBeNull()
      else if (r.linkOnly) expect(r.src, `${where}: a link-only record shows an image`).toBeNull()
      else expect(r.src, `${where}: no image`).toMatch(/^\/media\//)
      // at the stop: inside (or on) its anchor's box when it has one
      const a = room.artifacts.find((s) => s.id === r.id)
      if (a.anchor) for (let k = 0; k < 3; k++) expect(Math.abs(r.display.pos[k] - a.anchor.pos[k]), `${where}: away from its anchor`).toBeLessThanOrEqual(a.anchor.size[k] / 2 + 0.6)
    }
  }
  expect(n).toBeGreaterThan(20)
})

test('the room shows a link-only record as a card, never an image; a model record needs its prop', () => {
  const linkOnly = Object.values(ARTIFACTS).find((a) => a.linkOnly)
  expect(recordImage(linkOnly)).toBeNull()
  const [r] = roomRecordStops({ artifacts: [{ id: 'x', name: 'X', art: linkOnly, anchor: { pos: [0, 1.4, -2], size: [0.5, 0.4, 0.05] } }], poses: { desktop: { start: { pos: [0, 1.6, 3] } } } })
  expect(r.problem).toBeNull()
  expect(r.src).toBeNull()
  expect(r.display).toMatchObject({ mount: 'stand', rotY: 0 })
  const model = Object.values(ARTIFACTS).find((a) => a.kind === 'model' && !a.test)
  expect(roomRecordStops({ artifacts: [{ id: 'm', art: model, anchor: { pos: [0, 1, 0], size: [0.4, 0.4, 0.05] } }] })[0].problem).toMatch(/needs a prop/)
  const doc = Object.values(ARTIFACTS).find((a) => a.kind === 'document' && !a.linkOnly)
  expect(roomRecordStops({ artifacts: [{ id: 'd', art: doc, nodes: ['artifact_desk'] }] })[0].problem).toMatch(/give it a display/)
})

test('a derived display faces the camera across the anchor and fits the image inside its box', () => {
  const doc = Object.values(ARTIFACTS).find((a) => a.kind === 'photo' && !a.linkOnly)
  const at = (anchor, eye) => roomRecordStops({ artifacts: [{ id: 'p', art: doc, anchor }], poses: { desktop: { p: { pos: eye } } } })[0].display
  expect(at({ pos: [0, 1.4, -2], size: [0.5, 0.4, 0.05] }, [0, 1.6, -5]).rotY).toBeCloseTo(Math.PI)
  expect(at({ pos: [2, 1.4, 0], size: [0.05, 0.4, 0.5] }, [0, 1.6, 0]).rotY).toBeCloseTo(-Math.PI / 2)
  expect(at({ pos: [2, 2.4, 0], size: [0.05, 0.4, 0.5] }, [0, 1.6, 0]).mount).toBe('wall')
  expect(fitRecord([0.5, 0.4], 2)).toEqual([0.5, 0.25])
  expect(fitRecord([0.5, 0.4], 0.5)).toEqual([0.2, 0.4])
})

test('a labelled panel stop stands in the room with its title and facts; without them, or a place to stand, it is a problem', () => {
  const eye = { desktop: { start: { pos: [0, 1.6, 3] } } }
  const ok = roomRecordStops({ artifacts: [{ id: 'p', name: 'P', panel: { title: 'A panel', factIds: ['EIN-F-0076'] }, anchor: { pos: [0, 1.3, -2], size: [0.6, 0.8, 0.05] } }], poses: eye })[0]
  expect(ok.problem).toBeNull()
  expect(ok.panel.title).toBe('A panel')
  expect(ok.display).toMatchObject({ mount: 'stand', rotY: 0 })
  expect(roomRecordStops({ artifacts: [{ id: 'p', panel: { title: 'A panel', factIds: [] }, anchor: { pos: [0, 1.3, -2], size: [0.6, 0.8, 0.05] } }] })[0].problem).toMatch(/title and the fact ids/)
  expect(roomRecordStops({ artifacts: [{ id: 'p', panel: { title: 'A panel', factIds: ['EIN-F-0076'] }, nodes: ['artifact_x'] }] })[0].problem).toMatch(/anchor or a display/)
  // a gallery's panel stop (panel: true) is the gallery's own wall panel, not a room panel
  expect(roomRecordStops({ artifacts: [{ id: 'g', panel: true }] })).toEqual([])
})

// Codex review 3: a stop whose record binding was removed dropped out of the list the gates checked, so a record
// could vanish while every record gate passed. A stop that declares a record (a display or a free anchor, or a record
// line in its clip) but binds none is a problem, and the declared list keeps it.
import { declaredRecordIds } from './roomRecords.js'
test('a stop that declares a record but binds none is a problem, and stays in the declared list', () => {
  const room = { artifacts: [
    { id: 'unbound', name: 'A page', clip: { keys: ['x:21:r1'], factIds: [] }, display: { mount: 'wall', pos: [0, 1.5, -2], rotY: 0, size: [0.5, 0.7] } },
    { id: 'desk', nodes: ['artifact_desk'], name: 'The desk', clip: { keys: ['x:2:c3'], factIds: ['X-F-1'] } },
  ] }
  expect(declaredRecordIds(room)).toEqual(['unbound'])
  const [r] = roomRecordStops(room)
  expect(r?.id).toBe('unbound')
  expect(r.problem).toMatch(/binds no record/)
})
