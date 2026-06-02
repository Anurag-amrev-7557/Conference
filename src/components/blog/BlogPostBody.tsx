import { useMemo } from 'react'
import { isHtmlArticleContent } from '../../lib/articleContent'
import type { MarkdownTocItem } from '../../lib/extractMarkdownToc'
import { prepareArticleHtml } from '../../lib/prepareArticleHtml'
import { BlogPostMarkdown } from './BlogPostMarkdown'

interface BlogPostBodyProps {
  content: string
  toc: MarkdownTocItem[]
}

export function BlogPostBody({ content, toc }: BlogPostBodyProps) {
  const html = useMemo(() => {
    if (!isHtmlArticleContent(content)) return null
    return prepareArticleHtml(content, toc)
  }, [content, toc])

  if (html) {
    return (
      <div
        className="blog-post-page__prose blog-post-page__prose-html"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return <BlogPostMarkdown toc={toc} content={content} />
}
