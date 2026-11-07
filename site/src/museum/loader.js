// Scanned-room loading (real-scan museum, Task 3): which bundle a device gets, the GLB fetch with
// byte progress for the loading view, the glTF loader set (meshopt geometry, KTX2 textures through
// the self-hosted Basis transcoder) and the prefetch of the next room's bundle.

// Device class. A phone gets the half-resolution bundle (<= 5 MB); a computer the full one (<= 10 MB).
// Phone: a coarse pointer, a screen at most PHONE_MAX_WIDTH px wide (screen.width, so a narrow window
// on a big screen is still a computer), or a device-memory hint of LOW_MEMORY_GB or less
// (navigator.deviceMemory, Chromium only; no hint counts as ordinary memory).
// ?quality=phone|desktop overrides the probe, for testing.
export const PHONE_MAX_WIDTH = 899; // the stage's phone layout breakpoint (ChapterRoom.astro)
export const LOW_MEMORY_GB = 2;
const CLASSES = new Set(['phone', 'desktop']);

export function classifyDevice({ coarse = false, width = Infinity, memory = null, quality = null } = {}) {
  if (CLASSES.has(quality)) return quality;
  if (coarse || width <= PHONE_MAX_WIDTH) return 'phone';
  if (typeof memory === 'number' && memory > 0 && memory <= LOW_MEMORY_GB) return 'phone';
  return 'desktop';
}

export function deviceClass(win = globalThis) {
  let quality = null;
  try { quality = new URL(win.location.href).searchParams.get('quality'); } catch { /* no URL: no override */ }
  const coarse = typeof win.matchMedia === 'function' && win.matchMedia('(pointer: coarse)').matches;
  const memory = win.navigator && typeof win.navigator.deviceMemory === 'number' ? win.navigator.deviceMemory : null;
  const width = (win.screen && win.screen.width) || win.innerWidth;
  return classifyDevice({ coarse, width, memory, quality });
}

// GET `url` as an ArrayBuffer, reporting { loaded, total } bytes as the body streams in (once at 0,
// then after every chunk). total is `expected` (the manifest's size) or else Content-Length.
// A request that brings no response or no new bytes for idleMs is aborted and fails ("stalled"),
// so a hung connection ends in the Lite fallback instead of an endless loading view.
export const IDLE_TIMEOUT_MS = 15000;
export async function fetchWithProgress(url, { signal, onProgress = () => {}, expected = null, idleMs = IDLE_TIMEOUT_MS, fetchImpl = (u, o) => fetch(u, o) } = {}) {
  const ac = new AbortController();
  let stalled = false, timer = null;
  const arm = () => { clearTimeout(timer); timer = setTimeout(() => { stalled = true; ac.abort(); }, idleMs); };
  const onAbort = () => ac.abort();
  if (signal) { if (signal.aborted) ac.abort(); else signal.addEventListener('abort', onAbort, { once: true }); }
  arm();
  try {
    return await readBody(url, { signal: ac.signal, onProgress, expected, fetchImpl, arm });
  } catch (err) {
    if (stalled) throw new Error(`stalled: no data for ${Math.round(idleMs / 1000)} s from ${url}`);
    throw err;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

async function readBody(url, { signal, onProgress, expected, fetchImpl, arm }) {
  const res = await fetchImpl(url, { signal });
  arm();
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const header = Number(res.headers && res.headers.get('content-length'));
  const total = expected || (header > 0 ? header : 0);
  let loaded = 0;
  onProgress({ loaded, total });
  if (!res.body || typeof res.body.getReader !== 'function') {
    const buf = await res.arrayBuffer();
    onProgress({ loaded: buf.byteLength, total: total || buf.byteLength });
    return buf;
  }
  const reader = res.body.getReader(), chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    arm();
    chunks.push(value); loaded += value.byteLength;
    onProgress({ loaded, total: Math.max(total, loaded) });
  }
  const out = new Uint8Array(loaded);
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.byteLength; }
  return out.buffer;
}

