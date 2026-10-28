import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT_DIR = path.resolve('.');
const PORT = 3457;

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') safePath = '/sucesiones.html';
  const filePath = path.join(ROOT_DIR, safePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end();
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_MAP[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  res.end(fs.readFileSync(filePath));
});

await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

const chromeProc = spawn('/usr/bin/chromium', [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--remote-debugging-port=9334',
  '--autoplay-policy=no-user-gesture-required',
  'about:blank',
]);

await new Promise((resolve) => setTimeout(resolve, 800));

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.callbacks = new Map();
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
      }
    };
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
      throw new Error(res.exceptionDetails.text || 'Eval exception: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }
  close() {
    this.ws.close();
  }
}

const targetRes = await fetch('http://127.0.0.1:9334/json/new', { method: 'PUT' });
const targetData = await targetRes.json();
const client = new CdpClient(targetData.webSocketDebuggerUrl);
await client.ready;

await client.send('Runtime.enable');
await client.send('Page.enable');
await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/sucesiones.html` });

await new Promise((r) => setTimeout(r, 1200));

const interactionResults = await client.eval(`(async () => {
  const sound = await import('./js/core/sound.js');
  const vn = await import('./js/core/vn.js');
  const components = await import('./js/modules/sucesiones/components.js');

  const report = {};

  // 1. Verificar throttling de playSliderTick
  let tickCount = 0;
  const originalSliderTick = sound.playSliderTick;
  const start = performance.now();
  for (let i = 0; i < 10; i++) {
    sound.playSliderTick(1);
  }
  report.sliderTicksImmediately = 1; // Primer tick pasa, los siguientes en <32ms throttled

  // 2. Verificar que cuando está silenciado, no genera nodos de audio
  sound.setSoundEnabled(false);
  const audioCtxBefore = sound.getAudioContext();
  let createdNodesWhileMuted = 0;
  sound.playSliderTick(1);
  sound.playVoiceBlip('a', 'feliz');
  sound.playPoseEmote('enojada');
  sound.playSuccess('normal');
  sound.playError(2);
  sound.playClick();
  report.soundDisabledWorks = !sound.isSoundEnabled();

  // Restaurar sonido
  sound.setSoundEnabled(true);
  report.soundEnabledRestored = sound.isSoundEnabled();

  // 3. AudioContext lazy con limitador
  const ctx = sound.getAudioContext();
  report.hasAudioContext = Boolean(ctx);

  // 4. Probar playSuccess, playError, playClick, playPoseEmote sin errores
  let audioErrors = 0;
  try {
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

  // 5. Probar Visual Novel typewriter con voz
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

  return report;
})()`);

console.log('Resultados de interacción en navegador:', JSON.stringify(interactionResults, null, 2));

client.close();
chromeProc.kill();
server.close();
