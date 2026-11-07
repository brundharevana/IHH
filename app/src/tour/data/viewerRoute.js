// The standalone record page, tour.html?viewer=<id> (round 9 fix round 6, Codex review 5): it opens only a record
// the tours declare they show (records.lock.json: a stop's record, a series member, a map or backdrop photograph,
// a Moments thumbnail), or, in dev, one of the viewer tests (artifacts.js VIEWER_TESTS). Any other id fails
// loudly: the page says the record is not part of these tours instead of falling through to the tour.
import LOCK from './records.lock.json'
import { VIEWER_TESTS, artifactById } from './artifacts.js'

// the record of each lock entry: the part after its last ':' or '~' (`none` declares no record)
export const DECLARED_RECORDS = new Set(LOCK.records.map((r) => r.split(/[:~]/).pop()).filter((id) => id !== 'none'))

// id: the ?viewer= value. { art } for a declared record (or a dev viewer test), else { error } naming why.
export function viewerRecord(id, { declared = DECLARED_RECORDS, tests = VIEWER_TESTS } = {}) {
  if (!id) return { error: 'No record was named.' }
  if (tests[id]) return { art: tests[id] }
  const art = artifactById(id)
  if (!art) return { error: `There is no record with the id ${id}.` }
  if (!declared.has(id)) return { error: `The record ${id} is not shown in these tours.` }
  return { art }
}
