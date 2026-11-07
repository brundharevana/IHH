// Journey globe (/<slug>/ in 3D mode): pins, stop card on the stage, keyboard path, tour,
// fallbacks to the flat map (reduced motion, no WebGL2, context loss).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { JOURNEY, MAPPED, PLAIN, stopOf, numberOf, headingOf, titleName } from './journey-content.js';
const ready = page => expect(page.locator('#globe')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });

test('3D mode shows the globe with one numbered pin per mapped stop and hides the flat map', async ({ page }) => {
  await page.goto('/einstein/');
  await ready(page);
  await expect(page.locator('[data-stage] canvas#globe')).toHaveCount(1);
  await expect(page.locator('[data-pin]')).toHaveCount(MAPPED.length);
  expect(await page.locator('[data-pin]').evaluateAll(b => b.map(x => x.dataset.pin))).toEqual(MAPPED);
  expect(await page.locator('[data-pin]').allTextContents()).toEqual(MAPPED.map(id => String(numberOf(id))));
  await expect(page.locator('[data-flat-map]')).toBeHidden();
  await expect(page.locator('[data-show-stop]')).toHaveCount(MAPPED.length);
  for (const b of await page.locator('[data-show-stop]').all()) await expect(b).toBeVisible();
  await expect(page.getByRole('link', { name: 'NASA Visible Earth / Blue Marble' })).toBeVisible();
  // Every stop is still listed, pinned or not.
  await expect(page.locator('ol.stops > li')).toHaveCount(JOURNEY.stops.length);
  // Pins are at least 24 px targets and visible on the opening view.
  await expect.poll(() => page.locator('[data-pin]:not([data-offscreen])').count()).toBe(MAPPED.length);
  for (const p of await page.locator('[data-pin]').all()) {
    const box = await p.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(24); expect(box.height).toBeGreaterThanOrEqual(24);
  }
});

// Journey flow spec (2026-10-10): choosing a stop that has an aerial stack zooms down to it first
// (e2e/aerial.spec.js); the card opens at the building, where the zoom's own controls (Back to the
// globe) replace the tour, which returns on the globe. The tour itself opens cards on the globe.
test('the stop card is a non-modal dialog: canvas and pins inert, tour controls and the stop list operable', async ({ page }) => {
  await page.goto('/einstein/?debug');
  await ready(page);
  const btn = page.getByRole('button', { name: titleName(PLAIN), exact: true });
  await btn.click();
  const panel = page.locator('[data-stage] #panel');
  await expect(panel).toBeVisible({ timeout: 20000 });
  await expect(panel).toHaveAttribute('role', 'dialog');
  await expect(panel).not.toHaveAttribute('aria-modal', /.*/);
  for (const sel of ['#globe', '[data-pins]']) await expect(page.locator(sel)).toHaveAttribute('inert', '');
  for (const sel of ['[data-aerial-back]', 'ol.stops']) await expect(page.locator(sel)).not.toHaveAttribute('inert', '');
  await expect(page.locator('[data-aerial-back]')).toBeVisible();
  // Escape closes the card and zooms back out to the globe, where the tour is offered again.
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-aerial', 'idle', { timeout: 15000 });
  await page.locator('[data-tour-play]').click();
  await expect(panel).toBeVisible();
  for (const sel of ['#globe', '[data-pins]']) await expect(page.locator(sel)).toHaveAttribute('inert', '');
  for (const sel of ['[data-tour]', 'ol.stops']) await expect(page.locator(sel)).not.toHaveAttribute('inert', '');
  await page.locator('[data-tour-play]').click(); // pause
  await expect(page.locator('[data-tour-play]')).toContainText('Resume journey');
  // The tour carries on from the open card, and Escape from the tour button closes the card.
  await page.locator('[data-tour-play]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-tour-play]')).toContainText('Pause');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(panel).toBeHidden();
  for (const sel of ['#globe', '[data-pins]']) await expect(page.locator(sel)).not.toHaveAttribute('inert', '');
});

