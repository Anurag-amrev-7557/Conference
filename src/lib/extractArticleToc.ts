import { isHtmlArticleContent } from './articleContent'
import { extractHtmlToc } from './extractHtmlToc'
import { extractMarkdownToc, type MarkdownTocItem } from './extractMarkdownToc'

export type { MarkdownTocItem as ArticleTocItem }

/** TOC for public article page — supports HTML (editor) and legacy markdown. */
export function extractArticleToc(content: string | undefined | null): MarkdownTocItem[] {
  const raw = (content ?? '').trim()
  if (!raw) return []
  if (isHtmlArticleContent(raw)) return extractHtmlToc(raw)
  return extractMarkdownToc(raw)
}
