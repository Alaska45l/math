/**
 * sound.js — Motor de sonido procedimental cozy con Web Audio API pura.
 * 0 dependencias externas, 0 archivos de audio externos.
 * Sonoridad cálida, táctil, orgánica y nunca estridente.
 */

const STORAGE_KEY = 'math:sound:enabled';

let audioCtx = null;
let masterCompressor = null;
let masterGain = null;
let brownNoiseBuffer = null;
let lastSliderTickTime = 0;
let userGestureUnlocked = false;
let globalSoundUIInitialized = false;

let soundEnabledState = null;

// =============================================================================
// 1. ESTADO GLOBAL Y PERSISTENCIA (localStorage)
// =============================================================================

/**
 * Consulta si los efectos de sonido están habilitados.
 * Por defecto es true. Persistido en localStorage con fallback en memoria.
 * @returns {boolean}
 */
export function isSoundEnabled() {
  if (soundEnabledState !== null) {
    return soundEnabledState;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(STORAGE_KEY);
      soundEnabledState = val === null ? true : val === 'true';
      return soundEnabledState;
    }
  } catch (_) {}
  soundEnabledState = true;
  return soundEnabledState;
}

/**
 * Establece el estado de habilitación del sonido y lo persiste en localStorage.
 * @param {boolean} enabled
 */
export function setSoundEnabled(enabled) {
  soundEnabledState = Boolean(enabled);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, soundEnabledState ? 'true' : 'false');
    }
  } catch (_) {}
}

/**
 * Conmuta el estado del sonido y devuelve el nuevo estado.
 * @returns {boolean}
 */
export function toggleSound() {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  return next;
}

// =============================================================================
// 2. INICIALIZACIÓN PEREZOSA DEL AUDIOCONTEXT Y LIMITADOR MASTER
// =============================================================================

/**
 * Desbloquea el AudioContext en el primer gesto del usuario (pointerdown / keydown)
 * para cumplir la política de autoplay de los navegadores modernos.
 */
function setupUserGestureUnlock() {
  if (userGestureUnlocked || typeof window === 'undefined') return;

  const unlock = () => {
    if (userGestureUnlocked) return;
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          userGestureUnlocked = true;
          window.removeEventListener('pointerdown', unlock, { capture: true });
          window.removeEventListener('keydown', unlock, { capture: true });
          window.removeEventListener('touchstart', unlock, { capture: true });
        }).catch(() => {});
      } else if (ctx.state === 'running') {
        userGestureUnlocked = true;
        window.removeEventListener('pointerdown', unlock, { capture: true });
        window.removeEventListener('keydown', unlock, { capture: true });
        window.removeEventListener('touchstart', unlock, { capture: true });
      }
    }
  };

  window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  window.addEventListener('keydown', unlock, { capture: true, passive: true });
  window.addEventListener('touchstart', unlock, { capture: true, passive: true });
}

if (typeof window !== 'undefined') {
  setupUserGestureUnlock();
}

/**
 * Obtiene o inicializa perezosamente el AudioContext singleton.
 * Configura un limitador/compresor suave para evitar cualquier saturación digital.
 * @returns {AudioContext|null}
 */
export function getAudioContext() {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return null;

    try {
      audioCtx = new AudioCtxClass();
    } catch (_) {
      return null;
    }

    try {
      // Limitador / compresor suave
      masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-12, audioCtx.currentTime);
      masterCompressor.knee.setValueAtTime(10, audioCtx.currentTime);
      masterCompressor.ratio.setValueAtTime(6, audioCtx.currentTime);
      masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      masterCompressor.release.setValueAtTime(0.22, audioCtx.currentTime);

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);

      masterCompressor.connect(masterGain);
      masterGain.connect(audioCtx.destination);
    } catch (_) {}
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Retorna el nodo maestro de entrada donde deben conectarse los efectos.
 * @returns {AudioNode|null}
 */
function getMasterNode() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  return masterCompressor || masterGain || ctx.destination;
}

/**
 * Genera un buffer precacheado de ruido marrón (brown noise / caminata aleatoria integrada).
 * Transmite textura táctil arenosa y fricción de tiza/piedra.
 * @param {AudioContext} ctx
 * @returns {AudioBuffer}
 */
