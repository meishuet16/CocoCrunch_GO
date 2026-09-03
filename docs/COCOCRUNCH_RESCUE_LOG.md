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
- Generalized Court tallying away from hard-coded proposal IDs.
- Conflict text such as `A vs B` can create actual Court proposals.
- Confirmed Court and emergency decisions write persisted structured decision records.
- Official unresolved-tie Gacha, everyday indecision Gacha, and entertainment Lucky Draw remain separate contexts.
- Added a concession snapshot path: attaching a concession captures the pre-concession vote state; withdrawing restores that snapshot. This remains a prototype rollback model pending rendered interaction QA.
- Removed the legacy `ramen` / `sushi` compatibility counters from `CourtResult`; active UI reads the generic `counts` map.

### Tingo → visible downstream behavior
- Tingo derives itinerary density, daily stop target, buffer minutes, recommendation bias, accommodation bias, budget mode, change style, and group role.
- Tingo guidance is visible in Planning / Trip Setup / Group Court explanation copy.
- Destination discovery calls `discoverPlaces(destination, tingoDimensions)`, so dimensions alter ranking and explanation text.
- Completing / refreshing Tingo re-ranks current destination recommendations.
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
- Category-level planned-vs-actual variance and learning guidance are domain-backed.
- Planned pace is derived from Tingo; actual pace copy is derived from runtime disruption / energy / arrival state.
- `persistence.ts` stores optional group and solo category actuals while remaining backward-compatible with existing `cococrunch:v1` saves.
- `domain/retrospective.ts` normalizes/updates actual spend and rates specific Decision Records.
- Active App owns `groupBudgetActuals` / `soloBudgetActuals` state, initializes them from persisted values with deterministic defaults only as first-run fallback, exposes editable Actual inputs by category, and saves them through normal app persistence.
- Completed retrospective reads the same live/persisted actual state, so #51 is no longer just a deterministic display. It remains local prototype data rather than bank/receipt/import integration.

### Decision History satisfaction
- Completed renders each persisted Decision Record as a specific review item.
- `Worth it / Mixed / Skip next time` writes satisfaction back to that exact record ID through the retrospective domain helper.
- Decision satisfaction is part of the existing `decisionHistory` persistence payload, so it follows the normal local replay path instead of transient UI state.

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

## Persistence / retrospective closure batch

- Persistence schema commit `41d6a01da16b94a85fe1f007d1735c056de9e806` passed exact-head CI run #100.
- Rescue-log head `972b91277197e30ea233437dbc7d2dd735bba841` passed exact-head CI run #101.
- Court generic-result cleanup landed at `4374f8e6f7620eef550bec982fa30f7ee35d7e67`.
- `src/domain/retrospective.ts` was added at `52b8f46f3cdb57f705b81731caae7206554afb64`.
- Active App retrospective closure landed at `4efbeb688778fe8d702cd739b5b98b7e51e48dd5` and passed exact-head CI run #105.
- Rescue-log head `9a38f3edae6f289fffbe325f0f9f8d3dece8f275` passed exact-head CI run #106.

## Automated domain regression gate

Build-green was not enough for the remaining invariant work, so the CI gate now runs domain tests as part of `npm run check`:

`tsc --noEmit && vitest run && vite build`

The first regression suite covers:
- official Court Gacha eligibility only on a real tie;
- generic proposal IDs rather than food-demo IDs;
- Tingo assessment → concrete planning behavior;
- Tingo-aware discovery explanation/ranking path;
- trip-level + stop-level learning while preserving Must-Go;
- category actual normalization/update without source mutation;
- satisfaction updates only the requested Decision Record while preserving its official verdict.

Package/test gate landed across `8269cc0152f658b47e46ad522b9f57266aaf22f3` and `83be6ea4945ae137130dcdfdf5d5c274694088bd`. Exact-head CI run #109 for `83be6ea4945ae137130dcdfdf5d5c274694088bd` completed successfully, including the new Vitest step through `npm run check`.

This automated suite covers pure domain invariants only. It does not prove browser orchestration, modal/drawer interaction, persistence reload, or rendered mobile behavior.

## Current status by previously-open item

1. Tingo downstream wiring — **materially implemented in visible local prototype flow**; pure behavior now has regression coverage, rendered per-question behavior QA remains.
2. Concession rollback (#23) — **prototype rollback implemented**; still needs interaction/browser QA because it is component state rather than a pure-domain transaction.
3. Personality/Tingo role suggestions (#28) — **visible + explicit apply**, still Partial because member-level personality data is not individually assessed.
4. Per-stop Worth It (#49) — **wired into confirmed learning**; pure reconciliation has regression coverage, persistence reload still needs browser replay.
5. Preference/planned-vs-actual retrospective (#50) — **derived from active prototype state instead of fixed copy**; runtime pace signals are not all persisted yet.
6. Category planned-vs-actual budget (#51) — **editable + persisted local prototype implementation wired**; actual-state helpers now have regression coverage, browser replay remains.
7. Decision satisfaction / Decision History (#30 extension) — **specific-record UI + persistence wiring implemented**; specific-record mutation now has regression coverage, browser replay remains.

## Invariant sweep observations

- Must-Go remains rendered as a protected anchor and disruption repair explicitly keeps it.
- Group disruption apply is disabled until emergency approval in group mode.
- Official Court Gacha is rendered only on a true tally tie; a majority locks it.
- Court Gacha output remains a proposal until `Confirm result`.
- Everyday Gacha and Lucky Draw remain separate drawer contexts and do not write official Court state.
- Family Window text and state keep continuous location off unless explicitly enabled.
- Memory/publication controls remain opt-in.
- Court result calculation is fully proposal-ID agnostic.
- Editing retrospective actual spend does not mutate the planned budget; plan and actual remain separate records.
- Decision satisfaction updates one existing Decision Record rather than creating/replacing the official decision.
- Pure-domain versions of several of these rules now fail CI if regressed.

## Newly identified replay gap

The #50 pace retrospective currently derives `actualPaceCopy` from runtime-only `delay`, `mood`, and `arrivalChecked`. Those signals are not persisted today, so a reload can lose the actual-pace evidence even though category spend and decision satisfaction survive. Treat #50 as Partial until the minimum retrospective runtime signals needed for Completed are replayable or an explicit completed-trip actual record replaces them.

## Still open / do not call merge-ready yet

- Close the #50 replay gap for actual pace / completed-trip signals.
- Replay persistence in a real browser: edit actual category values, rate a decision, reload, confirm both survive and computed retrospective remains correct.
- Independently audit all #1–#53 requirements against active `AppRescued`; do not inherit Codex labels.
- Extend regression coverage to the remaining pure business rules where practical; keep UI-only rules for browser QA rather than faking unit coverage.
- Continue contextual canonical Coco extraction/usage beyond the current minimal idle asset.
- Perform rendered mobile QA at 360 / 390 / 430 px: overflow, safe-area nav, touch targets, Court, Gacha, Packing, Memory Trunk, retrospective controls, drawers/modals, reduced motion.
- Verify signature interaction quality in a real browser; source/CSS inspection is not visual validation.
- Keep PR #1 open and unmerged until the final audit is complete.

## Current risk posture

The branch now has an automated pure-domain regression gate in addition to type/build CI, and the major retrospective state paths are wired. It is still **not safe to merge yet** because the #50 replay gap, browser persistence replay, rendered mobile/signature QA, contextual Coco coverage, and full #1–#53 audit remain outstanding.
