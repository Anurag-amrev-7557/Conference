import { useEffect, useMemo, useRef, type CSSProperties } from "react"
import { selectPreviewArticles } from "../../lib/articleCard"
import { ArrowRight, BookOpen } from "lucide-react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { Link } from "react-router-dom"
import { SectionCarousel, SectionCarouselItem } from "./SectionCarousel"
import { EditorialEyebrow } from "../ui/EditorialEyebrow"
import { renderSectionHeading } from "../../lib/renderSectionTitle"
import { PlaybookArticleCard } from "../blog/PlaybookArticleCard"
import { PlaybookArticlesSkeleton } from "../blog/PlaybookArticlesSkeleton"
import { cn } from "../../lib/utils"

const DEFAULT_LEDE =
  "Frameworks, research, and field-tested playbooks for shipping agentic AI—without the hype."

export function BlogSection({ className }: { className?: string }) {
  const { data, loading } = useWebsiteData()
  const preview = data.settings.sections?.blogPreview
  const previewCount = preview?.previewCount && preview.previewCount > 0 ? preview.previewCount : 3
  const articles = useMemo(
    () => selectPreviewArticles(data.articles, previewCount, preview?.featuredArticleIds),
    [data.articles, previewCount, preview?.featuredArticleIds],
  )
  const sectionId = preview?.sectionAnchor?.trim() || 'dispatch'
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("playbook-section--visible")
          observer.disconnect()
        }
      },
      { rootMargin: "-60px 0px", threshold: 0.06 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className={cn("playbook-section premium-home-section", className)}
    >
      <div className="playbook-section__ambient" aria-hidden />

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto">
        <header className="playbook-section__header flex flex-col items-center text-center max-w-4xl mx-auto mb-12 sm:mb-14 lg:mb-16">
          <EditorialEyebrow
            centered
            className="mb-6 sm:mb-7"
            textClassName="!tracking-[0.08em] !text-xs"
          >
            {preview?.eyebrow ?? "The Playbook"}
          </EditorialEyebrow>

          <h2 className="editorial-heading editorial-heading--section mb-0">
            {renderSectionHeading(preview, (
              <>
                Latest <span className="editorial-accent">Automation</span> Strategies
              </>
            ))}
          </h2>

          <p className="editorial-lede mt-4 max-w-2xl mx-auto">
            {preview?.lede?.trim() || DEFAULT_LEDE}
          </p>
        </header>

        {loading ? (
          <div aria-live="polite" aria-busy="true">
            <PlaybookArticlesSkeleton />
            <span className="sr-only">Loading playbook articles</span>
          </div>
        ) : articles.length > 0 ? (
          <SectionCarousel
            ariaLabel="Latest playbook articles"
            variant="articles"
            trackClassName="playbook-articles"
            showScrollHints
          >
            {articles.map((article, idx) => (
              <SectionCarouselItem
                key={article.id}
                className={`playbook-article-card group${idx === 0 ? " playbook-article-card--featured" : ""}`}
                style={{ "--article-i": idx } as CSSProperties}
              >
                <PlaybookArticleCard article={article} featured={idx === 0} />
              </SectionCarouselItem>
            ))}
          </SectionCarousel>
        ) : (
          <p className="playbook-section__empty editorial-lede text-center max-w-lg mx-auto">
            {preview?.emptyState?.trim() ||
              "New playbook guides are on the way. Browse the full library for frameworks and strategies."}
          </p>
        )}

        <div className="playbook-section__footer">
          <Link
            to={preview?.ctaHref?.trim() || "/blog"}
            className="btn-cta-secondary group playbook-section__cta"
          >
            <BookOpen className="w-4 h-4 text-accent" aria-hidden />
            {preview?.ctaLabel?.trim() || "View playbook"}
            <ArrowRight
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
