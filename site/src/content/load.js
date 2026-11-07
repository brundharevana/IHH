// Build-time content access. Reads content/<slug>/ and data/inductees/<slug>/ at the repo root.
// Every visible string the chapter page renders comes through here from the chapter JSON or
// from verified fact, source and media records; nothing is composed except fixed UI labels.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { validatePlace, validateCorner, CORNER_NOTE } from '../museum/reconstruction.js';
import { exhibitFiles, panelImageUrl, modelUrl } from '../museum/mediafiles.js';

const USABLE = new Set(['public-domain', 'cc0', 'cc-by', 'cc-by-sa']);
// Licences whose terms ask for a licence link and a note of changes (CC BY 4.0 section 3(a)).
const ATTRIBUTION_LICENCES = new Set(['cc-by', 'cc-by-sa']);

// Astro and Vitest both run from site/, so the repo root is one level up.
export const ROOT = process.env.VOA_ROOT || resolve(process.cwd(), '..');

export function parseJsonl(text) {
  return text.split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
}

const readJson = p => JSON.parse(readFileSync(p, 'utf8'));
const readJsonl = p => (existsSync(p) ? parseJsonl(readFileSync(p, 'utf8')) : []);
const byId = rows => new Map(rows.map(r => [r.id, r]));
const dataDir = slug => join(ROOT, 'data', 'inductees', slug);

export function loadInductee(slug) {
  return readJson(join(ROOT, 'content', slug, 'inductee.json'));
}

export function loadChapter(slug, n) {
  return readJson(join(ROOT, 'content', slug, 'chapters', `${n}.json`));
}

// A scanned room's manifest (content/scans/<id>.json, written by tools/build_scans.py). Only a usable
// room loads: a room the artwork clearance refused (usable: false) has no bundles and must not ship.
export function loadScan(id) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(id))) throw new Error(`bad scan id ${JSON.stringify(id)}`);
  const p = join(ROOT, 'content', 'scans', `${id}.json`);
  if (!existsSync(p)) throw new Error(`no scan manifest for ${id} (content/scans/${id}.json)`);
  const m = readJson(p);
  if (m.usable === false) throw new Error(`scan ${id} is not usable: ${m.unusable_reason || 'refused by the artwork clearance'}`);
  if (!m.bundles || !m.bundles.phone || !m.bundles.desktop || !m.occluder) throw new Error(`scan ${id} has no built bundles (python3 tools/build_scans.py ${id})`);
  return m;
}

// Ids of the scanned rooms production pages show: the hallway's (content/hall.json) and every chapter
// room's (content/<slug>/chapters/<n>.json room.scan), sorted. The production build ships only these
// (scripts/shipped-assets.mjs); a dev-pages build keeps every usable scan for its dev pages.
export function usedScanIds(root = ROOT) {
  const content = join(root, 'content'), ids = new Set();
  const hall = join(content, 'hall.json');
  if (existsSync(hall)) { const h = readJson(hall); if (h && h.scan) ids.add(h.scan); }
  if (existsSync(content)) for (const slug of readdirSync(content)) {
    const dir = join(content, slug, 'chapters');
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter(n => /^\d+\.json$/.test(n))) {
      const room = readJson(join(dir, f)).room;
      if (room && typeof room === 'object' && room.scan) ids.add(room.scan);
    }
  }
  return [...ids].sort();
}

// Ids of the scanned rooms that may ship (usable, with built bundles), sorted.
export function listScans() {
  const dir = join(ROOT, 'content', 'scans');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.json')).map(f => readJson(join(dir, f)))
    .filter(m => m.usable !== false && m.bundles && m.bundles.phone && m.bundles.desktop).map(m => m.id).sort();
}

// Optional per-inductee files: journey map stops and quiz (tools/content_check.py grounds both).
// null when the file is absent.
const readOptional = p => (existsSync(p) ? readJson(p) : null);
export function loadJourney(slug) {
  return readOptional(join(ROOT, 'content', slug, 'journey.json'));
}
export function loadQuiz(slug) {
  return readOptional(join(ROOT, 'content', slug, 'quiz.json'));
}

