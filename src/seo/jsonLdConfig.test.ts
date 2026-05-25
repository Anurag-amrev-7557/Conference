import { describe, expect, it, beforeEach } from 'vitest'
import {
  buildBookSchema,
  buildEventSchema,
  hasBookData,
  resolvePageJsonLd,
} from './jsonLdConfig'
import { setSiteOrigin } from './siteUrl'
import { initialData } from '../lib/websiteData'
import type { Article, WebsiteData } from '../lib/websiteData'

function testData(overrides?: Partial<WebsiteData>): WebsiteData {
  return {
    ...initialData,
    settings: {
      ...initialData.settings,
      seo: {
        ...initialData.settings.seo,
        title: 'Site Title',
        description: 'Site description',
      },
      book: {
        title: 'Agentic Playbook',
        authorName: 'Jane Author',
        isbn: '9781234567890',
      },
    },
    ...overrides,
  }
}

const publishedArticle: Article = {
  id: '1',
  slug: 'my-post',
  title: 'My Post',
  category: 'AI',
  time: '5 min',
  excerpt: 'Excerpt',
  content: 'Body',
  thumbnail: '/thumb.jpg',
  isPublished: true,
  authorName: 'Author',
  authorRole: 'Editor',
  authorAvatar: '/a.jpg',
  publishedAt: '2026-01-01',
}

describe('hasBookData', () => {
  it('returns true when any book field is set', () => {
    expect(hasBookData({ isbn: '9781234567890' })).toBe(true)
  })
  it('returns false when book is empty', () => {
    expect(hasBookData({})).toBe(false)
  })
})

describe('resolvePageJsonLd', () => {
  beforeEach(() => {
    setSiteOrigin('https://example.com')
  })

  it('includes WebSite and Organization on home', () => {
    const graph = resolvePageJsonLd({ pathname: '/', data: testData() })
    const types = graph.map((n) => n['@type'])
    expect(types).toContain('WebSite')
    expect(types).toContain('Organization')
    expect(types).toContain('Book')
  })

  it('omits Book when no book metadata', () => {
    const graph = resolvePageJsonLd({
      pathname: '/',
      data: testData({ settings: { ...testData().settings, book: {} } }),
    })
    expect(graph.map((n) => n['@type'])).not.toContain('Book')
  })

  it('includes BlogPosting and BreadcrumbList for published article', () => {
    const graph = resolvePageJsonLd({
      pathname: '/blog/my-post',
      data: testData(),
      article: publishedArticle,
    })
    const types = graph.map((n) => n['@type'])
    expect(types).toContain('BlogPosting')
    expect(types).toContain('BreadcrumbList')
  })

  it('omits BlogPosting for noindex article', () => {
    const graph = resolvePageJsonLd({
      pathname: '/blog/my-post',
      data: testData(),
      article: { ...publishedArticle, noindex: true },
    })
    expect(graph.map((n) => n['@type'])).not.toContain('BlogPosting')
  })

  it('includes Event only when startDate is set', () => {
    const graph = resolvePageJsonLd({
      pathname: '/events',
      data: testData({
        events: [
          {
            id: 'e1',
            day: '1',
            weekday: 'Mon',
            time: '10:00',
            full_time: 'x',
            title: 'Workshop',
            host: 'Host',
            location: 'Online',
            tags: [],
            price: 'Free',
            thumbnail: '/e.jpg',
            status: 'Upcoming',
            isPublished: true,
            startDate: '2026-06-01T18:00:00.000Z',
          },
          {
            id: 'e2',
            day: '2',
            weekday: 'Tue',
            time: '10:00',
            full_time: 'y',
            title: 'No ISO',
            host: 'Host',
            location: 'Online',
            tags: [],
            price: 'Free',
            thumbnail: '/e.jpg',
            status: 'Upcoming',
            isPublished: true,
          },
        ],
      }),
    })
    const events = graph.filter((n) => n['@type'] === 'Event')
    expect(events).toHaveLength(1)
    expect(events[0].name).toBe('Workshop')
  })

  it('returns empty graph for admin', () => {
    expect(resolvePageJsonLd({ pathname: '/admin', data: testData() })).toEqual([])
  })
})

describe('buildBookSchema', () => {
  beforeEach(() => setSiteOrigin('https://example.com'))

  it('includes isbn when provided', () => {
    const book = buildBookSchema(testData())
    expect(book?.isbn).toBe('9781234567890')
  })
})

describe('buildEventSchema', () => {
  beforeEach(() => setSiteOrigin('https://example.com'))

  it('includes GeoCoordinates when lat/lng set', () => {
    const event = buildEventSchema({
      id: 'e1',
      day: '1',
      weekday: 'Mon',
      time: '10:00',
      full_time: 'x',
      title: 'Workshop',
      host: 'Host',
      location: 'HQ',
      tags: [],
      price: 'Free',
      thumbnail: '/e.jpg',
      status: 'Upcoming',
      isPublished: true,
      startDate: '2026-06-01T18:00:00.000Z',
      lat: 37.77,
      lng: -122.42,
    })
    expect(event?.location).toMatchObject({
      '@type': 'Place',
      geo: { '@type': 'GeoCoordinates', latitude: 37.77, longitude: -122.42 },
    })
  })

  it('returns null without startDate', () => {
    expect(
      buildEventSchema({
        id: 'e2',
        day: '2',
        weekday: 'Tue',
        time: '10:00',
        full_time: 'y',
        title: 'No date',
        host: 'Host',
        location: 'Online',
        tags: [],
        price: 'Free',
        thumbnail: '/e.jpg',
        status: 'Upcoming',
        isPublished: true,
      }),
    ).toBeNull()
  })
})
