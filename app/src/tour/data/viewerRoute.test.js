import { expect, test } from 'vitest'
import { DECLARED_RECORDS, viewerRecord } from './viewerRoute.js'
import { artifactById } from './artifacts.js'

test('?viewer= opens a declared record, a series member and a backdrop photograph', () => {
  for (const id of ['EIN-M-0002', 'EIN-SERIES-BRUNAUER', artifactById('EIN-SERIES-BRUNAUER').letters[0], 'EIN-M-0075', 'NAI-PEACH-BASKET-RECREATION']) {
    const r = viewerRecord(id)
    expect(r.error, id).toBeUndefined()
    expect(r.art.id, id).toBe(id)
  }
})

test('?viewer= with an unknown or undeclared id fails loudly (an error, never the tour)', () => {
  expect(viewerRecord('NOPE-M-0000').error).toMatch(/no record with the id NOPE-M-0000/)
  expect(viewerRecord('').error).toMatch(/No record/)
  // EIN-M-0025 is a record in artifacts.js that no tour shows
  expect(artifactById('EIN-M-0025')).toBeTruthy()
  expect(DECLARED_RECORDS.has('EIN-M-0025')).toBe(false)
  expect(viewerRecord('EIN-M-0025').error).toMatch(/not shown in these tours/)
  // the declared set is the lock's records, not every record artifacts.js knows
  expect(DECLARED_RECORDS.size).toBeGreaterThan(100)
  expect(DECLARED_RECORDS.has('none')).toBe(false)
})
