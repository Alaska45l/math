/**
 * radiografia-exp.js — Widget 9 (F21)
 * Radiografía completa de una función exponencial en ℝ:
 * Dom, Im, asíntota, P_y, C₀, C⁺, C⁻, I_crec, I_dec, y comportamiento en ±∞.
 * Estudio analítico riguroso y casos característicos de examen.
 */

import {
  createCartesianBoard,
  createStore,
  addChips,
  renderReadout,
  fmt,
  s,
  setText,
  setVisible,
} from './board-kit.js';
import { analyzeExponential } from '../logic.js';

const PRESETS = {
  ej14: {
    label: '2 − (½)ˣ (Asíntota y=2)',
    k: -1,
    a: 0.5,
    h: 0,
    c: 2,
    formulaDisplay: 'f(x) = 2 − (1/2)ˣ',
    note: 'Raíz en x = −1, estrictamente creciente en todo ℝ.',
  },
  parcial2025: {
    label: '1 − (½)ˣ (Pasa por el origen)',
    k: -1,
    a: 0.5,
    h: 0,
    c: 1,
    formulaDisplay: 'f(x) = 1 − (1/2)ˣ',
    note: 'Raíz y ordenada al origen coinciden en (0; 0), C⁺ = (0; +∞), Im = (−∞; 1).',
  },
  parcial_dec: {
    label: '1 − 2ˣ (Decreciente)',
    k: -1,
    a: 2,
    h: 0,
    c: 1,
    formulaDisplay: 'g(x) = 1 − 2ˣ',
    note: 'Estrictamente decreciente en todo ℝ, C⁺ = (−∞; 0).',
  },
  sin_corte: {
    label: '2·3ˣ + 1 (Sin raíz real)',
    k: 2,
    a: 3,
    h: 0,
    c: 1,
    formulaDisplay: 'h(x) = 2 · 3ˣ + 1',
    note: 'Como k y c son positivos, la curva nunca corta al eje X: C₀ = ∅, C⁺ = ℝ.',
  },
};

const HIGHLIGHTS = [
  ['all', 'Vista general'],
  ['root', 'Raíz C₀'],
  ['intercept', 'Ordenada P_y'],
  ['asymptote', 'Asíntota y = c'],
  ['cpos', 'C⁺ Positividad'],
  ['cneg', 'C⁻ Negatividad'],
];

