// On a browser without AbortSignal.any (three.js then gives FileLoader only the loader's own signal),
// a scope's reset still aborts its requests: loadScope.js supplies AbortSignal.any.
import { afterAll, expect, test, vi } from 'vitest'

const realAny = AbortSignal.any
const realFetch = globalThis.fetch
afterAll(() => {
  AbortSignal.any = realAny
  globalThis.fetch = realFetch
})
globalThis.ProgressEvent ||= class ProgressEvent extends Event {
  constructor(type, init = {}) {
    super(type)
    Object.assign(this, init)
  }
}

test('without AbortSignal.any, reset() still aborts a stalled FileLoader request and the retry is fresh', async () => {
  delete AbortSignal.any
  expect(typeof AbortSignal.any).toBe('undefined')
  const calls = []
  globalThis.fetch = vi.fn((req) => {
    calls.push(req.url)
    if (calls.length === 1) return new Promise((_, reject) => req.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))
    return Promise.resolve(new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }))
  })
  vi.resetModules()
  const { LoadScope, anySignal } = await import('./loadScope.js')
  expect(AbortSignal.any).toBe(anySignal)
  const scope = new LoadScope('t')
  const url = 'http://museum.test/land.json'
  const load = () => new Promise((resolve, reject) => scope.json.load(url, resolve, undefined, reject))
  const stalled = load()
  await new Promise((r) => setTimeout(r, 10))
  const t0 = Date.now()
  await scope.reset()
  expect(Date.now() - t0).toBeLessThan(1000) // settled by the abort, not by the 3 s cap
  await expect(stalled).rejects.toThrow(/abort/i)
  await expect(load()).resolves.toEqual({ ok: true })
  expect(calls).toEqual([url, url])
})

test('anySignal aborts when any of its signals does', () => {
  return import('./loadScope.js').then(({ anySignal }) => {
    const a = new AbortController()
    const b = new AbortController()
    const s = anySignal([a.signal, b.signal])
    expect(s.aborted).toBe(false)
    b.abort('stop')
    expect(s.aborted).toBe(true)
    expect(s.reason).toBe('stop')
    const done = new AbortController()
    done.abort()
    expect(anySignal([done.signal]).aborted).toBe(true)
  })
})
