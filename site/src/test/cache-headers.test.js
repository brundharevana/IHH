// Owner-approved 2026-10-13 (scans) and 2026-10-14 (study): these files are
// cached for a year as immutable. That is only safe while every file under
// those folders carries a content hash in its name, so a rebuild always gets
// a new URL, and while the hash in the name IS the file's hash (Codex gate
// 2026-10-14: the name shape alone proves nothing) and a reviewed record
// (content/scans/<id>.json, content/<slug>/study-corner.json) ships it.
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = fileURLToPath(new URL('../../', import.meta.url));
const content = join(site, '..', 'content');
const config = JSON.parse(readFileSync(join(site, 'vercel.json'), 'utf8'));
const IMMUTABLE = 'public, max-age=31536000, immutable';
const LONG_CACHED = ['scans', 'study'];

// {published path: sha256} for every file a reviewed record ships under scans/ and study/.
function recorded() {
  const out = {};
  const add = (b) => { if (b && b.file) out[b.file] = b.sha256; };
  for (const f of readdirSync(join(content, 'scans')).filter((n) => n.endsWith('.json'))) {
    const m = JSON.parse(readFileSync(join(content, 'scans', f), 'utf8'));
    if (m.usable === false) continue;
    for (const b of [m.bundles?.phone, m.bundles?.desktop, m.preview, m.occluder]) add(b);
  }
  for (const slug of readdirSync(content)) {
    const p = join(content, slug, 'study-corner.json');
    if (existsSync(p)) for (const b of Object.values(JSON.parse(readFileSync(p, 'utf8')).bundles || {})) add(b);
  }
  return out;
}

const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe('cache headers', () => {
  const rule = (src) => config.headers.find((h) => h.source === src)?.headers.find((x) => x.key === 'Cache-Control')?.value;

  it('marks the hashed folders immutable for a year and keeps /basis/ short', () => {
    for (const dir of LONG_CACHED) expect(rule(`/${dir}/(.*)`)).toBe(IMMUTABLE);
    expect(rule('/basis/(.*)')).toBe('public, max-age=86400');
    expect(config.headers).toHaveLength(LONG_CACHED.length + 1);
  });

  for (const dir of LONG_CACHED) {
    it(`every file under public/${dir} has a content hash in its name`, () => {
      const files = walk(join(site, 'public', dir));
      expect(files.length).toBeGreaterThan(0);
      for (const f of files) expect(f, f).toMatch(/\.[0-9a-f]{8}\.[a-z0-9]+$/);
    });

    it(`every file under public/${dir} is named by its actual hash and by a reviewed record`, () => {
      const records = recorded();
      const files = walk(join(site, 'public', dir));
      for (const f of files) {
        const rel = relative(join(site, 'public'), f).split(sep).join('/');
        const actual = sha256(f);
        expect(f.match(/\.([0-9a-f]{8})\.[a-z0-9]+$/)?.[1], `${rel}: name vs actual sha256 ${actual}`).toBe(actual.slice(0, 8));
        expect(records[rel], `${rel}: recorded sha256`).toBe(actual);
      }
      const shipped = new Set(files.map((f) => relative(join(site, 'public'), f).split(sep).join('/')));
      for (const rel of Object.keys(records).filter((r) => r.startsWith(`${dir}/`))) expect(shipped.has(rel), `${rel} recorded but not shipped`).toBe(true);
    });
  }
});
