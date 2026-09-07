import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure static sounds, stats.json, and code samples are placed in public/ for production builds
function copyToPublic() {
  const publicDir = path.resolve(__dirname, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // Copy sounds directory intact to public/sounds
  const soundsDir = path.resolve(__dirname, 'sounds');
  const pubSoundsDir = path.resolve(publicDir, 'sounds');
  if (fs.existsSync(soundsDir)) {
    if (!fs.existsSync(pubSoundsDir)) fs.mkdirSync(pubSoundsDir, { recursive: true });
    fs.readdirSync(soundsDir).forEach(file => {
      fs.copyFileSync(path.resolve(soundsDir, file), path.resolve(pubSoundsDir, file));
    });
  }

  // Copy stats.json
  const statsFile = path.resolve(__dirname, 'stats.json');
  if (fs.existsSync(statsFile)) {
    fs.copyFileSync(statsFile, path.resolve(publicDir, 'stats.json'));
  }

  // Copy assets/code-sample.txt
  const codeSample = path.resolve(__dirname, 'assets/code-sample.txt');
  const pubAssetsDir = path.resolve(publicDir, 'assets');
  if (fs.existsSync(codeSample)) {
    if (!fs.existsSync(pubAssetsDir)) fs.mkdirSync(pubAssetsDir, { recursive: true });
    fs.copyFileSync(codeSample, path.resolve(pubAssetsDir, 'code-sample.txt'));
  }
}

copyToPublic();

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: true
  }
});


