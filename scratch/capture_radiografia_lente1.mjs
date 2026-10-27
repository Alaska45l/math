import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/home/alaska45l/Projects/Math/node_modules/playwright/index.mjs';

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
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

const PORT = 8206;
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });

const outDir = '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const width of [1280, 1920]) {
  const page = await browser.newPage({ viewport: { width, height: 850 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/funciones.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.click('#tab-radiografia');
  await page.waitForSelector('#rad-svg');
  await page.waitForTimeout(300);

  const outPath = path.join(outDir, `radiografia_lente1_${width}px.png`);
  await page.screenshot({ path: outPath });
  console.log(`Captured Radiografia Lente 1 @ ${width}px: ${outPath}`);
  await page.close();
}

await browser.close();
server.close();
