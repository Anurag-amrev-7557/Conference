import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { LivePreview } from './LivePreview';
import { Palette, Type, Box, Check, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
  AdminField,
  AdminFormSection,
  AdminHeaderSave,
  AdminInput,
  AdminPageIntro,
  AdminPanelTabIntro,
  AdminSubnav,
} from './admin-ui';
import { MediaUrlField } from './MediaUrlField';
import { CONFERENCE_HERO_LOGO } from '../../lib/conferenceDefaults';
import { useAdminWorkspaceNavRegistry, useApplyPendingAdminSection } from './admin-workspace-nav';

const DESIGN_SUBNAV_GROUPS = [
  {
    label: 'Visual',
    items: [
      { id: 'colors', label: 'Palette', icon: Palette },
      { id: 'typography', label: 'Typography', icon: Type },
      { id: 'tokens', label: 'Theme', icon: Box },
    ],
  },
  {
    label: 'Identity',
    items: [{ id: 'branding', label: 'Brand', icon: Layers }],
  },
];

const TAB_INTROS: Record<
  'colors' | 'typography' | 'tokens' | 'branding',
  { title: string; description: string }
> = {
  colors: {
    title: 'Palette',
    description: 'Primary brand color for buttons, links, accents, and focus states across the site.',
  },
  typography: {
    title: 'Typography',
    description: 'Heading and body font families applied to the public marketing site.',
  },
  tokens: {
    title: 'Theme',
    description: 'Global UI tokens — corner radius and shadow depth for cards and surfaces.',
  },
  branding: {
    title: 'Brand',
    description: 'Display name and navbar logo shown across the public site.',
  },
};

const COLOR_PRESETS = [
  '#003E99',
  '#0052cc',
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#111111',
  '#555555',
];

const HEADING_FONTS = [
  { id: 'serif' as const, label: 'Instrument Serif', sample: 'Editorial Excellence' },
  { id: 'sans' as const, label: 'Plus Jakarta Sans', sample: 'Modern clarity' },
  { id: 'mono' as const, label: 'JetBrains Mono', sample: 'Technical precision' },
];

