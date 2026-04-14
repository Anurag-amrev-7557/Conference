/**
 * Application Configuration
 * 
 * In a real production environment, sensitive values like ADMIN_PASSWORD 
 * should be stored in environment variables (e.g., import.meta.env.VITE_ADMIN_PASSWORD).
 */

export const config = {
  admin: {
    // Default admin password for the digital monograph
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
    sessionKey: 'isAdminAuth',
  },
  site: {
    url: 'https://playbook.superhumanly.ai',
    name: 'Superhumanly Agentic Playbook',
    admin: {
      password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123', // Default admin password for the digital hub
    }
  },
  social: {
    linkedin: 'https://linkedin.com/company/superhumanly',
    youtube: 'https://youtube.com/@superhumanly',
    instagram: 'https://instagram.com/superhumanly.ai',
    x: 'https://x.com/superhumanly',
  }
};
