// A load scope gives up its stuck requests: after reset() a retry is a new request of its own, not one
// attached to the stalled one (three.js FileLoader keeps one in-flight request per URL).
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { LoadScope } from './loadScope.js'

let calls
const realFetch = globalThis.fetch
// a server whose first GET of each URL never answers (until aborted) and whose later GETs succeed
// (Node has no ProgressEvent, which FileLoader reports progress with: a stand-in)
globalThis.ProgressEvent ||= class ProgressEvent extends Event {
  constructor(type, init = {}) {
    super(type)
    Object.assign(this, init)
  }
}
beforeEach(() => {
  calls = []
  globalThis.fetch = vi.fn((req, init) => {
    const url = typeof req === 'string' ? req : req.url
    const signal = init?.signal || req.signal
    const n = calls.filter((c) => c === url).length
    calls.push(url)
    if (url.includes('missing')) return Promise.resolve(new Response('not found', { status: 404, statusText: 'Not Found' }))
    if (n === 0) {
      return new Promise((_, reject) => {
        signal?.addEventListener('abort', () => reject(new DOMException('The operation was aborted.', 'AbortError')))
      })
    }
    return Promise.resolve(new Response(JSON.stringify({ ok: n }), { headers: { 'Content-Type': 'application/json' } }))
  })
})
afterEach(() => {
  globalThis.fetch = realFetch
})

const B = 'http://museum.test'
const loadJson = (scope, url) => new Promise((resolve, reject) => scope.json.load(url, resolve, undefined, reject))
const tick = () => new Promise((r) => setTimeout(r, 10))

test('without a reset, a retry of a stalled URL attaches to the stalled request (the defect)', async () => {
  const scope = new LoadScope('t')
  const first = loadJson(scope, `${B}/a.json`)
  const second = loadJson(scope, `${B}/a.json`)
  await tick()
  expect(calls).toEqual([`${B}/a.json`]) // one request: the second load waits on the stuck one
  await scope.reset()
  await expect(first).rejects.toThrow(/abort/i)
  await expect(second).rejects.toThrow(/abort/i)
})

test('reset() aborts the stalled request, waits for it to settle, and a retry fetches afresh', async () => {
  const scope = new LoadScope('t')
  const stalled = loadJson(scope, `${B}/b.json`)
  await tick()
  expect(scope.open).toBeGreaterThan(0)
  await scope.reset()
  expect(scope.open).toBe(0)
  await expect(stalled).rejects.toThrow(/abort/i)
  await expect(loadJson(scope, `${B}/b.json`)).resolves.toEqual({ ok: 1 })
  expect(calls).toEqual([`${B}/b.json`, `${B}/b.json`])
})

test('reset() evicts the loads that did not succeed and keeps the ones that did', async () => {
  const scope = new LoadScope('t')
  const evicted = []
  scope.track('ok', () => evicted.push('ok'))
  scope.done('ok')
  scope.track('failed', () => evicted.push('failed'))
  await scope.reset()
  expect(evicted).toEqual(['failed'])
  await scope.reset()
  expect(evicted).toEqual(['failed'])
})

test('a reset of one scope leaves another scope\'s requests alone', async () => {
  const stage = new LoadScope('stage')
  const viewer = new LoadScope('viewer')
  const a = loadJson(stage, `${B}/c.json`)
  const b = loadJson(viewer, `${B}/d.json`)
  await tick()
  await stage.reset()
  await expect(a).rejects.toThrow(/abort/i)
  expect(viewer.open).toBeGreaterThan(0)
  await viewer.reset()
  await expect(b).rejects.toThrow(/abort/i)
})

test('a texture load carries the scope\'s abort signal and fails on an HTTP error', async () => {
  const scope = new LoadScope('t')
  const tex = (url) => new Promise((resolve, reject) => scope.texture.load(url, resolve, undefined, reject))
  const stalled = tex(`${B}/e.webp`)
  await tick()
  await scope.reset()
  await expect(stalled).rejects.toThrow(/abort/i)
  expect(scope.open).toBe(0)
  await expect(tex(`${B}/missing.webp`)).rejects.toThrow(/404/)
  expect(scope.open).toBe(0)
})

test('the GLTF loader of a scope uses the scope\'s manager', () => {
  const scope = new LoadScope('t')
  expect(scope.gltf.manager).toBe(scope.manager)
  expect(scope.texture.manager).toBe(scope.manager)
  expect(scope.json.manager).toBe(scope.manager)
})
