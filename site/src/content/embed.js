// Build-time data for the WordPress embed teaser (/embed/<slug>/) and its oEmbed response.
// The teaser shows the verified opening line of the first chapter, its source links, and the painted
// portrait only when the portrait licence gate passes (same gate as the portrait route).
import { PRODUCTION_ORIGIN } from './origin.js';
import { listInductees, loadInductee, loadChapter, listChapters, factIndex, mediaIndex, factChips, portraitFiles } from './load.js';
import { gatedPortrait } from './portrait.js';

export { PRODUCTION_ORIGIN };

// WordPress clamps an embed to 1000 px high; the teaser is far shorter and reports its real height.
export const EMBED_SIZE = Object.freeze({ width: 600, height: 380, maxHeight: 1000 });
export const PROVIDER_NAME = 'IHH: Voices of Arrival';

// Teasers exist only for inductees that have chapters (as the journey page does).
export function embedSlugs() {
  const withChapters = new Set(listChapters().map(c => c.slug));
  return listInductees().filter(slug => withChapters.has(slug));
}

export function embedView(slug) {
  const inductee = loadInductee(slug);
  const idx = factIndex(slug);
  const first = listChapters().find(c => c.slug === slug);
  if (!first) throw new Error(`${slug}: no chapters to take a summary from`);
  const line = (loadChapter(slug, first.n).narration || [])[0];
  if (!line || !(line.fact_ids || []).length) throw new Error(`${slug}: first chapter has no grounded narration line`);
  const chips = factChips(line.fact_ids, idx); // throws unless every fact is verified
  // Inside WordPress the iframe is sandboxed without popups and WordPress follows link messages only to
  // the iframe's own host, so the citation is the holder's name as text plus a same-host link to this
  // line on the Lite page (ch-<n>-line-<i>), which lists the line's sources.
  const institutions = [...new Set(chips.flatMap(c => c.sources.map(x => x.institution)))];
  if (!institutions.length) throw new Error(`${slug}: summary line has no source`);
  const portrait = gatedPortrait(inductee, { ...idx, media: mediaIndex(slug) }, s => Boolean(portraitFiles(s)));
  return { slug, name: inductee.name, summary: { text: line.text, institutions, sourcesHref: `/${slug}/lite/#ch-${first.n}-line-0` }, portrait, href: `/${slug}/` };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// oEmbed 1.0 "rich" response. The iframe is sandboxed without allow-same-origin and runs only the
// teaser's inline script, which talks to WordPress by postMessage.
export function oembedResponse({ slug, name }, origin = PRODUCTION_ORIGIN) {
  const { width, height } = EMBED_SIZE;
  const title = `${name}: ${PROVIDER_NAME}`;
  return {
    version: '1.0',
    type: 'rich',
    title,
    provider_name: PROVIDER_NAME,
    provider_url: `${origin}/`,
    width,
    height,
    html: `<iframe src="${esc(origin)}/embed/${esc(slug)}/" width="${width}" height="${height}" title="${esc(title)}" `
      + 'sandbox="allow-scripts" loading="lazy" '
      + 'style="border:0;max-width:100%"></iframe>',
  };
}
