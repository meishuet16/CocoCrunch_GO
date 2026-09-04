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
- `src/domain/concession.ts` now owns an explicit `CourtConcession` record with linked option, offered-by, status, description, and an immutable copied vote snapshot.
- Active Court uses that domain model: attaching captures the exact vote state, withdrawing restores cloned votes from the binding, and any new vote invalidates the stale binding so a later withdrawal cannot erase intentional newer votes.
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
- `suggestResponsibilities()` accepts a per-member behavior map so one traveller's personality is not projected onto everybody.
- The active prototype marks Mei as Tingo-assessed and labels unassessed members as explicit fallback suggestions rather than fake personality inference.
- Member-specific Tingo onboarding for every traveller is still a product-expansion item, not a hidden assumption in the role engine.

### Post-trip learning
- Per-stop `worth / mixed / skip` reviews are consumed by `reconcileTripLearning()` together with trip-level Worth It.
- Confirming learning surfaces profile field changes and stop-level ranking notes.
- #49 is materially implemented in the local prototype flow, subject to rendered/runtime QA.

### Planned vs actual / budget retrospective
- Category-level planned-vs-actual variance and learning guidance are domain-backed.
- Planned pace is derived from Tingo.
- Active App now initializes `delay`, `mood`, and `arrivalChecked` from persisted `CompletedPaceEvidence`, saves that evidence through normal persistence, and computes Completed pace through `paceEvidenceSummary()`.
- `persistence.ts` stores optional group and solo category actuals while remaining backward-compatible with existing `cococrunch:v1` saves.
- Active App owns `groupBudgetActuals` / `soloBudgetActuals`, exposes editable Actual inputs by category, and saves them through normal app persistence.
- Real disruption cost is no longer a detached demo total. Applying a generated rain repair folds its computed cost delta into `activities` actual spend through `updateBudgetActual()`; undo reverses that exact delta.
- Completed retrospective reads the same live/persisted actual state, so #50 and #51 are code-wired closed for the local prototype. Browser reload replay remains a QA task, not an unwired implementation gap.

### Decision History satisfaction
- Completed renders each persisted Decision Record as a specific review item.
- `Worth it / Mixed / Skip next time` writes satisfaction back to that exact record ID through the retrospective domain helper.
- Decision satisfaction is part of the existing `decisionHistory` persistence payload, so it follows the normal local replay path instead of transient UI state.

### Group plan-mutation governance closure
- `gatePlanMutation()` is now consumed by the active App rather than existing only as a domain contract.
- Group Discover no longer says an individual can directly `Add to plan`; the same persisted flag is explicitly presented as `Save to group shortlist`, and copy states the official itinerary is unchanged.
- Ask Coco still provides reason + preview/diff, but Group mode now routes the proposed floating-block move into Group Court instead of mutating a detached display-only time.
- Smart Split creation and reunion requests now route through Group Court rather than toggling shared state from one person's button.
- Solo mode retains direct explicit confirmation for these official changes.
- The generic Court remains the single confirmation surface; the result is still a proposal until `Confirm result`.

## P0 core-logic completion batch

The following batch reconciles the active `src/AppRescued.tsx` flow against the authoritative attached `FINAL_PRODUCT_SPEC.md`. Tingo remains Mei’s long-term travel profile; Trip Vibe, constraints, member preferences, and Group DNA remain trip-specific inputs.

### Implemented in code

