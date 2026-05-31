import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteData } from '../WebsiteDataProvider';
import {
  Calendar,
  ExternalLink,
  Globe,
  List,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { MediaUrlField } from './MediaUrlField';
import { RouteSeoFields } from './admin-workspace-fields';
import type {
  ConferenceAgendaDay,
  ConferenceAgendaSession,
  ConferenceContent,
  ConferenceVideoContent,
} from '../../lib/websiteData';
import { mergeConferenceContent, normalizeRegisterCtaLabel, CONFERENCE_HERO_LOGO, CONFERENCE_HERO_VIDEO } from '../../lib/conferenceDefaults';
import {
  AdminCard,
  AdminField,
  AdminHeaderSave,
  AdminInput,
  AdminPageIntro,
  AdminSubnav,
  AdminTextarea,
} from './admin-ui';
import { useAdminWorkspaceNavRegistry, useApplyPendingAdminSection } from './admin-workspace-nav';

type TabId = 'hero' | 'sections' | 'lists' | 'seo' | 'publish';

const CONFERENCE_SUBNAV_GROUPS = [
  {
    label: 'Page content',
    items: [
      { id: 'hero', label: 'Hero', icon: Sparkles },
      { id: 'sections', label: 'Sections', icon: List },
      { id: 'lists', label: 'Lists', icon: Users },
    ],
  },
  {
    label: 'Go live',
    items: [
      { id: 'seo', label: 'SEO', icon: Globe },
      { id: 'publish', label: 'Publish', icon: ExternalLink },
    ],
  },
];

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const ConferenceManager: React.FC = () => {
  const { sourceData, updateSettings } = useWebsiteData();
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [form, setForm] = useState<ConferenceContent>(() =>
    mergeConferenceContent(sourceData.settings.conference),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [routeSeo, setRouteSeo] = useState(() => {
    const rs = sourceData.settings.routeSeo;
    return rs?.['/'] ?? rs?.['/conference'] ?? {};
  });

  useEffect(() => {
    setForm(mergeConferenceContent(sourceData.settings.conference));
  }, [sourceData.settings.conference]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await updateSettings({
        ...sourceData.settings,
        conference: form,
        visibility: {
          ...sourceData.settings.visibility,
          conference: form.published !== false,
        },
      });
    } catch {
      setSaveError('Failed to save conference content.');
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
    setForm((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: { ...prev.sections[key], [field]: value },
      },
    }));
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
    } catch {
      setSaveError('Failed to save SEO.');
    } finally {
      setIsSaving(false);
    }
  };

  useAdminWorkspaceNavRegistry({
    groups: CONFERENCE_SUBNAV_GROUPS,
    activeId: activeTab,
    onSelect: (id) => setActiveTab(id as TabId),
  });

  useApplyPendingAdminSection('/admin/conference', (id) => setActiveTab(id as TabId));

  return (
    <div className="admin-page-workspace">
      <div className="admin-toolbar shrink-0">
        <div className="admin-toolbar__content">
          <AdminPageIntro
            className="mb-0"
            eyebrow="Homepage"
            title="Summit landing"
            lede="Edit hero, sections, and lists for the public homepage (/)."
          />
        </div>
        <div className="admin-toolbar__actions">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--secondary shrink-0"
          >
            Open homepage
            <ExternalLink className="w-4 h-4" />
          </Link>
          <AdminHeaderSave
            label={
              activeTab === 'seo'
                ? 'Save SEO'
                : activeTab === 'publish'
                  ? 'Save publish settings'
                  : 'Save homepage'
            }
            saving={isSaving}
            onClick={() => void (activeTab === 'seo' ? saveRouteSeo() : handleSave())}
          />
        </div>
      </div>

      <div className="admin-page-editor flex flex-1 min-h-0">
        <AdminSubnav
          className="admin-subnav--desktop-only"
          groups={CONFERENCE_SUBNAV_GROUPS}
          title="Conference page"
          activeId={activeTab}
          onSelect={(id) => setActiveTab(id as TabId)}
        />

        <div className="admin-panel-body flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'hero' && (
            <div className="space-y-4 animate-fadeInUp">
              <AdminCard title="Hero logo">
                <p className="text-sm text-slate-500 mb-4">
                  Shown above the main headline on the homepage. Upload or paste a URL (PNG/WebP recommended).
                </p>
                <MediaUrlField
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
              </AdminCard>

              <AdminCard title="Headline">
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
              </AdminCard>

              <AdminCard title="Hero video background">
                <MediaUrlField
                  label="Poster image"
                  value={form.hero.posterUrl ?? ''}
                  onChange={(v) => patchHero('posterUrl', v)}
                  hint="Fallback image when video cannot play"
                />
                <AdminField
                  label="Background video URL"
                  hint={`MP4, muted loop. Default: ${CONFERENCE_HERO_VIDEO}`}
                >
                  <AdminInput
                    value={form.hero.videoUrl ?? ''}
                    onChange={(e) => patchHero('videoUrl', e.target.value)}
                    placeholder={CONFERENCE_HERO_VIDEO}
                  />
                </AdminField>
              </AdminCard>

              <AdminCard title="Event details">
                <Field
                  label="Date"
                  value={form.hero.dateLabel}
                  onChange={(v) => patchHero('dateLabel', v)}
                />
                <Field
                  label="Location"
                  value={form.hero.locationLabel}
                  onChange={(v) => patchHero('locationLabel', v)}
                />
                <Field
                  label="Register button"
                  value={normalizeRegisterCtaLabel(form.hero.primaryCtaLabel)}
                  onChange={(v) => patchHero('primaryCtaLabel', v)}
                />
              </AdminCard>
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-text">Hero metrics</h4>
                {form.hero.metrics.map((m, i) => (
                  <div key={m.id} className="flex gap-2 items-start">
                    <input
                      aria-label={`Metric ${i + 1} value`}
                      value={m.value}
                      onChange={(e) => {
                        const metrics = [...form.hero.metrics];
                        metrics[i] = { ...m, value: e.target.value };
                        setForm((prev) => ({ ...prev, hero: { ...prev.hero, metrics } }));
                      }}
                      className="admin-input"
                      placeholder="Value"
                    />
                    <input
                      aria-label={`Metric ${i + 1} label`}
                      value={m.label}
                      onChange={(e) => {
                        const metrics = [...form.hero.metrics];
                        metrics[i] = { ...m, label: e.target.value };
                        setForm((prev) => ({ ...prev, hero: { ...prev.hero, metrics } }));
                      }}
                      className="admin-input"
                      placeholder="Label"
                    />
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
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      aria-label="Remove metric"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        metrics: [
                          ...prev.hero.metrics,
                          { id: newId(), value: '', label: '' },
                        ],
                      },
                    }))
                  }
                  className="text-sm font-semibold text-accent flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add metric
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-8 animate-fadeInUp">
              <AdminCard title="Featured video">
                <p className="text-sm text-slate-500 mb-4">
                  Dedicated video block below speakers on the homepage (separate from the hero background).
                </p>
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
                <MediaUrlField
                  label="Video poster"
                  value={form.video?.posterUrl ?? ''}
                  onChange={(v) => patchVideo('posterUrl', v)}
                />
                <AdminField
                  label="Video URL"
                  hint="MP4 recommended. Shown in the video section with play controls."
                >
                  <AdminInput
                    value={form.video?.videoUrl ?? ''}
                    onChange={(e) => patchVideo('videoUrl', e.target.value)}
                    placeholder="https://…"
                  />
                </AdminField>
              </AdminCard>

              {(
                [
                  ['sponsors', 'Sponsors'],
                  ['speakers', 'Speakers'],
                  ['agenda', 'Agenda'],
                ] as const
              ).map(([key, title]) => (
                <AdminCard key={key} title={title}>
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
                  {(key === 'speakers' || key === 'sponsors') && (
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
                  {key === 'speakers' && (
                    <Field
                      label="CTA label"
                      value={form.sections.speakers?.ctaLabel ?? ''}
                      onChange={(v) => patchSection('speakers', 'ctaLabel', v)}
                    />
                  )}
                </AdminCard>
              ))}
            </div>
          )}

          {activeTab === 'lists' && (
            <div className="space-y-10 animate-fadeInUp">
              <ListBlock
                title="Sponsors"
                onAdd={() =>
                  setForm((prev) => ({
                    ...prev,
                    logos: [...prev.logos, { id: newId(), name: '' }],
                  }))
                }
              >
                {form.logos.map((logo, i) => (
                  <Row key={logo.id} onRemove={() => removeAt(setForm, 'logos', i)}>
                    <input
                      aria-label={`Logo ${i + 1}`}
                      value={logo.name}
                      onChange={(e) => updateAt(setForm, 'logos', i, { ...logo, name: e.target.value })}
                      className="admin-input"
                      placeholder="Company name"
                    />
                  </Row>
                ))}
              </ListBlock>

              <ListBlock
                title="Speakers"
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
                {form.speakers.map((sp, i) => (
                  <div key={sp.id} className="p-4 border border-border/30 rounded-xl space-y-2">
                    <Row onRemove={() => removeAt(setForm, 'speakers', i)}>
                      <span className="text-xs font-bold text-muted">Speaker {i + 1}</span>
                    </Row>
                    <input
                      aria-label="Speaker name"
                      value={sp.name}
                      onChange={(e) =>
                        updateAt(setForm, 'speakers', i, { ...sp, name: e.target.value })
                      }
                      className="admin-input"
                      placeholder="Name"
                    />
                    <input
                      aria-label="Speaker title"
                      value={sp.title}
                      onChange={(e) =>
                        updateAt(setForm, 'speakers', i, { ...sp, title: e.target.value })
                      }
                      className="admin-input"
                      placeholder="Title"
                    />
                    <input
                      aria-label="Speaker company"
                      value={sp.company}
                      onChange={(e) =>
                        updateAt(setForm, 'speakers', i, { ...sp, company: e.target.value })
                      }
                      className="admin-input"
                      placeholder="Company"
                    />
                    <MediaUrlField
                      label="Photo"
                      value={sp.image}
                      onChange={(url) => updateAt(setForm, 'speakers', i, { ...sp, image: url })}
                    />
                  </div>
                ))}
              </ListBlock>

              <ListBlock
                title="Agenda days"
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
                {form.agenda.map((day, di) => (
                  <div key={day.id} className="p-4 border border-border/30 rounded-xl space-y-3">
                    <Row onRemove={() => removeAt(setForm, 'agenda', di)}>
                      <input
                        aria-label="Day label"
                        value={day.label}
                        onChange={(e) =>
                          updateAt(setForm, 'agenda', di, { ...day, label: e.target.value })
                        }
                        className="admin-input"
                        placeholder="Day label"
                      />
                    </Row>
                    {day.sessions.map((session, si) => (
                      <div key={session.id} className="pl-3 border-l-2 border-border/40 space-y-2">
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
                          <span className="text-[10px] font-bold text-muted uppercase">Session</span>
                        </Row>
                        <input
                          value={session.time}
                          onChange={(e) => patchSession(setForm, di, si, { time: e.target.value })}
                          className="admin-input"
                          placeholder="Time"
                          aria-label="Session time"
                        />
                        <input
                          value={session.title}
                          onChange={(e) => patchSession(setForm, di, si, { title: e.target.value })}
                          className="admin-input"
                          placeholder="Title"
                          aria-label="Session title"
                        />
                        <input
                          value={session.speaker}
                          onChange={(e) =>
                            patchSession(setForm, di, si, { speaker: e.target.value })
                          }
                          className="admin-input"
                          placeholder="Speaker"
                          aria-label="Session speaker"
                        />
                        <input
                          value={session.track}
                          onChange={(e) => patchSession(setForm, di, si, { track: e.target.value })}
                          className="admin-input"
                          placeholder="Track"
                          aria-label="Session track"
                        />
                      </div>
                    ))}
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
                ))}
              </ListBlock>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6 animate-fadeInUp">
              <RouteSeoFields
                path="/"
                value={routeSeo}
                onChange={setRouteSeo}
              />
            </div>
          )}

          {activeTab === 'publish' && (
            <div className="space-y-6 animate-fadeInUp">
              <AdminCard title="Public visibility">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="font-semibold text-text">Homepage live</p>
                    <p className="text-sm text-slate-500 mt-1">
                      When off, the public homepage (/) shows a not-found state.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.published !== false}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, published: e.target.checked }))
                    }
                    className="w-5 h-5 accent-[var(--admin-accent)]"
                  />
                </label>
              </AdminCard>

              <AdminCard title="Saving your changes">
                <p className="text-sm text-slate-600 leading-relaxed">
                  When you click <strong>Save homepage</strong>, content is stored in the API
                  database (SQLite) and uploaded media on the server disk — not in the browser.
                  Changes persist across redeploys as long as the host keeps a{' '}
                  <strong>persistent disk</strong> for the database and uploads.
                </p>
                <ul className="mt-3 text-sm text-slate-500 space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>Render:</strong> attach a disk at <code>/var/data</code> with{' '}
                    <code>DATABASE_URL=file:/var/data/prod.db</code> and{' '}
                    <code>UPLOAD_ROOT=/var/data</code> (see DEPLOY.md).
                  </li>
                  <li>
                    <strong>Docker:</strong> use the named volume for <code>/app/prisma</code>{' '}
                    (database + uploads).
                  </li>
                  <li>Re-running seed does not overwrite existing CMS content.</li>
                  <li>
                    <strong>Backups:</strong> run <code>npm run backup:db</code> in{' '}
                    <code>server/</code> or POST <code>/api/v1/admin/backup</code> (admin auth).
                  </li>
                  <li>
                    Hero video/logo default to <code>/media/…</code> on the API — see{' '}
                    <code>docs/FIREBASE_DEPLOY.md</code>.
                  </li>
                </ul>
              </AdminCard>
            </div>
          )}

          {saveError && <p className="admin-error">{saveError}</p>}
        </div>
      </div>
    </div>
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
  const id = label.replace(/\s+/g, '-').toLowerCase();
  return (
    <AdminField label={label} htmlFor={id}>
      {multiline ? (
        <AdminTextarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <AdminInput id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </AdminField>
  );
}

function ListBlock({
  title,
  children,
  onAdd,
  icon: Icon = Calendar,
}: {
  title: string;
  children: React.ReactNode;
  onAdd: () => void;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-text flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent" />
          {title}
        </h4>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm font-semibold text-accent flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      {children}
    </div>
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
    <div className="flex items-center gap-2 justify-between">
      <div className="flex-1 min-w-0">{children}</div>
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
        aria-label="Remove"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function removeAt<K extends 'logos' | 'speakers' | 'agenda' | 'faq'>(
  setForm: React.Dispatch<React.SetStateAction<ConferenceContent>>,
  key: K,
  index: number,
) {
  setForm((prev) => ({
    ...prev,
    [key]: (prev[key] as { id: string }[]).filter((_, i) => i !== index),
  }));
}

function updateAt<K extends 'logos' | 'speakers' | 'agenda' | 'faq'>(
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
