import { describe, expect, it } from 'vitest';
import { cocoContextPose, cocoAsset, movementFrame, movementFrames } from './assets';
import manifest from '../../assets/coco/extracted/manifest.json';

describe('canonical Coco semantic assets', () => {
  it('maps contexts to the canonical meaning rather than random expressions', () => {
    expect(cocoContextPose.planning).toBe('scene-planning');
    expect(cocoContextPose.court).toBe('scene-court');
    expect(cocoContextPose.map).toBe('action-map');
    expect(cocoContextPose.memory).toBe('scene-memory-trunk');
    expect(cocoContextPose.askSuggestion).toBe('action-suggest');
    expect(cocoContextPose.weather).toBe('action-umbrella');
    for (const pose of Object.values(cocoContextPose)) expect(cocoAsset(pose)).toMatch(/\.png/);
  });
  it('cycles all four original frames in every direction and rests for reduced motion', () => {
    expect(movementFrames).toEqual(['idle', 'walk-a', 'passing', 'walk-b']);
    for (const direction of ['down', 'left', 'right', 'up'] as const) {
      expect(Array.from({ length: 5 }, (_, tick) => movementFrame(direction, tick, false)))
        .toEqual(['idle','walk-a','passing','walk-b','idle'].map(frame => `move-${direction}-${frame}`));
      expect(movementFrame(direction, 3, true)).toBe(`move-${direction}-idle`);
    }
  });
  it('links every context and movement frame to a recorded source region', () => {
    const files = manifest.assets.map(asset => asset.outputFile);
    for (const pose of Object.values(cocoContextPose)) {
      expect(files).toContain(`src/assets/coco/extracted/coco-${pose}.png`);
    }
    expect(new Set(files).size).toBe(files.length);
    for (const asset of manifest.assets) {
      const [x,y,w,h] = asset.sourceRegion;
      expect(x+w).toBeLessThanOrEqual(manifest.dimensions[0]);
      expect(y+h).toBeLessThanOrEqual(manifest.dimensions[1]);
      expect(asset.canvas[0]).toBeGreaterThanOrEqual(w);
      expect(asset.canvas[1]).toBeGreaterThanOrEqual(h);
    }
  });
});
