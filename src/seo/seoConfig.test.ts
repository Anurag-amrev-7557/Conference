import { describe, it, expect, beforeEach } from 'vitest'
import { resolvePageSeo, normalizeCanonicalPath } from './seoConfig'
import { setSiteOrigin } from './siteUrl'
import { initialData } from '../lib/websiteData'
import type { Article, WebsiteData } from '../lib/websiteData'

function testData(overrides?: Partial<WebsiteData['settings']['seo']>): WebsiteData {
  return {
    ...initialData,
    settings: {
      ...initialData.settings,
      seo: {
        ...initialData.settings.seo,
        title: 'Site Title',
        description: 'Site description',
        googleSiteVerification: 'gsc-token-123',
        ...overrides,
      },
    },
  }
}

const publishedArticle: Article = {
  id: '1',
  slug: 'my-post',
  title: 'My Post',
  category: 'AI',
  time: '5 min',
  excerpt: 'Post excerpt',
  content: 'Body',
  thumbnail: '/thumb.jpg',
  isPublished: true,
  authorName: 'Author',
  authorRole: 'Editor',
  authorAvatar: '/a.jpg',
  publishedAt: '2026-01-01',
}

describe('normalizeCanonicalPath', () => {
  it('strips trailing slash except root', () => {
    expect(normalizeCanonicalPath('/blog/foo/')).toBe('/blog/foo')
    expect(normalizeCanonicalPath('/')).toBe('/')
  })
})

describe('resolvePageSeo', () => {
  beforeEach(() => {
    setSiteOrigin('https://example.com')
  })

  it('returns indexable home SEO with absolute canonical', () => {
    const seo = resolvePageSeo({ pathname: '/', data: testData() })
    expect(seo.robots).toBeUndefined()
    expect(seo.canonical).toBe('https://example.com/')
    expect(seo.ogUrl).toBe('https://example.com/')
    expect(seo.googleSiteVerification).toBe('gsc-token-123')
    expect(seo.title).toContain('Monograph')
  })

  it('uses article title pattern and og:type article for published posts', () => {
    const seo = resolvePageSeo({
      pathname: '/blog/my-post',
      data: testData(),
      article: publishedArticle,
    })
    expect(seo.ogType).toBe('article')
    expect(seo.title).toBe('My Post | Site Title')
    expect(seo.canonical).toBe('https://example.com/blog/my-post')
  })

  it('prefers seoTitle when set', () => {
    const seo = resolvePageSeo({
      pathname: '/blog/my-post',
      data: testData(),
      article: { ...publishedArticle, seoTitle: 'Custom SEO Title' },
    })
    expect(seo.title).toBe('Custom SEO Title')
  })

  it('noindexes missing blog slug with /blog canonical', () => {
    const seo = resolvePageSeo({
      pathname: '/blog/ghost',
      data: testData(),
      article: undefined,
    })
    expect(seo.robots).toBe('noindex,nofollow')
    expect(seo.canonical).toBe('https://example.com/blog')
    expect(seo.googleSiteVerification).toBeUndefined()
  })

  it('noindexes unpublished or noindex articles', () => {
    const unpublished = resolvePageSeo({
      pathname: '/blog/my-post',
      data: testData(),
      article: { ...publishedArticle, isPublished: false },
    })
    expect(unpublished.robots).toBe('noindex,nofollow')

    const flagged = resolvePageSeo({
      pathname: '/blog/my-post',
      data: testData(),
      article: { ...publishedArticle, noindex: true },
    })
    expect(flagged.robots).toBe('noindex,nofollow')
  })

  it('noindexes admin paths without GSC', () => {
    const seo = resolvePageSeo({
      pathname: '/admin/settings',
      data: testData(),
    })
    expect(seo.robots).toBe('noindex,nofollow')
    expect(seo.googleSiteVerification).toBeUndefined()
  })

  it('noindexes community but still emits marketing fields', () => {
    const seo = resolvePageSeo({ pathname: '/community', data: testData() })
    expect(seo.robots).toBe('noindex,nofollow')
    expect(seo.title).toContain('Community')
    expect(seo.description.length).toBeGreaterThan(0)
    expect(seo.ogImage).toMatch(/^https:\/\/example\.com\//)
    expect(seo.googleSiteVerification).toBeUndefined()
  })
})
