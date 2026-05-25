/**
 * MarketingService — telemetry via book API proxy (no browser API keys).
 * Actions must match marketing-backend/docs/EVENT_CONTRACT.md
 */
import { API_BASE } from './api';

const IDENTITY_STORAGE_KEY = 'vellux_lead_email';
const VISITOR_STORAGE_KEY = 'sh_visitor_id';

const CONTRACT_ACTIONS = new Set([
  'page_view',
  'cta_click',
  'form_submit',
  'user_identified',
  'book_demo_click',
  'add_to_cart',
  'video_play',
  'video_click',
  'session_resume',
  'scroll_milestone',
  'external_lead_action',
]);

export class MarketingService {
  private static getEmail(): string | null {
    return localStorage.getItem(IDENTITY_STORAGE_KEY);
  }

  static getVisitorId(): string {
    let vid = localStorage.getItem(VISITOR_STORAGE_KEY) || localStorage.getItem('vellux_visitor_id');
    if (!vid) {
      vid = `vid_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem(VISITOR_STORAGE_KEY, vid);
      localStorage.setItem('vellux_visitor_id', vid);
    }
    return vid;
  }

  static identify(email: string) {
    const previousEmail = this.getEmail();
    if (previousEmail && previousEmail !== email) {
      localStorage.removeItem(VISITOR_STORAGE_KEY);
      localStorage.removeItem('vellux_visitor_id');
    }
    localStorage.setItem(IDENTITY_STORAGE_KEY, email.trim().toLowerCase());
    void this.logEvent('user_identified', { email: email.trim().toLowerCase() });
  }

  static trackFormSubmit(email: string, metadata: Record<string, unknown> = {}) {
    this.identify(email);
    void this.logEvent('form_submit', { ...metadata, email });
  }

  static trackCta(label: string, href?: string) {
    void this.logEvent('cta_click', { label, href: href ?? null });
  }

  static async logEvent(action: string, metadata: Record<string, unknown> = {}, retries = 3) {
    const normalized = action.trim().toLowerCase();
    if (!CONTRACT_ACTIONS.has(normalized)) {
      console.warn(`[Marketing] Skipping non-contract action: ${action}`);
      return;
    }

    const email = this.getEmail();
    const visitorId = this.getVisitorId();

    const useWebhook =
      normalized === 'form_submit' ||
      (normalized === 'user_identified' && Boolean(email));
    const webhookId =
      useWebhook && email
        ? `evt_${visitorId}_${normalized}_${Date.now()}`
        : null;

    const attempt = async (retryCount: number): Promise<void> => {
      try {
        if (useWebhook && email && webhookId) {
          const response = await fetch(`${API_BASE}/marketing/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: webhookId,
              type: normalized,
              actor: { email },
              visitor_id: visitorId,
              content: {
                ...metadata,
                source: 'book_website',
                timestamp: new Date().toISOString(),
              },
            }),
          });
          if (!response.ok) throw new Error(`Webhook status ${response.status}`);
        } else {
          const body: Record<string, unknown> = {
            action: normalized,
            metadata: {
              ...metadata,
              source: 'book_website',
              timestamp: new Date().toISOString(),
            },
            visitor_id: visitorId,
          };
          if (email) body.email = email;

          const response = await fetch(`${API_BASE}/marketing/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!response.ok) throw new Error(`Events status ${response.status}`);
        }

        console.log(`[Marketing] Event '${normalized}' sync successful.`);
      } catch (err) {
        if (retryCount > 0) {
          const delay = Math.pow(2, 3 - retryCount) * 1000;
          console.warn(`[Marketing] Sync failed for '${normalized}'. Retrying in ${delay}ms...`);
          return new Promise((resolve) =>
            setTimeout(() => resolve(attempt(retryCount - 1)), delay),
          );
        }
        console.error('[Marketing] Final sync failure:', err);
      }
    };

    return attempt(retries);
  }

  static trackScroll() {
    const milestones = new Set([25, 50, 75, 100]);
    window.addEventListener(
      'scroll',
      () => {
        const scrollPercent = Math.round(
          ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100,
        );
        milestones.forEach((m) => {
          if (scrollPercent >= m) {
            void this.logEvent('scroll_milestone', { percent: m });
            milestones.delete(m);
          }
        });
      },
      { passive: true },
    );
  }

  static trackLinks() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (!link) return;
      if (link.dataset.marketingCta !== undefined || link.classList.contains('cta') || link.getAttribute('role') === 'button') {
        void this.trackCta(link.innerText?.slice(0, 80) || 'cta', link.href);
        return;
      }
      if (link.hostname !== window.location.hostname) {
        void this.logEvent('cta_click', { url: link.href, text: link.innerText?.slice(0, 80), outbound: true });
      }
    });
  }

  static init() {
    const email = this.getEmail();
    if (email) {
      console.log(`[Marketing] Resuming journey for ${email}`);
      void this.logEvent('session_resume', { email });
    }
    this.trackScroll();
    this.trackLinks();
  }
}
