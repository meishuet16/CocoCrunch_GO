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
    <h3>Ask Coco</h3>
    <label className="setup-field coco-chat-input"><textarea aria-label="Ask Coco about this trip" placeholder="Ask about your trip…" value={prompt} onChange={event => { setPrompt(event.target.value); setAnswered(false); }}/></label>
    <button className="primary" disabled={!cleanPrompt} onClick={() => setAnswered(true)}>Send</button>
    {answered && <section className="adapter-note coco-chat-reply" aria-live="polite"><b>Coco</b><small>“{cleanPrompt}”</small><small>{mode === 'group' ? 'Ready to review with the group.' : `Ready to review for ${destination}.`}</small><button className="secondary" onClick={onReviewProposal}>Review suggestion</button></section>}
  </>;
}
