export type PrivacyLevel = 'status' | 'area' | 'exact';

type SharingPanelBaseProps = {
  privacy: PrivacyLevel;
  continuousLocation: boolean;
  reported: boolean;
  delayed: boolean;
  destination: string;
};

type FamilyWindowPanelProps = SharingPanelBaseProps & {
  onReviewLocation: () => void;
  onSendReassurance: () => void;
};

type LocationPrivacyPanelProps = Pick<SharingPanelBaseProps, 'privacy' | 'continuousLocation'> & {
  onOpenFamily: () => void;
  onPrivacyChange: (level: PrivacyLevel) => void;
};

function precisionLabel(privacy: PrivacyLevel): string {
  if (privacy === 'area') return 'Approximate area';
  if (privacy === 'exact') return 'A previously saved precision choice';
  return 'Status only';
}

export function FamilyWindowPanel({
  privacy,
  continuousLocation,
  reported,
  delayed,
  destination,
  onReviewLocation,
  onSendReassurance,
}: FamilyWindowPanelProps) {
  return <section className="sharing-panel family-window-panel">
    <span className="drawer-kicker">FAMILY WINDOW</span>
    <h3>Choose what family can see.</h3>
    <p className="drawer-copy">A trip and safety preview you intentionally send — not a live tracking screen.</p>
    <div className="porch-light"><span className="lantern">◉</span><div><b>{delayed ? 'Plan changed. The group is safe.' : 'The trip is moving as planned.'}</b><small>{reported ? 'Latest reassurance is ready to share.' : 'You choose when to send reassurance.'}</small></div></div>
    <div className="family-preview"><span>FAMILY PREVIEW</span><div><b>{destination} · {delayed ? 'Today changed' : 'Today’s status'}</b><small>{delayed ? 'A plan adjustment is being reviewed.' : 'The current journey phase and shared status.'}</small></div><div><b>Location sharing</b><small>{continuousLocation ? 'Separate consent was saved; provider data is unavailable here.' : `${precisionLabel(privacy)} · manual updates still work.`}</small></div></div>
    <div className="family-location-boundary"><div><b>Location Privacy</b><small>Managed separately from family sharing.</small></div><button className="secondary" onClick={onReviewLocation}>Review location privacy</button></div>
    <button className="courier-button" onClick={onSendReassurance}>{reported ? 'Send updated reassurance' : 'Send reassurance with Coco'}</button>
  </section>;
}

export function LocationPrivacyPanel({
  privacy,
  continuousLocation,
  onOpenFamily,
  onPrivacyChange,
}: LocationPrivacyPanelProps) {
  return <section className="sharing-panel location-privacy-panel">
    <span className="drawer-kicker">LOCATION PRIVACY</span>
    <h3>What location may CocoCrunch use?</h3>
    <p className="drawer-copy">Manual check-in remains available without location permission. This prototype has no live GPS, route, traffic, or provider feed.</p>
    <div className="privacy-grid"><button className={privacy === 'status' ? 'active' : ''} onClick={() => onPrivacyChange('status')}>Status only</button><button className={privacy === 'area' ? 'active' : ''} onClick={() => onPrivacyChange('area')}>Approx. area</button><button className={`unavailable ${privacy === 'exact' ? 'saved' : ''}`} disabled>Exact location · unavailable here</button></div>
    <div className="location-provider-note"><b>Provider boundary</b><small>Exact location and continuous live updates are unavailable in this local prototype. Nothing is enabled from Family Window.</small></div>
    <div className="toggle-row location-unavailable"><span><b>Continuous location</b><small>{continuousLocation ? 'Saved consent exists, but no provider data is being read here.' : 'Unavailable in this prototype · off by default.'}</small></span><span className="status-pill">Unavailable</span></div>
    <div className="family-location-boundary"><div><b>Family Window</b><small>Trip and safety sharing is managed separately.</small></div><button className="secondary" onClick={onOpenFamily}>Open Family Window</button></div>
  </section>;
}
