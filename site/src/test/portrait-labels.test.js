import { describe, it, expect } from 'vitest';
import { portraitBadge, portraitAlt, voiceLabel, portraitFromMedia, gatedPortrait, quoteViews } from '../content/portrait.js';

const name = 'Albert Einstein';
const media = new Map([
  ['M1', { id: 'M1', status: 'verified', license_class: 'public-domain', source_ids: ['S1'],
    rights_statement: 'No known restrictions on publication.' }],
  ['M2', { id: 'M2', status: 'verified', license_class: 'unknown', source_ids: ['S1'], rights_statement: 'x' }],
]);
const sources = new Map([
  ['S1', { id: 'S1', title: 'Albert Einstein, 1879-1955', institution: 'Library of Congress', published: '1947', accessed: '2026-10-09' }],
  ['S2', { id: 'S2', title: 'Letter to Franklin D. Roosevelt', institution: 'FDR Library', published: '1939-08-02' }],
]);
const facts = new Map([
  ['F1', { id: 'F1', status: 'verified', is_direct_quote: true, claim: 'Words.', evidence: [{ source_id: 'S2' }] }],
  ['F2', { id: 'F2', status: 'verified', is_direct_quote: false, claim: 'Words.', evidence: [{ source_id: 'S2' }] }],
]);

describe('portrait labels', () => {
  it('badge follows B4 section 4 word for word', () => {
    expect(portraitBadge({ name, holder: 'Library of Congress', year: '1947', rights: 'No known restrictions on publication.' }))
      .toBe('AI-assisted painted portrait. Our software painted it from a photograph (Library of Congress, 1947; '
        + 'No known restrictions on publication). Movement is added with an AI depth estimate; no face or expression '
        + 'is generated. Albert Einstein did not pose for or approve this image.');
  });
  it('alt text pattern: a photo date only when the holder gives one, else the source date with its kind', () => {
    expect(portraitAlt({ name, holder: 'Library of Congress', year: '1947', dateKind: 'photographed' }))
      .toBe('Painted portrait of Albert Einstein, based on a 1947 photograph from Library of Congress.');
    expect(portraitAlt({ name, holder: 'Library of Congress', year: '1947', dateKind: 'published' }))
      .toBe('Painted portrait of Albert Einstein, based on a photograph from Library of Congress, published 1947.');
    expect(() => portraitAlt({ name, holder: 'Library of Congress', year: '1947' })).toThrow(/dateKind/);
  });
  it('voice label', () => {
    expect(voiceLabel({ name, source: 'Letter to Franklin D. Roosevelt', date: '1939-08-02' }))
      .toBe("AI-generated voice, not Albert Einstein's voice. Words: Albert Einstein, Letter to Franklin D. Roosevelt, 1939-08-02.");
  });
  it('rejects empty fields instead of printing a gap', () => {
    expect(() => portraitBadge({ name, holder: '', year: '1947', rights: 'x' })).toThrow(/holder/);
    expect(() => voiceLabel({ name, source: 'x' })).toThrow(/date/);
  });
});

