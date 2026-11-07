// Narration clock and mouth shapes for the avatar comparison page.
//
// Loudness: the clip is decoded once (OfflineAudioContext-free decodeAudioData) into a 100 Hz
// RMS envelope, so the mouth is driven by the real recording even when playback is muted or
// blocked (headless screenshots). Shape: the caption text of the active cue is read at the
// estimated position and mapped letter-by-letter to the 15 Oculus visemes. Approximate, but it
// moves through closed (PP), teeth (FF, TH), and the vowel shapes instead of flapping the jaw.
// Production plan: phoneme-aligned visemes generated offline per clip.

export const VISEMES = ['sil', 'PP', 'FF', 'TH', 'DD', 'kk', 'CH', 'SS', 'nn', 'RR', 'aa', 'E', 'I', 'O', 'U']

export function parseVtt(txt) {
  const toSec = (s) => s.split(':').map(Number).reduce((a, v) => a * 60 + v, 0)
  const cues = []
  for (const block of txt.replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n')
    const i = lines.findIndex((l) => l.includes('-->'))
    if (i < 0) continue
    const [a, b] = lines[i].split('-->').map((s) => toSec(s.trim().split(/\s+/)[0]))
    cues.push({ start: a, end: b, text: lines.slice(i + 1).join(' ').trim(), units: toUnits(lines.slice(i + 1).join(' ')) })
  }
  return cues
}

// Letters to viseme units. Digraphs first; spaces and punctuation become short closures.
function toUnits(text) {
  const t = text.toLowerCase()
  const out = []
  for (let i = 0; i < t.length; i++) {
    const two = t.slice(i, i + 2)
    if (two === 'th') { out.push('TH'); i++; continue }
    if (two === 'ch' || two === 'sh') { out.push('CH'); i++; continue }
    if (two === 'ee' || two === 'ea') { out.push('I'); i++; continue }
    if (two === 'oo' || two === 'ou') { out.push('U'); i++; continue }
    const c = t[i]
    if ('aeiouy'.includes(c)) out.push({ a: 'aa', e: 'E', i: 'I', o: 'O', u: 'U', y: 'I' }[c])
    else if ('pbm'.includes(c)) out.push('PP')
    else if ('fv'.includes(c)) out.push('FF')
    else if ('td'.includes(c)) out.push('DD')
    else if ('kgcqx'.includes(c)) out.push('kk')
    else if ('szj'.includes(c)) out.push(c === 'j' ? 'CH' : 'SS')
    else if ('nl'.includes(c)) out.push('nn')
    else if (c === 'r') out.push('RR')
    else if (c === 'w') out.push('U')
    else if (c === 'h') out.push('E')
    else if (/[0-9]/.test(c)) out.push(['aa', 'E', 'nn', 'O'][Number(c) % 4]) // numbers are read aloud
    else out.push('sil')
  }
  return out
}

export class Narration {
  constructor(src, vtt) {
    this.src = src
    this.cues = []
    this.env = null // Float32Array, 100 Hz
    this.audio = typeof Audio !== 'undefined' ? new Audio(src) : null
    if (this.audio) this.audio.preload = 'auto'
    this.ready = Promise.all([
      fetch(vtt).then((r) => r.text()).then((t) => { this.cues = parseVtt(t) }),
      fetch(src).then((r) => r.arrayBuffer()).then((buf) => decode(buf)).then((env) => { this.env = env }).catch(() => {}),
    ])
  }

  level(t) {
    if (!this.env || t < 0) return 0
    const i = Math.floor(t * 100)
    if (i >= this.env.length) return 0
    return this.env[i]
  }

  cueAt(t) {
    return this.cues.find((c) => t >= c.start && t < c.end) || null
  }

  // Mouth for clip time t: { weights: {viseme: 0..1}, level }
  mouth(t) {
    const level = this.level(t)
    const cue = this.cueAt(t)
    if (!cue || level < 0.04) return { v: 'sil', level: 0 }
    const p = (t - cue.start) / (cue.end - cue.start)
    const u = cue.units[Math.min(cue.units.length - 1, Math.floor(p * cue.units.length))]
    return { v: u, level }
  }

  async play(from = 0) {
    if (!this.audio) return false
    try {
      this.audio.currentTime = from
      await Promise.race([this.audio.play(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))])
      return true
    } catch {
      this.audio.pause()
      return false
    }
  }

  stop() {
    this.audio?.pause()
  }
}

async function decode(buf) {
  const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext
  const ctx = new Ctx(1, 44100, 44100)
  const ab = await ctx.decodeAudioData(buf)
  const data = ab.getChannelData(0)
  const step = Math.floor(ab.sampleRate / 100)
  const n = Math.floor(data.length / step)
  const env = new Float32Array(n)
  let peak = 0
  for (let i = 0; i < n; i++) {
    let s = 0
    for (let k = 0; k < step; k++) {
      const v = data[i * step + k]
      s += v * v
    }
    env[i] = Math.sqrt(s / step)
    peak = Math.max(peak, env[i])
  }
  for (let i = 0; i < n; i++) env[i] = Math.min(1, env[i] / (peak * 0.7))
  return env
}
