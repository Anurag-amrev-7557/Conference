import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, MessageSquare, Pin, Clock } from 'lucide-react';
import type { CommunityPost } from '../../lib/websiteData';

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

interface PostCardProps {
  post: CommunityPost;
  onVote: (id: string, delta: number) => void;
  onClick: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onVote, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[32px] border border-border/40 p-6 sm:p-8 hover:border-accent/30 transition-all shadow-alabaster group cursor-pointer"
      onClick={() => onClick(post.id)}
    >
      <div className="flex gap-6">
        {/* Voting Sidebar */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onVote(post.id, 1); }}
            className="p-1.5 rounded-lg hover:bg-accent/5 transition-colors text-muted hover:text-accent"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <span className="text-[14px] font-bold text-text tabular-nums">{post.votes}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onVote(post.id, -1); }}
            className="p-1.5 rounded-lg hover:bg-accent/5 transition-colors text-muted hover:text-accent"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-accent/5 border border-accent/10 rounded-full text-[10px] font-black uppercase tracking-widest text-accent">
              {post.category}
            </span>
            {post.isPinned && (
              <div className="flex items-center gap-1 text-accent">
                <Pin className="w-3.5 h-3.5 fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Pinned</span>
              </div>
            )}
            <span className="text-[11px] text-muted font-medium flex items-center gap-1.5 ml-auto">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo(post.createdAt)} ago
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-medium text-text mb-4 leading-tight group-hover:text-accent transition-colors">
            {post.title}
          </h3>
          
          <p className="text-muted text-[15px] leading-relaxed line-clamp-3 mb-8">
            {post.content}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              <img 
                src={post.authorAvatar} 
                alt={post.authorName} 
                className="w-10 h-10 rounded-2xl object-cover border border-border/40"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text">{post.authorName}</span>
                <span className="text-[11px] text-muted uppercase tracking-wider font-semibold">{post.authorRole}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-off rounded-2xl border border-border/20 text-muted">
              <MessageSquare className="w-4 h-4" />
              <span className="text-[13px] font-bold">{post.comments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
