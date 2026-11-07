// The WordPress embed teaser: build-time view (src/content/embed.js), the static oEmbed response
// (public/oembed/<slug>.json) and the licence gate on the teaser portrait.
import { it, expect, vi, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

afterEach(() => { delete process.env.VOA_ROOT; vi.resetModules(); });

function fixture(media) {
  const root = mkdtempSync(join(tmpdir(), 'voa-embed-'));
  const d = join(root, 'data', 'inductees', 'fx');
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'media.jsonl'), JSON.stringify({ id: 'FX-M-0001', title: 'Portrait', source_ids: ['FX-S-0001'], rights_statement: 'Rights.', ...media }) + '\n');
  writeFileSync(join(d, 'sources.jsonl'), JSON.stringify({ id: 'FX-S-0001', title: 'Photo', institution: 'Archive', published: '1947', url: 'https://a.example/1' }) + '\n');
  writeFileSync(join(d, 'facts.jsonl'), JSON.stringify({ id: 'FX-F-0001', claim: 'Ada Example arrived in 1900.', status: 'verified', evidence: [{ source_id: 'FX-S-0001', quote: 'q', locator: 'l' }] }) + '\n');
  const c = join(root, 'content', 'fx');
  mkdirSync(join(c, 'portrait'), { recursive: true });
  mkdirSync(join(c, 'chapters'), { recursive: true });
  writeFileSync(join(c, 'inductee.json'), JSON.stringify({ slug: 'fx', name: 'Ada Example', chapters: [1], portrait: { media_id: 'FX-M-0001' } }));
  writeFileSync(join(c, 'chapters', '1.json'), JSON.stringify({ id: 'fx-1', title: 'Arrival', title_fact_ids: ['FX-F-0001'], narration: [
    { cue: 'c1', text: 'Ada Example arrived in 1900.', fact_ids: ['FX-F-0001'], reveals: [] }], exhibits: [], quotes: [] }));
  writeFileSync(join(c, 'portrait', 'portrait.webp'), 'webp');
  writeFileSync(join(c, 'portrait', 'depth.png'), 'png');
  return root;
}
async function view(root, slug = 'fx') {
  vi.resetModules();
  process.env.VOA_ROOT = root;
  const { embedView } = await import('../content/embed.js');
  return embedView(slug);
}

it('shows the name, the first narration line with its source links, and the link to the full experience', async () => {
  const v = await view(fixture({ status: 'verified', license_class: 'public-domain' }));
  expect(v.name).toBe('Ada Example');
  expect(v.summary.text).toBe('Ada Example arrived in 1900.');
  // Off-site links do not work inside WordPress's sandboxed iframe: the citation is the holder's name
  // as text plus a same-host link to the line on the Lite page, which lists its sources.
  expect(v.summary.institutions).toEqual(['Archive']);
  expect(v.summary.sourcesHref).toBe('/fx/lite/#ch-1-line-0');
  expect(JSON.stringify(v)).not.toMatch(/https?:\/\//);
  expect(v.href).toBe('/fx/');
  expect(v.portrait.image).toBe('/portraits/fx.webp');
  expect(v.portrait.alt).toMatch(/^Painted portrait of Ada Example/);
});

it('shows no portrait unless the photo record is verified with a usable licence', async () => {
  for (const m of [{ status: 'verified', license_class: 'rights-restricted' }, { status: 'verified', license_class: 'unknown' },
    { status: 'disputed', license_class: 'public-domain' }]) {
    expect((await view(fixture(m))).portrait).toBeNull();
  }
});

it('refuses a summary whose fact is not verified', async () => {
  const root = fixture({ status: 'verified', license_class: 'public-domain' });
  writeFileSync(join(root, 'data', 'inductees', 'fx', 'facts.jsonl'),
    JSON.stringify({ id: 'FX-F-0001', claim: 'Ada Example arrived in 1900.', status: 'single-source', evidence: [] }) + '\n');
  await expect(view(root)).rejects.toThrow(/must be verified/);
});

it('offers a teaser only to inductees that have chapters', async () => {
  const root = fixture({ status: 'verified', license_class: 'public-domain' });
  mkdirSync(join(root, 'content', 'nochapters'), { recursive: true });
  writeFileSync(join(root, 'content', 'nochapters', 'inductee.json'), JSON.stringify({ slug: 'nochapters', name: 'No Chapters' }));
  vi.resetModules();
  process.env.VOA_ROOT = root;
  const { embedSlugs } = await import('../content/embed.js');
  expect(embedSlugs()).toEqual(['fx']);
});

it('ships one static oEmbed file per teaser, current, and no stale ones', async () => {
  vi.resetModules();
  const { embedSlugs } = await import('../content/embed.js');
  const { loadInductee } = await import('../content/load.js');
  const { oembedResponse } = await import('../content/embed.js');
  const dir = join(process.cwd(), 'public', 'oembed');
  expect(readdirSync(dir).sort()).toEqual(embedSlugs().map(s => `${s}.json`).sort());
  for (const slug of embedSlugs()) {
    const file = JSON.parse(readFileSync(join(dir, `${slug}.json`), 'utf8'));
    expect(file).toEqual(oembedResponse({ slug, name: loadInductee(slug).name }));
  }
});

it('ships a static oEmbed 1.0 rich response that matches the page it points to', async () => {
  vi.resetModules();
  const { oembedResponse, PRODUCTION_ORIGIN } = await import('../content/embed.js');
  const file = JSON.parse(readFileSync(join(process.cwd(), 'public', 'oembed', 'einstein.json'), 'utf8'));
  expect(file.version).toBe('1.0');
  expect(file.type).toBe('rich');
  expect(file.provider_name).toBe('IHH: Voices of Arrival');
  expect(file.width).toBeGreaterThan(0);
  expect(file.height).toBeGreaterThan(0);
  expect(file.height).toBeLessThanOrEqual(1000);
  expect(file.html).toContain(`src="${PRODUCTION_ORIGIN}/embed/einstein/"`);
  expect(file.html).toMatch(/^<iframe [^>]*sandbox="allow-scripts"/); // what WordPress sets anyway
  expect(file.html).not.toMatch(/allow-same-origin/);
  expect(file.html).toContain(`height="${file.height}"`);
  expect(file.html).not.toContain('<script');
  expect(PRODUCTION_ORIGIN).toMatch(/^https:\/\/[^/]+$/);
});

it('escapes the title in the iframe markup', async () => {
  vi.resetModules();
  const { oembedResponse } = await import('../content/embed.js');
  const r = oembedResponse({ slug: 'x', name: 'A "B" <i>' });
  expect(r.html).not.toContain('<i>');
  expect(r.html).toContain('A &quot;B&quot; &lt;i&gt;');
});

it('escapes the origin and slug in the iframe src', async () => {
  vi.resetModules();
  const { oembedResponse } = await import('../content/embed.js');
  const r = oembedResponse({ slug: 'a"b', name: 'N' }, 'https://x.example"><script>');
  expect(r.html).not.toContain('<script>');
  expect(r.html).toContain('src="https://x.example&quot;&gt;&lt;script&gt;/embed/a&quot;b/"');
});
