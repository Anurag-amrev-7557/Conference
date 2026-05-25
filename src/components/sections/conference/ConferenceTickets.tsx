import { Check } from 'lucide-react';

const TIERS = [
  {
    name: "General Admission",
    price: "$995",
    description: "Full access to all keynote sessions and exhibition floor.",
    features: [
      "Access to all 2 days of content",
      "Entry to the exhibition hall",
      "Standard networking events",
      "On-demand video recordings (30 days)"
    ],
    recommended: false,
  },
  {
    name: "VIP Experience",
    price: "$1,895",
    description: "The ultimate conference experience with exclusive perks.",
    features: [
      "Everything in General Admission",
      "Priority seating at keynotes",
      "Exclusive VIP lounge access",
      "Private speaker meet & greet",
      "Lifetime access to recordings"
    ],
    recommended: true,
  }
];

export function ConferenceTickets() {
  return (
    <section className="bg-black text-white py-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-white md:text-5xl font-serif font-bold mb-4">Secure Your Spot</h2>
          <p className="text-white/60 text-lg">Choose the pass that best fits your goals.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TIERS.map((tier, idx) => (
            <div 
              key={idx} 
              className={`relative flex flex-col p-8 rounded-3xl border ${
                tier.recommended 
                  ? 'bg-white/10 border-white shadow-[0_0_50px_rgba(255,255,255,0.1)]' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-sm font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl text-white font-bold font-serif mb-2">{tier.name}</h3>
                <p className="text-white/60 text-sm h-10">{tier.description}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{tier.price}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {tier.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full h-14 rounded-full font-semibold text-lg transition-all ${
                  tier.recommended
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                Get Tickets
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
