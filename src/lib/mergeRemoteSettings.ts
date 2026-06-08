import type { SiteSettings } from './websiteData'
import { initialData } from './websiteData'
import { deepMergeObjects } from './deepMerge'

function mergeRecord<T extends Record<string, unknown>>(
  base: T | undefined,
  remote: T | undefined,
): T | undefined {
  if (!remote) return base
  if (!base) return remote
  return deepMergeObjects(base, remote as Record<string, unknown>) as T
}

/** Deep-merge remote settings with skeleton defaults for reliable client hydration. */
export function mergeRemoteSettings(remote: Partial<SiteSettings> | undefined): SiteSettings {
  const base = initialData.settings
  if (!remote) return base

  const { community: _c, ...visibility } = (remote.visibility ?? {}) as SiteSettings['visibility'] & {
    community?: boolean
  }

  const { community: _sc, ...sections } = (remote.sections ?? {}) as NonNullable<SiteSettings['sections']> & {
    community?: unknown
  }

  const routeSeo = { ...base.routeSeo, ...remote.routeSeo } as SiteSettings['routeSeo']
  if (routeSeo && '/community' in routeSeo) {
    delete (routeSeo as Record<string, unknown>)['/community']
  }

  const remoteNav = remote.navigation
  const navigation = remoteNav
    ? {
        ...base.navigation,
        ...remoteNav,
        links: remoteNav.links ?? base.navigation.links,
        footerLinks: remoteNav.footerLinks ?? base.navigation.footerLinks,
        socials: remoteNav.socials?.length
          ? remoteNav.socials.map((social, index) => ({
              ...base.navigation.socials[index],
              ...social,
            }))
          : base.navigation.socials,
        primaryCta: {
          ...base.navigation.primaryCta,
          ...remoteNav.primaryCta,
        },
      }
    : base.navigation

  const catalogPages = mergeRecord(
    base.catalogPages as Record<string, unknown> | undefined,
    remote.catalogPages as Record<string, unknown> | undefined,
  ) as SiteSettings['catalogPages']

  const mergedSections = mergeRecord(
    base.sections as Record<string, unknown> | undefined,
    sections as Record<string, unknown> | undefined,
  ) as SiteSettings['sections']

  const { communityPage: _cp, ...rest } = remote as SiteSettings & { communityPage?: unknown }

  return {
    ...base,
    ...rest,
    seo: { ...base.seo, ...remote.seo },
    visibility: { ...base.visibility, ...visibility },
    navigation,
    footer: mergeRecord(
      base.footer as Record<string, unknown> | undefined,
      remote.footer as Record<string, unknown> | undefined,
    ),
    catalogPages,
    sections: mergedSections,
    routeSeo,
    cookieBanner: mergeRecord(
      base.cookieBanner as Record<string, unknown> | undefined,
      remote.cookieBanner as Record<string, unknown> | undefined,
    ),
    notFound: mergeRecord(
      base.notFound as Record<string, unknown> | undefined,
      remote.notFound as Record<string, unknown> | undefined,
    ),
    blogCta: mergeRecord(
      base.blogCta as Record<string, unknown> | undefined,
      remote.blogCta as Record<string, unknown> | undefined,
    ),
    leadCaptureModal: mergeRecord(
      (base as SiteSettings & { leadCaptureModal?: Record<string, unknown> }).leadCaptureModal,
      (remote as SiteSettings & { leadCaptureModal?: Record<string, unknown> }).leadCaptureModal,
    ) as SiteSettings['leadCaptureModal'],
    book: mergeRecord(
      base.book as Record<string, unknown> | undefined,
      remote.book as Record<string, unknown> | undefined,
    ),
    newsletter: { ...base.newsletter, ...remote.newsletter },
    routeVisibility: {
      ...base.routeVisibility,
      ...remote.routeVisibility,
    },
    blogCategories: remote.blogCategories?.length ? remote.blogCategories : base.blogCategories,
    scripts: { ...base.scripts, ...remote.scripts },
    customCss: remote.customCss ?? base.customCss,
  }
}
