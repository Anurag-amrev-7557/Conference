import React, { useState, useEffect, useCallback } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import {
  Plus,
  Search,
  Navigation,
  FileCode,
  LayoutTemplate,
  History,
  Globe,
  Share2,
  BookOpen,
  MousePointerClick,
  Menu,
  Link2,
  PanelBottom,
  Cookie,
  AlertTriangle,
  Mail,
  Newspaper,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
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
  AdminEditorFields,
  AdminEditorTextarea,
  editorSaveStatusFrom,
} from './admin-editor-ui';
import { useApplyPendingAdminSection } from './admin-workspace-nav';
import { RevisionHistoryPanel } from './RevisionHistoryPanel';
import { DangerZone, NavLinkEditor, Toggle } from './ui';
import { OgImageUpload } from './OgImageUpload';
import { AdminWorkspaceShell } from './AdminWorkspaceShell';
import { SETTINGS_TAB_INTROS } from './workspaceTabIntros';
import { useFormHistory, useRegisterUndoRedo } from './providers/UndoRedoProvider';
import { useAutosave } from './providers/AutosaveProvider';
import { useToast } from './ui/Toast';

const SETTINGS_SUBNAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { id: 'seo', label: 'SEO', icon: Search },
      { id: 'navigation', label: 'Navigation', icon: Navigation },
      { id: 'pages', label: 'Site pages', icon: LayoutTemplate },
      { id: 'advanced', label: 'Advanced', icon: FileCode },
    ],
  },
];

const TAB_INTROS = SETTINGS_TAB_INTROS;

