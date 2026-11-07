// Build-time text for the living portrait: badge, alt text and AI voice label, all filled from
// verified records. Templates are fixed: badge and alt text per docs/research/direction/
// B4-AVATAR-RECOMMENDATION.md section 4, voice label per the plan's global constraints.
import { sourceDate, factChips, recordDate } from './load.js';

const USABLE = new Set(['public-domain', 'cc0', 'cc-by', 'cc-by-sa']);

function need(fields, keys) {
  for (const k of keys) {
    if (typeof fields[k] !== 'string' || !fields[k].trim()) throw new Error(`portrait label: missing ${k}`);
  }
}
const noStop = s => s.trim().replace(/\.+$/, '');

export function portraitBadge(f) {
  need(f, ['name', 'holder', 'year', 'rights']);
  return `AI-assisted painted portrait. Our software painted it from a photograph (${f.holder}, ${f.year}; ${noStop(f.rights)}). `
    + 'Movement is added with an AI depth estimate; no face or expression is generated. '
    + `${f.name} did not pose for or approve this image.`;
}

// "a <year> photograph" only for the holder's photo date; otherwise the source date with its kind.
export function portraitAlt(f) {
  need(f, ['name', 'holder', 'year', 'dateKind']);
  return f.dateKind === 'photographed'
    ? `Painted portrait of ${f.name}, based on a ${f.year} photograph from ${f.holder}.`
    : `Painted portrait of ${f.name}, based on a photograph from ${f.holder}, ${f.dateKind} ${f.year}.`;
}

export function voiceLabel(f) {
  need(f, ['name', 'source', 'date']);
  return `AI-generated voice, not ${f.name}'s voice. Words: ${f.name}, ${noStop(f.source)}, ${f.date}.`;
}

// No licence check here: callers decide. Production goes through gatedPortrait.
export function portraitFromMedia(m, sources, name, files) {
  const s = sources.get((m.source_ids || [])[0]);
  if (!s) throw new Error(`portrait media ${m.id} has no source record`);
  const { date, kind } = recordDate(m, s);
  const fields = { name, holder: s.institution, year: date, dateKind: kind, rights: m.rights_statement };
  return { image: files.image, depth: files.depth, alt: portraitAlt(fields),
    badge: portraitBadge({ ...fields, year: kind === 'photographed' ? date : `${kind} ${date}` }) };
}

// inductee.json "portrait": { "media_id" } names the verified photo record the painting was made
// from; the painting and its depth map live in content/<slug>/portrait/ (portrait.webp, depth.png)
// and are published at /portraits/<slug>.webp and /portraits/<slug>-depth.png only by the gated
// route src/pages/portraits/[file].js. Returns null (nothing emitted, nothing shown) unless the photo
// record is verified with a usable licence and both files exist.
export function gatedPortrait(inductee, { media, sources }, filesExist) {
  const p = inductee.portrait;
  if (!p) return null;
  const m = media.get(p.media_id);
  if (!m || m.status !== 'verified' || !USABLE.has(m.license_class)) return null;
  if (!filesExist(inductee.slug)) return null;
  return portraitFromMedia(m, sources, inductee.name,
    { image: `/portraits/${inductee.slug}.webp`, depth: `/portraits/${inductee.slug}-depth.png` });
}

// Chapter quotes -> player data. Re-checks the content-check rules so a stale build cannot ship
// an unverified or altered quote. hasAudio(slug, n, id) says whether build_audio.py output exists.
export function quoteViews(quotes, { facts, sources }, { name, slug, n, hasAudio }) {
  return quotes.map(q => {
    const f = facts.get(q.fact_id);
    if (!f || f.status !== 'verified' || !f.is_direct_quote) throw new Error(`quote ${q.id}: needs a verified direct-quote fact`);
    if (q.text !== f.claim) throw new Error(`quote ${q.id}: text must equal fact ${f.id} verbatim`);
    if (q.voice === 'recording') throw new Error(`quote ${q.id}: archival recordings are not supported by the portrait player yet`);
    const s = sources.get(((f.evidence || [])[0] || {}).source_id);
    if (!s) throw new Error(`quote ${q.id}: fact ${f.id} has no evidence source`);
    // "Words: <name>, <source>, <date>": the quote's grounded attribution (content_check.py checks
    // its wording against its facts) when it has one, else the quote fact's first evidence source.
    let attributionChips = [], words = { source: s.title, date: sourceDate(s).date };
    if (q.attribution !== undefined) {
      const a = q.attribution || {};
      if (!(a.fact_ids || []).length) throw new Error(`quote ${q.id}: attribution needs fact_ids`);
      attributionChips = factChips(a.fact_ids, { facts, sources }); // verified facts only
      words = { source: a.source, date: a.date };
    }
    const label = voiceLabel({ name, ...words });
    const base = `/audio/${slug}/${n}-${q.id}`;
    return {
      id: q.id, text: q.text, voiceLabel: label, attributionChips,
      source: `${s.title}, ${s.institution}, ${sourceDate(s).date}`,
      audio: hasAudio(slug, n, q.id) ? { mp3: `${base}.mp3`, vtt: `${base}.vtt` } : null,
    };
  });
}
