// The hallway (/hall/, real-scan museum Task 5): the five inductees' easels in the King's Hall scan.
// Each easel is labelled with the inductee's name and links to their journey map when it exists; it
// shows the painted portrait only when the portrait passes the licence gate, otherwise a name card.
import { it, expect, describe } from 'vitest';
import { hallView, loadHall } from '../content/hall.js';
import { listPipelineInductees, loadInductee, factIndex, mediaIndex, portraitFiles, listInductees, loadJourney } from '../content/load.js';
import { gatedPortrait } from '../content/portrait.js';
import { loadHomeLines } from '../content/home.js';

const HALL = { scan: 'kings-hall', easels: [
  { slug: 'a', x: -2, z: 0, rotY: 0, group: 'row' },
  { slug: 'b', x: 0, z: 0, rotY: 0, group: 'row' },
] };
const PEOPLE = [{ slug: 'a', name: 'Ada Example' }, { slug: 'b', name: 'Bo Example' }];
const PORTRAIT = { image: '/portraits/a.webp', depth: '/portraits/a-depth.png', alt: 'Painted portrait of Ada Example.', badge: 'AI-assisted painted portrait.' };

describe('hallView', () => {
  it('one numbered easel per inductee, in the file order, labelled with the name', () => {
    const v = hallView({ hall: HALL, inductees: PEOPLE, built: () => true, portraitOf: () => null });
    expect(v.exhibits.map(e => [e.id, e.number, e.title])).toEqual([['a', 1, 'Ada Example'], ['b', 2, 'Bo Example']]);
    expect(v.items.map(i => i.label)).toEqual(['1. Ada Example', '2. Bo Example']);
    expect(v.exhibits[0].easel).toEqual({ x: -2, z: 0, rotY: 0, group: 'row' });
  });
  it('links an easel to the journey map only when the journey exists', () => {
    const v = hallView({ hall: HALL, inductees: PEOPLE, built: s => s === 'a', portraitOf: () => null });
    expect(v.exhibits[0].href).toBe('/a/');
    expect(v.items[0].href).toBe('/a/');
    expect(v.exhibits[1].href).toBeUndefined();
    expect(v.items[1].href).toBeNull();
    expect(v.items[1].comingSoon).toBe(true);
  });
  it('shows the painted portrait only when the licence gate passes it, else a name card', () => {
    const v = hallView({ hall: HALL, inductees: PEOPLE, built: () => true, portraitOf: s => (s === 'a' ? PORTRAIT : null) });
    expect(v.exhibits[0]).toMatchObject({ type: 'framed-photograph', image: '/portraits/a.webp' });
    expect(v.exhibits[1].type).toBe('name-card');
    expect(v.exhibits[1].image).toBeUndefined();
    expect(v.items[0].portrait).toBe(PORTRAIT);
    expect(v.items[1].portrait).toBeNull();
  });
  it('refuses an easel for someone who is not an inductee, and an inductee without an easel', () => {
    expect(() => hallView({ hall: { ...HALL, easels: [...HALL.easels, { slug: 'z', x: 2, z: 0, rotY: 0 }] }, inductees: PEOPLE, built: () => true })).toThrow(/z/);
    expect(() => hallView({ hall: { ...HALL, easels: HALL.easels.slice(0, 1) }, inductees: PEOPLE, built: () => true })).toThrow(/b/);
  });
});

describe('the shipped hallway', () => {
  it('has five easels, one per pipeline inductee, in the King\'s Hall', () => {
    const hall = loadHall();
    expect(hall.scan).toBe('kings-hall');
    const people = listPipelineInductees();
    expect(people.length).toBe(5);
    const withContent = new Set(listInductees());
    const v = hallView({
      hall, inductees: people,
      built: s => withContent.has(s) && Boolean(loadJourney(s)),
      portraitOf: s => (withContent.has(s) ? gatedPortrait(loadInductee(s), { ...factIndex(s), media: mediaIndex(s) }, x => Boolean(portraitFiles(x))) : null),
      lineOf: s => loadHomeLines().get(s), idxOf: factIndex,
    });
    expect(v.exhibits.length).toBe(5);
    expect(new Set(v.exhibits.map(e => e.id))).toEqual(new Set(people.map(p => p.slug)));
    for (const e of v.exhibits) expect(e.title).toBe(people.find(p => p.slug === e.id).name);
    // Einstein's painted portrait passes the gate (EIN-M-0006, verified public domain); his easel links
    // to his journey map. The others have no cleared portrait yet: name cards.
    const ein = v.exhibits.find(e => e.id === 'einstein');
    expect(ein).toMatchObject({ type: 'framed-photograph', image: '/portraits/einstein.webp', href: '/einstein/' });
    for (const e of v.exhibits.filter(x => x.id !== 'einstein')) expect(e.type).toBe('name-card');
    // Every item's one line is the verified home line (content/home.json) with its source chips.
    for (const i of v.items) expect(i.line && i.line.chips.length).toBeGreaterThan(0);
  });
});
