export type JourneyProgressPhase = 'planning' | 'traveling' | 'completed';

export type JourneyProgressProps = {
  destination: string;
  currentPhase: JourneyProgressPhase;
  nextActionLabel?: string;
};

const phases = [
  { id: 'before', label: 'Before' },
  { id: 'during', label: 'During' },
  { id: 'after', label: 'After' },
] as const;

const phaseIndexes: Record<JourneyProgressPhase, number> = {
  planning: 0,
  traveling: 1,
  completed: 2,
};

export function JourneyProgress({ destination, currentPhase, nextActionLabel }: JourneyProgressProps) {
  const currentIndex = phaseIndexes[currentPhase];

  return (
    <section className="journey-progress" aria-label={`${destination} journey progress`}>
      <div className="journey-progress-heading">
        <span>JOURNEY</span>
        <b>{destination}</b>
      </div>
      <ol className="journey-progress-rail">
        {phases.map((phase, index) => {
          const state = index === currentIndex ? 'current' : index < currentIndex ? 'completed' : 'future';
          return (
            <li
              className={`journey-progress-step journey-progress-step--${state}`}
              data-phase={phase.id}
              data-phase-state={state}
              aria-current={state === 'current' ? 'step' : undefined}
              key={phase.id}
            >
              <span className="journey-progress-marker" aria-hidden="true">{index + 1}</span>
              <span className="journey-progress-label">{phase.label}</span>
            </li>
          );
        })}
      </ol>
      {nextActionLabel && <p className="journey-progress-next">Next: <b>{nextActionLabel}</b></p>}
    </section>
  );
}
