import { test, expect } from 'vitest'
import { INDUCTEES } from './index.js'
test('five inductees are registered', () => {
  expect(Object.keys(INDUCTEES).sort()).toEqual(['albright', 'einstein', 'lamarr', 'muir', 'naismith'])
})

// round 9 review: the landscape exception lets an easel stand on bare ground (e2e/camcheck.mjs); only the
// Hetch Hetchy meadow, which has no built structure, may carry it
test('only the Hetch Hetchy room is flagged a landscape', () => {
  const flagged = []
  for (const tour of Object.values(INDUCTEES))
    for (const c of tour.chapters || [])
      if (c.place?.room?.landscape) flagged.push(c.place.room.id)
  expect(flagged).toEqual(['muir-hetch-hetchy'])
})

// round 9 fix round 1: the guide may overlap the edges of a stop flagged wide (a whole building), so the flag must
// never sit on a record: the e2e would then stop checking most of that record
test('only whole buildings or landscapes are flagged wide, never a record', () => {
  const wide = []
  for (const tour of Object.values(INDUCTEES))
    for (const c of tour.chapters || [])
      for (const s of c.stops || [])
        if (s.wide) {
          wide.push(s.id)
          expect(s.artifact || s.art || s.panel || s.rail || s.at, `${tour.slug}/${c.id}/${s.id}`).toBeFalsy()
          expect(s.nodes?.length, `${s.id} is a modelled building`).toBeGreaterThan(0)
        }
  expect(wide).toEqual(['house'])
})
