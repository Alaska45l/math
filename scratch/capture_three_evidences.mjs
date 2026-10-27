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

await new Promise(r => server.listen(8168, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });

// Evidence (a): Recorte DPR 3 de la leyenda pin/hueco
const pageA = await browser.newPage({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 3 });
await pageA.goto('http://localhost:8168/unidades.html', { waitUntil: 'networkidle' });
await pageA.evaluate(() => document.fonts.ready);
const legendEl = await pageA.$('.dim-legend');
const pathA = 'screenshots/fase2/evidence_8a_pin_hueco_dpr3.png';
await legendEl.screenshot({ path: pathA });
console.log('Saved (a) to:', pathA);
await pageA.close();

// Evidence (b): Riel de postes con outline rojo temporal del parche de borrador
const pageB = await browser.newPage({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 2 });
await pageB.goto('http://localhost:8168/sucesiones.html#postes', { waitUntil: 'networkidle' });
await pageB.evaluate(() => document.fonts.ready);
// Add red outline to the eraser patch behind the riel track
await pageB.evaluate(() => {
  const trackWrap = document.querySelector('.seq-track-wrap');
  trackWrap.style.outline = '2px dashed #ff0000';
  trackWrap.style.outlineOffset = '4px';
  trackWrap.style.borderRadius = '4px';
});
const trackEl = await pageB.$('.seq-track-wrap');
const pathB = 'screenshots/fase2/evidence_8b_riel_outline.png';
await trackEl.screenshot({ path: pathB });
console.log('Saved (b) to:', pathB);
await pageB.close();

// Evidence (c): Clip del elemento de la fila 2 del TCP a 390px
const pageC = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await pageC.goto('http://localhost:8168/funciones.html', { waitUntil: 'networkidle' });
await pageC.click('#tab-secante');
await pageC.waitForTimeout(400);
await pageC.evaluate(() => document.fonts.ready);
const row2El = (await pageC.$$('.tcp-row'))[1];
const pathC = 'screenshots/fase2/evidence_8c_tcp_row2_390px.png';
await row2El.screenshot({ path: pathC });
console.log('Saved (c) to:', pathC);
await pageC.close();

await browser.close();
server.close();