// Inductees known to the fact pipeline (data/inductees/<slug>/inductee.json), with or without
// experience content yet.
export function listPipelineInductees() {
  const base = join(ROOT, 'data', 'inductees');
  if (!existsSync(base)) return [];
  return readdirSync(base).filter(slug => existsSync(join(base, slug, 'inductee.json'))).sort()
    .map(slug => readJson(join(base, slug, 'inductee.json')));
}

export function factIndex(slug) {
  return {
    facts: byId(readJsonl(join(dataDir(slug), 'facts.jsonl'))),
    sources: byId(readJsonl(join(dataDir(slug), 'sources.jsonl'))),
  };
}

export function mediaIndex(slug) {
  return byId(readJsonl(join(dataDir(slug), 'media.jsonl')));
}

export function listChapters() {
  const base = join(ROOT, 'content');
  if (!existsSync(base)) return [];
  const out = [];
  for (const slug of readdirSync(base)) {
    const dir = join(base, slug, 'chapters');
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      const m = /^(\d+)\.json$/.exec(f);
      if (m) out.push({ slug, n: Number(m[1]) });
    }
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug) || a.n - b.n);
}

// Narration audio from tools/build_audio.py, if it has been built for this chapter.
export function chapterAudio(slug, n) {
  const dir = join(ROOT, 'content', slug, 'audio');
  const mp3 = join(dir, `${n}-narration.mp3`), vtt = join(dir, `${n}-narration.vtt`);
  return existsSync(mp3) && existsSync(vtt) ? { mp3, vtt } : null;
}

// Quote audio from tools/build_audio.py (<n>-<quote-id>.mp3 + .vtt), if built.
export function quoteAudio(slug, n, id) {
  const dir = join(ROOT, 'content', slug, 'audio');
  const mp3 = join(dir, `${n}-${id}.mp3`), vtt = join(dir, `${n}-${id}.vtt`);
  return existsSync(mp3) && existsSync(vtt) ? { mp3, vtt } : null;
}

export function listInductees() {
  const base = join(ROOT, 'content');
  if (!existsSync(base)) return [];
  return readdirSync(base).filter(slug => existsSync(join(base, slug, 'inductee.json'))).sort();
}

// The recreated study corner (Task 6, content/<slug>/study-corner.json). Until it exists a scanned
// study shows no reconstruction plaque anywhere (Task 5 review): there is no reconstruction on show.
export function hasStudyCorner(slug) {
  return existsSync(join(ROOT, 'content', slug, 'study-corner.json'));
}
export function loadStudyCorner(slug) {
  return readOptional(join(ROOT, 'content', slug, 'study-corner.json'));
}

// What the runtime needs to build the corner (src/museum/reconstruction.js buildStudyCorner): its
// validated objects, models' includes, label, area and each device's bundle. Credits stay page text.
export function cornerRuntime(corner, area) {
  const errors = validateCorner(corner, area);
  if (errors.length) throw new Error(`study corner: ${errors.join('; ')}`);
  const bundle = b => ({ url: `/${b.file}`, bytes: b.bytes, gpu_bytes: b.gpu_bytes });
  return {
    label: corner.label, photo_group: corner.photo_group, label_at: corner.label_at, light: corner.light || null,
    area: { id: area.id, min: area.min, max: area.max },
    objects: corner.objects,
    models: Object.fromEntries(Object.entries(corner.models || {}).map(([k, m]) => [k, { includes: m.includes || [] }])),
    basis_media_ids: corner.basis_media_ids,
    bundles: { phone: bundle(corner.bundles.phone), desktop: bundle(corner.bundles.desktop) },
  };
}

