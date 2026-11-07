// Task 11: journey map, Lite page, ending chooser, quiz, "How this was made", ambient toggle.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { chapter, QUIZ, rightOption, wrongOptions, CHAPTER_NUMBERS } from './content.js';
import { JOURNEY, MAPPED, stopOf, titleName } from './journey-content.js';

const axe = async page => {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  return r.violations.filter(v => ['serious', 'critical'].includes(v.impact));
};

test('lite page lists the same exhibits as the room, no canvas', async ({ page }) => {
  await page.goto('/einstein/lite/');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'See the original' }).first()).toBeVisible();
  // Both chapters, with each room's shipped exhibits, every transcript line with one chip per cited
  // fact, and exactly the chapter's quotes, each with the AI voice label.
  for (const n of CHAPTER_NUMBERS) {
    const ch = chapter(n);
    await expect(page.locator(`section#chapter-${n} .lite-exhibits > li`)).toHaveCount(ch.exhibits.length);
    const lines = page.locator(`section#chapter-${n} .lite-transcript p`);
    await expect(lines).toHaveCount(ch.narration.length);
    for (const [i, l] of ch.narration.entries()) {
      await expect(lines.nth(i)).toContainText(l.text);
      await expect(lines.nth(i).locator('button[data-chip]')).toHaveCount(l.fact_ids.length);
    }
    await expect(page.locator(`section#chapter-${n} .lite-quote`)).toHaveCount((ch.quotes || []).length);
    await expect(page.locator(`section#chapter-${n} .voice-label`)).toHaveCount((ch.quotes || []).length);
    for (const v of await page.locator(`section#chapter-${n} .voice-label`).all()) await expect(v).toContainText("AI-generated voice, not Albert Einstein's voice.");
  }
  // Task 6: the study is a scanned room with its recreated corner; its plaque (the corner's, not the
  // place's) is on the Lite page.
  await expect(page.locator('section#chapter-2 .reconstruction-plaque')).toHaveCount(1);
  await expect(page.locator('section#chapter-2 [data-study-corner]')).toHaveCount(1);
  expect(await axe(page)).toEqual([]);
});

