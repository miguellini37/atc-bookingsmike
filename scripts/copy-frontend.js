const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'frontend', 'dist');
const destDir = path.join(__dirname, '..', 'backend', 'public');

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Clean destination directory
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true });
}

// Copy frontend build to backend public folder
console.log('Copying frontend build to backend/public...');
copyRecursive(sourceDir, destDir);
console.log('Frontend build copied successfully!');
