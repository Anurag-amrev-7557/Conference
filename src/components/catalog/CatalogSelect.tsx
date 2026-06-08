import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export type CatalogSelectOption = {
  value: string
  label: string
}

type CatalogSelectProps = {
  value: string
  onChange: (value: string) => void
  options: CatalogSelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function CatalogSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled,
  className,
  'aria-label': ariaLabel,
}: CatalogSelectProps) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value)

  const updateMenuPosition = useCallback(() => {
    const root = rootRef.current
    if (!root) return

    const rect = root.getBoundingClientRect()
    const menuMaxHeight = 280
    const gap = 8
    const spaceBelow = window.innerHeight - rect.bottom
    const openUpward = spaceBelow < menuMaxHeight + gap && rect.top > spaceBelow

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      minWidth: rect.width,
      zIndex: 10000,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    })
  }, [])

  useEffect(() => {
    if (!open) return

    updateMenuPosition()

    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        const target = event.target as HTMLElement
        if (!target.closest('.catalog-select__menu')) setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onReflow = () => updateMenuPosition()

    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)

    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    }
  }, [open, updateMenuPosition])

  const menu = (
    <AnimatePresence>
      {open ? (
        <motion.ul
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 2, scale: 0.99 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="catalog-select__menu"
          style={menuStyle}
          role="listbox"
        >
          {options.map((option) => {
            const active = option.value === value
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    'catalog-select__option',
                    active && 'catalog-select__option--active',
                  )}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <span className="catalog-select__option-label">{option.label}</span>
                  <span className="catalog-select__option-mark" aria-hidden>
                    {active ? <Check className="catalog-select__check" /> : null}
                  </span>
                </button>
              </li>
            )
          })}
        </motion.ul>
      ) : null}
    </AnimatePresence>
  )

  return (
    <div ref={rootRef} className={cn('catalog-select', className)}>
      <button
        type="button"
        className={cn('catalog-select__trigger', open && 'catalog-select__trigger--open')}
        onClick={() => !disabled && setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className="catalog-select__trigger-label">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn('catalog-select__chevron', open && 'catalog-select__chevron--open')}
          aria-hidden
        />
      </button>
      {typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
    </div>
  )
}
