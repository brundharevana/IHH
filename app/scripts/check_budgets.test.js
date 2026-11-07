// check_budgets.mjs on fixture trees: a breach of any budget exits 1 and names it, a tree inside
// every budget exits 0.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { Buffer } from 'node:buffer'

const SCRIPT = new URL('./check_budgets.mjs', import.meta.url).pathname
let root
const put = (rel, bytes) => {
  const p = join(root, rel)
  mkdirSync(join(p, '..'), { recursive: true })
  writeFileSync(p, typeof bytes === 'number' ? Buffer.alloc(bytes, 1) : bytes)
}
// random bytes do not compress: the gzip size is about the byte size
const noise = (n) => randomBytes(n)
const html = (script, preloads = []) =>
  `<script type="module" src="/assets/${script}"></script>${preloads.map((p) => `<link rel="modulepreload" href="/assets/${p}">`).join('')}`
const run = () => spawnSync('node', [SCRIPT, '--models', join(root, 'public/models'), '--dist', join(root, 'dist')], { encoding: 'utf8' })

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'budgets-'))
  put('public/models/room-a/room-a.glb', 1000)
  put('public/models/room-a/room-a-mobile.glb', 1000)
  put('dist/assets/tour.js', noise(1000))
  put('dist/assets/vendor.js', noise(1000))
  put('dist/assets/main.js', noise(1000))
  put('dist/tour.html', html('tour.js', ['vendor.js']))
  put('dist/index.html', html('main.js'))
  put('dist/embed.js', noise(1000))
  put('dist/embed.html', '<script src="/embed.js"></script>')
})
afterEach(() => rmSync(root, { recursive: true, force: true }))

describe('check_budgets', () => {
  it('passes a tree inside every budget', () => {
    const r = run()
    expect(r.status).toBe(0)
    expect(r.stdout).toMatch(/budgets ok/)
  })

  it('fails a desktop glb over 10 MB', () => {
    put('public/models/room-a/room-b.glb', 10_000_001)
    const r = run()
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/room-b\.glb/)
  })

  it('fails a mobile glb over 5 MB (and holds it to 5 MB, not 10)', () => {
    put('public/models/room-a/room-b-mobile.glb', 5_000_001)
    const r = run()
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/room-b-mobile\.glb/)
  })

  it('fails when an entry loads more than 600 KB gzip eagerly, counting its modulepreloads', () => {
    put('dist/assets/vendor.js', noise(600_000))
    const r = run()
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/tour\.html/)
  })

  it('does not count a chunk the entry only imports lazily', () => {
    put('dist/assets/lazy.js', noise(900_000))
    const r = run()
    expect(r.status).toBe(0)
  })

  it('fails when the embed page script is over 20 KB gzip (it must stay a poster and two buttons)', () => {
    put('dist/embed.js', noise(21_000))
    const r = run()
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/embed\.html/)
  })

  it('fails when dist has no embed.html (nothing to measure)', () => {
    rmSync(join(root, 'dist/embed.html'))
    const r = run()
    expect(r.status).toBe(1)
  })

  it('fails when dist has no entry html (nothing to measure)', () => {
    rmSync(join(root, 'dist/tour.html'))
    const r = run()
    expect(r.status).toBe(1)
  })
})