function getBrownNoise(ctx) {
  if (brownNoiseBuffer && brownNoiseBuffer.sampleRate === ctx.sampleRate) {
    return brownNoiseBuffer;
  }
  const duration = 0.5; // 500ms
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0.0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.025 * white) / 1.025;
    data[i] = last * 3.8;
  }
  brownNoiseBuffer = buffer;
  return brownNoiseBuffer;
}

// =============================================================================
// 3. FAMILIAS ACÚSTICAS
// =============================================================================

/**
 * 1.1. Sliders y Arrastre con Fricción Mecánica y Arenosa.
 * Fricción de tiza/madera + clic amortiguado de engranaje con throttling de 32ms.
 * @param {number} [velocity=1]  Velocidad aproximada del movimiento (0.4 .. 3)
 */
export function playSliderTick(velocity = 1) {
  if (!isSoundEnabled()) return;

  const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (nowMs - lastSliderTickTime < 32) return;
  lastSliderTickTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const v = Math.min(3, Math.max(0.4, Number.isFinite(velocity) ? velocity : 1));

  // Capa 1 · Roce arenoso (Fricción):
  // Buffer corto de ruido marrón (40ms a 65ms) filtrado por BiquadFilterNode pasabanda
  // (type: 'bandpass', Q: 2.2, frecuencia central entre 450 Hz y 950 Hz modulada por velocidad)
  const noiseDuration = Math.min(0.065, Math.max(0.040, 0.042 + v * 0.007));
  const noiseBuf = getBrownNoise(ctx);
  if (noiseBuf) {
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuf;
    const maxOffset = Math.max(0, noiseBuf.duration - noiseDuration);
    const startOffset = Math.random() * maxOffset;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.setValueAtTime(2.2, now);
    const centerFreq = Math.min(950, Math.max(450, 480 + v * 150));
    bandpass.frequency.setValueAtTime(centerFreq, now);

    const noiseGain = ctx.createGain();
    const peakNoise = Math.min(0.24, 0.10 + v * 0.045);
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(peakNoise, now + 0.007);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseDuration);

    noiseSource.connect(bandpass);
    bandpass.connect(noiseGain);
    const master = getMasterNode();
    if (master) noiseGain.connect(master);

    noiseSource.start(now, startOffset, noiseDuration);
    noiseSource.stop(now + noiseDuration + 0.005);
  }

  // Capa 2 · Retén mecánico (Contra-fuerza):
  // Pulso senoidal/triangular grave y corto (135 Hz cayendo exponencialmente a 52 Hz en 22ms)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(135, now);
  osc.frequency.exponentialRampToValueAtTime(52, now + 0.022);

  const peakOsc = Math.min(0.18, 0.08 + v * 0.03);
  oscGain.gain.setValueAtTime(0.0001, now);
  oscGain.gain.linearRampToValueAtTime(peakOsc, now + 0.003);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

  osc.connect(oscGain);
  const master = getMasterNode();
  if (master) oscGain.connect(master);

  osc.start(now);
  osc.stop(now + 0.024);
}

/** Mapa de frecuencias de formante cálido para vocales de voz sintética */
const FORMANT_MAP = {
  a: 820,
  e: 640,
  i: 420,
  o: 520,
  u: 360,
  á: 820,
  é: 640,
  í: 420,
  ó: 520,
  ú: 360,
  ü: 360,
};

/**
 * 1.2. Voz Sintética Cálida de Alaska (blip por carácter en typewriter).
 * Combinación triangle (70%) + sine (30%) con filtro pasabajos (950 Hz) y formante peaking.
 * @param {string} char  Carácter que se está escribiendo
 * @param {string} [pose='base']  Pose actual de Alaska ('base'|'feliz'|'orgullosa'|'colapso'|'enojada')
 */
