import { useState, useId } from 'react';
import { Users, MapPin, Sparkles, Clock, Compass, Check, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import type { TripMember } from '../domain/trip';
import type { GroupSplitPlan } from '../persistence';
import { CocoCompanion } from './coco/CocoCompanion';
import './GroupSplit.css';

type GroupSplitProps = {
  members: TripMember[];
  value: GroupSplitPlan;
  active: boolean;
  currentAnchorName?: string;
  cityDestination?: string;
  onChange: (next: GroupSplitPlan) => void;
  onRequest: () => void;
  onRequestReunion: () => void;
  onSendToCourt?: () => void;
  onClose?: () => void;
};

type MidpointPreset = {
  name: string;
  landmark: string;
  timeA: string;
  timeB: string;
  rationale: string;
};

function deriveAiMidpoint(
  splitDestination: string,
  currentAnchor: string,
  cityName = 'Tokyo'
): MidpointPreset {
  const destLower = splitDestination.toLowerCase();
  const anchorLower = currentAnchor.toLowerCase();

  if (destLower.includes('kappabashi') || destLower.includes('asakusa') || destLower.includes('ueno')) {
    return {
      name: 'Ueno Station · Central Concourse (Grand Clock)',
      landmark: 'Grand Concourse Clock Tower, near JR Central Gate',
      timeA: '~12 min (Ginza Line)',
      timeB: '~18 min (JR Yamanote Line)',
      rationale: `Optimal major transit hub directly connecting Asakusa/Kappabashi (Party A) and ${currentAnchor || 'Shibuya'} (Party B). Wide open shelter with iconic high-visibility clock and coffee spots.`,
    };
  }

  if (destLower.includes('akihabara')) {
    return {
      name: 'Tokyo Station · Marunouchi North Exit Dome',
      landmark: 'Under the historic rotunda dome, North Ticket Gate',
      timeA: '~6 min (JR Yamanote)',
      timeB: '~16 min (Chuo/Yamanote)',
      rationale: `Direct rail interchange between Akihabara and ${currentAnchor || 'current route'}. The historic high ceiling dome is unmistakable and shielded from crowds.`,
    };
  }

  if (destLower.includes('ginza') || destLower.includes('tsukiji')) {
    return {
      name: 'Shinbashi Station · SL Square (Steam Locomotive)',
      landmark: 'SL Steam Locomotive Plaza outside JR Hibiya Exit',
      timeA: '~8 min walk / metro',
      timeB: '~14 min (Yamanote/Ginza Line)',
      rationale: `Convenient transfer station between Ginza/Tsukiji and ${currentAnchor || 'main group'}. The vintage steam locomotive plaza is a premier open rendezvous point.`,
    };
  }

  if (destLower.includes('shinjuku') || destLower.includes('shibuya') || destLower.includes('harajuku')) {
    return {
      name: 'Meiji-Jingumae (Harajuku) Station · Jingubashi Plaza',
      landmark: 'Exit 2 beside the wooded promenade entrance',
      timeA: '~9 min walk/transit',
      timeB: '~10 min transit',
      rationale: `Equidistant central stop connecting Yamanote Line and Fukutoshin Line. Spacious pedestrian plaza with pleasant trees and clear navigation.`,
    };
  }

  // General fallback
  const hubName = cityName.includes('Kyoto')
    ? 'Kyoto Station · Grand Staircase Concourse'
    : cityName.includes('Osaka')
      ? 'Umeda Station · Clock Square'
      : 'Ginza Station · Central Crossing Gate A1';

  return {
    name: hubName,
    landmark: 'Main concourse customer information center',
    timeA: '~14 min',
    timeB: '~15 min',
    rationale: `Coco analyzed Party A's destination (${splitDestination}) and Party B's ongoing anchor (${currentAnchor || 'Main Group'}). This provides an equidistant midpoint with sheltered transit convenience.`,
  };
}

const DESTINATION_PRESETS: Record<string, string[]> = {
  tokyo: ['Kappabashi Kitchen Street', 'Akihabara Electric Town', 'Ginza Six', 'Tsukiji Outer Market', 'Shinjuku Gyoen', 'Daikanyama T-Site'],
  kyoto: ['Nishiki Market', 'Fushimi Inari Taisha', 'Gion Corner', 'Arashiyama Bamboo Grove'],
  osaka: ['Dotonbori Glico', 'Shinsekai', 'Osaka Castle Park', 'Umeda Sky Building'],
};

export function GroupSplit({
  members,
  value,
  active,
  currentAnchorName = 'Current anchor',
  cityDestination = 'Tokyo',
  onChange,
  onRequest,
  onRequestReunion,
  onSendToCourt,
  onClose,
}: GroupSplitProps) {
  const [midpointTab, setMidpointTab] = useState<'ai' | 'manual'>(
    value.suggestionSource === 'manual' ? 'manual' : 'ai'
  );
  const [customTime, setCustomTime] = useState(value.meetingTime || '');
  const [timeOffsetMinutes, setTimeOffsetMinutes] = useState(45);

  const joined = members.filter(member => member.inviteStatus === 'joined');
  const selectedMembers = joined.filter(member => value.memberIds.includes(member.id));
  const remainingMembers = joined.filter(member => !value.memberIds.includes(member.id));
  const selectedNames = selectedMembers.map(m => m.name);

  const canSuggest = value.memberIds.length > 0 && value.destination.trim().length > 0;
  const canConfirm = canSuggest && value.meetingPoint.trim().length > 0;

  function toggleMember(id: string) {
    const memberIds = value.memberIds.includes(id)
      ? value.memberIds.filter(memberId => memberId !== id)
      : [...value.memberIds, id];
    onChange({ ...value, memberIds });
  }

  function handleSelectPresetDest(preset: string) {
    const nextVal: GroupSplitPlan = { ...value, destination: preset };
    onChange(nextVal);
  }

  function calculateTargetTime(minutesAhead: number) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutesAhead);
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  }

  function handleAiSuggest() {
    if (!canSuggest) return;
    const aiResult = deriveAiMidpoint(value.destination, currentAnchorName, cityDestination);
    const meetingTime = customTime || calculateTargetTime(timeOffsetMinutes);
    onChange({
      ...value,
      meetingPoint: aiResult.name,
      meetingTime,
      suggestionSource: 'ai-midpoint',
      aiReasoning: aiResult.rationale,
    });
    setMidpointTab('ai');
  }

  function handleManualMeetingPointChange(val: string) {
    onChange({
      ...value,
      meetingPoint: val,
      suggestionSource: 'manual',
    });
  }

  function handleSetTimeOffset(mins: number) {
    setTimeOffsetMinutes(mins);
    const target = calculateTargetTime(mins);
    setCustomTime(target);
    onChange({
      ...value,
      meetingTime: target,
    });
  }

  const presets = DESTINATION_PRESETS[cityDestination.toLowerCase()] || DESTINATION_PRESETS.tokyo;
  const currentAiPreset = deriveAiMidpoint(value.destination || 'Selected stop', currentAnchorName, cityDestination);

  return (
    <section className="group-split-drawer" aria-label="Group split">
      {/* Header */}
      <div className="split-header-lockup">
        <CocoCompanion context="traveling" pose={active ? 'action-celebrate' : 'action-binoculars'} size={48} />
        <div className="split-header-info">
          <span className="drawer-kicker">GROUP SPLIT</span>
          <h3>{active ? 'Split is currently active' : 'Plan flexible group split'}</h3>
          <small className="split-step-note">
            Split off to explore different interests, then effortlessly reunite at an optimal midpoint.
          </small>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="split-privacy-badge">
        <Compass size={16} />
        <span>
          <strong>Strict Map Privacy:</strong> Only your own location is shown on the group map. Other members’ real-time coordinates stay private.
        </span>
      </div>

      {/* ACTIVE SPLIT STATE */}
      {active && (
        <div className="split-active-panel">
          <div className="split-active-status-bar">
            <span className="split-active-badge">
              <span className="split-active-pulse" />
              Split in Progress
            </span>
            <small>{value.meetingTime}</small>
          </div>

          <div className="split-active-info-card">
            <div className="split-partition-row">
              <span className="split-partition-tag branch">Splitting branch</span>
              <strong>{selectedNames.join(', ') || 'Selected members'}</strong>
              <span>→ {value.destination || 'Destination'}</span>
            </div>
            <div className="split-partition-row">
              <span className="split-partition-tag main">Main group</span>
              <strong>{remainingMembers.map(m => m.name).join(', ') || 'Remaining members'}</strong>
              <span>→ {currentAnchorName || 'Current area'}</span>
            </div>
          </div>

          <div className="split-active-reunion-highlight">
            <MapPin size={22} className="reunion-pin" />
            <div>
              <small>REUNION MEETING POINT</small>
              <b>{value.meetingPoint || 'Agreed meeting point'}</b>
              <small>Meet at: {value.meetingTime || 'As scheduled'}</small>
            </div>
          </div>

          <div className="split-active-actions">
            <button type="button" className="secondary" onClick={onRequestReunion}>
              <Users size={15} /> Request reunion
            </button>
            <button type="button" className="primary" onClick={onRequestReunion}>
              <Check size={15} /> Reunited (End Split)
            </button>
          </div>
        </div>
      )}

      {/* PLANNING / EDITING SPLIT STATE */}
      {!active && (
        <div className="split-steps-flow">
          {/* STEP 1: Select members */}
          <div className="split-step-card cc-card">
            <div className="split-step-head">
              <div className="split-step-title">
                <span className="split-step-badge">1</span>
                <span>Select members splitting together</span>
              </div>
              <small className="split-step-note">{selectedMembers.length} selected</small>
            </div>

            <div className="split-members-list" aria-label="Choose members for this split">
              {joined.map(member => {
                const isSelected = value.memberIds.includes(member.id);
                return (
                  <div
                    key={member.id}
                    className={`split-member-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleMember(member.id)}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') toggleMember(member.id); }}
                  >
                    <div className="split-member-avatar">
                      {isSelected ? <Check size={14} /> : member.name.charAt(0)}
                    </div>
                    <div className="split-member-details">
                      <strong>{member.name}</strong>
                      <small>{member.role || 'Member'}</small>
                    </div>
                  </div>
                );
              })}
            </div>

            {value.memberIds.length > 0 && (
              <div className="split-group-partition">
                <div className="split-partition-row">
                  <span className="split-partition-tag branch">Splitting:</span>
                  <strong>{selectedNames.join(', ')}</strong>
                </div>
                {remainingMembers.length > 0 && (
                  <div className="split-partition-row">
                    <span className="split-partition-tag main">Main group:</span>
                    <span>{remainingMembers.map(m => m.name).join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Destination */}
          <div className="split-step-card cc-card">
            <div className="split-step-head">
              <div className="split-step-title">
                <span className="split-step-badge">2</span>
                <span>Where does this branch want to go?</span>
              </div>
            </div>

            <div className="split-dest-input-wrap">
              <input
                value={value.destination}
                onChange={e => onChange({ ...value, destination: e.target.value })}
                placeholder="e.g. Kappabashi kitchen street, Akihabara..."
                aria-label="Destination for split branch"
              />

              <div className="split-dest-presets">
                <span>Popular ideas:</span>
                {presets.map(item => (
                  <button
                    key={item}
                    type="button"
                    className="split-preset-btn"
                    onClick={() => handleSelectPresetDest(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: Meeting point (AI or Manual) */}
          <div className="split-step-card cc-card">
            <div className="split-step-head">
              <div className="split-step-title">
                <span className="split-step-badge">3</span>
                <span>Meeting Point</span>
              </div>
            </div>

            <div className="split-midpoint-modes" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={midpointTab === 'ai'}
                className={`split-midpoint-tab ${midpointTab === 'ai' ? 'active' : ''}`}
                onClick={() => setMidpointTab('ai')}
              >
                <Sparkles size={14} /> AI Suggestion
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={midpointTab === 'manual'}
                className={`split-midpoint-tab ${midpointTab === 'manual' ? 'active' : ''}`}
                onClick={() => setMidpointTab('manual')}
              >
                <MapPin size={14} /> Custom entry
              </button>
            </div>

            {midpointTab === 'ai' && (
              <div className="split-ai-card">
                <div className="split-ai-header-row">
                  <b>{value.meetingPoint && value.suggestionSource === 'ai-midpoint' ? value.meetingPoint : currentAiPreset.name}</b>
                  <span className="split-ai-time-pill">~15m transit</span>
                </div>
                <button
                  type="button"
                  className="primary"
                  disabled={!canSuggest}
                  onClick={handleAiSuggest}
                >
                  <Sparkles size={14} /> {value.meetingPoint && value.suggestionSource === 'ai-midpoint' ? '✓ Adopted AI Meeting Point' : 'Adopt AI Meeting Point'}
                </button>
              </div>
            )}

            {midpointTab === 'manual' && (
              <div className="split-manual-wrap">
                <input
                  value={value.meetingPoint}
                  onChange={e => handleManualMeetingPointChange(e.target.value)}
                  placeholder="e.g. Ueno Station central gate"
                  aria-label="Manual meeting point"
                />
              </div>
            )}

            {value.meetingPoint && (
              <div className="adapter-note" style={{ margin: 0, padding: '6px 10px' }}>
                <b>{value.suggestionSource === 'manual' ? 'Manual meeting point' : 'Suggested meeting point'}</b>
                <small>{value.meetingPoint} · Review this meeting point with your group.</small>
              </div>
            )}
          </div>

          {/* STEP 4: Meeting Time */}
          <div className="split-step-card cc-card">
            <div className="split-step-head">
              <div className="split-step-title">
                <span className="split-step-badge">4</span>
                <span>Rendezvous Time</span>
              </div>
            </div>

            <div className="split-time-selector">
              <div className="split-time-chips">
                {[30, 45, 60, 90, 120].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    className={`split-time-chip ${timeOffsetMinutes === mins ? 'active' : ''}`}
                    onClick={() => handleSetTimeOffset(mins)}
                  >
                    +{mins} min
                  </button>
                ))}
              </div>

              <div className="split-time-single-input">
                <Clock size={16} />
                <input
                  value={value.meetingTime || calculateTargetTime(timeOffsetMinutes)}
                  onChange={e => {
                    setCustomTime(e.target.value);
                    onChange({ ...value, meetingTime: e.target.value });
                  }}
                  placeholder="e.g. 18:30"
                  aria-label="Meet at"
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="split-actions-block">
            <button
              type="button"
              className="primary split-submit-btn"
              disabled={!canConfirm}
              onClick={onRequest}
            >
              <Users size={16} /> Start Group Split
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
export default GroupSplit;
