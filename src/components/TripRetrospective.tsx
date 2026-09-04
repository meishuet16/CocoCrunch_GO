import type { LearningProposal } from '../domain/learning';
import type { TripReview } from '../domain/preferences';

export type RetrospectiveSummary = {
  pace: string;
  spent: number;
  decisions: number;
  outcomeRecorded?: boolean;
};

export type TripRetrospectiveProps = {
  actualSummary: RetrospectiveSummary;
  worthIt: TripReview | null;
  proposal: LearningProposal | null;
  learningConfirmed?: boolean;
  onRecordReflection: (value: TripReview) => void;
  onBuildProposal: () => void;
  onConfirmLearning: () => void;
  onDismissLearning: () => void;
  onOpenMemory: () => void;
};

const reviewLabels: Record<TripReview, string> = {
  yes: 'Worth it',
  mixed: 'Mixed',
  no: 'Not really',
};

function hasOutcomeEvidence(summary: RetrospectiveSummary): boolean {
  return summary.outcomeRecorded ?? summary.pace !== 'No completed pace signal yet';
}

export function TripRetrospective({
  actualSummary,
  worthIt,
  proposal,
  learningConfirmed = false,
  onRecordReflection,
  onBuildProposal,
  onConfirmLearning,
  onDismissLearning,
  onOpenMemory,
}: TripRetrospectiveProps) {
  const outcomeRecorded = hasOutcomeEvidence(actualSummary);
  const learningTerminal = learningConfirmed || proposal?.status === 'confirmed' || proposal?.status === 'dismissed';
  const memoryAvailable = outcomeRecorded && Boolean(worthIt) && learningTerminal;
  return <section className="trip-retrospective" aria-label="Trip retrospective">
    <div className="retrospective-step">
      <span>1 · ACTUAL OUTCOME</span>
      <b>{actualSummary.pace} · RM {actualSummary.spent} spent · {actualSummary.decisions} decisions</b>
      <small>{outcomeRecorded ? 'Recorded trip evidence can now inform reflection.' : 'Record a check-in, stop review, or other actual outcome before reflecting.'}</small>
    </div>
    <div className="retrospective-step">
      <span>2 · WORTH IT?</span>
      <div className="retrospective-choices">
        {(['yes', 'mixed', 'no'] as TripReview[]).map(value => <button
          type="button"
          key={value}
          className={worthIt === value ? 'active' : ''}
          disabled={!outcomeRecorded}
          onClick={() => onRecordReflection(value)}
        >{reviewLabels[value]}</button>)}
      </div>
      {!outcomeRecorded && <small>Reflection stays closed until actual outcome evidence exists.</small>}
    </div>
    <div className="retrospective-step">
      <span>3 · PROPOSED LEARNING</span>
      {proposal ? <>
        {proposal.changes.length > 0 ? proposal.changes.map(change => <p key={change.questionId}><b>{change.questionId}</b>: {change.beforeOptionId ?? 'none'} → {change.afterOptionId} · {change.reason}</p>) : <p>Coco found no answer change to propose from this reflection.</p>}
        {proposal.status === 'proposed' && <div className="retrospective-actions"><button type="button" className="primary" onClick={onConfirmLearning}>Confirm this learning</button><button type="button" className="secondary" onClick={onDismissLearning}>Dismiss</button></div>}
        {proposal.status === 'confirmed' && <small>Confirmed explicitly. Current Tingo dimensions are re-derived from the updated answers.</small>}
        {proposal.status === 'dismissed' && <small>Dismissed. Long-term Tingo was not changed.</small>}
      </> : learningConfirmed ? <small>Learning was confirmed explicitly; current Tingo is derived from its answer source.</small> : worthIt ? <button type="button" className="secondary" onClick={onBuildProposal}>Show what Coco learned</button> : <small>Choose Worth It before learning can be proposed.</small>}
    </div>
    <button type="button" className="secondary retrospective-memory" disabled={!memoryAvailable} onClick={onOpenMemory}>Keep the memory</button>
    {!memoryAvailable && <small className="retrospective-memory-note">Keep the memory after the learning handoff is confirmed or dismissed.</small>}
  </section>;
}
