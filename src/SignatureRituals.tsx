import { useRef, useState } from 'react';
import { CocoCompanion } from './components/coco/CocoCompanion';
import { useRitualSequence } from './motion/useRitualSequence';
import { createCommitGate, equalAllocation, sequences } from './components/rituals/rituals';
import { RitualDialog, PaperScene } from './components/rituals/RitualScene';
import './components/rituals/ritual-v2.css';

export type Ritual = 'capture' | 'release' | 'courier' | 'receipt' | 'prayer' | null;
export type Props = {
  ritual: Ritual; place?: string; destination: string; privacy: 'status' | 'area' | 'exact'; delayed: boolean; onClose: () => void;
  capture?: { place: string; save: () => boolean };
  release?: { name: string; reason: string; commit: () => boolean };
  receipt?: { total: number; participants: string[] };
  prayer?: { source: 'simulated' | 'user-reported' | 'unavailable'; uncertainty: string; wish?: string };
};

function PersistRitual(props: Props & { kind: 'capture' | 'release' }) {
  const { kind, onClose } = props;
  const capture = kind === 'capture';
  const seq = useRitualSequence(sequences[kind]);
  const gate = useRef(createCommitGate());
  const [error, setError] = useState(false);
  const stage = seq.stage ?? 'review';
  const name = capture ? props.capture?.place || props.place || 'Place unavailable' : props.release?.name || 'Wish unavailable';
  const write = capture ? props.capture?.save : props.release?.commit;
  const commit = () => { const ok = gate.current.run(seq.stage, 'commit', write); setError(!ok); if (ok) seq.advance(); };
  const captureLabels: Record<string, string> = { review: 'Review your place', prepare: 'Coco prepares the travel case', launch: 'Launching the travel case', compress: 'Tucking the place card inside', close: 'Closing the case', shake: 'One little anticipation shake', commit: 'Ready to save — nothing saved yet', success: 'Saved' };
  return <RitualDialog title={`${capture ? 'Capture' : '超度 · Release'} · ${name}`} onClose={onClose}>
    {!capture && <p>{props.release?.reason || 'Select a wish to review its release.'}</p>}
    {capture ? <div className="rv-capture rv-scene" data-stage={stage} aria-hidden="true"><div className="rv-place-card">{name}</div><div className="rv-case"><i/><span>✦</span></div></div> : <PaperScene stage={stage} text={name}/>}
    <CocoCompanion context={capture ? 'askSuggestion' : 'release'} pose={stage === 'success' ? capture ? 'expression-proud' : 'action-rest' : 'expression-thinking'} size={96}/>
    <p role="status" aria-live="polite">{capture ? captureLabels[stage] : stage === 'success' ? '已超度 · Release confirmed' : stage === 'review' ? 'Review this wish before beginning.' : stage === 'commit' ? 'Ceremony complete. Confirm release to update this wish.' : `Releasing paper · ${stage}`}</p>
    {!write && <p>{capture ? 'Save' : 'Release'} action unavailable.</p>}
    {error && <p role="alert">{capture ? 'Save' : 'Release'} was not confirmed. No success has been recorded here. Please retry.</p>}
    <button type="button" className="rv-primary" disabled={!write || !['review', 'commit', 'success'].includes(stage)} onClick={stage === 'review' ? () => seq.start() : stage === 'commit' ? commit : onClose}>{stage === 'review' ? capture ? 'Prepare capture' : 'Begin release · 超度' : stage === 'commit' ? error ? capture ? 'Retry save' : 'Retry release' : capture ? 'Save place' : 'Confirm release' : stage === 'success' ? 'Done' : 'Ceremony in progress…'}</button>
  </RitualDialog>;
}

function Prayer({ prayer, onClose }: Props) {
  const seq = useRitualSequence(sequences.prayer);
  const [wish, setWish] = useState(prayer?.wish ?? 'Just pray');
  const stage = seq.stage ?? 'review';
  const copy: Record<string, string> = { review: 'A little luck', hands: 'Hands together', incense: 'A little incense', uncertainty: 'A little luck', talisman: 'A little luck', ember: 'A little luck', curl: 'A little luck', flames: 'A little luck', ash: 'A little luck', appeal: 'A little luck', tired: 'A little luck', complete: 'A little luck' };
  const actions: Record<string, string> = { review: 'Begin', hands: 'Continue', incense: 'Continue', uncertainty: 'Continue', talisman: 'Continue', appeal: 'Continue', tired: 'Done', complete: 'Done' };
  return <RitualDialog title="A little luck" onClose={onClose}>
    {stage === 'review' && <label className="prayer-intents"><select aria-label="Prayer intention" value={['Weather', 'Smooth trip', 'Good food', 'Good luck', 'Anything'].includes(wish) ? wish : 'Anything'} onChange={event => setWish(event.target.value)}>{['Weather', 'Smooth trip', 'Good food', 'Good luck', 'Anything'].map(option => <option key={option}>{option}</option>)}</select></label>}
    <div className="rv-prayer" data-stage={stage}>
      <CocoCompanion context="prayer" pose={['tired', 'complete'].includes(stage) ? 'expression-tired' : stage === 'uncertainty' ? 'expression-worried' : 'expression-love'} size={112}/>
    </div>
    <p role="status" aria-live="polite">{copy[stage]}</p>
    <button type="button" className="rv-primary" disabled={!actions[stage] || !prayer} onClick={stage === 'review' ? () => seq.start() : stage === 'complete' ? onClose : () => seq.advance()}>{actions[stage] || 'Burning talisman…'}</button>
  </RitualDialog>;
}

