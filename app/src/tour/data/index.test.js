// "Next inductee" (owner feedback round 9) follows the landing's scroll order, and wraps after the last.
import { test, expect } from 'vitest'
import { INDUCTEES, INDUCTEE_ORDER, nextInductee } from './index.js'
import LANDING from '../../landing/data/inductees.json'

test('the next inductee follows the landing order and wraps to the first', () => {
  expect(INDUCTEE_ORDER).toEqual(LANDING.map((p) => p.slug))
  expect([...INDUCTEE_ORDER].sort()).toEqual(Object.keys(INDUCTEES).sort())
  for (const [i, slug] of INDUCTEE_ORDER.entries()) expect(nextInductee(slug)).toBe(INDUCTEE_ORDER[(i + 1) % INDUCTEE_ORDER.length])
  expect(nextInductee(INDUCTEE_ORDER[INDUCTEE_ORDER.length - 1])).toBe(INDUCTEE_ORDER[0])
  expect(nextInductee('lamarr-demo')).toBeNull()
})
