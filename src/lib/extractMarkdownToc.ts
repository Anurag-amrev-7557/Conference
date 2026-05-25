export interface MarkdownTocItem {
  level: number
  text: string
  id: string
}

function slugifyBase(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function stripInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
}

function assignUniqueSlug(text: string, used: Map<string, number>): string {
  const baseRaw = slugifyBase(text)
  const base = baseRaw || "section"
  const n = (used.get(base) ?? 0) + 1
  used.set(base, n)
  return n === 1 ? base : `${base}-${n}`
}

/** Walk markdown outside fenced code blocks for ATX headings #–###### */
export function extractMarkdownToc(markdown: string): MarkdownTocItem[] {
  const lines = markdown.split(/\r?\n/)
  const used = new Map<string, number>()
  const items: MarkdownTocItem[] = []
  let inFence = false

  for (const raw of lines) {
    const trimmed = raw.trim()

    if (trimmed.startsWith("```")) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const m = /^(#{1,6})\s+(.+?)\s*$/.exec(trimmed)
    if (!m) continue

    const level = m[1].length
    /* Skip lone # if used as doc title duplicate — still include for anchor sync with rendered ## from h1 override */
    const rawText = m[2]
    const text = stripInlineMarkdown(rawText).trim()
    if (!text) continue

    const id = assignUniqueSlug(text, used)
    items.push({ level, text, id })
  }

  return items
}
