import { ArrowRight } from 'lucide-react'
import { memo, type FormEvent, useCallback, useRef, useState } from 'react'
import { useRegistrationFormSettingsContext } from '../../context/RegistrationFormSettingsContext'
import { api } from '../../lib/api'
import { RegistrationApiError } from '../../lib/registrationApi'
import { formatPriceFromCents } from '../../lib/registrationDefaults'
import type { RegistrationDesignation } from '../../lib/registrationTypes'
import {
  isValidDesignationValue,
  validateRegistrationForm,
  type RegistrationFieldErrors,
  type RegistrationFormState,
} from '../../lib/registrationValidation'
import { cn } from '../../lib/utils'
import { BookDemoTextField } from './BookDemoTextField'
import { RegisterSuccessPanel } from './RegisterSuccessPanel'
import { SummitTicket } from './SummitTicket'

type FormPhase = 'idle' | 'submitting' | 'success'

const initialState: RegistrationFormState = {
  name: '',
  email: '',
  phone: '',
  linkedIn: '',
  designation: '',
}

const DesignationField = memo(function DesignationField({
  label,
  options,
  value,
  error,
  disabled,
  onSelect,
}: {
  label: string
  options: { value: RegistrationDesignation; label: string; description?: string }[]
  value: RegistrationDesignation | ''
  error?: string
  disabled: boolean
  onSelect: (value: RegistrationDesignation) => void
}) {
  return (
    <fieldset
      className={cn('book-demo-field border-0 p-0 m-0 min-w-0', error && 'book-demo-field--error')}
    >
      <legend className="book-demo-field__label">{label}</legend>
      <div className={cn('book-demo-designation', error && 'book-demo-designation--error')}>
        {options.map((option) => (
          <label
            key={option.value}
            className="book-demo-designation__option"
            title={option.description}
          >
            <input
              type="radio"
              name="designation"
              value={option.value}
              checked={value === option.value}
              disabled={disabled}
              onChange={() => onSelect(option.value)}
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
      {error ? (
        <span className="book-demo-field__error" role="alert">
          {error}
        </span>
      ) : null}
    </fieldset>
  )
})

export function BookDemoForm() {
  const copy = useRegistrationFormSettingsContext()
  const [form, setForm] = useState<RegistrationFormState>(initialState)
  const [phase, setPhase] = useState<FormPhase>('idle')
  const [submitError, setSubmitError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({})
  const morphRef = useRef<HTMLDivElement>(null)
  const [morphHeight, setMorphHeight] = useState<number | null>(null)

  const isLocked = phase !== 'idle'
  const headerLede = copy.pageLede.trim() || copy.formSubtitle.trim()
  const registrationClosed = copy.registrationOpen === false
  const ticketAmount = formatPriceFromCents(copy.ticketPriceCents)
  const designationOptions = copy.designationOptions.filter(
    (option): option is { value: RegistrationDesignation; label: string; description?: string } =>
      isValidDesignationValue(option.value),
  )

  const update = useCallback(
    <K extends keyof RegistrationFormState>(key: K, value: RegistrationFormState[K]) => {
      if (phase !== 'idle') return
      setForm((prev) => ({ ...prev, [key]: value }))
      setSubmitError('')
      setFieldErrors((prev) => {
        if (!prev[key]) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
    },
    [phase],
  )

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (phase !== 'idle') return

    const nextFieldErrors = validateRegistrationForm(form, copy)
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setSubmitError('')
      return
    }

    setPhase('submitting')
    setSubmitError('')
    setFieldErrors({})

    try {
      await api.submitConferenceRegistration({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        linkedIn: form.linkedIn.trim(),
        designation: form.designation,
      })
      const height = morphRef.current?.offsetHeight
      if (height && height > 0) setMorphHeight(height)
      setPhase('success')
    } catch (err: unknown) {
      setPhase('idle')
      if (err instanceof RegistrationApiError) {
        setSubmitError(err.message)
        return
      }
      setSubmitError(copy.genericErrorMessage?.trim() || 'Something went wrong. Try again.')
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
                amount={ticketAmount}
                note={copy.priceNote}
              />
            </header>

            <form className="book-demo-form" onSubmit={handleSubmit} noValidate>
              <div className={`book-demo-form__fields${isLocked ? ' book-demo-form__fields--locked' : ''}`}>
                {copy.formTitle.trim() ? (
                  <p className="book-demo-form__fields-heading">{copy.formTitle}</p>
                ) : null}

                <BookDemoTextField
                  label={copy.fields.name.label}
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder={copy.fields.name.placeholder}
                  value={form.name}
                  error={fieldErrors.name}
                  disabled={isLocked}
                  required={copy.fields.name.required !== false}
                  onChange={(value) => update('name', value)}
                />

                <BookDemoTextField
                  label={copy.fields.email.label}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={copy.fields.email.placeholder}
                  value={form.email}
                  error={fieldErrors.email}
                  disabled={isLocked}
                  required={copy.fields.email.required !== false}
                  onChange={(value) => update('email', value)}
                />

                <div className="book-demo-form__row">
                  <BookDemoTextField
                    label={copy.fields.phone.label}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={copy.fields.phone.placeholder}
                    value={form.phone}
                    error={fieldErrors.phone}
                    disabled={isLocked}
                    required={copy.fields.phone.required !== false}
                    onChange={(value) => update('phone', value)}
                  />

                  <BookDemoTextField
                    label={copy.fields.linkedIn.label}
                    name="linkedIn"
                    type="url"
                    autoComplete="url"
                    placeholder={copy.fields.linkedIn.placeholder}
                    value={form.linkedIn}
                    error={fieldErrors.linkedIn}
                    disabled={isLocked}
                    required={copy.fields.linkedIn.required !== false}
                    onChange={(value) => update('linkedIn', value)}
                  />
                </div>

                <DesignationField
                  label={copy.fields.designation.label}
                  options={designationOptions}
                  value={form.designation}
                  error={fieldErrors.designation}
                  disabled={isLocked}
                  onSelect={(value) => update('designation', value)}
                />
              </div>

              {Object.keys(fieldErrors).length > 1 ? (
                <p className="book-demo-form__error" role="alert">
                  Please fix the highlighted fields below.
                </p>
              ) : null}

              {submitError ? (
                <p className="book-demo-form__error" role="alert">
                  {submitError}
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