// The corner's plaque (3D page and Lite): the label, each basis photograph from its record (title,
// holder, date, link), the fixed recreation note, and the model credits (CC BY: title, author,
// licence link, changes).
export function studyCornerView(corner, { sources, media }) {
  const basis = corner.basis_media_ids.map(id => {
    const m = usableMedia(id, media);
    const s = sources.get((m.source_ids || [])[0]);
    if (!s) throw new Error(`corner basis ${id} has no source record`);
    const { date, kind } = recordDate(m, s);
    return { id, title: m.title, credit: m.credit || null, url: m.url, label: `${m.title}, ${s.institution}, ${kind} ${date}` };
  });
  const used = new Set(Object.values(corner.models || {}).map(m => m.source));
  const credits = (corner.sources || []).filter(s => used.has(s.id))
    .map(s => ({ text: s.credit, licence: { name: s.licence, url: s.licence_url }, source: s.url, changes: s.changes }));
  return { label: corner.label, basis, note: CORNER_NOTE, credits };
}

// Painted portrait and depth map (content/<slug>/portrait/), if both exist. Publishing them is
// gated on the photo record's licence: see gatedPortrait in portrait.js.
export function portraitFiles(slug) {
  const dir = join(ROOT, 'content', slug, 'portrait');
  const image = join(dir, 'portrait.webp'), depth = join(dir, 'depth.png');
  return existsSync(image) && existsSync(depth) ? { image, depth } : null;
}

export function sourceDate(s) {
  return s.published ? { date: s.published, kind: 'published' } : { date: s.accessed, kind: 'accessed' };
}

function sourceView(s) {
  const { date, kind } = sourceDate(s);
  return { id: s.id, title: s.title, institution: s.institution, date, dateKind: kind, url: s.url };
}

// Plain-language chip label; the fact id lives inside the tip.
export function chipLabel(n) {
  return n === 1 ? 'Source' : `Sources (${n})`;
}

// A chip's accessible name: its visible label first (speech input matches it), then the start of its
// claim, so chips side by side can be told apart.
const CHIP_WORDS = 6;
export function chipName(label, claim) {
  const words = String(claim || '').trim().split(/\s+/).filter(Boolean);
  return `${label} for: ${words.slice(0, CHIP_WORDS).join(' ')}${words.length > CHIP_WORDS ? '\u2026' : ''}`;
}

// One chip per fact; each carries the fact's unique evidence sources in evidence order.
export function factChips(factIds = [], { facts, sources }) {
  return factIds.map(fid => {
    const f = facts.get(fid);
    if (!f) throw new Error(`unknown fact ${fid}`);
    if (f.status !== 'verified') throw new Error(`fact ${fid} is ${f.status}, must be verified`);
    const seen = new Set(), out = [];
    for (const e of f.evidence || []) {
      if (seen.has(e.source_id)) continue;
      seen.add(e.source_id);
      const s = sources.get(e.source_id);
      if (!s) throw new Error(`fact ${fid}: unknown source ${e.source_id}`);
      out.push(sourceView(s));
    }
    if (!out.length) throw new Error(`fact ${fid} has no evidence sources`);
    const label = chipLabel(out.length);
    return { factId: fid, label, name: chipName(label, f.claim), sources: out };
  });
}

function usableMedia(id, media) {
  const m = media.get(id);
  if (!m || m.status !== 'verified' || !USABLE.has(m.license_class)) {
    throw new Error(`media ${id} is not verified with a usable licence`);
  }
  return m;
}

// Plain-language evidence labels for the panel (content_check.py EVIDENCE mirrors the keys).
export const EVIDENCE_LABELS = Object.freeze({
  record: 'Original record',
  photograph: 'Original photograph',
  reconstruction: 'Reconstruction',
});
export function evidenceLabel(e) {
  if (e === undefined || e === null) return null;
  if (!Object.hasOwn(EVIDENCE_LABELS, e)) throw new Error(`evidence ${e} is not one of ${Object.keys(EVIDENCE_LABELS).join(', ')}`);
  return EVIDENCE_LABELS[e];
}

