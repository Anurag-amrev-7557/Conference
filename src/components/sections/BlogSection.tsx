import { useEffect, useRef, type CSSProperties } from "react"
import { ArrowRight, BookOpen } from "lucide-react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { Link } from "react-router-dom"

export function BlogSection() {
  const { data } = useWebsiteData()
  const articles = data.articles.filter((a) => a.isPublished).slice(0, 3)
  const sectionRef = useRef<HTMLElement>(null)
  const layout =
    articles.length <= 1 ? "featured" : articles.length === 2 ? "duo" : "trio"

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
    <section ref={sectionRef} id="dispatch" className="playbook-section">
      <div className="playbook-section__ambient" aria-hidden />

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto">
        <header className="playbook-section__header flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-14 lg:mb-16">
          <div className="editorial-eyebrow editorial-eyebrow--center mb-6 sm:mb-7">
            <span className="editorial-eyebrow__rule" aria-hidden />
            <span className="section-eyebrow !mb-0 text-muted">The Playbook</span>
            <span className="editorial-eyebrow__rule" aria-hidden />
          </div>

          <h2 className="editorial-heading editorial-heading--section mb-0">
            Latest <span className="italic editorial-accent">Automation</span> Strategies
          </h2>
        </header>

        {articles.length > 0 ? (
          <ul
            className={`playbook-articles playbook-articles--${layout} list-none p-0 m-0`}
          >
            {articles.map((article, idx) => (
              <li
                key={article.id}
                className="playbook-article-card group"
                style={{ "--article-i": idx } as CSSProperties}
              >
                <Link
                  to={`/blog/${article.slug}`}
                  className={`playbook-article-card__link ${
                    layout === "featured" ? "playbook-article-card__link--featured" : ""
                  }`}
                >
                  <div className="playbook-article-card__media">
                    <img
                      src={article.thumbnail}
                      alt=""
                      width={640}
                      height={400}
                      loading="lazy"
                      className="playbook-article-card__img"
                    />
                  </div>

                  <div className="playbook-article-card__body">
                    <p className="playbook-article-card__meta">
                      <span className="playbook-article-card__category">{article.category}</span>
                      <span className="playbook-article-card__meta-dot" aria-hidden />
                      <span>{article.time} read</span>
                    </p>

                    <h3 className="playbook-article-card__title">{article.title}</h3>
                    <p className="playbook-article-card__excerpt editorial-lede max-w-none">
                      {article.excerpt}
                    </p>

                    <span className="playbook-article-card__cta">
                      Get the strategy
                      <ArrowRight
                        className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="playbook-section__empty editorial-lede text-center max-w-lg mx-auto">
            New playbook guides are on the way. Browse the full library for frameworks and
            strategies.
          </p>
        )}

        <div className="playbook-section__footer">
          <Link to="/blog" className="btn-cta-secondary group">
            <BookOpen className="w-4 h-4 text-accent" aria-hidden />
            View playbook
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
