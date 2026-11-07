import { test, expect } from '@playwright/test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// The build under test: playwright.config.mjs builds with the e2e test hooks into dist-e2e/ (the same
// production configuration otherwise; scripts/check-test-hooks.mjs keeps dist/ free of the hooks).
const OUT = 'dist-e2e';
const walk = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

test('production build has no dev pages and no placeholder text', async ({ request }) => {
  expect(existsSync(`${OUT}/index.html`)).toBe(true);
  expect(existsSync(`${OUT}/dev`)).toBe(false);
  const leaked = walk(OUT).filter(p => /\.(html|js|vtt)$/.test(p) && readFileSync(p, 'utf8').includes('PLACEHOLDER'));
  expect(leaked).toEqual([]);
  expect((await request.get('/dev/portrait/')).status()).toBe(404);
  expect((await request.get('/dev/reconstruction/')).status()).toBe(404);
  expect((await request.get('/dev/scan/kings-hall/')).status()).toBe(404);
});

const USABLE = new Set(['public-domain', 'cc0', 'cc-by', 'cc-by-sa']);
const media = slug => {
  const p = join('..', 'data', 'inductees', slug, 'media.jsonl');
  return existsSync(p) ? new Map(readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).map(m => [m.id, m])) : new Map();
};

test('production build emits no portrait whose photo record is not usable', () => {
  // Every inductee with a portrait record: its files may ship only if the photo is verified and usable.
  const files = existsSync(`${OUT}/portraits`) ? readdirSync(`${OUT}/portraits`) : [];
  for (const slug of readdirSync(join('..', 'content'))) {
    const ind = join('..', 'content', slug, 'inductee.json');
    const p = existsSync(ind) ? JSON.parse(readFileSync(ind, 'utf8')).portrait : null;
    const m = p ? media(slug).get(p.media_id) : null;
    const usable = Boolean(m && m.status === 'verified' && USABLE.has(m.license_class));
    if (!usable) expect(files.filter(f => f.startsWith(`${slug}.`) || f.startsWith(`${slug}-`))).toEqual([]);
  }
  // Every shipped portrait file belongs to an inductee whose portrait passed the gate.
  for (const f of files) {
    const slug = f.replace(/(-depth)?\.(webp|png)$/, '');
    const p = JSON.parse(readFileSync(join('..', 'content', slug, 'inductee.json'), 'utf8')).portrait;
    const m = media(slug).get(p.media_id);
    expect(m && m.status === 'verified' && USABLE.has(m.license_class)).toBe(true);
  }
  // EIN-M-0006 is public-domain under the approved LoC rule: the Einstein portrait ships, only
  // through the gated route (never from public/ or anywhere else in dist).
  expect(files.sort()).toEqual(expect.arrayContaining(['einstein-depth.png', 'einstein.webp']));
  expect(walk(OUT).filter(p => /(portrait|depth)\.(webp|png)$/.test(p) || /einstein(-depth)?\.(webp|png)$/.test(p)).sort())
    .toEqual([`${OUT}/portraits/einstein-depth.png`, `${OUT}/portraits/einstein.webp`]);
});
