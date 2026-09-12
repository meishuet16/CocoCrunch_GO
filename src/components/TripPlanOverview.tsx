import { useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PlanHealth } from '../domain/plan-health';
import type { TripPlan } from '../domain/itinerary';
import type { TripIntent } from '../domain/trip-intent';
import { RecommendationEvidenceText } from './RecommendationEvidenceText';
import { TripSpatialView, type SpatialCandidate, type SpatialSource } from './TripSpatialView';
import { getStopThumbnail } from './explore/explorePhotos';

type TripPlanOverviewProps = {
  plan: TripPlan;
  planHealth: PlanHealth;
  tripIntent: TripIntent;
  onOpenWhy: (itemId: string) => void;
  onOpenHealth: () => void;
  onReorder?: (itemIds: string[]) => void;
  mapSource?: SpatialSource;
  mapCandidates?: SpatialCandidate[];
};

function SortableItineraryRow({ item, label, flexible, onOpenWhy }: { item: TripPlan['items'][number]; label: string; flexible: string; onOpenWhy: (itemId: string) => void }) {
  const sortable = useSortable({ id: item.id, disabled: item.protected });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  return <button ref={sortable.setNodeRef} style={style} className={`itinerary-row ${item.kind}`} key={item.id} onClick={() => onOpenWhy(item.id)} {...sortable.attributes} {...sortable.listeners} aria-label={item.protected ? `${item.name}, protected Must-Go item` : `Drag ${item.name} to reschedule`}>
    <time>{item.timeLabel}</time>
    <span className="itinerary-row-content">
      <small className="itinerary-row-label">{label}{item.protected ? ' · fixed' : ' · drag to reschedule'}</small>
      <b>{item.name}</b>
      <small>{item.kind === 'anchor' ? 'Must-Go · protected · cannot be AI-replaced' : `${item.kind} · ${flexible || 'flexible time'}`}</small>
      <small><strong>Why this?</strong> <RecommendationEvidenceText evidence={item.evidence} /></small>
    </span>
    <img className="itinerary-row-thumb" src={getStopThumbnail(item.name)} alt="" />
    <em>{label}</em>
  </button>;
}

function TransitDetail({ from, to }: { from: TripPlan['items'][number]; to: TripPlan['items'][number] }) {
  const walkingMinutes = Math.max(5, Math.round(to.walkingKm * 14));
  const walk = to.walkingKm <= 1.2;
  const transport = walk ? `Walk · about ${walkingMinutes} min` : `Local transit · about ${to.transferMinutes || 18} min · RM ${Math.max(3, Math.round(to.estimatedCost * .08))}`;
  const perPerson = to.estimatedCost ? `RM ${to.estimatedCost} per person` : 'No entry cost in prototype catalog';
  const hours = to.kind === 'open' ? 'Flexible window · no venue hours' : to.kind === 'buffer' ? 'Buffer · no venue hours' : 'Prototype hours · 09:00–18:00';
  return <div className="itinerary-transit-detail" aria-label={`Travel details from ${from.name} to ${to.name}`}><span>{transport}</span><small>{perPerson} · {hours}</small><em>Prototype route details · not live provider data</em></div>;
}

export function TripPlanOverview({ plan, planHealth, tripIntent, onOpenWhy, onOpenHealth, onReorder = () => undefined, mapSource, mapCandidates }: TripPlanOverviewProps) {
  const itemLabels = {
    anchor: 'Must-Go anchor',
    floating: 'Floating time',
    buffer: 'Buffer / breathing room',
    open: 'Open time',
  } as const;

  const dayCount = Math.min(3, Math.max(1, Math.ceil(plan.items.length / 2)));
  const [activeDay, setActiveDay] = useState(0);
  const itemsPerDay = Math.ceil(plan.items.length / dayCount);
  const visibleItems = plan.items.slice(activeDay * itemsPerDay, (activeDay + 1) * itemsPerDay);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = plan.items.findIndex(item => item.id === active.id);
    const newIndex = plan.items.findIndex(item => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0 || plan.items[oldIndex].protected) return;
    onReorder(arrayMove(plan.items.map(item => item.id), oldIndex, newIndex));
  };

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
        <p className="adapter-note">Drag flexible itinerary items to reschedule. Plan Health and feasibility use the reordered timeline.</p>
        <div className="itinerary-day-tabs" role="tablist" aria-label="Trip days">
          {Array.from({ length: dayCount }, (_, index) => <button type="button" role="tab" aria-selected={activeDay === index} className={activeDay === index ? 'active' : ''} key={index} onClick={() => setActiveDay(index)}>Day {index + 1}</button>)}
        </div>
        <div className="itinerary-map-card"><TripSpatialView mode="planning" destination={plan.destination} source={mapSource} candidates={mapCandidates} plan={plan} /></div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <div className="itinerary-timeline" aria-label={`Day ${activeDay + 1} trip timeline`}>{visibleItems.map((item, index) => <div key={item.id}><SortableItineraryRow item={item} label={itemLabels[item.kind]} flexible={tripIntent.flexible} onOpenWhy={onOpenWhy} />{visibleItems[index + 1] && <TransitDetail from={item} to={visibleItems[index + 1]} />}</div>)}</div>
          </SortableContext>
        </DndContext>
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
