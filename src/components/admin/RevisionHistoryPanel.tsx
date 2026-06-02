import React, { useEffect, useState } from 'react';
import { History, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../lib/api';
import { AdminButton, AdminFormSection } from './admin-ui';
import { AdminConfirmDialog } from './AdminConfirmDialog';
import { cn } from '../../lib/utils';
import { useToast } from './ui/Toast';

type RevisionRow = {
  id: string;
  entityType: string;
  entityId: string;
  changedBy: string;
  createdAt: string;
};

interface RevisionHistoryPanelProps {
  entityType: 'article' | 'event' | 'site_content';
  entityId: string;
  onRestored?: () => void | Promise<void>;
  /** Keys to highlight when comparing snapshot to current (e.g. title, content). */
  previewKeys?: string[];
  currentSnapshot?: Record<string, unknown>;
  /** Skip legacy section shell — use inside AdminEditorSection */
  embedded?: boolean;
}

export const RevisionHistoryPanel: React.FC<RevisionHistoryPanelProps> = ({
  entityType,
  entityId,
  onRestored,
  previewKeys = ['title', 'content', 'excerpt'],
  currentSnapshot,
  embedded = false,
}) => {
  const { toast } = useToast();
  const token = localStorage.getItem('adminToken') || '';
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<RevisionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [restoreTargetId, setRestoreTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !token) return;
    let cancelled = false;
    setLoading(true);
    void api
      .getRevisions(token, entityType, entityId)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          toast({
            variant: 'error',
            title: 'Could not load revisions',
            description: err instanceof Error ? err.message : undefined,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, token, entityType, entityId]);

  const loadDetail = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    try {
      const row = await api.getRevisionDetail(token, id);
      setDetail(row.snapshot ?? null);
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Could not load revision',
        description: err instanceof Error ? err.message : undefined,
      });
      setDetail(null);
    }
  };

  const handleRestore = async (id: string) => {
    setBusyId(id);
    try {
      await api.restoreRevision(token, id);
      await onRestored?.();
      setOpen(false);
      setExpandedId(null);
      toast({ variant: 'success', title: 'Version restored' });
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Restore failed',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusyId(null);
    }
  };

  const diffLines =
    detail && currentSnapshot
      ? previewKeys
          .filter((key) => {
            const a = currentSnapshot[key];
            const b = detail[key];
            return JSON.stringify(a) !== JSON.stringify(b);
          })
          .map((key) => ({
            key,
            before: detail[key],
            after: currentSnapshot[key],
          }))
      : [];

  const body = (
    <>
      <button
        type="button"
        className={cn(
          'flex items-center gap-2 text-sm font-medium ds-transition-base',
          embedded
            ? 'text-[var(--editor-primary)] hover:opacity-80'
            : 'text-[var(--admin-primary)] hover:underline',
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <History className="w-4 h-4" aria-hidden />
        {open ? 'Hide history' : 'Show history'}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open ? (
        <div className={cn('space-y-2', embedded ? 'mt-3' : 'mt-4')}>
          {loading ? (
            <p className="admin-editor-field__hint">Loading revisions…</p>
          ) : null}
          {!loading && items.length === 0 ? (
            <p className="admin-editor-field__hint">No revisions yet.</p>
          ) : null}
          {items.map((row) => (
            <div
              key={row.id}
              className={cn(
                'rounded-lg p-3 text-sm',
                embedded
                  ? 'border border-[var(--editor-border-secondary)] bg-[var(--editor-bg-primary,var(--ds-surface-elevated))]'
                  : 'border border-[var(--admin-border)] bg-[var(--admin-surface)]',
              )}
            >
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div>
                  <p className="font-medium text-[var(--editor-text-primary)]">
                    {new Date(row.createdAt).toLocaleString()}
                  </p>
                  <p className="admin-editor-field__hint mt-0.5">by {row.changedBy}</p>
                </div>
                <div className="flex gap-2">
                  <AdminButton
                    type="button"
                    variant="secondary"
                    className="!min-h-9 !px-3 text-xs"
                    onClick={() => void loadDetail(row.id)}
                  >
                    {expandedId === row.id ? 'Hide' : 'Preview'}
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="secondary"
                    className="!min-h-9 !px-3"
                    disabled={busyId === row.id}
                    onClick={() => setRestoreTargetId(row.id)}
                    aria-label="Restore version"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
              {expandedId === row.id && detail ? (
                <div
                  className={cn(
                    'mt-3 pt-3 space-y-2',
                    embedded
                      ? 'border-t border-[var(--editor-border-secondary)]'
                      : 'border-t border-[var(--admin-border)]',
                  )}
                >
                  {diffLines.length > 0 ? (
                    diffLines.map(({ key, before, after }) => (
                      <div key={key} className="mb-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-[var(--editor-text-tertiary)] mb-1">
                          {key}
                        </p>
                        <p className="text-xs text-rose-700 dark:text-rose-300 line-through truncate">
                          {String(before ?? '').slice(0, 200)}
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 truncate">
                          {String(after ?? '').slice(0, 200)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <pre
                      className={cn(
                        'text-xs overflow-x-auto max-h-40 p-2 rounded',
                        embedded ? 'bg-[var(--editor-bg-secondary)]' : 'bg-[var(--admin-surface-muted)]',
                      )}
                    >
                      {JSON.stringify(
                        previewKeys.reduce(
                          (acc, k) => {
                            if (detail[k] !== undefined) acc[k] = detail[k];
                            return acc;
                          },
                          {} as Record<string, unknown>,
                        ),
                        null,
                        2,
                      )}
                    </pre>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </>
  );

  const confirmDialog = (
    <AdminConfirmDialog
      open={restoreTargetId != null}
      onOpenChange={(open) => !open && setRestoreTargetId(null)}
      title="Restore this version?"
      description="Current content will be overwritten with this snapshot."
      confirmLabel="Restore"
      variant="primary"
      loading={busyId != null}
      onConfirm={async () => {
        if (!restoreTargetId) return;
        await handleRestore(restoreTargetId);
        setRestoreTargetId(null);
      }}
    />
  );

  if (embedded) {
    return (
      <div className="admin-revision-history">
        {body}
        {confirmDialog}
      </div>
    );
  }

  return (
    <AdminFormSection
      title="Version history"
      description="Automatic snapshots saved on each update."
    >
      {body}
      {confirmDialog}
    </AdminFormSection>
  );
};
