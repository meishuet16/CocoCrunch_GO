import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function copyCharacterAssets(): Plugin {
  const syncAssets = () => {
    try {
      const charDir = path.resolve(__dirname, 'public/characters');
      if (!fs.existsSync(charDir)) {
        fs.mkdirSync(charDir, { recursive: true });
      }
      const mappings: Record<string, string> = {
        'judge.png': 'Codex Image Sep 10, 2026, 06_21_43 PM.png',
        'boy_yellow.png': 'Codex Image Sep 10, 2026, 06_21_47 PM.png',
        'boy_green.png': 'Codex Image Sep 10, 2026, 06_21_35 PM.png',
        'girl_redhat.png': 'Codex Image Sep 10, 2026, 06_21_38 PM.png',
        'girl_blonde.png': 'Codex Image Sep 10, 2026, 06_21_31 PM.png',
      };
      for (const [target, src] of Object.entries(mappings)) {
        const srcPath = path.resolve(__dirname, src);
        const destPath = path.resolve(charDir, target);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      }

      // Sync 4-member airplane squad illustration for Screen 8 (Save / Jeju Added)
      const airplaneSrc = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/.user_uploaded/media_1789039313939.png');
      const airplaneDest = path.resolve(charDir, 'airplane_squad.png');
      const airplaneDestRoot = path.resolve(__dirname, 'public/airplane_squad.png');
      if (fs.existsSync(airplaneSrc)) {
        fs.copyFileSync(airplaneSrc, airplaneDest);
        fs.copyFileSync(airplaneSrc, airplaneDestRoot);
      }

      // Sync Screen 1 Authentic Master UI
      const screen1Src = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/.user_uploaded/media_1789046770084.png');
      const screen1Dest = path.resolve(charDir, 'screen1_master.png');
      const screen1DestRoot = path.resolve(__dirname, 'public/screen1_master.png');
      if (fs.existsSync(screen1Src)) {
        fs.copyFileSync(screen1Src, screen1Dest);
        fs.copyFileSync(screen1Src, screen1DestRoot);
        const buf = fs.readFileSync(screen1Src);
        const w = buf.readUInt32BE(16);
        const h = buf.readUInt32BE(20);
        fs.writeFileSync(path.resolve(charDir, 'screen1_meta.json'), JSON.stringify({ width: w, height: h }));
        console.log(`[Screen 1 Master Asset] Width: ${w}, Height: ${h}`);
      }

      // Sync Generated High-Design Court Stage Background (Vertical Inward Desks, NO Chairs)
      const courtBgSrc = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/court_desks_vertical_no_chairs_1789050738360.jpg');
      if (fs.existsSync(courtBgSrc)) {
        fs.copyFileSync(courtBgSrc, path.resolve(charDir, 'court_stage_bg.jpg'));
        fs.copyFileSync(courtBgSrc, path.resolve(__dirname, 'public/court_stage_bg.jpg'));
      }

      // Sync alternate versions for quick preview / fallback
      const courtCleanSrc = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/court_hall_clean_1789050156568.jpg');
      if (fs.existsSync(courtCleanSrc)) {
        fs.copyFileSync(courtCleanSrc, path.resolve(charDir, 'court_hall_clean.jpg'));
        fs.copyFileSync(courtCleanSrc, path.resolve(__dirname, 'public/court_hall_clean.jpg'));
      }
      const courtHorizSrc = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/court_desks_inward_v2_1789050283137.jpg');
      if (fs.existsSync(courtHorizSrc)) {
        fs.copyFileSync(courtHorizSrc, path.resolve(charDir, 'court_stage_horiz.jpg'));
        fs.copyFileSync(courtHorizSrc, path.resolve(__dirname, 'public/court_stage_horiz.jpg'));
      }

      // Sync Court Props
      const courtPropsSrc = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/.user_uploaded/media_1789048789216.png');
      if (fs.existsSync(courtPropsSrc)) {
        fs.copyFileSync(courtPropsSrc, path.resolve(charDir, 'court_props.png'));
        fs.copyFileSync(courtPropsSrc, path.resolve(__dirname, 'public/court_props.png'));
      }
    } catch (e) {
      console.warn('Character asset sync warning:', e);
    }
  };

  return {
    name: 'copy-character-assets',
    buildStart() {
      syncAssets();
    },
    configureServer(server) {
      syncAssets();
      server.middlewares.use((req, res, next) => {
        const cleanUrl = req.url ? req.url.split('?')[0] : '';
        if (cleanUrl === '/characters/airplane_squad.png' || cleanUrl === '/airplane_squad.png') {
          const airplaneSrc = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/.user_uploaded/media_1789039313939.png');
          if (fs.existsSync(airplaneSrc)) {
            try {
              fs.copyFileSync(airplaneSrc, path.resolve(__dirname, 'public/characters/airplane_squad.png'));
              fs.copyFileSync(airplaneSrc, path.resolve(__dirname, 'public/airplane_squad.png'));
            } catch {}
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return fs.createReadStream(airplaneSrc).pipe(res);
          }
        }
        if (cleanUrl === '/characters/screen1_master.png' || cleanUrl === '/screen1_master.png') {
          const screen1Src = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/.user_uploaded/media_1789046770084.png');
          if (fs.existsSync(screen1Src)) {
            try {
              fs.copyFileSync(screen1Src, path.resolve(__dirname, 'public/characters/screen1_master.png'));
              fs.copyFileSync(screen1Src, path.resolve(__dirname, 'public/screen1_master.png'));
            } catch {}
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return fs.createReadStream(screen1Src).pipe(res);
          }
        }
        if (cleanUrl === '/characters/court_stage_bg.jpg' || cleanUrl === '/court_stage_bg.jpg') {
          const bgSrc = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/court_desks_vertical_no_chairs_1789050738360.jpg');
          if (fs.existsSync(bgSrc)) {
            try {
              fs.copyFileSync(bgSrc, path.resolve(__dirname, 'public/characters/court_stage_bg.jpg'));
              fs.copyFileSync(bgSrc, path.resolve(__dirname, 'public/court_stage_bg.jpg'));
            } catch {}
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return fs.createReadStream(bgSrc).pipe(res);
          }
        }
        if (cleanUrl === '/characters/court_stage_horiz.jpg' || cleanUrl === '/court_stage_horiz.jpg') {
          const horizSrc = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/court_desks_inward_v2_1789050283137.jpg');
          if (fs.existsSync(horizSrc)) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return fs.createReadStream(horizSrc).pipe(res);
          }
        }
        if (cleanUrl === '/characters/court_props.png' || cleanUrl === '/court_props.png') {
          const propsSrc = path.normalize('C:/Users/Zi Shan/.gemini/antigravity/brain/d62c36e5-ee89-4021-8a4e-8fb066dfe1a6/.user_uploaded/media_1789048789216.png');
          if (fs.existsSync(propsSrc)) {
            try {
              fs.copyFileSync(propsSrc, path.resolve(__dirname, 'public/characters/court_props.png'));
              fs.copyFileSync(propsSrc, path.resolve(__dirname, 'public/court_props.png'));
            } catch {}
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return fs.createReadStream(propsSrc).pipe(res);
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyCharacterAssets(),
  ],
});

