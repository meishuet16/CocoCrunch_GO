# CocoCrunch — Complete Feature, API & Backend Plan

## Purpose

CocoCrunch is an end-to-end Solo and Group travel planner. It combines the traveller's **Tingo Card** preferences, the trip's goals and constraints, budget, group consensus and real-world conditions to plan, decide, adapt and reflect.

Tingo Card is CocoCrunch's in-app travel-personality assessment and long-term preference engine. It is not a separate product.

## Product and technical decisions

- **Product name:** CocoCrunch.
- **Backend:** Supabase for Auth, Postgres, Row Level Security (RLS), Realtime, Storage and Edge Functions.
- **Rule authority:** retain the deterministic rules in `src/domain/`: protected Must-Go anchors, Deal Breakers, visible group conflicts, Court, tie-only Gacha, minimum-loss repair, explicit learning and privacy defaults. Provider data enriches these rules; it does not replace them.
- **Maps:** use Google Maps Routes API `computeRoutes` and Places API (New), not the legacy Distance Matrix API.
- **AI is proposal-only:** a material plan change must include evidence, a preview, confirmation and undo. A Group change additionally requires Court or Emergency Court approval.

## Shared backend foundation

| Capability | API | Backend implementation |
|---|---|---|
| Identity and membership | None | Supabase Auth; `profiles`, `trips`, `trip_members`; RLS limits every member to trips they belong to. |
| Source state and audit | None | Postgres persists inputs, confirmed decisions, consent and pre-repair snapshots; derive Tingo dimensions, Group DNA, Plan Health and itinerary output from that source state. |
| Live collaboration | None | Supabase Realtime synchronizes votes, Court, trip updates and member status. |
| Provider and AI gateway | OpenAI/Anthropic, map, weather and price services | Edge Functions keep keys server-side, validate inputs, rate-limit, cache and gracefully degrade failures. |
| Media and publication | None | Storage for photos/generated assets and signed URLs; default `visibility = private`. |
| Security | None | RLS, function authorization, audit records, verified webhooks and minimal location-event retention. |

## Feature map

| Product area | Feature | External API | Backend required |
|---|---|---|---|
| Me | **Tingo Card, base packing preferences, learning profile.** It explains pace, budget sensitivity, comfort, food, adventure, planning, flexibility and social style. | No scoring API; optional LLM retrospective summary. | `tingo_profiles`, versioned `tingo_history`, packing defaults. Answers are the editable source of truth; learning is only written after confirmation. |
| Trip setup | **Solo/Group setup, destination, Trip Vibe, Must-Go, Deal Breaker, Preference, Flexible, commitments and Trip Promise.** | OpenAI/Anthropic for destination ideas; Google Places Autocomplete/Geocoding. | `trip-create`, `destination-suggest`; `trips`, `trip_members`, `trip_intents`, `trip_constraints`, `commitments`. |
| Discovery | **External-link fit analysis, Community inspiration, save idea and suggest to group.** Ideas never silently become official Group plan items. | Allowed source public/embed APIs, structured LLM extraction, place normalization. | Allowlisted URL import with SSRF protection; `ideas`, `imported_links`, `community_posts`, `community_saves`. |
| Planning | **Packing, anchors/floating items, free time, surprise budget, feasibility, reminders, slowest-member timing, Plan Health and Why this?** | Google Routes, Places API (New), Open-Meteo. | `plan-generate`, `plan-validate`; `itinerary_items`, `plan_evidence`, `plan_health_snapshots`, `reminders`, `packing_items`. Failed routing uses labelled distance/speed fallback estimates. |
| Budget | **Personality-aware comparison, category budgets, contingency reserve, remaining-budget alternatives and planned-vs-actual review.** | Amadeus, Kiwi or travel partners; curated `deals` table for MVP discounts. | `price-search`; `budget_categories`, `expenses`, `price_offer_cache`, `deals`. Browsing shows reference prices; confirmation performs a live refresh. |
| Group understanding | **Group Travel DNA, explicit conflicts, suggested roles, shared workspace, planner rotation and Decision History.** | None; optional LLM wording only. | `member_preferences`, `group_conflicts`, `member_roles`, `decision_history`, `planner_turns`; server-derived Group DNA. |
| Group Court | **Proposal, discussion, voting, concessions/swaps, confirmation, tie-only Gacha and Backup Plan.** | None. | Realtime plus atomic `cast_court_vote` Postgres RPC; `court_proposals`, `court_options`, `court_votes`, `court_comments`, `concessions`, `backup_plan_pool`. SQL—not the client—counts votes. |
| During | **Live Timeline, weather adaptation, checkpoints, arrival detection, minimum-loss repair, Ghost Itinerary and Emergency Court.** | Open-Meteo, Google Routes/Places, optional flight status. | `disruption-check`, `repair-preview`; `disruption_events`, `repair_previews`, `repair_applications`, `checkpoints`, `disruption_alerts`. Repair protects anchors before floating items. |
| Reliable disruption detection | **Flight, geofence and transit-triggered checks instead of continuous polling.** | Flight-status API, optional Radar.io/native geofencing, OneSignal. | Check each flight near departure and expected arrival only. Push actions: “Arrived” / “Running late,” with TTL and collapse key per checkpoint. |
| Group coordination | **Mood/fatigue, Group Heartbeat, privacy-first status, smart split and reunion agreement.** | Optional Google Routes ETA. | `checkins`, `member_status`, `splits`, `reunion_agreements`. Share computed states such as `together`, `on-time`, `delayed` and `needs-decision`, never default exact coordinates. |
| Safety | **Safety check-ins, emergency contacts, hospital, pharmacy and luggage-storage lookup.** | Google Places Nearby Search or OpenStreetMap Overpass. | `nearby-services`; `emergency_contacts`, `safety_checkins`, `nearby_services_cache`. |
| AI companion | **Coco/Tingo assistant reads the plan, answers questions and proposes changes.** | OpenAI Responses API or Anthropic Messages API. | `assistant-propose` returns an evidence-backed `pending_change`; apply requires Solo confirmation or Group Court/Emergency Court and remains undoable. |
| Entertainment | **Fortune / lucky-draw ritual.** It never affects real decisions or recommendations. | None. | Local state by default; optional isolated `ritual_events` table with no planning or learning connection. |
| Memories | **Photo Map, travel journal, Memory Cards, Worth It, plan-vs-actual and budget-vs-actual.** | `exifr`, Mapbox/Google Maps JS, optional Replicate/OpenAI Image API. | Storage; `photos`, `journal_entries`, `item_reviews`, `retrospectives`, `memory_cards`. Image generation is asynchronous with verified webhook completion and Realtime updates. |
| Community | **Opt-in publication of completed trips and selected memories; browse, save and report.** | None. | `publish-community-post`; `community_posts`, `community_post_items`, `community_saves`, moderation queue. Unpublish immediately removes public reads. |
| Product feel | **Coco companion, rituals and animation.** | None. | No backend required; keep client assets and consider Lottie/Rive only for performance. |

