// The guide's wayfinding lines in a room (phrases.js): each stop speaks its own intro; a stop with no line of its own is
// an error in development and tests, never another stop's intro (Codex review 2)
import { expect, test } from 'vitest'
import { createPhrasebook } from './phrases.js'
import { INDUCTEES } from './data/index.js'
import LINES from '../shared/guide/lines.json'

test('a stop with no intro or nudge of its own fails loudly', () => {
  const book = createPhrasebook('naismith-robinson-gym')
  expect(() => book.intro('no-such-stop')).toThrow(/no intro/)
  expect(() => book.nudge(['no-such-stop'])).toThrow(/no nudge/)
})

test('every stop of every room tour speaks its own intro and nudge', () => {
  for (const tour of Object.values(INDUCTEES))
    for (const c of tour.chapters)
      if (c.place.tier === 'room' && c.stops.length) {
        // (Einstein's study uses the tour-level lists, as phrases.js does)
        const own = LINES.tour.rooms[c.place.room.id] || LINES.tour
        const book = createPhrasebook(c.place.room.id)
        for (const s of c.stops) {
          expect(own?.intros?.[s.id], `${c.place.room.id}/${s.id}`).toContain(book.intro(s.id).text)
          expect(own?.nudges?.[s.id], `${c.place.room.id}/${s.id}`).toContain(book.nudge([s.id]).text)
        }
      }
})

// Codex review 3: in production a stop with no nudge says nothing (no generic "done" line in its place)
test('in production a missing intro or nudge says nothing', async () => {
  const { vi } = await import('vitest')
  vi.stubEnv('DEV', false)
  try {
    const book = createPhrasebook('naismith-robinson-gym')
    expect(book.intro('no-such-stop')).toBeNull()
    expect(book.nudge(['no-such-stop'])).toBeNull()
  } finally {
    vi.unstubAllEnvs()
  }
})
