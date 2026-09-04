import { CloudRain } from 'lucide-react';

export type TripConditionsProps = {
  delay: boolean;
  failedItemName?: string;
  repairAvailable: boolean;
  onSimulateDisruption: () => void;
};

export function TripConditions({ delay, failedItemName, repairAvailable, onSimulateDisruption }: TripConditionsProps) {
  return <section className={`trip-conditions ${delay ? 'is-affected' : ''}`}>
    <div className="trip-conditions-head">
      <div><span>TRIP CONDITIONS</span><h3>{delay ? 'Something changed today.' : 'Today looks clear.'}</h3></div>
      <small>{delay ? 'Demo condition · not live weather' : 'No live weather or traffic provider connected'}</small>
    </div>
    {delay ? <div className="trip-condition-alert">
      <b>Rain is affecting {failedItemName ?? 'a flexible outdoor plan'}.</b>
      <small>{repairAvailable ? 'A gentler adjustment is ready to review.' : 'No safe adjustment is currently available.'} Coco protects the Must-Go first.</small>
    </div> : <p>No reported changes to today’s plan. Manual check-in remains available.</p>}
    {!delay && <button className="event-button" onClick={onSimulateDisruption}><CloudRain size={20}/> Simulate a rain change</button>}
  </section>;
}
