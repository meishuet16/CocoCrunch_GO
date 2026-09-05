# Signature Travel UX Task 4 report

## Changed files

- `src/AppRescued.tsx`: reused the existing `coco-idle.png` import for the header companion and existing `Coco` presentation; replaced only the generic `c` brand mark. The Home button callback and `aria-label="Go to Home"` are unchanged.
- `src/v2-polish.css`: added scoped `.brand-companion` sizing with `height: auto` and a visible `.brand-lockup:focus-visible` treatment.
- `src/AppRescued.test.tsx`: added one focused static-markup assertion for the idle asset class/source/alt text and Home label.

No domain files, navigation, callbacks, canonical sprite sheet, or image assets were changed.

## Test-first evidence

RED:

```text
npm test -- --run src/AppRescued.test.tsx
FAIL — 1 failed, 3 passed (4)
Expected failure: missing class="brand-companion" in the Home lockup.
```

GREEN:

```text
npm test -- --run src/AppRescued.test.tsx
PASS — 1 test file, 4 tests passed
```

Full verification:

```text
npm run check
PASS — TypeScript check; 17 test files, 79 tests passed; Vite production build succeeded.
git diff --check
PASS — no whitespace errors.
```

## Asset evidence

`src/assets/coco/coco-idle.png` was inspected visually and by file dimensions: 120×108 pixels, 17,867 bytes, transparent idle Coco artwork. The rendered header image reports natural dimensions 120×108 and rendered dimensions 40×36, preserving the 10:9 aspect ratio. `src/assets/coco/source/coco-canonical-sheet.png` is 1536×1024 and has no diff.

## AppRescued diff inspection

Immediately after the single `src/AppRescued.tsx` edit, I ran:

```text
git diff -- src/AppRescued.tsx
```

The inspection showed exactly three intended hunks: import alias `cocoCanonicalSheet` → `cocoIdle`, the existing `Coco` image reference updated to that alias, and the topbar `brand-mark` span replaced by the `brand-companion` image. No callbacks or navigation expressions changed.

## Browser check

The `agent-browser` executable was unavailable, so the available Codex in-app browser was used as the fallback. At `http://127.0.0.1:5173/`, the Home surface rendered with no blank state, error overlay, console warnings, or console errors. Viewport: 1280×720 CSS pixels, device pixel ratio 1.25. The live DOM reported `/src/assets/coco/coco-idle.png`, alt `Coco, your travel companion`, Home label `Go to Home`, and a 44px-high brand button.

## Self-review and concerns

The change is presentation-only and reuses the existing standalone asset; no sprite extraction, cropping, pose generation, domain-state ownership, or automatic mutation was added. The 44px brand surface remains keyboard-focusable with a visible focus outline. The only concern is the unavailable `agent-browser` CLI; the browser evidence above came from the in-app browser fallback. Pre-existing untracked `dist/`, `node_modules/`, and `package-lock.json` were left untouched and are not part of this task commit.
