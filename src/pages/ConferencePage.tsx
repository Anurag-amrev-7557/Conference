import { lazy, Suspense } from 'react';
import { ConferenceHero } from '../components/sections/conference/ConferenceHero';
import { ConferenceSpeakers } from '../components/sections/conference/ConferenceSpeakers';
import { ConferenceVideo } from '../components/sections/conference/ConferenceVideo';
import { ConferenceAgenda } from '../components/sections/conference/ConferenceAgenda';
import { ConferenceSponsors } from '../components/sections/conference/ConferenceSponsors';
import { BlogSection } from '../components/sections/BlogSection';
import { EventsSection } from '../components/sections/EventsSection';
import { FinalCTA } from '../components/sections/FinalCTA';
import { Footer } from '../components/Footer';
import { useWebsiteData } from '../components/WebsiteDataProvider';
import { SeoHead } from '../seo/SeoHead';
import { usePageSeo } from '../seo/usePageSeo';
import { useConferenceContent } from '../hooks/useConferenceContent';
import { NotFoundPage } from './NotFoundPage';

const BookShowcase = lazy(() =>
  import('../components/sections/BookShowcase').then((m) => ({ default: m.BookShowcase })),
);

export function ConferencePage() {
  const seo = usePageSeo();
  const conference = useConferenceContent();
  const { visibility } = useWebsiteData().data.settings;

  if (conference.published === false) {
    return <NotFoundPage />;
  }

  return (
    <>
      <SeoHead seo={seo} />

      <main className="w-full min-h-screen text-text public-page-shell conference-page-shell overflow-x-hidden">
        <ConferenceHero />

        <div className="conference-flow public-flow-stack">
          <ConferenceSpeakers />
          <ConferenceVideo />
          <ConferenceAgenda />
          <ConferenceSponsors />

          {visibility.showcase ? (
            <Suspense fallback={<section className="min-h-[40vh] bg-transparent" aria-hidden />}>
              <BookShowcase className="book-section-bg--conference !pt-0 !pb-0 sm:!pt-0 sm:!pb-0 lg:!pt-0 lg:!pb-0" />
            </Suspense>
          ) : null}
          {visibility.blog ? <BlogSection /> : null}
          {visibility.events ? <EventsSection /> : null}
          {(visibility.finalCta ?? true) ? <FinalCTA useSummitRegister /> : null}
        </div>

        <Footer />
      </main>
    </>
  );
}
