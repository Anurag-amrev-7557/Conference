import { Link } from "react-router-dom"
import { useWebsiteData } from "./WebsiteDataProvider"

// Custom high-fidelity SVG Icons for the Big 4 Socials (Monograph Wireframe Style)
const LinkedInIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
)
const YoutubeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
)
const InstagramIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)
const XIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M20 4L4 20"/>
  </svg>
)

export function Footer() {
  const { data } = useWebsiteData()
  const { socials } = data.settings.navigation

  const iconMap = {
    LinkedIn: LinkedInIcon,
    Youtube: YoutubeIcon,
    Instagram: InstagramIcon,
    X: XIcon
  }

  return (
    <footer className="py-10 bg-white border-t border-border/10 relative z-10">
      <div className="w-full px-6 sm:px-12 lg:px-16">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-24 mb-20">
          
          {/* Identity Column */}
          <div className="flex flex-col items-start gap-6 lg:col-span-1">
            <div className="flex flex-col gap-1">
              <span className="text-6xl font-serif italic text-text tracking-tighter">Superhumanly</span>
            </div>
            <p className="text-[16px] text-black leading-relaxed max-w-sm">
              Orchestrating the future of automated business systems.
            </p>
          </div>

          {/* Navigation Column 1 */}
          <div className="flex flex-col gap-8 lg:pl-10">
            <span className="text-[11px] font-bold text-text uppercase tracking-widest">Section Index</span>
              {[
                { name: 'The Playbook', href: '/blog' },
                { name: 'Founders Hub', href: '/community' },
                { name: 'Strategy', href: '/#who-we-are' },
                { name: 'Live Training', href: '/events' },
                { name: "Join Registry", href: "/#final-cta" }
              ].map((link) => {
                const isInternal = link.href.startsWith('/');

                if (isInternal) {
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="text-[15px] text-black hover:text-accent transition-colors font-medium tracking-wide"
                    >
                      {link.name}
                    </Link>
                  );
                }

                return (
                  <a 
                    key={link.name} 
                    href={link.href}
                    className="text-[15px] text-black hover:text-accent transition-colors font-medium tracking-wide"
                  >
                    {link.name}
                  </a>
                );
              })}
          </div>

          {/* Socials Column */}
          <div className="flex flex-col gap-8 lg:text-right lg:items-end">
            <span className="text-[11px] font-bold text-text uppercase tracking-widest">Connection</span>
            <div className="flex items-center gap-8">
              {socials.map((social) => {
                const Icon = iconMap[social.platform]
                return (
                  <a 
                    key={social.id} 
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-black hover:text-accent transition-all hover:scale-110 ${social.platform === 'Youtube' ? 'scale-115' : ''}`}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                )
              })}
            </div>
          </div>

        </div>

        {/* Global Bottom Bar */}
        <div className="pt-10 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[11px] font-bold text-muted uppercase tracking-widest">
            © 2026 Superhumanly AI Playbook.
          </span>
          <div className="flex items-center gap-8">
            <span className="text-[11px] font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-text transition-colors">Privacy Policy</span>
            <span className="text-[11px] font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-text transition-colors">Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
