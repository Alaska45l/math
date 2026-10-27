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

await new Promise(r => server.listen(8167, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const VIEWS = [
  { name: '01_index', url: 'http://localhost:8167/index.html' },
  { name: '02_desigualdades', url: 'http://localhost:8167/desigualdades.html' },
  { name: '03_unidades', url: 'http://localhost:8167/unidades.html' },
  { name: '04_fn_scanner', url: 'http://localhost:8167/funciones.html#scanner' },
  { name: '05_fn_traductor', url: 'http://localhost:8167/funciones.html#traductor' },
  { name: '06_fn_secante', url: 'http://localhost:8167/funciones.html#secante' },
  { name: '07_fn_inversa', url: 'http://localhost:8167/funciones.html#inversa' },
  { name: '08_seq_postes', url: 'http://localhost:8167/sucesiones.html#postes' },
  { name: '09_seq_radar', url: 'http://localhost:8167/sucesiones.html#radar' },
  { name: '10_seq_traductor', url: 'http://localhost:8167/sucesiones.html#traductor' },
  { name: '11_seq_geometrica', url: 'http://localhost:8167/sucesiones.html#geometrica' },
  { name: '12_seq_radiografia', url: 'http://localhost:8167/sucesiones.html#radiografia' },
  { name: '13_seq_retos_woo', url: 'http://localhost:8167/sucesiones.html#retos', setup: async (p) => {
    await p.selectOption('#seq-preset', 'woo');
    await p.waitForTimeout(200);
  }}
];

console.log('=== AUDIT OF ALL SCROLL CONTAINERS (scrollWidth > clientWidth) AT 390px ===\n');

for (const v of VIEWS) {
  await page.goto(v.url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (v.setup) await v.setup(page);
  await page.waitForTimeout(300);

  const scrollContainers = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.scrollWidth > el.clientWidth + 1) {
        const id = el.id ? '#' + el.id : (el.className ? '.' + String(el.className).trim().split(/\s+/).join('.') : el.tagName.toLowerCase());
        const style = window.getComputedStyle(el);
        list.push({
          selector: id,
          tag: el.tagName.toLowerCase(),
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth,
          overflowX: style.overflowX,
          contentSample: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)
        });
      }
    });
    return list;
  });

  if (scrollContainers.length > 0) {
    console.log(`[${v.name}] ${scrollContainers.length} scroll container(s):`);
    for (const c of scrollContainers) {
      console.log(`  - ${c.selector} (tag: ${c.tag}) | client: ${c.clientWidth}px | scroll: ${c.scrollWidth}px | overflow-x: ${c.overflowX} | Content: "${c.contentSample}"`);
    }
  } else {
    console.log(`[${v.name}] 0 scroll containers`);
  }
}

await browser.close();
server.close();
