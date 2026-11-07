// Runs against the dev bench (/dev/portrait/) built with PUBLIC_DEV_PAGES=1: npm run e2e:dev.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const VOICE = "AI-generated voice, not Albert Einstein's voice. Words: Albert Einstein, PLACEHOLDER, PLACEHOLDER.";
const BADGE = 'AI-assisted painted portrait. Our software painted it from a photograph (Library of Congress, published 1947; '
  + 'No known restrictions on publication. No renewal in Copyright office (checked 8/31/76)). Movement is added with an AI '
  + 'depth estimate; no face or expression is generated. Albert Einstein did not pose for or approve this image.';

// 2.2 s of silence, used only when the Kokoro placeholder line has not been built locally
// (tools/build_audio.py --dev-placeholder), so the player is tested either way.
function silentWav(seconds = 2.2, rate = 8000) {
  const n = Math.round(seconds * rate), b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  return b;
}
const FALLBACK = {
  mp3: { contentType: 'audio/wav', body: silentWav() },
  vtt: { contentType: 'text/vtt', body: 'WEBVTT\n\nplaceholder\n00:00:00.000 --> 00:00:02.000\nPLACEHOLDER, not a quote\n' },
};

test.beforeEach(async ({ context }) => {
  await context.route('**/dev/audio/**', async route => {
    const res = await route.fetch();
    if (res.ok()) return route.fulfill({ response: res });
    return route.fulfill({ status: 200, ...FALLBACK[route.request().url().endsWith('.vtt') ? 'vtt' : 'mp3'] });
  });
});

test('portrait shows labels and a captioned quote', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/dev/portrait/');
  const fig = page.locator('figure.portrait');
  await expect(fig).toContainText('AI-assisted painted portrait');
  await expect(fig.locator('.portrait-badge')).toContainText(BADGE);
  await expect(fig.getByRole('img')).toHaveAccessibleName('Painted portrait of Albert Einstein, based on a photograph from Library of Congress, published 1947.');
  // Label is shown before the voice plays; nothing autoplays.
  await expect(fig.locator('.voice-label')).toHaveText(VOICE);
  expect(await fig.locator('audio').evaluate(a => a.paused)).toBe(true);
  await expect(fig).toHaveAttribute('data-motion', 'running');
  await expect(fig.locator('canvas')).toBeVisible();

  await fig.getByRole('button', { name: /Hear the quote/ }).click();
  await expect(fig.locator('[data-caption]')).toHaveText('PLACEHOLDER, not a quote');
  await expect(fig).toContainText('AI-generated voice, not Albert Einstein');
  await expect(fig.getByRole('button', { name: 'Pause the quote' })).toBeVisible();
  await expect(fig.getByRole('button', { name: 'Pause motion' })).toBeVisible();

  // Transcript carries the words and the label.
  await fig.getByText('Transcript', { exact: true }).click();
  await expect(fig.locator('[data-transcript="placeholder"] blockquote')).toHaveText('PLACEHOLDER, not a quote');

  // Pause motion: canvas goes, the still painting stays, the loop stops.
  await fig.getByRole('button', { name: 'Pause motion' }).click();
  await expect(fig).toHaveAttribute('data-motion', 'still');
  await expect(fig.locator('canvas')).toBeHidden();
  await expect(fig.locator('img.still')).toBeVisible();
  await fig.getByRole('button', { name: 'Resume motion' }).click();
  await expect(fig).toHaveAttribute('data-motion', 'running');

  for (const b of await fig.getByRole('button').all()) {
    const box = await b.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);
  }
  const r = await new AxeBuilder({ page }).include('figure.portrait').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(r.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('reduced motion shows a still portrait', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  await ctx.route('**/dev/audio/**', async route => {
    const res = await route.fetch();
    if (res.ok()) return route.fulfill({ response: res });
    return route.fulfill({ status: 200, ...FALLBACK[route.request().url().endsWith('.vtt') ? 'vtt' : 'mp3'] });
  });
  const page = await ctx.newPage(); await page.goto('/dev/portrait/');
  const fig = page.locator('figure.portrait');
  await expect(page.locator('figure.portrait img.still')).toBeVisible();
  await expect(fig.locator('canvas')).toBeHidden();
  await expect(fig).toHaveAttribute('data-motion', 'still');
  await expect(fig.getByRole('button', { name: 'Pause motion' })).toBeHidden();
  // Captions still work without motion.
  await fig.getByRole('button', { name: /Hear the quote/ }).click();
  await expect(fig.locator('[data-caption]')).toHaveText('PLACEHOLDER, not a quote');
  await ctx.close();
});

test('keyboard plays the quote, and the canvas stops when scrolled away', async ({ page }) => {
  await page.goto('/dev/portrait/');
  const fig = page.locator('figure.portrait');
  await expect(fig).toHaveAttribute('data-motion', 'running');
  const hear = fig.getByRole('button', { name: /Hear the quote/ });
  await hear.focus();
  await page.keyboard.press('Enter');
  await expect(fig.locator('[data-caption]')).toHaveText('PLACEHOLDER, not a quote');
  await page.keyboard.press('Enter');
  await expect(hear).toHaveText('Hear the quote');
  await expect(fig.locator('[data-caption]')).toBeHidden();

  await page.evaluate(() => { document.body.style.paddingBottom = '4000px'; window.scrollTo(0, document.body.scrollHeight); });
  await expect(fig).toHaveAttribute('data-motion', 'still');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(fig).toHaveAttribute('data-motion', 'running');
});

test('a lost WebGL context falls back to the still painting and recovers', async ({ page }) => {
  await page.goto('/dev/portrait/');
  const fig = page.locator('figure.portrait');
  await expect(fig).toHaveAttribute('data-motion', 'running');
  await page.evaluate(() => { window.__lose = document.querySelector('figure.portrait canvas').getContext('webgl2').getExtension('WEBGL_lose_context'); window.__lose.loseContext(); });
  await expect(fig).toHaveAttribute('data-motion', 'lost');
  await expect(fig.locator('canvas')).toBeHidden();
  await expect(fig.locator('img.still')).toBeVisible();
  await expect(fig.getByRole('button', { name: 'Pause motion' })).toBeHidden();
  await page.evaluate(() => window.__lose.restoreContext());
  await expect(fig).toHaveAttribute('data-motion', 'running');
  await expect(fig.locator('canvas')).toBeVisible();
});

test('a quote without audio has no play button and no AI voice label', async ({ page }) => {
  await page.goto('/dev/portrait/');
  const fig = page.locator('figure.portrait');
  await expect(fig.getByRole('button', { name: /Hear the quote/ })).toHaveCount(1);
  await expect(fig.getByText('AI-generated voice', { exact: false })).toHaveCount(2); // quote 1: under its button and in the transcript
  const t2 = fig.locator('[data-transcript="placeholder-2"]');
  await expect(t2).toContainText('PLACEHOLDER 2, not a quote');
  await expect(t2).not.toContainText('AI-generated voice');
});
