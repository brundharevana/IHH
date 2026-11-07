// Phone download budget, measured on the built page: every response the chapter page receives from
// navigation until the 3D room is ready (HTML, JS, CSS, textures, portrait, audio metadata), as
// uncompressed body bytes. GLBs and model-viewer load only when a 360 document is opened.
import { test, expect } from '@playwright/test';
import { checkBudget, PHONE_BUDGET } from '../src/museum/budget.js';
import { CHAPTER_NUMBERS } from './content.js';
import { roomReady } from './room.js';

// Task 5: the rooms are scanned. The page itself (HTML, JS, CSS, exhibit textures, portrait) keeps the
// unchanged procedural phone limit; the room's scan files (/scans/) are held to the scanned-room limit
// of the device class this browser gets, and the Basis transcoder (/basis/) to its own limit.
import { SCAN_BUDGET as SCAN_LIMITS, TRANSCODER_BUDGET as TRANSCODER_LIMIT } from '../src/museum/budget.js';
// Task 6 (fix round 1): the study corner's props (/study/) are part of the room download: the scan
// files plus the corner fit the scanned-room limit. Only the corner's chapter loads them.
import { readFileSync as readCorner } from 'node:fs';
const CORNER = JSON.parse(readCorner('../content/einstein/study-corner.json', 'utf8'));
// Bytes the network delivered, per URL, from the browser's network log (e2e/measure.js): every
// transfer summed (Codex gate rounds 2-3: never a swallowed 0, repeated range transfers added).
import { measureDownloads } from './measure.js';

