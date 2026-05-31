import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import type { Article } from '../../lib/websiteData';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  FileText,
  Globe,
  Layout,
} from 'lucide-react';
import { ArticleSeoTab } from './ArticleSeoTab';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { BlogPageWorkspacePanel } from './PageWorkspacePanel';
import {
  AdminButton,
  AdminField,
  AdminFormSection,
  AdminHeaderSave,
  AdminInput,
  AdminPageIntro,
  AdminTextarea,
} from './admin-ui';
import type { WorkspaceSaveConfig } from './admin-workspace-save';
import { MediaUrlField } from './MediaUrlField';
import { AdminWorkspaceShell } from './AdminWorkspaceShell';
import { BLOG_TAB_INTROS } from './workspaceTabIntros';
import { useApplyPendingAdminSection } from './admin-workspace-nav';

export const BlogManager: React.FC = () => {
  const {
    data,
    sourceData,
    createArticle,
    updateArticle,
    deleteArticle,
    setPreview,
    isPreviewVisible,
  } = useWebsiteData();
  const articlesRef = useRef(sourceData.articles);
  articlesRef.current = sourceData.articles;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Article>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editorTab, setEditorTab] = useState<'content' | 'seo'>('content');
  const [workspaceTab, setWorkspaceTab] = useState<'articles' | 'page' | 'seo'>('articles');
  const [panelSave, setPanelSave] = useState<WorkspaceSaveConfig | null>(null);

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
    setEditingId(article.id);
    setEditForm(article);
    setEditorTab('content');
  };

  const handleAddNew = async () => {
    const newArticle: Partial<Article> = {
      slug: 'new-article-' + Math.random().toString(36).substring(2, 7),
      title: 'New Editorial Piece',
      category: 'RESEARCH',
      time: '5 MIN',
      excerpt: 'A brief summary of the architectural insights discussed in this piece.',
      content: '# New Article\n\nStart writing your architectural narrative here...',
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
      await createArticle(newArticle);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this article?')) {
      try {
        await deleteArticle(id);
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
        await updateArticle(editingId, editForm);
        setEditingId(null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const tabIntroKey = editingId
    ? editorTab === 'seo'
      ? 'articleSeo'
      : 'content'
    : workspaceTab;
  const tabIntro = BLOG_TAB_INTROS[tabIntroKey as keyof typeof BLOG_TAB_INTROS];

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
      };

  return (
    <AdminWorkspaceShell
      isPreviewVisible={isPreviewVisible}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      toolbar={
        editingId ? (
          <div className="flex items-center gap-4">
            <AdminButton
              variant="ghost"
              type="button"
              onClick={() => setEditingId(null)}
              className="!px-0"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to articles
            </AdminButton>
            <span className="text-[var(--admin-type-label)] font-semibold text-[var(--admin-text)]">
              Edit article
            </span>
          </div>
        ) : (
          <AdminPageIntro
            className="mb-0"
            eyebrow="Blog"
            title="Blog workspace"
            lede="Articles, listing page hero, and /blog SEO."
          />
        )
      }
      subnav={subnav}
      tabIntro={tabIntro}
      headerAction={
        editingId ? (
          <AdminHeaderSave label="Save article" saving={isSaving} onClick={handleSave} />
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
            key="editor"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
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
                <AdminFormSection title="Basics" description="Title, URL, and listing metadata.">
                  <AdminField label="Article title">
                    <AdminInput
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="The Future of AI Systems"
                    />
                  </AdminField>
                  <AdminField label="URL slug">
                    <AdminInput
                      value={editForm.slug || ''}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      placeholder="future-ai-systems"
                      className="font-mono text-sm"
                    />
                  </AdminField>
                  <div className="admin-field-grid admin-field-grid--2">
                    <AdminField label="Category">
                      <select
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="admin-input"
                      >
                        {['RESEARCH', 'STRATEGY', 'PLAYBOOK', 'GUIDE'].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </AdminField>
                    <AdminField label="Reading time">
                      <AdminInput
                        value={editForm.time || ''}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        placeholder="5 MIN"
                      />
                    </AdminField>
                  </div>
                  <AdminField label="Short summary">
                    <AdminTextarea
                      rows={3}
                      value={editForm.excerpt || ''}
                      onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                    />
                  </AdminField>
                </AdminFormSection>

                <AdminFormSection title="Cover image">
                  {editForm.thumbnail ? (
                    <div className="aspect-video rounded-xl overflow-hidden border border-[var(--admin-border)] mb-3 max-w-md">
                      <img src={editForm.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <MediaUrlField
                    label="Cover image URL"
                    value={editForm.thumbnail || ''}
                    onChange={(url) => setEditForm({ ...editForm, thumbnail: url })}
                  />
                </AdminFormSection>

                <AdminFormSection title="Body">
                  <AdminField label="Markdown content">
                    <AdminTextarea
                      rows={15}
                      value={editForm.content || ''}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      className="font-mono text-sm min-h-[20rem]"
                    />
                  </AdminField>
                </AdminFormSection>

                <AdminFormSection title="Publish">
                  <div className="flex items-center justify-between gap-4 py-2">
                    <div>
                      <p className="font-semibold text-[var(--admin-text)]">
                        {editForm.isPublished ? 'Published' : 'Draft'}
                      </p>
                      <p className="admin-field__hint">
                        {editForm.isPublished ? 'Visible on /blog' : 'Hidden from the public site'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, isPublished: !editForm.isPublished })}
                      className={cn(
                        'w-12 h-7 rounded-full relative transition-all p-1 border shrink-0',
                        editForm.isPublished
                          ? 'bg-[var(--admin-primary)] border-[var(--admin-primary)]'
                          : 'bg-[var(--admin-border)] border-[var(--admin-border-strong)]',
                      )}
                      aria-label="Toggle published"
                    >
                      <motion.div
                        animate={{ x: editForm.isPublished ? 20 : 0 }}
                        className="w-5 h-5 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </AdminFormSection>
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
              <>
                <AdminButton
                  type="button"
                  onClick={() => void handleAddNew()}
                  className="mb-4 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  New article
                </AdminButton>

                <div className="space-y-3">
                  {data.articles.map((article) => (
                    <div key={article.id} className="admin-list-card">
                      <div className="admin-list-card__thumb">
                        <img src={article.thumbnail} alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="admin-list-card__meta">{article.category}</span>
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              article.isPublished ? 'bg-emerald-500' : 'bg-amber-500',
                            )}
                            aria-label={article.isPublished ? 'Published' : 'Draft'}
                          />
                        </div>
                        <h3 className="admin-list-card__title truncate">{article.title}</h3>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <AdminButton
                          variant="secondary"
                          onClick={() => handleEdit(article)}
                          className="!min-h-10 !px-3"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </AdminButton>
                        <AdminButton
                          variant="danger"
                          onClick={() => void handleDelete(article.id)}
                          className="!min-h-10 !px-3"
                          aria-label="Delete"
                        >
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
