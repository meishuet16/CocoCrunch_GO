import type { FlightBookingState } from '../persistence';

export type FlightDrawerProps = {
  mode: 'solo' | 'group';
  booking?: FlightBookingState;
  draft: string;
  onDraftChange: (value: string) => void;
  onConfirm: (booking: FlightBookingState) => void;
  onClose: () => void;
};

const fallback: Omit<FlightBookingState, 'sharedWithGroup' | 'source'> = {
  flightNumber: 'MH 772', departureTime: '12 Oct · 09:15', arrivalTime: '12 Oct · 16:40', checkInTime: '12 Oct · 07:15', provider: 'Forwarded email example',
};

function parsePrototypeEmail(text: string): Omit<FlightBookingState, 'sharedWithGroup' | 'source'> {
  const flightNumber = text.match(/\b([A-Z]{2}\s?\d{2,4})\b/)?.[1]?.replace(/\s+/, ' ') ?? fallback.flightNumber;
  const times = text.match(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g) ?? [];
  const date = text.match(/\b\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i)?.[0] ?? '12 Oct';
  return {
    flightNumber,
    departureTime: `${date} · ${times[0] ?? '09:15'}`,
    arrivalTime: `${date} · ${times[1] ?? '16:40'}`,
    checkInTime: `${date} · ${times[2] ?? '07:15'}`,
    provider: 'Prototype email parser',
  };
}

const quotes = [
  { provider: 'Coco Air demo', price: 'RM 688', duration: '7h 25m', voucherCode: 'COCO10', flightNumber: 'MH 772' },
  { provider: 'CloudWays prototype', price: 'RM 742', duration: '6h 55m', flightNumber: 'SQ 218' },
  { provider: 'Trip Lantern demo', price: 'RM 805', duration: '6h 30m', flightNumber: 'JL 724' },
];

export function FlightDrawer({ mode, booking, draft, onDraftChange, onConfirm, onClose }: FlightDrawerProps) {
  const confirmEmail = () => onConfirm({ ...parsePrototypeEmail(draft), sharedWithGroup: false, source: 'email-prototype' });
  if (booking) return <section className="flight-drawer"><span className="drawer-kicker">FLIGHT · BOOKED</span><h3>{booking.flightNumber}</h3><small className="adapter-note">Prototype parsed booking · no airline reservation is connected.</small><div className="flight-detail-grid"><span>Departure<b>{booking.departureTime}</b></span><span>Arrival<b>{booking.arrivalTime}</b></span><span>Check-in<b>{booking.checkInTime}</b></span><span>Source<b>{booking.provider ?? 'Prototype'}</b></span></div>{mode === 'group' && <label className="flight-share"><input type="checkbox" checked={booking.sharedWithGroup} onChange={event => onConfirm({ ...booking, sharedWithGroup: event.target.checked })} /> <span>Booked for everyone</span></label>}<button className="primary" onClick={onClose}>Done</button></section>;
  return <section className="flight-drawer"><span className="drawer-kicker">ADD FLIGHT · PROTOTYPE</span><h3>How would you like to add it?</h3><details open><summary>Already booked</summary><label className="setup-field"><span>Paste or forward confirmation email text</span><textarea value={draft} onChange={event => onDraftChange(event.target.value)} placeholder="MH 772 · 12 Oct · 09:15 · 16:40 · check-in 07:15" /></label><small className="adapter-note">Prototype parsing: it reads simple flight-number and time patterns; unavailable fields use a labelled fallback example.</small><button className="secondary" onClick={confirmEmail}>Parse confirmation</button></details><details><summary>Not booked yet</summary><small className="adapter-note">Mock partner quotes only — prices and voucher codes are not live.</small>{quotes.map(quote => <article className="flight-quote" key={quote.provider}><div><b>{quote.provider}</b><small>{quote.duration}{quote.voucherCode ? ` · Voucher ${quote.voucherCode}` : ''}</small></div><strong>{quote.price}</strong><button className="secondary" onClick={() => onConfirm({ flightNumber: quote.flightNumber, departureTime: '12 Oct · 09:15', arrivalTime: '12 Oct · 16:40', checkInTime: '12 Oct · 07:15', provider: quote.provider, voucherCode: quote.voucherCode, sharedWithGroup: false, source: 'quote-prototype' })}>Choose mock quote</button></article>)}</details><button className="onboarding-skip" onClick={onClose}>Skip for now</button></section>;
}

export { parsePrototypeEmail };
