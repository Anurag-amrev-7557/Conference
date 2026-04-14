import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { AppEvent } from "../../lib/websiteData"

interface EventsCalendarProps {
  events: AppEvent[]
  onEventClick?: (event: AppEvent) => void
}

export function EventsCalendar({ events, onEventClick }: EventsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [direction, setDirection] = useState(0)
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()
  
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]
  
  const totalDays = daysInMonth(year, month)
  const firstDay = firstDayOfMonth(year, month)
  
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i)
  }

  const changeMonth = (val: number) => {
    setDirection(val)
    setCurrentDate(new Date(year, month + val, 1))
  }

  const getEventsForDay = (day: number) => {
    const monthName = monthNames[month].slice(0, 3)
    return events.filter(e => {
        const [eDay, eMonth] = e.day.split(' ')
        return parseInt(eDay) === day && eMonth === monthName && e.isPublished
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  return (
    <div className="relative p-10 rounded-[40px] bg-white/30 backdrop-blur-3xl border border-white/40 shadow-alabaster overflow-hidden">
      {/* Decorative Aura Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Ultra-Modern Header */}
      <div className="flex items-center justify-between mb-12 relative z-10">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-3 bg-white/20 hover:bg-white/40 rounded-2xl transition-all border border-white/20 group"
        >
          <ChevronLeft className="w-4 h-4 text-text/60 group-hover:text-text transition-colors" />
        </button>

        <div className="text-center">
            <h4 className="text-2xl font-bold text-text tracking-tight">{monthNames[month]}</h4>
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mt-1">{year}</span>
        </div>

        <button 
          onClick={() => changeMonth(1)}
          className="p-3 bg-white/20 hover:bg-white/40 rounded-2xl transition-all border border-white/20 group"
        >
          <ChevronRight className="w-4 h-4 text-text/60 group-hover:text-text transition-colors" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-6 relative z-10">
        {dayNames.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-black text-text/20 uppercase tracking-widest">{day}</div>
        ))}
      </div>

      {/* Floating Date Matrix */}
      <div className="relative h-[240px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={month}
            custom={direction}
            initial={{ x: direction > 0 ? 30 : -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -30 : 30, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="grid grid-cols-7 gap-y-2"
          >
            {calendarDays.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : []
              const hasEvents = dayEvents.length > 0
              
              return (
                <div key={i} className="relative aspect-square flex items-center justify-center">
                  {day && (
                    <motion.div 
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => hasEvents && onEventClick && onEventClick(dayEvents[0])}
                      className={`
                        relative w-10 h-10 flex items-center justify-center text-[12px] font-bold rounded-2xl transition-all cursor-pointer
                        ${hasEvents ? 'text-text' : 'text-text/30 hover:text-text'}
                        ${isToday(day) ? 'bg-white shadow-elite text-accent' : 'hover:bg-white/20'}
                      `}
                    >
                      <span className="relative z-10">{day}</span>
                      
                      {/* Premium Aura Glow Marker */}
                      {hasEvents && (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-full h-full bg-accent/10 rounded-2xl animate-pulse blur-[8px]" />
                           <div className="absolute bottom-2 w-1 h-1 rounded-full bg-accent" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Minimalist Interaction Prompt */}
      <div className="mt-8 flex justify-center">
         <div className="px-5 py-2.5 bg-accent/5 rounded-full border border-accent/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Select an active node</span>
         </div>
      </div>
    </div>
  )
}
