import type { KeyboardEvent } from 'react';
import { useRitualSequence } from '../motion/useRitualSequence';
import { CocoCompanion } from './coco/CocoCompanion';
import './random-rituals.css';

type EverydayGachaMachineProps = { result?: string; onTurn: () => void; candidates?: readonly string[] };
const stages = [
  { name: 'turning', durationMs: 420 }, { name: 'rolling', durationMs: 620 },
  { name: 'dropping', durationMs: 360 }, { name: 'settling', durationMs: 280 },
  { name: 'held' }, { name: 'opening', durationMs: 480 }, { name: 'revealed' },
] as const;
const handledSequences = new WeakSet<object>();

export function EverydayGachaMachine({ result, onTurn, candidates }: EverydayGachaMachineProps) {
  const ritual = useRitualSequence(stages);
  const stage = ritual.stage ?? 'idle';
  const revealed = stage === 'revealed';
  const canTurn = !ritual.busy && candidates?.length !== 0;
  if (stage !== 'held') handledSequences.delete(ritual.advance);
  const turn = () => { if (canTurn && ritual.start()) onTurn(); };
  const open = () => { if (stage === 'held' && !handledSequences.has(ritual.advance)) { handledSequences.add(ritual.advance); ritual.advance(); } };
  const turnWithKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    turn();
  };
  return <section className="everyday-gacha-machine random-ritual" data-stage={stage} aria-labelledby="everyday-gacha-title">
    <header className="everyday-gacha-machine__header"><span>EVERYDAY GACHA</span><h3 id="everyday-gacha-title">Choose a small everyday move.</h3></header>
    <div className="random-ritual__companion"><CocoCompanion context="gacha" pose={revealed && result ? 'expression-happy' : undefined} size={88}/></div>
    <div className="travel-machine" data-turnable={canTurn ? 'true' : 'false'} aria-label="Travel capsule machine">
      <div className="travel-machine__roof">LITTLE DETOURS</div>
      <div className={`travel-machine__drum${candidates ? ' travel-machine__drum--candidates' : ''}`}>{candidates
        ? candidates.map((candidate, i) => <i className="drum-ball" title={candidate} key={`${i}-${candidate}`}><span>{i + 1}</span></i>)
        : Array.from({ length: 7 }, (_, i) => <i className={`drum-ball ball-${i}`} key={i}/>)}</div>
      <div className="travel-machine__base">
        <div className="travel-machine__knob" role="button" tabIndex={canTurn ? 0 : -1} aria-label="Turn the gacha knob" aria-disabled={!canTurn} onClick={turn} onKeyDown={turnWithKey}/>
        <div className="travel-machine__slot"/>
      </div>
      <div className="travel-capsule"><i/><b/><em>{revealed && result ? result : 'idea'}</em></div>
      <div className="travel-machine__idea-note"><span>skipped idea</span></div>
      <small>click the round knob</small>
    </div>
    <p>Turn between reasonable everyday options when the next little choice feels too close to call.</p>
    {candidates && <div className="everyday-gacha-machine__options" aria-label="Everyday options">{candidates.map((candidate, i) => <span key={`${i}-${candidate}`}>{i + 1}. {candidate}</span>)}</div>}
    <p className="everyday-gacha-machine__boundary">This is not a Court decision. It does not write the official itinerary or learning.</p>
    {stage === 'held' && <button type="button" className="ritual-hold" onClick={open}>Open capsule</button>}
    <button className="everyday-gacha-machine__button" type="button" disabled={!canTurn} onClick={turn}>{revealed ? 'Turn again' : 'Turn the Gacha'}</button>
    <div className="random-ritual__status" role="status" aria-live="polite">
      {stage === 'held' ? 'Your capsule is ready. Open it to see the choice.' : ritual.busy ? 'Choosing a little adventure…' : null}
      {revealed && (result ? <div className="everyday-gacha-machine__result"><span>RESULT</span><b>{result}</b></div> : 'Waiting for the selected result…')}
    </div>
  </section>;
}
