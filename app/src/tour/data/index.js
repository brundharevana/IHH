// Every inductee's tour (one data file each, shape: ./shape.js) and the stop resolver shared by
// tour.html and the landing's "Tour from here".
import { EINSTEIN } from './einstein.js'
import { NAISMITH } from './naismith.js'
import { MUIR } from './muir.js'
import { ALBRIGHT } from './albright.js'
import { LAMARR } from './lamarr.js'
import { LAMARR_CHAPTERS_DEMO } from './lamarr-chapters-demo.js'

export const INDUCTEES = { einstein: EINSTEIN, naismith: NAISMITH, muir: MUIR, albright: ALBRIGHT, lamarr: LAMARR }

// The landing's scroll order (src/landing/data/inductees.json; index.test.js holds the two together): the
// end of a tour offers the next inductee in it, and after the last, the first (owner feedback round 9).
export const INDUCTEE_ORDER = ['einstein', 'lamarr', 'muir', 'albright', 'naismith']
export function nextInductee(slug) {
  const i = INDUCTEE_ORDER.indexOf(slug)
  return i < 0 ? null : INDUCTEE_ORDER[(i + 1) % INDUCTEE_ORDER.length]
}

// Every tour tour.html can play: the inductees, plus, in development only (the dev server, vitest),
// test tours in the chapter shape (chapters.js) that are not inductees (tour.html?inductee=lamarr-demo,
// the chapter player's e2e walk). The production build has the inductees only.
export const TOURS = import.meta.env.DEV ? { ...INDUCTEES, 'lamarr-demo': LAMARR_CHAPTERS_DEMO } : INDUCTEES

const stepIndex = (tour, id) => Math.max(0, tour.steps.findIndex((s) => s.id === id))

// ?stop= accepts 'map' (the first map leg), 'room' (the first room), a step id, or a landing story
// point's fact id. Returns { step (index), phase ('map' | 'room'), focus, label }.
// A tour in the chapter shape (chapters.js) returns { chapter, label } instead: `chapter` is what
// ChapterPlayer's resolveChapter takes (a chapter id from storyStops, else the stop itself: a chapter
// id, kind or fact id; unknown stops start at the first chapter).
export function resolveStop(inductee, stop) {
  const tour = INDUCTEES[inductee] || EINSTEIN
  if (tour.chapters) {
    const hit = stop ? tour.storyStops?.[stop] : null
    return { chapter: hit ? hit.chapter : stop || null, label: hit?.label || null }
  }
  const at = (i, extra = {}) => ({ step: i, phase: tour.steps[i].type, focus: null, label: null, ...extra })
  if (!stop || stop === 'map') return at(0)
  if (stop === 'room') {
    const i = tour.steps.findIndex((s) => s.type === 'room')
    return at(i < 0 ? 0 : i)
  }
  const byId = tour.steps.findIndex((s) => s.id === stop)
  if (byId >= 0) return at(byId)
  const hit = tour.storyStops?.[stop]
  return hit ? at(stepIndex(tour, hit.step), { focus: hit.focus || null, label: hit.label }) : at(0)
}
