import { ChevronRight } from 'lucide-react';

export type TripPhase = 'planning' | 'traveling' | 'completed';

type HeaderProps = {
  destination: string;
  travellerCount: number;
  planHealth: number;
  onBack: () => void;
};

export function TripWorkspaceHeader({ destination, travellerCount, planHealth, onBack }: HeaderProps) {
  return <section className="trip-workspace-head">
    <button className="back-link" onClick={onBack}>‹ Trips</button>
    <div className="workspace-title">
      <span>{destination.toUpperCase()} · GROUP TRIP</span>
      <h2>Slow food, small discoveries.</h2>
      <p>Oct 12–21 · {travellerCount} travellers · <b>{planHealth}/100 plan health</b></p>
    </div>
    <button className="workspace-more" aria-label="Trip options">•••</button>
  </section>;
}

type LifecycleProps = {
  phase: TripPhase;
  onChange: (phase: TripPhase) => void;
};

const phaseLabels: { id: TripPhase; label: string; note: string }[] = [
  { id: 'planning', label: 'Planning', note: 'Make it yours' },
  { id: 'traveling', label: 'Traveling', note: 'Stay in the moment' },
  { id: 'completed', label: 'Completed', note: 'Keep what mattered' },
];

export function TripLifecycleTabs({ phase, onChange }: LifecycleProps) {
  return <div className="lifecycle-tabs" role="tablist" aria-label="Trip lifecycle">
    {phaseLabels.map(item => <button key={item.id} role="tab" aria-selected={phase === item.id} className={phase === item.id ? 'active' : ''} onClick={() => onChange(item.id)}>
      <b>{item.label}</b><small>{item.note}</small>
    </button>)}
  </div>;
}

type ContextProps = { phase: TripPhase; onExit: () => void };

export function TripWorkspaceContext({ phase, onExit }: ContextProps) {
  const copy = phase === 'planning' ? 'Before · decisions stay visible' : phase === 'traveling' ? 'During · protect the anchors' : 'After · turn experience into memory';
  return <div className="workspace-context"><span className="context-dot"/><span>{copy}</span><button onClick={onExit}>All trips <ChevronRight size={12}/></button></div>;
}
