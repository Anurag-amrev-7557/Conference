import type { Article, WebsiteData } from '../lib/websiteData'

export interface PageSeo {
  title: string
  description: string
  canonical: string
  ogType: 'website' | 'article'
  ogImage: string
  ogUrl: string
  robots?: 'noindex,nofollow'
  googleSiteVerification?: string
}

export interface ResolvePageSeoInput {
  pathname: string
  data: WebsiteData
  article?: Article
}
