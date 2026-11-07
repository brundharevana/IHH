import { test, expect } from 'vitest'
import { storyOrderErrors, yearsSaid, playOrder } from './storyOrder.js'

const narration = {
  x: {
    chapters: {
      later: { opening: { text: 'Washington, 2022. She died in Washington.' } },
      1: {
        lines: [
          { cue: 'c1', text: 'On April 6, 2010, the President greeted her.' },
          { cue: 'c2', text: 'She was a diplomat.' },
          { cue: 'c3', text: 'From 1993 to 1997, she served at the United Nations.' },
          { cue: 'c4', text: 'Patent 2,292,387 was granted.' },
        ],
      },
    },
  },
}
const ch = (stops, extra = {}) => ({ id: 'later', kind: 'later', place: { tier: 'gallery' }, stops, ...extra })
const k = (cue) => ({ keys: [`x:1:${cue}`] })

test('a line says the years it says aloud; a patent number is not a year', () => {
  expect(yearsSaid('From 1993 to 1997, she served.')).toEqual([1993, 1997])
  expect(yearsSaid('Patent 2,292,387, and 11805 Bellagio Road')).toEqual([])
  expect(yearsSaid('On April 6, 2010, she was there.')).toEqual([2010])
})

test('a dated line before an earlier one in play order fails (an opening that announces the death, then 2010)', () => {
  const tour = { slug: 'x', chapters: [ch([{ id: 'p', clip: k('c1') }])] }
  expect(storyOrderErrors(tour, narration)).toEqual(['x/later: stop p (x:1:c1, 2010) comes after opening (x:ch:later:opening, 2022)'])
})

test('undated lines are exempt, and forward order passes', () => {
  const tour = { slug: 'x', chapters: [ch([{ id: 'a', clip: k('c3') }, { id: 'b', clip: k('c2') }, { id: 'c', clip: k('c1') }], { opening: { keys: ['x:1:c4'] } })] }
  expect(storyOrderErrors(tour, narration)).toEqual([])
})

test('play order: opening, arrival, each stop (its clip, then its record), closing', () => {
  const c = ch([{ id: 'a', clip: k('c1') }], { narration: k('c2'), closing: k('c3') })
  expect(playOrder('x', c).map((p) => p.where)).toEqual(['opening', 'arrival', 'stop a', 'closing'])
})
