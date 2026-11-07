import { createHash } from 'node:crypto';
// The build gate: `npm run build` runs scripts/content-check.mjs first (npm prebuild), which runs
// tools/content_check.py for every content/<slug>/ and fails the build on any error.
import { it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const REPO = resolve(process.cwd(), '..');
const run = root => spawnSync(process.execPath, ['scripts/content-check.mjs'], { env: { ...process.env, VOA_ROOT: root }, encoding: 'utf8' });

function fixtureRoot(chapter, media = []) {
  const root = mkdtempSync(join(tmpdir(), 'voa-prebuild-'));
  cpSync(join(REPO, 'tools'), join(root, 'tools'), { recursive: true, filter: s => !s.includes('/models') && !s.includes('__pycache__') });
  const d = join(root, 'data', 'inductees', 'fx');
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'inductee.json'), JSON.stringify({ slug: 'fx', code: 'FX', name: 'Ada Example', aliases: [] }));
  writeFileSync(join(d, 'facts.jsonl'), JSON.stringify({ id: 'FX-F-0001', claim: 'Ada Example arrived in 1900.', status: 'verified', evidence: [] }) + '\n');
  writeFileSync(join(d, 'media.jsonl'), media.map(m => JSON.stringify(m) + '\n').join(''));
  mkdirSync(join(root, 'content', 'fx', 'chapters'), { recursive: true });
  writeFileSync(join(root, 'content', 'fx', 'inductee.json'), JSON.stringify({ slug: 'fx', name: 'Ada Example' }));
  writeFileSync(join(root, 'content', 'fx', 'chapters', '1.json'), JSON.stringify(chapter));
  return root;
}
const base = { id: 'fx-1', title: 'Ada Example arrived in 1900.', title_fact_ids: ['FX-F-0001'], room: 'chapter-gallery',
  narration: [{ cue: 'c1', text: 'Ada Example arrived in 1900.', fact_ids: ['FX-F-0001'], reveals: [] }], exhibits: [], quotes: [] };

it('passes grounded content', () => {
  const r = run(fixtureRoot(base));
  expect(r.stdout + r.stderr).toMatch(/fx: OK/);
  expect(r.status).toBe(0);
});

it('fails the build on an ungrounded sentence and names the slug and the word', () => {
  const r = run(fixtureRoot({ ...base, narration: [{ cue: 'c1', text: 'Ada Example happily arrived in 1900.', fact_ids: ['FX-F-0001'], reveals: [] }] }));
  expect(r.status).not.toBe(0);
  expect(r.stdout + r.stderr).toMatch(/happily/);
  expect(r.stdout + r.stderr).toMatch(/fx/);
});

// Status and licence class alone are not enough: the media must pass the same rights/media checks as
// tools/validate.py (a public-domain item with no holder wording on file fails them).
it('fails the build on an exhibit whose media passes status and licence but fails the rights checks', () => {
  const media = { id: 'FX-M-0001', title: 'Letter', status: 'verified', license_class: 'public-domain', url: 'https://example.org/a.jpg' };
  const exhibit = { id: 'ex1', number: 1, type: 'framed-document', wall: 'north', slot: 1, media_id: 'FX-M-0001',
    original_media_id: 'FX-M-0001', title: 'Ada Example arrived in 1900.', title_fact_ids: ['FX-F-0001'], notes: [], evidence: 'record' };
  const r = run(fixtureRoot({ ...base, exhibits: [exhibit] }, [media]));
  expect(r.status).not.toBe(0);
  expect(r.stdout + r.stderr).toMatch(/media FX-M-0001 fails the media checks/);
});

it('npm build runs the content check first', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(pkg.scripts.prebuild).toBe('node scripts/content-check.mjs');
});

// Task 7 fix round 1: the prebuild also checks content/home.json (content_check.py --home: each line
// a verified fact of its own inductee, shown verbatim) and the glass contrast (scripts/contrast-check.mjs).
it('fails the build on a home line that is not its fact\'s claim verbatim', () => {
  const root = fixtureRoot(base);
  writeFileSync(join(root, 'content', 'home.json'), JSON.stringify({ lines: [{ slug: 'fx', fact_id: 'FX-F-0001', text: 'Ada Example happily arrived in 1900.' }] }));
  const r = run(root);
  expect(r.status).not.toBe(0);
  expect(r.stdout + r.stderr).toMatch(/home: FAILED/);
  expect(r.stdout + r.stderr).toMatch(/verbatim/);
});

