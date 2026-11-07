// One voice for the visitor's guide (guides.js picks the guide; each guide has its own Kokoro
// voice, assets-src/audio/VOICES.md). Everything the guide says is pre-rendered per voice by
// assets-src/audio/build_guide_audio.py (voice-manifest.json):
//  - say(line): a wayfinding line (lines.json), one whole-line clip; the caption is the line.
//  - playClip({ keys }): narration lines tied to verified facts ("einstein:2:c6", or a chapter
//    opening "einstein:ch:birth:opening"), played one after another with a short pause; captions
//    come from each clip's WebVTT (one cue per sentence).
// The speaker exposes a per-frame mouth sample { level, unit } (unit = Oculus viseme) for the avatar.
//
// Sound only starts after a user gesture (unlock); until then, or when a clip is missing, a line is
// shown as a caption on a reading clock. Mute keeps the clock and captions running silently.
// Nothing waits forever: a caption file or the audio's metadata that does not arrive within
// LOAD_TIMEOUT_MS is given up (the line plays on the caption clock), and a clip whose playback stalls
// for STALL_MS switches to the caption clock where it stopped. The audio element is CORS-mode
// (crossOrigin 'anonymous', set before any src) because unlock() routes it through Web Audio.
//
// Lip-sync here is a mockup approximation: loudness comes from a WebAudio analyser on the clip,
// and the mouth shape from the caption text at the estimated reading position inside the active
// cue (visemes.js). Production plan: offline phoneme-aligned visemes per clip.

import MANIFEST from './voice-manifest.json'
import { guideId } from './guides.js'
import { toUnits, unitAt } from './visemes.js'

// Cues for a line whose caption file could not be loaded: its approved caption text (the manifest's
// `captions`, written by build_guide_audio.py), one cue per sentence, timed by length over the clip.
export function fallbackCues(text, dur) {
  const parts = String(text || '').match(/[^.?!]+[.?!]+(\s+|$)|[^.?!]+$/g)?.map((x) => x.trim()).filter(Boolean) || []
  if (!parts.length) return []
  const lead = 0.06
  const span = Math.max(0.5, (dur || parts.join(' ').length * 0.06) - lead)
  const total = parts.reduce((a, x) => a + x.length, 0)
  let t = lead
  return parts.map((x) => {
    const d = (span * x.length) / total
    const cue = { id: '', start: t, end: t + d, text: x, units: toUnits(x) }
    t += d
    return cue
  })
}

export function parseVtt(txt) {
  const toSec = (s) => s.split(':').map(Number).reduce((a, v) => a * 60 + v, 0)
  const cues = []
  for (const block of txt.replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n')
    const i = lines.findIndex((l) => l.includes('-->'))
    if (i < 0) continue
    const [a, b] = lines[i].split('-->').map((s) => toSec(s.trim().split(/\s+/)[0]))
    const text = lines.slice(i + 1).join(' ').trim()
    cues.push({ id: i > 0 ? lines[0].trim() : '', start: a, end: b, text, units: toUnits(text) })
  }
  return cues
}

const CAPTIONS = MANIFEST.captions || {}

function voiceFor(g) {
  const all = MANIFEST.guides || {}
  return all[g] || Object.values(all)[0] || { clips: {}, narration: {} }
}

const MUTE_KEY = 'ihh-guide-voice-muted'
const readMuted = () => {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}
const timeout = (ms, msg) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const raf = (fn) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(fn, 16))
const GAP = 0.45 // seconds between two narration lines
export const LOAD_TIMEOUT_MS = 4000 // a caption file or the audio's metadata
export const STALL_MS = 2500 // playback that has not advanced for this long goes to the caption clock

// fetch with a deadline (AbortController where there is one)
function fetchText(url, ms) {
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = setTimeout(() => ctl?.abort(), ms)
  return Promise.race([
    fetch(url, ctl ? { signal: ctl.signal } : undefined).then((r) => {
      if (!r.ok) throw new Error(`vtt ${r.status}`)
      return r.text()
    }),
    timeout(ms, 'vtt timeout'),
  ]).finally(() => clearTimeout(timer))
}

export class Speaker {
  constructor(audio = typeof Audio !== 'undefined' ? new Audio() : null) {
    this.listeners = new Set()
    this.line = null
    this.token = 0
    this.vtt = new Map()
    this.cur = null // { cues, t0, dur, useAudio, text, units }
    this.cancelLoad = null // removes the listeners of a pending metadata wait
    this.loadTimeoutMs = LOAD_TIMEOUT_MS
    this.stallMs = STALL_MS
    this.audio = audio
    if (this.audio) {
      // before any src: the element feeds createMediaElementSource (unlock), which outputs silence for
      // a cross-origin response fetched without CORS
      this.audio.crossOrigin = 'anonymous'
      this.audio.preload = 'auto'
    }
    this.ctx = null
    this.analyser = null
    this.buf = null
    this.muted = readMuted()
    this.unlocked = false
    this.lastSaid = null
    this.stateListeners = new Set()
    this.state = { muted: this.muted, unlocked: false }
    this.captions = CAPTIONS
    this.guide = typeof window !== 'undefined' ? guideId() : 'a'
    this.voice = voiceFor(this.guide)
  }

