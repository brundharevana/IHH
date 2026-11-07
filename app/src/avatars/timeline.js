// A beat's `take` overrides clip / from / speed per motion file (female, male) or per candidate id.
// One shared, scrubbable timeline (seconds) for all three candidates:
// idle -> talking gestures with lip-sync -> point to the side -> nod -> idle.
// Each beat names a motion-capture clip and the window inside it to play. Weights are computed
// from the time alone, so any moment can be rendered exactly (screenshots use ?t=).

export const SPEECH = { at: 4, from: 0, to: 17.6 } // narration 0..17.6 s (cues c1-c3) starts at t = 4
export const END = 28

export const BEATS = [
  { id: 'idle', label: 'Idle', start: -1, end: 4.3, clip: 'idle_neutral_01', from: 0, loop: true, take: { b: { clip: 'idle_breathe_02' } } },
  // candidate B gets other takes of the same moves, so the two women do not move in lockstep
  { id: 'talk', label: 'Talking', start: 3.7, end: 15.9, clip: 'gestic_talk_neutral_01', from: 1.0, take: { b: { clip: 'gestic_talk_relaxed_01', from: 2.0 } } },
  // the female and male takes of this clip raise the arm at different moments: per-take window
  { id: 'point', label: 'Points to the side', start: 15.3, end: 21.9, clip: 'gestic_presentation_left_01', from: 2.0, speed: 0.85, take: { male: { from: 5.4, speed: 0.8 } } },
  { id: 'nod', label: 'Nod', start: 21.3, end: 23.9, clip: 'gestic_listen_accept_01', from: 0.0, speed: 0.95, take: { b: { clip: 'gestic_listen_accept_02' } } },
  { id: 'rest', label: 'Idle', start: 23.3, end: END + 1, clip: 'idle_neutral_02', from: 0, loop: true },
]

export const MOMENTS = [
  { id: 'idle', label: 'Idle', t: 2.2 },
  { id: 'talk', label: 'Talking', t: 9.6 },
  { id: 'point', label: 'Point', t: 17.6 },
  { id: 'nod', label: 'Nod', t: 22.2 },
]

const FADE = 0.6
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))

// Normalised weights per beat at time t (they always sum to 1, so no bind-pose leaks in).
export function weightsAt(t) {
  const w = BEATS.map((b) => smooth((t - b.start) / FADE) * smooth((b.end - t) / FADE))
  const sum = w.reduce((a, v) => a + v, 0) || 1
  return w.map((v) => v / sum)
}

export function beatAt(t) {
  const w = weightsAt(t)
  let best = 0
  w.forEach((v, i) => { if (v > w[best]) best = i })
  return BEATS[best]
}
