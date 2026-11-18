/**
 * @file js/modules/funciones-trigonometricas/widgets/sincronizador-graficas.js
 * Widget 3 · Sec. 3 & Sec. 4: Sincronizador círculo unitario ↔ gráfica cartesiana
 * para las 6 funciones trigonométricas canónicas (y ampliación sinusoidal opcional A·sen(Bx−C)+D).
 * Usa createPlane + applyPlaneClip + fnPath(..., { breaks: asymptotesInRange(...) })
 * para cortar limpiamente en las asíntotas verticales sin líneas falsas de +∞ a −∞.
 */

import {
  s,
  h,
  clear,
  createStore,
  createBoard,
  createPredictBox,
  createPlane,
  applyPlaneClip,
  clampToPlane,
  attachSvgDrag,
  addRange,
  addChips,
  button,
  renderReadout,
  clamp,
  formatPiTick,
  playClick,
} from './board-kit.js';
import {
  TRIG_FUNCTIONS_SPEC,
  analyzeTrigFunction,
  evalTrig,
  asymptotesInRange,
  fmtNumberEsAR,
  MINUS_CHAR,
} from '../logic.js';

const X_MIN = -2 * Math.PI;
const X_MAX = 2 * Math.PI;
const Y_MIN = -3.2;
const Y_MAX = 3.2;

