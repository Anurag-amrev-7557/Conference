import { Globe, Megaphone, FileText, Settings2 } from 'lucide-react'
import { formatPriceFromCents } from '../../lib/registrationDefaults'
import type {
  ConferenceRegistrationFormSettings,
  RegistrationFieldCopy,
} from '../../lib/registrationTypes'
import type { RouteSeoOverride } from '../../lib/websiteData'
import { AdminFieldGrid } from './admin-ui'
import { RouteSeoFields } from './admin-workspace-fields'
import {
  AdminEditorField,
  AdminEditorFields,
  AdminEditorInput,
  AdminEditorSection,
  AdminEditorSubsection,
  AdminEditorTextarea,
} from './admin-editor-ui'
import { Toggle } from './ui'

type PatchForm = <K extends keyof ConferenceRegistrationFormSettings>(
  key: K,
  value: ConferenceRegistrationFormSettings[K],
) => void

type SetFormCopy = React.Dispatch<React.SetStateAction<ConferenceRegistrationFormSettings>>

type FormFieldKey = keyof ConferenceRegistrationFormSettings['fields']

const FORM_FIELD_ROWS: { key: FormFieldKey; name: string }[] = [
  { key: 'name', name: 'Full name' },
  { key: 'email', name: 'Email' },
  { key: 'phone', name: 'Phone' },
  { key: 'linkedIn', name: 'LinkedIn' },
]

function patchFormField(
  setFormCopy: SetFormCopy,
  key: FormFieldKey,
  patch: Partial<RegistrationFieldCopy>,
) {
  setFormCopy((prev) => ({
    ...prev,
    fields: {
      ...prev.fields,
      [key]: { ...prev.fields[key], ...patch },
    },
  }))
}

