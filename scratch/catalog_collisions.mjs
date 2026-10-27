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

await new Promise(r => server.listen(0, r));
const PORT = server.address().port;

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });

// 13 Views Definition
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
    await page.waitForSelector('#seq-track');
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

console.log('=== SVG COLLISION CATALOG AUDIT (2560px, 1920px, 1280px, 390px) ===');

const allCollisions = [];

for (const width of [2560, 1920, 1280, 390]) {
  console.log(`\n--- Viewport: ${width}px ---`);
  for (const v of VIEWS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(v.url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await v.setup(page);
    await page.waitForTimeout(250);

    const viewCollisions = await page.evaluate((viewId) => {
      const collisions = [];
      const svgs = Array.from(document.querySelectorAll('svg')).filter(s => {
        if (s.closest('[hidden]')) return false;
        const r = s.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });

      svgs.forEach((svg, svgIdx) => {
        const svgId = svg.id || `svg_${svgIdx}`;
        // Get all visible text elements
        const texts = Array.from(svg.querySelectorAll('text, tspan')).filter(t => {
          const r = t.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && t.textContent.trim().length > 0;
        });

        // 1. Label - Label collisions
        for (let i = 0; i < texts.length; i++) {
          const t1 = texts[i];
          const r1 = t1.getBoundingClientRect();
          for (let j = i + 1; j < texts.length; j++) {
            const t2 = texts[j];
            if (t1.contains(t2) || t2.contains(t1)) continue;
            const r2 = t2.getBoundingClientRect();
            const ox = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
            const oy = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
            // Require substantial overlap (>4px)
            if (ox > 4 && oy > 4) {
              collisions.push({
                type: 'label-label',
                svgId,
                target1: t1.textContent.trim().slice(0, 20),
                target2: t2.textContent.trim().slice(0, 20),
                ox: Math.round(ox),
                oy: Math.round(oy)
              });
            }
          }
        }

        // 2. Label - Path / Line / Circle collisions
        // Ignore grid lines (class plot-grid), guide lines (fn-guide), handles and elements inside defs
        const strokes = Array.from(svg.querySelectorAll('path, line, circle, ellipse')).filter(el => {
          if (el.closest('defs')) return false;
          if (el.classList.contains('plot-grid')) return false;
          if (el.classList.contains('fn-handle')) return false; // invisible hit-area
          if (el.classList.contains('fn-guide')) return false;  // intentional guide stroke to label
          const cs = window.getComputedStyle(el);
          return cs.display !== 'none' && cs.visibility !== 'hidden' && (cs.stroke !== 'none' || cs.fill !== 'none');
        });

        texts.forEach(t => {
          // EXCEPTION: A tick with halo (.plot-tick with paint-order: stroke) crossed by a curve or line is NOT a collision.
          // Standard in analysis textbooks: the card-colored stroke buffer keeps the number legible even when intersected.
          const isTickWithHalo = t.classList.contains('plot-tick') && window.getComputedStyle(t).paintOrder.includes('stroke');
          if (isTickWithHalo) return;

          const r = t.getBoundingClientRect();
          // Shrink bbox slightly by 2px margin to ignore tangential touching
          const innerR = {
            left: r.left + 2,
            right: r.right - 2,
            top: r.top + 2,
            bottom: r.bottom - 2
          };
          if (innerR.left >= innerR.right || innerR.top >= innerR.bottom) return;

          strokes.forEach(strokeEl => {
            // Check if stroke element intersects innerR
            // For path: sample points every 4px using getPointAtLength
            if (strokeEl.tagName.toLowerCase() === 'path' && typeof strokeEl.getTotalLength === 'function') {
              try {
                const totalLen = strokeEl.getTotalLength();
                if (totalLen > 0 && totalLen < 5000) {
                  const step = 4;
                  const ctm = strokeEl.getScreenCTM();
                  if (!ctm) return;
                  for (let l = 0; l <= totalLen; l += step) {
                    const pt = strokeEl.getPointAtLength(l);
                    const screenX = pt.x * ctm.a + pt.y * ctm.c + ctm.e;
                    const screenY = pt.x * ctm.b + pt.y * ctm.d + ctm.f;
                    if (screenX >= innerR.left && screenX <= innerR.right && screenY >= innerR.top && screenY <= innerR.bottom) {
                      collisions.push({
                        type: 'label-path',
                        svgId,
                        label: t.textContent.trim().slice(0, 20),
                        strokeClass: strokeEl.className.baseVal || strokeEl.tagName,
                        pt: { x: Math.round(screenX), y: Math.round(screenY) }
                      });
                      break; // report once per label-stroke pair
                    }
                  }
                }
              } catch (_) {}
            } else if (strokeEl.tagName.toLowerCase() === 'line') {
              // Line interpolation
              const ctm = strokeEl.getScreenCTM();
              if (ctm) {
                const x1 = strokeEl.x1.baseVal.value, y1 = strokeEl.y1.baseVal.value;
                const x2 = strokeEl.x2.baseVal.value, y2 = strokeEl.y2.baseVal.value;
                const sx1 = x1 * ctm.a + y1 * ctm.c + ctm.e;
                const sy1 = x1 * ctm.b + y1 * ctm.d + ctm.f;
                const sx2 = x2 * ctm.a + y2 * ctm.c + ctm.e;
                const sy2 = x2 * ctm.b + y2 * ctm.d + ctm.f;
                const len = Math.hypot(sx2 - sx1, sy2 - sy1);
                if (len > 0) {
                  const steps = Math.ceil(len / 4);
                  for (let s = 0; s <= steps; s++) {
                    const px = sx1 + (sx2 - sx1) * (s / steps);
                    const py = sy1 + (sy2 - sy1) * (s / steps);
                    if (px >= innerR.left && px <= innerR.right && py >= innerR.top && py <= innerR.bottom) {
                      // If it is the axis line and the label is the tick for that line, ignore tangential tick line
                      if (strokeEl.classList.contains('plot-axis') && t.classList.contains('plot-tick')) {
                        continue;
                      }
                      collisions.push({
                        type: 'label-line',
                        svgId,
                        label: t.textContent.trim().slice(0, 20),
                        strokeClass: strokeEl.className.baseVal || strokeEl.tagName,
                        pt: { x: Math.round(px), y: Math.round(py) }
                      });
                      break;
                    }
                  }
                }
              }
            }
          });
        });
      });
      return collisions;
    }, v.id);

    if (viewCollisions.length > 0) {
      console.log(`  [${v.id} @ ${width}px] ${viewCollisions.length} collisions:`);
      viewCollisions.forEach(c => {
        if (c.type === 'label-label') console.log(`    Label-Label: "${c.target1}" vs "${c.target2}" in ${c.svgId}`);
        else console.log(`    ${c.type}: "${c.label}" vs .${c.strokeClass} in ${c.svgId}`);
      });
      allCollisions.push({ width, view: v.id, collisions: viewCollisions });
    } else {
      console.log(`  [${v.id} @ ${width}px] 0 collisions PASS`);
    }
    await page.close();
  }
}

console.log(`\nTotal collision instances found across 13 views: ${allCollisions.length}`);
await browser.close();
server.close();
