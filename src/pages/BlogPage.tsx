import { useMemo, useState, type CSSProperties } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useWebsiteData } from "../components/WebsiteDataProvider"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { BlogCtaSection } from "../components/blog/BlogCtaSection"
import { CatalogHero } from "../components/catalog/CatalogHero"
import { CatalogToolbar } from "../components/catalog/CatalogToolbar"
import { CatalogPagination } from "../components/catalog/CatalogPagination"
import { usePagination } from "../lib/usePagination"
import { SeoHead } from "../seo/SeoHead"
import { JsonLd } from "../seo/JsonLd"
import { usePageSeo } from "../seo/usePageSeo"
import { usePageJsonLd } from "../seo/usePageJsonLd"
import { renderCatalogTitle } from "../lib/renderSectionTitle"

const categories = ["ALL", "RESEARCH", "STRATEGY", "PLAYBOOK", "GUIDE"] as const

const CATEGORY_FILTERS = categories.map((cat) => ({
  id: cat,
  label:
    cat === "ALL"
      ? "All"
      : cat.charAt(0) + cat.slice(1).toLowerCase(),
}))

export function BlogPage() {
  const { data, loading } = useWebsiteData()
  const seo = usePageSeo()
  const jsonLd = usePageJsonLd()
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const articles = data.articles.filter((a) => a.isPublished)
  const q = searchQuery.trim().toLowerCase()

  const filteredArticles = useMemo(() => {
    let list =
      selectedCategory === "ALL"
        ? articles
        : articles.filter((a) => a.category === selectedCategory)
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q),
      )
    }
    return list
  }, [articles, selectedCategory, q])

  const { page, setPage, totalPages, paginatedItems, showPagination } =
    usePagination(filteredArticles)

  const resetFilters = () => {
    setSelectedCategory("ALL")
    setSearchQuery("")
  }

  return (
    <>
      <SeoHead seo={seo} />
      <JsonLd graph={jsonLd} />
      <div className="blog-page overflow-x-hidden">
        <Navbar />

        <CatalogHero
          eyebrow={data.settings.catalogPages?.blog?.eyebrow?.trim() || "Blog"}
          title={renderCatalogTitle(data.settings.catalogPages?.blog, (
            <>
              Where builders <em>learn to ship</em>
            </>
          ))}
          lede={
            data.settings.catalogPages?.blog?.lede?.trim() ||
            "Architecture, automation, and intelligence for builders shipping agentic systems—guides, playbooks, and research from the Superhumanly team."
          }
        />

        <main className="catalog-main max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
          <CatalogToolbar
            searchId="blog-search-input"
            searchPlaceholder="Search for articles"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={CATEGORY_FILTERS}
            activeFilterId={selectedCategory}
            onFilterChange={setSelectedCategory}
            filterAriaLabel="Article categories"
          />

          {loading ? (
            <p className="blog-loading" aria-live="polite">
              Loading articles…
            </p>
          ) : articles.length === 0 ? (
            <div className="blog-empty">
              <h2 className="blog-empty__title">Playbooks are on the way</h2>
              <p className="editorial-lede max-w-none">
                We&apos;re drafting new agentic AI guides. Check back soon—or explore the
                rest of the site.
              </p>
              <Link to="/#dispatch" className="btn-cta-secondary blog-empty__cta group">
                Browse the playbook
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="blog-empty-filter">
              <h2 className="blog-empty-filter__title">No articles match</h2>
              <p className="editorial-lede max-w-none">
                Try another category or clear your search to see everything in the
                library.
              </p>
              <button
                type="button"
                className="blog-empty-filter__reset"
                onClick={resetFilters}
                aria-label="Reset filters and search"
              >
                Show all articles
              </button>
            </div>
          ) : (
            <>
              <ul className="playbook-articles playbook-articles--trio playbook-section playbook-section--visible list-none p-0 m-0">
                {paginatedItems.map((article, idx) => (
                  <li
                    key={article.id}
                    className="playbook-article-card group"
                    style={{ "--article-i": idx } as CSSProperties}
                  >
                    <Link
                      to={`/blog/${article.slug}`}
                      className="playbook-article-card__link"
                    >
                      <div className="playbook-article-card__media">
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          width={640}
                          height={400}
                          loading="lazy"
                          className="playbook-article-card__img"
                        />
                      </div>

                      <div className="playbook-article-card__body">
                        <p className="playbook-article-card__meta">
                          <span className="playbook-article-card__category">
                            {article.category}
                          </span>
                          <span
                            className="playbook-article-card__meta-dot"
                            aria-hidden
                          />
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
              {showPagination ? (
                <CatalogPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              ) : null}
            </>
          )}

          <BlogCtaSection />
        </main>

        <Footer />
      </div>
    </>
  )
}
