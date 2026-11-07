import { readFileSync } from 'node:fs';
// The real Einstein slice: every room in the scanned Great Drawing Room (Task 5); the study's
// reconstruction plaque returns with Task 6's study corner.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { chapter, revealCue, revealOrder, revealSteps, CHAPTER_NUMBERS } from './content.js';
import { seekNarration } from './narration.js';
import { roomReady } from './room.js';

const axe = async page => {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  return r.violations.filter(v => ['serious', 'critical'].includes(v.impact));
};
// Each chapter's quotes as shipped (each equals a verified direct-quote fact; content_check.py), with
// the AI voice label built from its grounded attribution: "Words: <name>, <source>, <date>". The
// living portrait appears only in a chapter that carries quotes ([chapter].astro).
const CHAPTERS = CHAPTER_NUMBERS;
const quotesOf = n => chapter(n).quotes || [];
const voiceOf = q => `AI-generated voice, not Albert Einstein's voice. Words: Albert Einstein, ${q.attribution.source}, ${q.attribution.date}.`;

test('the painted portrait files are served (the embed teaser shows them too)', async ({ request }) => {
  expect((await request.get('/portraits/einstein.webp')).status()).toBe(200);
  expect((await request.get('/portraits/einstein-depth.png')).status()).toBe(200);
});

// One test per shipped room, so each room's page load has its own time budget.
for (const n of CHAPTERS) test(`room ${n}: the portrait speaks every verified quote of its chapter with the AI voice label, and only where there are quotes`, async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  {
    const quotes = quotesOf(n);
    await page.goto(`/einstein/${n}/`);
    const fig = page.locator('figure.portrait');
    if (!quotes.length) {
      // No quote, no portrait, no button and no voice label.
      await expect(fig).toHaveCount(0);
      await expect(page.getByRole('button', { name: /Hear the quote/ })).toHaveCount(0);
      expect(errors).toEqual([]);
      return;
    }
    await expect(fig.locator('img.still')).toHaveAttribute('alt', 'Painted portrait of Albert Einstein, based on a photograph from Library of Congress, published 1947.');
    await expect(fig.locator('img.still')).toHaveAttribute('src', '/portraits/einstein.webp');
    await expect(fig.locator('.portrait-badge')).toContainText('AI-assisted painted portrait. Our software painted it from a photograph (Library of Congress, published 1947; No known restrictions on publication');
    // Exactly the shipped quotes: none invented, none dropped.
    await expect(fig.getByRole('button', { name: /Hear the quote/ })).toHaveCount(quotes.length);
    await expect(fig.locator('.voice-label')).toHaveText(quotes.map(voiceOf));
    for (const q of quotes) {
      await expect(fig.locator(`[data-transcript="${q.id}"] blockquote`)).toHaveText(q.text);
      const mp3 = await request.get(`/audio/einstein/${n}-${q.id}.mp3`);
      expect(mp3.status()).toBe(200);
      expect((await mp3.body()).length).toBeGreaterThan(10000);
      expect(await (await request.get(`/audio/einstein/${n}-${q.id}.vtt`)).text()).toContain(q.text);
    }
    await fig.getByRole('button', { name: quotes.length > 1 ? 'Hear the quote 1' : 'Hear the quote' }).click();
    await expect(fig.locator('[data-caption]')).toHaveText(quotes[0].text);
  }
  expect(errors).toEqual([]);
});

