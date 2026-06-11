import React, { useEffect, useMemo, useRef, useState, type SVGProps } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { useWebsiteData } from '../components/WebsiteDataProvider';
import { Footer } from '../components/Footer';
import { extractArticleToc } from '../lib/extractArticleToc';
import { BlogPostBody } from '../components/blog/BlogPostBody';
import { ArrowLeft, Link as LinkIcon, ChevronRight, ChevronLeft, Bookmark } from 'lucide-react';
import { SeoHead } from '../seo/SeoHead';
import { JsonLd } from '../seo/JsonLd';
import { usePageSeo } from '../seo/usePageSeo';
import { usePageJsonLd } from '../seo/usePageJsonLd';
import { isEffectivelyPublished } from '../lib/publishSchedule';
import {
  resolveActiveSectionId,
  scrollToArticleSection,
} from '../lib/articleScrollOffset';

// Custom icons for the professional monograph feel
const XIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M20 4L4 20"/>
  </svg>
);

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading } = useWebsiteData();
  const navigate = useNavigate();

  const article = data.articles.find((a) => a.slug === slug && isEffectivelyPublished(a));
  const tocItems = useMemo(
    () => (article ? extractArticleToc(article.content) : []),
    [article],
  );

  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [scrollTocId, setScrollTocId] = useState<string | undefined>();
  const activeTocId =
    scrollTocId && tocItems.some((item) => item.id === scrollTocId)
      ? scrollTocId
      : tocItems[0]?.id;
  const relatedRailRef = useRef<HTMLDivElement>(null);
  const tocNavRef = useRef<HTMLElement>(null);
  const tocScrollLockRef = useRef(false);

  const seo = usePageSeo({ article });
  const jsonLd = usePageJsonLd({ article });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (!loading && !article) {
      navigate('/blog');
    }
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [article, navigate, loading]);

  useEffect(() => {
    if (!article || tocItems.length === 0) return;

    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (!hash || !tocItems.some((t) => t.id === hash)) return;

    const frame = requestAnimationFrame(() => {
      scrollToArticleSection(hash, 'auto');
      setScrollTocId(hash);
    });

    return () => cancelAnimationFrame(frame);
  }, [article, tocItems]);

  useEffect(() => {
    if (!article || tocItems.length === 0) return;

    const sections = tocItems
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    let raf = 0;
    const syncActiveSection = () => {
      const next = resolveActiveSectionId(sections);
      if (next) setScrollTocId(next);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncActiveSection);
    };

    syncActiveSection();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [article, tocItems]);

  useEffect(() => {
    if (!activeTocId || tocScrollLockRef.current) {
      tocScrollLockRef.current = false;
      return;
    }

    const nav = tocNavRef.current;
    if (!nav) return;

    const link = nav.querySelector<HTMLAnchorElement>(
      `a[href="#${CSS.escape(activeTocId)}"]`,
    );
    link?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeTocId]);

  const handleTocNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    event.preventDefault();
    tocScrollLockRef.current = true;
    setScrollTocId(sectionId);
    scrollToArticleSection(sectionId);
  };

  const handleCopyLink = () => {
    if (!article) return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollRelated = (direction: 'prev' | 'next') => {
    const rail = relatedRailRef.current;
    if (!rail) return;
    const amount = Math.max(320, rail.clientWidth * 0.55);
    rail.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <>
    <SeoHead seo={seo} />
    <JsonLd graph={jsonLd} />
    {article ? (
    <motion.div className="min-h-screen bg-white public-page-shell public-inner-page public-article-page">
      {/* Cinematic Reading Progress */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent z-[110] origin-left"
        style={{ scaleX }}
      />

      <article className="relative blog-post-page__article">
        {/* Sticky TOC rail (ends with article) + scrolling article (right) */}
        <div className="blog-post-page__frame">
          <aside className="blog-post-page__toc-wrap" aria-label="Article outline">
            <div className="blog-post-page__toc-panel">
              <p className="blog-post-page__toc-title">Table of contents</p>
              {tocItems.length > 0 ? (
                <nav className="blog-post-page__toc-nav" ref={tocNavRef}>
                  <ul className="blog-post-page__toc-list">
                    {tocItems.map((item) => (
                      <li
                        key={`${article.id}:${item.id}`}
                        className={`blog-post-page__toc-li blog-post-page__toc-li--level-${item.level}`}
                      >
                        <a
                          href={`#${encodeURIComponent(item.id)}`}
                          className={
                            activeTocId === item.id ? 'blog-post-page__toc-link--active' : undefined
                          }
                          onClick={(event) => handleTocNavigate(event, item.id)}
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

          <div className="blog-post-page__main">
            <div className="blog-post-page__shell blog-post-page__article-stream overflow-x-hidden pb-12 lg:pb-14">
            <header className="pb-8 lg:pb-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2"
                  >
                    <Link
                      to="/blog"
                      className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 transition-colors duration-100 hover:text-accent dark:text-neutral-400 dark:hover:text-accent"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                      The Playbook
                    </Link>
                    <span className="text-neutral-400 dark:text-neutral-500" aria-hidden>
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
                className="blog-post-page__prose selection:bg-accent/10"
              >
                <BlogPostBody toc={tocItems} content={article.content} />
              </motion.div>
            </main>
            </div>
          </div>
        </div>
      </article>

      {/* Suggested Narratives */}
      <section className="blog-post-related">
        <div className="blog-post-page__shell">
          <div className="blog-post-related__header">
            <div>
              <span className="blog-post-related__eyebrow">Keep Learning</span>
              <h2 className="blog-post-related__title">Related Guides</h2>
            </div>
            <div className="blog-post-related__actions">
              <button
                type="button"
                className="blog-post-related__arrow"
                aria-label="Scroll related guides left"
                onClick={() => scrollRelated('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="blog-post-related__arrow"
                aria-label="Scroll related guides right"
                onClick={() => scrollRelated('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link to="/blog" className="blog-post-related__link group">
                Full Playbook <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="blog-post-related__rail" ref={relatedRailRef}>
            {data.articles
              .filter((a) => a.id !== article.id && a.isPublished)
              .slice(0, 8)
              .map((rel) => (
              <Link key={rel.id} to={`/blog/${rel.slug}`} className="blog-post-related__card group">
                <div className="blog-post-related__card-inner">
                  <div className="blog-post-related__media">
                    <img 
                      src={rel.thumbnail} 
                      alt={rel.title} 
                      className="blog-post-related__img" 
                    />
                    <div className="blog-post-related__badge-wrap">
                       <span className="blog-post-related__badge">
                         {rel.category}
                       </span>
                    </div>
                  </div>
                  <div className="blog-post-related__body">
                    <h3 className="blog-post-related__card-title">
                      {rel.title}
                    </h3>
                    <div className="blog-post-related__meta">
                       <span>{rel.time} read</span>
                       <span aria-hidden>•</span>
                       <span>{rel.publishedAt}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      
    </motion.div>
    ) : null}
    </>
  );
};
