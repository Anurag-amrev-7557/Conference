import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  MapPin,
  Share2,
  User,
} from "lucide-react"
import { useWebsiteData } from "../components/WebsiteDataProvider"
import type { AppEvent } from "../lib/websiteData"
import { BlogCtaSection } from "../components/blog/BlogCtaSection"
import { Footer } from "../components/Footer"
import { formatEventDayLabel } from "../lib/eventDates"
import { isEffectivelyPublished } from "../lib/publishSchedule"
import { SeoHead } from "../seo/SeoHead"
import { JsonLd } from "../seo/JsonLd"
import { usePageSeo } from "../seo/usePageSeo"
import { usePageJsonLd } from "../seo/usePageJsonLd"

function EventRegistrationCard({
  event,
  isPast,
  onShare,
}: {
  event: AppEvent
  isPast: boolean
  onShare: () => void
}) {
  const registrationClosed = event.registrationOpen === false
  const registrationUrl = event.registrationUrl?.trim()

  return (
    <div className="event-detail__ticket">
      <p className="event-detail__ticket-label">Registration</p>
      <p className="event-detail__ticket-price">{event.price || "Free"}</p>
      {!isPast && !registrationClosed ? (
        <>
          {registrationUrl ? (
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="event-detail__ticket-btn"
            >
              Request to join
            </a>
          ) : (
            <Link to="/register" className="event-detail__ticket-btn">
              Request to join
            </Link>
          )}
          <p className="event-detail__ticket-note">
            Requests are reviewed to keep sessions balanced and high-signal.
          </p>
        </>
      ) : (
        <>
          <button type="button" className="event-detail__ticket-btn" disabled>
            {isPast ? 'Registration closed' : 'Registration closed'}
          </button>
          <p className="event-detail__ticket-note">
            {isPast ? 'This event has ended.' : 'Registration is not open for this event.'}
          </p>
        </>
      )}
      <button type="button" className="event-detail__share-btn" onClick={onShare}>
        <Share2 className="w-4 h-4" aria-hidden />
        Share event
      </button>
    </div>
  )
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, loading } = useWebsiteData()
  const event = data.events.find((e) => e.id === id && isEffectivelyPublished(e))
  const seo = usePageSeo(event ? { event } : undefined)
  const jsonLd = usePageJsonLd()
  const { day, weekday } = event ? formatEventDayLabel(event) : { day: "", weekday: "" }

  useEffect(() => {
    if (!loading && !event) {
      navigate("/events", { replace: true })
    }
    window.scrollTo(0, 0)
  }, [event, loading, navigate])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: event?.title, url })
      return
    }
    await navigator.clipboard.writeText(url)
  }

  if (!event) {
    return (
      <>
        <SeoHead seo={seo} />
        <main className="catalog-main max-w-[1200px] mx-auto px-5 py-32 text-center text-text3" aria-busy="true">
          <p className="sr-only">Loading event…</p>
        </main>
        <Footer />
      </>
    )
  }

  const isPast = event.status === "Past"
  const mapsUrl =
    event.lat != null && event.lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`

  return (
    <>
      <SeoHead
        seo={{
          ...seo,
          title: `${event.title} — Superhumanly Events`,
          description: `${event.title} with ${event.host} in ${event.location}. ${event.full_time}.`,
        }}
      />
      <JsonLd graph={jsonLd} />
      <div className="event-detail-page overflow-x-hidden public-page-shell public-inner-page">
        <main className="event-detail">
          <div className="event-detail__shell mx-auto px-5 sm:px-8 lg:px-8 pt-28 sm:pt-32">
            <Link to="/events" className="event-detail__back">
              <ArrowLeft className="w-4 h-4" aria-hidden />
              All events
            </Link>

            <section className="event-detail__hero" aria-label="Event overview">
              <img
                src={event.thumbnail}
                alt=""
                className={`event-detail__hero-img${isPast ? " event-detail__hero-img--past" : ""}`}
              />
              <div className="event-detail__hero-scrim" aria-hidden />

              <div className="event-detail__hero-inner">
                <div className="event-detail__hero-info">
                  <span
                    className={`event-detail__status event-detail__status--${event.status.toLowerCase()}`}
                  >
                    {event.status}
                  </span>
                  <h1 className="event-detail__title">{event.title}</h1>
                  <p className="event-detail__host">
                    Hosted by <strong>{event.host}</strong>
                  </p>
                </div>

                <aside className="event-detail__hero-aside" aria-label="Registration">
                  <EventRegistrationCard
                    event={event}
                    isPast={isPast}
                    onShare={handleShare}
                  />
                </aside>
              </div>
            </section>

            <div className="event-detail__body">
              <div className="event-detail__body-main">
                <section className="event-detail__section" aria-labelledby="event-about-heading">
                  <h2 id="event-about-heading" className="event-detail__section-title">
                    About this event
                  </h2>
                  {event.description?.trim() ? (
                    <p className="event-detail__prose whitespace-pre-line">{event.description}</p>
                  ) : (
                    <>
                      <p className="event-detail__prose">
                        Join {event.host} for an intimate session on {event.title.toLowerCase()}.
                        Connect with founders, operators, and investors building the next wave of
                        agentic AI companies—with curated networking and actionable takeaways.
                      </p>
                      <ul className="event-detail__list">
                        <li>Curated founder &amp; investor networking</li>
                        <li>Live Q&amp;A with the host</li>
                        <li>Practical playbooks you can apply immediately</li>
                      </ul>
                    </>
                  )}
                </section>

                {event.tags.length > 0 ? (
                  <section className="event-detail__section" aria-label="Event tags">
                    <div className="event-detail__tags">
                      {event.tags.map((tag, i) => (
                        <span key={i} className={`event-detail__tag ${tag.color}`}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>

              <aside className="event-detail__body-aside" aria-label="Event details">
                <div className="event-detail__facts">
                  <div className="event-detail__fact">
                    <div className="event-detail__fact-icon">
                      <Calendar className="w-5 h-5" aria-hidden />
                    </div>
                    <div>
                      <p className="event-detail__fact-label">Date</p>
                      <p className="event-detail__fact-value">
                        {weekday}, {day}
                      </p>
                      <p className="event-detail__fact-sub">{event.full_time}</p>
                    </div>
                  </div>
                  <div className="event-detail__fact">
                    <div className="event-detail__fact-icon">
                      <Clock className="w-5 h-5" aria-hidden />
                    </div>
                    <div>
                      <p className="event-detail__fact-label">Time</p>
                      <p className="event-detail__fact-value">{event.time}</p>
                    </div>
                  </div>
                  <div className="event-detail__fact">
                    <div className="event-detail__fact-icon">
                      <MapPin className="w-5 h-5" aria-hidden />
                    </div>
                    <div>
                      <p className="event-detail__fact-label">Location</p>
                      <p className="event-detail__fact-value">{event.location}</p>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="event-detail__fact-link"
                      >
                        Open in Google Maps
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
                      </a>
                    </div>
                  </div>
                  <div className="event-detail__fact">
                    <div className="event-detail__fact-icon">
                      <User className="w-5 h-5" aria-hidden />
                    </div>
                    <div>
                      <p className="event-detail__fact-label">Host</p>
                      <p className="event-detail__fact-value">{event.host}</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <BlogCtaSection />
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
