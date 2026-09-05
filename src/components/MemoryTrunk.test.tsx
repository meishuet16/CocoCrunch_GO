import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRitualSequence, type RitualStage } from '../motion/ritualSequence';
import { MemoryTrunk, type MemoryArtifact } from './MemoryTrunk';

// DOM-free interaction harness: real sequence/timers, persistent React hook slots.
// Native focus and CSS transforms still require browser verification.
let slots: unknown[] = [], cursor = 0;
let effects: (() => void)[] = [];
let sequences: ReturnType<typeof createRitualSequence>[] = [];
let reduced = false;
vi.mock('react', async importOriginal => ({
  ...await importOriginal<typeof import('react')>(),
  useState: (initial: unknown) => {
    const index = cursor++;
    if (!(index in slots)) slots[index] = initial;
    return [slots[index], (next: unknown) => { slots[index] = next; }];
  },
  useRef: (initial: unknown) => {
    const index = cursor++;
    return slots[index] ??= { current: initial };
  },
  useEffect: (effect: () => void, deps: unknown[]) => {
    const index = cursor++;
    const previous = slots[index] as unknown[] | undefined;
    if (!previous || deps.some((dep, i) => !Object.is(dep, previous[i]))) effects.push(effect);
    slots[index] = deps;
  },
}));
vi.mock('../motion/useRitualSequence', () => ({
  useRitualSequence: (stages: readonly RitualStage[]) => {
    const index = cursor++;
    if (!slots[index]) {
      const sequence = createRitualSequence(stages, { reducedMotion: reduced });
      sequences.push(sequence); slots[index] = sequence;
    }
    const sequence = slots[index] as ReturnType<typeof createRitualSequence>;
    return { ...sequence.getSnapshot(), start: sequence.start, advance: sequence.advance, reset: sequence.reset };
  },
}));
vi.mock('./coco/CocoCompanion', () => ({ CocoCompanion: ({ context }: { context: string }) => <span data-coco={context} /> }));

const artifacts: MemoryArtifact[] = [
  { id: 'note-a', title: 'Quiet walk', body: 'We took the long way home.', source: 'Trip reflection' },
  { id: 'note-b', title: 'Lunch together', body: 'Shared noodles.', source: 'Recorded outcome' },
];
let props = { artifacts, available: true, openRequested: 0 };
let wasAvailable = true;
function render(): ReactNode {
  if (!props.available && wasAvailable) {
    sequences.forEach(sequence => sequence.dispose()); sequences = []; slots = [];
  }
  wasAvailable = props.available;
  cursor = 0;
  let tree = MemoryTrunk(props) as ReactElement;
  if (typeof tree.type === 'function') tree = (tree.type as (p: unknown) => ReactElement)(tree.props);
  effects.splice(0).forEach(effect => effect());
  return tree;
}
function buttons(node: ReactNode): ReactElement<{ children?: ReactNode; onClick: () => void; disabled?: boolean; 'aria-label'?: string }>[] {
  return Children.toArray(node).flatMap(child => !isValidElement<{ children?: ReactNode }>(child) ? []
    : child.type === 'button' ? [child as ReactElement<{ onClick: () => void }>]
      : buttons(child.props.children));
}
function click(label: string) {
  const button = buttons(render()).find(item => item.props['aria-label'] === label || item.props.children === label);
  expect(button, label).toBeDefined(); expect(button!.props.disabled).not.toBe(true);
  (button!.props.onClick as (event: unknown) => void)({ currentTarget: { isConnected: true, focus: vi.fn() } });
}
const html = () => renderToStaticMarkup(render());
function open() { click('Open memory trunk'); vi.runAllTimers(); render(); }
afterEach(() => {
  sequences.forEach(sequence => sequence.dispose()); sequences = []; slots = []; effects = [];
  reduced = false; wasAvailable = true; props = { artifacts, available: true, openRequested: 0 }; vi.useRealTimers();
});

