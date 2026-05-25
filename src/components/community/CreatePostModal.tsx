import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { AppDialog } from '../ui/AppDialog';

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
    <AppDialog
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title="Post to Founder Hub"
      description="Create a discussion in the founder network"
      className="max-w-2xl"
    >
      <div className="flex items-center gap-3 mb-8 -mt-2">
        <div className="w-12 h-12 bg-accent/5 rounded-2xl flex items-center justify-center border border-accent/10">
          <Sparkles className="w-6 h-6 text-accent" />
        </div>
        <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Superhumanly AI Founder Network</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest text-muted pl-1">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-11 px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
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
            className="w-full min-h-11 px-6 py-4 bg-off border border-border/40 rounded-2xl focus:bg-white focus:border-accent transition-all text-text font-medium outline-none"
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
            className="w-full px-6 py-4 bg-off border border-border/40 rounded-2xl focus:bg-white focus:border-accent transition-all text-base leading-relaxed text-text outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full min-h-11 py-5 bg-text text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent transition-all shadow-xl group"
        >
          <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          Publish to Network Feed
        </button>
      </form>
    </AppDialog>
  );
};
