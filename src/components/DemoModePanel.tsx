export function DemoModePanel({ onClose }: { onClose: () => void }) {
  return <section className="paper-sheet" aria-label="Demo mode information">
    <span className="drawer-kicker">DEMO MODE</span>
    <h3>How this version works</h3>
    <p className="drawer-copy">Your trip changes are stored locally on this device. CocoCrunch does not contact SMS, airline, hotel, map, messaging, or payment providers from this app.</p>
    <p className="adapter-note">Availability, prices, routes, recommendations, and check-ins use example data unless a screen says otherwise.</p>
    <button className="primary" onClick={onClose}>Got it</button>
  </section>;
}
