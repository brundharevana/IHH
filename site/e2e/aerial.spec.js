// Aerial zoom on the journey globe (src/museum/aerial.js): pin -> NASA Blue Marble region -> present-
// day aerial images -> the end view, as deep as the verified place allows (city: the neighbourhood,
// "Approximate location", no ring; building: the closest level with a ring), with the label, credits
// and "Enter the room"; Skip and Escape; reduced motion; failed or slow levels; overlapping choices;
// lazy loading within the phone budget; zoom out frees the textures.
import { test, expect } from '@playwright/test';
import { stopOf, headingOf, titleName, MAPPED, PLAIN, PLAIN_STOPS, aerialOf } from './journey-content.js';
import { creditText } from '../src/museum/aerial-plan.js';

const ready = page => expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
const stage = page => page.locator('[data-stage]');
const arrived = (page, timeout = 20000) => expect(stage(page)).toHaveAttribute('data-aerial', 'arrived', { timeout });
const idle = (page, timeout = 15000) => expect(stage(page)).toHaveAttribute('data-aerial', 'idle', { timeout });
const STACK_BUDGET = 1_500_000; // spec Budgets: aerial stack per pinned stop on a phone
const ROOM = 'mercer-street';
const room = () => stopOf(ROOM);

async function openGlobe(page, id) {
  await page.goto('/einstein/?debug');
  await ready(page);
  if (id) await expect.poll(() => page.locator(`[data-pin="${id}"]:not([data-offscreen])`).count(), { timeout: 15000 }).toBe(1);
}

// The building path, with a fixture: the same stack served with precision "building" (no shipped
// Einstein stop qualifies today: no verified fact names a street address with an OSM source).
async function asBuilding(page, id) {
  await page.route(`**/aerial/einstein/${id}/manifest.json`, async r => {
    const res = await r.fetch();
    const m = await res.json();
    await r.fulfill({ response: res, json: { ...m, precision: 'building' } });
  });
}

