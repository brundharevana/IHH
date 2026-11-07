// The Washington, D.C., 1921 and San Diego, 1930 rooms (journey stops washington-1921 and
// san-diego-1930): each loads as a gallery with its shipped narration and exhibits, each line that
// names an exhibit highlights it, every exhibit panel shows the holder's credit and rights wording
// verbatim and links to the original (a CC BY item also its licence and the change made), the doors
// follow the journey order, and the story goes from Washington to San Diego by the globe: it starts
// over Washington's pin (no Washington stack is loaded), flies the arc, zooms in to San Diego and
// enters the room. Text, media and order are read from the shipped content and records, not hard-coded.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { chapter, revealOrder, revealCue } from './content.js';
import { JOURNEY, stopOf } from './journey-content.js';
import { seekNarration } from './narration.js';
import { roomReady } from './room.js';

test.beforeEach(() => test.setTimeout(180000)); // SwiftShader: rooms, zooms and walks on the CPU

const QA = process.env.QA_DIR || new URL('../test-results/qa/', import.meta.url).pathname; // screenshots for review (set QA_DIR to keep them elsewhere)
const media = new Map(readFileSync(new URL('../../data/inductees/einstein/media.jsonl', import.meta.url), 'utf8')
  .split('\n').filter(l => l.trim()).map(l => JSON.parse(l)).map(m => [m.id, m]));
// Rooms in journey order (each chapter once), as the site orders them.
const ROOMS = [];
for (const s of JOURNEY.stops) if (s.chapter !== undefined && !ROOMS.some(r => r.n === s.chapter)) ROOMS.push({ id: s.id, n: s.chapter, pinned: Boolean(s.map), title: chapter(s.chapter).title });
const roomOf = id => ROOMS.find(r => r.id === id);
const NEW = ['washington-1921', 'san-diego-1930'];
const ready = roomReady;
const seekToCue = (page, cue, dt = 0.1) => seekNarration(page, { cue, dt });

test('the new rooms are on the journey in time order, both pinned, before 112 Mercer Street', () => {
  const ids = JOURNEY.stops.map(s => s.id);
  const [w, sd] = NEW.map(id => ids.indexOf(id));
  expect(w).toBeGreaterThan(-1);
  expect(sd).toBe(w + 1);
  expect(ids.indexOf('mercer-street')).toBeGreaterThan(sd);
  expect(ids.indexOf('us-citizen')).toBeGreaterThan(sd);
  for (const id of NEW) expect(stopOf(id).map, id).toBeDefined();
  // A room's stops in date order: Washington 1921, San Diego 1930.
  expect(NEW.map(id => stopOf(id).date)).toEqual(['1921', '1930']);
});

