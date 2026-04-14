import React, { useState } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { Sparkles, BarChart3, Save, RotateCcw, Box, Zap } from 'lucide-react';

export const ContentManager: React.FC = () => {
  const { data, updateHero, updateStats, updatePillars, updatePerks, resetData } = useWebsiteData();
  const [heroForm, setHeroForm] = useState(data.hero);
  const [statsForm, setStatsForm] = useState(data.stats);
  const [pillarsForm, setPillarsForm] = useState(data.pillars);
  const [perksForm, setPerksForm] = useState(data.perks);

  const handleSaveHero = () => {
    updateHero(heroForm);
    alert('Hero content saved!');
  };

  const handleSaveStats = () => {
    updateStats(statsForm);
    alert('Stats saved!');
  };

  const handleSavePillars = () => {
    updatePillars(pillarsForm);
    alert('Pillars saved!');
  };

  const handleSavePerks = () => {
    updatePerks(perksForm);
    alert('Perks saved!');
  };

  const handleReset = () => {
    if (window.confirm('This will revert ALL website content to its original state. Continue?')) {
      resetData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section Management */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xl font-serif italic text-text">Hero Section</h3>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-border/40 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Tagline</label>
              <input
                type="text"
                value={heroForm.tagline}
                onChange={e => setHeroForm({ ...heroForm, tagline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Headline (Main)</label>
              <textarea
                value={heroForm.headline}
                onChange={e => setHeroForm({ ...heroForm, headline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none font-serif text-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 block">Headline (Accent/Italic)</label>
              <input
                type="text"
                value={heroForm.headlineAccent}
                onChange={e => setHeroForm({ ...heroForm, headlineAccent: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none font-serif italic text-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Subtitle</label>
              <textarea
                rows={3}
                value={heroForm.subtitle}
                onChange={e => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none leading-relaxed"
              />
            </div>
          </div>
          <button
            onClick={handleSaveHero}
            className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent2 transition-all shadow-lg shadow-accent/20"
          >
            <Save className="w-4 h-4" />
            Update Hero
          </button>
        </div>
      </section>

      {/* Stats Section Management */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xl font-serif italic text-text">Site Statistics</h3>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-border/40 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsForm.map((stat, idx) => (
              <div key={stat.id} className="space-y-4 p-4 rounded-xl bg-off/50 border border-border/40">
                <div>
                  <label className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1 block">Value</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={e => {
                      const newStats = [...statsForm];
                      newStats[idx].value = e.target.value;
                      setStatsForm(newStats);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-accent outline-none font-serif italic text-xl bg-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1 block">Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={e => {
                      const newStats = [...statsForm];
                      newStats[idx].label = e.target.value;
                      setStatsForm(newStats);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-accent outline-none text-xs bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveStats}
            className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent2 transition-all shadow-lg shadow-accent/20"
          >
            <Save className="w-4 h-4" />
            Update Statistics
          </button>
        </div>
      </section>

      {/* Pillars Section Management */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Box className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xl font-serif italic text-text">Methodology Pillars</h3>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-border/40 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillarsForm.map((pillar, idx) => (
              <div key={pillar.id} className="space-y-4 p-6 rounded-xl bg-off/50 border border-border/40 hover:border-accent/10 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-6 h-6 rounded bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                     {idx + 1}
                   </div>
                   <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Pillar Node</span>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1 block">Title</label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={e => {
                      const newPillars = [...pillarsForm];
                      newPillars[idx].title = e.target.value;
                      setPillarsForm(newPillars);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-accent outline-none text-sm bg-white font-serif"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1 block">Description</label>
                  <textarea
                    rows={3}
                    value={pillar.description}
                    onChange={e => {
                      const newPillars = [...pillarsForm];
                      newPillars[idx].description = e.target.value;
                      setPillarsForm(newPillars);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-accent outline-none text-xs bg-white leading-relaxed resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSavePillars}
            className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent2 transition-all shadow-lg shadow-accent/20"
          >
            <Save className="w-4 h-4" />
            Update Pillars
          </button>
        </div>
      </section>

      {/* Perks Section Management */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xl font-serif italic text-text">Community Perks</h3>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-border/40 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perksForm.map((perk, idx) => (
              <div key={perk.id} className="space-y-4 p-6 rounded-xl bg-off/50 border border-border/40">
                <div>
                  <label className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1 block">Label</label>
                  <input
                    type="text"
                    value={perk.label}
                    onChange={e => {
                      const newPerks = [...perksForm];
                      newPerks[idx].label = e.target.value;
                      setPerksForm(newPerks);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-accent outline-none text-[10px] bg-white font-bold tracking-widest uppercase"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1 block">Title</label>
                  <input
                    type="text"
                    value={perk.title}
                    onChange={e => {
                      const newPerks = [...perksForm];
                      newPerks[idx].title = e.target.value;
                      setPerksForm(newPerks);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-accent outline-none text-sm bg-white font-serif italic"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1 block">Description</label>
                  <textarea
                    rows={3}
                    value={perk.description}
                    onChange={e => {
                      const newPerks = [...perksForm];
                      newPerks[idx].description = e.target.value;
                      setPerksForm(newPerks);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-accent outline-none text-xs bg-white leading-relaxed resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSavePerks}
            className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent2 transition-all shadow-lg shadow-accent/20"
          >
            <Save className="w-4 h-4" />
            Update Perks
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-10 border-t border-border/40">
        <div className="bg-rose-50 p-8 rounded-[24px] border border-rose-100 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-rose-800">Danger Zone</h4>
            <p className="text-sm text-rose-600/80">Wipe all local changes and restore original defaults.</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Initial Content
          </button>
        </div>
      </section>
    </div>
  );
};