export function playVoiceBlip(char, pose = 'base') {
  if (!isSoundEnabled()) return;
  if (!char || typeof char !== 'string') return;

  // Ignorar espacios, saltos de línea y signos de puntuación mudos
  if (/[\s\.,!?;:—\-–'"«»`()¿¡…\[\]{}<>\/\\*+=%]/.test(char)) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = getMasterNode();
  if (!master) return;

  const formantFreq = FORMANT_MAP[char.toLowerCase()] || 600;

  // Parámetros adaptados a la pose de Alaska
  let baseFreq = 285;
  let duration = 0.038;
  let attack = 0.006;
  let pitchBend = 0;
  let lpFreq = 950;
  let formantGain = 3.2;

  if (pose === 'feliz') {
    baseFreq = 315 + (Math.random() * 10 - 5);
    duration = 0.036;
    attack = 0.005;
    pitchBend = 14; // Ligera inflexión ascendente
  } else if (pose === 'orgullosa') {
    baseFreq = 295 + (Math.random() * 8 - 4);
    duration = 0.040;
    attack = 0.006;
    pitchBend = 6;
  } else if (pose === 'colapso') {
    baseFreq = 235 + (Math.random() * 6 - 3);
    duration = 0.050;
    attack = 0.008;
    pitchBend = -18; // Pitch bend descendente en cada sílaba
  } else if (pose === 'enojada') {
    baseFreq = 305 + (Math.random() * 8 - 4);
    duration = 0.028;
    attack = 0.002; // Más percusiva
    pitchBend = 0;
    lpFreq = 1150; // Más armónicos medios
    formantGain = 4.5;
  } else {
    // base (Intelectual)
    baseFreq = 285 + (Math.random() * 24 - 12); // ±12 Hz variación sutil
    duration = 0.038;
    attack = 0.006;
  }

  // Combinación: triangle (70%) + sine (30%)
  const oscTri = ctx.createOscillator();
  const oscSin = ctx.createOscillator();
  oscTri.type = 'triangle';
  oscSin.type = 'sine';

  const triGain = ctx.createGain();
  const sinGain = ctx.createGain();
  triGain.gain.setValueAtTime(0.7, now);
  sinGain.gain.setValueAtTime(0.3, now);

  oscTri.frequency.setValueAtTime(baseFreq, now);
  oscSin.frequency.setValueAtTime(baseFreq, now);

  if (pitchBend !== 0) {
    oscTri.frequency.linearRampToValueAtTime(baseFreq + pitchBend, now + duration);
    oscSin.frequency.linearRampToValueAtTime(baseFreq + pitchBend, now + duration);
  }

  oscTri.connect(triGain);
  oscSin.connect(sinGain);

  // Filtros: Lowpass cálido (950 Hz) + Formante peaking
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(lpFreq, now);
  lowpass.Q.setValueAtTime(0.75, now);

  const formant = ctx.createBiquadFilter();
  formant.type = 'peaking';
  formant.frequency.setValueAtTime(formantFreq, now);
  formant.Q.setValueAtTime(1.9, now);
  formant.gain.setValueAtTime(formantGain, now);

  // Envolvente de volumen
  const envGain = ctx.createGain();
  const peakVol = pose === 'enojada' ? 0.15 : 0.12;
  envGain.gain.setValueAtTime(0.0001, now);
  envGain.gain.linearRampToValueAtTime(peakVol, now + attack);
  envGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  triGain.connect(lowpass);
  sinGain.connect(lowpass);
  lowpass.connect(formant);
  formant.connect(envGain);
  envGain.connect(master);

  oscTri.start(now);
  oscSin.start(now);
  oscTri.stop(now + duration + 0.005);
  oscSin.stop(now + duration + 0.005);
}

/**
 * 1.2. Micro-gesto sonoro al cambiar de pose en el HUD de Alaska.
 * @param {string} pose  'colapso' | 'orgullosa' | 'enojada' | 'feliz' | 'base'
 */
export function playPoseEmote(pose) {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = getMasterNode();
  if (!master) return;

  if (pose === 'colapso') {
    // Suave suspiro descendente: barrido de ruido filtrado con caída de tono 300 Hz → 190 Hz en 260ms
    const noiseBuf = getBrownNoise(ctx);
    if (!noiseBuf) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const maxOffset = Math.max(0, noiseBuf.duration - 0.28);
    const startOffset = Math.random() * maxOffset;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(3.2, now);
    bp.frequency.setValueAtTime(300, now);
    bp.frequency.exponentialRampToValueAtTime(190, now + 0.26);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.19, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(master);

    src.start(now, startOffset, 0.27);
    src.stop(now + 0.27);
  } else if (pose === 'orgullosa') {
    // Doble tono corto ascendente ("Hm-hm~" en cuarta justa suave: 260 Hz → 345 Hz)
    const tones = [
      { f: 260, t: 0, d: 0.065 },
      { f: 345, t: 0.080, d: 0.090 },
    ];
    tones.forEach(({ f, t, d }) => {
      const start = now + t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, start);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(900, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + d);

      osc.connect(lp);
      lp.connect(gain);
      gain.connect(master);

      osc.start(start);
      osc.stop(start + d + 0.005);
    });
  } else if (pose === 'enojada') {
    // Pulso grave percusivo doble tipo puchero / indignación (180 Hz)
    const pulses = [
      { f1: 180, f2: 138, t: 0, d: 0.045 },
      { f1: 180, f2: 130, t: 0.075, d: 0.055 },
    ];
    pulses.forEach(({ f1, f2, t, d }) => {
      const start = now + t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f1, start);
      osc.frequency.exponentialRampToValueAtTime(f2, start + d);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(450, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + d);

      osc.connect(lp);
      lp.connect(gain);
      gain.connect(master);

      osc.start(start);
      osc.stop(start + d + 0.005);
    });
  } else if (pose === 'feliz') {
    // Nota cálida luminosa ascendente (Sol4 [392 Hz] → Do5 [523.25 Hz])
    const notes = [
      { f: 392.00, t: 0, d: 0.120 },
      { f: 523.25, t: 0.080, d: 0.220 },
    ];
    notes.forEach(({ f, t, d }) => {
      playMarimbaVoice(ctx, master, f, now + t, d, 0.13);
    });
  }
}

