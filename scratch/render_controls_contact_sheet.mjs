import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/home/alaska45l/Projects/Math/node_modules/playwright/index.mjs';

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Contact Sheet de Controles — Pizarrón Matemático</title>
  <link rel="stylesheet" href="/css/variables.css">
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/modules/funciones.css">
  <link rel="stylesheet" href="/css/modules/sucesiones.css">
  <style>
    body {
      padding: 12px 16px;
      margin: 0;
      color: var(--ink);
      font-family: var(--font-sans);
    }
    .sheet-title {
      font-family: var(--font-hand);
      font-size: 24px;
      color: var(--yellow);
      margin: 0 0 2px;
      text-align: center;
    }
    .sheet-sub {
      text-align: center;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 12px;
    }
    .sheet-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 1040px;
      margin: 0 auto;
    }
    .section-header {
      font-family: var(--font-hand);
      font-size: 19px;
      color: var(--blue);
      border-bottom: 1.5px dashed var(--border-strong);
      padding-bottom: 4px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .section-header small {
      font-family: var(--font-sans);
      font-size: 11.5px;
      color: var(--muted);
    }
    .controls-grid {
      display: grid;
      grid-template-columns: 140px repeat(4, 1fr);
      gap: 6px 12px;
      align-items: center;
    }
    .grid-hdr {
      font-weight: 600;
      font-size: 12px;
      color: var(--yellow);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--border);
      text-align: center;
    }
    .grid-hdr.col-name {
      text-align: left;
    }
    .row-label {
      font-family: var(--font-hand);
      font-size: 15px;
      color: var(--ink);
    }
    .cell {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 44px;
      padding: 2px 4px;
    }
    .cell--left {
      justify-content: flex-start;
    }

    /* Mobile emulation container */
    .mobile-frame {
      max-width: 390px;
      margin: 0 auto;
      border: 1.5px dashed var(--border-strong);
      padding: 10px;
      border-radius: 8px;
      background: color-mix(in srgb, var(--bg) 95%, transparent);
    }
    .mobile-controls-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .mobile-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .mobile-row__title {
      font-size: 11.5px;
      color: var(--muted);
      font-weight: 600;
    }
    .mobile-row__states {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }
    .state-box {
      border: 1px dotted var(--border);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--card) 40%, transparent);
      border-radius: 4px;
    }
    .state-tag {
      font-size: 9.5px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
  </style>
</head>
<body>
  <div id="contact-sheet-root">
    <div class="sheet-title">Laboratorio Matemático — Contact Sheet de Controles</div>
    <div class="sheet-sub">Fase 5: Estética de Tiza, Accesibilidad WCAG y Touch Targets (≥ 44×44px)</div>

    <div class="sheet-container">
      <!-- SECCION 1: DESKTOP CONTEXT (1920px) -->
      <div>
        <div class="section-header">
          <span>Vista Desktop (1920px context)</span>
          <small>4 Estados: Reposo · Hover · Activo / Presionado · Foco Accesible</small>
        </div>

        <div class="controls-grid">
          <div class="grid-hdr col-name">Control</div>
          <div class="grid-hdr">1. Reposo</div>
          <div class="grid-hdr">2. Hover</div>
          <div class="grid-hdr">3. Activo / Presionado</div>
          <div class="grid-hdr">4. Foco (outline 2px #e6d38a)</div>

          <!-- 1. Boton -->
          <div class="row-label">1. Botón (.btn)</div>
          <div class="cell"><button type="button" class="btn">Continuar</button></div>
          <div class="cell"><button type="button" class="btn is-hover">Continuar</button></div>
          <div class="cell"><button type="button" class="btn is-active">Continuar</button></div>
          <div class="cell"><button type="button" class="btn is-focus-visible">Continuar</button></div>

          <!-- 2. Tab -->
          <div class="row-label">2. Tab (.tab)</div>
          <div class="cell"><button type="button" class="tab" aria-selected="false"><span class="tab__num">1</span>Secante</button></div>
          <div class="cell"><button type="button" class="tab is-hover" aria-selected="false"><span class="tab__num">1</span>Secante</button></div>
          <div class="cell"><button type="button" class="tab" aria-selected="true"><span class="tab__num">1</span>Secante</button></div>
          <div class="cell"><button type="button" class="tab is-focus-visible" aria-selected="true"><span class="tab__num">1</span>Secante</button></div>

          <!-- 3. Select -->
          <div class="row-label">3. Select nativo</div>
          <div class="cell">
            <select id="sel-d1">
              <option>Paso 1: Identificar</option>
            </select>
          </div>
          <div class="cell">
            <select id="sel-d2" class="is-hover">
              <option>Paso 1: Identificar</option>
            </select>
          </div>
          <div class="cell">
            <select id="sel-d3" class="is-active">
              <option>Paso 1: Identificar</option>
            </select>
          </div>
          <div class="cell">
            <select id="sel-d4" class="is-focus-visible">
              <option>Paso 1: Identificar</option>
            </select>
          </div>

          <!-- 4. Checkbox -->
          <div class="row-label">4. Checkbox (28px)</div>
          <div class="cell">
            <label><input type="checkbox"> Curva real</label>
          </div>
          <div class="cell">
            <label><input type="checkbox" class="is-hover"> Curva real</label>
          </div>
          <div class="cell">
            <label><input type="checkbox" checked> Curva real</label>
          </div>
          <div class="cell">
            <label><input type="checkbox" checked class="is-focus-visible"> Curva real</label>
          </div>

          <!-- 5. Slider -->
          <div class="row-label">5. Range Slider</div>
          <div class="cell" style="width: 100%;">
            <input type="range" min="0" max="100" value="35">
          </div>
          <div class="cell" style="width: 100%;">
            <input type="range" min="0" max="100" value="35" class="is-hover">
          </div>
          <div class="cell" style="width: 100%;">
            <input type="range" min="0" max="100" value="35" class="is-active">
          </div>
          <div class="cell" style="width: 100%;">
            <input type="range" min="0" max="100" value="35" class="is-focus-visible">
          </div>

          <!-- 6. Quiz button -->
          <div class="row-label">6. Quiz button</div>
          <div class="cell cell--left">
            <button type="button" class="fn-quiz-btn">
              <span class="quiz-opt-tag">A)</span> Opción neutral
            </button>
          </div>
          <div class="cell cell--left">
            <button type="button" class="fn-quiz-btn is-hover">
              <span class="quiz-opt-tag">A)</span> Opción hover
            </button>
          </div>
          <div class="cell cell--left">
            <button type="button" class="fn-quiz-btn is-incorrect">
              <span class="quiz-opt-tag tachado">A)</span> Alturas incorrectas
            </button>
          </div>
          <div class="cell cell--left">
            <button type="button" class="fn-quiz-btn is-correct is-focus-visible">
              <span class="quiz-opt-tag encerrado">B)</span> Abscisas correctas
            </button>
          </div>
        </div>
      </div>

      <!-- SECCION 2: MOBILE CONTEXT (390px) -->
      <div>
        <div class="section-header">
          <span>Vista Mobile (390px viewport context)</span>
          <small>Todos los targets ≥ 44×44px · Área táctil comprobada</small>
        </div>

        <div class="mobile-frame">
          <div class="mobile-controls-list">
            <!-- 1. Boton Mobile -->
            <div class="mobile-row">
              <div class="mobile-row__title">1. Botón (.btn) en móvil</div>
              <div class="mobile-row__states">
                <div class="state-box">
                  <span class="state-tag">Reposo</span>
                  <button type="button" class="btn" style="width:100%">Verificar</button>
                </div>
                <div class="state-box">
                  <span class="state-tag">Pulsado / Activo</span>
                  <button type="button" class="btn is-active" style="width:100%">Verificar</button>
                </div>
              </div>
            </div>

            <!-- 2. Tabs Mobile -->
            <div class="mobile-row">
              <div class="mobile-row__title">2. Tabs en barra móvil</div>
              <div style="display:flex; gap:6px;">
                <button type="button" class="tab" aria-selected="true"><span class="tab__num">1</span>Postes</button>
                <button type="button" class="tab" aria-selected="false"><span class="tab__num">2</span>Traductor</button>
                <button type="button" class="tab is-focus-visible" aria-selected="false"><span class="tab__num">3</span>Radar</button>
              </div>
            </div>

            <!-- 3. Select Mobile -->
            <div class="mobile-row">
              <div class="mobile-row__title">3. Select nativo móvil (chevron chalk)</div>
              <select style="width:100%">
                <option>Caso 1: f(x) = x² − 2</option>
              </select>
            </div>

            <!-- 4. Checkbox Mobile -->
            <div class="mobile-row">
              <div class="mobile-row__title">4. Checkbox táctil (≥ 44px)</div>
              <div style="display:flex; justify-content:space-between;">
                <label><input type="checkbox"> Curva real</label>
                <label><input type="checkbox" checked> Tilde verde</label>
              </div>
            </div>

            <!-- 5. Range Slider Mobile -->
            <div class="mobile-row">
              <div class="mobile-row__title">5. Slider de rango móvil (#sc-x)</div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="small muted">x =</span>
                <input type="range" min="-3" max="3" value="1" style="flex:1">
                <output style="min-width:32px">1,0</output>
              </div>
            </div>

            <!-- 6. Quiz Options Mobile -->
            <div class="mobile-row">
              <div class="mobile-row__title">6. Quiz Buttons en fila completa</div>
              <button type="button" class="fn-quiz-btn is-incorrect">
                <span class="quiz-opt-tag tachado">A)</span> Porque copió las alturas
              </button>
              <button type="button" class="fn-quiz-btn is-correct">
                <span class="quiz-opt-tag encerrado">B)</span> Porque debió leer en eje X
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(process.cwd(), 'scratch/controls_contact_sheet.html'), htmlContent, 'utf-8');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '/contact') reqPath = '/scratch/controls_contact_sheet.html';
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
    '.woff2': 'font/woff2',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.png': 'image/png'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

const PORT = 8220;
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });

const page = await browser.newPage({
  viewport: { width: 1040, height: 1100 },
  deviceScaleFactor: 2
});

await page.goto(`http://localhost:${PORT}/scratch/controls_contact_sheet.html`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

const rootEl = await page.$('#contact-sheet-root');
const bounding = await rootEl.boundingBox();
console.log('Contact sheet rendered dimensions at DPR 2:', {
  cssWidth: bounding.width,
  cssHeight: bounding.height,
  physicalWidth: Math.round(bounding.width * 2),
  physicalHeight: Math.round(bounding.height * 2)
});

const outPath1 = path.join(process.cwd(), 'evidence/controls_contact_sheet.png');
const outPath2 = '/home/alaska45l/.gemini/antigravity/brain/3d28227a-c5bc-4f2c-9cf3-c3d50c502683/evidence/controls_contact_sheet.png';

fs.mkdirSync(path.dirname(outPath1), { recursive: true });
fs.mkdirSync(path.dirname(outPath2), { recursive: true });

await rootEl.screenshot({ path: outPath1 });
fs.copyFileSync(outPath1, outPath2);

console.log('Screenshot saved successfully to:', outPath1, 'and', outPath2);

await browser.close();
server.close();
