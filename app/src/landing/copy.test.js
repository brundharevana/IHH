// Visitor copy (final review I5): the shipped pages no longer call the museum a mockup, no longer say
// the 3D scenes are built from code (the rooms are modelled from photographs), and the embed poster
// does not claim every room is where a turning point happened (galleries, other-day rooms and the
// composers' graves are not).
import { test, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const FILES = ['index.html', 'tour.html', 'embed.html', 'src/landing/Entrance.jsx', 'src/landing/Landing.jsx', 'src/landing/InducteeScroll.jsx']
const read = (f) => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8')

test.each(FILES)('%s: no mockup wording and no overclaim', (f) => {
  const t = read(f)
  expect(t).not.toMatch(/mock-?up/i)
  expect(t).not.toMatch(/built from\s+code/i)
  expect(t).not.toMatch(/where [^.]*turning points? happened/i)
})

test('the embed poster says what the tour holds', () => {
  expect(read('embed.html')).toMatch(/rooms rebuilt from photographs, photo rooms and gallery cases/)
})
