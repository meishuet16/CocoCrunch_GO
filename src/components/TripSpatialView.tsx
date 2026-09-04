import type { ReactNode } from 'react';
import type { TripPlan } from '../domain/itinerary';

export type SpatialMode = 'planning' | 'traveling' | 'completed';
export type SpatialSource = 'local-schematic' | 'prototype-catalog' | 'photo-metadata' | 'unavailable';
export type SpatialPrivacy = 'status' | 'area' | 'exact';

export type SpatialCandidate = {
  id: string;
  name: string;
  source: 'prototype-catalog' | 'fallback';
};

export type SpatialStopSnapshot = {
  name: string;
  timeLabel: string;
};

export type SpatialPhotoSummary = {
  imported: number;
  grouped: number;
  note?: string;
};

type TripSpatialViewProps = {
  mode: SpatialMode;
  destination: string;
  plan: TripPlan;
  source?: SpatialSource;
  candidates?: SpatialCandidate[];
  currentItem?: SpatialStopSnapshot;
  nextItem?: SpatialStopSnapshot;
  reunionLabel?: string;
  privacy?: SpatialPrivacy;
  disruptionLabel?: string;
  photoSummary?: SpatialPhotoSummary;
  overlay?: ReactNode;
};

const sourceLabels: Record<SpatialSource, string> = {
  'local-schematic': 'Local schematic · trip context only',
  'prototype-catalog': 'Prototype catalog candidates · planning context only',
  'photo-metadata': 'Imported photo metadata · no live location',
  unavailable: 'Spatial data unavailable',
};

const modeLabels: Record<SpatialMode, string> = {
  planning: 'MAP',
  traveling: 'MAP',
  completed: 'PHOTO MAP',
};

const stopPositions = [
  { x: 25, y: 135 },
  { x: 118, y: 96 },
  { x: 205, y: 88 },
  { x: 315, y: 42 },
];

function toneForKind(kind: TripPlan['items'][number]['kind']) {
  if (kind === 'anchor') return 'anchor';
  if (kind === 'floating') return 'floating';
  if (kind === 'open') return 'open';
  return 'buffer';
}

