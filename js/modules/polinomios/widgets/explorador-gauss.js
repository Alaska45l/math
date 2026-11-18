/**
 * @file js/modules/polinomios/widgets/explorador-gauss.js
 * Widget 6 (Sec 6): Matriz interactiva p | a₀ vs q | a_n de Gauss, evaluación en vivo P(p/q)
 * y deflación encadenada por Ruffini hasta grado <= 2.
 */

import {
  h,
  clear,
  createStore,
  createPredictBox,
  addChips,
  button,
  renderReadout,
  playClick,
  playSuccess,
} from '../../../core/board-kit.js';
import {
  polyFromDescending,
  gaussCandidates,
  evalPoly,
  ruffini,
  factorPolynomial,
  formatPoly,
  ratToString,
  ratEq,
} from '../logic.js';

const GAUSS_PRESETS = [
  {
    id: 'ex19',
    label: 'P(x) = 2x⁴ − x³ − 15x² + 7x + 7',
    poly: polyFromDescending([2, -1, -15, 7, 7]),
  },
  {
    id: 'parcial2025',
    label: 'Con x=0 primero: 3x⁴ − x³ − 6x² + 2x',
    poly: polyFromDescending([3, -1, -6, 2, 0]),
  },
  {
    id: 'ex20b',
    label: 'P(x) = −2x³ − 6x² + 10x + 30',
    poly: polyFromDescending([-2, -6, 10, 30]),
  },
  {
    id: 'ex20d',
    label: 'P(x) = x⁴ − 27x',
    poly: polyFromDescending([1, 0, 0, -27, 0]),
  },
];

export function initExploradorGauss(host) {
  if (!host) return null;
  clear(host);

  const store = createStore({
    presetId: 'ex19',
    testedKeys: [],
    foundRoots: [],
    deflatedPoly: GAUSS_PRESETS[0].poly,
  });

  const predictBox = createPredictBox({
    classPrefix: 'poly',
    prompt: 'En P(x) = 2x⁴ − x³ − 15x² + 7x + 7, ¿qué candidatos racionales permite el Teorema de Gauss?',
    options: [
      {
        label: '±1, ±2, ±1/7, ±2/7 (divisores de 2 sobre divisores de 7)',
        correct: false,
        explanation:
          '¡Cuidado, invertiste p y q! En p/q siempre va p divisor de a₀ (7) arriba y q divisor de a_n (2) abajo.',
      },
      {
        label: '±1, ±7, ±1/2, ±7/2 (divisores de 7 sobre divisores de 2)',
        correct: true,
        explanation:
          '¡Correcto! p ∈ {1, 7} y q ∈ {1, 2}, generando los 8 candidatos ±1, ±7, ±1/2 y ±7/2.',
      },
      {
        label: 'Solo enteros ±1 y ±7',
        correct: false,
        explanation:
          'Como a₄ = 2 ≠ 1, aparecen denominadores q = 2, por eso existen candidatos fraccionarios como −1/2 (que de hecho es raíz!).',
      },
    ],
    onVerify: () => {
      store.set({
        presetId: 'ex19',
        testedKeys: [],
        foundRoots: [],
        deflatedPoly: GAUSS_PRESETS[0].poly,
      });
    },
  });

  host.classList.add('poly-widget', 'pr-widget');
  const controls = h('div', { class: 'poly-widget__controls pr-widget__controls' });
  const matrixHost = h('div', { class: 'poly-gauss-matrix' });
  const chainHost = h('div', { class: 'poly-gauss-chain' });
  const readout = h('div', { class: 'poly-readout pr-readout', 'aria-live': 'polite' });
  const actions = h('div', { class: 'poly-widget__actions pr-widget__actions' });

  host.append(predictBox, controls, matrixHost, chainHost, readout, actions);

  const updateChips = addChips(
    controls,
    GAUSS_PRESETS.map((p) => [p.id, p.label]),
    store.get().presetId,
    (presetId) => {
      playClick();
      predictBox.notifyInteraction();
      const found = GAUSS_PRESETS.find((p) => p.id === presetId) || GAUSS_PRESETS[0];
      store.set({
        presetId,
        testedKeys: [],
        foundRoots: [],
        deflatedPoly: found.poly,
      });
    },
    'Polinomios para explorar con Gauss'
  );

  const resetBtn = button('', 'reset', () => {
    playClick();
    const found = GAUSS_PRESETS.find((p) => p.id === store.get().presetId) || GAUSS_PRESETS[0];
    store.set({ testedKeys: [], foundRoots: [], deflatedPoly: found.poly });
  }, 'chip', { 'aria-label': 'Reiniciar candidatos probados' });
  actions.append(resetBtn);

  const render = (st) => {
    updateChips(st.presetId);
    const preset = GAUSS_PRESETS.find((p) => p.id === st.presetId) || GAUSS_PRESETS[0];
    const gc = gaussCandidates(preset.poly);

    clear(matrixHost);
    const headerNote = h(
      'p',
      { class: 'poly-gauss-note' },
      gc.zeroIsRoot
        ? `Primero factorizamos x^${gc.xPower} porque a₀ = 0 (raíz x = 0). Sobre el núcleo restante: p | a₀ y q | a_n.`
        : `Divisores p de a₀: {${gc.pDivisors.join('; ')}} · Divisores q de a_n: {${gc.qDivisors.join('; ')}}`
    );
    matrixHost.append(headerNote);

    const candRow = h('div', { class: 'pr-chip-row poly-gauss-candidates' });
    gc.candidates.forEach((cand) => {
      const key = `${cand.n}/${cand.d}`;
      const tested = st.testedKeys.includes(key);
      const val = evalPoly(preset.poly, cand);
      const isRoot = val.n === 0;

      let cls = 'chip chip--ghost';
      if (tested) {
        cls = isRoot ? 'chip is-active poly-cand-root' : 'chip poly-cand-miss';
      }

      const btn = h(
        'button',
        {
          type: 'button',
          class: cls,
          on: {
            click: () => {
              predictBox.notifyInteraction();
              const nextTested = tested ? st.testedKeys : [...st.testedKeys, key];
              let nextDeflated = st.deflatedPoly;
              let nextRoots = [...st.foundRoots];
              if (isRoot) {
                playSuccess();
                if (!nextRoots.some((r) => ratEq(r, cand))) nextRoots.push(cand);
                if (evalPoly(nextDeflated, cand).n === 0 && nextDeflated.length > 1) {
                  nextDeflated = ruffini(nextDeflated, cand).quotient;
                }
              } else {
                playClick();
              }
              store.set({
                testedKeys: nextTested,
                foundRoots: nextRoots,
                deflatedPoly: nextDeflated,
              });
            },
          },
        },
        tested ? `${ratToString(cand)} ⇒ P=${ratToString(val)}` : ratToString(cand)
      );
      candRow.append(btn);
    });
    matrixHost.append(candRow);

    clear(chainHost);
    const fac = factorPolynomial(preset.poly);
    chainHost.append(
      h('p', { class: 'small muted' }, [
        h('strong', {}, 'Cociente reducido actual: '),
        formatPoly(st.deflatedPoly),
      ])
    );

    renderReadout(readout, 'Exploración de Gauss y Ruffini', [
      ['Candidatos ±p/q', gc.candidatesFormatted.join('; ') || 'Ninguno'],
      ['Raíces encontradas', st.foundRoots.length ? st.foundRoots.map((r) => ratToString(r)).join('; ') : 'Tocá un candidato para evaluar P(p/q)'],
      ['Factorización total', fac.formatted],
    ]);
  };

  store.subscribe(render);
  render(store.get());

  return { store };
}
