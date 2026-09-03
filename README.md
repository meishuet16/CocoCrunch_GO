# CocoCrunch_GO

**COCO IN YOUR AREA.**

A mobile-first group travel planner built for preferences, surprises, and plans that go wrong.

## Prototype focus

CocoCrunch demonstrates the complete P0 decision loop for CodeNection 2026 Travel Planner:

1. **Know me** — traveller preferences, pace, food priorities, budget awareness.
2. **Know us** — Group Travel DNA and explicit conflicts instead of averaging them away.
3. **Plan** — itinerary with Anchor / Floating / Mystery Window, budget context, Plan Health and "Why this?" explanations.
4. **Decide together** — Group Court for conflicts; Gacha is only used when the vote is tied.
5. **Adapt** — disruptions protect Anchors first, surface backup / Ghost options, show time + cost impact, then require confirmation with undo.
6. **Reassure** — Family Window shares only the chosen level of information and follows a reassurance contract rather than continuous tracking.
7. **Budget** — trip budget, spend, reserved funds, buffer and tactile split-bill receipt interaction.
8. **Remember** — Memory Trunk, Capture Capsule and saved Ghost Wishes.

## Brand / interaction language

- Palette: `#FFF8E7`, `#930500`, `#95BBEA`
- Coco is a character and interaction guide, not a generic sparkle chatbot.
- Tactile absurdism is reserved for meaningful moments: Ride with Coco, Capture Capsule, receipt printer, Gacha and optional prayer ritual.
- Prayer is entertainment only and never changes weather or itinerary logic.
- AI suggestions always show reasoning / impact before the user confirms them.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173/`).

## Verify before pushing

```bash
npm run check
```

`npm run check` runs TypeScript validation followed by a production Vite build.

## CI

GitHub Actions runs the same check for pull requests targeting `main`, and again when changes land on `main`. Feature-branch pushes are intentionally not checked a second time, avoiding duplicate CI runs.