  subscribeState(fn) {
    this.stateListeners.add(fn)
    return () => this.stateListeners.delete(fn)
  }

  emitState() {
    this.state = { muted: this.muted, unlocked: this.unlocked }
    this.stateListeners.forEach((f) => f(this.state))
  }

  setMuted(m) {
    this.muted = m
    if (this.audio) this.audio.muted = m
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0')
    } catch {
      /* private mode: the toggle still works for this page */
    }
    this.emitState()
    // turning the voice on just after a caption-only line: say it again, aloud
    const l = this.lastSaid
    if (!m && l && !l.voiced && performance.now() - l.at < 30000) this.say(l.line, { who: l.who })
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  emit(line) {
    this.line = line
    this.listeners.forEach((f) => f(line))
  }

  // Call from a user gesture: creates the AudioContext (autoplay rules) and the analyser.
  unlock() {
    if (!this.audio) return
    try {
      if (!this.ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext
        this.ctx = new Ctx()
        const src = this.ctx.createMediaElementSource(this.audio)
        this.analyser = this.ctx.createAnalyser()
        this.analyser.fftSize = 512
        this.buf = new Uint8Array(this.analyser.fftSize)
        src.connect(this.analyser)
        this.analyser.connect(this.ctx.destination)
      }
      if (this.ctx.state === 'suspended') this.ctx.resume()
    } catch {
      this.analyser = null
    }
    if (!this.unlocked) {
      this.unlocked = true
      this.audio.muted = this.muted
      this.emitState()
    }
  }

  // The cues of a clip's caption file; [] when it fails or does not arrive in time (the line then
  // plays on its clock without captions), and a failure is not cached, so the next play retries.
  loadVtt(url) {
    if (!this.vtt.has(url)) {
      const p = fetchText(url, this.loadTimeoutMs).then(parseVtt).catch(() => {
        this.vtt.delete(url)
        return []
      })
      this.vtt.set(url, p)
    }
    return this.vtt.get(url)
  }

  stop() {
    this.token++
    this.cancelLoad?.()
    this.audio?.pause()
    this.cur = null
    this.emit(null)
  }

  get speaking() {
    return !!this.cur
  }

  // Waits for the clip's metadata; rejects on an error, after LOAD_TIMEOUT_MS, or when stop() or a
  // newer line cancels it. Its listeners and timer are removed on every path.
  async ensureSrc(src) {
    const a = this.audio
    if (a.dataset.src !== src) {
      a.dataset.src = src
      a.src = src
    }
    if (a.readyState >= 1) return
    this.cancelLoad?.()
    await new Promise((res, rej) => {
      let timer = null
      const done = (fn, v) => { cleanup(); fn(v) }
      const ok = () => done(res)
      const bad = () => done(rej, new Error('audio'))
      const cleanup = () => {
        clearTimeout(timer)
        a.removeEventListener('loadedmetadata', ok)
        a.removeEventListener('error', bad)
        if (this.cancelLoad === cancel) this.cancelLoad = null
      }
      const cancel = () => done(rej, new Error('audio cancelled'))
      this.cancelLoad = cancel
      a.addEventListener('loadedmetadata', ok)
      a.addEventListener('error', bad)
      timer = setTimeout(() => done(rej, new Error('audio timeout')), this.loadTimeoutMs)
      a.load()
    })
  }

  // Plays one pre-rendered clip from its start; captions follow its VTT cues. Resolves true when it
  // ended, false when interrupted. Without sound (locked, blocked) the cues keep time on a clock.
  async playOne(clip, token, emitCue) {
    let cues = clip.cues || (await this.loadVtt(clip.vtt))
    // no caption file (failed or timed out): the approved line text, so the words still show
    if (!cues.length && clip.text) cues = fallbackCues(clip.text, clip.dur)
    if (token !== this.token) return false
    const cur = { cues, t0: performance.now(), dur: clip.dur, useAudio: false, cue: null, lastT: -1, lastMove: 0 }
    this.cur = cur
    if (this.audio && this.unlocked && clip.src) {
      try {
        await this.ensureSrc(clip.src)
        if (token !== this.token) return false
        this.audio.muted = this.muted
        this.audio.currentTime = 0
        // some environments never settle play(); fall back to the caption clock after 1.5 s
        await Promise.race([this.audio.play(), timeout(1500, 'play timeout')])
        cur.useAudio = true
      } catch {
        this.audio.pause()
      }
      cur.t0 = performance.now()
      cur.lastMove = cur.t0
    }
    return new Promise((resolve) => {
      const tick = () => {
        if (token !== this.token) return resolve(false)
        if (cur.useAudio) {
          // playback that stops advancing (a stalled network, a lost device) goes on the caption clock
          // from where it stood, so the captions and the line still finish
          const now = performance.now()
          const at = this.audio.currentTime
          if (at !== cur.lastT) {
            cur.lastT = at
            cur.lastMove = now
          } else if (!this.audio.ended && now - cur.lastMove > this.stallMs) {
            cur.useAudio = false
            cur.t0 = now - at * 1000
            this.audio.pause()
          }
        }
        const t = this.time()
        const cue = cues.find((c) => t >= c.start - 0.15 && t < c.end + 0.25) || cur.cue
        if (cue && cue !== cur.cue) {
          cur.cue = cue
          emitCue?.(cue)
        }
        const ended = cur.useAudio ? this.audio.ended || t >= clip.dur + 0.3 : t >= clip.dur
        if (ended) {
          this.audio?.pause()
          return resolve(true)
        }
        raf(tick)
      }
      tick()
    })
  }

