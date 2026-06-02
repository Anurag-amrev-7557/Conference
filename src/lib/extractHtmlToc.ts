import type { MarkdownTocItem } from './extractMarkdownToc'
import { assignUniqueHeadingSlug, stripHtmlToText } from './articleTocSlug'

function extractWithRegex(html: string): MarkdownTocItem[] {
  const used = new Map<string, number>()
  const items: MarkdownTocItem[] = []
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi
  let match: RegExpExecArray | null

  while ((match = re.exec(html)) !== null) {
    const level = Number.parseInt(match[1], 10)
    const text = stripHtmlToText(match[2])
    if (!text) continue
    items.push({ level, text, id: assignUniqueHeadingSlug(text, used) })
  }

  return items
}

/** Table of contents from HTML article bodies (visual editor output). */
export function extractHtmlToc(html: string): MarkdownTocItem[] {
  const trimmed = html.trim()
  if (!trimmed) return []

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(trimmed, 'text/html')
    const nodes = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
    if (nodes.length > 0) {
      const used = new Map<string, number>()
      const items: MarkdownTocItem[] = []
      nodes.forEach((node) => {
        const level = Number.parseInt(node.tagName.slice(1), 10)
        const text = (node.textContent ?? '').trim()
        if (!text) return
        items.push({ level, text, id: assignUniqueHeadingSlug(text, used) })
      })
      return items
    }
  }

  return extractWithRegex(trimmed)
}
