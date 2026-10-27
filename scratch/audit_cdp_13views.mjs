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

await new Promise(r => server.listen(8157, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const VIEWS = [
  { name: '01_index', url: 'http://localhost:8157/index.html' },
  { name: '02_desigualdades', url: 'http://localhost:8157/desigualdades.html' },
  { name: '03_unidades', url: 'http://localhost:8157/unidades.html' },
  { name: '04_fn_scanner', url: 'http://localhost:8157/funciones.html#scanner' },
  { name: '05_fn_traductor', url: 'http://localhost:8157/funciones.html#traductor' },
  { name: '06_fn_secante', url: 'http://localhost:8157/funciones.html#secante' },
  { name: '07_fn_inversa', url: 'http://localhost:8157/funciones.html#inversa' },
  { name: '08_seq_postes', url: 'http://localhost:8157/sucesiones.html#postes' },
  { name: '09_seq_radar', url: 'http://localhost:8157/sucesiones.html#radar' },
  { name: '10_seq_traductor', url: 'http://localhost:8157/sucesiones.html#traductor' },
  { name: '11_seq_geometrica', url: 'http://localhost:8157/sucesiones.html#geometrica' },
  { name: '12_seq_radiografia', url: 'http://localhost:8157/sucesiones.html#radiografia' },
  { name: '13_seq_retos', url: 'http://localhost:8157/sucesiones.html#retos' }
];

const aggregateFonts = new Map();
const unexpectedFallbacks = [];
const svgFontSizes = [];

for (const v of VIEWS) {
  await page.goto(v.url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const client = await page.context().newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  const { root } = await client.send('DOM.getDocument', { depth: -1 });

  // Find all elements that directly contain text or are SVG text/tspan
  const nodeIdsWithText = await page.evaluate(() => {
    const list = [];
    const walk = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'meta' || tag === 'link' || tag === 'noscript') return;
        
        let hasDirectText = false;
        for (const child of node.childNodes) {
          if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
            hasDirectText = true;
            break;
          }
        }
        if (hasDirectText || tag === 'text' || tag === 'tspan') {
          // generate unique selector or mark element
          if (!node.id && !node.dataset.auditId) {
            node.dataset.auditId = 'aid_' + Math.random().toString(36).slice(2, 9);
          }
          list.push({
            id: node.id ? '#' + node.id : `[data-audit-id="${node.dataset.auditId}"]`,
            tag: tag,
            textSample: node.textContent.trim().slice(0, 30)
          });
        }
        for (const child of node.children) {
          walk(child);
        }
      }
    };
    walk(document.body);
    return list;
  });

  console.log(`View ${v.name}: evaluating ${nodeIdsWithText.length} text elements...`);

  for (const item of nodeIdsWithText) {
    try {
      const q = await client.send('DOM.querySelectorAll', {
        nodeId: root.nodeId,
        selector: item.id
      });
      if (q.nodeIds.length === 0) continue;
      const nodeId = q.nodeIds[0];
      const res = await client.send('CSS.getPlatformFontsForNode', { nodeId });
      if (res && res.fonts) {
        for (const f of res.fonts) {
          const entry = aggregateFonts.get(f.familyName) || {
            familyName: f.familyName,
            postScriptName: f.postScriptName,
            isCustomFont: f.isCustomFont,
            glyphCount: 0,
            views: new Set()
          };
          entry.glyphCount += f.glyphCount;
          entry.views.add(v.name);
          aggregateFonts.set(f.familyName, entry);

          // Check if this is an unexpected system font fallback
          const allowedFamilies = ['Caveat', 'Kalam', 'STIX Two Math'];
          if (!allowedFamilies.includes(f.familyName)) {
            unexpectedFallbacks.push({
              view: v.name,
              element: item.id,
              text: item.textSample,
              font: f.familyName,
              glyphs: f.glyphCount
            });
          }
        }
      }
    } catch (e) {
      // skip detached
    }
  }

  // Audit SVG text elements effective font-size
  const svgTexts = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('svg text, svg tspan').forEach(t => {
      const rect = t.getBoundingClientRect();
      const style = window.getComputedStyle(t);
      const fs = parseFloat(style.fontSize);
      list.push({
        text: t.textContent.trim().slice(0, 20),
        fontSize: fs,
        fontFamily: style.fontFamily.split(',')[0].replace(/['"]/g, ''),
        width: rect.width,
        height: rect.height
      });
    });
    return list;
  });
  if (svgTexts.length > 0) {
    svgFontSizes.push({ view: v.name, texts: svgTexts });
  }
}

console.log('\n=== AGGREGATE PLATFORM FONTS ACROSS 13 VIEWS ===');
for (const [name, data] of aggregateFonts.entries()) {
  console.log(`Font: ${name.padEnd(20)} | PostScript: ${data.postScriptName.padEnd(25)} | Custom: ${String(data.isCustomFont).padEnd(5)} | Glyphs: ${String(data.glyphCount).padStart(6)} | Views: ${data.views.size}/13`);
}

if (unexpectedFallbacks.length > 0) {
  console.log(`\n=== UNEXPECTED FALLBACKS (${unexpectedFallbacks.length}) ===`);
  for (const u of unexpectedFallbacks.slice(0, 20)) {
    console.log(`[${u.view}] ${u.element} ("${u.text}") -> ${u.font} (${u.glyphs} glyphs)`);
  }
} else {
  console.log('\nSUCCESS: 0 UNEXPECTED FALLBACKS! Every single text node resolved to Caveat, Kalam, or STIX Two Math!');
}

console.log('\n=== SVG TEXT FONT SIZES (Sample) ===');
let minCaveat = 999, minKalam = 999, minOther = 999;
for (const s of svgFontSizes) {
  for (const t of s.texts) {
    if (t.fontFamily === 'Caveat') minCaveat = Math.min(minCaveat, t.fontSize);
    else if (t.fontFamily === 'Kalam') minKalam = Math.min(minKalam, t.fontSize);
    else minOther = Math.min(minOther, t.fontSize);
  }
}
console.log(`Min SVG Caveat size: ${minCaveat}px (target >= 14px)`);
console.log(`Min SVG Kalam size: ${minKalam}px (target >= 12px)`);
console.log(`Min SVG other/math size: ${minOther}px`);

await browser.close();
server.close();
