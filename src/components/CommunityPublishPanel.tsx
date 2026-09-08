import { useState } from 'react';

export function CommunityPublishPanel({ published, onChange }: { published: boolean; onChange: (published: boolean) => void }) {
  const [title, setTitle] = useState('My CocoCrunch trip');
  const [consent, setConsent] = useState(false);
  const [shareMemories, setShareMemories] = useState(false);
  return <section className="publish-row community-publish-panel">
    <div>
      <span>YOUR TRIP</span>
      <b>{published ? 'Published with consent' : 'Private by default'}</b>
      <small>Review exactly what other people can see before publishing.</small>
      {!published && <><label className="setup-field"><span>Community title</span><input value={title} onChange={event => setTitle(event.target.value)} aria-label="Community trip title"/></label><label className="toggle-row"><span><b>Include selected memories</b><small>Only explicitly selected memories may be shared.</small></span><input type="checkbox" checked={shareMemories} onChange={event => setShareMemories(event.target.checked)}/></label><label className="toggle-row"><span><b>I confirm this trip can be public</b><small>Personal, group and location data stay private unless separately selected.</small></span><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/></label></>}
    </div>
    <button disabled={!published && (!consent || !title.trim())} onClick={() => onChange(!published)}>{published ? 'Unpublish now' : 'Publish trip'}</button>
  </section>;
}
