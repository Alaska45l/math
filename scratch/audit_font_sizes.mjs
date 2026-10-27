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

const PORT = 8230;
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
  { id: '6_fn_radiografia', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-radiografia');
    await page.waitForSelector('#rad-quiz');
  }},
  { id: '8_fn_secante', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-secante');
    await page.waitForSelector('.fn-formula-box');
  }},
  { id: '9_fn_inversa', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-inversa');
    await page.waitForSelector('#inv-zero-m');
  }},
  { id: '10_seq_postes', url: `http://localhost:${PORT}/sucesiones.html`, setup: async (page) => {
    await page.click('#tab-postes');
    await page.waitForSelector('#seq-preset');
  }},
  { id: '12_seq_geometrica', url: `http://localhost:${PORT}/sucesiones.html`, setup: async (page) => {
    await page.click('#tab-geometrica');
    await page.waitForSelector('#panel-geometrica');
  }},
  { id: '13_seq_retos', url: `http://localhost:${PORT}/sucesiones.html`, setup: async (page) => {
    await page.click('#tab-retos');
    await page.waitForSelector('button[data-answer]');
  }}
];

const viewports = [
  { width: 1280, height: 800, name: '1280px' },
  { width: 1920, height: 1080, name: '1920px' },
  { width: 390, height: 844, name: '390px' }
];

console.log('=== AUDITORIA DE FONT SIZES (T1) ===');

for (const vp of viewports) {
  console.log(`\n================ Viewport: ${vp.name} ================`);
  const belowThreshold = [];

  for (const v of VIEWS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(v.url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await v.setup(page);
    await page.waitForTimeout(100);

    const issues = await page.evaluate((viewId) => {
      const results = [];
      const rootPx = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
      const isDesktop = window.innerWidth >= 820;

      // HTML text nodes
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          const p = node.parentElement;
          if (!p || p.closest('[hidden]') || p.closest('script, style') || p.closest('svg') || p.closest('.sr-only')) return NodeFilter.FILTER_REJECT;
          const cs = window.getComputedStyle(p);
          if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      const checkedParents = new Set();
      while (walker.nextNode()) {
        const el = walker.currentNode.parentElement;
        if (checkedParents.has(el)) continue;
        checkedParents.add(el);

        const cs = window.getComputedStyle(el);
        const font = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        const px = parseFloat(cs.fontSize);

        if (isDesktop) {
          const isCaveat = /caveat/i.test(font);
          const isKalam = /kalam/i.test(font);
          if (isCaveat || isKalam) {
            const thresholdPx = isCaveat ? (1.05 * rootPx) : (1.0 * rootPx);
            const tag = el.tagName.toLowerCase();
            if (px < thresholdPx - 0.2 && tag !== 'sub' && tag !== 'sup') {
              results.push({
                type: 'HTML',
                font,
                px: px.toFixed(1),
                thresholdPx: thresholdPx.toFixed(1),
                text: el.textContent.trim().slice(0, 24),
                selector: (el.tagName.toLowerCase() + (el.className ? `.${Array.from(el.classList).slice(0, 2).join('.')}` : '')).slice(0, 28)
              });
            }
          }
        }
      }

      // SVG text nodes
      document.querySelectorAll('svg text, svg tspan').forEach(t => {
        if (!t.textContent || !t.textContent.trim()) return;
        if (t.closest('[hidden]')) return;
        const cs = window.getComputedStyle(t);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const font = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        const basePx = parseFloat(cs.fontSize);
        let effPx = basePx;
        try {
          const ctm = t.getScreenCTM();
          if (ctm) effPx = basePx * ctm.a;
        } catch (_) {}

        if (isDesktop) {
          const isCaveat = /caveat/i.test(font);
          const thresholdPx = isCaveat ? 1.05 * rootPx : 1.0 * rootPx;
          if (effPx < thresholdPx - 0.2) {
            results.push({
              type: 'SVG',
              font,
              px: effPx.toFixed(1),
              thresholdPx: thresholdPx.toFixed(1),
              text: t.textContent.trim().slice(0, 20),
              selector: (t.tagName.toLowerCase() + (t.className ? `.${t.getAttribute('class')}` : '')).slice(0, 28)
            });
          }
        }
      });

      return results;
    }, v.id);

    if (issues.length > 0) {
      belowThreshold.push({ view: v.id, count: issues.length, sample: issues.slice(0, 4) });
    }
    await page.close();
  }

  console.log(`Total views with sub-threshold font sizes in ${vp.name}: ${belowThreshold.length}`);
  if (belowThreshold.length > 0) {
    belowThreshold.forEach(b => {
      console.log(`\n[${b.view}] (${b.count} text nodes below threshold):`);
      console.table(b.sample);
    });
  }
}

await browser.close();
server.close();
