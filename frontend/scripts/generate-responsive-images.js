import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.resolve(__dirname, '../public/assets');

const breakpoints = {
  sm: 640,
  md: 1024,
  lg: 1920,
};

async function processImage(filePath) {
  const ext = path.extname(filePath);
  if (!['.png', '.jpg', '.jpeg'].includes(ext.toLowerCase())) return;
  if (filePath.includes('-sm.') || filePath.includes('-md.') || filePath.includes('-lg.')) return;

  const baseName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);

  console.log(`Processing ${baseName}${ext}...`);

  for (const [size, width] of Object.entries(breakpoints)) {
    const outputPath = path.join(dirName, `${baseName}-${size}.webp`);
    
    // Skip if already exists
    if (fs.existsSync(outputPath)) {
        console.log(`  Skipping ${size} variant (already exists)`);
        continue;
    }

    try {
      await sharp(filePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`  Created ${size} variant`);
    } catch (error) {
      console.error(`  Error creating ${size} variant:`, error);
    }
  }
}

async function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await walkDir(filePath);
    } else {
      await processImage(filePath);
    }
  }
}

async function run() {
  console.log('Generating responsive images...');
  await walkDir(ASSETS_DIR);
  console.log('Done!');
}

run();
