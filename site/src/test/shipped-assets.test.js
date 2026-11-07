// Codex gate round 2. Rule: the production output carries only what production pages use: the scans
// of the hallway and the chapter rooms and the recreated corners, each file matching its record's
// sha256; an unused scan (the Dining Room) and the procedural rooms' textures (/tex/) stay out, except in
// a dev-pages build, whose dev pages use them.
import { it, expect, describe } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pruneAndVerify } from '../../scripts/shipped-assets.mjs';
import { usedScanIds } from '../content/load.js';

const sha = b => createHash('sha256').update(b).digest('hex');
function world() {
  const root = mkdtempSync(join(tmpdir(), 'voa-assets-')), out = join(root, 'dist');
  const put = (rel, data) => { mkdirSync(join(out, rel, '..'), { recursive: true }); writeFileSync(join(out, rel), data); return { file: rel, sha256: sha(data), bytes: data.length }; };
  const room = (id) => {
    const parts = { phone: put(`scans/${id}/phone/room.${sha(id + 'p').slice(0, 8)}.glb`, id + 'p'), desktop: put(`scans/${id}/desktop/room.${sha(id + 'd').slice(0, 8)}.glb`, id + 'd') };
    return { id, bundles: parts, preview: put(`scans/${id}/preview/room.${sha(id + 'v').slice(0, 8)}.glb`, id + 'v'), occluder: put(`scans/${id}/occluder.${sha(id + 'o').slice(0, 8)}.glb`, id + 'o') };
  };
  mkdirSync(join(root, 'content', 'scans'), { recursive: true });
  mkdirSync(join(root, 'content', 'abc', 'chapters'), { recursive: true });
  for (const id of ['hall-room', 'chapter-room', 'unused-room']) writeFileSync(join(root, 'content', 'scans', `${id}.json`), JSON.stringify(room(id)));
  writeFileSync(join(root, 'content', 'hall.json'), JSON.stringify({ scan: 'hall-room', easels: [] }));
  writeFileSync(join(root, 'content', 'abc', 'chapters', '1.json'), JSON.stringify({ room: { scan: 'chapter-room' } }));
  const corner = put(`study/abc/phone/corner.${sha('c').slice(0, 8)}.glb`, 'c');
  writeFileSync(join(root, 'content', 'abc', 'study-corner.json'), JSON.stringify({ bundles: { phone: corner } }));
  put('tex/walnut/color-512.webp', 'w');
  return { root, out };
}

describe('production assets', () => {
  it('the used scans are the hallway and the chapter rooms', () => {
    const { root } = world();
    expect(usedScanIds(root)).toEqual(['chapter-room', 'hall-room']);
  });
  it('a production build drops the unused scan and /tex/, and keeps every used, recorded file', () => {
    const { root, out } = world();
    const r = pruneAndVerify(out, { root, dev: false });
    expect(r.removed.sort()).toEqual(['scans/unused-room', 'tex']);
    expect(existsSync(join(out, 'scans', 'unused-room'))).toBe(false);
    expect(existsSync(join(out, 'tex'))).toBe(false);
    expect(existsSync(join(out, 'scans', 'hall-room'))).toBe(true);
    expect(existsSync(join(out, 'study', 'abc'))).toBe(true);
  });
  it('a dev-pages build keeps them (its dev pages use them)', () => {
    const { root, out } = world();
    expect(pruneAndVerify(out, { root, dev: true }).removed).toEqual([]);
    expect(existsSync(join(out, 'tex'))).toBe(true);
  });
  it('fails on a stray file, a changed file or a missing file under /scans/ or /study/', () => {
    let w = world();
    writeFileSync(join(w.out, 'scans', 'hall-room', 'notes.txt'), 'x');
    expect(() => pruneAndVerify(w.out, { root: w.root, dev: false })).toThrow(/scans\/hall-room\/notes.txt/);
    w = world();
    const m = JSON.parse(readFileSync(join(w.root, 'content', 'scans', 'chapter-room.json'), 'utf8'));
    writeFileSync(join(w.out, m.occluder.file), 'changed');
    expect(() => pruneAndVerify(w.out, { root: w.root, dev: false })).toThrow(/sha256/);
    w = world();
    rmSync(join(w.out, 'study'), { recursive: true });
    expect(() => pruneAndVerify(w.out, { root: w.root, dev: false })).toThrow(/missing/);
  });
});
