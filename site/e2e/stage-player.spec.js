// Narration player on the stage: a big play button on the scene before start, then a control bar
// and captions over the stage; keyboard operable; no autoplay; transcript stays below the stage.
import { test, expect } from '@playwright/test';
import { chapter, revealCue } from './content.js';
import { seekNarration } from './narration.js';
import { roomReady } from './room.js';

const within = (inner, outer) => inner.x >= outer.x - 1 && inner.y >= outer.y - 1
  && inner.x + inner.width <= outer.x + outer.width + 1 && inner.y + inner.height <= outer.y + outer.height + 1;

test('stage play button and control bar sit on the stage and drive the narration', async ({ page }) => {
  await page.goto('/einstein/2/');
  await roomReady(page);
  const stage = await page.locator('[data-stage]').boundingBox();
  const audio = page.locator('#narration');
  await expect(audio).not.toHaveAttribute('controls', /.*/); // no plain <audio controls> below the notes
  expect(await audio.evaluate(a => a.paused)).toBe(true); // no autoplay
  const big = page.getByRole('button', { name: 'Play narration' }).first();
  await expect(page.locator('[data-stage-play]')).toBeVisible();
  const bigBox = await page.locator('[data-stage-play]').boundingBox();
  expect(within(bigBox, stage)).toBe(true);
  expect(Math.abs(bigBox.x + bigBox.width / 2 - (stage.x + stage.width / 2))).toBeLessThan(4); // centred
  const bar = page.getByRole('group', { name: 'Narration player' });
  const barBox = await bar.boundingBox();
  expect(within(barBox, stage)).toBe(true);
  expect(barBox.y + barBox.height).toBeGreaterThan(stage.y + stage.height - 4); // along the bottom of the stage
  for (const b of await bar.getByRole('button').all()) {
    const r = await b.boundingBox();
    expect(Math.min(r.width, r.height)).toBeGreaterThanOrEqual(24);
  }
  await big.click();
  await expect(page.locator('[data-stage-play]')).toBeHidden();
  await expect.poll(() => audio.evaluate(a => !a.paused)).toBe(true);
  const pp = bar.locator('[data-play]');
  await expect(pp).toHaveAttribute('aria-label', 'Pause narration');
  await pp.click();
  await expect.poll(() => audio.evaluate(a => a.paused)).toBe(true);
  await expect(pp).toHaveAttribute('aria-label', 'Play narration');
  // Keyboard: K plays and pauses, C toggles captions, M mutes.
  await pp.focus();
  await page.keyboard.press('k');
  await expect.poll(() => audio.evaluate(a => !a.paused)).toBe(true);
  await page.keyboard.press('k');
  await expect.poll(() => audio.evaluate(a => a.paused)).toBe(true);
  // Captions over the stage: seek into the cue that names the first exhibit and read its line.
  const lines = chapter(2).narration;
  const line = lines.find(l => l.cue === revealCue(2, 'ex1'));
  await page.waitForFunction(n => (document.getElementById('cues').track.cues || []).length === n, lines.length);
  await seekNarration(page, { cue: line.cue, dt: 0.1 });
  const cap = page.locator('[data-captions]');
  await expect(cap).toContainText(line.text);
  expect(within(await cap.boundingBox(), stage)).toBe(true);
  const cc = bar.getByRole('button', { name: 'Captions' });
  await expect(cc).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('c');
  await expect(cc).toHaveAttribute('aria-pressed', 'false');
  await expect(cap).toBeHidden();
  await cc.click();
  await expect(cap).toBeVisible();
  await page.keyboard.press('m');
  expect(await audio.evaluate(a => a.muted)).toBe(true);
  await expect(bar.getByRole('button', { name: 'Unmute' })).toHaveAttribute('aria-pressed', 'true');
  // The scrubber seeks.
  const scrub = bar.getByRole('slider', { name: 'Seek narration' });
  await scrub.fill('20');
  await expect.poll(() => audio.evaluate(a => Math.round(a.currentTime))).toBe(20);
  await expect(scrub).toHaveAttribute('aria-valuetext', /^0:20 of \d+:\d\d$/);
  // The transcript stays below the stage for screen readers and reading.
  const tr = page.locator('details.transcript');
  await expect(tr).toBeAttached();
  expect((await tr.boundingBox()).y).toBeGreaterThan(stage.y + stage.height - 1);
});
