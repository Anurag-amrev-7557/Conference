import { HeroSection } from "../components/sections/HeroSection"
import { WhoWeAreSection } from "../components/sections/WhoWeAreSection"
import { EventsSection } from "../components/sections/EventsSection"
import { BlogSection } from "../components/sections/BlogSection"
import { CommunitySection } from "../components/sections/CommunitySection"
import { BookShowcase } from "../components/sections/BookShowcase"
import { FinalCTA } from "../components/sections/FinalCTA"
import { Footer } from "../components/Footer"
import { useWebsiteData } from "../components/WebsiteDataProvider"
import { LeadCaptureModal } from "../components/LeadCaptureModal"
import { useState } from "react"
import { SeoHead } from "../seo/SeoHead"
import { usePageSeo } from "../seo/usePageSeo"

export function LandingPage() {
  const { data } = useWebsiteData();
  const { visibility } = data.settings;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const seo = usePageSeo();

  return (
    <>
    <SeoHead seo={seo} />
    <main className="relative bg-white min-h-screen overflow-x-hidden">
      <div className="noise-texture" />

      {/* Hero */}
      {visibility.hero && <HeroSection onBookDemo={() => setIsModalOpen(true)} />}

      {/* Book Showcase */}
      {visibility.showcase && <BookShowcase />}

      {/* Community */}
      {visibility.community && <CommunitySection />}

      {/* Who We Are */}
      {visibility.whoWeAre && <WhoWeAreSection />}

      {/* Blog */}
      {visibility.blog && <BlogSection />}

      {/* Events */}
      {visibility.events && <EventsSection />}
      
      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />

      <LeadCaptureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
    </>
  )
}
