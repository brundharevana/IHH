// Scanned rooms (real-scan museum, Task 3) on the dev bench /dev/scan/<id>/ (PUBLIC_DEV_PAGES=1:
// npm run e2e:dev). The bench loads a real scan bundle with the production room code (scene.js,
// scanroom.js, loader.js), two easels with Einstein exhibits standing in for Task 5's placements,
// rings and the station camera. Review focus 2: a slow phone or a transcoder failure shows a loading
// view with title and progress, then the room or the Lite fallback; never a black stage.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { roomReady } from './room.js';
import { SCAN_BUDGET } from '../src/museum/budget.js';
import { readFileSync } from 'node:fs';

// Shipped file paths come from the manifests (content-hashed names, tools/build_scans.py).
const manifest = id => JSON.parse(readFileSync(`../content/scans/${id}.json`, 'utf8'));
const KH = manifest('kings-hall'), GDR = manifest('hallwyl-great-drawing-room');
const path = f => `/${f}`;
const bundle = (m, c) => path(m.bundles[c].file);

const ROOM = '/dev/scan/kings-hall/';
const cls = info => (info.project.name === 'mobile' ? 'phone' : 'desktop');
// The full-detail bundle has replaced the preview.
const fullDetail = page => expect(page.locator('#room')).toHaveAttribute('data-scan', 'full', { timeout: 100000 });
const loseContext = page => page.evaluate(() => { window.__lose = document.getElementById('room').getContext('webgl2').getExtension('WEBGL_lose_context'); window.__lose.loseContext(); });

test('a scanned room loads the bundle for the device, unlit and lit (never black), with no errors', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  const glbs = [];
  page.on('request', r => { if (/\/scans\/.*\.glb$/.test(r.url())) glbs.push(new URL(r.url()).pathname); });
  await page.goto(`${ROOM}?debug`);
  await roomReady(page);
  await fullDetail(page);
  const s = await page.evaluate(() => window.__voa.scan());
  console.log(`scan ${info.project.name}`, JSON.stringify({ cls: s.cls, bytes: s.bytes, previewMs: s.previewMs, fullMs: s.fullMs, gpu: s.gpu, mem: s.memory }));
  expect(s.id).toBe('kings-hall');
  expect(s.cls).toBe(cls(info));
  expect(s.phase).toBe('full');
  // The preview and the occluder first, then the device's bundle.
  expect(glbs.slice(0, 2).sort()).toEqual([path(KH.occluder.file), path(KH.preview.file)].sort());
  expect(glbs).toContain(bundle(KH, cls(info)));
  expect(s.gpu).toBeLessThanOrEqual(SCAN_BUDGET[s.cls].gpuBytes);
  expect(glbs).not.toContain(bundle(KH, cls(info) === 'phone' ? 'desktop' : 'phone'));
  expect(s.bytes).toBeLessThanOrEqual(SCAN_BUDGET[s.cls].downloadBytes);
  expect(s.textured).toBe(true);
  expect(s.toneMapping).toBe('none');
  // The stage shows the room: a clearly lit picture, not a black or flat frame.
  const px = await page.evaluate(() => window.__voa.pixels());
  expect(px.mean).toBeGreaterThan(40);
  expect(px.spread).toBeGreaterThan(20);
  await expect(page.locator('[data-scan-loading]')).toBeHidden();
  await expect(page.locator('[data-scan-failed]')).toBeHidden();
  // The bench's two easels have rings and stations, as a chapter's exhibits do.
  const stations = await page.evaluate(() => window.__voa.stations());
  expect(stations.length).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__voa.ring('ex1'))).toBeTruthy();
  expect(errors).toEqual([]);
});

test('?quality=phone loads the phone bundle on any device', async ({ page }) => {
  const glbs = [];
  page.on('request', r => { if (/kings-hall\/.*room\.[0-9a-f]{8}\.glb$/.test(r.url())) glbs.push(new URL(r.url()).pathname); });
  await page.goto(`${ROOM}?debug&quality=phone`);
  await roomReady(page);
  await fullDetail(page);
  expect((await page.evaluate(() => window.__voa.scan())).cls).toBe('phone');
  expect(glbs).toEqual([path(KH.preview.file), bundle(KH, 'phone')]);
});