describe('MemoryTrunk', () => {
  it('starts physically closed with no artifact content', () => {
    expect(html()).toContain('data-stage="closed"');
    expect(html()).not.toContain('Quiet walk');
  });
  it('hinges, reveals, settles, then holds for browsing actual papers', () => {
    vi.useFakeTimers(); click('Open memory trunk');
    expect(html()).toContain('data-stage="opening"');
    vi.advanceTimersByTime(640); expect(html()).toContain('data-stage="revealing"');
    vi.runAllTimers();
    expect(html()).toContain('data-stage="browse"');
    expect(html()).toContain('Quiet walk'); expect(html()).toContain('Lunch together');
    expect(html()).not.toContain('We took the long way home.');
  });
  it('lifts a selected actual artifact, returns it, allows another selection, and closes', () => {
    vi.useFakeTimers(); open(); click('Read Quiet walk');
    expect(html()).toContain('data-selection="lifting"');
    vi.runAllTimers();
    expect(html()).toContain('We took the long way home.');
    expect(html()).toContain('Trip reflection'); expect(html()).toContain('memory-trunk__lid');
    click('Return to trunk'); expect(html()).toContain('data-selection="returning"');
    vi.runAllTimers(); render(); click('Read Lunch together'); vi.runAllTimers();
    expect(html()).toContain('Shared noodles.');
    click('Return to trunk'); vi.runAllTimers(); render(); click('Close memory trunk');
    expect(html()).toContain('data-stage="closing"'); vi.runAllTimers();
    expect(html()).toContain('data-stage="closed"'); expect(html()).not.toContain('Quiet walk');
  });
  it('revokes an open selected memory immediately and never replays a gated request', () => {
    vi.useFakeTimers(); open(); click('Read Quiet walk'); vi.runAllTimers();
    props = { ...props, available: false, openRequested: 4 };
    expect(html()).not.toContain('Quiet walk'); expect(html()).not.toContain('We took');
    expect(html()).toContain('disabled=""'); expect(html()).toContain('data-stage="closed"');
    vi.runAllTimers(); props = { ...props, available: true };
    expect(html()).toContain('data-stage="closed"');
    props = { ...props, openRequested: 5 }; render(); vi.runAllTimers();
    expect(html()).toContain('data-stage="browse"');
  });
  it('shows an honest empty suitcase with canonical empty context', () => {
    vi.useFakeTimers(); props = { ...props, artifacts: [] }; open();
    expect(html()).toContain('Nothing packed here yet.'); expect(html()).toContain('data-coco="empty"');
    expect(html()).not.toContain('Read '); expect(html()).not.toContain('<article');
  });
  it('keeps browsing, reading, returning and closing meaningful with reduced motion', () => {
    vi.useFakeTimers(); reduced = true; open();
    expect(html()).toContain('data-stage="browse"'); click('Read Quiet walk');
    expect(html()).toContain('We took the long way home.'); expect(vi.getTimerCount()).toBe(0);
    click('Return to trunk'); render(); click('Close memory trunk');
    expect(html()).toContain('data-stage="closed"');
  });
  it('never retains removed or stale selected content when actual data changes', () => {
    vi.useFakeTimers(); open(); click('Read Quiet walk'); vi.runAllTimers();
    props = { ...props, artifacts: [] };
    expect(html()).not.toContain('We took'); expect(html()).toContain('Nothing packed here yet.');
  });
  it('blocks an initial gated request and cancels an opening when availability is revoked', () => {
    vi.useFakeTimers(); props = { ...props, available: false, openRequested: 1 };
    expect(html()).not.toContain('Quiet walk');
    expect(buttons(render())[0].props.disabled).toBe(true);
    props = { ...props, available: true }; render();
    click('Open memory trunk'); expect(vi.getTimerCount()).toBeGreaterThan(0);
    props = { ...props, available: false };
    expect(html()).toContain('data-stage="closed"'); expect(vi.getTimerCount()).toBe(0);
  });
  it('uses updated evidence verbatim as text and keeps unrelated bodies packed', () => {
    vi.useFakeTimers(); open(); click('Read Quiet walk'); vi.runAllTimers();
    props = { ...props, artifacts: [{ ...artifacts[0], body: '<script>updated evidence</script>', source: 'Corrected source' }, artifacts[1]] };
    expect(html()).toContain('&lt;script&gt;updated evidence&lt;/script&gt;');
    expect(html()).toContain('Corrected source'); expect(html()).not.toContain('Shared noodles.');
    expect(html()).not.toContain('We took the long way home.');
  });
});
