import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useWebsiteData } from '../components/WebsiteDataProvider'
import type { Article } from '../lib/websiteData'
import { resolvePageJsonLd } from './jsonLdConfig'

export function usePageJsonLd(options?: { article?: Article }) {
  const { pathname } = useLocation()
  const { data } = useWebsiteData()
  const article = options?.article

  return useMemo(
    () => resolvePageJsonLd({ pathname, data, article }),
    [pathname, data, article],
  )
}
