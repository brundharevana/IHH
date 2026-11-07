// Doors: every room has an entrance and an exit door, each with a labelled hotspot on the door and a
// stage button. The rooms chain in journey order (content/einstein/journey.json, read from disk here):
// the exit leads to the next room, the last room's exit to the ending page, the first room's
// entrance back to the journey map. Leaving plays a short walk to the door and a fade (fade only
// under reduced motion) and then follows the link; Esc cancels it.
import { test, expect } from '@playwright/test';
import { JOURNEY } from './journey-content.js';
import { chapter } from './content.js';
import { roomReady } from './room.js';

// Software WebGL (SwiftShader) renders every walk and turn frame on the CPU; with the full suite in
// parallel a room load and a leave take several seconds.
test.beforeEach(() => test.setTimeout(90000));

// Rooms in journey order: stops with a chapter, each chapter once.
const ROOMS = [...new Set(JOURNEY.stops.filter(s => s.chapter !== undefined).map(s => s.chapter))];
const title = n => chapter(n).title;
const exitOf = i => (i + 1 < ROOMS.length
  ? { href: `/einstein/${ROOMS[i + 1]}/`, button: `Next room: ${title(ROOMS[i + 1])}`, label: `Next: ${title(ROOMS[i + 1])}` }
  : { href: '/einstein/end/', button: "Exit to the journey's end", label: "Exit to the journey's end" });
const entranceOf = i => (i > 0
  ? { href: `/einstein/${ROOMS[i - 1]}/`, button: `Previous room: ${title(ROOMS[i - 1])}`, label: `Back: ${title(ROOMS[i - 1])}` }
  : { href: '/einstein/', button: 'Back to the journey map', label: 'Back: Journey map' });

// Records, across the navigation, how the leave went: the leave mode the stage showed, how far the
// camera moved while leaving, and how long from the click to the page leaving.
async function recordLeave(page) {
  await page.evaluate(() => {
    const stage = document.querySelector('[data-stage]');
    const t0 = { v: 0 }, start = window.__voa ? window.__voa.cameraPose().position : null;
    let moved = 0;
    // The pose at the moment of saving counts too: on a slow (software) GPU the walk may end on the
    // clock before another animation frame has polled it.
    const sample = () => { if (start && window.__voa) { const p = window.__voa.cameraPose().position; moved = Math.max(moved, Math.hypot(p[0] - start[0], p[2] - start[2])); } };
    const save = () => { sample(); sessionStorage.setItem('voa-leave', JSON.stringify({ mode: stage.dataset.leaving || null, moved, ms: performance.now() - t0.v })); };
    document.addEventListener('click', () => { t0.v = performance.now(); }, { capture: true });
    new MutationObserver(save).observe(stage, { attributes: true, attributeFilter: ['data-leaving'] });
    const poll = () => {
      if (start && window.__voa) { const p = window.__voa.cameraPose().position; moved = Math.max(moved, Math.hypot(p[0] - start[0], p[2] - start[2])); }
      requestAnimationFrame(poll);
    };
    poll();
    addEventListener('pagehide', save);
  });
}
const leaveRecord = page => page.evaluate(() => JSON.parse(sessionStorage.getItem('voa-leave') || 'null'));

for (const [i, n] of ROOMS.entries()) {
  test(`room ${n}: the stage buttons name the entrance and the exit in journey order and lead there`, async ({ page }) => {
    await page.goto(`/einstein/${n}/`);
    await roomReady(page);
    const nav = page.getByRole('navigation', { name: 'Rooms' });
    const exit = nav.getByRole('link', { name: exitOf(i).button, exact: true });
    const entrance = nav.getByRole('link', { name: entranceOf(i).button, exact: true });
    await expect(exit).toBeVisible();
    await expect(entrance).toBeVisible();
    await expect(exit).toHaveAttribute('href', exitOf(i).href);
    await expect(entrance).toHaveAttribute('href', entranceOf(i).href);
    // Targets of at least 24 x 24 px.
    for (const b of [await exit.boundingBox(), await entrance.boundingBox()]) { expect(b.width).toBeGreaterThanOrEqual(24); expect(b.height).toBeGreaterThanOrEqual(24); }
    // Both door hotspots carry the same destinations and their labels (a hotspot out of view is
    // hidden from everyone, as the exhibit hotspots are; the visible one is checked by name below).
    await expect(page.locator('[data-door-hotspot="exit"]')).toHaveAttribute('href', exitOf(i).href);
    await expect(page.locator('[data-door-hotspot="exit"]')).toHaveText(exitOf(i).label);
    await expect(page.locator('[data-door-hotspot="entrance"]')).toHaveAttribute('href', entranceOf(i).href);
    await expect(page.locator('[data-door-hotspot="entrance"]')).toHaveText(entranceOf(i).label);
    // Keyboard: the exit button is reachable and Enter leaves through it.
    await exit.focus();
    await expect(exit).toBeFocused();
    await page.keyboard.press('Enter');
    await page.waitForURL(`**${exitOf(i).href}`);
  });

  test(`room ${n}: the entrance button leads back`, async ({ page }) => {
    await page.goto(`/einstein/${n}/`);
    await roomReady(page);
    await page.getByRole('link', { name: entranceOf(i).button, exact: true }).click();
    await page.waitForURL(`**${entranceOf(i).href}`);
  });
}

