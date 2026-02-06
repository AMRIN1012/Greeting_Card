const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('`sharp` not available. SVG -> PNG conversion will be skipped by this script. Install sharp to enable SVG rasterization.');
  sharp = null;
}

const SRC = path.join(__dirname, '../public/templates');
const DEST = path.join(__dirname, '../backend/templates');

fs.mkdirSync(DEST, { recursive: true });

(async () => {
  const files = fs.readdirSync(SRC);
  console.log('Found', files.length, 'template files in', SRC);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const rawBase = path.basename(file, ext);
    // Normalize base name for new template filenames:
    // - remove any embedded image extension like '.png' (e.g. '13_GREEN LEAVES.png.svg')
    // - replace spaces with underscores
    // - trim whitespace
    let base = rawBase.replace(/\s+/g, '_').replace(/\.(png|jpe?g|svg)$/i, '');
    if (rawBase !== base) {
      console.log('Normalized template name:', rawBase, '->', `${base}`);
    }
    const srcPath = path.join(SRC, file);
    const destPath = path.join(DEST, `${base}.png`);

    try {
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        fs.copyFileSync(srcPath, destPath);
        console.log('Copied:', file, '->', destPath);
      } else if (ext === '.svg') {
        if (!sharp) {
          console.log('Skipping SVG - `sharp` not installed:', file);
        } else {
          const svgBuffer = fs.readFileSync(srcPath);
          // Render SVG to a reasonably large PNG so generators have enough resolution
          await sharp(svgBuffer)
            .resize(1200, 1350, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .png()
            .toFile(destPath);
          console.log('Converted SVG:', file, '->', destPath);
        }
      } else {
        console.log('Skipping unsupported file type:', file);
      }
    } catch (err) {
      console.error('Failed processing', file, err);
    }
  }

  console.log('Template export complete. Output folder:', DEST);
})();