test('WebGL failure lands in lite', async ({ page }) => {
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await page.goto('/einstein/1/');
  await expect(page).toHaveURL(/\/einstein\/lite\/#chapter-1$/);
});

test('reduced-motion visitor lands on Lite and can choose the 3D room', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/einstein/1/');
  await expect(page).toHaveURL(/\/einstein\/lite\/#chapter-1$/);
  await expect(page.locator('canvas')).toHaveCount(0);
  const open3d = page.locator('section#chapter-1').getByRole('link', { name: 'Open this room in 3D' });
  await open3d.focus();
  await expect(open3d).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/einstein\/1\/$/);
  // The explicit choice beats the media query: the room stays, with no redirect back to Lite.
  await expect(page.locator('canvas#room')).toHaveCount(1);
  await expect(page).toHaveURL(/\/einstein\/1\/$/);
  // The room's own link switches back to Lite and the choice sticks.
  await page.getByRole('link', { name: 'Lite version (no 3D)' }).click();
  await expect(page).toHaveURL(/\/einstein\/lite\/#chapter-1$/);
  await page.goto('/einstein/1/');
  await expect(page).toHaveURL(/\/einstein\/lite\/#chapter-1$/);
});

test('ending lets the visitor choose quiz or another inductee', async ({ page }) => {
  await page.goto('/einstein/end/');
  await expect(page.getByRole('link', { name: 'Take the quiz' })).toBeVisible();
  const others = page.getByRole('list', { name: 'Other inductees' });
  // Until their pages exist, the other four are listed and marked, not linked.
  await expect(others.getByRole('listitem')).toHaveCount(4);
  await expect(others.getByRole('link')).toHaveCount(0);
  await expect(others.getByText('Coming soon')).toHaveCount(4);
  await expect(page.getByRole('link', { name: 'Return to the entrance' })).toHaveAttribute('href', '/');
  expect(await axe(page)).toEqual([]);
});

test('quiz explanation reveals its sources', async ({ page }) => {
  await page.goto('/einstein/quiz/');
  await expect(page.locator('fieldset[data-question]')).toHaveCount(QUIZ.length);
  // Every shipped question: a wrong answer shows its own explanation and the right one's, each with
  // source chips; the right answer shows only its own.
  for (const spec of QUIZ) {
    const q = page.locator(`fieldset[data-question="${spec.id}"]`);
    const right = rightOption(spec), wrong = wrongOptions(spec)[0];
    await q.getByLabel(wrong.text, { exact: true }).check();
    await q.getByRole('button', { name: 'Check answer' }).click();
    await expect(q.locator('[data-verdict]')).toHaveText(`Not this one. The answer is: ${right.text}.`);
    const shown = q.locator('[data-explanation]:visible');
    await expect(shown).toHaveCount(2);
    await expect(shown.first()).toContainText(wrong.explanation);
    const chip = shown.first().locator('button[data-chip]').first();
    await chip.click();
    await expect(chip).toHaveAttribute('aria-expanded', 'true');
    await expect(shown.first().locator('[data-tip-body] a').first()).toBeVisible();
    await chip.click();
    await q.getByLabel(right.text, { exact: true }).check();
    await q.getByRole('button', { name: 'Check answer' }).click();
    await expect(q.locator('[data-verdict]')).toHaveText('Correct.');
    await expect(q.locator('[data-explanation]:visible')).toHaveCount(1);
    await expect(q.locator('[data-explanation]:visible')).toContainText(right.explanation);
  }
  expect(await axe(page)).toEqual([]);
});

test('flat-map list: a stop with a room has its whole title as one link to the room', async ({ page }) => {
  await page.goto('/einstein/?lite');
  const title = page.locator('[data-stop="mercer-street"]').getByRole('link', { name: titleName('mercer-street'), exact: true });
  await expect(title).toBeVisible();
  expect((await title.boundingBox()).height).toBeGreaterThanOrEqual(24);
  await title.click();
  await expect(page).toHaveURL(new RegExp(`/einstein/${stopOf('mercer-street').chapter}/$`));
  await page.goto('/einstein/?lite');
  // No room, no link: the title of Ulm stays text.
  await expect(page.locator('[data-stop="ulm"] h2 a.stop-title')).toHaveCount(0);
});

test('journey stops link to their chapters', async ({ page }) => {
  await page.goto('/einstein/');
  const stops = page.locator('ol.stops > li');
  await expect(stops).toHaveCount(JOURNEY.stops.length);
  await expect(page.locator('[data-stop="us-citizen"]').getByRole('link', { name: `Enter the room: ${chapter(stopOf('us-citizen').chapter).title}` })).toHaveAttribute('href', `/einstein/${stopOf('us-citizen').chapter}/`);
  // Pinned stops also link the published coordinates of their place, so the room link is named.
  const room = /^Enter the room/;
  await expect(page.locator('[data-stop="mercer-street"]').getByRole('link', { name: room })).toHaveAttribute('href', `/einstein/${stopOf('mercer-street').chapter}/`);
  await expect(page.locator('[data-stop="ulm"]').getByRole('link', { name: room })).toHaveCount(0);
  await expect(page.locator('[data-stop="ulm"]').getByRole('link', { name: `Published coordinates of ${stopOf('ulm').label}` })).toHaveAttribute('href', stopOf('ulm').map.coord_source);
  await expect(page.locator('[data-stop="us-citizen"]').getByRole('link', { name: /coordinates/ })).toHaveCount(0);
  // Drawn only where a stop's own fact names its place: 1940 citizenship has none, the study does.
  await expect(page.locator('svg .stop')).toHaveCount(MAPPED.length);
  for (const n of CHAPTER_NUMBERS) {
    const pinned = JOURNEY.stops.filter(s => s.map && s.chapter === n).length;
    await expect(page.locator(`svg a[href="/einstein/${n}/"]`)).toHaveCount(pinned);
  }
  expect(stopOf('us-citizen').map).toBeUndefined();
  expect(stopOf('mercer-street').map).toBeDefined();
  await expect(page.locator('[data-stop="mercer-street"] h2')).toContainText(stopOf('mercer-street').label);
  await expect(page.locator('[data-stop="mercer-street"] h2')).not.toContainText('World War II');
  await page.locator('[data-stop="us-citizen"]').getByRole('link', { name: /Enter the room/ }).click();
  await expect(page).toHaveURL(/\/einstein\/1\/$/);
});

test('journey and how-this-was-made pages are axe clean, with the portrait and reconstruction anchors', async ({ page, request }) => {
  await page.goto('/einstein/');
  expect(await axe(page)).toEqual([]);
  await page.goto('/how-this-was-made/');
  await expect(page.locator('#portraits')).toHaveCount(1);
  await expect(page.locator('#reconstructions')).toHaveCount(1);
  // The method describes what ships (Codex gate 2026-10-14): the scanned rooms with their credits and
  // the recreated corner's kit and our own pieces, not the retired textured rooms.
  const rooms = page.locator('section[aria-labelledby="rooms"]');
  await expect(rooms).toContainText("The King's Hall, Skokloster Castle, Sweden");
  await expect(rooms).toContainText('The Great Drawing Room, the Hallwyl Museum, Stockholm, Sweden');
  await expect(rooms).toContainText('CC BY 4.0');
  await expect(page.locator('section[aria-labelledby="reconstructions"]')).toContainText('Renend Studio');
  await expect(page.locator('section[aria-labelledby="reconstructions"]')).toContainText('chair are simple shapes we generate');
  await expect(page.locator('article.method')).not.toContainText('Poly Haven');
  for (const f of ['facts.csv', 'sources.csv', 'media.csv', 'provenance.jsonld']) {
    await expect(page.locator(`a[href="/data/${f}"]`)).toHaveCount(1);
    const r = await request.get(`/data/${f}`);
    expect(r.status()).toBe(200);
  }
  expect(await axe(page)).toEqual([]);
});

test('ambient toggle starts unpressed and plays nothing on load', async ({ page }) => {
  const tone = [];
  page.on('request', r => { if (r.url().includes('room-tone')) tone.push(r.url()); });
  await page.goto('/einstein/');
  const btn = page.getByRole('button', { name: 'Room sound' });
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await page.waitForTimeout(500);
  expect(tone).toEqual([]);
  expect(await page.evaluate(() => [...document.querySelectorAll('audio, video')].every(m => m.paused))).toBe(true);
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => tone.length).toBeGreaterThan(0);
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
});

test('skip link shows on focus and hides again on blur', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  expect((await skip.boundingBox()).y).toBeGreaterThanOrEqual(0);
  await page.keyboard.press('Tab');
  expect((await skip.boundingBox()).y).toBeLessThan(0);
});

// Holder wording is shown verbatim and can carry long unbroken URLs (LoC rights statements, licence
// links): the page must still fit the window, with no sideways scroll, on a phone and a desktop.
test('the Lite page fits the window: no sideways scroll from long holder wording', async ({ page }) => {
  await page.goto('/einstein/lite/');
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw).toBeLessThanOrEqual(cw);
});

// Chips that sit together (a heading's or a line's sources) have names a screen reader can tell apart,
// each starting with its visible label.
test('fact chips side by side have distinct accessible names that start with their visible label', async ({ page }) => {
  await page.goto('/einstein/lite/');
  const groups = await page.locator('.chips').evaluateAll(gs => gs.map(g => [...g.querySelectorAll('button[data-chip]')].map(b => ({ name: b.getAttribute('aria-label'), text: b.textContent.trim() }))));
  expect(groups.some(g => g.length > 1)).toBe(true);
  for (const g of groups) {
    for (const c of g) { expect(c.name).toBeTruthy(); expect(c.name.startsWith(c.text)).toBe(true); }
    expect(new Set(g.map(c => c.name)).size).toBe(g.length);
  }
});
