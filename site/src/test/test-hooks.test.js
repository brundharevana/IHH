// The e2e test hooks (window.__voa with ?debug, including faceDoor; window.__voaGlobe / __voaAerial)
// ship only in builds made with PUBLIC_TEST_HOOKS=1, which the Playwright configs set and which go to
// their own output folder (dist-e2e/, or dist-dev/ for dev pages). `npm run build` runs
// scripts/check-test-hooks.mjs afterwards (npm postbuild): a production build that still carries a
// hook fails, and a test-hook build without its hooks fails too.
import { it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = (dir, hooks) => spawnSync(process.execPath, ['scripts/check-test-hooks.mjs'], {
  env: { ...process.env, VOA_OUT_DIR: dir, PUBLIC_TEST_HOOKS: hooks ? '1' : '' }, encoding: 'utf8',
});
const out = js => {
  const d = mkdtempSync(join(tmpdir(), 'voa-hooks-'));
  mkdirSync(join(d, '_astro'));
  writeFileSync(join(d, 'index.html'), '<!doctype html><p>home</p>');
  writeFileSync(join(d, '_astro', 'scene.js'), js);
  return d;
};

it('fails a production build whose output still carries a test hook', () => {
  const r = run(out('const a=1;window.__voa=room.debug;'), false);
  expect(r.status).toBe(1);
  expect(r.stderr).toMatch(/__voa/);
  expect(run(out('x={faceDoor:k=>k}'), false).status).toBe(1);
});

// Fix round 1 (M5): every emitted text file is scanned, not only scripts and pages.
it('finds a hook in any emitted text file: styles, source maps, data', () => {
  for (const [name, text] of [['a.css', '/* __voa */'], ['a.js.map', '{"sourcesContent":["faceDoor"]}'], ['a.json', '{"k":"__voa"}'], ['a.mjs', '__voa'], ['a.txt', 'faceDoor']]) {
    const d = out('const a=1;');
    writeFileSync(join(d, '_astro', name), text);
    expect(run(d, false).status, name).toBe(1);
  }
});

// Fix round 1 (M2): the check runs inside Astro's own build (an integration), so any production build
// path runs it (npm run build, npx astro build, a host's build command), not only the npm postbuild.
it('the Astro build itself runs the check (integration), whatever command starts it', async () => {
  const { default: cfg } = await import('../../astro.config.mjs');
  const gate = (cfg.integrations || []).find(i => i.name === 'voa-test-hooks-gate');
  expect(gate).toBeTruthy();
  const bad = out('window.__voa=1;');
  await expect(gate.hooks['astro:build:done']({ dir: new URL(`file://${bad}/`) })).rejects.toThrow(/__voa/);
  await expect(gate.hooks['astro:build:done']({ dir: new URL(`file://${out('const a=1;')}/`) })).resolves.toBeUndefined();
});

it('passes a production build without hooks', () => {
  expect(run(out('const a=1;'), false).status).toBe(0);
});

it('a test-hook build must carry its hooks (the flag reached the bundle)', () => {
  expect(run(out('const a=1;'), true).status).toBe(1);
  expect(run(out('window.__voa=d;'), true).status).toBe(0);
});

it('npm run build runs the check, and the Playwright builds set the flag and their own output folder', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(pkg.scripts.postbuild).toBe('node scripts/check-test-hooks.mjs');
  for (const f of ['playwright.config.mjs', 'playwright.dev.config.mjs']) expect(readFileSync(f, 'utf8')).toMatch(/PUBLIC_TEST_HOOKS: '1'/);
  const cfg = readFileSync('astro.config.mjs', 'utf8');
  expect(cfg).toMatch(/dist-e2e/);
});
