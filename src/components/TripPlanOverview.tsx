import type { PlanHealth } from '../domain/plan-health';
import type { TripPlan } from '../domain/itinerary';
import type { TripIntent } from '../domain/trip-intent';
import { RecommendationEvidenceText } from './RecommendationEvidenceText';

type TripPlanOverviewProps = {
  plan: TripPlan;
  planHealth: PlanHealth;
  tripIntent: TripIntent;
  onOpenWhy: (itemId: string) => void;
  onOpenHealth: () => void;
};

export function TripPlanOverview({ plan, planHealth, tripIntent, onOpenWhy, onOpenHealth }: TripPlanOverviewProps) {
  return (
    <section className="trip-plan-overview">
      <div className="trip-promise paper-strip">
        <span>TRIP PROMISE</span>
        <b>{plan.tripPromise}</b>
      </div>
      <section className="itinerary-sheet paper-sheet">
        <div className="sheet-heading">
          <div><span>GENERATED PLAN</span><h3>{plan.destination} · reviewable timeline</h3></div>
          <div className="score-stamp">{planHealth.overall}</div>
        </div>
        {plan.items.map(item => (
          <button className={`itinerary-row ${item.kind}`} key={item.id} onClick={() => onOpenWhy(item.id)}>
            <time>{item.timeLabel}</time>
            <span>
              <b>{item.name}</b>
              <small>{item.kind === 'anchor' ? 'Must-Go · protected · cannot be AI-replaced' : `${item.kind} · ${tripIntent.flexible || 'flexible time'}`}</small>
              <small><strong>Why this?</strong> <RecommendationEvidenceText evidence={item.evidence} /></small>
            </span>
            <em>{item.kind}</em>
          </button>
        ))}
      </section>
      <section className="plan-health plan-health--overview">
        <button className="section-rule" onClick={onOpenHealth}>
          <span>PLAN HEALTH · {planHealth.overall}/100</span>
          <span>View reasons <span aria-hidden="true">›</span></span>
        </button>
        <p>{planHealth.reasons[0] ?? 'No current deductions; inputs fit the generated structure.'}</p>
        <div className="health-metrics">
          <span>Walk <b>{planHealth.metrics.walkingKm.toFixed(1)} km</b></span>
          <span>Pressure <b>{planHealth.metrics.timePressureMinutes} min</b></span>
          <span>Budget <b>{planHealth.metrics.budgetOverrun ? `RM ${planHealth.metrics.budgetOverrun} over` : 'Within cap'}</b></span>
          <span>Anchors <b>{planHealth.metrics.protectedAnchors} protected</b></span>
          <span>Risks <b>{planHealth.metrics.unresolvedRisks}</b></span>
        </div>
      </section>
    </section>
  );
}
