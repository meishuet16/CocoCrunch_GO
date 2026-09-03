# CocoCrunch Travel Memory Card direction

Reference inspiration: Carolina Fang's `travel-memory-sticker-card` workflow. We borrow the *system thinking* (source-derived motifs, tactile paper, restrained palette, identification anchor, explicit quality checks), not a fixed visual clone.

## Best product placement

Use this as an optional **Memories → Make memory card** transformation after a trip, fed by a user-selected trip photo. It belongs beside Photo Map / Travel Journal / Memory Trunk, not in planning or live-trip screens.

The output becomes a collectible object that can also sit inside the open Memory Trunk. Future Postcard stays a different artifact: it is written forward in time; Memory Card looks backward at a real photo/moment.

## CocoCrunch-specific visual system

Do not copy the reference skill's exact retro-American, gothic, Ghibli, or any other named style. CocoCrunch's own house treatment is:

- warm cream uncoated paper (`#FFF8E7`)
- Sangria line/block accents (`#930500`)
- restrained cornflower-blue fields (`#95BBEA`)
- quiet travel-notebook composition
- flat gouache / cut-paper-like forms with light grain and imperfect edges
- Coco may appear as one small journaling motif only when contextually relevant; never force the mascot over the remembered subject

## Generation contract

Input: one user-selected travel photo plus trip metadata already owned by CocoCrunch.

1. Inspect the source photo and identify the emotional/spatial center.
2. Preserve one compact recognition anchor in the same illustrated medium; never paste a photorealistic patch.
3. Derive six meaningful sticker motifs from visible source content. Do not invent unrelated tourist icons.
4. Derive three short scene-specific English keywords.
5. Optional landmark text: zero by default, one exact source-visible place identifier only if it genuinely identifies the memory.
6. Rebuild the photo using broad matte shapes, visible paper, deliberate omission, restrained CocoCrunch palette and light grain.
7. Keep generated output visually distinct from the app UI itself: this is a collectible memory artifact, not a UI card component.
8. Never add watermark, signature, fake date, fake location, or text that was not grounded in the photo/trip data.

## Suggested artifact layout

Default generated artifact: 3:2 horizontal collectible memory card.

- left ~67%: dominant unframed memory illustration
- beneath illustration: three quiet keywords separated by centered dots
- right ~31%: six source-derived die-cut journaling motifs with irregular cream borders
- continuous warm-paper margin

This layout is a useful default, not the only future artifact. The same source analysis can later power CocoCrunch postcards, luggage-tag cards, fridge magnets, ticket strips, stamp sheets, or scrapbook spreads while keeping the same provenance rules.

## UX flow

Memories → Photo Map / imported photo → **Make memory card** → choose photo → preview extracted anchor / motifs / keywords → Generate → user may regenerate or save → saved card appears in Memory Trunk.

Generation must be opt-in. Never silently stylize every imported photo.

## Why this belongs here

The feature strengthens CocoCrunch's post-trip memory loop without interfering with the competition-critical planner logic. It turns the existing Memories section into a tangible keepsake system and makes the Travel Trunk more than decorative storage.

## Implementation boundary

The current web prototype should implement the entry point, artifact state, and preview contract. Actual photo-to-image transformation requires an image generation/editing backend or agent capability; do not fake it with CSS filters. Until such a backend is connected, label the generation action as a prototype workflow rather than claiming a real generated bitmap.
