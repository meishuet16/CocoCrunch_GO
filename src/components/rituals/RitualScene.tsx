import { useEffect, useId, useRef, type ReactNode } from 'react';

export function RitualDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = ref.current!;
    panel.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [href], [tabindex="0"]')).filter(node => !node.hidden);
      const first = items[0]; const last = items[items.length - 1];
      if (!first) { event.preventDefault(); panel.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) { event.preventDefault(); first.focus(); }
    };
    const contain = (event: FocusEvent) => { if (!panel.contains(event.target as Node)) panel.focus(); };
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('focusin', contain);
    return () => {
      document.removeEventListener('keydown', keydown, true);
      document.removeEventListener('focusin', contain);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <div className="ritual-v2"><section ref={ref} className="rv-panel" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}>
    <button type="button" className="rv-close" onClick={onClose} aria-label="Close ritual">×</button>
    <p className="rv-eyebrow">COCOCRUNCH · A SMALL RITUAL</p><h2 id={id}>{title}</h2>{children}
  </section></div>;
}

export function PaperScene({ stage, text, talisman = false }: { stage: string; text: string; talisman?: boolean }) {
  return <div className="rv-burn rv-scene" data-stage={stage} aria-hidden="true">
    <div className={`rv-paper ${talisman ? 'rv-talisman' : ''}`}><span>{text}</span><i className="rv-ember"/></div>
    <div className="rv-fire"><i/><i/><i/></div><div className="rv-ash"><i/><i/><i/></div><div className="rv-brazier"/>
  </div>;
}
