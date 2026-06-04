import { describe, expect, it } from 'vitest'
import { isBrokenBrandLogoUrl, resolveNavbarBrandLogoPath } from './brandLogo'
import { CONFERENCE_HERO_LOGO_MEDIA } from './conferenceDefaults'

describe('brandLogo', () => {
  it('detects double-extension Cloudinary URLs', () => {
    expect(
      isBrokenBrandLogoUrl(
        'https://res.cloudinary.com/demo/image/upload/v1/uuid.png.png',
      ),
    ).toBe(true)
  })

  it('falls back to API media path for broken CMS URLs', () => {
    expect(
      resolveNavbarBrandLogoPath(
        'https://res.cloudinary.com/demo/image/upload/v1/uuid.png.png',
      ),
    ).toBe(CONFERENCE_HERO_LOGO_MEDIA)
  })
})
