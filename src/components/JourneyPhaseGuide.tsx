type PhaseGuideButtonProps = {
  onOpenTrip: () => void;
};

export function CompletedLearningGuide() {
  return <section className="completed-guide" aria-label="Completed reflection and learning sequence">
    <span>AFTER · REVIEW BEFORE KEEPSAKES</span>
    <h3>Actual outcome first. Learning stays yours.</h3>
    <div className="completed-guide-steps" aria-label="Outcome to confirmation sequence"><span><b>1</b>Actual outcome</span><i aria-hidden="true">→</i><span><b>2</b>Worth It / reflection</span><i aria-hidden="true">→</i><span><b>3</b>Proposed learning</span><i aria-hidden="true">→</i><span><b>4</b>Explicit confirmation</span></div>
    <small>Only after explicit confirmation can Memory Trunk, Photo Map, Ghost Wish, Future Postcard, or sharing become expressive.</small>
  </section>;
}

export function MemoryArchiveGuide({ onOpenTrip }: PhaseGuideButtonProps) {
  return <section className="memory-loop-card" aria-label="Retrospective doorway">
    <div><span>RETROSPECTIVE FIRST</span><h3>Review first, then keep the memory.</h3><p>Open the completed trip to review actual outcome → Worth It/reflection → proposed learning. Long-term Tingo changes only after explicit confirmation.</p></div>
    <button className="primary" onClick={onOpenTrip}>Review active trip</button>
  </section>;
}

export function ExplorePlanningGuide({ onOpenTrip }: PhaseGuideButtonProps) {
  return <section className="explore-planning-note" aria-label="Explore planning handoff">
    <div><span>FEED THE ACTIVE TRIP</span><h3>Save idea → Suggest to group</h3><small>Save an idea for the active trip, then suggest it to the group; it never edits the official itinerary or bypasses Group Court.</small></div>
    <button className="secondary" onClick={onOpenTrip}>Open active trip</button>
  </section>;
}

export function TingoOwnershipGuide() {
  return <section className="tingo-ownership-note" aria-label="Tingo ownership">
    <span>LONG-TERM IDENTITY</span>
    <b>Tingo is persistent, editable, and separate from this trip’s Vibe and constraints.</b>
    <small>Review, retake, or update your Tingo Card intentionally. Trip learning is proposed first and never silently overwrites it.</small>
  </section>;
}
