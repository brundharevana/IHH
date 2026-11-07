// Shared, mutable scroll state. GSAP ScrollTrigger writes it; the R3F scene reads it every frame
// in useFrame, so scrolling never causes a React re-render of the 3D tree.
export const scrollState = {
  entrance: 0, // 0..1 progress through the entrance sequence
  arrive: 0, // 0..1 progress from the end of the entrance to the first inductee bay
  bay: 0, // 0..(n-1) float: which inductee bay the camera is at
  warp: 0, // 0..1 tour-transition push (set by the transition, not scroll)
  niche: [0, 1, 2, 3, 4].map(() => ({ v: 0 })), // per inductee niche, 0..1: its light rises as it is revealed
  reduced: false, // prefers-reduced-motion: cut instead of scrub
}

export const ENTRANCES = ['harbor', 'doors', 'threads']

// Owner pick (2026-10-16): the doors. The other entrances stay reachable by URL only
// (?entrance=harbor | threads) until they are removed.
export const DEFAULT_ENTRANCE = 'doors'
export function readEntrance() {
  const v = new URLSearchParams(window.location.search).get('entrance')
  return ENTRANCES.includes(v) ? v : DEFAULT_ENTRANCE
}

export const clamp01 = (x) => Math.min(1, Math.max(0, x))
// remap x from [a,b] to [0,1], clamped
export const range = (x, a, b) => clamp01((x - a) / (b - a))
export const smooth = (x) => x * x * (3 - 2 * x)

// entrance progress at which harbor / threads hand over to the hall (behind the veil)
export const HANDOFF = 0.93
