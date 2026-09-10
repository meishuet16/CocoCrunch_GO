import React, { useMemo, useState } from 'react';
import { CharacterState, CharacterVariant, TravelCourtCharacter, VoteValue } from './TravelCourtCharacter';
import './travel-court.css';

export interface TripCourtMember {
  id: string;
  name: string;
  variant: Exclude<CharacterVariant, 'judge'>;
  vote?: VoteValue;
}

export interface CourtSceneProps {
  destination?: string;
  destinationMeta?: string;
  imageUrl?: string;
  members: TripCourtMember[];
  currentUserId: string;
  caseNumber?: number;
  totalCases?: number;
  onVote?: (vote:'yes'|'no', reason?:string) => void;
}

export function CourtScene({
  destination='Jeju',
  destinationMeta='Nature · Food · Coast',
  imageUrl,
  members,
  currentUserId,
  caseNumber=1,
  totalCases=3,
  onVote,
}:CourtSceneProps) {
  const [votes, setVotes] = useState<Record<string, VoteValue>>(() => Object.fromEntries(members.map(m => [m.id, m.vote ?? null])));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reason, setReason] = useState('');

  const yesCount = Object.values(votes).filter(v => v === 'yes').length;
  const noCount = Object.values(votes).filter(v => v === 'no').length;
  const votedCount = yesCount + noCount;
  const denom = Math.max(yesCount + noCount, 1);
  const yesPct = Math.round((yesCount / denom) * 100);
  const noPct = 100 - yesPct;
  const currentVote = votes[currentUserId] ?? null;

  const ordered = useMemo(() => {
    const current = members.find(m => m.id === currentUserId);
    const others = members.filter(m => m.id !== currentUserId);
    return current ? [current, ...others] : members;
  }, [members, currentUserId]);

  const stateFor = (member:TripCourtMember):CharacterState => {
    const v = votes[member.id];
    if (v === 'yes') return 'support';
    if (v === 'no') return 'objection';
    return member.id === currentUserId ? 'idle' : 'thinking';
  };

  const submit = (vote:'yes'|'no') => {
    setVotes(prev => ({...prev, [currentUserId]:vote}));
    setSheetOpen(false);
    onVote?.(vote, reason.trim() || undefined);
    setReason('');
  };

  return (
    <section className="tc-court-shell">
      <header className="tc-court-header">
        <button className="tc-icon-btn" aria-label="Back">‹</button>
        <div>
          <div className="tc-kicker">TRAVEL COURT</div>
          <h1>Group Court</h1>
        </div>
        <div className="tc-case-count">Case {caseNumber}/{totalCases}</div>
      </header>

      <div className="tc-case-progress" aria-label={`Case ${caseNumber} of ${totalCases}`}>
        {Array.from({length:totalCases}).map((_,i) => <span key={i} className={i < caseNumber ? 'is-active' : ''}/>) }
      </div>

      <div className="tc-score-card">
        <div className="tc-score-meta"><strong>Group support</strong><span>{votedCount}/{members.length} voted</span></div>
        <div className="tc-score-bar">
          <span className="tc-score-yes" style={{width:`${yesPct}%`}}/>
          <span className="tc-score-no" style={{width:`${noPct}%`}}/>
        </div>
        <div className="tc-score-numbers"><b>{yesCount} YES</b><b>{noCount} NO</b></div>
      </div>

      <div className="tc-court-stage">
        <div className="tc-stage-arch"/>
        <div className="tc-judge-seat">
          <div className="tc-judge-bubble">Order in the trip! <span>⚖</span></div>
          <TravelCourtCharacter variant="judge" state={votedCount === members.length ? 'celebrate' : 'idle'} size={190} blinkDelay={0.2}/>
        </div>

        <div className="tc-member-row">
          {ordered.map((member,index) => (
            <TravelCourtCharacter
              key={member.id}
              variant={member.variant}
              state={stateFor(member)}
              vote={votes[member.id]}
              size={112}
              blinkDelay={(index * .63) % 3}
              selected={member.id === currentUserId}
              label={member.id === currentUserId ? 'You' : member.name}
              onClick={member.id === currentUserId ? () => setSheetOpen(true) : undefined}
            />
          ))}
        </div>
      </div>

      <article className="tc-destination-card">
        {imageUrl ? <img src={imageUrl} alt=""/> : <div className="tc-image-fallback"><span>JEJU</span></div>}
        <div className="tc-destination-copy">
          <div className="tc-kicker">NOW ON TRIAL</div>
          <h2>Should we go to {destination}?</h2>
          <p>{destinationMeta}</p>
        </div>
        <button className="tc-primary" onClick={() => setSheetOpen(true)}>{currentVote ? 'Change my vote' : 'Cast my vote'}</button>
      </article>

      {sheetOpen && (
        <div className="tc-sheet-backdrop" role="presentation" onMouseDown={() => setSheetOpen(false)}>
          <div className="tc-vote-sheet" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}>
            <div className="tc-sheet-handle"/>
            <div className="tc-vote-person">
              <TravelCourtCharacter variant={members.find(m => m.id===currentUserId)?.variant || 'blue'} state="idle" size={84}/>
              <div><div className="tc-kicker">YOUR VERDICT</div><h3>What do you think?</h3></div>
            </div>
            <div className="tc-vote-actions">
              <button className="tc-vote-yes" onClick={() => submit('yes')}><span>✓</span><b>Let’s go</b><small>I’m in</small></button>
              <button className="tc-vote-no" onClick={() => submit('no')}><span>×</span><b>Not now</b><small>Skip this one</small></button>
            </div>
            <label className="tc-reason-box">
              <span>Add a reason <em>optional</em></span>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} maxLength={120} placeholder="Make your case…"/>
              <small>{reason.length}/120</small>
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
