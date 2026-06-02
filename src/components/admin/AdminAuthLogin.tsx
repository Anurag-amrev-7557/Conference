import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LayoutDashboard,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Users,
  AlertCircle,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { config } from '../../lib/config'
import { api } from '../../lib/api'
import { setAdminSession } from './useAdminSession'
import { TextInput } from './ui/TextInput'
import { Button } from './ui/Button'

const REMEMBER_KEY = 'admin_remember_username'
const BRAND_LOGO = '/Superhumanly AI Logo.png'

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Unified workspace',
    description: 'Homepage, blog, events, and registrations in one panel.',
  },
  {
    icon: Sparkles,
    title: 'Live preview',
    description: 'Preview every change on the public site before publishing.',
  },
  {
    icon: Users,
    title: 'Team access',
    description: 'Role-based permissions for editors, viewers, and admins.',
  },
] as const

const STATS = [
  { value: '12+', label: 'Modules' },
  { value: 'Live', label: 'Preview' },
  { value: 'RBAC', label: 'Access' },
] as const

function BrandLogo({ variant }: { variant: 'desktop' | 'mobile' }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="admin-auth-brand__logo-fallback">
        <div className={cn('admin-auth-brand__logo-mark', variant === 'mobile' && '!w-8 !h-8')}>
          <Shield className={cn('text-white', variant === 'mobile' ? 'w-4 h-4' : 'w-5 h-5')} aria-hidden />
        </div>
        {variant === 'desktop' ? (
          <span className="admin-auth-brand__logo-text">Superhumanly AI</span>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <img
        src={BRAND_LOGO}
        alt=""
        className={variant === 'desktop' ? 'admin-auth-brand__logo' : 'h-8 w-auto object-contain'}
        onError={() => setFailed(true)}
      />
      {variant === 'desktop' ? (
        <span className="admin-auth-brand__logo-text">Superhumanly AI</span>
      ) : null}
    </>
  )
}

type AdminAuthLoginProps = {
  onSuccess: () => void
  initialError?: string
}

export function AdminAuthLogin({ onSuccess, initialError = '' }: AdminAuthLoginProps) {
  const [username, setUsername] = useState(() => localStorage.getItem(REMEMBER_KEY) || 'admin')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem(REMEMBER_KEY))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(initialError)
  const [loading, setLoading] = useState(false)
  const [shakeError, setShakeError] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('admin_theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    setError(initialError)
  }, [initialError])

  useEffect(() => {
    localStorage.setItem('admin_theme', theme)
  }, [theme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { token, role, username: loggedInUser } = await api.login(username, password)
      localStorage.setItem('adminToken', token)
      localStorage.setItem(config.admin.sessionKey, 'true')
      setAdminSession(role || 'super_admin', loggedInUser || username)

      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, username)
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }

      onSuccess()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Incorrect username or password.'
      setError(msg)
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-shell admin-auth-shell" data-admin data-theme={theme}>
      {/* Brand panel — desktop */}
      <aside className="admin-auth-brand" aria-label="Superhumanly AI CMS">
        <div className="admin-auth-brand__mesh" aria-hidden />
        <div className="admin-auth-brand__grid" aria-hidden />
        <div className="admin-auth-brand__glow" aria-hidden />

        <div className="admin-auth-brand__frame">
          <div className="admin-auth-brand__badge">
            <span className="admin-auth-brand__badge-dot" aria-hidden />
            Content management platform
          </div>

          <div className="admin-auth-brand__logo-row">
            <div className="admin-auth-brand__logo-fallback">
              <BrandLogo variant="desktop" />
            </div>
          </div>

          <h1 className="admin-auth-brand__headline">
            Your conference site,{' '}
            <span className="admin-auth-brand__headline-accent">under control.</span>
          </h1>
          <p className="admin-auth-brand__lede">
            The production CMS for marketing teams — edit content, publish pages, and manage
            registrations without touching code.
          </p>

          <div className="admin-auth-brand__feature-card">
            <ul className="admin-auth-brand__features">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="admin-auth-brand__feature">
                  <span className="admin-auth-brand__feature-icon">
                    <Icon aria-hidden />
                  </span>
                  <span>
                    <span className="admin-auth-brand__feature-title">{title}</span>
                    <span className="admin-auth-brand__feature-desc">{description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="admin-auth-brand__stats" aria-hidden>
            {STATS.map(({ value, label }) => (
              <div key={label} className="admin-auth-brand__stat">
                <span className="admin-auth-brand__stat-value">{value}</span>
                <span className="admin-auth-brand__stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="admin-auth-brand__footer">
          © {new Date().getFullYear()} Superhumanly AI · Admin workspace
        </p>
      </aside>

      {/* Form panel */}
      <div className="admin-auth-form-panel">
        <header className="admin-auth-form-panel__header">
          <div className="admin-auth-form-panel__mobile-brand">
            <BrandLogo variant="mobile" />
            <span className="admin-auth-form-panel__mobile-title">CMS Admin</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              className="admin-auth-theme-btn"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -20 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.15 }}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <Link to="/" className="admin-auth-form__utility-link hidden sm:inline-flex">
              View site
            </Link>
          </div>
        </header>

        <div className="admin-auth-form-panel__body">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
            className={cn('admin-auth-form-panel__inner', shakeError && 'ds-shake')}
          >
            <div className="admin-auth-form__intro">
              <h2 className="admin-auth-form__title">Sign in</h2>
              <p className="admin-auth-form__subtitle">
                Enter your credentials to access the admin workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="admin-auth-form" noValidate>
              {error ? (
                <div className="admin-auth-form__error" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                  <span>{error}</span>
                </div>
              ) : null}

              <TextInput
                id="admin-username"
                label="Email or username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="you@company.com"
                autoComplete="username"
                disabled={loading}
                className="admin-auth-field"
              />

              <TextInput
                id="admin-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className="admin-auth-field"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-[var(--ds-text-muted)] hover:text-[var(--ds-text-primary)] cursor-pointer ds-transition-base p-1 -mr-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="admin-auth-form__row">
                <label className="admin-auth-form__remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  Remember me
                </label>
              </div>

              <Button
                type="submit"
                loading={loading}
                size="lg"
                variant="primary"
                className="admin-auth-form__submit"
              >
                {loading ? 'Signing in…' : 'Continue'}
                {!loading && <ArrowRight className="w-4 h-4" aria-hidden />}
              </Button>
            </form>

            <p className="admin-auth-form__help">
              Need access? Contact your site administrator.
            </p>
          </motion.div>
        </div>

        <footer className="admin-auth-form-panel__footer">
          <span className="admin-auth-form-panel__footer-note">
            <Shield className="w-3.5 h-3.5" aria-hidden />
            Secured admin access
          </span>
        </footer>
      </div>
    </div>
  )
}
