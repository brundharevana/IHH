// Round 9 (owner feedback: a globe-to-map transition for every inductee's arrival, with place photographs; owner
// decision 2026-10-29: the from-to line for every inductee, un-routed where no verified fact states the route).
import { expect, test } from 'vitest'
import { INDUCTEES } from './index.js'
import { validateTour, UNROUTED_NOTE } from './chapters.js'
import { mapFootnote } from '../hud/mapFootnote.js'
import INDEX from './facts.generated.json'

const ARRIVAL = { einstein: 'arriving', lamarr: 'arriving', muir: 'arriving', albright: 'arriving', naismith: 'first-work' }

test('every inductee has one map leg, on the chapter of their arrival in the United States, with place photographs', () => {
  for (const [slug, tour] of Object.entries(INDUCTEES)) {
    const legs = tour.chapters.filter((c) => c.map)
    expect(legs.map((c) => c.id), slug).toEqual([ARRIVAL[slug]])
    const m = legs[0].map
    expect(m.resources?.length, slug).toBeGreaterThan(0)
    for (const r of m.resources) for (const id of r.media) expect(INDEX.media[id]?.embeddable, `${slug} ${id}`).toBe(true)
    expect(validateTour(tour, INDEX).filter((e) => e.startsWith(`${legs[0].id}:`)), slug).toEqual([])
  }
})

test('routed lines only where a verified fact states the route: Einstein by ship, Muir inland; the rest un-routed', () => {
  const kinds = Object.fromEntries(Object.entries(INDUCTEES).map(([slug, t]) => [slug, t.chapters.find((c) => c.map).map.segments.map((s) => (s.routed === false ? 'unrouted' : s.mode || 'routed'))]))
  expect(kinds).toEqual({
    einstein: ['ship'],
    lamarr: ['unrouted'],
    muir: ['unrouted', 'ship', 'routed', 'routed', 'routed'],
    albright: ['unrouted'],
    naismith: ['unrouted'],
  })
})

test('the map note says what each line is', () => {
  const einstein = INDUCTEES.einstein.chapters.find((c) => c.map).map
  expect(mapFootnote(einstein)).toMatch(/^The line follows a journey a verified record states/)
  expect(mapFootnote(einstein)).not.toMatch(/not recorded/)
  const lamarr = INDUCTEES.lamarr.chapters.find((c) => c.map).map
  expect(mapFootnote(lamarr)).toContain(UNROUTED_NOTE)
  expect(mapFootnote(lamarr)).not.toMatch(/follows a journey/)
  const muir = INDUCTEES.muir.chapters.find((c) => c.map).map
  expect(mapFootnote(muir)).toMatch(/The other lines follow a journey/)
  expect(mapFootnote(muir)).toContain(UNROUTED_NOTE)
  expect(mapFootnote(muir)).toMatch(/pinned photographs/)
})

// Codex review (round 9): the canvas called every map "the journey", even where the line is un-routed
import { mapCanvasLabel } from '../hud/mapFootnote.js'
test("the map canvas's accessible label says an un-routed line only joins verified places", () => {
  const leg = (slug) => INDUCTEES[slug].chapters.find((c) => c.map).map
  const ein = mapCanvasLabel(leg('einstein'))
  expect(ein).toMatch(/^Map of the journey: Southampton.*, then New York/)
  expect(ein).not.toMatch(/not recorded/)
  for (const slug of ['lamarr', 'albright', 'naismith']) {
    const l = mapCanvasLabel(leg(slug))
    expect(l).not.toMatch(/journey/)
    expect(l).toMatch(/route is not recorded; the line only joins verified places/)
  }
  expect(mapCanvasLabel(leg('muir'))).toMatch(/where the route is not recorded, the line only joins verified places/i)
})
