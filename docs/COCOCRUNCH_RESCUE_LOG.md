# CocoCrunch Rescue Log

Living handoff for the V2 rescue pass on `feat/p0-foundation` / PR #1.

## Ground rules

- CocoCrunch approved visual/product language wins over external design systems.
- Never merge PR #1 during rescue work.
- Do not call prototype-only adapters live data or AI.
- AI suggestion is not execution: plan-changing output needs reason, preview/diff, confirmation, and undo.
- Group governance stays explicit; official Court and entertainment randomness remain separate.
- Continuous location remains off by default; public memories remain private until explicit consent.
- CI status is recorded only when verified against the exact head SHA.

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

## Still open / do not call Done yet

- Wire Tingo ranking/guidance through every relevant App flow and verify behavior in the rendered product.
- Finish concession preview/rollback semantics for Group Court (#23).
- Surface personality-derived responsibility suggestions in Group UI with explicit confirmation (#28).
- Surface per-stop Worth It learning and category budget variance in Completed UI (#49/#51), not only domain helpers.
- Verify preference-vs-actual retrospective (#50) against real state rather than seeded copy.
- Continue contextual canonical Coco extraction/usage beyond the idle crop.
- Independently inspect Gacha, Packing, and Memory Trunk rendered behavior; source/CSS inspection is not screenshot QA.
- Mobile QA at 360 / 390 / 430 px remains required.
- Run current-head CI after each coherent rescue batch and fix failures on the same branch.

## Current rescue batch

This batch adds the domain contracts for Tingo-derived group responsibilities and category-level planned-vs-actual budget learning, plus this living rescue log. Next step is wiring these contracts into the App UI and persistence without duplicating state.
