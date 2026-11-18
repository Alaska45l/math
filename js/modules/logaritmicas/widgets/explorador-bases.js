/**
 * explorador-bases.js — Widget 1 (sec-1)
 * Compara y = log_a(x) para a > 1 (2, e, 10) vs 0 < a < 1 (1/2, 1/3),
 * bases especiales (log, ln) y aduana de existencia (a > 0, a != 1, x > 0).
 */

import {
  createCartesianBoard,
  createPredictBox,
  createStore,
  addChips,
  addRange,
  button,
  addDraggableMarker,
  renderReadout,
  plotLogCurve,
  anchorPlaneLabel,
  clampToPlane,
  fmt,
  s,
  setText,
  setVisible,
} from './board-kit.js';

const MODES = [
  ['gt1', 'Bases a > 1 (2, e, 10)'],
  ['lt1', 'Bases 0 < a < 1 (1/2, 1/3)'],
  ['customs', 'Aduana de existencia'],
];

const CUSTOM_TRAPS = [
  ['valid_2', 'a = 2, x = 8 (Válido)'],
  ['arg_zero', 'x = 0 (Argumento nulo)'],
  ['arg_neg', 'x = −2 (Argumento negativo)'],
  ['base_one', 'a = 1 (Base prohibida)'],
  ['base_neg', 'a = −2 (Base negativa)'],
];

