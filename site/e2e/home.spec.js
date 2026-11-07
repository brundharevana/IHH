// Home page and timeline in the dark glass design system (real-scan museum Task 7), desktop and
// phone: one section per inductee with Explore (journey map) and Info (timeline) where the journey
// exists and "Coming soon" otherwise; axe-clean; solid panels under prefers-reduced-transparency;
// Poppins served from this site only; the timeline lists the dated stops with their sources.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { JOURNEY } from './journey-content.js';

const ROOT = new URL('../../', import.meta.url);
const SLUGS = readdirSync(new URL('data/inductees/', ROOT)).filter(s => existsSync(new URL(`data/inductees/${s}/inductee.json`, ROOT)));
const BUILT = SLUGS.filter(s => existsSync(new URL(`content/${s}/journey.json`, ROOT)));
const nameOf = s => JSON.parse(readFileSync(new URL(`data/inductees/${s}/inductee.json`, ROOT), 'utf8')).name;
const HALL = existsSync(new URL('content/hall.json', ROOT));
const DATED = JOURNEY.stops.filter(s => s.date);

const axe = async page => {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  return r.violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target.join(' ')) }));
};
// Chromium's own media feature (Playwright has no option for it): emulate it through CDP.
const reduceTransparency = async page => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
};

test('five inductee sections: built ones as full cards with Explore and Info, the rest in a compact roster', async ({ page }) => {
  await page.goto('/');
  const sections = page.locator('[data-inductee]');
  await expect(sections).toHaveCount(SLUGS.length);
  expect(SLUGS).toHaveLength(5);
  const roster = page.locator('[data-roster]');
  // Fix round 1 (M3): inductees without a journey sit in one compact roster labelled
  // "Journey in preparation" (it replaces the per-card "Coming soon" pill).
  await expect(roster.locator('[data-roster-label]')).toHaveText('Journey in preparation');
  for (const slug of SLUGS) {
    const sec = page.locator(`[data-inductee="${slug}"]`);
    await expect(sec.getByRole('heading', { name: nameOf(slug) })).toBeVisible();
    await expect(sec.locator('[data-fact-line]')).toBeVisible();
    await expect(sec.locator('[data-fact-line] .chip-btn')).toHaveCount(1);
    const explore = sec.getByRole('link', { name: /^Explore/ }), info = sec.getByRole('link', { name: /^Info/ });
    if (BUILT.includes(slug)) {
      await expect(sec).toHaveClass(/\bcard\b/);
      await expect(roster.locator(`[data-inductee="${slug}"]`)).toHaveCount(0);
      await expect(explore).toHaveAttribute('href', `/${slug}/`);
      await expect(info).toHaveAttribute('href', `/${slug}/timeline/`);
      expect((await page.request.get(`/${slug}/timeline/`)).status()).toBe(200);
    } else {
      await expect(roster.locator(`[data-inductee="${slug}"]`)).toHaveCount(1);
      await expect(explore).toHaveCount(0);
      await expect(info).toHaveCount(0);
    }
  }
  // Built inductees come first.
  const order = await sections.evaluateAll(els => els.map(e => e.dataset.inductee));
  expect(order.slice(0, BUILT.length).sort()).toEqual([...BUILT].sort());
});

test('the hallway is linked only once it exists', async ({ page }) => {
  await page.goto('/');
  const hall = page.getByRole('link', { name: 'Enter the hallway' });
  if (HALL) await expect(hall).toHaveAttribute('href', '/hall/');
  else await expect(hall).toHaveCount(0);
});

test('a painted portrait only where the licence gate passes; a name card otherwise', async ({ page }) => {
  await page.goto('/');
  // Einstein's portrait record is public domain (LoC), so its painted portrait shows, with its label.
  const img = page.locator('[data-inductee="einstein"] img');
  await expect(img).toHaveAttribute('src', '/portraits/einstein.webp');
  await expect(img).toHaveAttribute('alt', /^Painted portrait of Albert Einstein/);
  await expect(page.locator('[data-inductee="einstein"]').getByText('About this portrait')).toBeVisible();
  for (const slug of SLUGS.filter(s => s !== 'einstein')) {
    await expect(page.locator(`[data-inductee="${slug}"] img`)).toHaveCount(0);
    await expect(page.locator(`[data-inductee="${slug}"] [data-name-card]`)).toBeVisible();
  }
});

