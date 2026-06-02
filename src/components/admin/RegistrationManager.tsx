import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Check, ClipboardList, Download, ExternalLink, FileText, Globe, Pencil, Plus, Search, Settings2, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import {
  defaultConferenceRegistrationForm,
  formatPriceFromCents,
} from '../../lib/registrationDefaults'
import type {
  ConferenceRegistrationFormSettings,
  ConferenceRegistrationRecord,
  RegistrationDesignation,
  RegistrationStatus,
} from '../../lib/registrationTypes'
import type { RouteSeoOverride } from '../../lib/websiteData'
import { useWebsiteData } from '../WebsiteDataProvider'
import {
  AdminHeaderSave,
  AdminPageIntro,
  AdminButton,
} from './admin-ui'
import {
  AdminEditorField,
  AdminEditorFields,
  AdminEditorInput,
  editorSaveStatusFrom,
} from './admin-editor-ui'
import { AdminWorkspaceShell } from './AdminWorkspaceShell'
import { REGISTRATION_TAB_INTROS } from './workspaceTabIntros'
import {
  RegistrationFormCopyEditor,
  RegistrationOperationsEditor,
  RegistrationSeoEditor,
} from './RegistrationFormEditor'
import { AdminSelect } from './AdminSelect'
import { useApplyPendingAdminSection } from './admin-workspace-nav'
import { EmptyState, ConfirmDialog, SkeletonTable, DataTable } from './ui'
import { useToast } from './ui/Toast'
import type { DataTableColumn } from './ui'

type TabId = 'submissions' | 'form' | 'operations' | 'seo'
type StatusFilter = 'all' | RegistrationStatus

const EDITOR_TABS: TabId[] = ['form', 'operations', 'seo']

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Approved' },
  { id: 'cancelled', label: 'Rejected' },
]

const STATUS_OPTIONS: RegistrationStatus[] = ['pending', 'confirmed', 'cancelled']

const SUBNAV_GROUPS = [
  {
    label: 'CRM',
    items: [{ id: 'submissions', label: 'Submissions', icon: ClipboardList }],
  },
  {
    label: 'Page',
    items: [
      { id: 'form', label: 'Form copy', icon: FileText },
      { id: 'operations', label: 'Operations', icon: Settings2 },
      { id: 'seo', label: 'SEO', icon: Globe },
    ],
  },
]

function designationLabel(
  value: RegistrationDesignation,
  options: ConferenceRegistrationFormSettings['designationOptions'],
) {
  return options.find((o) => o.value === value)?.label ?? value
}

function allowedLabel(status: RegistrationStatus): 'Yes' | 'No' | 'Pending' {
  if (status === 'confirmed') return 'Yes'
  if (status === 'cancelled') return 'No'
  return 'Pending'
}

function allowedBadgeClass(status: RegistrationStatus) {
  if (status === 'confirmed') return 'admin-allowed-badge--yes'
  if (status === 'cancelled') return 'admin-allowed-badge--no'
  return 'admin-allowed-badge--pending'
}

