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

const VIEWS = [
  { name: '1. Inicio', url: '/index.html', setup: async () => {} },
  { name: '2. Desigualdades', url: '/desigualdades.html', setup: async () => {} },
  { name: '3. Unidades (cm3)', url: '/unidades.html', setup: async (page) => { await page.selectOption('#problem', '3'); } },
  { name: '4. Scanner (caso 1)', url: '/funciones.html', setup: async (page) => { await page.click('#tab-scanner'); } },
  { name: '5. Scanner (colision)', url: '/funciones.html', setup: async (page) => { await page.click('#tab-scanner'); await page.selectOption('#sc-case', '2'); await page.fill('#sc-x', '2'); await page.dispatchEvent('#sc-x', 'input'); } },
  { name: '6. Radiografia (init)', url: '/funciones.html', setup: async (page) => { await page.click('#tab-radiografia'); } },
  { name: '7. Radiografia (respondido)', url: '/funciones.html', setup: async (page) => { await page.click('#tab-radiografia'); await page.click('.fn-quiz-btn[data-ans="correct"]'); } },
  { name: '8. Secante (TCP)', url: '/funciones.html', setup: async (page) => { await page.click('#tab-secante'); } },
  { name: '9. Inversa (m=0)', url: '/funciones.html', setup: async (page) => { await page.click('#tab-inversa'); await page.click('#inv-zero-m'); } },
  { name: '10. Postes', url: '/sucesiones.html', setup: async (page) => { await page.click('#tab-postes'); } },
  { name: '11. Traductor', url: '/sucesiones.html', setup: async (page) => { await page.click('#tab-traductor'); } },
  { name: '12. Radar geom', url: '/sucesiones.html', setup: async (page) => { await page.click('#tab-geometrica'); } },
  { name: '13. Retos', url: '/sucesiones.html', setup: async (page) => { await page.click('#tab-retos'); await page.click('button[data-answer]'); } },
];

server.listen(8147, async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  
  for (const w of [390, 360]) {
    console.log(`\n=== CHECKING AT VIEWPORT ${w}px ===`);
    const page = await browser.newPage({ viewport: { width: w, height: 844 } });
    
    for (const v of VIEWS) {
      await page.goto(`http://127.0.0.1:8147${v.url}`, { waitUntil: 'networkidle' });
      await v.setup(page);
      await page.waitForTimeout(80);
      
      const result = await page.evaluate((viewWidth) => {
        const all = Array.from(document.querySelectorAll('*'));
        
        // Find containers with overflow-x: hidden
        const hiddenContainers = all
          .filter(el => {
            const s = window.getComputedStyle(el);
            return s.overflowX === 'hidden' && el !== document.documentElement && el !== document.body && !el.classList.contains('sr-only');
          })
          .map(el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''));
          
        // Find elements with rect.right > innerWidth + 1
        // (excluding elements inside intentional overflow-x: auto containers like .seq-track-wrap)
        const overflowing = all
          .filter(el => {
            const s = window.getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden') return false;
            // Allow children of overflow-x: auto to extend inside their container
            if (el.closest('.seq-track-wrap')) return false;
            const r = el.getBoundingClientRect();
            return r.right > viewWidth + 1;
          })
          .map(el => {
            const r = el.getBoundingClientRect();
            return {
              tag: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''),
              right: Math.round(r.right),
              width: Math.round(r.width)
            };
          })
          .sort((a, b) => b.right - a.right)
          .slice(0, 5);
          
        return { hiddenContainers, overflowing };
      }, w);
      
      const overCount = result.overflowing.length;
      console.log(`${v.name}: ${overCount === 0 ? '✅ 0 overflow' : '⚠️ ' + overCount + ' overflowing elements'}${result.hiddenContainers.length ? ' [hidden containers: ' + result.hiddenContainers.join(', ') + ']' : ''}`);
      if (overCount > 0) {
        console.table(result.overflowing);
      }
    }
    await page.close();
  }
  
  await browser.close();
  server.close();
});
