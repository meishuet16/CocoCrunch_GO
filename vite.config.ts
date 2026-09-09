import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const sourceDir = path.resolve(__dirname, 'src/assets/coco/source');
const extractedDir = path.resolve(__dirname, 'src/assets/coco/extracted');
if (!fs.existsSync(sourceDir)) fs.mkdirSync(sourceDir, { recursive: true });
if (!fs.existsSync(extractedDir)) fs.mkdirSync(extractedDir, { recursive: true });

const uploadedPath = 'C:\\Users\\Zi Shan\\.gemini\\antigravity\\brain\\71e627ff-267e-44a2-8745-727076792f89\\.user_uploaded\\media_1788973795609.jpg';
const localMasterPath = path.resolve(sourceDir, 'coco-master-sheet.jpg');
if (fs.existsSync(uploadedPath)) {
  try {
    fs.copyFileSync(uploadedPath, localMasterPath);
  } catch {}
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'coco-extractor-api',
      configureServer(server) {
        server.middlewares.use('/coco-master-sheet.jpg', (req, res) => {
          const target = fs.existsSync(localMasterPath) ? localMasterPath : uploadedPath;
          if (fs.existsSync(target)) {
            res.setHeader('Content-Type', 'image/jpeg');
            fs.createReadStream(target).pipe(res);
          } else {
            res.statusCode = 404;
            res.end();
          }
        });

        server.middlewares.use('/api/save-extracted-coco', (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { filename, base64 } = JSON.parse(body);
                const data = base64.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(data, 'base64');
                fs.writeFileSync(path.join(extractedDir, filename), buffer);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, file: filename }));
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            res.statusCode = 404;
            res.end();
          }
        });
      },
    },
  ],
});
