import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { cn } from '../../lib/utils';
import { EditorialSectionHeader } from '../ui/EditorialSectionHeader';

const DEFAULT_HIGHLIGHTS = [
  'Agent frameworks',
  'Deployment checklists',
  'Real-world workflows',
] as const;

const DEFAULT_TITLE_ACCENT = 'Agentic AI';

function renderBookTitle(title: string, accentPhrase?: string): ReactNode {
  const accent = accentPhrase?.trim() || DEFAULT_TITLE_ACCENT;
  const accentIndex = title.indexOf(accent);

  if (accentIndex === -1) return title;

  const before = title.slice(0, accentIndex);
  const after = title.slice(accentIndex + accent.length);

  return (
    <>
      {before}
      <span className="editorial-accent">{accent}</span>
      {after}
    </>
  );
}

function BookCoverFace({ coverUrl, coverAlt }: { coverUrl?: string; coverAlt: string }) {
  if (coverUrl) {
    return <img src={coverUrl} alt={coverAlt} className="book-3d__cover-img" />;
  }

  return (
    <div className="book-3d__cover-art" aria-hidden>
      <div className="flex items-center gap-2 text-white/65 text-[11px] font-medium uppercase tracking-[0.22em]">
        <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
        <span>Superhumanly</span>
      </div>
      <div className="text-center px-2">
        <p className="text-white text-3xl sm:text-4xl font-semibold tracking-tight leading-none">
          Playbook
        </p>
        <p className="mt-3 text-sm font-medium text-white/55 uppercase tracking-[0.18em]">
          Agentic AI
        </p>
      </div>
      <div className="h-px w-12 bg-white/20 mx-auto" aria-hidden />
    </div>
  );
}

function Book3D({ coverUrl, coverAlt }: { coverUrl?: string; coverAlt: string }) {
  return (
    <div
      className="book-3d-scene"
      {...(!coverUrl ? { role: 'img' as const, 'aria-label': coverAlt } : {})}
    >
      <div className="book-3d-float">
        <div className="book-3d-pivot">
          <div className="book-3d__ground" aria-hidden />
          <div className="book-3d">
            <div className="book-3d__back" aria-hidden />
            <div className="book-3d__top" aria-hidden />
            <div className="book-3d__bottom" aria-hidden />
            <div className="book-3d__spine" aria-hidden />
            <div className="book-3d__edge" aria-hidden />
            <div className="book-3d__cover">
              <BookCoverFace coverUrl={coverUrl} coverAlt={coverAlt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookShowcase({ className }: { className?: string }) {
  const { data } = useWebsiteData();
  const book = data.settings.book;
  const copy = data.settings.sections?.bookShowcase;
  const { hero } = data;
  const sectionRef = useRef<HTMLElement>(null);

  const title = book?.title?.trim() || 'The Blueprint for Automating Business with Agentic AI';
  const tagline = book?.tagline?.trim() || hero.tagline;
  const abstract =
    book?.abstract?.trim() ||
    hero.subtitle ||
    'A practical guide to building and scaling agentic AI in your business.';
  const coverUrl = book?.coverImageUrl?.trim();
  const titleAccent = copy?.titleAccent?.trim();

  const overview = copy?.lede?.trim() || abstract.split(/\n\n+/).filter(Boolean)[0] || abstract;
  const coverAlt = `Cover: ${title}`;

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const markVisible = () => {
      el.classList.add('book-section--visible');
    };

    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      markVisible();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          markVisible();
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px 80px 0px', threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="book"
      className={cn(
        'book-section book-section-bg book-section--borderless relative w-full',
        className,
      )}
      aria-labelledby="book-section-title"
    >
      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 lg:gap-14 xl:gap-16 items-center max-w-[1600px] mx-auto">
          <div className="book-section__visual flex justify-center shrink-0 w-full lg:w-auto">
            <div className="max-w-full mx-auto">
              <Book3D coverUrl={coverUrl} coverAlt={coverAlt} />
            </div>
          </div>

          <div className="book-section__copy flex flex-col items-start text-left max-w-2xl lg:max-w-none">
            <EditorialSectionHeader
              copy={copy}
              title={renderBookTitle(title, titleAccent)}
              eyebrowFallback="The Playbook"
              centered={false}
              headingVariant="showcase"
              titleId="book-section-title"
              className="mb-0"
              titleClassName="mb-4"
              fallback={renderBookTitle(title, titleAccent)}
            />

            {tagline ? (
              <p className="editorial-tagline editorial-tagline--secondary mb-6 sm:mb-8 max-w-xl">
                {tagline}
              </p>
            ) : null}

            <ul className="book-section__highlights list-none p-0 m-0" aria-label="What's inside">
              {DEFAULT_HIGHLIGHTS.map((item) => (
                <li key={item}>
                  <span className="book-section__chip">{item}</span>
                </li>
              ))}
            </ul>

            <p className="book-section__overview editorial-lede mb-6 sm:mb-8">{overview}</p>

            <div className="book-section__actions flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                to={copy?.ctaHref?.trim() || '/#final-cta'}
                className="btn-cta-primary w-full sm:w-auto text-center transition-all duration-150 active:scale-[0.97]"
              >
                {copy?.ctaLabel?.trim() || 'Get the playbook'}
              </Link>
              <Link
                to={copy?.secondaryCtaHref?.trim() || '/blog'}
                className="btn-cta-secondary group w-full sm:w-auto justify-center sm:justify-start transition-all duration-150 active:scale-[0.97]"
              >
                {copy?.secondaryCtaLabel?.trim() || 'Read excerpts'}
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
