# CocoCrunch Rescue Log

Living handoff for the V2 rescue pass on `feat/p0-foundation` / PR #1. This file is updated as rescue work continues.

## Ground rules

- CocoCrunch approved visual/product language wins over external design systems.
- Never merge PR #1 during rescue work.
- Do not call prototype-only adapters live data or AI.
- AI suggestion is not execution: plan-changing output needs reason, preview/diff, confirmation, and undo.
- Group governance stays explicit; official Court and entertainment randomness remain separate.
- Continuous location remains off by default; public memories remain private until explicit consent.
- CI status is recorded only when verified against the exact head SHA.
- Source/CSS inspection is not screenshot QA.

## Rescue work completed so far

### IA and trip lifecycle

- Restored global navigation to `Home / Trips / Explore / Memories / Me`.
- `Trips` is a journey index again; opening a trip enters its `Planning / Traveling / Completed` workspace instead of treating lifecycle phases as global navigation.
- Removed the duplicate packing surface: App emits a typed packing experience and the tactile PackingReplica owns presentation.

### Group Court and decision durability

- Generalized Court tallying away from hard-coded `ramen | sushi` IDs.
- Conflict text such as `A vs B` can produce real Court proposal IDs/labels.
- Confirmed Court and emergency decisions write structured, persisted decision records with topic, decision, vote summary, Gacha use, and timestamp.
- Official tie Gacha, everyday indecision Gacha, and entertainment Lucky Draw are separate contexts.

### Tingo → downstream behavior

- Expanded Tingo into an explicit behavior contract: itinerary density, daily stop target, buffer minutes, recommendation bias, accommodation bias, budget mode, change style, and group role.
- Added explainable planning guidance so Tingo dimensions can affect itinerary, budget, accommodation, Court, and recommendation behavior instead of only producing profile adjectives.
- Discovery ranking can be adjusted by Tingo dimensions with user-readable reasons.

### Post-trip learning

- Added per-stop `worth / mixed / skip` learning rules rather than storing item reviews without consuming them.
- Added reconciliation between per-stop reviews and trip-level Worth It feedback.
- Added category-level planned-vs-actual budget variance and learning guidance; this is the domain foundation for #51 rather than a single total-spend number.

### Group responsibility suggestions

- Added advisory responsibility suggestions derived from Tingo group behavior.
- Suggestions never silently overwrite member roles; the intended UI contract is preview → explicit confirmation → apply.

### Signature interaction rescue

- Canonical Coco PNG is authoritative where integrated; CSS anatomy is fallback rather than the primary identity.
- Packing uses the tactile suitcase experience rather than a duplicate drawer implementation.
- Memory Trunk has a physical open state with perspective, layered keepsakes, motion reduction handling, and travel-ephemera depth.
- Gacha received a tactile cream / Sangria / cornflower presentation layer with chamber, capsules, handle cue, press depth, and result reveal. Three.js remains optional; physical feedback is the requirement.

### UI / accessibility polish

- First-pass hierarchy and responsive polish follows CocoCrunch's cream notebook language, using external interface/motion principles only where they support it.
- Added narrow-phone resilience, safe-area awareness, touch-target work, and reduced-motion handling.

## Verification history

- Codex handoff commit `fe38036e71127520108dc44ca115f4b5315eb23d`: pushed to `feat/p0-foundation`; local `npm run check` reported passed.
- Rescue commits after handoff have been pushed only to `feat/p0-foundation`; PR #1 remains unmerged.
- Workflow run #89 for rescue head `0da0c24e238d30543062a00e2938ba47786ecc2f` was verified `completed / success`.
- Later heads must be checked independently; do not infer CI success from an earlier green run.

## Current audit findings

- `persistence.ts` already persists Court options, active conflict, decision history, Tingo answers/dimensions, members and item reviews under versioned storage.
- `trip.ts` now contains responsibility suggestion + explicit-apply helpers; App UI has not consumed them yet, so #28 remains Partial.
- `budget.ts` now contains category actuals, variance and learning guidance; App still uses a single seeded `spent` number, so #51 remains Partial until the Completed UI consumes category actuals.
- `preferences.ts` now consumes per-stop reviews in domain learning; App `confirmLearning()` still calls trip-level `learnFromTrip()` only, so #49 remains Partial until the App uses reconciliation.
- Current App recommendations are still created from base discovery data; Tingo-aware ranking is not yet wired through the visible search flow, so #1 remains Partial.
- Memory Trunk source contains real CSS perspective/opening/keepsake layering and reduced-motion support, but rendered mobile quality remains unverified.

## Still open / do not call Done yet

1. Wire Tingo ranking/guidance through visible App flows and verify each dimension has a meaningful downstream effect.
2. Finish concession preview/rollback semantics for Group Court (#23).
3. Surface personality-derived responsibility suggestions in Group UI with explicit confirmation (#28).
4. Make Completed learning consume per-stop Worth It data and persist the resulting learning (#49).
5. Implement/verify preference-vs-actual retrospective (#50) against actual trip state rather than seeded copy.
6. Surface category planned-vs-actual budget reconciliation and learning in Completed UI (#51).
7. Continue contextual canonical Coco extraction/usage beyond the idle crop.
8. Independently inspect Gacha, Packing, and Memory Trunk rendered behavior; source/CSS inspection is not screenshot QA.
9. Mobile QA at 360 / 390 / 430 px remains required.
10. Run current-head CI after each coherent rescue batch and fix failures on the same branch.

## Next implementation batch

Wire the already-added domain contracts into App state/UI without introducing duplicate state: Tingo-aware discovery, explicit responsibility preview/apply, per-stop review reconciliation, and category budget retrospective. Then verify exact-head CI before moving to deeper signature-interaction/mobile QA.

## Current risk posture

The product is materially healthier than the Codex V2 handoff, but it is **not merge-ready yet**. Remaining risk is concentrated in domain-to-UI closure, retrospective data loops, contextual Coco coverage, and rendered mobile/signature-interaction QA rather than basic TypeScript scaffolding.
