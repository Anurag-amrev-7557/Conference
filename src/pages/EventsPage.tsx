import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight, Clock, MapPin } from "lucide-react"
import { useWebsiteData } from "../components/WebsiteDataProvider"
import type { AppEvent } from "../lib/websiteData"
import { formatEventDayLabel } from "../lib/eventDates"
import { usePagination } from "../lib/usePagination"
import { Footer } from "../components/Footer"
import { FinalCTA } from "../components/sections/FinalCTA"
import { CatalogHero } from "../components/catalog/CatalogHero"
import { CatalogToolbar } from "../components/catalog/CatalogToolbar"
import { CatalogPagination } from "../components/catalog/CatalogPagination"
import { SeoHead } from "../seo/SeoHead"
import { JsonLd } from "../seo/JsonLd"
import { usePageSeo } from "../seo/usePageSeo"
import { usePageJsonLd } from "../seo/usePageJsonLd"
import { renderCatalogTitle } from "../lib/renderSectionTitle"
import { isEffectivelyPublished } from "../lib/publishSchedule"

type EventFilter = "All" | "Upcoming" | "Past"

const EVENT_FILTERS = [
  { id: "All", label: "All" },
  { id: "Past", label: "Past Events" },
  { id: "Upcoming", label: "Upcoming Events" },
] as const

export function EventsPage() {
  const { data } = useWebsiteData()
  const seo = usePageSeo()
  const jsonLd = usePageJsonLd()
  const [activeFilter, setActiveFilter] = useState<EventFilter>("All")
  const [searchQuery, setSearchQuery] = useState("")

  const q = searchQuery.trim().toLowerCase()

  const filteredEvents = useMemo(() => {
    let list = data.events.filter((e) => isEffectivelyPublished(e))
    if (activeFilter !== "All") {
      list = list.filter((e) => e.status === activeFilter)
    }
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.host.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.tags.some((t) => t.name.toLowerCase().includes(q)),
      )
    }
    return list
  }, [data.events, activeFilter, q])

  const catalog = data.settings.catalogPages?.events
  const pageSize = catalog?.pageSize && catalog.pageSize > 0 ? catalog.pageSize : 9
  const { page, setPage, totalPages, paginatedItems, showPagination } =
    usePagination(filteredEvents, pageSize)

  const resetFilters = () => {
    setActiveFilter("All")
    setSearchQuery("")
  }

  const publishedCount = data.events.filter((e) => isEffectivelyPublished(e)).length

  return (
    <>
      <SeoHead seo={seo} />
      <JsonLd graph={jsonLd} />
      <div className="events-page overflow-x-hidden public-page-shell public-inner-page">
        <CatalogHero
          eyebrow={data.settings.catalogPages?.events?.eyebrow?.trim() || "Events"}
          title={renderCatalogTitle(data.settings.catalogPages?.events, (
            <>
              Where AI leaders <em>come together</em>
            </>
          ))}
          lede={
            data.settings.catalogPages?.events?.lede?.trim() ||
            "Explore upcoming masterclasses, networking sessions, and venture workshops—built for founders shaping the future of agentic AI."
          }
        />

        <main className="catalog-main premium-catalog-main max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
          <CatalogToolbar
            searchId="events-search-input"
            searchPlaceholder="Search for events"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={[...EVENT_FILTERS]}
            activeFilterId={activeFilter}
            onFilterChange={(id) => setActiveFilter(id as EventFilter)}
            filterAriaLabel="Event timeframe"
          />

          {publishedCount === 0 ? (
            <div className="events-empty">
              <p>No events published yet. Check back soon.</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="events-empty">
              <p>No events match your search.</p>
              {(q || activeFilter !== "All") && (
                <button type="button" className="events-empty__reset" onClick={resetFilters}>
                  Show all events
                </button>
              )}
            </div>
          ) : (
            <>
              <ul className="events-grid">
                {paginatedItems.map((event) => (
                  <li key={event.id}>
                    <EventGridCard event={event} />
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

function EventGridCard({ event }: { event: AppEvent }) {
  const { day, weekday } = formatEventDayLabel(event)

  return (
    <article className="events-grid-card group">
      <Link to={`/events/${event.id}`} className="events-grid-card__hit">
        <div className="events-grid-card__media">
          <img
            src={event.thumbnail}
            alt=""
            className={`events-grid-card__img${event.status === "Past" ? " events-grid-card__img--past" : ""}`}
            loading="lazy"
          />
          <span
            className={`events-grid-card__status events-grid-card__status--${event.status.toLowerCase()}`}
          >
            {event.status}
          </span>
        </div>

        <div className="events-grid-card__body">
          <p className="events-grid-card__date">
            <span className="events-grid-card__date-day">{day}</span>
            <span className="events-grid-card__date-weekday">{weekday}</span>
          </p>

          <div className="events-grid-card__meta">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span>{event.time}</span>
          </div>

          <h2 className="events-grid-card__title">{event.title}</h2>

          <p className="events-grid-card__location">
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span>
              {event.location} · {event.host}
            </span>
          </p>

          <div className="events-grid-card__tags">
            {event.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className={`events-grid-card__tag ${tag.color}`}>
                {tag.name}
              </span>
            ))}
            <span className="events-grid-card__tag events-grid-card__tag--price">
              {event.price}
            </span>
          </div>
        </div>
      </Link>

      <Link to={`/events/${event.id}`} className="events-grid-card__cta">
        View details
        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
      </Link>
    </article>
  )
}
