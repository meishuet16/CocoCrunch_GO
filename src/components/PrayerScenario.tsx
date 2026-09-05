import { useState } from 'react';
import { emitExperience } from '../experience';
import { qualifiesForPrayer } from '../ritualState';

/** Explicit isolated fixture: ordinary failed Floating items still have open recovery. */
export function PrayerScenario() {
  const [exhausted, setExhausted] = useState(false);
  const qualifies = qualifiesForPrayer({ important: true, uncontrollable: true, actionsExhausted: exhausted, usefulRepair: false });
  return <details className="adapter-note"><summary>Isolated uncertainty demo</summary>
    <p>This fixture does not change your trip. A once-only outdoor sky event depends on cloud cover. There is no forecast provider; cloud cover is unknown. Changing time or venue cannot recover this event.</p>
    <label><input type="checkbox" checked={exhausted} onChange={event => setExhausted(event.target.checked)}/> Demo: shelter and safety checks are complete; no useful alternate event or schedule repair remains.</label>
    {qualifies && <button className="secondary" onClick={() => emitExperience({ type: 'open-prayer', source: 'simulated', uncertainty: 'Isolated demo: cloud cover for a once-only sky event remains unknown. No weather provider is connected.' })}>Begin Pray · optional luck ritual</button>}
  </details>;
}
