import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { KEEP_OUT, focusRect, hudKeepOut, makeContext, solveNow, spotCheck } from './guideFrame.js'

const room = { bounds: { min: [-5, 0, -5], max: [5, 3, 5] }, obstacles: [[-0.4, -1.4, 0.4, -0.6]] }
const view = { eye: [0, 1.6, 4], look: [0, 1.3, -1], fov: 58, aspect: 1440 / 900 }
const focus = { min: [-0.35, 0.9, -1.05], max: [0.35, 1.6, -0.95] }
// a pillar between the camera and the left half of the room
const pillar = new THREE.Box3(new THREE.Vector3(-2.3, 0, 1.2), new THREE.Vector3(-1.4, 3, 2.0))
const raycast = (a, b) => {
  const dir = b.clone().sub(a)
  const len = dir.length()
  const r = new THREE.Ray(a.clone(), dir.normalize())
  const p = r.intersectBox(pillar, new THREE.Vector3())
  return Boolean(p && p.distanceTo(a) < len - 0.05)
}
const hit = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

describe('guideFrame: where the guide stands for a view', () => {
  it('finds a spot fully on screen, beside the focus, in the room, not hidden', () => {
    const ctx = makeContext({ view, focus, room, raycast, floorAt: () => 0 })
    const r = solveNow(ctx)
    expect(r).not.toBeNull()
    const check = spotCheck(r.at.clone(), ctx)
    expect(check.ok).toBe(true)
    expect(r.rect.x0).toBeGreaterThan(-0.97)
    expect(r.rect.x1).toBeLessThan(0.97)
    expect(r.rect.y0).toBeGreaterThan(-0.97)
    expect(hit(r.rect, focusRect(focus, ctx.camera))).toBe(false)
    expect(raycast(ctx.camera.position, new THREE.Vector3(r.at.x, 1.35, r.at.z))).toBe(false)
  })

  it('rejects a spot the pillar hides, one in front of the focus, and one off screen', () => {
    const ctx = makeContext({ view, focus, room, raycast, floorAt: () => 0 })
    expect(spotCheck(new THREE.Vector3(-2.6, 0, -0.5), ctx).ok).toBe(false)
    expect(spotCheck(new THREE.Vector3(0, 0, 1), ctx).why).toBe('covers the focus')
    expect(spotCheck(new THREE.Vector3(4.5, 0, 3.5), ctx).ok).toBe(false)
  })

  it('rejects a spot where a pole hides one side of her though her middle shows (round 9, the Graben column)', () => {
    const at = new THREE.Vector3(2, 0, 0)
    expect(spotCheck(at.clone(), makeContext({ view, focus, room, floorAt: () => 0 })).ok).toBe(true)
    // a pole across the line to her left shoulder only: every ray down her middle passes it
    const pole = new THREE.Box3(new THREE.Vector3(0.8, 0, 1.95), new THREE.Vector3(0.95, 3, 2.05))
    const poleRay = (a, b) => {
      const dir = b.clone().sub(a)
      const len = dir.length()
      const p = new THREE.Ray(a.clone(), dir.normalize()).intersectBox(pole, new THREE.Vector3())
      return Boolean(p && p.distanceTo(a) < len - 0.05)
    }
    const eye = new THREE.Vector3(...view.eye)
    for (const h of [1.72, 1.35, 0.95, 0.5]) expect(poleRay(eye, new THREE.Vector3(2, h, 0))).toBe(false)
    const r = spotCheck(at.clone(), makeContext({ view, focus, room, raycast: poleRay, floorAt: () => 0 }))
    expect(r.ok).toBe(false)
    expect(r.why).toMatch(/hidden/)
  })

  it('needs a floor to stand on', () => {
    const ctx = makeContext({ view, focus, room, floorAt: (x) => (x < 0 ? null : 0) })
    const r = solveNow(ctx)
    expect(r.at.x).toBeGreaterThan(0)
  })

  it('keeps her upper body above the phone HUD (caption, stops, controls)', () => {
    const ctx = makeContext({ view: { ...view, aspect: 390 / 844, fov: 70 }, focus, room, phone: true, floorAt: () => 0 })
    const r = solveNow(ctx)
    expect(r).not.toBeNull()
    const bottom = KEEP_OUT.phone.find((k) => k.y1 < 0)
    const at = r.at
    const head = new THREE.Vector3(at.x, 1.86, at.z).project(ctx.camera)
    const waist = new THREE.Vector3(at.x, 0.95, at.z).project(ctx.camera)
    expect(waist.y).toBeGreaterThan(bottom.y1)
    expect(head.y).toBeLessThan(0.95)
  })

  it('prefers the room\'s own spot when it frames her', () => {
    const ctx = makeContext({ view, focus: null, room, floorAt: () => 0 })
    const first = solveNow(ctx)
    const prefer = [first.at.x, 0, first.at.z]
    const again = solveNow(ctx, { prefer })
    expect(again.at.distanceTo(new THREE.Vector3(prefer[0], 0, prefer[2]))).toBeLessThan(1e-6)
  })

  it('returns null when nothing works (a closet)', () => {
    const tiny = { bounds: { min: [-0.5, 0, 3.4], max: [0.5, 3, 4.4] }, obstacles: [] }
    expect(solveNow(makeContext({ view, focus, room: tiny }))).toBeNull()
  })
})

