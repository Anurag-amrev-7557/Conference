import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Mail, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { AdminPageIntro } from './admin-ui';
import { AdminWorkspaceShell } from './AdminWorkspaceShell';
import { NEWSLETTER_TAB_INTROS } from './workspaceTabIntros';
import { DataTable, EmptyState, SkeletonTable, Badge, ConfirmDialog } from './ui';
import type { DataTableColumn } from './ui';
import { useToast } from './ui/Toast';

type SignupRow = {
  id: string;
  email: string;
  source: string;
  createdAt: string;
};

export const NewsletterManager: React.FC = () => {
  const token = localStorage.getItem('adminToken') || '';
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<SignupRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SignupRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getNewsletterSignups(token, 500);
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load signups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteNewsletterSignup(token, deleteTarget.id);
      toast({ variant: 'success', title: 'Signup removed', description: deleteTarget.email });
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast({
        variant: 'error',
        title: 'Delete failed',
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const res =
        items.length >= total
          ? { items, total }
          : await api.getNewsletterSignups(token, Math.min(total, 500));
      if (res.total > res.items.length) {
        toast({
          variant: 'warning',
          title: 'Partial export',
          description: `Exported ${res.items.length} of ${res.total} signups (500 row limit).`,
        });
      }
      const blob = new Blob(
        [JSON.stringify({ exportedAt: new Date().toISOString(), items: res.items, total: res.total }, null, 2)],
        { type: 'application/json' },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-signups-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ variant: 'success', title: 'Export complete', description: `${res.items.length} signups exported.` });
    } catch (e) {
      toast({
        variant: 'error',
        title: 'Export failed',
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  const columns: DataTableColumn<SignupRow>[] = [
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="admin-newsletter-row__icon" aria-hidden>
            <Mail className="w-4 h-4" />
          </div>
          <span className="font-medium">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (row) => (
        <Badge variant="neutral" className="normal-case tracking-normal capitalize">
          {row.source}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Signed up',
      sortable: true,
      render: (row) => (
        <span className="admin-newsletter-row__date">{new Date(row.createdAt).toLocaleString()}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--icon"
          aria-label={`Remove ${row.email}`}
          onClick={() => setDeleteTarget(row)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <AdminWorkspaceShell
      editorClassName="admin-book-page"
      panelFlush
      toolbar={<AdminPageIntro compact className="mb-0" lede="Waitlist emails captured across the site." />}
      editorHeader={NEWSLETTER_TAB_INTROS}
      editorHeaderAside={
        <div className="admin-page-metrics-inline">
          <span>{loading ? 'Loading…' : `${total} signups`}</span>
        </div>
      }
      saveStatus={deleting ? 'saving' : 'idle'}
      headerAction={
        <>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            Refresh
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            onClick={() => void handleExport()}
            disabled={items.length === 0 || loading}
          >
            <Download className="w-4 h-4" aria-hidden />
            Export
          </button>
        </>
      }
    >
      <div className="admin-catalog-panel">
        {error ? (
          <p className="admin-error mb-4" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <SkeletonTable rows={6} cols={3} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Mail}
            heading="No signups yet"
            subtext="When visitors join your waitlist, their emails will appear here."
            actionLabel="Configure waitlist"
            onAction={() => navigate('/admin/settings')}
          />
        ) : (
          <div className="admin-newsletter-table">
            <DataTable columns={columns} data={items} embedded />
          </div>
        )}

        <ConfirmDialog
          open={deleteTarget != null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Remove signup?"
          description={deleteTarget ? `Remove ${deleteTarget.email} from the list?` : ''}
          confirmLabel="Remove"
          variant="danger"
          loading={deleting}
          onConfirm={() => void confirmDelete()}
        />
      </div>
    </AdminWorkspaceShell>
  );
};
