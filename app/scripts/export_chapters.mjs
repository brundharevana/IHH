// Exports the turning-point chapters of every inductee in the chapter shape (tour/data/<slug>.js) to
// src/tour/data/chapters.generated.json, read by src/landing/data/build_inductees.py:
//   { [slug]: [{ id, kind, title, year, factIds, thumbMediaId }] }
// Also writes link-only.generated.json (LINK_ONLY of artifacts.js) for build_inductees.py, and
// guide-ground.generated.json for the guide-lines gate (assets-src/audio/check_narration.py): every
// recreated room of every tour (chapter or step shape) with what its own data says about it, the words
// a wayfinding line in shared/guide/lines.json may be grounded in:
//   { rooms: { [room id]: { slug, titles: [room title, place label, chapter/step title],
//              stops: { [stop id]: { name, record: { title, date, lines, recreation, holder, credit } | null,
//              clipKeys, placeNote } } } } }
// thumbMediaId: the first media record among the chapter's stops that is verified, embeddable, not
// link-only and not a basis photo; null when there is none (the landing then draws a neutral kind icon). Inductees
// still on `steps` are left out (the landing keeps their story points until their tours convert).
// tour-use.generated.json, read by scripts/export_site_provenance.py (the provenance package for IHH's
// chatbot): what the shipped tour shows and says, chapter by chapter (place tier, room or photo, stops,
// the narration keys of every clip) and every viewer record a stop opens:
//   { tours: { [slug]: { name, chapters: [{ id, kind, title, year, factIds, opening, narration, closing, map,
//              place: { tier, label, note, panel, room: { id, title, labelText, narration, closing },
//              photo: { mediaId } }, stops: [{ id, name, nodes, clip, record, panel, rail, placeNote, prop }] }] } },
//     records: { [record id]: { id, slug, kind, title, ..., files, letters, links } } }
// Run from app/:  npx vite-node scripts/export_chapters.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { INDUCTEES } from '../src/tour/data/index.js'
import { LINK_ONLY, artifactById } from '../src/tour/data/artifacts.js'
import { UNROUTED_NOTE } from '../src/tour/data/chapters.js'

const OUT = new URL('../src/tour/data/chapters.generated.json', import.meta.url)
const OUT_LINK_ONLY = new URL('../src/tour/data/link-only.generated.json', import.meta.url)
const OUT_GROUND = new URL('../src/tour/data/guide-ground.generated.json', import.meta.url)
const OUT_TOUR_USE = new URL('../src/tour/data/tour-use.generated.json', import.meta.url)
const INDEX = JSON.parse(readFileSync(new URL('../src/tour/data/facts.generated.json', import.meta.url), 'utf8'))

// basis photos (the photographs a photo room is built from) are never landing objects: they show a
// place or occasion, not the inductee's own document or object (data/inductees/<slug>/media.jsonl)
const BASIS = new Set()
for (const slug of Object.keys(INDUCTEES)) {
  const f = new URL(`../../data/inductees/${slug}/media.jsonl`, import.meta.url)
  if (!existsSync(f)) continue
  for (const l of readFileSync(f, 'utf8').split('\n')) if (l.trim() && JSON.parse(l).record_kind === 'basis-photo') BASIS.add(JSON.parse(l).id)
}

const ok = (id) => /^[A-Z]{3}-M-\d{4}$/.test(id) && INDEX.media[id]?.embeddable === true && !LINK_ONLY.has(id) && !BASIS.has(id)

function mediaIds(stop) {
  const art = stop.art || (stop.artifact ? artifactById(stop.artifact) : null)
  if (!art) return []
  return art.kind === 'series' ? art.letters || [] : [art.id]
}

export function exportChapters(inductees = INDUCTEES) {
  const out = {}
  for (const [slug, tour] of Object.entries(inductees)) {
    if (!tour.chapters) continue
    out[slug] = tour.chapters.map((c) => ({
      id: c.id,
      kind: c.kind,
      title: c.title,
      year: c.year,
      factIds: c.factIds,
      thumbMediaId: c.stops.flatMap(mediaIds).find(ok) ?? null,
    }))
  }
  return out
}

const recordOf = (a) => a.art || (a.artifact ? artifactById(a.artifact) : null)

export function exportGuideGround(inductees = INDUCTEES) {
  const rooms = {}
  for (const [slug, tour] of Object.entries(inductees)) {
    const places = tour.chapters
      ? tour.chapters.filter((c) => c.place.tier === 'room').map((c) => [c.place.room, [c.place.label, c.title]])
      : tour.steps.filter((s) => s.type === 'room').map((s) => [s.room, [s.title]])
    for (const [room, titles] of places) {
      const r = (rooms[room.id] ||= { slug, titles: [room.title], stops: {} })
      for (const t of titles) if (t && !r.titles.includes(t)) r.titles.push(t)
      for (const a of room.artifacts) {
        const rec = recordOf(a)
        r.stops[a.id] = {
          name: a.name,
          record: rec ? { title: rec.title || '', date: rec.date || '', lines: (rec.lines || []).map((l) => l.text), recreation: rec.recreation || '', holder: rec.holder || '', credit: rec.credit || '' } : null,
          clipKeys: a.clip?.keys || [],
          placeNote: a.placeNote || '',
        }
      }
    }
  }
  return { rooms }
}

