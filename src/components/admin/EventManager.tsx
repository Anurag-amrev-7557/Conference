import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import type { AppEvent } from '../../lib/websiteData';
import {
  ChevronLeft,
  ExternalLink,
  Globe,
  Layout,
  Calendar,
  FileText,
  CalendarClock,
  MapPin,
  Image,
  History,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { EventsPageWorkspacePanel } from './PageWorkspacePanel';
import { EventSeoTab } from './EventSeoTab';
import { api } from '../../lib/api';
import { RevisionHistoryPanel } from './RevisionHistoryPanel';
import { useAdminSession } from './useAdminSession';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../lib/datetimeLocal';
import { formatScheduleHint, getScheduleBadge } from '../../lib/publishSchedule';
import {
  AdminButton,
  AdminFieldGrid,
  AdminHeaderSave,
  AdminPageIntro,
} from './admin-ui';
import {
  AdminEditorField,
  AdminEditorInput,
  AdminEditorSection,
  AdminEditorSubsection,
  AdminEditorTextarea,
  editorSaveStatusFrom,
} from './admin-editor-ui';
import type { WorkspaceSaveConfig } from './admin-workspace-save';
import { MediaUrlField } from './MediaUrlField';
import { AdminWorkspaceShell } from './AdminWorkspaceShell';
import { EVENTS_TAB_INTROS } from './workspaceTabIntros';
import { useApplyPendingAdminSection } from './admin-workspace-nav';
import {
  CatalogViewToggle,
  CatalogListSkeleton,
  CatalogItemCard,
  getPublishBadge,
} from './admin-catalog-list';
import { ConfirmDialog, Toggle, EmptyState } from './ui';
import { useToast } from './ui/Toast';

const EVENT_FIELD_LIMITS = {
  title: 120,
  day: 32,
  weekday: 24,
  time: 24,
  price: 48,
  host: 80,
  location: 120,
  description: 2000,
  registrationUrl: 500,
  thumbnail: 500,
} as const;

export const EventManager: React.FC = () => {
  const { data, sourceData, updateEvent, deleteEvent, refresh } = useWebsiteData();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<'events' | 'page' | 'seo'>('events');
  const [editorTab, setEditorTab] = useState<'content' | 'seo'>('content');
  const [panelSave, setPanelSave] = useState<WorkspaceSaveConfig | null>(null);
  const [editForm, setEditForm] = useState<Partial<AppEvent>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const skipDirtyRef = useRef(true);
  const [eventView, setEventView] = useState<'active' | 'trash'>('active');
  const [trashEvents, setTrashEvents] = useState<AppEvent[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const adminToken = localStorage.getItem('adminToken') || '';
  const { isSuperAdmin, canEdit } = useAdminSession();

  useEffect(() => {
    if (eventView !== 'trash' || !adminToken) {
      setTrashEvents([]);
      return;
    }
    let cancelled = false;
    setLoadingTrash(true);
    void api
      .getAdminEvents(adminToken, { trash: true })
      .then((items) => {
        if (!cancelled) setTrashEvents(items);
      })
      .catch((err) => {
        if (!cancelled) {
          toast({
            variant: 'error',
            title: 'Could not load trash',
            description: err instanceof Error ? err.message : undefined,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTrash(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventView, adminToken]);

  const storedEvent = editingId
    ? sourceData.events.find((e) => e.id === editingId)
    : undefined;

  const handleEdit = (event: AppEvent) => {
    skipDirtyRef.current = true;
    setIsDirty(false);
    setEditingId(event.id);
    setEditForm(event);
    setEditorTab('content');
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
      thumbnail:
        'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop',
      status: 'Upcoming',
      isPublished: false,
      lat: 37.7749,
      lng: -122.4194,
    };

    try {
      const created = await api.createEvent(adminToken, newEvent);
      await refresh();
      if (created?.id) {
        skipDirtyRef.current = true;
        setIsDirty(false);
        setEditingId(created.id);
        setEditForm({ ...newEvent, ...created, id: created.id });
        setEditorTab('content');
      }
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Failed to create event',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await deleteEvent(deleteTargetId);
      if (editingId === deleteTargetId) setEditingId(null);
      toast({ variant: 'success', title: 'Event moved to trash' });
      setDeleteTargetId(null);
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Failed to delete',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (id: string) => {
    if (!adminToken) return;
    try {
      await api.restoreEvent(adminToken, id);
      setTrashEvents((prev) => prev.filter((e) => e.id !== id));
      await refresh();
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Restore failed',
        description: err instanceof Error ? err.message : 'Failed to restore event.',
      });
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!adminToken || !isSuperAdmin) return;
    setPermanentDeleteId(id);
  };

  const confirmPermanentDelete = async () => {
    if (!permanentDeleteId || !adminToken) return;
    setDeleting(true);
    try {
      await api.permanentDeleteEvent(adminToken, permanentDeleteId);
      setTrashEvents((prev) => prev.filter((e) => e.id !== permanentDeleteId));
      toast({ variant: 'success', title: 'Event permanently deleted' });
      setPermanentDeleteId(null);
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Delete failed',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  const listEvents = eventView === 'trash' ? trashEvents : sourceData.events;

  const handleSave = async () => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await updateEvent(editingId, editForm);
      skipDirtyRef.current = true;
      setIsDirty(false);
      toast({ variant: 'success', title: 'Event saved' });
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Save failed',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    skipDirtyRef.current = true;
    setIsDirty(false);
  }, [editingId, editorTab]);

  useEffect(() => {
    if (!editingId) return;
    if (skipDirtyRef.current) {
      skipDirtyRef.current = false;
      return;
    }
    setIsDirty(true);
  }, [editForm, editingId]);

  const tabIntroKey = editingId
    ? editorTab === 'seo'
      ? 'eventSeo'
      : 'content'
    : workspaceTab;

  const tabIntro = (() => {
    if (!editingId) {
      return EVENTS_TAB_INTROS[tabIntroKey as keyof typeof EVENTS_TAB_INTROS];
    }

    const base = EVENTS_TAB_INTROS[tabIntroKey as keyof typeof EVENTS_TAB_INTROS];
    const eventTitle = editForm.title?.trim() || 'Untitled event';
    const scheduleBadge = getScheduleBadge(editForm as AppEvent);
    let status: 'published' | 'draft' | 'scheduled' = 'draft';
    if (editForm.isPublished) {
      status = scheduleBadge === 'scheduled' ? 'scheduled' : 'published';
    }

    if (editorTab === 'seo') {
      return {
        ...base,
        breadcrumb: `Events · Calendar · ${eventTitle}`,
        title: 'Event SEO',
        description: base.description,
        status,
      };
    }

    return {
      ...base,
      breadcrumb: `Events · Calendar · ${eventTitle}`,
      title: eventTitle,
      description: base.description,
      status,
    };
  })();

  const editorToolbarLede = editingId
    ? undefined
    : 'Calendar items, listing page hero, and /events SEO.';

  const saveStatus = editingId
    ? editorSaveStatusFrom(isSaving, isDirty)
    : workspaceTab === 'events'
      ? 'idle'
      : panelSave?.saving
        ? 'saving'
        : 'idle';

  useApplyPendingAdminSection('/admin/events', (id) => {
    if (id === 'content' || id === 'seo') return;
    setWorkspaceTab(id as typeof workspaceTab);
  });

  const subnav = editingId
    ? {
        groups: [
          {
            label: 'Event',
            items: [
              { id: 'content', label: 'Details', icon: FileText },
              { id: 'seo', label: 'SEO', icon: Globe },
            ],
          },
        ],
        activeId: editorTab,
        onSelect: (id: string) => setEditorTab(id as typeof editorTab),
        pageId: 'events' as const,
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
        onSelect: (id: string) => setWorkspaceTab(id as typeof workspaceTab),
        pageId: 'events' as const,
      };

  return (
    <AdminWorkspaceShell
      editorClassName="admin-book-page"
      toolbar={
        editingId ? (
          <div className="flex items-center gap-4 min-w-0 w-full">
            <AdminButton
              variant="ghost"
              type="button"
              onClick={() => setEditingId(null)}
              className="!px-0 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to events
            </AdminButton>
          </div>
        ) : (
          <AdminPageIntro compact className="mb-0" lede={editorToolbarLede} />
        )
      }
      subnav={subnav}
      editorHeader={tabIntro}
      editorHeaderAside={
        !editingId && workspaceTab === 'events' ? (
          <CatalogViewToggle view={eventView} onChange={setEventView} />
        ) : undefined
      }
      contentEditor={!!editingId || workspaceTab !== 'events'}
      panelFlush={!editingId && workspaceTab === 'events'}
      saveStatus={saveStatus}
      headerAction={
        editingId ? (
          <>
            {editForm.isPublished ? (
              <Link
                to={`/events/${editingId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <AdminButton variant="secondary" className="shrink-0">
                  View event
                  <ExternalLink className="w-4 h-4" />
                </AdminButton>
              </Link>
            ) : null}
            <AdminHeaderSave label="Save event" saving={isSaving} onClick={handleSave} />
          </>
        ) : workspaceTab === 'events' && canEdit && eventView === 'active' ? (
          <>
            <Link to="/events" target="_blank" rel="noopener noreferrer" className="inline-flex">
              <AdminButton variant="secondary" className="shrink-0">
                Open events page
                <ExternalLink className="w-4 h-4" />
              </AdminButton>
            </Link>
            <button type="button" className="admin-btn admin-btn--primary" onClick={() => void handleAddNew()}>
              <Plus className="w-4 h-4" aria-hidden />
              New event
            </button>
          </>
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
            key={editingId ? `editor-${editorTab}` : 'list'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
          >
            {editorTab === 'seo' ? (
              <EventSeoTab
                editForm={editForm}
                setEditForm={setEditForm}
                storedEvent={storedEvent}
                data={data}
              />
            ) : (
              <>
                <AdminEditorSection
                  icon={FileText}
                  title="Basics"
                  description="Event title shown on the calendar and detail page."
                >
                  <AdminEditorSubsection title="Event title">
                    <AdminEditorField
                      label="Title"
                      value={editForm.title || ''}
                      maxLength={EVENT_FIELD_LIMITS.title}
                      showCharCount
                    >
                      <AdminEditorInput
                        value={editForm.title || ''}
                        maxLength={EVENT_FIELD_LIMITS.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="New Intelligent Workshop"
                      />
                    </AdminEditorField>
                  </AdminEditorSubsection>
                </AdminEditorSection>

                <AdminEditorSection
                  icon={Calendar}
                  title="Schedule"
                  description="Labels shown on the events calendar and structured data."
                >
                  <AdminEditorSubsection title="Calendar labels">
                    <AdminFieldGrid columns={2}>
                      <AdminEditorField
                        label="Date label"
                        value={editForm.day || ''}
                        maxLength={EVENT_FIELD_LIMITS.day}
                        showCharCount
                      >
                        <AdminEditorInput
                          value={editForm.day || ''}
                          maxLength={EVENT_FIELD_LIMITS.day}
                          onChange={(e) => setEditForm({ ...editForm, day: e.target.value })}
                          placeholder="24 May"
                        />
                      </AdminEditorField>
                      <AdminEditorField
                        label="Weekday"
                        value={editForm.weekday || ''}
                        maxLength={EVENT_FIELD_LIMITS.weekday}
                        showCharCount
                      >
                        <AdminEditorInput
                          value={editForm.weekday || ''}
                          maxLength={EVENT_FIELD_LIMITS.weekday}
                          onChange={(e) => setEditForm({ ...editForm, weekday: e.target.value })}
                        />
                      </AdminEditorField>
                      <AdminEditorField
                        label="Start time"
                        value={editForm.time || ''}
                        maxLength={EVENT_FIELD_LIMITS.time}
                        showCharCount
                      >
                        <AdminEditorInput
                          value={editForm.time || ''}
                          maxLength={EVENT_FIELD_LIMITS.time}
                          onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        />
                      </AdminEditorField>
                      <AdminEditorField
                        label="Full time display"
                        value={editForm.full_time || ''}
                        showCharCount
                      >
                        <AdminEditorInput
                          value={editForm.full_time || ''}
                          onChange={(e) => setEditForm({ ...editForm, full_time: e.target.value })}
                          placeholder="24 May, 19:00 GMT-7"
                        />
                      </AdminEditorField>
                      <AdminEditorField label="Card tag">
                        <AdminEditorInput
                          value={editForm.tags?.[0]?.name ?? ''}
                          onChange={(e) => {
                            const name = e.target.value.trim();
                            setEditForm({
                              ...editForm,
                              tags: name
                                ? [
                                    {
                                      name,
                                      color:
                                        editForm.tags?.[0]?.color ??
                                        'bg-accent/10 text-accent border-accent/20',
                                    },
                                  ]
                                : [],
                            });
                          }}
                          placeholder="INITIATED"
                        />
                      </AdminEditorField>
                      <AdminEditorField
                        label="Price"
                        value={editForm.price || ''}
                        maxLength={EVENT_FIELD_LIMITS.price}
                        showCharCount
                      >
                        <AdminEditorInput
                          value={editForm.price || ''}
                          maxLength={EVENT_FIELD_LIMITS.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        />
                      </AdminEditorField>
                    </AdminFieldGrid>
                  </AdminEditorSubsection>
                  <AdminEditorSubsection
                    title="Structured data (ISO)"
                    description="Required for Event JSON-LD on the events page."
                  >
                    <AdminFieldGrid columns={2}>
                      <AdminEditorField label="Start">
                        <AdminEditorInput
                          type="datetime-local"
                          value={toDatetimeLocalValue(editForm.startDate)}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              startDate: fromDatetimeLocalValue(e.target.value),
                            })
                          }
                        />
                      </AdminEditorField>
                      <AdminEditorField label="End">
                        <AdminEditorInput
                          type="datetime-local"
                          value={toDatetimeLocalValue(editForm.endDate)}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              endDate: fromDatetimeLocalValue(e.target.value),
                            })
                          }
                        />
                      </AdminEditorField>
                    </AdminFieldGrid>
                  </AdminEditorSubsection>
                </AdminEditorSection>

                <AdminEditorSection
                  icon={MapPin}
                  title="Host & location"
                  description="Speaker, venue, and registration details."
                >
                  <AdminEditorSubsection title="People & place">
                    <AdminEditorField
                      label="Host"
                      value={editForm.host || ''}
                      maxLength={EVENT_FIELD_LIMITS.host}
                      showCharCount
                    >
                      <AdminEditorInput
                        value={editForm.host || ''}
                        maxLength={EVENT_FIELD_LIMITS.host}
                        onChange={(e) => setEditForm({ ...editForm, host: e.target.value })}
                      />
                    </AdminEditorField>
                    <AdminEditorField
                      label="Location"
                      value={editForm.location || ''}
                      maxLength={EVENT_FIELD_LIMITS.location}
                      showCharCount
                    >
                      <AdminEditorInput
                        value={editForm.location || ''}
                        maxLength={EVENT_FIELD_LIMITS.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      />
                    </AdminEditorField>
                    <AdminEditorField
                      label="About this event"
                      value={editForm.description || ''}
                      maxLength={EVENT_FIELD_LIMITS.description}
                      showCharCount
                    >
                      <AdminEditorTextarea
                        rows={5}
                        value={editForm.description || ''}
                        maxLength={EVENT_FIELD_LIMITS.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Full event description shown on the detail page"
                      />
                    </AdminEditorField>
                  </AdminEditorSubsection>
                  <AdminEditorSubsection title="Registration">
                    <AdminEditorField
                      label="Registration URL (optional)"
                      value={editForm.registrationUrl || ''}
                      maxLength={EVENT_FIELD_LIMITS.registrationUrl}
                      showCharCount
                    >
                      <AdminEditorInput
                        value={editForm.registrationUrl || ''}
                        maxLength={EVENT_FIELD_LIMITS.registrationUrl}
                        onChange={(e) =>
                          setEditForm({ ...editForm, registrationUrl: e.target.value })
                        }
                        placeholder="https://… or leave empty to link to /register"
                        className="font-mono"
                      />
                    </AdminEditorField>
                    <Toggle
                      label="Registration open"
                      description="Accept registration requests for this event."
                      checked={editForm.registrationOpen !== false}
                      onChange={(checked) => setEditForm({ ...editForm, registrationOpen: checked })}
                    />
                  </AdminEditorSubsection>
                </AdminEditorSection>

                <AdminEditorSection
                  icon={Image}
                  title="Cover image"
                  description="Thumbnail on the calendar and social fallback."
                >
                  <AdminEditorSubsection title="Event image">
                    {editForm.thumbnail ? (
                      <div className="aspect-[21/9] rounded-lg overflow-hidden border border-[var(--editor-border-secondary)] mb-3 max-w-lg">
                        <img src={editForm.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <MediaUrlField
                      editor
                      label="Image URL"
                      value={editForm.thumbnail || ''}
                      maxLength={EVENT_FIELD_LIMITS.thumbnail}
                      onChange={(url) => setEditForm({ ...editForm, thumbnail: url })}
                    />
                  </AdminEditorSubsection>
                </AdminEditorSection>

                <AdminEditorSection
                  icon={CalendarClock}
                  title="Publish"
                  description="Lifecycle, visibility, and schedule windows."
                >
                  <AdminEditorSubsection title="Lifecycle & visibility">
                    <AdminEditorField label="Lifecycle">
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
                    </AdminEditorField>
                    <div className="admin-editor-visibility-row">
                      <div
                        className={cn(
                          'admin-editor-visibility-row__icon',
                          editForm.isPublished && 'admin-editor-visibility-row__icon--on',
                        )}
                        aria-hidden
                      >
                        {editForm.isPublished ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </div>
                      <Toggle
                        label={editForm.isPublished ? 'Published' : 'Draft'}
                        description={
                          formatScheduleHint(editForm) ??
                          (editForm.isPublished
                            ? 'Visible on the events page'
                            : 'Hidden from the public site')
                        }
                        checked={!!editForm.isPublished}
                        onChange={(checked) => setEditForm({ ...editForm, isPublished: checked })}
                      />
                    </div>
                    {formatScheduleHint(editForm) ? (
                      <p className="admin-editor-field__hint text-[var(--ds-warning-text)]">{formatScheduleHint(editForm)}</p>
                    ) : null}
                    <AdminEditorField label="Publish at (optional)">
                      <AdminEditorInput
                        type="datetime-local"
                        value={toDatetimeLocalValue(editForm.publishAt)}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            publishAt: fromDatetimeLocalValue(e.target.value) ?? undefined,
                          })
                        }
                      />
                    </AdminEditorField>
                    <AdminEditorField label="Unpublish at (optional)">
                      <AdminEditorInput
                        type="datetime-local"
                        value={toDatetimeLocalValue(editForm.unpublishAt)}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            unpublishAt: fromDatetimeLocalValue(e.target.value) ?? undefined,
                          })
                        }
                      />
                    </AdminEditorField>
                  </AdminEditorSubsection>
                </AdminEditorSection>

                {editingId && canEdit ? (
                  <AdminEditorSection
                    icon={History}
                    title="Revision history"
                    description="Restore prior versions of this event."
                  >
                    <AdminEditorSubsection
                      title="Version snapshots"
                      description="Automatic snapshots saved on each update."
                    >
                      <RevisionHistoryPanel
                        embedded
                        entityType="event"
                        entityId={editingId}
                        previewKeys={['title', 'description', 'host', 'location', 'isPublished']}
                        currentSnapshot={editForm as Record<string, unknown>}
                        onRestored={async () => {
                          await refresh();
                          const updated = sourceData.events.find((e) => e.id === editingId);
                          if (updated) {
                            skipDirtyRef.current = true;
                            setEditForm(updated);
                          }
                        }}
                      />
                    </AdminEditorSubsection>
                  </AdminEditorSection>
                ) : null}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {workspaceTab === 'page' && (
              <EventsPageWorkspacePanel mode="page" onSaveReady={setPanelSave} />
            )}
            {workspaceTab === 'seo' && (
              <EventsPageWorkspacePanel mode="seo" onSaveReady={setPanelSave} />
            )}

            {workspaceTab === 'events' && (
              <div className="admin-catalog-panel">
                {eventView === 'trash' && loadingTrash ? (
                  <CatalogListSkeleton count={3} />
                ) : listEvents.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    heading={eventView === 'trash' ? 'Trash is empty' : 'No events yet'}
                    subtext={
                      eventView === 'trash'
                        ? 'Deleted events appear here before permanent removal.'
                        : 'Add your first calendar event for the public site.'
                    }
                  />
                ) : (
                  <div className="admin-catalog-list">
                    {listEvents.map((event) => (
                      <CatalogItemCard
                        key={event.id}
                        title={event.title}
                        meta={`${event.weekday} · ${event.time}`}
                        thumbnail={
                          event.thumbnail ? (
                            <img src={event.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 bg-[var(--editor-bg-secondary)]">
                              <span className="text-xs font-medium uppercase leading-tight text-[var(--editor-text-primary)]">
                                {event.day.split(' ')[0]}
                              </span>
                              <span className="text-xs font-medium text-[var(--editor-primary)] uppercase">
                                {event.day.split(' ')[1]}
                              </span>
                            </div>
                          )
                        }
                        publishBadge={getPublishBadge(
                          event.isPublished,
                          eventView === 'active' ? getScheduleBadge(event) : null,
                          eventView === 'trash',
                        )}
                        view={eventView}
                        canEdit={canEdit}
                        isSuperAdmin={isSuperAdmin}
                        onEdit={() => handleEdit(event)}
                        onTrash={() => void handleDelete(event.id)}
                        onRestore={() => void handleRestore(event.id)}
                        onPermanentDelete={() => void handlePermanentDelete(event.id)}
                      />
                    ))}
                  </div>
                )}

                <ConfirmDialog
                  open={deleteTargetId != null}
                  onOpenChange={(open) => !open && setDeleteTargetId(null)}
                  title="Move to trash?"
                  description="This event will be hidden from the public site."
                  confirmLabel="Move to trash"
                  variant="danger"
                  loading={deleting}
                  onConfirm={() => void confirmDelete()}
                />
                <ConfirmDialog
                  open={permanentDeleteId != null}
                  onOpenChange={(open) => !open && setPermanentDeleteId(null)}
                  title="Permanently delete?"
                  description="This cannot be undone."
                  confirmLabel="Delete permanently"
                  variant="danger"
                  loading={deleting}
                  onConfirm={() => void confirmPermanentDelete()}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminWorkspaceShell>
  );
};
