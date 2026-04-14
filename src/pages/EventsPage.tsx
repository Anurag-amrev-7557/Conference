import { useState, useEffect, useMemo } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { MapPin, ArrowUpRight, User, LayoutGrid, Clock } from "lucide-react"
import { useWebsiteData } from "../components/WebsiteDataProvider"
import type { AppEvent } from "../lib/websiteData"
import { Footer } from "../components/Footer"
import { Navbar } from "../components/Navbar"
import { EventsCalendar } from "../components/events/EventsCalendar"
import { EventsMap } from "../components/events/EventsMap"
import { EventDetailsDrawer } from "../components/events/EventDetailsDrawer"

export function EventsPage() {
  const { data } = useWebsiteData()
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming')
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // High-performance cursor tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { damping: 50, stiffness: 200 })
  const springY = useSpring(mouseY, { damping: 50, stiffness: 200 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const filteredEvents = useMemo(() => 
    data.events.filter(e => e.isPublished && e.status === activeTab),
    [data.events, activeTab]
  )

  const handleEventClick = (event: AppEvent) => {
    setSelectedEvent(event)
    setIsDrawerOpen(true)
  }

  return (
    <div className="h-screen flex flex-col bg-white text-text selection:bg-accent/20 overflow-hidden">
      <Navbar />
      
      {/* Event Details Drawer */}
      <EventDetailsDrawer 
        event={selectedEvent} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
      
      {/* Premium Background System - Persistent behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="hero-noise opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] via-white to-white" />
        
        {/* Dynamic Aura */}
        <motion.div 
          className="absolute w-[1000px] h-[1000px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
            x: springX,
            y: springY,
            left: -500,
            top: -500,
          }}
        />
      </div>

      {/* Main Content: Balanced 70/30 Split Layout */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pt-32">
        <main className="grid grid-cols-1 lg:grid-cols-10 min-h-[calc(100vh-128px)] overflow-hidden">
          
          {/* Column 1: Events Registry (Left Pane) - 70% width */}
          <div className="lg:col-span-7 flex flex-col h-full lg:h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar border-r border-border/10">
            <div className="py-20 px-6 sm:px-12 lg:px-24">
              
              <div className="flex flex-col items-start mb-24">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <span className="text-md font-bold text-accent bg-accent/5 px-4 py-1.5 rounded-full border border-accent/10">
                    Founder Network
                  </span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[clamp(32px,4vw,52px)] font-serif italic text-text leading-tight mb-8"
                >
                  Masterclasses <span className="text-muted font-normal not-italic">&</span> Networking
                </motion.h1>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative flex bg-off/50 p-1.5 rounded-full border border-border/40 backdrop-blur-sm"
                >
                  <button
                    onClick={() => setActiveTab('Upcoming')}
                    className={`relative px-8 py-2.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest transition-all duration-500 z-10 ${activeTab === 'Upcoming' ? 'text-white' : 'text-muted hover:text-text'}`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setActiveTab('Past')}
                    className={`relative px-8 py-2.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest transition-all duration-500 z-10 ${activeTab === 'Past' ? 'text-white' : 'text-muted hover:text-text'}`}
                  >
                    Past Events
                  </button>
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-y-1.5 bg-accent rounded-full shadow-lg"
                    initial={false}
                    animate={{
                      left: activeTab === 'Upcoming' ? 6 : '50%',
                      right: activeTab === 'Upcoming' ? '50%' : 6,
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                </motion.div>
              </div>

              <div className="relative pl-2 sm:pl-0">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute left-[7px] md:left-[7px] top-4 bottom-0 w-[1px] bg-border/60" 
                />

                <div className="flex flex-col gap-20">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col gap-16 pb-20"
                    >
                      {filteredEvents.length > 0 ? (
                        filteredEvents.map((event, idx) => (
                          <TimelineEventEntry key={event.id} event={event} idx={idx} onClick={() => handleEventClick(event)} />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-muted">
                           <LayoutGrid className="w-8 h-8 opacity-20 mb-4" />
                           <span className="text-[11px] font-bold uppercase tracking-widest">No Events Found</span>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Technical Laboratory (Right Pane) - 30% width */}
          <div className="lg:col-span-3 flex flex-col h-full lg:h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar bg-[#fcfcfb]/30">
            <div className="py-20 px-6 sm:px-10 flex flex-col gap-12">
               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.8, delay: 0.3 }}
               >
                 <EventsCalendar events={data.events} onEventClick={handleEventClick} />
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.8, delay: 0.4 }}
               >
                 <EventsMap events={data.events} onEventClick={handleEventClick} />
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.8, delay: 0.5 }}
                 className="p-8 rounded-[32px] bg-accent text-white overflow-hidden relative group mt-auto"
               >
                  <div className="relative z-10">
                    <h4 className="text-xl font-serif italic mb-4">Never miss a sync.</h4>
                    <p className="text-white/70 text-xs mb-6 max-w-[240px]">Stay updated with the latest AI events and venture networking sessions.</p>
                    <div className="flex bg-white/10 rounded-2xl p-1 border border-white/20 backdrop-blur-md">
                       <input type="text" placeholder="Email Address" className="bg-transparent border-none outline-none text-xs px-4 py-2.5 w-full placeholder:text-white/40" />
                       <button className="px-4 bg-white text-accent rounded-xl font-bold text-[10px] uppercase tracking-widest">
                          Join
                       </button>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
               </motion.div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  )
}

