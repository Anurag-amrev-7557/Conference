/**
 * MarketingService
 * Handles telemetry and identity synchronization with the Marketing Agent Hub.
 */

const MARKETING_API_URL = import.meta.env.VITE_MARKETING_HUB_URL || "http://localhost:8000/webhook";
const MASTER_API_KEY = import.meta.env.VITE_MARKETING_MASTER_KEY || "vellux_studio_2026_pk";
const IDENTITY_STORAGE_KEY = "vellux_lead_email";

export class MarketingService {
  private static getEmail(): string | null {
    return localStorage.getItem(IDENTITY_STORAGE_KEY);
  }

  private static getVisitorId(): string {
    let vid = localStorage.getItem("vellux_visitor_id");
    if (!vid) {
      vid = `vid_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem("vellux_visitor_id", vid);
    }
    return vid;
  }

  /**
   * Identifies the current user by email.
   * Call this after form submissions.
   */
  static identify(email: string) {
    const previousEmail = this.getEmail();
    if (previousEmail && previousEmail !== email) {
      console.log("[Marketing] Identity Handoff: Resetting Visitor Context.");
      localStorage.removeItem("vellux_visitor_id"); // Force new visitor for new person
    }
    localStorage.setItem(IDENTITY_STORAGE_KEY, email);
    this.logEvent("user_identified", { email });
  }

  /**
   * Logs an event to the Marketing Hub.
   * @param action The event type (e.g., 'cta_click', 'video_play')
   * @param metadata Optional metadata payload
   */
  static async logEvent(action: string, metadata: Record<string, any> = {}, retries = 3) {
    const email = this.getEmail();
    
    // Anonymous-First Telemetry: Allow all events to stream.
    // Identification will merge identities later in the analytical mesh.

    const attempt = async (retryCount: number): Promise<void> => {
      try {
        const response = await fetch(MARKETING_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": MASTER_API_KEY
          },
          body: JSON.stringify({
            id: `evt_${Date.now()}`,
            type: action,
            actor: { email: email || "anonymous@tracking.node" },
            visitor_id: this.getVisitorId(),
            content: {
              ...metadata,
              source: "book_website",
              timestamp: new Date().toISOString()
            }
          })
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);
        console.log(`[Marketing] Event '${action}' sync successful.`);
      } catch (err) {
        if (retryCount > 0) {
          const delay = Math.pow(2, 3 - retryCount) * 1000;
          console.warn(`[Marketing] Sync failed for '${action}'. Retrying in ${delay}ms...`);
          return new Promise(resolve => setTimeout(() => resolve(attempt(retryCount - 1)), delay));
        }
        console.error("[Marketing] Final sync failure:", err);
      }
    };

    return attempt(retries);
  }

  /**
   * Universal Scroller. Tracks depth milestones.
   */
  static trackScroll() {
    let milestons = new Set([25, 50, 75, 100]);
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
      milestons.forEach(m => {
        if (scrollPercent >= m) {
          this.logEvent('scroll_milestone', { percent: m });
          milestons.delete(m); // Only log once per session
        }
      });
    }, { passive: true });
  }

  /**
   * Outbound Link Tracker.
   */
  static trackLinks() {
    window.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        this.logEvent('outbound_click', { url: link.href, text: link.innerText });
      }
    });
  }

  /**
   * Identity Recovery.
   */
  static init() {
    const email = this.getEmail();
    if (email) {
      console.log(`[Marketing] Resuming journey for ${email}`);
      this.logEvent("session_resume", { email });
    }
    this.trackScroll();
    this.trackLinks();
  }
}
