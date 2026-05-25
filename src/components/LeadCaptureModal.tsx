import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, Building2, User, Mail } from 'lucide-react';
import { MarketingService } from '../lib/marketing';
import { AppDialog } from './ui/AppDialog';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      MarketingService.identify(formData.email);
      await MarketingService.logEvent('form_submit', {
        context: 'lead_capture_modal',
        name: formData.name,
        company: formData.company,
      });
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setFormData({ name: '', email: '', company: '' });
      }, 2000);
    } catch (error) {
      console.error('[Marketing] Critical Lead Drop:', error);
      setStatus('idle');
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      if (status === 'success') {
        setStatus('idle');
        setFormData({ name: '', email: '', company: '' });
      }
    }
  };

  return (
    <AppDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Request Strategy Session"
      description="Lead capture for strategy session"
      className="max-w-lg"
    >
      {status === 'success' ? (
        <div className="flex flex-col items-center text-center py-6">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <p className="text-2xl font-serif italic mb-2">Identity synchronized</p>
          <p className="text-muted text-sm">Your discovery node is initialized.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-muted text-base mb-2">Join innovators scaling with Agentic AI.</p>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted">Full name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full min-h-11 pl-12 pr-4 rounded-2xl border border-border/80 bg-off outline-none focus:border-accent" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full min-h-11 pl-12 pr-4 rounded-2xl border border-border/80 bg-off outline-none focus:border-accent" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted">Company</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full min-h-11 pl-12 pr-4 rounded-2xl border border-border/80 bg-off outline-none focus:border-accent" />
            </div>
          </div>
          <button type="submit" disabled={status === 'loading'} className="w-full min-h-11 py-4 bg-text text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent disabled:opacity-70">
            {status === 'loading' ? <Loader2 className="animate-spin" /> : <>Request Access <ArrowRight size={18} /></>}
          </button>
        </form>
      )}
    </AppDialog>
  );
}
