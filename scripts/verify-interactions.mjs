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

  const ctx = sound.getAudioContext();
  report.hasAudioContext = Boolean(ctx);

  // Instrumentar AudioContext para contar nodos reales creados
  let oscCount = 0;
  let bufCount = 0;
  const origCreateOsc = ctx.createOscillator.bind(ctx);
  const origCreateBuf = ctx.createBufferSource.bind(ctx);
  ctx.createOscillator = () => { oscCount++; return origCreateOsc(); };
  ctx.createBufferSource = () => { bufCount++; return origCreateBuf(); };

  // 1. Verificar throttling REAL de playSliderTick
  // Esperar a que pase cualquier ventana de throttle previa
  await new Promise((r) => setTimeout(r, 50));
  const oscBeforeThrottle = oscCount;
  for (let i = 0; i < 10; i++) {
    sound.playSliderTick(1);
  }
  // En un bucle sincrónico de 10 ticks, sólo el primero debe dispararse (1 osc), los otros 9 throttled
  report.sliderTicksInSyncLoop = oscCount - oscBeforeThrottle;
  report.sliderThrottlingWorks = (oscCount - oscBeforeThrottle === 1);

  // 2. Verificar que cuando está silenciado, NO genera ningún nodo de audio
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

  // Restaurar sonido
  sound.setSoundEnabled(true);
  report.soundEnabledRestored = sound.isSoundEnabled();

  // 3. Probar playSuccess, playError, playClick, playPoseEmote sin errores
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

  // 4. Probar Visual Novel typewriter con voz
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
