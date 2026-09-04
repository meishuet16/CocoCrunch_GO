# Signature Travel UX Task 1 Report

## Scope

Implemented the bounded Task 1 presentation work from `signature-task-1-brief.md`:

- Added typed `JourneyProgress` with Before / During / After markers, current/completed/future markup states, destination, and optional next action.
- Added typed `TodayTimeline` with semantic section/ordered-list markup, time/name rows, Current / Next / Later / Completed labels, visible itinerary kinds, delay/arrival state, and boolean-only Recovery applied state.
- Integrated JourneyProgress on Home and in the active trip workspace while preserving `TripJourneyStatus` and `TripLifecycleTabs`.
- Integrated TodayTimeline at the beginning of `renderDuring`, before `TripSpatialView`; the existing `TripConditions` props and callback remain unchanged.
- Added restrained journey rail, timeline, item-kind, state, and narrow-width wrapping styles in `src/v2-polish.css`.

## Changed files

- `src/components/JourneyProgress.tsx`
- `src/components/JourneyProgress.test.tsx`
- `src/components/TodayTimeline.tsx`
- `src/components/TodayTimeline.test.tsx`
- `src/AppRescued.tsx`
- `src/v2-polish.css`
- `.superpowers/sdd/signature-task-1-report.md`

No domain files, `src/main.tsx`, or `src/assets/coco/source/coco-canonical-sheet.png` were modified. Existing untracked `dist/`, `node_modules/`, and `package-lock.json` were not staged.

## Test-first evidence

The required focused command was run immediately after adding the tests and before adding either production component:

```text
npx vitest run src/components/JourneyProgress.test.tsx src/components/TodayTimeline.test.tsx
FAIL 2 suites
Error: Cannot find module './JourneyProgress'
Error: Cannot find module './TodayTimeline'
```

This was the expected RED failure because the new modules did not yet exist.

After the minimal component implementations and integration:

```text
npx vitest run src/components/JourneyProgress.test.tsx src/components/TodayTimeline.test.tsx
Test Files  2 passed (2)
Tests       4 passed (4)
```

## Required checks

```text
npm run check
TypeScript: passed
Test Files  16 passed (16)
Tests       73 passed (73)
Vite build: passed; 1870 modules transformed
```

```text
git diff --check
exit code 0; only normal Git LF/CRLF warnings were emitted
```

## AppRescued diff inspection

`git diff -- src/AppRescued.tsx` was inspected immediately after each AppRescued edit and again before reporting. The final diff contains only:

```diff
+import { JourneyProgress } from './components/JourneyProgress';
+import { TodayTimeline } from './components/TodayTimeline';
...
+<JourneyProgress destination={destination} currentPhase={tripPhase} nextActionLabel={journeyState.nextAction?.label} />
...
+<JourneyProgress destination={destination} currentPhase={tripPhase} nextActionLabel={journeyState.nextAction?.label} />
...
+<TodayTimeline items={visibleTripPlan.items} delay={delay} arrivalChecked={arrivalChecked} appliedRepair={replanApplied} />
```

The TodayTimeline line is directly before `TripSpatialView`; the existing `TripConditions` line follows the spatial view with its original props and callback. No lifecycle control or callback/mutation boundary was removed or changed.

## Browser render

The local Vite app was started at `http://127.0.0.1:5177/` because port 5176 was already occupied. The Codex in-app browser rendered the Home and active Traveling workspace successfully. Traveling visibly showed `TODAY` before the map and `TRIP CONDITIONS`, with the four item kinds and Current / Next / Later labels. Browser console error/warning logs were empty.

Exact available viewport: `1265 × 713 CSS pixels`.

The available in-app browser did not expose a responsive viewport override, so a forced 362px narrow render was not available. Narrow wrapping CSS was added and covered by the existing TypeScript/build checks, but no narrow screenshot is claimed.

## Self-review

- JourneyProgress is informational and contains no controls, so existing lifecycle navigation remains available.
- JourneyProgress uses `aria-current="step"` plus explicit `data-phase-state` values for current, completed, and future phases.
- TodayTimeline uses semantic `section`, heading, `ol`, `li`, and `time` elements.
- Timeline display derives only from supplied item order and `arrivalChecked`; it does not calculate routes, weather, time, or mutations.
- `delay`, `arrivalChecked`, and `appliedRepair` are displayed only as supplied presentation state.
- Anchor, floating, buffer, and open kinds remain text-visible and have distinct presentation classes.
- Forbidden domain, main-entry, and canonical sprite-sheet files remain unchanged.

## Concerns

The only validation limitation is the unavailable narrow viewport override in the browser surface. The exact browser render that was available was 1265×713 CSS pixels, and the narrow-width CSS branch was included without claiming visual evidence at a narrower width.
