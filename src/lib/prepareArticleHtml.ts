import DOMPurify from 'dompurify'
import type { MarkdownTocItem } from './extractMarkdownToc'

const PURIFY_CONFIG = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['target', 'rel', 'id'],
}

/** Sanitize editor HTML and inject stable heading ids for TOC + scroll spy. */
export function prepareArticleHtml(html: string, toc: MarkdownTocItem[]): string {
  const clean = String(DOMPurify.sanitize(html, PURIFY_CONFIG))

  if (typeof DOMParser === 'undefined' || toc.length === 0) {
    return clean
  }

  const doc = new DOMParser().parseFromString(clean, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let index = 0

  headings.forEach((heading) => {
    const item = toc[index]
    if (!item) return
    heading.id = item.id
    index += 1
  })

  doc.querySelectorAll('a[href^="http"]').forEach((anchor) => {
    anchor.setAttribute('target', '_blank')
    anchor.setAttribute('rel', 'noopener noreferrer')
  })

  return doc.body.innerHTML
}
