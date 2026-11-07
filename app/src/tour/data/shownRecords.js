// Every record a tour shows, by where it is shown (round 9 fix round 5, Codex review 4: the record gates must count every
// path by which a stop or a chapter shows a record, so that losing any one binding fails them):
//   <slug>/<chapter>/<stop>:<media>              a stop's record (any tier: room record or prop, photo-room `at` or rail
//                                                 record, gallery-case item), by its artifact or art
//   <slug>/<chapter>/<stop>~<media>              each member of a series the stop shows
//   <slug>/<chapter>/map:<resource>:<media>      a place photograph pinned on the chapter's map
//   <slug>/<chapter>/backdrop:<media>            a photo room's photograph, the place the chapter stands in
//                                                 (place.photo.mediaId; round 9 fix round 6, Codex review 5)
//   moments/<slug>/<chapter>:<media | none>      the chapter's Moments thumbnail (chapters.generated.json thumbMediaId);
//                                                 `none` declares the chapter has no cleared image and shows the kind icon
// records.lock.json is the declared list (scripts/record_lock.mjs writes it); records.test.js fails when the tour data
// shows anything else, and e2e/chapters.mjs (part `records`) checks each entry is bound and drawn on the page.
import { artifactById } from './artifacts.js'

export const recordOfStop = (stop) => stop.art || (stop.artifact ? artifactById(stop.artifact) : null) || null

// moments: { [slug]: [{ id, thumbMediaId }] } (chapters.generated.json, what the Moments page reads); left out, no
// Moments entries are listed
export function shownRecords(tours, moments = null) {
  const out = []
  for (const [slug, tour] of Object.entries(tours))
    for (const c of tour.chapters || []) {
      for (const s of c.stops || []) {
        const art = recordOfStop(s)
        // a binding that names no known record is itself a loss (an id with no record behind it)
        const id = art?.id || s.artifact || null
        if (!id) continue
        out.push(`${slug}/${c.id}/${s.id}:${id}`)
        for (const m of art?.letters || []) out.push(`${slug}/${c.id}/${s.id}~${m}`)
      }
      for (const r of c.map?.resources || []) for (const m of r.media || []) out.push(`${slug}/${c.id}/map:${r.id}:${m}`)
      if (c.place?.tier === 'photo') out.push(`${slug}/${c.id}/backdrop:${c.place.photo?.mediaId || 'none'}`)
    }
  for (const [slug, list] of Object.entries(moments || {})) for (const m of list) out.push(`moments/${slug}/${m.id}:${m.thumbMediaId || 'none'}`)
  return out.sort()
}
