// The Einstein rooms and the hallway in real scans (real-scan museum Task 5). One room style per
// inductee (owner amendment 2026-10-13): every Einstein chapter is its own room built from the Hallwyl
// Great Drawing Room scan, with its own easels, stations and credit; the hallway is the King's Hall.
// Review focus 4: two chapters on the same scan show only their own exhibits and credits.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { chapter, CHAPTER_NUMBERS } from './content.js';
import { JOURNEY } from './journey-content.js';
import { roomReady } from './room.js';

test.beforeEach(() => test.setTimeout(120000)); // SwiftShader: scanned rooms decode and draw on the CPU

const QA = process.env.QA_DIR || new URL('../test-results/qa/', import.meta.url).pathname; // screenshots for review (set QA_DIR to keep them elsewhere)
const root = new URL('../../', import.meta.url);
const json = p => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const HALL = json('content/hall.json');
const SCAN = id => json(`content/scans/${id}.json`);
const INDUCTEES = readdirSync(new URL('data/inductees/', root)).filter(s => { try { readFileSync(new URL(`data/inductees/${s}/inductee.json`, root)); return true; } catch { return false; } })
  .map(s => json(`data/inductees/${s}/inductee.json`));
const nameOf = slug => INDUCTEES.find(i => i.slug === slug).name;
const cls = info => (info.project.name === 'mobile' ? 'phone' : 'desktop');
const fullDetail = page => expect(page.locator('#room')).toHaveAttribute('data-scan', 'full', { timeout: 100000 });

