import { useEffect, useState } from 'react';
import { Check, Send, X } from 'lucide-react';
import { playSound } from './sound';

export type Ritual = 'capture' | 'courier' | 'receipt' | 'prayer' | null;

type Props = { ritual: Ritual; place?: string; destination: string; privacy: 'status' | 'area' | 'exact'; delayed: boolean; onClose: () => void };
const prayerSteps = [
  { label: '合十', copy: 'Coco先认真一下。' },
  { label: '上香', copy: '科学方案已经完成，现在只是情绪仪式。' },
  { label: '晃手机', copy: '晃一晃，假装把申诉摇上去。' },
  { label: '晴天符', copy: '符有了，天气预报不会因此改变。' },
  { label: '已上诉天庭', copy: 'Weather: 90% rain · 科学方案 unchanged · Coco：尽力了…' },
];

function RitualCoco() {
  return <span className="ritual-coco" aria-hidden="true"><i/><b/><span/></span>;
}

export default function SignatureRituals({ ritual, place = 'this place', destination, privacy, delayed, onClose }: Props) {
  const [prayerStep, setPrayerStep] = useState(0);
  const [receiptStep, setReceiptStep] = useState<'printing' | 'tear' | 'paid'>('printing');
  useEffect(() => { if (ritual === 'prayer') setPrayerStep(0); if (ritual === 'receipt') setReceiptStep('printing'); }, [ritual]);
  if (!ritual) return null;

  if (ritual === 'capture') return <div className="signature-overlay" role="dialog" aria-modal="true" aria-label={`Capture ${place}`}><section className="signature-stage capture-stage"><button className="signature-close" onClick={onClose} aria-label="Close"><X size={20}/></button><span className="signature-kicker">COCO CAPTURE</span><div className="capture-orbit" aria-hidden="true"><div className="capture-ball"><span/><i/></div></div><h3>{place} captured.</h3><p>Coco tucked it into your saved trip ideas. Capture Capsule saves a place; it never makes a random decision.</p><button className="signature-primary" onClick={onClose}><Check size={18}/> Keep exploring</button></section></div>;

  if (ritual === 'courier') return <div className="signature-overlay" role="dialog" aria-modal="true" aria-label="Family reassurance sent"><section className="signature-stage courier-stage"><button className="signature-close" onClick={onClose} aria-label="Close"><X size={20}/></button><span className="signature-kicker">FAMILY WINDOW</span><div className="courier-route" aria-hidden="true"><RitualCoco/><i/></div><h3>Coco delivered your reassurance.</h3><div className="family-note"><b>{delayed ? 'Plan changed. Everyone is safe.' : 'Everything is going as planned.'}</b><small>{destination} · {privacy === 'status' ? 'status only' : privacy === 'area' ? 'approximate area' : 'exact location'} · continuous tracking is separate</small><em>No action needed.</em></div><p>Only the privacy level you chose was shared.</p><button className="signature-primary" onClick={onClose}><Send size={18}/> Done</button></section></div>;

  if (ritual === 'receipt') {
    const advanceReceipt = () => {
      if (receiptStep === 'printing') { setReceiptStep('tear'); playSound('receipt'); }
      else if (receiptStep === 'tear') { setReceiptStep('paid'); playSound('save'); }
      else onClose();
    };
    return <div className="signature-overlay" role="dialog" aria-modal="true" aria-label="Split bill receipt"><section className="signature-stage printer-stage"><button className="signature-close" onClick={onClose} aria-label="Close"><X size={20}/></button><span className="signature-kicker">COCO RECEIPT</span><div className={`mini-printer ${receiptStep}`} aria-hidden="true"><div/><span>{receiptStep === 'printing' ? 'rrrrrr…' : receiptStep === 'tear' ? 'ready to tear' : 'done ✓'}</span></div><div className={`ritual-receipt ${receiptStep}`}><b>COCOCRUNCH · DINNER</b><span>Mei <strong>RM47</strong></span><span>JH <strong>RM43</strong></span><span>Zi Shan <strong>RM46</strong></span><span>Alex <strong>RM44</strong></span>{receiptStep === 'paid' && <em>PAID</em>}</div><button className="signature-primary" onClick={advanceReceipt}>{receiptStep === 'printing' ? 'Print receipt' : receiptStep === 'tear' ? 'Tear receipt' : 'Done'}</button></section></div>;
  }

  const step = prayerSteps[prayerStep]; const prayerDone = prayerStep === prayerSteps.length - 1;
  const advancePrayer = () => { if (prayerDone) onClose(); else { setPrayerStep(current => Math.min(current + 1, prayerSteps.length - 1)); playSound('prayer-step'); } };
    return <div className="signature-overlay" role="dialog" aria-modal="true" aria-label="Optional prayer ritual"><section className="signature-stage prayer-stage"><button className="signature-close" onClick={onClose} aria-label="Close"><X size={20}/></button><span className="signature-kicker">REAL PLAN FIXED · OPTIONAL RITUAL</span><div className={`incense-scene prayer-${prayerStep}`} aria-hidden="true"><RitualCoco/><i/><i/><i/></div><div className="prayer-progress" aria-label={`Prayer step ${prayerStep + 1} of ${prayerSteps.length}`}>{prayerSteps.map((_, index) => <i key={index} className={index <= prayerStep ? 'done' : ''}/>)}</div><h3>{step.label}</h3><p>{step.copy}</p><button className="signature-primary" onClick={advancePrayer}>{prayerDone ? 'Back to the trip' : prayerSteps[prayerStep + 1].label}</button></section></div>;
}
