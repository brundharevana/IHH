// Write src/tour/data/records.lock.json, the declared list of every record the tours show (shownRecords.js). Run with
// vite-node after a deliberate change to what a tour shows: `npx vite-node scripts/record_lock.mjs`. The diff is the
// review of that change; records.test.js fails until the lock and the tour data agree.
import { writeFileSync } from 'node:fs'
import { INDUCTEES } from '../src/tour/data/index.js'
import { shownRecords } from '../src/tour/data/shownRecords.js'
import MOMENTS from '../src/tour/data/chapters.generated.json'

const path = new URL('../src/tour/data/records.lock.json', import.meta.url)
const list = shownRecords(INDUCTEES, MOMENTS)
writeFileSync(path, JSON.stringify({ $comment: 'Every record the tours show, by where (shownRecords.js). Regenerate only for a deliberate change: npx vite-node scripts/record_lock.mjs', records: list }, null, 1) + '\n')
console.log(`wrote ${list.length} records to ${path.pathname}`)
