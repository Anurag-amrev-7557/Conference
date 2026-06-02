import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Toggle } from './ui'

export function AdminVisibilityToggles({
  entries,
}: {
  entries: Array<{
    key: string
    label: string
    description: string
    checked: boolean
    onChange: (checked: boolean) => void
  }>
}) {
  return (
    <div className="admin-editor-visibility-list">
      {entries.map(({ key, label, description, checked, onChange }) => (
        <div key={key} className="admin-editor-visibility-row">
          <div
            className={cn(
              'admin-editor-visibility-row__icon',
              checked && 'admin-editor-visibility-row__icon--on',
            )}
            aria-hidden
          >
            {checked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </div>
          <Toggle label={label} description={description} checked={checked} onChange={onChange} />
        </div>
      ))}
    </div>
  )
}
