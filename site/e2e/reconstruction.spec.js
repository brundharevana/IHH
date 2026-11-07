// Runs against the dev bench (/dev/reconstruction/) built with PUBLIC_DEV_PAGES=1: npm run e2e:dev.
// The place is a clearly fake PLACEHOLDER test room (src/content/dev-place.js); no verified basis
// photo of a real place exists yet. The room code, plaque, labels and look-around are production code.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { roomReady } from './room.js';

const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 0.02);
// Viewpoints stand at (0, 1.6, 0) in the 4 x 5 m test place and look at the wall at 1.2 m.
const unit = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
const FACING = { north: unit([0, -0.4, -2.5]), east: unit([2, -0.4, 0]), south: unit([0, -0.4, 2.5]) };
const direction = page => page.evaluate(() => window.__voa.cameraPose().direction);

test('plaque cites each basis photo with a link to the original, unseen walls are named', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/dev/reconstruction/?debug');
  await roomReady(page);
  const plaque = page.getByRole('region', { name: 'Reconstruction based on' });
  await expect(plaque).toBeVisible();
  await expect(plaque.locator('li')).toHaveText([
    /PLACEHOLDER basis photograph 1, PLACEHOLDER holder, accessed PLACEHOLDER/,
    /PLACEHOLDER basis photograph 2, PLACEHOLDER holder, accessed PLACEHOLDER/,
  ]);
  const links = plaque.getByRole('link', { name: /^See the original photograph/ });
  await expect(links).toHaveCount(2);
  await expect(links.first()).toHaveAttribute('href', 'https://example.org/placeholder-photo-1');
  await expect(plaque.locator('[data-unseen]')).toHaveText('Not shown in the source photographs: south wall, west wall.');
  await expect(plaque.locator('[data-disclosure]')).toHaveText('Colours and lighting are not from the source photographs.');
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(r.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  expect(errors).toEqual([]);
});

// Task 4 fix round 1: the place opens on the framed station of its first exhibit group (it opened on
// an establishing view from the south-east corner, turned to the exit door on a wide screen, before).
test('starts framed on its first exhibit group, and the viewpoint buttons face each wall from the centre', async ({ page }) => {
  await page.goto('/dev/reconstruction/?debug');
  await roomReady(page);
  const pose = await page.evaluate(() => window.__voa.cameraPose());
  const stations = await page.evaluate(() => window.__voa.stations());
  expect(pose.station).toBe(stations[0].id);
  expect(near(pose.position, stations[0].position)).toBe(true);
  const box = await page.locator('#room').boundingBox();
  const ids = (await page.locator('#exhibits button[data-exhibit]').evaluateAll(b => b.map(x => x.dataset.exhibit)));
  const framed = [];
  for (const id of ids) if (await page.evaluate(x => window.__voa.stationOf(x), id) === pose.station) framed.push(id);
  expect(framed.length).toBeGreaterThanOrEqual(1);
  for (const id of framed) {
    const pt = await page.evaluate(x => window.__voa.screenOf(x), id);
    expect(pt.x > box.x && pt.x < box.x + box.width && pt.y > box.y && pt.y < box.y + box.height, `${id} in the first frame`).toBe(true);
  }
  const group = page.getByRole('group', { name: 'Look around' });
  await expect(group.getByRole('button')).toHaveCount(4);
  await group.getByRole('button', { name: 'Face the east wall' }).click();
  await expect.poll(async () => near(await direction(page), FACING.east)).toBe(true);
  await expect.poll(async () => near((await page.evaluate(() => window.__voa.cameraPose())).position, [0, 1.6, 0])).toBe(true);
});

// Real-scan museum spec (Camera): under reduced motion a move is a short fade with a cut, not a glide;
// it was a jump on the next frame before. The camera shows only the two end poses.
test('reduced motion moves to a viewpoint with a 300 ms fade and a cut, without a flight', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Reduced motion defaults to Lite; this test is about the room, so make the explicit 3D choice a visitor would.
  await page.addInitScript(() => localStorage.setItem('voa-mode', '3d'));
  await page.goto('/dev/reconstruction/?debug');
  await roomReady(page);
  const before = await direction(page);
  // Record every drawn direction until the move ends.
  await page.evaluate(() => {
    window.__dirs = [];
    const rec = () => { window.__dirs.push(window.__voa.cameraPose().direction); if (window.__dirs.length < 120) requestAnimationFrame(rec); };
    requestAnimationFrame(rec);
  });
  await page.getByRole('button', { name: 'Face the south wall' }).click();
  await expect.poll(async () => near(await direction(page), FACING.south), { timeout: 3000 }).toBe(true);
  const t0 = Date.now();
  await page.locator('#room[data-camera="rest"]').waitFor();
  expect(Date.now() - t0).toBeLessThan(1000);
  const dirs = await page.evaluate(() => window.__dirs);
  expect(dirs.every(d => near(d, before) || near(d, FACING.south)), 'only the two end poses are drawn').toBe(true);
  await expect.poll(() => page.locator('[data-stage-fade]').evaluate(el => Number(getComputedStyle(el).opacity))).toBe(0);
});

test('exhibits in a reconstructed place use the numbered list and panel', async ({ page }) => {
  await page.goto('/dev/reconstruction/');
  await roomReady(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  const first = page.locator('#exhibits button').first();
  await expect(first).toHaveText('1. PLACEHOLDER exhibit');
  await first.click();
  const panel = page.getByRole('dialog', { name: '1. PLACEHOLDER exhibit' });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('link', { name: 'See the original' })).toHaveAttribute('href', 'https://example.org/placeholder-original');
  await page.keyboard.press('Escape');
  await expect(first).toBeFocused();
});
