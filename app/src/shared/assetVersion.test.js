// Content-versioned model URLs (Codex Task 19 High 2, final review I4): vercel.json caches /models/*
// for a year as immutable, so every glb and bounds.json the app requests must carry a version that
// changes exactly when the file's bytes change.
import { test, expect, vi, afterEach } from 'vitest'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import VERSIONS from 'virtual:asset-versions'
import { versioned } from './assetVersion.js'
import { hashAssets } from '../../scripts/assetVersions.mjs'
import { INDUCTEES } from '../tour/data/index.js'
import { ARTIFACTS } from '../tour/data/artifacts.js'
import { GUIDES, MOTION } from './guide/guides.js'
import { probeRoom } from '../tour/room/probeRoom.js'

const PUBLIC = fileURLToPath(new URL('../../public/', import.meta.url))
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 12)

afterEach(() => vi.unstubAllGlobals())

test('versioned appends the content version, keeps other queries, leaves unknown URLs alone', () => {
  const v = { '/models/a/a.glb': 'abc123' }
  expect(versioned('/models/a/a.glb', v)).toBe('/models/a/a.glb?v=abc123')
  expect(versioned('/models/a/a.glb?x=1', v)).toBe('/models/a/a.glb?x=1&v=abc123')
  expect(versioned('/models/a/a.glb?v=abc123', v)).toBe('/models/a/a.glb?v=abc123')
  expect(versioned('/models/b/b.glb', v)).toBe('/models/b/b.glb')
})

test('the version is a hash of the bytes: a rebuilt file gets a new URL, an unchanged one keeps its URL', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ihh-av-'))
  mkdirSync(join(dir, 'models/r'), { recursive: true })
  writeFileSync(join(dir, 'models/r/r.glb'), 'one')
  writeFileSync(join(dir, 'models/r/bounds.json'), '{}')
  const a = hashAssets(dir)
  expect(Object.keys(a)).toEqual(['/models/r/bounds.json', '/models/r/r.glb'])
  expect(hashAssets(dir)).toEqual(a)
  writeFileSync(join(dir, 'models/r/r.glb'), 'two')
  const b = hashAssets(dir)
  expect(b['/models/r/r.glb']).not.toBe(a['/models/r/r.glb'])
  expect(b['/models/r/bounds.json']).toBe(a['/models/r/bounds.json'])
})

test('every shipped glb and bounds.json under public/models and public/artifacts has its content hash', () => {
  const files = []
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(glb|json)$/.test(e.name)) files.push(p) } }
  walk(join(PUBLIC, 'models'))
  walk(join(PUBLIC, 'artifacts'))
  expect(files.length).toBeGreaterThan(50)
  for (const p of files) expect(VERSIONS[`/${p.slice(PUBLIC.length)}`], p).toBe(sha(p))
})

test('every model URL the tour data and the guides name resolves to a versioned URL', () => {
  const urls = []
  for (const t of Object.values(INDUCTEES)) {
    for (const ch of t.chapters) {
      const room = ch.place?.room
      if (room?.model) {
        urls.push(`${room.model}.glb`)
        if (existsSync(join(PUBLIC, `${room.model}-mobile.glb`))) urls.push(`${room.model}-mobile.glb`)
        urls.push(`${room.model.slice(0, room.model.lastIndexOf('/'))}/bounds.json`)
      }
      for (const a of room?.artifacts || []) if (a.prop?.src) urls.push(a.prop.src)
    }
  }
  for (const a of Object.values(ARTIFACTS)) if (a.model?.src) urls.push(a.model.src)
  expect(urls.length).toBeGreaterThan(40)
  for (const u of urls) expect(versioned(u), u).toMatch(/\?v=[0-9a-f]{12}$/)
  for (const u of [...Object.values(GUIDES).map((g) => g.url), ...Object.values(MOTION)]) expect(u, u).toMatch(/\.glb\?v=[0-9a-f]{12}$/)
})

test('probeRoom fetches the versioned glb and bounds.json, and returns the versioned URL for useGLTF', async () => {
  const seen = []
  vi.stubGlobal('fetch', async (u) => {
    seen.push(u)
    return { ok: true, headers: { get: () => 'model/gltf-binary' }, json: async () => ({ walkable: { x_min: 0, x_max: 1, z_min: 0, z_max: 1 } }) }
  })
  const model = '/models/study/study'
  const out = await probeRoom(model, false)
  expect(out.url).toBe(`${model}.glb?v=${VERSIONS[`${model}.glb`]}`)
  expect(seen).toEqual([out.url, `/models/study/bounds.json?v=${VERSIONS['/models/study/bounds.json']}`])
  const phone = await probeRoom(model, true)
  expect(phone.url).toBe(`${model}-mobile.glb?v=${VERSIONS[`${model}-mobile.glb`]}`)
})