/**
 * Generador de notas estilo kalimba / marimba de madera cálida.
 * Onda sine + segundo armónico suave a -14dB (amplitud ~0.20), ataque 8ms y caída exponencial.
 */
function playMarimbaVoice(ctx, master, freq, startTime, duration = 0.320, vol = 0.15) {
  const t = Math.max(ctx.currentTime, startTime);
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = 'sine';
  osc2.type = 'sine';

  osc1.frequency.setValueAtTime(freq, t);
  osc2.frequency.setValueAtTime(freq * 2, t); // Segundo armónico

  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  gain1.gain.setValueAtTime(1.0, t);
  gain2.gain.setValueAtTime(0.20, t); // -14dB relativo

  osc1.connect(gain1);
  osc2.connect(gain2);

  const envGain = ctx.createGain();
  envGain.gain.setValueAtTime(0.0001, t);
  envGain.gain.linearRampToValueAtTime(vol, t + 0.008); // Ataque redondeado 8ms
  envGain.gain.exponentialRampToValueAtTime(0.0001, t + duration); // Decaimiento cálido

  gain1.connect(envGain);
  gain2.connect(envGain);
  envGain.connect(master);

  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + duration + 0.01);
  osc2.stop(t + duration + 0.01);
}

/**
 * 1.3. Sonido de Acierto Cozy.
 * - 'normal': Do5 [523.25 Hz] → Sol5 [783.99 Hz] separados por 85ms (quinta justa cálida).
 * - 'section': Fa Maj7 suave (Fa4 [349.23 Hz] → La4 [440.00 Hz] → Do5 [523.25 Hz] → Mi5 [659.25 Hz]).
 * @param {'normal'|'section'} [level='normal']
 */
export function playSuccess(level = 'normal') {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = getMasterNode();
  if (!master) return;

  if (level === 'section') {
    // Cozy Chord Fa Maj7: Fa4 → La4 → Do5 → Mi5
    const chord = [
      { f: 349.23, t: 0, d: 0.450 },
      { f: 440.00, t: 0.085, d: 0.450 },
      { f: 523.25, t: 0.170, d: 0.450 },
      { f: 659.25, t: 0.255, d: 0.550 },
    ];
    chord.forEach(({ f, t, d }) => {
      playMarimbaVoice(ctx, master, f, now + t, d, 0.14);
    });
  } else {
    // Ejercicio individual: Do5 [523.25 Hz] → Sol5 [783.99 Hz] en 85ms
    playMarimbaVoice(ctx, master, 523.25, now, 0.320, 0.15);
    playMarimbaVoice(ctx, master, 783.99, now + 0.085, 0.340, 0.15);
  }
}

/**
 * 1.4. Sonido de Error Cozy.
 * Bloque de madera grave amortiguado (muted woodblock / soft thud).
 * Dos notas graves descendentes (La3 [220 Hz] → Fa3 [174.61 Hz] separadas por 90ms)
 * pasadas por filtro pasabajos a 360 Hz. Si streak >= 2, agrega un 3er toque grave.
 * @param {number} [streak=1]  Intentos fallidos consecutivos
 */
