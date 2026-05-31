import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import type { WebsiteData } from '../../lib/websiteData';
import { 
  Eye, 
  EyeOff, 
  Layout, 
  Sparkles,
  BarChart3,
  Users,
  Target,
  Trash2,
  Plus,
  Type,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { pillarIcons, perkIcons } from '../WebsiteDataProvider';
import { HomepageSeoPanel } from './PageWorkspacePanel';
import { AdminWorkspaceShell } from './AdminWorkspaceShell';
import { SectionCopyFields, FinalCtaFields } from './admin-workspace-fields';
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
import { HOMEPAGE_TAB_INTROS } from './workspaceTabIntros';
import { useApplyPendingAdminSection } from './admin-workspace-nav';

const TAB_SAVE_LABELS: Record<
  'hero' | 'stats' | 'showcase' | 'perks' | 'sections' | 'visibility',
  string
> = {
  hero: 'Save hero',
  stats: 'Save stats',
  showcase: 'Save showcase',
  perks: 'Save perks',
  sections: 'Save sections',
  visibility: 'Save visibility',
};

function formatVisibilityKey(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

const SECTION_LABELS: Record<'whoWeAre', string> = {
  whoWeAre: 'Who we are',
};

const HOMEPAGE_SUBNAV_GROUPS = [
  {
    label: 'Content',
    items: [
      { id: 'hero', label: 'Hero', icon: Sparkles },
      { id: 'stats', label: 'Stats', icon: BarChart3 },
      { id: 'showcase', label: 'Showcase', icon: Target },
      { id: 'perks', label: 'Perks', icon: Users },
      { id: 'sections', label: 'Sections', icon: Type },
    ],
  },
  {
    label: 'Publish',
    items: [
      { id: 'visibility', label: 'Visibility', icon: Layout },
      { id: 'seo', label: 'SEO', icon: Globe },
    ],
  },
];

export const PageEditor: React.FC = () => {
  const {
    sourceData,
    updateHero,
    updateStats,
    updatePillars,
    updatePerks,
    updateSettings,
    setPreview,
    isPreviewVisible,
  } = useWebsiteData();
  const [activeTab, setActiveTab] = useState<
    'hero' | 'stats' | 'showcase' | 'perks' | 'sections' | 'visibility' | 'seo'
  >('hero');
  const [isSaving, setIsSaving] = useState(false);

  const [heroForm, setHeroForm] = useState(sourceData.hero);
  const [statsForm, setStatsForm] = useState(sourceData.stats);
  const [pillarsForm, setPillarsForm] = useState(sourceData.pillars);
  const [perksForm, setPerksForm] = useState(sourceData.perks);
  const [sectionsForm, setSectionsForm] = useState(sourceData.settings.sections ?? {});
  const [visibilityForm, setVisibilityForm] = useState(sourceData.settings.visibility);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [panelSave, setPanelSave] = useState<WorkspaceSaveConfig | null>(null);

  useEffect(() => {
    setSectionsForm(sourceData.settings.sections ?? {});
  }, [sourceData.settings.sections]);

  useEffect(() => {
    const homepage = sourceData.settings.homepage;
    if (!homepage) return;
    setHeroForm(homepage.hero);
    setStatsForm(homepage.stats);
    setPillarsForm(homepage.pillars);
    setPerksForm(homepage.perks);
  }, [sourceData.settings.homepage]);

  useEffect(() => {
    if (!isPreviewVisible) {
      setPreview(null);
      return;
    }
    setPreview({
      hero: heroForm,
      stats: statsForm,
      pillars: pillarsForm,
      perks: perksForm,
      settings: {
        sections: sectionsForm,
        visibility: visibilityForm,
      } as WebsiteData['settings'],
    });
    return () => setPreview(null);
  }, [
    heroForm,
    statsForm,
    pillarsForm,
    perksForm,
    sectionsForm,
    visibilityForm,
    isPreviewVisible,
    setPreview,
  ]);

  const handleSave = async (type: string) => {
    setIsSaving(true);
    try {
      if (type === 'hero') await updateHero(heroForm);
      if (type === 'stats') await updateStats(statsForm);
      if (type === 'pillars') await updatePillars(pillarsForm);
      if (type === 'perks') await updatePerks(perksForm);
      if (type === 'visibility') {
        const { community: _community, ...visibility } = visibilityForm as typeof visibilityForm & {
          community?: boolean;
        };
        await updateSettings({ ...sourceData.settings, visibility });
      }
      if (type === 'sections') {
        const { community: _community, ...sections } = (sectionsForm ?? {}) as NonNullable<
          typeof sectionsForm
        > & { community?: unknown };
        await updateSettings({ ...sourceData.settings, sections });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const headerSave =
    activeTab === 'seo' && panelSave ? (
      <AdminHeaderSave
        label={panelSave.label}
        saving={panelSave.saving}
        onClick={panelSave.onSave}
      />
    ) : activeTab !== 'seo' ? (
      <AdminHeaderSave
        label={TAB_SAVE_LABELS[activeTab]}
        saving={isSaving}
        onClick={() => handleSave(activeTab)}
      />
    ) : undefined;

  useApplyPendingAdminSection('/admin/homepage', (id) =>
    setActiveTab(id as typeof activeTab),
  );

  return (
    <AdminWorkspaceShell
      isPreviewVisible={isPreviewVisible}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      toolbar={
        <AdminPageIntro
          className="mb-0"
          eyebrow="Pages"
          title="Book page"
          lede="Marketing page at /home — hero, stats, showcase, perks, section copy, visibility, and SEO."
        />
      }
      subnav={{
        groups: HOMEPAGE_SUBNAV_GROUPS,
        title: 'Book page',
        activeId: activeTab,
        onSelect: (id) => setActiveTab(id as typeof activeTab),
      }}
      tabIntro={HOMEPAGE_TAB_INTROS[activeTab]}
      headerAction={headerSave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === 'hero' && (
            <>
              <AdminFormSection
                title="Tagline & CTAs"
                description="Eyebrow text and button labels above the fold."
              >
                <AdminField label="Eyebrow / tagline">
                  <AdminInput
                    value={heroForm.tagline}
                    onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
                  />
                </AdminField>
                <AdminField label="Primary CTA label">
                  <AdminInput
                    value={heroForm.primaryCtaLabel ?? ''}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, primaryCtaLabel: e.target.value })
                    }
                  />
                </AdminField>
              </AdminFormSection>

              <AdminFormSection title="Headline" description="Main hero title and accent line.">
                <AdminField label="Headline">
                  <AdminTextarea
                    rows={3}
                    value={heroForm.headline}
                    onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                    placeholder="The Art of building AI Products"
                  />
                </AdminField>
                <AdminField label="Headline accent">
                  <AdminInput
                    value={heroForm.headlineAccent}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, headlineAccent: e.target.value })
                    }
                    placeholder="-Agentic AI"
                  />
                </AdminField>
                <AdminField label="Summary">
                  <AdminTextarea
                    rows={4}
                    value={heroForm.subtitle}
                    onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                  />
                </AdminField>
              </AdminFormSection>

              <AdminFormSection title="Video" description="Optional YouTube embed beside the hero.">
                <AdminField
                  label="YouTube embed URL"
                  hint="Use an embed URL (youtube.com/embed/…), not a watch link."
                >
                  <AdminInput
                    value={heroForm.videoUrl}
                    onChange={(e) => setHeroForm({ ...heroForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/…"
                    className="font-mono text-sm"
                  />
                </AdminField>
              </AdminFormSection>

            </>
          )}

          {activeTab === 'visibility' && (
            <>
              <AdminFormSection
                title="Section visibility"
                description="Toggle which blocks appear on the /home marketing page."
              >
                <div className="admin-list-editor">
                  {Object.entries(visibilityForm)
                    .filter(([key]) => key !== 'community')
                    .map(([key, value]) => (
                    <div key={key} className="admin-list-editor__row">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center border shrink-0',
                            value
                              ? 'bg-[color-mix(in_srgb,var(--admin-primary)_8%,white)] border-[color-mix(in_srgb,var(--admin-primary)_25%,var(--admin-border))] text-[var(--admin-primary)]'
                              : 'bg-[var(--admin-surface-muted)] border-[var(--admin-border)] text-[var(--admin-text-subtle)]',
                          )}
                        >
                          {value ? (
                            <Eye className="w-4 h-4" aria-hidden />
                          ) : (
                            <EyeOff className="w-4 h-4" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--admin-text)] m-0">
                            {formatVisibilityKey(key)}
                          </p>
                          <p className="admin-field__hint m-0">
                            {value ? 'Visible on /home' : 'Hidden from /home'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Toggle ${formatVisibilityKey(key)}`}
                        onClick={() =>
                          setVisibilityForm({
                            ...visibilityForm,
                            [key]: !value,
                          } as typeof visibilityForm)
                        }
                        aria-pressed={value}
                        className={cn('admin-toggle', value && 'admin-toggle--on')}
                      >
                        <span className="admin-toggle__knob" aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              </AdminFormSection>
            </>
          )}

          {activeTab === 'seo' && <HomepageSeoPanel onSaveReady={setPanelSave} />}

          {activeTab === 'stats' && (
            <>
              <AdminFormSection
                title="Metrics"
                description="Values and labels in the stats row below the hero."
              >
                <div className="admin-list-editor">
                  {statsForm.map((stat, index) => (
                    <div key={stat.id} className="admin-list-editor__row !items-start">
                      <div className="admin-list-editor__fields">
                        <p className="text-[var(--admin-type-caption)] font-semibold text-[var(--admin-text-subtle)] uppercase tracking-wide m-0 mb-2">
                          Metric {index + 1}
                        </p>
                        <AdminFieldGrid columns={2}>
                          <AdminField label="Value">
                            <AdminInput
                              value={stat.value}
                              onChange={(e) => {
                                const newStats = [...statsForm];
                                newStats[index].value = e.target.value;
                                setStatsForm(newStats);
                              }}
                              className="font-mono"
                            />
                          </AdminField>
                          <AdminField label="Label">
                            <AdminInput
                              value={stat.label}
                              onChange={(e) => {
                                const newStats = [...statsForm];
                                newStats[index].label = e.target.value;
                                setStatsForm(newStats);
                              }}
                            />
                          </AdminField>
                        </AdminFieldGrid>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminFormSection>
            </>
          )}

          {activeTab === 'showcase' && (
            <>
              <AdminFormSection
                title="Showcase pillars"
                description="Book showcase cards — icon, copy, and terminal prompt."
                action={
                  <AdminButton
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setPillarsForm([
                        ...pillarsForm,
                        {
                          id: Math.random().toString(),
                          iconName: 'Database',
                          title: 'New pillar',
                          description: 'Description here',
                          prompt: 'Prompt here',
                          color: 'text-blue-500',
                        },
                      ])
                    }
                  >
                    <Plus className="w-4 h-4" />
                    Add pillar
                  </AdminButton>
                }
              >
                <div className="admin-list-editor">
                  {pillarsForm.map((pillar, index) => (
                    <div key={pillar.id} className="admin-list-editor__row !items-start">
                      <div className="admin-list-editor__fields">
                        <AdminFieldGrid columns={2}>
                          <AdminField label="Icon">
                            <select
                              value={pillar.iconName}
                              onChange={(e) => {
                                const newPillars = [...pillarsForm];
                                newPillars[index].iconName = e.target.value as (typeof pillar)['iconName'];
                                setPillarsForm(newPillars);
                              }}
                              className="admin-input"
                            >
                              {Object.keys(pillarIcons).map((icon) => (
                                <option key={icon} value={icon}>
                                  {icon}
                                </option>
                              ))}
                            </select>
                          </AdminField>
                          <AdminField label="Color class">
                            <AdminInput
                              value={pillar.color}
                              onChange={(e) => {
                                const newPillars = [...pillarsForm];
                                newPillars[index].color = e.target.value;
                                setPillarsForm(newPillars);
                              }}
                              placeholder="text-blue-500"
                            />
                          </AdminField>
                        </AdminFieldGrid>
                        <AdminField label="Title">
                          <AdminInput
                            value={pillar.title}
                            onChange={(e) => {
                              const newPillars = [...pillarsForm];
                              newPillars[index].title = e.target.value;
                              setPillarsForm(newPillars);
                            }}
                          />
                        </AdminField>
                        <AdminField label="Description">
                          <AdminTextarea
                            rows={2}
                            value={pillar.description}
                            onChange={(e) => {
                              const newPillars = [...pillarsForm];
                              newPillars[index].description = e.target.value;
                              setPillarsForm(newPillars);
                            }}
                          />
                        </AdminField>
                        <AdminField label="Terminal prompt">
                          <AdminInput
                            value={pillar.prompt}
                            onChange={(e) => {
                              const newPillars = [...pillarsForm];
                              newPillars[index].prompt = e.target.value;
                              setPillarsForm(newPillars);
                            }}
                            className="font-mono text-sm"
                          />
                        </AdminField>
                      </div>
                      <AdminButton
                        type="button"
                        variant="danger"
                        className="admin-list-editor__remove"
                        aria-label="Remove pillar"
                        onClick={() => setPillarsForm(pillarsForm.filter((p) => p.id !== pillar.id))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </AdminButton>
                    </div>
                  ))}
                </div>
              </AdminFormSection>
            </>
          )}

          {activeTab === 'sections' && (
            <>
              <FinalCtaFields
                value={sectionsForm?.finalCta}
                onChange={(next) =>
                  setSectionsForm({
                    ...sectionsForm,
                    finalCta: next,
                  })
                }
              />
              {(['whoWeAre'] as const).map((key) => (
                <SectionCopyFields
                  key={key}
                  title={SECTION_LABELS[key]}
                  showCta={false}
                  value={sectionsForm?.[key]}
                  onChange={(next) =>
                    setSectionsForm({
                      ...sectionsForm,
                      [key]: next,
                    })
                  }
                />
              ))}
            </>
          )}

          {activeTab === 'perks' && (
            <>
              <AdminFormSection
                title="Perk cards"
                description="Feature cards in the homepage perks section."
                action={
                  <AdminButton
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setPerksForm([
                        ...perksForm,
                        {
                          id: Math.random().toString(),
                          iconName: 'Zap',
                          title: 'New perk',
                          label: 'LABEL',
                          description: 'Description',
                        },
                      ])
                    }
                  >
                    <Plus className="w-4 h-4" />
                    Add perk
                  </AdminButton>
                }
              >
                <div className="admin-list-editor">
                  {perksForm.map((perk, index) => (
                    <div key={perk.id} className="admin-list-editor__row !items-start">
                      <div className="admin-list-editor__fields">
                        <AdminFieldGrid columns={2}>
                          <AdminField label="Icon">
                            <select
                              value={perk.iconName}
                              onChange={(e) => {
                                const newPerks = [...perksForm];
                                newPerks[index].iconName = e.target.value as (typeof perk)['iconName'];
                                setPerksForm(newPerks);
                              }}
                              className="admin-input"
                            >
                              {Object.keys(perkIcons).map((icon) => (
                                <option key={icon} value={icon}>
                                  {icon}
                                </option>
                              ))}
                            </select>
                          </AdminField>
                          <AdminField label="Accent label">
                            <AdminInput
                              value={perk.label}
                              onChange={(e) => {
                                const newPerks = [...perksForm];
                                newPerks[index].label = e.target.value;
                                setPerksForm(newPerks);
                              }}
                            />
                          </AdminField>
                        </AdminFieldGrid>
                        <AdminField label="Headline">
                          <AdminInput
                            value={perk.title}
                            onChange={(e) => {
                              const newPerks = [...perksForm];
                              newPerks[index].title = e.target.value;
                              setPerksForm(newPerks);
                            }}
                          />
                        </AdminField>
                        <AdminField label="Description">
                          <AdminTextarea
                            rows={2}
                            value={perk.description}
                            onChange={(e) => {
                              const newPerks = [...perksForm];
                              newPerks[index].description = e.target.value;
                              setPerksForm(newPerks);
                            }}
                          />
                        </AdminField>
                      </div>
                      <AdminButton
                        type="button"
                        variant="danger"
                        className="admin-list-editor__remove"
                        aria-label="Remove perk"
                        onClick={() => setPerksForm(perksForm.filter((p) => p.id !== perk.id))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </AdminButton>
                    </div>
                  ))}
                </div>
              </AdminFormSection>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </AdminWorkspaceShell>
  );
};

/** @deprecated Use PageEditor — kept for imports during transition */
export const HomepageEditor = PageEditor;
