import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const PORT = 8128;
const BASE_DIR = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0].split('#')[0]);
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(BASE_DIR, reqPath);
      
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      });
    });
    server.listen(PORT, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

const VIEWS = [
  {
    id: 'index',
    name: '1. Inicio (index.html)',
    url: '/index.html',
    setup: async (page) => {}
  },
  {
    id: 'desigualdades',
    name: '2. Desigualdades compuestas (circuito)',
    url: '/desigualdades.html',
    setup: async (page) => {}
  },
  {
    id: 'unidades_cm3',
    name: '3. Conversor de unidades (cm³)',
    url: '/unidades.html',
    setup: async (page) => {
      await page.selectOption('#problem', '3');
      await page.waitForTimeout(100);
    }
  },
  {
    id: 'funciones_scanner_normal',
    name: '4. Funciones: Escáner (caso 1)',
    url: '/funciones.html',
    setup: async (page) => {
      await page.click('#tab-scanner');
      await page.waitForSelector('#sc-case');
    }
  },
  {
    id: 'funciones_scanner_colision',
    name: '5. Funciones: Escáner colisión (No es función)',
    url: '/funciones.html',
    setup: async (page) => {
      await page.click('#tab-scanner');
      await page.waitForSelector('#sc-case');
      await page.selectOption('#sc-case', '2'); // Círculo
      await page.fill('#sc-x', '2');
      await page.dispatchEvent('#sc-x', 'input');
      await page.waitForTimeout(100);
    }
  },
  {
    id: 'funciones_radiografia_init',
    name: '6. Funciones: Radiografía (inicial)',
    url: '/funciones.html',
    setup: async (page) => {
      await page.click('#tab-radiografia');
      await page.waitForSelector('#rad-quiz');
    }
  },
  {
    id: 'funciones_radiografia_answered',
    name: '7. Funciones: Radiografía quiz respondido',
    url: '/funciones.html',
    setup: async (page) => {
      await page.click('#tab-radiografia');
      await page.waitForSelector('.fn-quiz-btn[data-ans="correct"]');
      await page.click('.fn-quiz-btn[data-ans="correct"]');
      await page.waitForTimeout(100);
    }
  },
  {
    id: 'funciones_secante',
    name: '8. Funciones: Secante y TCP (2 filas)',
    url: '/funciones.html',
    setup: async (page) => {
      await page.click('#tab-secante');
      await page.waitForSelector('.fn-formula-box');
    }
  },
  {
    id: 'funciones_inversa',
    name: '9. Funciones: Inversa trampa m = 0',
    url: '/funciones.html',
    setup: async (page) => {
      await page.click('#tab-inversa');
      await page.waitForSelector('#inv-zero-m');
      await page.click('#inv-zero-m');
      await page.waitForTimeout(100);
    }
  },
  {
    id: 'sucesiones_postes',
    name: '10. Sucesiones: Postes en riel',
    url: '/sucesiones.html',
    setup: async (page) => {
      await page.click('#tab-postes');
      await page.waitForSelector('#seq-track');
    }
  },
  {
    id: 'sucesiones_traductor',
    name: '11. Sucesiones: Traductor',
    url: '/sucesiones.html',
    setup: async (page) => {
      await page.click('#tab-traductor');
      await page.waitForSelector('#panel-traductor');
    }
  },
  {
    id: 'sucesiones_geom',
    name: '12. Sucesiones: Radar geométrica',
    url: '/sucesiones.html',
    setup: async (page) => {
      await page.click('#tab-geometrica');
      await page.waitForSelector('#panel-geometrica');
    }
  },
  {
    id: 'sucesiones_retos',
    name: '13. Sucesiones: Retos con respuesta',
    url: '/sucesiones.html',
    setup: async (page) => {
      await page.click('#tab-retos');
      await page.waitForSelector('button[data-answer]');
      await page.click('button[data-answer]');
      await page.waitForTimeout(100);
    }
  }
];

async function main() {
  const server = await startServer();
  console.log(`HTTP Server active on port ${PORT}`);

  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  const totalFontCounts = {};
  const allFontViolations = [];
  const overflowResults = [];
  const svgFontResults = [];

  console.log('\n--- AUDITING 13 VIEWS AT 390px ---');

  for (const v of VIEWS) {
    await page.goto(`http://127.0.0.1:${PORT}${v.url}`, { waitUntil: 'networkidle' });
    await v.setup(page);
    await page.waitForTimeout(200);

    // 1. Check overflow
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(root.scrollWidth, body.scrollWidth);
      const clientWidth = root.clientWidth;
      const hasOverflow = scrollWidth > clientWidth;
      let widest = [];
      if (hasOverflow) {
        const all = Array.from(document.querySelectorAll('*'));
        widest = all
          .map((el) => {
            const rect = el.getBoundingClientRect();
            return {
              tag: el.tagName.toLowerCase(),
              id: el.id,
              cls: typeof el.className === 'string' ? el.className.split(' ').filter(Boolean).join('.') : '',
              scrollWidth: el.scrollWidth,
              rectRight: Math.round(rect.right),
              rectWidth: Math.round(rect.width)
            };
          })
          .filter((x) => x.rectRight > clientWidth || x.scrollWidth > clientWidth)
          .sort((a, b) => b.rectRight - a.rectRight)
          .slice(0, 5);
      }
      return { scrollWidth, clientWidth, hasOverflow, widest };
    });

    overflowResults.push({ view: v.name, ...overflow });

    // 2. Audit font families on visible text elements
    const fontAudit = await page.evaluate(() => {
      const counts = {};
      const violations = [];
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
        
        let hasText = false;
        const tag = el.tagName.toLowerCase();
        if (tag === 'text' || tag === 'tspan') {
          hasText = (el.textContent || '').trim().length > 0;
        } else {
          for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
              hasText = true;
              break;
            }
          }
        }

        if (hasText) {
          const fullFamily = style.fontFamily;
          const firstFamily = fullFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
          counts[firstFamily] = (counts[firstFamily] || 0) + 1;

          const lower = firstFamily.toLowerCase();
          if (
            lower.startsWith('system-ui') ||
            lower.startsWith('sans-serif') ||
            lower.startsWith('serif') ||
            lower.startsWith('monospace')
          ) {
            violations.push({
              tag,
              cls: el.className,
              text: (el.textContent || '').trim().slice(0, 30),
              family: firstFamily,
              fullFamily
            });
          }
        }
      }
      return { counts, violations };
    });

    for (const [fam, count] of Object.entries(fontAudit.counts)) {
      totalFontCounts[fam] = (totalFontCounts[fam] || 0) + count;
    }
    if (fontAudit.violations.length > 0) {
      allFontViolations.push({ view: v.name, violations: fontAudit.violations });
    }

    // 3. Audit SVG effective font sizes
    const svgAudit = await page.evaluate(() => {
      const items = [];
      const texts = document.querySelectorAll('svg text, svg tspan');
      for (const el of texts) {
        const text = (el.textContent || '').trim();
        if (!text) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        const fontSize = parseFloat(style.fontSize);
        let scale = 1;
        try {
          const ctm = el.getScreenCTM();
          if (ctm) scale = ctm.a;
        } catch (e) {}

        const effective = fontSize * scale;
        items.push({
          text: text.slice(0, 25),
          fontSize,
          scale: Math.round(scale * 1000) / 1000,
          effective: Math.round(effective * 10) / 10,
          isSmall: effective < 10.9
        });
      }
      const minEffective = items.length > 0 ? Math.min(...items.map((i) => i.effective)) : null;
      const smalls = items.filter((i) => i.isSmall);
      return { total: items.length, minEffective, smalls };
    });

    svgFontResults.push({ view: v.name, ...svgAudit });

    console.log(`✓ ${v.name}: scrollW=${overflow.scrollWidth}px (clientW=${overflow.clientWidth}px), SVG texts=${svgAudit.total}, minSVGFont=${svgAudit.minEffective !== null ? svgAudit.minEffective + 'px' : 'N/A'}`);
  }

  console.log('\n--- FONT FAMILY AUDIT TOTALS ---');
  console.table(totalFontCounts);

  if (allFontViolations.length > 0) {
    console.error('❌ FONT VIOLATIONS FOUND:');
    console.dir(allFontViolations, { depth: 5 });
  } else {
    console.log('✅ ZERO visible text elements start with system-ui, sans-serif, serif, or monospace!');
  }

  console.log('\n--- OVERFLOW CHECK RESULTS ---');
  let anyOverflow = false;
  for (const o of overflowResults) {
    if (o.hasOverflow) {
      anyOverflow = true;
      console.warn(`⚠️ OVERFLOW in ${o.view}: scrollWidth=${o.scrollWidth} > clientWidth=${o.clientWidth}`);
      console.table(o.widest);
    }
  }
  if (!anyOverflow) {
    console.log('✅ ZERO horizontal overflow at 390px across all 13 views!');
  }

  console.log('\n--- SVG EFFECTIVE FONT SIZE RESULTS ---');
  let anySvgTooSmall = false;
  for (const s of svgFontResults) {
    if (s.smalls.length > 0) {
      anySvgTooSmall = true;
      console.warn(`⚠️ SVG font < 11px in ${s.view} (min = ${s.minEffective}px):`);
      console.table(s.smalls);
    }
  }
  if (!anySvgTooSmall) {
    console.log('✅ ALL visible SVG text has effective font size >= 11px across all 13 views!');
  }

  // --- SPECIAL SCREENSHOTS ---
  console.log('\n--- CAPTURING SPECIAL SCREENSHOTS ---');

  // A. .dim-legend crop at deviceScaleFactor: 3
  const dpr3Context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3
  });
  const pageDpr3 = await dpr3Context.newPage();
  await pageDpr3.goto(`http://127.0.0.1:${PORT}/unidades.html`, { waitUntil: 'networkidle' });
  const legend = pageDpr3.locator('.dim-legend');
  await legend.screenshot({ path: 'screenshots/fase2/legend_pin_socket_dpr3.png' });
  console.log('Saved screenshots/fase2/legend_pin_socket_dpr3.png');
  await dpr3Context.close();

  // B. Riel with temporary red outline on eraser patch
  await page.goto(`http://127.0.0.1:${PORT}/sucesiones.html`, { waitUntil: 'networkidle' });
  await page.click('#tab-postes');
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    const el = document.querySelector('.seq-track');
    if (el) el.style.outline = '3px dashed #f87171';
  });
  const track = page.locator('.seq-track');
  await track.screenshot({ path: 'screenshots/fase2/riel_eraser_patch_red_outline.png' });
  console.log('Saved screenshots/fase2/riel_eraser_patch_red_outline.png');
  await page.evaluate(() => {
    const el = document.querySelector('.seq-track');
    if (el) el.style.outline = '';
  });

  // C. Brand comparison: var(--font-math) vs var(--font-hand)
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });
  
  // Version Math
  await page.evaluate(() => {
    const brand = document.querySelector('.site-nav__brand');
    if (brand) brand.style.fontFamily = 'var(--font-math)';
  });
  await page.locator('.site-nav').screenshot({ path: 'screenshots/fase2/brand_font_math.png' });
  console.log('Saved screenshots/fase2/brand_font_math.png');

  // Version Hand
  await page.evaluate(() => {
    const brand = document.querySelector('.site-nav__brand');
    if (brand) brand.style.fontFamily = 'var(--font-hand)';
  });
  await page.locator('.site-nav').screenshot({ path: 'screenshots/fase2/brand_font_hand.png' });
  console.log('Saved screenshots/fase2/brand_font_hand.png');

  // D. Views for Montages (12 views)
  console.log('\n--- CAPTURING VIEWS FOR MONTAGES ---');
  
  // Montage 1: postes + radar + circuito + unidades(cm³)
  await page.goto(`http://127.0.0.1:${PORT}/sucesiones.html`, { waitUntil: 'networkidle' });
  await page.click('#tab-postes');
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/fase2/v_postes.png' });

  await page.click('#tab-geometrica');
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/fase2/v_radar.png' });

  await page.goto(`http://127.0.0.1:${PORT}/desigualdades.html`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/fase2/v_circuito.png' });

  await page.goto(`http://127.0.0.1:${PORT}/unidades.html`, { waitUntil: 'networkidle' });
  await page.selectOption('#problem', '3');
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/fase2/v_unidades.png' });

  // Montage 2: retos + traductor + inversa + radiografía
  await page.goto(`http://127.0.0.1:${PORT}/sucesiones.html`, { waitUntil: 'networkidle' });
  await page.click('#tab-retos');
  await page.waitForTimeout(100);
  await page.waitForSelector('button[data-answer]');
  await page.click('button[data-answer]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/fase2/v_retos.png' });

  await page.click('#tab-traductor');
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/fase2/v_traductor.png' });

  await page.goto(`http://127.0.0.1:${PORT}/funciones.html`, { waitUntil: 'networkidle' });
  await page.click('#tab-inversa');
  await page.waitForTimeout(100);
  await page.click('#inv-zero-m');
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/fase2/v_inversa.png' });

  await page.click('#tab-radiografia');
  await page.waitForTimeout(100);
  await page.click('.fn-quiz-btn[data-ans="correct"]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/fase2/v_radiografia.png' });

  // Montage 3: index + funciones scanner + secante + desigualdades
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/fase2/v_index.png' });

  await page.goto(`http://127.0.0.1:${PORT}/funciones.html`, { waitUntil: 'networkidle' });
  await page.click('#tab-scanner');
  await page.waitForTimeout(100);
  await page.selectOption('#sc-case', '2');
  await page.fill('#sc-x', '2');
  await page.dispatchEvent('#sc-x', 'input');
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/fase2/v_scanner.png' });

  await page.click('#tab-secante');
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/fase2/v_secante.png' });

  await page.goto(`http://127.0.0.1:${PORT}/desigualdades.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'screenshots/fase2/v_desigualdades.png' });

  console.log('All montage view screenshots captured!');

  await browser.close();
  server.close();
  console.log('\nAudit complete! Server closed.');
}

main().catch(console.error);