describe('hudKeepOut: the HUD panels on the page, in the canvas frame', () => {
  const rect = (left, top, w, h) => ({ left, top, right: left + w, bottom: top + h, width: w, height: h })
  const canvas = { getBoundingClientRect: () => rect(0, 0, 400, 800) }
  it('maps each panel to NDC and gives an empty caption slot a caption height', () => {
    const els = { '[data-hud=title]': rect(0, 0, 200, 100), '.bubble-slot': rect(0, 600, 400, 20) }
    const doc = { querySelector: (q) => (els[q] ? { getBoundingClientRect: () => els[q] } : null) }
    const k = hudKeepOut(canvas, doc)
    expect(k).toHaveLength(2)
    expect(k[0]).toEqual({ x0: -1, x1: 0, y0: 0.75, y1: 1, caption: false })
    expect(k[1].caption).toBe(true)
    // the slot's bottom is 620 px; an empty slot stands for a caption 130 px tall (a phone-width canvas),
    // with 10 px of room above it
    expect(k[1].y0).toBeCloseTo(1 - (620 / 800) * 2, 9)
    expect(k[1].y1).toBeCloseTo(1 - (480 / 800) * 2, 9)
  })
  it('is null without a page', () => {
    expect(hudKeepOut(canvas, { querySelector: () => null })).toBeNull()
    expect(hudKeepOut(null, null)).toBeNull()
  })
})

// round 9 fix round 1: the "whole building" shortcut goes by kind (the stop's data: wide), never by size. A
// record seen close on a 390 px phone fills most of the screen and is still checked in full
describe('focusRect: the middle-quarter shortcut is for whole buildings and landscapes only', () => {
  const phone = { eye: [0, 1.6, 1.1], look: [0, 1.5, 0], fov: 70, aspect: 390 / 844 }
  const record = { min: [-0.35, 1.2, -0.02], max: [0.35, 1.8, 0.02] }
  it('a normal record wider than 55 % of a phone screen is kept whole', () => {
    const ctx = makeContext({ view: phone, focus: record, room, phone: true })
    expect(ctx.focus.x1 - ctx.focus.x0).toBeGreaterThan(1.1) // over 55 % of the screen
    expect(ctx.focus.wide).toBeUndefined()
    // a spot in front of its edge is refused (it would have passed with the middle-quarter cut)
    const edge = new THREE.Vector3(0.25, 0, 0.55)
    expect(spotCheck(edge, ctx).why).not.toBe(undefined)
    expect(spotCheck(edge, ctx).ok).toBe(false)
  })
  it('a building flagged wide is narrowed to its middle quarter', () => {
    const ctx = makeContext({ view: phone, focus: { ...record, wide: true }, room, phone: true })
    expect(ctx.focus.wide).toBe(true)
    expect(ctx.focus.x1 - ctx.focus.x0).toBeCloseTo(0.5, 5)
  })
})