test('the credit label names the real place, says it is not connected to the inductee, and links the licence', async ({ page }) => {
  await page.goto(`${ROOM}?debug`);
  await roomReady(page);
  const label = page.locator('[data-scan-credit]');
  await expect(label).toBeVisible();
  await expect(label).toContainText("3D scan of The King's Hall, Skokloster Castle, Sweden");
  await expect(label).toContainText('Not connected to');
  await expect(label.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
  // The credits section has the full attribution, the source and the licence link too.
  const credits = page.getByRole('region', { name: 'Room credits' });
  await expect(credits).toContainText('This work is based on');
  await expect(credits).toContainText('Scan by Erik Lernestål');
  await expect(credits.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
  await expect(credits.getByRole('link', { name: /Sketchfab/ })).toHaveAttribute('href', /sketchfab\.com\/3d-models\/the-king-s-hall/);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(r.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
});

test('on a slow network (5 Mbps): the loading view with title and byte progress, then the sharp preview, then full detail', async ({ page, context }, info) => {
  test.setTimeout(150000);
  // Record what the visitor sees, from the first paint: the loading view and its progress, the detail pill.
  await page.addInitScript(() => {
    window.__seen = { view: [], bar: [], pill: [], scan: [], cover: [] };
    new MutationObserver(() => {
      const v = document.querySelector('[data-scan-loading]'), b = v && v.querySelector('progress');
      const pl = document.querySelector('[data-scan-detail]'), pb = pl && pl.querySelector('progress'), c = document.getElementById('room');
      const t = performance.now();
      if (v) window.__seen.view.push([t, v.hidden ? 'hidden' : 'shown', v.textContent.trim().slice(0, 80)]);
      // Never a black stage while loading: once the page's styles apply (before that nothing is laid
      // out as a stage: an unstyled 300 x 150 canvas), the shown loading view covers the whole canvas.
      if (v && !v.hidden && c && getComputedStyle(v).position === 'absolute') {
        const a = v.getBoundingClientRect(), r = c.getBoundingClientRect();
        if (r.width && r.height) window.__seen.cover.push(a.left <= r.left + 1 && a.top <= r.top + 1 && a.right >= r.right - 1 && a.bottom >= r.bottom - 1);
      }
      if (b) window.__seen.bar.push([Number(b.getAttribute('value')), Number(b.getAttribute('max'))]);
      if (pl && !pl.hidden && pb) window.__seen.pill.push([Number(pb.getAttribute('value')), Number(pb.getAttribute('max'))]);
      if (c && c.dataset.scan) window.__seen.scan.push(c.dataset.scan);
    }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (5e6 / 8), uploadThroughput: (1e6 / 8) });
  const t0 = Date.now();
  await page.goto(`${ROOM}?debug`, { timeout: 60000 });
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'true', { timeout: 60000 });
  const previewAt = Date.now() - t0;
  // The preview is a lit room, not a black stage.
  await expect(page.locator('[data-scan-loading]')).toBeHidden();
  expect((await page.evaluate(() => window.__voa.scan())).phase).toBe('preview');
  expect((await page.evaluate(() => window.__voa.pixels())).mean).toBeGreaterThan(40);
  await fullDetail(page);
  const fullAt = Date.now() - t0;
  const seen = await page.evaluate(() => window.__seen);
  // The loading view showed the room's title, and its bar moved by bytes (not a spinner).
  expect(seen.view.some(([, st, txt]) => st === 'shown' && txt.includes("The King's Hall, Skokloster Castle, Sweden"))).toBe(true);
  expect(seen.bar.some(([v, m]) => v > 0 && v < m)).toBe(true);
  // The loading view covered the stage every time it was seen (restored from the Task 3 review).
  expect(seen.cover.length).toBeGreaterThan(0);
  expect(seen.cover.every(Boolean)).toBe(true);
  // The detail pill showed the full bundle streaming in, then went away.
  expect(seen.pill.some(([v, m]) => v > 0 && v < m)).toBe(true);
  await expect(page.locator('[data-scan-detail]')).toBeHidden();
  expect(seen.scan.indexOf('preview')).toBeLessThan(seen.scan.indexOf('full'));
  console.log(`slow ${info.project.name}`, JSON.stringify({ previewAt, fullAt }));
});

test('with the Basis transcoder blocked, the stage falls back to Lite with a message, never black', async ({ page }) => {
  await page.route('**/basis/**', r => r.abort());
  await page.goto(`${ROOM}?debug`);
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'failed', { timeout: 60000 });
  const fail = page.locator('[data-scan-failed]');
  await expect(fail).toBeVisible();
  await expect(fail).toContainText('could not load');
  await expect(fail.getByRole('link', { name: /Lite/ })).toBeVisible();
  await expect(fail).toBeFocused();
  await expect(page.locator('[data-scan-loading]')).toBeHidden();
  // The message covers the stage on a light ground: not a black stage.
  const bg = await fail.evaluate(el => getComputedStyle(el).backgroundColor);
  const [r, g, b] = bg.match(/\d+/g).map(Number);
  expect((r + g + b) / 3).toBeGreaterThan(150);
  const box = await fail.boundingBox(), stage = await page.locator('#room').boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(stage.width - 1);
  expect(box.height).toBeGreaterThanOrEqual(stage.height - 1);
  // The exhibit list still works without the 3D room.
  await page.locator('#show-all').click();
  await expect(page.locator('#exhibits li').first()).toBeVisible();
});

test('leaving a scanned room disposes it: two room loads leave no GPU memory behind', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto(`${ROOM}?debug`);
  await roomReady(page);
  const r = await page.evaluate(() => window.__voa.scanCycle());
  console.log('scanCycle', JSON.stringify(r));
  // Room A, then room B (A disposed), then room A again (B disposed): the renderer holds what it held.
  expect(r.ids).toEqual(['kings-hall', 'hallwyl-great-drawing-room', 'kings-hall']);
  expect(r.during.textures).toBeGreaterThan(0);
  expect(r.after).toEqual(r.before);
});

test('the next room bundle is prefetched once the room has arrived (same origin, for this device)', async ({ page }, info) => {
  const seen = [];
  page.on('request', req => { if (/hallwyl-great-drawing-room\/.*\.glb$/.test(req.url())) seen.push(new URL(req.url())); });
  await page.goto(`${ROOM}?debug`);
  await roomReady(page);
  await expect.poll(() => seen.map(u => u.pathname), { timeout: 60000 }).toContain(bundle(GDR, cls(info)));
  expect(seen.map(u => u.pathname)).toContain(path(GDR.preview.file));
  expect(seen.every(u => u.origin === new URL(page.url()).origin)).toBe(true);
});

test('Save-Data stops the prefetch', async ({ page }) => {
  const seen = [];
  await page.addInitScript(() => { Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }); });
  page.on('request', req => { if (/hallwyl-great-drawing-room/.test(req.url())) seen.push(req.url()); });
  await page.goto(`${ROOM}?debug`);
  await roomReady(page);
  await page.waitForTimeout(1500);
  expect(seen).toEqual([]);
});