it('passes a verbatim home line and reports the home and contrast checks', () => {
  const root = fixtureRoot(base);
  writeFileSync(join(root, 'content', 'home.json'), JSON.stringify({ lines: [{ slug: 'fx', fact_id: 'FX-F-0001', text: 'Ada Example arrived in 1900.' }] }));
  const r = run(root);
  expect(r.stdout + r.stderr).toMatch(/home: OK/);
  expect(r.stdout + r.stderr).toMatch(/contrast: OK/);
  expect(r.status).toBe(0);
});

it('fails the build when the glass contrast check fails', () => {
  const r = spawnSync(process.execPath, ['scripts/content-check.mjs'], { env: { ...process.env, VOA_ROOT: fixtureRoot(base), VOA_TOKENS: join(mkdtempSync(join(tmpdir(), 'voa-tok-')), 'none.css') }, encoding: 'utf8' });
  expect(r.status).not.toBe(0);
  expect(r.stdout + r.stderr).toMatch(/contrast: FAILED/);
});

// Task 2: the prebuild also runs the scanned rooms' artwork clearance (content_check.py --scans): a room
// with a blocked artwork fails the build; an unusable room that ships nothing passes.
it('fails the build on a scanned room with a blocked artwork', () => {
  const root = fixtureRoot(base);
  mkdirSync(join(root, 'content', 'scans'), { recursive: true });
  writeFileSync(join(root, 'content', 'scans', 'room.json'), JSON.stringify({ id: 'room', crops: [],
    artworks: [{ label: 'Unidentified portrait', artist: null, died: null, dated: null, status: 'blocked', evidence_url: null }] }));
  const r = run(root);
  expect(r.status).not.toBe(0);
  expect(r.stdout + r.stderr).toMatch(/scans: FAILED/);
  expect(r.stdout + r.stderr).toMatch(/Unidentified portrait/);
});

it('passes an unusable scanned room that ships nothing', () => {
  const root = fixtureRoot(base);
  mkdirSync(join(root, 'content', 'scans'), { recursive: true });
  // A complete manifest (the gate runs the full room validator: provenance, licence, reviewed inventory).
  const src = 'ab'.repeat(32);
  // tools/build_scans.py inventory_sha256: each entry as sorted-key compact JSON (keys already sorted here).
  const ceiling = { artist: null, died: null, evidence_url: null, label: 'Ceiling', status: 'blocked' };
  const digest = createHash('sha256').update(JSON.stringify(ceiling)).digest('hex');
  writeFileSync(join(root, 'content', 'scans', 'room.json'), JSON.stringify({ id: 'room', usable: false,
    unusable_reason: 'ceiling in copyright', title: 'A Room', place: 'A Room, A Museum', publisher: 'A Museum',
    sketchfab_url: 'https://sketchfab.com/3d-models/a-room-0123', licence: 'CC BY 4.0',
    licence_url: 'https://creativecommons.org/licenses/by/4.0/', credit: 'A Room by A Museum, CC BY 4.0.',
    credit_source: 'the model page', changes: 'Changes: none shipped.', source_sha256: src, stations: [], crops: [],
    inventory_reviewed: { source_sha256: src, date: '2026-10-13', count: 1, artworks_sha256: digest, evidence: 'a review' },
    artworks: [ceiling] }));
  const r = run(root);
  expect(r.stdout + r.stderr).toMatch(/scans: OK/);
  expect(r.status).toBe(0);
});

// Task 5: the prebuild also checks the hallway (content_check.py --hall) when content/hall.json exists.
it('fails the build on a hallway whose scan is not a usable room', () => {
  const root = fixtureRoot(base);
  writeFileSync(join(root, 'content', 'hall.json'), JSON.stringify({ scan: 'nowhere', easels: [{ slug: 'fx', x: 0, z: 0, rotY: 0 }] }));
  const r = run(root);
  expect(r.status).not.toBe(0);
  expect(r.stdout + r.stderr).toMatch(/hall: FAILED/);
  expect(r.stdout + r.stderr).toMatch(/scan nowhere/);
});
