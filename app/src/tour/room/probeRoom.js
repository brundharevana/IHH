// Finds a recreated room's model and its walkable bounds (no three.js here, so tests can run it).
import { versioned } from '../../shared/assetVersion.js'

export const PROBE_TIMEOUT_MS = 10000

// A room that could not be loaded (network error, timeout, server error): the stage shows a
// recoverable error instead of a blank chapter. A missing model (404) is not an error: it is null.
export class RoomLoadError extends Error {}

// fetch with a deadline that also follows the caller's abort signal (the stage unmounting); the
// deadline covers reading the body too (`read`), not only the headers
async function fetchBounded(url, init, signal, ms, read = null) {
  const ctl = new AbortController()
  const stop = () => ctl.abort()
  if (signal?.aborted) stop()
  signal?.addEventListener('abort', stop)
  let timer
  const deadline = new Promise((_, rej) => {
    timer = setTimeout(() => {
      stop()
      rej(new RoomLoadError(`timed out after ${ms / 1000} s`))
    }, ms)
  })
  try {
    const r = await Promise.race([fetch(url, { ...init, signal: ctl.signal }), deadline])
    return read ? await Promise.race([read(r), deadline]) : r
  } catch (e) {
    if (e instanceof RoomLoadError) throw e
    if (signal?.aborted) throw e
    throw new RoomLoadError(ctl.signal.aborted ? `timed out after ${ms / 1000} s` : 'network error')
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', stop)
  }
}

// model: '/models/<id>/<id>' -> <model>.glb (<model>-mobile.glb on phones), bounds.json beside it.
// Every URL carries its content version (?v=, shared/assetVersion.js): /models is cached immutable.
// Resolves { url, bounds }, or null when the room has no model (404 or an HTML fallback page); rejects
// with RoomLoadError on a network error, a timeout or a server error, and with the abort error when
// `signal` aborts. Every request is bounded by `timeoutMs` and cancelled by `signal`.
export async function probeRoom(model, phone, { signal, timeoutMs = PROBE_TIMEOUT_MS } = {}) {
  const url = versioned(phone ? `${model}-mobile.glb` : `${model}.glb`)
  const isModel = async (u) => {
    const r = await fetchBounded(u, { method: 'HEAD' }, signal, timeoutMs)
    if (r.status >= 500) throw new RoomLoadError(`server error ${r.status}`)
    const type = r.headers.get('content-type') || ''
    return r.ok && !type.includes('text/html')
  }
  let found = (await isModel(url)) ? url : null
  if (!found && phone && (await isModel(versioned(`${model}.glb`)))) found = versioned(`${model}.glb`)
  if (!found) return null
  // the bounds body is read under the same deadline as its headers (a stalled body is a timeout)
  const bounds = await fetchBounded(versioned(`${model.slice(0, model.lastIndexOf('/'))}/bounds.json`), {}, signal, timeoutMs, async (r) => {
    if (r.status >= 500) throw new RoomLoadError(`server error ${r.status}`)
    if (!r.ok || (r.headers.get('content-type') || '').includes('text/html')) return null
    let body
    try {
      body = await r.json()
    } catch (e) {
      if (e?.name === 'AbortError' || e instanceof RoomLoadError) throw e
      return null // a room without readable bounds still loads; the camera keeps its defaults
    }
    return normaliseBounds(body)
  })
  return { url: found, bounds }
}

// bounds.json: { walkable: {x_min,x_max,z_min,z_max}, obstacles: [{name,x_min,...}], ceiling_y }
// -> { min, max, obstacles: [[minX, minZ, maxX, maxZ], ...] } (the shape the camera rig uses)
export function normaliseBounds(b) {
  if (!b) return null
  const box = (o) => [o.x_min ?? o.minX, o.z_min ?? o.minZ, o.x_max ?? o.maxX, o.z_max ?? o.maxZ]
  const obstacles = (b.obstacles || []).map((o) => (Array.isArray(o) ? o : box(o))).filter((o) => o.every(Number.isFinite))
  const src = b.walkable || b.bounds || b
  const top = b.ceiling_y ?? 3
  if (src.min && src.max) return { min: src.min, max: src.max, obstacles }
  if ('x_min' in src) return { min: [src.x_min, 0, src.z_min], max: [src.x_max, top, src.z_max], obstacles }
  if (src.x && src.z) return { min: [src.x[0], 0, src.z[0]], max: [src.x[1], top, src.z[1]], obstacles }
  if ('minX' in src) return { min: [src.minX, 0, src.minZ], max: [src.maxX, top, src.maxZ], obstacles }
  return null
}
