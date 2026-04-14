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
    <div className="flex flex-col gap-8">
      {/* Feed Header / Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-white rounded-2xl border border-border/40 pl-12 pr-4 text-sm focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-off p-1 rounded-xl border border-border/20">
            {(['New', 'Top'] as const).map(sort => (
              <button
                key={sort}
                onClick={() => setActiveSort(sort)}
                className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  activeSort === sort ? 'bg-white text-text shadow-sm' : 'text-muted hover:text-text'
                }`}
              >
                {sort}
              </button>
            ))}
          </div>
          
          <button
            onClick={onCreateClick}
            className="h-12 w-12 sm:w-auto sm:px-6 bg-accent text-white rounded-xl flex items-center justify-center gap-2 font-bold text-[12px] uppercase tracking-wider hover:bg-accent2 transition-all shadow-lg shadow-accent/20"
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Start Discussion</span>
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-6 pb-20">
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
              className="py-20 text-center bg-white rounded-[32px] border border-dashed border-border/40"
            >
              <div className="text-muted font-serif italic text-xl">No discussions found matching your search.</div>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-accent font-bold uppercase tracking-widest text-[10px]"
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
