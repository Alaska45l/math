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
    '.woff2': 'font/woff2'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});
await new Promise(r => server.listen(8154, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage();

// Test single characters in a test page
const chars = ['ℕ', '⊂', 'ℤ', 'ℚ', 'ℝ', 'ℂ', ' ', 'N', 'Z', 'Q', 'R', 'C'];
await page.setContent(`
  <link rel="stylesheet" href="http://localhost:8154/css/base.css">
  <link rel="stylesheet" href="http://localhost:8154/css/layout.css">
  <div id="test">
    ${chars.map((c, i) => `<span id="c${i}" class="site-nav__brand" style="display:inline-block">${c}</span>`).join('')}
  </div>
`);
await page.evaluate(() => document.fonts.ready);

const client = await page.context().newCDPSession(page);
await client.send('DOM.enable');
await client.send('CSS.enable');
const { root } = await client.send('DOM.getDocument', { depth: -1 });

for (let i = 0; i < chars.length; i++) {
  const { nodeIds } = await client.send('DOM.querySelectorAll', {
    nodeId: root.nodeId,
    selector: `#c${i}`
  });
  const fonts = await client.send('CSS.getPlatformFontsForNode', { nodeId: nodeIds[0] });
  console.log(`Char: ${chars[i]} (U+${chars[i].charCodeAt(0).toString(16).padStart(4, '0')}) ->`, fonts.fonts.map(f => `${f.familyName} (${f.glyphCount})`).join(', '));
}

await browser.close();
server.close();
