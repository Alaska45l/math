import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT_DIR = path.resolve(".");
const PORT = 3457;

const MIME_MAP = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];
  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, "");
  if (safePath === "/" || safePath === "") safePath = "/sucesiones.html";
  const filePath = path.join(ROOT_DIR, safePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end();
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_MAP[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": mime });
  res.end(fs.readFileSync(filePath));
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));

const chromeProc = spawn("/usr/bin/chromium", [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--remote-debugging-port=9334",
  "--autoplay-policy=no-user-gesture-required",
  "about:blank",
]);

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
        (this.listeners.get(msg.method) || []).forEach((listener) =>
          listener(msg.params),
        );
      }
    };
  }
  on(method, listener) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(listener);
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expr) {
    const res = await this.send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(
        res.exceptionDetails.exception?.description ||
          res.exceptionDetails.text ||
          "Eval exception: " + JSON.stringify(res.exceptionDetails),
      );
    }
    return res.result?.value;
  }
  close() {
    this.ws.close();
  }
}

let targetData = null;
for (let i = 0; i < 20; i++) {
  try {
    const targetRes = await fetch("http://127.0.0.1:9334/json/new", {
      method: "PUT",
    });
    if (targetRes.ok) {
      targetData = await targetRes.json();
      break;
    }
  } catch (_e) {
    await new Promise((r) => setTimeout(r, 150));
  }
}
if (!targetData) throw new Error("No se pudo conectar con Chromium");
const client = new CdpClient(targetData.webSocketDebuggerUrl);
await client.ready;

await client.send("Runtime.enable");
await client.send("Page.enable");
await client.send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

await client.send("Page.navigate", {
  url: `http://127.0.0.1:${PORT}/sucesiones.html`,
});
await new Promise((r) => setTimeout(r, 1200));

const interactionResults = await client.eval(`(async () => {
  const sound = await import('./js/core/sound.js');
  const vn = await import('./js/core/vn.js');

  const report = {};

  const ctx = sound.getAudioContext();
  report.hasAudioContext = Boolean(ctx);

  let oscCount = 0;
  let bufCount = 0;
  const origCreateOsc = ctx.createOscillator.bind(ctx);
  const origCreateBuf = ctx.createBufferSource.bind(ctx);
  ctx.createOscillator = () => { oscCount++; return origCreateOsc(); };
  ctx.createBufferSource = () => { bufCount++; return origCreateBuf(); };

  await new Promise((r) => setTimeout(r, 50));
  const oscBeforeThrottle = oscCount;
  for (let i = 0; i < 10; i++) {
    sound.playSliderTick(1);
  }
  report.sliderTicksInSyncLoop = oscCount - oscBeforeThrottle;
  report.sliderThrottlingWorks = (oscCount - oscBeforeThrottle <= 2 && oscCount - oscBeforeThrottle >= 1);

  sound.setSoundEnabled(false);
  const oscBeforeMute = oscCount;
  const bufBeforeMute = bufCount;
  sound.playSliderTick(1);
  sound.playVoiceBlip('a', 'feliz');
  sound.playPoseEmote('enojada');
  sound.playSuccess('normal');
  sound.playError(2);
  sound.playClick();
  sound.playPageTurn();
  const nodesCreatedWhileMuted = (oscCount - oscBeforeMute) + (bufCount - bufBeforeMute);
  report.nodesCreatedWhileMuted = nodesCreatedWhileMuted;
  report.soundDisabledWorks = (nodesCreatedWhileMuted === 0 && !sound.isSoundEnabled());

  sound.setSoundEnabled(true);
  report.soundEnabledRestored = sound.isSoundEnabled();

  let audioErrors = 0;
  try {
    await new Promise((r) => setTimeout(r, 50));
    sound.playSliderTick(1.2);
    sound.playClick();
    sound.playPageTurn();
    sound.playSuccess('normal');
    sound.playSuccess('section');
    sound.playError(1);
    sound.playError(2);
    sound.playPoseEmote('colapso');
    sound.playPoseEmote('orgullosa');
    sound.playPoseEmote('enojada');
    sound.playPoseEmote('feliz');
    sound.playVoiceBlip('e', 'base');
    sound.playVoiceBlip('o', 'colapso');
  } catch (err) {
    audioErrors++;
    report.audioCallError = err.message;
  }
  report.audioCallsPassed = audioErrors === 0;

  let vnError = null;
  try {
    vn.react({
      pose: 'orgullosa',
      tag: 'Prueba',
      html: '¡Probando voz sintética de Alaska en el typewriter!',
    });
  } catch (err) {
    vnError = err.message;
  }
  report.vnReactTriggered = !vnError;
  report.vnTagHasSvgIcon = Boolean(document.querySelector('.vn-tag svg.chalk-icon'));

  // Verificar persistencia de sliders en sucesiones.html durante eventos input continuos
  const seqRangeInputs = Array.from(document.querySelectorAll('input[type="range"]'));
  let seqSlidersPersistent = seqRangeInputs.length > 0;
  for (const slider of seqRangeInputs) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const step = parseFloat(slider.step) || 1;
    for (let k = 1; k <= 3; k++) {
      const nextVal = Math.min(max, min + k * step);
      slider.value = String(nextVal);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      if (!slider.isConnected) {
        seqSlidersPersistent = false;
      }
    }
  }
  report.seqSlidersCount = seqRangeInputs.length;
  report.seqSlidersPersistent = seqSlidersPersistent;

  // Verificar persistencia de SVG en widget funcion durante pointerdown -> pointermove -> pointerup
  const fnSvg = document.querySelector('[data-widget="funcion"] svg');
  if (fnSvg) {
    fnSvg.dispatchEvent(new PointerEvent('pointerdown', { clientX: 220, clientY: 160, pointerId: 1, bubbles: true }));
    fnSvg.dispatchEvent(new PointerEvent('pointermove', { clientX: 260, clientY: 140, pointerId: 1, bubbles: true }));
    fnSvg.dispatchEvent(new PointerEvent('pointermove', { clientX: 300, clientY: 120, pointerId: 1, bubbles: true }));
    fnSvg.dispatchEvent(new PointerEvent('pointerup', { clientX: 300, clientY: 120, pointerId: 1, bubbles: true }));
  }
  const fnSvgAfter = document.querySelector('[data-widget="funcion"] svg');
  report.seqFuncionSvgSameNode = Boolean(fnSvg && fnSvg === fnSvgAfter && fnSvg.isConnected);

  return report;
})()`);

console.log(
  "Resultados de interacción en sucesiones.html:",
  JSON.stringify(interactionResults, null, 2),
);

await client.send("Page.navigate", {
  url: `http://127.0.0.1:${PORT}/valor-absoluto.html`,
});
await new Promise((r) => setTimeout(r, 1200));