test('home and timeline have no serious axe violations', async ({ page }) => {
  for (const url of ['/', '/einstein/timeline/']) {
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    expect(await axe(page), url).toEqual([]);
  }
});

test('Explore and Info: the visible label starts the accessible name (label in name); both are 44 px targets', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Explore', 'Info']) {
    const a = page.locator('[data-inductee="einstein"]').getByRole('link', { name: new RegExp(`^${name}\\b`) });
    await expect(a.locator('[data-label]')).toHaveText(name); // the words on the button
    const b = await a.boundingBox();
    expect(b.height).toBeGreaterThanOrEqual(44);
  }
});

test('glass panels blur the backdrop; with reduced transparency they are solid, without blur', async ({ page }) => {
  const read = () => page.locator('[data-glass]').evaluateAll(els => els.map(e => {
    const cs = getComputedStyle(e);
    const a = /rgba?\(([^)]+)\)/.exec(cs.backgroundColor)[1].split(/[\s,/]+/).filter(Boolean);
    return { bf: cs.backdropFilter, alpha: a.length > 3 ? Number(a[3]) : 1 };
  }));
  await page.goto('/');
  const glass = await read();
  expect(glass.length).toBeGreaterThanOrEqual(5);
  expect(glass.every(g => g.bf.includes('blur') && g.alpha < 1)).toBe(true);
  await reduceTransparency(page);
  await page.reload();
  const solid = await read();
  expect(solid.every(g => g.bf === 'none' && g.alpha === 1)).toBe(true);
  expect(await axe(page)).toEqual([]);
});

test('fonts come from this site only: Poppins from /fonts/poppins/, nothing from another host', async ({ page, baseURL }) => {
  const requests = [];
  page.on('request', r => requests.push(r.url()));
  for (const url of ['/', '/einstein/timeline/']) {
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('600 20px Poppins'))).toBe(true);
  }
  const origin = new URL(baseURL).origin;
  expect(requests.filter(u => !u.startsWith(origin) && !u.startsWith('data:'))).toEqual([]);
  const fonts = requests.filter(u => /\.(woff2?|ttf|otf)(\?|$)/.test(u));
  expect(fonts.length).toBeGreaterThan(0);
  for (const u of fonts) expect(new URL(u).pathname.startsWith('/fonts/poppins/'), u).toBe(true);
  expect((await page.request.get('/fonts/poppins/OFL.txt')).status()).toBe(200);
});

test('the timeline lists every dated stop in order, with its date, sources and room link', async ({ page }) => {
  await page.goto('/einstein/timeline/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Albert Einstein');
  const items = page.locator('ol[data-timeline] > li');
  await expect(items).toHaveCount(DATED.length);
  for (const [i, s] of DATED.entries()) {
    const li = items.nth(i);
    await expect(li.locator('time')).toHaveText(s.date);
    await expect(li.getByRole('heading', { level: 2 })).toContainText(s.label);
    expect(await li.locator('h2 .chip-btn').count()).toBeGreaterThan(0);
    if (s.chapter !== undefined) await expect(li.getByRole('link', { name: /^Enter the room: / })).toHaveAttribute('href', `/einstein/${s.chapter}/`);
  }
  await expect(page.getByRole('link', { name: /journey map/i }).first()).toHaveAttribute('href', '/einstein/');
});

test('home and timeline fit the window: no sideways scroll', async ({ page }) => {
  for (const url of ['/', '/einstein/timeline/']) {
    await page.goto(url);
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw, url).toBeLessThanOrEqual(cw);
  }
});