describe('portrait views', () => {
  const files = { image: '/portraits/x.webp', depth: '/portraits/x-depth.png' };
  it('builds from the photo record and its source', () => {
    const v = portraitFromMedia(media.get('M1'), sources, name, files);
    expect(v.badge).toContain('(Library of Congress, published 1947;');
    expect(v.alt).toBe('Painted portrait of Albert Einstein, based on a photograph from Library of Congress, published 1947.');
    const dated = portraitFromMedia({ ...media.get('M1'), notes: 'Photo date as stated by the holder (Date field): 1946.' }, sources, name, files);
    expect(dated.alt).toBe('Painted portrait of Albert Einstein, based on a 1946 photograph from Library of Congress.');
    expect(dated.badge).toContain('(Library of Congress, 1946;');
    expect(v.image).toBe(files.image);
  });
  it('gate: an unusable photo licence gives no portrait at all (nothing emitted, nothing shown)', () => {
    const exists = () => true;
    expect(gatedPortrait({ slug: 'x', name, portrait: { media_id: 'M2' } }, { media, sources }, exists)).toBeNull();
    expect(gatedPortrait({ slug: 'x', name, portrait: { media_id: 'NOPE' } }, { media, sources }, exists)).toBeNull();
    expect(gatedPortrait({ slug: 'x', name }, { media, sources }, exists)).toBeNull();
    expect(gatedPortrait({ slug: 'x', name, portrait: { media_id: 'M1' } }, { media, sources }, () => false)).toBeNull();
    const v = gatedPortrait({ slug: 'x', name, portrait: { media_id: 'M1' } }, { media, sources }, exists);
    expect(v).toMatchObject({ image: '/portraits/x.webp', depth: '/portraits/x-depth.png' });
    expect(v.badge).toContain('Library of Congress, published 1947');
  });
  it('quotes need a verified direct-quote fact, verbatim text, and get a voice label', () => {
    const idx = { facts, sources };
    const audio = () => true;
    const [q] = quoteViews([{ id: 'q1', text: 'Words.', fact_id: 'F1', voice: 'einstein-ai' }], idx, { name, slug: 'einstein', n: 1, hasAudio: audio });
    expect(q.voiceLabel).toBe("AI-generated voice, not Albert Einstein's voice. Words: Albert Einstein, Letter to Franklin D. Roosevelt, 1939-08-02.");
    expect(q.audio).toEqual({ mp3: '/audio/einstein/1-q1.mp3', vtt: '/audio/einstein/1-q1.vtt' });
    expect(() => quoteViews([{ id: 'q1', text: 'Words.', fact_id: 'F2', voice: 'einstein-ai' }], idx, { name, slug: 'einstein', n: 1, hasAudio: audio })).toThrow(/direct-quote/);
    expect(() => quoteViews([{ id: 'q1', text: 'Word.', fact_id: 'F1', voice: 'einstein-ai' }], idx, { name, slug: 'einstein', n: 1, hasAudio: audio })).toThrow(/verbatim/);
    const [noAudio] = quoteViews([{ id: 'q1', text: 'Words.', fact_id: 'F1', voice: 'einstein-ai' }], idx, { name, slug: 'einstein', n: 1, hasAudio: () => false });
    expect(noAudio.audio).toBeNull();
  });
});

describe('quote attribution', () => {
  const f = new Map([...facts,
    ['FA', { id: 'FA', status: 'verified', claim: 'Albert Einstein signed a letter to President F. D. Roosevelt in August 1939.', evidence: [{ source_id: 'S1' }] }],
    ['FB', { id: 'FB', status: 'single-source', claim: 'x', evidence: [{ source_id: 'S1' }] }]]);
  const ix = { facts: f, sources, media };
  const q = attribution => ({ id: 'q1', text: 'Words.', fact_id: 'F1', voice: 'einstein-ai', attribution });
  it('names the words by their grounded attribution, with chips for its facts', () => {
    const [v] = quoteViews([q({ source: 'signed letter to President F. D. Roosevelt', date: 'August 1939', fact_ids: ['FA'] })], ix,
      { name, slug: 'einstein', n: 1, hasAudio: () => true });
    expect(v.voiceLabel).toBe("AI-generated voice, not Albert Einstein's voice. Words: Albert Einstein, signed letter to President F. D. Roosevelt, August 1939.");
    expect(v.attributionChips.map(c => c.factId)).toEqual(['FA']);
  });
  it('refuses an attribution without verified facts', () => {
    expect(() => quoteViews([q({ source: 's', date: 'd', fact_ids: [] })], ix, { name, slug: 'einstein', n: 1, hasAudio: () => true })).toThrow(/attribution/);
    expect(() => quoteViews([q({ source: 's', date: 'd', fact_ids: ['FB'] })], ix, { name, slug: 'einstein', n: 1, hasAudio: () => true })).toThrow(/FB/);
  });
});
