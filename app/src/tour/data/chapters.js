// The ten turning-point kinds (spec 2.2). They are the chapters' labels (Moments That Made Them groups by
// them), and this list is the tie-break of the time order below.
export const CHAPTER_KINDS = ['birth', 'education', 'leaving', 'arriving', 'first-work', 'citizen', 'big-work', 'history', 'honoured', 'legacy']

export const chapter = (c) => ({ map: null, ...c })

// Time order (owner decision 2026-10-27): a tour plays its chapters in the order of their turning points,
// so the story never steps back. Each chapter carries `year`, stated by its `yearFact` (one of its own
// verified facts; validateTour checks it), and the tour is sorted by that year. Chapters of the same year
// follow the kind order above (Einstein 1933: leaving, then arriving); two chapters of the same year and
// kind keep the order they are written in (the sort is stable).
const kindRank = (c) => CHAPTER_KINDS.indexOf(c.kind)
const timeKey = (a, b) => a.year - b.year || kindRank(a) - kindRank(b)
export const inTimeOrder = (chapters) => [...chapters].sort(timeKey)
const yearIn = (claim, year) => new RegExp(`(?<!\\d)${year}(?!\\d)`).test(claim || '')

function yearErrors(c, index) {
  if (!Number.isInteger(c.year)) return [`${c.id}: no year (the chapter's time-order key)`]
  if (!c.yearFact) return [`${c.id}: no yearFact: the verified fact that states the year ${c.year}`]
  if (!c.factIds.includes(c.yearFact)) return [`${c.id}: yearFact ${c.yearFact} is not one of the chapter's facts`]
  const claim = index.facts[c.yearFact]?.claim
  if (!claim) return [`${c.id}: yearFact ${c.yearFact} is not verified`]
  return yearIn(claim, c.year) ? [] : [`${c.id}: yearFact ${c.yearFact} does not state the year ${c.year}`]
}

// A map leg draws a journey between places. Owner decision 2026-10-29 (round 9): every inductee's arrival chapter
// draws the animated line from one verified place to the next, even where no record states the route. So a segment
// is either
//   - routed: `journey: { facts, from, to }`, a verified fact that states that journey at the precision the map draws
//     it (owner ruling after Einstein's Ulm leg; Codex Task 19 rounds 2 and 3):
//       - `from` and `to` are exactly the names of the segment's two places (the label before any comma);
//       - one cited verified claim names both, with the direction stated: the destination after "to", "into" or
//         "for", and the origin after "from" or earlier in the sentence than the destination;
//     a drawn mode of travel needs `modeFacts`: one of the journey's claims, saying the mode between the origin and
//     the destination ("... New York City and went by boat to Albany"; "sailed for New York from Southampton": the
//     verb just before "for" counts);
//   - or un-routed: `routed: false`, no journey, no mode and no label of its own: the map shows the fixed on-map note
//     UNROUTED_NOTE beside the line (interface copy, map/common.jsx): the line only joins two places, and says so.
// Either way both ends are verified places (placeErrors): each cites verified facts, one of which names it, and a
// place is a city or a named site, never a country or region standing for one.
export const UNROUTED_NOTE = 'Route not recorded; the line joins the two places'
export const MODE_WORDS = {
  ship: /\b(boat|ship|steam(ed|er|ship)?|liner|sail(ed)?|voyage)\b/i,
  train: /\b(train|rail(way|road)?)\b/i,
  air: /\b(fl(ew|ight|ying)|plane|airline|aircraft)\b/i,
  car: /\b(car|automobile|drove|motor)\b/i,
}
// a country or region never stands for a city on the map (Codex Task 19 round 3)
export const REGIONS = ['Austria', 'Belgium', 'Canada', 'Czechoslovakia', 'England', 'France', 'Germany', 'Scotland', 'Switzerland', 'United States', 'Yugoslavia', 'Wisconsin', 'Ontario', 'Europe', 'America']
export const placeName = (place) => String(place.label || '').split(',')[0].trim()
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Does `claim` state a journey from `from` to `to`? Returns [ok, start, end]: the span of the claim from the origin to
// the destination, taking in the word just before the destination's "to" / "for" (the verb of the journey).
export function statesJourney(claim, from, to) {
  const dest = new RegExp(`\\b(to|into|for)\\s+(the\\s+)?${esc(to)}\\b`).exec(claim)
  const orig = new RegExp(`\\b${esc(from)}\\b`).exec(claim)
  if (!dest || !orig || orig.index === dest.index) return [false]
  const fromMarked = new RegExp(`\\bfrom\\s+(the\\s+)?${esc(from)}\\b`).test(claim)
  const verb = /(\w+)\s+$/.exec(claim.slice(0, dest.index))
  const destStart = verb ? verb.index : dest.index
  return [fromMarked || orig.index < dest.index, Math.min(orig.index, destStart), Math.max(orig.index + from.length, dest.index + dest[0].length)]
}

