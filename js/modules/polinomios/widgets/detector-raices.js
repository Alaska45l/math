/**
 * @file js/modules/polinomios/widgets/detector-raices.js
 * Widget 5 (Sec 5): Factorización en factores primos sobre R y multiplicidad algebraica,
 * con conmutador explícito hacia la Ampliación Didáctica (fuera del programa de ingreso)
 * sobre plano cartesiano con clipPath y punto sonda arrastrable por teclado.
 */

import {
  h,
  s,
  clear,
  createStore,
  createQuadBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  createPredictBox,
  attachSvgDrag,
  addChips,
  button,
  renderReadout,
  playClick,
} from '../../../core/board-kit.js';
import {
  polyFromDescending,
  polyMul,
  polyPow,
  factorPolynomial,
  evalPolyNumber,
  formatPoly,
  ratToString,
  fmt,
} from '../logic.js';

const ROOT_PRESETS = [
  {
    id: 'sim2019',
    label: 'Irreducible + mult: −3x(x²−4)(x²+1)²',
    poly: polyMul(
      polyMul(polyFromDescending([-3, 0]), polyFromDescending([1, 0, -4])),
      polyPow(polyFromDescending([1, 0, 1]), 2)
    ),
    methodNote: 'Factor común (−3x), diferencia de cuadrados (x²−4) y factor cuadrático irreducible doble (x²+1)².',
  },
  {
    id: 'multi_123',
    label: 'Multiplicidad 1, 2 y 3: (x+2)(x−1)²(x−3)³',
    poly: polyMul(
      polyMul(polyFromDescending([1, 2]), polyPow(polyFromDescending([1, -1]), 2)),
      polyPow(polyFromDescending([1, -3]), 3)
    ),
    methodNote: 'Grado 6 con 3 raíces reales distintas de multiplicidades 1, 2 y 3.',
  },
  {
    id: 'grouping',
    label: 'Por grupos: x³ − 2x² + 3x − 6',
    poly: polyFromDescending([1, -2, 3, -6]),
    methodNote: 'Factor común por grupos: x²(x−2) + 3(x−2) = (x−2)(x²+3).',
  },
  {
    id: 'cube_binom',
    label: 'Cuatrinomio cubo perfecto: x³ + 6x² + 12x + 8',
    poly: polyFromDescending([1, 6, 12, 8]),
    methodNote: 'Cuatrinomio cubo perfecto (x + 2)³: raíz −2 con multiplicidad 3.',
  },
];