function csvEscape(value: string | number) {
  const s = String(value ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function exportRegistrationsCsv(
  rows: ConferenceRegistrationRecord[],
  options: ConferenceRegistrationFormSettings['designationOptions'],
) {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'LinkedIn',
    'Type',
    'Allowed',
    'Status',
    'Submitted',
    'Ticket (cents)',
  ]
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.name,
        row.email,
        row.phone,
        row.linkedIn,
        designationLabel(row.designation, options),
        allowedLabel(row.status),
        row.status,
        new Date(row.createdAt).toISOString(),
        row.ticketPriceCents,
      ]
        .map(csvEscape)
        .join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `summit-registrations-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function statusLabel(status: RegistrationStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function RegistrationSidePanel({
  mode,
  title,
  record,
  designationOptions,
  saving,
  saveLabel,
  onChange,
  onClose,
  onSave,
  onApprove,
  onReject,
}: {
  mode: 'create' | 'edit'
  title: string
  record: ConferenceRegistrationRecord
  designationOptions: ConferenceRegistrationFormSettings['designationOptions']
  saving: boolean
  saveLabel: string
  onChange: (next: ConferenceRegistrationRecord) => void
  onClose: () => void
  onSave: () => void
  onApprove?: () => void
  onReject?: () => void
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      className="admin-crm-detail-panel"
      aria-label={title}
    >
      <header className="admin-crm-detail-panel__header">
        <div className="min-w-0">
          <h2 className="admin-crm-detail-panel__title">{title}</h2>
          {mode === 'edit' ? (
            <p className="admin-crm-detail-panel__meta">
              Submitted {new Date(record.createdAt).toLocaleString()}
              {record.updatedAt !== record.createdAt
                ? ` · Updated ${new Date(record.updatedAt).toLocaleString()}`
                : null}
            </p>
          ) : null}
        </div>
        <button type="button" className="admin-crm-detail-panel__close" onClick={onClose} aria-label="Close">
          <X className="w-4 h-4" aria-hidden />
        </button>
      </header>
      <div className="admin-crm-detail-panel__body">
        <div className="admin-crm-detail-panel__section">
          <h3 className="admin-crm-detail-panel__section-title">Contact</h3>
          <AdminEditorFields>
            <AdminEditorField label="Full name">
              <AdminEditorInput
                value={record.name}
                onChange={(e) => onChange({ ...record, name: e.target.value })}
                autoComplete="name"
              />
            </AdminEditorField>
            <AdminEditorField label="Email">
              <AdminEditorInput
                type="email"
                value={record.email}
                onChange={(e) => onChange({ ...record, email: e.target.value })}
                autoComplete="email"
              />
            </AdminEditorField>
            <AdminEditorField label="Phone">
              <AdminEditorInput
                type="tel"
                value={record.phone}
                onChange={(e) => onChange({ ...record, phone: e.target.value })}
                autoComplete="tel"
              />
            </AdminEditorField>
            <AdminEditorField label="LinkedIn">
              <AdminEditorInput
                type="url"
                value={record.linkedIn}
                onChange={(e) => onChange({ ...record, linkedIn: e.target.value })}
                placeholder="linkedin.com/in/username"
              />
            </AdminEditorField>
          </AdminEditorFields>
        </div>

        <div className="admin-crm-detail-panel__section">
          <h3 className="admin-crm-detail-panel__section-title">Registration</h3>
          <AdminEditorFields>
            <AdminEditorField label="Designation">
              <AdminSelect
                aria-label="Designation"
                value={record.designation}
                onChange={(designation) =>
                  onChange({ ...record, designation: designation as RegistrationDesignation })
                }
                options={designationOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
              />
            </AdminEditorField>
            <AdminEditorField label="Status">
              <AdminSelect
                aria-label="Status"
                value={record.status}
                onChange={(status) => onChange({ ...record, status: status as RegistrationStatus })}
                options={STATUS_OPTIONS.map((s) => ({
                  value: s,
                  label: statusLabel(s),
                }))}
              />
            </AdminEditorField>
            <AdminEditorField
              label="Ticket price (cents)"
              hint={formatPriceFromCents(record.ticketPriceCents)}
            >
              <AdminEditorInput
                type="number"
                min={0}
                value={String(record.ticketPriceCents)}
                onChange={(e) =>
                  onChange({ ...record, ticketPriceCents: Number(e.target.value) || 0 })
                }
              />
            </AdminEditorField>
          </AdminEditorFields>
        </div>
      </div>
      <footer
        className={cn(
          'admin-crm-detail-panel__footer',
          mode === 'edit' && 'admin-crm-detail-panel__footer--split',
        )}
      >
        {mode === 'edit' ? (
          <div className="admin-crm-detail-panel__quick-actions">
            <AdminButton
              type="button"
              variant="secondary"
              className="admin-btn--compact"
              disabled={saving || record.status === 'confirmed'}
              onClick={onApprove}
            >
              <Check className="w-4 h-4" aria-hidden />
              Approve
            </AdminButton>
            <AdminButton
              type="button"
              variant="secondary"
              className="admin-btn--compact"
              disabled={saving || record.status === 'cancelled'}
              onClick={onReject}
            >
              <X className="w-4 h-4" aria-hidden />
              Reject
            </AdminButton>
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2">
          <AdminButton type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </AdminButton>
          <AdminButton type="button" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : saveLabel}
          </AdminButton>
        </div>
      </footer>
    </motion.aside>
  )
}

export function RegistrationManager() {
  const { sourceData, updateSettings, setPreview, isPreviewVisible } = useWebsiteData()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabId>('submissions')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const skipDirtyRef = useRef(true)
  const [formCopy, setFormCopy] = useState<ConferenceRegistrationFormSettings>(() => ({
    ...defaultConferenceRegistrationForm,
    ...sourceData.settings.conferenceRegistration,
    panelQuote: {
      ...defaultConferenceRegistrationForm.panelQuote,
      ...sourceData.settings.conferenceRegistration?.panelQuote,
    },
    trustFooter: {
      ...defaultConferenceRegistrationForm.trustFooter,
      ...sourceData.settings.conferenceRegistration?.trustFooter,
      logos:
        sourceData.settings.conferenceRegistration?.trustFooter?.logos?.length
          ? sourceData.settings.conferenceRegistration.trustFooter.logos
          : defaultConferenceRegistrationForm.trustFooter.logos,
    },
  }))
  const [routeSeo, setRouteSeo] = useState<RouteSeoOverride>(
    () => sourceData.settings.routeSeo?.['/register'] ?? {},
  )
  const [registrations, setRegistrations] = useState<ConferenceRegistrationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [editing, setEditing] = useState<ConferenceRegistrationRecord | null>(null)
  const [creating, setCreating] = useState(false)
  const [createDraft, setCreateDraft] = useState<ConferenceRegistrationRecord | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ConferenceRegistrationRecord | null>(null)
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getToken = () => localStorage.getItem('adminToken') ?? ''

  const loadRegistrations = useCallback(async () => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    setListError('')
    try {
      const { items } = await api.listRegistrations(token)
      setRegistrations(items)
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : 'Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRegistrations()
  }, [loadRegistrations])

  useEffect(() => {
    skipDirtyRef.current = true
    setIsDirty(false)
    setFormCopy({
      ...defaultConferenceRegistrationForm,
      ...sourceData.settings.conferenceRegistration,
      panelQuote: {
        ...defaultConferenceRegistrationForm.panelQuote,
        ...sourceData.settings.conferenceRegistration?.panelQuote,
      },
      trustFooter: {
        ...defaultConferenceRegistrationForm.trustFooter,
        ...sourceData.settings.conferenceRegistration?.trustFooter,
        logos:
          sourceData.settings.conferenceRegistration?.trustFooter?.logos?.length
            ? sourceData.settings.conferenceRegistration.trustFooter.logos
            : defaultConferenceRegistrationForm.trustFooter.logos,
      },
    })
    setRouteSeo(sourceData.settings.routeSeo?.['/register'] ?? {})
  }, [sourceData.settings.conferenceRegistration, sourceData.settings.routeSeo])

  useEffect(() => {
    skipDirtyRef.current = true
    setIsDirty(false)
  }, [activeTab])

  useEffect(() => {
    if (!EDITOR_TABS.includes(activeTab)) return
    if (skipDirtyRef.current) {
      skipDirtyRef.current = false
      return
    }
    setIsDirty(true)
  }, [formCopy, routeSeo, activeTab])

  useEffect(() => {
    if (!EDITOR_TABS.includes(activeTab)) {
      setPreview(null)
      return
    }
    if (!isPreviewVisible) {
      setPreview(null)
      return
    }
    setPreview({
      settings: {
        ...sourceData.settings,
        conferenceRegistration: formCopy,
        routeSeo: { ...sourceData.settings.routeSeo, '/register': routeSeo },
      },
    })
    return () => setPreview(null)
  }, [activeTab, formCopy, routeSeo, isPreviewVisible, sourceData.settings, setPreview])

  useApplyPendingAdminSection('/admin/registrations', (id) => {
    if (id === 'form' || id === 'operations' || id === 'seo' || id === 'submissions') {
      setActiveTab(id)
    }
  })

  const handleSaveFormCopy = async () => {
    setIsSaving(true)
    setSaveError('')
    try {
      await updateSettings({
        ...sourceData.settings,
        conferenceRegistration: formCopy,
        routeSeo: { ...sourceData.settings.routeSeo, '/register': routeSeo },
      })
      skipDirtyRef.current = true
      setIsDirty(false)
      toast({ variant: 'success', title: 'Registration settings saved' })
    } catch {
      setSaveError('Failed to save form settings.')
      toast({ variant: 'error', title: 'Save failed', description: 'Failed to save form settings.' })
    } finally {
      setIsSaving(false)
    }
  }

  const openCreateForm = () => {
    setEditing(null)
    setCreating(true)
    setCreateDraft({
      id: '',
      name: '',
      email: '',
      phone: '',
      linkedIn: '',
      designation: 'individual',
      ticketPriceCents: formCopy.ticketPriceCents,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  const handleCreateRecord = async () => {
    if (!createDraft) return
    const token = getToken()
    if (!token) return
    setIsSaving(true)
    setSaveError('')
    const createdName = createDraft.name
    try {
      await api.createRegistration(token, {
        name: createDraft.name,
        email: createDraft.email,
        phone: createDraft.phone,
        linkedIn: createDraft.linkedIn,
        designation: createDraft.designation,
        ticketPriceCents: createDraft.ticketPriceCents,
        status: createDraft.status,
      })
      setCreating(false)
      setCreateDraft(null)
      await loadRegistrations()
      toast({ variant: 'success', title: 'Registration created', description: createdName })
    } catch {
      setSaveError('Failed to create registration.')
      toast({ variant: 'error', title: 'Could not create registration' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveRecord = async () => {
    if (!editing) return
    const token = getToken()
    if (!token) return
    setIsSaving(true)
    setSaveError('')
    try {
      await api.updateRegistration(token, editing.id, {
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
        linkedIn: editing.linkedIn,
        designation: editing.designation,
        ticketPriceCents: editing.ticketPriceCents,
        status: editing.status,
      })
      setEditing(null)
      await loadRegistrations()
      toast({ variant: 'success', title: 'Registration updated', description: editing.name })
    } catch {
      setSaveError('Failed to update registration.')
      toast({ variant: 'error', title: 'Could not save changes' })
    } finally {
      setIsSaving(false)
    }
  }

  const requestDelete = (row: ConferenceRegistrationRecord) => {
    setListError('')
    setDeleteTarget(row)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const token = getToken()
    if (!token) {
      setListError('Session expired. Please sign in again.')
      setDeleteTarget(null)
      return
    }
    setIsDeleting(true)
    setListError('')
    try {
      await api.deleteRegistration(token, deleteTarget.id)
      if (editing?.id === deleteTarget.id) setEditing(null)
      setDeleteTarget(null)
      await loadRegistrations()
      toast({
        variant: 'success',
        title: 'Registration deleted',
        description: deleteTarget.name,
      })
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : 'Failed to delete registration.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSetStatus = async (id: string, status: RegistrationStatus) => {
    const token = getToken()
    if (!token) return
    setStatusUpdatingId(id)
    setListError('')
    try {
      await api.updateRegistration(token, id, { status })
      if (editing?.id === id) setEditing((prev) => (prev ? { ...prev, status } : null))
      await loadRegistrations()
      toast({
        variant: 'success',
        title: status === 'confirmed' ? 'Registration approved' : status === 'cancelled' ? 'Registration rejected' : 'Status updated',
      })
    } catch {
      setListError('Failed to update registration status.')
      toast({ variant: 'error', title: 'Could not update status' })
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleApprove = (id: string) => void handleSetStatus(id, 'confirmed')

  const handleReject = (id: string, currentStatus: RegistrationStatus) => {
    if (currentStatus === 'confirmed') {
      void handleSetStatus(id, 'cancelled')
      return
    }
    setRejectTargetId(id)
  }

  const allowedCount = registrations.filter((r) => r.status === 'confirmed').length
  const pendingCount = registrations.filter((r) => r.status === 'pending').length
  const rejectedCount = registrations.filter((r) => r.status === 'cancelled').length

  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return registrations.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!q) return true
      return (
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.linkedIn.toLowerCase().includes(q)
      )
    })
  }, [registrations, searchQuery, statusFilter])

  const activeRowId = editing?.id ?? createDraft?.id ?? null

  const openEditRecord = (row: ConferenceRegistrationRecord) => {
    setCreating(false)
    setCreateDraft(null)
    setEditing({ ...row })
  }

  const registrationColumns: DataTableColumn<ConferenceRegistrationRecord>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (row) => <span className="admin-data-table__name">{row.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <span className="admin-data-table__muted">{row.email}</span>
      ),
    },
    {
      key: 'designation',
      header: 'Type',
      render: (row) => designationLabel(row.designation, formCopy.designationOptions),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={cn('admin-allowed-badge', allowedBadgeClass(row.status))}>
          {row.status === 'confirmed' ? 'Approved' : row.status === 'cancelled' ? 'Rejected' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      sortable: true,
      render: (row) => (
        <span className="admin-data-table__muted">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => {
        const isUpdating = statusUpdatingId === row.id
        return (
          <div className="admin-data-table__row-actions">
            <AdminButton
              type="button"
              variant="ghost"
              className="admin-btn--icon admin-btn--approve"
              disabled={isUpdating || row.status === 'confirmed'}
              onClick={() => void handleApprove(row.id)}
              aria-label={`Approve ${row.name}`}
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              className="admin-btn--icon admin-btn--reject"
              disabled={isUpdating || row.status === 'cancelled'}
              onClick={() => handleReject(row.id, row.status)}
              aria-label={`Reject ${row.name}`}
              title="Reject"
            >
              <X className="h-4 w-4" />
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              className="admin-btn--icon"
              disabled={isUpdating}
              onClick={() => openEditRecord(row)}
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="h-4 w-4" />
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              className="admin-btn--icon"
              disabled={isUpdating}
              onClick={() => requestDelete(row)}
              aria-label={`Delete ${row.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </AdminButton>
          </div>
        )
      },
    },
  ]

  const patchForm = <K extends keyof ConferenceRegistrationFormSettings>(
    key: K,
    value: ConferenceRegistrationFormSettings[K],
  ) => {
    setFormCopy((prev) => ({ ...prev, [key]: value }))
  }

  const saveStatus = EDITOR_TABS.includes(activeTab)
    ? editorSaveStatusFrom(isSaving, isDirty)
    : 'idle'

  const saveLabel =
    activeTab === 'operations'
      ? 'Save operations'
      : activeTab === 'seo'
        ? 'Save SEO'
        : 'Save form copy'

  return (
    <AdminWorkspaceShell
      editorClassName="admin-book-page"
      isPreviewVisible={isPreviewVisible && EDITOR_TABS.includes(activeTab)}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed((c) => !c)}
      previewVariant="register"
      contentEditor={EDITOR_TABS.includes(activeTab)}
      panelFlush={activeTab === 'submissions'}
      toolbar={
        <AdminPageIntro compact className="mb-0" lede="Summit sign-ups and /register form copy." />
      }
      subnav={{
        groups: SUBNAV_GROUPS,
        title: 'Registrations',
        activeId: activeTab,
        onSelect: (id) => setActiveTab(id as TabId),
        pageId: 'registrations',
      }}
      editorHeader={REGISTRATION_TAB_INTROS[activeTab]}
      editorHeaderAside={
        activeTab === 'submissions' ? (
          <div className="admin-page-metrics-inline">
            <span>{registrations.length} total</span>
            <span aria-hidden>·</span>
            <span>{allowedCount} approved</span>
            <span aria-hidden>·</span>
            <span>{pendingCount} pending</span>
            {rejectedCount > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span>{rejectedCount} rejected</span>
              </>
            ) : null}
          </div>
        ) : activeTab === 'operations' || activeTab === 'form' ? (
          <span
            className={cn(
              'admin-allowed-badge',
              formCopy.registrationOpen !== false
                ? 'admin-allowed-badge--yes'
                : 'admin-allowed-badge--no',
            )}
          >
            {formCopy.registrationOpen !== false ? 'Registration open' : 'Registration closed'}
          </span>
        ) : null
      }
      saveStatus={saveStatus}
      headerAction={
        EDITOR_TABS.includes(activeTab) ? (
          <>
            <Link to="/register" target="_blank" rel="noopener noreferrer" className="inline-flex">
              <AdminButton variant="secondary" className="shrink-0">
                Open register page
                <ExternalLink className="w-4 h-4" />
              </AdminButton>
            </Link>
            <AdminHeaderSave
              label={saveLabel}
              saving={isSaving}
              onClick={() => void handleSaveFormCopy()}
            />
          </>
        ) : (
          <>
            <button
              type="button"
              className="admin-btn admin-btn--secondary admin-btn--compact"
              disabled={loading || registrations.length === 0}
              onClick={() => exportRegistrationsCsv(filteredRegistrations, formCopy.designationOptions)}
            >
              <Download className="h-4 w-4" aria-hidden />
              Export CSV
            </button>
            <button type="button" className="admin-btn admin-btn--secondary" onClick={() => void loadRegistrations()}>
              Refresh
            </button>
            <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateForm}>
              <Plus className="h-4 w-4" aria-hidden />
              Add registration
            </button>
          </>
        )
      }
    >
      {activeTab === 'submissions' ? (
        <div
          className={cn(
            'admin-catalog-panel admin-catalog-panel--crm admin-crm-layout',
            (editing || (creating && createDraft)) && 'admin-crm-layout--detail',
          )}
        >
          <div className="admin-crm-layout__main">
            {saveError || listError ? (
              <div className="admin-panel-banner">
                <p className="admin-error" role="alert">
                  {saveError || listError}
                </p>
              </div>
            ) : null}

            {!loading && registrations.length > 0 ? (
              <div className="admin-crm-toolbar">
                <div className="admin-crm-toolbar__filters" role="tablist" aria-label="Filter by status">
                  {STATUS_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      role="tab"
                      aria-selected={statusFilter === filter.id}
                      className={cn(
                        'admin-crm-filter',
                        statusFilter === filter.id && 'admin-crm-filter--active',
                      )}
                      onClick={() => setStatusFilter(filter.id)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="admin-crm-toolbar__actions">
                  <span className="admin-crm-toolbar__count">
                    {filteredRegistrations.length} of {registrations.length}
                  </span>
                  <label className="admin-crm-toolbar__search">
                    <span className="sr-only">Search submissions</span>
                    <AdminEditorInput
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, email, phone…"
                      aria-label="Search submissions"
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="admin-registrations-table">
                <SkeletonTable rows={8} cols={5} />
              </div>
            ) : registrations.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                heading="No registrations yet"
                subtext="Summit sign-ups from /register will appear here."
              />
            ) : filteredRegistrations.length === 0 ? (
              <EmptyState
                icon={Search}
                heading="No matches"
                subtext="Try a different filter or clear your search."
              />
            ) : (
              <div className="admin-registrations-table">
                <DataTable
                  embedded
                  columns={registrationColumns}
                  data={filteredRegistrations}
                  activeRowId={activeRowId}
                  onRowClick={openEditRecord}
                />
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {editing ? (
              <RegistrationSidePanel
                key={`edit-${editing.id}`}
                mode="edit"
                title={editing.name}
                record={editing}
                designationOptions={formCopy.designationOptions}
                saving={isSaving}
                saveLabel="Save changes"
                onChange={setEditing}
                onClose={() => setEditing(null)}
                onSave={() => void handleSaveRecord()}
                onApprove={() => void handleApprove(editing.id)}
                onReject={() => handleReject(editing.id, editing.status)}
              />
            ) : creating && createDraft ? (
              <RegistrationSidePanel
                key="create"
                mode="create"
                title="Add registration"
                record={createDraft}
                designationOptions={formCopy.designationOptions}
                saving={isSaving}
                saveLabel="Create"
                onChange={setCreateDraft}
                onClose={() => {
                  setCreating(false)
                  setCreateDraft(null)
                }}
                onSave={() => void handleCreateRecord()}
              />
            ) : null}
          </AnimatePresence>

          <ConfirmDialog
            open={deleteTarget != null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Delete registration?"
            description={deleteTarget ? `Remove ${deleteTarget.name}? This cannot be undone.` : ''}
            confirmLabel="Delete"
            variant="danger"
            loading={isDeleting}
            onConfirm={() => void confirmDelete()}
          />
          <ConfirmDialog
            open={rejectTargetId != null}
            onOpenChange={(open) => !open && setRejectTargetId(null)}
            title="Reject registration?"
            description="They will be marked as not allowed to attend."
            confirmLabel="Reject"
            variant="danger"
            loading={statusUpdatingId === rejectTargetId}
            onConfirm={() => {
              if (!rejectTargetId) return
              void handleSetStatus(rejectTargetId, 'cancelled').finally(() => setRejectTargetId(null))
            }}
          />
        </div>
      ) : (
        <>
          {saveError ? (
            <p className="admin-error" role="alert">
              {saveError}
            </p>
          ) : null}
          {activeTab === 'form' ? (
            <RegistrationFormCopyEditor
              formCopy={formCopy}
              patchForm={patchForm}
              setFormCopy={setFormCopy}
            />
          ) : activeTab === 'operations' ? (
            <RegistrationOperationsEditor formCopy={formCopy} patchForm={patchForm} />
          ) : (
            <RegistrationSeoEditor routeSeo={routeSeo} setRouteSeo={setRouteSeo} />
          )}
        </>
      )}
    </AdminWorkspaceShell>
  )
}
