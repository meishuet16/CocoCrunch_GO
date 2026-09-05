import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRitualSequenceStore } from '../../motion/useRitualSequence';
import { type CocoMovementDirection, movementFrame } from './assets';
import { CocoPathPreview, schematicFacing, schematicWalkStages, walkPresentation } from './CocoPathPreview';
import { TripSpatialView } from '../TripSpatialView';
import type { TripPlan } from '../../domain/itinerary';

describe('Coco schematic walk', () => {
  const cleanups: (() => void)[] = [];
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanups.splice(0).forEach(cleanup => cleanup());
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each([
    ['right', 90, 60], ['left', 10, 40], ['down', 60, 90], ['up', 40, 10],
  ] as const)('derives %s facing from the dominant schematic displacement', (direction, x, y) => {
    expect(schematicFacing({ x: 50, y: 50 }, { x, y })).toBe(direction);
  });

  it.each<CocoMovementDirection>(['down', 'left', 'right', 'up'])('walks through all four actual %s assets and finishes happy', direction => {
    const store = createRitualSequenceStore(schematicWalkStages);
    cleanups.push(store.subscribe(() => {}));
    expect(store.getSnapshot().stage).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    expect(store.start()).toBe(true);
    expect(store.start()).toBe(false);
    for (let tick = 0; tick < 8; tick++) {
      const frame = walkPresentation(store.getSnapshot().stage, direction, false);
      expect(frame.pose).toBe(movementFrame(direction, tick, false));
      expect(frame.progress).toBe(tick / 8);
      vi.advanceTimersByTime(140);
    }
    expect(store.getSnapshot()).toMatchObject({ stage: 'arrived', busy: false });
    expect(walkPresentation('arrived', direction, false)).toEqual({ pose: 'expression-happy', progress: 1 });
    vi.advanceTimersByTime(60_000);
    expect(store.getSnapshot().stage).toBe('arrived');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('uses a static destination pose when reduced and cancels on a live preference change', () => {
    let reduced = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal('window', { matchMedia: () => ({
      get matches() { return reduced; },
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    }) });
    const store = createRitualSequenceStore(schematicWalkStages);
    cleanups.push(store.subscribe(() => {}));
    store.start();
    vi.advanceTimersByTime(280);
    reduced = true;
    listeners.forEach(listener => listener());
    expect(store.getSnapshot()).toMatchObject({ stage: 'arrived', busy: false, reducedMotion: true });
    expect(walkPresentation(store.getSnapshot().stage, 'up', true)).toEqual({ pose: 'move-up-idle', progress: 1 });
    expect(vi.getTimerCount()).toBe(0);
    store.reset();
    store.start();
    expect(store.getSnapshot().stage).toBe('arrived');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels walking when the mounted subscription is removed', () => {
    const store = createRitualSequenceStore(schematicWalkStages);
    const unmount = store.subscribe(() => {});
    store.start();
    vi.advanceTimersByTime(140);
    unmount();
    vi.runAllTimers();
    expect(store.getSnapshot()).toMatchObject({ stage: null, busy: false });
    expect(vi.getTimerCount()).toBe(0);
    expect(store.start()).toBe(false);
  });

  it.each<CocoMovementDirection>(['down', 'left', 'right', 'up'])('renders an idle, keyboard-triggerable %s preview', direction => {
    const html = renderToStaticMarkup(<CocoPathPreview direction={direction} />);
    expect(html).toContain('Preview schematic walk');
    expect(html).toContain('type="button"');
    expect(html).toContain(`data-direction="${direction}"`);
    expect(html).toContain(`data-pose="move-${direction}-idle"`);
    expect(html).toContain('Schematic only');
    expect(html).toContain('no live GPS or route guidance');
    expect(html).not.toContain('is-walking');
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('TripSpatialView schematic walking integration', () => {
  const plan: TripPlan = {
    destination: 'Tokyo', tripPromise: 'Slow day', totalEstimatedCost: 0,
    walkingKm: 0, transferMinutes: 0, protectedAnchorIds: [], unresolvedRisks: [],
    items: ['Market', 'Garden'].map((name, index) => ({
      id: name, name, kind: 'floating', startMinutes: index * 60, endMinutes: (index + 1) * 60,
      timeLabel: `${index + 10}:00`, estimatedCost: 0, transferMinutes: 0, walkingKm: 0,
      protected: false, evidence: [],
    })),
  };

  it('uses saved stop positions and labels without mutating the plan', () => {
    const before = JSON.stringify(plan);
    const html = renderToStaticMarkup(<TripSpatialView mode="traveling" destination="Tokyo" plan={plan}
      currentItem={{ name: 'Market', timeLabel: '10:00' }} nextItem={{ name: 'Garden', timeLabel: '11:00' }} />);
    expect(html).toContain('Preview schematic walk');
    expect(html).toContain('data-direction="right"');
    expect(html).toContain('Market → Garden');
    expect(JSON.stringify(plan)).toBe(before);
  });

  it('hides the walk for other modes, unavailable data, or fewer than two stops', () => {
    for (const mode of ['planning', 'completed'] as const) {
      expect(renderToStaticMarkup(<TripSpatialView mode={mode} destination="Tokyo" plan={plan} />))
        .not.toContain('Preview schematic walk');
    }
    expect(renderToStaticMarkup(<TripSpatialView mode="traveling" source="unavailable" destination="Tokyo" plan={plan} />))
      .not.toContain('Preview schematic walk');
    expect(renderToStaticMarkup(<TripSpatialView mode="traveling" destination="Tokyo" plan={{ ...plan, items: plan.items.slice(0, 1) }} />))
      .not.toContain('Preview schematic walk');
  });
});
