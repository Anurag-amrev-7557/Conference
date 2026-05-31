import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import type { AppEvent } from '../../lib/websiteData';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  Globe,
  Layout,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { EventsPageWorkspacePanel } from './PageWorkspacePanel';
import {
  AdminButton,
  AdminField,
  AdminFieldGrid,
  AdminFormSection,
  AdminHeaderSave,
  AdminInput,
  AdminPageIntro,
  AdminTextarea,
} from './admin-ui';
import type { WorkspaceSaveConfig } from './admin-workspace-save';
import { AdminWorkspaceShell } from './AdminWorkspaceShell';
import { EVENTS_TAB_INTROS } from './workspaceTabIntros';
import { useApplyPendingAdminSection } from './admin-workspace-nav';

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
  const {
    sourceData,
    data,
    createEvent,
    updateEvent,
    deleteEvent,
    setPreview,
    isPreviewVisible,
  } = useWebsiteData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<'events' | 'page' | 'seo'>('events');
  const [panelSave, setPanelSave] = useState<WorkspaceSaveConfig | null>(null);
  const [editForm, setEditForm] = useState<Partial<AppEvent>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const eventsRef = useRef(sourceData.events);
  eventsRef.current = sourceData.events;

  useEffect(() => {
    if (!editingId || !isPreviewVisible) {
      setPreview(null);
      return;
    }
    setPreview({
      events: eventsRef.current.map((e) =>
        e.id === editingId ? { ...e, ...editForm } : e,
      ),
    });
    return () => setPreview(null);
  }, [editingId, editForm, isPreviewVisible, setPreview]);

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

  useApplyPendingAdminSection('/admin/events', (id) => {
    if (id === 'content') return;
    setWorkspaceTab(id as typeof workspaceTab);
  });

  const tabIntroKey = editingId ? 'content' : workspaceTab;
  const tabIntro = EVENTS_TAB_INTROS[tabIntroKey];

  return (
    <AdminWorkspaceShell
      isPreviewVisible={isPreviewVisible}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      toolbar={
        editingId ? (
          <div className="flex items-center justify-between gap-4 w-full">
            <AdminButton variant="ghost" type="button" onClick={() => setEditingId(null)} className="!px-0">
              <ChevronLeft className="w-4 h-4" />
              Back to events
            </AdminButton>
            <span className="text-[var(--admin-type-label)] font-semibold">Edit event</span>
          </div>
        ) : (
          <AdminPageIntro
            className="mb-0"
            eyebrow="Events"
            title="Events workspace"
            lede="Calendar items, listing page hero, and /events SEO."
          />
        )
      }
      subnav={
        editingId
          ? {
              groups: [{ label: 'Event', items: [{ id: 'content', label: 'Details', icon: Calendar }] }],
              activeId: 'content',
              onSelect: () => {},
            }
          : {
              groups: [
                { label: 'Calendar', items: [{ id: 'events', label: 'Events', icon: Calendar }] },
                {
                  label: 'Events page',
                  items: [
                    { id: 'page', label: 'Page hero', icon: Layout },
                    { id: 'seo', label: 'SEO', icon: Globe },
                  ],
                },
              ],
              activeId: workspaceTab,
              onSelect: (id) => setWorkspaceTab(id as typeof workspaceTab),
            }
      }
      tabIntro={tabIntro}
      headerAction={
        editingId ? (
          <AdminHeaderSave label="Save event" saving={isSaving} onClick={handleSave} />
        ) : workspaceTab !== 'events' && panelSave ? (
          <AdminHeaderSave
            label={panelSave.label}
            saving={panelSave.saving}
            onClick={panelSave.onSave}
          />
        ) : undefined
      }
    >
             <AnimatePresence mode="wait">
                {editingId ? (
                   <motion.div
                     key="editor"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                   >
                      <AdminFormSection title="Event title">
                        <AdminField label="Title">
                          <AdminInput
                            value={editForm.title || ''}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          />
                        </AdminField>
                      </AdminFormSection>

                      <AdminFormSection title="Schedule" description="Labels shown on the events calendar.">
                        <AdminFieldGrid columns={2}>
                          <AdminField label="Date label">
                            <AdminInput
                              value={editForm.day || ''}
                              onChange={(e) => setEditForm({ ...editForm, day: e.target.value })}
                              placeholder="24 May"
                            />
                          </AdminField>
                          <AdminField label="Weekday">
                            <AdminInput
                              value={editForm.weekday || ''}
                              onChange={(e) => setEditForm({ ...editForm, weekday: e.target.value })}
                            />
                          </AdminField>
                          <AdminField label="Start time">
                            <AdminInput
                              value={editForm.time || ''}
                              onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                            />
                          </AdminField>
                          <AdminField label="Price">
                            <AdminInput
                              value={editForm.price || ''}
                              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            />
                          </AdminField>
                        </AdminFieldGrid>
                      </AdminFormSection>

                      <AdminFormSection
                        title="Structured data (ISO)"
                        description="Required for Event JSON-LD on the events page."
                      >
                        <AdminField label="Start">
                          <AdminInput
                            type="datetime-local"
                            value={toDatetimeLocalValue(editForm.startDate)}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                startDate: fromDatetimeLocalValue(e.target.value),
                              })
                            }
                          />
                        </AdminField>
                        <AdminField label="End">
                          <AdminInput
                            type="datetime-local"
                            value={toDatetimeLocalValue(editForm.endDate)}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                endDate: fromDatetimeLocalValue(e.target.value),
                              })
                            }
                          />
                        </AdminField>
                      </AdminFormSection>

                      <AdminFormSection title="Host & location">
                        <AdminField label="Host">
                          <AdminInput
                            value={editForm.host || ''}
                            onChange={(e) => setEditForm({ ...editForm, host: e.target.value })}
                          />
                        </AdminField>
                        <AdminField label="Location">
                          <AdminInput
                            value={editForm.location || ''}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          />
                        </AdminField>
                      </AdminFormSection>

                      <AdminFormSection title="SEO overrides">
                        <AdminField label="Meta title">
                          <AdminInput
                            value={editForm.seoTitle || ''}
                            onChange={(e) => setEditForm({ ...editForm, seoTitle: e.target.value })}
                          />
                        </AdminField>
                        <AdminField label="Meta description">
                          <AdminTextarea
                            rows={2}
                            value={editForm.seoDescription || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm, seoDescription: e.target.value })
                            }
                          />
                        </AdminField>
                        <AdminField label="OG image URL">
                          <AdminInput
                            value={editForm.ogImage || ''}
                            onChange={(e) => setEditForm({ ...editForm, ogImage: e.target.value })}
                            className="font-mono text-sm"
                          />
                        </AdminField>
                        <label className="flex items-center gap-3 admin-field__label cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.noindex === true}
                            onChange={(e) =>
                              setEditForm({ ...editForm, noindex: e.target.checked })
                            }
                          />
                          Exclude from sitemap (noindex)
                        </label>
                      </AdminFormSection>

                      <AdminFormSection title="Status & publish">
                        <AdminField label="Lifecycle">
                          <div className="admin-segmented max-w-xs">
                            {(['Upcoming', 'Past'] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setEditForm({ ...editForm, status: s })}
                                className={cn(
                                  'admin-segmented__item',
                                  editForm.status === s && 'admin-segmented__item--active',
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </AdminField>
                        <div className="flex items-center justify-between gap-4 py-2">
                          <div>
                            <p className="font-semibold text-[var(--admin-text)]">
                              {editForm.isPublished ? 'Published' : 'Draft'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setEditForm({ ...editForm, isPublished: !editForm.isPublished })
                            }
                            className={cn(
                              'w-12 h-7 rounded-full relative transition-all p-1 border shrink-0',
                              editForm.isPublished
                                ? 'bg-[var(--admin-primary)] border-[var(--admin-primary)]'
                                : 'bg-[var(--admin-border)]',
                            )}
                            aria-label="Toggle published"
                          >
                            <span
                              className={cn(
                                'block w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
                                editForm.isPublished && 'translate-x-5',
                              )}
                            />
                          </button>
                        </div>
                      </AdminFormSection>

                      <AdminFormSection title="Cover image">
                        {editForm.thumbnail ? (
                          <div className="aspect-[21/9] max-w-lg rounded-xl overflow-hidden border border-[var(--admin-border)] mb-3">
                            <img src={editForm.thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : null}
                        <AdminField label="Image URL">
                          <AdminInput
                            value={editForm.thumbnail || ''}
                            onChange={(e) => setEditForm({ ...editForm, thumbnail: e.target.value })}
                            className="font-mono text-sm"
                          />
                        </AdminField>
                      </AdminFormSection>
                   </motion.div>
                ) : (
                   <motion.div
                     key="list"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                   >
                      {workspaceTab === 'page' && (
                        <EventsPageWorkspacePanel mode="page" onSaveReady={setPanelSave} />
                      )}
                      {workspaceTab === 'seo' && (
                        <EventsPageWorkspacePanel mode="seo" onSaveReady={setPanelSave} />
                      )}
                      {workspaceTab === 'events' && (
                      <>
                      <AdminButton type="button" onClick={() => void handleAddNew()} className="mb-4">
                         <Plus className="w-5 h-5" />
                         New event
                      </AdminButton>

                      <div className="space-y-3">
                            {data.events.map((event) => (
                               <div key={event.id} className="admin-list-card">
                                  <div className="admin-list-card__thumb flex flex-col items-center justify-center text-center p-1">
                                     <span className="text-[10px] font-bold uppercase leading-tight">{event.day.split(' ')[0]}</span>
                                     <span className="text-[9px] font-bold text-[var(--admin-primary)] uppercase">{event.day.split(' ')[1]}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-2 mb-1">
                                        <span className="admin-list-card__meta">{event.weekday} · {event.time}</span>
                                        <span
                                          className={cn(
                                            'w-2 h-2 rounded-full',
                                            event.isPublished ? 'bg-emerald-500' : 'bg-amber-500',
                                          )}
                                        />
                                     </div>
                                     <h3 className="admin-list-card__title truncate">{event.title}</h3>
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                     <AdminButton variant="secondary" onClick={() => handleEdit(event)} className="!min-h-10 !px-3" aria-label="Edit">
                                        <Edit2 className="w-4 h-4" />
                                     </AdminButton>
                                     <AdminButton variant="danger" onClick={() => void handleDelete(event.id)} className="!min-h-10 !px-3" aria-label="Delete">
                                        <Trash2 className="w-4 h-4" />
                                     </AdminButton>
                                  </div>
                               </div>
                            ))}
                      </div>
                      </>
                      )}
                   </motion.div>
                )}
             </AnimatePresence>
    </AdminWorkspaceShell>
  );
};
