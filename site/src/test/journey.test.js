import { it, expect } from 'vitest';
import { journeyView, quizView, otherInductees, stopCard, globeStops, roomDoors, chaptersInJourneyOrder } from '../content/journey.js';
import { loadJourney, loadQuiz, factIndex, listChapters, aerialManifest, loadChapter } from '../content/load.js';

const loadChapterTitle = n => loadChapter('einstein', n).title;

const facts = new Map([
  ['F1', { id: 'F1', status: 'verified', claim: 'A was born in Graz in 1901.', evidence: [{ source_id: 'S1' }] }],
  ['F2', { id: 'F2', status: 'single-source', claim: 'x', evidence: [{ source_id: 'S1' }] }],
]);
const sources = new Map([['S1', { id: 'S1', title: 'Record', institution: 'Archive', published: '2001', url: 'https://a.example/1' }]]);
const idx = { facts, sources };
const stop = { id: 'graz', label: 'Graz', date: '1901', fact_ids: ['F1'], lines: [{ text: 'A was born in Graz in 1901.', fact_ids: ['F1'] }], map: { x: 10, y: 20 } };

it('numbers stops in order and links only to chapters that exist', () => {
  const v = journeyView({ stops: [stop, { ...stop, id: 'b', chapter: 1 }, { ...stop, id: 'c', chapter: 9 }] }, idx,
    { slug: 'a', chapters: new Map([[1, 'Room one']]) });
  expect(v.stops.map(s => s.number)).toEqual([1, 2, 3]);
  expect(v.stops[0].href).toBeNull();
  expect(v.stops[1]).toMatchObject({ href: '/a/1/', chapterTitle: 'Room one' });
  expect(v.stops[2].href).toBeNull();
  expect(v.stops[0].chips[0].factId).toBe('F1');
  expect(v.stops[0].lines[0]).toMatchObject({ text: 'A was born in Graz in 1901.' });
});

it('refuses a stop or quiz option that cites an unverified fact', () => {
  expect(() => journeyView({ stops: [{ ...stop, fact_ids: ['F2'] }] }, idx, { slug: 'a', chapters: new Map() })).toThrow(/verified/);
  const quiz = [{ id: 'q', question: 'A was born in ___.', question_fact_ids: ['F1'],
    options: [{ text: 'Graz', correct: true, explanation: 'e', fact_ids: ['F1'] }, { text: 'B', correct: false, explanation: 'e', fact_ids: ['F2'] }] }];
  expect(() => quizView(quiz, idx)).toThrow(/verified/);
});

it('quiz view carries chips per option and the runtime data scoreAnswer needs', () => {
  const quiz = [{ id: 'q', question: 'A was born in ___.', question_fact_ids: ['F1'],
    options: [{ text: 'Graz', correct: true, explanation: 'A was born in Graz in 1901.', fact_ids: ['F1'] }, { text: 'Linz', correct: false, explanation: 'A was born in Graz in 1901.', fact_ids: ['F1'] }] }];
  const v = quizView(quiz, idx);
  expect(v.questions[0].options[0].chips[0].sources[0].url).toBe('https://a.example/1');
  expect(v.runtime).toEqual([{ id: 'q', options: [
    { text: 'Graz', correct: true, explanation: 'A was born in Graz in 1901.', fact_ids: ['F1'] },
    { text: 'Linz', correct: false, explanation: 'A was born in Graz in 1901.', fact_ids: ['F1'] }] }]);
});

it('lists the other inductees by their pipeline names, linked only when their content exists', () => {
  const others = otherInductees('einstein');
  expect(others.map(o => o.slug)).toEqual(['albright', 'lamarr', 'muir', 'naismith']);
  expect(others.every(o => o.name && o.href === null)).toBe(true);
});

it('the shipped Einstein journey and quiz build from verified facts', () => {
  const ix = factIndex('einstein');
  const chapters = new Map(listChapters().filter(c => c.slug === 'einstein').map(c => [c.n, `ch${c.n}`]));
  const j = journeyView(loadJourney('einstein'), ix, { slug: 'einstein', chapters });
  // Every stop that names a room links to it, in journey order, and every shipped room is reached.
  const shipped = loadJourney('einstein').stops;
  expect(j.stops.filter(s => s.href).map(s => s.href)).toEqual(shipped.filter(s => s.chapter).map(s => `/einstein/${s.chapter}/`));
  expect([...new Set(j.stops.filter(s => s.href).map(s => s.href))].sort()).toEqual([...chapters.keys()].sort().map(n => `/einstein/${n}/`));
  const quiz = quizView(loadQuiz('einstein'), ix);
  expect(quiz.questions.length).toBeGreaterThanOrEqual(2);
  for (const q of quiz.runtime) expect(q.options.filter(o => o.correct)).toHaveLength(1);
});

