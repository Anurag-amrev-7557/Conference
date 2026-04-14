import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useWebsiteData } from '../components/WebsiteDataProvider';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowLeft, Link as LinkIcon, ChevronRight, Bookmark } from 'lucide-react';

// Custom icons for the professional monograph feel
const XIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M20 4L4 20"/>
  </svg>
);

// Archive Link for Footer
const LinkedInIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useWebsiteData();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const article = data.articles.find(a => a.slug === slug);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (!article) {
      navigate('/blog');
    }
    window.scrollTo(0, 0);
  }, [article, navigate]);

  if (!article) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relatedArticles = data.articles
    .filter(a => a.id !== article.id && a.isPublished)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Cinematic Reading Progress */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent z-[110] origin-left"
        style={{ scaleX }}
      />

      <article className="relative">
        {/* Architectural Header Section */}
        <header className="pt-48 pb-20 px-6 sm:px-12 lg:px-16 max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            
            <div className="flex-1 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
              >
                <Link to="/blog" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  The Playbook
                </Link>
                <div className="w-[1px] h-4 bg-border/60" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted">
                  {article.category}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="text-[clamp(44px,7vw,100px)] font-serif italic text-text leading-[0.95] tracking-playbook mb-12"
              >
                {article.title}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-x-12 gap-y-6 pt-12 border-t border-border/60 shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border/50">
                    <img src={article.author?.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-text">{article.author?.name}</p>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-muted">{article.author?.role}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted/60">Released</span>
                  <span className="text-xs font-bold tracking-tight">{article.publishedAt}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted/60">Reading Time</span>
                  <span className="text-xs font-bold tracking-tight">{article.time} Read</span>
                </div>
              </motion.div>
            </div>

            {/* Sidebar Share Shelf (Desktop) */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden xl:flex flex-col gap-4 border-l border-border/60 pl-10"
            >
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`w-14 h-14 rounded-full border border-border flex items-center justify-center transition-all ${isBookmarked ? 'bg-accent text-white border-accent' : 'bg-white text-text hover:border-accent hover:text-accent shadow-elite'}`}
              >
                <Bookmark className="w-5 h-5" />
              </button>
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`, '_blank')}
                className="w-14 h-14 rounded-full border border-border bg-white text-text flex items-center justify-center hover:border-accent hover:text-accent transition-all shadow-elite"
              >
                <XIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={handleCopyLink}
                className="w-14 h-14 rounded-full border border-border bg-white text-text flex items-center justify-center hover:border-accent hover:text-accent transition-all shadow-elite relative"
              >
                <LinkIcon className="w-5 h-5" />
                <AnimatePresence>
                  {copied && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 bg-text text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap"
                    >
                      Copied Link
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.aside>
          </div>
        </header>

        {/* Cinematic Imagery Bleed */}
        <motion.section
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 mb-24"
        >
          <div className="relative aspect-[21/9] rounded-[48px] overflow-hidden shadow-alabaster shadow-2xl">
            <img 
              src={article.thumbnail} 
              alt="" 
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[48px]" />
          </div>
        </motion.section>

        {/* Narrative Engine (Main Content) */}
        <main className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 flex justify-center pb-32">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="prose prose-zinc prose-2xl max-w-none 
                prose-headings:font-serif prose-headings:italic prose-headings:font-normal prose-headings:tracking-tighter prose-headings:leading-none
                prose-p:text-text prose-p:leading-[1.7] prose-p:mb-12 prose-p:font-light prose-p:tracking-tight prose-p:text-[1.4rem]
                prose-li:text-text prose-li:text-[1.4rem] prose-li:leading-[1.7] prose-li:mb-4 prose-li:font-light
                prose-blockquote:border-l-0 prose-blockquote:relative prose-blockquote:my-20 prose-blockquote:px-0
                prose-blockquote:before:content-[''] prose-blockquote:after:content-['']
                prose-blockquote:italic prose-blockquote:font-serif prose-blockquote:text-4xl prose-blockquote:text-accent prose-blockquote:leading-tight
                prose-strong:font-bold prose-strong:text-text
                prose-img:rounded-[32px] prose-img:shadow-2xl prose-img:my-20 prose-img:border prose-img:border-border/60
                prose-pre:bg-off prose-pre:rounded-2xl prose-pre:border prose-pre:border-border/60 prose-pre:text-text
                selection:bg-accent/10
                drop-cap"
            >
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </motion.div>

            {/* Architectural Signature */}
            <footer className="mt-32 pt-20 border-t-2 border-text flex flex-col items-center">
              <span className="text-playbook mb-16">End of Playbook Guide</span>
              
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-20 p-12 bg-off rounded-[40px] border border-border/60 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-6">
                    <img src={article.author?.avatar} alt="" className="w-24 h-24 rounded-3xl object-cover ring-8 ring-white shadow-xl" />
                    <div>
                      <h4 className="text-3xl font-serif italic mb-1">{article.author?.name}</h4>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{article.author?.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted leading-relaxed font-light">
                    Specialized in high-fidelity agentic architecture and digital monopolies. Orchestrating the transition from human-led enterprise to AI-native ecosystems.
                  </p>
                </div>

                <div className="flex flex-col justify-between items-start gap-8">
                  <div className="flex flex-col gap-4 w-full">
                    <button className="w-full py-4 bg-text text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl hover:bg-zinc-800 transition-studio">
                      Follow Strategy
                    </button>
                    <button className="w-full py-4 border border-border text-text text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl hover:bg-white transition-studio">
                      Book Strategy Call
                    </button>
                  </div>
                  <div className="flex items-center gap-6 mt-auto">
                    {['X', 'LinkedIn', 'Archive'].map(link => (
                      <span key={link} className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted hover:text-accent cursor-pointer transition-colors flex items-center gap-1">
                        {link === 'LinkedIn' && <LinkedInIcon className="w-2.5 h-2.5" />}
                        {link}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </article>

      {/* Suggested Narratives */}
      <section className="bg-white py-32 border-t border-border/40 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="flex justify-between items-end mb-24">
            <div>
              <span className="text-playbook text-accent mb-6 block">Keep Learning</span>
              <h2 className="text-6xl font-serif italic text-text tracking-playbook">Related Guides</h2>
            </div>
            <Link to="/blog" className="group flex items-center gap-4 text-text font-bold text-[12px] uppercase tracking-[0.3em] hover:text-accent transition-colors">
              Full Playbook <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            {relatedArticles.map((rel) => (
              <Link key={rel.id} to={`/blog/${rel.slug}`} className="group block">
                <div className="flex flex-col gap-10">
                  <div className="relative aspect-[16/10] rounded-[40px] overflow-hidden shadow-alabaster group-hover:shadow-2xl transition-all duration-700">
                    <img 
                      src={rel.thumbnail} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute top-8 left-8">
                       <span className="px-4 py-1.5 glass-pill rounded-full text-[10px] font-bold uppercase tracking-widest text-text">
                         {rel.category}
                       </span>
                    </div>
                  </div>
                  <div className="max-w-xl">
                    <h3 className="text-4xl font-serif italic mb-6 group-hover:text-accent transition-studio leading-tight tracking-playbook">
                      {rel.title}
                    </h3>
                    <div className="flex items-center gap-8">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{rel.time} READ</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{rel.publishedAt}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .drop-cap p:first-of-type::first-letter {
          font-family: var(--font-serif);
          font-size: 5rem;
          line-height: 1;
          float: left;
          margin-right: 0.75rem;
          font-style: italic;
          color: var(--color-accent);
          font-weight: 300;
          margin-top: 0.5rem;
        }
      `}} />
    </div>
  );
};
