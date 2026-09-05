// @ts-expect-error The app's tsconfig intentionally omits Node typings; Vitest runs this import in Node.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const polishCss = readFileSync(new URL('./v2-polish.css', import.meta.url), 'utf8');
const stylesCss = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

describe('presentation touch targets', () => {
  it('keeps interactive controls at least 44px tall and icon controls wide enough', () => {
    expect(polishCss).toMatch(/button\s*\{\s*min-height:\s*44px;\s*min-width:\s*44px;/);
    expect(polishCss).toMatch(/\.back-link,\s*\.workspace-more\s*\{\s*min-width:\s*44px;/);
    expect(polishCss).toMatch(/\.ghost-wish-row button,\s*\.sealed-postcard button,\s*\.member-votes button\s*\{\s*min-height:\s*44px;/);
    expect(polishCss).toMatch(/\.arrival-check button\s*\{\s*min-height:\s*44px;/);
    expect(polishCss).toMatch(/\.section-rule,\s*\.explore-section-heading\s*\{\s*min-height:\s*44px;/);
    expect(polishCss).toMatch(/\.section-rule button,\s*\.explore-section-heading button\s*\{\s*min-height:\s*44px;/);
    expect(stylesCss).toMatch(/\.close\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/);
  });

  it('keeps the tightly cropped header Coco at the corrected visible size', () => {
    expect(polishCss).toMatch(/\.brand-companion\s*\{[^}]*width:\s*58px;[^}]*height:\s*58px;[^}]*flex:\s*0 0 58px;[^}]*object-fit:\s*contain;/);
  });
});
