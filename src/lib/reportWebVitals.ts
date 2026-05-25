import { onCLS, onINP, onLCP, type Metric } from 'web-vitals'
import { MarketingService } from './marketing'

let started = false

function sendMetric(metric: Metric) {
  void MarketingService.logEvent('web_vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    path: typeof window !== 'undefined' ? window.location.pathname : '/',
  })
}

function isProdBuild(): boolean {
  return import.meta.env.PROD
}

export function initWebVitalsReporting(): void {
  if (!isProdBuild()) return
  if (started) return
  started = true

  onLCP(sendMetric)
  onINP(sendMetric)
  onCLS(sendMetric)
}
