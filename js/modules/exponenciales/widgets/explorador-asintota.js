/**
 * explorador-asintota.js — Widget 8 (F20)
 * Desplazamientos f(x) = k · a^(x - h) + c, traslación de la asíntota horizontal a y = c,
 * conjunto imagen abierto (c; +∞) o (−∞; c), y desarme interactivo de la trampa del corchete cerrado.
 */

import {
  createCartesianBoard,
  createPredictBox,
  clampToPlane,
  createStore,
  addChips,
  addRange,
  button,
  renderReadout,
  fmt,
  s,
  setText,
  setVisible,
} from './board-kit.js';
import { analyzeExponential } from '../logic.js';

const PRESETS = {
  canonico: {
    label: 'Canónica: 2ˣ',
    k: 1,
    a: 2,
    h: 0,
    c: 0,
  },
  traslacion_arriba: {
    label: 'Traslación +3: 2ˣ + 3',
    k: 1,
    a: 2,
    h: 0,
    c: 3,
  },
  ej11: {
    label: 'Invertida: 1 − 2ˣ',
    k: -1,
    a: 2,
    h: 0,
    c: 1,
  },
  ej14: {
    label: 'Decreciente: 2 − (½)ˣ',
    k: -1,
    a: 0.5,
    h: 0,
    c: 2,
  },
  parcial2025: {
    label: 'Cruce en origen: 1 − (½)ˣ',
    k: -1,
    a: 0.5,
    h: 0,
    c: 1,
  },
};

