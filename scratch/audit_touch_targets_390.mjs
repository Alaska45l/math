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

await new Promise(r => server.listen(0, r));
const PORT = server.address().port;

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

console.log('=== AUDITORIA DE TOUCH TARGETS (>= 44x44px) EN MOBILE 390px ===');

const allSmallElements = [];

for (const v of VIEWS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto(v.url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await v.setup(page);
  await page.waitForTimeout(200);

  const smalls = await page.evaluate((viewId) => {
    const interactives = Array.from(document.querySelectorAll(
      'button, select, input, a, [role="button"], [role="tab"], .tab, .fn-quiz-btn, .fn-reveal'
    )).filter(el => {
      if (el.closest('[hidden]')) return false;
      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
      return true;
    });

    const res = [];
    interactives.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      // If parent label expands touch target, check parent
      let effectiveW = r.width;
      let effectiveH = r.height;
      if (el.tagName.toLowerCase() === 'input' && el.parentElement && el.parentElement.tagName.toLowerCase() === 'label') {
        const pr = el.parentElement.getBoundingClientRect();
        effectiveW = Math.max(effectiveW, pr.width);
        effectiveH = Math.max(effectiveH, pr.height);
      }
      
      const isTooSmall = effectiveW < 44 || effectiveH < 44;
      if (isTooSmall) {
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className ? `.${Array.from(el.classList).join('.')}` : '';
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent || el.value || '').trim().slice(0, 20);
        res.push({
          view: viewId,
          tag,
          selector: `${tag}${id}${cls}`,
          text,
          w: r.width,
          h: r.height,
          effW: effectiveW,
          effH: effectiveH
        });
      }
    });
    return res;
  }, v.id);

  allSmallElements.push(...smalls);
  console.log(`[${v.id}] found ${smalls.length} interactives below 44x44px`);
  await page.close();
}

console.log(`\n==========================================`);
console.log(`TOTAL INTERACTIVOS < 44px: ${allSmallElements.length}`);
if (allSmallElements.length > 0) {
  console.table(allSmallElements.map(e => ({
    view: e.view,
    selector: e.selector.slice(0, 30),
    text: e.text,
    width: e.w.toFixed(1),
    height: e.h.toFixed(1),
    effH: e.effH.toFixed(1)
  })));
}
console.log(`==========================================`);

await browser.close();
server.close();
