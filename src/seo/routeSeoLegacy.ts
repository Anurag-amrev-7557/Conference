import type { RouteSeoOverride } from '../lib/websiteData'
import type { PublicRoutePath } from './routes'

/** CMS keys before conference became the root landing page. */
type LegacyRouteSeoKey = '/conference'

type RouteSeoMap = Partial<Record<PublicRoutePath | LegacyRouteSeoKey, RouteSeoOverride>>

function hasSeoContent(entry?: RouteSeoOverride): boolean {
  return !!(entry?.title?.trim() || entry?.description?.trim() || entry?.ogImage?.trim())
}

export function pickRouteSeoOverride(
  routeSeo: RouteSeoMap | undefined,
  pathname: PublicRoutePath,
): RouteSeoOverride | undefined {
  const direct = routeSeo?.[pathname]
  if (hasSeoContent(direct)) {
    return direct
  }
  if (pathname === '/' && hasSeoContent(routeSeo?.['/conference'])) {
    return routeSeo?.['/conference']
  }
  return direct
}