it('a stop without a place on the map is listed but not drawn, and may have no date', () => {
  const { map, date, ...bare } = stop;
  const v = journeyView({ stops: [stop, { ...bare, id: 'b' }] }, idx, { slug: 'a', chapters: new Map() });
  expect(v.stops[0]).toMatchObject({ x: 10, y: 20, onMap: true, heading: 'Graz, 1901' });
  expect(v.stops[1]).toMatchObject({ x: null, y: null, onMap: false, heading: 'Graz' });
  expect(v.mapped.map(s => s.id)).toEqual(['graz']);
});

it('the shipped journey draws only stops whose own fact names the place', () => {
  const j = journeyView(loadJourney('einstein'), factIndex('einstein'), { slug: 'einstein', chapters: new Map([[1, 'a'], [2, 'b']]) });
  // Exactly the shipped stops with a map entry, in order (content_check proves each one's fact names
  // its place); none dropped, none added by the view.
  const shipped = loadJourney('einstein').stops;
  expect(j.mapped.map(s => s.id)).toEqual(shipped.filter(s => s.map).map(s => s.id));
  expect(j.mapped.length).toBeGreaterThan(0);
  expect(j.stops.filter(s => !s.onMap).map(s => s.id)).toEqual(shipped.filter(s => !s.map).map(s => s.id));
});

const placed = { ...stop, map: { x: 10, y: 20, lat: 47.07, lon: 15.44, coord_source: 'https://www.wikidata.org/wiki/Q13298' } };

it('a mapped stop carries the published coordinates of its place and their source; an unmapped one none', () => {
  const { map, ...bare } = stop;
  const v = journeyView({ stops: [placed, { ...bare, id: 'b' }] }, idx, { slug: 'a', chapters: new Map() });
  expect(v.stops[0]).toMatchObject({ lat: 47.07, lon: 15.44, coordSource: 'https://www.wikidata.org/wiki/Q13298' });
  expect(v.stops[1]).toMatchObject({ lat: null, lon: null, coordSource: null });
});

// Journey flow (2026-10-10 spec): the globe also needs each pinned stop's room (for the aerial
// zoom's "Enter the room" link) and its aerial stack, when one was built; nothing else.
it('the globe gets only the mapped stops, in order, with their list numbers, room and aerial stack', () => {
  const { map, ...bare } = stop;
  const v = journeyView({ stops: [{ ...bare, id: 'first' }, placed, { ...placed, id: 'c', label: 'Graz', chapter: 1 }] }, idx,
    { slug: 'a', chapters: new Map([[1, 'Room one']]) });
  expect(globeStops(v.mapped)).toEqual([
    { id: 'graz', number: 2, label: 'Graz', lat: 47.07, lon: 15.44 },
    { id: 'c', number: 3, label: 'Graz', lat: 47.07, lon: 15.44, room: { href: '/a/1/', text: 'Enter the room: Room one' } },
  ]);
  const aerialOf = id => (id === 'graz' ? '/aerial/a/graz/manifest.json' : null);
  expect(globeStops(v.mapped, { aerialOf }).map(s => s.aerial)).toEqual(['/aerial/a/graz/manifest.json', undefined]);
});

it('every shipped pinned stop has its aerial stack on the globe', () => {
  const j = journeyView(loadJourney('einstein'), factIndex('einstein'), { slug: 'einstein', chapters: new Map() });
  const g = globeStops(j.mapped, { aerialOf: id => aerialManifest('einstein', id) });
  expect(g.map(s => s.aerial)).toEqual(g.map(s => `/aerial/einstein/${s.id}/manifest.json`));
  expect(aerialManifest('einstein', 'no-such-stop')).toBeNull();
});

it('the stop card shows exactly what the stop list shows: heading, cited lines with chips, room link', () => {
  const v = journeyView({ stops: [placed, { ...placed, id: 'c', chapter: 1 }] }, idx, { slug: 'a', chapters: new Map([[1, 'Room one']]) });
  const card = stopCard(v.stops[0]);
  expect(card).toEqual({
    id: 'graz', number: 1, heading: 'Graz, 1901', chips: v.stops[0].chips,
    lines: [{ text: 'A was born in Graz in 1901.', chips: v.stops[0].lines[0].chips }], room: null,
    coords: { href: 'https://www.wikidata.org/wiki/Q13298', text: 'Published coordinates of Graz' },
  });
  const { map, ...bare } = stop;
  expect(stopCard(journeyView({ stops: [bare] }, idx, { slug: 'a', chapters: new Map() }).stops[0]).coords).toBeNull();
  expect(card.lines[0].chips[0].sources[0].url).toBe('https://a.example/1');
  expect(stopCard(v.stops[1]).room).toEqual({ href: '/a/1/', text: 'Enter the room: Room one' });
});

it('the shipped mapped stops all have coordinates on the globe', () => {
  const j = journeyView(loadJourney('einstein'), factIndex('einstein'), { slug: 'einstein', chapters: new Map() });
  const g = globeStops(j.mapped);
  // Numbers follow the shipped journey (content changes renumber stops): each mapped stop's list position.
  const all = loadJourney('einstein').stops;
  expect(g.map(s => s.number)).toEqual(all.map((s, i) => (s.map ? i + 1 : null)).filter(Boolean));
  expect(g.length).toBe(all.filter(s => s.map).length);
  expect(g.length).toBeGreaterThan(0);
  for (const s of g) {
    expect(s.lat).toBeGreaterThanOrEqual(-90); expect(s.lat).toBeLessThanOrEqual(90);
    expect(s.lon).toBeGreaterThanOrEqual(-180); expect(s.lon).toBeLessThanOrEqual(180);
  }
  expect(j.mapped.every(s => /^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/.test(s.coordSource))).toBe(true);
});

