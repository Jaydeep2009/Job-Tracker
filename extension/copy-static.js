import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Create dist folder if it doesn't exist
if (!existsSync('dist')) {
  mkdirSync('dist');
}

// Create dist/icons folder
if (!existsSync('dist/icons')) {
  mkdirSync('dist/icons');
}

// Files to copy
const filesToCopy = [
  'manifest.json',
  'popup.html',
  'settings.html',
  'icons/JOBTRACKER16x16.png',
  'icons/JOBTRACKER32x32.png',
  'icons/JOBTRACKER48x48.png',
  'icons/JOBTRACKER128x128.png',
  'icons/manifest-icons.json'
];

// Copy each file
filesToCopy.forEach(file => {
  const src = file;
  const dest = join('dist', file);
  copyFileSync(src, dest);
  console.log(`Copied: ${file}`);
});

console.log('✅ Static files copied to dist/');
