// The shipped Einstein content and its records, read straight from the repository files, so e2e
// checks follow content changes (lines narrowed, cues renumbered, quotes or stops removed) instead of
// hard-coding old text. Everything here is read from disk, never from the site's own build code.
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const json = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const jsonl = path => readFileSync(new URL(path, root), 'utf8').split('\n').filter(l => l.trim()).map(l => JSON.parse(l));

export const SLUG = 'einstein';
export const chapter = n => json(`content/${SLUG}/chapters/${n}.json`);
export const QUIZ = json(`content/${SLUG}/quiz.json`);
// Every shipped chapter number (content/<slug>/chapters/<n>.json), ascending.
export const CHAPTER_NUMBERS = readdirSync(new URL(`content/${SLUG}/chapters/`, root)).map(f => /^(\d+)\.json$/.exec(f)).filter(Boolean).map(m => Number(m[1])).sort((a, b) => a - b);

// The exhibits each narration line names, in narration order: the line's authored reveals, then
// every exhibit whose title or notes cite one of the line's facts. This is the site's rule for what
// a line names (and so reveals and highlights), restated here from the content contract rather than
// imported, so e2e checks hold the site to it: a content change that makes two exhibits share a
// cited fact changes what a line names, and the checks follow.
export const lineNames = n => {
  const ch = chapter(n);
  const cites = ch.exhibits.map(e => ({ id: e.id, facts: new Set([...(e.title_fact_ids || []), ...(e.notes || []).flatMap(x => x.fact_ids || [])]) }));
  return ch.narration.map(l => {
    const out = [...new Set(l.reveals || [])];
    for (const c of cites) if (!out.includes(c.id) && (l.fact_ids || []).some(f => c.facts.has(f))) out.push(c.id);
    return out;
  });
};
// The cue (narration line id) at which an exhibit is first revealed: the first line that names it.
export const revealCue = (n, exhibitId) => chapter(n).narration[lineNames(n).findIndex(ids => ids.includes(exhibitId))].cue;
export const exhibit = (n, id) => chapter(n).exhibits.find(e => e.id === id);
// Exhibits in the order the narration first reveals them (the order a visitor meets them).
export const revealOrder = n => [...new Set(lineNames(n).flat())];
// The lines that reveal something new, in order: { cue, line (index), names (all it names), reveals
// (the exhibits first revealed at it) }. Exhibits revealed at the same line appear together.
export const revealSteps = n => {
  const seen = new Set();
  return lineNames(n).flatMap((names, i) => {
    const reveals = names.filter(id => !seen.has(id));
    reveals.forEach(id => seen.add(id));
    return reveals.length ? [{ cue: chapter(n).narration[i].cue, line: i, names, reveals }] : [];
  });
};
// The cue that comes after `cue` in the narration (the next line the guide speaks).
export const cueAfter = (n, cue) => {
  const lines = chapter(n).narration, i = lines.findIndex(l => l.cue === cue);
  return lines[i + 1] && lines[i + 1].cue;
};

// Holder names of the sources behind some facts, in citation order (the embed's "Sources:" line).
const facts = new Map(jsonl(`data/inductees/${SLUG}/facts.jsonl`).map(f => [f.id, f]));
const sources = new Map(jsonl(`data/inductees/${SLUG}/sources.jsonl`).map(s => [s.id, s]));
export const institutionsOf = factIds => [...new Set(factIds.flatMap(id => facts.get(id).evidence.map(e => sources.get(e.source_id).institution)))];

// The quiz question by id, its correct option and its wrong ones.
export const question = id => QUIZ.find(q => q.id === id);
export const rightOption = q => q.options.find(o => o.correct);
export const wrongOptions = q => q.options.filter(o => !o.correct);
