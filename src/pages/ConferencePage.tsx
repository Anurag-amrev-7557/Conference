import { ConferenceHero } from '../components/sections/conference/ConferenceHero';
import { ConferenceSpeakers } from '../components/sections/conference/ConferenceSpeakers';
import { ConferenceVideo } from '../components/sections/conference/ConferenceVideo';
import { ConferenceAgenda } from '../components/sections/conference/ConferenceAgenda';
import { ConferenceSponsors } from '../components/sections/conference/ConferenceSponsors'
import { ConferencePartners } from '../components/sections/conference/ConferencePartners'
import { ConferenceFaq } from '../components/sections/conference/ConferenceFaq'
import { ConferenceTickets } from '../components/sections/conference/ConferenceTickets'
import { ConferenceCountdown } from '../components/sections/conference/ConferenceCountdown'
import { ConferenceVenue } from '../components/sections/conference/ConferenceVenue';
import { ConferenceTestimonials } from '../components/sections/conference/ConferenceTestimonials';
import { BlogSection } from '../components/sections/BlogSection';
import { EventsSection } from '../components/sections/EventsSection';
import { FinalCTA } from '../components/sections/FinalCTA';
import { Footer } from '../components/Footer';
import { useWebsiteData } from '../components/WebsiteDataProvider';
import { SeoHead } from '../seo/SeoHead';
import { usePageSeo } from '../seo/usePageSeo';
import { useConferenceContent } from '../hooks/useConferenceContent';
import { conferenceSectionVisible } from '../lib/conferenceDefaults';
import { NotFoundPage } from './NotFoundPage';
import { BookShowcase } from '../components/sections/BookShowcase';

export function ConferencePage() {
  const seo = usePageSeo();
  const conference = useConferenceContent();
  const sectionVis = conference.sectionVisibility;
  const { visibility } = useWebsiteData().data.settings;

  if (conference.published === false) {
    return <NotFoundPage />;
  }

  return (
    <>
      <SeoHead seo={seo} />

      <main className="w-full min-h-screen text-text public-page-shell conference-page-shell overflow-x-hidden">
        {conferenceSectionVisible(sectionVis, 'hero') ? <ConferenceHero /> : null}

        <div className="conference-flow public-flow-stack">
          {conferenceSectionVisible(sectionVis, 'countdown') ? <ConferenceCountdown /> : null}
          {conferenceSectionVisible(sectionVis, 'speakers') ? <ConferenceSpeakers /> : null}
          {conferenceSectionVisible(sectionVis, 'video') ? <ConferenceVideo /> : null}
          {conferenceSectionVisible(sectionVis, 'agenda') ? <ConferenceAgenda /> : null}
          {conferenceSectionVisible(sectionVis, 'sponsors') ? <ConferenceSponsors /> : null}
          {conferenceSectionVisible(sectionVis, 'partners') ? <ConferencePartners /> : null}
          {conferenceSectionVisible(sectionVis, 'testimonials') ? <ConferenceTestimonials /> : null}
          {conferenceSectionVisible(sectionVis, 'venue') ? <ConferenceVenue /> : null}
          {conferenceSectionVisible(sectionVis, 'tickets') ? <ConferenceTickets /> : null}
          {conferenceSectionVisible(sectionVis, 'faq') ? <ConferenceFaq /> : null}

          {visibility.showcase ? (
            <BookShowcase className="book-section-bg--conference" />
          ) : null}
          {visibility.blog ? <BlogSection /> : null}
          {visibility.events ? <EventsSection /> : null}
          {(visibility.finalCta ?? true) ? <FinalCTA useSummitRegister /> : null}
        </div>

        {(visibility.footer ?? true) ? <Footer /> : null}
      </main>
    </>
  );
}
