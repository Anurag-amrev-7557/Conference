type RegisterSuccessPanelProps = {
  active: boolean
  title: string
  message: string
  email: string
}

export function RegisterSuccessPanel({ active, title, message, email }: RegisterSuccessPanelProps) {
  const body = message.replace('{email}', email || 'your email')
  const emailIndex = body.indexOf(email)
  const hasEmailHighlight = email && emailIndex >= 0

  return (
    <div
      className={`book-demo-register-success${active ? ' book-demo-register-success--active' : ''}`}
      role="status"
      aria-live="polite"
      aria-hidden={!active}
    >
      <div className="book-demo-register-success__inner">
        <div className="book-demo-register-success__icon-wrap" aria-hidden>
          <div className="book-demo-register-success__glow" aria-hidden />
          <span className="book-demo-register-success__ring" />
          <span className="book-demo-register-success__icon">
            <svg viewBox="0 0 24 24" fill="none" className="book-demo-register-success__check">
              <circle
                cx="12"
                cy="12"
                r="10"
                className="book-demo-register-success__circle"
                strokeWidth="1.75"
              />
              <path
                d="M7.5 12.2 10.4 15.1 16.5 9"
                className="book-demo-register-success__tick"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <div className="book-demo-register-success__copy">
          <h2 className="book-demo-register-success__title">{title}</h2>
          <p className="book-demo-register-success__text">
            {hasEmailHighlight ? (
              <>
                {body.slice(0, emailIndex)}
                <strong>{email}</strong>
                {body.slice(emailIndex + email.length)}
              </>
            ) : (
              body
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
