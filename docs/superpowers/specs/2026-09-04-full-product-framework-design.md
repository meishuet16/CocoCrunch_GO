# CocoCrunch Full Product Framework Design

Date: 2026-09-04  
Branch: `feat/p0-foundation`  
Baseline: `c2b74b4da45678c2d6f4f6f9a104234a5f16b375`

## Authority and scope

`FINAL_PRODUCT_SPEC.md` is the product source of truth for this design. The attached visual references are UX and journey references only; they do not authorize copying their branding, characters, layouts, typography, or visual identity. `docs/COCOCRUNCH_RESCUE_LOG.md` remains implementation history and handoff context.

This design completes the product framework around the existing active implementation. It preserves the validated P0 domain rules and does not restart, rewrite, merge, or push the app. The active app remains `src/AppRescued.tsx`, exported by `src/App.tsx`.

No canonical Coco sprite extraction is included in this batch.

## Product outcome

The first-time user should understand:

- which trip is active;
- whether the journey is in planning, traveling, or completed;
- what meaningful action is recommended next;
- what Tingo knows about the user and what belongs only to this trip;
- what the group agrees on and where disagreement remains;
- why an itinerary item or recommendation exists;
- which items are protected;
- when Court or Emergency Court is required;
- what disruption repair will change before it is applied; and
- how the completed trip becomes explicit learning without silently rewriting the long-term profile.

The product uses progressive disclosure. Features appear when their trigger makes them relevant, remain inspectable when useful, and become evidence/history/memory after completion. The experience should feel like a calm travel notebook, not a feature dashboard.

## Non-negotiable invariants

The following existing rules remain authoritative:

- Tingo is a long-term personal profile, persistent but intentionally updateable.
- Tingo is separate from Trip Vibe and all trip-specific constraints.
- If Tingo dimensions are derived from questionnaire answers, answers are the editable source of truth and dimensions are re-derived.
- Historical Tingo snapshots are retained only for explicit, versioned product reasons such as confirmed learning history.
- Group DNA uses explicit per-member preference, constraint, budget, and assessment data.
- Mei's Tingo behavior is never projected onto an unassessed member.
- Strong disagreements remain visible; there is no silent averaging of strong conflict.
- Must-Go items are protected anchors and cannot be AI-replaced.
- Deal Breakers invalidate candidates and Court losers that violate them.
- Official Group itinerary mutations require Group confirmation or Emergency Court.
- Court majority decides normally; Gacha is allowed only for a true unresolved tie.
- Everyday Gacha is separate from governance and never writes official itinerary or learning state.
- Backup candidates come only from useful, viable, Deal-Breaker-safe alternatives and preserve support and loss context.
- Disruption repair protects anchors first, prefers viable high-support alternatives, previews impact, and supports Apply and Undo.
- AI may propose and explain but cannot silently execute critical planning decisions.
- Family Window is reassurance, not surveillance; status-only sharing is the default.
- Community sharing is private by default and requires explicit consent.
- Computed outputs such as Group DNA, itinerary, Plan Health, journey state, and next action are re-derived from persisted source state.

## Global navigation

Retain the existing five top-level destinations:

`Home / Trips / Explore / Memories / Me`

No permanent top-level Map tab or feature tab is added.

### Home

Home is the active-trip orientation surface. It contains:

1. active destination and lifecycle phase;
2. current status;
3. deterministic next meaningful action;
4. one or two supporting signals, such as Plan Health, budget remaining, or group status; and
5. a contextual Coco message.

Home does not become a grid of unrelated tools. Packing, Group DNA, Family Window, Budget, Map, and other tools surface here only when their state is relevant or through the active trip.

### Trips

Trips is the owner of trip selection and trip-owned workspaces. A trip card shows destination, Solo/Group mode, lifecycle phase, current status, Plan Health or retrospective status, and next action. Opening a trip lands in its workspace rather than in a collection of unrelated drawers.

### Explore

Explore is global inspiration that feeds the active trip. `Save idea` creates a personal idea. `Suggest to group` creates a governed proposal or shortlist entry. Solo mode may create a personal draft. Explore never directly mutates the official Group itinerary.

Every candidate exposes structured evidence separately from presentation copy. Evidence includes Tingo influence, Trip Vibe fit, member preference fit, budget fit, candidate attributes, and source status.

### Memories

Memories is the After/retrospective side of the lifecycle. Its unmistakable sequence is:

`actual outcome -> Worth It/reflection -> proposed learning -> explicit confirmation`

Memory Trunk, Photo Map, Future Postcard, Memory Cards, Ghost Wish, and sharing are expressive outcomes around this sequence, not substitutes for it.

### Me

