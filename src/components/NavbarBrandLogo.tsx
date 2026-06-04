import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'
import { getNavbarLogoSrc } from '../lib/brandLogo'
import { CONFERENCE_HERO_LOGO_PUBLIC } from '../lib/conferenceDefaults'
import { resolveAssetUrl } from '../lib/assetUrl'

type NavbarBrandLogoProps = {
  cmsUrl?: string | null
  className?: string
}

const STATIC_FALLBACK = resolveAssetUrl(CONFERENCE_HERO_LOGO_PUBLIC)

/** Navbar mark with CMS → API media → static public fallback if load fails. */
export function NavbarBrandLogo({ cmsUrl, className }: NavbarBrandLogoProps) {
  const primary = getNavbarLogoSrc(cmsUrl)
  const [src, setSrc] = useState(primary)

  useEffect(() => {
    setSrc(primary)
  }, [primary])

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={cn(className)}
      onError={() => {
        if (src !== STATIC_FALLBACK) {
          setSrc(STATIC_FALLBACK)
        }
      }}
    />
  )
}