const absResults = await client.eval(`(async () => {
  // Cambiar a vista continua para que todos los widgets tengan layout visible y podamos probar arrastre
  const modeToggle = document.getElementById('seq-mode-toggle');
  if (modeToggle) modeToggle.click();
  await new Promise((r) => setTimeout(r, 100));

  const widgets = Array.from(document.querySelectorAll('[data-widget]'));
  const populatedWidgets = widgets.filter((el) => el.children.length > 0).map((el) => el.dataset.widget);

  const checks = Array.from(document.querySelectorAll('[data-check]'));
  const populatedChecks = checks.filter((el) => el.children.length > 0).map((el) => el.dataset.check);

  // 1. Verificar que TODOS los <input type="range"> en los 10 widgets mantienen la misma referencia DOM durante múltiples eventos input
  const rangeInputs = Array.from(document.querySelectorAll('input[type="range"]'));
  let allSlidersSameNodeReference = rangeInputs.length >= 15;
  const sliderDetails = [];

  for (const input of rangeInputs) {
    const widgetHost = input.closest('[data-widget]')?.dataset?.widget || 'other';
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const step = parseFloat(input.step) || 0.5;
    const refBefore = input;

    for (let i = 1; i <= 4; i++) {
      let nextV = min + i * step;
      if (Math.abs(nextV) < 1e-6 && widgetHost !== 'distancia-1d') nextV += step;
      nextV = Math.min(max, Math.max(min, nextV));
      input.value = String(nextV);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      if (!input.isConnected || input !== refBefore) {
        allSlidersSameNodeReference = false;
      }
    }
    sliderDetails.push({ widget: widgetHost, connected: input.isConnected });
  }

  // 2. Verificar arrastre continuo pointerdown -> pointermove -> pointerup sobre SVGs interactivos
  const svgTargets = [
    '[data-widget="distancia-1d"] svg',
    '[data-widget="espejo-cartesiano"] svg',
    '[data-widget="traslacion-vh"] svg',
    '[data-widget="escalado-rama"] svg',
    '[data-widget="constructor-v"] svg',
    '[data-widget="desarmador-barras"] svg',
    '[data-widget="radiografia-abs"] svg',
    '[data-widget="aduana-partes"] svg',
    '[data-widget="escalonada-paso"] svg',
  ];

  let allSvgsSameNodeReference = true;
  for (const sel of svgTargets) {
    const svg = document.querySelector(sel);
    if (!svg) {
      allSvgsSameNodeReference = false;
      continue;
    }
    const rect = svg.getBoundingClientRect();
    const startX = rect.left + rect.width * 0.5;
    const startY = rect.top + rect.height * 0.5;
    svg.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, clientY: startY, pointerId: 1, bubbles: true }));
    svg.dispatchEvent(new PointerEvent('pointermove', { clientX: startX + 35, clientY: startY - 25, pointerId: 1, bubbles: true }));
    svg.dispatchEvent(new PointerEvent('pointermove', { clientX: startX + 70, clientY: startY - 50, pointerId: 1, bubbles: true }));
    svg.dispatchEvent(new PointerEvent('pointerup', { clientX: startX + 70, clientY: startY - 50, pointerId: 1, bubbles: true }));

    const svgAfter = document.querySelector(sel);
    if (svg !== svgAfter || !svg.isConnected) {
      allSvgsSameNodeReference = false;
    }
  }

  // 3. Probar botones de VN trigger (tanto explicación principal como repaso básico secX-basico y duda sec-1)
  const mainTriggerBtns = document.querySelectorAll('.vn-trigger[data-vn-script]');
  const basicTriggerBtns = document.querySelectorAll('.vn-trigger--base[data-vn-script$="-basico"]');
  const doubtBtn = document.querySelector('.seq-doubt-btn[data-vn-script="sec1-duda-distancia"]');
  let doubtBtnWorks = false;
  if (doubtBtn) {
    doubtBtn.click();
    await new Promise((r) => setTimeout(r, 100));
    const tag = document.querySelector('.vn-tag');
    if (tag && tag.textContent.includes('dilema')) doubtBtnWorks = true;
    const vnClose = document.querySelector('.vn-close');
    if (vnClose) vnClose.click();
    await new Promise((r) => setTimeout(r, 60));
  }

  const vertexBtn = document.querySelector('.seq-doubt-btn[data-vn-script="sec3-que-es-vertice"]');
  let vertexBtnWorks = false;
  if (vertexBtn) {
    vertexBtn.click();
    await new Promise((r) => setTimeout(r, 100));
    const tag = document.querySelector('.vn-tag');
    if (tag && tag.textContent.includes('vértice')) vertexBtnWorks = true;
    const vnClose = document.querySelector('.vn-close');
    if (vnClose) vnClose.click();
    await new Promise((r) => setTimeout(r, 60));
  }

  const sec7HelpBtn = document.querySelector('.seq-doubt-btn[data-vn-script="sec7-ayuda-analisis"]');
  let sec7HelpBtnWorks = false;
  if (sec7HelpBtn) {
    sec7HelpBtn.click();
    await new Promise((r) => setTimeout(r, 100));
    const tag = document.querySelector('.vn-tag');
    if (tag && tag.textContent.includes('rescate')) sec7HelpBtnWorks = true;
    const vnClose = document.querySelector('.vn-close');
    if (vnClose) vnClose.click();
    await new Promise((r) => setTimeout(r, 60));
  }

  // 3b. Probar explicación de Alaska en sec7-q2 (tanto por botón, como al fallar >1 vez y al completar)
  const sec7Block = document.querySelector('[data-section="sec-7"]');
  const sec7Cards = sec7Block ? sec7Block.querySelectorAll('.seq-check__card') : [];
  const sec7Q2Card = sec7Cards[1];
  let sec7Q2ExplanationWorks = false;
  let chipWorks = false;
  let failStreakWorks = false;
  let successWorks = false;
  if (sec7Q2Card) {
    const chipAlaska = sec7Q2Card.querySelector('.chip--alaska');
    if (chipAlaska) {
      chipAlaska.click();
      await new Promise((r) => setTimeout(r, 80));
      const tag = document.querySelector('.vn-tag');
      if (tag && (tag.textContent.includes('signo') || tag.textContent.includes('Frená') || tag.textContent.includes('Ceros'))) {
        chipWorks = true;
      }
      const vnClose = document.querySelector('.vn-close');
      if (vnClose) vnClose.click();
      await new Promise((r) => setTimeout(r, 50));
    }

    // Probar fallar más de 1 vez
    const inputs = sec7Q2Card.querySelectorAll('input');
    const btnCheck = sec7Q2Card.querySelector('button.btn--check');
    if (inputs.length === 2 && btnCheck) {
      inputs[0].value = '1';
      inputs[1].value = '2';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      btnCheck.click(); // Intento 1 fallido
      await new Promise((r) => setTimeout(r, 50));
      const vnClose1 = document.querySelector('.vn-close');
      if (vnClose1) vnClose1.click();
      await new Promise((r) => setTimeout(r, 50));

      btnCheck.click(); // Intento 2 fallido (failCount > 1)
      await new Promise((r) => setTimeout(r, 80));
      const tagFail = document.querySelector('.vn-tag');
      if (tagFail && (tagFail.textContent.includes('signo') || tagFail.textContent.includes('Frená'))) {
        failStreakWorks = true;
      }
      const vnClose2 = document.querySelector('.vn-close');
      if (vnClose2) vnClose2.click();
      await new Promise((r) => setTimeout(r, 50));

      // Probar completar correctamente (x1 = 0, x2 = 6)
      const sec7Q2CardUpdated = document.querySelector('[data-section="sec-7"]').querySelectorAll('.seq-check__card')[1];
      const freshInputs = sec7Q2CardUpdated.querySelectorAll('input');
      const freshBtnCheck = sec7Q2CardUpdated.querySelector('button.btn--check');
      freshInputs[0].value = '0';
      freshInputs[1].value = '6';
      freshInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      freshInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      freshBtnCheck.click(); // Intento exitoso
      await new Promise((r) => setTimeout(r, 80));
      const tagSuccess = document.querySelector('.vn-tag');
      const resolvedCard = document.querySelector('[data-section="sec-7"]').querySelectorAll('.seq-check__card')[1];
      const isCardResolved = resolvedCard.classList.contains('is-resolved');
      if (tagSuccess && (tagSuccess.textContent.includes('Ceros') || tagSuccess.textContent.includes('truco')) && isCardResolved) {
        successWorks = true;
      }
      const vnClose3 = document.querySelector('.vn-close');
      if (vnClose3) vnClose3.click();
      await new Promise((r) => setTimeout(r, 50));

      sec7Q2ExplanationWorks = Boolean(chipWorks && failStreakWorks && successWorks);
    }
  }

  const firstBasicBtn = basicTriggerBtns[0];
  if (firstBasicBtn) firstBasicBtn.click();
  await new Promise((r) => setTimeout(r, 100));
  const vnOverlayActive = Boolean(document.querySelector('.vn-hud:not([hidden])'));
  const vnTagSvgPresent = Boolean(document.querySelector('.vn-tag svg.chalk-icon'));
  const vnCloseBtn = document.querySelector('.vn-close');
  if (vnCloseBtn) vnCloseBtn.click();

  // 4. Probar cambio de pestaña en Retos al Escudo Deflector V y persistencia de sliders del Boss
  const retoTabs = Array.from(document.querySelectorAll('[data-widget="retos-abs"] button.chip'));
  const bossTab = retoTabs.find((b) => b.textContent.includes('Escudo Deflector'));
  if (bossTab) bossTab.click();
  await new Promise((r) => setTimeout(r, 100));
  const bossBoardSvg = document.querySelector('[data-widget="retos-abs"] svg.abs-board__svg');
  const bossSliders = Array.from(document.querySelectorAll('[data-widget="retos-abs"] input[type="range"]'));
  let bossSlidersPersistent = bossSliders.length === 3;
  for (const sInput of bossSliders) {
    sInput.value = '1';
    sInput.dispatchEvent(new Event('input', { bubbles: true }));
    if (!sInput.isConnected) bossSlidersPersistent = false;
  }
  const bossBoardMounted = Boolean(bossBoardSvg && bossBoardSvg.isConnected && bossSlidersPersistent);

  // 5. Probar respuesta en sec-1 (número)
  const sec1Input = document.querySelector('[data-check="sec-1"] input[type="number"]');
  const sec1Btn = document.querySelector('[data-check="sec-1"] button.btn--check');
  if (sec1Input && sec1Btn) {
    sec1Input.value = '9';
    sec1Btn.click();
  }
  const sec1FirstCardResolved = Boolean(document.querySelector('[data-check="sec-1"] .seq-check__card.is-resolved'));

  // 6. Probar controles de teclado sobre los nodos SVG enfocados (vértice y láser)
  const sec7VertexHandle = document.querySelector('[data-widget="radiografia-abs"] [data-handle="vertex"]');
  const sec7BeforeLabel = sec7VertexHandle ? sec7VertexHandle.getAttribute('aria-label') : '';
  if (sec7VertexHandle) {
    sec7VertexHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  }
  const sec7VertexAfter = document.querySelector('[data-widget="radiografia-abs"] [data-handle="vertex"]');
  const sec7AfterLabel = sec7VertexAfter ? sec7VertexAfter.getAttribute('aria-label') : '';
  const keyboardVertexWorks = Boolean(sec7BeforeLabel && sec7AfterLabel && sec7BeforeLabel !== sec7AfterLabel);

  const sec7LaserHandle = document.querySelector('[data-widget="radiografia-abs"] [data-handle="laser"]');
  const laserBefore = sec7LaserHandle ? sec7LaserHandle.getAttribute('aria-valuenow') : '';
  if (sec7LaserHandle) {
    sec7LaserHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
  }
  const sec7LaserAfter = document.querySelector('[data-widget="radiografia-abs"] [data-handle="laser"]');
  const laserAfter = sec7LaserAfter ? sec7LaserAfter.getAttribute('aria-valuenow') : '';
  const keyboardLaserWorks = Boolean(laserBefore && laserAfter && laserBefore !== laserAfter);

  // 7. Probar pizarrón borrador flotante (lápiz y goma con trazo inteligente)
  const spToggle = document.querySelector('.scratchpad-toggle-btn');
  const spCanvas = document.querySelector('.scratchpad-canvas');
  let scratchpadWorks = false;
  if (spToggle && spCanvas) {
    spToggle.click();
    await new Promise((r) => setTimeout(r, 60));
    const spToolbar = document.querySelector('.scratchpad-toolbar');
    const toolbarOpen = spToolbar && !spToolbar.hidden;
    const canvasActive = spCanvas.classList.contains('is-active');

    // Simular un trazo inteligente de lápiz
    spCanvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 100, bubbles: true }));
    spCanvas.dispatchEvent(new PointerEvent('pointermove', { clientX: 120, clientY: 110, bubbles: true }));
    spCanvas.dispatchEvent(new PointerEvent('pointermove', { clientX: 140, clientY: 130, bubbles: true }));
    spCanvas.dispatchEvent(new PointerEvent('pointerup', { clientX: 140, clientY: 130, bubbles: true }));

    // Cambiar a goma
    const eraserBtn = document.querySelector('.scratchpad-btn[title*="Goma"]');
    if (eraserBtn) eraserBtn.click();
    const isEraser = spCanvas.classList.contains('is-eraser');

    // Deshacer
    const undoBtn = document.querySelector('.scratchpad-btn[title*="Deshacer"]');
    if (undoBtn) undoBtn.click();

    // Cerrar barra
    spToggle.click();
    scratchpadWorks = Boolean(toolbarOpen && canvasActive && isEraser);
  }

  return {
    totalWidgets: widgets.length,
    populatedWidgetsCount: populatedWidgets.length,
    totalChecks: checks.length,
    populatedChecksCount: populatedChecks.length,
    rangeInputsCount: rangeInputs.length,
    allSlidersSameNodeReference,
    allSvgsSameNodeReference,
    mainTriggerBtnsCount: mainTriggerBtns.length,
    basicTriggerBtnsCount: basicTriggerBtns.length,
    doubtBtnWorks,
    vertexBtnWorks,
    sec7HelpBtnWorks,
    sec7Q2ExplanationWorks,
    scratchpadWorks,
    vnOverlayActive,
    vnTagSvgPresent,
    bossBoardMounted,
    sec1FirstCardResolved,
    keyboardVertexWorks,
    keyboardLaserWorks,
  };
})()`);

