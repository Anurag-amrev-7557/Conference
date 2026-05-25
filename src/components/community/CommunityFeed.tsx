import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { PostCard } from './PostCard';
import type { CommunityPost } from '../../lib/websiteData';

interface CommunityFeedProps {
  posts: CommunityPost[];
  onVote: (id: string, delta: number) => void;
  onPostClick: (id: string) => void;
  onCreateClick: () => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ 
  posts, 
  onVote, 
  onPostClick,
  onCreateClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState<'New' | 'Top'>('New');

  const filteredPosts = posts
    .filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (activeSort === 'Top') return b.votes - a.votes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="community-feed flex flex-col gap-4">
      {/* Feed Header / Controls */}
      <div className="community-feed-controls z-20 flex flex-col gap-3 px-0 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="group relative w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-accent" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="community-feed-search h-11 w-full pl-11 pr-4 text-sm outline-none transition-all"
          />
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="community-feed-sort-wrap flex p-1">
            {(['New', 'Top'] as const).map(sort => (
              <button
                key={sort}
                onClick={() => setActiveSort(sort)}
                className={`community-feed-sort-btn rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all ${
                  activeSort === sort ? 'bg-white text-text shadow-[0_4px_12px_rgba(0,0,0,0.08)]' : 'text-muted hover:text-text'
                }`}
              >
                {sort}
              </button>
            ))}
          </div>
          
          <button
            onClick={onCreateClick}
            className="community-feed-cta inline-flex h-11 w-11 items-center justify-center gap-2 rounded-full bg-accent text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent2 sm:w-auto sm:px-5"
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap">Start Discussion</span>
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="community-post-list pb-20">
        <AnimatePresence mode="popLayout">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onVote={onVote} 
                onClick={onPostClick} 
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[24px] border border-dashed border-border/50 bg-white py-20 text-center"
            >
              <div className="text-xl font-medium text-muted">No discussions found matching your search.</div>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent"
              >
                Clear Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
