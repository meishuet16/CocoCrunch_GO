import { useEffect, useState } from 'react';
import { BatteryCharging, Camera, Shirt, Ticket, Umbrella, Wifi, X } from 'lucide-react';
import { playSound } from './sound';
import './packing-replica.css';

type PackedState = [boolean, boolean, boolean];

const readPacked = (): PackedState => {
  const rows = Array.from(document.querySelectorAll<HTMLButtonElement>('.drawer .pack-row'));
  return [0, 1, 2].map(index => rows[index]?.classList.contains('done') ?? false) as PackedState;
};

export default function PackingReplica() {
  const [visible, setVisible] = useState(false);
  const [packed, setPacked] = useState<PackedState>([false, false, false]);
  const [lastPacked, setLastPacked] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => {
      const drawer = document.querySelector('.drawer');
      const hasPacking = Boolean(drawer?.querySelector('.pack-row'));
      setVisible(hasPacking);
      if (hasPacking) setPacked(readPacked());
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  const toggle = (index: number) => {
    const row = document.querySelectorAll<HTMLButtonElement>('.drawer .pack-row')[index];
    if (!row) return;
    setLastPacked(index);
    row.click();
    playSound('save');
    window.setTimeout(() => {
      setPacked(readPacked());
      setLastPacked(null);
    }, 620);
  };

  const close = () => {
    document.querySelector<HTMLButtonElement>('.drawer .close')?.click();
  };

  const complete = packed.every(Boolean);
  const count = packed.filter(Boolean).length;

  return <div className="pack-replica-overlay" role="dialog" aria-modal="true" aria-label="Pack a bag">
    <section className={`pack-replica ${complete ? 'is-ready' : ''}`}>
      <button className="pack-replica-close" onClick={close} aria-label="Close packing"><X size={18}/></button>
      <header className="pack-replica-head">
        <span>PACK A BAG</span>
        <h2>Choose 3 things</h2>
      </header>

      <div className="pack-playfield">
        <span className="pack-doodle pack-doodle-ticket"><Ticket size={25}/></span>
        <span className="pack-doodle pack-doodle-camera"><Camera size={29}/></span>
        <span className="pack-doodle pack-doodle-shirt"><Shirt size={30}/></span>
        <span className="pack-doodle pack-doodle-star">✦</span>
        <span className="pack-doodle pack-doodle-scribble">〰</span>

        <button className={`loose-item charger ${packed[0] ? 'packed' : ''} ${lastPacked === 0 ? 'is-flying' : ''}`} onClick={() => toggle(0)} aria-label="Pack portable charger">
          <BatteryCharging size={34}/><small>charger</small>
        </button>
        <button className={`loose-item umbrella ${packed[1] ? 'packed' : ''} ${lastPacked === 1 ? 'is-flying' : ''}`} onClick={() => toggle(1)} aria-label="Pack umbrella">
          <Umbrella size={39}/><small>umbrella</small>
        </button>
        <button className={`loose-item wifi ${packed[2] ? 'packed' : ''} ${lastPacked === 2 ? 'is-flying' : ''}`} onClick={() => toggle(2)} aria-label="Pack pocket Wi-Fi">
          <Wifi size={35}/><small>Wi-Fi</small>
        </button>

        <div className="replica-suitcase" aria-hidden="true">
          <div className="replica-case-lid">
            <span className="lid-pocket"/>
            <span className="lid-shirt">▰</span>
            <span className="lid-note">TOKYO</span>
          </div>
          <div className="replica-case-base">
            <span className="case-fold f1"/><span className="case-fold f2"/>
            <span className="case-belt"/>
            <span className={`inside-item in-charger ${packed[0] ? 'show' : ''}`}><BatteryCharging size={22}/></span>
            <span className={`inside-item in-umbrella ${packed[1] ? 'show' : ''}`}><Umbrella size={24}/></span>
            <span className={`inside-item in-wifi ${packed[2] ? 'show' : ''}`}><Wifi size={22}/></span>
          </div>
          <div className="replica-coco"><i/><b>COCO</b></div>
        </div>
      </div>

      <div className="pack-slots" aria-label={`${count} of 3 packed`}>
        <button className={packed[0] ? 'filled' : ''} onClick={() => toggle(0)}><BatteryCharging size={18}/><small>Charge</small></button>
        <button className={packed[1] ? 'filled' : ''} onClick={() => toggle(1)}><Umbrella size={18}/><small>Rain</small></button>
        <button className={packed[2] ? 'filled' : ''} onClick={() => toggle(2)}><Wifi size={18}/><small>Wi-Fi</small></button>
      </div>

      <button className="pack-ready" disabled={!complete} onClick={close}>
        <span>{complete ? 'READY TO GO' : `${count} / 3 PACKED`}</span>
        <b>{complete ? '→' : 'pack the glowing items'}</b>
      </button>
    </section>
  </div>;
}
