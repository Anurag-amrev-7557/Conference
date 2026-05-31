/** Brand accent for full-width wave dividers */
export const WAVE_ACCENT = '#003E99'

export function buildWavePath(
  width: number,
  height: number,
  phase: number,
  amplitude: number,
  wavelength: number,
  _cycles = 2,
): string {
  const mid = height / 2
  const steps = Math.max(8, Math.ceil(width / 6))
  const parts: string[] = []

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width
    const y = mid + amplitude * Math.sin((2 * Math.PI * x) / wavelength + phase)
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(2)}`)
  }

  return parts.join(' ')
}
