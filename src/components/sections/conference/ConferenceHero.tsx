import React from 'react';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function ConferenceHero() {
  return (
    <section className="relative w-full min-h-[95vh] flex items-center justify-center overflow-hidden bg-[#030303] text-white pt-32 pb-20">
      {/* Animated Ambient Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ 
            opacity: [0.3, 0.5, 0.3], 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.4, 0.2], 
            scale: [1, 1.2, 1],
            rotate: [0, -5, 0] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-purple-700/20 blur-[150px] rounded-full mix-blend-screen" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Eyebrow Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        >
          <SparklesIcon className="w-4 h-4 text-blue-400" />
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-white/90 uppercase">The Premier AI Event of 2026</span>
        </motion.div>

        {/* Main Heading */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-serif font-bold tracking-tight leading-[1.05]"
          >
            Superhumanly
          </motion.h1>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-serif font-bold tracking-tight leading-[1.05]"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">
              Summit 2026
            </span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-xl md:text-2xl text-white/60 max-w-3xl mb-12 font-sans leading-relaxed"
        >
          Join industry leaders, innovators, and visionaries for a two-day immersion into the future of artificial intelligence and enterprise transformation.
        </motion.p>

        {/* Event Details Grid */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-14"
        >
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Date</p>
              <p className="text-sm sm:text-base font-medium text-white/90">October 14-15, 2026</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Venue</p>
              <p className="text-sm sm:text-base font-medium text-white/90">Marymoor Park, Redmond</p>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
        >
          <button className="group relative inline-flex items-center justify-center h-14 px-8 rounded-full bg-white text-black font-semibold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95">
            <span className="relative z-10 flex items-center gap-2">
              Register Now <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -inset-1 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-transparent text-white font-semibold text-lg hover:bg-white/5 border border-white/20 hover:border-white/40 transition-all backdrop-blur-sm">
            View Agenda
          </button>
        </motion.div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
