// The content gate (check_content.mjs) fails on any fact or media id the data names that is not
// verified (media: and cleared), and on a link-only id that is neither verified nor owner-ruled.
import { test, expect } from 'vitest'
import { checkContent, readLinkOnly, LINK_ONLY_RULED, main } from './check_content.mjs'

const index = {
  facts: { 'XXX-F-0001': { claim: 'a' } },
  media: {
    'XXX-M-0001': { embeddable: true },
    'XXX-M-0002': { embeddable: false },
  },
}
const run = (text, { linkOnly = [], storeStatus = {}, ruled = {} } = {}) =>
  checkContent({ index, linkOnly: new Set(linkOnly), storeStatus, ruled, files: [{ path: 'data.js', text }] })

test('verified facts and cleared media pass', () => {
  expect(run("{ factIds: ['XXX-F-0001'], media: 'XXX-M-0001' }")).toEqual([])
})

test('a fact that is not verified fails', () => {
  expect(run("'XXX-F-0002'")).toEqual(['data.js: fact XXX-F-0002 not verified'])
})

test('a media id that is not verified fails, and one not cleared fails unless link-only', () => {
  expect(run("'XXX-M-0009'")).toEqual(['data.js: media XXX-M-0009 not verified'])
  expect(run("'XXX-M-0002'")[0]).toMatch(/media XXX-M-0002 not cleared/)
  expect(run("'XXX-M-0002'", { linkOnly: ['XXX-M-0002'] })).toEqual([])
})

test('a link-only id must be verified or owner-ruled; a ruling holds only while the record is disputed', () => {
  expect(run("'XXX-M-0009'", { linkOnly: ['XXX-M-0009'], storeStatus: { 'XXX-M-0009': 'rejected' } })[0]).toMatch(/not verified and has no owner ruling/)
  const ruled = { 'XXX-M-0009': 'Owner ruling: link only.' }
  expect(run("'XXX-M-0009'", { linkOnly: ['XXX-M-0009'], storeStatus: { 'XXX-M-0009': 'disputed' }, ruled })).toEqual([])
  for (const status of ['rejected', 'refuted', undefined]) {
    expect(run("'XXX-M-0009'", { linkOnly: ['XXX-M-0009'], storeStatus: { 'XXX-M-0009': status }, ruled })[0]).toMatch(/covers it only while disputed/)
  }
})

test('LINK_ONLY is read from artifacts.js; a file without it is an error', () => {
  expect([...readLinkOnly("export const LINK_ONLY = new Set(['XXX-M-0001', 'XXX-M-0002'])")]).toEqual(['XXX-M-0001', 'XXX-M-0002'])
  expect(() => readLinkOnly('nothing here')).toThrow(/LINK_ONLY not found/)
})

test('the owner-ruled link-only records are exactly the two handwritten letters', () => {
  // any further link-only ruling needs its own owner decision and must change this test on purpose
  expect(Object.keys(LINK_ONLY_RULED).sort()).toEqual(['ALB-M-0054', 'ALB-M-0056'])
})

test('the shipped data passes the gate', () => {
  expect(main()).toBe(0)
})