console.log(
  "Resultados de interacción en valor-absoluto.html:",
  JSON.stringify(absResults, null, 2),
);

const powRadConsoleErrors = [];
client.on("Runtime.consoleAPICalled", (params) => {
  if (params.type === "error")
    powRadConsoleErrors.push(
      params.args?.map((item) => item.value || item.description).join(" "),
    );
});
client.on("Runtime.exceptionThrown", (params) => {
  powRadConsoleErrors.push(
    params.exceptionDetails?.exception?.description ||
      params.exceptionDetails?.text ||
      "Exception",
  );
});
await client.send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await client.send("Page.navigate", {
  url: `http://127.0.0.1:${PORT}/potencias-raices.html`,
});
await new Promise((r) => setTimeout(r, 1100));
const powRadResults = await client.eval(`(async () => {
  const sections = [...document.querySelectorAll('.pr-section')];
  const widgets = [...document.querySelectorAll('[data-widget]')];
  const ranges = [...document.querySelectorAll('[data-widget] input[type="range"]')];
  let stable = ranges.length > 0;
  for (const range of ranges) {
    const ref = range;
    for (const value of [Number(range.min), Number(range.max), Number(range.min)]) {
      range.value = String(value);
      range.dispatchEvent(new Event('input', { bubbles: true }));
      stable &&= range.isConnected && range === ref && [...range.closest('[data-widget]').querySelectorAll('input[type="range"]')].includes(ref);
    }
  }
  const interactiveWidgetSvgs = widgets.every((host) => {
    const svg = host.querySelector('svg');
    return Boolean(svg && host.querySelector('input,select,button') && svg.querySelector('path,circle,rect,text'));
  });
  const checkBlocks = [...document.querySelectorAll('.pr-section .pr-check')];
  const allCheckAffordances = checkBlocks.length === 10 && checkBlocks.every((block) =>
    block.querySelectorAll('button').length >= 3 && block.querySelector('.pr-check__hint') && block.querySelector('.pr-check__solution')
  );
  const firstCheck = document.querySelector('#sec-1 .pr-check__item');
  const previewInput = firstCheck?.querySelector('input');
  const preview = firstCheck?.querySelector('.pr-check__preview');
  if (previewInput && preview) {
    previewInput.value = 'sqrt(36)';
    previewInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const livePreviewWorks = Boolean(preview && !preview.textContent.endsWith('—'));
  const hintButton = firstCheck?.querySelector('.pr-check__actions button:nth-child(2)');
  for (let i = 0; i < 3; i++) hintButton?.click();
  const progressiveHintsWork = Boolean(
    firstCheck?.querySelector('.pr-check__hint')?.textContent.includes('Pista 3/3')
  );
  firstCheck?.querySelector('.pr-check__actions button:nth-child(3)')?.click();
  const solution = firstCheck?.querySelector('.pr-check__solution');
  const stepByStepSolutionWorks = Boolean(
    solution && !solution.hidden && solution.querySelectorAll('ol li').length >= 3
  );
  const cancellationWidget = document.querySelector('[data-widget="neutro-cancelacion"]');
  const factorButton = cancellationWidget?.querySelector('g[role="button"]');
  factorButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const factorPairingWorks = Boolean(
    cancellationWidget?.querySelector('.pr-readout')?.textContent.includes('1 parejas')
  );
  const factorTree = document.querySelector('[data-widget="arbol-factores"] .pr-board-svg');
  const factorTreeDrawn = Boolean(
    factorTree?.querySelectorAll('circle[visibility="visible"]').length > 1 &&
    factorTree?.querySelectorAll('path[visibility="visible"]').length > 0
  );
  const worlds = document.querySelector('[data-widget="dos-mundos"]');
  const worldsRange = worlds?.querySelector('input[type="range"]');
  if (worldsRange) {
    worldsRange.value = worldsRange.max;
    worldsRange.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const additiveArcsDrawn = Boolean(
    worlds?.querySelectorAll('svg path[d*="Q"][visibility="visible"]').length >= 5
  );
  const negativeTape = document.querySelector('[data-widget="cinta-negativa"]');
  const negativeRange = negativeTape?.querySelector('input[type="range"]');
  if (negativeRange) {
    negativeRange.value = negativeRange.min;
    negativeRange.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const negativeZoomWorks = negativeTape?.querySelector('svg circle[visibility="visible"]');
  const answer = document.querySelector('#sec-1 .pr-check__item input');
  const submit = document.querySelector('#sec-1 .pr-check__item .pr-check__actions button:first-child');
  if (answer && submit) { answer.value = '12'; submit.click(); }
  const stored = JSON.parse(localStorage.getItem('potencias_raices:progreso:v1') || '{}');
  const explain = document.querySelector('#sec-4 [data-tutor="why"]');
  if (explain) explain.click();
  await new Promise((resolve) => setTimeout(resolve, 180));
  const tutorHud = document.querySelector('.vn-hud[aria-hidden="false"]');
  const tutorImage = document.querySelector('.vn-hud[aria-hidden="false"] .vn-sprite');
  const tutorImageValid = Boolean(tutorImage?.naturalWidth > 0);
  document.querySelector('.vn-ctrl-btn--min')?.click();
  const fab = document.querySelector('.vn-fab');
  const fabAvatar = fab?.querySelector('.vn-fab__avatar');
  const persistentChibiFab = Boolean(
    fab &&
    getComputedStyle(fab).display !== 'none' &&
    fabAvatar?.naturalWidth > 0,
  );
  const closeControlRemoved = !document.querySelector('.vn-ctrl-btn--close');
  const gloss = document.querySelector('#sec-1 [data-gloss]');
  if (gloss) gloss.click();
  await new Promise((resolve) => setTimeout(resolve, 180));
  const glossHud = document.querySelector('.vn-hud[aria-hidden="false"]');
  const glossImage = document.querySelector('.vn-hud[aria-hidden="false"] .vn-sprite');
  const glossImageValid = Boolean(glossImage?.naturalWidth > 0);
  document.querySelector('.vn-ctrl-btn--min')?.click();
  return {
    sections: sections.length,
    widgets: widgets.length,
    checks: document.querySelectorAll('.pr-check__item').length,
    tutorButtons: document.querySelectorAll('.vn-trigger[data-tutor]').length,
    glossaryTerms: document.querySelectorAll('span.gloss-term[data-gloss]').length,
    interactiveWidgetSvgs,
    checkBlocks: checkBlocks.length,
    allCheckAffordances,
    livePreviewWorks,
    progressiveHintsWork,
    stepByStepSolutionWorks,
    factorPairingWorks,
    factorTreeDrawn,
    additiveArcsDrawn,
    negativeZoomWorks: Boolean(negativeZoomWorks),
    stableControls: stable,
    progressSaved: Boolean(stored['sec-1:0']),
    practiceTabs: document.querySelectorAll('.pr-chapter-tab').length,
    practicePanels: document.querySelectorAll('.pr-challenge-panel').length,
    trainerPrompt: Boolean(document.querySelector('.pr-challenge__prompt')),
    tutorHud: Boolean(tutorHud),
    tutorImageValid,
    persistentChibiFab,
    closeControlRemoved,
    glossHud: Boolean(glossHud),
    glossImageValid,
    hasNavLink: Boolean(document.querySelector('.site-nav a[href="potencias-raices.html"]')),
    splitWorkbench: getComputedStyle(document.querySelector('#sec-1 .pr-workbench')).gridTemplateColumns,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  };
})()`);

const potenciasWidths = [];
for (const width of [320, 375, 768, 1024, 1440]) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: width < 600 ? 2 : 1,
    mobile: width < 600,
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
  potenciasWidths.push(
    await client.eval(
      `(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }))()`,
    ),
  );
}
powRadResults.viewportWidths = potenciasWidths;
powRadResults.viewportOverflowFree = potenciasWidths.every(
  (item) => !item.overflow,
);
powRadResults.consoleErrors = powRadConsoleErrors;
console.log(
  "Resultados de interacción en potencias-raices.html:",
  JSON.stringify(powRadResults, null, 2),
);

