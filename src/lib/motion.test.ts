import { describe, expect, it } from 'vitest'
import { motionInitial } from './motion'

describe('motion helpers', () => {
  it('motionInitial returns false when user prefers reduced motion', () => {
    expect(motionInitial(true)).toBe(false)
  })

  it('motionInitial returns undefined when motion is allowed', () => {
    expect(motionInitial(false)).toBeUndefined()
  })
})
