import { it, expect } from 'vitest';
import { reconstructionView, parseJsonl, sourceDate, chipLabel, factChips, exhibitView, loadChapter, loadInductee, factIndex, mediaIndex, listChapters } from '../content/load.js';

const facts = new Map([
  ['F1', { id: 'F1', status: 'verified', claim: 'A arrived in 1933.', evidence: [{ source_id: 'S1' }, { source_id: 'S2' }, { source_id: 'S1' }] }],
  ['F2', { id: 'F2', status: 'disputed', claim: 'x', evidence: [{ source_id: 'S1' }] }],
  ['F3', { id: 'F3', status: 'verified', claim: 'y', evidence: [{ source_id: 'S9' }] }],
]);
const sources = new Map([
  ['S1', { id: 'S1', title: 'Record', institution: 'Archive', published: null, accessed: '2026-10-08', url: 'https://a.example/1' }],
  ['S2', { id: 'S2', title: 'Article', institution: 'Museum', published: '2020-01-02', accessed: '2026-10-09', url: 'https://b.example/2' }],
]);
const media = new Map([
  ['M1', { id: 'M1', title: 'Portrait of A, studio, 1921', status: 'verified', license_class: 'cc0', rights_statement: 'CC0', credit: 'Holder; gift', url: 'https://holder.example/obj', source_ids: ['S2'] }],
  ['M2', { id: 'M2', status: 'verified', license_class: 'in-copyright', url: 'https://x.example' }],
]);
const idx = { facts, sources, media };

it('parses JSONL, skipping blank lines', () => {
  expect(parseJsonl('{"a":1}\n\n{"a":2}\n')).toEqual([{ a: 1 }, { a: 2 }]);
});

it('prefers the published date and falls back to the accessed date', () => {
  expect(sourceDate(sources.get('S2'))).toEqual({ date: '2020-01-02', kind: 'published' });
  expect(sourceDate(sources.get('S1'))).toEqual({ date: '2026-10-08', kind: 'accessed' });
});

it('builds one chip per fact with its unique evidence sources in order', () => {
  const chips = factChips(['F1'], idx);
  expect(chips).toEqual([{
    factId: 'F1', label: 'Sources (2)', name: 'Sources (2) for: A arrived in 1933.',
    sources: [
      { id: 'S1', title: 'Record', institution: 'Archive', date: '2026-10-08', dateKind: 'accessed', url: 'https://a.example/1' },
      { id: 'S2', title: 'Article', institution: 'Museum', date: '2020-01-02', dateKind: 'published', url: 'https://b.example/2' },
    ],
  }]);
});

it('labels chips in plain language by source count', () => {
  expect(chipLabel(1)).toBe('Source');
  expect(chipLabel(2)).toBe('Sources (2)');
  expect(chipLabel(7)).toBe('Sources (7)');
});

it('refuses unknown, unverified or unsourced facts', () => {
  expect(() => factChips(['NOPE'], idx)).toThrow(/unknown fact NOPE/);
  expect(() => factChips(['F2'], idx)).toThrow(/F2.*verified/);
  expect(() => factChips(['F3'], idx)).toThrow(/unknown source S9/);
});

it('assembles the panel view of an exhibit from records only', () => {
  const ex = { id: 'ex1', number: 1, type: 'framed-photograph', media_id: 'M1', original_media_id: 'M1', title: 'A arrived in 1933.',
    title_fact_ids: ['F1'], notes: [{ text: 'A arrived in 1933.', fact_ids: ['F1'] }], evidence: 'record' };
  const v = exhibitView(ex, idx);
  expect(v).toMatchObject({
    id: 'ex1', number: 1, label: '1. A arrived in 1933.', title: 'A arrived in 1933.', type: 'framed-photograph',
    media: { kind: 'image', src: '/media/M1.jpg', alt: 'Portrait of A, studio, 1921' },
    credit: 'Holder; gift', rights: 'CC0', evidence: 'Original record', originalUrl: 'https://holder.example/obj', reconstruction: null,
  });
  expect(v.titleChips[0].factId).toBe('F1');
  expect(v.notes[0].chips[0].sources).toHaveLength(2);
});