function TimelineEventEntry({ event, idx, onClick }: { event: AppEvent, idx: number, onClick: () => void }) {
  return (
    <div className="relative pl-10 sm:pl-16 group cursor-pointer" onClick={onClick}>
      {/* Timeline Node */}
      <motion.div 
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        className="absolute left-0 top-3 w-[15px] h-[15px] rounded-full bg-white border-2 border-accent z-10 shadow-sm transition-transform group-hover:scale-125 duration-500" 
      />

      {/* Date Header */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="flex items-baseline gap-4 mb-6"
      >
        <span className="text-2xl font-serif italic text-text group-hover:text-accent transition-colors duration-500">
          {event.day}
        </span>
        <span className="text-[11px] font-bold text-muted uppercase tracking-[0.2em]">
          {event.weekday}
        </span>
      </motion.div>

      {/* Event Card (Landscape Representation) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 + idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="group relative p-8 sm:p-10 rounded-[32px] bg-white border border-border/60 hover:border-accent/40 shadow-alabaster hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row justify-between gap-10">
          
          {/* Card Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
               <div className="flex items-center gap-2 text-accent">
                 <Clock className="w-3.5 h-3.5" />
                 <span className="text-[14px] font-bold text-text">{event.time}</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-border" />
               <span className="text-[12px] font-medium text-muted tracking-tight">{event.full_time}</span>
            </div>

            <h3 className="text-3xl font-medium mb-8 group-hover:text-accent transition-colors duration-500 leading-tight">
              {event.title}
            </h3>

            <div className="flex flex-col gap-3 mb-10">
              <div className="flex items-center gap-3 text-muted">
                <div className="w-7 h-7 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-[14px] font-medium">Host: {event.host}</span>
              </div>
              <div className="flex items-center gap-3 text-muted">
                <div className="w-7 h-7 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-[14px] font-medium">{event.location}</span>
              </div>
            </div>

            {/* Tags & Interaction */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                {event.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${tag.color}`}
                  >
                    {tag.name}
                  </span>
                ))}
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-extrabold tracking-widest border border-emerald-100/50">
                  {event.price}
                </span>
              </div>
              
              <button className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent hover:gap-4 transition-all duration-300">
                <span>View Details</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnail Section */}
          <div className="relative w-full md:w-56 h-56 md:h-56 rounded-[24px] overflow-hidden shadow-sm group-hover:scale-[1.03] transition-transform duration-700">
            <img
              src={event.thumbnail}
              alt={event.title}
              className={`w-full h-full object-cover ${event.status === 'Past' ? 'grayscale' : ''} transition-all duration-1000 group-hover:scale-110`}
            />
            {/* Hover Perspective Overlay */}
            <div className="absolute inset-0 bg-accent/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-white text-accent rounded-full flex items-center justify-center shadow-2xl"
              >
                <ArrowUpRight className="w-6 h-6" />
              </motion.div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}

