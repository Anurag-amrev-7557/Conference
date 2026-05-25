import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const SPEAKERS = [
  {
    name: "Dr. Sarah Chen",
    title: "Chief AI Scientist",
    company: "GlobalTech",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Michael Rivera",
    title: "VP of Engineering",
    company: "Innovate AI",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Elena Rostova",
    title: "Director of Research",
    company: "Quantum Data",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "David Kim",
    title: "Founder & CEO",
    company: "NeuralNet",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800",
  },
];

export function ConferenceSpeakers() {
  return (
    <section className="bg-black text-white py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl text-white md:text-5xl font-serif font-bold mb-4">Featured Speakers</h2>
            <p className="text-white/60 text-lg max-w-xl">
              Learn directly from the innovators and leaders who are shaping the future of AI.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 text-white/80 font-semibold hover:text-white transition-colors group">
            View All Speakers
            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPEAKERS.map((speaker, idx) => (
            <div key={idx} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer">
              <img 
                src={speaker.image} 
                alt={speaker.name}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl text-white font-bold font-serif mb-1">{speaker.name}</h3>
                <p className="text-white/80 font-medium mb-1">{speaker.title}</p>
                <p className="text-white/60 text-sm">{speaker.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
