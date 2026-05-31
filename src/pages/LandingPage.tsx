import { lazy, Suspense, useState } from "react"
import { HeroSection } from "../components/sections/HeroSection"
import { WhoWeAreSection } from "../components/sections/WhoWeAreSection"
import { EventsSection } from "../components/sections/EventsSection"
import { BlogSection } from "../components/sections/BlogSection"
import { FinalCTA } from "../components/sections/FinalCTA"
import { Footer } from "../components/Footer"
import { useWebsiteData } from "../components/WebsiteDataProvider"
import { LeadCaptureModal } from "../components/LeadCaptureModal"

const BookShowcase = lazy(() =>
  import("../components/sections/BookShowcase").then((m) => ({ default: m.BookShowcase })),
)
import { SeoHead } from "../seo/SeoHead"
import { JsonLd } from "../seo/JsonLd"
import { usePageSeo } from "../seo/usePageSeo"
import { usePageJsonLd } from "../seo/usePageJsonLd"

export function LandingPage() {
  const { data } = useWebsiteData();
  const { visibility } = data.settings;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const seo = usePageSeo();
  const jsonLd = usePageJsonLd();

  return (
    <>
    <SeoHead seo={seo} />
    <JsonLd graph={jsonLd} />
    <main className="relative bg-white min-h-screen overflow-x-hidden public-page-shell landing-page-overhaul">
      <div className="noise-texture" />

      {/* Hero + book share one continuous surface (grid, tint, bg) */}
      {visibility.hero || visibility.showcase ? (
        <div className="landing-flow public-flow-stack">
          {visibility.hero && <HeroSection onBookDemo={() => setIsModalOpen(true)} />}
          {visibility.showcase && (
            <Suspense fallback={<section className="min-h-[40vh] bg-transparent" aria-hidden />}>
              <BookShowcase />
            </Suspense>
          )}
        </div>
      ) : null}

      {/* Who We Are */}
      {visibility.whoWeAre && <WhoWeAreSection />}

      {/* Blog */}
      {visibility.blog && <BlogSection />}

      {/* Events */}
      {visibility.events && <EventsSection />}

      {/* Final CTA */}
      {(visibility.finalCta ?? true) && <FinalCTA />}

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
