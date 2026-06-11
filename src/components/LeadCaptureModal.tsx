import React, { useId, useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, Building2, User, Mail } from 'lucide-react';
import { useWebsiteData } from './WebsiteDataProvider';
import { AppDialog } from './ui/AppDialog';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClassName =
  'w-full min-h-11 pl-12 pr-4 rounded-2xl border border-border/80 bg-off outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2';

export function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const { data } = useWebsiteData();
  const modal = data.settings.leadCaptureModal ?? {};
  const nameId = useId();
  const emailId = useId();
  const companyId = useId();
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setFormData({ name: '', email: '', company: '' });
      }, 2000);
    } catch {
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
      title={modal.title?.trim() || 'Request Strategy Session'}
      description={modal.lede?.trim() || 'Lead capture for strategy session'}
      className="max-w-lg"
    >
      {status === 'success' ? (
        <div
          className="flex flex-col items-center text-center py-6"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" aria-hidden />
          <p className="text-2xl font-semibold tracking-tight mb-2">
            {modal.successTitle?.trim() || 'Identity synchronized'}
          </p>
          <p className="text-muted text-sm">
            {modal.successMessage?.trim() || 'Your discovery node is initialized.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-muted text-base mb-2">
            {modal.lede?.trim() || 'Join innovators scaling with Agentic AI.'}
          </p>
          <div className="space-y-2">
            <label
              htmlFor={nameId}
              className="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Full name
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                size={18}
                aria-hidden
              />
              <input
                id={nameId}
                type="text"
                name="name"
                autoComplete="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClassName}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor={emailId}
              className="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                size={18}
                aria-hidden
              />
              <input
                id={emailId}
                type="email"
                name="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClassName}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor={companyId}
              className="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Company
            </label>
            <div className="relative">
              <Building2
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                size={18}
                aria-hidden
              />
              <input
                id={companyId}
                type="text"
                name="organization"
                autoComplete="organization"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={inputClassName}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full min-h-11 py-4 bg-text text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-accent disabled:opacity-70 transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
          >
            {status === 'loading' ? (
              <Loader2 className="animate-spin" aria-label="Submitting" />
            ) : (
              <>
                Request Access <ArrowRight size={18} aria-hidden />
              </>
            )}
          </button>
        </form>
      )}
    </AppDialog>
  );
}
