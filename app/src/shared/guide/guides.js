// The three museum guides (owner decision 2026-10-17): Microsoft Rocketbox avatars (MIT, see
// app/CREDITS.md) driven by Rocketbox motion capture, each with its own Kokoro voice
// (assets-src/audio/VOICES.md). Every visitor gets one guide at random on the first visit; the pick
// is kept in localStorage and used everywhere (landing guide panel, tour map, rooms). When storage
// is unavailable (private mode, blocked site data) the pick is random per page load.
// ?guide=a|b|c overrides the pick for this page (screenshots, review) without storing it.
// Model URLs carry their content version (?v=, ../assetVersion.js): /models is cached immutable.
import { versioned } from '../assetVersion.js'

export const MOTION = {
  female: versioned('/models/guide-candidates/motion-female.glb'),
  male: versioned('/models/guide-candidates/motion-male.glb'),
}

// clip names in the motion GLBs; per guide so the two women never move in lockstep.
// point: the presentation gesture; `from` / `speed` pick the window where the arm comes up.
const FEMALE_TAKES = {
  idle: 'idle_neutral_01',
  talk: ['gestic_talk_neutral_01', 'gestic_talk_neutral_02'],
  point: { left: 'gestic_presentation_left_01', right: 'gestic_presentation_right_01', from: 1.6, speed: 0.85 },
  nod: 'gestic_listen_accept_01',
}

export const GUIDES = {
  a: {
    id: 'a',
    name: 'Business Female 02',
    url: versioned('/models/guide-candidates/docent-a-business-female-02.glb'),
    motion: 'female',
    takes: FEMALE_TAKES,
    pronoun: 'she',
  },
  b: {
    id: 'b',
    name: 'Business Female 01',
    url: versioned('/models/guide-candidates/docent-b-business-female-01.glb'),
    motion: 'female',
    takes: { ...FEMALE_TAKES, idle: 'idle_breathe_02', talk: ['gestic_talk_relaxed_01', 'gestic_talk_neutral_02'], nod: 'gestic_listen_accept_02' },
    pronoun: 'she',
  },
  c: {
    id: 'c',
    name: 'Business Male 03',
    url: versioned('/models/guide-candidates/docent-c-business-male-03.glb'),
    motion: 'male',
    // the male takes raise the arm later in the clip
    takes: { ...FEMALE_TAKES, idle: 'idle_neutral_02', point: { ...FEMALE_TAKES.point, from: 5.0, speed: 0.8 } },
    // this head's neutral reads tense (low inner brows, wide eyes): relax it a little
    restFace: { AK_03_BrowInnerUp: 0.35, AK_19_EyeSquintLeft: 0.6, AK_20_EyeSquintRight: 0.6, smile: 0.3 },
    pronoun: 'he',
  },
}

const KEY = 'ihh-guide'
const IDS = Object.keys(GUIDES)
let picked = null

function fromUrl() {
  try {
    const g = new URLSearchParams(window.location.search).get('guide')
    return IDS.includes(g) ? g : null
  } catch {
    return null
  }
}

// The visitor's guide id ('a' | 'b' | 'c'), stable for this page and, when storage works, for
// every later visit.
export function guideId() {
  if (picked) return picked
  const url = typeof window !== 'undefined' ? fromUrl() : null
  if (url) return (picked = url)
  let stored = null
  try {
    stored = localStorage.getItem(KEY)
  } catch {
    stored = null
  }
  if (IDS.includes(stored)) return (picked = stored)
  picked = IDS[Math.floor(Math.random() * IDS.length) % IDS.length]
  try {
    localStorage.setItem(KEY, picked)
  } catch {
    /* storage blocked: random per page load */
  }
  return picked
}

export const myGuide = () => GUIDES[guideId()]
