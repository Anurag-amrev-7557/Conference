import { useEffect, useRef, type CSSProperties } from "react"
import { Link } from "react-router-dom"
import { MapPin, Calendar, User, ArrowRight } from "lucide-react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { CmsImage } from "../CmsImage"

export function EventsSection() {
  const { data } = useWebsiteData()
  const events = data.events.filter((e) => e.isPublished)
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

  return (
    <section ref={sectionRef} id="events" className="events-section premium-home-section">
      <div className="events-section__ambient" aria-hidden />

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px] mx-auto">
        <header className="events-section__header flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-14 lg:mb-16">
          <div className="editorial-eyebrow editorial-eyebrow--center mb-6 sm:mb-7">
            <span className="editorial-eyebrow__rule" aria-hidden />
            <span className="section-eyebrow !mb-0 text-muted">Founder Calendar</span>
            <span className="editorial-eyebrow__rule" aria-hidden />
          </div>

          <h2 className="editorial-heading editorial-heading--section mb-0">
            Live Training & <span className="italic editorial-accent">Events</span>
          </h2>
        </header>

        {events.length > 0 ? (
          <div className="events-timeline mx-auto w-full max-w-3xl">
            <div className="events-timeline__spine" aria-hidden />

            <ol className="events-timeline__list list-none p-0 m-0 flex flex-col gap-12 sm:gap-14">
              {events.map((event, idx) => (
                <li
                  key={event.id}
                  className="events-timeline__item"
                  style={{ "--event-i": idx } as CSSProperties}
                >
                  <div className="events-timeline__node" aria-hidden />

                  <div className="events-timeline__date">
                    <span className="events-timeline__day">{event.day}</span>
                    <span className="events-timeline__weekday">{event.weekday}</span>
                  </div>

                  <article className="events-event-card group">
                    <Link to="/events" className="events-event-card__link">
                      <div className="events-event-card__main">
                        <p className="events-event-card__time">
                          <span className="events-event-card__time-primary">{event.time}</span>
                          <span className="events-event-card__meta-dot" aria-hidden />
                          <span>{event.full_time}</span>
                        </p>

                        <h3 className="events-event-card__title">{event.title}</h3>

                        <ul className="events-event-card__details list-none p-0 m-0">
                          <li>
                            <User className="w-3.5 h-3.5 shrink-0 text-accent" aria-hidden />
                            <span>By {event.host}</span>
                          </li>
                          <li>
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" aria-hidden />
                            <span>{event.location}</span>
                          </li>
                        </ul>

                        <div className="events-event-card__tags">
                          {event.tags.map((tag) => (
                            <span key={tag.name} className="events-event-card__tag">
                              {tag.name}
                            </span>
                          ))}
                          {event.price ? (
                            <span className="events-event-card__tag events-event-card__tag--price">
                              {event.price}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="events-event-card__media">
                        <CmsImage
                          src={event.thumbnail}
                          alt=""
                          width={144}
                          height={144}
                          loading="lazy"
                          className={
                            event.status === "Past"
                              ? "events-event-card__img events-event-card__img--past"
                              : "events-event-card__img"
                          }
                        />
                      </div>
                    </Link>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="events-section__empty editorial-lede text-center max-w-lg mx-auto">
            Upcoming founder sessions will appear here. Browse the calendar for past trainings and
            workshops.
          </p>
        )}

        <div className="events-section__footer">
          <Link to="/events" className="btn-cta-secondary group">
            <Calendar className="w-4 h-4 text-accent" aria-hidden />
            Browse full calendar
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
