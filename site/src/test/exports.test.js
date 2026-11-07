import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { csvRecords, publicExports, REVIEW_NOTICE } from '../content/exports.js';
import { ROOT } from '../content/load.js';

it('splits CSV records with quoted commas, quotes and newlines, keeping raw text', () => {
  const recs = csvRecords('a,b\r\n1,"x, ""y""\nz"\r\n2,w\n');
  expect(recs.map(r => r.fields)).toEqual([['a', 'b'], ['1', 'x, "y"\nz'], ['2', 'w']]);
  expect(recs[1].raw).toBe('1,"x, ""y""\nz"');
});

const csv = rows => '﻿' + rows.map(r => r.join(',')).join('\r\n') + '\r\n';
const FH = ['id', 'claim', 'status', 'review_state', 'review_decision_id', 'review_decision_date', 'source_ids'];
const MH = ['id', 'status', 'review_state', 'review_decision_id', 'review_decision_date', 'source_ids'];
const node = (id, type, state, extra = {}) => ({ '@id': `ihh:${id}`, '@type': type, 'ihh:reviewState': state, ...extra });
const files = (over = {}) => ({
  'facts.csv': csv([FH,
    ['F1', '"ok, fine"', 'verified', 'pending', '', '', 'S1'],
    ['F2', 'bad', 'rejected', 'pending', '', '', 'S2'],
    ['F3', 'maybe', 'single-source', 'pending', '', '', 'S3'],
    ['F4', 'verified but the reviewer rejected it', 'verified', 'rejected', '', '', 'S5'],
    ['F5', 'approved fact', 'verified', 'approved', 'x:decisions:7', '2026-10-09', 'S6']]),
  'media.csv': csv([MH, ['M1', 'verified', 'pending', '', '', 'S4'], ['M2', 'disputed', 'pending', '', '', 'S2'],
    ['M3', 'verified', 'rejected', '', '', 'S5'], ['M4', 'verified', 'edited', 'x:decisions:9', '2026-10-08', 'S4']]),
  'sources.csv': csv([['id', 'title'], ['S1', 'a'], ['S2', 'b'], ['S3', 'c'], ['S4', 'd'], ['S5', 'e'], ['S6', 'f']]),
  'provenance.jsonld': JSON.stringify({ '@context': {}, '@graph': [
    { '@id': 'ihh:person-x', '@type': 'Person' }, node('F1', 'Claim', 'pending'), node('F2', 'Claim', 'pending'),
    node('F4', 'Claim', 'rejected'), node('F5', 'Claim', 'approved', { 'ihh:review': { 'ihh:decision': 'x:decisions:7' } }),
    { '@id': 'ihh:S1', '@type': 'CreativeWork' }, { '@id': 'ihh:S2', '@type': 'CreativeWork' }, { '@id': 'ihh:S5', '@type': 'CreativeWork' },
    node('M1', 'MediaObject', 'pending'), node('M3', 'MediaObject', 'rejected'), node('M4', 'MediaObject', 'edited'),
    { '@id': 'ihh:run-1', '@type': 'prov:Activity' }, { '@id': 'ihh:search-1', '@type': 'prov:Activity', query: 'q' }] }),
  ...over,
});
const rows = (out, name) => {
  const recs = csvRecords(out[name].slice(1));
  return recs.slice(1).map(r => Object.fromEntries(recs[0].fields.map((h, i) => [h, r.fields[i]])));
};

it('publishes verified facts and media that no reviewer rejected, and the sources they cite', () => {
  const out = publicExports(files());
  expect(rows(out, 'facts.csv').map(r => r.id)).toEqual(['F1', 'F5']);
  expect(rows(out, 'media.csv').map(r => r.id)).toEqual(['M1', 'M4']);
  expect(csvRecords(out['sources.csv'].slice(1)).slice(1).map(r => r.fields[0])).toEqual(['S1', 'S4', 'S6']);
  const g = JSON.parse(out['provenance.jsonld'])['@graph'].map(n => n['@id']);
  expect(g).toEqual(['ihh:person-x', 'ihh:F1', 'ihh:F5', 'ihh:S1', 'ihh:M1', 'ihh:M4', 'ihh:run-1']);
});

it('copies the published rows byte for byte and appends only the review_notice column', () => {
  const out = publicExports(files());
  const notice = '"' + REVIEW_NOTICE + '"';
  expect(out['facts.csv'].startsWith('﻿' + FH.join(',') + ',review_notice\r\n"')).toBe(false);
  expect(out['facts.csv'].split('\r\n')[0]).toBe('﻿' + FH.join(',') + ',review_notice');
  expect(out['facts.csv'].split('\r\n')[1]).toBe('F1,"ok, fine",verified,pending,,,S1,' + notice);
});