- `deriveGroupDNA()` consumes explicit per-member preference/constraint and budget profiles, retains optional support, budget range/sensitivity, and surfaces strong disagreements plus Must-Go versus Strongly Avoid conflicts without averaging them. Unassessed members receive no inferred Mei/Tingo preferences.
- `generateTripPlan()` deterministically ranks destination candidates and emits protected anchors, floating items, buffers, open windows, Trip Promise text, and per-item evidence for Tingo behavior, Trip Vibe, constraints, member preferences, budget, group consensus, and candidate source.
- Confirmed Court labels are passed into generation and Plan Health so a resolved conflict no longer remains an operational risk, while the original Group DNA conflict remains available as source/history evidence.
- `calculatePlanHealth()` derives a documented capped-deduction score from walking load, buffer/time pressure, budget overrun, represented preferences, transfers, protected anchors, unresolved conflicts, and operational risks. Computed output is re-derived rather than persisted.
- `promoteCourtLosers()` filters Backup candidates to useful, supported, viable, Deal-Breaker-safe losing options while preserving support and supplied loss reason. `buildMinimumLossRepair()` protects anchors, ranks viable backups by support and loss metrics, computes cost/time/preference impact, and returns a preview. `applyRepairToPlan()` enforces Group confirmation and supports reversible application.
- Persistence now retains member preference profiles, Court-derived Backup candidates, and their evidence/source state.
- An applied repair decision is persisted as source/evidence state; the visible repaired itinerary and Plan Health are re-derived from that decision after reload, while Plan Health itself is not persisted.

### Wired into the active app

- The active Home journey, Trip Workspace plan, During flow, Group DNA drawer, Backup drawer, Plan Health panel, Court confirmation, disruption repair, and Ask Coco floating-block move consume the domain outputs above.
- Court losers are added to the persisted Backup pool only after confirmation; destination catalog entries remain candidate inputs and do not silently become Backup entries. Deal-Breaker-invalid options are excluded.

### Regression tested

- Added focused coverage for Group DNA conflict surfacing/non-projection, deterministic Must-Go anchors and evidence, explicit member evidence, transparent Plan Health metric changes including operational risks, Court-to-Backup filtering and loss reasons, Gacha tie-only behavior, anchor protection, support-prioritized repair, exact cost/time impact, and Group confirmation gating.
- Local `npm run check` passed: TypeScript, 26 Vitest tests, and Vite production build.

### Verification status

- Exact-head CI: not verified from this checkout; remote GitHub access was unavailable during this batch.
- Browser/runtime verified: not performed.
- Visual/mobile QA verified: not performed. Source/CSS inspection is not screenshot QA.
- PR #1 remains open and unmerged; no push to `main` was performed.

### Signature interaction rescue
- Canonical Coco PNG is authoritative where integrated; CSS anatomy is fallback.
- Packing uses the tactile suitcase experience.
- Memory Trunk has CSS perspective, layered keepsakes, reduced-motion handling and a real open/close state.
- Memory Trunk keepsakes are now semantic buttons with 44px minimum targets, keyboard focus, `aria-pressed`, and tap-to-lift / depth interaction instead of inert spans.
- Gacha has a tactile cream / Sangria / cornflower presentation layer with chamber / capsule / handle cues, press depth and result reveal.
- Three.js remains optional; physical feedback is the requirement.

### Contextual Coco
- Active Coco calls now expose context (`travel`, `court`, `memory`) without redrawing or overlaying fake CSS anatomy/costumes.
- Context changes purposeful motion and shadow behavior using the canonical sprite, with reduced-motion fallbacks.
- This closes contextual behavior wiring. Distinct canonical pose PNG extraction from the source sheet remains optional visual-asset polish, not a requirement for the current behavior contract.

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

Build-green was not enough for the remaining invariant work, so the CI gate runs domain tests as part of `npm run check`:

`tsc --noEmit && vitest run && vite build`

The regression suite covers:
- official Court Gacha eligibility only on a real tie;
- generic proposal IDs rather than food-demo IDs;
- Tingo assessment → concrete planning behavior;
- Tingo-aware discovery explanation/ranking path;
- trip-level + stop-level learning while preserving Must-Go;
- category actual normalization/update without source mutation;
- satisfaction updates only the requested Decision Record while preserving its official verdict;
- planned and actual budget records remain independent and remaining budget cannot become negative;
- responsibility suggestions remain advisory until explicitly applied;
- official Group itinerary mutations are blocked without group confirmation while idea-save/personal draft and explicit Solo writes remain allowed;
- concession binding restores the exact cloned vote snapshot on withdrawal;
- real disruption cost is folded into the affected actual-spend category;
- completed pace evidence maps deterministically to the retrospective summary.

