// The camera follows the narration (owner review 4, 2026-10-14). In every Einstein room, at each cue
// that names exhibits (or, for the study's museum note, the recreated corner), the camera reaches the
// framed close view of exactly them: every named exhibit wholly visible on the canvas, clear of the
// stage's controls (the free band, on every screen) and at least the owner-intent share of the frame height (framing.js
// minExhibitShare); the museum note shows the whole corner. Desktop 1440 x 900 and phone 390 x 844.
// A visitor who has just dragged, or who has the panel open, is not moved.
// Screenshots per cue: scratchpad qa/cf-*.png.
import { test, expect } from '@playwright/test';
import { chapter, CHAPTER_NUMBERS, lineNames } from './content.js';
import { seekNarration } from './narration.js';
import { roomReady } from './room.js';
import { FRAMING } from '../src/museum/framing.js';

test.beforeEach(() => test.setTimeout(240000)); // SwiftShader: scanned rooms draw on the CPU
const QA = process.env.QA_DIR || new URL('../test-results/qa/', import.meta.url).pathname; // screenshots for review (set QA_DIR to keep them elsewhere)
const VIEWPORT = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

// [{ cue, target }] for the lines that ask the camera to frame something (follow.js cueTarget).
const cueTargets = n => {
  const names = lineNames(n);
  return chapter(n).narration.map((l, i) => ({
    cue: l.cue,
    target: l.kind === 'museum-note' && l.frames ? { ids: [], area: l.frames } : (names[i].length ? { ids: names[i] } : null),
  })).filter(x => x.target);
};
const atRest = page => page.locator('#room[data-camera="rest"]').waitFor();
async function arrive(page, target) {
  const want = await page.evaluate(t => window.__voa.focusStation(t), target);
  expect(want, `a close view for ${JSON.stringify(target)}`).toBeTruthy();
  expect(want.fallback, `${want.id} framed`).toBe(false);
  await expect.poll(() => page.evaluate(() => window.__voa.cameraPose().station), { timeout: 60000 }).toBe(want.id);
  await atRest(page);
  const pose = await page.evaluate(() => window.__voa.cameraPose());
  for (let k = 0; k < 3; k++) expect(Math.abs(pose.position[k] - want.position[k]), `${want.id} eye`).toBeLessThan(1e-3);
  return want;
}
// The stage's controls as the browser lays them out (real DOM rects, not the room's own band
// measurement): the caption, the visible rail items, the door chips or buttons and the player bar.
async function controlRects(page) {
  const out = [];
  for (const el of await page.locator('[data-caption-text]:visible, [data-rail]:visible, [data-door-nav] a:visible, [data-player]:visible').all()) {
    const b = await el.boundingBox();
    if (b && b.width && b.height) out.push(b);
  }
  return out;
}
const overlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const within = (r, c, m = 0) => r.x >= c.x + m - 1 && r.x + r.width <= c.x + c.width - m + 1 && r.y >= c.y + m - 1 && r.y + r.height <= c.y + c.height - m + 1;
// The whole drawn ring (its square around the core) plus `margin` on the canvas.
const ringRect = (q, margin) => ({ x: q.x - q.px / 2 - margin, y: q.y - q.px / 2 - margin, width: q.px + 2 * margin, height: q.px + 2 * margin });


for (const n of CHAPTER_NUMBERS) {
  test(`room ${n}: at each cue the camera frames what the line names`, async ({ page }, info) => {
    await page.setViewportSize(VIEWPORT[info.project.name]);
    await page.goto(`/einstein/${n}/?debug`);
    await roomReady(page);
    await page.waitForFunction(() => (document.getElementById('cues').track.cues || []).length > 0);
    await atRest(page);
    await page.locator('[data-stage]').scrollIntoViewIfNeeded();
    const cues = cueTargets(n);
    expect(cues.length).toBeGreaterThan(0);
    for (const { cue, target } of cues) {
      await seekNarration(page, { cue, dt: 0.15 });
      const st = await arrive(page, target);
      const canvas = await page.locator('#room').boundingBox(), controls = await controlRects(page);
      expect(controls.length, 'the stage controls are laid out').toBeGreaterThan(2);
      const clear = (r, what) => {
        expect(within(r, canvas), `${what} ${JSON.stringify(r)} wholly on the canvas ${JSON.stringify(canvas)} from ${st.id}`).toBe(true);
        for (const b of controls) expect(overlap(r, b), `${what} ${JSON.stringify(r)} under a control ${JSON.stringify(b)} from ${st.id}`).toBe(false);
      };
      for (const id of target.ids) {
        const r = await page.evaluate(x => window.__voa.exhibitScreen(x), id);
        clear(r, `${cue} ${id}`);
        expect(r.height / canvas.height, `${cue} ${id} share of the frame height`).toBeGreaterThanOrEqual(FRAMING.minExhibitShare);
        // The rings come back on the frame after the one that lands the move (scene.js goTo).
        await expect.poll(() => page.evaluate(x => window.__voa.ring(x).visible, id), { message: `${cue} ${id} ring drawn` }).toBe(true);
        const q = (await page.evaluate(x => window.__voa.ring(x), id)).screen;
        expect(within(ringRect(q, 0), canvas, 8), `${cue} ${id} ring ${JSON.stringify(q)} wholly on the canvas with an 8 px margin`).toBe(true);
        for (const b of controls) expect(overlap(ringRect(q, 0), b), `${cue} ${id} ring under a control ${JSON.stringify(b)}`).toBe(false);
      }
      if (target.area) {
        const r = await page.evaluate(a => window.__voa.areaScreen(a), target.area);
        expect(r, `${cue}: the ${target.area} object in the room`).toBeTruthy();
        clear(r, `${cue} ${target.area}`);
      }
      // No ring drawn cut by the canvas edge: each drawn ring wholly on the canvas with an 8 px
      // margin, or wholly off it (fix round 1: ring 2 beside the study corner was half off the left edge).
      for (const ex of chapter(n).exhibits) {
        const q = await page.evaluate(x => window.__voa.ring(x), ex.id);
        if (!q || !q.visible || !q.screen) continue;
        const r = ringRect(q.screen, 0);
        const off = r.x + r.width <= canvas.x || r.x >= canvas.x + canvas.width || r.y + r.height <= canvas.y || r.y >= canvas.y + canvas.height;
        expect(off || within(r, canvas, 8), `${cue}: ring ${ex.id} ${JSON.stringify(q.screen)} cut by the canvas edge`).toBe(true);
      }
      await page.screenshot({ path: `${QA}/cf-room${n}-${cue}-${info.project.name}.png` });
    }
  });
}

