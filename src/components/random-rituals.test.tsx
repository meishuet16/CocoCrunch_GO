import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRitualSequence, type RitualStage } from '../motion/ritualSequence';
import { EverydayGachaMachine } from './EverydayGachaMachine';
import { LuckyDrawReveal } from './LuckyDrawReveal';

// Use the real sequencer; replace only React's subscription boundary so these
// component contracts run in the repository's DOM-free test environment.
let sequence: ReturnType<typeof createRitualSequence> | undefined;
let reduced = false;
vi.mock('../motion/useRitualSequence', () => ({
  useRitualSequence: (stages: readonly RitualStage[]) => {
    sequence ??= createRitualSequence(stages, { reducedMotion: reduced });
    return { ...sequence.getSnapshot(), start: sequence.start, advance: sequence.advance, reset: sequence.reset };
  },
}));

function buttons(node: ReactNode): ReactElement<{ children?: ReactNode; onClick: () => void; disabled?: boolean }>[] {
  return Children.toArray(node).flatMap(child => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return [];
    return child.type === 'button' ? [child as ReactElement<{ onClick: () => void }>]
      : buttons(child.props.children);
  });
}

afterEach(() => { sequence?.dispose(); sequence = undefined; reduced = false; vi.useRealTimers(); });

it('does not request a random choice for an explicitly empty candidate set', () => {
  const onTurn = vi.fn();
  const button = buttons(EverydayGachaMachine({ candidates: [], onTurn }))[0];
  expect(button.props.disabled).toBe(true);
  button.props.onClick();
  expect(onTurn).not.toHaveBeenCalled();
  expect(sequence?.getSnapshot().stage).toBeNull();
});

describe.each([
  { name: 'capsule machine', render: (result: string | undefined, callback: () => void) => EverydayGachaMachine({ result, onTurn: callback }), held: 'Open capsule', stages: ['turning', 'rolling', 'dropping', 'settling', 'held', 'opening', 'revealed'] },
  { name: 'fortune sticks', render: (result: string | undefined, callback: () => void) => LuckyDrawReveal({ result, onDraw: callback }), held: 'Draw the stick', stages: ['shaking', 'emerging', 'held', 'drawing', 'unfolding', 'revealed'] },
])('$name', ({ render, held, stages }) => {
  it('calls the parent once, hides the selected result until explicit handling and reveal, and permits replay', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const start = buttons(render('Selected by parent', callback))[0];
    const visited: string[] = [];
    sequence?.subscribe(() => { if (sequence?.getSnapshot().stage) visited.push(sequence.getSnapshot().stage!); });
    start.props.onClick(); start.props.onClick();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(buttons(render('Selected by parent', callback))[0].props.disabled).toBe(true);
    vi.runAllTimers();
    expect(sequence?.getSnapshot().stage).toBe('held');
    expect(renderToStaticMarkup(render('Selected by parent', callback))).not.toContain('Selected by parent');
    const open = buttons(render('Selected by parent', callback)).find(button => button.props.children === held)!;
    expect(open).toBeDefined();
    open.props.onClick(); open.props.onClick();
    vi.runAllTimers();
    expect(visited).toEqual(stages);
    expect(renderToStaticMarkup(render('Selected by parent', callback))).toContain('Selected by parent');
    expect(callback).toHaveBeenCalledTimes(1);
    buttons(render('Selected by parent', callback))[0].props.onClick();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(renderToStaticMarkup(render('Selected by parent', callback))).not.toContain('Selected by parent');
  });

  it('keeps the explicit hold with reduced motion and never invents a missing result', () => {
    vi.useFakeTimers(); reduced = true;
    const callback = vi.fn();
    buttons(render(undefined, callback))[0].props.onClick();
    expect(sequence?.getSnapshot().stage).toBe('held');
    expect(vi.getTimerCount()).toBe(0);
    buttons(render(undefined, callback)).find(button => button.props.children === held)!.props.onClick();
    expect(sequence?.getSnapshot().stage).toBe('revealed');
    expect(renderToStaticMarkup(render(undefined, callback))).toContain('Waiting for the selected result');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels decorative progression on reset without another parent callback', () => {
    vi.useFakeTimers(); const callback = vi.fn();
    buttons(render('Choice', callback))[0].props.onClick();
    sequence?.reset(); vi.runAllTimers();
    expect(sequence?.getSnapshot().stage).toBeNull();
    expect(renderToStaticMarkup(render('Choice', callback))).not.toContain('>Choice<');
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
