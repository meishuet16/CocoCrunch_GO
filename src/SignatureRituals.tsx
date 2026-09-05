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
  const copy: Record<string, string> = { review: 'We’ve done what we can. The rest is luck.', hands: '合十 · Hands together', incense: '上香 · A little incense', uncertainty: 'The uncertainty is still here.', talisman: '晴天符 · A symbolic sunshine talisman', ember: '化符 · A warm ember traces the edge', curl: '化符 · The paper curls', flames: '化符 · Illustrated flames consume the talisman', ash: '化符 · A little ash drifts away', appeal: '上诉天庭 · A playful appeal to the universe', tired: '尽力了 · Coco needs a rest', complete: 'We’ve done what we can. The rest is luck.' };
  const actions: Record<string, string> = { review: 'Begin · 合十', hands: 'Offer incense · 上香', incense: 'Check uncertainty', uncertainty: 'Receive 晴天符', talisman: 'Burn talisman · 化符', appeal: 'We’ve done our best · 尽力了', tired: 'Complete ritual', complete: 'Back to the trip' };
  return <RitualDialog title="做法祈愿 · A little luck" onClose={onClose}>
    <p className="rv-provenance">{prayer?.source || 'unavailable'} · {prayer?.uncertainty || 'No uncertainty information supplied.'}</p>
    {stage === 'review' && <div className="prayer-intents" aria-label="Optional prayer intention"><span>Optional intention</span><div>{['Weather', 'Smooth trip', 'Good food', 'Good luck', 'Anything'].map(option => <button type="button" className={wish === option ? 'active' : ''} key={option} onClick={() => setWish(option)}>{option}</button>)}</div><label>Custom<input value={wish} onChange={event => setWish(event.target.value)} placeholder="Just pray"/></label></div>}
    <div className="rv-prayer" data-stage={stage}>
      <CocoCompanion context="prayer" pose={['tired', 'complete'].includes(stage) ? 'expression-tired' : stage === 'uncertainty' ? 'expression-worried' : 'expression-love'} size={112}/>
      {stage === 'hands' && <svg className="rv-hands" viewBox="0 0 100 90" aria-hidden="true"><path d="M15 75 38 35 47 8Q52 4 50 18L49 66 35 83Z"/><path d="M85 75 62 35 53 8Q48 4 50 18L51 66 65 83Z"/></svg>}
      {stage === 'incense' && <div className="rv-incense" aria-hidden="true"><i/><i/><i/><span/></div>}
      {['talisman', 'ember', 'curl', 'flames', 'ash'].includes(stage) && <PaperScene stage={stage} text="晴天符" talisman/>}
      {stage === 'appeal' && <div className="rv-appeal" aria-hidden="true">✦ ↑ ✦</div>}
    </div>
    <p role="status" aria-live="polite">{copy[stage]}{stage === 'review' && wish ? ` · ${wish}` : ''}</p><p className="rv-note">A symbolic ritual. Weather and trip plans remain unchanged.</p>
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
  return <RitualDialog title="Family reassurance" onClose={props.onClose}><CocoCompanion context="askSuggestion" size={112}/><p role="status">Reassurance prepared locally.</p><p>{props.delayed ? 'Plan changed. Everyone is safe.' : 'Everything is going as planned.'}</p><p>{props.destination} · {props.privacy === 'status' ? 'status only' : props.privacy === 'area' ? 'approximate area' : 'exact location'} · continuous tracking is separate</p><p className="rv-provenance">No family delivery service is connected in this prototype. This records the message you chose to prepare.</p><button type="button" className="rv-primary" onClick={props.onClose}>Done</button></RitualDialog>;
}