// A place on a map is verified: it cites verified facts, one of which names it, and it is not a country or region.
export function placeErrors(tag, place, index) {
  const errs = []
  const name = placeName(place)
  if (REGIONS.includes(name)) errs.push(`${tag}: "${name}" is a country or region, not a place on the map (a country never stands for a city)`)
  const claims = (place.factIds || []).map((f) => [f, index.facts[f]?.claim])
  if (!claims.length) errs.push(`${tag}: place "${name}" cites no verified fact`)
  for (const [f, c] of claims) if (!c) errs.push(`${tag}: place "${name}" fact ${f} is not verified`)
  if (claims.length && !claims.some(([, c]) => c && new RegExp(`\\b${esc(name)}\\b`, 'i').test(c)))
    errs.push(`${tag}: no cited verified fact names the place "${name}"`)
  // its date (a year) is stated by one cited verified fact that also names the place (round 9 final review: a pin was
  // dated by joining a fact that names the place with another that dates a different event)
  if (place.date) {
    const years = String(place.date).match(/\d{4}/g) || []
    const ok = claims.some(([, c]) => c && new RegExp(`\\b${esc(name)}\\b`, 'i').test(c) && years.every((y) => c.includes(y)))
    if (!ok) errs.push(`${tag}: the date "${place.date}" of "${name}" is not stated by a cited fact that names the place`)
  }
  return errs
}

