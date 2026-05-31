import { ArrowRight } from 'lucide-react'
import { type FormEvent, useRef, useState } from 'react'
import { api } from '../../lib/api'
import type { RegistrationDesignation } from '../../lib/registrationTypes'
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
  const morphRef = useRef<HTMLDivElement>(null)
  const [morphHeight, setMorphHeight] = useState<number | null>(null)

  const isLocked = phase !== 'idle'
  const headerLede = copy.pageLede.trim() || copy.formSubtitle.trim()

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (isLocked) return
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (phase !== 'idle') return

    if (!form.name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!form.email.trim()) {
      setError('Please enter your email.')
      return
    }
    if (!form.phone.trim()) {
      setError('Please enter your phone number.')
      return
    }
    if (!form.linkedIn.trim()) {
      setError('Please enter your LinkedIn profile.')
      return
    }
    if (!form.designation) {
      setError('Please select how you are registering.')
      return
    }

    setPhase('submitting')
    setError('')
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
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
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
                    <div className="book-demo-control">
                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        placeholder={copy.fields.name.placeholder}
                        className="book-demo-input"
                        value={form.name}
                        disabled={isLocked}
                        onChange={(e) => update('name', e.target.value)}
                      />
                    </div>
                  </label>

                  <label className="book-demo-field">
                    <span className="book-demo-field__label">{copy.fields.email.label}</span>
                    <div className="book-demo-control">
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        placeholder={copy.fields.email.placeholder}
                        className="book-demo-input"
                        value={form.email}
                        disabled={isLocked}
                        onChange={(e) => update('email', e.target.value)}
                      />
                    </div>
                  </label>

                  <div className="book-demo-form__row">
                    <label className="book-demo-field">
                      <span className="book-demo-field__label">{copy.fields.phone.label}</span>
                      <div className="book-demo-control">
                        <input
                          type="tel"
                          name="phone"
                          autoComplete="tel"
                          required
                          placeholder={copy.fields.phone.placeholder}
                          className="book-demo-input"
                          value={form.phone}
                          disabled={isLocked}
                          onChange={(e) => update('phone', e.target.value)}
                        />
                      </div>
                    </label>

                    <label className="book-demo-field">
                      <span className="book-demo-field__label">{copy.fields.linkedIn.label}</span>
                      <div className="book-demo-control">
                        <input
                          type="url"
                          name="linkedIn"
                          autoComplete="url"
                          required
                          placeholder={copy.fields.linkedIn.placeholder}
                          className="book-demo-input"
                          value={form.linkedIn}
                          disabled={isLocked}
                          onChange={(e) => update('linkedIn', e.target.value)}
                        />
                      </div>
                    </label>
                  </div>

                  <fieldset className="book-demo-field border-0 p-0 m-0 min-w-0">
                    <legend className="book-demo-field__label">{copy.fields.designation.label}</legend>
                    <div className="book-demo-designation">
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
                  </fieldset>
              </div>

              {error ? (
                <p className="book-demo-form__error" role="alert">
                  {error}
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
                      <span className="book-demo-submit__loading-label">Reserving your pass…</span>
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
