import type { TripMember } from '../domain/trip';
import type { GroupSplitPlan } from '../persistence';

type GroupSplitProps = {
  members: TripMember[];
  value: GroupSplitPlan;
  active: boolean;
  onChange: (next: GroupSplitPlan) => void;
  onRequest: () => void;
  onRequestReunion: () => void;
};

export function GroupSplit({ members, value, active, onChange, onRequest, onRequestReunion }: GroupSplitProps) {
  const joined = members.filter(member => member.inviteStatus === 'joined');
  const canSuggest = value.memberIds.length > 0 && value.destination.trim().length > 0;
  const selectedNames = joined.filter(member => value.memberIds.includes(member.id)).map(member => member.name);
  const canRequest = canSuggest && value.meetingPoint.trim().length > 0;

  function toggleMember(id: string) {
    const memberIds = value.memberIds.includes(id) ? value.memberIds.filter(memberId => memberId !== id) : [...value.memberIds, id];
    onChange({ ...value, memberIds });
  }

  function suggestMidpoint() {
    if (!canSuggest) return;
    onChange({ ...value, meetingPoint: `Between ${value.destination} and ${selectedNames.join(', ') || 'your group'}`, meetingTime: 'Meet in about 35 min', suggestionSource: 'prototype-midpoint' });
  }

  return <section className="split-note" aria-label="Group split prototype">
    <div><span>GROUP SPLIT</span><b>{active ? 'Split is active.' : 'Make a split explicit before the group votes.'}</b><small>Choose the people going together, then agree a meeting point. This uses a local midpoint example, not live member locations.</small></div>
    {!active && <>
      <div className="split-member-picker" aria-label="Choose members for this split">{joined.map(member => <label key={member.id}><input type="checkbox" checked={value.memberIds.includes(member.id)} onChange={() => toggleMember(member.id)} />{member.name}</label>)}</div>
      <label className="setup-field"><span>Where does this group want to go?</span><input value={value.destination} onChange={event => onChange({ ...value, destination: event.target.value })} placeholder="e.g. Kappabashi kitchen street" /></label>
      <div className="inline-actions"><button type="button" className="secondary" disabled={!canSuggest} onClick={suggestMidpoint}>Suggest meeting point</button></div>
      {value.meetingPoint && <div className="adapter-note"><b>{value.suggestionSource === 'prototype-midpoint' ? 'AI midpoint example' : 'Manual meeting point'}</b><small>{value.meetingPoint} · {value.meetingTime || 'Time to be agreed'}</small><small>Prototype calculation only: it does not analyze real member locations.</small></div>}
      <label className="setup-field"><span>Meeting point (you can set your own)</span><input value={value.meetingPoint} onChange={event => onChange({ ...value, meetingPoint: event.target.value, suggestionSource: 'manual' })} placeholder="e.g. Ueno Station central gate" /></label>
      <label className="setup-field"><span>Meet at</span><input value={value.meetingTime} onChange={event => onChange({ ...value, meetingTime: event.target.value })} placeholder="e.g. 18:30" /></label>
      <button type="button" disabled={!canRequest} onClick={onRequest}>Send split to Group Court</button>
    </>}
    {active && <><div className="split-timelines"><span>{selectedNames.join(' + ') || 'Selected members'} · {value.destination || 'destination pending'}</span><span>Reunion · {value.meetingPoint || 'point pending'} · {value.meetingTime || 'time pending'}</span></div><button type="button" onClick={onRequestReunion}>Request reunion</button></>}
  </section>;
}
