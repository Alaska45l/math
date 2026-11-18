/**
 * @file js/modules/polinomios/widgets/division-polinomica.js
 * Widget 3 (Sec 3): Algoritmo de división euclídea paso a paso P(x) = Q(x)·C(x) + R(x).
 */

import {
  s,
  clear,
  createStore,
  createBoard,
  createPredictBox,
  addChips,
  button,
  renderReadout,
  playClick,
} from '../../../core/board-kit.js';
import {
  polyFromDescending,
  polyDiv,
  polyDegree,
  formatPoly,
  ratToString,
} from '../logic.js';

const DIVISION_PRESETS = [
  {
    id: 'ex9a',
    label: '(x⁴ − 3x³ + 2x − 1) : (−x² − x + 2)',
    P: polyFromDescending([1, -3, 0, 2, -1]),
    Q: polyFromDescending([-1, -1, 2]),
  },
  {
    id: 'exact',
    label: 'Divisible: (x³ − 1) : (x − 1)',
    P: polyFromDescending([1, 0, 0, -1]),
    Q: polyFromDescending([1, -1]),
  },
  {
    id: 'quad',
    label: '(2x⁴ + x² − 3x + 4) : (x² + 1)',
    P: polyFromDescending([2, 0, 1, -3, 4]),
    Q: polyFromDescending([1, 0, 1]),
  },
];

function formatDescArray(descArr) {
  return formatPoly(polyFromDescending(descArr));
}

