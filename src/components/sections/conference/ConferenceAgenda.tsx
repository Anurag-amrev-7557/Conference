import { useState } from 'react';
import { cn } from '../../../lib/utils';

const SCHEDULE = {
  day1: [
    { time: "09:00 AM", title: "Opening Keynote: The AI Imperative", speaker: "David Kim, NeuralNet", track: "Main Stage" },
    { time: "10:30 AM", title: "Generative AI in the Enterprise", speaker: "Elena Rostova, Quantum Data", track: "Enterprise" },
    { time: "11:45 AM", title: "Ethics and Governance Workshop", speaker: "Dr. Sarah Chen, GlobalTech", track: "Ethics" },
    { time: "01:00 PM", title: "Networking Lunch", speaker: "", track: "Networking" },
    { time: "02:30 PM", title: "Building Scalable AI Infrastructure", speaker: "Michael Rivera, Innovate AI", track: "Technical" },
  ],
  day2: [
    { time: "09:30 AM", title: "Day 2 Kickoff: State of Open Source", speaker: "Guest Panel", track: "Main Stage" },
    { time: "11:00 AM", title: "AI-Driven Customer Experiences", speaker: "Marketing Leaders", track: "Enterprise" },
    { time: "01:00 PM", title: "AI Awards & Closing Remarks", speaker: "David Kim", track: "Main Stage" },
  ]
};

export function ConferenceAgenda() {
  const [activeDay, setActiveDay] = useState<'day1' | 'day2'>('day1');

  return (
    <section className="bg-black text-white py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-white md:text-5xl font-serif font-bold mb-4">Agenda</h2>
          <p className="text-white/60 text-lg">Two days packed with insights, strategies, and networking.</p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => setActiveDay('day1')}
            className={cn(
              "px-8 py-3 rounded-full font-semibold transition-all duration-300",
              activeDay === 'day1' ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
            )}
          >
            Day 1 (Oct 14)
          </button>
          <button 
            onClick={() => setActiveDay('day2')}
            className={cn(
              "px-8 py-3 rounded-full font-semibold transition-all duration-300",
              activeDay === 'day2' ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
            )}
          >
            Day 2 (Oct 15)
          </button>
        </div>

        <div className="space-y-4">
          {SCHEDULE[activeDay].map((session, idx) => (
            <div 
              key={idx} 
              className="group flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/40 transition-colors"
            >
              <div className="md:w-32 shrink-0">
                <span className="text-xl font-medium text-white/80">{session.time}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-serif text-white font-bold mb-2 group-hover:text-white transition-colors">
                  {session.title}
                </h3>
                {session.speaker && (
                  <p className="text-white/60 font-medium">{session.speaker}</p>
                )}
              </div>
              <div className="shrink-0 mt-4 md:mt-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-white/80">
                  {session.track}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
