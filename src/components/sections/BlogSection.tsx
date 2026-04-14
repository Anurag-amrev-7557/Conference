import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, BookOpen } from "lucide-react"
import { useWebsiteData } from "../../components/WebsiteDataProvider"
import { Link } from "react-router-dom"

export function BlogSection() {
  const { data } = useWebsiteData()
  const articles = data.articles.filter(a => a.isPublished).slice(0, 3)
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section
      ref={sectionRef}
      id="dispatch"
      className="relative py-24 bg-white border-b border-border/20"
    >
      <div className="container mx-auto px-6 sm:px-10 relative z-10">
        
        {/* Simplified Section Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-[12px] font-bold text-accent uppercase tracking-[0.4em] mb-4 block"
          >
            The Playbook
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-[clamp(32px,5vw,52px)] font-serif not-italic text-text leading-tight"
          >
            Latest <span className="text-accent font-normal italic mx-1">Automation</span> Strategies
          </motion.h2>
        </div>

        {/* Simplified Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {articles.map((article, idx) => (
            <motion.article
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group flex flex-col"
            >
              <Link to={`/blog/${article.slug}`} className="flex flex-col flex-1">
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-off shadow-sm group-hover:shadow-md transition-all duration-500">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-[0.1em]">{article.category}</span>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-[10px] font-medium text-muted uppercase tracking-widest">{article.time} READ</span>
                  </div>
                  
                  <h3 className="text-3xl mb-3 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-[17px] text-black leading-relaxed mb-6 font-light">
                    {article.excerpt}
                  </p>

                  <div className="mt-auto flex items-center gap-2 text-text font-bold text-[11px] uppercase tracking-widest group-hover:text-accent transition-colors cursor-pointer">
                    Get the Strategy <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Explore More - Simplified */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={isInView ? { opacity: 1 } : {}}
           transition={{ delay: 0.6 }}
           className="mt-20 flex justify-center"
        >
           <Link to="/blog" className="flex items-center gap-3 px-8 py-4 rounded-full border border-border hover:border-accent hover:bg-accent/5 transition-all duration-300 group">
             <BookOpen className="w-4 h-4 text-accent" />
             <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-muted group-hover:text-text">View Playbook</span>
           </Link>
        </motion.div>
      </div>
    </section>
  )
}
