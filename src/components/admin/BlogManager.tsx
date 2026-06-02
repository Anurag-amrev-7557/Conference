import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import type { Article } from '../../lib/websiteData';
import {
  ChevronLeft,
  ExternalLink,
  FileText,
  Globe,
  Layout,
  Image,
  BookOpen,
  CalendarClock,
  History,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArticleSeoTab } from './ArticleSeoTab';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogPageWorkspacePanel } from './PageWorkspacePanel';
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
import { BLOG_TAB_INTROS } from './workspaceTabIntros';
import { useApplyPendingAdminSection } from './admin-workspace-nav';
import {
  CatalogViewToggle,
  CatalogListSkeleton,
  CatalogItemCard,
  getPublishBadge,
} from './admin-catalog-list';
import { ConfirmDialog, Toggle, EmptyState, RichTextEditor } from './ui';
import { useToast } from './ui/Toast';
import { cn } from '../../lib/utils';
import { resolveAssetUrl } from '../../lib/assetUrl';
import { toEditorHtml } from '../../lib/articleContent';

const ARTICLE_FIELD_LIMITS = {
  title: 120,
  slug: 80,
  time: 16,
  excerpt: 300,
  thumbnail: 500,
} as const;

function normalizeImageUrlInput(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'unsplash.com') {
      const match = parsed.pathname.match(/^\/photos\/(?:[^/]*-)?([A-Za-z0-9_-]+)\/?$/);
      if (match?.[1]) {
        return `https://source.unsplash.com/${match[1]}/2000x1125`;
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function extractUnsplashId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'unsplash.com') {
      const match = parsed.pathname.match(/^\/photos\/(?:[^/]*-)?([A-Za-z0-9_-]+)\/?$/);
      return match?.[1] ?? null;
    }
    if (host === 'images.unsplash.com') {
      const match = parsed.pathname.match(/^\/photo-([A-Za-z0-9_-]+)/);
      return match?.[1] ?? null;
    }
    if (host === 'source.unsplash.com') {
      const match = parsed.pathname.match(/^\/([A-Za-z0-9_-]+)/);
      return match?.[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

function withCacheBust(url: string, nonce: number): string {
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}v=${nonce}`;
}

export const BlogManager: React.FC = () => {
  const {
    data,
    sourceData,
    updateArticle,
    deleteArticle,
    setPreview,
    isPreviewVisible,
    refresh,
  } = useWebsiteData();
  const articlesRef = useRef(sourceData.articles);
  articlesRef.current = sourceData.articles;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Article>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const skipDirtyRef = useRef(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editorTab, setEditorTab] = useState<'content' | 'seo'>('content');
  const [workspaceTab, setWorkspaceTab] = useState<'articles' | 'page' | 'seo'>('articles');
  const [panelSave, setPanelSave] = useState<WorkspaceSaveConfig | null>(null);
  const [articleView, setArticleView] = useState<'active' | 'trash'>('active');
  const [trashArticles, setTrashArticles] = useState<Article[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [thumbnailPreviewNonce, setThumbnailPreviewNonce] = useState(0);
  const [thumbnailPreviewIndex, setThumbnailPreviewIndex] = useState(0);
  const { toast } = useToast();

  const adminToken = localStorage.getItem('adminToken') || '';
  const { isSuperAdmin, canEdit } = useAdminSession();

  useEffect(() => {
    if (articleView !== 'trash' || !adminToken) {
      setTrashArticles([]);
      return;
    }
    let cancelled = false;
    setLoadingTrash(true);
    void api
      .getAdminArticles(adminToken, { trash: true })
      .then((items) => {
        if (!cancelled) setTrashArticles(items);
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
  }, [articleView, adminToken]);

  const storedArticle = editingId
    ? sourceData.articles.find((a) => a.id === editingId)
    : undefined;

  useEffect(() => {
    if (!editingId || !isPreviewVisible) {
      setPreview(null);
      return;
    }
    setPreview({
      articles: articlesRef.current.map((a) =>
        a.id === editingId ? { ...a, ...editForm } : a,
      ),
    });
    return () => setPreview(null);
  }, [editingId, editForm, isPreviewVisible, setPreview]);

  const handleEdit = (article: Article) => {
    skipDirtyRef.current = true;
    setIsDirty(false);
    setEditingId(article.id);
    setEditForm({
      ...article,
      content: toEditorHtml(article.content),
    });
    setEditorTab('content');
  };

  const handleAddNew = async () => {
    const newArticle: Partial<Article> = {
      slug: 'new-article-' + Math.random().toString(36).substring(2, 7),
      title: 'New Editorial Piece',
      category: 'RESEARCH',
      time: '5 MIN',
      excerpt: 'A brief summary of the architectural insights discussed in this piece.',
      content:
        '<h2>Introduction</h2><p>Start writing your article here. Use the toolbar for headings, lists, links, and quotes—no markdown required.</p>',
      thumbnail:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000',
      isPublished: false,
      authorName: 'Systems Architect',
      authorRole: 'Lead',
      authorAvatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      publishedAt: new Date().toISOString().split('T')[0],
      seoTitle: '',
      seoDescription: '',
      ogImage: '',
      noindex: false,
    };

    try {
      const created = await api.createArticle(adminToken, newArticle);
      await refresh();
      if (created?.id) {
        skipDirtyRef.current = true;
        setIsDirty(false);
        setEditingId(created.id);
        setEditForm({ ...newArticle, ...created, id: created.id });
        setEditorTab('content');
      }
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Create failed',
        description: err instanceof Error ? err.message : 'Failed to create article.',
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
      await deleteArticle(deleteTargetId);
      if (editingId === deleteTargetId) setEditingId(null);
      toast({ variant: 'success', title: 'Article moved to trash' });
      setDeleteTargetId(null);
    } catch (err) {
      toast({ variant: 'error', title: 'Failed to delete', description: err instanceof Error ? err.message : undefined });
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (id: string) => {
    if (!adminToken) return;
    try {
      await api.restoreArticle(adminToken, id);
      setTrashArticles((prev) => prev.filter((a) => a.id !== id));
      await refresh();
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Restore failed',
        description: err instanceof Error ? err.message : 'Failed to restore article.',
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
      await api.permanentDeleteArticle(adminToken, permanentDeleteId);
      setTrashArticles((prev) => prev.filter((a) => a.id !== permanentDeleteId));
      toast({ variant: 'success', title: 'Article permanently deleted' });
      setPermanentDeleteId(null);
    } catch (err) {
      toast({ variant: 'error', title: 'Delete failed', description: err instanceof Error ? err.message : undefined });
    } finally {
      setDeleting(false);
    }
  };

  const listArticles = articleView === 'trash' ? trashArticles : sourceData.articles;

  const handleSave = async () => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await updateArticle(editingId, editForm);
      skipDirtyRef.current = true;
      setIsDirty(false);
      toast({ variant: 'success', title: 'Article saved' });
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

  const handleThumbnailChange = (url: string) => {
    const normalized = normalizeImageUrlInput(url);
    setThumbnailPreviewNonce(Date.now());
    setEditForm((prev) => ({ ...prev, thumbnail: normalized }));
  };

  const thumbnailPreviewCandidates = (() => {
    const raw = resolveAssetUrl(editForm.thumbnail?.trim());
    if (!raw) return [] as string[];
    const candidates = [withCacheBust(raw, thumbnailPreviewNonce)];
    const unsplashId = extractUnsplashId(raw);
    if (unsplashId) {
      candidates.push(withCacheBust(`https://images.unsplash.com/photo-${unsplashId}?auto=format&fit=crop&w=2000&q=80`, thumbnailPreviewNonce));
      candidates.push(withCacheBust(`https://source.unsplash.com/${unsplashId}/2000x1125`, thumbnailPreviewNonce));
      candidates.push(withCacheBust(`https://unsplash.com/photos/${unsplashId}/download?force=true&w=2000`, thumbnailPreviewNonce));
    }
    return Array.from(new Set(candidates));
  })();

  const thumbnailPreviewSrc = thumbnailPreviewCandidates[thumbnailPreviewIndex] ?? '';

  useEffect(() => {
    skipDirtyRef.current = true;
    setIsDirty(false);
  }, [editingId, editorTab]);

  useEffect(() => {
    setThumbnailPreviewIndex(0);
  }, [editForm.thumbnail, thumbnailPreviewNonce]);

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
      ? 'articleSeo'
      : 'content'
    : workspaceTab;
  const tabIntro = (() => {
    if (!editingId) {
      return BLOG_TAB_INTROS[tabIntroKey as keyof typeof BLOG_TAB_INTROS];
    }

    const base = BLOG_TAB_INTROS[tabIntroKey as keyof typeof BLOG_TAB_INTROS];
    const articleTitle = editForm.title?.trim() || 'Untitled article';
    const scheduleBadge = getScheduleBadge(editForm as Article);
    let status: 'published' | 'draft' | 'scheduled' = 'draft';
    if (editForm.isPublished) {
      status = scheduleBadge === 'scheduled' ? 'scheduled' : 'published';
    }

    if (editorTab === 'seo') {
      return {
        ...base,
        breadcrumb: `Blog · Articles · ${articleTitle}`,
        title: 'Article SEO',
        description: base.description,
        status,
      };
    }

    return {
      ...base,
      breadcrumb: `Blog · Articles · ${articleTitle}`,
      title: articleTitle,
      description: base.description,
      status,
    };
  })();

  const editorToolbarLede = editingId
    ? undefined
    : 'Editorial posts, listing page hero, and /blog SEO.';

  const saveStatus = editingId
    ? editorSaveStatusFrom(isSaving, isDirty)
    : workspaceTab === 'articles'
      ? 'idle'
      : panelSave?.saving
        ? 'saving'
        : 'idle';

  useApplyPendingAdminSection('/admin/blogs', (id) => {
    if (id === 'content' || id === 'seo') return;
    setWorkspaceTab(id as typeof workspaceTab);
  });

  const subnav = editingId
    ? {
        groups: [
          {
            label: 'Article',
            items: [
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'seo', label: 'SEO', icon: Globe },
            ],
          },
        ],
        activeId: editorTab,
        onSelect: (id: string) => setEditorTab(id as typeof editorTab),
        pageId: 'blogs' as const,
      }
    : {
        groups: [
          { label: 'Editorial', items: [{ id: 'articles', label: 'Articles', icon: FileText }] },
          {
            label: 'Blog page',
            items: [
              { id: 'page', label: 'Page hero', icon: Layout },
              { id: 'seo', label: 'SEO', icon: Globe },
            ],
          },
        ],
        activeId: workspaceTab,
        onSelect: (id: string) => setWorkspaceTab(id as typeof workspaceTab),
        pageId: 'blogs' as const,
      };

  return (
    <AdminWorkspaceShell
      editorClassName="admin-book-page"
      isPreviewVisible={isPreviewVisible}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
              Back to articles
            </AdminButton>
          </div>
        ) : (
          <AdminPageIntro compact className="mb-0" lede={editorToolbarLede} />
        )
      }
      subnav={subnav}
      editorHeader={tabIntro}
      editorHeaderAside={
        !editingId && workspaceTab === 'articles' ? (
          <CatalogViewToggle view={articleView} onChange={setArticleView} />
        ) : undefined
      }
      contentEditor={!!editingId || workspaceTab !== 'articles'}
      panelFlush={!editingId && workspaceTab === 'articles'}
      saveStatus={saveStatus}
      headerAction={
        editingId ? (
          <>
            {editForm.isPublished && editForm.slug ? (
              <Link
                to={`/blog/${editForm.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <AdminButton variant="secondary" className="shrink-0">
                  View article
                  <ExternalLink className="w-4 h-4" />
                </AdminButton>
              </Link>
            ) : null}
            <AdminHeaderSave label="Save article" saving={isSaving} onClick={handleSave} />
          </>
        ) : workspaceTab === 'articles' && canEdit && articleView === 'active' ? (
          <>
            <Link to="/blog" target="_blank" rel="noopener noreferrer" className="inline-flex">
              <AdminButton variant="secondary" className="shrink-0">
                Open blog
                <ExternalLink className="w-4 h-4" />
              </AdminButton>
            </Link>
            <button type="button" className="admin-btn admin-btn--primary" onClick={() => void handleAddNew()}>
              <Plus className="w-4 h-4" aria-hidden />
              New article
            </button>
          </>
        ) : workspaceTab !== 'articles' && panelSave ? (
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
              <ArticleSeoTab
                editForm={editForm}
                setEditForm={setEditForm}
                storedArticle={storedArticle}
                data={data}
              />
            ) : (
              <>
                <AdminEditorSection
                  icon={FileText}
                  title="Basics"
                  description="Title, URL, and listing metadata."
                >
                  <AdminEditorSubsection title="Article details">
                    <AdminEditorField
                      label="Article title"
                      value={editForm.title || ''}
                      maxLength={ARTICLE_FIELD_LIMITS.title}
                      showCharCount
                    >
                      <AdminEditorInput
                        value={editForm.title || ''}
                        maxLength={ARTICLE_FIELD_LIMITS.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="The Future of AI Systems"
                      />
                    </AdminEditorField>
                    <AdminEditorField
                      label="URL slug"
                      value={editForm.slug || ''}
                      maxLength={ARTICLE_FIELD_LIMITS.slug}
                      showCharCount
                    >
                      <AdminEditorInput
                        value={editForm.slug || ''}
                        maxLength={ARTICLE_FIELD_LIMITS.slug}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                        placeholder="future-ai-systems"
                        className="font-mono"
                      />
                    </AdminEditorField>
                    <AdminFieldGrid columns={2}>
                      <AdminEditorField label="Category">
                        <select
                          value={editForm.category || ''}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="admin-editor-input"
                        >
                          {['RESEARCH', 'STRATEGY', 'PLAYBOOK', 'GUIDE'].map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </AdminEditorField>
                      <AdminEditorField
                        label="Reading time"
                        value={editForm.time || ''}
                        maxLength={ARTICLE_FIELD_LIMITS.time}
                        showCharCount
                      >
                        <AdminEditorInput
                          value={editForm.time || ''}
                          maxLength={ARTICLE_FIELD_LIMITS.time}
                          onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                          placeholder="5 MIN"
                        />
                      </AdminEditorField>
                    </AdminFieldGrid>
                    <AdminEditorField
                      label="Short summary"
                      value={editForm.excerpt || ''}
                      maxLength={ARTICLE_FIELD_LIMITS.excerpt}
                      showCharCount
                    >
                      <AdminEditorTextarea
                        rows={3}
                        value={editForm.excerpt || ''}
                        maxLength={ARTICLE_FIELD_LIMITS.excerpt}
                        onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                      />
                    </AdminEditorField>
                  </AdminEditorSubsection>
                </AdminEditorSection>

                <AdminEditorSection icon={Image} title="Cover image" description="Listing thumbnail and social fallback.">
                  <AdminEditorSubsection title="Hero image">
                    {thumbnailPreviewSrc ? (
                      <div className="aspect-video rounded-lg overflow-hidden border border-[var(--editor-border-secondary)] mb-3 max-w-md">
                        <img
                          key={thumbnailPreviewSrc}
                          src={thumbnailPreviewSrc}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={() =>
                            setThumbnailPreviewIndex((prev) =>
                              prev + 1 < thumbnailPreviewCandidates.length ? prev + 1 : prev,
                            )
                          }
                        />
                      </div>
                    ) : null}
                    <MediaUrlField
                      editor
                      label="Cover image URL"
                      value={editForm.thumbnail || ''}
                      maxLength={ARTICLE_FIELD_LIMITS.thumbnail}
                      onChange={handleThumbnailChange}
                    />
                  </AdminEditorSubsection>
                </AdminEditorSection>

                <AdminEditorSection
                  icon={BookOpen}
                  title="Body"
                  description="Write and format the article visually—saved as rich HTML."
                >
                  <AdminEditorSubsection title="Article content">
                    <RichTextEditor
                      className="admin-rich-text-editor"
                      value={editForm.content || ''}
                      onChange={(content) => setEditForm({ ...editForm, content })}
                      rows={18}
                      placeholder="Write your article…"
                    />
                  </AdminEditorSubsection>
                </AdminEditorSection>

                <AdminEditorSection icon={CalendarClock} title="Publish" description="Visibility and schedule windows.">
                  <AdminEditorSubsection title="Visibility & schedule">
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
                          editForm.isPublished
                            ? 'Visible on /blog when schedule allows'
                            : 'Hidden from the public site'
                        }
                        checked={!!editForm.isPublished}
                        onChange={(checked) => setEditForm({ ...editForm, isPublished: checked })}
                      />
                    </div>
                    {formatScheduleHint(editForm) ? (
                      <p className="admin-editor-field__hint text-[var(--ds-warning-text)]">{formatScheduleHint(editForm)}</p>
                    ) : null}
                    <AdminEditorField label="Published date">
                      <AdminEditorInput
                        type="date"
                        value={editForm.publishedAt?.split('T')[0] ?? ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, publishedAt: e.target.value || editForm.publishedAt })
                        }
                      />
                      <p className="admin-editor-field__hint mt-1.5">
                        Shown as the byline date on the public article page.
                      </p>
                    </AdminEditorField>
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
                  <AdminEditorSection icon={History} title="Revision history" description="Restore prior versions of this article.">
                    <AdminEditorSubsection title="Version snapshots" description="Automatic snapshots saved on each update.">
                      <RevisionHistoryPanel
                        embedded
                        entityType="article"
                        entityId={editingId}
                        previewKeys={['title', 'excerpt', 'content', 'isPublished']}
                        currentSnapshot={editForm as Record<string, unknown>}
                        onRestored={async () => {
                          await refresh();
                          const updated = sourceData.articles.find((a) => a.id === editingId);
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
              <BlogPageWorkspacePanel mode="page" onSaveReady={setPanelSave} />
            )}
            {workspaceTab === 'seo' && (
              <BlogPageWorkspacePanel mode="seo" onSaveReady={setPanelSave} />
            )}

            {workspaceTab === 'articles' && (
              <div className="admin-catalog-panel">
                {articleView === 'trash' && loadingTrash ? (
                  <CatalogListSkeleton count={3} />
                ) : listArticles.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    heading={articleView === 'trash' ? 'Trash is empty' : 'No articles yet'}
                    subtext={
                      articleView === 'trash'
                        ? 'Deleted articles appear here before permanent removal.'
                        : 'Create your first editorial piece for the blog.'
                    }
                    actionLabel={articleView === 'trash' ? undefined : 'New article'}
                    onAction={articleView === 'trash' ? undefined : () => void handleAddNew()}
                  />
                ) : (
                  <div className="admin-catalog-list">
                    {listArticles.map((article) => (
                      <CatalogItemCard
                        key={article.id}
                        title={article.title}
                        meta={article.category}
                        thumbnail={<img src={article.thumbnail} alt="" className="w-full h-full object-cover" />}
                        publishBadge={getPublishBadge(
                          article.isPublished,
                          articleView === 'active' ? getScheduleBadge(article) : null,
                          articleView === 'trash',
                        )}
                        view={articleView}
                        canEdit={canEdit}
                        isSuperAdmin={isSuperAdmin}
                        onEdit={() => handleEdit(article)}
                        onTrash={() => void handleDelete(article.id)}
                        onRestore={() => void handleRestore(article.id)}
                        onPermanentDelete={() => void handlePermanentDelete(article.id)}
                      />
                    ))}
                  </div>
                )}

                <ConfirmDialog
                  open={deleteTargetId != null}
                  onOpenChange={(open) => !open && setDeleteTargetId(null)}
                  title="Move to trash?"
                  description="This article will be hidden from the public site. You can restore it from Trash."
                  confirmLabel="Move to trash"
                  variant="danger"
                  loading={deleting}
                  onConfirm={() => void confirmDelete()}
                />
                <ConfirmDialog
                  open={permanentDeleteId != null}
                  onOpenChange={(open) => !open && setPermanentDeleteId(null)}
                  title="Permanently delete?"
                  description="This cannot be undone. The article will be removed forever."
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