test('clicking the exit door hotspot in the room walks to the door and leaves through it', async ({ page }) => {
  const i = ROOMS.length - 1, n = ROOMS[i];
  await page.goto(`/einstein/${n}/?debug`);
  await roomReady(page);
  // Task 4 fix round 1: the room opens framed on its first exhibits. Stand at the exhibit station
  // farthest from the exit (the rail), then turn in place to the door (the test turns through the
  // debug hook; the stage door buttons need no turn).
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  const far = await page.evaluate(() => {
    const d = window.__voa.doorWorld('exit'), st = window.__voa.stations();
    const ids = [...document.querySelectorAll('[data-rail]')].map(b => b.dataset.rail);
    const dist = id => { const s = st.find(x => x.id === window.__voa.stationOf(id)); return Math.hypot(s.position[0] - d[0], s.position[2] - d[2]); };
    return ids.sort((a, b) => dist(b) - dist(a))[0];
  });
  await page.locator(`[data-rail="${far}"]`).click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.__voa.faceDoor('exit'));
  await expect(page.locator('#room')).toHaveAttribute('data-camera', 'rest', { timeout: 20000 });
  const spot = page.locator('[data-door-hotspot="exit"]');
  await expect(spot).toBeVisible();
  await expect(spot).not.toHaveAttribute('data-offscreen', /.*/);
  await expect(spot).toHaveAccessibleName(exitOf(i).label);
  // The pill sits wholly inside the stage.
  const stage = await page.locator('[data-stage]').boundingBox(), b = await spot.boundingBox();
  expect(b.x >= stage.x && b.x + b.width <= stage.x + stage.width && b.y >= stage.y && b.y + b.height <= stage.y + stage.height).toBe(true);
  await recordLeave(page);
  await spot.click();
  await page.waitForURL(`**${exitOf(i).href}`);
  const rec = await leaveRecord(page);
  expect(rec.mode).toBe('walk');
  expect(rec.moved, 'the camera walked toward the door').toBeGreaterThan(0.3);
  expect(rec.ms, 'click to leaving').toBeLessThanOrEqual(1200 + 300);
});

// Task 5: the study is a scanned room; its museum doors stand in the scan's real doorways. Turning to a
// door shows its pill (a desktop visitor turns to the exit, a phone visitor to the entrance; the test
// turns through the debug hook). The reconstructed place's door note went with its plaque.
test('the study: turning to a door shows its pill, which leads through it', async ({ page, isMobile }) => {
  const i = ROOMS.indexOf(2);
  test.skip(i < 0, 'the study is not on the journey');
  await page.goto('/einstein/2/?debug');
  await roomReady(page);
  await expect(page.locator('#room')).toHaveAttribute('data-camera', 'rest');
  const key = isMobile ? 'entrance' : 'exit', dest = isMobile ? entranceOf(i) : exitOf(i);
  await page.evaluate(k => window.__voa.faceDoor(k), key);
  const spot = page.locator(`[data-door-hotspot="${key}"]`);
  await expect(spot).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#room')).toHaveAttribute('data-camera', 'rest', { timeout: 20000 });
  await expect(spot).toHaveAccessibleName(dest.label);
  await spot.click();
  await page.waitForURL(`**${dest.href}`);
});

