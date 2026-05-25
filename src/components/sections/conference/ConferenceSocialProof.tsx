import React from 'react';

const LOGOS = [
  "Acme Corp", "GlobalTech", "Innovate AI", "Nexus Systems", "Quantum Data",
  "CloudScale", "FutureWorks", "LogicFlow", "NeuralNet", "Synergy"
];

const METRICS = [
  { value: "3,500+", label: "Attendees" },
  { value: "150+", label: "Speakers" },
  { value: "50+", label: "Sessions" },
  { value: "2", label: "Days of Innovation" }
];

export function ConferenceSocialProof() {
  return (
    <section className="bg-black text-white border-y border-white/10 py-16 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
          {METRICS.map((metric, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center px-4">
              <span className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-2">
                {metric.value}
              </span>
              <span className="text-sm md:text-base text-white/60 uppercase tracking-wider font-semibold">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full flex flex-col items-center">
        <p className="text-sm font-medium text-white/60 uppercase tracking-widest mb-8">
          Trusted by industry leaders
        </p>
        
        {/* Simple marquee animation via CSS */}
        <div className="flex w-max animate-marquee gap-16 px-8">
          <div className="flex shrink-0 gap-16 items-center opacity-60">
            {LOGOS.map((logo, idx) => (
              <span key={`logo-1-${idx}`} className="text-xl md:text-2xl font-bold font-serif whitespace-nowrap text-white">
                {logo}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 gap-16 items-center opacity-60">
            {LOGOS.map((logo, idx) => (
              <span key={`logo-2-${idx}`} className="text-xl md:text-2xl font-bold font-serif whitespace-nowrap text-white">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}} />
    </section>
  );
}
