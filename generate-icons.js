import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SVG_PATH = path.join(__dirname, 'client/public/icons/bottle9jabet-logo.svg');
const OUTPUT_DIR = path.join(__dirname, 'client/public/icons');

async function generateIcons() {
  try {
    // Read the SVG file
    const svgBuffer = await fs.readFile(SVG_PATH);
    
    // Generate icons for each size
    for (const size of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      
      console.log(`Generating icon: ${outputPath}`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
    }
    
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();