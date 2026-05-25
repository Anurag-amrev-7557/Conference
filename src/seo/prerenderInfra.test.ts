import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = resolve(import.meta.dirname, '../..')

describe('prerender infrastructure', () => {
  it('package.json build invokes prerender.mjs', () => {
    const pkg = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8'))
    expect(pkg.scripts.build).toContain('prerender.mjs')
    expect(pkg.scripts.prerender).toBe('node scripts/prerender.mjs')
  })

  it('prerender script uses prerender-paths API', () => {
    const src = readFileSync(resolve(repoRoot, 'scripts/prerender.mjs'), 'utf8')
    expect(src).toMatch(/prerender-paths/)
    expect(src).toMatch(/refusing to prerender \/community/)
  })
})
