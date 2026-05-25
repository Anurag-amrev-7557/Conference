import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { useWebsiteData } from '../components/WebsiteDataProvider';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BlogPostMarkdown } from '../components/blog/BlogPostMarkdown';
import { extractMarkdownToc } from '../lib/extractMarkdownToc';
import { ArrowLeft, Link as LinkIcon, ChevronRight, Bookmark } from 'lucide-react';
import { SeoHead } from '../seo/SeoHead';
import { JsonLd } from '../seo/JsonLd';
import { usePageSeo } from '../seo/usePageSeo';
import { usePageJsonLd } from '../seo/usePageJsonLd';

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
  const { data, loading } = useWebsiteData();
  const navigate = useNavigate();

  const article = data.articles.find((a) => a.slug === slug);
  const tocItems = useMemo(
    () => (article ? extractMarkdownToc(article.content) : []),
    [article?.id, article?.content],
  );

  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTocId, setActiveTocId] = useState<string | undefined>();

  const seo = usePageSeo({ article });
  const jsonLd = usePageJsonLd({ article });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setActiveTocId(tocItems[0]?.id);
  }, [article?.id, tocItems]);

  useEffect(() => {
    if (!loading && !article) {
      navigate('/blog');
    }
    window.scrollTo(0, 0);
  }, [article, navigate, loading]);

  useEffect(() => {
    if (!article || tocItems.length === 0) return;

    const nodes = tocItems
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => {
          const topA = a.boundingClientRect.top;
          const topB = b.boundingClientRect.top;
          const offset = typeof window !== 'undefined' ? window.innerHeight * 0.2 : 0;
          const dist = (top: number) => Math.abs(top - offset);
          return dist(topA) - dist(topB);
        });
        setActiveTocId(visible[0].target.id);
      },
      {
        rootMargin: `calc(-1 * (var(--header-offset, 5.5rem) + 1.25rem)) 0px -45% 0px`,
        threshold: [0, 0.02, 0.08, 0.25, 0.5, 1],
      },
    );

    nodes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [article, tocItems]);

  const handleCopyLink = () => {
    if (!article) return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    <SeoHead seo={seo} />
    <JsonLd graph={jsonLd} />
    {article ? (
    <motion.div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      
      {/* Cinematic Reading Progress */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent z-[110] origin-left"
        style={{ scaleX }}
      />

      <article className="relative">
        {/* Full-width reading layout: sticky TOC (left) + header, hero, and body (right) */}
        <div className="blog-post-page__shell blog-post-page__layout pt-44 sm:pt-48 pb-28 lg:pb-32">
          <aside className="blog-post-page__toc-wrap" aria-label="Article outline">
            <div className="blog-post-page__toc-panel">
              <h3 className="blog-post-page__toc-title">Table of Contents</h3>
              {tocItems.length > 0 ? (
                <nav>
                  <ul className="blog-post-page__toc-list">
                    {tocItems.map((item) => (
                      <li
                        key={`${article.id}:${item.id}`}
                        className="blog-post-page__toc-li"
                        style={{
                          paddingLeft: `${Math.max(0, item.level - 2) * 0.65}rem`,
                        }}
                      >
                        <a
                          href={`#${encodeURIComponent(item.id)}`}
                          className={
                            activeTocId === item.id ? 'blog-post-page__toc-link--active' : undefined
                          }
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : (
                <p className="blog-post-page__toc-empty">
                  Sections appear automatically when your article uses markdown headings (#, ##, …).
                </p>
              )}
            </div>
          </aside>

          <div className="blog-post-page__article-stream">
            <header className="pb-10 lg:pb-12">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2"
                  >
                    <Link
                      to="/blog"
                      className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                      The Playbook
                    </Link>
                    <span className="text-muted/40" aria-hidden>
                      ·
                    </span>
                    <span className="blog-post-page__kicker">{article.category}</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.5 }}
                    className="blog-post-page__headline"
                  >
                    {article.title}
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="blog-post-page__meta"
                  >
                    <p className="blog-post-page__authorline">
                      <span className="text-muted">By </span>
                      <span className="blog-post-page__author-name">{article.authorName}</span>
                      {article.authorRole ? (
                        <span className="blog-post-page__author-role">, {article.authorRole}</span>
                      ) : null}
                    </p>
                    <p className="blog-post-page__meta-subline">
                      Published: {article.publishedAt}
                      <span className="mx-2 text-border" aria-hidden>
                        |
                      </span>
                      {article.time} read
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex shrink-0 items-center gap-2 lg:pt-1"
                >
                  <button
                    type="button"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border border-border transition-all ${
                      isBookmarked
                        ? 'border-accent bg-accent text-white'
                        : 'bg-white text-text hover:border-accent hover:text-accent shadow-elite'
                    }`}
                    aria-pressed={isBookmarked}
                    aria-label="Bookmark"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                        '_blank',
                      )
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-text shadow-elite transition-all hover:border-accent hover:text-accent"
                    aria-label="Share on X"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-text shadow-elite transition-all hover:border-accent hover:text-accent"
                    aria-label="Copy link"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <AnimatePresence>
                      {copied && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-text px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white"
                        >
                          Copied
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              </div>
            </header>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-12 lg:mb-16"
            >
              <div className="relative aspect-[21/9] overflow-hidden rounded-2xl shadow-alabaster ring-1 ring-black/5 lg:aspect-[2.2/1]">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  width={1400}
                  height={600}
                  loading="eager"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.section>

            <main className="blog-post-page__content">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="prose max-w-none blog-post-page__prose selection:bg-accent/10"
              >
                <BlogPostMarkdown toc={tocItems} content={article.content} />
              </motion.div>

              <footer className="mt-32 flex flex-col items-center border-t-2 border-text pt-20">
                <span className="text-playbook mb-16">End of Playbook Guide</span>

                <div className="group relative w-full grid grid-cols-1 gap-20 overflow-hidden rounded-[40px] border border-border/60 bg-off p-12 md:grid-cols-2">
                  <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-accent/5 blur-3xl" />

                  <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-6">
                      <img
                        src={article.authorAvatar}
                        alt={article.authorName}
                        className="h-24 w-24 rounded-3xl object-cover shadow-xl ring-8 ring-white"
                      />
                      <div>
                        <h3 className="mb-1 font-serif text-3xl italic">{article.authorName}</h3>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                          {article.authorRole}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-light leading-relaxed text-muted">
                      Specialized in high-fidelity agentic architecture and digital monopolies.
                      Orchestrating the transition from human-led enterprise to AI-native ecosystems.
                    </p>
                  </div>

                  <div className="flex flex-col items-start justify-between gap-8">
                    <div className="flex w-full flex-col gap-4">
                      <button className="w-full rounded-2xl bg-text py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-studio hover:bg-zinc-800">
                        Follow Strategy
                      </button>
                      <button className="w-full rounded-2xl border border-border py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-text transition-studio hover:bg-white">
                        Book Strategy Call
                      </button>
                    </div>
                    <div className="mt-auto flex items-center gap-6">
                      {['X', 'LinkedIn', 'Archive'].map((link) => (
                        <span
                          key={link}
                          className="flex cursor-pointer items-center gap-1 text-[9px] font-bold uppercase tracking-[0.3em] text-muted transition-colors hover:text-accent"
                        >
                          {link === 'LinkedIn' && (
                            <LinkedInIcon className="h-2.5 w-2.5" />
                          )}
                          {link}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </article>

      {/* Suggested Narratives */}
      <section className="bg-white py-32 border-t border-border/40 relative z-10">
        <div className="blog-post-page__shell">
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
            {data.articles
              .filter((a) => a.id !== article.id && a.isPublished)
              .slice(0, 2)
              .map((rel) => (
              <Link key={rel.id} to={`/blog/${rel.slug}`} className="group block">
                <div className="flex flex-col gap-10">
                  <div className="relative aspect-[16/10] rounded-[40px] overflow-hidden shadow-alabaster group-hover:shadow-2xl transition-all duration-700">
                    <img 
                      src={rel.thumbnail} 
                      alt={rel.title} 
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
    </motion.div>
    ) : null}
    </>
  );
};
