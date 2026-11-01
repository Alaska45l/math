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
  document.querySelector('.vn-ctrl-btn--close')?.click();
  const gloss = document.querySelector('#sec-1 [data-gloss]');
  if (gloss) gloss.click();
  await new Promise((resolve) => setTimeout(resolve, 180));
  const glossHud = document.querySelector('.vn-hud[aria-hidden="false"]');
  const glossImage = document.querySelector('.vn-hud[aria-hidden="false"] .vn-sprite');
  const glossImageValid = Boolean(glossImage?.naturalWidth > 0);
  document.querySelector('.vn-ctrl-btn--close')?.click();
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
    bossRemoved: !document.querySelector('#pr-boss-panel, .pr-boss__canvas, .pr-boss'),
    trainerPrompt: Boolean(document.querySelector('.pr-challenge__prompt')),
    tutorHud: Boolean(tutorHud),
    tutorImageValid,
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
  powRadResults.bossRemoved &&
  powRadResults.trainerPrompt &&
  powRadResults.hasNavLink &&
  powRadResults.tutorHud &&
  powRadResults.tutorImageValid &&
  powRadResults.glossHud &&
  powRadResults.glossImageValid &&
  powRadResults.viewportOverflowFree &&
  powRadResults.consoleErrors.length === 0 &&
  !powRadResults.overflow;
const allResultsOk = allOk && powRadOk;

client.close();
chromeProc.kill();
server.close();

if (!allResultsOk) {
  console.error("Falló alguna verificación interactiva.");
  process.exit(1);
}
