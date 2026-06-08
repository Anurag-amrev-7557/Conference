import React, { useState, useEffect, useCallback } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { Palette, Type, Box, Layers, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AdminEditorField,
  AdminEditorInput,
  AdminEditorSection,
  AdminEditorSubsection,
  AdminEditorFields,
  editorSaveStatusFrom,
} from './admin-editor-ui';
import {
  AdminButton,
  AdminHeaderSave,
  AdminPageIntro,
} from './admin-ui';
import { MediaUrlField } from './MediaUrlField';
import { useApplyPendingAdminSection } from './admin-workspace-nav';
import { AdminWorkspaceShell } from './AdminWorkspaceShell';
import { DESIGN_TAB_INTROS } from './workspaceTabIntros';
import { ColorPicker } from './ui';
import { useFormHistory, useRegisterUndoRedo } from './providers/UndoRedoProvider';
import { useAutosave } from './providers/AutosaveProvider';
import { useToast } from './ui/Toast';
import { cn } from '../../lib/utils';

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

const TAB_INTROS = DESIGN_TAB_INTROS;

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
  const { sourceData, updateAppearance } = useWebsiteData();
  const [activePanel, setActivePanel] = useState<'colors' | 'typography' | 'tokens' | 'branding'>(
    'colors',
  );
  const formHistory = useFormHistory(sourceData.appearance);
  const form = formHistory.value;
  const setForm = formHistory.setValue;
  const [isSaving, setIsSaving] = useState(false);
  const { registerSaveHandler, markUnsaved, setStatus } = useAutosave();
  const { toast } = useToast();
  const isDirty = JSON.stringify(form) !== JSON.stringify(sourceData.appearance);

  const appearanceSyncKey = JSON.stringify(sourceData.appearance);
  useEffect(() => {
    formHistory.reset(sourceData.appearance);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when persisted appearance changes
  }, [appearanceSyncKey]);

  useRegisterUndoRedo({
    undo: formHistory.undo,
    redo: formHistory.redo,
    canUndo: formHistory.canUndo,
    canRedo: formHistory.canRedo,
  });

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateAppearance(form);
      setStatus('saved');
      toast({ variant: 'success', title: 'Brand & theme saved' });
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Save failed',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }, [form, updateAppearance, setStatus, toast]);

  useEffect(() => {
    registerSaveHandler(handleSave);
    return () => registerSaveHandler(null);
  }, [handleSave, registerSaveHandler]);

  useEffect(() => {
    if (JSON.stringify(form) !== JSON.stringify(sourceData.appearance)) {
      markUnsaved();
    }
  }, [form, sourceData.appearance, markUnsaved]);

  useApplyPendingAdminSection('/admin/design', (id) =>
    setActivePanel(id as typeof activePanel),
  );

  return (
    <AdminWorkspaceShell
      editorClassName="admin-book-page"
      contentEditor
      toolbar={
        <AdminPageIntro
          compact
          className="mb-0"
          lede="Colors, typography, theme tokens, and brand identity."
        />
      }
      editorHeaderAside={undefined}
      headerAction={
        <>
          <Link to="/home" target="_blank" rel="noopener noreferrer" className="inline-flex">
            <AdminButton variant="secondary" className="shrink-0">
              View site
              <ExternalLink className="w-4 h-4" />
            </AdminButton>
          </Link>
          <AdminHeaderSave
            label="Save brand & theme"
            saving={isSaving}
            onClick={() => void handleSave()}
          />
        </>
      }
      subnav={{
        groups: DESIGN_SUBNAV_GROUPS,
        title: 'Brand & theme',
        activeId: activePanel,
        onSelect: (id) => setActivePanel(id as typeof activePanel),
        pageId: 'design',
      }}
      editorHeader={TAB_INTROS[activePanel]}
      saveStatus={editorSaveStatusFrom(isSaving, isDirty)}
    >
                  {activePanel === 'colors' && (
                    <AdminEditorSection
                      icon={Palette}
                      title="Primary color"
                      description="Pick a preset or enter a custom hex value."
                    >
                      <ColorPicker
                        value={form.primaryColor}
                        onChange={(primaryColor) => setForm({ ...form, primaryColor })}
                        presets={COLOR_PRESETS}
                      />
                    </AdminEditorSection>
                  )}

                  {activePanel === 'typography' && (
                    <>
                      <AdminEditorSection
                        icon={Type}
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
                      </AdminEditorSection>

                      <AdminEditorSection icon={Type} title="Body font" description="Paragraph and UI copy.">
                        <AdminEditorField label="Body typeface">
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
                            className="admin-editor-input"
                          >
                            <option value="sans">Sans-serif (Plus Jakarta)</option>
                            <option value="serif">Serif (Instrument)</option>
                            <option value="mono">Monospace (JetBrains)</option>
                          </select>
                        </AdminEditorField>
                        <AdminEditorField label="Base text size">
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
                        </AdminEditorField>
                      </AdminEditorSection>
                    </>
                  )}

                  {activePanel === 'tokens' && (
                    <>
                      <AdminEditorSection icon={Box} title="Corner radius" description="Roundness of buttons and cards.">
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
                      </AdminEditorSection>

                      <AdminEditorSection icon={Box} title="Shadow depth" description="Elevation on cards and panels.">
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
                      </AdminEditorSection>

                      <AdminEditorSection icon={Box} title="Button style" description="Default button treatment.">
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
                      </AdminEditorSection>
                    </>
                  )}

                  {activePanel === 'branding' && (
                    <AdminEditorFields className="admin-editor-fields--readable">
                      <AdminEditorSubsection
                        title="Site name & logo"
                        description="Shown in the navbar, footer, and browser tab context."
                      >
                        <AdminEditorField label="Brand name">
                          <AdminEditorInput
                            value={form.brandName}
                            onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                            placeholder="Superhumanly AI"
                          />
                        </AdminEditorField>
                        <MediaUrlField
                          editor
                          label="Navbar logo"
                          value={form.brandLogoUrl ?? ''}
                          onChange={(url) => setForm({ ...form, brandLogoUrl: url })}
                          hint="Summit mark (robot head). Default: /media/superhumanly-logo.png — same as conference hero."
                        />
                      </AdminEditorSubsection>
                      <AdminEditorSubsection
                        title="Fallback mark"
                        description="Used only when no logo image is set — one or two characters."
                      >
                        <AdminEditorField label="Legacy logo mark">
                          <AdminEditorInput
                            value={form.brandLogoText}
                            onChange={(e) => setForm({ ...form, brandLogoText: e.target.value })}
                            maxLength={2}
                            className="admin-editor-field--compact text-center font-semibold"
                          />
                        </AdminEditorField>
                      </AdminEditorSubsection>
                    </AdminEditorFields>
                  )}
    </AdminWorkspaceShell>
  );
};
