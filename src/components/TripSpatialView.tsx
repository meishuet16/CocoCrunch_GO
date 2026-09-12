import type { ReactNode } from 'react';
import type { TripPlan } from '../domain/itinerary';
import { CocoPathPreview } from './coco/CocoPathPreview';

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

export type SpatialLiveRoute = {
  currentLocation: string;
  target: string;
  eta: string;
  timelineLabel: string;
  weatherLabel: string;
};

export type SpatialServicePin = {
  id: string;
  label: string;
  query: string;
  kind: 'hospital' | 'pharmacy' | 'luggage';
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
  liveRoute?: SpatialLiveRoute;
  servicePins?: SpatialServicePin[];
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
  liveRoute,
  servicePins = [],
  overlay,
}: TripSpatialViewProps) {
  const visibleStops = plan.items.filter(item => item.kind !== 'buffer').slice(0, stopPositions.length);
  const previewFromIndex = currentItem
    ? visibleStops.findIndex(item => item.name === currentItem.name && item.timeLabel === currentItem.timeLabel)
    : 0;
  const previewToIndex = nextItem
    ? visibleStops.findIndex(item => item.name === nextItem.name && item.timeLabel === nextItem.timeLabel)
    : previewFromIndex + 1;
  const canPreviewWalk = mode === 'traveling' && source === 'local-schematic'
    && previewFromIndex >= 0 && previewToIndex >= 0 && previewFromIndex !== previewToIndex
    && Boolean(visibleStops[previewFromIndex] && visibleStops[previewToIndex]);
  const privacyLabel = privacy ? `Sharing: ${privacy === 'exact' ? 'exact location' : privacy === 'area' ? 'approx. area' : 'status only'}` : null;
  const travelingContextParts = [
    currentItem ? 'current' : null,
    nextItem ? 'next' : null,
    reunionLabel ? 'reunion' : null,
  ].filter((value): value is string => value !== null);

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
          {mode === 'traveling' && liveRoute && <g className="spatial-live-marker" aria-label={`Current prototype location: ${liveRoute.currentLocation}`}>
            <circle cx="72" cy="112" r="8" />
            <circle cx="72" cy="112" r="3" />
          </g>}
          {mode === 'traveling' && servicePins.map((pin, index) => {
            const point = [{ x: 250, y: 122 }, { x: 290, y: 142 }, { x: 174, y: 135 }][index];
            if (!point) return null;
            return <a className={`spatial-service-pin ${pin.kind}`} href={`https://maps.google.com/?q=${encodeURIComponent(pin.query)}`} target="_blank" rel="noreferrer" key={pin.id} aria-label={`Navigate to ${pin.label} in a map app (prototype link)`}>
              <circle cx={point.x} cy={point.y} r="8" />
              <text x={point.x} y={point.y + 3} textAnchor="middle">{pin.kind === 'hospital' ? 'H' : pin.kind === 'pharmacy' ? 'P' : 'L'}</text>
            </a>;
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
          {liveRoute && <section className="spatial-live-route" aria-label="Live routing prototype">
            <div><span>LIVE ROUTING · PROTOTYPE</span><b>{liveRoute.currentLocation} → {liveRoute.target}</b><small>{liveRoute.eta} · {liveRoute.timelineLabel}</small></div>
            <small>{liveRoute.weatherLabel}</small>
          </section>}
          {servicePins.length > 0 && <div className="spatial-service-pins" aria-label="Nearby service prototype pins">
            <span>NEARBY HELP · PROTOTYPE</span>
            {servicePins.map(pin => <a href={`https://maps.google.com/?q=${encodeURIComponent(pin.query)}`} target="_blank" rel="noreferrer" key={pin.id}>{pin.label} ↗</a>)}
          </div>}
          {canPreviewWalk && <CocoPathPreview
            from={{ x: stopPositions[previewFromIndex].x / 340 * 100, y: stopPositions[previewFromIndex].y / 180 * 100, label: visibleStops[previewFromIndex].name }}
            to={{ x: stopPositions[previewToIndex].x / 340 * 100, y: stopPositions[previewToIndex].y / 180 * 100, label: visibleStops[previewToIndex].name }}
          />}
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
          {travelingContextParts.length > 0 && (
            <small className="spatial-detail spatial-detail--saved">Saved {travelingContextParts.join(' · ')} context</small>
          )}
          <div className="adapter-note">
            <b>{liveRoute ? 'Prototype routing boundary' : 'Travel context only'}</b>
            <small>{liveRoute ? 'Current and next stops come from saved trip state and manual check-ins only. The route is a local schematic; weather is refreshed by Open-Meteo above, with no device location, traffic, or turn-by-turn navigation connected.' : 'Current and next stops come from saved trip state and manual check-ins only.'}</small>
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
              <b>{photoSummary.imported} imported photos indexed · {photoSummary.grouped} areas grouped</b>
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
