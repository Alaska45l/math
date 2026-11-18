/**
 * @file js/modules/funciones-trigonometricas/widgets/analizador-dominio-imagen.js
 * Widget 6 · Sec. 7: Analizador integral de dominio, imagen, suryectividad y
 * restricción de dominio/codominio para biyectividad (prueba de la recta horizontal).
 * Usa createPlane + applyPlaneClip + fnPath(..., { breaks: asymptotesInRange(...) }).
 */

import {
  s,
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
  evalTrig,
  asymptotesInRange,
  fmtNumberEsAR,
  MINUS_CHAR,
} from '../logic.js';

const X_MIN = -Math.PI;
const X_MAX = 2 * Math.PI;
const Y_MIN = -3;
const Y_MAX = 3;

export function initAnalizadorDominioImagen(host) {
  if (!host) return null;

  const store = createStore({
    fn: 'tan', // 'sin' | 'cos' | 'tan' | 'csc' | 'sec' | 'cot' | 'compare_tan_csc'
    viewMode: 'bijectivity', // 'domain' | 'image' | 'bijectivity'
    domLeftPi: -0.5, // in multiples of pi
    domRightPi: 0.5,
    testY: 0.7,
  });

  const predictBox = createPredictBox({
    prompt: '¿Por qué tg(x) y cosec(x) NO tienen el mismo dominio ni la misma imagen?',
    options: [
      {
        label: 'tg(x) divide por cos(x) (polos π/2 + kπ) e Im = ℝ; cosec(x) divide por sen(x) (polos kπ) e Im = (−∞; −1] ∪ [1; +∞).',
        correct: true,
        explanation:
          'Sus denominadores se anulan en puntos distintos (cos x = 0 vs sen x = 0) y además tg(x) recorre todo ℝ con período π mientras cosec(x) deja vacío (−1; 1) con período 2π.',
      },
      {
        label: 'Ambas tienen el mismo dominio ℝ − {kπ}, solo cambia el período.',
        correct: false,
        explanation:
          '¡Trampa clásica! En x = 0, tg(0) = 0 existe perfectamente, pero cosec(0) = 1/0 no existe. Sus dominios son disjuntos en los polos.',
      },
      {
        label: 'Ambas tienen imagen (−∞; −1] ∪ [1; +∞).',
        correct: false,
        explanation:
          'tg(x) toma cualquier valor real (incluido (−1; 1), como tg(0) = 0 o tg(π/6) = √3/3); solo sec x y cosec x dejan afuera (−1; 1).',
      },
    ],
    onVerify: () => {
      store.set({ fn: 'compare_tan_csc', viewMode: 'domain', testY: 0.5 });
      setFnChip('compare_tan_csc');
      setViewChip('domain');
    },
  });

  const board = createBoard(host, 'Analizador de dominio, imagen y prueba de la recta horizontal');
  host.prepend(predictBox);

  const setFnChip = addChips(
    board.controls,
    [
      ['sin', 'sen x'],
      ['cos', 'cos x'],
      ['tan', 'tg x'],
      ['csc', 'cosec x'],
      ['sec', 'sec x'],
      ['cot', 'cotg x'],
      ['compare_tan_csc', 'Comparar tg vs cosec'],
    ],
    'tan',
    (fn) => {
      playClick();
      predictBox.notifyInteraction();
      const defaults = {
        sin: [-0.5, 0.5],
        cos: [0, 1],
        tan: [-0.5, 0.5],
        csc: [-0.5, 0.5],
        sec: [0, 1],
        cot: [0, 1],
        compare_tan_csc: [-0.5, 0.5],
      };
      const [l, r] = defaults[fn] || [0, 1];
      store.set({ fn, domLeftPi: l, domRightPi: r });
      syncSliders();
    },
    'Función a analizar'
  );

  const setViewChip = addChips(
    board.controls,
    [
      ['domain', 'Dominio y Asíntotas'],
      ['image', 'Imagen en eje Y'],
      ['bijectivity', 'Restricción Biyectiva [a; b]'],
    ],
    'bijectivity',
    (m) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ viewMode: m });
    },
    'Modo de análisis'
  );

  const sliderA = addRange(board.controls, store, 'domLeftPi', 'Extremo izquierdo a (· π)', -1, 1.5, -0.5, 0.25, (v) => `${fmtNumberEsAR(v, 2)}π`);
  const sliderB = addRange(board.controls, store, 'domRightPi', 'Extremo derecho b (· π)', -0.5, 2, 0.5, 0.25, (v) => `${fmtNumberEsAR(v, 2)}π`);
  const sliderY = addRange(board.controls, store, 'testY', 'Recta horizontal y₀', -2.5, 2.5, 0.7, 0.1, (v) => fmtNumberEsAR(v, 1));

  const syncSliders = () => {
    const st = store.get();
    sliderA.input.value = String(st.domLeftPi);
    sliderA.output.textContent = `${fmtNumberEsAR(st.domLeftPi, 2)}π`;
    sliderB.input.value = String(st.domRightPi);
    sliderB.output.textContent = `${fmtNumberEsAR(st.domRightPi, 2)}π`;
    sliderY.input.value = String(st.testY);
    sliderY.output.textContent = fmtNumberEsAR(st.testY, 1);
  };

  sliderA.input.addEventListener('input', () => predictBox.notifyInteraction());
  sliderB.input.addEventListener('input', () => predictBox.notifyInteraction());
  sliderY.input.addEventListener('input', () => predictBox.notifyInteraction());

  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ fn: 'tan', viewMode: 'bijectivity', domLeftPi: -0.5, domRightPi: 0.5, testY: 0.7 });
    setFnChip('tan');
    setViewChip('bijectivity');
    syncSliders();
  });
  board.actions.append(btnReset);

  const plane = createPlane(board.svg, {
    width: 640,
    height: 340,
    pad: { l: 48, r: 22, t: 22, b: 36 },
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

  const domainBand = s('rect', { y: plane.box.y, height: plane.box.h, fill: 'rgba(142, 219, 159, 0.1)', stroke: 'var(--green)', 'stroke-width': 1, 'stroke-dasharray': '3 3' });
  const imageBand = s('line', { stroke: 'var(--blue)', 'stroke-width': 5, 'stroke-linecap': 'round' });
  const asymGroup = s('g', { class: 'trigf-dom-asym' });
  const curveMain = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2.8, 'stroke-linecap': 'round' });
  const curveComp = s('path', { fill: 'none', stroke: 'var(--pink)', 'stroke-width': 2.4, 'stroke-dasharray': '6 3', 'stroke-linecap': 'round' });
  const horizLine = s('line', { x1: plane.box.x, x2: plane.box.x + plane.box.w, stroke: 'var(--blue)', 'stroke-width': 1.8, 'stroke-dasharray': '5 3' });
  const intersectionsGroup = s('g', { class: 'trigf-horiz-hits' });

  const bHit = s('circle', { r: 16, fill: 'transparent', style: 'cursor: grab; touch-action: none;' });
  const bDot = s('circle', { r: 6.5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2, style: 'pointer-events: none;' });

  plane.layers.shade.append(domainBand);
  plane.layers.under.append(asymGroup, horizLine);
  plane.layers.curve.append(curveMain, curveComp);
  plane.layers.marks.append(imageBand, intersectionsGroup, bDot, bHit);

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
    bHit,
    () => mapper,
    ({ x }) => {
      predictBox.notifyInteraction();
      const piUnits = clamp(Math.round((x / Math.PI) * 4) / 4, -0.5, 2);
      const st = store.get();
      const nextRight = Math.max(st.domLeftPi + 0.25, piUnits);
      store.set({ domRightPi: Number(nextRight.toFixed(2)) });
      syncSliders();
    },
    { ariaLabel: 'Ajustar extremo derecho b del dominio restringido', stepX: Math.PI / 4, stepY: 0.25 }
  );

  const render = () => {
    const st = store.get();
    clear(asymGroup);
    clear(intersectionsGroup);

    const aRad = Math.min(st.domLeftPi, st.domRightPi - 0.25) * Math.PI;
    const bRad = Math.max(aRad + 0.25 * Math.PI, st.domRightPi * Math.PI);

    if (st.fn === 'compare_tan_csc') {
      const breaksTan = asymptotesInRange('tan', X_MIN, X_MAX);
      const breaksCsc = asymptotesInRange('csc', X_MIN, X_MAX);
      curveMain.setAttribute('d', plane.fnPath((x) => evalTrig('tan', x), X_MIN, X_MAX, { samples: 400, breaks: breaksTan }));
      curveComp.removeAttribute('visibility');
      curveComp.setAttribute('d', plane.fnPath((x) => evalTrig('csc', x), X_MIN, X_MAX, { samples: 400, breaks: breaksCsc }));

      breaksTan.forEach((bx) => {
        const px = plane.sx(bx);
        asymGroup.append(s('line', { x1: px, y1: plane.box.y, x2: px, y2: plane.box.y + plane.box.h, stroke: 'var(--yellow)', 'stroke-width': 1.3, 'stroke-dasharray': '4 4', opacity: '0.65' }));
      });
      breaksCsc.forEach((bx) => {
        const px = plane.sx(bx);
        asymGroup.append(s('line', { x1: px, y1: plane.box.y, x2: px, y2: plane.box.y + plane.box.h, stroke: 'var(--pink)', 'stroke-width': 1.3, 'stroke-dasharray': '2 4', opacity: '0.75' }));
      });
      domainBand.setAttribute('visibility', 'hidden');
      imageBand.setAttribute('visibility', 'hidden');
      horizLine.setAttribute('visibility', 'hidden');
      bHit.setAttribute('cx', String(plane.sx(bRad)));
      bHit.setAttribute('cy', String(plane.sy(0)));
      bDot.setAttribute('visibility', 'hidden');

      renderReadout(board.readout, 'Contraste Directo: tg(x) vs cosec(x)', [
        ['Dominio tg(x)', TRIG_FUNCTIONS_SPEC.tan.domainText],
        ['Dominio cosec(x)', TRIG_FUNCTIONS_SPEC.csc.domainText],
        ['Imagen tg vs cosec', `Im(tg) = ℝ  vs  Im(cosec) = ${TRIG_FUNCTIONS_SPEC.csc.imageText}`],
        ['Período y Ceros', `tg: T = π, ceros C₀∪C_π  |  cosec: T = 2π, ceros ∅`],
      ]);
      return;
    }

    const spec = TRIG_FUNCTIONS_SPEC[st.fn];
    const breaks = asymptotesInRange(st.fn, X_MIN, X_MAX);
    curveMain.setAttribute('d', plane.fnPath((x) => evalTrig(st.fn, x), X_MIN, X_MAX, { samples: 400, breaks }));
    curveComp.setAttribute('visibility', 'hidden');
    curveComp.setAttribute('d', '');

    breaks.forEach((bx) => {
      const px = plane.sx(bx);
      asymGroup.append(s('line', { x1: px, y1: plane.box.y, x2: px, y2: plane.box.y + plane.box.h, stroke: 'var(--pink)', 'stroke-width': 1.4, 'stroke-dasharray': '5 4', opacity: '0.75' }));
    });

    const x1Px = plane.sx(aRad);
    const x2Px = plane.sx(bRad);
    domainBand.removeAttribute('visibility');
    domainBand.setAttribute('x', String(x1Px));
    domainBand.setAttribute('width', String(Math.max(4, x2Px - x1Px)));

    bDot.removeAttribute('visibility');
    bHit.setAttribute('cx', String(x2Px));
    bHit.setAttribute('cy', String(plane.sy(0)));
    bHit.setAttribute('aria-valuenow', String(Number((bRad / Math.PI).toFixed(2))));
    bDot.setAttribute('cx', String(x2Px));
    bDot.setAttribute('cy', String(plane.sy(0)));

    // Horizontal line test hits inside [aRad, bRad]
    horizLine.removeAttribute('visibility');
    const y0 = st.testY;
    const py0 = plane.sy(y0);
    horizLine.setAttribute('y1', String(py0));
    horizLine.setAttribute('y2', String(py0));

    const hits = [];
    const samples = 240;
    let prevX = aRad;
    let prevDiff = evalTrig(st.fn, prevX) - y0;
    for (let i = 1; i <= samples; i++) {
      const curX = aRad + ((bRad - aRad) * i) / samples;
      const curY = evalTrig(st.fn, curX);
      const curDiff = curY - y0;
      const crossedPole = breaks.some((bp) => prevX <= bp && curX >= bp);
      if (!crossedPole && Number.isFinite(prevDiff) && Number.isFinite(curDiff) && prevDiff * curDiff <= 0) {
        const hitX = (prevX + curX) / 2;
        if (!hits.some((h) => Math.abs(h - hitX) < 0.08)) hits.push(hitX);
      }
      prevX = curX;
      prevDiff = curDiff;
    }

    const isInjective = hits.length <= 1 && (bRad - aRad) <= spec.periodPi * Math.PI / (st.fn === 'tan' || st.fn === 'cot' ? 1 : 2) + 0.08;
    hits.forEach((hx) => {
      const pos = clampToPlane(plane, plane.sx(hx), py0, 5);
      intersectionsGroup.append(
        s('circle', {
          cx: pos.cx,
          cy: pos.cy,
          r: 5.5,
          fill: hits.length > 1 ? 'var(--pink)' : 'var(--green)',
          stroke: 'var(--bg)',
          'stroke-width': 1.8,
        })
      );
    });

    if (st.viewMode === 'image') {
      imageBand.removeAttribute('visibility');
      const yAxisX = plane.yAxisX;
      if (st.fn === 'sin' || st.fn === 'cos') {
        imageBand.setAttribute('x1', String(yAxisX));
        imageBand.setAttribute('x2', String(yAxisX));
        imageBand.setAttribute('y1', String(plane.sy(1)));
        imageBand.setAttribute('y2', String(plane.sy(-1)));
      } else {
        imageBand.setAttribute('x1', String(yAxisX));
        imageBand.setAttribute('x2', String(yAxisX));
        imageBand.setAttribute('y1', String(plane.box.y));
        imageBand.setAttribute('y2', String(plane.box.y + plane.box.h));
      }
    } else {
      imageBand.setAttribute('visibility', 'hidden');
    }

    renderReadout(board.readout, `Análisis de ${spec.label}`, [
      ['Dominio / Imagen', `Dom = ${spec.domainText} · Im = ${spec.imageText}`],
      ['Período / Suryectividad en ℝ', `T = ${spec.periodText} · ${spec.isSurjectiveOnRealCodomain ? 'Suryectiva sobre ℝ' : 'NO suryectiva sobre ℝ'}`],
      ['Prueba recta horizontal', hits.length > 1 ? `${hits.length} cortes en [a; b] → No inyectiva` : hits.length === 1 ? '1 corte único en [a; b] → Inyectiva en la zona' : `0 cortes en y₀ = ${fmtNumberEsAR(y0, 1)} (fuera de imagen)`],
      ['Restricción biyectiva estándar', `${spec.bijectiveRestriction.domainText} → ${spec.bijectiveRestriction.codomainText}`],
    ]);
  };

  store.subscribe(render);
  render();
  return { store, board, plane };
}
