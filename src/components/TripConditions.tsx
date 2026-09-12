import { CloudRain } from 'lucide-react';
import { CocoCompanion } from './coco/CocoCompanion';

export type TripConditionsProps = {
  delay: boolean;
  failedItemName?: string;
  repairAvailable: boolean;
  repairStrategy?: 'backup-replacement' | 'open-recovery' | 'none';
  automaticDeviationDetected?: boolean;
  onSimulateDisruption: (scenario: DisruptionScenario) => void;
};

export type DisruptionScenario = 'rain' | 'late-transit' | 'low-energy';

const scenarioCopy: Record<DisruptionScenario, { label: string; detail: string }> = {
  rain: { label: 'rain change', detail: 'Rain is affecting' },
  'late-transit': { label: 'late transit', detail: 'A late transit connection affects' },
  'low-energy': { label: 'low-energy check-in', detail: 'A low-energy check-in affects' },
};

export function TripConditions({ delay, failedItemName, repairAvailable, repairStrategy, automaticDeviationDetected = false, onSimulateDisruption }: TripConditionsProps) {
  const resolvedRepairStrategy = repairStrategy ?? (repairAvailable ? 'backup-replacement' : 'none');
  const repairCopy = resolvedRepairStrategy === 'open-recovery'
    ? 'No direct Backup candidate is available. Recovery / schedule adjustment remains available below.'
    : repairAvailable
      ? 'A safer adjustment is ready to review. Review the safest adjustment below.'
      : 'No safe repair is available. Choose another manual adjustment.';

  return <section className={`trip-conditions ${delay ? 'is-affected' : ''}`}>
    <CocoCompanion context={delay ? 'weather' : 'conditions'} size={80}/>
    <div className="trip-conditions-head">
      <div><span>TRIP CONDITIONS</span><h3>{delay ? 'Something changed today.' : 'Today’s conditions are clear.'}</h3></div>
      <small>{automaticDeviationDetected ? 'Automatic prototype check: planned time passed without a manual check-in. Coco has asked you to review it.' : delay ? 'Demo condition · not live weather' : 'No live weather or traffic provider is connected.'}</small>
    </div>
    {delay ? <div className="trip-condition-alert">
      <b>Reported change is affecting {failedItemName ?? 'a flexible plan'}.</b>
      <small>{repairCopy} Coco protects the Must-Go first. {automaticDeviationDetected ? 'This was triggered from the saved timeline, not a device location.' : ''}</small>
    </div> : <p>No reported changes to Today’s plan. Manual check-in remains available.</p>}
    {!delay && <div className="inline-actions" aria-label="Simulate a trip condition"><button className="event-button" onClick={() => onSimulateDisruption('rain')}><CloudRain size={20}/> Simulate rain</button>{(['late-transit', 'low-energy'] as DisruptionScenario[]).map(scenario => <button key={scenario} onClick={() => onSimulateDisruption(scenario)}>Simulate {scenarioCopy[scenario].label}</button>)}</div>}
  </section>;
}
