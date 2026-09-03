# CocoCrunch

**COCO IN YOUR AREA.**

A group travel planner built for preferences, surprises, and plans that go wrong.

CocoCrunch treats travel as two kinds of uncertainty at once: human disagreement and real-world disruption. The product keeps disagreement visible until the group resolves it, protects Must-Go anchors, and repairs the plan around what still matters when reality changes.

## Product rules

- Must-Go items are protected anchors and cannot be silently AI-replaced.
- One individual cannot rewrite the official group itinerary; substantive changes go through Group Court, including timed emergency approval during disruptions.
- Gacha is a tie-breaker only after a true unresolved vote tie. It is not a general random planner.
- Disruption repair protects anchors first, prefers high-support viable backups, previews impact before execution, requires confirmation, and exposes undo.
- AI suggestions are proposals, not execution.
- Family Window is reassurance rather than surveillance. Continuous location is separate and off by default.
- Community sharing is private by default.
- Prayer is a post-repair emotional ritual and never changes weather or planning logic.

## Current prototype

The mobile prototype covers budgeting, itinerary planning, group preference syncing, solo/group mode, destination discovery, Group Court, disruption repair, packing ownership, Family Window/privacy, and post-trip memories.

Core interactions implemented in the current feature branch include:

- member-level Group Court voting with computed majority/tie and tie-only Gacha
- editable category budgets with computed planned/remaining totals
- confirmed post-trip preference learning that writes back into the profile
- versioned local persistence for durable product state
- destination-aware local demo catalogs for Tokyo, Kyoto and Osaka with explicitly marked fallback data
- Capture Capsule, Coco courier, staged split-bill receipt, and multi-step optional prayer ritual
- openable Memory Trunk, Ghost Wish revive/release history, and Future Postcard
- disruption preview → emergency group approval → apply/undo, with Must-Go anchors protected

## Architecture

Business rules live under `src/domain/` rather than inside presentation code. Signature interactions use the typed `experience.ts` event boundary instead of DOM selectors or text inspection. Durable state is owned by `persistence.ts`; transient overlay and animation state is intentionally not persisted.

## Data honesty

The discovery catalog is prototype data, not a live places service. Unknown destinations show an explicit fallback label instead of pretending that Tokyo examples are live results. A production datasource can replace the discovery boundary without changing the planning flow.

## Validation

`npm run check` runs TypeScript validation and a Vite production build through GitHub Actions CI.