Me owns long-term personal state:

- Tingo Card and its answers;
- intentional Tingo retake/update;
- base packing preferences;
- confirmed learning history;
- privacy defaults; and
- personal travel/decision history.

Me does not own Trip Vibe, Must-Go, Deal Breaker, trip-specific Preference, Flexible, group budget, or Group DNA.

## Primary journey and next action

The journey spine is a shared status block at the top of Home and the active Trip Workspace. It is not a strictly linear wizard and it must not prevent users from inspecting other relevant trip information.

Proposed domain API:

```ts
deriveJourneyState(input): {
  phase: 'planning' | 'traveling' | 'completed';
  status: string;
  nextAction: {
    id: string;
    label: string;
    reason: string;
    destination: 'trip' | 'me' | 'explore' | 'memories';
    priority: number;
  } | null;
  blockers: string[];
  evidence: JourneyEvidence[];
}
```

The action is prioritized, not locked. Users may inspect other trip sections unless a real governance or safety rule blocks a mutation.

Recommended priority rules:

### Planning

- no trip: Set up trip;
- incomplete Tingo: Complete or review Tingo, without blocking trip inspection;
- unresolved Group conflict: Open Court;
- Plan Health blocker: Review the health risk;
- incomplete plan inputs: Review Trip Intent;
- reviewed plan without readiness confirmation: Confirm Ready to Go;
- otherwise: Continue planning.

### Traveling

- unresolved disruption: Preview repair or obtain Emergency Court approval;
- current stop not checked: Check in, when useful;
- otherwise: Continue to the next protected or floating item.

### Completed

- no actual-outcome review: Record how the trip felt;
- incomplete Worth It/reflection: Complete retrospective;
- unconfirmed learning proposal: Review proposed learning;
- otherwise: Open memories or continue the archive.

## Trip Workspace

The existing Trip Workspace remains the lifecycle spine. Lifecycle controls may remain as a compact phase indicator, but the experience is organized around the next-action block and purpose-specific sections rather than additional tabs.

### Shared shell

- destination and Solo/Group mode;
- phase and status;
- next-action card;
- Trip Promise or completed-trip equivalent;
- compact Plan Health or retrospective summary;
- contextual Map entry; and
- relevant Coco explanation.

### Planning sections

1. Journey status and next action.
2. Trip Intent: Trip Vibe, Must-Go, Deal Breaker, Preference, Flexible, dates, destination, and budget.
3. People and Group DNA: explicit member inputs, assessment state, budget range, roles, and conflicts.
4. Plan timeline: anchors, floating items, free time, buffers, and typed evidence.
5. Contextual spatial view: candidate places and planned stops.
6. Plan Health: score, metrics, deductions, and risks.
7. Decision queue: Court only when a real unresolved conflict exists.
8. Ready-to-Go review: blockers, reminders, packing, human commitments, and confirmation.

### Traveling sections

1. Journey status and next action.
2. Current and next itinerary item.
3. Contextual spatial view with current/next/reunion information supported by available data.
4. Manual arrival/check-in state.
5. Disruption repair only when triggered.
6. Mood and fatigue check-ins.
7. Privacy, safety, Family Window, and reunion tools when relevant.

### Completed sections

1. Retrospective status and next action.
2. Actual outcome summary.
3. Plan versus actual: pace, disruption, and budget.
4. Decision History.
5. Worth It and item-level reflection.
6. Proposed learning and explicit confirmation.
7. Memory capture and expressive artifacts.
8. Community sharing after explicit consent.

## Tingo and Trip Intent data model

The implementation will use two explicit source contracts.

```text
TingoProfile
  answers                 editable source of truth
  derived dimensions      computed from answers
  completion              computed from answers
  confirmed history       versioned snapshots only when confirmed learning creates a concrete record
  update/retake metadata  explicit user action history

TripIntent
  destination
  dates
  mode
  tripVibe
  mustGo
  dealBreaker
  preference
  flexible
  budget
```

The existing persistence format will be migrated compatibly. Tingo answers remain the canonical editable source; dimensions are not independently mutable state. Trip-specific fields are moved out of Me ownership and remain attached to the active trip.

## Evidence architecture

Domain functions return typed, source-linked evidence. They do not return final prose intended for direct display.

```ts
type RecommendationEvidence = {
  source: 'tingo' | 'trip-vibe' | 'constraint' | 'member-preference' | 'budget' | 'candidate' | 'group-consensus' | 'adapter';
  inputId?: string;
  strength: 'required' | 'strong' | 'supporting' | 'context';
  effect: 'supports' | 'protects' | 'excludes' | 'constrains' | 'warns';
  value: string;
};
```

