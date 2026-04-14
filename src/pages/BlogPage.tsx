import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWebsiteData } from '../components/WebsiteDataProvider';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = ['ALL', 'RESEARCH', 'STRATEGY', 'PLAYBOOK', 'GUIDE'];

export const BlogPage: React.FC = () => {
  const { data } = useWebsiteData();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  const articles = data.articles.filter(a => a.isPublished);
  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);
  
  const filteredArticles = selectedCategory === 'ALL' 
    ? remainingArticles 
    : remainingArticles.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-off">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 sm:px-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-20 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] font-bold text-accent uppercase tracking-[0.4em] mb-4 block"
          >
            Dispatch
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[clamp(40px,8vw,80px)] font-serif italic text-text leading-none mb-6"
          >
            The <span className="text-accent not-italic">Agentic AI</span> Playbook
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted max-w-2xl mx-auto font-light"
          >
            Diving deep into the architecture of agentic systems, no-code automation, and the future of business intelligence.
          </motion.p>
        </header>

        {/* Featured Post */}
        {featuredArticle && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-32"
          >
            <Link to={`/blog/${featuredArticle.slug}`} className="group block">
              <div className="relative aspect-[21/9] rounded-[32px] overflow-hidden bg-white shadow-2xl shadow-accent/5">
                <img 
                  src={featuredArticle.thumbnail} 
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-8 sm:p-12 w-full">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="px-4 py-1.5 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                      Featured
                    </span>
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                      {featuredArticle.time} READ
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white mb-6 max-w-4xl group-hover:text-accent transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <div className="flex items-center gap-4">
                    <img src={featuredArticle.authorAvatar} alt="" className="w-10 h-10 rounded-full border border-white/20" />
                    <div>
                      <p className="text-white font-bold text-sm tracking-wide">{featuredArticle.authorName}</p>
                      <p className="text-white/60 text-xs">{featuredArticle.publishedAt}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.section>
        )}

        {/* Filters & Grid */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-16">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all ${
                    selectedCategory === cat 
                      ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                      : 'bg-white text-muted hover:text-text border border-border/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources..."
                className="pl-12 pr-6 py-3 bg-white rounded-full border border-border/50 focus:border-accent focus:ring-1 focus:ring-accent outline-none w-64 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredArticles.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col"
              >
                <Link to={`/blog/${article.slug}`} className="flex flex-col h-full">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-8 bg-white shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
                    <img 
                      src={article.thumbnail} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-accent text-[9px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-medium text-muted uppercase tracking-widest">{article.time} READ</span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-medium text-muted uppercase tracking-widest">{article.publishedAt}</span>
                    </div>
                    <h3 className="text-2xl font-serif mb-4 group-hover:text-accent transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-muted text-[15px] leading-relaxed mb-8 font-light line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={article.authorAvatar} alt="" className="w-8 h-8 rounded-full bg-zinc-100" />
                        <span className="text-[11px] font-bold tracking-wide uppercase">{article.authorName}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="mt-40 bg-zinc-900 rounded-[40px] p-8 sm:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
             {/* Abstract design element */}
             <div className="w-full h-full bg-accent blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="text-accent text-[12px] font-bold uppercase tracking-[0.4em] mb-6 block">Stay Ahead</span>
            <h2 className="text-4xl sm:text-6xl font-serif text-white mb-8 leading-tight">
              Get the latest <span className="italic font-normal">intelligence</span> delivered.
            </h2>
            <p className="text-white/60 text-lg mb-12 font-light">
              Join 2,500+ builders and business owners receiving our weekly automation playbooks on Agentic AI.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-accent transition-colors"
                required
              />
              <button className="px-10 py-4 bg-accent text-white font-bold rounded-2xl hover:bg-accent2 transition-all whitespace-nowrap">
                Subscribe Now
              </button>
            </form>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};