export function initWidget(container, options = {}) {
  const board = createCartesianBoard(
    container,
    'Explorador de Asíntotas y Desplazamientos',
    {
      width: 640,
      height: 340,
      xMin: -6,
      xMax: 6,
      yMin: -6,
      yMax: 6,
      xStep: 1,
      yStep: 1,
    },
  );

  const plane = board.plane;

  const defaultPreset = options.preset || 'parcial2025';
  const initial = PRESETS[defaultPreset] || PRESETS.parcial2025;

  const store = createStore({
    preset: defaultPreset,
    k: initial.k,
    a: initial.a,
    h: initial.h,
    c: initial.c,
    probeX: 5,
    showTrapChallenge: false,
  });

  // 0. Predict-Observe-Explain
  const predictBox = createPredictBox({
    prompt: 'Para f(x) = 2 · 3^(x−1) + 4, ¿el piso y = 4 pertenece al conjunto imagen?',
    options: [
      {
        label: 'No, la imagen es (4; +∞) con paréntesis abierto',
        correct: true,
        explanation: '¡Exacto! Como 3^(x−1) > 0 para todo x, la función es estrictamente mayor que 4 y nunca toca la recta asíntota.',
      },
      {
        label: 'Sí, la imagen es [4; +∞) con corchete cerrado',
        correct: false,
        explanation: '¡Cazabobos clásico de examen! Para valer 4 la potencia debería dar 0, pero una exponencial positiva jamás se anula.',
      },
    ],
    onVerify: () => {
      store.set({ preset: 'traslacion_arriba', k: 2, a: 3, h: 1, c: 4 });
    },
  });
  board.controls.prepend(predictBox);

  // 1. Controls
  const presetOptions = [
    ...Object.entries(PRESETS).map(([key, p]) => [key, p.label]),
    ['custom', 'Personalizado'],
  ];

  const updatePresetChips = addChips(
    board.controls,
    presetOptions,
    store.get().preset,
    (key) => {
      predictBox.notifyInteraction();
      if (PRESETS[key]) {
        const p = PRESETS[key];
        store.set({ preset: key, k: p.k, a: p.a, h: p.h, c: p.c });
      } else {
        store.set({ preset: 'custom' });
      }
    },
    'Familias y Desplazamientos',
  );

  const { input: kSlider } = addRange(
    board.controls,
    store,
    'k',
    'Coeficiente vertical k',
    -3,
    3,
    store.get().k,
    0.5,
    (v) => (v === 0 ? '0 (prohibido)' : `k = ${fmt(v)}`),
  );

  const { input: aSlider } = addRange(
    board.controls,
    store,
    'a',
    'Base a',
    0.2,
    3,
    store.get().a,
    0.1,
    (v) => (v === 1 ? '1 (prohibido)' : `a = ${fmt(v)}`),
  );

  const { input: hSlider } = addRange(
    board.controls,
    store,
    'h',
    'Desplazamiento horizontal h',
    -3,
    3,
    store.get().h,
    1,
    (v) => `h = ${fmt(v)}`,
  );

  const { input: cSlider } = addRange(
    board.controls,
    store,
    'c',
    'Asíntota horizontal c (y = c)',
    -4,
    4,
    store.get().c,
    1,
    (v) => `c = ${fmt(v)} (y = ${fmt(v)})`,
  );

  const { input: probeSlider } = addRange(
    board.controls,
    store,
    'probeX',
    'Sonda asintótica x',
    -5.5,
    5.5,
    store.get().probeX,
    0.5,
    (v) => `x = ${fmt(v)}`,
  );

  [kSlider, aSlider, hSlider, cSlider, probeSlider].forEach((slider) => {
    slider.addEventListener('input', () => {
      predictBox.notifyInteraction();
      if (slider !== probeSlider && store.get().preset !== 'custom') {
        store.set({ preset: 'custom' });
      }
    });
  });

  // Trap button
  const trapBtn = button('¿Toca la asíntota y = c?', 'hint', () => {
    store.set({ showTrapChallenge: !store.get().showTrapChallenge });
  });
  board.actions.append(trapBtn);

  // 2. SVG Elements
  // Image set vertical band on Y-axis
  const imageBand = s('rect', {
    x: plane.sx(0) - 4,
    y: 0,
    width: 8,
    height: 0,
    fill: 'var(--blue)',
    opacity: 0.35,
    rx: 4,
  });
  // Open circle at (0, c)
  const openCircle = s('circle', {
    cx: plane.sx(0),
    cy: 0,
    r: 5,
    fill: 'var(--bg)',
    stroke: 'var(--blue)',
    'stroke-width': 2,
  });
  const openCircleLabel = s('text', {
    x: 0,
    y: 0,
    class: 'exp-svg-label',
    'text-anchor': 'end',
    'font-size': '11px',
    fill: 'var(--blue)',
  }, '∉ Im(f)');
  plane.layers.under.append(imageBand, openCircle, openCircleLabel);

  // Asymptote line y = c
  const asymptoteLine = s('line', {
    x1: plane.sx(-6),
    y1: 0,
    x2: plane.sx(6),
    y2: 0,
    stroke: 'var(--pink)',
    'stroke-dasharray': '5 4',
    'stroke-width': 2,
  });
  const asymptoteLabel = s('text', {
    x: plane.sx(5.7),
    y: 0,
    class: 'exp-svg-label',
    fill: 'var(--pink)',
    'font-size': '11px',
    'text-anchor': 'end',
    'font-weight': 'bold',
  }, '');
  plane.layers.under.append(asymptoteLine, asymptoteLabel);

  // Curve path
  const curvePath = s('path', {
    fill: 'none',
    stroke: 'var(--yellow)',
    'stroke-width': 2.5,
  });
  plane.layers.curve.append(curvePath);

  // Points on curve
  const ptIntercept = s('circle', { r: 5, fill: 'var(--accent)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const labelIntercept = s('text', { class: 'exp-svg-label', 'font-size': '11px', fill: 'var(--accent)' }, '');
  const ptProbe = s('circle', { r: 5.5, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const labelProbe = s('text', { class: 'exp-svg-label', 'font-size': '11px', 'font-weight': 'bold', fill: 'var(--yellow)' }, '');

  plane.layers.marks.append(ptIntercept, labelIntercept, ptProbe, labelProbe);

  // 3. Render pipeline
  const render = (state) => {
    updatePresetChips(state.preset);

    let k = state.k;
    let a = state.a;
    let h = state.h;
    let c = state.c;

    if (k === 0) k = 0.5;
    if (a === 1) a = 1.1;

    kSlider.value = String(k);
    aSlider.value = String(a);
    hSlider.value = String(h);
    cSlider.value = String(c);
    probeSlider.value = String(state.probeX);

    // Asymptote line
    const syC = plane.sy(c);
    asymptoteLine.setAttribute('y1', String(syC));
    asymptoteLine.setAttribute('y2', String(syC));
    asymptoteLabel.setAttribute('y', String(syC - 6));
    setText(asymptoteLabel, `Asíntota y = ${fmt(c)}`);

    // Image set band on Y-axis
    if (k > 0) {
      // (c; +inf)
      const topY = plane.sy(6);
      imageBand.setAttribute('y', String(topY));
      imageBand.setAttribute('height', String(Math.max(0, syC - topY)));
    } else {
      // (-inf; c)
      const bottomY = plane.sy(-6);
      imageBand.setAttribute('y', String(syC));
      imageBand.setAttribute('height', String(Math.max(0, bottomY - syC)));
    }
    openCircle.setAttribute('cy', String(syC));

    // Curve
    const pathD = plane.fnPath((x) => k * Math.pow(a, x - h) + c, -6, 6);
    curvePath.setAttribute('d', pathD);

    // Intercept (0, f(0)) clamped to plane box
    const y0 = k * Math.pow(a, -h) + c;
    const sx0 = plane.sx(0);
    const sy0 = plane.sy(y0);
    const clampedInt = clampToPlane(plane, sx0, sy0, 6);
    ptIntercept.setAttribute('cx', String(clampedInt.cx));
    ptIntercept.setAttribute('cy', String(clampedInt.cy));
    const labelY = clampedInt.isClampedY && sy0 < plane.box.y ? clampedInt.cy + 14 : clampedInt.cy - 6;
    labelIntercept.setAttribute('x', String(clampedInt.cx + 8));
    labelIntercept.setAttribute('y', String(labelY));
    setText(labelIntercept, `(0; ${fmt(y0)})`);

    // Position open circle label
    openCircle.setAttribute('cx', String(plane.sx(0)));
    openCircleLabel.setAttribute('x', String(plane.sx(0) - 8));
    openCircleLabel.setAttribute('y', String(syC + 4));

    // Probe point
    const px = Math.max(-5.5, Math.min(5.5, state.probeX));
    const py = k * Math.pow(a, px - h) + c;
    const sxP = plane.sx(px);
    const syP = plane.sy(Math.max(-6, Math.min(6, py)));

    ptProbe.setAttribute('cx', String(Math.max(plane.box.x + 6, Math.min(plane.box.x + plane.box.w - 6, sxP))));
    ptProbe.setAttribute('cy', String(Math.max(plane.box.y + 6, Math.min(plane.box.y + plane.box.h - 6, syP))));

    const isProbeNearRight = sxP > plane.box.x + plane.box.w - 85;
    labelProbe.setAttribute('x', String(isProbeNearRight ? sxP - 10 : sxP + 10));
    labelProbe.setAttribute('text-anchor', isProbeNearRight ? 'end' : 'start');
    const isProbeNearTop = syP < plane.box.y + 24;
    labelProbe.setAttribute('y', String(isProbeNearTop ? syP + 20 : syP - 8));
    setText(labelProbe, `f(${fmt(px)}) = ${fmt(py)}`);

    // Distance to asymptote
    const deltaAsymptote = Math.abs(py - c);

    // Mathematical analysis from logic
    const analysis = analyzeExponential({ k, a, h, c });

    const rows = [
      [
        'Fórmula con Desplazamientos',
        `f(x) = ${k === -1 ? '−' : k !== 1 ? fmt(k) + ' · ' : ''}${a === 0.5 ? '(1/2)' : fmt(a)}^(x${h > 0 ? ' − ' + fmt(h) : h < 0 ? ' + ' + fmt(-h) : ''}) ${c > 0 ? '+ ' + fmt(c) : c < 0 ? '− ' + fmt(-c) : ''}`,
      ],
      [
        'Asíntota Horizontal',
        `Recta horizontal y = ${fmt(c)}. El desplazamiento vertical c traslada directamente la asíntota.`,
      ],
      [
        'Conjunto Imagen y Trampa del Corchete',
        `Im(f) = ${analysis.image}. ¡SIEMPRE con paréntesis abierto! La clásica trampa de examen es poner corchete cerrado [ para atrapar a los distraídos. Como a^(x−h) > 0 en todo ℝ, f(x) jamás llega a valer ${fmt(c)}.`,
      ],
      [
        'Sonda de Proximidad Asintótica',
        `En x = ${fmt(px)}: f(${fmt(px)}) = ${fmt(py)}. Distancia a la recta y = ${fmt(c)}: |f(x) − c| = ${fmt(deltaAsymptote)} > 0. Por más que x avance hacia el infinito, la distancia se achica pero jamás es cero.`,
      ],
    ];

    if (state.showTrapChallenge) {
      rows.push([
        'Desarme Teórico',
        `Si f(x) = ${fmt(c)}, tendríamos: ${fmt(k)} · a^(x−${fmt(h)}) + ${fmt(c)} = ${fmt(c)} ⟹ ${fmt(k)} · a^(x−${fmt(h)}) = 0 ⟹ a^(x−${fmt(h)}) = 0. Pero una potencia de base positiva es ESTRICTAMENTE MAYOR QUE CERO en todo ℝ. ¡La ecuación no tiene solución! Por eso la asíntota es intocable.`,
      ]);
    }

    renderReadout(board.readout, 'Análisis de Desplazamientos y Asíntota', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => {
      const p = PRESETS.parcial2025;
      store.set({ preset: 'parcial2025', k: p.k, a: p.a, h: p.h, c: p.c, probeX: 5, showTrapChallenge: false });
    },
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initExploradorAsintotaWidget };
