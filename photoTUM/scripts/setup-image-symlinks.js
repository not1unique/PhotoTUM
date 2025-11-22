const fs = require('fs');
const path = require('path');

// Create symlinks for images so Metro can resolve them
const assetsDir = path.join(__dirname, '../assets');
const imagesDir = path.join(assetsDir, 'images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create symlinks for hackatum2024 images
const hackatum2024Dir = path.join(assetsDir, 'images_hackatum2024');
const hackatum2023Dir = path.join(assetsDir, 'images_hackatum2023');

function createSymlinks(sourceDir, prefix) {
  if (!fs.existsSync(sourceDir)) {
    console.log(`Source directory ${sourceDir} does not exist`);
    return;
  }

  const files = fs.readdirSync(sourceDir).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
  );

  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const linkPath = path.join(imagesDir, `${prefix}_${file}`);
    
    // Remove existing symlink if it exists
    if (fs.existsSync(linkPath)) {
      fs.unlinkSync(linkPath);
    }
    
    // Create symlink
    try {
      fs.symlinkSync(path.relative(imagesDir, sourcePath), linkPath);
      console.log(`Created symlink: ${linkPath}`);
    } catch (e) {
      console.error(`Error creating symlink for ${file}:`, e);
    }
  });
}

console.log('Creating symlinks for images...');
createSymlinks(hackatum2024Dir, 'hackatum2024');
createSymlinks(hackatum2023Dir, 'hackatum2023');
console.log('Done!');

