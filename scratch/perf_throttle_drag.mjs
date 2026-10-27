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

const PORT = 8186;
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--disable-gpu-vsync', '--disable-frame-rate-limit']
});

console.log('=== PERFORMANCE TEST (CDP CPUThrottlingRate: 4) ===');

async function testDragPerformance(viewUrl, setupFn, dragSelector, testName) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto(viewUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await setupFn(page);
  await page.waitForTimeout(300);

  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  // Hook into pointermove/input to measure dispatch-to-render duration
  await page.evaluate(() => {
    window._renderTimes = [];
    window.addEventListener('pointermove', () => {
      const t0 = performance.now();
      requestAnimationFrame(() => {
        window._renderTimes.push(performance.now() - t0);
      });
    }, { capture: true, passive: true });
  });

  const handle = await page.waitForSelector(dragSelector, { state: 'attached' });
  const box = await handle.boundingBox();
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  // Perform smooth drag interaction
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(startX + 60, startY + 15, { steps: 15 });
    await page.mouse.move(startX - 60, startY - 15, { steps: 15 });
  }
  await page.mouse.up();
  await page.waitForTimeout(100);

  const times = await page.evaluate(() => window._renderTimes);

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await page.close();

  const validTimes = times.slice(2).sort((a, b) => a - b);
  const p50 = validTimes[Math.floor(validTimes.length * 0.50)] || 0;
  const p95 = validTimes[Math.floor(validTimes.length * 0.95)] || 0;
  const max = validTimes[validTimes.length - 1] || 0;

  console.log(`[${testName}] Samples: ${validTimes.length} events`);
  console.log(`  p50: ${p50.toFixed(2)} ms | p95: ${p95.toFixed(2)} ms | max: ${max.toFixed(2)} ms`);
  console.log(`  Target p95 <= 16ms: ${p95 <= 16 ? 'PASS' : 'EXCEEDED'}`);
  return { testName, p50, p95, max };
}

// 1. Secante Drag Test
await testDragPerformance(
  `http://localhost:${PORT}/funciones.html`,
  async (page) => {
    await page.click('#tab-secante');
  },
  '#panel-secante .fn-handle-ring--p1',
  'Secante Handle P1 Drag'
);

// 2. Inversa Drag Test
await testDragPerformance(
  `http://localhost:${PORT}/funciones.html`,
  async (page) => {
    await page.click('#tab-inversa');
  },
  '#panel-inversa .fn-handle-ring--p1',
  'Inversa Direct Point Drag'
);

await browser.close();
server.close();
