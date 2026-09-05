# CocoCrunch Visual Refinement Design

**Date:** 2026-09-04  
**Repository:** `meishuet16/CocoCrunch_GO`  
**Branch:** `feat/p0-foundation`  
**Validated baseline:** `ebc9eced07fce78409025aa7acdf5fc03a779ce0`

## Purpose

Refine CocoCrunch's presentation, information hierarchy, and mobile UX so the validated product feels like one calm trip moving through Before / During / After. This is a presentation-first pass. It does not restart the product architecture, rewrite domain rules, integrate live providers, or integrate the canonical Coco sprite sheet.

## Authority order

1. `FINAL_PRODUCT_SPEC.md`
2. Validated domain and business invariants
3. Approved framework and journey architecture in `docs/superpowers/specs/2026-09-04-full-product-framework-design.md`
4. The five supplied visual references
5. The existing CocoCrunch visual identity

When visual inspiration conflicts with Must-Go protection, Group governance, privacy, explicit confirmation, learning rules, or data honesty, the validated product rule wins.

## Guardrails

- Preserve Tingo as persistent long-term identity and Trip Intent as trip-owned state.
- Preserve Group DNA, Court, true-tie-only Court Gacha, deterministic itinerary generation, Plan Health, Backup viability, minimum-loss repair, Group confirmation, Apply/Undo, ready state, privacy defaults, and learning Confirm/Dismiss.
- Do not infer live weather, routing, traffic, venue status, pricing, GPS, family tracking, or provider timestamps.
- Do not make Journey State a linear wizard; its next action remains advisory.
- Do not make Home or Traveling a feature directory.
- Do not collapse Court Gacha, Everyday Gacha, and Lucky Draw into one behavior.
- Do not render Family Window and Location Privacy as the same settings surface.
- Leave `src/assets/coco/source/coco-canonical-sheet.png` untouched.
- Keep PR #1 open and unmerged; never push to `main`.

## Experience model

The product should read as one trip workspace with lifecycle access:

`Before / Planning → During / Traveling → After / Completed`

Global navigation remains `Home / Trips / Explore / Memories / Me`. Map remains contextual inside the active Trip Workspace.

### Home

Home answers, in order:

1. Where am I going?
2. What phase is this trip in?
3. What matters right now?
4. What should I probably do next?

The active trip, lifecycle phase, Journey State action, and current status are primary. Readiness, health, budget, and Group status are quiet secondary context. Feature tools are not promoted into a dashboard.

### Planning

Planning uses this visual narrative:

`Journey status / next action → Trip Intent → People / Group DNA when Group → unresolved decision → itinerary → Why this? / Trip Promise → Plan Health → Backup / readiness → contextual tools`

Trip Intent is a compact brief for this journey, visually distinct from Tingo. Group DNA is calm when aligned and emphasized only when an actual conflict requires attention. Court is a focused decision moment. Itinerary rows make time, sequence, Anchor/Floating status, and concise evidence scannable. Why this? expands evidence only when requested. Trip Promise is presented as the concise contract the plan protects. Plan Health emphasizes actionable risks rather than displaying every metric at equal weight.

### Traveling

Traveling is the highest-priority refinement slice. Its hierarchy is:

`Today / current-next → Trip Conditions → disruption only when relevant → repair → contextual tools`

The normal state is calm and shows current activity, next activity, relevant time, manual check-in, and Anchor/Floating semantics. It must not imply automatic GPS progress. A Trip Conditions surface communicates whether a supported or explicitly simulated/user-reported condition affects today's plan. Repair language is traveller-facing while retaining the domain distinction that no direct Backup does not mean no repair. Contextual tools such as mood, reunion, safety, Ask Coco, Gacha, Family Window, and Location Privacy are progressively disclosed.

Family Window answers “What trip/safety information do I intentionally share with family?” Location Privacy answers “What location data may CocoCrunch use?” Family Window remains useful with Location Privacy off/manual and never silently enables location.

### Completed and Memories

Completed preserves this order:

`actual outcome → planned vs actual → Worth It / reflection → proposed Tingo learning → Confirm / Dismiss → Memory Trunk / Photo Map / expressive artifacts`

Memories is an emotional archive of completed trips. Memory Trunk, Photo Map, Ghost Wish, Future Postcard, and Community remain expressive or archival outcomes; they do not replace retrospective learning or silently update Tingo.

### Me and Explore

Me foregrounds persistent Tingo identity, derived dimensions, intentional retake/update, travel history, and confirmed learning history. Trip-specific intent remains reachable through the active Trip Workspace, not as permanent Tingo identity. Explore remains lightweight discovery with `Save idea` as personal/non-official and `Suggest to group` as a proposal; neither bypasses Group governance.

