import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const onLCP = vi.fn()
const onINP = vi.fn()
const onCLS = vi.fn()

vi.mock('web-vitals', () => ({
  onLCP: (...args: unknown[]) => onLCP(...args),
  onINP: (...args: unknown[]) => onINP(...args),
  onCLS: (...args: unknown[]) => onCLS(...args),
}))

const logEvent = vi.fn()

vi.mock('./marketing', () => ({
  MarketingService: { logEvent },
}))

describe('initWebVitalsReporting', () => {
  const env = import.meta.env

  beforeEach(() => {
    vi.resetModules()
    onLCP.mockClear()
    onINP.mockClear()
    onCLS.mockClear()
    logEvent.mockClear()
  })

  afterEach(() => {
    Object.assign(env, { PROD: true, DEV: false })
  })

  it('does not register listeners in development', async () => {
    Object.assign(env, { PROD: false, DEV: true })
    const { initWebVitalsReporting } = await import('./reportWebVitals')
    initWebVitalsReporting()
    initWebVitalsReporting()
    expect(onLCP).not.toHaveBeenCalled()
    expect(logEvent).not.toHaveBeenCalled()
  })

  it('registers LCP, INP, CLS once in production', async () => {
    Object.assign(env, { PROD: true, DEV: false })
    const { initWebVitalsReporting } = await import('./reportWebVitals')
    initWebVitalsReporting()
    initWebVitalsReporting()
    expect(onLCP).toHaveBeenCalledTimes(1)
    expect(onINP).toHaveBeenCalledTimes(1)
    expect(onCLS).toHaveBeenCalledTimes(1)

    const handler = onLCP.mock.calls[0][0] as (m: {
      name: string
      value: number
      rating: string
      delta: number
    }) => void
    handler({ name: 'LCP', value: 1200, rating: 'good', delta: 100 })
    expect(logEvent).toHaveBeenCalledWith('web_vital', expect.objectContaining({ name: 'LCP', value: 1200 }))
  })
})