// An image for the room (an exhibit's media file, a hallway portrait), under the loading inactivity
// rule: loaded by an <img> (so it shares the document's image cache with the page's own thumbnails of
// the same file: one download, not two; Codex gate round 3) and decoded, bounded by idleMs (an image
// has no byte progress to watch, so the bound is on the whole load); a stall or an abort cancels the
// request (src cleared). -> the decoded image; rejects on any failure, and the caller shows its
// placeholder instead. load(url) -> { done: Promise<image>, cancel() } (tests).
const loadElement = url => {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  return { done: img.decode().then(() => img), cancel: () => { img.removeAttribute('src'); } };
};
export async function loadImage(url, { signal = null, idleMs = IDLE_TIMEOUT_MS, load = loadElement } = {}) {
  const job = load(url);
  try {
    return await bounded(job.done, { ms: idleMs, signal, what: `loading ${url}` });
  } catch (err) {
    job.cancel();
    throw err;
  }
}

// Prefetch rules: only a same-origin URL, never under Save-Data or prefers-reduced-data.
export function prefetchDecision({ url, origin, saveData = false, reducedData = false }) {
  if (!url) return { ok: false, reason: 'no-url' };
  if (saveData || reducedData) return { ok: false, reason: 'save-data' };
  let u;
  try { u = new URL(url, origin); } catch { return { ok: false, reason: 'bad-url' }; }
  if (u.origin !== origin) return { ok: false, reason: 'cross-origin' };
  return { ok: true, url: u.href };
}

const browserSaveData = () => {
  try { return Boolean(navigator.connection && navigator.connection.saveData); } catch { return false; }
};
const browserReducedData = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-data: reduce)').matches;

// Fetch `url` at low priority and read its whole body, so the HTTP cache holds it when the next room
// asks for it. -> { done: Promise<boolean> (true once the body is in), abort() }.
export function prefetch(url, { origin = typeof location !== 'undefined' ? location.origin : '', saveData = browserSaveData(), reducedData = browserReducedData(), fetchImpl = (u, o) => fetch(u, o) } = {}) {
  const d = prefetchDecision({ url, origin, saveData, reducedData });
  const ac = new AbortController();
  if (!d.ok) return { done: Promise.resolve(false), abort: () => {}, reason: d.reason };
  const done = (async () => {
    const res = await fetchImpl(d.url, { signal: ac.signal, priority: 'low' });
    if (!res.ok) return false;
    if (res.body && typeof res.body.getReader === 'function') {
      const reader = res.body.getReader();
      for (;;) { const { done: end } = await reader.read(); if (end) break; }
    } else await res.arrayBuffer();
    return true;
  })().catch(() => false);
  return { done, abort: () => ac.abort() };
}

// The Basis Universal transcoder, self-hosted (copied from three/examples/jsm/libs/basis at build
// time by the voa-basis integration in astro.config.mjs; its size is held to TRANSCODER_BUDGET).
export const TRANSCODER_PATH = '/basis/';

// KTX2 transcodes to a compressed GPU format when the device has one (ASTC, BC7, ETC1/2, S3TC,
// PVRTC); without any it falls back to uncompressed RGBA, about 4x the texture memory.
export function compressedSupport(config) {
  if (!config) return false;
  return ['astcSupported', 'bptcSupported', 'etc1Supported', 'etc2Supported', 'dxtSupported', 'pvrtcSupported'].some(k => config[k]);
}

