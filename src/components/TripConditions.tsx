import { CloudRain } from 'lucide-react';

export type TripConditionsProps = {
  delay: boolean;
  failedItemName?: string;
  repairAvailable: boolean;
  repairStrategy?: 'backup-replacement' | 'open-recovery' | 'none';
  onSimulateDisruption: () => void;
};

export function TripConditions({ delay, failedItemName, repairAvailable, repairStrategy, onSimulateDisruption }: TripConditionsProps) {
  const resolvedRepairStrategy = repairStrategy ?? (repairAvailable ? 'backup-replacement' : 'none');
  const repairCopy = resolvedRepairStrategy === 'open-recovery'
    ? 'No direct Backup candidate is available. Recovery / schedule adjustment remains available below.'
    : repairAvailable
      ? 'A safer adjustment is ready to review. Review the safest adjustment below.'
      : 'No safe repair is available. Choose another manual adjustment.';

  return <section className={`trip-conditions ${delay ? 'is-affected' : ''}`}>
    <div className="trip-conditions-head">
      <div><span>TRIP CONDITIONS</span><h3>{delay ? 'Something changed today.' : 'Today’s conditions are clear.'}</h3></div>
      <small>{delay ? 'Demo condition · not live weather' : 'No live weather or traffic provider is connected.'}</small>
    </div>
    {delay ? <div className="trip-condition-alert">
      <b>Rain is affecting {failedItemName ?? 'a flexible outdoor plan'}.</b>
      <small>{repairCopy} Coco protects the Must-Go first.</small>
    </div> : <p>No reported changes to Today’s plan. Manual check-in remains available.</p>}
    {!delay && <button className="event-button" onClick={onSimulateDisruption}><CloudRain size={20}/> Simulate a rain change</button>}
  </section>;
}
