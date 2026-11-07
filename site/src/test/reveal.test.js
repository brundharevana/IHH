import { it, expect } from 'vitest';
import { buildTimeline, revealedAt } from '../museum/reveal.js';
const narration = [{ cue: 'c1', reveals: ['ex1'] }, { cue: 'c2', reveals: ['ex2', 'ex3'] }];
const cues = [{ id: 'c1', startTime: 0.5 }, { id: 'c2', startTime: 7 }];
it('maps cues to exhibit reveal times in order', () => {
  expect(buildTimeline(narration, cues)).toEqual([{ exhibitId: 'ex1', at: 0.5 }, { exhibitId: 'ex2', at: 7 }, { exhibitId: 'ex3', at: 7 }]);
});
it('reveals cumulatively and never hides', () => {
  const tl = buildTimeline(narration, cues);
  expect([...revealedAt(tl, 0)]).toEqual([]);
  expect([...revealedAt(tl, 1)]).toEqual(['ex1']);
  expect(revealedAt(tl, 99).size).toBe(3);
});
it('throws on a cue missing from the audio track', () => {
  expect(() => buildTimeline([{ cue: 'c9', reveals: ['ex1'] }], cues)).toThrow(/c9/);
});
it('revealedAt is monotonic in t (callers keep their own revealed set across backward seeks)', () => {
  const tl = buildTimeline(narration, cues);
  let prev = new Set();
  for (const t of [0, 0.5, 3, 7, 7.1, 50]) {
    const now = revealedAt(tl, t);
    for (const id of prev) expect(now.has(id)).toBe(true);
    prev = now;
  }
});
it('sorts by time even when narration order differs from cue order', () => {
  const tl = buildTimeline([{ cue: 'c2', reveals: ['ex2'] }, { cue: 'c1', reveals: ['ex1'] }], cues);
  expect(tl.map(e => e.exhibitId)).toEqual(['ex1', 'ex2']);
});
it('lines without reveals add nothing', () => {
  expect(buildTimeline([{ cue: 'c1' }], cues)).toEqual([]);
});
it('dedupes an exhibit named by two cues to the earliest time', () => {
  const c = [{ id: 'a', startTime: 8 }, { id: 'b', startTime: 2 }];
  expect(buildTimeline([{ cue: 'a', reveals: ['ex1'] }, { cue: 'b', reveals: ['ex1'] }], c)).toEqual([{ exhibitId: 'ex1', at: 2 }]);
});
it('dedupes the same id listed twice in one line', () => {
  expect(buildTimeline([{ cue: 'c1', reveals: ['ex1', 'ex1'] }], cues)).toEqual([{ exhibitId: 'ex1', at: 0.5 }]);
});
it('startTime 0 is valid and reveals at t=0', () => {
  const tl = buildTimeline([{ cue: 'z', reveals: ['ex1'] }], [{ id: 'z', startTime: 0 }]);
  expect([...revealedAt(tl, 0)]).toEqual(['ex1']);
});
it('throws naming the cue when startTime is NaN or undefined', () => {
  expect(() => buildTimeline([{ cue: 'n', reveals: ['ex1'] }], [{ id: 'n', startTime: NaN }])).toThrow(/n/);
  expect(() => buildTimeline([{ cue: 'u', reveals: ['ex1'] }], [{ id: 'u' }])).toThrow(/u/);
});
it('empty narration gives an empty timeline', () => expect(buildTimeline([], cues)).toEqual([]));

// Narration line -> the exhibits it names: its authored reveals plus any exhibit whose title or
// notes cite one of the line's facts. Drives the per-line highlight (hotspot, list item, chip).
import { lineExhibits } from '../museum/reveal.js';
import { loadChapter, listChapters } from '../content/load.js';

it('maps each narration line to the exhibits it names (reveals, then fact matches)', () => {
  const narration = [
    { cue: 'a', fact_ids: ['F1'], reveals: ['ex1'] },
    { cue: 'b', fact_ids: ['F9'], reveals: [] },
    { cue: 'c', fact_ids: ['F3', 'F4'] },
  ];
  const exhibits = [
    { id: 'ex1', title_fact_ids: ['F1'], notes: [] },
    { id: 'ex2', title_fact_ids: ['F2'], notes: [{ fact_ids: ['F3'] }] },
    { id: 'ex3', title_fact_ids: ['F4'] },
  ];
  expect(lineExhibits(narration, exhibits)).toEqual([['ex1'], [], ['ex2', 'ex3']]);
});

it('every Einstein line that reveals an exhibit highlights it, and the study letters line names the Brunauer letter', () => {
  for (const n of listChapters().filter(c => c.slug === 'einstein').map(c => c.n)) {
    const ch = loadChapter('einstein', n);
    const lines = lineExhibits(ch.narration, ch.exhibits);
    ch.narration.forEach((l, i) => { for (const id of l.reveals || []) expect(lines[i]).toContain(id); });
  }
  const study = loadChapter('einstein', 2);
  const lines = lineExhibits(study.narration, study.exhibits);
  expect(lines[study.narration.findIndex(l => l.cue === 'c3')]).toEqual(expect.arrayContaining(['ex1', 'ex2']));
  expect(lines[study.narration.findIndex(l => l.cue === 'c6')]).toContain('ex3');
});

// A narration line that cites an exhibit not yet revealed reveals it at that line, so the line's
// highlight (hotspot, list item) can show it: reveals follow lineExhibits, not only authored reveals.
it('a line that cites an exhibit by fact reveals it at that line', () => {
  const narration = [
    { cue: 'a', fact_ids: ['F1'], reveals: ['ex1'] },
    { cue: 'b', fact_ids: ['F3'], reveals: [] },
    { cue: 'c', fact_ids: ['F9'], reveals: ['ex2'] },
  ];
  const exhibits = [{ id: 'ex1', title_fact_ids: ['F1'] }, { id: 'ex2', notes: [{ fact_ids: ['F3'] }] }];
  const c = [{ id: 'a', startTime: 1 }, { id: 'b', startTime: 5 }, { id: 'c', startTime: 9 }];
  expect(buildTimeline(narration, c, exhibits)).toEqual([{ exhibitId: 'ex1', at: 1 }, { exhibitId: 'ex2', at: 5 }]);
});

it('every Einstein line reveals, by the time it starts, every exhibit it highlights', () => {
  for (const n of listChapters().filter(c => c.slug === 'einstein').map(c => c.n)) {
    const ch = loadChapter('einstein', n);
    const cues = ch.narration.map((l, i) => ({ id: l.cue, startTime: i * 10 }));
    const tl = buildTimeline(ch.narration, cues, ch.exhibits);
    lineExhibits(ch.narration, ch.exhibits).forEach((ids, i) => {
      const shown = revealedAt(tl, i * 10);
      for (const id of ids) expect(shown.has(id), `${ch.id} line ${ch.narration[i].cue} names ${id}`).toBe(true);
    });
  }
});
