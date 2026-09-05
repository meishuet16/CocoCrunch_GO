import { useRitualSequence } from '../motion/useRitualSequence';
import { CocoCompanion } from './coco/CocoCompanion';
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

/** Parent owns the tally, fair selection and proposal confirmation. Remount for a new case. */
export function CourtTieRitual({ tied, options, onDraw, result, onReveal }: CourtTieRitualProps) {
  const ritual = useRitualSequence(tied ? stages : []);
  if (!tied) return null;
  const stage = ritual.stage ?? 'idle';
  const canStart = stage === 'idle' && options.length >= 2;
  const canReveal = stage === 'selected' && result !== undefined;
  // Closure guards also reject repeated calls through the same pre-render handler.
  let started = false;
  let opened = false;
  const draw = () => {
    if (!canStart || started) return;
    started = true;
    if (ritual.start()) onDraw();
  };
  const reveal = () => {
    if (!canReveal || opened) return;
    opened = true;
    if (ritual.advance()) onReveal();
  };
  return <section className="court-tie-ritual" data-stage={stage} aria-label="Court tie draw">
    <header className="court-tie-ritual__heading">
      <span>COCO COURT · TIE PROCEDURE</span>
      <h3>Equal votes. One fair draw.</h3>
      <p>The tied proposals go before the Court.</p>
    </header>
    <div className="court-tie-ritual__chamber" aria-hidden="true">
      <div className="court-tie-ritual__seal">CC<span>EQUAL VOICE</span></div>
      <div className="court-tie-ritual__clerk"><CocoCompanion context="courtTie" size={96}/></div>
      <div className="court-tie-ritual__stand">
        <div className="court-tie-ritual__drum">
          {options.map((option, index) => <i className="court-tie-ritual__slip" key={`${index}-${option}`}/>)}
        </div>
        <div className="court-tie-ritual__crank"/>
      </div>
      <div className="court-tie-ritual__podium"><span>COURT DRAW</span></div>
      <div className="court-tie-ritual__envelope"><span>{stage === 'reveal' ? 'OPENED' : 'SEALED'}</span></div>
    </div>
    <ol className="court-tie-ritual__options" aria-label="Tied proposals">
      {options.map((option, index) => <li key={`${index}-${option}`}>{option}</li>)}
    </ol>
    <button className="court-tie-ritual__action" type="button" disabled={!canStart} onClick={draw}>Turn the court drum</button>
    {stage === 'selected' && <button className="court-tie-ritual__action" type="button" disabled={!canReveal} onClick={reveal}>Reveal selected slip</button>}
    <div className="court-tie-ritual__status" role="status" aria-live="polite" aria-atomic="true">
      {stage === 'idle' && (options.length < 2 ? 'At least two tied proposals are needed.' : 'The drum is ready. Start the tie draw when you are ready.')}
      {stage === 'turning' && 'Turning the court drum…'}
      {stage === 'shuffling' && 'Shuffling the folded proposal slips…'}
      {stage === 'selected' && (canReveal ? 'One slip is sealed. Reveal it when you are ready.' : 'Waiting for the selected result…')}
      {stage === 'reveal' && <><span>DRAWN PROPOSAL</span><strong>{result}</strong></>}
    </div>
    <p className="court-tie-ritual__boundary">The drawn proposal still needs confirmation before it becomes official.</p>
  </section>;
}
