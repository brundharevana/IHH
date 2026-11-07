// Build gate (postbuild): the production build carries no dev-only surface (final review I3):
// no avatars.html page or its public/avatars narration, no ?demo= tier pages (demo/DemoTiers.jsx),
// no lamarr-demo test tour (tour.html?inductee=lamarr-demo), no viewer test records, no globe map
// variant (?map=globe is dev-only). Exit 1 otherwise.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const FORBIDDEN = [
  ['lamarr-demo', 'the lamarr-demo test tour'],
  ['Keys 1–2 visit the objects', 'the ?demo= tier pages (demo/DemoTiers.jsx)'],
  ['Viewer test: ', 'the viewer test records'],
  ['/avatars/2-narration', 'the avatars page narration'],
  ['globeImageUrl', 'the dev-only globe map variant (three-globe, map/GlobeMap.jsx)'],
]

export function checkDist(dist) {
  const bad = []
  if (!existsSync(join(dist, 'tour.html'))) return [`${dist}: no build (tour.html missing)`]
  for (const f of ['avatars.html', 'avatars']) if (existsSync(join(dist, f))) bad.push(`dist/${f}: dev-only page or files in the production build`)
  const assets = join(dist, 'assets')
  for (const f of readdirSync(assets)) {
    if (/^(DemoTiers|AvatarsPage|Docent|GlobeMap)\b/.test(f)) bad.push(`dist/assets/${f}: dev-only chunk in the production build`)
    if (!f.endsWith('.js')) continue
    const t = readFileSync(join(assets, f), 'utf8')
    for (const [needle, what] of FORBIDDEN) if (t.includes(needle)) bad.push(`dist/assets/${f}: contains ${what} ("${needle}")`)
  }
  return bad
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const bad = checkDist(fileURLToPath(new URL('../dist/', import.meta.url)))
  if (bad.length) { console.error(bad.join('\n')); process.exit(1) }
  console.log('dist ok: no dev-only pages, tours or test records')
}
