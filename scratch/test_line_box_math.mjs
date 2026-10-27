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
    '.woff2': 'font/woff2'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

await new Promise(r => server.listen(8163, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage();

const symbols = ['≤', '→', '∪', 'ℝ', '∇'];
const baseHandText = 'Texto en Caveat de prueba sin simbolos';
const baseNoteText = 'Texto en Kalam de prueba sin simbolos';

for (const width of [1280, 390]) {
  await page.setViewportSize({ width, height: 800 });
  console.log(`\n=== Testing Line Box Height at viewport ${width}px ===`);

  await page.setContent(`
    <link rel="stylesheet" href="http://localhost:8163/css/base.css">
    <div style="padding: 20px;">
      <p id="hand-base" style="font-family: var(--font-hand); font-size: 20px; line-height: 1.4; margin: 0;">${baseHandText}</p>
      ${symbols.map((s, i) => `<p id="hand-sym-${i}" style="font-family: var(--font-hand); font-size: 20px; line-height: 1.4; margin: 0;">${baseHandText} ${s}</p>`).join('')}
      
      <p id="note-base" style="font-family: var(--font-note); font-size: 16px; line-height: 1.6; margin: 0;">${baseNoteText}</p>
      ${symbols.map((s, i) => `<p id="note-sym-${i}" style="font-family: var(--font-note); font-size: 16px; line-height: 1.6; margin: 0;">${baseNoteText} ${s}</p>`).join('')}
    </div>
  `);
  await page.evaluate(() => document.fonts.ready);

  const baseHandHeight = await page.$eval('#hand-base', el => el.getBoundingClientRect().height);
  console.log(`Caveat base line box height: ${baseHandHeight.toFixed(2)}px`);
  for (let i = 0; i < symbols.length; i++) {
    const h = await page.$eval(`#hand-sym-${i}`, el => el.getBoundingClientRect().height);
    const diff = Math.abs(h - baseHandHeight);
    console.log(`  Caveat + '${symbols[i]}': ${h.toFixed(2)}px (diff: ${diff.toFixed(2)}px)`);
  }

  const baseNoteHeight = await page.$eval('#note-base', el => el.getBoundingClientRect().height);
  console.log(`Kalam base line box height: ${baseNoteHeight.toFixed(2)}px`);
  for (let i = 0; i < symbols.length; i++) {
    const h = await page.$eval(`#note-sym-${i}`, el => el.getBoundingClientRect().height);
    const diff = Math.abs(h - baseNoteHeight);
    console.log(`  Kalam + '${symbols[i]}': ${h.toFixed(2)}px (diff: ${diff.toFixed(2)}px)`);
  }
}

await browser.close();
server.close();
