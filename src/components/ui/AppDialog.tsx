import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type AppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: AppDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-[var(--radius-global,32px)] border border-border/40 bg-white p-6 shadow-premium',
            'max-h-[min(90vh,720px)] overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2',
            className,
          )}
        >
          {description ? (
            <Dialog.Description className="sr-only">{description}</Dialog.Description>
          ) : null}
          <div className="flex items-start justify-between gap-4 mb-6">
            <Dialog.Title className="text-xl font-semibold tracking-tight text-text pr-8">
              {title}
            </Dialog.Title>
            <Dialog.Close
              type="button"
              aria-label="Close"
              className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl border border-border/40 text-muted hover:text-text hover:bg-off transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
