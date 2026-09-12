import type { TripPlan } from '../domain/itinerary';

export type TodayTimelineProps = {
  items: TripPlan['items'];
  delay: boolean;
  arrivalChecked: boolean;
  appliedRepair: boolean;
  completedItemIds?: string[];
  onToggleComplete?: (id: string) => void;
};

type TimelineStatus = 'Current' | 'Next' | 'Later' | 'Completed';

function statusForItem(index: number, arrivalChecked: boolean): TimelineStatus {
  if (arrivalChecked && index === 0) return 'Completed';
  if (!arrivalChecked && index === 0) return 'Current';
  if (arrivalChecked && index === 1) return 'Current';
  if ((!arrivalChecked && index === 1) || (arrivalChecked && index === 2)) return 'Next';
  return 'Later';
}

export function TodayTimeline({ items, delay, arrivalChecked, appliedRepair, completedItemIds = [], onToggleComplete }: TodayTimelineProps) {
  return (
    <section className={`today-timeline${delay ? ' is-delayed' : ''}`} aria-labelledby="today-timeline-heading">
      <div className="today-timeline-heading">
        <div>
          <span>TRAVEL DAY</span>
          <h3 id="today-timeline-heading">TODAY</h3>
        </div>
        <div className="today-timeline-state" aria-live="polite">
          {delay && <span>Delay noted</span>}
          {arrivalChecked && <span>Arrival checked</span>}
          {appliedRepair && <span>Recovery applied</span>}
        </div>
      </div>
      <ol className="today-timeline-list">
        {items.map((item, index) => {
          const isComplete = completedItemIds.includes(item.id);
          const status = isComplete ? 'Completed' : statusForItem(index, arrivalChecked);
          return (
            <li className={`today-timeline-item today-timeline-item--${item.kind} today-timeline-item--${status.toLowerCase()}`} key={item.id}>
              <time dateTime={item.timeLabel}>{item.timeLabel}</time>
              <div className="today-timeline-item-body">
                <div className="today-timeline-item-heading">
                  <b>{item.name}</b>
                  <span className="today-timeline-status">{status}</span>
                </div>
                <span className={`today-timeline-kind today-timeline-kind--${item.kind}`}>{item.kind}</span>
                {onToggleComplete && item.kind !== 'buffer' && <button type="button" className="secondary" onClick={() => onToggleComplete(item.id)}>{isComplete ? 'Undo complete' : 'Mark complete'}</button>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
