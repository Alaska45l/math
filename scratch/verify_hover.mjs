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
    '.woff2': 'font/woff2',
    '.svg': 'image/svg+xml'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

await new Promise(r => server.listen(8162, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

await page.goto('http://localhost:8162/funciones.html', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// Active tab hover
const activeTab = await page.$('.tab[aria-selected="true"]');
await activeTab.hover();
const bgActive = await activeTab.evaluate(el => window.getComputedStyle(el).backgroundColor);
console.log('Active tab backgroundColor on hover:', bgActive);

// Inactive tab hover
const tabRadiografia = await page.$('#tab-radiografia');
if (tabRadiografia) {
  await tabRadiografia.hover();
  const bgInactive = await tabRadiografia.evaluate(el => window.getComputedStyle(el).backgroundColor);
  console.log('Inactive tab backgroundColor on hover:', bgInactive);

  // Click tab-radiografia to reveal quiz
  await tabRadiografia.click();
  await page.waitForTimeout(200);

  const quizBtn = await page.$('.fn-quiz-btn[data-ans="correct"]');
  if (quizBtn) {
    await quizBtn.hover();
    const bgQuiz = await quizBtn.evaluate(el => window.getComputedStyle(el).backgroundColor);
    console.log('Quiz button backgroundColor on hover:', bgQuiz);
  }
}

// Test Mobile nav at 390px
await page.setViewportSize({ width: 390, height: 844 });
const navHeight = await page.$eval('.site-nav', el => el.getBoundingClientRect().height);
const navPos = await page.$eval('.site-nav', el => window.getComputedStyle(el).position);
console.log(`Mobile nav (390px): height=${navHeight}px (target <= 90px), position=${navPos} (target static)`);

// Test anchor #panel-retos in sucesiones.html
await page.goto('http://localhost:8162/sucesiones.html#retos', { waitUntil: 'networkidle' });
await page.waitForTimeout(200);
const h1Top = await page.$eval('h1', el => el.getBoundingClientRect().top);
console.log('h1 position top on deep link #retos at 390px:', h1Top, 'px (should be >= 0)');

await browser.close();
server.close();
