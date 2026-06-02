import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConferenceContent } from '../../../hooks/useConferenceContent';
import { defaultConferenceTickets } from '../../../lib/conferenceDefaults';

export function ConferenceTickets() {
  const content = useConferenceContent();
  const block = content.tickets ?? defaultConferenceTickets;
  const tiers = block.tiers?.length ? block.tiers : defaultConferenceTickets.tiers;

  return (
    <section className="bg-transparent text-text py-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/8 blur-[150px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          {block.eyebrow && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
              {block.eyebrow}
            </p>
          )}
          <h2 className="text-4xl text-text md:text-5xl font-serif font-bold mb-4">
            {block.title ?? 'Secure Your Spot'}
          </h2>
          {block.lede && <p className="text-text2 text-lg">{block.lede}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col p-8 rounded-3xl border ${
                tier.recommended
                  ? 'bg-white border-black/15 shadow-[0_12px_34px_-20px_rgba(0,0,0,0.28)]'
                  : 'bg-white border-black/10 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.22)]'
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-text text-white text-sm font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl text-text font-bold font-serif mb-2">{tier.name}</h3>
                <p className="text-text2 text-sm h-10">{tier.description}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-text">{tier.price}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {tier.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-text2">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/register"
                className={`w-full h-14 rounded-full font-semibold text-lg transition-all flex items-center justify-center ${
                  tier.recommended
                    ? 'bg-text text-white hover:bg-text/90'
                    : 'bg-white text-text border border-black/12 hover:bg-off'
                }`}
              >
                {tier.ctaLabel ?? 'Get Tickets'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
