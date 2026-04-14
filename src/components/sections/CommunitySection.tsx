import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Globe, ArrowRight } from "lucide-react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { perkIcons } from "../../lib/websiteData"
import { Link } from "react-router-dom"

export function CommunitySection() {
  const { data } = useWebsiteData()
  const { perks } = data
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section
      ref={sectionRef}
      id="community"
      className="relative py-32 pb-24 bg-[#f8fbfe] overflow-hidden border-b border-border/10"
    >
      {/* Background architectural spine - very subtle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-border/5 pointer-events-none" />

      <div className="container mx-auto px-6 sm:px-10 relative z-10 mb-24">
        {/* Blended Header: High-Density & Architectural */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="flex items-center gap-4 mb-6"
          >
            <div className="w-8 h-px bg-accent/50" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-[0.4em]">Community Registry</span>
            <div className="w-8 h-px bg-accent/50" />

          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-[clamp(36px,6vw,60px)] font-serif italic text-text leading-[1.1] mb-8 max-w-3xl"
          >
            Join the <span className="text-accent font-normal not-italic">Global Index</span> of Founders.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-8"
          >
             <p className="text-[18px] text-muted leading-relaxed font-light max-w-2xl">
              An elite network of 2,500+ builders and innovators orchestrating 
              automated business systems. Scale your brand alongside the best.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-10">
              <Link to="/community" className="group relative px-10 py-5 bg-text text-white rounded-full font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-accent transition-all shadow-xl flex items-center">
                 Apply for Access <ArrowRight className="ml-2 w-4 h-4 inline group-hover:translate-x-1.5 transition-transform" />
              </Link>
              
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-off overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt="Founder avatar" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-start border-l border-border/40 pl-4 py-1">
                  <span className="text-[11px] font-bold text-text uppercase tracking-widest leading-none mb-1">+2.5K ACTIVE</span>
                  <span className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] leading-none">Founder Nodes</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Full Width Registry with Margins */}
      <div className="w-full px-6 sm:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-b border-border/20 py-20 gap-y-16">
          {perks.map((perk, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + idx * 0.1, duration: 0.7 }}
              className={`px-8 lg:px-12 flex flex-col group ${idx !== 0 ? 'lg:border-l border-border/20' : ''}`}
            >
              {/* Architectural Icon Container */}
              <div className="w-12 h-12 flex items-center justify-center mb-8 bg-white border border-border/40 rounded-2xl shadow-sm group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(0,82,204,0.1)] transition-all duration-500">
                {(() => {
                  const Icon = perkIcons[perk.iconName];
                  return <Icon className="w-5 h-5 text-accent" />;
                })()}
              </div>

              {/* Label */}
              <div className="text-[9px] font-medium text-muted uppercase tracking-[0.3em] mb-4 group-hover:text-accent transition-colors">
                {perk.label}
              </div>

              {/* Title & Desc */}
              <h4 className="text-3xl italic text-text mb-4 group-hover:text-accent transition-colors">
                {perk.title}
              </h4>
              <p className="text-[16px] text-black leading-relaxed font-light group-hover:text-text transition-colors">
                {perk.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

        {/* Desktop Technical Backdrop */}
        <div className="absolute bottom-0 right-0 p-10 opacity-5 pointer-events-none hidden lg:block">
           <Globe className="w-64 h-64 text-accent" />
        </div>
    </section>
  )
}
