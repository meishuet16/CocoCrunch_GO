import { comparisonOptions } from '../domain/adapters';
import type { AccommodationBookingState } from '../persistence';

export type AccommodationDrawerProps = {
  mode: 'solo' | 'group';
  booking?: AccommodationBookingState;
  draft: string;
  onDraftChange: (value: string) => void;
  onConfirm: (booking: AccommodationBookingState) => void;
  onClose: () => void;
};

function parsePrototypeAccommodation(text: string): Omit<AccommodationBookingState, 'sharedWithGroup' | 'source'> {
  const checkIn = text.match(/check[- ]?in[^\d]*(\d{1,2}\s[A-Za-z]{3,9}[^\n]*)/i)?.[1] ?? '12 Oct · 15:00';
  const checkOut = text.match(/check[- ]?out[^\d]*(\d{1,2}\s[A-Za-z]{3,9}[^\n]*)/i)?.[1] ?? '17 Oct · 11:00';
  const cancellationDeadline = text.match(/cancel(?:lation)?(?: by| until)?[^\d]*(\d{1,2}\s[A-Za-z]{3,9}[^\n]*)/i)?.[1] ?? '09 Oct · 23:59';
  const propertyName = text.match(/(?:hotel|stay|property)[:\s]+([^\n]+)/i)?.[1]?.trim() ?? 'Kanda pocket hotel';
  return { propertyName, checkInTime: checkIn, checkOutTime: checkOut, cancellationDeadline, notes: 'Bring passport for check-in', provider: 'Email import' };
}

export function AccommodationDrawer({ mode, booking, draft, onDraftChange, onConfirm, onClose }: AccommodationDrawerProps) {
  if (booking) return <section className="flight-drawer"><span className="drawer-kicker">ACCOMMODATION · BOOKED</span><h3>{booking.propertyName}</h3><small className="adapter-note">Saved stay details</small><div className="flight-detail-grid"><span>Check-in<b>{booking.checkInTime}</b></span><span>Check-out<b>{booking.checkOutTime}</b></span><span>Cancellation<b>{booking.cancellationDeadline}</b></span><span>Notes<b>{booking.notes}</b></span></div>{mode === 'group' && <label className="flight-share"><input type="checkbox" checked={booking.sharedWithGroup} onChange={event => onConfirm({ ...booking, sharedWithGroup: event.target.checked })} /> <span>Booked for everyone</span></label>}<button className="primary" onClick={onClose}>Done</button></section>;
  const stays = comparisonOptions.filter(option => option.category === 'stay');
  return <section className="flight-drawer"><span className="drawer-kicker">ADD ACCOMMODATION</span><h3>Where are you staying?</h3><details open><summary>Already booked</summary><label className="setup-field"><span>Paste or forward confirmation email text</span><textarea value={draft} onChange={event => onDraftChange(event.target.value)} placeholder="Hotel: Kanda pocket hotel&#10;Check-in 12 Oct 15:00&#10;Check-out 17 Oct 11:00&#10;Cancel by 09 Oct" /></label><small className="adapter-note">We’ll extract stay details. Missing fields use an example value.</small><button className="secondary" onClick={() => onConfirm({ ...parsePrototypeAccommodation(draft), sharedWithGroup: false, source: 'email-prototype' })}>Read confirmation</button></details><details><summary>Not booked yet</summary><small className="adapter-note">Example stays and prices</small>{stays.map(stay => <article className="flight-quote" key={stay.id}><div><b>{stay.label}</b><small>{stay.deal} · {stay.fit}% fit</small></div><strong>RM {stay.price}</strong><button className="secondary" onClick={() => onConfirm({ propertyName: stay.label, checkInTime: '12 Oct · 15:00', checkOutTime: '17 Oct · 11:00', cancellationDeadline: '09 Oct · 23:59', notes: stay.why, provider: 'Stay catalog', sharedWithGroup: false, source: 'quote-prototype' })}>Choose stay</button></article>)}</details><button className="onboarding-skip" onClick={onClose}>Skip for now</button></section>;
}

export { parsePrototypeAccommodation };
