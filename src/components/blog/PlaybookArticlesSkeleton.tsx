type PlaybookArticlesSkeletonProps = {
  count?: number
  variant?: 'carousel' | 'grid'
}

function SkeletonCardInner() {
  return (
    <div className="playbook-article-card__link playbook-article-card__link--skeleton">
      <div className="playbook-article-card__skeleton-media" />
      <div className="playbook-article-card__skeleton-body">
        <div className="playbook-article-card__skeleton-line playbook-article-card__skeleton-line--pill" />
        <div className="playbook-article-card__skeleton-line playbook-article-card__skeleton-line--title" />
        <div className="playbook-article-card__skeleton-line" />
        <div className="playbook-article-card__skeleton-line playbook-article-card__skeleton-line--short" />
        <div className="playbook-article-card__skeleton-line playbook-article-card__skeleton-line--cta" />
      </div>
    </div>
  )
}

export function PlaybookArticlesSkeleton({
  count = 3,
  variant = 'carousel',
}: PlaybookArticlesSkeletonProps) {
  if (variant === 'grid') {
    return (
      <ul
        className="playbook-articles playbook-articles--grid playbook-articles-skeleton list-none p-0 m-0"
        aria-hidden
      >
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="playbook-article-card playbook-article-card--skeleton">
            <SkeletonCardInner />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div
      className="playbook-articles-skeleton section-carousel section-carousel--articles"
      aria-hidden
    >
      <div className="section-carousel__viewport">
        <ul className="section-carousel__track playbook-articles list-none p-0 m-0" role="list">
          {Array.from({ length: count }, (_, index) => (
            <li
              key={index}
              className="section-carousel__item playbook-article-card playbook-article-card--skeleton"
            >
              <SkeletonCardInner />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
