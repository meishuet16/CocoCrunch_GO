import { ChevronRight } from 'lucide-react';

export type TripPhase = 'planning' | 'traveling' | 'completed';
export type TripLifecycleStatus = 'planning' | 'active' | 'ongoing' | 'completed';

type HeaderProps = {
  destination: string;
  mode: 'solo' | 'group';
  travellerCount: number;
  planHealth: number;
  onBack: () => void;
};

export function TripWorkspaceHeader({ destination, mode, travellerCount, planHealth, onBack }: HeaderProps) {
  return <section className="trip-workspace-head">
    <button className="back-link" onClick={onBack}>‹ Trips</button>
    <div className="workspace-title">
      <span>{destination.toUpperCase()} · {mode === 'group' ? 'GROUP' : 'SOLO'} TRIP</span>
      <h2>Slow food, small discoveries.</h2>
      <p>Oct 12–21 · {travellerCount} travellers · <b>{planHealth}/100 plan health</b></p>
    </div>
    <button className="workspace-more" aria-label="Trip options">•••</button>
  </section>;
}

type LifecycleProps = {
  status: TripLifecycleStatus;
};

const phaseLabels: { id: TripLifecycleStatus; label: string; note: string }[] = [
  { id: 'planning', label: 'Planning', note: 'Make it yours' },
  { id: 'active', label: 'Active', note: 'Ready for departure' },
  { id: 'ongoing', label: 'Ongoing', note: 'Stay in the moment' },
  { id: 'completed', label: 'Completed', note: 'Keep what mattered' },
];

export function TripLifecycleTabs({ status }: LifecycleProps) {
  return <div className="lifecycle-tabs" role="list" aria-label="Trip lifecycle status">
    {phaseLabels.map(item => <div key={item.id} role="listitem" aria-current={status === item.id ? 'step' : undefined} className={status === item.id ? 'active' : ''}>
      <b>{item.label}</b><small>{item.note}</small>
    </div>)}
  </div>;
}

type ContextProps = { phase: TripPhase; onExit: () => void };

export function TripWorkspaceContext({ phase, onExit }: ContextProps) {
  const copy = phase === 'planning' ? 'Before · decisions stay visible' : phase === 'traveling' ? 'During · protect the anchors' : 'After · turn experience into memory';
  return <div className="workspace-context"><span className="context-dot"/><span>{copy}</span><button onClick={onExit}>All trips <ChevronRight size={12}/></button></div>;
}
