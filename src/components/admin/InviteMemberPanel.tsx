import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AtSign, Eye, EyeOff, KeyRound, UserPlus, UserRound, X } from 'lucide-react';
import { AdminSelect } from './AdminSelect';

type RoleOption = {
  value: string;
  label: string;
  description?: string;
};

type InviteForm = {
  username: string;
  password: string;
  email: string;
  role: string;
};

type InviteMemberPanelProps = {
  busy?: boolean;
  error?: string;
  form: InviteForm;
  roleOptions: RoleOption[];
  onChange: (form: InviteForm) => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  onClose: () => void;
};

export function InviteMemberPanel({
  busy = false,
  error,
  form,
  roleOptions,
  onChange,
  onSubmit,
  onClose,
}: InviteMemberPanelProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.section
      className="admin-invite-panel"
      aria-labelledby="invite-panel-title"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="admin-invite-panel__header">
        <div className="admin-invite-panel__icon" aria-hidden>
          <UserPlus className="w-5 h-5" />
        </div>
        <div className="admin-invite-panel__header-text">
          <h2 id="invite-panel-title" className="admin-invite-panel__title">
            Invite team member
          </h2>
          <p className="admin-invite-panel__subtitle">
            Add credentials for a new editor, viewer, or admin.
          </p>
        </div>
        <button
          type="button"
          className="admin-invite-panel__close"
          aria-label="Close"
          disabled={busy}
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      <form className="admin-invite-panel__form" onSubmit={(e) => void onSubmit(e)}>
        {error ? (
          <p className="admin-invite-panel__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="admin-invite-panel__grid">
          <div className="admin-invite-panel__field">
            <label className="admin-invite-panel__label" htmlFor="invite-username">
              Username
            </label>
            <div className="admin-invite-panel__input-wrap">
              <UserRound className="admin-invite-panel__input-icon" aria-hidden />
              <input
                id="invite-username"
                className="admin-input admin-invite-panel__input"
                required
                autoComplete="username"
                placeholder="e.g. jane.editor"
                value={form.username}
                onChange={(e) => onChange({ ...form, username: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-invite-panel__field">
            <label className="admin-invite-panel__label" htmlFor="invite-email">
              Email <span className="admin-invite-panel__optional">(optional)</span>
            </label>
            <div className="admin-invite-panel__input-wrap">
              <AtSign className="admin-invite-panel__input-icon" aria-hidden />
              <input
                id="invite-email"
                type="email"
                className="admin-input admin-invite-panel__input"
                autoComplete="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) => onChange({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-invite-panel__field">
            <label className="admin-invite-panel__label" htmlFor="invite-password">
              Password
            </label>
            <div className="admin-invite-panel__input-wrap">
              <KeyRound className="admin-invite-panel__input-icon" aria-hidden />
              <input
                id="invite-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-input admin-invite-panel__input admin-invite-panel__input--suffix"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="admin-invite-panel__toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="admin-invite-panel__field">
            <label className="admin-invite-panel__label" htmlFor="invite-role">
              Role
            </label>
            <AdminSelect
              value={form.role}
              onChange={(role) => onChange({ ...form, role })}
              options={roleOptions}
              menuVariant="rich"
              menuHeading="Choose a role"
              menuSubheading="Sets what this member can see and edit."
              aria-label="Role for new user"
            />
          </div>
        </div>

        <footer className="admin-invite-panel__footer">
          <button type="button" className="admin-btn admin-btn--secondary" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
            {busy ? 'Sending…' : 'Send invite'}
          </button>
        </footer>
      </form>
    </motion.section>
  );
}

export function InviteMemberPanelContainer(props: InviteMemberPanelProps & { open: boolean }) {
  const { open, ...panelProps } = props;
  return (
    <AnimatePresence>
      {open ? <InviteMemberPanel {...panelProps} /> : null}
    </AnimatePresence>
  );
}
