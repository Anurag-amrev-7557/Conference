/** Mirror of src/lib/homepageContent.ts — keep PATCH columns in sync with settings.homepage */

export type ContentPatchBody = {
  hero?: unknown
  settings?: unknown
  appearance?: unknown
  stats?: unknown
  pillars?: unknown
  perks?: unknown
}

export function expandHomepageFromSettings(body: ContentPatchBody): ContentPatchBody {
  const settings = body.settings as { homepage?: Record<string, unknown> } | undefined
  const homepage = settings?.homepage
  if (!homepage || typeof homepage !== 'object') {
    return body
  }
  return {
    ...body,
    hero: body.hero ?? homepage.hero,
    stats: body.stats ?? homepage.stats,
    pillars: body.pillars ?? homepage.pillars,
    perks: body.perks ?? homepage.perks,
  }
}

/** When the client PATCHes top-level homepage columns, persist them under settings.homepage too. */
export function embedHomepageInSettingsPatch(body: ContentPatchBody): ContentPatchBody {
  const { hero, stats, pillars, perks, settings } = body
  if (!settings || typeof settings !== 'object') {
    if (!hero && !stats && !pillars && !perks) return body
    return {
      ...body,
      settings: {
        homepage: { hero, stats, pillars, perks },
      },
    }
  }
  const s = { ...(settings as Record<string, unknown>) }
  const hp = (s.homepage as Record<string, unknown> | undefined) ?? {}
  s.homepage = {
    hero: hero ?? hp.hero,
    stats: stats ?? hp.stats,
    pillars: pillars ?? hp.pillars,
    perks: perks ?? hp.perks,
  }
  return { ...body, settings: s }
}

export function embedHomepageInSettingsPayload(payload: {
  hero: unknown
  stats: unknown
  pillars: unknown
  perks: unknown
  settings: unknown
}) {
  const settings =
    payload.settings && typeof payload.settings === 'object'
      ? { ...(payload.settings as Record<string, unknown>) }
      : {}
  if (!settings.homepage) {
    settings.homepage = {
      hero: payload.hero,
      stats: payload.stats,
      pillars: payload.pillars,
      perks: payload.perks,
    }
  }
  return { ...payload, settings }
}
