// Clicking an exhibit in the scene (or its ring, thumbnail or list item) glides to it and opens the
// exhibit panel ON the stage: a side panel over the right of the 3D view on desktop, a bottom sheet
// over the stage on a phone that leaves the scene and the player controls visible above it.
import { test, expect } from '@playwright/test';
import { exhibit } from './content.js';
import { roomReady } from './room.js';

const within = (a, b, tol = 1) => a.x >= b.x - tol && a.y >= b.y - tol && a.x + a.width <= b.x + b.width + tol && a.y + a.height <= b.y + b.height + tol;

test('clicking a picture on the wall opens its panel on the stage; Escape returns focus to its thumbnail', async ({ page, isMobile }) => {
  await page.goto('/einstein/1/?debug');
  await roomReady(page);
  // Nothing revealed yet: the picture on its easel is still clickable. Task 5: on a phone the opening
  // frame puts the picture mid-stage, under the big play button, so the click goes to a part of the
  // picture the button does not cover (its upper left quarter).
  const r = await page.evaluate(() => window.__voa.exhibitScreen('ex1'));
  const pt = { x: r.x + r.width * 0.25, y: r.y + r.height * 0.25 };
  const play = await page.locator('[data-stage-play]').boundingBox();
  expect(!play || pt.x < play.x || pt.x > play.x + play.width || pt.y < play.y || pt.y > play.y + play.height).toBe(true);
  await page.mouse.click(pt.x, pt.y);
  const panel = page.getByRole('dialog', { name: `1. ${exhibit(1, 'ex1').title}` });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('heading', { level: 2 })).toBeFocused();
  const stage = await page.locator('[data-stage]').boundingBox();
  const box = await panel.boundingBox();
  expect(within(box, stage), `panel ${JSON.stringify(box)} is not on the stage ${JSON.stringify(stage)}`).toBe(true);
  if (!isMobile) {
    expect(box.x).toBeGreaterThan(stage.x + stage.width / 2); // docked on the right of the 3D view
    expect(box.height).toBeGreaterThan(stage.height * 0.9);
  } else {
    expect(Math.abs(box.y + box.height - (stage.y + stage.height))).toBeLessThan(2); // a bottom sheet
    expect(box.y).toBeGreaterThan(stage.y + stage.height * 0.3); // the scene stays visible above
    const bar = await page.getByRole('group', { name: 'Narration player' }).boundingBox();
    expect(bar.y + bar.height).toBeLessThanOrEqual(box.y + 1); // player controls not covered
  }
  await expect(panel.getByRole('link', { name: 'See the original' })).toBeVisible();
  await panel.getByRole('link', { name: 'See the original' }).scrollIntoViewIfNeeded();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  // Its rail thumbnail (the rings' accessible equivalent; it replaced the DOM hotspot pill).
  await expect(page.locator('[data-rail="ex1"]')).toBeFocused();
});

test('opening from the list at the bottom of the page shows the panel on the stage, in view, with previous and next', async ({ page }) => {
  await page.goto('/einstein/1/');
  await roomReady(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  const item = page.locator('#exhibits button[data-exhibit="ex2"]');
  await item.scrollIntoViewIfNeeded();
  await item.click();
  const panel = page.getByRole('dialog', { name: '2. Certificate of Arrival' });
  await expect(panel).toBeVisible();
  // Both boxes in one read: the stage is scrolling into view (smoothly) while this runs.
  const rects = () => page.evaluate(() => [document.getElementById('panel'), document.querySelector('[data-stage]')]
    .map(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
  const [pb, sb] = await rects();
  expect(within(pb, sb), `panel ${JSON.stringify(pb)} is not on the stage ${JSON.stringify(sb)}`).toBe(true);
  const vp = page.viewportSize();
  await expect.poll(async () => { const b = await panel.boundingBox(); return b.y >= -1 && b.y + 40 <= vp.height; }).toBe(true); // brought into view
  await panel.getByRole('button', { name: 'Next exhibit' }).click();
  await expect(page.getByRole('dialog', { name: `3. ${exhibit(1, 'ex3').title}` })).toBeVisible();
  await page.getByRole('button', { name: 'Previous exhibit' }).click();
  await page.getByRole('button', { name: 'Previous exhibit' }).click();
  await expect(page.getByRole('dialog', { name: `1. ${exhibit(1, 'ex1').title}` })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous exhibit' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.locator('#panel')).toBeHidden();
});
