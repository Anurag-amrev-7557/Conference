import { useRef } from 'react'
import { Bold, Italic, Link2, List, Heading2, Quote } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Button } from './Button'

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder = 'text',
): string {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.slice(start, end) || placeholder
  return textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end)
}

function prefixLines(textarea: HTMLTextAreaElement, prefix: string, placeholder: string): string {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value
  const block = value.slice(start, end) || placeholder
  const prefixed = block
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n')
  return value.slice(0, start) + prefixed + value.slice(end)
}

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  className?: string
  label?: string
}

export function RichTextEditor({
  value,
  onChange,
  rows = 12,
  placeholder,
  className,
  label,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const apply = (fn: (el: HTMLTextAreaElement) => string) => {
    const el = textareaRef.current
    if (!el) return
    onChange(fn(el))
    requestAnimationFrame(() => el.focus())
  }

  const tools = [
    { icon: Bold, label: 'Bold', fn: (el: HTMLTextAreaElement) => wrapSelection(el, '**', '**', 'bold') },
    { icon: Italic, label: 'Italic', fn: (el: HTMLTextAreaElement) => wrapSelection(el, '_', '_', 'italic') },
    { icon: Heading2, label: 'Heading', fn: (el: HTMLTextAreaElement) => prefixLines(el, '## ', 'Heading') },
    { icon: Quote, label: 'Quote', fn: (el: HTMLTextAreaElement) => prefixLines(el, '> ', 'Quote') },
    { icon: List, label: 'List', fn: (el: HTMLTextAreaElement) => prefixLines(el, '- ', 'Item') },
    {
      icon: Link2,
      label: 'Link',
      fn: (el: HTMLTextAreaElement) => wrapSelection(el, '[', '](https://)', 'link text'),
    },
  ] as const

  return (
    <div className={cn('flex flex-col gap-[var(--ds-space-2)]', className)}>
      {label ? (
        <span className="text-[var(--ds-text-sm)] font-[var(--ds-font-medium)] text-[var(--ds-text-primary)]">
          {label}
        </span>
      ) : null}
      <div
        className="flex flex-wrap gap-1 p-[var(--ds-space-2)] rounded-[var(--ds-radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-sunken)]"
        role="toolbar"
        aria-label="Formatting"
      >
        {tools.map(({ icon: Icon, label: toolLabel, fn }) => (
          <Button
            key={toolLabel}
            type="button"
            variant="secondary"
            size="sm"
            aria-label={toolLabel}
            onClick={() => apply(fn)}
            className="!min-h-8 !px-2"
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full min-h-[16rem] px-3 py-2 font-mono text-sm resize-y',
          'bg-[var(--ds-surface-elevated)] border border-[var(--ds-border)] rounded-[var(--ds-radius-lg)]',
          'text-[var(--ds-text-primary)] ds-focus-ring ds-transition-base placeholder:text-[var(--ds-text-subtle)]',
        )}
      />
    </div>
  )
}

/** @deprecated Use RichTextEditor — kept for BlogManager transition */
export function MarkdownToolbarConnected({
  textareaRef,
  onApply,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onApply: (next: string) => void
}) {
  const apply = (fn: (el: HTMLTextAreaElement) => string) => {
    const el = textareaRef.current
    if (!el) return
    onApply(fn(el))
    requestAnimationFrame(() => el.focus())
  }

  const tools = [
    { icon: Bold, label: 'Bold', fn: (el: HTMLTextAreaElement) => wrapSelection(el, '**', '**', 'bold') },
    { icon: Italic, label: 'Italic', fn: (el: HTMLTextAreaElement) => wrapSelection(el, '_', '_', 'italic') },
    { icon: Heading2, label: 'Heading', fn: (el: HTMLTextAreaElement) => prefixLines(el, '## ', 'Heading') },
    { icon: Quote, label: 'Quote', fn: (el: HTMLTextAreaElement) => prefixLines(el, '> ', 'Quote') },
    { icon: List, label: 'List', fn: (el: HTMLTextAreaElement) => prefixLines(el, '- ', 'Item') },
    {
      icon: Link2,
      label: 'Link',
      fn: (el: HTMLTextAreaElement) => wrapSelection(el, '[', '](https://)', 'link text'),
    },
  ] as const

  return (
    <div className="flex flex-wrap gap-1 p-[var(--ds-space-2)] rounded-[var(--ds-radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-sunken)] mb-[var(--ds-space-2)]">
      {tools.map(({ icon: Icon, label, fn }) => (
        <Button key={label} type="button" variant="secondary" size="sm" aria-label={label} onClick={() => apply(fn)} className="!min-h-8 !px-2">
          <Icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  )
}
