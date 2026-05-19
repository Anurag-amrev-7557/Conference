import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const src = readFileSync(resolve(import.meta.dirname, 'SeoHead.tsx'), 'utf8')

describe('SeoHead twitter tags (META-04)', () => {
  it('uses name= for twitter:* not property=', () => {
    expect(src).toMatch(/name="twitter:card"/)
    expect(src).toMatch(/name="twitter:title"/)
    expect(src).not.toMatch(/property="twitter:/)
  })
})
