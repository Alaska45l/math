/**
 * diagnostico-propiedades.js — Widget 2 (sec-2)
 * Laboratorio interactivo de barras y cálculo exacto:
 * contrasta las 5 propiedades verdaderas vs las 4 identidades falsas clásicas.
 */

import {
  createBoard,
  createPredictBox,
  createStore,
  addChips,
  addRange,
  renderReadout,
  fmt,
  s,
  setText,
} from './board-kit.js';
import { verifyLogIdentity } from '../logic.js';

const CLAIMS = [
  ['product', '1. logₐ(x·y) = logₐx + logₐy'],
  ['quotient', '2. logₐ(x:y) = logₐx − logₐy'],
  ['power', '3. logₐ(xⁿ) = n·logₐx'],
  ['root', '4. logₐ(ⁿ√x) = (1/n)·logₐx'],
  ['change_of_base', '5. logₐx = log_b(x)/log_b(a)'],
  ['false_sum', 'Trampa: logₐ(x+y) = logₐx + logₐy'],
  ['false_power_whole', 'Trampa: (logₐx)² = 2·logₐx'],
  ['false_quotient_of_logs', 'Trampa: logₐx / logₐy = logₐ(x−y)'],
  ['false_product_of_logs', 'Trampa: logₐx · logₐy = logₐ(x·y)'],
];