function formatOptionKey(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function FormFieldsList({
  formCopy,
  setFormCopy,
}: {
  formCopy: ConferenceRegistrationFormSettings
  setFormCopy: SetFormCopy
}) {
  return (
    <div className="admin-reg-form__copy-table-wrap">
      <table className="admin-reg-form__copy-table">
        <colgroup>
          <col className="admin-reg-form__copy-table-col-field" />
          <col className="admin-reg-form__copy-table-col-value" />
          <col className="admin-reg-form__copy-table-col-value" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">Label</th>
            <th scope="col">Placeholder</th>
          </tr>
        </thead>
        <tbody>
          {FORM_FIELD_ROWS.map(({ key, name }) => {
            const field = formCopy.fields[key]
            return (
              <tr key={key}>
                <th scope="row">{name}</th>
                <td>
                  <AdminEditorInput
                    value={field.label}
                    onChange={(e) => patchFormField(setFormCopy, key, { label: e.target.value })}
                    aria-label={`${name} label`}
                  />
                </td>
                <td>
                  <AdminEditorInput
                    value={field.placeholder ?? ''}
                    onChange={(e) =>
                      patchFormField(setFormCopy, key, { placeholder: e.target.value })
                    }
                    aria-label={`${name} placeholder`}
                  />
                </td>
              </tr>
            )
          })}
          <tr>
            <th scope="row">Registration type</th>
            <td colSpan={2}>
              <AdminEditorInput
                value={formCopy.fields.designation.label}
                onChange={(e) =>
                  patchFormField(setFormCopy, 'designation', { label: e.target.value })
                }
                aria-label="Registration type field label"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function TicketTypesList({
  formCopy,
  patchForm,
}: {
  formCopy: ConferenceRegistrationFormSettings
  patchForm: PatchForm
}) {
  return (
    <div className="admin-reg-form__copy-table-wrap">
      <table className="admin-reg-form__copy-table">
        <colgroup>
          <col className="admin-reg-form__copy-table-col-field" />
          <col className="admin-reg-form__copy-table-col-value" />
          <col className="admin-reg-form__copy-table-col-value" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Label</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {formCopy.designationOptions.map((opt, i) => (
            <tr key={opt.value}>
              <th scope="row">{formatOptionKey(opt.value)}</th>
              <td>
                <AdminEditorInput
                  value={opt.label}
                  onChange={(e) => {
                    const next = [...formCopy.designationOptions]
                    next[i] = { ...next[i], label: e.target.value }
                    patchForm('designationOptions', next)
                  }}
                  aria-label={`${formatOptionKey(opt.value)} label`}
                />
              </td>
              <td>
                <AdminEditorInput
                  value={opt.description ?? ''}
                  onChange={(e) => {
                    const next = [...formCopy.designationOptions]
                    next[i] = { ...next[i], description: e.target.value }
                    patchForm('designationOptions', next)
                  }}
                  aria-label={`${formatOptionKey(opt.value)} description`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RegistrationOperationsEditor({
  formCopy,
  patchForm,
}: {
  formCopy: ConferenceRegistrationFormSettings
  patchForm: PatchForm
}) {
  return (
    <div className="admin-registration-form-editor admin-editor-section-stack">
      <AdminEditorSection
        icon={Settings2}
        title="Operations"
        description="Control whether /register accepts sign-ups and who gets notified."
      >
        <div className="admin-reg-form__split-2">
          <AdminEditorSubsection
            title="Registration gate"
            description="When closed, visitors see your message and the API rejects new submissions."
          >
            <AdminEditorFields>
              <AdminEditorField label="Accept new registrations">
                <Toggle
                  label="Registration open"
                  description="Turn off to block new sign-ups on /register."
                  checked={formCopy.registrationOpen !== false}
                  onChange={(checked) => patchForm('registrationOpen', checked)}
                />
              </AdminEditorField>
              <AdminEditorField label="Closed message" className="admin-editor-field--wide">
                <AdminEditorTextarea
                  rows={3}
                  value={formCopy.registrationClosedMessage ?? ''}
                  onChange={(e) => patchForm('registrationClosedMessage', e.target.value)}
                />
              </AdminEditorField>
            </AdminEditorFields>
          </AdminEditorSubsection>

          <AdminEditorSubsection
            title="Email notifications"
            description="Requires RESEND_API_KEY on the API. Approve/deny links update CRM status automatically."
          >
            <AdminEditorFields>
              <AdminEditorField
                label="Admin notification email"
                hint="Receives new registration alerts with Approve and Deny buttons."
                className="admin-editor-field--wide"
              >
                <AdminEditorInput
                  type="email"
                  value={formCopy.notifyEmail ?? ''}
                  onChange={(e) => patchForm('notifyEmail', e.target.value)}
                  placeholder="admin@yourcompany.com"
                />
              </AdminEditorField>
              <div className="admin-reg-form__split-2">
                <AdminEditorField label="On new submission">
                  <Toggle
                    label="Email admin with review links"
                    checked={formCopy.notifyOnSubmit !== false}
                    onChange={(checked) => patchForm('notifyOnSubmit', checked)}
                  />
                </AdminEditorField>
                <AdminEditorField label="On decision">
                  <Toggle
                    label="Email registrant when approved or denied"
                    checked={formCopy.sendRegistrantEmails !== false}
                    onChange={(checked) => patchForm('sendRegistrantEmails', checked)}
                  />
                </AdminEditorField>
              </div>
            </AdminEditorFields>
          </AdminEditorSubsection>
        </div>
      </AdminEditorSection>
    </div>
  )
}

export function RegistrationFormCopyEditor({
  formCopy,
  patchForm,
  setFormCopy,
}: {
  formCopy: ConferenceRegistrationFormSettings
  patchForm: PatchForm
  setFormCopy: SetFormCopy
}) {
  return (
    <div className="admin-registration-form-editor admin-editor-section-stack">
      <AdminEditorSection
        icon={Megaphone}
        title="Left panel"
        description="Storytelling column on /register — top to bottom as visitors read it."
      >
        <AdminEditorSubsection title="1 · Headline">
          <AdminEditorFields>
            <AdminEditorField label="Eyebrow">
              <AdminEditorInput
                value={formCopy.panelEyebrow}
                onChange={(e) => patchForm('panelEyebrow', e.target.value)}
              />
            </AdminEditorField>
            <AdminFieldGrid columns={2}>
              <AdminEditorField label="Headline">
                <AdminEditorInput
                  value={formCopy.panelHeadline}
                  onChange={(e) => patchForm('panelHeadline', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField label="Headline accent">
                <AdminEditorInput
                  value={formCopy.panelHeadlineAccent ?? ''}
                  onChange={(e) => patchForm('panelHeadlineAccent', e.target.value)}
                />
              </AdminEditorField>
            </AdminFieldGrid>
            <AdminEditorField label="Lede" className="admin-editor-field--wide">
              <AdminEditorTextarea
                value={formCopy.panelLede}
                onChange={(e) => patchForm('panelLede', e.target.value)}
                rows={2}
              />
            </AdminEditorField>
          </AdminEditorFields>
        </AdminEditorSubsection>

        <AdminEditorSubsection title="2 · Metrics" description="Three stat callouts shown below the lede.">
          <div className="admin-reg-form__ordered-stack">
            {formCopy.panelStats.map((stat, i) => (
              <div key={`${stat.label}-${i}`} className="admin-reg-form__ordered-item">
                <p className="admin-reg-form__ordered-item-label">Stat {i + 1}</p>
                <AdminFieldGrid columns={2}>
                  <AdminEditorField label="Value">
                    <AdminEditorInput
                      value={stat.value}
                      onChange={(e) => {
                        const next = [...formCopy.panelStats]
                        next[i] = { ...next[i], value: e.target.value }
                        patchForm('panelStats', next)
                      }}
                    />
                  </AdminEditorField>
                  <AdminEditorField label="Label">
                    <AdminEditorInput
                      value={stat.label}
                      onChange={(e) => {
                        const next = [...formCopy.panelStats]
                        next[i] = { ...next[i], label: e.target.value }
                        patchForm('panelStats', next)
                      }}
                    />
                  </AdminEditorField>
                </AdminFieldGrid>
              </div>
            ))}
          </div>
        </AdminEditorSubsection>

        <AdminEditorSubsection title="3 · Testimonial">
          <AdminEditorFields>
            <AdminEditorField label="Quote" className="admin-editor-field--wide">
              <AdminEditorTextarea
                value={formCopy.panelQuote.quote}
                onChange={(e) =>
                  patchForm('panelQuote', { ...formCopy.panelQuote, quote: e.target.value })
                }
                rows={3}
              />
            </AdminEditorField>
            <AdminFieldGrid columns={3}>
              <AdminEditorField label="Name">
                <AdminEditorInput
                  value={formCopy.panelQuote.name}
                  onChange={(e) =>
                    patchForm('panelQuote', { ...formCopy.panelQuote, name: e.target.value })
                  }
                />
              </AdminEditorField>
              <AdminEditorField label="Role">
                <AdminEditorInput
                  value={formCopy.panelQuote.role}
                  onChange={(e) =>
                    patchForm('panelQuote', { ...formCopy.panelQuote, role: e.target.value })
                  }
                />
              </AdminEditorField>
              <AdminEditorField label="Initials">
                <AdminEditorInput
                  value={formCopy.panelQuote.initials}
                  onChange={(e) =>
                    patchForm('panelQuote', { ...formCopy.panelQuote, initials: e.target.value })
                  }
                />
              </AdminEditorField>
            </AdminFieldGrid>
          </AdminEditorFields>
        </AdminEditorSubsection>

        <AdminEditorSubsection title="4 · Trust strip">
          <AdminEditorFields>
            <AdminEditorField label="Eyebrow">
              <AdminEditorInput
                value={formCopy.trustFooter.eyebrow}
                onChange={(e) =>
                  patchForm('trustFooter', { ...formCopy.trustFooter, eyebrow: e.target.value })
                }
              />
            </AdminEditorField>
            <AdminEditorField label="Title" className="admin-editor-field--wide">
              <AdminEditorInput
                value={formCopy.trustFooter.title}
                onChange={(e) =>
                  patchForm('trustFooter', { ...formCopy.trustFooter, title: e.target.value })
                }
              />
            </AdminEditorField>
            <AdminEditorField
              label="Logo names"
              hint="Comma-separated — shown as text logos in the strip."
              className="admin-editor-field--wide"
            >
              <AdminEditorInput
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
            </AdminEditorField>
          </AdminEditorFields>
        </AdminEditorSubsection>
      </AdminEditorSection>

      <AdminEditorSection
        icon={FileText}
        title="Registration form"
        description="Right-side card on /register — header, fields, ticket types, and submit copy in page order."
      >
        <AdminEditorSubsection title="1 · Card header">
          <AdminEditorFields>
            <AdminEditorField label="Kicker">
              <AdminEditorInput
                value={formCopy.formKicker}
                onChange={(e) => patchForm('formKicker', e.target.value)}
              />
            </AdminEditorField>
            <AdminFieldGrid columns={2}>
              <AdminEditorField label="Page title">
                <AdminEditorInput
                  value={formCopy.pageTitle}
                  onChange={(e) => patchForm('pageTitle', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField label="Title accent">
                <AdminEditorInput
                  value={formCopy.pageTitleAccent ?? ''}
                  onChange={(e) => patchForm('pageTitleAccent', e.target.value)}
                />
              </AdminEditorField>
            </AdminFieldGrid>
            <AdminEditorField label="Page lede" className="admin-editor-field--wide">
              <AdminEditorTextarea
                value={formCopy.pageLede}
                onChange={(e) => patchForm('pageLede', e.target.value)}
                rows={2}
              />
            </AdminEditorField>
            <AdminEditorField
              label="Form subtitle"
              hint="Used when page lede is empty."
              className="admin-editor-field--wide"
            >
              <AdminEditorTextarea
                value={formCopy.formSubtitle}
                onChange={(e) => patchForm('formSubtitle', e.target.value)}
                rows={2}
              />
            </AdminEditorField>
          </AdminEditorFields>
        </AdminEditorSubsection>

        <AdminEditorSubsection title="2 · Ticket preview">
          <AdminEditorFields>
            <AdminFieldGrid columns={2}>
              <AdminEditorField label="Price label">
                <AdminEditorInput
                  value={formCopy.priceLabel}
                  onChange={(e) => patchForm('priceLabel', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField label="Price display">
                <AdminEditorInput
                  value={formCopy.priceAmount}
                  onChange={(e) => patchForm('priceAmount', e.target.value)}
                />
              </AdminEditorField>
              <AdminEditorField
                label="Ticket price (cents)"
                hint={formatPriceFromCents(formCopy.ticketPriceCents)}
              >
                <AdminEditorInput
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
              </AdminEditorField>
              <AdminEditorField label="Price note">
                <AdminEditorInput
                  value={formCopy.priceNote ?? ''}
                  onChange={(e) => patchForm('priceNote', e.target.value)}
                />
              </AdminEditorField>
            </AdminFieldGrid>
          </AdminEditorFields>
        </AdminEditorSubsection>

        <AdminEditorSubsection title="3 · Fields heading">
          <AdminEditorFields>
            <AdminEditorField label="Section title above inputs">
              <AdminEditorInput
                value={formCopy.formTitle}
                onChange={(e) => patchForm('formTitle', e.target.value)}
              />
            </AdminEditorField>
          </AdminEditorFields>
        </AdminEditorSubsection>

        <AdminEditorSubsection
          title="4 · Form fields"
          description="Label and placeholder for each input, top to bottom on the form."
        >
          <FormFieldsList formCopy={formCopy} setFormCopy={setFormCopy} />
        </AdminEditorSubsection>

        <AdminEditorSubsection
          title="5 · Ticket types"
          description="Radio choices under the registration type field."
        >
          <TicketTypesList formCopy={formCopy} patchForm={patchForm} />
        </AdminEditorSubsection>

        <AdminEditorSubsection title="6 · Submit">
          <AdminEditorFields>
            <AdminEditorField label="Submit button label">
              <AdminEditorInput
                value={formCopy.submitLabel}
                onChange={(e) => patchForm('submitLabel', e.target.value)}
              />
            </AdminEditorField>
          </AdminEditorFields>
        </AdminEditorSubsection>

        <AdminEditorSubsection title="7 · After submit">
          <AdminEditorFields>
            <AdminEditorField label="Success title">
              <AdminEditorInput
                value={formCopy.successTitle}
                onChange={(e) => patchForm('successTitle', e.target.value)}
              />
            </AdminEditorField>
            <AdminEditorField label="Success message" className="admin-editor-field--wide">
              <AdminEditorTextarea
                value={formCopy.successMessage}
                onChange={(e) => patchForm('successMessage', e.target.value)}
                rows={3}
              />
            </AdminEditorField>
          </AdminEditorFields>
        </AdminEditorSubsection>
      </AdminEditorSection>
    </div>
  )
}

export function RegistrationSeoEditor({
  routeSeo,
  setRouteSeo,
}: {
  routeSeo: RouteSeoOverride
  setRouteSeo: React.Dispatch<React.SetStateAction<RouteSeoOverride>>
}) {
  return (
    <div className="admin-registration-form-editor admin-editor-section-stack">
      <AdminEditorSection
        icon={Globe}
        title="Page SEO"
        description="Meta tags for /register in search and social previews."
      >
        <RouteSeoFields path="/register" value={routeSeo} onChange={setRouteSeo} />
      </AdminEditorSection>
    </div>
  )
}
