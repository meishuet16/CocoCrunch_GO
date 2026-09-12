import { useState } from 'react';

type CocoAssistantPromptProps = {
  mode: 'solo' | 'group';
  destination: string;
  onReviewProposal: () => void;
};

export function CocoAssistantPrompt({ mode, destination, onReviewProposal }: CocoAssistantPromptProps) {
  const [prompt, setPrompt] = useState('Can we make the afternoon gentler?');
  const [answered, setAnswered] = useState(false);
  const cleanPrompt = prompt.trim();
  return <>
    <span className="drawer-kicker">ASK COCO</span>
    <h3>Ask about this trip in your own words.</h3>
    <p className="drawer-copy">Coco reads only the current local plan. It can prepare a reversible suggestion, but it does not make the change for you.</p>
    <label className="setup-field"><span>Your question</span><textarea aria-label="Ask Coco about this trip" value={prompt} onChange={event => { setPrompt(event.target.value); setAnswered(false); }}/></label>
    <button className="primary" disabled={!cleanPrompt} onClick={() => setAnswered(true)}>Ask Coco</button>
    {answered && <section className="adapter-note" aria-live="polite"><b>Plan-aware draft for {destination}</b><small>“{cleanPrompt}”</small><small>Coco would preserve every Must-Go anchor and first look for a floating block or recovery time to soften.</small><small>{mode === 'group' ? 'This is a proposal only. Applying it will open Group Court.' : 'This is a proposal only. You can review the exact change before confirming it.'}</small><button className="secondary" onClick={onReviewProposal}>Review suggested change</button></section>}
  </>;
}
