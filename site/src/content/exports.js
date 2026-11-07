// Public copies of the fact log exports (data/export/, the pipeline's combined review package).
// That package also lists single-source, disputed and rejected candidates for the IHH reviewers;
// the public site publishes only what it may show: verified facts, verified media, and the
// sources and pipeline runs behind them. Search logs are not published.
// CSV rows are copied byte for byte (no re-quoting); only whole rows are dropped, and one column
// is appended (review_notice).
//
// Review labelling (project rule: the site shows verified facts, but a consumer must be able to tell
// IHH-approved rows from pending ones). Every published facts.csv / media.csv row and JSON-LD node
// carries review_state (pending, approved or edited) and, for approved or edited rows,
// review_decision_id and review_decision_date (written by tools/export.py from review/decisions.jsonl).
// Rows whose review_state is rejected are never published. Each file says at the top that only
// approved or edited rows have passed IHH human review: the review_notice column on every CSV row,
// and the description of the JSON-LD document.

// Splits RFC 4180 CSV into records, keeping each record's raw text (quoted fields may hold
// commas, doubled quotes and newlines).
export function csvRecords(text) {
  const out = [];
  let i = 0, start = 0, fields = [], field = '', quoted = false;
  const endRecord = end => {
    fields.push(field);
    out.push({ raw: text.slice(start, end), fields });
    fields = []; field = '';
  };
  while (i < text.length) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (c === '"') { quoted = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { quoted = true; i++; continue; }
    if (c === ',') { fields.push(field); field = ''; i++; continue; }
    if (c === '\r' || c === '\n') {
      const end = i;
      i += c === '\r' && text[i + 1] === '\n' ? 2 : 1;
      endRecord(end);
      start = i;
      continue;
    }
    field += c; i++;
  }
  if (start < text.length) endRecord(text.length);
  return out;
}

const BOM = '﻿';
function table(text) {
  const bom = text.startsWith(BOM);
  const recs = csvRecords(bom ? text.slice(1) : text);
  const header = recs[0];
  const col = name => {
    const k = header.fields.indexOf(name);
    if (k < 0) throw new Error(`export: column ${name} missing`);
    return k;
  };
  return { bom, header, rows: recs.slice(1), col };
}
function emit(t, rows) {
  return (t.bom ? BOM : '') + [t.header, ...rows].map(r => r.raw).join('\r\n') + '\r\n';
}
export const REVIEW_NOTICE = 'Only rows with review_state approved or edited have passed IHH human review. '
  + 'Rows with review_state pending are verified against their sources by the pipeline but have not been reviewed by IHH.';
const SHOWN_STATES = ['pending', 'approved', 'edited']; // rejected is never published
const quote = text => '"' + text.replaceAll('"', '""') + '"';
const ids = s => s.split(';').map(x => x.trim()).filter(Boolean);

// Rows to publish: verified, and not rejected by a reviewer. A review_state outside the known set
// stops the build: an export that cannot say what a row's review state is must not be published.
function keep(t, name) {
  const status = t.col('status'), state = t.col('review_state'), id = t.col('id');
  t.col('review_decision_id'); t.col('review_decision_date');
  const kept = [];
  for (const r of t.rows) {
    if (r.fields[status] !== 'verified') continue;
    const s = r.fields[state];
    if (s === 'rejected') continue;
    if (!SHOWN_STATES.includes(s)) throw new Error(`export: ${name} row ${r.fields[id]}: review_state "${s}" is not one of ${SHOWN_STATES.join(', ')}, rejected`);
    if ((s === 'approved' || s === 'edited') && !(r.fields[t.col('review_decision_id')] && r.fields[t.col('review_decision_date')])) {
      throw new Error(`export: ${name} row ${r.fields[id]}: review_state ${s} without a review decision id and date`);
    }
    kept.push(r);
  }
  return kept;
}
// The same rows with the review_notice column appended (header and every row).
function noticed(t, rows) {
  const header = { raw: t.header.raw + ',review_notice', fields: [...t.header.fields, 'review_notice'] };
  return { ...t, header, rows: rows.map(r => ({ raw: r.raw + ',' + quote(REVIEW_NOTICE), fields: [...r.fields, REVIEW_NOTICE] })) };
}

// { 'facts.csv', 'sources.csv', 'media.csv', 'provenance.jsonld' } texts -> the same, filtered and labelled.
export function publicExports(files) {
  const facts = table(files['facts.csv']);
  const media = table(files['media.csv']);
  const sources = table(files['sources.csv']);
  const keptFacts = keep(facts, 'facts.csv');
  const keptMedia = keep(media, 'media.csv');
  const cited = new Set([
    ...keptFacts.flatMap(r => ids(r.fields[facts.col('source_ids')])),
    ...keptMedia.flatMap(r => ids(r.fields[media.col('source_ids')])),
  ]);
  const keptSources = sources.rows.filter(r => cited.has(r.fields[sources.col('id')]));

  const state = new Map([
    ...keptFacts.map(r => [`ihh:${r.fields[facts.col('id')]}`, r.fields[facts.col('review_state')]]),
    ...keptMedia.map(r => [`ihh:${r.fields[media.col('id')]}`, r.fields[media.col('review_state')]]),
  ]);
  const doc = JSON.parse(files['provenance.jsonld']);
  const keepIds = new Set([...state.keys(), ...[...cited].map(id => `ihh:${id}`)]);
  const graph = doc['@graph'].filter(n => {
    if (n['@type'] === 'Person') return true;
    if (n['@type'] === 'prov:Activity') return !('query' in n); // pipeline runs yes, individual searches no
    return keepIds.has(n['@id']);
  });
  for (const n of graph) {
    if (!state.has(n['@id'])) continue;
    if (n['ihh:reviewState'] !== state.get(n['@id'])) {
      throw new Error(`export: provenance.jsonld ${n['@id']}: ihh:reviewState ${JSON.stringify(n['ihh:reviewState'])} does not match review_state ${state.get(n['@id'])} in the CSV`);
    }
  }
  const { '@context': context, ...rest } = doc;
  const f = noticed(facts, keptFacts), m = noticed(media, keptMedia);
  return {
    'facts.csv': emit(f, f.rows),
    'sources.csv': emit(sources, keptSources),
    'media.csv': emit(m, m.rows),
    'provenance.jsonld': JSON.stringify({ '@context': context, description: REVIEW_NOTICE, ...rest, '@graph': graph }, null, 2) + '\n',
  };
}
