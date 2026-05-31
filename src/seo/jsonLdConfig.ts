import type { Article, AppEvent, SiteBookSettings, WebsiteData } from '../lib/websiteData'
import { absoluteUrl } from './siteUrl'
import { isAdminPath, parseBlogSlug, routeDefaults } from './routes'
import type { Event, Place, Thing } from 'schema-dts'

/** Nodes inside `@graph` — no per-node `@context` (root script supplies it). */
export type JsonLdNode = Thing

export function hasBookData(book?: SiteBookSettings): boolean {
  if (!book) return false
  return !!(
    book.title?.trim() ||
    book.authorName?.trim() ||
    book.isbn?.trim() ||
    book.coverImageUrl?.trim()
  )
}

export function buildWebSiteSchema(data: WebsiteData): JsonLdNode {
  const site = data.settings.seo
  return {
    '@type': 'WebSite',
    name: site.title,
    url: absoluteUrl('/'),
    description: site.description,
  }
}

export function buildOrganizationSchema(data: WebsiteData): JsonLdNode {
  const site = data.settings.seo
  const logo = site.ogImage?.trim()
    ? site.ogImage.startsWith('http')
      ? site.ogImage
      : absoluteUrl(site.ogImage)
    : absoluteUrl('/favicon.svg')
  return {
    '@type': 'Organization',
    name: data.appearance.brandName || site.title,
    url: absoluteUrl('/'),
    logo,
  }
}

export function buildBookSchema(data: WebsiteData): JsonLdNode | null {
  const book = data.settings.book
  if (!hasBookData(book)) return null
  const node: JsonLdNode = {
    '@type': 'Book',
    name: book?.title?.trim() || data.settings.seo.title,
  }
  if (book?.authorName?.trim()) {
    node.author = { '@type': 'Person', name: book.authorName }
  }
  if (book?.isbn?.trim()) node.isbn = book.isbn.trim()
  if (book?.coverImageUrl?.trim()) {
    node.image = book.coverImageUrl.startsWith('http')
      ? book.coverImageUrl
      : absoluteUrl(book.coverImageUrl)
  }
  if (book?.publisherName?.trim()) {
    node.publisher = { '@type': 'Organization', name: book.publisherName }
  }
  return node
}

export function buildBlogPostingSchema(data: WebsiteData, article: Article): JsonLdNode {
  const site = data.settings.seo
  const headline = article.seoTitle ?? `${article.title} | ${site.title}`
  const description = article.seoDescription ?? article.excerpt ?? site.description
  const image = article.ogImage?.trim()
    ? article.ogImage.startsWith('http')
      ? article.ogImage
      : absoluteUrl(article.ogImage)
    : article.thumbnail?.trim()
      ? article.thumbnail.startsWith('http')
        ? article.thumbnail
        : absoluteUrl(article.thumbnail)
      : undefined
  const node: JsonLdNode = {
    '@type': 'BlogPosting',
    headline,
    description,
    datePublished: article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/blog/${article.slug}`),
    },
  }
  if (image) node.image = image
  return node
}

export function buildBreadcrumbSchema(
  items: { name: string; path: string }[],
): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function buildEventSchema(event: AppEvent): JsonLdNode | null {
  if (!event.isPublished || !event.startDate) return null
  const location: Place = {
    '@type': 'Place',
    name: event.location,
  }
  if (event.lat != null && event.lng != null) {
    location.geo = {
      '@type': 'GeoCoordinates',
      latitude: event.lat,
      longitude: event.lng,
    }
  }
  const node: Event = {
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    location,
  }
  if (event.endDate) node.endDate = event.endDate
  if (event.thumbnail?.trim()) {
    node.image = event.thumbnail.startsWith('http')
      ? event.thumbnail
      : absoluteUrl(event.thumbnail)
  }
  return node
}

function homeLabel(data: WebsiteData): string {
  return data.appearance.brandName || data.settings.seo.title || 'Home'
}

function blogLabel(): string {
  const title = routeDefaults['/blog'].title ?? 'Blog'
  return title.split('—')[0]?.trim() || title
}

export function resolvePageJsonLd(input: {
  pathname: string
  data: WebsiteData
  article?: Article
}): JsonLdNode[] {
  const { pathname, data, article } = input
  const graph: JsonLdNode[] = []

  if (isAdminPath(pathname) || pathname === '/dashboard') {
    return graph
  }

  if (pathname === '/') {
    graph.push(buildWebSiteSchema(data), buildOrganizationSchema(data))
    return graph
  }

  if (pathname === '/home') {
    graph.push(buildWebSiteSchema(data), buildOrganizationSchema(data))
    const book = buildBookSchema(data)
    if (book) graph.push(book)
    return graph
  }

  if (pathname === '/blog') {
    graph.push(
      buildBreadcrumbSchema([
        { name: homeLabel(data), path: '/' },
        { name: blogLabel(), path: '/blog' },
      ]),
    )
    return graph
  }

  const blogSlug = parseBlogSlug(pathname)
  if (blogSlug) {
    if (article?.isPublished && article.noindex !== true) {
      graph.push(buildBlogPostingSchema(data, article))
      graph.push(
        buildBreadcrumbSchema([
          { name: homeLabel(data), path: '/' },
          { name: blogLabel(), path: '/blog' },
          { name: article.title, path: `/blog/${article.slug}` },
        ]),
      )
    }
    return graph
  }

  if (pathname === '/events') {
    graph.push(
      buildBreadcrumbSchema([
        { name: homeLabel(data), path: '/' },
        { name: 'Events', path: '/events' },
      ]),
    )
    for (const event of data.events) {
      const node = buildEventSchema(event)
      if (node) graph.push(node)
    }
    return graph
  }

  return graph
}
