const fs = require('fs');
const path = require('path');

// Copy images to assets/images so Metro can resolve them
const assetsDir = path.join(__dirname, '../assets');
const imagesDir = path.join(assetsDir, 'images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create symlinks for hackatum2024 images
const hackatum2024Dir = path.join(assetsDir, 'images_hackatum2024');
const hackatum2023Dir = path.join(assetsDir, 'images_hackatum2023');

function copyImages(sourceDir, prefix, maxFiles = 25) {
  if (!fs.existsSync(sourceDir)) {
    console.log(`Source directory ${sourceDir} does not exist`);
    return [];
  }

  const files = fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'))
    .slice(0, maxFiles);

  const copiedFiles = [];

  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(imagesDir, `${prefix}_${file}`);
    
    // Remove existing file if it exists
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }
    
    // Copy file
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied: ${destPath}`);
      copiedFiles.push(file);
    } catch (e) {
      console.error(`Error copying ${file}:`, e);
    }
  });

  return copiedFiles;
}

console.log('Copying images to assets/images...');
const galleryFiles = copyImages(hackatum2024Dir, 'hackatum2024', 25);
const publicFiles = copyImages(hackatum2023Dir, 'hackatum2023', 25);
console.log(`Done! Copied ${galleryFiles.length} gallery images and ${publicFiles.length} public images.`);

