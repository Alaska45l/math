import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const fp = path.join(process.cwd(), p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
    const ext = path.extname(fp);
    const ct = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : ext === '.js' ? 'application/javascript' : ext === '.woff2' ? 'font/woff2' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct });
    fs.createReadStream(fp).pipe(res);
  } else { res.writeHead(404); res.end(); }
});
server.listen(8145, async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  for (const w of [390, 360]) {
    const page = await browser.newPage({ viewport: { width: w, height: 844 } });
    await page.goto('http://127.0.0.1:8145/funciones.html');
    await page.click('#tab-secante');
    await page.waitForTimeout(100);
    const measurements = await page.evaluate(() => {
      const box = document.querySelector('.fn-formula-box');
      const rows = document.querySelectorAll('.fn-formula-box .tcp-row');
      return {
        box: { scrollWidth: box.scrollWidth, clientWidth: box.clientWidth },
        rows: Array.from(rows).map((r, i) => ({
          row: i + 1,
          scrollWidth: r.scrollWidth,
          clientWidth: r.clientWidth,
          text: r.textContent.replace(/\s+/g, ' ').trim()
        }))
      };
    });
    console.log(`Viewport ${w}px:`, JSON.stringify(measurements, null, 2));
    await page.close();
  }
  await browser.close();
  server.close();
});
