import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const src = readFileSync(resolve(import.meta.dirname, 'JsonLd.tsx'), 'utf8')

describe('JsonLd presenter (D-07)', () => {
  it('emits single script with @context and @graph', () => {
    expect(src).toMatch(/type="application\/ld\+json"/)
    expect(src).toMatch(/'@context':\s*'https:\/\/schema\.org'/)
    expect(src).toMatch(/'@graph':\s*graph/)
    expect(src).toMatch(/JSON\.stringify/)
  })
})
