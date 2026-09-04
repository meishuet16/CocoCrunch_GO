# CocoCrunch Workspace IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the active Home, Trips, Explore, and Trip Workspace around the journey-state spine while keeping the approved five-tab navigation and contextual Map.

**Architecture:** Extract focused presentation components from `src/AppRescued.tsx` and feed them pure outputs from the journey-data plan. The workspace remains trip-owned; lifecycle controls remain compact context, while the next-action block and contextual sections carry the journey. Map is a reusable honest spatial view, never a top-level tab.

**Tech Stack:** React, TypeScript, lucide-react, existing CSS, Vitest domain integration, Vite.

## Global Constraints

- Work only on `feat/p0-foundation`; do not change branches, merge, or push `main`.
- Keep current CocoCrunch visual identity and existing validated P0 rules.
- Do not add another permanent navigation destination.
- Home must orient the active trip and must not become a feature dashboard.
- Explore actions must distinguish `Save idea` from `Suggest to group`; Group suggestions never bypass governance.
- Map must label schematic/local/adapter states honestly and never fabricate live provider data.
- Do not mechanically preserve current tool-drawer placement when it contradicts the journey, but keep useful P1/P2 features.
- Every `AppRescued.tsx` edit must be small, followed immediately by `git diff -- src/AppRescued.tsx`.
- No canonical Coco sprite extraction or decorative animation work in this batch.

## File map

- Create `src/components/GlobalNav.tsx` for the current five-tab shell.
- Create `src/components/TripJourneyStatus.tsx` for phase, status, next action, and evidence.
- Create `src/components/TripSpatialView.tsx` for honest Before/During/After spatial context.
- Create `src/components/ContextualToolList.tsx` for trigger-based secondary actions.
- Create `src/components/TripPlanOverview.tsx` for planning timeline, Promise, evidence, and Health summary.
- Modify `src/components/TripWorkspace.tsx` for the shared workspace shell without adding feature tabs.
- Modify `src/AppRescued.tsx` in controlled render/integration slices.
- Modify `src/styles.css` incrementally for responsive layout and calm hierarchy.

## Interfaces consumed from the journey-data plan

```ts
import type { JourneyState } from '../domain/journey-state';
import type { RecommendationEvidence } from '../domain/evidence';
import type { TripPlan } from '../domain/itinerary';
import type { TripIntent } from '../domain/trip-intent';
```

### Task 1: Extract global navigation without changing navigation semantics

**Files:**
- Create: `src/components/GlobalNav.tsx`
- Modify: `src/AppRescued.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: current `Tab` union and `setTab`/workspace-close behavior.
- Produces: `GlobalNav({ tab, onChange, onOpenTrips })` with exactly five destinations: Home, Trips, Explore, Memories, Me.

- [ ] **Step 1: Create the component**

```tsx
import { Box, CalendarDays, Compass, Heart, Home } from 'lucide-react';

export type GlobalTab = 'home' | 'trips' | 'explore' | 'memories' | 'me';

export function GlobalNav({ tab, onChange, onOpenTrips }: { tab: GlobalTab; onChange: (tab: GlobalTab) => void; onOpenTrips: () => void }) {
  const items = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'trips' as const, label: 'Trips', icon: CalendarDays },
    { id: 'explore' as const, label: 'Explore', icon: Compass },
    { id: 'memories' as const, label: 'Memories', icon: Box },
    { id: 'me' as const, label: 'Me', icon: Heart },
  ];
  return <nav className="bottom-nav">{items.map(item => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => { if (item.id === 'trips') onOpenTrips(); onChange(item.id); }}><Icon size={20}/><span>{item.label}</span></button>; })}</nav>;
}
```

- [ ] **Step 2: Replace only the bottom-nav JSX in `AppRescued.tsx`**

```tsx
<GlobalNav tab={tab} onChange={setTab} onOpenTrips={() => setTripWorkspaceOpen(false)} />
```

- [ ] **Step 3: Inspect the active-app diff and run checks**

Run: `git diff -- src/AppRescued.tsx`; then `npm run check`.

Expected: five navigation items remain and the check passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/GlobalNav.tsx src/AppRescued.tsx src/styles.css
git commit -m "refactor: isolate global navigation shell"
```

### Task 2: Add the shared journey-status component

**Files:**
- Create: `src/components/TripJourneyStatus.tsx`
- Modify: `src/AppRescued.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `JourneyState`, `TripIntent`, Plan Health summary, and a navigation callback.
- Produces: a single status/next-action card used by Home and Trip Workspace.

- [ ] **Step 1: Create the component with presentation-only copy**

```tsx
import { ChevronRight } from 'lucide-react';
import type { JourneyState } from '../domain/journey-state';

