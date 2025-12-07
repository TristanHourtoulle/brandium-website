#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 *
 * This script generates all required PWA icons from a source image.
 *
 * Prerequisites:
 *   pnpm add -D sharp
 *
 * Usage:
 *   node scripts/generate-pwa-icons.mjs [source-image]
 *
 * If no source image is provided, it will use public/icons/icon.svg
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const publicDir = path.join(__dirname, '..', 'public');

async function generateIcons(sourceImage) {
  console.log(`Generating PWA icons from: ${sourceImage}`);

  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const source = sharp(sourceImage);
  const metadata = await source.metadata();
  console.log(`Source image: ${metadata.width}x${metadata.height}`);

  // Generate main PWA icons
  console.log('\nGenerating PWA icons...');
  for (const size of ICON_SIZES) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(sourceImage)
      .resize(size, size, { fit: 'contain', background: { r: 37, g: 99, b: 235, alpha: 1 } })
      .png()
      .toFile(outputPath);
    console.log(`  Created: icon-${size}x${size}.png`);
  }

  // Generate shortcut icons
  console.log('\nGenerating shortcut icons...');
  const generatePath = path.join(iconsDir, `shortcut-generate.png`);
  const postsPath = path.join(iconsDir, `shortcut-posts.png`);

  await sharp(sourceImage)
    .resize(96, 96, { fit: 'contain', background: { r: 37, g: 99, b: 235, alpha: 1 } })
    .png()
    .toFile(generatePath);
  console.log(`  Created: shortcut-generate.png`);

  await sharp(sourceImage)
    .resize(96, 96, { fit: 'contain', background: { r: 37, g: 99, b: 235, alpha: 1 } })
    .png()
    .toFile(postsPath);
  console.log(`  Created: shortcut-posts.png`);

  // Generate favicons
  console.log('\nGenerating favicons...');

  // favicon-16x16.png
  await sharp(sourceImage)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('  Created: favicon-16x16.png');

  // favicon-32x32.png
  await sharp(sourceImage)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('  Created: favicon-32x32.png');

  // apple-touch-icon.png (180x180)
  await sharp(sourceImage)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('  Created: apple-touch-icon.png');

  // favicon.ico (32x32 for simplicity)
  await sharp(sourceImage)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('  Created: favicon.ico');

  console.log('\nDone! All icons generated successfully.');
  console.log('\nNote: For production, consider using a proper .ico generator for favicon.ico');
}

// Main execution
const sourceImage = process.argv[2] || path.join(iconsDir, 'icon.svg');

if (!fs.existsSync(sourceImage)) {
  console.error(`Error: Source image not found: ${sourceImage}`);
  console.error('Please provide a source image or create public/icons/icon.svg');
  process.exit(1);
}

generateIcons(sourceImage).catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
