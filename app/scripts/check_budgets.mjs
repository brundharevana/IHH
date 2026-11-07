// Build gate (spec section 5, performance budgets). Exit 1 on any breach:
//   - a room model public/models/*/*.glb over 10 MB, or a phone variant (*-mobile.glb) over 5 MB;
//   - the initial JS of embed.html over 20 KB gzip (a poster and two buttons);
//   - the initial JS of index.html or tour.html over 600 KB gzip: the entry script plus every chunk
//     the page preloads (Vite lists an entry's static imports as modulepreload links); chunks
//     reached only through import() load on demand and are not counted.
// Every glb under public/models counts, whether or not a tour uses it. Sizes are decimal (1 MB =
// 1,000,000 bytes), the stricter reading.
// usage: node scripts/check_budgets.mjs [--models <dir>] [--dist <dir>]   (after `vite build`)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const MB = 1_000_000
const KB = 1_000
export const BUDGET = { glb: 10 * MB, mobileGlb: 5 * MB, initialGzip: 600 * KB }
const ENTRIES = ['index.html', 'tour.html', 'embed.html']
// the WordPress embed page is a poster and two buttons: its script must stay tiny
const EMBED_BUDGET = 20 * KB

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}
const root = new URL('..', import.meta.url).pathname
const modelsDir = arg('--models', join(root, 'public/models'))
const distDir = arg('--dist', join(root, 'dist'))
const mb = (n) => `${(n / MB).toFixed(2)} MB`
const kb = (n) => `${(n / KB).toFixed(1)} KB`

const bad = []
const info = []

function glbs(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return glbs(p)
    return e.name.endsWith('.glb') ? [p] : []
  })
}

const models = glbs(modelsDir)
if (!models.length) bad.push(`no .glb under ${modelsDir}: nothing to measure`)
let largest = { size: 0 }
for (const p of models) {
  const size = statSync(p).size
  if (size > largest.size) largest = { size, p }
  const mobile = p.endsWith('-mobile.glb')
  const limit = mobile ? BUDGET.mobileGlb : BUDGET.glb
  if (size > limit) bad.push(`${p}: ${mb(size)} is over the ${mobile ? 'phone (mobile glb)' : 'desktop glb'} budget of ${mb(limit)}`)
}
if (models.length) info.push(`${models.length} glb, largest ${mb(largest.size)} (${largest.p.replace(modelsDir, '')})`)

for (const page of ENTRIES) {
  const file = join(distDir, page)
  if (!existsSync(file)) {
    bad.push(`${file}: missing, build first (nothing to measure)`)
    continue
  }
  const html = readFileSync(file, 'utf8')
  const hrefs = new Set()
  for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) hrefs.add(m[1])
  for (const m of html.matchAll(/<link\b[^>]*\brel="modulepreload"[^>]*\bhref="([^"]+)"/g)) hrefs.add(m[1])
  for (const m of html.matchAll(/<link\b[^>]*\bhref="([^"]+)"[^>]*\brel="modulepreload"/g)) hrefs.add(m[1])
  let total = 0
  for (const h of hrefs) {
    const f = join(distDir, h.replace(/^\//, ''))
    if (!existsSync(f)) {
      bad.push(`${page}: ${h} is referenced but not in ${distDir}`)
      continue
    }
    total += gzipSync(readFileSync(f)).length
  }
  if (!hrefs.size) bad.push(`${page}: no entry script found`)
  info.push(`${page}: initial JS ${kb(total)} gzip in ${hrefs.size} chunk(s)`)
  const limit = page === 'embed.html' ? EMBED_BUDGET : BUDGET.initialGzip
  if (total > limit) bad.push(`${page}: initial JS is ${kb(total)} gzip, over the ${kb(limit)} budget`)
}

if (bad.length) {
  console.error(bad.join('\n'))
  console.error(info.join('\n'))
  process.exit(1)
}
console.log(`budgets ok\n${info.join('\n')}`)