const expConsoleErrors = [];
client.on("Runtime.consoleAPICalled", (params) => {
  if (params.type === "error")
    expConsoleErrors.push(
      params.args?.map((item) => item.value || item.description).join(" "),
    );
});
client.on("Runtime.exceptionThrown", (params) => {
  expConsoleErrors.push(
    params.exceptionDetails?.exception?.description ||
      params.exceptionDetails?.text ||
      "Exception",
  );
});
await client.send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await client.send("Page.navigate", {
  url: `http://127.0.0.1:${PORT}/exponenciales.html`,
});
await new Promise((r) => setTimeout(r, 1100));
const expResults = await client.eval(`(async () => {
  const sections = [...document.querySelectorAll('.exp-section')];
  const widgets = [...document.querySelectorAll('[data-widget]')];
  const ranges = [...document.querySelectorAll('[data-widget] input[type="range"]')];
  let stable = ranges.length > 0;
  for (const range of ranges) {
    const ref = range;
    for (const value of [Number(range.min), Number(range.max), Number(range.min)]) {
      range.value = String(value);
      range.dispatchEvent(new Event('input', { bubbles: true }));
      stable &&= range.isConnected && range === ref && [...range.closest('[data-widget]').querySelectorAll('input[type="range"]')].includes(ref);
    }
  }
  const interactiveWidgetSvgs = widgets.every((host) => {
    const svg = host.querySelector('svg');
    return Boolean(svg && host.querySelector('input,select,button') && svg.querySelector('path,circle,rect,text'));
  });
  const checkBlocks = [...document.querySelectorAll('.exp-section [data-check]')];
  const allCheckAffordances = checkBlocks.length === 10 && checkBlocks.every((block) =>
    block.querySelectorAll('button').length >= 3 && block.querySelector('.exp-check__hint, .seq-check__hint') && block.querySelector('.exp-check__solution, .seq-check__solution')
  );

  const numberCheck = document.querySelectorAll('#sec-1 .exp-check__item')?.[1];
  const previewInput = numberCheck?.querySelector('input');
  const preview = numberCheck?.querySelector('.exp-check__preview');
  if (previewInput && preview) {
    previewInput.value = '3';
    previewInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const livePreviewWorks = Boolean(preview && preview.textContent.includes('3'));

  const firstCheck = document.querySelector('#sec-1 .exp-check__item');
  const hintBtn = [...(firstCheck?.querySelectorAll('button') || [])].find((b) => b.textContent.includes('Pista'));
  for (let i = 0; i < 3; i++) hintBtn?.click();
  const hintEl = firstCheck?.querySelector('.exp-check__hint, .seq-check__hint');
  const progressiveHintsWork = Boolean(
    hintEl && !hintEl.hidden && (hintEl.textContent.includes('Pista 3/3') || hintEl.textContent.includes('Pista 3 de 3'))
  );

  const showBtn = [...(firstCheck?.querySelectorAll('button') || [])].find((b) => b.textContent.includes('solución'));
  showBtn?.click();
  const solution = firstCheck?.querySelector('.exp-check__solution, .seq-check__solution');
  const stepByStepSolutionWorks = Boolean(
    solution && !solution.hidden && solution.querySelectorAll('ol li').length >= 3
  );

  const balanza = document.querySelector('[data-widget="balanza-ecuaciones"]');
  const eqChips = balanza?.querySelectorAll('.balanza-eq-chips .chip');
  const eqChipsExist = Boolean(eqChips && eqChips.length >= 2);
  if (eqChips && eqChips.length > 1) {
    eqChips[1].click();
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
  const eqChipSwitchWorks = Boolean(
    balanza?.querySelector('.exp-readout')?.textContent.includes('4 · 2ˣ = 8ˣ') ||
    balanza?.querySelector('svg text')?.textContent.includes('4')
  );

  const firstChoice = firstCheck?.querySelector('.exp-choice button');
  const reviewBtn = [...(firstCheck?.querySelectorAll('button') || [])].find((b) => b.textContent.includes('Revisar'));
  if (firstChoice && reviewBtn) {
    firstChoice.click();
    reviewBtn.click();
  }
  const stored = JSON.parse(localStorage.getItem('exponenciales:progreso:v1') || '{}');
  const progressSaved = Boolean(stored['sec-1:0']);

  const explain = document.querySelector('#sec-1 [data-tutor="why"]');
  if (explain) explain.click();
  await new Promise((resolve) => setTimeout(resolve, 180));
  const tutorHud = document.querySelector('.vn-hud[aria-hidden="false"]');
  const tutorImage = document.querySelector('.vn-hud[aria-hidden="false"] .vn-sprite');
  const tutorImageValid = Boolean(tutorImage?.naturalWidth > 0);
  document.querySelector('.vn-ctrl-btn--min')?.click();
  const fab = document.querySelector('.vn-fab');
  const fabAvatar = fab?.querySelector('.vn-fab__avatar');
  const persistentChibiFab = Boolean(
    fab &&
    getComputedStyle(fab).display !== 'none' &&
    fabAvatar?.naturalWidth > 0,
  );
  const closeControlRemoved = !document.querySelector('.vn-ctrl-btn--close');

  const gloss = document.querySelector('#sec-1 [data-gloss]');
  if (gloss) gloss.click();
  await new Promise((resolve) => setTimeout(resolve, 180));
  const glossHud = document.querySelector('.vn-hud[aria-hidden="false"]');
  const glossImage = document.querySelector('.vn-hud[aria-hidden="false"] .vn-sprite');
  const glossImageValid = Boolean(glossImage?.naturalWidth > 0);
  document.querySelector('.vn-ctrl-btn--min')?.click();

  return {
    sections: sections.length,
    widgets: widgets.length,
    checks: document.querySelectorAll('.seq-section:not(#sec-retos) .exp-check__item').length,
    tutorButtons: document.querySelectorAll('.vn-trigger[data-tutor]').length,
    glossaryTerms: document.querySelectorAll('span.gloss-term[data-gloss]').length,
    interactiveWidgetSvgs,
    checkBlocks: checkBlocks.length,
    allCheckAffordances,
    livePreviewWorks,
    progressiveHintsWork,
    stepByStepSolutionWorks,
    eqChipsExist,
    eqChipSwitchWorks,
    progressSaved,
    stableControls: stable,
    practiceTabs: document.querySelectorAll('.exp-chapter-tab').length,
    practicePanels: document.querySelectorAll('.exp-challenge-panel').length,
    trainerPrompt: Boolean(document.querySelector('.exp-challenge__prompt')),
    trapsCount: document.querySelectorAll('.exp-trap').length,
    tutorHud: Boolean(tutorHud),
    tutorImageValid,
    persistentChibiFab,
    closeControlRemoved,
    glossHud: Boolean(glossHud),
    glossImageValid,
    hasNavLink: Boolean(document.querySelector('.site-nav a[href="exponenciales.html"]')),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  };
})()`);

const expWidths = [];
for (const width of [320, 375, 768, 1024, 1440]) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: width < 600 ? 2 : 1,
    mobile: width < 600,
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
  expWidths.push(
    await client.eval(
      `(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }))()`,
    ),
  );
}
expResults.viewportWidths = expWidths;
expResults.viewportOverflowFree = expWidths.every(
  (item) => !item.overflow,
);
expResults.consoleErrors = expConsoleErrors;
console.log(
  "Resultados de interacción en exponenciales.html:",
  JSON.stringify(expResults, null, 2),
);

const allOk =
  interactionResults.sliderThrottlingWorks &&
  interactionResults.soundDisabledWorks &&
  interactionResults.audioCallsPassed &&
  interactionResults.vnReactTriggered &&
  interactionResults.vnTagHasSvgIcon &&
  interactionResults.seqSlidersPersistent &&
  interactionResults.seqFuncionSvgSameNode &&
  absResults.populatedWidgetsCount === 11 &&
  absResults.populatedChecksCount === 10 &&
  absResults.allSlidersSameNodeReference &&
  absResults.allSvgsSameNodeReference &&
  absResults.mainTriggerBtnsCount === 20 &&
  absResults.basicTriggerBtnsCount === 10 &&
  absResults.doubtBtnWorks &&
  absResults.vertexBtnWorks &&
  absResults.sec7HelpBtnWorks &&
  absResults.sec7Q2ExplanationWorks &&
  absResults.scratchpadWorks &&
  absResults.vnOverlayActive &&
  absResults.vnTagSvgPresent &&
  absResults.bossBoardMounted &&
  absResults.sec1FirstCardResolved &&
  absResults.keyboardVertexWorks &&
  absResults.keyboardLaserWorks;

const powRadOk =
  powRadResults.sections === 10 &&
  powRadResults.widgets === 10 &&
  powRadResults.checks === 30 &&
  powRadResults.tutorButtons === 20 &&
  powRadResults.glossaryTerms >= 20 &&
  powRadResults.stableControls &&
  powRadResults.interactiveWidgetSvgs &&
  powRadResults.checkBlocks === 10 &&
  powRadResults.allCheckAffordances &&
  powRadResults.livePreviewWorks &&
  powRadResults.progressiveHintsWork &&
  powRadResults.stepByStepSolutionWorks &&
  powRadResults.factorPairingWorks &&
  powRadResults.factorTreeDrawn &&
  powRadResults.additiveArcsDrawn &&
  powRadResults.negativeZoomWorks &&
  powRadResults.progressSaved &&
  powRadResults.practiceTabs === 2 &&
  powRadResults.practicePanels === 2 &&
  powRadResults.trainerPrompt &&
  powRadResults.hasNavLink &&
  powRadResults.tutorHud &&
  powRadResults.tutorImageValid &&
  powRadResults.persistentChibiFab &&
  powRadResults.closeControlRemoved &&
  powRadResults.glossHud &&
  powRadResults.glossImageValid &&
  powRadResults.viewportOverflowFree &&
  powRadResults.consoleErrors.length === 0 &&
  !powRadResults.overflow;