test('a numbered stop button turns the globe and opens its card on the stage; Escape returns focus', async ({ page }) => {
  await page.goto('/einstein/?debug');
  await ready(page);
  const btn = page.getByRole('button', { name: titleName(PLAIN), exact: true });
  await btn.focus();
  await page.keyboard.press('Enter');
  const panel = page.locator('[data-stage] #panel');
  await expect(panel).toBeVisible({ timeout: 20000 });
  await expect(panel.locator('#panel-title')).toContainText(headingOf(PLAIN));
  await expect(panel.locator('#panel-title')).toBeFocused();
  await expect(panel).toContainText(stopOf(PLAIN).lines[0].text);
  await expect(panel.locator('button[data-chip]').first()).toBeVisible();
  await expect(panel.getByRole('link', { name: `Published coordinates of ${stopOf(PLAIN).label}` })).toHaveAttribute('href', stopOf(PLAIN).map.coord_source);
  await expect(page.locator(`[data-pin="${PLAIN}"]`)).toHaveClass(/is-active/);
  expect(await page.evaluate(() => window.__voaGlobe.active())).toBe(PLAIN);
  // The card sits on the stage, inside its box.
  const s = await page.locator('[data-stage]').boundingBox(), c = await panel.boundingBox();
  expect(c.x).toBeGreaterThanOrEqual(s.x - 1); expect(c.y).toBeGreaterThanOrEqual(s.y - 1);
  expect(c.x + c.width).toBeLessThanOrEqual(s.x + s.width + 1); expect(c.y + c.height).toBeLessThanOrEqual(s.y + s.height + 1);
  // Once the zoom settles, the stop (the point under its pin) is in the part of the stage the card
  // leaves open. PLAIN is city precision: no building marker, so the projected point is checked.
  await expect.poll(() => page.evaluate(() => window.__voaGlobe.moving()), { timeout: 15000 }).toBe(false);
  const at = await page.evaluate(() => window.__voaAerial.centre());
  const pin = { x: at.x - 17, y: at.y - 17, width: 34, height: 34 };
  const cx = pin.x + pin.width / 2, cy = pin.y + pin.height / 2;
  const covered = cx >= c.x && cx <= c.x + c.width && cy >= c.y && cy <= c.y + c.height;
  expect(covered).toBe(false);
  // Nor under the zoom's buttons and caption at the top of the stage.
  for (const sel of ['[data-aerial-back]', '[data-aerial-caption]']) {
    const t = await page.locator(sel).boundingBox();
    expect(pin.y >= t.y + t.height || pin.x >= t.x + t.width || pin.x + pin.width <= t.x).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(btn).toBeFocused({ timeout: 10000 });
});

// Journey flow spec (2026-10-10, fix round 1): a pin with a room zooms down (to the neighbourhood
// when the verified fact names no address) and offers the room there, no stop card; a stop without
// a room ends on its card, whose next / previous still step through the pinned stops.
test('clicking a pin with a room zooms down and offers the room; cards step in list order', async ({ page }) => {
  await page.goto('/einstein/');
  await ready(page);
  await expect.poll(() => page.locator('[data-pin="mercer-street"]:not([data-offscreen])').count()).toBe(1);
  await page.locator('[data-pin="mercer-street"]').click();
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-aerial', 'arrived', { timeout: 20000 });
  const enter = page.locator('[data-aerial-enter]');
  await expect(enter).toHaveAttribute('href', `/einstein/${stopOf('mercer-street').chapter}/`);
  await expect(enter).toContainText('Enter the room: ');
  await expect(page.locator('[data-aerial-caption]')).toContainText('Present-day aerial view');
  expect(await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()
    .then(r => r.violations.filter(v => ['serious', 'critical'].includes(v.impact)))).toEqual([]);
  // The last pinned stop's card: Next is disabled, Previous is enabled and steps back.
  const last = MAPPED[MAPPED.length - 1], before = MAPPED[MAPPED.length - 2];
  await page.getByRole('button', { name: titleName(last), exact: true }).click();
  await page.locator('[data-aerial-skip]').click();
  const panel = page.locator('[data-stage] #panel');
  await expect(panel.locator('#panel-title')).toContainText(headingOf(last), { timeout: 30000 });
  await expect(panel.getByRole('button', { name: 'Next stop' })).toBeDisabled();
  await expect(panel.locator('a.room-link')).toHaveCount(stopOf(last).chapter ? 1 : 0);
  const prev = panel.getByRole('button', { name: 'Previous stop' });
  await expect(prev).toBeEnabled();
  await prev.click();
  await page.locator('[data-aerial-skip]').click();
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-aerial', 'arrived', { timeout: 30000 });
  expect(await page.evaluate(() => document.querySelector('[data-pin].is-active')?.dataset.pin)).toBe(before);
  await page.getByRole('button', { name: 'Back to the globe' }).click();
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-aerial', 'idle', { timeout: 15000 });
  expect(await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()
    .then(r => r.violations.filter(v => ['serious', 'critical'].includes(v.impact)))).toEqual([]);
});

test('Play journey opens each stop in order and can be paused and stopped', async ({ page }) => {
  await page.goto('/einstein/?debug');
  await ready(page);
  const play = page.locator('[data-tour-play]');
  await play.click();
  const panel = page.locator('[data-stage] #panel');
  await expect(panel.locator('#panel-title')).toContainText(headingOf(MAPPED[0]));
  // The tour keeps focus on its own controls, which stay usable while the card is open.
  await expect(play).toBeFocused();
  await expect(play).toContainText('Pause');
  await expect(page.locator('[data-announce]')).toHaveText(`Stop ${numberOf(MAPPED[0])}: ${stopOf(MAPPED[0]).label}`);
  await expect.poll(() => page.evaluate(() => window.__voaGlobe.tour().index), { timeout: 12000 }).toBe(1);
  await expect(panel.locator('#panel-title')).toContainText(headingOf(MAPPED[1]));
  await play.click();
  await expect(play).toContainText('Resume journey');
  await page.waitForTimeout(7500);
  expect(await page.evaluate(() => window.__voaGlobe.tour())).toEqual({ state: 'paused', index: 1 });
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(panel).toBeHidden();
  await expect(play).toContainText('Play journey');
  await expect(play).toBeFocused();
});

test('reduced motion shows the flat map; the visitor can choose the globe', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/einstein/');
  await expect(page.locator('[data-flat-map]')).toBeVisible();
  await expect(page.locator('svg .stop')).toHaveCount(MAPPED.length);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-globe-figure]')).toBeHidden();
  await expect(page.locator('[data-show-stop]').first()).toBeHidden();
  await page.getByRole('link', { name: 'Show the 3D globe' }).click();
  await ready(page);
  await expect(page.locator('[data-flat-map]')).toBeHidden();
  // Under reduced motion the arcs are drawn whole at once, with no settle.
  await page.goto('/einstein/?debug');
  await ready(page);
  const arcs = await page.evaluate(() => window.__voaGlobe.arcs());
  expect(arcs.progress).toBe(arcs.count);
  // The flat-map link switches back, and the choice sticks.
  await page.getByRole('link', { name: 'Flat map (no 3D)' }).click();
  await expect(page.locator('[data-flat-map]')).toBeVisible();
  await page.goto('/einstein/');
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('without WebGL2 the flat map stays and no globe link is offered', async ({ page }) => {
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await page.goto('/einstein/');
  await expect(page.locator('[data-flat-map]')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Show the 3D globe' })).toBeHidden();
});

test('a lost WebGL context falls back to the flat map and comes back when restored', async ({ page }) => {
  await page.goto('/einstein/?debug');
  await ready(page);
  await page.evaluate(() => { window.__lose = window.__voaGlobe.loseContext(); window.__lose.loseContext(); });
  await expect(page.locator('#globe')).toHaveAttribute('data-ready', 'lost');
  await expect(page.locator('[data-flat-map]')).toBeVisible();
  await page.evaluate(() => window.__lose.restoreContext());
  await ready(page);
  await expect(page.locator('[data-flat-map]')).toBeHidden();
});

// Rule: a stop's whole title (number + place name) is ONE control with the title as its name.
test('clicking the title text of a stop (not the number) turns the globe and opens its card', async ({ page }) => {
  await page.goto('/einstein/?debug');
  await ready(page);
  const title = page.getByRole('button', { name: titleName('mercer-street'), exact: true });
  const word = stopOf('mercer-street').label.split(/[ ,]/)[0];
  await expect(title).toBeVisible();
  await title.scrollIntoViewIfNeeded();
  const box = await title.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(24);
  // The hit area is the title text: it holds the heading text node's own rectangle.
  const text = await title.evaluate((el, w) => {
    const t = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.includes(w));
    const r = document.createRange(); r.selectNodeContents(t);
    const b = r.getBoundingClientRect();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  }, word);
  const where = await title.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  expect(where.w).toBeGreaterThanOrEqual(text.w);
  // Real pointer click on the name text, well clear of the number badge.
  await page.mouse.click(text.x + text.w / 2, text.y + text.h / 2);
  // Journey flow spec (2026-10-10): a stop with a room zooms down to it and offers the room.
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-aerial', /loading|zooming|arrived/);
  expect(await page.evaluate(() => window.__voaGlobe.active())).toBe('mercer-street');
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-aerial', 'arrived', { timeout: 20000 });
  await expect(page.locator('[data-aerial-enter]')).toHaveAttribute('href', `/einstein/${stopOf('mercer-street').chapter}/`);
  // The card's own heading is not a second list control.
  await expect(page.locator('#panel [data-show-stop]')).toHaveCount(0);
});

test('the stop title control shows a visible focus ring', async ({ page }) => {
  await page.goto('/einstein/');
  await ready(page);
  const title = page.getByRole('button', { name: titleName(PLAIN), exact: true });
  await title.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(title).toBeFocused();
  expect(await title.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
});

// Overlays (pins, caption, card) are placed over the canvas in the stage's own coordinates, so the
// stage must never scroll internally: focusing or scrolling to a pin at its edge would otherwise
// shift the canvas under them (seen as a 17 px offset of the aerial end view on a phone).
test('the stage cannot be scrolled from inside, so the canvas stays under its overlays', async ({ page }) => {
  await page.goto('/einstein/');
  await ready(page);
  const r = await page.locator('[data-stage]').evaluate(el => {
    const tall = document.createElement('div');
    tall.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:5000px';
    el.append(tall);
    el.scrollTop = 40; tall.scrollIntoView({ block: "end" });
    const out = { scrollTop: el.scrollTop, canvas: el.querySelector('#globe').getBoundingClientRect().top - el.getBoundingClientRect().top };
    tall.remove();
    return out;
  });
  expect(r).toEqual({ scrollTop: 0, canvas: 0 });
});
