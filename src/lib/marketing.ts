/**
 * MarketingService — telemetry via book API proxy (no browser API keys).
 */
import { API_BASE } from './api';

const IDENTITY_STORAGE_KEY = 'vellux_lead_email';

export class MarketingService {
  private static getEmail(): string | null {
    return localStorage.getItem(IDENTITY_STORAGE_KEY);
  }

  static getVisitorId(): string {
    let vid = localStorage.getItem('vellux_visitor_id');
    if (!vid) {
      vid = `vid_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem('vellux_visitor_id', vid);
    }
    return vid;
  }

  static identify(email: string) {
    const previousEmail = this.getEmail();
    if (previousEmail && previousEmail !== email) {
      console.log('[Marketing] Identity Handoff: Resetting Visitor Context.');
      localStorage.removeItem('vellux_visitor_id');
    }
    localStorage.setItem(IDENTITY_STORAGE_KEY, email);
    this.logEvent('user_identified', { email });
  }

  static async logEvent(action: string, metadata: Record<string, unknown> = {}, retries = 3) {
    const email = this.getEmail();

    const attempt = async (retryCount: number): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE}/marketing/webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: `evt_${Date.now()}`,
            type: action,
            actor: { email: email || 'anonymous@tracking.node' },
            visitor_id: this.getVisitorId(),
            content: {
              ...metadata,
              source: 'book_website',
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);
        console.log(`[Marketing] Event '${action}' sync successful.`);
      } catch (err) {
        if (retryCount > 0) {
          const delay = Math.pow(2, 3 - retryCount) * 1000;
          console.warn(`[Marketing] Sync failed for '${action}'. Retrying in ${delay}ms...`);
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
            this.logEvent('scroll_milestone', { percent: m });
            milestones.delete(m);
          }
        });
      },
      { passive: true },
    );
  }

  static trackLinks() {
    window.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        this.logEvent('outbound_click', { url: link.href, text: link.innerText });
      }
    });
  }

  static init() {
    const email = this.getEmail();
    if (email) {
      console.log(`[Marketing] Resuming journey for ${email}`);
      this.logEvent('session_resume', { email });
    }
    this.trackScroll();
    this.trackLinks();
  }
}
