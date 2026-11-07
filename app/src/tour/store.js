// Tiny tour store (no extra dependency): select primitives only.
import { useSyncExternalStore } from 'react'

const listeners = new Set()
let state = {
  started: false,
  phase: 'map', // 'map' | 'room' (the type of the current step; a chapter's map leg or its place)
  step: 0, // index into the inductee's steps (data/shape.js)
  chapter: 0, // index into the inductee's chapters (data/chapters.js; ChapterPlayer.jsx)
  seg: -1, // map: the segment the marker is on (-1 before it sets off, segments.length on arrival)
  mapVariant: 'unroll', // 'unroll' (owner pick) | 'flat' (URL only) | 'globe' (dev server only)
  mapRun: 0, // bump to replay the travel animation
  travel: 0, // 0..1 progress of the map leg
  focus: null, // artifact id the camera is on
  seen: [],
  letterOpen: false,
  pointAt: null, // [x, y, z] the guide points at
  nod: 0,
  hintCue: 0, // bumped when the guide's opening line invites the visitor to look around
  mapRecord: null, // round 9: the place photograph picked on the map (a media id); the viewer opens on it
}

export const getState = () => state
export function setState(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  listeners.forEach((l) => l())
}
const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const useTour = (sel) => useSyncExternalStore(subscribe, () => sel(state), () => sel(state))
