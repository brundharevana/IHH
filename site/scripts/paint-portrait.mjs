// Paints an inductee's portrait with the S5 filter (spikes/s5-painterly: painterly.js, mask.js and
// every number in painterly-tokens.json) in headless Chromium (WebGL2 via SwiftShader) and writes
// content/<slug>/portrait/portrait.webp (648 x 800, WebP q 0.85). The photo must be the holder's
// file of the inductee's portrait record (inductee.json portrait.media_id), which must be verified
// with a usable licence. Then run tools/build_depth.py <slug> for the depth map.
// Usage (from site/): node scripts/paint-portrait.mjs <slug> <photo.jpg> [--source <tokens source id>] [--preset medium]
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { loadInductee, mediaIndex, ROOT } from '../src/content/load.js';

const [slug, photo, ...rest] = process.argv.slice(2);
const opt = (k, d) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : d; };
const sourceId = opt('--source', slug), preset = opt('--preset', 'medium');
if (!slug || !photo || !existsSync(photo)) { console.error('usage: node scripts/paint-portrait.mjs <slug> <photo.jpg> [--source id] [--preset medium]'); process.exit(2); }
const USABLE = new Set(['public-domain', 'cc0', 'cc-by', 'cc-by-sa']);
const ind = loadInductee(slug);
const rec = ind.portrait && mediaIndex(slug).get(ind.portrait.media_id);
if (!rec || rec.status !== 'verified' || !USABLE.has(rec.license_class)) {
  console.error(`${slug}: portrait record ${ind.portrait && ind.portrait.media_id} is not verified with a usable licence; nothing painted`);
  process.exit(1);
}
const SPIKE = join(ROOT, 'spikes', 's5-painterly');
const tokens = JSON.parse(readFileSync(join(SPIKE, 'painterly-tokens.json'), 'utf8'));
if (!tokens.sources[sourceId] || !tokens.presets[preset]) { console.error(`unknown tokens source ${sourceId} or preset ${preset}`); process.exit(2); }
const photoBytes = readFileSync(photo);
const TYPES = { '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html', '.jpg': 'image/jpeg' };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage();
  // The spike page fetches its source photo from its localhost helper (recv.py); serve the given file instead.
  await page.route('http://127.0.0.1:8796/**', route => route.fulfill({ contentType: 'image/jpeg', body: photoBytes, headers: { 'Access-Control-Allow-Origin': '*' } }));
  await page.route('http://voa.local/**', route => {
    const file = join(SPIKE, decodeURIComponent(new URL(route.request().url()).pathname));
    if (!file.startsWith(SPIKE) || !existsSync(file)) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ contentType: TYPES[extname(file)] || 'application/octet-stream', body: readFileSync(file) });
  });
  page.on('pageerror', e => console.error('page error', e));
  await page.goto('http://voa.local/index.html?v=1');
  await page.waitForFunction(() => window.__s5 && (window.__s5.ready || window.__s5.err), null, { timeout: 120000 });
  const out = await page.evaluate(async ({ sourceId, preset }) => {
    const S = window.__s5;
    if (S.err) throw new Error(S.err);
    const r = await S.paintSource(sourceId, preset);
    const full = S.rgbaCanvas(r.rgba, r.w, r.h);
    const H = 800, W = Math.round(r.w * H / r.h);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(full, 0, 0, W, H);
    const blob = await new Promise(res => c.toBlob(res, 'image/webp', 0.85));
    const u = new Uint8Array(await blob.arrayBuffer()); let s = '';
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
    return { b64: btoa(s), w: W, h: H, gpu: S.gpu, timings: r.timings };
  }, { sourceId, preset });
  const dir = join(ROOT, 'content', slug, 'portrait');
  mkdirSync(dir, { recursive: true });
  const buf = Buffer.from(out.b64, 'base64');
  writeFileSync(join(dir, 'portrait.webp'), buf);
  const sha = b => createHash('sha256').update(b).digest('hex');
  console.log(JSON.stringify({ slug, media_id: rec.id, photo_sha256: sha(photoBytes), preset, tokens_version: tokens.version,
    out: `content/${slug}/portrait/portrait.webp`, w: out.w, h: out.h, bytes: buf.length, sha256: sha(buf), gpu: out.gpu }));
} finally {
  await browser.close();
}
