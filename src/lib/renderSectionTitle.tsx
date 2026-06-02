import type { ReactNode } from 'react'
import type { CatalogHeroContent, SectionBlockContent } from './websiteData'

export function renderCatalogTitle(
  content: CatalogHeroContent | undefined,
  fallback: ReactNode,
): ReactNode {
  if (!content?.title && !content?.titleAccent) return fallback
  return (
    <>
      {content.title}
      {content.titleAccent ? (
        <>
          {' '}
          <span className="editorial-accent">{content.titleAccent}</span>
        </>
      ) : null}
    </>
  )
}

export function renderSectionHeading(
  content: SectionBlockContent | undefined,
  fallback: ReactNode,
  options?: { singleLine?: boolean },
): ReactNode {
  if (!content?.title && !content?.titleAccent) return fallback
  if (options?.singleLine) {
    return (
      <>
        {content.title}
        {content.titleAccent ? (
          <>
            {' '}
            <span className="editorial-accent">{content.titleAccent}</span>
          </>
        ) : null}
      </>
    )
  }
  return (
    <>
      {content.title}
      {content.titleAccent ? (
        <>
          <br />
          <span className="editorial-accent">{content.titleAccent}</span>
        </>
      ) : null}
    </>
  )
}
