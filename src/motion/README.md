# Shared presentation motion

```tsx
import { useRitualSequence, useReducedMotion } from './motion';

const { stage, start, advance, reset, busy, reducedMotion } = useRitualSequence([
  { name: 'printing', durationMs: 300 },
  { name: 'readyToTear' },
  { name: 'tearing', durationMs: 180 },
  { name: 'complete' },
] as const);
```

- `stage` is a supplied name or `null` before starting / after reset.
- `start(): boolean` enters the first stage. It rejects duplicate starts while
  `busy`, including at intermediate held steps. Completion permits replay.
- `advance(): boolean` moves to the next stage and invalidates the current timer.
  It does nothing when idle or complete. Wire this to an ordinary button for a
  held semantic step, or invoke it after independently acknowledged work.
- `reset(): void` cancels and returns to idle. Call it when a dialog closes while
  its component remains mounted. Unsubscription/unmount also cancels timers.
- `busy` stays true through intermediate held steps. The last array entry is the
  retained terminal state with `busy: false`; its duration is ignored.
- `reducedMotion` follows the live browser preference. Timed decorative stages
  are skipped immediately, stopping at each stage without `durationMs`. Every
  held step remains reachable; the final entry is retained even if timed.
  Turning the preference off affects future stages without replaying skipped ones.
- Empty arrays cannot start. Durations must be finite and non-negative; zero is
  supported. Arrays are readonly, and the runner copies their definitions.

`useReducedMotion(): boolean` exposes the same shared preference independently.
Server rendering uses `false` and an idle snapshot, without scheduling timers.
Equal inline stage definitions retain the hook's runner across renders. Changing
names/order/durations creates a fresh idle sequence and cancels the previous one
when React replaces its subscription.

`createRitualSequence(stages, { reducedMotion? })` is the React-independent runner.
It exposes `getSnapshot`, `subscribe`, `start`, `advance`, `reset`, `cancel`,
`dispose`, and `setReducedMotion`. Snapshots are cached immutable objects.
`cancel`/`reset` permit restart; `dispose` permanently disables the runner and
removes subscribers. Both clear timers and invalidate queued callbacks with a
generation token. Direct runner consumers own disposal and preference updates.

The hook uses cancellation on subscription cleanup so React StrictMode can
subscribe again to the same store. Starts after cleanup are rejected until a new
subscription exists. The shared preference listener detaches when unused.

These primitives have no domain actions or animation-end callbacks. Perform
persistence independently; never treat reaching a presentation stage as proof of
saving, payment, release, or another domain result. Use a held stage if progression
must await an explicit action or acknowledged success. UI consumers own focus,
dialog semantics, accessible button labels, and result announcements.

Verification: `npx vitest run src/motion` and `npx tsc --noEmit`.
The tests use fake timers, real server-rendered React hooks, and subscription
lifecycle replay. They do not mount a browser DOM or claim visual motion QA.
