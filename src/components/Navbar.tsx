import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWebsiteData } from "./WebsiteDataProvider"
import { ContactSupportModal } from "./ContactSupportModal"

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

export function Navbar() {
  const { data } = useWebsiteData()
  const { appearance, settings } = data
  const { links, socials } = settings.navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const iconMap = {
    LinkedIn: LinkedInIcon,
    Youtube: YoutubeIcon,
    Instagram: InstagramIcon,
    X: XIcon
  }

  const getHRef = (href: string) => {
    if (href.startsWith('#')) {
      return pathname === '/' ? href : `/${href}`;
    }
    return href;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#') && pathname === '/') {
      e.preventDefault();
      const id = href.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  return (
    <header className="fixed top-0 z-[100] w-full flex justify-center pt-8 px-6 pointer-events-none transition-all duration-700">
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto flex items-center justify-between w-full max-w-[1100px] px-2 py-2 glass-pill rounded-full shadow-nav"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Professional Branding */}
        <Link to="/" className="flex items-center gap-4 group px-1">
           <div className="w-10 h-10 bg-text rounded-full flex items-center justify-center text-white font-serif italic text-xl shadow-elite transition-transform group-hover:scale-105">
             {appearance.brandLogoText}
           </div>
           <span className="text-lg font-bold text-text tracking-tight">{appearance.brandName}</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-2">
          {links.map((link) => {
            const resolvedHref = getHRef(link.href);
            const isExternal = resolvedHref.startsWith('http') || resolvedHref.startsWith('mailto:');
            const isSection = resolvedHref.startsWith('#') || (resolvedHref.startsWith('/#') && pathname !== '/');
            
            if (isExternal || isSection) {
              return (
                <a 
                  key={link.id}
                  href={resolvedHref}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="px-3 py-2 text-[14px] font-medium text-text2 hover:text-accent transition-all duration-300 rounded-full hover:bg-off/50"
                >
                  {link.name}
                </a>
              );
            }

            return (
              <Link
                key={link.id}
                to={resolvedHref}
                className="px-3 py-2 text-[14px] font-medium text-text2 hover:text-accent transition-all duration-300 rounded-full hover:bg-off/50"
              >
                {link.name}
              </Link>
            );
          })}
          
          <div className="h-4 w-[1px] bg-border/60 mx-4" />
          
          <div className="flex items-center gap-5 px-4">
            {socials.map((social) => {
              const Icon = iconMap[social.platform]
              return (
                <a 
                  key={social.id} 
                  href={social.href}
                  className="text-text2 hover:text-accent transition-all hover:scale-110"
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </div>

          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="ml-2 px-7 py-3 border border-border text-text rounded-full text-[13px] font-bold shadow-sm hover:bg-border/30 transition-all active:scale-95 text-center flex items-center justify-center leading-none"
          >
            Support AI
          </button>
          
          <Link
            to="/#final-cta"
            onClick={(e: any) => handleLinkClick(e, '#final-cta')}
            className="ml-2 px-7 py-3 bg-accent text-white rounded-full text-[13px] font-bold shadow-elite hover:bg-accent2 transition-all transform hover:-translate-y-0.5 active:scale-95 text-center flex items-center justify-center leading-none"
          >
            Join Now
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-text p-2 hover:bg-off/50 rounded-full transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </motion.div>
      
      <ContactSupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-[105] glass-pill rounded-[40px] p-12 md:hidden flex flex-col justify-center gap-12 text-center shadow-2xl border border-border"
          >
            <div className="flex flex-col gap-10 relative z-10">
              {links.map((link) => {
                const resolvedHref = getHRef(link.href);
                const isExternal = resolvedHref.startsWith('http') || resolvedHref.startsWith('mailto:');
                const isSection = resolvedHref.startsWith('#') || (resolvedHref.startsWith('/#') && pathname !== '/');

                if (isExternal || isSection) {
                  return (
                    <a
                      key={link.id}
                      href={resolvedHref}
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        handleLinkClick(e, link.href);
                      }}
                      className="text-4xl font-serif text-text hover:text-accent transition-all"
                    >
                      {link.name}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.id}
                    to={resolvedHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-4xl font-serif text-text hover:text-accent transition-all"
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center gap-10 relative z-10 pt-4 border-t border-border/10">
              {socials.map((social) => {
                const Icon = iconMap[social.platform]
                return (
                  <a 
                    key={social.id} 
                    href={social.href}
                    className="text-text2 hover:text-accent transition-all hover:scale-110"
                  >
                    <Icon className="w-8 h-8" />
                  </a>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}




