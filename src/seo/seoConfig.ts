import type { AppEvent, Article } from '../lib/websiteData'
import { absoluteUrl } from './siteUrl'
import {
  isAdminPath,
  isPublicMarketingPath,
  parseBlogSlug,
  parseEventId,
  routeDefaults,
  type PublicRoutePath,
} from './routes'
import { pickRouteSeoOverride } from './routeSeoLegacy'
import type { PageSeo, ResolvePageSeoInput } from './types'

export function normalizeCanonicalPath(pathname: string): string {
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export function resolveImageUrl(url: string | undefined, fallbackPath: string): string {
  if (!url?.trim()) {
    return absoluteUrl(fallbackPath)
  }
  if (/^https?:\/\//i.test(url)) {
    return url
  }
  return absoluteUrl(url.startsWith('/') ? url : `/${url}`)
}

function siteVerification(data: ResolvePageSeoInput['data']): string | undefined {
  const token = data.settings.seo.googleSiteVerification?.trim()
  return token || undefined
}

function socialMeta(data: ResolvePageSeoInput['data']): Pick<PageSeo, 'ogSiteName' | 'ogLocale' | 'twitterSite'> {
  const seo = data.settings.seo
  return {
    ogSiteName: seo.ogSiteName?.trim() || seo.title?.trim() || undefined,
    ogLocale: seo.ogLocale?.trim() || 'en_US',
    twitterSite: seo.twitterSite?.trim() || undefined,
  }
}

function basePageSeo(
  partial: Omit<PageSeo, 'ogUrl'> & { ogUrl?: string },
  data: ResolvePageSeoInput['data'],
): PageSeo {
  return {
    ...partial,
    ogUrl: partial.ogUrl ?? partial.canonical,
    ...socialMeta(data),
  }
}

function routeOverride(
  pathname: PublicRoutePath,
  data: ResolvePageSeoInput['data'],
): (typeof routeDefaults)[PublicRoutePath] {
  const cms = pickRouteSeoOverride(data.settings.routeSeo, pathname)
  const code = routeDefaults[pathname]
  return {
    title: cms?.title ?? code.title,
    description: cms?.description ?? code.description,
    ogImage: cms?.ogImage ?? code.ogImage,
  }
}

function staticMarketingSeo(
  pathname: PublicRoutePath,
  data: ResolvePageSeoInput['data'],
  robots?: PageSeo['robots'],
): PageSeo {
  const site = data.settings.seo
  const defaults = routeOverride(pathname, data)
  const canonicalPath = normalizeCanonicalPath(pathname)
  const title = defaults.title ?? site.title
  const description = defaults.description ?? site.description
  const ogImage = resolveImageUrl(defaults.ogImage ?? site.ogImage, '/og-image.jpg')
  const canonical = absoluteUrl(canonicalPath)
  const indexable = !robots

  return basePageSeo(
    {
      title,
      description,
      canonical,
      ogType: 'website',
      ogImage,
      robots,
      googleSiteVerification: indexable ? siteVerification(data) : undefined,
    },
    data,
  )
}

function articleSeo(data: ResolvePageSeoInput['data'], article: Article): PageSeo {
  const site = data.settings.seo
  const title = article.seoTitle ?? `${article.title} | ${site.title}`
  const description = article.seoDescription ?? article.excerpt ?? site.description
  const ogImage = resolveImageUrl(article.ogImage ?? site.ogImage, '/og-image.jpg')
  const canonicalPath = normalizeCanonicalPath(`/blog/${article.slug}`)
  const canonical = absoluteUrl(canonicalPath)
  const noindex = article.noindex === true || !article.isPublished

  return basePageSeo(
    {
      title,
      description,
      canonical,
      ogType: 'article',
      ogImage,
      robots: noindex ? 'noindex,nofollow' : undefined,
      googleSiteVerification: noindex ? undefined : siteVerification(data),
    },
    data,
  )
}

function eventSeo(data: ResolvePageSeoInput['data'], event: AppEvent): PageSeo {
  const site = data.settings.seo
  const title = event.seoTitle ?? `${event.title} | ${site.title}`
  const description =
    event.seoDescription ?? `${event.title} — ${event.host} at ${event.location}. ${site.description}`
  const ogImage = resolveImageUrl(event.ogImage ?? event.thumbnail ?? site.ogImage, '/og-image.jpg')
  const canonicalPath = normalizeCanonicalPath(`/events/${event.id}`)
  const canonical = absoluteUrl(canonicalPath)
  const noindex = event.noindex === true || !event.isPublished

  return basePageSeo(
    {
      title,
      description,
      canonical,
      ogType: 'website',
      ogImage,
      robots: noindex ? 'noindex,nofollow' : undefined,
      googleSiteVerification: noindex ? undefined : siteVerification(data),
    },
    data,
  )
}

function missingEventSeo(data: ResolvePageSeoInput['data']): PageSeo {
  const site = data.settings.seo
  const defaults = routeOverride('/events', data)
  return basePageSeo(
    {
      title: defaults.title ?? site.title,
      description: defaults.description ?? site.description,
      canonical: absoluteUrl('/events'),
      ogType: 'website',
      ogImage: resolveImageUrl(site.ogImage, '/og-image.jpg'),
      robots: 'noindex,nofollow',
    },
    data,
  )
}

function missingBlogSlugSeo(data: ResolvePageSeoInput['data']): PageSeo {
  const site = data.settings.seo
  const defaults = routeOverride('/blog', data)
  return basePageSeo(
    {
      title: defaults.title ?? site.title,
      description: defaults.description ?? site.description,
      canonical: absoluteUrl('/blog'),
      ogType: 'website',
      ogImage: resolveImageUrl(site.ogImage, '/og-image.jpg'),
      robots: 'noindex,nofollow',
    },
    data,
  )
}

const ADMIN_ROUTE_META: Record<
  string,
  { page: string; description: string }
> = {
  '/admin': { page: 'Sign in', description: 'Admin sign-in for the content management system.' },
  '/admin/dashboard': {
    page: 'Dashboard',
    description: 'Overview of site content, publishing status, and workspace shortcuts.',
  },
  '/admin/design': {
    page: 'Brand & theme',
    description: 'Manage brand colors, typography, theme tokens, and identity.',
  },
  '/admin/media': {
    page: 'Media library',
    description: 'Upload and manage images for the public site.',
  },
  '/admin/blogs': {
    page: 'Blog workspace',
    description: 'Create articles and configure the blog listing page and SEO.',
  },
  '/admin/events': {
    page: 'Events workspace',
    description: 'Manage events, calendar listings, page hero, and SEO.',
  },
  '/admin/settings': {
    page: 'Site settings',
    description: 'Global SEO defaults, navigation, scripts, and structured data.',
  },
  '/admin/conference': {
    page: 'Summit homepage',
    description:
      'Edit summit content, embedded blocks, per-section visibility, SEO, custom CSS, and scripts for /.',
  },
}

function adminSeo(data: ResolvePageSeoInput['data'], pathname: string): PageSeo {
  const site = data.settings.seo
  const normalized = normalizeCanonicalPath(pathname.startsWith('/admin') ? pathname : `/admin${pathname}`)
  const meta = ADMIN_ROUTE_META[normalized] ?? ADMIN_ROUTE_META['/admin/dashboard']
  const siteName = site.title?.trim() || 'Superhumanly'
  const title = `${meta.page} | CMS — ${siteName}`
  const description = meta.description
  const canonical = absoluteUrl('/admin')
  return basePageSeo(
    {
      title,
      description,
      canonical,
      ogType: 'website',
      ogImage: resolveImageUrl(site.ogImage, '/og-image.jpg'),
      robots: 'noindex,nofollow',
    },
    data,
  )
}

function notFoundSeo(data: ResolvePageSeoInput['data'], pathname: string): PageSeo {
  const site = data.settings.seo
  const canonical = absoluteUrl(normalizeCanonicalPath(pathname))
  return basePageSeo(
    {
      title: `Page Not Found | ${site.title}`,
      description: site.description,
      canonical,
      ogType: 'website',
      ogImage: resolveImageUrl(site.ogImage, '/og-image.jpg'),
      robots: 'noindex,nofollow',
    },
    data,
  )
}

export function resolvePageSeo({ pathname, data, article, event }: ResolvePageSeoInput): PageSeo {
  const normalizedPath = normalizeCanonicalPath(pathname)

  if (isAdminPath(normalizedPath) || normalizedPath === '/dashboard') {
    return adminSeo(data, normalizedPath === '/dashboard' ? '/admin/dashboard' : normalizedPath)
  }

  const blogSlug = parseBlogSlug(normalizedPath)
  if (blogSlug) {
    if (!article) {
      return missingBlogSlugSeo(data)
    }
    return articleSeo(data, article)
  }

  const eventId = parseEventId(normalizedPath)
  if (eventId) {
    if (!event) {
      return missingEventSeo(data)
    }
    return eventSeo(data, event)
  }

  if (normalizedPath in routeDefaults) {
    return staticMarketingSeo(normalizedPath as PublicRoutePath, data)
  }

  if (!isPublicMarketingPath(normalizedPath)) {
    return notFoundSeo(data, normalizedPath)
  }

  return notFoundSeo(data, normalizedPath)
}