// Width and height of a baseline or progressive JPEG from its frame header; null if not a JPEG.
export function jpegSize(buf) {
  if (!buf || buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    if (marker === 0xff) { i++; continue; }
    const len = buf.readUInt16BE(i + 2);
    // SOF0-SOF15 except DHT (C4), JPG (C8) and DAC (CC) carry the frame size.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    }
    i += 2 + len;
  }
  return null;
}

// Pixel size of a WebP file (lossy VP8, lossless VP8L or extended VP8X), or null.
export function webpSize(buf) {
  if (!buf || buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const b = buf.subarray(21, 25);
    return { width: 1 + (((b[1] & 0x3f) << 8) | b[0]), height: 1 + (((b[3] & 0x0f) << 10) | (b[2] << 2) | ((b[1] & 0xc0) >> 6)) };
  }
  if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  return null;
}

// URL of a stop's present-day aerial stack (site/public/aerial/<slug>/<stop>/manifest.json, written
// by tools/build_aerials.py), or null when none was built.
export const AERIAL_DIR = join(ROOT, 'site', 'public', 'aerial');
export function aerialManifest(slug, stopId) {
  const safe = /^[a-z0-9-]+$/;
  if (!safe.test(slug) || !safe.test(stopId)) return null;
  return existsSync(join(AERIAL_DIR, slug, stopId, 'manifest.json')) ? `/aerial/${slug}/${stopId}/manifest.json` : null;
}

// Size of an exhibit image in site/public/media/, when the file is there.
export const MEDIA_DIR = join(ROOT, 'site', 'public', 'media');
export function mediaFileSize(key) {
  const p = join(MEDIA_DIR, `${key}.jpg`);
  return existsSync(p) ? jpegSize(readFileSync(p)) : null;
}