Package/test gate landed across `8269cc0152f658b47e46ad522b9f57266aaf22f3` and `83be6ea4945ae137130dcdfdf5d5c274694088bd`. Exact-head CI run #109 for `83be6ea4945ae137130dcdfdf5d5c274694088bd` completed successfully.

The post-trip fixture was corrected at `d6c8c20488c41129f26ee5d67e017b671655c001`: a previous test expected a food-positive result from one positive and one negative food signal, which correctly failed. The replacement fixture has an unambiguous net-positive food signal rather than weakening production logic to satisfy the test.

The centralized group mutation guard was added at `9cf868b6919bfafe47f7440b5475495f5cd575af`; regression coverage landed at `509394dccfb1635c4c532de2161531ae2fa2b482`.

The main active-App closure landed at `44e87ea6fa60985957ea82a095ae76517f016b8b`.
Memory Trunk tactile keepsakes landed at `1ab88880d916b2cf18a79bcff77869e3970f3643`.
Contextual Coco motion states landed at `f74f870eca6be556b10296e240a3a4e1a3dc27a5`.
Expanded concession / role / retrospective regression coverage landed at `d3da1d5d893606d1b1a6fbb294e127ad9231d31e`, which passed exact-head CI run #128 including TypeScript, Vitest and Vite production build.

This automated suite covers pure/domain and compile/build invariants. It does not prove rendered mobile behavior.

## Current status by previously-open item

