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
    <div className="community-page-canvas min-h-screen overflow-x-hidden selection:bg-accent/20">
      <Navbar />
      
      <main className="community-page-shell mx-auto pt-25 pb-20 sm:pt-25">
        <div className="community-page-grid border-t border-border/65">
          
          {/* Left Sidebar: Navigation & Identity */}
          <aside className="community-page-sidebar order-2 lg:order-1 lg:self-start">
            <div className="community-sidebar-rail pl-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/20 bg-accent/5">
                  <Plus className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-md font-semibold uppercase mb-0 tracking-[0.14em] text-muted">Spaces</h3>
              </div>

              <nav className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSelectedPostId(null); }}
                    className={`community-sidebar-item w-full rounded-md px-3 py-2 text-left text-base ${
                      activeCategory === cat ? 'community-sidebar-item--active' : ''
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>

              <div className="my-5 border-t border-border/65" />

              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Network Growth</span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Members</span>
                  <span className="font-semibold text-text">2.5K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Active now</span>
                  <span className="font-semibold text-accent">142</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Center Column: Post Feed or Detail View */}
          <section className="community-page-main order-1 space-y-6 lg:order-2">
            <AnimatePresence mode="wait">
              {selectedPostId && selectedPost ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 pt-4"
                >
                  {/* Detail Navigation */}
                  <button 
                    onClick={() => setSelectedPostId(null)}
                    className="mb-2 cursor-pointer inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent border border-border/65 rounded-full px-4 py-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Feed
                  </button>

                  {/* Detailed Post View */}
                  <div className="community-detail-wrap mt-2">

                    <div className="flex items-center gap-4 pb-4">
                      <img 
                        src={selectedPost.authorAvatar} 
                        alt={selectedPost.authorName} 
                        className="w-12 h-12 rounded-full object-cover border border-border/40 shadow-sm"
                      />
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1">
                          <span className="rounded-full text-base text-accent">
                            {selectedPost.category}
                          </span>
                          <span className="text-black text-sm" aria-hidden>•</span>
                          <span className="text-sm font-normal text-muted">
                            {new Date(selectedPost.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <p className="mb-1 text-base font-semibold text-text">{selectedPost.authorName}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{selectedPost.authorRole}</p>
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-4">
                        <div className="border-l border-border/40 px-6 text-center">
                           <p className="text-2xl font-medium text-text">{selectedPost.votes}</p>
                           <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Upvotes</p>
                        </div>
                      </div>
                    </div>

                    <h1 className="mb-3 text-3xl font-normal leading-tight tracking-tight text-text sm:text-5xl">
                      {selectedPost.title}
                    </h1>

                    <div className="prose prose-slate max-w-none text-[1.03rem] leading-7 text-text2">
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
                  className="space-y-8"
                >
                  <div className="space-y-3 pb-2 mb-0 mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Founder Hub</span>
                    <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-text sm:text-5xl">
                      Agentic <span className="text-accent">Networking</span>
                    </h1>
                    <p className="max-w-4xl text-base leading-7 text-muted">
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
