import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { WaitlistForm } from "../landing/WaitlistForm"

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section
      ref={sectionRef}
      id="final-cta"
      className="relative py-6 pt-12 bg-white overflow-hidden border-t border-border/10"
    >
      {/* Subtle Aura Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 sm:px-10 max-w-4xl relative z-10">
        <div className="flex flex-col items-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="mb-8"
          >
            <span className="text-[12px] font-bold text-accent uppercase tracking-[0.4em] mb-4 block">
              Final Registry
            </span>
            <h2 className="text-[clamp(40px,7vw,72px)] font-serif italic text-text leading-[1.1] mb-8">
              Secure Your <span className="text-accent font-normal not-italic">Spot</span>.
            </h2>
            <p className="text-[18px] text-muted leading-relaxed font-light max-w-xl mx-auto">
              Join 2,500+ builders and innovators. Get the complete 
              architectural blueprint for your business automation.
            </p>
          </motion.div>

          {/* Simple & Straightforward Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full max-w-xl"
          >
            <div className="p-1 pb-10">
              <WaitlistForm />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
