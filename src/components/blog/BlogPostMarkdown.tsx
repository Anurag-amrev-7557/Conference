import { useMemo, useRef } from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import type { MarkdownTocItem } from "../../lib/extractMarkdownToc"

function buildHeadingComponents(entries: MarkdownTocItem[], cursor: { n: number }) {
  const nextId = () => {
    const i = cursor.n++
    return entries[i]?.id ?? `section-${i}`
  }

  const scrollCls = "scroll-mt-[calc(var(--header-offset,5.5rem)+0.75rem)]"

  return {
    h1: ({ children }) => (
      <h2 id={nextId()} className={scrollCls}>
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h2 id={nextId()} className={scrollCls}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={nextId()} className={scrollCls}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 id={nextId()} className={scrollCls}>
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 id={nextId()} className={scrollCls}>
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 id={nextId()} className={scrollCls}>
        {children}
      </h6>
    ),
  } satisfies Components
}

interface BlogPostMarkdownProps {
  toc: MarkdownTocItem[]
  content: string
  extraComponents?: Partial<Components>
}

/** Heading ids match extractMarkdownToc order; cursor resets every render before parsing. */
export function BlogPostMarkdown({ toc, content, extraComponents }: BlogPostMarkdownProps) {
  const cursorRef = useRef({ n: 0 })
  cursorRef.current.n = 0

  const components = useMemo(() => {
    const headings = buildHeadingComponents(toc, cursorRef.current)
    return { ...headings, ...extraComponents } as Components
  }, [toc, extraComponents])

  return <ReactMarkdown components={components}>{content}</ReactMarkdown>
}
