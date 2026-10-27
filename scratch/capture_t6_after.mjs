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

await new Promise(r => server.listen(0, r));
const PORT = server.address().port;
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });

const outDir = '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1. Escáner after
{
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/funciones.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.click('#tab-scanner');
  await page.waitForSelector('#sc-case');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'scanner_1920x1080_after.png') });
  await page.close();
}

// 2. Radiografía Lens 1 after
{
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/funciones.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.click('#tab-radiografia');
  await page.waitForSelector('#rad-lenses');
  await page.click('button[data-lens="signos"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'radiografia_lente1_1920px_after.png') });
  await page.close();
}

await browser.close();
server.close();
console.log('Screenshots captured successfully!');
