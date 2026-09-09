// Automatic Coco Sprite Extraction from Master Sheet

export type SpriteDef = {
  pose: string;
  box: [number, number, number, number]; // [leftPct, topPct, rightPct, bottomPct]
};

export const ALL_SPRITE_DEFS: SpriteDef[] = [
  // 1. Movement: Down
  { pose: 'move-down-idle', box: [0.045, 0.08, 0.11, 0.18] },
  { pose: 'move-down-walk-a', box: [0.115, 0.08, 0.18, 0.18] },
  { pose: 'move-down-passing', box: [0.185, 0.08, 0.25, 0.18] },
  { pose: 'move-down-walk-b', box: [0.255, 0.08, 0.325, 0.18] },
  // Movement: Left
  { pose: 'move-left-idle', box: [0.045, 0.19, 0.11, 0.29] },
  { pose: 'move-left-walk-a', box: [0.115, 0.19, 0.18, 0.29] },
  { pose: 'move-left-passing', box: [0.185, 0.19, 0.25, 0.29] },
  { pose: 'move-left-walk-b', box: [0.255, 0.19, 0.325, 0.29] },
  // Movement: Right
  { pose: 'move-right-idle', box: [0.045, 0.31, 0.11, 0.41] },
  { pose: 'move-right-walk-a', box: [0.115, 0.31, 0.18, 0.41] },
  { pose: 'move-right-passing', box: [0.185, 0.31, 0.25, 0.41] },
  { pose: 'move-right-walk-b', box: [0.255, 0.31, 0.325, 0.41] },
  // Movement: Up
  { pose: 'move-up-idle', box: [0.045, 0.43, 0.11, 0.53] },
  { pose: 'move-up-walk-a', box: [0.115, 0.43, 0.18, 0.53] },
  { pose: 'move-up-passing', box: [0.185, 0.43, 0.25, 0.53] },
  { pose: 'move-up-walk-b', box: [0.255, 0.43, 0.325, 0.53] },

  // 2. Expressions: Row 1
  { pose: 'expression-normal', box: [0.34, 0.065, 0.415, 0.17] },
  { pose: 'expression-happy', box: [0.42, 0.065, 0.495, 0.17] },
  { pose: 'expression-excited', box: [0.50, 0.065, 0.575, 0.17] },
  { pose: 'expression-sparkle', box: [0.58, 0.065, 0.655, 0.17] },
  // Expressions: Row 2
  { pose: 'expression-thinking', box: [0.34, 0.20, 0.415, 0.315] },
  { pose: 'expression-confused', box: [0.42, 0.20, 0.495, 0.315] },
  { pose: 'expression-worried', box: [0.50, 0.20, 0.575, 0.315] },
  { pose: 'expression-sweat', box: [0.58, 0.20, 0.655, 0.315] },
  // Expressions: Row 3
  { pose: 'expression-tired', box: [0.34, 0.345, 0.415, 0.465] },
  { pose: 'expression-sleepy', box: [0.42, 0.345, 0.495, 0.465] },
  { pose: 'expression-angry', box: [0.50, 0.345, 0.575, 0.465] },
  { pose: 'expression-shocked', box: [0.58, 0.345, 0.655, 0.465] },
  // Expressions: Row 4
  { pose: 'expression-proud', box: [0.34, 0.495, 0.415, 0.605] },
  { pose: 'expression-sad', box: [0.42, 0.495, 0.495, 0.605] },
  { pose: 'expression-love', box: [0.50, 0.495, 0.575, 0.605] },
  { pose: 'expression-panic', box: [0.58, 0.495, 0.655, 0.605] },

  // 3. Travel Actions: Row 1
  { pose: 'action-map', box: [0.665, 0.065, 0.745, 0.17] },
  { pose: 'action-photo', box: [0.75, 0.065, 0.83, 0.17] },
  { pose: 'action-binoculars', box: [0.835, 0.065, 0.915, 0.17] },
  { pose: 'action-gps', box: [0.92, 0.065, 0.995, 0.17] },
  // Actions: Row 2
  { pose: 'action-journal', box: [0.665, 0.20, 0.745, 0.315] },
  { pose: 'action-drink', box: [0.75, 0.20, 0.83, 0.315] },
  { pose: 'action-snack', box: [0.835, 0.20, 0.915, 0.315] },
  { pose: 'action-suggest', box: [0.92, 0.20, 0.995, 0.315] },
  // Actions: Row 3
  { pose: 'action-luggage', box: [0.665, 0.345, 0.745, 0.465] },
  { pose: 'action-bags', box: [0.75, 0.345, 0.83, 0.465] },
  { pose: 'action-umbrella', box: [0.835, 0.345, 0.915, 0.465] },
  { pose: 'action-transit', box: [0.92, 0.345, 0.995, 0.465] },
  // Actions: Row 4
  { pose: 'action-pack', box: [0.665, 0.495, 0.745, 0.605] },
  { pose: 'action-unpack', box: [0.75, 0.495, 0.83, 0.605] },
  { pose: 'action-rest', box: [0.835, 0.495, 0.915, 0.605] },
  { pose: 'action-celebrate', box: [0.92, 0.495, 0.995, 0.605] },

  // 4. UI / Scene Poses (8)
  { pose: 'scene-home', box: [0.015, 0.63, 0.11, 0.75] },
  { pose: 'scene-planning', box: [0.115, 0.63, 0.235, 0.75] },
  { pose: 'scene-court', box: [0.24, 0.63, 0.355, 0.75] },
  { pose: 'scene-gacha', box: [0.365, 0.63, 0.475, 0.75] },
  { pose: 'scene-packing', box: [0.485, 0.63, 0.60, 0.75] },
  { pose: 'scene-traveling', box: [0.61, 0.63, 0.725, 0.75] },
  { pose: 'scene-memory-trunk', box: [0.73, 0.63, 0.85, 0.75] },
  { pose: 'scene-empty', box: [0.855, 0.63, 0.985, 0.75] },
];

