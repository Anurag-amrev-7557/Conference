import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteData } from '../WebsiteDataProvider';
import {
  Calendar,
  ExternalLink,
  Globe,
  Layout,
  List,
  Plus,
  Sparkles,
  Trash2,
  Users,
  Image,
  Video,
  MapPin,
  Clock,
  Hash,
  Ticket,
  HelpCircle,
  MessageSquare,
  Building2,
  Eye,
  EyeOff,
  Type,
  Code,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { MediaUrlField } from './MediaUrlField';
import { RouteSeoFields } from './admin-workspace-fields';
import {
  AdminEditorField,
  AdminEditorFields,
  AdminEditorInput,
  AdminEditorSection,
  AdminEditorSubsection,
  AdminEditorTextarea,
  editorSaveStatusFrom,
} from './admin-editor-ui';
import type {
  ConferenceAgendaDay,
  ConferenceAgendaSession,
  ConferenceContent,
  ConferenceTicketTier,
  ConferenceVideoContent,
} from '../../lib/websiteData';
import {
  mergeConferenceContent,
  normalizeRegisterCtaLabel,
  CONFERENCE_HERO_LOGO,
  CONFERENCE_HERO_VIDEO,
} from '../../lib/conferenceDefaults';
import type { SiteSettings } from '../../lib/websiteData';
import { SpeakersCatalogPageFields } from './PageWorkspacePanel';
import { SummitHomepageSettings } from './summit/SummitHomepageSettings';
import {
  AdminButton,
  AdminFieldGrid,
  AdminHeaderSave,
  AdminPageIntro,
} from './admin-ui';
import { useApplyPendingAdminSection } from './admin-workspace-nav';
import { SortableList } from './SortableList';
import { AdminWorkspaceShell } from './AdminWorkspaceShell';
import { CONFERENCE_TAB_INTROS } from './workspaceTabIntros';
import { Toggle } from './ui';
import { useToast } from './ui/Toast';
import { cn } from '../../lib/utils';

type TabId =
  | 'hero'
  | 'sections'
  | 'lists'
  | 'speakers-page'
  | 'embedded'
  | 'visibility'
  | 'seo'
  | 'advanced'
  | 'publish';

const CONFERENCE_SUBNAV_GROUPS = [
  {
    label: 'Summit content',
    items: [
      { id: 'hero', label: 'Hero', icon: Sparkles },
      { id: 'sections', label: 'Section copy', icon: List },
      { id: 'lists', label: 'Lists', icon: Users },
      { id: 'speakers-page', label: 'Speakers page', icon: Globe },
      { id: 'embedded', label: 'Embedded blocks', icon: Layers },
    ],
  },
  {
    label: 'Go live',
    items: [
      { id: 'visibility', label: 'Visibility', icon: Layout },
      { id: 'seo', label: 'SEO', icon: Globe },
      { id: 'advanced', label: 'Advanced', icon: Code },
      { id: 'publish', label: 'Publish', icon: ExternalLink },
    ],
  },
];

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatEventStartLabel(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
}

export const ConferenceManager: React.FC = () => {
  const { sourceData, updateSettings, setPreview, isPreviewVisible } = useWebsiteData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [form, setForm] = useState<ConferenceContent>(() =>
    mergeConferenceContent(sourceData.settings.conference),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const skipDirtyRef = useRef(true);
  const [saveError, setSaveError] = useState('');
  const [routeSeo, setRouteSeo] = useState(() => {
    const rs = sourceData.settings.routeSeo;
    return rs?.['/'] ?? rs?.['/conference'] ?? {};
  });
  const [sharedVisibility, setSharedVisibility] = useState<SiteSettings['visibility']>(
    () => sourceData.settings.visibility,
  );
  const [sectionsForm, setSectionsForm] = useState<SiteSettings['sections']>(
    () => sourceData.settings.sections ?? {},
  );
  const [bookForm, setBookForm] = useState<SiteSettings['book']>(
    () => sourceData.settings.book ?? {},
  );
  const [customCss, setCustomCss] = useState(() => sourceData.settings.customCss ?? '');
  const [scriptsForm, setScriptsForm] = useState<SiteSettings['scripts']>(
    () => sourceData.settings.scripts ?? { header: '', footer: '' },
  );
  const [speakersCatalog, setSpeakersCatalog] = useState(
    () => sourceData.settings.catalogPages?.speakers ?? {},
  );
  const [speakersRouteSeo, setSpeakersRouteSeo] = useState(
    () => sourceData.settings.routeSeo?.['/speakers'] ?? {},
  );

  useEffect(() => {
    skipDirtyRef.current = true;
    setIsDirty(false);
    setForm(mergeConferenceContent(sourceData.settings.conference));
    setSharedVisibility(sourceData.settings.visibility);
    setSectionsForm(sourceData.settings.sections ?? {});
    setBookForm(sourceData.settings.book ?? {});
    setCustomCss(sourceData.settings.customCss ?? '');
    setScriptsForm(sourceData.settings.scripts ?? { header: '', footer: '' });
    setSpeakersCatalog(sourceData.settings.catalogPages?.speakers ?? {});
    setSpeakersRouteSeo(sourceData.settings.routeSeo?.['/speakers'] ?? {});
    const rs = sourceData.settings.routeSeo;
    setRouteSeo(rs?.['/'] ?? rs?.['/conference'] ?? {});
  }, [sourceData.settings]);

  useEffect(() => {
    if (skipDirtyRef.current) {
      skipDirtyRef.current = false;
      return;
    }
    setIsDirty(true);
  }, [
    form,
    routeSeo,
    sharedVisibility,
    sectionsForm,
    bookForm,
    customCss,
    scriptsForm,
    speakersCatalog,
    speakersRouteSeo,
  ]);

  useEffect(() => {
    if (!isPreviewVisible) {
      setPreview(null);
      return;
    }
    setPreview({
      settings: {
        ...sourceData.settings,
        conference: { ...form, published: form.published !== false },
        routeSeo: {
          ...sourceData.settings.routeSeo,
          '/': routeSeo,
          '/speakers': speakersRouteSeo,
        },
        catalogPages: {
          ...sourceData.settings.catalogPages,
          speakers: speakersCatalog,
        },
        visibility: sharedVisibility,
        sections: sectionsForm,
        book: bookForm,
        customCss,
        scripts: scriptsForm,
      },
    });
    return () => setPreview(null);
  }, [
    form,
    routeSeo,
    speakersRouteSeo,
    speakersCatalog,
    sharedVisibility,
    sectionsForm,
    bookForm,
    customCss,
    scriptsForm,
    isPreviewVisible,
    sourceData.settings,
    setPreview,
  ]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await updateSettings({
        ...sourceData.settings,
        conference: form,
        routeSeo: {
          ...sourceData.settings.routeSeo,
          '/': routeSeo,
          '/speakers': speakersRouteSeo,
        },
        catalogPages: {
          ...sourceData.settings.catalogPages,
          speakers: speakersCatalog,
        },
        visibility: sharedVisibility,
        sections: sectionsForm,
        book: bookForm,
        customCss,
        scripts: scriptsForm,
      });
      skipDirtyRef.current = true;
      setIsDirty(false);
      toast({ variant: 'success', title: 'Summit homepage saved' });
    } catch {
      setSaveError('Failed to save conference content.');
      toast({ variant: 'error', title: 'Save failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const patchHero = (field: keyof ConferenceContent['hero'], value: string) => {
    setForm((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const patchSection = (
    key: keyof ConferenceContent['sections'],
    field: string,
    value: string,
  ) => {
    setForm((prev) => {
      const nextSections = {
        ...prev.sections,
        [key]: { ...prev.sections[key], [field]: value },
      };
      if (key === 'tickets') {
        return {
          ...prev,
          sections: nextSections,
          tickets: {
            ...prev.tickets,
            tiers: prev.tickets?.tiers ?? [],
            eyebrow: field === 'eyebrow' ? value : prev.tickets?.eyebrow,
            title: field === 'title' ? value : prev.tickets?.title,
            lede: field === 'lede' ? value : prev.tickets?.lede,
          },
        };
      }
      return {
        ...prev,
        sections: nextSections,
      };
    });
  };

  const patchVideo = (field: keyof ConferenceVideoContent, value: string) => {
    setForm((prev) => ({
      ...prev,
      video: { ...(prev.video ?? {}), [field]: value },
    }));
  };

  const saveRouteSeo = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await updateSettings({
        ...sourceData.settings,
        routeSeo: { ...sourceData.settings.routeSeo, '/': routeSeo },
      });
      skipDirtyRef.current = true;
      setIsDirty(false);
      toast({ variant: 'success', title: 'Summit SEO saved' });
    } catch {
      setSaveError('Failed to save SEO.');
      toast({ variant: 'error', title: 'Save failed' });
    } finally {
      setIsSaving(false);
    }
  };

  useApplyPendingAdminSection('/admin/conference', (id) => setActiveTab(id as TabId));

  const tabIntro = (() => {
    const base = CONFERENCE_TAB_INTROS[activeTab];
    if (activeTab === 'publish') {
      return {
        ...base,
        status: (form.published !== false ? 'published' : 'draft') as 'published' | 'draft',
      };
    }
    return base;
  })();

  const saveStatus = editorSaveStatusFrom(isSaving, isDirty);

  const saveLabel =
    activeTab === 'seo'
      ? 'Save SEO'
      : activeTab === 'speakers-page'
        ? 'Save speakers page'
      : activeTab === 'advanced'
        ? 'Save advanced'
        : activeTab === 'visibility' || activeTab === 'embedded'
          ? 'Save page settings'
          : activeTab === 'publish'
            ? 'Save publish settings'
            : 'Save homepage';

  const previewVariant =
    activeTab === 'speakers-page' ? 'speakers' : 'conference';

  return (
    <AdminWorkspaceShell
      editorClassName="admin-book-page"
      contentEditor
      isPreviewVisible={isPreviewVisible}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed((c) => !c)}
      previewVariant={previewVariant}
      toolbar={
        <AdminPageIntro
          compact
          className="mb-0"
          lede="Full control of the summit homepage at / — content, embedded blocks, visibility, SEO, custom CSS, and scripts."
        />
      }
      editorHeader={tabIntro}
      saveStatus={saveStatus}
      headerAction={
        <>
          <Link
            to={activeTab === 'speakers-page' ? '/speakers' : '/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <AdminButton variant="secondary" className="shrink-0">
              {activeTab === 'speakers-page' ? 'Open /speakers' : 'Open homepage'}
              <ExternalLink className="w-4 h-4" />
            </AdminButton>
          </Link>
          <AdminHeaderSave
            label={saveLabel}
            saving={isSaving}
            onClick={() => void (activeTab === 'seo' ? saveRouteSeo() : handleSave())}
          />
        </>
      }
      subnav={{
        groups: CONFERENCE_SUBNAV_GROUPS,
        title: 'Summit page',
        activeId: activeTab,
        onSelect: (id) => setActiveTab(id as TabId),
        pageId: 'conference',
      }}
    >
          {activeTab === 'hero' && (
            <>
              <AdminEditorSection
                icon={Image}
                title="Hero logo"
                description="Shown above the main headline on the homepage."
              >
                <AdminEditorSubsection title="Logo image">
                  <MediaUrlField
                    editor
                    label="Logo image"
                    value={form.hero.badgeLogoUrl ?? ''}
                    onChange={(v) => patchHero('badgeLogoUrl', v)}
                    hint={`Default: ${CONFERENCE_HERO_LOGO}`}
                  />
                  <Field
                    label="Logo alt text"
                    value={form.hero.badge}
                    onChange={(v) => patchHero('badge', v)}
                  />
                </AdminEditorSubsection>
              </AdminEditorSection>

              <AdminEditorSection icon={Type} title="Headline" description="Main title and subheading above the fold.">
                <AdminEditorSubsection title="Headline copy">
                  <Field label="Title" value={form.hero.title} onChange={(v) => patchHero('title', v)} />
                  <Field
                    label="Title accent"
                    value={form.hero.titleAccent}
                    onChange={(v) => patchHero('titleAccent', v)}
                  />
                  <Field
                    label="Subheading (lede)"
                    value={form.hero.lede}
                    onChange={(v) => patchHero('lede', v)}
                    multiline
                  />
                </AdminEditorSubsection>
              </AdminEditorSection>

              <AdminEditorSection icon={Video} title="Hero video background" description="Background loop behind the hero.">
                <AdminEditorSubsection title="Video assets">
                  <MediaUrlField
                    editor
                    label="Poster image"
                    value={form.hero.posterUrl ?? ''}
                    onChange={(v) => patchHero('posterUrl', v)}
                    hint="Fallback image when video cannot play"
                  />
                  <AdminEditorField label="Background video URL" hint={`MP4, muted loop. Default: ${CONFERENCE_HERO_VIDEO}`}>
                    <AdminEditorInput
                      value={form.hero.videoUrl ?? ''}
                      onChange={(e) => patchHero('videoUrl', e.target.value)}
                      placeholder={CONFERENCE_HERO_VIDEO}
                    />
                  </AdminEditorField>
                </AdminEditorSubsection>
              </AdminEditorSection>

              <AdminEditorSection icon={Calendar} title="Event details" description="Date, location, and register CTA.">
                <AdminEditorSubsection title="Event labels">
                  <AdminFieldGrid columns={2}>
                    <Field label="Date" value={form.hero.dateLabel} onChange={(v) => patchHero('dateLabel', v)} />
                    <Field
                      label="Location"
                      value={form.hero.locationLabel}
                      onChange={(v) => patchHero('locationLabel', v)}
                    />
                  </AdminFieldGrid>
                  <Field
                    label="Register button"
                    value={normalizeRegisterCtaLabel(form.hero.primaryCtaLabel)}
                    onChange={(v) => patchHero('primaryCtaLabel', v)}
                  />
                </AdminEditorSubsection>
              </AdminEditorSection>

              <AdminEditorSection icon={Clock} title="Countdown timer" description="Optional countdown to event start.">
                <AdminEditorSubsection title="Countdown settings">
                  <Toggle
                    label="Show countdown on homepage"
                    checked={form.countdownEnabled !== false}
                    onChange={(checked) => setForm((prev) => ({ ...prev, countdownEnabled: checked }))}
                  />
                  <Field
                    label="Event start (ISO datetime)"
                    value={form.eventStartAt ?? ''}
                    onChange={(v) => setForm((prev) => ({ ...prev, eventStartAt: v }))}
                  />
                  <Field
                    label="Timezone (IANA)"
                    value={form.eventTimezone ?? ''}
                    onChange={(v) => setForm((prev) => ({ ...prev, eventTimezone: v }))}
                  />
                </AdminEditorSubsection>
              </AdminEditorSection>

              <AdminEditorSection icon={MapPin} title="Venue" description="Venue block below the hero.">
                <AdminEditorSubsection title="Venue copy">
                  <Field
                    label="Eyebrow"
                    value={form.venue?.eyebrow ?? ''}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, venue: { ...prev.venue, eyebrow: v } }))
                    }
                  />
                  <Field
                    label="Title"
                    value={form.venue?.title ?? ''}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, venue: { ...prev.venue, title: v } }))
                    }
                  />
                  <Field
                    label="Description"
                    value={form.venue?.lede ?? ''}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, venue: { ...prev.venue, lede: v } }))
                    }
                    multiline
                  />
                  <Field
                    label="Address"
                    value={form.venue?.address ?? ''}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, venue: { ...prev.venue, address: v } }))
                    }
                  />
                  <Field
                    label="Google Maps embed URL"
                    value={form.venue?.mapEmbedUrl ?? ''}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, venue: { ...prev.venue, mapEmbedUrl: v } }))
                    }
                  />
                </AdminEditorSubsection>
              </AdminEditorSection>

              <AdminEditorSection icon={Hash} title="Hero metrics" description="Stat row under the hero CTA.">
                <AdminEditorSubsection title="Metrics">
                  {form.hero.metrics.map((m, i) => (
                    <div key={m.id} className="admin-editor-item-group">
                      <div className="admin-editor-item-group__header">
                        <span className="admin-editor-item-group__title">Metric {i + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              hero: {
                                ...prev.hero,
                                metrics: prev.hero.metrics.filter((x) => x.id !== m.id),
                              },
                            }))
                          }
                          className="admin-catalog-item__action admin-catalog-item__action--danger"
                          aria-label="Remove metric"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <AdminFieldGrid columns={2}>
                        <AdminEditorField label="Value">
                          <AdminEditorInput
                            aria-label={`Metric ${i + 1} value`}
                            value={m.value}
                            onChange={(e) => {
                              const metrics = [...form.hero.metrics];
                              metrics[i] = { ...m, value: e.target.value };
                              setForm((prev) => ({ ...prev, hero: { ...prev.hero, metrics } }));
                            }}
                            placeholder="Value"
                          />
                        </AdminEditorField>
                        <AdminEditorField label="Label">
                          <AdminEditorInput
                            aria-label={`Metric ${i + 1} label`}
                            value={m.label}
                            onChange={(e) => {
                              const metrics = [...form.hero.metrics];
                              metrics[i] = { ...m, label: e.target.value };
                              setForm((prev) => ({ ...prev, hero: { ...prev.hero, metrics } }));
                            }}
                            placeholder="Label"
                          />
                        </AdminEditorField>
                      </AdminFieldGrid>
                    </div>
                  ))}
                  <AdminButton
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          metrics: [...prev.hero.metrics, { id: newId(), value: '', label: '' }],
                        },
                      }))
                    }
                  >
                    <Plus className="w-4 h-4" />
                    Add metric
                  </AdminButton>
                </AdminEditorSubsection>
              </AdminEditorSection>
            </>
          )}

          {activeTab === 'sections' && (
            <>
              <AdminEditorSection
                icon={Video}
                title="Featured video"
                description="Dedicated video block below speakers on the homepage."
              >
                <AdminEditorSubsection title="Section copy">
                  <Field
                    label="Eyebrow"
                    value={form.sections.video?.eyebrow ?? ''}
                    onChange={(v) => patchSection('video', 'eyebrow', v)}
                  />
                  <Field
                    label="Title"
                    value={form.sections.video?.title ?? ''}
                    onChange={(v) => patchSection('video', 'title', v)}
                  />
                  <Field
                    label="Title accent"
                    value={form.sections.video?.titleAccent ?? ''}
                    onChange={(v) => patchSection('video', 'titleAccent', v)}
                  />
                  <Field
                    label="Lede"
                    value={form.sections.video?.lede ?? ''}
                    onChange={(v) => patchSection('video', 'lede', v)}
                    multiline
                  />
                  <Field
                    label="Register CTA"
                    value={form.sections.video?.ctaLabel ?? ''}
                    onChange={(v) => patchSection('video', 'ctaLabel', v)}
                  />
                  <Field
                    label="Video caption"
                    value={form.sections.video?.caption ?? ''}
                    onChange={(v) => patchSection('video', 'caption', v)}
                    multiline
                  />
                </AdminEditorSubsection>
                <AdminEditorSubsection
                  title="Highlight metrics"
                  description="Up to three stat chips shown below the video. Leave empty to fall back to hero metrics."
                >
                  {(form.sections.video?.metrics ?? []).map((metric, index) => (
                    <div key={metric.id} className="admin-editor-item-group">
                      <div className="admin-editor-item-group__header">
                        <span className="admin-editor-item-group__title">Metric {index + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              sections: {
                                ...prev.sections,
                                video: {
                                  ...prev.sections.video,
                                  metrics: (prev.sections.video?.metrics ?? []).filter(
                                    (item) => item.id !== metric.id,
                                  ),
                                },
                              },
                            }))
                          }
                          className="admin-catalog-item__action admin-catalog-item__action--danger"
                          aria-label="Remove metric"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <AdminFieldGrid columns={2}>
                        <AdminEditorField label="Value">
                          <AdminEditorInput
                            aria-label={`Video metric ${index + 1} value`}
                            value={metric.value}
                            onChange={(e) => {
                              const metrics = [...(form.sections.video?.metrics ?? [])]
                              metrics[index] = { ...metric, value: e.target.value }
                              setForm((prev) => ({
                                ...prev,
                                sections: {
                                  ...prev.sections,
                                  video: { ...prev.sections.video, metrics },
                                },
                              }))
                            }}
                            placeholder="3,500+"
                          />
                        </AdminEditorField>
                        <AdminEditorField label="Label">
                          <AdminEditorInput
                            aria-label={`Video metric ${index + 1} label`}
                            value={metric.label}
                            onChange={(e) => {
                              const metrics = [...(form.sections.video?.metrics ?? [])]
                              metrics[index] = { ...metric, label: e.target.value }
                              setForm((prev) => ({
                                ...prev,
                                sections: {
                                  ...prev.sections,
                                  video: { ...prev.sections.video, metrics },
                                },
                              }))
                            }}
                            placeholder="Attendees"
                          />
                        </AdminEditorField>
                      </AdminFieldGrid>
                    </div>
                  ))}
                  <AdminButton
                    type="button"
                    variant="ghost"
                    disabled={(form.sections.video?.metrics ?? []).length >= 3}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          video: {
                            ...prev.sections.video,
                            metrics: [
                              ...(prev.sections.video?.metrics ?? []),
                              { id: newId(), value: '', label: '' },
                            ],
                          },
                        },
                      }))
                    }
                  >
                    <Plus className="w-4 h-4" />
                    Add metric
                  </AdminButton>
                </AdminEditorSubsection>
                <AdminEditorSubsection title="Video assets">
                  <MediaUrlField
                    editor
                    label="Video poster"
                    value={form.video?.posterUrl ?? ''}
                    onChange={(v) => patchVideo('posterUrl', v)}
                  />
                  <AdminEditorField label="Video URL" hint="MP4 recommended. Shown with play controls.">
                    <AdminEditorInput
                      value={form.video?.videoUrl ?? ''}
                      onChange={(e) => patchVideo('videoUrl', e.target.value)}
                      placeholder="https://…"
                    />
                  </AdminEditorField>
                </AdminEditorSubsection>
              </AdminEditorSection>

              {(
                [
                  ['sponsors', 'Sponsors', Building2],
                  ['partners', 'Partners', Users],
                  ['speakers', 'Speakers', Users],
                  ['agenda', 'Agenda', Calendar],
                  ['tickets', 'Ticket passes', Ticket],
                  ['testimonials', 'Testimonials', MessageSquare],
                ] as const
              ).map(([key, title, Icon]) => (
                <AdminEditorSection
                  key={key}
                  icon={Icon}
                  title={title}
                  description={`Copy for the ${title.toLowerCase()} section header.`}
                >
                  <AdminEditorSubsection title="Section header">
                    <Field
                      label="Eyebrow"
                      value={form.sections[key]?.eyebrow ?? ''}
                      onChange={(v) => patchSection(key, 'eyebrow', v)}
                    />
                    <Field
                      label="Title"
                      value={form.sections[key]?.title ?? ''}
                      onChange={(v) => patchSection(key, 'title', v)}
                    />
                    {(key === 'speakers' || key === 'sponsors' || key === 'partners' || key === 'testimonials') && (
                      <Field
                        label="Title accent"
                        value={form.sections[key]?.titleAccent ?? ''}
                        onChange={(v) => patchSection(key, 'titleAccent', v)}
                      />
                    )}
                    <Field
                      label="Lede"
                      value={form.sections[key]?.lede ?? ''}
                      onChange={(v) => patchSection(key, 'lede', v)}
                      multiline
                    />
                    {(key === 'speakers' || key === 'sponsors' || key === 'agenda') && (
                      <Field
                        label="CTA label"
                        value={form.sections[key]?.ctaLabel ?? ''}
                        onChange={(v) => patchSection(key, 'ctaLabel', v)}
                      />
                    )}
                  </AdminEditorSubsection>
                </AdminEditorSection>
              ))}

              <AdminEditorSection
                icon={Ticket}
                title="Ticket tiers"
                description="Pricing cards shown in the ticket passes section."
              >
                <AdminEditorSubsection title="Pricing tiers">
                <SortableList
                  items={form.tickets?.tiers ?? []}
                  onReorder={(tiers) =>
                    setForm((prev) => ({
                      ...prev,
                      tickets: { ...prev.tickets, tiers },
                    }))
                  }
                  renderItem={(tier, ti) => (
                  <div className="admin-editor-item-group">
                    <Row
                      onRemove={() =>
                        setForm((prev) => ({
                          ...prev,
                          tickets: {
                            ...(prev.tickets ?? { tiers: [] }),
                            tiers: (prev.tickets?.tiers ?? []).filter((t) => t.id !== tier.id),
                          },
                        }))
                      }
                    >
                      <span className="admin-editor-item-group__title">Tier {ti + 1}</span>
                    </Row>
                    <AdminEditorField label="Tier name">
                      <AdminEditorInput
                        value={tier.name}
                        onChange={(e) => {
                          const tiers = [...(form.tickets?.tiers ?? [])];
                          tiers[ti] = { ...tier, name: e.target.value };
                          setForm((prev) => ({
                            ...prev,
                            tickets: { ...prev.tickets, tiers, eyebrow: prev.tickets?.eyebrow, title: prev.tickets?.title, lede: prev.tickets?.lede },
                          }));
                        }}
                        placeholder="Tier name"
                      />
                    </AdminEditorField>
                    <AdminEditorField label="Price">
                      <AdminEditorInput
                        value={tier.price}
                        onChange={(e) => {
                          const tiers = [...(form.tickets?.tiers ?? [])];
                          tiers[ti] = { ...tier, price: e.target.value };
                          setForm((prev) => ({
                            ...prev,
                            tickets: { ...prev.tickets, tiers },
                          }));
                        }}
                        placeholder="Price"
                      />
                    </AdminEditorField>
                    <AdminEditorField label="Description">
                      <AdminEditorTextarea
                        value={tier.description}
                        onChange={(e) => {
                          const tiers = [...(form.tickets?.tiers ?? [])];
                          tiers[ti] = { ...tier, description: e.target.value };
                          setForm((prev) => ({
                            ...prev,
                            tickets: { ...prev.tickets, tiers },
                          }));
                        }}
                        rows={2}
                      />
                    </AdminEditorField>
                    <AdminEditorField label="Features (one per line)">
                      <AdminEditorTextarea
                        value={tier.features.join('\n')}
                        onChange={(e) => {
                          const tiers = [...(form.tickets?.tiers ?? [])];
                          tiers[ti] = {
                            ...tier,
                            features: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                          };
                          setForm((prev) => ({
                            ...prev,
                            tickets: { ...prev.tickets, tiers },
                          }));
                        }}
                        rows={4}
                      />
                    </AdminEditorField>
                    <AdminEditorField label="Button label">
                      <AdminEditorInput
                        value={tier.ctaLabel ?? 'Get Tickets'}
                        onChange={(e) => {
                          const tiers = [...(form.tickets?.tiers ?? [])];
                          tiers[ti] = { ...tier, ctaLabel: e.target.value };
                          setForm((prev) => ({
                            ...prev,
                            tickets: { ...prev.tickets, tiers },
                          }));
                        }}
                        placeholder="Get Tickets"
                      />
                    </AdminEditorField>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tier.recommended}
                        onChange={(e) => {
                          const tiers = [...(form.tickets?.tiers ?? [])];
                          tiers[ti] = { ...tier, recommended: e.target.checked };
                          setForm((prev) => ({
                            ...prev,
                            tickets: { ...prev.tickets, tiers },
                          }));
                        }}
                        className="w-4 h-4 accent-[var(--admin-accent)]"
                      />
                      Highlight as recommended
                    </label>
                  </div>
                  )}
                />
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const newTier: ConferenceTicketTier = {
                      id: newId(),
                      name: 'New tier',
                      price: '$0',
                      description: '',
                      features: [],
                      recommended: false,
                      ctaLabel: 'Get Tickets',
                    };
                    setForm((prev) => ({
                      ...prev,
                      tickets: {
                        ...prev.tickets,
                        tiers: [...(prev.tickets?.tiers ?? []), newTier],
                      },
                    }));
                  }}
                >
                  <Plus className="w-4 h-4" /> Add ticket tier
                </AdminButton>
                </AdminEditorSubsection>
              </AdminEditorSection>
            </>
          )}

          {activeTab === 'lists' && (
            <>
              <ListBlock
                icon={Building2}
                title="Sponsors"
                description="Logo strip and sponsor links."
                onAdd={() =>
                  setForm((prev) => ({
                    ...prev,
                    logos: [...prev.logos, { id: newId(), name: '' }],
                  }))
                }
              >
                <SortableList
                  items={form.logos}
                  onReorder={(logos) => setForm((prev) => ({ ...prev, logos }))}
                  renderItem={(logo, i) => (
                  <CollapsibleListItem
                    title={logo.name?.trim() ? logo.name.trim() : `Sponsor ${i + 1}`}
                    onRemove={() => removeAt(setForm, 'logos', i)}
                    defaultOpen={i === 0}
                  >
                    <input
                      aria-label={`Sponsor ${i + 1} name`}
                      value={logo.name}
                      onChange={(e) => updateAt(setForm, 'logos', i, { ...logo, name: e.target.value })}
                      className="admin-editor-input"
                      placeholder="Company name"
                    />
                    <MediaUrlField
                      label="Logo image"
                      value={logo.logoUrl ?? ''}
                      onChange={(url) => updateAt(setForm, 'logos', i, { ...logo, logoUrl: url })}
                    />
                    <input
                      aria-label={`Sponsor ${i + 1} website`}
                      value={logo.websiteUrl ?? ''}
                      onChange={(e) =>
                        updateAt(setForm, 'logos', i, { ...logo, websiteUrl: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="https://sponsor.com"
                    />
                    <input
                      aria-label={`Sponsor ${i + 1} tier`}
                      value={logo.tier ?? ''}
                      onChange={(e) => updateAt(setForm, 'logos', i, { ...logo, tier: e.target.value })}
                      className="admin-editor-input"
                      placeholder="Tier (e.g. Gold)"
                    />
                  </CollapsibleListItem>
                  )}
                />
              </ListBlock>

              <ListBlock
                icon={Users}
                title="Speakers"
                description="Speaker cards with bios and talk metadata."
                onAdd={() =>
                  setForm((prev) => ({
                    ...prev,
                    speakers: [
                      ...prev.speakers,
                      { id: newId(), name: '', title: '', company: '', image: '' },
                    ],
                  }))
                }
              >
                <SortableList
                  items={form.speakers}
                  onReorder={(speakers) => setForm((prev) => ({ ...prev, speakers }))}
                  renderItem={(sp, i) => (
                  <CollapsibleListItem
                    title={sp.name?.trim() ? sp.name.trim() : `Speaker ${i + 1}`}
                    onRemove={() => removeAt(setForm, 'speakers', i)}
                    defaultOpen={i === 0}
                  >
                    <input
                      aria-label="Speaker name"
                      value={sp.name}
                      onChange={(e) =>
                        updateAt(setForm, 'speakers', i, { ...sp, name: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="Name"
                    />
                    <input
                      aria-label="Speaker title"
                      value={sp.title}
                      onChange={(e) =>
                        updateAt(setForm, 'speakers', i, { ...sp, title: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="Title"
                    />
                    <input
                      aria-label="Speaker company"
                      value={sp.company}
                      onChange={(e) =>
                        updateAt(setForm, 'speakers', i, { ...sp, company: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="Company"
                    />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sp.featured === true}
                        onChange={(e) =>
                          updateAt(setForm, 'speakers', i, { ...sp, featured: e.target.checked })
                        }
                        className="w-4 h-4 accent-[var(--admin-accent)]"
                      />
                      Featured on summit homepage
                    </label>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      Only checked speakers appear on the homepage carousel. Extra cards scroll
                      horizontally when they do not fit on screen. Unchecked speakers stay on
                      /speakers only.
                    </p>
                    <MediaUrlField
                      label="Photo"
                      value={sp.image}
                      onChange={(url) => updateAt(setForm, 'speakers', i, { ...sp, image: url })}
                    />
                    <AdminEditorField label="Bio">
                      <AdminEditorTextarea
                        value={sp.bio ?? ''}
                        onChange={(e) => updateAt(setForm, 'speakers', i, { ...sp, bio: e.target.value })}
                        rows={3}
                      />
                    </AdminEditorField>
                    <input
                      aria-label="Talk title"
                      value={sp.talkTitle ?? ''}
                      onChange={(e) =>
                        updateAt(setForm, 'speakers', i, { ...sp, talkTitle: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="Talk title"
                    />
                    <input
                      aria-label="Time slot"
                      value={sp.timeSlot ?? ''}
                      onChange={(e) =>
                        updateAt(setForm, 'speakers', i, { ...sp, timeSlot: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="Time slot"
                    />
                    <input
                      aria-label="LinkedIn URL"
                      value={sp.linkedIn ?? ''}
                      onChange={(e) =>
                        updateAt(setForm, 'speakers', i, { ...sp, linkedIn: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="LinkedIn URL"
                    />
                  </CollapsibleListItem>
                  )}
                />
              </ListBlock>

              <ListBlock
                icon={Calendar}
                title="Agenda days"
                description="Multi-day schedule with sessions."
                onAdd={() =>
                  setForm((prev) => ({
                    ...prev,
                    agenda: [
                      ...prev.agenda,
                      { id: newId(), label: 'New day', sessions: [] },
                    ],
                  }))
                }
              >
                <SortableList
                  items={form.agenda}
                  onReorder={(agenda) => setForm((prev) => ({ ...prev, agenda }))}
                  renderItem={(day, di) => (
                  <CollapsibleListItem
                    title={day.label?.trim() || `Day ${di + 1}`}
                    onRemove={() => removeAt(setForm, 'agenda', di)}
                    defaultOpen={di === 0}
                  >
                    <div className="space-y-3">
                      <input
                        aria-label="Day label"
                        value={day.label}
                        onChange={(e) =>
                          updateAt(setForm, 'agenda', di, { ...day, label: e.target.value })
                        }
                        className="admin-editor-input"
                        placeholder="Day label"
                      />
                    <SortableList
                      items={day.sessions}
                      onReorder={(sessions) => {
                        setForm((prev) => {
                          const agenda = [...prev.agenda];
                          agenda[di] = { ...agenda[di], sessions };
                          return { ...prev, agenda };
                        });
                      }}
                      renderItem={(session, si) => (
                        <div className="space-y-2 border-l-2 border-[var(--admin-border-strong)] pl-3">
                          <Row
                            onRemove={() => {
                              setForm((prev) => {
                                const agenda = [...prev.agenda];
                                const sessions = agenda[di].sessions.filter((_, j) => j !== si);
                                agenda[di] = { ...agenda[di], sessions };
                                return { ...prev, agenda };
                              });
                            }}
                          >
                            <span className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Session</span>
                          </Row>
                          <input
                            value={session.time}
                            onChange={(e) => patchSession(setForm, di, si, { time: e.target.value })}
                            className="admin-editor-input"
                            placeholder="Time"
                            aria-label="Session time"
                          />
                          <input
                            value={session.title}
                            onChange={(e) => patchSession(setForm, di, si, { title: e.target.value })}
                            className="admin-editor-input"
                            placeholder="Title"
                            aria-label="Session title"
                          />
                          <input
                            value={session.speaker}
                            onChange={(e) =>
                              patchSession(setForm, di, si, { speaker: e.target.value })
                            }
                            className="admin-editor-input"
                            placeholder="Speaker"
                            aria-label="Session speaker"
                          />
                          <input
                            value={session.track}
                            onChange={(e) => patchSession(setForm, di, si, { track: e.target.value })}
                            className="admin-editor-input"
                            placeholder="Track"
                            aria-label="Session track"
                          />
                          <AdminEditorField label="Linked speaker">
                            <select
                              value={session.speakerId ?? ''}
                              onChange={(e) =>
                                patchSession(setForm, di, si, {
                                  speakerId: e.target.value || undefined,
                                })
                              }
                              className="admin-editor-input"
                              aria-label="Session linked speaker"
                            >
                              <option value="">No linked speaker</option>
                              {form.speakers.map((speaker) => (
                                <option key={speaker.id} value={speaker.id}>
                                  {speaker.name}
                                  {speaker.company ? ` — ${speaker.company}` : ''} ({speaker.id})
                                </option>
                              ))}
                            </select>
                          </AdminEditorField>
                          <input
                            value={session.duration ?? ''}
                            onChange={(e) =>
                              patchSession(setForm, di, si, { duration: e.target.value })
                            }
                            className="admin-editor-input"
                            placeholder="Duration (e.g. 60 min)"
                            aria-label="Session duration"
                          />
                          <input
                            value={session.room ?? ''}
                            onChange={(e) => patchSession(setForm, di, si, { room: e.target.value })}
                            className="admin-editor-input"
                            placeholder="Room"
                            aria-label="Session room"
                          />
                          <textarea
                            value={session.description ?? ''}
                            onChange={(e) =>
                              patchSession(setForm, di, si, { description: e.target.value })
                            }
                            className="admin-editor-input min-h-[4.5rem]"
                            placeholder="Session description"
                            aria-label="Session description"
                          />
                        </div>
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => {
                          const agenda = [...prev.agenda];
                          const sessions: ConferenceAgendaSession[] = [
                            ...agenda[di].sessions,
                            {
                              id: newId(),
                              time: '',
                              title: '',
                              speaker: '',
                              track: '',
                            },
                          ];
                          agenda[di] = { ...agenda[di], sessions };
                          return { ...prev, agenda };
                        });
                      }}
                      className="text-xs font-semibold text-accent cursor-pointer"
                    >
                      + Add session
                    </button>
                    </div>
                  </CollapsibleListItem>
                  )}
                />
              </ListBlock>

              <ListBlock
                icon={Building2}
                title="Partners"
                description="Partner logos and outbound links."
                onAdd={() =>
                  setForm((prev) => ({
                    ...prev,
                    partners: [...(prev.partners ?? []), { id: newId(), name: '' }],
                  }))
                }
              >
                <SortableList
                  items={form.partners ?? []}
                  onReorder={(partners) => setForm((prev) => ({ ...prev, partners }))}
                  renderItem={(partner, i) => (
                  <CollapsibleListItem
                    title={partner.name?.trim() ? partner.name.trim() : `Partner ${i + 1}`}
                    onRemove={() => removeAt(setForm, 'partners', i)}
                    defaultOpen={i === 0}
                  >
                    <input
                      aria-label={`Partner ${i + 1} name`}
                      value={partner.name}
                      onChange={(e) =>
                        updateAt(setForm, 'partners', i, { ...partner, name: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="Partner name"
                    />
                    <MediaUrlField
                      label="Logo"
                      value={partner.logoUrl ?? ''}
                      onChange={(url) => updateAt(setForm, 'partners', i, { ...partner, logoUrl: url })}
                    />
                    <input
                      aria-label={`Partner ${i + 1} website`}
                      value={partner.websiteUrl ?? ''}
                      onChange={(e) =>
                        updateAt(setForm, 'partners', i, { ...partner, websiteUrl: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="https://partner.com"
                    />
                  </CollapsibleListItem>
                  )}
                />
              </ListBlock>

              <ListBlock
                icon={HelpCircle}
                title="FAQ"
                description="Questions and answers on the summit page."
                onAdd={() =>
                  setForm((prev) => ({
                    ...prev,
                    faq: [...prev.faq, { id: newId(), question: '', answer: '' }],
                  }))
                }
              >
                <SortableList
                  items={form.faq}
                  onReorder={(faq) => setForm((prev) => ({ ...prev, faq }))}
                  renderItem={(item, i) => (
                  <CollapsibleListItem
                    title={item.question?.trim() ? item.question.trim() : `FAQ ${i + 1}`}
                    onRemove={() => removeAt(setForm, 'faq', i)}
                    defaultOpen={i === 0}
                  >
                    <input
                      value={item.question}
                      onChange={(e) =>
                        updateAt(setForm, 'faq', i, { ...item, question: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="Question"
                      aria-label="FAQ question"
                    />
                    <AdminEditorField label="Answer">
                      <AdminEditorTextarea
                        value={item.answer}
                        onChange={(e) =>
                          updateAt(setForm, 'faq', i, { ...item, answer: e.target.value })
                        }
                        rows={3}
                        placeholder="Answer"
                      />
                    </AdminEditorField>
                  </CollapsibleListItem>
                  )}
                />
              </ListBlock>

              <ListBlock
                icon={MessageSquare}
                title="Testimonials"
                description="Attendee quotes and social proof."
                onAdd={() =>
                  setForm((prev) => ({
                    ...prev,
                    testimonials: [
                      ...(prev.testimonials ?? []),
                      { id: newId(), quote: '', name: '', role: '', company: '' },
                    ],
                  }))
                }
              >
                <SortableList
                  items={form.testimonials ?? []}
                  onReorder={(testimonials) => setForm((prev) => ({ ...prev, testimonials }))}
                  renderItem={(item, i) => (
                  <CollapsibleListItem
                    title={item.quote?.trim() ? item.quote.trim() : `Testimonial ${i + 1}`}
                    onRemove={() => removeAt(setForm, 'testimonials', i)}
                    defaultOpen={i === 0}
                  >
                    <AdminEditorField label="Quote">
                      <AdminEditorTextarea
                        value={item.quote}
                        onChange={(e) =>
                          updateAt(setForm, 'testimonials', i, { ...item, quote: e.target.value })
                        }
                        rows={3}
                        placeholder="What they said about the summit"
                      />
                    </AdminEditorField>
                    <input
                      aria-label="Attendee name"
                      value={item.name}
                      onChange={(e) =>
                        updateAt(setForm, 'testimonials', i, { ...item, name: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="Name"
                    />
                    <input
                      aria-label="Role"
                      value={item.role}
                      onChange={(e) =>
                        updateAt(setForm, 'testimonials', i, { ...item, role: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="Role / title"
                    />
                    <input
                      aria-label="Company"
                      value={item.company ?? ''}
                      onChange={(e) =>
                        updateAt(setForm, 'testimonials', i, { ...item, company: e.target.value })
                      }
                      className="admin-editor-input"
                      placeholder="Company (optional)"
                    />
                    <MediaUrlField
                      label="Avatar photo"
                      value={item.avatarUrl ?? ''}
                      onChange={(url) =>
                        updateAt(setForm, 'testimonials', i, { ...item, avatarUrl: url })
                      }
                    />
                  </CollapsibleListItem>
                  )}
                />
              </ListBlock>
            </>
          )}

          {activeTab === 'speakers-page' && (
            <SpeakersCatalogPageFields
              catalog={speakersCatalog}
              onCatalogChange={setSpeakersCatalog}
              routeSeo={speakersRouteSeo}
              onRouteSeoChange={setSpeakersRouteSeo}
            />
          )}

          {activeTab === 'seo' && (
            <AdminEditorSection
              icon={Globe}
              title="Search & sharing"
              description="Applied to the conference homepage (/)."
            >
              <AdminEditorFields>
                <RouteSeoFields path="/" value={routeSeo} onChange={setRouteSeo} />
              </AdminEditorFields>
            </AdminEditorSection>
          )}

          {(activeTab === 'embedded' ||
            activeTab === 'visibility' ||
            activeTab === 'advanced') && (
            <SummitHomepageSettings
              activeTab={activeTab}
              sections={sectionsForm}
              onSectionsChange={setSectionsForm}
              book={bookForm}
              onBookChange={setBookForm}
              visibility={sharedVisibility}
              onVisibilityChange={setSharedVisibility}
              sectionVisibility={form.sectionVisibility}
              onSectionVisibilityChange={(next) =>
                setForm((prev) => ({ ...prev, sectionVisibility: next }))
              }
              customCss={customCss}
              onCustomCssChange={setCustomCss}
              scripts={scriptsForm}
              onScriptsChange={setScriptsForm}
            />
          )}

          {activeTab === 'publish' && (
            <>
              <AdminEditorSection
                icon={ExternalLink}
                title="Public visibility"
                description="Control whether the summit homepage is live at /."
              >
                <AdminEditorSubsection title="Homepage status">
                  <p className="admin-page-metrics-inline">
                    <span>{form.published !== false ? 'Live' : 'Draft'}</span>
                    <span aria-hidden>·</span>
                    <span>{form.published !== false ? 'Public at /' : 'Shows 404'}</span>
                    <span aria-hidden>·</span>
                    <span>
                      Countdown {form.countdownEnabled !== false ? 'on' : 'off'}
                      {(() => {
                        const startLabel = formatEventStartLabel(form.eventStartAt);
                        return startLabel ? ` · ${startLabel}` : '';
                      })()}
                    </span>
                  </p>
                  <div className="admin-editor-visibility-row">
                    <div
                      className={cn(
                        'admin-editor-visibility-row__icon',
                        form.published !== false && 'admin-editor-visibility-row__icon--on',
                      )}
                      aria-hidden
                    >
                      {form.published !== false ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </div>
                    <Toggle
                      label="Homepage live"
                      description="When off, the public homepage (/) shows a not-found state."
                      checked={form.published !== false}
                      onChange={(checked) => setForm((prev) => ({ ...prev, published: checked }))}
                    />
                  </div>
                </AdminEditorSubsection>
              </AdminEditorSection>

              <AdminEditorSection
                icon={ExternalLink}
                title="Saving & deployment"
                description="Where summit content is stored and how to back it up."
              >
                <AdminEditorSubsection title="Persistence notes">
                  <p className="admin-editor-field__hint leading-relaxed">
                    When you click <strong>Save homepage</strong>, content is stored in the API
                    database and uploaded media on the server disk — not in the browser.
                    Changes persist across redeploys with a persistent disk for the database and uploads.
                  </p>
                  <ul className="mt-3 admin-editor-field__hint space-y-2 list-disc pl-5">
                    <li><strong>Render:</strong> attach a disk at <code>/var/data</code></li>
                    <li><strong>Docker:</strong> use the named volume for <code>/app/prisma</code></li>
                    <li>Re-running seed does not overwrite existing CMS content</li>
                    <li><strong>Backups:</strong> POST <code>/api/v1/admin/backup</code> or use Dashboard</li>
                  </ul>
                </AdminEditorSubsection>
              </AdminEditorSection>
            </>
          )}

          {saveError && (
            <p className="admin-error mt-4" role="alert">
              {saveError}
            </p>
          )}
    </AdminWorkspaceShell>
  );
};

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <AdminEditorField label={label} value={multiline ? undefined : value}>
      {multiline ? (
        <AdminEditorTextarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <AdminEditorInput value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </AdminEditorField>
  );
}

function ListBlock({
  title,
  description,
  children,
  onAdd,
  icon: Icon = Calendar,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onAdd: () => void;
  icon?: React.ElementType;
}) {
  return (
    <AdminEditorSection
      icon={Icon}
      title={title}
      description={description}
      action={
        <AdminButton type="button" variant="ghost" onClick={onAdd}>
          <Plus className="w-4 h-4" />
          Add
        </AdminButton>
      }
    >
      <AdminEditorSubsection title="Items">{children}</AdminEditorSubsection>
    </AdminEditorSection>
  );
}

function CollapsibleListItem({
  title,
  children,
  onRemove,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  onRemove: () => void;
  defaultOpen?: boolean;
}) {
  return (
    <details className="admin-editor-collapsible-item" open={defaultOpen}>
      <summary className="admin-editor-collapsible-item__summary">
        <div className="admin-editor-collapsible-item__title-wrap">
          <ChevronDown className="admin-editor-collapsible-item__chevron w-4 h-4" aria-hidden />
          <span className="admin-editor-item-group__title">{title}</span>
        </div>
        <button
          type="button"
          className="admin-catalog-item__action admin-catalog-item__action--danger"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${title}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </summary>
      <div className="admin-editor-item-group admin-editor-collapsible-item__body">{children}</div>
    </details>
  );
}

function Row({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="admin-editor-item-group__header">
      <div className="flex-1 min-w-0">{children}</div>
      <button
        type="button"
        className="admin-catalog-item__action admin-catalog-item__action--danger"
        onClick={onRemove}
        aria-label="Remove"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function removeAt<K extends 'logos' | 'speakers' | 'agenda' | 'faq' | 'partners' | 'testimonials'>(
  setForm: React.Dispatch<React.SetStateAction<ConferenceContent>>,
  key: K,
  index: number,
) {
  setForm((prev) => ({
    ...prev,
    [key]: ((prev[key] as { id: string }[]) ?? []).filter((_, i) => i !== index),
  }));
}

function updateAt<K extends 'logos' | 'speakers' | 'agenda' | 'faq' | 'partners' | 'testimonials'>(
  setForm: React.Dispatch<React.SetStateAction<ConferenceContent>>,
  key: K,
  index: number,
  value: ConferenceContent[K][number],
) {
  setForm((prev) => {
    const list = [...prev[key]] as ConferenceContent[K][number][];
    list[index] = value;
    return { ...prev, [key]: list } as ConferenceContent;
  });
}

function patchSession(
  setForm: React.Dispatch<React.SetStateAction<ConferenceContent>>,
  dayIndex: number,
  sessionIndex: number,
  patch: Partial<ConferenceAgendaSession>,
) {
  setForm((prev) => {
    const agenda: ConferenceAgendaDay[] = [...prev.agenda];
    const sessions = [...agenda[dayIndex].sessions];
    sessions[sessionIndex] = { ...sessions[sessionIndex], ...patch };
    agenda[dayIndex] = { ...agenda[dayIndex], sessions };
    return { ...prev, agenda };
  });
}
