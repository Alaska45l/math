import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/home/alaska45l/Projects/Math/node_modules/playwright/index.mjs';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join('/home/alaska45l/Projects/Math', reqPath);
  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    const mime = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.woff2': 'font/woff2'
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(8198, async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  
  fs.mkdirSync('/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence/icon_crops', { recursive: true });
  const crops = [];

  // 1. Lock in Radiografía
  // Helper to capture icon crop
  async function captureCrop(el, cropPath, label) {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const box = await el.boundingBox();
    await page.screenshot({
      path: cropPath,
      clip: {
        x: Math.max(0, box.x + box.width / 2 - 60),
        y: Math.max(0, box.y + box.height / 2 - 40),
        width: 120,
        height: 80
      }
    });
    crops.push({ label, path: cropPath });
  }

  // 1. Lock in Radiografía
  await page.goto('http://localhost:8198/funciones.html');
  await page.waitForLoadState('networkidle');
  await page.click('#tab-radiografia');
  await page.waitForTimeout(300);
  const radIcon = await page.$('.notice--warn .chalk-icon--lock');
  if (radIcon) {
    await captureCrop(radIcon, '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence/icon_crops/icon_1_lock.png', 'Candado Eje X (Radiografía)');
  }

  // 2. Cross in Scanner Collision
  await page.click('#tab-scanner');
  await page.waitForTimeout(200);
  await page.selectOption('#sc-case', '2');
  await page.fill('#sc-x', '2');
  await page.dispatchEvent('#sc-x', 'input');
  await page.waitForTimeout(300);
  const scanIcon = await page.$('.text-err .chalk-icon--cross');
  if (scanIcon) {
    await captureCrop(scanIcon, '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence/icon_crops/icon_2_scanner_cross.png', 'No es función (Cruz Escáner)');
  }

  // 3. Postes: Formula correcta check, Woo-jin cross, Kiran cross
  await page.goto('http://localhost:8198/sucesiones.html');
  await page.waitForLoadState('networkidle');
  await page.click('#tab-postes');
  await page.waitForTimeout(200);
  await page.selectOption('#seq-preset', 'woo');
  await page.dispatchEvent('#seq-preset', 'change');
  await page.waitForTimeout(300);

  const checkPostes = await page.$('.seq-compare-row--good .chalk-icon--check');
  if (checkPostes) {
    await captureCrop(checkPostes, '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence/icon_crops/icon_3_check_postes.png', 'Tilde Fórmula Correcta');
  }

  const badPostes = await page.$$('.seq-compare-row--bad .chalk-icon--cross');
  if (badPostes[0]) {
    await captureCrop(badPostes[0], '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence/icon_crops/icon_4_woo_cross.png', 'Cruz Woo-Jin (Postes)');
  }

  if (badPostes[1]) {
    await captureCrop(badPostes[1], '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence/icon_crops/icon_5_kiran_cross.png', 'Cruz Kiran (Postes)');
  }

  // 4. Retos: Table verification check
  await page.click('#tab-retos');
  await page.waitForTimeout(200);
  await page.click('.seq-exercise[data-task="1"] button[data-answer="1"]');
  await page.waitForTimeout(300);
  const retosCheck = await page.$('.seq-cell-good .chalk-icon--check');
  if (retosCheck) {
    await captureCrop(retosCheck, '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence/icon_crops/icon_6_retos_check.png', 'Tilde Balanza (Retos)');
  }


  console.log('Successfully captured crops:', crops.length);
  await browser.close();
  server.close();
});
