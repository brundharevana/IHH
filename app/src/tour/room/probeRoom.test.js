// probeRoom never leaves a chapter waiting forever (Codex re-review Medium): every request has a
// deadline and follows the stage's abort signal; a missing model is null, a failure is a RoomLoadError.
import { test, expect, vi, afterEach } from 'vitest'
import { probeRoom, RoomLoadError } from './probeRoom.js'

afterEach(() => vi.unstubAllGlobals())
const res = (status, type = 'model/gltf-binary', body = {}) => ({ ok: status < 400, status, headers: { get: () => type }, json: async () => body })
// a fetch that never answers until its signal aborts
const hang = () => vi.fn((u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')))))

test('a request that never answers times out as a RoomLoadError', async () => {
  vi.stubGlobal('fetch', hang())
  const t0 = performance.now()
  await expect(probeRoom('/models/study/study', false, { timeoutMs: 80 })).rejects.toBeInstanceOf(RoomLoadError)
  expect(performance.now() - t0).toBeLessThan(2000)
})

test('the stage unmounting aborts the probe (not reported as a load error)', async () => {
  vi.stubGlobal('fetch', hang())
  const ctl = new AbortController()
  const p = probeRoom('/models/study/study', false, { signal: ctl.signal, timeoutMs: 60000 })
  ctl.abort()
  const e = await p.catch((x) => x)
  expect(e).not.toBeInstanceOf(RoomLoadError)
  expect(e.name).toBe('AbortError')
})

test('a missing model is null; a server error or a network error is a RoomLoadError', async () => {
  vi.stubGlobal('fetch', async () => res(404, 'text/html'))
  expect(await probeRoom('/models/none/none', false)).toBeNull()
  vi.stubGlobal('fetch', async () => res(503))
  await expect(probeRoom('/models/study/study', false)).rejects.toThrow(/server error 503/)
  vi.stubGlobal('fetch', async () => { throw new TypeError('Failed to fetch') })
  await expect(probeRoom('/models/study/study', false)).rejects.toThrow(/network error/)
})

test('a model with unreadable bounds still loads', async () => {
  vi.stubGlobal('fetch', async (u) => (u.includes('bounds') ? { ...res(200, 'application/json'), json: async () => { throw new SyntaxError('bad') } } : res(200)))
  const out = await probeRoom('/models/study/study', false)
  expect(out.url).toMatch(/study\.glb\?v=/)
  expect(out.bounds).toBeNull()
})

test('headers that arrive with a body that never does still time out (the bounds body is under the deadline)', async () => {
  vi.stubGlobal('fetch', vi.fn(async (u, init) => (u.includes('bounds')
    ? { ok: true, status: 200, headers: { get: () => 'application/json' }, json: () => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')))) }
    : res(200))))
  const t0 = performance.now()
  await expect(probeRoom('/models/study/study', false, { timeoutMs: 80 })).rejects.toThrow(/timed out/)
  expect(performance.now() - t0).toBeLessThan(2000)
})
