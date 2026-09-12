# CocoCrunch

> **Submission links to complete before handing in**
>
> - Repository: [github.com/meishuet16/CocoCrunch_GO](https://github.com/meishuet16/CocoCrunch_GO)
> - Video presentation (3–5 minutes, YouTube Unlisted, titled with the team name only): **[add link]**
> - Presentation slides: **[add public link]**
> - Ideation boards: **[add board or image links]**
> - UI prototype: **[add public Figma, Canva, Netlify, or Vercel link]**

**Team:** [Add member names]

**Problem statement:** Travel Planner — Planning an Escape

## 1. Project Overview

### The problem

Planning a trip means coordinating flights, accommodation, budget, activities, and changing circumstances. The burden is worse for groups: people have different budgets, pacing, interests, and non-negotiable plans, yet decisions are often scattered across booking sites, notes, and chat messages. When a delay or cancellation occurs, travellers must manually rebuild the plan while protecting the commitments that matter most.

The main stakeholders are solo travellers, friends and families planning group trips, and the people who need a clear, privacy-respecting update during travel. Existing itinerary tools such as [TripIt](https://www.tripit.com/web) effectively consolidate booking details into an itinerary, but CocoCrunch focuses on the earlier and more collaborative planning problem: making preferences, disagreements, budget trade-offs, and recovery options visible before a group commits.

### Our solution

CocoCrunch is a travel-planning prototype that helps solo travellers and groups turn individual preferences into a transparent, workable trip plan. It combines trip setup, itinerary generation, budgeting, group decision-making, and disruption recovery in one mobile-first experience. The prototype keeps significant group decisions explicit rather than silently changing the official itinerary, and it labels demo data and unavailable integrations honestly.

Key features:

- Tingo travel-profile assessment that influences planning pace, recommendations, and budget guidance.
- Solo and group trip setup with destinations, dates, budgets, Must-Go anchors, Deal Breakers, and Trip Vibe.
- Group Travel DNA to surface shared priorities and disagreements without averaging away minority views.
- Group Court for proposals, voting, concessions, confirmed decisions, and tie-only Gacha.
- Itinerary planning with protected Must-Go items, buffers, Plan Health, and evidence for recommendations.
- Budget planning, planned-versus-actual comparison, and a decision history for reflection.
- Disruption repair with a visible impact preview, group confirmation where needed, and undo.
- Packing, check-ins, privacy-respecting family reassurance, local prototype safety tools, and post-trip memories.

## 2. Ideation and Process

### 2.1 Ideas we considered

| Idea | Decision | Why |
| --- | --- | --- |
| Shared trip-planning workspace | Kept | It brings destinations, constraints, itinerary, budget, and group decisions into one workflow. |
| Preference profile and Group Travel DNA | Kept | It addresses the core group-planning challenge: making different needs visible before they become conflict. |
| Group Court decision flow | Kept | It makes official group changes accountable and prevents one person from silently changing the plan. |
| Disruption repair and backup options | Kept | It addresses the problem statement’s need to adjust when travel plans change. |
| Random Gacha for official decisions | Dropped as a primary mechanism | Randomness is appropriate only for a genuine tied decision or low-stakes everyday indecision; it must not replace group consent. |
| Continuous location tracking | Dropped as a default | Reassurance should not require surveillance; the prototype separates manual check-ins from location permissions. |

### 2.2 Ideation boards

Add the team’s actual boards here. Include a short caption under each image or link explaining what it records. The recommended minimum is a problem map or mindmap, an idea-evolution board showing dropped options, and a user flow for the selected journey.

- **Problem map / mindmap:** [add image or link]
- **Idea evolution and rejected directions:** [add image or link]
- **Selected user flow:** [add image or link]

### 2.3 Mentor consultation

Add each mentor discussion here before submission: the mentor’s feedback, what the team changed (or consciously did not change), and why. Specific examples are more useful than a generic statement that feedback was received.

| Mentor feedback | Team response |
| --- | --- |
| [Add feedback] | [Add what changed or why the team chose another direction] |

## 3. Design and Prototype

**UI prototype:** **[add public link]**

Before submitting, open the link in an incognito/private browser window to confirm that judges can access it without requesting permission.

Key screens to include as screenshots or walkthrough links:

1. Trip setup and Tingo assessment
2. Group Travel DNA and preference conflicts
3. Generated itinerary, Must-Go anchors, and Plan Health
4. Group Court decision and tie-only Gacha flow
5. Budget planning and expense comparison
6. Disruption repair preview and confirmation
7. Traveling check-in and privacy controls
8. Completed-trip reflection and learning

## 4. What Makes CocoCrunch Different

- **Preferences become evidence, not assumptions.** The group plan distinguishes confirmed individual inputs from unknown member preferences.
- **Conflict is visible and governed.** Group Court keeps official plan changes separate from personal saved ideas, and a tie-only Gacha avoids turning random play into a default governance tool.
- **Recovery protects what matters.** Repair previews explain the cost, time, and preference impact before an itinerary change is applied, while Must-Go anchors remain protected.
- **Prototype honesty is part of the design.** Local catalogs, demo prices, and unavailable integrations are labeled rather than presented as live data.
- **Privacy is intentional.** Family reassurance and location permissions are separate; continuous location is not enabled by default.

## 5. Technical Architecture and Feasibility

### Tech stack

| Area | Current prototype | Why it fits |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite | A fast, typed component-based interface for the mobile-first prototype. |
| Interaction | dnd-kit, Lucide React, uisfx | Supports interactive planning, accessible icons, and lightweight feedback. |
| Local data | Browser local persistence | Keeps the prototype self-contained while preserving state between sessions. |
| Photo metadata | exifr | Supports local metadata reading for the photo-memory prototype. |
| Validation | TypeScript, Vitest, Vite build | Checks types, core behaviours, and production build readiness through `npm run check`. |

The present version is a frontend prototype. Its local catalog, pricing, route, and external-service behaviours are explicitly presented as prototype or fallback data; no booking, payment, live GPS, or real-time travel provider is connected.

### Build plan and scope

The build scope is deliberately focused on the full planning-to-reflection journey rather than live transactions:

1. Collect trip intent, personal constraints, budgets, and group preferences.
2. Generate and explain a proposed itinerary with protected anchors and Plan Health.
3. Support transparent group decisions, backup options, and disruption repair.
4. Track budget outcomes, check-ins, and completed-trip learning.
5. In a production phase, add authenticated accounts, real-time collaboration, provider integrations, and server-side privacy controls.

## Video Presentation

**Duration:** 3–5 minutes; aim for about 4 minutes 30 seconds. Do not exceed 5 minutes.

**Platform:** YouTube, set to **Unlisted**. Title the video with the **team name only**.

Suggested structure:

1. The travel-planning problem and target users.
2. CocoCrunch’s core idea and what differentiates it.
3. A quick end-to-end demo: trip setup, group preferences, decision-making, and disruption repair.
4. The technical approach, realistic prototype boundaries, and next build phase.

## Submission Checklist

- [ ] GitHub repository is public and opens while logged out.
- [ ] README includes final team names and all live links.
- [ ] YouTube video is Unlisted, 3–5 minutes, and titled with the team name only.
- [ ] Ideation boards are embedded or publicly linked with captions.
- [ ] Prototype link opens in an incognito/private window.
- [ ] Presentation slides have a public link and are linked above.