test('narration cue track reveals exhibits as the guide names them', async ({ page, request }) => {
  await page.goto('/einstein/1/');
  const audio = page.locator('#narration');
  await expect(audio).toHaveAttribute('src', '/audio/einstein/1-narration.mp3');
  const vtt = await (await request.get('/audio/einstein/1-narration.vtt')).text();
  expect(vtt).toMatch(/^WEBVTT/);
  // One cue per shipped narration line, in order.
  const lines = chapter(1).narration;
  expect([...vtt.matchAll(/^(c\d+)$/gm)].map(m => m[1])).toEqual(lines.map(l => l.cue));
  expect((await request.get('/audio/einstein/1-narration.mp3')).status()).toBe(200);
  await roomReady(page);
  await page.waitForFunction(n => document.getElementById('cues').track.cues && document.getElementById('cues').track.cues.length === n, lines.length);
  const item = id => page.locator(`#exhibits button[data-exhibit="${id}"]`);
  const steps = revealSteps(1);
  expect(steps.length).toBeGreaterThanOrEqual(3);
  for (const id of revealOrder(1)) await expect(item(id)).toBeHidden();
  // Seek to the second line that reveals something: everything named up to it is shown, everything
  // first named later is not yet.
  const [first, second, ...later] = steps;
  await seekNarration(page, { cue: second.cue, dt: 0.05 });
  for (const id of [...first.reveals, ...second.reveals]) await expect(item(id)).toBeVisible();
  for (const id of later.flatMap(s => s.reveals)) await expect(item(id)).toBeHidden();
  for (const l of lines) await expect(page.locator('details.transcript')).toContainText(l.text);
});

test('the naturalization record opens as a 360 document with its reconstruction note and original link', async ({ page, request }) => {
  await page.goto('/einstein/1/');
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  const btn = page.getByRole('button', { name: '4. Petition for Naturalization, petition number 4009' });
  await btn.click();
  // The panel opens when the glide to the exhibit has arrived (the stage is aria-busy until then);
  // software WebGL draws a scanned room's frames slowly, so wait on that state, not on a clock.
  await page.locator('[data-stage]:not([aria-busy])').waitFor();
  const panel = page.getByRole('dialog', { name: '4. Petition for Naturalization, petition number 4009' });
  await expect(panel).toBeVisible();
  const mv = panel.locator('model-viewer');
  await expect(mv).toHaveAttribute('src', '/media/EIN-M-0019-p3-4.glb');
  await expect(mv).toHaveAttribute('alt', 'Declaration of Intention and Petition for Naturalization for Albert Einstein');
  await expect(mv).toHaveAttribute('camera-controls');
  const glb = await request.get('/media/EIN-M-0019-p3-4.glb');
  expect(glb.status()).toBe(200);
  expect((await glb.body()).subarray(0, 4).toString()).toBe('glTF');
  await expect.poll(() => mv.evaluate(el => Boolean(customElements.get('model-viewer')) && el.loaded === true), { timeout: 30000 }).toBe(true);
  await expect(panel.locator('p.reconstruction')).toHaveText('Reconstruction based on Declaration of Intention and Petition for Naturalization for Albert Einstein, U.S. National Archives and Records Administration, accessed 2026-10-08');
  await expect(panel.locator('[data-plain-back]')).toHaveCount(0); // pages 3 and 4: front and back are scans
  await expect(panel.locator('dl.meta')).toContainText('Original record');
  await expect(panel.locator('dl.meta')).toContainText('Unrestricted');
  await expect(panel.getByRole('link', { name: 'See the original' })).toHaveAttribute('href', 'https://catalog.archives.gov/id/596270');
  await page.keyboard.press('Escape');
  await expect(btn).toBeFocused();
  expect(await axe(page)).toEqual([]);
});

