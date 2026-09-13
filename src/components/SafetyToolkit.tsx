import { useState } from 'react';

export type SafetyService = 'hospital' | 'pharmacy' | 'luggage';

const localResults: Record<SafetyService, { name: string; note: string }[]> = {
  hospital: [
    { name: 'Tokyo Metropolitan Health Desk', note: 'Check opening status before you go.' },
    { name: 'Nearest emergency department', note: 'Use local emergency services for urgent care.' },
  ],
  pharmacy: [
    { name: 'Late-hours pharmacy', note: 'Confirm stock and opening hours before travelling.' },
    { name: 'Travel essentials pharmacy', note: 'Nearby essentials option.' },
  ],
  luggage: [
    { name: 'Station luggage counter', note: 'Check current capacity before relying on it.' },
    { name: 'Short-stay luggage storage', note: 'Nearby storage option.' },
  ],
};

export function SafetyToolkit({ destination }: { destination: string }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [service, setService] = useState<SafetyService | null>(null);

  return <>
    <span className="drawer-kicker">SAFETY TOOLS</span>
    <h3>Useful when the day gets uncomfortable.</h3>
    <p className="drawer-copy">Find useful services near your trip.</p>
    <div className="safety-list">
      <div><b>Safety check-in</b><small>{checkedIn ? 'Status-only check-in prepared for your chosen contact.' : 'Prepare a status-only check-in without sharing a location.'}</small><button className="secondary" onClick={() => setCheckedIn(true)}>{checkedIn ? 'Check-in prepared' : 'Prepare check-in'}</button></div>
      <div><b>Nearby useful places</b><small>Choose the kind of help you need in {destination}.</small><span className="inline-actions"><button onClick={() => setService('hospital')}>Hospital</button><button onClick={() => setService('pharmacy')}>Pharmacy</button><button onClick={() => setService('luggage')}>Luggage</button></span></div>
      <div><b>Emergency contacts</b><small>Manage recipients and what each can receive in Me. During check-ins use that saved list.</small></div>
    </div>
    {service && <section className="adapter-note" aria-live="polite"><b>{service[0].toUpperCase() + service.slice(1)} suggestions</b>{localResults[service].map(result => <div key={result.name}><small>{result.name} · {result.note}</small><a href={`https://maps.google.com/?q=${encodeURIComponent(`${result.name}, ${destination}`)}`} target="_blank" rel="noreferrer">Open map navigation ↗</a></div>)}<small>Open directions in your map app.</small></section>}
  </>;
}
