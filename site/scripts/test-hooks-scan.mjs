// The e2e test hooks (window.__voa with ?debug, including faceDoor, and window.__voaGlobe /
// __voaAerial) belong only in builds made with PUBLIC_TEST_HOOKS=1. checkTestHooks(dir, hooks) scans
// every emitted text file of a build (scripts, pages, styles, source maps, data) and returns an error
// message, or null when the build is as it should be: a production build carries no hook; a
// test-hook build carries __voa (else the flag never reached the bundle and e2e would test nothing).
// Used by the Astro integration in astro.config.mjs (every `astro build`, whatever command starts
// it) and by scripts/check-test-hooks.mjs (npm postbuild, tests).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const MARKERS = ['__voa', 'faceDoor'];
export const TEXT_FILE = /\.(js|mjs|cjs|map|html|css|json|txt|xml|svg|webmanifest|vtt)$/i;

const walk = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

export function checkTestHooks(dir, hooks) {
  if (!existsSync(dir)) return `no build output at ${dir}`;
  const hits = walk(dir).filter(p => TEXT_FILE.test(p))
    .flatMap(p => { const t = readFileSync(p, 'utf8'); return MARKERS.filter(m => t.includes(m)).map(m => `${p}: ${m}`); });
  if (hooks && !hits.some(h => h.endsWith('__voa'))) return `PUBLIC_TEST_HOOKS=1 but ${dir} carries no __voa hook`;
  if (!hooks && hits.length) return `production build ${dir} carries test hooks:\n  ${hits.join('\n  ')}`;
  return null;
}
