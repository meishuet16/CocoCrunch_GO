import { useRitualSequence } from '../motion/useRitualSequence';
import { CocoCompanion } from './coco/CocoCompanion';
import './random-rituals.css';

type LuckyDrawRevealProps = { result?: string; onDraw: () => void };
const stages = [
  { name: 'shaking', durationMs: 700 }, { name: 'emerging', durationMs: 450 },
  { name: 'held' }, { name: 'drawing', durationMs: 400 },
  { name: 'unfolding', durationMs: 500 }, { name: 'revealed' },
] as const;
const handledSequences = new WeakSet<object>();

export function LuckyDrawReveal({ result, onDraw }: LuckyDrawRevealProps) {
  const ritual = useRitualSequence(stages);
  const stage = ritual.stage ?? 'idle';
  const revealed = stage === 'revealed';
  if (stage !== 'held') handledSequences.delete(ritual.advance);
  const start = () => { if (ritual.start()) onDraw(); };
  const draw = () => { if (stage === 'held' && !handledSequences.has(ritual.advance)) { handledSequences.add(ritual.advance); ritual.advance(); } };
  return <section className="lucky-draw-reveal random-ritual" data-stage={stage} aria-labelledby="lucky-draw-title">
    <header className="lucky-draw-reveal__header"><span>LUCKY DRAW · ENTERTAINMENT</span><h3 id="lucky-draw-title">Draw today’s little luck.</h3></header>
    <div className="random-ritual__companion"><CocoCompanion context="lucky" pose={revealed && result ? 'expression-sparkle' : undefined} size={88}/></div>
    <div className="fortune-scene" aria-hidden="true">
      <div className="fortune-vessel"><div className="fortune-sticks">{Array.from({ length: 6 }, (_, i) => <i key={i}/>)}</div><i className="fortune-selected"/><div className="fortune-cup"><span>旅</span><small>求签</small></div></div>
      <div className="fortune-paper"><i/><span>TODAY’S LITTLE LUCK</span><b>✦</b><i/></div>
    </div>
    <p>Entertainment only: draw a sealed note for a small moment of surprise. It stays separate from real decisions and profile data.</p>
    {stage === 'held' && <button type="button" className="ritual-hold" onClick={draw}>Draw the stick</button>}
    <button className="lucky-draw-reveal__button" type="button" disabled={ritual.busy} onClick={start}>{revealed ? 'Draw again' : 'Draw a fortune'}</button>
    <div className="random-ritual__status" role="status" aria-live="polite">
      {stage === 'held' ? 'One stick has emerged. Draw it to unfold your fortune.' : ritual.busy ? 'A little luck is on its way…' : null}
      {revealed && (result ? <div className="lucky-draw-reveal__result"><span>TODAY’S LITTLE LUCK</span><b>{result}</b></div> : 'Waiting for the selected result…')}
    </div>
  </section>;
}
