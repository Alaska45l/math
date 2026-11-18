/**
 * @file js/modules/racionales-irracionales/widgets/explorador-asintotas.js
 * Widget 3 (Sec 4): Horizontal Asymptotes by Degree, Vertical Asymptotes,
 * Unordered Denominator Trap, Homographic Sliders & Graph-to-Formula Study.
 * 2-stage POE + keyboard-accessible draggable probe (attachSvgDrag) + persistent DOM nodes.
 */

import {
  s,
  clear,
  createStore,
  createCartesianBoard,
  createPredictBox,
  createCartesianMapper,
  attachSvgDrag,
  addRange,
  addChips,
  button,
  renderReadout,
  clampToPlane,
  anchorPlaneLabel,
  playClick,
  fmt,
  MINUS,
} from '../../../core/board-kit.js';
import {
  polyFromDescending,
  polyMul,
  analyzeRationalFunction,
  formatPoly,
} from '../logic.js';

const REGIMES = [
  ['deg_lt', 'gr(P) < gr(Q) -> A.H. y = 0'],
  ['deg_eq', 'gr(P) = gr(Q) -> A.H. y = a_n/b_m'],
  ['deg_gt', 'gr(P) > gr(Q) -> Sin A.H.'],
];

const EXAM_PRESETS = [
  ['ex_2025', '(2x+1)/(3−x)'],
  ['ex_unord', '(2−3x)/(x+5)'],
  ['ex_ej11', '4x/(2x−2)'],
  ['ex_neg', '−(x+1)/(x+2)'],
  ['ex_hole', 'Con agujero (Int. 2)'],
];

function buildRationalSpec(st) {
  if (st.mode === 'deg_lt') {
    const P = polyFromDescending([2, 1]);
    const Q = polyFromDescending([1, 0, 1]); // x^2 + 1
    return {
      P,
      Q,
      label: '(2x + 1) / (x² + 1)',
      regime: 'deg_lt',
      obliqueWarning: null,
    };
  }
  if (st.mode === 'deg_gt') {
    const P = polyFromDescending([1, 0, -1]); // x^2 - 1
    const Q = polyFromDescending([1, 2]); // x + 2
    return {
      P,
      Q,
      label: '(x² − 1) / (x + 2)',
      regime: 'deg_gt',
      obliqueWarning:
        'Fuera del cuadernillo oficial: el programa llega hasta confirmar que no hay asíntota horizontal cuando gr(P) > gr(Q).',
    };
  }
  if (st.mode === 'ex_hole') {
    // ((x - 2)(x + 2)) / ((x - 2)(x + 1)) -> hole at (2; 4/3), V.A. x = -1, H.A. y = 1
    const P = polyMul(polyFromDescending([1, -2]), polyFromDescending([1, 2]));
    const Q = polyMul(polyFromDescending([1, -2]), polyFromDescending([1, 1]));
    return {
      P,
      Q,
      label: '(x² − 4) / ((x − 2)(x + 1))',
      regime: 'deg_eq',
      obliqueWarning: null,
    };
  }

  // Homographic (a*x + b) / (c*x + d)
  let c = st.c;
  let d = st.d;
  if (c === 0 && d === 0) c = 1;
  const P = polyFromDescending([st.a, st.b]);
  const Q = polyFromDescending([c, d]);
  return {
    P,
    Q,
    label: `(${formatPoly(P)}) / (${formatPoly(Q)})`,
    regime: st.a !== 0 && c === 0 ? 'deg_gt' : st.a === 0 && c !== 0 ? 'deg_lt' : 'deg_eq',
    obliqueWarning:
      st.a !== 0 && c === 0
        ? 'Al hacerse c = 0, Q(x) queda constante y gr(P) > gr(Q): no hay asíntota horizontal.'
        : null,
  };
}

