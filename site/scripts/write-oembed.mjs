// Writes public/oembed/<slug>.json for every inductee that has chapters, from src/content/embed.js.
// Run after changing src/content/origin.js or EMBED_SIZE; src/test/embed.test.js fails if the files drift.
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { loadInductee } from '../src/content/load.js';
import { oembedResponse, embedSlugs } from '../src/content/embed.js';

rmSync('public/oembed', { recursive: true, force: true }); // no stale files for removed inductees
mkdirSync('public/oembed', { recursive: true });
for (const slug of embedSlugs()) {
  const { name } = loadInductee(slug);
  writeFileSync(`public/oembed/${slug}.json`, JSON.stringify(oembedResponse({ slug, name }), null, 2) + '\n');
  console.log(`public/oembed/${slug}.json`);
}
