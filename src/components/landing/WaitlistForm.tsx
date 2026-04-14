import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { MarketingService } from '../../lib/marketing';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    
    // Simulating API call
    setTimeout(() => {
      MarketingService.identify(email);
      MarketingService.logEvent('form_submit', { location: 'waitlist_form' });
      setStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <div id="cta-form" className="w-full">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 px-6 border-[0.5px] border-accent/20 rounded-[32px] bg-accent/5 backdrop-blur-md"
          >
            <CheckCircle2 className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-serif italic text-text mb-2">Thank You</h3>
            <p className="text-[12px] font-bold text-muted uppercase tracking-[0.2em] text-center">We'll send the guide to your inbox shortly.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="relative flex flex-col gap-8"
          >
            <div className="relative group">
              <label className="text-[16px] pl-4 font-semibold text-muted mb-2 block">Get our exclusive Guide on Building AI Agents</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to receive the playbook"
                required
                disabled={status === 'loading'}
                className="w-full h-14 bg-white/40 border-[0.5px] border-border/80 rounded-full px-6 focus:border-accent focus:bg-white/80 transition-all text-text font-sans text-[15px] placeholder:text-muted/40 focus:outline-none backdrop-blur-md shadow-sm"
              />
            </div>
            
            <div className="flex flex-col gap-6">
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="group relative flex items-center justify-center gap-4 bg-text text-white px-10 h-16 rounded-full font-bold text-[14px] uppercase tracking-[0.2em] transition-all hover:bg-accent hover:shadow-[0_0_30px_rgba(0,82,204,0.3)] disabled:opacity-70 w-full"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">Get the Playbook Now</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                  </>
                )}
              </button>
              
              <p className="text-[16px] text-black opacity-60 text-center">Join 2,500+ innovators scaling with Agentic AI.</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
