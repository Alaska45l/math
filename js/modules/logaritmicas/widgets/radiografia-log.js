/**
 * radiografia-log.js — Widget 5 (sec-5)
 * Radiografía funcional completa de f(x) = k · log_a(m·x + d) + c:
 * Dom, Im, asíntota vertical x = -d/m, C₀, P_y, C⁺, C⁻, monotonía y biyectividad.
 * Incluye casos desplazados clásicos (log_{1/2}(x+1), log_2(4-x), intersección) y modo personalizado.
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
import { analyzeLogFunction } from '../logic.js';

const PRESETS = {
  log_half_shift: {
    label: 'log_(1/2)(x + 1)',
    k: 1, a: 0.5, m: 1, d: 1, c: 0,
    formulaDisplay: 'f(x) = log_(1/2)(x + 1)',
    note: 'Decreciente en (−1; +∞), A.V. x = −1, raíz y ordenada coinciden en (0; 0).',
  },
  log_4_minus_x: {
    label: 'log₂(4 − x)',
    k: 1, a: 2, m: -1, d: 4, c: 0,
    formulaDisplay: 'f(x) = log₂(4 − x)',
    note: 'Argumento 4 − x > 0 ⇒ vive a la izquierda: Dom = (−∞; 4) y es decreciente.',
  },
  ln_x: {
    label: 'ln(x)',
    k: 1, a: Math.E, m: 1, d: 0, c: 0,
    formulaDisplay: 'f(x) = ln(x)',
    note: 'Logaritmo natural canónico: Dom = (0; +∞), sin P_y, C₀ = { 1 }.',
  },
  intersection_case: {
    label: 'Corte log₂(4x+8) y 3 + log₂(x−2)',
    k: 1, a: 2, m: 4, d: 8, c: 0,
    partner: { k: 1, a: 2, m: 1, d: -2, c: 3 },
    formulaDisplay: 'f(x) = log₂(4x + 8)  vs  g(x) = 3 + log₂(x − 2)',
    note: 'Se intersectan en el punto (6; 5), dentro del dominio común x > 2.',
  },
  custom: {
    label: 'Personalizado',
    k: 1, a: 2, m: 1, d: 1, c: 0,
    formulaDisplay: '',
    note: 'Ajustá base, dirección del argumento y desplazamiento.',
  },
};

const HIGHLIGHTS = [
  ['all', 'Vista general'],
  ['domain', 'Dominio y A.V.'],
  ['root', 'Raíz C₀'],
  ['intercept', 'Ordenada P_y'],
  ['signs', 'C⁺ / C⁻'],
];

export function initWidget(container, options = {}) {
  const board = createCartesianBoard(
    container,
    'Radiografía Funcional Logarítmica',
    {
      width: 640,
      height: 340,
      xMin: -5,
      xMax: 8,
      yMin: -4,
      yMax: 6,
      xStep: 1,
      yStep: 1,
    },
  );
  const plane = board.plane;

  const store = createStore({
    preset: options.preset || 'log_half_shift',
    highlight: 'all',
    a: 0.5,
    m: 1,
    d: 1,
    probeX: 1,
  });

  // 0. POE 2 etapas
  const predictBox = createPredictBox({
    prompt: 'Para f(x) = log₂(4 − x), ¿cuál es su dominio y sentido de crecimiento?',
    options: [
      {
        label: 'Dom = (−∞; 4) y estrictamente decreciente',
        correct: true,
        explanation: '¡Exacto! 4 − x > 0 exige x < 4, y al tener m = −1 con base 2 > 1 la curva decrece hacia −∞ cerca de x = 4.',
      },
      {
        label: 'Dom = (4; +∞) y estrictamente creciente',
        correct: false,
        explanation: 'Si x > 4 entonces 4 − x es negativo y el logaritmo no existe en ℝ.',
      },
    ],
    onVerify: () => {
      store.set({ preset: 'log_4_minus_x', highlight: 'domain', a: 2, m: -1, d: 4, probeX: 0 });
    },
  });
  board.controls.prepend(predictBox);

  // 1. Controles
  const presetOpts = Object.entries(PRESETS).map(([k, p]) => [k, p.label]);
  const updatePresetChips = addChips(
    board.controls,
    presetOpts,
    store.get().preset,
    (key) => {
      predictBox.notifyInteraction();
      const p = PRESETS[key] || PRESETS.log_half_shift;
      store.set({ preset: key, a: p.a, m: p.m, d: p.d, probeX: p.m > 0 ? Math.max(0.5, -p.d / p.m + 1) : Math.min(2, -p.d / p.m - 1) });
    },
    'Función a Analizar',
  );

  const updateHighlightChips = addChips(
    board.controls,
    HIGHLIGHTS,
    store.get().highlight,
    (hl) => {
      predictBox.notifyInteraction();
      store.set({ highlight: hl });
    },
    'Enfocar Elemento',
  );

  const { input: mSlider, output: mOutput } = addRange(board.controls, store, 'm', 'Pendiente interior m', -2, 2, store.get().m, 1, (v) => `m = ${fmt(v)}`);
  const { input: dSlider, output: dOutput } = addRange(board.controls, store, 'd', 'Desplazamiento d', -4, 4, store.get().d, 1, (v) => `d = ${fmt(v)}`);
  [mSlider, dSlider].forEach((sl) => {
    sl.addEventListener('input', () => {
      predictBox.notifyInteraction();
      let mv = Number(mSlider.value);
      if (mv === 0) mv = 1;
      store.set({ preset: 'custom', m: mv, d: Number(dSlider.value) });
    });
  });

  // 2. Capas SVG fijos
  const shadePos = s('path', { fill: 'rgba(142, 219, 159, 0.18)', stroke: 'none' });
  const shadeNeg = s('path', { fill: 'rgba(227, 161, 161, 0.18)', stroke: 'none' });
  const forbiddenShade = s('rect', { x: plane.box.x, y: plane.box.y, width: 0, height: plane.box.h, fill: 'rgba(227, 161, 161, 0.10)' });
  plane.layers.shade.append(forbiddenShade, shadePos, shadeNeg);

  const asymLine = plotVerticalAsymptote(plane, -1, { stroke: 'var(--blue)', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
  const asymLabel = s('text', { class: 'log-svg-label', fill: 'var(--blue)', 'font-size': '11px' }, '');
  plane.layers.under.append(asymLine, asymLabel);

  const curveMain = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2.6 });
  const curvePartner = s('path', { fill: 'none', stroke: 'var(--green)', 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
  plane.layers.curve.append(curvePartner, curveMain);

  const ptRoot = s('circle', { r: 6, fill: 'var(--orange, #f4a261)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const lblRoot = s('text', { class: 'log-svg-label', fill: 'var(--orange, #f4a261)', 'font-size': '11px' }, '');
  const ptIntercept = s('circle', { r: 6, fill: 'var(--purple, #c3a6ff)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const lblIntercept = s('text', { class: 'log-svg-label', fill: 'var(--purple, #c3a6ff)', 'font-size': '11px' }, '');
  const ptIntersect = s('circle', { r: 6, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const lblIntersect = s('text', { class: 'log-svg-label', fill: 'var(--green)', 'font-size': '11px' }, '');
  plane.layers.marks.append(ptRoot, lblRoot, ptIntercept, lblIntercept, ptIntersect, lblIntersect);

  const probeMarker = addDraggableMarker(board, plane, 1, -1, {
    color: 'var(--yellow)',
    snapStep: 0.5,
    label: 'Sonda',
    onDrag: ({ x, phase }) => {
      if (phase === 'start') predictBox.notifyInteraction();
      store.set({ probeX: x });
    },
  });

  // 3. Render
  const render = (state) => {
    updatePresetChips(state.preset);
    updateHighlightChips(state.highlight);

    const cfg = PRESETS[state.preset] || PRESETS.custom;
    const k = cfg.k ?? 1;
    const a = state.preset === 'custom' ? (state.a === 1 ? 2 : state.a) : cfg.a;
    const m = state.preset === 'custom' ? (state.m === 0 ? 1 : state.m) : cfg.m;
    const d = state.preset === 'custom' ? state.d : cfg.d;
    const c = cfg.c ?? 0;

    mSlider.value = String(m);
    mOutput.textContent = `m = ${fmt(m)}`;
    dSlider.value = String(d);
    dOutput.textContent = `d = ${fmt(d)}`;

    const analysis = analyzeLogFunction({ k, a, m, d, c });
    const hl = state.highlight;

    curveMain.setAttribute('d', plotLogCurve(plane, { k, a, m, d, c }));

    // Curva compañera en caso de intersección
    if (cfg.partner) {
      curvePartner.setAttribute('d', plotLogCurve(plane, cfg.partner));
      setVisible(curvePartner, true);
      const pInt = clampToPlane(plane, plane.sx(6), plane.sy(5), 6);
      ptIntersect.setAttribute('cx', String(pInt.cx));
      ptIntersect.setAttribute('cy', String(pInt.cy));
      const ancI = anchorPlaneLabel(plane, pInt.cx, pInt.cy, 80);
      lblIntersect.setAttribute('x', String(ancI.lx));
      lblIntersect.setAttribute('y', String(ancI.ly));
      lblIntersect.setAttribute('text-anchor', ancI.anchor);
      setText(lblIntersect, 'Corte (6; 5)');
      setVisible(ptIntersect, true);
      setVisible(lblIntersect, true);
    } else {
      setVisible(curvePartner, false);
      setVisible(ptIntersect, false);
      setVisible(lblIntersect, false);
    }

    // Asíntota vertical x = asymptoteX
    const sxAs = plane.sx(analysis.asymptoteX);
    asymLine.setAttribute('x1', String(sxAs));
    asymLine.setAttribute('x2', String(sxAs));
    asymLabel.setAttribute('x', String(Math.min(plane.box.x + plane.box.w - 60, Math.max(plane.box.x + 8, sxAs + 6))));
    asymLabel.setAttribute('y', String(plane.box.y + 18));
    setText(asymLabel, `A.V. ${analysis.asymptote}`);
    const showAsym = hl === 'all' || hl === 'domain';
    setVisible(asymLine, showAsym);
    setVisible(asymLabel, showAsym);

    // Sombreado de región prohibida fuera del dominio
    if (hl === 'domain' || hl === 'all') {
      if (m > 0) {
        const w = Math.max(0, Math.min(plane.box.w, sxAs - plane.box.x));
        forbiddenShade.setAttribute('x', String(plane.box.x));
        forbiddenShade.setAttribute('width', String(w));
      } else {
        const xStart = Math.max(plane.box.x, sxAs);
        const w = Math.max(0, plane.box.x + plane.box.w - xStart);
        forbiddenShade.setAttribute('x', String(xStart));
        forbiddenShade.setAttribute('width', String(w));
      }
      setVisible(forbiddenShade, true);
    } else {
      setVisible(forbiddenShade, false);
    }

    // Raíz C0 y Ordenada Py (con desfase si coinciden en (0;0))
    const pRoot = clampToPlane(plane, plane.sx(analysis.root), plane.sy(0), 6);
    ptRoot.setAttribute('cx', String(pRoot.cx));
    ptRoot.setAttribute('cy', String(pRoot.cy));
    setText(lblRoot, `C₀ = { ${fmt(Number(analysis.root.toFixed(2)))} }`);
    const showRoot = hl === 'all' || hl === 'root';
    setVisible(ptRoot, showRoot);
    setVisible(lblRoot, showRoot);

    const hasPy = analysis.yIntercept !== null;
    if (hasPy) {
      const pPy = clampToPlane(plane, plane.sx(0), plane.sy(analysis.yIntercept), 6);
      ptIntercept.setAttribute('cx', String(pPy.cx));
      ptIntercept.setAttribute('cy', String(pPy.cy));
      setText(lblIntercept, `P_y(0; ${fmt(Number(analysis.yIntercept.toFixed(2)))})`);
      const coincide = Math.abs(pRoot.cx - pPy.cx) < 10 && Math.abs(pRoot.cy - pPy.cy) < 10;
      if (coincide) {
        lblRoot.setAttribute('x', String(pRoot.cx + 8));
        lblRoot.setAttribute('y', String(pRoot.cy - 14));
        lblIntercept.setAttribute('x', String(pPy.cx + 8));
        lblIntercept.setAttribute('y', String(pPy.cy + 16));
      } else {
        const ancR = anchorPlaneLabel(plane, pRoot.cx, pRoot.cy, 70);
        lblRoot.setAttribute('x', String(ancR.lx));
        lblRoot.setAttribute('y', String(ancR.ly));
        lblRoot.setAttribute('text-anchor', ancR.anchor);
        const ancP = anchorPlaneLabel(plane, pPy.cx, pPy.cy, 75);
        lblIntercept.setAttribute('x', String(ancP.lx));
        lblIntercept.setAttribute('y', String(ancP.ly));
        lblIntercept.setAttribute('text-anchor', ancP.anchor);
      }
    } else {
      const ancR = anchorPlaneLabel(plane, pRoot.cx, pRoot.cy, 70);
      lblRoot.setAttribute('x', String(ancR.lx));
      lblRoot.setAttribute('y', String(ancR.ly));
      lblRoot.setAttribute('text-anchor', ancR.anchor);
    }
    const showPy = hasPy && (hl === 'all' || hl === 'intercept');
    setVisible(ptIntercept, showPy);
    setVisible(lblIntercept, showPy);

    // Sombreado C+ / C-
    const buildShade = (xA, xB) => {
      const lo = Math.max(-5, Math.min(xA, xB));
      const hi = Math.min(8, Math.max(xA, xB));
      if (hi - lo < 0.05) return '';
      const pts = [];
      for (let i = 0; i <= 28; i++) {
        const cx = lo + (i / 28) * (hi - lo);
        const val = analysis.evaluate(cx);
        const cy = Number.isFinite(val) ? Math.max(-4, Math.min(6, val)) : 0;
        pts.push(`L ${plane.sx(cx).toFixed(1)} ${plane.sy(cy).toFixed(1)}`);
      }
      return `M ${plane.sx(lo).toFixed(1)} ${plane.sy(0).toFixed(1)} ${pts.join(' ')} L ${plane.sx(hi).toFixed(1)} ${plane.sy(0).toFixed(1)} Z`;
    };

    const showSigns = hl === 'signs' || hl === 'all';
    if (showSigns) {
      const cPosLo = Number.isFinite(analysis.cPosSpec.lo) ? analysis.cPosSpec.lo : -5;
      const cPosHi = Number.isFinite(analysis.cPosSpec.hi) ? analysis.cPosSpec.hi : 8;
      const cNegLo = Number.isFinite(analysis.cNegSpec.lo) ? analysis.cNegSpec.lo : -5;
      const cNegHi = Number.isFinite(analysis.cNegSpec.hi) ? analysis.cNegSpec.hi : 8;
      shadePos.setAttribute('d', buildShade(cPosLo + 0.02, cPosHi - 0.02));
      shadeNeg.setAttribute('d', buildShade(cNegLo + 0.02, cNegHi - 0.02));
    }
    setVisible(shadePos, showSigns);
    setVisible(shadeNeg, showSigns);

    // Sonda viva
    const probeVal = analysis.evaluate(state.probeX);
    probeMarker.setPos(state.probeX, Number.isFinite(probeVal) ? probeVal : 0);

    const probeStatus = Number.isFinite(probeVal)
      ? `Sonda (${fmt(state.probeX)}; ${fmt(Number(probeVal.toFixed(2)))})`
      : `Sonda x = ${fmt(state.probeX)} ∉ Dom(f)`;
    const formulaTxt = cfg.formulaDisplay || `f(x) = log_${fmt(a)}(${fmt(m)}x ${d >= 0 ? '+ ' + fmt(d) : '− ' + fmt(-d)})`;
    renderReadout(board.readout, 'Radiografía Analítica Completa', [
      ['Fórmula', `${formulaTxt} (${cfg.note})`],
      ['1. Dominio e Imagen', `Dom(f) = ${analysis.domain}  |  Im(f) = ${analysis.image}  |  A.V.: ${analysis.asymptote}`],
      ['2. Cortes y Signos', `C₀ = ${analysis.rootsSet}  |  P_y = ${hasPy ? `(0; ${fmt(Number(analysis.yIntercept.toFixed(2)))})` : 'No tiene (0 ∉ Dom)'}  |  C⁺ = ${analysis.cPos}  |  C⁻ = ${analysis.cNeg}`],
      ['3. Monotonía y Sonda', `Estrictamente ${analysis.monotonicity} · Biyectiva Dom(f) → ℝ · ${probeStatus}`],
    ]);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ preset: 'log_half_shift', highlight: 'all', a: 0.5, m: 1, d: 1, probeX: 1 }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initRadiografiaLogWidget };
