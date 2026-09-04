# CocoCrunch Visual Refinement Slice 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Home and Planning calm, active-trip orientation surfaces without changing validated domain or governance behavior.

**Architecture:** Keep `src/AppRescued.tsx` as the active composition root. Refine existing markup boundaries and shared CSS in `src/styles.css` / `src/v2-polish.css`; do not replace the app or touch domain logic. Every task ends with focused tests, exact diff inspection, and a bounded commit.

**Tech Stack:** React + TypeScript, Vite, Vitest, lucide-react, existing CSS primitives.

## Global Constraints

- `FINAL_PRODUCT_SPEC.md` is authoritative, followed by validated invariants, approved journey architecture, the five references, and current CocoCrunch identity.
- Preserve Home / Trips / Explore / Memories / Me and Planning / Traveling / Completed.
- Preserve Tingo, Trip Intent, Group DNA, Court, Must-Go anchors, Anchor/Floating, Plan Health, Backup/repair, readiness, privacy, learning, persistence, and Solo/Group separation.
- Do not touch `src/assets/coco/source/coco-canonical-sheet.png`, add providers, add a Map tab, push `main`, or merge PR #1.
- Inspect `git diff -- src/AppRescued.tsx` immediately after every AppRescued edit.

---

### Task 1: Shared presentation primitives

**Files:** Modify `src/styles.css`; inspect `src/v2-polish.css`; run existing component suites.

**Produces:** Shared tokens and rules for typography, spacing, paper surfaces, quiet metrics, actions, itinerary rows, and contextual tools.

- [ ] Record baseline with `git status --short --branch`, `git rev-parse HEAD`, and `rg` selector ownership. Expected branch is `feat/p0-foundation`; expected baseline is `90dff1170a4de8a1ac8c12271a30b1bf9e76708b`.
- [ ] Refine existing selectors only. Add a consistent spacing/surface vocabulary such as `--space-1: 6px`, `--space-2: 10px`, `--space-3: 14px`, `--space-4: 18px`, `--space-5: 24px`, `--surface-quiet: rgba(255,255,255,.44)`, and `--surface-raised: rgba(255,255,255,.72)`. Reduce equal-weight borders, badges, pills, gradients, and shadows through spacing and contrast first.
- [ ] Run `npx vitest run src/components/GlobalNav.test.tsx src/components/TripJourneyStatus.test.tsx src/components/TripPlanOverview.test.tsx src/components/WorkspaceComposition.test.tsx`. Missing named files must not cause production changes.
- [ ] Run `git diff --check`, inspect `git diff --stat` and `git status --short`, then commit only expected style files as `style: establish calm workspace presentation primitives`.

### Task 2: Home active-trip orientation

**Files:** Modify `src/AppRescued.tsx` in `renderHome()` only; modify `src/components/TripJourneyStatus.tsx` only for a presentation hook; modify `src/styles.css`; test `TripJourneyStatus` and `WorkspaceComposition`.

**Consumes:** Existing `journeyState`, `destination`, `tripPhase`, `planHealth`, `remaining`, `mode`, and `handleJourneyAction`.

**Produces:** Home hierarchy of active trip → phase → current status → next action, with quiet readiness/health/budget/Group metrics.

- [ ] Add a DOM assertion that Home contains `HOME · ACTIVE TRIP`, `CURRENT PHASE`, and `PLAN HEALTH`, and does not contain feature-directory copy; do not assert hard-coded itinerary names or scores.
- [ ] Run `npx vitest run src/components/WorkspaceComposition.test.tsx src/components/TripJourneyStatus.test.tsx` before markup changes.
- [ ] Keep `SectionTitle`, `TripJourneyStatus`, all four metric values, handlers, and bottom navigation. Add only a semantic presentation wrapper/class around the status strip; do not add feature cards or change Journey State targets.
- [ ] Make Journey Status and its primary action dominant, keep metrics quiet in a two-column summary, and preserve safe-area padding.
- [ ] Immediately run `git diff -- src/AppRescued.tsx` and `git diff --check`, then rerun focused tests. Commit as `style: orient Home around the active trip`.

### Task 3: Planning decision hierarchy

**Files:** Modify `src/AppRescued.tsx` in `renderPlan()` markup grouping only; modify `src/components/TripPlanOverview.tsx` only for presentation hooks; modify `src/styles.css`; test Planning composition and invariants.

**Consumes:** Existing Journey Status, Trip Intent, Group DNA, TripPlanOverview, TripSpatialView, Plan Health, contextual tools, Court, and readiness callbacks.

**Produces:** Journey Status → Trip Intent → Group DNA when Group → conflict → itinerary → evidence/promise → health → readiness → tools.

- [ ] Add dynamic-content assertions for `TRIP INTENT · THIS JOURNEY ONLY`, `GENERATED PLAN`, `TRIP PROMISE`, `PLAN HEALTH · EXPLAINED`, and `Must-Go · protected`.
- [ ] Run `npx vitest run src/components/TripPlanOverview.test.tsx src/components/WorkspaceComposition.test.tsx src/domain/core-logic.test.ts src/domain/framework.test.ts` before markup changes; if a named component test is absent, run the discovered matching suite.
- [ ] Add wrappers/classes around the existing sections only. Keep all current children, callbacks, plan values, spatial ownership, Court decisions, and mutation paths unchanged.
- [ ] Use section rhythm and progressive disclosure to make intent and aligned Group DNA compact, conflicts actionable, itinerary rows primary, and Why this?/Plan Health details concise until opened. Anchors remain protected and Floating items remain flexible.
- [ ] Immediately inspect `git diff -- src/AppRescued.tsx`, `git diff -- src/components/TripPlanOverview.tsx`, and `git diff --check`; no domain or state-handler changes are allowed. Rerun focused tests and commit as `style: clarify Planning decision hierarchy`.

### Task 4: Slice 1 checkpoint

**Files:** Inspect all Slice 1 changes; modify `docs/COCOCRUNCH_RESCUE_LOG.md` only after evidence is collected.

- [ ] Run `npm run check`, `git diff --check`, and `git status --short` from the actual Slice 1 tree. TypeScript, all Vitest files, and Vite production build must pass.
- [ ] Run the active app through Home → Trips → Planning. Record actual viewport, document/body scroll widths, console errors, and a screenshot. Check next-action prominence, itinerary readability, bottom navigation, and overflow.
- [ ] Run `npx vitest run src/domain/core-logic.test.ts src/domain/framework.test.ts src/domain/regression.test.ts src/domain/learning.test.ts` to protect existing invariants.
- [ ] Append only Slice 1 evidence to the rescue log, distinguishing code, active-app wiring, tests, exact local validation, runtime verification, screenshot widths, and unavailable widths.
- [ ] Inspect `git diff -- src/AppRescued.tsx`, `git diff --stat`, `git diff --check`, and `git status --short`; add the expected Slice 1 files and commit as `docs: checkpoint visual refinement Slice 1`. Accept only if no canonical sprite or validated domain file changed.
