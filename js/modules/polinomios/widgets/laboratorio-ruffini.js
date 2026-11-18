/**
 * @file js/modules/polinomios/widgets/laboratorio-ruffini.js
 * Widget 4 (Sec 4): Regla de Ruffini mónica y no mónica (ax - b) con reescalado de cociente,
 * Teorema del Resto P(r) = R, y control deslizable accesible por teclado (attachSvgDrag).
 */

import {
  s,
  clear,
  createStore,
  createBoard,
  createPredictBox,
  createCartesianMapper,
  attachSvgDrag,
  addChips,
  addRange,
  renderReadout,
  playClick,
} from '../../../core/board-kit.js';
import {
  polyFromDescending,
  ruffini,
  formatPoly,
  ratToString,
  isOneRat,
  rat,
} from '../logic.js';

const RUFFINI_PRESETS = [
  {
    id: 'monic_ex',
    label: '(2x³ + 5x² − x − 5) : (x − 2)',
    P: polyFromDescending([2, 5, -1, -5]),
    a: 1,
    b: 2,
  },
  {
    id: 'incomplete',
    label: 'Incompleto: (2x⁴ − 2) : (x − 1)',
    P: polyFromDescending([2, 0, 0, 0, -2]),
    a: 1,
    b: 1,
  },
  {
    id: 'neg_root',
    label: 'Signo opuesto: (x³ − 5x + 8) : (x + 3)',
    P: polyFromDescending([1, 0, -5, 8]),
    a: 1,
    b: -3,
  },
  {
    id: 'nonmonic',
    label: 'No mónico: (3x³ + 2x² + 3x − 2) : (3x + 1)',
    P: polyFromDescending([3, 2, 3, -2]),
    a: 3,
    b: -1,
  },
];

