// Build gate: every fact/media id referenced by tour, landing, artifact and narration data must be in
// facts.generated.json (verified; media also embeddable). A media id listed in LINK_ONLY (artifacts.js:
// shown only as a link to the holder, never as pixels) need not be embeddable, but it must still be a
// verified record, or a disputed one the owner explicitly ruled link-only (LINK_ONLY_RULED below, which
// holds only while the store keeps the record disputed, never rejected or refuted). Exit 1 otherwise.
// What the guide says is gated separately (check_narration.py, in the same prebuild chain).
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Disputed records the owner ruled link-only (a link to the holder, no pixels, no claim).
export const LINK_ONLY_RULED = {
  'ALB-M-0054': 'Owner ruling 2026-10-22: Albright\'s handwritten letters to President Clinton (Clinton Library) stay link-only; only the typed memorandum ALB-M-0055 is shown (app/scripts/build_fact_index.py OWNER_RULED).',
  'ALB-M-0056': 'Owner ruling 2026-10-22: Albright\'s handwritten letters to President Clinton (Clinton Library) stay link-only; only the typed memorandum ALB-M-0055 is shown (app/scripts/build_fact_index.py OWNER_RULED).',
}

const FACT = /\b[A-Z]{3}-F-\d{4}\b/g
const MEDIA = /\b[A-Z]{3}-M-\d{4}\b/g

/** The ids listed in artifacts.js LINK_ONLY. */
export function readLinkOnly(artifactsSource) {
  const m = artifactsSource.match(/LINK_ONLY\s*=\s*new Set\(\[([^\]]*)\]/)
  if (!m) throw new Error('artifacts.js: LINK_ONLY not found')
  return new Set(m[1].match(/[A-Z]{3}-M-\d{4}/g) || [])
}

/** Status of every media record in the store: { id: status }. */
export function readStoreStatus(storeDir) {
  const out = {}
  if (!existsSync(storeDir)) return out
  for (const d of readdirSync(storeDir, { withFileTypes: true })) {
    const p = join(storeDir, d.name, 'media.jsonl')
    if (!d.isDirectory() || !existsSync(p)) continue
    for (const l of readFileSync(p, 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); out[r.id] = r.status }
  }
  return out
}

/** Problems with the ids in `files` ([{ path, text }]); [] when every id is allowed. */
export function checkContent({ index, linkOnly, storeStatus, files, ruled = LINK_ONLY_RULED }) {
  const bad = []
  for (const { path, text } of files) {
    for (const id of new Set(text.match(FACT) || [])) if (!index.facts[id]) bad.push(`${path}: fact ${id} not verified`)
    for (const id of new Set(text.match(MEDIA) || [])) {
      const m = index.media[id]
      if (linkOnly.has(id)) {
        if (m) continue // verified; LINK_ONLY keeps its pixels off the page
        if (ruled[id] && storeStatus[id] === 'disputed') continue
        bad.push(ruled[id]
          ? `${path}: link-only media ${id} is ${storeStatus[id] || 'not in the store'}; the owner ruling covers it only while disputed`
          : `${path}: link-only media ${id} is not verified and has no owner ruling (verify it, add a ruling, or remove it)`)
        continue
      }
      if (!m) bad.push(`${path}: media ${id} not verified`)
      else if (!m.embeddable) bad.push(`${path}: media ${id} not cleared (add to LINK_ONLY or remove)`)
    }
  }
  return bad
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = join(dir, e.name)
  if (e.isDirectory()) return walk(p)
  return /\.(js|jsx|json|py)$/.test(e.name) && e.name !== 'facts.generated.json' && !e.name.endsWith('.test.js') ? [p] : []
})

export function main(root = fileURLToPath(new URL('..', import.meta.url))) {
  const index = JSON.parse(readFileSync(join(root, 'src/tour/data/facts.generated.json'), 'utf8'))
  const linkOnly = readLinkOnly(readFileSync(join(root, 'src/tour/data/artifacts.js'), 'utf8'))
  const storeStatus = readStoreStatus(join(root, '../data/inductees'))
  const files = [...walk(join(root, 'src')), ...walk(join(root, '../assets-src/audio/narration'))].map((path) => ({ path, text: readFileSync(path, 'utf8') }))
  const bad = checkContent({ index, linkOnly, storeStatus, files })
  if (bad.length) { console.error(bad.join('\n')); return 1 }
  console.log('content gate ok')
  return 0
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main())
