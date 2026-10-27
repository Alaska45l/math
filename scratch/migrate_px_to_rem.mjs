import fs from 'node:fs';
import path from 'node:path';

const CSS_DIR = path.join(process.cwd(), 'css');

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Replace font-size: XXpx with XX/16 rem
      // Do not touch SVG filters or attributes in SVG data URIs
      content = content.replace(/font-size:\s*([\d\.]+)px/g, (match, pxStr) => {
        const px = parseFloat(pxStr);
        const rem = px / 16;
        const remStr = Number(rem.toFixed(4)).toString() + 'rem';
        return `font-size: ${remStr}`;
      });

      // Replace font: XXpx/... with font: (XX/16)rem/...
      content = content.replace(/font:\s*([\d\.]+)px\//g, (match, pxStr) => {
        const px = parseFloat(pxStr);
        const rem = px / 16;
        const remStr = Number(rem.toFixed(4)).toString() + 'rem';
        return `font: ${remStr}/`;
      });

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Migrated font-sizes in ${path.relative(process.cwd(), fullPath)}`);
      }
    }
  }
}

processDir(CSS_DIR);
console.log('Migration to rem completed.');
