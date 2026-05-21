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
  const cms = data.settings.routeSeo?.[pathname]
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

function adminSeo(data: ResolvePageSeoInput['data']): PageSeo {
  const site = data.settings.seo
  const title = site.title ? `Admin — ${site.title}` : 'Admin'
  const description = site.description
  const canonical = absoluteUrl(normalizeCanonicalPath('/admin'))
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
    return adminSeo(data)
  }

  if (normalizedPath === '/community') {
    return staticMarketingSeo('/community', data, 'noindex,nofollow')
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