export function initLaboratorioRuffini(host) {
  if (!host) return null;
  clear(host);

  const store = createStore({
    presetId: 'monic_ex',
    rootNum: 2,
    divisorA: 1,
  });

  const predictBox = createPredictBox({
    classPrefix: 'poly',
    prompt: 'Sin armar la tabla, ¿cuánto vale el resto de dividir P(x) = 2x³ + 5x² − x − 5 por (x − 2)?',
    options: [
      {
        label: 'P(−2) = −16 + 20 + 2 − 5 = 1',
        correct: false,
        explanation:
          'Para dividir por (x − 2) la raíz del divisor es +2 (no −2). Al evaluar P(2) obtenemos 2·8 + 5·4 − 2 − 5 = 29.',
      },
      {
        label: 'P(2) = 29',
        correct: true,
        explanation:
          '¡Exacto! Por el Teorema del Resto, el resto de dividir P(x) por (x − 2) coincide con P(2) = 16 + 20 − 2 − 5 = 29.',
      },
      {
        label: 'El resto es −5 (el término independiente)',
        correct: false,
        explanation:
          'El término independiente es P(0), es decir el resto al dividir por x. Para (x − 2) necesitás evaluar P(2) = 29.',
      },
    ],
    onVerify: () => {
      store.set({ presetId: 'monic_ex', rootNum: 2, divisorA: 1 });
    },
  });

  const board = createBoard(host, 'Laboratorio de Ruffini y Teorema del Resto', '0 0 640 295', {
    prefix: 'poly',
  });
  host.prepend(predictBox);

  const updateChips = addChips(
    board.controls,
    RUFFINI_PRESETS.map((p) => [p.id, p.label]),
    store.get().presetId,
    (presetId) => {
      playClick();
      predictBox.notifyInteraction();
      const p = RUFFINI_PRESETS.find((x) => x.id === presetId) || RUFFINI_PRESETS[0];
      const r = p.b / p.a;
      rootSlider.input.value = String(r);
      rootSlider.output.textContent = ratToString(rat(p.b, p.a));
      store.set({ presetId, rootNum: r, divisorA: p.a });
    },
    'Casos de Ruffini'
  );

  const rootSlider = addRange(
    board.controls,
    store,
    'rootNum',
    'Raíz r = b/a del divisor (ax − b)',
    -4,
    4,
    2,
    0.5,
    (v) => String(v).replace('.', ',')
  );
  rootSlider.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
  });

  // Persistent SVG scene + interactive root slider track at bottom
  const gridLayer = s('g', { class: 'poly-ruffini-grid' });
  const trackLayer = s('g', { class: 'poly-ruffini-track' });
  board.drawing.append(gridLayer, trackLayer);

  const trackBox = { x: 80, y: 245, w: 480, h: 30 };
  const trackMapper = createCartesianMapper(trackBox, { xMin: -4, xMax: 4, yMin: -1, yMax: 1 });
  const trackLine = s('line', {
    x1: trackBox.x,
    y1: 260,
    x2: trackBox.x + trackBox.w,
    y2: 260,
    stroke: 'rgba(236, 242, 232, 0.35)',
    'stroke-width': 2,
  });
  const handleDot = s('circle', {
    cx: trackMapper.toX(2),
    cy: 260,
    r: 8,
    fill: 'var(--yellow)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
    class: 'poly-drag-handle',
  });
  const handleLabel = s(
    'text',
    { x: 320, y: 242, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 12 },
    'Arrastrá o usá flechas Izquierda/Derecha para variar la raíz r en (x − r)'
  );
  trackLayer.append(trackLine, handleLabel, handleDot);

  attachSvgDrag(
    board.svg,
    handleDot,
    () => trackMapper,
    ({ x }) => {
      predictBox.notifyInteraction();
      const snapped = Math.max(-4, Math.min(4, Math.round(x * 2) / 2));
      rootSlider.input.value = String(snapped);
      rootSlider.output.textContent = String(snapped).replace('.', ',');
      store.set({ rootNum: snapped, divisorA: 1 });
    },
    { ariaLabel: 'Raíz r del divisor de Ruffini', stepX: 0.5, stepY: 0 }
  );

  const render = (st) => {
    updateChips(st.presetId);
    const preset = RUFFINI_PRESETS.find((p) => p.id === st.presetId) || RUFFINI_PRESETS[0];

    let divisorSpec;
    if (st.presetId === 'nonmonic' && Math.abs(st.rootNum - (-1 / 3)) < 0.05) {
      divisorSpec = { a: 3, b: -1 };
    } else if (st.divisorA !== 1 && Math.abs(st.rootNum - preset.b / preset.a) < 0.05) {
      divisorSpec = { a: preset.a, b: preset.b };
    } else {
      const bNum = Math.round(st.rootNum * 2);
      divisorSpec = { a: 2, b: bNum };
      if (bNum % 2 === 0) divisorSpec = { a: 1, b: bNum / 2 };
    }

    const ruf = ruffini(preset.P, divisorSpec);
    const cols = ruf.table.dividendDesc.length;
    const colW = Math.min(92, Math.floor(440 / Math.max(1, cols)));
    const x0 = 135;
    const yTop = 50;

    handleDot.setAttribute('cx', String(trackMapper.toX(Math.max(-4, Math.min(4, ruf.root.n / ruf.root.d)))));
    handleDot.setAttribute('aria-valuenow', String(ruf.root.n / ruf.root.d));

    clear(gridLayer);

    // Table lines
    gridLayer.append(
      s('line', { x1: x0 - 16, y1: yTop - 22, x2: x0 - 16, y2: yTop + 98, stroke: 'var(--ink)', 'stroke-width': 1.5 }),
      s('line', { x1: 42, y1: yTop + 62, x2: x0 + cols * colW + 10, y2: yTop + 62, stroke: 'var(--ink)', 'stroke-width': 1.5 }),
      s('line', { x1: x0 + (cols - 1) * colW - 8, y1: yTop + 62, x2: x0 + (cols - 1) * colW - 8, y2: yTop + 106, stroke: 'var(--green)', 'stroke-width': 1.5 }),
      s('text', { x: x0 - 30, y: yTop + 42, 'text-anchor': 'end', fill: 'var(--yellow)', 'font-size': 16, 'font-weight': 'bold' }, `r = ${ratToString(ruf.root)}`)
    );

    for (let i = 0; i < cols; i++) {
      const cx = x0 + i * colW + colW / 2 - 12;
      const topCoeff = ruf.table.dividendDesc[i];
      const isZeroPlaceholder = topCoeff.n === 0 && i > 0 && i < cols - 1;
      const multVal = ruf.table.multiplies[i];
      const sumVal = ruf.table.sums[i];
      const isRem = i === cols - 1;

      gridLayer.append(
        s(
          'text',
          { x: cx, y: yTop, 'text-anchor': 'middle', fill: isZeroPlaceholder ? 'var(--blue)' : 'var(--ink)', 'font-size': 15, 'font-weight': isZeroPlaceholder ? 'bold' : 'normal' },
          ratToString(topCoeff)
        ),
        multVal
          ? s('text', { x: cx, y: yTop + 42, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 14 }, ratToString(multVal))
          : null,
        s(
          'text',
          { x: cx, y: yTop + 88, 'text-anchor': 'middle', fill: isRem ? 'var(--green)' : 'var(--yellow)', 'font-size': 16, 'font-weight': 'bold' },
          ratToString(sumVal)
        )
      );
    }

    const rescaleBanner = !isOneRat(ruf.divisorA)
      ? `Divisor no mónico (${ratToString(ruf.divisorA)}x − (${ratToString(ruf.divisorB)})): cociente reescalado C(x) = C₀(x) / ${ratToString(ruf.divisorA)}`
      : `Teorema del Resto: P(${ratToString(ruf.root)}) = ${ratToString(ruf.remainder)}${ruf.divisible ? ' -> ¡Es raíz y divisor exacto!' : ''}`;

    gridLayer.append(
      s('text', { x: 320, y: 196, 'text-anchor': 'middle', fill: !isOneRat(ruf.divisorA) ? 'var(--pink)' : 'var(--green)', 'font-size': 13.5, 'font-weight': 'bold' }, rescaleBanner)
    );

    renderReadout(board.readout, 'Resultado por Ruffini', [
      ['Divisor', formatPoly(ruf.divisorPoly)],
      ['Cociente C(x)', formatPoly(ruf.quotient)],
      ['Resto R', `${ratToString(ruf.remainder)} (= P(${ratToString(ruf.root)}))`],
    ]);
  };

  store.subscribe(render);
  render(store.get());

  return { store };
}
