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

await new Promise(r => server.listen(8166, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:8166/funciones.html', { waitUntil: 'networkidle' });

// Click tab secante to activate panel
await page.click('#tab-secante');
await page.waitForTimeout(400);

const data = await page.evaluate(() => {
  const svg = document.querySelector('#sec-svg');
  const rSvg = svg.getBoundingClientRect();
  const labels = Array.from(svg.querySelectorAll('text, tspan')).filter(t => t.textContent.trim().length > 0);
  const p1 = labels.find(l => l.textContent.includes('P₁'));
  const p2 = labels.find(l => l.textContent.includes('P₂'));
  const dy = labels.find(l => l.textContent.includes('Δy'));
  
  const getPos = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      text: el.textContent.trim(),
      cssFs: parseFloat(style.fontSize),
      effFs: parseFloat(style.fontSize) * (rSvg.width / 600),
      rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
    };
  };

  return {
    svgBox: { x: Math.round(rSvg.left), y: Math.round(rSvg.top), w: Math.round(rSvg.width), h: Math.round(rSvg.height) },
    P1: getPos(p1),
    P2: getPos(p2),
    dy: getPos(dy)
  };
});

console.log('Secante active at 390px:\n', JSON.stringify(data, null, 2));

await browser.close();
server.close();
