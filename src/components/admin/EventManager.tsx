import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { LivePreview } from './LivePreview';
import type { AppEvent } from '../../lib/websiteData';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  User, 
  DollarSign, 
  Save, 
  Loader2, 
  ChevronLeft, 
  Calendar as CalendarIcon,
  Clock,
  Navigation,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export const EventManager: React.FC = () => {
  const { data, createEvent, updateEvent, deleteEvent, setPreview, isPreviewVisible } = useWebsiteData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AppEvent>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync with live preview
  useEffect(() => {
    if (editingId && editForm) {
      const updatedEvents = data.events.map(e => 
        e.id === editingId ? { ...e, ...editForm } : e
      );
      setPreview({ events: updatedEvents });
    } else {
      setPreview(null);
    }
    return () => setPreview(null);
  }, [editingId, editForm, data.events]);

  const handleEdit = (event: AppEvent) => {
    setEditingId(event.id);
    setEditForm(event);
  };

  const handleAddNew = async () => {
    const newEvent: Partial<AppEvent> = {
      day: '24 May',
      weekday: 'Wednesday',
      time: '19:00',
      full_time: '24 May, 19:00 GMT-7',
      title: 'New Intelligent Workshop',
      host: 'Senior Systems Architect',
      location: 'Virtual Nexus',
      tags: [{ name: 'INITIATED', color: 'bg-accent/10 text-accent border-accent/20' }],
      price: 'Free Access',
      thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop',
      status: 'Upcoming',
      isPublished: false,
      lat: 37.7749,
      lng: -122.4194
    };
    
    try {
      await createEvent(newEvent);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Terminate this incident?')) {
      try {
        await deleteEvent(id);
        if (editingId === id) setEditingId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = async () => {
    if (editingId) {
      setIsSaving(true);
      try {
        await updateEvent(editingId, editForm);
        setEditingId(null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
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
                   <CalendarIcon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Network Orchestration</span>
             </div>
             
             <AnimatePresence mode="wait">
                {editingId ? (
                   <motion.div 
                     key="edit-header"
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 10 }}
                     className="flex items-center justify-between"
                   >
                      <button 
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-2 text-muted hover:text-text transition-colors group"
                      >
                         <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Back to schedule</span>
                      </button>
                      <h3 className="text-2xl font-serif italic text-text tracking-tight shrink-0">Modify Item</h3>
                   </motion.div>
                ) : (
                   <motion.div 
                     key="list-header"
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                   >
                      <h3 className="text-4xl font-serif italic text-text mb-4">Event Manager</h3>
                      <p className="text-text2 text-base leading-relaxed opacity-60">Deploy and manage high-fidelity workshops and speaking engagements.</p>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto">
             <AnimatePresence mode="wait">
                {editingId ? (
                   <motion.div
                     key="editor"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                     className="p-8 space-y-12"
                   >
                      <div className="space-y-12 animate-fadeInUp">
                         {/* Core Info */}
                         <section className="space-y-4">
                             <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Event Title</h4>
                             <input 
                               type="text"
                               value={editForm.title || ''}
                               onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                               className="w-full bg-[#fafafa] border border-border/40 p-5 font-serif italic text-2xl focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                             />
                         </section>

                         {/* Scheduling Cluster */}
                         <section className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Date Label</label>
                               <input 
                                 type="text"
                                 value={editForm.day || ''}
                                 onChange={e => setEditForm({ ...editForm, day: e.target.value })}
                                 className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm font-bold focus:bg-white transition-all outline-none rounded-xl"
                                 placeholder="24 May"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Weekday</label>
                               <input 
                                 type="text"
                                 value={editForm.weekday || ''}
                                 onChange={e => setEditForm({ ...editForm, weekday: e.target.value })}
                                 className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm font-bold focus:bg-white transition-all outline-none rounded-xl"
                               />
                            </div>
                         </section>

                         <section className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Start Time</label>
                               <div className="relative">
                                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/30" />
                                  <input 
                                    type="text"
                                    value={editForm.time || ''}
                                    onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                                    className="w-full bg-[#fafafa] border border-border/40 pl-11 p-4 text-sm font-mono focus:bg-white transition-all outline-none rounded-xl"
                                  />
                               </div>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Access Cost</label>
                               <div className="relative">
                                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/30" />
                                  <input 
                                    type="text"
                                    value={editForm.price || ''}
                                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                    className="w-full bg-[#fafafa] border border-border/40 pl-11 p-4 text-sm font-bold focus:bg-white transition-all outline-none rounded-xl"
                                  />
                               </div>
                            </div>
                         </section>

                         <section className="space-y-3">
                            <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Schema start (ISO)</label>
                            <input
                              type="datetime-local"
                              value={toDatetimeLocalValue(editForm.startDate)}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  startDate: fromDatetimeLocalValue(e.target.value),
                                })
                              }
                              className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm font-mono focus:bg-white transition-all outline-none rounded-xl"
                            />
                            <p className="text-[11px] text-muted leading-relaxed">
                              Required for Event JSON-LD on the events page. Display fields above stay for the UI.
                            </p>
                         </section>

                         <section className="space-y-3">
                            <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Schema end (ISO)</label>
                            <input
                              type="datetime-local"
                              value={toDatetimeLocalValue(editForm.endDate)}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  endDate: fromDatetimeLocalValue(e.target.value),
                                })
                              }
                              className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm font-mono focus:bg-white transition-all outline-none rounded-xl"
                            />
                         </section>

                         {/* Identity */}
                         <section className="space-y-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Hosting Authority</label>
                               <div className="relative">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/30" />
                                  <input 
                                    type="text"
                                    value={editForm.host || ''}
                                    onChange={e => setEditForm({ ...editForm, host: e.target.value })}
                                    className="w-full bg-[#fafafa] border border-border/40 pl-11 p-5 text-base font-semibold focus:bg-white transition-all outline-none rounded-xl shadow-sm"
                                  />
                               </div>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Spatial Coordinates</label>
                               <div className="relative">
                                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/30" />
                                  <input 
                                    type="text"
                                    value={editForm.location || ''}
                                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                    className="w-full bg-[#fafafa] border border-border/40 pl-11 p-5 text-base font-semibold focus:bg-white transition-all outline-none rounded-xl shadow-sm"
                                  />
                               </div>
                            </div>
                         </section>

                         <section className="space-y-4 p-6 border border-border/40 rounded-2xl">
                            <h4 className="text-sm font-bold text-text uppercase tracking-widest">Event SEO</h4>
                            <input
                              type="text"
                              value={editForm.seoTitle || ''}
                              onChange={(e) => setEditForm({ ...editForm, seoTitle: e.target.value })}
                              placeholder="SEO title override"
                              className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl"
                            />
                            <textarea
                              rows={2}
                              value={editForm.seoDescription || ''}
                              onChange={(e) => setEditForm({ ...editForm, seoDescription: e.target.value })}
                              placeholder="Meta description override"
                              className="w-full bg-[#fafafa] border border-border/40 p-4 text-sm rounded-xl resize-none"
                            />
                            <input
                              type="text"
                              value={editForm.ogImage || ''}
                              onChange={(e) => setEditForm({ ...editForm, ogImage: e.target.value })}
                              placeholder="OG image URL"
                              className="w-full bg-[#fafafa] border border-border/40 p-4 font-mono text-xs rounded-xl"
                            />
                            <label className="flex items-center gap-3 text-sm">
                              <input
                                type="checkbox"
                                checked={editForm.noindex === true}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, noindex: e.target.checked })
                                }
                              />
                              Exclude from sitemap (noindex)
                            </label>
                         </section>

                         {/* Status & Visibility */}
                         <section className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Lifecycle Status</label>
                               <div className="flex bg-[#fafafa] border border-border/40 rounded-xl overflow-hidden p-1 shadow-sm">
                                  {['Upcoming', 'Past'].map((s) => (
                                     <button
                                       key={s}
                                       onClick={() => setEditForm({ ...editForm, status: s as any })}
                                       className={cn(
                                          "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg",
                                          editForm.status === s ? "bg-text text-white shadow-lg shadow-black/10" : "text-muted/40 hover:bg-white hover:text-text"
                                       )}
                                     >
                                        {s}
                                     </button>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Network Deployment</label>
                               <button 
                                 onClick={() => setEditForm({ ...editForm, isPublished: !editForm.isPublished })}
                                 className={cn(
                                   "w-full py-3.5 border rounded-xl flex items-center justify-center gap-3 transition-all duration-500 shadow-sm",
                                   editForm.isPublished ? "bg-accent text-white border-accent" : "bg-white border-border/40 text-muted"
                                 )}
                               >
                                  <Globe className={cn("w-4 h-4", editForm.isPublished ? "animate-pulse" : "opacity-30")} />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">{editForm.isPublished ? 'Live Status' : 'Restricted Draft'}</span>
                               </button>
                            </div>
                         </section>

                         {/* Image */}
                         <section className="space-y-4">
                            <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Atmospheric Backdrop</label>
                            <div className="relative group/img">
                               <div className="aspect-[21/9] rounded-2xl overflow-hidden border border-border/40 bg-off relative shadow-inner">
                                  <img src={editForm.thumbnail} alt="" className="w-full h-full object-cover grayscale opacity-40 group-hover/img:opacity-100 transition-all duration-700" />
                               </div>
                               <input 
                                 type="text"
                                 value={editForm.thumbnail || ''}
                                 onChange={e => setEditForm({ ...editForm, thumbnail: e.target.value })}
                                 className="mt-4 w-full bg-[#fafafa] border border-border/40 p-4 text-[10px] font-mono text-muted focus:bg-white focus:border-accent transition-all outline-none rounded-xl"
                                 placeholder="Backdrop URL"
                               />
                            </div>
                         </section>
                      </div>

                      <div className="pt-8 sticky bottom-0 bg-white pb-8">
                         <button 
                           onClick={handleSave}
                           disabled={isSaving}
                           className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                         >
                           {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                           Synchronize Deployment
                         </button>
                      </div>
                   </motion.div>
                ) : (
                   <motion.div
                     key="list"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="p-8 space-y-12"
                   >
                      <button 
                        onClick={handleAddNew}
                        className="w-full py-10 border-2 border-dashed border-border/40 rounded-[32px] flex flex-col items-center gap-4 text-muted hover:text-accent hover:border-accent hover:bg-accent/[0.02] transition-all group"
                      >
                         <div className="w-12 h-12 rounded-full bg-off flex items-center justify-center border border-border/40 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
                            <Plus className="w-5 h-5" />
                         </div>
                         <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Publish New Incident</span>
                      </button>

                      <div className="space-y-6">
                         <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Active Schedule</h4>
                         <div className="space-y-4">
                            {data.events.map((event) => (
                               <div 
                                 key={event.id}
                                 className="group/item flex items-center gap-6 p-6 border border-border/40 rounded-2xl hover:bg-[#fafafa] hover:border-accent/20 transition-all bg-white shadow-sm"
                               >
                                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-border/40 bg-off shrink-0 flex flex-col items-center justify-center text-center p-2 group-hover/item:border-accent/20 transition-colors">
                                     <span className="text-[11px] font-bold uppercase tracking-widest text-text leading-tight">{event.day.split(' ')[0]}</span>
                                     <span className="text-[9px] font-bold uppercase text-accent leading-tight">{event.day.split(' ')[1]}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-3 mb-1.5">
                                        <span className="text-[9px] font-bold text-muted/60 uppercase tracking-widest">{event.weekday} · {event.time}</span>
                                        <div className="w-1 h-1 rounded-full bg-border/40" />
                                        <div className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          event.isPublished ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-amber-500"
                                        )} />
                                     </div>
                                     <h5 className="font-serif italic text-lg text-text truncate group-hover/item:text-accent transition-colors">{event.title}</h5>
                                  </div>
                                  <div className="flex gap-2">
                                     <button 
                                       onClick={() => handleEdit(event)}
                                       className="w-10 h-10 rounded-xl bg-white border border-border/40 flex items-center justify-center text-muted hover:text-accent hover:border-accent hover:bg-white shadow-sm transition-all"
                                     >
                                        <Edit2 className="w-4 h-4" />
                                     </button>
                                     <button 
                                       onClick={() => handleDelete(event.id)}
                                       className="w-10 h-10 rounded-xl bg-white border border-border/40 flex items-center justify-center text-muted hover:text-rose-500 hover:border-rose-200 shadow-sm transition-all"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
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