## Production invariants

1. Must-Go is never silently replaced by AI, repair or a vote.
2. Deal Breakers filter candidates before display, recommendation or backup selection.
3. Official Group-plan mutations are server-authorized governance events.
4. Gacha runs only for a genuine Court tie; everyday Gacha is a separate data path.
5. Backup Plan candidates must be viable and Deal-Breaker-safe.
6. Repair protects anchors, previews impact, requires confirmation and supports undo.
7. Community is private by default; precise group location and continuous tracking are off by default.
8. Retrospective data may propose learning, but only explicit confirmation updates the long-term profile.

## App overview and user flow

CocoCrunch first learns a traveller's preferences through Tingo Card. The user creates a Solo or Group trip, sets the Trip Vibe, Must-Go items, Deal Breakers, dates and budget, then reviews a generated itinerary with Plan Health and clear recommendation evidence.

For Group trips, CocoCrunch derives Group Travel DNA and keeps conflicts visible. Disagreements move into Group Court; a genuine tie alone unlocks Gacha. Viable losing choices remain in the Backup Plan pool for future disruptions.

During travel, weather, delays or missed checkpoints trigger a minimum-loss repair preview. Solo travellers confirm directly; groups use Emergency Court. After travel, users capture photos and reflections, compare plan against actual outcomes, explicitly confirm preference learning, and may publish selected content to Community.

1. Sign up and complete Tingo Card.
2. Create a Solo or Group trip.
3. Select a destination or request AI destination ideas.
4. Set Trip Vibe, Must-Go, Deal Breakers, preferences, dates and budget.
5. Let Group members submit preferences; review Group Travel DNA and conflicts.
6. Review the generated plan, Plan Health, budget and Why this? evidence.
7. Resolve disagreements in Group Court; retain viable losing items as backups.
8. Travel with timeline, weather, status, reunion and safety tools.
9. Confirm a disruption repair directly or through Emergency Court.
10. Capture photos, check-ins, journal entries and Worth It ratings.
11. Review actual outcomes and explicitly approve any long-term preference update.
12. Optionally publish the completed trip to Community.

## Build order

1. **P0 Demo:** Auth/RLS, profile/trip persistence, Group DNA, deterministic Plan Health, Court/RPC/Realtime/Gacha, Backup Plan and weather-triggered repair preview.
2. **P1 Usable travel:** live routes/places, price cache, packing/reminders, mood/status/reunion, safety lookup and push check-ins.
3. **P2 Retention:** photos, map, journal, confirmed learning, Memory Cards, Community and limited external-link import.

## Migration from the current codebase

Keep `src/domain/tingo.ts`, `preferences.ts`, `group-dna.ts`, `itinerary.ts`, `plan-health.ts`, `court.ts`, `backup-repair.ts`, `budget.ts` and their tests. Replace local persistence with Supabase source-state persistence, and replace local demo adapters with Edge-Function-wrapped map, weather, price, safety and AI services while retaining clear source, cache and fallback labels.
