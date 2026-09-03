import { useState } from 'react';
import { Check, Send, X } from 'lucide-react';

export type Ritual = 'capture' | 'courier' | 'receipt' | 'prayer' | null;

type Props = {
  ritual: Ritual;
  place?: string;
  destination: string;
  privacy: 'status' | 'area' | 'exact';
  delayed: boolean;
  onClose: () => void;
};

export default function SignatureRituals({ ritual, place = 'this place', destination, privacy, delayed, onClose }: Props) {
  const [blessed, setBlessed] = useState(false);

  if (!ritual) return null;

  if (ritual === 'capture') return (
    <div className="signature-overlay" role="dialog" aria-modal="true" aria-label={`Capture ${place}`}>
      <section className="signature-stage capture-stage">
        <button className="signature-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
        <span className="signature-kicker">COCO CAPTURE</span>
        <div className="capture-orbit" aria-hidden="true"><div className="capture-ball"><span/><i/></div></div>
        <h3>{place} captured.</h3>
        <p>Coco tucked it into your saved trip ideas. Capture Capsule saves a place; it never makes a random decision.</p>
        <button className="signature-primary" onClick={onClose}><Check size={18}/> Keep exploring</button>
      </section>
    </div>
  );

  if (ritual === 'courier') return (
    <div className="signature-overlay" role="dialog" aria-modal="true" aria-label="Family reassurance sent">
      <section className="signature-stage courier-stage">
        <button className="signature-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
        <span className="signature-kicker">FAMILY WINDOW</span>
        <div className="courier-route" aria-hidden="true"><span className="courier-coco">🪳</span><i/></div>
        <h3>Coco delivered your reassurance.</h3>
        <div className="family-note"><b>{delayed ? '🟡 Plan changed. Everyone is safe.' : '🟢 Everything is going as planned.'}</b><small>{destination} · {privacy === 'status' ? 'status only' : privacy === 'area' ? 'approximate area' : 'exact location'} · continuous tracking is separate</small><em>No action needed.</em></div>
        <p>Only the privacy level you chose was shared.</p>
        <button className="signature-primary" onClick={onClose}><Send size={18}/> Done</button>
      </section>
    </div>
  );

  if (ritual === 'receipt') return (
    <div className="signature-overlay" role="dialog" aria-modal="true" aria-label="Split bill printed">
      <section className="signature-stage printer-stage">
        <button className="signature-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
        <span className="signature-kicker">COCO RECEIPT</span>
        <div className="mini-printer" aria-hidden="true"><div/><span>rrrrrr…</span></div>
        <div className="ritual-receipt"><b>COCOCRUNCH · DINNER</b><span>Mei <strong>RM47</strong></span><span>JH <strong>RM43</strong></span><span>Zi Shan <strong>RM46</strong></span><span>Alex <strong>RM44</strong></span><em>PAID</em></div>
        <button className="signature-primary" onClick={onClose}>Tear receipt</button>
      </section>
    </div>
  );

  return (
    <div className="signature-overlay" role="dialog" aria-modal="true" aria-label="Optional prayer ritual">
      <section className="signature-stage prayer-stage">
        <button className="signature-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
        <span className="signature-kicker">REAL PLAN FIXED · OPTIONAL RITUAL</span>
        <div className={`incense-scene ${blessed ? 'blessed' : ''}`} aria-hidden="true"><span>🪳</span><i/><i/><i/></div>
        <h3>{blessed ? '玄学已收到。' : '剩下的交给玄学？'}</h3>
        <p>{blessed ? '科学方案没有改变。Coco 只是陪你拜完了。' : 'The real replan is already done. This ritual changes absolutely nothing — except maybe your mood.'}</p>
        {!blessed ? <button className="signature-primary" onClick={() => setBlessed(true)}>🙏 拜一下</button> : <button className="signature-primary" onClick={() => { setBlessed(false); onClose(); }}>Back to the trip</button>}
      </section>
    </div>
  );
}
