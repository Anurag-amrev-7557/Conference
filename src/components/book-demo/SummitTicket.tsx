type SummitTicketProps = {
  eventName: string
  passLabel: string
  amount: string
  note?: string
}

/** Side-notch ticket outline (viewBox 360×100). */
const TICKET_PATH =
  'M8,0 H352 Q360,0 360,8 V34 A16,16 0 0,0 360,66 V92 Q360,100 352,100 H8 Q0,100 0,92 V66 A16,16 0 0,0 0,34 V8 Q0,0 8,0 Z'

export function SummitTicket({ eventName, passLabel, amount, note }: SummitTicketProps) {
  return (
    <div className="summit-ticket" aria-label={`${passLabel}, ${amount}`}>
      <div className="summit-ticket__frame">
        <svg
          className="summit-ticket__shape"
          viewBox="0 0 360 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={TICKET_PATH}
            className="summit-ticket__path"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="summit-ticket__content">
          <div className="summit-ticket__main">
            <p className="summit-ticket__event">{eventName}</p>
            <p className="summit-ticket__type">{passLabel}</p>
          </div>
          <p className="summit-ticket__price">{amount}</p>
        </div>
      </div>
      {note?.trim() ? <p className="summit-ticket__note">{note}</p> : null}
    </div>
  )
}
