import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebsiteData } from '../components/WebsiteDataProvider';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CommunityFeed } from '../components/community/CommunityFeed';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { CommentSection } from '../components/community/CommentSection';
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { SeoHead } from '../seo/SeoHead';
import { usePageSeo } from '../seo/usePageSeo';
const COMMUNITY_AUTHOR_KEY = 'book_community_author_name';
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop';

export const CommunityPage: React.FC = () => {
  const { data, createPost, addComment, votePost } = useWebsiteData();
  const seo = usePageSeo();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const selectedPost = useMemo(() => 
    data.communityPosts.find(p => p.id === selectedPostId),
    [data.communityPosts, selectedPostId]
  );

  const categories = useMemo(() => 
    ['All', ...Array.from(new Set(data.communityPosts.map(p => p.category)))],
    [data.communityPosts]
  );

  const filteredPosts = useMemo(() => 
    activeCategory === 'All' 
      ? data.communityPosts 
      : data.communityPosts.filter(p => p.category === activeCategory),
    [data.communityPosts, activeCategory]
  );

  const getAuthorName = () =>
    localStorage.getItem(COMMUNITY_AUTHOR_KEY)?.trim() || 'Community Member';

  const handleVote = async (postId: string, _delta?: number) => {
    try {
      await votePost(postId);
    } catch {
      alert('Failed to register vote');
    }
  };

  const handleAddPost = async (title: string, content: string, category: string) => {
    const savedName = localStorage.getItem(COMMUNITY_AUTHOR_KEY)?.trim();
    const authorName = savedName || 'Community Member';
    if (!savedName) {
      localStorage.setItem(COMMUNITY_AUTHOR_KEY, authorName);
    }
    const newPost: any = {
      title,
      content,
      category,
      authorName,
      authorAvatar: DEFAULT_AVATAR,
      authorRole: 'New Contributor',
    };
    try {
      await createPost(newPost);
    } catch (err) {
      alert('Failed to create post');
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    const authorName = getAuthorName();
    const newComment: any = {
      content,
      authorName,
      authorAvatar: DEFAULT_AVATAR,
    };
    try {
      await addComment(postId, newComment);
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  return (
    <>
    <SeoHead seo={seo} />
    <div className="min-h-screen bg-off selection:bg-accent/20">
      <Navbar />
      
      <main className="container mx-auto px-6 sm:px-10 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar: Navigation & Identity */}
          <aside className="lg:col-span-3 space-y-10 order-2 lg:order-1">
            <div className="bg-white p-8 rounded-[40px] border border-border/40 shadow-alabaster">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-accent/5 rounded-2xl flex items-center justify-center border border-accent/10">
                  <Plus className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-serif italic text-text">Spaces</h3>
              </div>
              <nav className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSelectedPostId(null); }}
                    className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                      activeCategory === cat 
                        ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                        : 'text-muted hover:bg-off hover:text-text'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-text text-white p-8 rounded-[40px] border border-white/10 shadow-alabaster overflow-hidden relative group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">Network Growth</span>
                </div>
                <h4 className="text-2xl font-serif italic mb-4">Community Reach</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Members</span>
                    <span className="text-xl font-medium">2.5K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Active Now</span>
                    <span className="text-xl font-medium text-accent">142</span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
            </div>
          </aside>

          {/* Center Column: Post Feed or Detail View */}
          <section className="lg:col-span-9 space-y-12 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {selectedPostId && selectedPost ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  {/* Detail Navigation */}
                  <button 
                    onClick={() => setSelectedPostId(null)}
                    className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted hover:text-accent transition-colors mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Feed
                  </button>

                  {/* Detailed Post View */}
                  <div className="bg-white rounded-[40px] border border-border/40 p-10 shadow-alabaster">
                    <div className="flex items-center gap-3 mb-8">
                       <span className="px-4 py-1.5 bg-accent/5 border border-accent/10 rounded-full text-[10px] font-black uppercase tracking-widest text-accent">
                        {selectedPost.category}
                      </span>
                      <span className="text-[11px] text-muted font-bold ml-auto uppercase tracking-widest">
                        Published {new Date(selectedPost.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-serif italic text-text mb-8 leading-tight">
                      {selectedPost.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-10 pb-10 border-b border-border/40">
                      <img 
                        src={selectedPost.authorAvatar} 
                        alt={selectedPost.authorName} 
                        className="w-14 h-14 rounded-2xl object-cover border border-border/40 shadow-sm"
                      />
                      <div>
                        <p className="text-lg font-bold text-text mb-1">{selectedPost.authorName}</p>
                        <p className="text-xs font-bold text-muted uppercase tracking-widest">{selectedPost.authorRole}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-4">
                        <div className="text-center px-6 border-l border-border/40">
                           <p className="text-2xl font-medium text-text">{selectedPost.votes}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted">Upvotes</p>
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-slate max-w-none text-lg text-text2 leading-relaxed font-light mb-12">
                      {selectedPost.content}
                    </div>

                    {/* Collaborative Discussion (Comments) */}
                    <CommentSection 
                      comments={selectedPost.comments} 
                      onAddComment={(content) => handleAddComment(selectedPost.id, content)} 
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  <div className="flex flex-col gap-4">
                    <span className="text-[12px] font-black text-accent uppercase tracking-[0.4em]">Founder Hub</span>
                    <h1 className="text-5xl sm:text-7xl font-serif italic text-text leading-tight">
                      Agentic <span className="text-accent font-normal not-italic">Networking</span>.
                    </h1>
                    <p className="text-xl text-muted max-w-2xl font-light leading-relaxed">
                      Connect with the world's most innovative AI founders and builders. Peer-vetted strategic discussions on scaling business with artificial intelligence.
                    </p>
                  </div>

                  <CommunityFeed 
                    posts={filteredPosts} 
                    onVote={handleVote} 
                    onPostClick={setSelectedPostId} 
                    onCreateClick={() => setIsCreateModalOpen(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleAddPost} 
      />
      
      <Footer />
    </div>
    </>
  );
};
