// Build-time views for the home page (/) and the timeline page (/<slug>/timeline/). Text about an
// inductee comes only from verified records: the name from data/inductees/<slug>/inductee.json, the
// one-line fact as the verified fact's own claim (content/home.json names the fact and carries its
// claim verbatim; tools/content_check.py --home checks it in the prebuild, and factChips plus the
// verbatim check below re-check it here), the portrait only through gatedPortrait.
// Nothing here composes a sentence about anyone.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, factChips } from './load.js';

// content/home.json: { "lines": [{ "slug", "fact_id", "text" }] }, one verified fact per inductee,
// `text` being its claim verbatim. -> Map slug -> { fact_id, text }.
export function loadHomeLines(root = ROOT) {
  const p = join(root, 'content', 'home.json');
  if (!existsSync(p)) return new Map();
  const j = JSON.parse(readFileSync(p, 'utf8'));
  return new Map((j.lines || []).map(l => [l.slug, { fact_id: l.fact_id, text: l.text }]));
}

// The hallway page (/hall/, real-scan museum Task 5) is linked only once its content exists.
export function hallHref(root = ROOT) {
  return existsSync(join(root, 'content', 'hall.json')) ? '/hall/' : null;
}

// Initials for a name card (decorative; the name itself is the heading).
export const initials = name => String(name || '').split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase()).filter(c => /\p{L}/u.test(c)).slice(0, 2).join('');

// One section per inductee known to the fact pipeline, built ones first (data order within each group).
//   inductees: [{ slug, name }]                     pipeline inductee records
//   lineOf(slug) -> { fact_id, text } | undefined    content/home.json
//   idxOf(slug) -> { facts, sources }                factIndex
//   built(slug) -> bool                              the inductee has a journey (content/<slug>/journey.json)
//   portraitOf(slug) -> gatedPortrait view | null    licence-cleared painted portrait, else null
// -> [{ slug, name, initials, line: { text, chips } | null, portrait, explore, info, comingSoon }]
export function homeSections({ inductees, lineOf, idxOf, built, portraitOf = () => null }) {
  const views = inductees.map(i => {
    const entry = lineOf(i.slug);
    let line = null;
    if (entry) {
      const idx = idxOf(i.slug), fid = entry.fact_id;
      const chips = factChips([fid], idx); // throws unless the fact is verified with sources
      const claim = idx.facts.get(fid).claim;
      if (entry.text !== claim) throw new Error(`home line ${i.slug}: text must be the claim of ${fid} verbatim`);
      line = { text: entry.text, chips };
    }
    const has = Boolean(built(i.slug));
    return {
      slug: i.slug, name: i.name, initials: initials(i.name), line,
      portrait: portraitOf(i.slug) || null,
      explore: has ? `/${i.slug}/` : null,
      info: has ? `/${i.slug}/timeline/` : null,
      comingSoon: !has,
    };
  });
  return [...views.filter(v => !v.comingSoon), ...views.filter(v => v.comingSoon)];
}

// The timeline: the journey's dated stops in journey order, each with its label, date and the chips
// of the facts that state them, its cited lines, and its room when it has one.
// `stops` are journeyView(...).stops (src/content/journey.js).
export function timelineStops(stops) {
  return stops.filter(s => s.date).map(s => ({
    id: s.id, date: s.date, label: s.label, chips: s.chips, lines: s.lines,
    room: s.href ? { href: s.href, text: `Enter the room: ${s.chapterTitle}` } : null,
  }));
}
