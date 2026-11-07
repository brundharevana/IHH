// Phone stage (Task 4 fix round 2), at 390 x 844: a slim top band of door chips, two-line captions in
// the band above the rail, and every room opening framed so its exhibit group is clear of the
// captions, the rail and the top controls (real DOM rects). With the bottom sheet open the exhibit
// sits in the strip still visible above it.
import { test, expect } from '@playwright/test';
import { chapter, CHAPTER_NUMBERS, exhibit, lineNames } from './content.js';
import { seekNarration } from './narration.js';
import { roomReady } from './room.js';

test.use({ viewport: { width: 390, height: 844 } });
const ready = roomReady;
const overlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const seekInto = async (page, k) => {
  await page.waitForFunction(() => (document.getElementById('cues').track.cues || []).length > 0);
  const cue = await page.evaluate(i => { const c = [...document.getElementById('cues').track.cues].sort((a, b) => a.startTime - b.startTime); return c[Math.min(i, c.length - 1)].id; }, k);
  await seekNarration(page, { cue, dt: 0.15 });
};

test('door chips: one slim row, short labels, full room names as accessible names and tooltips', async ({ page }) => {
  await page.goto('/einstein/1/');
  await ready(page);
  const stage = await page.locator('[data-stage]').boundingBox();
  const links = page.locator('[data-door-nav] a');
  await expect(links).toHaveCount(2);
  const boxes = [];
  for (const k of ['entrance', 'exit']) {
    const a = page.locator(`[data-door-nav] a[data-door="${k}"]`);
    const full = (await a.locator('.door-full').textContent()).trim();
    await expect(a).toHaveAccessibleName(full);
    await expect(a).toHaveAttribute('title', full);
    await expect(a.locator('.door-short')).toBeVisible();
    await expect(a.locator('.door-full')).toBeHidden();
    boxes.push(await a.boundingBox());
  }
  expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(2); // one row
  for (const b of boxes) expect(b.height).toBeLessThanOrEqual(44); // a 44 px chip each
  for (const k of ['entrance', 'exit']) { // its label on one line
    const short = page.locator(`[data-door-nav] a[data-door="${k}"] .door-short`);
    const lh = await short.evaluate(el => parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3);
    expect((await short.boundingBox()).height).toBeLessThan(1.6 * lh);
  }
  const band = Math.max(...boxes.map(b => b.y + b.height)) - stage.y;
  expect(band / stage.height, 'top band share of the stage').toBeLessThanOrEqual(0.1);
  // The now-showing button gives way to the lit thumbnail, which opens the same exhibit.
  await seekInto(page, 2);
  await expect(page.locator('[data-rail][aria-current="true"]').first()).toBeVisible();
  await expect(page.locator('[data-now]')).toBeHidden();
});

for (const n of CHAPTER_NUMBERS) {
  test(`room ${n}: the opening group is clear of the captions, the rail and the top controls`, async ({ page }) => {
    await page.goto(`/einstein/${n}/?debug`);
    await ready(page);
    // A line is current (captions shown); the camera at rest on the opening station. Since owner
    // review 4 a line that names exhibits takes the camera to their close view (camera-follow.spec.js
    // checks those views clear of the same controls), so the line sought here is one that names none.
    await seekInto(page, lineNames(n).findIndex(ids => ids.length === 0));
    await expect(page.locator('[data-captions]')).toBeVisible();
    await page.locator('#room[data-camera="rest"]').waitFor();
    await page.locator('[data-stage]').scrollIntoViewIfNeeded();
    const pose = await page.evaluate(() => window.__voa.cameraPose());
    expect(pose.station).toBe((await page.evaluate(() => window.__voa.stations()))[0].id);
    const group = await page.evaluate(id => window.__voa.groupScreen(id), pose.station);
    expect(group).not.toBeNull();
    const cap = await page.locator('[data-caption-text]').boundingBox();
    const others = [cap];
    for (const el of await page.locator('[data-rail]:visible, [data-door-nav] a').all()) others.push(await el.boundingBox());
    for (const b of others) expect(overlap(group, b), `group ${JSON.stringify(group)} vs ${JSON.stringify(b)}`).toBe(false);
    // The caption: 15 px, at most two lines.
    const st = await page.locator('[data-caption-text]').evaluate(el => { const cs = getComputedStyle(el); return { size: parseFloat(cs.fontSize), line: parseFloat(cs.lineHeight), pad: parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) }; });
    expect(st.size).toBeGreaterThanOrEqual(15);
    expect(st.size).toBeLessThanOrEqual(16);
    expect(cap.height).toBeLessThanOrEqual(2 * st.line + st.pad + 1);
  });
}

