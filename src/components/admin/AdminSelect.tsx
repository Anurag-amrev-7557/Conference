import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAdminTheme } from './providers/AdminThemeProvider';

export type AdminSelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type AdminSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  menuPortal?: boolean;
  menuVariant?: 'default' | 'rich';
  menuHeading?: string;
  menuSubheading?: string;
  'aria-label'?: string;
};

export function AdminSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled,
  className,
  menuPortal = true,
  menuVariant = 'default',
  menuHeading,
  menuSubheading,
  'aria-label': ariaLabel,
}: AdminSelectProps) {
  const { theme } = useAdminTheme();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const hasDescriptions = options.some((option) => Boolean(option.description));
  const isRichMenu = menuVariant === 'rich' || hasDescriptions;

  const updateMenuPosition = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const menuMaxHeight = isRichMenu ? 320 : 256;
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuMaxHeight + gap && rect.top > spaceBelow;
    const minWidth = isRichMenu ? Math.max(rect.width, 17.5 * 16) : Math.max(rect.width, 12.5 * 16);

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: minWidth,
      zIndex: 10000,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }, [isRichMenu]);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('.admin-select__menu')) setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onReflow = () => updateMenuPosition();

    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);

    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [open, updateMenuPosition]);

  const menu = (
    <AnimatePresence>
      {open ? (
        <motion.ul
          initial={{ opacity: 0, y: menuPortal ? 4 : -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: menuPortal ? 2 : -2, scale: 0.99 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'admin-shell admin-select__menu',
            menuPortal && 'admin-select__menu--portal',
            isRichMenu && 'admin-select__menu--rich',
          )}
          data-theme={theme}
          style={menuPortal ? menuStyle : undefined}
          role="listbox"
        >
          {isRichMenu && (menuHeading || menuSubheading) ? (
            <li className="admin-select__menu-intro" role="presentation">
              {menuHeading ? (
                <span className="admin-select__menu-intro-title">{menuHeading}</span>
              ) : null}
              {menuSubheading ? (
                <span className="admin-select__menu-intro-desc">{menuSubheading}</span>
              ) : null}
            </li>
          ) : null}
          {options.map((opt) => {
            const active = opt.value === value;
            const isDisabled = Boolean(opt.disabled);
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  className={cn(
                    'admin-select__option',
                    isRichMenu && 'admin-select__option--rich',
                    active && 'admin-select__option--active',
                    isDisabled && 'admin-select__option--disabled',
                  )}
                  onClick={() => {
                    if (isDisabled) return;
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="admin-select__option-body">
                    <span className="admin-select__option-label">{opt.label}</span>
                    {opt.description ? (
                      <span className="admin-select__option-desc">{opt.description}</span>
                    ) : null}
                  </span>
                  <span className="admin-select__option-mark" aria-hidden>
                    {active ? <Check className="admin-select__check" /> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </motion.ul>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div ref={rootRef} className={cn('admin-select', isRichMenu && 'admin-select--rich', className)}>
      <button
        type="button"
        className={cn(
          'admin-select__trigger',
          open && 'admin-select__trigger--open',
        )}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        {selected ? (
          <span className="admin-select__trigger-label">{selected.label}</span>
        ) : (
          <span className="admin-select__value admin-select__value--placeholder">{placeholder}</span>
        )}
        <span className="admin-select__chevron-wrap" aria-hidden>
          <ChevronDown className={cn('admin-select__chevron', open && 'admin-select__chevron--open')} />
        </span>
      </button>
      {menuPortal ? (typeof document !== 'undefined' ? createPortal(menu, document.body) : null) : menu}
    </div>
  );
};
