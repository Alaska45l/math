import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

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

await new Promise(r => server.listen(8169, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:8169/sucesiones.html#postes', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// Add red dashed outline to the track wrapper representing the eraser patch outline
await page.evaluate(() => {
  const trackWrap = document.querySelector('.seq-track-wrap');
  trackWrap.style.boxSizing = 'border-box';
  trackWrap.style.border = '2.5px dashed #ff4444';
  trackWrap.style.padding = '8px';
  trackWrap.style.background = 'radial-gradient(ellipse 80% 80% at 50% 50%, var(--bg) 60%, transparent 100%)';
});

const trackEl = await page.$('.seq-track-wrap');
const pathB = 'screenshots/fase2/evidence_8b_riel_outline.png';
await trackEl.screenshot({ path: pathB });
console.log('Saved (b) to:', pathB);

await browser.close();
server.close();
