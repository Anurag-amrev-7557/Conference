import { Helmet } from 'react-helmet-async'
import type { PageSeo } from './types'

export function SeoHead({ seo }: { seo: PageSeo }) {
  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.canonical} />
      <meta property="og:type" content={seo.ogType} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.ogImage} />
      <meta property="og:url" content={seo.ogUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.ogImage} />
      <meta name="twitter:url" content={seo.ogUrl} />
      {seo.robots ? <meta name="robots" content={seo.robots} /> : null}
      {seo.googleSiteVerification ? (
        <meta name="google-site-verification" content={seo.googleSiteVerification} />
      ) : null}
    </Helmet>
  )
}
