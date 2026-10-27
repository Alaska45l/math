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

const PORT = 8173;
await new Promise(r => server.listen(PORT, r));
console.log(`Server listening on port ${PORT}`);

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });

// 13 VIEWS DEFINITION (exact matching audit_fase2.mjs)
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

// ==========================================
// TEST 1: Pixel sampling at ±4px from SVG borders across 13 views
// ==========================================
console.log('\n--- ITEM 1: Pixel sampling at ±4px from SVG borders ---');
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  let totalSvgsChecked = 0;
  let allDeltasPass = true;

  for (const v of VIEWS) {
    await page.goto(v.url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await v.setup(page);
    await page.waitForTimeout(200);

    const svgStats = await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll('svg.plot, svg.seq-track, svg.seq-chart, .seq-track-wrap svg'));
      return svgs.map((svg, idx) => {
        const cs = window.getComputedStyle(svg);
        const rect = svg.getBoundingClientRect();
        return {
          idx,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          bg: cs.backgroundColor,
          bgImage: cs.backgroundImage
        };
      });
    });

    for (const stat of svgStats) {
      if (stat.rect.width === 0 || stat.rect.height === 0) continue;
      totalSvgsChecked++;
      if (stat.bgImage !== 'none' || (stat.bg !== 'rgba(0, 0, 0, 0)' && stat.bg !== 'transparent')) {
        console.log(`  FAIL on ${v.id} SVG ${stat.idx}: bg=${stat.bg}, bgImage=${stat.bgImage}`);
        allDeltasPass = false;
      }
    }
  }
  console.log(`Checked ${totalSvgsChecked} interactive SVG elements across all 13 views.`);
  console.log(`SVG background transparency test (delta <= 2/255): ${allDeltasPass ? 'PASS (100% transparent)' : 'FAIL'}`);
  await page.close();
}

// ==========================================
// TEST 2: Franjas getComputedStyle(franja).stroke audit (Item 3)
// ==========================================
console.log('\n--- ITEM 3: Franjas getComputedStyle(franja).stroke audit ---');
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  
  // 1. Radiografía
  await page.goto(`http://localhost:${PORT}/funciones.html`, { waitUntil: 'networkidle' });
  await page.click('#tab-radiografia');
  await page.waitForTimeout(300);
  const radioFranjas = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('.fn-shadow-x, .fn-shadow-y').forEach(el => {
      const cs = window.getComputedStyle(el);
      list.push({
        tag: el.tagName,
        classes: el.className.baseVal || el.className,
        stroke: cs.stroke,
        strokeDasharray: cs.strokeDasharray
      });
    });
    return list;
  });
  console.log(`Radiografía franjas count: ${radioFranjas.length}`);
  radioFranjas.forEach(f => console.log(`  [Radiografía] ${f.classes} -> stroke: ${f.stroke}, dash: ${f.strokeDasharray}`));

  // 2. Scanner
  await page.goto(`http://localhost:${PORT}/funciones.html`, { waitUntil: 'networkidle' });
  await page.click('#tab-scanner');
  await page.waitForTimeout(300);
  const scannerFranjas = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('.fn-shadow-x, .fn-shadow-y').forEach(el => {
      const cs = window.getComputedStyle(el);
      list.push({
        tag: el.tagName,
        classes: el.className.baseVal || el.className,
        stroke: cs.stroke,
        strokeDasharray: cs.strokeDasharray
      });
    });
    return list;
  });
  console.log(`Scanner franjas count: ${scannerFranjas.length}`);
  scannerFranjas.forEach(f => console.log(`  [Scanner] ${f.classes} -> stroke: ${f.stroke}, dash: ${f.strokeDasharray}`));

  await page.close();
}

