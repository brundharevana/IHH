// The licence gate catches a bad change, not just today's output: the same fixture inductee emits
// its portrait files when the photo record is usable and nothing at all when the licence is bad.
import { it, expect, vi, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function fixture(media) {
  const root = mkdtempSync(join(tmpdir(), 'voa-gate-'));
  const d = join(root, 'data', 'inductees', 'fx');
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'media.jsonl'), JSON.stringify({ id: 'FX-M-0001', title: 'Portrait', source_ids: ['FX-S-0001'], rights_statement: 'Rights.', ...media }) + '\n');
  writeFileSync(join(d, 'sources.jsonl'), JSON.stringify({ id: 'FX-S-0001', title: 'Photo', institution: 'Archive', published: '1947', url: 'https://a.example/1' }) + '\n');
  writeFileSync(join(d, 'facts.jsonl'), '');
  const c = join(root, 'content', 'fx');
  mkdirSync(join(c, 'portrait'), { recursive: true });
  writeFileSync(join(c, 'inductee.json'), JSON.stringify({ slug: 'fx', name: 'Ada Example', portrait: { media_id: 'FX-M-0001' } }));
  writeFileSync(join(c, 'portrait', 'portrait.webp'), 'webp');
  writeFileSync(join(c, 'portrait', 'depth.png'), 'png');
  return root;
}
async function emitted(root) {
  vi.resetModules();
  process.env.VOA_ROOT = root;
  const route = await import('../pages/portraits/[file].js');
  return route.getStaticPaths().map(p => p.params.file).sort();
}
afterEach(() => { delete process.env.VOA_ROOT; vi.resetModules(); });

it('emits the portrait and depth map for a verified, usable photo record', async () => {
  expect(await emitted(fixture({ status: 'verified', license_class: 'public-domain' }))).toEqual(['fx-depth.png', 'fx.webp']);
});
it('emits nothing when the licence is bad, unknown or the record is not verified', async () => {
  for (const m of [{ status: 'verified', license_class: 'rights-restricted' }, { status: 'verified', license_class: 'unknown' },
    { status: 'disputed', license_class: 'public-domain' }, { status: 'verified', license_class: 'cc-by-nc' }]) {
    expect(await emitted(fixture(m))).toEqual([]);
  }
});
