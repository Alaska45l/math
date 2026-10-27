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

const PORT = 8197;
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
    await page.waitForTimeout(200);
  }},
  { id: '6_fn_radiografia_init', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-radiografia');
    await page.waitForSelector('#rad-quiz');
    await page.waitForTimeout(200);
  }},
  { id: '7_fn_radiografia_answered', url: `http://localhost:${PORT}/funciones.html`, setup: async (page) => {
    await page.click('#tab-radiografia');
    await page.waitForSelector('.fn-quiz-btn[data-ans="correct"]');
    await page.click('.fn-quiz-btn[data-ans="correct"]');
    await page.waitForTimeout(200);
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
    await page.waitForTimeout(300);
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
    await page.waitForTimeout(200);
  }}
];

console.log('=== AUDITORIA DE ICONOS Y SVGs (scratch/audit_icon_sizes.mjs) ===');

let totalFailures = 0;
let iconCountTotal = 0;
const allChecksList = [];

for (const width of [1280, 390]) {
  console.log(`
--- Viewport: ${width}px ---`);
  for (const v of VIEWS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(v.url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await v.setup(page);
    await page.waitForTimeout(150);

    const auditResults = await page.evaluate((viewId) => {
      const results = {
        viewId,
        icons: [],
        largeSvgs: [],
        errors: []
      };

      // 1. Audit every visible .chalk-icon (ignore hidden tabpanels)
      const chalkIcons = Array.from(document.querySelectorAll('.chalk-icon')).filter(icon => !icon.closest('[hidden]'));
      chalkIcons.forEach((icon, idx) => {
        const cs = window.getComputedStyle(icon);
        const r = icon.getBoundingClientRect();
        const color = cs.color;
        const info = {
          idx,
          tag: icon.tagName,
          className: icon.getAttribute('class') || '',
          display: cs.display,
          width: r.width,
          height: r.height,
          cssWidth: cs.width,
          cssHeight: cs.height,
          color,
          parent: icon.parentElement ? icon.parentElement.tagName.toLowerCase() : 'none',
          srOnly: icon.parentElement ? (icon.parentElement.querySelector('.sr-only')?.textContent || '') : '',
          ariaHidden: icon.getAttribute('aria-hidden')
        };
        results.icons.push(info);

        // Requirement a: 14 <= width <= 32 && 14 <= height <= 32 && display === 'inline-block'
        if (info.display !== 'inline-block') {
          results.errors.push(`[CHALK-ICON DISPLAY] icon #${idx} (${info.className}) has display: '${info.display}' (expected 'inline-block')`);
        }
        if (info.width < 14 || info.width > 32) {
          results.errors.push(`[CHALK-ICON WIDTH] icon #${idx} (${info.className}) has width ${info.width.toFixed(1)}px (expected 14-32px)`);
        }
        if (info.height < 14 || info.height > 32) {
          results.errors.push(`[CHALK-ICON HEIGHT] icon #${idx} (${info.className}) has height ${info.height.toFixed(1)}px (expected 14-32px)`);
        }

        // Requirement b: Computed semantic color
        if (icon.classList.contains('chalk-icon--check')) {
          if (color !== 'rgb(174, 209, 162)') {
            results.errors.push(`[CHALK-ICON COLOR] icon #${idx} (.chalk-icon--check) color is '${color}' (expected var(--green) rgb(174, 209, 162))`);
          }
        } else if (icon.classList.contains('chalk-icon--cross')) {
          if (color !== 'rgb(227, 161, 161)') {
            results.errors.push(`[CHALK-ICON COLOR] icon #${idx} (.chalk-icon--cross) color is '${color}' (expected var(--pink) rgb(227, 161, 161))`);
          }
        } else if (icon.classList.contains('chalk-icon--lock')) {
          if (color !== 'rgb(230, 211, 138)') {
            results.errors.push(`[CHALK-ICON COLOR] icon #${idx} (.chalk-icon--lock) color is '${color}' (expected var(--yellow) rgb(230, 211, 138))`);
          }
        }

        // Requirement c: Accessibility / sr-only text
        if (icon.classList.contains('chalk-icon--check')) {
          const parent = icon.parentElement;
          const srOnly = parent ? parent.querySelector('.sr-only') : null;
          const text = srOnly ? srOnly.textContent.trim().toLowerCase() : '';
          if (!text.includes('correcta')) {
            results.errors.push(`[CHALK-ICON A11Y] icon #${idx} (.chalk-icon--check) lacks adjacent .sr-only with 'correcta'`);
          }
        } else if (icon.classList.contains('chalk-icon--cross')) {
          const parent = icon.parentElement;
          const srOnly = parent ? parent.querySelector('.sr-only') : null;
          const text = srOnly ? srOnly.textContent.trim().toLowerCase() : '';
          if (!text.includes('incorrecta')) {
            results.errors.push(`[CHALK-ICON A11Y] icon #${idx} (.chalk-icon--cross) lacks adjacent .sr-only with 'incorrecta'`);
          }
        } else if (icon.classList.contains('chalk-icon--lock')) {
          if (icon.getAttribute('aria-hidden') !== 'true') {
            results.errors.push(`[CHALK-ICON A11Y] icon #${idx} (.chalk-icon--lock) is decorative and must be aria-hidden="true"`);
          }
        }
      });

      // 2. Audit all SVGs with width > 48px (ignore hidden tabpanels)
      const whitelistSelectors = ['.plot', '.seq-track', '.seq-chart', '#circuit', '#number-line'];
      const allSvgs = Array.from(document.querySelectorAll('svg')).filter(svg => !svg.closest('[hidden]'));
      allSvgs.forEach((svg, idx) => {
        const r = svg.getBoundingClientRect();
        if (r.width > 48) {
          const isWhitelisted = whitelistSelectors.some(sel => svg.matches(sel));
          if (!isWhitelisted) {
            const selector = svg.id ? `#${svg.id}` : (svg.className.baseVal ? `svg.${svg.className.baseVal.split(' ').join('.')}` : `svg:nth-of-type(${idx+1})`);
            results.largeSvgs.push({ selector, width: r.width, height: r.height });
            results.errors.push(`[SVG > 48px NON-WHITELISTED] selector '${selector}' width=${r.width.toFixed(1)}px > 48px not in whitelist`);
          }
        }
      });

      return results;
    }, v.id);

    iconCountTotal += auditResults.icons.length;

    for (const icon of auditResults.icons) {
      allChecksList.push({
        width,
        view: v.id,
        cls: icon.className.replace('chalk-icon', '').trim(),
        dims: `${icon.width.toFixed(1)}x${icon.height.toFixed(1)}px`,
        color: icon.color,
        a11y: icon.srOnly ? `sr-only: "${icon.srOnly}"` : (icon.ariaHidden ? `aria-hidden="${icon.ariaHidden}"` : 'none')
      });
    }

    if (auditResults.errors.length > 0) {
      console.log(`  FAIL [${v.id} @ ${width}px] (${auditResults.icons.length} chalk-icons found):`);
      auditResults.errors.forEach(e => console.log(`    ❌ ${e}`));
      totalFailures += auditResults.errors.length;
    } else {
      console.log(`  PASS [${v.id} @ ${width}px] (${auditResults.icons.length} chalk-icons: all ${auditResults.icons.map(i => i.width.toFixed(0)+'x'+i.height.toFixed(0)).join(', ') || 'none'})`);
    }

    await page.close();
  }
}

console.log(`
==========================================`);
console.log(`DESGLOSE DETALLADO DE LAS ${allChecksList.length} COMPROBACIONES DE ICONOS:`);
console.log(`------------------------------------------`);
allChecksList.forEach((c, i) => {
  console.log(`Check #${(i + 1).toString().padStart(2, '0')}: [${c.width}px - ${c.view}] icon: .${c.cls} | dims: ${c.dims} | color: ${c.color} | ${c.a11y} -> PASS ✅`);
});
console.log(`------------------------------------------`);
console.log(`Total chalk-icon checks across 13 views: ${iconCountTotal}`);
console.log(`Total failures: ${totalFailures}`);
console.log(`Status: ${totalFailures === 0 ? 'ALL CHECKS PASSED ✅' : 'FAILED ❌'}`);
console.log(`==========================================`);

await browser.close();
server.close();

process.exit(totalFailures === 0 ? 0 : 1);
