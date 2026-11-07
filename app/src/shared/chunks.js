// Code-split modules (React.lazy) with a deadline: a chunk that fails to fetch, or does not arrive
// within CHUNK_TIMEOUT_MS, rejects with a ChunkError, which ChunkSuspense (ChunkSuspense.jsx) turns
// into a visible panel. The retry it offers is "Reload the page": React.lazy keeps a rejected module
// for good, and a browser attaches a second import of a stalled chunk to the same pending request,
// so only a fresh page load is a retry that always works.
import { lazy } from 'react'

// shorter than the stage's asset deadline (LOAD_TIMEOUT_MS, 30 s), so a stalled chunk inside the stage
// shows as a chunk failure, with its reload, rather than as an asset timeout
export const CHUNK_TIMEOUT_MS = 20000

export class ChunkError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ChunkError'
  }
}

export const isChunkError = (e) => e?.name === 'ChunkError'

export function loadChunk(factory, what, ms = CHUNK_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new ChunkError(`${what} did not finish loading within ${ms / 1000} s`)), ms)
    Promise.resolve()
      .then(factory)
      .then(
        (m) => {
          clearTimeout(t)
          resolve(m)
        },
        (e) => {
          clearTimeout(t)
          reject(new ChunkError(`${what} could not be fetched (${String(e?.message || e).slice(0, 120)})`))
        },
      )
  })
}

export const lazyChunk = (factory, what) => lazy(() => loadChunk(factory, what))

export const reloadPage = () => window.location.reload()
