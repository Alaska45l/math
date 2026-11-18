/**
 * @file js/modules/funciones-trigonometricas/widgets/soluciones-periodicas.js
 * Widget 5 · Sec. 6: Soluciones periódicas de ecuaciones trigonométricas,
 * uniones de clases C_α y aduana de polos/denominadores (excluyendo cos x = 0 o sen x = 0).
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
  evalTrig,
  asymptotesInRange,
  solveElementaryTrigEq,
  solveQuadraticTrigEq,
  fmtNumberEsAR,
  formatPiRat,
  rat,
  MINUS_CHAR,
} from '../logic.js';

const X_MIN = 0;
const X_MAX = 2 * Math.PI;
const Y_MIN = -2.4;
const Y_MAX = 2.4;

export function initSolucionesPeriodicas(host) {
  if (!host) return null;

  const store = createStore({
    preset: 'pole_exclusion',
    domain: 'R', // 'Q1' | '0_2pi' | 'R'
    thresholdC: 0.5,
  });

  const predictBox = createPredictBox({
    prompt: 'Al resolver [(1 − sen x)(√3 − tg x)] / cos x = 0, ¿por qué x = π/2 NO entra en la solución?',
    options: [
      {
        label: 'Porque cos(π/2) = 0 anula el denominador (y hace indeterminada a tg x), aunque 1 − sen(π/2) = 0.',
        correct: true,
        explanation:
          'Si bien x = π/2 anula el factor (1 − sen x), está fuera del dominio de la ecuación porque cos(π/2) = 0 divide por cero y tg(π/2) no existe. Solo sobrevive tg x = √3 ⇒ C_{π/3} ∪ C_{4π/3}.',
      },
      {
        label: 'Porque sen(π/2) vale 0 y no 1.',
        correct: false,
        explanation:
          'sen(π/2) = 1 sí anula el numerador, pero la restricción cos x ≠ 0 prohíbe aceptar x = π/2.',
      },
      {
        label: 'Porque π/2 cae fuera del intervalo [0; 2π).',
        correct: false,
        explanation:
          'π/2 pertenece a [0; 2π), pero queda excluido por el denominador cos x = 0 y el dominio de tg x.',
      },
    ],
    onVerify: () => {
      store.set({ preset: 'pole_exclusion', domain: 'R', thresholdC: 0.5 });
      setPresetChip('pole_exclusion');
      setDomainChip('R');
    },
  });

  const board = createBoard(host, 'Visualizador de soluciones periódicas y exclusión de polos');
  host.prepend(predictBox);

  const setPresetChip = addChips(
    board.controls,
    [
      ['pole_exclusion', '(1−sen x)(√3−tg x)/cos x = 0'],
      ['simulacro2019', '4cos² x − 1 = 0'],
      ['int2_4c', '2cosec x − 2sen x = cotg x'],
      ['sin_slider', 'sen x = c (interactivo)'],
    ],
    'pole_exclusion',
    (id) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ preset: id });
      syncUI();
    },
    'Ecuación trigonométrica'
  );

  const setDomainChip = addChips(
    board.controls,
    [
      ['Q1', 'x ∈ [0; π/2]'],
      ['0_2pi', 'x ∈ [0; 2π)'],
      ['R', 'x ∈ ℝ (Clases C_α)'],
    ],
    'R',
    (d) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ domain: d });
    },
    'Dominio pedido'
  );

  const sliderC = addRange(
    board.controls,
    store,
    'thresholdC',
    'Nivel horizontal c (para sen x = c)',
    -1.5,
    1.5,
    0.5,
    0.25,
    (v) => fmtNumberEsAR(v, 2)
  );
  sliderC.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
    store.set({ preset: 'sin_slider' });
    setPresetChip('sin_slider');
  });

  const syncUI = () => {
    const st = store.get();
    sliderC.labelEl.style.display = st.preset === 'sin_slider' ? '' : 'none';
    sliderC.input.value = String(st.thresholdC);
    sliderC.output.textContent = fmtNumberEsAR(st.thresholdC, 2);
  };
  syncUI();

  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ preset: 'pole_exclusion', domain: 'R', thresholdC: 0.5 });
    setPresetChip('pole_exclusion');
    setDomainChip('R');
    syncUI();
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

  const asymGroup = s('g', { class: 'trigf-eq-asym' });
  const curveA = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  const curveB = s('path', { fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2.2, 'stroke-dasharray': '5 4', 'stroke-linecap': 'round' });
  const thresholdLine = s('line', { x1: plane.box.x, x2: plane.box.x + plane.box.w, stroke: 'var(--green)', 'stroke-width': 1.8, 'stroke-dasharray': '4 3' });
  const marksGroup = s('g', { class: 'trigf-eq-marks' });

  const cHit = s('circle', { r: 16, fill: 'transparent', style: 'cursor: grab; touch-action: none;' });
  const cDot = s('circle', { r: 6.5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2, style: 'pointer-events: none;' });

  plane.layers.under.append(asymGroup, thresholdLine);
  plane.layers.curve.append(curveB, curveA);
  plane.layers.marks.append(marksGroup, cDot, cHit);

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
    cHit,
    () => mapper,
    ({ y }) => {
      predictBox.notifyInteraction();
      const nextC = clamp(Number((Math.round(y * 4) / 4).toFixed(2)), -1.5, 1.5);
      store.set({ preset: 'sin_slider', thresholdC: nextC });
      setPresetChip('sin_slider');
      syncUI();
    },
    { ariaLabel: 'Mover nivel horizontal c de la ecuación sen x = c', stepX: 0.25, stepY: 0.25 }
  );

  const render = () => {
    const st = store.get();
    clear(asymGroup);
    clear(marksGroup);

    let title = '';
    let solObj = null;
    let validDots = [];
    let poleDots = [];
    let breaks = [];
    let levelY = 0;

    if (st.preset === 'pole_exclusion') {
      title = '[(1 − sen x)(√3 − tg x)] / cos x = 0';
      // Plot tg x with asymptotes + horizontal line y = sqrt(3)
      breaks = asymptotesInRange('tan', X_MIN, X_MAX);
      curveA.setAttribute('d', plane.fnPath((x) => evalTrig('tan', x), X_MIN, X_MAX, { samples: 400, breaks }));
      curveB.removeAttribute('visibility');
      curveB.setAttribute('d', plane.fnPath((x) => evalTrig('sin', x), X_MIN, X_MAX, { samples: 250 }));
      levelY = Math.sqrt(3);

      solObj = solveElementaryTrigEq('tan', '√3', {
        domain: st.domain,
        excludedConditions: ['cos_zero'],
      });
      validDots = solObj.solutionsInDomain.map((sItem) => ({ x: sItem.rad, y: Math.sqrt(3), label: sItem.formatted }));
      poleDots = [{ x: Math.PI / 2, y: 1, label: 'π/2 (Excluido: cos = 0)' }];
    } else if (st.preset === 'simulacro2019') {
      title = '4cos² x − 1 = 0';
      curveA.setAttribute('d', plane.fnPath((x) => 4 * Math.pow(Math.cos(x), 2) - 1, X_MIN, X_MAX, { samples: 300 }));
      curveB.setAttribute('visibility', 'hidden');
      levelY = 0;
      solObj = solveQuadraticTrigEq({ fnName: 'cos', a: 4, b: 0, c: -1, domain: st.domain });
      validDots = solObj.solutionsInDomain.map((sItem) => ({ x: sItem.rad, y: 0, label: sItem.formatted }));
    } else if (st.preset === 'int2_4c') {
      title = '2cosec x − 2sen x = cotg x (cos x = 0 o cos x = 1/2, sen x ≠ 0)';
      breaks = asymptotesInRange('csc', X_MIN, X_MAX);
      curveA.setAttribute('d', plane.fnPath((x) => evalTrig('cot', x), X_MIN, X_MAX, { samples: 400, breaks }));
      curveB.removeAttribute('visibility');
      curveB.setAttribute('d', plane.fnPath((x) => 2 * evalTrig('csc', x) - 2 * Math.sin(x), X_MIN, X_MAX, { samples: 400, breaks }));
      levelY = 0;
      // 2/sin - 2sin = cos/sin => 2(1 - sin^2) = cos => 2cos^2 - cos = 0 => cos = 0 or cos = 1/2
      solObj = solveQuadraticTrigEq({ fnName: 'cos', a: 2, b: -1, c: 0, domain: st.domain, excludedConditions: ['sin_zero'] });
      validDots = solObj.solutionsInDomain.map((sItem) => ({
        x: sItem.rad,
        y: evalTrig('cot', sItem.rad),
        label: sItem.formatted,
      }));
      poleDots = [
        { x: 0, y: 0, label: '0 (sen 0 = 0)' },
        { x: Math.PI, y: 0, label: 'π (sen π = 0)' },
      ];
    } else {
      title = `sen x = ${fmtNumberEsAR(st.thresholdC, 2)}`;
      curveA.setAttribute('d', plane.fnPath((x) => Math.sin(x), X_MIN, X_MAX, { samples: 300 }));
      curveB.setAttribute('visibility', 'hidden');
      levelY = st.thresholdC;
      solObj = solveElementaryTrigEq('sin', st.thresholdC, { domain: st.domain });
      validDots = solObj.solutionsInDomain.map((sItem) => ({ x: sItem.rad, y: st.thresholdC, label: sItem.formatted }));
    }

    // Draw asymptotes at breaks
    breaks.forEach((bx) => {
      const px = plane.sx(bx);
      asymGroup.append(
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

    const linePy = clampToPlane(plane, plane.box.x + 20, plane.sy(levelY), 6).cy;
    thresholdLine.setAttribute('y1', String(linePy));
    thresholdLine.setAttribute('y2', String(linePy));
    cHit.setAttribute('cx', String(plane.box.x + 28));
    cHit.setAttribute('cy', String(linePy));
    cHit.setAttribute('aria-valuenow', String(levelY));
    cDot.setAttribute('cx', String(plane.box.x + 28));
    cDot.setAttribute('cy', String(linePy));

    validDots.forEach((d) => {
      const pos = clampToPlane(plane, plane.sx(d.x), plane.sy(d.y), 6);
      marksGroup.append(
        s('circle', { cx: pos.cx, cy: pos.cy, r: 5.5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 1.8 }),
        s('text', {
          x: pos.cx,
          y: Math.max(plane.box.y + 16, pos.cy - 10),
          class: 'trigf-svg-label',
          fill: 'var(--green)',
          'text-anchor': pos.cx > plane.box.x + plane.box.w - 40 ? 'end' : 'middle',
        }, d.label)
      );
    });

    poleDots.forEach((p) => {
      const pos = clampToPlane(plane, plane.sx(p.x), plane.sy(p.y), 6);
      marksGroup.append(
        s('circle', { cx: pos.cx, cy: pos.cy, r: 6.5, fill: 'var(--bg)', stroke: 'var(--pink)', 'stroke-width': 2.5 }),
        s('text', {
          x: pos.cx + (pos.cx < plane.box.x + 60 ? 10 : 0),
          y: Math.min(plane.box.y + plane.box.h - 10, pos.cy + 18),
          class: 'trigf-svg-label',
          fill: 'var(--pink)',
          'text-anchor': pos.cx < plane.box.x + 60 ? 'start' : 'middle',
        }, p.label)
      );
    });

    const formattedAns =
      st.domain === 'Q1'
        ? solObj.solutionsInDomain.length === 0
          ? '∅'
          : `{${solObj.solutionsInDomain.map((x) => x.formatted).join('; ')}}`
        : st.domain === '0_2pi'
          ? solObj.formatted0To2Pi
          : solObj.formattedR;

    renderReadout(board.readout, title, [
      ['Solución en dominio pedido', formattedAns],
      ['En [0; 2π)', solObj.formatted0To2Pi],
      ['En ℝ (Clases C_α)', solObj.formattedR],
      ['Aduana de polos', poleDots.length ? `Excluidos: ${poleDots.map((p) => p.label).join(', ')}` : Math.abs(levelY) > 1 && st.preset === 'sin_slider' ? '∅ porque |c| > 1 sale de Im(sen) = [−1; 1]' : 'Todas las ramas dentro del dominio'],
    ]);
  };

  store.subscribe(render);
  render();
  return { store, board, plane };
}
