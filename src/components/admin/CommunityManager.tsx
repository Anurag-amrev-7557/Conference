import React, { useState } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { api } from '../../lib/api';
import type { CommunityPost } from '../../lib/websiteData';
import { Trash2, Pin, PinOff, Loader2, MessageSquare, Pencil } from 'lucide-react';
import type { CommunityComment } from '../../lib/websiteData';
import { motion } from 'framer-motion';

export const CommunityManager: React.FC = () => {
  const { data, refresh } = useWebsiteData();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const getToken = () => localStorage.getItem('adminToken') || '';

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this community post?')) return;
    setBusyId(id);
    try {
      await api.deleteAdminCommunityPost(getToken(), id);
      await refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to delete post');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    setBusyId(commentId);
    try {
      await api.deleteAdminCommunityComment(getToken(), commentId);
      await refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment');
    } finally {
      setBusyId(null);
    }
  };

  const startEditPost = (post: CommunityPost) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleSavePost = async (id: string) => {
    setBusyId(id);
    try {
      await api.updateAdminCommunityPost(getToken(), id, {
        title: editTitle,
        content: editContent,
      });
      setEditingPostId(null);
      await refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update post');
    } finally {
      setBusyId(null);
    }
  };

  const handlePin = async (post: CommunityPost) => {
    setBusyId(post.id);
    try {
      await api.pinAdminCommunityPost(getToken(), post.id, !post.isPinned);
      await refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update pin');
    } finally {
      setBusyId(null);
    }
  };

  const posts = [...data.communityPosts].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 lg:p-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h3 className="text-3xl font-serif italic text-text mb-2">Community</h3>
        <p className="text-sm text-muted">
          Moderate posts — delete spam and pin featured discussions.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-border/40 overflow-hidden shadow-alabaster"
      >
        {posts.length === 0 ? (
          <motion.div className="p-16 text-center text-muted">
            <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-40" />
            <p className="text-sm font-bold uppercase tracking-widest">No community posts yet</p>
          </motion.div>
        ) : (
          <ul className="divide-y divide-border/40">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex items-start gap-4 p-6 hover:bg-off/30 transition-colors"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 min-w-0"
                >
                  <motion.div className="flex items-center gap-2 mb-2">
                    {post.isPinned && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        Pinned
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                      {post.category}
                    </span>
                  </motion.div>
                  {editingPostId === post.id ? (
                    <div className="space-y-3 w-full">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border border-border rounded-xl p-3 text-sm"
                      />
                      <textarea
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full border border-border rounded-xl p-3 text-sm resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSavePost(post.id)}
                          disabled={busyId === post.id}
                          className="text-xs font-bold uppercase tracking-widest text-accent"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPostId(null)}
                          className="text-xs text-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-lg font-serif italic text-text truncate">{post.title}</h4>
                      <p className="text-sm text-muted mt-1 line-clamp-2">{post.content}</p>
                    </>
                  )}
                  <p className="text-xs text-muted mt-2">
                    {post.authorName} · {post.votes} votes · {post.comments?.length ?? 0}{' '}
                    comments
                  </p>
                  {(post.comments?.length ?? 0) > 0 ? (
                    <ul className="mt-3 space-y-2 border-t border-border/30 pt-3">
                      {post.comments.map((c: CommunityComment) => (
                        <li
                          key={c.id}
                          className="flex items-start justify-between gap-2 text-xs text-muted"
                        >
                          <span className="line-clamp-2">
                            <strong className="text-text">{c.authorName}:</strong> {c.content}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            disabled={busyId === c.id}
                            className="shrink-0 text-rose-600 hover:underline"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </motion.div>
                <motion.div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditPost(post)}
                    disabled={busyId === post.id}
                    className="p-2.5 rounded-xl border border-border hover:border-accent text-muted hover:text-accent transition-colors disabled:opacity-50"
                    title="Edit post"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePin(post)}
                    disabled={busyId === post.id}
                    className="p-2.5 rounded-xl border border-border hover:border-accent text-muted hover:text-accent transition-colors disabled:opacity-50"
                    title={post.isPinned ? 'Unpin' : 'Pin'}
                  >
                    {busyId === post.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : post.isPinned ? (
                      <PinOff className="w-4 h-4" />
                    ) : (
                      <Pin className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    disabled={busyId === post.id}
                    className="p-2.5 rounded-xl border border-border hover:border-rose-500 text-muted hover:text-rose-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
};
