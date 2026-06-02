import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: true })

/** True when stored body is HTML from the visual editor (not legacy markdown). */
export function isHtmlArticleContent(content: string | undefined | null): boolean {
  const trimmed = (content ?? '').trim()
  if (!trimmed) return false
  if (trimmed.startsWith('<')) return true
  return /<\/(p|h[1-6]|ul|ol|li|blockquote|div|figure|table)>/i.test(trimmed)
}

/** Normalize legacy markdown to HTML for the visual editor. */
export function toEditorHtml(content: string | undefined | null): string {
  const raw = (content ?? '').trim()
  if (!raw) {
    return '<h2>Introduction</h2><p></p>'
  }
  if (isHtmlArticleContent(raw)) return raw
  const parsed = marked.parse(raw)
  return typeof parsed === 'string' ? parsed : '<p></p>'
}