1. Tingo downstream wiring — **materially implemented in visible local prototype flow**; rendered per-question behavior QA remains.
2. Concession rollback (#23) — **code-wired closed**: explicit binding + exact snapshot withdrawal + stale-binding invalidation; rendered interaction QA remains.
3. Personality/Tingo role suggestions (#28) — **code-wired closed for available assessment data**: assessed members use their own behavior source, unassessed members are truthfully labelled fallback, and apply remains explicit. Full per-member assessment onboarding is a future expansion rather than fake inference.
4. Per-stop Worth It (#49) — **wired into confirmed learning**; browser persistence replay remains.
5. Preference/planned-vs-actual retrospective (#50) — **code-wired closed** with persisted CompletedPaceEvidence + deterministic summary; browser reload replay remains.
6. Category planned-vs-actual budget (#51) — **code-wired closed** with editable/persisted actuals and disruption-cost category reconciliation; browser reload replay remains.
7. Decision satisfaction / Decision History (#30 extension) — **specific-record UI + persistence wiring implemented**; browser replay remains.
8. Memory Trunk tactile interaction — **implemented** as open/close + semantic tap-to-lift keepsakes with focus/reduced-motion support; rendered visual QA remains.
9. Contextual Coco behavior — **implemented** for travel/Court/memory contexts using the canonical sprite and context-specific purposeful motion; distinct source-sheet pose extraction remains optional visual polish.

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
- Ask Coco and Smart Split no longer bypass Group Court in Group mode.
- Discover group addition is explicitly a shortlist/draft action rather than an official plan write.
- Pure-domain versions of several of these rules fail CI if regressed.

## Still open / do not call merge-ready yet

- Replay persistence in a real browser: edit actual category values, rate a decision, set pace evidence, reload, confirm all survive and computed retrospective remains correct.
- Perform rendered mobile QA at 360 / 390 / 430 px: overflow, safe-area nav, touch targets, Court, Gacha, Packing, Memory Trunk, retrospective controls, drawers/modals, reduced motion.
- Verify signature interaction feel in a real browser; source/CSS inspection is not visual validation.
- Continue the independent #1–#53 audit before final merge recommendation.
- Keep PR #1 open and unmerged until the final audit is complete.

## Current risk posture

The requested #23 / #28 / #50 / #51 rescue targets, active Group mutation governance, Memory Trunk tactile behavior, and contextual Coco behavior are now implemented in code and protected by a stronger CI regression gate. The branch is substantially healthier, but it is still **not safe to merge yet** until browser persistence replay, rendered 360/390/430 mobile QA, signature-interaction visual QA, and the remaining #1–#53 audit are completed.

## Framework execution and final validation checkpoint

The approved framework slices are now complete through the exact validation state below. The full 53-feature reconciliation remains in `docs/superpowers/specs/2026-09-04-full-product-framework-design.md`; this checkpoint does not narrow that source of truth.

### Implemented in code

- Journey/data contracts preserve trip-owned intent, persistent answer-source Tingo, deterministic Group DNA, lifecycle state, spatial honesty, and explicit retrospective learning.
- Workspace composition keeps Home / Trips / Explore / Memories / Me, with Trip Workspace as the planning → traveling → completed journey spine and contextual Map.
- Completed learning uses actual outcome → Worth It/reflection → typed proposal → explicit Confirm or Dismiss. Confirmed questionnaire changes are re-derived into Tingo dimensions; dismissed proposals leave Tingo unchanged; confirmed history is retained separately.
- Tingo can be intentionally retaken from Me. Retaking resets the questionnaire answer source and leaves confirmed learning history intact.

### Wired into active app

- `src/App.tsx` continues to export `AppRescued`; the active app renders `TripJourneyStatus`, `TripWorkspace`, `TripSpatialView`, `TripRetrospective`, Group DNA, deterministic plan/health, Court/Backup/repair, and the Me-owned Tingo handoff.
- The duplicate legacy Worth It control was removed from Memories so reflection cannot bypass actual-outcome gating or the explicit proposal state machine.

### Regression tested

- Exact-head local `npm run check` at `f2a195eaad3ea481cc928cb1a19007130a559a21`: TypeScript passed, 11 Vitest files passed, 58 tests passed, and Vite production build passed.
- Focused learning/framework suite at the same Task 5 state: 4 files passed, 27 tests passed.
- Existing P0 regression coverage remains green for Group DNA conflicts/non-projection, Must-Go protection, deterministic itinerary evidence, Plan Health sensitivity, Court-to-Backup filtering, tie-only Gacha, minimum-loss repair, exact impacts, and Group confirmation gating.

### Browser/runtime verified

- Verified with the active local Vite app in the Codex in-app browser at `http://127.0.0.1:5174/`.
- Group planning, traveling, and completed lifecycle states rendered; spatial copy remained local/schematic and did not claim live location, routing, traffic, travel time, weather, or provider data.
- Dismissed learning survived reload with its dismissed message; confirmed learning did not regenerate after reload and confirmed history remained visible in Me.
- Tingo retake reset the answer source to `0% COMPLETE` and that state survived reload while confirmed history remained visible.
- Solo planning, traveling, and completed workspace states rendered; privacy stayed opt-in and Community remained private by default with explicit Publish control.
- Browser console error check returned an empty list after these flows.

### Visually/mobile verified

- A real screenshot was inspected at the available narrow browser viewport (`innerWidth` 362px; document client/scroll width 347px). Bottom navigation remained visible and no horizontal overflow was detected.
- Exact 360 / 390 / 430px viewport runs, reduced-motion interaction pass, and broader signature-interaction visual QA were not available in this session; source/CSS inspection is not being counted as those checks.

### Exact CI state and remaining limitations

- Remote PR #1 remains open and unmerged at remote head `7ee62bd30b24e624da3bb3867c1f8192205e5b32`; its CI run #129 completed successfully. The final local head `ea497255479fe6276c513b530e0075ae090dcdec` was not pushed, so that remote result does not validate the final local commits and no final-SHA remote CI-green claim is made. Local exact-head validation is green as recorded above.
- Live destination providers, routing, traffic, weather, inventory/pricing, and full per-member Tingo onboarding remain intentionally unavailable or prototype-scoped.
- PR #1 remains open and unmerged. No push to `main` was performed.
