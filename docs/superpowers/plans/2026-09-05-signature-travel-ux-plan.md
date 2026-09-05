# CocoCrunch Signature Travel UX and Final Visual Polish Implementation Plan

> For agentic workers: use bounded tasks with focused tests, exact AppRescued diff inspection, and a descriptive commit after each task.

**Goal:** Translate the five supplied travel references into a coherent, calm, journey-oriented CocoCrunch experience while preserving all validated P0 domain, governance, persistence, privacy, Tingo, Solo/Group, and provider-honesty rules.

**Architecture:** Keep src/AppRescued.tsx as the active composition root, but move new presentation responsibilities into small typed components. New components receive already-derived plan, phase, condition, repair, and interaction state; they do not derive business decisions or mutate domain state. Existing AppRescued callbacks remain the only mutation boundary.

**Tech Stack:** React, TypeScript, Vite, Vitest, lucide-react, existing CSS in src/styles.css, src/v2-polish.css, and src/signature-interactions.css.

## Global Constraints

- FINAL_PRODUCT_SPEC.md is authoritative, followed by validated domain/business invariants, the approved framework, the approved visual-refinement design, the five references, and current CocoCrunch identity.
- Work only on feat/p0-foundation; keep PR #1 open and unmerged; never push main.
- Preserve Home / Trips / Explore / Memories / Me and Planning / Traveling / Completed.
- Do not modify src/domain files unless a concrete rendered integration defect requires a minimal regression-safe wiring fix.
- Do not modify src/assets/coco/source/coco-canonical-sheet.png.
- Reuse only the existing standalone asset src/assets/coco/coco-idle.png for the brand presentation.
- Preserve Must-Go anchors, Deal Breakers, Group Court confirmation, tie-only Court Gacha, Backup viability, minimum-loss repair, Tingo learning, persistence, privacy, and Solo/Group behavior.
- Do not fabricate live weather, GPS, routing, traffic, travel time, venue availability, pricing, provider timestamps, or social activity.
- After every AppRescued edit run git diff -- src/AppRescued.tsx and inspect the exact change before continuing.
- Each task ends with focused tests, git diff --check, rendered narrow inspection where applicable, and a bounded commit.

---

### Task 1: Add journey progression and typed Today timeline

**Files:**
- Create: src/components/JourneyProgress.tsx
- Create: src/components/JourneyProgress.test.tsx
- Create: src/components/TodayTimeline.tsx
- Create: src/components/TodayTimeline.test.tsx
- Modify: src/AppRescued.tsx in renderHome, renderPlan, renderDuring, and active header composition only
- Modify: src/v2-polish.css

**Interfaces:**
- JourneyProgress consumes phase, current phase, destination, and optional next-action label and emits Before / During / After markers.
- TodayTimeline consumes TripPlan items, delay, arrivalChecked, and appliedRepair and emits display state only.
- AppRescued continues to own every callback. The components do not calculate route, time, weather, or plan mutations.

- [ ] Write tests for active Planning, Traveling, and Completed markers and verify the existing lifecycle controls remain available.
- [ ] Write tests for anchor, floating, buffer, current, next, later, and applied-repair/recovery timeline rows.
- [ ] Run the new focused tests before implementation and record the expected failures.
- [ ] Implement the typed components with semantic list/section markup and text state markers.
- [ ] Integrate JourneyProgress into Home and the workspace; integrate TodayTimeline at the top of Traveling before spatial context.
- [ ] Add the vertical rail, time column, current marker, protected anchor treatment, flexible floating treatment, and quiet buffer/completed treatment.
- [ ] Inspect git diff -- src/AppRescued.tsx, run focused tests and git diff --check, then render at the available narrow viewport.
- [ ] Commit as feat: add journey progression and today timeline.

### Task 2: Make itinerary and spatial context read as travel

**Files:**
- Modify: src/components/TripPlanOverview.tsx
- Modify: src/components/TripPlanOverview.test.tsx or src/components/WorkspaceComposition.test.tsx
- Modify: src/components/TripSpatialView.tsx
- Modify: src/components/TripSpatialView.test.tsx
- Modify: src/AppRescued.tsx only for presentation grouping
- Modify: src/v2-polish.css

**Interfaces:**
- TripPlanOverview keeps TripPlan, PlanHealth, TripIntent, onOpenWhy, and onOpenHealth unchanged.
- TripSpatialView keeps its existing mode, source, plan, current, next, reunion, privacy, and photoSummary contract.

- [ ] Add tests for protected Must-Go, flexible Floating, time labels, Why this?, and source-boundary copy.
- [ ] Add tests for planning candidate context, traveling saved current/next context, and completed imported photo metadata.
- [ ] Add an itinerary spine around existing rows without replacing the domain plan or evidence text.
- [ ] Add a compact completed closure summary using existing actual values without moving learning below expressive artifacts.
- [ ] Make spatial context visually secondary to the daily itinerary while preserving all provenance labels.
- [ ] Inspect the exact AppRescued diff, focused tests, diff check, and narrow Planning/Completed renders.
- [ ] Commit as style: give plans a travel timeline.

### Task 3: Refine Trip Conditions and repair storytelling

**Files:**
- Modify: src/components/TripConditions.tsx
- Modify: src/components/TripConditions.test.tsx
- Modify: src/AppRescued.tsx only in renderDuring condition and repair presentation
- Modify: src/v2-polish.css

**Interfaces:**
- TripConditions retains delay, failedItemName, repairAvailable, and onSimulateDisruption.
- Repair display reads only from the existing RepairResult preview, strategy, reasons, impact, and confirmation state.

