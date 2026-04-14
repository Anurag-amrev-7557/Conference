import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string, category: string) => void;
}

const CATEGORIES = ["Architecture", "Prompt Engineering", "No-Code", "Strategy", "Venture", "General"];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title, content, category);
      setTitle('');
      setContent('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-text/40 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-border/20 overflow-hidden"
          >
            <div className="p-8 sm:p-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/5 rounded-2xl flex items-center justify-center border border-accent/10">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif italic text-text">Post to Founder Hub</h2>
                    <p className="text-[11px] font-bold text-muted uppercase tracking-widest mt-1">Superhumanly AI Founder Network</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-off rounded-full transition-colors">
                  <X className="w-6 h-6 text-muted" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted pl-1">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                          category === cat 
                            ? 'bg-accent text-white border-accent shadow-lg shadow-accent/10' 
                            : 'bg-white text-muted border-border/60 hover:border-accent/40'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted pl-1">Discussion Title</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ask a technical question..."
                    className="w-full px-6 py-4 bg-off border border-border/40 rounded-2xl focus:bg-white focus:border-accent transition-all text-text font-medium outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted pl-1">Content Details</label>
                  <textarea
                    required
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Provide context or elaborate on your query..."
                    className="w-full px-6 py-4 bg-off border border-border/40 rounded-2xl focus:bg-white focus:border-accent transition-all text-sm leading-relaxed text-text outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-text text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent transition-all shadow-xl group"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Publish to Network Feed
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
