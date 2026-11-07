// The WordPress embed teaser (/embed/einstein/): the oEmbed iframe markup as WordPress would paste
// it, the wp-embed messages it posts, its height limit, the plain link outside WordPress, axe and
// keyboard reach.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { PRODUCTION_ORIGIN } from '../src/content/origin.js';
import { chapter, institutionsOf } from './content.js';

const oembed = JSON.parse(readFileSync('public/oembed/einstein.json', 'utf8'));
// The teaser's line is the first chapter's opening narration line; its citation names the holders of
// that line's sources (data/inductees/einstein/sources.jsonl).
const LINE = chapter(1).narration[0];
const HOLDERS = institutionsOf(LINE.fact_ids);

// A stand-in for the WordPress page. The iframe is built the way wp_filter_oembed_result() does
// (wp-includes/embed.php): sandbox="allow-scripts" and security="restricted" prepended, the secret
// appended to src as "#?secret=" and set as data-secret. The oEmbed html's placeholder origin is
// swapped for the preview server. A listener records every message the iframe posts.
function wpIframe(baseURL, secret) {
  const html = oembed.html.replace(PRODUCTION_ORIGIN, baseURL)
    .replace(/ src="([^"]*)"/, ` src="$1#?secret=${secret}" data-secret="${secret}"`)
    .replace('<iframe', '<iframe class="wp-embedded-content" sandbox="allow-scripts" security="restricted"');
  return `<!doctype html><body><script>window.msgs=[];addEventListener('message',e=>msgs.push(e.data));</script>${html}</body>`;
}
async function host(page, baseURL, secret = 'abc123') {
  await page.setContent(wpIframe(baseURL, secret));
  return page.frameLocator('iframe');
}

test('posts its height (at most 1000) and the full-experience link to WordPress', async ({ page, baseURL }) => {
  const frame = await host(page, baseURL);
  await expect(frame.getByRole('heading', { level: 1, name: 'Albert Einstein' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => msgs.some(m => m.message === 'height'))).toBe(true);
  const heights = await page.evaluate(() => msgs.filter(m => m.message === 'height'));
  for (const m of heights) {
    expect(m.secret).toBe('abc123');
    expect(m.value).toBeGreaterThan(0);
    expect(m.value).toBeLessThanOrEqual(1000);
  }
  await frame.getByRole('link', { name: 'Open the full experience' }).click();
  await expect.poll(() => page.evaluate(() => msgs.some(m => m.message === 'link'))).toBe(true);
  const link = await page.evaluate(() => msgs.find(m => m.message === 'link'));
  expect(link).toEqual({ message: 'link', value: `${baseURL}/einstein/`, secret: 'abc123' });
  expect(page.url()).toBe('about:blank'); // WordPress navigates; the frame did not
});

test('is compact, with no 3D, no audio and no autoplay', async ({ page }) => {
  await page.goto('/embed/einstein/');
  expect(await page.evaluate(() => document.body.getBoundingClientRect().height)).toBeLessThanOrEqual(1000);
  expect(await page.locator('canvas, audio, video, model-viewer').count()).toBe(0);
  await expect(page.getByRole('img', { name: /^Painted portrait of Albert Einstein/ })).toBeVisible();
  await expect(page.locator('.line')).toHaveText(LINE.text);
  expect(HOLDERS.length).toBeGreaterThan(0);
  await expect(page.locator('.src')).toContainText(`${HOLDERS.length === 1 ? 'Source' : 'Sources'}: ${HOLDERS.join('; ')}.`);
  // Every link stays on this site (WordPress follows link messages only to the iframe's own host).
  for (const a of await page.locator('a').all()) expect(await a.getAttribute('href')).toMatch(/^\//);
  await expect(page.locator('.src a')).toHaveAttribute('href', '/einstein/lite/#ch-1-line-0');
  await expect(page.locator('.badge')).toContainText('AI-assisted painted portrait');
});

test('outside WordPress the link is a normal link and nothing is posted', async ({ page }) => {
  await page.goto('/embed/einstein/');
  const open = page.getByRole('link', { name: 'Open the full experience' });
  await expect(open).toHaveAttribute('href', '/einstein/');
  await open.click();
  await expect(page).toHaveURL(/\/einstein\/$/);
});

test('the citation link goes to the line on the Lite page and is sent as a link message', async ({ page, baseURL }) => {
  const frame = await host(page, baseURL);
  await frame.getByRole('link', { name: 'See the sources for this line' }).click();
  await expect.poll(() => page.evaluate(() => msgs.some(m => m.message === 'link'))).toBe(true);
  const link = await page.evaluate(() => msgs.find(m => m.message === 'link'));
  expect(link).toEqual({ message: 'link', value: `${baseURL}/einstein/lite/#ch-1-line-0`, secret: 'abc123' });
  expect(new URL(link.value).host).toBe(new URL(baseURL).host); // wp-embed.js checks targetURL.host === sourceURL.host
  await page.goto('/einstein/lite/#ch-1-line-0');
  await expect(page.locator('#ch-1-line-0')).toContainText(LINE.text);
});

test('a secret that is not letters and digits is ignored: nothing is posted', async ({ page, baseURL }) => {
  const html = wpIframe(baseURL, 'abc123').replace('#?secret=abc123', '#?secret=abc%22%3E');
  await page.setContent(html);
  await expect(page.frameLocator('iframe').getByRole('heading', { level: 1, name: 'Albert Einstein' })).toBeVisible();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => msgs.length)).toBe(0);
});

test('a framed page without a secret does not post and its link still works', async ({ page, baseURL }) => {
  const html = oembed.html.replace(PRODUCTION_ORIGIN, baseURL);
  await page.setContent(`<!doctype html><body><script>window.msgs=[];addEventListener('message',e=>msgs.push(e.data));</script>${html}</body>`);
  await expect(page.frameLocator('iframe').getByRole('heading', { level: 1, name: 'Albert Einstein' })).toBeVisible();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => msgs.length)).toBe(0);
});

test('is axe-clean and the link is reachable by keyboard', async ({ page }) => {
  await page.goto('/embed/einstein/');
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice']).analyze();
  expect(r.violations).toEqual([]);
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement && document.activeElement.textContent === 'Open the full experience')) break;
  }
  await expect(page.getByRole('link', { name: 'Open the full experience' })).toBeFocused();
  const box = await page.getByRole('link', { name: 'Open the full experience' }).boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(24);
});

test('the landing page advertises the oEmbed response for discovery', async ({ page }) => {
  await page.goto('/einstein/');
  const link = page.locator('link[rel="alternate"][type="application/json+oembed"]');
  await expect(link).toHaveAttribute('href', `${PRODUCTION_ORIGIN}/oembed/einstein.json`);
  await expect(link).toHaveAttribute('title', 'Albert Einstein');
});
