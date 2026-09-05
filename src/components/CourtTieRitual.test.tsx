import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { createRitualSequence, type RitualStage } from '../motion/ritualSequence';
import { CourtTieRitual } from './CourtTieRitual';

// Match the repository's DOM-free harness, retaining the real staged timers.
let sequence: ReturnType<typeof createRitualSequence> | undefined;
let reduced = false;
vi.mock('../motion/useRitualSequence', () => ({
  useRitualSequence: (stages: readonly RitualStage[]) => {
    sequence ??= createRitualSequence(stages, { reducedMotion: reduced });
    return { ...sequence.getSnapshot(), start: sequence.start, advance: sequence.advance, reset: sequence.reset };
  },
}));
type Button = ReactElement<{ children?: ReactNode; onClick: () => void; disabled?: boolean }>;
function buttons(node: ReactNode): Button[] {
  return Children.toArray(node).flatMap(child => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return [];
    return child.type === 'button' ? [child as Button] : buttons(child.props.children);
  });
}
afterEach(() => { sequence?.dispose(); sequence = undefined; reduced = false; vi.useRealTimers(); });
const props = () => ({ tied: true, options: ['Garden', 'Museum'], result: 'Parent selection', onDraw: vi.fn(), onReveal: vi.fn() });

it('renders nothing for a majority, even with options and a supplied result', () => {
  const p = { ...props(), tied: false };
  expect(renderToStaticMarkup(CourtTieRitual(p))).toBe('');
  expect(p.onDraw).not.toHaveBeenCalled();
  expect(p.onReveal).not.toHaveBeenCalled();
});

it('progresses through the court draw, holds for reveal, and rejects duplicate actions', () => {
  vi.useFakeTimers();
  const p = props();
  const start = buttons(CourtTieRitual(p))[0];
  const visited: string[] = [];
  sequence!.subscribe(() => { visited.push(sequence!.getSnapshot().stage!); });
  start.props.onClick(); start.props.onClick();
  expect(p.onDraw).toHaveBeenCalledTimes(1);
  expect(sequence!.getSnapshot().stage).toBe('turning');
  expect(buttons(CourtTieRitual(p))[0].props.disabled).toBe(true);
  vi.advanceTimersToNextTimer();
  expect(sequence!.getSnapshot().stage).toBe('shuffling');
  vi.runAllTimers();
  expect(sequence!.getSnapshot().stage).toBe('selected');
  const held = renderToStaticMarkup(CourtTieRitual(p));
  expect(held).toContain('data-context="courtTie"');
  expect(held).not.toContain(p.result);
  expect(p.onReveal).not.toHaveBeenCalled();
  const reveal = buttons(CourtTieRitual(p)).find(button => button.props.children === 'Reveal selected slip')!;
  reveal.props.onClick(); reveal.props.onClick();
  vi.runAllTimers();
  expect(visited).toEqual(['turning', 'shuffling', 'selected', 'reveal']);
  expect(p.onReveal).toHaveBeenCalledTimes(1);
  expect(renderToStaticMarkup(CourtTieRitual(p))).toContain(p.result);
  buttons(CourtTieRitual(p))[0].props.onClick(); start.props.onClick();
  expect(p.onDraw).toHaveBeenCalledTimes(1);
});

it('preserves the explicit hold in reduced motion and waits for the parent result', () => {
  vi.useFakeTimers(); reduced = true;
  const p = { ...props(), result: undefined as string | undefined };
  buttons(CourtTieRitual(p))[0].props.onClick();
  expect(sequence!.getSnapshot().stage).toBe('selected');
  expect(vi.getTimerCount()).toBe(0);
  const reveal = buttons(CourtTieRitual(p))[1];
  expect(reveal.props.disabled).toBe(true);
  reveal.props.onClick();
  expect(p.onReveal).not.toHaveBeenCalled();
  p.result = 'Museum';
  buttons(CourtTieRitual(p))[1].props.onClick();
  expect(p.onReveal).toHaveBeenCalledTimes(1);
  expect(sequence!.getSnapshot().stage).toBe('reveal');
});

it.each([{ options: [] }, { options: ['Garden'] }])('locks an insufficient option set $options', ({ options }) => {
  const p = { ...props(), options };
  const start = buttons(CourtTieRitual(p))[0];
  expect(start.props.disabled).toBe(true);
  start.props.onClick();
  expect(p.onDraw).not.toHaveBeenCalled();
});

it('keeps duplicate labels visible without React key collisions or choosing locally', () => {
  const p = { ...props(), options: ['Garden', 'Garden'] };
  const html = renderToStaticMarkup(CourtTieRitual(p));
  expect(html.match(/<li>Garden<\/li>/g)).toHaveLength(2);
  expect(p.onDraw).not.toHaveBeenCalled();
});
