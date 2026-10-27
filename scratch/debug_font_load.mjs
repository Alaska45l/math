import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath);
  console.log('HTTP request:', req.url, '-> exists:', fs.existsSync(filePath));
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
await new Promise(r => server.listen(8155, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const page = await browser.newPage();
page.on('console', msg => console.log('Browser console:', msg.type(), msg.text()));
page.on('requestfailed', req => console.log('Request failed:', req.url(), req.failure()));
page.on('response', res => console.log('Response:', res.status(), res.url()));

await page.goto('http://localhost:8155/scratch/test_brand_strip.html', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const fontDetails = await page.evaluate(async () => {
  const list = [];
  for (const f of document.fonts) {
    list.push({
      family: f.family,
      status: f.status,
      weight: f.weight,
      style: f.style
    });
  }
  return list;
});
console.log('Document fonts:', fontDetails);

await browser.close();
server.close();
