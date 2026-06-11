import { ArrowRight } from 'lucide-react'
import { type FormEvent, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
import type {
  ConferenceRegistrationFormSettings,
  RegistrationDesignation,
} from '../../lib/registrationTypes'
import { useRegistrationFormSettings } from '../../hooks/useRegistrationFormSettings'
import { RegisterSuccessPanel } from './RegisterSuccessPanel'
import { SummitTicket } from './SummitTicket'

type FormState = {
  name: string
  email: string
  phone: string
  linkedIn: string
  designation: RegistrationDesignation | ''
}

type FormPhase = 'idle' | 'submitting' | 'success'

type FormFieldKey = keyof FormState

type FieldErrors = Partial<Record<FormFieldKey, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForm(
  form: FormState,
  validation: ConferenceRegistrationFormSettings['validationMessages'] | undefined,
): FieldErrors {
  const errors: FieldErrors = {}
  const messages = validation ?? {}

  if (!form.name.trim()) {
    errors.name = messages.nameRequired?.trim() || 'Please enter your full name.'
  }

  const email = form.email.trim()
  if (!email) {
    errors.email = messages.emailRequired?.trim() || 'Please enter your email.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = messages.emailInvalid?.trim() || 'Please enter a valid email address.'
  }

  if (!form.phone.trim()) {
    errors.phone = messages.phoneRequired?.trim() || 'Please enter your phone number.'
  }

  if (!form.linkedIn.trim()) {
    errors.linkedIn = messages.linkedInRequired?.trim() || 'Please enter your LinkedIn profile.'
  }

  if (!form.designation) {
    errors.designation =
      messages.designationRequired?.trim() || 'Please select how you are registering.'
  }

  return errors
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  linkedIn: '',
  designation: '',
}

const MIN_SUBMIT_MS = 750

export function BookDemoForm() {
  const copy = useRegistrationFormSettings()
  const [form, setForm] = useState<FormState>(initialState)
  const [phase, setPhase] = useState<FormPhase>('idle')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const morphRef = useRef<HTMLDivElement>(null)
  const [morphHeight, setMorphHeight] = useState<number | null>(null)

  const isLocked = phase !== 'idle'
  const headerLede = copy.pageLede.trim() || copy.formSubtitle.trim()
  const registrationClosed = copy.registrationOpen === false

  if (registrationClosed) {
    return (
      <div className="book-demo-form-stage">
        <div className="book-demo-form-card book-demo-form-card--register p-8 sm:p-10 text-center">
          <h2 className="book-demo-form-card__title mb-4">
            {copy.registrationClosedTitle?.trim() || 'Registration closed'}
          </h2>
          <p className="book-demo-form-card__closed-copy">
            {copy.registrationClosedMessage ||
              'Registration is currently closed. Check back soon or visit the homepage to join our waitlist.'}
          </p>
        </div>
      </div>
    )
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (isLocked) return
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (phase !== 'idle') return

    const validation = copy.validationMessages ?? {}
    const nextFieldErrors = validateForm(form, validation)
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError(Object.values(nextFieldErrors)[0] ?? '')
      return
    }

    setPhase('submitting')
    setError('')
    setFieldErrors({})
    const started = Date.now()

    try {
      await api.submitConferenceRegistration({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        linkedIn: form.linkedIn.trim(),
        designation: form.designation,
      })
      const wait = Math.max(0, MIN_SUBMIT_MS - (Date.now() - started))
      if (wait > 0) await new Promise((r) => setTimeout(r, wait))
      const height = morphRef.current?.offsetHeight
      if (height && height > 0) setMorphHeight(height)
      setPhase('success')
    } catch (err: unknown) {
      setPhase('idle')
      setError(
        err instanceof Error
          ? err.message
          : copy.genericErrorMessage?.trim() || 'Something went wrong. Try again.',
      )
    }
  }

  return (
    <div className="book-demo-form-stage">
      <div className="book-demo-form-stage__halo" aria-hidden />
      <div
        className={`book-demo-form-card book-demo-form-card--register book-demo-form-card--phase-${phase}`}
      >
        <div
          ref={morphRef}
          className="book-demo-form-card__morph"
          style={
            phase === 'success' && morphHeight
              ? { minHeight: morphHeight }
              : undefined
          }
        >
          <div
            className="book-demo-form-card__form-shell"
            aria-hidden={phase === 'success'}
            inert={phase === 'success' ? true : undefined}
          >
            <header className="book-demo-form-card__header">
              {copy.formKicker.trim() ? (
                <p className="book-demo-form-card__kicker">{copy.formKicker}</p>
              ) : null}
              <h2 className="book-demo-form-card__title">
                <span>{copy.pageTitle}</span>
                {copy.pageTitleAccent?.trim() ? (
                  <span className="book-demo-form-card__title-accent"> {copy.pageTitleAccent}</span>
                ) : null}
              </h2>
              {headerLede ? <p className="book-demo-form-card__subtitle">{headerLede}</p> : null}
              <SummitTicket
                eventName={copy.panelEyebrow}
                passLabel={copy.priceLabel}
                amount={copy.priceAmount}
                note={copy.priceNote}
              />
            </header>

            <form className="book-demo-form" onSubmit={handleSubmit} noValidate>
              <div className={`book-demo-form__fields${isLocked ? ' book-demo-form__fields--locked' : ''}`}>
                  {copy.formTitle.trim() ? (
                    <p className="book-demo-form__fields-heading">{copy.formTitle}</p>
                  ) : null}
                  <label className="book-demo-field">
                    <span className="book-demo-field__label">{copy.fields.name.label}</span>
                    <div className={cn('book-demo-control', fieldErrors.name && 'book-demo-control--error')}>
                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        placeholder={copy.fields.name.placeholder}
                        className="book-demo-input"
                        value={form.name}
                        disabled={isLocked}
                        aria-invalid={Boolean(fieldErrors.name)}
                        onChange={(e) => update('name', e.target.value)}
                      />
                    </div>
                    {fieldErrors.name ? (
                      <span className="book-demo-field__error" role="alert">
                        {fieldErrors.name}
                      </span>
                    ) : null}
                  </label>

                  <label className="book-demo-field">
                    <span className="book-demo-field__label">{copy.fields.email.label}</span>
                    <div className={cn('book-demo-control', fieldErrors.email && 'book-demo-control--error')}>
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        placeholder={copy.fields.email.placeholder}
                        className="book-demo-input"
                        value={form.email}
                        disabled={isLocked}
                        aria-invalid={Boolean(fieldErrors.email)}
                        onChange={(e) => update('email', e.target.value)}
                      />
                    </div>
                    {fieldErrors.email ? (
                      <span className="book-demo-field__error" role="alert">
                        {fieldErrors.email}
                      </span>
                    ) : null}
                  </label>

                  <div className="book-demo-form__row">
                    <label className="book-demo-field">
                      <span className="book-demo-field__label">{copy.fields.phone.label}</span>
                      <div className={cn('book-demo-control', fieldErrors.phone && 'book-demo-control--error')}>
                        <input
                          type="tel"
                          name="phone"
                          autoComplete="tel"
                          required
                          placeholder={copy.fields.phone.placeholder}
                          className="book-demo-input"
                          value={form.phone}
                          disabled={isLocked}
                          aria-invalid={Boolean(fieldErrors.phone)}
                          onChange={(e) => update('phone', e.target.value)}
                        />
                      </div>
                      {fieldErrors.phone ? (
                        <span className="book-demo-field__error" role="alert">
                          {fieldErrors.phone}
                        </span>
                      ) : null}
                    </label>

                    <label className="book-demo-field">
                      <span className="book-demo-field__label">{copy.fields.linkedIn.label}</span>
                      <div
                        className={cn('book-demo-control', fieldErrors.linkedIn && 'book-demo-control--error')}
                      >
                        <input
                          type="url"
                          name="linkedIn"
                          autoComplete="url"
                          required
                          placeholder={copy.fields.linkedIn.placeholder}
                          className="book-demo-input"
                          value={form.linkedIn}
                          disabled={isLocked}
                          aria-invalid={Boolean(fieldErrors.linkedIn)}
                          onChange={(e) => update('linkedIn', e.target.value)}
                        />
                      </div>
                      {fieldErrors.linkedIn ? (
                        <span className="book-demo-field__error" role="alert">
                          {fieldErrors.linkedIn}
                        </span>
                      ) : null}
                    </label>
                  </div>

                  <fieldset
                    className={cn(
                      'book-demo-field border-0 p-0 m-0 min-w-0',
                      fieldErrors.designation && 'book-demo-field--error',
                    )}
                  >
                    <legend className="book-demo-field__label">{copy.fields.designation.label}</legend>
                    <div
                      className={cn(
                        'book-demo-designation',
                        fieldErrors.designation && 'book-demo-designation--error',
                      )}
                    >
                      {copy.designationOptions.map((option) => (
                        <label
                          key={option.value}
                          className="book-demo-designation__option"
                          title={option.description}
                        >
                          <input
                            type="radio"
                            name="designation"
                            value={option.value}
                            checked={form.designation === option.value}
                            disabled={isLocked}
                            onChange={() => update('designation', option.value)}
                            required
                            className="book-demo-designation__input"
                          />
                          <span className="book-demo-designation__box" aria-hidden />
                          <span className="book-demo-designation__text">
                            <span className="book-demo-designation__label">{option.label}</span>
                            {option.description ? (
                              <span className="book-demo-designation__desc">{option.description}</span>
                            ) : null}
                          </span>
                        </label>
                      ))}
                    </div>
                    {fieldErrors.designation ? (
                      <span className="book-demo-field__error" role="alert">
                        {fieldErrors.designation}
                      </span>
                    ) : null}
                  </fieldset>
              </div>

              {error && Object.keys(fieldErrors).length > 1 ? (
                <p className="book-demo-form__error" role="alert">
                  Please fix the highlighted fields below.
                </p>
              ) : null}

              <div className="book-demo-form__actions">
                <button
                  type="submit"
                  className={`book-demo-submit${phase === 'submitting' ? ' book-demo-submit--loading' : ''}`}
                  disabled={phase !== 'idle'}
                  aria-busy={phase === 'submitting'}
                >
                  {phase === 'submitting' ? (
                    <>
                      <span className="book-demo-submit__spinner" aria-hidden />
                      <span className="book-demo-submit__loading-label">
                        {copy.submitLoadingLabel?.trim() || 'Reserving your pass…'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="book-demo-submit__label">{copy.submitLabel}</span>
                      <span className="book-demo-submit__icon-wrap" aria-hidden>
                        <ArrowRight className="book-demo-submit__icon" strokeWidth={2.25} />
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <RegisterSuccessPanel
            active={phase === 'success'}
            title={copy.successTitle}
            message={copy.successMessage}
            email={form.email}
          />
        </div>
      </div>
    </div>
  )
}
