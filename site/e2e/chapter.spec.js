import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { exhibit, chapter } from './content.js';
import { roomReady } from './room.js';
test('exhibit list, panel focus and Escape', async ({ page }) => {
  await page.goto('/einstein/1/');
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  const first = page.locator('#exhibits button').first();
  await first.click();
  const panel = page.locator('#panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('link', { name: 'See the original' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(first).toBeFocused();
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(r.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
});
test('missing media shows a notice, room still renders', async ({ page }) => {
  await page.route('**/media/**', r => r.abort());
  await page.goto('/einstein/1/');
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  await page.locator('#exhibits button').first().click();
  await expect(page.locator('#panel')).toContainText('Image unavailable');
  await expect(page.locator('#panel img')).toBeHidden();
  await roomReady(page);
});
test('3D room starts, heading takes focus, the panel is a non-modal dialog, Close returns focus', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/einstein/1/');
  await roomReady(page);
  const first = page.locator('#exhibits button').first();
  await expect(first).toBeHidden(); // narration not played yet: nothing reveals on its own
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  await expect(first).toHaveText(`1. ${exhibit(1, 'ex1').title}`);
  await first.click();
  const panel = page.getByRole('dialog', { name: `1. ${exhibit(1, 'ex1').title}` });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('heading', { level: 2 })).toBeFocused();
  const img = panel.getByRole('img', { name: 'Albert Einstein, 1879-1955' });
  await expect(img).toBeVisible();
  // Width and height from the media file, so the panel does not jump as the image loads.
  await expect(img).toHaveAttribute('width', '827');
  await expect(img).toHaveAttribute('height', '1024');
  await expect(panel.locator('dl.meta')).toContainText('Original photograph');
  // Non-modal: no aria-modal, and there is no focus trap. Tab walks on past the panel's last
  // control to the rest of the page.
  await expect(page.locator('#panel')).not.toHaveAttribute('aria-modal', /.*/);
  let leftPanel = false;
  for (let i = 0; i < 12 && !leftPanel; i++) {
    await page.keyboard.press('Tab');
    leftPanel = await page.evaluate(() => !document.getElementById('panel').contains(document.activeElement));
  }
  expect(leftPanel).toBe(true);
  await panel.getByRole('heading', { level: 2 }).focus();
  const chip = panel.locator('button[data-chip]').first();
  await expect(chip).toHaveText(/^(Source|Sources \(\d+\))$/);
  const tip = page.locator('#' + await chip.getAttribute('aria-controls') + ' a').first();
  await expect(tip).toBeHidden();
  await chip.click();
  await expect(chip).toHaveAttribute('aria-expanded', 'true');
  await expect(tip).toBeVisible();
  await expect(page.locator('#' + await chip.getAttribute('aria-controls'))).toContainText('EIN-F-0005');
  const r = await new AxeBuilder({ page }).include('#panel').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(r.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  await panel.getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('#panel')).toBeHidden();
  await expect(first).toBeFocused();
  expect(errors).toEqual([]);
});