it('gives 360 documents a model-viewer GLB and a reconstruction note from the original record source', () => {
  const ex = { id: 'ex2', number: 2, type: '360-document', media_id: 'M1', original_media_id: 'M1', title: 'A arrived in 1933.', title_fact_ids: ['F1'], notes: [], evidence: 'record' };
  const v = exhibitView(ex, idx);
  expect(v.media).toEqual({ kind: 'model', src: '/media/M1.glb', alt: 'Portrait of A, studio, 1921' });
  expect(v.reconstruction).toBe('Reconstruction based on Article, Museum, published 2020-01-02');
  expect(v.plainBack).toBe(true); // no back page named: the panel says the back is plain paper
  const both = exhibitView({ ...ex, pages: [3, 4] }, idx, { sizeOf: () => null });
  expect(both.plainBack).toBe(false);
  const accessed = exhibitView({ ...ex, media_id: 'M4', original_media_id: 'M4' }, { facts, sources, media: new Map([['M4', { ...media.get('M1'), id: 'M4', source_ids: ['S1'] }]]) });
  expect(accessed.reconstruction).toBe('Reconstruction based on Record, Archive, accessed 2026-10-08');
});

it('refuses media with no title to describe the image', () => {
  const m = new Map([['M3', { id: 'M3', status: 'verified', license_class: 'cc0', url: 'https://x.example', source_ids: ['S2'] }]]);
  const ex = { id: 'ex4', number: 4, type: 'framed-photograph', media_id: 'M3', original_media_id: 'M3', title: 't', title_fact_ids: ['F1'], notes: [] };
  expect(() => exhibitView(ex, { facts, sources, media: m })).toThrow(/M3.*title/);
});

it('refuses media that is not verified with a usable licence', () => {
  const ex = { id: 'ex3', number: 3, type: 'framed-document', media_id: 'M2', original_media_id: 'M2', title: 't', title_fact_ids: ['F1'], notes: [] };
  expect(() => exhibitView(ex, idx)).toThrow(/M2/);
});

it('loads the einstein content from the repo with real records', () => {
  const ch = loadChapter('einstein', 1);
  expect(ch.id).toBe('einstein-1');
  expect(loadInductee('einstein').name).toBe('Albert Einstein');
  const fi = factIndex('einstein');
  expect(fi.facts.get('EIN-F-0016').claim).toBe('Albert Einstein became a United States citizen in 1940.');
  expect(fi.sources.get('EIN-S-0004')).toBeDefined();
  const v = exhibitView(ch.exhibits[0], { ...fi, media: mediaIndex('einstein') });
  expect(v.originalUrl).toBe('https://www.loc.gov/item/2004671908/');
  expect(v.media.alt).toBe('Albert Einstein, 1879-1955');
  expect(v.evidence).toBe('Original photograph');
  expect(listChapters()).toEqual(expect.arrayContaining([{ slug: 'einstein', n: 1 }, { slug: 'einstein', n: 2 }]));
});

const place = { w: 4, d: 5, h: 3, unseen: ['south'], items: [{ kind: 'desk', x: 0, z: -1, rotY: 0, w: 1.2, d: 0.6, h: 0.75, basis: 'M1' }] };
it('reconstruction plaque cites each basis photo record with holder, dated source and original link', () => {
  const v = reconstructionView({ basis_media_ids: ['M1'], basis_fact_ids: ['F1'], note: 'A arrived in 1933.', place }, idx);
  expect(v.basis).toEqual([{ id: 'M1', title: 'Portrait of A, studio, 1921', holder: 'Museum', date: '2020-01-02', dateKind: 'published',
    credit: 'Holder; gift', url: 'https://holder.example/obj', label: 'Portrait of A, studio, 1921, Museum, published 2020-01-02' }]);
  expect(v.note.text).toBe('A arrived in 1933.');
  expect(v.note.chips[0].factId).toBe('F1');
  expect(v.unseen).toEqual(['south']);
});
it('reconstruction plaque refuses unusable basis media, invalid places and unverified or missing note facts', () => {
  expect(() => reconstructionView({ basis_media_ids: [], place }, idx)).toThrow(/basis_media_ids/);
  expect(() => reconstructionView({ basis_media_ids: ['M2'], place: { ...place, items: [{ ...place.items[0], basis: 'M2' }] } }, idx)).toThrow(/M2 is not verified/);
  expect(() => reconstructionView({ basis_media_ids: ['M2'], place }, idx)).toThrow(/basis M1 is not one of/);
  expect(() => reconstructionView({ basis_media_ids: ['M1'], basis_fact_ids: ['F2'], place }, idx)).toThrow(/F2 is disputed/);
  expect(() => reconstructionView({ basis_media_ids: ['M1'], note: 'A arrived in 1933.', place }, idx)).toThrow(/note needs basis_fact_ids/);
  const frame = [{ id: 'exA', type: 'framed-photograph', wall: 'north', slot: 2 }];
  const win = { kind: 'window', x: -0.4, z: -2.47, y: 1, rotY: 0, w: 1, d: 0.06, h: 1.2, basis: 'M1' };
  expect(() => reconstructionView({ basis_media_ids: ['M1'], place: { ...place, items: [...place.items, win] } }, idx, frame)).toThrow(/exhibit exA: covers item 1 \(window\)/);
});

