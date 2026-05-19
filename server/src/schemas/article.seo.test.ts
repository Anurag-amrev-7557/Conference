import { describe, expect, it } from 'vitest'
import { articleCreateSchema, articleUpdateSchema } from './article'

const baseArticle = {
  slug: 'test-post',
  title: 'Test',
  category: 'AI',
  authorName: 'Author',
}

describe('article SEO schemas (CMS-01)', () => {
  it('accepts optional SEO fields on create', () => {
    const parsed = articleCreateSchema.parse({
      ...baseArticle,
      seoTitle: 'Custom SEO',
      seoDescription: 'Meta description',
      ogImage: 'https://cdn.example.com/og.jpg',
      noindex: true,
    })
    expect(parsed.seoTitle).toBe('Custom SEO')
    expect(parsed.noindex).toBe(true)
  })

  it('rejects non-https ogImage when provided', () => {
    expect(() =>
      articleCreateSchema.parse({
        ...baseArticle,
        ogImage: 'javascript:alert(1)',
      }),
    ).toThrow()
  })

  it('allows partial SEO update', () => {
    const parsed = articleUpdateSchema.parse({ seoTitle: 'Updated only' })
    expect(parsed.seoTitle).toBe('Updated only')
  })
})
