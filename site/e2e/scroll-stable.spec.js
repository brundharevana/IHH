// The page never scrolls itself away from where the visitor put it (flake-report 2026-10-12): an
// exhibit panel brings the stage into view, but that page-made scroll gives way to any scroll it did
// not make, and nothing in room load or arrival moves the page. Run with the CPU slowed 4x (CDP), the
// load under which a native smooth scrollIntoView was seen landing after the visitor's own scroll and
// sliding the room page back to the top (src/ui/scroll-reveal.js).
import { test, expect } from '@playwright/test';
import { roomReady } from './room.js';

const ready = roomReady;
const slow = async page => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
};
// Every scroll position the page takes from now on (scroll events plus a final read).
const watch = page => page.evaluate(() => {
  window.__ys = [];
  addEventListener('scroll', () => window.__ys.push(Math.round(scrollY)), { passive: true });
});
const seen = page => page.evaluate(() => [...window.__ys, Math.round(scrollY)]);
const visitorScroll = (page, y) => page.evaluate(top => { window.scrollTo({ top, behavior: 'instant' }); return Math.round(scrollY); }, y);

test('a scroll the visitor makes while an exhibit panel brings the stage into view stays put', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/einstein/1/?debug');
  await ready(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  await slow(page);
  // The stage partly above the viewport, so opening a panel scrolls the page to bring it into view.
  const stageTop = await page.evaluate(() => document.querySelector('[data-stage]').getBoundingClientRect().top + scrollY);
  const hasRoom = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  test.skip(hasRoom < stageTop + 60, 'the page is too short to put the stage partly out of view');
  await visitorScroll(page, Math.round(stageTop + 60));
  await page.locator('[data-rail="ex2"]').click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 30000 });
  // The visitor scrolls the moment the panel is up: the page-made reveal is still under way.
  const mine = await visitorScroll(page, Math.round(stageTop - 8));
  await watch(page);
  await page.waitForTimeout(2500);
  expect([...new Set(await seen(page))]).toEqual([mine]);
  // Closing the panel (focus back on its thumbnail, already in view) and scrolling again: still put.
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-rail="ex2"]')).toBeFocused();
  const again = await visitorScroll(page, Math.round(stageTop - 8));
  await watch(page);
  await page.waitForTimeout(2500);
  expect([...new Set(await seen(page))]).toEqual([again]);
});

// The visitor's wheel, touch, keys and pointer stop the reveal too: src/test/scroll-reveal.test.js
// (in a browser the wheel's own scroll already trips the "scroll it did not make" guard above).

test('nothing in room load or arrival moves a page the visitor has scrolled', async ({ page }) => {
  test.setTimeout(120000);
  await slow(page);
  await page.goto('/einstein/1/?debug', { waitUntil: 'domcontentloaded' });
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  test.skip(max < 40, 'the page does not scroll');
  const mine = await visitorScroll(page, Math.min(200, max));
  await watch(page);
  await ready(page);
  await page.waitForTimeout(2500);
  // The page may grow as the room mounts; it never moves the visitor.
  expect([...new Set(await seen(page))]).toEqual([mine]);
});