export function initWidget(container, options = {}) {
  const board = createCartesianBoard(
    container,
    'Explorador de Bases y Aduana de Existencia Logarítmica',
    {
      width: 640,
      height: 340,
      xMin: -3,
      xMax: 11,
      yMin: -4,
      yMax: 4,
      xStep: 1,
      yStep: 1,
    },
  );
  const plane = board.plane;

  const store = createStore({
    mode: options.mode || 'gt1',
    base: 2,
    probeX: 4,
    trap: 'valid_2',
  });

  // 0. POE 2 etapas
  const predictBox = createPredictBox({
    prompt: 'Si comparamos log₂(x) y log₁₀(x) para x = 100, ¿cuál da un valor más grande?',
    options: [
      {
        label: 'log₂(100) ≈ 6,64 es mayor que log₁₀(100) = 2',
        correct: true,
        explanation: '¡Exacto! Con base más chica (2 < 10) necesitás multiplicar más veces para alcanzar 100: 2^6,64 ≈ 100 frente a 10² = 100.',
      },
      {
        label: 'log₁₀(100) es mayor porque 10 es más grande que 2',
        correct: false,
        explanation: 'Al revés: como la base 10 crece más rápido que la base 2, necesita un exponente menor (2) para llegar a 100.',
      },
    ],
    onVerify: () => {
      store.set({ mode: 'gt1', base: 2, probeX: 8 });
    },
  });
  board.controls.prepend(predictBox);

  // 1. Controles
  const updateModeChips = addChips(
    board.controls,
    MODES,
    store.get().mode,
    (mode) => {
      predictBox.notifyInteraction();
      if (mode === 'lt1' && store.get().base >= 1) {
        store.set({ mode, base: 0.5, trap: 'valid_2' });
      } else if (mode === 'gt1' && store.get().base <= 1) {
        store.set({ mode, base: 2, trap: 'valid_2' });
      } else {
        store.set({ mode });
      }
    },
    'Familia de Bases',
  );

  const updateTrapChips = addChips(
    board.controls,
    CUSTOM_TRAPS,
    store.get().trap,
    (trap) => {
      predictBox.notifyInteraction();
      const nextX = trap === 'arg_zero' ? 0 : (trap === 'arg_neg' ? -2 : 4);
      store.set({ mode: 'customs', trap, probeX: nextX });
    },
    'Casos de Aduana (x > 0, a > 0, a ≠ 1)',
  );
  const trapGroupEl = board.controls.lastElementChild;

  const formatBaseLabel = (v) => {
    if (Math.abs(v - Math.E) < 0.06) return 'e ≈ 2,72';
    if (Math.abs(v - 0.5) < 0.04) return '1/2 = 0,5';
    if (Math.abs(v - 1 / 3) < 0.04) return '1/3 ≈ 0,33';
    return fmt(v);
  };

  const { input: baseSlider, output: baseOutput } = addRange(
    board.controls,
    store,
    'base',
    'Base activa a',
    0.25,
    10,
    store.get().base,
    0.05,
    formatBaseLabel,
  );
  baseSlider.addEventListener('input', () => {
    predictBox.notifyInteraction();
    let val = Number(baseSlider.value);
    if (Math.abs(val - 1) < 0.06) {
      val = val >= 1 ? 1.15 : 0.85;
      baseSlider.value = String(val);
    }
    const nextMode = val < 1 ? 'lt1' : 'gt1';
    store.set({ mode: nextMode, base: val, trap: 'valid_2' });
  });

  const actionBtn = button('Probar x = 0 / x = −2 en la Aduana', 'warn', () => {
    predictBox.notifyInteraction();
    const cur = store.get();
    const nextTrap = cur.trap === 'arg_zero' ? 'arg_neg' : 'arg_zero';
    store.set({ mode: 'customs', trap: nextTrap, probeX: nextTrap === 'arg_zero' ? 0 : -2 });
  });
  board.actions.append(actionBtn);

  // 2. Capas SVG persistentes (sameNodeReference === true)
  const curveMain = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2.6 });
  const curveRefA = s('path', { fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2, 'stroke-dasharray': '5 3' });
  const curveRefB = s('path', { fill: 'none', stroke: 'var(--green)', 'stroke-width': 2, 'stroke-dasharray': '3 3' });
  const asymLine = s('line', {
    x1: plane.sx(0),
    y1: plane.box.y,
    x2: plane.sx(0),
    y2: plane.box.y + plane.box.h,
    stroke: 'var(--pink)',
    'stroke-width': 1.8,
    'stroke-dasharray': '5 4',
  });
  const blockedShade = s('rect', {
    x: plane.box.x,
    y: plane.box.y,
    width: Math.max(0, plane.sx(0) - plane.box.x),
    height: plane.box.h,
    fill: 'rgba(227, 161, 161, 0.14)',
  });
  plane.layers.shade.append(blockedShade);
  plane.layers.under.append(asymLine);
  plane.layers.curve.append(curveRefA, curveRefB, curveMain);

  // Ancla universal (1; 0)
  const anchorDot = s('circle', {
    cx: plane.sx(1),
    cy: plane.sy(0),
    r: 4.5,
    fill: 'var(--green)',
    stroke: 'var(--bg)',
    'stroke-width': 1.5,
  });
  const anchorText = s('text', {
    x: plane.sx(1) + 8,
    y: plane.sy(0) + 14,
    class: 'log-svg-label',
    fill: 'var(--green)',
    'font-size': '11px',
  }, '(1; 0)');

  const barrierBadge = s('text', {
    x: plane.sx(-1.5),
    y: plane.sy(2.6),
    class: 'log-svg-label',
    fill: 'var(--pink)',
    'font-size': '12px',
    'text-anchor': 'middle',
    'font-weight': 'bold',
  }, '');

  const labelRefA = s('text', { class: 'log-svg-label', fill: 'var(--blue)', 'font-size': '11px' }, '');
  const labelRefB = s('text', { class: 'log-svg-label', fill: 'var(--green)', 'font-size': '11px' }, '');
  plane.layers.marks.append(anchorDot, anchorText, barrierBadge, labelRefA, labelRefB);

  // Marcador arrastrable accesible por teclado (role="slider", tabindex="0")
  const probeMarker = addDraggableMarker(board, plane, 4, 2, {
    color: 'var(--yellow)',
    snapStep: 0.5,
    label: 'P',
    onDrag: ({ x, phase }) => {
      if (phase === 'start') predictBox.notifyInteraction();
      const clampedX = Math.max(-2.5, Math.min(10.5, x));
      const cur = store.get();
      if (cur.mode === 'customs' && clampedX > 0 && (cur.trap === 'arg_zero' || cur.trap === 'arg_neg')) {
        store.set({ probeX: clampedX, trap: 'valid_2' });
      } else {
        store.set({ probeX: clampedX });
      }
    },
  });

  // 3. Render
  const render = (state) => {
    updateModeChips(state.mode);
    updateTrapChips(state.trap);
    if (trapGroupEl) trapGroupEl.hidden = state.mode !== 'customs';
    baseSlider.value = String(state.base);
    baseOutput.textContent = formatBaseLabel(state.base);

    let activeBase = state.base;
    if (Math.abs(activeBase - Math.E) < 0.06) activeBase = Math.E;
    else if (Math.abs(activeBase - 1 / 3) < 0.04) activeBase = 1 / 3;
    else if (Math.abs(activeBase - 0.5) < 0.04) activeBase = 0.5;
    if (Math.abs(activeBase - 1) < 0.05) activeBase = 1.15;

    let isBlocked = false;
    let blockMsg = '';

    if (state.mode === 'customs') {
      if (state.trap === 'arg_zero') {
        isBlocked = true;
        blockMsg = '× log₂(0) ∉ ℝ (argumento nulo)';
      } else if (state.trap === 'arg_neg') {
        isBlocked = true;
        blockMsg = '× log₂(−2) ∉ ℝ (argumento ≤ 0)';
      } else if (state.trap === 'base_one') {
        isBlocked = true;
        blockMsg = '× a = 1 prohibida (1ʸ = 1 constante)';
      } else if (state.trap === 'base_neg') {
        isBlocked = true;
        blockMsg = '× a = −2 prohibida (a ≤ 0 fuera de ℝ)';
      }
    }

    if (state.probeX <= 0) {
      isBlocked = true;
      blockMsg = `× log(${fmt(state.probeX)}) ∉ ℝ (x ≤ 0 bloqueado)`;
    }

    if (state.mode === 'gt1') {
      curveMain.setAttribute('d', plotLogCurve(plane, { k: 1, a: activeBase > 1 ? activeBase : 2 }));
      curveRefA.setAttribute('d', plotLogCurve(plane, { k: 1, a: Math.E }));
      curveRefB.setAttribute('d', plotLogCurve(plane, { k: 1, a: 10 }));
      setVisible(curveRefA, true);
      setVisible(curveRefB, true);
      setVisible(labelRefA, true);
      setVisible(labelRefB, true);

      const posE = clampToPlane(plane, plane.sx(8.2), plane.sy(Math.log(8.2)), 10);
      const ancE = anchorPlaneLabel(plane, posE.cx, posE.cy, 50);
      labelRefA.setAttribute('x', String(ancE.lx));
      labelRefA.setAttribute('y', String(ancE.ly));
      labelRefA.setAttribute('text-anchor', ancE.anchor);
      setText(labelRefA, 'ln(x)');

      const pos10 = clampToPlane(plane, plane.sx(9.5), plane.sy(Math.log10(9.5)), 10);
      const anc10 = anchorPlaneLabel(plane, pos10.cx, pos10.cy, 55);
      labelRefB.setAttribute('x', String(anc10.lx));
      labelRefB.setAttribute('y', String(anc10.ly + 12));
      labelRefB.setAttribute('text-anchor', anc10.anchor);
      setText(labelRefB, 'log(x)');
    } else if (state.mode === 'lt1') {
      const b1 = activeBase < 1 ? activeBase : 0.5;
      curveMain.setAttribute('d', plotLogCurve(plane, { k: 1, a: b1 }));
      curveRefA.setAttribute('d', plotLogCurve(plane, { k: 1, a: 1 / 3 }));
      setVisible(curveRefA, true);
      setVisible(curveRefB, false);
      setVisible(labelRefA, true);
      setVisible(labelRefB, false);

      const pos3 = clampToPlane(plane, plane.sx(7.5), plane.sy(Math.log(7.5) / Math.log(1 / 3)), 10);
      const anc3 = anchorPlaneLabel(plane, pos3.cx, pos3.cy, 70);
      labelRefA.setAttribute('x', String(anc3.lx));
      labelRefA.setAttribute('y', String(anc3.ly));
      labelRefA.setAttribute('text-anchor', anc3.anchor);
      setText(labelRefA, 'log_(1/3)(x)');
    } else {
      const validCurve = !isBlocked || state.trap === 'arg_zero' || state.trap === 'arg_neg';
      curveMain.setAttribute('d', validCurve ? plotLogCurve(plane, { k: 1, a: 2 }) : '');
      setVisible(curveRefA, false);
      setVisible(curveRefB, false);
      setVisible(labelRefA, false);
      setVisible(labelRefB, false);
    }

    const usedBase = state.mode === 'customs' ? 2 : (state.mode === 'lt1' && activeBase >= 1 ? 0.5 : (state.mode === 'gt1' && activeBase <= 1 ? 2 : activeBase));
    const px = state.probeX;
    const py = px > 0 && usedBase > 0 && usedBase !== 1 ? Math.log(px) / Math.log(usedBase) : 0;
    probeMarker.setPos(px, py);

    setVisible(barrierBadge, isBlocked);
    setText(barrierBadge, blockMsg);

    const baseStr = Math.abs(usedBase - Math.E) < 1e-6 ? 'e' : (Math.abs(usedBase - 0.5) < 1e-6 ? '1/2' : (Math.abs(usedBase - 1 / 3) < 1e-6 ? '1/3' : fmt(usedBase)));
    const rows = [
      ['Base y condición', isBlocked ? blockMsg : `a = ${baseStr} ∈ ℝ⁺ − {1}, x = ${fmt(px)} > 0`],
      ['Valor exacto / aprox.', isBlocked ? 'No existe en ℝ (bloqueado en la aduana)' : `log_${baseStr}(${fmt(px)}) = ${fmt(Number(py.toFixed(4)))}`],
      ['Monotonía y ancla', usedBase > 1 ? 'Creciente en (0; +∞) · Pasa siempre por (1; 0)' : 'Decreciente en (0; +∞) · Pasa siempre por (1; 0)'],
    ];
    renderReadout(board.readout, 'Explorador de Bases y Aduana', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ mode: 'gt1', base: 2, probeX: 4, trap: 'valid_2' }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initExploradorBasesWidget };