export const SettingsManager: React.FC = () => {
  const { sourceData, updateSettings, refresh } = useWebsiteData();
  const [activeTab, setActiveTab] = useState<'seo' | 'navigation' | 'pages' | 'advanced'>('seo');
  const formHistory = useFormHistory(sourceData.settings);
  const form = formHistory.value;
  const setForm = formHistory.setValue;
  const [isSaving, setIsSaving] = useState(false);
  const { registerSaveHandler, markUnsaved, setStatus } = useAutosave();
  const { toast } = useToast();
  const isDirty = JSON.stringify(form) !== JSON.stringify(sourceData.settings);

  const settingsSyncKey = JSON.stringify(sourceData.settings);
  useEffect(() => {
    formHistory.reset(sourceData.settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when persisted settings change
  }, [settingsSyncKey]);

  useRegisterUndoRedo({
    undo: formHistory.undo,
    redo: formHistory.redo,
    canUndo: formHistory.canUndo,
    canRedo: formHistory.canRedo,
  });

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateSettings(form);
      setStatus('saved');
      toast({ variant: 'success', title: 'Site settings saved' });
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Save failed',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }, [form, updateSettings, setStatus, toast]);

  useEffect(() => {
    registerSaveHandler(handleSave);
    return () => registerSaveHandler(null);
  }, [handleSave, registerSaveHandler]);

  useEffect(() => {
    if (JSON.stringify(form) !== JSON.stringify(sourceData.settings)) {
      markUnsaved();
    }
  }, [form, sourceData.settings, markUnsaved]);

  const updateSocialLink = (id: string, href: string) => {
    setForm({
      ...form,
      navigation: {
        ...form.navigation,
        socials: form.navigation.socials.map(s => s.id === id ? { ...s, href } : s)
      }
    });
  };

  useApplyPendingAdminSection('/admin/settings', (id) =>
    setActiveTab(id as typeof activeTab),
  );

  const saveLabel =
    activeTab === 'seo'
      ? 'Save SEO'
      : activeTab === 'navigation'
        ? 'Save navigation'
        : activeTab === 'pages'
          ? 'Save site pages'
          : 'Save advanced';

  return (
    <AdminWorkspaceShell
      editorClassName="admin-book-page"
      contentEditor
      toolbar={
        <AdminPageIntro
          compact
          className="mb-0"
          lede="Global SEO, navigation, site pages, and custom scripts."
        />
      }
      editorHeaderAside={undefined}
      subnav={{
        groups: SETTINGS_SUBNAV_GROUPS,
        title: 'Site settings',
        activeId: activeTab,
        onSelect: (id) => setActiveTab(id as typeof activeTab),
        pageId: 'settings',
      }}
      editorHeader={TAB_INTROS[activeTab]}
      saveStatus={editorSaveStatusFrom(isSaving, isDirty)}
      headerAction={
        <>
          <Link to="/home" target="_blank" rel="noopener noreferrer" className="inline-flex">
            <AdminButton variant="secondary" className="shrink-0">
              View site
              <ExternalLink className="w-4 h-4" />
            </AdminButton>
          </Link>
          <AdminHeaderSave
            label={saveLabel}
            saving={isSaving}
            onClick={() => void handleSave()}
          />
        </>
      }
    >
                   {activeTab === 'seo' && (
                     <>
                       <AdminEditorSection
                         icon={Globe}
                         title="Search appearance"
                         description="Shown in Google results and browser tabs when a page has no custom title or description."
                       >
                         <AdminEditorSubsection title="Title & description">
                           <AdminEditorFields className="admin-editor-fields--readable">
                             <AdminEditorField label="Search engine title">
                               <AdminEditorInput
                                 value={form.seo.title}
                                 onChange={(e) =>
                                   setForm({ ...form, seo: { ...form.seo, title: e.target.value } })
                                 }
                                 placeholder="Superhumanly AI | The Agentic Playbook"
                               />
                             </AdminEditorField>
                             <AdminEditorField label="Meta description">
                               <AdminEditorTextarea
                                 rows={4}
                                 value={form.seo.description}
                                 onChange={(e) =>
                                   setForm({ ...form, seo: { ...form.seo, description: e.target.value } })
                                 }
                                 placeholder="A deep-dive into the future of autonomous agent architecture…"
                               />
                             </AdminEditorField>
                           </AdminEditorFields>
                         </AdminEditorSubsection>
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={Share2}
                         title="Social sharing (Open Graph)"
                         description="Default preview when links are shared on social platforms."
                       >
                         <AdminEditorSubsection title="Share preview">
                           <AdminEditorFields className="admin-editor-fields--readable">
                             <AdminEditorField
                               label="Default share image"
                               hint="Used when a page has no specific image. Upload resizes to 1200×630 or paste a full HTTPS URL."
                             >
                               <AdminEditorInput
                                 value={form.seo.ogImage || ''}
                                 onChange={(e) =>
                                   setForm({ ...form, seo: { ...form.seo, ogImage: e.target.value } })
                                 }
                                 placeholder="https://…"
                                 className="font-mono text-sm mb-2"
                               />
                               <OgImageUpload
                                 value={form.seo.ogImage || ''}
                                 onChange={(url) =>
                                   setForm({ ...form, seo: { ...form.seo, ogImage: url } })
                                 }
                                 getToken={() => localStorage.getItem('adminToken') || ''}
                               />
                             </AdminEditorField>
                           </AdminEditorFields>
                           <AdminFieldGrid columns={3} className="admin-editor-fields--readable mt-[var(--editor-field-gap)]">
                             <AdminEditorField label="og:site_name">
                               <AdminEditorInput
                                 value={form.seo.ogSiteName || ''}
                                 onChange={(e) =>
                                   setForm({ ...form, seo: { ...form.seo, ogSiteName: e.target.value } })
                                 }
                               />
                             </AdminEditorField>
                             <AdminEditorField label="og:locale">
                               <AdminEditorInput
                                 value={form.seo.ogLocale || 'en_US'}
                                 onChange={(e) =>
                                   setForm({ ...form, seo: { ...form.seo, ogLocale: e.target.value } })
                                 }
                               />
                             </AdminEditorField>
                             <AdminEditorField label="twitter:site">
                               <AdminEditorInput
                                 value={form.seo.twitterSite || ''}
                                 onChange={(e) =>
                                   setForm({
                                     ...form,
                                     seo: { ...form.seo, twitterSite: e.target.value },
                                   })
                                 }
                                 placeholder="@handle"
                               />
                             </AdminEditorField>
                           </AdminFieldGrid>
                         </AdminEditorSubsection>
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={Search}
                         title="Google Search Console"
                         description="Site-wide ownership verification meta tag."
                       >
                         <AdminEditorSubsection title="Verification">
                           <AdminEditorFields className="admin-editor-fields--readable">
                             <AdminEditorField
                               label="Verification token"
                               hint={
                                 <>
                                   Paste only the content value from Search Console (not the full{' '}
                                   <code>&lt;meta&gt;</code> tag). After saving, rebuild with the API on port
                                   3001 so prerender bakes the tag into dist.
                                 </>
                               }
                             >
                               <AdminEditorInput
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
                             </AdminEditorField>
                           </AdminEditorFields>
                         </AdminEditorSubsection>
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={BookOpen}
                         title="Book structured data"
                         description="Optional schema.org Book markup for rich results on the homepage."
                       >
                         <AdminEditorSubsection
                           title="Book metadata"
                           description="Title, author, and cover used in JSON-LD on the homepage."
                         >
                           <AdminEditorFields className="admin-editor-fields--readable">
                             <AdminEditorField label="Title">
                               <AdminEditorInput
                                 value={form.book?.title || ''}
                                 onChange={(e) =>
                                   setForm({ ...form, book: { ...form.book, title: e.target.value } })
                                 }
                                 placeholder="Book title"
                               />
                             </AdminEditorField>
                             <AdminEditorField label="Tagline">
                               <AdminEditorInput
                                 value={form.book?.tagline || ''}
                                 onChange={(e) =>
                                   setForm({ ...form, book: { ...form.book, tagline: e.target.value } })
                                 }
                                 placeholder="Short hook"
                               />
                             </AdminEditorField>
                             <AdminEditorField label="Abstract">
                               <AdminEditorTextarea
                                 rows={5}
                                 value={form.book?.abstract || ''}
                                 onChange={(e) =>
                                   setForm({ ...form, book: { ...form.book, abstract: e.target.value } })
                                 }
                                 placeholder="Use blank lines between paragraphs"
                               />
                             </AdminEditorField>
                             <AdminFieldGrid columns={2}>
                               <AdminEditorField label="Author">
                                 <AdminEditorInput
                                   value={form.book?.authorName || ''}
                                   onChange={(e) =>
                                     setForm({ ...form, book: { ...form.book, authorName: e.target.value } })
                                   }
                                 />
                               </AdminEditorField>
                               <AdminEditorField label="ISBN-13">
                                 <AdminEditorInput
                                   value={form.book?.isbn || ''}
                                   onChange={(e) =>
                                     setForm({ ...form, book: { ...form.book, isbn: e.target.value } })
                                   }
                                   className="font-mono text-sm"
                                 />
                               </AdminEditorField>
                               <AdminEditorField label="Publisher">
                                 <AdminEditorInput
                                   value={form.book?.publisherName || ''}
                                   onChange={(e) =>
                                     setForm({
                                       ...form,
                                       book: { ...form.book, publisherName: e.target.value },
                                     })
                                   }
                                 />
                               </AdminEditorField>
                               <AdminEditorField label="Cover image URL" className="admin-editor-field--wide">
                                 <AdminEditorInput
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
                               </AdminEditorField>
                             </AdminFieldGrid>
                           </AdminEditorFields>
                         </AdminEditorSubsection>
                       </AdminEditorSection>
                     </>
                   )}

                   {activeTab === 'navigation' && (
                     <>
                       <AdminEditorSection
                         icon={Navigation}
                         title="Navbar visibility"
                         description="Hide the global header on all public pages when disabled."
                       >
                         <Toggle
                           label="Show site navbar"
                           checked={form.navigation.navbarVisible !== false}
                           onChange={(checked) =>
                             setForm({
                               ...form,
                               navigation: {
                                 ...form.navigation,
                                 navbarVisible: checked,
                               },
                             })
                           }
                         />
                         <AdminEditorField label="Logo alt text" className="mt-4">
                           <AdminEditorInput
                             value={form.navigation.brandLogoAlt ?? ''}
                             onChange={(e) =>
                               setForm({
                                 ...form,
                                 navigation: {
                                   ...form.navigation,
                                   brandLogoAlt: e.target.value,
                                 },
                               })
                             }
                             placeholder="Superhumanly logo"
                           />
                         </AdminEditorField>
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={MousePointerClick}
                         title="Header primary CTA"
                         description="Pill button in the site header (desktop) and mobile menu."
                       >
                         <AdminFieldGrid columns={2}>
                           <AdminEditorField label="Button label">
                             <AdminEditorInput
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
                           </AdminEditorField>
                           <AdminEditorField label="Button URL">
                             <AdminEditorInput
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
                           </AdminEditorField>
                         </AdminFieldGrid>
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={Menu}
                         title="Header menu links"
                         description="Shown left-to-right in the header in list order. Use /blog, /events, or /speakers for pages; #section-id for homepage anchors; full URLs for external links."
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
                         <NavLinkEditor
                           links={form.navigation.links}
                           onChange={(links) =>
                             setForm({
                               ...form,
                               navigation: { ...form.navigation, links },
                             })
                           }
                           emptyLabel="No header links — add one to build your menu."
                         />
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={Link2}
                         title="Footer links"
                         description="Link column in the footer (order matches the list). Homepage sections work best as /#section-id from any page."
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
                         <NavLinkEditor
                           links={form.navigation.footerLinks || []}
                           onChange={(footerLinks) =>
                             setForm({
                               ...form,
                               navigation: { ...form.navigation, footerLinks },
                             })
                           }
                           emptyLabel="No footer links yet."
                         />
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={Share2}
                         title="Social profiles"
                         description="Icons in the footer Connection column. Leave a URL empty to hide that network."
                       >
                         <AdminFieldGrid columns={2}>
                           {form.navigation.socials.map((social) => (
                             <AdminEditorField key={social.id} label={social.platform}>
                               <AdminEditorInput
                                 value={social.href}
                                 onChange={(e) => updateSocialLink(social.id, e.target.value)}
                                 placeholder="https://"
                                 className="font-mono text-sm"
                               />
                             </AdminEditorField>
                           ))}
                         </AdminFieldGrid>
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={PanelBottom}
                         title="Footer brand & legal"
                         description="Tagline, column titles, registry row, and legal links in the global footer. The registry button uses the header CTA URL unless you override the label below."
                       >
                         <AdminFieldGrid>
                           <AdminEditorField label="Tagline" className="admin-editor-field--wide">
                             <AdminEditorInput
                               value={form.footer?.tagline ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   footer: { ...form.footer, tagline: e.target.value },
                                 })
                               }
                               placeholder="Orchestrating the future of automated business systems."
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Copyright line" className="admin-editor-field--wide">
                             <AdminEditorInput
                               value={form.footer?.copyright ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   footer: { ...form.footer, copyright: e.target.value },
                                 })
                               }
                               placeholder={`© ${new Date().getFullYear()} Superhumanly AI Playbook.`}
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Registry status label">
                             <AdminEditorInput
                               value={form.footer?.registryStatusLabel ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   footer: { ...form.footer, registryStatusLabel: e.target.value },
                                 })
                               }
                               placeholder="Registry open"
                             />
                           </AdminEditorField>
                           <AdminEditorField
                             label="Registry button label"
                             hint="Uses header CTA URL. Leave blank to match the header button label."
                           >
                             <AdminEditorInput
                               value={form.footer?.registryCtaLabel ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   footer: { ...form.footer, registryCtaLabel: e.target.value },
                                 })
                               }
                               placeholder={form.navigation.primaryCta?.label ?? 'Join the registry'}
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Footer links column title">
                             <AdminEditorInput
                               value={form.footer?.navColumnTitle ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   footer: { ...form.footer, navColumnTitle: e.target.value },
                                 })
                               }
                               placeholder="Section Index"
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Social column title">
                             <AdminEditorInput
                               value={form.footer?.socialColumnTitle ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   footer: { ...form.footer, socialColumnTitle: e.target.value },
                                 })
                               }
                               placeholder="Connection"
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Privacy policy label">
                             <AdminEditorInput
                               value={form.footer?.privacyLabel ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   footer: { ...form.footer, privacyLabel: e.target.value },
                                 })
                               }
                               placeholder="Privacy Policy"
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Privacy policy URL">
                             <AdminEditorInput
                               value={form.footer?.privacyUrl ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   footer: { ...form.footer, privacyUrl: e.target.value },
                                 })
                               }
                               placeholder="/privacy"
                               className="font-mono text-sm"
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Terms label">
                             <AdminEditorInput
                               value={form.footer?.termsLabel ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   footer: { ...form.footer, termsLabel: e.target.value },
                                 })
                               }
                               placeholder="Terms of Service"
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Terms URL">
                             <AdminEditorInput
                               value={form.footer?.termsUrl ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   footer: { ...form.footer, termsUrl: e.target.value },
                                 })
                               }
                               placeholder="/terms"
                               className="font-mono text-sm"
                             />
                           </AdminEditorField>
                         </AdminFieldGrid>
                       </AdminEditorSection>
                     </>
                   )}

                   {activeTab === 'pages' && (
                     <>
                       <AdminEditorSection
                         icon={Globe}
                         title="Route visibility"
                         description="Hide entire catalog or register routes (returns 404)."
                       >
                         <AdminFieldGrid columns={2}>
                           {(
                             [
                               ['blog', 'Blog (/blog)'],
                               ['events', 'Events (/events)'],
                               ['speakers', 'Speakers (/speakers)'],
                               ['register', 'Register (/register)'],
                             ] as const
                           ).map(([key, label]) => (
                             <AdminEditorField key={key} label={label}>
                               <Toggle
                                 label="Route live"
                                 checked={form.routeVisibility?.[key] !== false}
                                 onChange={(checked) =>
                                   setForm({
                                     ...form,
                                     routeVisibility: {
                                       ...form.routeVisibility,
                                       [key]: checked,
                                     },
                                   })
                                 }
                               />
                             </AdminEditorField>
                           ))}
                         </AdminFieldGrid>
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={Mail}
                         title="Lead capture modal"
                         description="Shown when visitors click the blog CTA block."
                       >
                         <AdminFieldGrid>
                           <AdminEditorField label="Modal title">
                             <AdminEditorInput
                               value={form.leadCaptureModal?.title ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   leadCaptureModal: {
                                     ...form.leadCaptureModal,
                                     title: e.target.value,
                                   },
                                 })
                               }
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Modal lede" className="admin-editor-field--wide">
                             <AdminEditorTextarea
                               rows={2}
                               value={form.leadCaptureModal?.lede ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   leadCaptureModal: {
                                     ...form.leadCaptureModal,
                                     lede: e.target.value,
                                   },
                                 })
                               }
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Submit label">
                             <AdminEditorInput
                               value={form.leadCaptureModal?.submitLabel ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   leadCaptureModal: {
                                     ...form.leadCaptureModal,
                                     submitLabel: e.target.value,
                                   },
                                 })
                               }
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Success title">
                             <AdminEditorInput
                               value={form.leadCaptureModal?.successTitle ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   leadCaptureModal: {
                                     ...form.leadCaptureModal,
                                     successTitle: e.target.value,
                                   },
                                 })
                               }
                             />
                           </AdminEditorField>
                         </AdminFieldGrid>
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={Cookie}
                         title="Cookie / GDPR banner"
                         description="Consent banner shown on first visit when enabled."
                       >
                         <Toggle
                           label="Show cookie consent banner"
                           checked={form.cookieBanner?.enabled === true}
                           onChange={(checked) =>
                             setForm({
                               ...form,
                               cookieBanner: {
                                 ...form.cookieBanner,
                                 enabled: checked,
                               },
                             })
                           }
                         />
                         <fieldset
                           className={cn(
                             'mt-[var(--ds-space-4)] border-0 p-0 m-0 min-w-0',
                             form.cookieBanner?.enabled !== true && 'opacity-50 pointer-events-none',
                           )}
                           disabled={form.cookieBanner?.enabled !== true}
                         >
                         <AdminEditorField label="Banner text">
                           <AdminEditorTextarea
                             rows={2}
                             value={form.cookieBanner?.text ?? ''}
                             onChange={(e) =>
                               setForm({
                                 ...form,
                                 cookieBanner: { ...form.cookieBanner, text: e.target.value },
                               })
                             }
                           />
                         </AdminEditorField>
                         <AdminFieldGrid>
                           <AdminEditorField label="Accept button label">
                             <AdminEditorInput
                               value={form.cookieBanner?.acceptLabel ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   cookieBanner: {
                                     ...form.cookieBanner,
                                     acceptLabel: e.target.value,
                                   },
                                 })
                               }
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Policy link URL">
                             <AdminEditorInput
                               value={form.cookieBanner?.policyUrl ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   cookieBanner: {
                                     ...form.cookieBanner,
                                     policyUrl: e.target.value,
                                   },
                                 })
                               }
                             />
                           </AdminEditorField>
                         </AdminFieldGrid>
                         </fieldset>
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={AlertTriangle}
                         title="404 page"
                         description="Copy and CTA for the not-found route."
                       >
                         <AdminFieldGrid>
                           <AdminEditorField label="Eyebrow">
                             <AdminEditorInput
                               value={form.notFound?.eyebrow ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   notFound: { ...form.notFound, eyebrow: e.target.value },
                                 })
                               }
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Title">
                             <AdminEditorInput
                               value={form.notFound?.title ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   notFound: { ...form.notFound, title: e.target.value },
                                 })
                               }
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Message" className="admin-editor-field--wide">
                             <AdminEditorTextarea
                               rows={2}
                               value={form.notFound?.lede ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   notFound: { ...form.notFound, lede: e.target.value },
                                 })
                               }
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Primary CTA label">
                             <AdminEditorInput
                               value={form.notFound?.primaryCtaLabel ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   notFound: {
                                     ...form.notFound,
                                     primaryCtaLabel: e.target.value,
                                   },
                                 })
                               }
                             />
                           </AdminEditorField>
                           <AdminEditorField label="Primary CTA link">
                             <AdminEditorInput
                               value={form.notFound?.primaryCtaHref ?? ''}
                               onChange={(e) =>
                                 setForm({
                                   ...form,
                                   notFound: {
                                     ...form.notFound,
                                     primaryCtaHref: e.target.value,
                                   },
                                 })
                               }
                             />
                           </AdminEditorField>
                         </AdminFieldGrid>
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={Mail}
                         title="Newsletter / waitlist"
                         description="Controls whether public waitlist signups are accepted."
                       >
                         <Toggle
                           label="Accept waitlist signups"
                           description="When disabled, POST /content/newsletter returns 403. View signups under Admin → Newsletter."
                           checked={form.newsletter?.enabled !== false}
                           onChange={(checked) =>
                             setForm({
                               ...form,
                               newsletter: { ...form.newsletter, enabled: checked },
                             })
                           }
                         />
                       </AdminEditorSection>

                       <AdminEditorSection
                         icon={Newspaper}
                         title="Blog CTA block"
                         description="Shared call-to-action shown on blog pages."
                       >
                         <AdminEditorField label="Headline">
                           <AdminEditorInput
                             value={form.blogCta?.title ?? ''}
                             onChange={(e) =>
                               setForm({
                                 ...form,
                                 blogCta: { ...form.blogCta, title: e.target.value },
                               })
                             }
                           />
                         </AdminEditorField>
                         <AdminEditorField label="Description">
                           <AdminEditorTextarea
                             rows={3}
                             value={form.blogCta?.lede ?? ''}
                             onChange={(e) =>
                               setForm({
                                 ...form,
                                 blogCta: { ...form.blogCta, lede: e.target.value },
                               })
                             }
                           />
                         </AdminEditorField>
                         <AdminEditorField label="Button label">
                           <AdminEditorInput
                             value={form.blogCta?.buttonLabel ?? ''}
                             onChange={(e) =>
                               setForm({
                                 ...form,
                                 blogCta: { ...form.blogCta, buttonLabel: e.target.value },
                               })
                             }
                           />
                         </AdminEditorField>
                       </AdminEditorSection>
                     </>
                   )}

                   {activeTab === 'advanced' && (
                     <>
                       <AdminEditorSection
                         icon={FileCode}
                         title="Custom CSS"
                         description="Injected on every public page after the main stylesheet."
                       >
                         <AdminEditorField label="Global CSS overrides">
                           <AdminEditorTextarea
                             rows={10}
                             value={form.customCss}
                             onChange={(e) => setForm({ ...form, customCss: e.target.value })}
                             placeholder="/* Global overrides */"
                             className="admin-code-input admin-code-input--dark font-mono text-sm"
                           />
                         </AdminEditorField>
                       </AdminEditorSection>

                       <DangerZone
                         title="Script injection"
                         description="Raw HTML injected into every public page. Incorrect scripts can break the site or introduce security risks."
                       >
                         <AdminEditorField label="Header scripts">
                           <AdminEditorTextarea
                             rows={4}
                             value={form.scripts.header}
                             onChange={(e) =>
                               setForm({ ...form, scripts: { ...form.scripts, header: e.target.value } })
                             }
                             className="admin-code-input font-mono text-sm"
                           />
                         </AdminEditorField>
                         <AdminEditorField label="Footer scripts" className="mt-[var(--ds-space-4)]">
                           <AdminEditorTextarea
                             rows={4}
                             value={form.scripts.footer}
                             onChange={(e) =>
                               setForm({ ...form, scripts: { ...form.scripts, footer: e.target.value } })
                             }
                             className="admin-code-input font-mono text-sm"
                           />
                         </AdminEditorField>
                       </DangerZone>

                       <AdminEditorSection
                         icon={History}
                         title="Revision history"
                         description="Restore prior versions of global site content."
                       >
                         <RevisionHistoryPanel
                           entityType="site_content"
                           entityId="global"
                           onRestored={() => refresh()}
                         />
                       </AdminEditorSection>
                     </>
                   )}
    </AdminWorkspaceShell>
  );
};