Presentation components format these records into human-readable “Why this?” copy. No UI copy may imply live weather, routing, price, traffic, or social evidence that is not present in the source data.

## Contextual spatial view

`TripSpatialView` is a reusable workspace component, not a new top-level destination.

### Before

- candidate places;
- planned stops;
- anchor/floating relationships;
- source labels; and
- Save idea / Suggest to group actions.

### During

- current/next stop only when supported by app state;
- protected anchor;
- reunion agreement;
- disruption/repair context; and
- privacy state.

### After

- travelled stops from owned trip state;
- photo/metadata locations where available; and
- clear labels when data is imported, schematic, or unavailable.

The component must not fabricate live location, routing, traffic, travel time, weather, provider, or external map information. A schematic/local spatial framework is explicitly acceptable until real providers exist.

## Full FINAL_PRODUCT_SPEC.md reconciliation

Status legend:

- `A` — active and broadly wired;
- `B` — active but requires ownership or journey repositioning;
- `C` — honest prototype or partial adapter;
- `F` — external service boundary remains; and
- `D` — cross-cutting framework capability currently missing.

| # | Spec feature | Baseline status | Owner, trigger, prominence | Logic or dependency |
|---:|---|---|---|---|
| 1 | Tingo Card | B | Me; incomplete or intentional retake; high | Persistent profile, explicit update |
| 2 | Packing preferences | B | Me defaults plus Planning pack; preparation trigger; medium | Existing packing flow |
| 3 | Solo / Group | B | Trip setup; first meaningful decision; high | Trip-owned mode |
| 4 | Destination / AI / Must-Go | B | Planning intent; setup and review; high | AI proposes; Must-Go remains protected |
| 5 | External links | C/F | Explore or Planning import; user-triggered; medium | Honest parser/adapter boundary |
| 6 | Community inspiration | C | Explore; browse/save; secondary | Explicitly shared content only |
| 7 | Trip Vibe | B | Trip Workspace; setup and plan review; high | Must move out of Me ownership |
| 8 | Trip constraints | B | Trip Workspace; setup/edit; high | Must-Go, Deal Breaker, Preference, Flexible |
| 9 | Packing generation | B | Planning / Me; trip-created or preparation trigger | Generated from base plus trip context |
| 10 | Compare options | C/F | Planning; only when comparing candidates | Deterministic demo adapter until live data |
| 11 | Anchors / Floating | A | Planning timeline; always visible | Existing domain rule |
| 12 | Free time | A | Planning and During; always visible but calm | Generated open blocks |
| 13 | Surprise budget | C | Budget section; reserve becomes relevant | Current reserve is prototype data |
| 14 | Feasibility | C | Ready-to-Go / Plan Health; before confirmation | Must derive from current plan, not static checks |
| 15 | Reminders | A | Planning timeline; date/action trigger | Existing persisted reminders |
| 16 | Human arrangements | A | Planning and During; commitment trigger | Existing commitment model |
| 17 | Slowest member | A | Group planning and Plan Health; Group only | Existing pace-aware logic |
| 18 | Plan Health | A | Planning summary; risk or review trigger; high | Deterministic component formula |
| 19 | Why this? | A | Item/candidate detail; on demand and key items | Existing evidence model |
| 20 | Trip Promise | A | Planning top summary and During anchor | Protected promise |
| 21 | Conflict marker | A | Planning decision queue; unresolved conflict only | Group DNA and Court |
| 22 | Court | A | Planning; substantive unresolved group conflict | Official group governance |
| 23 | Concessions | A | Court; optional trade proposal | Vote snapshot-bound |
| 24 | Gacha | A | Court only for true ties; everyday mode separately | Tie-only governance preserved |
| 25 | Backup Plan | A | Planning and During repair; candidate/disruption trigger | Viable, Deal-Breaker-safe losers only |
| 26 | Confirmation | A | Ready-to-Go and governed mutations | Explicit confirmation |
| 27 | Rotating planning | A | Group workspace; planning session | Existing planner turn |
| 28 | Roles | A | Group workspace; member setup | Advisory suggestions, explicit apply |
| 29 | Trip Workspace | B | Trips; active-trip entry | Needs journey spine, not more tools |
| 30 | Decision History | A | Planning and After; after decisions | Persisted official records |
| 31 | Live timeline / weather | C/F | During; current-day and disruption trigger | Weather remains adapter-backed |
| 32 | Arrival detection | C | During; current stop | Manual check-in now; no false location claim |
| 33 | Disruption repair | A | During; failed item or disruption | Minimum-loss repair with preview/apply/undo |
| 34 | Ghost Itinerary | A | After; displaced/resting idea | Optional retrospective feature |
| 35 | Remaining-budget alternatives | C/F | Planning/During budget; budget pressure | Needs candidate/price adapter |
| 36 | Emergency Court | A | During; substantive Group repair | Confirmation gate |
| 37 | Mood | A | During; user check-in | Explicit user input |
| 38 | Fatigue | A | During; mood/pace signal | No sensor inference |
| 39 | Group Heartbeat | A | During; Group only | Shared status, not surveillance |
| 40 | Privacy | A | Me/During; sharing trigger | Status-only default |
| 41 | Smart Split | A | During; differing energy/needs | Group governance gate |
| 42 | Reunion | A | During; split state | Shared time/place/tolerance |
| 43 | Safety | C/F | During; safety action | Local prototype adapter |
| 44 | Photo Map | C/F | After; user import | Metadata only until media integration |
| 45 | AI Assistant | C | Planning/During; user asks | Proposal-only and governed |
| 46 | Lucky Draw | A | During; optional entertainment | Never affects plan or learning |
| 47 | Photo Journal | C | After; user-triggered | Local editable draft |
| 48 | Memory Cards | C/F | After; opt-in transformation | Generation backend not connected |
| 49 | Worth It | A | After; retrospective trigger | Explicit user review |
| 50 | Stated vs Actual | A | After; review | Derived from plan and evidence |
| 51 | Budget vs Actual | A | After; review | Existing category accounting |
| 52 | Learning | A | After to Me; explicit proposal | Never silently overwrites Tingo |
| 53 | Community sharing | C | After/Explore; explicit publish action | Private by default and consent-gated |

