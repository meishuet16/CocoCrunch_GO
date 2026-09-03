# CocoCrunch Rescue Log

Living handoff for the V2 rescue pass on `feat/p0-foundation` / PR #1. Update this file after each coherent rescue batch.

## Ground rules

- CocoCrunch approved visual/product language wins over external design systems.
- Never merge PR #1 during rescue work.
- Do not call prototype-only adapters live data or AI.
- AI suggestion is not execution: plan-changing output needs reason, preview/diff, confirmation, and undo.
- Group governance stays explicit; official Court and entertainment randomness remain separate.
- Continuous location stays off by default; public memories stay private until explicit consent.
- CI status is recorded only when verified against the exact head SHA.
- Source/CSS inspection is not screenshot QA.

## Rescue work completed so far

### IA and trip lifecycle

- Restored global navigation to `Home / Trips / Explore / Memories / Me`.
- `Trips` is a journey index; opening a trip enters `Planning / Traveling / Completed`.
- Removed the duplicate Packing drawer path. The typed Packing experience owns the tactile suitcase UI.

### Group Court and decision durability

- Generalized Court tallying away from hard-coded `ramen | sushi` proposal IDs.
- Conflict text such as `A vs B` can create actual Court proposals.
- Confirmed Court and emergency decisions write persisted structured decision records.
- Official unresolved-tie Gacha, everyday indecision Gacha, and entertainment Lucky Draw remain separate contexts.
- Added a concession snapshot path: attaching a concession captures the pre-concession vote state; withdrawing the concession restores that snapshot instead of merely changing a visual toggle. This is a prototype-level rollback model for #23 and still needs rendered interaction QA.

### Tingo → visible downstream behavior

- Tingo now derives itinerary density, daily stop target, buffer minutes, recommendation bias, accommodation bias, budget mode, change style, and group role.
- Tingo guidance is now visible in Planning / Trip Setup / Group Court explanation copy rather than staying as unused domain helpers.
- Destination discovery now calls `discoverPlaces(destination, tingoDimensions)`, so current Tingo dimensions actually alter ranking and explanation text.
- Completing / refreshing Tingo re-ranks the current destination recommendations.
- Explore surfaces current Tingo recommendation / pace / budget / accommodation signals instead of a fixed generic vibe row.

### Group responsibility suggestions

- Group DNA now previews responsibility suggestions derived from the current Tingo behavior.
- Suggestions are explicitly advisory and require `Confirm & apply suggested roles`; they do not silently overwrite roles.
- This improves #28, but it remains Partial because the prototype has one persisted Tingo profile rather than a separate assessment for every member.

### Post-trip learning

- Per-stop `worth / mixed / skip` reviews are now consumed by `reconcileTripLearning()` together with the trip-level Worth It review.
- Confirming learning surfaces both profile field changes and stop-level ranking notes.
- This closes the previous wiring hole where item reviews were persisted but ignored. #49 is now materially implemented in the local prototype flow, subject to rendered/runtime QA.

### Planned vs actual / budget retrospective

- App no longer uses one hard-coded total as the only retrospective source. It consumes category actuals through the budget domain.
- Completed now shows category-level planned vs actual variance for food / transport / stay / activities, plus budget-learning guidance.
- Planned pace is derived from Tingo; actual pace copy is derived from runtime disruption / energy / arrival state instead of fixed retrospective prose.
- #50 / #51 are materially improved, but actual spend is still local deterministic prototype data rather than a live transaction/import source.

### Signature interaction rescue

- Canonical Coco PNG is authoritative where integrated; CSS anatomy is fallback.
- Packing uses the tactile suitcase experience.
- Memory Trunk has CSS perspective, layered keepsakes, reduced-motion handling and a real open/close state.
- Gacha has a tactile cream / Sangria / cornflower presentation layer with chamber / capsule / handle cues, press depth and result reveal.
- Three.js remains optional; physical feedback is the requirement.

### UI / accessibility polish

- Preserved CocoCrunch cream notebook language rather than replacing it with generic SaaS styling.
- Added narrow-phone resilience, safe-area awareness, touch-target work and reduced-motion handling.

## Activated integration batch

- Added `src/AppRescued.tsx` as the integrated app implementation.
- CI run #97 validated the new file before activation: `npm run check` completed successfully.
- `src/App.tsx` now exports `AppRescued`, so the rescued flow is the active application rather than dead/unreferenced code.
- Exact activation commit: `756dc73343508301c71540da6bf1012bb7e09391`.
- CI run #98 for that exact activation commit completed successfully, including `npm run check`.

## Current status by previously-open item

1. Tingo downstream wiring — **materially implemented in visible local prototype flow**; still needs rendered behavior QA and per-question audit.
2. Concession rollback (#23) — **prototype rollback implemented**; needs interaction QA and final invariant review.
3. Personality/Tingo role suggestions (#28) — **visible + explicit apply**, still Partial because member-level personality data is not individually assessed.
4. Per-stop Worth It (#49) — **wired into confirmed learning**; still needs runtime / persistence replay QA.
5. Preference/planned-vs-actual retrospective (#50) — **derived from live prototype state instead of fixed copy**, but still local prototype data.
6. Category planned-vs-actual budget (#51) — **visible and domain-backed**, but actuals remain deterministic local prototype data.

## Still open / do not call merge-ready yet

- Independently audit all #1–#53 requirements against the active `AppRescued` flow; do not inherit Codex labels.
- Re-check all 15 business invariants after the new integration wiring.
- Validate persistence replay for Tingo-ranked recommendations and post-trip learning.
- Review Decision History satisfaction linkage; records support satisfaction but the UI flow is not yet fully linked.
- Continue contextual canonical Coco extraction/usage beyond the current minimal idle asset.
- Perform rendered mobile QA at 360 / 390 / 430 px: overflow, safe-area nav, touch targets, Court, Gacha, Packing, Memory Trunk, drawers/modals, reduced motion.
- Verify signature interaction quality in a real browser; source/CSS inspection is not visual validation.
- Remove compatibility/migration debt only after proving no active UI depends on it (for example legacy Court demo compatibility fields).
- Keep PR #1 open and unmerged until the final audit is complete.

## Current risk posture

The biggest previous problem — domain helpers existing without the visible app consuming them — has now been reduced substantially. The branch is type/build healthy at the activated rescued flow, but it is **not yet safe to merge** because the remaining risk is now concentrated in rendered mobile QA, persistence/replay behavior, full #1–#53 compliance, contextual Coco coverage, and regression/invariant verification.
