import { expect, test } from 'vitest'
import { segHitsRect } from './labelGeom.js'

const r = { l: 10, r: 50, t: 10, b: 30 }
test('a segment crossing a label is a hit; one beside it, or ending short of it, is not', () => {
  expect(segHitsRect(0, 20, 60, 20, r)).toBe(true) // straight through
  expect(segHitsRect(20, 0, 30, 40, r)).toBe(true) // down through
  expect(segHitsRect(20, 15, 25, 18, r)).toBe(true) // wholly inside
  expect(segHitsRect(0, 0, 60, 5, r)).toBe(false) // above
  expect(segHitsRect(0, 0, 8, 40, r)).toBe(false) // to the left
  expect(segHitsRect(0, 40, 12, 28, r)).toBe(true) // clips a corner
  expect(segHitsRect(0, 40, 9, 31, r)).toBe(false) // stops short of the corner
})

import { clearShift, intoView } from './labelGeom.js'
test('a badge over a keep-clear area moves the least way out, sideways first, else above it, inside the view', () => {
  const guide = { left: 50, right: 120, top: 400, bottom: 600 }
  const badge = { l: 100, r: 138, t: 450, b: 488 }
  expect(clearShift(badge, [guide], 390)).toEqual({ dx: 120 + 6 - 100, dy: 0 }) // to her right
  expect(clearShift({ l: 200, r: 238, t: 450, b: 488 }, [guide], 390)).toEqual({ dx: 0, dy: 0 }) // clear already
  // at the left edge the only sideways way out is right
  expect(clearShift({ l: 40, r: 78, t: 450, b: 488 }, [{ left: 0, right: 100, top: 400, bottom: 600 }], 390)).toEqual({ dx: 66, dy: 0 })
  // a row of records across the whole width: the badge goes above them (round 9 final review: Madrid's badge 3)
  const row = [{ left: 0, right: 200, top: 530, bottom: 600 }, { left: 200, right: 390, top: 530, bottom: 600 }]
  expect(clearShift({ l: 340, r: 378, t: 520, b: 558 }, row, 390, 844)).toEqual({ dx: 0, dy: 530 - 6 - 558 })
})
test('a badge partly out of the view comes back inside; one wholly out stays out', () => {
  expect(intoView({ l: -30, r: 8, t: 566, b: 604 }, 390, 844)).toEqual({ dx: 36, dy: 0 })
  expect(intoView({ l: -130, r: -92, t: 566, b: 604 }, 390, 844)).toEqual({ dx: 0, dy: 0 })
  expect(intoView({ l: 100, r: 138, t: 830, b: 868 }, 390, 844)).toEqual({ dx: 0, dy: -30 })
})

import { layoutBadges } from './labelGeom.js'
test('badges at the edge come inside and are spread apart, not stacked (round 9 fix round 2: Albright, phone)', () => {
  // two badges both past the left edge, overlapping: inside the view, side by side, in order
  const off = layoutBadges([{ l: -10, r: 28, t: 362, b: 400 }, { l: 4, r: 42, t: 370, b: 408 }], 390, 844)
  const a = { l: -10 + off[0].dx, r: 28 + off[0].dx }
  const b = { l: 4 + off[1].dx, r: 42 + off[1].dx }
  expect(a.l).toBeGreaterThanOrEqual(6)
  expect(b.l).toBeGreaterThanOrEqual(a.r + 6)
  // a badge wholly out of view stays out; one alone and clear stays put
  expect(layoutBadges([{ l: -100, r: -62, t: 10, b: 48 }, { l: 200, r: 238, t: 10, b: 48 }], 390, 844)).toEqual([{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }])
  // badges in a row but at different heights (no overlap) are left alone
  expect(layoutBadges([{ l: 100, r: 138, t: 10, b: 48 }, { l: 110, r: 148, t: 300, b: 338 }], 390, 844)).toEqual([{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }])
})

test('a run kept inside the view at its edge does not land on the badge before it (Security Council, phone)', () => {
  const rects = [{ l: 210, r: 248, t: 354, b: 392 }, { l: 275, r: 313, t: 363, b: 401 }, { l: 333, r: 371, t: 363, b: 401 }, { l: 386, r: 424, t: 365, b: 403 }]
  const off = layoutBadges(rects, 390, 844)
  const placed = rects.map((r, i) => ({ l: r.l + off[i].dx, r: r.r + off[i].dx })).sort((a, b) => a.l - b.l)
  for (let i = 1; i < placed.length; i++) expect(placed[i].l).toBeGreaterThanOrEqual(placed[i - 1].r + 6 - 1e-6)
  expect(placed[placed.length - 1].r).toBeLessThanOrEqual(390 - 6 + 1e-6)
})

import { visibleLength } from './labelGeom.js'
test("a route's length on screen counts only what lies inside the view (Codex review 2)", () => {
  // 300 px of route, of which 100 px inside a 390 x 844 view
  expect(visibleLength([[-200, 400], [100, 400]], 390, 844)).toBeCloseTo(100)
  // wholly off screen
  expect(visibleLength([[-500, -50], [-100, -50]], 390, 844)).toBe(0)
  // wholly inside
  expect(visibleLength([[10, 10], [10, 110], [60, 110]], 390, 844)).toBeCloseTo(150)
})
