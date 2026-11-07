// Production output assets (Codex gate round 2): run by the voa-shipped-assets integration in
// astro.config.mjs after every `astro build`. A production build carries only the scans its pages
// show (src/content/load.js usedScanIds: the hallway and the chapter rooms) and the recreated corners;
// an unused scan and the procedural rooms' textures (/tex/) are removed. A dev-pages build
// (PUBLIC_DEV_PAGES=1) keeps them for its dev pages. Then every file under scans/ and study/ must be a
// recorded file of a shipped room or corner with the record's sha256, and every recorded file must be
// there; anything else fails the build. (The source folder, site/public, is held to the same rule by
// tools/build_scans.py shipped_asset_errors.)
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { ROOT, usedScanIds } from '../src/content/load.js';

const readJson = p => JSON.parse(readFileSync(p, 'utf8'));
const walk = dir => readdirSync(dir).flatMap(n => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });

// {published path: sha256} of what a build ships under scans/ and study/.
export function expectedFiles({ root = ROOT, dev = false } = {}) {
  const content = join(root, 'content'), want = {};
  const scans = join(content, 'scans');
  const used = new Set(usedScanIds(root));
  if (existsSync(scans)) for (const f of readdirSync(scans).filter(n => n.endsWith('.json'))) {
    const m = readJson(join(scans, f));
    if (m.usable === false || !(dev || used.has(m.id))) continue;
    for (const b of [m.bundles && m.bundles.phone, m.bundles && m.bundles.desktop, m.preview, m.occluder]) if (b && b.file) want[b.file] = b.sha256;
  }
  if (existsSync(content)) for (const slug of readdirSync(content)) {
    const p = join(content, slug, 'study-corner.json');
    if (existsSync(p)) for (const b of Object.values(readJson(p).bundles || {})) if (b && b.file) want[b.file] = b.sha256;
  }
  return want;
}

export function pruneAndVerify(outDir, { root = ROOT, dev = false } = {}) {
  const removed = [];
  if (!dev) {
    const used = new Set(usedScanIds(root));
    const scans = join(outDir, 'scans');
    if (existsSync(scans)) for (const id of readdirSync(scans)) {
      if (!used.has(id)) { rmSync(join(scans, id), { recursive: true, force: true }); removed.push(`scans/${id}`); }
    }
    if (existsSync(join(outDir, 'tex'))) { rmSync(join(outDir, 'tex'), { recursive: true, force: true }); removed.push('tex'); }
  }
  const want = expectedFiles({ root, dev }), errors = [], seen = new Set();
  for (const top of ['scans', 'study']) {
    const dir = join(outDir, top);
    if (!existsSync(dir)) continue;
    for (const f of walk(dir)) {
      const rel = relative(outDir, f).split(sep).join('/');
      seen.add(rel);
      if (!(rel in want)) { errors.push(`${rel}: in the output but no shipped room or corner records it`); continue; }
      const sha = createHash('sha256').update(readFileSync(f)).digest('hex');
      if (sha !== want[rel]) errors.push(`${rel}: sha256 ${sha} differs from its record ${want[rel]}`);
    }
  }
  for (const rel of Object.keys(want)) if (!seen.has(rel)) errors.push(`${rel}: recorded but missing from the output`);
  if (errors.length) throw new Error(`shipped assets: ${errors.join('; ')}`);
  return { removed, files: seen.size };
}