const expOk =
  expResults.sections === 10 &&
  expResults.widgets === 10 &&
  expResults.checks === 30 &&
  expResults.tutorButtons === 20 &&
  expResults.glossaryTerms >= 10 &&
  expResults.stableControls &&
  expResults.interactiveWidgetSvgs &&
  expResults.checkBlocks === 10 &&
  expResults.allCheckAffordances &&
  expResults.livePreviewWorks &&
  expResults.progressiveHintsWork &&
  expResults.stepByStepSolutionWorks &&
  expResults.eqChipsExist &&
  expResults.eqChipSwitchWorks &&
  expResults.progressSaved &&
  expResults.practiceTabs === 2 &&
  expResults.practicePanels === 2 &&
  expResults.trainerPrompt &&
  expResults.trapsCount === 5 &&
  expResults.hasNavLink &&
  expResults.tutorHud &&
  expResults.tutorImageValid &&
  expResults.persistentChibiFab &&
  expResults.closeControlRemoved &&
  expResults.glossHud &&
  expResults.glossImageValid &&
  expResults.viewportOverflowFree &&
  expResults.consoleErrors.length === 0 &&
  !expResults.overflow;

const quadConsoleErrors = [];
client.on("Runtime.consoleAPICalled", (params) => {
  if (params.type === "error")
    quadConsoleErrors.push(
      params.args?.map((item) => item.value || item.description).join(" "),
    );
});
client.on("Runtime.exceptionThrown", (params) => {
  quadConsoleErrors.push(
    params.exceptionDetails?.exception?.description ||
      params.exceptionDetails?.text ||
      "Exception",
  );
});
await client.send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await client.send("Page.navigate", {
  url: `http://127.0.0.1:${PORT}/cuadraticas.html`,
});
await new Promise((r) => setTimeout(r, 1100));
const quadResults = await client.eval(`(async () => {
  const sections = [...document.querySelectorAll('.seq-section[id^="sec-"]:not(#sec-retos):not(#sec-repaso)')];
  const widgets = [...document.querySelectorAll('[data-widget]')];
  const ranges = [...document.querySelectorAll('[data-widget] input[type="range"]')];
  let stable = ranges.length > 0;
  let allSvgsSameNodeReference = widgets.length === 10;
  for (const host of widgets) {
    const svgBefore = host.querySelector('svg');
    const hostRanges = [...host.querySelectorAll('input[type="range"]')];
    for (const range of hostRanges) {
      const ref = range;
      for (const value of [Number(range.min), Number(range.max), Number(range.min)]) {
        range.value = String(value);
        range.dispatchEvent(new Event('input', { bubbles: true }));
        stable &&= range.isConnected && range === ref && [...host.querySelectorAll('input[type="range"]')].includes(ref);
      }
    }
    const svgAfter = host.querySelector('svg');
    allSvgsSameNodeReference &&= Boolean(svgBefore && svgAfter && svgBefore === svgAfter && svgAfter.isConnected);
  }
  const interactiveWidgetSvgs = widgets.every((host) => {
    const svg = host.querySelector('svg.quad-board-svg');
    return Boolean(svg && host.querySelector('input,select,button') && svg.querySelector('path,circle,rect,text,line'));
  });
  const checkBlocks = [...document.querySelectorAll('.seq-section [data-check]')];
  const allCheckAffordances = checkBlocks.length === 10 && checkBlocks.every((block) =>
    block.querySelectorAll('.quad-check-card').length === 3 &&
    block.querySelectorAll('button').length >= 3 &&
    block.querySelector('.quad-check-hints') &&
    block.querySelector('.pr-check-feedback')
  );

  const firstCheck = document.querySelector('#sec-area-binomios .quad-check-card');
  const hintBtn = firstCheck?.querySelector('.quad-hint-btn');
  for (let i = 0; i < 3; i++) hintBtn?.click();
  const hintEl = firstCheck?.querySelector('.quad-check-hints');
  const progressiveHintsWork = Boolean(
    hintEl && !hintEl.hidden && hintEl.querySelectorAll('.quad-hint-item').length === 3
  );

  const inputCheck = [...document.querySelectorAll('#sec-area-binomios .quad-check-card')].find(c => c.querySelector('input.pr-check-input'));
  const checkInputEl = inputCheck?.querySelector('input.pr-check-input');
  const checkSubmitBtn = inputCheck?.querySelector('.pr-check-submit');
  if (checkInputEl && checkSubmitBtn) {
    checkInputEl.value = 'x^2 + 3x - 28';
    checkSubmitBtn.click();
  }
  const livePreviewWorks = Boolean(inputCheck?.classList.contains('is-solved'));
  const stepByStepSolutionWorks = Boolean(
    inputCheck?.querySelector('.pr-check-feedback.is-ok')?.textContent.length > 10
  );
  const quadProgressStored = JSON.parse(localStorage.getItem('cuadraticas:progreso:v1') || '{}');
  const progressSaved = Boolean(quadProgressStored['sec1-q1']);

  // Verify two-stage prediction in createPredictBox
  const firstPredictBox = document.querySelector('#sec-area-binomios .quad-predict-box');
  const firstPredictOpt = firstPredictBox?.querySelector('.quad-predict-options button');
  firstPredictOpt?.click();
  const predictCommittedText = firstPredictBox?.querySelector('.quad-predict-feedback')?.textContent || '';
  const predictCommittedWorks = predictCommittedText.includes('Hipótesis registrada');
  const verifyPredictBtn = firstPredictBox?.querySelector('.quad-predict-verify-btn');
  verifyPredictBtn?.click();
  const predictVerifiedText = firstPredictBox?.querySelector('.quad-predict-feedback')?.textContent || '';
  const predictVerifiedWorks = !predictVerifiedText.includes('Hipótesis registrada') && predictVerifiedText.length > 15;

  // Verify dual clipPaths in interseccion-recta-parabola, 3 handles in factorizada-simetria, 3 scenarios in optimizacion-extremos
  const interWidget = document.querySelector('[data-widget="interseccion-recta-parabola"]');
  const dualClipPathsWork = Boolean(
    interWidget?.querySelector('clipPath#inter-clip-left') &&
    interWidget?.querySelector('clipPath#inter-clip-right')
  );
  const factWidget = document.querySelector('[data-widget="factorizada-simetria"]');
  const thirdPointHandleWorks = (factWidget?.querySelectorAll('svg [role="slider"]').length || 0) === 3;
  const optWidget = document.querySelector('[data-widget="optimizacion-extremos"]');
  const threeOptScenariosWork = (optWidget?.querySelectorAll('.pr-presets button').length || 0) === 3;

  // Verify keyboard ArrowRight on SVG handle preserves focus and does not change active section
  document.querySelector('.seq-sidebar__link[data-sec="sec-canonica-vertice"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 80));
  const canonHandle = document.querySelector('[data-widget="canonica-vertice"] svg [role="slider"]');
  let keyboardSvgHandleWorks = false;
  if (canonHandle) {
    canonHandle.focus();
    const cxBefore = canonHandle.getAttribute('cx');
    canonHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    const cxAfter = canonHandle.getAttribute('cx');
    const secStillActive = document.getElementById('sec-canonica-vertice')?.classList.contains('is-active');
    keyboardSvgHandleWorks = Boolean(cxBefore !== cxAfter && document.activeElement === canonHandle && secStillActive);
  }
  document.querySelector('.seq-sidebar__link[data-sec="sec-area-binomios"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 80));

  const explain = document.querySelector('#sec-area-binomios [data-vn-trigger="sec1-area"]');
  if (explain) explain.click();
  await new Promise((resolve) => setTimeout(resolve, 180));
  const tutorHud = document.querySelector('.vn-hud[aria-hidden="false"]');
  const tutorImage = document.querySelector('.vn-hud[aria-hidden="false"] .vn-sprite');
  const tutorImageValid = Boolean(tutorImage?.naturalWidth > 0);
  document.querySelector('.vn-ctrl-btn--min')?.click();
  const fab = document.querySelector('.vn-fab');
  const fabAvatar = fab?.querySelector('.vn-fab__avatar');
  const persistentChibiFab = Boolean(
    fab &&
    getComputedStyle(fab).display !== 'none' &&
    fabAvatar?.naturalWidth > 0,
  );
  const closeControlRemoved = !document.querySelector('.vn-ctrl-btn--close');

  const gloss = document.querySelector('#sec-area-binomios [data-gloss]');
  if (gloss) gloss.click();
  await new Promise((resolve) => setTimeout(resolve, 180));
  const glossHud = document.querySelector('.vn-hud[aria-hidden="false"]');
  const glossImage = document.querySelector('.vn-hud[aria-hidden="false"] .vn-sprite');
  const glossImageValid = Boolean(glossImage?.naturalWidth > 0);
  document.querySelector('.vn-ctrl-btn--min')?.click();

  return {
    sections: sections.length,
    widgets: widgets.length,
    checks: document.querySelectorAll('.quad-check-card').length,
    tutorButtons: document.querySelectorAll('[data-vn-trigger]').length,
    glossaryTerms: document.querySelectorAll('span.gloss-term[data-gloss]').length,
    interactiveWidgetSvgs,
    allSvgsSameNodeReference,
    checkBlocks: checkBlocks.length,
    allCheckAffordances,
    livePreviewWorks,
    progressiveHintsWork,
    stepByStepSolutionWorks,
    progressSaved,
    predictCommittedWorks,
    predictVerifiedWorks,
    dualClipPathsWork,
    thirdPointHandleWorks,
    threeOptScenariosWork,
    keyboardSvgHandleWorks,
    stableControls: stable,
    practiceTabs: document.querySelectorAll('.quad-retos-tabs button').length,
    practicePanels: document.querySelectorAll('.quad-retos-pane').length,
    trainerPrompt: Boolean(document.querySelector('.quad-reto-prompt')),
    trapsCount: document.querySelectorAll('.quad-retos-pane')[1]?.querySelectorAll('.pr-chip-row button').length || 0,
    tutorHud: Boolean(tutorHud),
    tutorImageValid,
    persistentChibiFab,
    closeControlRemoved,
    glossHud: Boolean(glossHud),
    glossImageValid,
    hasNavLink: Boolean(document.querySelector('.site-nav a[href="cuadraticas.html"]')),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  };
})()`);

