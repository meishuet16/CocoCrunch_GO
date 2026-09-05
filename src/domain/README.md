# CocoCrunch domain layer

Keep product rules here instead of burying them in JSX or CSS.

- `court.ts` owns vote tallying and the **true-tie-only** Gacha invariant.
- `budget.ts` owns amount sanitization, editable category totals and remaining-budget math.
- `preferences.ts` owns post-trip learning transforms; UI must ask for confirmation before applying them.
- `discovery.ts` is the replaceable destination data boundary. The current source is an explicitly labelled local prototype catalog with a clearly marked fallback; it must never pretend to be live recommendation data.

`App.tsx` may orchestrate these rules, but must not duplicate their calculations. Side-effectful signature interactions travel through the typed `experience.ts` event contract rather than DOM inspection. Durable product state goes through versioned `persistence.ts`; transient drawers, overlays and animation steps stay in memory.
