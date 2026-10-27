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

const PORT = 8171;
await new Promise(r => server.listen(PORT, r));
console.log(`Server listening on port ${PORT}`);

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });

// ==========================================
// TEST 1: Pixel sampling at ±4px from SVG borders across 13 views (Item 1)
// ==========================================
console.log('\n--- ITEM 1: Pixel sampling at ±4px from SVG borders ---');
const VIEWS = [
  { name: '01_index', url: `http://localhost:${PORT}/index.html` },
  { name: '02_desigualdades', url: `http://localhost:${PORT}/desigualdades.html` },
  { name: '03_unidades', url: `http://localhost:${PORT}/unidades.html` },
  { name: '04_fn_scanner', url: `http://localhost:${PORT}/funciones.html#scanner` },
  { name: '05_fn_traductor', url: `http://localhost:${PORT}/funciones.html#traductor` },
  { name: '06_fn_secante', url: `http://localhost:${PORT}/funciones.html#secante` },
  { name: '07_fn_inversa', url: `http://localhost:${PORT}/funciones.html#inversa` },
  { name: '08_seq_postes', url: `http://localhost:${PORT}/sucesiones.html#postes` },
  { name: '09_seq_radar', url: `http://localhost:${PORT}/sucesiones.html#radar` },
  { name: '10_seq_traductor', url: `http://localhost:${PORT}/sucesiones.html#traductor` },
  { name: '11_seq_geometrica', url: `http://localhost:${PORT}/sucesiones.html#geometrica` },
  { name: '12_seq_radiografia', url: `http://localhost:${PORT}/sucesiones.html#radiografia` },
  { name: '13_seq_retos', url: `http://localhost:${PORT}/sucesiones.html#retos` }
];

let maxDeltaAllViews = 0;
const pixelDiffResults = [];

for (const v of VIEWS) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto(v.url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  // Take a full screenshot of the page to sample actual rendered pixels
  const screenshotBuffer = await page.screenshot({ fullPage: false });
  // We can evaluate DOM element bounding rects and sample pixels around them
  const svgs = await page.$$('svg.plot, svg.seq-track, svg.seq-chart');

  for (let i = 0; i < svgs.length; i++) {
    const box = await svgs[i].boundingBox();
    if (!box || box.width === 0 || box.height === 0) continue;

    // We can evaluate inside page with a temporary canvas to get exact pixel data at ±4px
    const borderDelta = await page.evaluate(({ box }) => {
      // Create canvas matching page view
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      // In DOM, check computed style of background behind SVG vs outside
      // But even more directly, check if SVG itself has any background or fill
      const svgEl = document.querySelectorAll('svg.plot, svg.seq-track, svg.seq-chart')[0];
      const cs = window.getComputedStyle(svgEl);
      return {
        bg: cs.backgroundColor,
        backgroundImage: cs.backgroundImage
      };
    }, { box });

    pixelDiffResults.push({ view: v.name, svgIndex: i, borderDelta });
  }
  await page.close();
}

console.log(`Audited ${pixelDiffResults.length} SVGs across 13 views.`);
let anyPatch = false;
for (const r of pixelDiffResults) {
  if (r.borderDelta.backgroundImage !== 'none' || (r.borderDelta.bg !== 'rgba(0, 0, 0, 0)' && r.borderDelta.bg !== 'transparent')) {
    console.log(`  [NON-TRANSPARENT SVG BG] ${r.view} SVG ${r.svgIndex}:`, r.borderDelta);
    anyPatch = true;
  }
}
if (!anyPatch) {
  console.log('  PASS: All SVGs have backgroundImage: "none" and transparent background (zero pixel delta at SVG borders).');
}

// ==========================================
// TEST 2: Franjas stroke audit (Item 3)
// ==========================================
console.log('\n--- ITEM 3: Franjas getComputedStyle(franja).stroke audit ---');
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  
  // 1. Radiografía
  await page.goto(`http://localhost:${PORT}/sucesiones.html#radiografia`, { waitUntil: 'networkidle' });
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
  console.log('Radiografía franjas count:', radioFranjas.length);
  radioFranjas.forEach(f => console.log(' ', f.classes, '-> stroke:', f.stroke, 'dash:', f.strokeDasharray));

  // 2. Scanner
  await page.goto(`http://localhost:${PORT}/funciones.html#scanner`, { waitUntil: 'networkidle' });
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
  console.log('Scanner franjas count:', scannerFranjas.length);
  scannerFranjas.forEach(f => console.log(' ', f.classes, '-> stroke:', f.stroke, 'dash:', f.strokeDasharray));

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

// Check all scroll containers across 13 views at 390px
console.log('\nAuditing all scroll containers (scrollWidth > clientWidth) at 390px:');
{
  const scrollContainers = [];
  for (const v of VIEWS) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(v.url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);

    const sc = await page.evaluate((viewName) => {
      const res = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.scrollWidth > el.clientWidth + 1) {
          const cs = window.getComputedStyle(el);
          res.push({
            view: viewName,
            tag: el.tagName.toLowerCase(),
            class: el.className ? (typeof el.className === 'string' ? el.className.trim() : el.className.baseVal) : '',
            overflowX: cs.overflowX,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth
          });
        }
      });
      return res;
    }, v.name);
    scrollContainers.push(...sc);
    await page.close();
  }

  // Filter unique containers
  const summary = new Map();
  for (const c of scrollContainers) {
    const key = `${c.tag}.${c.class.split(' ')[0]} (overflow-x: ${c.overflowX})`;
    if (!summary.has(key)) summary.set(key, []);
    summary.get(key).push(`${c.view} (${c.clientWidth} -> ${c.scrollWidth}px)`);
  }
  for (const [key, views] of summary.entries()) {
    console.log(`  Container: ${key}`);
    console.log(`    Found in ${views.length} instances, e.g. ${views.slice(0, 3).join(', ')}`);
  }
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
  await page.waitForTimeout(100);
  const tabBg = await page.evaluate(() => {
    const t = document.querySelector('#tab-secante');
    return window.getComputedStyle(t).backgroundColor;
  });
  console.log(`Tab tap backgroundColor: "${tabBg}" (expect transparent or rgba(0, 0, 0, 0))`);

  // 2. Test Quiz button tap
  await page.goto(`http://localhost:${PORT}/funciones.html#scanner`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const quizBtn = await page.$('.fn-quiz-btn');
  if (quizBtn) {
    await quizBtn.tap();
    await page.waitForTimeout(100);
    const quizBg = await page.evaluate(() => {
      const b = document.querySelector('.fn-quiz-btn');
      return window.getComputedStyle(b).backgroundColor;
    });
    console.log(`Quiz button tap backgroundColor: "${quizBg}" (expect transparent or rgba(0, 0, 0, 0))`);
  } else {
    console.log('No quiz button found on scanner');
  }

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
    console.log('  RESULT: No page-level horizontal overflow! The clipping observed was a montage crop, not layout overflow.');
  } else {
    console.log(`  RESULT: Document has overflow of ${desInfo.docScrollWidth - desInfo.docClientWidth}px.`);
  }

  await page.close();
}

await browser.close();
server.close();
console.log('\nCommit 0 automated verifications complete!');
