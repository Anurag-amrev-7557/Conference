import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, MapPin, Share2, Globe, ExternalLink } from "lucide-react"
import type { AppEvent } from "../../lib/websiteData"
import { CmsImage } from "../CmsImage"

interface EventDetailsDrawerProps {
  event: AppEvent | null
  isOpen: boolean
  onClose: () => void
}

export function EventDetailsDrawer({ event, isOpen, onClose }: EventDetailsDrawerProps) {
  if (!event && isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && event && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[1000] cursor-pointer"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 inset-y-0 w-full max-w-[500px] bg-[#fcfcfc] z-[1001] shadow-2xl flex flex-col overflow-y-auto"
          >
            {/* Top Navigation Bar */}
            <div className="sticky top-0 bg-[#fcfcfc]/80 backdrop-blur-xl z-20 px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="p-2 hover:bg-off rounded-full transition-colors">
                  <X className="w-5 h-5 text-text" />
                </button>
                <div className="h-4 w-[1px] bg-border mx-2" />
                <button className="flex items-center gap-2 px-3 py-1.5 bg-off rounded-lg text-[12px] font-bold hover:bg-border/40 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Event Page</span>
                <ExternalLink className="w-4 h-4 text-muted" />
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1">
              {/* Event Cover Image */}
              <div className="w-full aspect-square md:aspect-[4/3] relative overflow-hidden">
                <CmsImage
                  src={event.thumbnail}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {/* Visual Overlay like in the image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="w-full aspect-square bg-[#0052cc] rounded-[24px] flex flex-col items-center justify-center text-center p-8 shadow-2xl">
                    <h4 className="text-3xl font-serif italic text-white leading-tight mb-4">{event.title}</h4>
                    <p className="text-white/70 text-sm max-w-[200px]">Connecting the world of venture and AI</p>
                    <div className="mt-8 pt-8 border-t border-white/10 w-full flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Progressive Ventures</span>
                      <span className="text-[10px] font-bold text-white/50 underline">luma.com/investing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details Section */}
              <div className="px-8 py-10">
                <h1 className="text-3xl font-serif italic text-text leading-tight mb-8">
                  {event.title}
                </h1>

                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=${event.host}`} alt={event.host} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-text">Hosted by {event.host}</span>
                    <span className="text-[11px] text-muted">Core Strategist, Superhumanly AI</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-off rounded-xl flex flex-col items-center justify-center border border-border/40">
                      <span className="text-[9px] font-bold uppercase text-muted tracking-tighter leading-none mb-1">{event.day.split(' ')[1].slice(0, 3)}</span>
                      <span className="text-xl font-serif italic text-text leading-none">{event.day.split(' ')[0]}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-text">{event.weekday} {event.day}</span>
                      <span className="text-[12px] text-muted">{event.time} - 18:00 GMT-7</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-off rounded-xl flex items-center justify-center border border-border/40">
                      <MapPin className="w-5 h-5 text-muted" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-text">Register to See Address</span>
                      <span className="text-[12px] text-muted">{event.location}</span>
                    </div>
                  </div>
                </div>

                {/* Get Tickets - The Glass Card from the image */}
                <div className="p-8 rounded-[32px] bg-white border border-border shadow-alabaster mb-12">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted mb-6 block">Get Tickets</span>

                  {!event.status.includes('Past') ? (
                    <div className="flex flex-col gap-6">
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-muted uppercase tracking-tight mb-1">Ticket Price</span>
                          <span className="text-3xl font-serif italic text-text">{event.price || 'Free'}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-10 py-4 bg-text text-white rounded-2xl text-[13px] font-bold transition-all shadow-xl"
                        >
                          Request to Join
                        </motion.button>
                      </div>
                      <p className="text-[13px] text-muted leading-relaxed pt-6 border-t border-border/40">
                        Welcome! To join the event, please get your ticket below. Our team reviews all requests to ensure a balanced networking environment.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <span className="text-[11px] font-bold text-red-700">Past Event • Ended 6 days ago</span>
                      </div>
                      <span className="text-3xl font-serif italic text-text/40">{event.price}</span>
                      <button disabled className="w-full py-4 bg-off text-muted rounded-2xl text-[13px] font-bold cursor-not-allowed">
                        Registration Closed
                      </button>
                    </div>
                  )}
                </div>

                {/* About Event */}
                <div className="space-y-6 mb-16">
                  <h5 className="text-[13px] font-extrabold uppercase tracking-[0.2em] text-text">About Event</h5>
                  <p className="text-[15px] text-text leading-relaxed">
                    Join Founders Creative for a live session on investing in AI startups. We will discuss the state of the industry, how to evaluate emergent models, and the strategy for investing in the next generation of AI unicorns.
                  </p>
                  <ul className="space-y-3 pt-4">
                    {['Accredited Investor Status Check', 'Live Portfolio Construction Workshop', 'Networking with Tier-1 AI VCs'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-[14px] text-text2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Location Map Placeholder (Matches Image 2) */}
                <div className="space-y-6 mb-16">
                  <h5 className="text-[13px] font-extrabold uppercase tracking-[0.2em] text-text">Location</h5>
                  <p className="text-[14px] text-muted mb-6">Please register to see the exact location of this event.</p>
                  <div className="w-full aspect-video rounded-[24px] overflow-hidden border border-border/40 bg-slate-100 relative group">
                    <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop" alt="Map" className="w-full h-full object-cover filter grayscale" />
                    <div className="absolute inset-0 bg-accent/5" />
                    <div className="absolute bottom-6 left-6 group-hover:scale-105 transition-transform">
                      <div className="px-4 py-2 bg-text text-white rounded-lg flex items-center gap-2 text-[11px] font-bold shadow-2xl">
                        <MapPin className="w-3.5 h-3.5" />
                        Open in Google Maps
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footnotes / Socials (Matches Image 2) */}
                <div className="pt-12 border-t border-border/40 space-y-12 pb-20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-text rounded-2xl flex items-center justify-center text-white font-serif italic text-xl">S</div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold">Presented by Founders Creative</span>
                        <span className="text-[11px] text-muted">Building the Agentic Future Together</span>
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-off hover:bg-border/60 transition-all rounded-full text-[11px] font-bold uppercase tracking-widest border border-border">
                      Subscribe
                    </button>
                  </div>

                  <div className="flex gap-6">
                    <Globe className="w-5 h-5 text-muted hover:text-accent cursor-pointer transition-colors" />
                    <Share2 className="w-5 h-5 text-muted hover:text-accent cursor-pointer transition-colors" />
                    <ExternalLink className="w-5 h-5 text-muted hover:text-accent cursor-pointer transition-colors" />
                    <Globe className="w-5 h-5 text-muted hover:text-accent cursor-pointer transition-colors" />
                  </div>

                  <div className="grid grid-cols-2 gap-y-4">
                    {['Contact the Host', 'Refund Policy', 'Report Event', 'Terms of Service'].map((link) => (
                      <span key={link} className="text-[13px] text-muted hover:text-text cursor-pointer transition-colors font-medium">
                        {link}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-4 py-1.5 bg-off rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-border text-muted"># AI FOUNDERS</span>
                    <span className="px-4 py-1.5 bg-off rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-border text-muted"># VENTURE CAPITAL</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
