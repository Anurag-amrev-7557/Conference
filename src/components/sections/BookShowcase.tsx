import { Link } from "react-router-dom"
import { ArrowRight, BookOpen } from "lucide-react"
import { useWebsiteData } from "../WebsiteDataProvider"
import { cn } from "../../lib/utils"

function BookCoverFace({ coverUrl }: { coverUrl?: string }) {
  if (coverUrl) {
    return <img src={coverUrl} alt="" className="book-3d__cover-img" />
  }

  return (
    <div className="book-3d__cover-art" aria-hidden>
      <div className="flex items-center gap-2 text-white/65 text-[11px] font-medium uppercase tracking-[0.22em]">
        <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
        <span>Superhumanly</span>
      </div>
      <div className="text-center px-2">
        <p className="text-white text-3xl sm:text-4xl font-semibold tracking-tight leading-none">Playbook</p>
        <p className="mt-3 text-sm font-medium text-white/55 uppercase tracking-[0.18em]">Agentic AI</p>
      </div>
      <div className="h-px w-12 bg-white/20 mx-auto" aria-hidden />
    </div>
  )
}

function Book3D({ coverUrl }: { coverUrl?: string }) {
  return (
    <div className="book-3d-scene">
      <div className="book-3d-pivot">
        <div className="book-3d__ground" aria-hidden />
        <div className="book-3d">
          <div className="book-3d__back" aria-hidden />
          <div className="book-3d__top" aria-hidden />
          <div className="book-3d__bottom" aria-hidden />
          <div className="book-3d__spine" aria-hidden />
          <div className="book-3d__edge" aria-hidden />
          <div className="book-3d__cover">
            <BookCoverFace coverUrl={coverUrl} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function BookShowcase({ className }: { className?: string }) {
  const { data } = useWebsiteData()
  const book = data.settings.book
  const copy = data.settings.sections?.bookShowcase
  const { hero } = data

  const title =
    book?.title?.trim() || "The Blueprint for Automating Business with Agentic AI"
  const tagline = book?.tagline?.trim() || hero.tagline
  const abstract =
    book?.abstract?.trim() ||
    hero.subtitle ||
    "A practical guide to building and scaling agentic AI in your business."
  const authorName = book?.authorName?.trim()
  const publisherName = book?.publisherName?.trim()
  const isbn = book?.isbn?.trim()
  const coverUrl = book?.coverImageUrl?.trim()

  const abstractParagraphs = abstract.split(/\n\n+/).filter(Boolean)
  const coverAlt = `Cover: ${title}`

  return (
    <section
      id="book"
      className={cn(
        "book-section-bg relative w-full pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-20 lg:pb-24",
        className,
      )}
      aria-labelledby="book-section-title"
    >
      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 lg:gap-14 xl:gap-16 items-center max-w-[1600px] mx-auto">
          <div className="flex justify-center shrink-0 w-full lg:w-auto">
            <div role="img" aria-label={coverAlt} className="max-w-full mx-auto">
              <Book3D coverUrl={coverUrl} />
            </div>
          </div>

          <div className="flex flex-col items-start text-left max-w-2xl lg:max-w-none">
            <div className="editorial-eyebrow mb-4 sm:mb-5">
              <span className="editorial-eyebrow__rule" aria-hidden />
              <span className="section-eyebrow !mb-0 text-muted">
                {copy?.eyebrow?.trim() || "The Playbook"}
              </span>
            </div>

            <h2 id="book-section-title" className="editorial-heading editorial-heading--book mb-4">
              {title}
            </h2>

            {tagline ? (
              <p className="editorial-tagline mb-6 sm:mb-8 max-w-xl">{tagline}</p>
            ) : null}

            <div className="space-y-4 mb-8 sm:mb-10">
              {abstractParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="editorial-lede max-w-none">
                  {paragraph}
                </p>
              ))}
            </div>

            {(authorName || publisherName || isbn) && (
              <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text2 mb-8 sm:mb-10">
                {authorName ? (
                  <div>
                    <dt className="sr-only">Author</dt>
                    <dd>
                      <span className="text-text2/70">By </span>
                      {book?.authorUrl ? (
                        <a
                          href={book.authorUrl}
                          className="font-medium text-text hover:underline underline-offset-4"
                        >
                          {authorName}
                        </a>
                      ) : (
                        <span className="font-medium text-text">{authorName}</span>
                      )}
                    </dd>
                  </div>
                ) : null}
                {publisherName ? (
                  <div>
                    <dt className="sr-only">Publisher</dt>
                    <dd className="text-text2/80">{publisherName}</dd>
                  </div>
                ) : null}
                {isbn ? (
                  <div>
                    <dt className="sr-only">ISBN</dt>
                    <dd className="font-mono text-xs text-text2/70">ISBN {isbn}</dd>
                  </div>
                ) : null}
              </dl>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                to={copy?.ctaHref?.trim() || "/#final-cta"}
                className="btn-cta-primary w-full sm:w-auto text-center"
              >
                {copy?.ctaLabel?.trim() || "Get the playbook"}
              </Link>
              <Link
                to={copy?.secondaryCtaHref?.trim() || "/blog"}
                className="btn-cta-secondary group w-full sm:w-auto justify-center sm:justify-start"
              >
                {copy?.secondaryCtaLabel?.trim() || "Read excerpts"}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
