import { cn } from '../../lib/utils'
import { WaveCanvas } from './WaveCanvas'

type SectionWaveLabelProps = {
  label: string
  waves?: 'left' | 'both'
  variant?: 'plain' | 'pill'
  theme?: 'light' | 'dark'
  className?: string
  textClassName?: string
}

export function SectionWaveLabel({
  label,
  waves = 'left',
  variant = 'plain',
  theme = 'light',
  className,
  textClassName,
}: SectionWaveLabelProps) {
  const wave = <WaveCanvas theme={theme} />
  const waveFlip = <WaveCanvas theme={theme} flip />
  const labelEl =
    variant === 'pill' ? (
      <span
        className={cn(
          'whitespace-nowrap text-[0.875rem] font-medium leading-none tracking-[-0.02em] text-zinc-700',
          textClassName,
        )}
      >
        {label}
      </span>
    ) : (
      <p className={cn('hero-eyebrow-text', textClassName)}>{label}</p>
    )

  if (waves === 'both') {
    return (
      <div
        className={cn(
          'inline-flex flex-nowrap items-center gap-3',
          variant === 'pill' &&
            'rounded-full border border-zinc-200/90 bg-white px-4 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          className,
        )}
      >
        {wave}
        {labelEl}
        {waveFlip}
      </div>
    )
  }

  return (
    <div className={cn('hero-eyebrow', className)}>
      {wave}
      {labelEl}
    </div>
  )
}