const keysOf = (n) => (n && n.keys?.length ? { keys: n.keys, factIds: n.factIds || [] } : null)
const filesOf = (r) => [...(r.pages || []).flatMap((p) => [p.src, p.back].filter(Boolean)), ...(r.photos || []).map((p) => p.src), ...(r.model ? [r.model.src] : [])]
const RECORD_FIELDS = ['id', 'slug', 'kind', 'unit', 'title', 'maker', 'date', 'holder', 'catalogueId', 'rights', 'source', 'credit', 'alt', 'recreation', 'recreationNote', 'linkOnly']

function recordOut(r) {
  const out = {}
  for (const k of RECORD_FIELDS) if (r[k] !== undefined) out[k] = r[k]
  out.lines = (r.lines || []).map((l) => ({ label: l.label, text: l.text, factId: l.factId }))
  out.notes = (r.model?.notes || []).map((n) => ({ label: n.label, text: n.text, factId: n.factId }))
  out.clip = keysOf(r.clip)
  out.files = filesOf(r)
  if (r.letters) out.letters = r.letters
  if (r.links) out.links = r.links.map((l) => ({ label: l.label, href: l.href, mediaId: l.mediaId }))
  return out
}

export function exportTourUse(inductees = INDUCTEES) {
  const tours = {}
  const records = {}
  const addRecord = (r) => {
    if (!r || records[r.id]) return
    records[r.id] = recordOut(r)
    for (const id of r.letters || []) addRecord(artifactById(id))
    for (const l of r.links || []) if (l.mediaId) addRecord(artifactById(l.mediaId))
  }
  for (const [slug, tour] of Object.entries(inductees)) {
    if (!tour.chapters) continue
    tours[slug] = {
      name: tour.name,
      chapters: tour.chapters.map((c) => {
        const p = c.place
        const room = p.tier === 'room' ? p.room : null
        for (const r of c.map?.resources || []) for (const id of r.media || []) addRecord(artifactById(id))
        return {
          id: c.id,
          kind: c.kind,
          title: c.title,
          year: c.year,
          factIds: c.factIds,
          // ChapterPlayer's openingOf: the chapter's own opening, else the voiced line for its kind
          opening: keysOf(c.opening) || { keys: [`${slug}:ch:${c.kind}:opening`], factIds: [] },
          narration: keysOf(c.narration),
          // a photo room's or gallery's closing (a room's is place.room.closing)
          closing: keysOf(c.closing),
          map: c.map
            ? {
                id: c.map.id,
                title: c.map.title,
                narration: keysOf(c.map.narration),
                places: c.map.places.map((pl) => ({ id: pl.id, label: pl.label, date: pl.date || null, note: pl.note || null, coord: pl.coord, factIds: pl.factIds || [] })),
                // round 9 (owner decision 2026-10-29): a routed line cites the fact that states the journey (and its mode);
                // an un-routed line only joins two verified places, and the map says so (UNROUTED_NOTE)
                segments: c.map.segments.map((sg) => ({
                  mode: sg.mode,
                  label: sg.label || null,
                  factIds: sg.factIds || [],
                  routed: sg.routed !== false,
                  journeyFacts: sg.journey?.facts || [],
                  modeFacts: sg.modeFacts || [],
                  note: sg.routed === false ? UNROUTED_NOTE : null,
                })),
                // the place photographs pinned on the map (verified places, verified and cleared records)
                resources: (c.map.resources || []).map((r) => ({ id: r.id, label: r.label, coord: r.coord, factIds: r.factIds || [], media: r.media || [] })),
              }
            : null,
          place: {
            tier: p.tier,
            label: p.label,
            note: p.note || null,
            panel: p.panel ? { eyebrow: p.panel.eyebrow, title: p.panel.title, factIds: p.panel.factIds || [] } : null,
            room: room ? { id: room.id, title: room.title, labelText: room.labelText || null, narration: keysOf(room.narration), closing: keysOf(room.closing) } : null,
            photo: p.tier === 'photo' ? { mediaId: p.photo.mediaId } : null,
          },
          stops: c.stops.map((s) => {
            const rec = recordOf(s)
            addRecord(rec)
            return {
              id: s.id,
              name: s.name,
              nodes: s.nodes || [],
              clip: keysOf(s.clip),
              record: rec ? rec.id : null,
              // a gallery's wall-panel stop (true), or a room's labelled panel stop (round 8: its title and the facts it prints)
              panel: s.panel && typeof s.panel === 'object' ? { eyebrow: s.panel.eyebrow || null, title: s.panel.title, factIds: s.panel.factIds || [] } : !!s.panel,
              rail: !!s.rail,
              placeNote: s.placeNote || null,
              prop: s.prop ? s.prop.src : null,
            }
          }),
        }
      }),
    }
  }
  return { tours, records }
}

writeFileSync(OUT, JSON.stringify(exportChapters(), null, 2) + '\n')
writeFileSync(OUT_GROUND, JSON.stringify(exportGuideGround(), null, 1) + '\n')
writeFileSync(OUT_TOUR_USE, JSON.stringify(exportTourUse(), null, 1) + '\n')
writeFileSync(OUT_LINK_ONLY, JSON.stringify([...LINK_ONLY].sort(), null, 2) + '\n')
console.log(`wrote ${OUT.pathname}`)
