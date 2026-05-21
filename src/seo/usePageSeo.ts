import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useWebsiteData } from '../components/WebsiteDataProvider'
import type { AppEvent, Article } from '../lib/websiteData'
import { resolvePageSeo } from './seoConfig'

export function usePageSeo(options?: { article?: Article; event?: AppEvent }) {
  const { pathname } = useLocation()
  const { data } = useWebsiteData()
  const article = options?.article
  const event = options?.event

  return useMemo(
    () => resolvePageSeo({ pathname, data, article, event }),
    [pathname, data, article, event],
  )
}
