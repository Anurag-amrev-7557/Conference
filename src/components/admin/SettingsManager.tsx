import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { LivePreview } from './LivePreview';
import {
  Plus,
  Trash2,
  Search,
  Navigation,
  FileCode,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { OgImageUpload } from './OgImageUpload';
import {
  AdminButton,
  AdminField,
  AdminFieldGrid,
  AdminFormSection,
  AdminHeaderSave,
  AdminInput,
  AdminPageIntro,
  AdminPanelTabIntro,
  AdminSubnav,
  AdminTextarea,
} from './admin-ui';
import { useAdminWorkspaceNavRegistry, useApplyPendingAdminSection } from './admin-workspace-nav';

const SETTINGS_SUBNAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { id: 'seo', label: 'SEO', icon: Search },
      { id: 'navigation', label: 'Navigation', icon: Navigation },
      { id: 'advanced', label: 'Advanced', icon: FileCode },
    ],
  },
];

const TAB_INTROS: Record<'seo' | 'navigation' | 'advanced', { title: string; description: string }> = {
  seo: {
    title: 'SEO',
    description:
      'Default title, description, and share metadata for the whole site. Individual pages can override these in their workspace.',
  },
  navigation: {
    title: 'Navigation',
    description: 'Header call-to-action, primary menu links, footer links, and social profile URLs.',
  },
  advanced: {
    title: 'Advanced',
    description: 'Global CSS overrides and script tags injected into every public page.',
  },
};