const quadWidths = [];
for (const width of [320, 375, 768, 1024, 1440]) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: width < 600 ? 2 : 1,
    mobile: width < 600,
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
  quadWidths.push(
    await client.eval(
      `(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }))()`,
    ),
  );
}
quadResults.viewportWidths = quadWidths;
quadResults.viewportOverflowFree = quadWidths.every(
  (item) => !item.overflow,
);
quadResults.consoleErrors = quadConsoleErrors;
console.log(
  "Resultados de interacción en cuadraticas.html:",
  JSON.stringify(quadResults, null, 2),
);

const quadOk =
  quadResults.sections === 10 &&
  quadResults.widgets === 10 &&
  quadResults.checks === 30 &&
  quadResults.tutorButtons === 20 &&
  quadResults.glossaryTerms >= 12 &&
  quadResults.stableControls &&
  quadResults.interactiveWidgetSvgs &&
  quadResults.allSvgsSameNodeReference &&
  quadResults.checkBlocks === 10 &&
  quadResults.allCheckAffordances &&
  quadResults.livePreviewWorks &&
  quadResults.progressiveHintsWork &&
  quadResults.stepByStepSolutionWorks &&
  quadResults.progressSaved &&
  quadResults.predictCommittedWorks &&
  quadResults.predictVerifiedWorks &&
  quadResults.dualClipPathsWork &&
  quadResults.thirdPointHandleWorks &&
  quadResults.threeOptScenariosWork &&
  quadResults.keyboardSvgHandleWorks &&
  quadResults.practiceTabs === 2 &&
  quadResults.practicePanels === 2 &&
  quadResults.trainerPrompt &&
  quadResults.trapsCount === 5 &&
  quadResults.hasNavLink &&
  quadResults.tutorHud &&
  quadResults.tutorImageValid &&
  quadResults.persistentChibiFab &&
  quadResults.closeControlRemoved &&
  quadResults.glossHud &&
  quadResults.glossImageValid &&
  quadResults.viewportOverflowFree &&
  quadResults.consoleErrors.length === 0 &&
  !quadResults.overflow;

const circConsoleErrors = [];
client.on("Runtime.consoleAPICalled", (params) => {
  if (params.type === "error")
    circConsoleErrors.push(
      params.args?.map((item) => item.value || item.description).join(" "),
    );
});
client.on("Runtime.exceptionThrown", (params) => {
  circConsoleErrors.push(
    params.exceptionDetails?.exception?.description ||
      params.exceptionDetails?.text ||
      "Exception",
  );
});
await client.send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await client.send("Page.navigate", {
  url: `http://127.0.0.1:${PORT}/desigualdades.html`,
});
await new Promise((r) => setTimeout(r, 1000));
const circResults = await client.eval(`(async () => {
  const circSvg = document.getElementById('circuit');
  const nlSvg = document.getElementById('number-line');
  document.getElementById('mode-and')?.click();
  const opA = document.getElementById('op-a');
  const valA = document.getElementById('val-a');
  if (opA) { opA.value = '>'; opA.dispatchEvent(new Event('change', { bubbles: true })); }
  if (valA) { valA.value = '-5'; valA.dispatchEvent(new Event('input', { bubbles: true })); }
  const xs = document.getElementById('x-slider');
  if (xs) { xs.value = '0'; xs.dispatchEvent(new Event('input', { bubbles: true })); }
  const svgsSameNode = Boolean(
    circSvg && document.getElementById('circuit') === circSvg && circSvg.isConnected &&
    nlSvg && document.getElementById('number-line') === nlSvg && nlSvg.isConnected
  );
  const presetBtn = document.querySelector('#presets button');
  presetBtn?.click();
  const retoSel = document.getElementById('reto');
  if (retoSel) { retoSel.value = '0'; retoSel.dispatchEvent(new Event('change', { bubbles: true })); }

  // 2-stage POE
  const poeOpt = document.querySelectorAll('#circ-poe .circ-predict-options button')[1];
  poeOpt?.click();
  const poeCommitted = (document.querySelector('#circ-poe .circ-predict-feedback')?.textContent || '').includes('Hipótesis registrada');
  document.querySelector('#circ-poe .circ-predict-verify-btn')?.click();
  const poeText = document.querySelector('#circ-poe .circ-predict-feedback')?.textContent || '';
  const poeVerified = !poeText.includes('Hipótesis registrada') &&
    poeText.includes('conjunto vacío') &&
    document.getElementById('solution')?.textContent.trim() === '∅';

  // Graduated checks: 3 hints + diagnostic + autonomous solve
  const q1 = document.querySelector('[data-check-id="circ-sec1-q1"]');
  const q1HintBtn = q1?.querySelector('.circ-btn-hint');
  for (let i = 0; i < 3; i++) q1HintBtn?.click();
  const q1HintsWork = (q1?.querySelector('.circ-check__hint')?.textContent || '').includes('Pista 3/3');
  const q1Input = q1?.querySelector('.circ-check__input');
  if (q1Input) {
    q1Input.value = '(-3; 2)';
    q1Input.dispatchEvent(new Event('input', { bubbles: true }));
    q1?.querySelector('.circ-btn-review')?.click();
  }
  const q1DiagFeedback = (q1?.querySelector('.circ-check__feedback')?.textContent || '').includes('paréntesis');

  const q2 = document.querySelector('[data-check-id="circ-sec1-q2"]');
  const q2Input = q2?.querySelector('.circ-check__input');
  if (q2Input) {
    q2Input.value = '(-inf; 4)';
    q2Input.dispatchEvent(new Event('input', { bubbles: true }));
    q2?.querySelector('.circ-btn-review')?.click();
  }
  const q2Solved = Boolean(q2?.classList.contains('is-resolved'));

  const learningState = JSON.parse(localStorage.getItem('alaska:learning:v1') || '{}');
  const comp1 = learningState?.competencies?.['inequalities.intervals_and_number_line'];
  const dashboardCards = document.querySelectorAll('#circ-dashboard [data-competency-id]').length;

  return {
    svgsSameNode,
    poeCommitted,
    poeVerified,
    q1HintsWork,
    q1DiagFeedback,
    q2Solved,
    learningUpdated: Boolean(comp1 && comp1.independentCount >= 1 && comp1.recentDiagnosticIds?.includes('swapped_open_closed_bracket')),
    dashboardCards,
    hasNavLink: Boolean(document.querySelector('.site-nav a[href="desigualdades.html"]')),
  };
})()`);

const circWidths = [];
for (const width of [320, 375, 768, 1024, 1440]) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: width < 600 ? 2 : 1,
    mobile: width < 600,
  });
  await new Promise((r) => setTimeout(r, 100));
  circWidths.push(
    await client.eval(
      `(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }))()`,
    ),
  );
}
circResults.viewportWidths = circWidths;
circResults.viewportOverflowFree = circWidths.every((item) => !item.overflow);
circResults.consoleErrors = [...circConsoleErrors];
console.log("Resultados de interacción en desigualdades.html:", JSON.stringify(circResults, null, 2));

const dimConsoleErrors = [];
const prevCircErrCount = circConsoleErrors.length;
await client.send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await client.send("Page.navigate", {
  url: `http://127.0.0.1:${PORT}/unidades.html`,
});
await new Promise((r) => setTimeout(r, 1000));
const dimResults = await client.eval(`(async () => {
  localStorage.clear();
  const probSel = document.getElementById('problem');
  if (probSel) { probSel.value = '0'; probSel.dispatchEvent(new Event('change', { bubbles: true })); }
  const firstTool = document.querySelector('#tools button[data-k]');
  firstTool?.click();
  const exprHasTokens = document.querySelectorAll('#expr .token').length > 0;
  document.getElementById('undo')?.click();
  document.getElementById('reset')?.click();

  // 2-stage POE
  document.getElementById('predict-up')?.click();
  const poeStage1 = (document.getElementById('poe-feedback')?.textContent || '').includes('Hipótesis registrada');

  // #solve assisted guard
  document.getElementById('solve')?.click();
  const statusAssisted = (document.getElementById('status')?.textContent || '').toLowerCase().includes('asistido');
  const learningAfterSolve = JSON.parse(localStorage.getItem('alaska:learning:v1') || '{}');
  const compNeutro = learningAfterSolve?.competencies?.['units.unitary_factor_neutral_one'];
  const solveGuarded = Boolean(compNeutro && compNeutro.independentCount === 0 && compNeutro.assistedCount >= 1);

  // Graduated check: 3 hints + autonomous numeric solve
  const q1 = document.querySelector('[data-check-id="dim-sec2-q1"]');
  const q1HintBtn = q1?.querySelector('.dim-btn-hint');
  for (let i = 0; i < 3; i++) q1HintBtn?.click();
  const q1HintsWork = (q1?.querySelector('.dim-check__hint')?.textContent || '').includes('Pista 3/3');

  const q2 = document.querySelector('[data-check-id="dim-sec2-q2"]');
  const q2Input = q2?.querySelector('.dim-check__input');
  if (q2Input) {
    q2Input.value = '2500';
    q2Input.dispatchEvent(new Event('input', { bubbles: true }));
    q2?.querySelector('.dim-btn-review')?.click();
  }
  const q2Solved = Boolean(q2?.classList.contains('is-resolved'));
  const learningAfterCheck = JSON.parse(localStorage.getItem('alaska:learning:v1') || '{}');
  const compPow = learningAfterCheck?.competencies?.['units.compound_rates_and_powers'];
  const dashboardCards = document.querySelectorAll('#dim-dashboard [data-competency-id]').length;

  return {
    exprHasTokens,
    poeStage1,
    statusAssisted,
    solveGuarded,
    q1HintsWork,
    q2Solved,
    compPowIndependent: Boolean(compPow && compPow.independentCount >= 1),
    dashboardCards,
    hasNavLink: Boolean(document.querySelector('.site-nav a[href="unidades.html"]')),
  };
})()`);

