// speech.js never leaves the guide frozen (Codex Task 19 Medium): the audio element is CORS-mode
// before any src (it feeds Web Audio), and a caption file, metadata or playback that does not arrive
// or stalls hands the line to the caption clock instead of waiting forever.
import { test, expect, vi, afterEach } from 'vitest'
import { Speaker, parseVtt } from './speech.js'

class FakeAudio extends EventTarget {
  constructor({ metadata = 'never', advance = true } = {}) {
    super()
    this.dataset = {}
    this.crossOrigin = null
    this.readyState = 0
    this.currentTime = 0
    this.ended = false
    this.muted = false
    this.paused = true
    this.metadata = metadata
    this.advance = advance
    this.srcLog = []
  }
  set src(v) { this.srcLog.push({ src: v, crossOrigin: this.crossOrigin }); this._src = v }
  get src() { return this._src }
  load() {
    if (this.metadata === 'ok') setTimeout(() => { this.readyState = 1; this.dispatchEvent(new Event('loadedmetadata')) }, 5)
    if (this.metadata === 'error') setTimeout(() => this.dispatchEvent(new Event('error')), 5)
  }
  play() {
    this.paused = false
    if (this.advance === true) this._t = setInterval(() => { this.currentTime += 0.05 }, 20)
    if (this.advance === 'stall') this._t = setInterval(() => { if (this.currentTime < 0.1) this.currentTime += 0.05 }, 20)
    return Promise.resolve()
  }
  pause() { this.paused = true; clearInterval(this._t) }
  listeners() { return this._n || 0 }
  addEventListener(...a) { this._n = (this._n || 0) + 1; super.addEventListener(...a) }
  removeEventListener(...a) { this._n = (this._n || 0) - 1; super.removeEventListener(...a) }
}

const VTT = 'WEBVTT\n\nc-1\n00:00:00.060 --> 00:00:00.600\nFirst line.\n\nc-2\n00:00:00.900 --> 00:00:01.500\nSecond line.\n'
const ok = (body) => async () => ({ ok: true, text: async () => body })

function speaker(audio) {
  const s = new Speaker(audio)
  s.loadTimeoutMs = 150
  s.stallMs = 200
  s.unlocked = true
  return s
}

afterEach(() => vi.unstubAllGlobals())

test('the audio element is CORS-mode before its first src', async () => {
  vi.stubGlobal('fetch', ok(VTT))
  const a = new FakeAudio({ metadata: 'ok' })
  const s = speaker(a)
  expect(a.crossOrigin).toBe('anonymous')
  await s.playOne({ src: '/audio/guide/a/x.mp3', vtt: '/x.vtt', dur: 0.5 }, s.token, () => {})
  expect(a.srcLog[0]).toEqual({ src: '/audio/guide/a/x.mp3', crossOrigin: 'anonymous' })
})

test('metadata that never arrives times out; the line still ends on the caption clock, listeners removed', async () => {
  vi.stubGlobal('fetch', ok(VTT))
  const a = new FakeAudio({ metadata: 'never' })
  const s = speaker(a)
  const seen = []
  const t0 = performance.now()
  const done = await s.playOne({ src: '/a.mp3', vtt: '/a.vtt', dur: 1.5 }, s.token, (c) => seen.push(c.text))
  expect(done).toBe(true)
  expect(performance.now() - t0).toBeLessThan(3000)
  expect(seen).toEqual(['First line.', 'Second line.'])
  expect(a.listeners()).toBe(0)
})

test('a caption file that never arrives is given up and not cached; the clip still ends', async () => {
  vi.stubGlobal('fetch', () => new Promise(() => {}))
  const s = speaker(null)
  const done = await s.playOne({ src: null, vtt: '/slow.vtt', dur: 0.2 }, s.token)
  expect(done).toBe(true)
  expect(s.vtt.has('/slow.vtt')).toBe(false)
  vi.stubGlobal('fetch', ok(VTT))
  expect((await s.loadVtt('/slow.vtt')).map((c) => c.text)).toEqual(['First line.', 'Second line.'])
})

test('a failed caption fetch (404) yields no cues and is retried later', async () => {
  vi.stubGlobal('fetch', async () => ({ ok: false, status: 404, text: async () => 'not found' }))
  const s = speaker(null)
  expect(await s.loadVtt('/x.vtt')).toEqual([])
  expect(s.vtt.has('/x.vtt')).toBe(false)
})

test('stalled playback switches to the caption clock and finishes', async () => {
  vi.stubGlobal('fetch', ok(VTT))
  const a = new FakeAudio({ metadata: 'ok', advance: 'stall' })
  const s = speaker(a)
  const t0 = performance.now()
  const done = await s.playOne({ src: '/a.mp3', vtt: '/b.vtt', dur: 0.5 }, s.token, () => {})
  expect(done).toBe(true)
  expect(a.paused).toBe(true)
  expect(performance.now() - t0).toBeLessThan(3000)
})

test('stop() cancels a pending metadata wait and removes its listeners', async () => {
  const a = new FakeAudio({ metadata: 'never' })
  const s = speaker(a)
  s.loadTimeoutMs = 60000
  const p = s.ensureSrc('/a.mp3').then(() => 'loaded', (e) => e.message)
  await new Promise((r) => setTimeout(r, 10))
  expect(a.listeners()).toBe(2)
  s.stop()
  expect(await p).toBe('audio cancelled')
  expect(a.listeners()).toBe(0)
})

test('parseVtt reads the cue text', () => {
  expect(parseVtt(VTT).map((c) => [c.start, c.end, c.text])).toEqual([[0.06, 0.6, 'First line.'], [0.9, 1.5, 'Second line.']])
})

test('a failed caption file with blocked audio still shows the approved line text, sentence by sentence', async () => {
  vi.stubGlobal('fetch', async () => ({ ok: false, status: 404, text: async () => 'not found' }))
  const s = new Speaker(new FakeAudio({ metadata: 'ok' }))
  s.loadTimeoutMs = 150
  s.unlocked = false // autoplay blocked / no gesture yet: the caption clock only
  s.voice = { narration: { 'x:1:c1': { src: '/a.mp3', vtt: '/missing.vtt', dur: 1.6, factIds: ['X-F-1'] } } }
  s.captions = { 'x:1:c1': 'Gottenberg [sic], Sweden. Take a moment and look around.' }
  const shown = []
  s.subscribe((line) => line && shown.push(line.text))
  expect(await s.playClip({ keys: ['x:1:c1'] })).toBe(true)
  expect([...new Set(shown)]).toEqual(['Gottenberg [sic], Sweden.', 'Take a moment and look around.'])
})

test('the shipped manifest carries the approved caption of every narration line', async () => {
  const { default: M } = await import('./voice-manifest.json')
  const keys = new Set(Object.values(M.guides).flatMap((g) => Object.keys(g.narration)))
  for (const k of keys) expect(M.captions[k], k).toBeTruthy()
  expect(M.captions['einstein:ch:honoured:opening']).toMatch(/Gottenberg \[sic\]/)
})
