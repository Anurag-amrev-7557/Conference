import { Helmet } from 'react-helmet-async'
import type { JsonLdNode } from './jsonLdConfig'

export function JsonLd({ graph }: { graph: JsonLdNode[] }) {
  if (graph.length === 0) return null
  const payload = {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(payload)}</script>
    </Helmet>
  )
}