it('labels a verified row that is still pending as pending', () => {
  const out = publicExports(files());
  const f1 = rows(out, 'facts.csv').find(r => r.id === 'F1');
  expect(f1.review_state).toBe('pending');
  expect(f1.review_decision_id).toBe('');
  expect(f1.review_notice).toMatch(/Only rows with review_state approved or edited have passed IHH human review/);
  const n = JSON.parse(out['provenance.jsonld'])['@graph'].find(x => x['@id'] === 'ihh:F1');
  expect(n['ihh:reviewState']).toBe('pending');
});

it('never publishes a verified row a reviewer rejected, in any file', () => {
  const out = publicExports(files());
  expect(rows(out, 'facts.csv').map(r => r.id)).not.toContain('F4');
  expect(rows(out, 'media.csv').map(r => r.id)).not.toContain('M3');
  const ids = JSON.parse(out['provenance.jsonld'])['@graph'].map(n => n['@id']);
  expect(ids).not.toContain('ihh:F4');
  expect(ids).not.toContain('ihh:M3');
  expect(ids).not.toContain('ihh:S5'); // cited only by rejected rows
});

it('labels an approved or edited row with its state and review decision, in the CSV and the JSON-LD', () => {
  const out = publicExports(files());
  const f5 = rows(out, 'facts.csv').find(r => r.id === 'F5');
  expect([f5.review_state, f5.review_decision_id, f5.review_decision_date]).toEqual(['approved', 'x:decisions:7', '2026-10-09']);
  const m4 = rows(out, 'media.csv').find(r => r.id === 'M4');
  expect([m4.review_state, m4.review_decision_id, m4.review_decision_date]).toEqual(['edited', 'x:decisions:9', '2026-10-08']);
  const n = JSON.parse(out['provenance.jsonld'])['@graph'].find(x => x['@id'] === 'ihh:F5');
  expect(n['ihh:reviewState']).toBe('approved');
  expect(n['ihh:review']['ihh:decision']).toBe('x:decisions:7');
});

it('states in the JSON-LD description that only approved or edited rows passed IHH review', () => {
  const doc = JSON.parse(publicExports(files())['provenance.jsonld']);
  expect(doc.description).toBe(REVIEW_NOTICE);
  expect(doc.description).toMatch(/approved or edited have passed IHH human review/);
});

it('refuses an export that cannot say what a row review state is', () => {
  const bad = (name, rowsIn) => files({ [name]: csv(rowsIn) });
  // a column missing
  expect(() => publicExports(bad('facts.csv', [['id', 'claim', 'status', 'source_ids'], ['F1', 'c', 'verified', 'S1']]))).toThrow(/review_state missing/);
  // an unknown state
  expect(() => publicExports(bad('media.csv', [MH, ['M1', 'verified', 'maybe', '', '', 'S4']]))).toThrow(/review_state "maybe"/);
  // approved without its decision
  expect(() => publicExports(bad('facts.csv', [FH, ['F5', 'c', 'verified', 'approved', '', '', 'S6']]))).toThrow(/without a review decision/);
  // a JSON-LD node that disagrees with the CSV
  const g = JSON.parse(files()['provenance.jsonld']);
  g['@graph'].find(n => n['@id'] === 'ihh:F1')['ihh:reviewState'] = 'approved';
  expect(() => publicExports(files({ 'provenance.jsonld': JSON.stringify(g) }))).toThrow(/does not match review_state/);
});

it('the shipped exports label every row with its review state and publish no rejected row', () => {
  const names = ['facts.csv', 'sources.csv', 'media.csv', 'provenance.jsonld'];
  const out = publicExports(Object.fromEntries(names.map(n => [n, readFileSync(join(ROOT, 'data', 'export', n), 'utf8')])));
  const facts = rows(out, 'facts.csv');
  expect(facts.length).toBeGreaterThan(1);
  for (const r of [...facts, ...rows(out, 'media.csv')]) {
    expect(r.status).toBe('verified');
    expect(['pending', 'approved', 'edited']).toContain(r.review_state);
    expect(r.review_notice).toBe(REVIEW_NOTICE);
    if (r.review_state !== 'pending') expect(r.review_decision_id && r.review_decision_date).toBeTruthy();
  }
  const doc = JSON.parse(out['provenance.jsonld']);
  expect(doc.description).toBe(REVIEW_NOTICE);
  const claims = doc['@graph'].filter(n => n['@type'] === 'Claim');
  expect(claims.length).toBe(facts.length);
  expect(claims.every(c => c['ihh:status'] === 'verified' && ['pending', 'approved', 'edited'].includes(c['ihh:reviewState']))).toBe(true);
});
