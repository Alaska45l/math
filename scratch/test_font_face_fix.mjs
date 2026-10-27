import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  const filePath = path.join(process.cwd(), reqPath);
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  const ext = path.extname(filePath);
  const types = {
    '.woff2': 'font/woff2',
    '.css': 'text/css'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});
await new Promise(r => server.listen(8156, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage();

await page.setContent(`
  <style>
    @font-face {
      font-family: 'Math fallback';
      font-style: normal;
      font-weight: 100 900;
      src: url('http://localhost:8156/fonts/math-subset.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Math fallback';
      font-style: italic;
      font-weight: 100 900;
      src: url('http://localhost:8156/fonts/math-subset.woff2') format('woff2');
    }
    .test-brand {
      font-family: 'Math fallback', sans-serif;
      font-weight: 600;
      font-style: italic;
    }
    .test-sets {
      font-family: 'Math fallback', sans-serif;
      font-weight: 400;
      font-style: normal;
    }
  </style>
  <div class="test-brand">ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ</div>
  <div class="test-sets">ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ</div>
`);
await page.evaluate(() => document.fonts.ready);

const client = await page.context().newCDPSession(page);
await client.send('DOM.enable');
await client.send('CSS.enable');
const { root } = await client.send('DOM.getDocument', { depth: -1 });

const nodes = await client.send('DOM.querySelectorAll', {
  nodeId: root.nodeId,
  selector: 'div'
});

for (let i = 0; i < nodes.nodeIds.length; i++) {
  const f = await client.send('CSS.getPlatformFontsForNode', { nodeId: nodes.nodeIds[i] });
  console.log(`Div ${i}:`, JSON.stringify(f, null, 2));
}

await browser.close();
server.close();
