import { useRitualSequence } from '../motion/useRitualSequence';
import { CocoCompanion } from './coco/CocoCompanion';
import { playSound } from '../sound';
import adventureSeeker from '../assets/coco/personas/adventure_seeker.png';
import foodieHunter from '../assets/coco/personas/foodie_hunter.png';
import groupCoordinator from '../assets/coco/personas/group_coordinator.png';
import masterPlanner from '../assets/coco/personas/master_planner.png';
import './court-tie-ritual.css';

export type CourtTieRitualProps = {
  tied: boolean;
  options: readonly string[];
  onDraw: () => void;
  result?: string;
  onReveal: () => void;
};

const stages = [
  { name: 'turning', durationMs: 650 },
  { name: 'shuffling', durationMs: 850 },
  { name: 'selected' },
  { name: 'reveal' },
] as const;

const juryImages = [groupCoordinator, foodieHunter, adventureSeeker, masterPlanner];

/** Parent owns the tally, fair selection and proposal confirmation. Remount for a new case. */
export function CourtTieRitual({ tied, options, onDraw, result, onReveal }: CourtTieRitualProps) {
  const ritual = useRitualSequence(tied ? stages : []);
  if (!tied) return null;
  const stage = ritual.stage ?? 'idle';
  const canStart = stage === 'idle' && options.length >= 2;
  const canReveal = stage === 'selected' && result !== undefined;
  const yesCount = Math.ceil(options.length / 2);
  const noCount = Math.floor(options.length / 2);
  // Closure guards also reject repeated calls through the same pre-render handler.
  let started = false;
  let opened = false;
  const draw = () => {
    if (!canStart || started) return;
    started = true;
    if (ritual.start()) {
      playSound('gacha');
      onDraw();
    }
  };
  const reveal = () => {
    if (!canReveal || opened) return;
    opened = true;
    if (ritual.advance()) {
      playSound('gavel');
      onReveal();
    }
  };
  return <section className="court-tie-ritual" data-stage={stage} aria-label="Court tie draw">
    <header className="court-tie-ritual__heading">
      <span>Case 1 of 3</span>
      <div className="court-tie-ritual__progress" aria-hidden="true"><i/><i/><i/></div>
      <h3>The jury is voting...</h3>
      <p>Equal votes. Coco Court needs one playful, fair tie-break.</p>
    </header>
    <div className="court-tie-ritual__chamber">
      <div className="court-tie-ritual__burst" aria-hidden="true"><i/><i/><i/><i/></div>
      <div className="court-tie-ritual__judge court-art-card" aria-hidden="true">
        <CocoCompanion context="court" size={112}/>
        <span className="court-tie-ritual__gavel"><i/></span>
      </div>
      <div className="court-tie-ritual__bench" aria-hidden="true"><span>COCO COURT</span></div>
      <div className="court-tie-ritual__jury" aria-hidden="true">
        {options.slice(0, 6).map((option, index) => (
          <span className={`court-tie-ritual__juror juror-${index + 1}`} key={`${index}-${option}-juror`}>
            <img src={juryImages[index % juryImages.length]} alt="" />
            <i>{index % 2 === 0 ? '✓' : '×'}</i>
          </span>
        ))}
      </div>
      <div className="court-tie-ritual__clerk"><CocoCompanion context="courtTie" size={82}/></div>
      <div className="court-tie-ritual__ticket-stack" aria-hidden="true">
        {options.map((option, index) => (
          <i className="court-tie-ritual__slip" key={`${index}-${option}-slip`}/>
        ))}
      </div>
      <div className="court-tie-ritual__vote-bar" aria-hidden="true">
        <b>{yesCount}</b>
        <span><i style={{ width: `${(yesCount / options.length) * 100}%` }}/></span>
        <b>{noCount}</b>
      </div>
      <div className="court-tie-ritual__selected-slip" aria-hidden="true">
        <small>The verdict is...</small>
        <strong>{stage === 'reveal' ? result : 'Waiting'}</strong>
      </div>
    </div>
    <div className="court-tie-ritual__options-wrap">
      <ol className="court-tie-ritual__options" aria-label="Tied proposals">
        {options.map((option, index) => <li key={`${index}-${option}`}>{option}</li>)}
      </ol>
      <div className="court-tie-ritual__mini-avatars" aria-hidden="true">
        {options.slice(0, 6).map((option, index) => (
          <img key={`${index}-${option}-avatar`} src={juryImages[index % juryImages.length]} alt="" className={index % 2 === 0 ? 'yes' : 'no'} />
        ))}
      </div>
    </div>
    <div className="court-tie-ritual__actions">
      <button className="court-tie-ritual__action" type="button" disabled={!canStart} onClick={draw}>Turn the court drum</button>
      {stage === 'selected' && <button className="court-tie-ritual__action" type="button" disabled={!canReveal} onClick={reveal}>Reveal selected slip</button>}
    </div>
    <div className="court-tie-ritual__status" role="status" aria-live="polite" aria-atomic="true">
      {stage === 'idle' && (options.length < 2 ? 'At least two tied proposals are needed.' : 'Tap the court drum and let the tie-break animation run.')}
      {stage === 'turning' && 'The court is shaking the vote slips...'}
      {stage === 'shuffling' && 'The jury cards are bouncing into place...'}
      {stage === 'selected' && (canReveal ? 'One slip is sealed. Reveal it when you are ready.' : 'Waiting for the selected result...')}
      {stage === 'reveal' && <><span>DRAWN PROPOSAL</span><strong>{result}</strong></>}
    </div>
    <p className="court-tie-ritual__boundary">The drawn proposal still needs confirmation before it becomes official.</p>
  </section>;
}
