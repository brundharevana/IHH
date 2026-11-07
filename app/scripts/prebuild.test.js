// The build runs every content gate before vite: a gate dropped from this chain would let unverified
// facts, uncleared pixels, ungrounded narration or stale audio ship with a green build.
import { test, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

test('prebuild runs the index drift check, content, texture, narration and audio gates and the tour data rules (map legs, displayed numbers), all fail-fast', () => {
  const steps = pkg.scripts.prebuild.split(' && ')
  expect(steps).toEqual([
    'python3 scripts/build_fact_index.py --check',
    'node scripts/check_content.mjs',
    'python3 scripts/check_textures.py',
    'python3 ../assets-src/audio/check_narration.py --quiet',
    'python3 ../assets-src/audio/build_guide_audio.py --check',
    'vitest run src/tour/data',
  ])
  expect(pkg.scripts.postbuild).toBe("node scripts/check_budgets.mjs && node scripts/check_dist.mjs")
})
