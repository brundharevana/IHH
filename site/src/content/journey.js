// Build-time views for the journey map, the quiz and the ending page. Every string comes from
// content/<slug>/journey.json or quiz.json (grounded by tools/content_check.py) or from pipeline
// records; factChips re-checks that each cited fact is verified, so a stale build cannot ship
// text whose facts were later downgraded.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { factChips, listPipelineInductees, ROOT } from './load.js';

// chapters: Map<number, title> of the inductee's chapter pages that exist. Only stops with a "map"
// position are drawn (content_check.py allows one only when a cited fact names the stop's place);
// the rest are listed only. A stop may have no date. A drawn stop also carries the published
// coordinates of its named place (lat, lon, coordSource) for the globe; they are not facts.
export function journeyView(journey, idx, { slug, chapters }) {
  const stops = (journey && journey.stops) || [];
  if (!stops.length) throw new Error(`${slug}: journey has no stops`);
  const views = stops.map((s, i) => {
    const n = s.chapter;
    const has = n !== undefined && chapters.has(n);
    const onMap = Boolean(s.map);
    return {
      id: s.id, number: i + 1, label: s.label, date: s.date ?? null,
      heading: s.date ? `${s.label}, ${s.date}` : s.label,
      chips: factChips(s.fact_ids, idx),
      lines: (s.lines || []).map(l => ({ text: l.text, chips: factChips(l.fact_ids, idx) })),
      onMap, x: onMap ? s.map.x : null, y: onMap ? s.map.y : null,
      lat: onMap ? s.map.lat : null, lon: onMap ? s.map.lon : null, coordSource: onMap ? s.map.coord_source : null,
      href: has ? `/${slug}/${n}/` : null,
      chapterTitle: has ? chapters.get(n) : null,
    };
  });
  return { stops: views, mapped: views.filter(v => v.onMap) };
}

// What the globe script needs for its pins: list number, label and coordinates of each drawn stop;
// its room (link and "Enter the room" text) when it has one, and the URL of its present-day aerial
// stack (aerialOf(id), tools/build_aerials.py) when one was built. The globe plays the aerial zoom
// only for a stop that has a stack.
export function globeStops(mapped, { aerialOf = () => null } = {}) {
  return mapped.map(s => {
    const aerial = aerialOf(s.id);
    return {
      id: s.id, number: s.number, label: s.label, lat: s.lat, lon: s.lon,
      ...(s.href ? { room: { href: s.href, text: `Enter the room: ${s.chapterTitle}` } } : {}),
      ...(aerial ? { aerial } : {}),
    };
  });
}

// The two doors of room n, in journey order: the rooms are the stops whose chapter page exists
// (chapters: Map<number, title>), each room once, at its first stop. The entrance leads back to the
// previous room, or to the journey map (the globe) from the first room; the exit leads on to the next
// room, or to the ending page (/<slug>/end/) from the last, never back round in a loop. A room that is
// not a stop on the journey is a content error.
// -> { entrance, exit }: { kind: 'map' | 'room' | 'end', href, label (door hotspot), button (stage button) }
export function roomDoors(journey, { slug, chapters, n }) {
  const rooms = [];
  for (const s of (journey && journey.stops) || []) {
    if (s.chapter !== undefined && chapters.has(s.chapter) && !rooms.includes(s.chapter)) rooms.push(s.chapter);
  }
  const i = rooms.indexOf(n);
  if (i < 0) throw new Error(`${slug}/${n}: the room is not a stop on the journey (content/${slug}/journey.json)`);
  const prev = rooms[i - 1], next = rooms[i + 1];
  const entrance = prev === undefined
    ? { kind: 'map', href: `/${slug}/`, label: 'Back: Journey map', button: 'Back to the journey map' }
    : { kind: 'room', href: `/${slug}/${prev}/`, label: `Back: ${chapters.get(prev)}`, button: `Previous room: ${chapters.get(prev)}` };
  const exit = next === undefined
    ? { kind: 'end', href: `/${slug}/end/`, label: "Exit to the journey's end", button: "Exit to the journey's end" }
    : { kind: 'room', href: `/${slug}/${next}/`, label: `Next: ${chapters.get(next)}`, button: `Next room: ${chapters.get(next)}` };
  return { entrance, exit };
}

// What story mode (src/ui/story.js) needs: the rooms in journey order, as roomDoors orders them (each
// room once, at its first stop), with whether that stop is pinned on the globe (has a "map" position).
// Two pinned rooms in a row are joined through the globe; any step with an unpinned room is a door.
export function storyJourney(journey, { slug, chapters }) {
  const rooms = [];
  for (const s of (journey && journey.stops) || []) {
    if (s.chapter === undefined || !chapters.has(s.chapter) || rooms.some(r => r.n === s.chapter)) continue;
    rooms.push({ id: s.id, n: s.chapter, title: chapters.get(s.chapter), href: `/${slug}/${s.chapter}/`, pinned: Boolean(s.map) });
  }
  return { slug, rooms };
}

// Chapter numbers in journey order (the order the story visits them, each once), then any chapter no
// stop opens, by number. The Lite page lists its chapters this way so the story only scrolls down.
export function chaptersInJourneyOrder(numbers, journey) {
  const have = new Set(numbers), out = [];
  for (const s of (journey && journey.stops) || []) if (have.has(s.chapter) && !out.includes(s.chapter)) out.push(s.chapter);
  return [...out, ...[...have].filter(n => !out.includes(n)).sort((a, b) => a - b)];
}

// One stop as the stop list and the globe's stop card both show it (StopCard.astro renders it).
export function stopCard(v) {
  return {
    id: v.id, number: v.number, heading: v.heading, chips: v.chips, lines: v.lines,
    room: v.href ? { href: v.href, text: `Enter the room: ${v.chapterTitle}` } : null,
    coords: v.coordSource ? { href: v.coordSource, text: `Published coordinates of ${v.label}` } : null,
  };
}

// questions: what the page renders; runtime: the plain data scoreAnswer (src/ui/quiz.js) needs.
export function quizView(quiz, idx) {
  const questions = (quiz || []).map(q => ({
    id: q.id, question: q.question, chips: factChips(q.question_fact_ids, idx),
    options: q.options.map(o => ({ text: o.text, correct: o.correct, explanation: o.explanation, chips: factChips(o.fact_ids, idx) })),
  }));
  const runtime = (quiz || []).map(q => ({
    id: q.id,
    options: q.options.map(o => ({ text: o.text, correct: o.correct, explanation: o.explanation, fact_ids: [...o.fact_ids] })),
  }));
  return { questions, runtime };
}

// Every other inductee in the fact pipeline, by its pipeline name; linked to its journey page
// only once that inductee has one (content/<slug>/journey.json).
export function otherInductees(slug) {
  return listPipelineInductees().filter(i => i.slug !== slug).map(i => ({
    slug: i.slug, name: i.name,
    href: existsSync(join(ROOT, 'content', i.slug, 'journey.json')) ? `/${i.slug}/` : null,
  }));
}