const dimWidths = [];
for (const width of [320, 375, 768, 1024, 1440]) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: width < 600 ? 2 : 1,
    mobile: width < 600,
  });
  await new Promise((r) => setTimeout(r, 100));
  dimWidths.push(
    await client.eval(
      `(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }))()`,
    ),
  );
}
dimResults.viewportWidths = dimWidths;
dimResults.viewportOverflowFree = dimWidths.every((item) => !item.overflow);
dimResults.consoleErrors = circConsoleErrors.slice(prevCircErrCount);
console.log("Resultados de interacción en unidades.html:", JSON.stringify(dimResults, null, 2));

const prevDimErrCount = circConsoleErrors.length;
await client.send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await client.send("Page.navigate", {
  url: `http://127.0.0.1:${PORT}/funciones.html`,
});
await new Promise((r) => setTimeout(r, 1000));
const fnResults = await client.eval(`(async () => {
  localStorage.clear();
  const titleHasUnidad02 = document.title.includes('Unidad 02') && !document.title.includes('Unidad 8');
  const introHasUnidad02 = (document.querySelector('.intro')?.textContent || '').includes('Unidad 02') &&
    !(document.querySelector('.intro')?.textContent || '').includes('Unidad 8');

  // #sc-reveal assisted guard
  document.getElementById('sc-reveal')?.click();
  const scAssistedBadge = (document.getElementById('sc-isfn')?.textContent || '').includes('asistido');
  const learningAfterReveal = JSON.parse(localStorage.getItem('alaska:learning:v1') || '{}');
  const compConcept = learningAfterReveal?.competencies?.['functions.concept_and_uniqueness'];
  const scRevealGuarded = Boolean(compConcept && compConcept.independentCount === 0 && compConcept.assistedCount >= 1);

  // Switch to Radiografia tab & test #rad-quiz
  document.getElementById('tab-radiografia')?.click();
  await new Promise((r) => setTimeout(r, 80));
  const radPanelVisible = !document.getElementById('panel-radiografia')?.hidden;
  document.querySelector('#rad-quiz button[data-ans="correct"]')?.click();
  const learningAfterQuiz = JSON.parse(localStorage.getItem('alaska:learning:v1') || '{}');
  const compMono = learningAfterQuiz?.competencies?.['functions.monotonicity_extrema_and_continuity'];
  const radQuizRecorded = Boolean(compMono && compMono.independentCount >= 1);

  // Switch to Secante tab & test persistent keyboard handle P1
  document.getElementById('tab-secante')?.click();
  await new Promise((r) => setTimeout(r, 80));
  const secHandle = document.querySelector('#sec-svg [data-handle="p1"]');
  let secKeyboardWorks = false;
  if (secHandle) {
    secHandle.focus();
    const valBefore = secHandle.getAttribute('aria-valuenow');
    const cxBefore = secHandle.getAttribute('cx');
    secHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    const valAfter = secHandle.getAttribute('aria-valuenow');
    const cxAfter = secHandle.getAttribute('cx');
    secKeyboardWorks = Boolean(valBefore !== valAfter && cxBefore !== cxAfter && document.activeElement === secHandle);
  }

  // Switch to Inversa tab & test persistent keyboard handle P1
  document.getElementById('tab-inversa')?.click();
  await new Promise((r) => setTimeout(r, 80));
  const invHandle = document.querySelector('#inv-svg [data-handle="p1"]');
  let invKeyboardWorks = false;
  if (invHandle) {
    invHandle.focus();
    const valBefore = invHandle.getAttribute('aria-valuenow');
    const cxBefore = invHandle.getAttribute('cx');
    invHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    const valAfter = invHandle.getAttribute('aria-valuenow');
    const cxAfter = invHandle.getAttribute('cx');
    invKeyboardWorks = Boolean(valBefore !== valAfter && cxBefore !== cxAfter && document.activeElement === invHandle);
  }

  // Return to scanner tab
  document.getElementById('tab-scanner')?.click();
  const dashboardCards = document.querySelectorAll('#fn-competency-panel [data-competency-id]').length;

  return {
    titleHasUnidad02,
    introHasUnidad02,
    scAssistedBadge,
    scRevealGuarded,
    radPanelVisible,
    radQuizRecorded,
    secKeyboardWorks,
    invKeyboardWorks,
    dashboardCards,
    hasNavLink: Boolean(document.querySelector('.site-nav a[href="funciones.html"]')),
  };
})()`);

const fnWidths = [];
for (const width of [320, 375, 768, 1024, 1440]) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: width < 600 ? 2 : 1,
    mobile: width < 600,
  });
  await new Promise((r) => setTimeout(r, 100));
  fnWidths.push(
    await client.eval(
      `(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }))()`,
    ),
  );
}
fnResults.viewportWidths = fnWidths;
fnResults.viewportOverflowFree = fnWidths.every((item) => !item.overflow);
fnResults.consoleErrors = circConsoleErrors.slice(prevDimErrCount);
console.log("Resultados de interacción en funciones.html:", JSON.stringify(fnResults, null, 2));

const circOk =
  circResults.svgsSameNode &&
  circResults.poeCommitted &&
  circResults.poeVerified &&
  circResults.q1HintsWork &&
  circResults.q1DiagFeedback &&
  circResults.q2Solved &&
  circResults.learningUpdated &&
  circResults.dashboardCards === 3 &&
  circResults.hasNavLink &&
  circResults.viewportOverflowFree &&
  circResults.consoleErrors.length === 0;

const dimOk =
  dimResults.exprHasTokens &&
  dimResults.poeStage1 &&
  dimResults.statusAssisted &&
  dimResults.solveGuarded &&
  dimResults.q1HintsWork &&
  dimResults.q2Solved &&
  dimResults.compPowIndependent &&
  dimResults.dashboardCards === 2 &&
  dimResults.hasNavLink &&
  dimResults.viewportOverflowFree &&
  dimResults.consoleErrors.length === 0;

const fnOk =
  fnResults.titleHasUnidad02 &&
  fnResults.introHasUnidad02 &&
  fnResults.scAssistedBadge &&
  fnResults.scRevealGuarded &&
  fnResults.radPanelVisible &&
  fnResults.radQuizRecorded &&
  fnResults.secKeyboardWorks &&
  fnResults.invKeyboardWorks &&
  fnResults.dashboardCards === 5 &&
  fnResults.hasNavLink &&
  fnResults.viewportOverflowFree &&
  fnResults.consoleErrors.length === 0;

// ============================================================================
// Stage F.2 · Hub (index.html), 7 nuevos laboratorios y 2 evaluaciones integradoras
// ============================================================================

async function checkViewportWidths() {
  const widths = [];
  for (const width of [320, 375, 768, 1024, 1440]) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: width < 600 ? 2 : 1,
      mobile: width < 600,
    });
    await new Promise((r) => setTimeout(r, 90));
    widths.push(
      await client.eval(
        `(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }))()`,
      ),
    );
  }
  return widths;
}

// 1. index.html: 17 hub entries, zero .hub-badge-new, #hub-reentry, #hub-mysteries non-mastery
const prevIdxErrCount = circConsoleErrors.length;
await client.send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await client.send("Page.navigate", {
  url: `http://127.0.0.1:${PORT}/index.html`,
});
await new Promise((r) => setTimeout(r, 900));
await client.eval(`(() => { localStorage.clear(); })()`);
await client.send("Page.reload", {});
await new Promise((r) => setTimeout(r, 900));

const hubResults = await client.eval(`(() => {
  const hubEntries = document.querySelectorAll('.hub-entry').length;
  const noNewBadges = document.querySelectorAll('.hub-badge-new').length === 0;
  const reentryItems = document.querySelectorAll('#hub-reentry .hub-reentry__item').length;
  const mysteryRows = document.querySelectorAll('#hub-mysteries .mystery-row').length;

  const firstRow = document.querySelector('#hub-mysteries .mystery-row');
  const btnExplain = Array.from(firstRow?.querySelectorAll('button') || []).find((b) => b.textContent.includes('explicación'));
  const btnSave = Array.from(firstRow?.querySelectorAll('button') || []).find((b) => b.textContent.trim() === 'Guardar');
  btnExplain?.click();
  btnSave?.click();

  const afterSave = JSON.parse(localStorage.getItem('alaska:learning:v1') || '{}');
  const openAfterSave = afterSave?.mysteries?.openIds?.length || 0;
  const exploredAfterSave = afterSave?.mysteries?.exploredIds?.length || 0;
  const compsUntouchedOnExplore = Object.keys(afterSave?.competencies || {}).length === 0;

  const savedTab = Array.from(document.querySelectorAll('#hub-mysteries [role="tab"]')).find((t) => t.textContent.includes('Guardados'));
  savedTab?.click();
  const savedRowsCount = document.querySelectorAll('#hub-mysteries .mystery-row').length;

  const btnDismiss = Array.from(document.querySelectorAll('#hub-mysteries .mystery-row button')).find((b) => b.textContent.includes('Quitar'));
  btnDismiss?.click();
  const afterDismiss = JSON.parse(localStorage.getItem('alaska:learning:v1') || '{}');
  const openAfterDismiss = afterDismiss?.mysteries?.openIds?.length || 0;
  const compsStillUntouched = Object.keys(afterDismiss?.competencies || {}).length === 0;

  return {
    hubEntries,
    noNewBadges,
    reentryItems,
    mysteryRows,
    openAfterSave,
    exploredAfterSave,
    compsUntouchedOnExplore,
    savedRowsCount,
    openAfterDismiss,
    compsStillUntouched,
  };
})()`);
const hubWidths = await checkViewportWidths();
hubResults.viewportOverflowFree = hubWidths.every((w) => !w.overflow);
hubResults.consoleErrors = circConsoleErrors.slice(prevIdxErrCount);
console.log("Resultados de interacción en index.html:", JSON.stringify(hubResults, null, 2));

