import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export type CatalogSelectOption = {
  value: string;
  label: string;
};

type CatalogSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: CatalogSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  'aria-label'?: string;
};

export function CatalogSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled,
  searchable = false,
  searchPlaceholder = 'Search…',
  className,
  'aria-label': ariaLabel,
}: CatalogSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((option) => option.value === value);

  const visibleOptions = useMemo(() => {
    if (!searchable) return options;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (option) => option.value === 'all' || option.label.toLowerCase().includes(query),
    );
  }, [options, searchable, searchQuery]);

  const updateMenuPosition = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const menuMaxHeight = 280;
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuMaxHeight + gap && rect.top > spaceBelow;

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      minWidth: rect.width,
      zIndex: 10000,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
  }, [open, updateMenuPosition]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setSearchQuery('');
  }, []);

  useEffect(() => {
    if (!open) return;

    if (searchable) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      });
    }

    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.catalog-select__menu')) closeMenu();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
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
  }, [open, searchable, updateMenuPosition, closeMenu]);

  const toggleOpen = () => {
    if (disabled) return;
    if (open) {
      closeMenu();
      return;
    }
    updateMenuPosition();
    setOpen(true);
  };

  const menu = (
    <AnimatePresence>
      {open ? (
        <motion.ul
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 2, scale: 0.99 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="catalog-select__menu"
          style={{
            ...menuStyle,
            visibility:
              menuStyle.top !== undefined || menuStyle.bottom !== undefined ? 'visible' : 'hidden',
          }}
          role="listbox"
        >
          {searchable ? (
            <li className="catalog-select__search" role="presentation">
              <div className="catalog-select__search-wrap">
                <Search className="catalog-select__search-icon" aria-hidden />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                  placeholder={searchPlaceholder}
                  className="catalog-select__search-input"
                  aria-label={searchPlaceholder}
                />
              </div>
            </li>
          ) : null}
          {visibleOptions.length === 0 ? (
            <li className="catalog-select__empty" role="presentation">
              No matches
            </li>
          ) : null}
          {visibleOptions.map((option) => {
            const active = option.value === value;
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
                    onChange(option.value);
                    closeMenu();
                  }}
                >
                  <span className="catalog-select__option-label">{option.label}</span>
                  <span className="catalog-select__option-mark" aria-hidden>
                    {active ? <Check className="catalog-select__check" /> : null}
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
    <div ref={rootRef} className={cn('catalog-select', className)}>
      <button
        type="button"
        className={cn('catalog-select__trigger', open && 'catalog-select__trigger--open')}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <span className="catalog-select__trigger-label">{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={cn('catalog-select__chevron', open && 'catalog-select__chevron--open')}
          aria-hidden
        />
      </button>
      {typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
    </div>
  );
}
