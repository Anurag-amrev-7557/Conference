import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')
const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8')

describe('index.html shell (META-06)', () => {
  it('has no og: or twitter: meta tags in static shell', () => {
    expect(indexHtml).not.toMatch(/property=["']og:/)
    expect(indexHtml).not.toMatch(/name=["']twitter:/)
  })

  it('has no static canonical link', () => {
    expect(indexHtml).not.toMatch(/rel=["']canonical["']/)
  })
})

describe('public OG fallback asset (D-06)', () => {
  it('og-image.jpg exists for absoluteUrl fallback', () => {
    expect(existsSync(resolve(root, 'public/og-image.jpg'))).toBe(true)
  })
})
