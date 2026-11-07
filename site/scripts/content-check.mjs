// Build gate (npm prebuild): runs tools/content_check.py for every content/<slug>/ that has an
// inductee.json, then `content_check.py --home` for content/home.json (the home page's verbatim fact
// lines), then `content_check.py --scans` for content/scans/ (the complete room validator of
// tools/build_scans.py, the reviewed artwork inventory, artwork clearance, and every file under
// site/public/scans and site/public/study against its reviewed record and actual hash), then `content_check.py --hall` for content/hall.json (the hallway's easels),
// then scripts/contrast-check.mjs (text on glass at 4.5:1); exits non-zero if any
// fails, so `npm run build` never ships ungrounded text, an uncleared artwork or illegible glass.
// VOA_ROOT overrides the repo root and VOA_TOKENS the tokens file (tests).
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.VOA_ROOT || resolve(process.cwd(), '..');
const content = join(root, 'content');
const slugs = existsSync(content) ? readdirSync(content).filter(s => existsSync(join(content, s, 'inductee.json'))).sort() : [];
if (!slugs.length) { console.error(`content-check: no inductees under ${content}`); process.exit(1); }
let failed = 0;
for (const slug of slugs) {
  const r = spawnSync('python3', ['tools/content_check.py', slug], { cwd: root, encoding: 'utf8' });
  process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
  if (r.status !== 0) { failed++; console.error(`content-check: ${slug}: FAILED (exit ${r.status})`); }
  else console.log(`content-check: ${slug}: OK`);
}
const step = (name, cmd, args, opts) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
  if (r.status !== 0) { failed++; console.error(`content-check: ${name}: FAILED (exit ${r.status})`); }
  else console.log(`content-check: ${name}: OK`);
};
if (existsSync(join(content, 'home.json'))) step('home', 'python3', ['tools/content_check.py', '--home'], { cwd: root });
if (existsSync(join(content, 'scans'))) step('scans', 'python3', ['tools/content_check.py', '--scans'], { cwd: root });
if (existsSync(join(content, 'hall.json'))) step('hall', 'python3', ['tools/content_check.py', '--hall'], { cwd: root });
step('contrast', process.execPath, [fileURLToPath(new URL('./contrast-check.mjs', import.meta.url))], { env: process.env });
process.exit(failed ? 1 : 0);
