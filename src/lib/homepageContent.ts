import type { HomepageContent, SiteSettings, WebsiteData } from './websiteData'

export type { HomepageContent }

export function pickHomepageFields(
  source: Pick<WebsiteData, 'hero' | 'stats' | 'pillars' | 'perks'>,
): HomepageContent {
  return {
    hero: source.hero,
    stats: source.stats,
    pillars: source.pillars,
    perks: source.perks,
  }
}

export function mergeHomepageIntoSettings(
  settings: SiteSettings,
  homepage: HomepageContent,
): SiteSettings {
  return { ...settings, homepage }
}

/** After API merge: canonical homepage lives in settings.homepage; top-level mirrors it for public components. */
export function hydrateHomepage(data: WebsiteData): WebsiteData {
  const fromSettings = data.settings.homepage
  const fromColumns = pickHomepageFields(data)

  const homepage: HomepageContent = fromSettings
    ? {
        hero: { ...fromColumns.hero, ...fromSettings.hero },
        stats: fromSettings.stats?.length ? fromSettings.stats : fromColumns.stats,
        pillars: fromSettings.pillars?.length ? fromSettings.pillars : fromColumns.pillars,
        perks: fromSettings.perks?.length ? fromSettings.perks : fromColumns.perks,
      }
    : fromColumns

  return {
    ...data,
    hero: homepage.hero,
    stats: homepage.stats,
    pillars: homepage.pillars,
    perks: homepage.perks,
    settings: mergeHomepageIntoSettings(data.settings, homepage),
  }
}

export function buildHomepageGlobalPatch(
  current: WebsiteData,
  patch: Partial<HomepageContent>,
): Pick<WebsiteData, 'hero' | 'stats' | 'pillars' | 'perks' | 'settings'> {
  const homepage: HomepageContent = {
    hero: patch.hero ?? current.hero,
    stats: patch.stats ?? current.stats,
    pillars: patch.pillars ?? current.pillars,
    perks: patch.perks ?? current.perks,
  }
  return {
    hero: homepage.hero,
    stats: homepage.stats,
    pillars: homepage.pillars,
    perks: homepage.perks,
    settings: mergeHomepageIntoSettings(current.settings, homepage),
  }
}