## Visual system direction

Refine shared presentation primitives instead of adding a new UI framework or duplicating per-screen CSS:

- Preserve the cream, sangria, blue, paper, and CocoCrunch identity.
- Use serif display typography for journey moments and readable sans-serif body text.
- Establish a consistent spacing rhythm and restrained page width.
- Prefer whitespace, grouping, and typography over borders, shadows, badges, pills, gradients, and uppercase labels.
- Give one task or decision clear visual priority per screen.
- Keep cards for meaningful groupings, not every domain object.
- Preserve visible focus, disabled states, semantic hierarchy, touch targets, safe-area padding, and reduced-motion behavior.

## Implementation boundaries and files

The active implementation remains `src/AppRescued.tsx` through `src/App.tsx`. Slice work may make controlled markup/grouping edits there, but must inspect `git diff -- src/AppRescued.tsx` immediately after every edit.

Shared presentation work belongs primarily in `src/styles.css` and existing presentation CSS files. Existing components should be refined before being replaced. Small focused components may be added when they create a genuine presentation boundary, especially for Trip Conditions or the distinct Family Window / Location Privacy surfaces. Domain files under `src/domain/` are read-only unless a rendered regression proves an existing contract cannot be represented correctly.

## Four-slice delivery plan

### Slice 1 — shared visual system + Home + Planning

- Establish shared type, spacing, surface, section, button, itinerary, status, and responsive primitives.
- Make Home an active-trip orientation surface with clear next action.
- Rebalance Planning around the approved decision progression.
- Preserve actual plan generation, evidence, Group DNA, Court, Trip Promise, Plan Health, Backup, and readiness behavior.
- Add or adjust only presentation-focused component tests where markup contracts change.
- Run focused tests, `npm run check`, `git diff --check`, and a narrow rendered mobile inspection before committing.

### Slice 2 — Traveling + Trip Conditions + repair + Family/Location separation

- Reorder Traveling around Today/current-next and contextual conditions.
- Present explicit simulated/user-reported conditions honestly; do not add live providers.
- Translate repair states into traveller-facing language while keeping preview, impact, anchor protection, Group confirmation, Apply, and Undo intact.
- Give Family Window a share-preview mental model and Location Privacy a location-access/precision mental model.
- Verify Family Window remains useful with manual/status-only location and does not enable location.
- Run focused tests, rendered mobile inspection, `npm run check`, and diff review before committing.

### Slice 3 — Completed + Memories + Me + Explore + contextual random/signature features

- Make actual outcome and learning precede expressive memory surfaces.
- Make Memories an archive and Me a calm Tingo/history home.
- Keep Explore discovery and Group proposal actions visibly distinct.
- Contextualize Court Gacha inside Court, Everyday Gacha around optional Floating/free moments, and Lucky Draw as de-emphasized entertainment.
- Keep Pray optional, contextual, and non-mutating without coupling it to repair.
- Run focused tests, rendered mobile inspection, `npm run check`, and diff review before committing.

### Slice 4 — responsive/accessibility QA + validation + documentation

- Exercise actual rendered widths available in the environment, targeting 360px, 390px, 430px, representative tablet, and representative desktop.
- Check Home, Planning, Traveling normal/disruption, repair preview, Court, Completed, Memories, Me, drawers, modals, long names, touch targets, safe-area behavior, focus, accessible names, contrast, and reduced motion.
- Run complete validation from the final working tree.
- Update [docs/COCOCRUNCH_RESCUE_LOG.md](../../COCOCRUNCH_RESCUE_LOG.md) and PR #1 description with actual final state, exact test counts, provider limitations, and exact visual-QA coverage.
- Push only `feat/p0-foundation`, inspect CI for the exact pushed HEAD, and keep PR #1 open and unmerged.

## Validation contract

Every slice must record:

- focused interaction tests for changed behavior;
- `npm run check` with TypeScript, full Vitest, and Vite production build;
- `git diff --check`;
- exact `git status --short` and diff inspection;
- runtime console result and screens actually exercised;
- screenshots and viewport widths actually inspected;
- unverified widths or interactions stated explicitly.

Presentation changes must not regress Tingo source-of-truth, Trip Intent separation, Group DNA, Court governance, Explore governance, Must-Go protection, Anchor/Floating semantics, Plan Health, Backup/repair, Group confirmation, Apply/Undo, ready state, privacy, learning, persistence, or Solo/Group separation.