// Doors: "next room" is the next stop in journey order that has a room; the last room's exit leads
// to the ending page; the first room's entrance leads back to the journey map (the globe).
it('room doors follow the journey order, skipping stops without a room, last room to the ending page', () => {
  const s = (id, chapter) => ({ ...stop, id, ...(chapter === undefined ? {} : { chapter }) });
  const journey = { stops: [s('a'), s('b', 3), s('c'), s('d', 1), s('e', 9), s('f', 3), s('g', 2)] };
  const chapters = new Map([[1, 'Room one'], [2, 'Room two'], [3, 'Room three']]);
  const doors = n => roomDoors(journey, { slug: 'x', chapters, n });
  expect(doors(3)).toEqual({
    entrance: { kind: 'map', href: '/x/', label: 'Back: Journey map', button: 'Back to the journey map' },
    exit: { kind: 'room', href: '/x/1/', label: 'Next: Room one', button: 'Next room: Room one' },
  });
  expect(doors(1).entrance).toEqual({ kind: 'room', href: '/x/3/', label: 'Back: Room three', button: 'Previous room: Room three' });
  // Stop e names chapter 9, which has no page: skipped. Stop f repeats room 3: a room is entered once.
  expect(doors(1).exit).toMatchObject({ kind: 'room', href: '/x/2/' });
  expect(doors(2)).toEqual({
    entrance: { kind: 'room', href: '/x/1/', label: 'Back: Room one', button: 'Previous room: Room one' },
    exit: { kind: 'end', href: '/x/end/', label: "Exit to the journey's end", button: "Exit to the journey's end" },
  });
  // A single room: back to the map, on to the end, never a loop.
  expect(roomDoors({ stops: [s('a', 1)] }, { slug: 'x', chapters, n: 1 })).toMatchObject({ entrance: { href: '/x/' }, exit: { href: '/x/end/' } });
  expect(() => roomDoors(journey, { slug: 'x', chapters: new Map([...chapters, [4, 'Room four']]), n: 4 })).toThrow(/not a stop/);
  expect(() => roomDoors(null, { slug: 'x', chapters, n: 1 })).toThrow(/not a stop/);
});

it('the shipped Einstein rooms chain in journey order: the study, then American citizenship, then the end', () => {
  const chapters = new Map(listChapters().filter(c => c.slug === 'einstein').map(c => [c.n, loadChapterTitle(c.n)]));
  const journey = loadJourney('einstein');
  const order = journey.stops.filter(x => chapters.has(x.chapter)).map(x => x.chapter);
  const first = order[0], last = order[order.length - 1];
  expect(roomDoors(journey, { slug: 'einstein', chapters, n: first }).entrance.href).toBe('/einstein/');
  expect(roomDoors(journey, { slug: 'einstein', chapters, n: last }).exit.href).toBe('/einstein/end/');
  for (let i = 0; i + 1 < order.length; i++) {
    const d = roomDoors(journey, { slug: 'einstein', chapters, n: order[i] });
    expect(d.exit).toEqual({ kind: 'room', href: `/einstein/${order[i + 1]}/`, label: `Next: ${chapters.get(order[i + 1])}`, button: `Next room: ${chapters.get(order[i + 1])}` });
    expect(roomDoors(journey, { slug: 'einstein', chapters, n: order[i + 1] }).entrance.href).toBe(`/einstein/${order[i]}/`);
  }
});

// The Lite page lists its chapters in journey order, so the story only ever scrolls down: the rooms in
// the order the journey reaches them, then any chapter no stop opens, by number.
it('Lite chapters are in journey order, then the chapters no stop opens', () => {
  const journey = { stops: [{ id: 'a' }, { id: 'b', chapter: 3 }, { id: 'c', chapter: 1 }, { id: 'd', chapter: 3 }, { id: 'e', chapter: 9 }] };
  expect(chaptersInJourneyOrder([1, 2, 3, 4], journey)).toEqual([3, 1, 2, 4]);
  expect(chaptersInJourneyOrder([2, 1], null)).toEqual([1, 2]);
  // The shipped Einstein journey: every chapter once, the journey's rooms first, in its order.
  const shipped = chaptersInJourneyOrder(listChapters().filter(c => c.slug === 'einstein').map(c => c.n), loadJourney('einstein'));
  const rooms = [...new Set(loadJourney('einstein').stops.filter(s => s.chapter !== undefined).map(s => s.chapter))];
  expect(shipped.slice(0, rooms.length)).toEqual(rooms);
  expect([...shipped].sort((a, b) => a - b)).toEqual(listChapters().filter(c => c.slug === 'einstein').map(c => c.n).sort((a, b) => a - b));
});
