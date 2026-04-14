import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Link } from "react-router-dom"
import { MapPin, ArrowUpRight, Calendar, User, ArrowRight } from "lucide-react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"

export function EventsSection() {
  const { data } = useWebsiteData()
  const events = data.events.filter(e => e.isPublished)
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative py-24 bg-white overflow-hidden border-b border-border/20"
    >
      {/* Background ambient glow - very subtle for light mode */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 sm:px-10 max-w-4xl relative z-10">
        
        {/* Section Header - Symmetrical & Clean */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-[11px] font-bold text-accent uppercase tracking-[0.4em] mb-4"
          >
            Founder Calendar
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-[clamp(32px,5vw,48px)] font-serif italic text-text leading-tight"
          >
            Live Training <span className="text-muted font-normal not-italic">&</span> Events
          </motion.h2>
          <div className="w-12 h-[1px] bg-accent mt-8" />
        </div>

        <div className="relative">
          {/* Vertical Timeline Spine - Subtle grey */}
          <div className="absolute left-[7px] top-4 bottom-0 w-[1px] bg-border/40" />

          <div className="flex flex-col gap-16">
            {events.map((event, idx) => (
              <div key={idx} className="relative pl-10 sm:pl-14">
                
                {/* Timeline Node - Refined dot */}
                <div className="absolute left-0 top-3 w-[15px] h-[15px] rounded-full bg-white border-2 border-accent z-10 shadow-sm" />

                {/* Date Header - Smaller & Sharp */}
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: idx * 0.15 }}
                  className="flex items-baseline gap-3 mb-6"
                >
                  <span className="text-xl font-serif italic text-text">{event.day}</span>
                  <span className="text-[11px] font-bold text-muted uppercase tracking-[0.2em]">{event.weekday}</span>
                </motion.div>

                {/* Event Card - More compact and card-like */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.1 + idx * 0.15, duration: 0.6 }}
                  className="group relative p-6 sm:p-7 rounded-[24px] bg-white border border-border/60 hover:border-accent/40 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-8">
                    
                    {/* Event Content */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[14px] font-bold text-text">{event.time}</span>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-[12px] font-medium text-muted tracking-tight">{event.full_time}</span>
                      </div>

                      <h3 className="text-[1.7rem] font-medium mb-6 group-hover:text-accent transition-colors">
                        {event.title}
                      </h3>

                      <div className="flex flex-col gap-3 mb-8">
                        <div className="flex items-center gap-2.5 text-muted">
                          <div className="w-7 h-7 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-accent" />
                          </div>
                          <span className="text-[14px] font-medium">By {event.host}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-muted">
                          <div className="w-7 h-7 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                          </div>
                          <span className="text-[14px] font-medium">{event.location}</span>
                        </div>
                      </div>

                      {/* Tags & Price */}
                      <div className="mt-auto flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          {event.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${tag.color}`}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold tracking-widest border border-emerald-100">
                          {event.price}
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail Section - Scaled down */}
                    <div className="relative w-full sm:w-36 h-36 sm:h-36 rounded-2xl overflow-hidden shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
                      <img
                        src={event.thumbnail}
                        alt="Event thumbnail"
                        className={`w-full h-full object-cover ${event.status === 'Past' ? 'grayscale' : ''} transition-all duration-700`}
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-accent/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-10 h-10 bg-white text-accent rounded-full flex items-center justify-center shadow-lg"
                        >
                          <ArrowUpRight className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: Browse more */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-20 flex flex-col items-center gap-6"
        >
          <div className="w-[1px] h-12 bg-border" />
          <Link to="/events" className="group flex items-center gap-3 px-8 py-4 rounded-full border border-border hover:border-accent hover:bg-accent/3 transition-all duration-300">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-muted group-hover:text-text">Browse Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5 text-accent/30 group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
