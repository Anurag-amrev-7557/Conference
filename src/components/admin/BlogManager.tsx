import React, { useState } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import type { Article } from '../../lib/websiteData';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const BlogManager: React.FC = () => {
  const { data, createArticle, updateArticle, deleteArticle } = useWebsiteData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Article>>({});

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setEditForm(article);
  };

  const handleAddNew = async () => {
    const newArticle: Partial<Article> = {
      slug: 'new-article-' + Math.random().toString(36).substring(2, 7),
      title: 'New Article Title',
      category: 'RESEARCH',
      time: '5 MIN',
      excerpt: 'Short summary of the article...',
      content: '# New Article\n\nWrite your content here in Markdown.',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000',
      isPublished: false,
      authorName: 'Admin',
      authorRole: 'Editor',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      publishedAt: new Date().toISOString().split('T')[0]
    };
    
    try {
      await createArticle(newArticle);
      // The provider will refresh the data and we can find the new article by slug if needed
      // For now, we just let the list refresh
    } catch (err) {
      alert('Failed to create article');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id);
      } catch (err) {
        alert('Failed to delete article');
      }
    }
  };

  const handleSave = async () => {
    if (editingId) {
      try {
        await updateArticle(editingId, editForm);
        setEditingId(null);
      } catch (err) {
        alert('Failed to save article');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-serif italic text-text">Manage Articles</h3>
          <p className="text-sm text-muted">Create and edit automation guides for the Superhumanly Playbook.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Article
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {data.articles.map((article) => (
          <motion.div
            key={article.id}
            layoutId={article.id}
            className="bg-white rounded-[24px] overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow"
          >
            {editingId === article.id ? (
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Metadata */}
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Title & URL</label>
                      <input
                        type="text"
                        placeholder="Article Title"
                        value={editForm.title || ''}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none mb-3 transition-all font-serif text-lg"
                      />
                      <div className="flex items-center gap-2 px-4 py-2 bg-off rounded-lg border border-border/50">
                    <span className="text-[11px] text-muted">Author Details</span>
                    <input
                      type="text"
                      value={editForm.slug || ''}
                      onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                      className="flex-1 bg-transparent text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Category</label>
                    <select
                      value={editForm.category || ''}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border outline-none transition-all"
                    >
                      {['RESEARCH', 'STRATEGY', 'PLAYBOOK', 'GUIDE'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Read Time</label>
                    <input
                      type="text"
                      value={editForm.time || ''}
                      onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Excerpt</label>
                  <textarea
                    rows={3}
                    value={editForm.excerpt || ''}
                    onChange={e => setEditForm({ ...editForm, excerpt: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Thumbnail URL</label>
                  <input
                    type="text"
                    value={editForm.thumbnail || ''}
                    onChange={e => setEditForm({ ...editForm, thumbnail: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border outline-none transition-all"
                  />
                </div>
              </div>

              {/* Right Column: Author & Content */}
              <div className="space-y-6">
                <div className="p-6 bg-off/50 rounded-2xl border border-border/50">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4 block">Author Details</label>
                  <div className="flex gap-4 mb-4">
                     <div className="w-16 h-16 rounded-xl overflow-hidden border border-border">
                       <img src={editForm.authorAvatar} alt="" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 space-y-3">
                       <input
                         type="text"
                         placeholder="Author Name"
                         value={editForm.authorName || ''}
                         onChange={e => setEditForm({ ...editForm, authorName: e.target.value })}
                         className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none"
                       />
                       <input
                         type="text"
                         placeholder="Author Role"
                         value={editForm.authorRole || ''}
                         onChange={e => setEditForm({ ...editForm, authorRole: e.target.value })}
                         className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none"
                       />
                     </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Avatar URL"
                    value={editForm.authorAvatar || ''}
                    onChange={e => setEditForm({ ...editForm, authorAvatar: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-off/50 rounded-xl border border-border/40">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={editForm.isPublished || false}
                      onChange={e => setEditForm({ ...editForm, isPublished: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    <span className="ms-3 text-sm font-bold text-text uppercase tracking-widest">Article Live</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Full Width content editor */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Content (Markdown)</label>
              <textarea
                rows={15}
                value={editForm.content || ''}
                onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                className="w-full px-6 py-6 rounded-2xl border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all font-mono text-sm leading-relaxed"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 py-4 bg-accent text-white rounded-xl font-bold transition-all hover:bg-accent2 shadow-lg shadow-accent/10"
              >
                Save Article
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 py-4 border border-border text-text rounded-xl font-bold transition-all hover:bg-off"
              >
                Discard Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[160px]">
            <div className="w-48 relative shrink-0">
              <img src={article.thumbnail} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter shadow-sm ${article.isPublished ? 'bg-emerald-500 text-white' : 'bg-white text-zinc-500'}`}>
                  {article.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{article.category}</span>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[10px] font-medium text-muted uppercase tracking-widest">{article.time} Read</span>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[10px] font-medium text-muted uppercase tracking-widest">{article.slug}</span>
              </div>
              <h4 className="text-2xl font-serif mb-2 text-text line-clamp-1">{article.title}</h4>
              <p className="text-sm text-muted mb-6 line-clamp-2 font-light">{article.excerpt}</p>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={article.authorAvatar} alt="" className="w-6 h-6 rounded-full border border-border" />
                  <span className="text-[10px] font-bold text-text uppercase tracking-widest">{article.authorName}</span>
                </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition-all border border-border/50 hover:border-accent/20"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-muted hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-border/50 hover:border-rose-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
