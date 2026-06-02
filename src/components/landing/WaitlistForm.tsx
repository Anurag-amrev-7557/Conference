import { useState, type SubmitEvent } from "react"
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { MarketingService } from "../../lib/marketing"
import { api } from "../../lib/api"

export type WaitlistFormProps = {
  analyticsLocation?: string
  variant?: "light" | "dark"
  showGuideLabel?: boolean
  guideLabel?: string
  submitLabel?: string
  placeholder?: string
  successTitle?: string
  successCopy?: string
  showHint?: boolean
}

export function WaitlistForm({
  analyticsLocation = "waitlist_form",
  variant = "light",
  showGuideLabel = true,
  guideLabel = "Exclusive guide · Building AI agents",
  submitLabel = "Get the playbook",
  placeholder = "you@company.com",
  successTitle = "You're on the list",
  successCopy = "Check your inbox — the playbook arrives in a few minutes.",
  showHint = true,
}: WaitlistFormProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const isDark = variant === "dark"

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setStatus("error")
      return
    }

    setStatus("loading")

    try {
      await api.submitNewsletter({ email: email.trim(), source: analyticsLocation })
      MarketingService.identify(email)
      MarketingService.logEvent("form_submit", { location: analyticsLocation })
      setStatus("success")
      setEmail("")
    } catch {
      setStatus("error")
    }
  }

  const rootClass = [
    "waitlist-form",
    status === "success" ? "waitlist-form--success" : "",
    isDark ? "waitlist-form--dark" : "",
  ]
    .filter(Boolean)
    .join(" ")

  if (status === "success") {
    return (
      <div id="cta-form" className={rootClass} role="status">
        <CheckCircle2 className="waitlist-form__success-icon" aria-hidden />
        <h3 className="waitlist-form__success-title">{successTitle}</h3>
        <p className="editorial-lede waitlist-form__success-copy">{successCopy}</p>
      </div>
    )
  }

  return (
    <div id="cta-form" className={rootClass}>
      <form onSubmit={handleSubmit} className="waitlist-form__form">
        {showGuideLabel ? (
          <p className="waitlist-form__label">{guideLabel}</p>
        ) : null}

        <label className="waitlist-form__field">
          <span className="sr-only">Work email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === "error") setStatus("idle")
            }}
            placeholder={placeholder}
            required
            disabled={status === "loading"}
            className={isDark ? "blog-newsletter__input" : "waitlist-form__input"}
            autoComplete="email"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className={`btn-cta-primary waitlist-form__submit group ${
            isDark ? "blog-newsletter__submit" : ""
          }`}
        >
          {status === "loading" ? (
            <Loader2 className="w-5 h-5 animate-spin" aria-label="Submitting" />
          ) : (
            <>
              {submitLabel}
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </>
          )}
        </button>

        {status === "error" ? (
          <p className="waitlist-form__error" role="alert">
            Something went wrong. Try again in a moment, or email us from the footer.
          </p>
        ) : null}

        {showHint && !isDark ? (
          <p className="waitlist-form__hint">Join 2,500+ founders in the registry</p>
        ) : null}
      </form>
    </div>
  )
}
