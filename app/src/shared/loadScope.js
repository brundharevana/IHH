// A load scope: the loaders one part of the page (the tour stage, the record viewer, the landing guide)
// fetches its assets with, so that part can give up every request it still has open and start again.
//
// Why: three.js keeps one in-flight request per URL (FileLoader) and attaches every later load of
// that URL to it until it settles. A request that never answers would hold every retry with it, and
// evicting React's loader cache does not change that. So each scope owns a LoadingManager whose abort
// signal every one of its requests carries (FileLoader, GLTFLoader, and the texture and JSON loaders
// below), and `reset()`:
//   1. aborts every request of the scope still open (their loads reject with an AbortError);
//   2. waits until its loaders have given them up (the manager's open items reach zero), so no
//      three.js in-flight entry is left for a retry to attach to;
//   3. evicts from React's loader cache every load of the scope that has not succeeded (failed, or
//      still pending when it was aborted), so the retry fetches it again.
// Each scope has its own loader instances (one manager each, never swapped), so its cache entries,
// abort signal and open-item count are its own.
import * as THREE from 'three'
import { GLTFLoader, DRACOLoader, MeshoptDecoder } from 'three-stdlib'

export const SETTLE_MS = 3000
// how long a bounded load may stay pending before its part fails (shared/assetLoads.jsx)
export const LOAD_TIMEOUT_MS = 30000

// One signal that aborts when any of `signals` does (AbortSignal.any, for browsers without it).
export function anySignal(signals) {
  const ctl = new AbortController()
  for (const s of signals) {
    if (s.aborted) {
      ctl.abort(s.reason)
      break
    }
    s.addEventListener('abort', () => ctl.abort(s.reason), { once: true })
  }
  return ctl.signal
}
// three.js FileLoader and ImageBitmapLoader attach the manager's abort signal only through
// AbortSignal.any; without it a scope's abort would not reach their requests (a retry could then
// attach to a stalled one). Where the browser lacks it, provide it.
if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any !== 'function') AbortSignal.any = anySignal

let draco = null
function dracoLoader() {
  // as drei's useGLTF: Draco decoders load only when a file needs them
  if (!draco) {
    draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/')
  }
  return draco
}

// a texture fetched with the scope's abort signal, then decoded as an image (same pixels and
// orientation as THREE.TextureLoader's)
export class FetchTextureLoader extends THREE.Loader {
  load(url, onLoad, onProgress, onError) {
    const texture = new THREE.Texture()
    const full = this.manager.resolveURL(this.path ? this.path + url : url)
    const manager = this.manager
    manager.itemStart(full)
    fetch(full, { credentials: 'same-origin', signal: manager.abortController.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`fetch for "${full}" responded with ${r.status}`)
        return r.blob()
      })
      .then(decodeImage)
      .then(
        (img) => {
          texture.image = img
          // the file it came from (the image itself holds a revoked blob: URL); dev checks read it (tour/recordDraws.js)
          texture.userData.fetchedFrom = new URL(full, globalThis.location?.href || 'http://localhost/').pathname
          texture.needsUpdate = true
          onLoad?.(texture)
        },
        (e) => {
          onError?.(e)
          manager.itemError(full)
        },
      )
      .finally(() => manager.itemEnd(full))
    return texture
  }
}

function decodeImage(blob) {
  return new Promise((resolve, reject) => {
    const u = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(u)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(u)
      reject(new Error('the image could not be decoded'))
    }
    img.src = u
  })
}

export class LoadScope {
  constructor(name = 'assets') {
    this.name = name
    this.manager = new THREE.LoadingManager()
    this.open = 0
    this.waiters = []
    this.keys = new Map() // cache key -> evict()
    const start = this.manager.itemStart
    const end = this.manager.itemEnd
    this.manager.itemStart = (u) => {
      this.open++
      start(u)
    }
    this.manager.itemEnd = (u) => {
      end(u)
      this.open = Math.max(0, this.open - 1)
      if (!this.open) this.waiters.splice(0).forEach((f) => f())
    }
    this.gltf = new GLTFLoader(this.manager)
    this.gltf.setDRACOLoader(dracoLoader())
    this.gltf.setMeshoptDecoder(typeof MeshoptDecoder === 'function' ? MeshoptDecoder() : MeshoptDecoder)
    this.texture = new FetchTextureLoader(this.manager)
    this.json = new THREE.FileLoader(this.manager)
    this.json.setResponseType('json')
  }

  // the scope's loads still open have all settled (or `ms` passed)
  settled(ms = SETTLE_MS) {
    if (!this.open) return Promise.resolve()
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(t)
        resolve()
      }
      const t = setTimeout(done, ms)
      this.waiters.push(done)
    })
  }

  // a load of this scope is in use and has not succeeded yet (evict() drops it from the cache)
  track(key, evict) {
    this.keys.set(key, evict)
  }
  // it succeeded: a reset keeps it
  done(key) {
    this.keys.delete(key)
  }

  // give up every open request, wait for the loaders to let go of them, evict every load that has not
  // succeeded; the next mount fetches those again, independently of anything that was stuck
  async reset() {
    this.manager.abort()
    await this.settled()
    for (const evict of this.keys.values()) evict()
    this.keys.clear()
  }
}

// the site's scopes: the tour stage, the record viewer, the landing guide
export const stageScope = new LoadScope('stage')
export const viewerScope = new LoadScope('viewer')
export const guideScope = new LoadScope('landing guide')
export const landingScope = new LoadScope('landing hall')
