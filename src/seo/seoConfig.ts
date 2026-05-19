import type { Article } from '../lib/websiteData'
import { absoluteUrl } from './siteUrl'
import {
  isAdminPath,
  isPublicMarketingPath,
  parseBlogSlug,
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

function basePageSeo(
  partial: Omit<PageSeo, 'ogUrl'> & { ogUrl?: string },
): PageSeo {
  return {
    ...partial,
    ogUrl: partial.ogUrl ?? partial.canonical,
  }
}

function staticMarketingSeo(
  pathname: PublicRoutePath,
  data: ResolvePageSeoInput['data'],
  robots?: PageSeo['robots'],
): PageSeo {
  const site = data.settings.seo
  const defaults = routeDefaults[pathname]
  const canonicalPath = normalizeCanonicalPath(pathname)
  const title = defaults.title ?? site.title
  const description = defaults.description ?? site.description
  const ogImage = resolveImageUrl(defaults.ogImage ?? site.ogImage, '/og-image.jpg')
  const canonical = absoluteUrl(canonicalPath)
  const indexable = !robots

  return basePageSeo({
    title,
    description,
    canonical,
    ogType: 'website',
    ogImage,
    robots,
    googleSiteVerification: indexable ? siteVerification(data) : undefined,
  })
}

function articleSeo(data: ResolvePageSeoInput['data'], article: Article): PageSeo {
  const site = data.settings.seo
  const title = article.seoTitle ?? `${article.title} | ${site.title}`
  const description = article.seoDescription ?? article.excerpt ?? site.description
  const ogImage = resolveImageUrl(article.ogImage ?? site.ogImage, '/og-image.jpg')
  const canonicalPath = normalizeCanonicalPath(`/blog/${article.slug}`)
  const canonical = absoluteUrl(canonicalPath)
  const noindex = article.noindex === true || !article.isPublished

  return basePageSeo({
    title,
    description,
    canonical,
    ogType: 'article',
    ogImage,
    robots: noindex ? 'noindex,nofollow' : undefined,
    googleSiteVerification: noindex ? undefined : siteVerification(data),
  })
}

function missingBlogSlugSeo(data: ResolvePageSeoInput['data']): PageSeo {
  const site = data.settings.seo
  const defaults = routeDefaults['/blog']
  return basePageSeo({
    title: defaults.title ?? site.title,
    description: defaults.description ?? site.description,
    canonical: absoluteUrl('/blog'),
    ogType: 'website',
    ogImage: resolveImageUrl(site.ogImage, '/og-image.jpg'),
    robots: 'noindex,nofollow',
  })
}

function adminSeo(data: ResolvePageSeoInput['data']): PageSeo {
  const site = data.settings.seo
  const title = site.title ? `Admin — ${site.title}` : 'Admin'
  const description = site.description
  const canonical = absoluteUrl(normalizeCanonicalPath('/admin'))
  return basePageSeo({
    title,
    description,
    canonical,
    ogType: 'website',
    ogImage: resolveImageUrl(site.ogImage, '/og-image.jpg'),
    robots: 'noindex,nofollow',
  })
}

function notFoundSeo(data: ResolvePageSeoInput['data'], pathname: string): PageSeo {
  const site = data.settings.seo
  const canonical = absoluteUrl(normalizeCanonicalPath(pathname))
  return basePageSeo({
    title: `Page Not Found | ${site.title}`,
    description: site.description,
    canonical,
    ogType: 'website',
    ogImage: resolveImageUrl(site.ogImage, '/og-image.jpg'),
    robots: 'noindex,nofollow',
  })
}

export function resolvePageSeo({ pathname, data, article }: ResolvePageSeoInput): PageSeo {
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

  if (normalizedPath in routeDefaults) {
    return staticMarketingSeo(normalizedPath as PublicRoutePath, data)
  }

  if (!isPublicMarketingPath(normalizedPath)) {
    return notFoundSeo(data, normalizedPath)
  }

  return notFoundSeo(data, normalizedPath)
}
