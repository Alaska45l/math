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

await new Promise(r => server.listen(8158, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage();

const VIEWS = [
  'http://localhost:8158/index.html',
  'http://localhost:8158/desigualdades.html',
  'http://localhost:8158/unidades.html',
  'http://localhost:8158/funciones.html#scanner',
  'http://localhost:8158/sucesiones.html#postes'
];

for (const u of VIEWS) {
  await page.goto(u, { waitUntil: 'networkidle' });
  const client = await page.context().newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  const { root } = await client.send('DOM.getDocument', { depth: -1 });

  const elements = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0 && el.textContent.trim()) {
        if (!el.id && !el.dataset.aid) el.dataset.aid = 'ad_' + Math.random().toString(36).slice(2, 8);
        list.push({
          sel: el.id ? '#' + el.id : `[data-aid="${el.dataset.aid}"]`,
          tag: el.tagName.toLowerCase(),
          text: el.textContent.trim().slice(0, 30)
        });
      }
    });
    return list;
  });

  for (const item of elements) {
    try {
      const q = await client.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: item.sel });
      if (q.nodeIds.length === 0) continue;
      const res = await client.send('CSS.getPlatformFontsForNode', { nodeId: q.nodeIds[0] });
      for (const f of res.fonts) {
        if (f.familyName === 'Adwaita Mono') {
          console.log(`[${u.split('/').pop()}] Adwaita Mono found in <${item.tag}> "${item.text}" (${item.sel})`);
        }
      }
    } catch (e) {}
  }
}

await browser.close();
server.close();