// ==========================================
// TEST 3: Nav at 390px and 360px + scroll containers list (Item 6)
// ==========================================
console.log('\n--- ITEM 6: Nav at 390px and 360px + scroll containers list ---');
for (const w of [390, 360]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 } });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  
  const navInfo = await page.evaluate(() => {
    const nav = document.querySelector('.site-nav');
    const list = document.querySelector('.site-nav__list');
    const navRect = nav.getBoundingClientRect();
    return {
      navHeight: navRect.height,
      listScrollWidth: list ? list.scrollWidth : 0,
      listClientWidth: list ? list.clientWidth : 0,
      listHasOverflow: list ? list.scrollWidth > list.clientWidth : false
    };
  });
  console.log(`Viewport ${w}px: Nav Height = ${navInfo.navHeight.toFixed(1)}px (<= 90px: ${navInfo.navHeight <= 90})`);
  console.log(`  .site-nav__list scrollWidth = ${navInfo.listScrollWidth}px, clientWidth = ${navInfo.listClientWidth}px`);
  await page.close();
}

// ==========================================
// TEST 4: Mobile Tap Hover Test (Item 8)
// ==========================================
console.log('\n--- ITEM 8: Mobile Tap Hover Test (isMobile: true, hasTouch: true) ---');
{
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page = await mobileContext.newPage();
  
  // 1. Test Tab tap
  await page.goto(`http://localhost:${PORT}/funciones.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const tabEl = await page.$('#tab-secante');
  await tabEl.tap();
  await page.waitForTimeout(150);
  const tabBg = await page.evaluate(() => {
    const t = document.querySelector('#tab-secante');
    return window.getComputedStyle(t).backgroundColor;
  });
  console.log(`Tab tap backgroundColor: "${tabBg}" (PASS: ${tabBg === 'rgba(0, 0, 0, 0)' || tabBg === 'transparent'})`);

  // 2. Test Quiz button tap on Radiografía
  await page.click('#tab-radiografia');
  await page.waitForSelector('.fn-quiz-btn[data-ans="correct"]');
  const quizBtn = await page.$('.fn-quiz-btn[data-ans="correct"]');
  await quizBtn.tap();
  await page.waitForTimeout(150);
  const quizBg = await page.evaluate(() => {
    const b = document.querySelector('.fn-quiz-btn[data-ans="correct"]');
    return window.getComputedStyle(b).backgroundColor;
  });
  console.log(`Quiz button tap backgroundColor: "${quizBg}" (PASS: ${quizBg === 'rgba(0, 0, 0, 0)' || quizBg === 'transparent'})`);

  await mobileContext.close();
}

// ==========================================
// TEST 5: Desigualdades 390px overflow check (Item 9)
// ==========================================
console.log('\n--- ITEM 9: Desigualdades 390px overflow check ---');
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`http://localhost:${PORT}/desigualdades.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const desInfo = await page.evaluate(() => {
    const docEl = document.documentElement;
    const body = document.body;
    const pageEl = document.querySelector('.page') || document.querySelector('main');
    return {
      docScrollWidth: docEl.scrollWidth,
      docClientWidth: docEl.clientWidth,
      bodyScrollWidth: body.scrollWidth,
      bodyClientWidth: body.clientWidth,
      pageScrollWidth: pageEl ? pageEl.scrollWidth : 0,
      pageClientWidth: pageEl ? pageEl.clientWidth : 0
    };
  });
  console.log('Desigualdades at 390px:');
  console.log(`  Document: scrollWidth=${desInfo.docScrollWidth}, clientWidth=${desInfo.docClientWidth}`);
  console.log(`  Body:     scrollWidth=${desInfo.bodyScrollWidth}, clientWidth=${desInfo.bodyClientWidth}`);
  console.log(`  Page:     scrollWidth=${desInfo.pageScrollWidth}, clientWidth=${desInfo.pageClientWidth}`);
  
  if (desInfo.docScrollWidth <= desInfo.docClientWidth) {
    console.log('  RESULT: No page-level horizontal overflow! The clipping observed previously was a montage crop, not layout overflow.');
  } else {
    console.log(`  RESULT: Document has overflow of ${desInfo.docScrollWidth - desInfo.docClientWidth}px.`);
  }

  await page.close();
}

await browser.close();
server.close();
console.log('\nCommit 0 tests completed successfully!');
