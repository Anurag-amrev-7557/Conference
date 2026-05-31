import { useMemo } from 'react'
import { useWebsiteData } from '../components/WebsiteDataProvider'
import { pickHomepageFields } from '../lib/homepageContent'

/** Canonical homepage bundle from settings.homepage (falls back to top-level columns). */
export function useHomepageContent() {
  const { data } = useWebsiteData()
  return useMemo(
    () => data.settings.homepage ?? pickHomepageFields(data),
    [data.settings.homepage, data.hero, data.stats, data.pillars, data.perks],
  )
}