export const SettingsManager: React.FC = () => {
  const { sourceData, updateSettings, setPreview, isPreviewVisible } = useWebsiteData();
  const [activeTab, setActiveTab] = useState<'seo' | 'navigation' | 'advanced'>('seo');
  const [form, setForm] = useState(sourceData.settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const settingsSyncKey = JSON.stringify(sourceData.settings);
  useEffect(() => {
    setForm(sourceData.settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when persisted settings change, not reference noise
  }, [settingsSyncKey]);

  useEffect(() => {
    if (!isPreviewVisible) {
      setPreview(null);
      return;
    }
    setPreview({ settings: form });
    return () => setPreview(null);
  }, [form, isPreviewVisible, setPreview]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(form);
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

  useAdminWorkspaceNavRegistry({
    groups: SETTINGS_SUBNAV_GROUPS,
    activeId: activeTab,
    onSelect: (id) => setActiveTab(id as typeof activeTab),
  });

  useApplyPendingAdminSection('/admin/settings', (id) =>
    setActiveTab(id as typeof activeTab),
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
            title="Site settings"
            lede={
              isPreviewVisible
                ? 'Global SEO, navigation, and scripts.'
                : 'Global SEO defaults, navigation, book schema, and custom scripts. Page-specific SEO lives in each page workspace.'
            }
          />
        </div>
        <div className="admin-toolbar__actions">
          <AdminHeaderSave
            label={
              activeTab === 'seo'
                ? 'Save SEO'
                : activeTab === 'navigation'
                  ? 'Save navigation'
                  : 'Save advanced'
            }
            saving={isSaving}
            onClick={handleSave}
          />
        </div>
      </div>

      <div className="admin-page-editor flex flex-1 min-h-0">
        <AdminSubnav
          className="admin-subnav--desktop-only"
          groups={SETTINGS_SUBNAV_GROUPS}
          title="Sections"
          activeId={activeTab}
          onSelect={(id) => setActiveTab(id as typeof activeTab)}
        />

        <div className="admin-panel-body flex-1 min-h-0 overflow-y-auto">
          <div className="admin-panel-body__inner">
            <AdminPanelTabIntro
              title={TAB_INTROS[activeTab].title}
              description={TAB_INTROS[activeTab].description}
            />
            <div className="admin-form-stack">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                 >
                   {activeTab === 'seo' && (
                     <>
                       <AdminFormSection
                         title="Search appearance"
                         description="Shown in Google results and browser tabs when a page has no custom title or description."
                       >
                         <AdminField label="Search engine title">
                           <AdminInput
                             value={form.seo.title}
                             onChange={(e) =>
                               setForm({ ...form, seo: { ...form.seo, title: e.target.value } })
                             }
                             placeholder="Superhumanly AI | The Agentic Playbook"
                           />
                         </AdminField>
                         <AdminField label="Meta description">
                           <AdminTextarea
                             rows={4}
                             value={form.seo.description}
                             onChange={(e) =>
                               setForm({ ...form, seo: { ...form.seo, description: e.target.value } })
                             }
                             placeholder="A deep-dive into the future of autonomous agent architecture…"
                           />
                         </AdminField>
                       </AdminFormSection>

                       <AdminFormSection
                         title="Social sharing (Open Graph)"
                         description="Default preview when links are shared on social platforms."
                       >
                         <AdminField
                           label="Default share image"
                           hint="Used when a page has no specific image. Upload resizes to 1200×630 or paste a full HTTPS URL."
                         >
                           <AdminInput
                             value={form.seo.ogImage || ''}
                             onChange={(e) =>
                               setForm({ ...form, seo: { ...form.seo, ogImage: e.target.value } })
                             }
                             placeholder="https://…"
                             className="font-mono text-sm"
                           />
                           <OgImageUpload
                             value={form.seo.ogImage || ''}
                             onChange={(url) =>
                               setForm({ ...form, seo: { ...form.seo, ogImage: url } })
                             }
                             getToken={() => localStorage.getItem('adminToken') || ''}
                           />
                         </AdminField>
                         <AdminFieldGrid columns={3}>
                           <AdminField label="og:site_name">
                             <AdminInput
                               value={form.seo.ogSiteName || ''}
                               onChange={(e) =>
                                 setForm({ ...form, seo: { ...form.seo, ogSiteName: e.target.value } })
                               }
                             />
                           </AdminField>
                           <AdminField label="og:locale">
                             <AdminInput
                               value={form.seo.ogLocale || 'en_US'}
                               onChange={(e) =>
                                 setForm({ ...form, seo: { ...form.seo, ogLocale: e.target.value } })
                               }
                             />
                           </AdminField>
                           <AdminField label="twitter:site">
                             <AdminInput
                               value={form.seo.twitterSite || ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   seo: { ...form.seo, twitterSite: e.target.value },
                                 })
                               }
                               placeholder="@handle"
                             />
                           </AdminField>
                         </AdminFieldGrid>
                       </AdminFormSection>

                       <AdminFormSection
                         title="Google Search Console"
                         description="Site-wide ownership verification meta tag."
                       >
                         <AdminField
                           label="Verification token"
                           hint={
                             <>
                               Paste only the content value from Search Console (not the full{' '}
                               <code>&lt;meta&gt;</code> tag). After saving, rebuild with the API on port
                               3001 so prerender bakes the tag into dist.
                             </>
                           }
                         >
                           <AdminInput
                             value={form.seo.googleSiteVerification || ''}
                             onChange={(e) =>
                               setForm({
                                 ...form,
                                 seo: { ...form.seo, googleSiteVerification: e.target.value },
                               })
                             }
                             placeholder="google-site-verification token"
                             className="font-mono text-sm"
                           />
                         </AdminField>
                       </AdminFormSection>

                       <AdminFormSection
                         title="Book structured data"
                         description="Optional schema.org Book markup for rich results on the homepage."
                       >
                         <AdminField label="Title">
                           <AdminInput
                             value={form.book?.title || ''}
                             onChange={(e) =>
                               setForm({ ...form, book: { ...form.book, title: e.target.value } })
                             }
                             placeholder="Book title"
                           />
                         </AdminField>
                         <AdminField label="Tagline">
                           <AdminInput
                             value={form.book?.tagline || ''}
                             onChange={(e) =>
                               setForm({ ...form, book: { ...form.book, tagline: e.target.value } })
                             }
                             placeholder="Short hook"
                           />
                         </AdminField>
                         <AdminField label="Abstract">
                           <AdminTextarea
                             rows={5}
                             value={form.book?.abstract || ''}
                             onChange={(e) =>
                               setForm({ ...form, book: { ...form.book, abstract: e.target.value } })
                             }
                             placeholder="Use blank lines between paragraphs"
                           />
                         </AdminField>
                         <AdminFieldGrid columns={2}>
                           <AdminField label="Author">
                             <AdminInput
                               value={form.book?.authorName || ''}
                               onChange={(e) =>
                                 setForm({ ...form, book: { ...form.book, authorName: e.target.value } })
                               }
                             />
                           </AdminField>
                           <AdminField label="ISBN-13">
                             <AdminInput
                               value={form.book?.isbn || ''}
                               onChange={(e) =>
                                 setForm({ ...form, book: { ...form.book, isbn: e.target.value } })
                               }
                               className="font-mono text-sm"
                             />
                           </AdminField>
                           <AdminField label="Cover image URL">
                             <AdminInput
                               value={form.book?.coverImageUrl || ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   book: { ...form.book, coverImageUrl: e.target.value },
                                 })
                               }
                               placeholder="https://"
                               className="font-mono text-sm"
                             />
                           </AdminField>
                           <AdminField label="Publisher">
                             <AdminInput
                               value={form.book?.publisherName || ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   book: { ...form.book, publisherName: e.target.value },
                                 })
                               }
                             />
                           </AdminField>
                         </AdminFieldGrid>
                       </AdminFormSection>
                     </>
                   )}

                   {activeTab === 'navigation' && (
                     <>
                       <AdminFormSection
                         title="Header primary CTA"
                         description="Pill button in the site header (desktop) and mobile menu."
                       >
                         <AdminFieldGrid columns={2}>
                           <AdminField label="Button label">
                             <AdminInput
                               value={form.navigation.primaryCta?.label ?? 'Join Now'}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   navigation: {
                                     ...form.navigation,
                                     primaryCta: {
                                       ...form.navigation.primaryCta,
                                       label: e.target.value,
                                       href: form.navigation.primaryCta?.href ?? '/#final-cta',
                                     },
                                   },
                                 })
                               }
                             />
                           </AdminField>
                           <AdminField label="Button URL">
                             <AdminInput
                               value={form.navigation.primaryCta?.href ?? '/#final-cta'}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   navigation: {
                                     ...form.navigation,
                                     primaryCta: {
                                       ...form.navigation.primaryCta,
                                       label: form.navigation.primaryCta?.label ?? 'Join Now',
                                       href: e.target.value,
                                     },
                                   },
                                 })
                               }
                               placeholder="/#final-cta"
                               className="font-mono text-sm"
                             />
                           </AdminField>
                         </AdminFieldGrid>
                       </AdminFormSection>

                       <AdminFormSection
                         title="Header menu links"
                         description="Primary navigation items in the site header."
                         action={
                           <AdminButton
                             variant="secondary"
                             type="button"
                             onClick={() =>
                               setForm({
                                 ...form,
                                 navigation: {
                                   ...form.navigation,
                                   links: [
                                     ...form.navigation.links,
                                     { id: Date.now().toString(), name: 'New Link', href: '#' },
                                   ],
                                 },
                               })
                             }
                           >
                             <Plus className="w-4 h-4" />
                             Add link
                           </AdminButton>
                         }
                       >
                         <div className="admin-list-editor">
                           {form.navigation.links.map((link, idx) => (
                             <div key={link.id} className="admin-list-editor__row">
                               <div className="admin-list-editor__fields">
                                 <AdminField label="Label">
                                   <AdminInput
                                     value={link.name}
                                     onChange={(e) => {
                                       const newLinks = [...form.navigation.links];
                                       newLinks[idx].name = e.target.value;
                                       setForm({
                                         ...form,
                                         navigation: { ...form.navigation, links: newLinks },
                                       });
                                     }}
                                   />
                                 </AdminField>
                                 <AdminField label="URL path">
                                   <AdminInput
                                     value={link.href}
                                     onChange={(e) => {
                                       const newLinks = [...form.navigation.links];
                                       newLinks[idx].href = e.target.value;
                                       setForm({
                                         ...form,
                                         navigation: { ...form.navigation, links: newLinks },
                                       });
                                     }}
                                     className="font-mono text-sm"
                                   />
                                 </AdminField>
                               </div>
                               <AdminButton
                                 variant="danger"
                                 type="button"
                                 className="admin-list-editor__remove"
                                 aria-label="Remove link"
                                 onClick={() =>
                                   setForm({
                                     ...form,
                                     navigation: {
                                       ...form.navigation,
                                       links: form.navigation.links.filter((l) => l.id !== link.id),
                                     },
                                   })
                                 }
                               >
                                 <Trash2 className="w-4 h-4" />
                               </AdminButton>
                             </div>
                           ))}
                         </div>
                       </AdminFormSection>

                       <AdminFormSection
                         title="Footer links"
                         description="Links shown in the global site footer."
                         action={
                           <AdminButton
                             variant="secondary"
                             type="button"
                             onClick={() =>
                               setForm({
                                 ...form,
                                 navigation: {
                                   ...form.navigation,
                                   footerLinks: [
                                     ...(form.navigation.footerLinks || []),
                                     { id: Date.now().toString(), name: 'New Link', href: '#' },
                                   ],
                                 },
                               })
                             }
                           >
                             <Plus className="w-4 h-4" />
                             Add link
                           </AdminButton>
                         }
                       >
                         <div className="admin-list-editor">
                           {(form.navigation.footerLinks || []).map((link, idx) => (
                             <div key={link.id} className="admin-list-editor__row">
                               <div className="admin-list-editor__fields">
                                 <AdminField label="Label">
                                   <AdminInput
                                     value={link.name}
                                     onChange={(e) => {
                                       const newLinks = [...(form.navigation.footerLinks || [])];
                                       newLinks[idx].name = e.target.value;
                                       setForm({
                                         ...form,
                                         navigation: { ...form.navigation, footerLinks: newLinks },
                                       });
                                     }}
                                   />
                                 </AdminField>
                                 <AdminField label="URL path">
                                   <AdminInput
                                     value={link.href}
                                     onChange={(e) => {
                                       const newLinks = [...(form.navigation.footerLinks || [])];
                                       newLinks[idx].href = e.target.value;
                                       setForm({
                                         ...form,
                                         navigation: { ...form.navigation, footerLinks: newLinks },
                                       });
                                     }}
                                     className="font-mono text-sm"
                                   />
                                 </AdminField>
                               </div>
                               <AdminButton
                                 variant="danger"
                                 type="button"
                                 className="admin-list-editor__remove"
                                 aria-label="Remove link"
                                 onClick={() =>
                                   setForm({
                                     ...form,
                                     navigation: {
                                       ...form.navigation,
                                       footerLinks: (form.navigation.footerLinks || []).filter(
                                         (l) => l.id !== link.id,
                                       ),
                                     },
                                   })
                                 }
                               >
                                 <Trash2 className="w-4 h-4" />
                               </AdminButton>
                             </div>
                           ))}
                         </div>
                       </AdminFormSection>

                       <AdminFormSection
                         title="Social profiles"
                         description="Profile URLs linked from the footer and sharing blocks."
                       >
                         <AdminFieldGrid columns={2}>
                           {form.navigation.socials.map((social) => (
                             <AdminField key={social.id} label={social.platform}>
                               <AdminInput
                                 value={social.href}
                                 onChange={(e) => updateSocialLink(social.id, e.target.value)}
                                 className="font-mono text-sm"
                               />
                             </AdminField>
                           ))}
                         </AdminFieldGrid>
                       </AdminFormSection>
                     </>
                   )}

                   {activeTab === 'advanced' && (
                     <>
                       <AdminFormSection
                         title="Custom CSS"
                         description="Injected on every public page after the main stylesheet."
                       >
                         <AdminField label="Global CSS overrides">
                           <AdminTextarea
                             rows={10}
                             value={form.customCss}
                             onChange={(e) => setForm({ ...form, customCss: e.target.value })}
                             placeholder="/* Global overrides */"
                             className="font-mono text-sm bg-slate-900 text-emerald-400 border-slate-700"
                           />
                         </AdminField>
                       </AdminFormSection>

                       <AdminFormSection
                         title="Script tags"
                         description="Raw HTML injected into the document head or before closing body."
                       >
                         <AdminField label="Header scripts">
                           <AdminTextarea
                             rows={4}
                             value={form.scripts.header}
                             onChange={(e) =>
                               setForm({ ...form, scripts: { ...form.scripts, header: e.target.value } })
                             }
                             className="font-mono text-sm"
                           />
                         </AdminField>
                         <AdminField label="Footer scripts">
                           <AdminTextarea
                             rows={4}
                             value={form.scripts.footer}
                             onChange={(e) =>
                               setForm({ ...form, scripts: { ...form.scripts, footer: e.target.value } })
                             }
                             className="font-mono text-sm"
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
