// Home page in the new design system (real-scan museum Task 7): one section per inductee from the
// fact pipeline, built inductees first; a verified one-line fact with its source chip; Explore to the
// journey map and Info to the timeline only where the journey exists, otherwise "Coming soon"; a
// painted portrait only through the licence gate; the hallway linked only once it exists.
import { it, expect, describe } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { homeSections, timelineStops, loadHomeLines, hallHref, initials } from '../content/home.js';
import { listPipelineInductees, factIndex, loadJourney, listChapters, loadChapter } from '../content/load.js';
import { journeyView } from '../content/journey.js';

const fact = (id, claim, status = 'verified') => [id, { id, claim, status, evidence: [{ source_id: 'S1' }] }];
const idx = { facts: new Map([fact('F1', 'Ada Example arrived in 1900.'), fact('F2', 'Bo Example sailed.', 'pending')]),
  sources: new Map([['S1', { id: 'S1', title: 'Record', institution: 'Archive', published: '2001-01-01', url: 'https://example.org/r' }]]) };

describe('homeSections', () => {
  const inductees = [{ slug: 'ada', name: 'Ada Example' }, { slug: 'bo', name: 'Bo Example' }, { slug: 'cy', name: 'Cy Example' }];
  it('one section each; a built inductee links Explore to its journey map and Info to its timeline', () => {
    const s = homeSections({ inductees, lineOf: s => (s === 'ada' ? { fact_id: 'F1', text: 'Ada Example arrived in 1900.' } : undefined), idxOf: () => idx, built: s => s === 'cy' });
    expect(s.map(v => v.slug)).toEqual(['cy', 'ada', 'bo']); // built first
    expect(s[0]).toMatchObject({ explore: '/cy/', info: '/cy/timeline/', comingSoon: false });
    for (const v of s.slice(1)) expect(v).toMatchObject({ explore: null, info: null, comingSoon: true });
  });
  it('the one-line fact is the verified claim itself, with its source chip', () => {
    const [ada] = homeSections({ inductees: inductees.slice(0, 1), lineOf: () => ({ fact_id: 'F1', text: 'Ada Example arrived in 1900.' }), idxOf: () => idx, built: () => true });
    expect(ada.line.text).toBe('Ada Example arrived in 1900.');
    expect(ada.line.chips).toHaveLength(1);
    expect(ada.line.chips[0]).toMatchObject({ factId: 'F1', label: 'Source' });
  });
  it('refuses a fact that is not verified', () => {
    expect(() => homeSections({ inductees: inductees.slice(1, 2), lineOf: () => ({ fact_id: 'F2', text: 'Bo Example sailed.' }), idxOf: () => idx, built: () => true })).toThrow(/verified/);
  });
  // Fix round 1: content/home.json carries the line's text, which must be the claim word for word
  // (tools/content_check.py --home checks the same in the prebuild).
  it('refuses a line whose text is not the claim verbatim', () => {
    expect(() => homeSections({ inductees: inductees.slice(0, 1), lineOf: () => ({ fact_id: 'F1', text: 'Ada Example happily arrived in 1900.' }), idxOf: () => idx, built: () => true })).toThrow(/verbatim/);
  });
  it('a portrait only when the gate passes it, otherwise a name card (initials)', () => {
    const p = { image: '/portraits/ada.webp', alt: 'Painted portrait', badge: 'AI-assisted' };
    const s = homeSections({ inductees, lineOf: () => undefined, idxOf: () => idx, built: () => true, portraitOf: x => (x === 'ada' ? p : null) });
    expect(s.find(v => v.slug === 'ada').portrait).toBe(p);
    expect(s.find(v => v.slug === 'bo').portrait).toBeNull();
    expect(initials('Madeleine Albright')).toBe('MA');
  });
});

describe('the shipped home page data', () => {
  const inductees = listPipelineInductees();
  const lines = loadHomeLines();
  it('covers all five inductees, each with a verified one-line fact of its own', () => {
    expect(inductees.map(i => i.slug).sort()).toEqual(['albright', 'einstein', 'lamarr', 'muir', 'naismith']);
    const s = homeSections({ inductees, lineOf: x => lines.get(x), idxOf: factIndex, built: x => Boolean(loadJourney(x)) });
    expect(s).toHaveLength(5);
    for (const v of s) {
      expect(v.line, v.slug).not.toBeNull();
      expect(v.line.chips[0].factId.startsWith(`${inductees.find(i => i.slug === v.slug).code}-F-`), v.slug).toBe(true);
      // Layout guard only: a card body is sized for a short line. The truth of the text is checked by
      // factChips (verified) and the verbatim rule above, not by its length.
      expect(v.line.text.length).toBeLessThanOrEqual(140);
    }
    expect(s[0]).toMatchObject({ slug: 'einstein', explore: '/einstein/', info: '/einstein/timeline/' });
    expect(s.filter(v => v.comingSoon).map(v => v.slug).sort()).toEqual(['albright', 'lamarr', 'muir', 'naismith']);
  });
  it('links the hallway only when content/hall.json exists', () => {
    const root = mkdtempSync(join(tmpdir(), 'voa-home-'));
    mkdirSync(join(root, 'content'));
    expect(hallHref(root)).toBeNull();
    writeFileSync(join(root, 'content', 'hall.json'), '{}');
    expect(hallHref(root)).toBe('/hall/');
  });
});

describe('timelineStops', () => {
  it('lists the dated stops in journey order with their chips and room links', () => {
    const chapters = new Map(listChapters().filter(c => c.slug === 'einstein').map(c => [c.n, loadChapter('einstein', c.n).title]));
    const { stops } = journeyView(loadJourney('einstein'), factIndex('einstein'), { slug: 'einstein', chapters });
    const t = timelineStops(stops);
    expect(t.length).toBe(stops.filter(s => s.date).length);
    expect(t.length).toBeGreaterThan(0);
    for (const s of t) {
      expect(s.date).toBeTruthy();
      expect(s.chips.length).toBeGreaterThan(0);
    }
    const years = t.map(s => Number(/\d{4}/.exec(s.date)[0]));
    expect([...years].sort((a, b) => a - b)).toEqual(years);
    const withRoom = t.filter(s => s.room);
    expect(withRoom.length).toBe(chapters.size);
    for (const s of withRoom) expect(s.room.href).toMatch(/^\/einstein\/\d+\/$/);
  });
  it('leaves out undated stops', () => {
    const t = timelineStops([{ id: 'a', date: null, label: 'A', chips: [], lines: [] }, { id: 'b', date: '1900', label: 'B', chips: [], lines: [], href: null }]);
    expect(t.map(s => s.id)).toEqual(['b']);
  });
});
