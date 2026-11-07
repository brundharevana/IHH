import { describe, it, expect } from 'vitest'
import { dprFor } from './dpr.js'

describe('dprFor', () => {
  it('caps a phone at 1.5', () => expect(dprFor(true)).toEqual([1, 1.5]))
  it('caps a desktop at 2', () => expect(dprFor(false)).toEqual([1, 2]))
})
