import { ChevronRight } from 'lucide-react';
import type { JourneyState } from '../domain/journey-state';

type TripJourneyStatusProps = {
  state: JourneyState;
  destination: string;
  onAction: (target: NonNullable<JourneyState['nextAction']>['target']) => void;
};

export function TripJourneyStatus({ state, destination, onAction }: TripJourneyStatusProps) {
  const action = state.nextAction;

  return (
    <section className="journey-status paper-sheet">
      <div className="journey-status-copy">
        <span className="eyebrow">
          {destination.toUpperCase()} · {state.phase.toUpperCase()}
        </span>
        <h3>{state.status}</h3>
        {action && <p>{action.reason}</p>}
        {state.evidence.length > 0 && (
          <small className="journey-status-evidence">
            {state.evidence.map(item => `${item.source}: ${item.value}`).join(' · ')}
          </small>
        )}
      </div>
      {action && (
        <button className="primary" onClick={() => onAction(action.target)}>
          {action.label}
          <ChevronRight size={15} />
        </button>
      )}
    </section>
  );
}
