import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { api } from '../../lib/api';
import { useAdminSession } from './useAdminSession';
import { useAdminArticles, useAdminEvents } from './useAdminCatalog';
import {
  FileText,
  Settings,
  Palette,
  ChevronRight,
  Calendar,
  Mic2,
  ImageIcon,
  Database,
  Download,
  Upload,
  ClipboardList,
  Mail,
  Layers,
  FilePen,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActivityFeed } from './ui';
import { useToast } from './ui/Toast';
import { AdminConfirmDialog } from './AdminConfirmDialog';

const STAT_ICONS = {
  articles: FileText,
  events: Calendar,
  modules: Layers,
  drafts: FilePen,
} as const;

export const AdminOverview: React.FC = () => {
  const { data, refresh } = useWebsiteData();
  const { isSuperAdmin, isViewer } = useAdminSession();
  const { toast } = useToast();
  const [backupStatus, setBackupStatus] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<'backup' | 'export' | 'import' | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [auditItems, setAuditItems] = useState<
    Array<{ id: string; username: string; action: string; entityType: string; summary?: string; createdAt: string }>
  >([]);

  const token = localStorage.getItem('adminToken') || '';

  useEffect(() => {
    if (!token) return;
    void api.getAuditLog(token, 20).then((res) => setAuditItems(res.items)).catch(() => undefined);
  }, [token]);

  const handleBackup = async () => {
    if (!token) return;
    setBusy('backup');
    setBackupStatus('');
    try {
      const result = await api.triggerBackup(token);
      setBackupStatus(`Backup saved: ${result.backupPath}`);
      toast({ variant: 'success', title: 'Backup created', description: result.backupPath });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Backup failed';
      setBackupStatus(msg);
      toast({ variant: 'error', title: 'Backup failed', description: msg });
    } finally {
      setBusy(null);
    }
  };

  const handleExport = async () => {
    if (!token) return;
    setBusy('export');
    setExportStatus('');
    try {
      const payload = await api.exportContent(token);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cms-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('Export downloaded.');
      toast({ variant: 'success', title: 'Export complete', description: 'JSON file downloaded.' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Export failed';
      setExportStatus(msg);
      toast({ variant: 'error', title: 'Export failed', description: msg });
    } finally {
      setBusy(null);
    }
  };

  const handleImportFile = async (file: File): Promise<boolean> => {
    if (!token) return false;
    setBusy('import');
    setImportStatus('');
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as unknown;
      const result = await api.importContent(token, payload);
      const parts = Object.entries(result.summary ?? {})
        .map(([key, count]) => `${key}: ${count}`)
        .join(', ');
      setImportStatus(parts ? `Import complete (${parts}).` : 'Import complete.');
      toast({ variant: 'success', title: 'Import complete', description: parts || undefined });
      await refresh();
      void api.getAuditLog(token, 20).then((res) => setAuditItems(res.items)).catch(() => undefined);
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Import failed';
      setImportStatus(msg);
      toast({ variant: 'error', title: 'Import failed', description: msg });
      return false;
    } finally {
      setBusy(null);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const { items: adminArticles } = useAdminArticles();
  const { items: adminEvents } = useAdminEvents();
  const publishedArticles = adminArticles.filter((a) => a.isPublished).length;
  const publishedEvents = adminEvents.filter((e) => e.isPublished).length;
  const activeModules = Object.values(data.settings.visibility).filter(Boolean).length;
  const draftArticles = adminArticles.length - publishedArticles;
  const totalModules = Object.values(data.settings.visibility).length;

  const stats = [
    {
      key: 'articles',
      label: 'Published articles',
      value: publishedArticles,
      total: adminArticles.length,
      tone: 'success' as const,
    },
    {
      key: 'events',
      label: 'Published events',
      value: publishedEvents,
      total: adminEvents.length,
      tone: 'neutral' as const,
    },
    {
      key: 'modules',
      label: 'Active modules',
      value: activeModules,
      total: totalModules,
      tone: 'success' as const,
    },
    {
      key: 'drafts',
      label: 'Draft articles',
      value: draftArticles,
      total: draftArticles > 0 ? 'Needs review' : 'All published',
      tone: draftArticles > 0 ? ('warning' as const) : ('neutral' as const),
    },
  ];

  const tools = [
    { title: 'Summit homepage', path: '/admin/conference', icon: Mic2, desc: 'Summit content, embedded blocks, visibility, SEO' },
    { title: 'Brand & theme', path: '/admin/design', icon: Palette, desc: 'Brand name, colors, typography' },
    { title: 'Site settings', path: '/admin/settings', icon: Settings, desc: 'Global SEO, navigation, scripts' },
    { title: 'Media library', path: '/admin/media', icon: ImageIcon, desc: 'Images and uploads' },
    { title: 'Blog', path: '/admin/blogs', icon: FileText, desc: 'Articles, page hero, SEO' },
    { title: 'Events', path: '/admin/events', icon: Calendar, desc: 'Schedule, page hero, SEO' },
    { title: 'Registrations', path: '/admin/registrations', icon: ClipboardList, desc: 'Summit sign-ups and form copy' },
    { title: 'Newsletter', path: '/admin/newsletter', icon: Mail, desc: 'Waitlist and playbook signups' },
  ];

  const opsActions = [
    {
      id: 'backup' as const,
      icon: Database,
      title: 'Create backup',
      desc: 'Save a full snapshot on the server',
      onClick: () => void handleBackup(),
      restricted: !isSuperAdmin,
      restrictedTitle: 'Super admin only',
    },
    {
      id: 'export' as const,
      icon: Download,
      title: 'Export JSON',
      desc: 'Download all CMS content locally',
      onClick: () => void handleExport(),
      restricted: isViewer,
      restrictedTitle: 'Editor access required',
    },
    {
      id: 'import' as const,
      icon: Upload,
      title: 'Import JSON',
      desc: 'Merge content from a backup file',
      onClick: () => importInputRef.current?.click(),
      restricted: !isSuperAdmin,
      restrictedTitle: 'Super admin only',
    },
  ];

  const opsStatus = backupStatus || exportStatus || importStatus;

  return (
    <div className="admin-dashboard admin-dashboard--immersive admin-page--fluid ds-page-enter">
      <header className="admin-dashboard__intro">
        <p className="admin-dashboard__lede">
          Overview of your conference site content and recent changes.
        </p>
      </header>

      {/* Zone B — metrics ribbon */}
      <section className="admin-dashboard__zone" aria-labelledby="dashboard-stats-heading">
        <h2 id="dashboard-stats-heading" className="sr-only">At a glance</h2>
        <div className="admin-stat-grid admin-stat-grid--4">
          {stats.map((stat) => {
            const Icon = STAT_ICONS[stat.key as keyof typeof STAT_ICONS];
            return (
              <article key={stat.key} className="admin-stat-card">
                <div className="admin-stat-card__icon" aria-hidden>
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div className="admin-stat-card__body">
                  <p className="admin-stat-card__label">{stat.label}</p>
                  <p className="admin-stat-card__value">
                    <span className="admin-stat-card__num">{stat.value}</span>
                    <span className={`admin-stat-card__badge admin-stat-card__badge--${stat.tone}`}>
                      {typeof stat.total === 'number' ? `${stat.total} total` : stat.total}
                    </span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Zone C — quick actions (full width) */}
      <section className="admin-dashboard__zone" aria-labelledby="dashboard-workspace-heading">
        <h2 id="dashboard-workspace-heading" className="admin-dashboard__section-title">
          Quick actions
        </h2>
        <div className="admin-tool-grid admin-tool-grid--3">
          {tools.map((tool) => (
            <Link key={tool.path} to={tool.path} className="admin-tool-card">
              <div className="admin-tool-card__icon" aria-hidden>
                <tool.icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="admin-tool-card__body">
                <h3 className="admin-tool-card__title">{tool.title}</h3>
                <p className="admin-tool-card__desc">{tool.desc}</p>
              </div>
              <ChevronRight className="admin-tool-card__chevron" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* Zone D — activity + data management */}
      <div className="admin-dashboard__deck">
        <section className="admin-dashboard__zone admin-dashboard__zone--feed" aria-labelledby="dashboard-audit-heading">
          <h2 id="dashboard-audit-heading" className="admin-dashboard__section-title">
            Recent activity
          </h2>
          <div className="admin-dashboard__panel admin-dashboard__panel--activity">
            {auditItems.length > 0 ? (
              <ActivityFeed
                className="admin-activity-feed"
                items={auditItems.map((row) => ({
                  id: row.id,
                  initials: row.username.slice(0, 2).toUpperCase(),
                  description: (
                    <>
                      <strong>{row.username}</strong> {row.action}{' '}
                      <span className="admin-activity-feed__entity">{row.entityType}</span>
                      {row.summary ? <> — {row.summary}</> : null}
                    </>
                  ),
                  timestamp: new Date(row.createdAt).toLocaleString(),
                }))}
              />
            ) : (
              <p className="admin-dashboard__empty">No activity yet. Changes across the CMS will appear here.</p>
            )}
          </div>
        </section>

        <section
          className="admin-dashboard__zone admin-dashboard__zone--ops"
          aria-labelledby="dashboard-ops-heading"
        >
          <h2 id="dashboard-ops-heading" className="admin-dashboard__section-title">
            Data management
          </h2>
          <div className="admin-ops-stack">
            {opsActions.map(({ id, icon: Icon, title, desc, onClick, restricted, restrictedTitle }) => {
              const isLoading = busy === id;
              const isDisabled = busy !== null || restricted;
              return (
                <button
                  key={id}
                  type="button"
                  className="admin-ops-tile"
                  onClick={onClick}
                  disabled={isDisabled}
                  title={restricted ? restrictedTitle : undefined}
                >
                  <span className="admin-ops-tile__icon" aria-hidden>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    )}
                  </span>
                  <span className="admin-ops-tile__body">
                    <span className="admin-ops-tile__title">{title}</span>
                    <span className="admin-ops-tile__desc">{desc}</span>
                  </span>
                  <ChevronRight className="admin-ops-tile__chevron" aria-hidden />
                </button>
              );
            })}
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPendingImportFile(file);
              }}
            />
            <AdminConfirmDialog
              open={pendingImportFile != null}
              onOpenChange={(open) => {
                if (!open) {
                  setPendingImportFile(null);
                  if (importInputRef.current) importInputRef.current.value = '';
                }
              }}
              title="Import CMS data?"
              description="This will merge and overwrite CMS data from the selected file. This action cannot be undone."
              confirmLabel="Import"
              variant="primary"
              loading={busy === 'import'}
              onConfirm={async () => {
                if (!pendingImportFile) return;
                const ok = await handleImportFile(pendingImportFile);
                if (ok) setPendingImportFile(null);
              }}
            />
          </div>
          {opsStatus ? (
            <p className="admin-dashboard__ops-status" role="status">
              {opsStatus}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
};