test('the chapter nav below the room follows the same journey order: Previous room and Next room', async ({ page }) => {
  for (const [i, n] of ROOMS.entries()) {
    await page.goto(`/einstein/${n}/`);
    const nav = page.getByRole('navigation', { name: 'Chapter' });
    const next = nav.locator('[data-nav="next"]');
    await expect(next).toHaveAttribute('href', exitOf(i).href);
    await expect(next).toHaveText(i + 1 < ROOMS.length ? 'Next room' : 'Finish: quiz and other inductees');
    const prev = nav.getByRole('link', { name: 'Previous room', exact: true });
    if (i > 0) await expect(prev).toHaveAttribute('href', entranceOf(i).href);
    else await expect(prev).toHaveCount(0); // the first room's way back is the Journey map link
  }
});

test('story mode can reach the doors controller before the room has loaded', async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener('voa:doors', e => {
      window.__doorsAt = { ready: document.getElementById('room')?.dataset.ready ?? null, hooks: ['exitTo', 'onArrive', 'cancel'].every(k => typeof e.detail[k] === 'function') };
      e.detail.onArrive(() => { window.__arrivedReady = document.getElementById('room').dataset.ready; });
    });
  });
  await page.goto(`/einstein/${ROOMS[0]}/`);
  await roomReady(page);
  expect(await page.evaluate(() => window.__doorsAt)).toEqual({ ready: null, hooks: true });
  await expect.poll(() => page.evaluate(() => window.__arrivedReady)).toBe('true');
});

test('reduced motion: no walk, only a fade, then the next room', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('voa-mode', '3d')); // reduced motion defaults to Lite; the visitor chose 3D
  const i = 0, n = ROOMS[0];
  await page.goto(`/einstein/${n}/?debug`);
  await roomReady(page);
  await recordLeave(page);
  await page.getByRole('link', { name: exitOf(i).button, exact: true }).click();
  await page.waitForURL(`**${exitOf(i).href}`);
  const rec = await leaveRecord(page);
  expect(rec.mode).toBe('fade');
  expect(rec.moved, 'the camera did not move').toBeLessThan(0.001);
});

test('Esc while leaving cancels the walk: the visitor stays in the room where they stood, the fade is gone', async ({ page }) => {
  const n = ROOMS[0];
  await page.goto(`/einstein/${n}/?debug`);
  await roomReady(page);
  await expect(page.locator('#room')).toHaveAttribute('data-camera', 'rest');
  const before = await page.evaluate(() => window.__voa.cameraPose());
  await page.getByRole('link', { name: exitOf(0).button, exact: true }).click();
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-leaving', 'walk');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-leaving', /.*/);
  await page.waitForTimeout(1500);
  // The visitor is back where they stood before the walk began.
  const after = await page.evaluate(() => window.__voa.cameraPose());
  expect(after.position.map(v => +v.toFixed(3))).toEqual(before.position.map(v => +v.toFixed(3)));
  expect(after.direction.map(v => +v.toFixed(3))).toEqual(before.direction.map(v => +v.toFixed(3)));
  expect(new URL(page.url()).pathname).toBe(`/einstein/${n}/`);
  await expect(page.locator('[data-door-fade]')).toBeHidden();
  await expect(page.locator('#room')).toHaveAttribute('data-camera', 'rest');
});

test('Back from the next room returns to a usable room: no fade left over', async ({ page }) => {
  const n = ROOMS[0];
  await page.goto(`/einstein/${n}/`);
  await roomReady(page);
  await page.getByRole('link', { name: exitOf(0).button, exact: true }).click();
  await page.waitForURL(`**${exitOf(0).href}`);
  await page.goBack();
  await roomReady(page);
  await expect(page.locator('[data-door-fade]')).toBeHidden();
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('data-leaving', /.*/);
  await expect(page.getByRole('link', { name: exitOf(0).button, exact: true })).toBeVisible();
});

test.describe('without script', () => {
  test.use({ javaScriptEnabled: false });
  test('the door buttons are plain links that still lead on', async ({ page }) => {
    await page.goto(`/einstein/${ROOMS[0]}/`);
    await page.getByRole('link', { name: exitOf(0).button, exact: true }).click();
    await page.waitForURL(`**${exitOf(0).href}`);
  });
});
