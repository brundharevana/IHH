// Tapestry-style stations, rings and rail (real-scan museum spec, Camera and Hotspots): the camera
// turns in place at a station; each exhibit has a glowing numbered ring in the room (44-120 px on
// screen, hidden behind walls) and a numbered thumbnail in the stage rail, linked both ways; choosing
// one glides the camera to its station (1.6 s) and then opens the panel; a "Drag to look around"
// hint follows the narration and goes on the first drag.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { chapter, exhibit } from './content.js';
import { seekNarration } from './narration.js';
import { roomReady, roomSettled } from './room.js';

const ready = roomReady;
const ring = (page, id) => page.evaluate(x => window.__voa.ring(x), id);
// The page may still be scrolling (the panel brings the stage into view smoothly, slowly under
// software WebGL): wait until the ring's place on screen has held still for three reads.
async function settledScreen(page, id) {
  const seen = [];
  await expect.poll(async () => {
    seen.push((await ring(page, id)).screen);
    const [a, b, c] = seen.slice(-3);
    return Boolean(a && b && c && Math.hypot(a.x - c.x, a.y - c.y) < 0.5 && Math.hypot(b.x - c.x, b.y - c.y) < 0.5);
  }, { intervals: [250], timeout: 15000 }).toBe(true);
  return seen[seen.length - 1];
}

test('every exhibit has a ring sized 44-120 px and a numbered thumbnail named for it', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/einstein/1/?debug');
  await ready(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  for (const ex of chapter(1).exhibits) {
    const thumb = page.locator(`[data-rail="${ex.id}"]`);
    await expect(thumb).toBeVisible();
    await expect(thumb).toHaveAccessibleName(`Exhibit ${ex.number}: ${ex.title}`);
    await expect(thumb).toHaveText(String(ex.number));
    const b = await thumb.boundingBox();
    expect(Math.round(b.width)).toBe(52);
    await expect.poll(async () => (await ring(page, ex.id)).visible).toBe(true);
    const r = await ring(page, ex.id);
    expect(r.px).toBeGreaterThanOrEqual(44);
    expect(r.px).toBeLessThanOrEqual(120 * 1.02 + 0.01);
  }
  // The rail is one group of buttons; the page stays free of serious accessibility issues.
  await expect(page.getByRole('group', { name: 'Exhibits in this room' })).toBeVisible();
  const a = await new AxeBuilder({ page }).include('[data-stage]').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(a.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  expect(errors).toEqual([]);
});

test('Enter on a thumbnail glides to the exhibit station, then the panel opens; Escape returns to the thumbnail', async ({ page }) => {
  await page.goto('/einstein/1/?debug');
  await ready(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  // The last exhibit stands in a group of its own on every screen (its station is not the opening one).
  const ex = exhibit(1, 'ex4');
  const target = await page.evaluate(() => window.__voa.stationOf('ex4'));
  expect((await page.evaluate(() => window.__voa.cameraPose())).station).not.toBe(target);
  const thumb = page.locator('[data-rail="ex4"]');
  await thumb.focus();
  // Focus on the thumbnail lights its ring (rail -> ring).
  await expect.poll(async () => (await ring(page, 'ex4')).hover).toBe(true);
  const t0 = Date.now();
  await page.keyboard.press('Enter');
  const panel = page.getByRole('dialog', { name: `${ex.number}. ${ex.title}` });
  // The panel waits for the glide (1.6 s); the stage says where it is going and is busy meanwhile.
  await expect(panel).toBeHidden();
  await expect(page.locator('#room')).toHaveAttribute('data-camera', 'moving');
  await expect(page.locator('[data-stage]')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('[data-move-announce]')).toHaveText(`Moving to exhibit ${ex.number}. ${ex.title}`);
  await expect(panel).toBeVisible({ timeout: 15000 });
  expect(Date.now() - t0).toBeGreaterThanOrEqual(1500);
  await expect(page.locator('[data-stage]')).not.toHaveAttribute('aria-busy', /.*/);
  expect((await page.evaluate(() => window.__voa.cameraPose())).station).toBe(target);
  // Rings step aside while the panel is open.
  expect((await ring(page, 'ex4')).visible).toBe(false);
  await page.keyboard.press('Escape');
  await expect(thumb).toBeFocused();
  await expect.poll(async () => (await ring(page, 'ex4')).visible).toBe(true);
});

// After the visitor acts, the big centre play button has collapsed into the bar and no stage control
// covers the middle 60 % of the stage: the ring the camera glided to can be clicked where it is drawn.
test('after a glide nothing covers the target ring: the big play button has given way to the bar', async ({ page }) => {
  await page.goto('/einstein/1/?debug');
  await ready(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  await expect(page.locator('[data-stage-play]')).toBeVisible();
  await page.locator('[data-rail="ex2"]').click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  await page.keyboard.press('Escape');
  await page.locator('#room[data-camera="rest"]').waitFor();
  await expect(page.locator('[data-stage-play]')).toBeHidden();
  await expect(page.getByRole('group', { name: 'Narration player' }).getByRole('button', { name: 'Play narration' })).toBeVisible();
  // A line is current (seeked, paused): the now-showing button is up too, and stays out of the middle.
  await page.waitForFunction(() => (document.getElementById('cues').track.cues || []).length > 2);
  await seekNarration(page, { cue: await page.evaluate(() => document.getElementById('cues').track.cues[2].id), dt: 0.2 });
  // (On a phone stage the lit thumbnail stands for it: fix round 2.)
  if ((page.viewportSize() || { width: 1280 }).width >= 600) await expect(page.locator('[data-now]')).toBeVisible();
  else await expect(page.locator('[data-rail][aria-current="true"]').first()).toBeVisible();
  await page.locator('#room[data-camera="rest"]').waitFor();
  // The stage at the top of the viewport (as in the hover test below), so the ring is on screen.
  await page.evaluate(() => window.scrollTo({ top: document.querySelector('[data-stage]').getBoundingClientRect().top + scrollY - 8, behavior: 'instant' }));
  const at = await settledScreen(page, 'ex2');
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y).id, [at.x, at.y])).toBe('room');
  // No control in the central 60 % of the stage.
  const covered = await page.evaluate(() => {
    const s = document.querySelector('[data-stage]').getBoundingClientRect();
    const c = { x0: s.left + s.width * 0.2, x1: s.right - s.width * 0.2, y0: s.top + s.height * 0.2, y1: s.bottom - s.height * 0.2 };
    return [...document.querySelectorAll('[data-stage] button, [data-stage] a, [data-stage] input')].filter(el => {
      if (el.closest('#panel')) return false;
      const r = el.getBoundingClientRect();
      return r.width && r.height && getComputedStyle(el).visibility !== 'hidden' && r.right > c.x0 && r.left < c.x1 && r.bottom > c.y0 && r.top < c.y1;
    }).map(el => el.outerHTML.slice(0, 80));
  });
  expect(covered).toEqual([]);
});

