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
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

const PORT = 8227;
await new Promise(r => server.listen(PORT, r));
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });

for (const w of [390, 360]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  await page.goto(`http://localhost:${PORT}/funciones.html`, { waitUntil: 'networkidle' });
  const navBox = await page.evaluate(() => {
    const nav = document.querySelector('.site-nav');
    const r = nav.getBoundingClientRect();
    const cs = window.getComputedStyle(nav);
    return {
      height: r.height,
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      brandH: document.querySelector('.site-nav__brand').getBoundingClientRect().height,
      listH: document.querySelector('.site-nav__list').getBoundingClientRect().height,
    };
  });
  console.log(`Viewport ${w}px -> Nav:`, navBox);
  await page.close();
}

await browser.close();
server.close();