// Task 5 (owner amendment 2026-10-13), Task 6: the study at 112 Mercer Street is its own room in the
// scanned Great Drawing Room, with the recreated study corner in its reserved area. The room shows the
// corner (only its declared objects, its label), the corner's plaque (label, both basis photographs
// from their records, the recreation note, the furniture credit) and the furniture's CC BY credit in
// the room credits; the Lite page shows the same plaque. The place's look-around is not shown.
test('the study: its own scanned room with the recreated study corner, its plaque in 3D and Lite', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/einstein/2/?debug');
  const study = chapter(2);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(study.title);
  await roomReady(page);
  await expect(page.locator('#room')).toHaveAttribute('data-scan', /preview|full/);
  const corner = JSON.parse(readFileSync('../content/einstein/study-corner.json', 'utf8'));
  const drawn = await page.evaluate(() => window.__voa.corner());
  expect(drawn.inScene).toBe(true);
  expect(drawn.label).toBe(corner.label);
  expect(drawn.objects).toEqual(corner.objects.map(o => o.id).filter(id => id !== 'books').sort()); // the books are in the bookcase model
  const plaque = page.getByRole('region', { name: corner.label });
  await expect(plaque).toBeVisible();
  await expect(plaque.locator('li[data-basis]')).toHaveCount(2);
  await expect(plaque.locator('li[data-basis="EIN-M-0013"] a.original')).toHaveAttribute('href', 'https://catalog.archives.gov/id/276538325');
  await expect(plaque.locator('[data-corner-note]')).toHaveText('Modern stand-in furniture of the kinds these two photographs show. The designs are not the originals; sizes and positions are estimated.');
  await expect(plaque.locator('[data-corner-credit]')).toContainText('Renend Studio');
  await expect(plaque.locator('[data-corner-where]')).toHaveCount(0); // the 3D page shows the corner itself
  await expect(page.locator('#room-credits [data-corner-credit]')).toContainText(corner.sources[0].credit);
  await expect(page.locator('#room-credits [data-corner-credit] a', { hasText: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
  await expect(page.getByRole('region', { name: 'Reconstruction based on' })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Look around' })).toHaveCount(0);
  expect(study.room.reserved.map(r => r.id)).toEqual(['study-corner']);
  expect(await axe(page)).toEqual([]);
  expect(errors).toEqual([]);
  await page.goto('/einstein/lite/');
  const lite = page.locator('section#chapter-2 [data-study-corner]');
  await expect(lite).toHaveCount(1);
  await expect(lite.getByRole('heading', { level: 3 })).toHaveText(corner.label);
  await expect(lite.locator('li[data-basis]')).toHaveCount(2);
  // Lite has no 3D room: its plaque says where the corner stands.
  await expect(lite.locator('[data-corner-where]')).toHaveText(/^In the 3D museum, /);
  await expect(page.locator('section#chapter-2 .reconstruction-plaque')).toHaveCount(1);
});

test('study narration reveals the 1943 photographs and the Brunauer letter opens in 360', async ({ page, request }) => {
  await page.goto('/einstein/2/');
  await expect(page.locator('#narration')).toHaveAttribute('src', '/audio/einstein/2-narration.mp3');
  expect((await request.get('/audio/einstein/2-narration.mp3')).status()).toBe(200);
  await page.waitForFunction(n => (document.getElementById('cues').track.cues || []).length === n, chapter(2).narration.length);
  // The cue that names the 1943 photographs (ex1, ex2); the letter (ex3) comes later.
  const cue = revealCue(2, 'ex1');
  expect(revealCue(2, 'ex2')).toBe(cue);
  await seekNarration(page, { cue, dt: 0.05 });
  await expect(page.locator('#exhibits button[data-exhibit="ex1"]')).toBeVisible();
  await expect(page.locator('#exhibits button[data-exhibit="ex2"]')).toBeVisible();
  await expect(page.locator('#exhibits button[data-exhibit="ex3"]')).toBeHidden();
  await page.getByRole('button', { name: 'Show all exhibits' }).click();
  await page.getByRole('button', { name: "3. Albert Einstein's letter of June 18, 1943 to Lieutenant Stephen Brunauer" }).click();
  // The panel opens when the glide has arrived (the stage is aria-busy until then).
  await page.locator('[data-stage]:not([aria-busy])').waitFor();
  const panel = page.locator('#panel');
  await expect(panel.locator('model-viewer')).toHaveAttribute('src', '/media/EIN-M-0015-p1.glb');
  await expect(panel.locator('[data-plain-back]')).toHaveText('Back of this model is plain paper; the original is single-sided.');
  await expect(panel.getByRole('link', { name: 'See the original' })).toHaveAttribute('href', 'https://catalog.archives.gov/id/305248');
  expect((await request.get('/media/EIN-M-0015-p1.glb')).status()).toBe(200);
});
