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

server.listen(8139, async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8139/index.html');
  await page.evaluate(() => document.fonts.ready);
  
  const client = await page.context().newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  
  const doc = await client.send('DOM.getDocument', { depth: -1 });
  
  // Find all nodes in doc
  const textNodeIds = [];
  function collect(node) {
    if (node.nodeType === 3 && node.nodeValue && node.nodeValue.trim().length > 0) {
      textNodeIds.push({ nodeId: node.nodeId, text: node.nodeValue.trim().slice(0, 20), parentId: node.parentId });
    }
    if (node.children) {
      for (const c of node.children) collect(c);
    }
  }
  collect(doc.root);
  console.log(`Found ${textNodeIds.length} text nodes`);
  
  const fontUsage = {};
  for (const item of textNodeIds) {
    try {
      const res = await client.send('CSS.getPlatformFontsForNode', { nodeId: item.nodeId });
      for (const pf of res.platformFonts) {
        fontUsage[pf.familyName] = (fontUsage[pf.familyName] || 0) + pf.glyphCount;
      }
    } catch (e) {
      // If text node fails, try parent element
      try {
        const res = await client.send('CSS.getPlatformFontsForNode', { nodeId: item.parentId });
        for (const pf of res.platformFonts) {
          fontUsage[pf.familyName] = (fontUsage[pf.familyName] || 0) + pf.glyphCount;
        }
      } catch (e2) {}
    }
  }
  console.log('Platform font usage in index.html:', fontUsage);
  await browser.close();
  server.close();
});
