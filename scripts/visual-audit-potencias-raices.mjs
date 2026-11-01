import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = path.resolve(".");
const PORT = 8765;
const DEBUG_PORT = 9335;
const OUT = path.join(ROOT, "artifacts/potencias-raices/screenshots");
fs.mkdirSync(OUT, { recursive: true });
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".json": "application/json",
};
const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(
    new URL(req.url, `http://127.0.0.1:${PORT}`).pathname,
  );
  if (pathname === "/") pathname = "/index.html";
  const filename = path.resolve(ROOT, `.${pathname}`);
  if (
    !filename.startsWith(ROOT) ||
    !fs.existsSync(filename) ||
    fs.statSync(filename).isDirectory()
  ) {
    res.writeHead(404).end("Not found");
    return;
  }
  res.writeHead(200, {
    "Content-Type": mime[path.extname(filename)] || "application/octet-stream",
  });
  fs.createReadStream(filename).pipe(res);
});
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
const chromium = spawn(
  "/usr/bin/chromium",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    `--remote-debugging-port=${DEBUG_PORT}`,
    "--autoplay-policy=no-user-gesture-required",
    "about:blank",
  ],
  { stdio: "ignore" },
);
const pause = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const item = this.pending.get(message.id);
        if (item) {
          this.pending.delete(message.id);
          message.error
            ? item.reject(new Error(message.error.message))
            : item.resolve(message.result);
        }
      } else if (message.method) {
        for (const fn of this.events.get(message.method) || [])
          fn(message.params);
      }
    };
  }
  on(method, fn) {
    this.events.set(method, [...(this.events.get(method) || []), fn]);
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails)
      throw new Error(
        result.exceptionDetails.exception?.description ||
          result.exceptionDetails.text,
      );
    return result.result?.value;
  }
  close() {
    this.ws.close();
  }
}
let client;
const consoleErrors = [];
try {
  let target;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new`, {
        method: "PUT",
      });
      if (response.ok) {
        target = await response.json();
        break;
      }
    } catch {}
    await pause(200);
  }
  if (!target)
    throw new Error("Chromium CDP no abrió el puerto de depuración.");
  client = new Cdp(target.webSocketDebuggerUrl);
  await client.ready;
  await client.send("Runtime.enable");
  await client.send("Page.enable");
  client.on("Runtime.consoleAPICalled", (event) => {
    if (event.type === "error")
      consoleErrors.push(
        event.args?.map((arg) => arg.value || arg.description).join(" ") ||
          "Console error",
      );
  });
  client.on("Runtime.exceptionThrown", (event) =>
    consoleErrors.push(
      event.exceptionDetails?.exception?.description ||
        event.exceptionDetails?.text ||
        "Exception",
    ),
  );
  const navigate = async (width, height, mobile) => {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: mobile ? 2 : 1,
      mobile,
    });
    await client.send("Page.navigate", {
      url: `http://127.0.0.1:${PORT}/potencias-raices.html`,
    });
    await pause(1200);
  };
  const evaluate = async (script) => client.eval(`(async()=>{${script}})()`);
  const capture = async (name) => {
    await pause(300);
    const result = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    fs.writeFileSync(path.join(OUT, name), Buffer.from(result.data, "base64"));
  };
  const gotoSection = async (id) => {
    await evaluate(
      `document.querySelector('.seq-sidebar__link[data-sec="${id}"]')?.click();`,
    );
    await pause(650);
  };
  const centerWidget = async (id) => {
    await evaluate(
      `document.querySelector('#${id} [data-widget]')?.scrollIntoView({block:'center'});`,
    );
    await pause(400);
  };
  const screenshotViews = async (label) => {
    await navigate(
      label === "desktop" ? 1440 : 390,
      label === "desktop" ? 900 : 844,
      label !== "desktop",
    );
    await gotoSection("sec-1");
    await evaluate(
      `const slider=document.querySelector('#sec-1 [data-widget] input[type="range"]'); if(slider){slider.value='3';slider.dispatchEvent(new Event('input',{bubbles:true}));} document.querySelector('#sec-1 [data-tutor="why"]')?.click();`,
    );
    await pause(6000);
    await centerWidget("sec-1");
    await capture(`${label}-sec1-dos-mundos-alaska.png`);
    await evaluate(`document.querySelector('.vn-ctrl-btn--min')?.click();`);
    await gotoSection("sec-4");
    await centerWidget("sec-4");
    await capture(`${label}-sec4-mitad-mundos.png`);
    await gotoSection("sec-5");
    await evaluate(
      `document.querySelector('#sec-5 .pr-chip-group button:nth-child(2)')?.click();`,
    );
    await centerWidget("sec-5");
    await capture(`${label}-sec5-geometria-2d.png`);
    await evaluate(
      `document.querySelector('#sec-5 .pr-chip-group button:nth-child(3)')?.click();`,
    );
    await centerWidget("sec-5");
    await capture(`${label}-sec5-geometria-3d.png`);
    await gotoSection("sec-6");
    await centerWidget("sec-6");
    await capture(`${label}-sec6-arbol-factores.png`);
    await gotoSection("sec-7");
    await centerWidget("sec-7");
    await capture(`${label}-sec7-simplificador.png`);
    await gotoSection("sec-9");
    await centerWidget("sec-9");
    await capture(`${label}-sec9-espejo-dominio.png`);
    await gotoSection("sec-10");
    await centerWidget("sec-10");
    await capture(`${label}-sec10-inspector-paradojas.png`);
    await gotoSection("sec-retos");
    await evaluate(`document.querySelector('#pr-tab-1')?.click();`);
    await pause(150);
    await capture(`${label}-cap4-entrenador.png`);
    await evaluate(`document.querySelector('#pr-tab-2')?.click();`);
    await pause(150);
    await capture(`${label}-cap4-trampas.png`);
  };

  await screenshotViews("desktop");
  await screenshotViews("mobile");
  await navigate(1440, 900, false);
  await evaluate(`document.querySelector('#seq-mode-toggle')?.click();`);
  const structural = await evaluate(`
    const widgets=[...document.querySelectorAll('[data-widget]')];
    const widgetAudit=widgets.map((host)=>({name:host.dataset.widget,svg:!!host.querySelector('svg.pr-board-svg'),interactive:!!host.querySelector('input,select,button'),scene:!!host.querySelector('svg path,svg circle,svg rect,svg text')}));
    const checks=[...document.querySelectorAll('[data-check]')];
    checks.forEach((host)=>host.querySelector('.pr-check__actions button:nth-child(3)')?.click());
    const checkAudit=checks.map((host)=>({id:host.dataset.check,hint:!!host.querySelector('.pr-check__actions button:nth-child(2)'),solution:!!host.querySelector('.pr-check__actions button:nth-child(3)'),steps:host.querySelectorAll('.pr-check__solution ol li').length}));
    const iconAudit=[...document.querySelectorAll('button svg.chalk-icon,button svg[class*=chalk-icon]')].map((svg)=>{const r=svg.getBoundingClientRect();return {w:r.width,h:r.height,cls:svg.getAttribute('class')}});
    const ranges=[...document.querySelectorAll('[data-widget] input[type=range]')];let stable=ranges.length>0;
    for(const input of ranges){const same=input;for(const value of [input.min,input.max,input.min]){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));stable=stable&&input===same&&input.isConnected;}}
    const theoryWidth=document.querySelector('#sec-1 .pr-theory-column')?.getBoundingClientRect().width||0;
    const geometry=document.querySelector('#sec-5 svg.pr-board-svg');
    const geometryLabels=geometry?[...geometry.querySelectorAll('text')].map(node=>node.textContent).filter(text=>/1D · SEGMENTO|2D · CUADRADO|3D · CUBO/.test(text)):[];
    const geometryHost=document.querySelector('#sec-5 [data-widget="geometria-raices"]');
    const dimensionButtons=geometryHost?.querySelector('.pr-chip-group');
    dimensionButtons?.querySelectorAll('button')[1]?.click();
    const sideSlider=geometryHost?.querySelector('input[type="range"]');
    const visibleTiles=()=>[...geometryHost.querySelectorAll('svg rect')].filter(node=>node.getAttribute('visibility')!=='hidden').length;
    if(sideSlider){sideSlider.value='4';sideSlider.dispatchEvent(new Event('input',{bubbles:true}));}
    const fourSideTiles=visibleTiles();
    if(sideSlider){sideSlider.value='6';sideSlider.dispatchEvent(new Event('input',{bubbles:true}));}
    const sixSideTiles=visibleTiles();
    const sec7Answer=document.querySelector('#sec-7 [data-check="sec-7"] .pr-check__item:nth-child(2) input');
    let sec7Correct=false;
    if(sec7Answer){sec7Answer.value='2x^4*sqrt(5)';sec7Answer.dispatchEvent(new Event('input',{bubbles:true}));sec7Answer.closest('.pr-check__item').querySelector('.pr-check__actions button')?.click();sec7Correct=sec7Answer.closest('.pr-check__item').querySelector('.pr-check__feedback')?.classList.contains('is-correct')||false;}
    const simplifier=document.querySelector('#sec-7 [data-widget="simplificador-radical"]')?.textContent||'';
    return {widgetAudit,checkAudit,iconAudit,stable,overflow:document.documentElement.scrollWidth>innerWidth+1,glossTypes:[...document.querySelectorAll('[data-gloss]')].map((node)=>node.tagName),glossCount:document.querySelectorAll('[data-gloss]').length,theoryWidth,geometryLabels,fourSideTiles,sixSideTiles,geometryScales:fourSideTiles>=16&&sixSideTiles>fourSideTiles,sec7Correct,simplifierHasBadPower:/x\^0|x\^1|⁽2⁾√/.test(simplifier)};
  `);
  const headingAudits = [];
  for (const id of ["sec-1", "sec-2", "sec-3", "sec-4", "sec-5"]) {
    await gotoSection(id);
    headingAudits.push(
      await evaluate(`
        const toolbar=document.querySelector('.seq-blackboard-toolbar')?.getBoundingClientRect();
        const section=document.getElementById('${id}');
        const title=section?.querySelector('h2')?.getBoundingClientRect();
        const phrase=section?.querySelector('blockquote')?.getBoundingClientRect();
        return {id:'${id}',titleTop:title?.top||-1,titleBottom:title?.bottom||-1,phraseTop:phrase?.top||-1,toolbarBottom:toolbar?.bottom||-1,titleClear:!!title&&!!toolbar&&title.top>=toolbar.bottom,phraseClear:!!phrase&&!!toolbar&&phrase.top>=toolbar.bottom};
      `),
    );
  }
  await evaluate(
    `document.querySelector('#sec-1 [data-tutor="why"]')?.click();`,
  );
  await pause(180);
  const tutorHud = await evaluate(
    `return ({visible:[...document.querySelectorAll('.vn-hud')].filter((node)=>node.getAttribute('aria-hidden')==='false').length,valid:document.querySelector('.vn-hud[aria-hidden="false"] .vn-sprite')?.naturalWidth>0})`,
  );
  await evaluate(
    `document.querySelector('.vn-ctrl-btn--min')?.click(); document.querySelector('#sec-1 [data-gloss]')?.click();`,
  );
  await pause(180);
  const glossHud = await evaluate(
    `return ({visible:[...document.querySelectorAll('.vn-hud')].filter((node)=>node.getAttribute('aria-hidden')==='false').length,valid:document.querySelector('.vn-hud[aria-hidden="false"] .vn-sprite')?.naturalWidth>0,card:document.querySelectorAll('.glossary-card').length})`,
  );
  const widths = [];
  for (const width of [320, 375, 390, 768, 1024, 1240, 1279, 1280, 1440]) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 844,
      deviceScaleFactor: width < 600 ? 2 : 1,
      mobile: width < 600,
    });
    await pause(100);
    widths.push(
      await evaluate(
        `return ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1})`,
      ),
    );
  }
  const widgetLines = {};
  for (const name of [
    "dos-mundos",
    "cinta-negativa",
    "neutro-cancelacion",
    "mitad-mundos",
    "geometria-raices",
    "arbol-factores",
    "simplificador-radical",
    "choque-mundos",
    "espejo-dominio-real",
    "inspector-paradojas",
  ]) {
    widgetLines[name] = fs
      .readFileSync(
        path.join(ROOT, `js/modules/potencias-raices/widgets/${name}.js`),
        "utf8",
      )
      .split("\n").length;
  }
  const result = {
    screenshots: fs.readdirSync(OUT).sort(),
    structural,
    headingAudits,
    tutorHud,
    glossHud,
    widths,
    widgetLines,
    consoleErrors,
  };
  fs.writeFileSync(
    path.join(OUT, "visual-audit-report.json"),
    JSON.stringify(result, null, 2),
  );
  const maxIcon = Math.max(
    0,
    ...structural.iconAudit.map((item) => Math.max(item.w, item.h)),
  );
  console.log(
    `Capturas Chromium: ${result.screenshots.filter((name) => name.endsWith(".png")).length} · ${OUT}`,
  );
  console.log(
    `Widgets SVG: ${structural.widgetAudit.filter((item) => item.svg && item.interactive && item.scene).length}/10 · Chequeos con solución: ${structural.checkAudit.filter((item) => item.steps >= 3).length}/10 · Icono mayor: ${maxIcon}px · Sliders estables: ${structural.stable}`,
  );
  console.log(
    `HUD explicación/glosario: ${tutorHud.visible}/${glossHud.visible} visible(s) · Términos inline: ${structural.glossCount} · Overflows: ${widths.filter((item) => item.overflow).length} · Errores consola: ${consoleErrors.length}`,
  );
  console.log(
    `Anchos revisados: ${widths.map((item) => item.width).join(", ")}`,
  );
  console.log(`Teoría a 1440px: ${structural.theoryWidth}px · Geometría: ${structural.geometryLabels.length}/3 dimensiones, escala ${structural.fourSideTiles}→${structural.sixSideTiles} baldosas · Ejercicio 2 de sección 7 correcto: ${structural.sec7Correct} · Notación radical limpia: ${!structural.simplifierHasBadPower}`);
  console.log(`Títulos y frases despejados: ${headingAudits.filter((item) => item.titleClear && item.phraseClear).length}/${headingAudits.length}`);
  const validWidgets =
    structural.widgetAudit.length === 10 &&
    structural.widgetAudit.every(
      (item) => item.svg && item.interactive && item.scene,
    );
  const validChecks =
    structural.checkAudit.length === 10 &&
    structural.checkAudit.every(
      (item) => item.hint && item.solution && item.steps >= 3,
    );
  const validIcons = structural.iconAudit.every(
    (item) => item.w <= 24 && item.h <= 24,
  );
  const validGloss =
    structural.glossCount >= 20 &&
    structural.glossTypes.every((tag) => tag === "SPAN") &&
    tutorHud.visible === 1 &&
    glossHud.visible === 1 &&
    tutorHud.valid &&
    glossHud.valid &&
    glossHud.card === 0;
  const validFiles = Object.values(widgetLines).every((lines) => lines > 120);
  if (
    !validWidgets ||
    !validChecks ||
    !validIcons ||
    !validGloss ||
    structural.theoryWidth < 460 ||
    structural.geometryLabels.length < 3 ||
    !structural.geometryScales ||
    !structural.sec7Correct ||
    structural.simplifierHasBadPower ||
    headingAudits.some((item) => !item.titleClear || !item.phraseClear) ||
    !structural.stable ||
    !validFiles ||
    widths.some((item) => item.overflow) ||
    consoleErrors.length
  )
    process.exitCode = 1;
} finally {
  client?.close();
  chromium.kill("SIGTERM");
  server.close();
}
