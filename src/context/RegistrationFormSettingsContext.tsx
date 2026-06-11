import { createContext, useContext, type ReactNode } from 'react'
import { useRegistrationFormSettings } from '../hooks/useRegistrationFormSettings'
import type { ConferenceRegistrationFormSettings } from '../lib/registrationTypes'

const RegistrationFormSettingsContext = createContext<
  ConferenceRegistrationFormSettings | undefined
>(undefined)

export function RegistrationFormSettingsProvider({ children }: { children: ReactNode }) {
  const settings = useRegistrationFormSettings()
  return (
    <RegistrationFormSettingsContext.Provider value={settings}>
      {children}
    </RegistrationFormSettingsContext.Provider>
  )
}

export function useRegistrationFormSettingsContext(): ConferenceRegistrationFormSettings {
  const context = useContext(RegistrationFormSettingsContext)
  if (context === undefined) {
    throw new Error(
      'useRegistrationFormSettingsContext must be used within RegistrationFormSettingsProvider',
    )
  }
  return context
}
