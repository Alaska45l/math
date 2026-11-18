/**
 * espejo-exp-log.js — Widget 4 (sec-4)
 * Reflexión especular entre exponencial y logarítmica respecto de y = x:
 * - Curva exponencial f(x) = k*a^x + c (azul) y asíntota horizontal y = c
 * - Diagonal y = x (verde punteada)
 * - Inversa logarítmica f⁻¹(x) (amarillo) y asíntota vertical x = c
 * - Punto P(t; f(t)) arrastrable y accesible por teclado reflejado en P'(f(t); t).
 */

import {
  createCartesianBoard,
  createPredictBox,
  createStore,
  addChips,
  addRange,
  addDraggableMarker,
  renderReadout,
  plotLogCurve,
  plotVerticalAsymptote,
  anchorPlaneLabel,
  clampToPlane,
  fmt,
  s,
  setText,
  setVisible,
} from './board-kit.js';
import { computeInverseExpLog } from '../logic.js';

const PRESETS = {
  base2: {
    label: '2ˣ ↔ log₂(x)',
    k: 1, a: 2, b: 1, h: 0, c: 0,
    expLabel: 'f(x) = 2ˣ',
    tMin: -3, tMax: 2.6, tDefault: 1.5,
  },
  baseHalf: {
    label: '(1/2)ˣ ↔ log_(1/2)(x)',
    k: 1, a: 0.5, b: 1, h: 0, c: 0,
    expLabel: 'f(x) = (1/2)ˣ',
    tMin: -2.6, tMax: 3, tDefault: -1.5,
  },
  baseE: {
    label: 'eˣ ↔ ln(x)',
    k: 1, a: Math.E, b: 1, h: 0, c: 0,
    expLabel: 'f(x) = eˣ',
    tMin: -3, tMax: 1.8, tDefault: 1,
  },
  shiftedE: {
    label: '2eˣ − 3 ↔ ln((x+3)/2)',
    k: 2, a: Math.E, b: 1, h: 0, c: -3,
    expLabel: 'f(x) = 2eˣ − 3',
    tMin: -3, tMax: 1.5, tDefault: 0,
  },
  shiftedHalf: {
    label: '(1/2)ˣ − 1 ↔ log_(1/2)(x+1)',
    k: 1, a: 0.5, b: 1, h: 0, c: -1,
    expLabel: 'f(x) = (1/2)ˣ − 1',
    tMin: -2.5, tMax: 3, tDefault: -1,
  },
};

