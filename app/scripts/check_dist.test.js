// check_dist.mjs fails a build that carries a dev-only page, chunk, tour or test record.
import { test, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkDist } from './check_dist.mjs'

const dist = (files) => {
  const d = mkdtempSync(join(tmpdir(), 'ihh-dist-'))
  mkdirSync(join(d, 'assets'))
  writeFileSync(join(d, 'tour.html'), '<html></html>')
  for (const [f, t] of Object.entries(files)) { mkdirSync(join(d, f, '..'), { recursive: true }); writeFileSync(join(d, f), t) }
  return d
}

test('a clean build passes', () => {
  expect(checkDist(dist({ 'assets/tour-abc.js': 'const a = "einstein"' }))).toEqual([])
})

test('dev-only pages, chunks, tours and test records fail', () => {
  const bad = checkDist(dist({
    'avatars.html': '<html></html>',
    'avatars/2-narration.vtt': 'WEBVTT',
    'assets/DemoTiers-x1.js': '',
    'assets/GlobeMap-x2.js': '',
    'assets/map-x3.js': 'const p = { globeImageUrl: {} }',
    'assets/tour-abc.js': 'const t = { "lamarr-demo": {} }; const v = "Viewer test: photo set"',
  }))
  expect(bad.some((b) => b.startsWith('dist/avatars.html'))).toBe(true)
  expect(bad.some((b) => b.startsWith('dist/avatars:'))).toBe(true)
  expect(bad.some((b) => b.includes('DemoTiers-x1.js: dev-only chunk'))).toBe(true)
  expect(bad.some((b) => b.includes('the lamarr-demo test tour'))).toBe(true)
  expect(bad.some((b) => b.includes('the viewer test records'))).toBe(true)
  expect(bad.some((b) => b.includes('GlobeMap-x2.js: dev-only chunk'))).toBe(true)
  expect(bad.some((b) => b.includes('map-x3.js: contains the dev-only globe map variant'))).toBe(true)
})
