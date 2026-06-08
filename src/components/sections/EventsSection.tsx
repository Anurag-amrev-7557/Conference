import { useEffect, useMemo, useRef, type CSSProperties } from "react"
import { Link } from "react-router-dom"
import { Calendar, ArrowRight } from "lucide-react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { CmsImage } from "../CmsImage"
import { renderSectionHeading } from "../../lib/renderSectionTitle"
import {
  formatEventCardDate,
  formatEventCardTimeOnly,
  formatEventHost,
  getPreviewEvents,
} from "../../lib/eventDates"
import type { AppEvent } from "../../lib/websiteData"
import { cn } from "../../lib/utils"
import { SectionCarousel, SectionCarouselItem } from "./SectionCarousel"
import { EditorialEyebrow } from "../ui/EditorialEyebrow"

const DEFAULT_LEDE =
  "Join live masterclasses, founder workshops, and networking sessions built for teams shipping agentic AI."

type EventPreviewCardProps = {
  event: AppEvent
  index: number
}

function EventPreviewCard({ event, index }: EventPreviewCardProps) {
  const { day, weekday } = formatEventCardDate(event)
  const timeOnly = formatEventCardTimeOnly(event)
  const { name: hostName, subtitle: hostSubtitle, initials } = formatEventHost(
    event.host,
    event.location,
  )
  const eventHref = `/events/${event.id}`
  const linkLabel = `${event.title}, ${day}${timeOnly ? `, ${timeOnly}` : ""}, ${event.location}`
  const excerpt =
    event.description?.trim() ||
    `Join ${hostName} for a live session${hostSubtitle ? ` at ${hostSubtitle}` : ""}.`

  return (
    <div
      className="events-carousel-card"
      style={{ "--event-i": index } as CSSProperties}
    >
      <Link
        to={eventHref}
        className="events-carousel-card__link group"
        aria-label={linkLabel}
      >
        <div className="events-carousel-card__inner">
          <div className="events-carousel-card__media">
            <CmsImage
              src={event.thumbnail}
              alt={`${event.title} — ${day}`}
              width={560}
              height={315}
              loading="lazy"
              className={cn(
                "events-carousel-card__img",
                event.status === "Past" && "events-carousel-card__img--past",
              )}
            />
            {event.status === "Past" ? (
              <span className="events-carousel-card__status events-carousel-card__status--past">
                Past
              </span>
            ) : null}
          </div>

          <div className="events-carousel-card__body">
            <div className="events-carousel-card__meta-row">
              <span className="events-carousel-card__date-pill">
                <span className="events-carousel-card__day">{day}</span>
                <span className="events-carousel-card__meta-dot" aria-hidden />
                <span className="events-carousel-card__weekday">{weekday}</span>
              </span>
              <span className="events-carousel-card__meta-end">
                {timeOnly ? (
                  <span className="events-carousel-card__time">{timeOnly}</span>
                ) : null}
                {event.status === "Past" ? (
                  <span className="events-carousel-card__status-label">Past event</span>
                ) : null}
              </span>
            </div>

            <div className="events-carousel-card__overview">
              <h3 className="events-carousel-card__title">{event.title}</h3>
              <p className="events-carousel-card__excerpt">{excerpt}</p>
            </div>

            <div className="events-carousel-card__footer">
              <div className="events-carousel-card__host">
                <span className="events-carousel-card__host-avatar" aria-hidden>
                  {initials}
                </span>
                <span className="events-carousel-card__host-text">
                  <span className="events-carousel-card__host-name">{hostName}</span>
                  <span className="events-carousel-card__host-location">
                    {hostSubtitle}
                  </span>
                </span>
              </div>

              <div className="events-carousel-card__tags">
                {event.registrationOpen && event.status === "Upcoming" ? (
                  <span className="events-carousel-card__tag events-carousel-card__tag--open">
                    Open
                  </span>
                ) : null}
                {event.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.name}
                    className={cn("events-carousel-card__tag", tag.color)}
                  >
                    {tag.name}
                  </span>
                ))}
                {event.price ? (
                  <span className="events-carousel-card__tag events-carousel-card__tag--price">
                    {event.price}
                  </span>
                ) : null}
              </div>

              <span className="events-carousel-card__cta">
                {event.status === "Past" ? "View recap" : "Reserve your spot"}
                <ArrowRight className="events-carousel-card__cta-icon" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export function EventsSection() {
  const { data } = useWebsiteData()
  const preview = data.settings.sections?.eventsPreview
  const previewEvents = useMemo(() => getPreviewEvents(data.events, 4), [data.events])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("events-section--visible")
          observer.disconnect()
        }
      },
      { rootMargin: "-60px 0px", threshold: 0.06 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const lede = preview?.lede?.trim() || DEFAULT_LEDE

  return (
    <section ref={sectionRef} id="events" className="events-section premium-home-section">
      <div className="events-section__ambient" aria-hidden />

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto">
        <header className="events-section__header flex flex-col items-center text-center max-w-4xl mx-auto mb-12 sm:mb-14 lg:mb-16">
          <EditorialEyebrow
            centered
            className="mb-6 sm:mb-7"
            textClassName="!tracking-[0.08em] !text-xs"
          >
            {preview?.eyebrow?.trim() || "Founder Calendar"}
          </EditorialEyebrow>

          <h2 className="editorial-heading editorial-heading--section mb-0">
            {renderSectionHeading(preview, (
              <>
                Live Training & <span className="editorial-accent">Events</span>
              </>
            ))}
          </h2>
          <p className="editorial-lede mt-4 max-w-2xl mx-auto">{lede}</p>
        </header>

        {previewEvents.length > 0 ? (
          <SectionCarousel
            ariaLabel="Upcoming training and events"
            variant="events"
            trackClassName="events-carousel"
            showScrollHints={previewEvents.length > 1}
          >
            {previewEvents.map((event, idx) => (
              <SectionCarouselItem key={event.id}>
                <EventPreviewCard event={event} index={idx} />
              </SectionCarouselItem>
            ))}
          </SectionCarousel>
        ) : (
          <div className="events-section__empty">
            <Calendar className="events-section__empty-icon" aria-hidden />
            <p className="editorial-lede text-center max-w-lg mx-auto">
              {preview?.emptyState?.trim() ||
                "Upcoming founder sessions will appear here. Browse the calendar for past trainings and workshops."}
            </p>
            <Link
              to={preview?.ctaHref?.trim() || "/events"}
              className="events-section__empty-cta"
            >
              Browse full calendar
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        )}

        <div className="events-section__footer">
          <Link
            to={preview?.ctaHref?.trim() || "/events"}
            className="btn-cta-secondary group events-section__cta active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
          >
            <Calendar className="w-4 h-4 text-accent" aria-hidden />
            {preview?.ctaLabel?.trim() || "Browse full calendar"}
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
