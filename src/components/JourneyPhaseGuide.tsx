type PhaseGuideButtonProps = {
  onOpenTrip: () => void;
};

export function CompletedLearningGuide() {
  return <section className="completed-guide" aria-label="Completed learning loop">
    <span>AFTER · LEARNING LOOP</span>
    <h3>Actual outcome first. Learning stays yours.</h3>
    <div className="completed-guide-steps"><span><b>1</b>Actual outcome</span><i>→</i><span><b>2</b>Worth It / reflection</span><i>→</i><span><b>3</b>Proposed learning</span></div>
    <small>Memory Trunk, Photo Map, and sharing sit around this review; they do not replace it.</small>
  </section>;
}

export function MemoryArchiveGuide({ onOpenTrip }: PhaseGuideButtonProps) {
  return <section className="memory-loop-card" aria-label="Retrospective doorway">
    <div><span>RETROSPECTIVE FIRST</span><h3>Close the loop before the keepsake shelf.</h3><p>Open the completed trip to review actual outcome → Worth It/reflection → proposed learning. Long-term Tingo changes only after explicit confirmation.</p></div>
    <button className="primary" onClick={onOpenTrip}>Review active trip</button>
  </section>;
}

export function ExplorePlanningGuide({ onOpenTrip }: PhaseGuideButtonProps) {
  return <section className="explore-planning-note" aria-label="Explore planning handoff">
    <div><span>FEED THE ACTIVE TRIP</span><h3>Save an idea, then let the group decide.</h3><small>Explore can suggest ideas; it never edits the official itinerary or bypasses Group Court.</small></div>
    <button className="secondary" onClick={onOpenTrip}>Open active trip</button>
  </section>;
}

export function TingoOwnershipGuide() {
  return <section className="tingo-ownership-note" aria-label="Tingo ownership">
    <span>LONG-TERM IDENTITY</span>
    <b>Tingo is persistent, editable, and separate from this trip’s Vibe and constraints.</b>
    <small>Review or intentionally retake the Tingo Card when you want to update it. Trip learning is proposed first and never silently overwrites it.</small>
  </section>;
}