for (const id of NEW) {
  test(`${id}: the room loads with its title, narration lines and fact chips, and passes axe`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    const r = roomOf(id), ch = chapter(r.n);
    await page.goto(`/einstein/${r.n}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(ch.title);
    await ready(page);
    await expect(page.locator('#narration')).toHaveAttribute('src', `/audio/einstein/${r.n}-narration.mp3`);
    await page.waitForFunction(n => (document.getElementById('cues').track.cues || []).length === n, ch.narration.length);
    for (const l of ch.narration) await expect(page.locator('details.transcript')).toContainText(l.text);
    await page.screenshot({ path: `${QA}/rooms5-${id}-${test.info().project.name}.png` });
    const a = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
    expect(a.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(`${id}: each line that names an exhibit highlights it`, async ({ page }) => {
    const r = roomOf(id), ch = chapter(r.n);
    await page.goto(`/einstein/${r.n}/`);
    await ready(page);
    await page.waitForFunction(n => (document.getElementById('cues').track.cues || []).length === n, ch.narration.length);
    const order = revealOrder(r.n);
    expect(order.length).toBe(ch.exhibits.length);
    for (const ex of order) {
      const cue = revealCue(r.n, ex);
      await seekToCue(page, cue);
      await expect(page.locator(`[data-rail="${ex}"]`)).toHaveClass(/is-active/); // its thumbnail (the ring's DOM equivalent)
      await expect(page.locator(`#exhibits li[data-item="${ex}"]`)).toHaveClass(/is-active/);
      await expect(page.locator(`.transcript [data-line="${ch.narration.findIndex(l => l.cue === cue)}"]`)).toHaveClass(/is-current/);
    }
  });

  test(`${id}: every exhibit panel shows the holder's credit and rights verbatim and links to the original`, async ({ page }) => {
    const r = roomOf(id), ch = chapter(r.n);
    await page.goto(`/einstein/${r.n}/`);
    await ready(page);
    await page.getByRole('button', { name: 'Show all exhibits' }).click();
    for (const ex of ch.exhibits) {
      const m = media.get(ex.media_id), name = `${ex.number}. ${ex.title}`;
      await page.getByRole('button', { name, exact: true }).click();
      const panel = page.getByRole('dialog', { name });
      await expect(panel).toBeVisible();
      await expect(panel.getByRole('img', { name: m.title })).toBeVisible();
      await expect.poll(() => panel.getByRole('img', { name: m.title }).evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
      const meta = panel.locator('dl.meta');
      await expect(meta).toContainText(m.credit);
      await expect(meta).toContainText(m.rights_statement);
      for (const n of ex.notes) await expect(panel).toContainText(n.text);
      await expect(panel.getByRole('link', { name: 'See the original' })).toHaveAttribute('href', media.get(ex.original_media_id).url);
      // Long holder wording (URLs in a rights statement, the licence link) wraps inside the panel.
      expect(await panel.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      // A photo dated by its holder shows that wording, as the holder gives it.
      if (ex.holder_date) await expect(meta.locator('[data-holder-date]')).toHaveText(`${ex.holder_date} (as the holder dates it)`);
      else await expect(meta.locator('[data-holder-date]')).toHaveCount(0);
      if (['cc-by', 'cc-by-sa'].includes(m.license_class)) {
        await expect(meta.locator('a[data-licence]')).toHaveAttribute('href', m.rights_url);
        await expect(meta.locator('a[data-licence]')).toHaveText(/^CC BY(-SA)? \d\.\d$/);
        await expect(meta).toContainText(`“${m.title}”`);
        await expect(meta).toContainText('Resized from the holder’s file.');
      } else {
        await expect(meta.locator('a[data-licence]')).toHaveCount(0);
      }
      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
    }
  });

  test(`${id}: holder photo dates show in the exhibit list, with the room's note that the dates are the holder's`, async ({ page }) => {
    const r = roomOf(id), ch = chapter(r.n);
    await page.goto(`/einstein/${r.n}/`);
    await ready(page);
    const dated = ch.exhibits.filter(e => e.holder_date);
    await expect(page.locator('[data-holder-note]')).toHaveCount(dated.length ? 1 : 0);
    await page.getByRole('button', { name: 'Show all exhibits' }).click();
    for (const e of ch.exhibits) {
      const item = page.locator(`#exhibits li[data-item="${e.id}"] [data-holder-date]`);
      if (e.holder_date) await expect(item).toHaveText(`Photo date: ${e.holder_date}`); else await expect(item).toHaveCount(0);
    }
  });

  test(`${id}: the doors lead in journey order`, async ({ page }) => {
    const i = ROOMS.findIndex(r => r.id === id), r = ROOMS[i];
    await page.goto(`/einstein/${r.n}/`);
    await ready(page);
    const next = ROOMS[i + 1], prev = ROOMS[i - 1];
    await expect(page.locator('a[data-door="exit"]')).toHaveAttribute('href', next ? `/einstein/${next.n}/` : '/einstein/end/');
    await expect(page.locator('a[data-door="entrance"]')).toHaveAttribute('href', prev ? `/einstein/${prev.n}/` : '/einstein/');
  });
}

test('Washington to San Diego in the story: over the Washington pin, the arc, the zoom to San Diego, then the room', async ({ page }, info) => {
  const W = roomOf('washington-1921'), SD = roomOf('san-diego-1930');
  expect(ROOMS.indexOf(SD)).toBe(ROOMS.indexOf(W) + 1);
  expect(W.pinned && SD.pinned).toBe(true);
  const aerialRequests = [];
  page.on('request', r => { const m = /\/aerial\/einstein\/([^/]+)\//.exec(r.url()); if (m) aerialRequests.push(m[1]); });
  // On the globe page, record every aerial and story state the stage passes through.
  await page.addInitScript(() => {
    if (!/^\/einstein\/$/.test(location.pathname)) return;
    window.__trip = [];
    document.addEventListener('DOMContentLoaded', () => {
      const stage = document.querySelector('[data-stage]');
      if (!stage) return;
      new MutationObserver(() => {
        const s = `${stage.dataset.aerial || '-'}/${stage.dataset.story || '-'}`;
        if (window.__trip[window.__trip.length - 1] !== s) window.__trip.push(s);
        sessionStorage.setItem('voa-trip', JSON.stringify(window.__trip));
      }).observe(stage, { attributes: true, attributeFilter: ['data-aerial', 'data-story'] });
    });
  });
  await page.goto(`/einstein/${W.n}/?story=1`);
  await ready(page);
  // The visitor presses Play (a pasted story URL never autoplays), then the narration runs to its end.
  await page.waitForFunction(() => { const a = document.getElementById('narration'); return a && Number.isFinite(a.duration) && a.duration > 1; });
  await page.locator('[data-play]').click();
  await seekNarration(page, { end: 0.4 });
  await expect(page.locator('[data-story-card] [data-story-text]')).toHaveText(new RegExp(`^Continuing to ${SD.title} in [1-5] s$`), { timeout: 15000 });
  // The room leaves to the globe page for the trip.
  await page.waitForURL(`**/einstein/?story=1&from=${W.id}`, { timeout: 30000 });
  const stage = page.locator('[data-stage]');
  await expect(stage).toHaveAttribute('data-aerial', 'flying', { timeout: 30000 });
  await page.screenshot({ path: `${QA}/rooms5-trip-arc-${info.project.name}.png` });
  await expect(stage).toHaveAttribute('data-story', 'hold', { timeout: 60000 });
  await expect(stage).toHaveAttribute('data-aerial', 'arrived');
  await expect(stage).toHaveAttribute('data-aerial-precision', 'city');
  await expect(page.getByRole('group', { name: 'Story' })).toContainText(`Entering ${SD.title}`);
  await page.screenshot({ path: `${QA}/rooms5-trip-sandiego-${info.project.name}.png` });
  // Then the San Diego room, with the narration started (the trip was reached through the story).
  await page.waitForURL(`**/einstein/${SD.n}/?story=1&from=${W.id}`, { timeout: 30000, waitUntil: 'commit' });
  await ready(page);
  // The globe's states, kept in session storage across the move to the room.
  const trip = JSON.parse(await page.evaluate(() => sessionStorage.getItem('voa-trip')) || '[]');
  // In order: the arc, then the zoom into San Diego, then the hold; never a zoom at Washington.
  const at = s => trip.findIndex(x => x.startsWith(s));
  expect(at('flying/')).toBeGreaterThan(-1);
  expect(at('zooming/')).toBeGreaterThan(at('flying/'));
  expect(trip.findIndex(x => x === 'arrived/hold')).toBeGreaterThan(at('zooming/'));
  expect(aerialRequests).not.toContain(W.id);
  expect(aerialRequests).toContain(SD.id);
  await expect(page.getByRole('heading', { level: 1, name: SD.title })).toBeFocused();
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-story-autoplay', 'playing');
  await expect(page.locator('[data-story-announce]')).toContainText(`Now in: ${SD.title}`);
  // The page is visible after the fades (no layer left over the room).
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).opacity)).toBe('1');
});

