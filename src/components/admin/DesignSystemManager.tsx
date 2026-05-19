import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { LivePreview } from './LivePreview';
import { 
  Palette, 
  Type, 
  Box, 
  Check,
  Layers,
  Save,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export const DesignSystemManager: React.FC = () => {
  const { data, updateAppearance, setPreview, isPreviewVisible } = useWebsiteData();
  const [activePanel, setActivePanel] = useState<'colors' | 'typography' | 'tokens' | 'branding'>('colors');
  const [form, setForm] = useState(data.appearance);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync with live preview
  useEffect(() => {
    setPreview({ appearance: form });
    
    // Cleanup preview on unmount
    return () => setPreview(null);
  }, [form]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAppearance(form);
    } finally {
      setIsSaving(false);
    }
  };

  const panels = [
    { id: 'colors', label: 'Palette', icon: Palette },
    { id: 'typography', label: 'Typeset', icon: Type },
    { id: 'tokens', label: 'Themes', icon: Box },
    { id: 'branding', label: 'Assets', icon: Layers },
  ];

  const presets = ['#003E99', '#0052cc', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#111111', '#555555'];

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
                   <Palette className="w-5 h-5 text-accent" />
                </div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Design System</span>
             </div>
             <h3 className="text-4xl font-serif italic text-text mb-4">Style Editor</h3>
             <p className="text-text2 text-base leading-relaxed opacity-60">Customize your site's global colors, fonts, and core theme elements.</p>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Tab Selector */}
              <div className="flex border-b border-border/40 w-full sticky top-0 bg-white z-20">
                {panels.map((p) => (
                  <button
                     key={p.id}
                     onClick={() => setActivePanel(p.id as any)}
                     className={cn(
                       "flex-1 flex flex-col items-center gap-2.5 py-5 transition-all duration-500 relative",
                       activePanel === p.id 
                       ? "text-accent bg-accent/[0.02]" 
                       : "text-muted hover:text-text hover:bg-off/30"
                     )}
                  >
                    <p.icon className={cn("w-4 h-4 transition-transform duration-500", activePanel === p.id ? "scale-110" : "opacity-40")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{p.label}</span>
                    
                    {activePanel === p.id && (
                      <motion.div 
                        layoutId="activeDesignTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePanel}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-12"
                  >
                    {activePanel === 'colors' && (
                        <div className="space-y-12 animate-fadeInUp">
                          <section className="space-y-8">
                              <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Primary Surface</h4>
                              
                              <div className="grid grid-cols-4 gap-4">
                                {presets.map((color) => (
                                    <button
                                      key={color}
                                      onClick={() => setForm({ ...form, primaryColor: color })}
                                      className={cn(
                                        "w-full aspect-square rounded-2xl transition-all relative border border-border/20 shadow-sm",
                                        form.primaryColor === color ? "ring-2 ring-accent ring-offset-4 scale-105" : "hover:scale-105"
                                      )}
                                      style={{ backgroundColor: color }}
                                    >
                                      {form.primaryColor === color && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <Check className="w-5 h-5 text-white" />
                                        </div>
                                      )}
                                    </button>
                                ))}
                              </div>
                          </section>
                        </div>
                    )}

                    {activePanel === 'typography' && (
                        <div className="space-y-12 animate-fadeInUp">
                          <section className="space-y-10">
                              <div className="space-y-6">
                                 <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Heading Font</h4>
                                 <div className="space-y-2 border border-border/40 bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-border/40">
                                    {['Instrument Serif', 'Cormorant', 'Georgia'].map((font) => (
                                       <button 
                                         key={font}
                                         onClick={() => setForm({ ...form, typography: { ...form.typography, headingFont: 'serif' }})}
                                         className={cn(
                                           "w-full p-10 text-left transition-all group",
                                           form.typography.headingFont === 'serif' ? "bg-accent/[0.02]" : "hover:bg-off/30"
                                         )}
                                       >
                                          <div className="flex justify-between items-center mb-4">
                                            <span className="text-[9px] font-bold text-muted/40 uppercase tracking-widest">{font}</span>
                                            {form.typography.headingFont === 'serif' && <Check className="w-3 h-3 text-accent" />}
                                          </div>
                                          <p className="text-3xl leading-tight text-text mb-1" style={{ fontFamily: font }}>Editorial Excellence</p>
                                          <p className="text-[11px] text-muted/40 italic">A sophisticated serif for architectural titles.</p>
                                       </button>
                                    ))}
                                 </div>
                              </div>

                              <div className="space-y-4">
                                 <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Body Architecture</h4>
                                 <div className="relative">
                                    <select 
                                      value={form.typography.bodyFont}
                                      onChange={(e) => setForm({ ...form, typography: { ...form.typography, bodyFont: e.target.value as any }})}
                                      className="w-full bg-[#fafafa] border border-border/40 p-6 font-semibold text-sm appearance-none focus:bg-white transition-all outline-none rounded-xl shadow-sm"
                                    >
                                       <option value="sans">Modern Sans-Serif (Plus Jakarta)</option>
                                       <option value="mono">Developer Monospace (JetBrains)</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                       <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                 </div>
                              </div>
                          </section>
                        </div>
                    )}

                    {activePanel === 'tokens' && (
                        <div className="space-y-12 animate-fadeInUp">
                          <section className="space-y-12">
                               <div className="space-y-6">
                                  <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Corner Roundness</h4>
                                  <div className="flex border border-border/40 rounded-xl overflow-hidden bg-white p-1 shadow-sm">
                                     {['none', 'sm', 'md', 'lg', 'full'].map((r) => (
                                        <button
                                          key={r}
                                          onClick={() => setForm({ ...form, theme: { ...form.theme, borderRadius: r as any }})}
                                          className={cn(
                                            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg",
                                            form.theme.borderRadius === r ? "bg-text text-white shadow-lg shadow-black/10" : "text-muted/40 hover:bg-off/30 hover:text-text"
                                          )}
                                        >
                                           {r}
                                        </button>
                                     ))}
                                  </div>
                               </div>

                               <div className="space-y-6">
                                  <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Shadow Profile</h4>
                                  <div className="grid grid-cols-3 gap-6">
                                     {['none', 'soft', 'heavy'].map((s) => (
                                        <button
                                          key={s}
                                          onClick={() => setForm({ ...form, theme: { ...form.theme, shadowIntensity: s as any }})}
                                          className={cn(
                                            "p-8 border rounded-2xl text-center transition-all group",
                                            form.theme.shadowIntensity === s ? "bg-white border-accent shadow-premium scale-[1.02]" : "bg-[#fafafa] border-border/20 hover:bg-white hover:scale-[1.02]"
                                          )}
                                        >
                                           <div className={cn(
                                             "w-10 h-10 mx-auto mb-6 rounded-lg bg-white border border-border/10 flex items-center justify-center transition-all duration-500",
                                             s === 'heavy' ? "shadow-xl" : s === 'soft' ? "shadow-sm" : ""
                                           )}>
                                              <Box className={cn("w-4 h-4", form.theme.shadowIntensity === s ? "text-accent" : "text-muted/20")} />
                                           </div>
                                           <p className="text-[9px] font-bold uppercase tracking-widest text-text opacity-40 group-hover:opacity-100">{s}</p>
                                        </button>
                                     ))}
                                  </div>
                               </div>

                               <div className="space-y-6">
                                  <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Color mode</h4>
                                  <p className="text-[12px] text-muted/70 leading-relaxed">
                                    Published site: <strong className="text-text">Light</strong> or <strong className="text-text">Dark</strong> forces that theme for every visitor. <strong className="text-text">System</strong> follows the visitor&apos;s OS (and later, an optional site toggle).
                                  </p>
                                  <div className="flex border border-border/40 rounded-xl overflow-hidden bg-white p-1 shadow-sm">
                                    {(['light', 'dark', 'system'] as const).map((mode) => (
                                      <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setForm({ ...form, colorScheme: mode })}
                                        className={cn(
                                          'flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg',
                                          (form.colorScheme ?? 'system') === mode
                                            ? 'bg-text text-white shadow-lg shadow-black/10'
                                            : 'text-muted/40 hover:bg-off/30 hover:text-text'
                                        )}
                                      >
                                        {mode}
                                      </button>
                                    ))}
                                  </div>
                               </div>
                          </section>
                        </div>
                    )}

                    {activePanel === 'branding' && (
                       <div className="py-24 text-center space-y-10 animate-fadeInUp">
                          <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full border border-border/40 border-dashed animate-spin-slow opacity-40 mx-auto" />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <Layers className="w-6 h-6 text-accent/30" />
                            </div>
                          </div>
                          <div className="space-y-4">
                             <h4 className="text-3xl font-serif italic text-text tracking-tight">Identity Vault</h4>
                             <p className="text-[13px] text-muted max-w-[320px] mx-auto leading-relaxed opacity-60">
                               Universal brand assets including primary signatures, watermarks, and editorial icons are being consolidated for deployment.
                             </p>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                             {[1,2,3].map(i => (
                               <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent/20" />
                             ))}
                          </div>
                       </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-8 border-t border-border/40 bg-white sticky bottom-0">
                 <button 
                   onClick={handleSave}
                   disabled={isSaving}
                   className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                 >
                   {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                   Synchronize Branding Protocol
                 </button>
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
