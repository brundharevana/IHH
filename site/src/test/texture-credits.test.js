// Every room texture set a room loads is credited, on the page and in site/public/tex/CREDITS.md,
// as a CC0 Poly Haven asset.
import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOM_TEXTURES } from '../museum/materials.js';
import { TEXTURE_CREDITS } from '../museum/texture-credits.js';
import { ROOT } from '../content/load.js';

const credits = readFileSync(join(ROOT, 'site', 'public', 'tex', 'CREDITS.md'), 'utf8');
it('credits every texture set a room loads, with the same asset URL as CREDITS.md, all CC0', () => {
  const used = new Set(Object.values(ROOM_TEXTURES).flatMap(r => Object.keys(r.sets)));
  expect(new Set(TEXTURE_CREDITS.map(c => c.set))).toEqual(used);
  for (const c of TEXTURE_CREDITS) {
    const row = credits.split('\n').find(l => l.startsWith(`| ${c.set}/ |`));
    expect(row, c.set).toBeDefined();
    expect(row).toContain(c.url);
    expect(row).toContain('CC0');
    expect(c.url).toMatch(/^https:\/\/polyhaven\.com\/a\//);
  }
});