const near = (a, b) => Math.abs(a - b) < 0.05;
// room.js GALLERY_START: from the south-east corner (2.6, 1.6, 3.2) toward (-1.2, 0.1, -6) on the exhibit wall.
const unit = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
const GALLERY_DIR = unit([-1.2 - 2.6, 0.1 - 1.6, -6 - 3.2]);
// Task 4 fix round 1: the first frame is the framed station of the first exhibit the narration names
// (it was the gallery's establishing view from the south-east corner, GALLERY_DIR).
test('first frame uses the opening station: framed on the first narrated exhibit, no transition', async ({ page }) => {
  await page.goto('/einstein/1/?debug');
  await roomReady(page);
  const pose = await page.evaluate(() => window.__voa.cameraPose());
  const first = chapter(1).narration.flatMap(l => l.reveals || [])[0];
  const id = await page.evaluate(x => window.__voa.stationOf(x), first);
  expect(pose.station).toBe(id);
  const st = (await page.evaluate(() => window.__voa.stations())).find(s => s.id === id);
  expect(pose.position.every((v, i) => near(v, st.position[i]))).toBe(true);
  // No transition: the first frame already looks at the group's middle.
  const dir = unit(st.look.map((v, i) => v - st.position[i]));
  expect(pose.direction.every((v, i) => near(v, dir[i]))).toBe(true);
  expect(pose.renders).toBeGreaterThan(0);
  // Not the old back-of-room establishing view.
  expect(near(pose.direction[0], GALLERY_DIR[0]) && near(pose.direction[2], GALLERY_DIR[2])).toBe(false);
});
test('debug hook is absent without the debug flag', async ({ page }) => {
  await page.goto('/einstein/1/');
  await roomReady(page);
  expect(await page.evaluate(() => typeof window.__voa)).toBe('undefined');
});
test('while the panel is open the 3D canvas and hotspots are inert; the rest of the page and the player stay operable', async ({ page }) => {
  await page.goto('/einstein/1/?debug');
  await roomReady(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  const first = page.locator('#exhibits button').first();
  await first.click();
  await expect(page.locator('#panel')).toBeVisible();
  await expect(page.locator('#panel')).toHaveAttribute('role', 'dialog');
  await expect(page.locator('#panel')).not.toHaveAttribute('aria-modal', /.*/);
  for (const sel of ['#room', '[data-hotspots]', '[data-rail-list]']) await expect(page.locator(sel)).toHaveAttribute('inert', '');
  for (const sel of ['[data-chapter-head]', '.exhibit-list', '[data-player]']) await expect(page.locator(sel)).not.toHaveAttribute('inert', '');
  await page.waitForFunction(() => !window.__voa.moving());
  const before = await page.evaluate(() => window.__voa.cameraPose().position);
  const canvasBox = await page.locator('#room').boundingBox();
  await page.mouse.click(canvasBox.x + 20, canvasBox.y + 20);
  expect(await page.evaluate(() => window.__voa.cameraPose().position)).toEqual(before);
  await page.keyboard.press('Escape');
  await expect(page.locator('#panel')).toBeHidden();
  for (const sel of ['#room', '[data-hotspots]', '[data-rail-list]']) await expect(page.locator(sel)).not.toHaveAttribute('inert', '');
  await expect(first).toBeFocused();
});
test('with the panel open the narration player is operable and Escape from the player closes the panel and returns focus', async ({ page }) => {
  await page.goto('/einstein/1/');
  await roomReady(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  const first = page.locator('#exhibits button').first();
  await first.click();
  await expect(page.locator('#panel')).toBeVisible();
  const audio = page.locator('#narration');
  expect(await audio.evaluate(a => a.paused)).toBe(true);
  const pp = page.locator('[data-player] [data-play]');
  await pp.focus();
  await expect(pp).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => audio.evaluate(a => !a.paused)).toBe(true);
  await page.keyboard.press('Enter');
  await expect.poll(() => audio.evaluate(a => a.paused)).toBe(true);
  await expect(page.locator('#panel')).toBeVisible();
  await page.keyboard.press('Escape'); // focus is on the player, outside the panel
  await expect(page.locator('#panel')).toBeHidden();
  await expect(first).toBeFocused();
});

// Codex gate 2026-10-14. Rule: the exhibit panel is the top layer of the stage: it opens above the
// loading view and the Lite fallback card, so details picked from the list after a failed load are
// seen, clickable and focusable, and closing returns focus to the list.
test('after the room fails to load, an exhibit opened from the list shows above the fallback card; Close returns focus', async ({ page }) => {
  await page.route('**/basis/**', r => r.abort());
  await page.goto('/einstein/1/');
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'failed', { timeout: 60000 });
  await expect(page.locator('[data-scan-failed]')).toBeVisible();
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  const first = page.locator('#exhibits button').first();
  await first.click();
  const panel = page.locator('#panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('heading', { level: 2 })).toBeFocused();
  // The panel is what is on top where it stands: its heading and its Close button take the pointer.
  const onTop = async (loc) => {
    const b = await loc.boundingBox();
    return loc.evaluate((el, [x, y]) => el.contains(document.elementFromPoint(x, y)), [b.x + b.width / 2, b.y + b.height / 2]);
  };
  await panel.getByRole('heading', { level: 2 }).scrollIntoViewIfNeeded();
  expect(await onTop(panel.getByRole('heading', { level: 2 }))).toBe(true);
  const close = panel.getByRole('button', { name: 'Close' });
  expect(await onTop(close)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(panel.locator(':focus')).toHaveCount(1);
  await close.click();
  await expect(panel).toBeHidden();
  await expect(first).toBeFocused();
  // The fallback card is still there once the panel is closed.
  await expect(page.locator('[data-scan-failed]')).toBeVisible();
});

// Codex gate round 2. Rule: every network load of a room's start-up is bounded by the 15 s inactivity
// rule; a stalled exhibit image never holds the room back: the scan loads, and that exhibit shows the
// designed placeholder card.
test('a stalled exhibit image (/media/room/ never answers) does not hold the room: it opens with placeholder cards', async ({ page }) => {
  test.setTimeout(120000);
  await page.route('**/media/room/**', () => { /* never answered */ });
  // The rail thumbnails are page <img>s of the same files: the window load event never fires, so the
  // test goes on from the parsed page.
  await page.goto('/einstein/1/?debug', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'true', { timeout: 60000 });
  await expect(page.locator('[data-scan-failed]')).toBeHidden();
  for (const ex of chapter(1).exhibits.filter(e => e.media_id)) {
    expect(await page.evaluate(id => window.__voa.exhibitPicture(id), ex.id), ex.id).toBe('placeholder');
  }
  expect((await page.evaluate(() => window.__voa.pixels())).mean).toBeGreaterThan(40);
});

// Codex gate round 2. Rule: what the loading view or the failure card covers is out of reach: no
// keyboard path (Tab or Shift+Tab) enters a stage control the card hides; the card, the exhibit list
// and the exhibit panel stay usable; the controls come back when the room recovers.
const intoCoveredStage = page => page.evaluate(() => {
  const a = document.activeElement, stage = document.querySelector('[data-stage]');
  return Boolean(a && stage.contains(a) && !a.closest('#panel') && !a.closest('[data-scan-failed]'));
});
async function expectNoKeyboardPathUnderTheCard(page) {
  const card = page.locator('[data-scan-failed]');
  for (const key of ['Tab', 'Shift+Tab']) {
    await card.focus();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press(key);
      expect(await intoCoveredStage(page), `${key} x${i + 1}`).toBe(false);
    }
  }
  await expect(page.locator('[data-player]')).toBeHidden();
  await expect(page.locator('.door-nav')).toBeHidden();
}

test('after a load failure, Tab and Shift+Tab never reach the controls under the fallback card', async ({ page }) => {
  await page.route('**/basis/**', r => r.abort());
  await page.goto('/einstein/1/');
  await expect(page.locator('#room')).toHaveAttribute('data-ready', 'failed', { timeout: 60000 });
  await expect(page.locator('[data-scan-failed]')).toBeFocused();
  await expectNoKeyboardPathUnderTheCard(page);
  // The exhibit list and its panel still work.
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  await page.locator('#exhibits button').first().click();
  await expect(page.locator('#panel')).toBeVisible();
});

test('after a WebGL context loss, the covered controls are out of reach; on restore they come back', async ({ page }) => {
  await page.goto('/einstein/1/?debug');
  await roomReady(page);
  await expect(page.locator('[data-player]')).toBeVisible();
  await page.evaluate(() => { window.__lose = document.getElementById('room').getContext('webgl2').getExtension('WEBGL_lose_context'); window.__lose.loseContext(); });
  await expect(page.locator('[data-scan-failed]')).toBeVisible();
  await expectNoKeyboardPathUnderTheCard(page);
  await page.evaluate(() => window.__lose.restoreContext());
  await expect(page.locator('#room')).toHaveAttribute('data-context', 'restored');
  await expect(page.locator('[data-scan-failed]')).toBeHidden();
  await expect(page.locator('[data-player]')).toBeVisible();
  await expect(page.locator('.door-nav')).toBeVisible();
});
