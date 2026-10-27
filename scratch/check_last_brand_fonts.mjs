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

await new Promise(r => server.listen(8153, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage();
await page.goto('http://localhost:8153/scratch/test_brand_strip.html', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const client = await page.context().newCDPSession(page);
await client.send('DOM.enable');
await client.send('CSS.enable');
const { root } = await client.send('DOM.getDocument', { depth: -1 });

const { nodeIds } = await client.send('DOM.querySelectorAll', {
  nodeId: root.nodeId,
  selector: '.site-nav__brand'
});
const lastNodeId = nodeIds[nodeIds.length - 1];
const fonts = await client.send('CSS.getPlatformFontsForNode', { nodeId: lastNodeId });
console.log('Fonts for last brand:', JSON.stringify(fonts, null, 2));

const mathSetsNode = await client.send('DOM.querySelectorAll', {
  nodeId: root.nodeId,
  selector: '.math-sets'
});
if (mathSetsNode.nodeIds.length > 0) {
  const msFonts = await client.send('CSS.getPlatformFontsForNode', { nodeId: mathSetsNode.nodeIds[0] });
  console.log('Fonts for .math-sets:', JSON.stringify(msFonts, null, 2));
}

await browser.close();
server.close();