const hubOk =
  hubResults.hubEntries === 17 &&
  hubResults.noNewBadges &&
  hubResults.reentryItems >= 2 &&
  hubResults.mysteryRows === 13 &&
  hubResults.openAfterSave === 1 &&
  hubResults.exploredAfterSave === 1 &&
  hubResults.compsUntouchedOnExplore &&
  hubResults.savedRowsCount === 1 &&
  hubResults.openAfterDismiss === 0 &&
  hubResults.compsStillUntouched &&
  hubResults.viewportOverflowFree &&
  hubResults.consoleErrors.length === 0;

// 2. All 7 new labs
const NEW_LABS = [
  { file: "lineal.html", dashboardId: "lin-competency-dashboard", expectedComps: 5 },
  { file: "sistemas.html", dashboardId: "sys-competency-dashboard", expectedComps: 4 },
  { file: "polinomios.html", dashboardId: "poly-competency-dashboard", expectedComps: 5 },
  { file: "racionales-irracionales.html", dashboardId: "ri-competency-dashboard", expectedComps: 5 },
  { file: "logaritmicas.html", dashboardId: "log-competency-dashboard", expectedComps: 5 },
  { file: "razones-trigonometricas.html", dashboardId: "trigr-competency-dashboard", expectedComps: 4 },
  { file: "funciones-trigonometricas.html", dashboardId: "trigf-competency-dashboard", expectedComps: 4 },
];

const newLabResults = [];
for (const lab of NEW_LABS) {
  const prevErrCount = circConsoleErrors.length;
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Page.navigate", {
    url: `http://127.0.0.1:${PORT}/${lab.file}`,
  });
  await new Promise((r) => setTimeout(r, 900));

  const res = await client.eval(`(() => {
    localStorage.clear();
    const widgets = Array.from(document.querySelectorAll('[data-widget]'));
    const svgs = document.querySelectorAll('[data-widget] svg').length;

    // 1. Widget DOM persistence (sameNodeReference)
    let sameNode = false;
    const firstWidget = widgets.find((w) => w.querySelector('svg') && (w.querySelector('input[type="range"]') || w.querySelector('button:not(.learning-predict-options button):not(.learning-predict-verify-btn)')));
    if (firstWidget) {
      const svgBefore = firstWidget.querySelector('svg');
      const range = firstWidget.querySelector('input[type="range"]');
      if (range) {
        const nextVal = Number(range.value) === Number(range.max) ? Number(range.min) : Number(range.max);
        range.value = String(nextVal);
        range.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        const ctrlBtns = Array.from(firstWidget.querySelectorAll('button')).filter(
          (b) => !b.closest('.learning-predict-box') && !b.disabled
        );
        const targetBtn = ctrlBtns[1] || ctrlBtns[0];
        targetBtn?.click();
      }
      const svgAfter = firstWidget.querySelector('svg');
      sameNode = Boolean(svgBefore && svgAfter && svgBefore === svgAfter);
    }

    // 2. Two-stage POE verification
    const poeBox = document.querySelector('.learning-predict-box');
    let poeWorks = false;
    if (poeBox) {
      const optBtn = poeBox.querySelector('.learning-predict-options button');
      const verifyBtn = poeBox.querySelector('.learning-predict-verify-btn');
      const feedback = poeBox.querySelector('.learning-predict-feedback');
      optBtn?.click();
      const stage1 = Boolean(feedback && feedback.textContent.includes('Hipótesis registrada') && verifyBtn && !verifyBtn.disabled);
      verifyBtn?.click();
      const stage2 = Boolean(verifyBtn?.disabled && feedback && !feedback.textContent.includes('Hipótesis registrada'));
      poeWorks = stage1 && stage2;
    }

    // 3. Keyboard SVG handle if present in DOM
    const sliderHandle = document.querySelector('[data-widget] svg [role="slider"][tabindex="0"]');
    let keyboardOk = true;
    if (sliderHandle) {
      const valBefore = sliderHandle.getAttribute('aria-valuenow');
      const cxBefore = sliderHandle.getAttribute('cx');
      sliderHandle.focus();
      sliderHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      const valAfter = sliderHandle.getAttribute('aria-valuenow');
      const cxAfter = sliderHandle.getAttribute('cx');
      keyboardOk = valBefore !== valAfter || cxBefore !== cxAfter;
    }

    // 4. Submit / reveal check & verify alaska:learning:v1 + dashboard
    const checkHost = document.querySelector('[data-check]');
    if (checkHost) {
      const revealBtn = Array.from(checkHost.querySelectorAll('button')).find(
        (b) => b.textContent.includes('Ver solución') || b.textContent.includes('solución')
      );
      if (revealBtn) {
        revealBtn.click();
      } else {
        const opt = checkHost.querySelector('.pr-option');
        opt?.click();
      }
    }

    const learningStore = JSON.parse(localStorage.getItem('alaska:learning:v1') || '{}');
    const learningRecorded = Array.isArray(learningStore?.events) && learningStore.events.length >= 1;
    const dashboardCards = document.querySelectorAll('#${lab.dashboardId} [data-competency-id]').length;

    return {
      widgetsCount: widgets.length,
      svgs,
      sameNode,
      poeWorks,
      keyboardOk,
      learningRecorded,
      dashboardCards,
    };
  })()`);

  const labWidths = await checkViewportWidths();
  res.file = lab.file;
  res.expectedComps = lab.expectedComps;
  res.viewportOverflowFree = labWidths.every((w) => !w.overflow);
  res.consoleErrors = circConsoleErrors.slice(prevErrCount);
  res.ok =
    res.widgetsCount >= 4 &&
    res.svgs >= 4 &&
    res.sameNode &&
    res.poeWorks &&
    res.keyboardOk &&
    res.learningRecorded &&
    res.dashboardCards === lab.expectedComps &&
    res.viewportOverflowFree &&
    res.consoleErrors.length === 0;

  console.log(`Resultados de interacción en ${lab.file}:`, JSON.stringify(res, null, 2));
  newLabResults.push(res);
}

const newLabsOk = newLabResults.every((r) => r.ok);

// 3. Both Integrators (jefe-integrador-1.html & simulacro-global.html)
const INTEGRATORS = [
  { file: "jefe-integrador-1.html", arenaId: "boss-integrador-1-arena" },
  { file: "simulacro-global.html", arenaId: "boss-simulacro-global-arena" },
];

const integratorResults = [];
for (const boss of INTEGRATORS) {
  const prevErrCount = circConsoleErrors.length;
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Page.navigate", {
    url: `http://127.0.0.1:${PORT}/${boss.file}`,
  });
  await new Promise((r) => setTimeout(r, 900));

  const res = await client.eval(`(() => {
    localStorage.clear();
    const arena = document.getElementById('${boss.arenaId}');
    if (!arena) return { error: 'Arena not mounted' };
    const noTimer = !document.querySelector('[data-timer], .countdown, .boss-timer');
    const phasePillsCount = arena.querySelectorAll('.boss-phase-pill').length;

    // Request hint -> locks assisted, then reveal solution so outcome becomes 'assisted' for Debrief repairLinks
    const hintBtn = Array.from(arena.querySelectorAll('button')).find((b) => b.textContent.includes('Pedir pista'));
    hintBtn?.click();
    const assistedLocked = Boolean(arena.querySelector('.boss-evidence-pill.is-assisted'));
    const solBtn = Array.from(arena.querySelectorAll('button')).find((b) => b.textContent.includes('Ver solución'));
    solBtn?.click();

    // Advance to Phase 2
    const nextBtn = Array.from(arena.querySelectorAll('button')).find((b) => b.textContent.includes('Siguiente fase'));
    nextBtn?.click();
    const phase2Title = arena.querySelector('.boss-phase-title')?.textContent || '';
    const phaseAdvanced = phase2Title.includes('Fase 2');

    // Jump to Debrief
    const debriefBtn = Array.from(arena.querySelectorAll('button')).find((b) => b.textContent.includes('6. Debrief'));
    debriefBtn?.click();
    const debriefRendered = Boolean(arena.querySelector('.boss-debrief-card'));
    const repairLinksCount = arena.querySelectorAll('.boss-repair-box a').length;
    const bossStore = JSON.parse(localStorage.getItem('alaska:learning:v1') || '{}');
    const bossEventRecorded = Array.isArray(bossStore?.events) && bossStore.events.length >= 1;

    return {
      noTimer,
      phasePillsCount,
      assistedLocked,
      phaseAdvanced,
      debriefRendered,
      repairLinksCount,
      bossEventRecorded,
    };
  })()`);

  const bossWidths = await checkViewportWidths();
  res.file = boss.file;
  res.viewportOverflowFree = bossWidths.every((w) => !w.overflow);
  res.consoleErrors = circConsoleErrors.slice(prevErrCount);
  res.ok =
    res.noTimer &&
    res.phasePillsCount === 6 &&
    res.assistedLocked &&
    res.phaseAdvanced &&
    res.debriefRendered &&
    res.repairLinksCount >= 1 &&
    res.bossEventRecorded &&
    res.viewportOverflowFree &&
    res.consoleErrors.length === 0;

  console.log(`Resultados de interacción en ${boss.file}:`, JSON.stringify(res, null, 2));
  integratorResults.push(res);
}

const integratorsOk = integratorResults.every((r) => r.ok);

const allResultsOk =
  allOk &&
  powRadOk &&
  expOk &&
  quadOk &&
  circOk &&
  dimOk &&
  fnOk &&
  hubOk &&
  newLabsOk &&
  integratorsOk;

client.close();
chromeProc.kill();
server.close();

if (!allResultsOk) {
  console.error("Falló alguna verificación interactiva.");
  process.exit(1);
}
