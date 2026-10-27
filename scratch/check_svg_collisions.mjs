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

await new Promise(r => server.listen(8159, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const VIEWS = [
  'http://localhost:8159/unidades.html',
  'http://localhost:8159/funciones.html#scanner',
  'http://localhost:8159/funciones.html#traductor',
  'http://localhost:8159/funciones.html#secante',
  'http://localhost:8159/funciones.html#inversa',
  'http://localhost:8159/sucesiones.html#postes',
  'http://localhost:8159/sucesiones.html#radar',
  'http://localhost:8159/sucesiones.html#geometrica'
];

console.log('=== SVG LABEL COLLISION AUDIT ===');
for (const u of VIEWS) {
  await page.goto(u, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const collisions = await page.evaluate(() => {
    const svgs = document.querySelectorAll('svg');
    const results = [];
    svgs.forEach((svg, svgIdx) => {
      const texts = Array.from(svg.querySelectorAll('text, tspan')).filter(t => {
        const r = t.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && t.textContent.trim().length > 0;
      });

      for (let i = 0; i < texts.length; i++) {
        const r1 = texts[i].getBoundingClientRect();
        for (let j = i + 1; j < texts.length; j++) {
          // If tspan is child of text, ignore parent-child overlap
          if (texts[i].contains(texts[j]) || texts[j].contains(texts[i])) continue;
          const r2 = texts[j].getBoundingClientRect();
          // Check AABB intersection with a tiny tolerance (-2px)
          const overlapX = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
          const overlapY = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
          if (overlapX > 3 && overlapY > 3) {
            results.push({
              svgId: svg.id || `svg_${svgIdx}`,
              t1: texts[i].textContent.trim().slice(0, 15),
              t2: texts[j].textContent.trim().slice(0, 15),
              overlapX: Math.round(overlapX),
              overlapY: Math.round(overlapY)
            });
          }
        }
      }
    });
    return results;
  });

  const viewName = u.split('/').pop();
  if (collisions.length > 0) {
    console.log(`[${viewName}] Collisions detected:`, collisions);
  } else {
    console.log(`[${viewName}] 0 collisions`);
  }
}

await browser.close();
server.close();
