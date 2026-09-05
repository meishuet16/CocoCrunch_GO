import { useRitualSequence, type RitualStage } from '../../motion';
import { movementFrame, type CocoMovementDirection, type CocoPose } from './assets';
import { CocoCompanion } from './CocoCompanion';
import './CocoPathPreview.css';

/** Percent coordinates in a schematic drawing, never geographic coordinates. */
export type SchematicPoint = { readonly x: number; readonly y: number; readonly label?: string };
export type CocoPathPreviewProps = {
  readonly from?: SchematicPoint;
  readonly to?: SchematicPoint;
  /** Sets the default schematic segment. Explicit points determine their own facing. */
  readonly direction?: CocoMovementDirection;
};

export const schematicWalkStages: readonly RitualStage[] = [
  ...Array.from({ length: 8 }, (_, tick) => ({ name: `walk-${tick}`, durationMs: 140 })),
  { name: 'arrived' },
];

export function schematicFacing(from: SchematicPoint, to: SchematicPoint): CocoMovementDirection {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
}

export function walkPresentation(stage: string | null, direction: CocoMovementDirection, reducedMotion: boolean): {
  pose: CocoPose; progress: number;
} {
  if (reducedMotion) return { pose: movementFrame(direction, 0, true), progress: 1 };
  if (stage === 'arrived') return { pose: 'expression-happy', progress: 1 };
  const tick = Math.max(0, schematicWalkStages.findIndex(step => step.name === stage));
  return { pose: movementFrame(direction, tick, false), progress: tick / 8 };
}

const defaultSegments: Record<CocoMovementDirection, readonly [SchematicPoint, SchematicPoint]> = {
  right: [{ x: 10, y: 60 }, { x: 90, y: 40 }],
  left: [{ x: 90, y: 40 }, { x: 10, y: 60 }],
  down: [{ x: 40, y: 10 }, { x: 60, y: 90 }],
  up: [{ x: 60, y: 90 }, { x: 40, y: 10 }],
};

function Walk({ from, to }: { from: SchematicPoint; to: SchematicPoint }) {
  const { stage, start, busy, reducedMotion } = useRitualSequence(schematicWalkStages);
  const direction = schematicFacing(from, to);
  const { pose, progress } = walkPresentation(stage, direction, reducedMotion);
  const arrived = stage === 'arrived';
  const walking = busy && !reducedMotion;
  return <div className={`coco-path-preview${walking ? ' is-walking' : ''}${arrived ? ' is-arrived' : ''}`}
    data-direction={direction} data-reduced-motion={reducedMotion}>
    <p className="coco-path-label">{from.label ?? 'Start'} → {to.label ?? 'Destination'}</p>
    <div className="coco-path-track" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
        <circle cx={from.x} cy={from.y} r="2" />
        <circle cx={to.x} cy={to.y} r="2" />
      </svg>
      <span className="coco-path-sprite" style={{
        left: `${from.x + (to.x - from.x) * progress}%`,
        top: `${from.y + (to.y - from.y) * progress}%`,
        // No travel on initial render, replay reset, or preference changes.
        transition: !reducedMotion && stage !== null && stage !== 'walk-0'
          ? 'left 140ms linear, top 140ms linear' : 'none',
      }}><CocoCompanion context="traveling" pose={pose} size={72} /></span>
    </div>
    <button type="button" onClick={start} disabled={busy}>Preview schematic walk</button>
    <span className="coco-path-status" role="status" aria-live="polite">
      {arrived ? 'Schematic preview complete.' : walking ? 'Previewing schematic walk.' : 'Schematic preview ready.'}
    </span>
    <small>Schematic only · no live GPS or route guidance.</small>
  </div>;
}

export function CocoPathPreview({ direction = 'right', from, to }: CocoPathPreviewProps) {
  const [defaultFrom, defaultTo] = defaultSegments[direction];
  const origin = from ?? defaultFrom;
  const destination = to ?? defaultTo;
  // A changed segment unmounts the old subscription and cancels its choreography.
  const segmentKey = JSON.stringify([origin.x, origin.y, origin.label, destination.x, destination.y, destination.label]);
  return <Walk key={segmentKey} from={origin} to={destination} />;
}