export const extractedCocoCache: Record<string, string> = {};

export async function extractAndSaveAllCocoSprites(imgUrl: string): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const W = img.naturalWidth;
      const H = img.naturalHeight;

      for (const item of ALL_SPRITE_DEFS) {
        const [x1Pct, y1Pct, x2Pct, y2Pct] = item.box;
        const sx = Math.floor(x1Pct * W);
        const sy = Math.floor(y1Pct * H);
        const sw = Math.floor((x2Pct - x1Pct) * W);
        const sh = Math.floor((y2Pct - y1Pct) * H);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sw;
        tempCanvas.height = sh;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) continue;

        tempCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const imgData = tempCtx.getImageData(0, 0, sw, sh);
        const d = imgData.data;

        // Auto-detect tight non-white bounding box
        let minX = sw, minY = sh, maxX = 0, maxY = 0;
        let hasContent = false;

        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const idx = (y * sw + x) * 4;
            const r = d[idx];
            const g = d[idx + 1];
            const b = d[idx + 2];
            // If pixel is NOT background (background is light off-white > 238)
            const isBg = r > 238 && g > 238 && b > 238;
            if (!isBg) {
              hasContent = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (!hasContent) {
          minX = 0; minY = 0; maxX = sw; maxY = sh;
        }

        // Add 4px padding
        const pad = 4;
        const cropX = Math.max(0, minX - pad);
        const cropY = Math.max(0, minY - pad);
        const cropW = Math.min(sw - cropX, (maxX - minX) + pad * 2);
        const cropH = Math.min(sh - cropY, (maxY - minY) + pad * 2);

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = cropW;
        finalCanvas.height = cropH;
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) continue;

        finalCtx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        // Make background transparent
        const finalData = finalCtx.getImageData(0, 0, cropW, cropH);
        const fd = finalData.data;
        for (let i = 0; i < fd.length; i += 4) {
          const r = fd[i];
          const g = fd[i + 1];
          const b = fd[i + 2];
          if (r > 240 && g > 240 && b > 240) {
            fd[i + 3] = 0; // Transparent
          }
        }
        finalCtx.putImageData(finalData, 0, 0);

        const base64 = finalCanvas.toDataURL('image/png');
        const filename = `coco-${item.pose}.png`;
        extractedCocoCache[item.pose] = base64;

        // Post to dev server to persist into src/assets/coco/extracted/
        try {
          fetch('/api/save-extracted-coco', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, base64 }),
          }).catch(() => {});
        } catch {}
      }

      try {
        window.dispatchEvent(new CustomEvent('coco-sprites-ready'));
        console.log('✨ [Coco Extractor] Extracted all 56 sprites successfully!');
      } catch {}
      resolve(extractedCocoCache);
    };

    img.onerror = () => resolve(extractedCocoCache);
    img.src = imgUrl;
  });
}
