// A code chunk either arrives or rejects with a ChunkError: on a fetch failure, and on a stall once
// the deadline passes (never an endless wait).
import { expect, test, vi } from 'vitest'
import { CHUNK_TIMEOUT_MS, ChunkError, isChunkError, loadChunk } from './chunks.js'

test('a chunk that arrives resolves to its module', async () => {
  await expect(loadChunk(() => Promise.resolve({ default: 1 }), 'x')).resolves.toEqual({ default: 1 })
})

test('a chunk that fails to fetch rejects with a ChunkError naming it', async () => {
  const e = await loadChunk(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module')), 'the record viewer').catch((x) => x)
  expect(e).toBeInstanceOf(ChunkError)
  expect(isChunkError(e)).toBe(true)
  expect(e.message).toMatch(/^the record viewer could not be fetched \(Failed to fetch/)
})

test('a chunk that stalls rejects with a ChunkError once the deadline passes', async () => {
  vi.useFakeTimers()
  try {
    const p = loadChunk(() => new Promise(() => {}), 'the 3D stage')
    const caught = p.catch((x) => x)
    await vi.advanceTimersByTimeAsync(CHUNK_TIMEOUT_MS - 1)
    let settled = false
    p.then(() => (settled = true), () => (settled = true))
    await Promise.resolve()
    expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(2)
    const e = await caught
    expect(isChunkError(e)).toBe(true)
    expect(e.message).toBe(`the 3D stage did not finish loading within ${CHUNK_TIMEOUT_MS / 1000} s`)
  } finally {
    vi.useRealTimers()
  }
})

test('the chunk deadline is shorter than the stage asset deadline, so a stalled stage chunk shows as one', async () => {
  const { LOAD_TIMEOUT_MS } = await import('./loadScope.js')
  expect(CHUNK_TIMEOUT_MS).toBeLessThan(LOAD_TIMEOUT_MS)
})
