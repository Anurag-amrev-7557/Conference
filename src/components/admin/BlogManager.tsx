import React, { useState, useEffect } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { LivePreview } from './LivePreview';
import type { Article } from '../../lib/websiteData';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  Loader2, 
  ChevronLeft, 
  BookOpen, 
  FileText,
  Globe,
  Search,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export const BlogManager: React.FC = () => {
  const { data, createArticle, updateArticle, deleteArticle, setPreview, isPreviewVisible } = useWebsiteData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Article>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync with live preview
  useEffect(() => {
    if (editingId && editForm) {
      const updatedArticles = data.articles.map(a => 
        a.id === editingId ? { ...a, ...editForm } : a
      );
      setPreview({ articles: updatedArticles });
    } else {
      setPreview(null);
    }
    return () => setPreview(null);
  }, [editingId, editForm, data.articles]);

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setEditForm(article);
  };

  const handleAddNew = async () => {
    const newArticle: Partial<Article> = {
      slug: 'new-article-' + Math.random().toString(36).substring(2, 7),
      title: 'New Editorial Piece',
      category: 'RESEARCH',
      time: '5 MIN',
      excerpt: 'A brief summary of the architectural insights discussed in this piece.',
      content: '# New Article\n\nStart writing your architectural narrative here...',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000',
      isPublished: false,
      authorName: 'Systems Architect',
      authorRole: 'Lead',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
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
    if (window.confirm('Terminate this asset?')) {
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

  return (
    <div className="flex h-full w-full overflow-hidden bg-white relative font-sans text-text">
       {/* Sidebar Controls */}
       <motion.div 
        layout
        animate={{ 
          width: !isPreviewVisible ? '100%' : (isSidebarCollapsed ? 0 : 520), 
          opacity: (isSidebarCollapsed && isPreviewVisible) ? 0 : 1 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "bg-white flex flex-col shrink-0 relative z-10 shadow-premium overflow-hidden",
          isPreviewVisible ? "border-r border-border/40" : "w-full"
        )}
      >
        <div className={cn(
          "flex flex-col h-full bg-white",
          !isPreviewVisible ? "max-w-4xl mx-auto w-full border-x border-border/40" : "w-[520px]"
        )}>
          <div className="p-5 border-b border-border/40">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-off flex items-center justify-center border border-border/40">
                   <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Architectural Press</span>
             </div>
             
             <AnimatePresence mode="wait">
                {editingId ? (
                   <motion.div 
                     key="edit-header"
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 10 }}
                     className="flex items-center justify-between"
                   >
                      <button 
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-2 text-muted hover:text-text transition-colors group"
                      >
                         <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Repository Archive</span>
                      </button>
                      <h3 className="text-2xl font-serif italic text-text tracking-tight shrink-0">Edit Article</h3>
                   </motion.div>
                ) : (
                   <motion.div 
                     key="list-header"
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                   >
                      <h3 className="text-4xl font-serif italic text-text mb-4">Blog Articles</h3>
                      <p className="text-text2 text-base leading-relaxed opacity-60">Manage your stories, insights, and technical narratives.</p>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto">
             <AnimatePresence mode="wait">
                {editingId ? (
                   <motion.div
                     key="editor"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="p-8 space-y-10"
                   >
                          <div className="space-y-12">
                             {/* Core Info */}
                             <div className="space-y-8">
                                <div className="space-y-4">
                                   <h4 className="text-xl font-bold text-text">Article Title</h4>
                                   <input 
                                     type="text"
                                     value={editForm.title || ''}
                                     onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                     placeholder="The Future of AI Systems"
                                     className="w-full bg-[#fafafa] border border-border/40 p-5 font-serif italic text-2xl focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                                   />
                                </div>
                                <div className="space-y-4">
                                   <h4 className="text-xl font-bold text-text">URL Slug</h4>
                                   <input 
                                     type="text"
                                     value={editForm.slug || ''}
                                     onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                                     placeholder="future-ai-systems"
                                     className="w-full bg-[#fafafa] border border-border/40 p-5 font-mono text-xs text-accent focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                                   />
                                </div>
                             </div>

                             {/* Metadata */}
                             <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                   <h4 className="text-xl font-bold text-text">Category</h4>
                                   <select 
                                     value={editForm.category || ''}
                                     onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                     className="w-full bg-[#fafafa] border border-border/40 p-5 text-sm font-semibold focus:bg-white transition-all outline-none rounded-xl shadow-sm appearance-none"
                                   >
                                      {['RESEARCH', 'STRATEGY', 'PLAYBOOK', 'GUIDE'].map(c => (
                                         <option key={c} value={c}>{c}</option>
                                      ))}
                                   </select>
                                </div>
                                <div className="space-y-4">
                                   <h4 className="text-xl font-bold text-text">Reading Time</h4>
                                   <input 
                                     type="text"
                                     value={editForm.time || ''}
                                     onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                                     placeholder="5 MIN"
                                     className="w-full bg-[#fafafa] border border-border/40 p-5 text-sm font-semibold focus:bg-white transition-all outline-none rounded-xl shadow-sm"
                                   />
                                </div>
                             </div>

                             {/* Summary */}
                             <div className="space-y-4">
                                <h4 className="text-xl font-bold text-text">Short Summary</h4>
                                <textarea 
                                  value={editForm.excerpt || ''}
                                  onChange={e => setEditForm({ ...editForm, excerpt: e.target.value })}
                                  rows={3}
                                  className="w-full bg-[#fafafa] border border-border/40 p-6 text-[14px] leading-relaxed italic resize-none focus:bg-white transition-all outline-none rounded-xl shadow-sm"
                                />
                             </div>

                             {/* Search & Social */}
                             <div className="space-y-8 pt-4 border-t border-border/40">
                                <div className="flex items-center gap-3">
                                   <Search className="w-4 h-4 text-accent" />
                                   <h4 className="text-xl font-bold text-text">Search & Social</h4>
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted">SEO Title</label>
                                   <input
                                     type="text"
                                     value={editForm.seoTitle || ''}
                                     onChange={e => setEditForm({ ...editForm, seoTitle: e.target.value })}
                                     placeholder="Override title for search results"
                                     aria-describedby="blog-seo-title-help"
                                     className="w-full bg-[#fafafa] border border-border/40 p-5 font-serif italic text-lg focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                                   />
                                   <p id="blog-seo-title-help" className="text-[11px] text-muted leading-relaxed">
                                     Leave blank to use the article title and short summary on the live site.
                                   </p>
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted">SEO Description</label>
                                   <textarea
                                     value={editForm.seoDescription || ''}
                                     onChange={e => setEditForm({ ...editForm, seoDescription: e.target.value })}
                                     rows={3}
                                     placeholder="Override meta description for search and social"
                                     className="w-full bg-[#fafafa] border border-border/40 p-6 text-sm leading-relaxed italic resize-none focus:bg-white transition-all outline-none rounded-xl shadow-sm"
                                   />
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Open Graph Image URL</label>
                                   <input
                                     type="text"
                                     value={editForm.ogImage || ''}
                                     onChange={e => setEditForm({ ...editForm, ogImage: e.target.value })}
                                     placeholder="https://..."
                                     className="w-full bg-[#fafafa] border border-border/40 p-4 font-mono text-[10px] text-accent focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                                   />
                                   {editForm.ogImage ? (
                                     <div className="aspect-[1.91/1] max-w-xs rounded-xl overflow-hidden border border-border/40">
                                        <img src={editForm.ogImage} alt="" className="w-full h-full object-cover" />
                                     </div>
                                   ) : null}
                                </div>
                                <div className="p-8 border border-border/40 rounded-2xl bg-[#fafafa] flex items-center justify-between shadow-sm">
                                   <div className="flex items-center gap-6">
                                      <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-sm",
                                        editForm.noindex ? "bg-accent/5 border-accent/20 text-accent" : "bg-white border-border/40 text-muted/40"
                                      )}>
                                         <EyeOff className="w-5 h-5" />
                                      </div>
                                      <div>
                                         <p className="text-[14px] font-bold text-text uppercase tracking-widest">{editForm.noindex ? 'Hidden from Search' : 'Indexable'}</p>
                                         <p className="text-[11px] text-muted leading-relaxed mt-1">
                                           {editForm.noindex
                                             ? 'Adds noindex when this article is published. Unpublished drafts are also excluded from indexing.'
                                             : 'Article may be indexed when published and this toggle is off.'}
                                         </p>
                                      </div>
                                   </div>
                                   <button
                                     type="button"
                                     onClick={() => setEditForm({ ...editForm, noindex: !editForm.noindex })}
                                     className={cn(
                                       "w-12 h-6 rounded-full relative transition-all duration-500 p-1 border shadow-inner",
                                       editForm.noindex ? "bg-accent border-accent" : "bg-white border-border/40"
                                     )}
                                   >
                                      <motion.div
                                        animate={{ x: editForm.noindex ? 24 : 0 }}
                                        className="w-4 h-4 bg-white rounded-full shadow-md"
                                      />
                                   </button>
                                </div>
                             </div>

                             {/* Cover */}

                             <div className="space-y-4">
                                <h4 className="text-xl font-bold text-text">Cover Image</h4>
                                <div className="relative group/cover">
                                   <div className="aspect-video rounded-2xl overflow-hidden border border-border/40 bg-off relative shadow-sm">
                                      <img src={editForm.thumbnail} alt="" className="w-full h-full object-cover group-hover/cover:scale-105 transition-all duration-700" />
                                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/cover:opacity-100 transition-opacity" />
                                   </div>
                                   <input 
                                     type="text"
                                     value={editForm.thumbnail || ''}
                                     onChange={e => setEditForm({ ...editForm, thumbnail: e.target.value })}
                                     className="mt-4 w-full bg-[#fafafa] border border-border/40 p-4 text-[10px] font-mono text-muted focus:bg-white focus:border-accent transition-all outline-none rounded-xl shadow-sm"
                                     placeholder="Cover Image URL"
                                   />
                                </div>
                             </div>

                             {/* Content */}
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <h4 className="text-xl font-bold text-text">Markdown Content</h4>
                                   <FileText className="w-4 h-4 text-accent/40" />
                                </div>
                                <textarea 
                                  value={editForm.content || ''}
                                  onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                                  rows={15}
                                  className="w-full bg-[#1E1E1E] text-emerald-400 p-8 font-mono text-xs leading-relaxed min-h-[400px] resize-y transition-all outline-none rounded-2xl shadow-xl border border-white/5"
                                />
                             </div>

                             {/* Status */}
                             <div className="p-8 border border-border/40 rounded-2xl bg-[#fafafa] flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-6">
                                   <div className={cn(
                                     "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-sm",
                                     editForm.isPublished ? "bg-accent/5 border-accent/20 text-accent" : "bg-white border-border/40 text-muted/40"
                                   )}>
                                      <Globe className="w-5 h-5" />
                                   </div>
                                   <div>
                                      <p className="text-[14px] font-bold text-text uppercase tracking-widest">{editForm.isPublished ? 'Live on Network' : 'Draft Mode'}</p>
                                      <p className="text-[11px] font-bold text-muted uppercase tracking-tighter mt-1">{editForm.isPublished ? 'Visible to all users' : 'Hidden from the public'}</p>
                                   </div>
                                </div>
                                <button 
                                  onClick={() => setEditForm({ ...editForm, isPublished: !editForm.isPublished })}
                                  className={cn(
                                    "w-12 h-6 rounded-full relative transition-all duration-500 p-1 border shadow-inner",
                                    editForm.isPublished ? "bg-accent border-accent" : "bg-white border-border/40"
                                   )}
                                >
                                   <motion.div 
                                     animate={{ x: editForm.isPublished ? 24 : 0 }}
                                     className="w-4 h-4 bg-white rounded-full shadow-md" 
                                   />
                                </button>
                             </div>
                          </div>

                      <div className="pt-8 sticky bottom-0 bg-white pb-8">
                         <button 
                           onClick={handleSave}
                           disabled={isSaving}
                           className="w-full py-5 bg-text text-white text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98] rounded-xl"
                         >
                           {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                           Synchronize Manuscript
                         </button>
                      </div>
                   </motion.div>
                ) : (
                   <motion.div
                     key="list"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="p-8 space-y-12"
                   >
                      <button 
                        onClick={handleAddNew}
                        className="w-full py-8 border-2 border-dashed border-border/40 rounded-[2rem] flex flex-col items-center gap-4 text-muted hover:text-accent hover:border-accent hover:bg-accent/[0.02] transition-all group"
                      >
                         <div className="w-12 h-12 rounded-full bg-off flex items-center justify-center border border-border/40 group-hover:scale-110 group-hover:rotate-90 transition-all">
                            <Plus className="w-5 h-5" />
                          </div>
                         <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Initialize New Article</span>
                      </button>

                      <div className="space-y-4">
                         <h4 className="text-[10px] font-bold text-accent/40 uppercase tracking-[0.3em] mb-6">Article Repository</h4>
                         <div className="space-y-3">
                            {data.articles.map((article) => (
                               <div 
                                 key={article.id}
                                 className="group/item flex items-center gap-6 p-6 border border-border/40 rounded-2xl hover:bg-[#fafafa] hover:border-accent/20 transition-all bg-white"
                               >
                                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-border/40 bg-off shrink-0">
                                     <img src={article.thumbnail} alt="" className="w-full h-full object-cover grayscale opacity-40 group-hover/item:opacity-100 transition-all" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-3 mb-1.5">
                                        <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{article.category}</span>
                                        <div className="w-1 h-1 rounded-full bg-border/40" />
                                        <div className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          article.isPublished ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-amber-500"
                                        )} />
                                     </div>
                                     <h5 className="font-serif italic text-lg text-text truncate group-hover/item:text-accent transition-colors">{article.title}</h5>
                                  </div>
                                  <div className="flex gap-2">
                                     <button 
                                       onClick={() => handleEdit(article)}
                                       className="w-10 h-10 rounded-xl bg-white border border-border/40 flex items-center justify-center text-muted hover:text-accent hover:border-accent hover:bg-white shadow-sm transition-all"
                                     >
                                        <Edit2 className="w-4 h-4" />
                                     </button>
                                     <button 
                                       onClick={() => handleDelete(article.id)}
                                       className="w-10 h-10 rounded-xl bg-white border border-border/40 flex items-center justify-center text-muted hover:text-rose-500 hover:border-rose-200 shadow-sm transition-all"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
       </motion.div>

       {/* Main Studio View */}
       <AnimatePresence>
          {isPreviewVisible && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="flex-1 overflow-hidden flex flex-col relative bg-white"
             >
                <div className="absolute inset-0 bg-off/5 pointer-events-none" />
                
                <div className="flex-1 relative group">
                   <div className="h-full w-full overflow-hidden relative z-10">
                      <LivePreview 
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        isSidebarCollapsed={isSidebarCollapsed}
                      />
                   </div>
                </div>
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};