- [ ] Add tests for calm conditions, simulated/user-reported wording, affected flexible item, repair available, no direct Backup with Open Recovery, and no safe repair.
- [ ] Change copy to Today’s conditions, Something changed, affected item, provenance, and next action without inventing forecast data.
- [ ] Reorder Traveling as Today, conditions, disruption/repair, progress, group heartbeat, tools, and spatial context.
- [ ] Preserve no-Backup versus no-repair distinction, anchor-first preview, group confirmation, Apply, Not now, and Undo.
- [ ] Inspect AppRescued diff, run focused tests and diff check, and render calm/affected/repair states.
- [ ] Commit as style: make today conditions traveler-readable.

### Task 4: Make Coco the travel companion without changing the asset pipeline

**Files:**
- Inspect: src/assets/coco/coco-idle.png
- Modify: src/AppRescued.tsx header/companion presentation only
- Modify: src/v2-polish.css
- Create or modify: the smallest relevant presentation test

**Interfaces:**
- Reuse the existing standalone idle PNG import and existing Coco presentation boundary.
- Do not touch src/assets/coco/source/coco-canonical-sheet.png, create a crop, or add a new pose.
- Keep the companion decorative/contextual; it must not become a mutation or domain-state owner.

- [ ] Verify the existing idle asset dimensions and current import before editing.
- [ ] Replace the generic brand-mark presentation with the idle Coco companion where the design calls for it, preserving accessible text and a minimum 44px touch target for any interactive surface.
- [ ] Keep normal state calm and reserve expressive treatment for the existing special states.
- [ ] Inspect the exact AppRescued diff, run focused tests, git diff --check, and a narrow render.
- [ ] Commit as style: make Coco a travel companion.

### Task 5: Distinguish signature random interactions by context

**Files:**
- Create: src/components/EverydayGachaMachine.tsx
- Create: src/components/EverydayGachaMachine.test.tsx
- Create: src/components/LuckyDrawReveal.tsx
- Create: src/components/LuckyDrawReveal.test.tsx
- Modify: src/AppRescued.tsx drawer presentation and qualifying Pray entry point only
- Modify: src/v2-polish.css or the existing signature-interactions.css

**Interfaces:**
- Presentation components receive the existing choices/results and callbacks; AppRescued remains the mutation boundary.
- Court Gacha remains Group Court-only and tie-only. Everyday Gacha remains a local indecision interaction. Lucky Draw remains an entertainment-only sealed reveal with no fake deal/provider claims.
- Pray remains contextual, optional, non-mutating, and must not auto-open after repair. Reuse the existing SignatureRituals contract if a visible entry point is needed.

- [ ] Add tests that distinguish the everyday capsule/machine, Court tie-only Gacha copy, and Lucky Draw sealed-note/fortune/ticket reveal.
- [ ] Implement the smallest typed presentation components that make the three contexts legible without changing domain behavior.
- [ ] Keep Ask Coco proposal/explanation-only and ensure no signature surface silently mutates official Group itinerary, Court, repair, Tingo, privacy, or location state.
- [ ] Inspect the exact AppRescued diff, run focused tests, git diff --check, and narrow Traveling/Planning renders.
- [ ] Commit as style: distinguish travel signature rituals.

### Task 6: Close the travel journey visually across Completed, Memories, Me, and Explore

**Files:**
- Modify: src/components/JourneyPhaseGuide.tsx or the existing journey-progress presentation boundary
- Modify: src/AppRescued.tsx presentation grouping only
- Modify: src/v2-polish.css
- Modify/create focused component tests as needed

**Interfaces:**
- Preserve the current five global destinations and trip-owned workspace lifecycle.
- Completed must keep actual outcome → Worth It/reflection → proposed learning → explicit confirmation unmistakable; expressive artifacts remain around that loop.
- Memories remains retrospective/archive, Me owns persistent Tingo identity/preferences/history, Explore feeds Save idea/Suggest to group, and Map remains contextual.

- [ ] Add or refine a visible Before → During → After cue on the surfaces that need it without turning Home into a feature dashboard or adding another top-level tab.
- [ ] Strengthen visual hierarchy for the current journey phase, next meaningful action, and closure/learning loop while preserving existing copy and callbacks where they already satisfy the contract.
- [ ] Ensure Explore and Me visually communicate their ownership boundaries and do not bypass Group governance or trip-specific Tingo separation.
- [ ] Inspect the exact AppRescued diff, run focused lifecycle/learning tests, git diff --check, and narrow Completed/Memories/Me/Explore renders.
- [ ] Commit as style: close the travel journey visually.

### Task 7: Responsive, accessibility, regression, and handoff validation

**Files:**
- Modify: src/v2-polish.css, src/styles.css, and small component files only for concrete QA defects
- Modify: docs/COCOCRUNCH_RESCUE_LOG.md
- Modify: PR description through the GitHub integration after feature-branch push

**Interfaces:**
- No canonical asset, domain invariant, provider boundary, or navigation ownership changes in QA.
- Report only viewport, browser, CI, and runtime checks actually performed.

- [ ] Inspect exact diffs and git status; confirm the canonical sprite sheet remains unchanged.
- [ ] Run focused tests for every new/changed presentation component, full Vitest regression suite, npm run check, npm run build, and git diff --check.
- [ ] Exercise available browser/runtime states with console-error inspection, including Home, Planning, Traveling calm/affected/repair, Completed, Memories, Me, Explore, and the three random contexts.
- [ ] Inspect real rendered output at the exact available narrow widths (including 360/390/430 only if actually available), plus tablet/desktop only when actually available; check keyboard labels, headings, aria-current/selected, close actions, touch targets, and reduced-motion behavior.
- [ ] Update the rescue log with the reference audit, implementation checkpoints, exact verification evidence, and limitations; sync the open PR description without merging or pushing main.
- [ ] Commit as docs: record signature travel UX validation.