test('a missing bundle (404) falls back to Lite with the message, focused', async ({ page }) => {
  await page.route('**/scans/kings-hall/**/room.*.glb', r => r.fulfill({ status: 404, body: 'not found' }));
  await page.goto(`${ROOM}?debug`);
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'failed', { timeout: 30000 });
  await expect(page.locator('[data-scan-failed]')).toBeVisible();
  await expect(page.locator('[data-scan-failed]')).toBeFocused();
  await expect(page.locator('[data-scan-loading]')).toBeHidden();
});

test('a stalled download (no bytes for 15 s) is abandoned and falls back to Lite', async ({ page }) => {
  test.setTimeout(90000);
  await page.route(`**${path(KH.preview.file)}`, () => { /* never answered */ });
  const t0 = Date.now();
  await page.goto(`${ROOM}?debug`);
  await expect(page.locator('[data-scan-loading]')).toBeVisible();
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'failed', { timeout: 45000 });
  expect(Date.now() - t0).toBeGreaterThanOrEqual(14000);
  await expect(page.locator('[data-scan-failed]')).toBeVisible();
  await expect(page.locator('[data-scan-loading]')).toBeHidden();
});

test('a stalled Basis transcoder (/basis/ never answers, GLBs arrive) is abandoned and falls back to Lite', async ({ page }) => {
  // Codex gate 2026-10-14: the inactivity rule covers starting the transcoder and parsing, not only
  // the downloads; before, the loading view waited for ever.
  test.setTimeout(90000);
  await page.route('**/basis/**', () => { /* never answered */ });
  const t0 = Date.now();
  await page.goto(`${ROOM}?debug`);
  await expect(page.locator('[data-scan-loading]')).toBeVisible();
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'failed', { timeout: 45000 });
  expect(Date.now() - t0).toBeGreaterThanOrEqual(14000);
  const fail = page.locator('[data-scan-failed]');
  await expect(fail).toBeVisible();
  await expect(fail.getByRole('link', { name: /Lite/ })).toBeVisible();
  await expect(fail).toBeFocused();
  await expect(page.locator('[data-scan-loading]')).toBeHidden();
});