test('a ring under the mouse turns amber, grows and lights its thumbnail; clicking it opens the exhibit', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover is a mouse state; the tap path is the click below on desktop and the rail');
  await page.goto('/einstein/1/?debug');
  await ready(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  await page.locator('[data-rail="ex2"]').click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  await page.keyboard.press('Escape');
  await page.locator('#room[data-camera="rest"]').waitFor();
  await page.locator('[data-rail="ex2"]').blur();
  await expect.poll(async () => (await ring(page, 'ex1')).visible).toBe(true);
  // Put the stage at the top of the viewport (no smooth scroll still running), then read the ring's
  // place: it must be on the canvas itself.
  await page.evaluate(() => window.scrollTo({ top: document.querySelector('[data-stage]').getBoundingClientRect().top + scrollY - 8, behavior: 'instant' }));
  const at = await settledScreen(page, 'ex1');
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y).id, [at.x, at.y])).toBe('room');
  // Pointer moves over the ring (repeated a pixel apart: under parallel software-WebGL load a
  // single synthetic move can land before the page has settled).
  // The pointer goes to where the ring is drawn NOW, and the canvas check runs at every point used.
  // (Under load the page used to slide back to the top here: the panel's native smooth scroll into
  // view landed after the scroll above. Fixed in src/ui/scroll-reveal.js; e2e/scroll-stable.spec.js.)
  let k = 0, pt = at;
  const seen = [];
  await expect.poll(async () => {
    pt = (await ring(page, 'ex1')).screen || pt;
    if (await page.evaluate(([x, y]) => document.elementFromPoint(x, y).id, [pt.x, pt.y]) !== 'room') return false;
    await page.mouse.move(pt.x + (k++ % 2), pt.y);
    const s = await page.evaluate(([x, y]) => ({ hit: window.__voa.ringAt(x, y), el: document.elementFromPoint(x, y).outerHTML.slice(0, 60), ring: window.__voa.ring('ex1'), mesh: window.__voa.ringMesh('ex1'), idle: window.__voa.idle(), cam: window.__voa.cameraPose() }), [pt.x, pt.y]);
    seen.push(JSON.stringify({ hit: s.hit, el: s.el, hover: s.ring.hover, screen: s.ring.screen, mesh: s.mesh, idle: s.idle, cam: s.cam.station }));
    return s.ring.hover;
  }, { intervals: [300], timeout: 10000 }).toBe(true).catch(e => { console.log('HOVERDBG', seen.slice(-3).join(' | ')); throw e; });
  await expect(page.locator('[data-rail="ex1"]')).toHaveClass(/is-hover/);
  // The hover ease drives both warm and hoverMul (rings.js: one value h). Wait for the ease to land
  // (warm reaches 1), then check both at that moment; hoverMul within 1e-3 alone would pass at h > 0.98.
  await expect.poll(async () => (await ring(page, 'ex1')).warm).toBe(1);
  const lit = await ring(page, 'ex1');
  expect(lit.warm).toBe(1);
  expect(lit.hoverMul).toBeCloseTo(1.08, 3);
  expect(await page.locator('#room').evaluate(el => el.style.cursor)).toBe('pointer');
  await page.mouse.click(pt.x, pt.y);
  const ex1 = exhibit(1, 'ex1');
  await expect(page.getByRole('dialog', { name: `${ex1.number}. ${ex1.title}` })).toBeVisible({ timeout: 15000 });
});

