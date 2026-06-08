import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { WaveCanvas } from './WaveCanvas'

export type EditorialEyebrowProps = {
  children: ReactNode
  centered?: boolean
  className?: string
  textClassName?: string
  theme?: 'light' | 'dark'
  compactOnMobile?: boolean
}

export function EditorialEyebrow({
  children,
  centered = false,
  className,
  textClassName,
  theme = 'light',
  compactOnMobile = false,
}: EditorialEyebrowProps) {
  return (
    <div
      className={cn(
        'editorial-eyebrow editorial-eyebrow--wave',
        centered && 'editorial-eyebrow--center',
        compactOnMobile && 'editorial-eyebrow--compact-mobile',
        theme === 'dark' && 'editorial-eyebrow--wave-dark',
        className,
      )}
    >
      <WaveCanvas theme={theme} />
      <span className="editorial-eyebrow__pill">
        <span className={cn('section-eyebrow editorial-eyebrow__pill-text !mb-0', textClassName)}>
          {children}
        </span>
      </span>
      {centered ? <WaveCanvas theme={theme} flip /> : null}
    </div>
  )
}
