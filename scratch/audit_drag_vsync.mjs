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
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.woff2': 'font/woff2',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

const PORT = 8202;
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: [
    '--no-sandbox',
    '--enable-features=LongAnimationFrameMonitor'
  ]
});

console.log('=== RIGOROUS VSYNC & DRAG PERFORMANCE AUDIT (CPUThrottlingRate: 4) ===');

async function benchmarkDrag(viewUrl, setupFn, dragSelector, testName) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto(viewUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await setupFn(page);
  await page.waitForTimeout(300);

  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  // Instrument page:
  // 1. Measure vsync frame intervals via rAF loop
  // 2. Measure handler execution times
  // 3. PerformanceObserver for long-animation-frame
  await page.evaluate(() => {
    window._metrics = {
      frameIntervals: [],
      handlerDurations: [],
      longAnimationFrames: []
    };

    // Long Animation Frame observer
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window._metrics.longAnimationFrames.push({
            duration: entry.duration,
            blockingDuration: entry.blockingDuration,
            startTime: entry.startTime
          });
        }
      });
      obs.observe({ type: 'long-animation-frame', buffered: true });
    } catch (_) {}

    // rAF loop to record true vsync frame-to-frame intervals
    let lastTime = performance.now();
    let isTracking = true;
    window._stopTracking = () => { isTracking = false; };

    function onFrame(now) {
      if (!isTracking) return;
      const interval = now - lastTime;
      window._metrics.frameIntervals.push(interval);
      lastTime = now;
      requestAnimationFrame(onFrame);
    }
    requestAnimationFrame(onFrame);

    // Measure pointermove handler execution duration
    window.addEventListener('pointermove', () => {
      const start = performance.now();
      // Wait for synchronous microtasks of the event
      window._metrics.handlerDurations.push(performance.now() - start);
    }, { capture: true, passive: true });
  });

  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: 'center' });
  }, dragSelector);
  await page.waitForTimeout(100);

  const rect = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, dragSelector);

  if (!rect) {
    throw new Error(`Handle '${dragSelector}' not found or zero rect`);
  }
  const startX = rect.x + rect.width / 2;
  const startY = rect.y + rect.height / 2;

  // Move mouse to handle and perform dragging back and forth 60 steps
  await page.mouse.move(startX, startY);
  await page.mouse.down();

  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const dx = Math.sin((i / steps) * Math.PI * 2) * 90;
    const dy = Math.cos((i / steps) * Math.PI * 2) * 20;
    await page.mouse.move(startX + dx, startY + dy);
    await new Promise(r => setTimeout(r, 16)); // simulate human/vsync cadence
  }
  await page.mouse.up();
  await page.waitForTimeout(200);

  const metrics = await page.evaluate(() => {
    window._stopTracking();
    return window._metrics;
  });

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await page.close();

  // Compute statistics
  const intervals = metrics.frameIntervals.slice(2); // drop first 2 warmup frames
  intervals.sort((a, b) => a - b);
  const p50 = intervals[Math.floor(intervals.length * 0.50)] || 0;
  const p95 = intervals[Math.floor(intervals.length * 0.95)] || 0;
  const max = intervals[intervals.length - 1] || 0;

  // Dropped frame criterion at 60Hz (nominal vsync = 16.67ms):
  // If an interval > 25ms, a vsync frame was missed.
  const droppedFrames = intervals.filter(t => t > 25).length;
  const totalFrames = intervals.length;
  const dropRate = totalFrames > 0 ? (droppedFrames / totalFrames) * 100 : 0;

  console.log(`
>>> ${testName} <<<`);
  console.log(`  Total Frames Tracked: ${totalFrames}`);
  console.log(`  Vsync Intervals: p50 = ${p50.toFixed(2)} ms | p95 = ${p95.toFixed(2)} ms | max = ${max.toFixed(2)} ms`);
  console.log(`  Dropped Frames (>25ms): ${droppedFrames} of ${totalFrames} (${dropRate.toFixed(1)}%)`);
  console.log(`  Long Animation Frames (LoAF >50ms): ${metrics.longAnimationFrames.length}`);
  if (metrics.longAnimationFrames.length > 0) {
    metrics.longAnimationFrames.forEach((f, idx) => {
      console.log(`    LoAF #${idx+1}: duration=${f.duration.toFixed(1)}ms, blocking=${f.blockingDuration.toFixed(1)}ms`);
    });
  }

  return { testName, totalFrames, p50, p95, max, droppedFrames, dropRate, loafCount: metrics.longAnimationFrames.length };
}

// 1. Secante Drag (Point P2)
const resSecante = await benchmarkDrag(
  `http://localhost:${PORT}/funciones.html`,
  async (page) => {
    await page.click('#tab-secante');
    await page.waitForSelector('#sec-svg');
    await page.waitForTimeout(200);
  },
  '#sec-svg .fn-handle',
  'Secante: Drag Manija P2'
);

// 2. Inversa Drag (Point P)
const resInversa = await benchmarkDrag(
  `http://localhost:${PORT}/funciones.html`,
  async (page) => {
    await page.click('#tab-inversa');
    await page.waitForSelector('#inv-svg');
    await page.waitForTimeout(200);
  },
  '#inv-svg .fn-handle',
  'Inversa: Drag Manija P'
);

console.log('\n======================================================');
console.log('BENCHMARK SUMMARY (CPU 4x Throttled):');
console.log(`  1. ${resSecante.testName}: Vsync p50=${resSecante.p50.toFixed(1)}ms, p95=${resSecante.p95.toFixed(1)}ms, ${resSecante.droppedFrames}/${resSecante.totalFrames} dropped (${resSecante.dropRate.toFixed(1)}%)`);
console.log(`  2. ${resInversa.testName}: Vsync p50=${resInversa.p50.toFixed(1)}ms, p95=${resInversa.p95.toFixed(1)}ms, ${resInversa.droppedFrames}/${resInversa.totalFrames} dropped (${resInversa.dropRate.toFixed(1)}%)`);
console.log('======================================================');

await browser.close();
server.close();
