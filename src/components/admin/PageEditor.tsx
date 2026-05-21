import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { LivePreview } from './LivePreview';
import { 
  Eye, 
  EyeOff, 
  Save, 
  Layout, 
  Sparkles,
  BarChart3,
  Users,
  Target,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { pillarIcons, perkIcons } from '../WebsiteDataProvider';

export const PageEditor: React.FC = () => {
  const { data, updateHero, updateStats, updatePillars, updatePerks, updateSettings, setPreview, isPreviewVisible } = useWebsiteData();
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'showcase' | 'perks' | 'visibility'>('hero');
  const [isSaving, setIsSaving] = useState(false);

  const [heroForm, setHeroForm] = useState(data.hero);
  const [statsForm, setStatsForm] = useState(data.stats);
  const [pillarsForm, setPillarsForm] = useState(data.pillars);
  const [perksForm, setPerksForm] = useState(data.perks);
  const [visibilityForm, setVisibilityForm] = useState(data.settings.visibility);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync with live preview
  useEffect(() => {
    setPreview({
      hero: heroForm,
      stats: statsForm,
      pillars: pillarsForm,
      perks: perksForm,
      settings: {
        ...data.settings,
        visibility: visibilityForm
      }
    });

    return () => setPreview(null);
  }, [heroForm, statsForm, pillarsForm, perksForm, visibilityForm, data.settings]);

  const handleSave = async (type: string) => {
    setIsSaving(true);
    try {
      if (type === 'hero') await updateHero(heroForm);
      if (type === 'stats') await updateStats(statsForm);
      if (type === 'pillars') await updatePillars(pillarsForm);
      if (type === 'perks') await updatePerks(perksForm);
      if (type === 'visibility') await updateSettings({ ...data.settings, visibility: visibilityForm });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'hero', label: 'Hero', icon: Sparkles },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'showcase', label: 'Showcase', icon: Target },
    { id: 'perks', label: 'Community', icon: Users },
    { id: 'visibility', label: 'Visibility', icon: Layout },
  ];

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg relative font-sans text-text">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-studio opacity-[0.03] pointer-events-none" />

      {/* Sidebar Controls */}
      <motion.div 
        layout
        animate={{ 
          width: !isPreviewVisible ? '100%' : (isSidebarCollapsed ? 0 : 520), 
          opacity: (isSidebarCollapsed && isPreviewVisible) ? 0 : 1 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "bg-white flex flex-col shrink-0 relative z-10 shadow-premium overflow-hidden",
          isPreviewVisible ? "border-r border-border" : "w-full"
        )}
      >
        <div className={cn(
          "flex flex-col h-full bg-white",
          !isPreviewVisible ? "max-w-4xl mx-auto w-full border-x border-border/40" : "w-[520px]"
        )}> 
          <div className="p-5">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-off flex items-center justify-center border border-border">
                   <Layout className="w-5 h-5 text-accent" />
                </div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Page Editor</span>
             </div>
             <h3 className="text-4xl font-serif italic text-text mb-4">Edit Page</h3>
             <p className="text-text2 text-base leading-relaxed">Edit your landing page content, visibility settings, and key website statistics.</p>
          </div>

          <div className="flex-1 overflow-y-auto">
             {/* Tab Navigation */}
             <div className="flex border-b border-border/40 w-full sticky top-0 bg-white z-20">
                {tabs.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={cn(
                       "flex-1 flex flex-col items-center gap-2.5 py-5 transition-all duration-500 relative",
                       activeTab === tab.id 
                       ? "text-accent bg-accent/[0.02]" 
                       : "text-muted hover:text-text hover:bg-off/30"
                     )}
                  >
                    <tab.icon className={cn("w-4 h-4 transition-transform duration-500", activeTab === tab.id ? "scale-110" : "opacity-40")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                    
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                      />
                    )}
                  </button>
                ))}
             </div>

             <div className="p-8 space-y-12">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                   className="space-y-12"
                 >
                   {activeTab === 'hero' && (
                     <div className="space-y-10 animate-fadeInUp">
                       <div className="space-y-4">
                         <h4 className="text-xl font-bold text-text">Eyebrow / Tagline</h4>
                         <input
                           type="text"
                           value={heroForm.tagline}
                           onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
                           className="w-full bg-[#fafafa] border border-border/40 p-5 text-sm focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                         />
                       </div>

                       <div className="grid grid-cols-1 gap-4">
                         <div className="space-y-2">
                           <h4 className="text-sm font-bold text-text">Primary CTA label</h4>
                           <input
                             type="text"
                             value={heroForm.primaryCtaLabel ?? ''}
                             onChange={(e) => setHeroForm({ ...heroForm, primaryCtaLabel: e.target.value })}
                             className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                           />
                         </div>
                         <div className="space-y-2">
                           <h4 className="text-sm font-bold text-text">Secondary CTA label</h4>
                           <input
                             type="text"
                             value={heroForm.secondaryCtaLabel ?? ''}
                             onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaLabel: e.target.value })}
                             className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                           />
                         </div>
                         <div className="space-y-2">
                           <h4 className="text-sm font-bold text-text">Secondary CTA link</h4>
                           <input
                             type="text"
                             value={heroForm.secondaryCtaHref ?? ''}
                             onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaHref: e.target.value })}
                             placeholder="/community"
                             className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                           />
                         </div>
                       </div>

                       <div className="space-y-4">
                         <h4 className="text-xl font-bold text-text">Main Heading</h4>
                         <textarea 
                           value={heroForm.headline}
                           onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                           placeholder="The Art of building AI Products"
                           className="w-full bg-[#fafafa] border border-border/40 p-8 min-h-[140px] resize-none font-serif italic text-3xl leading-tight focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                         />
                       </div>

                       <div className="space-y-4">
                         <h4 className="text-xl font-bold text-text">Heading Accent</h4>
                         <input 
                           type="text"
                           value={heroForm.headlineAccent}
                           onChange={(e) => setHeroForm({ ...heroForm, headlineAccent: e.target.value })}
                           placeholder="-Agentic AI"
                           className="w-full bg-[#fafafa] border border-border/40 p-6 font-serif italic text-xl focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                         />
                       </div>

                       <div className="space-y-4">
                         <h4 className="text-xl font-bold text-text">Summary Paragraph</h4>
                         <textarea 
                           value={heroForm.subtitle}
                           onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                           className="w-full bg-[#fafafa] border border-border/40 p-8 min-h-[160px] resize-none text-base leading-relaxed opacity-80 focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                         />
                       </div>

                       <div className="space-y-4">
                         <h4 className="text-xl font-bold text-text">Promotional Video URL (YouTube Embed)</h4>
                         <input 
                           type="text"
                           value={heroForm.videoUrl}
                           onChange={(e) => setHeroForm({ ...heroForm, videoUrl: e.target.value })}
                           placeholder="https://www.youtube.com/embed/..."
                           className="w-full bg-[#fafafa] border border-border/40 p-6 font-mono text-sm text-accent focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                         />
                         <p className="text-[10px] text-muted-foreground ml-2 opacity-50">Enter a YouTube embed URL to display alongside the hero text.</p>
                       </div>

                       <button 
                         onClick={() => handleSave('hero')}
                         disabled={isSaving}
                         className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                       >
                         {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                         Save Hero Changes
                       </button>
                     </div>
                   )}

                   {activeTab === 'visibility' && (
                      <div className="space-y-10 animate-fadeInUp">
                         <div className="border border-border/40 bg-white rounded-2xl divide-y divide-border/40 overflow-hidden shadow-sm">
                            {Object.entries(visibilityForm).map(([key, value]) => (
                               <div key={key} className="flex items-center justify-between p-8 hover:bg-[#fafafa] transition-colors group">
                                  <div className="flex items-center gap-6">
                                     <div className={cn(
                                       "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500",
                                       value ? "bg-accent/5 border-accent/20 text-accent" : "bg-off/40 border-border/40 text-muted/40"
                                     )}>
                                        {value ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                     </div>
                                     <div>
                                        <span className="text-[14px] font-semibold text-text block mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="text-[9px] font-bold text-muted/40 uppercase tracking-widest">{value ? 'Visible' : 'Hidden'}</span>
                                     </div>
                                  </div>
                                  <button 
                                    onClick={() => setVisibilityForm({ ...visibilityForm, [key as any]: !value } as any)}
                                    className={cn(
                                      "w-11 h-6 rounded-full relative transition-all duration-500 p-1 border",
                                      value ? "bg-accent border-accent" : "bg-border/20 border-border/40"
                                    )}
                                  >
                                     <motion.div 
                                       animate={{ x: value ? 20 : 0 }}
                                       className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" 
                                     />
                                   </button>
                               </div>
                            ))}
                         </div>
                         <button 
                           onClick={() => handleSave('visibility')}
                           className="w-full py-5 bg-accent text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-accent2 transition-all shadow-xl shadow-accent/20 active:scale-[0.98] rounded-xl"
                         >
                           <Save className="w-4 h-4" />
                           Synchronize Visibility
                         </button>
                      </div>
                   )}

                   {activeTab === 'stats' && (
                     <div className="space-y-10 animate-fadeInUp">
                       <div className="border border-border/40 bg-white rounded-2xl divide-y divide-border/40 overflow-hidden shadow-sm">
                         {statsForm.map((stat, index) => (
                           <div key={stat.id} className="p-8 space-y-8 hover:bg-[#fafafa] transition-colors">
                              <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Metric {index + 1}</span>
                                 <div className="w-8 h-8 rounded-lg bg-off flex items-center justify-center border border-border/40">
                                   <BarChart3 className="w-3.5 h-3.5 text-accent" />
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                 <div className="space-y-2">
                                   <label className="text-[9px] font-bold text-muted uppercase tracking-widest">Statistical Value</label>
                                   <input 
                                     type="text"
                                     value={stat.value}
                                     onChange={(e) => {
                                       const newStats = [...statsForm];
                                       newStats[index].value = e.target.value;
                                       setStatsForm(newStats);
                                     }}
                                     className="w-full bg-[#fafafa]/50 border border-border/40 p-5 font-mono text-xl focus:bg-white transition-all outline-none rounded-lg"
                                   />
                                 </div>
                                 <div className="space-y-2">
                                   <label className="text-[9px] font-bold text-muted uppercase tracking-widest">Label Reference</label>
                                   <input 
                                     type="text"
                                     value={stat.label}
                                     onChange={(e) => {
                                       const newStats = [...statsForm];
                                       newStats[index].label = e.target.value;
                                       setStatsForm(newStats);
                                     }}
                                     className="w-full bg-[#fafafa]/50 border border-border/40 p-5 font-serif italic text-lg focus:bg-white transition-all outline-none rounded-lg"
                                   />
                                 </div>
                              </div>
                           </div>
                         ))}
                       </div>
                       <button 
                         onClick={() => handleSave('stats')}
                         disabled={isSaving}
                         className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                       >
                         {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                         Save Statistics
                       </button>
                     </div>
                   )}

                   {activeTab === 'showcase' && (
                     <div className="space-y-10 animate-fadeInUp">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold text-text">Book Showcase Items</h4>
                            <button 
                              onClick={() => setPillarsForm([...pillarsForm, { id: Math.random().toString(), iconName: 'Database', title: 'New Pillar', description: 'Description here', prompt: 'Prompt here', color: 'text-blue-500' }])}
                              className="p-2 bg-accent/5 text-accent rounded-lg border border-accent/20 hover:bg-accent/10 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-6">
                           {pillarsForm.map((pillar, index) => (
                             <div key={pillar.id} className="p-8 border border-border/40 rounded-2xl bg-white shadow-sm space-y-8 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => setPillarsForm(pillarsForm.filter(p => p.id !== pillar.id))}
                                     className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                   <div className="space-y-3">
                                      <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Icon Type</label>
                                      <select 
                                        value={pillar.iconName}
                                        onChange={(e) => {
                                          const newPillars = [...pillarsForm];
                                          newPillars[index].iconName = e.target.value as any;
                                          setPillarsForm(newPillars);
                                        }}
                                        className="w-full bg-[#fafafa] border border-border/40 p-4 rounded-xl text-sm focus:bg-white outline-none"
                                      >
                                         {Object.keys(pillarIcons).map(icon => (
                                           <option key={icon} value={icon}>{icon}</option>
                                         ))}
                                      </select>
                                   </div>
                                   <div className="space-y-3">
                                      <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Color Theme</label>
                                      <input 
                                        type="text"
                                        value={pillar.color}
                                        onChange={(e) => {
                                          const newPillars = [...pillarsForm];
                                          newPillars[index].color = e.target.value;
                                          setPillarsForm(newPillars);
                                        }}
                                        placeholder="text-blue-500"
                                        className="w-full bg-[#fafafa] border border-border/40 p-4 rounded-xl text-sm focus:bg-white outline-none"
                                      />
                                   </div>
                                </div>

                                <div className="space-y-3">
                                   <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Title</label>
                                   <input 
                                     type="text"
                                     value={pillar.title}
                                     onChange={(e) => {
                                       const newPillars = [...pillarsForm];
                                       newPillars[index].title = e.target.value;
                                       setPillarsForm(newPillars);
                                     }}
                                     className="w-full bg-[#fafafa] border border-border/40 p-4 rounded-xl text-base font-bold focus:bg-white outline-none"
                                   />
                                </div>

                                <div className="space-y-3">
                                   <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Description</label>
                                   <textarea 
                                     value={pillar.description}
                                     onChange={(e) => {
                                       const newPillars = [...pillarsForm];
                                       newPillars[index].description = e.target.value;
                                       setPillarsForm(newPillars);
                                     }}
                                     className="w-full bg-[#fafafa] border border-border/40 p-4 rounded-xl text-sm min-h-[80px] focus:bg-white outline-none"
                                   />
                                </div>

                                <div className="space-y-3">
                                   <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Terminal Prompt</label>
                                   <input 
                                     type="text"
                                     value={pillar.prompt}
                                     onChange={(e) => {
                                       const newPillars = [...pillarsForm];
                                       newPillars[index].prompt = e.target.value;
                                       setPillarsForm(newPillars);
                                     }}
                                     className="w-full bg-[#fafafa] border border-border/40 p-4 rounded-xl text-xs font-mono text-accent focus:bg-white outline-none"
                                   />
                                </div>
                             </div>
                           ))}
                        </div>

                        <button 
                          onClick={() => handleSave('pillars')}
                          disabled={isSaving}
                          className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                        >
                          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Showcase Data
                        </button>
                     </div>
                   )}

                   {activeTab === 'perks' && (
                     <div className="space-y-10 animate-fadeInUp">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold text-text">Community Perks</h4>
                            <button 
                              onClick={() => setPerksForm([...perksForm, { id: Math.random().toString(), iconName: 'Zap', title: 'New Perk', label: 'LABEL', description: 'Description' }])}
                              className="p-2 bg-accent/5 text-accent rounded-lg border border-accent/20 hover:bg-accent/10 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-6">
                           {perksForm.map((perk, index) => (
                             <div key={perk.id} className="p-8 border border-border/40 rounded-2xl bg-white shadow-sm space-y-6 group relative">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => setPerksForm(perksForm.filter(p => p.id !== perk.id))}
                                     className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                   <div className="space-y-3">
                                      <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Icon</label>
                                      <select 
                                        value={perk.iconName}
                                        onChange={(e) => {
                                          const newPerks = [...perksForm];
                                          newPerks[index].iconName = e.target.value as any;
                                          setPerksForm(newPerks);
                                        }}
                                        className="w-full bg-[#fafafa] border border-border/40 p-4 rounded-xl text-sm"
                                      >
                                         {Object.keys(perkIcons).map(icon => (
                                           <option key={icon} value={icon}>{icon}</option>
                                         ))}
                                      </select>
                                   </div>
                                   <div className="space-y-3">
                                      <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Accent Label</label>
                                      <input 
                                        type="text"
                                        value={perk.label}
                                        onChange={(e) => {
                                          const newPerks = [...perksForm];
                                          newPerks[index].label = e.target.value;
                                          setPerksForm(newPerks);
                                        }}
                                        className="w-full bg-[#fafafa] border border-border/40 p-4 rounded-xl text-[10px] font-black tracking-widest uppercase text-accent"
                                      />
                                   </div>
                                </div>

                                <div className="space-y-3">
                                   <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Headline</label>
                                   <input 
                                     type="text"
                                     value={perk.title}
                                     onChange={(e) => {
                                       const newPerks = [...perksForm];
                                       newPerks[index].title = e.target.value;
                                       setPerksForm(newPerks);
                                     }}
                                     className="w-full bg-[#fafafa] border border-border/40 p-4 rounded-xl text-lg font-bold"
                                   />
                                </div>

                                <div className="space-y-3">
                                   <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Description</label>
                                   <textarea 
                                     value={perk.description}
                                     onChange={(e) => {
                                       const newPerks = [...perksForm];
                                       newPerks[index].description = e.target.value;
                                       setPerksForm(newPerks);
                                     }}
                                     className="w-full bg-[#fafafa] border border-border/40 p-4 rounded-xl text-sm min-h-[80px]"
                                   />
                                </div>
                             </div>
                           ))}
                        </div>

                        <button 
                          onClick={() => handleSave('perks')}
                          disabled={isSaving}
                          className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                        >
                          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Community Perks
                        </button>
                     </div>
                   )}
                 </motion.div>
               </AnimatePresence>
               </div>
            </div>
         </div>
       </motion.div>

       {/* Main Studio View */}
       <AnimatePresence>
          {isPreviewVisible && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="flex-1 overflow-hidden flex flex-col relative bg-white"
             >
                <div className="absolute inset-0 bg-off/5 pointer-events-none" />
                
                <div className="flex-1 relative group">
                   <div className="h-full w-full overflow-hidden relative z-10">
                      <LivePreview 
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        isSidebarCollapsed={isSidebarCollapsed}
                      />
                   </div>
                </div>
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};