// A drag: the mouse on desktop, a finger (Chrome's touch events, through DevTools) on the phone.
async function drag(page, info, x, y, dx) {
  if (info.project.name !== 'mobile') {
    await page.mouse.move(x, y); await page.mouse.down();
    await page.mouse.move(x + dx, y, { steps: 6 }); await page.mouse.up();
    return;
  }
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let k = 1; k <= 6; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * k) / 6, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}
const stationNow = page => page.evaluate(() => window.__voa.cameraPose().station);

test('the visitor is not fought: no move within 6 s of a drag (even one begun during a glide) or with the panel open; the next cue after resumes', async ({ page }, info) => {
  await page.setViewportSize(VIEWPORT[info.project.name]);
  const n = 1, cues = cueTargets(n);
  expect(cues.length).toBeGreaterThanOrEqual(5);
  await page.goto(`/einstein/${n}/?debug`);
  await roomReady(page);
  await page.waitForFunction(() => (document.getElementById('cues').track.cues || []).length > 0);
  await atRest(page);
  await page.locator('[data-stage]').scrollIntoViewIfNeeded();
  const box = await page.locator('#room').boundingBox();
  const mid = [box.x + box.width / 2, box.y + box.height * 0.4];
  await seekNarration(page, { cue: cues[0].cue, dt: 0.15 });
  await arrive(page, cues[0].target);
  // A press-and-drag begun while the camera glides to the next cue's view: the glide lands (it owns
  // the camera until then), and the press counts as the visitor taking the view.
  await seekNarration(page, { cue: cues[1].cue, dt: 0.15 });
  const second = await page.evaluate(t => window.__voa.focusStation(t).id, cues[1].target);
  expect(await page.evaluate(() => window.__voa.moving()), 'the glide is under way').toBe(true);
  if (info.project.name === 'mobile') await drag(page, info, mid[0], mid[1], 120);
  else {
    // The whole press-and-drag inside one task, so it lands while the glide still runs (with
    // software rendering, separate mouse steps can arrive after a 1.6 s glide has landed).
    await page.evaluate(([x, y]) => {
      const c = document.getElementById('room');
      const ev = (type, dx) => new PointerEvent(type, { bubbles: true, clientX: x + dx, clientY: y, pointerId: 7, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, isPrimary: true });
      c.dispatchEvent(ev('pointerdown', 0));
      for (let k = 1; k <= 6; k++) c.dispatchEvent(ev('pointermove', 20 * k));
      c.dispatchEvent(ev('pointerup', 120));
    }, mid);
  }
  expect(await page.evaluate(() => window.__voa.moving()), 'the press landed during the glide').toBe(true);
  let took = Date.now();
  await expect.poll(() => stationNow(page), { timeout: 60000 }).toBe(second);
  await atRest(page);
  await seekNarration(page, { cue: cues[2].cue, dt: 0.15 });
  await page.waitForTimeout(2500);
  expect(await stationNow(page), 'no move within 6 s of a press during a glide').toBe(second);
  // After the quiet time, the next cue moves it again.
  await page.waitForTimeout(Math.max(0, 6500 - (Date.now() - took)));
  await seekNarration(page, { cue: cues[3].cue, dt: 0.15 });
  const fourth = await arrive(page, cues[3].target);
  // A drag at rest turns the view; the next cue does not move the camera.
  await drag(page, info, mid[0], mid[1], 120);
  took = Date.now();
  await atRest(page);
  await seekNarration(page, { cue: cues[4].cue, dt: 0.15 });
  await page.waitForTimeout(2500);
  expect(await stationNow(page), 'no move within 6 s of a drag').toBe(fourth.id);
  // With the panel open (a thumbnail chosen), a cue does not move the camera.
  await page.waitForTimeout(Math.max(0, 6500 - (Date.now() - took)));
  await page.locator(`[data-rail="${cues[0].target.ids[0]}"]`).click();
  await expect(page.locator('#panel')).toBeVisible();
  await atRest(page);
  const open = await stationNow(page);
  await page.waitForTimeout(6500); // the choice itself counts as the visitor's input
  await seekNarration(page, { cue: cues[1].cue, dt: 0.15 });
  await page.waitForTimeout(2500);
  expect(await stationNow(page), 'no move with the panel open').toBe(open);
});
