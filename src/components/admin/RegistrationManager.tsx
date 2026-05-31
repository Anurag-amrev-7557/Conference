import { useCallback, useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { Check, ClipboardList, Download, FileText, Pencil, Plus, Trash2, X } from 'lucide-react'
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
import { AdminConfirmDialog } from './AdminConfirmDialog'
import { RouteSeoFields } from './admin-workspace-fields'
import {
  AdminButton,
  AdminField,
  AdminFieldGrid,
  AdminFormSection,
  AdminHeaderSave,
  AdminInput,
  AdminPageIntro,
  AdminSubnav,
  AdminTextarea,
} from './admin-ui'
import { useAdminWorkspaceNavRegistry, useApplyPendingAdminSection } from './admin-workspace-nav'

type TabId = 'submissions' | 'form'

const STATUS_OPTIONS: RegistrationStatus[] = ['pending', 'confirmed', 'cancelled']

const SUBNAV_GROUPS = [
  {
    label: 'CRM',
    items: [
      { id: 'submissions', label: 'Submissions', icon: ClipboardList },
      { id: 'form', label: 'Form copy', icon: FileText },
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

export function RegistrationManager() {
  const { sourceData, updateSettings } = useWebsiteData()
  const [activeTab, setActiveTab] = useState<TabId>('submissions')
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
  const [isDeleting, setIsDeleting] = useState(false)

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

  useApplyPendingAdminSection('/admin/registrations', (id) =>
    setActiveTab(id === 'form' ? 'form' : 'submissions'),
  )

  useAdminWorkspaceNavRegistry({
    groups: SUBNAV_GROUPS,
    activeId: activeTab,
    onSelect: (id) => setActiveTab(id as TabId),
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
    } catch {
      setSaveError('Failed to save form settings.')
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
    } catch {
      setSaveError('Failed to create registration.')
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
    } catch {
      setSaveError('Failed to update registration.')
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
    } catch {
      setListError('Failed to update registration status.')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleApprove = (id: string) => void handleSetStatus(id, 'confirmed')

  const handleReject = (id: string, currentStatus: RegistrationStatus) => {
    if (
      currentStatus !== 'confirmed' &&
      !window.confirm('Reject this registration? They will be marked as not allowed.')
    ) {
      return
    }
    void handleSetStatus(id, 'cancelled')
  }

  const allowedCount = registrations.filter((r) => r.status === 'confirmed').length
  const pendingCount = registrations.filter((r) => r.status === 'pending').length

  const patchForm = <K extends keyof ConferenceRegistrationFormSettings>(
    key: K,
    value: ConferenceRegistrationFormSettings[K],
  ) => {
    setFormCopy((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="admin-toolbar shrink-0">
        <div className="admin-toolbar__content w-full">
          <AdminPageIntro
            className="mb-0"
            eyebrow="Summit"
            title="Registration CRM"
            lede="Submissions from /register and editable form copy."
          />
        </div>
        <div className="admin-toolbar__actions">
          {activeTab === 'form' ? (
            <AdminHeaderSave label="Save form" saving={isSaving} onClick={handleSaveFormCopy} />
          ) : (
            <>
              <AdminButton
                type="button"
                variant="secondary"
                disabled={loading || registrations.length === 0}
                onClick={() => exportRegistrationsCsv(registrations, formCopy.designationOptions)}
              >
                <Download className="h-4 w-4" aria-hidden />
                Export CSV
              </AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => void loadRegistrations()}>
                Refresh
              </AdminButton>
              <AdminButton type="button" onClick={openCreateForm}>
                <Plus className="h-4 w-4" aria-hidden />
                Add registration
              </AdminButton>
            </>
          )}
        </div>
      </div>

      <div className="admin-page-editor flex flex-1 min-h-0">
        <AdminSubnav
          className="admin-subnav--desktop-only"
          groups={SUBNAV_GROUPS}
          title="Registrations"
          activeId={activeTab}
          onSelect={(id) => setActiveTab(id as TabId)}
        />

        <div
          className={cn(
            'admin-panel-body flex-1 min-h-0',
            activeTab === 'submissions' ? 'admin-panel-body--flush' : 'overflow-y-auto',
          )}
        >
          {activeTab === 'submissions' ? (
            <>
              {saveError || listError ? (
                <div className="admin-panel-banner">
                  {saveError ? (
                    <p className="admin-error" role="alert">
                      {saveError}
                    </p>
                  ) : null}
                  {listError ? (
                    <p className="admin-error" role="alert">
                      {listError}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {loading ? (
                <p className="admin-panel-empty">Loading…</p>
              ) : registrations.length === 0 ? (
                <p className="admin-panel-empty">No registrations yet.</p>
              ) : (
                <div className="admin-data-table">
                  <div className="admin-data-table__toolbar">
                    <p className="admin-data-table__toolbar-meta">
                      <strong>{registrations.length}</strong> submissions ·{' '}
                      <strong>{allowedCount}</strong> allowed ·{' '}
                      <strong>{pendingCount}</strong> pending review
                    </p>
                  </div>
                  <div className="admin-data-table__scroll">
                    <table className="admin-data-table__table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>LinkedIn</th>
                          <th>Type</th>
                          <th>Allowed</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th className="admin-data-table__actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((row) => {
                          const isUpdating = statusUpdatingId === row.id
                          return (
                            <tr key={row.id}>
                              <td className="admin-data-table__name">{row.name}</td>
                              <td>{row.email}</td>
                              <td className="admin-data-table__muted">{row.phone || '—'}</td>
                              <td>
                                {row.linkedIn ? (
                                  <a
                                    href={
                                      row.linkedIn.startsWith('http')
                                        ? row.linkedIn
                                        : `https://${row.linkedIn}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-data-table__link"
                                    title={row.linkedIn}
                                  >
                                    {row.linkedIn.replace(/^https?:\/\//, '')}
                                  </a>
                                ) : (
                                  <span className="admin-data-table__muted">—</span>
                                )}
                              </td>
                              <td>
                                {designationLabel(row.designation, formCopy.designationOptions)}
                              </td>
                              <td>
                                <span
                                  className={cn(
                                    'admin-allowed-badge',
                                    allowedBadgeClass(row.status),
                                  )}
                                >
                                  {allowedLabel(row.status)}
                                </span>
                              </td>
                              <td className="capitalize">{row.status}</td>
                              <td className="admin-data-table__muted">
                                {new Date(row.createdAt).toLocaleString()}
                              </td>
                              <td className="admin-data-table__actions">
                                <div className="admin-data-table__row-actions">
                                  <AdminButton
                                    type="button"
                                    variant="ghost"
                                    className="admin-btn--icon admin-btn--approve"
                                    disabled={isUpdating || row.status === 'confirmed'}
                                    onClick={() => void handleApprove(row.id)}
                                    aria-label={`Approve ${row.name}`}
                                    title="Approve (allow entry)"
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
                                    title={
                                      row.status === 'confirmed'
                                        ? 'Revoke approval'
                                        : 'Reject (not allowed)'
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </AdminButton>
                                  <AdminButton
                                    type="button"
                                    variant="ghost"
                                    className="admin-btn--icon"
                                    disabled={isUpdating}
                                    onClick={() => setEditing({ ...row })}
                                    aria-label={`Edit ${row.name}`}
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </AdminButton>
                                  <AdminButton
                                    type="button"
                                    variant="ghost"
                                    className="admin-btn--icon"
                                    disabled={isUpdating}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      requestDelete(row)
                                    }}
                                    aria-label={`Delete ${row.name}`}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </AdminButton>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {creating && createDraft ? (
                <div className="admin-panel-drawer admin-panel-body__inner admin-form-stack">
                  <AdminFormSection title="Add registration">
                    <AdminFieldGrid>
                      <AdminField label="Name">
                        <AdminInput
                          value={createDraft.name}
                          onChange={(e) => setCreateDraft({ ...createDraft, name: e.target.value })}
                        />
                      </AdminField>
                      <AdminField label="Email">
                        <AdminInput
                          type="email"
                          value={createDraft.email}
                          onChange={(e) => setCreateDraft({ ...createDraft, email: e.target.value })}
                        />
                      </AdminField>
                      <AdminField label="Phone">
                        <AdminInput
                          value={createDraft.phone}
                          onChange={(e) => setCreateDraft({ ...createDraft, phone: e.target.value })}
                        />
                      </AdminField>
                      <AdminField label="LinkedIn">
                        <AdminInput
                          value={createDraft.linkedIn}
                          onChange={(e) =>
                            setCreateDraft({ ...createDraft, linkedIn: e.target.value })
                          }
                        />
                      </AdminField>
                      <AdminField label="Designation">
                        <select
                          className="admin-input w-full"
                          value={createDraft.designation}
                          onChange={(e) =>
                            setCreateDraft({
                              ...createDraft,
                              designation: e.target.value as RegistrationDesignation,
                            })
                          }
                        >
                          {formCopy.designationOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </AdminField>
                      <AdminField label="Status">
                        <select
                          className="admin-input w-full"
                          value={createDraft.status}
                          onChange={(e) =>
                            setCreateDraft({
                              ...createDraft,
                              status: e.target.value as RegistrationStatus,
                            })
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </AdminField>
                      <AdminField label="Ticket price (cents)">
                        <AdminInput
                          type="number"
                          min={0}
                          value={createDraft.ticketPriceCents}
                          onChange={(e) =>
                            setCreateDraft({
                              ...createDraft,
                              ticketPriceCents: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </AdminField>
                    </AdminFieldGrid>
                    <div className="flex gap-2 mt-4">
                      <AdminButton
                        type="button"
                        onClick={() => void handleCreateRecord()}
                        disabled={isSaving}
                      >
                        Create
                      </AdminButton>
                      <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setCreating(false)
                          setCreateDraft(null)
                        }}
                      >
                        Cancel
                      </AdminButton>
                    </div>
                  </AdminFormSection>
                </div>
              ) : null}

              {editing ? (
                <div className="admin-panel-drawer admin-panel-body__inner admin-form-stack">
                  <AdminFormSection title={`Edit — ${editing.name}`}>
                    <AdminFieldGrid>
                      <AdminField label="Full name">
                        <AdminInput
                          value={editing.name}
                          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        />
                      </AdminField>
                      <AdminField label="Email">
                        <AdminInput
                          type="email"
                          value={editing.email}
                          onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                        />
                      </AdminField>
                      <AdminField label="Phone">
                        <AdminInput
                          type="tel"
                          value={editing.phone}
                          onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                        />
                      </AdminField>
                      <AdminField label="LinkedIn">
                        <AdminInput
                          type="url"
                          value={editing.linkedIn}
                          onChange={(e) => setEditing({ ...editing, linkedIn: e.target.value })}
                          placeholder="linkedin.com/in/username"
                        />
                      </AdminField>
                      <AdminField label="Designation">
                        <select
                          className="admin-input w-full"
                          value={editing.designation}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              designation: e.target.value as RegistrationDesignation,
                            })
                          }
                        >
                          {formCopy.designationOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </AdminField>
                      <AdminField label="Status">
                        <select
                          className="admin-input w-full"
                          value={editing.status}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              status: e.target.value as RegistrationStatus,
                            })
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </AdminField>
                      <AdminField label="Ticket price (cents)">
                        <AdminInput
                          type="number"
                          min={0}
                          value={String(editing.ticketPriceCents)}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              ticketPriceCents: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </AdminField>
                    </AdminFieldGrid>
                    <div className="flex gap-2 mt-4">
                      <AdminButton type="button" onClick={() => void handleSaveRecord()} disabled={isSaving}>
                        Save changes
                      </AdminButton>
                      <AdminButton type="button" variant="secondary" onClick={() => setEditing(null)}>
                        Cancel
                      </AdminButton>
                    </div>
                  </AdminFormSection>
                </div>
              ) : null}
            </>
          ) : (
            <div className="admin-panel-body__inner admin-form-stack">
              {saveError ? (
                <p className="admin-error" role="alert">
                  {saveError}
                </p>
              ) : null}

              <AdminFormSection title="Page & panel">
                  <AdminFieldGrid>
                    <AdminField label="Panel eyebrow">
                      <AdminInput
                        value={formCopy.panelEyebrow}
                        onChange={(e) => patchForm('panelEyebrow', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Panel headline">
                      <AdminInput
                        value={formCopy.panelHeadline}
                        onChange={(e) => patchForm('panelHeadline', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Panel headline accent">
                      <AdminInput
                        value={formCopy.panelHeadlineAccent ?? ''}
                        onChange={(e) => patchForm('panelHeadlineAccent', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Panel lede" className="sm:col-span-2">
                      <AdminTextarea
                        value={formCopy.panelLede}
                        onChange={(e) => patchForm('panelLede', e.target.value)}
                        rows={2}
                      />
                    </AdminField>
                  </AdminFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Panel stats">
                  {formCopy.panelStats.map((stat, i) => (
                    <AdminFieldGrid key={`${stat.label}-${i}`} className="mb-4">
                      <AdminField label="Value">
                        <AdminInput
                          value={stat.value}
                          onChange={(e) => {
                            const next = [...formCopy.panelStats];
                            next[i] = { ...next[i], value: e.target.value };
                            patchForm('panelStats', next);
                          }}
                        />
                      </AdminField>
                      <AdminField label="Label">
                        <AdminInput
                          value={stat.label}
                          onChange={(e) => {
                            const next = [...formCopy.panelStats];
                            next[i] = { ...next[i], label: e.target.value };
                            patchForm('panelStats', next);
                          }}
                        />
                      </AdminField>
                    </AdminFieldGrid>
                  ))}
                </AdminFormSection>

                <AdminFormSection title="Panel quote">
                  <AdminFieldGrid>
                    <AdminField label="Quote" className="sm:col-span-2">
                      <AdminTextarea
                        value={formCopy.panelQuote.quote}
                        onChange={(e) =>
                          patchForm('panelQuote', { ...formCopy.panelQuote, quote: e.target.value })
                        }
                        rows={3}
                      />
                    </AdminField>
                    <AdminField label="Name">
                      <AdminInput
                        value={formCopy.panelQuote.name}
                        onChange={(e) =>
                          patchForm('panelQuote', { ...formCopy.panelQuote, name: e.target.value })
                        }
                      />
                    </AdminField>
                    <AdminField label="Role">
                      <AdminInput
                        value={formCopy.panelQuote.role}
                        onChange={(e) =>
                          patchForm('panelQuote', { ...formCopy.panelQuote, role: e.target.value })
                        }
                      />
                    </AdminField>
                    <AdminField label="Initials">
                      <AdminInput
                        value={formCopy.panelQuote.initials}
                        onChange={(e) =>
                          patchForm('panelQuote', {
                            ...formCopy.panelQuote,
                            initials: e.target.value,
                          })
                        }
                      />
                    </AdminField>
                  </AdminFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Trust footer">
                  <AdminFieldGrid>
                    <AdminField label="Eyebrow">
                      <AdminInput
                        value={formCopy.trustFooter.eyebrow}
                        onChange={(e) =>
                          patchForm('trustFooter', {
                            ...formCopy.trustFooter,
                            eyebrow: e.target.value,
                          })
                        }
                      />
                    </AdminField>
                    <AdminField label="Title" className="sm:col-span-2">
                      <AdminInput
                        value={formCopy.trustFooter.title}
                        onChange={(e) =>
                          patchForm('trustFooter', { ...formCopy.trustFooter, title: e.target.value })
                        }
                      />
                    </AdminField>
                    <AdminField label="Logo names (comma-separated)" className="sm:col-span-2">
                      <AdminInput
                        value={formCopy.trustFooter.logos.join(', ')}
                        onChange={(e) =>
                          patchForm('trustFooter', {
                            ...formCopy.trustFooter,
                            logos: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </AdminField>
                  </AdminFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Page SEO (/register)">
                  <RouteSeoFields path="/register" value={routeSeo} onChange={setRouteSeo} />
                </AdminFormSection>

                <AdminFormSection title="Form card">
                  <AdminFieldGrid>
                    <AdminField label="Page title">
                      <AdminInput
                        value={formCopy.pageTitle}
                        onChange={(e) => patchForm('pageTitle', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Page title accent">
                      <AdminInput
                        value={formCopy.pageTitleAccent ?? ''}
                        onChange={(e) => patchForm('pageTitleAccent', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Page lede" className="sm:col-span-2">
                      <AdminTextarea
                        value={formCopy.pageLede}
                        onChange={(e) => patchForm('pageLede', e.target.value)}
                        rows={2}
                      />
                    </AdminField>
                    <AdminField label="Form kicker">
                      <AdminInput
                        value={formCopy.formKicker}
                        onChange={(e) => patchForm('formKicker', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Section title (below page lede)">
                      <AdminInput
                        value={formCopy.formTitle}
                        onChange={(e) => patchForm('formTitle', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Form subtitle" className="sm:col-span-2">
                      <AdminTextarea
                        value={formCopy.formSubtitle}
                        onChange={(e) => patchForm('formSubtitle', e.target.value)}
                        rows={2}
                      />
                    </AdminField>
                    <AdminField label="Price label">
                      <AdminInput
                        value={formCopy.priceLabel}
                        onChange={(e) => patchForm('priceLabel', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Ticket price (cents)">
                      <AdminInput
                        type="number"
                        min={0}
                        value={formCopy.ticketPriceCents}
                        onChange={(e) => {
                          const cents = Number(e.target.value) || 0
                          setFormCopy((prev) => ({
                            ...prev,
                            ticketPriceCents: cents,
                            priceAmount: formatPriceFromCents(cents),
                          }))
                        }}
                      />
                    </AdminField>
                    <AdminField label="Price display">
                      <AdminInput
                        value={formCopy.priceAmount}
                        onChange={(e) => patchForm('priceAmount', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Price note" className="sm:col-span-2">
                      <AdminInput
                        value={formCopy.priceNote ?? ''}
                        onChange={(e) => patchForm('priceNote', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Submit button">
                      <AdminInput
                        value={formCopy.submitLabel}
                        onChange={(e) => patchForm('submitLabel', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Success title">
                      <AdminInput
                        value={formCopy.successTitle}
                        onChange={(e) => patchForm('successTitle', e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Success message" className="sm:col-span-2">
                      <AdminTextarea
                        value={formCopy.successMessage}
                        onChange={(e) => patchForm('successMessage', e.target.value)}
                        rows={3}
                      />
                    </AdminField>
                  </AdminFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Field labels">
                  <AdminFieldGrid>
                    <AdminField label="Name label">
                      <AdminInput
                        value={formCopy.fields.name.label}
                        onChange={(e) =>
                          setFormCopy((prev) => ({
                            ...prev,
                            fields: {
                              ...prev.fields,
                              name: { ...prev.fields.name, label: e.target.value },
                            },
                          }))
                        }
                      />
                    </AdminField>
                    <AdminField label="Name placeholder">
                      <AdminInput
                        value={formCopy.fields.name.placeholder ?? ''}
                        onChange={(e) =>
                          setFormCopy((prev) => ({
                            ...prev,
                            fields: {
                              ...prev.fields,
                              name: { ...prev.fields.name, placeholder: e.target.value },
                            },
                          }))
                        }
                      />
                    </AdminField>
                    <AdminField label="Email label">
                      <AdminInput
                        value={formCopy.fields.email.label}
                        onChange={(e) =>
                          setFormCopy((prev) => ({
                            ...prev,
                            fields: {
                              ...prev.fields,
                              email: { ...prev.fields.email, label: e.target.value },
                            },
                          }))
                        }
                      />
                    </AdminField>
                    <AdminField label="Email placeholder">
                      <AdminInput
                        value={formCopy.fields.email.placeholder ?? ''}
                        onChange={(e) =>
                          setFormCopy((prev) => ({
                            ...prev,
                            fields: {
                              ...prev.fields,
                              email: { ...prev.fields.email, placeholder: e.target.value },
                            },
                          }))
                        }
                      />
                    </AdminField>
                    <AdminField label="Phone label">
                      <AdminInput
                        value={formCopy.fields.phone.label}
                        onChange={(e) =>
                          setFormCopy((prev) => ({
                            ...prev,
                            fields: {
                              ...prev.fields,
                              phone: { ...prev.fields.phone, label: e.target.value },
                            },
                          }))
                        }
                      />
                    </AdminField>
                    <AdminField label="Phone placeholder">
                      <AdminInput
                        value={formCopy.fields.phone.placeholder ?? ''}
                        onChange={(e) =>
                          setFormCopy((prev) => ({
                            ...prev,
                            fields: {
                              ...prev.fields,
                              phone: { ...prev.fields.phone, placeholder: e.target.value },
                            },
                          }))
                        }
                      />
                    </AdminField>
                    <AdminField label="LinkedIn label">
                      <AdminInput
                        value={formCopy.fields.linkedIn.label}
                        onChange={(e) =>
                          setFormCopy((prev) => ({
                            ...prev,
                            fields: {
                              ...prev.fields,
                              linkedIn: { ...prev.fields.linkedIn, label: e.target.value },
                            },
                          }))
                        }
                      />
                    </AdminField>
                    <AdminField label="LinkedIn placeholder">
                      <AdminInput
                        value={formCopy.fields.linkedIn.placeholder ?? ''}
                        onChange={(e) =>
                          setFormCopy((prev) => ({
                            ...prev,
                            fields: {
                              ...prev.fields,
                              linkedIn: { ...prev.fields.linkedIn, placeholder: e.target.value },
                            },
                          }))
                        }
                      />
                    </AdminField>
                    <AdminField label="Designation field label" className="sm:col-span-2">
                      <AdminInput
                        value={formCopy.fields.designation.label}
                        onChange={(e) =>
                          setFormCopy((prev) => ({
                            ...prev,
                            fields: {
                              ...prev.fields,
                              designation: { ...prev.fields.designation, label: e.target.value },
                            },
                          }))
                        }
                      />
                    </AdminField>
                  </AdminFieldGrid>
                </AdminFormSection>

                <AdminFormSection title="Designation options">
                  {formCopy.designationOptions.map((opt, i) => (
                    <AdminFieldGrid key={opt.value} className="mb-4 pb-4 border-b border-border last:border-0">
                      <AdminField label={`${opt.label} — display label`}>
                        <AdminInput
                          value={opt.label}
                          onChange={(e) => {
                            const next = [...formCopy.designationOptions]
                            next[i] = { ...next[i], label: e.target.value }
                            patchForm('designationOptions', next)
                          }}
                        />
                      </AdminField>
                      <AdminField label="Description">
                        <AdminInput
                          value={opt.description ?? ''}
                          onChange={(e) => {
                            const next = [...formCopy.designationOptions]
                            next[i] = { ...next[i], description: e.target.value }
                            patchForm('designationOptions', next)
                          }}
                        />
                      </AdminField>
                    </AdminFieldGrid>
                  ))}
                </AdminFormSection>
            </div>
          )}
        </div>
      </div>

      <AdminConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null)
        }}
        title="Delete registration?"
        description={
          deleteTarget ? (
            <>
              This permanently removes <strong>{deleteTarget.name}</strong> (
              {deleteTarget.email}) from the summit list. This cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        loading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
