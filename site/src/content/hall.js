// The hallway (/hall/, real-scan museum Task 5): every inductee's easel in the King's Hall scan.
// content/hall.json: { "scan": "<id>", "easels": [{ "slug", "x", "z", "rotY", "group"? }], "stations"? }
// (tools/content_check.py --hall checks it). Text about an inductee comes only from records: the
// name from data/inductees/<slug>/inductee.json, the one line from content/home.json (a verified
// fact's claim verbatim, with its source chips), the painted portrait only through gatedPortrait.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, factChips } from './load.js';
import { initials } from './home.js';

export function loadHall(root = ROOT) {
  const p = join(root, 'content', 'hall.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}

// -> { scan, exhibits, items, stations }
//   exhibits: what the room runtime stands on easels: { id: slug, number, type: 'framed-photograph'
//     (the cleared portrait, `image`) | 'name-card', title: name, easel, href? (the journey map) }
//   items: what the page lists: { id, number, name, label, href | null, portrait | null, initials,
//     line: { text, chips } | null, comingSoon }
export function hallView({ hall, inductees, built, portraitOf = () => null, lineOf = () => null, idxOf = null }) {
  const byslug = new Map(inductees.map(i => [i.slug, i]));
  const seen = new Set();
  for (const e of hall.easels) {
    if (!byslug.has(e.slug)) throw new Error(`hall easel ${e.slug}: not an inductee in the fact pipeline`);
    if (seen.has(e.slug)) throw new Error(`hall easel ${e.slug}: listed more than once`);
    seen.add(e.slug);
  }
  for (const i of inductees) if (!seen.has(i.slug)) throw new Error(`hall: inductee ${i.slug} has no easel`);
  const exhibits = [], items = [];
  hall.easels.forEach((e, k) => {
    const person = byslug.get(e.slug), number = k + 1;
    const portrait = portraitOf(e.slug) || null;
    const href = built(e.slug) ? `/${e.slug}/` : null;
    const { slug, ...easel } = e;
    exhibits.push({
      id: slug, number, title: person.name, easel,
      ...(portrait ? { type: 'framed-photograph', image: portrait.image } : { type: 'name-card' }),
      ...(href ? { href } : {}),
    });
    let line = null;
    const entry = lineOf(slug);
    if (entry && idxOf) {
      const idx = idxOf(slug), claim = idx.facts.get(entry.fact_id) && idx.facts.get(entry.fact_id).claim;
      if (entry.text !== claim) throw new Error(`hall line ${slug}: text must be the claim of ${entry.fact_id} verbatim`);
      line = { text: entry.text, chips: factChips([entry.fact_id], idx) };
    }
    items.push({ id: slug, number, name: person.name, label: `${number}. ${person.name}`, href, portrait, initials: initials(person.name), line, comingSoon: !href });
  });
  return { scan: hall.scan, exhibits, items, stations: hall.stations || [] };
}
