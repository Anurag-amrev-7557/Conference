export class RegistrationApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'RegistrationApiError'
    this.status = status
  }
}

export async function parseRegistrationResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  if (!text.trim()) return {}
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return {}
  }
}

export function registrationErrorMessage(
  status: number,
  data: Record<string, unknown>,
  fallback: string,
): string {
  const serverMessage = typeof data.error === 'string' ? data.error.trim() : ''

  if (status === 403) {
    return serverMessage || 'Registration is currently closed.'
  }
  if (status === 409) {
    return serverMessage || 'This email is already registered for the summit.'
  }
  if (status === 429) {
    return serverMessage || 'Too many attempts. Please wait a few minutes and try again.'
  }

  return serverMessage || fallback
}
