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
- Added a concession snapshot path: attaching a concession captures the pre-concession vote state; withdrawing restores that snapshot. This remains a prototype rollback model pending rendered interaction QA.

### Tingo → visible downstream behavior
- Tingo derives itinerary density, daily stop target, buffer minutes, recommendation bias, accommodation bias, budget mode, change style, and group role.
- Tingo guidance is visible in Planning / Trip Setup / Group Court explanation copy.
- Destination discovery calls `discoverPlaces(destination, tingoDimensions)`, so dimensions alter ranking and explanation text.
- Completing / refreshing Tingo re-ranks the current destination recommendations.
- Explore surfaces current Tingo recommendation / pace / budget / accommodation signals.

### Group responsibility suggestions
- Group DNA previews responsibility suggestions derived from current Tingo behavior.
- Suggestions require explicit `Confirm & apply suggested roles`; they do not silently overwrite roles.
- #28 remains Partial because the prototype has one persisted Tingo profile rather than a separate assessment for every member.

### Post-trip learning
- Per-stop `worth / mixed / skip` reviews are consumed by `reconcileTripLearning()` together with trip-level Worth It.
- Confirming learning surfaces profile field changes and stop-level ranking notes.
- #49 is materially implemented in the local prototype flow, subject to rendered/runtime QA.

### Planned vs actual / budget retrospective
- App consumes category actuals through the budget domain and shows category-level planned-vs-actual variance plus learning guidance.
- Planned pace is derived from Tingo; actual pace copy is derived from runtime disruption / energy / arrival state.
- #50 / #51 are materially improved, but actual spend is still deterministic local prototype data rather than a live transaction/import source.

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
- `src/App.tsx` exports `AppRescued`, so the rescued flow is the active application.
- Activation commit `756dc73343508301c71540da6bf1012bb7e09391` passed exact-head CI run #98.
- Integration/log head `6564dacabbcadf4a94da441a6392a861dfe0445d` passed exact-head CI run #99.

## Audit batch: persistence / retrospective state

The audit found a real closure gap: the active App displays category actuals, but those values are still imported deterministic defaults and were not representable in persisted trip state. `DecisionRecord.satisfaction` also existed in the schema without a completed UI linkage.

- `persistence.ts` now supports optional persisted `groupBudgetActuals` and `soloBudgetActuals` while remaining backward-compatible with existing `cococrunch:v1` saves.
- Persistence schema commit `41d6a01da16b94a85fe1f007d1735c056de9e806` passed exact-head CI run #100 (`npm run check`).
- This schema addition does **not** by itself close #51: the active App still needs to own/edit/save actual category spend rather than reading deterministic defaults.
- Decision satisfaction remains open: the record field exists, but Completed still needs an explicit rating action tied to a specific persisted decision.

## Current status by previously-open item
1. Tingo downstream wiring — **materially implemented in visible local prototype flow**; still needs rendered behavior QA and per-question audit.
2. Concession rollback (#23) — **prototype rollback implemented**; needs interaction QA and final invariant review.
3. Personality/Tingo role suggestions (#28) — **visible + explicit apply**, still Partial because member-level personality data is not individually assessed.
4. Per-stop Worth It (#49) — **wired into confirmed learning**; still needs runtime / persistence replay QA.
5. Preference/planned-vs-actual retrospective (#50) — **derived from live prototype state instead of fixed copy**, but still local prototype data.
6. Category planned-vs-actual budget (#51) — **visible and domain-backed, but still Partial** until active App actual-category state is editable/persisted.

## Invariant sweep observations
- Must-Go remains rendered as a protected anchor and the disruption repair explicitly keeps it.
- Group disruption apply is disabled until emergency approval in group mode.
- Official Court Gacha is rendered only on a true tally tie; a majority locks it.
- Court Gacha output remains a proposal until `Confirm result`.
- Everyday Gacha and Lucky Draw remain separate drawer contexts and do not write official Court state.
- Family Window text and state keep continuous location off unless explicitly enabled.
- Memory/publication controls remain opt-in.
- Source audit still needs a dedicated regression test layer; these observations are not a substitute for runtime QA.

## Still open / do not call merge-ready yet
- Wire editable/persisted category actuals into active App, then replay persistence.
- Link Decision History satisfaction to specific persisted records.
- Independently audit all #1–#53 requirements against active `AppRescued`; do not inherit Codex labels.
- Re-check all 15 business invariants after each remaining integration change.
- Continue contextual canonical Coco extraction/usage beyond the current minimal idle asset.
- Perform rendered mobile QA at 360 / 390 / 430 px: overflow, safe-area nav, touch targets, Court, Gacha, Packing, Memory Trunk, drawers/modals, reduced motion.
- Verify signature interaction quality in a real browser; source/CSS inspection is not visual validation.
- Remove compatibility/migration debt only after proving no active UI depends on it.
- Keep PR #1 open and unmerged until the final audit is complete.

## Current risk posture

The active branch is type/build healthy through the persistence-schema audit, but it is **not yet safe to merge**. Remaining risk is concentrated in actual-spend state closure, decision-satisfaction linkage, rendered mobile/signature QA, contextual Coco coverage, full #1–#53 compliance, and regression/invariant verification.