export const DesignSystemManager: React.FC = () => {
  const { sourceData, updateAppearance, setPreview, isPreviewVisible } = useWebsiteData();
  const [activePanel, setActivePanel] = useState<'colors' | 'typography' | 'tokens' | 'branding'>(
    'colors',
  );
  const [form, setForm] = useState(sourceData.appearance);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const appearanceSyncKey = JSON.stringify(sourceData.appearance);
  useEffect(() => {
    setForm(sourceData.appearance);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when persisted appearance changes
  }, [appearanceSyncKey]);

  useEffect(() => {
    if (!isPreviewVisible) {
      setPreview(null);
      return;
    }
    setPreview({ appearance: form });
    return () => setPreview(null);
  }, [form, isPreviewVisible, setPreview]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAppearance(form);
    } finally {
      setIsSaving(false);
    }
  };

  useAdminWorkspaceNavRegistry({
    groups: DESIGN_SUBNAV_GROUPS,
    activeId: activePanel,
    onSelect: (id) => setActivePanel(id as typeof activePanel),
  });

  useApplyPendingAdminSection('/admin/design', (id) =>
    setActivePanel(id as typeof activePanel),
  );

  const editorColumn = (
    <div
      className={cn(
        'flex flex-col min-h-0 overflow-hidden bg-[var(--admin-surface)]',
        isPreviewVisible ? 'w-[520px] shrink-0 border-r border-[var(--admin-border)]' : 'flex-1 admin-page-workspace',
      )}
    >
      <div className={cn('admin-toolbar shrink-0', isPreviewVisible && 'admin-toolbar--compact')}>
        <div className="admin-toolbar__content">
          <AdminPageIntro
            className="mb-0"
            eyebrow="Site"
            title="Brand & theme"
            lede={
              isPreviewVisible
                ? 'Live preview updates as you edit.'
                : 'Colors, typography, theme tokens, and brand identity for the public site.'
            }
          />
        </div>
        <div className="admin-toolbar__actions">
          <AdminHeaderSave
            label="Save brand & theme"
            saving={isSaving}
            onClick={handleSave}
          />
        </div>
      </div>

      <div className="admin-page-editor flex flex-1 min-h-0">
        <AdminSubnav
          className="admin-subnav--desktop-only"
          groups={DESIGN_SUBNAV_GROUPS}
          title="Brand & theme"
          activeId={activePanel}
          onSelect={(id) => setActivePanel(id as typeof activePanel)}
        />

        <div className="admin-panel-body flex-1 min-h-0 overflow-y-auto">
          <div className="admin-panel-body__inner">
            <AdminPanelTabIntro
              title={TAB_INTROS[activePanel].title}
              description={TAB_INTROS[activePanel].description}
            />

            <div className="admin-form-stack">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {activePanel === 'colors' && (
                    <>
                      <AdminFormSection
                        title="Primary color"
                        description="Pick a preset or enter a custom hex value."
                      >
                        <div className="admin-color-grid">
                          {COLOR_PRESETS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setForm({ ...form, primaryColor: color })}
                              className={cn(
                                'admin-color-swatch',
                                form.primaryColor.toLowerCase() === color.toLowerCase() &&
                                  'admin-color-swatch--active',
                              )}
                              style={{ backgroundColor: color }}
                              aria-label={`Use ${color}`}
                            >
                              {form.primaryColor.toLowerCase() === color.toLowerCase() && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <Check className="w-5 h-5 text-white drop-shadow" aria-hidden />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <AdminField label="Custom hex" className="!mb-0 mt-4">
                          <AdminInput
                            value={form.primaryColor}
                            onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                            placeholder="#0052cc"
                            className="font-mono text-sm max-w-xs"
                          />
                        </AdminField>
                      </AdminFormSection>
                    </>
                  )}

                  {activePanel === 'typography' && (
                    <>
                      <AdminFormSection
                        title="Heading font"
                        description="Used for page titles and section headlines."
                      >
                        <div className="admin-choice-list">
                          {HEADING_FONTS.map((font) => (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() =>
                                setForm({
                                  ...form,
                                  typography: { ...form.typography, headingFont: font.id },
                                })
                              }
                              className={cn(
                                'admin-choice-list__item',
                                form.typography.headingFont === font.id &&
                                  'admin-choice-list__item--active',
                              )}
                            >
                              <p className="admin-choice-list__meta">{font.label}</p>
                              <p
                                className="admin-choice-list__sample"
                                style={{
                                  fontFamily:
                                    font.id === 'serif'
                                      ? 'var(--font-serif, Georgia, serif)'
                                      : font.id === 'mono'
                                        ? 'ui-monospace, monospace'
                                        : 'var(--font-sans)',
                                }}
                              >
                                {font.sample}
                              </p>
                              {form.typography.headingFont === font.id && (
                                <Check
                                  className="w-4 h-4 text-[var(--admin-primary)] absolute top-5 right-5"
                                  aria-hidden
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </AdminFormSection>

                      <AdminFormSection title="Body font" description="Paragraph and UI copy.">
                        <AdminField label="Body typeface">
                          <select
                            value={form.typography.bodyFont}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                typography: {
                                  ...form.typography,
                                  bodyFont: e.target.value as 'serif' | 'sans' | 'mono',
                                },
                              })
                            }
                            className="admin-input"
                          >
                            <option value="sans">Sans-serif (Plus Jakarta)</option>
                            <option value="serif">Serif (Instrument)</option>
                            <option value="mono">Monospace (JetBrains)</option>
                          </select>
                        </AdminField>
                        <AdminField label="Base text size">
                          <div className="admin-segmented">
                            {(['small', 'medium', 'large'] as const).map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    typography: { ...form.typography, baseSize: size },
                                  })
                                }
                                className={cn(
                                  'admin-segmented__item',
                                  form.typography.baseSize === size && 'admin-segmented__item--active',
                                )}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </AdminField>
                      </AdminFormSection>
                    </>
                  )}

                  {activePanel === 'tokens' && (
                    <>
                      <AdminFormSection title="Corner radius" description="Roundness of buttons and cards.">
                        <div className="admin-segmented max-w-md">
                          {(['none', 'sm', 'md', 'lg', 'full'] as const).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() =>
                                setForm({ ...form, theme: { ...form.theme, borderRadius: r } })
                              }
                              className={cn(
                                'admin-segmented__item',
                                form.theme.borderRadius === r && 'admin-segmented__item--active',
                              )}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </AdminFormSection>

                      <AdminFormSection title="Shadow depth" description="Elevation on cards and panels.">
                        <div className="admin-shadow-picker">
                          {(['none', 'soft', 'heavy'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                setForm({
                                  ...form,
                                  theme: { ...form.theme, shadowIntensity: s },
                                })
                              }
                              className={cn(
                                'admin-shadow-picker__item',
                                form.theme.shadowIntensity === s && 'admin-shadow-picker__item--active',
                              )}
                            >
                              <div
                                className={cn(
                                  'admin-shadow-picker__preview',
                                  s === 'soft' && 'shadow-md',
                                  s === 'heavy' && 'shadow-xl',
                                )}
                              >
                                <Box
                                  className={cn(
                                    'w-4 h-4',
                                    form.theme.shadowIntensity === s
                                      ? 'text-[var(--admin-primary)]'
                                      : 'text-[var(--admin-text-subtle)]',
                                  )}
                                  aria-hidden
                                />
                              </div>
                              <p className="admin-shadow-picker__label">{s}</p>
                            </button>
                          ))}
                        </div>
                      </AdminFormSection>

                      <AdminFormSection title="Button style" description="Default button treatment.">
                        <div className="admin-segmented max-w-md">
                          {(['flat', 'outline', 'glass'] as const).map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() =>
                                setForm({
                                  ...form,
                                  theme: { ...form.theme, buttonStyle: style },
                                })
                              }
                              className={cn(
                                'admin-segmented__item',
                                form.theme.buttonStyle === style && 'admin-segmented__item--active',
                              )}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </AdminFormSection>
                    </>
                  )}

                  {activePanel === 'branding' && (
                    <>
                      <AdminFormSection
                        title="Brand identity"
                        description="Shown in the navbar, footer, and browser tab context."
                      >
                        <AdminField label="Brand name">
                          <AdminInput
                            value={form.brandName}
                            onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                            placeholder="Superhumanly AI"
                          />
                        </AdminField>
                        <MediaUrlField
                          label="Navbar logo"
                          value={form.brandLogoUrl ?? ''}
                          onChange={(url) => setForm({ ...form, brandLogoUrl: url })}
                          hint={`PNG/WebP with transparent background. Default: ${CONFERENCE_HERO_LOGO}`}
                        />
                        <AdminField
                          label="Legacy logo mark (fallback)"
                          hint="Used only when no logo image is set — one or two characters."
                        >
                          <AdminInput
                            value={form.brandLogoText}
                            onChange={(e) => setForm({ ...form, brandLogoText: e.target.value })}
                            maxLength={2}
                            className="max-w-[5.5rem] text-center font-semibold"
                          />
                        </AdminField>
                      </AdminFormSection>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-workspace flex h-full w-full overflow-hidden">
      <motion.div
        layout
        animate={{
          width: isPreviewVisible ? (isSidebarCollapsed ? 0 : 520) : '100%',
          opacity: isSidebarCollapsed && isPreviewVisible ? 0 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'flex min-h-0 overflow-hidden',
          isPreviewVisible ? 'shrink-0' : 'flex-1 w-full min-w-0',
        )}
      >
        {editorColumn}
      </motion.div>

      <AnimatePresence>
        {isPreviewVisible && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 min-w-0 overflow-hidden flex flex-col bg-[var(--admin-surface)]"
          >
            <LivePreview
              onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
