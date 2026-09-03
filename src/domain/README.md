# Travel domain

Pure planning rules live here so UI components do not own business invariants.

- `court.ts`: member vote tally and true-tie detection. Gacha is allowed only when `canUseGacha(votes)` is true.
- `budget.ts`: editable category values, sanitization, totals and remaining-budget math.
- `preferences.ts`: explicit post-trip learning transforms and a reviewable before/after summary.
- `discovery.ts`: destination-specific prototype catalog. Unknown destinations are explicitly labeled fallback examples rather than presented as live data.

Browser persistence is isolated in `src/persistence.ts`. UI code should consume these APIs instead of duplicating their rules.
