import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { LivePreview } from './LivePreview';
import { 
  Globe, 
  Settings2, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Search,
  Navigation,
  FileCode,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { OgImageUpload } from './OgImageUpload';

export const SettingsManager: React.FC = () => {
  const { data, updateSettings, updateAppearance, setPreview, isPreviewVisible } = useWebsiteData();
  const [activeTab, setActiveTab] = useState<
    'seo' | 'identity' | 'navigation' | 'catalog' | 'routes' | 'advanced'
  >('seo');
  const [form, setForm] = useState(data.settings);
  const [appearanceForm, setAppearanceForm] = useState(data.appearance);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync with live preview (specifically for navigation changes)
  useEffect(() => {
    setPreview({ 
      settings: form,
      appearance: appearanceForm
    });
    return () => setPreview(null);
  }, [form, appearanceForm]);

  const handleSave = async (type: 'settings' | 'appearance') => {
    setIsSaving(true);
    try {
      if (type === 'settings') await updateSettings(form);
      if (type === 'appearance') await updateAppearance(appearanceForm);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSocialLink = (id: string, href: string) => {
    setForm({
      ...form,
      navigation: {
        ...form.navigation,
        socials: form.navigation.socials.map(s => s.id === id ? { ...s, href } : s)
      }
    });
  };

  const tabs = [
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'routes', label: 'Route SEO', icon: Globe },
    { id: 'catalog', label: 'Catalog', icon: Layout },
    { id: 'identity', label: 'Identity', icon: Globe },
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'advanced', label: 'Advanced', icon: FileCode },
  ];

  const patchCatalog = (
    page: 'blog' | 'events',
    field: 'eyebrow' | 'title' | 'titleAccent' | 'lede',
    value: string,
  ) => {
    setForm({
      ...form,
      catalogPages: {
        ...form.catalogPages,
        [page]: { ...form.catalogPages?.[page], [field]: value },
      },
    });
  };

  const patchRouteSeo = (
    path: '/' | '/blog' | '/events' | '/community',
    field: 'title' | 'description',
    value: string,
  ) => {
    setForm({
      ...form,
      routeSeo: {
        ...form.routeSeo,
        [path]: { ...form.routeSeo?.[path], [field]: value },
      },
    });
  };

  const patchSection = (
    key: 'community' | 'finalCta' | 'whoWeAre',
    field: string,
    value: string,
  ) => {
    setForm({
      ...form,
      sections: {
        ...form.sections,
        [key]: { ...form.sections?.[key], [field]: value },
      },
    });
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-white relative font-sans text-text">
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
          isPreviewVisible ? "border-r border-border/40" : "w-full"
        )}
      >
        <div className={cn(
          "flex flex-col h-full bg-white",
          !isPreviewVisible ? "max-w-4xl mx-auto w-full border-x border-border/40" : "w-[520px]"
        )}>
          <div className="p-5 border-b border-border/40">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-off flex items-center justify-center border border-border/40">
                   <Settings2 className="w-5 h-5 text-accent" />
                </div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Global Configuration</span>
             </div>
             <h3 className="text-4xl font-serif italic text-text mb-4">Settings</h3>
             <p className="text-text2 text-base leading-relaxed opacity-60">Architectural controls for SEO, site-wide navigation, and custom scripts.</p>
          </div>

          <div className="flex-1 overflow-y-auto">
             {/* Tab Navigation */}
             <div className="flex border-b border-border/40 w-full sticky top-0 bg-white z-20">
                {tabs.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={cn(
                       "flex-1 flex flex-col items-center gap-2 py-4 transition-all duration-300 relative",
                       activeTab === tab.id 
                       ? "text-accent bg-accent/[0.02]" 
                       : "text-muted hover:text-text hover:bg-off/30"
                     )}
                  >
                    <tab.icon className={cn("w-4 h-4 transition-transform", activeTab === tab.id ? "scale-110" : "opacity-40")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                    
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTabSettings"
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
                 >
                   {activeTab === 'seo' && (
                     <div className="space-y-10 animate-fadeInUp">
                        <div className="space-y-4">
                           <h4 className="text-xl font-bold text-text">Search Engine Title</h4>
                           <input 
                             type="text"
                             value={form.seo.title}
                             onChange={e => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })}
                             className="w-full bg-[#fafafa] border border-border/40 p-5 font-serif italic text-lg focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                             placeholder="Superhumanly AI | The Agentic Playbook"
                           />
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-xl font-bold text-text">Meta Description</h4>
                           <textarea 
                             rows={4}
                             value={form.seo.description}
                             onChange={e => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
                             className="w-full bg-[#fafafa] border border-border/40 p-6 text-sm leading-relaxed italic resize-none focus:bg-white transition-all outline-none rounded-xl shadow-sm"
                             placeholder="A deep-dive into the future of autonomous agent architecture..."
                           />
                        </div>
                                                <div className="space-y-4">
                           <h4 className="text-xl font-bold text-text">Default Open Graph Image</h4>
                           <input type="text" value={form.seo.ogImage || ''} onChange={e => setForm({ ...form, seo: { ...form.seo, ogImage: e.target.value } })} placeholder="https://... or upload below" aria-describedby="settings-og-help" className="w-full bg-[#fafafa] border border-border/40 p-4 font-mono text-[10px] text-accent focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm" />
                           <OgImageUpload
                             value={form.seo.ogImage || ''}
                             onChange={(url) => setForm({ ...form, seo: { ...form.seo, ogImage: url } })}
                             getToken={() => localStorage.getItem('adminToken') || ''}
                           />
                           <p id="settings-og-help" className="text-[11px] text-muted leading-relaxed">
                             Used when a page has no specific share image. Upload resizes to 1200×630 or paste a full HTTPS URL.
                           </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                           <div className="space-y-2">
                             <h4 className="text-sm font-bold text-text">og:site_name</h4>
                             <input
                               type="text"
                               value={form.seo.ogSiteName || ''}
                               onChange={(e) =>
                                 setForm({ ...form, seo: { ...form.seo, ogSiteName: e.target.value } })
                               }
                               className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                             />
                           </div>
                           <div className="space-y-2">
                             <h4 className="text-sm font-bold text-text">og:locale</h4>
                             <input
                               type="text"
                               value={form.seo.ogLocale || 'en_US'}
                               onChange={(e) =>
                                 setForm({ ...form, seo: { ...form.seo, ogLocale: e.target.value } })
                               }
                               className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                             />
                           </div>
                           <div className="space-y-2">
                             <h4 className="text-sm font-bold text-text">twitter:site</h4>
                             <input
                               type="text"
                               value={form.seo.twitterSite || ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   seo: { ...form.seo, twitterSite: e.target.value },
                                 })
                               }
                               placeholder="@handle"
                               className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                             />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-xl font-bold text-text">Google Search Console Verification</h4>
                           <input type="text" value={form.seo.googleSiteVerification || ''} onChange={e => setForm({ ...form, seo: { ...form.seo, googleSiteVerification: e.target.value } })} placeholder="google-site-verification token" aria-describedby="settings-gsc-help" className="w-full bg-[#fafafa] border border-border/40 p-5 font-mono text-xs focus:bg-white transition-all outline-none rounded-xl shadow-sm" />
                           <p id="settings-gsc-help" className="text-[11px] text-muted leading-relaxed">
                             Adds a verification meta tag on every public page via SeoHead. Paste only the content value from Search Console (not the full &lt;meta&gt; tag). After saving, run <code className="text-accent">npm run build</code> with the API on port 3001 so prerender bakes the tag into <code className="text-accent">dist/</code>. Confirm in View Source on <code className="text-accent">/</code> for <code className="text-accent">meta name=&quot;google-site-verification&quot;</code>.
                           </p>
                        </div>
                        <div className="space-y-4 pt-6 border-t border-border/40">
                           <h4 className="text-xl font-bold text-text">Book metadata (structured data)</h4>
                           <p className="text-[11px] text-muted leading-relaxed">
                             Used for Google Book rich results on the homepage. Leave blank to omit Book schema.
                           </p>
                           <input type="text" value={form.book?.title || ''} onChange={(e) => setForm({ ...form, book: { ...form.book, title: e.target.value } })} placeholder="Book title" className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm" />
                           <input type="text" value={form.book?.tagline || ''} onChange={(e) => setForm({ ...form, book: { ...form.book, tagline: e.target.value } })} placeholder="Book tagline (short hook)" className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm" />
                           <textarea value={form.book?.abstract || ''} onChange={(e) => setForm({ ...form, book: { ...form.book, abstract: e.target.value } })} placeholder="Book abstract (use blank lines between paragraphs)" rows={5} className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm leading-relaxed focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm resize-y min-h-[120px]" />
                           <input type="text" value={form.book?.authorName || ''} onChange={(e) => setForm({ ...form, book: { ...form.book, authorName: e.target.value } })} placeholder="Author name" className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm" />
                           <input type="text" value={form.book?.isbn || ''} onChange={(e) => setForm({ ...form, book: { ...form.book, isbn: e.target.value } })} placeholder="ISBN-13" className="w-full bg-[#fafafa] border border-border/40 p-4 font-mono text-xs focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm" />
                           <input type="text" value={form.book?.coverImageUrl || ''} onChange={(e) => setForm({ ...form, book: { ...form.book, coverImageUrl: e.target.value } })} placeholder="Cover image URL (https://)" className="w-full bg-[#fafafa] border border-border/40 p-4 font-mono text-[10px] text-accent focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm" />
                           <input type="text" value={form.book?.publisherName || ''} onChange={(e) => setForm({ ...form, book: { ...form.book, publisherName: e.target.value } })} placeholder="Publisher name" className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm" />
                        </div>
                        <button 
                          onClick={() => handleSave('settings')}
                          className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                        >
                           {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                           Save SEO Strategy
                        </button>
                     </div>
                   )}

                   {activeTab === 'routes' && (
                     <div className="space-y-8 animate-fadeInUp">
                       {(['/', '/blog', '/events', '/community'] as const).map((path) => (
                         <div key={path} className="p-6 border border-border/40 rounded-2xl space-y-4">
                           <h4 className="font-bold text-text">{path}</h4>
                           <input
                             type="text"
                             value={form.routeSeo?.[path]?.title || ''}
                             onChange={(e) => patchRouteSeo(path, 'title', e.target.value)}
                             placeholder="Page title override"
                             className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                           />
                           <textarea
                             rows={2}
                             value={form.routeSeo?.[path]?.description || ''}
                             onChange={(e) => patchRouteSeo(path, 'description', e.target.value)}
                             placeholder="Meta description override"
                             className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl resize-none"
                           />
                         </div>
                       ))}
                       <button
                         onClick={() => handleSave('settings')}
                         className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 rounded-xl"
                       >
                         {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                         Save Route SEO
                       </button>
                     </div>
                   )}

                   {activeTab === 'catalog' && (
                     <div className="space-y-10 animate-fadeInUp">
                       {(['blog', 'events'] as const).map((page) => (
                         <div key={page} className="p-6 border border-border/40 rounded-2xl space-y-4">
                           <h4 className="text-lg font-bold text-text capitalize">{page} catalog hero</h4>
                           <input
                             type="text"
                             value={form.catalogPages?.[page]?.eyebrow || ''}
                             onChange={(e) => patchCatalog(page, 'eyebrow', e.target.value)}
                             placeholder="Eyebrow"
                             className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                           />
                           <input
                             type="text"
                             value={form.catalogPages?.[page]?.title || ''}
                             onChange={(e) => patchCatalog(page, 'title', e.target.value)}
                             placeholder="Title (before accent)"
                             className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                           />
                           <input
                             type="text"
                             value={form.catalogPages?.[page]?.titleAccent || ''}
                             onChange={(e) => patchCatalog(page, 'titleAccent', e.target.value)}
                             placeholder="Title accent (italic)"
                             className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                           />
                           <textarea
                             rows={3}
                             value={form.catalogPages?.[page]?.lede || ''}
                             onChange={(e) => patchCatalog(page, 'lede', e.target.value)}
                             placeholder="Lede paragraph"
                             className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl resize-none"
                           />
                         </div>
                       ))}
                       <div className="p-6 border border-border/40 rounded-2xl space-y-4">
                         <h4 className="text-lg font-bold text-text">Landing sections (copy)</h4>
                         {(['whoWeAre', 'community', 'finalCta'] as const).map((key) => (
                           <div key={key} className="space-y-3 pt-4 border-t border-border/30 first:border-0 first:pt-0">
                             <p className="text-xs font-bold uppercase tracking-widest text-muted">{key}</p>
                             <input
                               type="text"
                               value={form.sections?.[key]?.eyebrow || ''}
                               onChange={(e) => patchSection(key, 'eyebrow', e.target.value)}
                               placeholder="Eyebrow"
                               className="w-full bg-[#fafafa] border border-border/40 p-3 text-sm rounded-xl"
                             />
                             <input
                               type="text"
                               value={form.sections?.[key]?.title || ''}
                               onChange={(e) => patchSection(key, 'title', e.target.value)}
                               placeholder="Title"
                               className="w-full bg-[#fafafa] border border-border/40 p-3 text-sm rounded-xl"
                             />
                             <input
                               type="text"
                               value={form.sections?.[key]?.titleAccent || ''}
                               onChange={(e) => patchSection(key, 'titleAccent', e.target.value)}
                               placeholder="Title accent"
                               className="w-full bg-[#fafafa] border border-border/40 p-3 text-sm rounded-xl"
                             />
                             <textarea
                               rows={2}
                               value={form.sections?.[key]?.lede || ''}
                               onChange={(e) => patchSection(key, 'lede', e.target.value)}
                               placeholder="Lede"
                               className="w-full bg-[#fafafa] border border-border/40 p-3 text-sm rounded-xl resize-none"
                             />
                           </div>
                         ))}
                       </div>
                       <button
                         onClick={() => handleSave('settings')}
                         className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 rounded-xl"
                       >
                         {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                         Save Catalog & Sections
                       </button>
                     </div>
                   )}

                   {activeTab === 'identity' && (
                     <div className="space-y-10 animate-fadeInUp">
                        <div className="space-y-4">
                           <h4 className="text-xl font-bold text-text">Brand Name</h4>
                           <input 
                             type="text"
                             value={appearanceForm.brandName}
                             onChange={e => setAppearanceForm({ ...appearanceForm, brandName: e.target.value })}
                             className="w-full bg-[#fafafa] border border-border/40 p-5 font-serif italic text-2xl focus:bg-white transition-all outline-none rounded-xl shadow-sm"
                           />
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-xl font-bold text-text">Logo Text (Initial)</h4>
                           <input 
                             type="text"
                             maxLength={2}
                             value={appearanceForm.brandLogoText}
                             onChange={e => setAppearanceForm({ ...appearanceForm, brandLogoText: e.target.value })}
                             className="w-24 bg-[#fafafa] border border-border/40 p-5 text-center font-bold text-2xl focus:bg-white transition-all outline-none rounded-xl shadow-sm"
                           />
                        </div>
                        <button 
                          onClick={() => handleSave('appearance')}
                          className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                        >
                           {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                           Update Visual Identity
                        </button>
                     </div>
                   )}

                   {activeTab === 'navigation' && (
                     <div className="space-y-12 animate-fadeInUp">
                        <div className="p-6 border border-border/40 rounded-2xl bg-[#fafafa] space-y-6">
                           <div>
                              <h4 className="text-xl font-bold text-text">Header Primary CTA</h4>
                              <p className="text-[11px] text-muted leading-relaxed mt-2">
                                 Shown as the pill button in the site header on desktop and in the mobile menu.
                              </p>
                           </div>
                           <div className="grid grid-cols-1 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-muted/40 uppercase tracking-widest">Button label</label>
                                 <input
                                   type="text"
                                   value={form.navigation.primaryCta?.label ?? 'Join Now'}
                                   onChange={(e) => setForm({
                                     ...form,
                                     navigation: {
                                       ...form.navigation,
                                       primaryCta: {
                                         ...form.navigation.primaryCta,
                                         label: e.target.value,
                                         href: form.navigation.primaryCta?.href ?? '/#final-cta',
                                       },
                                     },
                                   })}
                                   className="w-full bg-white border border-border/40 p-4 font-bold text-sm focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-muted/40 uppercase tracking-widest">Button URL</label>
                                 <input
                                   type="text"
                                   value={form.navigation.primaryCta?.href ?? '/#final-cta'}
                                   onChange={(e) => setForm({
                                     ...form,
                                     navigation: {
                                       ...form.navigation,
                                       primaryCta: {
                                         ...form.navigation.primaryCta,
                                         label: form.navigation.primaryCta?.label ?? 'Join Now',
                                         href: e.target.value,
                                       },
                                     },
                                   })}
                                   placeholder="/#final-cta"
                                   className="w-full bg-white border border-border/40 p-4 font-mono text-[11px] text-accent focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-10">
                           <div className="flex items-center justify-between">
                              <h4 className="text-xl font-bold text-text">Universal Header Links</h4>
                              <button 
                                onClick={() => setForm({
                                  ...form,
                                  navigation: {
                                    ...form.navigation,
                                    links: [...form.navigation.links, { id: Date.now().toString(), name: 'New Link', href: '#' }]
                                  }
                                })}
                                className="p-2 bg-accent/5 text-accent border border-accent/20 rounded-lg hover:bg-accent/10 transition-all"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                           </div>

                           <div className="space-y-4">
                              {form.navigation.links.map((link, idx) => (
                                <div key={link.id} className="p-6 border border-border/40 rounded-2xl bg-white hover:bg-[#fafafa] transition-all flex items-center gap-6 group">
                                   <div className="flex-1 grid grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                         <label className="text-[9px] font-bold text-muted/40 uppercase tracking-widest">Label</label>
                                         <input 
                                           type="text"
                                           value={link.name}
                                           onChange={e => {
                                             const newLinks = [...form.navigation.links];
                                             newLinks[idx].name = e.target.value;
                                             setForm({ ...form, navigation: { ...form.navigation, links: newLinks } });
                                           }}
                                           className="w-full bg-transparent font-bold text-sm outline-none border-b border-transparent focus:border-accent"
                                         />
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-[9px] font-bold text-muted/40 uppercase tracking-widest">URL PATH</label>
                                         <input 
                                           type="text"
                                           value={link.href}
                                           onChange={e => {
                                             const newLinks = [...form.navigation.links];
                                             newLinks[idx].href = e.target.value;
                                             setForm({ ...form, navigation: { ...form.navigation, links: newLinks } });
                                           }}
                                           className="w-full bg-transparent font-mono text-[11px] text-accent outline-none border-b border-transparent focus:border-accent"
                                         />
                                      </div>
                                   </div>
                                   <button 
                                     onClick={() => setForm({
                                       ...form,
                                       navigation: {
                                         ...form.navigation,
                                         links: form.navigation.links.filter(l => l.id !== link.id)
                                       }
                                     })}
                                     className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                              ))}
                           </div>
                        </div>

                         <div className="pt-12 border-t border-border/20 space-y-10">
                            <div className="flex items-center justify-between">
                               <h4 className="text-xl font-bold text-text">Global Footer Links</h4>
                               <button 
                                 onClick={() => setForm({
                                   ...form,
                                   navigation: {
                                     ...form.navigation,
                                     footerLinks: [...(form.navigation.footerLinks || []), { id: Date.now().toString(), name: 'New Link', href: '#' }]
                                   }
                                 })}
                                 className="p-2 bg-accent/5 text-accent border border-accent/20 rounded-lg hover:bg-accent/10 transition-all"
                               >
                                 <Plus className="w-4 h-4" />
                               </button>
                            </div>

                            <div className="space-y-4">
                               {(form.navigation.footerLinks || []).map((link, idx) => (
                                 <div key={link.id} className="p-6 border border-border/40 rounded-2xl bg-white hover:bg-[#fafafa] transition-all flex items-center gap-6 group">
                                    <div className="flex-1 grid grid-cols-2 gap-6">
                                       <div className="space-y-2">
                                          <label className="text-[9px] font-bold text-muted/40 uppercase tracking-widest">Label</label>
                                          <input 
                                            type="text"
                                            value={link.name}
                                            onChange={e => {
                                              const newLinks = [...(form.navigation.footerLinks || [])];
                                              newLinks[idx].name = e.target.value;
                                              setForm({ ...form, navigation: { ...form.navigation, footerLinks: newLinks } });
                                            }}
                                            className="w-full bg-transparent font-bold text-sm outline-none border-b border-transparent focus:border-accent"
                                          />
                                       </div>
                                       <div className="space-y-2">
                                          <label className="text-[9px] font-bold text-muted/40 uppercase tracking-widest">URL PATH</label>
                                          <input 
                                            type="text"
                                            value={link.href}
                                            onChange={e => {
                                              const newLinks = [...(form.navigation.footerLinks || [])];
                                              newLinks[idx].href = e.target.value;
                                              setForm({ ...form, navigation: { ...form.navigation, footerLinks: newLinks } });
                                            }}
                                            className="w-full bg-transparent font-mono text-[11px] text-accent outline-none border-b border-transparent focus:border-accent"
                                          />
                                       </div>
                                    </div>
                                    <button 
                                      onClick={() => setForm({
                                        ...form,
                                        navigation: {
                                          ...form.navigation,
                                          footerLinks: (form.navigation.footerLinks || []).filter(l => l.id !== link.id)
                                        }
                                      })}
                                      className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                               ))}
                            </div>
                         </div>

                        <div className="pt-12 border-t border-border/20">
                           <h4 className="text-xl font-bold text-text mb-6">Social Networks</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {form.navigation.socials.map((social) => (
                                <div key={social.id} className="space-y-2">
                                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider">{social.platform}</label>
                                  <input 
                                    type="text"
                                    value={social.href}
                                    onChange={e => updateSocialLink(social.id, e.target.value)}
                                    className="w-full bg-off border border-border/40 p-4 rounded-xl text-xs font-mono focus:bg-white outline-none"
                                  />
                                </div>
                              ))}
                           </div>
                        </div>

                        <button 
                          onClick={() => handleSave('settings')}
                          className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                        >
                           {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                           Sync Navigation Architecture
                        </button>
                     </div>
                   )}

                   {activeTab === 'advanced' && (
                     <div className="space-y-10 animate-fadeInUp">
                        <div className="space-y-4">
                           <h4 className="text-xl font-bold text-text">Custom CSS Injection</h4>
                           <textarea 
                             rows={8}
                             value={form.customCss}
                             onChange={e => setForm({ ...form, customCss: e.target.value })}
                             className="w-full bg-[#1E1E1E] text-emerald-400 p-8 font-mono text-xs leading-relaxed min-h-[240px] border-none outline-none rounded-2xl shadow-xl"
                             placeholder="/* Global Overrides */"
                           />
                        </div>
                        <div className="grid grid-cols-1 gap-8">
                           <div className="space-y-4">
                              <h4 className="text-xl font-bold text-text">Header Scripts</h4>
                              <textarea 
                                rows={3}
                                value={form.scripts.header}
                                onChange={e => setForm({ ...form, scripts: { ...form.scripts, header: e.target.value } })}
                                className="w-full bg-[#fafafa] border border-border/40 p-4 font-mono text-[10px] text-muted focus:bg-white outline-none rounded-xl"
                              />
                           </div>
                           <div className="space-y-4">
                              <h4 className="text-xl font-bold text-text">Footer Scripts</h4>
                              <textarea 
                                rows={3}
                                value={form.scripts.footer}
                                onChange={e => setForm({ ...form, scripts: { ...form.scripts, footer: e.target.value } })}
                                className="w-full bg-[#fafafa] border border-border/40 p-4 font-mono text-[10px] text-muted focus:bg-white outline-none rounded-xl"
                              />
                           </div>
                        </div>
                        <button 
                          onClick={() => handleSave('settings')}
                          className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                        >
                           {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                           Inject Code Fragments
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
