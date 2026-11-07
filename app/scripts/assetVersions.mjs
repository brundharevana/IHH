// Content versions for the static models the app requests (vercel.json caches /models/* for a year as
// immutable, so a rebuilt room must arrive under a new URL). At build (and dev) time this plugin hashes
// every .glb and .json under public/models and public/artifacts and serves the map as the virtual
// module 'virtual:asset-versions': { '/models/<id>/<id>.glb': '<12 hex of sha256>' }. The app appends
// it as ?v= (src/shared/assetVersion.js), so the URL changes exactly when the file's bytes change.
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

export const VERSIONED_DIRS = ['models', 'artifacts']
const EXT = /\.(glb|json)$/

export function hashAssets(publicDir, dirs = VERSIONED_DIRS) {
  const out = {}
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (EXT.test(e.name)) out[`/${relative(publicDir, p).split(sep).join('/')}`] = createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 12)
    }
  }
  for (const d of dirs) if (existsSync(join(publicDir, d))) walk(join(publicDir, d))
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
}

export function assetVersions(publicDir) {
  const id = 'virtual:asset-versions'
  return {
    name: 'ihh-asset-versions',
    resolveId: (s) => (s === id ? `\0${id}` : null),
    load: (s) => (s === `\0${id}` ? `export default ${JSON.stringify(hashAssets(publicDir))}` : null),
  }
}
