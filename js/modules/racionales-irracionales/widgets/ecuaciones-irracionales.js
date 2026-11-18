/**
 * @file js/modules/racionales-irracionales/widgets/ecuaciones-irracionales.js
 * Widget 4 (Sec 5 & Sec 6): Extraneous-Root Squaring Lab (real upper branch vs dashed ghost lower branch)
 * AND Shifted/Reflected Radical Grapher k*sqrt(ax + b) + c + Mixed Piecewise Explorer.
 * 2-stage POE + keyboard-accessible draggable x-probe (attachSvgDrag) + persistent DOM nodes.
 * Zero Unicode emojis (cross markers built with pure SVG <line> elements).
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
  analyzeIrrationalFunction,
  solveIrrationalEquation,
  analyzeMixedPiecewise,
} from '../logic.js';

const EQ_PRESETS = [
  ['eq_6', '√(x + 6) = x'],
  ['eq_2x3', '√(2x − 3) = x − 3'],
  ['eq_neg', '√(x − 1) = −5'],
  ['eq_odd', '∛(2x + 2) = 2'],
];

const GRAPH_PRESETS = [
  ['gr_ej14', '2 − √(x + 1)'],
  ['gr_ej21', '2 − √(3 − x)'],
  ['gr_ej17g', '3 − √(7x − 1)'],
  ['pw_15a', 'Tramos A (cuad + lineal)'],
  ['pw_15b', 'Tramos B (1/x y √x)'],
];

function getEqSpec(eqId) {
  if (eqId === 'eq_2x3') {
    return {
      title: '√(2x − 3) = x − 3',
      index: 2,
      k: 1,
      d: 0,
      gCoeffs: [-3, 2],
      rhsCoeffs: [-3, 1],
      xRange: [-2, 10],
    };
  }
  if (eqId === 'eq_neg') {
    return {
      title: '√(x − 1) = −5',
      index: 2,
      k: 1,
      d: 0,
      gCoeffs: [-1, 1],
      rhsCoeffs: [-5, 0],
      xRange: [-2, 10],
    };
  }
  if (eqId === 'eq_odd') {
    return {
      title: '∛(2x + 2) = 2',
      index: 3,
      k: 1,
      d: 0,
      gCoeffs: [2, 2],
      rhsCoeffs: [2, 0],
      xRange: [-6, 8],
    };
  }
  return {
    title: '√(x + 6) = x',
    index: 2,
    k: 1,
    d: 0,
    gCoeffs: [6, 1],
    rhsCoeffs: [0, 1],
    xRange: [-7, 7],
  };
}

function getPiecewiseSpec(presetId) {
  if (presetId === 'pw_15a') {
    // f(x) = x^2 - 3x + 2 on (1; 2]; x - 2 on (2; +inf)
    return {
      title: 'f(x) = { x² − 3x + 2 si x ∈ (1; 2];  x − 2 si x > 2 }',
      domText: '(1; +∞)',
      imText: '[−1/4; +∞)',
      pieces: [
        {
          minX: 1,
          maxX: 2,
          minInclusive: false,
          maxInclusive: true,
          fn: (x) => x * x - 3 * x + 2,
        },
        {
          minX: 2,
          maxX: Infinity,
          minInclusive: false,
          maxInclusive: false,
          fn: (x) => x - 2,
        },
      ],
      endpoints: [
        { x: 1, y: 0, closed: false },
        { x: 2, y: 0, closed: true },
      ],
    };
  }
  // pw_15b: g(x) = 1/x if x < 0; sqrt(x) if x in [0; 9]
  return {
    title: 'g(x) = { 1/x si x < 0;  √x si x ∈ [0; 9] }',
    domText: '(−∞; 9]',
    imText: '(−∞; 3]',
    pieces: [
      {
        minX: -Infinity,
        maxX: 0,
        minInclusive: false,
        maxInclusive: false,
        fn: (x) => (Math.abs(x) < 1e-9 ? NaN : 1 / x),
      },
      {
        minX: 0,
        maxX: 9,
        minInclusive: true,
        maxInclusive: true,
        fn: (x) => (x < 0 ? NaN : Math.sqrt(x)),
      },
    ],
    endpoints: [
      { x: 0, y: 0, closed: true },
      { x: 9, y: 3, closed: true },
    ],
  };
}

function drawSvgCross(cx, cy, r = 6, stroke = 'var(--pink)') {
  const g = s('g', { class: 'ri-extraneous-cross' });
  g.append(
    s('line', { x1: cx - r, y1: cy - r, x2: cx + r, y2: cy + r, stroke, 'stroke-width': 2.6, 'stroke-linecap': 'round' }),
    s('line', { x1: cx - r, y1: cy + r, x2: cx + r, y2: cy - r, stroke, 'stroke-width': 2.6, 'stroke-linecap': 'round' })
  );
  return g;
}

export function initEcuacionesIrracionales(host) {
  if (!host) return null;
  clear(host);

  const store = createStore({
    mode: 'equations', // 'equations' | 'graphs'
    eqId: 'eq_6',
    graphId: 'gr_ej21',
    k: -1,
    a: -1,
    b: 3,
    c: 2,
    probeX: 1,
  });

  const predictBox = createPredictBox({
    classPrefix: 'ri',
    prompt:
      'Al resolver √(x + 6) = x elevando ambos lados al cuadrado resultan x = 3 y x = −2. ¿Ambas raíces resuelven la ecuación original?',
    options: [
      {
        label: 'Sí: ambas anulan x² − x − 6 = 0, así que S = {−2; 3}',
        correct: false,
        explanation:
          'Elevar al cuadrado mezcla la rama real +√(x + 6) con la rama fantasma −√(x + 6). En x = −2 queda √4 = 2 ≠ −2: es solución extraviada.',
      },
      {
        label: 'No: solo x = 3 verifica √9 = 3; x = −2 es extraviada porque da 2 = −2',
        correct: true,
        explanation:
          '¡Exacto! La raíz cuadrada principal siempre es ≥ 0. En el gráfico ves que x = −2 corta a la rama fantasma punteada en rosa, no a la curva real.',
      },
      {
        label: 'Ninguna verifica y S = ∅',
        correct: false,
        explanation:
          'Probá x = 3: √(3 + 6) = √9 = 3 coincide exactamente con el miembro derecho x = 3.',
      },
    ],
    onVerify: () => {
      store.set({ mode: 'equations', eqId: 'eq_6', probeX: -2 });
    },
  });

  const board = createCartesianBoard(
    host,
    'Laboratorio de ecuaciones irracionales, rama fantasma y gráficas por tramos',
    {
      width: 640,
      height: 340,
      xMin: -7,
      xMax: 10,
      yMin: -6,
      yMax: 7,
      xStep: 2,
      yStep: 2,
    },
    { prefix: 'ri' }
  );
  host.prepend(predictBox);

  const updateModeChips = addChips(
    board.controls,
    [
      ['equations', 'Modo 1 · Ecuaciones y soluciones extraviadas'],
      ['graphs', 'Modo 2 · Gráfica radical k·√(ax+b)+c y Tramos'],
    ],
    'equations',
    (mode) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ mode, probeX: mode === 'equations' ? 1 : 2 });
    },
    'Modo del laboratorio irracional'
  );

  const eqChipsWrap = document.createElement('div');
  eqChipsWrap.className = 'ri-subcontrols';
  const updateEqChips = addChips(
    eqChipsWrap,
    EQ_PRESETS,
    'eq_6',
    (eqId) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ mode: 'equations', eqId, probeX: eqId === 'eq_2x3' ? 4 : 1 });
    },
    'Ecuaciones irracionales'
  );

  const graphChipsWrap = document.createElement('div');
  graphChipsWrap.className = 'ri-subcontrols';
  const updateGraphChips = addChips(
    graphChipsWrap,
    GRAPH_PRESETS,
    'gr_ej21',
    (graphId) => {
      playClick();
      predictBox.notifyInteraction();
      if (graphId === 'gr_ej14') store.set({ mode: 'graphs', graphId, k: -1, a: 1, b: 1, c: 2, probeX: 1 });
      else if (graphId === 'gr_ej21') store.set({ mode: 'graphs', graphId, k: -1, a: -1, b: 3, c: 2, probeX: 1 });
      else if (graphId === 'gr_ej17g') store.set({ mode: 'graphs', graphId, k: -1, a: 7, b: -1, c: 3, probeX: 2 });
      else if (graphId === 'pw_15a') store.set({ mode: 'graphs', graphId, probeX: 2.5 });
      else store.set({ mode: 'graphs', graphId, probeX: 4 });
    },
    'Gráficas radicales y por tramos'
  );

  const slidersRow = document.createElement('div');
  slidersRow.className = 'ri-sliders-grid';
  const kCtrl = addRange(slidersRow, store, 'k', 'k (reflejo / escala)', -3, 3, -1, 1);
  const aCtrl = addRange(slidersRow, store, 'a', 'a (x adentro)', -3, 7, -1, 1);
  const bCtrl = addRange(slidersRow, store, 'b', 'b (desplaz. x)', -5, 5, 3, 1);
  const cCtrl = addRange(slidersRow, store, 'c', 'c (altura vértice)', -4, 5, 2, 1);

  [kCtrl, aCtrl, bCtrl, cCtrl].forEach((ctrl) => {
    ctrl.input.addEventListener('input', () => {
      predictBox.notifyInteraction();
      const cur = store.get();
      if (cur.a === 0) store.set({ graphId: 'custom', a: 1 });
      else store.set({ graphId: 'custom' });
    });
  });

  board.controls.append(eqChipsWrap, graphChipsWrap, slidersRow);

  const resetBtn = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ mode: 'equations', eqId: 'eq_6', graphId: 'gr_ej21', k: -1, a: -1, b: 3, c: 2, probeX: 1 });
  }, 'chip chip--ghost');
  board.actions.append(resetBtn);

  // Persistent SVG layers & nodes
  const { plane } = board;
  const mainCurvePath = s('path', {
    d: '',
    fill: 'none',
    stroke: 'var(--yellow)',
    'stroke-width': 2.8,
  });
  const ghostCurvePath = s('path', {
    d: '',
    fill: 'none',
    stroke: 'var(--pink)',
    'stroke-width': 2,
    'stroke-dasharray': '5 5',
  });
  const rhsLinePath = s('path', {
    d: '',
    fill: 'none',
    stroke: 'var(--blue)',
    'stroke-width': 2.2,
  });
  plane.layers.curve.append(ghostCurvePath, rhsLinePath, mainCurvePath);

  const marksGroup = s('g', { class: 'ri-irrational-marks' });
  plane.layers.marks.append(marksGroup);

  const probeDot = s('circle', {
    cx: plane.sx(1),
    cy: plane.sy(0),
    r: 8,
    fill: 'var(--green)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
    class: 'ri-drag-handle',
    'aria-label': 'Sonda móvil x en el pizarrón irracional',
    'aria-valuemin': '-7',
    'aria-valuemax': '10',
    'aria-valuenow': '1',
  });
  const probeBadge = s('text', {
    x: plane.sx(1),
    y: plane.sy(0) - 12,
    fill: 'var(--green)',
    'font-size': 12,
    'font-weight': 'bold',
  }, '');
  plane.layers.marks.append(probeDot, probeBadge);

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
      const clamped = Math.max(-6.75, Math.min(9.75, Math.round(x * 4) / 4));
      store.set({ probeX: clamped });
    },
    { stepX: 0.25, stepY: 0, ariaLabel: 'Sonda móvil x en el pizarrón irracional' }
  );

  const render = (st) => {
    updateModeChips(st.mode);
    const isEq = st.mode === 'equations';
    eqChipsWrap.style.display = isEq ? '' : 'none';
    graphChipsWrap.style.display = isEq ? 'none' : '';
    const isPiecewise = !isEq && (st.graphId === 'pw_15a' || st.graphId === 'pw_15b');
    slidersRow.style.display = !isEq && !isPiecewise ? '' : 'none';

    clear(marksGroup);

    if (isEq) {
      updateEqChips(st.eqId);
      const spec = getEqSpec(st.eqId);
      const eqRes = solveIrrationalEquation({
        index: spec.index,
        k: spec.k,
        d: spec.d,
        gCoeffs: spec.gCoeffs,
        rhsCoeffs: spec.rhsCoeffs,
      });

      const evalLhs = (x) => {
        const g = (spec.gCoeffs[1] || 0) * x + (spec.gCoeffs[0] || 0);
        if (spec.index % 2 === 0 && g < 0) return NaN;
        const r = g < 0 ? -Math.pow(-g, 1 / spec.index) : Math.pow(g, 1 / spec.index);
        return spec.k * r + spec.d;
      };
      const evalGhost = (x) => {
        if (spec.index % 2 !== 0) return NaN;
        const g = (spec.gCoeffs[1] || 0) * x + (spec.gCoeffs[0] || 0);
        if (g < 0) return NaN;
        return -spec.k * Math.sqrt(g) + spec.d;
      };
      const evalRhs = (x) => (spec.rhsCoeffs[1] || 0) * x + (spec.rhsCoeffs[0] || 0);

      mainCurvePath.setAttribute('d', plane.fnPath(evalLhs, -7, 10, { samples: 400 }));
      ghostCurvePath.setAttribute('d', plane.fnPath(evalGhost, -7, 10, { samples: 400 }));
      rhsLinePath.setAttribute('d', plane.fnPath(evalRhs, -7, 10, { samples: 200 }));

      eqRes.validSolutions.forEach((sol) => {
        if (sol.x >= -7 && sol.x <= 10) {
          const { cx, cy } = clampToPlane(plane, plane.sx(sol.x), plane.sy(sol.lhsVal), 6);
          const pos = anchorPlaneLabel(plane, cx, cy, 88, { x: 10, y: 12 });
          marksGroup.append(
            s('circle', { cx, cy, r: 6, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2 }),
            s('text', { x: pos.lx, y: pos.ly, 'text-anchor': pos.anchor, fill: 'var(--green)', 'font-size': 12, 'font-weight': 'bold' }, `Válida x = ${sol.exact}`)
          );
        }
      });

      eqRes.extraneousSolutions.forEach((ex) => {
        if (ex.x >= -7 && ex.x <= 10) {
          const yCross = ex.rhsVal;
          const { cx, cy } = clampToPlane(plane, plane.sx(ex.x), plane.sy(yCross), 6);
          const pos = anchorPlaneLabel(plane, cx, cy, 108, { x: 10, y: 14 });
          marksGroup.append(
            drawSvgCross(cx, cy, 6, 'var(--pink)'),
            s('text', { x: pos.lx, y: pos.ly, 'text-anchor': pos.anchor, fill: 'var(--pink)', 'font-size': 11.5, 'font-weight': 'bold' }, `Extraviada x = ${ex.exact}`)
          );
        }
      });

      // Probe
      const lhsP = evalLhs(st.probeX);
      const rhsP = evalRhs(st.probeX);
      const yProbe = Number.isFinite(lhsP) ? lhsP : rhsP;
      const clamped = clampToPlane(plane, plane.sx(st.probeX), plane.sy(yProbe), 8);
      probeDot.setAttribute('cx', String(clamped.cx));
      probeDot.setAttribute('cy', String(clamped.cy));
      probeDot.setAttribute('aria-valuenow', String(st.probeX));
      const lblPos = anchorPlaneLabel(plane, clamped.cx, clamped.cy, 120, { x: 10, y: 12 });
      probeBadge.setAttribute('x', String(lblPos.lx));
      probeBadge.setAttribute('y', String(lblPos.ly));
      probeBadge.setAttribute('text-anchor', lblPos.anchor);
      probeBadge.textContent = Number.isFinite(lhsP)
        ? `x=${fmt(st.probeX)}: Izq=${fmt(Number(lhsP.toFixed(2)))} vs Der=${fmt(Number(rhsP.toFixed(2)))}`
        : `x=${fmt(st.probeX)} ∉ Dom`;

      renderReadout(board.readout, `Ecuación: ${spec.title}`, [
        ['Dominio y signo', `Dom = ${eqRes.domain.domainFormatted} · Signo miembro derecho: ${eqRes.signCondition}`],
        [
          'Verificación de raíces',
          `Válidas: ${eqRes.solutionFormatted} · Extraviadas descartadas: ${
            eqRes.extraneousSolutions.length
              ? eqRes.extraneousSolutions.map((e) => `${e.exact} (LHS=${e.lhsVal ?? 'indef'} ≠ RHS=${fmt(e.rhsVal)})`).join('; ')
              : 'ninguna'
          }`,
        ],
      ]);
      return;
    }

    // Mode 2: Shifted radical OR Mixed Piecewise
    updateGraphChips(st.graphId);
    ghostCurvePath.setAttribute('d', '');
    rhsLinePath.setAttribute('d', '');

    if (isPiecewise) {
      const pw = getPiecewiseSpec(st.graphId);
      const analysis = analyzeMixedPiecewise(pw.pieces);
      const breaks = st.graphId === 'pw_15b' ? [0] : [2];
      mainCurvePath.setAttribute(
        'd',
        plane.fnPath((x) => {
          const r = analysis.evalAt(x);
          return r.defined ? r.value : NaN;
        }, -7, 10, { samples: 420, breaks })
      );

      pw.endpoints.forEach((ep) => {
        const { cx, cy } = clampToPlane(plane, plane.sx(ep.x), plane.sy(ep.y), 6);
        marksGroup.append(
          s('circle', {
            cx,
            cy,
            r: 5.5,
            fill: ep.closed ? 'var(--green)' : 'var(--bg)',
            stroke: ep.closed ? 'var(--bg)' : 'var(--yellow)',
            'stroke-width': 2.2,
          })
        );
      });

      const rProbe = analysis.evalAt(st.probeX);
      const clamped = clampToPlane(
        plane,
        plane.sx(st.probeX),
        plane.sy(rProbe.defined ? rProbe.value : 0),
        8
      );
      probeDot.setAttribute('cx', String(clamped.cx));
      probeDot.setAttribute('cy', String(clamped.cy));
      probeDot.setAttribute('aria-valuenow', String(st.probeX));
      const lblPos = anchorPlaneLabel(plane, clamped.cx, clamped.cy, 100, { x: 10, y: 12 });
      probeBadge.setAttribute('x', String(lblPos.lx));
      probeBadge.setAttribute('y', String(lblPos.ly));
      probeBadge.setAttribute('text-anchor', lblPos.anchor);
      probeBadge.textContent = rProbe.defined
        ? `(${fmt(st.probeX)}; ${fmt(Number(rProbe.value.toFixed(2)))})`
        : `x = ${fmt(st.probeX)} ∉ Dom`;

      renderReadout(board.readout, `Función por tramos · ${pw.title}`, [
        ['Dominio e Imagen', `Dom = ${pw.domText} · Im = ${pw.imText}`],
        ['Ceros y unicidad', `C₀ = ${analysis.zerosFormatted} · Función válida: ${analysis.isValidFunction ? 'Sí' : 'Colisión en bordes'}`],
      ]);
      return;
    }

    // Parametric radical f(x) = k * sqrt(a*x + b) + c
    kCtrl.input.value = String(st.k);
    kCtrl.output.textContent = fmt(st.k);
    aCtrl.input.value = String(st.a);
    aCtrl.output.textContent = fmt(st.a);
    bCtrl.input.value = String(st.b);
    bCtrl.output.textContent = fmt(st.b);
    cCtrl.input.value = String(st.c);
    cCtrl.output.textContent = fmt(st.c);

    const aSafe = st.a === 0 ? 1 : st.a;
    const study = analyzeIrrationalFunction({
      k: st.k,
      index: 2,
      a: aSafe,
      b: st.b,
      c: st.c,
    });
    mainCurvePath.setAttribute('d', plane.fnPath((x) => study.evalAt(x), -7, 10, { samples: 400 }));

    if (study.startPoint) {
      const { cx, cy } = clampToPlane(plane, plane.sx(study.startPoint.x), plane.sy(study.startPoint.y), 6);
      const pos = anchorPlaneLabel(plane, cx, cy, 92, { x: 10, y: 12 });
      marksGroup.append(
        s('circle', { cx, cy, r: 6, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 }),
        s('text', { x: pos.lx, y: pos.ly, 'text-anchor': pos.anchor, fill: 'var(--yellow)', 'font-size': 11.5, 'font-weight': 'bold' }, `Inicio ${study.startPoint.formatted}`)
      );
    }
    study.zeros.forEach((z) => {
      if (z >= -7 && z <= 10) {
        const { cx, cy } = clampToPlane(plane, plane.sx(z), plane.sy(0), 5);
        marksGroup.append(
          s('circle', { cx, cy, r: 5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 1.5 })
        );
      }
    });

    const yProbe = study.evalAt(st.probeX);
    const clamped = clampToPlane(
      plane,
      plane.sx(st.probeX),
      plane.sy(Number.isFinite(yProbe) ? yProbe : 0),
      8
    );
    probeDot.setAttribute('cx', String(clamped.cx));
    probeDot.setAttribute('cy', String(clamped.cy));
    probeDot.setAttribute('aria-valuenow', String(st.probeX));
    const lblPos = anchorPlaneLabel(plane, clamped.cx, clamped.cy, 95, { x: 10, y: 12 });
    probeBadge.setAttribute('x', String(lblPos.lx));
    probeBadge.setAttribute('y', String(lblPos.ly));
    probeBadge.setAttribute('text-anchor', lblPos.anchor);
    probeBadge.textContent = Number.isFinite(yProbe)
      ? `(${fmt(st.probeX)}; ${fmt(Number(yProbe.toFixed(2)))})`
      : `x = ${fmt(st.probeX)} ∉ Dom`;

    const radSign = st.b >= 0 ? `+ ${fmt(st.b)}` : `${MINUS} ${fmt(Math.abs(st.b))}`;
    renderReadout(board.readout, `Gráfica radical: f(x) = ${fmt(st.k)}·√(${fmt(aSafe)}x ${radSign}) ${st.c >= 0 ? `+ ${fmt(st.c)}` : `${MINUS} ${fmt(Math.abs(st.c))}`}`, [
      ['Dominio e Imagen', `Dom = ${study.domain.domainFormatted} · Im = ${study.image.formatted}`],
      ['Ceros y punto inicial', `C₀ = ${study.zerosFormatted} · Vértice inicial: ${study.startPoint?.formatted || '—'}`],
    ]);
  };

  store.subscribe(render);
  render(store.get());

  return { store, board, predictBox };
}