test('dragging turns the view in place at the station: no zoom, the eye stays put', async ({ page, isMobile }) => {
  test.skip(isMobile, 'mouse drag; touch uses the same pointer events');
  await page.goto('/einstein/1/?debug');
  await ready(page);
  const before = await page.evaluate(() => window.__voa.cameraPose());
  const box = await page.locator('#room').boundingBox();
  // Off-centre: the big play button sits in the middle of the stage until the narration starts.
  const x0 = box.x + box.width * 0.25, y0 = box.y + box.height * 0.75;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 5; i++) await page.mouse.move(x0 + i * 40, y0 - i * 10);
  await page.mouse.up();
  await page.mouse.wheel(0, -600);
  await page.waitForFunction(() => !window.__voa.moving());
  const after = await page.evaluate(() => window.__voa.cameraPose());
  expect(after.position).toEqual(before.position);
  expect(after.zoom).toBe(1);
  expect(after.fov).toBe(before.fov);
  const turn = Math.acos(Math.min(1, before.direction.reduce((s, v, i) => s + v * after.direction[i], 0)));
  expect(turn).toBeGreaterThan(0.1);
});

test('the drag hint shows when the narration ends and hides on the first drag', async ({ page }) => {
  await page.goto('/einstein/1/?debug');
  await ready(page);
  const hint = page.locator('[data-drag-hint]');
  await expect(hint).toBeHidden();
  await page.evaluate(() => document.getElementById('narration').dispatchEvent(new Event('ended')));
  await expect(hint).toBeVisible();
  await expect(hint).toHaveText('Drag to look around');
  await expect(hint).toHaveAttribute('aria-hidden', 'true');
  const box = await page.locator('#room').boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.7);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.7);
  await page.mouse.up();
  await expect(hint).toBeHidden();
  // It does not come back once the visitor has dragged.
  await page.evaluate(() => document.getElementById('narration').dispatchEvent(new Event('ended')));
  await page.waitForTimeout(300);
  await expect(hint).toBeHidden();
});

// Fix round 1: idle rendering. Only the lit ring breathes, and only while the narration plays or for
// 8 s after input, with the stage on screen; otherwise a room at rest draws no frames at all.
const litLine = async page => {
  await page.waitForFunction(() => (document.getElementById('cues').track.cues || []).length > 2);
  // Into the third line with the narration paused: its exhibit's ring is lit.
  await seekNarration(page, { cue: await page.evaluate(() => document.getElementById('cues').track.cues[2].id), dt: 0.2 });
  // (The seek's highlight can take a while on a busy machine with software WebGL.)
  await expect.poll(() => page.evaluate(() => ['ex1', 'ex2', 'ex3', 'ex4'].some(id => window.__voa.ring(id).active)), { timeout: 15000 }).toBe(true);
};
test('a room at rest draws no frames: lit ring, narration paused, 8 s after the last input', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/einstein/1/?debug');
  await roomSettled(page); // the full-detail swap redraws once (Task 3); count frames after it
  await litLine(page);
  // Input (a key press; a click could choose an exhibit) wakes the lit ring's breathing for a while.
  await page.keyboard.press('Shift');
  const r0 = (await page.evaluate(() => window.__voa.idle())).renders;
  // Breathing once the lit ring is drawn (a slow software GPU may draw it a moment later).
  await expect.poll(async () => (await page.evaluate(() => window.__voa.idle())).breathing, { timeout: 5000 }).toBe(true);
  // Frames come (slowly under software WebGL), well inside the 8 s window.
  await expect.poll(async () => (await page.evaluate(() => window.__voa.idle())).renders, { timeout: 6000 }).toBeGreaterThan(r0);
  // Then, 8 s after that input with the narration still paused, it stops.
  await page.waitForTimeout(8500);
  await page.waitForFunction(() => !window.__voa.idle().running);
  const a = await page.evaluate(() => window.__voa.idle());
  await page.waitForTimeout(1500);
  const b = await page.evaluate(() => window.__voa.idle());
  expect(a.breathing).toBe(false);
  expect(b.running).toBe(false);
  expect(b.renders).toBe(a.renders);
});
test('with reduced motion, nothing breathes even right after input', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('voa-mode', '3d'));
  await page.goto('/einstein/1/?debug');
  await roomSettled(page); // the full-detail swap redraws once (Task 3); count frames after it
  await litLine(page);
  await page.keyboard.press('Shift');
  await page.waitForFunction(() => !window.__voa.moving());
  // The last frame may still be waiting on the (software) GPU: from the loop's stop on, nothing more.
  await page.waitForFunction(() => !window.__voa.idle().running);
  const a = await page.evaluate(() => window.__voa.idle());
  await page.waitForTimeout(1500);
  const b = await page.evaluate(() => window.__voa.idle());
  expect(a.breathing).toBe(false);
  expect(b.renders).toBe(a.renders);
});