export function TripSpatialView({
  mode,
  destination,
  plan,
  source = 'local-schematic',
  candidates = [],
  currentItem,
  nextItem,
  reunionLabel,
  privacy,
  disruptionLabel,
  photoSummary,
  overlay,
}: TripSpatialViewProps) {
  const visibleStops = plan.items.filter(item => item.kind !== 'buffer').slice(0, stopPositions.length);
  const privacyLabel = privacy ? `Sharing: ${privacy === 'exact' ? 'exact location' : privacy === 'area' ? 'approx. area' : 'status only'}` : null;

  return (
    <section className={`trip-spatial-view paper-sheet spatial-secondary spatial-${mode} spatial-source-${source}`}>
      <div className="section-rule spatial-rule">
        <span>
          {modeLabels[mode]} · {destination.toUpperCase()}
        </span>
        <small>{sourceLabels[source]}</small>
      </div>

      <div className={`spatial-stage ${source === 'unavailable' ? 'is-unavailable' : ''}`}>
        <svg viewBox="0 0 340 180" role="img" aria-label={`${destination} ${mode} contextual spatial view`}>
          <path d="M25 135 C78 64 132 126 185 85 S265 52 315 42" />
          {visibleStops.map((item, index) => {
            const point = stopPositions[index];
            if (!point) return null;
            return (
              <g className={`spatial-node ${toneForKind(item.kind)}`} key={item.id}>
                <circle cx={point.x} cy={point.y} r={index === visibleStops.length - 1 ? 7 : 6} />
                <text x={point.x} y={point.y - 14} textAnchor="middle">
                  {index + 1}
                </text>
              </g>
            );
          })}
        </svg>
        {overlay && <div className="spatial-overlay">{overlay}</div>}
      </div>

      {source === 'unavailable' ? (
        <p className="spatial-empty">No saved schematic or imported metadata is available for this view yet.</p>
      ) : (
        <div className="spatial-stop-list">
          {visibleStops.map(item => (
            <article className={`spatial-stop-card ${toneForKind(item.kind)}`} key={item.id}>
              <span>{mode === 'completed' && item.kind === 'anchor' ? 'Travelled' : item.kind}</span>
              <b>{item.name}</b>
              <small>{item.timeLabel}</small>
            </article>
          ))}
        </div>
      )}

      {mode === 'planning' && (
        <>
          <div className="spatial-context-grid">
            <article>
              <span>Planned stops</span>
              <b>{visibleStops.length} in view</b>
              <small>Anchor and flexible blocks come from the saved trip plan.</small>
            </article>
            <article>
              <span>Candidates</span>
              <b>{candidates.length} nearby ideas</b>
              <small>Catalog and fallback examples stay labeled as planning inputs.</small>
            </article>
          </div>
          {candidates.length > 0 ? (
            <div className="spatial-chip-list">
              {candidates.map(candidate => (
                <span className={`spatial-chip ${candidate.source === 'prototype-catalog' ? 'catalog' : 'fallback'}`} key={candidate.id}>
                  {candidate.name}
                </span>
              ))}
            </div>
          ) : (
            <small className="spatial-detail">No planning candidates are attached to this view yet.</small>
          )}
          <div className="adapter-note">
            <b>Planning context only</b>
            <small>No live routing, traffic, travel time, weather, or place status is connected.</small>
          </div>
        </>
      )}

      {mode === 'traveling' && (
        <>
          <div className="spatial-context-grid">
            <article>
              <span>Current</span>
              <b>{currentItem ? `${currentItem.name} · ${currentItem.timeLabel}` : 'Current stop unavailable'}</b>
              <small>Shown from saved trip state only.</small>
            </article>
            <article>
              <span>Next</span>
              <b>{nextItem ? `${nextItem.name} · ${nextItem.timeLabel}` : 'Next stop pending review'}</b>
              <small>{disruptionLabel ?? 'The plan remains schematic in transit.'}</small>
            </article>
            {reunionLabel && (
              <article>
                <span>Reunion</span>
                <b>{reunionLabel}</b>
                <small>Shared agreement, not turn-by-turn guidance.</small>
              </article>
            )}
            {privacyLabel && (
              <article>
                <span>Privacy</span>
                <b>{privacyLabel}</b>
                <small>Family Window stays reassurance-first.</small>
              </article>
            )}
          </div>
          <small className="spatial-detail spatial-detail--saved">Saved current · next · reunion context</small>
          <div className="adapter-note">
            <b>Travel context only</b>
            <small>Current and next stops come from saved trip state and manual check-ins only.</small>
          </div>
        </>
      )}

      {mode === 'completed' && (
        <>
          <div className="spatial-context-grid">
            <article>
              <span>Travelled</span>
              <b>{visibleStops.length} saved stops</b>
              <small>Shown from the kept trip timeline, not an inferred route.</small>
            </article>
            <article>
              <span>Photos</span>
              <b>{photoSummary ? `${photoSummary.imported} photos indexed` : 'No imported photo metadata'}</b>
              <small>{photoSummary ? `${photoSummary.grouped} areas grouped` : 'Import metadata to place photos on this view.'}</small>
            </article>
          </div>
          {photoSummary && (
            <div className="spatial-closure-cue">
              <span>Closure</span>
              <b>{photoSummary.imported} photos saved · {photoSummary.grouped} areas grouped</b>
              <small>Imported memory closes this kept trip context without inferring the route.</small>
            </div>
          )}
          {photoSummary?.note && <small className="spatial-detail">{photoSummary.note}</small>}
          <div className="adapter-note">
            <b>Retrospective map boundary</b>
            <small>Photo Map shows imported metadata only; it does not infer the route between stops.</small>
          </div>
        </>
      )}
    </section>
  );
}