test('city precision: a pin with a room zooms to the neighbourhood, "Approximate location", no ring, the room link', async ({ page }) => {
  const aerial = [];
  page.on('request', r => { const p = new URL(r.url()).pathname; if (p.startsWith('/aerial/')) aerial.push(p); });
  await openGlobe(page, ROOM);
  expect(aerial).toEqual([]); // nothing loads before a pin is chosen
  const baseline = await page.evaluate(() => window.__voaAerial.textures());
  await page.locator(`[data-pin="${ROOM}"]`).click();
  await expect(stage(page)).toHaveAttribute('data-aerial', /loading|zooming/);
  await expect(page.locator('[data-aerial-skip]')).toBeVisible();
  await arrived(page);
  await expect(stage(page)).toHaveAttribute('data-aerial-precision', 'city');
  await expect(stage(page)).toHaveAttribute('data-aerial-level', '3'); // the 2 km level
  // Only levels 0-3 of this stop's stack were fetched: nothing closer than the verified place allows.
  expect(aerial.every(p => p.startsWith(`/aerial/einstein/${ROOM}/`))).toBe(true);
  expect(aerial.some(p => /\/(4|5|labels-\d)\.webp$/.test(p))).toBe(false);
  const caption = page.locator('[data-aerial-caption]');
  await expect(caption).toBeVisible();
  await expect(caption).toContainText('Present-day aerial view');
  await expect(caption).toContainText(`Approximate location: ${room().label}`);
  await expect(caption.getByRole('link', { name: /NASA Earth Observatory, Blue Marble/ })).toHaveAttribute('href', /^https:\/\//);
  await expect(caption.getByRole('link', { name: /U\.S\. Geological Survey/ })).toBeVisible();
  await expect(caption).not.toContainText('OpenStreetMap'); // no street names shown, so none credited
  await expect(caption).not.toContainText('(c)');
  await expect(page.locator('[data-aerial-mark]')).toBeHidden();
  const enter = page.locator('[data-aerial-enter]');
  await expect(enter).toBeVisible();
  await expect(enter).toHaveAttribute('href', `/einstein/${room().chapter}/`);
  await expect(enter).toHaveText(/^Enter the room: /);
  await expect(enter).toBeFocused();
  await expect(page.locator('#panel')).toBeHidden();
  await expect(page.locator('[data-tour]')).toBeHidden();
  // The end view is centred on the place.
  const s = await stage(page).boundingBox(), c = await page.evaluate(() => window.__voaAerial.centre());
  expect(Math.abs(c.x - (s.x + s.width / 2))).toBeLessThan(4);
  expect(Math.abs(c.y - (s.y + s.height / 2))).toBeLessThan(4);
  // Back to the globe: focus stays on a visible control while leaving, then returns to the pin; the
  // stack's textures are freed.
  await page.getByRole('button', { name: 'Back to the globe' }).click();
  await expect(stage(page)).toHaveAttribute('data-aerial', 'leaving');
  await expect(page.locator('[data-aerial-skip]')).toBeFocused();
  await idle(page);
  await expect(page.locator('[data-aerial-caption]')).toBeHidden();
  await expect(page.locator('[data-tour]')).toBeVisible();
  await expect(page.locator(`[data-pin="${ROOM}"]`)).toBeFocused();
  expect(await page.evaluate(() => window.__voaAerial.textures())).toBe(baseline);
  expect(await page.evaluate(() => window.__voaGlobe.pose().manual)).toBe(false);
});

test('building precision (fixture): ends on the closest level with the street names, the ring and the credits', async ({ page }) => {
  await asBuilding(page, ROOM);
  await openGlobe(page, ROOM);
  await page.locator(`[data-pin="${ROOM}"]`).click();
  await arrived(page);
  await expect(stage(page)).toHaveAttribute('data-aerial-precision', 'building');
  await expect(stage(page)).toHaveAttribute('data-aerial-level', '5');
  const levels = await page.evaluate(() => window.__voaAerial.levels());
  expect(levels).toHaveLength(6);
  expect(levels[5].label).toBe(1);
  const caption = page.locator('[data-aerial-caption]');
  await expect(caption).toContainText(`Present-day aerial view ${room().label}`);
  await expect(caption).not.toContainText('Approximate location');
  await expect(caption.getByRole('link', { name: '© OpenStreetMap contributors' })).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
  const s = await stage(page).boundingBox(), m = await page.locator('[data-aerial-mark]').boundingBox();
  expect(Math.abs(m.x + m.width / 2 - (s.x + s.width / 2))).toBeLessThan(4);
  expect(Math.abs(m.y + m.height / 2 - (s.y + s.height / 2))).toBeLessThan(4);
  await expect(page.locator('[data-aerial-enter]')).toHaveAttribute('href', `/einstein/${room().chapter}/`);
});

test('Skip ends the zoom; Escape at the end view goes back to the globe and Escape skips that too', async ({ page }) => {
  await openGlobe(page, ROOM);
  await page.locator(`[data-pin="${ROOM}"]`).click();
  const t0 = Date.now();
  await page.locator('[data-aerial-skip]').click();
  await arrived(page, 3500);
  expect(Date.now() - t0).toBeLessThan(3500);
  await expect(page.locator('[data-aerial-enter]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(stage(page)).toHaveAttribute('data-aerial', 'leaving');
  await page.keyboard.press('Escape');
  await idle(page, 1500);
});

test('Skip does not treat a level that is still loading as failed', async ({ page }) => {
  await page.route(`**/aerial/einstein/${ROOM}/3.webp`, async r => { await new Promise(f => setTimeout(f, 2500)); await r.continue(); });
  await openGlobe(page, ROOM);
  await page.locator(`[data-pin="${ROOM}"]`).click();
  await page.locator('[data-aerial-skip]').click();
  await arrived(page);
  await expect(stage(page)).toHaveAttribute('data-aerial-level', '3');
  const levels = await page.evaluate(() => window.__voaAerial.levels());
  expect(levels[3].ok).toBe(true);
  // A late level fades in over LEVEL_FADE_MS.
  await expect.poll(() => page.evaluate(() => window.__voaAerial.levels()[3].image), { timeout: 3000 }).toBe(1);
});

test('a stop without a room zooms down too and ends on its stop card; closing the card zooms out', async ({ page }) => {
  await openGlobe(page, PLAIN);
  await page.locator(`[data-pin="${PLAIN}"]`).click();
  const panel = page.locator('[data-stage] #panel');
  await expect(panel).toBeVisible({ timeout: 20000 });
  await expect(stage(page)).toHaveAttribute('data-aerial', 'arrived');
  await expect(panel.locator('#panel-title')).toContainText(headingOf(PLAIN));
  await expect(panel.locator('#panel-title')).toBeFocused();
  await expect(page.locator('[data-aerial-caption]')).toContainText(`Approximate location: ${stopOf(PLAIN).label}`);
  // Every imagery credit of the stop's stack is shown (street names are not, so OSM is not credited).
  for (const cr of aerialOf(PLAIN).credits.filter(c => c.source !== 'osm')) await expect(page.locator('[data-aerial-caption]')).toContainText(creditText(cr.text));
  await expect(page.locator('[data-aerial-caption]')).not.toContainText('OpenStreetMap');
  await expect(page.locator('[data-aerial-enter]')).toBeHidden();
  // The place is in the part of the stage the card leaves open.
  const c = await panel.boundingBox(), at = await page.evaluate(() => window.__voaAerial.centre());
  expect(at.x >= c.x && at.x <= c.x + c.width && at.y >= c.y && at.y <= c.y + c.height).toBe(false);
  await panel.getByRole('button', { name: 'Close' }).click();
  await expect(panel).toBeHidden();
  await idle(page);
  await expect(page.locator(`[data-pin="${PLAIN}"]`)).toBeFocused();
});

test('the card\'s next stop zooms out, flies along the arc and zooms in; one Skip ends the whole chain', async ({ page }) => {
  await openGlobe(page, PLAIN);
  await page.getByRole('button', { name: titleName(PLAIN), exact: true }).click();
  const panel = page.locator('[data-stage] #panel');
  await page.locator('[data-aerial-skip]').click();
  await expect(panel).toBeVisible({ timeout: 10000 });
  const next = MAPPED[MAPPED.indexOf(PLAIN) + 1];
  expect(next).toBeDefined();
  const states = [];
  await page.exposeFunction('__state', s => states.push(s));
  await page.evaluate(() => new MutationObserver(() => window.__state(document.querySelector('[data-stage]').dataset.aerial))
    .observe(document.querySelector('[data-stage]'), { attributes: true, attributeFilter: ['data-aerial'] }));
  await panel.getByRole('button', { name: 'Next stop' }).click();
  await expect(stage(page)).toHaveAttribute('data-aerial', 'leaving');
  const t0 = Date.now();
  await page.locator('[data-aerial-skip]').click(); // once
  // The chain ends where the next stop ends: its room link when it has a room, else its card.
  if (stopOf(next).chapter) await expect(page.locator('[data-aerial-enter]')).toHaveAttribute('href', `/einstein/${stopOf(next).chapter}/`, { timeout: 10000 });
  else await expect(panel.locator('#panel-title')).toContainText(headingOf(next), { timeout: 10000 });
  expect(Date.now() - t0).toBeLessThan(4000); // without the skip: about 2.4 + 2 + 4 s
  await expect(stage(page)).toHaveAttribute('data-aerial', 'arrived');
  expect(await page.evaluate(() => window.__voaAerial.current())).toBe(next);
  // Skipped steps may pass within one task (the observer then sees only their last state).
  const seen = states.filter((s, i) => s !== states[i - 1]);
  expect(seen[0]).toBe('leaving');
  expect(seen.slice(-2)).toEqual(['zooming', 'arrived']);
  expect(seen.every(s => ['leaving', 'idle', 'flying', 'loading', 'zooming', 'arrived'].includes(s))).toBe(true);
});

test('overlapping choices: only the last stop is shown and the superseded stack is freed', async ({ page }) => {
  await openGlobe(page);
  const baseline = await page.evaluate(() => window.__voaAerial.textures());
  // First choose another pinned stop, then, while it loads, a plain stop (which ends on its card).
  const first = PLAIN_STOPS[1] || MAPPED.find(id => id !== PLAIN);
  expect(first).not.toBe(PLAIN);
  const a = page.getByRole('button', { name: titleName(first), exact: true });
  const b = page.getByRole('button', { name: titleName(PLAIN), exact: true });
  await a.click();
  await b.click(); // while the first stack is loading or zooming
  await b.dblclick();
  const panel = page.locator('[data-stage] #panel');
  await expect(panel.locator('#panel-title')).toContainText(headingOf(PLAIN), { timeout: 25000 });
  expect(await page.evaluate(() => window.__voaAerial.current())).toBe(PLAIN);
  // Every texture belongs to the stop shown; after zooming out none is left.
  const levels = await page.evaluate(() => window.__voaAerial.levels());
  const loaded = levels.filter(l => l.ok).length + levels.filter(l => l.labels).length;
  expect(await page.evaluate(() => window.__voaAerial.textures())).toBeLessThanOrEqual(baseline + loaded * 2);
  await panel.getByRole('button', { name: 'Close' }).click();
  await idle(page);
  await expect.poll(() => page.evaluate(() => window.__voaAerial.textures()), { timeout: 5000 }).toBe(baseline);
});

test('reduced motion: no dolly, a fade straight to the end view', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('voa-mode', '3d'));
  await openGlobe(page, ROOM);
  const start = await page.evaluate(() => window.__voaAerial.altitude());
  await page.evaluate(() => {
    window.__alts = [];
    const tick = () => { window.__alts.push(window.__voaAerial.altitude()); if (window.__voaAerial.state() !== 'arrived') requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await page.locator(`[data-pin="${ROOM}"]`).click();
  await arrived(page, 8000);
  const alts = await page.evaluate(() => window.__alts);
  const end = alts[alts.length - 1];
  expect(end).toBeLessThan(5000);
  // Every sample is either the starting view or the end view: the camera never travelled between.
  for (const a of alts) expect(Math.abs(a - start) < 1 || Math.abs(a - end) < 1).toBe(true);
  await expect(page.locator('[data-aerial-enter]')).toHaveAttribute('href', `/einstein/${room().chapter}/`);
});

test('a level that fails to load: the view ends on the closest level that loaded', async ({ page }) => {
  await page.route(`**/aerial/einstein/${ROOM}/3.webp`, r => r.fulfill({ status: 404, body: 'gone' }));
  await openGlobe(page, ROOM);
  await page.locator(`[data-pin="${ROOM}"]`).click();
  await arrived(page);
  await expect(stage(page)).toHaveAttribute('data-aerial-level', '2');
  const levels = await page.evaluate(() => window.__voaAerial.levels());
  expect(levels[3].ok).toBe(false);
  expect(levels[2].image).toBe(1);
  await expect(page.locator('[data-aerial-caption]')).toContainText('Present-day aerial view');
  await expect(page.locator('[data-aerial-enter]')).toBeVisible();
});

test('no level loads: back over the globe with the stop card, never a black stage', async ({ page }) => {
  await page.route(`**/aerial/einstein/${ROOM}/*.webp`, r => r.fulfill({ status: 404, body: 'gone' }));
  await openGlobe(page, ROOM);
  await page.locator(`[data-pin="${ROOM}"]`).click();
  const panel = page.locator('[data-stage] #panel');
  await expect(panel).toBeVisible({ timeout: 20000 });
  await expect(panel.locator('a.room-link')).toHaveAttribute('href', `/einstein/${room().chapter}/`);
  await expect(stage(page)).toHaveAttribute('data-aerial', 'idle');
  const pose = await page.evaluate(() => window.__voaGlobe.pose());
  expect(pose.manual).toBe(false);
  expect(pose.distance).toBeGreaterThan(1.3); // the globe is in view
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true');
});

test('a missing manifest also ends on the stop card', async ({ page }) => {
  await page.route(`**/aerial/einstein/${PLAIN}/manifest.json`, r => r.fulfill({ status: 404, body: 'gone' }));
  await openGlobe(page, PLAIN);
  await page.locator(`[data-pin="${PLAIN}"]`).click();
  await expect(page.locator('[data-stage] #panel #panel-title')).toContainText(headingOf(PLAIN), { timeout: 10000 });
  await expect(stage(page)).toHaveAttribute('data-aerial', 'idle');
});

// One test per pinned stop (from the shipped journey), each with its own time budget: a single test
// walking every stop ran out of its 30 s under parallel load.
for (const id of MAPPED) {
  test(`${id}: choosing the stop loads only its own stack, within the phone budget`, async ({ page }) => {
    // Every aerial response, its body read before the sums below (not a count taken while reads run).
    const bytes = new Map(), reads = [];
    page.on('response', res => {
      const p = new URL(res.url()).pathname;
      if (!p.startsWith('/aerial/')) return;
      reads.push(res.body().then(b => bytes.set(p, b.length), () => bytes.set(p, 0)));
    });
    await openGlobe(page);
    await page.getByRole('button', { name: titleName(id), exact: true }).click();
    await page.locator('[data-aerial-skip]').click();
    await expect(stage(page)).toHaveAttribute('data-aerial', 'arrived', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await Promise.all(reads);
    const own = JSON.parse(await (await page.request.get(`/aerial/einstein/${id}/manifest.json`)).text());
    const folder = own.stack || id;
    const total = [...bytes.values()].reduce((a, b) => a + b, 0);
    expect([...bytes.keys()].every(p => p.startsWith(`/aerial/einstein/${id}/`) || p.startsWith(`/aerial/einstein/${folder}/`)), [...bytes.keys()].join(' ')).toBe(true);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(STACK_BUDGET);
  });
}