// round 9 fix round 1: the e2e checks her head to her pelvis against the real HUD and the stop badges;
// the solver must judge the same things
describe('guideFrame: the stop badges and the caption keep clear of her upper body', () => {
  it('rejects a spot where a stop badge sits on her head, accepts it with the badge elsewhere', () => {
    const at = new THREE.Vector3(2, 0, 0)
    const base = { view, focus: null, room, floorAt: () => 0, size: { width: 1440, height: 900 } }
    expect(spotCheck(at.clone(), makeContext(base)).ok).toBe(true)
    const onHead = makeContext({ ...base, badges: [[2, 1.6, 0]] })
    const r = spotCheck(at.clone(), onHead)
    expect(r.ok).toBe(false)
    expect(r.why).toBe('under a stop badge')
    expect(spotCheck(at.clone(), makeContext({ ...base, badges: [[-2, 1.6, 0]] })).ok).toBe(true)
    // the solver then finds her another spot
    const s = solveNow(onHead)
    expect(s).not.toBeNull()
    expect(spotCheck(s.at.clone(), onHead).ok).toBe(true)
  })

  it('never lets the caption cross her upper body, even in the relaxed pass', () => {
    const at = new THREE.Vector3(2, 0, 0)
    const ctx = makeContext({ view, focus, room, floorAt: () => 0 })
    const f = spotCheck(at.clone(), { ...ctx, relaxed: true })
    expect(f.ok).toBe(true)
    // a caption panel up to her chest (NDC)
    const chest = f.rect.y0 + 0.7 * (f.rect.y1 - f.rect.y0)
    const caption = { x0: -1, x1: 1, y0: -1, y1: chest, caption: true }
    const r = spotCheck(at.clone(), { ...ctx, relaxed: true, keepOut: [caption] })
    expect(r.ok).toBe(false)
    expect(r.why).toBe('under the HUD')
  })
})

describe('guideFrame: a badge standing above a record', () => {
  it('is judged where it is drawn, half a badge above its point', () => {
    const at = new THREE.Vector3(2, 0, 0)
    const base = { view, focus: null, room, floorAt: () => 0, size: { width: 1440, height: 900 } }
    // a point just above her head: centred there the badge covers her; standing on it, it clears her
    const p = [2, 1.95, 0]
    expect(spotCheck(at.clone(), makeContext({ ...base, badges: [p] })).why).toBe('under a stop badge')
    expect(spotCheck(at.clone(), makeContext({ ...base, badges: [{ at: p, above: true }] })).ok).toBe(true)
  })
})

describe('guideFrame: a thin post between her middle and her shoulder hides her', () => {
  it('is found across her upper body, not only at its middle and its edges (round 9 fix round 3, Hall of Fame)', () => {
    const at = new THREE.Vector3(2, 0, 0)
    const base = { view, focus, room, floorAt: () => 0 }
    expect(spotCheck(at.clone(), makeContext(base)).ok).toBe(true)
    // a 6 cm post 0.15 m to her side along the view's right, between the eye and her
    const ctx = makeContext(base)
    const mid = at.clone().addScaledVector(ctx.right, 0.15)
    const eye = new THREE.Vector3(...view.eye)
    const t = 0.5
    const c = eye.clone().lerp(new THREE.Vector3(mid.x, 1.4, mid.z), t)
    const post = new THREE.Box3(new THREE.Vector3(c.x - 0.03, 0, c.z - 0.03), new THREE.Vector3(c.x + 0.03, 3, c.z + 0.03))
    const postRay = (a, b) => {
      const dir = b.clone().sub(a)
      const len = dir.length()
      const p = new THREE.Ray(a.clone(), dir.normalize()).intersectBox(post, new THREE.Vector3())
      return Boolean(p && p.distanceTo(a) < len - 0.05)
    }
    const r = spotCheck(at.clone(), makeContext({ ...base, raycast: postRay }))
    expect(r.ok).toBe(false)
    expect(r.why).toMatch(/hidden/)
  })
})
