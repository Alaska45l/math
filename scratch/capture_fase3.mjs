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
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.png': 'image/png'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

await new Promise(r => server.listen(8169, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });

fs.mkdirSync('screenshots/fase3/raw', { recursive: true });

// 1. Mobile captures (390px)
const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

// 1a. Postes (riel) a 390px
await mobilePage.goto('http://localhost:8169/sucesiones.html#postes', { waitUntil: 'networkidle' });
await mobilePage.evaluate(() => document.fonts.ready);
await mobilePage.waitForTimeout(300);
const postesEl = await mobilePage.$('#panel-postes');
await (postesEl || mobilePage).screenshot({ path: 'screenshots/fase3/raw/m_postes.png' });
console.log('Captured m_postes.png');

// 1b. Radar geométrico a 390px
await mobilePage.click('#tab-geometrica');
await mobilePage.waitForTimeout(300);
const geoEl = await mobilePage.$('#panel-geometrica');
await (geoEl || mobilePage).screenshot({ path: 'screenshots/fase3/raw/m_radar.png' });
console.log('Captured m_radar.png');

// 1c. Circuito a 390px
await mobilePage.goto('http://localhost:8169/desigualdades.html', { waitUntil: 'networkidle' });
await mobilePage.evaluate(() => document.fonts.ready);
await mobilePage.waitForTimeout(300);
const mainCirc = await mobilePage.$('main');
await (mainCirc || mobilePage).screenshot({ path: 'screenshots/fase3/raw/m_circuito.png' });
console.log('Captured m_circuito.png');

// 1d. Secante a 390px
await mobilePage.goto('http://localhost:8169/funciones.html#secante', { waitUntil: 'networkidle' });
await mobilePage.evaluate(() => document.fonts.ready);
await mobilePage.click('#tab-secante');
await mobilePage.waitForTimeout(300);
const secEl = await mobilePage.$('#panel-secante');
await (secEl || mobilePage).screenshot({ path: 'screenshots/fase3/raw/m_secante.png' });
console.log('Captured m_secante.png');

await mobilePage.close();

// 2. Desktop captures (1280px)
const deskPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });

// 2a. Radiografía Lente 1 a 1280px
await deskPage.goto('http://localhost:8169/funciones.html#radiografia', { waitUntil: 'networkidle' });
await deskPage.evaluate(() => document.fonts.ready);
await deskPage.click('#tab-radiografia');
await deskPage.waitForTimeout(300);
const radioEl = await deskPage.$('#panel-radiografia');
await (radioEl || deskPage).screenshot({ path: 'screenshots/fase3/raw/d_radiografia.png' });
console.log('Captured d_radiografia.png');

// 2b. Secante a 1280px
await deskPage.click('#tab-secante');
await deskPage.waitForTimeout(300);
const secDeskEl = await deskPage.$('#panel-secante');
await (secDeskEl || deskPage).screenshot({ path: 'screenshots/fase3/raw/d_secante.png' });
console.log('Captured d_secante.png');

await deskPage.close();
await browser.close();
server.close();
console.log('All raw screenshots captured.');