test('if only the full bundle fails, the sharp preview stays as the room', async ({ page }, info) => {
  await page.route(`**${bundle(KH, cls(info))}`, r => r.fulfill({ status: 404, body: 'not found' }));
  await page.goto(`${ROOM}?debug`);
  await roomReady(page);
  await expect(page.locator('#room')).toHaveAttribute('data-scan', 'preview-only', { timeout: 30000 });
  await expect(page.locator('[data-scan-failed]')).toBeHidden();
  await expect(page.locator('[data-scan-detail]')).toBeHidden();
  expect((await page.evaluate(() => window.__voa.pixels())).mean).toBeGreaterThan(40);
});

test('WebGL context lost after load: the fallback card, then the room again on restore', async ({ page }) => {
  await page.goto(`${ROOM}?debug`);
  await roomReady(page);
  await fullDetail(page);
  await loseContext(page);
  await expect(page.locator('#room')).toHaveAttribute('data-context', 'lost');
  await expect(page.locator('[data-scan-failed]')).toBeVisible();
  await page.evaluate(() => window.__lose.restoreContext());
  await expect(page.locator('#room')).toHaveAttribute('data-context', 'restored');
  await expect(page.locator('[data-scan-failed]')).toBeHidden();
  await expect.poll(async () => (await page.evaluate(() => window.__voa.pixels())).mean, { timeout: 30000 }).toBeGreaterThan(40);
});

test('WebGL context lost during the load: the fallback card, never a black stage', async ({ page, context }) => {
  test.setTimeout(90000);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (2e6 / 8), uploadThroughput: (1e6 / 8) });
  await page.goto(`${ROOM}?debug`);
  await expect(page.locator('[data-scan-loading]')).toBeVisible();
  // The renderer exists once bytes are streaming (the loader set needs it): lose its context then.
  await page.waitForFunction(() => Number(document.querySelector('[data-scan-loading] progress').getAttribute('value')) > 0);
  await loseContext(page);
  await expect(page.locator('[data-scan-failed]')).toBeVisible();
  await expect(page.locator('[data-scan-loading]')).toBeHidden();
  // While the card is up: no detail pill over it, and the canvas is never marked ready.
  await page.waitForTimeout(3000);
  await expect(page.locator('[data-scan-detail]')).toBeHidden();
  expect(await page.locator('#room').getAttribute('data-ready')).not.toBe('true');
});

test('WebGL context lost while full detail streams in: no detail pill over the card, not ready', async ({ page, context }) => {
  test.setTimeout(90000);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (2e6 / 8), uploadThroughput: (1e6 / 8) });
  await page.goto(`${ROOM}?debug`);
  await roomReady(page);
  await expect(page.locator('[data-scan-detail]')).toBeVisible();
  await loseContext(page);
  await expect(page.locator('[data-scan-failed]')).toBeVisible();
  await expect(page.locator('[data-scan-detail]')).toBeHidden();
  expect(await page.locator('#room').getAttribute('data-ready')).toBe('false');
  // The full bundle keeps streaming behind the card; the pill stays away.
  await page.waitForTimeout(3000);
  await expect(page.locator('[data-scan-detail]')).toBeHidden();
  await page.evaluate(() => window.__lose.restoreContext());
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('[data-scan-failed]')).toBeHidden();
});
