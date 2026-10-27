import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/home/alaska45l/Projects/Math/node_modules/playwright/index.mjs';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath);
  if (!fs.existsSync(filePath)) { res.statusCode = 404; return res.end(); }
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});
await new Promise(r => server.listen(8260, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });

for (const w of [390, 820, 1280, 1920, 2560]) {
  const page = await browser.newPage({ viewport: { width: w, height: 1080 } });
  await page.goto('http://localhost:8260/funciones.html');
  const info = await page.evaluate(() => {
    const rootFs = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const bodyFs = parseFloat(getComputedStyle(document.body).fontSize);
    const pFs = parseFloat(getComputedStyle(document.querySelector('p')).fontSize);
    const h1Fs = parseFloat(getComputedStyle(document.querySelector('h1')).fontSize);
    const wideW = parseFloat(getComputedStyle(document.querySelector('.page--wide')).maxWidth);
    return { rootFs, bodyFs, pFs, h1Fs, wideW };
  });
  console.log(`Viewport ${w}px -> root: ${info.rootFs}px, body: ${info.bodyFs}px, p: ${info.pFs}px, h1: ${info.h1Fs}px, page--wide max-width: ${info.wideW}px`);
  await page.close();
}

await browser.close();
server.close();
