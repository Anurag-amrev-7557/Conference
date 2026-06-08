import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Article } from '../../lib/websiteData'
import {
  formatArticleDate,
  formatCardAuthor,
  formatReadTime,
  getArticleCtaLabel,
} from '../../lib/articleCard'
import { CmsImage } from '../CmsImage'

type PlaybookArticleCardProps = {
  article: Article
  featured?: boolean
}

export function PlaybookArticleCard({ article, featured = false }: PlaybookArticleCardProps) {
  const ctaLabel = getArticleCtaLabel(article.category)
  const publishedLabel = formatArticleDate(article.publishedAt)
  const readLabel = formatReadTime(article.time)
  const { name: authorName, role: authorRole } = formatCardAuthor(article)

  return (
    <Link to={`/blog/${article.slug}`} className="playbook-article-card__link">
      <div className="playbook-article-card__media">
        {featured ? <span className="playbook-article-card__badge">Featured</span> : null}
        <div className="playbook-article-card__media-overlay" aria-hidden />
        <CmsImage
          src={article.thumbnail}
          alt={article.title}
          width={640}
          height={400}
          loading="lazy"
          className="playbook-article-card__img"
        />
      </div>

      <div className="playbook-article-card__body">
        <div className="playbook-article-card__meta-row">
          <span className="playbook-article-card__category-pill">{article.category}</span>
          <span className="playbook-article-card__meta-end">
            {readLabel ? (
              <span className="playbook-article-card__meta-read">{readLabel} read</span>
            ) : null}
            {readLabel && publishedLabel ? (
              <span className="playbook-article-card__meta-dot" aria-hidden />
            ) : null}
            {publishedLabel ? (
              <time className="playbook-article-card__meta-date" dateTime={article.publishedAt}>
                {publishedLabel}
              </time>
            ) : null}
          </span>
        </div>

        <div className="playbook-article-card__overview">
          <h3 className="playbook-article-card__title">{article.title}</h3>
          <p className="playbook-article-card__excerpt">{article.excerpt}</p>
        </div>

        <div className="playbook-article-card__footer">
          <div className="playbook-article-card__author">
            {article.authorAvatar ? (
              <CmsImage
                src={article.authorAvatar}
                alt=""
                width={24}
                height={24}
                className="playbook-article-card__author-avatar"
                aria-hidden
              />
            ) : (
              <span
                className="playbook-article-card__author-avatar playbook-article-card__author-avatar--fallback"
                aria-hidden
              />
            )}
            <span className="playbook-article-card__author-text">
              <span className="playbook-article-card__author-name">{authorName}</span>
              <span className="playbook-article-card__author-role">
                {authorRole ?? '\u00A0'}
              </span>
            </span>
          </div>

          <span className="playbook-article-card__cta">
            {ctaLabel}
            <ArrowRight className="playbook-article-card__cta-icon" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  )
}
