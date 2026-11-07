// Narration cue -> exhibit reveal. Cue start times come from the WebVTT track.
// An exhibit appears the first time the guide names it: by the line's authored reveals or, given the
// chapter's `exhibits`, by a fact the line cites (lineExhibits), so a highlighted line never names an
// exhibit that is still hidden.
export function buildTimeline(narration, cues, exhibits = []) {
  const start = new Map(cues.map(c => [c.id, c.startTime]));
  const first = new Map();
  const named = lineExhibits(narration, exhibits);
  for (const [i, line] of narration.entries()) {
    if (!start.has(line.cue)) throw new Error(`cue ${line.cue} not found in audio track`);
    const at = start.get(line.cue);
    if (typeof at !== 'number' || !Number.isFinite(at)) throw new Error(`cue ${line.cue} has no finite startTime`);
    for (const id of named[i]) if (!first.has(id) || at < first.get(id)) first.set(id, at);
  }
  const out = [...first].map(([exhibitId, at]) => ({ exhibitId, at }));
  return out.sort((a, b) => a.at - b.at);
}

// Cumulative by time: monotonic in t. Callers keep their own revealed set so a
// backwards seek never hides an exhibit.
export function revealedAt(timeline, t) {
  return new Set(timeline.filter(e => e.at <= t).map(e => e.exhibitId));
}

// Narration line -> exhibit ids it names, per line (same order as `narration`): the line's authored
// reveals first, then every exhibit whose title or notes cite one of the line's facts. Drives the
// per-line highlight and, through buildTimeline, the reveal at that line.
export function lineExhibits(narration, exhibits) {
  const cites = (exhibits || []).map(ex => ({
    id: ex.id,
    facts: new Set([...(ex.title_fact_ids || []), ...(ex.notes || []).flatMap(n => n.fact_ids || [])]),
  }));
  return (narration || []).map(line => {
    const out = [...new Set(line.reveals || [])];
    const facts = line.fact_ids || [];
    for (const c of cites) if (!out.includes(c.id) && facts.some(f => c.facts.has(f))) out.push(c.id);
    return out;
  });
}
