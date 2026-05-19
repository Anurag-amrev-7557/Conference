import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { absoluteUrl, getSiteUrl } from './siteUrl'

describe('getSiteUrl', () => {
  const env = process.env

  beforeEach(() => {
    process.env = { ...env }
  })

  afterEach(() => {
    process.env = env
    vi.restoreAllMocks()
  })

  it('returns https origin without trailing slash in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.SITE_URL = 'https://monograph.superhumanly.ai/'
    expect(getSiteUrl()).toBe('https://monograph.superhumanly.ai')
  })

  it('throws when SITE_URL is missing in production', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.SITE_URL
    expect(() => getSiteUrl()).toThrow(/SITE_URL/)
  })

  it('throws when SITE_URL is not https in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.SITE_URL = 'http://insecure.example.com'
    expect(() => getSiteUrl()).toThrow(/https/)
  })

  it('uses dev fallback when SITE_URL unset in development', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.SITE_URL
    expect(getSiteUrl()).toBe('http://localhost:5173')
  })
})

describe('absoluteUrl', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production'
    process.env.SITE_URL = 'https://example.com'
  })

  it('joins origin and path with single slash', () => {
    expect(absoluteUrl('/blog/foo')).toBe('https://example.com/blog/foo')
  })

  it('normalizes path without leading slash', () => {
    expect(absoluteUrl('blog/foo')).toBe('https://example.com/blog/foo')
  })
})