for (const n of CHAPTER_NUMBERS) {
  test(`room ${n} is its own room in the Great Drawing Room scan: its easels, rings and credit only`, async ({ page }, info) => {
    const ch = chapter(n), m = SCAN(ch.room.scan);
    await page.goto(`/einstein/${n}/?debug`);
    await roomReady(page);
    await fullDetail(page);
    const s = await page.evaluate(() => window.__voa.scan());
    expect(s.id).toBe('hallwyl-great-drawing-room');
    expect(s.phase).toBe('full');
    // Every exhibit of this chapter has a ring and a thumbnail; nothing of another chapter does.
    const own = ch.exhibits.map(e => e.id).sort();
    expect((await page.locator('[data-rail]').evaluateAll(els => els.map(e => e.dataset.rail))).sort()).toEqual(own);
    for (const id of own) expect(await page.evaluate(x => window.__voa.ring(x), id)).toBeTruthy();
    for (const id of ['ex1', 'ex2', 'ex3', 'ex4', 'ex5'].filter(x => !own.includes(x))) expect(await page.evaluate(x => window.__voa.ring(x), id)).toBeNull();
    // The credit names the real place and says it is not connected to Einstein.
    const label = page.locator('[data-scan-credit]');
    await expect(label).toContainText(m.label.slice(0, 40));
    await expect(label).toContainText('Not connected to Albert Einstein.');
    await expect(page.getByRole('region', { name: 'Room credits' })).toContainText(m.credit.slice(0, 60));
    // Lit, drawn, the room's own opening station.
    expect((await page.evaluate(() => window.__voa.pixels())).mean).toBeGreaterThan(40);
    await page.locator('#room[data-camera="rest"]').waitFor();
    await page.locator('[data-stage]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${QA}/t5-room${n}-${info.project.name}.png` });
    expect(cls(info)).toBe(s.cls);
  });
}

test('two chapters on one scan: each page stands its own exhibits and stations, none of the other\'s', async ({ page }) => {
  const [a, b] = CHAPTER_NUMBERS.filter(n => chapter(n).room.scan === 'hallwyl-great-drawing-room');
  const seen = {};
  for (const n of [a, b]) {
    await page.goto(`/einstein/${n}/?debug`);
    await roomReady(page);
    seen[n] = {
      stations: (await page.evaluate(() => window.__voa.stations())).map(s => JSON.stringify(s.position.map(v => v.toFixed(2)))),
      rail: await page.locator('[data-rail]').evaluateAll(els => els.map(e => e.getAttribute('aria-label'))),
      title: await page.locator('h1').textContent(),
    };
    expect(seen[n].rail).toEqual([...chapter(n).exhibits].sort((x, y) => x.number - y.number).map(e => `Exhibit ${e.number}: ${e.title}`));
    await expectRailNamesCarryTheirNumbers(page);
  }
  expect(seen[a].title).not.toBe(seen[b].title);
  // Different easel layouts: no station of one room is a station of the other.
  expect(seen[a].stations.filter(s => seen[b].stations.includes(s))).toEqual([]);
});

test('story mode from Washington to San Diego: the next room is prefetched during the narration and loads from it', async ({ page }) => {
  const stops = JOURNEY.stops.filter(s => s.chapter !== undefined);
  const from = stops.find(s => s.id === 'washington-1921').chapter, to = stops.find(s => s.id === 'san-diego-1930').chapter;
  expect(chapter(from).room.scan).toBe(chapter(to).room.scan);
  const m = SCAN(chapter(to).room.scan);
  await page.goto(`/einstein/${from}/?story=1&debug`);
  await roomReady(page);
  await fullDetail(page);
  // The narration plays (press Play if the browser held the story's autoplay); the next room's
  // bundles are prefetched while it plays.
  if (await page.evaluate(() => document.getElementById('narration').paused)) await page.locator('[data-play]').click();
  await expect.poll(() => page.evaluate(() => !document.getElementById('narration').paused)).toBe(true);
  const prefetched = page.waitForRequest(r => new URL(r.url()).pathname === `/${m.preview.file}` && r.isNavigationRequest() === false, { timeout: 60000 });
  await prefetched;
  // The story goes on to the next room by itself after the narration and its countdown.
  await page.waitForURL(`**/einstein/${to}/**`, { waitUntil: 'commit', timeout: 90000 });
  await roomReady(page);
  await fullDetail(page);
  // The arriving room's preview came from the HTTP cache the prefetch filled.
  const cached = await page.evaluate(p => performance.getEntriesByType('resource').filter(e => new URL(e.name).pathname === p).map(e => ({ transfer: e.transferSize, body: e.decodedBodySize })), `/${m.preview.file}`);
  expect(cached.length).toBeGreaterThan(0);
  expect(cached[0].transfer, 'preview served from the prefetch cache').toBeLessThan(cached[0].body);
});

// Every rail thumbnail's accessible name starts with the number it shows (WCAG 2.5.3 label in name).
async function expectRailNamesCarryTheirNumbers(page) {
  const rails = await page.locator('[data-rail]').evaluateAll(els => els.map(e => [e.getAttribute('aria-label'), e.querySelector('.rail-num')?.textContent.trim()]));
  expect(rails.length).toBeGreaterThan(0);
  for (const [name, num] of rails) expect(name, name).toMatch(new RegExp(`(^|\\D)${num}(\\D|$)`));
}

test.describe('the hallway', () => {
  test('five easels in the King\'s Hall, each labelled with its inductee and linked to the journey map where it exists', async ({ page }, info) => {
    await page.goto('/hall/?debug');
    await roomReady(page);
    await fullDetail(page);
    expect((await page.evaluate(() => window.__voa.scan())).id).toBe(HALL.scan);
    expect(HALL.easels.length).toBe(5);
    const rail = page.getByRole('group', { name: 'Inductees in the hallway' });
    for (const [i, e] of HALL.easels.entries()) {
      const item = rail.locator(`[data-rail="${e.slug}"]`);
      await expect(item).toBeVisible();
      const built = e.slug === 'einstein';
      // The visible number is part of the name (speech input says what it sees: Codex gate 2026-10-14).
      await expect(item).toHaveAccessibleName(`${i + 1}. ${nameOf(e.slug)}: ${built ? 'journey map' : 'journey in preparation'}`);
      if (built) await expect(item).toHaveAttribute('href', `/${e.slug}/`);
      expect(await page.evaluate(x => window.__voa.ring(x), e.slug), `${e.slug} ring`).toBeTruthy();
      await expect(page.locator('#exhibits li').nth(i)).toContainText(`${i + 1}. ${nameOf(e.slug)}`);
    }
    await expectRailNamesCarryTheirNumbers(page);
    // The credit: the real place, and that it is not connected to the Hall of Honor or the inductees.
    await expect(page.locator('[data-scan-credit]')).toContainText("3D scan of The King's Hall, Skokloster Castle, Sweden");
    await expect(page.locator('[data-scan-credit]')).toContainText('Not connected to the Immigrant Hall of Honor or its inductees.');
    await page.locator('#room[data-camera="rest"]').waitFor();
    await page.locator('[data-stage]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${QA}/t5-hall-${info.project.name}.png` });
  });

  test('the portrait easel shows the licence-cleared painted portrait; the others a name card', async ({ page }) => {
    const portraits = [];
    page.on('request', r => { if (/\/portraits\//.test(r.url())) portraits.push(new URL(r.url()).pathname); });
    await page.goto('/hall/?debug');
    await roomReady(page);
    expect(portraits).toContain('/portraits/einstein.webp');
    expect(portraits.filter(p => !p.startsWith('/portraits/einstein'))).toEqual([]);
    await expect(page.locator('[data-rail="einstein"] img')).toHaveAttribute('src', '/portraits/einstein.webp');
    for (const e of HALL.easels.filter(x => x.slug !== 'einstein')) await expect(page.locator(`[data-rail="${e.slug}"] .rail-card`)).toBeAttached();
  });

  test('choosing the Einstein easel opens his journey map; an inductee in preparation opens a card', async ({ page }) => {
    await page.goto('/hall/?debug');
    await roomReady(page);
    const other = HALL.easels.find(e => e.slug !== 'einstein').slug;
    await page.locator(`[data-rail="${other}"]`).click();
    const panel = page.getByRole('dialog', { name: nameOf(other) });
    await expect(panel).toBeVisible({ timeout: 20000 });
    await expect(panel.locator('[data-coming-soon]')).toHaveText('Journey in preparation.');
    await page.keyboard.press('Escape');
    await expect(page.locator(`[data-rail="${other}"]`)).toBeFocused();
    // The Einstein ring, clicked in the room: he is number 1, so the hallway opens on his station.
    await page.goto('/hall/?debug');
    await roomReady(page);
    await page.locator('#room[data-camera="rest"]').waitFor();
    await page.locator('[data-stage]').scrollIntoViewIfNeeded();
    const ring = await page.evaluate(() => window.__voa.ring('einstein'));
    expect(ring.visible).toBe(true);
    await page.mouse.click(ring.screen.x, ring.screen.y);
    await page.waitForURL('**/einstein/');
  });

  test('keyboard: the rail item is a link to the journey map', async ({ page }) => {
    await page.goto('/hall/');
    await roomReady(page);
    await page.locator('[data-rail="einstein"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForURL('**/einstein/');
  });

  test('the home page links the hallway', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Enter the hallway' })).toHaveAttribute('href', '/hall/');
  });
});
