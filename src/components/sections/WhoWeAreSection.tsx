import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { pillarIcons } from "../../lib/websiteData"

export function WhoWeAreSection() {
  const { data } = useWebsiteData()
  const { stats, pillars } = data
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" })

  return (
    <section
      ref={sectionRef}
      id="who-we-are"
      className="relative py-24 bg-white border-b border-border/20"
    >
      <div className="container mx-auto px-6 sm:px-10 relative z-10 mb-12">

        {/* Top Row: Label + Headline + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left: Headline block — takes 7 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <span className="text-[12px] font-bold text-accent uppercase tracking-[0.4em] mb-4 block">
              Who We Are
            </span>
            <h2 className="text-[clamp(48px,8vw,82px)] font-serif leading-[1.1] tracking-tight text-text mb-6">
              Built by founders,{" "}<br/>
              <span className="italic text-accent">for founders</span>.
            </h2>
            <p className="text-[18px] text-muted leading-relaxed max-w-xl">
              The definitive playbook for small business owners who want to
              harness AI — without jargon, complexity, or hiring a developer.
            </p>
          </motion.div>

          {/* Right: Stats — takes 5 cols, 2x2 grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-5 grid grid-cols-2 gap-4"
          >
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-off/60 border border-border/50 hover:border-accent/20 transition-all duration-300"
              >
                <div className="text-4xl font-serif italic text-text mb-1">
                  {stat.value}
                </div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-[0.15em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border mb-10" />

        {/* Bottom Row: Three pillars in a tight 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.25 + idx * 0.1 }}
              className="group flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6 shadow-[0_4px_12px_rgba(0,82,204,0.2)]">
                {(() => {
                  const Icon = pillarIcons[pillar.iconName];
                  return <Icon className="w-6 h-6 text-white" />;
                })()}
              </div>
              <h3 className="text-4xl font-normal mb-3 tracking-tight">
                {pillar.title}
              </h3>
              <p className="text-[16px] text-muted leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
