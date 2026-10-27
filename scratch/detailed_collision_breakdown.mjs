import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/home/alaska45l/Projects/Math/node_modules/playwright/index.mjs';

const serveDir = process.argv[2] || '/tmp/math_697f931';
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(serveDir, reqPath);
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

const PORT = 8207;
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });

const VIEWS = [
  { id: '1_index', url: `http://localhost:${PORT}/index.html`, setup: async () => {} },
  { id: '2_desigualdades', url: `http://localhost:${PORT}/desigualdades.html`, setup: async () => {} },
  { id: '3_unidades', url: `http://localhost:${PORT}/unidades.html`, setup: async (page) => {
    await page.selectOption('#problem', '3');
  }},
  { id: '4_fn_scanner', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-scanner');
    await page.waitForSelector('#sc-case');
  }},
  { id: '5_fn_scanner_colision', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-scanner');
    await page.waitForSelector('#sc-case');
    await page.selectOption('#sc-case', '2');
    await page.fill('#sc-x', '2');
    await page.dispatchEvent('#sc-x', 'input');
  }},
  { id: '6_fn_radiografia_init', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-radiografia');
    await page.waitForSelector('#rad-quiz');
  }},
  { id: '7_fn_radiografia_answered', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-radiografia');
    await page.waitForSelector('.fn-quiz-btn[data-ans="correct"]');
    await page.click('.fn-quiz-btn[data-ans="correct"]');
  }},
  { id: '8_fn_secante', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-secante');
    await page.waitForSelector('.fn-formula-box');
  }},
  { id: '9_fn_inversa', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-inversa');
    await page.waitForSelector('#inv-zero-m');
    await page.click('#inv-zero-m');
  }},
  { id: '10_seq_postes', url: `http://localhost:${PORT}/sucesiones.html`, setup: async (page) => {
    await page.click('#tab-postes');
    await page.waitForSelector('#seq-preset');
    await page.selectOption('#seq-preset', 'woo');
    await page.dispatchEvent('#seq-preset', 'change');
  }},
  { id: '11_seq_traductor', url: `http://localhost:${PORT}/sucesiones.html`, setup: async (page) => {
    await page.click('#tab-traductor');
    await page.waitForSelector('#panel-traductor');
  }},
  { id: '12_seq_geometrica', url: `http://localhost:${PORT}/sucesiones.html`, setup: async (page) => {
    await page.click('#tab-geometrica');
    await page.waitForSelector('#panel-geometrica');
  }},
  { id: '13_seq_retos', url: `http://localhost:${PORT}/sucesiones.html`, setup: async (page) => {
    await page.click('#tab-retos');
    await page.waitForSelector('button[data-answer]');
    await page.click('button[data-answer]');
  }}
];

const reportRows = [];

for (const width of [1280, 390]) {
  for (const v of VIEWS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(v.url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await v.setup(page);
    await page.waitForTimeout(200);

    const counts = await page.evaluate((viewId) => {
      let ll = 0, lp = 0, ln = 0;
      const svgs = Array.from(document.querySelectorAll('svg')).filter(s => !s.closest('[hidden]'));
      
      svgs.forEach((svg) => {
        const texts = Array.from(svg.querySelectorAll('text, tspan')).filter(t => t.textContent.trim().length > 0);
        const rects = texts.map(t => ({ el: t, r: t.getBoundingClientRect() }));

        // Label-Label
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            const r1 = rects[i].r, r2 = rects[j].r;
            if (r1.width === 0 || r2.width === 0) continue;
            const ox = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
            const oy = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
            if (ox > 1 && oy > 1) ll++;
          }
        }

        // Strokes
        const strokeEls = Array.from(svg.querySelectorAll('path, line')).filter(p => !p.closest('defs') && !p.classList.contains('wipe-streak') && !p.classList.contains('ghost-path') && !p.classList.contains('ghost-draw'));
        rects.forEach(({ el: t, r }) => {
          if (r.width === 0) return;
          const innerR = { left: r.left + 2, right: r.right - 2, top: r.top + 2, bottom: r.bottom - 2 };
          strokeEls.forEach(strokeEl => {
            if (strokeEl.tagName.toLowerCase() === 'path') {
              try {
                const len = strokeEl.getTotalLength();
                if (len > 0) {
                  const steps = Math.ceil(len / 4);
                  const ctm = strokeEl.getScreenCTM();
                  if (ctm) {
                    for (let s = 0; s <= steps; s++) {
                      const pt = strokeEl.getPointAtLength((s / steps) * len);
                      const sx = pt.x * ctm.a + pt.y * ctm.c + ctm.e;
                      const sy = pt.x * ctm.b + pt.y * ctm.d + ctm.f;
                      if (sx >= innerR.left && sx <= innerR.right && sy >= innerR.top && sy <= innerR.bottom) {
                        lp++;
                        break;
                      }
                    }
                  }
                }
              } catch (_) {}
            } else if (strokeEl.tagName.toLowerCase() === 'line') {
              const ctm = strokeEl.getScreenCTM();
              if (ctm) {
                const x1 = strokeEl.x1.baseVal.value, y1 = strokeEl.y1.baseVal.value;
                const x2 = strokeEl.x2.baseVal.value, y2 = strokeEl.y2.baseVal.value;
                const sx1 = x1 * ctm.a + y1 * ctm.c + ctm.e, sy1 = x1 * ctm.b + y1 * ctm.d + ctm.f;
                const sx2 = x2 * ctm.a + y2 * ctm.c + ctm.e, sy2 = x2 * ctm.b + y2 * ctm.d + ctm.f;
                const len = Math.hypot(sx2 - sx1, sy2 - sy1);
                if (len > 0) {
                  const steps = Math.ceil(len / 4);
                  for (let s = 0; s <= steps; s++) {
                    const px = sx1 + (sx2 - sx1) * (s / steps);
                    const py = sy1 + (sy2 - sy1) * (s / steps);
                    if (px >= innerR.left && px <= innerR.right && py >= innerR.top && py <= innerR.bottom) {
                      if (!(strokeEl.classList.contains('plot-axis') && t.classList.contains('plot-tick'))) {
                        ln++;
                        break;
                      }
                    }
                  }
                }
              }
            }
          });
        });
      });
      return { ll, lp, ln, total: ll + lp + ln };
    }, v.id);

    reportRows.push({ width, view: v.id, ...counts });
    await page.close();
  }
}

console.log(`=== DETAILED COLLISION CATALOG FOR ${serveDir} ===`);
console.table(reportRows);
const failedRuns = reportRows.filter(r => r.total > 0);
console.log(`Total view-viewport test runs failing (>0 collisions): ${failedRuns.length} / ${reportRows.length}`);
console.log(`Total elemental collisions detected across all runs: ${reportRows.reduce((acc, r) => acc + r.total, 0)}`);

await browser.close();
server.close();
