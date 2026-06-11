import { useMemo, useState, type CSSProperties } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { PlaybookArticleCard } from "../components/blog/PlaybookArticleCard"
import { PlaybookArticlesSkeleton } from "../components/blog/PlaybookArticlesSkeleton"
import { useWebsiteData } from "../components/WebsiteDataProvider"
import { Footer } from "../components/Footer"
import { FinalCTA } from "../components/sections/FinalCTA"
import { CatalogHero } from "../components/catalog/CatalogHero"
import { CatalogToolbar } from "../components/catalog/CatalogToolbar"
import { CatalogPagination } from "../components/catalog/CatalogPagination"
import { usePagination } from "../lib/usePagination"
import { SeoHead } from "../seo/SeoHead"
import { JsonLd } from "../seo/JsonLd"
import { usePageSeo } from "../seo/usePageSeo"
import { usePageJsonLd } from "../seo/usePageJsonLd"
import { renderCatalogTitle } from "../lib/renderSectionTitle"
import { isEffectivelyPublished } from "../lib/publishSchedule"

const DEFAULT_CATEGORY_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "RESEARCH", label: "Research" },
  { id: "STRATEGY", label: "Strategy" },
  { id: "PLAYBOOK", label: "Playbook" },
  { id: "GUIDE", label: "Guide" },
]

export function BlogPage() {
  const { data, loading } = useWebsiteData()
  const seo = usePageSeo()
  const jsonLd = usePageJsonLd()
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const articles = useMemo(
    () => data.articles.filter((a) => isEffectivelyPublished(a)),
    [data.articles],
  )
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

  const catalog = data.settings.catalogPages?.blog
  const categoryFilters: { id: string; label: string }[] = [
    { id: "ALL", label: "All" },
    ...(data.settings.blogCategories?.map((cat) => ({
      id: cat.id,
      label: cat.label,
    })) ?? DEFAULT_CATEGORY_FILTERS.slice(1)),
  ]
  const pageSize = catalog?.pageSize && catalog.pageSize > 0 ? catalog.pageSize : 9
  const { page, setPage, totalPages, paginatedItems, showPagination } =
    usePagination(filteredArticles, pageSize)

  const resetFilters = () => {
    setSelectedCategory("ALL")
    setSearchQuery("")
  }

  return (
    <>
      <SeoHead seo={seo} />
      <JsonLd graph={jsonLd} />
      <div className="blog-page overflow-x-hidden public-page-shell public-inner-page">
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

        <main className="catalog-main premium-catalog-main max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
          <CatalogToolbar
            searchId="blog-search-input"
            searchPlaceholder={catalog?.searchPlaceholder?.trim() || "Search for articles"}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={categoryFilters}
            activeFilterId={selectedCategory}
            onFilterChange={setSelectedCategory}
            filterAriaLabel="Article categories"
          />

          {loading ? (
            <div aria-live="polite" aria-busy="true">
              <PlaybookArticlesSkeleton count={3} variant="grid" />
              <span className="sr-only">Loading articles</span>
            </div>
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
                    <PlaybookArticleCard article={article} featured={idx === 0} />
                  </li>
                ))}
              </ul>
              {showPagination ? (
                <CatalogPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              ) : null}
            </>
          )}

        </main>

        {(data.settings.visibility.finalCta ?? true) ? (
          <FinalCTA useSummitRegister surfaceVariant="muted" />
        ) : null}

        <Footer />
      </div>
    </>
  )
}
