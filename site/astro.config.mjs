import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { checkTestHooks } from './scripts/test-hooks-scan.mjs';
import { copyBasisTranscoder } from './scripts/copy-basis.mjs';
import { pruneAndVerify } from './scripts/shipped-assets.mjs';
// Dev-page builds (PUBLIC_DEV_PAGES=1) go to dist-dev/ and e2e test-hook builds (PUBLIC_TEST_HOOKS=1,
// set by playwright.config.mjs) to dist-e2e/, so neither can be mistaken for, or overwrite, the
// production output in dist/.
//
// Production build: `npm run build` in site/ (prebuild content, home and contrast checks; then
// `astro build` into dist/). A static host (Vercel) should use that command with output folder
// site/dist. Whatever command a host runs, the integration below fails any `astro build` whose
// output carries a test hook without PUBLIC_TEST_HOOKS=1 (scripts/test-hooks-scan.mjs).
const dev = process.env.PUBLIC_DEV_PAGES === '1';
const hooks = process.env.PUBLIC_TEST_HOOKS === '1';
const testHooksGate = {
  name: 'voa-test-hooks-gate',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const err = checkTestHooks(fileURLToPath(dir), hooks);
      if (err) throw new Error(`test hooks gate: ${err}`);
    },
  },
};
// Scanned rooms load KTX2 textures through the Basis Universal transcoder, self-hosted under
// public/basis/ (gitignored): copied from the installed three at the start of every dev or build run
// (scripts/copy-basis.mjs), so it always matches three's KTX2Loader. Its size is held to
// TRANSCODER_BUDGET (src/museum/budget.js).
const basisTranscoder = {
  name: 'voa-basis-transcoder',
  hooks: { 'astro:config:setup': () => { copyBasisTranscoder(); } },
};
// The output carries only what its pages use: a production build drops the unused scans and the
// procedural rooms' textures, then checks every file under scans/ and study/ against its record
// (scripts/shipped-assets.mjs). A dev-pages build keeps them for the dev pages.
const shippedAssets = {
  name: 'voa-shipped-assets',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const r = pruneAndVerify(fileURLToPath(dir), { dev });
      logger.info(`shipped assets: ${r.files} scan/study files verified${r.removed.length ? `; removed ${r.removed.join(', ')}` : ''}`);
    },
  },
};
export default defineConfig({
  output: 'static', trailingSlash: 'always', build: { format: 'directory' },
  outDir: dev ? './dist-dev' : hooks ? './dist-e2e' : './dist',
  integrations: [basisTranscoder, testHooksGate, shippedAssets],
});
