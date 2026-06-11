import { ConferenceHero } from '../components/sections/conference/ConferenceHero';
import { ConferenceSpeakers } from '../components/sections/conference/ConferenceSpeakers';
import { ConferenceVideo } from '../components/sections/conference/ConferenceVideo';
import { ConferenceAgenda } from '../components/sections/conference/ConferenceAgenda';
import { ConferenceSponsors } from '../components/sections/conference/ConferenceSponsors';
import { ConferencePartners } from '../components/sections/conference/ConferencePartners';
import { ConferenceFaq } from '../components/sections/conference/ConferenceFaq';
import { ConferenceTickets } from '../components/sections/conference/ConferenceTickets';
import { ConferenceCountdown } from '../components/sections/conference/ConferenceCountdown';
import { ConferenceVenue } from '../components/sections/conference/ConferenceVenue';
import { ConferenceTestimonials } from '../components/sections/conference/ConferenceTestimonials';
import { ConferencePastSpeakers } from '../components/sections/conference/ConferencePastSpeakers';
import { BlogSection } from '../components/sections/BlogSection';
import { EventsSection } from '../components/sections/EventsSection';
import { FinalCTA } from '../components/sections/FinalCTA';
import { Footer } from '../components/Footer';
import { useWebsiteData } from '../components/WebsiteDataProvider';
import { SeoHead } from '../seo/SeoHead';
import { usePageSeo } from '../seo/usePageSeo';
import { useConferenceContent } from '../hooks/useConferenceContent';
import { conferenceSectionVisible } from '../lib/conferenceDefaults';
import { resolveEmbeddedBlockOrder, resolveSectionOrder } from '../lib/conferenceSectionOrder';
import type { ConferenceSectionId, EmbeddedBlockId } from '../lib/websiteData';
import { NotFoundPage } from './NotFoundPage';
import { BookShowcase } from '../components/sections/BookShowcase';

function SummitSection({ id }: { id: ConferenceSectionId }) {
  const conference = useConferenceContent();
  const sectionVis = conference.sectionVisibility;

  if (!conferenceSectionVisible(sectionVis, id)) return null;

  switch (id) {
    case 'countdown':
      return <ConferenceCountdown />;
    case 'speakers':
      return <ConferenceSpeakers />;
    case 'video':
      return <ConferenceVideo />;
    case 'agenda':
      return <ConferenceAgenda />;
    case 'sponsors':
      return <ConferenceSponsors />;
    case 'partners':
      return <ConferencePartners />;
    case 'testimonials':
      return <ConferenceTestimonials />;
    case 'pastSpeakers':
      return <ConferencePastSpeakers />;
    case 'venue':
      return <ConferenceVenue />;
    case 'tickets':
      return <ConferenceTickets />;
    case 'faq':
      return <ConferenceFaq />;
    default:
      return null;
  }
}

function EmbeddedBlock({ id }: { id: EmbeddedBlockId }) {
  const { visibility } = useWebsiteData().data.settings;

  switch (id) {
    case 'showcase':
      return visibility.showcase ? (
        <BookShowcase className="book-section-bg--conference conference-section--white" />
      ) : null;
    case 'blog':
      return visibility.blog ? <BlogSection className="conference-section--muted" /> : null;
    case 'events':
      return visibility.events ? <EventsSection className="conference-section--white" /> : null;
    case 'finalCta':
      return (visibility.finalCta ?? true) ? (
        <FinalCTA useSummitRegister surfaceVariant="muted" />
      ) : null;
    default:
      return null;
  }
}

export function ConferencePage() {
  const seo = usePageSeo();
  const conference = useConferenceContent();
  const sectionVis = conference.sectionVisibility;
  const { visibility } = useWebsiteData().data.settings;
  const sectionOrder = resolveSectionOrder(conference.sectionOrder);
  const embeddedOrder = resolveEmbeddedBlockOrder(conference.embeddedBlockOrder);

  if (conference.published === false) {
    return <NotFoundPage />;
  }

  return (
    <>
      <SeoHead seo={seo} />

      <div className="w-full min-h-screen text-text public-page-shell conference-page-shell overflow-x-hidden">
        {conferenceSectionVisible(sectionVis, 'hero') ? <ConferenceHero /> : null}

        <div className="conference-flow public-flow-stack">
          {sectionOrder.map((id) => (
            <SummitSection key={id} id={id} />
          ))}

          {embeddedOrder.map((id) => (
            <EmbeddedBlock key={id} id={id} />
          ))}
        </div>

        {(visibility.footer ?? true) ? <Footer /> : null}
      </div>
    </>
  );
}