export function initWidget(container, options = {}) {
  const board = createBoard(
    container,
    'Diagnóstico de Propiedades Operativas vs Identidades Falsas',
    '0 0 640 340',
  );

  const store = createStore({
    claimId: options.claimId || 'product',
    a: 2,
    x: 4,
    y: 8,
    n: 2,
  });

  // 0. POE 2 etapas
  const predictBox = createPredictBox({
    prompt: '¿Es cierto que log₂(4 + 4) = log₂(4) + log₂(4)?',
    options: [
      {
        label: 'Falso: log₂(8) = 3, mientras que log₂(4) + log₂(4) = 2 + 2 = 4',
        correct: true,
        explanation: '¡Bien detectado! El logaritmo no se distribuye sobre la suma: 3 ≠ 4.',
      },
      {
        label: 'Verdadero: el logaritmo se distribuye en cada término de la suma',
        correct: false,
        explanation: 'Al evaluar con a=2, x=4, y=4 obtenés 3 del lado izquierdo y 4 del lado derecho.',
      },
    ],
    onVerify: () => {
      store.set({ claimId: 'false_sum', a: 2, x: 4, y: 4, n: 2 });
    },
  });
  board.controls.prepend(predictBox);

  // 1. Controles
  const updateClaimChips = addChips(
    board.controls,
    CLAIMS,
    store.get().claimId,
    (claimId) => {
      predictBox.notifyInteraction();
      store.set({ claimId });
    },
    'Propiedad o Trampa a Evaluar',
  );

  const { input: xSlider, output: xOutput } = addRange(board.controls, store, 'x', 'Argumento x', 2, 16, store.get().x, 1, (v) => `x = ${fmt(v)}`);
  const { input: ySlider, output: yOutput } = addRange(board.controls, store, 'y', 'Argumento y', 2, 16, store.get().y, 1, (v) => `y = ${fmt(v)}`);
  const { input: nSlider, output: nOutput } = addRange(board.controls, store, 'n', 'Exponente / índice n', 2, 4, store.get().n, 1, (v) => `n = ${fmt(v)}`);
  [xSlider, ySlider, nSlider].forEach((sl) =>
    sl.addEventListener('input', () => predictBox.notifyInteraction()),
  );

  // 2. Escena SVG fija (sameNodeReference === true)
  const bg = s('rect', {
    x: 20, y: 18, width: 600, height: 304,
    fill: 'rgba(14, 22, 18, 0.5)',
    stroke: 'rgba(236, 242, 232, 0.2)',
  });
  const titleText = s('text', { x: 40, y: 50, class: 'log-svg-label', fill: 'var(--yellow)', 'font-size': '15px' }, '');
  const formulaText = s('text', { x: 40, y: 78, class: 'log-svg-small', fill: 'var(--ink)', 'font-size': '14px' }, '');

  // Barras comparativas LHS vs RHS
  const lhsLabel = s('text', { x: 40, y: 125, class: 'log-svg-small', fill: 'var(--blue)' }, 'Miembro izquierdo (LHS)');
  const lhsTrack = s('rect', { x: 40, y: 136, width: 420, height: 28, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(236,242,232,0.2)' });
  const lhsBar = s('rect', { x: 40, y: 136, width: 100, height: 28, fill: 'var(--blue)', opacity: '0.85' });
  const lhsValText = s('text', { x: 474, y: 155, class: 'log-svg-label', fill: 'var(--blue)', 'font-size': '15px' }, '');

  const rhsLabel = s('text', { x: 40, y: 196, class: 'log-svg-small', fill: 'var(--yellow)' }, 'Miembro derecho (RHS)');
  const rhsTrack = s('rect', { x: 40, y: 207, width: 420, height: 28, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(236,242,232,0.2)' });
  const rhsBar = s('rect', { x: 40, y: 207, width: 100, height: 28, fill: 'var(--yellow)', opacity: '0.85' });
  const rhsValText = s('text', { x: 474, y: 226, class: 'log-svg-label', fill: 'var(--yellow)', 'font-size': '15px' }, '');

  // Sello de veredicto + handle interactivo por teclado y puntero para ajustar x directamente en el SVG
  const verdictBox = s('rect', { x: 40, y: 256, width: 560, height: 46, fill: 'rgba(42, 157, 143, 0.14)', stroke: 'var(--green)', 'stroke-width': 1.5 });
  const verdictText = s('text', { x: 56, y: 285, class: 'log-svg-label', fill: 'var(--green)', 'font-size': '14px' }, '');

  const xHandle = s('circle', {
    cx: 180,
    cy: 150,
    r: 8,
    fill: 'var(--ink)',
    stroke: 'var(--blue)',
    'stroke-width': 2.5,
    tabindex: '0',
    role: 'slider',
    'aria-label': 'Ajustar argumento x en la barra',
    'aria-valuemin': '2',
    'aria-valuemax': '16',
    'aria-valuenow': String(store.get().x),
    style: 'cursor: ew-resize; touch-action: none; outline: none;',
  });

  let draggingX = false;
  const updateXFromClient = (e) => {
    const rect = board.svg.getBoundingClientRect();
    if (!rect.width) return;
    const vbX = ((e.clientX - rect.left) / rect.width) * 640;
    const rawX = 2 + ((vbX - 40) / 420) * 14;
    const clamped = Math.max(2, Math.min(16, Math.round(rawX)));
    store.set({ x: clamped });
  };
  xHandle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    draggingX = true;
    predictBox.notifyInteraction();
    try { xHandle.setPointerCapture(e.pointerId); } catch {}
    updateXFromClient(e);
  });
  xHandle.addEventListener('pointermove', (e) => {
    if (!draggingX) return;
    updateXFromClient(e);
  });
  const stopXDrag = () => { draggingX = false; };
  xHandle.addEventListener('pointerup', stopXDrag);
  xHandle.addEventListener('pointercancel', stopXDrag);

  xHandle.addEventListener('keydown', (e) => {
    const cur = store.get();
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      predictBox.notifyInteraction();
      store.set({ x: Math.min(16, cur.x + 1) });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      predictBox.notifyInteraction();
      store.set({ x: Math.max(2, cur.x - 1) });
    }
  });

  board.drawing.append(
    bg,
    titleText,
    formulaText,
    lhsLabel,
    lhsTrack,
    lhsBar,
    lhsValText,
    rhsLabel,
    rhsTrack,
    rhsBar,
    rhsValText,
    verdictBox,
    verdictText,
    xHandle,
  );

  // 3. Render
  const render = (state) => {
    updateClaimChips(state.claimId);
    xSlider.value = String(state.x);
    xOutput.textContent = `x = ${fmt(state.x)}`;
    ySlider.value = String(state.y);
    yOutput.textContent = `y = ${fmt(state.y)}`;
    nSlider.value = String(state.n);
    nOutput.textContent = `n = ${fmt(state.n)}`;
    const res = verifyLogIdentity(state.claimId, {
      a: state.a,
      x: state.x,
      y: state.y,
      n: state.n,
      b: 10,
    });

    setText(titleText, res.title);
    setText(formulaText, `${res.formula}   (con a = ${fmt(state.a)}, x = ${fmt(state.x)}, y = ${fmt(state.y)}, n = ${fmt(state.n)})`);

    const maxScale = Math.max(8, Math.abs(res.lhs) * 1.2, Math.abs(res.rhs) * 1.2);
    const wL = Math.max(8, Math.min(420, (Math.abs(res.lhs) / maxScale) * 420));
    const wR = Math.max(8, Math.min(420, (Math.abs(res.rhs) / maxScale) * 420));

    lhsBar.setAttribute('width', String(wL.toFixed(1)));
    rhsBar.setAttribute('width', String(wR.toFixed(1)));
    setText(lhsValText, `= ${fmt(Number(res.lhs.toFixed(4)))}`);
    setText(rhsValText, `= ${fmt(Number(res.rhs.toFixed(4)))}`);

    xHandle.setAttribute('cx', String(40 + ((state.x - 2) / 14) * 420));
    xHandle.setAttribute('aria-valuenow', String(state.x));

    if (res.isValidIdentity) {
      rhsBar.setAttribute('fill', 'var(--green)');
      verdictBox.setAttribute('fill', 'rgba(142, 219, 159, 0.14)');
      verdictBox.setAttribute('stroke', 'var(--green)');
      verdictText.setAttribute('fill', 'var(--green)');
      setText(verdictText, `= IDENTIDAD VÁLIDA EN ℝ: ambos lados valen exactamente ${fmt(Number(res.lhs.toFixed(4)))}.`);
    } else {
      rhsBar.setAttribute('fill', 'var(--pink)');
      verdictBox.setAttribute('fill', 'rgba(227, 161, 161, 0.14)');
      verdictBox.setAttribute('stroke', 'var(--pink)');
      verdictText.setAttribute('fill', 'var(--pink)');
      setText(verdictText, `≠ CONTRAEJEMPLO DETECTADO: ${fmt(Number(res.lhs.toFixed(4)))} ≠ ${fmt(Number(res.rhs.toFixed(4)))} (¡Falsa!).`);
    }

    const rows = [
      ['Fórmula analizada', res.formula],
      ['Evaluación numérica', `LHS = ${fmt(Number(res.lhs.toFixed(4)))}  |  RHS = ${fmt(Number(res.rhs.toFixed(4)))}`],
      ['Veredicto formal', res.explanation],
    ];
    renderReadout(board.readout, 'Diagnóstico de Propiedades', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ claimId: 'product', a: 2, x: 4, y: 8, n: 2 }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initDiagnosticoPropiedadesWidget };
