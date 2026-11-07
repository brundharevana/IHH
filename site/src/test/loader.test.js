// Scanned-room loading (real-scan museum, Task 3): device class, byte progress from the response
// stream, and the prefetch rules (same origin only, abortable, never under Save-Data).
import { it, expect, describe } from 'vitest';
import { vi } from 'vitest';
import { classifyDevice, deviceClass, fetchWithProgress, prefetchDecision, prefetch, LOW_MEMORY_GB, PHONE_MAX_WIDTH, IDLE_TIMEOUT_MS, compressedSupport } from '../museum/loader.js';

describe('classifyDevice', () => {
  it('a fine pointer on a wide screen with ordinary memory is a desktop', () => {
    expect(classifyDevice({ coarse: false, width: 1440, memory: 8 })).toBe('desktop');
    expect(classifyDevice({ coarse: false, width: 1440, memory: null })).toBe('desktop'); // no memory hint (Firefox, Safari)
  });
  it('a coarse pointer is a phone, whatever the width', () => {
    expect(classifyDevice({ coarse: true, width: 1280, memory: 8 })).toBe('phone');
  });
  it('a narrow viewport is a phone', () => {
    expect(classifyDevice({ coarse: false, width: PHONE_MAX_WIDTH, memory: 8 })).toBe('phone');
    expect(classifyDevice({ coarse: false, width: 390, memory: 8 })).toBe('phone');
    expect(classifyDevice({ coarse: false, width: PHONE_MAX_WIDTH + 1, memory: 8 })).toBe('desktop');
  });
  it('a low device-memory hint is a phone', () => {
    expect(LOW_MEMORY_GB).toBe(2);
    expect(classifyDevice({ coarse: false, width: 1440, memory: 2 })).toBe('phone');
    expect(classifyDevice({ coarse: false, width: 1440, memory: 1 })).toBe('phone');
    expect(classifyDevice({ coarse: false, width: 1440, memory: 4 })).toBe('desktop');
  });
  it('?quality=phone|desktop overrides the probe; anything else is ignored', () => {
    expect(classifyDevice({ coarse: true, width: 390, memory: 1, quality: 'desktop' })).toBe('desktop');
    expect(classifyDevice({ coarse: false, width: 1440, memory: 8, quality: 'phone' })).toBe('phone');
    expect(classifyDevice({ coarse: false, width: 1440, memory: 8, quality: 'ultra' })).toBe('desktop');
  });
});

describe('deviceClass (browser probe)', () => {
  const win = ({ coarse = false, width = 1440, inner = width, memory = 8, search = '' } = {}) => ({
    matchMedia: q => ({ matches: q.includes('coarse') ? coarse : false }),
    innerWidth: inner,
    screen: { width },
    navigator: { deviceMemory: memory },
    location: { href: `https://example.test/dev/scan/kings-hall/${search}` },
  });
  it('reads pointer, width, memory and the quality parameter', () => {
    expect(deviceClass(win())).toBe('desktop');
    expect(deviceClass(win({ coarse: true }))).toBe('phone');
    expect(deviceClass(win({ width: 390 }))).toBe('phone');
    expect(deviceClass(win({ memory: 2 }))).toBe('phone');
    expect(deviceClass(win({ search: '?quality=phone' }))).toBe('phone');
    expect(deviceClass(win({ coarse: true, search: '?debug&quality=desktop' }))).toBe('desktop');
  });
  it('with a fine pointer it reads the screen width, not the window: a narrow window on a big screen is a desktop', () => {
    expect(deviceClass(win({ width: 1920, inner: 600 }))).toBe('desktop');
    expect(deviceClass(win({ width: 800, inner: 800 }))).toBe('phone');
  });
});

// A Response-like object whose body streams the given chunks.
const streamed = (chunks, { length = null, ok = true, status = 200 } = {}) => ({
  ok, status,
  headers: { get: k => (k.toLowerCase() === 'content-length' && length !== null ? String(length) : null) },
  body: new ReadableStream({ start(c) { for (const ch of chunks) c.enqueue(new Uint8Array(ch)); c.close(); } }),
});

