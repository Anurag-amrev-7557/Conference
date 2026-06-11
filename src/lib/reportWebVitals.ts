import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

function logMetric(metric: Metric) {
  if (import.meta.env.DEV) {
    console.info(`[web-vitals] ${metric.name}:`, Math.round(metric.value));
  }
}

export function reportWebVitals(): void {
  onCLS(logMetric);
  onINP(logMetric);
  onLCP(logMetric);
}