// A step with no progress events of its own (loading the loader modules, starting the Basis
// transcoder, parsing and transcoding a GLB) held to the same inactivity rule as a download: it fails
// ("stalled") when it has not finished after ms, and rejects at once with an AbortError when signal
// aborts. The step itself cannot be cancelled; its result is dropped. ms = null: abort only.
export function bounded(promise, { ms = IDLE_TIMEOUT_MS, signal = null, what = 'a loading step' } = {}) {
  return new Promise((resolve, reject) => {
    let timer = null;
    const settle = () => { clearTimeout(timer); if (signal) signal.removeEventListener('abort', onAbort); };
    function onAbort() { settle(); reject(new DOMException(`aborted: ${what}`, 'AbortError')); }
    if (signal && signal.aborted) { onAbort(); return; }
    if (signal) signal.addEventListener('abort', onAbort, { once: true });
    if (typeof ms === 'number' && Number.isFinite(ms)) {
      timer = setTimeout(() => { settle(); reject(new Error(`stalled: ${what} did not finish in ${Math.round(ms / 1000)} s`)); }, ms);
    }
    Promise.resolve(promise).then(v => { settle(); resolve(v); }, e => { settle(); reject(e); });
  });
}

// One glTF loader set per renderer: GLTFLoader with the meshopt decoder and a single KTX2Loader (each
// KTX2Loader starts its own transcoder workers). The KTX2 transcoder is initialised up front, so a
// missing or blocked transcoder fails the load (GLTFLoader would otherwise drop the texture and show
// an untextured room). Loaded on demand: procedural rooms never fetch these modules.
// The set is registered as a promise before the first await, so concurrent loads (a chapter's preview
// and its study corner) share one set; a set whose start fails or stalls is disposed and forgotten,
// so the next load starts afresh. set.ready is bounded by idleMs (a hung /basis/ request ends in the
// fallback, not an endless loading view); a caller's signal abandons the wait.
const loadModules = () => Promise.all([
  import('three/addons/loaders/GLTFLoader.js'),
  import('three/addons/loaders/KTX2Loader.js'),
  import('three/addons/libs/meshopt_decoder.module.js'),
]);
const sets = new WeakMap(); // renderer -> Promise<set>
export function scanLoaders(renderer, { signal = null, idleMs = IDLE_TIMEOUT_MS, modules = loadModules } = {}) {
  let entry = sets.get(renderer);
  if (!entry) {
    entry = createSet(renderer, { idleMs, modules, forget: () => { if (sets.get(renderer) === entry) sets.delete(renderer); } });
    sets.set(renderer, entry);
    entry.catch(() => { if (sets.get(renderer) === entry) sets.delete(renderer); });
  }
  return bounded(entry, { ms: null, signal, what: 'the glTF loaders' });
}
async function createSet(renderer, { idleMs, modules, forget }) {
  const [{ GLTFLoader }, { KTX2Loader }, { MeshoptDecoder }] = await bounded(modules(), { ms: idleMs, what: 'loading the glTF loader modules' });
  const ktx2 = new KTX2Loader().setTranscoderPath(TRANSCODER_PATH).detectSupport(renderer);
  const gltf = new GLTFLoader().setKTX2Loader(ktx2).setMeshoptDecoder(MeshoptDecoder);
  let disposed = false;
  const set = {
    gltf, ktx2,
    compressed: compressedSupport(ktx2.workerConfig),
    ready: bounded(Promise.all([ktx2.init(), MeshoptDecoder.ready]), { ms: idleMs, what: `starting the Basis transcoder (${TRANSCODER_PATH})` }),
    // Parse a GLB under the same inactivity rule (its KTX2 textures wait on the transcoder).
    parse(buf, { signal = null, what = 'parsing a GLB' } = {}) { return bounded(gltf.parseAsync(buf, ''), { ms: idleMs, signal, what }); },
    dispose() { if (disposed) return; disposed = true; ktx2.dispose(); forget(); },
  };
  set.ready.catch(() => set.dispose());
  return set;
}
// Releases a renderer's loader set (the KTX2 transcoder workers), when the renderer is disposed; a set
// still starting is released as soon as it exists.
export function disposeScanLoaders(renderer) {
  const entry = sets.get(renderer);
  if (!entry) return;
  sets.delete(renderer);
  entry.then(set => set.dispose(), () => {});
}