describe('fetchWithProgress', () => {
  it('reports loaded bytes chunk by chunk against the expected total and returns the whole body', async () => {
    const seen = [];
    const buf = await fetchWithProgress('/scans/x/phone/room.glb', {
      expected: 10, onProgress: p => seen.push([p.loaded, p.total]),
      fetchImpl: async () => streamed([[1, 2, 3], [4, 5, 6, 7], [8, 9, 10]], { length: 10 }),
    });
    expect([...new Uint8Array(buf)]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(seen).toEqual([[0, 10], [3, 10], [7, 10], [10, 10]]);
  });
  it('uses Content-Length when no total is expected', async () => {
    const seen = [];
    await fetchWithProgress('/a', { onProgress: p => seen.push(p.total), fetchImpl: async () => streamed([[1, 2]], { length: 2 }) });
    expect(seen.at(-1)).toBe(2);
  });
  it('fails on an HTTP error, naming the status and the URL', async () => {
    await expect(fetchWithProgress('/scans/x/phone/room.glb', { fetchImpl: async () => streamed([], { ok: false, status: 404 }) }))
      .rejects.toThrow(/404.*\/scans\/x\/phone\/room\.glb/);
  });
  it('aborting the caller\'s signal aborts the fetch', async () => {
    const ac = new AbortController();
    let got = null;
    const p = fetchWithProgress('/a', { signal: ac.signal, fetchImpl: (u, o) => { got = o.signal; return new Promise((_, rej) => o.signal.addEventListener('abort', () => rej(new Error('aborted')))); } });
    ac.abort();
    await expect(p).rejects.toThrow(/aborted/);
    expect(got.aborted).toBe(true);
  });
});

describe('fetchWithProgress inactivity timeout', () => {
  it('is 15 s by default', () => { expect(IDLE_TIMEOUT_MS).toBe(15000); });
  it('aborts and fails when no response arrives for idleMs', async () => {
    vi.useFakeTimers();
    try {
      let signal = null;
      const p = fetchWithProgress('/scans/x/phone/room.glb', { idleMs: 1000, fetchImpl: (u, o) => { signal = o.signal; return new Promise((_, rej) => o.signal.addEventListener('abort', () => rej(new Error('aborted')))); } });
      const caught = p.catch(e => e);
      await vi.advanceTimersByTimeAsync(1001);
      const err = await caught;
      expect(String(err)).toMatch(/stalled.*1 s.*\/scans\/x\/phone\/room\.glb/);
      expect(signal.aborted).toBe(true);
    } finally { vi.useRealTimers(); }
  });
  it('aborts when the body stops mid-way, and each chunk resets the clock', async () => {
    vi.useFakeTimers();
    try {
      let push;
      const body = new ReadableStream({ start(c) { push = c; } });
      const p = fetchWithProgress('/a', { idleMs: 1000, fetchImpl: async (u, o) => { o.signal.addEventListener('abort', () => push.error(new Error('aborted'))); return { ok: true, status: 200, headers: { get: () => null }, body }; } });
      const caught = p.catch(e => e);
      await vi.advanceTimersByTimeAsync(800); push.enqueue(new Uint8Array([1]));
      await vi.advanceTimersByTimeAsync(800); push.enqueue(new Uint8Array([2])); // 1.6 s in, still alive
      await vi.advanceTimersByTimeAsync(1001);
      expect(String(await caught)).toMatch(/stalled/);
    } finally { vi.useRealTimers(); }
  });
});

describe('compressedSupport', () => {
  it('is true when the GPU takes any compressed format KTX2 can transcode to', () => {
    expect(compressedSupport({ astcSupported: false, etc1Supported: true })).toBe(true);
    expect(compressedSupport({ dxtSupported: true })).toBe(true);
    expect(compressedSupport({ astcSupported: false, etc1Supported: false, etc2Supported: false, dxtSupported: false, bptcSupported: false, pvrtcSupported: false })).toBe(false);
    expect(compressedSupport(null)).toBe(false);
  });
});

describe('prefetch rules', () => {
  const origin = 'https://voa.example';
  it('allows a same-origin bundle', () => {
    expect(prefetchDecision({ url: '/scans/kings-hall/phone/room.glb', origin })).toEqual({ ok: true, url: `${origin}/scans/kings-hall/phone/room.glb` });
  });
  it('refuses another origin', () => {
    expect(prefetchDecision({ url: 'https://cdn.example/room.glb', origin })).toEqual({ ok: false, reason: 'cross-origin' });
    expect(prefetchDecision({ url: '//cdn.example/room.glb', origin }).ok).toBe(false);
  });
  it('refuses under Save-Data or prefers-reduced-data', () => {
    expect(prefetchDecision({ url: '/a.glb', origin, saveData: true })).toEqual({ ok: false, reason: 'save-data' });
    expect(prefetchDecision({ url: '/a.glb', origin, reducedData: true })).toEqual({ ok: false, reason: 'save-data' });
  });
  it('refuses no URL', () => {
    expect(prefetchDecision({ url: null, origin }).ok).toBe(false);
  });
  it('fetches at low priority, reads the body, and can be aborted', async () => {
    const calls = [];
    const fetchImpl = (u, o) => new Promise((resolve, reject) => {
      calls.push([u, o]);
      o.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    });
    const p = prefetch('/scans/x/phone/room.glb', { origin, fetchImpl });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe(`${origin}/scans/x/phone/room.glb`);
    expect(calls[0][1].priority).toBe('low');
    p.abort();
    expect(await p.done).toBe(false);
  });
  it('does not fetch at all under Save-Data', async () => {
    let n = 0;
    const p = prefetch('/a.glb', { origin, saveData: true, fetchImpl: async () => { n++; return streamed([[1]]); } });
    expect(await p.done).toBe(false);
    expect(n).toBe(0);
  });
  it('resolves true once the whole body is in', async () => {
    const p = prefetch('/a.glb', { origin, fetchImpl: async () => streamed([[1, 2], [3]]) });
    expect(await p.done).toBe(true);
  });
});

// Codex gate 2026-10-14. Rule: a per-renderer shared resource is registered before the first await,
// so concurrent loads share it, and forgotten when it fails; every loading step without progress
// events (modules, transcoder start, parse) is held to the inactivity rule and to the caller's abort.
import { scanLoaders, disposeScanLoaders, bounded } from '../museum/loader.js';

function fakeModules({ init = () => Promise.resolve(), fail = false } = {}) {
  const counts = { modules: 0, ktx2: 0, disposed: 0 };
  const modules = async () => {
    counts.modules++;
    await Promise.resolve(); await Promise.resolve(); // the real dynamic imports yield before resolving
    if (fail) throw new Error('module load failed');
    class KTX2Loader {
      constructor() { counts.ktx2++; this.workerConfig = { etc2Supported: true }; }
      setTranscoderPath() { return this; }
      detectSupport() { return this; }
      init() { return init(); }
      dispose() { counts.disposed++; }
    }
    class GLTFLoader { setKTX2Loader() { return this; } setMeshoptDecoder() { return this; } parseAsync() { return new Promise(() => {}); } }
    return [{ GLTFLoader }, { KTX2Loader }, { MeshoptDecoder: { ready: Promise.resolve() } }];
  };
  return { counts, modules };
}

describe('scanLoaders: one loader set per renderer', () => {
  it('two concurrent calls create one set (one transcoder) and one disposal releases it', async () => {
    const renderer = {}, { counts, modules } = fakeModules();
    const [a, b] = await Promise.all([scanLoaders(renderer, { modules }), scanLoaders(renderer, { modules })]);
    expect(a).toBe(b);
    expect(counts).toEqual({ modules: 1, ktx2: 1, disposed: 0 });
    expect(await scanLoaders(renderer, { modules })).toBe(a);
    disposeScanLoaders(renderer);
    await Promise.resolve(); await Promise.resolve();
    expect(counts.disposed).toBe(1);
    const c = await scanLoaders(renderer, { modules });
    expect(c).not.toBe(a);
    expect(counts.ktx2).toBe(2);
  });

  it('a set whose start failed is forgotten: the next call starts afresh', async () => {
    const renderer = {}, bad = fakeModules({ fail: true }), good = fakeModules();
    await expect(scanLoaders(renderer, { modules: bad.modules })).rejects.toThrow('module load failed');
    await expect(scanLoaders(renderer, { modules: good.modules })).resolves.toBeTruthy();
    expect(good.counts.ktx2).toBe(1);
  });

  it('a transcoder that never starts fails after the idle time, disposes the set and is forgotten', async () => {
    vi.useFakeTimers();
    try {
      const renderer = {}, hung = fakeModules({ init: () => new Promise(() => {}) });
      const set = await scanLoaders(renderer, { modules: hung.modules, idleMs: 1000 });
      const ready = expect(set.ready).rejects.toThrow(/stalled: starting the Basis transcoder/);
      await vi.advanceTimersByTimeAsync(1000);
      await ready;
      expect(hung.counts.disposed).toBe(1);
      const fresh = fakeModules();
      expect(await scanLoaders(renderer, { modules: fresh.modules })).not.toBe(set);
      expect(fresh.counts.ktx2).toBe(1);
    } finally { vi.useRealTimers(); }
  });

  it('a parse that never ends fails after the idle time; an abort ends the wait at once', async () => {
    vi.useFakeTimers();
    try {
      const { modules } = fakeModules();
      const set = await scanLoaders({}, { modules, idleMs: 1000 });
      const parsed = expect(set.parse(new ArrayBuffer(4), { what: 'parsing x.glb' })).rejects.toThrow(/stalled: parsing x.glb/);
      await vi.advanceTimersByTimeAsync(1000);
      await parsed;
      const ac = new AbortController();
      const p = set.parse(new ArrayBuffer(4), { signal: ac.signal });
      ac.abort();
      await expect(p).rejects.toMatchObject({ name: 'AbortError' });
    } finally { vi.useRealTimers(); }
  });

  it('bounded: passes a result through, rejects on timeout and on abort, and ms null never times out', async () => {
    await expect(bounded(Promise.resolve(7), { ms: 10 })).resolves.toBe(7);
    await expect(bounded(Promise.reject(new Error('x')), { ms: 10 })).rejects.toThrow('x');
    vi.useFakeTimers();
    try {
      const t = expect(bounded(new Promise(() => {}), { ms: 50, what: 'w' })).rejects.toThrow('stalled: w');
      await vi.advanceTimersByTimeAsync(50); await t;
      let settled = false;
      bounded(new Promise(() => {}), { ms: null }).then(() => { settled = true; }, () => { settled = true; });
      await vi.advanceTimersByTimeAsync(10 * IDLE_TIMEOUT_MS);
      expect(settled).toBe(false);
    } finally { vi.useRealTimers(); }
    const ac = new AbortController(); ac.abort();
    await expect(bounded(new Promise(() => {}), { signal: ac.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });
});

// Codex gate round 2. Rule: every network load of a room's start-up (scan files AND exhibit images)
// is bounded by the inactivity rule and cancellable; an image that fails or stalls becomes null and
// the room shows the placeholder card.
import { loadImage } from '../museum/loader.js';
describe('loadImage', () => {
  const job = (done) => { const j = { cancelled: 0, done, cancel() { j.cancelled++; } }; return j; };
  it('resolves with the loaded image', async () => {
    expect(await loadImage('/media/room/a.jpg', { load: () => job(Promise.resolve('img')) })).toBe('img');
  });
  it('a load that never ends fails as stalled after the idle time and cancels the request', async () => {
    vi.useFakeTimers();
    try {
      const j = job(new Promise(() => {}));
      const p = expect(loadImage('/media/room/a.jpg', { idleMs: 1000, load: () => j })).rejects.toThrow(/stalled: loading \/media\/room\/a.jpg/);
      await vi.advanceTimersByTimeAsync(1000);
      await p;
      expect(j.cancelled).toBe(1);
    } finally { vi.useRealTimers(); }
  });
  it('an abort ends the load at once and cancels the request; a failed load rejects', async () => {
    const ac = new AbortController(), j = job(new Promise(() => {}));
    const q = loadImage('/a.jpg', { signal: ac.signal, load: () => j });
    ac.abort();
    await expect(q).rejects.toMatchObject({ name: 'AbortError' });
    expect(j.cancelled).toBe(1);
    await expect(loadImage('/a.jpg', { load: () => job(Promise.reject(new Error('decode'))) })).rejects.toThrow('decode');
  });
});
