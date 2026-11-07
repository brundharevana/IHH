// Visitor-facing rights text names no owner ruling (owner order 2026-11-04): every record of every tour, as the
// record viewer shows its rights line (visitorRights), and every landing credit; the rulings stay in the data.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { visitorRights } from './rightsText.js'
import { ARTIFACTS } from '../tour/data/artifacts.js'
import * as DEMO from '../tour/demo/lamarr-demo-artifacts.js'

const RULING = /owner[\s-]*rul/i
const landing = JSON.parse(readFileSync(new URL('../landing/data/inductees.json', import.meta.url), 'utf8'))
// every "rights" value anywhere in the landing's data (portraits, story points' records)
const landingRights = []
const walk = (x, path) => {
  if (Array.isArray(x)) x.forEach((y, i) => walk(y, `${path}[${i}]`))
  else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) (k === 'rights' && typeof v === 'string' ? landingRights.push([`${path}.${k}`, v]) : walk(v, `${path}.${k}`))
}
walk(landing, 'inductees')

describe('visitor-facing rights text', () => {
  const records = [...Object.values(ARTIFACTS), ...Object.values(DEMO)].filter((a) => a && typeof a === 'object' && typeof a.rights === 'string')
  it('reads every record of the five inductees', () => {
    expect(records.length).toBeGreaterThan(100)
    for (const p of ['EIN', 'LAM', 'MUI', 'ALB', 'NAI']) expect(records.some((a) => String(a.id).startsWith(p)), p).toBe(true)
  })
  it('names no owner ruling on any record viewer label', () => {
    const bad = records.filter((a) => RULING.test(visitorRights(a.rights))).map((a) => `${a.id}: ${visitorRights(a.rights)}`)
    expect(bad).toEqual([])
  })
  it('names no owner ruling in any landing credit', () => {
    const bad = landingRights.filter(([, v]) => RULING.test(visitorRights(v)))
    expect(bad).toEqual([])
    expect(landingRights.length).toBeGreaterThan(0)
  })
  it('keeps the holder’s own words under their own label', () => {
    expect(visitorRights('Public domain (owner ruling 2026-10-27; HathiTrust: “pdus”)')).toBe('Public domain (HathiTrust: “pdus”)')
    expect(visitorRights('Public domain (holder: “Public Domain Mark”; owner ruling 2026-10-27)')).toBe('Public domain (holder: “Public Domain Mark”)')
    expect(visitorRights('Public domain (owner ruling 2026-10-29: a US federal publication; govinfo: “Copyright protection under this title is not available for any work of the United States Government”)')).toBe('Public domain (govinfo: “Copyright protection under this title is not available for any work of the United States Government”)')
    expect(visitorRights('Public domain (an official record of the Secretary of State, owner ruling; holder: “Unrestricted”)')).toBe('Public domain (holder: “Unrestricted”)')
    expect(visitorRights('Public domain (owner-ruled)')).toBe('Public domain')
    // a semicolon inside the holder's quotation is theirs: the clause is not split there
    expect(visitorRights('Public domain (owner ruling 2026-10-29; holder: “a; b”)')).toBe('Public domain (holder: “a; b”)')
    // rights words with no ruling are shown as written
    expect(visitorRights('Public domain (no known restrictions on publication)')).toBe('Public domain (no known restrictions on publication)')
    expect(visitorRights(null)).toBe(null)
  })
  it('the record EIN-M-0083 reads as the holder says; its data keeps the ruling', () => {
    expect(visitorRights(ARTIFACTS['EIN-M-0083'].rights)).toBe('Public domain (HathiTrust: “pdus”)')
    expect(ARTIFACTS['EIN-M-0083'].rights).toMatch(/owner ruling 2026-10-27/)
  })
})
