import { useMemo } from 'react'
import type { Article, WebsiteData } from '../lib/websiteData'
import { resolvePageSeo } from '../seo/seoConfig'
import type { PageSeo } from '../seo/types'

export interface SeoFallbackLabels {
  title: string
  description: string
  image: string
}

function buildSyntheticArticle(
  editForm: Partial<Article>,
  stored: Article | undefined,
): Article | undefined {
  if (!stored && !editForm.slug?.trim()) return undefined
  const base = stored ?? ({
    id: 'draft',
    slug: editForm.slug || 'preview',
    title: editForm.title || 'Untitled',
    category: editForm.category || 'RESEARCH',
    time: editForm.time || '5 MIN',
    excerpt: editForm.excerpt || '',
    content: editForm.content || '',
    thumbnail: editForm.thumbnail || '',
    isPublished: editForm.isPublished ?? false,
    authorName: editForm.authorName || '',
    authorRole: editForm.authorRole || '',
    authorAvatar: editForm.authorAvatar || '',
    publishedAt: editForm.publishedAt || '',
  } as Article)

  return { ...base, ...editForm, id: base.id, slug: editForm.slug || base.slug } as Article
}

function fallbackLabels(data: WebsiteData, article: Article): SeoFallbackLabels {
  const site = data.settings.seo
  const title = article.seoTitle?.trim()
    ? 'SEO title override'
    : 'Article title + site suffix'

  let description = 'SEO description override'
  if (!article.seoDescription?.trim()) {
    description = article.excerpt?.trim() ? 'Short summary' : 'Site default description'
  }

  let image = 'Custom OG image URL'
  if (!article.ogImage?.trim()) {
    image = site.ogImage?.trim() ? 'Site default OG image' : 'Default /og-image.jpg'
  }

  return { title, description, image }
}

export function useDraftArticleSeo(
  editForm: Partial<Article>,
  storedArticle: Article | undefined,
  data: WebsiteData,
): { seo: PageSeo | null; fallbackLabels: SeoFallbackLabels | null; slugReady: boolean } {
  return useMemo(() => {
    const slug = editForm.slug?.trim()
    if (!slug) {
      return { seo: null, fallbackLabels: null, slugReady: false }
    }

    const synthetic = buildSyntheticArticle(editForm, storedArticle)
    if (!synthetic) {
      return { seo: null, fallbackLabels: null, slugReady: false }
    }

    const pathname = `/blog/${slug}`
    const seo = resolvePageSeo({ pathname, data, article: synthetic })
    return {
      seo,
      fallbackLabels: fallbackLabels(data, synthetic),
      slugReady: true,
    }
  }, [editForm, storedArticle, data])
}