export function initDivisionPolinomica(host) {
  if (!host) return null;
  clear(host);

  const store = createStore({
    presetId: 'ex9a',
    stepCount: 1,
  });

  const predictBox = createPredictBox({
    classPrefix: 'poly',
    prompt: 'Al dividir P(x) de grado 4 por Q(x) de grado 2, ¿en qué momento se detiene la división?',
    options: [
      {
        label: 'Apenas el resto tiene grado 2 igual que Q(x)',
        correct: false,
        explanation:
          'Si el resto todavía tiene grado 2, aún se puede dividir una vez más por el término x² de Q(x).',
      },
      {
        label: 'Cuando el resto es 0 o tiene grado estrictamente menor que 2',
        correct: true,
        explanation:
          '¡Correcto! La condición del algoritmo exige R(x) = 0 o gr(R) < gr(Q). Al dividir por grado 2, el resto solo puede ser de grado 1, grado 0 o nulo.',
      },
      {
        label: 'Únicamente cuando el resto da cero',
        correct: false,
        explanation:
          'Cuando el resto da 0 la división es exacta, pero la mayoría de las divisiones dejan un resto no nulo con gr(R) < gr(Q).',
      },
    ],
    onVerify: () => {
      const div = polyDiv(DIVISION_PRESETS[0].P, DIVISION_PRESETS[0].Q);
      store.set({ presetId: 'ex9a', stepCount: div.steps.length });
    },
  });

  const board = createBoard(host, 'División euclídea paso a paso', '0 0 640 280', {
    prefix: 'poly',
  });
  host.prepend(predictBox);

  const updateChips = addChips(
    board.controls,
    DIVISION_PRESETS.map((p) => [p.id, p.label]),
    store.get().presetId,
    (presetId) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ presetId, stepCount: 1 });
    },
    'Divisiones para explorar'
  );

  const prevBtn = button('Paso anterior', null, () => {
    playClick();
    predictBox.notifyInteraction();
    store.set((st) => ({ stepCount: Math.max(0, st.stepCount - 1) }));
  }, 'chip');
  const nextBtn = button('Siguiente paso', null, () => {
    playClick();
    predictBox.notifyInteraction();
    const preset = DIVISION_PRESETS.find((p) => p.id === store.get().presetId) || DIVISION_PRESETS[0];
    const maxSteps = polyDiv(preset.P, preset.Q).steps.length;
    store.set((st) => ({ stepCount: Math.min(maxSteps, st.stepCount + 1) }));
  }, 'pr-btn');
  const resetBtn = button('', 'reset', () => {
    playClick();
    store.set({ stepCount: 0 });
  }, 'chip', { 'aria-label': 'Reiniciar pasos' });

  board.actions.append(prevBtn, nextBtn, resetBtn);

  const sceneGroup = s('g', { class: 'poly-div-scene' });
  board.drawing.append(sceneGroup);

  const render = (st) => {
    updateChips(st.presetId);
    clear(sceneGroup);

    const preset = DIVISION_PRESETS.find((p) => p.id === st.presetId) || DIVISION_PRESETS[0];
    const result = polyDiv(preset.P, preset.Q);
    const maxSteps = result.steps.length;
    const shown = Math.max(0, Math.min(maxSteps, st.stepCount));

    prevBtn.disabled = shown <= 0;
    nextBtn.disabled = shown >= maxSteps;

    // Bracket layout: left = dividend & steps, right = divisor & quotient
    sceneGroup.append(
      s('line', { x1: 390, y1: 24, x2: 390, y2: 245, stroke: 'var(--ink)', 'stroke-width': 1.5 }),
      s('line', { x1: 390, y1: 62, x2: 620, y2: 62, stroke: 'var(--ink)', 'stroke-width': 1.5 }),
      s('text', { x: 24, y: 48, fill: 'var(--ink)', 'font-size': 15, 'font-weight': 'bold' }, `P(x) = ${formatPoly(preset.P)}`),
      s('text', { x: 404, y: 48, fill: 'var(--blue)', 'font-size': 15, 'font-weight': 'bold' }, `Q(x) = ${formatPoly(preset.Q)}`)
    );

    const visibleSteps = result.steps.slice(0, shown);
    const partialTerms = [];
    visibleSteps.forEach((step) => {
      const cStr = ratToString(step.termCoeff);
      const vStr = step.termDeg === 0 ? '' : step.termDeg === 1 ? 'x' : `x^${step.termDeg}`;
      partialTerms.push(`${cStr}${vStr}`);
    });

    sceneGroup.append(
      s(
        'text',
        { x: 404, y: 90, fill: 'var(--yellow)', 'font-size': 15, 'font-weight': 'bold' },
        shown === maxSteps
          ? `C(x) = ${formatPoly(result.quotient)}`
          : partialTerms.length
            ? `C_parcial: ${partialTerms.join(' + ')}`
            : 'C(x) = ...'
      )
    );

    visibleSteps.forEach((step, idx) => {
      const baseY = 82 + idx * 54;
      const subPoly = polyFromDescending(step.subtrahendDesc);
      const remPoly = polyFromDescending(step.nextRemainderDesc);
      sceneGroup.append(
        s(
          'text',
          { x: 34, y: baseY, fill: 'var(--pink)', 'font-size': 13.5 },
          `− (${formatPoly(subPoly)})`
        ),
        s('line', { x1: 28, y1: baseY + 8, x2: 374, y2: baseY + 8, stroke: 'rgba(236,242,232,0.35)', 'stroke-width': 1 }),
        s(
          'text',
          { x: 34, y: baseY + 28, fill: idx === maxSteps - 1 ? 'var(--green)' : 'var(--ink)', 'font-size': 14, 'font-weight': idx === maxSteps - 1 ? 'bold' : 'normal' },
          idx === maxSteps - 1 ? `Resto R(x) = ${formatPoly(remPoly)}` : formatDescArray(step.nextRemainderDesc)
        )
      );
    });

    const degR = polyDegree(result.remainder);
    const degQ = polyDegree(preset.Q);
    renderReadout(board.readout, `Paso ${shown} de ${maxSteps}`, [
      ['Cociente C(x)', shown === maxSteps ? formatPoly(result.quotient) : 'En construcción...'],
      ['Resto R(x)', shown === maxSteps ? formatPoly(result.remainder) : 'En construcción...'],
      ['Divisibilidad', shown === maxSteps ? (result.divisible ? 'R(x) = 0 -> ¡Divisible!' : `gr(R)=${degR} < gr(Q)=${degQ}`) : 'Pulsá Siguiente paso'],
    ]);
  };

  store.subscribe(render);
  render(store.get());

  return { store };
}
