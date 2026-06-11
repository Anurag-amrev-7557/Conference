import type {
  ConferenceRegistrationFormSettings,
  RegistrationDesignation,
} from './registrationTypes'

export const REGISTRATION_DESIGNATION_VALUES = [
  'enterprise',
  'student',
  'individual',
  'sponsor',
] as const satisfies readonly RegistrationDesignation[]

const DESIGNATION_SET = new Set<string>(REGISTRATION_DESIGNATION_VALUES)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type RegistrationFormState = {
  name: string
  email: string
  phone: string
  linkedIn: string
  designation: RegistrationDesignation | ''
}

export type RegistrationFieldKey = keyof RegistrationFormState

export type RegistrationFieldErrors = Partial<Record<RegistrationFieldKey, string>>

function isFieldRequired(
  fields: ConferenceRegistrationFormSettings['fields'],
  key: Exclude<RegistrationFieldKey, 'designation'>,
): boolean {
  return fields[key]?.required !== false
}

export function isValidDesignationValue(value: string): value is RegistrationDesignation {
  return DESIGNATION_SET.has(value)
}

export function validateRegistrationForm(
  form: RegistrationFormState,
  copy: Pick<ConferenceRegistrationFormSettings, 'fields' | 'designationOptions' | 'validationMessages'>,
): RegistrationFieldErrors {
  const errors: RegistrationFieldErrors = {}
  const messages = copy.validationMessages ?? {}

  if (isFieldRequired(copy.fields, 'name')) {
    const name = form.name.trim()
    if (!name) {
      errors.name = messages.nameRequired?.trim() || 'Please enter your full name.'
    } else if (name.length > 120) {
      errors.name = 'Name must be 120 characters or fewer.'
    }
  }

  const email = form.email.trim()
  if (isFieldRequired(copy.fields, 'email')) {
    if (!email) {
      errors.email = messages.emailRequired?.trim() || 'Please enter your email.'
    } else if (!EMAIL_PATTERN.test(email) || email.length > 200) {
      errors.email = messages.emailInvalid?.trim() || 'Please enter a valid email address.'
    }
  }

  const phone = form.phone.trim()
  if (isFieldRequired(copy.fields, 'phone')) {
    if (!phone) {
      errors.phone = messages.phoneRequired?.trim() || 'Please enter your phone number.'
    } else if (phone.length < 7) {
      errors.phone = 'Enter a valid phone number.'
    } else if (phone.length > 30) {
      errors.phone = 'Phone number is too long.'
    }
  }

  const linkedIn = form.linkedIn.trim()
  if (isFieldRequired(copy.fields, 'linkedIn')) {
    if (!linkedIn) {
      errors.linkedIn = messages.linkedInRequired?.trim() || 'Please enter your LinkedIn profile.'
    } else if (linkedIn.length > 200) {
      errors.linkedIn = 'LinkedIn profile is too long.'
    }
  }

  if (copy.fields.designation?.required !== false) {
    if (!form.designation) {
      errors.designation =
        messages.designationRequired?.trim() || 'Please select how you are registering.'
    } else if (!isValidDesignationValue(form.designation)) {
      errors.designation = 'Please select a valid registration type.'
    } else {
      const allowed = new Set(
        copy.designationOptions
          .map((option) => option.value)
          .filter(isValidDesignationValue),
      )
      if (!allowed.has(form.designation)) {
        errors.designation = 'Please select a valid registration type.'
      }
    }
  }

  return errors
}
