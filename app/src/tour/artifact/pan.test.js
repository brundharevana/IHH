import { describe, it, test, expect } from 'vitest'
import { ZOOM, ZOOM_MAX, zoomFor, panRange, panByKey, clampPan, isPanKey, PAN_STEP, sheetFitDistance } from './pan.js'

test('the pan range is the zoomed picture overhang past the stage, half each side', () => {
  // a 800 x 600 picture in a 900 x 700 stage at 1.8x: 1440 x 1080 -> 270 px and 190 px each way
  expect(panRange({ w: 900, h: 700 }, { w: 800, h: 600 })).toEqual([(800 * ZOOM - 900) / 2, (600 * ZOOM - 700) / 2])
  // a picture that still fits on one axis does not move on it
  expect(panRange({ w: 2000, h: 700 }, { w: 800, h: 600 })[0]).toBe(0)
})

test('arrow keys pan by a step and stop at the edges of the picture', () => {
  expect(panByKey([0, 0], 'ArrowLeft')).toEqual([PAN_STEP, 0])
  expect(panByKey([0, 0], 'ArrowRight')).toEqual([-PAN_STEP, 0])
  expect(panByKey([0, 0], 'ArrowUp')).toEqual([0, PAN_STEP])
  expect(panByKey([0, 0], 'ArrowDown')).toEqual([0, -PAN_STEP])
  let p = [0, 0]
  for (let i = 0; i < 20; i++) p = panByKey(p, 'ArrowLeft')
  expect(p).toEqual([1, 0])
  expect(panByKey([0.3, 0.2], 'Enter')).toEqual([0.3, 0.2])
  expect(isPanKey('ArrowUp') && !isPanKey('PageDown')).toBe(true)
  expect(clampPan(-3)).toBe(-1)
})

test('a tall picture zooms at least to the stage width', () => {
  // a 172 x 240 portrait in a 358 x 320 stage: 1.8x would leave it 309 px wide
  expect(zoomFor({ w: 358, h: 320 }, { w: 172, h: 240 }) * 172).toBeCloseTo(358, 5)
  // a wide picture keeps the standard zoom
  expect(zoomFor({ w: 900, h: 700 }, { w: 800, h: 600 })).toBe(ZOOM)
  expect(zoomFor(null, null)).toBe(ZOOM)
  // and never past the ceiling, however thin the picture
  expect(zoomFor({ w: 900, h: 300 }, { w: 20, h: 300 })).toBe(ZOOM_MAX)
})

test('model zoom: each step moves closer or back, never past its limits', async () => {
  const { MODEL_ZOOM, fitDistance, zoomTo } = await import('./pan.js')
  const base = fitDistance({ x: 0.4, y: 0.2, z: 0.3 }, 30, 1.6)
  expect(base).toBeGreaterThan(0)
  expect(fitDistance({ x: 0.4, y: 0.2, z: 0.3 }, 30, 0.5)).toBeGreaterThan(base) // a tall screen fits it further back
  let d = base
  for (let i = 0; i < 20; i++) d = zoomTo(d, 1, base)
  expect(d).toBeCloseTo(base * MODEL_ZOOM.near, 9)
  for (let i = 0; i < 20; i++) d = zoomTo(d, -1, base)
  expect(d).toBeCloseTo(base * MODEL_ZOOM.far, 9)
  expect(zoomTo(base, 1, base)).toBeCloseTo(base * MODEL_ZOOM.step, 9)
})

// round 9 fix round 1: + and - zoom a 3D record, but never with Ctrl, Cmd or Alt held (browser zoom stays the browser's)
import { modelZoomKey } from './pan.js'
describe('modelZoomKey', () => {
  it('reads + = as in and - _ as out', () => {
    expect(modelZoomKey({ key: '+' })).toBe(1)
    expect(modelZoomKey({ key: '=' })).toBe(1)
    expect(modelZoomKey({ key: '-' })).toBe(-1)
    expect(modelZoomKey({ key: '_' })).toBe(-1)
    expect(modelZoomKey({ key: 'a' })).toBe(0)
  })
  it('leaves Ctrl, Cmd and Alt + / - to the browser', () => {
    for (const mod of ['ctrlKey', 'metaKey', 'altKey']) {
      expect(modelZoomKey({ key: '+', [mod]: true })).toBe(0)
      expect(modelZoomKey({ key: '-', [mod]: true })).toBe(0)
      expect(modelZoomKey({ key: '=', [mod]: true })).toBe(0)
    }
  })
})

// Codex review (round 9): a zoom press made while the model is still loading was dropped; it waits now
import { zoomPress, zoomReady, zoomTo } from './pan.js'
describe('model zoom pressed while the model loads', () => {
  it('is queued until the whole-object distance is known, then applied in order', () => {
    const s = { base: 0, goal: null }
    zoomPress(s, 1, 0)
    zoomPress(s, 1, 0)
    expect(s.goal).toBe(null)
    s.base = 10
    zoomReady(s, 10)
    expect(s.goal).toBeCloseTo(zoomTo(zoomTo(10, 1, 10), 1, 10))
    expect(s.queued).toEqual([])
  })
  it('applies at once when the model is sized', () => {
    const s = { base: 10, goal: null }
    zoomPress(s, -1, 10)
    expect(s.goal).toBeCloseTo(zoomTo(10, -1, 10))
  })
})

// fix round 12 (owner report: a newspaper's scan cut off at the top in a 1000 x 570 window): a sheet is seen whole
describe('sheetFitDistance', () => {
  const project = (d, w, h, rot, fovDeg, aspect) => {
    const t = Math.tan((Math.PI * fovDeg) / 360)
    const [rx, ry] = rot
    return [-1, 1].flatMap((sx) =>
      [-1, 1].map((sy) => {
        // rotate about x, then y (three's default XYZ order applies x first to the vector last: R = Rx * Ry)
        const x0 = (sx * w) / 2
        const y0 = (sy * h) / 2
        const x1 = x0 * Math.cos(ry)
        const z1 = -x0 * Math.sin(ry)
        const y2 = y0 * Math.cos(rx) - z1 * Math.sin(rx)
        const z2 = y0 * Math.sin(rx) + z1 * Math.cos(rx)
        return [x1 / ((d - z2) * t * aspect), y2 / ((d - z2) * t)]
      }),
    )
  }
  for (const [W, H, w, h] of [[560, 440, 0.62, 1.7], [390, 300, 0.62, 1.7], [900, 300, 1.7, 0.6], [360, 300, 0.73, 0.95]]) {
    test(`a ${w} x ${h} sheet in a ${W} x ${H} stage is whole, inside the reserved margins, and fills it`, () => {
      const fov = 30
      const reserve = { x: 12, y: 30 }
      const d = sheetFitDistance({ w, h }, fov, W, H, reserve, [0.05, -0.12])
      const pts = project(d, w, h, [0.05, -0.12], fov, W / H)
      const mx = 1 - (2 * reserve.x) / W
      const my = 1 - (2 * reserve.y) / H
      for (const [x, y] of pts) {
        expect(Math.abs(x)).toBeLessThanOrEqual(mx + 1e-9)
        expect(Math.abs(y)).toBeLessThanOrEqual(my + 1e-9)
      }
      // and no farther than it must be: one side touches its margin
      const fill = Math.max(...pts.map(([x, y]) => Math.max(Math.abs(x) / mx, Math.abs(y) / my)))
      expect(fill).toBeGreaterThan(0.995)
    })
  }
})
