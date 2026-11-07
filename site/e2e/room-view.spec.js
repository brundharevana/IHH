// The room as a visitor sees it: the camera never leaves the room (no backs of walls or exhibits),
// and each room opens on a composed establishing view.
import { test, expect } from '@playwright/test';
import { roomReady } from './room.js';

import { readFileSync } from 'node:fs';
import { chapter } from './content.js';
// The study is a room in the scanned Great Drawing Room (Task 5): its measured size from the manifest.
const SCAN = JSON.parse(readFileSync(new URL(`../../content/scans/${chapter(2).room.scan}.json`, import.meta.url), 'utf8'));
const PLACE = { w: SCAN.transform.extent_m[0], d: SCAN.transform.extent_m[1], h: SCAN.transform.ceiling_m };
const inside = (p, r) => Math.abs(p[0]) < r.w / 2 && Math.abs(p[2]) < r.d / 2 && p[1] > 0 && p[1] < r.h;
const pose = page => page.evaluate(() => window.__voa.cameraPose());
async function drag(page, dx, dy = 0) {
  const box = await page.locator('#room').boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 1; i <= 5; i++) await page.mouse.move(cx + (dx * i) / 5, cy + (dy * i) / 5);
  await page.mouse.up();
  await page.waitForFunction(() => !window.__voa.moving());
}

test('after flying to an exhibit, dragging turns the view in place and never leaves the room', async ({ page, isMobile }) => {
  test.skip(isMobile, 'mouse drag; the touch path uses the same controls');
  test.setTimeout(90000); // software WebGL renders every drag frame
  await page.goto('/einstein/2/?debug');
  await roomReady(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  await page.locator('#exhibits button[data-exhibit="ex1"]').click();
  await page.waitForFunction(() => !window.__voa.moving());
  await page.keyboard.press('Escape');
  await page.evaluate(() => scrollTo(0, 0));
  const start = (await pose(page)).position;
  for (const [dx, dy] of [[400, 0], [400, 0], [400, 120], [-900, -200]]) {
    await drag(page, dx, dy);
    const p = (await pose(page)).position;
    expect(inside(p, PLACE), `camera at ${p.map(v => v.toFixed(2))} is outside the room`).toBe(true);
    // Turning in place at the station: the eye does not move (it circled a target 5 cm ahead before
    // the station camera; the bound is kept).
    expect(Math.hypot(p[0] - start[0], p[2] - start[2])).toBeLessThan(0.12);
  }
});

// Task 4 fix round 1: the study opens framed on its first narrated exhibit group (west wall), every
// exhibit of that group on screen; it opened on an establishing view from the back corner before.
test('the study opens framed on its first exhibit group, inside the room at eye height, every exhibit of the group on screen', async ({ page }) => {
  await page.goto('/einstein/2/?debug');
  await roomReady(page);
  const p = await pose(page);
  expect(inside(p.position, PLACE)).toBe(true);
  expect(p.position[1]).toBeCloseTo(1.6, 1);
  // Facing the easel of the exhibit the narration starts with (Task 5: easels in the scanned room).
  const e = chapter(2).exhibits.find(x => x.id === 'ex1').easel, to = [e.x - p.position[0], e.z - p.position[2]], len = Math.hypot(...to);
  expect((p.direction[0] * to[0] + p.direction[2] * to[1]) / Math.hypot(p.direction[0], p.direction[2]) / len).toBeGreaterThan(0.6);
  const box = await page.locator('#room').boundingBox();
  const group = [];
  for (const id of ['ex1', 'ex2', 'ex3']) if (await page.evaluate(x => window.__voa.stationOf(x), id) === p.station) group.push(id);
  expect(group.length).toBeGreaterThanOrEqual(1);
  for (const id of group) {
    const pt = await page.evaluate(x => window.__voa.screenOf(x), id);
    expect(pt && pt.x > box.x && pt.x < box.x + box.width && pt.y > box.y && pt.y < box.y + box.height, `${id} in the opening frame`).toBe(true);
  }
  // Horizontal field of view at least 55 degrees, also on a phone held upright.
  const hfov = (2 * Math.atan(Math.tan((p.fov * Math.PI) / 360) * p.aspect) * 180) / Math.PI;
  expect(hfov).toBeGreaterThanOrEqual(54.9);
  expect(p.zoom).toBe(1);
});