export function exhibitView(ex, { facts, sources, media }, { sizeOf = mediaFileSize } = {}) {
  const shown = usableMedia(ex.media_id, media);
  const original = usableMedia(ex.original_media_id, media);
  const isModel = ex.type === '360-document';
  const files = exhibitFiles(ex);
  // Alt text describes the image itself: the verified media record's title, not the exhibit claim.
  if (!shown.title) throw new Error(`media ${shown.id} has no title to describe the image`);
  let reconstruction = null;
  if (isModel) {
    // The document mesh is our reconstruction; cite the record it was built from.
    const s = sources.get((original.source_ids || [])[0]);
    if (!s) throw new Error(`exhibit ${ex.id}: original media ${original.id} has no source record`);
    const { date, kind } = recordDate(original, s);
    reconstruction = `Reconstruction based on ${s.title}, ${s.institution}, ${kind} ${date}`;
  }
  // CC BY and CC BY-SA ask for a link to the licence and a note of any change: the holder's licence URL
  // and what our build does to the file (tools/fetch_media.py resizes; a 360 document becomes a model).
  let licence = null;
  if (ATTRIBUTION_LICENCES.has(shown.license_class)) {
    if (!/^https:\/\//.test(shown.rights_url || '')) throw new Error(`media ${shown.id} (${shown.license_class}) has no licence URL to link`);
    const kind = /^https:\/\/creativecommons\.org\/licenses\/(by|by-sa)\/(\d\.\d)\/?$/.exec(shown.rights_url);
    if (!kind) throw new Error(`media ${shown.id} (${shown.license_class}): licence URL ${shown.rights_url} names no known CC licence`);
    licence = { url: shown.rights_url, name: `CC ${kind[1].toUpperCase()} ${kind[2]}`, workTitle: shown.title,
      changes: isModel ? 'Made into a 3D model from the holder\u2019s file.' : 'Resized from the holder\u2019s file.' };
  }
  return {
    id: ex.id,
    number: ex.number,
    label: `${ex.number}. ${ex.title}`,
    title: ex.title,
    type: ex.type,
    titleChips: factChips(ex.title_fact_ids, { facts, sources }),
    media: isModel
      ? { kind: 'model', src: modelUrl(files.model), alt: shown.title }
      : { kind: 'image', src: panelImageUrl(files.front), alt: shown.title, ...(sizeOf(files.front) || {}) },
    notes: (ex.notes || []).map(n => ({ text: n.text, chips: factChips(n.fact_ids, { facts, sources }) })),
    credit: shown.credit || null,
    rights: shown.rights_statement || null,
    licence,
    // The photo's date in its holder's words (content_check: verbatim from the media record).
    holderDate: ex.holder_date || null,
    evidence: evidenceLabel(ex.evidence),
    reconstruction,
    plainBack: isModel && !files.back, // the panel says the model's back is plain paper
    originalUrl: original.url,
  };
}

// The photo's own date, only where the media record states it as the holder's (pipeline notes
// marker "Photo date as stated by the holder (Date field): <date>."); null otherwise.
export function photoDate(m) {
  const hit = /Photo date as stated by the holder \(Date field\): ([0-9]{4}(?:-[0-9]{2}){0,2})\./.exec((m && m.notes) || '');
  return hit ? hit[1] : null;
}

// Date of a media record for labels: the holder's photo date where the record states it
// ('photographed'), else its source's published or accessed date, always with that kind.
export function recordDate(m, s) {
  const shot = photoDate(m);
  return shot ? { date: shot, kind: 'photographed' } : sourceDate(s);
}

// One line on the plaque when the basis photos' holder dates differ, or some have none: the dates
// come only from the records' holder photo dates (photoDate), never from source dates.
export function photoDatesLine(basis) {
  const dated = [...new Set(basis.filter(b => b.dateKind === 'photographed').map(b => b.date))].sort();
  const undated = basis.filter(b => b.dateKind !== 'photographed').length;
  if (!dated.length || (dated.length === 1 && !undated)) return null;
  const list = dated.length === 1 ? dated[0] : `${dated.slice(0, -1).join(', ')} and ${dated[dated.length - 1]}`;
  if (!undated) return `The source photographs were taken in ${list}.`;
  return `Source photographs with a holder photo date were taken in ${list}; ${undated} ${undated === 1 ? 'has no photo date in its record' : 'have no photo date in their records'}.`;
}

// Plaque for a reconstructed place: every basis photograph as title, holder, date (with its kind:
// the photo's own date where the record states it, else the source's published or accessed date) and a link
// to the untouched record. The place itself must pass validatePlace against these basis photos.
export function reconstructionView(rec, { facts, sources, media }, exhibits = []) {
  const ids = (rec && rec.basis_media_ids) || [];
  if (!ids.length) throw new Error('reconstructed-place needs reconstruction.basis_media_ids');
  const errors = validatePlace(rec.place, ids, exhibits);
  if (errors.length) throw new Error(`reconstruction place: ${errors.join('; ')}`);
  const basis = ids.map(id => {
    const m = usableMedia(id, media);
    if (!m.title) throw new Error(`basis media ${id} has no title`);
    const s = sources.get((m.source_ids || [])[0]);
    if (!s) throw new Error(`basis media ${id} has no source record`);
    const { date, kind } = recordDate(m, s);
    return { id, title: m.title, holder: s.institution, date, dateKind: kind, credit: m.credit || null, url: m.url,
      label: `${m.title}, ${s.institution}, ${kind} ${date}` };
  });
  const factIds = rec.basis_fact_ids || [];
  const chips = factChips(factIds, { facts, sources }); // verified facts only, note or not
  if (rec.note != null && !chips.length) throw new Error('reconstruction note needs basis_fact_ids');
  return {
    basis,
    note: rec.note != null ? { text: rec.note, chips } : null,
    datesLine: photoDatesLine(basis),
    unseen: [...rec.place.unseen],
  };
}