import { evidenceLabel, EVIDENCE_LABELS, jpegSize } from '../content/load.js';
import { exhibitFiles } from '../museum/mediafiles.js';

it('maps the evidence enum to plain language and refuses unknown values', () => {
  expect(evidenceLabel('record')).toBe('Original record');
  expect(evidenceLabel('photograph')).toBe('Original photograph');
  expect(evidenceLabel('reconstruction')).toBe('Reconstruction');
  expect(Object.keys(EVIDENCE_LABELS).sort()).toEqual(['photograph', 'reconstruction', 'record']);
  expect(evidenceLabel(undefined)).toBe(null);
  expect(() => evidenceLabel('rumour')).toThrow(/evidence rumour/);
  const ex = { id: 'ex1', number: 1, type: 'framed-photograph', media_id: 'M1', original_media_id: 'M1', title: 'A arrived in 1933.', title_fact_ids: ['F1'], notes: [], evidence: 'record' };
  expect(exhibitView(ex, idx, { sizeOf: () => null }).evidence).toBe('Original record');
});

// Minimal baseline JPEG header: SOI, an APP0 segment, then SOF0 with height 300 and width 200.
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x01, 0x2c, 0x00, 0xc8, 0x03, 0x01, 0x22, 0x00]);
it('reads JPEG dimensions from the frame header, null for anything else', () => {
  expect(jpegSize(jpeg)).toEqual({ width: 200, height: 300 });
  expect(jpegSize(Buffer.from('not a jpeg'))).toBe(null);
  expect(jpegSize(Buffer.from([0xff, 0xd8, 0xff]))).toBe(null);
});

it('panel images carry width and height from the media file when known', () => {
  const ex = { id: 'ex1', number: 1, type: 'framed-photograph', media_id: 'M1', original_media_id: 'M1', title: 'A arrived in 1933.', title_fact_ids: ['F1'], notes: [], evidence: 'record' };
  expect(exhibitView(ex, idx, { sizeOf: key => (key === 'M1' ? { width: 200, height: 300 } : null) }).media)
    .toEqual({ kind: 'image', src: '/media/M1.jpg', alt: 'Portrait of A, studio, 1921', width: 200, height: 300 });
  expect(exhibitView(ex, idx, { sizeOf: () => null }).media).toEqual({ kind: 'image', src: '/media/M1.jpg', alt: 'Portrait of A, studio, 1921' });
});

it('names exhibit files by media id and page', () => {
  expect(exhibitFiles({ type: 'framed-photograph', media_id: 'M1' })).toEqual({ front: 'M1', back: null, model: null });
  expect(exhibitFiles({ type: 'framed-document', media_id: 'M1', page: 2 })).toEqual({ front: 'M1-p2', back: null, model: null });
  expect(exhibitFiles({ type: '360-document', media_id: 'M1', pages: [3, 4] })).toEqual({ front: 'M1-p3', back: 'M1-p4', model: 'M1-p3-4' });
  expect(exhibitFiles({ type: '360-document', media_id: 'M1', pages: [1] })).toEqual({ front: 'M1-p1', back: null, model: 'M1-p1' });
  expect(exhibitFiles({ type: '360-document', media_id: 'M1' })).toEqual({ front: 'M1', back: null, model: 'M1' });
  expect(exhibitFiles({ type: 'wall-quote', quote_id: 'q1' })).toEqual({ front: null, back: null, model: null });
});