export function initDetectorRaices(host) {
  if (!host) return null;
  clear(host);

  const store = createStore({
    presetId: 'sim2019',
    viewMode: 'algebraic', // 'algebraic' (official UNMDP) | 'graphical' (didactic extension)
    probeX: 0,
  });

  const predictBox = createPredictBox({
    classPrefix: 'poly',
    prompt: 'P(x) = −3x(x² − 4)(x² + 1)² tiene grado 7. ¿Cuántas raíces reales DISTINTAS posee?',
    options: [
      {
        label: '7 raíces reales distintas, igual que su grado',
        correct: false,
        explanation:
          'Un polinomio de grado 7 tiene A LO SUMO 7 raíces reales contadas con multiplicidad. Además, (x² + 1) nunca se anula en ℝ.',
      },
      {
        label: '3 raíces reales distintas: −2, 0 y 2',
        correct: true,
        explanation:
          '¡Exacto! −3x aporta x = 0, (x² − 4) aporta ±2, y (x² + 1)² no tiene raíces reales porque x² + 1 >= 1 > 0 para todo x real.',
      },
      {
        label: '5 raíces reales (contando +1 y −1 de x² + 1)',
        correct: false,
        explanation:
          'x² + 1 = 0 da x² = −1, que no tiene solución en ℝ. Las raíces ±1 anulan a (x² − 1), no a (x² + 1).',
      },
    ],
    onVerify: () => {
      store.set({ presetId: 'sim2019', viewMode: 'algebraic' });
    },
  });

  host.classList.add('poly-widget', 'pr-widget');
  const controls = h('div', { class: 'poly-widget__controls pr-widget__controls' });
  const bannerEl = h('div', { class: 'poly-scope-banner' });
  const algebraicPane = h('div', { class: 'poly-algebraic-pane' });
  const boardObj = createQuadBoardSvg({
    width: 640,
    height: 290,
    ariaLabel: 'Ampliación gráfica opcional de multiplicidad de raíces',
    className: 'poly-board-svg pr-board-svg',
    pad: { top: 20, right: 20, bottom: 26, left: 38 },
  });
  const graphWrap = h('div', { class: 'poly-graph-pane', hidden: '' }, boardObj.svg);
  const readout = h('div', { class: 'poly-readout pr-readout', 'aria-live': 'polite' });
  const actions = h('div', { class: 'poly-widget__actions pr-widget__actions' });

  host.append(predictBox, controls, bannerEl, algebraicPane, graphWrap, readout, actions);

  const updateChips = addChips(
    controls,
    ROOT_PRESETS.map((p) => [p.id, p.label]),
    store.get().presetId,
    (presetId) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ presetId });
    },
    'Familias de factorización'
  );

  const btnAlg = button('Vista Algebraica (Programa de Ingreso)', null, () => {
    playClick();
    predictBox.notifyInteraction();
    store.set({ viewMode: 'algebraic' });
  }, 'chip is-active');
  const btnGraph = button('Ampliación Didáctica: Trazo en el Plano (Fuera del programa)', null, () => {
    playClick();
    predictBox.notifyInteraction();
    store.set({ viewMode: 'graphical' });
  }, 'chip chip--ghost');
  actions.append(btnAlg, btnGraph);

  // Persistent curve + probe nodes in graphical layer
  const mapper = createCartesianMapper(boardObj.plotBox, { xMin: -4.5, xMax: 4.5, yMin: -25, yMax: 25 });
  drawCartesianAxes(boardObj.gridLayer, mapper, { xStep: 1, yStep: 10 });
  const curvePath = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2.5 });
  boardObj.clippedLayer.append(curvePath);

  const marksGroup = s('g', {});
  const probeDot = s('circle', { r: 7, fill: 'var(--blue)', stroke: 'var(--bg)', 'stroke-width': 2, class: 'poly-drag-handle' });
  const probeText = s('text', { fill: 'var(--blue)', 'font-size': 12.5, 'font-weight': 'bold' });
  boardObj.overlayLayer.append(marksGroup, probeDot, probeText);

  attachSvgDrag(
    boardObj.svg,
    probeDot,
    () => mapper,
    ({ x }) => {
      predictBox.notifyInteraction();
      const snapped = Math.max(-4, Math.min(4, Math.round(x * 4) / 4));
      store.set({ probeX: snapped });
    },
    { ariaLabel: 'Sonda sobre el eje X para inspeccionar multiplicidad', stepX: 0.25, stepY: 0 }
  );

  const render = (st) => {
    updateChips(st.presetId);
    const preset = ROOT_PRESETS.find((p) => p.id === st.presetId) || ROOT_PRESETS[0];
    const fac = factorPolynomial(preset.poly);

    const isGraph = st.viewMode === 'graphical';
    btnAlg.className = `chip ${!isGraph ? 'is-active' : 'chip--ghost'}`;
    btnGraph.className = `chip ${isGraph ? 'is-active' : 'chip--ghost'}`;

    if (isGraph) {
      algebraicPane.setAttribute('hidden', '');
      graphWrap.removeAttribute('hidden');
      bannerEl.className = 'poly-scope-banner is-extension';
      bannerEl.textContent =
        'Ampliación visual (fuera del programa de ingreso): el cuadernillo trabaja la multiplicidad únicamente en forma algebraica. Observá cómo multiplicidad impar cruza el eje X y multiplicidad par rebota.';

      // Scale Y softly so curve fits cleanly
      let maxAbs = 10;
      for (let x = -4; x <= 4; x += 0.25) {
        const y = Math.abs(evalPolyNumber(preset.poly, x));
        if (Number.isFinite(y) && y < 500) maxAbs = Math.max(maxAbs, y);
      }
      const yLim = Math.min(180, Math.ceil(maxAbs * 1.15));
      const dynMapper = createCartesianMapper(boardObj.plotBox, { xMin: -4.5, xMax: 4.5, yMin: -yLim, yMax: yLim });
      drawCartesianAxes(boardObj.gridLayer, dynMapper, { xStep: 1, yStep: Math.max(5, Math.round(yLim / 3)) });
      curvePath.setAttribute('d', sampleCurvePath((x) => evalPolyNumber(preset.poly, x), dynMapper, 180));

      clear(marksGroup);
      fac.realRoots.forEach((rt) => {
        const rx = dynMapper.toX(rt.value);
        const ry = dynMapper.toY(0);
        if (rx >= boardObj.plotBox.x && rx <= boardObj.plotBox.x + boardObj.plotBox.w) {
          marksGroup.append(
            s('circle', { cx: rx, cy: ry, r: 5, fill: rt.multiplicity % 2 === 0 ? 'var(--pink)' : 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 1.5 }),
            s('text', { x: rx, y: ry - 10, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 11.5 }, `m=${rt.multiplicity}`)
          );
        }
      });

      const pyVal = evalPolyNumber(preset.poly, st.probeX);
      const px = dynMapper.toX(st.probeX);
      const py = Math.max(boardObj.plotBox.y + 8, Math.min(boardObj.plotBox.y + boardObj.plotBox.h - 8, dynMapper.toY(pyVal)));
      probeDot.setAttribute('cx', String(px));
      probeDot.setAttribute('cy', String(py));
      probeDot.setAttribute('aria-valuenow', String(st.probeX));
      probeText.setAttribute('x', String(Math.min(540, Math.max(50, px + 10))));
      probeText.setAttribute('y', String(Math.max(36, py - 10)));
      probeText.textContent = `(${fmt(st.probeX)}; ${fmt(pyVal, 1)})`;
    } else {
      graphWrap.setAttribute('hidden', '');
      algebraicPane.removeAttribute('hidden');
      bannerEl.className = 'poly-scope-banner';
      bannerEl.textContent =
        'Vista algebraica del programa oficial: descomposición en coeficiente principal por factores mónicos primos (lineales o cuadráticos irreducibles).';

      clear(algebraicPane);
      const tree = h('div', { class: 'poly-factor-tree' }, [
        h('div', { class: 'poly-factor-row' }, [
          h('span', { class: 'poly-factor-badge is-lead' }, `a_n = ${ratToString(fac.leadingCoeff)}`),
          ...fac.linearFactors.map((lf) =>
            h(
              'span',
              { class: 'poly-factor-badge is-linear' },
              `${lf.exactNumeric === 0 ? 'x' : `(x ${lf.exactNumeric > 0 ? '\u2212' : '+'} ${lf.formatted.replace(/^\u2212|-/, '')})`}${lf.multiplicity > 1 ? `^${lf.multiplicity}` : ''} · raíz ${lf.formatted} (m=${lf.multiplicity})`
            )
          ),
          ...fac.irreducibleQuadratics.map((iq) =>
            h(
              'span',
              { class: 'poly-factor-badge is-irred' },
              `(${iq.formatted})${iq.multiplicity > 1 ? `^${iq.multiplicity}` : ''} · Irreducible en ℝ (Δ < 0)`
            )
          ),
        ]),
      ]);
      algebraicPane.append(tree);
    }

    const rootsSummary = fac.realRoots.length
      ? fac.realRoots.map((r) => `${r.exact} (m=${r.multiplicity})`).join('; ')
      : 'Ninguna en ℝ';

    renderReadout(readout, 'Descomposición en factores primos', [
      ['Factorización', fac.formatted],
      ['Raíces reales', rootsSummary],
      ['Estrategia', preset.methodNote],
    ]);
  };

  store.subscribe(render);
  render(store.get());

  return { store };
}