export function initExploradorAsintotas(host) {
  if (!host) return null;
  clear(host);

  const store = createStore({
    mode: 'ex_2025',
    a: 2,
    b: 1,
    c: -1,
    d: 3,
    probeX: 5,
  });

  const predictBox = createPredictBox({
    classPrefix: 'ri',
    prompt:
      'Para la función f(x) = (2x + 1)/(3 − x), ¿cuál es la ecuación de su asíntota horizontal?',
    options: [
      {
        label: 'y = 2/3 (dividiendo los dos primeros números visibles)',
        correct: false,
        explanation:
          'Cuidado: el denominador está desordenado (3 − x = −1·x + 3). El coeficiente principal de Q(x) es −1, no 3.',
      },
      {
        label: 'y = −2 (razón 2 / (−1) entre los coeficientes de x)',
        correct: true,
        explanation:
          '¡Impecable! Ordenando arriba y abajo por potencias decrecientes, 2x / (−x) = −2, así que la A.H. es y = −2.',
      },
      {
        label: 'x = −2 (recta vertical)',
        correct: false,
        explanation:
          'La asíntota horizontal fija una altura y constante (y = −2). La asíntota vertical corta el eje X en x = 3.',
      },
    ],
    onVerify: () => {
      store.set({ mode: 'ex_2025', a: 2, b: 1, c: -1, d: 3, probeX: 6.5 });
    },
  });

  const board = createCartesianBoard(
    host,
    'Explorador de asíntotas horizontales, verticales y estudio completo',
    {
      width: 640,
      height: 340,
      xMin: -8,
      xMax: 8,
      yMin: -6,
      yMax: 6,
      xStep: 2,
      yStep: 2,
    },
    { prefix: 'ri' }
  );
  host.prepend(predictBox);

  const updateRegimeChips = addChips(
    board.controls,
    REGIMES,
    'deg_eq',
    (regime) => {
      playClick();
      predictBox.notifyInteraction();
      if (regime === 'deg_lt') store.set({ mode: 'deg_lt', probeX: 4 });
      else if (regime === 'deg_gt') store.set({ mode: 'deg_gt', probeX: 2.5 });
      else store.set({ mode: 'homographic_custom', a: 2, b: 1, c: -1, d: 3, probeX: 5 });
    },
    'Régimen según grados de P(x) y Q(x)'
  );

  const updatePresetChips = addChips(
    board.controls,
    EXAM_PRESETS,
    'ex_2025',
    (preset) => {
      playClick();
      predictBox.notifyInteraction();
      if (preset === 'ex_2025') store.set({ mode: 'ex_2025', a: 2, b: 1, c: -1, d: 3, probeX: 5 });
      else if (preset === 'ex_unord') store.set({ mode: 'ex_unord', a: -3, b: 2, c: 1, d: 5, probeX: 4 });
      else if (preset === 'ex_ej11') store.set({ mode: 'ex_ej11', a: 4, b: 0, c: 2, d: -2, probeX: 4 });
      else if (preset === 'ex_neg') store.set({ mode: 'ex_neg', a: -1, b: -1, c: 1, d: 2, probeX: 3 });
      else if (preset === 'ex_hole') store.set({ mode: 'ex_hole', probeX: 3 });
    },
    'Casos clásicos y de examen'
  );

  const slidersRow = document.createElement('div');
  slidersRow.className = 'ri-sliders-grid';
  board.controls.append(slidersRow);

  const aCtrl = addRange(slidersRow, store, 'a', 'a (x arriba)', -4, 4, 2, 1);
  const bCtrl = addRange(slidersRow, store, 'b', 'b (indep. arriba)', -5, 5, 1, 1);
  const cCtrl = addRange(slidersRow, store, 'c', 'c (x abajo)', -3, 3, -1, 1);
  const dCtrl = addRange(slidersRow, store, 'd', 'd (indep. abajo)', -5, 5, 3, 1);

  [aCtrl, bCtrl, cCtrl, dCtrl].forEach((ctrl) => {
    ctrl.input.addEventListener('input', () => {
      predictBox.notifyInteraction();
      const cur = store.get();
      if (cur.c === 0 && cur.d === 0) {
        store.set({ mode: 'homographic_custom', c: 1 });
      } else {
        store.set({ mode: 'homographic_custom' });
      }
    });
  });

  const resetBtn = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ mode: 'ex_2025', a: 2, b: 1, c: -1, d: 3, probeX: 5 });
  }, 'chip chip--ghost');
  board.actions.append(resetBtn);

  // Persistent SVG layers & elements
  const { plane } = board;
  const curvePath = s('path', {
    d: '',
    fill: 'none',
    stroke: 'var(--yellow)',
    'stroke-width': 2.6,
  });
  plane.layers.curve.append(curvePath);

  const vaLine = s('line', {
    x1: 0, y1: plane.box.y, x2: 0, y2: plane.box.y + plane.box.h,
    stroke: 'var(--pink)', 'stroke-width': 2, 'stroke-dasharray': '6 4', visibility: 'hidden',
  });
  const vaLabel = s('text', {
    x: 0, y: plane.box.y + 18, fill: 'var(--pink)', 'font-size': 12, 'font-weight': 'bold', visibility: 'hidden',
  }, '');

  const haLine = s('line', {
    x1: plane.box.x, y1: 0, x2: plane.box.x + plane.box.w, y2: 0,
    stroke: 'var(--blue)', 'stroke-width': 2, 'stroke-dasharray': '6 4', visibility: 'hidden',
  });
  const haLabel = s('text', {
    x: plane.box.x + 8, y: 0, fill: 'var(--blue)', 'font-size': 12, 'font-weight': 'bold', visibility: 'hidden',
  }, '');

  plane.layers.under.append(vaLine, vaLabel, haLine, haLabel);

  const markersGroup = s('g', { class: 'ri-asym-markers' });
  plane.layers.marks.append(markersGroup);

  const probeDot = s('circle', {
    cx: plane.sx(5),
    cy: plane.sy(0),
    r: 8,
    fill: 'var(--green)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
    class: 'ri-drag-handle',
    'aria-label': 'Sonda móvil x sobre la curva racional',
    'aria-valuemin': '-8',
    'aria-valuemax': '8',
    'aria-valuenow': '5',
  });
  const probeBadge = s('text', {
    x: plane.sx(5),
    y: plane.sy(0) - 12,
    fill: 'var(--green)',
    'font-size': 12,
    'font-weight': 'bold',
  }, '');
  plane.layers.marks.append(probeDot, probeBadge);

  const noteBadge = s('text', {
    x: plane.box.x + plane.box.w - 8,
    y: plane.box.y + plane.box.h - 10,
    'text-anchor': 'end',
    fill: 'var(--purple, #c3a6ff)',
    'font-size': 11,
    visibility: 'hidden',
  }, '');
  plane.layers.labels.append(noteBadge);

  const mapper = createCartesianMapper(plane.box, {
    xMin: plane.cfg.xMin,
    xMax: plane.cfg.xMax,
    yMin: plane.cfg.yMin,
    yMax: plane.cfg.yMax,
  });

  attachSvgDrag(
    board.svg,
    probeDot,
    () => mapper,
    ({ x }) => {
      predictBox.notifyInteraction();
      const clamped = Math.max(-7.75, Math.min(7.75, Math.round(x * 4) / 4));
      store.set({ probeX: clamped });
    },
    { stepX: 0.25, stepY: 0, ariaLabel: 'Sonda móvil x sobre la curva racional' }
  );

  const render = (st) => {
    const spec = buildRationalSpec(st);
    updateRegimeChips(spec.regime);
    updatePresetChips(EXAM_PRESETS.some(([id]) => id === st.mode) ? st.mode : '__none__');

    const slidersEnabled = !['deg_lt', 'deg_gt', 'ex_hole'].includes(st.mode);
    slidersRow.style.opacity = slidersEnabled ? '1' : '0.45';
    [aCtrl, bCtrl, cCtrl, dCtrl].forEach((ctrl) => {
      ctrl.input.disabled = !slidersEnabled;
    });
    aCtrl.input.value = String(st.a);
    aCtrl.output.textContent = fmt(st.a);
    bCtrl.input.value = String(st.b);
    bCtrl.output.textContent = fmt(st.b);
    cCtrl.input.value = String(st.c);
    cCtrl.output.textContent = fmt(st.c);
    dCtrl.input.value = String(st.d);
    dCtrl.output.textContent = fmt(st.d);

    const analysis = analyzeRationalFunction(spec.P, spec.Q);
    const breaks = analysis.verticalAsymptotes.map((va) => va.x);
    const dStr = plane.fnPath((x) => analysis.evalAt(x), -8, 8, { samples: 400, breaks });
    curvePath.setAttribute('d', dStr);

    // V.A.
    if (analysis.verticalAsymptotes.length > 0) {
      const va = analysis.verticalAsymptotes[0];
      const px = plane.sx(va.x);
      if (px >= plane.box.x && px <= plane.box.x + plane.box.w) {
        vaLine.setAttribute('x1', String(px));
        vaLine.setAttribute('x2', String(px));
        vaLine.setAttribute('visibility', 'visible');
        const labelOnLeft = px > plane.box.x + plane.box.w - 95;
        vaLabel.setAttribute('x', String(labelOnLeft ? px - 6 : px + 6));
        vaLabel.setAttribute('text-anchor', labelOnLeft ? 'end' : 'start');
        vaLabel.textContent = `A.V. ${va.equation}`;
        vaLabel.setAttribute('visibility', 'visible');
      } else {
        vaLine.setAttribute('visibility', 'hidden');
        vaLabel.setAttribute('visibility', 'hidden');
      }
    } else {
      vaLine.setAttribute('visibility', 'hidden');
      vaLabel.setAttribute('visibility', 'hidden');
    }

    // H.A.
    if (analysis.horizontalAsymptote.hasHA) {
      const py = plane.sy(analysis.horizontalAsymptote.value);
      if (py >= plane.box.y && py <= plane.box.y + plane.box.h) {
        haLine.setAttribute('y1', String(py));
        haLine.setAttribute('y2', String(py));
        haLine.setAttribute('visibility', 'visible');
        haLabel.setAttribute('y', String(py < plane.box.y + 20 ? py + 14 : py - 6));
        haLabel.textContent = `A.H. ${analysis.horizontalAsymptote.equation}`;
        haLabel.setAttribute('visibility', 'visible');
      } else {
        haLine.setAttribute('visibility', 'hidden');
        haLabel.setAttribute('visibility', 'hidden');
      }
    } else {
      haLine.setAttribute('visibility', 'hidden');
      haLabel.setAttribute('visibility', 'hidden');
    }

    if (spec.obliqueWarning) {
      noteBadge.textContent = 'Sin A.H. (gr(P) > gr(Q) — ampliación fuera de cuadernillo)';
      noteBadge.setAttribute('visibility', 'visible');
    } else {
      noteBadge.setAttribute('visibility', 'hidden');
    }

    // Zeros, Y-intercept, Holes
    clear(markersGroup);
    analysis.zeros.forEach((z) => {
      if (z.value >= -8 && z.value <= 8) {
        const { cx, cy } = clampToPlane(plane, plane.sx(z.value), plane.sy(0), 5);
        markersGroup.append(
          s('circle', { cx, cy, r: 5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 1.5 })
        );
      }
    });
    if (analysis.yIntercept && analysis.yIntercept.y >= -6 && analysis.yIntercept.y <= 6) {
      const { cx, cy } = clampToPlane(plane, plane.sx(0), plane.sy(analysis.yIntercept.y), 5);
      markersGroup.append(
        s('circle', { cx, cy, r: 5, fill: 'var(--blue)', stroke: 'var(--bg)', 'stroke-width': 1.5 })
      );
    }
    analysis.holes.forEach((h) => {
      const { cx, cy } = clampToPlane(plane, plane.sx(h.x), plane.sy(h.y), 6);
      const pos = anchorPlaneLabel(plane, cx, cy, 78, { x: 10, y: 10 });
      markersGroup.append(
        s('circle', { cx, cy, r: 6, fill: 'var(--bg)', stroke: 'var(--yellow)', 'stroke-width': 2.5 }),
        s('text', { x: pos.lx, y: pos.ly, 'text-anchor': pos.anchor, fill: 'var(--yellow)', 'font-size': 11.5, 'font-weight': 'bold' }, `Agujero ${h.formatted}`)
      );
    });

    // Probe update
    const yVal = analysis.evalAt(st.probeX);
    const safeY = Number.isFinite(yVal) ? yVal : 0;
    const clamped = clampToPlane(plane, plane.sx(st.probeX), plane.sy(safeY), 8);
    probeDot.setAttribute('cx', String(clamped.cx));
    probeDot.setAttribute('cy', String(clamped.cy));
    probeDot.setAttribute('aria-valuenow', String(st.probeX));
    const lblPos = anchorPlaneLabel(plane, clamped.cx, clamped.cy, 95, { x: 10, y: 12 });
    probeBadge.setAttribute('x', String(lblPos.lx));
    probeBadge.setAttribute('y', String(lblPos.ly));
    probeBadge.setAttribute('text-anchor', lblPos.anchor);
    probeBadge.textContent = Number.isFinite(yVal)
      ? `(${fmt(st.probeX)}; ${fmt(Number(yVal.toFixed(2)))})`
      : `x = ${fmt(st.probeX)} ∉ Dom`;

    const fPosInf = analysis.evalAt(1000);
    const fNegInf = analysis.evalAt(-1000);
    const tailStr = analysis.horizontalAsymptote.hasHA
      ? `x→−∞: ${fmt(Number(fNegInf.toFixed(3)))} | x→+∞: ${fmt(Number(fPosInf.toFixed(3)))} (tiende a ${analysis.horizontalAsymptote.equation})`
      : `|f(±1000)| ≈ ${fmt(Number(Math.abs(fPosInf).toFixed(1)))} (crece sin cota: no tiene A.H.)`;

    const rows = [
      ['Función', `f(x) = ${spec.label} · Dom = ${analysis.domain.domainFormatted}`],
      [
        'Asíntotas y C₀',
        `A.V.: ${analysis.verticalAsymptotes.map((v) => v.equation).join('; ') || 'ninguna'} · A.H.: ${analysis.horizontalAsymptote.equation} · C₀ = ${analysis.zerosFormatted}`,
      ],
      [
        'Imagen y comportamiento',
        `${analysis.image ? `Im = ${analysis.image.formatted} · ` : ''}${tailStr}`,
      ],
    ];
    if (spec.obliqueWarning) {
      rows.push(['Alcance curricular', spec.obliqueWarning]);
    }
    renderReadout(board.readout, 'Radiografía asintótica en tiempo real', rows);
  };

  store.subscribe(render);
  render(store.get());

  return { store, board, predictBox };
}
