import type { Article } from './websiteData'
import { isEffectivelyPublished } from './publishSchedule'

/** Contextual card CTA copy by article category. */
export function getArticleCtaLabel(category: string): string {
  switch (category.trim().toUpperCase()) {
    case 'RESEARCH':
      return 'Read the research'
    case 'PLAYBOOK':
      return 'Open the playbook'
    case 'GUIDE':
      return 'Read the guide'
    case 'STRATEGY':
      return 'Get the strategy'
    default:
      return 'Read article'
  }
}

/** Human-readable publish date for card metadata. */
export function formatArticleDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso.trim()
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Normalize read-time labels (e.g. "5 min" → "5 MIN"). */
export function formatReadTime(time: string | null | undefined): string {
  const raw = time?.trim()
  if (!raw) return ''
  const withoutRead = raw.replace(/\s*read\s*$/i, '').trim()
  if (/min/i.test(withoutRead)) {
    return withoutRead.replace(/min/i, 'MIN')
  }
  return `${withoutRead} MIN`
}

function looksLikeJobTitle(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return false
  return (
    /\b(architect|engineer|strategist|analyst|researcher|director|specialist)\b/.test(
      normalized,
    ) ||
    normalized === 'lead' ||
    normalized.endsWith(' team')
  )
}

/** Normalize author lines so job titles are not shown as a person's name. */
export function formatCardAuthor(article: Article): {
  name: string
  role: string | null
} {
  const rawName = article.authorName?.trim() || ''
  const rawRole = article.authorRole?.trim() || ''

  if (!rawName) {
    return { name: 'Superhumanly Team', role: rawRole || null }
  }

  if (looksLikeJobTitle(rawName)) {
    const role =
      rawRole && rawRole.toLowerCase() !== 'lead'
        ? `${rawName} · ${rawRole}`
        : rawName
    return { name: 'Superhumanly Team', role }
  }

  return { name: rawName, role: rawRole || null }
}

function articleTimestamp(article: Article): number {
  const value = Date.parse(article.publishedAt || '')
  return Number.isNaN(value) ? 0 : value
}

/**
 * Pick up to `limit` published articles for homepage preview.
 * Dedupes by title (keeps newest) so CMS duplicates do not appear side by side.
 */
export function selectPreviewArticles(
  articles: Article[],
  limit = 3,
  featuredIds?: string[],
): Article[] {
  const published = articles.filter((article) => isEffectivelyPublished(article))
  const curatedIds = featuredIds?.filter(Boolean) ?? []

  if (curatedIds.length > 0) {
    const byId = new Map(published.map((article) => [article.id, article]))
    const curated = curatedIds
      .map((id) => byId.get(id))
      .filter((article): article is Article => Boolean(article))
      .slice(0, limit)
    if (curated.length > 0) return curated
  }

  const byTitle = new Map<string, Article>()

  for (const article of published) {
    const key = article.title.trim().toLowerCase()
    const existing = byTitle.get(key)
    if (!existing || articleTimestamp(article) > articleTimestamp(existing)) {
      byTitle.set(key, article)
    }
  }

  return [...byTitle.values()]
    .sort((a, b) => articleTimestamp(b) - articleTimestamp(a))
    .slice(0, limit)
}
