import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useWebsiteData } from '../components/WebsiteDataProvider'
import type { Article } from '../lib/websiteData'
import { resolvePageSeo } from './seoConfig'

export function usePageSeo(options?: { article?: Article }) {
  const { pathname } = useLocation()
  const { data } = useWebsiteData()
  const article = options?.article

  return useMemo(
    () => resolvePageSeo({ pathname, data, article }),
    [pathname, data, article],
  )
}