export function initSincronizadorGraficas(host) {
  if (!host) return null;

  const store = createStore({
    fn: 'sin', // 'sin' | 'cos' | 'tan' | 'csc' | 'sec' | 'cot'
    overlayCos: false,
    extensionOn: false,
    A: 1,
    B: 1,
    C: 0,
    D: 0,
    probeX: Math.PI / 3,
  });

  const predictBox = createPredictBox({
    prompt: 'Cuando cos(x) cruza el eje X en x = π/2, ¿qué aparece en las gráficas de tg(x) y sec(x)?',
    options: [
      {
        label: 'Una asíntota vertical en x = π/2 porque cos(π/2) = 0 anula su denominador.',
        correct: true,
        explanation:
          'Tanto tg(x) = sen(x)/cos(x) como sec(x) = 1/cos(x) dividen por cos(x). Cuando cos(x) = 0, ninguna de las dos existe y aparece una asíntota vertical.',
      },
      {
        label: 'Un cero de tg(x) y sec(x) en x = π/2.',
        correct: false,
        explanation:
          'Los ceros de tg(x) ocurren cuando el numerador sen(x) = 0 (en 0 y π), y sec(x) no tiene ceros jamás.',
      },
      {
        label: 'Un punto agujero evitable porque el numerador también vale 0.',
        correct: false,
        explanation:
          'En x = π/2, sen(π/2) = 1 ≠ 0, así que la fracción 1/0 diverge hacia ±∞: es una asíntota vertical, no un agujero.',
      },
    ],
    onVerify: () => {
      store.set({ fn: 'tan', overlayCos: true, extensionOn: false, probeX: Math.PI / 2 });
      setFnChip('tan');
      syncUI();
    },
  });

  const board = createBoard(host, 'Sincronizador círculo ↔ gráfica cartesiana de las 6 funciones');
  host.prepend(predictBox);

  const badgeEl = h(
    'div',
    { class: 'trigf-mode-banner is-official' },
    'Programa Oficial UNMDP · Las 6 funciones trigonométricas canónicas'
  );
  board.controls.append(badgeEl);

  const setFnChip = addChips(
    board.controls,
    [
      ['sin', 'sen x'],
      ['cos', 'cos x'],
      ['tan', 'tg x'],
      ['csc', 'cosec x'],
      ['sec', 'sec x'],
      ['cot', 'cotg x'],
    ],
    'sin',
    (fn) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ fn, overlayCos: false });
    },
    'Función trigonométrica'
  );

  const extToggleBtn = button('Ampliación: Transformación A·sen(Bx−C)+D (Desactivada)', 'spark', () => {
    playClick();
    predictBox.notifyInteraction();
    const next = !store.get().extensionOn;
    store.set({
      extensionOn: next,
      ...(next ? { fn: 'sin' } : { A: 1, B: 1, C: 0, D: 0 }),
    });
    if (next) setFnChip('sin');
    syncUI();
  }, 'chip chip--ghost');

  const overlayRefBtn = button('Superponer cos/sen de referencia', 'target', () => {
    playClick();
    predictBox.notifyInteraction();
    store.set({ overlayCos: !store.get().overlayCos });
  }, 'chip chip--ghost');

  board.controls.append(h('div', { class: 'pr-chip-row' }, [extToggleBtn, overlayRefBtn]));

  const extSlidersWrap = h('div', { class: 'trigf-ext-sliders', hidden: '' });
  const sliderA = addRange(extSlidersWrap, store, 'A', 'Amplitud A', -2.5, 2.5, 1, 0.5, (v) => fmtNumberEsAR(v, 1));
  const sliderB = addRange(extSlidersWrap, store, 'B', 'Frecuencia B', 0.5, 3, 1, 0.5, (v) => fmtNumberEsAR(v, 1));
  const sliderC = addRange(extSlidersWrap, store, 'C', 'Fase C (rad)', -3.14, 3.14, 0, 0.26, (v) => fmtNumberEsAR(v, 2));
  const sliderD = addRange(extSlidersWrap, store, 'D', 'Vertical D', -2, 2, 0, 0.5, (v) => fmtNumberEsAR(v, 1));
  board.controls.append(extSlidersWrap);

  const sliderProbe = addRange(
    board.controls,
    store,
    'probeX',
    'Sonda x (rad)',
    -6.28,
    6.28,
    Number((Math.PI / 3).toFixed(2)),
    0.05,
    (v) => `${fmtNumberEsAR(v, 2)} rad`
  );
  sliderProbe.input.addEventListener('input', () => predictBox.notifyInteraction());

  const syncUI = () => {
    const st = store.get();
    extToggleBtn.classList.toggle('is-active', st.extensionOn);
    extToggleBtn.textContent = st.extensionOn
      ? 'Ampliación: Transformación A·sen(Bx−C)+D (Activa)'
      : 'Ampliación: Transformación A·sen(Bx−C)+D (Desactivada)';
    if (st.extensionOn) extSlidersWrap.removeAttribute('hidden');
    else extSlidersWrap.setAttribute('hidden', '');
    sliderProbe.input.value = String(Number(st.probeX.toFixed(2)));
    sliderProbe.output.textContent = `${fmtNumberEsAR(st.probeX, 2)} rad`;
  };

  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ fn: 'sin', overlayCos: false, extensionOn: false, A: 1, B: 1, C: 0, D: 0, probeX: Math.PI / 3 });
    setFnChip('sin');
    syncUI();
  });
  board.actions.append(btnReset);

  // Dual-panel SVG: left circle + right Cartesian plane via createPlane + applyPlaneClip
  // Create plane on board.svg (createPlane sets viewBox & builds defs + layers)
  const plane = createPlane(board.svg, {
    width: 640,
    height: 340,
    pad: { l: 230, r: 16, t: 20, b: 32 },
    xMin: X_MIN,
    xMax: X_MAX,
    yMin: Y_MIN,
    yMax: Y_MAX,
    xStep: Math.PI / 2,
    yStep: 1,
    xFmt: formatPiTick,
    yFmt: (t) => (Number.isInteger(t) && t !== 0 ? fmtNumberEsAR(t, 0) : ''),
  });
  applyPlaneClip(board, plane);

  // Left circle overlay layer (outside Cartesian clipBox)
  const circleCx = 104;
  const circleCy = 166;
  const circleR = 72;
  const circleGroup = s('g', { class: 'trigf-sync-circle' });
  const cAxisX = s('line', { x1: circleCx - 86, y1: circleCy, x2: circleCx + 86, y2: circleCy, stroke: 'rgba(236, 242, 232, 0.3)', 'stroke-width': 1 });
  const cAxisY = s('line', { x1: circleCx, y1: circleCy - 86, x2: circleCx, y2: circleCy + 86, stroke: 'rgba(236, 242, 232, 0.3)', 'stroke-width': 1 });
  const cOutline = s('circle', { cx: circleCx, cy: circleCy, r: circleR, fill: 'rgba(236, 242, 232, 0.03)', stroke: 'rgba(236, 242, 232, 0.32)', 'stroke-width': 1.4 });
  const cRadius = s('line', { x1: circleCx, y1: circleCy, stroke: 'var(--ink)', 'stroke-width': 2.2 });
  const cCos = s('line', { stroke: 'var(--blue)', 'stroke-width': 3 });
  const cSin = s('line', { stroke: 'var(--yellow)', 'stroke-width': 3 });
  const cPoint = s('circle', { r: 5.5, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 1.8 });
  const cLabel = s('text', { class: 'trigf-svg-label', fill: 'var(--muted)', x: circleCx, y: 274, 'text-anchor': 'middle' }, 'Círculo unitario');
  circleGroup.append(cAxisX, cAxisY, cOutline, cRadius, cCos, cSin, cPoint, cLabel);
  board.svg.append(circleGroup);

  // Persistent curve & asymptote layers inside plane
  const asymptotesGroup = s('g', { class: 'trigf-asymptotes' });
  const refPath = s('path', { fill: 'none', stroke: 'var(--blue)', 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: '0.7' });
  const mainPath = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2.8, 'stroke-linecap': 'round' });
  plane.layers.under.append(asymptotesGroup);
  plane.layers.curve.append(refPath, mainPath);

  const syncBridgeLine = s('line', { stroke: 'rgba(236, 242, 232, 0.35)', 'stroke-width': 1.3, 'stroke-dasharray': '4 3' });
  const probeVertLine = s('line', { y1: plane.box.y, y2: plane.box.y + plane.box.h, stroke: 'rgba(230, 211, 138, 0.4)', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' });
  const probeDot = s('circle', { r: 5.5, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 1.8 });
  const probePoleRing = s('circle', { r: 6.5, fill: 'var(--bg)', stroke: 'var(--pink)', 'stroke-width': 2.5, visibility: 'hidden' });
  const probeHit = s('circle', { r: 16, fill: 'transparent', style: 'cursor: grab; touch-action: none;' });
  const probeLabel = s('text', { class: 'trigf-svg-label', fill: 'var(--yellow)' });
  plane.layers.marks.append(syncBridgeLine, probeVertLine, probeDot, probePoleRing, probeHit, probeLabel);

  const mapper = {
    xMin: X_MIN,
    xMax: X_MAX,
    yMin: Y_MIN,
    yMax: Y_MAX,
    toX: (x) => plane.sx(x),
    toY: (y) => plane.sy(y),
    fromX: (px) => plane.invX(px),
    fromY: (py) => plane.invY(py),
  };

  attachSvgDrag(
    board.svg,
    probeHit,
    () => mapper,
    ({ x }) => {
      predictBox.notifyInteraction();
      const clampedX = clamp(Number(x.toFixed(2)), X_MIN, X_MAX);
      store.set({ probeX: clampedX });
      sliderProbe.input.value = String(clampedX);
      sliderProbe.output.textContent = `${fmtNumberEsAR(clampedX, 2)} rad`;
    },
    { ariaLabel: 'Deslizar sonda x sobre el eje horizontal', stepX: Math.PI / 6, stepY: 0.25 }
  );

  const render = () => {
    const st = store.get();
    const isExt = st.extensionOn;

    badgeEl.className = `trigf-mode-banner ${isExt ? 'is-extension' : 'is-official'}`;
    badgeEl.textContent = isExt
      ? 'Ampliación didáctica · Transformación A·sen(Bx − C) + D (El programa oficial evalúa únicamente las 6 funciones canónicas)'
      : 'Programa Oficial UNMDP · Las 6 funciones trigonométricas canónicas';

    const params = isExt
      ? { A: Math.abs(st.A) < 0.1 ? 1 : st.A, B: Math.abs(st.B) < 0.1 ? 1 : st.B, C: st.C, D: st.D }
      : { A: 1, B: 1, C: 0, D: 0 };

    const analysis = analyzeTrigFunction(st.fn, params);
    const breaks = analysis.asymptotes(X_MIN, X_MAX);

    // Draw main curve using fnPath with explicit asymptote breaks!
    mainPath.setAttribute('d', plane.fnPath(analysis.evalAt, X_MIN, X_MAX, { samples: 400, breaks }));

    // Draw dashed vertical asymptote lines at breaks
    clear(asymptotesGroup);
    breaks.forEach((bx) => {
      const px = plane.sx(bx);
      asymptotesGroup.append(
        s('line', {
          x1: px.toFixed(1),
          y1: plane.box.y,
          x2: px.toFixed(1),
          y2: plane.box.y + plane.box.h,
          stroke: 'var(--pink)',
          'stroke-width': 1.4,
          'stroke-dasharray': '5 4',
          opacity: '0.75',
        })
      );
    });

    // Optional reference curve (cos when tan/sec, sin when cot/csc)
    if (st.overlayCos && !isExt) {
      const refFnName = analysis.domainExclusionType === 'sin_zero' ? 'sin' : 'cos';
      refPath.removeAttribute('visibility');
      refPath.setAttribute('d', plane.fnPath((x) => evalTrig(refFnName, x), X_MIN, X_MAX, { samples: 300 }));
    } else {
      refPath.setAttribute('visibility', 'hidden');
      refPath.setAttribute('d', '');
    }

    // Update circle + probe
    const x = clamp(st.probeX, X_MIN, X_MAX);
    const cosV = Math.cos(x);
    const sinV = Math.sin(x);
    const cxPt = circleCx + circleR * cosV;
    const cyPt = circleCy - circleR * sinV;

    cRadius.setAttribute('x2', cxPt.toFixed(1));
    cRadius.setAttribute('y2', cyPt.toFixed(1));
    cCos.setAttribute('x1', String(circleCx));
    cCos.setAttribute('y1', String(circleCy));
    cCos.setAttribute('x2', cxPt.toFixed(1));
    cCos.setAttribute('y2', String(circleCy));
    cSin.setAttribute('x1', cxPt.toFixed(1));
    cSin.setAttribute('y1', String(circleCy));
    cSin.setAttribute('x2', cxPt.toFixed(1));
    cSin.setAttribute('y2', cyPt.toFixed(1));
    cPoint.setAttribute('cx', cxPt.toFixed(1));
    cPoint.setAttribute('cy', cyPt.toFixed(1));

    const probePx = plane.sx(x);
    const yVal = analysis.evalAt(x);
    const nearPole = !Number.isFinite(yVal) || breaks.some((b) => Math.abs(x - b) < 0.04);

    probeVertLine.setAttribute('x1', probePx.toFixed(1));
    probeVertLine.setAttribute('x2', probePx.toFixed(1));
    probeHit.setAttribute('cx', probePx.toFixed(1));
    probeHit.setAttribute('aria-valuenow', String(Number(x.toFixed(2))));

    if (nearPole) {
      const clampedZero = clampToPlane(plane, probePx, plane.sy(0), 6);
      probeHit.setAttribute('cy', String(clampedZero.cy));
      probeDot.setAttribute('visibility', 'hidden');
      probePoleRing.setAttribute('visibility', 'visible');
      probePoleRing.setAttribute('cx', String(clampedZero.cx));
      probePoleRing.setAttribute('cy', String(clampedZero.cy));
      syncBridgeLine.setAttribute('visibility', 'hidden');
      probeLabel.setAttribute('x', String(Math.min(plane.box.x + plane.box.w - 8, clampedZero.cx + 8)));
      probeLabel.setAttribute('y', String(plane.box.y + 22));
      probeLabel.setAttribute('text-anchor', clampedZero.cx > plane.box.x + plane.box.w - 110 ? 'end' : 'start');
      probeLabel.setAttribute('fill', 'var(--pink)');
      probeLabel.textContent = `Polo en x = ${fmtNumberEsAR(x, 2)} (∄)`;
    } else {
      const cPos = clampToPlane(plane, probePx, plane.sy(yVal), 6);
      probeDot.setAttribute('visibility', 'visible');
      probeDot.setAttribute('cx', String(cPos.cx));
      probeDot.setAttribute('cy', String(cPos.cy));
      probeHit.setAttribute('cy', String(cPos.cy));
      probePoleRing.setAttribute('visibility', 'hidden');
      if (st.fn === 'sin' && !isExt) {
        syncBridgeLine.setAttribute('visibility', 'visible');
        syncBridgeLine.setAttribute('x1', cxPt.toFixed(1));
        syncBridgeLine.setAttribute('y1', cyPt.toFixed(1));
        syncBridgeLine.setAttribute('x2', String(cPos.cx));
        syncBridgeLine.setAttribute('y2', String(cPos.cy));
      } else {
        syncBridgeLine.setAttribute('visibility', 'hidden');
      }
      probeLabel.setAttribute('fill', 'var(--yellow)');
      probeLabel.setAttribute('x', String(cPos.cx + (cPos.cx > plane.box.x + plane.box.w - 120 ? -10 : 10)));
      probeLabel.setAttribute('y', String(Math.max(plane.box.y + 18, cPos.cy - 10)));
      probeLabel.setAttribute('text-anchor', cPos.cx > plane.box.x + plane.box.w - 120 ? 'end' : 'start');
      probeLabel.textContent = `f(${fmtNumberEsAR(x, 2)}) = ${fmtNumberEsAR(yVal, 2)}`;
    }

    const spec = TRIG_FUNCTIONS_SPEC[st.fn];
    renderReadout(board.readout, isExt ? `Ampliación: ${params.A}·sen(${params.B}x − ${params.C}) + ${params.D}` : `Análisis de ${spec.label}`, [
      ['Dominio', isExt ? 'ℝ' : spec.domainText],
      ['Imagen', analysis.imageText],
      ['Período y Ceros', isExt ? `T = ${fmtNumberEsAR(analysis.periodRad, 2)} rad` : `T = ${spec.periodText} · Ceros: ${spec.zerosText}`],
      ['Sonda actual', nearPole ? `x ≈ ${fmtNumberEsAR(x, 2)} → Asíntota vertical (denominador = 0)` : `x = ${fmtNumberEsAR(x, 2)} rad → y = ${fmtNumberEsAR(yVal, 3)}`],
    ]);
  };

  store.subscribe(render);
  render();
  return { store, board, plane };
}
