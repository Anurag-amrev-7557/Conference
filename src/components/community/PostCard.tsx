import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, MessageSquare, Pin, Share2, MoreHorizontal } from 'lucide-react';
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
      className="community-post-card group cursor-pointer px-0 py-0 transition-all duration-200"
      onClick={() => onClick(post.id)}
    >
      <div className="rounded-lg bg-transparent p-3 text-text sm:p-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[12px] text-muted">
            <span className="font-semibold text-text">r/{post.category.toLowerCase().replace(/\s+/g, '')}</span>
            <span aria-hidden>•</span>
            <span>{timeAgo(post.createdAt)} ago</span>
            {post.isPinned && (
              <div className="ml-1 flex items-center gap-1 text-accent">
                <Pin className="w-3.5 h-3.5 fill-current" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">Pinned</span>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto rounded-full p-1 text-muted hover:bg-off hover:text-text"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <h3 className="community-post-title mb-2 text-[1.45rem] font-semibold leading-tight tracking-tight text-text sm:text-[1.7rem]">
            {post.title}
          </h3>
          
          <p className="community-post-body mb-4 line-clamp-4 text-[1rem] leading-7 text-muted">
            {post.content}
          </p>

          <div className="mt-auto flex items-center gap-2 text-muted">
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-white px-2 py-1 text-[12px] font-medium hover:bg-off"
            >
              <ChevronUp
                className="h-3.5 w-3.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(post.id, 1);
                }}
              />
              <span className="px-0.5">{post.votes}</span>
              <ChevronDown
                className="h-3.5 w-3.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(post.id, -1);
                }}
              />
            </button>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white px-3 py-1 text-[12px] font-medium hover:bg-off"
              aria-label="Comments"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {post.comments.length}
            </button>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white px-3 py-1 text-[12px] font-medium hover:bg-off"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            <div className="ml-auto text-[12px] text-muted">
              {post.authorName}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