export function TripJourneyStatus({ state, destination, onAction }: { state: JourneyState; destination: string; onAction: (target: NonNullable<JourneyState['nextAction']>['target']) => void }) {
  const action = state.nextAction;
  return <section className="journey-status paper-sheet"><div><span className="eyebrow">{destination.toUpperCase()} · {state.phase.toUpperCase()}</span><h3>{state.status}</h3>{action && <p>{action.reason}</p>}</div>{action && <button className="primary" onClick={() => onAction(action.target)}>{action.label}<ChevronRight size={15}/></button>}</section>;
}
```

- [ ] **Step 2: Add Home first**

Replace the current Home feature-tool lead with `<TripJourneyStatus state={journeyState} destination={destination} onAction={handleJourneyAction} />`. Keep only compact supporting values below it: current phase, Plan Health, budget remaining, and group status. Do not render the current four-item Home tool grid in the primary position.

- [ ] **Step 3: Add the same component to the workspace**

Render it immediately below `TripWorkspaceContext` and route action targets to the existing drawer/open-trip handlers. The action remains advisory; all existing mutation gates remain authoritative.

- [ ] **Step 4: Inspect exact diff and run checks**

Run: `git diff -- src/AppRescued.tsx`; then `npm run check`.

- [ ] **Step 5: Commit**

```bash
git add src/components/TripJourneyStatus.tsx src/AppRescued.tsx src/styles.css
git commit -m "feat: surface phase-aware next action"
```

### Task 3: Extract honest contextual spatial view

**Files:**
- Create: `src/components/TripSpatialView.tsx`
- Modify: `src/AppRescued.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `TripPhase`, `TripPlan`, destination candidates, privacy state, and optional disruption/reunion state.
- Produces: Before candidate/stops view, During current/next/reunion view, and After travelled/photo metadata view.

- [ ] **Step 1: Implement explicit spatial data status**

```tsx
export type SpatialMode = 'planning' | 'traveling' | 'completed';
export type SpatialSource = 'local-schematic' | 'prototype-catalog' | 'photo-metadata' | 'unavailable';

export function TripSpatialView({ mode, destination, source = 'local-schematic', plan, candidates, nextItem, reunionLabel }: { mode: SpatialMode; destination: string; source?: SpatialSource; plan: TripPlan; candidates: { id: string; name: string; source: 'prototype-catalog' | 'fallback' }[]; nextItem?: { name: string; timeLabel: string }; reunionLabel?: string }) {
  const label = source === 'local-schematic' ? 'Schematic route · not live navigation' : source === 'photo-metadata' ? 'Imported photo metadata · no live location' : source === 'unavailable' ? 'Spatial data unavailable' : 'Local prototype catalog';
  return <section className={`trip-spatial-view spatial-${mode}`}><div className="section-rule"><span>MAP · {destination.toUpperCase()}</span><small>{label}</small></div><div className="spatial-canvas" role="img" aria-label={`${destination} ${mode} schematic spatial view`}><span className="spatial-stop start">{mode === 'completed' ? 'Travelled' : 'Start'}</span>{plan.items.filter(item => item.kind === 'anchor' || item.kind === 'floating').map(item => <span className={`spatial-stop ${item.kind}`} key={item.id}>{item.name} · {item.timeLabel}</span>)}</div>{mode === 'planning' && <small className="adapter-note">Candidates are planning inputs only. No provider route, traffic, travel time, or live place status is connected.</small>}{mode === 'traveling' && <small className="adapter-note">{nextItem ? `Next: ${nextItem.name} · ${nextItem.timeLabel}.` : 'Current/next stop is unavailable.'}{reunionLabel ? ` Reunion: ${reunionLabel}.` : ''}</small>}{mode === 'completed' && <small className="adapter-note">Photo Map can show imported metadata only; it does not infer travelled routes.</small>}</section>;
}
```

- [ ] **Step 2: Replace the inline During SVG with the component**

Keep the existing local schematic path semantics, but move them behind the component and preserve the explicit no-live-data label.

- [ ] **Step 3: Add planning and completed entry points**

Use the same component below the planning timeline and near the After retrospective summary. Do not add a Map nav item.

- [ ] **Step 4: Inspect diff and validate**

Run: `git diff -- src/AppRescued.tsx`; then `npm run check`.

- [ ] **Step 5: Commit**

```bash
git add src/components/TripSpatialView.tsx src/AppRescued.tsx src/styles.css
git commit -m "feat: add honest contextual trip spatial view"
```

