import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle2, Loader2, Sparkles, Building2, User, Mail } from 'lucide-react';
import { MarketingService } from '../lib/marketing';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Mimic API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Identity Synchronized with Marketing Hub
    MarketingService.identify(formData.email);
    MarketingService.logEvent('form_submit', { 
      context: 'lead_capture_modal', 
      name: formData.name, 
      company: formData.company 
    });
    
    setStatus('success');
    setTimeout(() => {
      onClose();
      setStatus('idle');
      setFormData({ name: '', email: '', company: '' });
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Brand Aura */}
            <div className="h-2 bg-gradient-to-r from-accent via-accent2 to-accent" />
            
            <div className="p-8 md:p-12">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-2 hover:bg-bg-off rounded-full transition-colors text-muted"
              >
                <X size={20} />
              </button>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="relative mb-8">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-green-500 rounded-full blur-2xl"
                      />
                      <div className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-sm border border-green-100">
                        <CheckCircle2 size={48} />
                      </div>
                    </div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl font-serif italic mb-4"
                    >
                      Identity <span className="text-green-600 not-italic">Synchronized</span>
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ delay: 0.4 }}
                      className="text-muted text-[11px] font-black uppercase tracking-[0.3em] max-w-[280px] leading-relaxed"
                    >
                      Our agent cluster has initialized your discovery node.
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0, y: -10 }}>
                    <div className="mb-10 text-center md:text-left">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest mb-4 border border-accent/20">
                        <Sparkles size={10} className="mr-1.5" /> Discovery Node
                      </div>
                      <h2 className="text-4xl font-serif italic text-text leading-tight mb-3">Request Strategy <span className="text-accent not-italic">Session</span>.</h2>
                      <p className="text-muted leading-relaxed">Join 2,500+ innovators scaling their business units with Agentic AI systems.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-muted uppercase tracking-[0.2em] ml-1">Full Identity</label>
                        <div className="relative group">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} />
                          <input 
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="John Doe"
                            className="w-full h-14 pl-14 pr-6 bg-bg-off border-[0.5px] border-border/80 rounded-2xl focus:border-accent focus:bg-white transition-all text-text font-sans focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-muted uppercase tracking-[0.2em] ml-1">Primary Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} />
                          <input 
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="john@enterprise.com"
                            className="w-full h-14 pl-14 pr-6 bg-bg-off border-[0.5px] border-border/80 rounded-2xl focus:border-accent focus:bg-white transition-all text-text font-sans focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-muted uppercase tracking-[0.2em] ml-1">Enterprise Unit</label>
                        <div className="relative group">
                          <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} />
                          <input 
                            type="text"
                            required
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                            placeholder="Acme Inc."
                            className="w-full h-14 pl-14 pr-6 bg-bg-off border-[0.5px] border-border/80 rounded-2xl focus:border-accent focus:bg-white transition-all text-text font-sans focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full h-16 bg-text text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent hover:shadow-xl hover:shadow-accent/20 transition-all group disabled:opacity-70 mt-4"
                      >
                        {status === 'loading' ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <>
                            <span>Request Access</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