### Cross-cutting framework gap

`deriveJourneyState(...)` is the main missing capability. It will derive phase, status, next action, blockers, and evidence from source state. It recommends and prioritizes; it does not turn the product into a wizard.

## Proposed controlled extraction

The active app is large, so extraction will be incremental and diff-inspected after every `AppRescued.tsx` change.

Proposed domain files:

- `src/domain/journey-state.ts` — lifecycle state and next-action derivation;
- `src/domain/trip-intent.ts` — explicit trip-owned intent and persistence migration;
- `src/domain/feature-evidence.ts` — typed evidence grouping/formatting boundary.

Proposed UI files:

- `src/components/TripJourneyStatus.tsx` — phase, status, next action, Coco context;
- `src/components/TripPlanOverview.tsx` — timeline, Promise, evidence, Health summary;
- `src/components/TripSpatialView.tsx` — honest Before/During/After spatial states;
- `src/components/TripRetrospective.tsx` — actual outcome, reflection, learning proposal;
- `src/components/GlobalNav.tsx` — existing five-tab shell;
- `src/components/ContextualToolList.tsx` — trigger-based tool surfacing.

Existing domain modules and signature feature components remain in place unless a focused extraction is necessary for integration.

## Persistence and derived state

Persist source state:

- Tingo answers and explicit update/retake history;
- Trip Intent;
- member data and explicit member preference profiles;
- Group decisions and Decision History;
- Backup candidates and applied repair source state;
- budget plans and actuals;
- retrospective inputs;
- privacy choices; and
- explicit memory/community consent state.

Re-derive:

- Tingo dimensions and completion from answers;
- Group DNA;
- itinerary;
- Plan Health;
- journey state and next action;
- recommendation evidence summaries; and
- repair previews.

Historical Tingo snapshots are only persisted when a confirmed learning action creates a meaningful, versioned record. The current mutable profile is never silently replaced by retrospective inference.

## External adapters and data honesty

Prototype adapters remain explicitly labeled. The implementation may expose adapter status in the owning surface, but may not imply live data. Candidate, weather, price, routing, safety, photo metadata, and external-link boundaries remain replaceable without changing governance or planning logic.

## Validation design

Before completion, run:

- `npm run check`;
- all Vitest regression tests;
- Vite production build;
- persistence reload checks;
- Solo and Group journey checks;
- Tingo retake/update and source-of-truth checks;
- Tingo/Trip Intent separation checks;
- Explore Save idea versus Suggest to group checks;
- Court and tie-only Gacha checks;
- Must-Go protection checks;
- Backup filtering and support preservation checks;
- minimum-loss repair, cost/time impact, confirmation, Apply, and Undo checks;
- Home next-action transitions;
- Planning to Traveling to Completed transitions;
- retrospective learning confirmation checks;
- privacy defaults and adapter honesty checks; and
- browser/runtime or visual/mobile verification only when actually performed.

The final handoff must distinguish:

- implemented in code;
- wired into the active app;
- regression tested;
- exact-head CI state;
- browser/runtime verified; and
- visually/mobile verified.