### Task 4: Recompose planning and contextual tools

**Files:**
- Create: `src/components/ContextualToolList.tsx`
- Create: `src/components/TripPlanOverview.tsx`
- Modify: `src/components/TripWorkspace.tsx`
- Modify: `src/AppRescued.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `TripPlan`, Plan Health, Group DNA, Backup pool, Trip Intent, and feature trigger booleans.
- Produces: purpose-specific Planning sections without a feature museum.

- [ ] **Step 1: Create trigger-based tools**

```tsx
export type ContextualTool = { id: string; label: string; note: string; visible: boolean; onOpen: () => void };

export function ContextualToolList({ tools }: { tools: ContextualTool[] }) {
  return <section className="contextual-tool-list">{tools.filter(tool => tool.visible).map(tool => <button className="mini-tool" key={tool.id} onClick={tool.onOpen}><span><b>{tool.label}</b><small>{tool.note}</small></span><span aria-hidden="true">›</span></button>)}</section>;
}
```

- [ ] **Step 2: Create the plan overview boundary**

```tsx
export function TripPlanOverview({ plan, planHealth, tripIntent, onOpenWhy, onOpenHealth }: { plan: TripPlan; planHealth: { overall: number; reasons: string[]; metrics: Record<string, number> }; tripIntent: TripIntent; onOpenWhy: (itemId: string) => void; onOpenHealth: () => void }) {
  return <section className="trip-plan-overview"><div className="trip-promise paper-strip"><span>TRIP PROMISE</span><b>{plan.tripPromise}</b></div><section className="itinerary-sheet paper-sheet">{plan.items.map(item => <button className={`itinerary-row ${item.kind}`} key={item.id} onClick={() => onOpenWhy(item.id)}><time>{item.timeLabel}</time><span><b>{item.name}</b><small>{item.kind === 'anchor' ? 'Must-Go · protected' : `${item.kind} · ${tripIntent.flexible || 'flexible time'}`}</small></span><em>{item.kind}</em></button>)}</section><section className="plan-health"><button className="section-rule" onClick={onOpenHealth}><span>PLAN HEALTH · {planHealth.overall}/100</span><span>View reasons ›</span></button><p>{planHealth.reasons[0] ?? 'No current deductions.'}</p></section></section>;
}
```

- [ ] **Step 3: Use the sections in the workspace**

Planning order must be: JourneyStatus → Trip Intent → People/Group DNA when Group → TripPlanOverview → SpatialView → Health detail → decision queue → Ready-to-Go actions. The existing drawers remain available from these owners, not from a global dashboard.

- [ ] **Step 4: Make Explore feed the active trip**

Change candidate action handlers so `Save idea` calls the existing idea-save path and `Suggest to group` calls a shortlist/proposal path guarded by `gatePlanMutation(mode, 'idea-save')`. Never call the official-itinerary mutation from Explore.

- [ ] **Step 5: Reposition Me-owned versus trip-owned fields**

Remove Trip Vibe, Must-Go, Deal Breaker, Preference, and Flexible editing from `renderMe()`. Keep Tingo update/retake, base packing preferences, privacy, and confirmed learning history there. Keep the trip-specific fields in Trip Setup and Planning.

- [ ] **Step 6: Inspect the exact AppRescued diff after each render extraction**

Run: `git diff -- src/AppRescued.tsx` after each individual replacement. Revert no unrelated user changes and do not replace the whole file.

- [ ] **Step 7: Run checks and commit**

Run: `npm run check`.

```bash
git add src/components/ContextualToolList.tsx src/components/TripPlanOverview.tsx src/components/TripWorkspace.tsx src/AppRescued.tsx src/styles.css
git commit -m "feat: make Trip Workspace the journey spine"
```

### Task 5: Browser/runtime and responsive verification checkpoint

**Files:**
- Modify: only files with defects found during verification.

**Interfaces:**
- Consumes: completed workspace slices and all existing P0 interactions.
- Produces: evidence-backed runtime status; no claim of visual verification without actually running it.

- [ ] **Step 1: Run `npm run check` from the exact branch head**
- [ ] **Step 2: Start the Vite app with `npm run dev`**
- [ ] **Step 3: Verify Home → Trips → Planning → Traveling → Completed**
- [ ] **Step 4: Verify Explore Save idea and Suggest to group**
- [ ] **Step 5: Verify contextual Map labels and absence of a Map nav item**
- [ ] **Step 6: Verify mobile-width layout and keyboard/focus basics**
- [ ] **Step 7: Record only observed browser/runtime/visual results in the rescue log**