for (const n of CHAPTER_NUMBERS) {
  test(`einstein/${n} download is within the phone budget`, async ({ page }, info) => {
    // Network downloads only: the glTF loader hands embedded textures to the decoder as blob: URLs,
    // which are not fetched again (they would count the bundle's textures twice).
    const measure = await measureDownloads(page, u => /^https?:/.test(u));
    await page.goto(`/einstein/${n}/`);
    await roomReady(page);
    await page.waitForLoadState('networkidle');
    const sizes = await measure.done();
    // One download per image: the room's textures share the page's image cache (loader.js loadImage).
    for (const [u, k] of measure.transfers()) if (/\.(jpe?g|webp|png)$/.test(new URL(u).pathname)) expect(k, `${u} downloaded ${k} times`).toBe(1);
    const downloadBytes = [...sizes.values()].reduce((a, b) => a + b, 0);
    const byType = {};
    for (const [u, b] of sizes) { const k = (/\.(\w+)(?:\?|$)/.exec(new URL(u).pathname) || [, 'html'])[1]; byType[k] = (byType[k] || 0) + b; }
    const part = re => [...sizes].filter(([u]) => re.test(new URL(u).pathname)).reduce((a, [, b]) => a + b, 0);
    const scanBytes = part(/^\/scans\//), transcoderBytes = part(/^\/basis\//), cornerBytes = part(/^\/study\//), pageBytes = downloadBytes - scanBytes - transcoderBytes - cornerBytes;
    console.log(`download einstein/${n}`, downloadBytes, JSON.stringify({ pageBytes, scanBytes, transcoderBytes, cornerBytes, ...byType }));
    expect(checkBudget({ downloadBytes: pageBytes }, { downloadBytes: PHONE_BUDGET.downloadBytes })).toEqual([]);
    const cls = info.project.name === 'mobile' ? 'phone' : 'desktop';
    expect(scanBytes).toBeGreaterThan(0);
    expect(scanBytes + cornerBytes).toBeLessThanOrEqual(SCAN_LIMITS[cls].downloadBytes);
    expect(transcoderBytes).toBeLessThanOrEqual(TRANSCODER_LIMIT.downloadBytes);
    if (n === CORNER.chapter) {
      expect(cornerBytes).toBe(CORNER.bundles[cls].bytes);
    } else expect(cornerBytes).toBe(0);
  });
}

// The journey globe page: Blue Marble texture (2048 px on a phone), three.js and the page, from
// navigation until the globe is ready; and its GPU memory on the phone profile.
test('einstein journey globe is within the phone download and texture budgets', async ({ page }, info) => {
  const measure = await measureDownloads(page, u => /^https?:/.test(u));
  await page.goto('/einstein/?debug');
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  const sizes = await measure.done();
  const downloadBytes = [...sizes.values()].reduce((a, b) => a + b, 0);
  const stats = await page.evaluate(() => window.__voaGlobe.stats());
  const tex = await page.evaluate(() => window.__voaGlobe.texture());
  console.log(`globe ${info.project.name}`, downloadBytes, JSON.stringify(stats), tex.url);
  expect(checkBudget({ downloadBytes }, { downloadBytes: PHONE_BUDGET.downloadBytes })).toEqual([]);
  if (info.project.name === 'mobile') {
    expect(tex.width).toBe(2048);
    expect(checkBudget({ ...stats, downloadBytes })).toEqual([]);
  }
});

// Scanned rooms (real-scan museum, Task 3): every shipped bundle is served at the size its manifest
// records and within its device class's scanned-room limits; the self-hosted Basis transcoder is
// served from this origin within its own limit (it is fetched once and cached across rooms).
import { readdirSync, readFileSync } from 'node:fs';
import { SCAN_BUDGET, TRANSCODER_BUDGET, checkScanBundle } from '../src/museum/budget.js';
const SCANS = readdirSync('../content/scans').filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`../content/scans/${f}`, 'utf8')));
// The production output ships the scans its pages use (src/content/load.js usedScanIds); an unused
// usable scan (the Dining Room) and /tex/ are not served at all (scripts/shipped-assets.mjs).
import { usedScanIds } from '../src/content/load.js';
test('shipped scan bundles are within the scanned-room limits per device class', async ({ request }) => {
  const used = new Set(usedScanIds());
  const usable = SCANS.filter(m => m.usable !== false && used.has(m.id));
  for (const m of SCANS.filter(x => x.usable !== false && !used.has(x.id))) {
    expect((await request.get(`/${m.preview.file}`)).status(), `${m.id} is not shipped`).toBe(404);
  }
  expect((await request.get('/tex/walnut/color-512.webp')).status(), '/tex/ is not shipped').toBe(404);
  expect(usable.length).toBeGreaterThan(0);
  for (const m of usable) {
    for (const cls of Object.keys(SCAN_BUDGET)) {
      const b = m.bundles[cls];
      const res = await request.get(`/${b.file}`);
      expect(res.status(), `${m.id} ${cls}`).toBe(200);
      const bytes = (await res.body()).length;
      expect(bytes, `${m.id} ${cls}`).toBe(b.bytes);
      // The room download on this device: the sharp preview, the device bundle and the occluder.
      const extra = [];
      for (const f of [m.preview.file, m.occluder.file]) {
        const r = await request.get(`/${f}`);
        expect(r.status(), f).toBe(200);
        extra.push((await r.body()).length);
      }
      expect(extra).toEqual([m.preview.bytes, m.occluder.bytes]);
      expect(checkScanBundle({ ...b, bytes: bytes + extra[0] + extra[1] }, cls), `${m.id} ${cls}`).toEqual([]);
    }
  }
  let transcoder = 0;
  for (const f of ['basis_transcoder.js', 'basis_transcoder.wasm']) {
    const res = await request.get(`/basis/${f}`);
    expect(res.status(), f).toBe(200);
    // WebAssembly must be served as application/wasm (the preview server does; so does Vercel for .wasm).
    if (f.endsWith('.wasm')) expect(res.headers()['content-type']).toMatch(/^application\/wasm/);
    transcoder += (await res.body()).length;
  }
  console.log('basis transcoder bytes', transcoder);
  expect(transcoder).toBeLessThanOrEqual(TRANSCODER_BUDGET.downloadBytes);
});

// Review ruling (Task 5 fix round 1): the whole scanned room on the GPU, measured in the browser once
// full detail is in (the scan as transcoded plus our layer as uploaded), within SCAN_ROOM_GPU for the
// device class this browser gets: every chapter and the hallway.
import { SCAN_ROOM_GPU } from '../src/museum/budget.js';
import { roomSettled } from './room.js';
for (const path of [...CHAPTER_NUMBERS.map(n => `/einstein/${n}/`), '/hall/']) {
  test(`${path} holds the whole room within the GPU limit of its device class`, async ({ page }, info) => {
    test.setTimeout(150000);
    await page.goto(`${path}?debug`);
    await roomSettled(page);
    const cls = info.project.name === 'mobile' ? 'phone' : 'desktop';
    const s = await page.evaluate(() => ({ scan: window.__voa.scan(), gpu: window.__voa.gpuBytes() }));
    console.log(`room gpu ${path} ${cls}`, s.gpu, s.scan.phase);
    expect(s.scan.cls).toBe(cls);
    expect(s.scan.phase).toBe('full');
    expect(s.gpu).toBeLessThanOrEqual(SCAN_ROOM_GPU[cls]);
  });
}
