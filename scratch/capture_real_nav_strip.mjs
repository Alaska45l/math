import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath);
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.woff2': 'font/woff2',
    '.svg': 'image/svg+xml'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

await new Promise(r => server.listen(8164, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
// deviceScaleFactor: 2 as requested!
const page = await browser.newPage({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 2 });

await page.goto('http://localhost:8164/index.html', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const { FUNDAMENTAL_LAWS } = await import('../js/core/nav.js');
console.log(`Found ${FUNDAMENTAL_LAWS.length} fundamental laws.`);

const client = await page.context().newCDPSession(page);
await client.send('DOM.enable');
await client.send('CSS.enable');
const { root } = await client.send('DOM.getDocument', { depth: -1 });

const tmpDir = path.join(process.cwd(), 'scratch/nav_crops');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const fontAuditResults = [];

for (let i = 0; i < FUNDAMENTAL_LAWS.length; i++) {
  const law = FUNDAMENTAL_LAWS[i];
  
  // Set brand HTML in real page
  await page.evaluate(({ html, name }) => {
    const brand = document.querySelector('.site-nav__brand');
    brand.innerHTML = html;
    brand.title = name;
  }, law);
  await page.waitForTimeout(100);

  // Measure platform fonts
  const { nodeIds } = await client.send('DOM.querySelectorAll', {
    nodeId: root.nodeId,
    selector: '.site-nav__brand'
  });
  let fontsUsed = [];
  if (nodeIds.length > 0) {
    const fRes = await client.send('CSS.getPlatformFontsForNode', { nodeId: nodeIds[0] });
    fontsUsed = fRes.fonts.map(f => `${f.familyName} (${f.glyphCount})`);
  }
  fontAuditResults.push({ id: i + 1, name: law.name, formula: law.formula, fonts: fontsUsed });

  // Take element screenshot of real nav
  const navEl = await page.$('.site-nav');
  const cropPath = path.join(tmpDir, `nav_${String(i).padStart(2, '0')}.png`);
  await navEl.screenshot({ path: cropPath });
}

await browser.close();
server.close();

console.log('=== REAL NAV BRAND PLATFORM FONTS ===');
for (const res of fontAuditResults) {
  console.log(`${String(res.id).padStart(2)}: ${res.name.padEnd(24)} | Formula: ${res.formula.padEnd(30)} | Fonts: ${res.fonts.join(', ')}`);
}

// Stitch with Python PIL into screenshots/fase2/nav_real_brand_strip.png
execSync(`python3 -c "
from PIL import Image
import glob, os

images = [Image.open(f'scratch/nav_crops/nav_{i:02d}.png') for i in range(22)]
widths, heights = zip(*(i.size for i in images))

max_width = max(widths)
total_height = sum(heights)

new_im = Image.new('RGB', (max_width, total_height))

y_offset = 0
for im in images:
    new_im.paste(im, (0, y_offset))
    y_offset += im.size[1]

out_path = 'screenshots/fase2/nav_real_brand_strip.png'
new_im.save(out_path)
print(f'Stitched 22 navbars into {out_path} ({max_width}x{total_height} px)')
"`);

