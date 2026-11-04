/**
 * cuadrante-k-a.js — Widget 5 (F17)
 * Las 4 familias de f(x) = k · aˣ según signos de k y base a (Exactas pág. 91-92).
 * Demuestra el caso clásico de parcial g(x) = −3 · (1/2)ˣ: al ser k < 0 y a < 1,
 * la función es estrictamente CRECIENTE en ℝ con conjunto imagen (−∞; 0).
 */

import {
  createCartesianBoard,
  createStore,
  addChips,
  addRange,
  renderReadout,
  fmt,
  s,
  setText,
  setVisible,
} from './board-kit.js';
import { analyzeExponential } from '../logic.js';

const QUADRANTS = [
  ['q1', 'Q1: k>0, a>1 (Creciente)'],
  ['q2', 'Q2: k>0, a<1 (Decreciente)'],
  ['q3', 'Q3: k<0, a>1 (Decreciente)'],
  ['q4', 'Q4: k<0, a<1 (¡CRECIENTE! Parcial)'],
  ['all_4', 'Las 4 familias juntas'],
];

export function initWidget(container, options = {}) {
  const board = createCartesianBoard(
    container,
    'Las 4 Familias de Monotonía de Exactas',
    {
      width: 640,
      height: 340,
      xMin: -4,
      xMax: 4,
      yMin: -6,
      yMax: 6,
      xStep: 1,
      yStep: 2,
    },
  );

  const plane = board.plane;

  const store = createStore({
    quadrant: options.quadrant || 'q4', // 'q1'|'q2'|'q3'|'q4'|'all_4'
    k: -3,
    a: 0.5,
    showLiveTable: true,
  });

  // 1. Controls
  const updateQuadChips = addChips(
    board.controls,
    QUADRANTS,
    store.get().quadrant,
    (q) => {
      let patch = { quadrant: q };
      if (q === 'q1') patch = { quadrant: q, k: 3, a: 2 };
      else if (q === 'q2') patch = { quadrant: q, k: 3, a: 0.5 };
      else if (q === 'q3') patch = { quadrant: q, k: -3, a: 2 };
      else if (q === 'q4') patch = { quadrant: q, k: -3, a: 0.5 };
      store.set(patch);
    },
    'Configuraciones Canónicas',
  );

  const { input: kSlider } = addRange(
    board.controls,
    store,
    'k',
    'Coeficiente k (k ≠ 0)',
    -4,
    4,
    store.get().k,
    0.5,
    (v) => (v === 0 ? '0 (prohibido)' : `k = ${fmt(v)}`),
  );

  const { input: aSlider } = addRange(
    board.controls,
    store,
    'a',
    'Base a (a > 0, a ≠ 1)',
    0.2,
    3,
    store.get().a,
    0.1,
    (v) => (v === 1 ? '1 (prohibido)' : `a = ${fmt(v)}`),
  );

  // 2. SVG Background and Layers
  // Halfplanes shading
  const upperHalf = s('rect', {
    x: plane.sx(-4),
    y: plane.sy(6),
    width: plane.sx(4) - plane.sx(-4),
    height: plane.sy(0) - plane.sy(6),
    fill: 'rgba(174, 209, 162, 0.06)',
  });
  const lowerHalf = s('rect', {
    x: plane.sx(-4),
    y: plane.sy(0),
    width: plane.sx(4) - plane.sx(-4),
    height: plane.sy(-6) - plane.sy(0),
    fill: 'rgba(227, 161, 161, 0.06)',
  });
  plane.layers.bg.append(upperHalf, lowerHalf);

  // Asymptote y = 0
  const asymptoteLine = s('line', {
    x1: plane.sx(-4),
    y1: plane.sy(0),
    x2: plane.sx(4),
    y2: plane.sy(0),
    stroke: 'var(--pink)',
    'stroke-dasharray': '5 4',
    'stroke-width': 1.8,
  });
  const asymptoteLabel = s('text', {
    x: plane.sx(3.7),
    y: plane.sy(0) - 8,
    class: 'exp-svg-label',
    fill: 'var(--pink)',
    'font-size': '11px',
    'text-anchor': 'end',
    'font-weight': 'bold',
  }, 'Asíntota y = 0');
  plane.layers.under.append(asymptoteLine, asymptoteLabel);

  // Curves for all 4 mode
  const curveQ1 = s('path', { fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2 });
  const curveQ2 = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2 });
  const curveQ3 = s('path', { fill: 'none', stroke: 'var(--orange, #e69138)', 'stroke-width': 2 });
  const curveQ4 = s('path', { fill: 'none', stroke: 'var(--pink)', 'stroke-width': 2.5 });
  // Primary active curve
  const curveActive = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 3 });

  plane.layers.curve.append(curveQ1, curveQ2, curveQ3, curveQ4, curveActive);

  // Growth arrow and test points
  const growthGroup = s('g', { class: 'exp-growth-arrow' });
  const arrowLine = s('line', {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    stroke: 'var(--green)',
    'stroke-width': 2.5,
  });
  const arrowHead = s('polygon', { points: '0,0 0,0 0,0', fill: 'var(--green)' });
  const arrowText = s('text', { class: 'exp-svg-label', 'font-size': '11px', 'font-weight': 'bold' }, '');
  growthGroup.append(arrowLine, arrowHead, arrowText);
  plane.layers.marks.append(growthGroup);

  // Points P1 and P2
  const ptP1 = s('circle', { r: 5, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const ptP2 = s('circle', { r: 5, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const ptIntercept = s('circle', { r: 5.5, fill: 'var(--accent)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const labelIntercept = s('text', { class: 'exp-svg-label', 'font-size': '11px', fill: 'var(--accent)' }, '');
  plane.layers.marks.append(ptP1, ptP2, ptIntercept, labelIntercept);

  // 3. Render pipeline
  const render = (state) => {
    updateQuadChips(state.quadrant);

    let k = state.k;
    let a = state.a;

    // Guard against forbidden values (elastic snap)
    if (k === 0) k = 0.5;
    if (a === 1) a = 1.1;

    kSlider.value = String(k);
    aSlider.value = String(a);

    const isAll4 = state.quadrant === 'all_4';

    if (isAll4) {
      setVisible(curveQ1, true);
      setVisible(curveQ2, true);
      setVisible(curveQ3, true);
      setVisible(curveQ4, true);
      setVisible(curveActive, false);
      setVisible(growthGroup, false);
      setVisible(ptP1, false);
      setVisible(ptP2, false);
      setVisible(ptIntercept, false);
      setVisible(labelIntercept, false);

      curveQ1.setAttribute('d', plane.fnPath((x) => 3 * Math.pow(2, x), -4, 4));
      curveQ2.setAttribute('d', plane.fnPath((x) => 3 * Math.pow(0.5, x), -4, 4));
      curveQ3.setAttribute('d', plane.fnPath((x) => -3 * Math.pow(2, x), -4, 4));
      curveQ4.setAttribute('d', plane.fnPath((x) => -3 * Math.pow(0.5, x), -4, 4));

      const rows = [
        ['Las 4 Familias Canónicas de Exactas', 'Q1: 3·2ˣ (creciente) | Q2: 3·(½)ˣ (decreciente) | Q3: −3·2ˣ (decreciente) | Q4: −3·(½)ˣ (¡creciente!).'],
        ['Eje de Simetría k', 'El signo de k refleja la curva verticalmente respecto al eje X. Si k > 0 la imagen es (0; +∞); si k < 0 la imagen es (−∞; 0).'],
        ['Eje de Simetría a', 'La base a > 1 crece hacia la derecha si k > 0; pero si k < 0, se hunde hacia −∞ haciendo que decrezca.'],
      ];
      renderReadout(board.readout, 'Análisis de las 4 Familias', rows);
      return;
    }

    // Single active quadrant mode
    setVisible(curveQ1, false);
    setVisible(curveQ2, false);
    setVisible(curveQ3, false);
    setVisible(curveQ4, false);
    setVisible(curveActive, true);
    setVisible(growthGroup, true);
    setVisible(ptP1, true);
    setVisible(ptP2, true);
    setVisible(ptIntercept, true);
    setVisible(labelIntercept, true);

    curveActive.setAttribute('d', plane.fnPath((x) => k * Math.pow(a, x), -4, 4));
    curveActive.setAttribute('stroke', k > 0 ? (a > 1 ? 'var(--blue)' : 'var(--yellow)') : (a > 1 ? 'var(--orange, #e69138)' : 'var(--pink)'));

    // Intercept (0, k)
    const interceptPx = plane.sx(0);
    const interceptPy = plane.sy(k);
    ptIntercept.setAttribute('cx', String(interceptPx));
    ptIntercept.setAttribute('cy', String(interceptPy));
    labelIntercept.setAttribute('x', String(interceptPx + 8));
    labelIntercept.setAttribute('y', String(interceptPy - 6));
    setText(labelIntercept, `(0; ${fmt(k)})`);

    // Test points x1 = 0, x2 = 1
    const x1 = 0;
    const x2 = 1;
    const y1 = k * Math.pow(a, x1);
    const y2 = k * Math.pow(a, x2);

    const px1 = plane.sx(x1);
    const py1 = plane.sy(y1);
    const px2 = plane.sx(x2);
    const py2 = plane.sy(y2);

    ptP1.setAttribute('cx', String(px1));
    ptP1.setAttribute('cy', String(py1));
    ptP2.setAttribute('cx', String(px2));
    ptP2.setAttribute('cy', String(py2));

    const isIncreasing = y2 > y1;
    const arrowColor = isIncreasing ? 'var(--green)' : 'var(--pink)';

    arrowLine.setAttribute('x1', String(px2 + 15));
    arrowLine.setAttribute('y1', String(py1));
    arrowLine.setAttribute('x2', String(px2 + 15));
    arrowLine.setAttribute('y2', String(py2));
    arrowLine.setAttribute('stroke', arrowColor);

    const arrowY = isIncreasing ? py2 - 4 : py2 + 4;
    arrowHead.setAttribute('fill', arrowColor);
    if (isIncreasing) {
      arrowHead.setAttribute('points', `${px2 + 11},${py2 + 4} ${px2 + 19},${py2 + 4} ${px2 + 15},${py2 - 4}`);
    } else {
      arrowHead.setAttribute('points', `${px2 + 11},${py2 - 4} ${px2 + 19},${py2 - 4} ${px2 + 15},${py2 + 4}`);
    }

    arrowText.setAttribute('x', String(px2 + 25));
    arrowText.setAttribute('y', String((py1 + py2) / 2 + 4));
    arrowText.setAttribute('fill', arrowColor);
    setText(arrowText, isIncreasing ? 'CRECIENTE' : 'DECRECIENTE');

    // Run exact mathematical logic analysis
    const analysis = analyzeExponential({ k, a, h: 0, c: 0 });

    const rows = [
      ['Función Analizada', `f(x) = ${fmt(k)} · ${a === 0.5 ? '(1/2)' : fmt(a)}ˣ`],
      ['Comportamiento de Monotonía', `Estrictamente ${analysis.monotonicity.toUpperCase()} en todo ℝ`],
      ['Conjunto Imagen', `Im(f) = ${analysis.image} con asíntota horizontal y = 0`],
    ];

    if (k < 0 && a < 1) {
      rows.push([
        '¡Alerta de Examen Parcial 2025!',
        `¡Ojo con la trampa! Aunque la base a = ${fmt(a)} < 1 parece "decreciente", como k = ${fmt(k)} < 0 cada valor se multiplica por un negativo, invirtiendo la desigualdad: f(0) = ${fmt(y1)} < f(1) = ${fmt(y2)}. ¡La curva sube de izquierda a derecha hacia el cero!`,
      ]);
    } else {
      rows.push([
        'Regla de los Signos',
        `k ${k > 0 ? '> 0' : '< 0'} y base a ${a > 1 ? '> 1' : '< 1'} ⟹ curva ${isIncreasing ? 'creciente' : 'decreciente'}.`,
      ]);
    }

    renderReadout(board.readout, 'Radiografía del Cuadrante', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ quadrant: 'q4', k: -3, a: 0.5, showLiveTable: true }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initCuadranteKaWidget };
