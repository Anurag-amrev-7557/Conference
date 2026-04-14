import { useState, useEffect, useMemo } from "react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { Users, Play, BookOpen, Sparkles, ArrowRight } from "lucide-react"
import { MarketingService } from "../../lib/marketing"

export function HeroSection({ onBookDemo }: { onBookDemo: () => void }) {
  const { data } = useWebsiteData()
  const { hero } = data
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  
  // High-performance cursor tracking via MotionValues (No re-renders!)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth springs for cursor followers - slightly snappier for better performance feel
  const springConfig = { damping: 30, stiffness: 200 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  // Memoize action cards to avoid redundant definitions
  const actionItems = useMemo(() => [
    {
      href: "#final-cta",
      icon: BookOpen,
      title: "Book a Demo using Work ID",
      subtitle: "Step-by-step AI automation guides for your biz",
      external: false
    },
    {
      href: "/community",
      icon: Users,
      title: "Join The Founder Network",
      subtitle: "2,500+ innovators scaling with Agentic AI",
      external: false
    }
  ], [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden hero-aura-bg">
      {/* Noise texture overlay */}
      <div className="hero-noise" />

      {/* Hardware Accelerated Spotlight - Static Layer moved via Transform */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ delay: 0.8, duration: 1.5 }}
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none z-[2] opacity-[0.08]"
        style={{
          background: "radial-gradient(circle, rgba(0, 82, 204, 0.8) 0%, transparent 70%)",
          left: -400,
          top: -400,
          x: springX,
          y: springY,
          willChange: "transform"
        }}
      />

      {/* Optimized Ambient Orbs - Only animate after load */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none z-[1] opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(0, 82, 204, 0.4) 0%, transparent 70%)",
          top: "15%",
          left: "10%",
          willChange: "transform"
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 0.2, 
          scale: 1,
          y: [0, -40, 0], 
          x: [0, 20, 0] 
        }}
        transition={{ 
          opacity: { delay: 1, duration: 2 },
          scale: { delay: 1, duration: 2 },
          y: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
          x: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
        }}
      />

      {/* Main content */}
      <div className="max-w-[1750px] mx-auto px-4 sm:px-8 relative z-10 w-full py-12 lg:py-0">
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-stretch items-center gap-12 lg:gap-16"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } }
          }}
        >

          {/* ===== LEFT COLUMN ===== */}
          <div className="lg:w-[35%] flex flex-col items-start text-left">
            {/* Tagline */}
            <motion.p
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
              }}
              className="text-[15px] font-medium uppercase tracking-[0.35em] text-accent mb-6 ml-3"
            >
              {hero.tagline}
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-[clamp(48px,9vw,92px)] font-serif font-normal leading-[1.08] tracking-tight text-text mb-8"
            >
              {hero.headline}{" "}<br/>
              <span className="italic text-accent">
                {hero.headlineAccent}
              </span>{" "}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 1 } }
              }}
              className="text-lg text-muted leading-relaxed mb-10 max-w-xl"
            >
              {hero.subtitle}
            </motion.p>

            {/* Action Buttons — Side by Side */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 1 } }
              }}
              className="flex flex-col gap-4 w-full max-w-xl"
            >
              {actionItems.map((item, idx) => (
                <motion.a
                  key={idx}
                  href={item.title === actionItems[0].title ? undefined : item.href}
                  onClick={(e) => {
                    if (item.title === actionItems[0].title) {
                      e.preventDefault();
                      onBookDemo();
                    }
                    MarketingService.logEvent("cta_click", { cta_id: item.title, destination: item.href });
                  }}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="group relative flex items-center gap-5 px-7 py-6 flex-1 no-underline rounded-3xl bg-white/70 backdrop-blur-2xl border border-border shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:bg-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-500 overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                >
                  {/* High Performance Spotlight Overlay - Moving Container */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ overflow: "hidden" }}
                  >
                    <motion.div 
                      className="absolute w-[400px] h-[400px] rounded-full"
                      style={{
                        background: "radial-gradient(circle, rgba(0, 82, 204, 0.05) 0%, transparent 70%)",
                        left: -200,
                        top: -200,
                        x: useSpring(mouseX, { damping: 40, stiffness: 300 }),
                        y: useSpring(mouseY, { damping: 40, stiffness: 300 }),
                        willChange: "transform"
                      }}
                    />
                  </motion.div>
                  
                  {/* Subtle Card Shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shadow-[0_4px_16px_rgba(0,82,204,0.4)] group-hover:scale-110 group-hover:shadow-[0_8px_24px_rgba(0,82,204,0.5)] transition-all duration-500">
                    <item.icon className="w-5.5 h-5.5 text-white" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col gap-1">
                    <span className="text-xl font-bold text-text tracking-tight group-hover:text-accent transition-colors duration-300">
                      {item.title}
                    </span>
                    <span className="text-md text-black leading-snug">
                      {item.subtitle}
                    </span>
                  </div>
                  
                  <ArrowRight className="relative z-10 w-5 h-5 text-muted ml-auto group-hover:text-accent group-hover:translate-x-1.5 transition-all duration-500" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* ===== RIGHT COLUMN: Video Blob ===== */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="lg:w-[65%] flex items-stretch relative"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <motion.div
                className="absolute w-[105%] h-[105%] opacity-30 bg-gradient-to-br from-accent/30 to-accent2/10 rounded-[40px]"
                style={{
                  filter: "blur(40px)",
                  willChange: "transform"
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 0.3,
                  scale: [1, 1.02, 1],
                }}
                transition={{ 
                  opacity: { delay: 1.5, duration: 1.5 },
                  scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            </div>

            {/* Video container - Rectangular Monograph Style */}
            <div className="relative z-10 w-full h-full rounded-[48px] glow-border overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-accent/20">
              {!isVideoPlaying ? (
                /* Thumbnail / Play state */
                <div
                  className="relative w-full h-full flex items-center justify-center cursor-pointer group"
                  onClick={() => {
                    setIsVideoPlaying(true);
                    MarketingService.logEvent("video_click", { video_id: "overview_video" });
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#091b36] via-[#0c2d5a] to-[#13407a]" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-40 group-hover:opacity-60 transition-opacity duration-700" />

                  {/* Decorative book icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-105 transition-transform duration-1000">
                    <BookOpen className="w-32 h-32 text-blue-300" />
                  </div>

                  {/* Play button */}
                  <motion.div
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10 w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl transition-all duration-300"
                  >
                    <Play className="w-10 h-10 text-white ml-1.5 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  </motion.div>

                  {/* Label */}
                  <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1.5">
                    <span className="text-[12px] font-bold text-white/50 uppercase tracking-[0.4em] group-hover:text-blue-200/70 transition-colors">
                      Watch the Overview
                    </span>
                    <Sparkles className="w-4 h-4 text-accent/40 animate-pulse" />
                  </div>
                </div>
              ) : (
                /* YouTube embed */
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/aircAruvnKk?autoplay=1&rel=0&modestbranding=1"
                  title="Superhumanly AI Overview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: "none" }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
