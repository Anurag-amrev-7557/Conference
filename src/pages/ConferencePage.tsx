import { useEffect } from 'react';
import { ConferenceHero } from '../components/sections/conference/ConferenceHero';
import { ConferenceSocialProof } from '../components/sections/conference/ConferenceSocialProof';
import { ConferenceSpeakers } from '../components/sections/conference/ConferenceSpeakers';
import { ConferenceAgenda } from '../components/sections/conference/ConferenceAgenda';
import { ConferenceTickets } from '../components/sections/conference/ConferenceTickets';
import { FinalCTA } from '../components/sections/FinalCTA';
import { Helmet } from 'react-helmet-async';

export function ConferencePage() {
  useEffect(() => {
    // Force a dark mode aesthetic for the entire page body to match the premium ai4.io feel
    document.body.style.backgroundColor = '#000000';
    return () => {
      // Revert when leaving
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Superhumanly Summit 2026 | The Premier AI Conference</title>
        <meta name="description" content="Join industry leaders for a two-day immersion into the future of artificial intelligence and enterprise transformation." />
      </Helmet>

      <main className="w-full bg-black min-h-screen text-white">
        <ConferenceHero />
        <ConferenceSocialProof />
        <ConferenceSpeakers />
        <ConferenceAgenda />
        <ConferenceTickets />
        {/* We can reuse the FinalCTA but force dark mode or styling if needed. For now, it will render with its own styles */}
        <div className="bg-black py-12">
          <FinalCTA forceDark={true} />
        </div>
      </main>
    </>
  );
}