function Receipt({ receipt, onClose }: Props) {
  const seq = useRitualSequence(sequences.receipt);
  const [choice, setChoice] = useState(false);
  const [allocation, setAllocation] = useState<ReturnType<typeof equalAllocation>>(null);
  const valid = receipt ? equalAllocation(receipt.total, receipt.participants) : null;
  const stage = seq.stage ?? (allocation ? 'calculated' : 'bill');
  return <RitualDialog title="Split bill · Receipt" onClose={onClose}>
    {!valid ? <p role="status">Bill data unavailable. A valid total and participants are required.</p> : <>
      <p>Total <strong>{receipt!.total.toFixed(2)}</strong></p><p>{receipt!.participants.join(' · ')}</p>
      {stage === 'bill' && <><label className="rv-choice"><input type="checkbox" checked={choice} onChange={event => setChoice(event.target.checked)}/> Split equally between these participants</label><p className="rv-note">Any remainder cents go to participants in the order shown.</p><button type="button" className="rv-primary" disabled={!choice} onClick={() => setAllocation(equalAllocation(receipt!.total, receipt!.participants))}>Calculate split</button></>}
      {allocation && <div className="rv-print-scene" data-stage={stage}>
        <div className="rv-printer" aria-hidden="true"><span>COCO · PRINT</span><i/></div>
        <div className="rv-receipt"><b>COCOCRUNCH · EQUAL SPLIT</b>{allocation.map((row, index) => <div className="rv-print-row" key={index}><span>{row.name}</span><strong>{(row.cents / 100).toFixed(2)}</strong></div>)}<p>Total {receipt!.total.toFixed(2)}</p>{stage === 'prepared' && <strong className="rv-stamp">PREPARED</strong>}</div>
      </div>}
      <p role="status" aria-live="polite">{stage === 'bill' ? 'Choose an allocation before calculating.' : stage === 'calculated' ? 'Equal split calculated. Ready to print.' : stage === 'tear' ? 'Receipt ready. Tear when you’re ready.' : stage === 'prepared' ? 'Receipt prepared. No payment or settlement recorded.' : stage === 'tearing' ? 'Separating the receipt…' : 'Printing your split…'}</p>
      {allocation && <button type="button" className="rv-primary" disabled={!['calculated', 'tear', 'prepared'].includes(stage)} onClick={stage === 'calculated' ? () => seq.start() : stage === 'tear' ? () => seq.advance() : onClose}>{stage === 'calculated' ? 'Print receipt' : stage === 'tear' ? 'Tear receipt' : stage === 'prepared' ? 'Done' : 'Printing…'}</button>}
    </>}
    <CocoCompanion context="receipt" pose={stage === 'prepared' ? 'action-celebrate' : 'expression-thinking'} size={88}/>
  </RitualDialog>;
}

/** Parent keys each event so candidates receive fresh sequence and commit state. */
export default function SignatureRituals(props: Props) {
  if (!props.ritual) return null;
  if (props.ritual === 'capture' || props.ritual === 'release') return <PersistRitual key={props.ritual} {...props} kind={props.ritual}/>;
  if (props.ritual === 'prayer') return <Prayer {...props}/>;
  if (props.ritual === 'receipt') return <Receipt {...props}/>;
  return <RitualDialog title="Family reassurance" onClose={props.onClose}><CocoCompanion context="askSuggestion" size={112}/><p role="status">Reassurance prepared locally.</p><p>{props.delayed ? 'Plan changed. Everyone is safe.' : 'Everything is going as planned.'}</p><p>{props.destination} · {props.privacy === 'status' ? 'status only' : props.privacy === 'area' ? 'approximate area' : 'exact location'} · continuous tracking is separate</p><p className="rv-provenance">Your prepared message is saved here for review.</p><button type="button" className="rv-primary" onClick={props.onClose}>Done</button></RitualDialog>;
}
