// Build gate (npm postbuild; the same check also runs inside every `astro build` through the
// integration in astro.config.mjs): see scripts/test-hooks-scan.mjs. The output folder follows
// astro.config.mjs; VOA_OUT_DIR overrides it (tests).
import { checkTestHooks } from './test-hooks-scan.mjs';

const hooks = process.env.PUBLIC_TEST_HOOKS === '1';
const out = process.env.VOA_OUT_DIR
  || (process.env.PUBLIC_DEV_PAGES === '1' ? 'dist-dev' : hooks ? 'dist-e2e' : 'dist');
const err = checkTestHooks(out, hooks);
if (err) { console.error(`check-test-hooks: ${err}`); process.exit(1); }
console.log(`check-test-hooks: ${out}: ${hooks ? 'test hooks present (test build)' : 'no test hooks'}`);
