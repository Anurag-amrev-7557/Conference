/**
 * Email-agent integration via book API proxy (Phase 3: MKT-01, D-07, D-08).
 */
import { useState } from 'react';
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppDialog } from './ui/AppDialog';

export function ContactSupportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMsg, setResponseMsg] = useState('');
  const [agentReply, setAgentReply] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/v1/marketing/email-agent/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: email,
          sender: 'support@bookwebsite.com',
          subject,
          body,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.reply_body || data.message || 'Your request has been received and processed.';
      setAgentReply(reply);
      setResponseMsg('Your support request has been processed by our AI agent.');
      setStatus('success');
    } catch (error) {
      console.error('Support request error:', error);
      setStatus('error');
      setResponseMsg(
        `Support request failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please email support@bookwebsite.com directly.`,
      );
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setResponseMsg('');
    setAgentReply('');
    setEmail('');
    setSubject('');
    setBody('');
    onClose();
  };

  return (
    <AppDialog
      open={isOpen}
      onOpenChange={(open) => { if (!open) handleClose(); }}
      title="AI Support Agent"
      description="Contact support via the email-agent proxy"
    >
      <div className="flex items-center gap-3 mb-6 -mt-2">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <Mail className="w-5 h-5" />
        </div>
        <p className="text-sm text-muted">Powered by our email-agent service</p>
      </div>

      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h4 className="text-lg font-bold text-text mb-4">Agent Response</h4>
          <div className="mb-6 p-4 rounded-lg bg-off border border-border text-left text-muted text-sm max-h-48 overflow-y-auto w-full">
            {agentReply || responseMsg}
          </div>
          <p className="text-xs text-muted mb-6">
            For further assistance, email us at <span className="text-accent font-mono">support@bookwebsite.com</span>
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="min-h-11 px-6 py-2 bg-text text-white rounded-full text-sm font-medium hover:bg-accent transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Email Address</label>
            <input
              type="email"
              required
              className="w-full min-h-11 px-4 py-3 bg-off border border-border rounded-xl text-text placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Subject</label>
            <input
              type="text"
              required
              className="w-full min-h-11 px-4 py-3 bg-off border border-border rounded-xl text-text placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              placeholder="e.g. Question about pricing"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Message</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 bg-off border border-border rounded-xl text-base text-text placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
              placeholder="How does your coverage compare?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {status === 'error' && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{responseMsg || 'Failed to process request. Please email support@bookwebsite.com.'}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full min-h-11 mt-2 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent2 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Contacting Agent...</span>
              </>
            ) : (
              <>
                <span>Send to Agent</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}
    </AppDialog>
  );
}