export function legErrors(c, index) {
  const errs = []
  const m = c.map
  if (!m) return errs
  if (m.places.length < 2 || m.segments.length !== m.places.length - 1) errs.push(`${c.id}: map leg needs places.length - 1 segments`)
  m.places.forEach((p) => errs.push(...placeErrors(`${c.id}: ${p.label}`, p, index)))
  m.segments.forEach((seg, i) => {
    const a = m.places[i], b = m.places[i + 1]
    if (!a || !b) return
    const tag = `${c.id}: ${a.label} -> ${b.label}`
    if (seg.routed === false) {
      // the owner's un-routed line (2026-10-29): it joins two verified places and claims nothing about the way between
      if (seg.mode) errs.push(`${tag}: an un-routed line shows no mode of travel`)
      if (seg.journey || seg.modeFacts) errs.push(`${tag}: an un-routed line carries no journey or mode facts (route one instead)`)
      if (seg.label) errs.push(`${tag}: an un-routed line has no label of its own (the map shows "${UNROUTED_NOTE}")`)
      return
    }
    const j = seg.journey
    if (!j?.facts?.length || !j.from || !j.to) return errs.push(`${tag}: no verified fact for this journey (journey: { facts, from, to }); or draw it un-routed (routed: false)`)
    if (j.from !== placeName(a)) errs.push(`${tag}: journey from "${j.from}" is not the place "${placeName(a)}" (a country or region never stands for a city)`)
    if (j.to !== placeName(b)) errs.push(`${tag}: journey to "${j.to}" is not the place "${placeName(b)}" (a country or region never stands for a city)`)
    const claims = j.facts.map((f) => index.facts[f]?.claim)
    j.facts.forEach((f, k) => { if (!claims[k]) errs.push(`${tag}: journey fact ${f} is not verified`) })
    const stated = claims.filter(Boolean).map((t) => [t, statesJourney(t, j.from, j.to)]).filter(([, r]) => r[0])
    if (!stated.length) errs.push(`${tag}: no cited claim states a journey from "${j.from}" to "${j.to}"`)
    if (seg.mode) {
      const re = MODE_WORDS[seg.mode]
      const said = (seg.modeFacts || []).filter((f) => j.facts.includes(f)).map((f) => index.facts[f]?.claim).filter(Boolean)
      const between = said.some((t) => {
        const r = statesJourney(t, j.from, j.to)
        return r[0] && re?.test(t.slice(r[1], r[2]))
      })
      if (!re) errs.push(`${tag}: unknown mode ${seg.mode}`)
      else if (!between) errs.push(`${tag}: mode ${seg.mode} is drawn but no journey claim says it between "${j.from}" and "${j.to}"`)
    }
  })
  // the place photographs shown on the map (round 9): each at a verified place, each a verified, cleared record
  for (const r of m.resources || []) {
    errs.push(...placeErrors(`${c.id}: resource ${r.label}`, r, index))
    for (const id of r.media || []) if (!index.media?.[id]?.embeddable) errs.push(`${c.id}: resource ${r.label}: record ${id} is not verified and cleared`)
    if (!r.media?.length) errs.push(`${c.id}: resource ${r.label} shows no record`)
  }
  return errs
}

// A gallery case is never an empty glass box (feedback round 7): the chapter has a record to lay in
// the case, or verified lines to print (the wall panel, and the card in the case when there is no
// record: place/galleryLayout.js caseCard). A panel stop needs a panel to print.
export function galleryErrors(c, index) {
  const errs = []
  const records = c.stops.filter((s) => s.art || s.artifact)
  const lines = (c.place.panel?.factIds || []).filter((f) => index.facts[f])
  if (!records.length && !lines.length) errs.push(`${c.id}: gallery case with no record and no verified panel line (an empty case)`)
  if (c.stops.some((s) => s.panel) && !c.place.panel) errs.push(`${c.id}: a panel stop but no place.panel to print`)
  return errs
}

export function validateTour(tour, index) {
  const errs = []
  tour.chapters.forEach((c, i) => {
    if (kindRank(c) < 0) errs.push(`${c.id}: unknown kind ${c.kind}`)
    errs.push(...yearErrors(c, index))
    const prev = tour.chapters[i - 1]
    if (prev && Number.isInteger(prev.year) && Number.isInteger(c.year) && timeKey(prev, c) > 0)
      errs.push(`chapters out of time order at ${prev.id} (${prev.year}) -> ${c.id} (${c.year})`)
    for (const f of c.factIds) if (!index.facts[f]) errs.push(`${c.id}: fact ${f} is not verified`)
    errs.push(...legErrors(c, index))
    const p = c.place
    if (p.tier === 'photo' && !index.media[p.photo.mediaId]?.embeddable) errs.push(`${c.id}: photo ${p.photo.mediaId} is not cleared`)
    if (p.tier === 'gallery') {
      errs.push(...galleryErrors(c, index))
      const usable = Object.entries(index.media).find(([, m]) => m.embeddable && m.basisFor.some((f) => c.factIds.includes(f)))
      if (usable) errs.push(`${c.id}: use a photo room (embeddable basis photo ${usable[0]} exists)`)
    }
  })
  return errs
}

export function resolveChapter(tour, key) {
  if (!key) return 0
  const i = tour.chapters.findIndex((c) => c.id === key || c.kind === key || c.factIds.includes(key))
  return i < 0 ? 0 : i
}