  time() {
    const c = this.cur
    if (!c) return 0
    return c.useAudio ? this.audio.currentTime : (performance.now() - c.t0) / 1000
  }

  // Is there a pre-rendered narration clip for this key (a chapter opening may not be voiced yet)?
  has(key) {
    return Boolean(this.voice.narration?.[key])
  }

  // Narration lines (keys into the manifest), e.g. { keys: ['einstein:2:c6'], factIds }, or a
  // chapter opening ('einstein:ch:birth:opening'). onStart fires once, with the first caption (with
  // or without sound), so what goes with the line (the controls hint) starts when the line does.
  async playClip({ keys = [], factIds = [], who = 'Guide', onStart }) {
    const token = ++this.token
    this.audio?.pause()
    this.cur = null
    let started = false
    for (let i = 0; i < keys.length; i++) {
      const voiced = this.voice.narration?.[keys[i]]
      const clip = voiced && { ...voiced, text: this.captions[keys[i]] }
      const ids = clip?.factIds || factIds
      const ok = clip
        ? await this.playOne(clip, token, (cue) => {
            this.emit({ text: cue.text, factIds: ids, who, kind: 'narration' })
            if (!started) {
              started = true
              onStart?.()
            }
          })
        : false
      if (token !== this.token) return false
      if (!ok && !clip) continue
      if (i < keys.length - 1) {
        await sleep(GAP * 1000)
        if (token !== this.token) return false
      }
    }
    if (token !== this.token) return false
    this.cur = null
    this.emit(null)
    return true
  }

  // A short line in the guide's own words (wayfinding). `line` is a string or { text, parts };
  // each part is a whole line with its own clip, so normally there is one.
  async say(line, { who = 'Guide' } = {}) {
    const { text, parts } = typeof line === 'string' ? { text: line, parts: [line] } : line
    const token = ++this.token
    this.audio?.pause()
    this.cur = null
    const clips = parts.map((p) => this.voice.clips?.[p])
    const voiced = Boolean(this.audio && this.unlocked && !this.muted && clips.length && clips.every(Boolean))
    this.lastSaid = { line, who, voiced, at: performance.now() }
    this.emit({ text, factIds: [], who, kind: 'guide', ai: true })
    if (clips.every(Boolean) && clips.length) {
      for (const c of clips) {
        if (!(await this.playOne(c, token))) return false
      }
    } else {
      // no clip: a reading clock with the text as its only cue
      const dur = Math.max(1.8, text.length * 0.06)
      const cue = { start: 0, end: dur, text, units: toUnits(text) }
      if (!(await this.playOne({ dur, src: null, cues: [cue] }, token))) return false
    }
    if (token !== this.token) return false
    this.cur = null
    this.emit(null)
    return true
  }

  rms() {
    this.analyser.getByteTimeDomainData(this.buf)
    let sum = 0
    for (let i = 0; i < this.buf.length; i++) {
      const v = (this.buf[i] - 128) / 128
      sum += v * v
    }
    return Math.min(1, Math.sqrt(sum / this.buf.length) * 5)
  }

  // Mouth sample for this frame: loudness (analyser, or a speech-like flutter without sound) and
  // the viseme at the estimated reading position inside the active cue.
  sample() {
    const c = this.cur
    if (!c) return { level: 0, unit: 'sil' }
    const t = this.time()
    const cue = c.cues.find((q) => t >= q.start && t < q.end)
    if (!cue) return { level: 0, unit: 'sil' }
    const unit = unitAt(cue.units, (t - cue.start) / Math.max(0.01, cue.end - cue.start))
    if (unit === 'sil') return { level: 0.05, unit }
    if (c.useAudio && this.analyser && !this.muted) return { level: this.rms(), unit }
    return { level: 0.45 + 0.35 * Math.abs(Math.sin((performance.now() / 1000) * 17)), unit }
  }
}

export const speaker = new Speaker()