test('Close story during the Washington to San Diego arc stops the trip where it is, and the page stays visible', async ({ page }) => {
  const W = roomOf('washington-1921');
  await page.goto(`/einstein/?story=1&from=${W.id}`);
  const stage = page.locator('[data-stage]');
  // Close story while the arc is flown. Pressed in the page the moment the stage reports the flight: a
  // click sent from the test after seeing 'flying' could land, on a loaded machine, after the arc had
  // ended and the zoom in begun (that step is then completed by design: flake-report 2026-10-12).
  const closeBtn = page.getByRole('group', { name: 'Story' }).getByRole('button', { name: 'Close story' });
  await expect(closeBtn).toBeVisible();
  const closedIn = await closeBtn.evaluate(btn => new Promise(resolve => {
    const st = document.querySelector('[data-stage]');
    const tryClose = () => { if (st.dataset.aerial !== 'flying') return false; btn.click(); resolve(st.dataset.aerial); return true; };
    if (tryClose()) return;
    const mo = new MutationObserver(() => { if (tryClose()) mo.disconnect(); });
    mo.observe(st, { attributes: true, attributeFilter: ['data-aerial'] });
  }));
  expect(closedIn).toBe('flying');
  await expect(page.locator('[data-story-bar]')).toBeHidden();
  await page.waitForTimeout(8000);
  expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe('/einstein/');
  await expect(stage).not.toHaveAttribute('data-aerial', /zooming|arrived/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).opacity)).toBe('1');
});
