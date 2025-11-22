const fs = require('fs');
const path = require('path');

// Get image files
const galleryDir = path.join(__dirname, '../assets/images_hackatum2024');
const publicDir = path.join(__dirname, '../assets/images_hackatum2023');

function getImageFiles(dir) {
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'))
      .sort(); // Sort for consistent ordering
    return files;
  } catch (e) {
    console.error(`Error reading directory ${dir}:`, e);
    return [];
  }
}

const galleryFiles = getImageFiles(galleryDir);
const publicFiles = getImageFiles(publicDir);

// Generate the imageLoader.ts file
const imageLoaderContent = `// Image loader utility for HackaTUM photos
// This file is auto-generated. Do not edit manually.
// Run: node scripts/generate-image-loader.js

// Gallery images (2024) - using symlinks in assets/images
export const galleryImages = [
${galleryFiles.map((file, i) => `  require('../assets/images/hackatum2024_${file}'),`).join('\n')}
];

// Public images (2023) - using symlinks in assets/images
export const publicImages = [
${publicFiles.map((file, i) => `  require('../assets/images/hackatum2023_${file}'),`).join('\n')}
];
`;

// Write the file
const outputPath = path.join(__dirname, '../utils/imageLoader.ts');
fs.writeFileSync(outputPath, imageLoaderContent);
console.log(`Generated imageLoader.ts with ${galleryFiles.length} gallery images and ${publicFiles.length} public images`);

