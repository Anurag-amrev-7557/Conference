import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import type { CommunityComment } from '../../lib/websiteData';

function timeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins";
  return Math.floor(seconds) + " seconds";
}

interface CommentSectionProps {
  comments: CommunityComment[];
  onAddComment: (content: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-10">
      <div className="pt-10 border-t border-border/40">
        <h3 className="text-xl font-serif italic text-text mb-8">Hub Discussion ({comments.length})</h3>
        
        {/* New Comment Input */}
        <form onSubmit={handleSubmit} className="mb-12 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your insights..."
            className="w-full px-6 py-5 bg-off border border-border/40 rounded-[24px] focus:bg-white focus:border-accent transition-all text-sm outline-none resize-none min-h-[120px]"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="absolute bottom-4 right-4 p-3 bg-text text-white rounded-xl hover:bg-accent transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-8">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4"
              >
                <img 
                  src={comment.authorAvatar || 'https://via.placeholder.com/40'} 
                  alt={comment.authorName} 
                  className="w-10 h-10 rounded-xl object-cover border border-border/40 shrink-0"
                />
                <div className="flex-1">
                  <div className="bg-white p-5 rounded-[24px] border border-border/40 shadow-sm mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-text">{comment.authorName}</span>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest">
                        {timeAgo(comment.createdAt)} ago
                      </span>
                    </div>
                    <p className="text-sm text-text2 leading-relaxed">{comment.content}</p>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent2 transition-colors ml-4">
                    Reply
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 text-muted font-serif italic text-lg opacity-60">
              No shared insights in this discussion yet. Be the first to add value.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