it('a 360 document of chosen pages uses its page GLB', () => {
  const ex = { id: 'ex2', number: 2, type: '360-document', media_id: 'M1', original_media_id: 'M1', pages: [3, 4], title: 'A arrived in 1933.', title_fact_ids: ['F1'], notes: [], evidence: 'record' };
  expect(exhibitView(ex, idx, { sizeOf: () => null }).media).toEqual({ kind: 'model', src: '/media/M1-p3-4.glb', alt: 'Portrait of A, studio, 1921' });
});

import { photoDate } from '../content/load.js';
it('reads the holder photo date only from the record\'s explicit marker', () => {
  expect(photoDate({ notes: 'Photo date as stated by the holder (Date field): 1954. Interior photograph usable.' })).toBe('1954');
  expect(photoDate({ notes: 'x\nPhoto date as stated by the holder (Date field): 1943-07-24.' })).toBe('1943-07-24');
  expect(photoDate({ notes: 'Taken around 1954.' })).toBe(null);
  expect(photoDate({})).toBe(null);
});
it('plaque shows the holder photo date where the media record carries it', () => {
  const m = new Map([['M1', { ...media.get('M1'), notes: 'Photo date as stated by the holder (Date field): 1954.' }]]);
  const v = reconstructionView({ basis_media_ids: ['M1'], place }, { facts, sources, media: m });
  expect(v.basis[0]).toMatchObject({ date: '1954', dateKind: 'photographed', label: 'Portrait of A, studio, 1921, Museum, photographed 1954' });
});

import { photoDatesLine } from '../content/load.js';
it('states the span of holder photo dates, and how many basis photos have none', () => {
  const b = (...kinds) => kinds.map(([dateKind, date]) => ({ dateKind, date }));
  expect(photoDatesLine(b(['photographed', '1954'], ['photographed', '1943'], ['photographed', '1954']))).toBe('The source photographs were taken in 1943 and 1954.');
  expect(photoDatesLine(b(['photographed', '1943'], ['photographed', '1950'], ['photographed', '1954']))).toBe('The source photographs were taken in 1943, 1950 and 1954.');
  expect(photoDatesLine(b(['photographed', '1954'], ['photographed', '1954']))).toBe(null);
  expect(photoDatesLine(b(['accessed', '2026-10-09']))).toBe(null);
  expect(photoDatesLine(b(['photographed', '1954'], ['accessed', '2026-10-09'], ['accessed', '2026-10-09'])))
    .toBe('Source photographs with a holder photo date were taken in 1954; 2 have no photo date in their records.');
  expect(photoDatesLine(b(['photographed', '1943'], ['photographed', '1954'], ['published', '1950'])))
    .toBe('Source photographs with a holder photo date were taken in 1943 and 1954; 1 has no photo date in its record.');
});
it('plaque view carries the photo-dates line', () => {
  const m = new Map([['M1', { ...media.get('M1'), notes: 'Photo date as stated by the holder (Date field): 1954.' }]]);
  expect(reconstructionView({ basis_media_ids: ['M1'], place }, { facts, sources, media: m }).datesLine).toBe(null);
});

// CC BY / CC BY-SA ask the user to link the licence and to say whether the work was changed: the
// exhibit view carries the holder's licence URL and the change our build makes (a resize), and only for
// those licences; public-domain and CC0 items carry neither.
it('a CC BY exhibit carries its licence link and the change made; other licences do not', () => {
  const ccby = { id: 'M5', title: 'Arriving, 1930', status: 'verified', license_class: 'cc-by', credit: 'Holder. CC BY 4.0.',
    rights_statement: 'This work is licensed under CC BY 4.0.', rights_url: 'https://creativecommons.org/licenses/by/4.0', url: 'https://holder.example/m5', source_ids: ['S2'] };
  const ex = { id: 'ex1', number: 1, type: 'framed-photograph', media_id: 'M5', original_media_id: 'M5', title: 'A', title_fact_ids: ['F1'], notes: [], evidence: 'photograph' };
  const v = exhibitView(ex, { facts, sources, media: new Map([['M5', ccby]]) }, { sizeOf: () => null });
  expect(v.licence).toEqual({ url: 'https://creativecommons.org/licenses/by/4.0', name: 'CC BY 4.0', workTitle: 'Arriving, 1930', changes: 'Resized from the holder’s file.' });
  const pd = exhibitView({ ...ex, media_id: 'M1', original_media_id: 'M1' }, idx, { sizeOf: () => null });
  expect(pd.licence).toBeNull();
  // A CC BY item without a licence URL is refused rather than shown without its licence link.
  expect(() => exhibitView(ex, { facts, sources, media: new Map([['M5', { ...ccby, rights_url: null }]]) }, { sizeOf: () => null })).toThrow(/M5.*licence/);
});