export function initWidget(container, options = {}) {
  const board = createCartesianBoard(
    container,
    'Radiografía Analítica Completa',
    {
      width: 640,
      height: 340,
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      xStep: 1,
      yStep: 1,
    },
  );

  const plane = board.plane;

  const defaultPreset = options.preset || 'ej14';
  const initial = PRESETS[defaultPreset] || PRESETS.ej14;

  const store = createStore({
    preset: defaultPreset,
    highlight: 'all',
  });

  // 1. Controls
  const presetOptions = Object.entries(PRESETS).map(([k, p]) => [k, p.label]);
  const updatePresetChips = addChips(
    board.controls,
    presetOptions,
    store.get().preset,
    (key) => store.set({ preset: key }),
    'Funciones para Analizar',
  );

  const updateHighlightChips = addChips(
    board.controls,
    HIGHLIGHTS,
    store.get().highlight,
    (h) => store.set({ highlight: h }),
    'Enfocar en Gráfica',
  );

  // 2. SVG Elements
  // Shade layers for C+ and C-
  const shadeGroupPos = s('path', {
    fill: 'rgba(174, 209, 162, 0.2)',
    stroke: 'none',
    visibility: 'hidden',
  });
  const shadeGroupNeg = s('path', {
    fill: 'rgba(227, 161, 161, 0.2)',
    stroke: 'none',
    visibility: 'hidden',
  });
  plane.layers.shade.append(shadeGroupPos, shadeGroupNeg);

  // Asymptote line y = c
  const asymptoteLine = s('line', {
    x1: plane.sx(-5),
    y1: 0,
    x2: plane.sx(5),
    y2: 0,
    stroke: 'var(--blue)',
    'stroke-dasharray': '5 4',
    'stroke-width': 2,
  });
  const asymptoteLabel = s('text', {
    x: plane.sx(4.8),
    y: 0,
    class: 'exp-svg-label',
    fill: 'var(--blue)',
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

  // Markers: Root C0 (orange) and Y-intercept Py (purple)
  const ptRoot = s('circle', {
    r: 6,
    fill: 'var(--orange, #e69138)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
  });
  const labelRoot = s('text', {
    class: 'exp-svg-label',
    'font-size': '11px',
    'font-weight': 'bold',
    fill: 'var(--orange, #e69138)',
  }, '');

  const ptIntercept = s('circle', {
    r: 6,
    fill: 'var(--purple, #b4a7d6)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
  });
  const labelIntercept = s('text', {
    class: 'exp-svg-label',
    'font-size': '11px',
    'font-weight': 'bold',
    fill: 'var(--purple, #b4a7d6)',
  }, '');

  plane.layers.marks.append(ptRoot, labelRoot, ptIntercept, labelIntercept);

  // 3. Render pipeline
  const render = (state) => {
    updatePresetChips(state.preset);
    updateHighlightChips(state.highlight);

    const model = PRESETS[state.preset] || PRESETS.ej14;
    const { k, a, h, c } = model;
    const hl = state.highlight;

    // Run exact mathematical logic analysis
    const analysis = analyzeExponential({ k, a, h, c });

    // Update curve
    const pathD = plane.fnPath((x) => k * Math.pow(a, x - h) + c, -5, 5);
    curvePath.setAttribute('d', pathD);

    // Update asymptote
    const syC = plane.sy(c);
    asymptoteLine.setAttribute('y1', String(syC));
    asymptoteLine.setAttribute('y2', String(syC));
    asymptoteLabel.setAttribute('y', String(syC - 6));
    setText(asymptoteLabel, `Asíntota y = ${fmt(c)}`);

    const showAsymptote = hl === 'all' || hl === 'asymptote';
    setVisible(asymptoteLine, showAsymptote);
    setVisible(asymptoteLabel, showAsymptote);

    // Intercept Py = (0, f(0))
    const y0 = k * Math.pow(a, -h) + c;
    const sx0 = plane.sx(0);
    const sy0 = plane.sy(y0);
    ptIntercept.setAttribute('cx', String(sx0));
    ptIntercept.setAttribute('cy', String(sy0));

    const showIntercept = hl === 'all' || hl === 'intercept';
    setVisible(ptIntercept, showIntercept);
    setVisible(labelIntercept, showIntercept);

    // Root C0
    const hasRealRoot = analysis.root !== null;
    if (hasRealRoot) {
      const x0 = analysis.root;
      const sxRoot = plane.sx(x0);
      const syRoot = plane.sy(0);
      ptRoot.setAttribute('cx', String(sxRoot));
      ptRoot.setAttribute('cy', String(syRoot));

      const pointsCoincide = Math.abs(sxRoot - sx0) < 8 && Math.abs(syRoot - sy0) < 8;
      if (pointsCoincide) {
        // Vertically offset >= 24px: C0 above (-12px), Py below (+16px) => 28px separation
        labelRoot.setAttribute('x', String(sxRoot + 8));
        labelRoot.setAttribute('y', String(syRoot - 12));
        labelIntercept.setAttribute('x', String(sx0 + 8));
        labelIntercept.setAttribute('y', String(sy0 + 16));
      } else {
        labelRoot.setAttribute('x', String(sxRoot + 8));
        labelRoot.setAttribute('y', String(syRoot - 8));
        labelIntercept.setAttribute('x', String(sx0 + 8));
        labelIntercept.setAttribute('y', String(sy0 - 6));
      }

      setText(labelIntercept, `P_y(0; ${fmt(y0)})`);
      setText(labelRoot, `C₀ = { ${fmt(x0)} }`);

      const showRoot = hl === 'all' || hl === 'root';
      setVisible(ptRoot, showRoot);
      setVisible(labelRoot, showRoot);

      // Shade C+ and C-
      if (hl === 'cpos' || hl === 'all') {
        const isCrec = analysis.isGrowth;
        const xLo = isCrec ? x0 : -5;
        const xHi = isCrec ? 5 : x0;
        const shadeD = [
          `M ${plane.sx(xLo)} ${plane.sy(0)}`,
          `L ${plane.sx(xLo)} ${plane.sy(isCrec ? c : y0)}`,
          `L ${plane.sx(xHi)} ${plane.sy(isCrec ? c : 0)}`,
          `L ${plane.sx(xHi)} ${plane.sy(0)}`,
          'Z',
        ].join(' ');
        shadeGroupPos.setAttribute('d', shadeD);
        setVisible(shadeGroupPos, true);
      } else {
        setVisible(shadeGroupPos, false);
      }

      if (hl === 'cneg' || hl === 'all') {
        const isCrec = analysis.isGrowth;
        const xLo = isCrec ? -5 : x0;
        const xHi = isCrec ? x0 : 5;
        const shadeD = [
          `M ${plane.sx(xLo)} ${plane.sy(0)}`,
          `L ${plane.sx(xLo)} ${plane.sy(-5)}`,
          `L ${plane.sx(xHi)} ${plane.sy(-5)}`,
          `L ${plane.sx(xHi)} ${plane.sy(0)}`,
          'Z',
        ].join(' ');
        shadeGroupNeg.setAttribute('d', shadeD);
        setVisible(shadeGroupNeg, true);
      } else {
        setVisible(shadeGroupNeg, false);
      }
    } else {
      labelIntercept.setAttribute('x', String(sx0 + 8));
      labelIntercept.setAttribute('y', String(sy0 - 6));
      setText(labelIntercept, `P_y(0; ${fmt(y0)})`);
      setVisible(ptRoot, false);
      setVisible(labelRoot, false);
      setVisible(shadeGroupPos, hl === 'cpos' || hl === 'all');
      setVisible(shadeGroupNeg, false);
    }

    // Build the 9 official properties for readout
    const rows = [
      ['Fórmula Analítica', `${model.formulaDisplay} (${model.note})`],
      ['1. Dominio', 'Dom(f) = ℝ (todo número real tiene imagen)'],
      ['2. Conjunto Imagen', `Im(f) = ${analysis.image} (intervalo abierto sin tocar la asíntota)`],
      ['3. Asíntota Horizontal', `Recta ${analysis.asymptote}`],
      ['4. Ordenada al Origen', `P_y = (0; ${fmt(y0)})`],
      ['5. Conjunto de Ceros C₀', hasRealRoot ? `C₀ = { ${fmt(analysis.root)} }` : 'C₀ = ∅ (la curva no corta al eje X)'],
      ['6. Positividad C⁺ y Negatividad C⁻', `C⁺ = ${analysis.cPos} | C⁻ = ${analysis.cNeg}`],
      ['7. Monotonía', `Estrictamente ${analysis.monotonicity.toUpperCase()} en todo ℝ (I_${analysis.monotonicity === 'creciente' ? '↑' : '↓'} = ℝ)`],
    ];

    renderReadout(board.readout, 'Radiografía Analítica Completa', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ preset: 'ej14', highlight: 'all' }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initRadiografiaExpWidget };
