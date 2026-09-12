import { Box, Map, Sparkles } from 'lucide-react';

export type CompletedPanel = 'trunk' | 'photo' | 'ghost' | 'postcard' | 'recap' | null;

export function CompletedKeepLauncher({ active, onOpen }: { active: CompletedPanel; onOpen: (panel: Exclude<CompletedPanel, null>) => void }) {
  const open = (panel: Exclude<CompletedPanel, null>) => onOpen(panel);
  return <>
    <section className="completed-keep" aria-label="Keep the trip">
      <div><span>KEEP TRIP</span><h3>Choose what you want to carry forward.</h3></div>
      <div className="completed-keep-grid">
        <button className={active === 'trunk' ? 'active' : ''} onClick={() => open('trunk')}><Box size={18}/><b>Memory Trunk</b></button>
        <button className={active === 'photo' ? 'active' : ''} onClick={() => open('photo')}><Map size={18}/><b>Photo Map</b></button>
        <button className={active === 'ghost' ? 'active' : ''} onClick={() => open('ghost')}><Sparkles size={18}/><b>Ghost Wishes</b></button>
        <button className={active === 'postcard' ? 'active' : ''} onClick={() => open('postcard')}><Sparkles size={18}/><b>Future Postcard</b></button>
      </div>
    </section>
    <button type="button" className="completed-recap-entry" onClick={() => open('recap')}><span><small>TRIP RECAP</small><b>Review stops, spending, decisions, and sharing</b></span><span aria-hidden="true">→</span></button>
  </>;
}
