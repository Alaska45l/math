import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const fp = path.join(process.cwd(), p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
    const ext = path.extname(fp);
    const ct = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : ext === '.js' ? 'application/javascript' : ext === '.woff2' ? 'font/woff2' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct });
    fs.createReadStream(fp).pipe(res);
  } else { res.writeHead(404); res.end(); }
});

server.listen(8140, async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8140/index.html');
  await page.evaluate(() => document.fonts.ready);
  
  const client = await page.context().newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  
  const handle = await page.evaluateHandle(() => document.querySelector('h1'));
  const { nodeId } = await client.send('DOM.requestNode', { objectId: handle._remoteObject.objectId });
  const res = await client.send('CSS.getPlatformFontsForNode', { nodeId });
  console.log('h1 res:', res);

  const pHandle = await page.evaluateHandle(() => document.querySelector('p'));
  const { nodeId: pNodeId } = await client.send('DOM.requestNode', { objectId: pHandle._remoteObject.objectId });
  const pRes = await client.send('CSS.getPlatformFontsForNode', { nodeId: pNodeId });
  console.log('p res:', pRes);

  const brandHandle = await page.evaluateHandle(() => document.querySelector('.site-nav__brand'));
  const { nodeId: bNodeId } = await client.send('DOM.requestNode', { objectId: brandHandle._remoteObject.objectId });
  const bRes = await client.send('CSS.getPlatformFontsForNode', { nodeId: bNodeId });
  console.log('brand res:', bRes);

  await browser.close();
  server.close();
});