// Chips side by side need names a screen reader can tell apart: the visible label first (so speech
// input matches it), then the start of the fact's claim.
it('each chip has an accessible name: its visible label, then the start of its claim', () => {
  const long = new Map([...facts, ['F7', { id: 'F7', status: 'verified', claim: 'One two three four five six seven eight nine.', evidence: [{ source_id: 'S1' }] }]]);
  const [a, b] = factChips(['F1', 'F7'], { facts: long, sources });
  expect(a.name).toBe('Sources (2) for: A arrived in 1933.');
  expect(b.name).toBe('Source for: One two three four five six\u2026');
  expect(b.name.startsWith(b.label)).toBe(true);
  expect(a.name).not.toBe(b.name);
});

// A CC BY item's licence line names the licence ("CC BY 4.0", from the licence URL) and carries the
// holder's own title of the work; a licence URL that names no known CC licence is refused.
it('a CC BY licence line names the licence and the holder\u2019s title', () => {
  const rec = { id: 'M6', title: 'Arriving by ship, 1930', status: 'verified', license_class: 'cc-by', credit: 'Holder.',
    rights_statement: 'CC BY 4.0', rights_url: 'https://creativecommons.org/licenses/by/4.0', url: 'https://holder.example/m6', source_ids: ['S2'] };
  const ex = { id: 'ex1', number: 1, type: 'framed-photograph', media_id: 'M6', original_media_id: 'M6', title: 'A', title_fact_ids: ['F1'], notes: [], evidence: 'photograph' };
  const v = exhibitView(ex, { facts, sources, media: new Map([['M6', rec]]) }, { sizeOf: () => null });
  expect(v.licence).toMatchObject({ url: rec.rights_url, name: 'CC BY 4.0', workTitle: 'Arriving by ship, 1930' });
  const sa = exhibitView(ex, { facts, sources, media: new Map([['M6', { ...rec, license_class: 'cc-by-sa', rights_url: 'https://creativecommons.org/licenses/by-sa/4.0/' }]]) }, { sizeOf: () => null });
  expect(sa.licence.name).toBe('CC BY-SA 4.0');
  expect(() => exhibitView(ex, { facts, sources, media: new Map([['M6', { ...rec, rights_url: 'https://example.org/licence' }]]) }, { sizeOf: () => null })).toThrow(/M6/);
});

// A photograph dated by its holder shows that wording with the exhibit (the room says the dates are
// the holder's); an exhibit without one has none.
it('an exhibit carries its holder date when the chapter gives one', () => {
  const ex = { id: 'ex1', number: 1, type: 'framed-photograph', media_id: 'M1', original_media_id: 'M1', title: 'A', title_fact_ids: ['F1'], notes: [], evidence: 'photograph' };
  expect(exhibitView({ ...ex, holder_date: 'between 1921 and 1923' }, idx, { sizeOf: () => null }).holderDate).toBe('between 1921 and 1923');
  expect(exhibitView(ex, idx, { sizeOf: () => null }).holderDate).toBeNull();
});

// Task 5 review (I3), Task 6: the study's plaque waited for its recreated corner; the corner now
// exists (content/einstein/study-corner.json, its plaque checked in study-corner.test.js). Fix round 1:
// the study's old reconstructed-place record is retired (the place is not on show; the corner has its
// own record), so chapter 2 carries no reconstruction block.
import { hasStudyCorner } from '../content/load.js';
it('the study corner exists; the study\'s retired reconstruction record is gone', () => {
  expect(hasStudyCorner('einstein')).toBe(true);
  const ch = loadChapter('einstein', 2);
  expect(typeof ch.room).toBe('object');
  expect(ch).not.toHaveProperty('reconstruction');
});