export function initWidget(container, options = {}) {
  const board = createCartesianBoard(
    container,
    'Espejo Exponencial ↔ Logarítmico sobre y = x',
    {
      width: 640,
      height: 340,
      xMin: -5,
      xMax: 7,
      yMin: -5,
      yMax: 7,
      xStep: 1,
      yStep: 1,
    },
  );
  const plane = board.plane;

  const store = createStore({
    preset: options.preset || 'base2',
    t: 1.5,
    showAsymptotes: true,
  });

  // 0. POE 2 etapas
  const predictBox = createPredictBox({
    prompt: 'Si la exponencial f(x) = 2eˣ − 3 tiene asíntota horizontal y = −3, ¿qué asíntota y dominio tiene su inversa f⁻¹?',
    options: [
      {
        label: 'Asíntota vertical x = −3 y dominio abierto Dom(f⁻¹) = (−3; +∞)',
        correct: true,
        explanation: '¡Exacto! Al reflejar respecto de y = x se intercambian las coordenadas: y = −3 pasa a x = −3 y la imagen (−3; +∞) pasa a dominio.',
      },
      {
        label: 'Asíntota horizontal y = −3 y dominio Dom(f⁻¹) = ℝ',
        correct: false,
        explanation: 'La reflexión respecto de y = x gira las rectas horizontales a verticales e intercambia dominio con imagen.',
      },
    ],
    onVerify: () => {
      store.set({ preset: 'shiftedE', t: 0, showAsymptotes: true });
    },
  });
  board.controls.prepend(predictBox);

  // 1. Controles
  const presetOpts = Object.entries(PRESETS).map(([key, p]) => [key, p.label]);
  const updatePresetChips = addChips(
    board.controls,
    presetOpts,
    store.get().preset,
    (preset) => {
      predictBox.notifyInteraction();
      const cfg = PRESETS[preset] || PRESETS.base2;
      store.set({ preset, t: cfg.tDefault });
    },
    'Par Exponencial ↔ Logarítmico',
  );

  const { input: tSlider, output: tOutput } = addRange(
    board.controls,
    store,
    't',
    'Abscisa t del punto P(t; f(t))',
    -3,
    3,
    store.get().t,
    0.25,
    (v) => `t = ${fmt(v)}`,
  );
  tSlider.addEventListener('input', () => predictBox.notifyInteraction());

  // 2. Elementos SVG fijos
  const diagLine = s('line', {
    x1: plane.sx(-5),
    y1: plane.sy(-5),
    x2: plane.sx(7),
    y2: plane.sy(7),
    stroke: 'var(--green)',
    'stroke-width': 1.6,
    'stroke-dasharray': '6 4',
    opacity: '0.85',
  });
  const diagLabel = s('text', {
    x: plane.sx(5.8),
    y: plane.sy(6.2),
    class: 'log-svg-label',
    fill: 'var(--green)',
    'font-size': '12px',
  }, 'y = x');

  const hAsymLine = s('line', {
    x1: plane.box.x,
    x2: plane.box.x + plane.box.w,
    y1: plane.sy(0),
    y2: plane.sy(0),
    stroke: 'var(--blue)',
    'stroke-width': 1.4,
    'stroke-dasharray': '4 4',
  });
  const vAsymLine = plotVerticalAsymptote(plane, 0, { stroke: 'var(--yellow)', 'stroke-width': 1.4, 'stroke-dasharray': '4 4' });

  const expPath = s('path', { fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2.5 });
  const logPath = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2.5 });
  const tieLine = s('line', {
    stroke: 'var(--ink)',
    'stroke-width': 1.4,
    'stroke-dasharray': '3 3',
    opacity: '0.8',
  });

  plane.layers.under.append(diagLine, diagLabel, hAsymLine, vAsymLine);
  plane.layers.curve.append(expPath, logPath, tieLine);

  const mirrorDot = s('circle', {
    r: 6,
    fill: 'var(--yellow)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
  });
  const mirrorLabel = s('text', {
    class: 'log-svg-label',
    fill: 'var(--yellow)',
    'font-size': '12px',
  }, '');
  plane.layers.marks.append(mirrorDot, mirrorLabel);

  const expMarker = addDraggableMarker(board, plane, 1.5, Math.pow(2, 1.5), {
    color: 'var(--blue)',
    snapStep: 0.25,
    label: 'P',
    onDrag: ({ x, phase }) => {
      if (phase === 'start') predictBox.notifyInteraction();
      const cfg = PRESETS[store.get().preset] || PRESETS.base2;
      const clampedT = Math.max(cfg.tMin, Math.min(cfg.tMax, x));
      store.set({ t: clampedT });
    },
  });

  // 3. Render
  const render = (state) => {
    updatePresetChips(state.preset);
    const cfg = PRESETS[state.preset] || PRESETS.base2;
    const inv = computeInverseExpLog({ from: 'exp', k: cfg.k, a: cfg.a, b: cfg.b, h: cfg.h, c: cfg.c });

    const expFn = (x) => cfg.k * Math.pow(cfg.a, cfg.b * x - cfg.h) + cfg.c;
    expPath.setAttribute('d', plane.fnPath(expFn, -5, 7));

    // Curva inversa logarítmica: f⁻¹(x) = log_a((x - c)/k)
    const logD = plotLogCurve(plane, { k: 1 / cfg.b, a: cfg.a, m: 1 / cfg.k, d: -cfg.c / cfg.k, c: cfg.h / cfg.b });
    logPath.setAttribute('d', logD);

    // Asíntotas y = c y x = c
    const syC = plane.sy(cfg.c);
    hAsymLine.setAttribute('y1', String(syC));
    hAsymLine.setAttribute('y2', String(syC));
    const sxC = plane.sx(cfg.c);
    vAsymLine.setAttribute('x1', String(sxC));
    vAsymLine.setAttribute('x2', String(sxC));
    setVisible(hAsymLine, state.showAsymptotes);
    setVisible(vAsymLine, state.showAsymptotes);

    const t = Math.max(cfg.tMin, Math.min(cfg.tMax, state.t));
    tSlider.min = String(cfg.tMin);
    tSlider.max = String(cfg.tMax);
    tSlider.value = String(t);
    tOutput.textContent = `t = ${fmt(t)}`;
    const ft = expFn(t);
    expMarker.setPos(t, ft);

    // Punto reflejado P'(f(t); t)
    const p1 = clampToPlane(plane, plane.sx(t), plane.sy(ft), 6);
    const p2 = clampToPlane(plane, plane.sx(ft), plane.sy(t), 6);
    tieLine.setAttribute('x1', String(p1.cx));
    tieLine.setAttribute('y1', String(p1.cy));
    tieLine.setAttribute('x2', String(p2.cx));
    tieLine.setAttribute('y2', String(p2.cy));

    mirrorDot.setAttribute('cx', String(p2.cx));
    mirrorDot.setAttribute('cy', String(p2.cy));
    const lblTxt = `P'(${fmt(Number(ft.toFixed(2)))}; ${fmt(Number(t.toFixed(2)))})`;
    const anc = anchorPlaneLabel(plane, p2.cx, p2.cy, Math.max(50, lblTxt.length * 7));
    mirrorLabel.setAttribute('x', String(anc.lx));
    mirrorLabel.setAttribute('y', String(anc.ly));
    mirrorLabel.setAttribute('text-anchor', anc.anchor);
    setText(mirrorLabel, lblTxt);

    renderReadout(board.readout, 'Simetría Especular respecto de y = x', [
      ['Función directa', `${cfg.expLabel}  |  Im(f) = ${inv.expImage}  |  A.H.: y = ${fmt(cfg.c)}`],
      ['Función inversa', `${inv.formula}  |  Dom(f⁻¹) = ${inv.domain}  |  A.V.: ${inv.asymptote}`],
      ['Par reflejado en vivo', `P(${fmt(Number(t.toFixed(2)))}; ${fmt(Number(ft.toFixed(2)))})  ↔  ${lblTxt}`],
    ]);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ preset: 'base2', t: 1.5, showAsymptotes: true }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initEspejoExpLogWidget };
