# CocoCrunch Signature Travel UX and Final Visual Polish Design

> Approved execution design for the visual companion pass. Product truth remains FINAL_PRODUCT_SPEC.md; this document translates the five supplied references into the active CocoCrunch presentation without reopening validated domain rules.

## Scope and authority

This pass starts from 460e1b4e297c6f06c9b727463901d491f874f769 on feat/p0-foundation. It is presentation-first. The active implementation remains src/AppRescued.tsx, and src/App.tsx continues to export it.

The authority order is FINAL_PRODUCT_SPEC.md, validated domain/business invariants, the approved full-product framework, the approved visual-refinement design, the five visual references, and the current CocoCrunch identity. No canonical sprite extraction or provider integration is part of this pass.

## Reference-to-screen audit

The audit used the active Vite app at http://127.0.0.1:5176/ and the available narrow viewport override of 362 by 702 CSS pixels. The local state opened Traveling in an affected/disruption state, so the calm Trip Conditions branch remains a validation target rather than being described as directly captured.

| Screen | Current weakness | Reference principle | Concrete visual decision |
| --- | --- | --- | --- |
| Home | Active trip and next action are clear, but the trip does not yet feel like a Before/During/After journey. | References 1, 4, and 5: destination-first orientation with temporal storytelling. | Add a compact connected journey progression under the active-trip status, keep one next action dominant, and replace the generic brand mark with the existing idle Coco asset. |
| Planning | Lifecycle tabs and reviewable rows exist, but the page still reads as stacked sections rather than a travel notebook timeline. | References 1 and 5: notebook spine, anchors, floating items, readable time rail. | Add a restrained phase route and convert the generated plan presentation into a vertical time rail with stable anchor, flexible floating, and quiet buffer states. |
| Traveling | The current rendered state leads with the schematic map and diagnostics before the day’s activity. | References 1, 2, 4, and 5: Today first, calm current context, practical itinerary. | Lead with a Today companion surface showing current, next, later, manual progress, and condition; place spatial context after the daily decision story. |
| Traveling disruption | The repair data is accurate, but the user must assemble the story from labels. | References 1 and 3: changed plan should read as one coherent before/after story. | Keep dynamic domain output and present What changed → What is affected → What Coco protects → Safest adjustment → Impact → Confirm. |
| Completed | Learning is correctly first, but closure is mostly section-based. | References 1 and 3: Before/During/After continuity and resolved journey. | Add a completed route treatment and a small planned-versus-actual closure summary without moving expressive artifacts ahead of learning. |
| Memories | Retrospective doorway is correct, but the archive still resembles post-trip tools. | References 1 and 2: lived travel archive and memory-book feeling. | Use an archive shelf and trip trace as one calm travel record, with explicit retrospective doorway remaining first. |
| Me | Tingo ownership is correct, but the page does not yet feel like a durable travel identity. | References 2 and 4: companion identity with calm profile hierarchy. | Use existing idle Coco as the identity anchor, keep Tingo history secondary, and preserve the intentional retake/update path. |
| Explore | Governance handoff is clear, but discovery is still a collection of cards. | References 2 and 5: inviting discovery that feeds a real trip. | Use a light discovery path and stronger Save idea / Suggest to group affordances without adding universal Add-to-itinerary. |

## Experience architecture

### Journey progression

Add a compact JourneyProgress presentation component that consumes only phase, current phase, destination, and optional next-action label. It renders Before / During / After markers connected by a path. The active phase is prominent, completed phases stay visible as history, and future phases are quiet. It is informational, not a locked wizard; the existing lifecycle controls remain available.

### Today and itinerary

Add a TodayTimeline presentation component that consumes the generated TripPlan items plus manual arrival, delay, and applied-repair state. It returns typed display state only: current, next, later, completed, anchor, floating, buffer, or recovery. It does not calculate time, route, weather, or plan mutations.

Traveling order becomes Today → Trip Conditions → disruption/repair when relevant → progress and group heartbeat → contextual tools → spatial context. Planning and Completed retain their existing data order while receiving the same temporal language and route treatment.

### Conditions and repair

Upgrade TripConditions so simulated/user-reported conditions read as Today’s conditions, identify the affected item, show provenance beside the condition, and point to the next safe action. Live provider absence remains explicit but visually quiet. Repair presentation continues to consume RepairResult and never fabricates cost, time, preference, or replacement values.

### Brand and companion

Replace the generic top-left text mark with the existing standalone idle PNG at src/assets/coco/coco-idle.png, preserving transparency and aspect ratio. The brand-home button remains the Home action with a minimum 44 by 44 pixel target.

Ask Coco remains a single contextual explanation/proposal entry in Traveling and is never a silent mutation path. A small companion treatment may appear inside Today, repair, and Completed learning surfaces only when it clarifies the current state.

### Signature random experiences

Everyday Gacha gets a compact capsule-machine presentation in its existing drawer. The existing random selection callback remains the source of the result; the component only expresses candidates, Turn, reveal, and Turn again. Copy makes clear that it chooses among reasonable everyday options and does not write the official itinerary or Tingo learning.

Lucky Draw gets a distinct sealed-note or postcard reveal treatment. It remains entertainment/local, does not use the capsule-machine metaphor, and its copy excludes unsupported real deals or vouchers. It never mutates itinerary or learning.

Court Gacha remains inside Group Court and is visible only when tally.tied is true. It may share warm ritual styling but not the Everyday Gacha entry surface. Pray remains an optional non-mutating ritual only in a qualifying no-useful-repair state; no automatic repair coupling is added.

### Sharing and spatial boundaries

Family Window remains a recipient-facing share preview with selected trip/safety information and useful status/manual-check-in language when location is off. Location Privacy remains a settings surface about app data use, precision, purposes, and provider availability. Neither is replaced by the other.

TripSpatialView remains a local schematic or imported-metadata view. Planning shows intended stops/candidates, Traveling shows saved current/next/reunion context, and Completed shows travelled/photo metadata. No live GPS, routing, traffic, travel time, weather, provider timestamp, or venue availability is introduced.

## Visual system

Use the existing cream, paper, sangria, blue, notebook, and CocoCrunch vocabulary. Prefer spacing, time rails, quiet rules, and status markers over additional cards, shadows, gradients, or uppercase labels. Expressive states may gain stronger color, shape, and motion while the normal state remains calm.

All new interaction styles respect prefers-reduced-motion. Meaning must remain in text and state markers. Touch targets remain at least 44 pixels where appropriate, close controls retain accessible names, and lifecycle/nav active states retain aria-current or aria-selected semantics.

## Validation contract

Each bounded unit gets focused tests, exact AppRescued diff inspection after every AppRescued edit, git diff --check, and a rendered narrow check before its descriptive commit. The final gate runs npm run check, full regression tests, the available responsive matrix, browser console inspection, PR exact-head CI, and rescue-log update.

The pass is successful only when the five reference principles are visible in the active app, Today is the first Traveling question, weather/condition provenance is honest, Everyday Gacha / Court Gacha / Lucky Draw are distinguishable, the existing idle PNG is used, and the canonical sheet remains untouched.
