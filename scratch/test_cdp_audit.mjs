import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const PORT = 8144;
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

server.listen(PORT, async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.evaluate(() => document.fonts.ready);

  const client = await page.context().newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  await client.send('Runtime.enable');
  await client.send('DOM.getDocument', { depth: -1 });

  // Evaluate handles for all visible elements with text
  const elementsData = await page.evaluate(() => {
    const results = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const s = window.getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') continue;
      
      let text = '';
      const tag = el.tagName.toLowerCase();
      if (tag === 'text' || tag === 'tspan') {
        text = (el.textContent || '').trim();
      } else {
        for (const child of el.childNodes) {
          if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim().length > 0) {
            text += ' ' + child.nodeValue.trim();
          }
        }
      }
      text = text.trim();
      if (text.length > 0) {
        // Tag selector
        const sel = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').filter(Boolean).slice(0, 2).join('.') : '');
        results.push({ sel, text: text.slice(0, 30) });
      }
    }
    return results;
  });

  console.log(`Auditing ${elementsData.length} visible text elements in index.html...`);

  const platformTally = {};
  
  for (let i = 0; i < elementsData.length; i++) {
    const item = elementsData[i];
    try {
      const evalRes = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const els = Array.from(document.querySelectorAll('*')).filter(el => {
            const s = window.getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden') return false;
            let t = '';
            if (el.tagName.toLowerCase() === 'text' || el.tagName.toLowerCase() === 'tspan') t = el.textContent || '';
            else {
              for (const c of el.childNodes) {
                if (c.nodeType === 3 && c.nodeValue.trim().length > 0) t += ' ' + c.nodeValue.trim();
              }
            }
            return t.trim().length > 0;
          });
          return els[${i}];
        })()`
      });
      if (evalRes.result && evalRes.result.objectId) {
        const { nodeId } = await client.send('DOM.requestNode', { objectId: evalRes.result.objectId });
        if (nodeId) {
          const fontsRes = await client.send('CSS.getPlatformFontsForNode', { nodeId });
          if (fontsRes.fonts) {
            for (const f of fontsRes.fonts) {
              platformTally[f.familyName] = (platformTally[f.familyName] || 0) + f.glyphCount;
            }
          }
        }
      }
    } catch (e) {}
  }

  console.log('Real platform fonts:', platformTally);

  await browser.close();
  server.close();
});
