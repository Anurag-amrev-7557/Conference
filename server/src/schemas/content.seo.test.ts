import { describe, expect, it } from 'vitest'
import { contentPatchSchema } from './content'

describe('contentPatchSchema settings.seo (CMS-02)', () => {
  it('accepts global SEO fields in settings patch', () => {
    const parsed = contentPatchSchema.parse({
      settings: {
        seo: {
          title: 'Site',
          description: 'Desc',
          ogImage: 'https://cdn.example.com/default-og.jpg',
          googleSiteVerification: 'gsc-token-abc',
        },
      },
    })
    const seo = (parsed.settings as { seo: Record<string, string> }).seo
    expect(seo.ogImage).toBe('https://cdn.example.com/default-og.jpg')
    expect(seo.googleSiteVerification).toBe('gsc-token-abc')
  })
})