export function playError(streak = 1) {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = getMasterNode();
  if (!master) return;

  const notes = [
    { f: 220.00, t: 0, d: 0.085 },       // La3
    { f: 174.61, t: 0.090, d: 0.090 },   // Fa3
  ];

  if (streak >= 2) {
    notes.push({ f: 146.83, t: 0.180, d: 0.110 }); // Re3
  }

  notes.forEach(({ f, t, d }) => {
    const start = Math.max(ctx.currentTime, now + t);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    // Ligero pitch drop inicial para el toque físico del percutor
    osc.frequency.setValueAtTime(f * 1.15, start);
    osc.frequency.exponentialRampToValueAtTime(f, start + 0.012);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(360, start);
    lp.Q.setValueAtTime(1.0, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.18, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + d);

    osc.connect(lp);
    lp.connect(gain);
    gain.connect(master);

    osc.start(start);
    osc.stop(start + d + 0.005);
  });
}

/**
 * 1.5. Micro-interacción: Roce sutil de tiza/madera (12ms).
 * Usado para clics en botones de filtro, presets y apertura de pistas.
 */
export function playClick() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = getMasterNode();
  if (!master) return;

  const noiseBuf = getBrownNoise(ctx);
  if (noiseBuf) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const maxOffset = Math.max(0, noiseBuf.duration - 0.025);
    const startOffset = Math.random() * maxOffset;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(850, now);
    bp.Q.setValueAtTime(2.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(master);

    src.start(now, startOffset, 0.015);
    src.stop(now + 0.015);
  }
}

/**
 * 1.5. Micro-interacción: Leve roce de papel / pizarra (70ms).
 */
export function playPageTurn() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = getMasterNode();
  if (!master) return;

  const noiseBuf = getBrownNoise(ctx);
  if (noiseBuf) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const maxOffset = Math.max(0, noiseBuf.duration - 0.085);
    const startOffset = Math.random() * maxOffset;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(650, now);
    bp.frequency.linearRampToValueAtTime(850, now + 0.070);
    bp.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.070);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(master);

    src.start(now, startOffset, 0.075);
    src.stop(now + 0.075);
  }
}

// =============================================================================
// 4. DELEGACIÓN AUTOMÁTICA EN TODA LA APLICACIÓN
// =============================================================================

/**
 * Inicializa la delegación global de eventos para sliders y botones:
 * - input en cualquier input[type="range"] → calcula velocidad y dispara playSliderTick(velocity).
 * - click en botones (.btn, .toggle, .vn-trigger, .tab-btn, .seq-ribbon__post, .chip) → playClick().
 * Es idempotente para llamarse con seguridad al renderizar el nav o módulos.
 */
export function initGlobalSoundUI() {
  if (globalSoundUIInitialized || typeof document === 'undefined') return;
  globalSoundUIInitialized = true;

  const sliderState = new WeakMap();

  // 1. Delegación para <input type="range">
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (!target || target.tagName !== 'INPUT' || target.type !== 'range') return;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const val = parseFloat(target.value) || 0;
    const min = parseFloat(target.min) || 0;
    const max = parseFloat(target.max) || 100;
    const range = Math.max(1e-5, max - min);

    let state = sliderState.get(target);
    let velocity = 1;
    if (state) {
      if (val === state.val) return; // No mover si no cambió el valor
      const dt = Math.max(1, now - state.time);
      const dNorm = Math.abs(val - state.val) / range;
      velocity = Math.min(3.0, Math.max(0.4, (dNorm / dt) * 900));
    }
    sliderState.set(target, { val, time: now });

    playSliderTick(velocity);
  }, { passive: true });

  // 2. Delegación para botones interactivos de UI
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target || typeof target.closest !== 'function') return;

    const match = target.closest(
      'button:not(.site-nav__sound-btn), .btn, .toggle, .vn-trigger, .tab-btn, .seq-ribbon__post, [role="tab"], .chip, .seq-check__opt-btn, .fn-reveal, .fn-quiz-btn, .dim-tool__btn'
    );
    if (match && !match.classList.contains('site-nav__sound-btn') && !match.disabled) {
      playClick();
    }
  }, { passive: true });
}

export default {
  isSoundEnabled,
  setSoundEnabled,
  toggleSound,
  getAudioContext,
  playSliderTick,
  playVoiceBlip,
  playPoseEmote,
  playSuccess,
  playError,
  playClick,
  playPageTurn,
  initGlobalSoundUI,
};