test('a long line pages through two-line captions; the transcript keeps it whole', async ({ page }) => {
  await page.goto('/einstein/1/');
  await ready(page);
  // The longest cue of the room.
  await page.waitForFunction(() => (document.getElementById('cues').track.cues || []).length > 0);
  const cue = await page.evaluate(() => { const c = [...document.getElementById('cues').track.cues].sort((a, b) => b.text.length - a.text.length)[0]; return { id: c.id, start: c.startTime, end: c.endTime, text: c.text }; });
  const span = page.locator('[data-caption-text]');
  const seen = [];
  for (const f of [0.05, 0.5, 0.95]) {
    // The caption shows the page for the time sought once the seek has completed.
    await seekNarration(page, cue.start + (cue.end - cue.start) * f);
    await expect(page.locator('[data-captions]')).toBeVisible();
    const t = (await span.textContent()).trim();
    const lh = await span.evaluate(el => parseFloat(getComputedStyle(el).lineHeight));
    expect((await span.boundingBox()).height).toBeLessThanOrEqual(2 * lh + 9);
    expect(cue.text.includes(t), t).toBe(true);
    seen.push(t);
  }
  expect(seen[0].length).toBeLessThan(cue.text.length);
  expect(new Set(seen).size).toBeGreaterThan(1);
  expect(seen[0] === cue.text.slice(0, seen[0].length)).toBe(true);
  // The whole line is in the transcript below the stage.
  const idx = chapter(1).narration.findIndex(l => l.cue === cue.id);
  await expect(page.locator(`.transcript [data-line="${idx}"]`)).toHaveText(cue.text);
});

test('with the bottom sheet open the exhibit sits in the strip visible above it', async ({ page }) => {
  await page.goto('/einstein/1/?debug');
  await ready(page);
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  // The low vitrine, exhibit 4, the hardest to keep in view.
  const ex = exhibit(1, 'ex4');
  await page.locator('[data-rail="ex4"]').click();
  await expect(page.getByRole('dialog', { name: `${ex.number}. ${ex.title}` })).toBeVisible({ timeout: 15000 });
  await page.locator('#room[data-camera="rest"]').waitFor();
  await page.locator('[data-stage]').scrollIntoViewIfNeeded();
  const stage = await page.locator('[data-stage]').boundingBox();
  const bar = await page.getByRole('group', { name: 'Narration player' }).boundingBox();
  const r = await page.evaluate(() => window.__voa.exhibitScreen('ex4'));
  expect(r.y, 'top of the exhibit inside the stage').toBeGreaterThanOrEqual(stage.y - 1);
  expect(r.y + r.height, 'bottom of the exhibit above the player bar').toBeLessThanOrEqual(bar.y + 1);
});

// WCAG 2.5.3 Label in Name: in every room, each door chip's accessible name contains the words the
// chip shows (the arrows are decoration), same spelling and apostrophe, so a speech user can say
// what they see. Checked at phone width (short labels) and on a wide screen (full labels) below.
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const labelInName = async (page, n) => {
  await page.goto(`/einstein/${n}/`);
  // The chips show once the room is drawn: while the loading view covers the stage they are hidden
  // (Codex gate round 2), and a hidden chip shows no label to compare.
  await ready(page);
  for (const a of await page.locator('[data-door-nav] a').all()) {
    const shown = (await a.innerText()).replace(/[\u2039\u203a]/g, '').replace(/\s+/g, ' ').trim();
    expect(shown.length, `room ${n}: chip shows a label`).toBeGreaterThan(0);
    await expect(a, `room ${n}: "${shown}"`).toHaveAccessibleName(new RegExp(esc(shown), 'i'));
  }
};
for (const n of CHAPTER_NUMBERS) {
  test(`room ${n}: every door chip's accessible name contains its visible label`, async ({ page }) => { await labelInName(page, n); });
}

test.describe('wide screen', () => {
  test.use({ viewport: { width: 1280, height: 720 } });
  test('door buttons keep their full labels on a wide screen', async ({ page }) => {
    await page.goto('/einstein/1/');
    await ready(page);
    const a = page.locator('[data-door-nav] a[data-door="exit"]');
    await expect(a.locator('.door-full')).toBeVisible();
    await expect(a.locator('.door-short')).toBeHidden();
  });
  for (const n of CHAPTER_NUMBERS) {
    test(`room ${n}: every door button's accessible name contains its visible label`, async ({ page }) => { await labelInName(page, n); });
  }
});
