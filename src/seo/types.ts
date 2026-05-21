import type { AppEvent, Article, WebsiteData } from '../lib/websiteData'

export interface PageSeo {
  title: string
  description: string
  canonical: string
  ogType: 'website' | 'article'
  ogImage: string
  ogUrl: string
  robots?: 'noindex,nofollow'
  googleSiteVerification?: string
  ogSiteName?: string
  ogLocale?: string
  twitterSite?: string
}

export interface ResolvePageSeoInput {
  pathname: string
  data: WebsiteData
  article?: Article
  event?: AppEvent
}
