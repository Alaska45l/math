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

await new Promise(r => server.listen(8165, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const VIEWS = [
  { name: '01_index', url: 'http://localhost:8165/index.html' },
  { name: '02_desigualdades', url: 'http://localhost:8165/desigualdades.html' },
  { name: '03_unidades', url: 'http://localhost:8165/unidades.html' },
  { name: '04_fn_scanner', url: 'http://localhost:8165/funciones.html#scanner' },
  { name: '05_fn_traductor', url: 'http://localhost:8165/funciones.html#traductor' },
  { name: '06_fn_secante', url: 'http://localhost:8165/funciones.html#secante' },
  { name: '07_fn_inversa', url: 'http://localhost:8165/funciones.html#inversa' },
  { name: '08_seq_postes', url: 'http://localhost:8165/sucesiones.html#postes' },
  { name: '09_seq_radar', url: 'http://localhost:8165/sucesiones.html#radar' },
  { name: '10_seq_traductor', url: 'http://localhost:8165/sucesiones.html#traductor' },
  { name: '11_seq_geometrica', url: 'http://localhost:8165/sucesiones.html#geometrica' },
  { name: '12_seq_radiografia', url: 'http://localhost:8165/sucesiones.html#radiografia' },
  { name: '13_seq_retos', url: 'http://localhost:8165/sucesiones.html#retos' }
];

console.log('=== SVG MINIMUM EFFECTIVE FONT SIZES (1200px viewport) ===');
const svgAudit = [];

for (const v of VIEWS) {
  await page.goto(v.url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const viewData = await page.evaluate((viewName) => {
    const svgs = document.querySelectorAll('svg');
    const items = [];
    svgs.forEach((svg, sIdx) => {
      const svgId = svg.id || `svg_${sIdx}`;
      const rect = svg.getBoundingClientRect();
      const vbWidth = svg.viewBox.baseVal.width || rect.width || 600;
      const scaleFactor = rect.width / vbWidth;

      const texts = Array.from(svg.querySelectorAll('text, tspan')).filter(t => t.textContent.trim().length > 0);
      if (texts.length === 0) return;

      let minEff = 999;
      let minItem = null;

      texts.forEach(t => {
        const style = window.getComputedStyle(t);
        const cssFs = parseFloat(style.fontSize);
        const effPx = cssFs * scaleFactor;
        if (effPx < minEff) {
          minEff = effPx;
          minItem = {
            tag: t.tagName.toLowerCase(),
            className: t.getAttribute('class') || '',
            text: t.textContent.trim().slice(0, 20),
            cssPx: cssFs.toFixed(1),
            effPx: effPx.toFixed(1),
            scaleFactor: scaleFactor.toFixed(3)
          };
        }
      });

      if (minItem) {
        items.push({
          view: viewName,
          svgId: svgId,
          svgWidth: Math.round(rect.width),
          vbWidth: Math.round(vbWidth),
          ...minItem
        });
      }
    });
    return items;
  }, v.name);

  svgAudit.push(...viewData);
}

for (const s of svgAudit) {
  console.log(`[${s.view}] SVG: #${s.svgId.padEnd(14)} | Min: <${s.tag} class="${s.className}"> "${s.text.padEnd(12)}" | CSS: ${s.cssPx}px | Eff: ${s.effPx}px (scale: ${s.scaleFactor})`);
}

// Collisions at 390px on secante view
console.log('\n=== COLLISION AUDIT ON SECANTE VIEW AT 390px ===');
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:8165/funciones.html#secante', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

const secanteCollisions = await page.evaluate(() => {
  const svg = document.querySelector('#sec-svg') || document.querySelector('svg');
  if (!svg) return 'No secante SVG found';
  
  const labels = Array.from(svg.querySelectorAll('text, tspan')).filter(t => t.textContent.trim().length > 0);
  const lines = Array.from(svg.querySelectorAll('line, path.plot-curve, path.sec-line, path'));
  
  const results = [];
  // Label-label collisions
  for (let i = 0; i < labels.length; i++) {
    const r1 = labels[i].getBoundingClientRect();
    for (let j = i + 1; j < labels.length; j++) {
      if (labels[i].contains(labels[j]) || labels[j].contains(labels[i])) continue;
      const r2 = labels[j].getBoundingClientRect();
      const ox = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
      const oy = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
      if (ox > 2 && oy > 2) {
        results.push({
          type: 'label-label',
          item1: labels[i].textContent.trim(),
          item2: labels[j].textContent.trim(),
          overlap: `${Math.round(ox)}x${Math.round(oy)}`,
          coords1: { x: Math.round(r1.left), y: Math.round(r1.top) },
          coords2: { x: Math.round(r2.left), y: Math.round(r2.top) }
        });
      }
    }
  }

  // Label-curve and label-line intersection check
  const p1 = labels.find(l => l.textContent.includes('P₁') || l.textContent.includes('P1'));
  const p2 = labels.find(l => l.textContent.includes('P₂') || l.textContent.includes('P2'));
  const dy = labels.find(l => l.textContent.includes('Δy') || l.textContent.includes('dy'));
  const targets = [{ name: 'P₁', el: p1 }, { name: 'P₂', el: p2 }, { name: 'Δy', el: dy }];

  targets.forEach(t => {
    if (t.el) {
      const r = t.el.getBoundingClientRect();
      results.push({
        type: 'target-label-position',
        label: t.name,
        text: t.el.textContent.trim(),
        box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
      });
    }
  });

  return results;
});

console.log(JSON.stringify(secanteCollisions, null, 2));

await browser.close();
server.close();
