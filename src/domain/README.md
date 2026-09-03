# Travel domain

Pure planning rules live here so UI components do not own business invariants.

- `court.ts`: vote tally and true-tie detection. Gacha belongs to the UI flow only when `tied` is true.
- `budget.ts`: editable category totals and remaining-budget math.
- `preferences.ts`: explicit, user-confirmed post-trip learning transforms.
- `discovery.ts`: destination-specific prototype catalog with an explicit fallback rather than pretending fallback data is live.

These modules must stay framework-free and side-effect-free. Browser persistence is isolated in `src/persistence.ts`.
