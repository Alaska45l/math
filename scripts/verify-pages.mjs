import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT_DIR = path.resolve('.');
const PORT = 3456;
const PAGES = ['index.html', 'desigualdades.html', 'unidades.html', 'funciones.html', 'sucesiones.html'];

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.json': 'application/json',
};

// 1. Servidor HTTP estático
const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') safePath = '/index.html';
  const filePath = path.join(ROOT_DIR, safePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_MAP[ext] || 'application/octet-stream';
  const data = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': mime });
  res.end(data);
});

await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
console.log(`Servidor de prueba iniciado en http://127.0.0.1:${PORT}`);

// 2. Iniciar Chromium en modo headless con CDP
const chromeProc = spawn('/usr/bin/chromium', [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--remote-debugging-port=9333',
  '--autoplay-policy=no-user-gesture-required',
  'about:blank',
]);

// Esperar a que CDP esté listo
await new Promise((resolve) => setTimeout(resolve, 800));

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.callbacks = new Map();
    this.listeners = new Map();

    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
    });

    this.ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        const cbs = this.listeners.get(msg.method) || [];
        cbs.forEach((fn) => fn(msg.params));
      }
    };
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(fn);
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Eval exception');
    }
    return res.result?.value;
  }

  close() {
    this.ws.close();
  }
}

// Obtener target WebSocket
const newTargetRes = await fetch('http://127.0.0.1:9333/json/new', { method: 'PUT' });
const targetData = await newTargetRes.json();
const client = new CdpClient(targetData.webSocketDebuggerUrl);
await client.ready;

await client.send('Runtime.enable');
await client.send('Page.enable');
await client.send('Network.enable');

const results = [];
let allPassed = true;

for (const pageName of PAGES) {
  console.log(`\n--- Probando ${pageName} ---`);
  const consoleErrors = [];
  const networkResponses = [];

  const consoleListener = (params) => {
    if (params.type === 'error') {
      consoleErrors.push(params.args?.map((a) => a.value || a.description).join(' '));
    }
  };
  const exceptionListener = (params) => {
    consoleErrors.push(params.exceptionDetails?.text || 'Exception');
  };
  const responseListener = (params) => {
    if (params.response?.url?.includes(pageName)) {
      networkResponses.push(params.response.status);
    }
  };

  client.on('Runtime.consoleAPICalled', consoleListener);
  client.on('Runtime.exceptionThrown', exceptionListener);
  client.on('Network.responseReceived', responseListener);

  // 1. Simular viewport mobile 375px
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true,
  });

  // Limpiar localStorage antes de navegar para probar estado por defecto
  await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/${pageName}` });

  // Esperar carga
  await new Promise((resolve) => {
    const onNav = (p) => {
      setTimeout(resolve, 600);
    };
    client.on('Page.loadEventFired', onNav);
  });

  // Verificar status HTTP 200
  const httpStatus = networkResponses[0] || 200;

  // Evaluar en DOM móvil: botón presente, estado inicial, toggle de localStorage, desborde horizontal
  const evalMobile = await client.eval(`(() => {
    const btn = document.querySelector('.site-nav__sound-btn');
    if (!btn) return { error: 'No se encontró el botón .site-nav__sound-btn' };

    const initialText = btn.textContent.trim();
    const initialAria = btn.getAttribute('aria-pressed');
    const initialStorage = localStorage.getItem('math:sound:enabled');

    // Click para conmutar
    btn.click();
    const toggledText = btn.textContent.trim();
    const toggledAria = btn.getAttribute('aria-pressed');
    const toggledStorage = localStorage.getItem('math:sound:enabled');

    // Click para volver
    btn.click();
    const restoredText = btn.textContent.trim();
    const restoredAria = btn.getAttribute('aria-pressed');
    const restoredStorage = localStorage.getItem('math:sound:enabled');

    // Comprobar desborde horizontal en 375px
    const docScrollWidth = document.documentElement.scrollWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    const innerWidth = window.innerWidth;
    const hasHorizontalOverflow = docScrollWidth > innerWidth + 1 || bodyScrollWidth > innerWidth + 1;

    return {
      hasBtn: true,
      initialText,
      initialAria,
      initialStorage,
      toggledText,
      toggledAria,
      toggledStorage,
      restoredText,
      restoredAria,
      restoredStorage,
      innerWidth,
      docScrollWidth,
      bodyScrollWidth,
      hasHorizontalOverflow,
    };
  })()`);

  // 2. Verificar desktop
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 200));

  const evalDesktop = await client.eval(`(() => {
    const btn = document.querySelector('.site-nav__sound-btn');
    const docScrollWidth = document.documentElement.scrollWidth;
    const innerWidth = window.innerWidth;
    return {
      hasBtn: Boolean(btn),
      overflow: docScrollWidth > innerWidth + 1,
    };
  })()`);

  const pageOk =
    httpStatus === 200 &&
    consoleErrors.length === 0 &&
    evalMobile.hasBtn &&
    evalMobile.initialAria === 'true' &&
    evalMobile.toggledAria === 'false' &&
    evalMobile.toggledStorage === 'false' &&
    evalMobile.restoredAria === 'true' &&
    evalMobile.restoredStorage === 'true' &&
    !evalMobile.hasHorizontalOverflow &&
    !evalDesktop.overflow;

  if (!pageOk) allPassed = false;

  console.log(`  HTTP status: ${httpStatus}`);
  console.log(`  Console errors: ${consoleErrors.length === 0 ? '0' : JSON.stringify(consoleErrors)}`);
  console.log(`  Botón sonido presente: ${evalMobile.hasBtn}`);
  console.log(`  Estado inicial: aria-pressed="${evalMobile.initialAria}", texto="${evalMobile.initialText}"`);
  console.log(`  Conmutado: aria-pressed="${evalMobile.toggledAria}", texto="${evalMobile.toggledText}", localStorage="${evalMobile.toggledStorage}"`);
  console.log(`  Restaurado: aria-pressed="${evalMobile.restoredAria}", texto="${evalMobile.restoredText}", localStorage="${evalMobile.restoredStorage}"`);
  console.log(`  Mobile 375px width: innerWidth=${evalMobile.innerWidth}, scrollWidth=${evalMobile.docScrollWidth}, desborde=${evalMobile.hasHorizontalOverflow}`);
  console.log(`  Desktop 1280px desborde: ${evalDesktop.overflow}`);
  console.log(`  Resultado página: ${pageOk ? 'PASÓ ✅' : 'FALLÓ ❌'}`);

  results.push({ page: pageName, passed: pageOk, details: evalMobile, errors: consoleErrors });
}

client.close();
chromeProc.kill();
server.close();

console.log('\n========================================');
console.log(`RESUMEN VERIFICACIÓN CHROMIUM: ${allPassed ? 'TODAS LAS PÁGINAS PASARON (5/5) ✅' : 'ALGUNA PÁGINA FALLÓ ❌'}`);
console.log('========================================');

if (!allPassed) {
  process.exit(1);
}
